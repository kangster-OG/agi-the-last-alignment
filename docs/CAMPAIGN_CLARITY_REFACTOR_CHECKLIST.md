# Campaign Clarity Refactor Checklist

Date: 2026-05-12

Purpose: make `AGI: The Last Alignment` read as a horde-survival roguelite first, an authored campaign adventure second, and an AGI fiction/system world third. The campaign can stay weird, dense, and authored, but the player should never wonder what kind of game they are playing, what the current run goal is, what they just earned, or what they should do next.

This is a direction and implementation checklist. It is not a request to replace the current game loop. Preserve autocombat, close isometric play, horde pressure, drafts, bosses, large authored levels, the Alignment Grid, Free Alignment, and campaign unlock progression.

## Implementation Status

2026-05-12 first pass complete:

- Added `src/content/campaignClarity.ts` as the campaign clarity vocabulary source of truth for all 11 levels.
- Added `src/content/campaignObjectiveVariety.ts` and `docs/AUTOBATTLE_OBJECTIVE_VARIETY_GOAL.md` as the objective-family source of truth so later campaign maps rotate through hazard lure, route/timing windows, boss-gate hunt, carry/extract, risk holdout, environmental weapon, and finale remix patterns instead of repeating static capture.
- Wired Campaign/Free Alignment mode copy, level briefing cards, in-run HUD objective language, summary rewards, Alignment Grid selected panels, and `render_game_to_text()` telemetry to the shared level verbs/objectives.
- Wired objective style/mechanic copy into briefing, HUD next-action guidance, summary rewards, runtime objective summaries, and `render_game_to_text()` telemetry.
- Added `npm run proof:campaign-clarity` for static campaign verb/objective assertions and UI/telemetry wiring checks.
- Added `npm run proof:objective-variety` for objective-family assertions and briefing/HUD/summary/runtime/telemetry wiring checks.
- Captured proof screenshots under `docs/proof/campaign-clarity/` for build select, overworld, briefing, and in-run HUD.
- Verified this pass with `npm run proof:objective-variety`, `npm run proof:campaign-clarity`, targeted TypeScript transpile checks for changed files, `npm run proof:overworld`, `npm run proof:solo-campaign-unlocks`, `npm run proof:smoke`, `npm run proof:reference-run`, `npm run proof:cooling-lake-graybox`, `git diff --check`, and manual screenshot inspection.
- 2026-05-15 copy direction update: `docs/COPY_VOICE_DIRECTION.md` is now the repo-level source of truth for player-facing tone. The clarity hierarchy remains, but the voice target is original sardonic AGI dungeon-crawl parody instead of earnest systems flavor.

## Design Hierarchy

- [ ] Primary: horde-survival roguelite.
- [ ] Secondary: authored campaign adventure with a dense overworld spine.
- [ ] Tertiary: AGI lore, parody factions, strange language, and reality-break fiction.
- [ ] Every new or changed system should support the core loop: `Survive -> build power -> complete one map objective -> beat or escape boss pressure -> extract -> unlock next thing`.
- [ ] Sarcastic/parody copy should flavor the action after the action is understandable.
- [ ] The first 20 minutes should teach movement, autocombat, drafts, objectives, bosses, extraction, and durable unlocks without asking the player to decode the entire fiction.

## Definition Of A Good Campaign Run

- [ ] The player knows the current objective within 2 seconds.
- [ ] The player knows where to move next or what object to interact with.
- [ ] The player understands the main danger source of the level.
- [ ] The player sees enemies, pickups, objectives, boss pressure, and extraction as different visual channels.
- [ ] Draft choices visibly change combat power.
- [ ] The boss or level event feels like the run climax, not a random extra thing.
- [ ] Extraction or completion feels deliberate and readable.
- [ ] The summary explains what was completed, what was earned, and what unlocked next.
- [ ] The next overworld node or reward target is obvious before the player returns to the map.

## Do Not Do

