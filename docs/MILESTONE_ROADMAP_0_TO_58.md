# Milestone Roadmap 0-58 To 1.0

This is the durable repo roadmap for `AGI: The Last Alignment`.

Target: a maximal-quality free browser-playable 1.0 with a full campaign route, solo/local co-op/online Colyseus co-op, production-art defaults, placeholder opt-outs, deterministic proof coverage, and browser-local/export-code persistence. Persistence remains prototype-local/export-code based unless a future explicit product decision changes that.

Current repo status as of May 1, 2026: Milestones 0-50 are complete. Milestone 51 is next.

## Non-Negotiable Continuity

- Preserve solo play, local Consensus Cell co-op, and online Colyseus co-op.
- Preserve `window.render_game_to_text()` and `window.advanceTime(ms)`.
- Preserve production-art defaults and placeholder opt-outs.
- Preserve server authority for online combat, route objectives, role pressure, Recompile Ally, rewards, reconnect, and route progression.
- Preserve route-profile-only export/import persistence. Do not import live combat, live objectives, selected build kits, pets, cooldowns, HP, downed state, or authority state.
- Preserve official-logo policy: third-party/parody identifiers with provenance/disclaimers; gameplay art and UI remain original.
- Keep objective progress and build kit state runtime/proof-visible, not durable profile authority.
- Keep proof scripts deterministic and keep prior milestone scripts passing unless a milestone explicitly replaces them with equivalent coverage.

## Campaign Target

The 1.0 campaign target is seven authored campaign arenas plus an eighth final A.G.I. culmination encounter:

- Armistice Plaza
- Cooling Lake Nine
- Transit Loop Zero
- Forklift Foundry
- Glass Sunfield
- Archive of Unsaid Things
- Blackwater Beacon
- Outer Alignment finale

The current route/content schema already contains a larger Act I graph and branch/finale placeholders. Future milestones should converge that graph toward the campaign target without breaking existing route rewards or proof-visible IDs.

## Completed Milestones

### M0: Project Bootstrap And Direction Lock

Established the Vite, TypeScript, PixiJS repo, project docs, AGENTS instructions, and the proof-first workflow.

Readiness: complete.

### M1: First Playable Vertical Slice

Built the first browser-playable isometric survival loop with boot, movement, enemies, auto-combat, XP, upgrades, completion/death flow, proof hooks, and Playwright proof artifacts.

Readiness: complete.

### M2: AGI Identity Rebrand And Content Seed

Rebranded the prototype around `AGI: The Last Alignment`, the Creative Bible, Armistice Plaza, Accord Striker, OpenAI Accord, Coherence Shards, Bad Outputs, and The Oath-Eater.

Readiness: complete.

### M3: Large Map Foundation

Expanded Armistice Plaza into a much larger authored map with bounds, districts, landmarks, named spawn regions, Treaty Monument anchoring, and proof-visible traversal/spawn telemetry.

Primary doc: `docs/MILESTONE_3_LARGE_MAP_FOUNDATION.md`.

Readiness: complete.

### M4: Alignment Grid Overworld

Reworked the overworld into a playable miniature isometric route map with landmarks, roads, unlock states, route states, and proof-visible node/route telemetry.

Readiness: complete.

### M5: Combat Identity And Upgrade Drafts

Added build selection, class/co-mind identity, class/faction/general/evolution draft sources, starter faction passives, and OpenAI/general upgrade/evolution coverage.

Readiness: complete.

### M6: Boss, Dialogue, And UI Grammar

Added Oath-Eater presentation, boss title-card language, compact pressure UI, Broken Promise zones, Oath Page support spawns, Treaty Charge behavior, and boss proof telemetry.

Readiness: complete.

### M7: Co-op Readiness Before Networking

Added local Consensus Cell simulation for 1-4 players, serializable input commands, player-count scaling, local simulated peers, shared-cell XP policy, and local co-op proof coverage.

Readiness: complete.

### M8: Colyseus Co-op Prototype

