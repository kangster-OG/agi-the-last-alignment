# Milestone 14: Combat Art Parity and Runtime Polish

## Goal

Make the default production-art path feel more complete during moment-to-moment combat without expanding the game design surface.

## Implemented Scope

- Added a compact original combat-effect atlas:
  - refusal projectile
  - projectile trail
  - three impact-burst frames
  - three pickup-sparkle frames
  - refusal aura marker
  - damage badge
- Added original emergency patch card-frame UI art for:
  - general patches
  - faction patches
  - class patches
  - evolution patches
- Added `src/assets/milestone14Art.ts`, layered on the Milestone 12 default production-art set.
- Added `?assetPreview=milestone14_combat_art`.
- Integrated combat art into the default runtime:
  - projectiles and trails use production sprites;
  - projectile hits spawn pooled impact and damage-badge effects;
  - pickup collection spawns sparkle effects;
  - Refusal Halo-style aura upgrades gain an in-world production marker;
  - emergency patch draft cards use production frame art;
  - HUD gains a small production combat-art accent.
- Added online combat-state visibility hooks:
  - Colyseus snapshots expose a combat-art pressure/phase payload;
  - online HUD shows the shared combat phase/pressure strip;
  - online snapshots keep production player facing/velocity from Milestone 13.
- Reduced overworld runtime allocation churn by caching the static background, ground, route, and prop layers until route/art availability changes.

## Runtime Defaults

Milestone 14 art is part of the default production-art path. The legacy opt-out remains:

- `?productionArt=0`
- `?placeholderArt=1`

## Proof Expectations

Milestone 14 should pass:

- `npm run proof:assets`
- `npm run build`
- `npm run proof:milestone14-combat-art`
- default smoke/movement/overworld/horde/upgrade/boss/co-op/network/full proofs
- existing Milestone 10-13 art proofs

## Remaining Risks

- Online combat still exposes visibility hooks rather than full authoritative projectile/pickup/boss simulation parity.
- The generic headless WebGL harness can still capture a black screenshot even when text state and project proof screenshots are valid.
- The combat-effect atlas is intentionally compact; later art passes should add directional projectile frames and richer boss-specific effects.
