# Milestone 30: Save Profile UX and Export Codes

## Goal

Make the prototype online route profile feel user-facing, recoverable, and portable while staying explicit that this is browser-local prototype persistence, not final cloud/account persistence.

## Implemented Scope

- Added a player-facing local save profile panel to the online Alignment Grid lobby.
- The panel now shows durable route/profile fields:
  - route depth;
  - stable route count;
  - selected/recommended route node;
  - completed/unlocked route state through the existing party grid;
  - reward count and compact reward summary;
  - party renown;
  - current save hash.
- Added export-code UX:
  - route profiles encode as `AGI1_...` export codes;
  - lobby key `1` prepares/copies the export code when browser clipboard access is available;
  - proof text exposes the full export code and compact display code.
- Added import-code UX:
  - lobby key `2` opens a paste prompt for an export code;
  - deterministic/proof import also works with `?importOnlineProfileCode=...`;
  - imported profiles go through the existing server sanitizer and still import only route/profile fields.
- Kept reset behavior explicit:
  - `?resetOnlinePersistence=1` still clears the browser-local profile before joining;
  - lobby key `4` resets the browser-local profile after confirmation and reconnects to a clean room;
  - reset status is visible in HUD and proof text.
- Preserved persistence boundaries:
  - no account identity;
  - no cloud sync;
  - no combat/run state imported;
  - no HP, XP, enemies, projectiles, pickups, downed state, active arena state, boss state, reconnect slots, or upgrade drafts imported from codes.

## Proof

Milestone 30 adds:

- `npm run proof:milestone30-save-profile-export-codes`

The proof verifies:

- a completed route profile exposes the Milestone 30 save/profile surface;
- export code starts with `AGI1_`;
- profile includes completed nodes, unlocked nodes, rewards, renown, route depth, and save hash;
- a fresh browser context imports the export code through `?importOnlineProfileCode=...`;
- server import status remains `applied_sanitized_route_profile`;
- imported route progress unlocks Transit while not importing combat state;
- `?resetOnlinePersistence=1` overrides import code and returns to a clean Armistice-only profile.

## Readiness Decision

Milestone 30 is ready when the online route lobby can explain and recover the local route profile without implying final cloud/account persistence.

Current readiness: ready as a prototype/browser-local save UX. Export/import codes are useful for local recovery, sharing between browser contexts, and deterministic proofing. They are not trusted production saves or anti-cheat-safe cloud profiles.

## Next Bigger Milestones

### Milestone 31: Arena Objective Framework and Modular Online Arena Configs

Extract arena configs/objectives enough that future arena pods can be built in parallel with less conflict in server and proof files.

### Milestone 32: Class and Co-Mind Kit Completion

Make unlocked frames and frontier co-minds play differently through weapons, upgrade pools, role identities, and stronger class/co-mind synergies.

### Milestone 33: Account/Cloud Persistence Decision Spike

Decide whether online profile persistence should stay export-code/browser-local only, move to account/cloud-backed storage, or support both as separate product modes.
