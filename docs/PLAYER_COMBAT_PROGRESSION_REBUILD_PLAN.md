# Player Combat Progression Rebuild Plan

Date: 2026-05-14

Purpose: turn the Gohjoe research pass into a concrete `AGI: The Last Alignment` combat/progression redesign plan. This is a design and implementation plan only. No gameplay code changes were made in this pass.

## Implementation Status - 2026-05-14

`Protocol Loadout V1` is now implemented in the code/content layer. The original planning note above remains as design rationale; this section records the shipped state and deviations.

Implemented:

- Slot/cap grammar now treats Core Weapon, Secondary Protocol, Passive Process, Major Evolution, Consensus Burst, and Utility Cache as distinct draft actions.
- Duplicate installed weapons can become `RANK UP` up to rank 5, and alternate cores are labeled `REPLACE CORE`.
- `render_game_to_text()` exposes slot caps, installed slots, weapon ranks, utility picks, HP/Burst restoration, rerolls, cache/lock state, overcap reroutes, and draft actions.
- Utility Cache picks are slotless and include Field Triage, Burst Cell Refill, Emergency Patch Cache, Lock A Protocol, Second Opinion, and Redline Loan.
- Draft rerolls are spendable from the draft screen through the existing retry input.
- New behavior/rule passives were added across economy, sustain, objective, targeting, movement/window, risk, and co-op-facing categories.
- Causal Railgun and Cathedral of No remain preserved; Signal Choir and Time-Deferred Minefield were added as V1 behavior-changing evolutions.
- Accord Striker, Bastion Breaker, Moonframe Juggernaut, Drone Reaver, Signal Vanguard, Redline Surgeon, Vector Interceptor, and Rift Saboteur now get structural run hooks rather than only base-stat flavor.
- A fast static proof was added as `npm run proof:combat-progression`.

Art/pipeline status:

- A ChatGPT Images concept/reference board for Protocol Loadout V1 was added at `assets/concepts/chatgpt_refs/protocol_loadout_v1/protocol_loadout_v1_reference_board.png`.
- PixelLab dedicated-profile health was checked with `npm run pixellab:check` and passed.
- No new production runtime sprite atlas was generated in this slice. Runtime visuals reuse the already accepted source-backed build weapon VFX atlas at `assets/sprites/effects/build_weapon_vfx_v1.png`, with new mappings into existing Signal/Rift/repair/cache frames. This avoids faking art with code while keeping the gameplay slice shippable.

Known deviations:

- `Lock A Protocol` deterministically stores the first non-utility offer from the current draft rather than exposing a separate card-lock selection UI.
- Utility caches are recorded in run telemetry and reward events but do not become permanent expedition patches.
- V1.5's broader recipe web and dedicated PixelLab icon/VFX batch remain future work.
- Online Colyseus authority logic was not expanded; the new fields are local/proof telemetry-safe and ready for later server mirroring.

Verification:

- `npm run proof:combat-progression` passed.
- Targeted TypeScript transpile syntax checks for changed TypeScript files passed.
- `node --check scripts/proof/run-proof.mjs` passed.
- 2026-05-14 hydrated temp checkout verification passed from `/tmp/agi-protocol-loadout-proof`: full `tsc --noEmit`, production `vite build`, `npm run proof:combat-progression`, `npm run proof:combat-progression-browser`, `npm run proof:build-grammar`, `npm run proof:build-vfx`, `npm run proof:smoke`, and packaged-dist `PUBLIC_GAME_URL=http://127.0.0.1:8123 npm run proof:milestone58-launch`.
- Browser screenshot review found the reused source-backed VFX/icon atlas readable enough for V1. No dedicated PixelLab production batch was generated in this pass.

## Diagnosis

AGI already has the bones of a better system:

- autocombat is preserved;
- `BUILD_SLOT_CAPS` already define one primary, two secondaries, four passives, and one fusion;
- `render_game_to_text()` exposes build grammar;
- Protocol Codex can reveal fusion recipes;
- `proof:build-grammar` already proves Vector Lance -> Predicted Lane -> Causal Railgun;
- the campaign has strong objective variety and enemy-role differentiation.

