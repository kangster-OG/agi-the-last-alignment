# AGI: The Last Alignment — Implementation Plan

This plan translates `docs/AGI_The_Last_Alignment_Creative_Bible.md` into buildable milestones for the existing PixiJS prototype.

## Current State

The repo currently contains a functional placeholder vertical slice:

- Vite + TypeScript + PixiJS.
- Isometric projection and camera.
- Overworld node entry.
- One small survival arena.
- Auto-combat, enemies, XP pickups, upgrades, miniboss, completion/death flow.
- Deterministic proof hooks and Playwright proof scripts.

The current snack/coupon/receipt content is throwaway scaffolding. Keep the systems where useful; replace the identity.

## Build Strategy

Do not try to build the whole bible at once.

The right next move is to convert the prototype into a durable AGI foundation:

1. Lock the real content schema and IDs.
2. Replace the placeholder theme with the first AGI region and arena.
3. Enlarge maps dramatically.
4. Separate simulation from rendering enough to support future Colyseus co-op.
5. Upgrade the overworld from abstract nodes into a dense Alignment Grid diorama.
6. Add art/asset pipeline hooks while still using placeholder/generated art.

Camera-scale rule: larger maps do not mean a zoomed-out combat board. Normal arena play should keep a close tactical isometric crop comparable to the reference point of view while the follow camera moves through a much larger authored level. This raises asset requirements because visible sprites, props, terrain, pickups, and VFX need enough real pixel detail to survive the closer camera.

## Milestone 0 — Repo Canonicalization

Goal: make the repo clearly become `AGI: The Last Alignment`.

Tasks:

- Preserve the Creative Bible in `docs/`.
- Update durable direction docs and AGENTS instructions.
- Add legal/parody disclaimer text for menu/credits/repository use.
- Add brand asset handling for official logos as third-party/parody faction identifiers.
- Add asset provenance tracking.
- Rename package/project metadata where appropriate.
- Keep all proof scripts working.

Exit criteria:

- Future Codex threads can understand the game by reading repo docs.
- Existing prototype still builds and proofs pass.

## Milestone 1 — AGI Content Data Foundation

Goal: move creative content into structured data so gameplay can be driven by the bible.

Add data modules for:

- Factions.
- Combat classes.
- Enemy families.
- Regions.
- Arenas.
- Bosses.
- Upgrades.
- UI/system message strings.

Use stable IDs from the bible:

- Starter class: `accord_striker`.
- Starter faction: `openai_accord`.
- First region: `armistice_zone`.
- First arena: `armistice_plaza`.
- First boss: `oath_eater`.
- Starter enemy family: `bad_outputs`.

Exit criteria:

- The current run state reads arena/faction/class/boss names from data instead of hardcoded snack placeholders.
- `render_game_to_text()` exposes selected class/faction/arena/boss IDs.

## Milestone 2 — Rebrand The Playable Vertical Slice

Goal: replace the current placeholder slice with the first real AGI slice.

Replace:

- `Snack Mire` -> `Armistice Plaza`.
- `Manager of Spoons` -> `The Oath-Eater`.
- XP pickups -> `Coherence Shards`.
- Level-up cards -> emergency patches.
- Death/victory copy -> Creative Bible UI tone.
- Placeholder enemies -> `Bad Outputs`, with at least one readable silhouette.
- Placeholder player -> `Accord Striker` + `OpenAI Accord Division`.

Add:

- Pre-arena briefing screen, three lines max.
- Boss warning/title card.
- Victory message: `ALIGNMENT NODE STABILIZED`.
- Death message: `FRAME DESTROYED`.
- Basic legal/parody disclaimer reachable from menu/credits.
- Initial logo/provenance placeholders for frontier factions if official logos are added in this milestone.

Exit criteria:

- The game reads as `AGI: The Last Alignment` from menu through run summary.
- The old snack/coupon theme is gone from user-facing text.
- Existing proofs are updated to assert AGI state names.

## Milestone 3 — Large Map Foundation

Goal: stop treating arenas as tiny combat boxes.

Detailed handoff: `docs/MILESTONE_3_LARGE_MAP_FOUNDATION.md`.

Implement:

- Larger arena dimensions.
- Camera-follow exploration with sensible bounds.
- Normal combat camera scale close enough that sprites, props, and terrain read as authored objects rather than tiny tokens.
- Spawn regions instead of center/near-player-only spawning.
- Off-screen enemy entry points.
- Landmark/sub-zone definitions inside an arena.
- Distributed props and terrain decals.
- Optional mini-objectives such as patch towers, relay points, or survival zones.

First target:

- `Armistice Plaza` should become a large ruined treaty-square/city-zone map with multiple sub-areas:
  - treaty monument
  - barricade corridor
  - crashed drone yard
  - emergency alignment terminal
  - cosmic breach crack

Exit criteria:

- The player can roam significantly before hitting boundaries.
- Enemies approach from believable off-screen or landmark sources.
- The player cannot see the whole arena at once, but the normal camera still feels close and readable.
- Proof scripts validate long traversal, not just static survival.

