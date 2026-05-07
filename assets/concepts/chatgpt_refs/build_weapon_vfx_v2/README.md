# Build Weapon VFX v2

Generated May 7, 2026 with ChatGPT Images after playtest feedback that Patch Mortar and other build weapons read too static in motion.

Purpose:
- replace the first build-weapon VFX board with a stronger animation source;
- give Patch Mortar distinct launch, rising shell, arcing/descent, and impact frames;
- provide more readable frame variation for Vector Lance, Signal Pulse, Context Saw, and Causal Railgun;
- preserve the source-art-first rule for production VFX.

Source:
- `build_weapon_vfx_source_v2.png`

Mechanical outputs:
- `build_weapon_vfx_source_v2_keyed.png`
- `assets/sprites/effects/build_weapon_vfx_v1.png`

Notes:
- The runtime atlas keeps the existing `build_weapon_vfx_v1.png` path and frame names so earlier build-grammar wiring remains compatible.
- Python/Pillow use is limited to chroma-key cleanup, cropping, fitting, and atlas packing.
- Runtime animation uses these source-backed frames with movement, rotation, shadow, and timing offsets; it does not draw new expressive VFX with code.
