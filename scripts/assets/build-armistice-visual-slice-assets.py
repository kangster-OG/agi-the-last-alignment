#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[2]
PIXELLAB = ROOT / "assets" / "concepts" / "pixellab_refs" / "m50_m51_replacement"


def open_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def alpha_crop(image: Image.Image) -> Image.Image:
    bbox = image.getbbox()
    return image.crop(bbox) if bbox else image


def fit_subject(image: Image.Image, size: tuple[int, int], max_w: int, max_h: int, anchor_y: float = 0.86) -> Image.Image:
    subject = alpha_crop(image)
    subject.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - subject.width) // 2
    y = int(size[1] * anchor_y - subject.height)
    canvas.alpha_composite(subject, (x, y))
    return canvas


def hard_outline(image: Image.Image, color: tuple[int, int, int] = (8, 12, 18), width: int = 2, alpha: int = 255) -> Image.Image:
    mask = image.getchannel("A")
    expanded = mask
    for _ in range(width):
        expanded = expanded.filter(ImageFilter.MaxFilter(3))
    outline_mask = ImageChops.subtract(expanded, mask)
    outline = Image.new("RGBA", image.size, color + (alpha,))
    outline.putalpha(outline_mask.point(lambda a: min(alpha, a)))
    return Image.alpha_composite(outline, image)


def sprite_outline(image: Image.Image, color: tuple[int, int, int] = (7, 9, 15), width: int = 1) -> Image.Image:
    mask = image.getchannel("A")
    expanded = mask
    for _ in range(width):
        expanded = expanded.filter(ImageFilter.MaxFilter(3))
    edge = ImageOps.invert(ImageOps.invert(expanded))
    edge = edge.point(lambda a: 255 if a > 0 else 0)
    original = mask.point(lambda a: 255 if a > 0 else 0)
    edge = Image.eval(edge, lambda a: a)
    outline = Image.new("RGBA", image.size, color + (0,))
    outline.putalpha(ImageChops.subtract(edge, original))
    return Image.alpha_composite(outline, image)


def tint(image: Image.Image, color: tuple[int, int, int], strength: float) -> Image.Image:
    overlay = Image.new("RGBA", image.size, color + (0,))
    alpha = image.getchannel("A")
    overlay.putalpha(alpha.point(lambda a: int(a * strength)))
    return Image.alpha_composite(image, overlay)


