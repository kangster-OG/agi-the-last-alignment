import { Container, Graphics, Text } from "pixi.js";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { fontStyle, palette } from "../core/Assets";
import { clearAllLayers } from "../render/layers";
import {
  addArmisticeAtlasPreview,
  addArmisticeTileSprite,
  armisticeTileKeyForWorld,
  getArmisticeGroundAtlasTextures,
  loadArmisticeGroundAtlas,
  ARMISTICE_GROUND_ATLAS_ID,
  ARMISTICE_GROUND_ATLAS_URL
} from "../assets/armisticeGroundAtlas";
import {
  ACCORD_STRIKER_RAW_PREVIEW_ID,
  ACCORD_STRIKER_RAW_PREVIEW_URL,
  ACCORD_STRIKER_TRANSPARENT_SHEET_ID,
  ACCORD_STRIKER_TRANSPARENT_SHEET_URL,
  addAccordStrikerPreviewSprite,
  getAccordStrikerRawPreviewTexture,
  getAccordStrikerTransparentSheetTexture,
  loadAccordStrikerRawPreview,
  loadAccordStrikerTransparentSheet
} from "../assets/accordStrikerPreview";
import {
  MILESTONE10_ASSET_IDS,
  MILESTONE10_ASSET_URLS,
  addPreviewSprite,
  getMilestone10ArtTextures,
  loadMilestone10Art
} from "../assets/milestone10Art";
import { MILESTONE11_ASSET_IDS, addMilestone11PreviewSprite, getMilestone11ArtTextures, loadMilestone11Art } from "../assets/milestone11Art";
import { MILESTONE12_ASSET_IDS, getMilestone12ArtTextures, loadMilestone12Art } from "../assets/milestone12Art";
import { MILESTONE14_ASSET_IDS, getMilestone14ArtTextures, loadMilestone14Art, patchCardFrameForSource } from "../assets/milestone14Art";

export type AssetPreviewKind =
  | "armistice_ground_atlas"
  | "accord_striker_raw"
  | "accord_striker_transparent_sheet"
  | "milestone10_runtime_set"
  | "milestone11_enemy_set"
  | "milestone11_prop_set"
  | "milestone11_ui_set"
  | "milestone12_default_candidate"
  | "milestone14_combat_art";

export class AssetPreviewState implements GameState {
  readonly mode = "AssetPreview" as const;
  private loaded = false;
  private loadFailed = "";

  constructor(private readonly previewKind: AssetPreviewKind = "armistice_ground_atlas") {}

  enter(game: Game): void {
    const loader = this.loaderForPreview();
    void loader()
      .then(() => {
        this.loaded = true;
        this.render(game);
      })
      .catch((error: unknown) => {
        this.loadFailed = error instanceof Error ? error.message : String(error);
        this.render(game);
      });
  }

  exit(): void {}

