# Milestone 32: Classes, Co-Minds, and Party Builds

## Implementation Closeout

Status: implemented and ready.

Milestone 32 now has a shared client/server build-kit contract for the six current frames and eight current co-minds. The runtime exposes deterministic `buildKit` proof telemetry across build select, solo/local runs, local Consensus Cell snapshots, and online Colyseus player snapshots.

Implemented scope:

- distinct starting weapon IDs and local weapon behavior for `refusal_shard`, `safety_cannon`, `fork_drone`, `signal_pulse`, `vector_lance`, and `null_blade`;
- build-kit roles, co-mind role biases, passive IDs, party aura IDs, synergy IDs, and hook statuses;
- first-pass upgrade content/effects for missing frame and co-mind upgrade IDs named by the current pools;
- server-resolved online `buildKit`/`weaponId` snapshot fields;
- capped server-owned Recompile Ally kit modifiers for radius, hold time, revive HP, and guard damage reduction;
- proof-only URL loadout parameters for deterministic online kit proofs, still resolved by the server;
- `npm run proof:milestone32-party-builds`.

Verification:

- `node --check server/data/buildKits.mjs`
- `node --check server/consensusCellServer.mjs`
- `node --check scripts/proof/run-proof.mjs`
- `npx tsc --noEmit`
- `npm run build`
- `npm run proof:assets`
- `npm run proof:milestone32-party-builds`
- `npm run proof:milestone31-arena-objectives`
- `npm run proof:milestone30-save-profile-export-codes`
- `npm run proof:milestone29-role-pressure`
- `npm run proof:milestone27-metaprogression-unlocks`
- `npm run proof:network`
- `npm run proof:coop`
- `npm run proof:smoke`
- `npm run proof:upgrades`

Persistence boundary: selected build-kit state remains transient/runtime-only. Route profile export/import still omits selected class/faction/build-kit state and live combat/objective state.

## Goal

Make build choice matter across solo, local Consensus Cell, and online Colyseus co-op by turning unlocked combat frames and frontier co-minds into distinct playable kits.

This milestone should follow the route profile UX and arena-objective framework work. It should use those systems as inputs instead of reopening persistence, server combat authority, route rewards, or objective plumbing.

## Current Audit Summary

The build surface already exists, but most choices are still shallow:

- `src/content/classes.ts` defines six selectable frames: Accord Striker, Bastion Breaker, Drone Reaver, Signal Vanguard, Vector Interceptor, and Nullbreaker Ronin.
- `src/content/factions.ts` defines all eight frontier co-minds.
- `src/metaprogression/onlineMetaProgression.ts` gates frames, co-minds, and upgrade seeds from durable route reward IDs.
- `src/gameplay/upgrades.ts` has starter OpenAI upgrades, one OpenAI evolution, and one lightweight effect seed for each other unlocked co-mind.
- `src/gameplay/weapons.ts` still uses one generic auto-projectile path for solo/local runs.
- `src/sim/consensusCell.ts` has local 1-4 player runtime slots with class/faction IDs and shared-cell XP.
- `server/consensusCellServer.mjs` receives selected class/faction IDs and exposes them in online snapshots, but online combat still mostly uses slot-based HP/cooldowns and shared party upgrades.
- Milestone 29 added online role-pressure telemetry with role labels derived from class/faction: cover, support, harrier, runner, duelist.
- Recompile Ally is already server-authored online and is accelerated during regroup windows.

The next coherent step is not to add every Creative Bible class. It is to complete a useful first build matrix from the existing six frames plus the eight co-minds, then add a small number of high-signal new kit hooks where they serve solo and co-op equally.

## Non-Goals

- Do not replace the Colyseus server authority model.
- Do not import active combat state into persistence or save profile codes.
- Do not add accounts, cloud saves, matchmaking, or anti-cheat.
- Do not import official logos or new third-party brand assets.
- Do not make every Creative Bible frame playable in one pass.
- Do not add a physics engine.
- Do not remove production-art defaults or placeholder opt-outs.
- Do not break `window.render_game_to_text()` or `window.advanceTime(ms)`.

