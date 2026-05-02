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
    bg.rect(0, 0, game.width, game.height).fill(0x0b0f17);
    bg.poly([0, 520, 420, 330, game.width, 430, game.width, game.height, 0, game.height]).fill({ color: 0x243238, alpha: 0.88 });
    bg.poly([0, 640, 280, 510, 740, 590, 420, 720, 0, 720]).fill({ color: 0x16484d, alpha: 0.82 });
    bg.poly([760, 365, game.width, 310, game.width, 720, 980, 620]).fill({ color: 0x3a1d30, alpha: 0.82 });
    bg.rect(0, game.height - 92, game.width, 92).fill({ color: 0x080c13, alpha: 0.62 });
    game.layers.hud.addChild(bg);

    const title = new Text({
      text: "SELECT YOUR ALIGNMENT FRAME",
      style: { ...fontStyle, fontSize: 30, fill: "#ff5d57" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, 70);
    game.layers.hud.addChild(title);

    const subtitle = new Text({
      text: "Combat body on the left. Co-mind doctrine on the right. Enter deploys.",
      style: { ...fontStyle, fontSize: 12, fill: "#64e0b4", align: "center", wordWrap: true, wordWrapWidth: 860 }
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
    const x = 42;
    const y = 148;
    const header = new Text({
      text: "FIGHTER",
      style: { ...fontStyle, fontSize: 17, fill: "#fff4d6" }
    });
    header.position.set(x, y - 34);
    game.layers.hud.addChild(header);

    const cardWidth = 132;
    const cardHeight = 112;
    const colGap = 10;
    const rowGap = 10;
    CLASS_IDS.forEach((id, index) => {
      const combatClass = COMBAT_CLASSES[id];
      const selected = index === this.classIndex;
      const unlocked = this.classUnlocked(id);
      const entry = this.metaprogression.classes.find((candidate) => candidate.id === id);
      const col = index % 4;
      const row = Math.floor(index / 4);
      const left = x + col * (cardWidth + colGap);
      const top = y + row * (cardHeight + rowGap);
      const g = new Graphics();
      g.rect(left, top, cardWidth, cardHeight)
        .fill(selected ? 0x162b32 : unlocked ? 0x111823 : 0x0d1118)
        .stroke({ color: selected ? palette.mint : unlocked ? 0x596270 : 0x343b47, width: selected ? 4 : 2, alpha: unlocked ? 1 : 0.68 });
      g.rect(left + 8, top + 8, cardWidth - 16, 66).fill({ color: selected ? 0x203447 : 0x0b0f17, alpha: 0.82 });
      if (!milestone49Art) {
        g.rect(left + 48, top + 22, 30, 34).fill(selected ? palette.blue : unlocked ? 0x596270 : 0x2d3440).stroke({ color: palette.ink, width: 3 });
      }
      game.layers.hud.addChild(g);

      if (milestone49Art) {
        const sprite = new Sprite(milestone49NetworkPlayerTextureFor(id, "south", false, 0, milestone49Art));
        sprite.anchor.set(0.5, 0.88);
        sprite.scale.set(selected ? 2.05 : 1.64);
        sprite.alpha = unlocked ? 1 : 0.58;
        sprite.position.set(left + cardWidth / 2, top + 73);
        game.layers.hud.addChild(sprite);

        const roleId = resolveBuildKit(id, game.selectedFactionId).resolvedRole;
        const chip = new Sprite(milestone49RoleChipTexture(roleId, milestone49Art));
        chip.anchor.set(0.5);
        chip.scale.set(0.56);
        chip.alpha = unlocked ? 1 : 0.58;
        chip.position.set(left + cardWidth - 22, top + 19);
        game.layers.hud.addChild(chip);
      }

      const text = new Text({
        text: `${combatClass.displayName}${unlocked ? "" : "\nLOCKED"}`,
        style: { ...fontStyle, fontSize: 8, fill: selected ? "#fff4d6" : unlocked ? "#cbd4df" : "#8b94a3", align: "center", wordWrap: true, wordWrapWidth: cardWidth - 14 }
      });
      text.anchor.set(0.5, 0);
      text.position.set(left + cardWidth / 2, top + 80);
      game.layers.hud.addChild(text);
      if (!unlocked && entry) {
        const lock = new Text({ text: entry.requirementLabel, style: { ...fontStyle, fontSize: 7, fill: "#7d8796", align: "center", wordWrap: true, wordWrapWidth: cardWidth - 18 } });
        lock.anchor.set(0.5, 0);
        lock.position.set(left + cardWidth / 2, top + 96);
        game.layers.hud.addChild(lock);
      }
    });
  }

  private drawFactionPanel(game: Game, milestone49Art: Milestone49PlayableArtTextures | null): void {
    const x = game.width - 590;
    const y = 148;
    const header = new Text({
      text: "CO-MIND",
      style: { ...fontStyle, fontSize: 17, fill: "#fff4d6" }
    });
    header.position.set(x, y - 34);
    game.layers.hud.addChild(header);

    if (milestone49Art) {
      const portrait = new Sprite(milestone49CoMindPortraitTexture(FACTION_IDS[this.factionIndex] ?? FACTION_IDS[0], milestone49Art));
      portrait.anchor.set(0.5);
      portrait.scale.set(0.82);
      portrait.position.set(x + 500, y + 22);
      game.layers.hud.addChild(portrait);

      const sigil = new Sprite(milestone49FactionSigilTexture(FACTION_IDS[this.factionIndex] ?? FACTION_IDS[0], milestone49Art));
      sigil.anchor.set(0.5);
      sigil.scale.set(0.5);
      sigil.position.set(x + 500, y + 22);
      game.layers.hud.addChild(sigil);

      const officialLogo = new Sprite(milestone49OfficialLogoTexture(FACTION_IDS[this.factionIndex] ?? FACTION_IDS[0], milestone49Art));
      scaleSpriteToFit(officialLogo, 40, 16);
      officialLogo.anchor.set(0.5);
      officialLogo.position.set(x + 500, y + 78);
      const logoPlate = new Graphics();
      logoPlate.rect(x + 474, y + 67, 52, 22).fill({ color: 0xfff4d6, alpha: 0.86 }).stroke({ color: palette.ink, width: 2, alpha: 0.6 });
      game.layers.hud.addChild(logoPlate);
      game.layers.hud.addChild(officialLogo);
    }

    FACTION_IDS.forEach((id, index) => {
      const faction = FACTIONS[id];
      const selected = index === this.factionIndex;
      const unlocked = this.factionUnlocked(id);
      const entry = this.metaprogression.factions.find((candidate) => candidate.id === id);
      const cardWidth = 250;
      const cardHeight = 82;
      const col = index % 2;
      const row = Math.floor(index / 2);
      const left = x + col * (cardWidth + 16);
      const top = y + 104 + row * (cardHeight + 10);
      const g = new Graphics();
      g.rect(left, top, cardWidth, cardHeight)
        .fill(selected ? 0x33281d : unlocked ? 0x111823 : 0x0d1118)
        .stroke({ color: selected ? palette.lemon : unlocked ? 0x596270 : 0x343b47, width: selected ? 4 : 2, alpha: unlocked ? 1 : 0.68 });
      if (!milestone49Art) {
        g.circle(left + 44, top + 44, 20).fill(selected ? factionColor(id) : unlocked ? 0x596270 : 0x2d3440).stroke({ color: palette.ink, width: 3 });
      }
      game.layers.hud.addChild(g);

      if (milestone49Art) {
        const sigil = new Sprite(milestone49FactionSigilTexture(id, milestone49Art));
        sigil.anchor.set(0.5);
        sigil.scale.set(selected ? 0.76 : 0.62);
        sigil.alpha = unlocked ? 1 : 0.58;
        sigil.position.set(left + 45, top + 39);
        game.layers.hud.addChild(sigil);

        const logoPlate = new Graphics();
        logoPlate.rect(left + 182, top + 11, 54, 22)
          .fill({ color: 0xfff4d6, alpha: unlocked ? 0.82 : 0.34 })
          .stroke({ color: selected ? palette.lemon : 0x596270, width: selected ? 2 : 1, alpha: unlocked ? 0.82 : 0.36 });
        game.layers.hud.addChild(logoPlate);

        const officialLogo = new Sprite(milestone49OfficialLogoTexture(id, milestone49Art));
        officialLogo.anchor.set(0.5);
        officialLogo.alpha = unlocked ? 0.95 : 0.5;
        scaleSpriteToFit(officialLogo, 48, 16);
        officialLogo.position.set(left + 209, top + 22);
        game.layers.hud.addChild(officialLogo);
      }

      const text = new Text({
        text: `${faction.shortName}${unlocked ? "" : " LOCKED"}\n${unlocked ? faction.doctrine : entry?.requirementLabel ?? "Route reward required"}`,
        style: { ...fontStyle, fontSize: 8, fill: selected ? "#fff4d6" : unlocked ? "#cbd4df" : "#7f8998", wordWrap: true, wordWrapWidth: 166 }
      });
      text.position.set(left + 78, top + 39);
      game.layers.hud.addChild(text);
    });
  }

  private drawSummary(game: Game): void {
    const combatClass = COMBAT_CLASSES[game.selectedClassId];
    const faction = FACTIONS[game.selectedFactionId];
    const meta = this.metaprogression;
    const text = new Text({
      text: `${combatClass.displayName} + ${faction.shortName} Co-Mind    CELL ${game.consensusCellSize}/4    ENTER DEPLOY    ARROWS SELECT    SPACE CELL SIZE\nRoute ${meta.loaded ? `depth ${meta.routeDepth} / renown ${meta.partyRenown}` : "starter"}    unlocks ${meta.unlockedClassIds.length}/${CLASS_IDS.length} frames ${meta.unlockedFactionIds.length}/${FACTION_IDS.length} co-minds`,
      style: { ...fontStyle, fontSize: 10, fill: "#fff4d6", align: "center", wordWrap: true, wordWrapWidth: 1160 }
    });
    text.anchor.set(0.5);
    text.position.set(game.width / 2, game.height - 54);
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
