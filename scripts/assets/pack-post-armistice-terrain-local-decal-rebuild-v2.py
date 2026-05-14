#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = (
    ROOT
    / "assets"
    / "concepts"
    / "chatgpt_refs"
    / "post_armistice_terrain_local_decal_rebuild_v2"
    / "post_armistice_terrain_local_decal_atlas_source_v2.png"
)
TILE_WIDTH = 64
TILE_HEIGHT = 32


@dataclass(frozen=True)
class LevelSpec:
    key: str
    row: int
    ground_path: Path
    chunks_path: Path
    ground_size: tuple[int, int]
    ground_origin: tuple[int, int]
    frame_size: tuple[int, int]
    frames: int
    accent: tuple[int, int, int]
    pixellab_paths: tuple[Path, ...] = ()
    avoid_cells: tuple[int, ...] = ()


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
            if g > 124 and g - r > 42 and g - b > 34:
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
            elif g > r + 22 and g > b + 16:
                pixels[x, y] = (r, min(g, max(r, b) + 10), b, a)
    return image


def grid_cell(image: Image.Image, cols: int, rows: int, col: int, row: int, inset: int = 10) -> Image.Image:
    cell_w = image.width // cols
    cell_h = image.height // rows
    return image.crop((col * cell_w + inset, row * cell_h + inset, (col + 1) * cell_w - inset, (row + 1) * cell_h - inset))


def feather_rect_edge(image: Image.Image, border: int = 12) -> Image.Image:
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


def fit_subject(
    image: Image.Image,
    size: tuple[int, int],
    max_size: tuple[int, int],
    anchor_y: float = 0.74,
    resample: Image.Resampling = Image.Resampling.LANCZOS,
) -> Image.Image:
    subject = alpha_crop(clear_green_spill(remove_green_key(image)))
    if subject.width > max_size[0] or subject.height > max_size[1]:
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), resample)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.alpha_composite(subject, ((size[0] - subject.width) // 2, int(size[1] * anchor_y - subject.height)))
    return out


def row_cells(source: Image.Image, row: int) -> list[Image.Image]:
    return [
        feather_rect_edge(alpha_crop(clear_green_spill(remove_green_key(grid_cell(source, 4, 10, col, row)))), 10)
        for col in range(4)
    ]


def fit_for_ground(cell: Image.Image, max_size: tuple[int, int]) -> Image.Image:
    subject = alpha_crop(cell)
    if subject.width > max_size[0] or subject.height > max_size[1]:
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.LANCZOS)
    return feather_rect_edge(subject, 10)


def fit_transparent_for_ground(image: Image.Image, max_size: tuple[int, int]) -> Image.Image:
    subject = alpha_crop(image.convert("RGBA"))
    if subject.width > max_size[0] or subject.height > max_size[1]:
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.NEAREST)
    return feather_rect_edge(subject, 8)


