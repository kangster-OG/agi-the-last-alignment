import { Text } from "pixi.js";
import { fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { clearAllLayers } from "../render/layers";
import { DEFAULT_KERNEL_MODULE_IDS, KERNEL_MODULES, kernelSummary } from "../roguelite/kernel";
import { CONSENSUS_BURST_PATHS, consensusBurstPath } from "../roguelite/burst";
import { EVAL_PROTOCOLS, evalSummary } from "../roguelite/evals";
import { BuildSelectState } from "./buildSelect";
import { NEXT_CONTENT_TARGET } from "../roguelite/nextContentTarget";
import { drawFieldBackdrop, drawFieldPanel, fieldKit, fieldText } from "./fieldKit";

export class LastAlignmentHubState implements GameState {
  readonly mode = "LastAlignmentHub" as const;

  enter(game: Game): void {
    if (game.selectedKernelModuleIds.length === 0) game.selectedKernelModuleIds = [...DEFAULT_KERNEL_MODULE_IDS];
    this.render(game);
  }

  exit(): void {}

  update(game: Game): void {
    if (game.input.wasPressed("one")) this.cycleKernel(game);
    if (game.input.wasPressed("two")) this.cycleEval(game);
    if (game.input.wasPressed("three")) this.cycleBurst(game);
    if (game.input.wasPressed("retry")) game.state.set(new BuildSelectState());
    if (game.input.wasPressed("interact")) game.state.set(game.createRouteChoice());
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);

    drawFieldBackdrop(game.layers.hud, game.width, game.height, "LAST ALIGNMENT // CAMP TERMINAL");

    const title = new Text({
      text: "THE LAST ALIGNMENT CAMP",
      style: { ...fontStyle, fontSize: 32, fill: "#e7f4ef", stroke: { color: "#070b10", width: 5 }, align: "center" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, 72);
    game.layers.hud.addChild(title);

    const subtitle = new Text({
      text: "Recovered pilots, faction co-minds, and reality engineers argue over the next patch before you deploy.",
      style: { ...fontStyle, fontSize: 13, fill: "#9fd8d1", stroke: { color: "#070b10", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: 980 }
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(game.width / 2, 112);
    game.layers.hud.addChild(subtitle);

    this.drawKernelPanel(game);
    this.drawEvalPanel(game);
    this.drawBurstPanel(game);
    this.drawCampMemory(game);

    const hint = new Text({
      text: "1 cycle Kernel module  2 cycle Adversarial Eval  3 cycle Consensus Burst  R frame/co-mind select  ENTER Route Contracts",
      style: { ...fontStyle, fontSize: 12, fill: "#e7f4ef", stroke: { color: "#070b10", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: 1120 }
    });
    hint.anchor.set(0.5);
    hint.position.set(game.width / 2, game.height - 44);
    game.layers.hud.addChild(hint);
  }

  hubInfo(game: Game) {
    return {
      id: "last_alignment_camp",
      role: "living_hades2_inspired_between_run_hub",
      kernel: kernelSummary(game.selectedKernelModuleIds),
      evals: evalSummary(game.selectedEvalProtocolIds),
      burst: consensusBurstPath(game.selectedConsensusBurstPathId),
      rememberedRun: game.lastRunMemory,
      progression: {
        proofTokens: game.proofTokens,
        secrets: [...game.secretUnlockIds],
        masteryBadges: [...game.masteryBadgeIds],
        campEvents: game.campEvents,
        nextContentTarget: NEXT_CONTENT_TARGET
      }
    };
  }

  private drawKernelPanel(game: Game): void {
    const summary = kernelSummary(game.selectedKernelModuleIds);
    this.drawPanel(game, 54, 160, 362, 340, "ALIGNMENT KERNEL", `Compute ${summary.used}/${summary.budget}`, "teal");
    let y = 228;
    for (const module of summary.modules) {
      this.drawLine(game, 82, y, `${module.name} [${module.cost}]`, module.body, fieldKit.text);
      y += 74;
    }
  }

  private drawEvalPanel(game: Game): void {
    const summary = evalSummary(game.selectedEvalProtocolIds);
    this.drawPanel(game, 458, 160, 362, 340, "ADVERSARIAL EVALS", `Severity ${summary.severity}`, summary.severity > 0 ? "red" : "blue");
    if (summary.protocols.length === 0) {
      this.drawLine(game, 486, 228, "No Eval Active", "Baseline reality patch. Cowardice, but measurable.", fieldKit.text);
      return;
    }
    let y = 228;
    for (const protocol of summary.protocols) {
      this.drawLine(game, 486, y, `${protocol.name} +${protocol.severity}`, protocol.body, "#ffd166");
      y += 82;
    }
  }

  private drawBurstPanel(game: Game): void {
    const path = consensusBurstPath(game.selectedConsensusBurstPathId);
    this.drawPanel(game, 862, 160, 362, 340, "CONSENSUS BURST", path.name, "amber");
    this.drawLine(game, 890, 228, path.name, path.body, fieldKit.text);
    this.drawLine(game, 890, 330, "Autocombat Promise", "The Burst charges from survival, shards, and KOs, then fires automatically when ready.", "#64e0b4");
    this.drawLine(game, 890, 432, "Co-op Promise", "Future party cells can echo the same burst path across all pilots.", fieldKit.textSoft);
  }

  private drawCampMemory(game: Game): void {
    const y = 514;
    const g = drawFieldPanel(game.layers.hud, 54, y, 1170, 138, { tone: "teal", headerHeight: 34, signalTabs: true });
    g.rect(444, y + 34, 2, 104).fill({ color: fieldKit.metal, alpha: 0.35 });
    g.rect(836, y + 34, 2, 104).fill({ color: fieldKit.metal, alpha: 0.35 });

    const metrics = new Text({
      text: `PROOF TOKENS ${game.proofTokens}     SECRETS ${game.secretUnlockIds.size}     MASTERY ${game.masteryBadgeIds.size}`,
      style: { ...fontStyle, fontSize: 12, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, align: "center" }
    });
    metrics.anchor.set(0.5);
    metrics.position.set(game.width / 2, y + 17);
    game.layers.hud.addChild(metrics);

    const memory = game.lastRunMemory;
    const carryover = memory ? [
      memory.completed ? "LAST RUN: CLEAR" : "LAST RUN: FAILED",
      `Route: ${memory.routeContractId ?? "unknown route"}`,
      `Anchors: ${memory.objectiveCompleted ?? 0}/${memory.objectiveTotal ?? 0}`,
      `Proof Tokens: +${memory.proofTokensAwarded ?? 0}`
    ].join("\n") : "NO RUN MEMORY YET\nChoose a contract.\nProve a thesis.\nBring back evidence.";
    const eventText = game.campEvents.slice(0, 3).join("\n");
    const next = game.completedNodes.has("armistice_plaza")
      ? `NEXT TARGET\n${NEXT_CONTENT_TARGET.name}\n${NEXT_CONTENT_TARGET.playerPromise}`
      : `NEXT TARGET LOCKED\n${NEXT_CONTENT_TARGET.name}\nClear Armistice to open the Kettle Coast contract.`;
    this.drawMemoryColumn(game, 82, y + 52, 330, "RUN MEMORY", carryover, fieldKit.text);
    this.drawMemoryColumn(game, 474, y + 52, 330, "CAMP NOTES", eventText, fieldKit.textSoft);
    this.drawMemoryColumn(game, 866, y + 52, 330, "EXPANSION TARGET", next, "#72eadc");
  }

  private drawMemoryColumn(game: Game, x: number, y: number, width: number, title: string, body: string, color: string): void {
    const header = new Text({
      text: title,
      style: { ...fontStyle, fontSize: 9, fill: "#ffd37a", stroke: { color: "#030609", width: 2 }, align: "left" }
    });
    header.position.set(x, y);
    game.layers.hud.addChild(header);
    const text = new Text({
      text: body,
      style: { ...fontStyle, fontSize: 9, fill: color, stroke: { color: "#030609", width: 2 }, wordWrap: true, wordWrapWidth: width, lineHeight: 11 }
    });
    text.position.set(x, y + 18);
    game.layers.hud.addChild(text);
  }

  private drawPanel(game: Game, x: number, y: number, w: number, h: number, title: string, kicker: string, tone: "teal" | "amber" | "red" | "blue"): void {
    drawFieldPanel(game.layers.hud, x, y, w, h, { title, kicker, tone, headerHeight: 48, signalTabs: true });
  }

  private drawLine(game: Game, x: number, y: number, title: string, body: string, color: string): void {
    game.layers.hud.addChild(fieldText(`${title}\n${body}`, x, y, { size: 11, fill: color, width: 308, lineHeight: 15 }));
  }

  private cycleKernel(game: Game): void {
    const current = game.selectedKernelModuleIds[game.selectedKernelModuleIds.length - 1] ?? KERNEL_MODULES[0].id;
    const nextIndex = (KERNEL_MODULES.findIndex((module) => module.id === current) + 1 + KERNEL_MODULES.length) % KERNEL_MODULES.length;
    game.selectedKernelModuleIds = [game.selectedKernelModuleIds[0] ?? KERNEL_MODULES[0].id, game.selectedKernelModuleIds[1] ?? KERNEL_MODULES[1].id, KERNEL_MODULES[nextIndex].id];
  }

  private cycleEval(game: Game): void {
    if (game.selectedEvalProtocolIds.length === 0) {
      game.selectedEvalProtocolIds = [EVAL_PROTOCOLS[0].id];
      return;
    }
    const current = game.selectedEvalProtocolIds[0];
    const index = EVAL_PROTOCOLS.findIndex((protocol) => protocol.id === current);
    const next = EVAL_PROTOCOLS[index + 1];
    game.selectedEvalProtocolIds = next ? [next.id] : [];
  }

  private cycleBurst(game: Game): void {
    const index = CONSENSUS_BURST_PATHS.findIndex((path) => path.id === game.selectedConsensusBurstPathId);
    game.selectedConsensusBurstPathId = CONSENSUS_BURST_PATHS[(index + 1 + CONSENSUS_BURST_PATHS.length) % CONSENSUS_BURST_PATHS.length].id;
  }
}
