# Milestone 19: Online Reconnect Identity and Schema Collections

## Goal

Make online co-op reconnect-safe enough for the prototype loop and begin moving durable room lifecycle state into Colyseus Schema-backed collections.

## Implemented Scope

- Online clients now send a stable reconnect key when joining `consensus_cell`.
  - Normal browser play uses `sessionStorage` per tab.
  - Proofs can pass `?reconnectKey=...` for deterministic slot reclaim.
- The Colyseus room now reserves disconnected player slots for a short reconnect window.
  - Disconnected players stay in party presence with `connectionState: "disconnected"`.
  - Rejoining with the same reconnect key reclaims the same player slot and `playerId`.
  - Reconnect receives a fresh Colyseus `sessionId` while preserving run state.
  - Pending upgrade votes migrate from the old session ID to the reclaimed session ID.
- Online snapshots now use `schemaVersion: 4` and expose reconnect lifecycle state:
  - connected/disconnected counts;
  - reclaimed slot count;
  - disconnected player IDs;
  - per-player `playerId`, reconnect count, connected flag, and disconnected timer.
- The server state now has Schema-backed lifecycle collections:
  - `MapSchema<PlayerPresence>`;
  - `ArraySchema<completedNodeIds>`;
  - `ArraySchema<unlockedNodeIds>`;
  - `MapSchema<UpgradeVote>`;
  - `MapSchema<RecompileDowned>`.
- The existing JSON `snapshot` proof surface remains intact and now includes a `lifecycle` summary proving the Schema-backed collections are populated.
- The online HUD now shows connection counts and `REJOIN` status for disconnected party slots.

## Runtime Defaults

Online co-op is still entered from the main menu with `C`.

Reconnect behavior:

- `R` leaves and rejoins using the same per-tab reconnect key.
- Reloading/re-entering online co-op from the same tab reuses the same reconnect key.
- A disconnected slot is held for the prototype reconnect window before it can be pruned.

## Proof Expectations

Milestone 19 adds:

- `npm run proof:milestone19-reconnect-schema`

The proof verifies:

- two online clients join one room with deterministic reconnect keys;
- snapshots report `schemaVersion: 4`;
- lifecycle state reports Schema-backed collections;
- a client can vote in a co-op patch draft, disconnect, and remain visible as a reserved disconnected party slot;
- the same reconnect key reclaims the same `playerId` and slot with a fresh Colyseus `sessionId`;
- the pending upgrade vote migrates to the reclaimed session;
- the co-op patch resolves after reconnect;
- the run can still complete with the reconnected state.

## Remaining Risks

- Schema collections currently mirror the authoritative room model rather than replacing every gameplay array.
- Reconnect is prototype identity, not account identity; it is per tab/session key.
- If every client leaves, the room lifecycle still depends on Colyseus room disposal behavior.
- Disconnected-slot pruning is intentionally conservative and needs production tuning.
- Enemy/projectile/pickup combat state is still broadcast as JSON snapshots from the server-owned simulation.

## Next Recommended Milestone

Milestone 20 should likely be `Online Region Unlocks and Second Launchable Arena`.

Priority:

- make one newly unlocked node online-launchable after Armistice Plaza;
- add a distinct second online arena ruleset or layout;
- preserve reconnect identity, Schema lifecycle state, party voting, co-op upgrade drafts, Recompile Ally, and Milestone 15 server combat authority;
- expand online proof coverage from one launchable node to a two-node online route.