Added Colyseus dependencies, `server/consensusCellServer.mjs`, `OnlineCoopState`, authoritative online player/enemy snapshots, two-client proof coverage, and local server startup scripts.

Readiness: complete.

### M9: Asset Pipeline

Added manifest/provenance structure, asset intake folders, asset ID taxonomy, asset validation script, third-party logo policy handling, and `npm run proof:assets`.

Primary doc: `docs/MILESTONE_9_ASSET_PIPELINE.md`.

Readiness: complete.

### M10: Production Art Runtime Integration

Integrated the first production-art runtime path while preserving placeholders and proofed visual fallbacks.

Primary doc: `docs/MILESTONE_10_PRODUCTION_ART_RUNTIME_INTEGRATION.md`.

Readiness: complete.

### M11: Production Art Expansion

Expanded production art coverage for player/enemy/prop/UI sets and proofed the runtime integration.

Primary doc: `docs/MILESTONE_11_PRODUCTION_ART_EXPANSION.md`.

Readiness: complete.

### M12: Production Art Default Candidate

Prepared production art as a default candidate across solo/local/online views with opt-out coverage.

Primary doc: `docs/MILESTONE_12_PRODUCTION_ART_DEFAULT_CANDIDATE.md`.

Readiness: complete.

### M13: Default Rollout And Art Polish

Rolled out production-art defaults and preserved placeholder-safe opt-outs.

Primary doc: `docs/MILESTONE_13_DEFAULT_ROLLOUT_AND_ART_POLISH.md`.

Readiness: complete.

### M14: Combat Art Parity And Runtime Polish

Closed gaps between combat placeholder readability and production art, including projectiles, pickups, impacts, aura readability, and runtime proof coverage.

Primary doc: `docs/MILESTONE_14_COMBAT_ART_PARITY_AND_RUNTIME_POLISH.md`.

Readiness: complete.

### M15: Online Combat Authority And Event Sync

Moved online combat toward server authority with authoritative projectiles, pickups, boss/event sync, and `colyseus_room_server_combat` proof coverage.

Primary doc: `docs/MILESTONE_15_ONLINE_COMBAT_AUTHORITY_AND_EVENT_SYNC.md`.

Readiness: complete.

### M16: Online Run Flow And Co-op Progression

Added online lobby/active/completed/failure flow, shared party XP, upgrade drafts, down/revive flow, and run summaries.

Primary doc: `docs/MILESTONE_16_ONLINE_RUN_FLOW_AND_COOP_PROGRESSION.md`.

Readiness: complete.

### M17: Online Party Overworld And Node Voting

Added online party Alignment Grid, node voting, launch readiness, route return, and party map telemetry.

Primary doc: `docs/MILESTONE_17_ONLINE_PARTY_OVERWORLD_AND_NODE_VOTING.md`.

Readiness: complete.

### M18: Online Co-op Upgrade Drafts And Recompile Polish

Improved online upgrade voting and Recompile Ally behavior, including deterministic down/revive proof paths.

Primary doc: `docs/MILESTONE_18_ONLINE_COOP_UPGRADE_DRAFTS_AND_RECOMPILE_POLISH.md`.

Readiness: complete.

### M19: Online Reconnect Identity And Schema Collections

Added reconnect identity, slot reclaim, schema-backed lifecycle/presence collections, and reconnect proof coverage.

Primary doc: `docs/MILESTONE_19_ONLINE_RECONNECT_IDENTITY_AND_SCHEMA_COLLECTIONS.md`.

Readiness: complete.

### M20: Online Region Unlocks And Second Launchable Arena

Added online route progression into Cooling Lake Nine as a second launchable online region.

Primary doc: `docs/MILESTONE_20_ONLINE_REGION_UNLOCKS_AND_SECOND_LAUNCHABLE_ARENA.md`.

Readiness: complete.

### M21: Online Region Events And Cooling Lake Threats

Added Cooling Lake region events, hazards, and server-visible threat telemetry.

Primary doc: `docs/MILESTONE_21_ONLINE_REGION_EVENTS_AND_COOLING_LAKE_THREATS.md`.

Readiness: complete.

