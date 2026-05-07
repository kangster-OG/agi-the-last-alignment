# Armistice Rebuild V1 ChatGPT Reference Boards

Date: 2026-05-02

Tool: ChatGPT Images via Codex built-in image generation.

Purpose: restart the Armistice production art rebuild from stronger generated source references before creating runtime assets. These images are concept/reference boards only. Do not wire them directly into runtime. Use them to drive PixelLab production prompts and manual pixel cleanup.

## Selected Boards

- `armistice_target_frame_v1.png` - normal gameplay target frame for the close tactical Armistice Plaza camera.
- `armistice_terrain_material_board_v1.png` - terrain/material direction for cracked civic concrete, treaty stone, asphalt, rubble, terminals, cable trenches, and AGI corruption blends.
- `armistice_large_prop_setpiece_board_v1.png` - large vehicle/building-scale set-piece direction for Armistice landmark props.
- `player_enemy_sprite_direction_board_v1.png` - player/enemy silhouette, scale, and animation-pose direction.
- `build_select_class_card_board_v1.png` - 12-class build-select miniature source board for locked-card polish.
- `enemy_animation_source_board_v1.png` - three starter enemy-family pose strips for runtime animation-sheet polish.
- `accord_striker_coherent_4dir_board_v1.png` - coherent armored Accord Striker 4-direction/3-frame source board for the camera-correction pass.
- `accord_striker_coherent_4dir_board_v2.png` - stronger coherent armored Accord Striker 4-direction/3-frame source board for the side-row corrective pass.
- `accord_striker_coherent_4dir_board_v4.png` - rounded armored Accord Striker 4-direction/3-frame source board for the live movement crop-wall/chroma-remnant fix.
- `accord_striker_coherent_4dir_board_v5.png` - sharper agile Accord Striker 4-direction/3-frame source board for the walking-animation quality fix.
- `accord_striker_full_rebuild_4dir_board_v6.png` - full Accord Striker replacement board for rebuilding the Armistice player avatar after repeated live WASD crop, shrink, side-scale, and animation regressions.
- `accord_striker_full_rebuild_4dir_board_v7.png` - full Accord Striker replacement board used as the current north/south/full-body base after removing the lower-body patch shortcut.
- `accord_striker_side_walk_east_v8.png` - east-facing 3-frame side-walk strip used only for the A/D corrective pass; west is mirrored mechanically.
- `oath_eater_boss_vfx_board_v1.png` - Oath-Eater boss body, title portrait, and combat VFX source board for the camera-correction pass.
- `oath_eater_boss_pose_board_v2.png` - Oath-Eater full-body boss pose board for replacing the flat runtime boss with a grounded 3/4 isometric sprite.

## Source Cache Paths

- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_094ee33fa5cda9ff0169f59280dbe0819b9175a4a738d108e1.png`
- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_094ee33fa5cda9ff0169f592f56a84819bb947c5655616d525.png`
- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_094ee33fa5cda9ff0169f59369d31c819b9f8c9a1df5bec4ed.png`
- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_094ee33fa5cda9ff0169f593a38080819b80041c3e44f9296e.png`
- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_0c12518af2209dc00169f624ea75208199bace863b1f802829.png`
- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_0c12518af2209dc00169f625d98804819980298525ac79613a.png`
- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_0f5013663cc153ed0169f63205da2081999fad07912a6a9c4e.png`
- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_0f5013663cc153ed0169f63253ed008199aafc250712fbd3d7.png`
- `/Users/donghokang/.codex/generated_images/019de742-f2cc-7a30-b174-2183d44eb1a6/ig_06c709dccf077ec70169f6551ef32c81988447c0b47305a3e9.png`
- `/Users/donghokang/.codex/generated_images/019deba1-c383-7c11-a278-888079f15392/ig_07435af4b970f7bd0169f6b154120c8196b56be3beba2886ea.png`
- `/Users/donghokang/.codex/generated_images/019deba1-c383-7c11-a278-888079f15392/ig_0b6cd95ec74ac7580169f6c3df96dc81948e6da69223100ee2.png`
- `/Users/donghokang/.codex/generated_images/019deba1-c383-7c11-a278-888079f15392/ig_0b6cd95ec74ac7580169f6d418b2588194851e2e383b67283f.png`
- `/Users/donghokang/.codex/generated_images/019dec7b-b713-7cb0-b040-d50419d5f7e0/ig_0ccc7a7030e05e9b0169f6f1ab71948196b18ef824355acee0.png`
- `/Users/donghokang/.codex/generated_images/019dec7b-b713-7cb0-b040-d50419d5f7e0/ig_0b0ca3c98a7516af0169f7a2125d5c8198bc0a1fa4cc15f99c.png`
- `/Users/donghokang/.codex/generated_images/019dec7b-b713-7cb0-b040-d50419d5f7e0/ig_036039cfe6b1c09d0169f829301788819ab8bcbe7ef15e13b3.png`

