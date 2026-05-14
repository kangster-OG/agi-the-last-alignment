#!/usr/bin/env python3
from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "post_armistice_terrain_rebuild_v1" / "post_armistice_terrain_rebuild_source_v2.png"
NEW_PIXELLAB = ROOT / "assets" / "concepts" / "pixellab_refs" / "post_armistice_terrain_rebuild_v1" / "raw"
TILE_WIDTH = 64
TILE_HEIGHT = 32


@dataclass(frozen=True)
class LevelSpec:
    key: str
    atlas_row: int
    ground_path: Path
    chunks_path: Path
    ground_size: tuple[int, int]
    ground_origin: tuple[int, int]
    frame_size: tuple[int, int]
    frames: int
    legacy_pixellab: tuple[Path, ...] = ()
    accent: tuple[int, int, int] = (88, 206, 196)


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


def border_key_color(image: Image.Image) -> tuple[int, int, int]:
    image = image.convert("RGBA")
    samples: list[tuple[int, int, int]] = []
    step = max(1, min(image.width, image.height) // 14)
    for x in range(0, image.width, step):
        for y in (0, image.height - 1):
            r, g, b, a = image.getpixel((x, y))
            if a > 8:
                samples.append((r, g, b))
    for y in range(0, image.height, step):
        for x in (0, image.width - 1):
            r, g, b, a = image.getpixel((x, y))
            if a > 8:
                samples.append((r, g, b))
    if not samples:
        return (0, 0, 0)
    samples.sort(key=lambda rgb: rgb[0] + rgb[1] + rgb[2])
    return samples[len(samples) // 2]


def remove_connected_background(image: Image.Image, tolerance: int = 74) -> Image.Image:
    image = image.convert("RGBA")
    bg = border_key_color(image)
    pixels = image.load()
    width, height = image.size
    bg_luma = sum(bg) / 3

    def near_bg(x: int, y: int) -> bool:
        r, g, b, a = pixels[x, y]
        if a < 10:
            return True
        distance = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
        luma = (r + g + b) / 3
        return distance < tolerance and luma < bg_luma + 44 and max(r, g, b) < 132

    queue: deque[tuple[int, int]] = deque()
    seen: set[tuple[int, int]] = set()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= width or y >= height or (x, y) in seen:
            continue
        seen.add((x, y))
        if not near_bg(x, y):
            continue
        pixels[x, y] = (0, 0, 0, 0)
        queue.append((x + 1, y))
        queue.append((x - 1, y))
        queue.append((x, y + 1))
        queue.append((x, y - 1))

    return image


def fit_subject(
    image: Image.Image,
    size: tuple[int, int],
    max_size: tuple[int, int],
    anchor_y: float,
    clean_background: bool = True,
    resample: Image.Resampling = Image.Resampling.LANCZOS,
) -> Image.Image:
    subject = image.convert("RGBA")
    if clean_background:
        subject = remove_connected_background(subject)
    subject = alpha_crop(subject)
    if subject.width > 0 and subject.height > 0:
        scale = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), resample)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.alpha_composite(subject, ((size[0] - subject.width) // 2, int(size[1] * anchor_y - subject.height)))
    return out


def source_row(source: Image.Image, row: int) -> Image.Image:
    row_h = source.height / 10
    top = round(row * row_h)
    bottom = round((row + 1) * row_h)
    return source.crop((0, max(0, top - 2), source.width, min(source.height, bottom + 2)))


def source_row_core(source: Image.Image, row: int) -> Image.Image:
    row_h = source.height / 10
    top = round(row * row_h)
    bottom = round((row + 1) * row_h)
    inset = max(2, round(row_h * 0.05))
    return source.crop((0, min(source.height - 1, top + inset), source.width, max(top + inset + 1, bottom - inset)))


def source_cell(source: Image.Image, row: int, index: int, count: int = 8) -> Image.Image:
    band = source_row_core(source, row)
    cell_w = band.width / count
    left = round(index * cell_w)
    right = round((index + 1) * cell_w)
    return band.crop((max(0, left - 8), 0, min(band.width, right + 8), band.height))


def world_to_canvas(spec: LevelSpec, world_x: float, world_y: float) -> tuple[int, int]:
    screen_x = (world_x - world_y) * TILE_WIDTH * 0.5
    screen_y = (world_x + world_y) * TILE_HEIGHT * 0.5
    return (round(spec.ground_origin[0] + screen_x), round(spec.ground_origin[1] + screen_y))


def tint_alpha(image: Image.Image, alpha: int) -> Image.Image:
    if alpha >= 255:
        return image.convert("RGBA")
    image = image.convert("RGBA")
    r, g, b, a = image.split()
    a = a.point(lambda value: round(value * alpha / 255))
    return Image.merge("RGBA", (r, g, b, a))


def apply_material_patch_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    if width <= 0 or height <= 0:
        return image
    for y in range(height):
        ny = abs(((y + 0.5) / height) - 0.58) * 2
        edge_y = min(y, height - 1 - y)
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            nx = abs(((x + 0.5) / width) - 0.5) * 2
            diamond = nx * 0.72 + ny * 0.96
            feather = min(1.0, edge_y / max(1, height * 0.06))
            if diamond >= 1.08:
                pixels[x, y] = (r, g, b, 0)
            elif diamond > 0.86:
                fade = max(0.0, min(1.0, (1.08 - diamond) / 0.22))
                pixels[x, y] = (r, g, b, round(a * fade * feather))
            else:
                pixels[x, y] = (r, g, b, round(a * feather))
    return image


def shifted_band(image: Image.Image, offset: int) -> Image.Image:
    image = image.convert("RGBA")
    offset %= image.width
    if offset == 0:
        return image
    out = Image.new("RGBA", image.size, (0, 0, 0, 0))
    out.alpha_composite(image.crop((offset, 0, image.width, image.height)), (0, 0))
    out.alpha_composite(image.crop((0, 0, offset, image.height)), (image.width - offset, 0))
    return out


def crop_wrapped_band(image: Image.Image, left: int, width: int) -> Image.Image:
    image = image.convert("RGBA")
    left %= image.width
    width = max(1, min(width, image.width))
    if left + width <= image.width:
        return image.crop((left, 0, left + width, image.height))
    out = Image.new("RGBA", (width, image.height), (0, 0, 0, 0))
    first = image.width - left
    out.alpha_composite(image.crop((left, 0, image.width, image.height)), (0, 0))
    out.alpha_composite(image.crop((0, 0, width - first, image.height)), (first, 0))
    return out


def feather_patch_edges(image: Image.Image, edge: int) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    edge = max(1, edge)
    for y in range(height):
        fy = min(1.0, y / edge, (height - 1 - y) / edge)
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            fx = min(1.0, x / edge, (width - 1 - x) / edge)
            fade = max(0.0, min(1.0, fx, fy))
            pixels[x, y] = (r, g, b, round(a * fade))
    return image


def material_patches(spec: LevelSpec, band: Image.Image) -> list[Image.Image]:
    patches: list[Image.Image] = []
    large = spec.ground_size[0] > 5120
    for index in range(14):
        h = abs(((index + 311) * 1103515245) ^ (spec.atlas_row * 99173))
        crop_w = (440 if large else 380) + (h % 5) * 54
        patch_w = (1120 if large else 900) + (h % 4) * (130 if large else 110)
        patch_h = (380 if large else 310) + ((h >> 3) % 4) * (38 if large else 32)
        crop = crop_wrapped_band(band, (h >> 6) % band.width, crop_w)
        if h & 1:
            crop = crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        patch = crop.resize((patch_w, patch_h), Image.Resampling.LANCZOS)
        patches.append(feather_patch_edges(patch, 66 if large else 54))
    return patches


def place_ground_chunk(spec: LevelSpec, ground: Image.Image, chunk: Image.Image, world_x: float, world_y: float, scale: float, alpha: int) -> None:
    resized = chunk.resize((max(1, round(chunk.width * scale)), max(1, round(chunk.height * scale))), Image.Resampling.LANCZOS)
    resized = tint_alpha(resized, alpha)
    cx, cy = world_to_canvas(spec, world_x, world_y)
    ground.alpha_composite(resized, (cx - resized.width // 2, cy - round(resized.height * 0.82)))


def source_base_color(frames: Iterable[Image.Image], fallback: tuple[int, int, int]) -> tuple[int, int, int, int]:
    samples: list[tuple[int, int, int]] = []
    for image in frames:
        small = image.convert("RGBA").resize((64, 40), Image.Resampling.BILINEAR)
        for r, g, b, a in small.getdata():
            if a > 128 and 34 < r + g + b < 620 and max(r, g, b) > 38:
                samples.append((r, g, b))
    if not samples:
        return (*fallback, 255)
    samples.sort(key=lambda rgb: rgb[0] + rgb[1] + rgb[2])
    mid = samples[len(samples) // 2]
    return (mid[0], mid[1], mid[2], 255)


def apply_outer_alpha(image: Image.Image, margin: int = 220) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
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


def new_pixellab_frames() -> list[Image.Image]:
    # The fresh PixelLab post-Armistice batch is preserved as source/proof, but
    # its current frames read as raised square terrain blocks. The runtime rebuild
    # therefore keeps using only the existing per-level PixelLab frames that were
    # already accepted as flat source contributions.
    return []


def legacy_pixellab_frames(spec: LevelSpec) -> list[Image.Image]:
    frames: list[Image.Image] = []
    for path in spec.legacy_pixellab:
        if path.exists():
            frames.append(rgba(path))
    return frames


def source_frames(spec: LevelSpec, source: Image.Image) -> list[Image.Image]:
    frames: list[Image.Image] = []
    max_size = (round(spec.frame_size[0] * 0.96), round(spec.frame_size[1] * 0.9))
    for index in range(spec.frames):
        frame = fit_subject(source_cell(source, spec.atlas_row, index % 8), spec.frame_size, max_size, 0.84, clean_background=False)
        frames.append(apply_material_patch_alpha(frame))
    return frames


def terrain_frames(spec: LevelSpec, source: Image.Image, pixel_frames: list[Image.Image]) -> list[Image.Image]:
    frames = source_frames(spec, source)

    # PixelLab remains a source-art contributor. When the new PixelLab batch is
    # available, it gets first priority; otherwise reuse the map's committed
    # PixelLab terrain/refinement source.
    pixel_source = pixel_frames or legacy_pixellab_frames(spec)
    for index, pixel in enumerate(pixel_source[: min(4, spec.frames)]):
        frames[(index * 2 + 1) % spec.frames] = fit_subject(
            pixel,
            spec.frame_size,
            (round(spec.frame_size[0] * 0.72), round(spec.frame_size[1] * 0.68)),
            0.78,
            clean_background=False,
            resample=Image.Resampling.NEAREST,
        )
    return frames


def pack_terrain_chunks(spec: LevelSpec, frames: list[Image.Image]) -> None:
    cols = 4 if spec.frames == 8 else 2
    rows = 2
    out = Image.new("RGBA", (cols * spec.frame_size[0], rows * spec.frame_size[1]), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % cols) * spec.frame_size[0], (index // cols) * spec.frame_size[1]))
    save(spec.chunks_path, out)


def pack_authored_ground(spec: LevelSpec, frames: list[Image.Image], pixel_frames: list[Image.Image], source: Image.Image) -> None:
    band = source_row_core(source, spec.atlas_row)
    base = source_base_color([band, *frames], spec.accent)
    ground = Image.new("RGBA", spec.ground_size, base)

    patches = material_patches(spec, band)
    large = spec.ground_size[0] > 5120
    step_x = 700 if large else 560
    step_y = 260 if large else 210
    for gy, y in enumerate(range(-step_y, spec.ground_size[1] + step_y, step_y)):
        for gx, x in enumerate(range(-step_x, spec.ground_size[0] + step_x, step_x)):
            h = abs(((gx + 19) * 1103515245) ^ ((gy - 41) * 12345) ^ (spec.atlas_row * 6673))
            patch = patches[h % len(patches)]
            alpha = 224 + (h % 4) * 7
            jitter_x = ((h >> 2) % 121) - 60
            jitter_y = ((h >> 5) % 73) - 36
            ground.alpha_composite(tint_alpha(patch, alpha), (x + jitter_x, y + jitter_y))

    world_half_w = (spec.ground_size[0] - spec.ground_origin[0]) / (TILE_WIDTH * 0.5)
    world_half_h = (spec.ground_size[1] - spec.ground_origin[1]) / (TILE_HEIGHT * 0.5)
    min_w = -min(world_half_w, world_half_h) + 4
    max_w = min(world_half_w, world_half_h) - 4

    placements: list[tuple[Image.Image, float, float, float, int]] = []
    step_x = 18 if spec.ground_size[0] <= 5120 else 21
    step_y = 16 if spec.ground_size[0] <= 5120 else 18
    for yi, y in enumerate(range(int(min_w), int(max_w) + 1, step_y)):
        for xi, x in enumerate(range(int(min_w), int(max_w) + 1, step_x)):
            h = abs(((x + 977) * 1103515245) ^ ((y - 443) * 12345) ^ (spec.atlas_row * 7919))
            frame = frames[h % len(frames)]
            jitter_x = ((h >> 4) % 5 - 2) * 0.38
            jitter_y = ((h >> 7) % 5 - 2) * 0.28
            scale = 1.28 + (h % 7) * 0.06
            alpha = 108 + (h % 8) * 5
            placements.append((frame, x + jitter_x, y + jitter_y, scale, alpha))

    anchors = [
        (-32, 4), (-14, -17), (7, 13), (14, -4), (31, -10), (40, 22),
        (-4, -30), (15, 30), (-2, 2), (24, 7), (0, 0), (10, -10),
    ]
    for index, (x, y) in enumerate(anchors):
        if abs(x) > max_w or abs(y) > max_w:
            continue
        placements.append((frames[index % len(frames)], x, y, 1.15 if index < 6 else 0.96, 252 if index < 6 else 236))

    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(spec, ground, chunk, world_x, world_y, scale, alpha)

    pixel_source = pixel_frames or legacy_pixellab_frames(spec)
    for index, pixel in enumerate(pixel_source[:8]):
        frame = fit_subject(
            pixel,
            (256, 160),
            (220, 130),
            0.78,
            clean_background=False,
            resample=Image.Resampling.NEAREST,
        )
        x, y = anchors[index % len(anchors)]
        if abs(x) <= max_w and abs(y) <= max_w:
            place_ground_chunk(spec, ground, frame, x + 2.4, y - 1.6, 0.92, 210)

    save_quantized(spec.ground_path, apply_outer_alpha(ground))


def raw_frame(folder: str, index: int) -> Path:
    return ROOT / "assets" / "concepts" / "pixellab_refs" / folder / "raw" / f"frame_{index}.png"


def archive_frame(index: int) -> Path:
    return ROOT / "assets" / "concepts" / "pixellab_refs" / "archive_court_refinement_v1" / "raw_frames" / f"archive_court_pixellab_frame_{index:02d}.png"


def specs() -> list[LevelSpec]:
    return [
        LevelSpec(
            "cooling",
            0,
            ROOT / "assets/tiles/cooling_lake_nine/authored_ground.png",
            ROOT / "assets/tiles/cooling_lake_nine/cooling_terrain_chunks_v1.png",
            (5120, 3072),
            (2560, 1536),
            (384, 256),
            8,
            (
                ROOT / "assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_01.png",
                ROOT / "assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_02.png",
                ROOT / "assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_03.png",
                ROOT / "assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/terrain_flat_pixellab_v3_04.png",
            ),
            (80, 170, 170),
        ),
        LevelSpec("transit", 1, ROOT / "assets/tiles/transit_loop_zero/authored_ground.png", ROOT / "assets/tiles/transit_loop_zero/transit_terrain_chunks_v1.png", (5120, 3072), (2560, 1536), (384, 256), 8, (), (158, 132, 84)),
        LevelSpec("signal", 2, ROOT / "assets/tiles/signal_coast/authored_ground.png", ROOT / "assets/tiles/signal_coast/signal_terrain_chunks_v1.png", (5120, 3072), (2560, 1536), (512, 320), 4, (), (92, 142, 152)),
        LevelSpec("blackwater", 3, ROOT / "assets/tiles/blackwater_beacon/authored_ground.png", ROOT / "assets/tiles/blackwater_beacon/blackwater_terrain_chunks_v1.png", (5120, 3072), (2560, 1536), (512, 320), 4, tuple(raw_frame("blackwater_beacon_refinement_v1", i) for i in (0, 1, 10, 14)), (85, 128, 138)),
        LevelSpec("memory", 4, ROOT / "assets/tiles/memory_cache/authored_ground.png", ROOT / "assets/tiles/memory_cache/memory_cache_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, tuple(raw_frame("memory_cache_refinement_v1", i) for i in range(4)), (120, 106, 82)),
        LevelSpec("guardrail", 5, ROOT / "assets/tiles/guardrail_forge/authored_ground.png", ROOT / "assets/tiles/guardrail_forge/guardrail_forge_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, tuple(raw_frame("guardrail_forge_refinement_v1", i) for i in range(4)), (150, 104, 56)),
        LevelSpec("glass", 6, ROOT / "assets/tiles/glass_sunfield/authored_ground.png", ROOT / "assets/tiles/glass_sunfield/glass_sunfield_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, tuple(raw_frame("glass_sunfield_refinement_v1", i) for i in (0, 1, 3)), (90, 132, 145)),
        LevelSpec("archive", 7, ROOT / "assets/tiles/archive_court/authored_ground.png", ROOT / "assets/tiles/archive_court/archive_court_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, tuple(archive_frame(i) for i in (1, 4, 6, 10, 11, 15)), (132, 115, 86)),
        LevelSpec("appeal", 8, ROOT / "assets/tiles/appeal_court/authored_ground.png", ROOT / "assets/tiles/appeal_court/appeal_court_terrain_chunks_v1.png", (7168, 4096), (3584, 2048), (512, 320), 8, (ROOT / "assets/concepts/pixellab_refs/appeal_court_refinement_v1/appeal_court_pixellab_source_frame_0.png",), (120, 111, 92)),
        LevelSpec(
            "spire",
            9,
            ROOT / "assets/tiles/alignment_spire/authored_ground.png",
            ROOT / "assets/tiles/alignment_spire/alignment_spire_terrain_chunks_v1.png",
            (7168, 4096),
            (3584, 2048),
            (512, 320),
            8,
            (
                ROOT / "assets/concepts/pixellab_refs/alignment_spire_finale_refinement_v1/alignment_spire_pixellab_object_0.png",
                ROOT / "assets/concepts/pixellab_refs/alignment_spire_finale_refinement_v1/alignment_spire_pixellab_object_1.png",
            ),
            (118, 88, 150),
        ),
    ]


def main() -> None:
    source = rgba(SOURCE)
    pixel_frames = new_pixellab_frames()
    for spec in specs():
        chunks = terrain_frames(spec, source, pixel_frames)
        broad_ground_frames = source_frames(spec, source)
        pack_terrain_chunks(spec, chunks)
        pack_authored_ground(spec, broad_ground_frames, pixel_frames, source)
        print(f"rebuilt {spec.key} terrain")


if __name__ == "__main__":
    main()
