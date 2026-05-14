# Fresh Thread Current State

Date: 2026-05-12

Purpose: give a fresh Codex thread the current working truth without forcing it to reconstruct weeks of decisions from chat history or the full `progress.md` chronology.

This file is a bridge. It does not replace the source-of-truth docs; it tells you what to read, which old notes are superseded, what is accepted, what is provisional, and what habits keep the project from drifting.

## Read First

Before meaningful work, read these in order:

- `AGENTS.md`
- this file
- `docs/FRESH_THREAD_NEXT_STEPS.md`
- `docs/CODEX_CONTINUITY_LEDGER.md`
- `progress.md` tail
- `docs/CAMPAIGN_CLARITY_REFACTOR_CHECKLIST.md`
- `docs/AUTOBATTLE_OBJECTIVE_VARIETY_GOAL.md`
- `docs/VERTICAL_SLICE_REFERENCE_CONTRACT.md`
- `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md`
- `docs/ART_REBUILD_HANDOFF.md`
- `docs/BUILD_ARCHETYPES_AND_ITEMIZATION.md`
- `docs/ECO_GUARDIAN_TECH_BROS_MECHANICS_LEARNINGS.md`
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

The continuity ledger is the compact "do not lose this in a fresh context" file. It records the current working law for PixelLab, production art, proof discipline, iCloud workspace workarounds, and the next likely gameplay-feel pass.

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

## Campaign Clarity Refactor Direction

As of May 12, 2026, the durable refactor direction is to make the game read as a horde-survival roguelite first, authored campaign adventure second, and AGI lore/system world third. The first implementation pass is in place.

The target player loop is:

`Survive -> build power -> complete one map objective -> beat or escape boss pressure -> extract -> unlock next thing`.

The full work queue and fresh-thread prompt live in `docs/CAMPAIGN_CLARITY_REFACTOR_CHECKLIST.md`. Before changing campaign flow, level briefing copy, in-run objective HUD, summaries, unlocks, Free Alignment, or the Alignment Grid, read that checklist and preserve its hierarchy:

- Campaign Mode keeps durable unlock progression.
- Free Alignment remains immediate all-frame/all-co-mind selection and does not grant campaign unlocks.
- Every level should have one plain player-facing verb in briefing, HUD, summary, and telemetry.
- Summary/reward UI should make mechanical unlocks obvious before lore flavor.
- The Alignment Grid should remain a dense route-based progression world, not a flat menu.

Current implementation notes:

- `src/content/campaignClarity.ts` is the source of truth for all 11 campaign level numbers, verbs, objective units, plain objective copy, danger copy, boss/event pressure, reward previews, and map-kind labels.
- `src/content/campaignObjectiveVariety.ts` is the source of truth for the Megabonk / survivor-inspired objective family pass: Armistice teaches baseline anchor capture, then Cooling lures hazards, Transit rides route windows, Signal times clear crossings, Blackwater hunts a boss gate, Memory/Archive carry evidence to extraction, Guardrail uses risk holdout timing, Glass weaponizes the environment, Appeal argues public windows, and the Finale remixes prior rules.
- Build select labels Campaign as durable unlock progression and Free Alignment as an all-roster sandbox that does not grant campaign rewards.
- Briefing cards show `Level X/11`, map kind, verb, objective, danger, boss/event, and reward preview before lore.
- Briefing cards also show the objective style/mechanic line in plain language so a player can tell whether the map is lure, route-window, carry/extract, holdout, environmental weapon, or campaign remix.
- The normal run HUD now shows the objective, next action, compact danger tags, and compact reward tags in the top-center strip, while `render_game_to_text()` exposes matched campaign objective labels, plain objective copy, objective style/mechanic, boss/event pressure, and level verb telemetry.
- Boss-warning UI now stages title card and dialogue instead of stacking them together: the title card owns the first warning moment, then the comms dialogue appears above the current-build panel so the two overlays do not collide.
- Production coherence-shard pickups are intentionally lower visual priority in live combat: smaller, partially transparent, and with reduced shadow weight so late-campaign bosses, route mouths, gates, and objective labels stay readable under carried-build pressure.
- Objective-window mechanics now have live feel regression coverage, not only copy coverage: Transit route windows and Signal clear windows must produce positive `objectiveVariety.runtime.bonusProgressSeconds` with `ROUTE WINDOW` / `CLEAR SIGNAL` labels in the route graybox proofs.
- Mid-campaign objective mechanics have the same live feel regression coverage: Blackwater must prove `TOWER WARNING`, Memory must prove `CARRY LANE`, and Guardrail must prove `HOLD WINDOW` in their route proofs. Memory's carry-lane bonus is intentionally a positive reward path, not a weaker alternate route.
- May 13, 2026 gameplay-feel tuning tightened Memory specifically: baseline proof/screenshot audit across Armistice through Finale found Memory Cache's carry/extract route was the weakest-feeling pre-boss trick. Memory carry-lane engagement now has a wider route skirt, stronger progress/burst payoff, and still pays while the record is contested by Context Rot/redaction pressure. `proof:memory-cache-recovery` now asserts `CARRY LANE`, at least 1s objective-variety bonus telemetry, and at least 0.75s risky-shortcut engagement before Curator pressure.
- May 13, 2026 late-route feel follow-up compared Archive, Appeal, and Finale. Finale was weakest because A.G.I. arrived almost immediately after the route-mouth proof. Prediction-path play now counts as `REMIX WINDOW`, contested Finale proof pressure gets the remix reward path, and A.G.I. arrival is 66s instead of 58s so the route-mouth/prediction remix reads before boss takeover. `proof:alignment-spire-finale` now asserts the memory-route remix proof is pre-A.G.I. while still showing `REMIX WINDOW` engagement.
- May 13, 2026 Campaign Duration Rebalance V1 is implemented. `src/content/campaignDurationProfile.ts` is the timing source of truth for the 11-level campaign: 105 minutes of configured combat target, about 115-125 minutes expected full-campaign play with drafts/summaries/overworld. Arena content now reads target/boss seconds from that profile, runtime telemetry exposes target/boss/tail/phase/cache/cycle-depth data through `render_game_to_text()`, mid-run duration caches pay existing burst/objective/reroll rewards, and route proofs are target-aware for the longer clocks.
- Summary puts mechanical rewards first: level clear, objective progress, objective style, boss defeated, Proof Tokens, newly unlocked frame/co-mind names, next route, then build/flavor.
- Summary objective rows lead with the plain campaign verb and clear/incomplete state before any progress count, e.g. `Objective: STABILIZE COMPLETE (Treaty Anchors 1/3)`, so optional or partial tracked counts do not make a cleared run look failed.
- Alignment Grid selected panels and telemetry include level numbers and verb/objective labels while preserving walkable route rails, readable locks, and deploy blocking.
- Campaign clarity proof artifacts live under `docs/proof/campaign-clarity/`; objective-variety proof artifacts live under `docs/proof/objective-variety/`; campaign-duration proof/audit artifacts live under `docs/proof/campaign-duration/`. Required regression proofs are `npm run proof:campaign-duration`, `npm run proof:objective-variety`, `npm run proof:campaign-clarity`, `npm run proof:overworld`, `npm run proof:solo-campaign-unlocks`, `npm run proof:smoke`, and `npm run proof:reference-run`; recent readability passes inspected `docs/proof/smoke/arena.png`, `docs/proof/reference-run/06-run-start-intel.png`, `docs/proof/boss/boss-intro.png`, `docs/proof/archive-court-redaction/08-appeal-window-writ-pressure.png`, `docs/proof/alignment-spire-finale/09-alien-god-intelligence-live.png`, and `docs/proof/alignment-spire-finale/11-outer-alignment-gate-pressure.png`. When touching objective mechanics, duration, or weapon/effect readability, also rerun and inspect `npm run proof:transit-route-graybox`, `npm run proof:kettle-coast-graybox`, and `npm run proof:build-vfx`.
- Full-spine local readability proofing on May 12, 2026 covered build select, overworld, briefing, run HUD, boss/objective pressure, extraction/summary, camp-after-run, full solo unlocks, and all local route proofs from Cooling through Finale.
- May 13, 2026 release-gate repair: `proof:campaign-full` was unblocked by importing Colyseus server pieces directly from `@colyseus/core` and `@colyseus/ws-transport`, and by running proof-spawned coop servers with `MSGPACKR_NATIVE_ACCELERATION_DISABLED=true`. The remaining iCloud-specific dependency/source read slowness can be avoided by using a temp workspace with fresh `/tmp` `node_modules`, copied `src/scripts/server`, linked `assets/public/docs`, and `NODE_OPTIONS=--preserve-symlinks`. From that temp workspace, `proof:campaign-full`, Vite production build, release checklist, and the local packaged launch check all passed.
- Vite dev-server watch ignores `docs/**` and `tmp/**` because Playwright proofs write screenshots/JSON there; letting those writes hot-reload the app can knock long route proofs back to `MainMenu`.
- May 14, 2026 playable avatar walk-cycle regeneration is complete. All 12 selectable classes were regenerated through PixelLab Character background jobs using the dedicated `.codex-local/pixellab-automation-profile` profile and then mechanically packed into `assets/sprites/players/class_roster_m49.png` without changing the runtime atlas contract. Source frames, manifest, and contact sheet live under `assets/concepts/pixellab_refs/playable_walk_cycles_v1/`, and visual proof lives at `docs/proof/playable-walk-cycles-v1/playable-walk-cycles-v1-proof.png`. Verification passed: `npm run pixellab:check`, `npm run assets:pixellab-playable-walk-cycles-v1`, `npm run assets:pack-playable-walk-cycles-v1`, `npm run proof:assets`, and `npm run proof:roster-sweep` across all 96 class/co-mind combinations. Normal-workspace `npm run build` still hit the known iCloud `tsc` hang and should be rerun from the temp non-iCloud workspace when production build validation is needed.

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

