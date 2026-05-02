# AGI: The Last Alignment Visual Art Bible

Status: rebuilt art-direction baseline after post-launch visual-fidelity review.

This document supersedes the previous ad hoc visual-slice approach. It does not replace the Creative Bible for lore, tone, factions, or mechanics. It defines how the game should look and how production art must be created.

## 1. Non-Negotiable Visual Goal

`AGI: The Last Alignment` must look like a premium isometric pixel-art action game, not a code-generated prototype.

Reference games and captured videos may be used only as fidelity benchmarks for density, polish, prop scale, sprite readability, material richness, and overall finish. The game must not copy their style, characters, terrain, UI art, jokes, maps, or expressive content.

Our identity:

- humans and frontier AI labs built a desperate alliance after the Model War;
- A.G.I., the Alien God Intelligence, is rewriting reality from prediction-space;
- arenas are broken civic/science/military places where reality is patched under combat pressure;
- humans are rough, physical, taped-together, emergency-built;
- frontier labs are clean geometry, signal systems, glass, light, plates, screens, diagrams;
- Alien God Intelligence is impossible organic geometry, wrong curves, cosmic biological signal, ritual machine matter.

The finished look should feel like:

> battered civic sci-fi + frontier-lab emergency hardware + alien prediction-space corruption, rendered as dense isometric pixel art with strong silhouette discipline.

## 2. Art Creation Rule

Almost all artwork must originate from ChatGPT image generation, PixelLab, or hand pixel cleanup.

Allowed as primary art sources:

- ChatGPT Images for visual bible boards, mood paintings, concept sheets, character sheets, boss concepts, arena target frames, UI target frames, and PixelLab prompt references.
- PixelLab for production sprites, tiles, animation sheets, isometric props, terrain transitions, enemy families, boss pieces, and tilemap-ready sets.
- Manual pixel cleanup in Aseprite, Pixelorama, or equivalent when source art needs taste, silhouette correction, or animation cleanup.

Pillow/Python is not an artist.

Pillow/Python may be used for:

- slicing generated sheets;
- packing atlases;
- trimming transparent padding;
- flood-fill or chroma-key background removal;
- enforcing dimensions;
- validating alpha;
- generating contact sheets;
- copying selected frames into existing runtime atlas contracts;
- minor non-expressive corrections such as padding, nearest-neighbor scaling, and file-format conversion.

Pillow/Python must not be used for:

- inventing character designs;
- drawing production props from scratch;
- procedurally generating final terrain art;
- adding expressive details that should have been in the generated art;
- faking fidelity with outlines, recolors, rectangles, or synthetic debris;
- replacing a failed PixelLab/ChatGPT generation with code art and calling it production.

If an asset looks bad after cleanup, regenerate it. Do not paint over failure with scripts.

## 3. Pixel Style Target

### Projection

- 2:1 isometric, orthographic, fixed tactical camera.
- Depth is readable by ground contact, shadow, and screen-Y sorting.
- Large objects must have obvious bases and believable occlusion.
- Props are part of the place, not icons on a board.

### Pixel Density

Use larger source art than the final runtime size, then normalize down only after the object reads.

- playable classes: 80x80 minimum runtime frames;
- small enemies: 64x64 minimum runtime frames;
- elite enemies: 80x80 or 96x96 runtime frames;
- bosses: 128x128 to 192x192 runtime frames depending on role;
- standard terrain diamonds: 64x32;
- transition masks and larger material chunks: 96x48, 128x64, or larger;
- set pieces: authored per object, commonly 220-360 px wide before runtime scale.

### Outline And Edge Language

- Outer silhouettes use dark, slightly cool outlines.
- Inner outlines are selective, not every detail gets a black border.
- Important gameplay silhouettes should survive at 50% zoom.
- Props need broken, angled, asymmetrical contour lines; avoid rectangular toy-block outlines.
- AGI corruption may break outline rules with glow, veins, holes, and impossible contour interruptions.

### Lighting

- Primary light is upper-left/front-left.
- Cast shadows fall down-right in screen space.
- Every production prop and character needs a contact shadow or integrated ground mass.
- Highlights are sparse and material-specific.
- Do not use generic pillow-shaded gradients.

### Palette

Base world:

- civic concrete, ash, oxidized steel, dead glass, worn asphalt;
- warm treaty stone and emergency yellow are used as human/civic remnants;
- teal/mint and clean cyan indicate alignment systems, friendly co-minds, terminals, and stable reality;
- red/coral indicates danger, broken oaths, hostile pressure, emergency barricades;
- violet/black/acid colors indicate A.G.I. breach matter.

