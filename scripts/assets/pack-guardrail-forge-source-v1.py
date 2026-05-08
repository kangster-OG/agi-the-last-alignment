#!/usr/bin/env python3
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
CHATGPT_SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "guardrail_forge_source_v1"
PIXELLAB_SOURCE = ROOT / "assets" / "concepts" / "pixellab_refs" / "guardrail_forge_refinement_v1" / "raw"
GROUND_SIZE = (7168, 4096)
GROUND_ORIGIN = (3584, 2048)
TILE_WIDTH = 64
TILE_HEIGHT = 32


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
    step = max(1, min(image.width, image.height) // 18)
    for x in range(0, image.width, step):
        for y in (0, image.height - 1):
            r, g, b, a = image.getpixel((x, y))
            if a > 0:
                samples.append((r, g, b))
    for y in range(0, image.height, step):
        for x in (0, image.width - 1):
            r, g, b, a = image.getpixel((x, y))
            if a > 0:
                samples.append((r, g, b))
    if not samples:
        return (0, 0, 0)
    samples.sort(key=lambda item: item[0] + item[1] + item[2])
    return samples[len(samples) // 2]


def remove_border_background(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    bg = border_key_color(image)
    pixels = image.load()
    width, height = image.size

    def near_background(x: int, y: int) -> bool:
        r, g, b, a = pixels[x, y]
        if a == 0:
            return True
        distance = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
        luma = (r + g + b) / 3
        bg_luma = sum(bg) / 3
        return distance < 64 and luma < bg_luma + 36 and max(r, g, b) < 96

    queue: deque[tuple[int, int]] = deque()
    seen = set()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen or x < 0 or x >= width or y < 0 or y >= height:
            continue
        seen.add((x, y))
        if not near_background(x, y):
            continue
        pixels[x, y] = (0, 0, 0, 0)
        queue.append((x + 1, y))
        queue.append((x - 1, y))
        queue.append((x, y + 1))
        queue.append((x, y - 1))
    return image


def grid_cell(image: Image.Image, cols: int, rows: int, col: int, row: int, inset: int = 10) -> Image.Image:
    cell_w = image.width // cols
    cell_h = image.height // rows
    return image.crop((col * cell_w + inset, row * cell_h + inset, (col + 1) * cell_w - inset, (row + 1) * cell_h - inset))


def fit_subject(
    image: Image.Image,
    size: tuple[int, int],
    max_size: tuple[int, int],
    anchor_y: float,
    resampling: Image.Resampling = Image.Resampling.LANCZOS,
    clean_border: bool = True,
) -> Image.Image:
    subject = image.convert("RGBA")
    if clean_border:
        subject = remove_border_background(subject)
    subject = alpha_crop(subject)
    if subject.width > 0 and subject.height > 0:
        ratio = min(max_size[0] / subject.width, max_size[1] / subject.height)
        target_w = max(1, round(subject.width * ratio))
        target_h = max(1, round(subject.height * ratio))
        subject = subject.resize((target_w, target_h), resampling)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - subject.width) // 2
    y = int(size[1] * anchor_y - subject.height)
    out.alpha_composite(subject, (x, y))
    return out


def pixel_frame(index: int) -> Image.Image:
    path = PIXELLAB_SOURCE / f"frame_{index}.png"
    if not path.exists():
        raise FileNotFoundError(path)
    return rgba(path)


def fit_pixellab_frame(index: int, size: tuple[int, int], max_size: tuple[int, int], anchor_y: float) -> Image.Image:
    return fit_subject(pixel_frame(index), size, max_size, anchor_y, Image.Resampling.NEAREST, clean_border=False)


def world_to_canvas(world_x: float, world_y: float) -> tuple[int, int]:
    screen_x = (world_x - world_y) * TILE_WIDTH * 0.5
    screen_y = (world_x + world_y) * TILE_HEIGHT * 0.5
    return (round(GROUND_ORIGIN[0] + screen_x), round(GROUND_ORIGIN[1] + screen_y))


def apply_outer_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    margin = 230
    for y in range(image.height):
        edge_y = min(y, image.height - 1 - y)
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            edge_x = min(x, image.width - 1 - x)
            edge = min(edge_x, edge_y)
            if edge >= margin:
                continue
            alpha = max(0, min(1, edge / margin))
            pixels[x, y] = (r, g, b, round(a * alpha))
    return image


def place_ground_chunk(ground: Image.Image, chunk: Image.Image, world_x: float, world_y: float, scale: float, alpha: int = 255) -> None:
    resized = chunk.resize((round(chunk.width * scale), round(chunk.height * scale)), Image.Resampling.NEAREST if chunk.width <= 256 else Image.Resampling.LANCZOS)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    cx, cy = world_to_canvas(world_x, world_y)
    ground.alpha_composite(resized, (cx - resized.width // 2, cy - round(resized.height * 0.82)))


def chatgpt_terrain_frames() -> list[Image.Image]:
    source = rgba(CHATGPT_SOURCE / "guardrail_forge_terrain_chunks_source_v1.png")
    frames: list[Image.Image] = []
    for row in range(2):
        for col in range(4):
            frames.append(fit_subject(grid_cell(source, 4, 2, col, row, 14), (512, 320), (492, 304), 0.86))
    return frames


def terrain_frames() -> list[Image.Image]:
    flat_frames = [
        fit_pixellab_frame(0, (512, 320), (172, 118), 0.78),
        fit_pixellab_frame(1, (512, 320), (190, 124), 0.78),
        fit_pixellab_frame(2, (512, 320), (198, 128), 0.78),
        fit_pixellab_frame(3, (512, 320), (198, 128), 0.78),
    ]
    # The imagegen terrain board is preserved as direction, but its raised side faces
    # are not accepted for runtime terrain. Runtime terrain uses the flatter PixelLab
    # decals so the map does not regress into repeated cube/platform artifacts.
    return [flat_frames[0], flat_frames[1], flat_frames[2], flat_frames[3], flat_frames[0], flat_frames[1], flat_frames[2], flat_frames[3]]


def pack_authored_ground() -> None:
    alloy, clamp, silkgrid, overload, audit_floor, quench_floor, catwalk, civic_tiles = terrain_frames()
    ground = Image.new("RGBA", GROUND_SIZE, (6, 19, 25, 255))
    placements: list[tuple[Image.Image, float, float, float, int]] = []
    flat_cycle = [alloy, clamp, silkgrid, overload]
    for y in range(-38, 41, 5):
        for x in range(-45, 51, 6):
            hash_value = abs(((x + 311) * 1103515245) ^ ((y - 191) * 12345))
            frame = flat_cycle[hash_value % len(flat_cycle)]
            placements.append((frame, x + ((hash_value >> 3) % 3 - 1) * 0.24, y + ((hash_value >> 5) % 3 - 1) * 0.2, 0.7 + (hash_value % 5) * 0.018, 156 + (hash_value % 9) * 4))
    placements.extend(
        [
            (alloy, -28, 5, 1.28, 250),
            (clamp, -9, -16, 1.18, 240),
            (silkgrid, 8, 13, 1.18, 240),
            (overload, 12, -4, 1.3, 228),
            (overload, -3, -27, 1.08, 220),
            (overload, 13, 29, 1.04, 216),
            (audit_floor, 30, -8, 0.7, 210),
            (quench_floor, 38, 20, 0.7, 214),
            (catwalk, -4, 1, 0.58, 196),
            (civic_tiles, 17, 3, 0.58, 190),
        ]
    )
    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(ground, chunk, world_x, world_y, scale, alpha)
    save_quantized(ROOT / "assets" / "tiles" / "guardrail_forge" / "authored_ground.png", apply_outer_alpha(ground))


def pack_terrain_sources() -> None:
    frames = terrain_frames()
    out = Image.new("RGBA", (4 * 512, 2 * 320), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 4) * 512, (index // 4) * 320))
    save(ROOT / "assets" / "tiles" / "guardrail_forge" / "guardrail_forge_terrain_chunks_v1.png", out)


def pack_props() -> None:
    source = rgba(CHATGPT_SOURCE / "guardrail_forge_props_objectives_source_v1.png")
    replacements = {
        0: 4,
        1: 5,
        2: 6,
        5: 7,
        6: 5,
        10: 7,
        11: 4,
    }
    out = Image.new("RGBA", (4 * 256, 3 * 240), (0, 0, 0, 0))
    for row in range(3):
        for col in range(4):
            index = row * 4 + col
            if index in replacements:
                frame = fit_pixellab_frame(replacements[index], (256, 240), (172, 164), 0.9)
            else:
                frame = fit_subject(grid_cell(source, 4, 3, col, row), (256, 240), (236, 224), 0.9)
            out.alpha_composite(frame, (col * 256, row * 240))
    save(ROOT / "assets" / "props" / "guardrail_forge" / "guardrail_forge_props_objectives_v1.png", out)


def pack_actor_sources() -> None:
    source = rgba(CHATGPT_SOURCE / "guardrail_forge_actors_source_v1.png")
    auditors = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    for col in range(4):
        frame = fit_pixellab_frame(8 + col, (128, 112), (96, 86), 0.86)
        auditors.alpha_composite(frame, (col * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "doctrine_auditors_sheet.png", auditors)

    boss = Image.new("RGBA", (4 * 320, 288), (0, 0, 0, 0))
    for col in range(4):
        frame = fit_subject(grid_cell(source, 4, 2, col, 1), (320, 288), (300, 264), 0.9)
        boss.alpha_composite(frame, (col * 320, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "doctrine_auditor.png", boss)


def pack_vfx() -> None:
    source = rgba(CHATGPT_SOURCE / "guardrail_forge_vfx_source_v1.png")
    replacements = {0: 12, 1: 13, 3: 14, 4: 14, 8: 15, 10: 13, 11: 15}
    out = Image.new("RGBA", (4 * 192, 3 * 160), (0, 0, 0, 0))
    for row in range(3):
        for col in range(4):
            index = row * 4 + col
            if index in replacements:
                frame = fit_pixellab_frame(replacements[index], (192, 160), (132, 118), 0.78)
            else:
                frame = fit_subject(grid_cell(source, 4, 3, col, row), (192, 160), (178, 148), 0.78)
            out.alpha_composite(frame, (col * 192, row * 160))
    save(ROOT / "assets" / "sprites" / "effects" / "guardrail_forge_hazard_vfx_v1.png", out)


def pack_pixellab_contact() -> None:
    out = Image.new("RGBA", (4 * 144, 4 * 144), (8, 14, 18, 255))
    draw = ImageDraw.Draw(out)
    for index in range(16):
        frame = pixel_frame(index).resize((96, 96), Image.Resampling.NEAREST)
        x = (index % 4) * 144 + 24
        y = (index // 4) * 144 + 24
        out.alpha_composite(frame, (x, y))
        draw.rectangle(((index % 4) * 144, (index // 4) * 144, (index % 4 + 1) * 144 - 1, (index // 4 + 1) * 144 - 1), outline=(70, 100, 110, 255))
        draw.text(((index % 4) * 144 + 4, (index // 4) * 144 + 4), str(index), fill=(220, 230, 230, 255))
    save(ROOT / "assets" / "concepts" / "pixellab_refs" / "guardrail_forge_refinement_v1" / "guardrail_forge_pixellab_raw_contact.png", out)


def main() -> None:
    pack_authored_ground()
    pack_terrain_sources()
    pack_props()
    pack_actor_sources()
    pack_vfx()
    pack_pixellab_contact()


if __name__ == "__main__":
    main()
