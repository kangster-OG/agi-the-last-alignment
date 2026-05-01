import { Graphics, Text } from "pixi.js";
import { fontStyle, palette } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { clearAllLayers } from "../render/layers";
import { SYSTEM_MESSAGES } from "../content/uiText";

export interface RunSummary {
  nodeId: string;
  title: string;
  seconds: number;
  kills: number;
  level: number;
  upgrades: string[];
  upgradeIds?: string[];
  completed: boolean;
}

export class SummaryState implements GameState {
  readonly mode: "LevelComplete" | "GameOver";

  constructor(readonly summary: RunSummary) {
    this.mode = summary.completed ? "LevelComplete" : "GameOver";
  }

  enter(game: Game): void {
    if (this.summary.completed) {
      game.completedNodes.add(this.summary.nodeId);
      game.unlockFrom(this.summary.nodeId);
    }
    this.render(game);
  }

  exit(): void {}

  update(game: Game): void {
    if (this.summary.completed && game.input.wasPressed("interact")) {
      game.state.set(game.createOverworld());
    }
    if (!this.summary.completed && game.input.wasPressed("retry")) {
      game.startRun(this.summary.nodeId);
    }
    if (!this.summary.completed && game.input.wasPressed("interact")) {
      game.state.set(game.createOverworld());
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);
    const g = new Graphics();
    g.rect(0, 0, game.width, game.height).fill(this.summary.completed ? 0x183528 : 0x3a202a);
    g.rect(game.width / 2 - 260, game.height / 2 - 180, 520, 360)
      .fill({ color: palette.ink, alpha: 0.92 })
      .stroke({ color: this.summary.completed ? palette.mint : palette.tomato, width: 4 });
    game.layers.hud.addChild(g);

    const title = new Text({
      text: this.summary.completed ? SYSTEM_MESSAGES.victoryTitle : SYSTEM_MESSAGES.deathTitle,
      style: { ...fontStyle, fontSize: 28, fill: this.summary.completed ? "#64e0b4" : "#ff5d57" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, game.height / 2 - 125);
    game.layers.hud.addChild(title);

    const body = new Text({
      text: `${this.summary.completed ? SYSTEM_MESSAGES.victoryBody : SYSTEM_MESSAGES.deathBody}\n\n${this.summary.title}\nTime ${Math.floor(
        this.summary.seconds
      )}s  KOs ${this.summary.kills}  LV ${this.summary.level}\nPatches: ${
        this.summary.upgrades.join(", ") || "none"
      }\n\n${this.summary.completed ? "Enter: return to the Alignment Grid" : "R: retry  Enter: Alignment Grid"}`,
      style: { ...fontStyle, fontSize: 18, align: "center", wordWrap: true, wordWrapWidth: 430 }
    });
    body.anchor.set(0.5);
    body.position.set(game.width / 2, game.height / 2 + 30);
    game.layers.hud.addChild(body);
  }
}
