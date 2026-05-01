# Milestone 28: Production Art Expansion for Online Route

## Goal

Broaden the online route's production-art coverage now that route mechanics, persistence import, and metaprogression unlocks are settled.

This milestone is visual/readability focused. It does not add account persistence, new online authority rules, or a new route branch.

## Implemented Scope

- Added a Milestone 28 online-route biome landmark atlas:
  - `assets/props/online_route/route_biome_landmarks_v1.png`;
  - manifest ID `prop.online_route.biome_landmarks_v1`;
  - 8 frames for Cooling Lake, Cache, Transit, Verdict, and stable-route readability props.
- Added a Milestone 28 online threat atlas:
  - `assets/sprites/enemies/online_threats_v1.png`;
  - manifest ID `enemy.online_route.threats_v1`;
  - 8 frames for online boss/threat silhouettes including Thermal Oracle, Station That Arrives, Injunction Engine, false-track threats, and Verdict writs.
- Added a Milestone 28 online hazard marker atlas:
  - `assets/sprites/effects/online_hazard_markers_v1.png`;
  - manifest ID `effect.online_route.hazard_markers_v1`;
  - 8 frames for thermal bloom, boiling cache, false track, verdict seal, recompile, ready, stable route, and boss gate markers.
- Added runtime loader `src/assets/milestone28Art.ts`.
- Wired the new art into default production-art online rendering while preserving:
  - `?productionArt=0`;
  - `?placeholderArt=1`.
- Cached static route scenes now use the expanded art for:
  - Cooling Lake Nine;
  - Ceasefire Cache;
  - Transit Loop Zero;
  - Verdict Spire;
  - the online party-grid route landmarks.
- Dynamic online readability now uses the existing reusable sprite pool for:
  - online boss silhouettes;
  - Verdict writs and route-pressure threats;
  - region-event hazard markers.
- Proof text exposes the art expansion through `online.routeUi.artExpansion`.

## Performance and Authority Notes

- Static props remain in cached scene layers.
- Dynamic threat/hazard markers use the existing reusable Pixi sprite map.
- No server-owned combat state moved to the client.
- Colyseus remains authoritative for enemies, hazards, projectiles, pickups, HP, progression, rewards, and route state.

## Proof Expectations

Milestone 28 adds:

- `npm run proof:milestone28-online-route-art`

The proof verifies:

- production asset count includes the three Milestone 28 atlases;
- online route UI reports `milestone28_online_route_art_expansion`;
- Cooling Lake renders with thermal event art while preserving server combat authority;
- Cache party-grid and completion visuals still work;
- Transit false-track event art still preserves `colyseus_room_server_combat`;
- Verdict party-grid, seal hazard, and boss-gate threat proof still work;
- production-art opt-out disables the Milestone 28 art expansion.

## Readiness Decision

Milestone 28 is ready when the proofed online route still supports:

`Armistice Plaza -> Cooling Lake Nine -> Ceasefire Cache -> Transit Loop Zero -> Verdict Spire`

and each online route segment has more readable production-art landmarks, hazards, and threat silhouettes without weakening online authority.

## Next Bigger Milestones

### Milestone 29: Online Party Role Pressure and Revive Depth

Deepen co-op identity with support/role pressure, clearer Recompile Ally tradeoffs, and encounters that ask players to split, regroup, and cover each other.

### Milestone 30: Save Profile UX and Export Codes

Turn the prototype local profile into a clearer user-facing save/import/export/reset surface while still avoiding account/cloud persistence until that backend direction is chosen.

### Milestone 31: Larger Online Arena Objectives

Move online arenas beyond timed survival by adding larger-route objectives, multi-zone holdouts, route-item extraction, and boss-gate objectives that make the big maps matter more.
