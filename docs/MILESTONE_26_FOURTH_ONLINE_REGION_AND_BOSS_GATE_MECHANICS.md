# Milestone 26: Fourth Online Region and Boss-Gate Mechanics

## Goal

Extend the proofed online route beyond Transit Loop Zero with one cohesive route-depth chunk: a fourth launchable online arena plus distinct server-owned boss-gate pressure.

## Implemented Scope

- Added `Verdict Spire` as a new online-supported Boss Gate node after Transit Loop Zero.
- Added `route_transit_verdict` / `Appeal Ramp` to the Alignment Grid route spine.
- Added `verdict_spire` to the Colyseus room's online arena registry:
  - map ID `verdict_spire_online_adjudication_gate`;
  - region label `Adjudication Rupture`;
  - boss `The Injunction Engine`;
  - reward `verdict_key_zero`;
  - route marker `verdict_spire_online_route`.
- Added server-owned Verdict Spire region pressure:
  - `verdict_seal` region events;
  - server-authored hazard zones with damage over time;
  - Injunction Engine boss-gate pulses that spawn additional writ enemies from the room.
- Added a Milestone 26 production route landmark atlas:
  - `assets/props/online_route/verdict_spire_landmarks_v1.png`;
  - manifest ID `prop.online_route.verdict_spire_landmarks_v1`;
  - provenance key `milestone26_verdict_spire_landmarks_v1`.
- Added runtime loader `src/assets/milestone26Art.ts`.
- Wired Verdict Spire art into the default production-art path while preserving the existing opt-outs:
  - `?productionArt=0`;
  - `?placeholderArt=1`.
- Added a distinct cached static Verdict Spire arena scene and party-grid node presentation.

## Authority and Persistence Notes

Milestone 26 keeps all online combat and route-critical state owned by the Colyseus room:

- route unlocks and completion;
- Verdict Spire hazards;
- boss spawn/HP;
- enemies/projectiles/pickups;
- rewards;
- route persistence export.

Prototype local persistence imports durable route/profile fields only. It now recognizes the new durable reward IDs, but still does not import active combat state.

## Proof Expectations

Milestone 26 adds:

- `npm run proof:milestone26-fourth-region-boss-gate`

The proof verifies:

- Milestone 26 production asset count;
- Transit completion unlocks Verdict Spire;
- the route UI reports Verdict Spire as a launchable Boss Gate;
- Verdict Spire active run preserves `networkAuthority: "colyseus_room_server_combat"`;
- the active region event reports `Adjudication Rupture` / `verdict_seal`;
- Verdict Seal hazard zones are server-authored;
- Verdict completion grants `verdict_key_zero`;
- durable persistence includes `verdict_spire`.

## Readiness Decision

Milestone 26 is ready when the online route proves this path:

`Armistice Plaza -> Cooling Lake Nine -> Ceasefire Cache -> Transit Loop Zero -> Verdict Spire`

and Verdict Spire behaves as a distinct boss-gate encounter rather than a reskinned Transit proof.

## Next Bigger Milestones

### Milestone 27: Metaprogression Rewards and Build Unlocks

Make route rewards matter by tying durable rewards to class/co-mind/upgrades/equipment unlocks while keeping local prototype persistence clearly separated from account/cloud persistence.

### Milestone 28: Production Art Expansion for Online Route

Do a broader art pass across Cooling Lake, Cache, Transit, Verdict Spire, enemy/VFX readability, and party-grid landmarks after the route mechanics settle.

### Milestone 29: Online Party Role Pressure and Revive Depth

Deepen co-op identity with support/role pressure, clearer Recompile Ally tradeoffs, and route encounters that intentionally ask players to split, regroup, and cover each other.
