# Milestone 23: Online Route Depth and Persistence Prep

## Goal

Extend online route play past the first two combat arenas and define a small progression-export boundary that can become real persistence later.

## Implemented Scope

- Added Ceasefire Cache as the first online-supported non-combat party node.
  - It unlocks after Cooling Lake Nine.
  - It completes as a party interaction after the normal all-ready vote condition.
  - It grants `ceasefire_cache_persistence_seed`.
  - It records the route marker `prototype_persistence_boundary`.
- Added Transit Loop Zero as the third launchable online arena.
  - It unlocks after the Ceasefire Cache is decoded.
  - It has its own server arena config, map ID, region label, spawn regions, reward, and completion copy.
  - It grants `transit_permit_zero` and the route marker `transit_loop_online_route`.
- Added Transit Loop Zero's first server-owned region event:
  - event family `false_track`;
  - server-spawned hazard zones;
  - server-side hazard damage;
  - proof-visible region metadata.
- Added distinct client-side static scenes for:
  - Ceasefire Cache;
  - Transit Loop Zero.
- Added prototype persistence export/import prep:
  - snapshot field `online.persistence`;
  - policy `prototype_local_storage_export_v1`;
  - storage key `agi:last_alignment:online_progression:v1`;
  - completed nodes;
  - unlocked nodes;
  - reward IDs;
  - party renown;
  - node completion counts;
  - recommended next node;
  - route depth;
  - stable save hash that ignores broadcast tick churn.
- Online clients now write the latest exportable progression profile into `localStorage`.
- Online clients send any existing local progression draft when joining a fresh room, allowing a future persistence layer to reuse the same profile shape.
- Party HUD now displays a compact save hash/renown/next-node line while in the online lobby.

## Runtime Defaults

Online co-op is still entered from the main menu with `C`.

The proofed route is:

1. Armistice Plaza.
2. Cooling Lake Nine.
3. Ceasefire Cache.
4. Transit Loop Zero.

The persistence export is prototype-local only. It is meant as a contract boundary, not a final account save system.

## Proof Expectations

Milestone 23 adds:

- `npm run proof:milestone23-route-persistence`

The proof verifies:

- Cooling Lake completion recommends and unlocks Ceasefire Cache;
- Ceasefire Cache is visitable online and completes through the party-ready flow;
- Ceasefire Cache grants the persistence seed and unlocks Transit Loop Zero;
- Transit Loop Zero becomes launchable online;
- Transit Loop Zero exposes the Unreal Metro Line region label and `false_track` hazards;
- Transit Loop Zero completion grants route rewards;
- the persistence profile contains Armistice, Lake, Cache, and Transit completions;
- browser `localStorage` contains the matching progression export.

## Remaining Risks

- Persistence is still browser-local prototype state, not account/cloud save data.
- The server applies a client-provided progression draft only as a future-facing prototype import path; it is not trusted production identity.
- Ceasefire Cache and Transit Loop Zero use code-authored scenes, not final PixelLab production assets.
- Transit Loop Zero has proof-speed hazard behavior and still needs its full train/boss design pass.

## Next Recommended Milestone

Milestone 24 should likely be `Online Persistence Hardening and Route UI`.

Priority:

- make persistence import explicit and safer;
- add clear UI for saved route progress, import/reset, and room scope;
- decide whether persistence is per-browser, account-backed, or export-code based;
- add richer party-node UI for Memory Cache/Refuge Camp style interactions;
- keep expanding the online route without weakening the Colyseus server authority model.
