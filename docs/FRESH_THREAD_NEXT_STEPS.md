# Fresh Thread Next Steps

Date: 2026-05-13

Purpose: give the next Codex thread a compact, action-oriented handoff after the long Campaign Clarity, objective-feel, readability, and release-gate repair thread.

This file does not replace `docs/FRESH_THREAD_CURRENT_STATE.md`, `docs/CAMPAIGN_CLARITY_REFACTOR_CHECKLIST.md`, or `progress.md`. It tells the next agent what is now true, what was just fixed, and what work should come next.

For the compact durable operating rules from the latest long thread, also read `docs/CODEX_CONTINUITY_LEDGER.md`.

## Current Truth

`AGI: The Last Alignment` should read first as a 2D isometric pixel-art horde-survival roguelite, second as an authored campaign adventure, and third as AGI lore/systems flavor.

Do not redesign away from:

- autocombat;
- horde pressure;
- drafts and build construction;
- bosses and boss/event pressure;
- extraction;
- Campaign durable unlock progression;
- Free Alignment all-roster sandbox;
- the dense walkable Alignment Grid;
- deterministic proof hooks `window.render_game_to_text()` and `window.advanceTime(ms)`.

The current player loop should remain:

`Survive -> build power -> complete one map objective -> beat or escape boss pressure -> extract -> unlock next thing`.

## What This Long Thread Completed

- Campaign clarity vocabulary is centralized in `src/content/campaignClarity.ts`.
- Objective-family vocabulary is centralized in `src/content/campaignObjectiveVariety.ts`.
- Campaign and Free Alignment mode copy now distinguish durable progression from sandbox roster testing.
- Briefings show level number, map kind, verb, objective, mechanic, danger, boss/event, and reward preview before lore.
- The run HUD shows objective progress, next action, compact danger tags, and compact reward tags.
- Summary rewards lead with mechanical results and now show objective completion before progress counts, such as `Objective: STABILIZE COMPLETE (Treaty Anchors 1/3)`.
- The Alignment Grid remains a walkable route-board world with visible locks and selected-level panels.
- Objective-feel assertions now cover route-window / carry / holdout / environmental / public-window / finale-remix behaviors in live route proofs.
- Boss warning UI no longer collides with the current-build panel.
- Production coherence-shard pickups render with lower visual priority so late bosses, route mouths, gates, and labels read first.
- A first gameplay-feel tuning pass after this handoff audited the full campaign spine and tuned Memory Cache, the weakest route. Memory carry-lane engagement now has a wider route skirt, stronger progress/burst payoff, and contested record pressure still grants the carry-lane reward; `proof:memory-cache-recovery` now requires `CARRY LANE`, at least 1s bonus telemetry, and at least 0.75s risky-shortcut engagement before Curator pressure.
- A late-route follow-up compared Archive, Appeal, and Finale, then tuned Finale. Prediction paths now count as `REMIX WINDOW`, contested proof pressure gets the remix reward path, and A.G.I. arrives at 66s instead of 58s so the route-mouth remix is readable before boss takeover. `proof:alignment-spire-finale` asserts the memory-route remix proof is pre-A.G.I. and still has `REMIX WINDOW` engagement.
- Campaign Duration Rebalance V1 is now in place. The campaign timing contract lives in `src/content/campaignDurationProfile.ts`: Armistice 5:00, Cooling/Transit 7:00, Signal 8:00, Blackwater 9:00, Memory/Guardrail 10:00, Glass/Archive 11:00, Appeal 12:00, Finale 15:00, for exactly 105 minutes of configured combat target and 115-125 minutes expected full campaign time. Runtime proof telemetry exposes duration phase, target/boss/tail, mid-run cache count, expected clear band, and objective cycle-depth counters.
- Playable avatar walk cycles were regenerated through PixelLab for all 12 selectable classes and packed into the existing `assets/sprites/players/class_roster_m49.png` runtime contract. Source frames/manifests live under `assets/concepts/pixellab_refs/playable_walk_cycles_v1/`, visual proof is `docs/proof/playable-walk-cycles-v1/playable-walk-cycles-v1-proof.png`, and `proof:assets` plus the 96-combo `proof:roster-sweep` passed.
- Enemy Mob Differentiation V1 is now implemented. `src/content/enemyRoleProfiles.ts` maps every enemy family to a readable role/counterplay contract; `LevelRunState` supports hostile projectiles, telegraphs, trails, explosions, support auras, objective jams, elite markers, sparse caps, and public role telemetry; and `docs/ENEMY_MOB_DIFFERENTIATION_PLAN.md` records the durable taxonomy/escalation plan.
- `proof:campaign-full` was repaired and rerun successfully from a temp non-iCloud workspace.
- Vite production build was unstuck and passed from the same temp workspace.
- The release checklist bundle and local packaged launch check passed.

