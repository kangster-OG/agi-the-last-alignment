#!/usr/bin/env python3
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
CHATGPT_SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "alignment_spire_finale_source_v1"
PIXELLAB_SOURCE = ROOT / "assets" / "concepts" / "pixellab_refs" / "alignment_spire_finale_refinement_v1"
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


def crop_box(image: Image.Image, box: tuple[int, int, int, int], inset: int = 8) -> Image.Image:
    left, top, right, bottom = box
    return image.crop((left + inset, top + inset, right - inset, bottom - inset))


def grid_cell(image: Image.Image, cols: int, rows: int, col: int, row: int, inset: int = 10) -> Image.Image:
    cell_w = image.width // cols
    cell_h = image.height // rows
    return image.crop((col * cell_w + inset, row * cell_h + inset, (col + 1) * cell_w - inset, (row + 1) * cell_h - inset))


def is_board_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a < 12:
        return True
    if r < 11 and g < 20 and b < 30:
        return True
    if r < 42 and g < 54 and b < 70 and max(r, g, b) - min(r, g, b) < 44:
        return True
    return False


def edge_key_dark(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    visited: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited or x < 0 or y < 0 or x >= width or y >= height:
            continue
        visited.add((x, y))
        if not is_board_background(pixels[x, y]):
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
    resample: Image.Resampling = Image.Resampling.LANCZOS,
    clean_dark: bool = True,
) -> Image.Image:
    subject = image.convert("RGBA")
    if clean_dark:
        subject = edge_key_dark(subject)
    subject = alpha_crop(subject)
    if subject.width > 0 and subject.height > 0:
        ratio = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * ratio)), max(1, round(subject.height * ratio))), resample)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - subject.width) // 2
    y = int(size[1] * anchor_y - subject.height)
    out.alpha_composite(subject, (x, y))
    return out


def fit_pixellab(path: Path, size: tuple[int, int], max_size: tuple[int, int], anchor_y: float) -> Image.Image:
    return fit_subject(rgba(path), size, max_size, anchor_y, Image.Resampling.NEAREST, clean_dark=False)


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


PIXELLAB_ORBS = PIXELLAB_SOURCE / "alignment_spire_pixellab_object_0.png"
PIXELLAB_RING_GATE = PIXELLAB_SOURCE / "alignment_spire_pixellab_object_1.png"


def terrain_frames() -> list[Image.Image]:
    source = rgba(CHATGPT_SOURCE / "alignment_spire_terrain_chatgpt_v1.png")
    return [
        fit_subject(crop_box(source, (18, 54, 520, 336), 4), (512, 320), (492, 292), 0.86),
        fit_subject(crop_box(source, (540, 52, 948, 320), 4), (512, 320), (492, 292), 0.86),
        fit_subject(crop_box(source, (1110, 56, 1516, 350), 4), (512, 320), (492, 292), 0.86),
        fit_subject(crop_box(source, (430, 400, 1058, 678), 4), (512, 320), (500, 294), 0.86),
        fit_subject(crop_box(source, (36, 470, 354, 680), 4), (512, 320), (430, 238), 0.86),
        fit_subject(crop_box(source, (918, 420, 1446, 690), 4), (512, 320), (500, 290), 0.86),
        fit_subject(crop_box(source, (70, 740, 450, 1002), 4), (512, 320), (488, 292), 0.9),
        fit_pixellab(PIXELLAB_RING_GATE, (512, 320), (210, 170), 0.78),
    ]