## Free Alignment And Solo Unlocks

As of May 11, 2026, build select has two modes:

- Campaign mode preserves durable unlock progression and only lets the player choose earned frames/co-minds.
- Free Alignment mode is toggled with `M` and lets the player choose any frame plus any co-mind immediately for testing and player generosity.

Free Alignment is runtime-only; it does not mark locked rewards as earned. Campaign unlocks are now fed by the same browser-local durable reward profile for solo clears and online route rewards: `agi:last_alignment:online_progression:v1`.

The current solo campaign spine unlock plan is:

- Armistice Plaza -> `plaza_stabilized` -> Bastion Breaker, Anthropic.
- Cooling Lake Nine -> `lake_coolant_rig` -> Drone Reaver, DeepMind.
- Transit Loop Zero -> `transit_permit_zero`, `transit_loop_online_route` -> Vector Interceptor, Mistral.
- Signal Coast -> `signal_coast_relay_chart` -> Rift Saboteur.
- Blackwater Beacon -> `blackwater_signal_key` -> DeepSeek.
- Memory Cache 001 -> `ceasefire_cache_persistence_seed`, `prototype_persistence_boundary` -> Signal Vanguard, Qwen, Meta.
- Guardrail Forge -> `guardrail_forge_alloy` -> Moonframe Juggernaut.
- Glass Sunfield -> `glass_sunfield_prism` -> Prism Gunner.
- Archive Of Unsaid Things -> `archive_unsaid_index` -> Redline Surgeon.
- Appeal Court Ruins -> `appeal_court_brief`, `verdict_spire_online_route` -> Bonecode Executioner, Nullbreaker Ronin, xAI.
- Alignment Spire Finale -> `alignment_spire_route_capstone` -> Overclock Marauder.

Proof command: `npm run proof:solo-campaign-unlocks`. It verifies clean Campaign starter-only state, Free Alignment all-selectable state, and the full solo spine reaching 12/12 frames and 8/8 co-minds. The same proof has passed against the deployed GitHub Pages URL.

Current build VFX source state:

- accepted active source: `assets/concepts/chatgpt_refs/build_weapon_animation_rebuild_v1/`;
- ChatGPT Images sources: `build_weapon_animation_primary_fusion_source_v1.png` and `build_weapon_animation_secondary_support_source_v1.png`;
- PixelLab source: `assets/concepts/pixellab_refs/build_weapon_animation_rebuild_v1/` from dedicated `.codex-local/pixellab-automation-profile`; API ZIP returned 404 for the single-object export shape, so the completed `storage_urls` frames were preserved and normalized directly;
- runtime atlas path, preserved for compatibility: `assets/sprites/effects/build_weapon_vfx_v1.png`;
- active packer: `scripts/assets/pack-build-weapon-animation-rebuild-v1.py`;
- older v2 packer retained for history: `scripts/assets/pack-build-weapon-vfx-v1.py`;
- provenance keys: `chatgpt_build_weapon_animation_rebuild_v1_source`, `pixellab_build_weapon_animation_rebuild_v1_source`, and `build_weapon_animation_rebuild_v1_runtime_pack`.

Although the runtime atlas path still says `v1`, the active pack now derives from Weapon Animation Rebuild V1 source boards. Do not "clean up" that path name casually unless the import graph, manifest, provenance, proofs, and docs are updated together.

Weapon animation expectations now in force:

