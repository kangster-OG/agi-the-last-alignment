import { Text } from "pixi.js";
import { fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { clearAllLayers } from "../render/layers";
import { SYSTEM_MESSAGES } from "../content/uiText";
import { campaignClarityForNode } from "../content/campaignClarity";
import { drawFieldBackdrop, drawFieldPanel, drawToken, fieldKit, fieldText } from "./fieldKit";

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

function summaryPatchLine(upgrades: string[]): string {
  if (upgrades.length === 0) return "PATCHES: none";
  const visible = upgrades.slice(0, 4).join(", ");
  const extra = upgrades.length > 4 ? `, +${upgrades.length - 4} more` : "";
  return `PATCHES ${upgrades.length}: ${visible}${extra}`;
}

function objectiveOutcomeLine(memory: NonNullable<Game["lastRunMemory"]>, clarity: ReturnType<typeof campaignClarityForNode>): string {
  const verb = (clarity?.verb ?? "Complete").toUpperCase();
  const unit = memory.objectiveUnit ?? clarity?.objectiveUnit ?? "Objectives";
  const completed = memory.objectiveCompleted ?? 0;
  const total = memory.objectiveTotal ?? 0;
  const progress = total > 0 ? ` (${unit} ${completed}/${total})` : "";
  return `Objective: ${verb} ${memory.completed ? "COMPLETE" : "INCOMPLETE"}${progress}`;
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
    if (game.input.wasPressed("coop")) {
      game.state.set(game.createHub());
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);
    drawFieldBackdrop(game.layers.hud, game.width, game.height, "LAST ALIGNMENT // RUN MEMORY TABLE");
    drawFieldPanel(game.layers.hud, game.width / 2 - 360, game.height / 2 - 260, 720, 520, {
      tone: this.summary.completed ? "teal" : "red",
      title: this.summary.completed ? "RUN MEMORY ACCEPTED" : "RUN MEMORY INCOMPLETE",
      kicker: this.summary.title,
      selected: true,
      headerHeight: 66,
      signalTabs: true
    });

    const title = new Text({
      text: this.summary.completed ? SYSTEM_MESSAGES.victoryTitle : SYSTEM_MESSAGES.deathTitle,
      style: { ...fontStyle, fontSize: 27, fill: this.summary.completed ? fieldKit.tealLight : "#f08a82", stroke: { color: "#030609", width: 4 } }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, game.height / 2 - 178);
    game.layers.hud.addChild(title);

    const memory = game.lastRunMemory;
    const clarity = campaignClarityForNode(this.summary.nodeId);
    const expeditionLine = game.expeditionProgress.active
      ? `\nExpedition LV ${game.expeditionProgress.level} // Patches ${game.expeditionProgress.chosenUpgradeIds.length} // Pressure ${game.expeditionProgress.powerScore}`
      : "";
    const unlockedLine = memory?.mechanicalUnlocks?.length
      ? memory.mechanicalUnlocks.slice(0, 3).join("  |  ")
      : memory?.routeUnlocks?.length
        ? `${memory.routeUnlocks.length} route node(s) opened`
        : "No new roster unlock this run";
    const carryover = memory
      ? `REWARDS\nLevel Cleared: ${memory.completed ? "YES" : "NO"}\n${objectiveOutcomeLine(memory, clarity)}\nMechanic: ${memory.objectiveStyle ?? "Objective"}\nBoss Defeated: ${memory.bossDefeated ? "YES" : "NO"}\nProof Tokens: +${memory.proofTokensAwarded ?? 0} => ${memory.proofTokensTotal ?? game.proofTokens}\nUnlocked: ${unlockedLine}\nNext: ${memory.nodeStabilized ?? "Next route pending"}${expeditionLine}\n\nBuild: ${memory.buildHighlights?.slice(0, 3).join(", ") || memory.thesis || "uncommitted"}\nFlavor: ${memory.campaignConsequence ?? (memory.newSecrets?.[0] ? `Secret: ${memory.newSecrets[0].name}` : memory.newMastery?.[0] ? `Mastery: ${memory.newMastery[0].name}` : "Camp has new evidence for the next run.")}`
      : "RUN MEMORY\nNo carryover recorded.";
    const outcomeLine = this.summary.completed
      ? "Survived. Built power. Extracted with durable rewards."
      : SYSTEM_MESSAGES.deathBody;
    drawToken(game.layers.hud, game.width / 2 - 282, game.height / 2 - 144, "KO", "red", false);
    drawToken(game.layers.hud, game.width / 2 - 206, game.height / 2 - 144, "LV", "blue", false);
    drawToken(game.layers.hud, game.width / 2 - 130, game.height / 2 - 144, "PT", "amber", this.summary.completed);
    game.layers.hud.addChild(fieldText(
      `TIME ${Math.floor(this.summary.seconds)}s     KOs ${this.summary.kills}     LV ${this.summary.level}\n${summaryPatchLine(this.summary.upgrades)}`,
      game.width / 2 - 284,
      game.height / 2 - 96,
      { size: 13, fill: fieldKit.text, width: 568, align: "center", lineHeight: 18 }
    ));
    game.layers.hud.addChild(fieldText(
      `${outcomeLine}\n\n${carryover}`,
      game.width / 2 - 284,
      game.height / 2 - 32,
      { size: 12, fill: fieldKit.textSoft, width: 568, align: "center", lineHeight: 15 }
    ));
    game.layers.hud.addChild(fieldText(
      this.summary.completed ? "Enter: Alignment Grid  C: Last Alignment Camp" : "R: retry  Enter: Alignment Grid  C: Camp",
      game.width / 2 - 284,
      game.height - 82,
      { size: 14, fill: "#72eadc", width: 568, align: "center" }
    ));
  }
}