def pack_authored_ground() -> None:
    camp_floor, route_floor, agi_floor, causeway, ring_floor, gate_floor, echo_floor, proof_ring = terrain_frames()
    ground = Image.new("RGBA", GROUND_SIZE, (5, 13, 23, 255))
    flat_cycle = [camp_floor, route_floor, causeway, echo_floor]
    placements: list[tuple[Image.Image, float, float, float, int]] = []
    for y in range(-48, 53, 4):
        for x in range(-58, 65, 5):
            hash_value = abs(((x + 877) * 1103515245) ^ ((y - 223) * 12345))
            frame = flat_cycle[hash_value % len(flat_cycle)]
            placements.append((frame, x + ((hash_value >> 3) % 3 - 1) * 0.23, y + ((hash_value >> 5) % 3 - 1) * 0.18, 0.46 + (hash_value % 6) * 0.012, 104 + (hash_value % 10) * 4))
    placements.extend(
        [
            (camp_floor, -39, 2, 1.18, 252),
            (gate_floor, -20, -24, 0.98, 232),
            (proof_ring, 4, 16, 1.18, 230),
            (causeway, 18, -3, 1.04, 236),
            (agi_floor, 38, -8, 1.08, 232),
            (gate_floor, 49, 27, 1.02, 236),
            (route_floor, -4, -36, 1.2, 214),
            (echo_floor, 16, 38, 1.12, 212),
            (route_floor, -2, 1, 0.92, 194),
            (ring_floor, 4, 16, 0.9, 190),
        ]
    )
    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(ground, chunk, world_x, world_y, scale, alpha)
    save_quantized(ROOT / "assets" / "tiles" / "alignment_spire" / "authored_ground.png", apply_outer_alpha(ground))


