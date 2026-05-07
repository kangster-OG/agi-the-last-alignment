# Map Kind Expansion Checklist

Date: 2026-05-06

Purpose: convert the map-kind direction into implementation checklists for expanding beyond Armistice without building palette-swapped survival arenas.

## Shared Map Contract

Every playable map should declare:

- map kind;
- objective type;
- pressure source;
- reward promise;
- boss/event pattern;
- difficulty layers;
- primary and secondary pressure levers;
- route/camp/summary carryover;
- proof path.

Use `docs/DIFFICULTY_AND_MAP_SCALING.md` for the durable difficulty vocabulary. New maps should explicitly name their Baseline Contract, Eval Pressure hooks, Route Risk hooks, World Tier assumptions, Mastery Variant potential, and top pressure levers before implementation.

Shared runtime expectations:

- preserve close tactical camera;
- preserve autocombat;
- preserve horde pressure;
- preserve emergency patch drafts;
- preserve route contracts and camp carryover;
- expose map identity through `render_game_to_text()`;
- prove the map with screenshots and state JSON.

## Cooling Lake Nine

Map kind: Hazard Ecology.

Goal: prove that a second arena can feel mechanically different from Armistice without changing autocombat.

Gameplay checklist:

- Add a distinct Cooling Lake map definition with flooded lanes, server buoys, cable routes, vent zones, and safe islands.
- Add a server-buoy or coolant-stabilization objective.
- Add coolant/electric hazard zones that shape movement.
- Feature Prompt Leeches as the main pressure family.
- Add DeepSeek/Qwen route and reward language.
- Add a Motherboard Eel boss/event scaffold.
- Add Summary/Camp carryover for Kettle Coast progress.
- Add `proof:cooling-lake-graybox`.

Art checklist for the later production pass:

- Use Armistice terrain as the fidelity bar, not as the style to copy.
- Generate multiple source chunks for flooded server floor, coolant, cable roots, submerged racks, buoy pads, and abyssal corruption.
- Ground buoys, server wreckage, and cable props into the same material system.
- Use readable enemy silhouettes with internal material breakup.
- Make Motherboard Eel large, padded, grounded, and proofed at close camera.

Exit criteria:

- The run reads as Hazard Ecology in telemetry and screenshots.
- Movement decisions are shaped by the environment.
- Autocombat remains intact.
- The map has its own objective and pressure arc.

## Transit Loop Zero

Map kind: Route / Transit.

Goal: make pathing, false arrivals, and route alignment the main pressure.

Gameplay checklist:

- Add platform/junction map layout.
- Add route-alignment or platform-hold objective.
- Add false-schedule pressure events.
- Add moving lane sweeps or arrival warnings.
- Add Station That Arrives boss/event scaffold.
- Bias rewards toward movement, boss prep, and route control.
- Add `proof:transit-route-graybox`.

Exit criteria:

- The player feels the map lying about where paths go.
- The run is about making a route agree with itself under pressure.
- The boss/event emerges from the route system, not only from a timer.

## Memory Cache

Map kind: Expedition / Recovery.

Goal: make exploration and recovery matter inside the roguelite loop.

Gameplay checklist:

- Add memory-shard record objectives.
- Add multiple recoverable evidence nodes.
- Add Context Rot pressure and memory corruption zones.
- Add optional curator event or miniboss.
- Reward secrets, lore, unlocks, or route knowledge.
- Add `proof:memory-cache-recovery`.

Exit criteria:

- The player explores instead of orbiting a safe combat area.
- The map teaches lore/carryover without becoming a non-gameplay cutscene.

## Faction Relay / Guardrail Forge

Map kind: Defense / Holdout.

Goal: make faction infrastructure and doctrine pressure into playable objectives.

Gameplay checklist:

- Add relay or forge hold zones.
- Add faction-specific pressure waves.
- Add optional risk/reward calibration choices.
- Reward build bias, route stability, or faction-specific camp memory.
- Add `proof:faction-relay-holdout`.

Exit criteria:

- The player chooses when to leave the relay for shards and when to return.
- The reward changes future route/build decisions.

## Corrupted Shortcuts

Map kind: Micro-Run Challenge.

Goal: provide short, spicy, high-risk runs that create secrets and route shortcuts.

Gameplay checklist:

- Create a short duration target.
- Add one extreme modifier.
- Add one clear reward and one failure cost.
- Keep the map compact but not a single-screen box.
- Add secret/unlock telemetry.
- Add `proof:shortcut-micro-run`.

Exit criteria:

- The run is faster than a full arena.
- The modifier is obvious immediately.
- The reward justifies the risk.

## Boss-Hunt Maps

Map kind: Boss Hunt.

Goal: make a boss occupy the map as a living threat before the final fight.

Gameplay checklist:

- Add boss presence before full engagement.
- Add objectives that reveal, weaken, bait, or flush the boss.
- Add district corruption or retreat behavior.
- Add proof for stalking/retreat/engagement states.

Exit criteria:

- The boss is felt before it is fought.
- The map and boss are one encounter, not two separate systems.

## Puzzle-Pressure Maps

Map kind: Puzzle Pressure.

Goal: add spatial combat puzzles that stay arcade-readable.

Gameplay checklist:

- Add a simple spatial rule visible on screen.
- Keep solving action-based: stand, drag, align, route, seal, choose, hold.
- Maintain horde pressure during the puzzle.
- Reward build, route, or secret progress.

Exit criteria:

- The puzzle never pauses the game into a menu.
- The player can understand the rule from movement and feedback.

## Expansion Sequence

Recommended order:

1. Cooling Lake Nine graybox.
2. Cooling Lake proof and balance.
3. Cooling Lake production-art source pass.
4. Transit Loop Zero graybox.
5. Memory Cache or Faction Relay objective map.
6. Micro-run shortcut layer.
7. Boss-hunt and puzzle-pressure maps after at least two non-Armistice maps prove the shared contract.

## Documentation And Proof Requirements

For each new map kind:

- update `docs/GAME_DIRECTION.md` only if the durable direction changes;
- update `docs/AGI_IMPLEMENTATION_PLAN.md` if milestones or sequence change;
- update `progress.md` with implementation and verification notes;
- add proof scripts before declaring the map playable;
- update `ART_PROVENANCE.md` and `assets/asset_manifest.json` only when production assets are added.
