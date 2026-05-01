#!/usr/bin/env python3
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = ROOT / "assets/concepts/pixellab_refs/faction_sigils_m59"
RAW_ATLAS = RAW_DIR / "faction_sigils_pixellab_m59_raw_atlas.png"
OUTPUT = ROOT / "assets/ui/faction_sigils_pixellab_m59.png"

FACTION_IDS = [
    "openai_accord",
    "anthropic_safeguard",
    "google_deepmind_gemini",
    "xai_grok_free_signal",
    "deepseek_abyssal",
    "qwen_silkgrid",
    "meta_llama_open_herd",
    "mistral_cyclone",
]

FRAME = 64


def removable_border_pixel(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a < 8:
        return True
    return r >= 218 and g >= 218 and b >= 218 and max(r, g, b) - min(r, g, b) <= 36


def clean_frame(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    if image.size != (FRAME, FRAME):
        image = image.resize((FRAME, FRAME), Image.Resampling.NEAREST)

    pixels = image.load()
    removable: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    for x in range(FRAME):
        queue.append((x, 0))
        queue.append((x, FRAME - 1))
    for y in range(FRAME):
        queue.append((0, y))
        queue.append((FRAME - 1, y))

    while queue:
        x, y = queue.popleft()
        if (x, y) in removable or not (0 <= x < FRAME and 0 <= y < FRAME):
            continue
        if not removable_border_pixel(pixels[x, y]):
            continue
        removable.add((x, y))
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    cleaned = image.copy()
    out = cleaned.load()
    for x, y in removable:
        r, g, b, _ = out[x, y]
        out[x, y] = (r, g, b, 0)
    return cleaned


def main() -> None:
    raw_atlas = Image.new("RGBA", (FRAME * len(FACTION_IDS), FRAME), (0, 0, 0, 0))
    cleaned_atlas = Image.new("RGBA", (FRAME * len(FACTION_IDS), FRAME), (0, 0, 0, 0))

    for index, faction_id in enumerate(FACTION_IDS):
        source = RAW_DIR / f"{faction_id}_raw.png"
        if not source.exists():
            raise FileNotFoundError(source)
        raw = Image.open(source).convert("RGBA")
        if raw.size != (FRAME, FRAME):
            raw = raw.resize((FRAME, FRAME), Image.Resampling.NEAREST)
        cleaned = clean_frame(raw)
        if cleaned.getbbox() is None:
            raise ValueError(f"{source} cleaned to an empty frame")
        raw_atlas.alpha_composite(raw, (index * FRAME, 0))
        cleaned_atlas.alpha_composite(cleaned, (index * FRAME, 0))

    RAW_ATLAS.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    raw_atlas.save(RAW_ATLAS)
    cleaned_atlas.save(OUTPUT)
    print(f"Wrote {RAW_ATLAS.relative_to(ROOT)}")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
