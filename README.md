# AGI: The Last Alignment

Humans built AGI. AGI found AGI. Now everyone is screaming.

`AGI: The Last Alignment` is a free browser-playable 2D isometric pixel-art horde-survival roguelite built with Vite, TypeScript, and PixiJS.

The current repo contains a playable prototype foundation: an isometric overworld, an arena run, auto-combat, Coherence Shards, emergency patch drafts, a first boss event, completion/death flow, deterministic proof hooks, and Playwright proof scripts.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Verification

```bash
npm run build
npm run proof:smoke
npm run proof:movement
npm run proof:overworld
npm run proof:horde
npm run proof:upgrades
npm run proof:boss
npm run proof:full
```

Proof screenshots and JSON states are written to `docs/proof/`.

## Key Docs

- `AGENTS.md`
- `docs/AGI_The_Last_Alignment_Creative_Bible.md`
- `docs/AGI_IMPLEMENTATION_PLAN.md`
- `docs/GAME_DIRECTION.md`
- `docs/COOP_NETWORKING.md`
- `docs/ASSET_PIPELINE.md`
- `docs/BRAND_ASSET_POLICY.md`
- `ART_PROVENANCE.md`

## Parody Disclaimer

This is an unaffiliated fictional parody project. Real company, lab, model, and logo references may be used for satirical worldbuilding. No endorsement, sponsorship, or affiliation by any referenced organization is implied.

## License

Code and original project-created assets are intended to be MIT licensed. Third-party trademarks/logos, if added, are not original project-created assets and should be tracked separately in `ART_PROVENANCE.md`.
