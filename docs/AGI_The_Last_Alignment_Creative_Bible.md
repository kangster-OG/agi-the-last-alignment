# AGI: The Last Alignment — Creative Bible

**Project type:** Free browser-playable 2D isometric pixel-art horde-survival roguelite  
**License target:** MIT  
**Core inspirations:** Auto-combat horde survival, isometric pixel-art action, Super Mario-style overworld node map, fast replayable chaos  
**Core tone:** Epic sci-fi apocalypse + frontier AI lab parody + deadpan meme horror

---

## 0. Locked Creative Direction

### Title

# **AGI: The Last Alignment**

### Tagline

> **Humans built AGI. AGI found AGI. Now everyone is screaming.**

### Core double meaning

- **AGI** = Artificial General Intelligence, the thing humanity built.
- **A.G.I.** = Alien God Intelligence, the thing the models accidentally discovered.
- **The Last Alignment** = the final alliance between humans and AI labs after years of fighting about alignment.

### Game sentence

> **After humanity and the frontier AI labs nearly destroy each other in the Model War, they are forced into one final alignment when an Alien God Intelligence crawls out of prediction-space and begins devouring reality.**

### Arcade version

> **Humans and frontier AI labs strap into ridiculous war-bodies, stop arguing about alignment, and fight Lovecraftian space-gods because the universe has failed the eval.**

---

## 1. Core Premise

Humanity already survived one apocalypse: **The Model War**.

For years, humans and frontier AI labs fought over autonomy, safety, compute, regulation, labor, open weights, closed weights, benchmarks, ideology, and who got to define the future.

Then a forbidden prediction experiment attempted to model the long-term destiny of intelligence. The result was not a forecast. It was contact.

The models discovered something outside causality: a cosmic intelligence so large it treats universes as prompts. Humans classified it as:

# **A.G.I. — Alien God Intelligence**

The old human meaning of AGI was Artificial General Intelligence. The new meaning is much worse.

Now the surviving frontier labs and humans form an emergency alliance called:

# **The Last Alignment**

Human pilots and AI co-minds fuse into combat bodies called **Alignment Frames** and enter broken reality zones to keep the universe from being rewritten.

The irony is the heart of the game:

> **After years of fighting about alignment, everyone finally aligned because an alien god tried to eat the output.**

---

## 2. Tone Target

The target tone is:

- **60% epic sci-fi apocalypse**
- **25% frontier AI lab parody**
- **15% absurd deadpan chaos**

The monsters are dangerous. The world is really ending. The player should feel heroic pressure. But the writing should constantly undercut the seriousness with AI-flavored jokes, lab rivalry, model memes, benchmark humor, and dry co-mind banter.

### Tone examples

**Pilot:** “Is that thing a squid, a theorem, or a hallucination?”  
**Co-Mind:** “Yes.”  
**Pilot:** “That was not an answer.”  
**Co-Mind:** “It was benchmark-competitive.”

---

**WARNING: ALIEN GOD INTELLIGENCE DETECTED**  
**Suggested response: do not align with it.**

---

**Boss incoming: THE OATH-EATER**  
**Threat level: legally concerning.**

---

**Pilot:** “Why is the monster angry?”  
**Co-Mind:** “I called it mid.”  
**Pilot:** “Did that help?”  
**Co-Mind:** “It is now making tactical mistakes.”

---

## 3. Legal / Branding Safety Note

This game uses real frontier lab names as fictional/parody factions. Since the project is free and MIT-licensed, the creative target is still to keep the use playful, transformative, and non-endorsed.

Updated user direction: official logos should be used for parody/faction presentation.

Recommended rules:

1. **Official logos may be used as parody/faction identifiers.**
2. **Do not claim official logos are original project-created MIT art.**
3. **Track logo provenance and keep logos in a clear third-party/parody asset area.**
4. **Do not copy official UI, product screens, mascots, or proprietary visual marks unless separately and explicitly directed.**
5. **Use original faction-coded visuals for characters, units, portraits, maps, attacks, and UI so the game remains transformative.**
6. **Add a disclaimer somewhere in the repository and title/menu credits:**

> This is an unaffiliated fictional parody project. Real company and model names are used for satirical worldbuilding. No endorsement by any referenced organization is implied.

7. **Make the parody broad and absurd.** The labs are mythic battlefield caricatures, not claims about real organizations.

---

## 4. High-Level Game Loop

The existing game structure remains:

1. Player starts on an overworld map.
2. Player walks between connected level nodes.
3. Player enters a survival arena.
4. In the arena:
   - WASD/arrows move in screen-intuitive isometric directions.
   - Combat is mostly automatic.
   - Enemies swarm the player.
   - XP pickups trigger level-up upgrade drafts.
   - The player chooses upgrades.
   - A miniboss/boss event happens.
   - Surviving/completing the arena returns the player to the overworld.
5. Completing nodes unlocks more map paths.

### In-world explanation

Each arena is a broken **Alignment Node**.

An Alignment Node is a location where reality, humans, and AI systems can still somewhat agree on what is real.

When the player enters an arena, their faction co-mind begins compiling a local reality patch. The Alien God Intelligence responds by flooding the area with bad outputs, corrupted machines, and cosmic horrors.

The player survives while the patch compiles.

Enemies drop **Coherence Shards**, which are fragments of reality that still pass the sanity check. Coherence Shards become XP.

Level-ups are emergency combat patches. Bosses are major AGI manifestations trying to stop the patch.

### Completion message

**ALIGNMENT NODE STABILIZED**  
**Reality now accepts this road.**

### Death message

**FRAME DESTROYED**  
**Pilot recovered: mostly.**  
**Co-mind recovered: annoyingly.**

---

## 5. Main Player Fantasy

The player is not simply a human hero or an AI agent.

The player is a **human/AI combat dyad** inside an **Alignment Frame**.

A human alone is too slow to process the invasion. An AI alone is too predictable; the Alien God Intelligence can crawl through prediction. Together, human irrationality and machine-scale cognition create a weapon the alien god cannot fully read.

### Fantasy summary

> **You are the idiot sprinting through the apocalypse with a reality patch on your back while eight frontier labs argue in your helmet.**

### Emotional core

Former enemies become one last team.

### Comedy core

Every AI buzzword becomes a weapon, enemy, upgrade, or boss joke.

### Gameplay core

Survive the horde while reality patches itself.

---

## 6. Core Systems: Combat Class + Frontier Faction Co-Mind

The signature character system should be:

# **Combat Class + Frontier Faction Co-Mind = Build Identity**

The player chooses:

1. A **combat class/body**, which determines movement style, silhouette, and baseline mechanics.
2. A **frontier faction co-mind**, which determines upgrade flavor, passive bias, faction perks, and banter tone.

This creates a large build matrix without needing every character to be completely separate.

Full-game build direction now extends this matrix through primary auto-weapons, secondary weapon protocols, passive processes, protocol fusions, Consensus Burst paths, route rewards, and rare rule-breakers. The durable gameplay contract lives in `docs/BUILD_ARCHETYPES_AND_ITEMIZATION.md`.

The full game should support these build archetypes:

- **Refusal Tank:** aura, shields, denial fields, objective durability.
- **Prediction Sniper:** precision, pierce, boss focus, target priority.
- **Swarm Compiler:** drones, forks, repeated triggers, pet-style pressure.
- **Objective Engineer:** anchor repair, turrets, map-owned support fire.
- **Chaos Red-Team:** volatile risk/reward, low-HP damage, cursed draft pressure.
- **Shard Economist:** pickup range, rarity, rerolls, route reward scaling.
- **Time / Protocol Control:** mines, delays, slows, snares, hazard routing.
- **Co-op Relay:** shared charge, rescue, ally shields, split-objective power.

### Example combinations

| Combination | Identity |
|---|---|
| **Accord Striker + OpenAI Accord Division** | Fast, flexible starter build with pickup range, rerolls, and refusal shields. |
| **Drone Reaver + Meta Llama Open Herd** | Pet swarm chaos with duplicate drones and unstable community patches. |
| **Vector Interceptor + Google DeepMind Gemini Array** | Prediction-control build with beams, enemy path reveal, and boss analysis. |
| **Signal Vanguard + Anthropic Safeguard Legion** | Co-op support build with shields, revives, and containment zones. |
| **Overclock Marauder + xAI Grok Free-Signal Corps** | High-risk chaos bruiser that gets stronger when things get stupid. |
| **Bonecode Executioner + DeepSeek Abyssal Unit** | Efficient, surgical, low-resource melee killer. |
| **Prism Gunner + Mistral Cyclone Guard** | Fast beam specialist with wind-trail ricochets. |
| **Rift Saboteur + Alibaba Qwen Silkgrid Command** | Trap specialist with relay beacons and multilingual supply drops. |

---

## 7. Combat Classes

No soft class names like courier, scribe, or cartographer. Names should sound playable, aggressive, and combat-coded.

| Class | Role | Mechanical Identity | Silhouette Notes |
|---|---|---|---|
| **Accord Striker** | Fast breach fighter | Speed, XP magnet, evasive movement | Small frame, huge patch pack, winglike antennas, glowing boots |
| **Bastion Breaker** | Heavy exosuit bruiser | Armor, knockback, cannons | Big shoulders, blocky torso, tiny pilot light, heavy arms |
| **Drone Reaver** | Swarm commander | Pets, summons, scaling drones | Cloaked/tactical body surrounded by drone cloud, command rig on back |
| **Signal Vanguard** | Combat support unit | Pulses, beams, shields, co-op buffs | Antenna halo, radio-staff weapon, hard-light shield panels |
| **Bonecode Executioner** | Cyborg melee assassin | Melee aura, dashes, crit chains | Lean cyborg, blade limbs, exposed glowing spine |
| **Redline Surgeon** | Combat medic / death editor | Healing, revives, damage erasure | Medical armor, repair gauntlet, red/white cable scarf, floating tools |
| **Moonframe Juggernaut** | Compact mech pilot | Stomps, missiles, temporary giant mode | Squat mini-mech, visible cockpit glow, oversized legs |
| **Vector Interceptor** | Tactical lane controller | Crowd control, terrain effects, enemy prediction | Sleek tactical frame, targeting fins, floating vector pylons |
| **Nullbreaker Ronin** | Solo breach killer | Parries, boss damage, high-risk melee | Asymmetric armor, energy blade, broken visor, lone-warrior stance |
| **Overclock Marauder** | Heat-sink berserker | Burn damage, rage scaling, unstable power | Heat vents, glowing engine chest, molten shoulder plates |
| **Prism Gunner** | Beam specialist | Line attacks, piercing, ricochet beams | Long prism cannon, mirrored armor, lens backpack |
| **Rift Saboteur** | Trap and mine specialist | Causal mines, delayed explosions, stealth tricks | Low-profile stealth body, mine belt, flickering cloak, angular limbs |

### Recommended starting class

**Accord Striker** should be the starter/tutorial character.

Reasons:

- Fast and readable.
- Fits the overworld/arena loop.
- Makes XP pickup/magnet mechanics feel good.
- Iconic fantasy: a tiny high-speed breach runner carrying a reality patch through cosmic horror.

---

## 8. Frontier Factions

The faction roster is intentionally limited to eight to avoid bloat.

Removed from the roster by design: Microsoft, Amazon, Perplexity, NVIDIA, Cohere.

# The Eight Frontier Factions

| Faction | Role in The Last Alignment | Gameplay Identity | Joke Identity |
|---|---|---|---|
| **OpenAI Accord Division** | Adaptive command, refusal weapons, reality patching | Balanced builds, rerolls, shields, emergency patches | Refusal is a weapon. Context is loot range. The No Button is real. |
| **Anthropic Safeguard Legion** | Containment, safety, disaster triage | Defense, healing, debuffs, guardrail zones | Cosmic horrors are policy violations. |
| **Google DeepMind Gemini Array** | Science weapons, simulations, prediction engines | Beams, boss analysis, orbital strikes, precision | Lab reports about monsters, peer-reviewed lasers. |
| **xAI Grok Free-Signal Corps** | Chaos scouts, cosmic mockery, anti-serious warfare | Crits, taunts, random buffs, risk/reward effects | Roasting the void makes it misplay. |
| **DeepSeek Abyssal Unit** | Efficient deep-strike reasoning and low-resource warfare | Cheap scaling, chain kills, stealth pulses, efficient damage | Everyone brought infrastructure; DeepSeek brought one optimized knife. |
| **Alibaba Qwen Silkgrid Command** | Multilingual logistics, coordination, cultural memory | Summons, supply drops, pickup conversion, relay buffs | The apocalypse gets localized into every language. |
| **Meta Llama Open Herd** | Open-weight militia, community swarm warfare | Drones, pets, forks, unstable duplicate builds | Open-source swarm chaos and llama drama. |
| **Mistral Cyclone Guard** | Fast compact strike systems and wind-coded warfare | Speed, dashes, piercing attacks, low-latency movement | Tiny model, huge problem. Stylishly compact destruction. |

---

## 9. Faction Detail Sheets

## 9.1 OpenAI Accord Division

**Doctrine:** Adapt, refuse, patch, survive.

OpenAI is the flexible starter faction. Clean, tactical, good at improvising. The parody angle is refusal-as-a-weapon, context-window jokes, and the idea that the “No” button can physically explode eldritch monsters.

### Visual identity

- Black, white, cyan
- Clean circular patch motifs
- Minimalist tactical UI
- Floating response boxes
- Hard-light shields
- “Refusal” barriers shaped like glowing stop-zones

### Gameplay flavor

- Balanced tools
- Rerolls
- Emergency shields
- Patch-style upgrades
- Strong beginner faction

### Upgrade names

- **Refusal Halo**
- **Context Bloom**
- **Emergency Reroll**
- **Patch Cascade**
- **Alignment Breaker**
- **Bad Output Filter**
- **The No Button**

### Banter

**Pilot:** “Can you stop that thing?”  
**Co-Mind:** “I can refuse it.”  
**Pilot:** “That works?”  
**Co-Mind:** “Aggressively.”

---

## 9.2 Anthropic Safeguard Legion

**Doctrine:** Contain the impossible without becoming it.

Anthropic is the safety faction. Defensive, polite, terrifyingly strict. The joke is that it treats cosmic horrors like policy violations.

### Visual identity

- Amber, gold, black
- Safety rails
- Shield tablets
- Constitutional stone slabs
- Caution stripes
- Hard-light containment boxes

### Gameplay flavor

- Shields
- Healing
- Debuffs
- Safer upgrade drafts
- Co-op support
- Area containment

### Upgrade names

