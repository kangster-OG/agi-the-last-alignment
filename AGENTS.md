# Codex Project Context

Before making meaningful gameplay, visual, worldbuilding, or architecture changes, read:

- `docs/AGI_The_Last_Alignment_Creative_Bible.md`
- `docs/GAME_DIRECTION.md`
- `docs/COPY_VOICE_DIRECTION.md`
- `docs/AUTOBATTLE_OBJECTIVE_VARIETY_GOAL.md`
- `docs/AGI_IMPLEMENTATION_PLAN.md`
- `docs/FRESH_THREAD_CURRENT_STATE.md`
- `docs/FRESH_THREAD_NEXT_STEPS.md`
- `docs/CODEX_CONTINUITY_LEDGER.md`
- `docs/ENEMY_MOB_DIFFERENTIATION_PLAN.md`
- `docs/CAMPAIGN_CLARITY_REFACTOR_CHECKLIST.md`
- `docs/BUILD_ARCHETYPES_AND_ITEMIZATION.md`
- `docs/ECO_GUARDIAN_TECH_BROS_MECHANICS_LEARNINGS.md`
- `docs/PIXELLAB_AUTOMATION_WORKFLOW.md`
- `progress.md`

Before continuing the Armistice visual-art rebuild or using Armistice as the art baseline for new levels/bosses/enemies, also read:

- `docs/ART_REBUILD_HANDOFF.md`
- `docs/ARMISTICE_ACCEPTED_ART_BASELINE.md`
- `docs/FRESH_THREAD_CURRENT_STATE.md`
- `docs/CODEX_CONTINUITY_LEDGER.md`
- `docs/VISUAL_FIDELITY_VERTICAL_SLICE.md`
- `ART_PROVENANCE.md`

Before packaging, deploying, or submitting the game to Cursor Vibe Jam 2026, read:

- `docs/VIBEJAM_2026.md`

This project is `AGI: The Last Alignment`, a free browser-playable 2D isometric pixel-art horde-survival roguelite with a dense overworld map connecting much larger survival/exploration levels.

## Non-Negotiable Direction

- The primary reference format is the pair of X/Twitter gameplay clips from TheJohnnyStaley that the user provided on April 30, 2026. Use them as inspiration for camera language, overworld structure, UI density, chunky isometric pixel-art presentation, and horde-survival pacing.
- The Creative Bible is now the source of truth for the game identity: humans and frontier AI labs form The Last Alignment to fight A.G.I., the Alien God Intelligence.
- `docs/COPY_VOICE_DIRECTION.md` is now the source of truth for player-facing copy voice. Future game copy should be original sardonic AGI dungeon-crawl parody: mechanically clear first, funny/sarcastic second, and constantly roasting A.G.I., frontier labs, corporate safety theater, bosses, objectives, rewards, and the player's terrible little job.
- Do not copy protected names, characters, portraits, brands, UI art, maps, jokes, or expressive content from those clips or any existing game. We are making our own lore, characters, factions, art assets, setting, and mechanics.
- Real frontier lab names are used as broad fictional/parody factions per the Creative Bible. The user wants official logos used for parody/faction presentation. Treat logos as third-party/parody brand assets with provenance and disclaimers, not as original MIT-created artwork.
- The current snack/coupon/receipt theme is placeholder only. Replace it with AGI content.
- The game should feel like a dense isometric diorama, not a sparse prototype board.
- Maps and individual levels must become much, much bigger than the current milestone arena. Avoid single-screen combat boxes.
- Larger maps must not be solved by pulling the combat camera far back. Normal arena play should keep a close tactical isometric crop comparable to the reference point of view, with the camera following through a much larger world.
- Co-op is part of the game direction. Target 1-4 players per run/session.
- Use Colyseus as the intended multiplayer framework when networking is implemented. Treat "Colossus" mentions from conversation as referring to Colyseus.
- Asset workflow target: ChatGPT Images for art direction, PixelLab for production pixel assets, manual cleanup in Aseprite or Pixelorama. For PixelLab login, use an automated browser and let the user log in manually.
- PixelLab automation rule: use the dedicated `.codex-local/pixellab-automation-profile` browser profile and recovered API export workflow in `docs/PIXELLAB_AUTOMATION_WORKFLOW.md`; do not operate on the user's main Chrome profile or give up on export before checking the dedicated profile/API path.
- Production-art source rule: do not use Pillow, Python drawing, Pixi Graphics, SVG, CSS, procedural generation, filters, recolors, overlays, gradients, or any other code-authored shortcut to create or improve expressive gameplay art, terrain, props, actors, bosses, VFX, or UI. Visual improvements must originate from ChatGPT Images, PixelLab, Aseprite, Pixelorama, or another explicit art-source tool first.
- Code/Pillow may only package already-approved source art: slicing/cropping, alpha or chroma-key cleanup, padding, anchor normalization, nearest-neighbor resizing after source approval, atlas/contact-sheet packing, validation, and proof generation. If the source art is not good enough, stop and use ChatGPT Images/PixelLab/manual cleanup; if those are blocked, report the blocker instead of faking production art with code.
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