  update(): void {}

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);

    const bg = new Graphics();
    bg.rect(0, 0, game.width, game.height).fill(0x10141b);
    game.layers.background.addChild(bg);

    const title = new Text({
      text: "DEV ASSET PREVIEW",
      style: { ...fontStyle, fontSize: 28, fill: "#ffd166" }
    });
    title.position.set(28, 24);
    game.layers.hud.addChild(title);

    if (this.previewKind === "milestone10_runtime_set") {
      this.renderMilestone10Preview(game);
    } else if (this.previewKind === "milestone11_enemy_set" || this.previewKind === "milestone11_prop_set" || this.previewKind === "milestone11_ui_set") {
      this.renderMilestone11Preview(game);
    } else if (this.previewKind === "milestone12_default_candidate") {
      this.renderMilestone12Preview(game);
    } else if (this.previewKind === "milestone14_combat_art") {
      this.renderMilestone14Preview(game);
    } else if (this.previewKind === "accord_striker_raw" || this.previewKind === "accord_striker_transparent_sheet") {
      this.renderAccordStrikerPreview(game);
    } else {
      this.renderArmisticeGroundPreview(game);
    }
  }

  private loaderForPreview(): () => Promise<unknown> {
    if (this.previewKind === "accord_striker_raw") return loadAccordStrikerRawPreview;
    if (this.previewKind === "accord_striker_transparent_sheet") return loadAccordStrikerTransparentSheet;
    if (this.previewKind === "milestone10_runtime_set") return loadMilestone10Art;
    if (this.previewKind === "milestone11_enemy_set" || this.previewKind === "milestone11_prop_set" || this.previewKind === "milestone11_ui_set") return loadMilestone11Art;
    if (this.previewKind === "milestone12_default_candidate") return loadMilestone12Art;
    if (this.previewKind === "milestone14_combat_art") return loadMilestone14Art;
    return loadArmisticeGroundAtlas;
  }

  private renderArmisticeGroundPreview(game: Game): void {
    const subtitle = this.previewStatusText(ARMISTICE_GROUND_ATLAS_ID, ARMISTICE_GROUND_ATLAS_URL);
    subtitle.position.set(30, 62);
    game.layers.hud.addChild(subtitle);

    const textures = getArmisticeGroundAtlasTextures();
    if (!textures) return;

    const preview = new Container();
    addArmisticeAtlasPreview(preview, textures, 110, 170, 2);
    game.layers.ground.addChild(preview);

    const tiledPatch = new Container();
    tiledPatch.position.set(730, 235);
    for (let y = -3; y <= 3; y += 1) {
      for (let x = -4; x <= 4; x += 1) {
        addArmisticeTileSprite(tiledPatch, textures, x, y, armisticeTileKeyForWorld(x, y));
      }
    }
    game.layers.ground.addChild(tiledPatch);

    const labels = new Text({
      text: "left: atlas frames    right: small tiled patch    gameplay replacement: ON by default; opt out with ?armisticeTiles=0",
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6" }
    });
    labels.position.set(30, game.height - 54);
    game.layers.hud.addChild(labels);

    const outline = new Graphics();
    outline.rect(22, 112, 470, 245).stroke({ color: palette.mint, width: 2, alpha: 0.45 });
    outline.rect(596, 112, 560, 390).stroke({ color: palette.lemon, width: 2, alpha: 0.45 });
    game.layers.hud.addChild(outline);
  }

  private renderAccordStrikerPreview(game: Game): void {
    const isTransparentSheet = this.previewKind === "accord_striker_transparent_sheet";
    const assetId = isTransparentSheet ? ACCORD_STRIKER_TRANSPARENT_SHEET_ID : ACCORD_STRIKER_RAW_PREVIEW_ID;
    const assetUrl = isTransparentSheet ? ACCORD_STRIKER_TRANSPARENT_SHEET_URL : ACCORD_STRIKER_RAW_PREVIEW_URL;
    const subtitle = this.previewStatusText(assetId, assetUrl);
    subtitle.position.set(30, 62);
    game.layers.hud.addChild(subtitle);

    const texture = isTransparentSheet ? getAccordStrikerTransparentSheetTexture() : getAccordStrikerRawPreviewTexture();
    if (!texture) return;

    const preview = new Container();
    preview.position.set(0, 0);
    game.layers.ground.addChild(preview);

    const tile = new Graphics();
    tile.ellipse(328, 428, 72, 24).fill({ color: palette.shadow, alpha: 0.42 });
    tile.ellipse(750, 458, 36, 12).fill({ color: palette.shadow, alpha: 0.32 });
    preview.addChild(tile);

    addAccordStrikerPreviewSprite(preview, texture, 328, 424, 3.25);
    addAccordStrikerPreviewSprite(preview, texture, 750, 456, 0.72);
    addAccordStrikerPreviewSprite(preview, texture, 820, 456, 0.55);
    addAccordStrikerPreviewSprite(preview, texture, 878, 456, 0.42);

    const labels = new Text({
      text: isTransparentSheet
        ? "left: cleaned transparent PixelLab-derived sheet    right: combat-scale samples    gameplay replacement: OFF"
        : "left: raw recovered PixelLab preview at inspection scale    right: combat-scale samples    gameplay replacement: OFF",
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6", wordWrap: true, wordWrapWidth: 1100 }
    });
    labels.position.set(30, game.height - 54);
    game.layers.hud.addChild(labels);

    const outline = new Graphics();
    outline.rect(92, 132, 470, 420).stroke({ color: palette.mint, width: 2, alpha: 0.45 });
    outline.rect(660, 286, 360, 230).stroke({ color: palette.lemon, width: 2, alpha: 0.45 });
    game.layers.hud.addChild(outline);
  }

  private renderMilestone10Preview(game: Game): void {
    const subtitle = this.previewStatusText(
      "milestone10.runtime_set",
      Object.entries(MILESTONE10_ASSET_IDS)
        .map(([role, id]) => `${role}: ${id}`)
        .join(" | ")
    );
    subtitle.position.set(30, 62);
    game.layers.hud.addChild(subtitle);

    const textures = getMilestone10ArtTextures();
    if (!textures) return;

    const preview = new Container();
    game.layers.ground.addChild(preview);

    const floor = new Graphics();
    floor
      .ellipse(246, 452, 112, 34)
      .fill({ color: palette.shadow, alpha: 0.38 })
      .stroke({ color: palette.mint, width: 2, alpha: 0.28 });
    floor.ellipse(636, 452, 180, 46).fill({ color: palette.shadow, alpha: 0.28 });
    floor.ellipse(992, 420, 140, 36).fill({ color: palette.shadow, alpha: 0.3 });
    preview.addChild(floor);

    const playerDirections = ["south", "east", "north", "west"] as const;
    playerDirections.forEach((direction, row) => {
      textures.player[direction].forEach((texture, frame) => {
        addPreviewSprite(preview, texture, 130 + frame * 78, 240 + row * 72, 2.3);
      });
      const label = new Text({
        text: direction.toUpperCase(),
        style: { ...fontStyle, fontSize: 11, fill: "#fff4d6" }
      });
      label.position.set(230, 208 + row * 72);
      game.layers.hud.addChild(label);
    });

    for (let index = 0; index < textures.badOutputs.length; index += 1) {
      addPreviewSprite(preview, textures.badOutputs[index], 482 + index * 76, 326, 2.8);
    }
    addPreviewSprite(preview, textures.coherenceShard, 728, 326, 3.2);
    addPreviewSprite(preview, textures.treatyMonument, 966, 398, 1.75);
    addPreviewSprite(preview, textures.oathEater, 570, 512, 1.6);
    addPreviewSprite(preview, textures.oathEaterPortrait, 770, 520, 1.08);

    const labels = new Text({
      text: [
        "left: Accord Striker 4-direction walk sheet",
        "center: Bad Outputs, Coherence Shard, Oath-Eater sprite/portrait",
        "right: Treaty Monument prop",
        "gameplay replacement: ON by default; opt out with ?productionArt=0"
      ].join("    "),
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6", wordWrap: true, wordWrapWidth: 1160 }
    });
    labels.position.set(30, game.height - 54);
    game.layers.hud.addChild(labels);

    const manifestLinks = new Text({
      text: Object.entries(MILESTONE10_ASSET_URLS)
        .map(([role, url]) => `${role}: ${url}`)
        .join("\n"),
      style: { ...fontStyle, fontSize: 10, fill: "#aab0bd", wordWrap: true, wordWrapWidth: 800 }
    });
    manifestLinks.position.set(336, 132);
    game.layers.hud.addChild(manifestLinks);

    const outline = new Graphics();
    outline.rect(86, 128, 222, 380).stroke({ color: palette.mint, width: 2, alpha: 0.45 });
    outline.rect(380, 210, 520, 370).stroke({ color: palette.lemon, width: 2, alpha: 0.45 });
    outline.rect(872, 168, 260, 330).stroke({ color: palette.tomato, width: 2, alpha: 0.45 });
    game.layers.hud.addChild(outline);
  }

  private renderMilestone11Preview(game: Game): void {
    const subtitle = this.previewStatusText(
      this.previewKind,
      `8 Milestone 11 manifest entries registered; primary IDs include ${MILESTONE11_ASSET_IDS.playerV2}, ${MILESTONE11_ASSET_IDS.benchmarkGremlins}, ${MILESTONE11_ASSET_IDS.contextRotCrabs}`
    );
    subtitle.position.set(30, 62);
    game.layers.hud.addChild(subtitle);

    const textures = getMilestone11ArtTextures();
    if (!textures) return;

    const preview = new Container();
    game.layers.ground.addChild(preview);

    const floor = new Graphics();
    floor.ellipse(260, 472, 190, 48).fill({ color: palette.shadow, alpha: 0.28 });
    floor.ellipse(670, 462, 250, 58).fill({ color: palette.shadow, alpha: 0.22 });
    floor.ellipse(1010, 468, 235, 56).fill({ color: palette.shadow, alpha: 0.26 });
    preview.addChild(floor);

    const playerDirections = ["south", "east", "north", "west"] as const;
    playerDirections.forEach((direction, row) => {
      textures.playerV2[direction].forEach((texture, frame) => {
        addMilestone11PreviewSprite(preview, texture, 92 + frame * 58, 234 + row * 66, 2.25);
      });
      const label = new Text({
        text: direction.toUpperCase(),
        style: { ...fontStyle, fontSize: 10, fill: "#fff4d6" }
      });
      label.position.set(270, 202 + row * 66);
      game.layers.hud.addChild(label);
    });

    textures.benchmarkGremlins.forEach((texture, index) => addMilestone11PreviewSprite(preview, texture, 430 + index * 72, 268, 2.9));
    textures.contextRotCrabs.forEach((texture, index) => addMilestone11PreviewSprite(preview, texture, 430 + index * 72, 382, 2.9));
    addMilestone11PreviewSprite(preview, textures.base.badOutputs[0], 640, 268, 2.7);
    addMilestone11PreviewSprite(preview, textures.base.badOutputs[1], 640, 382, 2.7);

    addMilestone11PreviewSprite(preview, textures.props.barricade_corridor, 830, 300, 0.92, 0.86);
    addMilestone11PreviewSprite(preview, textures.props.crashed_drone_yard, 1042, 298, 0.82, 0.86);
    addMilestone11PreviewSprite(preview, textures.props.emergency_alignment_terminal, 842, 520, 0.78, 0.86);
    addMilestone11PreviewSprite(preview, textures.props.cosmic_breach_crack, 1040, 520, 0.82, 0.86);
    addMilestone11PreviewSprite(preview, textures.openaiAccordMark, 1120, 172, 1.25, 0.5);

    const labels = new Text({
      text: [
        "left: Accord Striker v2 4-direction/3-frame readability pass",
        "center: Benchmark Gremlins + Context Rot Crabs beside Bad Outputs",
        "right: cached landmark prop set + original OpenAI Accord mark",
        "gameplay replacement: ON by default; opt out with ?productionArt=0"
      ].join("    "),
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6", wordWrap: true, wordWrapWidth: 1160 }
    });
    labels.position.set(30, game.height - 54);
    game.layers.hud.addChild(labels);

    const outline = new Graphics();
    outline.rect(58, 132, 272, 380).stroke({ color: palette.mint, width: 2, alpha: 0.45 });
    outline.rect(382, 196, 348, 260).stroke({ color: palette.lemon, width: 2, alpha: 0.45 });
    outline.rect(776, 136, 388, 440).stroke({ color: palette.tomato, width: 2, alpha: 0.45 });
    game.layers.hud.addChild(outline);
  }

  private renderMilestone12Preview(game: Game): void {
    const subtitle = this.previewStatusText(
      this.previewKind,
      `Milestone 12 IDs: ${MILESTONE12_ASSET_IDS.coopVariants}, ${MILESTONE12_ASSET_IDS.alignmentGridNodes}, ${MILESTONE12_ASSET_IDS.alignmentGridRoutes}`
    );
    subtitle.position.set(30, 62);
    game.layers.hud.addChild(subtitle);

    const textures = getMilestone12ArtTextures();
    if (!textures) return;

    const preview = new Container();
    game.layers.ground.addChild(preview);

    const slots = [0, 1, 2, 3];
    slots.forEach((slot) => {
      const y = 234 + slot * 72;
      textures.playerVariants[slot].south.forEach((texture, frame) => {
        addMilestone11PreviewSprite(preview, texture, 90 + frame * 58, y, 2.2);
      });
      const label = new Text({
        text: `P${slot + 1}`,
        style: { ...fontStyle, fontSize: 12, fill: "#fff4d6" }
      });
      label.position.set(270, y - 30);
      game.layers.hud.addChild(label);
    });

    const nodeKinds = ["plaza", "relay", "lake", "camp", "cache", "transit"] as const;
    nodeKinds.forEach((kind, index) => {
      addMilestone11PreviewSprite(preview, textures.alignmentGridNodes[kind], 430 + (index % 3) * 130, 220 + Math.floor(index / 3) * 180, 1.35, 0.86);
    });
    addMilestone11PreviewSprite(preview, textures.routeSigils.stable, 880, 250, 1.8, 0.78);
    addMilestone11PreviewSprite(preview, textures.routeSigils.unstable, 980, 250, 1.8, 0.78);
    addMilestone11PreviewSprite(preview, textures.routeSigils.locked, 1080, 250, 1.8, 0.78);
    addMilestone11PreviewSprite(preview, textures.base.openaiAccordMark, 980, 430, 1.45, 0.5);

    const labels = new Text({
      text: "left: P1-P4 co-op variants    center: Alignment Grid node landmarks    right: route-state sigils + original faction mark    default: ON after Milestone 13; opt out with ?productionArt=0",
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6", wordWrap: true, wordWrapWidth: 1160 }
    });
    labels.position.set(30, game.height - 54);
    game.layers.hud.addChild(labels);

    const outline = new Graphics();
    outline.rect(58, 142, 270, 414).stroke({ color: palette.mint, width: 2, alpha: 0.45 });
    outline.rect(372, 140, 430, 420).stroke({ color: palette.lemon, width: 2, alpha: 0.45 });
    outline.rect(832, 160, 330, 330).stroke({ color: palette.tomato, width: 2, alpha: 0.45 });
    game.layers.hud.addChild(outline);
  }

  private renderMilestone14Preview(game: Game): void {
    const subtitle = this.previewStatusText(
      this.previewKind,
      `Milestone 14 IDs: ${MILESTONE14_ASSET_IDS.combatEffects}, ${MILESTONE14_ASSET_IDS.emergencyPatchCards}`
    );
    subtitle.position.set(30, 62);
    game.layers.hud.addChild(subtitle);

    const textures = getMilestone14ArtTextures();
    if (!textures) return;

    const preview = new Container();
    game.layers.ground.addChild(preview);

    const effectFrames = [
      "projectile",
      "projectileTrail",
      "impactSmall",
      "impactMedium",
      "impactLarge",
      "pickupSmall",
      "pickupMedium",
      "pickupLarge",
      "refusalAura",
      "damageBadge"
    ] as const;
    effectFrames.forEach((frame, index) => {
      addMilestone11PreviewSprite(preview, textures.combatEffects[frame], 92 + index * 70, 250, frame === "refusalAura" ? 2.4 : 2.1, 0.5);
    });

    const sources = ["general", "faction", "class", "evolution"] as const;
    sources.forEach((source, index) => {
      addMilestone11PreviewSprite(preview, textures.patchCards[patchCardFrameForSource(source)], 176 + index * 210, 500, 1.38, 0.5);
    });

    const labels = new Text({
      text: "top: projectile, trail, impact, pickup sparkle, aura, damage badge    bottom: emergency patch card frame families    default runtime: ON",
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6", wordWrap: true, wordWrapWidth: 1160 }
    });
    labels.position.set(30, game.height - 54);
    game.layers.hud.addChild(labels);

    const outline = new Graphics();
    outline.rect(58, 168, 732, 150).stroke({ color: palette.mint, width: 2, alpha: 0.45 });
    outline.rect(82, 368, 858, 210).stroke({ color: palette.lemon, width: 2, alpha: 0.45 });
    game.layers.hud.addChild(outline);
  }

  private previewStatusText(assetId: string, sourceUrl: string): Text {
    return new Text({
      text: `${assetId}\n${sourceUrl}\nstatus: ${this.loadFailed ? `failed: ${this.loadFailed}` : this.loaded ? "loaded through Pixi Assets" : "loading"}`,
      style: { ...fontStyle, fontSize: 12, fill: this.loadFailed ? "#ff5d57" : "#64e0b4", wordWrap: true, wordWrapWidth: 960 }
    });
  }
}