- Refusal Shard should show charge/launch/travel/echo/impact/residue instead of falling back to the generic projectile atlas.
- Vector Lance should show charge, segmented beam/travel, trail, impact, and residual lane.
- Signal Pulse should read as a radial pulse/echo/burst, not a tiny projectile that vanishes instantly.
- Context Saw should cycle source-backed saw/spin frames with visible orbit/ghosting.
- Patch Mortar should show launch, arcing travel, descent, shadow, and impact detonation. A static shell sliding through the air is not acceptable.
- Causal Railgun should show heavy charge, segmented beam/travel, impact, and prediction residue rather than a recolored Vector Lance.
- Passive/aura/fusion surfaces such as Refusal Halo / Cathedral of No, Coherence Indexer, Anchor Bodyguard, and Prediction Priority should use source-backed icons/residue where exposed in draft/HUD surfaces.
- Future weapons need the same source-backed motion beats before being called production-ready.

Proof artifacts for this pass:

- source proof: `docs/proof/build-weapon-animation-rebuild-v1/build-weapon-animation-source-contact.png`;
- PixelLab proof: `assets/concepts/pixellab_refs/build_weapon_animation_rebuild_v1/build_weapon_animation_pixellab_raw_contact.png`;
- runtime atlas proof: `docs/proof/build-weapon-animation-rebuild-v1/build-weapon-animation-runtime-contact.png`;
- deterministic motion proof: `docs/proof/build-weapon-animation-rebuild-v1/build-weapon-animation-motion-proof.png`.

Local simulated Consensus Cell peers currently use the accepted Accord Striker art path. Do not bring back simple colored peer bars/boxes as production visuals. Co-op-specific actor art can be added later through the same source-art pipeline.

## Expansion Direction

The project has now proven ten non-Armistice gameplay/map-kind maps after the accepted Armistice baseline, completing the current local full-game campaign chain:

- `cooling_lake_nine`
- map kind: Hazard Ecology
- purpose: prove environmental pressure, server-buoy objectives, shard/economy risk, and a Motherboard Eel event can create a distinct full-game map identity while preserving autocombat and the close tactical camera.

- `transit_loop_zero`
- map kind: Route / Transit
- purpose: prove the campaign can support a different objective structure after Cooling: sequential route/platform alignment, false schedules, route pressure, Station That Arrives event scaffolding, and post-run carryover toward the production-art source pass.

- `signal_coast`
- map kind: Signal Coast / Route Edge
- purpose: prove the campaign can support a third distinct post-Transit objective structure: coastal relay calibration through clear signal windows, corrupted surf/static/cable route pressure, Static Skimmer relay jams, The Lighthouse That Answers boss/event scaffold, coastal extraction, and expedition build carryover after Armistice -> Cooling -> Transit.

- `blackwater_beacon`
- map kind: Puzzle-Pressure / Boss-Hunt
- purpose: prove the campaign can support a fourth local full-game level after Signal Coast: split antenna retuning on ocean-platform decks, Signal Tower wave/readability warnings, tidal lane and Tidecall Static interruption pressure, Maw Below Weather boss/event scaffold, Blackwater Signal Key carryover, and expedition build carryover after Armistice -> Cooling -> Transit -> Signal.

- `memory_cache_001`
- map kind: Expedition / Recovery
- purpose: prove the campaign can support a fifth local full-game level after the source-backed Act 01 chain: evidence-room routing, Memory Record recovery, memory shard trails, safe recall pockets, corrupted archive lanes, risky redacted shortcuts, Context Rot interruption pressure, Memory Curator scaffold, extraction index carryover, and post-Blackwater expedition scaling.

- `guardrail_forge`
- map kind: Defense / Holdout
- purpose: prove the campaign can support a sixth local full-game level after Memory Cache: forge relay hold/leave timing, doctrine calibration, safe hold plates, overload lanes, faction pressure waves, Doctrine Auditor scaffold, quench-gate extraction, Calibrated Guardrail Doctrine carryover, and post-Memory expedition scaling.

- `glass_sunfield`
- map kind: Solar-Prism Traversal / Shade Routing
- purpose: prove the campaign can support a seventh local full-game level after Guardrail Forge: shade routing, exposed glass lanes, Sun Lens timing, Solar Reflection / Choirglass pressure, Wrong Sunrise scaffold, prism-gate extraction, Glass Sunfield Prism carryover, and post-Guardrail expedition scaling.

- `archive_of_unsaid_things`
- map kind: Archive/Court Redaction
- purpose: prove the campaign can support an eighth local full-game level after Glass Sunfield: redaction-safe evidence routing, appeal windows, witness/seal/bench writ preservation, Redaction Angel / Injunction Writ pressure, Redactor Saint scaffold, court writ gate extraction, Archive Court Writ carryover, and post-Glass expedition scaling.

- `appeal_court_ruins`
- map kind: Appeal Court / Public Ruling
- purpose: prove the campaign can support a ninth local full-game level after Archive/Court: public-record route timing, Appeal Brief arguments, verdict beam shortcuts, objection windows, injunction rings, Verdict Clerk / Injunction Writ pressure, Injunction Engine scaffold, public-ruling gate extraction, Appeal Court Ruling carryover, and post-Archive expedition scaling.

- `alignment_spire_finale`
- map kind: Outer Alignment / Prediction Collapse
- purpose: prove the local campaign can end in a mechanically distinct finale after Appeal Court: final route synthesis, four Alignment Proofs, route-mouth collapse, prediction-orb hazards, previous-boss echo pressure, A.G.I. boss/event scaffold, outer gate extraction, `outer_alignment_contained` carryover, and full-campaign completion telemetry.

The current content target is `campaign_complete`, not another authored level. The latest real finale summary is `docs/proof/alignment-spire-finale/12-summary-carryover.json`: LV16, XP613, 15 carried patches, four activated synergies, completed maps from `armistice_plaza` through `alignment_spire_finale`, secrets through `outer_alignment_contained`, 14 Proof Tokens, expedition power 39.75, and next target `Full Campaign Complete`.

Cooling Lake Nine now has a locked V1 production-source runtime pass in `assets/concepts/chatgpt_refs/cooling_lake_nine_source_v1/` plus authenticated PixelLab refinement source in `assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/`, packed by `scripts/assets/pack-cooling-lake-nine-source-v1.py`. Runtime Cooling art uses source-backed terrain, server buoys, rack wrecks, Prompt Leeches, Motherboard Eel frames, and hazard VFX when production art is enabled. PixelLab now supplies the accepted flat isometric terrain decals, authored ground, transparent terrain chunks, buoy pads, rack wrecks, safe platform, and Prompt Leech frames; ChatGPT Images still supplies Motherboard Eel, hazard VFX, and the Eel marker. The PixelLab Map Workshop top-down terrain sheet and raised isometric terrain attempt are preserved as rejected/reference source, not runtime acceptance art. Treat this Cooling source acceptance as closed unless a fresh proof shows a production-art regression.

