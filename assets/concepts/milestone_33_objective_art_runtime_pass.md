# Milestone 33 Objective Art Runtime Pass Handoff

Manifest ID: `concept.milestone_33.objective_art_runtime_pass_brief`

Purpose: prepare cleaned runtime atlas targets for Save Profile actions, route rewards, online objective props, route states, and party voting without importing official logos or wiring assets into gameplay/runtime code.

## Scope Boundary

- This document is a concept and production handoff only.
- No official logos are included or requested for this pass.
- Do not import the generated concept boards directly into runtime.
- Runtime-ready outputs should be separate cleaned PNG atlases with transparent backgrounds, manifest entries, and provenance rows.
- Suggested production path: use the existing ChatGPT Images concept boards as visual direction, generate or hand-author pixel atlases, then clean in Aseprite or Pixelorama before runtime import.
- This pass intentionally does not touch gameplay, runtime, server, or proof integration.

## Reference Inputs

| Reference | Manifest ID | Use |
|---|---|---|
| Save Profile UI concept board | `concept.save_profile_ui.generated_reference_v1` | Local save action language, import/export/copy/reset affordances, compact emergency OS palette. |
| Route Map Polish concept board | `concept.route_map_polish.generated_reference_v1` | Route states, reward badge density, selected route focus, party vote readability. |
| Arena Objective Props concept board | `concept.arena_objective_props.generated_reference_v1` | Split-hold anchor, regroup beacon, recompile relay silhouettes and state language. |
| Online hazard markers production atlas | `effect.online_route.hazard_markers_v1` | Existing color and scale precedent for online route utility markers. |
| Route biome landmarks production atlas | `prop.online_route.biome_landmarks_v1` | Existing route art density and transparent atlas cleanup precedent. |

## Shared Production Rules

- Transparent PNG atlases only. No baked backgrounds, UI panels, concept-board crops, or generated text.
- Pixel silhouettes must read at 1x and 2x with nearest-neighbor scaling.
- Use no official logos, no copied product UI, no copied brand marks, and no text inside icons.
- Palette target: graphite outlines, off-white core pixels, cyan active energy, amber warning/unstable states, violet A.G.I. corruption, and muted gray locked/disabled states.
- Each atlas needs 1 px transparent padding between frames when possible and stable frame dimensions documented in the manifest.
- Runtime import should prefer small atlases over full concept-board images.
- Manual cleanup must remove noisy pixels, normalize line weight, enforce transparent edges, and confirm that icons remain readable over both dark UI panels and busy isometric terrain.

## Atlas Targets

| Planned Manifest ID | Future Path | Target Size | Frames | Runtime Role | Status |
|---|---|---:|---|---|---|
| `ui.save_profile.import_export_icons_v1` | `assets/ui/save_profile_import_export_icons_v1.png` | 192x32 | 6 frames, 32x32 | Save profile import, export, copy, reset, local save, success/check icon. | Planned |
| `ui.route_map.reward_badges_v1` | `assets/ui/route_reward_badges_v1.png` | 192x32 | 6 frames, 32x32 | Route rewards and Save Profile reward history badges. | Planned |
| `prop.objective.split_hold_anchor_v1` | `assets/props/objectives/split_hold_anchor_v1.png` | 384x96 | 4 frames, 96x96 | Split-party hold anchor with inactive, active, pressured, completed states. | Planned |
| `prop.objective.regroup_beacon_v1` | `assets/props/objectives/regroup_beacon_v1.png` | 384x96 | 4 frames, 96x96 | Regroup/rally marker with inactive, pulse, ready, completed states. | Planned |
| `prop.objective.recompile_relay_v1` | `assets/props/objectives/recompile_relay_v1.png` | 384x96 | 4 frames, 96x96 | Recompile/revive relay with offline, compiling, ready, corrupted states. | Planned |
| `prop.alignment_grid.route_state_markers_v2` | `assets/props/alignment_grid/route_state_markers_v2.png` | 240x48 | 5 frames, 48x48 | Stable, unstable, locked, event, and boss route overlays. | Planned |
| `ui.route_map.party_vote_pips_v1` | `assets/ui/route_map_party_vote_pips_v1.png` | 256x32 | 8 frames, 32x32 | P1-P4 ready and unready vote pips for route selection. | Planned |

## Production Notes By Asset

### Save Profile Action Icons

Frames:

1. Local browser save chip: compact storage glyph, small cyan memory notch, no browser logo.
2. Export: outward arrow from code slab.
3. Import: inward arrow into code slab.
4. Copy: stacked clipped code cards.
5. Reset: amber warning loop or cracked storage chip.
6. Confirm/success: cyan check over memory chip.

