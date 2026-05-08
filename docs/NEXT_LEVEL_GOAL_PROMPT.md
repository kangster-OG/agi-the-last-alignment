# Final Campaign Handoff Prompt

Date: 2026-05-08

Purpose: give a fresh Codex thread the correct post-finale starting point. The remaining serial full-level `/goal` campaign work is complete; this prompt should be used for release-candidate polish, regression repair, or final human taste/playtest approval rather than for inventing another required level.

Use this prompt from the repo root `/Users/donghokang/Documents/New project 5`.

```text
/goal
Continue AGI: The Last Alignment from the current repo state in `/Users/donghokang/Documents/New project 5`.

Goal: verify, polish, and protect the completed V1 local full-game campaign. Do not add a new required authored campaign level unless repo docs or the user explicitly request a new branch.

Completed source-backed local full-game chain:
Armistice Plaza -> Cooling Lake Nine -> Transit Loop Zero -> Signal Coast -> Blackwater Beacon -> Memory Cache -> Guardrail Forge -> Glass Sunfield -> Archive of Unsaid Things -> Appeal Court Ruins -> Outer Alignment Finale.

Latest real completion seed:
- Read `docs/proof/alignment-spire-finale/12-summary-carryover.json`, or rerun `npm run proof:alignment-spire-finale`.
- Current shape: LV16, XP613, 15 carried patches, four synergies, completed maps through `alignment_spire_finale`, secrets through `outer_alignment_contained`, 14 Proof Tokens, expedition power 39.75, next target `campaign_complete`.

Before meaningful work, read:
- `AGENTS.md`
- `docs/FRESH_THREAD_CURRENT_STATE.md`
- `progress.md` tail
- `docs/GAME_DIRECTION.md`
- `docs/DIFFICULTY_AND_MAP_SCALING.md`
- `docs/MAP_KIND_EXPANSION_CHECKLIST.md`
- `ART_PROVENANCE.md`
- relevant source READMEs under `assets/concepts/chatgpt_refs/` and `assets/concepts/pixellab_refs/`

Non-negotiables:
- Preserve Vite / TypeScript / PixiJS / custom lightweight 2D gameplay math.
- Preserve autocombat and close tactical follow camera.
- Preserve `window.render_game_to_text()` and `window.advanceTime(ms)`.
- Preserve production-art defaults and placeholder/debug/proof opt-outs.
- Production gameplay must not show placeholder rectangles, orange boxes, colored peer bars, placeholder projectile boxes, or code-authored production visuals.
- Do not create expressive production art with code, Pillow drawing, Pixi Graphics, SVG, CSS, procedural marks, filters, recolors, overlays, or gradients.
- For any new production-art work, source art first with ChatGPT Images/imagegen, then use the signed-in PixelLab session in the Codex in-app browser at `https://www.pixellab.ai/create-object`; PixelLab source must contribute directly to accepted runtime art.

Minimum verification after changes:
- `node --check scripts/proof/run-proof.mjs`
- `python3 -m py_compile` for changed asset/proof scripts
- `./node_modules/.bin/tsc --noEmit --pretty false`
- `npm run proof:alignment-spire-finale`
- `npm run proof:campaign-full`
- `npm run proof:appeal-court-ruins`
- all existing campaign chain proofs touched by the change
- `npm run proof:smoke`
- `npm run proof:movement`
- `npm run proof:reference-run`
- `npm run proof:assets`
- `npm run proof:boss`
- `npm run proof:visual-fidelity-camera`
- `npm run proof:build-grammar`
- `npm run proof:build-vfx`
- `npm run proof:player-damage`
- `git diff --check`
- `./node_modules/.bin/vite build`

Definition of done:
The campaign should remain provably complete from Armistice through the finale, production-art defaults should remain source-backed, placeholder/debug opt-outs should still work, and the only remaining work should be final human taste/playtest approval or release polish.
```
