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