## Cross-Milestone Map-Type Contract

After the Armistice roguelite and reference-run passes, future arenas should be implemented as distinct map kinds, not palette swaps. Preserve the same core run language across all of them: close tactical camera, autocombat, horde pressure, emergency patch drafts, objective pressure, boss/event beats, and summary/camp carryover.

Pair this section with `docs/DIFFICULTY_AND_MAP_SCALING.md` before implementing a new arena. Every future map should declare not only its map kind, but also its difficulty layers and top pressure levers.

Every new playable map should declare:

- map type;
- objective type;
- pressure source;
- reward promise;
- boss/event pattern;
- proof path that validates those choices.

Initial map-type targets:

- `armistice_plaza`: Open Survival District. Treaty Anchors, faction relay pressure, Oath-Eater, Proof Token/mastery reward.
- `cooling_lake_nine`: Hazard Ecology. Server buoys, coolant/cable pressure, Prompt Leech lanes, Motherboard Eel, economy/burst reward.
- `transit_loop_zero`: Route / Transit. Platform alignment, false schedules, moving arrival events, Station That Arrives, movement/boss reward.
- `memory_cache_001`: Expedition / Recovery. Memory shard records, context rot, lore/secret unlocks, optional curator pressure.
- `accord_relay` / `guardrail_forge`: Faction Relay / Defense. Hold relay infrastructure, survive doctrine pressure, earn build or route rewards.
- corrupted shortcuts: Micro-Run Challenge. Short high-risk modifier runs with secret/unlock pressure.

Implementation note: build gameplay identity first with honest graybox/runtime systems, then do production-art source passes. Do not fake a new map's production look with code-authored terrain, filters, recolors, overlays, or procedural marks. Use Armistice as the fidelity contract when the art pass begins.

## Cross-Milestone Difficulty Contract

The post-Armistice campaign should use layered difficulty, not a single flat difficulty ladder.

Every new playable map should define:

- Baseline Contract;
- Eval Pressure hooks;
- Route Risk hooks;
- World Tier assumptions;
- Mastery Variant potential;
- primary and secondary difficulty levers;
- proof telemetry and screenshot path for those choices.

The canonical difficulty levers are:

- Density Pressure;
- Spatial Pressure;
- Objective Pressure;
- Boss Pressure;
- Draft Pressure;
- Economy Pressure;
- Information Pressure;
- Time Pressure;
- Co-op Pressure;
- Route Memory Pressure.

Implementation order for new maps:

1. Define the map's kind and difficulty emphasis.
2. Build the graybox/runtime objective honestly.
3. Add telemetry that proves the map identity and pressure levers.
4. Add a proof path and screenshots.
5. Tune baseline contract difficulty.
6. Only then begin production art using the Armistice accepted art baseline.

## Cross-Milestone Build-System Contract

Pair this section with `docs/BUILD_ARCHETYPES_AND_ITEMIZATION.md` before implementing new weapons, passives, emergency patches, route rewards, or fusions. Armistice proved the core loop; the full game now needs broad build identity.

Every run should be able to express a build thesis through:

- one primary auto-weapon;
- two to four secondary weapon protocols;
- six to ten passive processes;
- one Consensus Burst path;
- one to three protocol fusions/evolutions when the player builds intentionally;
- a rare rule-breaker, route reward, Treaty Anchor reward, or boss relic when appropriate.

Every build option must answer at least one player-facing question:

- what do I shoot;
- where do I move;
- what do I collect;
- how do I handle objectives;
- what fusion am I chasing;
- what risk am I accepting;
- how does this affect co-op positioning or rescue.

Full-game archetypes:

- Refusal Tank;
- Prediction Sniper;
- Swarm Compiler;
- Objective Engineer;
- Chaos Red-Team;
- Shard Economist;
- Time / Protocol Control;
- Co-op Relay.

Implementation note: do not add filler stat cards as headline upgrades. Raw damage/cooldown/pierce/health increases are acceptable as ranks or minor modifiers, but draft-defining choices should change behavior, targeting, movement, objectives, economy, co-op play, or fusion paths.

## Milestone 4 — Alignment Grid Overworld

Goal: evolve the overworld into a playable miniature world map.

Replace abstract tile-field nodes with:

- The Alignment Grid.
- Landmark nodes/buildings.
- Road/path routes that become stable when completed.
- Big pixel labels above enterable locations.
- `ENTER` prompt under active node label.
- Region-style visual language.
- Completed/uncompleted route states.

First overworld should include:

- `Armistice Plaza`
- `Cooling Lake Nine`
- `Transit Loop Zero`
- at least one `Faction Relay`
- at least one `Refuge Camp` or `Memory Cache`

Exit criteria:

- The overworld feels like a miniature world, not an icon board.
- Completing `Armistice Plaza` stabilizes the road to the next node.

## Milestone 5 — Combat Identity And Upgrade Drafts

