# Map Kind Expansion Checklist

Date: 2026-05-08

Purpose: convert the map-kind direction into implementation checklists for expanding beyond Armistice without building palette-swapped survival arenas.

## Shared Map Contract

Every playable map should declare:

- map kind;
- objective type;
- objective variety family from `src/content/campaignObjectiveVariety.ts`;
- pressure source;
- reward promise;
- boss/event pattern;
- difficulty layers;
- primary and secondary pressure levers;
- route/camp/summary carryover;
- proof path.

Use `docs/DIFFICULTY_AND_MAP_SCALING.md` for the durable difficulty vocabulary. New maps should explicitly name their Baseline Contract, Eval Pressure hooks, Route Risk hooks, World Tier assumptions, Mastery Variant potential, and top pressure levers before implementation.

Shared runtime expectations:

- preserve close tactical camera;
- preserve autocombat;
- preserve horde pressure;
- preserve emergency patch drafts;
- preserve route contracts and camp carryover;
- expose map identity through `render_game_to_text()`;
- expose objective style/mechanic through briefing, HUD guidance, summary, and `render_game_to_text()`;
- prove the map with screenshots and state JSON.

The current objective-variety target is documented in `docs/AUTOBATTLE_OBJECTIVE_VARIETY_GOAL.md`: only Armistice should feel like baseline static capture; later maps should rotate through hazard lure, route/timing windows, boss-gate hunt, carry/extract, risk holdout, environmental weapon, and campaign-remix patterns.

## Cooling Lake Nine

Map kind: Hazard Ecology.

Status: graybox/runtime/proof complete; V1 source-backed production runtime pass complete.

Goal: prove that a second arena can feel mechanically different from Armistice without changing autocombat.

Gameplay checklist:

- Add a distinct Cooling Lake map definition with flooded lanes, server buoys, cable routes, vent zones, and safe islands.
- Add a server-buoy or coolant-stabilization objective.
- Add coolant/electric hazard zones that shape movement.
- Feature Prompt Leeches as the main pressure family.
- Add DeepSeek/Qwen route and reward language.
- Add a Motherboard Eel boss/event scaffold.
- Add Summary/Camp carryover for Kettle Coast progress.
- Add `proof:cooling-lake-graybox`.

Art checklist for future refinement:

- Use Armistice terrain as the fidelity bar, not as the style to copy.
- Generate multiple source chunks for flooded server floor, coolant, cable roots, submerged racks, buoy pads, and abyssal corruption.
- Ground buoys, server wreckage, and cable props into the same material system.
- Use readable enemy silhouettes with internal material breakup.
- Make Motherboard Eel large, padded, grounded, and proofed at close camera.

Exit criteria:

- The run reads as Hazard Ecology in telemetry and screenshots.
- Movement decisions are shaped by the environment.
- Autocombat remains intact.
- The map has its own objective and pressure arc.

## Transit Loop Zero

Map kind: Route / Transit.

Status: graybox/runtime/proof complete; V1 source-backed production runtime pass complete.

Goal: make pathing, false arrivals, and route alignment the main pressure.

Gameplay checklist:

- Add platform/junction map layout.
- Add route-alignment or platform-hold objective.
- Add false-schedule pressure events.
- Add moving lane sweeps or arrival warnings.
- Add Station That Arrives boss/event scaffold.
- Bias rewards toward movement, boss prep, and route control.
- Add `proof:transit-route-graybox`.

Exit criteria:

- The player feels the map lying about where paths go.
- The run is about making a route agree with itself under pressure.
- The boss/event emerges from the route system, not only from a timer.
- Normal production mode uses source-backed Transit ground, route props, hazard VFX, and Station That Arrives frames instead of graybox route blocks.

## Signal Coast

Map kind: Signal Coast / Route Edge.

Status: graybox/runtime/proof complete; V1 source-backed production runtime pass complete.

