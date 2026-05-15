# AGI Art Rebuild Handoff

Status: accepted Armistice art baseline plus historical rebuild notes.

This handoff exists so a fresh Codex thread can restart the art rebuild without relying on chat history.

## Read First

Before doing meaningful art, visual, gameplay, packaging, or deployment work, read:

- `AGENTS.md`
- `docs/FRESH_THREAD_CURRENT_STATE.md`
- `progress.md` tail
- `docs/AGI_VISUAL_ART_BIBLE.md`
- `docs/ASSET_PIPELINE.md`
- `docs/PIXELLAB_AUTOMATION_WORKFLOW.md`
- `docs/GAME_DIRECTION.md`
- `docs/VISUAL_FIDELITY_VERTICAL_SLICE.md`
- `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md`
- `docs/AGI_The_Last_Alignment_Creative_Bible.md`
- `docs/AGI_IMPLEMENTATION_PLAN.md`
- `docs/MILESTONE_ROADMAP_0_TO_58.md`
- `ART_PROVENANCE.md`

## Accepted Baseline, May 5 2026

Armistice terrain, prop grounding/scale/collision, Accord A/D side-walk, Oath-Eater boss presentation, Benchmark Gremlin fidelity, and the current close-camera composition have now gone through a long corrective rebuild and should be treated as the accepted vertical-slice art baseline unless the user explicitly reopens one of those areas or fresh live proof shows a regression.

Read `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md` before starting any future art pass. It records what finally worked, what failed, what not to repeat, and how future levels/bosses/enemies should use Armistice as the fidelity reference.

High-level locked decisions:

- Do not reopen the current Armistice terrain just because older handoff text says terrain is the biggest gap. The accepted terrain uses V6/V7 multi-piece source art and jagged outer edges; future levels should match this standard.
- Do not weaken prop pads to match lower-fidelity ground. The correct direction was to raise the base terrain fidelity to the prop pads.
- Preserve the Accord A/D V8 side-walk unless live held-key proof shows regression.
- Preserve the current Oath-Eater centered-frame runtime choice unless a cleaner dedicated boss-motion source is generated and proven in live chase.
- Preserve the current Benchmark Gremlin direction: bright readable monitor silhouette plus internal pixel material breakup.
- No expressive production art may be created with Pillow/Python drawing, Pixi Graphics, SVG, CSS, filters, procedural marks, or similar shortcuts. Use ChatGPT Images, PixelLab, Aseprite, Pixelorama, or another explicit art-source tool first; code may only package accepted source art.

## Historical Visual Problem, Superseded By May 5 Baseline

The older notes below are retained to show why the rebuild moved through multiple iterations. They are no longer the active diagnosis for the accepted Armistice baseline.

For current work, start from `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md`. Do not reopen solved Armistice terrain, props, Accord A/D, Oath-Eater, or Benchmark Gremlin issues merely because the historical sections mention them as open.

## Historical Live Playtest State, May 2 2026

The latest work improved individual assets, but Armistice is not accepted as passing the production-art gate. Treat the following as the active unresolved art brief:

- Terrain is the biggest current problem. The map reads as many separate repeated isometric tiles, not a cohesive authored plaza. The user described it as every tile feeling like its own thing. The next pass should study the older/reference repo and the benchmark screenshots again for terrain cohesion: larger authored material islands, blended transitions, rubble/road/civic-stone zones that read as continuous surfaces, and less equal-contrast checker repetition.
- Do not solve terrain cohesion by reintroducing translucent code-drawn rectangles, random colored overlays, or procedural debris. The tile/source art itself needs to carry the material continuity.
- Accord Striker is currently a compromise. Front/back rows use the newer armored generated source, while east/west rows were temporarily replaced with older PixelLab directional walk frames because the generated side-view source had clipped/missing helmet pixels. This stopped the visible side-head crop, but it reintroduces a less-armored/person-like side silhouette. The real fix is a new coherent armored side-walk sheet from ChatGPT Images/PixelLab, not further crop padding.
- Oath-Eater is improved from the flat icon, but still needs judgment in live play. It can still read like a cutout if its contact shadow/base, scale, or pose does not sit naturally in the world. Next pass should compare the boss directly against the player/enemy sprite mass and the benchmark boss/elite proportions, then regenerate or repack rather than rescuing a weak crop.
- Prop scale was increased toward vehicle/building mass and collision footprints were expanded, but it needs another proportional review against the 80px player and 64px enemies. Props should feel large and grounded, not decorative stickers, while keeping paths navigable.
- Refusal-shard shots were recolored orange/magenta so they no longer match blue XP pickups. Continue separating pickup, player attack, enemy attack, and boss telegraph colors.
- `npm run proof:movement` currently fails the old traversal-distance assertion at 14.79 vs expected 16 after the close-camera/prop/collision changes. This may be a proof-path issue or a real collision/pathing snag. Inspect before changing the threshold.

Do not broaden beyond Armistice until these points are reviewed in-game and the user accepts the visual direction.

## Historical Live State, May 4 2026

This section supersedes the stale assumptions in the May 2 notes where later work has changed the assets. Do not assume Armistice passes. Also do not assume an old screenshot or old contact sheet is still representative; inspect the current repo, run the app, and capture fresh proof before meaningful work.

