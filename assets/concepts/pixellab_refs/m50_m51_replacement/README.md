# PixelLab M50/M51 Replacement Sources

Generated in PixelLab Create Object on 2026-05-01 from the authenticated local browser session. Each batch produced a 16-frame 48x48 transparent object sheet. Runtime atlases are rebuilt by:

```bash
python3 scripts/assets/build-pixellab-m50-m51-replacements.py
```

## Batches

- `m50_unknown_isometric_b_raw`: campaign terrain tile motifs for the fourteen supported campaign arenas plus route road variants.
- `m50_unknown_isometric_a_raw`: campaign arena landmark props for the fourteen supported campaign arenas plus reward/gate extras.
- `campaign_enemies_a_raw`: first sixteen campaign enemy-family sprites.
- `campaign_enemies_b_raw`: final three campaign enemy-family sprites plus additional route-threat variants.
- `campaign_bosses_raw`: ten campaign bosses plus extra guardian/echo variants; also sources the boss portrait cards.
- `campaign_hazards_raw`: fifteen campaign hazard/telegraph sprites plus a boss-gate extra.
- `route_landmarks_raw`: Alignment Grid node landmarks and online route/diorama landmark props.

## Runtime Outputs

- `assets/tiles/campaign_arenas/terrain_m50.png`
- `assets/props/campaign_arenas/arena_props_m50.png`
- `assets/sprites/enemies/campaign_enemies_m50.png`
- `assets/sprites/bosses/campaign_bosses_m50.png`
- `assets/portraits/campaign_boss_portraits_m50.png`
- `assets/sprites/effects/campaign_hazards_m50.png`
- `assets/props/alignment_grid/node_landmarks_v1.png`
- `assets/props/online_route/route_landmarks_v1.png`
- `assets/props/online_route/verdict_spire_landmarks_v1.png`
- `assets/props/online_route/route_biome_landmarks_v1.png`

All prompts requested original chunky 16-bit sci-fi pixel art, transparent background, no text, no UI, no official logos, and no copied third-party game art.
