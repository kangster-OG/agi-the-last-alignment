# Milestone 20: Online Region Unlocks and Second Launchable Arena

## Goal

Make the online party route extend beyond Armistice Plaza by unlocking and launching a second distinct online arena.

## Implemented Scope

- `Cooling Lake Nine` is now online-supported after Armistice Plaza is stabilized.
- The server owns a compact arena registry for online runs:
  - `armistice_plaza`;
  - `cooling_lake_nine`.
- Online run launch now selects the active arena configuration from the party-voted node.
- Cooling Lake Nine has its own server-authored configuration:
  - arena/map ID;
  - region label;
  - target duration;
  - boss timing/family metadata;
  - reward metadata;
  - spawn-region set.
- Enemy spawn selection now uses the active arena's spawn regions instead of a single Armistice-only list.
- Online snapshots now expose `mapId`/`arenaId` and region metadata for the active arena.
- The online client rebuilds cached static terrain when the active arena changes.
- Cooling Lake Nine renders with a distinct lake/server-field layout and authored landmarks:
  - Cooling Lake Nine;
  - Server Buoys;
  - Thermal Outflow;
  - Coolant Rig.
- Party snapshots now recommend Cooling Lake Nine after the first Armistice clear.

## Runtime Defaults

Online co-op is still entered from the main menu with `C`.

After completing Armistice Plaza online:

- return to the party grid with `Space`;
- vote to Cooling Lake Nine with the party node controls;
- ready the party;
- the server launches the active run only after the normal ready/vote condition is met.

## Proof Expectations

Milestone 20 adds:

- `npm run proof:milestone20-second-online-region`

The proof verifies:

- two clients complete Armistice Plaza online;
- Cooling Lake Nine becomes unlocked and online-launchable;
- both clients vote/ready for Cooling Lake Nine;
- the server launches Cooling Lake Nine as the active arena;
- proof text exposes the Cooling Lake arena/region metadata;
- completion summary awards the Cooling Lake prototype reward.

## Remaining Risks

- Cooling Lake Nine uses code-authored pixel geometry, not final production pixel tiles.
- The second arena is compact enough for proof speed and still needs full-size exploration tuning.
- Online route choice is still party-vote prototype UX.
- Only two online arenas are launchable; other unlocked party nodes remain non-combat/unsupported online placeholders.

## Next Recommended Milestone

Milestone 21 should likely be `Online Region Events and Cooling Lake Threats`.

Priority:

- give Cooling Lake Nine its own regional combat pressure;
- prove region-specific server hazards;
- keep server combat authority, reconnect identity, upgrade drafts, Recompile Ally, and party routing intact across both launchable arenas.
