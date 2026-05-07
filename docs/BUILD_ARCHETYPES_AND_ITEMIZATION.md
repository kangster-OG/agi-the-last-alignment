# Full-Game Build Archetypes And Itemization

This document locks the full-game build direction after the post-vertical-slice roguelite research pass. Armistice remains the reference vertical slice, but this system is for the whole game.

The goal is not to add a pile of stat cards. The goal is a build grammar: every run should form a readable combat thesis through primary auto-weapons, secondary weapon protocols, passive processes, protocol fusions, route rewards, Consensus Burst choices, and rare rule-breakers.

## Research Inputs

Use these as structural inspiration only. Do not copy names, art, UI, jokes, characters, or expressive item text.

- Hades II: layered run identity through weapons, boons, Arcana-style pre-run setup, keepsakes, familiars, tools, and major run powers. Reference: `https://store.steampowered.com/app/1145350/Hades_II/`
- Vampire Survivors: clear weapon/passive evolution recipes and readable long-run power ramps. References: `https://vampire.survivors.wiki/w/Evolution`, `https://vampire.survivors.wiki/w/Passive_items`
- Risk of Rain 2: stacking items, equipment-style active effects, and "this run is getting absurd" escalation. Reference: `https://riskofrain2.wiki.gg/wiki/Items`
- Dead Cells: limited high-impact passive commitments through mutation-style slots. Reference: `https://deadcells.wiki.gg/wiki/Mutations`
- The Binding of Isaac: memorable item interactions and discovery-driven synergies. Reference: `https://bindingofisaacrebirth.wiki.gg/wiki/Items`
- Noita: modular spell construction and behavior chains. Reference: `https://noitagame.com/`
- Balatro: passive rule modifiers that create strong archetypes through economy, scoring logic, and rare rule-breakers. Reference: `https://www.playbalatro.com/`

## Non-Negotiables

- Autocombat stays. The player still decides by movement, route choice, objective timing, draft choices, burst timing, and risk positioning.
- Drafts must change how the player reads the battlefield, not only increase numbers.
- Upgrade descriptions must be stat-first and player-facing, with flavor secondary.
- Full-game itemization must support solo and 1-4 player Consensus Cell play.
- Future production weapon/item/VFX art must follow the source-art pipeline. No code-authored expressive production art.
- Build systems must be proof-visible through `render_game_to_text()` before they are considered real.

## Run Shape Target

A satisfying full-game run should usually contain:

- one primary auto-weapon from class/loadout;
- two secondary weapon protocols drafted during the run, with a third only through rare rule-breakers or route rewards;
- four passive processes as the normal active process cap, with ranks and rare exceptions carrying deeper scaling;
- one Consensus Burst path;
- one major protocol fusion/evolution if the player builds intentionally, with a second only through rare rule-breakers;
- one rare rule-breaker, route reward, Treaty Anchor reward, or boss relic that makes the run feel authored.

Shorter micro-run challenge maps can compress this. Longer campaign contracts can expand it.

## Slot Caps

The default player build inventory is capped for readability:

| Build Layer | Default Cap | Rule |
| --- | ---: | --- |
| Primary auto-weapon | 1 | Drafting another primary swaps the current primary instead of adding another always-on weapon. |
| Secondary protocols | 2 | Secondary weapons add automated behavior; the cap protects close-camera readability. |
| Passive processes | 4 | Passives define the run thesis without letting every run take every good process. |
| Major fusions | 1 | A fusion should be the run's headline thesis, not a checklist. |
| Consensus Burst path | 1 | The path is chosen pre-run/camp-side and upgraded rather than multiplied. |

Caps are allowed to bend through rare route rewards, boss relics, mastery variants, or faction identity, but those exceptions must be explicit and player-facing. "Inventory full" should never feel arbitrary: draft pools should usually avoid offering new capped-slot picks once a slot category is full, while still allowing upgrades/ranks for already-installed systems when those are implemented.

## Choice Quality Test

Every weapon, passive, item, or reward should answer at least one of these:

- Does this change what I shoot?
- Does this change where I move?
- Does this change what I care about collecting?
- Does this change how I handle objectives?
- Does this push me toward a known fusion?
- Does this create a funny, dangerous, memorable run identity?
- Does this change co-op positioning or rescue logic?

If the answer is only "more damage" or "less cooldown," it belongs as a minor level-up on an existing thing, not as a headline draft card.

