# Visual Fidelity Vertical Slice

## Goal

Bring one playable area to a finished-looking AGI identity before spreading polish across the whole game.

The reference clips are not style targets to copy. They are fidelity targets: dense authored terrain, readable silhouettes, grounded props, varied biome materials, clear camera composition, and presentation moments that feel intentional rather than proof-only.

## First Target

Armistice Plaza is the first vertical slice because it is the starter arena, the proof baseline, and the first place where players decide whether the game looks real.

The slice should read as:

- a ruined treaty square where reality patch infrastructure was installed too late;
- frontier-lab geometry colliding with emergency civic architecture;
- AGI corruption crawling through cracks and cable routes;
- dense enough that every screenshot has foreground, midground, and background information;
- still readable under horde pressure.

## Runtime Rules

- Preserve solo, local co-op, and online co-op behavior.
- Preserve production-art defaults and placeholder opt-outs.
- Preserve `render_game_to_text()` and `advanceTime()`.
- Do not weaken route-profile-only persistence boundaries.
- Keep art changes screenshot-proofed with Playwright.

## Current Slice Pass

The first pass is code-native scene composition in `src/level/LevelRunState.ts`:

- authored plaza/corridor/terminal/breach district overlays;
- thinner road and cable paths across the plaza;
- deterministic paving cracks, scorch marks, terminal traces, breach veins, and small debris;
- cast-shadow mass under landmarks and prop clusters.

This is not the final art answer. It is the visual scaffold that lets later PixelLab tile/prop sets land into a composed scene instead of a debug grid.

## PixelLab-Backed Asset Pass

The second pass rebuilds the starter Armistice runtime atlas and set pieces from the committed PixelLab M50/M51 raw batches:

- `assets/tiles/armistice_plaza/ground_atlas.png`
- `assets/props/armistice_plaza/treaty_monument.png`
- `assets/props/armistice_plaza/barricade_corridor_set.png`
- `assets/props/armistice_plaza/crashed_drone_yard_wreck.png`
- `assets/props/armistice_plaza/emergency_alignment_terminal.png`
- `assets/props/armistice_plaza/cosmic_breach_crack.png`

The builder is `scripts/assets/build-armistice-visual-slice-assets.py`. It preserves existing runtime dimensions, import paths, and opt-out behavior while making the arena look less like a repeated proof grid.

## Next Art Passes

1. Add a normal-play UI mode that softens proof labels while keeping telemetry available in proof/dev modes.
2. Build a second terrain atlas with real biome-transition tiles, not only per-tile texture variation.
3. Generate larger isometric set pieces for treaty hall ruins and foreground silhouettes.
4. Add a boss/dialogue presentation upgrade with larger portraits and a scene-backed frame.
5. Port the same visual-composition helpers into the online arena renderer once the solo slice reads well.
