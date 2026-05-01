# Milestones 30-32 Asset Production Prep

Manifest ID: `concept.milestone_30_32.asset_prep_brief`

Purpose: define concept targets, production handoff needs, and provenance boundaries for the next three implementation milestones without touching gameplay, server, proof, or runtime integration code.

## Scope Boundary

- This file and the linked PNGs are concept/reference material only.
- The generated PNG boards are not production-ready pixel atlases and should not be imported directly into runtime UI or gameplay.
- Production-ready pixel assets should come from PixelLab or local/manual pixel cleanup, then be tracked separately in `assets/asset_manifest.json` and `ART_PROVENANCE.md`.
- Official company logos remain third-party/parody brand material only. They must live under `assets/third_party/logos/`, use `mitIncluded: false`, and receive explicit source/date provenance before integration.
- The concept boards deliberately avoid official logos and real product UI. Any generated mark, portrait, mascot-like shape, or text is provisional art-direction reference.

## Generated Reference Boards

| Target | Manifest ID | Path | Status | Use |
|---|---|---|---|---|
| Save Profile UI | `concept.save_profile_ui.generated_reference_v1` | `assets/concepts/milestone_30_save_profile_ui_concept.png` | Concept | Milestone 30 visual grammar for local save, import/export, reset, and route rewards UI. |
| Route Map Polish | `concept.route_map_polish.generated_reference_v1` | `assets/concepts/milestone_31_route_map_polish_concept.png` | Concept | Milestone 31 route-state, node panel, party vote, and reward icon direction. |
| Arena Objective Props | `concept.arena_objective_props.generated_reference_v1` | `assets/concepts/milestone_31_arena_objective_props_concept.png` | Concept | Milestone 31 modular objective prop silhouettes and active/completed state language. |
| Class / Co-Mind Identity | `concept.class_comind_identity.generated_reference_v1` | `assets/concepts/milestone_32_class_comind_identity_concept.png` | Concept | Milestone 32 class silhouettes, co-mind module motifs, role chips, and upgrade identity direction. |

## Milestone 30: Save Profile UI

Concept target:

- Make browser-local save boundaries explicit without feeling like a settings page.
- Keep the surface in the game's emergency OS language: compact pixel frames, cyan primary actions, amber destructive warnings, and route-reward telemetry.
- Expose save profile, export code, import code, reset profile, current route progress, unlocked rewards, pilot chip, and co-mind chip.
- Use exact or near-exact UI copy: `LOCAL BROWSER SAVE`, `EXPORT CODE`, `IMPORT CODE`, `RESET PROFILE`, `ROUTE REWARDS`.

Production assets to prepare:

- `ui.save_profile.local_save_chip_v1`: 32x32 or 48x48 icon for browser-local save.
- `ui.save_profile.import_export_icons_v1`: compact import/export/copy/reset icon atlas.
- `ui.save_profile.reward_badges_v1`: small route reward badges that can also be reused on the route map.
- `ui.save_profile.panel_frames_v1`: optional pixel panel/frame atlas if the implementation does not stay code-native.

PixelLab/local cleanup seed:

```text
Original pixel-art sci-fi UI icon atlas for AGI: The Last Alignment save profile flow. Transparent background. Icons for local browser save chip, export code, import code, copy code, reset warning, route rewards, locked reward, unlocked reward. Black/white/cyan emergency OS palette with restrained amber warning. Crisp 24px, 32px, and 48px readability. No official logos, no product UI, no text inside icons.
```

Integration note:

- The first implementation should use code-rendered UI with small imported icon atlases only where they improve readability. Do not use the concept PNG as a panel background.

## Milestone 31: Route Map Polish

Concept target:

- Make the Alignment Grid read as a dense miniature world instead of a node board.
- Keep the party flow visible: selected route, vote pips, available rewards, locked branches, stable roads, unstable roads, and boss/event routes.
- Preserve the existing regions: Armistice Plaza, Cooling Lake Nine, Transit Loop Zero, Ceasefire Cache, and Verdict Spire.
- Avoid official logos on nodes. Faction-specific presentation can use original placeholder marks until third-party logos are formally imported.

Production assets to prepare:

- `prop.alignment_grid.route_state_markers_v2`: stable, unstable, locked, event, boss.
- `prop.alignment_grid.node_badges_v1`: route reward/biome badges for map panels.
- `ui.route_map.party_vote_pips_v1`: P1-P4 vote pips and ready/unready states.
- `ui.route_map.reward_icons_v1`: route reward icons shared with Save Profile UI.

PixelLab/local cleanup seed:

```text
Original 2D pixel-art route map icon atlas for an isometric sci-fi overworld. Transparent background. Stable road marker, unstable road marker, locked route marker, event marker, boss route marker, party vote pips for four players, reward icons for data fragment, memory cache, clearance, core upgrade, glitch key. Chunky readable 32px and 48px shapes. Cyan/white base, amber unstable, gray locked, purple alien corruption. No official logos, no copied game UI, no text.
```

Integration note:

- Import route state markers before decorative landmark polish because they directly affect route readability and online party voting.

## Milestone 31: Arena Objective Props

Concept target:

- Support modular arena objectives without each arena needing bespoke visual rules.
- Every objective prop needs three readable states: inactive, active, completed/corrupted.
- Props should read clearly under horde pressure and co-op labels at 48px, 64px, 96px, and 128px scale.
- Frontier-lab objects use clean hard geometry. A.G.I. pressure uses purple organic corruption and impossible curves.

Production assets to prepare:

- `prop.objective.patch_tower_v1`: compile/survival hold objective.
- `prop.objective.recompile_relay_v1`: revive/recompile objective and regroup support.
- `prop.objective.split_hold_anchor_v1`: role-pressure anchor from Milestone 29.
- `prop.objective.regroup_beacon_v1`: regroup window and party rally marker.
- `prop.objective.breach_seal_v1`: boss gate or corruption closure.
- `prop.objective.region_utility_props_v1`: cooling valve, transit signal, verdict seal, cache terminal.

PixelLab/local cleanup seed:

```text
Original isometric pixel-art objective prop atlas for AGI: The Last Alignment. Transparent background. Modular sci-fi props in inactive, active, and completed states: reality patch tower, recompile relay, split-hold anchor, regroup beacon, data cache, breach seal, cooling valve, transit signal, verdict seal. Readable at 64px to 128px. Clean white/graphite frontier-lab hardware, cyan active energy, amber caution, purple alien corruption completed state. No official logos, no text, no copied icons.
```

Integration note:

- Import `split_hold_anchor`, `regroup_beacon`, and `recompile_relay` first. They directly clarify the newest online role-pressure and revive loop.

## Milestone 32: Class And Co-Mind Identity

Concept target:

- Make build identity feel like `Combat Class + Frontier Faction Co-Mind`, not just stat cards.
- Prioritize role readability: speed, support, boss killer, revive, defense, prediction/control, swarm.
- Keep official logos out of class sprites and co-mind modules. Use original module shapes for runtime until official logos are separately tracked as third-party/parody UI identifiers.
- Treat generated class/co-mind labels and marks as provisional. The integration thread should implement canonical text from content data.

Production assets to prepare:

- `ui.build_identity.class_role_chips_v1`: speed, support, boss, revive, defense, swarm, control.
- `ui.build_identity.comind_module_icons_v1`: original placeholder module icons for OpenAI Accord, Safeguard, Gemini Array, Open Herd, and later factions.
- `ui.build_identity.loadout_chips_v1`: small class/co-mind combination chips for build select and Save Profile UI.
- `player.*.production_walk_sheet`: only after PixelLab/manual cleanup for each class, not from the concept board.

PixelLab/local cleanup seed:

```text
Original pixel-art class and co-mind identity icon atlas for AGI: The Last Alignment. Transparent background. Class role chips for speed, support, boss killer, revive, defense, swarm, control. Co-mind module icons using original parody-coded geometric shapes for OpenAI Accord, Safeguard, Gemini Array, Open Herd, no official logos. Crisp 32px and 48px icons, black/white/cyan sci-fi UI with faction accent colors. No text, no copied brand marks, no mascots.
```

Integration note:

- Import identity chips before full new class sprites. Chips unlock visible build differentiation with lower art risk and can be reused across build select, save profile, route rewards, and online party HUD.

## Recommended Import Order

1. `ui.save_profile.import_export_icons_v1` and `ui.save_profile.reward_badges_v1` for Milestone 30.
2. `prop.objective.split_hold_anchor_v1`, `prop.objective.regroup_beacon_v1`, and `prop.objective.recompile_relay_v1` for Milestone 31 role-pressure clarity.
3. `prop.alignment_grid.route_state_markers_v2` and `ui.route_map.party_vote_pips_v1` for route map polish.
4. `ui.build_identity.class_role_chips_v1` and `ui.build_identity.comind_module_icons_v1` for Milestone 32.
5. Full class sprite sheets after PixelLab generation and manual cleanup, one class at a time.
6. Official third-party logos only after source URLs, download dates, ownership notes, and `mitIncluded: false` manifest entries are completed.