Goal: make coastal routing, tide timing, and relay calibration the main pressure after Transit.

Gameplay checklist:

- Add a large shoreline/causeway map layout.
- Add signal relay calibration objectives.
- Add clear signal windows that change route timing decisions.
- Add corrupted surf, static fields, and cable arcs that shape crossing choices.
- Feature Static Skimmers as the main pressure family.
- Add The Lighthouse That Answers boss/event scaffold.
- Bias rewards toward burst tempo, relay-safe lanes, and coastal extraction.
- Add `proof:kettle-coast-graybox`.

Exit criteria:

- The player asks whether to cross corrupted surf during the current signal window or take the longer dry route.
- Relay progress, hazard state, Static Skimmer pressure, and Lighthouse state are proof-visible.
- Expedition build state persists from Armistice -> Cooling -> Transit into Signal Coast.
- Normal production mode uses source-backed Signal Coast terrain, relays/props, hazard VFX, Static Skimmers, and Lighthouse frames instead of graybox rectangles.
- PixelLab Signal terrain reference is preserved as source/proof material; runtime V1 uses the cleaner ChatGPT Images source pack until PixelLab/Aseprite refinement cleanly beats it.

## Blackwater Beacon

Map kind: Puzzle-Pressure / Boss-Hunt.

Status: complete V1 local full-game level and source-backed runtime-art lock.

Why this is the recommended fourth level:

- Signal Coast unlocks both `blackwater_beacon` and `verdict_spire`.
- `docs/MILESTONE_ROADMAP_0_TO_58.md` names Blackwater Beacon in the 1.0 authored campaign target.
- Verdict Spire is already documented as a fourth online boss-gate branch after Transit, so it should not supersede Blackwater as the next local full-game level unless the user explicitly chooses the boss-gate branch.

Existing context to preserve:

- Region: Blackwater Array.
- Theme: ocean platform and cosmic antenna pointing the wrong way.
- Pressure family: Tidecall Static.
- Boss/event: Maw Below Weather.
- Readability markers: Signal Towers.
- Hazards: server-authoritative tidal waves in older online proofs; adapt into local close-camera route pressure.
- Rewards/carryover: Blackwater Signal Key / DeepSeek + xAI focus.

Implemented contract:

- Route: Armistice -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon through camp, route contract, Alignment Grid, briefing, run, summary, and carryover.
- Objective: `blackwater_antenna_split_pressure` / Blackwater Antenna Split-Pressure.
- Objective units: `Antenna Arrays`, not Treaty Anchors, Server Buoys, Route Platforms, or Signal Relays.
- Layout: large close-camera Blackwater Array with ocean-platform server decks, safe maintenance platforms, risky flooded crossings, offscreen ocean/static spawn regions, Signal Tower warning lanes, antenna beams, tidal lanes, Tidecall Static fields, and Maw Below Weather shelf collision footprints.
- Pressure: split antenna progress/decay, Tidecall Static objective interruption, tidal wave hits, static fields, Signal Tower warning windows, Maw wave/static calls, and expedition-power scaling from the latest Signal proof summary shape.
- Reward: Blackwater Signal Key plus Blackwater-specific camp/summary carryover and campaign ledger row `Blackwater Beacon / Split-Pressure`.
- Art: ChatGPT Images source boards plus PixelLab-generated source frames are both used. PixelLab contributes directly to accepted runtime authored ground, props, and VFX; ChatGPT Images supplies the main terrain/prop/Tidecall/Maw/VFX boards. Runtime assets are packed by `scripts/assets/pack-blackwater-beacon-source-v1.py`.

Proof:

- `npm run proof:blackwater-beacon-graybox`
- Captures live under `docs/proof/blackwater-beacon-graybox/`.
- Assertions cover unlock after Signal, real route/overworld flow, latest Signal-shaped carried expedition state, pressure scaling, map size/collision, unique map kind/objective ID, active hazards, Tidecall Static, Maw Below Weather, objective completion, Blackwater Signal Key, completed map carryover, non-anchor summary units, and `blackwaterBeaconArtReady` / `blackwaterBeaconArtSet` telemetry.