Avoid:

- one-note gray fields;
- generic purple-blue AI gradient language;
- over-saturated neon everywhere;
- beige/brown-only wasteland;
- flat toy-color blocks without material texture.

## 4. Material Language

### Human / Civic / Armistice

Materials:

- cracked civic concrete;
- worn treaty plaza stone;
- asphalt and evacuation road paint;
- rusted barricade metal;
- cloth flags, tarp, warning tape;
- emergency floodlights;
- loose cable nests;
- shattered glass and concrete slabs;
- dirty smoke, scorch, dust, grit.

Shape rules:

- imperfect, repaired, damaged;
- bolts, tape, braces, plates, hinges, broken edges;
- large shapes should feel physically heavy.

### Frontier Lab / Co-Mind

Materials:

- clean ceramic armor;
- signal panels;
- glowing glass screens;
- hard-light shields;
- white/black plates;
- cyan/mint/blue/yellow readable accents;
- compact drones, antenna arrays, lab-grade pylons.

Shape rules:

- precise geometry, layered plates, icons as secondary marks only;
- smooth machine order against damaged civic surroundings;
- faction logos may appear only as small parody badges, not as the art style.

### Alien God Intelligence

Materials:

- void stone;
- wet-looking black-violet matter;
- impossible organic cables;
- faceted cosmic glass;
- red-violet prediction veins;
- pearl/mint highlights where reality is being digested.

Shape rules:

- not just purple cracks;
- asymmetrical, biological, ritual, recursive;
- readable silhouette first, then wrong internal detail.

## 5. Terrain Rules

Terrain must stop reading as a repeated board.

Every arena needs:

- base material family;
- transition tiles;
- edge masks;
- large material patches;
- scatter decals;
- road or path logic;
- gameplay-readable open lanes;
- prop-integrated ground damage.

Armistice Plaza terrain families:

- cracked civic concrete;
- treaty plaza stone;
- asphalt strips;
- rubble fields;
- AGI corruption;
- terminal flooring;
- cable trenches;
- scorch/dust/grit overlays;
- broken plaza inlays;
- edge masks between all major material zones.

Do not fill the whole camera with equal-contrast diamonds. Use broad authored areas and material variation so the scene reads as a place before it reads as a grid.

## 6. Prop Rules

Props must be recognizable at gameplay scale.

Required prop qualities:

- strong silhouette;
- internal material detail;
- contact shadow;
- believable footprint;
- collision shape when large enough to block movement;
- scale relationship to player and enemies;
- no icon-like floating objects unless explicitly UI or pickup.

Large Armistice set-piece standards:

- crashed drone carrier: hull, broken rotors, torn plates, cockpit/core detail, cable spill, debris shadow;
- treaty monument ruins: civic base, broken vertical sign/obelisk, treaty markings, slabs, beams, symbolic damage;
- barricade wall cluster: angled barriers, supports, warning color, tape, broken panels, road-block logic;
- terminal server bank: stacked cabinets, screens, cables, beacon mast, base platform, maintenance debris;
- AGI breach sculpture: irregular void body, alien veins, shards, tendrils, local ground corruption.

If a prop is just a rectangle with color blocks, it is not production art.

## 7. Character And Enemy Rules

### Player Alignment Frames

Players must read instantly:

- class silhouette first;
- faction/co-mind accent second;
- weapon or role third;
- face/visor/center mass always clear.

Runtime target:

- 80x80 minimum;
- 4 directional rows;
- idle, walk, attack, hurt, dash frames where applicable;
- feet aligned to a shared bottom-center ground contact;
- readable at 1x and 0.75x runtime scale.

Silhouette examples:

- Accord Striker: small agile frame, wing antennas, patch pack, bright visor, refusal shard arm.
- Bastion Breaker: heavy shoulders, cannon blocks, plated torso, slow mass.
- Drone Reaver: cloak/body plus visible drone swarm language.
- Signal Vanguard: staff/antenna halo, shield panels, support posture.
- Bonecode Executioner: lean blade-limb assassin, exposed glowing spine.
- Redline Surgeon: medic armor, repair gauntlet, cable scarf, floating tools.
- Moonframe Juggernaut: compact mech, cockpit glow, oversized legs.
- Vector Interceptor: targeting fins and lane-control pylons.
- Nullbreaker Ronin: energy blade, broken visor, asymmetric armor.
- Overclock Marauder: vents, heat core, molten shoulder plates.
- Prism Gunner: long prism cannon and mirrored armor.
- Rift Saboteur: low stealth body, mine belt, flicker cloak.