## Recent Code Changes To Preserve

- `server/consensusCellServer.mjs` imports only what it needs from `@colyseus/core` and `@colyseus/ws-transport`, not the umbrella `colyseus` package.
- `scripts/proof/run-proof.mjs` starts proof-spawned coop servers with `MSGPACKR_NATIVE_ACCELERATION_DISABLED=true`.
- `scripts/proof/run-proof.mjs` route assertions for Blackwater, Memory, and Finale accept active or recently resolved hazard-pressure telemetry instead of a single-frame active-zone list. Memory additionally requires meaningful risky-shortcut carry-lane engagement before Curator pressure, and Finale requires the memory-route remix proof to be readable before A.G.I. arrives.
- `scripts/proof/run-proof.mjs` route proofs are now target-aware for the longer duration profile. Do not shorten those waits back to old 2-3 minute assumptions when updating route tests.
- `scripts/proof/run-proof.mjs` now also asserts enemy-role pressure at existing pre-boss captures: Armistice role telemetry without projectile clutter, Cooling rusher/volatile pressure, Transit ranged/lane pressure, Signal Static Skimmer pressure, Blackwater Tidecall status/mortar pressure, Memory trail/status pressure, Guardrail objective/status pressure, Glass reflection ranged pressure, Archive line/trail pressure, Appeal verdict/injunction pressure, and Finale at least three learned roles before A.G.I.
- `scripts/proof/enemy-role-static.mjs` and `npm run proof:enemy-roles` are the static gate for role profile completeness, campaign escalation, runtime telemetry wiring, hostile projectile runtime wiring, and source-backed enemy role VFX registration.
- `scripts/proof/campaign-duration-static.mjs` and `scripts/proof/campaign-duration-audit.mjs` cover the duration table and proof-summary timing audit.
- `scripts/assets/pixellab-playable-walk-cycle-batch.mjs` and `scripts/assets/pack-pixellab-playable-walk-cycles-v1.py` are the durable PixelLab/playable-roster regeneration path. The batch is resume-aware by class/direction because PixelLab background jobs can stall.
- `src/ui/summary.ts` uses completion-first objective summary copy.
- `scripts/proof/campaign-clarity-static.mjs` asserts completion-first summary wording.

Do not casually revert these. They solve real proof/readability blockers from the previous thread.

## Release-Gate / iCloud Workspace Workaround

The normal project lives in an iCloud-backed path. At times, direct dependency reads from that workspace hang or return transient file read errors. If `npm run build`, Colyseus import, Playwright import, or `proof:campaign-full` hangs locally, use a temp workspace with fresh dependencies.

Known-good setup:

```sh
rm -rf /tmp/agi-release-deps /tmp/agi-release-work
mkdir -p /tmp/agi-release-deps /tmp/agi-release-work

cp package.json package-lock.json /tmp/agi-release-deps/
npm ci --prefix /tmp/agi-release-deps

cp package.json package-lock.json index.html vite.config.ts tsconfig.json .gitignore LICENSE render.yaml README.md VIBEJAM_SUBMISSION.md /tmp/agi-release-work/
ln -s /tmp/agi-release-deps/node_modules /tmp/agi-release-work/node_modules

cp -R src scripts server /tmp/agi-release-work/
ln -s "$PWD/assets" /tmp/agi-release-work/assets
ln -s "$PWD/public" /tmp/agi-release-work/public
ln -s "$PWD/docs" /tmp/agi-release-work/docs
ln -s "$PWD/ART_PROVENANCE.md" /tmp/agi-release-work/ART_PROVENANCE.md

cd /tmp/agi-release-work
export NODE_OPTIONS=--preserve-symlinks
export MSGPACKR_NATIVE_ACCELERATION_DISABLED=true
```

Known-good commands from that temp workspace:

```sh
npm run proof:campaign-full
./node_modules/.bin/vite build
npm run proof:assets
npm run proof:overworld
npm run proof:solo-campaign-unlocks
npm run proof:smoke
npm run proof:reference-run
node scripts/proof/release-checklist.mjs
python3 -m http.server 8123 --bind 127.0.0.1 --directory dist
PUBLIC_GAME_URL=http://127.0.0.1:8123 npm run proof:milestone58-launch
```

After running proofs from the temp workspace, artifacts written under linked `docs/proof/...` still update the real repo.

## Next Best Work

The next phase should continue gameplay feel tuning, not another clarity refactor and not new level content.

Goal: make each campaign level feel different moment-to-moment in the player's hands, now that the objective verbs, UI, duration profile, and Enemy Mob Differentiation V1 systems are in place.

First follow-up: rerun the route proofs from a fully responsive non-iCloud checkout and inspect screenshots for the new enemy-role pressure. During the V1 implementation, static/asset checks passed, but normal-workspace browser proofs were blocked by dependency/source reads (`picomatch`, `rollup`, `@playwright/test`, `vite.config.ts`, and source transform stalls). Do not claim final play-feel acceptance for enemy roles until fresh route screenshots prove readability in live close-camera combat.

Work in this order:

1. Run a baseline feel audit.
   - Use the real route proofs and screenshots.
   - Record completion time, player HP, level/XP, KOs, objective progress pacing, boss arrival timing, extraction timing, and whether the level's trick is felt before the boss.
   - Inspect screenshots manually. Do not rely only on JSON.

2. Tune early-game feel first.
   - Armistice should teach survive/build/objective/boss/extract without clutter.
   - Cooling should make hazard luring feel useful quickly.
   - Transit should make active route windows feel meaningfully faster than static standing.
   - Signal should make clear signal windows feel like timing, not just capture zones.

3. Tune mid-campaign feel next.
   - Blackwater should feel like a boss-gate hunt with tower warnings, not only three antennas.
   - Memory should make carry/extract routes feel rewarding and risky.
   - Guardrail should make leave/return holdout timing obvious under pressure.

4. Tune late campaign last.
   - Glass should make prism/shade routing feel like weaponizing the map.
   - Archive should make evidence carry feel more active than capture.
   - Appeal should make public windows and verdict pressure readable under carried builds.
   - Finale should continue feeling like a remix of learned rules, with A.G.I. pressure readable and climactic after the player has seen the route-mouth trick.

5. Patch the next weakest route.
   - Memory Cache and Finale have already received focused tuning passes after proof/screenshot audits.
   - Use fresh proof telemetry plus screenshot inspection to pick the next target.
   - Make the smallest high-impact tuning change.
   - Add or tighten proof assertions only for behavior that can regress.

6. Keep release gates healthy.
   - After substantial changes, rerun the affected route proof, `proof:objective-variety`, `proof:campaign-clarity`, `proof:overworld`, `proof:solo-campaign-unlocks`, `proof:smoke`, `proof:reference-run`, and, when practical, `proof:campaign-full`.
   - Use the temp workspace workaround when the iCloud workspace hangs.

Parallel art follow-up: inspect the regenerated playable avatars in live gameplay and overworld contexts. The PixelLab walk cycles are now functional and proofed, but some class identities may need a second source-backed PixelLab/Aseprite refinement pass for stronger silhouette distinction.

