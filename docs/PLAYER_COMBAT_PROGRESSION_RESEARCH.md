# Player Combat Progression Research

Date: 2026-05-14

Purpose: research the Gohjoe YouTube channel's recent action roguelite / horde-survival coverage and translate the useful structural lessons into `AGI: The Last Alignment` without copying protected names, characters, art, UI, jokes, maps, or expressive content.

## Source Scope

Gohjoe channel identified:

- YouTube channel: [Gohjoe](https://www.youtube.com/channel/UCac9YlOpTLy_wToRb5Bo-DQ)
- Channel index used for recent-video ordering: [Let's Play Index - Gohjoe](https://www.letsplayindex.com/channels/3832639-gohjoe)
- Recent video list used for dates, titles, and video ids: [All Videos by Gohjoe](https://www.letsplayindex.com/channels/3832639-gohjoe/videos)

The table below uses the latest unique game features visible in that recent-video list, roughly from 2026-05-05 back to 2026-03-24. Duplicate repeat videos were skipped when a game had already appeared, except when a repeat revealed a different structural lesson. Steam pages or official developer/publisher pages are used as the primary mechanics sources where available.

## Gohjoe 30-Game Research Table

| # | Game | Gohjoe video/date | Official source | Genre/subgenre | Core combat loop | Weapon/progression systems | Upgrade/evolution/passive mechanics | Healing/survival/resource systems | What makes build decisions interesting | What AGI can learn |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Trials Survivors | [2026-05-05](https://www.youtube.com/watch?v=g0wU0PvRjyA) | [Steam](https://store.steampowered.com/app/3762660/Trials_Survivors/) | Survivor-like plus hack-and-slash loot RPG | Move through dense monster trials while one main spell is manually aimed and other spells auto-trigger | Archetypes define start loadout; skills and relic loot push the run toward a thesis | Steam lists many spell evolutions and relic-driven scaling | Loot, relic shops, survival movement, and build power are the main sustain loop | Manual primary plus automatic support spells gives agency without turning the game into twin-stick aiming | AGI can keep autocombat but add one clearly privileged "core protocol" whose behavior evolves while secondaries stay automatic |
| 2 | Ash and Adam's Existential Treads | [2026-05-05](https://www.youtube.com/watch?v=FtSHeqUgQIQ) | [Steam](https://store.steampowered.com/app/3580340/Ash__Adams_Existential_Treads/) | Top-down action city-builder / tower defense | Drive a vehicle through ruins, gather resources, rescue settlers, and defend a growing settlement | Vehicle action feeds settlement construction; procedural levels and random build order change priorities | Building placement changes survival odds; settlement choices are the build | Resources, survivors, base health, and wave defense are interlocked | Combat choices matter because they decide what the base can become | AGI objectives and build choices should talk to each other: a route objective can unlock or strengthen a passive build lane |
| 3 | The Spell Brigade | [2026-05-04](https://www.youtube.com/watch?v=YVSqtyA7Ims) | [Steam](https://store.steampowered.com/app/2904000/The_Spell_Brigade/) | 1-4 player co-op survivors-like | Survive hordes with auto-spells while completing team objectives | Characters, spells, and upgrades combine into overpowered spell synergies | Co-op spell synergies and friendly-fire pressure create constraints | Team objectives, revive pressure, and positioning are survival resources | Build choices are social: a pick can help, endanger, or combo with teammates | AGI co-op passives should include relay, revive, and split-objective effects, not only bigger shared damage |
| 4 | TerraTech Legion | [2026-05-03](https://www.youtube.com/watch?v=Zqk4GdIgDGA) | [Steam](https://store.steampowered.com/app/3596700/TerraTech_Legion/) | Bullet heaven vehicle builder | Build a block vehicle, then drive, ram, and fire through AI bot swarms | 200+ blocks across weapons, propulsion, and utility; characters start with distinct builds | Block placement changes weight, steering, weapon arcs, ram identity, and utility | Vehicle integrity, steering, speed, and endless-mode pressure are survival constraints | The same part has different value depending on where it is placed | AGI cannot use block placement, but it can make slot position meaningful: core weapon, secondary protocols, passive processes, and utility caches should not be interchangeable stat lines |
| 5 | KIBORG | [2026-05-02](https://www.youtube.com/watch?v=EHxZ41XJCP0) | [Steam](https://store.steampowered.com/app/2405060/KIBORG/) | Third-person action roguelike beat-em-up / shooter | Run-based melee and gun combat with cybernetic upgrades | Body modifications, weapons, and run rewards push different brawler builds | Endless/update content emphasizes escalating modifier pressure | Survival comes from execution, upgrades, and adapting to brutal rooms | Build and action skill reinforce each other; upgrades do not replace dodging | AGI should make build choices amplify movement and positioning decisions, not erase them |
| 6 | SAROS | [2026-05-02](https://www.youtube.com/watch?v=xFWj3eJF0HM) | [Housemarque](https://housemarque.com/news/2025/5/27/announcing-saros-the-next-game-from-housemarque-coming-2026) | Third-person bullet-hell action roguelite | Dodge, shoot, clear hostile rooms, return stronger after death | Persistent progression is layered over run combat | Rewards and handcrafted/procedural routes open new approaches | Shields, weapon mastery, and permanent growth support survival | The build matters because mastery and route knowledge survive failure | AGI campaign unlocks should add new build grammar and recipe visibility, not only more starting stats |
| 7 | Gods, Death and Reapers | [2026-04-29](https://www.youtube.com/watch?v=pmiMnTeGnFY) | [Steam](https://store.steampowered.com/app/3086590/Gods_Death__Reapers/) | Extraction action RPG | Enter dangerous mythic zones, fight, loot, and leave with value | Gear and class/build composition matter because extraction changes risk tolerance | Loot rarity and mode structure make build greed a decision | Extraction, co-op PvE/PvPvE variants, and inventory risk provide survival tension | Every reward has a question: can I safely cash this out? | AGI extraction should make late-run choices include "finish build" versus "survive to bank campaign value" |
| 8 | Zombiehood | [2026-04-26](https://www.youtube.com/watch?v=ewIwN46SJoI) | [Steam](https://store.steampowered.com/app/3003120/Zombiehood/) | Run-and-gun side-scrolling roguelite | Scavenge weapons and artifacts, fight evolving undead, push through biomes | Weapons, gear, artifacts, skill points, weapon parts, and blueprints create run and meta growth | Artifact stacks and modifiers reshape weapons; enemy weakpoints and armor matter | Ammo scarcity, shops, healing, random events, and rising global difficulty | Survival is not only HP; ammo and shop timing make offense a resource | AGI should add occasional refill/repair choices and map caches so sustain is drafted, not assumed |
| 9 | Emberward | [2026-04-25](https://www.youtube.com/watch?v=D1ETs6SBI-k) | [Steam](https://store.steampowered.com/app/2459550/Emberward/) | Roguelite tower defense / maze builder | Place tetromino blocks and towers, then survive waves | Block cards, tower picks, runes, talents, maps, and fire sources define the build | Runes modify blocks/towers and create route-specific synergies | Fire-source health, route length, tower placement, and limited blocks are resources | A pick is interesting because it changes the path enemies take | AGI objective passives should sometimes reshape enemy routing or objective timing, not just repair faster |
| 10 | Legionbound | [2026-04-24](https://www.youtube.com/watch?v=ye-MzyvF8Nk) | [Steam](https://store.steampowered.com/app/4283360/Legionbound/) | Retro RPG autobattler roguelite | Recruit many heroes, position rows, cast spells, survive waves | Up to 50 heroes, class synergies, passive items, and Ascension classes | Duplicate/compatible units combine into higher identities | Unit survival, gold/recruitment, rows, and endurance pressure are resources | Caps and merges make every recruit a commitment to a future build | AGI can use capped slots plus rank/evolution recipes so duplicate picks mean "finish this thesis" instead of "+numbers" |
| 11 | Repel The Rifts | [2026-04-22](https://www.youtube.com/watch?v=ACVWBkV_vXc) | [Steam](https://store.steampowered.com/app/3686580/Repel_The_Rifts/) | Roguelite tower defense / tactics | Survey new terrain, place defenses, and hold waves from rifts | Tower upgrades, artifacts, and terrain expansion produce expedition builds | Market upgrades can grant new tower effects; artifacts augment strategies | Terrain, tower placement, economy, and wave tempo are resources | The map grows with the build, so scouting is part of progression | AGI large maps should let objective route knowledge bias later drafts and caches |
| 12 | Temtem: Swarm | [2026-04-22](https://www.youtube.com/watch?v=hJSfcxxkpf4) | [Steam](https://store.steampowered.com/app/2510960/Temtem_Swarm/) | Survivor-like creature collector, solo/co-op | Battle swarms and bosses solo or online co-op up to 3 players | Tems, abilities, gears, skill timing, and evolutions define power | Collect/evolve Tems, coordinate gears and skills, create overpowered synergies | Resource sharing, boss pressure, and co-op coordination drive survival | Evolution is exciting because it changes a creature identity, not only damage | AGI weapon evolutions should be called out as identity changes and made co-op-readable |
| 13 | Cursemark | [2026-04-20](https://www.youtube.com/watch?v=LWoyiQiJU_Q) | [Steam](https://store.steampowered.com/app/3219180/Cursemark/) | Dark fantasy action-exploration roguelite | Explore a haunted kingdom with melee, spells, wards, and ultimates | Weapons, skills, shrines, forges, and rune slots shape each run | Runes transform attacks, spells, wards, and ultimates with cross-effects | Secrets, shortcuts, permanent shrines, and route knowledge are resources | A modifier has value because it changes what an ability does | AGI passives should attach behavior modules to weapons, objectives, pickups, and Burst rather than living as isolated stat cards |
| 14 | Relic Abyss | [2026-04-18](https://www.youtube.com/watch?v=4HhIhVTUYfA) | [Steam](https://store.steampowered.com/app/3017760/Relic_Abyss/) | Bullet-heaven roguelite RPG | Clear generated levels, collect relics, evolve skills, fight bosses | 20 adventurers, 134+ skills, gear, relics, cards, perks, and hub training | Skills evolve; enemy cards enchant gear; perks randomize run identity | Gear, relics, cards, hub/city systems, and difficulty levels manage survival | Multiple progression planes let the player choose a build lane and a support lane | AGI needs active weapons, passives, sustain, objective utility, and campaign unlocks to form one build language |
| 15 | Goblin Vyke: The Thief Tycoon | [2026-04-17](https://www.youtube.com/watch?v=KSH7cPYps6s) | [Steam](https://store.steampowered.com/app/3794610/Goblin_Vyke/) | Stealth heist plus shop management | Sneak through dungeons by night, sell stolen goods by day | Tools, traps, stolen loot, employees, and shop expansion create progression | Items change stealth options rather than direct combat dominance | Evacuation, traps, lures, employee/shop economy, and danger avoidance matter | Avoiding combat can be more valuable than bigger attacks | AGI utility drafts can support route/extraction and objective survival without increasing DPS |
| 16 | MOUSE: P.I. For Hire | [2026-04-16](https://www.youtube.com/watch?v=MwwncZZv2Hs) | [Steam](https://store.steampowered.com/app/2416450/MOUSE_PI_For_Hire/) | Fast FPS / boomer shooter adventure | Move constantly, use weapons and power-ups, clear authored levels | Arsenal, consumable power-ups, movement abilities, and collectibles grow options | Power-ups are temporary tide-turners rather than permanent stat soup | Mobility, level traversal, consumables, and boss patterns keep survival active | Temporary power spikes make a run feel dramatic without permanent clutter | AGI can add one-shot utility picks such as refills, shields, rerolls, and Burst cells to punctuate long survival runs |
| 17 | Sol Cesto | [2026-04-15](https://www.youtube.com/watch?v=osnZDb9fVB4) | [Steam](https://store.steampowered.com/app/2738490/Sol_Cesto/) | Tactical luck-management roguelite | Choose a hero, descend through a random dungeon, manage risky choices | Heroes, cursed teeth, magic items, and dungeon outcomes shape progression | Luck manipulation is the core upgrade field | Risk, position, randomness, and consequence carry survival tension | The fun is controlling probability instead of deleting uncertainty | AGI can make "prediction" passives alter target priority, draft odds, cache timing, or elite tells, not just projectile speed |
| 18 | Cartapli: Fold Quest | [2026-04-15](https://www.youtube.com/watch?v=z7VGS9gmurQ) | [Steam](https://store.steampowered.com/app/4314560/Cartapli__Fold_Quest/) | Turn-based tactics roguelike / puzzle | Fold the paper board to shift positions and defeat enemies | Skills, Pebbles, and battle rewards define playstyle | Synergies support AoE, single-hit, and non-direct victory routes | Board geometry, enemy position, and reward choice are resources | Mechanics are memorable because upgrades interact with board manipulation | AGI map objectives should become part of the build: route windows, hazards, and lenses can be empowered by passives |
| 19 | Jotunnslayer: Hordes of Hel | [2026-04-14](https://www.youtube.com/watch?v=H2L80l0LaJg) | [Steam](https://store.steampowered.com/app/2820820/Jotunnslayer_Hordes_of_Hel/) | Horde-survival action roguelike | Fight waves, complete objectives, defeat final bosses | Heroes, weapons, divine blessings, meta perks, and mission goals define builds | Blessings and skills create run-specific gods of war | Objectives, boss goals, unlocks, and hostile worlds structure survival | Runs ask for a build that can handle both horde density and objective verbs | AGI's campaign levels should draft toward the current map verb while preserving the universal horde-survival loop |
| 20 | Goobies | [2026-04-14](https://www.youtube.com/watch?v=a7KTsWCVXPE) | [Steam](https://store.steampowered.com/app/2294130/Goobies/) | Top-down auto-shooter roguelite | Auto-shoot through endless waves and bosses | 5 characters, 30+ items, unique upgrades, 20 artifacts, coins, and encyclopedia unlocks | Artifacts can redefine mechanics and visuals | Character passives, item combos, meta coins, and escalating difficulty drive survival | Character passive plus item combo makes early identity matter | AGI frames need one structural passive each, not only a starting weapon and base stat spread |
| 21 | SENTRY | [2026-04-13](https://www.youtube.com/watch?v=pzfFXyYhRWE) | [Steam](https://store.steampowered.com/app/1252680/SENTRY/) | Action-defense FPS / roguelite | Defend a spaceship route with FPS combat, traps, turrets, and environmental destruction | Escape-route plotting and defenses form run strategy | Traps/turrets/environment combine with direct weapons | Ship integrity, route selection, defenses, and co-op are resources | The player decides where the fight happens | AGI extraction routes and objective zones should become build targets through defenses, mines, and route-safe passives |
| 22 | Skull Horde | [2026-04-10](https://www.youtube.com/watch?v=reH6ojRyIzY) | [Steam](https://store.steampowered.com/app/3199360/Skull_Horde/) | Auto-battler dungeon crawler roguelite | Move through dungeons while minions fight independently | Buy units, merge duplicates, collect loot, pick perks, choose characters | Unit classes/tags interact with loot; duplicate units merge into stronger versions and unlock abilities | Exploration, chests, shrines, rerolls, and dungeon-specific enemy types are resources | Rerolls are interesting because the roster has tags, caps, and merge targets | AGI should make rerolls spendable and make duplicate weapon/passive picks rank or evolve capped slots |
| 23 | Pass the Fear | [2026-04-10](https://www.youtube.com/watch?v=FiOm2CGoEnM) | [Steam](https://store.steampowered.com/app/3561220/Pass_the_Fear/) | Roguelite bullet-hell shooter, solo/co-op | Escape an island before dawn while stacking weapon mods, relics, and tarot effects | Weapons, parts, relics, tarot cards, affixes, character talents, and squad perks | Affixes and relic fusions create behavior chains; limited slots force choice | Time pressure, aggro, item exchange, co-op, and story junk pickups are resources | Slot limits make synergy more important than hoarding | AGI should cap active weapons/passives and offer health/refill/utility as real alternatives to greed picks |
| 24 | Skul: The Hero Slayer | [2026-04-09](https://www.youtube.com/watch?v=MnxQm2U7-pk) | [Steam](https://store.steampowered.com/app/1147560/Skul_The_Hero_Slayer/) | 2D action roguelite platformer | Swap skull forms, fight rooms, defeat bosses | Skulls are playable forms with different kits; items define archetypes | Skull swapping and item synergies change movesets and timing | HP, rooms, bosses, and transformation choice are survival constraints | Changing "weapon" can change the whole verb set | AGI can let primary weapons evolve into different combat verbs, while frames keep identity through passives |
| 25 | SlashZero | [2026-04-07](https://www.youtube.com/watch?v=rvO-6XhKw9k) | [Steam](https://store.steampowered.com/app/4061170/SlashZero/) | 3D side-scrolling action roguelike platformer | Combo, dash, vault, fight across layered maps, collect items | Builds customize flashy combat and item routes | Combat combos and item builds are the progression promise | Movement mastery, stage variation, and item choice keep survival active | Player verbs remain stylish because build changes affect mobility and combos | AGI movement passives should influence route windows, mines, pickup recall, and boss dodge rhythm, not just move speed |
| 26 | Magicraft | [2026-04-06](https://www.youtube.com/watch?v=l2xj0-_nnkM) | [Steam](https://store.steampowered.com/app/2103140/Magicraft/) | Top-down spellcrafting action roguelike | Combine spells into absurd effects and survive room pressure | Spells, wand-like construction, gear, and modifiers produce high build freedom | Modular spell combinations are the core; the system can surprise even developers | Build slots, mana/cadence, and survivability constrain chaos | A modifier is memorable because it changes how a spell routes, repeats, splits, or triggers | AGI should implement weapon behavior modules such as split, orbit, priority, delayed mine, objective retarget, and on-pickup triggers |
| 27 | Morbid Metal | [2026-04-04](https://www.youtube.com/watch?v=I3uEHinKRzM) | [Steam](https://store.steampowered.com/app/1866130/Morbid_Metal/) | High-speed hack-and-slash action roguelite | Shapeshift between characters in real time to chain combos through machines and bosses | Character forms and run upgrades create combo routes | Real-time transformation is the core behavior change | HP, timing, combos, and boss pressure are survival demands | Identity swapping gives the build a rhythm | AGI should not swap avatars mid-run, but evolved weapons can introduce rhythms: charge, pulse, orbit, mine, burst, refill |
| 28 | Cinderia | [2026-03-30](https://www.youtube.com/watch?v=B6Xz-1YNAJs) | [Steam](https://store.steampowered.com/app/3214610/Cinderia/) | Fast isometric action roguelite | Hack, slash, clear dungeons, and break runs with combat styles | Heroes, embers, skill cards, and gear fuse into styles | Fusion of embers/cards/gear creates overpowered but shaped combat | Gear, base growth, and brutal room pressure are resources | Build freedom is anchored by a few clear materials that combine | AGI should name recipe ingredients plainly: core weapon + enabler passive + map/class trigger |
| 29 | EverSiege: Untold Ages | [2026-03-28](https://www.youtube.com/watch?v=h-lrDMM-MlQ) | [Steam](https://store.steampowered.com/app/3363680/EverSiege_Untold_Ages/) | Hero strategy roguelite / action RTS / tower defense | Defend Bastion, reclaim powers, rebuild ruins, and reverse the siege solo or co-op | Heroes, powers, ruins, tactical choices, and co-op roles shape the run | Strategy upgrades alter battlefield control and comeback paths | Bastion defense, rebuilt structures, hero pressure, and co-op timing are resources | A build is also a defense plan | AGI objective engineer builds should let players fortify anchors, extraction gates, or route mouths in restrained ways |
| 30 | SYNTHETIK 2 | [2026-03-24](https://www.youtube.com/watch?v=5rzUUQ6v2kc) | [Steam](https://store.steampowered.com/app/1471410/SYNTHETIK_2/) | Tactical top-down shooter roguelite, 1-4 co-op | Fight machine forces with tactical gunplay, reloads, heat, attachments, and classes | 120+ weapons, class loadouts, attachments, item upgrades, and co-op create depth | Weapon attachments and class upgrades add distinct tradeoffs | Ammo/reload/heat/jams, armor, positioning, and co-op pressure are resources | Gun identity is strong because every weapon has operational constraints | AGI auto-weapons need operational identities: range, cadence, target rules, on-hit effects, objective behavior, and visual load, not just damage/cooldown |

## Pattern Analysis Across Games

### 1. Caps Create Identity

The strongest build games do not let the player take everything. Pass the Fear uses slot pressure; Skull Horde uses unit/loot decisions and merges; Legionbound uses hero composition and Ascensions; TerraTech Legion uses physical block placement; Emberward uses limited maze blocks and tower footprint. The constraint is what makes a build readable.

AGI already has the beginning of this with `BUILD_SLOT_CAPS`: one primary, two secondary protocols, four passive processes, and one fusion. The missing piece is that the draft system still feels like a list of upgrades, not a visible commitment ladder. Primary replacement is always allowed, duplicates do not rank weapons, rerolls are not yet a player-facing draft action, and capped slots are not turned into replacement/rank/evolution decisions.

### 2. Evolutions Work When They Change Behavior

Temtem: Swarm, Trials Survivors, Relic Abyss, Magicraft, Cinderia, Cursemark, and Skull Horde all make transformation part of the excitement. The common pattern is not "damage plus 20 percent." It is "this thing now behaves differently." A projectile splits, a unit merges, a spell gains a trigger, a creature evolves, a rune changes the shape of an attack, or gear fuses with a skill card.

AGI currently has two real evolution hooks: `cathedral_of_no` and `causal_railgun`. They are a good proof, but they are too few and too close to stat upgrades. Causal Railgun does at least add priority targeting, pierce, and a distinct projectile label; that should become the standard.

### 3. Passives Are Best When They Touch Rules

The strongest passives in the research touch pickups, enemies, objectives, target priority, map terrain, shops, co-op, rerolls, or risk. Cursemark runes modify abilities. Emberward runes modify blocks and towers. SENTRY and Repel the Rifts let defenses and terrain become progression. Zombiehood uses shops, ammo, artifacts, and enemy weakpoints. Pass the Fear uses affixes and relic fusions.

AGI has many passives, but most are currently scalar: weapon damage, cooldown, pierce, speed, pickup range, max HP, objective defense, and Burst charge. The best existing direction is map-specific pressure mitigation, `prediction_priority`, `anchor_bodyguard`, `coherence_indexer`, and Signal/Cooling passives. Those should become the model.

### 4. Sustain Is a Draft And Resource Problem

Modern survivor-likes and roguelites make survival resources interesting: ammo in Zombiehood, shops and healing, extraction greed in Gods, Death and Reapers, revive/co-op pressure in The Spell Brigade and Temtem: Swarm, temporary power-ups in MOUSE, tower/base health in defense hybrids, and route survival in SENTRY.

AGI mostly handles sustain through max HP, class armor, per-campaign HP padding, and objective defense. It needs occasional health/refill/survival choices that compete with damage picks: repair now, restore HP, bank Burst, add a revive pulse, cache a card, or take a risky low-HP payoff.

### 5. Autocombat Still Needs Active Strategic Decisions

Trials Survivors is especially relevant: one manual spell plus auto-targeting support keeps movement and loot collection central. AGI should not become an aim-heavy shooter, but its current auto-weapons need stronger strategic verbs. The player should choose whether the run is a lane-control build, objective-defense build, shard-economy build, drone/fork build, mine/control build, sustain build, boss-priority build, or co-op relay build.

### 6. Objectives And Map Verbs Can Be Part Of The Build

Emberward, Repel the Rifts, SENTRY, Ash and Adam, Jotunnslayer, and EverSiege show that progression gets more interesting when the battlefield is not passive scenery. AGI already has a strong 11-level objective-variety spine. The next combat pass should let passives and evolutions interact with those objectives without solving them automatically.

Examples:

- Hazard Lure builds gain safer hazard routing, not raw hazard immunity.
- Route Window builds gain burst speed or shard recall during windows.
- Carry And Extract builds gain temporary shields or evidence-lane rewards.
- Public Window builds gain elite targeting or jam resistance while inside windows.
- Finale remix builds expose recipe payoffs under learned objective pressure.

## What AGI Is Missing Right Now

1. Weapon commitment is too soft. `src/gameplay/upgrades.ts` has slot caps, but primary weapons can always be drafted and replace the current primary without a replacement decision, rank ladder, or visible opportunity cost.

2. The weapon pool is broad in ids but narrow in live behaviors. `src/gameplay/weapons.ts` has runtime profiles for many starting weapons, but the draftable active weapon surface is still mostly `refusal_shard`, `vector_lance`, `signal_pulse`, `context_saw`, `patch_mortar`, and `causal_railgun`.

3. Most upgrades still read as stat cards. The body text is clean and player-facing, but the effects often mutate the same small set of numbers.

4. Evolutions are rare. `cathedral_of_no` and `causal_railgun` prove the pipeline, but the game needs a recipe web large enough that different classes can chase different finishes.

5. Sustain is mostly max HP. The draft table does not yet offer occasional health refills, repair caches, shield pulses, temporary invulnerability, recovery windows, or spendable utility picks that compete with damage.

6. Rerolls exist in build state but are not a satisfying draft verb yet. Mid-run campaign caches can add rerolls, but the draft UI does not make reroll/cache/skip a strategic survival choice.

7. Classes look distinct on paper, but many active hooks collapse into starting weapon plus base stats. `src/content/buildKits.ts` marks many identities as active/planned/server-owned, but the run feel still needs structural frame differences.

8. Campaign level scaling still gives large direct stat help in `LevelRunState.enter()`: damage, pickup range, objective defense, Burst charge, and HP padding climb by arena. This was useful for campaign proof stability, but the next design pass should shift some of that feeling into player-chosen build grammar.

## Recommended Design Pillars

### Pillar 1: Capped Loadouts, Ranked Commitments

AGI should keep a strict run loadout:

- 1 core weapon
- 2 secondary protocols
- 4 passive processes
- 1 major evolution/fusion
- utility/refill choices that do not occupy permanent build slots

When a slot is full, new offers should become rank-up, replacement, evolution, or utility choices. A capped slot should create a question, not a dead draft.

### Pillar 2: Evolutions Are Behavior Changes

Every major evolution should answer:

- What ingredient did I commit to?
- What passive or class/co-mind pairing completed the recipe?
- What behavior changed on screen?
- What enemy/objective problem does it now solve?
- What does it not solve?

### Pillar 3: Passives Touch Systems

Passive categories should include:

- shard economy;
- sustain and survival;
- objective/map interaction;
- targeting and enemy-role response;
- movement/window routing;
- co-op relay/rescue;
- risk/reward.

Pure `+damage` and `-cooldown` cards should become support seasoning, not the main course.

### Pillar 4: Health And Refills Are Drafted

Sustain choices should be occasional and meaningful:

- small immediate HP refill;
- larger refill with no offensive gain;
- temporary shield during objective windows;
- Burst charge refill;
- one revive pulse;
- risky low-HP payoff.

This supports the 11-level duration profile without solving danger by raw HP inflation.

### Pillar 5: Build Identity Must Survive Co-op

Co-op builds should not just multiply projectiles. They should create roles:

- runner/scout;
- cover/bodyguard;
- support/triage;
- objective engineer;
- boss duelist;
- control/mines;
- shard economy.

Each player can have their own capped build, while team choices can add relay, revive, and objective timing effects.

## Risks And Anti-Patterns

1. Bullet-hell clutter. Adding weapons and evolutions can bury the close isometric camera. Prefer fewer, stronger, more readable effects with source-backed VFX.

2. Spreadsheet inflation. More `weaponDamage`, `weaponCooldown`, `projectilePierce`, and HP padding will not fix shallow combat feel.

3. Passive soup. Four passive slots should be enough. If every passive does five things, the build becomes unreadable.

4. Evolution bloat. A recipe web is useful only if the player can understand what they are chasing. Protocol Codex visibility is mandatory.

5. Co-op grief builds. Shared revive, objective, and routing effects must be server-owned or telemetry-safe when online co-op arrives.

6. Campaign unlock creep. Campaign rewards should unlock build options and recipe families, not permanent raw power that makes early levels irrelevant.

7. Art shortcuts. New expressive weapon/evolution VFX must follow the source-backed art workflow. V1 should reuse accepted build VFX or defer new visuals until PixelLab/ChatGPT Images/Aseprite source exists.