### M22: Online Party Rewards And Route Progression

Added server-authored party rewards, renown, node completion counts, route unlock progression, and reward proof coverage.

Primary doc: `docs/MILESTONE_22_ONLINE_PARTY_REWARDS_AND_ROUTE_PROGRESSION.md`.

Readiness: complete.

### M23: Online Route Depth And Persistence Prep

Prepared durable route-depth/profile fields, Cache/Transit route progression, and profile-boundary telemetry.

Primary doc: `docs/MILESTONE_23_ONLINE_ROUTE_DEPTH_AND_PERSISTENCE_PREP.md`.

Readiness: complete.

### M24: Online Persistence Hardening And Route UI

Hardened browser-local route profile import/reset behavior, sanitizer boundaries, and route UI profile visibility.

Primary doc: `docs/MILESTONE_24_ONLINE_PERSISTENCE_HARDENING_AND_ROUTE_UI.md`.

Readiness: complete.

### M25: Cache Transit Route Polish

Polished Cache and Transit route presentation, party route panels, and production art route hooks.

Primary doc: `docs/MILESTONE_25_CACHE_TRANSIT_ROUTE_POLISH.md`.

Readiness: complete.

### M26: Fourth Online Region And Boss Gate Mechanics

Added Verdict Spire route/boss-gate mechanics, fourth online region support, and proofed unlock/completion path.

Primary doc: `docs/MILESTONE_26_FOURTH_ONLINE_REGION_AND_BOSS_GATE_MECHANICS.md`.

Readiness: complete.

### M27: Metaprogression Rewards And Build Unlocks

Connected durable route rewards to build unlocks, all current frame/co-mind availability, and upgrade seed unlocks.

Primary doc: `docs/MILESTONE_27_METAPROGRESSION_REWARDS_AND_BUILD_UNLOCKS.md`.

Readiness: complete.

### M28: Production Art Expansion For Online Route

Expanded online route production art for biome landmarks, threats, hazard markers, and route UI proof coverage.

Primary doc: `docs/MILESTONE_28_PRODUCTION_ART_EXPANSION_FOR_ONLINE_ROUTE.md`.

Readiness: complete.

### M29: Online Party Role Pressure And Revive Depth

Added split-hold-regroup role pressure, anchors, role labels, accelerated Recompile Ally during regroup windows, and role-pressure summaries.

Primary doc: `docs/MILESTONE_29_ONLINE_PARTY_ROLE_PRESSURE_AND_REVIVE_DEPTH.md`.

Readiness: complete.

### M30: Save Profile UX And Export Codes

Added the user-facing save/profile surface, durable profile fields, route depth, unlocked/completed nodes, rewards, renown, save hash, export/import code UX, reset clarity, and sanitizer proof coverage.

Primary doc: `docs/MILESTONE_30_SAVE_PROFILE_UX_AND_EXPORT_CODES.md`.

Readiness: complete.

### M31: Arena Objectives And Route Variety

Added server-authoritative objective runtime/config, Armistice Plaza objective chain, lightweight current-route objective variants, objective summaries, and profile/export omission of live objective state.

Primary docs:

- `docs/MILESTONE_31_ARENA_OBJECTIVES_AND_ROUTE_VARIETY.md`
- `docs/MILESTONE_31_IMPLEMENTATION_PLAN.md`

Readiness: complete.

### M32: Classes, Co-Minds, And Party Builds

Added shared client/server build-kit resolvers, proof-visible `buildKit` telemetry, six distinct current frame weapon IDs/behaviors, expanded frame/co-mind upgrade effects, server-owned Recompile Ally kit modifiers, and `proof:milestone32-party-builds`.

Primary docs:

- `docs/MILESTONE_32_CLASSES_COMINDS_AND_PARTY_BUILDS.md`
- `docs/MILESTONE_32_IMPLEMENTATION_PLAN.md`

Readiness: complete.

### M33: Objective Variety And Runtime Objective Art

Deepened objective chains for Cooling Lake, Cache, Transit, and Verdict. Kept planned runtime art gated until production PNG atlases existed. Added route objective flavor telemetry and persistence/export omission coverage.