- [ ] Do not turn the game into a strategy map, dialogue-first adventure, puzzle game, or menu progression sim.
- [ ] Do not add new levels before the existing campaign spine is easier to understand.
- [ ] Do not hide mechanical rewards behind only lore names.
- [ ] Do not remove autocombat or horde survival pressure.
- [ ] Do not make the camera far away to hide readability issues.
- [ ] Do not copy Tech Bros, Eco Guardian, or any other game assets, names, UI, jokes, maps, characters, or expressive content.
- [ ] Do not reopen production art unless current proof screenshots show a concrete readability or fidelity problem.
- [ ] Do not create expressive art with code/Pillow/Pixi Graphics/SVG/CSS/procedural shortcuts. Use approved source art workflows for production visuals.

## Phase 0: Baseline Audit

- [ ] Read `AGENTS.md`, `docs/FRESH_THREAD_CURRENT_STATE.md`, `docs/GAME_DIRECTION.md`, `docs/MAP_KIND_EXPANSION_CHECKLIST.md`, `docs/ECO_GUARDIAN_TECH_BROS_MECHANICS_LEARNINGS.md`, and this file.
- [ ] Inspect the current campaign flow in the repo before editing.
- [ ] Run or create a quick proof that reaches Campaign start, Free Alignment, Overworld, Armistice briefing, Armistice run, summary, and the next unlocked node.
- [ ] Capture current screenshots for build select, overworld, briefing, in-run HUD, summary, and unlock display.
- [ ] List confusing or redundant player-facing terms currently visible in those screens.
- [ ] Record any current proof or build blockers before making changes.

## Phase 1: Vocabulary Compression

- [ ] Create or update a single source of truth for player-facing campaign terms.
- [ ] Pick one plain word for each major concept and use it consistently.
- [ ] Use `Frame` for character, with first-use copy like `Frame (your character)`.
- [ ] Use `Co-Mind` for AI partner, with first-use copy like `Co-Mind (AI partner)`.
- [ ] Use `Draft` for in-run upgrades.
- [ ] Use `Proof Tokens` for durable campaign currency.
- [ ] Use `Free Alignment` for sandbox roster selection.
- [ ] Use `Campaign` for unlock progression.
- [ ] Keep AGI terms only where they add flavor after the plain role is clear.
- [ ] Remove or demote redundant terms that make the player parse systems instead of playing.

## Phase 2: Mode Selection Clarity

- [ ] Make Campaign Mode read as the default progression mode.
- [ ] Campaign Mode should show locked and unlocked roster status clearly.
- [ ] Campaign Mode should explain that clearing levels unlocks frames and co-minds.
- [ ] Free Alignment should be labeled as an immediate all-roster sandbox/testing mode.
- [ ] Free Alignment should clearly say it does not grant campaign unlocks.
- [ ] The mode toggle should be visible before the user has to infer it from a hotkey.
- [ ] Keep `M` as a shortcut if it already works, but do not rely on hidden key knowledge only.

## Phase 3: Level Briefing Cards

- [ ] Every level briefing should show `Level X/11`.
- [ ] Every level briefing should show one main verb.
- [ ] Every level briefing should show the objective in plain language.
- [ ] Every level briefing should show the main danger.
- [ ] Every level briefing should show the boss or event pressure.
- [ ] Every level briefing should show the reward or likely unlock.
- [ ] Every level briefing should fit on screen without cramped tiny text.
- [ ] Briefing copy should be scannable before joke-rich.

## Phase 4: In-Run Objective HUD

- [ ] Add or refine a top-level objective strip that answers "what now?".
- [ ] Show objective progress with plain labels, such as `Anchors 2/3` or `Records 1/4`.
- [ ] Show boss/event state separately from normal objective progress.
- [ ] Show extraction state once extraction is available.
- [ ] Make the HUD objective language match the briefing language.
- [ ] Make objective markers and minimap/waypoint cues visually consistent across levels.
- [ ] Ensure objective text never overlaps the build strip, boss UI, or terrain-critical playfield.
- [ ] Preserve deterministic `render_game_to_text()` fields for current objective, map kind, boss/event state, and extraction state.