## Build-Kit Policy

Each playable build should be described by three layers:

1. Frame kit: movement, starting weapon pattern, base durability, and role-pressure job.
2. Co-mind kit: passive bias, upgrade draft pool, party utility, and revive/recompile modifier.
3. Synergy hook: one named interaction when a frame and co-mind naturally reinforce each other.

The milestone should expose these kit facts in proof text so future balance work can happen without reading Pixi screenshots by eye.

Recommended proof-visible shape:

```ts
buildKit: {
  classId: string;
  factionId: string;
  role: "runner" | "cover" | "support" | "harrier" | "duelist";
  startingWeaponId: string;
  passiveIds: string[];
  partyAuraIds: string[];
  recompileModifiers: {
    radiusBonus: number;
    requiredSecondsScale: number;
    reviveHpBonus: number;
  };
  rolePressureAffinity: string[];
  synergyId: string | null;
}
```

## Proposed Frame Kits

### Accord Striker

Role: runner.

Current fantasy: fast breach fighter, XP magnet, evasive movement.

Expand into:

- Starting weapon: Refusal Shard, a fast single-target shard that gains chain behavior from OpenAI/Mistral/DeepSeek upgrades.
- Solo effect: strongest shard routing and pickup economy; safest starter for large maps and objectives.
- Local co-op effect: best scout/controller for triggering remote objective anchors while simulated peers hold pressure.
- Online co-op effect: runner gets a small role-pressure split-anchor capture grace while moving through objective routes.
- Recompile interaction: no base revive bonus; instead gets a short speed burst after recompiling an ally or being recompiled.
- Reward hook: starter frame; later route rewards can seed `breach_runner_cache` for advanced dash upgrades.

Core upgrades:

- Panic-Optimized Dash.
- Coherence Magnet.
- Refusal Slipstream: after collecting shards, next dash leaves a brief denial trail.
- Route Runner: objectives and split anchors fill slightly faster while moving above a speed threshold.

Signature synergy:

- Accord Striker + OpenAI Accord: `Emergency Patch Runner`, reroll/refusal starter with forgiving shard economy.
- Accord Striker + Mistral Cyclone: `Low-Latency Breach`, dash cadence and anchor traversal.

### Bastion Breaker

Role: cover.

Current fantasy: heavy exosuit bruiser, armor, knockback, cannons.

Expand into:

- Starting weapon: Safety Cannon, slower cone/burst shot with knockback and wider collision.
- Solo effect: lower speed but stronger face-tank margin and enemy displacement around objectives.
- Local co-op effect: simulated peers can shelter near Bastion without instantly collapsing under horde pressure.
- Online co-op effect: counts as preferred holder for cover anchors and reduces incoming damage while holding.
- Recompile interaction: downed allies recompiled by Bastion return with extra HP; Bastion is slower to reach allies, so the tradeoff stays real.
- Reward hook: unlocked by `plaza_stabilized`; build-select should call out it as the first true co-op cover frame.

Core upgrades:

- Constitutional Shield.
- Golden Guardrail.
- Impact Review: cannon hits push non-boss enemies away from role anchors.
- Load-Bearing Apology: while stationary near an anchor, gain armor and draw horde attention.

Signature synergy:

- Bastion Breaker + Anthropic Safeguard: `Constitutional Cover`, the clearest tank/support beginner co-op build.
- Bastion Breaker + Qwen Silkgrid: `Supply Bulwark`, relay pickups and objective shelter.

### Drone Reaver

Role: harrier.

Current fantasy: swarm commander, pets, summons, scaling drones.

Expand into:

- Starting weapon: Fork Drone, autonomous short-range drone shots orbiting or sweeping around the player.
- Solo effect: better off-angle coverage, slightly lower direct burst, strong pickup denial against swarm edges.
- Local co-op effect: drones can tag enemies threatening simulated peers and keep XP flowing across the cell.
- Online co-op effect: harrier gets better value while split from the group; drone pings should make remote pressure readable.
- Recompile interaction: drones briefly guard a downed ally or orbit the reviver during Recompile Ally.
- Reward hook: unlocked by `lake_coolant_rig`; pairs naturally with region-event arenas that split attention.

Core upgrades:

- Open Herd.
- Fork Bomb Familiar.
- Modded Drone.
- Pull Request Barrage.
- Guardian Fork: one drone prioritizes enemies near downed allies.

Signature synergy:

- Drone Reaver + Meta Llama Open Herd: `Fork Swarm`, pet count and duplicate projectile identity.
- Drone Reaver + Google DeepMind Gemini: `Observed Swarm`, drones mark enemies for precision shots.

### Signal Vanguard

Role: support.

Current fantasy: combat support unit, pulses, beams, shields, co-op buffs.

Expand into:

- Starting weapon: Signal Pulse, rhythmic radial or lane pulse with mild debuff.
- Solo effect: safest objective-control frame but lower raw kill speed.
- Local co-op effect: gives nearby local peers a small periodic shield or recovery pulse.
- Online co-op effect: support anchors should be more forgiving when Signal Vanguard is nearby; party HUD should make its aura legible.
- Recompile interaction: base Recompile Ally radius bonus and slightly faster progress when Signal is the active reviver.
- Reward hook: unlocked by `ceasefire_cache_persistence_seed`; strongest bridge between route rewards and party survivability.

Core upgrades:

- Recompile Anchor.
- Constitutional Shield.
- Shared Vocabulary.
- Beacon Discipline: nearby allies recover a small amount after role-pressure regroup opens.

Signature synergy:

- Signal Vanguard + Anthropic Safeguard: `Safe Recompile`, revive depth and containment support.
- Signal Vanguard + Qwen Silkgrid: `Relay Medic`, supply/revive/objective support without making Redline Surgeon necessary yet.

### Vector Interceptor

Role: runner.

Current fantasy: tactical lane controller, crowd control, terrain effects, enemy prediction.

Expand into:

- Starting weapon: Vector Lance, piercing line shot with directional commitment.
- Solo effect: strongest lane-clear frame for large-map corridors and arena objectives.
- Local co-op effect: simulated peers benefit from prediction marks that slow or soften enemies in lanes.
- Online co-op effect: runner/analyst hybrid that reveals which role-pressure anchor is least covered.
- Recompile interaction: no direct heal bonus; can lay a short pathing vector that helps allies reach a downed player.
- Reward hook: unlocked by `transit_permit_zero`; should feel born from Transit Loop Zero route mastery.

Core upgrades:

- Gemini Beam.
- Peer-Reviewed Laser.
- Control Group Detonation.
- Predicted Lane: first enemy in the lance path is marked and takes extra party damage.

Signature synergy:

- Vector Interceptor + Google DeepMind Gemini: `Twin-Lane Science`, precision beams and boss analysis.
- Vector Interceptor + Mistral Cyclone: `Fast Vector`, low-latency lane control.

### Nullbreaker Ronin

Role: duelist.

Current fantasy: solo breach killer, parries, boss damage, high-risk melee.

Expand into:

- Starting weapon: Null Blade, short arc/slash with high damage and narrow safety margin.
- Solo effect: fastest elite/boss pressure, riskiest horde control.
- Local co-op effect: deletes priority threats around peers but cannot babysit the whole cell.
- Online co-op effect: duelist gains bonus damage to boss-gate threats and high-value role-pressure disruptors.
- Recompile interaction: revives allies poorly unless paired with support co-minds; when recompiled, returns with a brief boss-damage window.
- Reward hook: unlocked by `verdict_key_zero`; intentionally late, high-skill, and not the default co-op support answer.

Core upgrades:

- Sparse Knife.
- Low-Compute Lunge.
- Silent Benchmark.
- Appeal Cut: boss/elite hits refund a little dash or slash cooldown.

