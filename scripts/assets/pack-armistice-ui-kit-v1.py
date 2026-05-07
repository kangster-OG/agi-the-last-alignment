#!/usr/bin/env python3
from pathlib import Path
from typing import Optional

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/concepts/chatgpt_refs/ui_armistice_field_terminal_v1/armistice_field_terminal_ui_source_v2_blank.png"
OUT = ROOT / "assets/ui/armistice_field_terminal_ui_v1.png"


def crop(source: Image.Image, box: tuple[int, int, int, int], size: Optional[tuple[int, int]] = None) -> Image.Image:
    image = source.crop(box).convert("RGBA")
    if size and image.size != size:
        image = image.resize(size, Image.Resampling.LANCZOS)
    return image


def paste(atlas: Image.Image, source: Image.Image, x: int, y: int) -> None:
    atlas.alpha_composite(source, (x, y))


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    atlas = Image.new("RGBA", (2048, 1536), (0, 0, 0, 0))

    # Mechanical crops only. Coordinates refer to the accepted ChatGPT Images source board.
    crops = {
        "panel": ((838, 28, 1514, 318), (704, 320), (0, 0)),
        "chip": ((28, 38, 503, 136), (512, 112), (704, 0)),
        "meter": ((548, 34, 797, 96), (320, 80), (1216, 0)),
        "pickup": ((28, 568, 786, 685), (768, 128), (0, 320)),
        "card": ((548, 204, 797, 542), (256, 360), (768, 320)),
        "route": ((26, 196, 511, 532), (512, 360), (1024, 320)),
        "summary": ((838, 330, 1514, 612), (704, 320), (0, 704)),
        "warning": ((836, 766, 953, 825), (288, 96), (704, 704)),
        "anchorBadge": ((984, 828, 1133, 887), (288, 96), (992, 704)),
        "synergyBadge": ((836, 704, 953, 763), (288, 96), (1280, 704)),
        "connectorTeal": ((1140, 735, 1509, 765), (512, 40), (704, 832)),
        "connectorAmber": ((1140, 781, 1509, 811), (512, 40), (704, 872)),
        "connectorViolet": ((1140, 826, 1509, 856), (512, 40), (704, 912)),
        "connectorRed": ((1140, 873, 1509, 904), (512, 40), (704, 952)),
        "button": ((840, 930, 1377, 1005), (384, 80), (1216, 832)),
        "screen": ((28, 716, 511, 994), (384, 192), (1216, 912)),
        "tokenProof": ((838, 646, 897, 708), (64, 64), (0, 1040)),
        "tokenAnchor": ((921, 646, 981, 708), (64, 64), (64, 1040)),
        "tokenShard": ((1004, 646, 1062, 708), (64, 64), (128, 1040)),
        "tokenPatch": ((1084, 646, 1146, 708), (64, 64), (192, 1040)),
        "tokenDraft": ((1164, 646, 1226, 708), (64, 64), (256, 1040)),
        "tokenData": ((1248, 646, 1308, 708), (64, 64), (320, 1040)),
        "tokenSupply": ((1328, 646, 1390, 708), (64, 64), (384, 1040)),
        "tokenCredits": ((1412, 646, 1472, 708), (64, 64), (448, 1040)),
        "microTeal": ((1260, 776, 1318, 790), (96, 20), (512, 1040)),
        "microAmber": ((1260, 822, 1318, 836), (96, 20), (512, 1064)),
        "microRed": ((1260, 868, 1318, 882), (96, 20), (512, 1088)),
        "microViolet": ((1260, 914, 1318, 928), (96, 20), (512, 1112)),
    }

    for box, size, pos in crops.values():
        paste(atlas, crop(source, box, size), *pos)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT)


if __name__ == "__main__":
    main()
