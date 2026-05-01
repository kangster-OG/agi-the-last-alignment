# Batch 001 Concept Target: Accord Striker

Manifest ID: `concept.accord_striker.art_direction_brief`

Purpose: establish the production direction for the starter player frame before PixelLab sprite-sheet generation.

## Creative Target

Accord Striker is the starter Alignment Frame: small, fast, readable, and heroic under horde pressure. The silhouette should communicate:

- compact pilot frame
- huge reality-patch pack
- winglike antennas or fins
- glowing boots or dash emitters
- human/AI dyad rather than a pure robot

Do not copy any existing game character, real company mascot, official product UI, or official logo. The OpenAI co-mind identity can be suggested through clean geometry and refusal-shield language, but not by embedding an official logo in the player sprite.

## ChatGPT Images Art-Direction Prompt

```text
Use case: stylized-concept
Asset type: game character concept sheet for a 2D isometric pixel-art horde-survival roguelite
Primary request: Create an original concept sheet for "Accord Striker", the starter human/AI Alignment Frame in AGI: The Last Alignment.
Scene/backdrop: neutral light-gray production sheet background, no environment, no logos, no text except small generic labels if needed.
Subject: a compact fast combat frame with a human pilot core and AI co-mind hardware, oversized reality-patch backpack, winglike antennas, glowing dash boots, readable heroic silhouette.
Style: chunky isometric pixel-art-ready design language, clean sci-fi apocalypse, frontier AI parody without using official brand marks, strong silhouette, simple color blocking.
Composition: front three-quarter hero pose, tiny in-game scale silhouette preview, side/back detail callouts for backpack and boots.
Color direction: off-white pilot core, dark graphite joints, safety mint/teal system glow, small yellow emergency accents, restrained red warning accents.
Constraints: original design only, no official company logos, no copied game characters, no brand UI, no photorealism, no tiny unreadable greeble, no weapons that dominate the silhouette.
```

## PixelLab Production Prompt Seed

```text
Original 2D isometric pixel-art sprite sheet for Accord Striker, a compact fast human/AI combat frame with a large reality-patch backpack, winglike antennas, glowing dash boots, off-white body, graphite joints, teal system glow, small yellow emergency accents. Chunky readable 32x40 frame target, transparent background, 4 directions, idle and run cycles, strong feet contact point for isometric ground alignment, no official logos, no text, no copied characters.
```

## Cleanup Checklist

- Normalize every frame to a 32x40 target box unless a later test proves a different box reads better.
- Align feet to a stable bottom-center isometric ground origin.
- Preserve readable P1/P2/P3/P4 recolor areas for co-op.
- Remove single-pixel noise and over-detailed hardware.
- Export `assets/sprites/players/accord_striker_walk.png` only after cleanup.
- Update `player.accord_striker.production_walk_sheet` dimensions and frame counts in `assets/asset_manifest.json`.

