# Extraction Gate V1

Date: 2026-05-06

Purpose: source-backed Armistice extraction gate art for the post-clear exit objective. The gate appears only after the Armistice reality-patch timer has elapsed and Oath-Eater is defeated, replacing instant level completion with a player-facing extraction destination.

## Source

- `extraction_gate_source_v1.png`: ChatGPT Images source strip, copied from `/Users/donghokang/.codex/generated_images/019df9f6-1f25-7270-991a-01ea15ffb313/ig_0c3fef8fb744da380169fbcaeec08881989b0dd7fe9c40bc40.png`.
- `extraction_gate_source_v1_keyed.png`: mechanical chroma-key cleanup using the Codex imagegen helper.
- `assets/props/armistice_plaza/extraction_gate_sheet.png`: runtime 3-frame 256x256 transparent sheet, mechanically cropped, padded, resized, and packed from the keyed source.

## Prompt Summary

Generated as a premium isometric pixel-art Armistice/Civic Accord extraction gate on a flat green chroma-key background: three frame states, grounded heavy emergency-lab hardware, cracked treaty-stone base, oxidized metal braces, cyan/teal portal light, yellow hazard chips, blue shard accents, warm civic stone, red breach warnings, no text, no logos, no UI labels, no square platform, no cut-off silhouette, generous padding for runtime cropping.

## Runtime Use

- Loader: `src/assets/extractionGate.ts`
- Runtime draw path: `src/level/LevelRunState.ts`
- Manifest IDs:
  - `concept.extraction_gate.source_v1`
  - `prop.armistice_plaza.extraction_gate.production_sheet_v1`
- Provenance keys:
  - `chatgpt_extraction_gate_v1_source`
  - `extraction_gate_v1_runtime_pack`

## No-Cheap-Art-Shortcuts Note

This gate is not drawn in Pixi, SVG, CSS, or Python. Python/helper use was mechanical only: chroma-key removal, cropping, padding, nearest-neighbor resize, and atlas packing of accepted ChatGPT Images source art.
