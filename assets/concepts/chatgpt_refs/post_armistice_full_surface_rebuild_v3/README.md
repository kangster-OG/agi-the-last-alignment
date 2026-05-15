# Post-Armistice Full-Surface Terrain Rebuild V3

Date: 2026-05-10

This folder contains the ChatGPT Images source boards for the V3 rebuild of every campaign map after Armistice. Armistice remains untouched and is used as the accepted baseline.

## Source Boards

- `post_armistice_full_surface_board_a_cooling_transit_signal_blackwater_v3.png`
  - Cooling Lake Nine
  - Transit Loop Zero
  - Signal Coast
  - Blackwater Beacon
- `post_armistice_full_surface_board_b_memory_guardrail_glass_v3.png`
  - Memory Cache
  - Guardrail Forge
  - Glass Sunfield
- `post_armistice_full_surface_board_c_archive_appeal_spire_v3.png`
  - Archive Court
  - Appeal Court
  - Outer Alignment Spire

## Acceptance Standard Used

Each regenerated map was judged against the seven-point map standard established from the Armistice baseline:

1. Filled playable surface: the normal camera should not reveal random black voids or unfinished gaps.
2. Intentional negative space: dark areas must read as authored seams, hazard edges, pits, water, shadowed machinery, or route boundaries.
3. Armistice-level density: the first playable crop should contain layered floor material, embedded machinery, scars, cables, plates, and believable prop grounding.
4. Playable composition: terrain must support lanes, anchors, objective pads, combat readability, and camera movement through a larger world.
5. No single texture carpet: surfaces need interlocked chunks, route transitions, anchor regions, local variation, and biome-specific material clusters.
6. Biome-specific identity: Cooling, Transit, Signal, Blackwater, Memory, Guardrail, Glass, Archive, Appeal, and Spire each need their own material language.
7. Proof from multiple camera positions: success is judged in play at the normal close tactical camera, not only from a static atlas or one spawn screenshot.

## PixelLab Requirement

The V3 runtime pack also uses PixelLab-authenticated source frames from:

- `assets/concepts/pixellab_refs/cooling_lake_nine_refinement_v1/`
- `assets/concepts/pixellab_refs/blackwater_beacon_refinement_v1/`
- `assets/concepts/pixellab_refs/memory_cache_refinement_v1/`
- `assets/concepts/pixellab_refs/guardrail_forge_refinement_v1/`
- `assets/concepts/pixellab_refs/glass_sunfield_refinement_v1/`
- `assets/concepts/pixellab_refs/archive_court_refinement_v1/`
- `assets/concepts/pixellab_refs/appeal_court_refinement_v1/`
- `assets/concepts/pixellab_refs/alignment_spire_finale_refinement_v1/`
- `assets/concepts/pixellab_refs/m50_m51_replacement/`

Live PixelLab was opened during this rebuild and the account appeared signed in, but the current Chrome accessibility/CDP surface did not provide a safe, reliable way to drive fresh prompt/export interactions without taking over the user's browser. No credentials, account secrets, billing, payment, or security prompts were handled. The required PixelLab leg therefore uses the existing authenticated PixelLab source frames already preserved in the repo, not code-authored replacement art.

## Runtime Packing

Runtime assets are rebuilt by:

```sh
npm run assets:post-armistice-terrain-v3
```

The packer is `scripts/assets/pack-post-armistice-full-surface-rebuild-v3.py`. It mechanically crops, fits, composites, alpha-fades, and packs the approved ChatGPT Images and PixelLab source art into existing runtime terrain contracts. It does not draw expressive terrain details with code.

## Proof

Primary proof outputs:

- `docs/proof/terrain-tour/terrain-tour-contact-sheet.png`
- `docs/proof/terrain-sweep/terrain-tour-contact-sheet.png`
- `docs/proof/terrain-rebuild-v3/authored-ground-contact.png`

