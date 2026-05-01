# Milestone 31 Implementation Plan: Server-Authoritative Arena Objectives And Modular Online Arena Configs

## Goal

Milestone 31 should turn online arenas from mostly timed horde/boss clears into server-authored objective runs, while extracting enough online arena and route data that future route-node pods can be built with less conflict in the central Colyseus room.

The target architecture is:

`online route node -> online arena config -> online objective set -> server-owned objective runtime -> compact snapshot -> client HUD/world markers/proof text`

This milestone must preserve the existing Milestone 15-30 guarantees:

- Colyseus room remains authoritative for combat, pickups, projectiles, XP, upgrades, boss state, run completion, rewards, reconnect, and persistence import/export boundaries.
- `schemaVersion` can remain `4` for a purely additive JSON snapshot, unless the implementation intentionally migrates Schema collections.
- `networkAuthority` remains `colyseus_room_server_combat`.
- Reconnect keys and reserved slots continue to preserve player slot/run lifecycle identity.
- Browser-local persistence and export codes continue to import/export route/profile fields only.
- Role pressure, Recompile Ally, shared patch voting, rewards, metaprogression unlocks, and production-art defaults continue to work.
- `window.render_game_to_text()` and `window.advanceTime(ms)` remain deterministic proof hooks.

## Current Coupling Audit

### Central Server Coupling

`server/consensusCellServer.mjs` currently owns both behavior and almost all online content data:

- `PARTY_NODES` and `PARTY_ROUTES` define online route topology inline.
- `ONLINE_ARENAS` defines arena labels, map IDs, timings, boss data, rewards, and spawn regions inline.
- `ROLE_PRESSURE_ANCHORS` defines arena-specific co-op anchor points inline.
- Region-event behavior branches on `this.arenaId` in `updateRegionEvents()`, `spawnRegionHazard()`, and `regionEventSnapshot()`.
- Boss behavior branches on `this.arenaId` in `spawnBossIfReady()`, `updateBossMechanics()`, and `combat.bossGateMechanic`.
- Reward bonus IDs are hardcoded in `applyNodeReward()`.
- Persistence sanitization directly references inline `PARTY_NODES` and `DURABLE_REWARD_IDS`.
- Party snapshots directly emit inline route/node data.

This makes route-node content, online server runtime, proof hooks, and persistence behavior all collide in one large file.

### Client Coupling

`src/network/OnlineCoopState.ts` is also arena-aware in ways that will grow with every new node:

- `drawStaticArena()` branches on `arenaId` for Cooling Lake, Ceasefire Cache, Transit Loop Zero, and Verdict Spire terrain.
- `arenaLabel()` hardcodes arena labels.
- `routeUiInfo()` derives route UI metadata from snapshot node fields but does not yet receive objective flavor.
- HUD text has room for role pressure and region events, but no objective strip.
- World marker code already has good patterns to reuse: `drawOnlineRolePressure()`, `drawOnlineRegionEvents()`, and pooled production sprites.

### Snapshot And Proof Coupling

`src/network/onlineTypes.ts` has no `objectives` field yet. `src/proof/renderGameToText.ts` exposes `online.regionEvent`, `online.rolePressure`, `online.persistence`, `online.summary`, and matching `level.*` fields, but online objectives are currently represented only as a generic text string.

`scripts/proof/run-proof.mjs` has milestone-specific online flows concentrated in one file. Existing proof-only server messages are:

- `proof:grantSharedXp`
- `proof:downLocal`
- `proof:splitRoleAnchors`
- `proof:completeRun`

Milestone 31 should add objective proof controls, but they must remain server-side test accelerators. Clients should never become objective authority.

### Local/Solo Coupling

Local arena data starts in `src/content/arenas.ts` and adapts through `src/level/arenas.ts`, but `LevelRunState` still uses the Armistice large-map foundation for local run geometry. Local completion remains the existing boss/timer survival loop. Milestone 31 should not port the objective runtime into local solo unless a later thread explicitly expands the scope.

## Recommended File Structure

