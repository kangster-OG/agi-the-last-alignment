# Asset Pipeline

The Creative Bible recommends:

> ChatGPT Images for art direction. PixelLab for production pixel assets. Manual cleanup for game readiness.

## PixelLab Login Note

When PixelLab access is needed, use an automated browser session and let the user log in manually.

Do not try to store, infer, or ask for PixelLab credentials in chat or repo files.

## Intended Workflow

Use ChatGPT Images for:

- master art bible concepts
- character concept sheets
- boss concept paintings
- color palettes
- UI mockups
- arena mood boards
- overworld map concepts
- faction icon concepts
- enemy family concept sheets
- upgrade card mockups
- prompt generation for PixelLab

Use PixelLab for:

- final tiny sprites
- 8-direction rotations
- walk/run/attack animation sheets
- enemy variants
- isometric ground tiles
- seamless terrain transitions
- production props
- tilemap-ready sets
- sprite consistency passes

Use Aseprite or Pixelorama for manual cleanup:

- remove noisy pixels
- enforce palette
- fix silhouettes
- align feet to isometric ground
- normalize sprite origins
- check animation readability
- make tile edges actually seamless
- export consistent PNG sheets

## Asset Rules

- Official company logos may be used for parody/faction presentation because the user explicitly wants them in the game. Treat them as third-party/parody brand assets, not original MIT-created artwork.
- Faction visuals must be parody-coded and original.
- Record provenance for every generated/imported production asset.
- Record source/provenance for every official logo in `ART_PROVENANCE.md`.
- Keep placeholder assets clearly labeled until replaced.
- Prefer readable silhouettes over detailed noise.

## Suggested Paths

```txt
assets/
  sprites/
  tiles/
  props/
  ui/
  portraits/
  concepts/
src/content/
  factions.ts
  classes.ts
  enemies.ts
  regions.ts
  arenas.ts
  bosses.ts
  upgrades.ts
```
