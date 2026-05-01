import { Graphics, Sprite, Text } from "pixi.js";
import { palette, fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { screenVectorToWorld, worldToIso } from "../iso/projection";
import { drawIsoDiamond } from "../iso/tilemap";
import { clearLayer } from "../render/layers";
import { drawPixelPerson } from "../render/sprites";
import { GAME_TITLE } from "../content/uiText";
import { ALIGNMENT_GRID_MAP, type AlignmentGridNode, type AlignmentGridPropCluster, type AlignmentGridRoute, type AlignmentGridTerrainPatch } from "./alignmentGridMap";
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
      state: this.routeState(route, game)
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
    for (const cluster of ALIGNMENT_GRID_MAP.propClusters) {
      this.drawPropCluster(props, cluster);
    }
    game.layers.propsBehind.addChild(props);
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
        const sprite = new Sprite(art.alignmentGridNodes[node.visualKind === "archive" ? "cache" : node.visualKind]);
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
