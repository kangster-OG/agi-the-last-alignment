import { Application, Assets, Graphics, Sprite, Text, Texture } from "pixi.js";
import { Input } from "./Input";
import { FixedTicker } from "./Ticker";
import { StateMachine, type GameState } from "./StateMachine";
import { IsoCamera } from "../iso/camera";
import { createLayers, type RenderLayers, clearAllLayers } from "../render/layers";
import { palette, fontStyle } from "./Assets";
import { OverworldState } from "../overworld/OverworldState";
import { MAP_GRAPH } from "../overworld/mapGraph";
import { START_NODE_ID } from "../overworld/mapGraph";
import { LevelRunState } from "../level/LevelRunState";
import { renderGameToText } from "../proof/renderGameToText";
import { GAME_TAGLINE, PARODY_DISCLAIMER } from "../content/uiText";
import { ArenaBriefingState } from "../ui/briefing";
import { BuildSelectState } from "../ui/buildSelect";
import { LastAlignmentHubState } from "../ui/hub";
import { RouteContractChoiceState } from "../ui/routeChoice";
import { STARTER_CLASS_ID, STARTER_FACTION_ID } from "../content";
import { clampConsensusCellSize } from "../sim/consensusCell";
import { OnlineCoopState } from "../network/OnlineCoopState";
import { AssetPreviewState, type AssetPreviewKind } from "../ui/assetPreview";
import { createFeedbackSystem } from "./feedback";
import { loadArmisticeAuthoredGround, loadArmisticeGroundAtlas, loadArmisticeTransitionAtlas } from "../assets/armisticeGroundAtlas";
import { loadArmisticeSourceRebuildV2 } from "../assets/armisticeSourceRebuildV2";
import { loadMilestone11Art } from "../assets/milestone11Art";
import { loadMilestone12Art } from "../assets/milestone12Art";
import { loadMilestone14Art } from "../assets/milestone14Art";
import { loadMilestone49PlayableArt } from "../assets/milestone49PlayableArt";
import { loadBuildWeaponVfxTextures } from "../assets/buildWeaponVfx";
import titleBackdropUrl from "../../assets/ui/armistice_title_backdrop.png";
import { DEFAULT_KERNEL_MODULE_IDS } from "../roguelite/kernel";
import { DEFAULT_CONSENSUS_BURST_PATH, type ConsensusBurstPathId } from "../roguelite/burst";
import {
  evaluateMastery,
  evaluateSecrets,
  routeContractById,
  routeContractForSelection,
  type MasteryBadge,
  type RunOutcomeForRoguelite,
  type SecretUnlock
} from "../roguelite/deepRoguelite";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    set_consensus_cell_size?: (size: number) => void;
  }
}

class MainMenuState implements GameState {
  readonly mode = "MainMenu" as const;
  private backdrop: Texture | null = null;
  private requestedBackdrop = false;

  enter(game: Game): void {
    if (!this.backdrop && !this.requestedBackdrop) {
      this.requestedBackdrop = true;
      void Assets.load<Texture>(titleBackdropUrl).then((texture) => {
        this.backdrop = texture;
        if (game.state.current === this) this.render(game);
      });
    }
    this.render(game);
  }

  exit(): void {}