def source_base_color(frames: list[Image.Image], fallback: tuple[int, int, int]) -> tuple[int, int, int, int]:
    samples: list[tuple[int, int, int]] = []
    for frame in frames:
        small = frame.resize((48, 32), Image.Resampling.BILINEAR).convert("RGBA")
        for r, g, b, a in small.getdata():
            if a > 128 and 38 < r + g + b < 650:
                samples.append((r, g, b))
    if not samples:
        return (*fallback, 255)
    samples.sort(key=lambda rgb: rgb[0] + rgb[1] + rgb[2])
    mid = samples[len(samples) // 2]
    return (max(4, mid[0] - 10), max(8, mid[1] - 8), max(12, mid[2] - 6), 255)


def world_to_canvas(spec: LevelSpec, world_x: float, world_y: float) -> tuple[int, int]:
    screen_x = (world_x - world_y) * TILE_WIDTH * 0.5
    screen_y = (world_x + world_y) * TILE_HEIGHT * 0.5
    return (round(spec.ground_origin[0] + screen_x), round(spec.ground_origin[1] + screen_y))


def paste_chunk(ground: Image.Image, spec: LevelSpec, chunk: Image.Image, world_x: float, world_y: float, scale: float, alpha: int) -> None:
    width = max(1, round(chunk.width * scale))
    height = max(1, round(chunk.height * scale))
    resized = chunk.resize((width, height), Image.Resampling.LANCZOS)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    x, y = world_to_canvas(spec, world_x, world_y)
    ground.alpha_composite(resized, (x - resized.width // 2, y - round(resized.height * 0.6)))


def apply_outer_alpha(image: Image.Image, margin: int = 190) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
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


def pixellab_cells(spec: LevelSpec, max_size: tuple[int, int]) -> list[Image.Image]:
    frames: list[Image.Image] = []
    for path in spec.pixellab_paths:
        if path.exists():
            image = rgba(path)
            corners = [
                image.getpixel((0, 0))[3],
                image.getpixel((image.width - 1, 0))[3],
                image.getpixel((0, image.height - 1))[3],
                image.getpixel((image.width - 1, image.height - 1))[3],
            ]
            if min(corners) < 16:
                frames.append(fit_transparent_for_ground(image, max_size))
    return frames


def pack_terrain_chunks(spec: LevelSpec, source_cells: list[Image.Image], pixels: list[Image.Image]) -> None:
    cols = 4 if spec.frames == 8 else 2
    rows = 2
    out = Image.new("RGBA", (cols * spec.frame_size[0], rows * spec.frame_size[1]), (0, 0, 0, 0))
    frames = [*source_cells, *pixels]
    if not frames:
        frames = source_cells
    for index in range(spec.frames):
        cell = frames[index % len(frames)]
        frame = fit_subject(cell, spec.frame_size, (round(spec.frame_size[0] * 0.56), round(spec.frame_size[1] * 0.52)), 0.74)
        out.alpha_composite(frame, ((index % cols) * spec.frame_size[0], (index // cols) * spec.frame_size[1]))
    save(spec.chunks_path, out)


def pack_authored_ground(spec: LevelSpec, source_cells: list[Image.Image], pixels: list[Image.Image]) -> None:
    ground_max = (300, 186) if spec.ground_size[0] > 5120 else (270, 168)
    terrain_cells = [fit_for_ground(cell, ground_max) for index, cell in enumerate(source_cells) if index not in spec.avoid_cells]
    if not terrain_cells:
        terrain_cells = [fit_for_ground(cell, ground_max) for cell in source_cells]
    terrain_cells.extend(pixels)
    ground = Image.new("RGBA", spec.ground_size, (*spec.accent, 255))
    large = spec.ground_size[0] > 5120
    step_x = 3.45 if large else 3.25
    step_y = 3.35 if large else 3.15
    columns = 31 if large else 28
    rows = 28 if large else 28
    start_x = -(columns - 1) * step_x * 0.5
    start_y = -(rows - 1) * step_y * 0.5
    for yi in range(rows):
        for xi in range(columns):
            x = start_x + xi * step_x + (0.55 if yi % 2 else 0)
            y = start_y + yi * step_y
            h = abs(((xi + 193) * 1103515245) ^ ((yi - 277) * 12345) ^ (spec.row * 6113))
            chunk = terrain_cells[h % len(terrain_cells)]
            jitter_x = ((h >> 4) % 9 - 4) * 0.16
            jitter_y = ((h >> 8) % 9 - 4) * 0.15
            scale = 0.82 + (h % 7) * 0.032
            alpha = 196 + (h % 6) * 8
            paste_chunk(ground, spec, chunk, x + jitter_x, y + jitter_y, scale, alpha)
    anchors = [
        (0, 0, 1.04, 255),
        (10, -8, 1.0, 242),
        (-12, 10, 1.0, 242),
        (17, 12, 0.92, 230),
        (-20, -8, 0.92, 230),
        (24, -14, 0.86, 220),
        (-26, 18, 0.86, 220),
    ]
    for index, (x, y, scale, alpha) in enumerate(anchors):
        paste_chunk(ground, spec, terrain_cells[index % len(terrain_cells)], x, y, scale, alpha)
    save(spec.ground_path, apply_outer_alpha(ground, 230 if large else 190))


def raw_frame(folder: str, index: int) -> Path:
    return ROOT / "assets" / "concepts" / "pixellab_refs" / folder / "raw" / f"frame_{index}.png"


def archive_frame(index: int) -> Path:
    return ROOT / "assets" / "concepts" / "pixellab_refs" / "archive_court_refinement_v1" / "raw_frames" / f"archive_court_pixellab_frame_{index:02d}.png"


def specs() -> list[LevelSpec]:
    return [
        LevelSpec("cooling", 0, ROOT / "assets/tiles/cooling_lake_nine/authored_ground.png", ROOT / "assets/tiles/cooling_lake_nine/cooling_terrain_chunks_v1.png", (5120, 3072), (2560, 1536), (384, 256), 8, (24, 48, 54), (ROOT / "assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_01.png", ROOT / "assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_02.png")),
        LevelSpec("transit", 1, ROOT / "assets/tiles/transit_loop_zero/authored_ground.png", ROOT / "assets/tiles/transit_loop_zero/transit_terrain_chunks_v1.png", (5120, 3072), (2560, 1536), (384, 256), 8, (48, 45, 36)),
        LevelSpec("signal", 2, ROOT / "assets/tiles/signal_coast/authored_ground.png", ROOT / "assets/tiles/signal_coast/signal_terrain_chunks_v1.png", (5120, 3072), (2560, 1536), (512, 320), 4, (34, 47, 54)),
        LevelSpec("blackwater", 3, ROOT / "assets/tiles/blackwater_beacon/authored_ground.png", ROOT / "assets/tiles/blackwater_beacon/blackwater_terrain_chunks_v1.png", (5120, 3072), (2560, 1536), (512, 320), 4, (24, 48, 50), tuple(raw_frame("blackwater_beacon_refinement_v1", i) for i in (0, 1, 10, 14)), (0, 3)),
        LevelSpec("memory", 4, ROOT / "assets/tiles/memory_cache/authored_ground.png", ROOT / "assets/tiles/memory_cache/memory_cache_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, (56, 50, 43), tuple(raw_frame("memory_cache_refinement_v1", i) for i in range(4))),
        LevelSpec("guardrail", 5, ROOT / "assets/tiles/guardrail_forge/authored_ground.png", ROOT / "assets/tiles/guardrail_forge/guardrail_forge_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, (52, 42, 35), tuple(raw_frame("guardrail_forge_refinement_v1", i) for i in range(4))),
        LevelSpec("glass", 6, ROOT / "assets/tiles/glass_sunfield/authored_ground.png", ROOT / "assets/tiles/glass_sunfield/glass_sunfield_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, (42, 61, 65), tuple(raw_frame("glass_sunfield_refinement_v1", i) for i in (0, 1, 3))),
        LevelSpec("archive", 7, ROOT / "assets/tiles/archive_court/authored_ground.png", ROOT / "assets/tiles/archive_court/archive_court_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, (54, 56, 52), tuple(archive_frame(i) for i in (1, 4, 6, 10, 11, 15))),
        LevelSpec("appeal", 8, ROOT / "assets/tiles/appeal_court/authored_ground.png", ROOT / "assets/tiles/appeal_court/appeal_court_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, (54, 49, 45), (ROOT / "assets/concepts/pixellab_refs/appeal_court_refinement_v1/appeal_court_pixellab_source_frame_0.png",)),
        LevelSpec("spire", 9, ROOT / "assets/tiles/alignment_spire/authored_ground.png", ROOT / "assets/tiles/alignment_spire/alignment_spire_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, (40, 32, 60), (ROOT / "assets/concepts/pixellab_refs/alignment_spire_finale_refinement_v1/alignment_spire_pixellab_object_0.png", ROOT / "assets/concepts/pixellab_refs/alignment_spire_finale_refinement_v1/alignment_spire_pixellab_object_1.png")),
    ]


def main() -> None:
    source = rgba(SOURCE)
    for spec in specs():
        cells = row_cells(source, spec.row)
        pixels = pixellab_cells(spec, (260, 160))
        pack_terrain_chunks(spec, cells, pixels)
        pack_authored_ground(spec, cells, pixels)
        print(f"rebuilt {spec.key} terrain from local decal atlas")


if __name__ == "__main__":
    main()
