#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "armistice_source_rebuild_v2"
GROUND_SIZE = (4352, 2432)
GROUND_ORIGIN = (2176, 1216)
TILE_WIDTH = 64
TILE_HEIGHT = 32


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def save(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True, compress_level=9)


def alpha_crop(image: Image.Image) -> Image.Image:
    box = image.getbbox()
    return image.crop(box) if box else image


def world_to_canvas(world_x: float, world_y: float) -> tuple[int, int]:
    screen_x = (world_x - world_y) * TILE_WIDTH * 0.5
    screen_y = (world_x + world_y) * TILE_HEIGHT * 0.5
    return (round(GROUND_ORIGIN[0] + screen_x), round(GROUND_ORIGIN[1] + screen_y))


def remove_green_key(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
      for x in range(image.width):
        r, g, b, a = pixels[x, y]
        if a == 0:
            continue
        if (g > 118 and g - r > 52 and g - b > 42) or (g > 78 and g - r > 34 and g - b > 26):
            pixels[x, y] = (0, 0, 0, 0)
    return image


def clear_transparent_rgb(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
      for x in range(image.width):
        r, g, b, a = pixels[x, y]
        if a < 8:
            pixels[x, y] = (0, 0, 0, 0)
        elif g > r + 24 and g > b + 18:
            pixels[x, y] = (r, min(g, max(r, b) + 12), b, a)
    return image


def remove_connected_dark_backdrop(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    queued: list[tuple[int, int]] = []
    seen = set()

    def is_backdrop(x: int, y: int) -> bool:
        r, g, b, a = pixels[x, y]
        if a == 0:
            return True
        luminance = (r + g + b) / 3
        chroma = max(r, g, b) - min(r, g, b)
        return luminance < 112 and chroma < 38

    for x in range(width):
        queued.append((x, 0))
        queued.append((x, height - 1))
    for y in range(height):
        queued.append((0, y))
        queued.append((width - 1, y))

    while queued:
        x, y = queued.pop()
        if (x, y) in seen or x < 0 or y < 0 or x >= width or y >= height:
            continue
        seen.add((x, y))
        if not is_backdrop(x, y):
            continue
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        queued.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return image


def soften_alpha_edge(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    r, g, b, a = image.split()
    a = a.filter(ImageFilter.GaussianBlur(0.55))
    return Image.merge("RGBA", (r, g, b, a))


def feather_chunk_border(image: Image.Image, border: int = 42) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    if width <= 2 or height <= 2:
        return image
    border = max(1, min(border, width // 3, height // 3))
    pixels = image.load()
    for y in range(height):
        edge_y = min(y, height - 1 - y)
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            edge_x = min(x, width - 1 - x)
            edge = min(edge_x, edge_y)
            if edge >= border:
                continue
            t = edge / border
            eased = t * t * (3 - 2 * t)
            pixels[x, y] = (r, g, b, round(a * (0.16 + 0.84 * eased)))
    return image


def fit_subject(image: Image.Image, size: tuple[int, int], max_size: tuple[int, int], anchor_y: float = 0.72) -> Image.Image:
    subject = alpha_crop(image)
    subject.thumbnail(max_size, Image.Resampling.LANCZOS)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - subject.width) // 2
    y = int(size[1] * anchor_y - subject.height)
    out.alpha_composite(subject, (x, y))
    return out


def crop_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    image = image.convert("RGBA")
    source_ratio = image.width / image.height
    target_ratio = size[0] / size[1]
    if source_ratio > target_ratio:
        new_w = int(image.height * target_ratio)
        left = (image.width - new_w) // 2
        image = image.crop((left, 0, left + new_w, image.height))
    else:
        new_h = int(image.width / target_ratio)
        top = (image.height - new_h) // 2
        image = image.crop((0, top, image.width, top + new_h))
    return image.resize(size, Image.Resampling.LANCZOS)


def grid_cell(image: Image.Image, cols: int, rows: int, col: int, row: int, inset: int = 8) -> Image.Image:
    cell_w = image.width // cols
    cell_h = image.height // rows
    return image.crop((
        col * cell_w + inset,
        row * cell_h + inset,
        (col + 1) * cell_w - inset,
        (row + 1) * cell_h - inset,
    ))


def pack_authored_ground() -> None:
    # The old broad authored sheets stay out of the visible terrain. Start from
    # a flat safety base, then build the whole playable floor from accepted
    # high-fidelity source pieces so low-fidelity underpaint cannot show through.
    ground = Image.new("RGBA", GROUND_SIZE, (31, 34, 32, 255))

    prop_extension_path = SOURCE / "terrain_prop_extension_atlas_source_v7.png"
    if prop_extension_path.exists():
        ground = compose_full_floor_from_prop_extensions_v7(ground, rgba(prop_extension_path))

    plate_source_path = SOURCE / "terrain_interconnect_plate_atlas_source_v6.png"
    strip_source_path = SOURCE / "terrain_transition_strips_source_v6.png"
    if not plate_source_path.exists():
        plate_source_path = SOURCE / "terrain_interconnect_plate_atlas_source_v5.png"
    if not strip_source_path.exists():
        strip_source_path = SOURCE / "terrain_transition_strips_source_v5.png"
    if plate_source_path.exists() and strip_source_path.exists():
        ground = compose_interconnected_terrain_v5(ground, rgba(plate_source_path), rgba(strip_source_path))
    else:
        chunk_source_path = SOURCE / "terrain_chunk_atlas_source_v3.png"
        if chunk_source_path.exists():
            ground = compose_terrain_chunks_v3(ground, rgba(chunk_source_path))
    if prop_extension_path.exists():
        ground = compose_prop_extension_terrain_v7(ground, rgba(prop_extension_path))
    ground = apply_irregular_outer_silhouette(ground)
    save(ROOT / "assets" / "tiles" / "armistice_plaza" / "authored_ground.png", ground)


def compose_interconnected_terrain_v5(ground: Image.Image, plate_source: Image.Image, strip_source: Image.Image) -> Image.Image:
    plates = {
        "civic": terrain_plate_v5_cell(plate_source, 0, 0),
        "asphalt": terrain_plate_v5_cell(plate_source, 1, 0),
        "rubble": terrain_plate_v5_cell(plate_source, 2, 0),
        "terminal": terrain_plate_v5_cell(plate_source, 3, 0),
        "breach": terrain_plate_v5_cell(plate_source, 0, 1),
        "roadDamage": terrain_plate_v5_cell(plate_source, 1, 1),
        "stoneAsphalt": terrain_plate_v5_cell(plate_source, 2, 1),
        "terminalBreach": terrain_plate_v5_cell(plate_source, 3, 1),
    }
    strips = {
        "stoneAsphalt": terrain_strip_v5_cell(strip_source, 0, 0),
        "asphaltRubble": terrain_strip_v5_cell(strip_source, 1, 0),
        "terminalStone": terrain_strip_v5_cell(strip_source, 2, 0),
        "breachStone": terrain_strip_v5_cell(strip_source, 0, 1),
        "barricadeRoad": terrain_strip_v5_cell(strip_source, 1, 1),
        "droneYard": terrain_strip_v5_cell(strip_source, 2, 1),
    }
    plate_placements: list[tuple[str, float, float, float, int]] = [
        ("civic", -2.2, -1.0, 1.18, 255),
        ("civic", 0.2, 4.8, 1.08, 248),
        ("stoneAsphalt", 4.8, -2.0, 1.08, 248),
        ("stoneAsphalt", 2.8, 1.8, 1.12, 250),
        ("stoneAsphalt", 6.0, 8.2, 1.06, 246),
        ("asphalt", 7.5, -5.8, 1.08, 255),
        ("asphalt", 10.0, 0.8, 1.02, 246),
        ("terminal", 9.5, -0.2, 1.08, 255),
        ("terminal", 12.8, 6.6, 0.96, 214),
        ("rubble", -6.8, 2.7, 1.16, 255),
        ("rubble", -1.8, 7.8, 1.08, 248),
        ("roadDamage", -4.8, 6.4, 1.04, 252),
        ("roadDamage", 3.8, 9.6, 1.02, 248),
        ("breach", -13.6, 11.0, 1.14, 255),
        ("terminalBreach", 3.0, 12.2, 1.02, 250),
        ("terminalBreach", 8.2, 14.2, 1.02, 246),
        ("civic", -12.5, -7.5, 1.03, 248),
        ("civic", -6.2, -4.8, 1.0, 242),
        ("asphalt", 14.0, -10.5, 1.06, 252),
        ("asphalt", 20.5, -14.5, 1.04, 248),
        ("roadDamage", 25.8, -10.2, 0.98, 242),
        ("asphalt", 19.0, -3.2, 0.98, 242),
        ("stoneAsphalt", 15.6, -14.8, 0.96, 238),
        ("terminal", 18.2, 16.0, 1.0, 218),
        ("stoneAsphalt", 22.0, 9.8, 0.96, 224),
        ("roadDamage", 25.2, 2.6, 0.88, 214),
        ("rubble", -18.5, -12.8, 1.06, 252),
        ("breach", -21.0, 18.0, 1.08, 252),
        ("stoneAsphalt", 12.6, 5.4, 0.98, 238),
        ("stoneAsphalt", 17.0, 3.4, 0.92, 232),
        ("roadDamage", 20.6, -6.8, 0.92, 238),
        ("roadDamage", 23.0, 4.4, 0.92, 232),
        ("roadDamage", 14.0, -14.0, 1.02, 246),
        ("roadDamage", 21.0, -7.0, 1.02, 246),
        ("stoneAsphalt", 14.8, -8.8, 0.98, 232),
        ("stoneAsphalt", 20.8, -13.4, 0.94, 226),
        ("terminalBreach", 14.6, 18.8, 0.98, 238),
        ("terminalBreach", 19.4, 20.5, 0.88, 210),
        ("rubble", -22.0, 5.2, 0.92, 236),
        ("civic", 5.8, 16.2, 0.96, 236),
        ("civic", 10.8, 18.4, 0.88, 226),
    ]
    strip_placements: list[tuple[str, float, float, float, int]] = [
        ("stoneAsphalt", -0.2, -4.8, 1.0, 235),
        ("stoneAsphalt", 1.8, 2.8, 1.06, 236),
        ("stoneAsphalt", 7.0, -9.2, 1.06, 238),
        ("stoneAsphalt", 14.2, -13.2, 1.0, 234),
        ("stoneAsphalt", 8.4, 9.6, 0.96, 230),
        ("asphaltRubble", -8.2, -8.2, 1.02, 238),
        ("asphaltRubble", -4.2, 1.4, 1.0, 236),
        ("asphaltRubble", 3.6, 5.4, 0.96, 228),
        ("asphaltRubble", 8.8, 11.8, 0.92, 226),
        ("terminalStone", 8.8, 4.0, 1.0, 238),
        ("terminalStone", 15.4, 11.6, 0.94, 232),
        ("terminalStone", 19.2, 6.4, 0.88, 224),
        ("terminalStone", 24.6, -1.6, 0.86, 222),
        ("breachStone", -12.0, 15.0, 1.06, 242),
        ("breachStone", -4.6, 14.0, 0.92, 230),
        ("breachStone", 2.4, 16.6, 0.9, 226),
        ("barricadeRoad", -7.2, 8.4, 0.98, 236),
        ("barricadeRoad", 18.2, -2.8, 0.86, 224),
        ("barricadeRoad", 24.0, -8.0, 0.88, 224),
        ("barricadeRoad", 18.8, 8.0, 0.88, 224),
        ("barricadeRoad", 14.0, -14.0, 1.08, 248),
        ("barricadeRoad", 21.0, -7.0, 1.08, 248),
        ("barricadeRoad", 17.2, -11.0, 0.98, 236),
        ("droneYard", -13.6, -6.0, 0.94, 232),
        ("droneYard", -1.0, 8.8, 0.9, 226),
        ("droneYard", 11.0, 13.2, 0.86, 222),
    ]
    for key, world_x, world_y, scale, alpha in plate_placements:
        paste_terrain_chunk(ground, plates[key], world_x, world_y, scale, alpha)
    for key, world_x, world_y, scale, alpha in strip_placements:
        paste_terrain_chunk(ground, strips[key], world_x, world_y, scale, alpha)
    return ground


def compose_prop_extension_terrain_v7(ground: Image.Image, source: Image.Image) -> Image.Image:
    cells = {
        "civicCircle": terrain_prop_extension_v7_cell(source, 0, 0),
        "stoneAsphalt": terrain_prop_extension_v7_cell(source, 1, 0),
        "rubble": terrain_prop_extension_v7_cell(source, 2, 0),
        "terminalStone": terrain_prop_extension_v7_cell(source, 3, 0),
        "darkDroneYard": terrain_prop_extension_v7_cell(source, 0, 1),
        "barricadeRoad": terrain_prop_extension_v7_cell(source, 1, 1),
        "breachStone": terrain_prop_extension_v7_cell(source, 2, 1),
        "connectiveRubble": terrain_prop_extension_v7_cell(source, 3, 1),
    }
    placements: list[tuple[str, float, float, float, int]] = [
        ("civicCircle", -0.4, 0.0, 0.98, 218),
        ("civicCircle", 1.2, 2.0, 0.82, 170),
        ("stoneAsphalt", -0.6, 0.0, 1.18, 238),
        ("stoneAsphalt", 2.8, 3.8, 1.02, 218),
        ("connectiveRubble", -2.4, 4.8, 1.12, 226),
        ("connectiveRubble", 5.8, 6.8, 1.0, 214),
        ("rubble", -6.4, 2.4, 1.14, 238),
        ("darkDroneYard", -12.0, -5.4, 1.04, 232),
        ("darkDroneYard", -6.0, -0.6, 0.96, 210),
        ("terminalStone", 8.8, -0.4, 1.08, 238),
        ("terminalStone", 12.8, 3.8, 0.94, 214),
        ("barricadeRoad", -5.4, 7.2, 1.06, 232),
        ("barricadeRoad", 15.0, -13.2, 1.1, 236),
        ("barricadeRoad", 21.6, -7.2, 1.06, 232),
        ("connectiveRubble", 16.4, -2.0, 1.0, 214),
        ("connectiveRubble", 22.8, 4.6, 0.96, 208),
        ("breachStone", -12.8, 13.4, 1.04, 224),
        ("breachStone", -5.0, 13.2, 0.9, 202),
        ("stoneAsphalt", 7.6, 10.4, 0.96, 214),
        ("terminalStone", 15.2, 12.6, 0.92, 206),
        ("connectiveRubble", -18.2, -11.8, 1.0, 224),
        ("rubble", -21.0, 5.6, 0.94, 214),
        ("barricadeRoad", 25.2, -9.8, 0.9, 206),
    ]
    for key, world_x, world_y, scale, alpha in placements:
        paste_terrain_chunk(ground, cells[key], world_x, world_y, scale, alpha)
    return ground


def compose_full_floor_from_prop_extensions_v7(ground: Image.Image, source: Image.Image) -> Image.Image:
    cells = {
        "stoneAsphalt": terrain_prop_extension_v7_cell(source, 1, 0),
        "rubble": terrain_prop_extension_v7_cell(source, 2, 0),
        "terminalStone": terrain_prop_extension_v7_cell(source, 3, 0),
        "darkDroneYard": terrain_prop_extension_v7_cell(source, 0, 1),
        "barricadeRoad": terrain_prop_extension_v7_cell(source, 1, 1),
        "breachStone": terrain_prop_extension_v7_cell(source, 2, 1),
        "connectiveRubble": terrain_prop_extension_v7_cell(source, 3, 1),
    }
    keys = [
        "connectiveRubble",
        "stoneAsphalt",
        "rubble",
        "darkDroneYard",
        "barricadeRoad",
        "terminalStone",
    ]
    for row, world_y in enumerate([y * 3.2 - 30.4 for y in range(20)]):
        for col, world_x in enumerate([x * 3.8 - 34.2 for x in range(20)]):
            offset_x = ((row % 2) * 1.9) + (((col * 17 + row * 11) % 9) - 4) * 0.2
            offset_y = (((col * 13 + row * 7) % 9) - 4) * 0.18
            key = keys[(col * 3 + row * 5 + (col * row) % 4) % len(keys)]
            if world_x < -13 and world_y > 8:
                key = "breachStone" if (col + row) % 3 else "connectiveRubble"
            elif world_x > 7 and world_y > -5:
                key = "terminalStone" if (col + row) % 2 else "stoneAsphalt"
            elif world_x > 10 and world_y < -6:
                key = "barricadeRoad"
            elif world_x < -6 and world_y < 0:
                key = "darkDroneYard" if (col + row) % 2 else "rubble"
            scale = 1.02 + ((col * 19 + row * 23) % 9) * 0.026
            alpha = 246 + ((col * 5 + row * 7) % 10)
            paste_terrain_chunk(ground, cells[key], world_x + offset_x, world_y + offset_y, scale, alpha)
    return ground


def terrain_prop_extension_v7_cell(source: Image.Image, col: int, row: int) -> Image.Image:
    cell = grid_cell(source, 4, 2, col, row, 20)
    cell = remove_green_key(cell)
    cell = alpha_crop(cell)
    return soften_alpha_edge(feather_chunk_border(cell, 48))


def terrain_plate_v5_cell(source: Image.Image, col: int, row: int) -> Image.Image:
    cell = grid_cell(source, 4, 2, col, row, 20)
    cell = remove_green_key(cell)
    cell = alpha_crop(cell)
    return soften_alpha_edge(feather_chunk_border(cell, 44))


def terrain_strip_v5_cell(source: Image.Image, col: int, row: int) -> Image.Image:
    cell = grid_cell(source, 3, 2, col, row, 22)
    cell = remove_green_key(cell)
    cell = alpha_crop(cell)
    return soften_alpha_edge(feather_chunk_border(cell, 38))


def compose_terrain_plates_v4(ground: Image.Image, plate_source: Image.Image) -> Image.Image:
    cells = {
        "civic": terrain_plate_cell(plate_source, 0, 0),
        "asphaltCivic": terrain_plate_cell(plate_source, 1, 0),
        "rubbleCivic": terrain_plate_cell(plate_source, 2, 0),
        "terminalStone": terrain_plate_cell(plate_source, 3, 0),
        "bossBreach": terrain_plate_cell(plate_source, 0, 1),
        "barricadeRoad": terrain_plate_cell(plate_source, 1, 1),
        "openLane": terrain_plate_cell(plate_source, 2, 1),
        "terminalBreach": terrain_plate_cell(plate_source, 3, 1),
    }
    placements: list[tuple[str, float, float, float, int]] = [
        ("civic", 0, 0, 1.08, 132),
        ("openLane", 1.2, 1.2, 1.02, 116),
        ("asphaltCivic", 7.8, -5.8, 1.04, 142),
        ("barricadeRoad", -4.7, 6.2, 0.9, 150),
        ("rubbleCivic", -6.5, 2.5, 0.94, 158),
        ("terminalStone", 9.2, -0.4, 0.88, 148),
        ("terminalStone", 18, 16, 1.0, 160),
        ("terminalBreach", 8.6, 10.4, 0.92, 122),
        ("bossBreach", 2.5, -3.5, 0.9, 124),
        ("bossBreach", -21, 18, 1.02, 155),
        ("rubbleCivic", -18, -13, 0.96, 150),
        ("asphaltCivic", 17, -10, 0.98, 152),
        ("barricadeRoad", 21, -7, 0.82, 132),
        ("rubbleCivic", 6, 12, 0.82, 125),
        ("terminalBreach", -10, 17, 0.84, 132),
    ]
    for key, world_x, world_y, scale, alpha in placements:
        paste_terrain_chunk(ground, cells[key], world_x, world_y, scale, alpha)
    return ground


def terrain_plate_cell(source: Image.Image, col: int, row: int) -> Image.Image:
    cell = grid_cell(source, 4, 2, col, row, 20)
    cell = remove_green_key(cell)
    cell = alpha_crop(cell)
    return soften_alpha_edge(soften_alpha_edge(cell))


def compose_terrain_chunks_v3(ground: Image.Image, chunk_source: Image.Image) -> Image.Image:
    cells = {
        "civic": terrain_chunk_cell(chunk_source, 0, 0),
        "asphalt": terrain_chunk_cell(chunk_source, 1, 0),
        "rubble": terrain_chunk_cell(chunk_source, 2, 0),
        "terminal": terrain_chunk_cell(chunk_source, 3, 0),
        "breach": terrain_chunk_cell(chunk_source, 0, 1),
        "stoneAsphalt": terrain_chunk_cell(chunk_source, 2, 1),
        "terminalBreach": terrain_chunk_cell(chunk_source, 3, 1),
    }
    placements: list[tuple[str, float, float, float, int]] = [
        ("civic", 0, 0, 1.24, 255),
        ("civic", -6.5, 4.6, 0.88, 230),
        ("civic", 7.5, 6.5, 0.78, 210),
        ("asphalt", -18, -13, 1.08, 242),
        ("asphalt", 12, -10, 1.1, 242),
        ("asphalt", 22, 1.5, 0.86, 220),
        ("rubble", -6.5, 2.5, 1.18, 255),
        ("rubble", -18, -13, 0.98, 238),
        ("rubble", -22, 5, 0.9, 225),
        ("rubble", 4, 18, 0.82, 212),
        ("terminal", 9.2, -0.4, 1.08, 255),
        ("terminal", 18, 16, 1.1, 255),
        ("terminal", 24, 11, 0.84, 218),
        ("breach", -13.5, 11.2, 1.16, 255),
        ("breach", -21, 18, 1.2, 255),
        ("breach", -3, 22, 0.88, 216),
        ("stoneAsphalt", -8, -8, 1.0, 236),
        ("stoneAsphalt", 8, -15, 1.02, 236),
        ("stoneAsphalt", 14, 5, 0.92, 220),
        ("stoneAsphalt", -16, 10, 0.88, 215),
        ("terminalBreach", 2, 13, 0.96, 226),
        ("terminalBreach", -10, 17, 0.95, 232),
        ("terminalBreach", 15, 19, 0.88, 210),
    ]
    for key, world_x, world_y, scale, alpha in placements:
        paste_terrain_chunk(ground, cells[key], world_x, world_y, scale, alpha)
    return ground


def terrain_chunk_cell(source: Image.Image, col: int, row: int) -> Image.Image:
    cell = grid_cell(source, 4, 2, col, row, 24)
    cell = remove_connected_dark_backdrop(cell)
    cell = alpha_crop(cell)
    return soften_alpha_edge(cell)


def paste_terrain_chunk(ground: Image.Image, chunk: Image.Image, world_x: float, world_y: float, scale: float, alpha: int) -> None:
    width = max(1, round(chunk.width * scale))
    height = max(1, round(chunk.height * scale))
    resized = clear_transparent_rgb(chunk).resize((width, height), Image.Resampling.NEAREST)
    resized = clear_transparent_rgb(resized)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    x, y = world_to_canvas(world_x, world_y)
    ground.alpha_composite(resized, (x - resized.width // 2, y - resized.height // 2))


def canvas_to_world(x: int, y: int) -> tuple[float, float]:
    sx = x - GROUND_ORIGIN[0]
    sy = y - GROUND_ORIGIN[1]
    world_x = sy / TILE_HEIGHT + sx / TILE_WIDTH
    world_y = sy / TILE_HEIGHT - sx / TILE_WIDTH
    return (world_x, world_y)


def edge_noise(x: int, y: int) -> float:
    value = (x * 73856093) ^ (y * 19349663)
    value = (value ^ (value >> 13)) * 1274126177
    return ((value & 0xffff) / 0xffff) * 2 - 1


def apply_irregular_outer_silhouette(ground: Image.Image) -> Image.Image:
    image = ground.convert("RGBA")
    pixels = image.load()
    min_world = -31.6
    max_world = 31.6
    hard_margin = 2.4
    soft_margin = 5.2
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            world_x, world_y = canvas_to_world(x, y)
            n = edge_noise(x // 18, y // 18)
            side_min_x = world_x - (min_world + n * 1.15)
            side_min_y = world_y - (min_world + edge_noise(x // 21 + 37, y // 21) * 1.15)
            side_max_x = (max_world + edge_noise(x // 17, y // 17 + 71) * 1.15) - world_x
            side_max_y = (max_world + edge_noise(x // 19 + 19, y // 19 + 43) * 1.15) - world_y
            edge_distance = min(side_min_x, side_min_y, side_max_x, side_max_y)
            if edge_distance <= -0.2:
                pixels[x, y] = (0, 0, 0, 0)
                continue
            if edge_distance < soft_margin:
                t = max(0.0, min(1.0, (edge_distance - hard_margin) / max(0.1, soft_margin - hard_margin)))
                if t <= 0:
                    keep = 0.22 + max(0.0, edge_distance + 0.2) * 0.55
                else:
                    keep = 0.22 + 0.78 * (t * t * (3 - 2 * t))
                chip = edge_noise(x // 7 + 11, y // 7 + 29)
                if edge_distance < hard_margin and chip > -0.12:
                    keep *= 0.28
                pixels[x, y] = (r, g, b, round(a * max(0.0, min(1.0, keep))))
    return image


def pack_prop_grounding_decals() -> None:
    source = rgba(SOURCE / "prop_grounding_decal_atlas_source_v1.png")
    atlas = Image.new("RGBA", (3 * 256, 2 * 160), (0, 0, 0, 0))
    for index in range(6):
        col = index % 3
        row = index // 3
        cell = remove_green_key(grid_cell(source, 3, 2, col, row, 14))
        frame = fit_subject(cell, (256, 160), (240, 142), 0.72)
        atlas.alpha_composite(frame, (col * 256, row * 160))
    save(ROOT / "assets" / "tiles" / "armistice_plaza" / "prop_grounding_decals_v2.png", atlas)


def pack_boss_event_decals() -> None:
    source = rgba(SOURCE / "oath_eater_event_decal_atlas_source_v1.png")
    atlas = Image.new("RGBA", (4 * 256, 2 * 160), (0, 0, 0, 0))
    for index in range(8):
        col = index % 4
        row = index // 4
        cell = remove_green_key(grid_cell(source, 4, 2, col, row, 14))
        max_size = (244, 146) if index in {2, 4, 5} else (218, 136)
        frame = fit_subject(cell, (256, 160), max_size, 0.72)
        atlas.alpha_composite(frame, (col * 256, row * 160))
    boss_rebuild = SOURCE / "oath_eater_boss_rebuild_source_v4.png"
    if not boss_rebuild.exists():
        boss_rebuild = SOURCE / "oath_eater_boss_rebuild_source_v3.png"
    if boss_rebuild.exists():
        rebuild = rgba(boss_rebuild)
        replacements = {
            0: (0, 1, (244, 142), 0.74),  # corruption pool becomes irregular root contact
            3: (2, 1, (232, 132), 0.72),  # oath particles/root veins
            5: (2, 1, (236, 134), 0.72),  # breach tendrils
            6: (3, 1, (236, 136), 0.72),  # impact fracture
        }
        for index, (col, row, max_size, anchor_y) in replacements.items():
            cell = clear_transparent_rgb(remove_green_key(grid_cell(rebuild, 4, 2, col, row, 24)))
            frame = fit_subject(cell, (256, 160), max_size, anchor_y)
            frame = clear_transparent_rgb(frame)
            atlas.alpha_composite(frame, ((index % 4) * 256, (index // 4) * 160))
    save(ROOT / "assets" / "sprites" / "effects" / "oath_eater_event_decals_v2.png", atlas)


def pack_oath_eater_boss_rebuild() -> None:
    source_path = SOURCE / "oath_eater_boss_rebuild_source_v4.png"
    if not source_path.exists():
        source_path = SOURCE / "oath_eater_boss_rebuild_source_v3.png"
    if not source_path.exists():
        return
    source = rgba(source_path)
    boss_frame_size = 224
    sheet = Image.new("RGBA", (4 * boss_frame_size, boss_frame_size), (0, 0, 0, 0))
    # The V4 side-lurch cells were fully padded, but in motion their side
    # silhouettes still read like a rectangular crop. Use the centered/front
    # source cells for all runtime frames until a cleaner dedicated side-lurch
    # source exists.
    runtime_cols = [0, 1, 0, 1]
    for frame_col, source_col in enumerate(runtime_cols):
        cell = clear_transparent_rgb(remove_green_key(grid_cell(source, 4, 2, source_col, 0, 20)))
        frame = fit_subject(cell, (boss_frame_size, boss_frame_size), (172, 166), 0.88)
        frame = clear_transparent_rgb(frame)
        sheet.alpha_composite(frame, (frame_col * boss_frame_size, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "oath_eater.png", sheet)

    portrait_cell = clear_transparent_rgb(remove_green_key(grid_cell(source, 4, 2, 1, 0, 20)))
    portrait = fit_subject(portrait_cell, (160, 144), (154, 138), 0.94)
    portrait = clear_transparent_rgb(portrait)
    save(ROOT / "assets" / "portraits" / "oath_eater_title_card.png", portrait)


def pack_combat_channels() -> None:
    source = rgba(SOURCE / "combat_channel_atlas_source_v1.png")
    selected_cells = {
        0: (1, 0),  # projectile
        1: (1, 1),  # impact small
        2: (1, 1),  # impact medium
        3: (1, 1),  # impact large
        4: (0, 1),  # pickup sparkle small
        5: (0, 1),  # pickup sparkle medium
        6: (0, 1),  # pickup sparkle large
        7: (8 % 5, 8 // 5),  # refusal aura / boss pulse
        8: (4, 1),  # damage badge
        9: (1, 0),  # projectile trail
    }
    atlas = Image.new("RGBA", (10 * 32, 32), (0, 0, 0, 0))
    for out_index, (col, row) in selected_cells.items():
        cell = remove_green_key(grid_cell(source, 5, 2, col, row, 10))
        frame = fit_subject(cell, (32, 32), (30, 30), 0.72)
        atlas.alpha_composite(frame, (out_index * 32, 0))
    save(ROOT / "assets" / "sprites" / "effects" / "combat_effects_v1.png", atlas)


def pack_enemy_motion() -> None:
    source = rgba(SOURCE / "enemy_motion_source_board_v1.png")
    benchmark_detail_source = SOURCE / "enemy_benchmark_gremlin" / "benchmark_gremlin_detail_source_v1.png"
    benchmark_source = rgba(benchmark_detail_source) if benchmark_detail_source.exists() else None
    rows = [
        ("bad_outputs_sheet.png", 0, (58, 58)),
        ("benchmark_gremlins_sheet.png", 1, (60, 60)),
        ("context_rot_crabs_sheet.png", 2, (62, 56)),
    ]
    for filename, row, max_size in rows:
        sheet = Image.new("RGBA", (4 * 64, 64), (0, 0, 0, 0))
        for col in range(4):
            if filename == "benchmark_gremlins_sheet.png" and benchmark_source is not None:
                cell = remove_green_key(grid_cell(benchmark_source, 4, 1, col, 0, 24))
            else:
                cell = remove_green_key(grid_cell(source, 4, 3, col, row, 12))
            frame = fit_subject(cell, (64, 64), max_size, 0.86)
            if filename == "benchmark_gremlins_sheet.png":
                frame = solidify_monitor_enemy_opacity(frame)
                frame = add_monitor_enemy_readability_outline(frame)
            sheet.alpha_composite(frame, (col * 64, 0))
        save(ROOT / "assets" / "sprites" / "enemies" / filename, sheet)


def remap_monitor_enemy_to_dirty_white(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            # Keep cyan status lights and violet corruption accents, but lift
            # the monitor body/legs into a bright white material read.
            if b > 105 and g > 78 and r < 95:
                pixels[x, y] = (min(120, r + 18), min(215, g + 18), min(230, b + 20), a)
                continue
            if r > 95 and b > 95 and g < 85:
                pixels[x, y] = (min(210, r + 20), min(95, g + 6), min(230, b + 16), a)
                continue
            luminance = (r * 0.299 + g * 0.587 + b * 0.114)
            if luminance < 54:
                pixels[x, y] = (104, 104, 98, a)
            elif luminance < 96:
                pixels[x, y] = (198, 196, 184, a)
            elif luminance < 142:
                pixels[x, y] = (236, 232, 216, a)
            else:
                pixels[x, y] = (255, 252, 236, a)
    return image


def solidify_monitor_enemy_opacity(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if a < 96:
                pixels[x, y] = (r, g, b, 0)
            else:
                pixels[x, y] = (r, g, b, max(a, 245))
    return image


def add_monitor_enemy_readability_outline(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    expanded = alpha.filter(ImageFilter.MaxFilter(3))
    outline_alpha = Image.new("L", image.size, 0)
    outline_pixels = outline_alpha.load()
    alpha_pixels = alpha.load()
    expanded_pixels = expanded.load()
    for y in range(image.height):
        for x in range(image.width):
            if expanded_pixels[x, y] > 0 and alpha_pixels[x, y] == 0:
                outline_pixels[x, y] = min(210, expanded_pixels[x, y])
    outline = Image.new("RGBA", image.size, (20, 24, 24, 0))
    outline.putalpha(outline_alpha)
    outline.alpha_composite(image)
    return outline


def main() -> None:
    pack_authored_ground()
    pack_prop_grounding_decals()
    pack_oath_eater_boss_rebuild()
    pack_boss_event_decals()
    pack_combat_channels()
    pack_enemy_motion()


if __name__ == "__main__":
    main()
