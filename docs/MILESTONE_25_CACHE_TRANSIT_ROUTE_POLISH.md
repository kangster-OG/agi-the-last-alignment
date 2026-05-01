# Milestone 25: Cache/Transit Production Art and Route Polish

## Goal

Make the current online route feel more authored before adding more route depth.

This is intentionally a larger cohesive milestone: improve Ceasefire Cache and Transit Loop Zero presentation, polish the party-grid route UI, and prove the existing online route still preserves server combat authority and prototype persistence behavior.

## Implemented Scope

- Added a Milestone 25 production route landmark atlas:
  - `assets/props/online_route/route_landmarks_v1.png`;
  - manifest ID `prop.online_route.cache_transit_landmarks_v1`;
  - provenance key `milestone25_cache_transit_route_landmarks_v1`.
- Added runtime loader `src/assets/milestone25Art.ts`.
- Ceasefire Cache now uses production route props for:
  - Ceasefire Cache core;
  - Persistence Seed;
  - Archive Switchback.
- Transit Loop Zero now uses production route props for:
  - Transit Loop platform;
  - Arrival/No Refund route pylons.
- Online party grid now uses richer landmark sprites when production art is enabled:
  - existing Alignment Grid landmark atlas for standard nodes;
  - Milestone 25 Cache/Transit route atlas for Cache and Transit nodes;
  - stable-route pylons on stabilized paths.
- Party-grid labels were adjusted to reduce overlap near crowded vote nodes.
- The online route-profile panel now includes:
  - route depth;
  - stable route count;
  - selected node type;
  - selected node launchability;
  - current export hash;
  - compact reward summary.
- Proof text now exposes `online.routeUi` for route panel state.

## Runtime Defaults

Milestone 25 route art is part of the default production-art path.

The existing debug opt-outs still apply:

- `?productionArt=0`
- `?placeholderArt=1`

The new props are drawn only in cached static online scene layers, preserving the render performance hotfix.

## Proof Expectations

Milestone 25 adds:

- `npm run proof:milestone25-route-polish`

The proof verifies:

- production asset count includes the Milestone 25 route atlas;
- Cache vote state exposes the route UI panel and Memory Cache node type;
- Cache remains launchable and completes through the existing party-ready flow;
- Transit unlocks and becomes launchable after Cache;
- Transit vote state exposes Boss Gate node type and route depth;
- Transit active run preserves `networkAuthority: "colyseus_room_server_combat"`;
- Transit still exposes the Unreal Metro Line / `false_track` route hazard metadata;
- Transit completion still grants `transit_permit_zero` and writes persistence profile completion.

## Readiness Decision

Milestone 25 is a route-quality milestone, not a new persistence or networking architecture milestone.

The online route now has a stronger authored presentation for the current four-node path:

1. Armistice Plaza.
2. Cooling Lake Nine.
3. Ceasefire Cache.
4. Transit Loop Zero.

## Remaining Risks

- Cache and Transit still need a full PixelLab/Aseprite production-art pass later if the target is final shipped art.
- Transit boss mechanics remain prototype-speed and need a full boss-gate design pass.
- The party grid still has dense labels when multiple players stack on a selected node; Milestone 25 reduces the worst overlap but does not replace the whole route UI.
- Rewards are still prototype route rewards, not build-affecting metaprogression.

## Next Bigger Milestones

### Milestone 26: Fourth Online Region and Boss-Gate Mechanics

Add one new route branch and one deeper authored online encounter around boss-gate mechanics. Keep it cohesive: route depth plus combat identity for the new branch.

### Milestone 27: Metaprogression Rewards and Build Unlocks

Make route rewards matter by tying durable rewards to class/co-mind/upgrades/equipment unlocks while keeping prototype local persistence clearly separated from account/cloud persistence.

### Milestone 28: Production Art Expansion for Online Route

Do a broader art pass across Cooling Lake, Cache, Transit, enemy/VFX readability, and party-grid landmarks after the route mechanics settle.
