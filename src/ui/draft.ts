import { Container, Graphics, Sprite, Text } from "pixi.js";
import { fontStyle, palette } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import type { LevelRunState } from "../level/LevelRunState";
import { draftUpgrades, type Upgrade } from "../gameplay/upgrades";
import { clearAllLayers } from "../render/layers";
import { COMBAT_CLASSES, FACTIONS } from "../content";
import { getMilestone14ArtTextures, loadMilestone14Art, patchCardFrameForSource } from "../assets/milestone14Art";

export class UpgradeDraftState implements GameState {
  readonly mode = "UpgradeDraft" as const;
  cards: Upgrade[] = [];
  private requestedProductionArtLoad = false;

  constructor(readonly run: LevelRunState) {}

  enter(game: Game): void {
    this.cards = draftUpgrades(this.run.classId, this.run.factionId, this.run.chosenUpgradeIds, this.run.player.level);
    if (game.useMilestone10Art && !getMilestone14ArtTextures() && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void loadMilestone14Art().then(() => {
        if (game.state.current === this) this.render(game);
      });
    }
    this.render(game);
  }

  exit(): void {}

  update(game: Game): void {
    let index = -1;
    if (game.input.wasPressed("one")) index = 0;
    if (game.input.wasPressed("two")) index = 1;
    if (game.input.wasPressed("three")) index = 2;
    if (game.input.wasPressed("interact")) index = 0;
    if (index >= 0) {
      this.choose(game, index);
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);

    const bg = new Graphics();
    bg.rect(0, 0, game.width, game.height).fill(palette.asphalt);
    bg.rect(0, 0, game.width, game.height).fill({ color: palette.plum, alpha: 0.18 });
    game.layers.hud.addChild(bg);

    const title = new Text({
      text: "LOCAL REALITY DAMAGED",
      style: { ...fontStyle, fontSize: 32, fill: "#ffd166" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, 120);
    game.layers.hud.addChild(title);

    const combatClass = COMBAT_CLASSES[this.run.classId];
    const faction = FACTIONS[this.run.factionId];
    const context = new Text({
      text: `${combatClass.displayName} + ${faction.shortName} Co-Mind // emergency patches compile from class, co-mind, and general pools`,
      style: { ...fontStyle, fontSize: 15, fill: "#64e0b4", align: "center", wordWrap: true, wordWrapWidth: 940 }
    });
    context.anchor.set(0.5);
    context.position.set(game.width / 2, 166);
    game.layers.hud.addChild(context);

    const row = new Container();
    row.position.set(game.width / 2 - 390, game.height / 2 - 100);
    game.layers.hud.addChild(row);

    this.cards.forEach((card, index) => {
      const x = index * 260;
      const g = new Graphics();
      g.rect(x, 0, 230, 260).fill(index === 0 ? 0x2d4238 : 0x272a34).stroke({ color: card.source === "evolution" ? palette.lemon : palette.paper, width: card.source === "evolution" ? 5 : 3 });
      g.rect(x + 16, 16, 198, 76).fill(cardColor(card)).stroke({ color: palette.ink, width: 3 });
      row.addChild(g);

      const art = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
      if (art) {
        const frame = new Sprite(art.patchCards[patchCardFrameForSource(card.source)]);
        frame.anchor.set(0.5);
        frame.scale.set(0.72);
        frame.position.set(x + 115, 54);
        row.addChild(frame);
      }

      const label = new Text({
        text: `${index + 1}. ${card.name}\n${card.source.toUpperCase()}\n\n${card.body}`,
        style: { ...fontStyle, fontSize: 15, wordWrap: true, wordWrapWidth: 190 }
      });
      label.position.set(x + 20, 108);
      row.addChild(label);
    });

    const hint = new Text({
      text: "Select one emergency patch. Evolutions appear when prerequisite patches are installed.\nPress 1/2/3. Enter takes the first card for proof runs.",
      style: { ...fontStyle, fontSize: 15, fill: "#64e0b4", align: "center", wordWrap: true, wordWrapWidth: 920 }
    });
    hint.anchor.set(0.5);
    hint.position.set(game.width / 2, game.height - 95);
    game.layers.hud.addChild(hint);
  }

  private choose(game: Game, index: number): void {
    const card = this.cards[index] ?? this.cards[0];
    const beforeHp = this.run.build.maxHpBonus;
    card.apply(this.run.build);
    if (this.run.build.maxHpBonus > beforeHp) {
      const gained = this.run.build.maxHpBonus - beforeHp;
      this.run.player.maxHp += gained;
      this.run.player.hp += gained;
    }
    this.run.chosenUpgrades.push(card.name);
    this.run.chosenUpgradeIds.push(card.id);
    game.state.set(this.run);
  }
}

function cardColor(card: Upgrade): number {
  if (card.source === "evolution") return palette.lemon;
  if (card.source === "faction") return palette.mint;
  if (card.source === "class") return palette.blue;
  return card.id.includes("shield") || card.id.includes("backpack") ? palette.tomato : palette.paper;
}
