# Milestone 11 - Production Art Expansion and Default Readiness

Goal: expand the proven Milestone 10 art path into a broader production-art coverage pass, then decide what can safely become default without destabilizing gameplay, proofs, licensing, or future online co-op.

Milestone 10 proved that production art can load through Pixi, render in a dev preview, and appear in gameplay behind `?productionArt=1`. Milestone 11 should grow coverage and readiness, not replace everything at once.

## Current Baseline

- Default gameplay remains code-placeholder safe.
- `?productionArt=1` enables the first playable production-art set:
  - Accord Striker directional walk sheet.
  - Bad Outputs enemy sheet.
  - Coherence Shard pickup.
  - Treaty Monument prop.
  - Oath-Eater boss sprite.
  - Oath-Eater title-card portrait.
- `?armisticeTiles=1` enables the Armistice Plaza ground atlas.
- `?assetPreview=milestone10_runtime_set` previews the Milestone 10 runtime set.
- `npm run proof:milestone10-art` verifies preview, arena, horde, and boss rendering with the flags on.

## Milestone 11 Scope

Prioritize a compact but meaningful expansion:

1. Player animation/readability
   - Improve or replace the Accord Striker sheet with clearer idle/run frames.
   - Add hit/dash/readability accents only if they preserve combat clarity.
   - Keep 1-4 local player distinction readable in co-op.

2. Enemy family coverage
   - Add production art for Benchmark Gremlins.
   - Add production art for Context Rot Crabs.
   - Keep silhouettes distinct from Bad Outputs at horde scale.

3. Map and landmark props
   - Add a small prop set for Barricade Corridor, Crashed Drone Yard, Emergency Alignment Terminal, and Cosmic Breach Crack.
   - Static props must remain cached, not rebuilt every frame.

4. UI and faction identity
   - Add original faction/co-mind placeholder marks or UI art where useful.
   - Official lab logos remain third-party/parody assets and must stay under `assets/third_party/logos/` with non-MIT ownership notes.
   - Do not claim official logos are original project art.

5. Default-readiness decision
   - Keep new art gated until screenshots prove readability in arena, horde, boss, local co-op, online co-op, and full-run completion.
   - Only make a production-art path default if the proof evidence is stronger than the placeholder path.

## Required Implementation Pattern

- Add or update manifest entries in `assets/asset_manifest.json`.
- Add provenance rows in `ART_PROVENANCE.md`.
- Add typed Pixi loaders/helpers under `src/assets/`.
- Add or extend dev preview coverage before gameplay use.
- Keep gameplay integration behind flags until proofed.
- Reuse sprite containers/pools for dynamic entities.
- Keep static map art in cached static render paths.
- Preserve:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
  - render performance hotfix behavior
  - existing proof scripts
  - Colyseus online prototype behavior

## Suggested Runtime Flags

- Continue using `?productionArt=1` for the broader production-art runtime path.
- Add scoped preview IDs as needed, such as:
  - `?assetPreview=milestone11_enemy_set`
  - `?assetPreview=milestone11_prop_set`
  - `?assetPreview=milestone11_ui_set`
- Avoid enabling official/third-party logo rendering by default until provenance and policy handling are complete.

## Proof Expectations

Minimum verification after Milestone 11:

- `npm run proof:assets`
- `npm run build`
- `npm run proof:asset-preview`
- `npm run proof:milestone10-art`
- any new Milestone 11 proof command
- `npm run proof:smoke`
- `npm run proof:movement`
- `npm run proof:horde`
- `npm run proof:boss`
- `npm run proof:coop`
- `npm run proof:network`
- `npm run proof:full`

Inspect screenshots in `docs/proof/`, especially:

- horde density
- boss title card and boss combat
- local co-op player distinction
- online co-op sync views
- flagged production-art previews
- prior performance proof screenshots if render paths change

## Exit Criteria

- Asset manifest validates with no warnings.
- All new non-placeholder assets have provenance rows.
- New art renders in dev preview and flagged runtime screenshots.
- Default gameplay still passes existing proofs.
- Network/co-op proofs still pass.
- A clear recommendation exists for whether any production art should become default now or remain gated for another pass.