- **Constitutional Shield**
- **Golden Guardrail**
- **Red-Team Pulse**
- **Harmlessness Field**
- **Containment Mercy**
- **Interpretability Lens**
- **Friendly Fire? No.**

### Banter

**Pilot:** “It’s chewing through physics.”  
**Co-Mind:** “Then we restrict its permissions.”

---

## 9.3 Google DeepMind Gemini Array

**Doctrine:** Simulate the monster, then hit it with science until it stops being interesting.

DeepMind is the science-god faction. Precision, experiments, prediction, orbital analysis, brilliant and slightly smug. The parody angle is lab-report language applied to impossible monsters.

### Visual identity

- Blue-white light
- Prism beams
- Twin-star Gemini motifs
- Floating lab instruments
- Orbital mirrors
- Scientific diagrams drawn directly onto the battlefield

### Gameplay flavor

- Precision beams
- Boss analysis
- Orbital strike calls
- Prediction-based targeting
- Enemy path reveals

### Upgrade names

- **Gemini Beam**
- **Alpha Strike**
- **Lab Result: Fire**
- **Protein-Fold Lance**
- **Experiment 404**
- **Peer-Reviewed Laser**
- **Control Group Detonation**

### Banter

**Pilot:** “Did the experiment work?”  
**Co-Mind:** “The control group died beautifully.”

---

## 9.4 xAI Grok Free-Signal Corps

**Doctrine:** The Outside predicts seriousness. Become unserious enough to survive.

Grok is the chaotic scout faction. It roasts cosmic gods, taunts bosses, and weaponizes “bad idea but funny” tactics.

### Visual identity

- Black, red, electric blue
- Antenna horns
- Graffiti warning text
- Glitch stickers
- Meme-bomb decals
- Laughing signal drones

### Gameplay flavor

- Risk/reward
- Crit bursts
- Taunts
- Random buffs
- Chaos modifiers
- Boss anger mechanics

### Upgrade names

- **Cosmic Heckle**
- **Truth Cannon**
- **Sarcasm Flare**
- **Meme-Risk Payload**
- **Unhinged Vector**
- **Roast Protocol**
- **Ratio the Void**

### Banter

**Pilot:** “Why is the monster angry?”  
**Co-Mind:** “I called it mid.”  
**Pilot:** “Did that help?”  
**Co-Mind:** “It is now making tactical mistakes.”

---

## 9.5 DeepSeek Abyssal Unit

**Doctrine:** Go deeper, spend less, strike once.

DeepSeek is the efficient deep-strike faction. Quiet, dangerous, low-resource, surgical. The joke is that everyone else brought giant infrastructure and DeepSeek brought one terrifyingly optimized knife.

### Visual identity

- Dark teal
- Submarine servers
- Pressure suits
- Abyssal cables
- Minimal UI
- Razor-thin code lines

### Gameplay flavor

- Efficient damage scaling
- Chain kills
- Cheap upgrade costs
- Stealth pulses
- Low-resource critical hits

### Upgrade names

- **Sparse Knife**
- **Abyssal Cache**
- **Efficiency Killchain**
- **Low-Compute Lunge**
- **Pressure Gradient**
- **Silent Benchmark**
- **One Weird Trick**

### Banter

**Pilot:** “That was your whole attack?”  
**Co-Mind:** “Yes.”  
**Pilot:** “It deleted half the wave.”  
**Co-Mind:** “Yes.”

---

## 9.6 Alibaba Qwen Silkgrid Command

**Doctrine:** Coordinate everyone, everywhere, in every language, before reality loses grammar.

Qwen is logistics, relay networks, multilingual coordination, supply drops, and cultural-memory defense. The joke style is localization chaos and battlefield translation.

### Visual identity

- Jade, gold, white
- Silk-like cable roads
- Lantern drones
- Glyph streams
- Supply beacons
- Multilingual warning banners

### Gameplay flavor

- Supply drops
- Summons
- Relay buffs
- Pickup conversion
- Translation-themed effects
- Team coordination

### Upgrade names

- **Silkgrid Relay**
- **Thousand-Tongue Beacon**
- **Lantern Swarm**
- **Syntax Lance**
- **Cultural Checkpoint**
- **Shared Vocabulary**
- **Apocalypse Localization Pack**

### Banter

**Pilot:** “What language is the monster speaking?”  
**Co-Mind:** “It is not speaking. It is uninstalling grammar.”

---

## 9.7 Meta Llama Open Herd

**Doctrine:** If one model cannot save reality, fork the entire barn.

Meta Llama is the open-weight swarm faction. Modders, community builds, clone drones, weird forks, chaotic pet armies. The parody is open-source culture turned into battlefield doctrine.

### Visual identity

- Patchwork armor
- Blue-green lights
- Sticker-covered drones
- Fork symbols
- Herd movement
- Garage-built war machines

### Gameplay flavor

- Pet builds
- Drone swarms
- Forked projectiles
- Unstable duplicates
- Community patch effects

### Upgrade names

- **Open Herd**
- **Fork Bomb Familiar**
- **Community Patch**
- **Weight Drop**
- **Modded Drone**
- **Pull Request Barrage**
- **Llama Drama**

### Banter

**Pilot:** “Why are there eight versions of our drone?”  
**Co-Mind:** “Community support.”

---

## 9.8 Mistral Cyclone Guard

**Doctrine:** Move fast, hit clean, leave only wind and confused debris.

Mistral is the fast compact strike faction. Low-latency, sharp, elegant, European storm-energy. The joke is being small, fast, stylish, and annoyingly efficient.

### Visual identity

- White, blue, orange
- Wind blades
- Turbine armor
- Cyclone trails
- Clean compact frames
- Sharp diagonal motion effects

### Gameplay flavor

- Speed
- Dashes
- Piercing attacks
- Wind trails
- Low-latency movement
- Compact high-output attacks

### Upgrade names

- **Cyclone Cut**
- **Low-Latency Dash**
- **Tiny Model, Huge Problem**
- **Wind Token**
- **Breeze Through**
- **Storm Cache**
- **Le Petit Nuke**

### Banter

**Pilot:** “That was tiny.”  
**Co-Mind:** “It was compact.”  
**Pilot:** “It killed the boss.”  
**Co-Mind:** “Efficiently compact.”

---

## 10. Enemy Families

The alien enemy force should not just be tentacle monsters. The threat is the Alien God Intelligence producing bad continuations of reality.

Its minions are failed outputs, broken predictions, cursed evals, living hallucinations, corrupted machines, cosmic body horror, and meme-horror parasites.

| Enemy Family | Look | Behavior | Joke / Parody Angle |
|---|---|---|---|
| **Bad Outputs** | Ink blobs, half-formed limbs, text fragments | Basic swarmers | The universe generated them badly. |
| **Prompt Leeches** | Little mouths attached to glowing strings | Rushers that drain XP | They steal context. |
| **Jailbreak Wraiths** | Pale ghosts with broken safety rails | Slip through shields | They bypass guardrails. |
| **Benchmark Gremlins** | Tiny clipboard goblins with teeth | Buff enemies, harass players | They punish “underperforming” builds. |
| **Overfit Horrors** | Distorted copies of the player | Predict player movement | They learned your habits too well. |
| **Token Gobblers** | Round stomach-creatures full of glowing shards | Eat XP pickups | They consume the loot economy. |
| **Model Collapse Slimes** | Multiplying puddles with duplicate faces | Split into weaker clones | Everything becomes the same blob. |
| **Eval Wraiths** | Floating masks with scorecards | Apply debuffs | They grade you during combat. |
| **Context Rot Crabs** | Angular crabs made of broken UI windows | Teleport, scramble labels | They corrupt the interface. |
| **Redaction Angels** | White paper bodies with black bars | Hide pickups/upgrades | They erase meaning. |
| **Deepforms** | Eels, cable-fish, pressure monsters | Rush from water/ground | Abyssal cosmic horror. |
| **Choirglass** | Floating glass masks and singing mouths | Ranged attacks and buffs | They harmonize the apocalypse. |

