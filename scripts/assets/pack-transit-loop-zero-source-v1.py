#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "transit_loop_zero_source_v1"
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


def transit_terrain_frames() -> list[Image.Image]:
    source = rgba(SOURCE / "transit_terrain_source_v1.png")
    frames: list[Image.Image] = []
    for row in range(2):
        for col in range(4):
            frames.append(fit_subject(grid_cell(source, 4, 2, col, row), (384, 256), (368, 236), 0.82))
    return frames


def place_ground_chunk(ground: Image.Image, chunk: Image.Image, world_x: float, world_y: float, scale: float, alpha: int = 255) -> None:
    resized = chunk.resize((round(chunk.width * scale), round(chunk.height * scale)), Image.Resampling.LANCZOS)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    cx, cy = world_to_canvas(world_x, world_y)
    ground.alpha_composite(resized, (cx - resized.width // 2, cy - round(resized.height * 0.8)))


def pack_authored_ground() -> None:
    frames = transit_terrain_frames()
    platform, aligned, false_track, switchback, origin_pad, arrival_strip, route_turn, station_floor = frames
    ground = Image.new("RGBA", GROUND_SIZE, (10, 15, 25, 255))
    placements: list[tuple[Image.Image, float, float, float, int]] = []
    base_frames = [platform, origin_pad, arrival_strip]
    for y in range(-34, 37, 4):
        for x in range(-38, 39, 5):
            hash_value = abs(((x + 89) * 1103515245) ^ ((y - 41) * 12345))
            index = hash_value % len(base_frames)
            placements.append((base_frames[index], x + ((hash_value >> 3) % 3 - 1) * 0.34, y + ((hash_value >> 5) % 3 - 1) * 0.28, 0.92 + (hash_value % 4) * 0.022, 210 + (hash_value % 5) * 5))
    placements.extend(
        [
            (origin_pad, -16, 1, 1.34, 255),
            (aligned, -10, -1, 1.2, 246),
            (switchback, 0, -8, 1.28, 255),
            (aligned, 9, -3, 1.18, 244),
            (arrival_strip, 17, 5, 1.34, 255),
            (station_floor, 23, -5, 1.4, 255),
            (false_track, -4, 8, 1.18, 246),
            (false_track, 9, -15, 1.1, 236),
            (route_turn, 8, -16, 1.12, 238),
            (route_turn, 20, -8, 1.08, 232),
            (aligned, -24, 0, 1.04, 232),
            (aligned, 27, -4, 1.02, 232),
            (platform, -20, -10, 0.98, 218),
            (platform, 28, 16, 0.98, 218),
            (station_floor, 29, -11, 1.0, 222),
        ]
    )
    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(ground, chunk, world_x, world_y, scale, alpha)
    save_quantized(ROOT / "assets" / "tiles" / "transit_loop_zero" / "authored_ground.png", apply_outer_alpha(ground))


def pack_terrain_sources() -> None:
    frames = transit_terrain_frames()
    out = Image.new("RGBA", (4 * 384, 2 * 256), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 4) * 384, (index // 4) * 256))
    save(ROOT / "assets" / "tiles" / "transit_loop_zero" / "transit_terrain_chunks_v1.png", out)


def main() -> None:
    pack_authored_ground()
    pack_terrain_sources()
    pack_grid_source(
        "transit_props_objectives_source_v1.png",
        ROOT / "assets" / "props" / "transit_loop_zero" / "transit_props_objectives_v1.png",
        4,
        3,
        (224, 224),
        (206, 206),
        0.9,
    )
    pack_grid_source(
        "station_that_arrives_source_v1.png",
        ROOT / "assets" / "sprites" / "bosses" / "station_that_arrives.png",
        3,
        2,
        (288, 256),
        (250, 210),
        0.86,
    )
    pack_grid_source(
        "transit_hazard_vfx_source_v1.png",
        ROOT / "assets" / "sprites" / "effects" / "transit_hazard_vfx_v1.png",
        4,
        2,
        (192, 160),
        (180, 148),
        0.78,
    )


if __name__ == "__main__":
    main()
