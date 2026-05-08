# Blackwater Beacon PixelLab Refinement V1

Date: 2026-05-07

Purpose: authenticated PixelLab refinement source for Blackwater Beacon after the ChatGPT Images source boards and gameplay proof lock. This folder preserves the PixelLab output that contributes to accepted runtime Blackwater art.

## PixelLab Prompt

Transparent 128x128 isometric pixel-art object batch for AGI The Last Alignment Blackwater Beacon. Four separate source frames: blackwater ocean-platform deck chunk, downward cosmic antenna objective prop, Tidecall Static non-human signal creature, Maw Below Weather miniature boss/weather-mouth prop. Chunky close-camera isometric pixel art, dark server deck materials, blackwater ocean pressure, cyan static glow, amber signal-tower warning accents. One complete object per frame, transparent background, no text, no UI, no logos, no labels, no square placeholder rugs.

## PixelLab Outputs

- `raw/frame_0.png` through `raw/frame_15.png`: 16 transparent 48x48 PixelLab Object Creator frames downloaded from the authenticated PixelLab browser session.
- `blackwater_pixellab_raw_contact.png`: mechanical contact sheet for reviewing the raw PixelLab frame set.

## Runtime Use

Packed by `scripts/assets/pack-blackwater-beacon-source-v1.py`.

Runtime outputs using PixelLab contribution:

- `assets/tiles/blackwater_beacon/authored_ground.png`
- `assets/props/blackwater_beacon/blackwater_props_objectives_v1.png`
- `assets/sprites/effects/blackwater_hazard_vfx_v1.png`

The packer uses PixelLab frame 0 as authored-ground deck accent material, PixelLab frames 14 and 1 as prop/key-style runtime contribution, and PixelLab frames 10, 8, 13, 1, and 14 as accepted hazard/objective VFX contribution. ChatGPT Images remains the stronger source for the Maw Below Weather boss strip and the main Tidecall Static enemy strip.

## Notes

PixelLab was already authenticated in the in-app browser. Codex did not handle credentials, account secrets, billing actions, payment prompts, or security prompts.

No expressive Blackwater art in this folder was created with Python, Pillow, Pixi Graphics, SVG, CSS, filters, recolors, overlays, or procedural drawing. Code only downloaded, cropped, padded, resized, packed, validated, and contact-sheeted source art.
