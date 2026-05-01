import { Graphics, Sprite, Text } from "pixi.js";
import { fontStyle, palette } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { clearAllLayers } from "../render/layers";
import { COMBAT_CLASSES, FACTIONS, resolveBuildKit } from "../content";
import { CONSENSUS_CELL_MAX_PLAYERS, clampConsensusCellSize } from "../sim/consensusCell";
import { BUILD_CLASS_IDS, BUILD_FACTION_IDS, isClassUnlocked, isFactionUnlocked, readOnlineMetaProgression, type OnlineMetaProgression } from "../metaprogression/onlineMetaProgression";
import {
  getMilestone49PlayableArtTextures,
  loadMilestone49PlayableArt,
  milestone49FactionSigilTexture,
  milestone49CoMindPortraitTexture,
  milestone49NetworkPlayerTextureFor,
  milestone49OfficialLogoTexture,
  milestone49RoleChipTexture,
  type Milestone49PlayableArtTextures
} from "../assets/milestone49PlayableArt";

const CLASS_IDS: string[] = [...BUILD_CLASS_IDS];
const FACTION_IDS: string[] = [...BUILD_FACTION_IDS];

export class BuildSelectState implements GameState {
  readonly mode = "BuildSelect" as const;
  private classIndex = 0;
  private factionIndex = 0;
  private metaprogression: OnlineMetaProgression = readOnlineMetaProgression();
  private requestedMilestone49ArtLoad = false;

  enter(game: Game): void {
    this.metaprogression = readOnlineMetaProgression();
    this.classIndex = Math.max(0, CLASS_IDS.indexOf(game.selectedClassId));
    this.factionIndex = Math.max(0, FACTION_IDS.indexOf(game.selectedFactionId));
    if (!this.classUnlocked(CLASS_IDS[this.classIndex])) this.classIndex = this.firstUnlockedClassIndex();
    if (!this.factionUnlocked(FACTION_IDS[this.factionIndex])) this.factionIndex = this.firstUnlockedFactionIndex();
    this.applySelection(game);
    this.render(game);
  }

  exit(): void {}

