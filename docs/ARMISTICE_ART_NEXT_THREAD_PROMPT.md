# Fresh Codex Prompt: Continue After Accepted Armistice Art Baseline

You are working in `/Users/donghokang/Documents/New project 5`.

Goal: Continue `AGI: The Last Alignment` from the repo's current state. The Armistice vertical-slice art baseline has finally reached an accepted direction for terrain, prop grounding, key sprite readability, boss presentation, and camera proof. Do not rely on memory from earlier Codex threads. Periodically check the current repo state while working.

Before doing meaningful work, read:

- `AGENTS.md`
- `docs/FRESH_THREAD_CURRENT_STATE.md`
- `progress.md` tail
- `docs/ART_REBUILD_HANDOFF.md`
- `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md`
- `docs/VISUAL_FIDELITY_VERTICAL_SLICE.md`
- `docs/AGI_VISUAL_ART_BIBLE.md`
- `docs/ASSET_PIPELINE.md`
- `docs/BUILD_ARCHETYPES_AND_ITEMIZATION.md`
- `docs/DIFFICULTY_AND_MAP_SCALING.md`
- `docs/MAP_KIND_EXPANSION_CHECKLIST.md`
- `docs/GAME_DIRECTION.md`
- `docs/AGI_The_Last_Alignment_Creative_Bible.md`
- `docs/AGI_IMPLEMENTATION_PLAN.md`
- `docs/MILESTONE_ROADMAP_0_TO_58.md`
- `ART_PROVENANCE.md`
- `assets/concepts/chatgpt_refs/armistice_source_rebuild_v2/README.md`

Also inspect the current game visually. Run/use the local app, current proof screenshots, and current runtime output. Use the current Armistice slice as the fidelity baseline for new areas/bosses/enemies. Compare against the saved Tech Bros benchmark/comparison artifacts only for fidelity lessons, especially:

- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-r5-comparison.png`
- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-production-rebuild-gate.png`
- `docs/proof/visual-fidelity-slice/techbros-vs-armistice-corrective-gate.png`
- `docs/proof/visual-fidelity-camera/camera-player-start.png`
- `docs/proof/visual-fidelity-camera/camera-combat-vfx.png`
- `docs/proof/visual-fidelity-camera/camera-boss-vfx.png`

Use Tech Bros only as a fidelity benchmark. Do not copy its style, characters, maps, UI art, jokes, names, or expressive content. The lesson to apply is terrain cohesion, material richness, prop/sprite proportions, camera crop, animation responsiveness, visual channel separation, and overall finish.

Important accepted state:

- Accord A/D side-walk was recently fixed with `assets/concepts/chatgpt_refs/armistice_rebuild_v1/accord_striker_side_walk_east_v8.png`, packed into `assets/sprites/players/accord_striker_walk_v2.png` and mirrored for west. Runtime movement/facing logic was not changed.
- Do not touch A/D again unless fresh live held-key proof shows a regression.
- W/S are accepted for now only because the user chose not to reopen them yet; they are not final-quality.
- The user explicitly rejected partial lower-body sprite patching. Do not use cheap leg-only patches, lower-half swaps, or contact-sheet-only validation. If actor motion work is reopened, use coherent full-frame/full-row source and verify in live held-key play at zoom.
- Armistice terrain is accepted as the current standard: dense V7 prop-pad-extension terrain plus V6 interconnect pieces, no visible old low-fidelity floor, jagged outer silhouette, and prop pads reading as contact accents.
- Prop scale/collision pass is accepted: no translucent mini satellite props, standardized production prop scale, full-alpha props, and static blockers for the major production clusters.
- Oath-Eater is accepted in direction: larger 224px source-backed boss, irregular contact/corruption, no square purple platform, current runtime using centered/front-contained frames to avoid the boxed side-lurch read.
- Benchmark Gremlin is accepted in direction: bright/readable monitor enemy with internal material breakup from `enemy_benchmark_gremlin/benchmark_gremlin_detail_source_v1.png`, not a flat broad recolor.
- Current visual channels are accepted as a baseline: blue XP/pickups, orange/magenta player shots, violet/pink/red boss/enemy pressure, with silhouette/animation separation where possible.
- Current orange-box/projectile fallback issue is fixed: normal production gameplay must not draw placeholder rectangles for projectiles, peers, item art, or impacts. Debug-only fallbacks are acceptable only behind explicit debug/proof flags.
- Current build-weapon VFX runtime atlas derives from `assets/concepts/chatgpt_refs/build_weapon_vfx_v2/build_weapon_vfx_source_v2.png`, even though the import-compatible runtime atlas path remains `assets/sprites/effects/build_weapon_vfx_v1.png`.
- Weapon visuals must show source-backed motion beats in close camera: launch/travel/impact for Patch Mortar, pulse/ring/burst for Signal Pulse, spin/orbit/echo for Context Saw, and distinct payoff for fusions.
- Build slot caps are now part of the playable grammar: one primary, two secondaries, four passives, one major fusion, and one Consensus Burst path. The current build HUD is player-facing but still provisional UI, not final premium UI art lock.