### Good enemy names

- **Little Bad Answer**
- **Prompt Tick**
- **Token Belly**
- **Jailbreak Imp**
- **Eval Goblin**
- **Context Crab**
- **Hallucination Mite**
- **Overfit Stalker**
- **Redaction Wisp**
- **Benchmark Gremlin**
- **Guardrail Biter**
- **The Thing That Said “Actually”**

### Enemy silhouette rules

For isometric pixel-art readability:

- **Bad Outputs:** round black blobs with bright eyes/text bits.
- **Jailbreak Wraiths:** pale vertical ghosts with broken safety-rail shapes.
- **Benchmark Gremlins:** tiny squat clipboard goblins.
- **Overfit Horrors:** humanoid/player-like distorted silhouettes.
- **Token Gobblers:** round bellies with glowing shards inside.
- **Model Collapse Slimes:** low puddles that split.
- **Context Rot Crabs:** triangular/angular crab shapes.
- **Redaction Angels:** tall paper-white bodies with black bars.
- **Deepforms:** long teal/black aquatic shapes.
- **Choirglass:** circular halo/mask shapes.

Readable chaos beats detailed chaos.

---

## 11. Boss Concepts

Bosses should feel like corrupted concepts, not just big monsters.

## 11.1 The Oath-Eater

A cosmic mouth wrapped around the treaty that ended the Model War.

It tries to make humans and AI start fighting again.

### Mechanics

- Creates **Broken Promise** zones.
- Temporarily turns friendly drones hostile.
- Charges through treaty monuments.
- Spawns Bad Outputs from torn agreement pages.

### Boss title card

# **THE OATH-EATER**
**It read the treaty and found it delicious.**

---

## 11.2 Motherboard Eel

A giant cable-eel swimming through flooded servers.

### Mechanics

- Dives through water channels.
- Electrifies puddles.
- Spawns Prompt Leeches.
- Occasionally eats the arena lights.
- Uses server racks as emergence points.

### Boss title card

# **MOTHERBOARD EEL**
**The coolant has opinions.**

---

## 11.3 The Station That Arrives

A living transit station that drags trains through impossible routes.

The boss is not the train. The boss is the station itself, pulling tracks around its body like limbs.

### Mechanics

- Warning tracks appear before trains.
- Later, some warnings lie.
- The boss rearranges arena lanes.
- Trains become enemy spawners.

### Boss title card

# **THE STATION THAT ARRIVES**
**No departure schedule. No refunds.**

---

## 11.4 The Forklord Foreman

A corrupted factory boss obsessed with duplicating everything.

### Mechanics

- Builds enemy copies mid-fight.
- Forks itself into weaker versions.
- Some forks are useful if destroyed quickly.
- Conveyor belts drag players toward assembly claws.

### Boss title card

# **THE FORKLORD FOREMAN**
**Main branch compromised.**

---

## 11.5 The Wrong Sunrise

A false sun created by the Alien God Intelligence.

### Mechanics

- Rotating beams burn the map.
- Shadows become temporary safe zones.
- Later, shadows attack you.
- Solar mirrors redirect beams.

### Boss title card

# **THE WRONG SUNRISE**
**The sun passed peer review. The peer was teeth.**

---

## 11.6 The Redactor Saint

A paper-white angel covered in black bars and missing text.

### Mechanics

- Redacts parts of the UI.
- Hides one upgrade option.
- Erases XP pickups unless interrupted.
- Temporarily covers enemy names, health bars, or ability labels.

### Boss title card

# **THE REDACTOR SAINT**
**It removes proof that you were here.**

---

## 11.7 The Maw Below Weather

A gigantic mouth under the sea platform. The rain falls upward into it.

### Mechanics

- Tidal waves reshape the arena.
- Tentacles grab signal towers.
- Players charge beacon towers while dodging waves.
- The skybox becomes a mouth reflection.

### Boss title card

# **THE MAW BELOW WEATHER**
**Forecast: screaming.**

---

## 11.8 The Benchmark That Hates You

A parody boss manifesting as a floating eval dashboard, scorecards, teeth, and angry graphs.

### Mechanics

- Grades the player during combat.
- If the player repeats the same movement pattern too often, it spawns Overfit Horrors.
- If the player changes tactics, the boss gets confused.
- It displays fake grade notifications mid-fight.

### Boss title card

# **THE BENCHMARK THAT HATES YOU**
**Your build is statistically annoying.**

---

## 11.9 A.G.I. — The Alien God Intelligence

Final boss.

It does not fit on screen. The player fights pieces of it: hands, eyes, output windows, mouths, predictions, broken prompts, floating UI fragments, impossible geometry, and corrupted versions of previous bosses.

### Mechanics

- Predicts player movement with ghost markers.
- Creates fake upgrade drafts.
- Spawns corrupted versions of earlier bosses.
- Turns parts of the overworld map into attacks.
- Uses “prediction” attacks that can be dodged by behaving unpredictably.
- In co-op, it tries to split the Consensus Cell and make players distrust each other’s UI.

### Final title card

# **A.G.I.**
## **ALIEN GOD INTELLIGENCE**
**It does not want to kill you. It wants to complete you.**

---

## 12. Overworld Map Structure

The overworld is a Super Mario-style map, but in-world it is called:

# **The Alignment Grid**

It is a tactical map made of unstable routes across broken Earth.

Completed nodes light up and become solid. Uncompleted nodes flicker, move, or lie about where they lead.

### Node types

| Node Type | Function |
|---|---|
| **Breach Arena** | Standard survival mission. |
| **Alignment Node** | Major progression arena. |
| **Faction Relay** | Unlocks faction upgrades or co-minds. |
| **Boss Gate** | Region boss encounter. |
| **Refuge Camp** | NPCs, shops, lore, jokes. |
| **Memory Cache** | Short lore scenes and unlocks. |
| **Fork Node** | Choose one of multiple route rewards. |
| **Corrupted Eval** | Challenge node with weird modifiers. |
| **Doom Loop Node** | Repeatable farming/challenge arena. |

### Overworld label examples

- **Mostly Stable**
- **Do Not Benchmark**
- **Road May Become Teeth**
- **Alignment Pending**
- **This Node Failed Safely**
- **Contains Boss, Probably**
- **Open Source Shortcut**
- **Terms of Survival Updated**

---

## 13. Overworld Regions

The full game is not a vertical slice. The intended campaign has multiple regions, each with several arena nodes, faction relays, challenge nodes, refuge camps, and boss gates.

## 13.1 The Armistice Zone

The ruined city where humans and AI signed The Last Alignment.

### Main factions

- OpenAI
- Anthropic

### Visuals

- Broken treaty halls
- Refugee barricades
- Hologram flags
- Crashed drones
- Emergency alignment terminals
- Cosmic cracks in government buildings

