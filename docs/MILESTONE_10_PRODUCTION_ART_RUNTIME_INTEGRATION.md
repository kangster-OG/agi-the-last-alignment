# Milestone 10 — Production Art Runtime Integration

Goal: prove production pixel assets can enter gameplay without destabilizing rendering, proofs, or online co-op.

Milestone 9 created the durable intake pipeline. Milestone 10 is the first controlled runtime integration milestone: a small playable asset set, gated behind flags, with proof screenshots before any default gameplay replacement.

## Scope

Build the first runtime-ready asset set:

- Accord Striker player directional sheet.
- Bad Outputs enemy family sheet.
- Coherence Shard pickup.
- Treaty Monument landmark prop.
- Oath-Eater boss sprite and title-card portrait.
- Keep the existing Armistice Plaza ground atlas gated through `?armisticeTiles=1`.

## Runtime Flags

- `?productionArt=1`: enables the Milestone 10 runtime art set.
- `?armisticeTiles=1`: enables the Armistice Plaza production ground atlas.
- `?assetPreview=milestone10_runtime_set`: previews the Milestone 10 art set through Pixi without entering gameplay.

Default gameplay remains code-placeholder safe unless flags are explicitly present.

## Required Work

- Add assets under the existing `assets/` folders.
- Add manifest entries with stable IDs, dimensions, frame metadata, provenance keys, and license notes.
- Update `ART_PROVENANCE.md`.
- Add typed Pixi loaders/helpers under `src/assets/`.
- Extend the dev asset preview screen.
- Add gated runtime rendering for player, Bad Outputs enemies, Coherence Shards, Treaty Monument, Oath-Eater sprite, and Oath-Eater portrait.
- Preserve the render performance hotfix: static props are cached, dynamic entity sprites are reused, and default graphics rendering remains available.
- Add proof tooling and screenshots for preview, arena, horde, and boss readability.

## Exit Criteria

- `npm run proof:assets` validates the new assets.
- `npm run proof:milestone10-art` captures preview + gated runtime screenshots.
- Default proofs still pass with placeholders.
- `window.render_game_to_text()` exposes whether Milestone 10 runtime art is enabled.
- The first playable production-art set is proven in-canvas, but default gameplay remains conservative until the user approves making it default.
