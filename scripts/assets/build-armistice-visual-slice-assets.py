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
    detail = ImageEnhance.Contrast(detail).enhance(0.82)
    detail = ImageEnhance.Color(detail).enhance(0.5)
    base = Image.blend(base, tint(detail, fill, 0.45), 0.14)
    base.putalpha(mask)
    tile.alpha_composite(base)
    draw = ImageDraw.Draw(tile)
    draw.line([(32, 1), (63, 16), (32, 31), (0, 16), (32, 1)], fill=(15, 24, 31, 18), width=1)
    for i in range(11):
        x = 5 + ((seed * 19 + i * 17) % 54)
        y = 5 + ((seed * 13 + i * 11) % 22)
        if i % 4 == 0:
            draw.line([(x - 6, y), (x - 1, y + 2), (x + 5, y - 1)], fill=crack + (48 + (seed + i) % 42,), width=1)
        else:
            dot = accent if i % 5 == 0 else crack
            draw.rectangle((x, y, x + (i % 3), y + 1), fill=dot + (24 + i * 4,))
    if mode.startswith("concrete"):
        for i in range(3):
            x = 8 + ((seed * 7 + i * 19) % 42)
            y = 9 + ((seed * 5 + i * 13) % 14)
            draw.line([(x - 7, y + 3), (x + 8, y - 3)], fill=(255, 244, 214, 28), width=1)
    elif mode.startswith("plaza"):
        draw.polygon([(32, 4), (53, 16), (32, 28), (11, 16)], outline=accent + (38,))
        if "inlay" in mode:
            draw.line([(19, 16), (32, 10), (45, 16), (32, 22), (19, 16)], fill=accent + (104,), width=1)
    elif mode.startswith("road"):
        draw.polygon([(3, 18), (32, 7), (61, 16), (32, 27)], fill=(33, 35, 35, 185))
        if "stripe" in mode:
            draw.line([(8, 18), (32, 10), (56, 17)], fill=accent + (176,), width=2)
        draw.line([(9, 21), (32, 13), (55, 20)], fill=(10, 14, 17, 92), width=1)
    elif mode.startswith("rubble"):
        for i in range(7):
            x = 11 + ((seed * 23 + i * 9) % 43)
            y = 9 + ((seed * 17 + i * 5) % 16)
            color = accent if i % 3 == 0 else fill
            draw.polygon([(x, y), (x + 5, y - 2), (x + 9, y + 1), (x + 3, y + 4)], fill=color + (92,), outline=crack + (90,))
    elif mode.startswith("scorch"):
        draw.ellipse((15, 8, 51, 25), fill=(13, 16, 18, 118))
        draw.ellipse((22, 11, 43, 21), fill=accent + (62,))
    elif mode.startswith("cable"):
        draw.line([(0, 18), (16, 14), (34, 18), (64, 11)], fill=(8, 12, 18, 170), width=3)
        draw.line([(0, 17), (18, 13), (35, 17), (64, 10)], fill=accent + (150,), width=1)
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
    elif mode == "terminal_panel":
        draw.polygon([(32, 4), (57, 16), (32, 28), (7, 16)], fill=(22, 68, 72, 150), outline=accent + (160,))
        draw.line([(15, 16), (49, 16)], fill=accent + (120,), width=1)
        draw.line([(32, 7), (32, 25)], fill=accent + (110,), width=1)
    return tile


def shadow(size: tuple[int, int], bbox: tuple[int, int, int, int], alpha: int = 88) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse(bbox, fill=(0, 0, 0, alpha))
    return layer.filter(ImageFilter.GaussianBlur(1.2))


def polygon(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], fill: tuple[int, int, int, int], outline: tuple[int, int, int, int] = (8, 12, 18, 255), width: int = 2) -> None:
    draw.polygon(points, fill=fill)
    draw.line(points + [points[0]], fill=outline, width=width, joint="curve")


