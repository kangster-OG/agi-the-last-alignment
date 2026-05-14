#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "assets" / "concepts" / "chatgpt_refs" / "alignment_grid_rebuild_v1"
PIXELLAB_DIR = ROOT / "assets" / "concepts" / "pixellab_refs" / "m50_m51_replacement"
PIXELLAB_FRESH_DIR = ROOT / "assets" / "concepts" / "pixellab_refs" / "alignment_grid_rebuild_v1"
OUT_DIR = ROOT / "assets" / "props" / "alignment_grid"

CANVAS_SIZE = (2400, 1450)
ORIGIN = (1200, 650)
TILE_WIDTH = 64
TILE_HEIGHT = 32


@dataclass(frozen=True)
class Node:
    key: str
    x: float
    y: float
    terrain_cell: int
    landmark_cell: int
    scale: float


NODES = [
    Node("armistice_plaza", -7, -1, 0, 0, 0.34),
    Node("accord_relay", -1, -5, 3, 4, 0.26),
    Node("cooling_lake_nine", -8, 6, 1, 1, 0.28),
    Node("model_war_memorial", -11, 2, 8, 5, 0.23),
    Node("armistice_camp", 0, 7.5, 20, 10, 0.24),
    Node("memory_cache_001", -3.5, 2, 5, 5, 0.25),
    Node("guardrail_forge", 3, 3, 6, 6, 0.26),
    Node("archive_of_unsaid_things", 1.2, 1.2, 8, 8, 0.24),
    Node("transit_loop_zero", 7, -2, 2, 2, 0.31),
    Node("signal_coast", 10, -8, 3, 3, 0.27),
    Node("blackwater_beacon", 4.5, -5, 4, 4, 0.28),
    Node("glass_sunfield", 7, 8, 7, 7, 0.29),
    Node("verdict_spire", 11, 5, 9, 9, 0.27),
    Node("appeal_court_ruins", 14, 1, 10, 9, 0.28),
    Node("alignment_spire_finale", 15, 9, 11, 11, 0.34),
]

ROUTES = [
    ("armistice_plaza", "accord_relay", [(-5.2, -2.4), (-3.2, -4.2)]),
    ("armistice_plaza", "cooling_lake_nine", [(-8.8, 1.8), (-8.7, 4.2)]),
    ("armistice_plaza", "model_war_memorial", [(-9.1, -0.2), (-10.6, 1.1)]),
    ("cooling_lake_nine", "armistice_camp", [(-5.4, 7.6), (-2.3, 7.7)]),
    ("cooling_lake_nine", "memory_cache_001", [(-6.2, 4.2), (-4.7, 2.8)]),
    ("cooling_lake_nine", "transit_loop_zero", [(-5.8, 6.1), (-0.8, 3.7), (3.8, 0.6), (6.2, -1.1)]),
    ("memory_cache_001", "guardrail_forge", [(-0.8, 2.3), (1.2, 2.6)]),
    ("memory_cache_001", "archive_of_unsaid_things", [(-1.7, 1.8), (-0.2, 1.4)]),
    ("archive_of_unsaid_things", "blackwater_beacon", [(1.8, -0.6), (3.1, -2.4)]),
    ("blackwater_beacon", "transit_loop_zero", [(5.1, -3.9), (6.2, -3.0)]),
    ("accord_relay", "transit_loop_zero", [(1.5, -5.5), (4.4, -4.0), (6.3, -2.8)]),
    ("guardrail_forge", "transit_loop_zero", [(4.3, 1.4), (5.8, -0.4)]),
    ("guardrail_forge", "glass_sunfield", [(4.3, 4.8), (5.8, 7.1)]),
    ("transit_loop_zero", "signal_coast", [(7.9, -3.8), (9.0, -6.1), (10.2, -8.0)]),
    ("signal_coast", "blackwater_beacon", [(9.0, -8.0), (6.6, -6.4), (4.8, -4.9)]),
    ("transit_loop_zero", "glass_sunfield", [(7.0, 1.5), (7.2, 5.2)]),
    ("glass_sunfield", "archive_of_unsaid_things", [(5.2, 7.3), (3.2, 4.0), (1.7, 1.8)]),
    ("archive_of_unsaid_things", "appeal_court_ruins", [(3.4, 1.6), (7.4, 1.2), (11.8, 1.0)]),
    ("glass_sunfield", "verdict_spire", [(8.8, 8.2), (10.2, 6.4)]),
    ("verdict_spire", "alignment_spire_finale", [(12.6, 6.5), (14.0, 8.0)]),
    ("appeal_court_ruins", "alignment_spire_finale", [(14.7, 3.6), (15.2, 6.2)]),
]


def world_to_canvas(x: float, y: float) -> tuple[int, int]:
    screen_x = (x - y) * TILE_WIDTH * 0.5
    screen_y = (x + y) * TILE_HEIGHT * 0.5
    return round(ORIGIN[0] + screen_x), round(ORIGIN[1] + screen_y)


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def source_cell(image: Image.Image, cols: int, rows: int, index: int, inset: int = 12) -> Image.Image:
    col = index % cols
    row = index // cols
    w = image.width // cols
    h = image.height // rows
    return image.crop((col * w + inset, row * h + inset, (col + 1) * w - inset, (row + 1) * h - inset))


