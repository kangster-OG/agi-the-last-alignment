# Glass Sunfield Source V1

Date: 2026-05-08

Purpose: production-art source pass for Glass Sunfield after the Solar-Prism / Shade Routing gameplay proof and post-Guardrail difficulty audit. This folder contains original ChatGPT Images source sheets for glassfield terrain, lens/prism objective props, Solar Reflection and Choirglass actors, Wrong Sunrise boss/event art, and prism/exposure VFX.

## Source Files

- `glass_sunfield_terrain_chunks_source_v1.png`: source board for cracked black glass server floors, shaded lens courtyards, exposed sunburn lanes, prism-window floors, civic glass material, and sunfield approach tiles.
- `glass_sunfield_props_objectives_source_v1.png`: source board for Western Shade Lens, Mistral prism vane, DeepMind mirror lens terminal, Glass Prism Gate, shade projectors, mirror debris, lens towers, reward shards, and extraction/reward props.
- `glass_sunfield_actors_source_v1.png`: source board for Solar Reflection pressure frames, Choirglass attackers, and Wrong Sunrise boss/event frames.
- `glass_sunfield_vfx_source_v1.png`: source board for shade pocket rings, exposed glass burn streaks, reflection jam pulses, wrong-sun beams, lens-complete flares, prism extraction beams, reward glints, and warning flashes.

## Runtime Pack

Packed by `scripts/assets/pack-glass-sunfield-source-v1.py`.

Runtime outputs:

- `assets/tiles/glass_sunfield/authored_ground.png`
- `assets/tiles/glass_sunfield/glass_sunfield_terrain_chunks_v1.png`
- `assets/props/glass_sunfield/glass_sunfield_props_objectives_v1.png`
- `assets/sprites/enemies/solar_reflections_sheet.png`
- `assets/sprites/enemies/choirglass_sheet.png`
- `assets/sprites/bosses/wrong_sunrise.png`
- `assets/sprites/effects/glass_sunfield_hazard_vfx_v1.png`

The packer mechanically removes flat or border source backgrounds where needed, crops source cells, trims alpha, pads, resizes, packs transparent atlases, and composes a source-derived authored ground sheet. It does not draw expressive terrain, props, actors, bosses, VFX, decals, or material detail in code.

## PixelLab Refinement

Glass Sunfield also has mandatory PixelLab source in `assets/concepts/pixellab_refs/glass_sunfield_refinement_v1/`. The active runtime pack uses PixelLab frames for authored-ground/prism-floor contribution, objective props, Solar Reflection and Choirglass frames, and hazard/objective VFX contribution. PixelLab frame 2 is preserved as raw source but rejected for runtime terrain because its raised side face read as a strip artifact in the close tactical camera.