## Phase 5: Level-Specific Player Verbs

- [ ] Armistice Plaza: `Stabilize 3 Treaty Anchors. Defeat Oath-Eater. Extract.`
- [ ] Cooling Lake Nine: `Repair Server Buoys. Avoid coolant and cable hazards. Extract.`
- [ ] Transit Loop Zero: `Align Route Platforms. Avoid false tracks. Extract.`
- [ ] Signal Coast: `Tune Signal Relays. Cross during safe signal windows. Extract.`
- [ ] Blackwater Beacon: `Retune Antenna Arrays. Dodge tide and tower warnings. Extract.`
- [ ] Memory Cache: `Recover Memory Records. Avoid Context Rot and redaction. Extract.`
- [ ] Guardrail Forge: `Hold Forge Relays. Leave and return around overload. Extract.`
- [ ] Glass Sunfield: `Align Sun Lenses. Use shade against exposure. Extract.`
- [ ] Archive of Unsaid Things: `Preserve Evidence Writs. Avoid redaction and writ storms. Extract.`
- [ ] Appeal Court Ruins: `Recover Appeal Briefs. Avoid verdict beams and injunctions. Extract.`
- [ ] Outer Alignment Finale: `Seal Alignment Proofs. Survive A.G.I. predictions. Contain the collapse.`

## Phase 6: Summary And Reward Ceremony

- [ ] Summary should put mechanical results before dense lore.
- [ ] Show `Level Cleared`, `Objective Complete`, `Boss Defeated`, `Proof Tokens`, and `Unlocked` as distinct rows.
- [ ] Show newly unlocked frames and co-minds with names and silhouettes/icons.
- [ ] Show next campaign node by name and level number.
- [ ] Preserve flavor text, but keep it secondary to what changed mechanically.
- [ ] Make failed runs explain what progress, if any, was retained.
- [ ] Ensure Free Alignment runs do not imply campaign progression.

## Phase 7: Alignment Grid Clarity

- [ ] The Alignment Grid should read as a walkable/route-based progression world, not a flat menu.
- [ ] The selected landmark panel should show level number, name, status, main objective, and reward preview.
- [ ] Locked landmarks should remain visible but clearly blocked.
- [ ] The primary campaign road should be readable at a glance.
- [ ] Route walking should never feel like arbitrary free roam if the intended contract is node-to-node route traversal.
- [ ] The selected panel should not overlap important route art or text.
- [ ] Proof screenshots should cover initial grid, unlocked route movement, locked gate blocking, and selected-level panel readability.

## Phase 8: Build Readability

- [ ] Make the current build strip easy to scan during horde pressure.
- [ ] The player should know active primary, secondary protocols, passive processes, fusion progress, and burst state.
- [ ] Draft copy should explain the gameplay effect before the joke.
- [ ] Fusion readiness should be visible without long text collisions.
- [ ] Character and co-mind differences should be understandable from the build select screen.
- [ ] Balance changes should be validated with roster sweep proof, not vibes.

## Phase 9: Progression Metrics

- [ ] Decide which progression metrics are primary, secondary, and flavor.
- [ ] Primary metrics should include level cleared, objective progress, boss defeated, extraction, unlocks, and Proof Tokens.
- [ ] Secondary metrics can include KOs, level, XP, carried patches, synergies, and route secrets.
- [ ] Flavor metrics can include AGI/route/parody tags if they do not obscure the primary result.
- [ ] The campaign should make durable unlocks feel earned and obvious.
- [ ] Free Alignment should make testing and roster play feel generous without corrupting progression.

## Phase 10: Proofs And Acceptance Tests

