# Release Candidate Checklist

Release candidate: `AGI: The Last Alignment` 1.0 RC for Cursor Vibe Jam 2026.

## Required Submission Properties

- Free browser-playable game.
- No login or signup required.
- Production-art defaults enabled.
- Placeholder opt-outs preserved for proofs/debugging.
- Solo, local co-op, and online Colyseus Consensus Cell remain available.
- Required Vibe Jam widget present in `index.html`.
- Browser-local/export-code persistence only.
- Official/faction brand references remain parody/provenance-tracked and unaffiliated.

## Release Commands

```bash
npm ci
npm run build
npm run proof:assets
npm run proof:release-checklist
npm run proof:campaign-full
npm run proof:milestone56-quality-lock
npm run proof:milestone55-online-robustness
npm run proof:smoke
```

## Deployment Shape

Preferred RC deployment is the single-service Node mode:

```bash
SERVE_STATIC_DIST=1 npm start
```

This serves the built Vite client and Colyseus WebSocket server from one public origin and exposes `/healthz`.

Split static/WebSocket hosting remains supported with `VITE_CONSENSUS_URL`.

## Known Limitations

- Persistence is prototype-local/export-code route profile only; there is no account, cloud save, or cross-device automatic sync.
- Online co-op uses room codes and a single authoritative Colyseus room process; it is not a globally scaled matchmaking service.
- Production art is original generated/cleaned pixel art where manifest/provenance marks runtime readiness; placeholder opt-outs remain for compatibility.
- Third-party lab/logo references are satirical faction references with provenance/disclaimer handling, not endorsements.

## Final Gate Before Submission

Before the final VibeJam form submission, verify the deployed URL:

- loads without login/signup;
- includes the VibeJam widget in the deployed DOM;
- preserves `render_game_to_text` and `advanceTime`;
- completes at least one solo flow;
- completes one online co-op smoke flow if the deployed environment supports the server;
- has no blank canvas, broken layout, unreadable text, or missing UI in final screenshots.

