import { Text } from "pixi.js";
import { fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { ARENAS } from "../level/arenas";
import { BOSSES } from "../content/bosses";
import { FACTIONS } from "../content/factions";
import { clearAllLayers } from "../render/layers";
import { drawFieldBackdrop, drawFieldPanel, drawToken, fieldKit, fieldText } from "./fieldKit";

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

    drawFieldBackdrop(game.layers.hud, game.width, game.height, "LAST ALIGNMENT // DEPLOYMENT TERMINAL");
    drawFieldPanel(game.layers.hud, game.width / 2 - 380, game.height / 2 - 226, 760, 452, {
      title: "ALIGNMENT NODE BRIEFING",
      kicker: factions,
      tone: "teal",
      selected: true,
      headerHeight: 68,
      signalTabs: true
    });
    drawToken(game.layers.hud, game.width / 2 - 338, game.height / 2 - 134, "AGI", "red", false);
    drawToken(game.layers.hud, game.width / 2 + 300, game.height / 2 - 134, "GO", "teal", true);

    const title = new Text({
      text: arena.name.toUpperCase(),
      style: { ...fontStyle, fontSize: 32, fill: fieldKit.text, stroke: { color: "#030609", width: 4 }, align: "center" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, game.height / 2 - 132);
    game.layers.hud.addChild(title);

    const meta = new Text({
      text: `ALIGNMENT NODE // ${factions}\nBoss signature: ${boss?.displayName ?? "unknown"}`,
      style: { ...fontStyle, fontSize: 15, align: "center", fill: "#72eadc", stroke: { color: "#030609", width: 3 } }
    });
    meta.anchor.set(0.5);
    meta.position.set(game.width / 2, game.height / 2 - 72);
    game.layers.hud.addChild(meta);

    const body = fieldText(
      `${arena.briefingLines.join("\n")}\n\nObjective: survive while the local reality patch compiles.\nEnemies drop Coherence Shards. Do not align with the wrong AGI.`,
      game.width / 2 - 300,
      game.height / 2 - 12,
      { size: 17, align: "center", width: 600, fill: fieldKit.textSoft, lineHeight: 24 }
    );
    game.layers.hud.addChild(body);

    const hint = new Text({
      text: "Enter: deploy Alignment Frame",
      style: { ...fontStyle, fontSize: 16, fill: "#ffd37a", stroke: { color: "#030609", width: 3 } }
    });
    hint.anchor.set(0.5);
    hint.position.set(game.width / 2, game.height / 2 + 164);
    game.layers.hud.addChild(hint);
  }
}