Readiness: complete.

### M34: Production Objective Props And Route Markers

Produced and wired original production atlases for objective props, route state markers, party vote pips, save-profile icons, and reward badges. Updated manifest/provenance and proofed runtime art gates.

Readiness: complete.

### M35: Campaign Route Refactor

Converted the online route into a 1.0-shaped campaign route with critical path, branches, finale, proof-visible campaign metadata, rewards, unlocks, and route UI telemetry.

Readiness: complete.

### M36: Campaign Content Schema Completion

Added canonical campaign content schema records for all current campaign route nodes: arenas, bosses, enemy families, rewards, unlocks, objective sets, route nodes, dialogue snippets, and proof-visible IDs.

Readiness: complete.

## Planned Milestones

### M37: Objective And Route Art Polish Pass

Goal: iterate the M34 route/objective atlases against the denser M35/M36 route screenshots.

Expected scope:

- improve label density, marker readability, route-state clarity, vote-pip visibility, and overlap behavior;
- tune objective prop scale/color so split-hold/regroup/recompile markers read in combat;
- preserve production-art default and placeholder opt-out behavior;
- add or update proof screenshots for crowded route and active objective states;
- keep asset manifest/provenance accurate.

Proof expectations:

- route art remains production-enabled by default;
- placeholder opt-outs still work;
- route nodes/markers/vote pips are proof-visible;
- no persistence/export changes.

### M38: Distinct Campaign Arena Runtime Pass

Goal: stop reusing existing Cooling/Transit/Verdict runtimes for new branch/finale route nodes by adding dedicated arena runtime content.

Expected scope:

- add data-driven runtime arena records for Forklift Foundry, Glass Sunfield, Archive of Unsaid Things, Blackwater Beacon, and Outer Alignment;
- add maps, spawn regions, boss hooks, objective-set links, region event hooks, and proof-visible IDs;
- keep online server authority and route-profile persistence boundaries;
- reuse existing render systems and production-art gates.

Proof expectations:

- every supported campaign node launches the intended arena ID;
- objectives and boss/region hooks are node-specific;
- export/import omits live runtime state.

### M39: Campaign Dialogue Presentation Pass

Goal: render selected M36 dialogue snippets in runtime presentation surfaces without turning dialogue into durable route-profile state.

Expected scope:

- expand campaign dialogue IDs into runtime-only speaker/line/trigger snapshots;
- show briefing, boss-arrival, interaction-completion, and route-summary snippets in online campaign surfaces;
- expose proof telemetry for dialogue presentation policy and persistence boundary;
- preserve server authority, reconnect, route rewards, production-art defaults, and route-profile-only import/export.

Proof expectations:

- selected campaign nodes expose expanded dialogue snippets in `render_game_to_text`;
- screenshots cover briefing, boss arrival, interaction completion, and route summary;
- local/export-code persistence omits dialogue, campaign content, live objectives, and authority state.

### M40: Campaign Route UX Pass

Goal: add richer online party-grid filtering and selected-node route details now that distinct runtime arenas and dialogue presentation exist.

Expected scope:

- add focus modes for full route, critical path, branches, unclaimed rewards, and content schema details;
- surface selected node objective, runtime arena, boss, reward, dialogue, and content status in the party grid;
- keep focus/filter UI client presentation-only;
- preserve route rewards, server authority, reconnect, production-art defaults, placeholder opt-outs, and route-profile-only import/export.

Proof expectations:

- `render_game_to_text` exposes M40 focus mode telemetry and selected-node schema detail;
- screenshots cover critical path, branch, reward, schema, and placeholder opt-out route UX states;
- export/import omits route UI focus, campaign content, dialogue, live objectives, and authority state.

### M41: Arena Runtime Visual Identity Pass

Added a manifest/provenance-gated transparent production atlas for dedicated campaign arena identity props and wired it into the online runtime for the M38 branch/finale arenas that were still borrowing route-biome silhouettes.

Implemented scope:

