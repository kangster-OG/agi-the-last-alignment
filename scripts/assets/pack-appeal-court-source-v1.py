#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
CHATGPT_SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "appeal_court_source_v1"
PIXELLAB_SOURCE = ROOT / "assets" / "concepts" / "pixellab_refs" / "appeal_court_refinement_v1" / "appeal_court_pixellab_source_frame_0.png"
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
    resample: Image.Resampling = Image.Resampling.LANCZOS,
    clean_green: bool = True,
) -> Image.Image:
    subject = image.convert("RGBA")
    if clean_green:
        subject = despill_green(remove_green_key(subject))
    subject = alpha_crop(subject)
    if subject.width > 0 and subject.height > 0:
        ratio = min(max_size[0] / subject.width, max_size[1] / subject.height)
        subject = subject.resize((max(1, round(subject.width * ratio)), max(1, round(subject.height * ratio))), resample)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - subject.width) // 2
    y = int(size[1] * anchor_y - subject.height)
    out.alpha_composite(subject, (x, y))
    return out


def pixellab_crop(box: tuple[int, int, int, int]) -> Image.Image:
    return rgba(PIXELLAB_SOURCE).crop(box)


def fit_pixellab_crop(box: tuple[int, int, int, int], size: tuple[int, int], max_size: tuple[int, int], anchor_y: float) -> Image.Image:
    return fit_subject(pixellab_crop(box), size, max_size, anchor_y, Image.Resampling.NEAREST, clean_green=False)


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


PIXELLAB_TILE = (0, 0, 62, 38)
PIXELLAB_TABLE = (0, 32, 66, 80)
PIXELLAB_RULING_SEAL = (78, 86, 184, 172)
PIXELLAB_TOWER = (108, 0, 190, 151)
PIXELLAB_SHIELD = (193, 0, 239, 59)
PIXELLAB_OBELISK = (204, 57, 239, 144)
PIXELLAB_CONSOLE = (176, 66, 205, 98)
PIXELLAB_FLAME = (0, 150, 58, 202)
PIXELLAB_SWIRL = (68, 193, 122, 240)
PIXELLAB_BEAM = (130, 214, 191, 240)
PIXELLAB_SPARK = (205, 205, 238, 238)


def terrain_frames() -> list[Image.Image]:
    source = rgba(CHATGPT_SOURCE / "appeal_court_terrain_chatgpt_v1.png")
    return [
        fit_subject(crop_box(source, (20, 46, 342, 190), 4), (512, 320), (492, 292), 0.86),
        fit_subject(crop_box(source, (338, 112, 684, 278), 4), (512, 320), (492, 292), 0.86),
        fit_subject(crop_box(source, (404, 250, 850, 446), 4), (512, 320), (500, 300), 0.86),
        fit_subject(crop_box(source, (828, 190, 1118, 418), 4), (512, 320), (492, 292), 0.86),
        fit_pixellab_crop(PIXELLAB_RULING_SEAL, (512, 320), (250, 170), 0.78),
        fit_subject(crop_box(source, (80, 636, 360, 882), 4), (512, 320), (492, 300), 0.9),
        fit_subject(crop_box(source, (1372, 610, 1650, 840), 4), (512, 320), (492, 292), 0.9),
        fit_pixellab_crop(PIXELLAB_TILE, (512, 320), (210, 132), 0.78),
    ]


def pack_authored_ground() -> None:
    public_floor, argument_floor, exhibit_floor, cross_floor, ruling_seal, engine_floor, gate_floor, verdict_lane = terrain_frames()
    ground = Image.new("RGBA", GROUND_SIZE, (6, 17, 27, 255))
    flat_cycle = [public_floor, argument_floor, exhibit_floor, verdict_lane]
    placements: list[tuple[Image.Image, float, float, float, int]] = []
    for y in range(-44, 49, 4):
        for x in range(-54, 59, 5):
            hash_value = abs(((x + 401) * 1103515245) ^ ((y - 617) * 12345))
            frame = flat_cycle[hash_value % len(flat_cycle)]
            placements.append((frame, x + ((hash_value >> 3) % 3 - 1) * 0.23, y + ((hash_value >> 5) % 3 - 1) * 0.18, 0.48 + (hash_value % 5) * 0.014, 118 + (hash_value % 9) * 4))
    placements.extend(
        [
            (argument_floor, -34, 5, 1.22, 252),
            (exhibit_floor, -16, -21, 1.08, 238),
            (cross_floor, 9, 15, 1.06, 236),
            (ruling_seal, 13, -5, 1.08, 236),
            (engine_floor, 35, -13, 0.92, 224),
            (gate_floor, 47, 25, 0.94, 228),
            (verdict_lane, -3, -33, 1.16, 226),
            (verdict_lane, 18, 31, 1.06, 216),
            (public_floor, -3, 2, 0.78, 194),
            (public_floor, 25, 6, 0.7, 178),
        ]
    )
    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(ground, chunk, world_x, world_y, scale, alpha)
    save_quantized(ROOT / "assets" / "tiles" / "appeal_court" / "authored_ground.png", apply_outer_alpha(ground))


