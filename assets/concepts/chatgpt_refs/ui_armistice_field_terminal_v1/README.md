# Armistice Field Terminal UI V1

Date: 2026-05-06

Purpose: corrective UI source-art pass after playtest feedback that the HUD, dialogue, pickup callouts, route/draft boards, and camp/summary panels did not match the accepted Armistice art baseline.

## Reference Lesson

The Eco Guardian and Tech Bros playthroughs clarified that their UI works because every surface uses one material grammar across menus, dialogue, HUD, stage prompts, item boards, and end screens. For AGI, the UI should feel like physical Armistice hardware and treaty infrastructure, not a separate clean overlay skin.

## Source Boards

- `armistice_field_terminal_ui_source_v1.png`: first Armistice material-kit source board. Useful as art direction, but rejected for runtime packing because many components contained sample text and decorative content that smeared when nine-sliced.
- `armistice_field_terminal_ui_source_v2_blank.png`: accepted blank-component board generated with ChatGPT Images. Components have empty interiors and Armistice-derived physical edges: cracked treaty stone, chipped civic ceramic, emergency terminal glass, oxidized metal, hazard strips, cyan signal lights, blue shard accents, red breach hardware, bolts, cables, tape, scratches, and dust.

## Runtime Pack

Packed by `scripts/assets/pack-armistice-ui-kit-v1.py`.

Runtime output:

- `assets/ui/armistice_field_terminal_ui_v1.png`

The packer mechanically crops, resizes, and packs source components into a Pixi runtime atlas. It does not draw expressive UI art in code. Runtime `src/ui/fieldKit.ts` uses source-backed sprites/nine-slice panels, meter frames, token medallions, connector strips, and badges, with code only supplying functional text and meter fill state.

## Live Rejection

User playtest/screenshots on 2026-05-06 rejected the packed runtime atlas direction. Even though the source board was mechanically packed from approved tooling, the active result read as noisy white slabs pasted over the Armistice playfield, made the font harder to read, and did not feel premium or cohesive against gameplay.

Current runtime status: `assets/ui/armistice_field_terminal_ui_v1.png` is retained as provenance/reference only and is not loaded by the active UI path. `src/ui/fieldKit.ts` now uses a restrained functional dark field interface as a readability baseline while final production UI art direction is revisited through a stronger source-art process.

## Prompt Intent

Create original blank reusable pixel-art UI components for `AGI: The Last Alignment` using the accepted Armistice material language. The components should feel like in-world terminal/treaty-board hardware that could sit beside the emergency alignment terminal, treaty monument, barricades, coherence shards, and breach warnings.

Avoid copying Eco Guardian, Tech Bros, or any other game UI. They were used only to understand cohesion.

## Acceptance Notes

- Blank interiors are required so runtime text remains readable.
- UI chrome must be cohesive with Armistice but reusable across future levels.
- HUD should stay compact and protect the playfield.
- Dialogue, route, draft, camp, and summary boards should feel like physical game-world devices.
- The V1 packed atlas does not satisfy those notes in live play and should not be used as the accepted production UI baseline.
