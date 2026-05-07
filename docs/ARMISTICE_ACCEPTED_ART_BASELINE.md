# Armistice Accepted Art Baseline

Date: 2026-05-05

Purpose: preserve the hard-won visual decisions from the Armistice vertical-slice rebuild so fresh Codex threads do not reopen solved work, repeat rejected shortcuts, or misunderstand the current fidelity target.

This document is a current-state baseline, not a permanent freeze. Reopen an accepted area only when the user explicitly asks for it or fresh live proof shows a real regression.

## Read This Before Future Art Work

Before meaningful art, gameplay, or runtime visual changes, read:

- `AGENTS.md`
- `progress.md` tail
- `docs/ART_REBUILD_HANDOFF.md`
- this document
- `docs/VISUAL_FIDELITY_VERTICAL_SLICE.md`
- `docs/AGI_VISUAL_ART_BIBLE.md`
- `docs/ASSET_PIPELINE.md`
- `ART_PROVENANCE.md`
- `assets/concepts/chatgpt_refs/armistice_source_rebuild_v2/README.md`

Then inspect the current game visually. Do not rely on previous-thread memory.

## Accepted Current Armistice State

### Terrain

The Armistice terrain is accepted by the user as of May 5 after the V6/V7 multi-piece source rebuild and outer-silhouette pass.

What finally worked:

- The base terrain was raised to the prop-grounding fidelity bar instead of lowering the prop pads.
- The visible floor is no longer driven by the old low-fidelity V2/V4 broad authored sheets.
- `assets/tiles/armistice_plaza/authored_ground.png` now starts from a flat safety color and fills the camera-relevant playable floor with dense overlapping V7 prop-pad-extension terrain plus V6 interconnect plates and transition strips.
- The map edge uses a mechanical irregular alpha mask so the visible playfield does not read as a clean square.
- Boss corruption now reads as irregular material spread through the same civic/asphalt/rubble/breach language rather than a square purple rug.

Treat the current terrain as the baseline for future levels. New maps should use several interconnected, high-fidelity source chunks at gameplay camera scale. Do not generate one giant terrain image as the main solution, and do not patch weak source art with code-authored noise.

### Prop Grounding, Scale, And Collision

The prop pads remain the calibration reference for terrain fidelity, but the whole ground is now close enough that they read more like contact dirt, shadow, and debris accents.

Accepted prop/runtime decisions:

- Drone wreck, barricade, terminal, treaty monument, and breach props should remain visually prominent above the terrain.
- Translucent mini/satellite copies were removed because they made props look inconsistent, ghosted, and partially swallowed by terrain.
- Production prop sprites use full alpha and standardized family scale.
- Static blockers were added for the actual production cluster centers, including drone wrecks, barricade corridors, terminal array, and breach shards.

Do not add terrain overlays that cover or partially cover props. Props should pop against the ground and collide consistently where their physical mass implies collision.

### Accord Striker

The accepted A/D side-walk fix is:

- Source: `assets/concepts/chatgpt_refs/armistice_rebuild_v1/accord_striker_side_walk_east_v8.png`
- Runtime: `assets/sprites/players/accord_striker_walk_v2.png`
- West row is mechanically mirrored from the accepted east row.
- Runtime movement/facing logic was not changed.

Preserve this unless fresh held-key live proof at gameplay zoom shows regression. W/S are accepted for now only because the user chose not to reopen them; they are not a final animation-quality bar.

Never fix player motion with leg-only patches, lower-body swaps, or contact-sheet-only validation. Use coherent full-frame/full-row source and verify live held-key movement at zoom.

### Oath-Eater Boss

The accepted boss direction after the rebuild:

- Source: `assets/concepts/chatgpt_refs/armistice_source_rebuild_v2/oath_eater_boss_rebuild_source_v4.png`
- Runtime: `assets/sprites/bosses/oath_eater.png`, four 224x224 padded frames in an 896x224 sheet.
- Runtime currently uses centered/front-contained V4 source cells because the side-lurch cells technically had padding but still read like a boxed/cropped silhouette in live chase.
- Boss scale was increased and should feel materially larger than normal enemies.
- Boss contact/corruption uses irregular source-backed decals, not a square purple platform.
- Treaty Charge movement is interpolated along its telegraph rather than snapping.