def pack_terrain_sources() -> None:
    frames = terrain_frames()
    out = Image.new("RGBA", (4 * 512, 2 * 320), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 4) * 512, (index // 4) * 320))
    save(ROOT / "assets" / "tiles" / "appeal_court" / "appeal_court_terrain_chunks_v1.png", out)


def pack_props() -> None:
    source = rgba(CHATGPT_SOURCE / "appeal_court_props_objectives_chatgpt_v1.png")
    replacements = {
        1: PIXELLAB_TABLE,
        3: PIXELLAB_RULING_SEAL,
        4: PIXELLAB_TOWER,
        6: PIXELLAB_SHIELD,
        8: PIXELLAB_OBELISK,
    }
    out = Image.new("RGBA", (4 * 256, 3 * 240), (0, 0, 0, 0))
    for row in range(3):
        for col in range(4):
            index = row * 4 + col
            if index in replacements:
                frame = fit_pixellab_crop(replacements[index], (256, 240), (176, 170), 0.9)
            else:
                frame = fit_subject(grid_cell(source, 4, 3, col, row, 12), (256, 240), (238, 222), 0.9)
            out.alpha_composite(frame, (col * 256, row * 240))
    save(ROOT / "assets" / "props" / "appeal_court" / "appeal_court_props_objectives_v1.png", out)


def pack_actor_sources() -> None:
    source = rgba(CHATGPT_SOURCE / "appeal_court_actors_boss_chatgpt_v1.png")
    clerk_boxes = [
        (110, 55, 295, 235),
        (315, 65, 480, 230),
        (510, 65, 690, 235),
        (715, 55, 910, 225),
    ]
    clerks = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    for col, box in enumerate(clerk_boxes):
        frame = fit_subject(crop_box(source, box, 0), (128, 112), (108, 94), 0.86)
        clerks.alpha_composite(frame, (col * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "verdict_clerks_sheet.png", clerks)

    writ_boxes = [
        (105, 270, 255, 468),
        (318, 270, 475, 470),
        (516, 276, 662, 470),
        (708, 282, 850, 468),
    ]
    writs = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    for col, box in enumerate(writ_boxes):
        frame = fit_subject(crop_box(source, box, 0), (128, 112), (104, 96), 0.86)
        writs.alpha_composite(frame, (col * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "appeal_injunction_writs_sheet.png", writs)

    boss_boxes = [
        (28, 536, 246, 834),
        (258, 534, 566, 836),
        (586, 522, 884, 852),
        (892, 522, 1208, 854),
    ]
    boss = Image.new("RGBA", (4 * 320, 320), (0, 0, 0, 0))
    for col, box in enumerate(boss_boxes):
        frame = fit_subject(crop_box(source, box, 0), (320, 320), (286, 278), 0.92)
        boss.alpha_composite(frame, (col * 320, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "injunction_engine.png", boss)


def pack_vfx() -> None:
    source = rgba(CHATGPT_SOURCE / "appeal_court_vfx_chatgpt_v2.png")
    frames = [
        fit_subject(grid_cell(source, 8, 7, 1, 0, 10), (192, 160), (174, 132), 0.72),
        fit_subject(grid_cell(source, 8, 7, 3, 1, 10), (192, 160), (178, 132), 0.72),
        fit_subject(grid_cell(source, 8, 7, 2, 2, 10), (192, 160), (174, 132), 0.72),
        fit_pixellab_crop(PIXELLAB_SPARK, (192, 160), (116, 104), 0.72),
        fit_pixellab_crop(PIXELLAB_RULING_SEAL, (192, 160), (148, 112), 0.74),
        fit_subject(grid_cell(source, 8, 7, 7, 3, 10), (192, 160), (178, 138), 0.72),
        fit_subject(grid_cell(source, 8, 7, 3, 2, 10), (192, 160), (174, 132), 0.72),
        fit_pixellab_crop(PIXELLAB_SWIRL, (192, 160), (124, 118), 0.72),
        fit_subject(grid_cell(source, 8, 7, 3, 6, 10), (192, 160), (150, 118), 0.72),
        fit_subject(grid_cell(source, 8, 7, 1, 4, 10), (192, 160), (150, 118), 0.72),
        fit_subject(grid_cell(source, 8, 7, 4, 5, 10), (192, 160), (150, 118), 0.72),
        fit_pixellab_crop(PIXELLAB_BEAM, (192, 160), (138, 82), 0.72),
    ]
    out = Image.new("RGBA", (4 * 192, 3 * 160), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 4) * 192, (index // 4) * 160))
    save(ROOT / "assets" / "sprites" / "effects" / "appeal_court_hazard_vfx_v1.png", out)


def pack_contact_sheet() -> None:
    images = [
        rgba(ROOT / "assets" / "tiles" / "appeal_court" / "appeal_court_terrain_chunks_v1.png"),
        rgba(ROOT / "assets" / "props" / "appeal_court" / "appeal_court_props_objectives_v1.png"),
        rgba(ROOT / "assets" / "sprites" / "enemies" / "verdict_clerks_sheet.png"),
        rgba(ROOT / "assets" / "sprites" / "enemies" / "appeal_injunction_writs_sheet.png"),
        rgba(ROOT / "assets" / "sprites" / "bosses" / "injunction_engine.png"),
        rgba(ROOT / "assets" / "sprites" / "effects" / "appeal_court_hazard_vfx_v1.png"),
    ]
    widths = [512, 512, 512, 512, 640, 512]
    heights = [160, 180, 112, 112, 180, 180]
    contact = Image.new("RGBA", (960, sum(heights) + 70), (8, 12, 16, 255))
    y = 10
    for image, width, height in zip(images, widths, heights):
        thumb = image.copy()
        thumb.thumbnail((width, height), Image.Resampling.NEAREST)
        contact.alpha_composite(thumb, ((960 - thumb.width) // 2, y))
        y += height + 12
    save(ROOT / "assets" / "concepts" / "pixellab_refs" / "appeal_court_refinement_v1" / "appeal_court_runtime_contact_v1.png", contact)


def main() -> None:
    pack_authored_ground()
    pack_terrain_sources()
    pack_props()
    pack_actor_sources()
    pack_vfx()
    pack_contact_sheet()


if __name__ == "__main__":
    main()