Transit Loop Zero now has a V1 production-source runtime pass in `assets/concepts/chatgpt_refs/transit_loop_zero_source_v1/`, packed by `scripts/assets/pack-transit-loop-zero-source-v1.py`. Runtime Transit art uses source-backed authored rail-platform ground, terrain chunks, signal/route props, Transit hazard VFX, and Station That Arrives frames/portrait when production art is enabled. This pass is ChatGPT Images sourced and mechanically packed; future PixelLab or Aseprite refinement may improve repetition and tile specificity, but production runtime should no longer fall back to graybox rectangles for Transit platforms, props, boss presentation, or hazard VFX.

Signal Coast now has a V1 source-backed runtime art pass in `assets/concepts/chatgpt_refs/signal_coast_source_v1/`, packed by `scripts/assets/pack-signal-coast-source-v1.py`. Runtime Signal art uses source-backed authored shoreline/causeway ground, terrain chunks, relay/coastal props, Signal hazard VFX, Static Skimmer frames, and Lighthouse That Answers frames/portrait when production art is enabled. PixelLab was also used through the authenticated browser session to generate and save a Signal terrain batch; its export/download did not expose clean runtime files during the pass, so the saved PixelLab gallery capture is preserved under `assets/concepts/pixellab_refs/signal_coast_refinement_v1/` as source/proof reference rather than packed runtime art. Future Aseprite or PixelLab refinement may improve Static Skimmer frame cleanup and terrain specificity, but production runtime should no longer fall back to graybox rectangles for Signal terrain, relays, Static Skimmers, Lighthouse presentation, or hazard VFX.

Blackwater Beacon now has a V1 source-backed runtime art pass using both ChatGPT Images and PixelLab source. ChatGPT Images source boards live under `assets/concepts/chatgpt_refs/blackwater_beacon_source_v1/`, PixelLab generated source frames live under `assets/concepts/pixellab_refs/blackwater_beacon_refinement_v1/`, and runtime packing is handled by `scripts/assets/pack-blackwater-beacon-source-v1.py`. PixelLab contributes directly to the accepted runtime authored ground, prop atlas, and VFX atlas; ChatGPT Images supplies the main Blackwater terrain, objective props, Tidecall Static, Maw Below Weather, and hazard boards. Runtime Blackwater art uses source-backed authored ground, terrain/deck chunks, antenna and Signal Tower props, tidal/static/objective VFX, Tidecall Static frames, Maw Below Weather frames/portrait, and source-backed fallback enemies when production art is enabled.

Memory Cache now has a V1 source-backed runtime art pass using both ChatGPT Images and PixelLab source. ChatGPT Images source boards live under `assets/concepts/chatgpt_refs/memory_cache_source_v1/`, PixelLab generated source frames live under `assets/concepts/pixellab_refs/memory_cache_refinement_v1/`, and runtime packing is handled by `scripts/assets/pack-memory-cache-source-v1.py`. PixelLab contributes directly to accepted runtime authored ground, prop atlas, Context Rot frames, Memory Anchor/redaction frames, Memory Curator contribution, and VFX atlas; ChatGPT Images supplies the main terrain, prop, actor, boss, and VFX boards. Runtime Memory art uses source-backed archive ground, terrain chunks, evidence/recovery props, corruption/recovery VFX, Context Rot, Memory Anchors, Memory Curator frames/portrait, and source-backed fallback enemies when production art is enabled.

Guardrail Forge now has a V1 source-backed runtime art pass using both ChatGPT Images and PixelLab source. ChatGPT Images source boards live under `assets/concepts/chatgpt_refs/guardrail_forge_source_v1/`, PixelLab generated source frames live under `assets/concepts/pixellab_refs/guardrail_forge_refinement_v1/`, and runtime packing is handled by `scripts/assets/pack-guardrail-forge-source-v1.py`. PixelLab contributes directly to accepted runtime authored ground, terrain chunks, prop atlas, Doctrine Auditor drone frames, and VFX atlas; ChatGPT Images supplies the main large prop boards, Doctrine Auditor boss/event strip, and additional VFX. The ChatGPT terrain board is preserved as direction but rejected for runtime terrain because raised side faces read as repeated cube/platform artifacts; runtime terrain uses flatter PixelLab decals. Runtime Guardrail art uses source-backed forge ground, terrain chunks, relay/doctrine props, safe-hold/overload/calibration VFX, Doctrine Auditor drones, Doctrine Auditor boss frames/portrait, and source-backed fallback enemies when production art is enabled.

Archive/Court now has a V1 source-backed runtime art pass using both ChatGPT Images and PixelLab source. ChatGPT Images source boards live under `assets/concepts/chatgpt_refs/archive_court_source_v1/`, PixelLab generated source frames live under `assets/concepts/pixellab_refs/archive_court_refinement_v1/`, and runtime packing is handled by `scripts/assets/pack-archive-court-source-v1.py`. PixelLab contributes directly to accepted runtime prop atlas frames, Redaction Angel frames, and VFX atlas; ChatGPT Images supplies the accepted flat court terrain, broader prop boards, Injunction Writs, Redactor Saint boss/event strip, and additional VFX. PixelLab frame 00 is preserved but rejected for runtime terrain because it read as a square placeholder rug in close-camera proof; normal production Archive/Court no longer shows that terrain contribution.

Appeal Court Ruins now has a V1 source-backed runtime art pass using both ChatGPT Images and authenticated PixelLab source. ChatGPT Images source boards live under `assets/concepts/chatgpt_refs/appeal_court_source_v1/`, PixelLab source lives under `assets/concepts/pixellab_refs/appeal_court_refinement_v1/`, and runtime packing is handled by `scripts/assets/pack-appeal-court-source-v1.py`. PixelLab contributes directly to accepted runtime authored ground, terrain/seal chunks, props, and VFX; ChatGPT Images supplies court terrain, public-ruling props, Verdict Clerk frames, Appeal-specific Injunction Writ frames, Injunction Engine frames, and additional VFX. The first ChatGPT VFX board is preserved as rejected source because it contained baked labels, and one PixelLab console crop was rejected from runtime after proof because it read as a black cube-like placeholder.