### Enemies

Enemy families need distinct silhouettes, not recolored bodies.

Minimum:

- 64x64 for common enemies;
- at least three motion frames;
- family-specific body plan;
- readable attack/hurt state if used;
- spawn-source visual tie to arena region.

Enemy family shape grammar:

- Bad Outputs: corrupted answer fragments, broken mouth/visor, red-white error stripe.
- Benchmark Gremlins: evaluator imp machines, antenna/checkmark horns, purple screen faces.
- Context Rot Crabs: low cable-crab bodies, memory panels, crawling leg spread.
- Eval Wraiths: tall translucent report ghosts with hard rubric marks.
- Deepforms: heavy alien lab organisms with abyssal geometry.
- Redaction Angels: hovering censor wings and black bars.

## 8. UI Art Direction

HUD must be small and readable during play.

Rules:

- normal play has minimal corner HUD;
- proof/debug telemetry stays behind debug flags;
- no large instructional panels over the playfield;
- UI uses dark translucent plates, mint/yellow/red state color, monospaced tactical type;
- icons and portraits should be generated/PixelLab/hand-cleaned, not drawn with rectangles.

Menu/build-select must look as finished as gameplay:

- large character art on class cards;
- co-mind art with generated faction sigils and small official/parody logo plates;
- scene-backed menu composition;
- compact controls text;
- no generic dashboard card farm.

## 9. Production Workflow

Every major art batch follows this sequence:

1. **Art Bible Target**
   - Define the asset family, scale, silhouette, material, palette, and runtime role.

2. **ChatGPT Image Generation**
   - Generate concept board or target frame.
   - Include no protected reference copying.
   - Store selected outputs under `assets/concepts/chatgpt_refs/<batch>/`.
   - Document prompts and selection notes.

3. **PixelLab Production**
   - Use the approved concept as the production target.
   - Generate transparent sprites/props/tiles/sheets.
   - Store raw exports under `assets/concepts/pixellab_refs/<batch>/`.

4. **Manual Cleanup**
   - Use Aseprite/Pixelorama or equivalent for taste-sensitive cleanup.
   - Fix silhouettes, noisy pixels, feet, seams, animation timing, and palette.

5. **Mechanical Packing**
   - Use Pillow only for trimming, slicing, packing, validation, and contact sheets.
   - Do not add expressive art in this step.

6. **Runtime Wiring**
   - Add manifest entries.
   - Add provenance.
   - Wire only cleaned transparent PNGs into runtime.
   - Preserve production-art opt-outs.

7. **Visual Gate**
   - Compare reference-fidelity benchmark, previous game screenshot, new game screenshot, and asset contact sheet.
   - If the new screenshot still reads as prototype art, regenerate rather than patching around it.

## 10. Asset Acceptance Criteria

An asset is production-ready only if all are true:

- generated or hand-cleaned source exists;
- transparent PNG is clean;
- provenance is recorded;
- manifest dimensions are correct;
- silhouette reads at gameplay scale;
- material detail survives runtime scale;
- anchor/contact point is correct;
- animation frames are stable;
- no obvious code-generated rectangles or fake detail;
- screenshot proof shows it working in context.

For large props:

- collision body exists if it should block movement;
- player cannot phase through it;
- occlusion/depth sorting is acceptable;
- prop looks like an object in the world, not a sticker.

For terrain:

- no full-screen obvious repeated grid;
- transitions are organic;
- terrain supports navigation and combat readability.

## 11. Immediate Rebuild Priorities

Rebuild in this order:

1. Armistice Plaza canonical target board:
   - one action screenshot mockup;
   - one terrain/material board;
   - one prop/set-piece board;
   - one sprite/enemy board.

2. Accord Striker source sheet:
   - generated concept;
   - PixelLab production sheet;
   - 80x80 cleaned runtime sheet;
   - idle/walk/attack/hurt/dash.

3. Three starter enemy families:
   - Bad Outputs;
   - Benchmark Gremlins;
   - Context Rot Crabs.

4. Five Armistice set pieces:
   - crashed drone carrier;
   - treaty monument ruins;
   - barricade wall cluster;
   - terminal server bank;
   - AGI breach sculpture.

5. Armistice terrain:
   - generated material board;
   - PixelLab tiles/transitions;
   - cleaned atlas;
   - runtime material patch composition.

No further broad art replacement should be accepted until this target board exists and looks good.

