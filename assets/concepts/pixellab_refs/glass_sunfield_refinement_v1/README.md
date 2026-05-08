# Glass Sunfield PixelLab Refinement V1

Date: 2026-05-08

Purpose: authenticated PixelLab refinement source for Glass Sunfield after the ChatGPT Images source boards and gameplay proof lock. This folder preserves the PixelLab output that contributes to accepted runtime Glass Sunfield art.

## PixelLab Prompt

Transparent 128x128 isometric pixel-art object batch for AGI The Last Alignment, Glass Sunfield. Sixteen separate source frames, one complete object per frame, transparent background, no text, no UI, no logos, no labels, no sprite sheet inside a frame. Chunky close-camera isometric pixel art, dark AGI server/civic glass material, cyan cores, mint prism light, amber mirror shards, red-orange wrong-sun burn. Frames 1-4: flat paper-thin floor decals only, no walls or cubes: cracked black glass server floor, shaded lens courtyard floor, exposed red sunburn glass lane, prism-window mint floor. Frames 5-8: objective props: Western Shade Lens console, Mistral prism vane, DeepMind mirror lens terminal, Glass Prism Gate/extraction prism. Frames 9-12: non-human enemy pressure frames: two Solar Reflection floating prism cores and two Choirglass shard-wing attackers, readable at 48px. Frames 13-16: VFX/gameplay props: shade pocket ring, exposed glass burn streak, reflection jam pulse, prism extraction beam. Avoid raised block side faces, square placeholder rugs, clipped actors, humanoids, animals, brand marks, words, icons.

## PixelLab Outputs

- `raw/frame_0.png` through `raw/frame_15.png`: 16 transparent 48x48 PixelLab Object Creator frames downloaded from the authenticated PixelLab browser session.
- `glass_sunfield_pixellab_raw_contact.png`: mechanical contact sheet for reviewing the raw PixelLab frame set.

## Runtime Use

Packed by `scripts/assets/pack-glass-sunfield-source-v1.py`.

Runtime outputs using PixelLab contribution:

- `assets/tiles/glass_sunfield/authored_ground.png`
- `assets/tiles/glass_sunfield/glass_sunfield_terrain_chunks_v1.png`
- `assets/props/glass_sunfield/glass_sunfield_props_objectives_v1.png`
- `assets/sprites/enemies/solar_reflections_sheet.png`
- `assets/sprites/enemies/choirglass_sheet.png`
- `assets/sprites/effects/glass_sunfield_hazard_vfx_v1.png`

The packer uses PixelLab frames 0, 1, and 3 as accepted flat terrain/prism-floor contribution, frames 4 to 7 as lens/prism objective props, frames 8 to 11 as Solar Reflection and Choirglass pressure frames, and frames 12 to 15 as shade/exposure/reflection/extraction VFX contribution. ChatGPT Images remains the stronger source for larger terrain coverage, the high-resolution Wrong Sunrise boss/event strip, and additional prop/VFX frames.

## Rejected Or Reference Source

PixelLab frame 2 is preserved in the raw folder and contact sheet but rejected for runtime terrain because its raised side face reads as a strip artifact in close-camera proof captures. Runtime exposed-lane terrain uses accepted ChatGPT Images source instead.

## Notes

PixelLab was already authenticated in the in-app browser. Codex did not handle credentials, account secrets, billing actions, payment prompts, or security prompts.

No expressive Glass Sunfield art in this folder was created with Python, Pillow, Pixi Graphics, SVG, CSS, filters, recolors, overlays, or procedural drawing. Code only downloaded, cropped, padded, resized, packed, validated, and contact-sheeted source art.
