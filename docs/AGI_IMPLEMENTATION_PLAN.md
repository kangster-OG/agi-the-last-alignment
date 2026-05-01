# AGI: The Last Alignment — Implementation Plan

This plan translates `docs/AGI_The_Last_Alignment_Creative_Bible.md` into buildable milestones for the existing PixiJS prototype.

## Current State

The repo currently contains a functional placeholder vertical slice:

- Vite + TypeScript + PixiJS.
- Isometric projection and camera.
- Overworld node entry.
- One small survival arena.
- Auto-combat, enemies, XP pickups, upgrades, miniboss, completion/death flow.
- Deterministic proof hooks and Playwright proof scripts.

The current snack/coupon/receipt content is throwaway scaffolding. Keep the systems where useful; replace the identity.

## Build Strategy

Do not try to build the whole bible at once.

The right next move is to convert the prototype into a durable AGI foundation:

1. Lock the real content schema and IDs.
2. Replace the placeholder theme with the first AGI region and arena.
3. Enlarge maps dramatically.
4. Separate simulation from rendering enough to support future Colyseus co-op.
5. Upgrade the overworld from abstract nodes into a dense Alignment Grid diorama.
6. Add art/asset pipeline hooks while still using placeholder/generated art.

## Milestone 0 — Repo Canonicalization

Goal: make the repo clearly become `AGI: The Last Alignment`.

Tasks:

- Preserve the Creative Bible in `docs/`.
- Update durable direction docs and AGENTS instructions.
- Add legal/parody disclaimer text for menu/credits/repository use.
- Add brand asset handling for official logos as third-party/parody faction identifiers.
- Add asset provenance tracking.
- Rename package/project metadata where appropriate.
- Keep all proof scripts working.

Exit criteria:

- Future Codex threads can understand the game by reading repo docs.
- Existing prototype still builds and proofs pass.

## Milestone 1 — AGI Content Data Foundation

Goal: move creative content into structured data so gameplay can be driven by the bible.

Add data modules for:

- Factions.
- Combat classes.
- Enemy families.
- Regions.
- Arenas.
- Bosses.
- Upgrades.
- UI/system message strings.

Use stable IDs from the bible:

- Starter class: `accord_striker`.
- Starter faction: `openai_accord`.
- First region: `armistice_zone`.
- First arena: `armistice_plaza`.
- First boss: `oath_eater`.
- Starter enemy family: `bad_outputs`.

Exit criteria:

- The current run state reads arena/faction/class/boss names from data instead of hardcoded snack placeholders.
- `render_game_to_text()` exposes selected class/faction/arena/boss IDs.

## Milestone 2 — Rebrand The Playable Vertical Slice

Goal: replace the current placeholder slice with the first real AGI slice.

Replace:

- `Snack Mire` -> `Armistice Plaza`.
- `Manager of Spoons` -> `The Oath-Eater`.
- XP pickups -> `Coherence Shards`.
- Level-up cards -> emergency patches.
- Death/victory copy -> Creative Bible UI tone.
- Placeholder enemies -> `Bad Outputs`, with at least one readable silhouette.
- Placeholder player -> `Accord Striker` + `OpenAI Accord Division`.

Add:

- Pre-arena briefing screen, three lines max.
- Boss warning/title card.
- Victory message: `ALIGNMENT NODE STABILIZED`.
- Death message: `FRAME DESTROYED`.
- Basic legal/parody disclaimer reachable from menu/credits.
- Initial logo/provenance placeholders for frontier factions if official logos are added in this milestone.

Exit criteria:

- The game reads as `AGI: The Last Alignment` from menu through run summary.
- The old snack/coupon theme is gone from user-facing text.
- Existing proofs are updated to assert AGI state names.

## Milestone 3 — Large Map Foundation

Goal: stop treating arenas as tiny combat boxes.

Detailed handoff: `docs/MILESTONE_3_LARGE_MAP_FOUNDATION.md`.

Implement:

- Larger arena dimensions.
- Camera-follow exploration with sensible bounds.
- Spawn regions instead of center/near-player-only spawning.
- Off-screen enemy entry points.
- Landmark/sub-zone definitions inside an arena.
- Distributed props and terrain decals.
- Optional mini-objectives such as patch towers, relay points, or survival zones.

First target:

- `Armistice Plaza` should become a large ruined treaty-square/city-zone map with multiple sub-areas:
  - treaty monument
  - barricade corridor
  - crashed drone yard
  - emergency alignment terminal
  - cosmic breach crack

Exit criteria:

- The player can roam significantly before hitting boundaries.
- Enemies approach from believable off-screen or landmark sources.
- Proof scripts validate long traversal, not just static survival.