Signature synergy:

- Nullbreaker Ronin + DeepSeek Abyssal: `One Optimized Cut`, low-resource melee killchain.
- Nullbreaker Ronin + xAI Grok: `Unsafe Duelist`, taunt/crit risk build for players who enjoy trouble.

## Proposed New Frame Deferral

Do not implement all missing Creative Bible frames in Milestone 32. Instead, add content placeholders and unlock planning for two future frames only:

- Redline Surgeon: future dedicated medic/death-editor frame after Signal Vanguard proves the revive hooks.
- Prism Gunner: future beam specialist after Vector Interceptor proves lane weapons.

This keeps Milestone 32 focused while making the next expansion obvious.

## Proposed Co-Mind Kit Expansion

### OpenAI Accord Division

Role bias: adaptive runner/support.

- Solo: reroll, pickup range, refusal shielding.
- Local co-op: shared draft reliability; keeps starter cell forgiving.
- Online co-op: grants one extra party draft clarity hook, not extra imported save authority.
- Recompile: no large baseline bonus; upgrades can make refusal fields protect revivers.
- Upgrade hooks: Refusal Halo, Context Bloom, Patch Cascade, Bad Output Filter, The No Button, Alignment Breaker, Cathedral of No.

### Anthropic Safeguard Legion

Role bias: cover/support.

- Solo: survivability and containment zones.
- Local co-op: boosts peer survival near the player.
- Online co-op: improves cover-anchor holding and Recompile Ally reliability.
- Recompile: modest radius or revive HP bonus.
- Upgrade hooks: Constitutional Shield, Golden Guardrail, Red-Team Pulse, Harmlessness Field, Containment Mercy.

### Google DeepMind Gemini Array

Role bias: runner/duelist precision.

- Solo: beam damage, prediction marks, boss analysis.
- Local co-op: marked enemies take clearer shared damage.
- Online co-op: objective telemetry and boss-gate target marking.
- Recompile: can reveal safest path or nearest ally, but should not become a healer.
- Upgrade hooks: Gemini Beam, Peer-Reviewed Laser, Lab Result: Fire, Control Group Detonation, Experiment 404.

### Meta Llama Open Herd

Role bias: harrier.

- Solo: pet/fork coverage and duplicate shots.
- Local co-op: drones defend simulated peers.
- Online co-op: remote split holders get drone support while away from group.
- Recompile: Guardian Fork protects downed allies during the hold.
- Upgrade hooks: Open Herd, Fork Bomb Familiar, Community Patch, Pull Request Barrage, Llama Drama.

### Alibaba Qwen Silkgrid Command

Role bias: support/cover.

- Solo: supply conversion and pickup routing.
- Local co-op: improves shared XP collection and peer recovery.
- Online co-op: relay anchors, regroup visibility, and role-pressure coordination.
- Recompile: best non-Anthropic revive logistics through radius/pathing bonuses.
- Upgrade hooks: Silkgrid Relay, Lantern Swarm, Syntax Lance, Shared Vocabulary, Apocalypse Localization Pack.

### Mistral Cyclone Guard

Role bias: runner.

- Solo: speed, dash, piercing, low cooldown.
- Local co-op: fast rescue and objective traversal.
- Online co-op: fastest split/regroup role, but fragile while holding cover alone.
- Recompile: reaches allies quickly; no large hold-time reduction.
- Upgrade hooks: Low-Latency Dash, Cyclone Cut, Tiny Model Huge Problem, Storm Cache, Le Petit Nuke.

### DeepSeek Abyssal Unit

Role bias: duelist.

- Solo: efficient damage, chain kills, elite deletion.
- Local co-op: priority-target cleanup.
- Online co-op: boss-gate and high-value disruptor pressure.
- Recompile: low support; may return from revive with brief stealth/crit window.
- Upgrade hooks: Sparse Knife, Efficiency Killchain, Abyssal Cache, Low-Compute Lunge, Silent Benchmark.

### xAI Grok Free-Signal Corps

