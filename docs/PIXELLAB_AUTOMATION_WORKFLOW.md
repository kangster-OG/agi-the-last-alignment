# PixelLab Automation Workflow

Date: 2026-05-11

Purpose: preserve the recovered PixelLab export process so future Codex threads can generate, export, normalize, and prove PixelLab source without taking over the user's main browser or giving up when the normal browser-download path is unreliable.

## Core Rule

Use PixelLab through a dedicated automation browser profile, not the user's main Chrome profile.

The current working profile path is:

- `.codex-local/pixellab-automation-profile`

The current working DevTools port is:

- `9337`

Do not commit this profile, cookies, local storage, tokens, downloads with secrets, or any other session material. If PixelLab asks for sign-in, 2FA, CAPTCHA, password re-entry, billing, payment, add-on purchase, or account-security prompts, stop and let the user handle it in that dedicated browser window.

## Proven Export Pattern

The recovered Alignment Grid exporter is:

- `scripts/assets/pixellab-alignment-grid-export.mjs`

It proved this flow works:

1. Launch or reuse Google Chrome with `--user-data-dir=.codex-local/pixellab-automation-profile` and `--remote-debugging-port=9337`.
2. Navigate that dedicated profile to PixelLab.
3. Use CDP `Runtime.evaluate` inside the PixelLab page.
4. Read the `supabase-auth-token` browser cookie from `document.cookie`.
5. Parse the access token from that cookie. Do not print or persist the token.
6. Query `GET https://api.pixellab.ai/objects?limit=100&offset=0` with `Authorization: Bearer <token>`.
7. Select the generated objects by exact project prompt prefix.
8. Export the selected object IDs with `POST https://api.pixellab.ai/objects/zip`.
9. Write only the returned ZIP into the appropriate `assets/concepts/pixellab_refs/...` folder.
10. Normalize the ZIP mechanically into raw frames, contact sheets, and atlases.
11. Rebuild runtime assets from ImageGen/ChatGPT Images plus PixelLab source.
12. Update source README, manifest, provenance, progress, and current-state docs.
13. Produce a proof sheet that shows the source images, PixelLab export, and runtime result side by side.

Important API gotcha from the Alignment Grid recovery: `limit=200` returned a 422, while `limit=100&offset=0` worked.

## Current Alignment Grid Commands

These are asset-specific but serve as the template for future PixelLab batches:

```sh
npm run pixellab:open
npm run pixellab:check
npm run assets:pixellab-alignment-grid-export
npm run assets:pixellab-alignment-grid-normalize
npm run assets:alignment-grid-rebuild-v1
npm run proof:assets
```

Current recovered Alignment Grid source lives under:

- `assets/concepts/pixellab_refs/alignment_grid_rebuild_v1/`

Key files:

- `alignment_grid_pixellab_fresh_export_20260511.zip`
- `raw/frame_00.png` through `raw/frame_15.png`
- `alignment_grid_pixellab_fresh_raw_contact.png`
- `alignment_grid_pixellab_fresh_raw_atlas.png`

The current proof sheet is:

- `docs/proof/alignment-grid-rebuild-v1/alignment-grid-fresh-pixellab-source-proof.png`

## Current Playable Walk-Cycle Commands

The playable roster walk-cycle batch completed on 2026-05-14 using the same dedicated profile and DevTools port. It is a Character-animation flow rather than an object ZIP export flow.

Commands:

```sh
npm run pixellab:check
npm run assets:pixellab-playable-walk-cycles-v1
npm run assets:pack-playable-walk-cycles-v1
npm run proof:assets
npm run proof:roster-sweep
```

Source and manifests live under:

- `assets/concepts/pixellab_refs/playable_walk_cycles_v1/`

Key files:

- `seed_manifest.json`
- `pixellab_walk_cycle_manifest.json`
- `raw/<class>/<direction>/frame_00.png` through `frame_03.png`
- `playable_walk_cycles_v1_contact.png`
- `docs/proof/playable-walk-cycles-v1/playable-walk-cycles-v1-proof.png`
- `assets/sprites/players/class_roster_m49.png`

Important API gotchas from this pass:

- `animation_group_id: "walking-4-frames"` can complete in background jobs without persisting as a normal gallery animation, so the runner preserves the job-returned/generated image frames directly.
- PixelLab expected integer `to_index` / `augmented_to_index` values for this background animation endpoint.
- PixelLab jobs can stall; the runner saves direction-by-direction progress into the manifest and resumes completed classes/directions instead of restarting the whole batch.
- The packer uses only mechanical alpha crop, padding, and nearest-neighbor fit into the existing `80x80 x 3 frames x 4 facings x 12 classes` runtime atlas contract.

## Durable Session Commands

Before starting any PixelLab art task, run:

```sh
npm run pixellab:check
```

This command launches or reuses the dedicated profile, navigates to PixelLab, probes whether the session can call the PixelLab objects API, and writes only a screenshot plus a redacted health result. It does not print cookies, local storage, access tokens, refresh tokens, or account secrets.

If the check reports `missing-session`, run:

```sh
npm run pixellab:open
```

Then sign in once in that dedicated Chrome window. After sign-in, rerun `npm run pixellab:check`. Future PixelLab work should not hunt through random Chrome profiles or the user's main browser. The only supported override is:

If the dedicated profile is already open but was launched without the DevTools port, run:

```sh
npm run pixellab:restart
```

This closes only the dedicated PixelLab automation profile and reopens it with the required `9337` DevTools port.

```sh
PIXELLAB_PROFILE_DIR=/absolute/safe/profile npm run pixellab:check
```

Use that only for an intentionally created automation-safe profile, never for the user's everyday Chrome profile.

## How To Make A New PixelLab Exporter

For a new level, overworld pass, actor, prop, VFX, or UI art batch, copy the proven shape of `scripts/assets/pixellab-alignment-grid-export.mjs`, then change only the project-specific constants:

- `PIXELLAB_URL`
- prompt prefix / matching predicate
- output ZIP path
- expected object count
- follow-up normalization script

Do not use the user's main Chrome profile just because it is already signed in. If the dedicated profile reports `missing-session`, open the dedicated browser window and let the user sign in there, then rerun the exporter.

## What Counts As Production Art

PixelLab source can contribute to accepted runtime production art only after it is exported or otherwise preserved as concrete source files under `assets/concepts/pixellab_refs/...`.

Code/Pillow may mechanically:

- crop;
- trim alpha;
- chroma-key simple backgrounds;
- pad;
- normalize anchors;
- nearest-neighbor resize;
- make raw atlases/contact sheets;
- validate dimensions/alpha;
- compose proof images;
- pack accepted source into existing runtime contracts.

Code/Pillow may not create expressive terrain, props, actors, bosses, VFX, UI, decorative marks, painted detail, or fidelity upgrades. If the source is ugly, sparse, warped, black-boxed, label-contaminated, or not game-ready, reject it and regenerate through ChatGPT Images, PixelLab, Aseprite, Pixelorama, or another explicit art-source tool.

## Proof Standard

Do not declare a PixelLab pass complete from a ZIP alone.

A complete pass should include:

- source prompt/README;
- exported ZIP or preserved source frames;
- normalized raw frames/contact/atlas;
- runtime-packed asset;
- manifest and provenance entries;
- visual proof image or live gameplay/overworld screenshot;
- `npm run proof:assets`;
- relevant gameplay or UI proof when the runtime surface changed.

If `npm run proof:overworld`, `npm run build`, or `tsc` hangs in the iCloud-backed workspace, report the timeout clearly and prefer targeted static/CDP proof or asset validation instead of pretending the check passed.