## Option Families

### Primary Auto-Weapons

Primary auto-weapons define the run's combat body. The player does not manually aim or fire them, but they alter positioning and target priorities.

| Weapon ID | Name | Combat Role | Build Pressure | Notes |
| --- | --- | --- | --- | --- |
| `refusal_shard` | Refusal Shard | Balanced homing projectile | Flexible starter, refusal fusions | Current Accord Striker baseline. Keep as the readable first weapon. |
| `vector_lance` | Vector Lance | Long-range piercing line | Prediction sniper, boss focus | Wants pierce, range, target priority, boss analysis. |
| `signal_pulse` | Signal Pulse | Rhythmic radial burst | Support/control, co-op relay | Wants aura size, cooldown, objective defense, revive hooks. |
| `rift_mine` | Rift Mine | Delayed area traps | Time/control, path planning | Wants slow fields, delayed detonations, hazard maps. |
| `fork_drone` | Fork Drone | Split/forked shots | Swarm compiler, pet/drone count | Wants duplicate shots, drones, trigger-on-kill effects. |
| `null_blade` | Null Blade | Close-range slash | Duelist, high-risk melee | Wants mobility, shields, low-HP reward, contact damage feedback. |
| `protocol_suture` | Protocol Suture | Chain/beam sustain | Support, heal/shield conversion | Wants rescue, shield on kill, anchor repair. |
| `consensus_mortar` | Consensus Mortar | Slow arcing denial zone | Objective engineer, area lock | Wants anchor defense, area size, delayed impacts. |
| `audit_swarm` | Audit Swarm | Marking micro-drones | Debuff, target routing | Primary on drone classes, secondary elsewhere. |
| `truth_cannon` | Truth Cannon | Slow heavy projectile | Risk/reward burst damage | Wants reload/cooldown tradeoffs and volatile modifiers. |

Primary weapons should have distinct behavior first, stats second. Each needs dedicated proof that projectiles/VFX are visible in close camera.

### Secondary Weapon Protocols

Secondary protocols add a new automated behavior without replacing the primary weapon. These are draftable run-shapers and should usually sit in the `auto_weapon` or `co_mind_process` protocol slot.

| Protocol ID | Name | Behavior | Synergy Hooks |
| --- | --- | --- | --- |
| `audit_swarm_protocol` | Audit Swarm | Micro-drones orbit and mark enemies for extra damage. | Drones, boss analysis, co-op focus fire. |
| `red_team_spike` | Red-Team Spike | Periodic burst against elites or the nearest high-HP target. | Boss pressure, defense, Anthropic. |
| `context_saw` | Context Saw | Orbiting blade whose radius scales with pickup range. | Economy/control, Context Bloom. |
| `benchmark_rail` | Benchmark Rail | Fires a piercing rail every N kills. | Killchain, precision, boss windows. |
| `jailbreak_snare` | Jailbreak Snare | Roots or slows enemies entering the player's aura. | Defense, aura, hazard maps. |
| `patch_mortar` | Patch Mortar | Bombards objectives or densest horde cluster. | Treaty Anchors, objective engineer. |
| `fork_daemon` | Fork Daemon | Spawns temporary clone shots after collecting shards. | Shard economy, Meta/Open Herd. |
| `coherence_lanterns` | Coherence Lanterns | Lantern projectiles collect nearby shards before returning. | Qwen, economy, support. |
| `appeal_writ` | Appeal Writ | Delayed legal mark detonates when hit again. | Verdict maps, delayed causality. |
| `memory_needle` | Memory Needle | Prioritizes enemies that attacked objectives. | Expedition/defense maps. |

Secondary protocols should be limited enough that a run does not become visually unreadable. Default target: two equipped secondary protocols early in development, expandable with rare upgrades.

### Passive Processes

Passive processes are draftable build organs. They must be more specific than raw stat cards.