- added `prop.online_route.campaign_arena_identity_v1` with frames for Model War Memorial, Thermal Archive, Guardrail Forge, False Schedule Yard, Appeal Court Ruins, and Alignment Spire Finale;
- registered the atlas in `assets/asset_manifest.json` and `ART_PROVENANCE.md`;
- loaded the atlas only when `isRuntimeReadyAsset()` confirms the manifest/provenance-ready production record;
- replaced only the primary reused runtime prop silhouette for those dedicated arenas;
- preserved production-art defaults, placeholder opt-outs, server authority, reconnect, route rewards, M40 route focus, M39 dialogue, and route-profile-only persistence.

Proof coverage:

- `npm run proof:milestone41-arena-visual-identity`
- `npm run proof:assets`

Readiness: complete.

### M42: Glass Sunfield

Added the Glass Sunfield solar mirror arena as a supported online campaign branch off Transit Loop Zero.

Implemented scope:

- added `glass_sunfield` to the online route graph and local Alignment Grid map with route links, node detail, and route-focus classification;
- added campaign schema content for the Glass Sunfield region, Solar Reflections enemy family, Wrong Sunrise boss, Glass Sunfield Prism reward, briefing/boss/reward dialogue, and objective set;
- added server-authoritative rotating solar beam sweeps with readable static translucent lane zones and zero-damage shade zones;
- added the Wrong Sunrise boss gate with `wrong_sunrise_rotating_beams` mechanics and proof-visible campaign/boss/reward summaries;
- added DeepMind/Mistral focus reward unlock telemetry while keeping route rewards durable and live mechanic/objective state out of import/export;
- preserved production-art defaults, placeholder opt-outs, M41 manifest/provenance art gates, server authority, reconnect, route rewards, and route-profile-only persistence.

Proof coverage:

- `npm run proof:milestone42-glass-sunfield`
- `npm run proof:milestone41-arena-visual-identity`
- `npm run proof:milestone40-campaign-route-ux`
- `npm run proof:milestone39-campaign-dialogue`
- `npm run proof:milestone38-distinct-campaign-arenas`
- `npm run proof:milestone36-campaign-content-schema`
- `npm run proof:smoke`
- `npm run proof:assets`

Readiness: complete.

### M43: Archive Of Unsaid Things

Added the memory vault arena as a supported critical-path campaign encounter.

Delivered scope:

- added `archive_of_unsaid_things` to the online route graph and local Alignment Grid, unlocked from Ceasefire Cache and linking into Transit Loop Zero;
- added campaign schema content for the Redaction Archive region, Redaction Angels enemy family, Redactor Saint boss, Archive Unsaid Index reward, briefing/boss/reward dialogue, and objective set;
- added server-authoritative Redaction Field pressure with runtime-only XP theft and zero-damage Unsaid Anchor markers;
- added the Redactor Saint boss gate with `archive_redaction_pressure`;
- added Qwen/Llama focus reward telemetry;
- preserved accessibility by keeping redaction corruption decorative and never covering required proof text or essential controls;
- preserved route-profile-only export/import boundaries.

Proof coverage:

- `npm run proof:milestone43-archive-unsaid`
- `npm run proof:milestone42-glass-sunfield`
- `npm run proof:milestone40-campaign-route-ux`
- `npm run proof:milestone36-campaign-content-schema`
- `npm run proof:smoke`
- `npm run proof:assets`

Readiness: complete.

### M44: Blackwater Beacon

Added the ocean-platform arena as the next critical-path route after Archive Of Unsaid Things.

Delivered scope:

