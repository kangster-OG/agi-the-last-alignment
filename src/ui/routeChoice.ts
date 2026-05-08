import { Text } from "pixi.js";
import { fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { clearAllLayers } from "../render/layers";
import { evalSummary } from "../roguelite/evals";
import { routeContractChoices, type RouteContract } from "../roguelite/deepRoguelite";
import { campaignRouteSummary } from "../roguelite/campaignRoute";
import { drawFieldBackdrop, drawFieldPanel, drawStatusRail, drawToken, fieldKit, fieldText, type FieldPanelTone } from "./fieldKit";

export class RouteContractChoiceState implements GameState {
  readonly mode = "RouteContractChoice" as const;
  private choices: RouteContract[] = [];

  enter(game: Game): void {
    this.choices = routeContractChoices(game.selectedEvalProtocolIds, game.completedNodes.size);
    if (this.choices[0]) game.selectedRouteContractId = this.choices[0].id;
    this.render(game);
  }

  exit(): void {}

  update(game: Game): void {
    if (game.input.wasPressed("one")) this.choose(game, 0);
    if (game.input.wasPressed("two")) this.choose(game, 1);
    if (game.input.wasPressed("three")) this.choose(game, 2);
    if (game.input.wasPressed("retry")) game.state.set(game.createHub());
    if (game.input.wasPressed("interact")) {
      const selected = this.choices.find((choice) => choice.id === game.selectedRouteContractId) ?? this.choices[0];
      if (selected) game.selectedRouteContractId = selected.id;
      game.state.set(game.createOverworld());
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);

    drawFieldBackdrop(game.layers.hud, game.width, game.height, "LAST ALIGNMENT // ROUTE TERMINAL");

    const title = new Text({
      text: "SELECT ROUTE CONTRACT",
      style: { ...fontStyle, fontSize: 34, fill: "#e7f4ef", stroke: { color: "#070b10", width: 5 }, align: "center" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, 54);
    game.layers.hud.addChild(title);

    const evals = evalSummary(game.selectedEvalProtocolIds);
    const campaign = campaignRouteSummary(game);
    const subtitle = new Text({
      text: `${campaign.routeLine} // ${evals.protocols.length ? evals.protocols.map((protocol) => protocol.name).join(" + ") : "Baseline"} // ${campaign.nextAction}`,
      style: { ...fontStyle, fontSize: 13, fill: "#9fd8d1", stroke: { color: "#070b10", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: 980 }
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(game.width / 2, 92);
    game.layers.hud.addChild(subtitle);

    const startX = game.width / 2 - 546;
    this.choices.forEach((choice, index) => this.drawContract(game, choice, startX + index * 374, 160, index));

    game.layers.hud.addChild(fieldText(`CAMPAIGN\n${campaign.focus.toUpperCase()} // ${campaign.routeLine}`, game.width / 2 - 500, 552, { size: 11, fill: "#72eadc", width: 1000, align: "center", lineHeight: 15 }));

    const hint = new Text({
      text: "1/2/3 select contract  ENTER deploy to Alignment Grid  R return to Camp",
      style: { ...fontStyle, fontSize: 14, fill: "#e7f4ef", stroke: { color: "#070b10", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: 1000 }
    });
    hint.anchor.set(0.5);
    hint.position.set(game.width / 2, game.height - 45);
    game.layers.hud.addChild(hint);
  }

  routeInfo(game: Game) {
    return {
      id: "route_contract_choice",
      selectedRouteContractId: game.selectedRouteContractId,
      choices: this.choices,
      campaign: campaignRouteSummary(game)
    };
  }

  private choose(game: Game, index: number): void {
    const choice = this.choices[index];
    if (!choice) return;
    game.selectedRouteContractId = choice.id;
    this.render(game);
  }

  private drawContract(game: Game, choice: RouteContract, x: number, y: number, index: number): void {
    const selected = game.selectedRouteContractId === choice.id || (!game.selectedRouteContractId && index === 0);
    const tone: FieldPanelTone = choice.pressure >= 2 ? "red" : choice.pressure === 1 ? "amber" : "teal";
    drawFieldPanel(game.layers.hud, x, y, 344, 380, {
      title: `${index + 1}. ${choice.name}`,
      kicker: `${choice.nodeType.toUpperCase()} // PRESSURE ${choice.pressure}`,
      tone,
      selected,
      headerHeight: 62,
      signalTabs: true
    });
    drawToken(game.layers.hud, x + 24, y + 80, "RT", tone, selected);
    drawToken(game.layers.hud, x + 72, y + 80, `${choice.pressure}`, tone, selected);
    drawStatusRail(game.layers.hud, x + 126, y + 94, 188, 8, Math.min(1, (choice.pressure + 1) / 4), tone);

    game.layers.hud.addChild(fieldText(choice.body, x + 24, y + 132, { size: 12, fill: fieldKit.text, width: 296, lineHeight: 15 }));
    game.layers.hud.addChild(fieldText(`DANGER\n${choice.danger}`, x + 24, y + 194, { size: 10, fill: "#f08a82", width: 296, lineHeight: 13 }));
    game.layers.hud.addChild(fieldText(`REWARD\n${choice.reward}`, x + 24, y + 246, { size: 10, fill: "#72eadc", width: 296, lineHeight: 13 }));
    game.layers.hud.addChild(fieldText(`SECRET\n${choice.secretHint}`, x + 24, y + 300, { size: 10, fill: fieldKit.textSoft, width: 296, lineHeight: 13 }));
    game.layers.hud.addChild(fieldText(`BIAS: ${choice.rewardBiasTags.map((tag) => tag.toUpperCase()).join(" / ")}`, x + 24, y + 350, { size: 9, fill: "#cbb6ff", width: 296 }));
  }
}