def draw_iso_plate(draw: ImageDraw.ImageDraw, cx: int, cy: int, w: int, h: int, color: tuple[int, int, int], accent: tuple[int, int, int], alpha: int = 240) -> None:
    polygon(draw, [(cx, cy - h // 2), (cx + w // 2, cy), (cx, cy + h // 2), (cx - w // 2, cy)], color + (alpha,), (8, 12, 18, 230), 2)
    draw.line([(cx - w // 2 + 12, cy), (cx, cy + h // 2 - 7), (cx + w // 2 - 12, cy)], fill=(255, 244, 214, 58), width=1)
    draw.line([(cx - w // 2 + 16, cy - 4), (cx + w // 2 - 18, cy - 4)], fill=accent + (118,), width=2)


def draw_cable(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], color: tuple[int, int, int], glow: tuple[int, int, int], width: int = 4) -> None:
    draw.line(points, fill=(6, 9, 14, 235), width=width + 3, joint="curve")
    draw.line(points, fill=color + (245,), width=width, joint="curve")
    draw.line(points, fill=glow + (180,), width=max(1, width // 2), joint="curve")


def draw_small_debris(draw: ImageDraw.ImageDraw, seed: int, count: int, bounds: tuple[int, int, int, int], palette_colors: list[tuple[int, int, int]]) -> None:
    x0, y0, x1, y1 = bounds
    for i in range(count):
        x = x0 + ((seed * 37 + i * 29) % max(1, x1 - x0))
        y = y0 + ((seed * 23 + i * 17) % max(1, y1 - y0))
        w = 5 + ((seed + i * 5) % 15)
        h = 3 + ((seed + i * 7) % 9)
        color = palette_colors[(seed + i) % len(palette_colors)]
        pts = [(x, y), (x + w, y - h // 2), (x + w + 5, y + h // 2), (x + 2, y + h)]
        polygon(draw, pts, color + (214,), (8, 12, 18, 190), 1)


def add_pixel_rivet_field(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], color: tuple[int, int, int], seed: int) -> None:
    for i, (x, y) in enumerate(points):
        r = 2 + ((seed + i) % 2)
        draw.rectangle((x - r, y - r, x + r, y + r), fill=color + (236,), outline=(8, 12, 18, 220))


def build_ground_atlas() -> None:
    sources = [open_rgba(PIXELLAB / "m50_unknown_isometric_b_raw" / f"frame_{i}.png") for i in range(16)]
    specs = [
        ((132, 138, 137), (210, 204, 184), (48, 55, 58), "concrete_a"),
        ((114, 122, 122), (190, 186, 165), (42, 49, 52), "concrete_b"),
        ((94, 103, 105), (149, 154, 146), (34, 40, 44), "concrete_c"),
        ((150, 143, 120), (255, 209, 102), (58, 52, 44), "plaza_inlay"),
        ((123, 113, 93), (231, 193, 118), (52, 46, 38), "plaza_stone"),
        ((95, 83, 69), (188, 132, 84), (39, 32, 28), "dust"),
        ((72, 70, 66), (127, 108, 83), (28, 29, 30), "scorch"),
        ((48, 51, 52), (255, 209, 102), (18, 22, 24), "road_stripe"),
        ((37, 40, 41), (83, 89, 84), (14, 17, 18), "road_plain"),
        ((89, 76, 62), (147, 104, 75), (32, 27, 25), "rubble_a"),
        ((78, 66, 58), (174, 92, 80), (29, 25, 24), "rubble_b"),
        ((64, 58, 57), (255, 93, 87), (24, 22, 24), "rubble_warning"),
        ((35, 87, 91), (100, 224, 180), (16, 46, 50), "terminal"),
        ((23, 70, 75), (100, 224, 180), (11, 34, 38), "terminal_panel"),
        ((20, 45, 54), (69, 170, 242), (8, 19, 25), "cable_blue"),
        ((25, 34, 40), (100, 224, 180), (8, 13, 18), "cable_mint"),
        ((93, 73, 113), (123, 97, 255), (35, 27, 46), "breach_light"),
        ((73, 48, 94), (123, 97, 255), (26, 20, 35), "breach_medium"),
        ((48, 29, 66), (255, 93, 87), (20, 16, 29), "breach_heavy"),
        ((30, 17, 42), (123, 97, 255), (12, 10, 20), "breach"),
        ((40, 24, 52), (100, 224, 180), (13, 11, 22), "breach_light"),
        ((106, 107, 96), (255, 244, 214), (44, 48, 48), "concrete_worn"),
        ((82, 92, 88), (100, 224, 180), (30, 42, 39), "plaza_moss"),
        ((119, 102, 82), (255, 209, 102), (42, 35, 30), "dust_grit"),
        ((102, 97, 90), (214, 208, 187), (42, 42, 39), "concrete_cracked"),
        ((91, 80, 69), (255, 93, 87), (35, 30, 27), "rubble_dark"),
        ((53, 58, 60), (69, 170, 242), (20, 24, 26), "road_plain"),
        ((46, 57, 56), (100, 224, 180), (18, 28, 28), "terminal_panel"),
        ((62, 42, 74), (123, 97, 255), (22, 16, 29), "breach_medium"),
        ((33, 30, 36), (255, 93, 87), (13, 12, 16), "scorch"),
        ((131, 119, 94), (255, 209, 102), (52, 45, 35), "plaza_inlay"),
        ((74, 78, 77), (154, 159, 149), (29, 34, 36), "concrete_c"),
    ]
    atlas = Image.new("RGBA", (512, 128), (0, 0, 0, 0))
    for i, spec in enumerate(specs):
        tile = tile_from_source(sources[i % len(sources)], *spec, seed=i + 3)
        atlas.alpha_composite(tile, ((i % 8) * 64, (i // 8) * 32))
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
    size = (280, 236)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(shadow(size, (22, 170, 258, 228), 142))
    draw = ImageDraw.Draw(canvas)
    draw_iso_plate(draw, 140, 179, 224, 78, (58, 63, 64), (100, 224, 180), 250)
    draw_iso_plate(draw, 140, 164, 164, 56, (105, 112, 108), (255, 209, 102), 246)
    polygon(draw, [(76, 146), (115, 128), (149, 138), (108, 160)], (140, 133, 113, 242), width=2)
    polygon(draw, [(172, 132), (221, 111), (238, 123), (190, 149)], (104, 94, 80, 242), width=2)
    polygon(draw, [(110, 87), (138, 70), (169, 86), (169, 140), (137, 157), (109, 140)], (212, 206, 185, 255), width=3)
    polygon(draw, [(127, 43), (157, 31), (186, 45), (158, 61)], (255, 93, 87, 250), width=3)
    polygon(draw, [(119, 61), (158, 62), (158, 91), (136, 103), (118, 91)], (160, 166, 154, 250), width=3)
    polygon(draw, [(137, 79), (158, 68), (178, 80), (158, 92)], (69, 170, 242, 240), width=2)
    draw.line([(67, 159), (109, 135), (151, 151), (214, 113)], fill=(255, 209, 102, 230), width=5)
    draw.line([(69, 165), (111, 141), (151, 156), (217, 119)], fill=(8, 12, 18, 150), width=2)
    draw_cable(draw, [(119, 102), (96, 134), (70, 161), (46, 172)], (37, 59, 66), (100, 224, 180), 4)
    draw_cable(draw, [(171, 90), (197, 119), (235, 141), (258, 158)], (45, 31, 55), (123, 97, 255), 4)
    add_pixel_rivet_field(draw, [(129, 111), (147, 119), (160, 112), (101, 151), (181, 143), (206, 133)], (255, 244, 214), 7)
    draw_small_debris(draw, 19, 18, (52, 154, 225, 206), [(86, 80, 70), (184, 178, 158), (47, 56, 60)])
    canvas.save(ROOT / "assets" / "props" / "armistice_plaza" / "treaty_monument.png")


def build_prop(name: str, frame: int, out_name: str, size: tuple[int, int], max_w: int, max_h: int, tint_color: tuple[int, int, int], accents: str) -> None:
    src = open_rgba(PIXELLAB / "m50_unknown_isometric_a_raw" / f"frame_{frame}.png")
    subject = hard_outline(tint(fit_subject(src, size, max_w, max_h, 0.9), tint_color, 0.08), width=1, alpha=160)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(shadow(size, (8, int(size[1] * 0.72), size[0] - 7, size[1] - 4), 104))
    draw = ImageDraw.Draw(canvas)
    if accents == "barricade":
        draw_iso_plate(draw, 128, 117, 218, 66, (67, 55, 47), (255, 209, 102), 238)
        segments = [
            [(21, 96), (75, 74), (93, 85), (39, 112)],
            [(66, 84), (124, 59), (145, 71), (87, 100)],
            [(119, 78), (179, 76), (198, 91), (138, 101)],
            [(168, 91), (224, 101), (238, 119), (181, 115)],
        ]
        colors = [(214, 69, 66), (255, 93, 87), (217, 181, 93), (255, 209, 102)]
        for i, pts in enumerate(segments):
            polygon(draw, pts, colors[i % len(colors)] + (246,), width=3)
            draw.line([pts[0], pts[2]], fill=(8, 12, 18, 150), width=2)
        for x, y, h in [(37, 79, 57), (94, 61, 66), (151, 67, 60), (211, 92, 44)]:
            draw.line([(x, y), (x - 10, y + h)], fill=(15, 20, 25, 245), width=5)
            draw.line([(x + 4, y + 8), (x - 6, y + h + 2)], fill=(91, 98, 96, 210), width=2)
        draw_cable(draw, [(25, 124), (86, 110), (144, 127), (219, 121)], (30, 35, 39), (255, 93, 87), 3)
        draw_small_debris(draw, 31, 22, (18, 108, 232, 148), [(63, 52, 45), (151, 121, 76), (190, 64, 62)])
    elif accents == "drone":
        draw_iso_plate(draw, 128, 135, 190, 60, (43, 51, 55), (69, 170, 242), 228)
        polygon(draw, [(77, 84), (130, 53), (188, 82), (152, 118), (95, 112)], (43, 63, 75, 250), width=3)
        polygon(draw, [(101, 50), (138, 34), (174, 51), (137, 68)], (69, 170, 242, 245), width=3)
        polygon(draw, [(103, 72), (143, 56), (159, 92), (119, 109)], (183, 195, 188, 242), width=3)
        draw.line([(37, 96), (93, 84), (155, 93), (222, 86)], fill=(11, 17, 24, 245), width=8)
        draw.line([(50, 69), (102, 88), (156, 107), (220, 137)], fill=(11, 17, 24, 240), width=7)
        for x, y, w, h in [(25, 103, 66, 31), (166, 101, 70, 31), (52, 78, 57, 27), (199, 83, 44, 24)]:
            draw.ellipse((x, y, x + w, y + h), fill=(23, 31, 37, 244), outline=(8, 12, 18, 255), width=3)
            draw.arc((x + 8, y + 5, x + w - 8, y + h - 3), 180, 360, fill=(80, 95, 100, 190), width=2)
        draw_cable(draw, [(76, 124), (116, 144), (153, 135), (196, 154)], (25, 34, 42), (69, 170, 242), 4)
        draw_small_debris(draw, 43, 18, (54, 128, 213, 165), [(38, 48, 54), (94, 113, 116), (56, 73, 83)])
    elif accents == "terminal":
        draw_iso_plate(draw, 124, 157, 186, 76, (17, 70, 77), (100, 224, 180), 246)
        cabinets = [(47, 82, 48, 74), (96, 55, 52, 105), (150, 88, 50, 70)]
        for i, (x, y, w, h) in enumerate(cabinets):
            polygon(draw, [(x, y + 12), (x + w // 2, y), (x + w, y + 12), (x + w, y + h), (x + w // 2, y + h + 14), (x, y + h)], (24, 78, 84, 248), width=3)
            draw.rectangle((x + 10, y + 20, x + w - 10, y + 46), fill=(100, 224, 180, 246), outline=(8, 12, 18, 230), width=2)
            for n in range(4):
                yy = y + 52 + n * 8
                draw.line([(x + 9, yy), (x + w - 9, yy)], fill=((255, 244, 214) if n % 2 else (69, 170, 242)) + (130,), width=1)
        draw.line([(124, 56), (124, 19)], fill=(255, 209, 102, 245), width=5)
        draw.line([(118, 20), (130, 20)], fill=(8, 12, 18, 255), width=7)
        draw.ellipse((114, 6, 136, 28), fill=(255, 209, 102, 248), outline=(8, 12, 18, 255), width=2)
        draw_cable(draw, [(36, 167), (78, 153), (128, 173), (191, 159), (226, 170)], (21, 44, 52), (100, 224, 180), 4)
        draw_small_debris(draw, 57, 16, (28, 157, 220, 190), [(19, 56, 62), (73, 121, 116), (207, 194, 149)])
    elif accents == "breach":
        polygon(draw, [(18, 111), (73, 73), (120, 96), (172, 58), (229, 93), (274, 73), (260, 116), (178, 154), (94, 139)], (30, 12, 47, 246), width=3)
        draw.line([(19, 116), (59, 92), (92, 108), (133, 70), (184, 109), (268, 78)], fill=(123, 97, 255, 255), width=9)
        draw.line([(22, 117), (59, 96), (92, 112), (134, 75), (182, 114), (265, 83)], fill=(223, 213, 255, 195), width=2)
        draw.line([(78, 108), (98, 151), (120, 91)], fill=(255, 93, 87, 232), width=5)
        draw.line([(168, 103), (192, 146), (218, 87)], fill=(100, 224, 180, 218), width=4)
        for x, y, s in [(43, 128, 10), (132, 134, 15), (213, 108, 12), (103, 76, 9), (235, 126, 8)]:
            polygon(draw, [(x, y), (x + s, y - s // 2), (x + s * 2, y), (x + s, y + s // 2)], (123, 97, 255, 145), (8, 12, 18, 115), 1)
        draw_cable(draw, [(52, 148), (98, 135), (151, 154), (230, 139)], (26, 18, 40), (255, 93, 87), 3)
        draw_small_debris(draw, 71, 20, (18, 116, 260, 158), [(49, 24, 63), (80, 47, 97), (38, 31, 48)])
    canvas.alpha_composite(subject)
    canvas.save(ROOT / "assets" / "props" / "armistice_plaza" / out_name)


def build_props() -> None:
    build_treaty_monument()
    build_prop("barricade", 3, "barricade_corridor_set.png", (284, 184), 136, 86, (255, 93, 87), "barricade")
    build_prop("drone", 1, "crashed_drone_yard_wreck.png", (286, 210), 150, 98, (69, 170, 242), "drone")
    build_prop("terminal", 2, "emergency_alignment_terminal.png", (268, 226), 126, 108, (100, 224, 180), "terminal")
    build_prop("breach", 15, "cosmic_breach_crack.png", (304, 184), 150, 82, (123, 97, 255), "breach")


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


CLASS_IDS = [
    "accord_striker",
    "bastion_breaker",
    "drone_reaver",
    "signal_vanguard",
    "bonecode_executioner",
    "redline_surgeon",
    "moonframe_juggernaut",
    "vector_interceptor",
    "nullbreaker_ronin",
    "overclock_marauder",
    "prism_gunner",
    "rift_saboteur",
]

CLASS_PALETTES = [
    ((58, 214, 191), (69, 170, 242), (255, 209, 102)),
    ((164, 177, 174), (255, 209, 102), (255, 93, 87)),
    ((67, 154, 190), (100, 224, 180), (178, 140, 255)),
    ((82, 198, 159), (255, 244, 214), (69, 170, 242)),
    ((184, 190, 188), (255, 93, 87), (123, 97, 255)),
    ((220, 225, 210), (255, 93, 87), (100, 224, 180)),
    ((132, 151, 168), (255, 209, 102), (69, 170, 242)),
    ((88, 160, 210), (123, 97, 255), (255, 244, 214)),
    ((118, 124, 134), (123, 97, 255), (255, 93, 87)),
    ((173, 106, 72), (255, 93, 87), (255, 209, 102)),
    ((206, 218, 219), (69, 170, 242), (255, 244, 214)),
    ((86, 93, 118), (123, 97, 255), (100, 224, 180)),
]


def shade(color: tuple[int, int, int], factor: float) -> tuple[int, int, int]:
    return tuple(max(0, min(255, int(channel * factor))) for channel in color)


def draw_limb(draw: ImageDraw.ImageDraw, a: tuple[int, int], b: tuple[int, int], color: tuple[int, int, int], width: int) -> None:
    draw.line([a, b], fill=(7, 9, 15, 255), width=width + 3)
    draw.line([a, b], fill=color + (255,), width=width)
    draw.rectangle((b[0] - 3, b[1] - 2, b[0] + 3, b[1] + 3), fill=shade(color, 0.7) + (255,), outline=(7, 9, 15, 245))


def draw_player_frame(class_index: int, direction: int, frame_index: int) -> Image.Image:
    frame = Image.new("RGBA", (80, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    primary, accent, glow = CLASS_PALETTES[class_index]
    bob = [-1, 1, 0][frame_index]
    step = [-4, 4, 0][frame_index]
    cx = 40
    foot_y = 68 + bob
    bulky = class_index in {1, 6, 9}
    lean = class_index in {4, 8, 11}
    torso_w = 20 + (8 if bulky else -2 if lean else 2)
    torso_h = 28 + (4 if bulky else 0)
    shoulder_w = torso_w + 12 + (7 if bulky else 0)
    side = 1 if direction == 1 else -1 if direction == 3 else 0
    back = direction == 2
    facing_scale = 0.88 if back else 1.0
    draw.ellipse((20, 64, 60, 75), fill=(0, 0, 0, 92))
    leg_color = shade(primary, 0.72)
    draw_limb(draw, (cx - 8, foot_y - 20), (cx - 13 - step // 2, foot_y), leg_color, 5)
    draw_limb(draw, (cx + 8, foot_y - 20), (cx + 13 + step // 2, foot_y), leg_color, 5)
    if side:
        draw_limb(draw, (cx - side * 7, foot_y - 36), (cx - side * 26, foot_y - 28 + step // 3), shade(primary, 0.82), 5)
        draw_limb(draw, (cx + side * 8, foot_y - 35), (cx + side * 24, foot_y - 48 - step // 3), accent, 5)
    else:
        draw_limb(draw, (cx - 11, foot_y - 35), (cx - 25, foot_y - 27 + step // 3), shade(primary, 0.82), 5)
        draw_limb(draw, (cx + 11, foot_y - 35), (cx + 25, foot_y - 27 - step // 3), accent, 5)
    polygon(
        draw,
        [(cx, foot_y - torso_h - 9), (cx + shoulder_w // 2, foot_y - torso_h + 1), (cx + torso_w // 2, foot_y - 10), (cx, foot_y - 2), (cx - torso_w // 2, foot_y - 10), (cx - shoulder_w // 2, foot_y - torso_h + 1)],
        shade(primary, 0.86) + (255,),
        width=3,
    )
    polygon(
        draw,
        [(cx, foot_y - torso_h - 3), (cx + int(torso_w * facing_scale) // 2, foot_y - torso_h + 6), (cx + torso_w // 3, foot_y - 16), (cx, foot_y - 8), (cx - torso_w // 3, foot_y - 16), (cx - int(torso_w * facing_scale) // 2, foot_y - torso_h + 6)],
        primary + (255,),
        width=2,
    )
    draw.rectangle((cx - 5, foot_y - 31, cx + 5, foot_y - 20), fill=glow + (245,), outline=(7, 9, 15, 230), width=1)
    head_y = foot_y - torso_h - 18
    polygon(draw, [(cx, head_y - 10), (cx + 12, head_y - 3), (cx + 10, head_y + 10), (cx, head_y + 16), (cx - 10, head_y + 10), (cx - 12, head_y - 3)], shade(primary, 0.92) + (255,), width=3)
    visor = (255, 244, 214) if back else glow
    draw.rectangle((cx - 7 + side * 3, head_y - 3, cx + 7 + side * 3, head_y + 4), fill=visor + (250,), outline=(7, 9, 15, 230), width=1)
    if class_index == 0:
        draw.line([(cx - 10, head_y - 8), (cx - 25, head_y - 20)], fill=accent + (245,), width=3)
        draw.line([(cx + 10, head_y - 8), (cx + 25, head_y - 20)], fill=accent + (245,), width=3)
        draw.rectangle((cx - 19, foot_y - 22, cx + 19, foot_y - 16), fill=(19, 34, 42, 245), outline=(7, 9, 15, 220))
    elif class_index == 1:
        draw.rectangle((cx - 28, foot_y - 49, cx - 17, foot_y - 23), fill=accent + (245,), outline=(7, 9, 15, 230), width=2)
        draw.rectangle((cx + 17, foot_y - 49, cx + 28, foot_y - 23), fill=accent + (245,), outline=(7, 9, 15, 230), width=2)
    elif class_index == 2:
        for dx, dy in [(-25, -49), (25, -47), (0, -58)]:
            draw.ellipse((cx + dx - 5, foot_y + dy - 4, cx + dx + 5, foot_y + dy + 4), fill=accent + (245,), outline=(7, 9, 15, 230), width=2)
    elif class_index == 3:
        draw.arc((cx - 24, head_y - 20, cx + 24, head_y + 18), 205, 335, fill=glow + (220,), width=3)
        draw.line([(cx + 18, foot_y - 44), (cx + 31, foot_y - 60)], fill=accent + (245,), width=4)
    elif class_index == 4:
        draw.line([(cx + 17, foot_y - 42), (cx + 35, foot_y - 66)], fill=accent + (250,), width=4)
        draw.line([(cx + 31, foot_y - 64), (cx + 39, foot_y - 68)], fill=(255, 244, 214, 230), width=3)
    elif class_index == 5:
        draw_cable(draw, [(cx - 18, foot_y - 45), (cx - 5, foot_y - 33), (cx + 19, foot_y - 52)], (255, 93, 87), (255, 244, 214), 3)
    elif class_index == 6:
        draw.rectangle((cx - 22, foot_y - 44, cx + 22, foot_y - 20), fill=shade(primary, 0.68) + (245,), outline=(7, 9, 15, 240), width=2)
        draw.rectangle((cx - 8, foot_y - 49, cx + 8, foot_y - 39), fill=glow + (240,), outline=(7, 9, 15, 230), width=1)
    elif class_index == 7:
        draw.line([(cx - 30, foot_y - 27), (cx + 33, foot_y - 52)], fill=accent + (245,), width=4)
        draw.line([(cx - 19, foot_y - 20), (cx + 24, foot_y - 61)], fill=glow + (150,), width=2)
    elif class_index == 8:
        draw.line([(cx + 21, foot_y - 34), (cx + 37, foot_y - 60)], fill=accent + (245,), width=5)
        draw.line([(cx - 20, foot_y - 40), (cx - 34, foot_y - 58)], fill=(255, 93, 87, 220), width=3)
    elif class_index == 9:
        for dx in (-21, 21):
            draw.rectangle((cx + dx - 5, foot_y - 58, cx + dx + 5, foot_y - 39), fill=(255, 93, 87, 245), outline=(7, 9, 15, 230))
    elif class_index == 10:
        draw.polygon([(cx + 18, foot_y - 42), (cx + 39, foot_y - 48), (cx + 31, foot_y - 36)], fill=accent + (245,), outline=(7, 9, 15, 230))
        draw.line([(cx + 30, foot_y - 43), (cx + 47, foot_y - 47)], fill=glow + (225,), width=3)
    else:
        draw.arc((cx - 27, foot_y - 56, cx + 20, foot_y - 12), 210, 340, fill=accent + (210,), width=3)
        draw.rectangle((cx - 28, foot_y - 23, cx - 17, foot_y - 15), fill=glow + (235,), outline=(7, 9, 15, 220))
    return hard_outline(frame, width=1)


def build_player_roster() -> None:
    sheet = Image.new("RGBA", (240, len(CLASS_IDS) * 4 * 80), (0, 0, 0, 0))
    for class_index in range(len(CLASS_IDS)):
        for direction in range(4):
            for frame_index in range(3):
                frame = draw_player_frame(class_index, direction, frame_index)
                sheet.alpha_composite(frame, (frame_index * 80, (class_index * 4 + direction) * 80))
    sheet.save(ROOT / "assets" / "sprites" / "players" / "class_roster_m49.png")
    accord = sheet.crop((0, 0, 240, 320))
    accord.save(ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png")


def draw_enemy_frame(kind: str, frame_index: int) -> Image.Image:
    frame = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    bob = [-1, 1, 0][frame_index]
    draw.ellipse((15, 49, 50, 58), fill=(0, 0, 0, 95))
    if kind == "bad_outputs":
        polygon(draw, [(31, 11 + bob), (48, 27), (42, 48), (24, 53), (13, 35)], (112, 64, 91, 255), width=3)
        draw.polygon([(25, 24), (35, 19), (45, 25), (34, 31)], fill=(255, 93, 87, 230), outline=(7, 9, 15, 220))
        draw.rectangle((22, 35, 43, 41), fill=(255, 244, 214, 230), outline=(7, 9, 15, 220))
        draw.line([(16, 39), (7, 49)], fill=(123, 97, 255, 230), width=4)
        draw.line([(44, 40), (55, 50)], fill=(123, 97, 255, 230), width=4)
    elif kind == "benchmark_gremlins":
        polygon(draw, [(31, 13 + bob), (47, 22), (50, 42), (36, 53), (18, 49), (14, 29)], (59, 54, 112, 255), width=3)
        draw.rectangle((21, 24, 43, 35), fill=(123, 97, 255, 240), outline=(7, 9, 15, 230), width=2)
        for x in (20, 31, 42):
            draw.line([(x, 42), (x - 5 + frame_index * 2, 55)], fill=(46, 42, 86, 245), width=4)
        draw.line([(31, 14), (26, 5)], fill=(100, 224, 180, 230), width=3)
        draw.line([(34, 14), (42, 6)], fill=(100, 224, 180, 230), width=3)
    else:
        polygon(draw, [(13, 39), (24, 23 + bob), (44, 23 + bob), (55, 40), (43, 51), (25, 51)], (42, 86, 87, 255), width=3)
        draw.rectangle((23, 29, 44, 38), fill=(100, 224, 180, 235), outline=(7, 9, 15, 230), width=2)
        for x, sign in [(17, -1), (25, -1), (39, 1), (48, 1)]:
            draw.line([(x, 44), (x + sign * (9 + frame_index), 55)], fill=(28, 57, 58, 245), width=4)
        draw.line([(16, 25), (6, 18)], fill=(255, 209, 102, 220), width=3)
        draw.line([(48, 25), (58, 18)], fill=(255, 209, 102, 220), width=3)
    return hard_outline(frame, width=1)


def build_enemy_sheets() -> None:
    for kind, filename in [
        ("bad_outputs", "bad_outputs_sheet.png"),
        ("benchmark_gremlins", "benchmark_gremlins_sheet.png"),
        ("context_rot_crabs", "context_rot_crabs_sheet.png"),
    ]:
        sheet = Image.new("RGBA", (192, 64), (0, 0, 0, 0))
        for frame_index in range(3):
            sheet.alpha_composite(draw_enemy_frame(kind, frame_index), (frame_index * 64, 0))
        sheet.save(ROOT / "assets" / "sprites" / "enemies" / filename)


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
    build_player_roster()
    build_enemy_sheets()


def main() -> None:
    build_ground_atlas()
    build_transition_atlas()
    build_props()
    build_title_backdrop()
    enhance_player_and_enemies()
    print("Rebuilt Armistice visual slice assets, terrain transitions, title backdrop, and sprite readability polish.")


if __name__ == "__main__":
    main()