Create server data modules first, then wire behavior conservatively.

### New Server Data Modules

`server/data/onlineRoutes.mjs`

- Exports `START_NODE_ID`, `PARTY_NODES`, `PARTY_ROUTES`, `DURABLE_REWARD_IDS`.
- Adds objective UI metadata to nodes:
  - `objectiveFlavor`: short label for route UI, such as `Survey Chain`, `Coolant Holdout`, `Cache Decode`, `Transit Sequence`, `Appeal Seals`.
  - `objectiveSetId`: ID that maps to objective config.
  - `interaction`: preserved for Ceasefire Cache.

`server/data/onlineArenas.mjs`

- Exports `BOUNDS`, shared constants, spawn-region definitions, `ONLINE_ARENAS`.
- Moves arena-specific boss config into data:
  - `bossBaseHp`
  - `bossHpPerPlayer`
  - `bossSpeed`
  - `bossDamage`
  - `bossRadius`
  - `bossColor`
  - `bossGateMechanic`
  - `initialBossHazard`
- Moves region-event config into data:
  - `eventFamily`
  - `regionLabel`
  - `eventCadenceSeconds`
  - `hazardPatternId`
  - `hazardFamilyIds`

`server/data/onlineObjectives.mjs`

- Exports `ONLINE_OBJECTIVE_SETS`.
- Exports helper lookup functions only if they stay data-oriented, for example `objectiveSetForArena(arenaId)`.
- Does not import Colyseus or mutate runtime state.

### Optional Later Split

If the implementation thread wants a second runtime extraction after the data split is stable:

- `server/runtime/onlineObjectivesRuntime.mjs`
- `server/runtime/onlineRegionEvents.mjs`
- `server/runtime/onlineRewards.mjs`

This is optional for Milestone 31. The safer first pass is data extraction plus objective runtime methods inside `ConsensusCellRoom`.

## Online Objective Config Shape

Objective config should be authored data, not snapshot state. Recommended config shape:

```js
{
  id: "armistice_plaza_objectives_v1",
  arenaId: "armistice_plaza",
  label: "Armistice Plaza Stabilization",
  policy: "server_authoritative_arena_objectives_v1",
  completionRequiresBossDefeated: true,
  completionRequiresAllRequiredObjectives: true,
  targetSecondsMode: "pressure_pacing",
  introHint: "Reach the Treaty Monument and prove the party still exists.",
  routeUi: {
    flavor: "Survey Chain",
    tags: ["Survey", "Holdout", "Extraction", "Seal"]
  },
  objectives: [
    {
      id: "survey_treaty_monument",
      type: "survey",
      label: "Survey Treaty Monument",
      hint: "Move a standing connected ally into the Treaty Monument scan radius.",
      worldX: 1,
      worldY: 3,
      radius: 3.2,
      required: 1,
      order: 10,
      requiredForCompletion: true,
      activates: ["calibrate_relay_vanguard", "calibrate_relay_cover"]
    }
  ]
}
```

Use `order` and `activates` rather than hardcoding each transition in the room. For Milestone 31, objectives can still be sequential under the hood; the config should not trap the project in one sequence forever.

## Exact Runtime/Snapshot State For `online.objectives`

Add this field to every online snapshot. It should be present in lobby, active, completed, and failed phases so clients and proofs do not need null-heavy branching.