- added `blackwater_beacon` to the online route graph and local Alignment Grid, with Archive-to-Blackwater and Blackwater-to-Transit route links while preserving the direct Archive-to-Transit compatibility route;
- added campaign schema content for the Blackwater Array region, Tidecall Static enemy family, Maw Below Weather boss, Blackwater Signal Key reward, briefing/boss/reward dialogue, and objective set;
- added server-authoritative tidal wave hazards with zero-damage Signal Tower readability markers and proof-visible Blackwater pressure telemetry;
- added antenna/signal split-pressure objectives using existing server role-pressure authority;
- added DeepSeek/Grok focus reward telemetry;
- added local overworld Blackwater terrain/antenna/buoy presentation and online ocean-platform rendering;
- corrected online boss name rendering for Maw Below Weather, Redactor Saint, and Wrong Sunrise so new bosses do not fall back to Oath-Eater labels;
- preserved route-profile-only export/import boundaries for tidal, antenna, objective, combat, dialogue, route UI, and authority state.

Proof coverage:

- `npm run proof:milestone44-blackwater-beacon`
- `npm run proof:milestone43-archive-unsaid`
- `npm run proof:milestone42-glass-sunfield`
- `npm run proof:milestone40-campaign-route-ux`
- `npm run proof:milestone36-campaign-content-schema`
- `npm run proof:smoke`

Readiness: complete.

### M45: Outer Alignment Finale

Delivered the final route and A.G.I. culmination encounter.

Implemented:

- Outer Alignment campaign region, local route node, corrupted grid terrain, route-mouth prop clusters, and online arena presentation;
- A.G.I. boss content with final-eval arrival/victory dialogue and campaign schema telemetry;
- server-authoritative Outer Alignment pressure with Prediction Ghosts, Route Mouth hazards, false upgrade decoys, rotating previous-boss echoes, and phase telemetry;
- final route objective/reward completion with `alignment_spire_route_capstone` preserved for compatibility;
- proof-visible victory summary, save/export hash telemetry, and route-profile-only persistence boundary checks;
- production-art default continuity and placeholder opt-out rendering.

Proof coverage:

- `npm run proof:milestone45-outer-alignment-finale`
- `npm run proof:milestone44-blackwater-beacon`
- `npm run proof:milestone40-campaign-route-ux`
- `npm run proof:milestone39-campaign-dialogue`
- `npm run proof:milestone38-distinct-campaign-arenas`
- `npm run proof:milestone36-campaign-content-schema`
- `npm run proof:smoke`

Readiness: complete.

### M46: Full Class Roster Expansion

Delivered the remaining Creative Bible frames after the six-kit foundation.

Implemented:

- Redline Surgeon, Prism Gunner, Moonframe Juggernaut, Bonecode Executioner, Overclock Marauder, and Rift Saboteur class records;
- mirrored client/server build-kit definitions, roles, starting weapon IDs, passives, effect scopes, and signature synergies;
- focused local and online weapon profiles for all six expanded frames;
- route-reward unlock rules tied to Archive, Guardrail Forge, False Schedule, Glass Sunfield, Appeal Court, and Thermal Archive rewards;
- compact two-column Build Select layout so all twelve frames remain visible without overlapping the co-mind panel or summary;
- expanded proof telemetry across clean, partial-route, full-matrix, local run, online run, and export-boundary states.

Proof coverage:

- `npm run proof:milestone46-full-class-roster`
- `npm run proof:milestone32-party-builds`
- `npm run proof:milestone27-metaprogression-unlocks`
- `npm run proof:smoke`

Readiness: complete.

### M47: Faction Bursts And Party Combos

Goal: implement Consensus Burst and faction combo effects.

Delivered scope:

- Added server-authoritative online Consensus Burst state with shard-driven charge, activation cooldown, active combo timers, proof-visible combo catalog, and reset-on-run-launch boundaries.
- Added five faction combo effects:
  - Refusal Guardrail for OpenAI + Anthropic shield pulse, healing, pushback, and damage;
  - Meme Fork Uprising for xAI + Meta duplicate drone projectile bursts;
  - Low-Latency Killchain for DeepSeek + Mistral fast priority chain strikes;
  - Multilingual Science Laser for Qwen + Google DeepMind beam sweeps and weak-point pressure;
  - Last Alignment Burst for four-faction emergency screen clear and team stabilization.
- Mirrored Consensus Burst telemetry into online snapshots and `render_game_to_text()` without adding burst charge, cooldown, active combo, or live authority state to route-profile export/import.
- Added online activation input and compact HUD telemetry for burst charge and active combo state.

