import { Graphics, Sprite, Text } from "pixi.js";
import { palette, fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { worldToIso } from "../iso/projection";
import { drawIsoDiamond } from "../iso/tilemap";
import { clearAllLayers, clearLayer } from "../render/layers";
import { drawPixelPerson } from "../render/sprites";
import { GAME_TITLE } from "../content/uiText";
import { CAMPAIGN_LEVEL_COUNT, campaignClarityForNode } from "../content/campaignClarity";
import { campaignRouteSummary } from "../roguelite/campaignRoute";
import { bossContractForArena } from "../roguelite/bossContracts";
import {
  ALIGNMENT_GRID_MAP,
  START_NODE_ID,
  alignmentGridNodeById,
  nextRecommendedAlignmentNode,
  visibleRouteConsequenceText,
  type AlignmentGridMicroLandmark,
  type AlignmentGridNode,
  type AlignmentGridPropCluster,
  type AlignmentGridRoute,
  type AlignmentGridTerrainPatch
} from "./alignmentGridMap";
import { MAP_GRAPH } from "./mapGraph";
import { isNodeAvailable, nearestNode } from "./levelNodes";
import { getMilestone12ArtTextures, loadMilestone12Art, milestone12NetworkPlayerTexture, type RouteSigilState } from "../assets/milestone12Art";
import { getMilestone49PlayableArtTextures, loadMilestone49PlayableArt, milestone49NetworkPlayerTextureFor } from "../assets/milestone49PlayableArt";
import type { PlayerFacing } from "../assets/milestone10Art";

export type RouteState = "stable" | "unstable" | "locked";

const ALIGNMENT_GRID_BACKDROP_ORIGIN_X = 1200;
const ALIGNMENT_GRID_BACKDROP_ORIGIN_Y = 650;

interface AlignmentGridLevelCardInfo {
  mapKind: string;
  objectiveType: string;
  levelLabel?: string;
}

const LEVEL_CARD_INFO: Record<string, AlignmentGridLevelCardInfo> = {
  armistice_plaza: { mapKind: "Open Survival District", objectiveType: "Treaty Anchors" },
  accord_relay: { mapKind: "Faction Relay", objectiveType: "Relay Trust Argument" },
  cooling_lake_nine: { mapKind: "Hazard Ecology", objectiveType: "Server Buoys" },
  model_war_memorial: { mapKind: "Memory Cache", objectiveType: "Casualty Record" },
  armistice_camp: { mapKind: "Refuge Camp", objectiveType: "Resupply Approach" },
  memory_cache_001: { mapKind: "Expedition / Recovery", objectiveType: "Memory Records" },
  archive_of_unsaid_things: { mapKind: "Archive / Court Redaction", objectiveType: "Evidence Writs" },
  blackwater_beacon: { mapKind: "Puzzle-Pressure / Boss-Hunt", objectiveType: "Antenna Arrays" },
  thermal_archive: { mapKind: "Breach Arena", objectiveType: "Thermal Route Memory" },
  guardrail_forge: { mapKind: "Defense / Holdout", objectiveType: "Forge Relays" },
  transit_loop_zero: { mapKind: "Route / Transit", objectiveType: "Route Platforms" },
  signal_coast: { mapKind: "Signal Coast / Route Edge", objectiveType: "Signal Relays" },
  false_schedule_yard: { mapKind: "Shortcut Route", objectiveType: "False Schedule Bypass" },
  glass_sunfield: { mapKind: "Solar-Prism Traversal", objectiveType: "Sun Lenses" },
  verdict_spire: { mapKind: "Boss Gate", objectiveType: "Verdict Route Writ" },
  appeal_court_ruins: { mapKind: "Appeal Court / Public Ruling", objectiveType: "Appeal Briefs" },
  alignment_spire_finale: { mapKind: "Prediction Collapse Finale", objectiveType: "Alignment Proofs" }
};

const PROGRESSION_NODE_ORDER = [
  "armistice_plaza",
  "cooling_lake_nine",
  "transit_loop_zero",
  "signal_coast",
  "blackwater_beacon",
  "memory_cache_001",
  "guardrail_forge",
  "glass_sunfield",
  "archive_of_unsaid_things",
  "appeal_court_ruins",
  "alignment_spire_finale",
  "accord_relay",
  "model_war_memorial",
  "armistice_camp",
  "thermal_archive",
  "false_schedule_yard",
  "verdict_spire"
] as const;

const OVERWORLD_SCREEN_POINTS: Record<(typeof PROGRESSION_NODE_ORDER)[number], { x: number; y: number }> = {
  armistice_plaza: { x: 128, y: 590 },
  cooling_lake_nine: { x: 265, y: 370 },
  transit_loop_zero: { x: 685, y: 306 },
  signal_coast: { x: 965, y: 215 },
  blackwater_beacon: { x: 1056, y: 348 },
  memory_cache_001: { x: 492, y: 610 },
  guardrail_forge: { x: 681, y: 486 },
  glass_sunfield: { x: 816, y: 594 },
  archive_of_unsaid_things: { x: 1026, y: 562 },
  appeal_court_ruins: { x: 1240, y: 468 },
  alignment_spire_finale: { x: 1394, y: 168 },
  accord_relay: { x: 462, y: 360 },
  model_war_memorial: { x: 328, y: 494 },
  armistice_camp: { x: 648, y: 654 },
  thermal_archive: { x: 506, y: 482 },
  false_schedule_yard: { x: 880, y: 690 },
  verdict_spire: { x: 1232, y: 356 }
};

export class OverworldState implements GameState {
  readonly mode = "OverworldMap" as const;
  worldX = -7;
  worldY = -1;
  selectedId = "armistice_plaza";
  private requestedProductionArtLoad = false;
  private requestedRosterArtLoad = false;
  private avatarFacing: PlayerFacing = "south";
  private avatarMoving = false;
  private seconds = 0;
  private staticMapDrawn = false;
  private staticMapKey = "";
  private routeWalkPath: { worldX: number; worldY: number }[] = [];
  private routeWalkScreenPath: { x: number; y: number }[] = [];
  private routeWalkSegment = 0;
  private routeWalkSegmentT = 0;

  get selectedNode() {
    return ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === this.selectedId) ?? ALIGNMENT_GRID_MAP.nodes[0];
  }

  get routeWalking() {
    return this.avatarMoving;
  }

  enter(game: Game): void {
    const recommended = nextRecommendedAlignmentNode(game.completedNodes, game.unlockedNodes);
    const node = game.completedNodes.has(game.lastNodeId)
      ? recommended
      : ALIGNMENT_GRID_MAP.nodes.find((candidate) => candidate.id === game.lastNodeId) ?? recommended;
    this.worldX = node.worldX;
    this.worldY = node.worldY;
    this.selectedId = node.id;
    this.avatarMoving = false;
    this.routeWalkPath = [];
    this.routeWalkScreenPath = [];
    this.routeWalkSegment = 0;
    this.routeWalkSegmentT = 0;
    this.staticMapDrawn = false;
    this.render(game);
  }

  exit(): void {
    this.staticMapDrawn = false;
    this.staticMapKey = "";
  }

  update(game: Game, dt: number): void {
    this.seconds += dt;
    this.advanceRouteWalk(dt);
    if (!this.avatarMoving) {
      if (game.input.wasPressed("right")) this.moveSelection(game, 1);
      if (game.input.wasPressed("left")) this.moveSelection(game, -1);
      if (game.input.wasPressed("down")) this.moveSelection(game, 1);
      if (game.input.wasPressed("up")) this.moveSelection(game, -1);
    }
    const node = this.selectedNode;
    const available = this.isNodeAvailable(node, game);
    if (!this.avatarMoving && available && game.input.wasPressed("interact")) {
      game.lastNodeId = node.id;
      game.startRun(node.id);
    }
  }

  render(game: Game): void {
    clearAllLayers(game.layers);
    game.layers.root.position.set(0, 0);
    game.layers.root.scale.set(1);
    this.drawTechBrosInspiredOverworld(game);
  }

  routeState(route: AlignmentGridRoute, game: Game): RouteState {
    const from = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.from);
    if (game.completedNodes.has(route.from)) return "stable";
    if (from && this.isNodeAvailable(from, game)) return "unstable";
    return "locked";
  }

  routeStates(game: Game) {
    return ALIGNMENT_GRID_MAP.routes.map((route) => ({
      id: route.id,
      label: route.label,
      from: route.from,
      to: route.to,
      state: this.routeState(route, game),
      checkpointCount: route.checkpoints.length,
      routeTexture: routeBiomeTexture(route),
      finaleCorruption: route.to === "alignment_spire_finale" || route.from === "alignment_spire_finale",
      consequence: routeConsequence(route, game.completedNodes)
    }));
  }

  nearestRoute(game: Game) {
    let best = this.routeStates(game)[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const route of ALIGNMENT_GRID_MAP.routes) {
      const points = this.routePoints(route);
      for (let i = 0; i < points.length - 1; i += 1) {
        const distance = distanceToSegment(this.worldX, this.worldY, points[i].worldX, points[i].worldY, points[i + 1].worldX, points[i + 1].worldY);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = this.routeStates(game).find((candidate) => candidate.id === route.id) ?? best;
        }
      }
    }
    return { ...best, distance: round(bestDistance) };
  }

  private orderedProgressionNodes(): AlignmentGridNode[] {
    return PROGRESSION_NODE_ORDER
      .map((id) => alignmentGridNodeById(id))
      .filter((node): node is AlignmentGridNode => Boolean(node));
  }

  private moveSelection(game: Game, direction: number): void {
    const nodes = this.orderedProgressionNodes();
    const index = Math.max(0, nodes.findIndex((node) => node.id === this.selectedId));
    const next = nodes[clamp(index + direction, 0, nodes.length - 1)] ?? nodes[0];
    if (next.id === this.selectedId) return;
    const previous = this.selectedNode;
    this.selectedId = next.id;
    this.beginRouteWalk(previous, next);
    this.render(game);
  }

  private beginRouteWalk(from: AlignmentGridNode, to: AlignmentGridNode): void {
    const route = ALIGNMENT_GRID_MAP.routes.find((candidate) => candidate.from === from.id && candidate.to === to.id);
    const reverseRoute = ALIGNMENT_GRID_MAP.routes.find((candidate) => candidate.from === to.id && candidate.to === from.id);
    const routePoints = route
      ? this.routePoints(route)
      : reverseRoute
        ? [...this.routePoints(reverseRoute)].reverse()
        : [{ worldX: from.worldX, worldY: from.worldY }, { worldX: to.worldX, worldY: to.worldY }];
    this.routeWalkPath = [{ worldX: this.worldX, worldY: this.worldY }, ...routePoints.slice(1)];
    const fromScreen = this.currentAvatarScreenPoint();
    const toScreen = this.screenPointForNode(to.id);
    this.routeWalkScreenPath = [fromScreen, toScreen];
    this.routeWalkSegment = 0;
    this.routeWalkSegmentT = 0;
    this.avatarMoving = this.routeWalkPath.length > 1;
  }

  private advanceRouteWalk(dt: number): void {
    if (!this.avatarMoving || this.routeWalkPath.length < 2) return;
    let remaining = dt * 7.5;
    while (remaining > 0 && this.avatarMoving) {
      const from = this.routeWalkPath[this.routeWalkSegment];
      const to = this.routeWalkPath[this.routeWalkSegment + 1];
      if (!from || !to) {
        this.avatarMoving = false;
        break;
      }
      const distance = Math.hypot(to.worldX - from.worldX, to.worldY - from.worldY) || 1;
      const segmentAdvance = remaining / distance;
      this.routeWalkSegmentT += segmentAdvance;
      remaining = 0;
      if (this.routeWalkSegmentT >= 1) {
        remaining = (this.routeWalkSegmentT - 1) * distance / 7.5;
        this.worldX = to.worldX;
        this.worldY = to.worldY;
        this.avatarFacing = facingFromWorldVelocity(to.worldX - from.worldX, to.worldY - from.worldY);
        this.routeWalkSegment += 1;
        this.routeWalkSegmentT = 0;
        if (this.routeWalkSegment >= this.routeWalkPath.length - 1) {
          this.avatarMoving = false;
          this.routeWalkPath = [];
          this.routeWalkScreenPath = [];
          break;
        }
      } else {
        this.worldX = from.worldX + (to.worldX - from.worldX) * this.routeWalkSegmentT;
        this.worldY = from.worldY + (to.worldY - from.worldY) * this.routeWalkSegmentT;
        this.avatarFacing = facingFromWorldVelocity(to.worldX - from.worldX, to.worldY - from.worldY);
      }
    }
  }

  private drawProgressionBoard(game: Game): void {
    const art = this.productionArt(game);
    const bg = new Graphics();
    bg.rect(0, 0, game.width, game.height).fill(0x081018);
    game.layers.hud.addChild(bg);

    if (art?.alignmentGridBackdrop) {
      const backdrop = new Sprite(art.alignmentGridBackdrop);
      backdrop.anchor.set(0.5);
      const scale = Math.max(game.width / backdrop.texture.width, game.height / backdrop.texture.height) * 1.03;
      backdrop.scale.set(scale);
      backdrop.position.set(game.width / 2, game.height / 2 + 8);
      backdrop.alpha = 0.22;
      game.layers.hud.addChild(backdrop);
      const shade = new Graphics();
      shade.rect(0, 0, game.width, game.height).fill({ color: 0x030609, alpha: 0.62 });
      game.layers.hud.addChild(shade);
    }

    const header = new Text({
      text: "THE ALIGNMENT GRID",
      style: { ...fontStyle, fontSize: 34, fill: "#fff4d6", stroke: { color: "#030609", width: 5 }, align: "center" }
    });
    header.anchor.set(0.5);
    header.position.set(game.width / 2, 34);
    game.layers.hud.addChild(header);

    const subtitle = new Text({
      text: "SELECT A ROUTE CARD",
      style: { ...fontStyle, fontSize: 12, fill: "#9fd8d1", stroke: { color: "#030609", width: 4 }, align: "center" }
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(game.width / 2, 66);
    game.layers.hud.addChild(subtitle);

    this.drawTechBrosLevelSelect(game, art);

    const hint = new Text({
      text: "A/D or Arrows: select card     Enter/E: deploy unlocked route     C: Last Alignment Camp",
      style: { ...fontStyle, fontSize: 13, fill: "#e7f4ef", stroke: { color: "#030609", width: 4 }, align: "center" }
    });
    hint.anchor.set(0.5);
    hint.position.set(game.width / 2, game.height - 24);
    game.layers.hud.addChild(hint);
  }

  private drawTechBrosInspiredOverworld(game: Game): void {
    const art = this.productionArt(game);
    const bg = new Graphics();
    bg.rect(0, 0, game.width, game.height).fill(0x020407);
    game.layers.hud.addChild(bg);

    if (art?.alignmentGridBackdrop) {
      const backdrop = new Sprite(art.alignmentGridBackdrop);
      backdrop.anchor.set(0.5);
      const scale = Math.max(game.width / backdrop.texture.width, game.height / backdrop.texture.height);
      backdrop.scale.set(scale);
      backdrop.position.set(game.width / 2, game.height / 2);
      game.layers.hud.addChild(backdrop);
      const shade = new Graphics();
      shade.rect(0, 0, game.width, game.height).fill({ color: 0x020407, alpha: 0.12 });
      game.layers.hud.addChild(shade);
    }

    this.drawOverworldGateLayer(game);
    this.drawOverworldAvatar(game);
    this.drawOverworldTopHud(game);
    this.drawOverworldBottomPanel(game);
  }

  private drawOverworldGateLayer(game: Game): void {
    const selected = this.selectedNode;
    const nextNode = nextRecommendedAlignmentNode(game.completedNodes, game.unlockedNodes);
    const graphics = new Graphics();
    for (const node of this.orderedProgressionNodes().slice(0, 11)) {
      const p = this.scaleScreenPoint(this.screenPointForNode(node.id), game);
      const available = this.isNodeAvailable(node, game);
      const completed = game.completedNodes.has(node.id);
      const isSelected = node.id === selected.id;
      const isRecommended = node.id === nextNode.id;
      const color = completed ? palette.mint : available ? (isRecommended ? palette.mint : palette.lemon) : 0xff8a5c;
      const radius = isSelected ? 35 : 24;
      graphics.ellipse(p.x, p.y + 8, radius + 10, 14).fill({ color: 0x030609, alpha: 0.54 });
      graphics.ellipse(p.x, p.y, radius, 14).stroke({ color, width: isSelected ? 5 : 3, alpha: isSelected ? 0.98 : 0.62 });
      if (!available && !completed) {
        graphics.rect(p.x - 15, p.y - 43, 30, 26).fill({ color: 0x101820, alpha: 0.9 }).stroke({ color: 0xff8a5c, width: 2, alpha: 0.8 });
        graphics.rect(p.x - 8, p.y - 28, 16, 10).fill({ color: 0xff8a5c, alpha: 0.85 });
        graphics.moveTo(p.x - 8, p.y - 29);
        graphics.arc(p.x, p.y - 29, 8, Math.PI, 0).stroke({ color: 0xff8a5c, width: 3, alpha: 0.85 });
      }
      if (isSelected) {
        const pulse = 0.5 + Math.sin(this.seconds * 5) * 0.5;
        graphics.ellipse(p.x, p.y, 45 + pulse * 5, 18 + pulse * 2).stroke({ color, width: 2, alpha: 0.45 + pulse * 0.3 });
      }
    }
    game.layers.hud.addChild(graphics);
  }

  private drawOverworldAvatar(game: Game): void {
    const art = this.productionArt(game);
    const p = this.scaleScreenPoint(this.currentAvatarScreenPoint(), game);
    const shadow = new Graphics();
    shadow.ellipse(p.x, p.y + 16, 19, 7).fill({ color: 0x030609, alpha: 0.58 });
    game.layers.hud.addChild(shadow);
    if (art) {
      const rosterArt = getMilestone49PlayableArtTextures();
      const texture = rosterArt
        ? milestone49NetworkPlayerTextureFor(game.selectedClassId, this.avatarFacing, this.avatarMoving, this.seconds, rosterArt)
        : milestone12NetworkPlayerTexture(0, this.avatarFacing, this.avatarMoving, this.seconds, art);
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 0.9);
      sprite.scale.set(rosterArt ? 0.92 : 1.35);
      sprite.position.set(p.x, p.y + 13);
      game.layers.hud.addChild(sprite);
      return;
    }
    const fallback = new Graphics();
    fallback.rect(p.x - 7, p.y - 22, 14, 24).fill(palette.mint).stroke({ color: 0x030609, width: 3 });
    fallback.circle(p.x, p.y - 28, 8).fill(0xfff4d6).stroke({ color: 0x030609, width: 3 });
    game.layers.hud.addChild(fallback);
  }

  private drawOverworldTopHud(game: Game): void {
    const stableRoutes = ALIGNMENT_GRID_MAP.routes.filter((route) => this.isProgressionRouteVisible(route) && this.routeState(route, game) === "stable").length;
    const panel = new Graphics();
    this.drawStonePanel(panel, 22, 20, 424, 74, palette.mint, 0.86);
    game.layers.hud.addChild(panel);
    this.addHudText(game, GAME_TITLE, 42, 35, 14, "#fff4d6", 370);
    this.addHudText(game, `THE ALIGNMENT GRID // ROADS ${stableRoutes}/10`, 42, 55, 12, "#ffd166", 370);
    this.addHudText(game, this.avatarMoving ? "TRAVERSING ROUTE" : "ARROWS/A-D WALK ROUTE  //  ENTER DEPLOYS", 42, 75, 8, "#9fd8d1", 370);
  }

  private drawOverworldBottomPanel(game: Game): void {
    const node = this.selectedNode;
    const available = this.isNodeAvailable(node, game);
    const completed = game.completedNodes.has(node.id);
    const nextNode = nextRecommendedAlignmentNode(game.completedNodes, game.unlockedNodes);
    const status = selectedNodeRouteStatus(node, nextNode, completed, available);
    const statusColor = status === "RECOMMENDED" ? palette.mint : status === "RISKY" ? 0xff8a5c : completed ? palette.mint : available ? palette.lemon : 0xff8a5c;
    const info = LEVEL_CARD_INFO[node.id] ?? { mapKind: node.nodeType, objectiveType: node.theme };
    const clarity = campaignClarityForNode(node.id);
    const boss = bossContractForArena(node.arenaId);
    const consequence = visibleRouteConsequenceText(node, game.completedNodes, game.unlockedNodes);
    const y = game.height - 150;
    const panelX = Math.max(80, game.width / 2 - 480);
    const panelW = Math.min(game.width - panelX * 2, 960);
    const panel = new Graphics();
    this.drawStonePanel(panel, panelX, y, panelW, 116, statusColor, 0.92);
    panel.rect(panelX + panelW - 186, y + 82, 156, 24).fill({ color: available ? 0x16312b : 0x2a1b20, alpha: 0.98 }).stroke({ color: statusColor, width: 2, alpha: 0.86 });
    game.layers.hud.addChild(panel);
    this.addHudText(game, `${clarity ? `LEVEL ${clarity.levelNumber}/${CAMPAIGN_LEVEL_COUNT}  ` : ""}${node.name.toUpperCase()}`, panelX + 26, y + 18, 15, "#fff4d6", 360);
    this.addHudText(game, status, panelX + panelW - 190, y + 19, 9, colorToCss(statusColor), 150, "right");
    this.addHudText(game, `${info.mapKind.toUpperCase()} // ${node.regionLabel.toUpperCase()}`, panelX + 26, y + 42, 8, "#9fd8d1", 340);
    this.addHudText(game, `OBJ ${clarity ? `${clarity.verb} ${clarity.objectiveUnit}` : info.objectiveType}`, panelX + 26, y + 64, 9, "#e7f4ef", 260);
    this.addHudText(game, `BOSS ${boss.displayName}`, panelX + 330, y + 64, 9, "#e7f4ef", 190);
    this.addHudText(game, `ROUTE ${selectedRouteLine(node, game.completedNodes)}`, panelX + 560, y + 64, 9, "#e7f4ef", 230);
    this.addHudText(game, node.rewardPromise, panelX + 26, y + 86, 8, "#ffd166", 300, "left", 11);
    this.addHudText(game, consequence, panelX + 560, y + 86, 8, available ? "#72eadc" : "#aab0bd", 210, "left", 11);
    this.addHudText(game, available ? "START" : "LOCKED", panelX + panelW - 154, y + 87, 12, available ? "#64e0b4" : "#ff8a5c", 92, "center");
  }

  private drawStonePanel(graphics: Graphics, x: number, y: number, w: number, h: number, accent: number, alpha: number): void {
    graphics.rect(x + 7, y + 8, w, h).fill({ color: 0x030609, alpha: 0.5 * alpha });
    graphics.rect(x, y, w, h).fill({ color: 0x0d1420, alpha }).stroke({ color: 0x9aa8a7, width: 3, alpha: 0.72 });
    graphics.rect(x + 6, y + 6, 22, 8).fill({ color: accent, alpha: 0.8 });
    graphics.rect(x + 6, y + 6, 8, 22).fill({ color: accent, alpha: 0.8 });
    graphics.rect(x + w - 28, y + 6, 22, 8).fill({ color: accent, alpha: 0.8 });
    graphics.rect(x + w - 14, y + 6, 8, 22).fill({ color: accent, alpha: 0.8 });
    graphics.rect(x + 6, y + h - 14, 22, 8).fill({ color: accent, alpha: 0.8 });
    graphics.rect(x + 6, y + h - 28, 8, 22).fill({ color: accent, alpha: 0.8 });
    graphics.rect(x + w - 28, y + h - 14, 22, 8).fill({ color: accent, alpha: 0.8 });
    graphics.rect(x + w - 14, y + h - 28, 8, 22).fill({ color: accent, alpha: 0.8 });
  }

  private addHudText(game: Game, text: string, x: number, y: number, size: number, fill: string, width: number, align: "left" | "right" | "center" = "left", lineHeight?: number): void {
    const label = new Text({
      text,
      style: { ...fontStyle, fontSize: size, fill, align, wordWrap: true, wordWrapWidth: width, lineHeight: lineHeight ?? Math.ceil(size * 1.2) }
    });
    label.position.set(x, y);
    game.layers.hud.addChild(label);
  }

  private currentAvatarScreenPoint(): { x: number; y: number } {
    if (this.avatarMoving && this.routeWalkScreenPath.length >= 2) {
      const from = this.routeWalkScreenPath[this.routeWalkSegment] ?? this.routeWalkScreenPath[0];
      const to = this.routeWalkScreenPath[this.routeWalkSegment + 1] ?? this.routeWalkScreenPath[this.routeWalkScreenPath.length - 1];
      return {
        x: from.x + (to.x - from.x) * this.routeWalkSegmentT,
        y: from.y + (to.y - from.y) * this.routeWalkSegmentT
      };
    }
    return this.screenPointForNode(this.selectedId);
  }

  private screenPointForNode(id: string): { x: number; y: number } {
    return OVERWORLD_SCREEN_POINTS[id as keyof typeof OVERWORLD_SCREEN_POINTS] ?? OVERWORLD_SCREEN_POINTS.armistice_plaza;
  }

  private scaleScreenPoint(point: { x: number; y: number }, game: Game): { x: number; y: number } {
    return {
      x: point.x * (game.width / 1280),
      y: point.y * (game.height / 720)
    };
  }

  private drawTechBrosLevelSelect(game: Game, art: ReturnType<OverworldState["productionArt"]>): void {
    const nodes = this.orderedProgressionNodes();
    const selectedIndex = Math.max(0, nodes.findIndex((node) => node.id === this.selectedId));
    const pageSize = 6;
    const pageStart = Math.floor(selectedIndex / pageSize) * pageSize;
    const visible = nodes.slice(pageStart, pageStart + pageSize);
    const centerX = game.width / 2;
    const cardW = 188;
    const cardH = 204;
    const gapX = 206;
    const gapY = 218;
    const gridTop = 96;
    const gridLeft = centerX - gapX;
    this.drawCardStage(game, centerX, gridTop, gapX, gapY);
    visible.forEach((node, pageIndex) => {
      const col = pageIndex % 3;
      const row = Math.floor(pageIndex / 3);
      this.drawTechLevelCard(game, node, gridLeft + col * gapX, gridTop + row * gapY, cardW, cardH, node.id === this.selectedId, pageStart + pageIndex + 1, art);
    });
    this.drawPagePips(game, Math.floor(selectedIndex / pageSize), Math.ceil(nodes.length / pageSize));
    this.drawSelectedTechLevelDetails(game);
  }

  private drawCardStage(game: Game, centerX: number, top: number, gapX: number, gapY: number): void {
    const stage = new Graphics();
    const w = gapX * 3 + 78;
    const x = centerX - w / 2;
    stage
      .poly([x + 54, top + 120, x + w - 54, top + 120, x + w + 4, top + gapY + 270, x - 4, top + gapY + 270])
      .fill({ color: 0x071018, alpha: 0.72 })
      .stroke({ color: 0x20333b, width: 2, alpha: 0.6 });
    stage
      .poly([x + 94, top + 156, x + w - 94, top + 156, x + w - 8, top + gapY + 226, x + 8, top + gapY + 226])
      .fill({ color: 0x0e1a22, alpha: 0.52 });
    game.layers.hud.addChild(stage);
  }

  private drawPagePips(game: Game, page: number, pageCount: number): void {
    const startX = game.width / 2 - ((pageCount - 1) * 15) / 2;
    const y = game.height - 46;
    const g = new Graphics();
    for (let i = 0; i < pageCount; i += 1) {
      g.rect(startX + i * 15 - 4, y - 4, 8, 8).fill({ color: i === page ? palette.mint : 0x596270, alpha: i === page ? 0.95 : 0.45 });
    }
    game.layers.hud.addChild(g);
  }

  private drawTechLevelCard(game: Game, node: AlignmentGridNode, centerX: number, y: number, w: number, h: number, selected: boolean, levelNumber: number, art: ReturnType<OverworldState["productionArt"]>): void {
    const available = this.isNodeAvailable(node, game);
    const completed = game.completedNodes.has(node.id);
    const nextNode = nextRecommendedAlignmentNode(game.completedNodes, game.unlockedNodes);
    const status = selectedNodeRouteStatus(node, nextNode, completed, available);
    const statusColor = status === "RECOMMENDED" ? palette.mint : status === "RISKY" ? 0xff8a5c : completed ? palette.mint : available ? palette.lemon : 0x8b94a3;
    const x = centerX - w / 2;
    const pulse = selected ? 0.5 + Math.sin(this.seconds * 5) * 0.5 : 0;
    this.drawTechFrame(game, x, y, w, h, statusColor, selected, available ? 1 : 0.54);

    const topLabel = new Text({
      text: `ROUTE ${String(levelNumber).padStart(2, "0")}`,
      style: { ...fontStyle, fontSize: 9, fill: available ? "#9fd8d1" : "#69737f", stroke: { color: "#030609", width: 4 }, align: "center" }
    });
    topLabel.anchor.set(0.5);
    topLabel.position.set(centerX, y + 23);
    game.layers.hud.addChild(topLabel);

    if (art) {
      const visual = node.visualKind === "archive" || node.visualKind === "beacon" ? "cache" : node.visualKind === "finale" ? "spire" : node.visualKind;
      const sprite = new Sprite(art.alignmentGridNodes[visual]);
      sprite.anchor.set(0.5, 0.85);
      const fit = Math.min(1.05, 112 / sprite.texture.width, 106 / sprite.texture.height);
      sprite.scale.set(fit * (selected ? 1.08 : 0.96));
      sprite.position.set(centerX, y + 112);
      sprite.tint = available ? 0xffffff : 0x596270;
      sprite.alpha = available ? 1 : 0.46;
      game.layers.hud.addChild(sprite);
    }

    const title = new Text({
      text: node.name.toUpperCase(),
      style: { ...fontStyle, fontSize: 10, fill: available ? "#fff4d6" : "#8b94a3", stroke: { color: "#030609", width: 4 }, align: "center", wordWrap: true, wordWrapWidth: w - 28, lineHeight: 13 }
    });
    title.anchor.set(0.5);
    title.position.set(centerX, y + h - 53);
    game.layers.hud.addChild(title);

    const label = new Text({
      text: available ? status : "LOCKED",
      style: { ...fontStyle, fontSize: 9, fill: colorToCss(statusColor), stroke: { color: "#030609", width: 4 }, align: "center" }
    });
    label.anchor.set(0.5);
    label.position.set(centerX, y + h - 24);
    game.layers.hud.addChild(label);

    if (!available) {
      const lock = new Text({
        text: "LOCKED",
        style: { ...fontStyle, fontSize: 18, fill: "#8b94a3", stroke: { color: "#030609", width: 5 }, align: "center" }
      });
      lock.anchor.set(0.5);
      lock.rotation = -0.08;
      lock.position.set(centerX, y + 105);
      lock.alpha = 0.72;
      game.layers.hud.addChild(lock);
    }

    if (selected) {
      const glow = new Graphics();
      glow.rect(x - 9, y - 9, w + 18, h + 18).stroke({ color: statusColor, width: 3, alpha: 0.45 + pulse * 0.3 });
      game.layers.hud.addChild(glow);
    }
  }

  private drawTechFrame(game: Game, x: number, y: number, w: number, h: number, accent: number, selected: boolean, alpha: number): void {
    const g = new Graphics();
    const bevel = selected ? 15 : 11;
    g.rect(x + bevel, y + bevel + 6, w, h).fill({ color: 0x030609, alpha: 0.5 * alpha });
    g.poly([x + w, y + 9, x + w + bevel, y + bevel + 15, x + w + bevel, y + h + bevel, x + w, y + h]).fill({ color: 0x05090f, alpha: 0.95 * alpha });
    g.poly([x + 10, y + h, x + w, y + h, x + w + bevel, y + h + bevel, x + bevel, y + h + bevel]).fill({ color: 0x07131b, alpha: 0.95 * alpha });
    g.rect(x, y, w, h).fill({ color: 0x0b1018, alpha: 0.96 * alpha }).stroke({ color: selected ? accent : 0x7d8b92, width: selected ? 4 : 3, alpha });
    g.rect(x + 10, y + 12, w - 20, h - 24).fill({ color: 0x111923, alpha: 0.78 * alpha }).stroke({ color: 0x263a42, width: 2, alpha: 0.85 * alpha });
    g.rect(x + 16, y + 42, w - 32, h - 98).fill({ color: 0x050a10, alpha: 0.42 * alpha }).stroke({ color: 0x1b2d35, width: 2, alpha: 0.74 * alpha });
    g.rect(x + 8, y + 8, 28, 8).fill({ color: accent, alpha: 0.72 * alpha });
    g.rect(x + 8, y + 8, 8, 28).fill({ color: accent, alpha: 0.72 * alpha });
    g.rect(x + w - 36, y + 8, 28, 8).fill({ color: accent, alpha: 0.72 * alpha });
    g.rect(x + w - 16, y + 8, 8, 28).fill({ color: accent, alpha: 0.72 * alpha });
    g.rect(x + 8, y + h - 16, 28, 8).fill({ color: accent, alpha: 0.72 * alpha });
    g.rect(x + 8, y + h - 36, 8, 28).fill({ color: accent, alpha: 0.72 * alpha });
    g.rect(x + w - 36, y + h - 16, 28, 8).fill({ color: accent, alpha: 0.72 * alpha });
    g.rect(x + w - 16, y + h - 36, 8, 28).fill({ color: accent, alpha: 0.72 * alpha });
    game.layers.hud.addChild(g);
  }

  private drawSelectedTechLevelDetails(game: Game): void {
    const node = this.selectedNode;
    const available = this.isNodeAvailable(node, game);
    const completed = game.completedNodes.has(node.id);
    const nextNode = nextRecommendedAlignmentNode(game.completedNodes, game.unlockedNodes);
    const status = selectedNodeRouteStatus(node, nextNode, completed, available);
    const statusColor = status === "RECOMMENDED" ? palette.mint : status === "RISKY" ? 0xff8a5c : completed ? palette.mint : available ? palette.lemon : 0x8b94a3;
    const info = LEVEL_CARD_INFO[node.id] ?? { mapKind: node.nodeType, objectiveType: node.theme };
    const clarity = campaignClarityForNode(node.id);
    const boss = bossContractForArena(node.arenaId);
    const consequence = visibleRouteConsequenceText(node, game.completedNodes, game.unlockedNodes);
    const consequenceLine = consequence.length > 72 ? `${consequence.slice(0, 69)}...` : consequence;
    const cardX = 88;
    const cardY = game.height - 168;
    const cardW = game.width - 176;
    const cardH = 116;
    const g = new Graphics();
    g.rect(cardX + 8, cardY + 8, cardW, cardH).fill({ color: 0x030609, alpha: 0.5 });
    g.rect(cardX, cardY, cardW, cardH).fill({ color: 0x101820, alpha: 0.96 }).stroke({ color: statusColor, width: 3, alpha: 0.9 });
    g.rect(cardX, cardY, cardW, 34).fill({ color: 0x17232d, alpha: 1 });
    g.rect(cardX + cardW - 172, cardY + 9, 140, 18).fill({ color: statusColor, alpha: 0.18 }).stroke({ color: statusColor, width: 2, alpha: 0.78 });
    g.rect(cardX + 340, cardY + 46, 2, 58).fill({ color: 0x596270, alpha: 0.35 });
    g.rect(cardX + 704, cardY + 46, 2, 58).fill({ color: 0x596270, alpha: 0.35 });
    game.layers.hud.addChild(g);

    this.addCardText(game, `${clarity ? `LEVEL ${clarity.levelNumber}/${CAMPAIGN_LEVEL_COUNT}  ` : ""}${node.name.toUpperCase()}`, cardX + 22, cardY + 9, 15, "#fff4d6", 560);
    this.addCardText(game, status, cardX + cardW - 168, cardY + 12, 9, colorToCss(statusColor), 132, "center");
    this.addCardText(game, `${node.nodeType.toUpperCase()} // ${node.regionLabel.toUpperCase()}`, cardX + 22, cardY + 39, 9, "#9fd8d1", 300);
    this.addCardText(game, `MAP\n${info.mapKind}`, cardX + 22, cardY + 62, 10, "#e7f4ef", 150, "left", 14);
    this.addCardText(game, `OBJECTIVE\n${clarity ? `${clarity.verb} ${clarity.objectiveUnit}` : info.objectiveType}`, cardX + 182, cardY + 62, 10, "#e7f4ef", 150, "left", 14);
    this.addCardText(game, `BOSS\n${boss.displayName}`, cardX + 364, cardY + 50, 11, "#fff4d6", 316, "left", 16);
    this.addCardText(game, `ROUTE\n${consequenceLine}`, cardX + 364, cardY + 80, 8, available ? "#ffd166" : "#8b94a3", 316, "left", 11);
    this.addCardText(game, "REWARD PROMISE", cardX + 728, cardY + 50, 9, "#72eadc", 320);
    this.addCardText(game, node.rewardPromise, cardX + 728, cardY + 69, 10, "#cfd8d4", 320, "left", 13);
    this.addCardText(game, available ? "ENTER/E DEPLOY" : "COMPLETE PRIOR NODE TO UNLOCK", cardX + 728, cardY + 96, 10, available ? "#64e0b4" : "#8b94a3", 320);
  }

  dioramaInfo(game: Game) {
    const stableRoutes = this.routeStates(game).filter((route) => route.state === "stable");
    const availableNodes = ALIGNMENT_GRID_MAP.nodes.filter((node) => this.isNodeAvailable(node, game));
    const completedFinale = game.completedNodes.has("alignment_spire_finale");
    const finaleAvailable = availableNodes.some((node) => node.id === "alignment_spire_finale");
    return {
      set: "milestone51_overworld_diorama_1_0",
      densityPolicy: "tech_bros_style_walkable_3d_route_diorama_with_locked_gates_and_authored_landmarks",
      mapId: ALIGNMENT_GRID_MAP.id,
      nodeCount: ALIGNMENT_GRID_MAP.nodes.length,
      routeCount: ALIGNMENT_GRID_MAP.routes.length,
      biomeRegionCount: ALIGNMENT_GRID_MAP.biomeRegions.length,
      microLandmarkCount: ALIGNMENT_GRID_MAP.microLandmarks.length,
      propClusterCount: ALIGNMENT_GRID_MAP.propClusters.length,
      stableRouteCount: stableRoutes.length,
      availableNodeCount: availableNodes.length,
      regionLabels: ALIGNMENT_GRID_MAP.biomeRegions.map((region) => region.label),
      microLandmarkKinds: [...new Set(ALIGNMENT_GRID_MAP.microLandmarks.map((landmark) => landmark.kind))],
      routeReadabilityPolicy: "primary campaign roads render as chunky raised causeways with dark extrusion, state color, midpoint sigils, selected route emphasis, and locked gates; non-progression route clutter is suppressed",
      unlockRevealPolicy: "sealed nodes stay visible as dim locked landmarks; available and completed nodes gain full labels and deploy prompts",
      traversalPolicy: "player avatar walks node-to-node along authored route rails; arbitrary free-roam movement is disabled",
      partyVotingPolicy: "online lobby keeps party tokens, vote pips, selected-node labels, and route focus telemetry visible",
      finaleCorruptionState: completedFinale ? "contained" : finaleAvailable ? "active_reachable" : "dormant_teeth_visible"
    };
  }

  private isNodeAvailable(node: AlignmentGridNode, game: Game): boolean {
    return isNodeAvailable(node, MAP_GRAPH, game.completedNodes, game.unlockedNodes);
  }

  private isProgressionRouteVisible(route: AlignmentGridRoute): boolean {
    const order = this.orderedProgressionNodes().map((node) => node.id);
    const fromIndex = order.indexOf(route.from);
    const toIndex = order.indexOf(route.to);
    return fromIndex >= 0 && toIndex >= 0 && Math.abs(fromIndex - toIndex) === 1 && Math.min(fromIndex, toIndex) <= 9;
  }

  private drawBackground(game: Game): void {
    const bg = new Graphics();
    bg.rect(-3600, -2800, 7200, 5600).fill(0x142132);
    game.layers.background.addChild(bg);
  }

  private drawGround(game: Game): void {
    const art = this.productionArt(game);
    if (art?.alignmentGridBackdrop) {
      const backdrop = new Sprite(art.alignmentGridBackdrop);
      backdrop.anchor.set(0, 0);
      backdrop.position.set(-ALIGNMENT_GRID_BACKDROP_ORIGIN_X, -ALIGNMENT_GRID_BACKDROP_ORIGIN_Y);
      backdrop.zIndex = -1000;
      backdrop.alpha = 0.72;
      game.layers.ground.addChild(backdrop);
      const wash = new Graphics();
      wash.rect(-ALIGNMENT_GRID_BACKDROP_ORIGIN_X, -ALIGNMENT_GRID_BACKDROP_ORIGIN_Y, backdrop.texture.width, backdrop.texture.height).fill({ color: 0x030609, alpha: 0.22 });
      game.layers.ground.addChild(wash);
      return;
    }

    const ground = new Graphics();
    for (let y = ALIGNMENT_GRID_MAP.bounds.minY; y <= ALIGNMENT_GRID_MAP.bounds.maxY; y += 1) {
      for (let x = ALIGNMENT_GRID_MAP.bounds.minX; x <= ALIGNMENT_GRID_MAP.bounds.maxX; x += 1) {
        drawIsoDiamond(ground, x, y, this.tileColor(x, y), 0x1f333d);
      }
    }
    game.layers.ground.addChild(ground);
  }

  private tileColor(x: number, y: number): number {
    const edge = x <= ALIGNMENT_GRID_MAP.bounds.minX + 1 || x >= ALIGNMENT_GRID_MAP.bounds.maxX - 1 || y <= ALIGNMENT_GRID_MAP.bounds.minY + 1 || y >= ALIGNMENT_GRID_MAP.bounds.maxY - 1;
    if (edge) return 0x1e2a38;
    const patch = ALIGNMENT_GRID_MAP.terrainPatches.find((candidate) => inPatch(candidate, x, y));
    if (patch) return (x * 5 + y * 7) % 2 === 0 ? patch.colorA : patch.colorB;
    const gridNoise = (x * 11 + y * 17) % 5;
    return gridNoise <= 1 ? 0x2f4d58 : 0x284552;
  }

  private drawRoutes(game: Game): void {
    const graphics = new Graphics();
    const art = this.productionArt(game);
    const backdropActive = Boolean(art?.alignmentGridBackdrop);
    for (const route of ALIGNMENT_GRID_MAP.routes) {
      if (!this.isProgressionRouteVisible(route)) continue;
      const state = this.routeState(route, game);
      const points = this.routePoints(route).map((point) => worldToIso(point.worldX, point.worldY));
      const color = state === "stable" ? palette.mint : state === "unstable" ? palette.lemon : 0x596270;
      const alpha = backdropActive ? (state === "stable" ? 0.56 : state === "unstable" ? 0.44 : 0.18) : state === "stable" ? 0.95 : state === "unstable" ? 0.64 : 0.25;
      for (let i = 0; i < points.length - 1; i += 1) {
        const selectedRoute = route.from === this.selectedId || route.to === this.selectedId;
        graphics
          .moveTo(points[i].screenX + 8, points[i].screenY + 8)
          .lineTo(points[i + 1].screenX + 8, points[i + 1].screenY + 8)
          .stroke({ color: 0x030609, width: selectedRoute ? 28 : 24, alpha: backdropActive ? 0.42 : 0.68 });
        graphics
          .moveTo(points[i].screenX, points[i].screenY)
          .lineTo(points[i + 1].screenX, points[i + 1].screenY)
          .stroke({ color: 0x14232d, width: selectedRoute ? 24 : 20, alpha: backdropActive ? 0.78 : 0.94 });
        graphics
          .moveTo(points[i].screenX, points[i].screenY - 7)
          .lineTo(points[i + 1].screenX, points[i + 1].screenY - 7)
          .stroke({ color, width: selectedRoute ? 12 : 9, alpha });
        graphics
          .moveTo(points[i].screenX, points[i].screenY - 13)
          .lineTo(points[i + 1].screenX, points[i + 1].screenY - 13)
          .stroke({ color: state === "locked" ? 0x7d8b92 : palette.white, width: selectedRoute ? 3 : 2, alpha: state === "locked" ? 0.16 : 0.24 });
      }
      if (art) {
        const midpoint = points[Math.floor(points.length / 2)];
        const sprite = new Sprite(art.routeSigils[state as RouteSigilState]);
        sprite.anchor.set(0.5, 0.78);
        sprite.scale.set(backdropActive ? 0.58 : 0.68);
        sprite.alpha = backdropActive ? 0.82 : 1;
        sprite.position.set(midpoint.screenX, midpoint.screenY - 20);
        game.layers.decals.addChild(sprite);
      }
    }
    game.layers.decals.addChild(graphics);
  }

  private drawProps(game: Game): void {
    const props = new Graphics();
    this.drawBiomeLabels(game, props);
    for (const cluster of ALIGNMENT_GRID_MAP.propClusters) {
      this.drawPropCluster(props, cluster);
    }
    for (const landmark of ALIGNMENT_GRID_MAP.microLandmarks) {
      this.drawMicroLandmark(props, landmark);
    }
    game.layers.propsBehind.addChild(props);
  }

  private drawBiomeLabels(game: Game, graphics: Graphics): void {
    for (const region of ALIGNMENT_GRID_MAP.biomeRegions) {
      const p = worldToIso(region.labelWorldX, region.labelWorldY);
      graphics
        .ellipse(p.screenX, p.screenY + 2, 74, 20)
        .fill({ color: region.colorA, alpha: 0.16 })
        .stroke({ color: region.accent, width: 2, alpha: 0.38 });
    }
  }

  private drawPropCluster(graphics: Graphics, cluster: AlignmentGridPropCluster): void {
    const startX = cluster.worldX - ((cluster.cols - 1) * cluster.spacingX) / 2;
    const startY = cluster.worldY - ((cluster.rows - 1) * cluster.spacingY) / 2;
    for (let row = 0; row < cluster.rows; row += 1) {
      for (let col = 0; col < cluster.cols; col += 1) {
        const x = startX + col * cluster.spacingX + ((row + col) % 2) * 0.08;
        const y = startY + row * cluster.spacingY - ((row * 2 + col) % 3) * 0.06;
        this.drawProp(graphics, cluster, x, y);
      }
    }
  }

  private drawProp(graphics: Graphics, cluster: AlignmentGridPropCluster, x: number, y: number): void {
    const p = worldToIso(x, y);
    if (cluster.kind === "tower") {
      graphics.rect(p.screenX - 4, p.screenY - 58, 8, 48).fill(0x202833);
      graphics.rect(p.screenX - 14, p.screenY - 64, 28, 12).fill(cluster.accent).stroke({ color: palette.ink, width: 2 });
      return;
    }
    if (cluster.kind === "tent") {
      graphics
        .poly([p.screenX - 22, p.screenY - 12, p.screenX, p.screenY - 42, p.screenX + 22, p.screenY - 12])
        .fill(cluster.color)
        .stroke({ color: palette.ink, width: 3 });
      graphics.rect(p.screenX - 6, p.screenY - 20, 12, 8).fill(cluster.accent);
      return;
    }
    if (cluster.kind === "server_buoy") {
      graphics.rect(p.screenX - 12, p.screenY - 28, 24, 18).fill(cluster.color).stroke({ color: palette.ink, width: 3 });
      graphics.rect(p.screenX - 7, p.screenY - 38, 14, 8).fill(cluster.accent).stroke({ color: palette.ink, width: 2 });
      return;
    }
    if (cluster.kind === "rail_sign") {
      graphics.rect(p.screenX - 16, p.screenY - 46, 32, 22).fill(cluster.color).stroke({ color: palette.ink, width: 3 });
      graphics.rect(p.screenX - 10, p.screenY - 40, 20, 5).fill(cluster.accent);
      return;
    }
    if (cluster.kind === "solar_mirror") {
      graphics.rect(p.screenX - 3, p.screenY - 42, 6, 32).fill(0x202833);
      graphics
        .poly([p.screenX - 18, p.screenY - 52, p.screenX + 18, p.screenY - 46, p.screenX + 13, p.screenY - 26, p.screenX - 21, p.screenY - 32])
        .fill({ color: cluster.color, alpha: 0.95 })
        .stroke({ color: cluster.accent, width: 2, alpha: 0.86 });
      return;
    }
    if (cluster.kind === "antenna") {
      graphics.rect(p.screenX - 4, p.screenY - 64, 8, 54).fill(0x202833);
      graphics
        .poly([p.screenX - 20, p.screenY - 66, p.screenX, p.screenY - 82, p.screenX + 20, p.screenY - 66, p.screenX, p.screenY - 58])
        .fill({ color: cluster.color, alpha: 0.95 })
        .stroke({ color: cluster.accent, width: 2, alpha: 0.9 });
      graphics.circle(p.screenX, p.screenY - 45, 9).fill(cluster.accent).stroke({ color: palette.ink, width: 2 });
      return;
    }
    if (cluster.kind === "route_mouth") {
      graphics
        .ellipse(p.screenX, p.screenY - 22, 28, 12)
        .fill({ color: cluster.color, alpha: 0.92 })
        .stroke({ color: cluster.accent, width: 3, alpha: 0.9 });
      graphics.rect(p.screenX - 18, p.screenY - 27, 7, 5).fill(0xfff4d6);
      graphics.rect(p.screenX - 3, p.screenY - 29, 7, 5).fill(0xfff4d6);
      graphics.rect(p.screenX + 12, p.screenY - 27, 7, 5).fill(0xfff4d6);
      return;
    }
    if (cluster.kind === "memory_shard") {
      graphics
        .poly([p.screenX, p.screenY - 48, p.screenX + 11, p.screenY - 20, p.screenX, p.screenY - 8, p.screenX - 11, p.screenY - 20])
        .fill({ color: cluster.accent, alpha: 0.8 })
        .stroke({ color: palette.ink, width: 2 });
      return;
    }
    if (cluster.kind === "redaction_stack") {
      graphics.rect(p.screenX - 17, p.screenY - 48, 34, 34).fill(cluster.color).stroke({ color: palette.ink, width: 3 });
      graphics.rect(p.screenX - 12, p.screenY - 40, 24, 5).fill(cluster.accent);
      graphics.rect(p.screenX - 12, p.screenY - 30, 18, 5).fill(0x596270);
      return;
    }
    graphics.rect(p.screenX - 24, p.screenY - 28, 48, 14).fill(cluster.color).stroke({ color: palette.ink, width: 3 });
    graphics.rect(p.screenX - 18, p.screenY - 34, 36, 6).fill(cluster.accent);
  }

  private drawMicroLandmark(graphics: Graphics, landmark: AlignmentGridMicroLandmark): void {
    const p = worldToIso(landmark.worldX, landmark.worldY);
    graphics.ellipse(p.screenX, p.screenY + 3, 17, 7).fill({ color: palette.shadow, alpha: 0.28 });
    if (landmark.kind === "mirror") {
      graphics.rect(p.screenX - 3, p.screenY - 28, 6, 24).fill(0x202833);
      graphics
        .poly([p.screenX - 12, p.screenY - 34, p.screenX + 13, p.screenY - 30, p.screenX + 9, p.screenY - 16, p.screenX - 14, p.screenY - 20])
        .fill(landmark.color)
        .stroke({ color: landmark.accent, width: 2, alpha: 0.82 });
      return;
    }
    if (landmark.kind === "antenna" || landmark.kind === "cable_knot") {
      graphics.rect(p.screenX - 3, p.screenY - 36, 6, 30).fill(0x202833);
      graphics.circle(p.screenX, p.screenY - 38, landmark.kind === "antenna" ? 9 : 7).fill(landmark.accent).stroke({ color: palette.ink, width: 2 });
      graphics.rect(p.screenX - 13, p.screenY - 11, 26, 8).fill(landmark.color).stroke({ color: palette.ink, width: 2 });
      return;
    }
    if (landmark.kind === "buoy" || landmark.kind === "train_marker" || landmark.kind === "court_writ") {
      graphics.rect(p.screenX - 12, p.screenY - 26, 24, 19).fill(landmark.color).stroke({ color: palette.ink, width: 2 });
      graphics.rect(p.screenX - 8, p.screenY - 32, 16, 6).fill(landmark.accent).stroke({ color: palette.ink, width: 1 });
      return;
    }
    if (landmark.kind === "redaction") {
      graphics.rect(p.screenX - 14, p.screenY - 32, 28, 25).fill(landmark.color).stroke({ color: landmark.accent, width: 2, alpha: 0.74 });
      graphics.rect(p.screenX - 10, p.screenY - 25, 20, 4).fill(0xfff4d6);
      graphics.rect(p.screenX - 8, p.screenY - 16, 16, 4).fill(0x596270);
      return;
    }
    if (landmark.kind === "teeth") {
      graphics
        .ellipse(p.screenX, p.screenY - 12, 19, 9)
        .fill({ color: landmark.color, alpha: 0.94 })
        .stroke({ color: landmark.accent, width: 2, alpha: 0.9 });
      graphics.rect(p.screenX - 10, p.screenY - 16, 5, 5).fill(0xfff4d6);
      graphics.rect(p.screenX + 1, p.screenY - 17, 5, 5).fill(0xfff4d6);
      graphics.rect(p.screenX + 10, p.screenY - 15, 5, 5).fill(0xfff4d6);
      return;
    }
    if (landmark.kind === "campfire") {
      graphics
        .poly([p.screenX - 13, p.screenY - 8, p.screenX, p.screenY - 29, p.screenX + 13, p.screenY - 8])
        .fill(landmark.color)
        .stroke({ color: palette.ink, width: 2 });
      graphics.circle(p.screenX, p.screenY - 16, 5).fill(landmark.accent);
      return;
    }
    graphics
      .poly([p.screenX, p.screenY - 34, p.screenX + 9, p.screenY - 15, p.screenX, p.screenY - 6, p.screenX - 9, p.screenY - 15])
      .fill({ color: landmark.accent, alpha: 0.86 })
      .stroke({ color: palette.ink, width: 2 });
  }

  private drawNodes(game: Game): void {
    const art = this.productionArt(game);
    for (const node of ALIGNMENT_GRID_MAP.nodes) {
      const available = this.isNodeAvailable(node, game);
      const completed = game.completedNodes.has(node.id);
      const selected = node.id === this.selectedId;
      const p = worldToIso(node.worldX, node.worldY);
      const graphics = new Graphics();
      graphics.ellipse(p.screenX, p.screenY + 2, 58, 18).fill({ color: completed ? palette.mint : available ? palette.lemon : 0x232936, alpha: completed ? 0.28 : 0.18 });
      if (art) {
        const sprite = new Sprite(art.alignmentGridNodes[node.visualKind === "archive" || node.visualKind === "beacon" ? "cache" : node.visualKind === "finale" ? "spire" : node.visualKind]);
        sprite.anchor.set(0.5, 0.86);
        sprite.scale.set(selected ? 1.08 : 1);
        sprite.position.set(p.screenX, p.screenY + 4);
        sprite.tint = available ? 0xffffff : 0x8b94a3;
        game.layers.entities.addChild(sprite);
      } else {
        this.drawNodeBuilding(graphics, node, p.screenX, p.screenY, available, completed, selected);
      }
      if (selected) {
        graphics.ellipse(p.screenX, p.screenY + 3, 68, 22).stroke({ color: available ? palette.mint : 0xff8a5c, width: 4, alpha: 0.86 });
        graphics.ellipse(p.screenX, p.screenY + 3, 76 + Math.sin(this.seconds * 5) * 5, 25 + Math.sin(this.seconds * 5) * 2).stroke({ color: available ? palette.mint : 0xff8a5c, width: 2, alpha: 0.38 });
      }
      if (selected && !available && !completed) {
        graphics.rect(p.screenX - 36, p.screenY - 94, 72, 19).fill({ color: 0x030609, alpha: 0.72 }).stroke({ color: 0x8b94a3, width: 2, alpha: 0.8 });
      }
      game.layers.entities.addChild(graphics);
      this.drawNodeLabel(game, node, p.screenX, p.screenY, available, completed, selected, Boolean(art));
    }
    this.drawBiomeRegionLabels(game);
    this.drawAnimatedRouteState(game);
  }

  private drawBiomeRegionLabels(game: Game): void {
    for (const region of ALIGNMENT_GRID_MAP.biomeRegions) {
      const p = worldToIso(region.labelWorldX, region.labelWorldY);
      const label = new Text({
        text: region.label.toUpperCase(),
        style: { ...fontStyle, fontSize: 9, fill: "#aab0bd", align: "center" }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY - 12);
      game.layers.floatingText.addChild(label);
    }
  }

  private drawAnimatedRouteState(game: Game): void {
    const pulse = (Math.sin(this.seconds * 3.2) + 1) * 0.5;
    const routeStates = this.routeStates(game);
    for (const route of ALIGNMENT_GRID_MAP.routes) {
      const state = routeStates.find((candidate) => candidate.id === route.id)?.state ?? "locked";
      if (state === "locked") continue;
      const midpoint = routeMidpoint(route);
      const p = worldToIso(midpoint.worldX, midpoint.worldY);
      const color = state === "stable" ? palette.mint : palette.lemon;
      const alpha = state === "stable" ? 0.28 + pulse * 0.16 : 0.18 + pulse * 0.22;
      const marker = new Graphics();
      marker.ellipse(p.screenX, p.screenY - 7, 18 + pulse * 8, 7 + pulse * 3).stroke({ color, width: state === "stable" ? 2 : 3, alpha });
      game.layers.floatingText.addChild(marker);
      const selectedAdjacent = route.from === this.selectedId || route.to === this.selectedId;
      if (!selectedAdjacent) continue;
      const label = new Text({
        text: `${route.label.toUpperCase()} // ${state.toUpperCase()}`,
        style: { ...fontStyle, fontSize: 9, fill: state === "stable" ? "#64e0b4" : "#ffd166", align: "center" }
      });
      label.anchor.set(0.5);
      label.position.set(p.screenX, p.screenY - 28);
      game.layers.floatingText.addChild(label);
    }
  }

  private drawNodeBuilding(graphics: Graphics, node: AlignmentGridNode, x: number, y: number, available: boolean, completed: boolean, selected: boolean): void {
    const primary = completed ? palette.mint : available ? palette.lemon : 0x596270;
    const roof = available ? nodeColor(node) : 0x323846;
    const stroke = selected ? palette.white : palette.ink;
    const strokeWidth = selected ? 5 : 3;
    if (node.visualKind === "plaza") {
      graphics.rect(x - 34, y - 64, 68, 50).fill(primary).stroke({ color: stroke, width: strokeWidth });
      graphics.rect(x - 20, y - 92, 40, 28).fill(roof).stroke({ color: palette.ink, width: 3 });
      graphics.rect(x - 46, y - 14, 92, 12).fill(completed ? palette.mint : 0x64e0b4).stroke({ color: palette.ink, width: 2 });
    } else if (node.visualKind === "relay") {
      graphics.rect(x - 24, y - 52, 48, 42).fill(primary).stroke({ color: stroke, width: strokeWidth });
      graphics.rect(x - 5, y - 108, 10, 56).fill(0x202833);
      graphics.circle(x, y - 112, 14).fill(roof).stroke({ color: palette.ink, width: 3 });
    } else if (node.visualKind === "lake") {
      graphics.rect(x - 44, y - 42, 88, 26).fill(0x164d61).stroke({ color: stroke, width: strokeWidth });
      graphics.rect(x - 24, y - 62, 48, 22).fill(primary).stroke({ color: palette.ink, width: 3 });
      graphics.rect(x - 12, y - 82, 24, 18).fill(roof).stroke({ color: palette.ink, width: 3 });
    } else if (node.visualKind === "camp") {
      graphics
        .poly([x - 42, y - 12, x, y - 66, x + 42, y - 12])
        .fill(primary)
        .stroke({ color: stroke, width: strokeWidth });
      graphics.rect(x - 13, y - 28, 26, 14).fill(roof).stroke({ color: palette.ink, width: 2 });
    } else if (node.visualKind === "cache") {
      graphics.rect(x - 30, y - 56, 60, 38).fill(0x3f3756).stroke({ color: stroke, width: strokeWidth });
      graphics.rect(x - 18, y - 78, 36, 20).fill(primary).stroke({ color: palette.ink, width: 3 });
      graphics.circle(x, y - 88, 8).fill(roof).stroke({ color: palette.ink, width: 2 });
    } else if (node.visualKind === "archive") {
      graphics.rect(x - 34, y - 58, 68, 40).fill(0x111820).stroke({ color: stroke, width: strokeWidth });
      graphics.rect(x - 24, y - 80, 48, 18).fill(primary).stroke({ color: palette.ink, width: 3 });
      graphics.rect(x - 19, y - 72, 38, 5).fill(0xfff4d6);
      graphics.rect(x - 14, y - 44, 28, 6).fill(roof);
    } else if (node.visualKind === "beacon") {
      graphics.rect(x - 42, y - 40, 84, 24).fill(0x164d61).stroke({ color: stroke, width: strokeWidth });
      graphics.rect(x - 24, y - 58, 48, 26).fill(primary).stroke({ color: palette.ink, width: 3 });
      graphics.rect(x - 5, y - 112, 10, 54).fill(0x202833);
      graphics.circle(x, y - 118, 13).fill(roof).stroke({ color: palette.ink, width: 3 });
      graphics.rect(x - 18, y - 86, 36, 8).fill(0xffd166).stroke({ color: palette.ink, width: 2 });
    } else if (node.visualKind === "finale") {
      graphics.rect(x - 48, y - 48, 96, 30).fill(0x1b1028).stroke({ color: stroke, width: strokeWidth });
      graphics
        .poly([x - 36, y - 48, x, y - 96, x + 36, y - 48, x + 18, y - 36, x, y - 70, x - 18, y - 36])
        .fill({ color: primary, alpha: 0.96 })
        .stroke({ color: palette.ink, width: 3 });
      graphics.circle(x, y - 78, 12).fill(roof).stroke({ color: palette.ink, width: 3 });
      graphics.rect(x - 26, y - 30, 52, 7).fill(0xff5d57).stroke({ color: palette.ink, width: 2 });
    } else {
      graphics.rect(x - 48, y - 52, 96, 36).fill(primary).stroke({ color: stroke, width: strokeWidth });
      graphics.rect(x - 36, y - 78, 72, 26).fill(roof).stroke({ color: palette.ink, width: 3 });
      graphics.rect(x - 12, y - 94, 24, 14).fill(palette.plum).stroke({ color: palette.ink, width: 2 });
    }
  }

  private drawNodeLabel(game: Game, node: AlignmentGridNode, x: number, y: number, available: boolean, completed: boolean, selected: boolean, productionLayout: boolean): void {
    if (!selected && !available && !completed) return;
    const distance = Math.hypot(this.worldX - node.worldX, this.worldY - node.worldY);
    const showFullLabel = !productionLayout || selected || completed || (available && distance < 7.2);
    if (!showFullLabel) {
      const compact = new Text({
        text: node.nodeType
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase(),
        style: { ...fontStyle, fontSize: 9, fill: available ? "#ffd166" : "#8b94a3", align: "center" }
      });
      compact.anchor.set(0.5);
      compact.position.set(x + (node.labelOffsetX ?? 0) * 0.35, y - 82 + (node.labelOffsetY ?? 0) * 0.35);
      game.layers.floatingText.addChild(compact);
      return;
    }

    const label = new Text({
      text: `${completed ? "STABLE " : available ? "" : "LOCKED "}${node.name.toUpperCase()}`,
      style: { ...fontStyle, fontSize: selected ? 14 : 12, fill: available ? "#fff4d6" : "#aab0bd", align: "center" }
    });
    label.anchor.set(0.5);
    label.position.set(x + (node.labelOffsetX ?? 0), y - (productionLayout ? 112 : 124) + (node.labelOffsetY ?? 0));
    game.layers.floatingText.addChild(label);

    const type = new Text({
      text: node.nodeType.toUpperCase(),
      style: { ...fontStyle, fontSize: 10, fill: completed ? "#64e0b4" : available ? "#ffd166" : "#8b94a3", align: "center" }
    });
    type.anchor.set(0.5);
    type.position.set(x + (node.labelOffsetX ?? 0), y - (productionLayout ? 92 : 102) + (node.labelOffsetY ?? 0));
    game.layers.floatingText.addChild(type);

    const nearest = nearestNode(ALIGNMENT_GRID_MAP.nodes, this.worldX, this.worldY);
    if (selected && available && nearest.distance < 1.1) {
      const prompt = new Text({
        text: "ENTER",
        style: { ...fontStyle, fontSize: 14, fill: "#64e0b4", align: "center" }
      });
      prompt.anchor.set(0.5);
      prompt.position.set(x + (node.labelOffsetX ?? 0), y - (productionLayout ? 72 : 82) + (node.labelOffsetY ?? 0));
      game.layers.floatingText.addChild(prompt);
    }
  }

  private drawAvatar(game: Game): void {
    const art = this.productionArt(game);
    if (!art) {
      drawPixelPerson(game.layers.entities, this.worldX, this.worldY, palette.blue, palette.paper);
      return;
    }
    const p = worldToIso(this.worldX, this.worldY);
    const shadow = new Graphics();
    shadow.ellipse(p.screenX, p.screenY + 7, 18, 6).fill({ color: palette.shadow, alpha: 0.36 });
    shadow.ellipse(p.screenX, p.screenY + 7, 17, 6).stroke({ color: palette.mint, width: 2, alpha: 0.7 });
    game.layers.entities.addChild(shadow);

    const rosterArt = getMilestone49PlayableArtTextures();
    const texture = rosterArt
      ? milestone49NetworkPlayerTextureFor(game.selectedClassId, this.avatarFacing, this.avatarMoving, this.seconds, rosterArt)
      : milestone12NetworkPlayerTexture(0, this.avatarFacing, this.avatarMoving, this.seconds, art);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0.9);
    sprite.scale.set(rosterArt ? 0.82 : 1.16);
    sprite.position.set(p.screenX, p.screenY + 4);
    sprite.zIndex = this.worldX + this.worldY + 0.1;
    game.layers.entities.addChild(sprite);
  }

  private drawSelectedNodeCard(game: Game): void {
    const node = this.selectedNode;
    const p = worldToIso(node.worldX, node.worldY);
    const available = this.isNodeAvailable(node, game);
    const completed = game.completedNodes.has(node.id);
    const nextNode = nextRecommendedAlignmentNode(game.completedNodes, game.unlockedNodes);
    const status = selectedNodeRouteStatus(node, nextNode, completed, available);
    const statusColor = status === "RECOMMENDED"
      ? palette.mint
      : status === "RISKY"
        ? 0xff8a5c
        : status === "STABLE"
          ? 0x64e0b4
          : status === "LOCKED"
            ? 0x8b94a3
            : palette.lemon;
    const info = LEVEL_CARD_INFO[node.id] ?? { mapKind: node.nodeType, objectiveType: node.theme };
    const clarity = campaignClarityForNode(node.id);
    const boss = bossContractForArena(node.arenaId);
    const consequence = visibleRouteConsequenceText(node, game.completedNodes, game.unlockedNodes);
    const routeLine = selectedRouteLine(node, game.completedNodes);

    const panelW = 320;
    const panelH = 222;
    const side = p.screenX > 18 ? -1 : 1;
    const x = p.screenX + side * 118 - (side < 0 ? panelW : 0);
    const y = p.screenY - 190;
    const panel = new Graphics();
    panel
      .rect(x + 8, y + 10, panelW, panelH)
      .fill({ color: 0x030609, alpha: 0.46 });
    panel
      .rect(x, y, panelW, panelH)
      .fill({ color: 0x101820, alpha: 0.94 })
      .stroke({ color: statusColor, width: 3, alpha: 0.9 });
    panel.rect(x, y, panelW, 38).fill({ color: 0x17232d, alpha: 0.98 });
    panel.rect(x + panelW - 116, y + 10, 100, 18).fill({ color: statusColor, alpha: 0.18 }).stroke({ color: statusColor, width: 2, alpha: 0.75 });
    panel.rect(x + 14, y + 52, panelW - 28, 2).fill({ color: statusColor, alpha: 0.36 });
    panel.rect(x + 14, y + 136, panelW - 28, 2).fill({ color: 0x596270, alpha: 0.38 });
    panel.rect(x + 14, y + 170, panelW - 28, 2).fill({ color: 0x596270, alpha: 0.32 });
    panel.rect(x + (side > 0 ? -20 : panelW), y + 72, 20, 10).fill({ color: statusColor, alpha: 0.9 });
    game.layers.floatingText.addChild(panel);

    this.addCardText(game, `${clarity ? `L${clarity.levelNumber}/${CAMPAIGN_LEVEL_COUNT} ` : ""}${node.name.toUpperCase()}`, x + 16, y + 10, 14, "#fff4d6", 180);
    this.addCardText(game, status, x + panelW - 111, y + 13, 8, colorToCss(statusColor), 90, "center");
    this.addCardText(game, `${node.nodeType.toUpperCase()} // ${node.regionLabel.toUpperCase()}`, x + 16, y + 40, 8, "#9fd8d1", panelW - 32);

    this.addCardText(game, "MAP", x + 16, y + 61, 8, "#72eadc", 48);
    this.addCardText(game, info.mapKind, x + 70, y + 61, 9, "#e7f4ef", 230);
    this.addCardText(game, "OBJ", x + 16, y + 80, 8, "#72eadc", 48);
    this.addCardText(game, clarity ? `${clarity.verb} ${clarity.objectiveUnit}` : info.objectiveType, x + 70, y + 80, 9, "#e7f4ef", 230);
    this.addCardText(game, "BOSS", x + 16, y + 99, 8, "#72eadc", 48);
    this.addCardText(game, boss.displayName, x + 70, y + 99, 9, "#e7f4ef", 230);
    this.addCardText(game, "ROUTE", x + 16, y + 118, 8, "#72eadc", 48);
    this.addCardText(game, routeLine, x + 70, y + 118, 9, "#e7f4ef", 230);

    this.addCardText(game, "REWARD", x + 16, y + 146, 8, "#ffd166", panelW - 32);
    this.addCardText(game, node.rewardPromise, x + 16, y + 160, 8, "#cfd8d4", panelW - 32, "left", 11);
    this.addCardText(game, "CONSEQUENCE", x + 16, y + 190, 8, completed ? "#64e0b4" : available ? "#ffd166" : "#8b94a3", panelW - 32);
    this.addCardText(game, consequence, x + 16, y + 203, 8, completed ? "#64e0b4" : available ? "#ffd166" : "#8b94a3", panelW - 32, "left", 11);
  }

  private addCardText(game: Game, text: string, x: number, y: number, size: number, fill: string, width: number, align: "left" | "right" | "center" = "left", lineHeight?: number): void {
    const label = new Text({
      text,
      style: {
        ...fontStyle,
        fontSize: size,
        fill,
        align,
        wordWrap: true,
        wordWrapWidth: width,
        lineHeight: lineHeight ?? Math.ceil(size * 1.2)
      }
    });
    label.position.set(x, y);
    game.layers.floatingText.addChild(label);
  }

  private drawHud(game: Game): void {
    const visibleRoutes = ALIGNMENT_GRID_MAP.routes.filter((route) => this.isProgressionRouteVisible(route));
    const stableRoutes = visibleRoutes.filter((route) => this.routeState(route, game) === "stable").length;
    const campaign = campaignRouteSummary(game);
    const nextNode = nextRecommendedAlignmentNode(game.completedNodes, game.unlockedNodes);
    const top = new Graphics();
    top.rect(18, 18, 430, 72).fill({ color: 0x071018, alpha: 0.72 }).stroke({ color: palette.mint, width: 2, alpha: 0.7 });
    game.layers.hud.addChild(top);

    const title = new Text({
      text: `${GAME_TITLE}\n${ALIGNMENT_GRID_MAP.label.toUpperCase()} // ROADS ${stableRoutes}/${visibleRoutes.length}`,
      style: { ...fontStyle, fontSize: 13, fill: "#fff4d6", lineHeight: 17 }
    });
    title.position.set(34, 30);
    game.layers.hud.addChild(title);

    const next = new Text({
      text: `NEXT ${nextNode.compactLabel ?? nextNode.name.toUpperCase()} // ${campaign.focus.toUpperCase()}`,
      style: { ...fontStyle, fontSize: 9, fill: "#9fd8d1" }
    });
    next.position.set(34, 68);
    game.layers.hud.addChild(next);

    const hint = new Text({
      text: this.avatarMoving ? "TRAVERSING ROUTE" : "A/D or Arrows: walk route    Enter/E: deploy at unlocked landmark    C: camp",
      style: { ...fontStyle, fontSize: 12, fill: "#e7f4ef", stroke: { color: "#030609", width: 4 }, align: "center" }
    });
    hint.anchor.set(0.5);
    hint.position.set(game.width / 2, game.height - 28);
    game.layers.hud.addChild(hint);
  }

  private routePoints(route: AlignmentGridRoute): { worldX: number; worldY: number }[] {
    const from = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.from);
    const to = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.to);
    if (!from || !to) return route.checkpoints;
    return [
      { worldX: from.worldX, worldY: from.worldY },
      ...route.checkpoints,
      { worldX: to.worldX, worldY: to.worldY }
    ];
  }

  private productionArt(game: Game) {
    if (!game.useMilestone10Art) return null;
    const textures = getMilestone12ArtTextures();
    if (!getMilestone49PlayableArtTextures() && !this.requestedRosterArtLoad) {
      this.requestedRosterArtLoad = true;
      void loadMilestone49PlayableArt().then(() => {
        if (game.state.current !== this) return;
        this.render(game);
      });
    }
    if (!textures && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void Promise.all([loadMilestone12Art(), loadMilestone49PlayableArt()]).then(() => {
        if (game.state.current !== this) return;
        this.staticMapDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private ensureStaticMap(game: Game): void {
    const key = this.makeStaticMapKey(game);
    if (this.staticMapDrawn && this.staticMapKey === key) return;
    clearLayer(game.layers.background);
    clearLayer(game.layers.ground);
    clearLayer(game.layers.decals);
    clearLayer(game.layers.propsBehind);
    this.drawBackground(game);
    this.drawGround(game);
    this.drawRoutes(game);
    if (!getMilestone12ArtTextures()?.alignmentGridBackdrop) {
      this.drawProps(game);
    }
    this.staticMapDrawn = true;
    this.staticMapKey = key;
  }

  private makeStaticMapKey(game: Game): string {
    return [
      game.useMilestone10Art ? "art" : "placeholder",
      getMilestone12ArtTextures() ? "art-ready" : "art-loading",
      this.selectedId,
      [...game.completedNodes].sort().join(","),
      [...game.unlockedNodes].sort().join(",")
    ].join("|");
  }
}

function nodeColor(node: AlignmentGridNode): number {
  if (node.visualKind === "relay") return palette.mint;
  if (node.visualKind === "lake") return palette.blue;
  if (node.visualKind === "transit") return palette.plum;
  if (node.visualKind === "camp") return palette.tomato;
  if (node.visualKind === "cache") return 0x45aaf2;
  if (node.visualKind === "archive") return 0xfff4d6;
  if (node.visualKind === "beacon") return 0x64e0b4;
  if (node.visualKind === "finale") return 0xff5d57;
  return 0x3a3f4b;
}

function selectedNodeRouteStatus(node: AlignmentGridNode, nextNode: AlignmentGridNode, completed: boolean, available: boolean): "RECOMMENDED" | "OPTIONAL" | "RISKY" | "STABLE" | "LOCKED" {
  if (completed) return "STABLE";
  if (!available) return "LOCKED";
  if (node.id === nextNode.id) return "RECOMMENDED";
  if (node.nodeType === "Shortcut Route" || node.nodeType === "Boss Gate") return "RISKY";
  return "OPTIONAL";
}

function selectedRouteLine(node: AlignmentGridNode, completedNodes: ReadonlySet<string>): string {
  const incoming = ALIGNMENT_GRID_MAP.routes.find((route) => route.to === node.id && completedNodes.has(route.from));
  if (incoming) return incoming.label;
  const visibleIncoming = ALIGNMENT_GRID_MAP.routes.find((route) => route.to === node.id);
  if (visibleIncoming) return visibleIncoming.label;
  const outgoing = ALIGNMENT_GRID_MAP.routes.find((route) => route.from === node.id);
  if (outgoing) return `${outgoing.label} -> ${alignmentGridNodeById(outgoing.to)?.compactLabel ?? alignmentGridNodeById(outgoing.to)?.name ?? outgoing.to}`;
  return node.id === START_NODE_ID ? "First stable road" : "Final route mouth";
}

function colorToCss(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

function inPatch(patch: AlignmentGridTerrainPatch, x: number, y: number): boolean {
  return x >= patch.minX && x <= patch.maxX && y >= patch.minY && y <= patch.maxY;
}

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / lengthSquared, 0, 1);
  const x = ax + t * dx;
  const y = ay + t * dy;
  return Math.hypot(px - x, py - y);
}

function routeMidpoint(route: AlignmentGridRoute): { worldX: number; worldY: number } {
  const points = route.checkpoints;
  if (points.length > 0) return points[Math.floor(points.length / 2)];
  const from = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.from);
  const to = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.to);
  if (!from || !to) return { worldX: 0, worldY: 0 };
  return { worldX: (from.worldX + to.worldX) / 2, worldY: (from.worldY + to.worldY) / 2 };
}

function routeBiomeTexture(route: AlignmentGridRoute): string {
  const to = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.to);
  const from = ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === route.from);
  const region = ALIGNMENT_GRID_MAP.biomeRegions.find((candidate) => candidate.id === to?.regionLabel || candidate.label === to?.regionLabel || candidate.label === from?.regionLabel);
  return region?.routeTexture ?? "causeway";
}

function routeConsequence(route: AlignmentGridRoute, completedNodes: ReadonlySet<string>): string {
  const from = alignmentGridNodeById(route.from);
  const to = alignmentGridNodeById(route.to);
  if (!from || !to) return "Route consequence unknown.";
  if (completedNodes.has(route.from)) return `${route.label} stabilized by ${from.name}.`;
  return `${route.label} unlocks toward ${to.name}.`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function facingFromWorldVelocity(velocityX: number, velocityY: number): PlayerFacing {
  const screenX = velocityX - velocityY;
  const screenY = velocityX + velocityY;
  if (Math.abs(screenY) >= Math.abs(screenX)) return screenY >= 0 ? "south" : "north";
  return screenX >= 0 ? "east" : "west";
}
