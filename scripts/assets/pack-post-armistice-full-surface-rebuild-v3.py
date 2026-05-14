#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
CHATGPT_DIR = ROOT / "assets" / "concepts" / "chatgpt_refs" / "post_armistice_full_surface_rebuild_v3"
PIXELLAB_DIR = ROOT / "assets" / "concepts" / "pixellab_refs"
M50_TERRAIN = PIXELLAB_DIR / "m50_m51_replacement" / "m50_unknown_isometric_b_raw_raw_atlas.png"
TILE_WIDTH = 64
TILE_HEIGHT = 32


@dataclass(frozen=True)
class LevelSpec:
    key: str
    board_path: Path
    board_rows: int
    board_row: int
    ground_path: Path
    chunks_path: Path
    ground_size: tuple[int, int]
    ground_origin: tuple[int, int]
    bounds: tuple[float, float, float, float]
    frame_size: tuple[int, int]
    frames: int
    anchors: tuple[tuple[float, float], ...]
    lanes: tuple[tuple[float, float], ...]
    negative_spaces: tuple[tuple[float, float], ...]
    pixellab_paths: tuple[Path, ...] = ()
    extra_pixellab_cells: tuple[int, ...] = ()


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def save(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGBA").save(path, optimize=True, compress_level=9)


def save_quantized(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGBA").quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(path, optimize=True)


def alpha_crop(image: Image.Image) -> Image.Image:
    box = image.getbbox()
    return image.crop(box) if box else image


def set_alpha(image: Image.Image, alpha: int) -> Image.Image:
    if alpha >= 255:
        return image
    image = image.convert("RGBA")
    r, g, b, a = image.split()
    a = a.point(lambda value: round(value * alpha / 255))
    return Image.merge("RGBA", (r, g, b, a))


def feather_rect_edge(image: Image.Image, border: int = 18) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
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
                pixels[x, y] = (r, g, b, round(a * (0.04 + 0.96 * fade)))
    return image


def board_cell(image: Image.Image, cols: int, rows: int, col: int, row: int, inset: int = 18) -> Image.Image:
    cell_w = image.width // cols
    cell_h = image.height // rows
    return image.crop((col * cell_w + inset, row * cell_h + inset, (col + 1) * cell_w - inset, (row + 1) * cell_h - inset))


def fit_chunk(image: Image.Image, max_size: tuple[int, int], resample: Image.Resampling = Image.Resampling.LANCZOS) -> Image.Image:
    subject = alpha_crop(image.convert("RGBA"))
    if subject.width > max_size[0] or subject.height > max_size[1]:
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), resample)
    return feather_rect_edge(subject, 18)


