# Milestone 13: Default Rollout and Art Polish

## Goal

Make the Milestone 12 production-art candidate the normal browser-playable path while preserving an explicit legacy placeholder opt-out for debugging and regression proofing.

## Runtime Defaults

- Production art is enabled by default.
- Armistice Plaza production tiles are enabled by default.
- `?productionArt=0` or `?placeholderArt=1` restores the legacy placeholder sprite path.
- `?armisticeTiles=0` or `?placeholderTiles=1` restores the legacy code-drawn ground path.
- `?assetPreview=milestone12_default_candidate` remains the dev preview for the current production-art set.

## Implemented Scope

- Defaulted the production-art runtime path to `milestone13_default_rollout`.
- Defaulted the Armistice Plaza tile atlas.
- Preserved opt-outs for placeholder-safe rendering.
- Added synced online `velocityX`, `velocityY`, and `facing` fields to the Colyseus snapshot.
- Updated the online production player renderer to use synced facing instead of a local movement guess.
- Added production-art overworld avatar rendering.
- Reduced overworld label clutter in the production layout by showing full labels for selected, completed, and nearby available nodes while keeping compact type markers for distant nodes.
- Updated preview/docs/manifest/provenance text so production assets are no longer described as gated.
- Added `npm run proof:milestone13-default`.

## Proof Expectations

Milestone 13 should pass:

- `npm run proof:assets`
- `npm run build`
- `npm run proof:milestone13-default`
- Existing default/regression proofs, now running with production art and Armistice tiles enabled by default.
- Existing explicit production-art proofs.
- Online co-op proof with default production art, including synced facing/velocity fields.

## Default Decision

Production art is now the default runtime path. The placeholder-safe path remains available as an explicit opt-out, not the normal player experience.

## Remaining Risks

- The current production art is broad enough for default readiness, but still not final art direction quality.
- Online combat remains a prototype and still does not sync every solo combat effect.
- The generic headless WebGL web-game harness may still capture a black screenshot even when text state and project proof screenshots are valid.
