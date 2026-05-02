# Visual Fidelity Vertical Slice

## Goal

Bring one playable area to a finished-looking AGI identity before spreading polish across the whole game.

The reference clips are not style targets to copy. They are fidelity targets: dense authored terrain, readable silhouettes, grounded props, varied biome materials, clear camera composition, and presentation moments that feel intentional rather than proof-only.

## Locked Fidelity Target

Armistice is considered production-ready for this slice only when a normal-play screenshot satisfies all of these at once:

- it keeps the AGI identity: ruined treaty square, frontier-lab emergency geometry, co-mind residue, and AGI breach corruption;
- Tech Bros is used only as a benchmark for density, material richness, prop scale, and sprite readability, not as a style sheet to copy;
- the terrain no longer reads as a flat gray prototype grid;
- three to five recognizable set pieces are visible in the first playable camera;
- HUD chrome is small enough that the arena, not proof telemetry, owns the frame;
- player and enemy silhouettes are readable instantly at screenshot scale.

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

## Terrain And HUD Pass

The third pass reduces tile-by-tile repetition in normal play:

- `src/level/LevelRunState.ts` now paints broad terrain zones first, then uses the Armistice ground atlas as sparse accent material instead of a full-screen grid carpet.
- The Armistice tile builder keeps the same runtime atlas contract while lowering edge contrast so repeated pavers stop dominating the camera.
- `src/network/OnlineCoopState.ts` now applies the same broad-surface idea to M50 production arenas, including online Armistice and the finale, so online proofs no longer show full-screen repeated local atlases.
- Normal play shows a compact `CELL 1/4` co-op strip. Proof/dev telemetry remains available with `?debugHud=1` or `?proofHud=1`, preserving deterministic screenshot and state inspection workflows.

Proof artifacts:

- `docs/proof/visual-fidelity-slice/reference-asset-terrain-ui-arena.png`
- `docs/proof/visual-fidelity-slice/armistice-terrain-ui-pass-action.png`
- `docs/proof/visual-fidelity-slice/armistice-terrain-ui-pass-action.json`
- `docs/proof/visual-fidelity-slice/terrain-ui-console-errors.json`
- `docs/proof/visual-fidelity-slice/terrain-ui-metrics.txt`
- `docs/proof/visual-fidelity-slice/online-m50-terrain-before-after.png`

## Production Set-Piece Polish Pass

The fourth pass replaces the most symbolic Armistice presentation surfaces with larger production pieces and proves the first-screen flow:

- `assets/tiles/armistice_plaza/transition_atlas.png` adds road, rubble, cable, breach, and plaza-wear transition masks so terrain joins read as authored edges instead of isolated accent tiles.
- `assets/props/armistice_plaza/*.png` now use larger transparent set-piece compositions for the treaty monument, barricade corridor, drone wreck, terminal bank, and cosmic breach matter.
- `src/level/LevelRunState.ts` composes large set pieces for dense prop clusters, hides landmark/debug labels in normal play, and keeps compact HUD presentation unless debug/proof HUD is requested.
- `assets/ui/armistice_title_backdrop.png` gives the title screen a scene-backed Armistice plaza composition.
- `src/ui/buildSelect.ts` gives the fighter/co-mind selection screen larger sprite cards, primary co-mind art, official/parody logo plates, and a quieter footer.
- `src/assets/milestone11Art.ts` and runtime scaling make player/enemy sprites larger, higher contrast, and frame-cycled in play.
- `scripts/assets/build-armistice-visual-slice-assets.py` is now idempotent for sprite readability: it rebuilds from stable source sheets under `assets/concepts/visual_fidelity_sources/` instead of compounding contrast if rerun.

Proof artifacts:

- `docs/proof/visual-fidelity-slice/reference-vs-armistice-production-polish-board.png`
- `docs/proof/visual-fidelity-slice/armistice-production-polish-title.png`
- `docs/proof/visual-fidelity-slice/armistice-production-polish-build-select.png`
- `docs/proof/visual-fidelity-slice/armistice-production-polish-action.png`
- `docs/proof/visual-fidelity-slice/armistice-production-polish-metrics.json`
- `docs/proof/visual-fidelity-slice/armistice-production-polish-console-errors.json`

## Tech Bros Comparison Pass