## Milestone 4 — Alignment Grid Overworld

Goal: evolve the overworld into a playable miniature world map.

Replace abstract tile-field nodes with:

- The Alignment Grid.
- Landmark nodes/buildings.
- Road/path routes that become stable when completed.
- Big pixel labels above enterable locations.
- `ENTER` prompt under active node label.
- Region-style visual language.
- Completed/uncompleted route states.

First overworld should include:

- `Armistice Plaza`
- `Cooling Lake Nine`
- `Transit Loop Zero`
- at least one `Faction Relay`
- at least one `Refuge Camp` or `Memory Cache`

Exit criteria:

- The overworld feels like a miniature world, not an icon board.
- Completing `Armistice Plaza` stabilizes the road to the next node.

## Milestone 5 — Combat Identity And Upgrade Drafts

Goal: make builds feel like combat class + co-mind, not generic stat cards.

Implement:

- Class selection shell, starting with `Accord Striker`.
- Faction co-mind selection shell, starting with `OpenAI Accord Division`.
- Base stats by class.
- Faction upgrade pools.
- General upgrade pool.
- Emergency patch draft UI.
- At least one upgrade evolution path.

Starter build identity:

- Accord Striker: fast breach fighter, evasive movement, pickup range.
- OpenAI Accord Division: balanced, rerolls, shields, patch/refusal flavor.

Exit criteria:

- A run has visible class/faction identity.
- Upgrade names and descriptions use AI terminology + combat words + cosmic stupidity.

## Milestone 6 — Boss / Dialogue / UI Grammar

Goal: add the reference-style big character moment without turning the game into a visual novel.

Implement:

- Boss title card system.
- Short dialogue overlay with portrait slots.
- AGI pressure warning.
- Boss mechanics scaffold for `The Oath-Eater`.
- HUD restyle toward emergency OS + meme-arcade UI.

Oath-Eater starter mechanics:

- Broken Promise hazard zones.
- Bad Output page-spawns.
- Treaty monument charge/impact attack.
- Optional temporary friendly-drone betrayal later.

Exit criteria:

- Boss arrival is memorable.
- Dialogue is short, funny, and immediately returns to action.

## Milestone 7 — Co-op Readiness Before Networking

Goal: prepare architecture for Colyseus without prematurely shipping multiplayer.

Refactor toward:

- Pure simulation update separate from Pixi rendering.
- Multiple player entities in local simulation.
- Serializable input commands.
- Server-friendly state snapshots.
- Per-player class/faction/build state.
- Player count scaling hooks.

Do not add Colyseus until the simulation/render split is healthy.

Exit criteria:

- Local simulation can support 2-4 player entities without network code.
- Proof hooks expose all players.

## Milestone 8 — Colyseus Co-op Prototype

Goal: first online co-op room.

Implement:

- Colyseus server package.
- `ConsensusCellRoom` with `maxClients = 4`.
- Client connection flow.
- Authoritative player input/state.
- Shared arena start.
- Basic enemy sync.
- Two-browser Playwright smoke proof.

Exit criteria:

- Two local browser clients can join one room and move independently in the same arena.
- Solo mode still works.

## Milestone 9 — Asset Pipeline

Goal: prepare production art without blocking gameplay.

Implement:

- `ART_PROVENANCE.md`.
- Asset manifest structure.
- Sprite atlas loading.
- Placeholder asset naming conventions.
- PixelLab production workflow notes.
- Manual cleanup checklist.

Exit criteria:

- Generated/imported assets have source/tool/license records.
- Sprite origins and iso feet alignment are documented.

## Proof Plan

Keep and expand existing proof scripts.

Required proofs after AGI rebrand:

- `proof:smoke`: menu -> overworld -> Armistice Plaza.
- `proof:movement`: screen-intuitive movement on large map.
- `proof:overworld`: Alignment Grid labels and node entry.
- `proof:horde`: Bad Outputs spawn and projectiles/Coherence Shards work.
- `proof:upgrades`: emergency patch draft appears and applies.
- `proof:boss`: Oath-Eater title/warning and boss state.
- `proof:full`: clear Armistice Plaza and stabilize route.

Later multiplayer proofs:

- two-client room join
- two-client movement
- revive/recompile flow
- 4-client room cap

## Immediate Next Implementation Recommendation

Start with Milestones 0-2 in one focused pass:

1. Add canonical data files for factions/classes/enemies/regions/arenas/bosses/upgrades.
2. Update menu/HUD/copy to AGI.
3. Replace current arena with Armistice Plaza names and first-pass visuals.
4. Update proof expectations and screenshots.
5. Run build and proof suite.

Then do Milestone 3 as the first major gameplay/level-design pass.
