# AGI Asset Intake

This folder is the durable intake point for production art. Do not drop final or third-party files here without updating `assets/asset_manifest.json` and `ART_PROVENANCE.md`.

## Folder Structure

- `concepts/`: ChatGPT Images art direction, mood boards, concept sheets, and PixelLab prompt references.
- `sprites/players/`: production player sprite sheets.
- `sprites/enemies/`: production enemy sprite sheets.
- `sprites/bosses/`: production boss sprites and sheets.
- `sprites/pickups/`: Coherence Shards and other collectible sprites.
- `sprites/effects/`: production projectile, impact, pickup sparkle, aura, and damage effect atlases.
- `tiles/armistice_plaza/`: isometric terrain tiles and atlases for Armistice Plaza.
- `props/armistice_plaza/`: arena props and landmark assets.
- `props/alignment_grid/`: overworld node and route landmark assets.
- `ui/`: original UI art, emergency patch cards, faction placeholder marks, and HUD pieces.
- `portraits/`: original dialogue and boss portrait art.
- `third_party/logos/`: official logos used only as third-party/parody faction identifiers.

## Workflow

1. Create art direction with ChatGPT Images.
2. Record the prompt, date, and intent in `ART_PROVENANCE.md`.
3. Generate production pixel art in PixelLab when the user is ready to log in manually.
4. Clean the output in Aseprite or Pixelorama:
   - remove noisy pixels
   - enforce palette/readability
   - align feet to the isometric ground point
   - normalize sprite origins
   - verify animation frame spacing
   - check seamless tile edges
5. Add or update the manifest entry with dimensions, frame metadata, status, and provenance key.
6. Run `npm run proof:assets`.

## Runtime Integration Gates

- `?assetPreview=milestone10_runtime_set` loads the first playable production-art set through Pixi without entering gameplay.
- `?assetPreview=milestone11_enemy_set`, `?assetPreview=milestone11_prop_set`, and `?assetPreview=milestone11_ui_set` load the broader Milestone 11 expansion set through Pixi without entering gameplay.
- `?assetPreview=milestone12_default_candidate` loads the co-op player variants, Alignment Grid node landmarks, route sigils, and prior production-art sets through Pixi without entering gameplay.
- `?assetPreview=milestone14_combat_art` loads the combat-effect atlas and emergency patch card frames through Pixi without entering gameplay.
- As of Milestone 13, the proofed production-art runtime path is the default. It includes the Milestone 10 baseline, Milestone 11 enemy/prop/UI expansion, P1-P4 Accord Striker co-op variants, online co-op production-art parity, and Alignment Grid node landmark art.
- As of Milestone 13, the Armistice Plaza production ground atlas is also default.
- As of Milestone 14, the default production-art path also includes combat projectiles, impact bursts, damage badges, pickup sparkles, refusal aura markers, emergency patch card-frame art, and online combat-state visibility hooks.
- `?productionArt=0` or `?placeholderArt=1` opts back into the legacy placeholder-safe sprite path for debugging/regression proofing.
- `?armisticeTiles=0` or `?placeholderTiles=1` opts back into the legacy code-drawn ground tile path.

Keep newly added, unproofed art behind a proofed preview and runtime flag until the full surrounding asset family is ready to join the default path.

## Status Meanings

- `planned`: named target slot only; the referenced file does not need to exist yet.
- `concept`: art direction or mockup, not game-ready.
- `raw`: generated/imported output before cleanup.
- `cleaned`: manually cleaned and reviewed, but not yet wired into gameplay.
- `production`: ready to resolve from gameplay/rendering code.
- `code_placeholder`: current Pixi shape or code-rendered placeholder.

## Official Logos

Official logos belong only in `assets/third_party/logos/`. They are not original project art and must not be claimed as MIT-owned assets unless their independent license allows that. Every logo file needs:

- a `third_party_logo` manifest entry
- `mitIncluded: false` unless independently licensed otherwise
- source URL and retrieval date in `ART_PROVENANCE.md`
- a clear non-endorsement/parody note
