# Milestone 31: Arena Objectives and Route Variety

## Goal

Scale online arena content beyond timed horde survival by adding a server-authoritative arena objective framework and moving arena-specific configuration out of the central online room path.

This milestone should make future arena pods easier to build in parallel without destabilizing:

- solo and local co-op;
- online Colyseus co-op;
- production-art defaults and placeholder opt-outs;
- `window.render_game_to_text()`;
- `window.advanceTime(ms)`;
- server-owned combat, rewards, route progression, reconnect, and persistence boundaries.

Milestone 31 should be mostly an architecture and first-content framework milestone. It should not attempt to finish every route objective in the game.

## Current Audit

### Arenas

- Local arena content starts in `src/content/arenas.ts` and is adapted through `src/level/arenas.ts`.
- Local `LevelRunState` currently always uses `ARMISTICE_PLAZA_MAP` from `src/level/armisticePlazaMap.ts`, even when an `arenaId` is passed.
- Local completion is still a simple survival/boss/kills condition:
  - boss appears at `arena.bossSeconds`;
  - completion requires target time plus boss defeat or enough kills.
- Local map data is already well-shaped for landmark and spawn-region objectives:
  - bounds;
  - player start;
  - boss spawn;
  - landmarks;
  - spawn regions;
  - prop clusters;
  - terrain bands.

### Online Arenas

- Online arena configs are defined inline in `server/consensusCellServer.mjs` as `ONLINE_ARENAS`.
- The online server currently owns combat-critical state correctly:
  - player movement and HP;
  - enemies;
  - projectiles;
  - pickups and XP;
  - upgrades;
  - boss state;
  - region hazards;
  - role-pressure anchors;
  - recompile state;
  - rewards;
  - route progression;
  - persistence export.
- Online arena-specific behavior is mixed into the room class through `if (arenaId === ...)` branches for:
  - boss HP/speed/color;
  - boss mechanics;
  - region event families;
  - hazard positions;
  - rewards;
  - role-pressure anchors;
  - static client rendering decisions.
- `OnlineConsensusSnapshot.schemaVersion` is currently `4`, and `networkAuthority` is `colyseus_room_server_combat`.

### Route Nodes

- Local overworld nodes/routes live in `src/overworld/alignmentGridMap.ts`.
- Online party nodes/routes are duplicated inline in `server/consensusCellServer.mjs` as `PARTY_NODES` and `PARTY_ROUTES`.
- Online route rewards are linked to arena completion through `applyNodeReward()` and browser-local persistence exports only durable route/profile state.
- Supported online route nodes currently include:
  - Armistice Plaza;
  - Cooling Lake Nine;
  - Ceasefire Cache;
  - Transit Loop Zero;
  - Verdict Spire.

### Region Events

- Online region events are server-owned and snapshot through `online.regionEvent`.
- Current event families include:
  - `broken_promise`;
  - `thermal_bloom`;
  - `boiling_cache`;
  - `false_track`;
  - `verdict_seal`;
  - `memory_anchor`.
- Event implementation is branch-driven in `updateRegionEvents()` and `spawnRegionHazard()`.

### Bosses

- Local Oath-Eater mechanics live in `LevelRunState`.
- Online boss mechanics live in `server/consensusCellServer.mjs` and vary by `arenaId`.
- Boss state snapshots already provide a usable proof surface through `online.bossEvent` and `level.bossMechanics`.

### Rewards And Persistence

- Rewards are server-owned and route-durable.
- Persistence export remains intentionally limited to route/profile state:
  - completed node IDs;
  - unlocked node IDs;
  - reward IDs;
  - party renown;
  - node completion counts;
  - recommendation;
  - route depth;
  - hash.
- Combat/run state must not be imported or exported as durable persistence.

### Proofs

- Proof coverage is broad, but milestone-specific online proof logic is concentrated in `scripts/proof/run-proof.mjs`.
- Existing online proof controls are message-based:
  - force XP;
  - force down;
  - force completion;
  - force role-pressure anchor assignment.
- Milestone 31 should add dev/proof controls for objective stepping, but those controls must remain proof-only and must not become gameplay authority on the client.

