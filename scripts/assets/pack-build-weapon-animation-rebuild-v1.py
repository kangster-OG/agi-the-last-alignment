#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "assets/concepts/chatgpt_refs/build_weapon_animation_rebuild_v1"
PRIMARY_SOURCE = SOURCE_DIR / "build_weapon_animation_primary_fusion_source_v1.png"
SECONDARY_SOURCE = SOURCE_DIR / "build_weapon_animation_secondary_support_source_v1.png"
PIXELLAB_ATLAS = ROOT / "assets/concepts/pixellab_refs/build_weapon_animation_rebuild_v1/build_weapon_animation_pixellab_raw_atlas.png"
OUT = ROOT / "assets/sprites/effects/build_weapon_vfx_v1.png"
CONTACT = ROOT / "docs/proof/build-weapon-animation-rebuild-v1/build-weapon-animation-runtime-contact.png"
SOURCE_CONTACT = ROOT / "docs/proof/build-weapon-animation-rebuild-v1/build-weapon-animation-source-contact.png"

FRAME_W = 256
FRAME_H = 192
FRAMES_PER_ROW = 10


PRIMARY_ROWS = {
    "refusal": [
        "refusalCharge",
        "refusalLaunch",
        "refusalTravel",
        "refusalEcho",
        "refusalImpact",
        "refusalResidue",
    ],
    "vector": [
        "vectorCharge",
        "vectorProjectile",
        "vectorBeam",
        "vectorTrail",
        "vectorImpact",
        "vectorResidue",
    ],
    "signal": [
        "signalStartup",
        "signalRing",
        "signalCross",
        "signalBurst",
        "signalImpact",
        "signalResidue",
    ],
    "railgun": [
        "causalRailgunCharge",
        "causalRailgunMuzzle",
        "causalRailgunBeam",
        "causalRailgunTravel",
        "causalRailgunImpact",
        "causalRailgunResidue",
    ],
    "halo": [
        "refusalHaloStartup",
        "refusalHaloRing",
        "refusalHaloShield",
        "refusalHaloFlare",
        "predictionPriorityIcon",
        "causalRailgunIcon",
    ],
}

SECONDARY_ROWS = {
    "context": [
        "contextSawStartup",
        "contextSaw",
        "contextSawSpin",
        "contextSawBlur",
        "contextSawSweep",
        "contextSawShardField",
    ],
    "mortar": [
        "patchMortarLaunch",
        "patchMortarShell",
        "patchMortarArc",
        "patchMortarDescent",
        "patchMortarShadow",
        "patchMortarImpact",
    ],
    "rift": [
        "riftMineStartup",
        "riftMineArmed",
        "riftMineRipple",
        "riftMineTrigger",
        "riftMineBurst",
        "riftMineResidue",
    ],
    "support": [
        "objectiveAnchorSpark",
        "objectiveTurretShot",
        "objectiveMortarMarker",
        "objectiveRepairPulse",
        "coherenceIndexerIcon",
        "anchorBodyguardIcon",
    ],
}

FRAME_NAMES = [name for row in PRIMARY_ROWS.values() for name in row] + [name for row in SECONDARY_ROWS.values() for name in row]

ALIASES = {
    "vectorChargedTrail": "vectorBeam",
    "signalProjectile": "signalStartup",
    "patchMortarTrail": "patchMortarShadow",
    "causalRailgunProjectile": "causalRailgunTravel",
    "causalRailgunChargedBeam": "causalRailgunBeam",
    "contextSawLarge": "contextSawSweep",
    "anchorBodyguardIcon": "anchorBodyguardIcon",
}


def key_green(image: Image.Image) -> Image.Image:
    keyed = image.convert("RGBA")
    px = keyed.load()
    for y in range(keyed.height):
        for x in range(keyed.width):
            r, g, b, a = px[x, y]
            if g > 165 and r < 90 and b < 110:
                px[x, y] = (0, 0, 0, 0)
            elif g > 130 and r < 150 and b < 150:
                px[x, y] = (r, g, b, max(0, a - 185))
    return keyed


def trim_alpha(image: Image.Image) -> Image.Image:
    box = image.getchannel("A").getbbox()
    if not box:
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    pad = 24
    return image.crop(
        (
            max(0, box[0] - pad),
            max(0, box[1] - pad),
            min(image.width, box[2] + pad),
            min(image.height, box[3] + pad),
        )
    )