Outer Alignment Finale now has a V1 source-backed runtime art pass using both ChatGPT Images and the signed-in PixelLab session in the Codex in-app browser. ChatGPT Images source boards live under `assets/concepts/chatgpt_refs/alignment_spire_finale_source_v1/`, PixelLab source lives under `assets/concepts/pixellab_refs/alignment_spire_finale_refinement_v1/`, and runtime packing is handled by `scripts/assets/pack-alignment-spire-finale-source-v1.py`. PixelLab contributes directly to accepted runtime terrain/prop/VFX/enemy frames through the prediction-orb and proof-ring source objects; ChatGPT Images supplies the broader spire terrain, objective props, previous-boss echo frames, A.G.I. boss frames, and VFX boards. Raised/cube-like terrain fragments and hard dark backplates were avoided or keyed mechanically before acceptance; no expressive finale art cleanup was done with code.

Current proofs:

- `npm run proof:blackwater-beacon-graybox`, with captures under `docs/proof/blackwater-beacon-graybox/`. The proof asserts Signal -> Blackwater unlock, real route/overworld launch, latest Signal-shaped carried expedition build state, Blackwater map kind/objective identity, active tidal/static hazards, Tidecall Static pressure, Maw Below Weather scaffold, extraction/summary carryover, non-anchor Blackwater objective units, collision footprints, large-map bounds, completed maps including `blackwater_beacon`, Blackwater Signal Key reward, and loaded Blackwater source art telemetry.
- `npm run proof:memory-cache-recovery`, with captures under `docs/proof/memory-cache-recovery/`. The proof asserts Blackwater -> Memory unlock, real route/overworld launch, exact post-Blackwater carried expedition shape, Memory Cache map kind/objective identity, large map/collision, evidence recovery, corruption and Context Rot pressure, Memory Curator scaffold, extraction/summary carryover, non-anchor Memory Record units, completed maps including `memory_cache_001`, Recovered Route Memory reward, and loaded Memory Cache source art telemetry.
- `npm run proof:faction-relay-holdout`, with captures under `docs/proof/faction-relay-holdout/`. The proof asserts Memory -> Guardrail unlock, real route/overworld launch, exact post-Memory carried expedition shape, Guardrail Forge map kind/objective identity, large map/collision, safe hold plates, overload/calibration pressure, Doctrine Auditor pressure, boss/event presentation, quench extraction, non-anchor Forge Relay summary units, completed maps including `guardrail_forge`, Calibrated Guardrail Doctrine reward, next route implication to `glass_sunfield`, and loaded Guardrail source art telemetry.
- `npm run proof:glass-sunfield-prism`, with captures under `docs/proof/glass-sunfield-prism/`. The proof asserts Guardrail -> Glass unlock, real route/overworld launch, exact post-Guardrail carried expedition shape, Glass Sunfield map kind/objective identity, large map/collision, shade pocket routing, exposed glass lane pressure, Solar Reflection and Choirglass pressure, Wrong Sunrise scaffold, prism-gate extraction, non-anchor Sun Lens summary units, completed maps including `glass_sunfield`, Glass Sunfield Prism reward, next route implication to `archive_of_unsaid_things`, and loaded Glass Sunfield source art telemetry.
- `npm run proof:archive-court-redaction`, with captures under `docs/proof/archive-court-redaction/`. The proof asserts Glass -> Archive/Court unlock, real route/overworld launch, exact post-Glass carried expedition shape, Archive/Court map kind/objective identity, large map/collision, redaction lane pressure, appeal-window and writ-storm pressure, Redaction Angel / Injunction Writ pressure, Redactor Saint live scaffold with positive HP, court writ gate extraction, non-anchor Evidence Writ summary units, completed maps including `archive_of_unsaid_things`, Archive Court Writ reward, next route implication to `appeal_court_ruins`, and loaded Archive/Court source art telemetry.
- `npm run proof:appeal-court-ruins`, with captures under `docs/proof/appeal-court-ruins/`. The proof asserts Archive/Court -> Appeal unlock, real route/overworld launch, exact post-Archive carried expedition shape, Appeal Court map kind/objective identity, large map/collision, public-record route pressure, verdict/objection/injunction hazards, Verdict Clerk / Injunction Writ pressure, Injunction Engine live scaffold with positive HP, ruling-gate extraction, non-anchor Appeal Brief units, completed maps including `appeal_court_ruins`, Appeal Court Ruling reward, next route implication to `alignment_spire_finale`, and loaded Appeal Court source art telemetry.
- `npm run proof:alignment-spire-finale`, with captures under `docs/proof/alignment-spire-finale/`. The proof asserts Appeal -> Outer Alignment unlock, real route/overworld launch, exact post-Appeal carried expedition shape, finale map kind/objective identity, large map/collision, route-mouth/proof-ring/prediction hazards, Prediction Ghost and previous-boss echo pressure, live A.G.I. scaffold, four Alignment Proofs, outer gate extraction, non-anchor Alignment Proof units, completed maps including `alignment_spire_finale`, `outer_alignment_contained` reward, next target `campaign_complete`, and `alignmentSpireArtReady` / `alignmentSpireArtSet` telemetry.
- `npm run proof:campaign-full` is the available full campaign proof for the online/campaign route schema and passed in the final 2026-05-08 sweep after the lobby vote helper was aligned with the actual Alignment Grid cycling order.

Final 2026-05-08 verification sweep:

- Passed: `node --check scripts/proof/run-proof.mjs`.
- Passed: `python3 -m py_compile scripts/assets/pack-alignment-spire-finale-source-v1.py scripts/assets/pack-appeal-court-source-v1.py scripts/assets/pack-archive-court-source-v1.py scripts/assets/pack-glass-sunfield-source-v1.py scripts/assets/pack-guardrail-forge-source-v1.py scripts/assets/pack-memory-cache-source-v1.py scripts/assets/pack-blackwater-beacon-source-v1.py scripts/assets/pack-signal-coast-source-v1.py scripts/assets/pack-transit-loop-zero-source-v1.py scripts/assets/pack-cooling-lake-nine-source-v1.py scripts/proof/validate-runtime-sprite-framing.py`.
- Passed: `./node_modules/.bin/tsc --noEmit --pretty false`.
- Passed: `npm run proof:campaign-full`.
- Passed campaign chain proofs: `npm run proof:alignment-spire-finale`, `npm run proof:appeal-court-ruins`, `npm run proof:archive-court-redaction`, `npm run proof:glass-sunfield-prism`, `npm run proof:faction-relay-holdout`, `npm run proof:memory-cache-recovery`, `npm run proof:blackwater-beacon-graybox`, `npm run proof:kettle-coast-graybox`, `npm run proof:transit-route-graybox`, and `npm run proof:cooling-lake-graybox`.
- Passed regression proofs: `npm run proof:smoke`, `npm run proof:movement`, `npm run proof:reference-run`, `npm run proof:assets`, `npm run proof:boss`, `npm run proof:visual-fidelity-camera`, `npm run proof:build-grammar`, `npm run proof:build-vfx`, and `npm run proof:player-damage`.
- Passed: `git diff --check`.
- Passed: `./node_modules/.bin/vite build`; it still emits the known large-chunk warning from source-backed runtime art bundles.