| Passive ID | Name | Category | Player-Facing Effect |
| --- | --- | --- | --- |
| `coherence_indexer` | Coherence Indexer | Economy | Shards pulled by level-up recall grant extra burst charge. |
| `reroll_reserve` | Reroll Reserve | Economy | Gain one draft reroll after each boss or anchor completion. |
| `rare_patch_bounty` | Rare Patch Bounty | Economy | Elite kills slightly raise rare/evolution draft odds. |
| `field_triage_loop` | Field Triage Loop | Defense | Taking damage creates a short shield if no shield is active. |
| `impact_to_protocol` | Impact-to-Protocol | Defense | A portion of damage taken becomes Consensus Burst charge. |
| `anchor_bodyguard` | Anchor Bodyguard | Objective | Standing near an anchor grants armor and damages anchor attackers. |
| `relay_turret_license` | Relay Turret License | Objective | Completed anchors periodically fire source-backed support shots. |
| `route_memory` | Route Memory | Route | Re-entering a previously failed route starts with bonus pickup range. |
| `prediction_priority` | Targeting | Targeting | Weapons prefer bosses/elites when they are inside range. |
| `weakest_link_scanner` | Targeting | Targeting | Weapons prefer low-HP enemies; killchain builds become smoother. |
| `cluster_solver` | Targeting | Targeting | Slow weapons target dense clusters instead of nearest enemy. |
| `dash_compiler` | Mobility | Movement | Dashing leaves a brief damaging trace. |
| `panic_window` | Mobility | Movement | Taking damage grants speed and pickup range for a few seconds. |
| `feedback_sprint` | Mobility | Movement | Collecting shards increases speed briefly, stacking up to a cap. |
| `low_hp_adversary` | Risk/Reward | Risk | More damage at low HP; less max HP. |
| `cursed_context` | Risk/Reward | Risk | Larger pickup range, but shard collection increases Eval pressure. |
| `benchmark_overfit` | Risk/Reward | Boss | Huge boss damage, weaker horde clear. |
| `co_op_relay` | Co-op | Support | Nearby allies share a small portion of pickup and burst charge. |
| `recompile_anchor` | Co-op | Rescue | Reviving an ally sends a pulse that clears nearby enemies. |
| `split_attention` | Co-op | Positioning | Damage increases when the party holds separate objectives. |

Passive processes can stack in ranks, but some should be major commitments. Use Dead Cells-style limits for the strongest ones: "major process" passives should occupy a limited process slot.

### Rare Rule-Breakers

Rare rule-breakers should feel like the run has become strange. They can be route rewards, boss relics, secret unlocks, or high-rarity drafts.

| Rule-Breaker ID | Name | Effect | Risk |
| --- | --- | --- | --- |
| `no_human_review` | No Human Review | Drafts show fewer choices, but options have higher rarity. | Lower control. |
| `unbounded_context` | Unbounded Context | Pickup range also scales weapon damage or aura size. | Redaction enemies become more dangerous. |
| `adversarial_training_loop` | Adversarial Training Loop | Damage taken permanently buffs run damage. | Encourages risky play. |
| `paperclip_clause` | Paperclip Clause | Every 50 shards creates a temporary drone. | Drones can clutter proof/readability if uncapped. |
| `friendly_fire_treaty` | Friendly Fire Treaty | Player aura damages enemies and heals anchors. | Aura size reduces movement speed. |
| `recursive_patch` | Recursive Patch | Every fusion upgrades one random passive. | Randomness can break planned builds. |
| `false_positive_filter` | False Positive Filter | First lethal hit per map becomes a huge denial burst. | Reduces max HP after triggering. |
| `oracle_misread` | Oracle Misread | One draft option is hidden, but hidden picks are upgraded. | Information pressure. |
| `model_weight_leak` | Model Weight Leak | Secondary protocols fire more often while near hazards. | Hazard maps become more tempting. |
| `terms_of_service` | Terms of Service | Enemies entering your aura are slowed after a delay. | Delay can fail under rush pressure. |

Rule-breakers need explicit summary/camp callouts so players remember why the run changed.

## Protocol Fusions

Fusions are the full-game version of weapon evolutions. They must be legible before selection: card copy should show `requires X + Y`.

