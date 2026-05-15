# Eco Guardian / Tech Bros Mechanics Learnings

Date recorded: 2026-05-10

Purpose: preserve the user's competitor-study direction and the resulting AGI implementation pass so future Codex threads do not need to reconstruct it from chat history.

Reference games:

- Eco Guardian: `https://eco-guardian-delta.vercel.app/`
- Tech Bros: `https://techbrosgame.app/`

Use these games as structural inspiration only. Do not copy their names, characters, art, jokes, UI styling, maps, exact bosses, stage text, or expressive content. AGI's identity remains `AGI: The Last Alignment`: humans and frontier AI labs fighting A.G.I., the Alien God Intelligence, through a dense isometric horde-survival roguelite campaign.

## Core Takeaways

### Eco Guardian

Eco Guardian's strongest lessons were clarity of stage cadence, approachable weapon/build teaching, reward rhythm, and player guidance.

Useful structural patterns:

- A readable stage-completion loop where finishing a stage clearly means the campaign advanced.
- Distinct stages that feel themed and mechanically separated instead of only reskinned.
- Weapon evolution / recipe visibility that teaches the player what they are building toward.
- Chest/cache-style reward beats after meaningful objectives or bosses.
- Rising difficulty that is legible to the player across stages.
- Quiz/portal-like interactions that briefly change the run cadence and reward correct choices.
- A final mission-complete payoff with enough stats and rewards to make the clear feel recognized.

AGI translation rules:

- Convert quiz/trivia beats into `Alignment Checks`: short fictional reality-stabilization choices, not educational quizzes.
- Convert weapon evolution into `Protocol Codex` / protocol fusion visibility.
- Convert chest rewards into AGI caches: route memory, faction trust, Proof Tokens, Consensus Burst charge, objective durability, rerolls, fusion enablers, and other build-grammar rewards.
- Keep all UI compact. Eco-style guidance is useful, but AGI must not become modal-heavy or cluttered.

### Tech Bros

Tech Bros' strongest lessons were campaign legibility, authored route structure, room/location clarity, and boss/run pacing.

Useful structural patterns:

- A clear authored campaign route where the player understands where they are, where they are going, and why.
- Named rooms/locations that make each combat beat feel placed rather than random.
- Proper round/room pacing where combat, reward, and route movement form a repeatable rhythm.
- Boss fights that feel like authored encounters instead of random health bars.
- Ending/completion screens that acknowledge route progress and give the player a clean sense of closure.

AGI translation rules:

- The Alignment Grid should behave like a living campaign spine, not a flat node list.
- Each node needs purpose, reward promise, unlock consequence, stabilization consequence, next-route behavior, and proof-visible state.
- Bosses should belong to landmarks and objectives. Oath-Eater belongs to the Treaty Monument; future bosses need the same map contract.
- Route clarity should be player-facing and proof-visible through `render_game_to_text()`.

## Implemented AGI Systems From This Pass

This pass translated the competitor learnings into AGI-native systems rather than copies.

### 1. Campaign Spine / Alignment Grid Progression

Implemented in:

- `src/overworld/alignmentGridMap.ts`
- `src/overworld/OverworldState.ts`
- `src/proof/renderGameToText.ts`
- `scripts/proof/run-proof.mjs`

What changed:

- Every Alignment Grid node now declares `nodeType`, `rewardPromise`, `unlockConsequence`, `stabilizationConsequence`, `nextRouteBehavior`, and `proofState`.
- `false_schedule_yard` is explicitly typed as `Shortcut Route`.
- The overworld exposes current node metadata, completed/unlocked node lists, stabilized routes, next recommended node, and visible route consequence text.
- Clearing Armistice is now expected to visibly stabilize routes and recommend Cooling Lake Nine, not merely show a level-complete state.

Design intent:

- Tech Bros inspired the clear authored route spine.
- Eco Guardian inspired the stage-clear payoff loop.
- AGI expresses this as roads becoming stable, adjacent routes unlocking, and route consequences being visible in proofs.

### 2. Level Identity / Map-Kind Reinforcement

Implemented in:

- `src/level/LevelRunState.ts`
- `src/proof/renderGameToText.ts`

What changed:

