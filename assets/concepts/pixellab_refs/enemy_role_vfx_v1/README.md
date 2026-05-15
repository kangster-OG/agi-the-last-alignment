# Enemy Role VFX V1 PixelLab Reference

Enemy Mob Differentiation V1 reuses the already accepted PixelLab-backed build weapon animation source as the production pixel refinement base for small hostile VFX. The source was originally preserved under `assets/concepts/pixellab_refs/build_weapon_animation_rebuild_v1/` and is copied here as the role-VFX provenance reference for this pass.

Runtime atlas:

- `assets/sprites/effects/enemy_role_vfx_v1.png`

Proof:

- `docs/proof/enemy-role-vfx-v1/enemy-role-vfx-v1-contact.png`

Packaging command:

```sh
npm run assets:enemy-role-vfx-v1
```

Production art rule: the packer only selects and repacks source-backed cells. It does not draw, recolor, filter, or procedurally create expressive VFX.