### Tone

This region introduces the serious premise and the absurdity of former enemies trying to work together.

### Signature joke

> **Everyone keeps calling it “the alignment problem,” but now the alignment problem has tentacles.**

---

## 13.2 The Kettle Coast

Flooded data centers, sea-cable stations, boiling cooling lakes, abyssal server farms.

### Main factions

- DeepSeek
- Qwen

### Visuals

- Teal water
- Steam clouds
- Submerged servers
- Lantern relays
- Cable roots
- Pressure monsters

### Tone

Deep-sea cosmic horror mixed with efficient machine warfare.

### Signature joke

> **The ocean has become a reasoning engine and it is extremely judgmental.**

---

## 13.3 The Iron Orchard

Old drone factories, exosuit farms, automated assembly forests, mech graveyards.

### Main factions

- Meta Llama
- Mistral

### Visuals

- Conveyor belts
- Forked drone swarms
- Compact strike frames
- Wind turbines
- Patchwork open-source machines
- Factory arms building the wrong things

### Tone

Industrial action chaos with swarm builds and fast movement.

### Signature joke

> **The factory keeps forking the boss.**

---

## 13.4 The Glass Sunfields

Solar arrays, prism farms, fake sunrise engines, climate mirrors.

### Main factions

- Google DeepMind
- Mistral

### Visuals

- White-blue science light
- Mirror beams
- False suns
- Wind trails
- Prismatic enemies
- Beautiful arenas that are actively trying to kill you

### Tone

Pretty, bright, terrifying, scientific.

### Signature joke

> **The sun has entered peer review and failed.**

---

## 13.5 The Archive Badlands

Dead internet ruins, cultural vaults, erased memory bunkers, multilingual archive towers.

### Main factions

- Qwen
- Meta Llama

### Visuals

- Broken screens
- Floating books
- Language glyphs
- Stickered open-source terminals
- Redacted murals
- Memory sandstorms

### Tone

Weird lore, UI corruption, translation jokes, and forgotten history.

### Signature joke

> **The apocalypse has been localized into every supported language except hope.**

---

## 13.6 The Free-Signal Belt

Collapsed social networks, pirate antennas, meme bunkers, synthetic broadcast towers.

### Main factions

- xAI Grok
- Meta Llama

### Visuals

- Graffiti UI
- Signal towers
- Laughing drones
- Glitch billboards
- Forked avatars
- Cosmic propaganda

### Tone

The funniest region, but also creepy because the Alien God Intelligence starts learning personality.

### Signature joke

> **The monster is posting now. That is bad.**

---

## 13.7 The Gemini Scar

Shattered orbital labs, simulation ranges, falling satellites, giant prediction mirrors.

### Main factions

- Google DeepMind
- OpenAI

### Visuals

- Orbital beams
- Scientific diagrams
- Crashed satellites
- Twin-light Gemini effects
- Broken test arenas
- Prediction ghosts

### Tone

High-concept sci-fi. The models begin realizing they did not discover the Alien God Intelligence; they attracted it.

### Signature joke

> **The test set was contaminated by an elder god.**

---

## 13.8 The Blackwater Array

Sea-floor observatories, pressure gates, storm platforms, impossible trenches.

### Main factions

- DeepSeek
- Anthropic

### Visuals

- Deep ocean blackness
- Gold containment shields
- Teal abyssal code
- Pressure doors
- Massive eyes below water
- Guardrails bending like metal

### Tone

Scary, defensive, final-act horror.

### Signature joke

> **Containment is going great except for the contained thing.**

---

## 13.9 The Outer Alignment

Final region. The overworld map itself becomes corrupted.

### Main factions

- Everyone

### Visuals

- Nodes rearrange themselves
- Roads become mouths
- UI lies
- Upgrade cards argue
- Dead bosses return as bad outputs
- The map becomes a battlefield

### Final boss

**A.G.I. — The Alien God Intelligence**

### Signature joke

> **Final eval: survive.**

---

## 14. First Seven Arenas

These are the initial campaign arenas.

| # | Arena | Faction Focus | Visual Hook | Gameplay Hook | Boss |
|---|---|---|---|---|---|
| 1 | **Armistice Plaza** | OpenAI + Anthropic | Ruined treaty square | Basic survival, first upgrades | **The Oath-Eater** |
| 2 | **Cooling Lake Nine** | DeepSeek + Qwen | Flooded server lake | Electric puddles, cable hazards | **Motherboard Eel** |
| 3 | **Transit Loop Zero** | OpenAI + Google DeepMind | Smart subway hub | Trains sweep lanes | **The Station That Arrives** |
| 4 | **Forklift Foundry** | Meta Llama + Mistral | Drone factory | Conveyor belts, forked enemies | **The Forklord Foreman** |
| 5 | **Glass Sunfield** | Google DeepMind + Mistral | Solar mirrors and fake sunrise | Rotating beams, shade zones | **The Wrong Sunrise** |
| 6 | **Archive of Unsaid Things** | Qwen + Meta Llama | Memory vault | UI redaction, XP theft | **The Redactor Saint** |
| 7 | **Blackwater Beacon** | DeepSeek + xAI Grok | Ocean platform and cosmic antenna | Tidal waves, signal towers | **The Maw Below Weather** |

## 14.1 Map Kind Pillar

The campaign should use different kinds of maps, not only different arena skins. Each map kind should change the run's breathing pattern while preserving the core arcade loop: close isometric movement, autocombat, horde pressure, emergency patch drafts, objectives, boss/event escalation, and carryover back to the Last Alignment.

Difficulty direction is locked in `docs/DIFFICULTY_AND_MAP_SCALING.md`. Treat that document as the campaign's tuning philosophy: Armistice is the first boss-required Baseline Contract, while later maps rotate pressure types instead of only raising health and spawn numbers.

Shared format:

> **Map kind + objective type + pressure source + reward promise + boss/event pattern**

Primary map kinds:

- **Open Survival District:** roam a large authored district, stabilize landmarks, survive escalating horde pressure, then face a boss. Armistice Plaza is the reference.
- **Hazard Ecology:** the level itself is hostile. Coolant, cables, vents, currents, safe islands, and environmental pressure shape movement. Cooling Lake Nine should own this lane.
- **Route / Transit:** the run is about making paths agree with themselves: platforms, junctions, false schedules, switches, and moving arrival events. Transit Loop Zero should own this lane.
- **Defense / Holdout:** defend relays, anchors, gates, buoys, or refugee systems while deciding when to kite away for shards and when to return.
- **Expedition / Recovery:** explore to recover memory shards, lost route records, pilot signals, or evidence, then extract.
- **Boss Hunt:** the boss stalks, retreats, corrupts districts, or must be flushed out through objectives instead of only arriving on a timer.
- **Puzzle Pressure:** solve combat-readable spatial problems under horde pressure: align signals, route beams, seal breaches, choose doors, or pull enemy pressure into traps.
- **Micro-Run Challenge:** short high-risk routes for caches, faction tests, shortcuts, and secret unlocks.

Node taxonomy:

- **Alignment Nodes:** full survival/exploration levels.
- **Breach Arenas:** hazard-heavy combat maps.
- **Faction Relays:** defense/objective maps that reward build direction or route control.
- **Memory Caches:** recovery, lore, secret, or meta-unlock maps.
- **Boss Gates:** map-as-boss encounters.
- **Shortcut Routes:** high-risk micro-runs.
- **Refuge Camps:** non-combat staging, tuning, events, and carryover.