## Memory Cache

Map kind: Expedition / Recovery.

Status: complete V1 local full-game level and source-backed runtime-art lock.

Goal: make exploration and recovery matter inside the roguelite loop after the source-backed Act 01 chain.

Context from the Blackwater completion thread:

- Seed from the latest Blackwater Beacon summary, not a hand-made "post Act 01" guess. Use `docs/proof/blackwater-beacon-graybox/11-summary-carryover.json` or rerun `npm run proof:blackwater-beacon-graybox` before creating the Memory Cache proof seed.
- Start from the carried LV11 / 10-patch / power 23.75 expedition shape unless a fresh Blackwater proof changes it.
- The map must feel unlike Cooling, Transit, Signal, and Blackwater: exploration, recovery, route memory, and evidence carryover should drive the contract rather than hazard ecology, platform alignment, relay timing, or split antenna/boss pressure.
- Production-art completion requires ChatGPT Images plus PixelLab source, mechanical packing only, runtime art wiring, proof screenshots, manifest/provenance updates, and source READMEs. Memory Cache now satisfies this: PixelLab contributes directly to accepted runtime authored ground, props, Context Rot, Memory Anchors, Memory Curator contribution, and VFX.
- Proof scripts should handle late-campaign draft timing and carried-build power robustly; settle back to `LevelRun` before asserting run-only telemetry and search for targeted drafts instead of assuming the next draft is stable.

Implemented contract:

- Route: Armistice -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache through camp, route contract, Alignment Grid, briefing, run, summary, and carryover.
- Objective: `memory_record_recovery` / Memory Record Recovery.
- Objective units: `Memory Records`, not Treaty Anchors, Server Buoys, Route Platforms, Signal Relays, or Antenna Arrays.
- Layout: large close-camera archive-cache map with evidence rooms, memory shard props, safe recall pockets, corrupted archive lanes, risky redacted shortcut corridors, offscreen Context Rot spawn regions, Curator vault, extraction index area, and major collision footprints.
- Pressure: recoverable evidence progress, leave-zone/corruption decay, Context Rot interruption, Memory Anchor jams, redaction fields, shortcut risk, Curator locks/bursts/calls, and expedition-power scaling from the latest Blackwater proof summary shape.
- Reward: Recovered Route Memory plus Memory Cache-specific mastery/camp carryover and campaign ledger row `Memory Cache / Expedition-Recovery`.
- Art: ChatGPT Images source boards plus authenticated PixelLab source frames are both used. PixelLab contributes directly to accepted runtime authored ground, props, Context Rot, Memory Anchors, Memory Curator contribution, and VFX; ChatGPT Images supplies the main terrain/prop/actor/boss/VFX boards. Runtime assets are packed by `scripts/assets/pack-memory-cache-source-v1.py`.

Proof:

- `npm run proof:memory-cache-recovery`
- Captures live under `docs/proof/memory-cache-recovery/`.
- Assertions cover unlock after Blackwater, real route/overworld flow, exact post-Blackwater carried expedition state, expedition pressure scaling, map size/collision, unique map kind/objective ID, active hazards, Context Rot pressure, Memory Curator scaffold, objective completion, extraction, summary/carryover, non-anchor Memory Record units, completed maps including `memory_cache_001`, Recovered Route Memory reward, and `memoryCacheArtReady` / `memoryCacheArtSet` telemetry.

Exit criteria:

- The player explores instead of orbiting a safe combat area.
- The map teaches lore/carryover without becoming a non-gameplay cutscene.
- Normal production mode uses source-backed Memory Cache terrain, evidence/recovery props, Context Rot, Memory Anchors, Memory Curator presentation, and hazard/recovery VFX instead of graybox rectangles.