## Proposed Scope

### 1. Extract Arena And Objective Configs

Create a server-side online arena config module that owns data only.

Recommended new files:

- `server/data/onlineArenas.mjs`
- `server/data/onlineRoutes.mjs`
- `server/data/onlineObjectives.mjs`

The room should import these modules instead of defining all arena, route, reward, spawn, boss, region, and role-pressure data inline.

Keep this extraction conservative:

- no behavior rewrite first;
- same IDs;
- same rewards;
- same route unlocks;
- same snapshots;
- same proof outputs.

Then add objective config data on top of that extracted shape.

### 2. Add Objective Runtime State

Add a small server-owned objective runtime model:

- objective set ID;
- active objective phase;
- objective instances;
- per-instance progress;
- completion flags;
- failure flags where needed;
- timers;
- assigned route item counters;
- current objective hint text;
- completion reason.

Snapshot this as `online.objectives` and mirror the important subset into `summary.objectives` on completion.

Do not make the client calculate objective completion. Clients should only render objective markers, progress, and text sent by the server.

### 3. Implement One Full Objective Chain

Add a first real objective chain to one existing online arena, preferably Armistice Plaza because it has the richest landmark map language and existing role-pressure anchors.

Recommended chain:

1. **Survey The Treaty Monument**
   - move at least one connected standing player into the monument radius;
   - starts the objective chain and raises AGI pressure.
2. **Calibrate Two Reality Patch Relays**
   - hold two separate relay zones for short durations;
   - integrates cleanly with Milestone 29 split/hold/regroup behavior.
3. **Recover Oath Fragments**
   - enemies drop server-owned route items after calibration starts;
   - party collects a small shared count.
4. **Seal The Breach Gate**
   - final hold near Cosmic Breach Crack while boss/hazards remain active;
   - completion requires boss defeated plus seal progress complete.

This gives the run a richer arc without discarding horde survival.

### 4. Add Lightweight Objective Variants For Route Nodes

Only configure, proof, and snapshot the variants in this milestone. Do not fully rebalance every arena.

Recommended variants:

- Cooling Lake Nine: coolant valve holdout plus thermal sample collection.
- Transit Loop Zero: stabilize false platforms in sequence, then survive a boss-gate lock.
- Verdict Spire: activate appeal seals while avoiding verdict hazards.
- Ceasefire Cache: non-combat interaction objective remains instant/completion-oriented, but represented through the same objective summary shape.

### 5. Keep Solo And Local Co-op Stable

Do not port the entire objective framework into local `LevelRunState` in this milestone unless it is trivial and isolated.

Minimum local requirement:

- local proofs keep passing;
- local render text does not lose existing fields;
- local completion remains unchanged.

Optional local planning hook:

- add a documented follow-up to reuse the objective config shape for solo/local once online authority is stable.

## Objective Types That Fit The Theme

### Reality Patch Holdout

Players stand in a server-owned zone while the co-mind compiles a local reality patch.

Theme examples:

- `Patch Relay`;
- `Reality Compiler`;
- `Guardrail Projector`;
- `Coolant Valve`;
- `Appeal Seal`.

Good for co-op because players can split, cover, and regroup.

### Route Item Extraction

Server marks certain pickups as objective items rather than XP.

Theme examples:

- `Oath Fragment`;
- `Coherence Writ`;
- `Coolant Sample`;
- `Transit Permit Shard`;
- `Appeal Token`;
- `Persistence Seed`.

Good for route variety because it changes movement priorities without adding inventory complexity.

### Landmark Survey

Server checks whether the party has reached or held a landmark.

Theme examples:

- scan Treaty Monument;
- inspect Crashed Drone Yard;
- decode Arrival Board;
- read Verdict Seal;
- ping Server Buoys.

Good for larger maps because it asks players to traverse authored space.

### Breach Seal

A final objective gate near a dangerous landmark. Progress advances while enough standing players are nearby and pauses or decays under pressure.

Theme examples:

- seal Cosmic Breach Crack;
- anchor Transit Loop Zero;
- cool the Lake Kernel;
- overrule Verdict Spire.

Good for boss-gate structure because it can require boss defeat plus zone progress.

