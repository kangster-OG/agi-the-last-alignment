# Post-Armistice Terrain Local Decal Rebuild V2

Generated on 2026-05-10 after user review rejected the first continuous-band post-Armistice terrain repair as stretched, warped, and below the Armistice fidelity bar.

Purpose: replace the failed broad source-band expansion method with smaller ChatGPT Images terrain-decal source cells. The packer uses these as local authored pieces, closer to the accepted Armistice grammar of overlapping source-backed terrain chunks.

Source:

- `post_armistice_terrain_local_decal_atlas_source_v2.png` - ten rows by four local-decal cells for the post-Armistice campaign levels.

Packing:

- `scripts/assets/pack-post-armistice-terrain-local-decal-rebuild-v2.py`
- Mechanical operations only: green-key removal, alpha crop, edge feathering, fit/resize, alpha-safe PixelLab inclusion, and packing into the existing authored-ground and terrain-chunk contracts.
- The packer avoids the rejected continuous-band wrapping/stretching behavior.
- Armistice is untouched and remains the comparison baseline.

Live proof:

- `docs/proof/terrain-tour/terrain-tour-contact-sheet.png`
- Individual screenshots and JSON state are in `docs/proof/terrain-tour/`.