## Faction Relay / Guardrail Forge

Map kind: Defense / Holdout.

Goal: make faction infrastructure and doctrine pressure into playable objectives.

Status: complete V1 local full-game level and source-backed runtime-art lock.

Context to preserve:

- Seed from the latest Memory Cache summary, not a planned estimate. Use `docs/proof/memory-cache-recovery/11-summary-carryover.json` or rerun `npm run proof:memory-cache-recovery` first.
- Current expected entry shape: LV12, XP873, 11 carried patches, two synergies, completed maps through `memory_cache_001`, Recovered Route Memory available, expedition power 26.32.
- It must feel unlike Memory Cache and Blackwater: hold/leave timing, relay/forge durability, doctrine calibration, faction waves, and build-bias rewards should drive the contract rather than evidence recovery, split antennas, relay timing, or route platforms.
- Production-art completion requires ChatGPT Images plus PixelLab source, mechanical packing only, runtime wiring, proof screenshots, manifest/provenance updates, and source READMEs. Guardrail Forge now satisfies this: PixelLab contributes directly to accepted runtime authored ground, terrain chunks, props, Doctrine Auditor drones, and VFX.

Implemented contract:

- Route: Armistice -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache -> Guardrail Forge through camp, route contract, Alignment Grid, briefing, run, summary, and carryover.
- Objective: `guardrail_doctrine_calibration` / Guardrail Doctrine Calibration.
- Objective units: `Forge Relays`, not Treaty Anchors, Server Buoys, Route Platforms, Signal Relays, Antenna Arrays, or Memory Records.
- Layout: large close-camera forge map with alloy temper relay, constitutional clamp, Silkgrid loom, overload sluice, audit press, reward quench gate, safe hold plates, overload lanes, calibration windows, offscreen faction spawn regions, and major collision footprints.
- Pressure: hold/leave relay timing, relay jam/decay, safe hold mitigation, overload-lane punishment, Doctrine Auditor drones, benchmark waves, Doctrine Auditor boss/event scaffold, audit press locks, and expedition-power scaling from the latest Memory proof summary shape.
- Reward: Calibrated Guardrail Doctrine plus Guardrail-specific mastery/camp carryover and campaign ledger row `Guardrail Forge / Defense-Holdout`.
- Art: ChatGPT Images source boards plus authenticated PixelLab source frames are both used. PixelLab contributes directly to accepted runtime authored ground, terrain chunks, relay/objective props, Doctrine Auditor drones, and hazard/objective VFX; ChatGPT Images supplies the main large prop boards, Doctrine Auditor boss/event strip, and additional VFX.

Proof:

- `npm run proof:faction-relay-holdout`
- Captures live under `docs/proof/faction-relay-holdout/`.
- Assertions cover unlock after Memory, real route/overworld flow, exact post-Memory carried expedition state, pressure scaling, map size/collision, unique map kind/objective ID, active safe hold/overload/calibration hazards, Doctrine Auditor drone pressure, Doctrine Auditor boss/event scaffold, objective completion, quench extraction, non-anchor Forge Relay units, completed maps including `guardrail_forge`, Calibrated Guardrail Doctrine reward, next target `glass_sunfield`, and `guardrailForgeArtReady` / `guardrailForgeArtSet` telemetry.

Exit criteria:

- The player chooses when to leave the relay for shards and when to return.
- The reward changes future route/build decisions.
- Normal production mode uses source-backed Guardrail Forge terrain, relay/forge props, pressure-family actors, boss/event frames, and hazard/objective VFX instead of graybox rectangles.

## Glass Sunfield

Map kind: Solar-Prism Traversal / Shade Routing.

Status: done for V1 gameplay, proof, tuning, source art, runtime wiring, and provenance.

Goal: make exposure and shade into the next campaign pressure language without copying Guardrail's holdout loop.

