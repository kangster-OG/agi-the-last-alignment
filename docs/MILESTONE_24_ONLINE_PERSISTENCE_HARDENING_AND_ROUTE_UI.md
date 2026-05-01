# Milestone 24: Online Persistence Hardening and Route UI

## Goal

Turn the Milestone 23 prototype persistence boundary into a clearer, safer online route-progress UX without pretending it is final account persistence.

## Current Starting Point

Milestones 0-23 are complete.

Online co-op currently supports this proofed route:

1. Armistice Plaza.
2. Cooling Lake Nine.
3. Ceasefire Cache.
4. Transit Loop Zero.

Milestone 23 added:

- Ceasefire Cache as an online non-combat party interaction node.
- Transit Loop Zero as a third launchable online arena.
- Transit `false_track` server-owned region hazards.
- `online.persistence` / `level.persistence` proof surfaces.
- Browser `localStorage` export at `agi:last_alignment:online_progression:v1`.
- Client sends an existing local progression draft when joining a new room.
- Stable save hash that ignores broadcast tick churn.

The persistence export is a boundary contract, not final trust/account persistence.

## Milestone 24 Scope

Prioritize clarity and safety around saved online route progress:

- Make persistence import state explicit in online HUD and proof text:
  - imported/not imported;
  - imported hash;
  - imported completed-node count;
  - imported reward count;
  - current export hash.
- Add a clear route-progress panel or party-grid overlay:
  - completed route depth;
  - party renown;
  - reward inventory summary;
  - recommended next node;
  - current selected/voted node launchability.
- Add a safe reset path for local prototype persistence:
  - likely query flag `?resetOnlinePersistence=1`;
  - proof-visible confirmation that the local profile was cleared;
  - no accidental reset during normal play.
- Add a deterministic proof for import/export behavior across fresh rooms:
  - complete enough route progress to write `localStorage`;
  - leave/dispose the first room;
  - join a fresh room using the same browser context;
  - prove the server applied the imported profile;
  - prove the party lobby starts with imported completion/unlock/reward state;
  - prove reset removes the import path.
- Keep server authority intact:
  - do not trust imported combat state;
  - do not import HP, XP, active run, enemies, projectiles, upgrade drafts, downed state, or reconnect slots;
  - only import durable route/profile-like fields.

## Out of Scope

- Real account identity.
- Cloud persistence.
- Auth.
- Cross-device save sync.
- Official logos.
- PixelLab production art for Cache/Transit unless the user explicitly wants an art pass.
- A full save-slot UI.

## Suggested Implementation Order

1. Read Milestone 23 code paths:
   - `server/consensusCellServer.mjs`
   - `src/network/OnlineCoopState.ts`
   - `src/network/onlineTypes.ts`
   - `src/proof/renderGameToText.ts`
   - `scripts/proof/run-proof.mjs`
2. Harden persistence import sanitization on the server.
3. Add explicit `resetOnlinePersistence` proof/client behavior if not already enough.
4. Add online HUD/party-grid persistence panel copy and proof text fields.
5. Add `npm run proof:milestone24-persistence-import`.
6. Run the full relevant regression suite, especially Milestones 15-23.
7. Update `progress.md` with changes, tests, screenshots inspected, readiness decision, and the next milestone recommendation.

## Proof Expectations

Add:

- `npm run proof:milestone24-persistence-import`

The proof should verify at minimum:

- local storage export exists after route progress;
- a fresh room imports only durable route/profile state;
- imported profile exposes `importApplied: true`;
- imported completed/unlocked/reward state appears in `online.party`, `online.rewards`, and `online.persistence`;
- reset path clears the local profile and returns to fresh Armistice-only online lobby state;
- no browser console errors.

Regression suite should include:

- `npm run build`
- `node --check server/consensusCellServer.mjs`
- `npm run proof:assets`
- `npm run proof:milestone24-persistence-import`
- `npm run proof:milestone23-route-persistence`
- `npm run proof:milestone22-party-rewards`
- `npm run proof:milestone21-region-events`
- `npm run proof:milestone20-second-online-region`
- `npm run proof:milestone19-reconnect-schema`
- `npm run proof:milestone18-coop-progression`
- `npm run proof:milestone17-party-overworld`
- `npm run proof:milestone16-online-flow`
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

Inspect current M23 context before editing:

- `docs/proof/milestone23-route-persistence/milestone23-cooling-completed-a.png`
- `docs/proof/milestone23-route-persistence/milestone23-cache-vote-a.png`
- `docs/proof/milestone23-route-persistence/milestone23-cache-completed-a.png`
- `docs/proof/milestone23-route-persistence/milestone23-transit-vote-a.png`
- `docs/proof/milestone23-route-persistence/milestone23-transit-active-a.png`
- `docs/proof/milestone23-route-persistence/milestone23-transit-completed-a.png`
- `docs/proof/milestone22-party-rewards/milestone22-cooling-reward-a.png`
- `docs/proof/milestone19-reconnect-schema/milestone19-reclaimed-slot-a.png`

## Readiness Decision Target

By the end of Milestone 24, online persistence should still be labeled prototype/local, but the behavior should be understandable and proofed:

`export route profile -> fresh room imports durable route state -> UI shows imported progress -> reset returns to clean profile`

The next milestone after that should likely be either:

- Milestone 25: Cache/Transit Production Art and Route Polish, or
- Milestone 25: Fourth Online Route Node and Boss-Gate Mechanics,

depending on whether the user wants visual polish or route depth next.
