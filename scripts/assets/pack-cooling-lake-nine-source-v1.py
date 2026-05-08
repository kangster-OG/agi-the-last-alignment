#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "cooling_lake_nine_source_v1"
PIXELLAB_SOURCE = ROOT / "assets" / "concepts" / "pixellab_refs" / "cooling_lake_nine_refinement_v1"
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
            if (g > 118 and g - r > 48 and g - b > 38) or (g > 80 and g - r > 32 and g - b > 24):
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
            elif g > r + 20 and g > b + 14:
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


def fit_transparent_subject(
    image: Image.Image,
    size: tuple[int, int],
    max_size: tuple[int, int],
    anchor_y: float,
    allow_upscale: bool = False,
    resample: Image.Resampling = Image.Resampling.LANCZOS,
) -> Image.Image:
    subject = alpha_crop(image.convert("RGBA"))
    if allow_upscale:
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((round(subject.width * scale), round(subject.height * scale)), resample)
    else:
        subject.thumbnail(max_size, resample)
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


def pack_grid_source(source_name: str, out_path: Path, cols: int, rows: int, frame_size: tuple[int, int], max_size: tuple[int, int], anchor_y: float) -> None:
    source = rgba(SOURCE / source_name)
    out = Image.new("RGBA", (cols * frame_size[0], rows * frame_size[1]), (0, 0, 0, 0))
    for row in range(rows):
        for col in range(cols):
            frame = fit_subject(grid_cell(source, cols, rows, col, row), frame_size, max_size, anchor_y)
            out.alpha_composite(frame, (col * frame_size[0], row * frame_size[1]))
    save(out_path, out)


def cooling_terrain_frames() -> list[Image.Image]:
    pixellab_flat_terrain = [
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_03.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_04.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_02.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_01.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_03.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_01.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_04.png",
        PIXELLAB_SOURCE / "terrain_flat_pixellab_v3_02.png",
    ]
    if all(path.exists() for path in pixellab_flat_terrain):
        return [
            fit_transparent_subject(rgba(path), (384, 256), (286, 188), 0.8, allow_upscale=True, resample=Image.Resampling.NEAREST)
            for path in pixellab_flat_terrain
        ]
    pixellab_terrain = [
        PIXELLAB_SOURCE / "terrain_iso_pixellab_v2_a_02.png",
        PIXELLAB_SOURCE / "terrain_iso_pixellab_v2_a_03.png",
        PIXELLAB_SOURCE / "terrain_iso_pixellab_v2_a_04.png",
        PIXELLAB_SOURCE / "terrain_iso_pixellab_v2_a_01.png",
        PIXELLAB_SOURCE / "terrain_iso_pixellab_v2_a_02.png",
        PIXELLAB_SOURCE / "terrain_iso_pixellab_v2_a_01.png",
        PIXELLAB_SOURCE / "terrain_iso_pixellab_v2_a_03.png",
        PIXELLAB_SOURCE / "terrain_iso_pixellab_v2_a_04.png",
    ]
    if all(path.exists() for path in pixellab_terrain):
        return [
            fit_transparent_subject(rgba(path), (384, 256), (328, 216), 0.84, allow_upscale=True, resample=Image.Resampling.NEAREST)
            for path in pixellab_terrain
        ]
    source = rgba(SOURCE / "cooling_terrain_source_v1.png")
    frames: list[Image.Image] = []
    for row in range(2):
        for col in range(4):
            frames.append(fit_subject(grid_cell(source, 4, 2, col, row), (384, 256), (360, 228), 0.78))
    return frames