- [ ] Add or update a campaign clarity proof that captures build select, overworld, briefing, in-run objective HUD, summary, and next unlock.
- [ ] Add assertions that each campaign level exposes a plain objective verb in telemetry.
- [ ] Add assertions that summary unlock rows appear after seeded milestone clears.
- [ ] Keep `npm run proof:solo-campaign-unlocks` passing.
- [ ] Keep `npm run proof:overworld` passing.
- [ ] Run `npm run proof:assets` after any asset or UI image manifest change.
- [ ] Run targeted TypeScript checks for changed files if the full iCloud workspace build hangs.
- [ ] Run a production Vite build or document the known local `tsc` hang if it recurs.
- [ ] Inspect screenshots manually. A passing JSON proof is not enough for UI clarity.

## Phase 11: Ship Gate

- [ ] Re-run the core proof suite relevant to the touched surfaces.
- [ ] Rebuild the production game.
- [ ] Deploy to the public playable target if the user asks for deployment or if this is a release pass.
- [ ] Run the public launch proof after deployment.
- [ ] Update `progress.md`, `docs/FRESH_THREAD_CURRENT_STATE.md`, and any affected source-of-truth docs.
- [ ] Record screenshots or proof artifacts for the fresh thread handoff.

## Fresh Codex Thread Prompt

Copy and paste this into a fresh Codex thread opened in this project:

```text
goal/
We are doing the Campaign Clarity Refactor for AGI: The Last Alignment.

Read AGENTS.md first, then read:
- docs/CAMPAIGN_CLARITY_REFACTOR_CHECKLIST.md
- docs/AUTOBATTLE_OBJECTIVE_VARIETY_GOAL.md
- docs/FRESH_THREAD_CURRENT_STATE.md
- docs/GAME_DIRECTION.md
- docs/MAP_KIND_EXPANSION_CHECKLIST.md
- docs/ECO_GUARDIAN_TECH_BROS_MECHANICS_LEARNINGS.md
- progress.md tail

The direction is: this game should be mostly a 2D isometric pixel-art horde-survival roguelite, with some authored campaign adventure, and AGI lore/systems flavor after that. Do not redesign away from autocombat, horde pressure, drafts, bosses, extraction, Free Alignment, campaign unlocks, or the dense Alignment Grid. The core loop should read as:

Survive -> build power -> complete one map objective -> beat or escape boss pressure -> extract -> unlock next thing.

Implement the checklist in docs/CAMPAIGN_CLARITY_REFACTOR_CHECKLIST.md in order. Start with a repo-grounded audit and proof screenshots of the current build select, overworld, level briefing, in-run HUD, summary, and unlock flow. Then make the smallest high-impact code/content changes needed so Campaign Mode, Free Alignment, each level objective, in-run HUD guidance, summary rewards, and the Alignment Grid all communicate clearly.

Acceptance standard:
- A new player can tell what mode they are in, what level they are entering, what the main objective is, what danger to respect, what boss/event is coming, what reward they earned, and what unlocked next.
- Every campaign level has one plain player-facing verb in briefing, HUD, summary, and telemetry.
- Free Alignment lets the player choose any frame + co-mind immediately while Campaign keeps durable unlock progression.
- Summary/reward UI makes mechanical unlocks obvious before lore flavor.
- Overworld proof still passes and selected/locked landmarks are readable.
- Solo campaign unlock proof still passes.

Use the existing stack: Vite, TypeScript, PixiJS, custom lightweight 2D gameplay math. Preserve deterministic proof hooks: window.render_game_to_text() and window.advanceTime(ms).

Do not create expressive production art with code/Pillow/Pixi Graphics/SVG/CSS/procedural shortcuts. If visual production art changes are truly needed, use the approved ChatGPT Images + PixelLab workflow in docs/PIXELLAB_AUTOMATION_WORKFLOW.md and preserve provenance.

Check your work with targeted proofs and screenshots. At minimum, keep proof:overworld and proof:solo-campaign-unlocks passing, add or update a campaign clarity proof if needed, inspect screenshots manually, then update progress.md and the current-state docs. Do not stop at planning.
```
