#!/usr/bin/env python3
from pathlib import Path
from typing import Optional
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "proof" / "visual-fidelity-camera" / "armistice-framing-contact.png"


def rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def alpha_bbox(frame: Image.Image) -> Optional[tuple[int, int, int, int]]:
    return frame.getchannel("A").getbbox()


def margins(frame: Image.Image, bbox: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    left, top, right, bottom = bbox
    return left, top, frame.width - right, frame.height - bottom


def assert_margin(label: str, frame: Image.Image, minimum: tuple[int, int, int, int], failures: list[str]) -> None:
    bbox = alpha_bbox(frame)
    if bbox is None:
        failures.append(f"{label}: empty frame")
        return
    actual = margins(frame, bbox)
    names = ("left", "top", "right", "bottom")
    for name, value, required in zip(names, actual, minimum):
        if value < required:
            failures.append(f"{label}: {name} margin {value}px < required {required}px; bbox={bbox}")


def assert_no_green_chroma_remnant(label: str, frame: Image.Image, failures: list[str]) -> None:
    pixels = frame.load()
    count = 0
    for y in range(frame.height):
        for x in range(frame.width):
            r, g, b, a = pixels[x, y]
            if a > 8 and g > 110 and g - r > 34 and g - b > 34:
                count += 1
    if count:
        failures.append(f"{label}: {count} opaque green-key remnant pixels remain")


def changed_pixels(a: Image.Image, b: Image.Image) -> int:
    diff = ImageChops.difference(a, b)
    return sum(1 for pixel in diff.getdata() if pixel[3] > 0 or pixel[:3] != (0, 0, 0))


def frame_sheet(path: Path, frame_w: int, frame_h: int, rows: int, cols: int) -> list[tuple[str, Image.Image]]:
    image = rgba(path)
    frames: list[tuple[str, Image.Image]] = []
    for row in range(rows):
        for col in range(cols):
            box = (col * frame_w, row * frame_h, (col + 1) * frame_w, (row + 1) * frame_h)
            frames.append((f"{path.name} r{row} c{col}", image.crop(box)))
    return frames


def write_contact(frames: list[tuple[str, Image.Image]]) -> None:
    cell_w, cell_h = 112, 126
    cols = 4
    rows = (len(frames) + cols - 1) // cols
    contact = Image.new("RGBA", (cols * cell_w, rows * cell_h), (18, 20, 24, 255))
    draw = ImageDraw.Draw(contact)
    for index, (label, frame) in enumerate(frames):
        x = (index % cols) * cell_w
        y = (index // cols) * cell_h
        draw.rectangle((x + 8, y + 8, x + 8 + frame.width - 1, y + 8 + frame.height - 1), outline=(92, 224, 180, 255), width=1)
        contact.alpha_composite(frame, (x + 8, y + 8))
        bbox = alpha_bbox(frame)
        if bbox:
            l, t, r, b = bbox
            draw.rectangle((x + 8 + l, y + 8 + t, x + 8 + r - 1, y + 8 + b - 1), outline=(255, 209, 102, 255), width=1)
            draw.text((x + 8, y + 92), f"{margins(frame, bbox)}", fill=(244, 236, 216, 255))
        draw.text((x + 8, y + 106), label[:18], fill=(170, 176, 189, 255))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    contact.save(OUT)


def main() -> None:
    failures: list[str] = []
    frames: list[tuple[str, Image.Image]] = []

    boss_path = ROOT / "assets" / "sprites" / "bosses" / "oath_eater.png"
    boss_sheet = rgba(boss_path)
    boss_frame_size = boss_sheet.height
    boss_cols = boss_sheet.width // boss_frame_size
    if boss_frame_size not in {128, 192, 224} or boss_sheet.height != boss_frame_size or boss_cols < 3:
        failures.append(f"oath_eater: expected at least three {boss_frame_size}x{boss_frame_size} animation frames, got {boss_sheet.size}")
    boss_frames = []
    for col in range(max(1, boss_cols)):
        frame = boss_sheet.crop((col * boss_frame_size, 0, (col + 1) * boss_frame_size, boss_frame_size))
        boss_frames.append(frame)
        frames.append((f"oath_eater c{col}", frame))
        required_margin = (18, 12, 18, 14) if boss_frame_size >= 224 else (8, 8, 8, 5)
        assert_margin(f"oath_eater c{col}", frame, required_margin, failures)
    if len(boss_frames) >= 3:
        diffs = [changed_pixels(boss_frames[index], boss_frames[index + 1]) for index in range(len(boss_frames) - 1)]
        if min(diffs) < 900:
            failures.append(f"oath_eater: animation frames are too similar; changed pixels={diffs}")

    for path in [
        ROOT / "assets" / "sprites" / "players" / "accord_striker_walk_v2.png",
        ROOT / "assets" / "sprites" / "players" / "class_roster_m49.png",
    ]:
        row_widths = {row: [] for row in range(4)}
        row_heights = {row: [] for row in range(4)}
        row_frames = {row: [] for row in range(4)}
        for label, frame in frame_sheet(path, 80, 80, 4, 3):
            row = int(label.split(" r", 1)[1].split(" ", 1)[0])
            bbox = alpha_bbox(frame)
            if bbox:
                row_widths[row].append(bbox[2] - bbox[0])
                row_heights[row].append(bbox[3] - bbox[1])
                row_frames[row].append(frame)
            frames.append((label, frame))
            assert_margin(label, frame, (7, 7, 7, 7), failures)
            assert_no_green_chroma_remnant(label, frame, failures)
        east_avg = sum(row_widths[1]) / max(1, len(row_widths[1]))
        west_avg = sum(row_widths[3]) / max(1, len(row_widths[3]))
        if abs(east_avg - west_avg) > 3:
            failures.append(f"{path.name}: east/west visual widths diverge ({east_avg:.1f}px vs {west_avg:.1f}px)")
        south_height = sum(row_heights[0]) / max(1, len(row_heights[0]))
        north_height = sum(row_heights[2]) / max(1, len(row_heights[2]))
        if north_height < south_height - 4:
            failures.append(f"{path.name}: north/W visual height is undersized ({north_height:.1f}px vs south {south_height:.1f}px)")
        for row, direction in [(1, "east"), (2, "north"), (3, "west")]:
            diffs = [changed_pixels(row_frames[row][index], row_frames[row][index + 1]) for index in range(2)] if len(row_frames[row]) >= 3 else []
            if diffs and min(diffs) < 700:
                failures.append(f"{path.name}: {direction} walk frames do not visibly animate enough; changed pixels={diffs}")

    write_contact(frames)
    if failures:
        raise SystemExit("\\n".join(failures))
    print(f"Armistice sprite framing OK; contact sheet: {OUT}")


if __name__ == "__main__":
    main()
