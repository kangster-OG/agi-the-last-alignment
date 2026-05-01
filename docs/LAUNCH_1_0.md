# AGI: The Last Alignment 1.0 Launch

Launch date: May 1, 2026.

Public source repo:

- https://github.com/kangster-OG/agi-the-last-alignment

Stable browser URL:

- https://kangster-og.github.io/agi-the-last-alignment/

## Launch Scope

- Free browser-playable 2D isometric horde-survival campaign.
- Solo play and local co-op remain available on the public static build.
- Online Colyseus co-op remains in the source build, proof suite, and Render single-service Blueprint.
- Production-art defaults remain enabled, with placeholder opt-outs preserved.
- Browser-local route profile and export-code persistence remain route-profile-only.
- `render_game_to_text()` and `advanceTime(ms)` remain available for deterministic proof.
- Vibe Jam 2026 widget is included in the deployed HTML.

## Deployment Notes

The submitted URL is hosted on GitHub Pages because the local environment did not have an authenticated Render account, Render API key, Render CLI, or another authenticated Node/WebSocket host available during launch packaging.

`render.yaml` remains committed for the preferred WebSocket-capable deployment path:

```bash
npm ci
npm run build
SERVE_STATIC_DIST=1 npm start
```

The GitHub Pages URL is the stable no-login public browser build. It does not host the Colyseus server at the same origin, so the deployed online smoke is marked as static-host unsupported in the M58 launch proof. Online co-op is still preserved and proofed through the local authoritative server gates.

## Known Limitations

- Static GitHub Pages hosting does not run the Colyseus server.
- The Render Blueprint needs Render account authentication before it can become the preferred single-service public deployment.
- Persistence is intentionally browser-local/export-code only; no cloud account persistence is implied.
- Production art is limited to cleaned transparent PNGs that have manifest/provenance support.

## Final Release Gate

Required local checks:

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