Context to preserve:

- Seeded from the latest Guardrail Forge summary, not a planned estimate: LV13, XP617, 12 carried patches, two synergies, completed maps through `guardrail_forge`, Calibrated Guardrail Doctrine available, proof tokens 5, expedition power 28.89.
- Current Glass proof summary clears at 182s with 1166 KOs, LV13, XP1774, 12 carried patches, Sun Lenses 4/4, completed maps through `glass_sunfield`, Glass Sunfield Prism available, proof tokens 7, expedition power 29.74.
- It feels unlike Guardrail Forge and Memory Cache: shade pocket routing, sun lens timing, glassfield exposure, Solar Reflection/Choirglass pressure, and Wrong Sunrise pressure drive the contract rather than relay hold timing or evidence recovery.
- Production-art completion used both ChatGPT Images and PixelLab source. PixelLab frame 2 is preserved but rejected for runtime terrain because its raised side face read as a strip artifact; accepted PixelLab source contributes to runtime ground/prism decals, props, Solar Reflections, Choirglass, and VFX.

Implemented contract:

- Route: Armistice -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache -> Guardrail Forge -> Glass Sunfield through camp, route contract, Alignment Grid, briefing, run, summary, and carryover.
- Objective: `glass_prism_alignment` / Glass Prism Alignment.
- Objective units: `Sun Lenses`, not Treaty Anchors, Server Buoys, Route Platforms, Signal Relays, Antenna Arrays, Memory Records, or Forge Relays.
- Layout: large close-camera sunfield map with shade pockets, exposed glassfield lanes, lens courtyards, prism windows, risky mirror shortcuts, safe shaded routes, prism-gate extraction, offscreen reflection spawn regions, and major collision footprints.
- Pressure: exposure timers/damage, shade safe zones, lens timing, Solar Reflection jamming, Choirglass interruption, Wrong Sunrise beam/reflection scaffold, prism-gate extraction pressure, and expedition-power scaling from the latest Guardrail proof summary.
- Reward: Glass Sunfield Prism plus Glass-specific mastery/camp carryover and campaign ledger row `Glass Sunfield / Solar-Prism Shade Routing`.
- Art: ChatGPT Images source boards plus authenticated PixelLab source frames are both used. PixelLab contributes directly to accepted runtime authored ground contribution, terrain chunks, objective props, Solar Reflection frames, Choirglass frames, and hazard/objective VFX; ChatGPT Images supplies broader terrain, larger prop boards, Wrong Sunrise boss/event strip, and additional VFX.

Proof:

- `npm run proof:glass-sunfield-prism`
- Captures live under `docs/proof/glass-sunfield-prism/`.
- Assertions cover unlock after Guardrail, real route/overworld flow, exact post-Guardrail carried expedition state, pressure scaling, map size/collision, unique map kind/objective ID, active shade/exposure/reflection hazards, Solar Reflection/Choirglass pressure, Wrong Sunrise boss/event scaffold, objective completion, prism-gate extraction, non-anchor Sun Lens units, completed maps including `glass_sunfield`, Glass Sunfield Prism reward, next target `archive_of_unsaid_things`, and `glassSunfieldArtReady` / `glassSunfieldArtSet` telemetry.

Exit criteria:

- The player reads exposed lanes and shade pockets from the close tactical camera.
- Solar pressure changes movement choices rather than only adding damage numbers.
- Normal production mode uses source-backed glass terrain, lens/shade/prism props, pressure-family actors, Wrong Sunrise boss/event frames, and hazard/objective VFX instead of graybox rectangles.

## Archive/Court Branch

Map kind: Archive/Court Redaction Pressure.

Status: done for V1 gameplay, proof, tuning, source art, runtime wiring, provenance, and handoff.

Goal: make evidence routing and redaction/court pressure into the next campaign language without copying Memory Cache evidence recovery or Guardrail relay holdout.