The problem is that the live player build still feels more like a sequence of stat patches than a build. Most choices mutate a small group of numbers: damage, cooldown, pierce, pickup range, speed, max HP, objective defense, or Burst charge. The player sees "more power," but not enough "my run now works differently."

The current design should become:

`Choose a frame/co-mind -> commit to a capped protocol loadout -> rank a few tools -> evolve one thesis -> spend utility/refill choices to survive long maps -> extract with a readable build story.`

## V1 Combat Progression System Proposal

### V1 Name

`Protocol Loadout V1`

The player is not collecting random buffs. They are installing a constrained emergency protocol stack into a combat frame:

- Core Weapon: the main auto-weapon that defines the run's combat body.
- Secondary Protocols: automated supporting behaviors.
- Passive Processes: rules that affect economy, sustain, objectives, targeting, movement, risk, or co-op.
- Major Evolution: one build-defining transformation.
- Utility Caches: one-shot or short-duration survival choices that do not consume permanent slots.

### Design Goals

1. Make every draft ask a real question.
2. Let weapons improve through rank and recipes, not only global damage.
3. Add sustain/refill choices without making the player immortal.
4. Make classes and co-minds structurally distinct.
5. Preserve close-camera readability and autocombat.
6. Preserve Campaign Mode, Free Alignment, extraction, boss pressure, enemy roles, and deterministic proof hooks.

## Weapon Slot And Cap Model

### Slot Contract

V1 should keep the existing cap model:

- Core Weapon: `1/1`
- Secondary Protocol: `0-2/2`
- Passive Process: `0-4/4`
- Major Evolution: `0-1/1`
- Consensus Burst Path: `1/1`
- Utility Cache: uncapped history, but only occasional offers

### Core Weapon Rules

Core weapons should be commitments:

- The frame's starting weapon fills the core slot.
- Drafting a new core weapon should be shown as `REPLACE CORE`, not as a free additive upgrade.
- Replacing a core should preserve the old weapon in run history but remove its active behavior.
- Duplicate offers for the current core should become `RANK UP`, capped at rank 5.
- Evolution requires core rank plus a recipe ingredient, not just two unrelated picks.

Recommended V1 core weapons:

| Core weapon | Current source | Intended identity | V1 behavior goal |
|---|---|---|---|
| Refusal Shard | default | balanced projectile | grows into denial/aura or split refusal lines |
| Vector Lance | draft/current | long lane/boss precision | ranks increase lane width and target priority, not only damage |
| Signal Pulse | draft/current | close objective defense | ranks add pulse rhythm, shield ticks, or relay window support |
| Rift Mine | class runtime profile | delayed area control | ranks improve arming, slow, and objective choke behavior |
| Fork Drone | class runtime profile | drone/fork pressure | ranks add controlled drone count or retarget rules with projectile caps |
| Redline Suture | class runtime profile | sustain/support shot | ranks add triage or shield-on-hit windows |

### Secondary Protocol Rules

Secondary protocols should not feel like weaker primary weapons. They should be automated behavior modules.

V1 secondary examples:

- `context_saw`: orbit/control, shard-economy scaling, small close-range lane cleanup.
- `patch_mortar`: dense-cluster/objective attacker pressure, slow cadence, visible impact.
- `rift_snare`: mine or snare behavior, low projectile clutter.
- `fork_daemon`: a drone support protocol with strict active cap.
- `appeal_writ`: late-game line control against elites/objective jammers.

If the player has two secondaries, new secondary offers should become:

- rank up an installed secondary;
- replace one secondary;
- offer a matching passive/evolution ingredient;
- offer utility/refill.

## Weapon Evolution Model

### Recipe Shape

Each evolution should use this format:

`Core or Secondary + Passive/Co-Mind/Class Ingredient + Rank/Milestone -> Major Evolution`

The Protocol Codex should show:

- recipe name;
- known ingredients;
- met ingredients;
- missing ingredients;
- result behavior;
- whether it consumes the one major evolution slot.

### V1 Evolution Set

