# Armistice Source Rebuild V2

Date: 2026-05-04

Purpose: redo the Armistice terrain, prop grounding, boss event language, combat-channel separation, and enemy-motion pass from explicit ChatGPT Images source art after adding the no-cheap-art-shortcuts rule. Python/Pillow usage for this set is restricted to mechanical crop, chroma-key cleanup, resize, atlas packing, contact sheets, validation, and proof.

Generated source folder copied from:

- `/Users/donghokang/.codex/generated_images/019df176-b17e-7041-8f44-dbca2ee10018/`

## Source Boards

- `authored_ground_source_v1.png`: single isometric Armistice Plaza ground-source painting for civic stone, asphalt/road, rubble, terminal floor, breach corruption, cracks, dirt, scorch, and embedded debris.
- `prop_grounding_decal_atlas_source_v1.png`: 2x3 green-screen prop-grounding source board for drone wreck, barricade, treaty monument, terminal, breach, and small contact halo.
- `oath_eater_event_decal_atlas_source_v1.png`: 2x4 green-screen Oath-Eater event decal board for corruption pool, broken-promise ring, charge lane, oath particles, mood wash, breach tendril, impact burst, and warning pulse.
- `combat_channel_atlas_source_v1.png`: 2x5 green-screen combat-channel board for the existing 10-frame combat atlas contract, with player shots separated from blue pickup/XP and red/violet boss hazards.
- `enemy_motion_source_board_v1.png`: 3x4 green-screen enemy-family motion board for Bad Outputs, Benchmark Gremlins, and Context Rot Crabs.
- `terrain_chunk_atlas_source_v3.png`: 4x2 high-fidelity terrain-island board generated after user feedback that the base ground was blurrier than the prop grounding. It is used to raise base terrain fidelity with large overlapping civic, asphalt, rubble, terminal, breach, and authored-transition chunks. The generated cell containing a vertical barricade-like object is excluded from runtime packing; only ground-surface chunks are accepted.
- `terrain_plate_atlas_source_v4.png`: 4x2 high-fidelity terrain-plate board generated after live feedback that the base terrain still did not match the prop pads. The first dominant placement read as pasted islands and was rejected; accepted runtime use demotes these plates to low-alpha material calibration over the coherent V2 base.
- `authored_ground_source_v2.png`: wide ground-only ChatGPT Images source generated after the V4-only pass created visible terrain islands and dark holes. This is now the main continuous authored-ground source for the runtime terrain replacement pass, with brighter midtone gameplay lanes for enemy readability.
- `authored_ground_source_v3.png`: rejected continuous ground-only candidate generated during the next iteration. It was not accepted because the user clarified that the prop pads should remain at full fidelity and the base should be rebuilt from multiple interconnected high-fidelity pieces rather than a single huge terrain source.
- `authored_ground_candidate_rejected_v3a.png` / `authored_ground_candidate_rejected_v3b.png`: rejected continuous-source candidates. V3a included raised object-like/circular reads; V3b was a stronger continuous plate but still pushed the workflow toward one large terrain sheet instead of prop-pad-matched source parts.
- `terrain_interconnect_plate_atlas_source_v5.png` and `terrain_transition_strips_source_v5.png`: first multi-piece prop-pad-matching source attempt generated after the user corrected the workflow. Runtime proof improved fidelity but exposed green-edge contamination and visible piece boundaries, so V5 is retained as an intermediate/rejected runtime source.
- `terrain_interconnect_plate_atlas_source_v6.png` and `terrain_transition_strips_source_v6.png`: accepted multi-piece source set with cleaner green margins around high-fidelity plates/strips. Runtime packing uses these as the primary terrain detail so the base floor rises toward the prop-pad fidelity while prop pads remain full-strength contact accents.
- `terrain_prop_extension_atlas_source_v7.png`: focused ChatGPT Images prop-pad-extension board generated after the user narrowed the task to terrain only. It supplies additional ground-only civic/asphalt/rubble/terminal/breach extension pieces at the same rubble scale, crack thickness, dirt grain, and contrast as the prop-grounding pads. Runtime uses V7 only as overlapping terrain extensions over the V6/V2 base; the packer avoids using it as one huge floor sheet.
- `oath_eater_boss_rebuild_source_v4.png`: boss-specific ChatGPT Images rebuild board generated after the user accepted the terrain and narrowed the remaining visual issue to Oath-Eater. Top row provides four larger full-body boss frames; bottom row provides irregular contact/corruption decals. It targets the previous boss being too small, moving herky-jerky, and sitting over an out-of-place square/purple terrain pad.
- `enemy_benchmark_gremlin/benchmark_gremlin_detail_source_v1.png`: dedicated ChatGPT Images source strip generated after the user clarified that the Benchmark Gremlin was readable but too flat/iconic compared with the other enemy families. It keeps the bright monitor silhouette but adds panel chips, small screen marks, darker underside clusters, cyan light accents, and pixel material breakup.

## Runtime Pack

Packed by `scripts/assets/pack-armistice-source-rebuild-v2-assets.py`.

Runtime outputs:

- `assets/tiles/armistice_plaza/authored_ground.png`
- `assets/tiles/armistice_plaza/prop_grounding_decals_v2.png`
- `assets/sprites/effects/oath_eater_event_decals_v2.png`
- `assets/sprites/effects/combat_effects_v1.png`
- `assets/sprites/enemies/bad_outputs_sheet.png`
- `assets/sprites/enemies/benchmark_gremlins_sheet.png`
- `assets/sprites/enemies/context_rot_crabs_sheet.png`
- `assets/sprites/bosses/oath_eater.png`
- `assets/portraits/oath_eater_title_card.png`

