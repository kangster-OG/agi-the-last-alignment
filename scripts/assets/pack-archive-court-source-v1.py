#!/usr/bin/env python3
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
CHATGPT_SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "archive_court_source_v1"
PIXELLAB_SOURCE = ROOT / "assets" / "concepts" / "pixellab_refs" / "archive_court_refinement_v1" / "raw_frames"
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
        return distance < 48 and luma < bg_luma + 34 and max(r, g, b) < 86

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


def crop_box(image: Image.Image, box: tuple[int, int, int, int], inset: int = 8) -> Image.Image:
    left, top, right, bottom = box
    return image.crop((left + inset, top + inset, right - inset, bottom - inset))


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


def pixellab_frame(index: int) -> Image.Image:
    return rgba(PIXELLAB_SOURCE / f"archive_court_pixellab_frame_{index:02d}.png")


def fit_pixellab_frame(index: int, size: tuple[int, int], max_size: tuple[int, int], anchor_y: float) -> Image.Image:
    return fit_subject(pixellab_frame(index), size, max_size, anchor_y, Image.Resampling.NEAREST, clean_border=False)


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
    resample = Image.Resampling.NEAREST if chunk.width <= 256 else Image.Resampling.LANCZOS
    resized = chunk.resize((round(chunk.width * scale), round(chunk.height * scale)), resample)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    cx, cy = world_to_canvas(world_x, world_y)
    ground.alpha_composite(resized, (cx - resized.width // 2, cy - round(resized.height * 0.82)))


def terrain_frames() -> list[Image.Image]:
    source = rgba(CHATGPT_SOURCE / "archive_court_terrain_chunks_chatgpt_v1.png")
    top = source.crop((0, 0, source.width, 690))
    chat_frames = [
        fit_subject(grid_cell(top, 3, 2, 0, 0, 14), (512, 320), (488, 300), 0.86),
        fit_subject(grid_cell(top, 3, 2, 1, 0, 14), (512, 320), (488, 300), 0.86),
        fit_subject(grid_cell(top, 3, 2, 2, 0, 14), (512, 320), (488, 300), 0.86),
        fit_subject(grid_cell(top, 3, 2, 0, 1, 14), (512, 320), (488, 300), 0.86),
        fit_subject(grid_cell(top, 3, 2, 1, 1, 14), (512, 320), (488, 300), 0.86),
        fit_subject(grid_cell(top, 3, 2, 2, 1, 14), (512, 320), (488, 300), 0.86),
    ]
    return [
        chat_frames[0],
        chat_frames[0],
        chat_frames[1],
        chat_frames[3],
        chat_frames[2],
        chat_frames[4],
        chat_frames[5],
        fit_subject(crop_box(source, (60, 700, 1460, 990), 0), (512, 320), (500, 110), 0.72),
    ]


def pack_authored_ground() -> None:
    court_floor, witness_floor, redaction_floor, appeal_floor, docket_floor, bench_floor, gate_floor, redaction_lane = terrain_frames()
    ground = Image.new("RGBA", GROUND_SIZE, (6, 17, 25, 255))
    flat_cycle = [court_floor, witness_floor, redaction_floor, appeal_floor]
    placements: list[tuple[Image.Image, float, float, float, int]] = []
    for y in range(-42, 45, 4):
        for x in range(-51, 57, 5):
            hash_value = abs(((x + 197) * 1103515245) ^ ((y - 283) * 12345))
            frame = flat_cycle[hash_value % len(flat_cycle)]
            placements.append((frame, x + ((hash_value >> 3) % 3 - 1) * 0.25, y + ((hash_value >> 5) % 3 - 1) * 0.2, 0.48 + (hash_value % 5) * 0.014, 116 + (hash_value % 9) * 4))
    placements.extend(
        [
            (witness_floor, -31, 4, 1.24, 252),
            (redaction_floor, -13, -18, 1.12, 238),
            (appeal_floor, 8, 13, 1.12, 236),
            (docket_floor, 14, -5, 1.06, 226),
            (bench_floor, 32, -11, 1.05, 228),
            (gate_floor, 42, 23, 1.05, 232),
            (redaction_lane, -4, -29, 1.18, 226),
            (redaction_lane, 14, 31, 1.12, 216),
            (court_floor, -1, 2, 0.8, 196),
            (court_floor, 24, 7, 0.72, 178),
        ]
    )
    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(ground, chunk, world_x, world_y, scale, alpha)
    save_quantized(ROOT / "assets" / "tiles" / "archive_court" / "authored_ground.png", apply_outer_alpha(ground))


def pack_terrain_sources() -> None:
    frames = terrain_frames()
    out = Image.new("RGBA", (4 * 512, 2 * 320), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 4) * 512, (index // 4) * 320))
    save(ROOT / "assets" / "tiles" / "archive_court" / "archive_court_terrain_chunks_v1.png", out)


def pack_props() -> None:
    source = rgba(CHATGPT_SOURCE / "archive_court_props_objectives_chatgpt_v1.png")
    replacements = {
        1: 4,
        5: 6,
        6: 1,
        7: 15,
        10: 4,
    }
    out = Image.new("RGBA", (4 * 256, 3 * 240), (0, 0, 0, 0))
    for row in range(3):
        for col in range(4):
            index = row * 4 + col
            if index in replacements:
                frame = fit_pixellab_frame(replacements[index], (256, 240), (164, 154), 0.9)
            else:
                frame = fit_subject(grid_cell(source, 4, 3, col, row, 12), (256, 240), (238, 222), 0.9)
            out.alpha_composite(frame, (col * 256, row * 240))
    save(ROOT / "assets" / "props" / "archive_court" / "archive_court_props_objectives_v1.png", out)


def pack_actor_sources() -> None:
    source = rgba(CHATGPT_SOURCE / "archive_court_actors_boss_chatgpt_v1.png")
    redaction = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    redaction_primary = fit_subject(crop_box(source, (20, 40, 210, 300), 8), (128, 112), (104, 96), 0.86)
    redaction_pixellab = fit_pixellab_frame(7, (128, 112), (76, 86), 0.82)
    redaction_frames = [
        redaction_primary,
        redaction_pixellab,
        redaction_primary,
        redaction_pixellab,
    ]
    for index, frame in enumerate(redaction_frames):
        redaction.alpha_composite(frame, (index * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "redaction_angels_sheet.png", redaction)

    writs = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    writ_primary = fit_subject(crop_box(source, (35, 300, 220, 540), 8), (128, 112), (104, 92), 0.84)
    writ_frames = [
        writ_primary,
        writ_primary,
        writ_primary,
        writ_primary,
    ]
    for index, frame in enumerate(writ_frames):
        writs.alpha_composite(frame, (index * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "injunction_writs_sheet.png", writs)

    boss = Image.new("RGBA", (4 * 320, 320), (0, 0, 0, 0))
    boss_frames = [
        fit_subject(crop_box(source, (40, 565, 235, 1000), 8), (320, 320), (180, 284), 0.93),
        fit_subject(crop_box(source, (245, 565, 440, 1000), 8), (320, 320), (180, 284), 0.93),
        fit_subject(crop_box(source, (455, 565, 650, 1000), 8), (320, 320), (180, 284), 0.93),
        fit_subject(crop_box(source, (1050, 500, 1530, 1010), 8), (320, 320), (258, 280), 0.93),
    ]
    for index, frame in enumerate(boss_frames):
        boss.alpha_composite(frame, (index * 320, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "redactor_saint.png", boss)


def pack_vfx() -> None:
    source = rgba(CHATGPT_SOURCE / "archive_court_vfx_chatgpt_v1.png")
    frames = [
        fit_pixellab_frame(9, (192, 160), (128, 100), 0.72),
        fit_subject(grid_cell(source, 8, 7, 1, 0, 10), (192, 160), (170, 132), 0.72),
        fit_subject(grid_cell(source, 8, 7, 2, 2, 10), (192, 160), (178, 126), 0.72),
        fit_pixellab_frame(11, (192, 160), (118, 118), 0.72),
        fit_pixellab_frame(10, (192, 160), (132, 116), 0.72),
        fit_subject(grid_cell(source, 8, 7, 6, 4, 10), (192, 160), (170, 132), 0.72),
        fit_subject(grid_cell(source, 8, 7, 2, 1, 10), (192, 160), (170, 132), 0.72),
        fit_subject(grid_cell(source, 8, 7, 4, 1, 10), (192, 160), (170, 132), 0.72),
        fit_subject(grid_cell(source, 8, 7, 0, 6, 10), (192, 160), (150, 118), 0.72),
        fit_subject(grid_cell(source, 8, 7, 1, 6, 10), (192, 160), (150, 118), 0.72),
        fit_subject(grid_cell(source, 8, 7, 2, 6, 10), (192, 160), (150, 118), 0.72),
        fit_subject(grid_cell(source, 8, 7, 3, 6, 10), (192, 160), (150, 118), 0.72),
    ]
    out = Image.new("RGBA", (4 * 192, 3 * 160), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 4) * 192, (index // 4) * 160))
    save(ROOT / "assets" / "sprites" / "effects" / "archive_court_hazard_vfx_v1.png", out)


def pack_contact_sheet() -> None:
    images = [
        rgba(ROOT / "assets" / "tiles" / "archive_court" / "archive_court_terrain_chunks_v1.png"),
        rgba(ROOT / "assets" / "props" / "archive_court" / "archive_court_props_objectives_v1.png"),
        rgba(ROOT / "assets" / "sprites" / "enemies" / "redaction_angels_sheet.png"),
        rgba(ROOT / "assets" / "sprites" / "enemies" / "injunction_writs_sheet.png"),
        rgba(ROOT / "assets" / "sprites" / "bosses" / "redactor_saint.png"),
        rgba(ROOT / "assets" / "sprites" / "effects" / "archive_court_hazard_vfx_v1.png"),
    ]
    widths = [512, 512, 512, 512, 640, 512]
    heights = [160, 180, 112, 112, 160, 180]
    contact = Image.new("RGBA", (960, sum(heights) + 70), (8, 12, 16, 255))
    y = 10
    for image, width, height in zip(images, widths, heights):
        thumb = image.copy()
        thumb.thumbnail((width, height), Image.Resampling.NEAREST)
        contact.alpha_composite(thumb, ((960 - thumb.width) // 2, y))
        y += height + 12
    save(ROOT / "assets" / "concepts" / "pixellab_refs" / "archive_court_refinement_v1" / "archive_court_runtime_contact_v1.png", contact)


def main() -> None:
    pack_authored_ground()
    pack_terrain_sources()
    pack_props()
    pack_actor_sources()
    pack_vfx()
    pack_contact_sheet()


if __name__ == "__main__":
    main()
