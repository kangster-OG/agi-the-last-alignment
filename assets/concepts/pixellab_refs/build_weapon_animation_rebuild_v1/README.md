# Build Weapon Animation Rebuild V1 PixelLab Source

Date: 2026-05-11

PixelLab was accessed only through the dedicated automation profile:

- `.codex-local/pixellab-automation-profile`
- DevTools port `9337`

The signed-in session and recovered API path worked. A weapon VFX object-generation job was submitted from the dedicated profile with prompt prefix:

```text
Transparent 128x128 isometric pixel-art weapon VFX animation batch for AGI The Last Alignment Weapon Animation Rebuild V1
```

PixelLab object:

- `2793be41-aaee-4c9e-9fdb-74bc53c269ef`

Status during the runtime pass:

- completed to `review`
- 16 `storage_urls` were exposed through the dedicated-profile API response
- `POST https://api.pixellab.ai/objects/zip` returned `404` for this single-object export shape, so the raw frame URLs were preserved directly instead

Normalized PixelLab files:

- `raw/*frame_*.png`
- `build_weapon_animation_pixellab_raw_atlas.png`
- `build_weapon_animation_pixellab_raw_contact.png`
- `pixellab_object_metadata.json`

Runtime V1 uses only the strongest PixelLab contributions where they improve passive/residue cells. Several PixelLab frames showed small dark footer artifacts, so they are preserved as source/proof but not used as core projectile animation frames.
