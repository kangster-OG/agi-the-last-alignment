#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps, ImageSequence


ROOT = Path(__file__).resolve().parents[2]
CHATGPT = ROOT / "assets" / "concepts" / "chatgpt_refs" / "armistice_rebuild_v1"
PIXELLAB = ROOT / "assets" / "concepts" / "pixellab_refs" / "armistice_rebuild_v1"
CLASS_CARD_SOURCES = PIXELLAB / "class_card_sources"
ENEMY_ANIMATION_SOURCES = CHATGPT / "enemy_animation_sources"
ACCORD_COHERENT_BOARD_V5 = CHATGPT / "accord_striker_coherent_4dir_board_v5.png"
ACCORD_FULL_REBUILD_BOARD_V7 = CHATGPT / "accord_striker_full_rebuild_4dir_board_v7.png"
ACCORD_SIDE_WALK_EAST_V8 = CHATGPT / "accord_striker_side_walk_east_v8.png"
ACCORD_FULL_REBUILD_BOARD_V6 = CHATGPT / "accord_striker_full_rebuild_4dir_board_v6.png"
ACCORD_COHERENT_BOARD_V4 = CHATGPT / "accord_striker_coherent_4dir_board_v4.png"
ACCORD_COHERENT_BOARD_V3 = CHATGPT / "accord_striker_coherent_4dir_board_v3.png"
ACCORD_COHERENT_BOARD_V2 = CHATGPT / "accord_striker_coherent_4dir_board_v2.png"
ACCORD_COHERENT_BOARD = CHATGPT / "accord_striker_coherent_4dir_board_v1.png"
OATH_EATER_BOSS_VFX_BOARD = CHATGPT / "oath_eater_boss_vfx_board_v1.png"
OATH_EATER_BOSS_POSE_BOARD = CHATGPT / "oath_eater_boss_pose_board_v2.png"
PLAYER_FRAME_SIZE = 80
PLAYER_FRAMES_PER_DIRECTION = 3
PLAYER_ROWS_PER_CLASS = 4
WORLD_MIN = -30
WORLD_MAX = 30
ISO_MARGIN_X = 256
ISO_MARGIN_Y = 256
AUTHORED_GROUND_WIDTH = 4352
AUTHORED_GROUND_HEIGHT = 2432
AUTHORED_GROUND_ORIGIN_X = 2176
AUTHORED_GROUND_ORIGIN_Y = 1216
CLASS_IDS = [
    "accord_striker",
    "bastion_breaker",
    "drone_reaver",
    "signal_vanguard",
    "bonecode_executioner",
    "redline_surgeon",
    "moonframe_juggernaut",
    "vector_interceptor",
    "nullbreaker_ronin",
    "overclock_marauder",
    "prism_gunner",
    "rift_saboteur",
]


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def save(path: Path, image: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def alpha_crop(image: Image.Image) -> Image.Image:
    bbox = image.getbbox()
    return image.crop(bbox) if bbox else image


def flood_remove_background(image: Image.Image, sample: tuple[int, int] = (0, 0), threshold: int = 34) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    w, h = image.size
    target = pixels[min(max(sample[0], 0), w - 1), min(max(sample[1], 0), h - 1)][:3]
    seen = set()
    stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    mask = Image.new("L", image.size, 0)
    mask_px = mask.load()
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, _ = pixels[x, y]
        if abs(r - target[0]) + abs(g - target[1]) + abs(b - target[2]) > threshold:
            continue
        mask_px[x, y] = 255
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    alpha = image.getchannel("A")
    alpha = ImageChops.subtract(alpha, mask.filter(ImageFilter.GaussianBlur(0.35)))
    image.putalpha(alpha)
    return image


def flat_remove_background(image: Image.Image, sample: tuple[int, int] = (0, 0), threshold: int = 42) -> Image.Image:
    image = image.convert("RGBA")
    w, h = image.size
    target = image.getpixel((min(max(sample[0], 0), w - 1), min(max(sample[1], 0), h - 1)))[:3]
    samples = [target]
    for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)):
        samples.append(image.getpixel((x, y))[:3])
    pixels = image.load()
    alpha = image.getchannel("A")
    alpha_px = alpha.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            if any(abs(r - sr) + abs(g - sg) + abs(b - sb) <= threshold for sr, sg, sb in samples):
                alpha_px[x, y] = 0
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    image.putalpha(alpha)
    return image


def color_key_background(image: Image.Image, target: tuple[int, int, int], threshold: int = 58) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    alpha = image.getchannel("A")
    alpha_px = alpha.load()
    w, h = image.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            if abs(r - target[0]) + abs(g - target[1]) + abs(b - target[2]) <= threshold:
                alpha_px[x, y] = 0
    image.putalpha(alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3)))
    return image


