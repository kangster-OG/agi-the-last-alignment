#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "assets" / "concepts" / "pixellab_refs" / "playable_walk_cycles_v1"
RAW_DIR = SOURCE_DIR / "raw"
MANIFEST = SOURCE_DIR / "pixellab_walk_cycle_manifest.json"
OUTPUT = ROOT / "assets" / "sprites" / "players" / "class_roster_m49.png"
CONTACT = SOURCE_DIR / "playable_walk_cycles_v1_contact.png"
PROOF = ROOT / "docs" / "proof" / "playable-walk-cycles-v1" / "playable-walk-cycles-v1-proof.png"

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

DIRECTIONS = ["south", "east", "north", "west"]
FRAME_SIZE = 80
RUNTIME_FRAMES = 3
PIXELLAB_FRAMES_TO_USE = [0, 1, 2]
PAD = 4


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def alpha_bbox(image: Image.Image):
    return image.getchannel("A").getbbox()


def frame_paths(class_id: str, direction: str) -> list[Path]:
    paths = [RAW_DIR / class_id / direction / f"frame_{index:02d}.png" for index in PIXELLAB_FRAMES_TO_USE]
    missing = [path for path in paths if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing PixelLab frames for {class_id} {direction}: {missing}")
    return paths


def normalize_strip(paths: list[Path]) -> list[Image.Image]:
    frames = [rgba(path) for path in paths]
    boxes = [alpha_bbox(frame) for frame in frames]
    boxes = [box for box in boxes if box]
    if not boxes:
        return [Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0)) for _ in frames]

    left = min(box[0] for box in boxes)
    top = min(box[1] for box in boxes)
    right = max(box[2] for box in boxes)
    bottom = max(box[3] for box in boxes)
    source_width = max(1, right - left)
    source_height = max(1, bottom - top)
    scale = min((FRAME_SIZE - PAD * 2) / source_width, (FRAME_SIZE - PAD * 2) / source_height, 1.0)
    target_width = max(1, round(source_width * scale))
    target_height = max(1, round(source_height * scale))

    normalized = []
    for frame in frames:
        cropped = frame.crop((left, top, right, bottom))
        resized = cropped.resize((target_width, target_height), Image.Resampling.NEAREST)
        out = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
        x = (FRAME_SIZE - target_width) // 2
        y = FRAME_SIZE - PAD - target_height
        out.alpha_composite(resized, (x, y))
        normalized.append(out)
    return normalized


def build_atlas() -> Image.Image:
    atlas = Image.new("RGBA", (RUNTIME_FRAMES * FRAME_SIZE, len(CLASS_IDS) * len(DIRECTIONS) * FRAME_SIZE), (0, 0, 0, 0))
    for class_index, class_id in enumerate(CLASS_IDS):
        for direction_index, direction in enumerate(DIRECTIONS):
            frames = normalize_strip(frame_paths(class_id, direction))
            row = class_index * len(DIRECTIONS) + direction_index
            for frame_index, frame in enumerate(frames):
                atlas.alpha_composite(frame, (frame_index * FRAME_SIZE, row * FRAME_SIZE))
    return atlas


def build_contact(atlas: Image.Image) -> Image.Image:
    label_width = 190
    scale = 2
    row_height = FRAME_SIZE * scale
    out = Image.new("RGBA", (label_width + atlas.width * scale, atlas.height * scale), (18, 18, 20, 255))
    draw = ImageDraw.Draw(out)
    for class_index, class_id in enumerate(CLASS_IDS):
        for direction_index, direction in enumerate(DIRECTIONS):
            row = class_index * len(DIRECTIONS) + direction_index
            y = row * row_height
            draw.text((10, y + 28), f"{class_id} {direction}", fill=(220, 230, 230, 255))
            source = atlas.crop((0, row * FRAME_SIZE, atlas.width, (row + 1) * FRAME_SIZE))
            out.alpha_composite(source.resize((atlas.width * scale, row_height), Image.Resampling.NEAREST), (label_width, y))
    return out


def validate_manifest() -> None:
    payload = json.loads(MANIFEST.read_text())
    if not payload.get("ok"):
        raise RuntimeError("PixelLab manifest is not ok.")
    seen = {entry["classId"] for entry in payload.get("results", []) if entry.get("ok")}
    missing = [class_id for class_id in CLASS_IDS if class_id not in seen]
    if missing:
        raise RuntimeError(f"PixelLab manifest missing classes: {missing}")


def main() -> None:
    validate_manifest()
    atlas = build_atlas()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(OUTPUT)

    contact = build_contact(atlas)
    CONTACT.parent.mkdir(parents=True, exist_ok=True)
    contact.save(CONTACT)
    PROOF.parent.mkdir(parents=True, exist_ok=True)
    contact.save(PROOF)

    print(
        json.dumps(
            {
                "ok": True,
                "output": str(OUTPUT.relative_to(ROOT)),
                "contact": str(CONTACT.relative_to(ROOT)),
                "proof": str(PROOF.relative_to(ROOT)),
                "classes": len(CLASS_IDS),
                "directions": len(DIRECTIONS),
                "framesPerDirection": RUNTIME_FRAMES,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