| Evolution | Recipe | Behavior change | Why it helps AGI |
|---|---|---|---|
| Cathedral of No | Refusal Shard or Refusal Halo + The No Button + defense/refusal tag | Refusal shots/aura become a wider denial field that pushes and marks close enemies | Makes defense builds visible without more projectile spam |
| Causal Railgun | Vector Lance rank + Predicted Lane or Prediction Priority | Lance becomes slower, heavier, boss/elite-priority lane fire with stronger pierce | Turns precision into a boss answer |
| Signal Choir | Signal Pulse rank + Relay Phase Lock or Beacon Discipline | Pulse rhythm gains periodic shield/refill ticks near objectives and co-op allies | Turns support into map/team identity |
| Time-Deferred Minefield | Rift Mine rank + Delayed Causality or Anchor Bodyguard | Mines arm on route/objective windows, slow enemies, then chain detonate with a strict cap | Gives control builds tactical rhythm without bullet clutter |
| Context Singularity | Context Saw rank + Coherence Indexer | Saw orbit briefly pulls shards inward and damages enemies near recalled shards | Joins economy and combat in one readable behavior |
| Armistice Artillery | Patch Mortar rank + Treaty Anchor Toolkit or objective tag | Mortars prefer objective attackers, bosses, and jam enemies; impacts create short repair windows | Makes objective engineer builds real |
| Community Forkstorm | Fork Drone rank + Open Herd or Guardian Fork | Drones retarget by enemy role and cap projectile count; forks prefer flankers/jammers | Gives drone builds intelligence instead of raw spam |
| Redline Rescue Broadcast | Redline Suture rank + Field Triage Loop | Shots occasionally create repair pulses or shield wounded allies/self after a cooldown | Adds sustain without passive regen soup |

V1 does not need all eight. A safe V1 should implement four: Cathedral of No, Causal Railgun, Signal Choir, and Time-Deferred Minefield. Context Singularity and Armistice Artillery are natural V1.5 additions because they touch pickups/objectives.

## Passive Categories

Passives should be sorted by player-facing function, not only by source.

### Economy Passives

- `Coherence Indexer`: recalled shards feed Burst and maybe weapon rank progress.
- `Shard Cache License`: increases chance of utility/cache offers after objective milestones.
- `Reroll Reserve`: grants spendable draft rerolls and reveals one recipe hint after reroll.

### Sustain Passives

- `Field Triage Loop`: small HP refill on draft, objective completion, or low-HP cache, with a cooldown.
- `Second Opinion Shield`: once per boss phase, converts lethal damage into a shield and Burst debt.
- `Redline Recompile`: co-op revive/recovery support, server-owned online.

### Objective Passives

- `Anchor Bodyguard`: already good; make it damage/jam-specific and more visible.
- `Treaty Anchor Toolkit`: objective repair and temporary safe window after cache, not only rate.
- `Route Memory`: improves route-window rewards and extraction safety after the objective trick is engaged.

### Targeting And Enemy-Role Passives

- `Prediction Priority`: already strong direction; expand to elites/jammers/bosses with proof counters.
- `Weakest Link Scanner`: prioritizes objective jammers and support buffers.
- `Line Breaker`: evolved lane weapons gain bonus effects against line snipers and lead shooters.

### Movement And Window Passives

- `Route Runner`: bonus during route windows, extraction lanes, and timed crossings.
- `Grounded Cable Boots`: already map-relevant; generalize the pattern for hazards.
- `Panic Window`: brief speed/shield when hit below 35% HP.

### Risk Passives

- `Low-HP Adversary`: more power at low HP, but disables some refill offers.
- `Cursed Context`: bigger rewards from caches, but draft rerolls cost HP or Burst.
- `Red-Team Spike`: temporary burst damage after taking an Eval hazard.

### Co-op Passives

- `Co-op Relay`: shared Burst charge only when players split objectives correctly.
- `Rescue Subroutine`: existing direction; make it a revive or shield pulse, not only objective defense.
- `Split Attention`: buffs different weapon roles across a 2-4 player cell with server-owned telemetry.

## Health, Refill, And Sustain Model

AGI should not add passive full regeneration as the default. Sustain should be a draft/resource decision.

### Utility Cache Offers

Utility choices can appear:

- every 2-3 drafts;
- after mid-run campaign duration caches;
- after objective milestones;
- when player HP is below 45%;
- as a skip/reroll fallback when slots are full.

### V1 Utility Choices

