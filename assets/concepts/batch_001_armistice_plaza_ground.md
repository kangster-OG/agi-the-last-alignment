# Batch 001 Concept Target: Armistice Plaza Ground Atlas

Manifest ID: `concept.armistice_plaza.ground_atlas_brief`

Purpose: define the first production terrain target before PixelLab atlas generation and manual tile cleanup.

## Creative Target

Armistice Plaza is a ruined treaty-square inside The Armistice Zone. Ground tiles should support a dense isometric diorama while staying readable under hordes, projectiles, pickups, boss telegraphs, and co-op player labels.

The first atlas should cover:

- neutral plaza stone
- cracked plaza stone
- treaty-road stripe/dark seam
- breach-corrupted purple stone
- teal emergency terminal floor
- barricade corridor asphalt/brown hazard ground
- soft transition tiles between the above

Do not imitate any existing game tile set. Do not include official logos, official product UI, or real-world brand material.

## ChatGPT Images Art-Direction Prompt

```text
Use case: stylized-concept
Asset type: isometric pixel-art terrain atlas concept for a browser horde-survival roguelite
Primary request: Create an original Armistice Plaza ground tile atlas concept for AGI: The Last Alignment.
Scene/backdrop: clean production sheet showing tile families on a neutral background, no logos, no UI, no characters.
Subject: 2:1 isometric pixel tiles for a ruined sci-fi treaty plaza: neutral stone, cracked stone, dark treaty-road seams, purple cosmic breach corruption, teal emergency terminal floor, brown barricade corridor ground, and transition examples.
Style: chunky readable pixel-art direction, low noise, strong tile edges, tactical diorama clarity, apocalypse damage without visual clutter.
Composition: organized tile rows, each tile shown as a 64x32 diamond, with a few 3x3 transition samples.
Color direction: cool gray stone base, dark blue-gray shadows, teal emergency system accents, restrained purple breach corruption, muted brown corridor patches, small yellow hazard chips.
Constraints: original art only, no copied tile sets, no official logos, no text labels inside tiles, no photoreal texture, no busy noise, no gradients that break pixel readability.
```

## PixelLab Production Prompt Seed

```text
Original 2:1 isometric pixel-art terrain atlas for a ruined sci-fi treaty plaza. 64x32 diamond tiles: neutral gray plaza stone, cracked plaza stone, dark treaty-road seam, purple cosmic breach corruption, teal emergency terminal floor, muted brown barricade corridor ground, seamless transitions, low noise, readable under many sprites, no logos, no text, transparent background atlas, consistent palette.
```

## Cleanup Checklist

- Verify each tile is exactly 64x32 before atlas packing.
- Confirm transition edges are seamless in 3x3 test patches.
- Keep contrast lower than player/enemy silhouettes and boss telegraphs.
- Remove texture noise that flickers during camera movement.
- Export `assets/tiles/armistice_plaza/ground_atlas.png` only after cleanup.
- Update `tile.armistice_plaza.production_ground_atlas` dimensions and frame counts in `assets/asset_manifest.json`.