The packer does not draw new expressive terrain, scuffs, prop dirt, particles, or telegraphs in code. It only slices, crops, removes green-screen background, pads, resizes, and packs the generated source boards into existing runtime contracts.

For the accepted V6 source set, the packer mechanically removes the flat green source background, crops alpha, resizes the accepted terrain plates/strips, feathers source-piece borders, and composites them into `authored_ground.png` as overlapping interconnected material runs. `authored_ground_source_v2.png` remains only low-dominance underpaint; V6 plates/strips now carry the visible base fidelity. Major prop-grounding pads remain at their restored runtime alpha as the calibration bar, while repeated small prop pads are reduced in runtime so they read as contact dirt/shadow/debris accents.

May 5 terrain-only correction:

- Rejected `authored_ground_source_v4.png` as the runtime terrain driver after fresh close-camera proof showed it reading as one giant repeated cobble sheet beneath higher-fidelity prop pads.
- Added V7 prop-pad-extension terrain source and packed it mechanically as additional overlapping terrain runs on top of V6, with the V2 continuous ground kept as underpaint only.
- Reduced redundant major prop-grounding opacity/scale after the base terrain reached closer prop-pad fidelity, so the treaty/terminal/drone/barricade pads read more as contact detail than separate mats.
- Follow-up correction removed the old authored sheets from the visible floor entirely. `authored_ground.png` now starts from a flat safety color and fills the camera-relevant/playable area with dense overlapping V7 prop-pad-extension pieces plus V6 authored emphasis pieces. The previous V2/V4 broad terrain sheets are no longer visible pixel sources for the runtime floor.
- Outer silhouette pass applies a mechanical irregular alpha mask to the final authored-ground PNG perimeter so the internally rectangular texture does not read as a clean square in play. This mask only changes terrain alpha at the edge; it does not draw over or cover props, which remain separate runtime sprites above the ground layer.

Latest close-camera judgment after V6 coverage iteration:

- `docs/proof/visual-fidelity-camera/camera-player-start.png`: player, drone wreck, barricade, terminal, road/asphalt, and civic stone share a closer crack/rubble/dirt density; prop pads no longer read as the only high-fidelity floor areas.
- `docs/proof/visual-fidelity-camera/camera-combat-vfx.png`: enemies and blue XP stay readable against brighter stone/asphalt lanes; player shots retain orange/magenta separation.
- `docs/proof/visual-fidelity-camera/camera-boss-vfx.png`: Oath-Eater corruption reads as irregular spread through the same material system instead of a square boss platform/rug.

Follow-up iteration after proof review:

- Added extra V6 road-damage/barricade-road coverage under the right-side barricade corridors so repeated prop pads have matching material language beneath them.
- Reduced the source-backed Oath-Eater corruption-pool and mood-wash runtime scale/alpha after the prior proof still allowed a square purple terrain-rug read under the boss.

May 5 boss-specific rebuild:

- Accepted `oath_eater_boss_rebuild_source_v4.png` as the new boss source board. The runtime boss sheet is now four 224x224 padded frames packed into `assets/sprites/bosses/oath_eater.png`, with the title-card portrait repacked from the same source.
- Replaced selected Oath-Eater event decal atlas frames with the source board's irregular bottom-row contact/corruption art so the boss no longer sits on a separate square purple pad.
- Runtime now draws Oath-Eater larger, cycles frames more slowly, anchors the sprite lower into the root/contact area, and interpolates Treaty Charge movement along the telegraph instead of snapping at impact.
- Latest close-camera boss proof inspected: `docs/proof/visual-fidelity-camera/camera-boss-vfx.png`, `camera-boss-vfx-anim-a.png`, and `camera-boss-vfx-anim-b.png`. Current judgment: boss size, ground contact, threat read, and non-square terrain disruption are materially improved; remaining taste risk is that the red Broken Promise rings are intentionally loud hazard language and may still be tuned later if they compete too much with the boss body.

May 5 boss/enemy readability correction:

- Repacked the runtime boss sheet from only the centered/front-contained V4 source columns. The V4 side-lurch source columns were technically padded, but in motion they still read like a boxed/cropped side silhouette, especially on the left side. Runtime now alternates the centered boss frames until a cleaner dedicated side-lurch source exists.
- Changed only the Benchmark Gremlin monitor enemy family palette to a dirty-white body/leg value range while preserving cyan/violet accents and the accepted monitor silhouette. The purple Bad Outputs shard family is unchanged.
- Latest checked proofs: `docs/proof/visual-fidelity-camera/camera-combat-vfx.png`, `docs/proof/visual-fidelity-camera/camera-boss-vfx.png`, and `docs/proof/boss/boss.png`.
- Asset-manifest/provenance note: the monitor color change is a user-requested color-only readability correction to an accepted sprite, not a new expressive art source. Future broader enemy art changes should go back through ChatGPT Images, PixelLab, or manual pixel cleanup.

May 5 Benchmark Gremlin fidelity correction:

- Generated and accepted `enemy_benchmark_gremlin/benchmark_gremlin_detail_source_v1.png` with ChatGPT Images because the previous monitor sprite had broad flat white value blocking and a heavy contour compared with the Bad Outputs and Context Rot Crab sprites.
- Updated `scripts/assets/pack-armistice-source-rebuild-v2-assets.py` so only `assets/sprites/enemies/benchmark_gremlins_sheet.png` now derives from that dedicated source strip. The pack step mechanically removes green, crops, resizes, solidifies alpha, and applies a lighter readability contour. It no longer uses the old broad value remap for this enemy.
- Latest checked proof: `docs/proof/visual-fidelity-camera/camera-combat-vfx.png`. Current judgment: Benchmark Gremlin remains bright and readable against the terrain but now has screen detail, chipped panels, small shadows, and material breakup closer to the other enemy sprites.
