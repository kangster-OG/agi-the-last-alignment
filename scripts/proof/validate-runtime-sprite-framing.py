#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "proof" / "sprite-framing" / "runtime-sprite-framing-contact.png"


@dataclass(frozen=True)
class SheetSpec:
    label: str
    path: Path
    frame_w: int
    frame_h: int
    cols: int
    rows: int
    min_margin: tuple[int, int, int, int]
    max_margin: Optional[tuple[int, int, int, int]] = None
    allow_empty: bool = False


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def alpha_bbox(frame: Image.Image) -> Optional[tuple[int, int, int, int]]:
    return frame.getchannel("A").getbbox()


def margins(frame: Image.Image, bbox: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    left, top, right, bottom = bbox
    return left, top, frame.width - right, frame.height - bottom


def validate_sheet(spec: SheetSpec, frames_for_contact: list[tuple[str, Image.Image, Optional[tuple[int, int, int, int]]]]) -> list[str]:
    failures: list[str] = []
    if not spec.path.exists():
      return [f"{spec.label}: missing sheet {spec.path.relative_to(ROOT)}"]
    sheet = rgba(spec.path)
    expected = (spec.frame_w * spec.cols, spec.frame_h * spec.rows)
    if sheet.size != expected:
        failures.append(f"{spec.label}: expected sheet {expected}, got {sheet.size}")
        return failures
    for row in range(spec.rows):
        for col in range(spec.cols):
            frame = sheet.crop((col * spec.frame_w, row * spec.frame_h, (col + 1) * spec.frame_w, (row + 1) * spec.frame_h))
            label = f"{spec.label} r{row} c{col}"
            bbox = alpha_bbox(frame)
            frames_for_contact.append((label, frame, bbox))
            if bbox is None:
                if not spec.allow_empty:
                    failures.append(f"{label}: empty frame")
                continue
            actual = margins(frame, bbox)
            names = ("left", "top", "right", "bottom")
            for name, value, required in zip(names, actual, spec.min_margin):
                if value < required:
                    failures.append(f"{label}: {name} margin {value}px < required {required}px; bbox={bbox}")
            if spec.max_margin:
                for name, value, limit in zip(names, actual, spec.max_margin):
                    if value > limit:
                        failures.append(f"{label}: {name} margin {value}px > maximum {limit}px; sprite may be undersized; bbox={bbox}")
    return failures


def write_contact(frames: list[tuple[str, Image.Image, Optional[tuple[int, int, int, int]]]]) -> None:
    thumb_w, thumb_h = 148, 136
    cols = 4
    rows = (len(frames) + cols - 1) // cols
    contact = Image.new("RGBA", (cols * thumb_w, rows * thumb_h), (16, 20, 26, 255))
    draw = ImageDraw.Draw(contact)
    for index, (label, frame, bbox) in enumerate(frames):
        x = (index % cols) * thumb_w
        y = (index // cols) * thumb_h
        scale = min((thumb_w - 18) / frame.width, (thumb_h - 34) / frame.height)
        preview = frame.resize((round(frame.width * scale), round(frame.height * scale)), Image.Resampling.NEAREST)
        px = x + (thumb_w - preview.width) // 2
        py = y + 8
        draw.rectangle((px, py, px + preview.width - 1, py + preview.height - 1), outline=(86, 224, 190, 255), width=1)
        contact.alpha_composite(preview, (px, py))
        if bbox:
            l, t, r, b = bbox
            scaled_box = (px + round(l * scale), py + round(t * scale), px + round(r * scale), py + round(b * scale))
            draw.rectangle(scaled_box, outline=(255, 209, 102, 255), width=1)
            draw.text((x + 6, y + thumb_h - 24), str(margins(frame, bbox)), fill=(244, 236, 216, 255))
        draw.text((x + 6, y + thumb_h - 12), label[:24], fill=(170, 176, 189, 255))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    contact.save(OUT)


def main() -> None:
    specs = [
        SheetSpec("oath_eater", ROOT / "assets" / "sprites" / "bosses" / "oath_eater.png", 224, 224, 4, 1, (18, 12, 18, 14)),
        SheetSpec("motherboard_eel", ROOT / "assets" / "sprites" / "bosses" / "motherboard_eel.png", 256, 256, 4, 1, (16, 14, 16, 14), (54, 58, 54, 60)),
        SheetSpec("station_that_arrives", ROOT / "assets" / "sprites" / "bosses" / "station_that_arrives.png", 288, 256, 3, 2, (14, 10, 14, 14), (58, 60, 58, 62)),
        SheetSpec("redactor_saint", ROOT / "assets" / "sprites" / "bosses" / "redactor_saint.png", 320, 320, 4, 1, (14, 10, 14, 14)),
        SheetSpec("injunction_engine", ROOT / "assets" / "sprites" / "bosses" / "injunction_engine.png", 320, 320, 4, 1, (14, 10, 14, 14)),
        SheetSpec("alien_god_intelligence", ROOT / "assets" / "sprites" / "bosses" / "alien_god_intelligence.png", 384, 384, 4, 1, (16, 12, 16, 14)),
        SheetSpec("accord_striker_walk_v2", ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png", 80, 80, 3, 4, (7, 7, 7, 7)),
    ]
    frames: list[tuple[str, Image.Image, Optional[tuple[int, int, int, int]]]] = []
    failures: list[str] = []
    for spec in specs:
        failures.extend(validate_sheet(spec, frames))
    write_contact(frames)
    if failures:
        raise SystemExit("\n".join(failures))
    print(f"Runtime sprite framing OK; contact sheet: {OUT}")


if __name__ == "__main__":
    main()
