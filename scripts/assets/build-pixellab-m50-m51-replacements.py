#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "assets/concepts/pixellab_refs/m50_m51_replacement"

ARENAS = [
    "armistice_plaza",
    "cooling_lake_nine",
    "memory_cache_001",
    "model_war_memorial",
    "thermal_archive",
    "guardrail_forge",
    "transit_loop_zero",
    "false_schedule_yard",
    "glass_sunfield",
    "archive_of_unsaid_things",
    "blackwater_beacon",
    "verdict_spire",
    "appeal_court_ruins",
    "alignment_spire_finale",
]

ENEMY_FAMILIES = [
    "bad_outputs",
    "prompt_leeches",
    "jailbreak_wraiths",
    "benchmark_gremlins",
    "overfit_horrors",
    "token_gobblers",
    "model_collapse_slimes",
    "eval_wraiths",
    "context_rot_crabs",
    "thermal_mirages",
    "memory_anchors",
    "false_schedules",
    "solar_reflections",
    "redaction_angels",
    "deepforms",
    "choirglass",
    "tidecall_static",
    "injunction_writs",
    "previous_boss_echoes",
]

BOSSES = [
    "oath_eater",
    "thermal_oracle",
    "memory_curator",
    "station_that_arrives",
    "wrong_sunrise",
    "redactor_saint",
    "maw_below_weather",
    "injunction_engine",
    "alignment_court_engine",
    "alien_god_intelligence",
]

HAZARDS = [
    "broken_promise",
    "treaty_charge",
    "thermal_bloom",
    "boiling_cache",
    "false_track",
    "verdict_seal",
    "solar_beam",
    "shade_zone",
    "redaction_field",
    "redaction_anchor",
    "tidal_wave",
    "signal_tower",
    "prediction_ghost",
    "route_mouth",
    "fake_upgrade",
]


def frame(batch: str, index: int) -> Image.Image:
    path = RAW / batch / f"frame_{index}.png"
    if not path.exists():
        raise FileNotFoundError(path)
    image = Image.open(path).convert("RGBA")
    if image.getbbox() is None:
        raise ValueError(f"{path} is empty")
    return image


