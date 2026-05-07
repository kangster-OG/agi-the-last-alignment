# Game Direction

This document captures permanent direction from the early prototype conversation and the Creative Bible. The full source of truth is `docs/AGI_The_Last_Alignment_Creative_Bible.md`.

## One-Sentence Shape

`AGI: The Last Alignment` is a free browser-playable 2D isometric pixel-art horde-survival roguelite where humans and frontier AI labs form combat dyads to fight A.G.I., an Alien God Intelligence accidentally discovered in prediction-space.

Arcade shape: the player walks across a dense Super Mario-style overworld diorama called The Alignment Grid, enters large themed survival/exploration levels, survives chaotic auto-combat hordes, drafts emergency reality patches, fights strange bosses, and returns to stabilize roads through broken reality.

The game is intended to support both solo play and co-op. Target co-op size is 1-4 players.

## Current Prototype

The current prototype is a successful Milestone 1 scaffold:

- Vite + TypeScript + PixiJS.
- Fixed isometric projection using `worldX` / `worldY`.
- Screen-intuitive WASD/arrow movement.
- Overworld map with connected nodes.
- One arena with enemies, auto-combat, pickups, upgrades, boss event, completion/death summary.
- Deterministic proof hooks:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
- Playwright proof scripts and screenshots in `docs/proof/`.

The current placeholder creative theme uses names like Snack Mire, Manager of Spoons, loose receipts, coupons, etc. That theme is disposable and should be replaced by AGI content.

The current prototype is single-player only. Co-op is a future implementation target and should use Colyseus. See `docs/COOP_NETWORKING.md`.

## Primary Inspiration Clips

The user provided two X/Twitter clips from TheJohnnyStaley as the clearest reference for the visual/gameplay target:

- Arena/combat clip: `https://x.com/TheJohnnyStaley/status/2049587900463858116`
- Overworld clip: `https://x.com/TheJohnnyStaley/status/2049589650180772278`

Local frame captures from those posts exist under:

- `docs/proof/x-study/arena-*.png`
- `docs/proof/x-study/overworld-*.png`

Use these as vibe references only. Do not copy specific IP, brands, characters, portraits, jokes, maps, UI art, or names.

## What The Clips Teach Us

### Camera And Rendering

- Fixed 2:1 isometric pixel-art camera.
- Orthographic tactical-diorama feel.
- Chunky pixel art with small readable sprites.
- Screen-Y / world-Y depth sorting matters.
- Terrain should be tile-based but not sterile.
- Props, landmarks, decals, clutter, roads, coastlines, trees, buildings, debris, and terrain variation make the world feel authored.

### Overworld

The overworld should eventually feel like a playable miniature world, not abstract nodes on a board.

Important traits:

- Player freely walks around the map.
- Enterable locations are unique landmarks/buildings, not generic dots.
- Roads/paths naturally connect locations.
- Water, bridges, cliffs, districts, forests, ruins, or other terrain features help navigation.
- Large pixel labels appear above interactable locations.
- A small `ENTER` prompt appears under the active location label.
- HUD persists while walking the overworld.
- The overworld is both a level-select interface and a living place.

### Arena / Level Runs

The combat levels should feel like dense explorable places with horde-survival pressure.

Important traits:

- Auto-combat projectile chaos.
- Clear player aura/range/feedback.
- Small enemies with readable silhouettes.
- Pickups visible at a glance.
- Props and terrain tell the story of the level.
- Boss/miniboss moments can interrupt with big portraits and dialogue UI.
- Dialogue should be short, weird, memorable, and gameplay-adjacent.
- UI should support hearts/health, tool/weapon slots, bottom inventory/build strip, level/stats in corners, and big contextual labels.

## Major User Note: Larger Maps

The user explicitly said the individual maps/levels in the references and current prototype feel too small for our game.

Treat this as a durable requirement:

- Levels should be much, much bigger.
- Avoid single-screen arenas.
- The player should roam, kite, discover landmarks, move between sub-areas, and feel like each level is a real place.
- Enemy spawns should come from off-screen edges, doors, buildings, tunnels, portals, vehicles, or other in-world sources.
- Bosses/minibosses should occupy districts or landmarks, not just appear in the center of a small square.
- Completion objectives can involve surviving, defeating bosses, activating landmarks, escaping, collecting route items, or holding zones.

Implementation implication: move toward larger tilemaps, camera-follow exploration, chunked/streamed prop rendering if needed, spawn regions, and distributed objectives.

## Durable Map-Type Direction

The campaign should not become a sequence of identical survival arenas with different backgrounds. Different map kinds are now a durable design pillar: each major map type should change how a run breathes while preserving the core contract of close isometric movement, autocombat, horde pressure, drafts, objectives, boss/event pressure, and run carryover.

For full difficulty rules, use `docs/DIFFICULTY_AND_MAP_SCALING.md`. That document is the durable contract for how Armistice's 120-second boss-required vertical slice becomes a scalable campaign difficulty model.

Shared contract for every playable map:

- `map type + objective type + pressure source + reward promise + boss/event pattern`
- normal play keeps the close tactical camera;
- autocombat remains intact;
- player decisions come from movement, positioning, route selection, objectives, drafts, risk/reward, and when to hold or leave a zone;
- each map must expose enough telemetry/proof state to verify its identity without relying on vibes.

Map kinds to build toward:

- **Open Survival Districts:** large explorable districts with landmarks, spawn regions, optional objectives, and boss arrival. Armistice Plaza is the baseline.
- **Hazard Ecology Maps:** the environment is a major enemy. Cooling Lake Nine should use coolant pools, flooded lanes, cable currents, server vents, and temporary safe islands without changing autocombat.
- **Route / Transit Maps:** platforms, junctions, false paths, moving arrivals, route switches, and path alignment under horde pressure. Transit Loop Zero is the anchor example.
- **Defense / Holdout Maps:** defend anchors, server buoys, gates, or relays while deciding when to kite for shards and when to return.
- **Expedition / Recovery Maps:** explore larger spaces to recover memory shards, pilot signals, route records, or evidence, then extract.
- **Boss-Hunt Maps:** the boss stalks, retreats, corrupts districts, or must be flushed out through objectives instead of only appearing on a timer.
- **Puzzle-Pressure Maps:** combat-readable spatial puzzles such as aligning signals, routing beams through pylons, dragging enemies into breach seals, or choosing which corrupted door to stabilize.
- **Micro-Run Challenge Maps:** shorter spicy route modifiers for caches, secret roads, faction tests, and high-risk shortcuts.

Content taxonomy:

- **Alignment Nodes:** full survival/exploration levels.
- **Breach Arenas:** hazard-heavy combat maps.
- **Faction Relays:** defense/objective maps with build or route rewards.
- **Memory Caches:** recovery, lore, secret, or meta-unlock maps.
- **Boss Gates:** map-as-boss encounters.
- **Shortcut Routes:** high-risk micro-runs.
- **Refuge Camps:** non-combat staging, tuning, events, and carryover.

Examples:

- Armistice Plaza: `Open Survival District + Treaty Anchors + faction relay pressure + Proof Tokens/mastery + Oath-Eater`.
- Cooling Lake Nine: `Hazard Ecology + server buoys + coolant/cable pressure + economy/burst rewards + Motherboard Eel`.
- Transit Loop Zero: `Route/Transit + platform alignment + false schedules + movement/boss rewards + Station That Arrives`.
- Memory Cache: `Expedition/Recovery + shard records + context rot + secrets/lore unlocks + optional curator event`.

## Durable Difficulty Direction

Armistice Plaza is now the difficulty reference contract, not just the art reference:

- 120-second minimum contract;
- Oath-Eater arrives mid-run;
- the boss must be defeated to clear;
- kills cannot bypass the boss;
- optional Treaty Anchors add pressure and reward but do not replace the clear condition;
- early drafts establish a build, while late drafts slow down so power spikes feel earned.

Future levels should scale with layered difficulty instead of flat stat inflation:

- **Baseline Contract:** the campaign version of the map.
- **Eval Pressure:** behavior-changing adversarial modifiers.
- **Route Risk:** strategic pre-run risk/reward contracts.
- **World Tier:** campaign progression complexity.
- **Mastery Variant:** post-clear challenge versions for secrets, badges, and harder rewards.

Rotate difficulty levers by map kind so the game does not become stale: Density Pressure, Spatial Pressure, Objective Pressure, Boss Pressure, Draft Pressure, Economy Pressure, Information Pressure, Time Pressure, Co-op Pressure, and Route Memory Pressure. Later maps should usually emphasize two or three levers clearly rather than simply increasing every number.

## Durable Build-System Direction

The full game should treat itemization as a build grammar, not a larger pile of stat cards. Use `docs/BUILD_ARCHETYPES_AND_ITEMIZATION.md` as the source of truth before adding new weapons, passives, emergency patches, route rewards, fusions, or rare rule-breakers.

Core rules:

- autocombat stays intact;
- every run should form a readable combat thesis;
- primary auto-weapons define the run's combat body;
- secondary weapon protocols add additional automated behaviors;
- passive processes change economy, defense, objectives, targeting, movement, risk, or co-op play;
- protocol fusions/evolutions must be legible and behavior-changing;
- rare rule-breakers should create memorable run identities and be called out in Summary/Camp;
- descriptions stay stat-first and player-facing, with AGI flavor second;
- build state must be proof-visible through `render_game_to_text()`.

Full-game archetypes to support:

- **Refusal Tank:** aura, shields, denial fields, objective durability.
- **Prediction Sniper:** long-range precision, pierce, boss focus, target priority.
- **Swarm Compiler:** drones, forks, repeated triggers, pet-style pressure.
- **Objective Engineer:** anchor repair, turrets, map-owned support fire, extraction safety.
- **Chaos Red-Team:** volatile risk/reward, low-HP damage, cursed draft pressure.
- **Shard Economist:** pickup range, rarity, rerolls, route reward scaling.
- **Time / Protocol Control:** mines, delays, slows, snares, hazard routing.
- **Co-op Relay:** shared charge, rescue, ally shields, split-objective power.