```ts
online.objectives: {
  policy: "server_authoritative_arena_objectives_v1";
  arenaId: string;
  objectiveSetId: string;
  label: string;
  phase: "inactive" | "intro" | "active" | "boss_gate" | "completed" | "failed";
  currentObjectiveId: string | null;
  currentObjectiveLabel: string;
  hint: string;
  completionReason: string | null;
  requiresBossDefeated: boolean;
  bossDefeated: boolean;
  requiredComplete: boolean;
  completedObjectiveIds: string[];
  failedObjectiveIds: string[];
  telemetry: {
    startedAt: number;
    completedAt: number | null;
    activeSeconds: number;
    surveyCount: number;
    holdoutCompletedCount: number;
    collectedObjectiveItemCount: number;
    sealCompleted: boolean;
  };
  instances: Array<{
    id: string;
    type: "survey" | "holdout" | "collect" | "seal" | "sync" | "instant";
    label: string;
    hint: string;
    worldX: number;
    worldY: number;
    radius: number;
    active: boolean;
    visible: boolean;
    complete: boolean;
    failed: boolean;
    progress: number;
    required: number;
    percent: number;
    requiredForCompletion: boolean;
    order: number;
    heldBySessionIds: string[];
    heldByLabels: string[];
    itemId: string | null;
    collected: number;
    requiredCount: number;
    expiresIn: number | null;
  }>;
}
```

Mirror the same object, or a compact subset, into:

- `online.summary.objectives`
- `level.summary.objectives` in `render_game_to_text()`

Recommended summary subset:

```ts
summary.objectives: {
  policy: "server_authoritative_arena_objectives_v1";
  objectiveSetId: string;
  outcome: "completed" | "failed";
  completedObjectiveIds: string[];
  failedObjectiveIds: string[];
  completionReason: string;
  telemetry: {
    activeSeconds: number;
    holdoutCompletedCount: number;
    collectedObjectiveItemCount: number;
    sealCompleted: boolean;
  };
}
```

Do not add objective state to `online.persistence.profile`, export codes, local storage durable profiles, or the persistence sanitizer allowlist.

## Server Runtime State

Recommended room fields:

- `objectiveRuntime = null`
- `nextObjectiveItemId = 1`
- `objectiveItemPickups = []`
- `objectiveEventCounter = 0`

Recommended runtime structure:

```js
{
  policy: "server_authoritative_arena_objectives_v1",
  arenaId,
  objectiveSetId,
  phase,
  currentObjectiveId,
  startedAt,
  completedAt,
  completionReason,
  instances: new Map(),
  completedObjectiveIds: new Set(),
  failedObjectiveIds: new Set(),
  telemetry: {
    surveyCount: 0,
    holdoutCompletedCount: 0,
    collectedObjectiveItemCount: 0,
    sealCompleted: false
  }
}
```

Recommended room methods:

- `resetObjectivesForLaunch()`
- `createObjectiveRuntime(arenaId)`
- `updateObjectives(dt)`
- `updateSurveyObjective(instance, standingPlayers, dt)`
- `updateHoldoutObjective(instance, standingPlayers, dt)`
- `updateCollectObjective(instance, dt)`
- `updateSealObjective(instance, standingPlayers, dt)`
- `spawnObjectiveItemDrop(enemy)`
- `collectObjectiveItems(dt)`
- `activateObjective(id)`
- `completeObjective(id, reason)`
- `objectivesRequiredComplete()`
- `objectivesSnapshot()`
- `objectivesSummarySnapshot()`

Call order inside active `update(dt)` should be:

1. update players;
2. update role pressure and Recompile Ally;
3. update objectives;
4. spawn/update boss and region events;
5. update enemies/weapons/projectiles/pickups;
6. collect objective items;
7. check progression/completion/failure.

Objective item collection can reuse the nearest-player pickup pattern, but objective items should be separate from XP pickups so they do not affect shared patch draft pacing.

## Completion Rule Change

Current online completion:

```js
if (this.bossDefeated && this.seconds >= this.activeArenaConfig().targetSeconds) {
  this.completeRun("boss_defeated_and_timer_met");
}
```

Milestone 31 target:

```js
const arena = this.activeArenaConfig();
const objectives = this.objectiveRuntime;
const objectivesReady = !objectives || this.objectivesRequiredComplete();
const bossReady = !arena.objectiveSet?.completionRequiresBossDefeated || this.bossDefeated;
const pressureReady = this.seconds >= arena.minimumPressureSeconds;
if (objectivesReady && bossReady && pressureReady) {
  this.completeRun(this.objectiveRuntime?.completionReason ?? "objectives_complete");
}
```

