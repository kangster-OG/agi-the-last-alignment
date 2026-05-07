#!/usr/bin/env python3
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "assets/concepts/chatgpt_refs/build_weapon_vfx_v1"
SOURCE = SOURCE_DIR / "build_weapon_vfx_source_v1.png"
KEYED = SOURCE_DIR / "build_weapon_vfx_source_v1_keyed.png"
OUT = ROOT / "assets/sprites/effects/build_weapon_vfx_v1.png"

FRAME_W = 192
FRAME_H = 128

CELLS = [
    ("vectorProjectile", (0, 0, 384, 175)),
    ("vectorTrail", (384, 0, 768, 175)),
    ("vectorChargedTrail", (768, 0, 1152, 175)),
    ("vectorImpact", (1152, 0, 1536, 175)),
    ("signalProjectile", (0, 175, 384, 360)),
    ("signalRing", (384, 175, 768, 360)),
    ("signalBurst", (768, 175, 1152, 360)),
    ("signalImpact", (1152, 175, 1536, 360)),
    ("contextSaw", (0, 360, 384, 535)),
    ("contextSawSpin", (384, 360, 768, 535)),
    ("contextSawLarge", (768, 360, 1152, 535)),
    ("contextSawShardField", (1152, 360, 1536, 535)),
    ("patchMortarShell", (0, 535, 384, 690)),
    ("patchMortarTrail", (384, 535, 768, 690)),
    ("patchMortarArc", (768, 535, 1152, 690)),
    ("patchMortarImpact", (1152, 535, 1536, 690)),
    ("causalRailgunProjectile", (0, 690, 384, 830)),
    ("causalRailgunBeam", (384, 690, 768, 830)),
    ("causalRailgunChargedBeam", (768, 690, 1152, 830)),
    ("causalRailgunImpact", (1152, 690, 1536, 830)),
    ("coherenceIndexerIcon", (0, 830, 384, 1024)),
    ("anchorBodyguardIcon", (384, 830, 768, 1024)),
    ("predictionPriorityIcon", (768, 830, 1152, 1024)),
    ("causalRailgunIcon", (1152, 830, 1536, 1024)),
]

KEEP_LARGEST_COMPONENT = {
    "patchMortarShell",
    "patchMortarTrail",
    "patchMortarArc",
}


def keyed_source() -> Image.Image:
    source = Image.open(SOURCE).convert("RGBA")
    px = source.load()
    for y in range(source.height):
        for x in range(source.width):
            r, g, b, a = px[x, y]
            if g > 170 and r < 80 and b < 100:
                px[x, y] = (0, 0, 0, 0)
            elif g > 130 and r < 140 and b < 140:
                px[x, y] = (r, g, b, max(0, a - 180))
    return source


def trim_alpha(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if not box:
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    pad = 8
    left = max(0, box[0] - pad)
    top = max(0, box[1] - pad)
    right = min(image.width, box[2] + pad)
    bottom = min(image.height, box[3] + pad)
    return image.crop((left, top, right, bottom))


def keep_largest_alpha_component(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    visited: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []
    pixels = alpha.load()

    for y in range(image.height):
        for x in range(image.width):
            if (x, y) in visited or pixels[x, y] <= 12:
                continue
            stack = [(x, y)]
            visited.add((x, y))
            component: list[tuple[int, int]] = []
            while stack:
                cx, cy = stack.pop()
                component.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or ny < 0 or nx >= image.width or ny >= image.height or (nx, ny) in visited:
                        continue
                    if pixels[nx, ny] <= 12:
                        continue
                    visited.add((nx, ny))
                    stack.append((nx, ny))
            components.append(component)

    if not components:
        return image
    keep = set(max(components, key=len))
    cleaned = image.copy()
    out = cleaned.load()
    for y in range(cleaned.height):
        for x in range(cleaned.width):
            if pixels[x, y] > 0 and (x, y) not in keep:
                out[x, y] = (0, 0, 0, 0)
    return cleaned


def fit_frame(image: Image.Image, name: str) -> Image.Image:
    if name in KEEP_LARGEST_COMPONENT:
        image = keep_largest_alpha_component(image)
    image = trim_alpha(image)
    scale = min((FRAME_W - 16) / image.width, (FRAME_H - 16) / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    fitted = image.resize(size, Image.Resampling.NEAREST)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    frame.alpha_composite(fitted, ((FRAME_W - size[0]) // 2, (FRAME_H - size[1]) // 2))
    return frame


def main() -> None:
    source = keyed_source()
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    source.save(KEYED)

    atlas = Image.new("RGBA", (FRAME_W * len(CELLS), FRAME_H), (0, 0, 0, 0))
    for index, (name, box) in enumerate(CELLS):
        frame = fit_frame(source.crop(box), name)
        atlas.alpha_composite(frame, (index * FRAME_W, 0))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT)
    print(f"packed {len(CELLS)} build weapon VFX frames -> {OUT}")


if __name__ == "__main__":
    main()
