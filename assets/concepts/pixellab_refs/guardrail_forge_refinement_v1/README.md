# Guardrail Forge PixelLab Refinement V1

Date: 2026-05-08

Purpose: authenticated PixelLab refinement source for Guardrail Forge after the ChatGPT Images source boards and gameplay proof lock. This folder preserves the PixelLab output that contributes to accepted runtime Guardrail Forge art.

## PixelLab Prompt

Transparent 128x128 isometric pixel-art object batch for AGI The Last Alignment, Guardrail Forge. Sixteen separate source frames: four flat forge floor/hold-plate decals, alloy temper relay, constitutional clamp, Silkgrid loom, overload sluice, four Doctrine Auditor drone poses, safe hold ring, calibration spark burst, doctrine jam pulse, quench/extraction beam. Chunky close-camera isometric pixel art, dark AGI server/civic forge material language, cyan core lights, amber guardrail metal, muted magenta AGI corruption. One complete object per frame, transparent background, no text, no UI, no logos, no labels, no square placeholder rugs.

## PixelLab Outputs

- `raw/frame_0.png` through `raw/frame_15.png`: 16 transparent 48x48 PixelLab Object Creator frames downloaded from the authenticated PixelLab browser session.
- `guardrail_forge_pixellab_raw_contact.png`: mechanical contact sheet for reviewing the raw PixelLab frame set.

## Runtime Use

Packed by `scripts/assets/pack-guardrail-forge-source-v1.py`.

Runtime outputs using PixelLab contribution:

- `assets/tiles/guardrail_forge/authored_ground.png`
- `assets/tiles/guardrail_forge/guardrail_forge_terrain_chunks_v1.png`
- `assets/props/guardrail_forge/guardrail_forge_props_objectives_v1.png`
- `assets/sprites/enemies/doctrine_auditors_sheet.png`
- `assets/sprites/effects/guardrail_forge_hazard_vfx_v1.png`

The packer uses PixelLab frames 0 to 3 as flat authored-ground and terrain-chunk decals, frames 4 to 7 as relay/objective props, frames 8 to 11 as Doctrine Auditor drone pressure frames, and frames 12 to 15 as guardrail hazard/objective VFX contribution. ChatGPT Images remains the stronger source for larger props, the high-resolution Doctrine Auditor boss/event strip, and additional VFX frames.

## Rejected Or Reference Source

The ChatGPT Images terrain board is preserved in `assets/concepts/chatgpt_refs/guardrail_forge_source_v1/` as material direction, but it is not accepted as runtime terrain because its raised side faces read as repeated wall/cube platforms in the close camera. Runtime terrain uses the flatter PixelLab decals instead.

## Notes

PixelLab was already authenticated in the in-app browser. Codex did not handle credentials, account secrets, billing actions, payment prompts, or security prompts.

No expressive Guardrail Forge art in this folder was created with Python, Pillow, Pixi Graphics, SVG, CSS, filters, recolors, overlays, or procedural drawing. Code only downloaded, cropped, padded, resized, packed, validated, and contact-sheeted source art.
