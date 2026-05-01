from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]

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

CLASS_PALETTES = {
    "accord_striker": ("#1b2430", "#64e0b4", "#ffd166", "#8ad8ff"),
    "bastion_breaker": ("#27303a", "#9ba7b3", "#ff8f3d", "#ffe7a3"),
    "drone_reaver": ("#191f2d", "#8a7cff", "#64e0b4", "#d7f7ff"),
    "signal_vanguard": ("#152733", "#5bd0ff", "#ffd166", "#fff4d6"),
    "bonecode_executioner": ("#16161d", "#e6edf3", "#ff4f6d", "#a18cff"),
    "redline_surgeon": ("#251d21", "#f6f1e8", "#ff4f6d", "#64e0b4"),
    "moonframe_juggernaut": ("#222735", "#a9b6c2", "#5bd0ff", "#ffd166"),
    "vector_interceptor": ("#182633", "#56d6a4", "#7cc7ff", "#f3ff8d"),
    "nullbreaker_ronin": ("#171821", "#b9c7d8", "#ffda66", "#d96dff"),
    "overclock_marauder": ("#2a1d1a", "#ff7b3d", "#ffd166", "#e53b35"),
    "prism_gunner": ("#161f2f", "#87dfff", "#f0f4ff", "#d98cff"),
    "rift_saboteur": ("#252a44", "#7d71ff", "#45c789", "#ff6fd8"),
}

FACTIONS = [
    ("openai_accord", "#f7f4ef", "#64e0b4", "circle"),
    ("anthropic_safeguard", "#ffd166", "#fff4d6", "box"),
    ("google_deepmind_gemini", "#5bd0ff", "#f0f4ff", "twin"),
    ("xai_grok_free_signal", "#ff4f6d", "#8ad8ff", "spark"),
    ("deepseek_abyssal", "#2a9d8f", "#112a33", "depth"),
    ("qwen_silkgrid", "#5bd0a8", "#ffe08a", "grid"),
    ("meta_llama_open_herd", "#45c789", "#5aa7ff", "fork"),
    ("mistral_cyclone", "#ff8f3d", "#e6f3ff", "wind"),
]

ROLES = [
    ("runner", "#64e0b4"),
    ("support", "#5bd0ff"),
    ("cover", "#ffd166"),
    ("harrier", "#ff8f3d"),
    ("control", "#a18cff"),
    ("duelist", "#ff4f6d"),
]

DIRECTIONS = ["south", "east", "north", "west"]


def hex_to_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha)


def draw_px(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], fill: str, alpha: int = 255) -> None:
    draw.rectangle(xy, fill=hex_to_rgba(fill, alpha))


def draw_outline_rect(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], fill: str, outline: str = "#080b10") -> None:
    draw.rectangle(xy, fill=hex_to_rgba(outline))
    x0, y0, x1, y1 = xy
    if x1 - x0 > 2 and y1 - y0 > 2:
        draw.rectangle((x0 + 1, y0 + 1, x1 - 1, y1 - 1), fill=hex_to_rgba(fill))