Keep `targetSeconds` in the snapshot for HUD/proof compatibility, but treat it as pacing pressure. Add `minimumPressureSeconds` if needed. For Armistice Plaza, this should be low enough that a proof-forced objective chain does not wait for the old full timer after the boss/seal gate is satisfied.

## First Full Objective Chain: Armistice Plaza

Objective set ID: `armistice_plaza_objectives_v1`

Design purpose: turn the first online arena into a readable tour through the authored Armistice landmarks while preserving horde pressure, boss pressure, role pressure, and server combat.

### Phase 1: Survey The Treaty Monument

- ID: `survey_treaty_monument`
- Type: `survey`
- World: `worldX: 1`, `worldY: 3`
- Radius: `3.2`
- Required: one standing connected player inside the radius for `1.0s`
- Starts active when the run starts.
- Completion activates both relay holdouts.
- Hint: `Survey the Treaty Monument. A.G.I. is editing the ceasefire plaque.`
- Telemetry: increments `surveyCount`.

Server rules:

- Downed or disconnected players do not count.
- Progress pauses, not decays, if no valid holder is present.
- Proof control may teleport a player to the zone, but the server still completes the objective.

### Phase 2: Calibrate Two Reality Patch Relays

- IDs: `calibrate_relay_vanguard`, `calibrate_relay_cover`
- Type: `holdout`
- Vanguard Relay:
  - `worldX: -8.5`
  - `worldY: 5.5`
  - `radius: 2.75`
  - `required: 2.4`
- Treaty Cover Post:
  - `worldX: 8.2`
  - `worldY: -5.8`
  - `radius: 2.75`
  - `required: 2.4`
- Completion requires both holdouts complete.
- Hint: `Split the Consensus Cell across both patch relays.`
- These positions intentionally match Milestone 29 role-pressure anchors.

Server rules:

- Two separate zones can progress at once.
- A single player may not hold two zones in the same tick.
- With one connected player, allow sequential hold completion to preserve solo online testing.
- With two or more standing connected players, reward split play by allowing parallel progress and preserving `rolePressure.completedSplitHolds`.
- Completing both relays opens the Oath Fragment collection objective.

### Phase 3: Recover Oath Fragments

- ID: `recover_oath_fragments`
- Type: `collect`
- Item ID: `oath_fragment`
- Required count: `6`
- Drop source: non-boss enemies killed after both relay holdouts complete.
- Drop policy: deterministic server chance, for example every second eligible enemy or a seeded `50%` based on enemy ID.
- Hint: `Recover Oath Fragments from severed Bad Outputs.`

Server rules:

- Objective fragments are not XP pickups.
- They are server-owned items with stable numeric IDs and capped snapshot count.
- Any standing connected player can collect them for shared party progress.
- Completion activates breach seal and can accelerate boss pressure if boss is not already spawned.

### Phase 4: Seal The Breach Gate

- ID: `seal_cosmic_breach_gate`
- Type: `seal`
- World: `worldX: -24`, `worldY: 20`
- Radius: `3.4`
- Required: `4.5s` hold progress
- Requires: Oath fragments complete
- Completion gate: boss defeated plus seal progress complete
- Hint: `Hold the Breach Gate while the Oath-Eater loses jurisdiction.`

Server rules:

- Progress advances while at least one standing connected player is in radius.
- Progress pauses under no holder. Avoid decay in Milestone 31 unless playtests demand more pressure.
- If `bossDefeated` is false, completing the hold sets objective phase to `boss_gate`, keeps the seal marked complete, and waits for boss defeat.
- If `bossDefeated` is true, completing the hold marks the objective chain complete.
- Run completion reason should be `armistice_objectives_sealed_breach`.

## Lightweight Objective Variants

These should be configured and snapshot-proofed in Milestone 31, with minimal balancing. They can reuse the same runtime types.

### Cooling Lake Nine

Objective set ID: `cooling_lake_nine_objectives_v1`

Route UI flavor: `Coolant Holdout`

Chain:

1. `survey_server_buoys`
   - Type: `survey`
   - `worldX: -7`, `worldY: 5`
   - `radius: 3.2`
   - Hint: `Ping the server buoys before the lake boils the route.`
2. `hold_coolant_valve_north`
   - Type: `holdout`
   - `worldX: -12.2`, `worldY: 7.4`
   - `radius: 2.8`
   - Required: `2.6s`
3. `collect_thermal_samples`
   - Type: `collect`
   - Item ID: `thermal_sample`
   - Required count: `5`
   - Drop source: enemies spawned from lake regions or enemies killed inside/near thermal bloom windows.
4. `cool_lake_kernel`
   - Type: `seal`
   - `worldX: -5.6`, `worldY: 5.6`
   - `radius: 3.5`
   - Required: `4.0s`
   - Requires boss defeated.

Preserve `thermal_bloom` and `boiling_cache` region/boss hazards as server-owned region events.

### Ceasefire Cache

Objective set ID: `ceasefire_cache_objectives_v1`

Route UI flavor: `Cache Decode`

Chain:

1. `decode_cache_archive`
   - Type: `instant`
   - `worldX: -3`, `worldY: 2`
   - `radius: 2.5`
   - Required: `1`
   - Completes immediately in `completePartyInteractionNode()`.

Summary should still report:

- `objectiveSetId: "ceasefire_cache_objectives_v1"`
- completed objective ID `decode_cache_archive`
- completion reason `party_memory_cache`
- zero combat state imported/exported.

Do not turn Ceasefire Cache into a combat run in this milestone.

### Transit Loop Zero

Objective set ID: `transit_loop_zero_objectives_v1`

Route UI flavor: `Transit Sequence`

Chain:

1. `stabilize_platform_signal_a`
   - Type: `holdout`
   - `worldX: 3.4`, `worldY: -8.8`
   - `radius: 2.7`
   - Required: `2.3s`
2. `stabilize_false_track_lock`
   - Type: `holdout`
   - `worldX: 12.2`, `worldY: 2.6`
   - `radius: 2.7`
   - Required: `2.3s`
3. `collect_transit_permit_shards`
   - Type: `collect`
   - Item ID: `transit_permit_shard`
   - Required count: `4`
4. `anchor_arrival_board`
   - Type: `seal`
   - `worldX: 7.2`, `worldY: -2.4`
   - `radius: 3.3`
   - Required: `4.2s`
   - Requires boss defeated.

Preserve false-track hazards. Use objective labels to make the sequence feel like stabilizing platforms rather than only surviving a timer.

### Verdict Spire

Objective set ID: `verdict_spire_objectives_v1`

Route UI flavor: `Appeal Seals`

Chain:

1. `activate_appeal_anchor`
   - Type: `holdout`
   - `worldX: 14.4`, `worldY: 8.2`
   - `radius: 2.8`
   - Required: `2.8s`
2. `activate_seal_cover_post`
   - Type: `holdout`
   - `worldX: 5.8`, `worldY: 10.6`
   - `radius: 2.8`
   - Required: `2.8s`
3. `collect_appeal_tokens`
   - Type: `collect`
   - Item ID: `appeal_token`
   - Required count: `5`
4. `overrule_verdict_spire`
   - Type: `seal`
   - `worldX: 10.6`, `worldY: 5.2`
   - `radius: 3.6`
   - Required: `4.6s`
   - Requires boss defeated.

Preserve `verdict_seal` hazards and Injunction Writ spawns. The objective should frame those hazards as active court pressure, not replace them.

## Client Rendering And HUD Design

Add a compact objective strip below or near the current combat/role-pressure strip:

- Current objective label.
- Phase.
- Progress value, such as `2/6`, `68%`, or `BOSS GATE`.
- Short server hint.

World markers:

- Use one dynamic `Graphics` layer for rings.
- Reuse the production sprite pool for optional marker sprites.
- Do not allocate one `Graphics` object per marker per frame.
- Draw inactive future objectives with low alpha only if `visible` is true.
- Do not render objective item particles as server state; only render stable item pips from snapshot.

