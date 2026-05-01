import { Application, Graphics, Text } from "pixi.js";
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
import { GAME_TAGLINE, GAME_TITLE, PARODY_DISCLAIMER } from "../content/uiText";
import { ArenaBriefingState } from "../ui/briefing";
import { BuildSelectState } from "../ui/buildSelect";
import { STARTER_CLASS_ID, STARTER_FACTION_ID } from "../content";
import { clampConsensusCellSize } from "../sim/consensusCell";
import { OnlineCoopState } from "../network/OnlineCoopState";
import { AssetPreviewState, type AssetPreviewKind } from "../ui/assetPreview";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    set_consensus_cell_size?: (size: number) => void;
  }
}

class MainMenuState implements GameState {
  readonly mode = "MainMenu" as const;

  enter(game: Game): void {
    this.render(game);
  }

  exit(): void {}

  update(game: Game): void {
    if (game.input.wasPressed("interact")) {
      game.state.set(new BuildSelectState());
    }
    if (game.input.wasPressed("coop")) {
      game.state.set(new OnlineCoopState());
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);
    const bg = new Graphics();
    bg.rect(0, 0, game.width, game.height).fill(0x151820);
    for (let i = 0; i < 34; i += 1) {
      const x = (i * 137) % game.width;
      const y = (i * 89) % game.height;
      bg.rect(x, y, 42, 26).fill({ color: i % 2 ? palette.mint : palette.tomato, alpha: 0.24 });
    }
    game.layers.hud.addChild(bg);

    const title = new Text({
      text: GAME_TITLE.toUpperCase(),
      style: { ...fontStyle, fontSize: 44, fill: "#ffd166" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, game.height / 2 - 80);
    game.layers.hud.addChild(title);

    const subtitle = new Text({
      text: `${GAME_TAGLINE}\n\nEnter: Alignment Grid  C: online Consensus Cell  WASD/arrows: move  Space: dash  1/2/3: emergency patches`,
      style: { ...fontStyle, fontSize: 17, align: "center", wordWrap: true, wordWrapWidth: 760, fill: "#64e0b4" }
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(game.width / 2, game.height / 2 + 42);
    game.layers.hud.addChild(subtitle);

    const disclaimer = new Text({
      text: PARODY_DISCLAIMER,
      style: { ...fontStyle, fontSize: 11, align: "center", wordWrap: true, wordWrapWidth: 900, fill: "#aab0bd" }
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
  consensusCellSize = 1;
  private readonly query = new URLSearchParams(window.location.search);
  readonly assetPreview = this.query.get("assetPreview");
  readonly productionArtDefaulted = !isDisabledQueryFlag(this.query, "productionArt") && !isEnabledQueryFlag(this.query, "placeholderArt");
  readonly armisticeTileAtlasDefaulted = !isDisabledQueryFlag(this.query, "armisticeTiles") && !isEnabledQueryFlag(this.query, "placeholderTiles");
  readonly useArmisticeTileAtlas = this.armisticeTileAtlasDefaulted || isEnabledQueryFlag(this.query, "armisticeTiles");
  readonly useMilestone10Art = this.productionArtDefaulted || isEnabledQueryFlag(this.query, "productionArt");
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

  startRun(nodeId: string): void {
    const node = MAP_GRAPH.nodes.find((candidate) => candidate.id === nodeId) ?? MAP_GRAPH.nodes[0];
    this.lastNodeId = node.id;
    this.state.set(new ArenaBriefingState(node.id, node.arenaId));
  }

  createRun(nodeId: string, arenaId: string): LevelRunState {
    return new LevelRunState(nodeId, arenaId, this.selectedClassId, this.selectedFactionId, this.consensusCellSize);
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