def draw_frame(draw: ImageDraw.ImageDraw, ox: int, oy: int, class_id: str, direction: str, frame: int) -> None:
    base, accent, trim, glow = CLASS_PALETTES[class_id]
    lean = 0
    if direction == "east":
        lean = 2
    elif direction == "west":
        lean = -2
    step = [-2, 0, 2][frame]
    cx = ox + 24 + lean
    foot_y = oy + 42

    draw.ellipse((ox + 12, oy + 36, ox + 36, oy + 44), fill=(0, 0, 0, 66))
    draw_outline_rect(draw, (cx - 6 + step, foot_y - 9, cx - 2 + step, foot_y - 1), base)
    draw_outline_rect(draw, (cx + 2 - step, foot_y - 9, cx + 6 - step, foot_y - 1), base)
    draw_outline_rect(draw, (cx - 7, oy + 20, cx + 7, oy + 35), base)
    draw.rectangle((cx - 5, oy + 23, cx + 5, oy + 26), fill=hex_to_rgba(accent))

    if direction == "north":
        draw_outline_rect(draw, (cx - 5, oy + 10, cx + 5, oy + 20), base)
        draw.rectangle((cx - 3, oy + 14, cx + 3, oy + 18), fill=hex_to_rgba(trim))
    else:
        draw_outline_rect(draw, (cx - 5, oy + 9, cx + 5, oy + 20), base)
        draw.rectangle((cx - 3, oy + 13, cx + 3, oy + 15), fill=hex_to_rgba(glow))

    draw_outline_rect(draw, (cx - 11, oy + 21, cx - 7, oy + 33), base)
    draw_outline_rect(draw, (cx + 7, oy + 21, cx + 11, oy + 33), base)

    if class_id == "accord_striker":
        draw.line((cx - 4, oy + 9, cx - 10, oy + 3), fill=hex_to_rgba(trim), width=2)
        draw.line((cx + 4, oy + 9, cx + 10, oy + 3), fill=hex_to_rgba(trim), width=2)
        draw.rectangle((cx - 2, foot_y - 2, cx + 2, foot_y), fill=hex_to_rgba(glow))
    elif class_id == "bastion_breaker":
        draw_outline_rect(draw, (cx - 14, oy + 18, cx - 7, oy + 29), trim)
        draw_outline_rect(draw, (cx + 7, oy + 18, cx + 14, oy + 29), trim)
        draw.rectangle((cx + 11, oy + 25, cx + 18, oy + 28), fill=hex_to_rgba(accent))
    elif class_id == "drone_reaver":
        for dx, dy in [(-15, 8), (14, 11), (-12, 28)]:
            draw.ellipse((cx + dx - 3, oy + dy - 2, cx + dx + 3, oy + dy + 2), fill=hex_to_rgba(accent))
            draw.point((cx + dx, oy + dy), fill=hex_to_rgba(glow))
    elif class_id == "signal_vanguard":
        draw.arc((cx - 13, oy + 3, cx + 13, oy + 21), 190, 350, fill=hex_to_rgba(accent), width=2)
        draw.polygon([(cx + 10, oy + 22), (cx + 17, oy + 26), (cx + 12, oy + 34)], fill=hex_to_rgba(glow, 180))
    elif class_id == "bonecode_executioner":
        draw.line((cx - 10, oy + 29, cx - 17, oy + 37), fill=hex_to_rgba(trim), width=2)
        draw.line((cx + 10, oy + 29, cx + 17, oy + 37), fill=hex_to_rgba(trim), width=2)
        draw.rectangle((cx - 1, oy + 16, cx + 1, oy + 32), fill=hex_to_rgba(accent))
    elif class_id == "redline_surgeon":
        draw.line((cx - 9, oy + 17, cx + 12, oy + 36), fill=hex_to_rgba(trim), width=2)
        draw.rectangle((cx + 13, oy + 13, cx + 17, oy + 18), fill=hex_to_rgba(glow))
        draw.rectangle((cx - 2, oy + 25, cx + 2, oy + 29), fill=hex_to_rgba(trim))
    elif class_id == "moonframe_juggernaut":
        draw_outline_rect(draw, (cx - 13, oy + 17, cx + 13, oy + 33), base)
        draw.rectangle((cx - 5, oy + 18, cx + 5, oy + 23), fill=hex_to_rgba(glow))
        draw_outline_rect(draw, (cx - 12, foot_y - 8, cx - 5, foot_y), trim)
        draw_outline_rect(draw, (cx + 5, foot_y - 8, cx + 12, foot_y), trim)
    elif class_id == "vector_interceptor":
        draw.polygon([(cx - 16, oy + 18), (cx - 8, oy + 22), (cx - 15, oy + 28)], fill=hex_to_rgba(accent))
        draw.polygon([(cx + 16, oy + 18), (cx + 8, oy + 22), (cx + 15, oy + 28)], fill=hex_to_rgba(accent))
        draw.line((cx - 18, oy + 12, cx - 18, oy + 36), fill=hex_to_rgba(glow), width=1)
        draw.line((cx + 18, oy + 12, cx + 18, oy + 36), fill=hex_to_rgba(glow), width=1)
    elif class_id == "nullbreaker_ronin":
        draw.line((cx + 10, oy + 15, cx + 20, oy + 4), fill=hex_to_rgba(trim), width=2)
        draw.line((cx + 12, oy + 15, cx + 22, oy + 4), fill=hex_to_rgba(glow), width=1)
        draw.rectangle((cx - 6, oy + 13, cx + 2, oy + 15), fill=hex_to_rgba(accent))
    elif class_id == "overclock_marauder":
        draw.rectangle((cx - 10, oy + 8, cx - 8, oy + 17), fill=hex_to_rgba(trim))
        draw.rectangle((cx + 8, oy + 8, cx + 10, oy + 17), fill=hex_to_rgba(trim))
        draw.polygon([(cx - 7, oy + 8), (cx - 4, oy + 2), (cx - 2, oy + 8)], fill=hex_to_rgba(accent))
        draw.polygon([(cx + 7, oy + 8), (cx + 4, oy + 2), (cx + 2, oy + 8)], fill=hex_to_rgba(accent))
    elif class_id == "prism_gunner":
        draw.line((cx - 13, oy + 27, cx - 22, oy + 24), fill=hex_to_rgba(trim), width=4)
        draw.rectangle((cx - 24, oy + 22, cx - 20, oy + 26), fill=hex_to_rgba(glow))
        draw.polygon([(cx + 2, oy + 10), (cx + 8, oy + 14), (cx + 3, oy + 18)], fill=hex_to_rgba(accent))
    elif class_id == "rift_saboteur":
        draw.polygon([(cx - 9, oy + 18), (cx, oy + 11), (cx + 10, oy + 19), (cx + 5, oy + 35), (cx - 6, oy + 35)], fill=hex_to_rgba(base, 230))
        draw.rectangle((cx - 14, foot_y - 3, cx - 10, foot_y + 1), fill=hex_to_rgba(accent))
        draw.rectangle((cx + 11, foot_y - 4, cx + 15, foot_y), fill=hex_to_rgba(trim))


