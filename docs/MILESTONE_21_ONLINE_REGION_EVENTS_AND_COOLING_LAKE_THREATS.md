# Milestone 21: Online Region Events and Cooling Lake Threats

## Goal

Make the second online arena mechanically distinct by adding server-owned region events and Cooling Lake-specific combat hazards.

## Implemented Scope

- Added server-owned region-event state for online runs:
  - active arena ID;
  - region label;
  - event family;
  - event counter;
  - active state;
  - hazard-zone list.
- Cooling Lake Nine now periodically spawns `thermal_bloom` hazards around the lake field.
- Cooling Lake boss pressure can create `boiling_cache` hazards during the Thermal Oracle encounter.
- Region hazards are server-owned:
  - spawned by the Colyseus room;
  - expired by server time;
  - included in broadcast snapshots;
  - apply server-side damage to connected players inside the radius.
- Cooling Lake spawn regions include local enemy pressure such as `thermal_mirages`.
- Online proof text now exposes:
  - `online.regionEvent`;
  - `level.regionEvent`.
- The online client renders region hazards with readable rings, labels, and warning color.
- The online HUD appends the active region event family to the combat strip while the event is active.

## Runtime Defaults

Cooling Lake Nine region events run automatically during active online runs.

The player does not need a new input:

- move out of hazard rings to avoid server-owned damage;
- keep normal online controls for patch voting, Recompile Ally, reconnect, and leaving.

## Proof Expectations

Milestone 21 adds:

- `npm run proof:milestone21-region-events`

The proof verifies:

- two clients unlock and launch Cooling Lake Nine;
- a Cooling Lake region event becomes active;
- server snapshots expose at least one authored hazard zone;
- proof text identifies the `thermal_bloom` event family;
- the run can still complete after the event.

## Remaining Risks

- Hazard damage and cadence are prototype values and need tuning with longer real playtests.
- Region-event visuals are readable proof art, not final production VFX.
- The Thermal Oracle boss identity exists as online server metadata/hazard behavior, but still needs a full authored boss art and attack pass.
- Hazard lists are still compact JSON snapshots rather than combat Schema collections.

## Next Recommended Milestone

Milestone 22 should likely be `Online Party Rewards and Route Progression`.

Priority:

- make multi-node online completion leave durable party rewards;
- expose route/reward state in party snapshots and proof text;
- establish a prototype reward policy that later persistence can keep or replace.