Cleanup checks:

- Reset must be visibly destructive without using red as the only signal.
- Copy/export/import silhouettes must differ at 32x32.
- Keep all icons textless so localization and UI copy remain code-rendered.

### Route Reward Badges

Frames:

1. Data fragment.
2. Memory cache.
3. Clearance pass.
4. Core upgrade.
5. Glitch key.
6. Locked/unknown reward.

Cleanup checks:

- Badges should share the same circular or clipped-diamond backing.
- Locked badge must be low contrast but still visible on route cards.
- These should be reusable in Save Profile history and Alignment Grid node panels.

### Split-Hold Anchor

Frames:

1. Inactive folded anchor with gray field.
2. Active cyan split field with two opposing clamps.
3. Pressured amber field with A.G.I. crack intrusion.
4. Completed stabilized anchor with cyan ring and reduced corruption.

Cleanup checks:

- Must read as a world prop, not a UI button.
- Ground contact shadow should sit in the lower third of the frame.
- Avoid tiny inner detail; the anchor silhouette carries the meaning.

### Regroup Beacon

Frames:

1. Dormant beacon mast.
2. Pulsing cyan rally signal.
3. Ready state with four small cell dots around the mast.
4. Completed state with stable ring and calm core.

Cleanup checks:

- The four cell dots should read as party capacity, not official faction marks.
- Pulse shape must be readable in the arena under horde pressure.
- Keep vertical silhouette distinct from the recompile relay.

### Recompile Relay

Frames:

1. Offline relay cradle.
2. Compiling state with cyan vertical scan.
3. Ready revive/recompile state with bright core.
4. Corrupted/interrupted state with violet fracture.

Cleanup checks:

- Should look like infrastructure, not a character.
- Use a larger central core than the regroup beacon so they do not alias visually.
- Purple corruption should never dominate the active/ready states.

### Route State Markers

Frames:

1. Stable route: cyan/white linked chevron.
2. Unstable route: amber broken chevron.
3. Locked route: gray blocked gate.
4. Event route: cyan diamond with small spark.
5. Boss route: violet breach crown or hazard seal.

Cleanup checks:

- Must work on top of the existing Alignment Grid route lines.
- Stable and event should not be confused; event needs a distinct diamond or spark silhouette.
- Boss route can use violet but should not look like an official logo.

### Party Vote Pips

Frames:

1. P1 unready.
2. P1 ready.
3. P2 unready.
4. P2 ready.
5. P3 unready.
6. P3 ready.
7. P4 unready.
8. P4 ready.

Cleanup checks:

- Slot identity should come from color and shape position, not text.
- Ready state needs a filled core or check notch, not just brightness.
- Pips should remain readable at 24px if the route panel is dense.

## PixelLab Or Local Production Prompt

```text
Original transparent pixel-art runtime atlas pack for AGI: The Last Alignment. Clean sci-fi emergency OS icons and isometric objective props. Include save profile icons for local save, export, import, copy, reset, success; route reward badges for data fragment, memory cache, clearance, core upgrade, glitch key, locked reward; isometric objective props for split-hold anchor, regroup beacon, recompile relay in inactive, active, pressured or ready, completed states; route state markers for stable, unstable, locked, event, boss; party vote pips for four players ready and unready. Chunky readable pixel art, graphite outlines, off-white core pixels, cyan active energy, amber warning, muted gray locked, restrained violet A.G.I. corruption. Transparent background, no text, no official logos, no copied game UI, no brand marks.
```

## Suggested First Runtime Imports

1. `prop.objective.split_hold_anchor_v1`
2. `prop.objective.regroup_beacon_v1`
3. `prop.objective.recompile_relay_v1`
4. `prop.alignment_grid.route_state_markers_v2`
5. `ui.route_map.party_vote_pips_v1`
6. `ui.save_profile.import_export_icons_v1`
7. `ui.route_map.reward_badges_v1`

Rationale: the three objective props clarify Milestone 29 role-pressure and revive/regroup loops first. Route state markers and party vote pips then improve online route decisions. Save Profile icons and reward badges are lower-risk UI imports that can follow once the runtime art loader surface is ready.

## Acceptance Checklist

- Manifest entries updated from `planned` to `cleaned` or `production` only after files exist.
- `ART_PROVENANCE.md` records generation source, date, prompt, and manual cleanup.
- PNGs use transparent backgrounds and documented frame metadata.
- No official logos or third-party brand marks are present.
- Runtime import thread runs `npm run proof:assets`, `npm run build`, and relevant route/objective/UI proof after wiring.
