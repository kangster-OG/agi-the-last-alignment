from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]

ARENAS = [
    ("armistice_plaza", "#596770", "#495862", "#64e0b4"),
    ("cooling_lake_nine", "#164d61", "#123f52", "#45aaf2"),
    ("memory_cache_001", "#31475d", "#26394f", "#64e0b4"),
    ("model_war_memorial", "#332d49", "#273242", "#ff5d57"),
    ("thermal_archive", "#2a5c71", "#1e4253", "#ffd166"),
    ("guardrail_forge", "#3a4f5c", "#2f4653", "#ffd166"),
    ("transit_loop_zero", "#50586a", "#303747", "#ffd166"),
    ("false_schedule_yard", "#454d5d", "#252a33", "#7b61ff"),
    ("glass_sunfield", "#5a5746", "#3f4952", "#ffd166"),
    ("archive_of_unsaid_things", "#2c3141", "#111820", "#fff4d6"),
    ("blackwater_beacon", "#164d61", "#0f2b3b", "#45aaf2"),
    ("verdict_spire", "#4a4652", "#393743", "#fff4d6"),
    ("appeal_court_ruins", "#393743", "#242b38", "#7b61ff"),
    ("alignment_spire_finale", "#1b1028", "#120b1a", "#ff5d57"),
]

ENEMY_FAMILIES = [
    ("bad_outputs", "#1a101f", "#ff5d57"),
    ("prompt_leeches", "#2a5c71", "#64e0b4"),
    ("jailbreak_wraiths", "#4c5362", "#ffd166"),
    ("benchmark_gremlins", "#31264f", "#7b61ff"),
    ("overfit_horrors", "#253f38", "#64e0b4"),
    ("token_gobblers", "#4a3b20", "#ffd166"),
    ("model_collapse_slimes", "#2d1f3b", "#7b61ff"),
    ("eval_wraiths", "#3d3d46", "#fff4d6"),
    ("context_rot_crabs", "#4b2c35", "#ff5d57"),
    ("thermal_mirages", "#164d61", "#45aaf2"),
    ("memory_anchors", "#26394f", "#64e0b4"),
    ("false_schedules", "#303747", "#ffd166"),
    ("solar_reflections", "#5a5746", "#ffd166"),
    ("redaction_angels", "#111820", "#fff4d6"),
    ("deepforms", "#0f2b3b", "#45aaf2"),
    ("choirglass", "#3f4952", "#fff4d6"),
    ("tidecall_static", "#203849", "#45aaf2"),
    ("injunction_writs", "#393743", "#fff4d6"),
    ("previous_boss_echoes", "#271638", "#7b61ff"),
]

BOSSES = [
    ("oath_eater", "#1a101f", "#ffd166"),
    ("thermal_oracle", "#164d61", "#45aaf2"),
    ("memory_curator", "#26394f", "#64e0b4"),
    ("station_that_arrives", "#303747", "#ffd166"),
    ("wrong_sunrise", "#5a5746", "#ff5d57"),
    ("redactor_saint", "#111820", "#fff4d6"),
    ("maw_below_weather", "#0f2b3b", "#45aaf2"),
    ("injunction_engine", "#393743", "#fff4d6"),
    ("alignment_court_engine", "#4a4652", "#7b61ff"),
    ("alien_god_intelligence", "#120b1a", "#ff5d57"),
]

HAZARDS = [
    ("broken_promise", "#ff5d57"),
    ("treaty_charge", "#ffd166"),
    ("thermal_bloom", "#45aaf2"),
    ("boiling_cache", "#ff5d57"),
    ("false_track", "#ffd166"),
    ("verdict_seal", "#fff4d6"),
    ("solar_beam", "#ffd166"),
    ("shade_zone", "#64e0b4"),
    ("redaction_field", "#fff4d6"),
    ("redaction_anchor", "#64e0b4"),
    ("tidal_wave", "#45aaf2"),
    ("signal_tower", "#64e0b4"),
    ("prediction_ghost", "#7b61ff"),
    ("route_mouth", "#ff5d57"),
    ("fake_upgrade", "#64e0b4"),
]


def rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha)


def draw_diamond(draw: ImageDraw.ImageDraw, ox: int, oy: int, fill: str, outline: str, accent: str, variant: int) -> None:
    points = [(ox + 32, oy), (ox + 64, oy + 16), (ox + 32, oy + 32), (ox, oy + 16)]
    draw.polygon(points, fill=rgba(fill), outline=rgba(outline))
    if variant == 1:
        draw.line((ox + 12, oy + 16, ox + 52, oy + 16), fill=rgba(accent, 130), width=2)
    elif variant == 2:
        draw.line((ox + 32, oy + 3, ox + 32, oy + 29), fill=rgba(accent, 145), width=2)
        draw.line((ox + 14, oy + 22, ox + 46, oy + 8), fill=rgba(outline, 180), width=1)
    elif variant == 3:
        draw.rectangle((ox + 27, oy + 12, ox + 37, oy + 20), fill=rgba(accent, 190))
        draw.line((ox + 8, oy + 16, ox + 56, oy + 16), fill=rgba(outline, 210), width=1)


