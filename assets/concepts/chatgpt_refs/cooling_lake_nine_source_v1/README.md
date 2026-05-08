# Cooling Lake Nine Source V1

Date: 2026-05-07

Purpose: production-art source pass for Cooling Lake Nine after the graybox/runtime/proof milestone. This folder contains original ChatGPT Images source sheets for the Hazard Ecology terrain language, server-buoy objective props, rack wrecks, Prompt Leech enemy, Motherboard Eel boss presentation, and coolant/electric/vent/buoy/Eel VFX.

## Source Files

- `cooling_terrain_source_v1.png`: 4x2 source board for flooded server floor, coolant lanes, rack grates, cable trench, dry islands, maintenance walkway, electrified shore, and Eel basin material.
- `cooling_props_objectives_source_v1.png`: 4x2 source board for server buoys, collapsed rack wrecks, safe platform, and Eel emergence marker.
- `cooling_prompt_leech_eel_source_v1.png`: source board for Prompt Leech poses and Motherboard Eel boss frames.
- `cooling_hazard_vfx_source_v1.png`: 4x3 source board for coolant, electric, vent, buoy, Prompt Leech, and Eel VFX beats.

## Runtime Pack

Packed by `scripts/assets/pack-cooling-lake-nine-source-v1.py`.

Runtime outputs:

- `assets/tiles/cooling_lake_nine/authored_ground.png`
- `assets/tiles/cooling_lake_nine/cooling_terrain_chunks_v1.png`
- `assets/props/cooling_lake_nine/cooling_props_objectives_v1.png`
- `assets/sprites/enemies/prompt_leeches_sheet.png`
- `assets/sprites/bosses/motherboard_eel.png`
- `assets/sprites/effects/cooling_hazard_vfx_v1.png`

The packer mechanically removes the flat green source background, crops source cells, pads, resizes, packs transparent atlases, and composes a source-derived authored ground sheet. It does not draw expressive terrain, props, actors, bosses, VFX, decals, or material detail in code.

## PixelLab Refinement

This V1 ChatGPT Images source folder remains the base Cooling source set. After user sign-in, authenticated PixelLab refinement outputs were added under `assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/`.

The current runtime pack now uses PixelLab source art for Cooling server buoy pads, rack wrecks, the safe platform, and Prompt Leech frames. It still uses the ChatGPT Images source set for authored ground, terrain chunks, Motherboard Eel, hazard VFX, and the Eel marker prop where the PixelLab bridge source was clipped.