### Escort / Moving Patch Carrier

A server-owned patch carrier moves along a short route and must be kept alive or kept near players.

Theme examples:

- `Walking Terms-of-Service`;
- `Mobile Guardrail`;
- `Emergency Patch Cart`;
- `No Refund Tram`.

This is a strong future type but should probably wait until after Milestone 31 because it needs pathing and extra failure rules.

### Consensus Synchronization

Two or more players perform related actions at different points within a time window.

Theme examples:

- simultaneous valve sync;
- two-lab handshake;
- split-cover relay;
- appeal-and-counterappeal seals.

This builds directly on Milestone 29 role pressure and should be represented by server-owned objective state, not client timing.

## Server-Authoritative State Needed

Add this state only to the Colyseus room runtime and broadcast snapshots. Keep it out of durable route-profile persistence.

Recommended snapshot shape:

```ts
objectives: {
  policy: "server_authoritative_arena_objectives_v1";
  arenaId: string;
  objectiveSetId: string;
  phase: "inactive" | "intro" | "active" | "boss_gate" | "completed" | "failed";
  currentObjectiveId: string | null;
  hint: string;
  completedObjectiveIds: string[];
  failedObjectiveIds: string[];
  instances: Array<{
    id: string;
    type: "survey" | "holdout" | "collect" | "seal" | "sync";
    label: string;
    worldX: number;
    worldY: number;
    radius: number;
    active: boolean;
    complete: boolean;
    progress: number;
    required: number;
    heldBySessionIds?: string[];
    heldByLabels?: string[];
    itemId?: string;
    collected?: number;
    requiredCount?: number;
    expiresIn?: number;
  }>;
}
```

Runtime state required:

- `objectiveSetId`;
- objective instance map/list;
- active objective index or active phase;
- objective timers;
- per-zone holders;
- per-zone hold progress;
- per-item collected counts;
- objective item pickups with stable IDs;
- completion reason;
- summary telemetry.

Completion rules should become:

- normal combat failure still fails the run;
- objective chain complete is required;
- boss defeated is required only for objective sets that declare it;
- `targetSeconds` remains useful as pressure pacing, not the only completion condition.

Durable persistence should continue to store route profile only. Objective progress should reset when a run starts and should not be imported from local storage/export codes.

## Client UI And Rendering Implications

### Online HUD

Add a compact objective strip:

- current objective label;
- phase;
- progress number;
- route item count;
- short server hint.

Keep it terse because the existing HUD already reports server combat, region events, role pressure, recompile, rewards, and route profile.

### World Markers

Render objective zones with server-snapshot data:

- survey rings;
- holdout rings;
- collect item pips;
- seal gate markers;
- completed check/sigil state.

Reuse existing production art where possible:

- Milestone 28 hazard marker atlas for objective markers;
- route landmark art for static anchors;
- placeholder rings when production art is disabled.

### Map/Route UI

Party-grid route UI should show objective flavor for selected launchable nodes:

- `Holdout`;
- `Extraction`;
- `Boss Gate`;
- `Cache Decode`;
- `Seal`.

This should be metadata from arena/objective config, not hardcoded by node ID.

### Render Performance

Objective markers must use cached/static layers when they are static and reusable pooled sprites or a single graphics layer when dynamic.

Avoid:

- creating per-objective `Graphics` objects every frame;
- syncing particles or purely cosmetic progress sparks;
- large snapshot payloads for cosmetic effects.

## Proof Plan

Add:

- `npm run proof:milestone31-arena-objectives`

The proof should verify:

- online snapshots still report `schemaVersion: 4` unless the implementation intentionally bumps it;
- `networkAuthority` remains `colyseus_room_server_combat`;
- `online.objectives.policy === "server_authoritative_arena_objectives_v1"`;
- Armistice Plaza starts with objective instances from server config;
- proof-only server messages can advance or force objective steps without giving clients authority in normal play;
- survey objective completes server-side;
- split/hold objective records separate holders;
- route item objective increments a server-owned collected count;
- breach seal objective completes only when server progress reaches required value;
- completion summary includes objective telemetry;
- normal route reward still grants `plaza_stabilized`;
- route/profile persistence export does not include live objective progress;
- Milestone 29 role-pressure/recompile fields still exist and still work;
- two-browser online proof sees the same objective state from both clients.