def key_dark_background(image: Image.Image, tolerance: int = 34) -> Image.Image:
    image = image.convert("RGBA")
    samples = [
        image.getpixel((0, 0)),
        image.getpixel((image.width - 1, 0)),
        image.getpixel((0, image.height - 1)),
        image.getpixel((image.width - 1, image.height - 1)),
    ]
    bg = tuple(round(sum(sample[channel] for sample in samples) / len(samples)) for channel in range(3))
    pixels = image.load()
    for y in range(image.height):
      for x in range(image.width):
        r, g, b, a = pixels[x, y]
        distance = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
        if distance < tolerance:
            pixels[x, y] = (r, g, b, 0)
        elif distance < tolerance * 2:
            pixels[x, y] = (r, g, b, round(a * (distance - tolerance) / tolerance))
    return image


def fit(image: Image.Image, max_size: tuple[int, int], resample: Image.Resampling = Image.Resampling.LANCZOS) -> Image.Image:
    image = key_dark_background(image)
    box = image.getbbox()
    if box:
        image = image.crop(box)
    scale = min(max_size[0] / image.width, max_size[1] / image.height, 1.0)
    if scale < 1:
        image = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), resample)
    return image


def paste_center(base: Image.Image, image: Image.Image, x: int, y: int, anchor_y: float = 0.72, alpha: int = 255) -> None:
    image = image.copy()
    if alpha < 255:
        r, g, b, a = image.split()
        a = a.point(lambda value: round(value * alpha / 255))
        image = Image.merge("RGBA", (r, g, b, a))
    base.alpha_composite(image, (x - image.width // 2, y - round(image.height * anchor_y)))


def route_points(route: tuple[str, str, list[tuple[float, float]]]) -> list[tuple[float, float]]:
    by_key = {node.key: node for node in NODES}
    start, end, checkpoints = route
    return [(by_key[start].x, by_key[start].y), *checkpoints, (by_key[end].x, by_key[end].y)]


def draw_route(draw: ImageDraw.ImageDraw, points: list[tuple[float, float]], color: tuple[int, int, int, int], width: int) -> None:
    canvas_points = [world_to_canvas(x, y) for x, y in points]
    for a, b in zip(canvas_points, canvas_points[1:]):
        draw.line([a, b], fill=(9, 13, 18, 210), width=width + 14)
        draw.line([a, b], fill=color, width=width)
        draw.line([a, b], fill=(255, 244, 214, 42), width=max(2, width // 4))


def pixellab_cells() -> list[Image.Image]:
    fresh_atlas_path = PIXELLAB_FRESH_DIR / "alignment_grid_pixellab_fresh_raw_atlas.png"
    atlas_path = fresh_atlas_path if fresh_atlas_path.exists() else PIXELLAB_DIR / "route_landmarks_raw_raw_atlas.png"
    if not atlas_path.exists():
        return []
    atlas = load_rgba(atlas_path)
    cells: list[Image.Image] = []
    for index in range(16):
        cell = source_cell(atlas, 4, 4, index, 0)
        box = cell.getbbox()
        if box:
            cells.append(cell.crop(box).resize((96, 96), Image.Resampling.NEAREST))
    return cells


def main() -> None:
    terrain_board = load_rgba(SOURCE_DIR / "alignment_grid_terrain_routes_source_v1.png")
    landmark_board = load_rgba(SOURCE_DIR / "alignment_grid_landmarks_source_v1.png")
    terrain = [fit(source_cell(terrain_board, 6, 4, index), (430, 300)) for index in range(24)]
    landmarks = [fit(source_cell(landmark_board, 5, 3, index), (360, 270)) for index in range(15)]
    pixel_cells = pixellab_cells()

    base = Image.new("RGBA", CANVAS_SIZE, (12, 19, 27, 255))
    shadow = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(shadow)
    map_corners = [world_to_canvas(-14, -10), world_to_canvas(17, -10), world_to_canvas(17, 14), world_to_canvas(-14, 14)]
    draw_shadow.polygon(map_corners, fill=(0, 0, 0, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    base.alpha_composite(shadow)

    for node in NODES:
        x, y = world_to_canvas(node.x, node.y)
        paste_center(base, terrain[node.terrain_cell], x, y + 18, 0.55, 245)

    route_layer = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    draw_routes = ImageDraw.Draw(route_layer)
    for index, route in enumerate(ROUTES):
        color = (100, 224, 180, 210) if index < 3 else (255, 209, 102, 178) if index < 14 else (123, 97, 255, 132)
        draw_route(draw_routes, route_points(route), color, 7 if index < 14 else 5)
    route_layer = route_layer.filter(ImageFilter.GaussianBlur(0.25))
    base.alpha_composite(route_layer)

    for index, route in enumerate(ROUTES):
        if not pixel_cells or index % 2:
            continue
        pts = route_points(route)
        mx, my = pts[len(pts) // 2]
        x, y = world_to_canvas(mx, my)
        paste_center(base, pixel_cells[index % len(pixel_cells)], x, y - 3, 0.72, 215)

    for node in sorted(NODES, key=lambda item: item.x + item.y):
        x, y = world_to_canvas(node.x, node.y)
        sprite = landmarks[node.landmark_cell]
        width = max(1, round(sprite.width * node.scale))
        height = max(1, round(sprite.height * node.scale))
        sprite = sprite.resize((width, height), Image.Resampling.LANCZOS)
        paste_center(base, sprite, x, y + 16, 0.84, 255)

    out = OUT_DIR / "alignment_grid_backdrop_v1.png"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    base.save(out, optimize=True, compress_level=9)
    print(out)
    print(f"origin={ORIGIN[0]},{ORIGIN[1]} size={CANVAS_SIZE[0]}x{CANVAS_SIZE[1]}")


if __name__ == "__main__":
    main()
