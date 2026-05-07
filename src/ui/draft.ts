import { Container, Graphics, Sprite, Text } from "pixi.js";
import { fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import type { LevelRunState } from "../level/LevelRunState";
import { draftUpgrades, type Upgrade } from "../gameplay/upgrades";
import { clearAllLayers } from "../render/layers";
import { COMBAT_CLASSES, FACTIONS } from "../content";
import { getMilestone14ArtTextures, loadMilestone14Art, patchItemIconFrameForUpgrade } from "../assets/milestone14Art";
import { buildWeaponIconFrameForUpgrade, getBuildWeaponVfxTextures, loadBuildWeaponVfxTextures } from "../assets/buildWeaponVfx";
import { drawFieldBackdrop, drawFieldPanel, drawStatusRail, fieldKit, fieldText, toneColor, type FieldPanelTone } from "./fieldKit";

export class UpgradeDraftState implements GameState {
  readonly mode = "UpgradeDraft" as const;
  cards: Upgrade[] = [];
  private requestedProductionArtLoad = false;

  constructor(readonly run: LevelRunState) {}

  enter(game: Game): void {
    this.cards = draftUpgrades(this.run.classId, this.run.factionId, this.run.chosenUpgradeIds, this.run.player.level, this.run.build.draftChoicesBonus, this.run.draftBiasTags(), this.run.build);
    if (game.useMilestone10Art && (!getMilestone14ArtTextures() || !getBuildWeaponVfxTextures()) && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void Promise.all([loadMilestone14Art(), loadBuildWeaponVfxTextures()]).then(() => {
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
    if (game.input.wasPressed("four")) index = 3;
    if (game.input.wasPressed("interact")) index = 0;
    if (index >= 0) {
      this.choose(game, index);
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);

    drawFieldBackdrop(game.layers.hud, game.width, game.height, "LAST ALIGNMENT // EMERGENCY PATCH TABLE");

    const title = new Text({
      text: "EMERGENCY PATCH",
      style: { ...fontStyle, fontSize: 34, fill: "#e7f4ef", stroke: { color: "#070b10", width: 5 } }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, 120);
    game.layers.hud.addChild(title);

    const combatClass = COMBAT_CLASSES[this.run.classId];
    const faction = FACTIONS[this.run.factionId];
    const context = new Text({
      text: `${combatClass.displayName} + ${faction.shortName} Co-Mind // emergency patches install into protocol slots without changing autocombat`,
      style: { ...fontStyle, fontSize: 15, fill: "#9fd8d1", stroke: { color: "#070b10", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: 940 }
    });
    context.anchor.set(0.5);
    context.position.set(game.width / 2, 166);
    game.layers.hud.addChild(context);

    const cardWidth = 238;
    const cardGap = 22;
    const totalWidth = this.cards.length * cardWidth + Math.max(0, this.cards.length - 1) * cardGap;
    const row = new Container();
    row.position.set(game.width / 2 - totalWidth / 2, game.height / 2 - 118);
    game.layers.hud.addChild(row);

    this.cards.forEach((card, index) => {
      const x = index * (cardWidth + cardGap);
      const tone = cardTone(card);
      drawFieldPanel(row, x, 0, cardWidth, 282, {
        title: `${index + 1}. ${card.source.toUpperCase()} PATCH`,
        kicker: protocolSlotLabel(card),
        tone,
        selected: index === 0,
        headerHeight: 58,
        signalTabs: false
      });
      const g = new Graphics();
      g.rect(x + 20, 76, cardWidth - 40, 6).fill({ color: toneColor(tone), alpha: 0.82 });
      g.rect(x + 18, 86, 58, 54).fill({ color: 0x090d12, alpha: 0.72 }).stroke({ color: toneColor(tone), width: 1, alpha: 0.7 });
      row.addChild(g);

      const art = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
      const buildArt = game.useMilestone10Art ? getBuildWeaponVfxTextures() : null;
      const buildFrame = buildWeaponIconFrameForUpgrade(card);
      if (buildArt && buildFrame) {
        const frame = new Sprite(buildArt.frames[buildFrame]);
        frame.anchor.set(0.5);
        frame.scale.set(card.id === "patch_mortar" ? 0.46 : card.id === "signal_pulse" ? 0.5 : 0.44);
        frame.position.set(x + 47, 113);
        frame.alpha = 1;
        row.addChild(frame);
      } else if (art) {
        const frame = new Sprite(art.patchItemIcons[patchItemIconFrameForUpgrade(card)]);
        frame.anchor.set(0.5);
        frame.scale.set(0.6);
        frame.position.set(x + 47, 113);
        frame.alpha = 1;
        row.addChild(frame);
      }

      row.addChild(fieldText(card.name.toUpperCase(), x + 88, 90, { size: 13, width: cardWidth - 108, fill: fieldKit.text, lineHeight: 16 }));
      row.addChild(fieldText(card.tags.map((tag) => tag.toUpperCase()).join(" / "), x + 20, 150, { size: 9, width: cardWidth - 40, fill: tagFill(tone) }));
      row.addChild(fieldText(card.body, x + 20, 176, { size: 12, width: cardWidth - 40, fill: fieldKit.textSoft, lineHeight: 16 }));
      drawStatusRail(row, x + 20, 258, cardWidth - 40, 5, 0.26 + index * 0.18, tone);
    });

    const hint = new Text({
      text: `Select one emergency patch. Slots: weapon, movement, defense, economy, co-mind, burst.\nPress 1/2/3${this.cards.length > 3 ? "/4" : ""}. Enter takes the first card for proof runs.`,
      style: { ...fontStyle, fontSize: 15, fill: "#e7f4ef", stroke: { color: "#070b10", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: 920 }
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
    this.run.chosenProtocolSlots.push(card.protocolSlot);
    this.run.applyChosenTags(card.tags);
    game.state.set(this.run);
  }
}

function cardTone(card: Upgrade): FieldPanelTone {
  if (card.source === "evolution") return "amber";
  if (card.source === "faction") return "teal";
  if (card.source === "class") return "blue";
  return card.id.includes("shield") || card.id.includes("backpack") ? "red" : "violet";
}

function tagFill(tone: FieldPanelTone): string {
  if (tone === "red") return "#f08a82";
  if (tone === "amber") return "#ffd37a";
  if (tone === "blue") return "#9fd4ff";
  if (tone === "violet") return "#cbb6ff";
  return "#72eadc";
}

function protocolSlotLabel(card: Upgrade): string {
  if (card.id === "vector_lance" || card.id === "signal_pulse") return "PRIMARY";
  if (card.id === "context_saw" || card.id === "patch_mortar") return "SECONDARY";
  if (card.id === "causal_railgun" || card.source === "evolution") return "FUSION";
  if (card.id === "coherence_indexer" || card.id === "anchor_bodyguard" || card.id === "prediction_priority") return "PASSIVE";
  if (card.protocolSlot === "auto_weapon") return "AUTO-WEAPON";
  if (card.protocolSlot === "movement_trace") return "MOVEMENT";
  if (card.protocolSlot === "defense_layer") return "DEFENSE";
  if (card.protocolSlot === "shard_economy") return "ECONOMY";
  if (card.protocolSlot === "co_mind_process") return "CO-MIND";
  return "BURST";
}