## Do Not Do Next

- Do not add new campaign levels before feel tuning the existing 11-level spine.
- Do not solve readability by zooming the camera out.
- Do not replace the horde-survival loop with puzzle-first or dialogue-first play.
- Do not create expressive production art with code, Pillow, Pixi Graphics, SVG, CSS, filters, recolors, or procedural shortcuts.
- Do not reopen accepted Armistice art or the current Alignment Grid unless fresh proof screenshots show a concrete regression.
- Do not treat `proof:campaign-full` as optional during release-style work now that the temp-workspace path is known.

## Copy/Paste Prompt For A Fresh Thread

```text
/goal
We are continuing AGI: The Last Alignment after the long Campaign Clarity / objective-feel / release-gate repair thread.

Read first:
- AGENTS.md
- docs/FRESH_THREAD_CURRENT_STATE.md
- docs/FRESH_THREAD_NEXT_STEPS.md
- docs/CODEX_CONTINUITY_LEDGER.md
- progress.md tail
- docs/CAMPAIGN_CLARITY_REFACTOR_CHECKLIST.md
- docs/AUTOBATTLE_OBJECTIVE_VARIETY_GOAL.md
- docs/GAME_DIRECTION.md
- docs/ECO_GUARDIAN_TECH_BROS_MECHANICS_LEARNINGS.md
- docs/PIXELLAB_AUTOMATION_WORKFLOW.md

Current direction:
This game should read first as a 2D isometric pixel-art horde-survival roguelite, second as an authored campaign adventure, and third as AGI lore/systems flavor. Preserve autocombat, horde pressure, drafts, bosses, extraction, Free Alignment, Campaign unlocks, the dense Alignment Grid, and deterministic proof hooks `window.render_game_to_text()` / `window.advanceTime(ms)`.

Recent thread context:
- Campaign clarity, objective variety, summary reward clarity, run HUD danger/reward guidance, lower-priority pickup rendering, boss warning UI staging, campaign-wide objective-feel assertions, solo unlock proof, and release-gate infrastructure repair are in place.
- `proof:campaign-full` and Vite production build pass from the temp non-iCloud workspace described in docs/FRESH_THREAD_NEXT_STEPS.md.
- Do not revert direct Colyseus imports from `@colyseus/core` / `@colyseus/ws-transport`, `MSGPACKR_NATIVE_ACCELERATION_DISABLED=true` for proof coop servers, summary completion-first objective wording, or the live objective-feel assertions.

Your task:
Take ownership of the next gameplay-feel tuning pass. Do not stop at planning.

1. Run a repo-grounded baseline feel audit across the campaign spine using existing proofs and screenshots. At minimum include early routes (Armistice, Cooling, Transit, Signal), mid routes (Blackwater, Memory, Guardrail), and late routes (Glass, Archive, Appeal, Finale).
2. For each route, inspect telemetry and screenshots for: objective trick engagement, completion time, player HP, KOs/XP, boss/event arrival, extraction tension, HUD readability, and whether the level feels distinct from static capture.
3. Choose the weakest route based on evidence, patch the smallest high-impact gameplay/readability tuning change, and add or tighten proof assertions for that behavior.
4. Rerun the affected route proof plus relevant regressions: `proof:objective-variety`, `proof:campaign-clarity`, `proof:overworld`, `proof:solo-campaign-unlocks`, `proof:smoke`, and `proof:reference-run`. Use `proof:campaign-full` from the temp workspace if the normal iCloud workspace hangs.
5. Manually inspect screenshots after the patch.
6. Update progress.md and docs/FRESH_THREAD_CURRENT_STATE.md or docs/FRESH_THREAD_NEXT_STEPS.md with what changed, what passed, and what remains next.

Acceptance standard:
- A player can feel each level's main trick before the boss.
- The weakest route is measurably improved without breaking the core loop.
- No camera zoom-out or production-art shortcut is used to hide readability issues.
- Proofs and screenshots support the claim.
```