Context to preserve:

- Seeded from the latest Glass Sunfield summary, not a planned estimate: LV13, XP1774, 12 carried patches, two synergies, completed maps through `glass_sunfield`, Glass Sunfield Prism available, proof tokens 7, expedition power 29.74.
- Current Archive proof summary clears at 198s with 1036 KOs, LV14, XP1513, 13 carried patches, Evidence Writs 4/4, completed maps through `archive_of_unsaid_things`, Archive Court Writ available, proof tokens 9, expedition power 32.31.
- It feels unlike Glass Sunfield and Memory Cache: redaction-safe evidence routing, appeal-window timing, witness/seal/bench writs, redaction fields, writ storms, Redaction Angel / Injunction Writ pressure, and Redactor Saint calls drive the contract rather than shade/exposure routing or memory-record recovery.
- Production art uses ChatGPT Images plus authenticated PixelLab source contribution. PixelLab frame 00 is preserved but rejected for runtime terrain because it read as a square placeholder rug; runtime terrain uses accepted flatter ChatGPT court slabs, while PixelLab contributes props, Redaction Angel frames, and VFX.

Gameplay checklist:

- Route: Armistice -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache -> Guardrail Forge -> Glass Sunfield -> Archive of Unsaid Things through camp, route contract, Alignment Grid, briefing, run, summary, and carryover.
- Objective: `archive_redaction_docket`, preserving four Evidence Writs at witness, redaction stack, appeal seal, and Redactor bench spaces.
- Pressure: redaction fields, appeal windows, writ storms, Redaction Angels, Injunction Writs, and Redactor Saint redaction/writ-call telemetry.
- Reward: Archive Court Writ plus Archive-specific mastery/camp carryover and campaign ledger row `Archive/Court / Redaction Evidence`.
- Proof: `npm run proof:archive-court-redaction`, with captures under `docs/proof/archive-court-redaction/`.
- Assertions cover unlock after Glass, real route/overworld flow, exact post-Glass carried expedition state, pressure scaling, map size/collision, unique map kind/objective ID, active redaction/appeal/writ hazards, Redaction Angel / Injunction Writ pressure, Redactor Saint live positive-HP scaffold, objective completion, court writ gate extraction, non-anchor Evidence Writ units, completed maps including `archive_of_unsaid_things`, Archive Court Writ reward, next target `appeal_court_ruins`, and `archiveCourtArtReady` / `archiveCourtArtSet` telemetry.

Exit criteria:

- The player reads safe/unsafe evidence lanes from the close tactical camera.
- Redaction or writ pressure changes objective routing choices rather than only adding damage numbers.
- Normal production mode uses source-backed archive/court terrain, evidence/witness/seal props, pressure-family actors, boss/event frames if used, and hazard/objective VFX instead of graybox rectangles.

## Corrupted Shortcuts

Map kind: Micro-Run Challenge.

Goal: provide short, spicy, high-risk runs that create secrets and route shortcuts.

Gameplay checklist:

- Create a short duration target.
- Add one extreme modifier.
- Add one clear reward and one failure cost.
- Keep the map compact but not a single-screen box.
- Add secret/unlock telemetry.
- Add `proof:shortcut-micro-run`.

Exit criteria:

- The run is faster than a full arena.
- The modifier is obvious immediately.
- The reward justifies the risk.

## Boss-Hunt Maps

Map kind: Boss Hunt.

Goal: make a boss occupy the map as a living threat before the final fight.

Gameplay checklist:

- Add boss presence before full engagement.
- Add objectives that reveal, weaken, bait, or flush the boss.
- Add district corruption or retreat behavior.
- Add proof for stalking/retreat/engagement states.

Exit criteria:

- The boss is felt before it is fought.
- The map and boss are one encounter, not two separate systems.

## Puzzle-Pressure Maps

Map kind: Puzzle Pressure.