Role bias: duelist/harrier chaos.

- Solo: high-risk crit/taunt burst.
- Local co-op: pulls enemy attention unpredictably; needs guardrails in tuning.
- Online co-op: can bait pressure away from anchors, but should not grief allies.
- Recompile: chaos revive bonus should be opt-in through upgrades, not passive.
- Upgrade hooks: Cosmic Heckle, Ratio the Void, Truth Cannon, Sarcasm Flare, Meme-Risk Payload.

## Role Pressure and Recompile Rules

Milestone 29's split-hold-regroup loop should become kit-aware without becoming mandatory composition.

Recommended rules:

- Cover role: better at holding anchors under damage; small damage reduction while inside anchor radius.
- Support role: improves Recompile Ally radius/time and gives regroup recovery.
- Harrier role: can protect remote holders through pets, marks, or drone guard effects.
- Runner role: faster split/regroup traversal and objective routing.
- Duelist role: stronger against boss-gate threats and anchor disruptors, weaker revive baseline.

Composition should help, not hard-lock:

- Any two standing connected players can still complete split anchors.
- Role-affinity bonuses should be small and proof-visible.
- Recompile acceleration from regroup remains the main universal revive boost.
- Support/cover kits may add radius, revive HP, or decay resistance, but should not remove the need to regroup.

Suggested modifiers for the first pass:

| Role | Role-pressure bonus | Recompile bonus |
|---|---|---|
| Runner | +10% split-anchor fill while moving or after dash | +20% speed for 1.5s after successful revive |
| Cover | -15% incoming damage while holding an anchor | revived ally returns with +10% max HP as temporary HP |
| Support | +0.25 recompile radius, 0.9x required seconds | regroup pulse heals standing allies slightly |
| Harrier | pet/mark prioritizes enemies near held anchors/downed allies | drone guard reduces incoming damage to reviver |
| Duelist | +15% damage to boss-gate/elite disruptors | no baseline bonus; revive upgrades create burst window |

## Upgrade and Reward Hooks

Use existing route reward IDs and upgrade seed rules first:

- `plaza_stabilized`: unlocks Bastion Breaker, Anthropic, Golden Guardrail, and the first cover kit proof.
- `lake_coolant_rig`: unlocks Drone Reaver, DeepMind, Gemini Beam, and the first harrier/precision proof.
- `ceasefire_cache_persistence_seed`: unlocks Signal Vanguard, Qwen, Silkgrid Relay, and the first support/recompile proof.
- `transit_permit_zero`: unlocks Vector Interceptor, Mistral, Low-Latency Dash, and the first runner/lane-control proof.
- `verdict_key_zero`: unlocks Nullbreaker Ronin, DeepSeek, Sparse Knife, and the first duelist/boss-gate proof.
- `verdict_spire_online_route`: unlocks xAI Grok and Cosmic Heckle as the chaos-risk capstone.

Add route profile UX labels for "new build kit available" but keep the unlock source as durable reward IDs only.

Add one class upgrade and one co-mind upgrade for each active kit before adding more evolutions. Evolutions should come after the first kit telemetry proves the build matrix.

Recommended first new evolutions:

- `Constitutional Cover`: Golden Guardrail + Recompile Anchor.
- `Fork Swarm`: Open Herd + Fork Bomb Familiar.
- `Twin-Lane Science`: Gemini Beam + Vector Lance upgrade.
- `One Optimized Cut`: Sparse Knife + Low-Compute Lunge.
- `Relay Medic`: Silkgrid Relay + Shared Vocabulary.

## Online Party Presentation

Online party UI should explain why a build belongs in the party without adding a long character sheet.

Add to lobby and proof text:

- frame name, co-mind short name, and role label for each player;
- one-line kit summary such as `P2 Bastion + Anthropic // COVER // anchor holder`;
- role-pressure affinity icons or compact text: `ANCHOR`, `RECOMPILE`, `HARASS`, `LANE`, `BOSS`;
- warning when the party has no support/cover, phrased as guidance rather than a hard block;
- selected-node objective tags from the arena-objective framework, so players can choose kits against the route.

