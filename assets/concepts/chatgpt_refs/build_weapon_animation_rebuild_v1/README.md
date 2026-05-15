# Build Weapon Animation Rebuild V1 Source

Date: 2026-05-11

Purpose: replace the "static sprite slides forward" feel of the current build-weapon VFX with source-backed animation grammar.

## Source Files

- `build_weapon_animation_primary_fusion_source_v1.png`
- `build_weapon_animation_secondary_support_source_v1.png`

Generated with ChatGPT Images through Codex built-in image generation on a flat chroma-key background. The boards intentionally contain animation-strip/contact cells rather than single icons.

## Motion Contract

Every current build weapon/fusion/passive effect should read through phases:

- startup / charge
- launch
- travel or active loop
- trail / echo / orbit / pulse / arc
- impact / detonation
- lingering residue

Covered families:

- Refusal Shard
- Vector Lance
- Signal Pulse
- Context Saw
- Patch Mortar
- Causal Railgun
- Refusal Halo / Cathedral of No
- Prediction Priority
- Rift Mine
- objective-support bursts

## Mechanical Packing

Runtime packer:

- `scripts/assets/pack-build-weapon-animation-rebuild-v1.py`

Runtime path preserved for compatibility:

- `assets/sprites/effects/build_weapon_vfx_v1.png`

Proof sheets:

- `docs/proof/build-weapon-animation-rebuild-v1/build-weapon-animation-source-contact.png`
- `docs/proof/build-weapon-animation-rebuild-v1/build-weapon-animation-runtime-contact.png`

The packer only chroma-keys, crops, trims alpha, nearest-neighbor resizes, packs atlases, and generates proof sheets. It does not draw expressive production art with code.

## PixelLab Status

PixelLab generation was started through `.codex-local/pixellab-automation-profile` using the recovered API/browser workflow. Object ID:

- `2793be41-aaee-4c9e-9fdb-74bc53c269ef`

The PixelLab object completed to `review` and exposed 16 frame URLs through the dedicated-profile API response. The API ZIP endpoint returned `404` for this single-object export shape, so the frames were preserved directly from `storage_urls`, normalized, and proofed under `assets/concepts/pixellab_refs/build_weapon_animation_rebuild_v1/`.

Runtime V1 uses the strongest PixelLab contributions selectively for passive/residue cells and keeps weaker text/cruft-contaminated PixelLab frames out of active projectile motion.