Next feature I want to tackle:

[Describe the next feature here.]

When building that feature, use Armistice as the fidelity reference:

1. Material world cohesion
   - New levels should be built from multiple high-fidelity source pieces at gameplay camera scale, not one huge terrain sheet.
   - Props should be grounded into the same material language as the base terrain.
   - Do not leave low-fidelity underpaint visible between authored pieces.

2. Actor and enemy readability
   - Preserve readable silhouettes, but keep internal pixel material detail.
   - Avoid flat/iconic broad value blocking unless that is deliberately the character's style.
   - Verify enemies against the current terrain at close camera.

3. Boss language
   - Bosses should be large, well-padded, grounded, and visually tied to arena material changes.
   - No square platforms, boxed sprites, random rugs, or cropped side motion.
   - Prove boss movement in live chase/combat, not only static sprite sheets.

4. Camera and proof
   - Keep the close tactical camera.
   - Do not zoom out to hide asset problems.
   - Judge work in `camera-player-start`, `camera-combat-vfx`, and `camera-boss-vfx` style proof shots or equivalent fresh live screenshots.

Working rules:

- Before edits and periodically during the task, run `git status --short`, inspect targeted `git diff`, and read the latest `progress.md` tail so you are acting on the current repo, not memory.
- Start from the current running app/proofs. If a proof is stale, regenerate it.
- Preserve deterministic proof hooks: `window.render_game_to_text()` and `window.advanceTime(ms)`.
- Preserve Vite/TypeScript/PixiJS/custom math stack. No physics engine.
- Preserve production-art defaults and placeholder/proof/debug opt-outs.
- Use ChatGPT Images, PixelLab, Aseprite, Pixelorama, or another explicit art-source tool for expressive art source. Use Python/Pillow only for mechanical packing, slicing, cleanup, alpha validation, contact sheets, and dimension checks after source acceptance.
- If the source art is weak or blocked, regenerate/use a real art tool or report the blocker. Do not fake production art with code.
- Update `assets/asset_manifest.json`, `ART_PROVENANCE.md`, relevant README/provenance notes, and `progress.md` for accepted assets/runtime changes.
- Run targeted proof/build checks before finishing. At minimum for art/runtime changes: `npm run proof:assets`, `npm run proof:visual-fidelity-camera`, `npm run proof:movement`, `npm run proof:smoke`, relevant boss/framing proofs, `./node_modules/.bin/tsc --noEmit --pretty false`, and `./node_modules/.bin/vite build`. For build/item/weapon work also run `npm run proof:build-grammar` and `npm run proof:build-vfx`. If a check cannot be run or hangs, say so explicitly.

Do not reopen accepted Armistice terrain/sprites/boss/props unless the next feature specifically requires it or fresh live proof shows a regression.