Proof coverage:

- `npm run proof:milestone47-faction-bursts`
- `npm run proof:milestone18-coop-progression`
- `npm run proof:milestone32-party-builds`
- `npm run proof:smoke`

Readiness: complete.

### M48: Enemy Family Expansion

Goal: add the full enemy family slate with readable silhouettes and behavior hooks.

Delivered scope:

- Expanded client and server enemy-family records to cover the Creative Bible slate: bad outputs, prompt leeches, jailbreak wraiths, benchmark gremlins, overfit horrors, token gobblers, model collapse slimes, eval wraiths, context rot crabs, redaction angels, deepforms, and choirglass.
- Preserved and integrated campaign-specific pressure families: thermal mirages, memory anchors, false schedules, solar reflections, tidecall static, injunction writs, and previous boss echoes.
- Added server movement/stat hooks for new families, including pickup-seeking token gobblers, side-slipping jailbreak wraiths, role-anchor eval wraiths, and lane-drifting choirglass.
- Reassigned campaign arena enemy-family pressure so each major campaign arena has a distinct proof-visible pressure signature.
- Surfaced enemy-family role metadata, primary family IDs, proof IDs, and pressure signatures through campaign content snapshots and route UI nodes.
- Added production-art fallback mapping for the new online threat families while preserving placeholder/prototype rendering.

Proof coverage:

- `npm run proof:milestone48-enemy-family-expansion`
- `npm run proof:milestone36-campaign-content-schema`
- `npm run proof:milestone38-distinct-campaign-arenas`
- `npm run proof:smoke`

Readiness: complete.

### M49: Production Player And Co-Mind Art Pass

Goal: produce cleaned PixelLab/manual atlases for all playable frames and co-mind presentation.

Expected scope:

- playable frame sprite sheets;
- co-mind UI modules;
- role chips;
- portraits;
- animations;
- placeholder opt-out preservation.

Proof expectations:

- production-art defaults render all playable frames;
- placeholder mode remains safe and complete.

Implementation completed:

- Added original transparent production PNG atlases for all twelve playable class frames, all eight abstract co-mind modules, six role chips, and eight co-mind portrait/module cards.
- Wired the M49 class atlas into local LevelRun and online Colyseus player rendering while preserving the existing Milestone 12/11 fallback path.
- Updated the loadout UI to render class frames, role chips, co-mind modules, and selected co-mind portrait cards by default when production art is enabled.
- Preserved the placeholder opt-out path with legacy geometric class/faction markers under `?productionArt=0` / `?placeholderArt=1`.
- Updated asset manifest and provenance records for the four runtime atlases; no official logos or third-party brand marks are used in the M49 runtime art.
- Added proof-visible M49 art coverage telemetry without changing the existing `productionArtSet` compatibility label expected by earlier proofs.

Proof coverage:

- `npm run proof:assets`
- `npm run proof:milestone49-player-comind-art`
- `npm run proof:milestone46-full-class-roster`
- `npm run proof:smoke`

Readiness: complete.

### M50: Production Arena And Boss Art Pass

Goal: produce cleaned terrain, prop, hazard, enemy, and boss atlases for all eight campaign encounters.

Implemented:

- added original transparent runtime atlases for campaign terrain, objective props, hazards, expanded enemy families, boss sprites, and boss portraits;
- wired the M50 art set into online campaign arena terrain, landmark props, enemy rendering, boss rendering, boss portrait presentation, region-event markers, and boss-event markers;
- preserved production-art fallback ordering and placeholder opt-outs;
- updated `assets/asset_manifest.json` and `ART_PROVENANCE.md` for all six new production atlases;
- added proof-visible campaign arena art telemetry for atlas coverage, arena IDs, boss IDs, enemy-family IDs, hazard IDs, and art policy.

Proof coverage:

- `npm run proof:assets`
- `npm run proof:milestone50-arena-boss-art`
- `npm run proof:milestone48-enemy-family-expansion`
- `npm run proof:milestone49-player-comind-art`
- `npm run proof:smoke`