| Utility | Effect | Tradeoff |
|---|---|---|
| Field Triage | Restore 25% missing HP and add a small triage tag | No weapon rank or passive gained |
| Burst Cell Refill | Restore 40-55 Burst charge | No HP; only valuable if Burst path matters |
| Emergency Patch Cache | Heal 12% max HP and gain one draft reroll | Lower immediate power than a build pick |
| Lock A Protocol | Cache one offered card so it appears next draft | No immediate power; improves recipe planning |
| Second Opinion | Gain a one-time shield against the next heavy hit | Does not stack; no damage increase |
| Redline Loan | Restore 45% missing HP, but reduce future refill offers this level | Useful panic button with a cost |

### Health Pickups

V1 should avoid adding frequent health pickups to the field. They would compete visually with shards and enemy-role VFX. Health should be mostly draft/cache/summary mediated.

### Co-op Sustain

Co-op sustain should be role-shaped:

- Redline Surgeon gets stronger triage cache offers.
- Signal Vanguard can convert Signal Choir pulses into small ally shields.
- Bastion Breaker can guard a revive/recompile circle.
- Online co-op should keep actual revive/relay authority server-owned.

## Draft Pacing, Rerolls, And Cache Rules

### Draft Arc

The 11-level duration profile needs a long-run draft rhythm:

- Opening: establish core thesis quickly.
- Build Online: choose secondary/passive lane.
- Objective Cycle 1: offer first utility/cache or objective passive.
- Elite Cache: offer rank-up/evolution ingredient.
- Objective Cycle 2: strengthen sustain, route, or boss answer.
- Boss Pressure: offer final rank/evolution/refill.
- Extraction Panic: fewer full drafts; more caches, Burst, and survival events.

This maps well to existing `campaignDurationProfile` mid-run reward beats.

### Rerolls

`draftRerolls` should become spendable:

- Reroll costs 1.
- Reroll preserves at least one card that matches an installed recipe ingredient unless the player explicitly rerolls all.
- Reroll cannot produce illegal over-cap cards.
- Reroll telemetry: `rerollsOffered`, `rerollsSpent`, `cardsLocked`, `recipeHintAfterReroll`.

### Cache / Lock

Add one lightweight cache mechanic:

- Player may lock one card from a draft.
- Locked card appears in the next draft if still legal.
- Locking costs the pick or costs one reroll, depending on balance.
- Proof should expose `cachedCardId` and `cachedCardConsumed`.

### Slot-Full Draft Behavior

When slots are full:

- no dead offers;
- rank installed item;
- replace installed item;
- offer evolution;
- offer utility/refill;
- offer reroll/cache.

## Class, Co-Mind, And Build Identity Changes

### Frame Identity

Frames should each have one structural rule in V1 or V1.5:

| Frame | Current identity | V1 structural hook |
|---|---|---|
| Accord Striker | speed, pickup | Route windows and shard recall are stronger after movement streaks |
| Bastion Breaker | armor, cannon | First heavy hit during objective work becomes guard pulse |
| Drone Reaver | drones/summons | Drone/fork protocols get one extra drone behavior, not an extra projectile flood |
| Signal Vanguard | support pulses | Signal/support utilities appear more often; Signal Choir shield pulses are stronger |
| Bonecode Executioner | melee chains | Close-range core weapons can rank faster after elite kills |
| Redline Surgeon | healing/revives | Triage utilities are stronger and can shield allies |
| Moonframe Juggernaut | heavy stomp | Objective/body-block builds gain knockback windows |
| Vector Interceptor | prediction lanes | Prediction recipes are revealed earlier and elites/jammers are prioritized |
| Nullbreaker Ronin | duelist | Boss/elite picks are stronger, but sustain offers are rarer |
| Overclock Marauder | heat/rage | Risk passives and low-HP payoffs are stronger |
| Prism Gunner | beams/ricochet | Lane/evolution passives interact with environmental weapon maps |
| Rift Saboteur | traps/mines | Mine/control picks are more common and interact with route/objective windows |

### Co-Mind Identity

Co-minds should bias recipes rather than only stats:

- OpenAI Accord: draft clarity, reroll/cache, refusal recipes.
- Anthropic Safeguard: sustain, guard, objective defense, revive safety.
- DeepMind Gemini: prediction, boss/elite priority, lane weapons.
- Mistral Cyclone: route windows, cooldown rhythm, movement utilities.
- Meta Llama Open Herd: drones, forks, community/familiar recipes.
- Qwen Silkgrid: pickup economy, relay support, co-op language/logistics.
- DeepSeek Abyssal: efficient single-target, sparse high-impact weapons.
- xAI Grok Free Signal: risk/reward, chaos, low-HP or cursed utility.

Free Alignment should expose every frame/co-mind and the full recipe web. Campaign should unlock recipe families in a teaching order.

## Campaign Unlock Integration

Campaign rewards should unlock build options, not permanent raw stat dominance.

Recommended 11-level unlock arc:

1. Armistice Plaza: core cap UI, Refusal/Vector/Signal basics, first sustain utility.
2. Cooling Lake Nine: hazard/movement passives, Field Triage Loop.
3. Transit Loop Zero: route-window passives, Lock A Protocol.
4. Signal Coast: Signal Choir recipe, support/co-op passives.
5. Blackwater Beacon: boss-gate targeting passives and Patch Mortar objective targeting.
6. Memory Cache: Context Singularity ingredients and route-memory economy.
7. Guardrail Forge: objective engineer passives and guard/holdout sustain.
8. Glass Sunfield: prism/lane/environmental weapon interactions.
9. Archive Court: evidence carry, redaction resistance, line-sniper counterplay.
10. Appeal Court: public window, verdict, and co-op relay choices.
11. Alignment Spire Finale: remix recipe visibility and final evolution chase.

Campaign Mode should unlock pools gradually. Free Alignment should allow all pools immediately while still not granting campaign rewards.

## Co-op Implications

### Local Co-op

Local Consensus Cell players can share the screen and run separate capped loadouts. The current `players` runtime list in `LevelRunState` already supports multiple runtime builds and weapons.

V1 should keep co-op effects compact:

- one shared Burst path;
- per-player slots;
- support passives that pulse shields or refill Burst;
- no multiplied full-screen projectile spam.

### Online Co-op

When Colyseus online co-op is active:

- draft voting should choose a local player's card only if the server accepts the resulting build state;
- revive, shared shield, and objective relay effects should be server-owned;
- telemetry must include per-player slot usage and aggregate team role composition;
- no client-authoritative utility/heal/refill effects.

### Co-op Build Roles

Proof-visible team roles:

- runner;
- cover;
- harrier;
- support;
- control;
- duelist;
- objective engineer;
- shard economist.

This extends `src/content/buildKits.ts` rather than replacing it.

## Integration With Enemy Roles, Bosses, And Extraction

Enemy Mob Differentiation V1 should become the pressure surface that builds answer.

Examples:

- Prediction Priority and Causal Railgun answer bosses, elites, line snipers, and objective jammers.
- Signal Choir answers rusher pressure, co-op rescue, and objective windows.
- Time-Deferred Minefield answers blockers, rushers, and route-mouth pressure.
- Community Forkstorm answers flankers and support buffers, with projectile caps.
- Field Triage answers burst damage but not indefinite attrition.
- Objective Engineer passives answer jammers, not every enemy.

Extraction should remain tense:

- final drafts after boss should lean utility, Burst, or extraction safety;
- a build that over-invested in damage may still need a refill choice;
- route/extraction passives can help but should not trivialize exit pressure.

## Telemetry And Proof Plan

### Runtime Telemetry Additions

Add to `render_game_to_text()` and `LevelRunState.runIntel()`:

- `weaponRanks`;
- `coreWeaponRank`;
- `secondaryProtocolRanks`;
- `passiveCategories`;
- `utilityPicksTaken`;
- `hpRestoredFromDrafts`;
- `rerollsSpent`;
- `cachedCardId`;
- `cachedCardConsumed`;
- `recipeStates`;
- `evolutionActivatedAtSeconds`;
- `slotFullReplacementOffers`;
- `illegalOvercapOffersBlocked`;

### Static Proofs

Add `npm run proof:combat-progression-static`:

- every draftable weapon has a slot kind;
- every active recipe has all ingredients defined;
- every evolution has behavior text and telemetry id;
- every utility has no permanent slot;
- no passive category exceeds the planned vocabulary;
- Free Alignment can select all frame/co-mind recipe pools.

