# Transit Loop Zero Source V1

Date: 2026-05-07

Purpose: production-art source for the first Transit Loop Zero runtime art pass after the Route / Transit graybox. These images are source boards for mechanical cropping, alpha cleanup, resizing, and atlas packing only.

## Source Boards

- `transit_terrain_source_v1.png`: ChatGPT Images source board for rail platforms, aligned track lanes, false-track lanes, switchback route pieces, arrival-window floor plates, and station-mouth floor panels.
- `transit_props_objectives_source_v1.png`: ChatGPT Images source board for signal pylons, route-switch pylons, arrival emitters, false-schedule board, alignment beacons, barricades, route consoles, station scaffold marker, and cable junction props.
- `station_that_arrives_source_v1.png`: ChatGPT Images source board for Station That Arrives boss/event frames: dormant gate, arrival mouth, train-front emergence, damaged phase, relocation marker, and collapsed scaffold.
- `transit_hazard_vfx_source_v1.png`: ChatGPT Images source board for aligned-track pulse, false-track warning, arrival-window ring, platform alignment burst, route-switch reward flash, Station arrival shock, relocation shimmer, and false-schedule wave marker.

## Runtime Use

Packed by `scripts/assets/pack-transit-loop-zero-source-v1.py` into:

- `assets/tiles/transit_loop_zero/authored_ground.png`
- `assets/tiles/transit_loop_zero/transit_terrain_chunks_v1.png`
- `assets/props/transit_loop_zero/transit_props_objectives_v1.png`
- `assets/sprites/bosses/station_that_arrives.png`
- `assets/sprites/effects/transit_hazard_vfx_v1.png`

## Notes

Source was generated with ChatGPT Images. No expressive Transit terrain, prop, boss, or VFX art in this folder was created with Python, Pillow, Pixi Graphics, SVG, CSS, filters, recolors, overlays, or procedural drawing. Code may only mechanically crop, key, pad, resize, pack, validate, and proof these source images.