def fit_frame(image: Image.Image) -> Image.Image:
    image = trim_alpha(image)
    scale = min((FRAME_W - 40) / image.width, (FRAME_H - 34) / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    fitted = image.resize(size, Image.Resampling.NEAREST)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    frame.alpha_composite(fitted, ((FRAME_W - size[0]) // 2, (FRAME_H - size[1]) // 2))
    return frame


def grid_cells(image: Image.Image, rows: dict[str, list[str]]) -> dict[str, Image.Image]:
    keyed = key_green(image)
    row_count = len(rows)
    col_count = 6
    cell_w = keyed.width / col_count
    cell_h = keyed.height / row_count
    frames: dict[str, Image.Image] = {}
    for row_index, names in enumerate(rows.values()):
        for col_index, name in enumerate(names):
            box = (
                round(col_index * cell_w),
                round(row_index * cell_h),
                round((col_index + 1) * cell_w),
                round((row_index + 1) * cell_h),
            )
            frames[name] = fit_frame(keyed.crop(box))
    return frames


def pixellab_cells() -> list[Image.Image]:
    if not PIXELLAB_ATLAS.exists():
        return []
    atlas = Image.open(PIXELLAB_ATLAS).convert("RGBA")
    cells: list[Image.Image] = []
    cell = 128
    for row in range(4):
        for col in range(4):
            cells.append(fit_frame(atlas.crop((col * cell, row * cell, (col + 1) * cell, (row + 1) * cell))))
    return cells


def make_contact(frames: list[tuple[str, Image.Image]], path: Path, columns: int = 6) -> None:
    gap = 8
    label_h = 18
    rows = (len(frames) + columns - 1) // columns
    sheet = Image.new("RGBA", (columns * FRAME_W + (columns + 1) * gap, rows * (FRAME_H + label_h) + (rows + 1) * gap), (12, 14, 18, 255))
    draw = ImageDraw.Draw(sheet)
    for index, (name, frame) in enumerate(frames):
        col = index % columns
        row = index // columns
        x = gap + col * (FRAME_W + gap)
        y = gap + row * (FRAME_H + label_h + gap)
        sheet.alpha_composite(frame, (x, y))
        draw.text((x + 4, y + FRAME_H + 2), name[:28], fill=(221, 231, 229, 255))
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path, optimize=True, compress_level=9)


def make_source_contact(primary: Image.Image, secondary: Image.Image) -> None:
    gap = 12
    label_h = 20
    w = 384
    h = 256
    sheet = Image.new("RGBA", (w * 2 + gap * 3, h + label_h + gap * 2), (12, 14, 18, 255))
    draw = ImageDraw.Draw(sheet)
    for index, (name, image) in enumerate((("primary_fusion_source", primary), ("secondary_support_source", secondary))):
        preview = image.convert("RGBA").resize((w, h), Image.Resampling.NEAREST)
        x = gap + index * (w + gap)
        y = gap
        sheet.alpha_composite(preview, (x, y))
        draw.text((x + 4, y + h + 2), name, fill=(221, 231, 229, 255))
    SOURCE_CONTACT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(SOURCE_CONTACT, optimize=True, compress_level=9)


def main() -> None:
    primary = Image.open(PRIMARY_SOURCE)
    secondary = Image.open(SECONDARY_SOURCE)
    frames = {**grid_cells(primary, PRIMARY_ROWS), **grid_cells(secondary, SECONDARY_ROWS)}
    pixel_frames = pixellab_cells()
    if len(pixel_frames) >= 16:
        frames["refusalResidue"] = pixel_frames[2]
        frames["coherenceIndexerIcon"] = pixel_frames[10]
        frames["causalRailgunResidue"] = pixel_frames[15]
    for alias, target in ALIASES.items():
        frames[alias] = frames[target]

    ordered_names = FRAME_NAMES + [name for name in ALIASES if name not in FRAME_NAMES]
    rows = (len(ordered_names) + FRAMES_PER_ROW - 1) // FRAMES_PER_ROW
    atlas = Image.new("RGBA", (FRAME_W * FRAMES_PER_ROW, FRAME_H * rows), (0, 0, 0, 0))
    ordered_frames: list[tuple[str, Image.Image]] = []
    for index, name in enumerate(ordered_names):
        frame = frames[name]
        atlas.alpha_composite(frame, ((index % FRAMES_PER_ROW) * FRAME_W, (index // FRAMES_PER_ROW) * FRAME_H))
        ordered_frames.append((name, frame))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT, optimize=True, compress_level=9)
    make_contact(ordered_frames, CONTACT)
    make_source_contact(primary, secondary)
    print(f"packed {len(ordered_names)} build weapon animation frames -> {OUT}")
    print(CONTACT)
    print(SOURCE_CONTACT)


if __name__ == "__main__":
    main()