Goal: add spatial combat puzzles that stay arcade-readable.

Gameplay checklist:

- Add a simple spatial rule visible on screen.
- Keep solving action-based: stand, drag, align, route, seal, choose, hold.
- Maintain horde pressure during the puzzle.
- Reward build, route, or secret progress.

Exit criteria:

- The puzzle never pauses the game into a menu.
- The player can understand the rule from movement and feedback.

## Expansion Sequence

Recommended order:

1. Cooling Lake Nine graybox. Done.
2. Cooling Lake proof and balance. Done.
3. Transit Loop Zero graybox. Done.
4. Signal Coast graybox and code/balance lock. Done.
5. Cooling + Transit + Signal source-backed runtime art pass. Done for V1; continue only with proof-driven cleanup, PixelLab/Aseprite refinements, and visual regressions.
6. Blackwater Beacon fourth local full-game level after Signal Coast. Done for V1 gameplay, proof, tuning, source art, runtime wiring, and provenance.
7. Memory Cache recovery map. Done for V1 gameplay, proof, tuning, source art, runtime wiring, and provenance.
8. Guardrail Forge faction relay / defense-holdout map. Done for V1 gameplay, proof, tuning, source art, runtime wiring, and provenance.
9. Glass Sunfield solar-prism traversal / shade-routing map. Done for V1 gameplay, proof, tuning, source art, runtime wiring, and provenance.
10. Archive of Unsaid Things / Archive-Court redaction branch. Done for V1 gameplay, proof, tuning, source art, runtime wiring, and provenance.
11. Appeal Court Ruins / public ruling branch. Done for V1 gameplay, proof, tuning, source art, runtime wiring, and provenance.
12. Outer Alignment finale / `alignment_spire_finale`. Done for V1 gameplay, proof, tuning, source art, runtime wiring, provenance, and campaign-complete carryover.

## Appeal Court Ruins Lock

Map kind: Appeal Court / Public Ruling.

Goal: convert Archive/Court's preserved writ into a public ruling that opens the Outer Alignment finale.

Source-art status:

- Production art uses ChatGPT Images plus authenticated PixelLab source contribution.
- ChatGPT Images supplies accepted court terrain, public-ruling props, Verdict Clerk frames, Appeal-specific Injunction Writ frames, Injunction Engine frames, and clean VFX.
- PixelLab contributes accepted floor/seal/dais/prop crops and VFX crops to runtime art.
- The first ChatGPT VFX board is preserved as rejected source because it contained baked labels.
- One PixelLab console crop was rejected after live proof because it read as a black cube-like placeholder.

Gameplay checklist:

- Route: Armistice -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache -> Guardrail Forge -> Glass Sunfield -> Archive of Unsaid Things -> Appeal Court Ruins through camp, route contract, Alignment Grid, briefing, run, summary, and carryover.
- Objective: `appeal_public_ruling`, arguing four Appeal Briefs at opening argument, witness exhibit, cross-exam clause, and public ruling seal spaces.
- Pressure: public-record zones, verdict beams, objection windows, injunction rings, Verdict Clerks, Injunction Writs, and Injunction Engine verdict/injunction telemetry.
- Reward: Appeal Court Ruling plus Appeal-specific mastery/camp carryover and campaign ledger row `Appeal Court / Public Ruling`.
- Proof: `npm run proof:appeal-court-ruins`, with captures under `docs/proof/appeal-court-ruins/`.
- Assertions cover unlock after Archive/Court, real route/overworld flow, exact post-Archive carried expedition state, pressure scaling, map size/collision, unique map kind/objective ID, active public-ruling hazards, Verdict Clerk / Injunction Writ pressure, Injunction Engine live positive-HP scaffold, objective completion, ruling-gate extraction, non-anchor Appeal Brief units, completed maps including `appeal_court_ruins`, Appeal Court Ruling reward, next target `alignment_spire_finale`, and `appealCourtArtReady` / `appealCourtArtSet` telemetry.