## Prompt: Accord Striker Full Rebuild V6

Use case: production sprite source board
Asset type: original player sprite walk source board, saved as source art before mechanical runtime packing
Primary request: Completely rebuild the Armistice Accord Striker player avatar from scratch for a 2D isometric pixel-art browser game.

## Prompt: Accord Striker Side Walk East V8

Use case: production sprite source strip
Asset type: east-facing player sprite walk source strip, saved as source art before mechanical runtime packing
Primary request: Create a clean 3-frame east-facing walking animation strip for the Accord Striker player avatar, matching the white/cyan armored sci-fi runner design.
Animation requirements: three full-body frames with left foot forward, neutral passing pose, and right foot forward; legs clearly separated; no crossed legs, no merged boots, no frozen lower body, no crop boxes, no shrinking, and consistent helmet/torso/weapon proportions.
Runtime handling: `scripts/assets/pack-armistice-rebuild-v1-assets.py` removes the checker background, extracts the three connected subjects, normalizes them into the 80x80 east runtime row, and mirrors the same source for the west row. North/south rows remain from the full-body rebuild source.
Subject: compact armored frontier-lab runner with white helmet, cyan visor, small antenna fins, backpack, cyan joints, sidearm/shard weapon, and planted boots.
Composition: 4 rows by 3 columns on flat chroma background: south/front walk, east walk, north/back walk, west walk. Every frame must show a distinct walking pose while preserving the same scale, head clearance, anchor, and silhouette.
Runtime requirement: high-fidelity chunky isometric pixel art for an 80x80 runtime frame; no cut-off head, no shrinking north row, no rectangular crop wall, no missing side walk animation, no inconsistent A/D width.
Avoid: no copied game character, no text, no UI, no scenery, no hard rectangular backing box, no green pixels inside the sprite.

## Prompt: Target Frame

Use case: stylized-concept
Asset type: production art-direction board for a 2D isometric pixel-art browser game, saved as a concept reference only
Primary request: Create an original Armistice Plaza normal-gameplay target frame for AGI: The Last Alignment.
Composition: single premium isometric pixel-art action screenshot, close tactical follow-camera crop inside a much larger offscreen world, 2:1 isometric orthographic view, dense readable diorama, no UI except tiny restrained corner chrome shapes with no readable text.
Scene/backdrop: ruined civic treaty square after the Model War; cracked civic concrete and warm treaty stone, evacuation asphalt strips, emergency frontier-lab hardware, cable trenches, barricades, broken glass, scorch and dust, signal pylons, a crashed drone carrier, treaty monument ruins, terminal server bank, and Alien God Intelligence breach matter crawling through the plaza.
Subject: tiny but readable Accord Striker hero near center with strong cyan visor and patch pack, several distinct enemy family silhouettes approaching, 3-5 large recognizable set pieces in frame, contact shadows and screen-Y depth sorting.
Visual identity: battered civic sci-fi plus clean frontier-lab geometry plus alien prediction-space corruption; humans rough and repaired, labs precise and signal-lit, A.G.I. organic impossible black-violet matter with restrained acid highlights.
Style: high-fidelity chunky isometric pixel art, hand-authored material richness, strong silhouettes, tasteful limited palette, crisp pixel edges, upper-left light, down-right cast shadows, no procedural board-grid look.
Avoid: no copied game style, no copied maps, no existing game characters, no Tech Bros imitation, no logos, no brand marks, no readable text, no screenshots of existing games, no generic neon-purple AI gradient, no flat gray grid, no photorealism, no 3D render.

