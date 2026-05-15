import { Container, Graphics, Sprite, Text } from "pixi.js";
import { fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import type { LevelRunState } from "../level/LevelRunState";
import { draftActionForUpgradeId, draftUpgrades, type Upgrade } from "../gameplay/upgrades";
import { clearAllLayers } from "../render/layers";
import { COMBAT_CLASSES, FACTIONS } from "../content";
import { fusionRecipeLineForCard, protocolCodexForBuild } from "../roguelite/protocolCodex";
import { getMilestone14ArtTextures, loadMilestone14Art, patchItemIconFrameForUpgrade } from "../assets/milestone14Art";
import { buildWeaponIconFrameForUpgrade, getBuildWeaponVfxTextures, loadBuildWeaponVfxTextures } from "../assets/buildWeaponVfx";
import { drawFieldBackdrop, drawFieldPanel, drawStatusRail, fieldKit, fieldText, toneColor, type FieldPanelTone } from "./fieldKit";

export class UpgradeDraftState implements GameState {
  readonly mode = "UpgradeDraft" as const;
  cards: Upgrade[] = [];
  rerollCount = 0;
  private requestedProductionArtLoad = false;

  constructor(readonly run: LevelRunState) {}

  enter(game: Game): void {
    game.audio.setMusicState("draft", { arenaId: this.run.arena.id });
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
    if (game.input.wasPressed("retry")) {
      this.reroll(game);
      return;
    }
    if (index >= 0) {
      this.choose(game, index);
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);

    drawFieldBackdrop(game.layers.hud, game.width, game.height, "LAST ALIGNMENT // EMERGENCY PATCH TABLE // CHOOSE YOUR COMPLAINT");

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
      text: `${combatClass.displayName} + ${faction.shortName} Co-Mind // pick a protocol and pretend this was strategic`,
      style: { ...fontStyle, fontSize: 15, fill: "#9fd8d1", stroke: { color: "#070b10", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: 940 }
    });
    context.anchor.set(0.5);
    context.position.set(game.width / 2, 166);
    game.layers.hud.addChild(context);

    const codex = protocolCodexForBuild(this.run.build, this.run.chosenUpgradeIds);
    const fusionLines = codex.knownFusions.map((recipe) => `${recipe.recipeText} [${recipe.state}]`).join("   ");
    const currentRank = this.run.build.weaponRanks[this.run.build.weaponId] ?? 1;
    const codexText = fieldText(
      `PROTOCOL CODEX // CORE ${this.run.build.weaponId.toUpperCase()} R${currentRank}/5 // SECONDARY ${this.run.build.secondaryProtocols.length}/2 // PASSIVE ${this.run.build.passiveProcesses.length}/4 // REROLLS ${this.run.build.draftRerolls} // FUSIONS ${fusionLines || "none yet, tragic"}`,
      game.width / 2 - 490,
      194,
      { size: 10, width: 980, fill: fieldKit.textSoft, align: "center", lineHeight: 13 }
    );
    game.layers.hud.addChild(codexText);

    const cardWidth = 238;
    const cardGap = 22;
    const totalWidth = this.cards.length * cardWidth + Math.max(0, this.cards.length - 1) * cardGap;
    const row = new Container();
    row.position.set(game.width / 2 - totalWidth / 2, game.height / 2 - 118);
    game.layers.hud.addChild(row);

    this.cards.forEach((card, index) => {
      const x = index * (cardWidth + cardGap);
      const tone = cardTone(card);
      const action = draftActionForUpgradeId(card.id, this.run.build);
      drawFieldPanel(row, x, 0, cardWidth, 282, {
        title: `${index + 1}. ${action}`,
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

      const rank = this.run.build.weaponRanks[card.id] ?? 0;
      const rankSuffix = action === "RANK UP" ? ` R${Math.min(5, rank + 1)}/5` : action === "REPLACE CORE" ? " CORE" : "";
      row.addChild(fieldText(`${card.name.toUpperCase()}${rankSuffix}`, x + 88, 90, { size: 13, width: cardWidth - 108, fill: fieldKit.text, lineHeight: 16 }));
      row.addChild(fieldText(card.tags.map((tag) => tag.toUpperCase()).join(" / "), x + 20, 150, { size: 9, width: cardWidth - 40, fill: tagFill(tone) }));
      row.addChild(fieldText(card.body, x + 20, 176, { size: 12, width: cardWidth - 40, fill: fieldKit.textSoft, lineHeight: 16 }));
      const recipeLine = fusionRecipeLineForCard(card.id, this.run.build, this.run.chosenUpgradeIds);
      if (recipeLine) row.addChild(fieldText(recipeLine, x + 20, 235, { size: 9, width: cardWidth - 40, fill: "#ffd37a", lineHeight: 11 }));
      drawStatusRail(row, x + 20, 258, cardWidth - 40, 5, 0.26 + index * 0.18, tone);
    });

    const hint = new Text({
      text: `Select one emergency patch. Utility caches do not consume slots, because mercy sometimes wears a coupon.\nPress 1/2/3${this.cards.length > 3 ? "/4" : ""}. R rerolls (${this.run.build.draftRerolls}). Enter takes the first card for proof runs.`,
      style: { ...fontStyle, fontSize: 15, fill: "#e7f4ef", stroke: { color: "#070b10", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: 920 }
    });
    hint.anchor.set(0.5);
    hint.position.set(game.width / 2, game.height - 95);
    game.layers.hud.addChild(hint);
  }

  private choose(game: Game, index: number): void {
    const card = this.cards[index] ?? this.cards[0];
    const beforeHp = this.run.build.maxHpBonus;
    const cachedConsumed = this.run.build.cachedCardId && card.id === this.run.build.cachedCardId;
    card.apply(this.run.build);
    if (card.protocolSlot === "utility_cache") {
      this.run.applyUtilityDraftEffect(card.id, this.cards.map((draftCard) => draftCard.id));
    }
    if (cachedConsumed) {
      this.run.build.cachedCardId = "";
      this.run.build.cachedCardConsumed += 1;
    }
    if (this.run.build.maxHpBonus > beforeHp) {
      const gained = this.run.build.maxHpBonus - beforeHp;
      this.run.player.maxHp += gained;
      this.run.player.hp += gained;
    }
    if (card.protocolSlot !== "utility_cache") {
      this.run.chosenUpgrades.push(card.name);
      this.run.chosenUpgradeIds.push(card.id);
      this.run.chosenProtocolSlots.push(card.protocolSlot);
      this.run.applyChosenTags(card.tags);
      this.run.recordRewardEvent("level_up_draft", card.protocolSlot, card.id, card.name);
    } else {
      this.run.recordRewardEvent("utility_cache_draft", card.protocolSlot, card.id, card.name);
    }
    game.feedback.cue(card.source === "evolution" ? "ui.major_evolution" : "ui.patch_selected", "ui", { priority: card.source === "evolution" ? 7 : 4 });
    game.state.set(this.run);
  }

  private reroll(game: Game): void {
    if (this.run.build.draftRerolls <= 0) {
      game.feedback.cue("ui.locked", "ui", { priority: 3 });
      return;
    }
    const previousCardIds = this.cards.map((card) => card.id);
    this.run.build.draftRerolls -= 1;
    this.run.build.draftRerollsSpent += 1;
    const chosenForReroll = [...this.run.chosenUpgradeIds, ...previousCardIds.filter((id) => id !== this.run.build.weaponId && id !== this.run.build.cachedCardId)];
    const next = draftUpgrades(this.run.classId, this.run.factionId, chosenForReroll, this.run.player.level + this.rerollCount + 1, this.run.build.draftChoicesBonus, this.run.draftBiasTags(), this.run.build);
    if (next.length > 0) this.cards = next;
    this.rerollCount += 1;
    this.run.recordRewardEvent("draft_reroll", "reroll", `reroll_${this.rerollCount}`, `Reroll ${this.rerollCount}: ${previousCardIds.join(",")} -> ${this.cards.map((card) => card.id).join(",")}`);
    game.feedback.cue("ui.draft_reroll", "ui", { priority: 4 });
    this.render(game);
  }
}

function cardTone(card: Upgrade): FieldPanelTone {
  if (card.source === "utility") return "red";
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
  if (card.protocolSlot === "utility_cache") return "UTILITY";
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