Party-grid route UI:

- Add `objectiveFlavor` to party node snapshots.
- Display compact type text for the selected node, for example `OBJ Survey Chain`.
- Keep save/export panel wording focused on browser-local persistence.

## Proof-Only Server Messages

Add deterministic messages for proofs:

- `proof:advanceObjective`
  - Payload: `{ objectiveId?: string }`
  - Server-side only. Advances the current objective by moving valid players or setting server progress to threshold.
- `proof:spawnObjectiveItems`
  - Payload: `{ count?: number }`
  - Spawns objective item pickups near connected players for collection proof.
- `proof:completeObjectives`
  - Completes required objective state but does not grant route rewards directly.

Do not add client-side functions that mutate objective state. The browser may send proof messages in proof mode, but the room decides all effects.

## Persistence And Export-Code Boundary

Keep allowed persistence profile keys unchanged:

- `completedNodeIds`
- `unlockedNodeIds`
- `rewardIds`
- `partyRenown`
- `nodeCompletionCounts`
- `recommendedNodeId`
- `routeDepth`
- `savedAtTick`

Do not add:

- `objectiveRuntime`
- `objectives`
- `objectiveSetId`
- objective item counts
- active objective IDs
- seal progress
- boss gate state

The proof should intentionally try an import code with extra objective fields and confirm they are ignored by the sanitizer through `ignoredImportedFieldCount`.

## Likely Touch Files

Primary runtime/config files for the implementation thread:

- `server/consensusCellServer.mjs`
- `server/data/onlineArenas.mjs`
- `server/data/onlineRoutes.mjs`
- `server/data/onlineObjectives.mjs`
- `src/network/onlineTypes.ts`
- `src/network/OnlineCoopState.ts`
- `src/proof/renderGameToText.ts`
- `scripts/proof/run-proof.mjs`
- `package.json`

Possible supporting docs after implementation:

- `docs/MILESTONE_31_ARENA_OBJECTIVES_AND_ROUTE_VARIETY.md`
- `progress.md`

Files that should usually stay untouched in Milestone 31:

- local `LevelRunState` behavior;
- production asset atlases and manifest;
- save/export-code encoding format, except proof assertions;
- solo/local proof scripts, except regression expectations if a shared type requires a harmless field.

## Conflict Risks

- `server/consensusCellServer.mjs` is high conflict risk because it currently hosts route data, arena data, combat runtime, rewards, persistence, reconnect, role pressure, boss logic, and snapshots.
- `scripts/proof/run-proof.mjs` is high conflict risk because all milestone proofs are centralized.
- `src/network/OnlineCoopState.ts` is medium-high risk because route UI, production art, static arena rendering, HUD, region events, role pressure, save profile, and summary UI are all in one class.
- `src/network/onlineTypes.ts` is medium risk because it is the shared contract for snapshot changes.
- Persistence sanitizer changes are high risk: accidentally allowing objective fields into import/export would violate Milestone 23-30 boundaries.
- Completion condition changes are high risk: replacing the old boss/timer gate too abruptly could break route rewards, summaries, and forced-completion proofs.
- Ceasefire Cache is a special case: it is an online-supported interaction node, not a normal active combat run. It still needs an objective summary shape.
- Production-art defaults must remain default-on and placeholder opt-out compatible. Objective markers should not require new production assets.
- Schema-backed lifecycle state should not be expanded casually. If `schemaVersion` remains `4`, keep `online.objectives` as additive broadcast snapshot data.

## Implementation Order

1. Extract data only.
   - Move routes, arenas, role-pressure anchors, and durable reward IDs to data modules.
   - Preserve exact current behavior and proof outputs.
2. Add objective config only.
   - Define objective sets for all five online-supported nodes.
   - Add route `objectiveFlavor` metadata.
3. Add server runtime state.
   - Initialize/reset objectives per launch.
   - Emit `online.objectives` snapshots in all phases.
   - Keep completion behavior unchanged until snapshots are stable.
