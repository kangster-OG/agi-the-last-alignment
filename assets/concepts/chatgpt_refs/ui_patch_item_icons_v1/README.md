# Emergency Patch Item Icons V1

Date: 2026-05-06

Purpose: source-art replacement for the draft-card placeholder item thumbnails. User feedback identified the previous generic card stamp as placeholder-looking and not acceptable as item art.

## Source

- `emergency_patch_item_icons_source_v1.png`: ChatGPT Images source board generated on a flat chroma-key background.
- `emergency_patch_item_icons_source_v1_keyed.png`: mechanically keyed alpha source generated with the Codex imagegen chroma-key helper.
- `assets/ui/emergency_patch_item_icons_v1.png`: runtime atlas packed from the keyed source.

## Prompt Intent

Generate eight distinct high-fidelity pixel-art emergency patch objects for:

- Refusal Halo
- Context Bloom
- Panic-Optimized Dash
- The No Button
- Treaty Anchor Toolkit
- Adversarial Boss Notes
- Rescue Subroutine
- Denial Waveform

The icons use the accepted Armistice material language: chipped civic ceramic, cyan terminal glass, amber hazard accents, red breach warning hardware, violet AGI corruption, dark outlines, and detailed internal pixel breakup.

## Runtime Notes

`assets/ui/emergency_patch_item_icons_v1.png` is an 8-frame, 96x96-per-frame transparent atlas. Python/Pillow was used only for mechanical chroma-key removal, connected-component crop detection, resize, and packing. No expressive item art was drawn in code.

Current draft-card mapping uses direct IDs for the generated subjects and protocol-slot fallback to the closest generated object for cards that do not yet have dedicated item art.