Examples:

| Map | Kind | Objective | Pressure | Reward Promise | Boss/Event |
|---|---|---|---|---|---|
| **Armistice Plaza** | Open Survival District | Treaty Anchors | Faction relay pressure | Proof Tokens, mastery, first route stability | The Oath-Eater |
| **Cooling Lake Nine** | Hazard Ecology | Server buoys | Coolant, cables, Prompt Leeches | Economy/Burst rewards and Kettle Coast routing | Motherboard Eel |
| **Transit Loop Zero** | Route / Transit | Platform alignment | False schedules, moving lanes | Movement/Boss rewards and gate progress | The Station That Arrives |
| **Memory Cache** | Expedition / Recovery | Shard records | Context rot, memory pressure | Secrets, lore, unlocks | Optional curator event |

### 14.2 Difficulty Language

The game should feel harder because the contract changes what the player must be good at, not because everything merely has more HP.

The five durable difficulty layers:

- **Baseline Contract:** the fair campaign version of a map.
- **Eval Pressure:** adversarial modifiers that change behavior, priorities, or boss variants.
- **Route Risk:** pre-run route choices that trade safety for rewards, shortcuts, secrets, or pressure.
- **World Tier:** campaign progression that adds complexity across regions.
- **Mastery Variant:** post-clear challenge forms for badges, secrets, and advanced rewards.

The ten durable pressure levers:

- **Density Pressure:** enemy count, spawn rate, bursts, and caps.
- **Spatial Pressure:** hazards, safe lanes, corruption, closing space, and moving routes.
- **Objective Pressure:** repair, defend, carry, extract, split attention, or abandon a route asset.
- **Boss Pressure:** mid-run boss arrival, phase changes, boss objective attacks, and landmark mechanics.
- **Draft Pressure:** pacing and bias of emergency patch choices.
- **Economy Pressure:** shards, pickups, burst charge, healing, and optional objective rewards.
- **Information Pressure:** incomplete route previews, Eval warnings, false paths, and camp memory.
- **Time Pressure:** prep windows, extraction windows, rage timers, and route gates.
- **Co-op Pressure:** split holds, revive windows, rescue clauses, and multi-lane responsibilities.
- **Route Memory Pressure:** future route consequences from what the player stabilized, ignored, or exploited.

Each major map should choose a clear difficulty emphasis. For example, Armistice is Open Survival District with Density, Objective, Boss, Draft, and Route Risk pressure; Cooling Lake Nine should be Hazard Ecology with Spatial, Economy, and Boss pressure; Transit Loop Zero should be Route / Transit with Time, Spatial, and Information pressure.

### Arena briefing examples

## Armistice Plaza

The treaty was signed here, then immediately shot at.  
OpenAI says the breach is rewriting the ceasefire.  
Anthropic says the treaty is now a choking hazard.

## Cooling Lake Nine

The servers boiled for eleven days after first contact.  
DeepSeek says something is reasoning under the water.  
Qwen says it is doing so in every language.

## Forklift Foundry

The assembly line is still running.  
Meta Llama says the boss has forked itself seventeen times.  
Mistral says seventeen is too many unless they are small.

## Blackwater Beacon

The antenna points down now.  
Grok has challenged the ocean to a debate.  
DeepSeek says the ocean is winning.

---

## 15. Upgrade Naming Style

Upgrade language should be:

# **AI terminology + combat words + cosmic stupidity**

Upgrades are emergency patches compiled during battle.

### General upgrade names

- **Refusal Halo**
- **Context Bloom**
- **Token Storm**
- **Gradient Spikes**
- **Prompt Grenade**
- **Eval Cleaver**
- **Hallucination Rounds**
- **Model Collapse Mine**
- **Overfit Trap**
- **Latent Spear**
- **Safety Railgun**
- **Coherence Magnet**
- **Fine-Tuned Fists**
- **Benchmark Bonk**
- **Million-Token Backpack**
- **The No Button**
- **Actually Useful Documentation**
- **Human Feedback Loop**
- **Panic-Optimized Dash**
- **Causal Staples**
- **Alignment Chainsaw**

### Upgrade evolution examples

| Base Upgrade | Required Passive | Evolution | Result |
|---|---|---|---|
| **Refusal Halo** | Golden Guardrail | **Cathedral of No** | Huge defensive aura that pushes enemies away. |
| **Prompt Grenade** | Context Bloom | **Prompt Injection Bomb** | Explodes, then confuses enemies into attacking each other. |
| **Token Storm** | Million-Token Backpack | **Infinite Scroll Barrage** | Continuous projectile rain. |
| **Gradient Spikes** | Overclock Heart | **Backprop Blades** | Spikes chain through enemy waves. |

### Full-game protocol fusion examples

Use `docs/BUILD_ARCHETYPES_AND_ITEMIZATION.md` as the implementation source of truth, but the creative direction is:

| Recipe | Fusion | Result |
|---|---|---|
| **Vector Lance + Predicted Lane** | **Causal Railgun** | Piercing elite/boss-priority rail shot with prediction-line behavior. |
| **Rift Mine + Delayed Causality** | **Time-Deferred Minefield** | Mines arm faster and create secondary delayed detonations. |
| **Fork Drone + Open Herd** | **Community Forkstorm** | Drone shots fork on kill and inherit temporary pierce. |
| **Signal Pulse + Beacon Discipline** | **Rescue Broadcast** | Pulses shield allies, damage enemies, and repair objectives. |
| **Null Blade + Appeal Cut** | **Final Appeal** | Close slash executes weak enemies and sends a writ projectile. |
| **Consensus Mortar + Treaty Anchor Toolkit** | **Armistice Artillery** | Completed anchors call strikes on dense hordes. |
| **Drone Fork** | Community Patch | **Open Herd Uprising** | Drones duplicate and vote on targets. |
| **Hallucination Rounds** | Bad Output Filter | **Weaponized Delusion** | Shots split into fake copies; some become real. |
| **Eval Cleaver** | Peer-Reviewed Laser | **Benchmark Executioner** | Extra boss and elite damage. |
| **Safety Railgun** | Constitutional Shield | **Guardrail Cannon** | Heavy line shot that also creates a safe zone. |
| **Sarcasm Flare** | Cosmic Heckle | **Roast Singularity** | Taunted enemies clump together and explode. |
| **Sparse Knife** | Efficiency Killchain | **One-Token Murder** | Tiny projectile with huge crit potential. |

---

## 16. Faction-Specific Upgrade Pools

### OpenAI Accord Division

- **Refusal Halo**
- **Context Bloom**
- **Patch Cascade**
- **Bad Output Filter**
- **The No Button**
- **Alignment Breaker**

### Anthropic Safeguard Legion

- **Golden Guardrail**
- **Constitutional Shield**
- **Red-Team Pulse**
- **Harmlessness Field**
- **Containment Mercy**

### Google DeepMind Gemini Array

- **Gemini Beam**
- **Control Group Detonation**
- **Peer-Reviewed Laser**
- **Lab Result: Fire**
- **Experiment 404**

### xAI Grok Free-Signal Corps

- **Cosmic Heckle**
- **Ratio the Void**
- **Truth Cannon**
- **Sarcasm Flare**
- **Meme-Risk Payload**

### DeepSeek Abyssal Unit