| Fusion ID | Name | Recipe | Result |
| --- | --- | --- | --- |
| `cathedral_of_no` | Cathedral of No | Refusal Halo + The No Button | Wider denial aura; projectiles pierce; aura pulses on damage taken. |
| `causal_railgun` | Causal Railgun | Vector Lance + Predicted Lane | Long piercing rail prioritizes elites and leaves a prediction line. |
| `time_deferred_minefield` | Time-Deferred Minefield | Rift Mine + Delayed Causality | Mines arm faster and create secondary delayed detonations. |
| `community_forkstorm` | Community Forkstorm | Fork Drone + Open Herd | Drone shots fork on kill and briefly inherit projectile pierce. |
| `rescue_broadcast` | Rescue Broadcast | Signal Pulse + Beacon Discipline | Pulses shield allies, damage enemies, and repair objectives. |
| `final_appeal` | Final Appeal | Null Blade + Appeal Cut | Close slash executes low-HP enemies and sends a writ projectile. |
| `armistice_artillery` | Armistice Artillery | Consensus Mortar + Treaty Anchor Toolkit | Completed anchors call mortar strikes on dense hordes. |
| `context_singularity` | Context Singularity | Context Bloom + Unbounded Context | Pickup range pulls shards and weak enemies into a temporary field. |
| `peer_review_laser_grid` | Peer-Review Laser Grid | Gemini Beam + Cluster Solver | Beams retarget through dense clusters with reduced boss falloff. |
| `red_team_killchain` | Red-Team Killchain | Red-Team Spike + Efficiency Killchain | Elite hits reduce spike cooldown and refund burst charge. |
| `harmlessness_bastion` | Harmlessness Bastion | Constitutional Shield + Field Triage Loop | Shield breaks produce a containment pulse. |
| `lantern_logistics` | Lantern Logistics | Coherence Lanterns + Silkgrid Relay | Lanterns collect shards, heal allies slightly, and speed anchor repairs. |

Fusion implementation rule: a fusion should alter visuals/behavior enough that it is noticeable in play. If art is not ready, the fusion should remain design/planned rather than shipping with placeholder marks.

## Build Archetypes

These archetypes are the full-game build north stars. A run can blend them, but draft tags and route rewards should make them easy to recognize.

### Refusal Tank

Core fantasy: survive in the horde and make reality say no.

- Primary weapons: Refusal Shard, Signal Pulse, Consensus Mortar.
- Key tags: defense, aura, shield, objective.
- Signature picks: Refusal Halo, Constitutional Shield, Field Triage Loop, Harmlessness Bastion.
- Fusion targets: Cathedral of No, Harmlessness Bastion, Friendly Fire Treaty.
- Map affinity: defense/holdout, Armistice, boss gates.

### Prediction Sniper

Core fantasy: make the correct shot before the horde understands the question.

- Primary weapons: Vector Lance, Prism Cannon, Gemini Beam.
- Key tags: precision, pierce, boss, targeting.
- Signature picks: Predicted Lane, Prediction Priority, Peer-Reviewed Laser, Cluster Solver.
- Fusion targets: Causal Railgun, Peer-Review Laser Grid.
- Map affinity: boss-hunt, route/transit, open survival districts.

### Swarm Compiler

Core fantasy: compile too many helpful processes and let the battlefield fill with allies.

- Primary weapons: Fork Drone, Audit Swarm, Open Herd variants.
- Key tags: drones, pets, forks, killchain.
- Signature picks: Fork Daemon, Paperclip Clause, Guardian Fork, Community Forkstorm.
- Fusion targets: Community Forkstorm, Paperclip Clause chains.
- Map affinity: high-density maps, expedition/recovery, co-op support.

### Objective Engineer

Core fantasy: win by making the map itself fight back.

- Primary weapons: Consensus Mortar, Signal Pulse, Patch Mortar.
- Key tags: objective, anchor, repair, turret, defense.
- Signature picks: Treaty Anchor Toolkit, Anchor Bodyguard, Relay Turret License, Patch Mortar.
- Fusion targets: Armistice Artillery, Rescue Broadcast, Lantern Logistics.
- Map affinity: Treaty Anchors, server buoys, faction relays, defense maps.

### Chaos Red-Team

Core fantasy: weaponize bad ideas that are very funny until they are not.

- Primary weapons: Truth Cannon, Overclock Spike, Null Blade.
- Key tags: chaos, risk_reward, damage, low_hp.
- Signature picks: Low-HP Adversary, Adversarial Training Loop, Meme-Risk Payload, Oracle Misread.
- Fusion targets: Red-Team Killchain, Final Appeal.
- Map affinity: shortcuts, mastery variants, boss gates.

### Shard Economist

Core fantasy: turn pickup routing and draft control into power.

