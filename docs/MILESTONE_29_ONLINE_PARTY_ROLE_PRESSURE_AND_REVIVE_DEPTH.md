# Milestone 29: Online Party Role Pressure and Revive Depth

## Goal

Make online co-op ask the party to split, cover, and regroup before reviving, while preserving Colyseus server combat authority and all existing route/progression behavior.

This is still a prototype online co-op layer. It does not add matchmaking, account persistence, cloud saves, or final class-kit balance.

## Implemented Scope

- Added server-owned role-pressure anchors for online combat arenas:
  - Armistice Plaza;
  - Cooling Lake Nine;
  - Transit Loop Zero;
  - Verdict Spire.
- Added a `split -> split_hold -> regroup` pressure loop:
  - at least two connected standing players must hold separate anchors;
  - the server tracks distinct anchor holders and split-hold progress;
  - a successful split hold opens a timed regroup window.
- Deepened Recompile Ally during the regroup window:
  - recompile radius expands from `2.35` to `3.2`;
  - required recompile time drops from `2.4s` to `1.45s`;
  - proof text reports the acceleration and base values.
- Added server-authored role-pressure telemetry:
  - policy `split_hold_regroup_recompile_v1`;
  - active phase;
  - anchor state and holders;
  - player role labels;
  - completed split-hold count;
  - regroup timer;
  - recompile radius/speed modifiers.
- Added online HUD/readability support:
  - role-pressure anchor rings and labels render in active online runs;
  - HUD reports role-pressure phase and held-anchor count;
  - regroup window labels show the recompile multiplier.
- Preserved existing online state contracts:
  - `schemaVersion: 4`;
  - `networkAuthority: "colyseus_room_server_combat"`;
  - server-owned enemies, projectiles, pickups, HP, XP, upgrades, boss state, hazards, rewards, route state, and persistence export.

## Proof

Milestone 29 adds:

- `npm run proof:milestone29-role-pressure`

The proof verifies:

- online Armistice Plaza launches with server combat authority intact;
- role-pressure anchors are present and server-authored;
- forced split-anchor assignment opens a regroup window;
- regroup accelerates Recompile Ally with a larger radius and shorter required time;
- a downed local player is recompiled during the regroup window;
- normal route reward/completion behavior still works;
- completion summary includes role-pressure split-hold telemetry.

## Readiness Decision

Milestone 29 is ready when the proofed online co-op loop demonstrates:

`split to hold anchors -> regroup window opens -> Recompile Ally is faster/wider -> run completion and route rewards remain intact`

without changing combat authority or importing any combat/run state into persistence.

## Next Bigger Milestones

### Milestone 30: Save Profile UX and Export Codes

Turn the prototype local route profile into a player-facing save/import/export/reset flow with explicit browser-local boundaries.

### Milestone 31: Arena Objective Framework and Modular Online Arena Configs

Extract arena configs/objectives enough that future arena pods can be built in parallel with less conflict in server and proof files.

### Milestone 32: Class and Co-Mind Kit Completion

Make the unlocked frames and frontier co-minds play differently through weapons, upgrade pools, role identities, and stronger class/co-mind synergies.