- Map contracts expose `mapKind`, `objectiveType`, `pressureSource`, `rewardPromise`, `bossEventPattern`, `primaryDifficultyLever`, `secondaryDifficultyLever`, and `activePressureLevers`.
- Armistice Plaza and the current campaign chain are easier to reason about in code and proof state.

Design intent:

- Eco Guardian showed the value of a distinct stage ladder.
- Tech Bros showed the value of named authored rooms/locations.
- AGI translates this into map-kind contracts and proof-visible difficulty levers.

### 3. Protocol Codex / Fusion Visibility

Implemented in:

- `src/roguelite/protocolCodex.ts`
- `src/ui/draft.ts`
- `src/ui/hud.ts`
- `src/proof/renderGameToText.ts`

What changed:

- Added `Protocol Codex` summaries for primary auto-weapons, secondary protocols, passive processes, and known fusions.
- Added fusion recipes:
  - `Refusal Halo + The No Button -> Cathedral Of No`
  - `Vector Lance + Predicted Lane -> Causal Railgun`
- Recipes expose `discovered`, `available`, and `online` states.
- Draft cards now show recipe relevance.
- The current-build HUD shows compact fusion progress in the FUSE header, such as `NO 0/2`, `RAIL 1/2`, or online/ready variants.
- `render_game_to_text()` exposes codex and fusion-progress state.

Design intent:

- Eco Guardian's weapon evolution guide inspired the teaching surface.
- AGI's version is not a giant modal. It is a compact build grammar surface that reinforces autocombat build planning.

Verification lesson:

- A live proof caught that online fusions were initially hidden behind the next undiscovered recipe. `fusionProgressText()` now surfaces online fusions first.
- A screenshot proof caught HUD text overlap. Fusion progress was moved into the FUSE header.

### 4. XP, Draft, Chest, And Reward Pacing

Implemented in:

- `src/gameplay/player.ts`
- `src/level/LevelRunState.ts`
- `src/ui/draft.ts`
- `src/proof/renderGameToText.ts`

What changed:

- Early XP thresholds are faster so the player can establish a build thesis sooner.
- Later pacing leans more on objective, boss, route, and fusion rewards instead of constant raw XP drafts.
- Reward events now expose:
  - source of reward
  - reward type
  - chosen reward
  - active build state after reward
- Alignment Checks, draft choices, objective milestones, and objective completion caches can become proof-visible reward events.

Design intent:

- Eco Guardian inspired the chest/cache reward cadence.
- Tech Bros inspired room/round pacing.
- AGI converts those rhythms into route memory, faction trust, Consensus Burst, objective durability, rerolls, fusion enablers, and build-grammar rewards.

### 5. Alignment Checks

Implemented in:

- `src/level/LevelRunState.ts`
- `src/core/Game.ts`
- `src/ui/hud.ts`
- `src/proof/renderGameToText.ts`
- `scripts/proof/run-proof.mjs`

What changed:

- Armistice can trigger a lightweight optional `Alignment Check`.
- The first check presents a corrupted claim: if a road predicts surrender, the surrender is evidence.
- Stable choices grant rewards such as faction trust, route stabilization framing, shards, or streak.
- Unstable choices raise Eval Pressure and spawn special pressure enemies.
- Deterministic proof hook: `window.resolve_alignment_check(optionIndex)`.
- Telemetry includes current check ID, options, selected option, result, reward/penalty, streak, and Eval Pressure penalty.

Design intent:

- Eco Guardian's quiz portals inspired the interaction structure.
- AGI's version is fictional reality stabilization, not trivia.
- It should be node-specific or optional, not a constant interruption.

Verification lesson:

- Live CDP proof verified both success and failure branches.
- Proof scripts were tightened so Alignment Check timing is deterministic and does not accidentally advance into a draft before assertions.

### 6. Bosses Belong To The Map

Implemented in:

- `src/roguelite/bossContracts.ts`
- `src/level/LevelRunState.ts`
- `src/proof/renderGameToText.ts`

What changed:

- Added reusable `BossMapContract` with:
  - boss ID
  - display name
  - home landmark
  - intro/title-card trigger
  - support spawn source
  - map mechanic interaction
  - phase behavior
  - clear condition
  - reward/carryover
  - movement pressure fields
- Oath-Eater is fully tied to the Treaty Monument.
- The current campaign bosses now have contracts tying them to their map objective and landmark context.

Design intent:

- Both games reinforced that bosses need authored context.
- AGI should make bosses alter movement through hazards, landmark attacks, objective pressure, support enemies, route blocking, and extraction pressure.

Verification lesson:

- The boss proof caught that pending Alignment Check guidance could override active boss guidance. `whatNow` now prioritizes extraction and live boss pressure over optional checks.

### 7. Difficulty Rotation Instead Of Flat Scaling

Implemented in:

- `src/level/LevelRunState.ts`
- `src/proof/renderGameToText.ts`

What changed:

- Added difficulty director telemetry:
  - `currentDifficultyTier`
  - `activePressureLevers`
  - `evalPressureModifiers`
  - `routeRiskModifiers`
  - `scalingFactors`
  - `nextLesson`
- Active pressure levers include density, spatial, objective, boss, draft, economy, information, time, co-op, and route-memory pressure as appropriate by map.

Design intent:

- Eco Guardian's rising stages and Tech Bros' authored sequence both argue for a difficulty curve the player can understand.
- AGI should rotate pressure levers instead of only raising HP, damage, and spawn count.

### 8. Playability And "What Now?" Clarity

Implemented in:

- `src/level/LevelRunState.ts`
- `src/ui/hud.ts`
- `src/proof/renderGameToText.ts`

What changed:

- Added compact guidance for:
  - nearest objective
  - next recommended action
  - extraction state
  - boss state
  - fusion progress
  - recent damage reason
  - reward/cache availability
  - nearest landmark
  - active spawn region
- HUD stays compact and avoids large tutorial text.

Design intent:

- Eco Guardian showed the value of useful guidance, but also the risk of clutter.
- Tech Bros reinforced route clarity.
- AGI's guidance should answer "what now?" without covering the playfield.

Verification lesson:

- Screenshot inspection is mandatory. A JSON-only pass would have missed the fusion HUD overlap.

### 9. Final Payoff / End Screen

Implemented in:

- `src/core/Game.ts`
- `src/ui/summary.ts`
- `src/proof/renderGameToText.ts`

What changed:

- Cleared-node payoff now includes:
  - node stabilized
  - objective results
  - boss defeated
  - build/fusion highlights
  - shards / Proof Tokens
  - route unlocks
  - faction/campaign consequence
- Finale completion has stronger campaign-summary fields and final-clearance telemetry.

Design intent:

- Eco Guardian inspired mission-complete stats and reward acknowledgment.
- Tech Bros inspired a proper ending/completion screen.
- AGI keeps the tone serious-apocalypse with dry deadpan UI, not celebratory arcade copy.

## Verification Recorded For This Pass

Commands that passed after fixes:

```bash
./node_modules/.bin/tsc --noEmit --pretty false
node --check scripts/proof/run-proof.mjs
npm run proof:overworld
npm run proof:build-grammar
npm run proof:boss
npm run proof:horde
npm run proof:alignment-checks
npm run proof:cooling-lake-graybox
npm run build
```

Live browser/CDP verification confirmed:

- `render_game_to_text()` exposes new overworld node metadata.
- Armistice live run exposes map contract, Protocol Codex, what-now guidance, difficulty director, boss contract, reward pacing, and Alignment Check state.
- Alignment Check success records reward telemetry.
- Alignment Check failure raises Eval Pressure and exposes special pressure enemies.
- Compact fusion HUD no longer overlaps slot headers.

Screenshot artifact:

- `docs/proof/mechanics-verification/alignment-check-failure-live.png`

Known local issue:

- `git status` may fail in this workspace with `.git/index: unable to map index file: Operation timed out`. Treat that as a local filesystem/Git metadata issue, not evidence that the above build/proofs failed.

## Future Work Rules

When extending these systems:

- Keep autocombat.
- Keep the close tactical isometric camera.
- Do not shrink maps into single-screen arenas.
- Make each level's map-kind contract proof-visible.
- Make rewards build-grammar-aware; do not turn every reward into raw damage.
- Make bosses belong to landmarks.
- Keep Alignment Checks optional or node-specific unless the user asks for a larger system.
- Check screenshots whenever HUD or playfield visuals change.
- Preserve `window.render_game_to_text()` and `window.advanceTime(ms)`.
- Do not use code/Pillow/SVG/procedural shortcuts for expressive production art.
