# Codex Continuity Ledger

Date: 2026-05-14

Purpose: preserve the durable lessons from the long full-campaign, duration-rebalance, PixelLab, release-gate, and gameplay-feel threads. This is the short memory file future Codex threads should read after `FRESH_THREAD_CURRENT_STATE.md` and `FRESH_THREAD_NEXT_STEPS.md` when continuing the game.

This file is not a changelog. `progress.md` has the blow-by-blow record. This ledger says what should live on as working law.

## Current North Star

`AGI: The Last Alignment` should feel first like a 2D isometric pixel-art horde-survival roguelite, second like an authored campaign adventure, and third like AGI lore/systems flavor.

Preserve:

- close tactical isometric camera in large authored maps;
- autocombat with movement, routing, objective timing, drafts, build construction, Consensus Burst, boss pressure, and extraction as player agency;
- Campaign mode as durable unlock progression;
- Free Alignment as immediate all-roster sandbox that does not grant campaign unlocks;
- dense walkable Alignment Grid route board, not a flat card menu;
- deterministic proof hooks `window.render_game_to_text()` and `window.advanceTime(ms)`;
- source-backed production art workflow.

Do not solve problems by zooming out, adding raw HP/timer padding, hiding weak art with code effects, or replacing the survival loop with puzzle-first or lore-first play.

## Recently Locked Systems

- Full 11-level campaign spine exists: Armistice -> Cooling -> Transit -> Signal -> Blackwater -> Memory -> Guardrail -> Glass -> Archive -> Appeal -> Finale.
- Campaign Duration Rebalance V1 is implemented in `src/content/campaignDurationProfile.ts`.
- Configured combat target totals exactly 105 minutes, with expected full campaign time around 115-125 minutes including drafts, summaries, overworld movement, and reading.
- Runtime duration telemetry is proof-visible through `render_game_to_text()` as target/boss/tail, phase, cache count, expected clear band, reward beats, and objective cycle counters.
- Campaign clarity copy is centralized in `src/content/campaignClarity.ts`.
- Objective-family vocabulary is centralized in `src/content/campaignObjectiveVariety.ts`.
- Summary objective copy is completion-first, e.g. `Objective: STABILIZE COMPLETE (...)`, so optional support counters do not make cleared routes look failed.
- Memory and Finale received focused gameplay-feel tuning after proof/screenshot audits; do not undo those tiny reward/engagement changes casually.
- Playable avatar PixelLab walk cycles are regenerated for all 12 selectable classes and packed into `assets/sprites/players/class_roster_m49.png`.

## Things Not To Revert

- Direct Colyseus server imports from `@colyseus/core` and `@colyseus/ws-transport` in `server/consensusCellServer.mjs`.
- `MSGPACKR_NATIVE_ACCELERATION_DISABLED=true` for proof-spawned coop servers.
- Target-aware route proofs after the campaign duration rebalance.
- Live route assertions that require objective trick engagement before boss/event takeover.
- Completion-first summary objective wording.
- Lower-priority coherence-shard pickup rendering in busy late-route combat.
- Boss warning staging where the title card and comms dialogue do not overlap the current-build panel.
- PixelLab dedicated automation profile rule and session tooling.
- The generated playable walk-cycle batch/packer scripts unless replacing them with a strictly better source-backed pipeline.

## PixelLab Working Law

Use only the dedicated automation profile:

- `.codex-local/pixellab-automation-profile`
- DevTools port `9337`

Primary commands:

```sh
npm run pixellab:check
npm run pixellab:open
npm run pixellab:restart
```

Do not use the user's everyday Chrome profile. Do not inspect, print, save, or commit cookies, tokens, local storage, session material, account secrets, payment data, or security prompts. If PixelLab asks for CAPTCHA, 2FA, password re-entry, billing, payment, or account-security action, stop and let the user handle it in the dedicated browser window.

Known PixelLab asset paths:

- Alignment Grid source/export: `assets/concepts/pixellab_refs/alignment_grid_rebuild_v1/`
- Build weapon VFX source: `assets/concepts/pixellab_refs/build_weapon_animation_rebuild_v1/`
- Playable walk-cycle source: `assets/concepts/pixellab_refs/playable_walk_cycles_v1/`

Playable walk-cycle commands:

```sh
npm run assets:pixellab-playable-walk-cycles-v1
npm run assets:pack-playable-walk-cycles-v1
npm run proof:assets
npm run proof:roster-sweep
```

PixelLab Character background jobs may complete without persisting as normal gallery animations. Preserve job-returned frames directly when the API provides them, and make batch scripts resume by class/direction.

## Production Art Law

Production visual improvements must originate from ChatGPT Images, PixelLab, Aseprite, Pixelorama, or another explicit art-source tool.

Code may mechanically:

- slice/crop;
- key simple backgrounds;
- trim alpha;
- pad and normalize anchors;
- resize nearest-neighbor after source approval;
- pack atlases/contact sheets;
- validate dimensions/alpha;
- generate proof sheets.

Code may not create expressive production terrain, props, actors, bosses, VFX, UI chrome, decorative marks, recolors, filters, procedural art, or painted detail. If source art is weak, regenerate or manually clean it in an art tool rather than rescuing it with Pillow, Pixi Graphics, SVG, CSS, filters, or procedural shortcuts.

## Proof Discipline

Do not trust JSON alone and do not trust screenshots alone. For gameplay-feel work, use both.

Before accepting a meaningful campaign/gameplay/readability change:

- run the affected route proof;
- inspect the generated screenshots manually;
- inspect the relevant JSON/telemetry for HP, KOs/XP, objective progress, boss/event timing, and extraction state;
- rerun relevant regressions:
  - `npm run proof:objective-variety`
  - `npm run proof:campaign-clarity`
  - `npm run proof:overworld`
  - `npm run proof:solo-campaign-unlocks`
  - `npm run proof:smoke`
  - `npm run proof:reference-run`
  - `npm run proof:campaign-full` for release-style work, preferably from the temp workspace if local iCloud hangs.

For art/runtime asset changes, at minimum run:

```sh
npm run proof:assets
```

Then run the gameplay/UI proof that actually renders the changed surface. For playable roster changes, also run:

```sh
npm run proof:roster-sweep
```

## iCloud Workspace Reality

The normal workspace can hang on dependency reads, `tsc`, Playwright imports, Vite build, or Colyseus startup. A hang in this path is not automatically a TypeScript or gameplay failure.

Use the temp non-iCloud workspace pattern from `docs/FRESH_THREAD_NEXT_STEPS.md` when:

- `npm run build` stalls inside `tsc` or Vite with no diagnostics;
- `proof:campaign-full` cannot start the coop server;
- Playwright import or proof server startup hangs;
- a release-style validation needs confidence beyond targeted checks.

Known-good environment variables for the temp workspace:

```sh
export NODE_OPTIONS=--preserve-symlinks
export MSGPACKR_NATIVE_ACCELERATION_DISABLED=true
```

Artifacts written to linked `docs/proof/...` still update the real repo.

## Gameplay-Feel Next Target

The next useful gameplay pass should not add new campaign levels. It should continue tuning the existing 11-level spine under the new 105-minute combat contract.

Memory and Finale have already been tuned. The likely next weakest routes should be picked from fresh telemetry and screenshots, not memory. Good candidates to audit first:

- Archive: evidence carry should feel active under redaction/appeal pressure, not like static capture.
- Appeal: public windows, objections, verdict beams, and injunction rings should stay readable under carried-build pressure.
- Guardrail or Glass: verify hold/release and prism/shade cycles still feel distinct after the longer duration profile.

Make tiny changes only: objective engagement radius/reward, HUD/readability, phase timing, boss/extraction tension, or proof assertions. Avoid broad rebalance churn.

## UI And Readability Taste

The current UI is functional and readable, not a final premium art lock. Preserve what is working:

- compact run HUD with objective, next action, danger, and reward;
- boss title/comms staging without overlay collision;
- summary rewards before lore;
- selected Alignment Grid panel with level/verb/objective/reward/consequence;
- source-backed item/build icons.

Rejected directions include pale pasted-on panels, tiny terminal copy, noisy source-backed chrome that hurts readability, card-grid overworlds, and anything that treats the Alignment Grid as a menu instead of a walkable route world.

## Fresh-Thread Startup Checklist

When a new Codex thread starts meaningful work:

1. Read `AGENTS.md`.
2. Read `docs/FRESH_THREAD_CURRENT_STATE.md`.
3. Read `docs/FRESH_THREAD_NEXT_STEPS.md`.
4. Read this ledger.
5. Read `progress.md` tail.
6. Inspect current proof screenshots relevant to the requested work.
7. Run or reuse the smallest proof that grounds the change before editing.
8. Update docs/progress after the change so the next thread inherits the truth, not the chat fog.

## Enemy Role Continuity

- Enemy Mob Differentiation V1 is now part of the durable gameplay contract. Read `docs/ENEMY_MOB_DIFFERENTIATION_PLAN.md` before changing enemy families, spawn composition, projectiles, elites, objective pressure, route proofs, or campaign combat feel.
- `src/content/enemyRoleProfiles.ts` is the central taxonomy. Do not add an enemy family without a role profile, counterplay hint, intro arena, difficulty tier, objective/on-hit/on-death effects, allowed elite affixes, and proof counters.
- Shooter enemies are now a real pillar, introduced gradually. Preserve sparse readable windups and close-camera projectile readability; do not convert the horde loop into bullet hell.
- Runtime hostile projectiles/trails/explosions/support auras/objective jams/elites are intentionally telemetry-backed through `render_game_to_text()`. Preserve `enemyRolesSeen`, `rangedFamiliesSeen`, projectile counters, trail/support/jam seconds, elite counters, pre-boss role pressure seconds, and phase role mix.
- Online co-op is included in the V1 contract. Preserve the server-authoritative role layer in `server/consensusCellServer.mjs`, the online snapshot fields (`enemyRoles`, `enemyTelegraphs`, `enemyTrails`, hostile projectile metadata), and the `OnlineCoopState` enemy-role VFX rendering so the feature appears for players with friends as well as solo.
- Enemy-role VFX must stay source-backed. The V1 source chain is `assets/concepts/chatgpt_refs/enemy_role_vfx_v1/`, `assets/concepts/pixellab_refs/enemy_role_vfx_v1/`, `scripts/assets/pack-enemy-role-vfx-v1.py`, and `assets/sprites/effects/enemy_role_vfx_v1.png`. Do not patch expressive enemy/projectile/trail/explosion art with code-authored drawing or recolors.
- `npm run proof:enemy-roles` is now a required static gate after enemy/spawn/route changes. For multiplayer-affecting changes, also run `npm run proof:milestone15-online-combat`; it now asserts online enemy-role pressure and hostile shooter telemetry.
