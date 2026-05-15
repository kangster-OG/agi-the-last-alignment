# Post-Armistice Terrain Rebuild V1

Purpose: repair the campaign-wide authored-ground failure where every post-Armistice level had visible black/dark terrain gaps compared with the accepted Armistice authored-ground baseline.

## Source Files

- `post_armistice_terrain_rebuild_source_v1.png`: first ChatGPT Images pass. Preserved for history, but not used as the final broad ground source because the separated platform-island layout produced too much repeated terrain stamping.
- `post_armistice_terrain_rebuild_source_v2.png`: accepted ChatGPT Images pass for runtime repacking. It is a ten-band continuous terrain-source atlas, one band per post-Armistice level: Cooling, Transit, Signal, Blackwater, Memory, Guardrail, Glass, Archive, Appeal, and Spire.

## Runtime Use

`scripts/assets/pack-post-armistice-terrain-rebuild-v1.py` mechanically crops, wraps, edge-feathers, alpha-masks, resizes, and packs this generated source into the existing authored-ground and terrain-chunk runtime contracts. The script does not draw expressive terrain with code.

The final audit sheet is `tmp_terrain_audit_contact_after5.png`; every post-Armistice authored-ground sheet measured `0.00%` center alpha holes after the rebuild.
