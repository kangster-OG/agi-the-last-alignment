#!/usr/bin/env python3
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "assets/concepts/chatgpt_refs/build_weapon_vfx_v2"
SOURCE = SOURCE_DIR / "build_weapon_vfx_source_v2.png"
KEYED = SOURCE_DIR / "build_weapon_vfx_source_v2_keyed.png"
OUT = ROOT / "assets/sprites/effects/build_weapon_vfx_v1.png"

FRAME_W = 192
FRAME_H = 128

CELLS = [
    ("vectorProjectile", (8, 250, 92, 430)),
    ("vectorTrail", (82, 235, 180, 435)),
    ("vectorChargedTrail", (172, 220, 300, 450)),
    ("vectorImpact", (288, 205, 430, 455)),
    ("signalProjectile", (420, 260, 505, 425)),
    ("signalRing", (505, 235, 625, 435)),
    ("signalBurst", (615, 220, 750, 450)),
    ("signalImpact", (620, 220, 758, 450)),
    ("contextSaw", (760, 230, 850, 450)),
    ("contextSawSpin", (860, 230, 960, 450)),
    ("contextSawLarge", (965, 230, 1080, 450)),
    ("contextSawShardField", (960, 230, 1085, 450)),
    ("patchMortarShell", (1090, 245, 1176, 465)),
    ("patchMortarTrail", (1172, 215, 1265, 485)),
    ("patchMortarArc", (1260, 145, 1470, 520)),
    ("patchMortarImpact", (1475, 260, 1595, 465)),
    ("causalRailgunProjectile", (1595, 230, 1705, 475)),
    ("causalRailgunBeam", (1698, 205, 1798, 500)),
    ("causalRailgunChargedBeam", (1810, 175, 1915, 520)),
    ("causalRailgunImpact", (1915, 250, 2020, 470)),
    ("coherenceIndexerIcon", (2018, 275, 2092, 430)),
    ("anchorBodyguardIcon", (2090, 240, 2170, 465)),
    ("predictionPriorityIcon", (1478, 250, 1555, 435)),
    ("causalRailgunIcon", (2090, 240, 2170, 465)),
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
