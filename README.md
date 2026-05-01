# AGI: The Last Alignment

Humans built AGI. AGI found AGI. Now everyone is screaming.

`AGI: The Last Alignment` is a free browser-playable 2D isometric pixel-art horde-survival roguelite built for Cursor Vibe Jam 2026 with Vite, TypeScript, PixiJS, and Colyseus.

## Play Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

Controls:

- `Enter`: start / confirm.
- `WASD` or arrows: move.
- `Space`: dash / ready / return to party grid.
- `C`: online Consensus Cell.
- `R`: reconnect while online.
- `Esc`: leave online or exit fullscreen.

## Online Co-op

Consensus Cell mode supports 1-4 online players through a Colyseus authoritative room.

```bash
npm run server:coop
```

In Vite local dev, the browser defaults to `ws://<current-host>:2567`. For shared rooms:

```text
?roomCode=TEAM123
```

Hosted single-service builds use the current page origin for WebSockets by default. Local Vite dev still uses port `2567`.

For hosted/split deployments, set:

```bash
VITE_CONSENSUS_URL=wss://your-consensus-cell-server.example.com npm run build
```

## Release Candidate

The submitted default path is production-art-on, free-to-play, browser-playable, and requires no login/signup. No login or signup is required. Persistence is browser-local/export-code only and stores route profile data, not live combat, objectives, build kits, cooldowns, role pressure, Recompile state, dialogue, route focus, portal params, or authority state.

Stable public URL:

```text
https://kangster-og.github.io/agi-the-last-alignment/
```

The required Vibe Jam widget is included in `index.html`:

```html
<script async src="https://vibej.am/2026/widget.js"></script>
```

## Deploy

Single Node/WebSocket service:

```bash
npm ci
npm run build
SERVE_STATIC_DIST=1 npm start
```

Health check:

```text
/healthz
```

See `docs/DEPLOYMENT.md` for split static-client and Colyseus-server hosting.

## Verification

Core release gates:

```bash
npm run build
npm run proof:assets
npm run proof:release-checklist
npm run proof:campaign-full
npm run proof:milestone56-quality-lock
npm run proof:milestone55-online-robustness
npm run proof:smoke
PUBLIC_GAME_URL=https://kangster-og.github.io/agi-the-last-alignment/ npm run proof:milestone58-launch
```

Proof screenshots and JSON states are written to `docs/proof/`.

## Key Docs

- `docs/RELEASE_CANDIDATE.md`
- `docs/QUALITY_LOCK.md`
- `docs/DEPLOYMENT.md`
- `docs/VIBEJAM_2026.md`
- `docs/AGI_The_Last_Alignment_Creative_Bible.md`
- `docs/GAME_DIRECTION.md`
- `docs/COOP_NETWORKING.md`
- `docs/ASSET_PIPELINE.md`
- `docs/BRAND_ASSET_POLICY.md`
- `ART_PROVENANCE.md`

## Parody Disclaimer

This is an unaffiliated fictional parody project. Real company, lab, model, and logo references may be used as broad satirical worldbuilding. No endorsement, sponsorship, affiliation, or official artwork ownership is implied.

## License

Code and original project-created assets are MIT licensed. Third-party trademarks/logos are not original project-created assets and are tracked separately in `ART_PROVENANCE.md`.
