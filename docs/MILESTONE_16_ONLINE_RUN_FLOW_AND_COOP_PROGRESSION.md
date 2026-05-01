# Milestone 16: Online Run Flow and Co-op Progression

## Goal

Turn the Milestone 15 online combat prototype into a more complete online run loop. Online Consensus Cell mode should begin to feel like a real co-op session rather than a direct arena join with synced combat.

## Current Starting Point

Milestone 15 is complete. The online `consensus_cell` Colyseus room now owns and syncs combat-critical state for Armistice Plaza:

- `schemaVersion: 2`
- `networkAuthority: "colyseus_room_server_combat"`
- players with HP, XP, level, facing, velocity, and input sequence
- enemies
- projectiles
- Coherence Shard pickups
- kill and pickup counters
- Oath-Eater boss spawn state
- Broken Promise zones
- Treaty Charge warning/impact state
- online HUD combat phase/pressure

The online client renders synced projectiles, pickups, boss labels, Broken Promise zones, and Treaty Charge warnings using the default production-art path.

Online UX currently supports:

- `C` from the main menu to enter online Consensus Cell mode.
- `R` while online to reconnect.
- `Esc` while online to leave back to the main menu.

## Milestone 16 Scope

Prioritize the run-flow systems that make online co-op feel durable:

- Add an online party/session phase before active combat:
  - joining
  - lobby/ready
  - active run
  - completed/failed
  - returning/left
- Add ready state per player and a server-owned start condition.
- Add a clear party HUD for player readiness, connection state, and run phase.
- Add server-authored XP and upgrade progression policy:
  - decide shared XP vs semi-shared XP for this prototype;
  - expose upgrade-ready state in snapshots;
  - add a first server-owned upgrade choice path or a deliberately scoped shared emergency patch draft.
- Add online run completion and failure:
  - completion when the boss is defeated and survival target is met;
  - failure when all players are downed or disconnected long enough;
  - proof-visible summary state.
- Add first `Recompile Ally` revive/downed flow:
  - downed player state;
  - revive radius/timer;
  - proof-visible revive progress;
  - no full revive animation requirement yet.
- Preserve the existing direct combat proof behavior where useful, but update it for the new phase model.

## Out of Scope

- Full party overworld map voting across multiple nodes.
- Full account/auth/matchmaking UI.
- Official logos or new third-party brand assets.
- A full map editor.
- PixelLab usage unless the user is ready to log in manually.

## Technical Priorities

- Keep Colyseus as the online framework.
- Keep the server authoritative for damage, XP, boss state, pickups, projectiles, completion, and failure.
- Keep clients sending input intents and menu/session actions only.
- Keep `window.render_game_to_text()` and `window.advanceTime(ms)` working.
- Preserve the render performance hotfix:
  - do not reintroduce per-frame mass Pixi allocation;
  - continue using reusable graphics/sprite pools for dynamic online rendering;
  - keep static terrain/props cached.
- Prefer small pure simulation helpers if logic begins to duplicate `LevelRunState`.
- Do not break solo, local co-op, or default production art.

## Suggested Implementation Order

1. Add room/run phase fields to the Colyseus snapshot and TypeScript online types.
2. Add ready/unready client messages and server handling.
3. Update `OnlineCoopState` input handling and HUD for ready/start/leave/reconnect.
4. Gate server combat updates behind the active-run phase.
5. Add downed/revive state and Recompile Ally server logic.
6. Add shared XP/upgrade-ready state and one scoped shared upgrade decision.
7. Add online completion/failure summary state.
8. Add `npm run proof:milestone16-online-flow`.
9. Run full relevant regression proofs.
10. Update `progress.md` with changes, tests, screenshots, readiness, and the next milestone.

## Proof Expectations

Add a dedicated proof script:

- `npm run proof:milestone16-online-flow`

It should validate at minimum:

- two browser clients join the same room;
- both clients see lobby/ready state;
- readying clients starts the active run;
- server combat still syncs after active start;
- at least one player can enter downed/revive-related state, or the revive path is deterministically forced for proof;
- shared XP or upgrade-ready state appears;
- online completion or failure summary is proof-visible;
- reconnect/leave controls remain proof-visible;
- no browser console errors.

Regression suite should include:

- `npm run build`
- `npm run proof:assets`
- `npm run proof:milestone15-online-combat`
- `npm run proof:network`
- `npm run proof:coop`
- `npm run proof:smoke`
- `npm run proof:movement`
- `npm run proof:overworld`
- `npm run proof:horde`
- `npm run proof:upgrades`
- `npm run proof:boss`
- `npm run proof:full`
- `npm run proof:asset-preview`
- `npm run proof:asset-combat`
- `npm run proof:milestone10-art`
- `npm run proof:milestone11-art`
- `npm run proof:milestone12-art`
- `npm run proof:milestone13-default`
- `npm run proof:milestone14-combat-art`

## Screenshots to Inspect

Inspect current context before editing:

- `docs/proof/milestone15-online-combat/milestone15-server-combat-a.png`
- `docs/proof/milestone15-online-combat/milestone15-server-combat-b.png`
- `docs/proof/milestone15-online-combat/milestone15-pickups.png`
- `docs/proof/milestone15-online-combat/milestone15-boss-event-a.png`
- `docs/proof/milestone15-online-combat/milestone15-boss-event-b.png`
- `docs/proof/network/client-a-moved.png`
- `docs/proof/network/client-b-moved.png`
- `docs/proof/coop/consensus-cell-run.png`
- `docs/proof/full/full-gate.png`

## Readiness Decision Target

By the end of Milestone 16, online co-op does not need to be a finished public feature, but it should have a coherent proofed run lifecycle:

`join -> ready -> active run -> down/revive/upgrade progression -> completion/failure -> leave/reconnect-safe state`

The next milestone after that should likely be either:

- Milestone 17: Online Party Overworld and Node Voting, or
- Milestone 17: Co-op Upgrade Drafts and Recompile Ally Polish,

depending on whether the run-flow or build-progression gaps feel more urgent after playtest.