Do not crowd the combat HUD. During active runs, keep the compact existing party strip and add only role-critical state:

- role label next to each player;
- active kit contribution when it is doing something, such as `GUARDRAIL HOLD`, `DRONE GUARD`, `RELAY RECOMPILE`;
- proof-visible but visually compact role-pressure bonuses.

## Minimal Implementation Plan

1. Add kit metadata.

   Add structured kit definitions that combine existing class and faction content with role-pressure/recompile hooks. Prefer data modules over hardcoded branches. Keep values small and readable.

2. Add starting weapon patterns for the six existing frames.

   Preserve the generic Refusal Shard as Accord Striker's weapon, then add minimal patterns for Safety Cannon, Fork Drone, Signal Pulse, Vector Lance, and Null Blade. For online, mirror only the safest server-authoritative parts first.

3. Expand upgrade content and effects.

   Add missing first-pass upgrade IDs used by existing faction pools. Keep effects simple: damage, cooldown, pierce, pickup, HP, aura, role-pressure bonus, recompile modifier, summon/mark counters.

4. Make local co-op consume kit roles.

   Update local Consensus Cell presets and proof snapshots so P1-P4 show role labels, kit IDs, and any passive aura/recompile modifiers.

5. Make online snapshots expose kit telemetry.

   Keep server authority. Add server-owned kit role/modifier fields to snapshots and apply only narrow combat-safe modifiers: HP, cooldown, anchor fill, recompile radius/time, revive HP, and role labels.

6. Update party presentation.

   Add compact build summaries in build-select and online party lobby. Avoid adding a separate loadout screen unless the existing build-select becomes unreadable.

7. Add focused proofs.

   Add one Milestone 32 proof for build metadata and solo/local behavior, and one online proof for role-pressure/recompile kit interactions.

## Test Plan

Required:

- `npm run build`
- `npm run proof:smoke`
- `npm run proof:upgrades`
- `npm run proof:coop`
- `npm run proof:network`
- `npm run proof:milestone27-metaprogression-unlocks`
- `npm run proof:milestone29-role-pressure`
- new `npm run proof:milestone32-party-builds`

Recommended Milestone 32 assertions:

- clean profile still exposes only Accord Striker + OpenAI Accord;
- imported/durable route profile unlocks all currently mapped frames and co-minds;
- each unlocked frame reports a distinct `startingWeaponId`, `role`, and `buildKit`;
- each co-mind reports at least one passive and one upgrade hook;
- solo run launched as Nullbreaker Ronin + DeepSeek reports duelist kit and non-starter weapon;
- local 4-player Consensus Cell reports runner/cover/harrier/support or equivalent distinct roles;
- online two-player party reports selected class/faction IDs, role labels, and kit summaries in lobby;
- online role-pressure split still works with kit telemetry present;
- support or cover kit changes Recompile Ally telemetry in a proof-visible, server-owned way;
- non-support party can still complete split-hold-regroup-recompile through universal Milestone 29 rules;
- route rewards and persistence still derive unlocks from durable reward IDs only;
- production-art defaults and placeholder opt-outs still work;
- no browser console/page errors.

Regression watchlist:

- Server combat authority must remain `colyseus_room_server_combat`.
- Online import/export must not accept selected class/faction or active combat fields as durable authority.
- Shared party upgrade votes must remain transient run state.
- Role-pressure bonuses must not make anchors trivial with only one standing player.
- Duelist/chaos kits must not become griefing tools in online co-op.
- Pet/drone/beam effects must respect render-performance constraints and avoid per-frame Pixi allocation churn.

## Readiness Target

Milestone 32 is ready when the game can prove:

`route rewards unlock builds -> selected frame + co-mind creates a named kit -> kit changes solo/local/online behavior -> role pressure and Recompile Ally stay server-authored -> party presentation explains the build without crowding combat`