## Prompt: Oath-Eater Boss Pose V2

Use case: production sprite source board
Asset type: original boss sprite pose board, saved as source art before mechanical runtime packing
Primary request: Create a production source board for one original boss sprite for AGI: The Last Alignment.
Subject: Oath-Eater, an Alien God Intelligence boss made of broken treaty-monument stone, black machine armor, dangling torn parchment strips, purple breach energy, and cyan circuit cracks.
Composition: four large full-body pose variants in a 2x2 grid: idle/front-3-quarter, attack windup, hurt recoil, charge/side-3-quarter.
Runtime requirement: match chunky high-fidelity isometric pixel-art enemy sprites, 3/4 isometric view, grounded heavy body mass, readable feet/claws/contact base, layered stone armor plates, strong side lighting, thick dark outline, material richness, no flat front-facing emblem look.
Background: perfectly flat solid #00ff00 chroma-key only for mechanical removal; no scenery, labels, UI, text, watermark, or cast shadow.
Avoid: no copied game style or existing game character, no flat shrine icon, no poster composition, no readable text.

## Prompt: Terrain Board

Use case: stylized-concept
Asset type: terrain/material art-direction board for PixelLab production prompts, concept reference only
Primary request: Create an original Armistice Plaza terrain and material board for AGI: The Last Alignment.
Layout: clean 4 by 4 board of isometric pixel-art terrain swatches and transition examples, each swatch presented as a small 2:1 isometric ground patch with natural edges, no labels, no readable text.
Materials to show: cracked civic concrete, worn warm treaty stone, evacuation asphalt with faded markings, rubble field, terminal flooring with cyan signal grooves, cable trench, scorch and dust/grit overlay, broken glass/debris, AGI corruption stone, black-violet organic breach matter, plaza-to-road edge mask, plaza-to-rubble edge mask, terminal-to-concrete blend, breach-to-concrete organic blend, cracked inlay emblem with no readable logo, low raised curb/step transition.
Visual identity: battered civic sci-fi, frontier-lab emergency repair geometry, and Alien God Intelligence prediction-space corruption. Materials should be rich enough for a close tactical isometric camera but tileable enough for a game.
Style: high-fidelity chunky pixel art, orthographic 2:1 isometric, crisp pixels, limited but varied palette, upper-left light, down-right micro shadows, readable material differences, organic non-repeating texture.
Avoid: no copied game style, no existing game tiles, no logos, no readable text, no UI, no flat gray grid, no photorealism, no 3D render, no generated captions, no decorative one-note purple palette.

## Prompt: Prop Board

Use case: stylized-concept
Asset type: large prop and set-piece art-direction board for PixelLab production prompts, concept reference only
Primary request: Create an original Armistice Plaza large prop and set-piece board for AGI: The Last Alignment.
Layout: six large transparent-looking isometric pixel-art prop concepts on a neutral matte background, arranged as a production reference sheet with generous spacing, no labels and no readable text.
Set pieces: crashed drone carrier wreck pile with broken rotor rings and torn hull plates; ruined treaty monument with cracked base slabs and broken vertical civic symbol; angled barricade wall cluster with supports, warning paint, tarp, tape, and debris; emergency terminal server bank with stacked cabinets, screens, beacon mast, cables, and platform base; AGI breach sculpture with void stone, organic tendrils, faceted cosmic glass, and corrupted ground base; foreground rubble and cable nest cluster with concrete chunks, glass, lab panels, and faction residue accents.
Scale cues: vehicle/building scale relative to tiny 80px player silhouette ghost only if helpful; each object has a plausible physical footprint, contact shadow, bottom ground contact, and screen-Y occlusion mass.
Visual identity: battered civic sci-fi plus precise frontier-lab hardware plus alien prediction-space corruption, original AGI worldbuilding, no official logos.
Style: high-fidelity chunky isometric pixel art, orthographic 2:1, crisp pixel edges, rich material detail, strong silhouettes, upper-left light, down-right shadows, production-game asset readability.
Avoid: no copied game style, no existing game props, no Tech Bros imitation, no logos, no readable text, no photorealism, no 3D render, no toy rectangles, no flat icons, no generic purple blob.

## Prompt: Sprite Board