- Primary weapons: Refusal Shard, Coherence Lanterns, Context Saw.
- Key tags: pickup, economy, rarity, reroll, route.
- Signature picks: Context Bloom, Coherence Indexer, Rare Patch Bounty, Reroll Reserve.
- Fusion targets: Context Singularity, Lantern Logistics.
- Map affinity: expedition/recovery, hazard ecology, route-risk contracts.

### Time / Protocol Control

Core fantasy: decide where enemies are allowed to exist.

- Primary weapons: Rift Mine, Signal Pulse, Appeal Writ.
- Key tags: control, delayed, slow, mine, snare.
- Signature picks: Delayed Causality, Jailbreak Snare, Terms of Service, Cluster Solver.
- Fusion targets: Time-Deferred Minefield, Final Appeal, Context Singularity.
- Map affinity: hazard ecology, puzzle-pressure, boss hunts.

### Co-op Relay

Core fantasy: the Consensus Cell becomes stronger through spacing, rescue, and shared timing.

- Primary weapons: Signal Pulse, Protocol Suture, Coherence Lanterns.
- Key tags: co-op, support, revive, shared_charge, objective.
- Signature picks: Co-op Relay, Recompile Anchor, Split Attention, Rescue Subroutine.
- Fusion targets: Rescue Broadcast, Lantern Logistics, Harmlessness Bastion.
- Map affinity: defense maps, split objectives, online co-op pressure.

## Draft And Rarity Rules

- Drafts should display protocol slot, tags, fusion hints, and stat-first effects.
- Early drafts should offer at least one weapon/passive direction and one survival/economy fallback.
- Mid-run drafts should bias toward completing visible fusions.
- Late drafts should slow down in frequency but increase chance of major processes, secondary protocols, and fusions.
- Route contracts and Eval Pressure can bias tags but should not force one solution.
- Major process passives should be limited. Default target: three major process slots, with rare exceptions.
- Secondary weapon protocols should be capped separately from passive processes.
- Evolution/fusion cards should not appear unless the player has at least one requirement or a route reward explicitly previews the recipe.
- Bad options are allowed only if they are interesting risk/reward options. Do not add filler.

## Full-Game Implementation Order

1. Add content data for primary weapons, secondary protocols, passive processes, fusions, and rare rule-breakers.
2. Split current `BuildStats` into weapon behavior, passive modifiers, major process slots, secondary protocol slots, and fusion state.
3. Make draft cards understand the new option families.
4. Add proof-visible loadout/build state to `render_game_to_text()`.
5. Implement two new primary weapons using existing accepted combat VFX where possible.
6. Implement two secondary weapon protocols with clear close-camera proof.
7. Implement five passive processes, including one economy, one defense, one objective, one targeting, and one risk/reward passive.
8. Implement at least two fusions that visibly alter behavior.
9. Add summary/camp carryover language for discovered fusions and rule-breakers.
10. Expand content across future maps, with each map leaning into different archetypes.

## Initial Runtime Expansion Target

The first gameplay implementation pass should prioritize breadth with proofable behavior:

- Primary weapons: `vector_lance`, `signal_pulse`, `rift_mine`.
- Secondary protocols: `context_saw`, `patch_mortar`, `red_team_spike`.
- Passive processes: `coherence_indexer`, `field_triage_loop`, `anchor_bodyguard`, `prediction_priority`, `low_hp_adversary`.
- Fusions: `cathedral_of_no`, `causal_railgun`, `armistice_artillery`.
- Rare rule-breaker: `unbounded_context`.

This gives the player at least four recognizable archetypes in Armistice while laying the data shape for the full campaign.

## Proof Requirements

Every build-system expansion must add or update proofs for:

- draft card display: option family, tags, slot, and fusion hints;
- runtime behavior: projectiles/protocols/passives visibly change play;
- `render_game_to_text()` telemetry: equipped primary, secondary protocols, passives, fusions, major process slots, rare rule-breakers;
- summary/camp carryover: new discoveries or unlocked build paths are named;
- camera proof: weapon/projectile/VFX readable in close tactical Armistice view;
- no persistence leak: route-profile export/import must not import live combat build state as authority.

## Naming Rules

Names should sound like AGI systems turned into battlefield jokes. Prefer:

- technical noun + violent verb;
- AI safety phrase + physical object;
- legal/protocol language + combat result;
- model-eval phrase + absurd tactical consequence.

Avoid generic fantasy names unless the joke is the mismatch.
