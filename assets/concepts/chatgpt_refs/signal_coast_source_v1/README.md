# Signal Coast Source V1

Date: 2026-05-07

Purpose: production-art source pass for Signal Coast / Kettle Coast after the route-edge graybox and code/balance lock. This folder contains original ChatGPT Images source sheets for the shoreline/causeway terrain language, relay objective props, Static Skimmer enemy family, The Lighthouse That Answers boss/event, and Signal Coast hazard/objective VFX.

## Source Files

- `signal_terrain_source_v1.png`: source board for broken server-coast causeway, relay pad, safe dry spit/island, and lighthouse shelf terrain chunks.
- `signal_props_objectives_source_v1.png`: 4x2 source board for relay beacon pad, cable pylon, antenna wreck, server-rack debris, offshore signal buoy, relay console, calibration tower, and causeway barricade.
- `signal_skimmer_lighthouse_source_v1.png`: source board for Static Skimmer frames and The Lighthouse That Answers boss/event frames.
- `signal_hazard_vfx_source_v1.png`: 4x3 source board for clear signal windows, relay calibration, corrupted tide, static/cable pressure, skimmer jam, extraction, shard, and boss pulse VFX.

## Runtime Pack

Packed by `scripts/assets/pack-signal-coast-source-v1.py`.

Runtime outputs:

- `assets/tiles/signal_coast/authored_ground.png`
- `assets/tiles/signal_coast/signal_terrain_chunks_v1.png`
- `assets/props/signal_coast/signal_props_objectives_v1.png`
- `assets/sprites/enemies/static_skimmers_sheet.png`
- `assets/sprites/bosses/lighthouse_that_answers.png`
- `assets/sprites/effects/signal_hazard_vfx_v1.png`

The packer mechanically removes the flat green source background, crops source cells, pads, resizes, packs transparent atlases, and composes a source-derived authored ground sheet. It does not draw expressive terrain, props, actors, bosses, VFX, decals, or material detail in code.

## PixelLab / Aseprite Notes

Authenticated PixelLab was used for a Signal Coast terrain refinement attempt and preserved under `assets/concepts/pixellab_refs/signal_coast_refinement_v1/`. The browser export UI did not expose clean downloaded runtime files during this pass, so the runtime pack uses the higher-fidelity clean ChatGPT Images source boards while preserving PixelLab as source/proof reference.

Future Aseprite or Pixelorama cleanup should prioritize:

- isolating cleaner flat terrain decals from the PixelLab batch if export becomes available;
- removing the small extra wake/source fragments from the Static Skimmer strip if they read noisy in live play;
- adding side-safe Lighthouse frames with even more padding if future motion expands beyond the current centered event presentation.
