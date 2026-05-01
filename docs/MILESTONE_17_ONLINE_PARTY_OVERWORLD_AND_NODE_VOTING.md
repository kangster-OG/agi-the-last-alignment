# Milestone 17: Online Party Overworld and Node Voting

## Goal

Move online Consensus Cell mode from a direct room-to-run flow into a first party-overworld loop on the Alignment Grid.

## Implemented Scope

- Online rooms now expose a party payload in snapshots:
  - Alignment Grid map identity;
  - selected/voted node;
  - per-player node votes;
  - completed nodes;
  - unlocked nodes;
  - route states;
  - launchable online node IDs.
- The online lobby now renders an Alignment Grid staging map instead of the Armistice Plaza arena.
- Players can vote between available nodes with left/right while in the lobby.
- Space toggles ready in the party lobby.
- The server launches only when the connected party is ready and the majority-selected node is online-supported.
- Armistice Plaza remains the only launchable online combat node for this milestone.
- Completing an online run marks Armistice Plaza complete, unlocks Accord Relay and Cooling Lake Nine in the party state, and stabilizes the Plaza routes.
- Completed/failed online summaries now support `Space` to return to the party Alignment Grid.
- Unsupported unlocked nodes, such as Accord Relay in this milestone, are visible and votable but intentionally do not launch combat yet.

## Runtime Defaults

Online co-op is still entered from the main menu with `C`.

Controls in the online party lobby:

- Left/right: vote node.
- Space: ready/unready.
- `R`: reconnect.
- `Esc`: leave online co-op.

## Proof Expectations

Milestone 17 adds:

- `npm run proof:milestone17-party-overworld`

The proof verifies:

- two clients join one room;
- the first online state is an Alignment Grid party lobby;
- the party launches Armistice Plaza only after readiness;
- completion summary records the voted node;
- Space returns clients to the party grid;
- Armistice Plaza completion unlocks Accord Relay and Cooling Lake Nine;
- Plaza routes become stable;
- an unsupported unlocked node can be voted but does not launch;
- voting back to Armistice Plaza can launch another active run.

## Remaining Risks

- The party overworld is still a compact broadcast snapshot rather than Schema-backed collections.
- Only Armistice Plaza is online-supported; other nodes are visible staging targets for later milestones.
- Reconnect still creates a fresh client slot rather than reclaiming a previous party slot.
- There is no full party overworld free-walk or host/vote UX polish yet.

## Next Recommended Milestone

Milestone 18 should likely be `Online Co-op Upgrade Drafts and Recompile Ally Polish`.

Priority:

- replace the temporary shared patch prompt with a clearer co-op draft UI;
- decide shared vs individual vs hybrid online upgrade rules;
- polish revive radius/timer communication;
- add better reconnect-to-existing-slot behavior;
- start migrating durable online lifecycle state to Schema-backed collections.