def fit_frame(image: Image.Image, frame_size: tuple[int, int], max_size: tuple[int, int], anchor_y: float = 0.78) -> Image.Image:
    subject = alpha_crop(image.convert("RGBA"))
    if subject.width > max_size[0] or subject.height > max_size[1]:
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", frame_size, (0, 0, 0, 0))
    out.alpha_composite(subject, ((frame_size[0] - subject.width) // 2, int(frame_size[1] * anchor_y - subject.height)))
    return out


def world_to_canvas(spec: LevelSpec, world_x: float, world_y: float) -> tuple[int, int]:
    screen_x = (world_x - world_y) * TILE_WIDTH * 0.5
    screen_y = (world_x + world_y) * TILE_HEIGHT * 0.5
    return (round(spec.ground_origin[0] + screen_x), round(spec.ground_origin[1] + screen_y))


def paste_chunk(
    ground: Image.Image,
    spec: LevelSpec,
    chunk: Image.Image,
    world_x: float,
    world_y: float,
    scale: float,
    alpha: int = 255,
) -> None:
    width = max(1, round(chunk.width * scale))
    height = max(1, round(chunk.height * scale))
    resized = chunk.resize((width, height), Image.Resampling.LANCZOS)
    resized = set_alpha(resized, alpha)
    x, y = world_to_canvas(spec, world_x, world_y)
    ground.alpha_composite(resized, (x - resized.width // 2, y - round(resized.height * 0.62)))


def apply_outer_alpha(image: Image.Image, margin: int) -> Image.Image:
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


def hash_int(*values: int) -> int:
    value = 2166136261
    for item in values:
        value ^= item & 0xFFFFFFFF
        value = (value * 16777619) & 0xFFFFFFFF
    return value


def source_cells(spec: LevelSpec) -> list[Image.Image]:
    board = rgba(spec.board_path)
    large = spec.ground_size[0] > 5120
    max_size = (500, 318) if large else (430, 274)
    return [fit_chunk(board_cell(board, 6, spec.board_rows, col, spec.board_row), max_size) for col in range(6)]


def m50_pixellab_cells(indices: tuple[int, ...], max_size: tuple[int, int]) -> list[Image.Image]:
    if not M50_TERRAIN.exists():
        return []
    atlas = rgba(M50_TERRAIN)
    frames: list[Image.Image] = []
    for index in indices:
        col = index % 4
        row = index // 4
        raw = board_cell(atlas, 4, 4, col, row, 2)
        subject = alpha_crop(raw)
        if subject.width == 0 or subject.height == 0:
            continue
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.NEAREST)
        frames.append(feather_rect_edge(subject, 8))
    return frames


def pixellab_cells(spec: LevelSpec, max_size: tuple[int, int]) -> list[Image.Image]:
    frames: list[Image.Image] = []
    for path in spec.pixellab_paths:
        if not path.exists():
            continue
        subject = alpha_crop(rgba(path))
        if subject.width == 0 or subject.height == 0:
            continue
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.NEAREST)
        frames.append(feather_rect_edge(subject, 8))
    frames.extend(m50_pixellab_cells(spec.extra_pixellab_cells, max_size))
    if not frames:
        frames.extend(m50_pixellab_cells((0, 1, 2, 3), max_size))
    return frames


def interpolate_route(points: tuple[tuple[float, float], ...], spacing: float = 6.0) -> list[tuple[float, float]]:
    route: list[tuple[float, float]] = []
    for start, end in zip(points, points[1:]):
        sx, sy = start
        ex, ey = end
        distance = max(abs(ex - sx), abs(ey - sy))
        steps = max(1, round(distance / spacing))
        for step in range(steps):
            t = step / steps
            route.append((sx + (ex - sx) * t, sy + (ey - sy) * t))
    if points:
        route.append(points[-1])
    return route


def pack_terrain_chunks(spec: LevelSpec, cells: list[Image.Image], pixel_cells: list[Image.Image]) -> None:
    cols = 4 if spec.frames == 8 else 2
    rows = 2
    out = Image.new("RGBA", (cols * spec.frame_size[0], rows * spec.frame_size[1]), (0, 0, 0, 0))
    frames = [cells[0], cells[1], cells[2], cells[3], *pixel_cells, cells[4], cells[5]]
    for index in range(spec.frames):
        frame = fit_frame(
            frames[index % len(frames)],
            spec.frame_size,
            (round(spec.frame_size[0] * 0.82), round(spec.frame_size[1] * 0.70)),
            0.78,
        )
        out.alpha_composite(frame, ((index % cols) * spec.frame_size[0], (index // cols) * spec.frame_size[1]))
    save(spec.chunks_path, out)


def pack_authored_ground(spec: LevelSpec, cells: list[Image.Image], pixel_cells: list[Image.Image]) -> None:
    ground = Image.new("RGBA", spec.ground_size, (0, 0, 0, 0))
    min_x, max_x, min_y, max_y = spec.bounds
    large = spec.ground_size[0] > 5120
    base_step = 5.6 if large else 5.2
    base_cells = [cells[0], cells[0], cells[2], cells[3], cells[5]]
    y = min_y - 8
    row_index = 0
    while y <= max_y + 8:
        x = min_x - 10 + (base_step * 0.45 if row_index % 2 else 0)
        col_index = 0
        while x <= max_x + 10:
            h = hash_int(round(x * 10), round(y * 10), spec.board_row, col_index, row_index)
            chunk = base_cells[h % len(base_cells)]
            jitter_x = ((h >> 4) % 13 - 6) * 0.10
            jitter_y = ((h >> 8) % 13 - 6) * 0.09
            scale = (1.16 if large else 1.08) + (h % 7) * 0.025
            paste_chunk(ground, spec, chunk, x + jitter_x, y + jitter_y, scale, 198 + (h % 6) * 4)
            x += base_step
            col_index += 1
        y += base_step
        row_index += 1

    for index, (x, y) in enumerate(spec.negative_spaces):
        paste_chunk(ground, spec, cells[4], x, y, 2.45 if large else 2.02, 255)
        paste_chunk(ground, spec, cells[(index + 3) % len(cells)], x + 4.4, y - 3.0, 1.62 if large else 1.34, 238)

    for index, (x, y) in enumerate(interpolate_route(spec.lanes)):
        h = hash_int(index, spec.board_row, round(x * 10), round(y * 10))
        paste_chunk(ground, spec, cells[2 if index % 3 else 3], x, y, (2.05 if large else 1.72) + (h % 5) * 0.025, 255)

    for index, (x, y) in enumerate(spec.anchors):
        paste_chunk(ground, spec, cells[1], x, y, 2.85 if large else 2.34, 255)
        paste_chunk(ground, spec, cells[0], x + 3.4, y - 2.6, 1.92 if large else 1.58, 248)
        paste_chunk(ground, spec, cells[5], x - 4.2, y + 3.2, 1.82 if large else 1.48, 244)
        if pixel_cells:
            paste_chunk(ground, spec, pixel_cells[index % len(pixel_cells)], x + 0.8, y - 0.4, 0.58 if large else 0.50, 182)

    for index, (x, y) in enumerate(interpolate_route((*spec.anchors, *spec.negative_spaces), 9.0)):
        if not pixel_cells:
            continue
        h = hash_int(index, spec.board_row, 9191)
        if h % 3 == 0:
            paste_chunk(ground, spec, pixel_cells[h % len(pixel_cells)], x + ((h >> 5) % 5 - 2) * 0.9, y + ((h >> 9) % 5 - 2) * 0.7, 0.42, 154)

    save_quantized(spec.ground_path, apply_outer_alpha(ground, 230 if large else 190))


def raw_frame(folder: str, index: int) -> Path:
    return PIXELLAB_DIR / folder / "raw" / f"frame_{index}.png"


def archive_frame(index: int) -> Path:
    return PIXELLAB_DIR / "archive_court_refinement_v1" / "raw_frames" / f"archive_court_pixellab_frame_{index:02d}.png"


def specs() -> list[LevelSpec]:
    board_a = CHATGPT_DIR / "post_armistice_full_surface_board_a_cooling_transit_signal_blackwater_v3.png"
    board_b = CHATGPT_DIR / "post_armistice_full_surface_board_b_memory_guardrail_glass_v3.png"
    board_c = CHATGPT_DIR / "post_armistice_full_surface_board_c_archive_appeal_spire_v3.png"
    return [
        LevelSpec(
            "cooling",
            board_a,
            4,
            0,
            ROOT / "assets/tiles/cooling_lake_nine/authored_ground.png",
            ROOT / "assets/tiles/cooling_lake_nine/cooling_terrain_chunks_v1.png",
            (5120, 3072),
            (2560, 1536),
            (-36, 36, -34, 38),
            (384, 256),
            8,
            ((0, 0), (13, 11), (-18, 15), (8, -11), (-7, 8), (-13, 19), (25, 22)),
            ((0, 0), (-7, 8), (-18, 15), (-13, 19), (13, 11), (25, 22), (8, -11)),
            ((4, 6), (10, -12), (-20, 6), (20, 14), (-30, -10), (31, -2)),
            (
                PIXELLAB_DIR / "cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_01.png",
                PIXELLAB_DIR / "cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_02.png",
                PIXELLAB_DIR / "cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_03.png",
                PIXELLAB_DIR / "cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_04.png",
            ),
            (0, 1, 2, 8),
        ),
        LevelSpec(
            "transit",
            board_a,
            4,
            1,
            ROOT / "assets/tiles/transit_loop_zero/authored_ground.png",
            ROOT / "assets/tiles/transit_loop_zero/transit_terrain_chunks_v1.png",
            (5120, 3072),
            (2560, 1536),
            (-34, 36, -30, 32),
            (384, 256),
            8,
            ((-16, 1), (0, -8), (17, 5), (-2, 8), (8, -16), (23, -5)),
            ((-16, 1), (0, -8), (8, -16), (23, -5), (17, 5), (-2, 8), (-16, 1)),
            ((1, -2), (-2, 8), (8, -16), (22, -4), (27, 10)),
            (),
            (1, 5, 9, 13),
        ),
        LevelSpec(
            "signal",
            board_a,
            4,
            2,
            ROOT / "assets/tiles/signal_coast/authored_ground.png",
            ROOT / "assets/tiles/signal_coast/signal_terrain_chunks_v1.png",
            (5120, 3072),
            (2560, 1536),
            (-40, 42, -34, 36),
            (512, 320),
            4,
            ((-20, 5), (1, -8), (18, 6), (-8, -2), (8, 12), (26, -10), (36, 18)),
            ((-20, 5), (-8, -2), (1, -8), (9, -1), (18, 6), (26, -10), (36, 18)),
            ((-23, 14), (5, 10), (29, 17), (5, -14), (21, -6)),
            (),
            (2, 4, 6, 10),
        ),
        LevelSpec(
            "blackwater",
            board_a,
            4,
            3,
            ROOT / "assets/tiles/blackwater_beacon/authored_ground.png",
            ROOT / "assets/tiles/blackwater_beacon/blackwater_terrain_chunks_v1.png",
            (5120, 3072),
            (2560, 1536),
            (-46, 48, -38, 40),
            (512, 320),
            4,
            ((-24, 6), (0, -10), (20, 11), (-6, 1), (8, -2), (30, -12), (35, 22)),
            ((-24, 6), (-6, 1), (0, -10), (8, -2), (30, -12), (20, 11), (35, 22)),
            ((-25, 16), (4, 14), (31, 20), (4, -18), (35, 22), (-34, 14)),
            tuple(raw_frame("blackwater_beacon_refinement_v1", index) for index in (0, 1, 10, 14, 8, 13)),
            (2, 6, 10, 14),
        ),
        LevelSpec(
            "memory",
            board_b,
            3,
            0,
            ROOT / "assets/tiles/memory_cache/authored_ground.png",
            ROOT / "assets/tiles/memory_cache/memory_cache_terrain_chunks_v1.png",
            (7168, 4096),
            (3584, 2048),
            (-48, 50, -42, 44),
            (512, 320),
            8,
            ((-30, 4), (-13, -15), (6, 12), (10, -5), (29, -12), (36, 20), (-4, 2)),
            ((-30, 4), (-13, -15), (10, -5), (29, -12), (36, 20), (6, 12), (-4, 2), (-30, 4)),
            ((-4, -26), (12, 28), (8, -7), (21, 2), (29, -12), (-13, -15)),
            tuple(raw_frame("memory_cache_refinement_v1", index) for index in range(4)),
            (0, 4, 8, 12),
        ),
        LevelSpec(
            "guardrail",
            board_b,
            3,
            1,
            ROOT / "assets/tiles/guardrail_forge/authored_ground.png",
            ROOT / "assets/tiles/guardrail_forge/guardrail_forge_terrain_chunks_v1.png",
            (7168, 4096),
            (3584, 2048),
            (-48, 54, -42, 44),
            (512, 320),
            8,
            ((-28, 5), (-9, -16), (8, 13), (12, -4), (30, -8), (38, 20), (-2, 2)),
            ((-28, 5), (-9, -16), (12, -4), (30, -8), (38, 20), (8, 13), (-2, 2), (-28, 5)),
            ((-3, -27), (13, 29), (12, -4), (30, -8), (-9, -16)),
            tuple(raw_frame("guardrail_forge_refinement_v1", index) for index in range(4)),
            (1, 5, 9, 13),
        ),
        LevelSpec(
            "glass",
            board_b,
            3,
            2,
            ROOT / "assets/tiles/glass_sunfield/authored_ground.png",
            ROOT / "assets/tiles/glass_sunfield/glass_sunfield_terrain_chunks_v1.png",
            (7168, 4096),
            (3584, 2048),
            (-50, 56, -44, 46),
            (512, 320),
            8,
            ((-30, 4), (-12, -17), (8, 12), (13, -5), (31, -10), (40, 22), (-2, 2)),
            ((-30, 4), (-12, -17), (13, -5), (31, -10), (40, 22), (8, 12), (-2, 2), (-30, 4)),
            ((-3, -28), (14, 30), (13, -5), (31, -10), (8, 12)),
            tuple(raw_frame("glass_sunfield_refinement_v1", index) for index in (0, 1, 3, 12, 13)),
            (2, 6, 10, 14),
        ),
        LevelSpec(
            "archive",
            board_c,
            3,
            0,
            ROOT / "assets/tiles/archive_court/authored_ground.png",
            ROOT / "assets/tiles/archive_court/archive_court_terrain_chunks_v1.png",
            (7168, 4096),
            (3584, 2048),
            (-54, 58, -46, 48),
            (512, 320),
            8,
            ((-31, 4), (-13, -18), (8, 13), (14, -5), (32, -11), (42, 23), (-1, 2)),
            ((-31, 4), (-13, -18), (14, -5), (32, -11), (42, 23), (8, 13), (-1, 2), (-31, 4)),
            ((-4, -29), (14, 31), (-13, -18), (32, -11), (8, 13)),
            tuple(archive_frame(index) for index in (1, 4, 6, 10, 11, 15)),
            (3, 7, 11, 15),
        ),
        LevelSpec(
            "appeal",
            board_c,
            3,
            1,
            ROOT / "assets/tiles/appeal_court/authored_ground.png",
            ROOT / "assets/tiles/appeal_court/appeal_court_terrain_chunks_v1.png",
            (7168, 4096),
            (3584, 2048),
            (-58, 62, -48, 50),
            (512, 320),
            8,
            ((-34, 5), (-16, -21), (9, 15), (17, -5), (35, -13), (47, 25), (-2, 0)),
            ((-34, 5), (-16, -21), (17, -5), (35, -13), (47, 25), (9, 15), (-2, 0), (-34, 5)),
            ((-3, -33), (16, 34), (17, -5), (35, -13), (-16, -21)),
            (PIXELLAB_DIR / "appeal_court_refinement_v1/appeal_court_pixellab_source_frame_0.png",),
            (4, 8, 12, 15),
        ),
        LevelSpec(
            "spire",
            board_c,
            3,
            2,
            ROOT / "assets/tiles/alignment_spire/authored_ground.png",
            ROOT / "assets/tiles/alignment_spire/alignment_spire_terrain_chunks_v1.png",
            (7168, 4096),
            (3584, 2048),
            (-60, 66, -52, 54),
            (512, 320),
            8,
            ((-39, 2), (-20, -24), (4, 16), (18, -3), (38, -8), (49, 27), (-2, 1)),
            ((-39, 2), (-20, -24), (18, -3), (38, -8), (49, 27), (4, 16), (-2, 1), (-39, 2)),
            ((-4, -36), (16, 38), (-20, -24), (38, -8), (18, -3), (4, 16)),
            (
                PIXELLAB_DIR / "alignment_spire_finale_refinement_v1/alignment_spire_pixellab_object_0.png",
                PIXELLAB_DIR / "alignment_spire_finale_refinement_v1/alignment_spire_pixellab_object_1.png",
            ),
            (5, 9, 13, 15),
        ),
    ]


def main() -> None:
    for spec in specs():
        cells = source_cells(spec)
        pixel_cells = pixellab_cells(spec, (150, 100))
        pack_terrain_chunks(spec, cells, pixel_cells)
        pack_authored_ground(spec, cells, pixel_cells)
        print(f"rebuilt {spec.key} full-surface terrain from ChatGPT Images V3 + PixelLab sources")


if __name__ == "__main__":
    main()
