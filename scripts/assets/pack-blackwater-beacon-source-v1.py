#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
CHATGPT_SOURCE = ROOT / "assets" / "concepts" / "chatgpt_refs" / "blackwater_beacon_source_v1"
PIXELLAB_SOURCE = ROOT / "assets" / "concepts" / "pixellab_refs" / "blackwater_beacon_refinement_v1" / "raw"
GROUND_SIZE = (5120, 3072)
GROUND_ORIGIN = (2560, 1536)
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
            if (g > 118 and g - r > 46 and g - b > 34) or (g > 82 and g - r > 30 and g - b > 24):
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
            elif g > r + 18 and g > b + 12:
                pixels[x, y] = (r, min(g, max(r, b) + 10), b, a)
    return image


def alpha_crop(image: Image.Image) -> Image.Image:
    box = image.getbbox()
    return image.crop(box) if box else image


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
) -> Image.Image:
    subject = alpha_crop(despill_green(remove_green_key(image)))
    subject.thumbnail(max_size, resampling)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - subject.width) // 2
    y = int(size[1] * anchor_y - subject.height)
    out.alpha_composite(subject, (x, y))
    return out


def fit_pixellab_frame(index: int, size: tuple[int, int], max_size: tuple[int, int], anchor_y: float) -> Image.Image:
    return fit_subject(rgba(PIXELLAB_SOURCE / f"frame_{index}.png"), size, max_size, anchor_y, Image.Resampling.NEAREST)


def world_to_canvas(world_x: float, world_y: float) -> tuple[int, int]:
    screen_x = (world_x - world_y) * TILE_WIDTH * 0.5
    screen_y = (world_x + world_y) * TILE_HEIGHT * 0.5
    return (round(GROUND_ORIGIN[0] + screen_x), round(GROUND_ORIGIN[1] + screen_y))


