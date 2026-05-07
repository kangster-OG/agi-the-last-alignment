# Player Damage VFX V1

Date: 2026-05-06

Purpose: source-backed player damage feedback for Armistice and future close-camera combat. This sheet supports avatar hit flash, contact-hit sparks, boss-charge impact, corruption burn ticks, HP warning UI pulse, invulnerability shell, and downed burst feedback without adding a directional danger ring.

## Source

- `player_damage_vfx_source_v1.png`: ChatGPT Images source sheet copied from `/Users/donghokang/.codex/generated_images/019df9f6-1f25-7270-991a-01ea15ffb313/ig_029589d47cf5abc30169fbe9e468788194ba6551069b8cc083.png`.
- `player_damage_vfx_source_v1_keyed.png`: mechanical chroma-key cleanup using the Codex imagegen helper.
- `assets/sprites/effects/player_damage_vfx_v1.png`: runtime 6-frame 128x128 transparent sheet mechanically cropped, padded, resized, and packed from the keyed source.

## Prompt Summary

Generated as a 3x2 pixel-art VFX source sheet on pure green chroma key: contact hit spark, boss charge hit burst, corruption burn tick, HP rail alert glyph, invulnerability flicker shell, and downed frame burst. Style matches Armistice Plaza: battered civic sci-fi, frontier-lab emergency hardware, cyan/teal alignment energy, amber hazard sparks, red-violet AGI corruption, crisp chunky pixel art, no text, no logos, no frame borders.

## Runtime Use

- Loader: `src/assets/playerDamageVfx.ts`
- Runtime draw path: `src/level/LevelRunState.ts`
- Manifest IDs:
  - `concept.player_damage_vfx.source_v1`
  - `effect.player_damage.production_sheet_v1`
- Provenance keys:
  - `chatgpt_player_damage_vfx_v1_source`
  - `player_damage_vfx_v1_runtime_pack`

## No-Cheap-Art-Shortcuts Note

The expressive VFX originates in ChatGPT Images. Python/helper use was mechanical only: chroma-key removal, crop, padding, nearest-neighbor resize, and atlas packing.