Signal Coast lock details:

- Static Skimmer jam pressure has been tuned down from runaway offscreen decay into readable relay pressure.
- Signal's director population now caps expedition-power contribution separately from expedition boss/objective/hazard scaling, so carried builds are challenged without being deleted by inflated enemy caps.
- Clear signal windows still reward relay timing, but Burst charge was reduced from an excessive loop into a meaningful tempo bonus.
- Signal-specific draft/counterplay passives exist for later route-edge build support: `Relay Phase Lock`, `Static Skimmer Net`, `Shoreline Stride`, and `Lighthouse Countertone`.
- The campaign ledger now records `Act 01: Route To The Edge` complete after Armistice, Cooling, Transit, and Signal are all cleared.

Blackwater Beacon lock details:

- Signal Coast still unlocks both `blackwater_beacon` and `verdict_spire`, but the local authored campaign path now chooses Blackwater Beacon as the fourth level because the 1.0 roadmap includes it and Verdict Spire remains the older online boss-gate branch.
- The proof seed matches the latest Signal Coast summary shape: LV10, 915 XP, nine carried patches, Signal Relays 3/3, completed maps through `signal_coast`, and expedition power 21.18.
- Current audited progression curve is Armistice 181s / LV7 / power 14.62, Cooling 132s / LV7 / power 13.17, Transit 95s / LV9 / power 18.61, Signal 140s / LV10 / power 21.18, Blackwater 149s / LV11 / power 23.75, Memory Cache 166s / LV12 / power 26.32.
- PixelLab is no longer just a proof reference for Blackwater. PixelLab-generated source contributes to accepted runtime art, so Blackwater meets the fourth-level PixelLab-plus-ChatGPT-Images art requirement.
- Blackwater remains the source seed for Memory Cache. If Blackwater proof output changes, update the Memory Cache seed before retuning Memory.

Memory Cache lock details:

- Memory Cache starts from the latest Blackwater Beacon summary shape: LV11, 986 XP, 10 carried patches, completed maps through `blackwater_beacon`, Blackwater Signal Key and Act 01 ledger carryover, and expedition power 23.75.
- The proof summary currently clears at 166s with 774 KOs, LV12, 11 carried patches, Memory Records 4/4, completed maps including `memory_cache_001`, Recovered Route Memory secret/carryover, and expedition power 26.32.
- The map kind is `Expedition / Recovery`; objective ID is `memory_record_recovery`; objective units are `Memory Records`, not Treaty Anchors, Server Buoys, Route Platforms, Signal Relays, or Antenna Arrays.
- Difficulty answers the post-Blackwater build through evidence routing, recovery interruptions, corruption/shortcut risk, Context Rot/Memory Anchor pressure, Curator redaction, and extraction index pressure rather than zoom-out or raw HP inflation.
- PixelLab-generated source contributes to accepted runtime art, so Memory Cache meets the PixelLab-plus-ChatGPT-Images art requirement.

Guardrail Forge lock details:

- Guardrail Forge starts from the latest Memory Cache summary shape: LV12, 873 XP, 11 carried patches, two synergies, completed maps through `memory_cache_001`, secrets `blackwater_signal_key`, `alignment_hypothesis_validated`, `recovered_route_memory`, and expedition power 26.32.
- The proof summary currently clears at 160s with 763 KOs, LV13, 12 carried patches, Forge Relays 4/4, completed maps including `guardrail_forge`, Calibrated Guardrail Doctrine secret/carryover, and expedition power 28.89.
- The map kind is `Defense / Holdout`; objective ID is `guardrail_doctrine_calibration`; objective units are `Forge Relays`, not Treaty Anchors, Server Buoys, Route Platforms, Signal Relays, Antenna Arrays, or Memory Records.
- Difficulty answers the post-Memory build through hold/leave relay timing, safe hold plates, calibration windows, overload lanes, Doctrine Auditor jamming/pressure, faction waves, and quench extraction rather than zoom-out or raw HP inflation.
- PixelLab-generated source contributes to accepted runtime art, so Guardrail Forge meets the PixelLab-plus-ChatGPT-Images art requirement.

Glass Sunfield lock details:

- Glass Sunfield starts from the latest Guardrail Forge summary shape: LV13, XP617, 12 carried patches, two synergies, completed maps through `guardrail_forge`, secrets including `calibrated_guardrail_doctrine`, proof tokens 5, and expedition power 28.89.
- The proof summary currently clears at 182s with 1166 KOs, LV13, 12 carried patches, Sun Lenses 4/4, completed maps including `glass_sunfield`, Glass Sunfield Prism secret/carryover, and expedition power 29.74.
- The map kind is `Solar-Prism Traversal / Shade Routing`; objective ID is `glass_prism_alignment`; objective units are `Sun Lenses`, not Treaty Anchors, Server Buoys, Route Platforms, Signal Relays, Antenna Arrays, Memory Records, or Forge Relays.
- Difficulty answers the post-Guardrail build through shade-pocket routing, exposed glassfield risk, prism/lens timing, Solar Reflection and Choirglass pressure, Wrong Sunrise beam/reflection pressure, and prism-gate extraction rather than relay hold timing or raw HP inflation.
- PixelLab-generated source contributes to accepted runtime art, so Glass Sunfield meets the PixelLab-plus-ChatGPT-Images art requirement. PixelLab frame 2 is preserved but rejected for runtime terrain because it read as a raised strip artifact.

Archive/Court lock details:

- Archive of Unsaid Things starts from the latest Glass Sunfield summary shape: LV13, XP1774, 12 carried patches, two synergies, completed maps through `glass_sunfield`, secrets through `glass_sunfield_prism`, proof tokens 7, and expedition power 29.74.
- The proof summary currently clears at 198s with 1036 KOs, LV14, 13 carried patches, Evidence Writs 4/4, completed maps including `archive_of_unsaid_things`, Archive Court Writ secret/carryover, proof tokens 9, and expedition power 32.31.
- The map kind is `Archive/Court Redaction`; objective ID is `archive_redaction_docket`; objective units are `Evidence Writs`, not Treaty Anchors, Server Buoys, Route Platforms, Signal Relays, Antenna Arrays, Memory Records, Forge Relays, or Sun Lenses.
- Difficulty answers the post-Glass build through evidence-writ routing, redaction fields, appeal windows, writ storms, Redaction Angel / Injunction Writ pressure, Redactor Saint calls, and court writ gate extraction rather than shade routing, relay hold timing, or raw HP inflation.
- PixelLab-generated source contributes to accepted runtime art, so Archive/Court meets the PixelLab-plus-ChatGPT-Images art requirement. PixelLab frame 00 is preserved but rejected for runtime terrain because it read as a square placeholder rug in live proof.