def apply_outer_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    margin = 190
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
    resized = chunk.resize((round(chunk.width * scale), round(chunk.height * scale)), Image.Resampling.LANCZOS)
    if alpha < 255:
        r, g, b, a = resized.split()
        a = a.point(lambda value: round(value * alpha / 255))
        resized = Image.merge("RGBA", (r, g, b, a))
    cx, cy = world_to_canvas(world_x, world_y)
    ground.alpha_composite(resized, (cx - resized.width // 2, cy - round(resized.height * 0.82)))


def pack_grid_source(
    source_name: str,
    out_path: Path,
    cols: int,
    rows: int,
    frame_size: tuple[int, int],
    max_size: tuple[int, int],
    anchor_y: float,
) -> None:
    source = rgba(CHATGPT_SOURCE / source_name)
    out = Image.new("RGBA", (cols * frame_size[0], rows * frame_size[1]), (0, 0, 0, 0))
    for row in range(rows):
        for col in range(cols):
            frame = fit_subject(grid_cell(source, cols, rows, col, row), frame_size, max_size, anchor_y)
            out.alpha_composite(frame, (col * frame_size[0], row * frame_size[1]))
    save(out_path, out)


def blackwater_terrain_frames() -> list[Image.Image]:
    source = rgba(CHATGPT_SOURCE / "blackwater_terrain_source_v1.png")
    frames: list[Image.Image] = []
    for row in range(2):
        for col in range(2):
            frames.append(fit_subject(grid_cell(source, 2, 2, col, row, 14), (512, 320), (496, 304), 0.86))
    return frames


def pack_authored_ground() -> None:
    server_deck, tidal_crossing, maintenance_platform, maw_shelf = blackwater_terrain_frames()
    ground = Image.new("RGBA", GROUND_SIZE, (5, 19, 28, 255))
    placements: list[tuple[Image.Image, float, float, float, int]] = []
    for y in range(-31, 36, 5):
        for x in range(-40, 43, 6):
            hash_value = abs(((x + 181) * 1103515245) ^ ((y - 113) * 12345))
            frame = [server_deck, tidal_crossing, maintenance_platform, maw_shelf][hash_value % 4]
            placements.append((frame, x + ((hash_value >> 3) % 3 - 1) * 0.22, y + ((hash_value >> 5) % 3 - 1) * 0.22, 0.7 + (hash_value % 5) * 0.018, 176 + (hash_value % 9) * 6))
    placements.extend(
        [
            (maintenance_platform, -24, 6, 1.04, 255),
            (server_deck, -8, 0, 1.0, 250),
            (server_deck, 4, -4, 0.9, 238),
            (maintenance_platform, 0, -10, 0.98, 252),
            (tidal_crossing, -25, 16, 0.96, 236),
            (tidal_crossing, 4, 14, 1.08, 242),
            (maintenance_platform, 20, 11, 0.98, 250),
            (maw_shelf, 30, -12, 0.98, 250),
            (tidal_crossing, 31, 20, 0.92, 226),
            (maw_shelf, 35, 22, 0.86, 218),
        ]
    )
    for chunk, world_x, world_y, scale, alpha in sorted(placements, key=lambda item: item[1] + item[2]):
        place_ground_chunk(ground, chunk, world_x, world_y, scale, alpha)
    # Fresh PixelLab source is used as small source-backed deck accents in the authored surface.
    pixel_deck = fit_pixellab_frame(0, (160, 128), (128, 96), 0.82)
    for x, y in [(-24, 6), (0, -10), (20, 11), (8, -2)]:
        place_ground_chunk(ground, pixel_deck, x, y, 0.72, 210)
    save_quantized(ROOT / "assets" / "tiles" / "blackwater_beacon" / "authored_ground.png", apply_outer_alpha(ground))


def pack_terrain_sources() -> None:
    frames = blackwater_terrain_frames()
    out = Image.new("RGBA", (2 * 512, 2 * 320), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.alpha_composite(frame, ((index % 2) * 512, (index // 2) * 320))
    save(ROOT / "assets" / "tiles" / "blackwater_beacon" / "blackwater_terrain_chunks_v1.png", out)


def pack_props() -> None:
    source = rgba(CHATGPT_SOURCE / "blackwater_props_objectives_source_v1.png")
    out = Image.new("RGBA", (4 * 256, 2 * 240), (0, 0, 0, 0))
    for row in range(2):
        for col in range(4):
            index = row * 4 + col
            if index == 4:
                frame = fit_pixellab_frame(14, (256, 240), (168, 168), 0.88)
            elif index == 6:
                frame = fit_pixellab_frame(1, (256, 240), (170, 170), 0.9)
            else:
                frame = fit_subject(grid_cell(source, 4, 2, col, row), (256, 240), (238, 224), 0.9)
            out.alpha_composite(frame, (col * 256, row * 240))
    save(ROOT / "assets" / "props" / "blackwater_beacon" / "blackwater_props_objectives_v1.png", out)


def pack_actor_sources() -> None:
    source = rgba(CHATGPT_SOURCE / "blackwater_tidecall_maw_source_v1.png")
    tidecall = Image.new("RGBA", (4 * 128, 112), (0, 0, 0, 0))
    for col in range(4):
        frame = fit_subject(grid_cell(source, 4, 2, col, 0), (128, 112), (118, 100), 0.84)
        tidecall.alpha_composite(frame, (col * 128, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / "tidecall_static_sheet.png", tidecall)
    maw = Image.new("RGBA", (4 * 320, 288), (0, 0, 0, 0))
    for col in range(4):
        frame = fit_subject(grid_cell(source, 4, 2, col, 1), (320, 288), (298, 266), 0.9)
        maw.alpha_composite(frame, (col * 320, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "maw_below_weather.png", maw)


def pack_vfx() -> None:
    source = rgba(CHATGPT_SOURCE / "blackwater_hazard_vfx_source_v1.png")
    out = Image.new("RGBA", (4 * 192, 3 * 160), (0, 0, 0, 0))
    pixellab_replacements = {2: 10, 3: 8, 8: 13, 10: 1, 11: 14}
    for row in range(3):
        for col in range(4):
            index = row * 4 + col
            if index in pixellab_replacements:
                frame = fit_pixellab_frame(pixellab_replacements[index], (192, 160), (138, 126), 0.78)
            else:
                frame = fit_subject(grid_cell(source, 4, 3, col, row), (192, 160), (180, 148), 0.78)
            out.alpha_composite(frame, (col * 192, row * 160))
    save(ROOT / "assets" / "sprites" / "effects" / "blackwater_hazard_vfx_v1.png", out)


def pack_pixellab_contact() -> None:
    out = Image.new("RGBA", (4 * 96, 4 * 96), (20, 24, 28, 255))
    for index in range(16):
        frame = rgba(PIXELLAB_SOURCE / f"frame_{index}.png").resize((96, 96), Image.Resampling.NEAREST)
        out.alpha_composite(frame, ((index % 4) * 96, (index // 4) * 96))
    save(ROOT / "assets" / "concepts" / "pixellab_refs" / "blackwater_beacon_refinement_v1" / "blackwater_pixellab_raw_contact.png", out)


def main() -> None:
    pack_authored_ground()
    pack_terrain_sources()
    pack_props()
    pack_actor_sources()
    pack_vfx()
    pack_pixellab_contact()


if __name__ == "__main__":
    main()