def create_class_sheet() -> None:
    frame_w = 48
    frame_h = 48
    rows_per_class = 4
    frames = 3
    image = Image.new("RGBA", (frame_w * frames, frame_h * rows_per_class * len(CLASS_IDS)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for class_index, class_id in enumerate(CLASS_IDS):
        for dir_index, direction in enumerate(DIRECTIONS):
            for frame in range(frames):
                draw_frame(draw, frame * frame_w, (class_index * rows_per_class + dir_index) * frame_h, class_id, direction, frame)
    path = ROOT / "assets/sprites/players/class_roster_m49.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def draw_module_icon(draw: ImageDraw.ImageDraw, ox: int, oy: int, faction: tuple[str, str, str, str]) -> None:
    _, color, trim, motif = faction
    draw.rounded_rectangle((ox + 5, oy + 5, ox + 59, oy + 59), radius=7, fill=(8, 12, 18, 255), outline=hex_to_rgba(color), width=2)
    draw.rectangle((ox + 11, oy + 50, ox + 53, oy + 53), fill=hex_to_rgba(color, 155))
    if motif == "circle":
        draw.ellipse((ox + 19, oy + 17, ox + 45, oy + 43), outline=hex_to_rgba(trim), width=3)
        draw.ellipse((ox + 27, oy + 25, ox + 37, oy + 35), fill=hex_to_rgba(color))
    elif motif == "box":
        draw.rectangle((ox + 18, oy + 15, ox + 46, oy + 43), outline=hex_to_rgba(trim), width=3)
        draw.line((ox + 18, oy + 29, ox + 46, oy + 29), fill=hex_to_rgba(color), width=2)
    elif motif == "twin":
        draw.ellipse((ox + 16, oy + 18, ox + 31, oy + 39), fill=hex_to_rgba(color))
        draw.ellipse((ox + 33, oy + 18, ox + 48, oy + 39), fill=hex_to_rgba(trim))
    elif motif == "spark":
        draw.line((ox + 32, oy + 13, ox + 32, oy + 46), fill=hex_to_rgba(trim), width=2)
        draw.line((ox + 15, oy + 30, ox + 49, oy + 30), fill=hex_to_rgba(color), width=2)
        draw.line((ox + 21, oy + 18, ox + 43, oy + 42), fill=hex_to_rgba(color), width=2)
    elif motif == "depth":
        for i in range(4):
            draw.arc((ox + 16 + i * 3, oy + 12 + i * 4, ox + 48 - i * 3, oy + 48 - i * 2), 20, 250, fill=hex_to_rgba(color), width=2)
    elif motif == "grid":
        for i in range(4):
            draw.line((ox + 18 + i * 8, oy + 15, ox + 18 + i * 8, oy + 45), fill=hex_to_rgba(color), width=1)
            draw.line((ox + 16, oy + 18 + i * 8, ox + 48, oy + 18 + i * 8), fill=hex_to_rgba(trim), width=1)
    elif motif == "fork":
        draw.line((ox + 19, oy + 43, ox + 32, oy + 20), fill=hex_to_rgba(trim), width=3)
        draw.line((ox + 32, oy + 20, ox + 45, oy + 43), fill=hex_to_rgba(color), width=3)
        draw.line((ox + 32, oy + 20, ox + 32, oy + 12), fill=hex_to_rgba(color), width=3)
    elif motif == "wind":
        for i in range(3):
            draw.arc((ox + 13 + i * 5, oy + 14 + i * 3, ox + 51 - i * 3, oy + 48 - i * 4), 210, 40, fill=hex_to_rgba(color if i % 2 else trim), width=3)


def create_module_sheet() -> None:
    image = Image.new("RGBA", (64 * len(FACTIONS), 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for index, faction in enumerate(FACTIONS):
        draw_module_icon(draw, index * 64, 0, faction)
    path = ROOT / "assets/ui/comind_modules_m49.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def create_role_chips() -> None:
    image = Image.new("RGBA", (48 * len(ROLES), 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for index, (role, color) in enumerate(ROLES):
        ox = index * 48
        draw.rounded_rectangle((ox + 2, 4, ox + 46, 28), radius=5, fill=(12, 17, 25, 255), outline=hex_to_rgba(color), width=2)
        if role == "runner":
            draw.polygon([(ox + 14, 22), (ox + 31, 8), (ox + 27, 19), (ox + 37, 19)], fill=hex_to_rgba(color))
        elif role == "support":
            draw.rectangle((ox + 21, 9, ox + 27, 23), fill=hex_to_rgba(color))
            draw.rectangle((ox + 16, 14, ox + 32, 18), fill=hex_to_rgba(color))
        elif role == "cover":
            draw.polygon([(ox + 15, 10), (ox + 33, 10), (ox + 29, 24), (ox + 19, 24)], fill=hex_to_rgba(color))
        elif role == "harrier":
            draw.polygon([(ox + 12, 18), (ox + 26, 8), (ox + 22, 16), (ox + 35, 12), (ox + 24, 24)], fill=hex_to_rgba(color))
        elif role == "control":
            draw.rectangle((ox + 14, 11, ox + 34, 13), fill=hex_to_rgba(color))
            draw.rectangle((ox + 18, 18, ox + 38, 20), fill=hex_to_rgba(color))
            draw.rectangle((ox + 18, 8, ox + 20, 16), fill=hex_to_rgba(color))
            draw.rectangle((ox + 30, 15, ox + 32, 23), fill=hex_to_rgba(color))
        elif role == "duelist":
            draw.line((ox + 16, 23, ox + 32, 8), fill=hex_to_rgba(color), width=3)
            draw.line((ox + 32, 23, ox + 16, 8), fill=hex_to_rgba(color), width=2)
    path = ROOT / "assets/ui/role_chips_m49.png"
    image.save(path)


def create_portraits() -> None:
    image = Image.new("RGBA", (96 * len(FACTIONS), 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for index, faction in enumerate(FACTIONS):
        _, color, trim, _ = faction
        ox = index * 96
        draw.rounded_rectangle((ox + 6, 6, ox + 90, 90), radius=8, fill=(10, 15, 23, 255), outline=hex_to_rgba(color), width=3)
        draw.polygon([(ox + 48, 14), (ox + 72, 35), (ox + 64, 72), (ox + 48, 82), (ox + 32, 72), (ox + 24, 35)], fill=hex_to_rgba("#172231"))
        draw.rectangle((ox + 34, 35, ox + 62, 59), fill=hex_to_rgba(color, 120))
        draw.ellipse((ox + 37, 27, ox + 59, 49), outline=hex_to_rgba(trim), width=3)
        draw_module_icon(draw, ox + 16, 18, faction)
        draw.rectangle((ox + 18, 76, ox + 78, 80), fill=hex_to_rgba(color))
    path = ROOT / "assets/portraits/comind_portraits_m49.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def main() -> None:
    create_class_sheet()
    create_module_sheet()
    create_role_chips()
    create_portraits()


if __name__ == "__main__":
    main()
