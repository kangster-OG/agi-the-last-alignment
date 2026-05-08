# Memory Cache Source V1

Date: 2026-05-08

Purpose: production-art source pass for Memory Cache after the Expedition / Recovery gameplay proof and post-Blackwater difficulty audit. This folder contains original ChatGPT Images source sheets for authored archive-cache terrain, evidence/memory objective props, Context Rot and Memory Curator actors, and corruption/recovery VFX.

## Source Files

- `memory_cache_terrain_chunks_source_v1.png`: source board for archive floor, civic ledger room, witness shard room, recall pocket, corrupted archive lane, redacted shortcut, Curator vault, and extraction index terrain material.
- `memory_cache_props_objectives_source_v1.png`: source board for evidence terminals, ledger stacks, memory shards, recall pads, redaction barriers, vault obelisks, extraction/reward props, shelves, crates, crystals, and route-memory objects.
- `memory_cache_actors_source_v1.png`: source board for Context Rot pressure forms, Memory Anchors, redaction forms, and the Memory Curator boss/event frames.
- `memory_cache_vfx_source_v1.png`: source board for shard glints, recovery bursts, recall rings, corruption static, redaction pulses, shortcut sparks, Context Rot trails, Curator locks, record flares, extraction beams, warning cracks, and route reward pulses.

## Runtime Pack

Packed by `scripts/assets/pack-memory-cache-source-v1.py`.

Runtime outputs:

- `assets/tiles/memory_cache/authored_ground.png`
- `assets/tiles/memory_cache/memory_cache_terrain_chunks_v1.png`
- `assets/props/memory_cache/memory_cache_props_objectives_v1.png`
- `assets/sprites/enemies/memory_cache_context_rot_sheet.png`
- `assets/sprites/enemies/memory_anchors_sheet.png`
- `assets/sprites/bosses/memory_curator.png`
- `assets/sprites/effects/memory_cache_hazard_vfx_v1.png`

The packer mechanically removes flat or border source backgrounds where needed, crops source cells, trims alpha, pads, resizes, packs transparent atlases, and composes a source-derived authored ground sheet. It does not draw expressive terrain, props, actors, bosses, VFX, decals, or material detail in code.

## PixelLab Refinement

Memory Cache also has mandatory PixelLab source in `assets/concepts/pixellab_refs/memory_cache_refinement_v1/`. The active runtime pack uses PixelLab frames for authored-ground archive/shortcut/recall/corruption decals, evidence and memory props, Context Rot frames, Memory Anchor and redaction frames, Memory Curator contribution, and recovery/corruption/extraction VFX. ChatGPT Images supplies the main high-resolution terrain, prop, actor, boss, and VFX source boards.
