# Asset Pipeline

Primary art-direction source: `docs/AGI_VISUAL_ART_BIBLE.md`.

The visual art bible is now the production gate for all major runtime art. The old pattern of using Python/Pillow to invent production props, sprites, terrain, or rubble is deprecated.

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

Use Python/Pillow only for mechanical pipeline work:

- chroma-key or flood-fill background cleanup
- alpha validation
- trimming and padding
- nearest-neighbor resizing when scale is already approved
- slicing generated sheets
- packing atlases
- contact-sheet generation
- manifest dimension checks

Do not use Python/Pillow to create final expressive art. If the generated source is not good enough, regenerate it in ChatGPT Images or PixelLab instead of drawing around it with code.

## Asset Rules

- Official company logos may be used for parody/faction presentation because the user explicitly wants them in the game. Treat them as third-party/parody brand assets, not original MIT-created artwork.
- Faction visuals must be parody-coded and original.
- Record provenance for every generated/imported production asset.
- Record source/provenance for every official logo in `ART_PROVENANCE.md`.
- Keep placeholder assets clearly labeled until replaced.
- Prefer readable silhouettes over detailed noise.
- Runtime production art must come from ChatGPT Images, PixelLab, or manual pixel cleanup, then be mechanically packed.
- Every major art batch needs a visual gate: benchmark fidelity reference, previous game shot, new game shot, and asset contact sheet.
- Large props need collision bodies when they are visually large enough to block movement.
- A production asset that reads as code-generated rectangles is rejected even if it passes manifest/provenance checks.

## Camera-Scale Asset Implications

The game should keep maps larger than the benchmark references while matching the references' closer moment-to-moment camera scale. This changes asset generation in several ways:

- Sprites and props cannot rely on distant-view simplification. Generate them with visible internal material detail, strong silhouettes, and clean contact shadows.
- Terrain needs broad material chunks, transition masks, and edge variation because repeated tiles are more obvious at the closer camera.
- Large set pieces should be authored as vehicle/building-scale objects with collision footprints, not small decorative icons.
- The asset budget increases in two directions: more assets are needed for larger worlds, and each visible asset needs enough fidelity for the closer camera.
- PixelLab prompts should describe the intended gameplay scale, for example: "readable in a close 2:1 isometric combat camera, 80 px character scale, dense authored terrain crop."
- Visual gates should use the normal gameplay camera. A zoomed-out proof screenshot is not acceptable for judging production art quality.

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