def diamond_mask(size: tuple[int, int]) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon([(w // 2, 0), (w - 1, h // 2), (w // 2, h - 1), (0, h // 2)], fill=255)
    return mask


def tile_from_source(source: Image.Image, fill: tuple[int, int, int], accent: tuple[int, int, int], crack: tuple[int, int, int], mode: str, seed: int) -> Image.Image:
    tile = Image.new("RGBA", (64, 32), (0, 0, 0, 0))
    mask = diamond_mask((64, 32))
    base = Image.new("RGBA", (64, 32), fill + (255,))
    detail = alpha_crop(source).resize((64, 64), Image.Resampling.LANCZOS).crop((0, 16, 64, 48))
    detail = ImageEnhance.Contrast(detail).enhance(0.95)
    detail = ImageEnhance.Color(detail).enhance(0.58)
    base = Image.blend(base, tint(detail, fill, 0.45), 0.22)
    base.putalpha(mask)
    tile.alpha_composite(base)
    draw = ImageDraw.Draw(tile)
    draw.line([(32, 1), (63, 16), (32, 31), (0, 16), (32, 1)], fill=(15, 24, 31, 28), width=1)
    for i in range(2):
        x = 10 + ((seed * 17 + i * 13) % 42)
        y = 7 + ((seed * 11 + i * 7) % 18)
        draw.line([(x - 5, y), (x - 1, y + 1), (x + 4, y - 1)], fill=crack + (82,), width=1)
    if mode == "road":
        draw.line([(6, 17), (32, 7), (58, 16)], fill=accent + (170,), width=3)
        draw.line([(9, 19), (32, 10), (55, 18)], fill=(20, 26, 31, 120), width=1)
    elif mode == "breach_light":
        draw.line([(11, 17), (28, 12), (44, 18), (57, 14)], fill=accent + (150,), width=2)
    elif mode == "breach_medium":
        draw.polygon([(30, 6), (43, 15), (33, 25), (20, 17)], fill=accent + (90,))
        draw.line([(8, 19), (25, 13), (40, 20), (56, 12)], fill=accent + (180,), width=2)
    elif mode == "breach_heavy":
        draw.polygon([(18, 16), (31, 5), (49, 15), (36, 28)], fill=(52, 23, 74, 210))
        draw.line([(7, 18), (27, 11), (42, 22), (59, 10)], fill=accent + (210,), width=3)
    elif mode == "breach":
        draw.polygon([(10, 16), (31, 2), (56, 16), (33, 30)], fill=(31, 14, 42, 235))
        draw.line([(7, 18), (21, 9), (34, 20), (49, 8), (59, 15)], fill=accent + (235,), width=3)
    elif mode == "terminal":
        draw.polygon([(32, 5), (51, 16), (32, 27), (13, 16)], outline=accent + (210,))
        draw.rectangle((26, 12, 38, 20), fill=accent + (160,))
        draw.point([(18, 16), (46, 16), (32, 8), (32, 24)], fill=(255, 209, 102, 210))
    return tile


def shadow(size: tuple[int, int], bbox: tuple[int, int, int, int], alpha: int = 88) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse(bbox, fill=(0, 0, 0, alpha))
    return layer.filter(ImageFilter.GaussianBlur(1.2))


def build_ground_atlas() -> None:
    sources = [open_rgba(PIXELLAB / "m50_unknown_isometric_b_raw" / f"frame_{i}.png") for i in range(8)]
    specs = [
        ((144, 150, 154), (255, 244, 214), (52, 58, 66), "stone"),
        ((119, 126, 131), (210, 208, 187), (42, 47, 55), "stone"),
        ((130, 119, 100), (255, 209, 102), (34, 39, 45), "road"),
        ((91, 79, 118), (123, 97, 255), (35, 27, 46), "breach_light"),
        ((73, 48, 94), (123, 97, 255), (26, 20, 35), "breach_medium"),
        ((48, 29, 66), (255, 93, 87), (20, 16, 29), "breach_heavy"),
        ((30, 17, 42), (123, 97, 255), (12, 10, 20), "breach"),
        ((41, 111, 115), (100, 224, 180), (18, 45, 51), "terminal"),
    ]
    atlas = Image.new("RGBA", (256, 64), (0, 0, 0, 0))
    for i, spec in enumerate(specs):
        tile = tile_from_source(sources[i], *spec, seed=i + 3)
        atlas.alpha_composite(tile, ((i % 4) * 64, (i // 4) * 32))
    atlas.save(ROOT / "assets" / "tiles" / "armistice_plaza" / "ground_atlas.png")


def transition_frame(base: tuple[int, int, int], terrain: tuple[int, int, int], accent: tuple[int, int, int], mode: str, seed: int) -> Image.Image:
    size = (96, 48)
    frame = Image.new("RGBA", size, (0, 0, 0, 0))
    mask = diamond_mask(size)
    base_layer = Image.new("RGBA", size, base + (235,))
    base_layer.putalpha(mask.point(lambda a: int(a * 0.88)))
    frame.alpha_composite(base_layer)
    draw = ImageDraw.Draw(frame)
    jitter = [((seed * 17 + i * 11) % 9) - 4 for i in range(8)]
    if mode == "terminal_north":
        pts = [(48, 2), (94, 24), (72, 31 + jitter[0]), (48, 25 + jitter[1]), (25, 31 + jitter[2]), (1, 24)]
    elif mode == "terminal_south":
        pts = [(1, 24), (24, 17 + jitter[0]), (48, 22 + jitter[1]), (72, 17 + jitter[2]), (94, 24), (48, 46)]
    elif mode == "breach_west":
        pts = [(1, 24), (48, 2), (41 + jitter[0], 16), (32 + jitter[1], 24), (42 + jitter[2], 34), (48, 46)]
    elif mode == "breach_east":
        pts = [(48, 2), (94, 24), (48, 46), (56 + jitter[0], 33), (64 + jitter[1], 24), (55 + jitter[2], 15)]
    elif mode == "road_edge":
        pts = [(3, 25), (48, 7), (92, 24), (78, 31), (48, 19), (18, 31)]
    elif mode == "rubble_edge":
        pts = [(6, 24), (35, 12), (54, 15), (88, 24), (58, 36), (34, 34)]
    elif mode == "cable_edge":
        pts = [(0, 25), (48, 12), (96, 24), (95, 29), (48, 18), (0, 31)]
    else:
        pts = [(2, 24), (48, 5), (94, 24), (48, 43)]
    draw.polygon(pts, fill=terrain + (168,))
    draw.line(pts + [pts[0]], fill=accent + (210,), width=2)
    for i in range(6):
        x = 14 + ((seed * 23 + i * 13) % 68)
        y = 15 + ((seed * 19 + i * 7) % 19)
        draw.line([(x - 5, y), (x + 2, y + ((i % 3) - 1)), (x + 8, y - 1)], fill=(12, 18, 24, 96), width=1)
    return frame


def build_transition_atlas() -> None:
    specs = [
        ((105, 113, 115), (28, 88, 92), (100, 224, 180), "terminal_north"),
        ((105, 113, 115), (28, 88, 92), (100, 224, 180), "terminal_south"),
        ((86, 91, 94), (43, 20, 60), (123, 97, 255), "breach_west"),
        ((86, 91, 94), (43, 20, 60), (255, 93, 87), "breach_east"),
        ((104, 108, 106), (108, 94, 78), (255, 209, 102), "road_edge"),
        ((86, 92, 94), (67, 57, 52), (255, 93, 87), "rubble_edge"),
        ((72, 82, 84), (15, 22, 31), (69, 170, 242), "cable_edge"),
        ((78, 88, 90), (93, 72, 44), (255, 244, 214), "plaza_wear"),
    ]
    atlas = Image.new("RGBA", (384, 96), (0, 0, 0, 0))
    for i, spec in enumerate(specs):
        atlas.alpha_composite(transition_frame(*spec, seed=i + 11), ((i % 4) * 96, (i // 4) * 48))
    atlas.save(ROOT / "assets" / "tiles" / "armistice_plaza" / "transition_atlas.png")


def build_treaty_monument() -> None:
    src = open_rgba(PIXELLAB / "m50_unknown_isometric_a_raw" / "frame_0.png")
    core = hard_outline(fit_subject(src, (192, 176), 124, 112, 0.9), width=2)
    canvas = Image.new("RGBA", (192, 176), (0, 0, 0, 0))
    canvas.alpha_composite(shadow((192, 176), (24, 131, 168, 170), 116))
    draw = ImageDraw.Draw(canvas)
    draw.polygon([(96, 108), (162, 137), (96, 170), (28, 137)], fill=(61, 70, 74, 255), outline=(8, 12, 18, 255))
    draw.polygon([(96, 116), (148, 137), (96, 162), (43, 137)], fill=(100, 224, 180, 225), outline=(10, 26, 29, 180))
    draw.ellipse((54, 100, 138, 150), outline=(255, 244, 214, 150), width=3)
    canvas.alpha_composite(core)
    draw.rectangle((78, 42, 114, 108), fill=(214, 208, 187, 248), outline=(8, 12, 18, 255), width=2)
    draw.rectangle((68, 29, 124, 46), fill=(255, 93, 87, 248), outline=(8, 12, 18, 255), width=2)
    draw.rectangle((86, 61, 106, 91), fill=(69, 170, 242, 248), outline=(8, 12, 18, 255), width=2)
    draw.line([(45, 116), (76, 101), (107, 112), (145, 92)], fill=(255, 209, 102, 230), width=4)
    draw.line([(92, 43), (82, 94), (105, 119)], fill=(20, 24, 31, 210), width=3)
    canvas.save(ROOT / "assets" / "props" / "armistice_plaza" / "treaty_monument.png")


def build_prop(name: str, frame: int, out_name: str, size: tuple[int, int], max_w: int, max_h: int, tint_color: tuple[int, int, int], accents: str) -> None:
    src = open_rgba(PIXELLAB / "m50_unknown_isometric_a_raw" / f"frame_{frame}.png")
    subject = hard_outline(tint(fit_subject(src, size, max_w, max_h, 0.9), tint_color, 0.2), width=2)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(shadow(size, (8, int(size[1] * 0.72), size[0] - 7, size[1] - 4), 104))
    canvas.alpha_composite(subject)
    draw = ImageDraw.Draw(canvas)
    if accents == "barricade":
        draw.polygon([(18, 74), (91, 44), (151, 67), (80, 102)], fill=(63, 50, 45, 232), outline=(8, 12, 18, 255))
        for x, y in ((24, 70), (58, 57), (94, 62), (128, 73)):
            draw.rectangle((x, y, x + 38, y + 14), fill=(255, 93, 87, 238), outline=(8, 12, 18, 255), width=2)
            draw.rectangle((x + 8, y + 15, x + 44, y + 24), fill=(255, 209, 102, 222), outline=(8, 12, 18, 255))
    elif accents == "drone":
        draw.line([(24, 70), (76, 46), (138, 72)], fill=(69, 170, 242, 220), width=5)
        draw.rectangle((69, 38, 101, 59), fill=(69, 170, 242, 238), outline=(8, 12, 18, 255), width=2)
        draw.line([(31, 47), (141, 88)], fill=(8, 12, 18, 230), width=5)
        draw.ellipse((24, 80, 60, 100), fill=(27, 37, 44, 230), outline=(8, 12, 18, 255), width=2)
        draw.ellipse((116, 76, 154, 98), fill=(27, 37, 44, 230), outline=(8, 12, 18, 255), width=2)
    elif accents == "terminal":
        draw.polygon([(48, 101), (92, 83), (141, 106), (95, 132)], fill=(22, 76, 82, 235), outline=(8, 12, 18, 255))
        for x, y in ((54, 64), (86, 49), (118, 67)):
            draw.rectangle((x, y, x + 31, y + 43), fill=(31, 74, 80, 236), outline=(8, 12, 18, 255), width=2)
            draw.rectangle((x + 6, y + 9, x + 25, y + 27), fill=(100, 224, 180, 242), outline=(8, 12, 18, 255))
        draw.line([(96, 47), (96, 16)], fill=(255, 209, 102, 245), width=4)
        draw.ellipse((89, 7, 103, 21), fill=(255, 209, 102, 245), outline=(8, 12, 18, 255))
    elif accents == "breach":
        draw.polygon([(26, 66), (76, 38), (126, 72), (173, 49), (203, 64), (118, 104)], fill=(32, 14, 48, 230), outline=(8, 12, 18, 255))
        draw.line([(18, 78), (48, 61), (78, 77), (112, 46), (154, 76), (206, 56)], fill=(123, 97, 255, 248), width=6)
        draw.line([(64, 79), (79, 106), (96, 66)], fill=(255, 93, 87, 224), width=4)
        draw.line([(135, 72), (151, 96), (169, 61)], fill=(100, 224, 180, 210), width=3)
    canvas.save(ROOT / "assets" / "props" / "armistice_plaza" / out_name)


def build_props() -> None:
    build_treaty_monument()
    build_prop("barricade", 3, "barricade_corridor_set.png", (176, 112), 140, 86, (255, 93, 87), "barricade")
    build_prop("drone", 1, "crashed_drone_yard_wreck.png", (176, 112), 144, 86, (69, 170, 242), "drone")
    build_prop("terminal", 2, "emergency_alignment_terminal.png", (192, 144), 142, 112, (100, 224, 180), "terminal")
    build_prop("breach", 15, "cosmic_breach_crack.png", (224, 120), 190, 92, (123, 97, 255), "breach")


def enhance_runtime_sheet(source_path: Path, target_path: Path, frame_w: int, frame_h: int, contrast: float, color: float, outline_width: int = 1) -> None:
    image = open_rgba(source_path)
    out = Image.new("RGBA", image.size, (0, 0, 0, 0))
    for y in range(0, image.height, frame_h):
        for x in range(0, image.width, frame_w):
            frame = image.crop((x, y, x + frame_w, y + frame_h))
            alpha = frame.getchannel("A")
            rgb = ImageEnhance.Contrast(frame.convert("RGB")).enhance(contrast)
            rgb = ImageEnhance.Color(rgb).enhance(color)
            rgb = ImageEnhance.Sharpness(rgb).enhance(1.45)
            boosted = Image.merge("RGBA", (*rgb.split(), alpha))
            boosted = sprite_outline(boosted, width=outline_width)
            out.alpha_composite(boosted, (x, y))
    out.save(target_path)


def build_title_backdrop() -> None:
    size = (1280, 720)
    image = Image.new("RGBA", size, (11, 15, 23, 255))
    draw = ImageDraw.Draw(image)
    for i, color in enumerate([(17, 28, 39), (23, 42, 53), (38, 62, 68), (56, 74, 72)]):
        y = 80 + i * 66
        draw.polygon([(0, y + 80), (260 + i * 50, y - 22), (620 + i * 90, y + 18), (1280, y - 62), (1280, 720), (0, 720)], fill=color + (255,))
    for x in range(-140, 1380, 84):
        draw.line([(x, 592), (x + 442, 376)], fill=(88, 91, 84, 170), width=3)
    for y in range(416, 700, 42):
        draw.line([(0, y), (1280, y - 192)], fill=(54, 61, 61, 150), width=2)
    draw.polygon([(0, 564), (480, 340), (1280, 486), (1280, 720), (0, 720)], fill=(83, 90, 88, 245), outline=(15, 23, 31, 220))
    draw.polygon([(95, 606), (438, 443), (842, 517), (486, 704)], fill=(94, 86, 72, 220), outline=(255, 209, 102, 120))
    draw.polygon([(800, 454), (1115, 390), (1280, 423), (1280, 650), (1008, 578)], fill=(54, 33, 45, 230), outline=(255, 93, 87, 130))
    draw.polygon([(0, 680), (192, 592), (420, 640), (292, 720), (0, 720)], fill=(24, 67, 72, 230), outline=(100, 224, 180, 120))
    # Distant frontier-lab skyline and treaty spire.
    for x, h, c in [(80, 140, 0x1d2938), (156, 210, 0x223448), (965, 260, 0x1c2636), (1070, 190, 0x27384a), (1160, 300, 0x192231)]:
        draw.rectangle((x, 222 - h * 0.35, x + 54, 430), fill=tuple((c >> shift) & 255 for shift in (16, 8, 0)) + (210,))
    draw.line([(640, 128), (635, 476)], fill=(11, 17, 24, 255), width=8)
    draw.polygon([(640, 112), (682, 475), (600, 475)], outline=(100, 224, 180, 170), fill=(31, 48, 56, 170))
    for offset, color in [(-44, (69, 170, 242, 110)), (42, (255, 209, 102, 100)), (0, (255, 93, 87, 95))]:
        draw.line([(640, 160), (640 + offset * 4, 720)], fill=color, width=2)
    # Foreground silhouettes and actual Armistice set pieces keep the title screen
    # tied to the runtime pixel asset language instead of looking like a flat poster.
    for x, y, w, h in [(130, 626, 190, 56), (900, 610, 180, 48), (1045, 650, 220, 60)]:
        draw.ellipse((x, y, x + w, y + h), fill=(5, 8, 13, 150))
        draw.rectangle((x + 32, y - 30, x + w - 28, y + 14), fill=(21, 27, 34, 235), outline=(5, 8, 13, 255))
    prop_dir = ROOT / "assets" / "props" / "armistice_plaza"
    placements = [
        ("treaty_monument.png", (104, 475), 1.12),
        ("barricade_corridor_set.png", (300, 558), 1.18),
        ("emergency_alignment_terminal.png", (848, 465), 1.05),
        ("cosmic_breach_crack.png", (1010, 510), 1.12),
        ("crashed_drone_yard_wreck.png", (620, 520), 0.98),
    ]
    for filename, pos, scale in placements:
        prop = open_rgba(prop_dir / filename)
        prop = prop.resize((int(prop.width * scale), int(prop.height * scale)), Image.Resampling.NEAREST)
        shadow = Image.new("RGBA", (prop.width + 54, prop.height + 32), (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.ellipse((18, shadow.height - 38, shadow.width - 18, shadow.height - 4), fill=(0, 0, 0, 110))
        image.alpha_composite(shadow, (pos[0] - 20, pos[1] + prop.height - shadow.height + 12))
        image.alpha_composite(prop, pos)
    image = image.filter(ImageFilter.GaussianBlur(0.25))
    image.save(ROOT / "assets" / "ui" / "armistice_title_backdrop.png")


def enhance_player_and_enemies() -> None:
    source_dir = ROOT / "assets" / "concepts" / "visual_fidelity_sources"
    pairs = [
        ("class_roster_m49.png", ROOT / "assets" / "sprites" / "players" / "class_roster_m49.png", 48, 48, 1.28, 1.12),
        ("accord_striker_walk_v2.png", ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png", 48, 48, 1.3, 1.12),
        ("bad_outputs_sheet.png", ROOT / "assets" / "sprites" / "enemies" / "bad_outputs_sheet.png", 32, 32, 1.42, 1.15),
        ("benchmark_gremlins_sheet.png", ROOT / "assets" / "sprites" / "enemies" / "benchmark_gremlins_sheet.png", 32, 32, 1.42, 1.18),
        ("context_rot_crabs_sheet.png", ROOT / "assets" / "sprites" / "enemies" / "context_rot_crabs_sheet.png", 32, 32, 1.38, 1.14),
    ]
    for source_name, target_path, frame_w, frame_h, contrast, color in pairs:
        enhance_runtime_sheet(source_dir / source_name, target_path, frame_w, frame_h, contrast, color, 1)


def main() -> None:
    build_ground_atlas()
    build_transition_atlas()
    build_props()
    build_title_backdrop()
    enhance_player_and_enemies()
    print("Rebuilt Armistice visual slice assets, terrain transitions, title backdrop, and sprite readability polish.")


if __name__ == "__main__":
    main()