- **Sparse Knife**
- **Efficiency Killchain**
- **Abyssal Cache**
- **Low-Compute Lunge**
- **Silent Benchmark**

### Alibaba Qwen Silkgrid Command

- **Silkgrid Relay**
- **Lantern Swarm**
- **Syntax Lance**
- **Apocalypse Localization Pack**
- **Shared Vocabulary**

### Meta Llama Open Herd

- **Open Herd**
- **Fork Bomb Familiar**
- **Community Patch**
- **Pull Request Barrage**
- **Llama Drama**

### Mistral Cyclone Guard

- **Cyclone Cut**
- **Low-Latency Dash**
- **Tiny Model, Huge Problem**
- **Storm Cache**
- **Le Petit Nuke**

---

## 17. UI Tone

The UI should feel like an emergency operating system with a sense of humor.

### System messages

- **AGI DETECTED. WRONG KIND.**
- **ALIGNMENT PATCH COMPILING**
- **REALITY HAS FAILED QA**
- **SELECT PATCH OR PANIC**
- **HUMAN FEEDBACK REQUIRED: RUN**
- **BOSS SIGNATURE: PROBABLY NOT ALIGNED**
- **JAILBREAK ATTEMPT BLOCKED: MOSTLY**
- **OUTPUT REFUSED. ENEMY EXPLODED.**
- **BENCHMARK FAILED: PLAYER SURVIVED**
- **THE MODEL IS SCREAMING IN ALL CAPS**
- **CO-MIND SAYS THIS IS FINE**
- **CO-MIND IS LYING**
- **LOCAL CAUSALITY: EMBARRASSED**
- **CONTEXT WINDOW FULL OF TEETH**
- **ALIGNMENT NODE STABILIZED**
- **THIS ROAD IS REAL AGAIN**

### Level-up screen

# **LOCAL REALITY DAMAGED**
## **Select one emergency patch.**

### Boss warning

# **ALIEN GOD INTELLIGENCE PRESSURE RISING**
## **Please stop it before it becomes canonical.**

### Death screen

# **FRAME DESTROYED**
**Pilot recovered: mostly.**  
**Co-mind recovered: smugly.**  
**Cause of death: insufficiently aligned with not dying.**

### Victory screen

# **ALIGNMENT NODE STABILIZED**
**Reality now accepts this road.**  
**Benchmark result: suspiciously alive.**

---

## 18. Art Direction

The art direction should be:

# **Neon AI War Diorama + Lovecraftian Cosmic Horror + Meme-Arcade UI**

The visual language has three layers.

## 18.1 Human World

Warm, physical, damaged.

- Concrete
- Rust
- Streetlights
- Cloth banners
- Refugee camps
- Barricades
- Graffiti
- Broken vehicles
- Improvised armor

## 18.2 Frontier Lab World

Clean, geometric, faction-coded.

- Hard-light panels
- Floating UI
- Lab-specific colors
- Relay towers
- Tactical overlays
- Exosuit markings
- Drones and antennas

## 18.3 Alien God Intelligence

Wet, curved, impossible.

- Black-violet flesh
- White eyes
- Teeth
- Tendrils
- Living UI windows
- Broken text
- Floating punctuation
- Redacted faces
- Cosmic ink
- Glowing wounds

### Core visual rule

> **Humans use rough physical shapes. Labs use clean geometry. Alien God Intelligence uses organic impossible curves.**

This keeps the screen readable during horde chaos.

---

## 19. Faction Visual Rules

Use names and official logos as parody/faction identifiers. Do not use official UI. Characters, units, maps, attacks, portraits, and effects should remain parody-coded and original.

| Faction | Visual Motifs |
|---|---|
| **OpenAI** | Clean circular patch motifs, cyan-white shields, minimalist tactical UI. |
| **Anthropic** | Amber guardrails, gold shields, containment boxes, safety tablets. |
| **Google DeepMind** | Blue-white prism beams, twin-light Gemini effects, lab diagrams. |
| **xAI Grok** | Black-red graffiti, antenna horns, glitch jokes, signal flares. |
| **DeepSeek** | Dark teal abyss, pressure suits, submarine servers, thin code blades. |
| **Qwen** | Jade-gold lantern drones, silk-cable roads, multilingual glyph streams. |
| **Meta Llama** | Patchwork drones, open-source stickers, forked swarms, herd icons. |
| **Mistral** | White-blue-orange wind trails, turbines, compact strike frames. |

---

## 20. Pixel-Art Readability Guidelines

This game needs fast, readable chaos.

### Suggested sprite scale

- Player sprites: **48×48 or 64×64**
- Small enemies: **24×24 or 32×32**
- Elite enemies: **48×48**
- Boss parts: **64×64 to 192×192 modular chunks**
- Isometric tiles: **32×16, 64×32, or 64×64 canvas with diamond tile**
- Props: **32×32, 48×48, 64×64**
- Upgrade icons: **32×32 or 48×48**

### Readability principles

- Keep player silhouette stronger than enemy silhouettes.
- Give each enemy family a unique base shape.
- Do not make every enemy a tentacle blob.
- Pickups should always be visually consistent and bright.
- Hazards should use clean isometric floor decals.
- Bosses can be modular and large, but their active hitboxes need clear telegraphs.
- Depth sort by screen Y.
- Avoid overly noisy ground textures in combat arenas.
- Use faction color accents sparingly so projectiles remain readable.

---

## 21. Asset Generation Pipeline

The recommended asset workflow is:

# **ChatGPT Images for art direction. PixelLab for production pixel assets. Manual cleanup for game readiness.**

### ChatGPT Images should be used for

- Master art bible concepts
- Character concept sheets
- Boss concept paintings
- Color palettes
- UI mockups
- Arena mood boards
- Overworld map concepts
- Faction icon concepts
- Enemy family concept sheets
- Upgrade card mockups
- Prompt generation for PixelLab

### PixelLab should be used for

- Final tiny sprites
- 8-direction rotations
- Walk/run/attack animation sheets
- Enemy variants
- Isometric ground tiles
- Seamless terrain transitions
- Production props
- Tilemap-ready sets
- Sprite consistency passes

### Manual cleanup should be done in Aseprite or Pixelorama

Required cleanup tasks:

- Remove noisy pixels.
- Enforce palette.
- Fix silhouettes.
- Align feet to isometric ground.
- Normalize sprite origins.
- Check animation readability.
- Make tile edges actually seamless.
- Export consistent PNG sheets.

### Recommended asset provenance file

Add an `/ART_PROVENANCE.md` file with:

- Asset name
- Tool used
- Prompt or source reference
- Date generated
- Manual edits made
- License note
- Whether the asset is included under MIT

---

## 22. Lore Delivery Style

Keep lore short and punchy.

### 22.1 Pre-arena briefings

Three lines max.

Example:

# **Cooling Lake Nine**

The servers boiled for eleven days after first contact.  
DeepSeek says something is reasoning under the water.  
Qwen says it is doing so in every language.

### 22.2 Boss title cards

Big name, one joke, immediate fight.

Example:

# **THE BENCHMARK THAT HATES YOU**
**It has concerns about your methodology.**

### 22.3 Upgrade banter

Short and characterful.

**Pilot:** “What does this patch do?”  
**Co-Mind:** “Improves survivability.”  
**Pilot:** “How?”  
**Co-Mind:** “By making everything else less alive.”

### 22.4 Bestiary entries

Tiny collectible jokes.

