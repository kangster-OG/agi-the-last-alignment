# Milestone 9 — Asset Pipeline

Goal: prepare production art to enter the project without destabilizing gameplay, proofs, licensing, or future online co-op work.

Milestones 0-8 built a playable AGI vertical slice with large-map Armistice Plaza, Alignment Grid overworld, build identity, boss presentation, local co-op scaffolding, Colyseus online prototype, and a render performance hotfix. Milestone 9 should not replace all placeholder art yet. It should create the durable intake system for production assets.

## Core Requirement

Create an asset pipeline that lets the project move from code-generated placeholder Pixi shapes to production pixel art in small, reversible, provenance-tracked steps.

Do not block gameplay development on final art. Do not import random untracked files. Every non-placeholder asset needs a manifest entry and provenance record.

## Inputs To Read

Before implementing Milestone 9, read:

1. `AGENTS.md`
2. `progress.md`
3. `docs/AGI_The_Last_Alignment_Creative_Bible.md`
4. `docs/GAME_DIRECTION.md`
5. `docs/AGI_IMPLEMENTATION_PLAN.md`
6. `docs/ASSET_PIPELINE.md`
7. `docs/BRAND_ASSET_POLICY.md`
8. `ART_PROVENANCE.md`

## Implement

- Create a durable asset folder structure, likely:
  - `assets/concepts/`
  - `assets/sprites/`
  - `assets/tiles/`
  - `assets/props/`
  - `assets/ui/`
  - `assets/portraits/`
  - `assets/third_party/logos/`
- Add placeholder `.gitkeep` files where needed so empty folders are committed.
- Add an asset manifest, likely `assets/asset_manifest.json`, with stable IDs, categories, intended use, status, source path, dimensions when known, frame metadata when known, and provenance keys.
- Add TypeScript asset manifest types/helpers, likely under `src/assets/`, so gameplay code can eventually resolve sprites/atlases by stable ID instead of raw paths.
- Add first asset ID taxonomy for:
  - Accord Striker player frame.
  - The Oath-Eater portrait/boss sprite.
  - Bad Outputs enemy family.
  - Benchmark Gremlin enemy family.
  - Context Rot Crab enemy family.
  - Coherence Shard pickup.
  - Armistice Plaza ground tiles.
  - Treaty Monument, Barricade Corridor, Crashed Drone Yard, Emergency Alignment Terminal, Cosmic Breach Crack props/landmarks.
  - Alignment Grid node landmarks.
  - UI portrait slots / emergency patch cards.
  - Frontier faction logo placeholders and third-party logo entries.
- Update `ART_PROVENANCE.md` with a manifest-linked structure and examples for generated concepts, PixelLab outputs, manually cleaned sprites, code-generated placeholders, and official logos.
- Add a short asset README, likely `assets/README.md`, explaining the workflow:
  - ChatGPT Images for art direction/concepts.
  - PixelLab for production pixel assets.
  - Aseprite or Pixelorama for cleanup.
  - Official logos only in `assets/third_party/logos/` with provenance and disclaimer notes.
- Add validation/proof tooling for the manifest:
  - Check required manifest fields.
  - Check referenced local files exist unless status is `planned`.
  - Check third-party/logo assets include non-MIT ownership notes.
  - Check production assets have provenance keys.
- Add an npm script such as `npm run proof:assets`.
- Keep all existing proof hooks working:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
- Keep all existing proof scripts passing.

## Optional But Useful

- Add a tiny placeholder atlas or JSON schema describing how sprite sheets will be represented, without importing final art.
- Add a `docs/ASSET_ID_REGISTRY.md` or equivalent if the manifest becomes too large.
- Expose asset pipeline state in `render_game_to_text()` only if useful and concise, such as current manifest version or placeholder-art mode. Do not bloat proof state.

## Do Not

- Do not generate final production art yet unless the user explicitly asks.
- Do not use PixelLab until the user is ready to log in manually.
- Do not add official logos without provenance entries.
- Do not claim official logos are MIT-owned original artwork.
- Do not replace gameplay rendering wholesale.
- Do not add a full map editor.
- Do not break the render performance hotfix from the post-Milestone-8 playtest.

## Verification

After implementation, run:

- `npm run build`
- `npm run proof:assets`
- `npm run proof:smoke`
- `npm run proof:movement`
- `npm run proof:horde`
- `npm run proof:boss`
- `npm run proof:coop`
- `npm run proof:network`
- `npm run proof:full`

Inspect screenshots in:

- `docs/proof/horde/`
- `docs/proof/boss/`
- `docs/proof/coop/`
- `docs/proof/network/`
- `docs/proof/performance/` if rerun

The current project had a real browser freeze/crash before the render hotfix. If touching render code, rerun a real-time stress test or equivalent browser run, not only deterministic `advanceTime()` proofs.

## Exit Criteria

- Asset directories exist and are documented.
- Manifest exists and validates.
- Provenance workflow is clear and updated.
- Official-logo policy is represented in folders/manifest/provenance rules.
- Code has a typed path toward resolving production assets by stable IDs.
- Existing gameplay still builds and proofs pass.
- Next thread can begin importing/generating actual art assets without inventing new process.