### Runtime Proofs

Extend `proof:build-grammar` or add `proof:combat-progression`:

- first draft shows core/secondary/passive/utility labels;
- primary replacement is explicit;
- duplicate core ranks current weapon;
- full secondary/passive slots do not produce illegal new additive cards;
- health utility restores HP and records telemetry;
- reroll spends a reroll and changes legal cards;
- cache/lock stores and consumes a card;
- at least one evolution activates and changes projectile/behavior telemetry;
- `window.render_game_to_text()` and `window.advanceTime(ms)` remain present.

### Screenshot Review

Manual screenshot inspection remains required:

- draft UI does not overflow;
- current build panel still fits;
- evolved weapon VFX remain readable;
- health/refill utility does not add visual clutter;
- close camera remains tactical.

## Codebase Audit

### `src/content/upgrades.ts`

Current state:

- Good player-facing names and tags.
- A few evolution declarations exist in content: `refusal_halo -> cathedral_of_no`, `vector_lance -> causal_railgun`.
- Many class/faction/passive ids are content-visible but not always behavior-rich.

Plan impact:

- Add explicit metadata for slot kind, rank cap, passive category, utility flag, and recipe role.
- Keep descriptions stat-first and player-facing.
- Do not add expressive art references until source-backed VFX exists.

### `src/gameplay/weapons.ts`

Current state:

- `updateAutoWeapon()` supports primary weapon profiles plus `context_saw` and `patch_mortar`.
- Many starting weapons exist as profiles, but most behavior is still projectile speed, radius, life, damage, and pierce.
- `predictionPriority` already affects target selection.
- `causalRailgun` changes Vector Lance label/bonus/priority.

Plan impact:

- Introduce behavior modules rather than more one-off stat profiles.
- Add weapon rank input to profiles.
- Keep projectile caps and low clutter.
- Prefer behavior flags such as `targetingMode`, `objectivePriority`, `onShardRecall`, `mineArming`, `supportPulse`, and `elitePriority`.

### `src/gameplay/upgrades.ts`

Current state:

- Central build state, slot caps, draft generation, upgrade effects, evolution eligibility, and rule text.
- `canDraftUpgradeForBuild()` enforces secondary/passive/fusion caps but allows primary cards freely.
- Draft cadence is deterministic and early levels are hand-shaped.
- `draftRerolls` exists but is not a spendable draft UI verb.

Plan impact:

- Add weapon ranks and utility choices.
- Make primary replacement explicit.
- Convert duplicate active weapon/passive offers into rank-up cards.
- Add legal replacement/cache/reroll paths when slots are full.
- Add passive categories and utility no-slot picks.

### `src/content/classes.ts`

Current state:

- 12 frames have readable roles, silhouettes, base stats, and starting weapons.
- The main live difference is starting weapon plus speed/armor/pickup/cooldown.

Plan impact:

- Add one structural hook per frame, preferably in a new data field rather than hardcoded checks.
- Preserve existing unlocks and class ids.
- Keep Free Alignment selection intact.

### `src/content/buildKits.ts`

Current state:

- Strong role vocabulary: runner, cover, harrier, support, control, duelist.
- Faction kit definitions include party auras, passive ids, recompile modifiers, and hook statuses.
- Some statuses are planned/server-owned/content-only.

Plan impact:

- Extend roles to recipe bias, utility bias, and co-op proof roles.
- Keep online authority expectations explicit.
- Avoid making build kits another stat layer.

### `src/level/LevelRunState.ts`

Current state:

- Applies class/co-mind/kernel/eval/campaign carryover to the runtime build.
- Restores expedition progress by replaying chosen upgrade ids.
- Applies per-map campaign stat boosts and HP padding.
- Records reward events and mid-run campaign duration caches.
- Exposes draft bias tags by arena.
- Integrates objective progress, enemy-role pressure, boss pressure, extraction, and proof hooks.

Plan impact:

- Add utility/refill application and telemetry here or through draft state.
- Make campaign duration caches optionally offer utility instead of only direct Burst/objective/reroll increments.
- Reduce future dependence on hidden per-map raw stat padding once build sustain is stable.
- Preserve Enemy Mob Differentiation telemetry and objective-variety hooks.