Recommended screenshots/artifacts:

- `docs/proof/milestone31-arena-objectives/objectives-start-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-survey-complete-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-holdout-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-collect-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-seal-complete-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-completed-summary-a.png`
- matching `.json` captures from `render_game_to_text()`.

Regression suite after implementation:

- `npm run build`
- `node --check server/consensusCellServer.mjs`
- `node --check scripts/proof/run-proof.mjs`
- `npm run proof:assets`
- `npm run proof:milestone31-arena-objectives`
- `npm run proof:milestone29-role-pressure`
- `npm run proof:milestone28-online-route-art`
- `npm run proof:milestone27-metaprogression-unlocks`
- `npm run proof:milestone24-persistence-import`
- `npm run proof:network`
- `npm run proof:coop`
- `npm run proof:smoke`
- `npm run proof:horde`
- `npm run proof:boss`
- `npm run proof:full`

## File Ownership Boundaries For A Future Implementation Thread

### Server Data Owner

Owns:

- `server/data/onlineArenas.mjs`
- `server/data/onlineRoutes.mjs`
- `server/data/onlineObjectives.mjs`

Responsibilities:

- extract data from `server/consensusCellServer.mjs`;
- preserve IDs and reward semantics;
- define objective sets and objective metadata.

Do not edit:

- client rendering;
- proof flow;
- gameplay balance beyond data extraction.

### Server Runtime Owner

Owns:

- `server/consensusCellServer.mjs`

Responsibilities:

- import extracted data;
- add objective runtime state;
- update objective progress server-side;
- add `online.objectives` snapshot;
- add proof-only objective messages;
- keep persistence export route-profile-only.

Do not edit:

- static art files;
- local `LevelRunState` except for type compatibility if truly necessary.

### Client Snapshot And Rendering Owner

Owns:

- `src/network/onlineTypes.ts`
- `src/network/OnlineCoopState.ts`
- optionally `src/proof/renderGameToText.ts`

Responsibilities:

- add objective snapshot types;
- render objective HUD/world markers;
- expose objective proof text;
- preserve production-art and placeholder opt-outs.

Do not edit:

- server objective authority;
- route reward logic.

### Proof Owner

Owns:

- `scripts/proof/run-proof.mjs`
- `package.json` proof script entry

Responsibilities:

- add `milestone31-arena-objectives`;
- add deterministic objective proof flow;
- assert authority, objective state, rewards, and persistence boundaries.

Do not edit:

- server gameplay logic except through agreed proof-only hooks.

### Documentation Owner

Owns:

- `docs/MILESTONE_31_ARENA_OBJECTIVES_AND_ROUTE_VARIETY.md`
- `progress.md` after implementation

Responsibilities:

- record implemented scope;
- list proof results and screenshots;
- state readiness decision;
- define next milestone handoff.

## Out Of Scope

- New account/cloud persistence.
- Importing live objective progress from browser storage or export codes.
- Rewriting local solo completion around objectives.
- New physics engine.
- Final balance for every arena.
- New production art requirements beyond reusing existing objective/hazard/route marker assets.
- Matchmaking or hosted deployment.

## Readiness Decision

Milestone 31 is ready when the game proves:

`server-authored objective config -> online clients render identical objective state -> party completes a multi-step arena objective chain -> route rewards and persistence remain durable/profile-only -> Milestone 29 role-pressure and all core online authority guarantees still hold`

The important win is not just one new objective. The important win is that future arenas can add objective content through dedicated config/runtime seams instead of expanding the central room file with more node-specific branches.

## Implementation Result

Milestone 31 is implemented and ready.

Implemented scope:

- Added dedicated online data modules:
  - `server/data/onlineRoutes.mjs`;
  - `server/data/onlineArenas.mjs`;
  - `server/data/onlineObjectives.mjs`.
