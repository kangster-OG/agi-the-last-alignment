# Deployment Runbook

This project can be hosted as a free browser game with a Vite static client and a Colyseus Consensus Cell server.

## Build

```bash
npm ci
npm run build
```

## Single-Service Node Hosting

Use this when the host supports a long-running Node process and WebSockets on the same public origin.

```bash
SERVE_STATIC_DIST=1 npm start
```

In this mode the browser uses the current page origin for online co-op WebSockets unless `?coopServer=...` or `VITE_CONSENSUS_URL` overrides it. This is the preferred path for Render-style Node services.

Environment:

- `PORT`: public web process port supplied by the host.
- `CONSENSUS_PORT`: optional override; `PORT` is used when this is absent.
- `CONSENSUS_HOST`: bind host, default `0.0.0.0`.
- `SERVE_STATIC_DIST=1`: serves `dist/` from the same server that owns the Colyseus room.

Health check:

```text
/healthz
```

The health response includes the M55 deployment policy, 4-player room cap, server tick rate, input cadence, and static-dist mode.

## Split Static Client And Colyseus Server

Use this when the host separates static sites and WebSocket services.

Client build environment:

```bash
VITE_CONSENSUS_URL=wss://your-consensus-cell-server.example.com npm run build
```

The browser also accepts a proof/development query override:

```text
?coopServer=wss://your-consensus-cell-server.example.com
```

## Room Codes

Online co-op uses Colyseus `joinOrCreate` filtered by room code.

```text
?roomCode=TEAM123
```

Players with the same room code join the same Consensus Cell. Different room codes create isolated rooms. If no room code is provided, the client uses `PUBLIC`.

## Persistence Boundary

No login, signup, cloud save, or account state is required. Export/import remains route-profile-only via the `AGI1_` code. Room code, reconnect key, live combat, objectives, selected build kits, cooldowns, pets, role pressure, Recompile state, dialogue state, route UI focus, portal params, and authority state are not exported or imported.
