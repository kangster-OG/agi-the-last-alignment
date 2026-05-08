# Fresh Thread Current State

Date: 2026-05-08

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
- Summary/camp/route UI copy must be short enough to fit real proof screenshots. The Blackwater pass required shortening the next-target line and moving summary controls out from the memory text block after screenshot inspection.
- Late-campaign proof scripts should be robust to powerful carried builds opening drafts faster than older scripts expected. Prefer targeted helpers such as `reachDraftContaining(...)`, settle back to `LevelRun` before run-only telemetry assertions, and inspect captured JSON before changing gameplay balance.
- Boss tuning for later maps should be audited against both proof time and screenshot readability. Guardrail's Doctrine Auditor proof now shows a readable live boss/event frame before extraction while the level still clears at about 160s / LV13 / power 28.89.
- Online full-campaign voting must use the Alignment Grid node order, not the server snapshot order, because the browser lobby cycles through `ALIGNMENT_GRID_MAP.nodes`. The proof helper now chooses the shorter direction in that real order and emits detailed route diagnostics if a target is unavailable.
- `proof:build-vfx` should preserve open secondary protocol slots while waiting for `patch_mortar`; the helper now avoids consuming the remaining secondary slot with filler drafts before the desired VFX card appears.
- Asset manifest categories must use the validator taxonomy (`map_tile`, `landmark_prop`, `enemy_sprite`, etc.), even when the asset ID prefix is `tile.` or `prop.`.

Final handoff:

- The authored local campaign route is Armistice Plaza -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache -> Guardrail Forge -> Glass Sunfield -> Archive of Unsaid Things -> Appeal Court Ruins -> Outer Alignment Finale.
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