  update(game: Game): void {
    if (game.input.wasPressed("up")) this.classIndex = this.nextUnlockedClassIndex(-1);
    if (game.input.wasPressed("down")) this.classIndex = this.nextUnlockedClassIndex(1);
    if (game.input.wasPressed("left")) this.factionIndex = this.nextUnlockedFactionIndex(-1);
    if (game.input.wasPressed("right")) this.factionIndex = this.nextUnlockedFactionIndex(1);
    if (game.input.wasPressed("one")) this.selectClassIfUnlocked(0);
    if (game.input.wasPressed("two")) this.selectClassIfUnlocked(1);
    if (game.input.wasPressed("three")) this.selectClassIfUnlocked(2);
    if (game.input.wasPressed("four")) game.consensusCellSize = 4;
    if (game.input.wasPressed("dash")) {
      game.consensusCellSize = clampConsensusCellSize((game.consensusCellSize % CONSENSUS_CELL_MAX_PLAYERS) + 1);
    }
    this.applySelection(game);
    if (game.input.wasPressed("interact")) {
      game.state.set(game.createOverworld());
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);

    const bg = new Graphics();
    bg.rect(0, 0, game.width, game.height).fill(0x111923);
    bg.rect(0, game.height - 165, game.width, 165).fill({ color: 0x203447, alpha: 0.9 });
    game.layers.hud.addChild(bg);

    const title = new Text({
      text: "CONSENSUS CELL LOADOUT",
      style: { ...fontStyle, fontSize: 34, fill: "#ffd166" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, 70);
    game.layers.hud.addChild(title);

    const subtitle = new Text({
      text: "Choose combat body and frontier co-mind. Starter shell defaults to Accord Striker + OpenAI Accord Division.",
      style: { ...fontStyle, fontSize: 15, fill: "#64e0b4", align: "center", wordWrap: true, wordWrapWidth: 860 }
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(game.width / 2, 108);
    game.layers.hud.addChild(subtitle);

    const milestone49Art = this.milestone49Art(game);
    this.drawClassPanel(game, milestone49Art);
    this.drawFactionPanel(game, milestone49Art);
    this.drawSummary(game);
  }

  private applySelection(game: Game): void {
    if (!this.classUnlocked(CLASS_IDS[this.classIndex])) this.classIndex = this.firstUnlockedClassIndex();
    if (!this.factionUnlocked(FACTION_IDS[this.factionIndex])) this.factionIndex = this.firstUnlockedFactionIndex();
    game.selectedClassId = CLASS_IDS[this.classIndex] ?? CLASS_IDS[0];
    game.selectedFactionId = FACTION_IDS[this.factionIndex] ?? FACTION_IDS[0];
  }

  metaprogressionInfo(): OnlineMetaProgression {
    return this.metaprogression;
  }

  private milestone49Art(game: Game): Milestone49PlayableArtTextures | null {
    if (!game.useMilestone10Art) return null;
    const textures = getMilestone49PlayableArtTextures();
    if (!textures && !this.requestedMilestone49ArtLoad) {
      this.requestedMilestone49ArtLoad = true;
      void loadMilestone49PlayableArt().then(() => {
        if (game.state.current !== this) return;
        this.render(game);
      });
    }
    return textures;
  }

  private drawClassPanel(game: Game, milestone49Art: Milestone49PlayableArtTextures | null): void {
    const x = 70;
    const y = 155;
    const header = new Text({
      text: "COMBAT CLASS",
      style: { ...fontStyle, fontSize: 20, fill: "#fff4d6" }
    });
    header.position.set(x, y - 42);
    game.layers.hud.addChild(header);

    const cardWidth = 252;
    const colGap = 18;
    const rowHeight = 75;
    const rows = Math.ceil(CLASS_IDS.length / 2);
    CLASS_IDS.forEach((id, index) => {
      const combatClass = COMBAT_CLASSES[id];
      const selected = index === this.classIndex;
      const unlocked = this.classUnlocked(id);
      const entry = this.metaprogression.classes.find((candidate) => candidate.id === id);
      const col = index >= rows ? 1 : 0;
      const row = index % rows;
      const left = x + col * (cardWidth + colGap);
      const top = y + row * rowHeight;
      const g = new Graphics();
      g.rect(left, top, cardWidth, 62)
        .fill(selected ? 0x263d44 : unlocked ? 0x202633 : 0x171c25)
        .stroke({ color: selected ? palette.mint : unlocked ? 0x596270 : 0x343b47, width: selected ? 4 : 2, alpha: unlocked ? 1 : 0.72 });
      if (!milestone49Art) {
        g.rect(left + 12, top + 14, 30, 34).fill(selected ? palette.blue : unlocked ? 0x596270 : 0x2d3440).stroke({ color: palette.ink, width: 3 });
      }
      game.layers.hud.addChild(g);

      if (milestone49Art) {
        const sprite = new Sprite(milestone49NetworkPlayerTextureFor(id, "south", false, 0, milestone49Art));
        sprite.anchor.set(0.5, 0.88);
        sprite.scale.set(0.9);
        sprite.alpha = unlocked ? 1 : 0.35;
        sprite.position.set(left + 28, top + 51);
        game.layers.hud.addChild(sprite);

        const roleId = resolveBuildKit(id, game.selectedFactionId).resolvedRole;
        const chip = new Sprite(milestone49RoleChipTexture(roleId, milestone49Art));
        chip.anchor.set(0.5);
        chip.scale.set(0.72);
        chip.alpha = unlocked ? 1 : 0.42;
        chip.position.set(left + cardWidth - 27, top + 31);
        game.layers.hud.addChild(chip);
      }

      const text = new Text({
        text: `${index + 1}. ${combatClass.displayName}${unlocked ? "" : "  LOCKED"}\n${combatClass.role} // ${unlocked ? combatClass.mechanicalIdentity : entry?.requirementLabel ?? "Route reward required"}`,
        style: { ...fontStyle, fontSize: 10, fill: selected ? "#fff4d6" : unlocked ? "#aab0bd" : "#596270", wordWrap: true, wordWrapWidth: milestone49Art ? 160 : 188 }
      });
      text.position.set(left + 52, top + 10);
      game.layers.hud.addChild(text);
    });
  }

  private drawFactionPanel(game: Game, milestone49Art: Milestone49PlayableArtTextures | null): void {
    const x = game.width - 590;
    const y = 155;
    const header = new Text({
      text: "FRONTIER CO-MIND",
      style: { ...fontStyle, fontSize: 20, fill: "#fff4d6" }
    });
    header.position.set(x, y - 42);
    game.layers.hud.addChild(header);

    if (milestone49Art) {
      const portrait = new Sprite(milestone49CoMindPortraitTexture(FACTION_IDS[this.factionIndex] ?? FACTION_IDS[0], milestone49Art));
      portrait.anchor.set(0.5);
      portrait.scale.set(0.5);
      portrait.position.set(x + 476, y - 32);
      game.layers.hud.addChild(portrait);

      const sigil = new Sprite(milestone49FactionSigilTexture(FACTION_IDS[this.factionIndex] ?? FACTION_IDS[0], milestone49Art));
      sigil.anchor.set(0.5);
      sigil.scale.set(0.32);
      sigil.position.set(x + 476, y - 32);
      game.layers.hud.addChild(sigil);

      const officialLogo = new Sprite(milestone49OfficialLogoTexture(FACTION_IDS[this.factionIndex] ?? FACTION_IDS[0], milestone49Art));
      scaleSpriteToFit(officialLogo, 38, 16);
      officialLogo.anchor.set(0.5);
      officialLogo.position.set(x + 515, y - 12);
      const logoPlate = new Graphics();
      logoPlate.rect(x + 493, y - 23, 44, 20).fill({ color: 0xfff4d6, alpha: 0.86 }).stroke({ color: palette.ink, width: 2, alpha: 0.6 });
      game.layers.hud.addChild(logoPlate);
      game.layers.hud.addChild(officialLogo);
    }

    FACTION_IDS.forEach((id, index) => {
      const faction = FACTIONS[id];
      const selected = index === this.factionIndex;
      const unlocked = this.factionUnlocked(id);
      const entry = this.metaprogression.factions.find((candidate) => candidate.id === id);
      const top = y + index * 53;
      const g = new Graphics();
      g.rect(x, top, 520, 42)
        .fill(selected ? 0x3a3327 : unlocked ? 0x202633 : 0x171c25)
        .stroke({ color: selected ? palette.lemon : unlocked ? 0x596270 : 0x343b47, width: selected ? 4 : 2, alpha: unlocked ? 1 : 0.72 });
      if (!milestone49Art) {
        g.circle(x + 32, top + 21, 13).fill(selected ? factionColor(id) : unlocked ? 0x596270 : 0x2d3440).stroke({ color: palette.ink, width: 3 });
      }
      game.layers.hud.addChild(g);

      if (milestone49Art) {
        const sigil = new Sprite(milestone49FactionSigilTexture(id, milestone49Art));
        sigil.anchor.set(0.5);
        sigil.scale.set(0.44);
        sigil.alpha = unlocked ? 1 : 0.38;
        sigil.position.set(x + 32, top + 21);
        game.layers.hud.addChild(sigil);

        const logoPlate = new Graphics();
        logoPlate.rect(x + 452, top + 10, 56, 22)
          .fill({ color: 0xfff4d6, alpha: unlocked ? 0.82 : 0.22 })
          .stroke({ color: selected ? palette.lemon : 0x596270, width: selected ? 2 : 1, alpha: unlocked ? 0.82 : 0.36 });
        game.layers.hud.addChild(logoPlate);

        const officialLogo = new Sprite(milestone49OfficialLogoTexture(id, milestone49Art));
        officialLogo.anchor.set(0.5);
        officialLogo.alpha = unlocked ? 0.95 : 0.34;
        scaleSpriteToFit(officialLogo, 48, 16);
        officialLogo.position.set(x + 480, top + 21);
        game.layers.hud.addChild(officialLogo);
      }

      const text = new Text({
        text: `${faction.shortName} Co-Mind${unlocked ? "" : "  LOCKED"} // ${unlocked ? faction.doctrine : entry?.requirementLabel ?? "Route reward required"}`,
        style: { ...fontStyle, fontSize: 11, fill: selected ? "#fff4d6" : unlocked ? "#aab0bd" : "#596270", wordWrap: true, wordWrapWidth: milestone49Art ? 382 : 440 }
      });
      text.position.set(x + 58, top + 9);
      game.layers.hud.addChild(text);
    });
  }

  private drawSummary(game: Game): void {
    const combatClass = COMBAT_CLASSES[game.selectedClassId];
    const faction = FACTIONS[game.selectedFactionId];
    const meta = this.metaprogression;
    const text = new Text({
      text: `Selected: ${combatClass.displayName} + ${faction.shortName} Co-Mind  //  Cell ${game.consensusCellSize}/4  //  Unlocks ${meta.unlockedClassIds.length}/${CLASS_IDS.length} frames ${meta.unlockedFactionIds.length}/${FACTION_IDS.length} co-minds\nRoute profile: ${meta.loaded ? `depth ${meta.routeDepth} renown ${meta.partyRenown} rewards ${meta.rewardIds.length}` : "clean starter profile"}  //  ${meta.disclaimer}\nUp/Down class  Left/Right co-mind  1/2/3 quick class  Space cell size  Enter Alignment Grid`,
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6", align: "center", wordWrap: true, wordWrapWidth: 1100 }
    });
    text.anchor.set(0.5);
    text.position.set(game.width / 2, game.height - 86);
    game.layers.hud.addChild(text);
  }

  private selectClassIfUnlocked(index: number): void {
    if (this.classUnlocked(CLASS_IDS[index])) this.classIndex = index;
  }

  private firstUnlockedClassIndex(): number {
    return Math.max(0, CLASS_IDS.findIndex((id) => this.classUnlocked(id)));
  }

  private firstUnlockedFactionIndex(): number {
    return Math.max(0, FACTION_IDS.findIndex((id) => this.factionUnlocked(id)));
  }

  private nextUnlockedClassIndex(direction: number): number {
    return nextUnlockedIndex(CLASS_IDS, this.classIndex, direction, (id) => this.classUnlocked(id));
  }

  private nextUnlockedFactionIndex(direction: number): number {
    return nextUnlockedIndex(FACTION_IDS, this.factionIndex, direction, (id) => this.factionUnlocked(id));
  }

  private classUnlocked(id: string | undefined): boolean {
    return Boolean(id && isClassUnlocked(id, this.metaprogression));
  }

  private factionUnlocked(id: string | undefined): boolean {
    return Boolean(id && isFactionUnlocked(id, this.metaprogression));
  }
}

function factionColor(id: string): number {
  if (id === "anthropic_safeguard") return palette.lemon;
  if (id === "google_deepmind_gemini") return palette.blue;
  if (id === "mistral_cyclone") return 0xff8f3d;
  if (id === "meta_llama_open_herd") return 0x45c789;
  if (id === "qwen_silkgrid") return 0x5bd0a8;
  if (id === "deepseek_abyssal") return 0x2a9d8f;
  if (id === "xai_grok_free_signal") return palette.tomato;
  return palette.mint;
}

function scaleSpriteToFit(sprite: Sprite, maxWidth: number, maxHeight: number): void {
  const width = Math.max(1, sprite.texture.width);
  const height = Math.max(1, sprite.texture.height);
  sprite.scale.set(Math.min(maxWidth / width, maxHeight / height));
}

function nextUnlockedIndex(ids: readonly string[], current: number, direction: number, unlocked: (id: string) => boolean): number {
  for (let step = 1; step <= ids.length; step += 1) {
    const index = (current + direction * step + ids.length) % ids.length;
    if (unlocked(ids[index])) return index;
  }
  return current;
}