- Accord Striker is no longer using the older PixelLab side-row compromise described above. The current runtime `assets/sprites/players/accord_striker_walk_v2.png` uses the full-body generated rebuild as the base and `assets/concepts/chatgpt_refs/armistice_rebuild_v1/accord_striker_side_walk_east_v8.png` for the east row, with west mirrored mechanically. The fix was intentionally limited to A/D side-walk art; runtime facing/movement logic was not changed.
- The user explicitly rejected partial lower-body redraw shortcuts. Do not patch legs onto existing frames, do not swap in cheap lower-half art, and do not declare motion fixed from a contact sheet alone. For player animation work, use full-frame source rows or full-sheet source art, repack mechanically, then verify with held-key live screenshots at gameplay zoom.
- Latest A/D evidence is under `docs/proof/visual-fidelity-camera/wasd-side-v8/live-held-ad/`. D now reads as separated side-walk boots with no frozen lower half; A mirrors the same source. W/S are accepted for now only because the user chose not to reopen them yet, not because they meet a final animation bar.
- Terrain improved from stamped tile carpet to an authored whole-map surface, but the core fidelity gap remains world cohesion. Compared with Tech Bros, Armistice still lacks confident local material storytelling: broken civic stone seams, embedded asphalt/cable scars, rubble following prop damage, local dirt/shadow/debris halos, and prop-integrated ground damage.
- Props are closer to the correct vehicle/building scale, but many still feel placed on top of the floor rather than planted into it. The next pass should add local grounding, matching debris, cable/floor interfaces, and varied contact shadows around the current props rather than only scaling props again.
- Visual channel separation is better but not complete. Player shots are orange/magenta, enemy/boss pressure is violet/pink/red, XP remains blue, and pickups have separate silhouettes; however, shapes/animations still need to carry more of the separation so color is not doing all the work.
- Oath-Eater has stronger event language than before, but the active phase still leans on UI overlays and telegraph circles/bands. The next pass should make the arena itself react: local lighting, corruption spread, boss-tied particles, material-edged telegraphs, and terrain/prop mood changes around the boss.
- The biggest current gap versus the reference game is not a single weak asset. It is that Tech Bros feels authored as one material world, while Armistice can still feel like improved sprites, props, terrain, and UI stacked together.

Fresh-thread habit: before and periodically during implementation, run `git status --short`, inspect recent diffs with `git diff --stat` / targeted `git diff`, read the latest `progress.md` tail, and regenerate or open current proof screenshots. Do not rely on memory from earlier Codex threads.

## Locked Direction

- Keep AGI's identity. Do not copy Tech Bros, X/Twitter reference clips, or any existing game's style, expressive content, characters, maps, jokes, UI art, or brands.
- Use references only as fidelity benchmarks: density, material richness, prop scale, sprite readability, and overall finish.
- Maps should remain larger than the benchmark references.
- Normal combat should use a close tactical follow-camera crop comparable to the benchmark point of view, not a zoomed-out board view.
- ChatGPT Images and PixelLab are the primary art sources.
- Manual cleanup in Aseprite, Pixelorama, or equivalent is allowed.
- Python/Pillow is allowed only for mechanical cleanup, slicing, packing, alpha validation, contact sheets, and dimension checks.
- If generated source art is not good enough, regenerate it instead of trying to rescue it with code art.
- No cheap art shortcuts: do not use Pillow, Python drawing, Pixi Graphics, SVG, CSS, procedural generation, filters, recolors, overlays, gradients, or code-drawn marks to create or improve production terrain, props, actors, bosses, VFX, UI, or visual-fidelity surfaces. Code may only package already-approved source art. If ChatGPT Images, PixelLab, or manual art cleanup is needed and blocked, stop and document the blocker instead of faking production art with code.

## Browser And PixelLab Rule

Use PixelLab in an automated browser session by itself in the background. Do not touch the user's main browser tabs.

Try the existing authenticated PixelLab browser/profile first. The current recovered workflow uses `.codex-local/pixellab-automation-profile` on DevTools port `9337` and is documented in `docs/PIXELLAB_AUTOMATION_WORKFLOW.md`. If that cannot be accessed, open a separate automated browser session and try PixelLab there. If PixelLab asks for sign-in, fresh 2FA, CAPTCHA, password re-entry, billing, payment, add-on purchase, or account-security prompts, stop and document the blocker so the user can sign in. Do not store credentials. Do not commit browser profiles, tokens, downloads with secrets, or local session data.

When normal PixelLab download/export is unreliable, use the proven in-page API export pattern before declaring a hard blocker: read the PixelLab Supabase auth token from the page cookie inside the dedicated profile, query `GET https://api.pixellab.ai/objects?limit=100&offset=0`, select generated objects by prompt prefix, and export them with `POST https://api.pixellab.ai/objects/zip`. Save only the ZIP/source assets, then normalize and prove them mechanically.

## Historical Rebuild Plan

This plan describes the path that led to the current accepted Armistice baseline. For future levels, bosses, enemies, props, and VFX, use the baseline process in `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md` instead of restarting this plan from Step 1 unless the user explicitly asks for a full art rebuild.

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