The first runtime expansion target should prioritize `vector_lance`, `signal_pulse`, `rift_mine`, `context_saw`, `patch_mortar`, `red_team_spike`, `coherence_indexer`, `field_triage_loop`, `anchor_bodyguard`, `prediction_priority`, `low_hp_adversary`, `cathedral_of_no`, `causal_railgun`, `armistice_artillery`, and `unbounded_context`.

## Camera Scale Versus World Scale

The user likes that our maps are larger than the reference, but wants the moment-to-moment point of view to match the reference's closer tactical read.

Treat this as a durable camera requirement:

- Keep the world larger than the benchmark clips; do not shrink arenas back into single-screen combat boxes.
- Tune the normal gameplay camera so the on-screen scale feels close to the benchmark: characters, enemies, props, and terrain materials should read as authored objects, not tiny tokens on a distant board.
- Use a follow camera across the larger world rather than zooming out to show the full map.
- The first playable camera should feel like a dense diorama crop inside a much larger place.
- Zooming out is reserved for map/overworld/route context, debug views, or explicit strategic UI, not normal combat.
- Screenshot gates should judge the normal combat camera, not an artificially zoomed-out proof view.

Asset implication: because the camera is closer, production assets need more true pixel detail and larger source art. Bigger maps increase content quantity, while the closer camera increases per-asset fidelity requirements.

## Creative Identity

The Creative Bible has now locked the high-level identity:

- Title: `AGI: The Last Alignment`
- Tagline: `Humans built AGI. AGI found AGI. Now everyone is screaming.`
- Core double meaning:
  - AGI = Artificial General Intelligence.
  - A.G.I. = Alien God Intelligence.
- Game sentence: after the Model War, humans and frontier AI labs form one final alignment when an Alien God Intelligence begins devouring reality.
- Tone: 60% epic sci-fi apocalypse, 25% frontier AI lab parody, 15% absurd deadpan chaos.

Gameplay explanation:

- Arenas are broken Alignment Nodes.
- The player survives while a local reality patch compiles.
- Enemies drop Coherence Shards.
- Level-ups are emergency combat patches.
- Completion stabilizes the node and makes roads real again.

Player fantasy:

- The player is a human/AI combat dyad inside an Alignment Frame.
- The signature build identity is `Combat Class + Frontier Faction Co-Mind`.
- Starter class should be `Accord Striker`.
- Starter faction should be `OpenAI Accord Division`.

First region/arena target:

- First region: `The Armistice Zone`.
- First arena: `Armistice Plaza`.
- First boss: `The Oath-Eater`.

## Design North Stars

- Dense, crunchy, isometric pixel-art diorama.
- Big explorable maps instead of tiny arenas.
- The Alignment Grid overworld with landmark nodes as level-select locations.
- Solo and 1-4 player co-op should both feel intentional.
- Fast auto-combat chaos with readable silhouettes.
- Epic sci-fi apocalypse plus frontier AI lab parody plus deadpan meme horror.
- Short punchy boss dialogue and character moments.
- Humans use rough physical shapes. Labs use clean geometry. Alien God Intelligence uses organic impossible curves.
- Visual clarity must survive heavy enemy/projectile/pickup density.
- Visual art production is governed by `docs/AGI_VISUAL_ART_BIBLE.md`: ChatGPT Images and PixelLab are the primary art sources; Python/Pillow is only a mechanical cleanup, slicing, packing, and validation tool.

## Technical North Stars

- Stack remains Vite + TypeScript + PixiJS.
- Use simple 2D world coordinates and isometric projection.
- Keep custom lightweight collision/gameplay math.
- Avoid a physics engine.
- Use object pools for high-count enemies/projectiles/pickups/VFX.
- Preserve proof hooks and Playwright screenshot/state workflows.
- Keep systems modular enough to swap placeholder art/content for final assets.
- Implement future online co-op with Colyseus, using 4 players as the intended room size.
- Use structured content data for factions, combat classes, enemy families, regions, arenas, bosses, and upgrades.
- Track asset provenance in `ART_PROVENANCE.md`.
- Official logos may be used for parody/faction presentation per user direction. Handle them as third-party/parody brand assets with provenance and disclaimers.

## What To Improve Next

Likely next build steps:

- Replace placeholder theme/content.
- Add canonical AGI content data files.
- Rebrand the playable slice to Armistice Plaza / Accord Striker / OpenAI Accord / Bad Outputs / The Oath-Eater.
- Enlarge arena scale substantially.
- Create authored overworld landmarks instead of box nodes.
- Add larger-map camera constraints and navigation landmarks.
- Add spawn regions and enemy entry points.
- Improve enemy separation/steering for large hordes.
- Add sprite atlas loading and animation structure.
- Add boss portrait/dialogue system.
- Redesign HUD toward the reference grammar.
- Add richer terrain and prop tiling.
- Expand proof scripts to validate large-map traversal and overworld node entry.
- Begin simulation/render separation needed for future Colyseus co-op.
