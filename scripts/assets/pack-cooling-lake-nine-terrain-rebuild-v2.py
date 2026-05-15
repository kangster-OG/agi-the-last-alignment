#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = (
    ROOT
    / "assets"
    / "concepts"
    / "chatgpt_refs"
    / "cooling_lake_nine_terrain_rebuild_v2"
    / "cooling_terrain_flat_decal_atlas_source_v2.png"
)
PIXELLAB_SOURCE = ROOT / "assets" / "concepts" / "pixellab_refs" / "cooling_lake_nine_refinement_v1"
GROUND_SIZE = (5120, 3072)
GROUND_ORIGIN = (2560, 1536)
TILE_WIDTH = 64
TILE_HEIGHT = 32


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def save(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGBA").save(path, optimize=True, compress_level=9)


def alpha_crop(image: Image.Image) -> Image.Image:
    box = image.getbbox()
    return image.crop(box) if box else image


def remove_green_key(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if g > 125 and g - r > 44 and g - b > 36:
                pixels[x, y] = (0, 0, 0, 0)
    return image


def clear_green_spill(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a < 8:
                pixels[x, y] = (0, 0, 0, 0)
                continue
            if g > r + 22 and g > b + 16:
                pixels[x, y] = (r, min(g, max(r, b) + 10), b, a)
    return image


def feather_rect_edge(image: Image.Image, border: int = 18) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    if width <= 2 or height <= 2:
        return image
    border = max(1, min(border, width // 4, height // 4))
    pixels = image.load()
    for y in range(height):
        fy = min(1.0, y / border, (height - 1 - y) / border)
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            fx = min(1.0, x / border, (width - 1 - x) / border)
            fade = max(0.0, min(1.0, fx, fy))
            if fade < 1:
                pixels[x, y] = (r, g, b, round(a * (0.1 + 0.9 * fade)))
    return image


def grid_cell(image: Image.Image, cols: int, rows: int, col: int, row: int, inset: int = 16) -> Image.Image:
    cell_w = image.width // cols
    cell_h = image.height // rows
    return image.crop(
        (
            col * cell_w + inset,
            row * cell_h + inset,
            (col + 1) * cell_w - inset,
            (row + 1) * cell_h - inset,
        )
    )


def fit_subject(
    image: Image.Image,
    size: tuple[int, int],
    max_size: tuple[int, int],
    anchor_y: float = 0.72,
    resample: Image.Resampling = Image.Resampling.NEAREST,
) -> Image.Image:
    subject = alpha_crop(clear_green_spill(remove_green_key(image)))
    if subject.width > max_size[0] or subject.height > max_size[1]:
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), resample)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.alpha_composite(subject, ((size[0] - subject.width) // 2, int(size[1] * anchor_y - subject.height)))
    return out


def source_cells() -> list[Image.Image]:
    source = rgba(SOURCE)
    cells: list[Image.Image] = []
    for row in range(2):
        for col in range(4):
            cell = grid_cell(source, 4, 2, col, row)
            cells.append(feather_rect_edge(alpha_crop(clear_green_spill(remove_green_key(cell))), 16))
    return cells


def pixellab_flat_cells() -> list[Image.Image]:
    paths = [
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_03.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_04.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_02.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_01.png",
    ]
    return [alpha_crop(rgba(path)) for path in paths if path.exists()]


def world_to_canvas(world_x: float, world_y: float) -> tuple[int, int]:
    screen_x = (world_x - world_y) * TILE_WIDTH * 0.5
    screen_y = (world_x + world_y) * TILE_HEIGHT * 0.5
    return (round(GROUND_ORIGIN[0] + screen_x), round(GROUND_ORIGIN[1] + screen_y))


def paste_chunk(
    ground: Image.Image,
    chunk: Image.Image,
    world_x: float,
    world_y: float,
    scale: float,
    alpha: int,
    resample: Image.Resampling = Image.Resampling.LANCZOS,
) -> None:
    width = max(1, round(chunk.width * scale))
    height = max(1, round(chunk.height * scale))
    resized = chunk.resize((width, height), resample)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    x, y = world_to_canvas(world_x, world_y)
    ground.alpha_composite(resized, (x - resized.width // 2, y - round(resized.height * 0.58)))


def source_base_color(frames: list[Image.Image]) -> tuple[int, int, int, int]:
    samples: list[tuple[int, int, int]] = []
    for frame in frames:
        small = frame.resize((48, 32), Image.Resampling.BILINEAR).convert("RGBA")
        for r, g, b, a in small.getdata():
            if a > 128 and 44 < r + g + b < 620:
                samples.append((r, g, b))
    if not samples:
        return (10, 20, 25, 255)
    samples.sort(key=lambda rgb: rgb[0] + rgb[1] + rgb[2])
    mid = samples[len(samples) // 2]
    return (max(6, mid[0] - 10), max(10, mid[1] - 8), max(14, mid[2] - 6), 255)


def apply_outer_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    margin = 190
    for y in range(image.height):
        edge_y = min(y, image.height - 1 - y)
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            edge = min(edge_y, x, image.width - 1 - x)
            if edge >= margin:
                continue
            keep = max(0.0, min(1.0, edge / margin))
            pixels[x, y] = (r, g, b, round(a * keep))
    return image


def pack_terrain_chunks(cells: list[Image.Image]) -> None:
    out = Image.new("RGBA", (4 * 384, 2 * 256), (0, 0, 0, 0))
    for index, cell in enumerate(cells[:8]):
        frame = fit_subject(cell, (384, 256), (238, 150), 0.74, Image.Resampling.LANCZOS)
        out.alpha_composite(frame, ((index % 4) * 384, (index // 4) * 256))
    save(ROOT / "assets" / "tiles" / "cooling_lake_nine" / "cooling_terrain_chunks_v1.png", out)


def authored_ground_cells(cells: list[Image.Image]) -> list[Image.Image]:
    scaled: list[Image.Image] = []
    for cell in cells:
        subject = alpha_crop(cell)
        max_size = (268, 168)
        if subject.width > max_size[0] or subject.height > max_size[1]:
            scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
            subject = subject.resize(
                (max(1, round(subject.width * scale)), max(1, round(subject.height * scale))),
                Image.Resampling.LANCZOS,
            )
        scaled.append(feather_rect_edge(subject, 10))
    return scaled


def pack_authored_ground(cells: list[Image.Image], pixel_cells: list[Image.Image]) -> None:
    terrain_cells = authored_ground_cells(cells)
    ground_cells = terrain_cells + pixel_cells
    ground = Image.new("RGBA", GROUND_SIZE, source_base_color(ground_cells))

    # Dense local composition only: no broad source-band stretch, no repeated
    # giant sheet. Every visible mark comes from ChatGPT/PixelLab source cells.
    for yi, y in enumerate([n * 3.15 - 42.0 for n in range(28)]):
        for xi, x in enumerate([n * 3.25 - 43.8 for n in range(28)]):
            h = abs(((xi + 271) * 1103515245) ^ ((yi - 163) * 12345))
            if x > 8 and y < -5:
                choices = [0, 3, 4, 7]
            elif x < -9 and y > 6:
                choices = [1, 2, 6]
            elif -7 < x < 15 and -2 < y < 16:
                choices = [1, 5, 6, 7]
            elif x < -12 and y < -5:
                choices = [0, 2, 3]
            else:
                choices = [0, 1, 2, 3, 4, 6, 7]
            chunk = terrain_cells[choices[h % len(choices)]]
            jitter_x = ((h >> 4) % 9 - 4) * 0.18
            jitter_y = ((h >> 8) % 9 - 4) * 0.16
            scale = 0.82 + (h % 7) * 0.032
            alpha = 194 + (h % 6) * 8
            paste_chunk(ground, chunk, x + jitter_x, y + jitter_y, scale, alpha)

    authored_anchors: list[tuple[int, float, float, float, int]] = [
        (5, 0, 0, 1.06, 255),
        (1, -4, 7, 1.04, 246),
        (6, 8, -11, 1.05, 248),
        (3, -7, 8, 1.0, 244),
        (4, 13, 11, 1.02, 238),
        (7, -18, 15, 1.0, 238),
        (1, -20, 6, 0.94, 232),
        (1, 20, 14, 0.94, 232),
        (6, -30, -10, 0.9, 224),
        (2, 31, -2, 0.92, 224),
        (3, 4, -16, 0.88, 220),
        (7, 25, 22, 0.9, 224),
    ]
    for index, world_x, world_y, scale, alpha in authored_anchors:
        paste_chunk(ground, terrain_cells[index], world_x, world_y, scale, alpha)

    for index, pixel in enumerate(pixel_cells):
        anchors = [(-12, 12), (10, 6), (-26, 18), (18, -12)]
        world_x, world_y = anchors[index % len(anchors)]
        fitted = fit_subject(pixel, (256, 160), (220, 132), 0.78)
        paste_chunk(ground, fitted, world_x, world_y, 0.9, 210)

    save(ROOT / "assets" / "tiles" / "cooling_lake_nine" / "authored_ground.png", apply_outer_alpha(ground))


def main() -> None:
    cells = source_cells()
    pixels = pixellab_flat_cells()
    pack_terrain_chunks(cells)
    pack_authored_ground(cells, pixels)
    print("rebuilt Cooling Lake Nine terrain from flat V2 source decals")


if __name__ == "__main__":
    main()
