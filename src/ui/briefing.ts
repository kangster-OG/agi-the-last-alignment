import { Graphics, Text } from "pixi.js";
import { fontStyle, palette } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { ARENAS } from "../level/arenas";
import { BOSSES } from "../content/bosses";
import { FACTIONS } from "../content/factions";
import { clearAllLayers } from "../render/layers";

export class ArenaBriefingState implements GameState {
  readonly mode = "ArenaBriefing" as const;

  constructor(private readonly nodeId: string, private readonly arenaId: string) {}

  enter(game: Game): void {
    this.render(game);
  }

  exit(): void {}

  update(game: Game): void {
    if (game.input.wasPressed("interact")) {
      game.state.set(game.createRun(this.nodeId, this.arenaId));
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);

    const arena = ARENAS[this.arenaId];
    const boss = arena.bossId ? BOSSES[arena.bossId] : undefined;
    const factions = arena.factionFocusIds.map((id) => FACTIONS[id]?.shortName ?? id).join(" + ");

    const bg = new Graphics();
    bg.rect(0, 0, game.width, game.height).fill(0x111820);
    bg.rect(0, 0, game.width, game.height).fill({ color: palette.blue, alpha: 0.08 });
    bg.rect(game.width / 2 - 360, game.height / 2 - 210, 720, 420)
      .fill({ color: palette.ink, alpha: 0.92 })
      .stroke({ color: palette.mint, width: 4 });
    bg.rect(game.width / 2 - 320, game.height / 2 - 168, 640, 72)
      .fill({ color: 0x182d36, alpha: 0.95 })
      .stroke({ color: palette.paper, width: 2 });
    game.layers.hud.addChild(bg);

    const title = new Text({
      text: arena.name.toUpperCase(),
      style: { ...fontStyle, fontSize: 32, fill: "#ffd166", align: "center" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, game.height / 2 - 132);
    game.layers.hud.addChild(title);

    const meta = new Text({
      text: `ALIGNMENT NODE // ${factions}\nBoss signature: ${boss?.displayName ?? "unknown"}`,
      style: { ...fontStyle, fontSize: 15, align: "center", fill: "#64e0b4" }
    });
    meta.anchor.set(0.5);
    meta.position.set(game.width / 2, game.height / 2 - 72);
    game.layers.hud.addChild(meta);

    const body = new Text({
      text: `${arena.briefingLines.join("\n")}\n\nObjective: survive while the local reality patch compiles.\nEnemies drop Coherence Shards. Do not align with the wrong AGI.`,
      style: { ...fontStyle, fontSize: 18, align: "center", wordWrap: true, wordWrapWidth: 610 }
    });
    body.anchor.set(0.5);
    body.position.set(game.width / 2, game.height / 2 + 38);
    game.layers.hud.addChild(body);

    const hint = new Text({
      text: "Enter: deploy Alignment Frame",
      style: { ...fontStyle, fontSize: 16, fill: "#ffd166" }
    });
    hint.anchor.set(0.5);
    hint.position.set(game.width / 2, game.height / 2 + 164);
    game.layers.hud.addChild(hint);
  }
}
