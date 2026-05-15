# Autobattle Objective Variety Goal

Date: 2026-05-12

Purpose: turn the Megabonk / famous horde-survival research direction into an implementation goal for `AGI: The Last Alignment` without redesigning away from autocombat, horde pressure, drafts, bosses, extraction, Free Alignment, campaign unlocks, or the dense Alignment Grid.

## Goal

Campaign levels should feel like a survivor roguelite first: dense horde pressure, fast movement decisions, quirky map verbs, and one understandable objective per run.

The loop remains:

`Survive -> build power -> complete one map objective -> beat or escape boss pressure -> extract -> unlock next thing`.

The change is that the objective family should rotate. "Stand next to a thing until it fills" is now only the tutorial baseline, not the template for the full campaign.

## Objective Families

- Anchor Tutorial: baseline stand-and-stabilize, used to teach the first level.
- Hazard Lure: kite a dangerous map element into the objective for faster progress.
- Route Window: ride a moving/timed route opening instead of camping a point.
- Timed Crossing: wait for a safe signal window, cross, then cash progress.
- Boss Gate Hunt: complete map interactables that reveal or weaken the boss/event gate.
- Carry And Extract: recover evidence/memory, route it through safer or riskier lanes, then extract.
- Risk Holdout: hold during a good window and leave before punishment.
- Environmental Weapon: align the map so it damages or pressures the horde for you.
- Campaign Remix: finale level replays prior objective rules as A.G.I. prediction pressure.

## Campaign Mapping

- Armistice Plaza: Anchor Tutorial.
- Cooling Lake Nine: Hazard Lure with live coolant/cable/vent surges and Server Buoys.
- Transit Loop Zero: Route Window with aligned tracks, arrival windows, and false schedules.
- Signal Coast: Timed Crossing with clear signal windows and relay tuning.
- Blackwater Beacon: Boss Gate Hunt with antenna retunes, Signal Tower warnings, and Maw pressure.
- Memory Cache 001: Carry And Extract with recall pockets, risky shortcuts, and Recovered Route Memory.
- Guardrail Forge: Risk Holdout with calibration windows and overload exits.
- Glass Sunfield: Environmental Weapon with shade/prism timing and reflection pressure.
- Archive of Unsaid Things: Evidence Carry with writ preservation, appeal windows, and court extraction.
- Appeal Court Ruins: Public Ruling Window with objection windows and verdict beams.
- Alignment Spire Finale: Campaign Remix with prior route rules replayed as prediction paths and boss echoes.

## Implementation Contract

- `src/content/campaignObjectiveVariety.ts` is the shared objective-variety source of truth.
- Briefing must show the style and mechanic in plain player language.
- HUD guidance must recommend the style action, not only "move to objective."
- Runtime objective summaries and `window.render_game_to_text()` must expose style, mechanic, and proof hooks.
- Summary/reward UI must name the objective style before lore flavor.
- Small runtime hooks may widen or boost objective progress during the correct map window, but existing proofed level loops should remain stable.
- Production art does not change in this goal. No code-authored expressive art is introduced.

## Proof

Required targeted proof:

- `npm run proof:objective-variety`

Regression proofs to keep green when touching campaign clarity or progression:

- `npm run proof:campaign-clarity`
- `npm run proof:overworld`
- `npm run proof:solo-campaign-unlocks`

The proof should enforce that the campaign has at least seven distinct objective styles, that only the tutorial relies on static capture, and that briefing, HUD, summary, runtime, and telemetry are wired to the objective-variety contract.