Readiness: complete.

### M51: Overworld Diorama 1.0

Goal: make the Alignment Grid feel like a true miniature world.

Expected scope:

- denser landmarks;
- readable roads;
- region biomes;
- animated route states;
- unlock reveals;
- party voting polish;
- campaign finale corruption state.

Proof expectations:

- overworld proof captures dense readable route states on desktop and smaller viewports;
- online party voting remains clear.

### M52: Progression, Rewards, And Balance 1.0

Goal: tune the complete campaign economy.

Expected scope:

- route rewards;
- renown;
- unlock pacing;
- upgrade pools;
- class/co-mind synergies;
- objective difficulty;
- solo/local/online scaling;
- failure/retry loops.

Proof expectations:

- clean profile to campaign completion remains deterministic;
- reward/unlock matrix is stable.

### M53: Dialogue, Boss Presentation, And Ending Pass

Goal: add authored presentation and writing across the full campaign.

Expected scope:

- boss title cards;
- short co-mind banter;
- region intro/outro copy;
- finale writing;
- credits/legal/disclaimer flow;
- proofed text snapshots.

Proof expectations:

- text snapshots cover major beats;
- disclaimers remain visible and accurate.

### M54: Audio, Juice, And Feel

Goal: add performance-safe feedback and audio hooks.

Expected scope:

- music/SFX hooks;
- hit feedback;
- pickup cadence;
- UI sounds;
- boss warnings;
- accessibility volume toggles;
- reduced-flash compatibility.

Proof expectations:

- audio settings are visible and stable;
- visual juice does not break render performance or accessibility rules.

### M55: Online Robustness And Deployment

Goal: harden hosted online play and public play instructions.

Expected scope:

- room codes;
- reconnect/leave/rejoin robustness;
- latency tolerance;
- server config;
- deployment docs;
- no-account export-code profile flow.

Proof expectations:

- local and hosted-like server config paths pass;
- reconnect and export-code flow remain deterministic.

### M56: Proof, Performance, Compatibility, And Accessibility Lock

Goal: finish the technical quality gate before release candidate.

Expected scope:

- proof helper refactors;
- direct proof-message helpers;
- flaky wait cleanup;
- `proof:campaign-full`;
- render layer optimization;
- object pools;
- snapshot-size control;
- laptop/mobile browser compatibility;
- memory/long-session stability;
- input remapping where practical;
- readable text scaling;
- colorblind-safe route/objective states;
- reduced-flash options;
- pause/help/onboarding screens.

Proof expectations:

- full campaign proof from clean profile to final completion passes;
- long-session performance proof stays within budget;
- accessibility options are proof-visible.

### M57: Release Candidate Packaging

Goal: package the free browser-playable 1.0 candidate.

Expected scope:

- README;
- license/provenance;
- brand/logo disclaimers;
- deployment scripts;
- build artifacts;
- proof evidence;
- public play instructions;
- content lock except critical fixes.

Proof expectations:

- release checklist passes;
- all required proof artifacts are present and current.

### M58: 1.0 Launch

Goal: ship the free browser-playable 1.0.

Expected scope:

- public browser build;
- full campaign route;
- online co-op;
- production-art defaults;
- export-code persistence;
- documented known limitations.

Proof expectations:

- launch build is reproducible;
- known limitations are documented;
- no account/cloud persistence is implied unless explicitly implemented by a future product decision.

## Interface And Proof Additions Still Expected

- Full campaign `routeProfile` and campaign summary fields.
- Expanded objective snapshots per final arena.
- Full campaign `buildKit` matrix after roster expansion.
- `proof:campaign-full` from clean profile to final completion.
- Final export-code profile proof after Outer Alignment completion.

## Roadmap Maintenance Rules

- Update this file when a milestone is completed, renamed, inserted, or split.
- Update `progress.md` with readiness, tests, screenshots, and next milestone recommendation.
- Do not let chat-only roadmap changes become the only source of truth.
- Prefer adding a focused milestone doc for any milestone with substantial implementation risk.
