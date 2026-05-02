#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


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


def build_treaty_monument() -> None:
    src = open_rgba(PIXELLAB / "m50_unknown_isometric_a_raw" / "frame_0.png")
    core = fit_subject(src, (128, 128), 92, 92, 0.9)
    canvas = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    canvas.alpha_composite(shadow((128, 128), (26, 101, 104, 124), 96))
    draw = ImageDraw.Draw(canvas)
    draw.polygon([(64, 84), (106, 104), (64, 125), (21, 104)], fill=(70, 78, 82, 255), outline=(12, 18, 24, 255))
    draw.polygon([(64, 89), (98, 104), (64, 119), (30, 104)], fill=(100, 224, 180, 225))
    canvas.alpha_composite(core)
    draw.rectangle((51, 33, 77, 81), fill=(214, 208, 187, 245), outline=(12, 18, 24, 255))
    draw.rectangle((46, 24, 82, 37), fill=(255, 93, 87, 245), outline=(12, 18, 24, 255))
    draw.rectangle((57, 46, 70, 67), fill=(69, 170, 242, 245), outline=(12, 18, 24, 255))
    draw.line([(34, 88), (55, 78), (72, 85), (94, 75)], fill=(255, 209, 102, 210), width=3)
    canvas.save(ROOT / "assets" / "props" / "armistice_plaza" / "treaty_monument.png")


def build_prop(name: str, frame: int, out_name: str, size: tuple[int, int], max_w: int, max_h: int, tint_color: tuple[int, int, int], accents: str) -> None:
    src = open_rgba(PIXELLAB / "m50_unknown_isometric_a_raw" / f"frame_{frame}.png")
    subject = tint(fit_subject(src, size, max_w, max_h, 0.9), tint_color, 0.22)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(shadow(size, (8, int(size[1] * 0.68), size[0] - 7, size[1] - 3), 88))
    canvas.alpha_composite(subject)
    draw = ImageDraw.Draw(canvas)
    if accents == "barricade":
        for x in (14, 36, 58):
            draw.rectangle((x, 39, x + 24, 49), fill=(255, 93, 87, 235), outline=(12, 18, 24, 255))
            draw.rectangle((x + 4, 50, x + 30, 57), fill=(255, 209, 102, 220), outline=(12, 18, 24, 255))
    elif accents == "drone":
        draw.line([(12, 43), (43, 31), (83, 48)], fill=(69, 170, 242, 210), width=3)
        draw.rectangle((39, 27, 58, 40), fill=(69, 170, 242, 230), outline=(12, 18, 24, 255))
        draw.line([(18, 31), (78, 56)], fill=(12, 18, 24, 220), width=3)
    elif accents == "terminal":
        draw.rectangle((32, 32, 64, 68), fill=(31, 74, 80, 230), outline=(12, 18, 24, 255))
        draw.rectangle((39, 40, 57, 57), fill=(100, 224, 180, 235), outline=(12, 18, 24, 255))
        draw.line([(48, 21), (48, 7)], fill=(255, 209, 102, 245), width=3)
        draw.ellipse((43, 2, 53, 12), fill=(255, 209, 102, 245))
    elif accents == "breach":
        draw.line([(8, 43), (25, 34), (42, 45), (61, 27), (86, 42), (117, 31)], fill=(123, 97, 255, 240), width=4)
        draw.line([(33, 45), (41, 58), (52, 39)], fill=(255, 93, 87, 210), width=3)
    canvas.save(ROOT / "assets" / "props" / "armistice_plaza" / out_name)


def build_props() -> None:
    build_treaty_monument()
    build_prop("barricade", 3, "barricade_corridor_set.png", (96, 64), 82, 54, (255, 93, 87), "barricade")
    build_prop("drone", 1, "crashed_drone_yard_wreck.png", (96, 64), 84, 54, (69, 170, 242), "drone")
    build_prop("terminal", 2, "emergency_alignment_terminal.png", (96, 96), 78, 82, (100, 224, 180), "terminal")
    build_prop("breach", 15, "cosmic_breach_crack.png", (128, 64), 112, 52, (123, 97, 255), "breach")


def main() -> None:
    build_ground_atlas()
    build_props()
    print("Rebuilt Armistice visual slice assets from PixelLab-backed M50/M51 raw batches.")


if __name__ == "__main__":
    main()