Appeal Court Ruins lock details:

- Appeal Court Ruins starts from the latest Archive/Court summary shape: LV14, XP1513, 13 carried patches, two synergies, completed maps through `archive_of_unsaid_things`, secrets through `archive_court_writ`, proof tokens 9, and expedition power 32.31.
- The proof summary currently clears at 190s with 910 KOs, LV15, 14 carried patches, Appeal Briefs 4/4, completed maps including `appeal_court_ruins`, Appeal Court Ruling secret/carryover, proof tokens 12, and expedition power 36.03.
- The map kind is `Appeal Court / Public Ruling`; objective ID is `appeal_public_ruling`; objective units are `Appeal Briefs`, not Treaty Anchors, Server Buoys, Route Platforms, Signal Relays, Antenna Arrays, Memory Records, Forge Relays, Sun Lenses, or Evidence Writs.
- Difficulty answers the post-Archive build through public-record routing, verdict beams, objection windows, injunction rings, Verdict Clerk / Injunction Writ pressure, Injunction Engine verdict/injunction calls, and public-ruling gate extraction rather than Archive evidence preservation, Glass shade routing, or Guardrail relay hold timing.
- PixelLab-generated source contributes to accepted runtime art, so Appeal Court meets the PixelLab-plus-ChatGPT-Images art requirement. The first ChatGPT VFX board is rejected for baked labels, and one PixelLab console crop was rejected from runtime after proof because it read as a black cube-like placeholder.

Outer Alignment Finale lock details:

- Outer Alignment Finale starts from the latest Appeal Court summary shape: LV15, XP786, 14 carried patches, three synergies, completed maps through `appeal_court_ruins`, secrets through `appeal_court_ruling`, proof tokens 12, and expedition power 36.03.
- The proof summary currently clears at 312s with 1354 KOs, LV16, XP613, 15 carried patches, Alignment Proofs 4/4, completed maps including `alignment_spire_finale`, Outer Alignment Contained secret/carryover, proof tokens 14, four activated synergies, and expedition power 39.75.
- The map kind is `Outer Alignment / Prediction Collapse`; objective ID is `outer_alignment_prediction_collapse`; objective units are `Alignment Proofs`, not any previous map's units.
- Difficulty answers the post-Appeal build through route-mouth collapse, proof-ring route choices, prediction-orb hazards, Prediction Ghosts, previous-boss echoes, A.G.I. calls, final proof routing, and outer-gate extraction rather than repeating Appeal's public-ruling loop.
- PixelLab-generated source contributes directly to accepted runtime art, so the finale meets the PixelLab-plus-ChatGPT-Images art requirement. The signed-in Codex in-app browser session was used for PixelLab; no credentials, billing, payment, or security prompts were handled by Codex.

Act 01 thread lessons that should carry forward:

- The serial full-level `/goal` workflow is now complete through the finale. Future fresh threads should treat the current chain as a full-campaign V1 lock and focus on regression fixes, final human taste/playtest approval, or release-candidate polish unless the user explicitly asks for new maps.
- Full-level proof seeds must match the previous level's actual latest summary shape. Do not start a late-campaign level from a plausible hand seed; read the previous proof summary or rerun that proof first and seed from that result.
- Full-level art completion now means gameplay proof first, then ChatGPT Images/imagegen source boards, then the signed-in automated PixelLab session in the Codex in-app browser for cleanup/refinement/source contribution, then mechanical packing, runtime wiring, visual proof, and provenance. PixelLab source must contribute to accepted runtime art for a new production-art lock unless PixelLab is a documented hard blocker.
- Alignment Grid rebuild status: the fresh PixelLab export was recovered on 2026-05-11 through the dedicated `.codex-local/pixellab-automation-profile` browser profile, not the user's main Chrome profile. The source lives under `assets/concepts/pixellab_refs/alignment_grid_rebuild_v1/` as a ZIP, 16 normalized raw frames, a contact sheet, and `alignment_grid_pixellab_fresh_raw_atlas.png`; `scripts/assets/pack-alignment-grid-rebuild-v1.py` now prefers that fresh atlas when rebuilding `assets/props/alignment_grid/alignment_grid_backdrop_v1.png`.
- PixelLab automation process now has a durable handoff in `docs/PIXELLAB_AUTOMATION_WORKFLOW.md`. Future threads should reuse the isolated profile/API ZIP export path before reporting PixelLab export as blocked, and should still stop for user-handled sign-in/security/billing prompts.
- Playable roster walk-cycle status: the 2026-05-14 PixelLab Character batch regenerated south/east/north/west walking frames for `accord_striker`, `bastion_breaker`, `drone_reaver`, `signal_vanguard`, `bonecode_executioner`, `redline_surgeon`, `moonframe_juggernaut`, `vector_interceptor`, `nullbreaker_ronin`, `overclock_marauder`, `prism_gunner`, and `rift_saboteur`. The accepted runtime atlas is `assets/sprites/players/class_roster_m49.png`; proof/source handoff is `assets/concepts/pixellab_refs/playable_walk_cycles_v1/README.md`. Some classes are still less visually distinct than their names imply, so future art work should refine identity/readability from PixelLab/Aseprite source rather than code-authored edits.
- Summary/camp/route UI copy must be short enough to fit real proof screenshots. The Blackwater pass required shortening the next-target line and moving summary controls out from the memory text block after screenshot inspection.
- Late-campaign proof scripts should be robust to powerful carried builds opening drafts faster than older scripts expected. Prefer targeted helpers such as `reachDraftContaining(...)`, settle back to `LevelRun` before run-only telemetry assertions, and inspect captured JSON before changing gameplay balance.
- Boss tuning for later maps should be audited against both proof time and screenshot readability. Guardrail's Doctrine Auditor proof now shows a readable live boss/event frame before extraction while the level still clears at about 160s / LV13 / power 28.89.
- Online full-campaign voting must use the Alignment Grid node order, not the server snapshot order, because the browser lobby cycles through `ALIGNMENT_GRID_MAP.nodes`. The proof helper now chooses the shorter direction in that real order and emits detailed route diagnostics if a target is unavailable.
- `proof:build-vfx` should preserve open secondary protocol slots while waiting for `patch_mortar`; the helper now avoids consuming the remaining secondary slot with filler drafts before the desired VFX card appears.
- Asset manifest categories must use the validator taxonomy (`map_tile`, `landmark_prop`, `enemy_sprite`, etc.), even when the asset ID prefix is `tile.` or `prop.`.
- Weapon/effect animation rebuild V1 is now source-backed and has live proof coverage. Refusal Shard, Vector Lance, Signal Pulse, Context Saw, Patch Mortar, Causal Railgun, and aura/passive/fusion support frames were regenerated as ChatGPT Images source boards plus a fresh PixelLab object from the dedicated `.codex-local/pixellab-automation-profile`, then mechanically packed into the 60-frame `assets/sprites/effects/build_weapon_vfx_v1.png` atlas. The atlas is now packed as a 10-column 2560x1152 grid instead of one 15360x192 strip, because live playtest screenshots showed the long-strip texture could render transparent frame backgrounds as opaque black rectangles in run view. Runtime drawing in `src/level/LevelRunState.ts` uses authored charge/launch/travel/echo/arc/impact/residue frames with lifetime-based cycling, and `src/assets/buildWeaponVfx.ts` slices the grid with `FRAMES_PER_ROW = 10`. `npm run proof:build-vfx`, `npm run proof:smoke`, `npm run proof:transit-route-graybox`, and `npm run proof:kettle-coast-graybox` now pass and their screenshots show visible VFX without black blockers.
- Alignment Grid progression UI now follows the corrected Tech Bros-style 3D walkable overworld structure, not the rejected card-selection menu or the old weird free-walk node layer. The current runtime overworld is a full-screen source-backed isometric progression board using `prop.alignment_grid.backdrop_v2`: the avatar walks node-to-node along authored route rails; arbitrary free-roam movement is disabled; locked landmarks stay visible/readable but cannot deploy; and the selected level card sits in the same physical stone/metal UI grammar with objective, boss, reward, route, and consequence data. The final visual proof pass removed the orange diagonal lock-line artifacts and fixed selected-card text/button overlap. No Tech Bros art/content was copied; the adapted contract is the walkable progression structure reskinned with AGI art/content. Current proof artifacts: `docs/proof/overworld-techbros-full-rebuild/alignment-grid-v2-source-runtime-contact.png`, `docs/proof/overworld/alignment-grid.png`, and `docs/proof/overworld/route-walk-to-locked-gate.png`. `npm run proof:overworld` asserts route walking to a locked gate and locked deploy blocking.
- The overworld avatar now uses the selected class roster sprite from `game.selectedClassId` through `milestone49NetworkPlayerTextureFor(...)` instead of the old hardcoded Milestone 12 coop slot. Proof telemetry exposes `overworld.avatarClassId` and `overworld.avatarFactionId`; non-default proof is preserved at `docs/proof/overworld-avatar-class/rift-saboteur-overworld-avatar.png` / `.json`.