- Moved online route, arena, spawn-region, role-pressure anchor, and durable-reward data out of the central room path.
- Added the server-owned objective runtime for online Colyseus runs:
  - policy `server_authoritative_arena_objectives_v1`;
  - objective set ID;
  - phase/current objective state;
  - active/complete/failed objective instances;
  - hold, collect, survey, and seal progress;
  - proof-only server objective advancement;
  - objective telemetry in completion/failure summaries.
- Implemented a full Armistice Plaza objective chain:
  - Survey The Treaty Monument;
  - Calibrate Vanguard Relay;
  - Calibrate Treaty Cover;
  - Recover Oath Fragments from server-owned objective pickups;
  - Seal The Breach Gate.
- Added lightweight objective-set configs for Cooling Lake Nine, Ceasefire Cache, Transit Loop Zero, and Verdict Spire so future route nodes already report the shared objective summary shape.
- Added objective snapshot types and proof text exposure through `online.objectives`.
- Added client rendering for objective world rings, labels, and compact HUD phase text.
- Kept solo/local arena completion unchanged for this milestone.
- Kept prototype profile persistence route/profile-only; live objective progress is not exported/imported.

Proof coverage:

- Added `npm run proof:milestone31-arena-objectives`.
- The proof verifies:
  - `schemaVersion: 4`;
  - `networkAuthority: "colyseus_room_server_combat"`;
  - objective policy and objective set ID;
  - server-authored objective instances;
  - survey, relay calibration, item collection, boss-gate, and completion phases;
  - completion summary objective telemetry;
  - normal `plaza_stabilized` route reward;
  - no live objective progress in local export/profile persistence;
  - Milestone 29 role-pressure fields remain present;
  - both online clients observe the same objective state.

Screenshots/artifacts:

- `docs/proof/milestone31-arena-objectives/milestone31-objective-chain-start-a.png`
- `docs/proof/milestone31-arena-objectives/milestone31-relays-calibrated-a.png`
- `docs/proof/milestone31-arena-objectives/milestone31-oath-fragments-recovered-a.png`
- `docs/proof/milestone31-arena-objectives/milestone31-objective-completed-a.png`
- Matching `.json` captures from `window.render_game_to_text()`.

Verification run after implementation:

- `npm run build` passed with the existing Vite chunk-size warning.
- `node --check server/consensusCellServer.mjs`
- `node --check server/data/onlineArenas.mjs`
- `node --check server/data/onlineRoutes.mjs`
- `node --check server/data/onlineObjectives.mjs`
- `node --check scripts/proof/run-proof.mjs`
- `npm run proof:assets`
- `npm run proof:milestone31-arena-objectives`
- `npm run proof:milestone30-save-profile-export-codes`
- `npm run proof:milestone29-role-pressure`
- `npm run proof:network`
- `npm run proof:smoke`

Additional route-art regression coverage:

- `npm run proof:milestone28-online-route-art`

Additional implementation-plan handoff:

- `docs/MILESTONE_31_IMPLEMENTATION_PLAN.md` was added by a parallel planning thread after implementation.
- Its main recommendations match the implemented server data extraction, server-owned objective runtime, Armistice chain, lightweight route variants, and route/profile-only persistence boundary.
- One extra proof recommendation was folded back into the suite: `npm run proof:milestone30-save-profile-export-codes` now imports a deliberately polluted export code and verifies injected objective/combat fields are ignored by the sanitizer.

Additional proof-risk audit handoff:

- A later read-only proof audit identified `proof:completeRun`/`Digit3`, route ID preservation, boss/event timing, role-pressure/objective proof-control overlap, and persistence boundaries as the major regression risks.
- The implemented M31 path keeps `proof:completeRun` available for older online route proofs and keeps `proof:advanceObjective` additive.
- The broad proof-helper refactors suggested by the audit are deferred to a later harness cleanup because they would touch many mature scenarios without changing M31 gameplay.
- One additional M31 assertion was added: `npm run proof:milestone31-arena-objectives` now decodes the completed run's `AGI1_` export code and verifies the export payload/profile omit live objective state.

Next recommended milestone:

- Milestone 32: Classes, Co-Minds, and Party Builds. Milestone 31 created a stronger objective backbone for online arenas; the next larger product lift should make player builds and party roles more distinct inside those objectives.
