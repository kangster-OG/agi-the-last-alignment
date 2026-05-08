# Cooling Lake Nine PixelLab Refinement V1

Date: 2026-05-07

Purpose: authenticated PixelLab refinement source for Cooling Lake Nine after the first ChatGPT Images production-source pass. This folder preserves the actual PixelLab outputs used or evaluated for runtime refinement.

## PixelLab Outputs

- `cooling_terrain_tileset_pixellab_v1.png`: PixelLab Map Workshop 16x16 terrain transition for flooded coolant/server water into dry cracked server-floor island material. Preserved as a real PixelLab terrain reference, but not forced into the isometric authored ground because the output is clean top-down tile language rather than a complete close-camera isometric ground replacement.
- `terrain_iso_pixellab_v2_a_01.png` through `terrain_iso_pixellab_v2_a_04.png`: PixelLab isometric terrain chunk attempt. Preserved as source reference, but not used in runtime because the chunks had too much raised block/side-wall mass when repeated across the authored ground.
- `terrain_flat_pixellab_v3_01.png` through `terrain_flat_pixellab_v3_04.png`: accepted PixelLab flat isometric floor-decal terrain chunks for cable trench, rack-grate floor, cracked server floor, and coolant floor. These are the active runtime terrain source for the Cooling authored ground and transparent terrain chunk atlas.
- `cooling_props_pixellab_v1_01.png`: safe maintenance platform prop.
- `cooling_props_pixellab_v1_02.png`: cable bridge prop. Preserved as source, but not used in the runtime atlas because the generated source is clipped at the frame edge.
- `cooling_props_pixellab_v1_03.png`: flooded server rack wreck cluster prop.
- `cooling_props_pixellab_v1_04.png`: server buoy / coolant pad prop.
- `prompt_leech_pixellab_v1_01.png` through `prompt_leech_pixellab_v1_04.png`: Prompt Leech source frames for idle, rush, shard-drain, and recoil-style runtime poses.

## Runtime Use

Packed by `scripts/assets/pack-cooling-lake-nine-source-v1.py`.

Runtime outputs updated by this refinement:

- `assets/props/cooling_lake_nine/cooling_props_objectives_v1.png`
- `assets/sprites/enemies/prompt_leeches_sheet.png`
- `assets/tiles/cooling_lake_nine/authored_ground.png`
- `assets/tiles/cooling_lake_nine/cooling_terrain_chunks_v1.png`

The packer uses PixelLab flat terrain decals for the Cooling authored ground and terrain chunk atlas. It uses PixelLab props for the server buoy pads, rack wrecks, and safe platform; it keeps the prior ChatGPT Images Eel marker because the PixelLab cable bridge source is visibly clipped. The Prompt Leech strip now uses PixelLab frames, with duplicated source frames only for animation timing fill.

## Notes

PixelLab was used through the authenticated browser UI after user sign-in. Credentials, account secrets, billing actions, and security prompts were not handled by Codex.

No expressive art in this folder was created with Python, Pillow, Pixi Graphics, SVG, CSS, filters, recolors, overlays, or procedural drawing. Code only downloaded, cropped, padded, resized, packed, and validated source art.
