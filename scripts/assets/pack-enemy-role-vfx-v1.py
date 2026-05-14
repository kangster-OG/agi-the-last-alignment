#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/sprites/effects/build_weapon_vfx_v1.png"
OUT = ROOT / "assets/sprites/effects/enemy_role_vfx_v1.png"
CONTACT = ROOT / "docs/proof/enemy-role-vfx-v1/enemy-role-vfx-v1-contact.png"

FRAME_W = 256
FRAME_H = 192
FRAMES_PER_ROW = 10

SOURCE_FRAMES = [
    "refusalCharge",
    "refusalLaunch",
    "refusalTravel",
    "refusalEcho",
    "refusalImpact",
    "refusalResidue",
    "vectorCharge",
    "vectorProjectile",
    "vectorBeam",
    "vectorTrail",
    "vectorImpact",
    "vectorResidue",
    "signalStartup",
    "signalRing",
    "signalCross",
    "signalBurst",
    "signalImpact",
    "signalResidue",
    "causalRailgunCharge",
    "causalRailgunMuzzle",
    "causalRailgunBeam",
    "causalRailgunTravel",
    "causalRailgunImpact",
    "causalRailgunResidue",
    "refusalHaloStartup",
    "refusalHaloRing",
    "refusalHaloShield",
    "refusalHaloFlare",
    "predictionPriorityIcon",
    "causalRailgunIcon",
    "contextSawStartup",
    "contextSaw",
    "contextSawSpin",
    "contextSawBlur",
    "contextSawSweep",
    "contextSawShardField",
    "patchMortarLaunch",
    "patchMortarShell",
    "patchMortarArc",
    "patchMortarDescent",
    "patchMortarShadow",
    "patchMortarImpact",
    "riftMineStartup",
    "riftMineArmed",
    "riftMineRipple",
    "riftMineTrigger",
    "riftMineBurst",
    "riftMineResidue",
    "objectiveAnchorSpark",
    "objectiveTurretShot",
    "objectiveMortarMarker",
    "objectiveRepairPulse",
    "coherenceIndexerIcon",
    "anchorBodyguardIcon",
    "vectorChargedTrail",
    "signalProjectile",
    "contextSawLarge",
    "patchMortarTrail",
    "causalRailgunProjectile",
    "causalRailgunChargedBeam",
]

ENEMY_FRAMES = [
    ("aimedOrb", "signalProjectile"),
    ("leadBolt", "vectorProjectile"),
    ("lineShot", "causalRailgunBeam"),
    ("lineTelegraph", "causalRailgunCharge"),
    ("mortarMarker", "objectiveMortarMarker"),
    ("mortarDrop", "patchMortarDescent"),
    ("volatileBurst", "riftMineBurst"),
    ("redactionTrail", "contextSawShardField"),
    ("supportAura", "refusalHaloShield"),
    ("eliteOverclock", "refusalHaloFlare"),
    ("eliteShield", "refusalHaloRing"),
    ("eliteRedacted", "riftMineResidue"),
]


def cell(atlas: Image.Image, source_name: str) -> Image.Image:
    index = SOURCE_FRAMES.index(source_name)
    x = (index % FRAMES_PER_ROW) * FRAME_W
    y = (index // FRAMES_PER_ROW) * FRAME_H
    return atlas.crop((x, y, x + FRAME_W, y + FRAME_H))


def make_contact(frames: list[tuple[str, Image.Image]]) -> None:
    cols = 4
    gap = 8
    label_h = 18
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * FRAME_W + (cols + 1) * gap, rows * (FRAME_H + label_h) + (rows + 1) * gap), (12, 14, 18, 255))
    draw = ImageDraw.Draw(sheet)
    for index, (name, frame) in enumerate(frames):
      col = index % cols
      row = index // cols
      x = gap + col * (FRAME_W + gap)
      y = gap + row * (FRAME_H + label_h + gap)
      sheet.alpha_composite(frame, (x, y))
      draw.text((x + 4, y + FRAME_H + 2), name, fill=(221, 231, 229, 255))
    CONTACT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(CONTACT, optimize=True, compress_level=9)


def main() -> None:
    atlas = Image.open(SOURCE).convert("RGBA")
    frames = [(enemy_name, cell(atlas, source_name)) for enemy_name, source_name in ENEMY_FRAMES]
    out = Image.new("RGBA", (FRAMES_PER_ROW * FRAME_W, 2 * FRAME_H), (0, 0, 0, 0))
    for index, (_, frame) in enumerate(frames):
      x = (index % FRAMES_PER_ROW) * FRAME_W
      y = (index // FRAMES_PER_ROW) * FRAME_H
      out.alpha_composite(frame, (x, y))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT, optimize=True, compress_level=9)
    make_contact(frames)
    print(OUT)
    print(CONTACT)


if __name__ == "__main__":
    main()