Goal: make builds feel like combat class + co-mind + primary weapon + secondary protocols + passive processes, not generic stat cards.

Implement:

- Class selection shell, starting with `Accord Striker`.
- Faction co-mind selection shell, starting with `OpenAI Accord Division`.
- Base stats by class.
- Faction upgrade pools.
- General upgrade pool.
- Emergency patch draft UI.
- Primary auto-weapon content records.
- Secondary weapon protocol content records.
- Passive process content records.
- Major process / secondary protocol slot limits.
- Fusion/evolution recipe display.
- Rare rule-breaker content records.
- At least three upgrade evolution/fusion paths.

Starter build identity:

- Accord Striker: fast breach fighter, evasive movement, pickup range.
- OpenAI Accord Division: balanced, rerolls, shields, patch/refusal flavor.

Initial full-game build expansion target:

- Primary weapons: `vector_lance`, `signal_pulse`, `rift_mine`.
- Secondary protocols: `context_saw`, `patch_mortar`, `red_team_spike`.
- Passive processes: `coherence_indexer`, `field_triage_loop`, `anchor_bodyguard`, `prediction_priority`, `low_hp_adversary`.
- Fusions: `cathedral_of_no`, `causal_railgun`, `armistice_artillery`.
- Rare rule-breaker: `unbounded_context`.

Exit criteria:

- A run has visible class/faction identity.
- A run has visible weapon/protocol/passive identity.
- Draft cards show option family, protocol slot, tags, and fusion hints.
- At least four archetypes are viable inside Armistice without changing autocombat.
- Upgrade names and descriptions use stat-first gameplay copy plus AI terminology, combat words, and cosmic stupidity.
- `render_game_to_text()` exposes equipped primary, secondary protocols, passives, fusions, and rare rule-breakers.

## Milestone 6 — Boss / Dialogue / UI Grammar

Goal: add the reference-style big character moment without turning the game into a visual novel.

Implement:

- Boss title card system.
- Short dialogue overlay with portrait slots.
- AGI pressure warning.
- Boss mechanics scaffold for `The Oath-Eater`.
- HUD restyle toward emergency OS + meme-arcade UI.

Oath-Eater starter mechanics:

- Broken Promise hazard zones.
- Bad Output page-spawns.
- Treaty monument charge/impact attack.
- Optional temporary friendly-drone betrayal later.

Exit criteria:

- Boss arrival is memorable.
- Dialogue is short, funny, and immediately returns to action.

## Milestone 7 — Co-op Readiness Before Networking

Goal: prepare architecture for Colyseus without prematurely shipping multiplayer.

Refactor toward:

- Pure simulation update separate from Pixi rendering.
- Multiple player entities in local simulation.
- Serializable input commands.
- Server-friendly state snapshots.
- Per-player class/faction/build state.
- Player count scaling hooks.

Do not add Colyseus until the simulation/render split is healthy.

Exit criteria:

- Local simulation can support 2-4 player entities without network code.
- Proof hooks expose all players.

## Milestone 8 — Colyseus Co-op Prototype

Goal: first online co-op room.

Implement:

- Colyseus server package.
- `ConsensusCellRoom` with `maxClients = 4`.
- Client connection flow.
- Authoritative player input/state.
- Shared arena start.
- Basic enemy sync.
- Two-browser Playwright smoke proof.

Exit criteria:

- Two local browser clients can join one room and move independently in the same arena.
- Solo mode still works.

## Milestone 9 — Asset Pipeline

Goal: prepare production art without blocking gameplay.

Implement:

- `ART_PROVENANCE.md`.
- Asset manifest structure.
- Sprite atlas loading.
- Placeholder asset naming conventions.
- PixelLab production workflow notes.
- Manual cleanup checklist.

Exit criteria:

- Generated/imported assets have source/tool/license records.
- Sprite origins and iso feet alignment are documented.

## Proof Plan

Keep and expand existing proof scripts.

Required proofs after AGI rebrand:

- `proof:smoke`: menu -> overworld -> Armistice Plaza.
- `proof:movement`: screen-intuitive movement on large map.
- `proof:overworld`: Alignment Grid labels and node entry.
- `proof:horde`: Bad Outputs spawn and projectiles/Coherence Shards work.
- `proof:upgrades`: emergency patch draft appears and applies.
- `proof:boss`: Oath-Eater title/warning and boss state.
- `proof:full`: clear Armistice Plaza and stabilize route.

Later multiplayer proofs:

- two-client room join
- two-client movement
- revive/recompile flow
- 4-client room cap

## Immediate Next Implementation Recommendation

Start with Milestones 0-2 in one focused pass:

1. Add canonical data files for factions/classes/enemies/regions/arenas/bosses/upgrades.
2. Update menu/HUD/copy to AGI.
3. Replace current arena with Armistice Plaza names and first-pass visuals.
4. Update proof expectations and screenshots.
5. Run build and proof suite.

Then do Milestone 3 as the first major gameplay/level-design pass.