def place_ground_chunk(ground: Image.Image, chunk: Image.Image, world_x: float, world_y: float, scale: float, alpha: int = 255) -> None:
    resized = chunk.resize((round(chunk.width * scale), round(chunk.height * scale)), Image.Resampling.NEAREST)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    cx, cy = world_to_canvas(world_x, world_y)
    ground.alpha_composite(resized, (cx - resized.width // 2, cy - round(resized.height * 0.78)))


def pack_authored_ground() -> None:
    frames = cooling_terrain_frames()
    dry, coolant, rack_floor, cable, dry_island, walkway, electric_shore, eel_basin = frames
    ground = Image.new("RGBA", GROUND_SIZE, (9, 17, 23, 255))
    placements: list[tuple[Image.Image, float, float, float, int]] = []
    base_frames = [dry, dry, dry, dry_island, rack_floor]
    for y in range(-36, 41, 4):
        for x in range(-38, 39, 5):
            hash_value = abs(((x + 101) * 1103515245) ^ ((y - 73) * 12345))
            index = hash_value % len(base_frames)
            scale = 1.02 + (hash_value % 5) * 0.024
            placements.append((base_frames[index], x + ((hash_value >> 3) % 3 - 1) * 0.42, y + ((hash_value >> 5) % 3 - 1) * 0.34, scale, 230 + (hash_value % 5) * 4))
    placements.extend(
        [
            (dry_island, 0, 0, 1.34, 255),
            (dry_island, 13, 11, 1.28, 255),
            (dry_island, -18, 15, 1.3, 255),
            (coolant, -4, 7, 1.42, 255),
            (coolant, 8, -11, 1.46, 255),
            (coolant, -20, 6, 1.12, 232),
            (coolant, 20, 14, 1.1, 230),
            (coolant, -30, -10, 1.05, 220),
            (coolant, 31, -2, 1.05, 220),
            (electric_shore, 10, 6, 1.26, 248),
            (electric_shore, -12, 12, 1.24, 248),
            (cable, -7, 8, 1.08, 250),
            (walkway, -7, 8, 1.0, 228),
            (rack_floor, 8, -11, 1.2, 248),
            (rack_floor, 13, 11, 1.1, 238),
            (rack_floor, -18, 15, 1.12, 238),
            (eel_basin, -13, 19, 1.46, 255),
            (coolant, 25, 22, 1.18, 234),
            (cable, 20, 24, 0.98, 226),
            (walkway, -26, 18, 0.98, 220),
            (electric_shore, -18, 20, 1.14, 240),
            (cable, 4, -16, 0.92, 218),
            (cable, -28, -4, 0.9, 212),
            (cable, 30, 4, 0.9, 212),
        ]
    )
    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(ground, chunk, world_x, world_y, scale, alpha)
    save_quantized(ROOT / "assets" / "tiles" / "cooling_lake_nine" / "authored_ground.png", apply_outer_alpha(ground))


def pack_actor_sources() -> None:
    source = rgba(SOURCE / "cooling_prompt_leech_eel_source_v1.png")
    leech_out = Image.new("RGBA", (6 * 96, 96), (0, 0, 0, 0))
    pixellab_leeches = [
        PIXELLAB_SOURCE / "prompt_leech_pixellab_v1_01.png",
        PIXELLAB_SOURCE / "prompt_leech_pixellab_v1_04.png",
        PIXELLAB_SOURCE / "prompt_leech_pixellab_v1_03.png",
        PIXELLAB_SOURCE / "prompt_leech_pixellab_v1_02.png",
        PIXELLAB_SOURCE / "prompt_leech_pixellab_v1_04.png",
        PIXELLAB_SOURCE / "prompt_leech_pixellab_v1_01.png",
    ]
    if all(path.exists() for path in pixellab_leeches):
        for col, path in enumerate(pixellab_leeches):
            leech_out.alpha_composite(fit_transparent_subject(rgba(path), (96, 96), (90, 88), 0.88), (col * 96, 0))
    else:
        top_h = int(source.height * 0.38)
        for col in range(6):
            cell_w = source.width // 6
            cell = source.crop((col * cell_w + 10, 10, (col + 1) * cell_w - 10, top_h))
            leech_out.alpha_composite(fit_subject(cell, (96, 96), (90, 78), 0.82), (col * 96, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "prompt_leeches_sheet.png", leech_out)

    eel_out = Image.new("RGBA", (4 * 256, 256), (0, 0, 0, 0))
    for col in range(4):
        cell_w = source.width // 4
        cell = source.crop((col * cell_w + 10, source.height // 2 - 6, (col + 1) * cell_w - 10, source.height - 10))
        eel_out.alpha_composite(fit_subject(cell, (256, 256), (220, 204), 0.86), (col * 256, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "motherboard_eel.png", eel_out)


def pack_prop_sources() -> None:
    out = Image.new("RGBA", (4 * 256, 2 * 224), (0, 0, 0, 0))
    pixellab_props = [
        PIXELLAB_SOURCE / "cooling_props_pixellab_v1_04.png",
        PIXELLAB_SOURCE / "cooling_props_pixellab_v1_04.png",
        PIXELLAB_SOURCE / "cooling_props_pixellab_v1_04.png",
        PIXELLAB_SOURCE / "cooling_props_pixellab_v1_04.png",
        PIXELLAB_SOURCE / "cooling_props_pixellab_v1_03.png",
        PIXELLAB_SOURCE / "cooling_props_pixellab_v1_03.png",
        PIXELLAB_SOURCE / "cooling_props_pixellab_v1_01.png",
    ]
    if all(path.exists() for path in pixellab_props):
        for index, path in enumerate(pixellab_props):
            frame = fit_transparent_subject(rgba(path), (256, 224), (218, 190), 0.9)
            out.alpha_composite(frame, ((index % 4) * 256, (index // 4) * 224))
        chatgpt_props = rgba(SOURCE / "cooling_props_objectives_source_v1.png")
        eel_marker = fit_subject(grid_cell(chatgpt_props, 4, 2, 3, 1), (256, 224), (238, 204), 0.86)
        out.alpha_composite(eel_marker, (3 * 256, 224))
        save(ROOT / "assets" / "props" / "cooling_lake_nine" / "cooling_props_objectives_v1.png", out)
        return
    pack_grid_source(
        "cooling_props_objectives_source_v1.png",
        ROOT / "assets" / "props" / "cooling_lake_nine" / "cooling_props_objectives_v1.png",
        4,
        2,
        (256, 224),
        (238, 204),
        0.86,
    )


def pack_terrain_sources() -> None:
    frames = cooling_terrain_frames()
    out = Image.new("RGBA", (4 * 384, 2 * 256), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 4) * 384, (index // 4) * 256))
    save(ROOT / "assets" / "tiles" / "cooling_lake_nine" / "cooling_terrain_chunks_v1.png", out)


def main() -> None:
    pack_authored_ground()
    pack_terrain_sources()
    pack_prop_sources()
    pack_actor_sources()
    pack_grid_source(
        "cooling_hazard_vfx_source_v1.png",
        ROOT / "assets" / "sprites" / "effects" / "cooling_hazard_vfx_v1.png",
        4,
        3,
        (192, 160),
        (178, 148),
        0.78,
    )


if __name__ == "__main__":
    main()
