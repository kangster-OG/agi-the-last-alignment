# Milestone 22: Online Party Rewards and Route Progression

## Goal

Make online route completion produce clear party progression across multiple launchable nodes.

## Implemented Scope

- Added a server-owned prototype reward policy:
  - node completion rewards;
  - cumulative party renown;
  - reward inventory IDs;
  - node completion counts;
  - recommended next node.
- Armistice Plaza now grants `plaza_stabilized` and party renown on first online clear.
- Cooling Lake Nine now grants `lake_coolant_rig` and party renown on first online clear.
- First Cooling Lake clear also records the route reward `cooling_lake_online_route`.
- Completion summaries now include:
  - active arena ID;
  - reward ID/name;
  - first-clear flag;
  - renown gained;
  - cumulative party renown.
- Party snapshots now include reward state so the lobby/party grid can display route progression.
- Online proof text now exposes:
  - `online.rewards`;
  - `online.party.rewards`;
  - `level.rewards`.
- The online run summary HUD displays the awarded reward and renown gain.

## Runtime Defaults

Rewards are prototype room-state rewards for the current online session.

They are:

- server-owned;
- retained while the room lives;
- visible in online snapshots and party snapshots;
- reset when a fresh Colyseus room is created.

## Proof Expectations

Milestone 22 adds:

- `npm run proof:milestone22-party-rewards`

The proof verifies:

- Armistice Plaza completion grants the Plaza reward and renown;
- returning to the party grid preserves reward state;
- the party recommendation points at Cooling Lake Nine after Armistice Plaza;
- Cooling Lake Nine completion grants the Lake reward;
- cumulative reward inventory retains both route rewards;
- party renown accumulates across both online completions.

## Remaining Risks

- Rewards are session-scoped room state, not account save data.
- Renown values are prototype tuning.
- Reward UI is intentionally compact and still needs a richer party-grid presentation.
- Reward unlocks do not yet feed into new classes, co-minds, equipment, or metaprogression.

## Next Recommended Milestone

Milestone 23 should likely be `Online Route Depth and Persistence Prep`.

Priority:

- add a third online route node or a richer non-combat party node interaction;
- decide which room rewards should become saved progression;
- prepare a persistence boundary without breaking free browser-playable local/online proofs;
- continue expanding distinct region mechanics while preserving the current server authority and reconnect-safe lifecycle.
