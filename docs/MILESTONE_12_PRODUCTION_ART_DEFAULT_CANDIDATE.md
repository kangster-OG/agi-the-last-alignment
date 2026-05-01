# Milestone 12 - Production Art Default Candidate and Online Parity

Goal: close the biggest gaps that prevented Milestone 11 art from becoming default.

## Scope

- Add 1-4 player production-art variants so local and online co-op do not rely only on labels or rings.
- Bring the gated production-art path into `OnlineCoopState`.
- Add first production Alignment Grid landmark coverage so the overworld is no longer purely placeholder when production art is enabled.
- Add a default-candidate proof pass that captures flagged solo, local co-op, online co-op, overworld, and performance-oriented screenshots.

## Runtime Policy

- Default gameplay remains placeholder-safe unless explicitly changed after proof review.
- `?productionArt=1` enables the Milestone 12 production-art candidate set.
- `?armisticeTiles=1` remains the explicit Armistice Plaza tile-atlas flag.
- Official logos remain third-party/parody assets and are not part of this milestone.

## Exit Criteria

- Manifest and provenance are updated for every new asset.
- Online co-op still passes with and without the production-art flag.
- Static art stays cached where the arena renderer already caches static map content.
- Dynamic production sprites use reusable sprite containers/pools.
- A clear recommendation exists on whether production art can become default.
