# Alignment Grid Rebuild V1

Date: 2026-05-11

Purpose: rebuild the campaign progression overworld as a dense isometric AGI diorama with the same structural readability that made the Tech Bros overworld feel playable: authored paths, local landmarks, terrain regions, and a progression world that reads as a place instead of a flat menu.

## Source Images

- `alignment_grid_target_frame_v1.png` - ChatGPT Images direction frame for the desired in-play composition.
- `alignment_grid_terrain_routes_source_v1.png` - ChatGPT Images source board of isolated terrain and route chunks.
- `alignment_grid_landmarks_source_v1.png` - ChatGPT Images source board of isolated AGI landmark structures.

## Production Runtime Asset

- `assets/props/alignment_grid/alignment_grid_backdrop_v1.png`

Packed by `scripts/assets/pack-alignment-grid-rebuild-v1.py` from the ImageGen source boards plus the fresh PixelLab Alignment Grid object export at `assets/concepts/pixellab_refs/alignment_grid_rebuild_v1/alignment_grid_pixellab_fresh_raw_atlas.png`.

## Reference Boundary

Tech Bros was used only as a structural reference for progression-map feel: dense readable overworld, authored route clarity, and playable space language. No Tech Bros artwork, characters, text, UI, level content, or brands were copied into this project.

## PixelLab Note

A fresh PixelLab Creator generation was run and recovered through the dedicated PixelLab automation browser profile on 2026-05-11. The export lives at `assets/concepts/pixellab_refs/alignment_grid_rebuild_v1/alignment_grid_pixellab_fresh_export_20260511.zip` and was normalized into 16 transparent 128x128 raw frames, a contact sheet, and `alignment_grid_pixellab_fresh_raw_atlas.png`.

The helper uses `.codex-local/pixellab-automation-profile` with a separate DevTools port so PixelLab work does not operate on the user's main Chrome profile or tabs. Runtime packaging now prefers the fresh Alignment Grid PixelLab atlas and only falls back to the older M50/M51 route-landmark atlas if the fresh atlas is absent.
