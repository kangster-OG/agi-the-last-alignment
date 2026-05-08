#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "signal_coast_source_v1"
GROUND_SIZE = (5120, 3072)
GROUND_ORIGIN = (2560, 1536)
TILE_WIDTH = 64
TILE_HEIGHT = 32


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def save(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True, compress_level=9)


def save_quantized(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGBA").quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)


def remove_green_key(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if (g > 118 and g - r > 46 and g - b > 34) or (g > 82 and g - r > 30 and g - b > 24):
                pixels[x, y] = (0, 0, 0, 0)
    return image


def despill_green(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a < 8:
                pixels[x, y] = (0, 0, 0, 0)
            elif g > r + 18 and g > b + 12:
                pixels[x, y] = (r, min(g, max(r, b) + 10), b, a)
    return image


def alpha_crop(image: Image.Image) -> Image.Image:
    box = image.getbbox()
    return image.crop(box) if box else image


def grid_cell(image: Image.Image, cols: int, rows: int, col: int, row: int, inset: int = 10) -> Image.Image:
    cell_w = image.width // cols
    cell_h = image.height // rows
    return image.crop((col * cell_w + inset, row * cell_h + inset, (col + 1) * cell_w - inset, (row + 1) * cell_h - inset))


def fit_subject(image: Image.Image, size: tuple[int, int], max_size: tuple[int, int], anchor_y: float) -> Image.Image:
    subject = alpha_crop(despill_green(remove_green_key(image)))
    subject.thumbnail(max_size, Image.Resampling.LANCZOS)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - subject.width) // 2
    y = int(size[1] * anchor_y - subject.height)
    out.alpha_composite(subject, (x, y))
    return out


def world_to_canvas(world_x: float, world_y: float) -> tuple[int, int]:
    screen_x = (world_x - world_y) * TILE_WIDTH * 0.5
    screen_y = (world_x + world_y) * TILE_HEIGHT * 0.5
    return (round(GROUND_ORIGIN[0] + screen_x), round(GROUND_ORIGIN[1] + screen_y))


def apply_outer_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    margin = 190
    for y in range(height):
        edge_y = min(y, height - 1 - y)
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            edge_x = min(x, width - 1 - x)
            edge = min(edge_x, edge_y)
            if edge >= margin:
                continue
            alpha = max(0, min(1, edge / margin))
            pixels[x, y] = (r, g, b, round(a * alpha))
    return image


def pack_grid_source(
    source_name: str,
    out_path: Path,
    cols: int,
    rows: int,
    frame_size: tuple[int, int],
    max_size: tuple[int, int],
    anchor_y: float,
) -> None:
    source = rgba(SOURCE / source_name)
    out = Image.new("RGBA", (cols * frame_size[0], rows * frame_size[1]), (0, 0, 0, 0))
    for row in range(rows):
        for col in range(cols):
            frame = fit_subject(grid_cell(source, cols, rows, col, row), frame_size, max_size, anchor_y)
            out.alpha_composite(frame, (col * frame_size[0], row * frame_size[1]))
    save(out_path, out)


def signal_terrain_frames() -> list[Image.Image]:
    source = rgba(SOURCE / "signal_terrain_source_v1.png")
    frames: list[Image.Image] = []
    for row in range(2):
        for col in range(2):
            frames.append(fit_subject(grid_cell(source, 2, 2, col, row, 14), (512, 320), (496, 304), 0.86))
    return frames


def place_ground_chunk(ground: Image.Image, chunk: Image.Image, world_x: float, world_y: float, scale: float, alpha: int = 255) -> None:
    resized = chunk.resize((round(chunk.width * scale), round(chunk.height * scale)), Image.Resampling.LANCZOS)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    cx, cy = world_to_canvas(world_x, world_y)
    ground.alpha_composite(resized, (cx - resized.width // 2, cy - round(resized.height * 0.82)))


def pack_authored_ground() -> None:
    causeway, relay_pad, safe_spit, lighthouse_shelf = signal_terrain_frames()
    ground = Image.new("RGBA", GROUND_SIZE, (6, 18, 24, 255))
    placements: list[tuple[Image.Image, float, float, float, int]] = []
    for y in range(-32, 36, 5):
        for x in range(-38, 40, 6):
            hash_value = abs(((x + 151) * 1103515245) ^ ((y - 79) * 12345))
            frame = [causeway, relay_pad, safe_spit][hash_value % 3]
            placements.append((frame, x + ((hash_value >> 3) % 3 - 1) * 0.28, y + ((hash_value >> 5) % 3 - 1) * 0.24, 0.74 + (hash_value % 4) * 0.018, 194 + (hash_value % 7) * 5))
    placements.extend(
        [
            (causeway, -20, 5, 1.02, 255),
            (causeway, -10, 1, 0.96, 246),
            (relay_pad, 1, -8, 0.98, 252),
            (causeway, 12, -1, 0.9, 238),
            (relay_pad, 18, 6, 0.9, 245),
            (causeway, 26, -10, 0.9, 236),
            (safe_spit, -7, 11, 0.98, 248),
            (safe_spit, 20, 16, 0.96, 244),
            (safe_spit, 34, 20, 0.82, 224),
            (lighthouse_shelf, 29, -12, 0.9, 248),
            (safe_spit, -29, 15, 0.9, 230),
            (causeway, -25, 1, 0.8, 220),
        ]
    )
    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(ground, chunk, world_x, world_y, scale, alpha)
    save_quantized(ROOT / "assets" / "tiles" / "signal_coast" / "authored_ground.png", apply_outer_alpha(ground))


def pack_terrain_sources() -> None:
    frames = signal_terrain_frames()
    out = Image.new("RGBA", (2 * 512, 2 * 320), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 2) * 512, (index // 2) * 320))
    save(ROOT / "assets" / "tiles" / "signal_coast" / "signal_terrain_chunks_v1.png", out)


def main() -> None:
    pack_authored_ground()
    pack_terrain_sources()
    pack_grid_source(
        "signal_props_objectives_source_v1.png",
        ROOT / "assets" / "props" / "signal_coast" / "signal_props_objectives_v1.png",
        4,
        2,
        (256, 240),
        (238, 224),
        0.9,
    )
    source = rgba(SOURCE / "signal_skimmer_lighthouse_source_v1.png")
    skimmers = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    for col in range(4):
        frame = fit_subject(grid_cell(source, 4, 2, col, 0), (128, 112), (118, 100), 0.84)
        skimmers.alpha_composite(frame, (col * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "static_skimmers_sheet.png", skimmers)
    lighthouse = Image.new("RGBA", (4 * 320, 288), (0, 0, 0, 0))
    for col in range(4):
        frame = fit_subject(grid_cell(source, 4, 2, col, 1), (320, 288), (292, 264), 0.9)
        lighthouse.alpha_composite(frame, (col * 320, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "lighthouse_that_answers.png", lighthouse)
    pack_grid_source(
        "signal_hazard_vfx_source_v1.png",
        ROOT / "assets" / "sprites" / "effects" / "signal_hazard_vfx_v1.png",
        4,
        3,
        (192, 160),
        (180, 148),
        0.78,
    )


if __name__ == "__main__":
    main()
