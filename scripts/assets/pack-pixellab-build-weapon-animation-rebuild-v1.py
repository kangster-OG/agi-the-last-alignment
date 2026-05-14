#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = ROOT / "assets/concepts/pixellab_refs/build_weapon_animation_rebuild_v1/raw"
OUT_DIR = ROOT / "assets/concepts/pixellab_refs/build_weapon_animation_rebuild_v1"
ATLAS = OUT_DIR / "build_weapon_animation_pixellab_raw_atlas.png"
CONTACT = OUT_DIR / "build_weapon_animation_pixellab_raw_contact.png"

CELL = 128


def trim(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    box = image.getchannel("A").getbbox()
    if not box:
        return Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    cropped = image.crop(box)
    scale = min(112 / cropped.width, 112 / cropped.height, 1)
    if scale != 1:
        cropped = cropped.resize(
            (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
            Image.Resampling.NEAREST,
        )
    frame = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    frame.alpha_composite(cropped, ((CELL - cropped.width) // 2, (CELL - cropped.height) // 2))
    return frame


def make_sheet(frames: list[Image.Image], path: Path, labels: bool) -> None:
    gap = 8 if labels else 0
    label_h = 18 if labels else 0
    width = 4 * CELL + 5 * gap
    height = 4 * (CELL + label_h) + 5 * gap
    sheet = Image.new("RGBA", (width, height), (12, 14, 18, 255 if labels else 0))
    draw = ImageDraw.Draw(sheet)
    for index, frame in enumerate(frames):
        col = index % 4
        row = index // 4
        x = gap + col * (CELL + gap)
        y = gap + row * (CELL + label_h + gap)
        sheet.alpha_composite(frame, (x, y))
        if labels:
            draw.text((x + 4, y + CELL + 2), f"frame_{index:02d}", fill=(221, 231, 229, 255))
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path, optimize=True, compress_level=9)


def main() -> None:
    files = sorted(SRC_DIR.glob("*frame_*.png"), key=lambda path: int(path.stem.split("_")[-1]))
    if len(files) < 16:
        raise SystemExit(f"Expected 16 PixelLab frames, found {len(files)}")
    frames = [trim(Image.open(path)) for path in files[:16]]
    make_sheet(frames, ATLAS, labels=False)
    make_sheet(frames, CONTACT, labels=True)
    print(ATLAS)
    print(CONTACT)


if __name__ == "__main__":
    main()
