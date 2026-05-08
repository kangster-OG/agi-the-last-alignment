# Guardrail Forge Source V1

Date: 2026-05-08

Purpose: production-art source pass for Guardrail Forge after the Defense / Holdout gameplay proof and post-Memory difficulty audit. This folder contains original ChatGPT Images source sheets for forge terrain direction, relay/objective props, Doctrine Auditor actors, and guardrail/overload VFX.

## Source Files

- `guardrail_forge_terrain_chunks_source_v1.png`: source board for forge floor, alloy plates, constitutional clamp material, Silkgrid loom material, overload lanes, audit press floor, and quench gate material.
- `guardrail_forge_props_objectives_source_v1.png`: source board for alloy temper relays, constitutional clamps, Silkgrid looms, overload sluices, audit press props, relay jammers, doctrine pylons, and extraction/reward props.
- `guardrail_forge_actors_source_v1.png`: source board for Doctrine Auditor pressure forms, faction relay drones, and the Doctrine Auditor boss/event frames.
- `guardrail_forge_vfx_source_v1.png`: source board for safe hold rings, calibration sparks, overload lanes, doctrine jam pulses, audit press locks, relay-complete flares, quench beams, shard reward bursts, warning sweeps, and boss pressure bursts.

## Runtime Pack

Packed by `scripts/assets/pack-guardrail-forge-source-v1.py`.

Runtime outputs:

- `assets/tiles/guardrail_forge/authored_ground.png`
- `assets/tiles/guardrail_forge/guardrail_forge_terrain_chunks_v1.png`
- `assets/props/guardrail_forge/guardrail_forge_props_objectives_v1.png`
- `assets/sprites/enemies/doctrine_auditors_sheet.png`
- `assets/sprites/bosses/doctrine_auditor.png`
- `assets/sprites/effects/guardrail_forge_hazard_vfx_v1.png`

The packer mechanically removes flat or border source backgrounds where needed, crops source cells, trims alpha, pads, resizes, packs transparent atlases, and composes a source-derived authored ground sheet. It does not draw expressive terrain, props, actors, bosses, VFX, decals, or material detail in code.

## PixelLab Refinement

Guardrail Forge also has mandatory PixelLab source in `assets/concepts/pixellab_refs/guardrail_forge_refinement_v1/`. The active runtime pack uses PixelLab frames for authored-ground hold plate/forge floor decals, relay/objective props, Doctrine Auditor drone frames, and hazard/objective VFX contribution. The ChatGPT Images terrain board is preserved as art direction but its raised side faces are rejected for runtime terrain, so the accepted runtime terrain uses flatter PixelLab decals to avoid repeated cube/platform artifacts in the close tactical camera.
