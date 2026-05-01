# Milestone 3 — Large Map Foundation

This is the next implementation milestone after the AGI rebrand.

## Goal

Make `Armistice Plaza` feel like a large explorable isometric place, not a single-screen survival box.

The user explicitly wants maps and individual levels to be much, much bigger than both the current prototype and the X/Twitter reference videos. Treat this as a core design requirement.

## Non-Negotiables

- Do not treat "larger map" as simply increasing `halfSize`.
- The arena needs authored sub-areas, landmarks, spawn sources, and camera-follow traversal.
- The player should be able to roam, kite, discover landmarks, and move through a place that feels like a ruined treaty district.
- Enemy pressure should come from believable off-screen or landmark sources, not only near-player math.
- Keep proof hooks working.
- Update proof scripts so automation verifies traversal across the larger map.

## Armistice Plaza Target

`Armistice Plaza` is the first real level of `AGI: The Last Alignment`.

Theme:

- ruined treaty square
- refugee barricades
- hologram flags
- crashed drones
- emergency alignment terminals
- cosmic cracks in government/civic buildings
- former human/AI enemies forced into one final alliance

Tone:

- serious apocalypse
- frontier lab parody
- dry deadpan UI

## Suggested Map Scale

Current prototype:

- `halfSize: 13`
- still reads as a centered arena

Milestone 3 target:

- at least `halfSize: 28` or equivalent authored tilemap bounds
- camera follows player over a large space
- player cannot see the whole level at once
- traversal from one landmark to another should take several seconds

## Required Sub-Areas

Implement at least five named/visible sub-areas:

- **Treaty Monument**: central landmark, boss pressure origin, Oath-Eater flavor.
- **Barricade Corridor**: narrow-ish route with refugee barricades and broken vehicles.
- **Crashed Drone Yard**: debris field, good enemy spawn source.
- **Emergency Alignment Terminal**: glowing lab/human relay object, possible objective marker.
- **Cosmic Breach Crack**: AGI-corrupted source of Bad Outputs.

They can use placeholder shapes for now, but they should be spatially distinct and visible.

## Spawn Region Model

Replace or supplement purely radial near-player spawning with spawn regions.

Suggested structure:

```ts
type SpawnRegion = {
  id: string;
  label: string;
  worldX: number;
  worldY: number;
  radius: number;
  enemyFamilyIds: string[];
  startsAtSeconds: number;
  weight: number;
};
```

Initial spawn regions:

- `breach_crack_bad_outputs`
- `drone_yard_benchmark_gremlins`
- `barricade_context_rot`
- `treaty_monument_oath_pages`

For this milestone, the enemy art can remain placeholder, but the spawn source names should appear in debug/proof state.

## Camera And Bounds

Add:

- camera follow over large arena
- clamp player to authored map bounds
- ensure HUD does not obscure core play
- proof that moving right/down/up/left changes camera and traverses real distance

## Oath-Eater Placement

The Oath-Eater should feel tied to the Treaty Monument instead of spawning randomly near the player.

Milestone 3 default:

- boss spawns near Treaty Monument or a major breach route
- boss warning still works
- boss label stays readable

## Proof Requirements

Update or add proof scripts/artifacts:

- `proof:movement`: verify player traverses a meaningful distance on the large map.
- `proof:horde`: verify enemies spawn from named spawn regions.
- `proof:boss`: verify Oath-Eater appears near/after Treaty Monument context.
- `proof:full`: still reaches `ALIGNMENT NODE STABILIZED`.
- Add a new artifact/state field for map/sub-area/spawn-region data if helpful.

`render_game_to_text()` should expose concise large-map details:

```ts
{
  level: {
    arenaId,
    arena,
    mapBounds,
    nearestLandmark,
    visitedLandmarks,
    activeSpawnRegions
  }
}
```

## Implementation Advice

Prefer a simple data-driven map definition before complex tilemap tooling.

Good first step:

- add `src/level/armisticePlazaMap.ts`
- define bounds, landmarks, spawn regions, prop clusters, terrain bands
- render those definitions with existing Pixi placeholder shapes

Avoid:

- building a full editor
- importing real assets
- adding Colyseus in this milestone
- deep refactors unrelated to large-map simulation/rendering

## Exit Criteria

Milestone 3 is done when:

- `Armistice Plaza` is visibly and mechanically much larger.
- It has named landmarks/sub-areas.
- Enemy spawns are tied to spawn regions.
- The boss is tied to the level space.
- Proof scripts pass.
- Screenshots show traversal and a bigger playable place.