def pack_terrain_sources() -> None:
    frames = terrain_frames()
    out = Image.new("RGBA", (4 * 512, 2 * 320), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 4) * 512, (index // 4) * 320))
    save(ROOT / "assets" / "tiles" / "alignment_spire" / "alignment_spire_terrain_chunks_v1.png", out)


def pack_props() -> None:
    source = rgba(CHATGPT_SOURCE / "alignment_spire_props_objectives_chatgpt_v1.png")
    boxes = [
        (24, 52, 438, 322),
        (546, 64, 730, 300),
        (750, 84, 918, 278),
        (1022, 58, 1480, 276),
        (66, 448, 186, 622),
        (420, 424, 620, 612),
        (760, 410, 920, 634),
        (1128, 354, 1278, 648),
        (60, 734, 220, 1004),
        (270, 740, 436, 1006),
        (560, 742, 768, 1000),
        (1252, 708, 1488, 1010),
    ]
    out = Image.new("RGBA", (4 * 256, 3 * 240), (0, 0, 0, 0))
    for index, box in enumerate(boxes):
        col = index % 4
        row = index // 4
        if index == 2:
            frame = fit_pixellab(PIXELLAB_RING_GATE, (256, 240), (176, 150), 0.84)
        elif index == 10:
            frame = fit_pixellab(PIXELLAB_ORBS, (256, 240), (160, 142), 0.78)
        else:
            max_size = (232, 218) if index not in (0, 3, 11) else (246, 222)
            frame = fit_subject(crop_box(source, box, 4), (256, 240), max_size, 0.9)
        out.alpha_composite(frame, (col * 256, row * 240))
    save(ROOT / "assets" / "props" / "alignment_spire" / "alignment_spire_props_objectives_v1.png", out)


def pack_actor_sources() -> None:
    source = rgba(CHATGPT_SOURCE / "alignment_spire_actors_boss_chatgpt_v1.png")
    ghost_boxes = [
        (110, 54, 238, 184),
        (310, 50, 438, 184),
        (522, 58, 650, 188),
        (742, 58, 878, 190),
    ]
    ghosts = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    for col, box in enumerate(ghost_boxes):
        if col == 3:
            frame = fit_pixellab(PIXELLAB_ORBS, (128, 112), (82, 82), 0.76)
        else:
            frame = fit_subject(crop_box(source, box, 0), (128, 112), (104, 92), 0.82)
        ghosts.alpha_composite(frame, (col * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "prediction_ghosts_sheet.png", ghosts)

    echo_boxes = [
        (84, 235, 286, 492),
        (396, 238, 602, 494),
        (682, 238, 880, 492),
        (962, 246, 1168, 494),
    ]
    echoes = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    for col, box in enumerate(echo_boxes):
        frame = fit_subject(crop_box(source, box, 0), (128, 112), (106, 98), 0.86)
        echoes.alpha_composite(frame, (col * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "previous_boss_echoes_sheet.png", echoes)

    boss_boxes = [
        (36, 510, 388, 914),
        (494, 500, 830, 914),
        (872, 486, 1216, 920),
        (1250, 472, 1608, 920),
    ]
    boss = Image.new("RGBA", (4 * 384, 384), (0, 0, 0, 0))
    for col, box in enumerate(boss_boxes):
        frame = fit_subject(crop_box(source, box, 0), (384, 384), (344, 348), 0.94)
        boss.alpha_composite(frame, (col * 384, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "alien_god_intelligence.png", boss)


def pack_vfx() -> None:
    source = rgba(CHATGPT_SOURCE / "alignment_spire_vfx_chatgpt_v1.png")
    boxes = [
        (56, 54, 236, 142),
        (282, 48, 468, 156),
        (546, 188, 724, 300),
        (748, 188, 966, 318),
        (86, 386, 220, 524),
        (346, 386, 506, 536),
        (628, 414, 786, 542),
        (1354, 430, 1530, 744),
        (76, 650, 196, 790),
        (354, 642, 502, 796),
        (674, 640, 820, 800),
        (72, 788, 284, 1000),
    ]
    out = Image.new("RGBA", (4 * 192, 3 * 160), (0, 0, 0, 0))
    for index, box in enumerate(boxes):
        col = index % 4
        row = index // 4
        if index == 0:
            frame = fit_pixellab(PIXELLAB_RING_GATE, (192, 160), (142, 118), 0.74)
        elif index == 4:
            frame = fit_pixellab(PIXELLAB_ORBS, (192, 160), (118, 102), 0.72)
        else:
            frame = fit_subject(crop_box(source, box, 2), (192, 160), (176, 148), 0.76)
        out.alpha_composite(frame, (col * 192, row * 160))
    save(ROOT / "assets" / "sprites" / "effects" / "alignment_spire_hazard_vfx_v1.png", out)


def pack_contact_sheet() -> None:
    outputs = [
        ROOT / "assets" / "tiles" / "alignment_spire" / "alignment_spire_terrain_chunks_v1.png",
        ROOT / "assets" / "props" / "alignment_spire" / "alignment_spire_props_objectives_v1.png",
        ROOT / "assets" / "sprites" / "enemies" / "prediction_ghosts_sheet.png",
        ROOT / "assets" / "sprites" / "enemies" / "previous_boss_echoes_sheet.png",
        ROOT / "assets" / "sprites" / "bosses" / "alien_god_intelligence.png",
        ROOT / "assets" / "sprites" / "effects" / "alignment_spire_hazard_vfx_v1.png",
    ]
    contact = Image.new("RGBA", (960, 1320), (12, 17, 25, 255))
    draw = ImageDraw.Draw(contact)
    y = 18
    for path in outputs:
        image = rgba(path)
        scale = min(900 / image.width, 180 / image.height)
        thumb = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.NEAREST)
        contact.alpha_composite(thumb, ((960 - thumb.width) // 2, y))
        draw.text((30, y + thumb.height + 4), path.relative_to(ROOT).as_posix(), fill=(244, 236, 216, 255))
        y += thumb.height + 48
    save(PIXELLAB_SOURCE / "alignment_spire_runtime_contact_sheet_v1.png", contact)


def main() -> None:
    pack_authored_ground()
    pack_terrain_sources()
    pack_props()
    pack_actor_sources()
    pack_vfx()
    pack_contact_sheet()
    print("Packed Alignment Spire Finale production source art.")


if __name__ == "__main__":
    main()
