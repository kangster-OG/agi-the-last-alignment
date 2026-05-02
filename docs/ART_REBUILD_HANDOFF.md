# AGI Art Rebuild Handoff

Status: active next workstream after the visual-art-bible reset.

This handoff exists so a fresh Codex thread can restart the art rebuild without relying on chat history.

## Read First

Before doing meaningful art, visual, gameplay, packaging, or deployment work, read:

- `AGENTS.md`
- `progress.md` tail
- `docs/AGI_VISUAL_ART_BIBLE.md`
- `docs/ASSET_PIPELINE.md`
- `docs/GAME_DIRECTION.md`
- `docs/VISUAL_FIDELITY_VERTICAL_SLICE.md`
- `docs/AGI_The_Last_Alignment_Creative_Bible.md`
- `docs/AGI_IMPLEMENTATION_PLAN.md`
- `docs/MILESTONE_ROADMAP_0_TO_58.md`
- `ART_PROVENANCE.md`

## Current Visual Problem

The game systems are strong, but the current art still does not meet the user's production-fidelity bar. Previous passes improved terrain, HUD, scale, props, and collision, but the overall screenshot can still read as a prototype compared with the user's fidelity benchmark.

Do not continue polishing generated rectangles or Pillow-authored expressive art. The rebuild should start from stronger source art.

## Locked Direction

- Keep AGI's identity. Do not copy Tech Bros, X/Twitter reference clips, or any existing game's style, expressive content, characters, maps, jokes, UI art, or brands.
- Use references only as fidelity benchmarks: density, material richness, prop scale, sprite readability, and overall finish.
- Maps should remain larger than the benchmark references.
- Normal combat should use a close tactical follow-camera crop comparable to the benchmark point of view, not a zoomed-out board view.
- ChatGPT Images and PixelLab are the primary art sources.
- Manual cleanup in Aseprite, Pixelorama, or equivalent is allowed.
- Python/Pillow is allowed only for mechanical cleanup, slicing, packing, alpha validation, contact sheets, and dimension checks.
- If generated source art is not good enough, regenerate it instead of trying to rescue it with code art.

## Browser And PixelLab Rule

Use PixelLab in an automated browser session by itself in the background. Do not touch the user's main browser tabs.

Try the existing authenticated PixelLab browser/profile first. If that cannot be accessed, open a separate automated browser session and try PixelLab there. If PixelLab asks for sign-in, fresh 2FA, CAPTCHA, password re-entry, billing, payment, add-on purchase, or account-security prompts, stop and document the blocker so the user can sign in. Do not store credentials. Do not commit browser profiles, tokens, downloads with secrets, or local session data.

## Work Plan

### Step 1: Lock The Target Frame

Create ChatGPT image-generation boards for the AGI identity before making runtime assets:

- Armistice Plaza normal gameplay target frame.
- Armistice terrain/material board.
- Armistice large prop/set-piece board.
- Player/enemy sprite direction board.

Save selected source images under `assets/concepts/chatgpt_refs/armistice_rebuild_v1/` or the closest existing concept path. Record source/provenance before runtime use.

Acceptance:

- The target frame feels like a premium isometric pixel-art action screenshot.
- It keeps AGI identity: ruined treaty square, frontier-lab emergency hardware, co-mind residue, and Alien God Intelligence breach matter.
- It does not copy the benchmark style.
- It implies the close normal combat camera and bigger offscreen world.

### Step 2: Build The Armistice Production Kit

Use the target boards to drive PixelLab production assets:

- 32-48 terrain tiles/transitions: cracked civic concrete, treaty stone, asphalt, rubble, AGI corruption, terminal flooring, cable trenches, scorch/dust/grit overlays, edge masks, and organic blends.
- Large set pieces: crashed drone carrier/wreck pile, treaty monument ruins, barricade wall cluster, terminal server bank, AGI breach sculpture, foreground rubble/cable nests, signal pylons, faction residue props.
- Collision footprints for visually large props.

Acceptance:

- Set pieces are vehicle/building scale, not icons.
- Terrain no longer reads as a repeated grid.
- Props have transparent PNGs, contact shadows, plausible bases, and collision where physically large.
- Runtime wiring preserves production-art defaults and placeholder opt-outs.

### Step 3: Redo Combat Actors

Generate stronger player/enemy sheets separately from terrain:

- Player classes at 80x80 or 96x96 runtime frames.
- Small enemies at 64x64 minimum.
- Elites at 80x80 or 96x96.
- Distinct enemy-family silhouettes, not recolors.
- Idle, walk, attack, hurt, and dash/hit frames where the runtime supports them.
- Strong outlines, pose readability, material lighting, and bottom-center feet alignment.

Acceptance:

- Accord Striker reads instantly at normal gameplay zoom.
- Starter enemies read as family silhouettes, not colored blobs.
- Animation frames do not jitter or drift.
- Existing combat, objective, co-op, proof, and persistence boundaries remain intact.

### Step 4: Update The First-Screen Experience

Make the first screen, title, and build select match the new fidelity target:

- Generated Armistice title/backdrop art.
- Production class/co-mind cards and portraits/sprite previews.
- Better visual hierarchy with restrained HUD/UI chrome.
- No proof-like labels during normal play unless debug/proof flags are active.

Acceptance:

- The first screen and build select feel like a finished game surface.
- Normal HUD footprint stays small.
- Debug/proof telemetry remains available behind existing flags.

### Step 5: Wire, Prove, And Compare

For every accepted art batch:

- Clean and pack mechanically only.
- Update `assets/asset_manifest.json`.
- Update `ART_PROVENANCE.md`.
- Wire into runtime.
- Add or update deterministic proof coverage.
- Run targeted verification:
  - `node --check` on changed JS/MJS files.
  - `npx tsc --noEmit`.
  - `npm run build`.
  - `npm run proof:assets` when manifest/provenance/assets change.
  - relevant visual/art/regression proofs.
- Produce a visual gate with:
  - benchmark fidelity reference;
  - previous AGI screenshot;
  - new AGI screenshot;
  - asset contact sheet.

Acceptance:

- The normal gameplay screenshot has no obvious prototype grid.
- Three to five recognizable set pieces or material zones are visible.
- The HUD is small.
- Player and enemies read instantly.
- Large props have physical collision when expected.
- `render_game_to_text()` and `advanceTime()` still exist.

### Step 6: Expand Only After Armistice Passes

Do not broaden the rebuild until Armistice genuinely meets the visual standard. If the new Armistice gate still looks like a prototype next to the benchmark references, keep iterating Steps 1-5.

Only after Armistice passes, carry the same pipeline into:

- Blackwater Beacon.
- Outer Alignment finale.
- Alignment Grid overworld.
- Bosses and portraits.
- Pickups, VFX, UI icons, and remaining production-art gaps.

## Non-Negotiable Preservation

- Preserve solo, local co-op, and online Colyseus co-op.
- Preserve production-art defaults and placeholder opt-outs.
- Preserve `render_game_to_text()` and `advanceTime()`.
- Preserve server authority for online combat, objectives, rewards, reconnect, and route progression.
- Do not import/export live objectives, combat state, selected build kits, cooldowns, pets, role-pressure state, Recompile state, campaign content schema, dialogue state, route UI focus state, portal query params, or authority state.
- Export/import remains route-profile-only.
- Preserve runtime art manifest/provenance rules.