### `src/proof/renderGameToText.ts`

Current state:

- Rich telemetry for selected build, build grammar, slot caps, reward events, protocol codex, enemy roles, campaign clarity, objective variety, and proof hooks.
- Already exposes `buildGrammar.slotCaps` and `protocolCodex`.

Plan impact:

- Add rank, utility, reroll/cache, replacement, and sustain telemetry.
- Add proof-visible recipe states and evolution activation events.
- Preserve `window.render_game_to_text()` exactly.

### Relevant Proof Scripts

Current state:

- `scripts/proof/run-proof.mjs` has `proof:build-grammar`, `proof:build-vfx`, `proof:upgrades`, objective/campaign/route proofs, and enemy-role assertions.
- `proof:build-grammar` checks Vector Lance, Signal Pulse, Causal Railgun recipe visibility, slot caps, fusion, and Causal Railgun projectile activity.
- `proof:roster-sweep` covers all frame/co-mind combinations.
- `proof:enemy-roles`, `proof:objective-variety`, `proof:campaign-duration`, `proof:campaign-clarity`, `proof:solo-campaign-unlocks`, `proof:smoke`, and `proof:reference-run` are the important regression suite.

Plan impact:

- Add a static combat-progression proof.
- Extend build grammar proof for primary replacement, utility, health refill, reroll spend, cache lock, rank-up, and no illegal overcap offers.
- Keep screenshot inspection in the workflow.

## Implementation Phases

### V1: Make The Existing Skeleton Real

Scope:

- Add build rank state and utility pick state.
- Make primary replacement explicit.
- Add rank-up behavior for current primary/secondary.
- Add 2-3 utility cards: Field Triage, Burst Cell Refill, Emergency Patch Cache.
- Make `draftRerolls` spendable in draft UI.
- Add telemetry/proofs for utility, reroll, rank, replacement, and no overcap.
- Keep existing weapons/VFX. No new production art required.

Success:

- The player can choose power, sustain, reroll, or recipe progress.
- Current build HUD and draft UI still fit.
- `proof:build-grammar`, `proof:build-vfx`, and new static proof pass.

### V1.5: Recipe Web And Class Hooks

Scope:

- Add Signal Choir and Time-Deferred Minefield as behavior-changing evolutions.
- Add one structural frame hook for 4-6 priority frames: Accord Striker, Bastion Breaker, Signal Vanguard, Redline Surgeon, Vector Interceptor, Rift Saboteur.
- Add co-mind recipe bias and utility bias.
- Tie campaign unlocks to new recipe families.
- Add route/objective-passive interactions for two maps only, likely Armistice and Cooling or Signal.

Success:

- Different frames feel structurally different in Free Alignment.
- Campaign unlocks reveal build families in a teaching order.
- No bullet-hell clutter.

### V2: Full Combat Thesis System

Scope:

- Add broader weapon behavior modules.
- Add source-backed VFX for new evolutions.
- Add full passive category roster.
- Add co-op role proofing and server-owned online integration.
- Reduce hidden per-map stat padding as player-chosen sustain/build systems carry more of the progression burden.

Success:

- Every run summary can name a build thesis.
- The player can describe the run as a build, not a stat pile.
- Campaign, Free Alignment, co-op, bosses, extraction, enemy roles, and objective variety all use the same build language.

## Recommended First Implementation Slice

Ship `Protocol Loadout V1A: Draft Constraints And Utility`.

Small safe scope:

1. Add utility draft cards for `Field Triage`, `Burst Cell Refill`, and `Emergency Patch Cache`.
2. Make `draftRerolls` spendable from the draft screen.
3. Add telemetry for utility picks, HP restored, rerolls spent, and illegal overcap offers blocked.
4. Make primary weapon replacement copy explicit in the card body and proof telemetry, without adding new weapons.
5. Extend `proof:build-grammar` or add `proof:combat-progression` to verify utility, reroll, replacement, caps, and `render_game_to_text()` output.

Why this slice first:

- It directly addresses shallow progression and lack of sustain.
- It avoids new art and VFX risk.
- It preserves current enemy-role, campaign-duration, objective-variety, Free Alignment, and proof hooks.
- It creates the foundation needed before adding more evolutions.
