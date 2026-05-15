# Playable Walk Cycles V1 PixelLab Regeneration

Date: 2026-05-14

Purpose: preserve the completed PixelLab Character walk-cycle regeneration pass for the playable roster.

## Status

Completed.

All 12 playable classes were regenerated through PixelLab using the dedicated automation profile:

- profile: `.codex-local/pixellab-automation-profile`
- DevTools port: `9337`
- runner: `scripts/assets/pixellab-playable-walk-cycle-batch.mjs`
- packer: `scripts/assets/pack-pixellab-playable-walk-cycles-v1.py`

The batch creates or reuses PixelLab Characters from the prepared playable seeds, generates `walking-4-frames` animation jobs for south/east/north/west, and preserves the completed job frames directly as raw PNG source. The packer then mechanically normalizes those source frames into the existing runtime contract.

Runtime output:

- `assets/sprites/players/class_roster_m49.png`

Source/proof outputs:

- `pixellab_walk_cycle_manifest.json`
- `raw/<class>/<direction>/frame_00.png` through `frame_03.png`
- `playable_walk_cycles_v1_contact.png`
- `docs/proof/playable-walk-cycles-v1/playable-walk-cycles-v1-proof.png`

Runtime atlas contract preserved:

- 12 classes
- 4 facings: south, east, north, west
- 3 runtime frames per facing
- 80x80 frame cells
- 240x3840 RGBA atlas

## Prepared Source Seeds

The current runtime roster atlas is:

- `assets/sprites/players/class_roster_m49.png`

This prep pass mechanically sliced that existing runtime source into per-class references under `seeds/`:

- `*_runtime_seed_4dir_3frame.png`: raw 80x80 runtime rows, south/east/north/west, 3 frames per facing.
- `*_pixellab_reference.png`: enlarged labeled reference for PixelLab upload/manual comparison.
- `*_south_idle_seed.png`: single south idle seed frame for PixelLab Character creation.

Overview:

- `playable_roster_runtime_seed_contact.png`
- `seed_manifest.json`

These files are references only. The accepted regenerated source lives under `raw/`, and the packed runtime atlas is `assets/sprites/players/class_roster_m49.png`.

## Commands

```sh
npm run pixellab:check
npm run assets:pixellab-playable-walk-cycles-v1
npm run assets:pack-playable-walk-cycles-v1
npm run proof:assets
npm run proof:roster-sweep
```

## Verification

- `npm run pixellab:check` passed against the dedicated profile.
- `npm run assets:pixellab-playable-walk-cycles-v1` completed for 12 classes and downloaded 192 PixelLab source frames.
- `npm run assets:pack-playable-walk-cycles-v1` wrote the runtime atlas and proof sheet.
- `npm run proof:assets` passed, including runtime sprite framing validation.
- `npm run proof:roster-sweep` passed all 96 playable class/co-mind combinations.
- `npm run build` was attempted in the normal iCloud workspace but hung inside `tsc` after about 4m41s and was stopped. Use the documented temp non-iCloud workspace when a production build is needed.

No code-authored drawing, filters, recolors, procedural sprites, or placeholder interpolation were used to fake animation. Code only preserved PixelLab frames and mechanically packed them into the existing runtime atlas contract.
