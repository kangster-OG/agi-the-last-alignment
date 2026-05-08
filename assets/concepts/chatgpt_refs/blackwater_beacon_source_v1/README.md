# Blackwater Beacon Source V1

Date: 2026-05-07

Purpose: production-art source pass for Blackwater Beacon after the Puzzle-Pressure / Boss-Hunt gameplay proof and fourth-level difficulty audit. This folder contains original ChatGPT Images source sheets for the Blackwater Array ocean-platform terrain language, antenna/Signal Tower objective props, Tidecall Static enemy family, Maw Below Weather boss/event, and Blackwater tidal/static hazard VFX.

## Source Files

- `blackwater_terrain_source_v1.png`: source board for dark ocean-platform server decks, flooded crossings, safe maintenance platforms, Maw shelf, and Blackwater Array terrain material.
- `blackwater_props_objectives_source_v1.png`: source board for downward antenna arrays, Signal Tower warning markers, maintenance beacons, debris, extraction/key props, and Blackwater objective props.
- `blackwater_tidecall_maw_source_v1.png`: source board for Tidecall Static poses and Maw Below Weather boss/event frames.
- `blackwater_hazard_vfx_source_v1.png`: source board for tidal waves, Tidecall Static pressure, Signal Tower warnings, antenna beams, retune/complete beats, Maw surge, Blackwater Signal Key pickup, and extraction flare VFX.

## Runtime Pack

Packed by `scripts/assets/pack-blackwater-beacon-source-v1.py`.

Runtime outputs:

- `assets/tiles/blackwater_beacon/authored_ground.png`
- `assets/tiles/blackwater_beacon/blackwater_terrain_chunks_v1.png`
- `assets/props/blackwater_beacon/blackwater_props_objectives_v1.png`
- `assets/sprites/enemies/tidecall_static_sheet.png`
- `assets/sprites/bosses/maw_below_weather.png`
- `assets/sprites/effects/blackwater_hazard_vfx_v1.png`

The packer mechanically removes flat source backgrounds where needed, crops source cells, trims alpha, pads, resizes, packs transparent atlases, and composes a source-derived authored ground sheet. It does not draw expressive terrain, props, actors, bosses, VFX, decals, or material detail in code.

## PixelLab Refinement

Blackwater Beacon also has mandatory PixelLab source in `assets/concepts/pixellab_refs/blackwater_beacon_refinement_v1/`. The active runtime pack uses PixelLab frames for authored-ground deck accents, prop/key material, and hazard/objective VFX contribution. ChatGPT Images supplies the main terrain, prop, Tidecall Static, Maw Below Weather, and hazard source boards.
