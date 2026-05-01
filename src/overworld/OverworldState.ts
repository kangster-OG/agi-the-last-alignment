import { Graphics, Sprite, Text } from "pixi.js";
import { palette, fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { screenVectorToWorld, worldToIso } from "../iso/projection";
import { drawIsoDiamond } from "../iso/tilemap";
import { clearLayer } from "../render/layers";
import { drawPixelPerson } from "../render/sprites";
import { GAME_TITLE } from "../content/uiText";
import { ALIGNMENT_GRID_MAP, type AlignmentGridMicroLandmark, type AlignmentGridNode, type AlignmentGridPropCluster, type AlignmentGridRoute, type AlignmentGridTerrainPatch } from "./alignmentGridMap";
import { MAP_GRAPH } from "./mapGraph";
import { isNodeAvailable, nearestNode } from "./levelNodes";
import { getMilestone12ArtTextures, loadMilestone12Art, milestone12NetworkPlayerTexture, type RouteSigilState } from "../assets/milestone12Art";
import type { PlayerFacing } from "../assets/milestone10Art";

export type RouteState = "stable" | "unstable" | "locked";

export class OverworldState implements GameState {
  readonly mode = "OverworldMap" as const;
  worldX = -7;
  worldY = -1;
  selectedId = "armistice_plaza";
  private requestedProductionArtLoad = false;
  private avatarFacing: PlayerFacing = "south";
  private avatarMoving = false;
  private seconds = 0;
  private staticMapDrawn = false;
  private staticMapKey = "";

  get selectedNode() {
    return ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === this.selectedId) ?? ALIGNMENT_GRID_MAP.nodes[0];
  }

  enter(game: Game): void {
    const node = ALIGNMENT_GRID_MAP.nodes.find((candidate) => candidate.id === game.lastNodeId) ?? ALIGNMENT_GRID_MAP.nodes[0];
    this.worldX = node.worldX;
    this.worldY = node.worldY;
    this.selectedId = node.id;
    this.render(game);
  }

  exit(): void {
    this.staticMapDrawn = false;
    this.staticMapKey = "";
  }

  update(game: Game, dt: number): void {
    this.seconds += dt;
    const axis = game.input.axis();
    const world = screenVectorToWorld(axis.x, axis.y);
    const len = Math.hypot(world.worldX, world.worldY) || 1;
    this.avatarMoving = Math.hypot(axis.x, axis.y) > 0.01;
    if (this.avatarMoving) {
      const velocityX = world.worldX / len;
      const velocityY = world.worldY / len;
      this.avatarFacing = facingFromWorldVelocity(velocityX, velocityY);
      this.worldX += velocityX * 4.1 * dt;
      this.worldY += velocityY * 4.1 * dt;
    }
    this.worldX = clamp(this.worldX, ALIGNMENT_GRID_MAP.bounds.minX + 0.4, ALIGNMENT_GRID_MAP.bounds.maxX - 0.4);
    this.worldY = clamp(this.worldY, ALIGNMENT_GRID_MAP.bounds.minY + 0.4, ALIGNMENT_GRID_MAP.bounds.maxY - 0.4);

    const nearest = nearestNode(ALIGNMENT_GRID_MAP.nodes, this.worldX, this.worldY);
    this.selectedId = nearest.node.id;
    const available = this.isNodeAvailable(nearest.node, game);
    if (nearest.distance < 1.1 && available && game.input.wasPressed("interact")) {
      game.lastNodeId = nearest.node.id;
      game.startRun(nearest.node.id);
    }
  }

  render(game: Game): void {
    game.camera.zoom = 1;
    game.camera.follow(
      clamp(this.worldX, ALIGNMENT_GRID_MAP.bounds.minX + 2, ALIGNMENT_GRID_MAP.bounds.maxX - 2),
      clamp(this.worldY, ALIGNMENT_GRID_MAP.bounds.minY + 2, ALIGNMENT_GRID_MAP.bounds.maxY - 2),
      1
    );
    game.camera.apply(game.layers.root, game.width, game.height);

    this.ensureStaticMap(game);
    clearLayer(game.layers.entities);
    clearLayer(game.layers.floatingText);
    clearLayer(game.layers.hud);
    clearLayer(game.layers.propsFront);
    this.drawNodes(game);
    this.drawAvatar(game);
    this.drawHud(game);
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
      finaleCorruption: route.to === "alignment_spire_finale" || route.from === "alignment_spire_finale"
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

  dioramaInfo(game: Game) {
    const stableRoutes = this.routeStates(game).filter((route) => route.state === "stable");
    const availableNodes = ALIGNMENT_GRID_MAP.nodes.filter((node) => this.isNodeAvailable(node, game));
    const completedFinale = game.completedNodes.has("alignment_spire_finale");
    const finaleAvailable = availableNodes.some((node) => node.id === "alignment_spire_finale");
    return {
      set: "milestone51_overworld_diorama_1_0",
      densityPolicy: "dense_isometric_biome_regions_micro_landmarks_route_labels_and_animated_route_state",
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
      routeReadabilityPolicy: "roads use dark underlay, state color, midpoint sigils, compact labels, and pulse markers without covering node labels",
      unlockRevealPolicy: "sealed nodes stay visible as dim silhouettes; available and completed nodes gain full labels",
      partyVotingPolicy: "online lobby keeps party tokens, vote pips, selected-node labels, and route focus telemetry visible",
      finaleCorruptionState: completedFinale ? "contained" : finaleAvailable ? "active_reachable" : "dormant_teeth_visible"
    };
  }

  private isNodeAvailable(node: AlignmentGridNode, game: Game): boolean {
    return isNodeAvailable(node, MAP_GRAPH, game.completedNodes, game.unlockedNodes);
  }

  private drawBackground(game: Game): void {
    const bg = new Graphics();
    bg.rect(-3600, -2800, 7200, 5600).fill(0x142132);
    game.layers.background.addChild(bg);
  }

  private drawGround(game: Game): void {
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
    for (const route of ALIGNMENT_GRID_MAP.routes) {
      const state = this.routeState(route, game);
      const points = this.routePoints(route).map((point) => worldToIso(point.worldX, point.worldY));
      const color = state === "stable" ? palette.mint : state === "unstable" ? palette.lemon : 0x596270;
      const alpha = state === "stable" ? 0.95 : state === "unstable" ? 0.55 : 0.22;
      for (let i = 0; i < points.length - 1; i += 1) {
        graphics
          .moveTo(points[i].screenX, points[i].screenY - 8)
          .lineTo(points[i + 1].screenX, points[i + 1].screenY - 8)
          .stroke({ color: palette.ink, width: 16, alpha: 0.72 });
        graphics
          .moveTo(points[i].screenX, points[i].screenY - 8)
          .lineTo(points[i + 1].screenX, points[i + 1].screenY - 8)
          .stroke({ color, width: state === "stable" ? 10 : 8, alpha });
        if (state === "unstable") {
          graphics
            .moveTo(points[i].screenX, points[i].screenY - 8)
            .lineTo(points[i + 1].screenX, points[i + 1].screenY - 8)
            .stroke({ color: palette.white, width: 2, alpha: 0.22 });
        }
      }
      if (art) {
        const midpoint = points[Math.floor(points.length / 2)];
        const sprite = new Sprite(art.routeSigils[state as RouteSigilState]);
        sprite.anchor.set(0.5, 0.78);
        sprite.scale.set(0.62);
        sprite.position.set(midpoint.screenX, midpoint.screenY - 10);
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
      text: `${completed ? "STABLE " : available ? "" : "UNREAL "}${node.name.toUpperCase()}`,
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

    const sprite = new Sprite(milestone12NetworkPlayerTexture(0, this.avatarFacing, this.avatarMoving, this.seconds, art));
    sprite.anchor.set(0.5, 0.9);
    sprite.scale.set(1.16);
    sprite.position.set(p.screenX, p.screenY + 4);
    sprite.zIndex = this.worldX + this.worldY + 0.1;
    game.layers.entities.addChild(sprite);
  }

  private drawHud(game: Game): void {
    const nearest = nearestNode(ALIGNMENT_GRID_MAP.nodes, this.worldX, this.worldY);
    const node = nearest.node;
    const available = this.isNodeAvailable(node, game);
    const completed = game.completedNodes.has(node.id);
    const stableRoutes = this.routeStates(game).filter((route) => route.state === "stable").length;
    const hud = new Text({
      text: `${GAME_TITLE}\n${ALIGNMENT_GRID_MAP.label.toUpperCase()} // ${node.name} // ${node.nodeType}\n${
        completed ? "NODE STABLE" : available ? "ENTER/E: deploy" : "route not real yet"
      }  Roads stable: ${stableRoutes}/${ALIGNMENT_GRID_MAP.routes.length}`,
      style: { ...fontStyle, fontSize: 15, fill: "#fff4d6" }
    });
    hud.position.set(24, 22);
    game.layers.hud.addChild(hud);
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
    if (!textures && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void loadMilestone12Art().then(() => {
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
    this.drawProps(game);
    this.staticMapDrawn = true;
    this.staticMapKey = key;
  }

  private makeStaticMapKey(game: Game): string {
    return [
      game.useMilestone10Art ? "art" : "placeholder",
      getMilestone12ArtTextures() ? "art-ready" : "art-loading",
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
