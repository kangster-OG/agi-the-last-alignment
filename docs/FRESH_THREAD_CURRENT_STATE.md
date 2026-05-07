# Fresh Thread Current State

Date: 2026-05-07

Purpose: give a fresh Codex thread the current working truth without forcing it to reconstruct weeks of decisions from chat history or the full `progress.md` chronology.

This file is a bridge. It does not replace the source-of-truth docs; it tells you what to read, which old notes are superseded, what is accepted, what is provisional, and what habits keep the project from drifting.

## Read First

Before meaningful work, read these in order:

- `AGENTS.md`
- this file
- `progress.md` tail
- `docs/VERTICAL_SLICE_REFERENCE_CONTRACT.md`
- `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md`
- `docs/ART_REBUILD_HANDOFF.md`
- `docs/BUILD_ARCHETYPES_AND_ITEMIZATION.md`
- `docs/DIFFICULTY_AND_MAP_SCALING.md`
- `docs/MAP_KIND_EXPANSION_CHECKLIST.md`
- `docs/GAME_DIRECTION.md`
- `docs/AGI_IMPLEMENTATION_PLAN.md`
- `docs/AGI_The_Last_Alignment_Creative_Bible.md`
- `docs/AGI_VISUAL_ART_BIBLE.md`
- `docs/ASSET_PIPELINE.md`
- `ART_PROVENANCE.md`
- `assets/concepts/chatgpt_refs/armistice_source_rebuild_v2/README.md`

Then inspect the actual current game or current proof screenshots. Do not rely on memory from a previous thread.

## Current Project Shape

`AGI: The Last Alignment` is now being built as the real full game, not only a jam prototype and not only an Armistice vertical slice.

The current design center is:

- 2D isometric pixel-art horde-survival roguelite;
- dense overworld / Alignment Grid connecting larger authored maps;
- solo plus eventual 1-4 player Consensus Cell co-op;
- autocombat preserved as a core identity;
- player agency through movement, route choice, objective timing, drafts, build construction, Consensus Burst, and risk positioning;
- AGI fiction: humans and frontier AI labs form The Last Alignment against A.G.I., the Alien God Intelligence.

Do not redesign away from autocombat unless the user explicitly changes that non-negotiable.

## Armistice Is The Reference Slice

Armistice Plaza is the accepted vertical-slice reference for future work.

It proves:

- close tactical isometric camera inside a larger authored map;
- source-backed terrain, props, player, enemies, boss, VFX, extraction gate, damage feedback, patch-item icons, and build-weapon VFX;
- route contract choice, Alignment Kernel, Adversarial Eval, Consensus Burst, tagged drafts, Treaty Anchors, Oath-Eater boss, extraction gate, summary, camp carryover, and Proof Token reward loop;
- source-backed draft icons, projectile/trail/impact frames, and progress-based animation for the first expanded weapon grammar;
- deterministic proof hooks: `window.render_game_to_text()` and `window.advanceTime(ms)`.

Do not reopen these Armistice areas by default:

- terrain source method and current terrain runtime pack;
- prop grounding, scale, alpha, and collision decisions;
- Accord A/D side-walk;
- Oath-Eater boss scale, centered-frame runtime choice, and current presentation;
- Benchmark Gremlin fidelity/readability direction;
- current combat visual-channel separation;
- current orange-box/projectile-fallback fix;
- current build VFX v2 runtime atlas derivation and source-backed weapon animation timing;
- close-camera proof framing.

Reopen them only if the user's new task targets them or fresh live proof shows a regression.

## Art Baseline To Carry Forward

Armistice's accepted art lesson is not "copy Armistice everywhere." It is the production bar:

- terrain should be built from multiple interconnected high-fidelity source chunks, not one huge sheet and not repeated low-detail tiles;
- prop grounding must live in the same material language as the terrain;
- enemies need readable silhouettes plus internal material breakup, not flat recolors;
- bosses need large padded grounded frames, no square rugs/platforms, no boxed motion, and live chase/combat proof;
- visual channels must separate pickups, player attacks, enemy pressure, boss hazards, objective markers, and rewards by silhouette, animation, luminance, and color;
- weapon VFX need distinct source-backed launch, travel, impact, and payoff beats in the close camera;
- proof must use the close tactical camera, not a zoom-out that hides asset problems.

