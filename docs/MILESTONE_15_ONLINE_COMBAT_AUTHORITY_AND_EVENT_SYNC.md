# Milestone 15: Online Combat Authority and Boss/Event Sync

## Goal

Move online Consensus Cell mode beyond presentation hooks by making combat-critical objects server-owned and synced to every client.

## Implemented Scope

- Upgraded the Colyseus snapshot payload to schema version 2 for online combat.
- The `consensus_cell` room now owns and broadcasts:
  - player HP, XP, level, facing, velocity, and input sequence;
  - enemy movement and server-side enemy deaths;
  - authoritative refusal-shard projectiles;
  - authoritative Coherence Shard pickups and shared pickup collection counters;
  - Oath-Eater boss spawn state;
  - Broken Promise zones;
  - Treaty Charge warning/impact state;
  - combat phase, pressure, projectile count, pickup count, kills, and boss-event activity.
- Online clients render server-owned projectiles, pickups, boss labels, Broken Promise zones, and Treaty Charge warnings with the existing Milestone 14 production-art set.
- `window.render_game_to_text()` now exposes online server-combat state through:
  - `online.schemaVersion`
  - `online.networkAuthority`
  - `online.combat`
  - `level.bossMechanics`
  - synced `projectiles`
  - synced `pickups`
- Online UX polish:
  - `R` reconnects to the Consensus Cell.
  - `Esc` leaves online co-op and returns to the main menu.
  - The online HUD and text proof state expose those controls.
- The existing production-art default remains unchanged. The art set still reports `milestone14_combat_art_parity`; Milestone 15 changes network authority and sync behavior rather than adding a new art batch.

## Runtime Defaults

Online co-op remains available from the main menu with `C`.

Default production art and Armistice Plaza tiles remain enabled by default. Placeholder/debug opt-outs remain:

- `?productionArt=0`
- `?placeholderArt=1`
- `?armisticeTiles=0`
- `?placeholderTiles=1`

## Proof Expectations

Milestone 15 should pass:

- `npm run build`
- `npm run proof:assets`
- `npm run proof:milestone15-online-combat`
- `npm run proof:network`
- default smoke/movement/overworld/horde/upgrade/boss/co-op/full proofs
- existing Milestone 10-14 art/default proofs

## Visual Proofs

Key proof captures:

- `docs/proof/milestone15-online-combat/milestone15-server-combat-a.png`
- `docs/proof/milestone15-online-combat/milestone15-server-combat-b.png`
- `docs/proof/milestone15-online-combat/milestone15-pickups.png`
- `docs/proof/milestone15-online-combat/milestone15-boss-event-a.png`
- `docs/proof/milestone15-online-combat/milestone15-boss-event-b.png`

## Remaining Risks

- Online upgrades are still not server-authored.
- Online run completion, party overworld flow, revive/downed rules, and ready/vote flow are still future work.
- The server still broadcasts compact snapshots by message rather than migrating all combat state to Colyseus Schema collections.
- Client-side combat particles/damage pips remain cosmetic and are derived from synced gameplay state rather than sent as canonical state.