Use case: stylized-concept
Asset type: player and enemy sprite direction board for PixelLab production prompts, concept reference only
Primary request: Create an original AGI: The Last Alignment player/enemy sprite direction board.
Layout: game-art character sheet reference, no labels and no readable text, neutral background. Show separate rows of small isometric pixel-art combat actors with consistent bottom-center foot alignment and simple pose variations.
Player classes: Accord Striker as the main starter hero at 80x80 or 96x96 runtime-readability scale, plus smaller supporting silhouettes for Bastion Breaker, Drone Reaver, Signal Vanguard, and Prism Gunner. Accord Striker must read as agile human/AI Alignment Frame: cyan visor, winglike antennas, reality patch pack, glowing boots, refusal shard weapon arm, compact athletic pose.
Enemy families: Bad Outputs as broken hostile machine/printout creatures, Benchmark Gremlins as spiky evaluator pests, Context Rot Crabs as low wide corrupted data-crab silhouettes, one elite AGI breach brute at 96x96 scale. Enemy families must be distinct silhouettes, not recolors.
Animation hints: idle, walk, attack, hurt/dash key poses where possible; keep frame origins stable and feet aligned.
Visual identity: battered civic sci-fi, frontier-lab signal accents, Alien God Intelligence black-violet organic corruption, strong gameplay readability.
Style: high-fidelity chunky pixel art, isometric 3/4 top-down game sprites, crisp outlines, selective inner outlines, upper-left light, down-right contact shadows, readable at normal tactical camera zoom.
Avoid: no copied game characters, no existing game style imitation, no logos, no readable text, no photorealism, no 3D render, no anime portrait sheet, no recolor-only enemy variants, no tiny unreadable tokens.

## Prompt: Build-Select Class Cards

Original pixel-art concept board for AGI: The Last Alignment build-select class cards, transparent-looking dark board background. Twelve distinct human-scale isometric exosuit class miniatures in a clean 4x3 grid, one full figure per cell, no text, no logos, no UI labels. Premium readable 96x96 runtime sprite direction source art, chunky dark outlines, upper-left light, small contact shadows, AGI treaty-plaza identity, cyan amber red violet accents, not copied from any game. Classes: compact Accord Striker shard-arm suit; Bastion Breaker heavy shield-frame; Drone Reaver slim controller with small helper drones; Signal Vanguard mast-visor scout; Bonecode Executioner angular code-blade armor with no gore; Redline Surgeon med-tech tactical suit; Moonframe Juggernaut rounded heavy moon-white armor; Vector Interceptor finned runner; Nullbreaker Ronin cloaked breaker frame; Overclock Marauder heat-vent armor; Prism Gunner lens-array suit; Rift Saboteur utility-pod stealth frame. Crisp isometric pixel-art production source board, each figure isolated with enough margin for mechanical cropping.

## Prompt: Enemy Animation Source

Original pixel-art runtime enemy animation source board for AGI: The Last Alignment, transparent-looking dark board background. Three horizontal strips, each strip has three coherent pose frames of the same exact non-human enemy family, 96x96-ish cells with clean margin, no text, no logos, no UI, no gore, no copied game style. Top strip: Bad Outputs corrupted magenta-violet data shard critter, hunched error mass, cyan output slits, tiny asymmetric legs, poses idle crouch, step left, step right. Middle strip: Benchmark Gremlin black monitor-headed evaluator unit, squat lab-machine body, teal screen eye, small antenna fins, poses idle, side step, bob recover. Bottom strip: Context Rot Crab low orange-black corrupted crab drone, wide silhouette, red-orange context glow, many tiny legs, poses crouch, scuttle A, scuttle B. Premium isometric pixel art, chunky dark outline, upper-left light, contact shadows, high runtime readability at 64x64, each family keeps the same silhouette across its three frames.

## Prompt: Coherent Accord Striker 4dir