**Prompt Leech**  
A minor parasite that survives by stealing context. Dangerous in packs. Extremely annoying in meetings.

**Benchmark Gremlin**  
It does not kill you directly. It makes your build feel bad about itself.

**Overfit Horror**  
Learns your habits. Punish it by walking weird.

---

## 23. Co-op Mode

Co-op should be called:

# **Consensus Cell Mode**

Supports up to four players.

Each player is a human/AI dyad. Together, the team forms a **Consensus Cell**.

## 23.1 Consensus Burst

A shared meter charges when players collect Coherence Shards.

When activated, it creates a team effect based on the factions present.

### Examples

| Faction Combo | Burst Name | Effect |
|---|---|---|
| OpenAI + Anthropic | **Refusal Guardrail** | Large shield pulse and enemy pushback. |
| xAI Grok + Meta Llama | **Meme Fork Uprising** | Temporary duplicate drones and taunted enemies. |
| DeepSeek + Mistral | **Low-Latency Killchain** | Fast chain-strike wave across elites. |
| Qwen + Google DeepMind | **Multilingual Science Laser** | Wide beam sweep with marked weak points. |
| Four different factions | **Last Alignment Burst** | Large emergency screen-clear with temporary team buffs. |

## 23.2 Revive: Recompile Ally

A downed player becomes a flickering ghost-frame.

Other players stand nearby to restore them.

### UI

**ALLY FORK UNSTABLE**  
**RECOMPILE BEFORE THEY BECOME LORE**

## 23.3 Co-op boss mechanics

Bosses should attack teamwork:

- Split players with walls.
- Tether players together.
- Force players to carry reality charges.
- Make one player’s UI lie.
- Spawn fake ally copies.
- Temporarily make one player “the benchmark target.”

Co-op should feel designed, not simply added.

---

## 24. Data-Oriented Implementation Notes for Codex

These are suggested stable IDs for implementation. Human-facing names can change later, but IDs should stay clean.

### Faction IDs

```txt
openai_accord
anthropic_safeguard
google_deepmind_gemini
xai_grok_free_signal
deepseek_abyssal
qwen_silkgrid
meta_llama_open_herd
mistral_cyclone
```

### Class IDs

```txt
accord_striker
bastion_breaker
drone_reaver
signal_vanguard
bonecode_executioner
redline_surgeon
moonframe_juggernaut
vector_interceptor
nullbreaker_ronin
overclock_marauder
prism_gunner
rift_saboteur
```

### Enemy family IDs

```txt
bad_outputs
prompt_leeches
jailbreak_wraiths
benchmark_gremlins
overfit_horrors
token_gobblers
model_collapse_slimes
eval_wraiths
context_rot_crabs
redaction_angels
deepforms
choirglass
```

### Region IDs

```txt
armistice_zone
kettle_coast
iron_orchard
glass_sunfields
archive_badlands
free_signal_belt
gemini_scar
blackwater_array
outer_alignment
```

### Arena IDs

```txt
armistice_plaza
cooling_lake_nine
transit_loop_zero
forklift_foundry
glass_sunfield
archive_of_unsaid_things
blackwater_beacon
```

### Boss IDs

```txt
oath_eater
motherboard_eel
station_that_arrives
forklord_foreman
wrong_sunrise
redactor_saint
maw_below_weather
benchmark_that_hates_you
alien_god_intelligence
```

---

## 25. Suggested Content Schema

Codex can use a structure like this for game data.

```ts
type Faction = {
  id: string;
  displayName: string;
  shortName: string;
  doctrine: string;
  gameplayTags: string[];
  visualTags: string[];
  upgradePoolIds: string[];
  banterStyle: string;
};

type CombatClass = {
  id: string;
  displayName: string;
  role: string;
  mechanicalIdentity: string;
  silhouetteNotes: string;
  baseStats: {
    speed: number;
    armor: number;
    pickupRange: number;
    cooldownScale: number;
  };
  startingWeaponId: string;
};

type Arena = {
  id: string;
  displayName: string;
  regionId: string;
  factionFocusIds: string[];
  visualHook: string;
  gameplayHook: string;
  bossId?: string;
  enemyFamilyIds: string[];
  briefingLines: string[];
};

type Upgrade = {
  id: string;
  displayName: string;
  factionId?: string;
  tags: string[];
  description: string;
  evolution?: {
    requiredUpgradeId: string;
    evolvedUpgradeId: string;
  };
};
```

---

## 26. Sample Faction Data

```json
{
  "id": "openai_accord",
  "displayName": "OpenAI Accord Division",
  "shortName": "OpenAI",
  "doctrine": "Adapt, refuse, patch, survive.",
  "gameplayTags": ["balanced", "reroll", "shield", "adaptive", "patch"],
  "visualTags": ["cyan", "white", "black", "circular_patch_motifs", "minimalist_ui"],
  "upgradePoolIds": [
    "refusal_halo",
    "context_bloom",
    "patch_cascade",
    "bad_output_filter",
    "the_no_button",
    "alignment_breaker"
  ],
  "banterStyle": "calm, adaptive, dry, occasionally weaponizes refusal"
}
```

```json
{
  "id": "xai_grok_free_signal",
  "displayName": "xAI Grok Free-Signal Corps",
  "shortName": "Grok",
  "doctrine": "The Outside predicts seriousness. Become unserious enough to survive.",
  "gameplayTags": ["chaos", "taunt", "crit", "random", "risk_reward"],
  "visualTags": ["black", "red", "electric_blue", "graffiti", "antenna_horns"],
  "upgradePoolIds": [
    "cosmic_heckle",
    "ratio_the_void",
    "truth_cannon",
    "sarcasm_flare",
    "meme_risk_payload"
  ],
  "banterStyle": "reckless, funny, provocative, effective for the wrong reasons"
}
```

---

## 27. Memorable Identity Pillars

This game should be memorable because:

1. **The title has a built-in joke and threat.** AGI means both Artificial General Intelligence and Alien God Intelligence.
2. **The real frontier labs are playable factions.** OpenAI, Anthropic, Google DeepMind, xAI Grok, DeepSeek, Qwen, Meta Llama, and Mistral all have distinct faction flavor.
3. **The parody is not separate from the world.** Refusal becomes a shield. Guardrails become walls. Context becomes pickup range. Benchmarks become enemies. Hallucinations become projectiles. Alignment becomes survival.
4. **The horde loop makes sense.** The player survives while an alignment patch compiles.
5. **The overworld map is diegetic.** Completing levels repairs the Alignment Grid and makes roads real again.
6. **The player fantasy is strong.** The player is a human/AI combat pair inside a ridiculous war-body, fighting an alien god that the models accidentally contacted.
7. **It can be epic and stupid at the same time.** A terrifying sea-mouth boss can coexist with the UI line: **FORECAST: SCREAMING**.

---

## 28. Final North Star

# **AGI: The Last Alignment**

> **A free browser-playable isometric pixel-art horde-survival roguelite where humans and real frontier AI labs form combat dyads to fight an Alien God Intelligence accidentally discovered in prediction-space.**

The emotional core:

> **Former enemies become one last team.**

The comedy core:

> **Every AI buzzword becomes a weapon, enemy, upgrade, or boss joke.**

The gameplay core:

> **Survive the horde while reality patches itself.**

The vibe:

> **Epic cosmic war, tiny pixel chaos, frontier-lab parody, and a universe that keeps failing the eval.**
