#!/usr/bin/env python3
from __future__ import annotations

from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
SOURCE_ZIP = (
    ROOT
    / "assets"
    / "concepts"
    / "pixellab_refs"
    / "alignment_grid_rebuild_v1"
    / "alignment_grid_pixellab_fresh_export_20260511.zip"
)
OUT_DIR = ROOT / "assets" / "concepts" / "pixellab_refs" / "alignment_grid_rebuild_v1"
RAW_DIR = OUT_DIR / "raw"
ATLAS_PATH = OUT_DIR / "alignment_grid_pixellab_fresh_raw_atlas.png"
CONTACT_PATH = OUT_DIR / "alignment_grid_pixellab_fresh_raw_contact.png"


def load_pngs_from_zip(path: Path) -> list[Image.Image]:
    if not path.exists():
        raise SystemExit(f"Missing PixelLab export zip: {path}")

    frames: list[tuple[str, Image.Image]] = []
    with ZipFile(path) as archive:
        for name in sorted(archive.namelist()):
            if name.endswith("/") or not name.lower().endswith(".png"):
                continue
            with archive.open(name) as file:
                image = Image.open(BytesIO(file.read())).convert("RGBA")
                frames.append((name, image.copy()))

    if len(frames) < 16:
        raise SystemExit(f"Expected at least 16 PNGs in PixelLab export, found {len(frames)}")

    return [image for _, image in frames[:16]]


def trim(image: Image.Image) -> Image.Image:
    box = image.getbbox()
    if not box:
        return Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    cropped = image.crop(box)
    cell = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    scale = min(112 / cropped.width, 112 / cropped.height, 1)
    if scale != 1:
        cropped = cropped.resize(
            (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))),
            Image.Resampling.NEAREST,
        )
    cell.alpha_composite(cropped, ((128 - cropped.width) // 2, (128 - cropped.height) // 2))
    return cell


def make_sheet(frames: list[Image.Image], path: Path, labels: bool) -> None:
    gap = 8 if labels else 0
    label_h = 18 if labels else 0
    cell_w = 128
    cell_h = 128 + label_h
    sheet = Image.new("RGBA", (4 * cell_w + 5 * gap, 4 * cell_h + 5 * gap), (12, 14, 18, 255 if labels else 0))
    draw = ImageDraw.Draw(sheet)
    for index, frame in enumerate(frames):
        col = index % 4
        row = index // 4
        x = gap + col * (cell_w + gap)
        y = gap + row * (cell_h + gap)
        sheet.alpha_composite(frame, (x, y))
        if labels:
            draw.text((x + 4, y + 130), f"frame_{index:02d}", fill=(221, 231, 229, 255))
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path, optimize=True, compress_level=9)


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    frames = [trim(image) for image in load_pngs_from_zip(SOURCE_ZIP)]
    for index, frame in enumerate(frames):
        frame.save(RAW_DIR / f"frame_{index:02d}.png", optimize=True, compress_level=9)
    make_sheet(frames, ATLAS_PATH, labels=False)
    make_sheet(frames, CONTACT_PATH, labels=True)
    print(ATLAS_PATH)
    print(CONTACT_PATH)


if __name__ == "__main__":
    main()