4. Implement Armistice objective chain.
   - Survey, dual holdout, Oath Fragment collection, Breach Seal.
   - Change completion to require objective chain plus required boss condition.
5. Add lightweight variants.
   - Implement enough Cooling Lake, Transit, Verdict, and Cache config/runtime support to snapshot and complete through proof controls.
6. Add client HUD and markers.
   - Render objective strip and objective rings/items from snapshot only.
   - Add route objective flavor to party-grid panel.
7. Add proof script and regression assertions.
   - Add `proof:milestone31-arena-objectives`.
   - Run focused regressions for Milestones 15, 19, 24, 27, 28, 29, and 30 if time allows.

## Suggested Proof Assertions

New proof command:

- `npm run proof:milestone31-arena-objectives`

Core assertions:

- `online.schemaVersion === 4`, unless intentionally bumped.
- `online.networkAuthority === "colyseus_room_server_combat"`.
- `online.objectives.policy === "server_authoritative_arena_objectives_v1"`.
- `online.objectives.objectiveSetId === "armistice_plaza_objectives_v1"` after Armistice launch.
- Both browser clients see the same `currentObjectiveId`, completed IDs, item counts, and seal progress.
- Survey objective completes server-side when a valid player reaches the Treaty Monument radius.
- Relay holdouts record `heldBySessionIds` and `heldByLabels`.
- With two players, two separate relay instances can progress in parallel.
- Oath Fragment collection increments `collected` without changing XP pickup count directly.
- Breach Seal can complete before boss defeat but run completion waits in `boss_gate`.
- Run completion reason is objective-driven, for example `armistice_objectives_sealed_breach`.
- `online.summary.objectives.completedObjectiveIds` contains all required Armistice objective IDs.
- Normal route reward still grants `plaza_stabilized`.
- `online.persistence.profile` does not contain objective fields.
- Export code still starts with `AGI1_`.
- Importing a profile with extra objective fields results in sanitized route-profile import and ignored objective fields.
- `online.rolePressure.policy === "split_hold_regroup_recompile_v1"` still exists and role-pressure proof state still works.
- `online.recompile.policy === "recompile_ally_hold_radius"` still exists and accelerated regroup values still work.
- Production-art default route markers and hazard markers still render, and placeholder opt-out does not crash objective markers.

Recommended artifact names:

- `docs/proof/milestone31-arena-objectives/objectives-start-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-survey-complete-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-holdout-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-collect-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-boss-gate-a.png`
- `docs/proof/milestone31-arena-objectives/objectives-completed-summary-a.png`
- matching `.json` state captures from `render_game_to_text()`.

Recommended regression suite:

- `npm run build`
- `node --check server/consensusCellServer.mjs`
- `node --check scripts/proof/run-proof.mjs`
- `npm run proof:assets`
- `npm run proof:milestone31-arena-objectives`
- `npm run proof:milestone30-save-profile-export-codes`
- `npm run proof:milestone29-role-pressure`
- `npm run proof:milestone28-online-route-art`
- `npm run proof:milestone27-metaprogression-unlocks`
- `npm run proof:milestone24-persistence-import`
- `npm run proof:milestone19-reconnect-schema`
- `npm run proof:milestone15-online-combat`
- `npm run proof:network`
- `npm run proof:coop`
- `npm run proof:smoke`
- `npm run proof:full`

## Readiness Criteria

Milestone 31 is ready when:

- Online arena config, route config, and objective config no longer live entirely inside `server/consensusCellServer.mjs`.
- Armistice Plaza has a real server-owned multi-step objective chain.
- Cooling Lake, Ceasefire Cache, Transit Loop Zero, and Verdict Spire have lightweight objective variants represented through the same config/snapshot model.
- Two online clients render the same objective state from server snapshots.
- Objective completion drives run completion without weakening boss, combat, reward, reconnect, role-pressure, or persistence guarantees.
- Export/import codes remain route-profile-only.
- The proof suite demonstrates that Milestone 15-30 behavior survived the architecture change.