Use ChatGPT Images, PixelLab, Aseprite, Pixelorama, or another explicit art-source tool before any production visual improvement. Code may only mechanically crop, key, pad, resize, pack, validate, and proof accepted source art.

Do not create expressive production art with Pillow/Python drawing, Pixi Graphics, SVG, CSS, procedural generation, filters, recolors, overlays, gradients, or code-authored marks.

## UI State

The UI went through several rejected directions. Do not resurrect them casually.

Rejected or superseded:

- pale/white pasted-on panels;
- noisy source-backed Armistice terminal atlas as the active runtime UI;
- cramped hard-to-read tiny font/card copy;
- placeholder-looking item thumbnails;
- HUD copy that overlaps terrain or itself.

Current active UI is a readable dark functional field interface with source-backed emergency patch item icons. It is playable and proofed, but it is not a final premium UI art lock in the same way Armistice terrain/props/boss/player/enemy direction is locked.

The current build HUD is useful and player-facing, but still belongs to the provisional UI category. It shows active primary, secondary, passive, and fusion slots with source-backed icons. Do not replace it with pale pasted-on panels or tiny unreadable terminal copy.

If future work targets UI:

- start with imagegen/source art for expressive chrome or icons;
- keep text stat-first and readable;
- inspect against actual gameplay screenshots, not isolated cards;
- preserve compact HUD footprint and close-camera playfield visibility;
- update manifest/provenance/source README/progress when accepting new UI art.

## Gameplay State

The first Armistice loop has been lengthened and hardened:

- 120-second reality-patch contract;
- Oath-Eater is mandatory for clear;
- no kill-count bypass;
- stronger horde phases and adaptive flanks;
- stronger Oath-Eater scaling and boss mechanics;
- spaced XP curve after early drafts;
- uncollected XP recalls to the player before level-up drafts;
- extraction gate appears after clear conditions and must be entered.

Player damage now has visible feedback:

- HP rail pulse;
- avatar flash/stagger;
- source-backed contact/boss/corruption/invulnerability/downed VFX;
- no directional danger ring, per user request.

## Roguelite And Build State

The Hades II / best-in-class roguelite research pass is implemented as AGI-specific systems:

- Last Alignment Camp with Kernel/Eval/Burst setup;
- route contract choice and consequences;
- Treaty Anchor optional objective and rewards;
- tagged drafts;
- Current Alignment Hypothesis / synergy online moments;
- Summary/Camp carryover with Proof Tokens, route memory, secrets, mastery, and next target;
- map-kind direction and difficulty-scaling taxonomy;
- full-game build archetypes and itemization contract.

The first runtime build-grammar expansion is in:

- primary swaps: `vector_lance`, `signal_pulse`;
- secondary protocols: `context_saw`, `patch_mortar`;
- passives: `coherence_indexer`, `anchor_bodyguard`, `prediction_priority`;
- fusion: `causal_railgun` from `vector_lance + predicted_lane`;
- default slot caps: one primary auto-weapon, two secondary protocols, four passive processes, one major fusion, and one Consensus Burst path;
- player-facing current build HUD strip;
- proofs: `npm run proof:build-grammar` and `npm run proof:build-vfx`;
- telemetry: `render_game_to_text()` exposes build grammar under roguelite run state.

Important bug fixed: draftable primary weapons now persist in runtime. Do not reintroduce a call that forces the class starting weapon every frame.

Important visual bug fixed: small orange boxes in the playfield were production fallback rectangles from missing/unready projectile art. Production mode must not draw those rectangles again. If a source-backed weapon asset is missing, show the fallback only in explicit debug HUD/proof mode, fail the proof, or document the blocker.

Current build VFX source state:

- accepted active source: `assets/concepts/chatgpt_refs/build_weapon_vfx_v2/build_weapon_vfx_source_v2.png`;
- mechanical keyed intermediate: `assets/concepts/chatgpt_refs/build_weapon_vfx_v2/build_weapon_vfx_source_v2_keyed.png`;
- runtime atlas path, preserved for compatibility: `assets/sprites/effects/build_weapon_vfx_v1.png`;
- packer: `scripts/assets/pack-build-weapon-vfx-v1.py`;
- provenance key: `chatgpt_build_weapon_vfx_v2_source`.

Although the runtime atlas path still says `v1`, the active pack now derives from the v2 source. Do not "clean up" that path name casually unless the import graph, manifest, provenance, proofs, and docs are updated together.

Weapon animation expectations now in force:

- Signal Pulse should read as a radial pulse/echo/burst, not a tiny projectile that vanishes instantly.
- Context Saw should cycle source-backed saw/spin frames with visible orbit/ghosting.
- Patch Mortar should show launch, arcing travel, descent, shadow, and impact detonation. A static shell sliding through the air is not acceptable.
- Future weapons need the same source-backed motion beats before being called production-ready.

Local simulated Consensus Cell peers currently use the accepted Accord Striker art path. Do not bring back simple colored peer bars/boxes as production visuals. Co-op-specific actor art can be added later through the same source-art pipeline.

## Expansion Direction

The project is ready to expand beyond Armistice when the user asks for new content. The recommended next content target is:

- `cooling_lake_nine`
- map kind: Hazard Ecology
- purpose: prove a second map can have different gameplay identity while inheriting Armistice's fidelity, camera, objective, proof, and carryover rules.

Other documented map kinds include:

- Open Survival Districts;
- Hazard Ecology maps;
- Route/Transit maps;
- Defense/Holdout maps;
- Expedition/Recovery maps;
- Boss-Hunt maps;
- Puzzle-Pressure maps;
- Micro-Run Challenge maps.

Future maps should declare:

- map kind;
- objective type;
- pressure source;
- reward promise;
- boss/event pattern;
- difficulty layers;
- primary and secondary pressure levers;
- route/camp/summary carryover role;
- proof path.

## Fresh-Thread Working Habits

Before edits and periodically while working:

- run `git status --short`;
- read the latest `progress.md` tail;
- inspect targeted diffs;
- run or inspect current app/proofs.

When changing art/runtime:

- use image/source-art tools first for expressive visuals;
- update `assets/asset_manifest.json`, `ART_PROVENANCE.md`, relevant source README/provenance notes, and `progress.md`;
- keep production-art defaults and placeholder/proof/debug opt-outs;
- preserve `window.render_game_to_text()` and `window.advanceTime(ms)`;
- preserve Vite/TypeScript/PixiJS/custom math stack.

When finishing, run the relevant subset and state exactly what passed:

- `node --check scripts/proof/run-proof.mjs`
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `npm run proof:assets`
- `npm run proof:visual-fidelity-camera`
- `npm run proof:movement`
- `npm run proof:smoke`
- `npm run proof:boss`
- `npm run proof:reference-run`
- `npm run proof:build-grammar` when build systems change
- `npm run proof:build-vfx` when weapon visuals or draft icons change
- `npm run proof:player-damage` when player feedback changes
- `git diff --check`
- `./node_modules/.bin/vite build`

Vite currently emits a known large chunk warning because of the authored Armistice ground/runtime bundle. That warning alone is not a failure unless a future task is specifically about bundle splitting.

## Notes To Future Codex

- The user responds strongly to visual incoherence. Do not declare UI/art success from isolated source boards or contact sheets. Always look at the thing against actual gameplay.
- The user prefers high effort and depth. If a feature touches the full game, record the durable design contract, not just the immediate code.
- Do not undo the accepted Armistice baseline while pursuing the next feature. Build forward.
- Do not copy Hades II, Vampire Survivors, Risk of Rain 2, Dead Cells, Binding of Isaac, Noita, Balatro, Tech Bros, Eco Guardian, or the X/Twitter reference clips. Use them only for structural/fidelity lessons.
- If a future thread gets confused by older historical notes saying Armistice is not accepted, treat `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md`, `docs/VERTICAL_SLICE_REFERENCE_CONTRACT.md`, and this file as newer guidance.
