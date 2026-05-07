# Vertical Slice Reference Contract

Date: 2026-05-06

Purpose: define what the accepted Armistice vertical slice proves, what future maps must inherit, and what should not be reopened before expanding the game.

## Reference Slice

The current reference slice is:

- Region: `armistice_zone`
- Arena: `armistice_plaza`
- Starter class: `accord_striker`
- Starter co-mind: `openai_accord`
- Boss: `oath_eater`
- Reference proof: `npm run proof:reference-run`

Armistice is the baseline for future expansion. New maps should not be reskins of Armistice, but they must match its runtime contract, proof coverage, camera discipline, and production-art fidelity bar when they become production targets.

## What Armistice Proves

Armistice now proves:

- close tactical isometric camera inside a larger authored map;
- accepted production-art baseline for terrain, props, enemies, boss presentation, visual channels, and proof screenshots;
- large-map traversal with named landmarks, spawn regions, and static prop collision;
- Last Alignment Camp setup and carryover;
- Route Contract choice before deployment;
- Adversarial Eval pressure;
- Alignment Kernel and Consensus Burst setup;
- autocombat horde loop with Coherence Shards and emergency patch drafts;
- upgrade tags, Current Alignment Hypothesis, and synergy threshold feedback;
- Treaty Anchor optional objective with attack pressure and rewards;
- Oath-Eater boss event, boss variant telemetry, and summary completion;
- Proof Token, secret, mastery, Summary, and Camp memory carryover;
- deterministic proof hooks: `window.render_game_to_text()` and `window.advanceTime(ms)`.

## Non-Blocking Polish

These are not blockers for expansion:

- W/S Accord Striker animation polish, unless fresh live proof shows a regression.
- Further Armistice terrain/prod-art iteration, unless the user explicitly reopens it or proof shows a regression.
- Camp visual polish beyond readability.
- Additional Armistice objectives or boss attacks.

Do not keep adding to Armistice just because a future map introduces a new idea. Future maps should prove those ideas in their own map kind.

## Do Not Reopen By Default

Do not reopen these accepted Armistice areas unless specifically targeted:

- terrain source method and current terrain runtime pack;
- prop grounding, scale, alpha, and collision decisions;
- Accord A/D side-walk;
- Oath-Eater boss scale, centered-frame runtime choice, and current presentation;
- Benchmark Gremlin fidelity/readability direction;
- current combat visual-channel separation;
- close-camera proof framing.

## Required Inheritance For Future Maps

Every future playable map must define:

- map kind;
- objective type;
- pressure source;
- reward promise;
- boss/event pattern;
- difficulty layers;
- primary and secondary pressure levers;
- route/camp/summary carryover role;
- proof path.

Use `docs/DIFFICULTY_AND_MAP_SCALING.md` as the companion contract for future tuning. Armistice establishes the reference Baseline Contract: long enough to form a build, boss-required, no kill-count bypass, early drafts readable, late drafts spaced, and route/eval pressure layered on top.

Every future production-art map must use Armistice as the fidelity reference:

- high-fidelity terrain from multiple interconnected source chunks;
- props grounded in the same material system as the base terrain;
- readable enemies with internal pixel material breakup;
- large, padded, grounded bosses;
- close tactical camera proof;
- no code-authored production-art shortcuts.

## Expansion Readiness

The project is ready to stop treating Armistice as the active feature target and begin expanding into the full game. The next recommended expansion target is `cooling_lake_nine` as a Hazard Ecology graybox, followed by a production-art source pass only after the gameplay identity is worth preserving.

## Proof Gate

Before calling the reference slice healthy after future changes, run the relevant subset:

- `npm run proof:reference-run`
- `npm run proof:armistice-core-gameplay`
- `npm run proof:visual-fidelity-camera`
- `npm run proof:movement`
- `npm run proof:smoke`
- `npm run proof:boss`
- `npm run proof:assets`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `./node_modules/.bin/vite build`