Final handoff:

- The authored local campaign route is Armistice Plaza -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache -> Guardrail Forge -> Glass Sunfield -> Archive of Unsaid Things -> Appeal Court Ruins -> Outer Alignment Finale.
- Current objective-feel regression coverage now includes live route assertions through the finale. Transit asserts `ROUTE WINDOW`, Signal asserts `CLEAR SIGNAL`, Blackwater asserts `TOWER WARNING`, Memory asserts `CARRY LANE`, Guardrail asserts `HOLD WINDOW`, Glass asserts `PRISM ANGLE`, Archive asserts `EVIDENCE CARRY`, Appeal asserts `PUBLIC WINDOW`, and Finale asserts `REMIX WINDOW`, each with positive objective-variety bonus telemetry. Memory, Archive, and Finale were the weakest measured styles and now use positive progress/burst reward tuning rather than below-baseline alternate lanes.
- Proof-spawned Vite dev servers set `VITE_PROOF_RUN=1`, which disables HMR during deterministic proof runs. This prevents startup asset/source reloads and proof artifact writes from resetting long route proofs to `MainMenu`; normal local dev HMR remains available outside proof runs.
- Latest real completion seed: `docs/proof/alignment-spire-finale/12-summary-carryover.json`.
- Next target in-game: `campaign_complete` / `Full Campaign Complete`.
- Remaining work should be final human taste/playtest approval, release-candidate polish, and keeping production-art defaults source-backed while placeholder/debug opt-outs remain explicit.

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

## Enemy Mob Differentiation V1

- A central enemy role profile source now exists at `src/content/enemyRoleProfiles.ts`, and every current `ENEMY_FAMILIES` entry is mapped to a role, counterplay hint, intro arena, objective/on-hit/on-death effects, elite affix eligibility, and proof counters.
- V1 runtime support is in `src/level/LevelRunState.ts`: hostile projectiles, windup telegraphs, trails, explosions, support auras, objective jams, elite markers, sparse projectile caps, player collision/damage sources, and public `render_game_to_text()` telemetry.
- Online co-op now has a matching server-authoritative V1 path in `server/consensusCellServer.mjs`: enemies carry role IDs, hostile telegraphs/projectiles/trails/support/volatile pressure are emitted by the Colyseus room, `OnlineCoopState` renders enemy-role VFX, and `render_game_to_text()` exposes online `enemyRoles`, `enemyTelegraphs`, and hostile projectile metadata.
- Shooter mobs are now a campaign pillar: `eval_wraiths`, `static_skimmers`, `tidecall_static`, `solar_reflections`, `injunction_writs`, `verdict_clerks`, `prediction_ghosts`, and related families escalate from slow aimed shots to leading, line, mortar/status, and objective pressure.
- Volatile, trail, support, objective-jammer, splitter/summoner, and elite-affix pressure all have runtime hooks and proof-visible counters.
- New source-backed enemy-role VFX is preserved under `assets/concepts/chatgpt_refs/enemy_role_vfx_v1/` and `assets/concepts/pixellab_refs/enemy_role_vfx_v1/`, packed into `assets/sprites/effects/enemy_role_vfx_v1.png`, and documented in `docs/ENEMY_MOB_DIFFERENTIATION_PLAN.md`.
- Verification passed for `npm run proof:enemy-roles`, `npm run proof:objective-variety`, `npm run proof:assets`, `node --check scripts/proof/run-proof.mjs`, `node --check scripts/proof/enemy-role-static.mjs`, `python3 -m py_compile scripts/assets/pack-enemy-role-vfx-v1.py`, and targeted TypeScript transpile checks for touched TS files.
- Full verification was completed from the hydrated temp checkout `/tmp/agi-enemy-role-proof-clone`: TypeScript, enemy-role static proof, objective/assets/campaign-duration/campaign-clarity/overworld/solo-unlocks/smoke/reference-run, all 11 route proofs, `proof:campaign-full`, and the focused online co-op combat proof passed. The normal iCloud workspace can still hang on Git/Vite/tsc filesystem reads, so use a non-iCloud hydrated checkout for release-gate proof runs.