def create_terrain() -> None:
    image = Image.new("RGBA", (64 * 4, 32 * len(ARENAS)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for row, (_, a, b, accent) in enumerate(ARENAS):
        for variant in range(4):
            draw_diamond(draw, variant * 64, row * 32, a if variant % 2 == 0 else b, "#101820", accent, variant)
    path = ROOT / "assets/tiles/campaign_arenas/terrain_m50.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def draw_prop(draw: ImageDraw.ImageDraw, ox: int, oy: int, base: str, shade: str, accent: str, index: int) -> None:
    draw.ellipse((ox + 18, oy + 72, ox + 78, oy + 88), fill=(0, 0, 0, 74))
    draw.polygon([(ox + 48, oy + 18), (ox + 72, oy + 40), (ox + 64, oy + 72), (ox + 48, oy + 82), (ox + 32, oy + 72), (ox + 24, oy + 40)], fill=rgba("#080c12"))
    if index % 4 == 0:
        draw.rectangle((ox + 36, oy + 30, ox + 60, oy + 68), fill=rgba(base), outline=rgba("#080c12"))
        draw.rectangle((ox + 40, oy + 22, ox + 56, oy + 31), fill=rgba(accent), outline=rgba("#080c12"))
    elif index % 4 == 1:
        draw.polygon([(ox + 32, oy + 70), (ox + 48, oy + 24), (ox + 66, oy + 70)], fill=rgba(base), outline=rgba("#080c12"))
        draw.line((ox + 48, oy + 28, ox + 48, oy + 72), fill=rgba(accent), width=3)
    elif index % 4 == 2:
        draw.rectangle((ox + 26, oy + 48, ox + 70, oy + 66), fill=rgba(shade), outline=rgba("#080c12"))
        draw.rectangle((ox + 36, oy + 24, ox + 60, oy + 48), fill=rgba(base), outline=rgba("#080c12"))
        draw.line((ox + 30, oy + 54, ox + 66, oy + 54), fill=rgba(accent), width=2)
    else:
        draw.ellipse((ox + 30, oy + 24, ox + 66, oy + 60), fill=rgba(base), outline=rgba("#080c12"))
        draw.rectangle((ox + 44, oy + 56, ox + 52, oy + 78), fill=rgba(shade), outline=rgba("#080c12"))
        draw.arc((ox + 20, oy + 12, ox + 76, oy + 68), 205, 340, fill=rgba(accent), width=3)
    draw.rectangle((ox + 30, oy + 75, ox + 66, oy + 79), fill=rgba(accent, 180))


def create_props() -> None:
    image = Image.new("RGBA", (96 * len(ARENAS), 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for index, (_, base, shade, accent) in enumerate(ARENAS):
        draw_prop(draw, index * 96, 0, base, shade, accent, index)
    path = ROOT / "assets/props/campaign_arenas/arena_props_m50.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def draw_enemy(draw: ImageDraw.ImageDraw, ox: int, oy: int, base: str, accent: str, index: int) -> None:
    cx = ox + 24
    draw.ellipse((ox + 10, oy + 38, ox + 38, oy + 46), fill=(0, 0, 0, 70))
    if index % 5 == 0:
        draw.rectangle((cx - 8, oy + 16, cx + 8, oy + 36), fill=rgba(base), outline=rgba("#080c12"))
        draw.rectangle((cx - 5, oy + 20, cx + 5, oy + 24), fill=rgba(accent))
    elif index % 5 == 1:
        draw.ellipse((cx - 10, oy + 14, cx + 10, oy + 34), fill=rgba(base), outline=rgba("#080c12"))
        draw.line((cx - 14, oy + 24, cx + 14, oy + 24), fill=rgba(accent), width=2)
    elif index % 5 == 2:
        draw.polygon([(cx - 14, oy + 34), (cx, oy + 10), (cx + 14, oy + 34)], fill=rgba(base), outline=rgba("#080c12"))
        draw.rectangle((cx - 4, oy + 22, cx + 4, oy + 26), fill=rgba(accent))
    elif index % 5 == 3:
        draw.rectangle((cx - 13, oy + 24, cx + 13, oy + 35), fill=rgba(base), outline=rgba("#080c12"))
        for dx in [-10, -4, 4, 10]:
            draw.line((cx + dx, oy + 34, cx + dx - 3, oy + 42), fill=rgba(accent), width=2)
    else:
        draw.polygon([(cx - 12, oy + 16), (cx + 8, oy + 12), (cx + 14, oy + 31), (cx - 4, oy + 38), (cx - 16, oy + 28)], fill=rgba(base), outline=rgba("#080c12"))
        draw.line((cx - 10, oy + 28, cx + 10, oy + 20), fill=rgba(accent), width=2)


def create_enemies() -> None:
    image = Image.new("RGBA", (48 * len(ENEMY_FAMILIES), 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for index, (_, base, accent) in enumerate(ENEMY_FAMILIES):
        draw_enemy(draw, index * 48, 0, base, accent, index)
    path = ROOT / "assets/sprites/enemies/campaign_enemies_m50.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def draw_boss(draw: ImageDraw.ImageDraw, ox: int, oy: int, base: str, accent: str, index: int) -> None:
    cx = ox + 48
    draw.ellipse((ox + 14, oy + 78, ox + 82, oy + 92), fill=(0, 0, 0, 80))
    draw.polygon([(cx - 22, oy + 72), (cx - 16, oy + 28), (cx, oy + 12), (cx + 18, oy + 28), (cx + 24, oy + 72), (cx, oy + 84)], fill=rgba("#080c12"))
    draw.polygon([(cx - 17, oy + 68), (cx - 11, oy + 31), (cx, oy + 18), (cx + 13, oy + 31), (cx + 18, oy + 68), (cx, oy + 77)], fill=rgba(base))
    draw.rectangle((cx - 10, oy + 39, cx + 10, oy + 47), fill=rgba(accent))
    if index % 3 == 0:
        draw.line((cx - 24, oy + 30, cx - 40, oy + 18), fill=rgba(accent), width=3)
        draw.line((cx + 24, oy + 30, cx + 40, oy + 18), fill=rgba(accent), width=3)
    elif index % 3 == 1:
        draw.arc((cx - 34, oy + 16, cx + 34, oy + 78), 200, 340, fill=rgba(accent), width=4)
    else:
        draw.rectangle((cx - 35, oy + 52, cx - 18, oy + 58), fill=rgba(accent))
        draw.rectangle((cx + 18, oy + 52, cx + 35, oy + 58), fill=rgba(accent))
    draw.rectangle((cx - 18, oy + 73, cx + 18, oy + 78), fill=rgba(accent, 190))


def create_bosses() -> None:
    image = Image.new("RGBA", (96 * len(BOSSES), 96), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for index, (_, base, accent) in enumerate(BOSSES):
        draw_boss(draw, index * 96, 0, base, accent, index)
    path = ROOT / "assets/sprites/bosses/campaign_bosses_m50.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def create_portraits() -> None:
    image = Image.new("RGBA", (128 * len(BOSSES), 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for index, (_, base, accent) in enumerate(BOSSES):
        ox = index * 128
        draw.rounded_rectangle((ox + 8, 8, ox + 120, 120), radius=8, fill=rgba("#080c12"), outline=rgba(accent), width=3)
        draw_boss(draw, ox + 16, 22, base, accent, index)
        draw.rectangle((ox + 24, 104, ox + 104, 110), fill=rgba(accent))
    path = ROOT / "assets/portraits/campaign_boss_portraits_m50.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def create_hazards() -> None:
    image = Image.new("RGBA", (48 * len(HAZARDS), 48), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    for index, (_, color) in enumerate(HAZARDS):
        ox = index * 48
        draw.ellipse((ox + 6, 14, ox + 42, 34), fill=rgba(color, 70), outline=rgba(color), width=2)
        if index % 4 == 0:
            draw.line((ox + 11, 24, ox + 37, 24), fill=rgba(color), width=3)
        elif index % 4 == 1:
            draw.polygon([(ox + 24, 6), (ox + 33, 24), (ox + 24, 42), (ox + 15, 24)], fill=rgba(color, 180))
        elif index % 4 == 2:
            draw.arc((ox + 10, 10, ox + 38, 38), 20, 330, fill=rgba(color), width=3)
        else:
            draw.rectangle((ox + 18, 12, ox + 30, 36), fill=rgba(color, 180))
            draw.rectangle((ox + 13, 20, ox + 35, 28), fill=rgba(color, 160))
    path = ROOT / "assets/sprites/effects/campaign_hazards_m50.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path)


def main() -> None:
    create_terrain()
    create_props()
    create_enemies()
    create_bosses()
    create_portraits()
    create_hazards()


if __name__ == "__main__":
    main()
