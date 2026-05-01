# Codex Project Context

Before making meaningful gameplay, visual, worldbuilding, or architecture changes, read:

- `docs/AGI_The_Last_Alignment_Creative_Bible.md`
- `docs/GAME_DIRECTION.md`
- `docs/AGI_IMPLEMENTATION_PLAN.md`
- `progress.md`

Before packaging, deploying, or submitting the game to Cursor Vibe Jam 2026, read:

- `docs/VIBEJAM_2026.md`

This project is `AGI: The Last Alignment`, a free browser-playable 2D isometric pixel-art horde-survival roguelite with a dense overworld map connecting much larger survival/exploration levels.

## Non-Negotiable Direction

- The primary reference format is the pair of X/Twitter gameplay clips from TheJohnnyStaley that the user provided on April 30, 2026. Use them as inspiration for camera language, overworld structure, UI density, chunky isometric pixel-art presentation, and horde-survival pacing.
- The Creative Bible is now the source of truth for the game identity: humans and frontier AI labs form The Last Alignment to fight A.G.I., the Alien God Intelligence.
- Do not copy protected names, characters, portraits, brands, UI art, maps, jokes, or expressive content from those clips or any existing game. We are making our own lore, characters, factions, art assets, setting, and mechanics.
- Real frontier lab names are used as broad fictional/parody factions per the Creative Bible. The user wants official logos used for parody/faction presentation. Treat logos as third-party/parody brand assets with provenance and disclaimers, not as original MIT-created artwork.
- The current snack/coupon/receipt theme is placeholder only. Replace it with AGI content.
- The game should feel like a dense isometric diorama, not a sparse prototype board.
- Maps and individual levels must become much, much bigger than the current milestone arena. Avoid single-screen combat boxes.
- Co-op is part of the game direction. Target 1-4 players per run/session.
- Use Colyseus as the intended multiplayer framework when networking is implemented. Treat "Colossus" mentions from conversation as referring to Colyseus.
- Asset workflow target: ChatGPT Images for art direction, PixelLab for production pixel assets, manual cleanup in Aseprite or Pixelorama. For PixelLab login, use an automated browser and let the user log in manually.
- Preserve deterministic proof hooks: `window.render_game_to_text()` and `window.advanceTime(ms)`.
- Keep the stack: Vite, TypeScript, PixiJS, custom lightweight 2D gameplay math. No physics engine unless explicitly approved.

## Current Prototype Role

The existing implementation is a working vertical slice, not the final creative identity. It proves:

- PixiJS boots and renders.
- Isometric projection/camera works.
- Overworld node entry works.
- Arena combat, enemies, pickups, upgrades, miniboss, completion/death flow work.
- Playwright proof scripts produce screenshots and state artifacts.

Future work should evolve the prototype toward the durable direction in `docs/GAME_DIRECTION.md` and `docs/AGI_IMPLEMENTATION_PLAN.md`, especially replacing placeholder content with AGI content, larger maps, richer overworld landmarks, stronger UI grammar, and eventual original art.

For multiplayer-specific direction, read `docs/COOP_NETWORKING.md`.

For official logo / brand asset handling, read `docs/BRAND_ASSET_POLICY.md`.

The next intended implementation milestone is `docs/MILESTONE_3_LARGE_MAP_FOUNDATION.md`.