def remove_green_chroma(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    w, h = image.size
    bg = Image.new("L", image.size, 0)
    bg_px = bg.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            green_dominant = g > 24 and g - r > 10 and g - b > 10
            bright_key = g > 110 and g - r > 34 and g - b > 34
            if green_dominant or bright_key:
                bg_px[x, y] = 255
    alpha = ImageChops.subtract(image.getchannel("A"), bg.filter(ImageFilter.GaussianBlur(0.8)))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    image.putalpha(alpha)
    return image


def remove_flat_green_screen(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    alpha = image.getchannel("A")
    alpha_px = alpha.load()
    w, h = image.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = pixels[x, y]
            pure_key = g > 50 and g - r > 10 and g - b > 10
            if pure_key:
                alpha_px[x, y] = 0
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    image.putalpha(alpha)
    return image


def remove_dark_board_background(image: Image.Image, threshold: int = 62) -> Image.Image:
    image = image.convert("RGBA")
    r, g, b, a = image.split()
    bg = Image.eval(ImageChops.lighter(ImageChops.lighter(r, g), b), lambda v: 255 if v < threshold else 0)
    alpha = ImageChops.subtract(a, bg.filter(ImageFilter.GaussianBlur(0.45)))
    image.putalpha(alpha)
    return image


def remove_checker_background(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    w, h = image.size
    bg = Image.new("L", image.size, 0)
    bg_px = bg.load()
    stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    seen = set()
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, _ = pixels[x, y]
        if max(r, g, b) < 218 or max(r, g, b) - min(r, g, b) > 18:
            continue
        bg_px[x, y] = 255
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    alpha = ImageChops.subtract(image.getchannel("A"), bg.filter(ImageFilter.GaussianBlur(0.3)))
    image.putalpha(alpha)
    return image


def fit_subject(image: Image.Image, size: tuple[int, int], max_size: tuple[int, int], anchor_y: float = 0.92, resample: int = Image.Resampling.LANCZOS) -> Image.Image:
    subject = alpha_crop(image)
    subject.thumbnail(max_size, resample)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    x = (size[0] - subject.width) // 2
    y = int(size[1] * anchor_y - subject.height)
    out.alpha_composite(subject, (x, y))
    return out


def contact_shadow(size: tuple[int, int], bbox: tuple[int, int, int, int], alpha: int = 76) -> Image.Image:
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse(bbox, fill=(0, 0, 0, alpha))
    return shadow.filter(ImageFilter.GaussianBlur(1.1))


def hard_outline(image: Image.Image, width: int = 1, color: tuple[int, int, int] = (7, 9, 14)) -> Image.Image:
    mask = image.getchannel("A")
    expanded = mask
    for _ in range(width):
        expanded = expanded.filter(ImageFilter.MaxFilter(3))
    outline_mask = ImageChops.subtract(expanded, mask)
    outline = Image.new("RGBA", image.size, color + (255,))
    outline.putalpha(outline_mask)
    return Image.alpha_composite(outline, image)


def strip_green_key_pixels(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a > 0 and g > 110 and g - r > 34 and g - b > 34:
                pixels[x, y] = (r, g, b, 0)
    return image


def remove_small_alpha_components(image: Image.Image, min_pixels: int = 44) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    pixels = alpha.load()
    w, h = image.size
    visited: set[tuple[int, int]] = set()
    remove: list[tuple[int, int]] = []
    for y in range(h):
        for x in range(w):
            if (x, y) in visited or pixels[x, y] <= 8:
                continue
            stack = [(x, y)]
            component: list[tuple[int, int]] = []
            visited.add((x, y))
            while stack:
                cx, cy = stack.pop()
                component.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if nx < 0 or nx >= w or ny < 0 or ny >= h or (nx, ny) in visited:
                        continue
                    if pixels[nx, ny] <= 8:
                        continue
                    visited.add((nx, ny))
                    stack.append((nx, ny))
            if len(component) < min_pixels:
                remove.extend(component)
    if remove:
        alpha_px = alpha.load()
        for x, y in remove:
            alpha_px[x, y] = 0
        image.putalpha(alpha)
    return image


def keep_largest_alpha_component(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    pixels = alpha.load()
    w, h = image.size
    visited: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []
    for y in range(h):
        for x in range(w):
            if (x, y) in visited or pixels[x, y] <= 8:
                continue
            stack = [(x, y)]
            component: list[tuple[int, int]] = []
            visited.add((x, y))
            while stack:
                cx, cy = stack.pop()
                component.append((cx, cy))
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if nx < 0 or nx >= w or ny < 0 or ny >= h or (nx, ny) in visited:
                        continue
                    if pixels[nx, ny] <= 8:
                        continue
                    visited.add((nx, ny))
                    stack.append((nx, ny))
            components.append(component)
    if len(components) <= 1:
        return image
    keep = max(components, key=len)
    keep_set = set(keep)
    alpha_px = alpha.load()
    for component in components:
        if component is keep:
            continue
        for x, y in component:
            alpha_px[x, y] = 0
    image.putalpha(alpha)
    return image


def alpha_component_boxes(image: Image.Image, min_pixels: int = 900) -> list[tuple[int, int, int, int]]:
    alpha = image.getchannel("A")
    pixels = alpha.load()
    w, h = image.size
    visited: set[tuple[int, int]] = set()
    boxes: list[tuple[int, int, int, int]] = []
    for y in range(h):
        for x in range(w):
            if (x, y) in visited or pixels[x, y] <= 8:
                continue
            stack = [(x, y)]
            visited.add((x, y))
            min_x = max_x = x
            min_y = max_y = y
            count = 0
            while stack:
                cx, cy = stack.pop()
                count += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if nx < 0 or nx >= w or ny < 0 or ny >= h or (nx, ny) in visited:
                        continue
                    if pixels[nx, ny] <= 8:
                        continue
                    visited.add((nx, ny))
                    stack.append((nx, ny))
            if count >= min_pixels:
                boxes.append((min_x, min_y, max_x + 1, max_y + 1))
    return boxes


def extract_v6_source_cells(board: Image.Image) -> list[list[Image.Image]]:
    keyed = remove_flat_green_screen(board)
    boxes = alpha_component_boxes(keyed, 1200)
    boxes = sorted(boxes, key=lambda box: ((box[1] + box[3]) / 2, (box[0] + box[2]) / 2))
    rows: list[list[tuple[int, int, int, int]]] = []
    for box in boxes:
        cy = (box[1] + box[3]) / 2
        for row in rows:
            row_cy = sum((item[1] + item[3]) / 2 for item in row) / len(row)
            if abs(cy - row_cy) < board.height * 0.1:
                row.append(box)
                break
        else:
            rows.append([box])
    rows = [sorted(row, key=lambda box: (box[0] + box[2]) / 2)[:PLAYER_FRAMES_PER_DIRECTION] for row in rows[:4]]
    if len(rows) < 4 or any(len(row) < PLAYER_FRAMES_PER_DIRECTION for row in rows):
        raise ValueError(f"V6 Accord board component extraction expected 4x3 subjects, got {[len(row) for row in rows]}")
    source_rows: list[list[Image.Image]] = []
    for row in rows:
        source_row: list[Image.Image] = []
        for box in row:
            pad = 18
            crop_box = (
                max(0, box[0] - pad),
                max(0, box[1] - pad),
                min(board.width, box[2] + pad),
                min(board.height, box[3] + pad),
            )
            source_row.append(keyed.crop(crop_box))
        source_rows.append(source_row)
    return source_rows


def extract_accord_side_walk_east_cells(path: Path) -> list[Image.Image]:
    keyed = remove_checker_background(rgba(path))
    boxes = alpha_component_boxes(keyed, 4000)
    boxes = sorted(boxes, key=lambda box: (box[0] + box[2]) / 2)[:PLAYER_FRAMES_PER_DIRECTION]
    if len(boxes) != PLAYER_FRAMES_PER_DIRECTION:
        raise ValueError(f"{path.name} side-walk extraction expected 3 subjects, got {len(boxes)}")
    cells: list[Image.Image] = []
    for box in boxes:
        pad = 22
        crop_box = (
            max(0, box[0] - pad),
            max(0, box[1] - pad),
            min(keyed.width, box[2] + pad),
            min(keyed.height, box[3] + pad),
        )
        cells.append(keyed.crop(crop_box))
    return cells


def terrain_cell(board: Image.Image, index: int) -> Image.Image:
    col = index % 4
    row = index // 4
    cell_w = board.width // 4
    cell_h = board.height // 4
    x0 = col * cell_w + 8
    y0 = row * cell_h + 8
    x1 = (col + 1) * cell_w - 8
    y1 = (row + 1) * cell_h - 8
    return remove_dark_board_background(board.crop((x0, y0, x1, y1)), 68)


def diamond_mask(size: tuple[int, int]) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).polygon([(w // 2, -1), (w + 1, h // 2), (w // 2, h + 1), (-1, h // 2)], fill=255)
    return mask


def authored_ground_mask(size: tuple[int, int]) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).polygon([(w // 2, -4), (w + 4, h // 2), (w // 2, h + 4), (-4, h // 2)], fill=255)
    return mask


def terrain_band_id(x: int, y: int) -> str:
    if -4 <= x <= 4:
        return "main_plaza_cross_x"
    if -4 <= y <= 4:
        return "main_plaza_cross_y"
    if -27 <= x <= -10 and -22 <= y <= -6:
        return "drone_yard_floor"
    if 10 <= x <= 27 and -18 <= y <= -3:
        return "barricade_corridor_floor"
    if 12 <= x <= 25 and 10 <= y <= 23:
        return "terminal_pad"
    if -28 <= x <= -13 and 12 <= y <= 26:
        return "breach_corruption"
    if x >= 7 and y <= -4:
        return "evacuation_road"
    if x <= -10 and y >= 7:
        return "southwest_rubble"
    return "civic_field"


def terrain_base_color(band: str) -> tuple[int, int, int]:
    colors = {
        "main_plaza_cross_x": (59, 57, 52),
        "main_plaza_cross_y": (58, 56, 52),
        "drone_yard_floor": (55, 57, 55),
        "barricade_corridor_floor": (52, 50, 47),
        "terminal_pad": (49, 57, 56),
        "breach_corruption": (48, 42, 51),
        "evacuation_road": (51, 50, 47),
        "southwest_rubble": (58, 56, 51),
        "civic_field": (56, 57, 54),
    }
    return colors.get(band, colors["civic_field"])


def terrain_cell_for_band(cells: list[Image.Image], band: str, salt: int) -> Image.Image:
    indexes = {
        "main_plaza_cross_x": [0, 1, 4, 21],
        "main_plaza_cross_y": [0, 1, 4, 21],
        "drone_yard_floor": [8, 24, 29, 2],
        "barricade_corridor_floor": [7, 8, 10, 11],
        "terminal_pad": [12, 13, 14, 15],
        "breach_corruption": [16, 17, 18, 20],
        "evacuation_road": [7, 8, 26, 11],
        "southwest_rubble": [9, 10, 23, 25],
        "civic_field": [0, 1, 2, 21],
    }.get(band, [0, 1, 2, 21])
    return cells[indexes[salt % len(indexes)] % len(cells)]


def iso_xy(x: float, y: float) -> tuple[int, int]:
    return (int(round((x - y) * 32 + AUTHORED_GROUND_ORIGIN_X)), int(round((x + y) * 16 + AUTHORED_GROUND_ORIGIN_Y)))


def terrain_texture_tile(cell: Image.Image, base: tuple[int, int, int], variant: int) -> Image.Image:
    subject = alpha_crop(cell)
    crop_w = max(1, int(subject.width * 0.82))
    crop_h = max(1, int(subject.height * 0.46))
    x0 = max(0, min(subject.width - crop_w, int(subject.width * (0.08 + (variant % 5) * 0.035))))
    y0 = max(0, min(subject.height - crop_h, int(subject.height * (0.28 + (variant % 4) * 0.035))))
    patch = subject.crop((x0, y0, x0 + crop_w, y0 + crop_h)).resize((64, 32), Image.Resampling.LANCZOS)
    patch = ImageEnhance.Brightness(patch).enhance(0.56)
    patch = ImageEnhance.Contrast(patch).enhance(0.42)
    tile = Image.new("RGBA", (64, 32), base + (255,))
    mask = authored_ground_mask((64, 32))
    texture_alpha = patch.getchannel("A").point(lambda a: int(a * 0.075))
    patch.putalpha(ImageChops.multiply(texture_alpha, mask))
    tile.alpha_composite(patch)
    tile.putalpha(mask)
    return tile


def draw_feathered_iso_patch(canvas: Image.Image, points: list[tuple[float, float]], color: tuple[int, int, int], alpha: int, blur: float) -> None:
    mask = Image.new("L", canvas.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon([coord for point in points for coord in iso_xy(point[0], point[1])], fill=alpha)
    mask = mask.filter(ImageFilter.GaussianBlur(blur))
    overlay = Image.new("RGBA", canvas.size, color + (255,))
    overlay.putalpha(mask)
    canvas.alpha_composite(overlay)


def material_patch_frame(atlas: Image.Image, index: int) -> Image.Image:
    return atlas.crop(((index % 3) * 256, (index // 3) * 128, (index % 3 + 1) * 256, (index // 3 + 1) * 128))


def draw_material_chunk_field(
    canvas: Image.Image,
    atlas: Image.Image,
    points: list[tuple[float, float]],
    patch_index: int,
    alpha: float,
    step_x: int = 192,
    step_y: int = 96,
) -> None:
    mask = Image.new("L", canvas.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.polygon([coord for point in points for coord in iso_xy(point[0], point[1])], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(40))
    patch = material_patch_frame(atlas, patch_index)
    field = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    start_y = AUTHORED_GROUND_ORIGIN_Y - 1200
    end_y = AUTHORED_GROUND_ORIGIN_Y + 1200
    start_x = AUTHORED_GROUND_ORIGIN_X - 2200
    end_x = AUTHORED_GROUND_ORIGIN_X + 2200
    row = 0
    for py in range(start_y, end_y, step_y):
        offset = (row % 2) * (step_x // 2)
        for px in range(start_x - offset, end_x, step_x):
            field.alpha_composite(patch, (px, py))
        row += 1
    field_alpha = field.getchannel("A")
    field.putalpha(ImageChops.multiply(field_alpha.point(lambda value: int(value * alpha)), mask))
    canvas.alpha_composite(field)


def draw_material_stamp(
    canvas: Image.Image,
    atlas: Image.Image,
    world_x: float,
    world_y: float,
    patch_index: int,
    scale: float,
    alpha: float,
    squash: float = 0.42,
) -> None:
    patch = material_patch_frame(atlas, patch_index)
    patch = patch.resize((max(8, int(patch.width * scale)), max(8, int(patch.height * scale * squash))), Image.Resampling.LANCZOS)
    mask = patch.getchannel("A").filter(ImageFilter.GaussianBlur(8.0))
    patch.putalpha(mask.point(lambda value: int(value * alpha)))
    sx, sy = iso_xy(world_x, world_y)
    canvas.alpha_composite(patch, (sx - patch.width // 2, sy - patch.height // 2))


def draw_iso_ground_stroke(
    layer: Image.Image,
    points: list[tuple[float, float]],
    color: tuple[int, int, int, int],
    width: int,
    blur: float = 0.0,
) -> None:
    stroke = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(stroke)
    draw.line([iso_xy(x, y) for x, y in points], fill=color, width=width, joint="curve")
    if blur:
        stroke = stroke.filter(ImageFilter.GaussianBlur(blur))
    layer.alpha_composite(stroke)


def draw_embedded_rubble(layer: Image.Image, world_x: float, world_y: float, count: int, spread_x: float, spread_y: float, seed: int) -> None:
    rubble = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(rubble)
    palette_bits = [(100, 92, 78, 76), (54, 57, 58, 82), (141, 130, 104, 58), (21, 24, 28, 86), (177, 124, 60, 54)]
    for i in range(count):
        ox = (((seed + i * 37) % 101) / 100 - 0.5) * spread_x
        oy = (((seed + i * 59) % 101) / 100 - 0.5) * spread_y
        sx, sy = iso_xy(world_x + ox, world_y + oy)
        w = 7 + ((seed + i * 11) % 18)
        h = 2 + ((seed + i * 7) % 7)
        skew = ((seed + i * 5) % 9) - 4
        color = palette_bits[(seed + i) % len(palette_bits)]
        draw.polygon(
            [
                (sx - w * 0.5, sy + skew),
                (sx - w * 0.04, sy - h),
                (sx + w * 0.52, sy - h * 0.2 + skew),
                (sx + w * 0.08, sy + h),
            ],
            fill=color,
        )
    layer.alpha_composite(rubble.filter(ImageFilter.GaussianBlur(0.25)))


def draw_civic_seams_and_damage(canvas: Image.Image) -> None:
    detail = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    seam_sets = [
        ([(-30, -2.5), (-18, -2.2), (-6, -1.5), (6, -1.2), (18, -0.7), (30, -0.2)], (11, 14, 17, 46), 4, 1.2),
        ([(-28, 4.6), (-16, 4.2), (-4, 3.8), (8, 3.4), (21, 2.8), (30, 2.2)], (95, 86, 67, 25), 3, 0.7),
        ([(-2.2, -30), (-2.0, -18), (-1.5, -7), (-1.1, 3), (-0.6, 15), (-0.3, 30)], (10, 13, 16, 54), 4, 1.1),
        ([(4.8, -28), (4.3, -16), (3.6, -4), (3.1, 8), (2.7, 21), (2.2, 30)], (109, 98, 77, 22), 3, 0.7),
    ]
    for points, color, width, blur in seam_sets:
        draw_iso_ground_stroke(detail, points, color, width, blur)
    fracture_sets = [
        [(-11, -7), (-8, -5.2), (-5.4, -5.7), (-2.6, -3.8)],
        [(6, -9), (9.5, -7.8), (12, -8.5), (15.4, -6.3)],
        [(-7, 10), (-3.8, 8.8), (0.2, 10.7), (4, 9.6)],
        [(10, 8), (13.8, 10.4), (17, 10.1), (20.5, 12.2)],
        [(-23, 15), (-20, 17), (-16.8, 16.2), (-13, 19.4)],
    ]
    for index, points in enumerate(fracture_sets):
        draw_iso_ground_stroke(detail, points, (6, 9, 12, 70), 2 + index % 2, 0.35)
        if index % 2 == 0:
            draw_iso_ground_stroke(detail, points[1:], (116, 90, 76, 36), 1, 0.2)
    canvas.alpha_composite(detail)


def draw_prop_damage_interfaces(canvas: Image.Image) -> None:
    damage = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(damage)
    contact_ellipses = [
        (-6.5, 2.5, 170, 44, (5, 7, 10, 72)),
        (9.2, -0.4, 128, 38, (6, 10, 12, 62)),
        (-4.5, 6.2, 142, 36, (10, 8, 7, 58)),
        (-13.5, 11.2, 190, 44, (26, 10, 32, 82)),
        (15.0, -8.5, 136, 34, (9, 8, 7, 62)),
        (-17.0, -13.0, 214, 48, (5, 8, 10, 70)),
        (17.0, -10.0, 174, 38, (9, 8, 7, 66)),
        (18.0, 16.0, 156, 42, (4, 14, 15, 66)),
        (-21.0, 18.0, 220, 48, (31, 10, 38, 88)),
    ]
    for world_x, world_y, width, height, color in contact_ellipses:
        sx, sy = iso_xy(world_x, world_y)
        draw.ellipse((sx - width // 2, sy - height // 2 + 6, sx + width // 2, sy + height // 2 + 6), fill=color)
    damage = damage.filter(ImageFilter.GaussianBlur(3.4))
    canvas.alpha_composite(damage)

    cables = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    for points, color, width in [
        ([(-7, 3), (-4.8, 4.8), (-2.1, 5.2), (0.5, 6.5)], (5, 10, 13, 82), 5),
        ([(-6.2, 2.1), (-3.6, 0.8), (-1.5, 0.2), (1.8, -0.8)], (49, 200, 196, 42), 2),
    ]:
        draw_iso_ground_stroke(cables, points, color, width, 0.45)
    draw_iso_ground_stroke(cables, [(9.0, -0.3), (7.1, 0.7), (4.7, 0.7), (2.5, 1.9)], (4, 8, 11, 84), 4, 0.35)
    draw_iso_ground_stroke(cables, [(18, 16), (14.5, 13.4), (10.8, 11.4), (7, 8.8)], (46, 213, 203, 44), 2, 0.25)
    draw_iso_ground_stroke(cables, [(-13.5, 11.2), (-11.2, 11.6), (-8.7, 12.8), (-6.2, 13.6)], (185, 57, 92, 48), 3, 0.35)
    canvas.alpha_composite(cables)

    for world_x, world_y, count, spread_x, spread_y, seed in [
        (-6.5, 2.5, 38, 6.4, 3.2, 13),
        (-4.5, 6.2, 30, 5.2, 2.6, 29),
        (9.2, -0.4, 24, 4.4, 2.2, 41),
        (15, -8.5, 26, 5.4, 2.4, 57),
        (-13.5, 11.2, 36, 7.2, 3.2, 73),
        (-17, -13, 42, 7.8, 3.4, 91),
        (18, 16, 26, 5.8, 2.8, 111),
        (-21, 18, 44, 8.2, 3.6, 131),
    ]:
        draw_embedded_rubble(canvas, world_x, world_y, count, spread_x, spread_y, seed)


def draw_prop_grounding(canvas: Image.Image, atlas: Image.Image) -> None:
    prop_marks = [
        (-6.5, 2.5, 4, 1.35, 0.46),
        (-7.8, 1.6, 1, 0.74, 0.22),
        (9.2, -0.4, 2, 0.88, 0.38),
        (8.3, -1.0, 5, 0.55, 0.24),
        (-4.5, 6.2, 4, 0.98, 0.36),
        (-5.8, 6.9, 0, 0.62, 0.18),
        (-13.5, 11.2, 3, 1.18, 0.46),
        (-12.2, 10.4, 4, 0.72, 0.22),
        (15.0, -8.5, 1, 0.9, 0.32),
        (-17.0, -13.0, 4, 1.55, 0.36),
        (17.0, -10.0, 1, 1.25, 0.34),
        (18.0, 16.0, 2, 1.06, 0.34),
        (-21.0, 18.0, 3, 1.42, 0.42),
    ]
    for world_x, world_y, patch_index, scale, alpha in prop_marks:
        draw_material_stamp(canvas, atlas, world_x, world_y, patch_index, scale, alpha)


def draw_scuffed_transition_stamps(canvas: Image.Image, atlas: Image.Image) -> None:
    stamps = [
        (-10, -2, 5, 1.2, 0.22),
        (-2, -7, 5, 0.85, 0.18),
        (6, 4, 5, 0.95, 0.18),
        (8, -9, 1, 1.18, 0.26),
        (18, -5, 1, 0.86, 0.22),
        (23, -14, 4, 0.78, 0.2),
        (-20, -8, 4, 1.0, 0.24),
        (-16, -18, 1, 0.74, 0.19),
        (15, 10, 2, 0.82, 0.22),
        (24, 18, 2, 0.74, 0.18),
        (-24, 13, 3, 0.88, 0.24),
        (-16, 24, 3, 0.72, 0.22),
        (-11, 10, 4, 1.05, 0.2),
        (3, 16, 4, 0.9, 0.18),
    ]
    for world_x, world_y, patch_index, scale, alpha in stamps:
        draw_material_stamp(canvas, atlas, world_x, world_y, patch_index, scale, alpha, 0.36)


def draw_ground_grime_and_scuffs(canvas: Image.Image) -> None:
    grime = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(grime)
    for index in range(180):
        x = (index * 997 + (index % 17) * 59) % canvas.width
        y = (index * 619 + (index % 23) * 47) % canvas.height
        width = 18 + (index * 37) % 74
        height = 2 + (index * 19) % 9
        color = (15, 18, 18, 5 + (index % 4) * 2) if index % 4 else (111, 104, 88, 5)
        draw.ellipse((x - width, y - height, x + width, y + height), fill=color)
    for index in range(150):
        x = (index * 431 + 211) % canvas.width
        y = (index * 683 + 137) % canvas.height
        length = 20 + (index * 13) % 74
        slant = -0.42 if index % 2 else 0.42
        points = [
            (x - length * 0.5, y - length * slant * 0.18),
            (x - length * 0.08, y + (index % 7) - 3),
            (x + length * 0.5, y + length * slant * 0.18),
        ]
        draw.line(points, fill=(8, 11, 13, 16), width=1)
    grime = grime.filter(ImageFilter.GaussianBlur(0.45))
    canvas.alpha_composite(grime)


def build_authored_ground(cells: list[Image.Image]) -> None:
    canvas = Image.new("RGBA", (AUTHORED_GROUND_WIDTH, AUTHORED_GROUND_HEIGHT), (17, 21, 27, 255))
    draw = ImageDraw.Draw(canvas)
    for y in range(WORLD_MIN, WORLD_MAX + 1):
        for x in range(WORLD_MIN, WORLD_MAX + 1):
            band = terrain_band_id(x, y)
            base = terrain_base_color(band)
            salt = abs((x + 37) * 73856093 ^ (y - 91) * 19349663)
            sx, sy = iso_xy(x, y)
            tile = terrain_texture_tile(terrain_cell_for_band(cells, band, salt), base, salt)
            canvas.alpha_composite(tile, (sx - 32, sy - 16))

    patch_atlas_path = ROOT / "assets" / "tiles" / "armistice_plaza" / "material_patches.png"
    if patch_atlas_path.exists():
        patch_atlas = rgba(patch_atlas_path)
        draw_material_chunk_field(canvas, patch_atlas, [(-30, -30), (30, -30), (30, 30), (-30, 30)], 0, 0.12, 384, 192)
        draw_material_chunk_field(canvas, patch_atlas, [(-12, -9), (10, -9), (12, 11), (-10, 13)], 5, 0.18, 384, 192)
        draw_material_chunk_field(canvas, patch_atlas, [(6, -23), (30, -17), (30, 0), (7, -3)], 1, 0.2, 384, 192)
        draw_material_chunk_field(canvas, patch_atlas, [(-30, -24), (-7, -24), (-7, -4), (-30, -3)], 4, 0.2, 384, 192)
        draw_material_chunk_field(canvas, patch_atlas, [(9, 7), (29, 8), (29, 26), (9, 26)], 2, 0.22, 384, 192)
        draw_material_chunk_field(canvas, patch_atlas, [(-30, 9), (-10, 10), (-8, 30), (-30, 29)], 3, 0.24, 384, 192)
        draw_material_chunk_field(canvas, patch_atlas, [(-17, 5), (11, 4), (16, 23), (-18, 26)], 4, 0.16, 384, 192)
        draw_scuffed_transition_stamps(canvas, patch_atlas)
        draw_prop_grounding(canvas, patch_atlas)

    # Broad generated-source material groups, baked into one terrain image so they read as authored ground.
    draw_feathered_iso_patch(canvas, [(-9, -8), (8, -8), (10, 9), (-8, 10)], (101, 92, 76), 32, 54)
    draw_feathered_iso_patch(canvas, [(8, -20), (29, -15), (29, -2), (9, -4)], (41, 38, 36), 34, 54)
    draw_feathered_iso_patch(canvas, [(-28, -22), (-9, -23), (-8, -6), (-28, -5)], (42, 51, 55), 32, 54)
    draw_feathered_iso_patch(canvas, [(11, 9), (27, 10), (27, 24), (11, 24)], (32, 73, 73), 34, 54)
    draw_feathered_iso_patch(canvas, [(-29, 11), (-12, 12), (-10, 28), (-29, 27)], (42, 22, 55), 42, 58)
    draw_feathered_iso_patch(canvas, [(-13, 7), (9, 6), (13, 21), (-15, 24)], (74, 67, 56), 30, 52)
    draw_civic_seams_and_damage(canvas)
    draw_prop_damage_interfaces(canvas)
    draw_ground_grime_and_scuffs(canvas)

    save(ROOT / "assets" / "tiles" / "armistice_plaza" / "authored_ground.png", canvas)


def tile_from_cell(cell: Image.Image, variant: int) -> Image.Image:
    subject = alpha_crop(cell)
    if variant % 2:
        subject = subject.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    crop_w = max(1, int(subject.width * (0.82 if variant % 3 else 0.9)))
    crop_h = max(1, int(subject.height * 0.58))
    x0 = max(0, (subject.width - crop_w) // 2 + ((variant % 5) - 2) * 8)
    y0 = max(0, int(subject.height * 0.34) + ((variant % 4) - 1) * 5)
    patch = subject.crop((x0, y0, min(subject.width, x0 + crop_w), min(subject.height, y0 + crop_h)))
    patch = patch.resize((64, 40), Image.Resampling.LANCZOS).crop((0, 4, 64, 36))
    patch = ImageEnhance.Contrast(patch).enhance(1.08 if variant % 2 else 0.96)
    patch = ImageEnhance.Color(patch).enhance(1.02)
    alpha = patch.getchannel("A")
    patch.putalpha(ImageChops.multiply(alpha, diamond_mask((64, 32))))
    return patch


def build_ground_and_transitions() -> None:
    board = rgba(CHATGPT / "armistice_terrain_material_board_v1.png")
    pixellab_terrain = [rgba(PIXELLAB / "terrain_flat_128_b" / f"frame_{i:02d}.png") for i in range(4) if (PIXELLAB / "terrain_flat_128_b" / f"frame_{i:02d}.png").exists()]
    cells = [terrain_cell(board, i) for i in range(16)] + pixellab_terrain
    atlas = Image.new("RGBA", (512, 128), (0, 0, 0, 0))
    for i in range(32):
        tile = tile_from_cell(cells[i % len(cells)], i)
        atlas.alpha_composite(tile, ((i % 8) * 64, (i // 8) * 32))
    save(ROOT / "assets" / "tiles" / "armistice_plaza" / "ground_atlas.png", atlas)

    transition = Image.new("RGBA", (384, 96), (0, 0, 0, 0))
    for i in range(8):
        left = tile_from_cell(cells[(i * 2) % len(cells)], i)
        right = tile_from_cell(cells[(i * 2 + 7) % len(cells)], i + 11)
        frame = Image.new("RGBA", (96, 48), (0, 0, 0, 0))
        frame.alpha_composite(left.resize((96, 48), Image.Resampling.LANCZOS))
        overlay = right.resize((96, 48), Image.Resampling.LANCZOS)
        mask = diamond_mask((96, 48))
        cut = Image.new("L", (96, 48), 0)
        draw = ImageDraw.Draw(cut)
        if i % 4 == 0:
            draw.polygon([(0, 24), (48, 0), (36, 22), (48, 48)], fill=190)
        elif i % 4 == 1:
            draw.polygon([(96, 24), (48, 0), (60, 22), (48, 48)], fill=190)
        elif i % 4 == 2:
            draw.polygon([(0, 24), (30, 14), (48, 20), (66, 14), (96, 24), (48, 48)], fill=170)
        else:
            draw.polygon([(48, 0), (96, 24), (66, 33), (48, 26), (30, 33), (0, 24)], fill=170)
        overlay.putalpha(ImageChops.multiply(overlay.getchannel("A"), ImageChops.multiply(mask, cut.filter(ImageFilter.GaussianBlur(1.0)))))
        frame.alpha_composite(overlay)
        transition.alpha_composite(frame, ((i % 4) * 96, (i // 4) * 48))
    save(ROOT / "assets" / "tiles" / "armistice_plaza" / "transition_atlas.png", transition)

    patch_atlas = Image.new("RGBA", (768, 256), (0, 0, 0, 0))
    patch_specs = [
        (0, (0, 1, 4, 21), 0.96),    # civic stone/concrete
        (1, (4, 7, 8, 11), 1.02),    # asphalt/road/rubble
        (2, (12, 13, 14, 15), 1.04), # terminal/cable floor
        (3, (16, 17, 18, 20), 1.06), # AGI breach corruption
        (4, (8, 9, 10, 25), 1.0),    # barricade/rubble field
        (5, (2, 5, 23, 24), 0.94),   # worn plaza wear
    ]
    for index, source_indexes, contrast in patch_specs:
        patch = Image.new("RGBA", (256, 128), (0, 0, 0, 0))
        for layer_index, source_index in enumerate(source_indexes):
            cell = cells[source_index % len(cells)]
            subject = alpha_crop(cell)
            crop_w = max(1, int(subject.width * (0.74 + 0.04 * (layer_index % 2))))
            crop_h = max(1, int(subject.height * (0.42 + 0.03 * ((layer_index + index) % 2))))
            x0 = max(0, min(subject.width - crop_w, int(subject.width * (0.12 + 0.09 * ((index + layer_index) % 4)))))
            y0 = max(0, min(subject.height - crop_h, int(subject.height * (0.28 + 0.07 * ((index + layer_index) % 3)))))
            sample = subject.crop((x0, y0, x0 + crop_w, y0 + crop_h)).resize((256, 128), Image.Resampling.LANCZOS)
            sample = ImageEnhance.Contrast(sample).enhance(contrast)
            sample = ImageEnhance.Brightness(sample).enhance(0.62 if index in {0, 5} else 0.54)
            mask = diamond_mask((256, 128))
            if layer_index:
                edge = Image.new("L", (256, 128), 0)
                draw = ImageDraw.Draw(edge)
                if layer_index == 1:
                    draw.polygon([(0, 64), (128, 0), (104, 54), (128, 128)], fill=104)
                elif layer_index == 2:
                    draw.polygon([(256, 64), (128, 0), (152, 54), (128, 128)], fill=92)
                else:
                    draw.polygon([(0, 64), (76, 38), (128, 50), (180, 38), (256, 64), (128, 128)], fill=74)
                mask = ImageChops.multiply(mask, edge.filter(ImageFilter.GaussianBlur(5.0)))
            mask = mask.filter(ImageFilter.GaussianBlur(7.0))
            sample.putalpha(ImageChops.multiply(sample.getchannel("A"), mask))
            patch.alpha_composite(sample)
        patch_atlas.alpha_composite(patch, ((index % 3) * 256, (index // 3) * 128))
    save(ROOT / "assets" / "tiles" / "armistice_plaza" / "material_patches.png", patch_atlas)
    build_authored_ground(cells)


def prop_from_pixellab(path: Path, size: tuple[int, int], max_size: tuple[int, int], anchor_y: float = 0.9) -> Image.Image:
    canvas = contact_shadow(size, (size[0] // 2 - max_size[0] // 3, int(size[1] * anchor_y) - 18, size[0] // 2 + max_size[0] // 3, int(size[1] * anchor_y) + 12), 96)
    dirt = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(dirt)
    cx = size[0] // 2
    cy = int(size[1] * anchor_y) - 3
    draw.ellipse((cx - max_size[0] * 0.45, cy - 13, cx + max_size[0] * 0.45, cy + 15), fill=(30, 27, 23, 58))
    for i in range(18):
        px = int(cx + ((i * 37) % 100 - 50) * max_size[0] / 120)
        py = int(cy + ((i * 53) % 36 - 18) * max_size[1] / 170)
        draw.rectangle((px - 2, py - 1, px + 3 + (i % 3), py + 1), fill=((70, 62, 50, 42) if i % 3 else (18, 20, 24, 50)))
    canvas = Image.alpha_composite(canvas, dirt.filter(ImageFilter.GaussianBlur(0.6)))
    subject = fit_subject(rgba(path), size, max_size, anchor_y)
    subject = hard_outline(subject, 1)
    return Image.alpha_composite(canvas, subject)


def build_props() -> None:
    props = {
        "treaty_monument.png": (PIXELLAB / "setpieces_128" / "frame_00.png", (280, 236), (236, 202), 0.91),
        "barricade_corridor_set.png": (PIXELLAB / "setpieces_128" / "frame_01.png", (284, 184), (250, 148), 0.88),
        "crashed_drone_yard_wreck.png": (PIXELLAB / "drone_wreck_128" / "frame_03.png", (286, 210), (262, 174), 0.88),
        "emergency_alignment_terminal.png": (PIXELLAB / "setpieces_128" / "frame_02.png", (268, 226), (220, 194), 0.92),
        "cosmic_breach_crack.png": (PIXELLAB / "setpieces_128" / "frame_03.png", (304, 184), (248, 162), 0.9),
    }
    for name, (src, size, max_size, anchor_y) in props.items():
        save(ROOT / "assets" / "props" / "armistice_plaza" / name, prop_from_pixellab(src, size, max_size, anchor_y))


def board_crop(board: Image.Image, box: tuple[int, int, int, int], bg_sample: tuple[int, int] = (4, 4), threshold: int = 42) -> Image.Image:
    crop = board.crop(box)
    return flat_remove_background(flood_remove_background(crop, bg_sample, threshold), bg_sample, threshold)


def actor_crop(board: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    return color_key_background(board.crop(box), board.getpixel((12, 12))[:3], 62)


def pixel_lab_walk_frame(gif_path: Path, index: int) -> Image.Image:
    image = Image.open(gif_path)
    frames = [frame.convert("RGBA") for frame in ImageSequence.Iterator(image)]
    if not frames:
        raise ValueError(f"{gif_path} did not contain animation frames")
    return frames[index % len(frames)]


def class_roster_row_y(class_id: str, direction_index: int = 0) -> int:
    return (CLASS_IDS.index(class_id) * PLAYER_ROWS_PER_CLASS + direction_index) * PLAYER_FRAME_SIZE


def make_class_card_frame(source: Image.Image) -> Image.Image:
    frame = fit_subject(source, (PLAYER_FRAME_SIZE, PLAYER_FRAME_SIZE), (74, 72), 0.92)
    return hard_outline(frame, 1)


def make_idle_triplet(source: Image.Image, frame_size: int = PLAYER_FRAME_SIZE) -> Image.Image:
    frame = make_class_card_frame(source)
    sheet = Image.new("RGBA", (frame_size * PLAYER_FRAMES_PER_DIRECTION, frame_size), (0, 0, 0, 0))
    for col in range(PLAYER_FRAMES_PER_DIRECTION):
        sheet.alpha_composite(frame, (col * frame_size, 0))
    return sheet


def extract_chatgpt_class_card_sources() -> None:
    class_board_path = CHATGPT / "build_select_class_card_board_v1.png"
    if class_board_path.exists():
        board = rgba(class_board_path)
        cell_w = board.width // 4
        cell_h = board.height // 3
        for index, class_id in enumerate(CLASS_IDS):
            out = CLASS_CARD_SOURCES / f"{class_id}.png"
            if out.exists():
                continue
            col = index % 4
            row = index // 4
            margin_x = int(cell_w * 0.07)
            margin_y = int(cell_h * 0.08)
            box = (
                col * cell_w + margin_x,
                row * cell_h + margin_y,
                (col + 1) * cell_w - margin_x,
                (row + 1) * cell_h - margin_y,
            )
            source = remove_dark_board_background(board.crop(box), 48)
            save(out, alpha_crop(source))

    board_path = ROOT / "assets" / "concepts" / "milestone_32_class_comind_identity_concept.png"
    if not board_path.exists():
        return
    board = rgba(board_path)
    crops = {
        "signal_vanguard": (585, 72, 891, 466),
        "nullbreaker_ronin": (884, 72, 1195, 466),
        "redline_surgeon": (1185, 72, 1498, 466),
    }
    for class_id, box in crops.items():
        out = CLASS_CARD_SOURCES / f"{class_id}.png"
        if out.exists():
            continue
        source = remove_dark_board_background(board.crop(box), 72)
        save(out, alpha_crop(source))


def build_class_roster_card_overrides(roster_path: Path) -> None:
    if not roster_path.exists():
        return
    extract_chatgpt_class_card_sources()
    roster = rgba(roster_path)
    for class_id in CLASS_IDS:
        if class_id == "accord_striker" and ACCORD_COHERENT_BOARD.exists():
            continue
        source_path = CLASS_CARD_SOURCES / f"{class_id}.png"
        if not source_path.exists():
            continue
        triplet = make_idle_triplet(rgba(source_path))
        y = class_roster_row_y(class_id, 0)
        roster.paste((0, 0, 0, 0), (0, y, triplet.width, y + PLAYER_FRAME_SIZE))
        roster.alpha_composite(triplet, (0, y))
    save(roster_path, roster)


def build_chatgpt_accord_sheet() -> bool:
    board_path = ACCORD_FULL_REBUILD_BOARD_V7 if ACCORD_FULL_REBUILD_BOARD_V7.exists() else ACCORD_FULL_REBUILD_BOARD_V6 if ACCORD_FULL_REBUILD_BOARD_V6.exists() else ACCORD_COHERENT_BOARD_V5 if ACCORD_COHERENT_BOARD_V5.exists() else ACCORD_COHERENT_BOARD_V4 if ACCORD_COHERENT_BOARD_V4.exists() else ACCORD_COHERENT_BOARD_V3 if ACCORD_COHERENT_BOARD_V3.exists() else ACCORD_COHERENT_BOARD_V2 if ACCORD_COHERENT_BOARD_V2.exists() else ACCORD_COHERENT_BOARD
    if not board_path.exists():
        return False
    board = rgba(board_path)
    sheet = Image.new("RGBA", (PLAYER_FRAME_SIZE * PLAYER_FRAMES_PER_DIRECTION, PLAYER_FRAME_SIZE * 4), (0, 0, 0, 0))
    cell_w = board.width // PLAYER_FRAMES_PER_DIRECTION
    cell_h = board.height // 4
    row_max_sizes = {0: (56, 63), 1: (56, 63), 2: (56, 63), 3: (56, 63)}
    v6_cells = extract_v6_source_cells(board) if board_path in (ACCORD_FULL_REBUILD_BOARD_V7, ACCORD_FULL_REBUILD_BOARD_V6) else None
    side_walk_east_cells = extract_accord_side_walk_east_cells(ACCORD_SIDE_WALK_EAST_V8) if ACCORD_SIDE_WALK_EAST_V8.exists() else None
    frames: list[list[Image.Image]] = []
    for row in range(4):
        frame_row: list[Image.Image] = []
        for col in range(PLAYER_FRAMES_PER_DIRECTION):
            if side_walk_east_cells and row == 1:
                source = side_walk_east_cells[col]
            elif side_walk_east_cells and row == 3:
                source = side_walk_east_cells[col].transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            elif v6_cells:
                source = v6_cells[row][col]
                if row == 3:
                    source = v6_cells[1][col].transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            else:
                source_row = row
                margin_x = int(cell_w * 0.1)
                margin_y = int(cell_h * 0.06)
                box = (
                    col * cell_w + margin_x,
                    source_row * cell_h + margin_y,
                    (col + 1) * cell_w - margin_x,
                    (source_row + 1) * cell_h - margin_y,
                )
                source = remove_green_chroma(board.crop(box))
            source = keep_largest_alpha_component(remove_small_alpha_components(source, 220))
            frame = fit_subject(source, (PLAYER_FRAME_SIZE, PLAYER_FRAME_SIZE), row_max_sizes[row], 0.91, Image.Resampling.NEAREST)
            frame = keep_largest_alpha_component(remove_small_alpha_components(strip_green_key_pixels(hard_outline(frame, 1))))
            frame_row.append(frame)
        frames.append(frame_row)
    for row, frame_row in enumerate(frames):
        for col, frame in enumerate(frame_row):
            sheet.alpha_composite(frame, (col * PLAYER_FRAME_SIZE, row * PLAYER_FRAME_SIZE))
    save(ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png", sheet)
    return True


def boss_board_crop(board: Image.Image, box: tuple[int, int, int, int], out_size: tuple[int, int], max_size: tuple[int, int], anchor_y: float = 0.9, outline_width: int = 1) -> Image.Image:
    subject = remove_green_chroma(board.crop(box))
    frame = fit_subject(subject, out_size, max_size, anchor_y)
    return hard_outline(frame, outline_width)


def build_oath_eater_and_vfx() -> bool:
    if not OATH_EATER_BOSS_VFX_BOARD.exists():
        return False
    board = rgba(OATH_EATER_BOSS_VFX_BOARD)
    pose_board = rgba(OATH_EATER_BOSS_POSE_BOARD) if OATH_EATER_BOSS_POSE_BOARD.exists() else board

    boss_source_boxes = (
        [(0, 0, 610, 590), (540, 0, 1240, 590), (600, 620, 1248, 1195)]
        if OATH_EATER_BOSS_POSE_BOARD.exists()
        else [(18, 28, 506, 378), (18, 28, 506, 378), (18, 28, 506, 378)]
    )
    boss_sheet = Image.new("RGBA", (128 * len(boss_source_boxes), 128), (0, 0, 0, 0))
    boss_shadow = contact_shadow((128, 128), (30, 105, 98, 120), 64)
    for index, boss_source_box in enumerate(boss_source_boxes):
        max_size = (104, 108) if index == 2 else (106, 108)
        boss = boss_board_crop(pose_board, boss_source_box, (128, 128), max_size, 0.89, 1)
        boss_sheet.alpha_composite(Image.alpha_composite(boss_shadow, boss), (index * 128, 0))
    save(ROOT / "assets" / "sprites" / "bosses" / "oath_eater.png", boss_sheet)

    portrait_source_box = (610, 42, 1050, 470) if OATH_EATER_BOSS_POSE_BOARD.exists() else (42, 464, 476, 950)
    portrait = boss_board_crop(pose_board, portrait_source_box, (160, 144), (152, 138), 0.92, 1)
    alpha = portrait.getchannel("A")
    alpha_draw = ImageDraw.Draw(alpha)
    alpha_draw.rectangle((0, 0, 159, 9), fill=0)
    alpha_draw.rectangle((145, 0, 159, 143), fill=0)
    portrait.putalpha(alpha)
    save(ROOT / "assets" / "portraits" / "oath_eater_title_card.png", portrait)

    effect_boxes = [
        (590, 410, 850, 580),   # projectile
        (1180, 410, 1370, 600), # impact small
        (1356, 418, 1530, 602), # impact medium
        (1110, 742, 1372, 966), # impact large / shard burst
        (1370, 710, 1530, 930), # pickup small
        (1370, 710, 1530, 930), # pickup medium
        (1370, 710, 1530, 930), # pickup large
        (570, 690, 920, 925),   # refusal aura / telegraph
        (930, 704, 1136, 932),  # damage badge / ground crack
        (855, 410, 1116, 580),  # projectile trail
    ]
    atlas = Image.new("RGBA", (320, 32), (0, 0, 0, 0))
    for index, box in enumerate(effect_boxes):
        frame = boss_board_crop(board, box, (32, 32), (31, 30), 0.58 if index in {0, 9} else 0.72, 0)
        atlas.alpha_composite(frame, (index * 32, 0))
    save(ROOT / "assets" / "sprites" / "effects" / "combat_effects_v1.png", atlas)
    return True


def enemy_animation_frames(source_dir: Path, fallback_source: Path) -> list[Image.Image]:
    files = sorted(source_dir.glob("frame_*.png")) if source_dir.exists() else []
    if len(files) >= 3:
        return [rgba(path) for path in files[:3]]
    if fallback_source.exists():
        source = rgba(fallback_source)
        return [source, source, source]
    return []


def extract_chatgpt_enemy_animation_sources() -> None:
    board_path = CHATGPT / "enemy_animation_source_board_v1.png"
    if not board_path.exists():
        return
    board = rgba(board_path)
    families = ["bad_outputs", "benchmark_gremlins", "context_rot_crabs"]
    cell_w = board.width // 3
    cell_h = board.height // 3
    for row, family in enumerate(families):
        out_dir = ENEMY_ANIMATION_SOURCES / family
        for col in range(3):
            out = out_dir / f"frame_{col:02d}.png"
            if out.exists():
                continue
            margin_x = int(cell_w * 0.08)
            margin_y = int(cell_h * 0.09)
            box = (
                col * cell_w + margin_x,
                row * cell_h + margin_y,
                (col + 1) * cell_w - margin_x,
                (row + 1) * cell_h - margin_y,
            )
            source = remove_dark_board_background(board.crop(box), 48)
            save(out, alpha_crop(source))


def build_enemy_sheet(name: str, source_dir: Path, fallback_source: Path) -> bool:
    frames = enemy_animation_frames(source_dir, fallback_source)
    if len(frames) < 3:
        return False
    sheet = Image.new("RGBA", (192, 64), (0, 0, 0, 0))
    for i, src in enumerate(frames[:3]):
        frame = fit_subject(src, (64, 64), (62, 60), 0.92)
        frame = hard_outline(frame, 1)
        sheet.alpha_composite(frame, (i * 64, 0))
    save(ROOT / "assets" / "sprites" / "enemies" / name, sheet)
    return True


def build_pixel_lab_player_sheet() -> bool:
    walk_dir = PIXELLAB / "accord_striker_walk_4dir"
    directions = ["south", "east", "north", "west"]
    gif_paths = [walk_dir / f"{direction}.gif" for direction in directions]
    if not all(path.exists() for path in gif_paths):
        return False
    sheet = Image.new("RGBA", (240, 320), (0, 0, 0, 0))
    source_frame_indexes = [0, 1, 3]
    for row, path in enumerate(gif_paths):
        for col in range(3):
            src = pixel_lab_walk_frame(path, source_frame_indexes[col])
            frame = fit_subject(src, (80, 80), (74, 70), 0.92)
            frame = hard_outline(frame, 1)
            sheet.alpha_composite(frame, (col * 80, row * 80))
    save(ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png", sheet)
    return True


def build_player_and_enemies() -> None:
    board = rgba(CHATGPT / "player_enemy_sprite_direction_board_v1.png")
    if not build_chatgpt_accord_sheet() and not build_pixel_lab_player_sheet():
        player_frames = [
            ((58, 24, 164, 132), False),
            ((202, 24, 326, 132), False),
            ((450, 20, 620, 142), False),
            ((646, 22, 832, 148), False),
            ((986, 26, 1190, 150), False),
            ((1236, 24, 1438, 150), False),
            ((42, 142, 184, 286), False),
            ((188, 142, 354, 286), False),
            ((454, 142, 636, 292), False),
            ((646, 22, 832, 148), True),
            ((986, 26, 1190, 150), True),
            ((1236, 24, 1438, 150), True),
        ]
        sheet = Image.new("RGBA", (240, 320), (0, 0, 0, 0))
        for row in range(4):
            for col in range(3):
                box, flip = player_frames[row * 3 + col]
                src = actor_crop(board, box)
                if flip:
                    src = src.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                frame = fit_subject(src, (80, 80), (74, 70), 0.92)
                frame = hard_outline(frame, 1)
                sheet.alpha_composite(frame, (col * 80, row * 80))
        save(ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png", sheet)

    class_roster = ROOT / "assets" / "sprites" / "players" / "class_roster_m49.png"
    accord_sheet = ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png"
    if class_roster.exists() and accord_sheet.exists():
        roster = rgba(class_roster)
        accord = rgba(accord_sheet)
        roster.alpha_composite(Image.new("RGBA", accord.size, (0, 0, 0, 0)), (0, 0))
        roster.paste((0, 0, 0, 0), (0, 0, accord.width, accord.height))
        roster.alpha_composite(accord, (0, 0))
        save(class_roster, roster)
        build_class_roster_card_overrides(class_roster)

    safe_enemy_dir = PIXELLAB / "enemies_bad_outputs_safe_96"
    extract_chatgpt_enemy_animation_sources()
    enemy_source_sets = {
        "bad_outputs_sheet.png": (ENEMY_ANIMATION_SOURCES / "bad_outputs", safe_enemy_dir / "frame_00.png"),
        "benchmark_gremlins_sheet.png": (ENEMY_ANIMATION_SOURCES / "benchmark_gremlins", safe_enemy_dir / "frame_02.png"),
        "context_rot_crabs_sheet.png": (ENEMY_ANIMATION_SOURCES / "context_rot_crabs", safe_enemy_dir / "frame_03.png"),
    }
    enemy_sets = {
        "bad_outputs_sheet.png": [
            (38, 642, 164, 748),
            (156, 642, 284, 748),
            (286, 642, 424, 750),
        ],
        "benchmark_gremlins_sheet.png": [
            (48, 266, 176, 380),
            (176, 264, 394, 380),
            (430, 264, 654, 388),
        ],
        "context_rot_crabs_sheet.png": [
            (26, 858, 178, 996),
            (166, 858, 338, 996),
            (322, 858, 506, 1004),
        ],
    }
    for name, (source_dir, fallback_source) in enemy_source_sets.items():
        if build_enemy_sheet(name, source_dir, fallback_source):
            continue
        boxes = enemy_sets[name]
        sheet = Image.new("RGBA", (192, 64), (0, 0, 0, 0))
        for i, box in enumerate(boxes):
            src = actor_crop(board, box)
            frame = fit_subject(src, (64, 64), (62, 60), 0.92)
            frame = hard_outline(frame, 1)
            sheet.alpha_composite(frame, (i * 64, 0))
        save(ROOT / "assets" / "sprites" / "enemies" / name, sheet)


def build_title_backdrop() -> None:
    image = rgba(CHATGPT / "armistice_target_frame_v1.png")
    w, h = image.size
    crop = image.crop((0, 0, w, h))
    crop.thumbnail((1280, 720), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (1280, 720), (6, 8, 12, 255))
    x = (1280 - crop.width) // 2
    y = (720 - crop.height) // 2
    canvas.alpha_composite(crop, (x, y))
    save(ROOT / "assets" / "ui" / "armistice_title_backdrop.png", canvas)


def build_contact_sheet() -> None:
    files = [
        ROOT / "assets" / "tiles" / "armistice_plaza" / "authored_ground.png",
        ROOT / "assets" / "tiles" / "armistice_plaza" / "ground_atlas.png",
        ROOT / "assets" / "tiles" / "armistice_plaza" / "transition_atlas.png",
        ROOT / "assets" / "tiles" / "armistice_plaza" / "material_patches.png",
        ROOT / "assets" / "props" / "armistice_plaza" / "treaty_monument.png",
        ROOT / "assets" / "props" / "armistice_plaza" / "barricade_corridor_set.png",
        ROOT / "assets" / "props" / "armistice_plaza" / "crashed_drone_yard_wreck.png",
        ROOT / "assets" / "props" / "armistice_plaza" / "emergency_alignment_terminal.png",
        ROOT / "assets" / "props" / "armistice_plaza" / "cosmic_breach_crack.png",
        ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png",
        ROOT / "assets" / "sprites" / "bosses" / "oath_eater.png",
        ROOT / "assets" / "portraits" / "oath_eater_title_card.png",
        ROOT / "assets" / "sprites" / "effects" / "combat_effects_v1.png",
        ROOT / "assets" / "sprites" / "enemies" / "bad_outputs_sheet.png",
        ROOT / "assets" / "sprites" / "enemies" / "benchmark_gremlins_sheet.png",
        ROOT / "assets" / "sprites" / "enemies" / "context_rot_crabs_sheet.png",
    ]
    thumb_w = 320
    rows = []
    for path in files:
        image = rgba(path)
        image.thumbnail((thumb_w, 180), Image.Resampling.NEAREST)
        row = Image.new("RGBA", (thumb_w + 220, max(64, image.height + 24)), (18, 20, 26, 255))
        row.alpha_composite(image, (10, 12))
        ImageDraw.Draw(row).text((thumb_w + 24, 18), path.name, fill=(235, 235, 235, 255))
        rows.append(row)
    out = Image.new("RGBA", (thumb_w + 220, sum(r.height for r in rows)), (18, 20, 26, 255))
    y = 0
    for row in rows:
        out.alpha_composite(row, (0, y))
        y += row.height
    save(PIXELLAB / "armistice_rebuild_v1_runtime_asset_contact.png", out)


def main() -> None:
    build_ground_and_transitions()
    build_props()
    build_player_and_enemies()
    build_oath_eater_and_vfx()
    build_title_backdrop()
    build_contact_sheet()


if __name__ == "__main__":
    main()