Use case: stylized-concept
Asset type: production source board for a browser-game pixel-art sprite atlas
Primary request: Create a single coherent pixel-art sprite source sheet for AGI: The Last Alignment's starter player, Accord Striker. The character must be the same armored combatant in every frame, not a human runner in some rows.
Subject: Accord Striker, original AGI identity. A compact armored cyber-knight / frontier-lab emergency responder with cyan energy visor, dark graphite and ice-blue armor plates, heavy boots, glowing chest core, one angular refusal-blade / projector arm. Same proportions, same armor, same palette, same helmet in every frame.
Layout: exactly 4 rows by 3 columns on one image. Rows are SOUTH, EAST, NORTH, WEST. Columns are idle, walk step A, walk step B. Keep each sprite centered in its cell with consistent bottom-center foot anchor. No labels, no text, no UI, no scenery.
Style: premium isometric 2D pixel-art game sprite sheet, crisp chunky pixels, readable at 80x80 or 96x96 runtime frames, strong dark outline, strong silhouette, material highlights, no painterly blur.
Background: perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. Do not use #00ff00 anywhere in the subject. No cast shadow, no contact shadow, no watermark, no text.

## Prompt: Coherent Accord Striker 4dir V2

Use case: stylized-concept
Asset type: game production source board for a browser 2D isometric pixel-art horde-survival roguelite.
Primary request: Create a coherent Accord Striker armored 4-direction walking sprite source sheet for AGI: The Last Alignment.
Subject: one compact agile sci-fi armored combat-frame pilot, full suit identity preserved in every direction: dark graphite and worn white ceramic armor plates, cyan visor, bright cyan chest core, small winglike antenna fins, compact backpack reality-patch unit, refusal-shard forearm weapon, glowing boots. No bare human head, no casual clothing, no soft person-like silhouette.
Sheet layout: 4 rows by 3 columns on a flat solid #00ff00 chroma-key background. Rows are South/front, East/right side, North/back, West/left side. Columns are walk poses 1, 2, 3. Keep every frame fully visible with generous padding; no clipped helmet, no cropped antennas, no cropped boots. Feet aligned to a consistent bottom-center contact point in each cell.
Style: premium chunky 2:1 isometric pixel art, 80px runtime readability, strong dark outline, selective internal outlines, upper-left lighting, clean transparent-ready edges. Each frame should be a sprite cell, not a portrait, no labels, no UI, no logos, no text, no watermark.
Background: perfectly flat solid #00ff00 only, no shadows, gradients, texture, floor plane, or lighting variation. Do not use #00ff00 in the character.

## Prompt: Coherent Accord Striker 4dir V4

Use case: stylized-concept
Asset type: game production source board for a browser 2D isometric pixel-art horde-survival roguelite.
Primary request: Create a pixel-art sprite source sheet for Accord Striker with clean readable 3/4 isometric movement.
Critical fixes: no rectangular backpack, no square block on the back, no straight vertical slab silhouette, no visible crop-wall, no dark panel behind the character. Use a compact rounded spine module integrated into the armor silhouette.
Subject: armored sci-fi responder with dark graphite armor, white ceramic plates, cyan visor, cyan chest light, small antenna fins, glowing boots, and cyan refusal blade on forearm.
Sheet layout: exactly 4 rows by 3 columns on flat solid #00ff00 background. Row 1 south/front 3/4, row 2 east/right 3/4 walking with rounded armor silhouette and visible torso depth, row 3 north/back 3/4 with rounded shoulders and full legs, row 4 west/left 3/4 walking with rounded armor silhouette and visible torso depth. Three walk poses per row.
Padding: leave large empty green padding around every sprite; full body visible with no clipped helmet, antenna, boots, blade, shoulders, or side armor.
Style: crisp chunky pixel art, strong dark outline, no shadows, no floor, no labels, no text, no UI, no watermark.

## Prompt: Coherent Accord Striker 4dir V5

Use case: stylized-concept
Asset type: game production source board for a browser 2D isometric pixel-art horde-survival roguelite.
Primary request: Create a true low-resolution pixel-art sprite sheet for Accord Striker, a compact agile armored sci-fi runner, not bulky, not chibi, and not a portrait.
Subject: dark graphite tactical exosuit, worn white ceramic plates, cyan visor, cyan chest core, small antenna fins, slim rounded backpack, cyan refusal blade on forearm, and glowing boots.
Runtime target: 80x80 pixels per frame, so every sprite must be simple, crisp, readable, and have hard pixel edges.
Sheet layout: exactly 4 rows by 3 columns on one flat solid #00ff00 chroma key background. Rows: south/front 3/4, east/right 3/4, north/back 3/4, west/left 3/4. Columns: walk contact pose, passing pose, opposite contact pose.
Animation: make the walk animation obvious with alternating legs and arms, different boot positions, and torso bob. East and West must have matching visual scale and width. North and South must have matching height.
Critical style requirements: no blur, no antialiasing, no painterly gradients, no soft airbrush, no oversized backpack rectangle, no square panel, no shadows, no floor, no labels, no text, no UI, no watermark. Leave generous green padding around every sprite; no clipped helmet, antenna, boots, weapon, shoulder, or outline.

