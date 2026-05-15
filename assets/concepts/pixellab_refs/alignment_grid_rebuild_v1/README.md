# Alignment Grid PixelLab Export

Status: exported and normalized from the dedicated PixelLab automation browser profile on 2026-05-11.

This folder contains the fresh PixelLab export of the Alignment Grid overworld object batch.

Workflow:

1. Launch or reuse the isolated PixelLab profile:
   `npm run assets:pixellab-alignment-grid-export`
2. If the command reports `missing-session`, sign into PixelLab in the dedicated browser window it opened.
3. Rerun `npm run assets:pixellab-alignment-grid-export`.
4. Normalize the downloaded ZIP into raw frames/contact/atlas:
   `npm run assets:pixellab-alignment-grid-normalize`
5. Rebuild the runtime overworld backdrop:
   `npm run assets:alignment-grid-rebuild-v1`

The helper uses `.codex-local/pixellab-automation-profile` with its own DevTools port so PixelLab work does not operate on the user's main Chrome profile or tabs.

Generated files:

- `alignment_grid_pixellab_fresh_export_20260511.zip`
- `raw/frame_00.png` through `raw/frame_15.png`
- `alignment_grid_pixellab_fresh_raw_contact.png`
- `alignment_grid_pixellab_fresh_raw_atlas.png`

Export verification:

- PixelLab ZIP contains 16 object PNG files plus `metadata.json`.
- Normalized raw frames are 16 RGBA PNGs at `128x128`.
- Runtime atlas is `512x512`.

Fresh PixelLab prompt prefix:

`Transparent 128x128 isometric pixel-art object batch for AGI The Last Alignment Alignment Grid overworld. 16 separate frames, one complete object per frame, transparent background. Chunky dark sci-fi civic stone and frontier AI lab hardware matching Armistice terrain fidelity.`