  update(game: Game): void {
    if (game.input.wasPressed("one")) game.feedback.cycleMasterVolume();
    if (game.input.wasPressed("two")) game.feedback.cycleSfxVolume();
    if (game.input.wasPressed("three")) game.feedback.cycleMusicVolume();
    if (game.input.wasPressed("four")) game.feedback.toggleReducedFlash();
    if (game.input.wasPressed("interact")) {
      game.feedback.cue("ui.enter_build_select", "ui");
      game.state.set(new BuildSelectState());
    }
    if (game.input.wasPressed("coop")) {
      game.feedback.cue("ui.enter_online_coop", "ui");
      game.state.set(new OnlineCoopState());
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);
    const bg = new Graphics();
    bg.rect(0, 0, game.width, game.height).fill(0x0b0f17);
    game.layers.hud.addChild(bg);
    if (this.backdrop) {
      const sprite = new Sprite(this.backdrop);
      sprite.anchor.set(0.5);
      sprite.position.set(game.width / 2, game.height / 2);
      sprite.scale.set(Math.max(game.width / this.backdrop.width, game.height / this.backdrop.height));
      game.layers.hud.addChild(sprite);
      const shade = new Graphics();
      shade.rect(0, 0, game.width, game.height).fill({ color: 0x05080d, alpha: 0.28 });
      game.layers.hud.addChild(shade);
    } else {
      for (let i = 0; i < 34; i += 1) {
        const x = (i * 137) % game.width;
        const y = (i * 89) % game.height;
        bg.rect(x, y, 42, 26).fill({ color: i % 2 ? palette.mint : palette.tomato, alpha: 0.24 });
      }
    }

    const panel = new Graphics();
    panel.rect(game.width / 2 - 390, 136, 780, 356)
      .fill({ color: 0x0b1019, alpha: 0.72 })
      .stroke({ color: palette.mint, width: 3, alpha: 0.82 });
    panel.rect(game.width / 2 - 340, 302, 680, 3).fill({ color: palette.lemon, alpha: 0.72 });
    game.layers.hud.addChild(panel);

    const title = new Text({
      text: "AGI",
      style: { ...fontStyle, fontSize: 72, fill: "#ff5d57", align: "center" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, 210);
    game.layers.hud.addChild(title);

    const title2 = new Text({
      text: "THE LAST ALIGNMENT",
      style: { ...fontStyle, fontSize: 30, fill: "#ffd166", align: "center" }
    });
    title2.anchor.set(0.5);
    title2.position.set(game.width / 2, 272);
    game.layers.hud.addChild(title2);

    const subtitle = new Text({
      text: `${GAME_TAGLINE}\n\nSOLO FRAME  /  LOCAL CELL  /  ONLINE CO-OP`,
      style: { ...fontStyle, fontSize: 15, align: "center", wordWrap: true, wordWrapWidth: 760, fill: "#64e0b4" }
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(game.width / 2, 360);
    game.layers.hud.addChild(subtitle);

    const start = new Text({
      text: "PRESS ENTER",
      style: { ...fontStyle, fontSize: 24, fill: "#fff4d6", align: "center" }
    });
    start.anchor.set(0.5);
    start.position.set(game.width / 2, 436);
    game.layers.hud.addChild(start);

    const disclaimer = new Text({
      text: `${PARODY_DISCLAIMER}\n1/2/3 volume  4 reduced flash ${game.feedback.snapshot().accessibility.reducedFlash ? "ON" : "OFF"}`,
      style: { ...fontStyle, fontSize: 9, align: "center", wordWrap: true, wordWrapWidth: 920, fill: "#aab0bd" }
    });
    disclaimer.anchor.set(0.5);
    disclaimer.position.set(game.width / 2, game.height - 40);
    game.layers.hud.addChild(disclaimer);
  }
}

export class Game {
  readonly app = new Application();
  readonly input = new Input();
  readonly ticker = new FixedTicker();
  readonly state = new StateMachine(this);
  readonly camera = new IsoCamera();
  layers!: RenderLayers;
  width = 1280;
  height = 720;
  completedNodes = new Set<string>();
  unlockedNodes = new Set<string>([START_NODE_ID]);
  lastNodeId = START_NODE_ID;
  selectedClassId = STARTER_CLASS_ID;
  selectedFactionId = STARTER_FACTION_ID;
  selectedKernelModuleIds: string[] = [...DEFAULT_KERNEL_MODULE_IDS];
  selectedEvalProtocolIds: string[] = [];
  selectedConsensusBurstPathId: ConsensusBurstPathId = DEFAULT_CONSENSUS_BURST_PATH;
  selectedRouteContractId = "stabilize_armistice";
  lastRunMemory: {
    completed: boolean;
    nodeId: string;
    kills: number;
    seconds: number;
    burstActivations?: number;
    routeContractId?: string;
    objectiveCompleted?: number;
    objectiveTotal?: number;
    thesis?: string;
    proofTokensAwarded?: number;
    proofTokensTotal?: number;
    newSecrets?: SecretUnlock[];
    newMastery?: MasteryBadge[];
  } | null = null;
  proofTokens = 0;
  secretUnlockIds = new Set<string>();
  masteryBadgeIds = new Set<string>();
  campEvents: string[] = ["The camp is quiet. That is not reassuring."];
  consensusCellSize = 1;
  private readonly query = new URLSearchParams(window.location.search);
  readonly feedback = createFeedbackSystem(this.query);
  readonly assetPreview = this.query.get("assetPreview");
  readonly productionArtDefaulted = !isDisabledQueryFlag(this.query, "productionArt") && !isEnabledQueryFlag(this.query, "placeholderArt");
  readonly armisticeTileAtlasDefaulted = !isDisabledQueryFlag(this.query, "armisticeTiles") && !isEnabledQueryFlag(this.query, "placeholderTiles");
  readonly useArmisticeTileAtlas = this.armisticeTileAtlasDefaulted || isEnabledQueryFlag(this.query, "armisticeTiles");
  readonly useMilestone10Art = this.productionArtDefaulted || isEnabledQueryFlag(this.query, "productionArt");
  readonly showDebugHud = isEnabledQueryFlag(this.query, "debugHud") || isEnabledQueryFlag(this.query, "proofHud");
  private booted = false;

  constructor(private readonly root: HTMLElement) {}

  async boot(): Promise<void> {
    await this.app.init({
      resizeTo: this.root,
      background: palette.ink,
      antialias: false,
      resolution: Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    });
    this.root.appendChild(this.app.canvas);
    this.layers = createLayers(this.app.stage);
    this.resize();
    window.addEventListener("resize", () => this.resize());

    window.render_game_to_text = () => renderGameToText(this);
    window.set_consensus_cell_size = (size: number) => {
      this.consensusCellSize = clampConsensusCellSize(size);
    };
    window.advanceTime = (ms: number) => {
      this.ticker.advance(ms, (dt) => this.frame(dt));
      this.forceRender();
    };

    if (
      this.assetPreview === "armistice_ground_atlas" ||
      this.assetPreview === "accord_striker_raw" ||
      this.assetPreview === "accord_striker_transparent_sheet" ||
      this.assetPreview === "milestone10_runtime_set" ||
      this.assetPreview === "milestone11_enemy_set" ||
      this.assetPreview === "milestone11_prop_set" ||
      this.assetPreview === "milestone11_ui_set" ||
      this.assetPreview === "milestone12_default_candidate" ||
      this.assetPreview === "milestone14_combat_art"
    ) {
      this.state.set(new AssetPreviewState(this.assetPreview as AssetPreviewKind));
    } else {
      this.state.set(new MainMenuState());
    }
    this.app.ticker.add((ticker) => {
      this.ticker.step(ticker.deltaMS / 1000, (dt) => this.frame(dt));
    });
    this.booted = true;
  }

  createOverworld(): OverworldState {
    return new OverworldState();
  }

  createHub(): LastAlignmentHubState {
    return new LastAlignmentHubState();
  }

  createRouteChoice(): RouteContractChoiceState {
    return new RouteContractChoiceState();
  }

  startRun(nodeId: string): void {
    const node = MAP_GRAPH.nodes.find((candidate) => candidate.id === nodeId) ?? MAP_GRAPH.nodes[0];
    this.lastNodeId = node.id;
    this.preloadRunArt();
    this.state.set(new ArenaBriefingState(node.id, node.arenaId));
  }

  createRun(nodeId: string, arenaId: string): LevelRunState {
    this.preloadRunArt();
    const routeContract = routeContractForSelection(this.selectedEvalProtocolIds, this.completedNodes.size);
    const selectedRouteContract = this.selectedRouteContractId ? routeContractById(this.selectedRouteContractId) : routeContract;
    return new LevelRunState(
      nodeId,
      arenaId,
      this.selectedClassId,
      this.selectedFactionId,
      this.consensusCellSize,
      this.selectedKernelModuleIds,
      this.selectedEvalProtocolIds,
      this.selectedConsensusBurstPathId,
      selectedRouteContract
    );
  }

  recordRogueliteOutcome(outcome: RunOutcomeForRoguelite): void {
    const newSecrets = evaluateSecrets(outcome, [...this.secretUnlockIds]);
    const newMastery = evaluateMastery(outcome, [...this.masteryBadgeIds]);
    for (const secret of newSecrets) this.secretUnlockIds.add(secret.id);
    for (const badge of newMastery) this.masteryBadgeIds.add(badge.id);
    let proofTokensAwarded = 0;
    if (outcome.completed) {
      proofTokensAwarded += 1;
      proofTokensAwarded += outcome.evalProtocolIds.length;
      if (outcome.routeContractId === "faction_relay_argument" && outcome.evalProtocolIds.length > 0) proofTokensAwarded += 1;
      if (outcome.objective.anchors.every((anchor) => anchor.completed)) proofTokensAwarded += 1;
      if (outcome.routeContractId === "resource_cache_detour") proofTokensAwarded += 1;
    }
    this.proofTokens += proofTokensAwarded;
    const objectiveCompleted = outcome.objective.anchors.filter((anchor) => anchor.completed).length;
    const objectiveTotal = outcome.objective.anchors.length;
    this.lastRunMemory = {
      completed: outcome.completed,
      nodeId: outcome.nodeId,
      kills: outcome.kills,
      seconds: Math.floor(outcome.seconds),
      burstActivations: outcome.burstActivations,
      routeContractId: outcome.routeContractId,
      objectiveCompleted,
      objectiveTotal,
      thesis: outcome.chosenTags.length > 0 ? outcome.chosenTags[0] : "uncommitted",
      proofTokensAwarded,
      proofTokensTotal: this.proofTokens,
      newSecrets,
      newMastery
    };
    this.campEvents = [
      outcome.completed ? `Reality accepted ${outcome.nodeId}. Nobody said thank you, but the road stopped screaming.` : `The frame came back bent from ${outcome.nodeId}. The co-mind filed a complaint against physics.`,
      objectiveCompleted === objectiveTotal ? "All Treaty Anchors rebooted. The camp engineers are pretending this was expected." : `${objectiveCompleted}/${objectiveTotal} Treaty Anchors rebooted. A faction relay is already arguing about the denominator.`,
      newSecrets[0] ? `Secret unlocked: ${newSecrets[0].name}.` : newMastery[0] ? `Mastery recorded: ${newMastery[0].name}.` : `Proof Tokens: ${this.proofTokens}.`
    ];
  }

  private preloadRunArt(): void {
    if (this.useArmisticeTileAtlas) {
      void loadArmisticeGroundAtlas();
      void loadArmisticeTransitionAtlas();
      void loadArmisticeAuthoredGround();
    }
    if (this.useMilestone10Art) {
      void Promise.all([loadMilestone11Art(), loadMilestone12Art(), loadMilestone14Art(), loadMilestone49PlayableArt(), loadArmisticeSourceRebuildV2(), loadBuildWeaponVfxTextures()]);
    }
  }

  showMainMenu(): void {
    this.state.set(new MainMenuState());
  }

  unlockFrom(nodeId: string): void {
    for (const edge of MAP_GRAPH.edges) {
      if (edge.from === nodeId) this.unlockedNodes.add(edge.to);
    }
  }

  private resize(): void {
    this.width = this.app.renderer.width;
    this.height = this.app.renderer.height;
    if (this.booted) this.state.render();
  }

  private frame(dt: number): void {
    this.input.beginFrame();
    if (this.input.wasPressed("fullscreen")) {
      this.toggleFullscreen();
    }
    if (this.input.wasPressed("escape") && document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
    this.state.update(dt);
    this.state.render();
  }

  private forceRender(): void {
    this.state.render();
    this.app.renderer.render(this.app.stage);
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      this.root.requestFullscreen().catch(() => undefined);
    }
  }
}

function isEnabledQueryFlag(params: URLSearchParams, key: string): boolean {
  const value = params.get(key)?.toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function isDisabledQueryFlag(params: URLSearchParams, key: string): boolean {
  const value = params.get(key)?.toLowerCase();
  return value === "0" || value === "false" || value === "no" || value === "off";
}