The fifth pass is a direct screenshot comparison response rather than a milestone checklist item. The comparison still shows a material fidelity gap: Tech Bros has stronger hand-textured terrain, warmer local color, more recognizable large props, and more production-complete character/object rendering. This pass moves Armistice in that direction without copying its style:

- normal HUD chrome and AGI pressure UI were reduced again;
- long road/cable strokes were softened so they stop reading like debug construction lines;
- large Armistice set pieces were repositioned into the starting camera instead of living mostly offscreen;
- static ground received more deterministic grit/noise and small material marks;
- the comparison board records Tech Bros references, the previous Armistice shot, and the updated r5 shot.

Proof artifacts:

- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-r5-comparison.png`
- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-r5-comparison.json`
- `docs/proof/visual-fidelity-slice/armistice-production-polish-action-r5.png`
- `docs/proof/visual-fidelity-slice/armistice-production-polish-action-r5.json`

## Armistice Production Rebuild

The sixth pass changes the method from sparse polish to asset-first rebuild:

- the Armistice ground atlas expands from 8 frames to 32 frames, covering cracked civic concrete, treaty plaza stone, asphalt/road, rubble fields, terminal flooring, cable trenches, scorch, dust/grit, and AGI corruption variants;
- dense terrain rendering now uses the 32-frame family across the full arena, with softer repeated markings so the material is rich without reverting to an obvious prototype grid;
- large set pieces are rebuilt from PixelLab raw batches plus deterministic hand-authored cleanup into vehicle/building-scale props: crashed drone carrier, treaty ruins, barricade wall cluster, terminal server bank, and AGI breach sculpture;
- the starter camera is recomposed so those set pieces appear in the first playable view;
- the normal HUD remains compact and player/enemy runtime scale is increased for screenshot readability;
- the visual gate compares Tech Bros benchmark shots, the previous Armistice r5 shot, the new rebuild shot, and the rebuilt asset contact sheet.

Proof artifacts:

- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-production-rebuild-gate.png`
- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-production-rebuild-gate.json`
- `docs/proof/visual-fidelity-slice/armistice-production-rebuild-r2-action.png`
- `docs/proof/visual-fidelity-slice/armistice-production-rebuild-r2-action.json`
- `docs/proof/visual-fidelity-slice/armistice-production-rebuild-asset-contact.png`

## Corrective Sprite, Prop, And Collision Pass

The seventh pass responds to playtest feedback that the previous slice still read as prototype art because sprites and props were too blocky and props had no physical presence:

- player runtime atlases now use 80x80 frames instead of 48x48 frames, with clearer class silhouettes, larger bodies, stronger outlines, readable visors, weapon arms, and ground-contact alignment;
- the Milestone 11 enemy families now use 64x64 frame strips instead of 32x32 strips, including a larger Bad Outputs sheet, so enemy families read as distinct silhouettes at gameplay scale;
- Armistice set pieces were redrawn from PixelLab-backed source material plus local cleanup into larger illustrated objects: the drone wreck has hull/rotor mass, the barricade is angled and braced, the terminal bank has stacked cabinets and cables, and the breach is irregular instead of a line of blocks;
- the south rubble box-grid path is replaced with an irregular debris/cable field during production-art play;
- starter set pieces now have static obstacle bodies, and the milestone proof includes a terminal collision check so the player stops/slides at the physical edge instead of passing through the prop;
- `render_game_to_text()` exposes the Armistice static obstacle count/ids for deterministic proof without exporting or importing gameplay state.

Proof artifacts:

- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-corrective-gate.png`
- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-corrective-gate.json`
- `docs/proof/visual-fidelity-slice/armistice-corrective-sprite-prop-collision-action.png`
- `docs/proof/visual-fidelity-slice/armistice-corrective-sprite-prop-collision-action.json`
- `docs/proof/visual-fidelity-slice/armistice-corrective-collision-terminal-check.png`
- `docs/proof/visual-fidelity-slice/armistice-corrective-collision-terminal-check.json`
- `docs/proof/milestone11-art/milestone11-art-collision-terminal.png`

## Next Art Passes

1. Add a boss/dialogue presentation upgrade with larger portraits and a scene-backed frame.
2. Add true attack/hurt/dash frames and secondary animation passes for the 80px class roster.
3. Carry the 32-frame material-family approach into Blackwater and finale arenas.
4. Replace the remaining simple flag poles and pickup icons with production pixel props/effects.