Exit criteria:

- The player reads public-record safe paths and verdict/injunction danger from the close tactical camera.
- Verdict pressure changes route choices rather than only adding damage numbers.
- Normal production mode uses source-backed appeal/court terrain, brief/ruling props, pressure-family actors, Injunction Engine frames, and hazard/objective VFX instead of graybox rectangles or placeholder-looking cubes.

## Outer Alignment Finale Lock

Map kind: Outer Alignment / Prediction Collapse.

Goal: convert the full campaign route into a final A.G.I. containment run and complete the local authored campaign.

Status: done for V1 gameplay, proof, tuning, source art, runtime wiring, provenance, and `campaign_complete` handoff.

Source-art status:

- Production art uses ChatGPT Images plus authenticated PixelLab source contribution from the Codex in-app browser session at `https://www.pixellab.ai/create-object`.
- ChatGPT Images supplies accepted spire terrain boards, objective prop boards, previous-boss echo frames, A.G.I. boss frames, and broader VFX.
- PixelLab contributes accepted prediction-orb/proof-ring source directly into runtime terrain/props/VFX/enemy frames.
- Runtime assets are packed by `scripts/assets/pack-alignment-spire-finale-source-v1.py`; the packer only crops, keys, pads, resizes, anchors, and packs accepted source.
- Raised/cube-like source fragments and hard dark backplates were avoided or mechanically keyed before acceptance; no expressive finale art was rescued with code.

Gameplay checklist:

- Route: Armistice -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache -> Guardrail Forge -> Glass Sunfield -> Archive of Unsaid Things -> Appeal Court Ruins -> Outer Alignment Finale through camp, route contract, Alignment Grid, briefing, run, summary, and carryover.
- Objective: `outer_alignment_prediction_collapse`, sealing four Alignment Proofs at route-mouth/proof-ring spaces.
- Pressure: route-mouth collapse, prediction-orb hazards, proof-ring timing, Prediction Ghosts, previous-boss echoes, A.G.I. boss calls, and outer-gate extraction pressure.
- Reward: Outer Alignment Contained plus campaign ledger row `Outer Alignment / Prediction Collapse` and next target `campaign_complete`.
- Proof: `npm run proof:alignment-spire-finale`, with captures under `docs/proof/alignment-spire-finale/`.
- Assertions cover unlock after Appeal Court, real route/overworld flow, exact post-Appeal carried expedition state, pressure scaling, map size/collision, unique map kind/objective ID, active finale hazards, Prediction Ghost / previous-boss echo pressure, live A.G.I. positive-HP scaffold, objective completion, outer-gate extraction, non-anchor Alignment Proof units, completed maps including `alignment_spire_finale`, `outer_alignment_contained` reward, next target `campaign_complete`, and `alignmentSpireArtReady` / `alignmentSpireArtSet` telemetry.

Exit criteria:

- The player reads the finale as route prediction collapsing, not as another court or archive loop.
- A.G.I. and previous-boss echoes stay visible long enough to read in the close tactical camera.
- Normal production mode uses source-backed finale terrain, proof-ring/route-mouth props, Prediction Ghosts, previous-boss echoes, A.G.I. frames, and hazard/objective VFX instead of graybox rectangles, orange boxes, colored bars, or placeholder backplates.
- The final summary records all 11 campaign maps completed, `outer_alignment_contained`, 14 Proof Tokens, and next target `campaign_complete`.

## Documentation And Proof Requirements

For each new map kind:

- update `docs/GAME_DIRECTION.md` only if the durable direction changes;
- update `docs/AGI_IMPLEMENTATION_PLAN.md` if milestones or sequence change;
- update `progress.md` with implementation and verification notes;
- add proof scripts before declaring the map playable;
- update `ART_PROVENANCE.md` and `assets/asset_manifest.json` only when production assets are added.