If boss motion is reopened, generate a new dedicated full-frame boss motion source with generous side/bottom padding and prove it while the boss chases the player. Do not reuse side-lurch frames that read trapped in a square.

### Enemy Families

Current accepted enemy-art state:

- Bad Outputs: purple shard family, unchanged by the Benchmark Gremlin readability correction.
- Context Rot Crabs: orange crab family, currently acceptable.
- Benchmark Gremlin: bright/readable monitor enemy with internal pixel detail/material breakup.

The Benchmark Gremlin failure language to remember: broad flat value blocking plus heavy outline reads like a simple icon next to the other enemy sprites. The accepted correction uses `assets/concepts/chatgpt_refs/armistice_source_rebuild_v2/enemy_benchmark_gremlin/benchmark_gremlin_detail_source_v1.png` so it keeps a bright monitor silhouette but adds panel chips, screen detail, darker underside clusters, cyan accents, and smaller material breakup.

For future enemies, target both readability and material detail. Do not rely on recolor alone when the underlying source lacks internal pixel fidelity.

### Visual Channels

Preserve current channel separation unless a future pass deliberately redesigns the whole combat language:

- XP and pickups: blue diamond/shard reads.
- Player shots: orange/magenta refusal shards.
- Enemy/boss pressure: violet, pink, red hazard language.
- Boss telegraphs: loud, material-edged corruption/charge/ring language.

Future channels should differ by silhouette, animation, luminance, and color. Color alone is not enough.

### Camera

Keep the close tactical gameplay camera. Do not zoom out to hide art problems.

Future visual proof should judge first-frame, combat, and boss shots at the real close camera:

- `docs/proof/visual-fidelity-camera/camera-player-start.png`
- `docs/proof/visual-fidelity-camera/camera-combat-vfx.png`
- `docs/proof/visual-fidelity-camera/camera-boss-vfx.png`

Good screenshots should show foreground, midground, background, props, terrain detail, actors, and readable effects without Accord isolated on an empty floor.

## What Not To Repeat

These were painful failure modes in the Armistice rebuild:

- Do not use one huge generated terrain sheet as the primary fix for base terrain fidelity.
- Do not leave old low-fidelity floor visible between high-fidelity source islands.
- Do not weaken prop grounding to make it match weak terrain. Raise the terrain to the prop pads instead.
- Do not use code/Pillow/Pixi/CSS/procedural marks as expressive production art.
- Do not use terrain chunks that contain object silhouettes, random props, square mats, rectangular platforms, huge dark holes, blur, or painterly texture.
- Do not accept a boss frame just because its alpha box has padding; inspect live chase motion for boxed/cropped reads.
- Do not solve enemy readability with only broad flat recolor if the sprite loses internal material detail.
- Do not trust contact sheets alone for actor motion. Use live held-key proof at gameplay zoom.
- Do not report success after one source/runtime pass if the core failure is still visible. Iterate before final.

## Future Art Pipeline

For new levels, bosses, enemies, props, or VFX:

1. Define the accepted Armistice asset as the fidelity reference.
2. Generate or create multiple source candidates with ChatGPT Images, PixelLab, Aseprite, Pixelorama, or another explicit art-source tool.
3. Reject weak candidates before runtime use.
4. Mechanically crop, key, pad, resize, pack, validate, and proof accepted source art only.
5. Inspect runtime screenshots at close camera before declaring success.
6. Update `assets/asset_manifest.json`, `ART_PROVENANCE.md`, source README/provenance notes, and `progress.md`.

Use Tech Bros only as a fidelity benchmark for cohesion, material richness, proportions, camera crop, responsive motion, visual channel separation, and finish. Do not copy its style or content.

## Required Checks For Art/Runtime Changes

Run the relevant subset, and be explicit if something cannot run:

- `npm run proof:assets`
- `npm run proof:visual-fidelity-camera`
- `npm run proof:movement`
- `npm run proof:smoke`
- `npm run proof:boss`
- `npm run proof:armistice-framing`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `./node_modules/.bin/vite build`

For player/boss/enemy packer changes, also run the relevant mechanical packer and syntax checks.