def contain(image: Image.Image, size: tuple[int, int], scale: int | None = None) -> Image.Image:
    image = image.convert("RGBA")
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
    max_w, max_h = size
    if scale:
        target_w = min(max_w, image.width * scale)
        target_h = min(max_h, image.height * scale)
    else:
        ratio = min(max_w / image.width, max_h / image.height)
        target_w = max(1, round(image.width * ratio))
        target_h = max(1, round(image.height * ratio))
    image = image.resize((target_w, target_h), Image.Resampling.NEAREST)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.alpha_composite(image, ((max_w - target_w) // 2, max(0, max_h - target_h - 2)))
    return out


def save_raw_atlas(batch: str) -> None:
    out = Image.new("RGBA", (4 * 48, 4 * 48), (0, 0, 0, 0))
    for index in range(16):
        out.alpha_composite(frame(batch, index), ((index % 4) * 48, (index // 4) * 48))
    path = RAW / f"{batch}_raw_atlas.png"
    out.save(path)
    print(f"Wrote {path.relative_to(ROOT)}")


def make_terrain_variant(tile: Image.Image, variant: int) -> Image.Image:
    out = contain(tile, (64, 32))
    draw = ImageDraw.Draw(out)
    if variant == 1:
        draw.line((12, 16, 52, 16), fill=(255, 244, 214, 118), width=1)
    elif variant == 2:
        draw.line((32, 5, 32, 27), fill=(100, 224, 180, 118), width=1)
        draw.line((18, 22, 46, 10), fill=(8, 12, 18, 130), width=1)
    elif variant == 3:
        draw.rectangle((28, 12, 36, 19), fill=(255, 209, 102, 138))
    return out


def build_terrain() -> None:
    atlas = Image.new("RGBA", (64 * 4, 32 * len(ARENAS)), (0, 0, 0, 0))
    for arena_index, _arena in enumerate(ARENAS):
        source = frame("m50_unknown_isometric_b_raw", arena_index)
        for variant in range(4):
            atlas.alpha_composite(make_terrain_variant(source, variant), (variant * 64, arena_index * 32))
    path = ROOT / "assets/tiles/campaign_arenas/terrain_m50.png"
    atlas.save(path)
    print(f"Wrote {path.relative_to(ROOT)}")


def build_horizontal_atlas(batch: str, count: int, size: tuple[int, int], path: Path, source_offset: int = 0, scale: int | None = 2) -> None:
    atlas = Image.new("RGBA", (size[0] * count, size[1]), (0, 0, 0, 0))
    for index in range(count):
        atlas.alpha_composite(contain(frame(batch, source_offset + index), size, scale), (index * size[0], 0))
    path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(path)
    print(f"Wrote {path.relative_to(ROOT)}")


def build_enemies() -> None:
    atlas = Image.new("RGBA", (48 * len(ENEMY_FAMILIES), 48), (0, 0, 0, 0))
    for index, _enemy in enumerate(ENEMY_FAMILIES):
        batch = "campaign_enemies_a_raw" if index < 16 else "campaign_enemies_b_raw"
        source_index = index if index < 16 else index - 16
        atlas.alpha_composite(contain(frame(batch, source_index), (48, 48)), (index * 48, 0))
    path = ROOT / "assets/sprites/enemies/campaign_enemies_m50.png"
    atlas.save(path)
    print(f"Wrote {path.relative_to(ROOT)}")


def build_portraits() -> None:
    atlas = Image.new("RGBA", (128 * len(BOSSES), 128), (0, 0, 0, 0))
    for index, _boss in enumerate(BOSSES):
        ox = index * 128
        card = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        draw = ImageDraw.Draw(card)
        accent = [(255, 209, 102), (69, 170, 242), (100, 224, 180), (123, 97, 255), (255, 93, 87)][index % 5]
        draw.rounded_rectangle((8, 8, 120, 120), radius=8, fill=(8, 12, 18, 232), outline=(*accent, 255), width=3)
        card.alpha_composite(contain(frame("campaign_bosses_raw", index), (96, 96), 2), (16, 18))
        draw.rectangle((24, 104, 104, 110), fill=(*accent, 220))
        atlas.alpha_composite(card, (ox, 0))
    path = ROOT / "assets/portraits/campaign_boss_portraits_m50.png"
    atlas.save(path)
    print(f"Wrote {path.relative_to(ROOT)}")


def build_m51_landmarks() -> None:
    build_horizontal_atlas(
        "route_landmarks_raw",
        6,
        (96, 96),
        ROOT / "assets/props/alignment_grid/node_landmarks_v1.png",
        0,
        2,
    )
    build_horizontal_atlas(
        "route_landmarks_raw",
        5,
        (96, 96),
        ROOT / "assets/props/online_route/route_landmarks_v1.png",
        6,
        2,
    )
    build_horizontal_atlas(
        "route_landmarks_raw",
        4,
        (96, 96),
        ROOT / "assets/props/online_route/verdict_spire_landmarks_v1.png",
        11,
        2,
    )
    route_indices = [2, 7, 4, 8, 9, 13, 11, 15]
    atlas = Image.new("RGBA", (96 * len(route_indices), 96), (0, 0, 0, 0))
    for out_index, source_index in enumerate(route_indices):
        atlas.alpha_composite(contain(frame("route_landmarks_raw", source_index), (96, 96), 2), (out_index * 96, 0))
    path = ROOT / "assets/props/online_route/route_biome_landmarks_v1.png"
    atlas.save(path)
    print(f"Wrote {path.relative_to(ROOT)}")


def main() -> None:
    for batch in [
        "m50_unknown_isometric_b_raw",
        "m50_unknown_isometric_a_raw",
        "campaign_enemies_a_raw",
        "campaign_enemies_b_raw",
        "campaign_bosses_raw",
        "campaign_hazards_raw",
        "route_landmarks_raw",
    ]:
        save_raw_atlas(batch)
    build_terrain()
    build_horizontal_atlas("m50_unknown_isometric_a_raw", len(ARENAS), (96, 96), ROOT / "assets/props/campaign_arenas/arena_props_m50.png")
    build_enemies()
    build_horizontal_atlas("campaign_bosses_raw", len(BOSSES), (96, 96), ROOT / "assets/sprites/bosses/campaign_bosses_m50.png")
    build_portraits()
    build_horizontal_atlas("campaign_hazards_raw", len(HAZARDS), (48, 48), ROOT / "assets/sprites/effects/campaign_hazards_m50.png", scale=None)
    build_m51_landmarks()


if __name__ == "__main__":
    main()
