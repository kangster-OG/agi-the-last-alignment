# Co-op And Networking Direction

This document captures the durable co-op decision from April 30, 2026.

## Decision

Co-op is part of the game direction. In-world, co-op is called:

# Consensus Cell Mode

Target support:

- 1-4 players per run/session.
- Solo play remains valid.
- Co-op should feel native to the game, not like a late bolt-on.

Networking framework:

- Use Colyseus when multiplayer is implemented.
- If the word "Colossus" appears in notes or conversation, treat it as referring to Colyseus.
- Colyseus room `maxClients` should be set to 4 for our intended co-op mode unless the user later changes the design.

## Intended Multiplayer Model

Use an authoritative room/server model:

- Colyseus room owns canonical run state.
- Clients send input intents, upgrade choices, and menu/interaction actions.
- Server advances shared gameplay state.
- Clients render interpolated state in PixiJS.
- Avoid trusting clients for damage, XP, boss state, enemy spawns, pickups, or completion.

## Co-op Product Shape

Co-op should support:

- Shared overworld party/session flow.
- Entering a level as a group.
- Shared large-map survival/exploration arenas.
- Enemy pressure scaling by player count.
- Multiple player silhouettes/colors/identifiers.
- Shared or semi-shared XP/upgrades, to be decided later.
- Revive/downed/death rules, to be decided later.
- Boss/miniboss events that account for multiple players.
- A shared `Consensus Burst` meter charged by Coherence Shards.
- Faction-combo burst effects, such as `Refusal Guardrail`, `Meme Fork Uprising`, `Low-Latency Killchain`, `Multilingual Science Laser`, and `Last Alignment Burst`.
- Revive flow called `Recompile Ally`.

Open product questions:

- Does one player host/select overworld nodes, or does the party vote/ready up?
- Are upgrades individual, shared, or a mix?
- Does XP collect globally, locally, or by proximity?
- Does the camera stay per-client, shared, or hybrid?
- What happens when players split far apart on very large maps?
- How do revives, death, and level completion work?

Creative Bible default language:

- Downed player: flickering ghost-frame.
- Revive UI: `ALLY FORK UNSTABLE` / `RECOMPILE BEFORE THEY BECOME LORE`.

## Technical Implications

The current prototype is local single-player only. Future networking work should avoid rewriting everything at once.

Recommended migration path:

1. Separate pure simulation from Pixi rendering.
2. Represent all player inputs as serializable commands.
3. Support multiple local player entities in the simulation.
4. Add deterministic/server-friendly enemy, pickup, projectile, and upgrade state.
5. Add Colyseus server package/room.
6. Connect one Pixi client to a local Colyseus room.
7. Add second client support.
8. Scale to 4 clients and add proof scripts for multiplayer smoke tests.

## Current Prototype Status Through Milestone 55

The online prototype now has server-owned combat-critical state, campaign route authority, and deployment-oriented room joining:

- Colyseus room snapshots report `schemaVersion: 4`.
- `networkAuthority` reports `colyseus_room_server_combat`.
- The room owns synced players, enemies, projectiles, Coherence Shard pickups, objectives, role pressure, Recompile Ally, Consensus Burst, rewards, route progression, boss events, and completion summaries.
- Clients render synced gameplay state with production-art defaults and placeholder opt-outs.
- Room codes use Colyseus `joinOrCreate` filtering. `?roomCode=TEAM123` joins or creates an isolated Consensus Cell; the default is `PUBLIC`.
- `R` reconnects to the Consensus Cell and `Esc` leaves online co-op back to the main menu.
- `/healthz` exposes deployment health and M55 robustness metadata for hosted checks.
- `SERVE_STATIC_DIST=1 npm start` can serve the built Vite client and Colyseus server from one Node process.

Still future work:

- hosted production deployment and public URL validation;
- final release proof/performance/accessibility lock;
- final VibeJam widget/submission packaging.

Important constraints:

- Keep simulation state compact enough to sync efficiently.
- Do not sync every particle, damage pip, or purely cosmetic effect as canonical state.
- Use client-side visual prediction/interpolation where needed, but keep gameplay authority server-side.
- Continue supporting `window.render_game_to_text()` and deterministic proof helpers for local/dev testing.

## Colyseus Notes

Colyseus does not impose a fixed 4-player limit by default. Rooms define their own `maxClients`.

For this game, the intended co-op design is:

```ts
maxClients = 4;
```

That is a product decision, not a framework limit.