## Prompt: Oath-Eater Boss And VFX

Use case: stylized-concept
Asset type: production source board for browser-game boss sprite, portrait, and combat VFX atlas
Primary request: Create an original AGI boss and VFX source sheet for AGI: The Last Alignment. Do not copy any existing game. The boss is The Oath-Eater, an alien legal-horror machine/idol that feeds on broken alignment treaties.
Subject: Oath-Eater boss: large corrupted treaty monument creature, black-violet crystalline AGI breach core, cracked civic stone plates, torn oath-scroll fins, cyan/magenta alien computation veins, angular crown-like evaluator halo, heavy readable feet/base. It should feel much larger and more threatening than horde enemies.
Layout: one source sheet with separated assets on a flat background. Top row: 3 large boss body poses, idle/charge/hurt, each full body. Middle left: 1 dramatic square boss portrait/title-card crop. Middle/right and bottom: 8 separated combat VFX sprites: cyan refusal projectile, bright projectile trail, muzzle burst, hit impact burst, boss charge telegraph ring, broken-promise ground crack, purple AGI shard burst, pickup sparkle. Leave generous spacing between assets.
Style: premium isometric 2D pixel-art game asset sheet, crisp chunky pixels, strong silhouette, material-rich stone/metal/crystal surfaces, readable at runtime, no painterly blur.
Background: perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. Do not use #00ff00 anywhere in the subject. No cast shadow, no contact shadow, no watermark, no text.

## Acceptance Notes

- The target frame sets the correct bar for dense material richness and close camera scale, but it is concept art and should not be copied 1:1 into runtime.
- The terrain board is the strongest production prompt input for the next PixelLab tile batch.
- The prop board establishes the minimum set-piece scale and physical footprint expected in the first playable frame.
- The sprite board is strong enough for silhouette direction, but PixelLab runtime sheets still need separate frame-stable generation and cleanup.
- The build-select class card board is accepted for mechanical cropping into the locked-card south idle rows.
- The enemy animation board is accepted for mechanical cropping into three-frame runtime enemy strips.
- The coherent Accord Striker board is accepted for runtime packing because it fixes the mixed-identity movement bug while preserving a single armored silhouette in all directions.
- The coherent Accord Striker V2 board supersedes the temporary PixelLab side-row compromise: side rows keep the armored suit identity and do not clip helmet/antenna pixels.
- The coherent Accord Striker V4 board supersedes V2/V3 for normal play: side/back rows use a cleaner rounded armor silhouette, green-key remnants are stripped by the packer, and live north/west/east movement screenshots are now part of the camera proof.
- The coherent Accord Striker V5 board supersedes V4 for normal play: it is packed sharper, uses a slightly more agile footprint, removes isolated fragments, and mirrors accepted east frames for west so pressing left cannot make the avatar grow.
- The Oath-Eater/VFX board is accepted for the first boss/VFX rebuild; the source is stronger than the old symbolic boss icon, though future work should still add dedicated boss attack animation poses beyond the current single-body runtime contract.
- The authored-ground runtime surface supersedes the visible stamped-tile terrain pass for normal Armistice play. It is mechanically precomposed from the accepted ChatGPT/PixelLab terrain sources into larger civic stone, asphalt/road, rubble, terminal, and breach material zones so the camera reads one authored plaza surface instead of separate isometric tile objects.
- The May 4 terrain/grounding corrective pass keeps the same generated-source terrain and prop assets, then mechanically adds closer base palettes, civic seams, cable scars, embedded rubble, and prop-local dirt/shadow/debris halos around the drone wreck, barricades, treaty monument, terminal, and breach. It is a cohesion pass, not a new expressive source-art batch.
