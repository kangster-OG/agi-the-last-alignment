import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { palette, fontStyle } from "../core/Assets";
import type { Game } from "../core/Game";
import type { GameState } from "../core/StateMachine";
import { clampToBounds } from "../collision/collide";
import { byIsoDepth } from "../iso/depthSort";
import { TILE_HEIGHT, TILE_WIDTH, worldToIso } from "../iso/projection";
import { drawIsoDiamond } from "../iso/tilemap";
import type { Entity, Player } from "../ecs/components";
import { World } from "../ecs/World";
import { createPlayer, updatePlayerFromCommand, xpNeeded } from "../gameplay/player";
import { applyFactionPassive, baseBuild, type BuildStats } from "../gameplay/upgrades";
import { createDirector, updateDirector, type Director } from "../gameplay/director";
import { createWeaponRuntime, updateAutoWeapon, type WeaponRuntime } from "../gameplay/weapons";
import { spawnEnemy, updateEnemy } from "../gameplay/enemies";
import { spawnMiniboss } from "../gameplay/bosses";
import { updatePickup } from "../gameplay/pickups";
import { resolveEnemyPlayerHits, resolveProjectileHits } from "../gameplay/combat";
import { ARENAS, type ArenaData } from "./arenas";
import { UpgradeDraftState } from "../ui/draft";
import { SummaryState } from "../ui/summary";
import { clearLayer } from "../render/layers";
import { drawEnemyOnGraphics, drawPixelPersonOnGraphics } from "../render/sprites";
import { addArmisticeTileSprite, armisticeTileKeyForTerrain, getArmisticeGroundAtlasTextures, loadArmisticeGroundAtlas } from "../assets/armisticeGroundAtlas";
import { placeWorldSprite } from "../assets/milestone10Art";
import {
  getMilestone11ArtTextures,
  loadMilestone11Art,
  milestone11EnemyTextureFor,
  milestone11PlayerTextureFor,
  type Milestone11ArtTextures,
  type Milestone11PropId
} from "../assets/milestone11Art";
import { getMilestone12ArtTextures, loadMilestone12Art, milestone12PlayerTextureFor } from "../assets/milestone12Art";
import { getMilestone14ArtTextures, impactFrameForLife, loadMilestone14Art, pickupFrameForLife } from "../assets/milestone14Art";
import { getMilestone49PlayableArtTextures, loadMilestone49PlayableArt, milestone49PlayerTextureFor } from "../assets/milestone49PlayableArt";
import { drawHud } from "../ui/hud";
import { BOSSES, COMBAT_CLASSES, FACTIONS, SYSTEM_MESSAGES, resolveBuildKit } from "../content";
import { ARMISTICE_PLAZA_MAP, type LandmarkDefinition, type LevelMapDefinition, type PropClusterDefinition } from "./armisticePlazaMap";
import {
  CONSENSUS_SLOT_LOADOUTS,
  clampConsensusCellSize,
  consensusScaling,
  createConsensusSnapshot,
  formationOffset,
  type ConsensusPlayerRuntime,
  type ConsensusStateSnapshot,
  type PlayerInputCommand
} from "../sim/consensusCell";

interface DepthDrawable {
  depthY: number;
  draw: () => void;
}

interface BrokenPromiseZone {
  id: number;
  worldX: number;
  worldY: number;
  radius: number;
  createdAt: number;
  expiresAt: number;
  label: string;
}

interface TreatyCharge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startedAt: number;
  impactAt: number;
  endsAt: number;
  resolved: boolean;
}

export class LevelRunState implements GameState {
  readonly mode = "LevelRun" as const;
  readonly arena: ArenaData;
  readonly world = new World();
  readonly players: ConsensusPlayerRuntime[] = [];
  readonly player!: Player;
  readonly build: BuildStats;
  readonly chosenUpgrades: string[] = [];
  readonly chosenUpgradeIds: string[] = [];
  readonly director: Director = createDirector();
  readonly weapon: WeaponRuntime;
  readonly map: LevelMapDefinition = ARMISTICE_PLAZA_MAP;
  readonly visitedLandmarkIds = new Set<string>();
  readonly cellSize: number;
  readonly inputCommands: PlayerInputCommand[] = [];
  seconds = 0;
  simulationTick = 0;
  kills = 0;
  bossSpawned = false;
  bossDefeated = false;
  readonly brokenPromiseZones: BrokenPromiseZone[] = [];
  treatyCharge: TreatyCharge | null = null;
  oathPageSpawns = 0;
  brokenPromiseHits = 0;
  treatyChargeImpacts = 0;
  bossIntroSeen = false;
  private started = false;
  private bossMechanicTimer = 0;
  private oathPageTimer = 0;
  private brokenPromiseId = 1;
  private staticArenaDrawn = false;
  private requestedAtlasLoad = false;
  private requestedProductionArtLoad = false;
  private readonly decalsGraphics = new Graphics();
  private readonly entityGraphics = new Graphics();
  private readonly projectileGraphics = new Graphics();
  private readonly productionSpriteLayer = new Container();
  private readonly productionSprites = new Map<string, Sprite>();

  constructor(readonly nodeId: string, arenaId: string, readonly classId: string, readonly factionId: string, cellSize = 1) {
    this.arena = ARENAS[arenaId] ?? ARENAS.armistice_plaza;
    this.cellSize = clampConsensusCellSize(cellSize);
    this.build = baseBuild();
    this.weapon = createWeaponRuntime();
    this.players.push(...this.createConsensusPlayers());
    const primary = this.players[0];
    if (primary) {
      this.player = primary.player;
      this.build = primary.build;
      this.weapon = primary.weapon;
    }
  }

  enter(game: Game): void {
    if (!this.started) {
      this.started = true;
      for (const runtime of this.players) {
        const combatClass = COMBAT_CLASSES[runtime.classId] ?? COMBAT_CLASSES.accord_striker;
        runtime.player.speed = combatClass.baseStats.speed;
        runtime.build.pickupRange = combatClass.baseStats.pickupRange;
        runtime.build.weaponId = runtime.buildKit.startingWeaponId;
        runtime.build.weaponCooldown *= combatClass.baseStats.cooldownScale;
        applyFactionPassive(runtime.build, runtime.factionId);
        runtime.player.maxHp = 140 + combatClass.baseStats.armor * 12 + runtime.build.maxHpBonus;
        runtime.player.hp = runtime.player.maxHp;
      }
    }
    this.render(game);
  }

  exit(): void {
    this.decalsGraphics.parent?.removeChild(this.decalsGraphics);
    this.entityGraphics.parent?.removeChild(this.entityGraphics);
    this.projectileGraphics.parent?.removeChild(this.projectileGraphics);
    this.productionSpriteLayer.parent?.removeChild(this.productionSpriteLayer);
    this.productionSpriteLayer.removeChildren().forEach((child) => child.destroy({ children: true }));
    this.productionSprites.clear();
  }

  private createConsensusPlayers(): ConsensusPlayerRuntime[] {
    const runtimes: ConsensusPlayerRuntime[] = [];
    for (let slot = 0; slot < this.cellSize; slot += 1) {
      const preset = CONSENSUS_SLOT_LOADOUTS[slot] ?? CONSENSUS_SLOT_LOADOUTS[0];
      const offset = formationOffset(slot);
      const player = createPlayer();
      player.worldX = this.map.playerStart.worldX + offset.worldX;
      player.worldY = this.map.playerStart.worldY + offset.worldY;
      runtimes.push({
        id: `p${slot + 1}`,
        slot,
        label: preset.label,
        inputSource: slot === 0 ? "local_keyboard" : "local_simulated_peer",
        classId: slot === 0 ? this.classId : preset.classId,
        factionId: slot === 0 ? this.factionId : preset.factionId,
        buildKit: resolveBuildKit(slot === 0 ? this.classId : preset.classId, slot === 0 ? this.factionId : preset.factionId),
        color: preset.color,
        player,
        build: slot === 0 ? this.build : baseBuild(),
        weapon: slot === 0 ? this.weapon : createWeaponRuntime(),
        inputSequence: 0,
        downed: false
      });
    }
    return runtimes;
  }

  update(game: Game, dt: number): void {
    this.seconds += dt;
    this.simulationTick += 1;
    const commands = this.collectInputCommands(game);
    this.inputCommands.splice(0, this.inputCommands.length, ...commands);
    for (const runtime of this.players) {
      if (runtime.downed) continue;
      const command = commands.find((candidate) => candidate.playerId === runtime.id);
      if (command) updatePlayerFromCommand(runtime.player, command, runtime.build, dt);
      if (runtime.player.invuln <= 0) {
        runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + dt * 1.8);
      }
      clampToBounds(runtime.player, this.map.bounds, runtime.player.radius);
    }
    this.updateVisitedLandmarks();

    const focus = this.threatFocusPlayer();
    updateDirector(this.world, this.director, this.seconds, focus.worldX, focus.worldY, dt, this.map.spawnRegions, this.map.bounds, this.players.length);
    if (!this.bossSpawned && this.seconds >= this.arena.bossSeconds) {
      const boss = spawnMiniboss(this.world, this.map.bossSpawn.worldX, this.map.bossSpawn.worldY);
      const bossMultiplier = this.consensusScaling().bossHpMultiplier;
      boss.maxHp = Math.ceil(boss.maxHp * bossMultiplier);
      boss.hp = boss.maxHp;
      boss.sourceRegionId = "treaty_monument_oath_pages";
      boss.enemyFamilyId = "oath_eater";
      this.bossSpawned = true;
      this.bossIntroSeen = true;
      game.feedback.cue("boss.oath_eater.warning", "boss_warning");
      game.feedback.cue(`music.${this.arena.id}.boss`, "music");
      this.bossMechanicTimer = 0.7;
      this.oathPageTimer = 0.4;
      this.spawnBrokenPromiseZone(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY + 2.8, 3.1);
    }
    this.updateBossMechanics(dt);

    for (const enemy of this.world.entities) {
      if (enemy.active && enemy.kind === "enemy") {
        updateEnemy(enemy, this.nearestStandingPlayer(enemy.worldX, enemy.worldY), dt);
      }
    }

    for (const runtime of this.players) {
      if (runtime.downed) continue;
      updateAutoWeapon(this.world, runtime.weapon, runtime.player, runtime.build, dt, runtime.buildKit.startingWeaponId);
    }
    const hits = resolveProjectileHits(this.world);
    if (hits > 0) game.feedback.cue("combat.weapon_hit", "hit");
    this.kills += hits;
    this.bossDefeated = this.bossSpawned && !this.world.entities.some((entity) => entity.active && entity.kind === "enemy" && entity.boss);

    for (const pickup of this.world.entities) {
      if (pickup.active && pickup.kind === "pickup") {
        const collector = this.nearestRuntime(pickup.worldX, pickup.worldY);
        const collected = updatePickup(pickup, collector.player, collector.build, dt);
        if (collected) {
          game.feedback.cue("pickup.coherence_shard", "pickup");
          this.spawnPickupSparkle(pickup.worldX, pickup.worldY);
          for (const runtime of this.players) {
            if (runtime.id !== collector.id && !runtime.downed) runtime.player.xp += pickup.value;
          }
        }
      }
    }

    for (const runtime of this.players) {
      if (runtime.downed) continue;
      resolveEnemyPlayerHits(this.world, runtime.player);
      if (runtime.player.hp <= 0) runtime.downed = true;
    }
    this.resolveBrokenPromiseDamage(dt);
    this.updateTransientCombatArt(dt);

    if (this.player.xp >= xpNeeded(this.player.level)) {
      this.player.xp -= xpNeeded(this.player.level);
      this.player.level += 1;
      game.feedback.cue("ui.upgrade_draft", "ui");
      game.state.set(new UpgradeDraftState(this));
      return;
    }

    if (this.players.every((runtime) => runtime.downed || runtime.player.hp <= 0)) {
      game.feedback.cue("summary.failed", "summary");
      game.state.set(
        new SummaryState({
          nodeId: this.nodeId,
          title: this.arena.name,
          seconds: this.seconds,
          kills: this.kills,
          level: this.player.level,
          upgrades: this.chosenUpgrades,
          upgradeIds: this.chosenUpgradeIds,
          completed: false
        })
      );
      return;
    }

    if (this.seconds >= this.arena.targetSeconds && (this.bossDefeated || this.kills >= 42 + (this.players.length - 1) * 10)) {
      game.feedback.cue("summary.completed", "summary");
      game.state.set(
        new SummaryState({
          nodeId: this.nodeId,
          title: this.arena.name,
          seconds: this.seconds,
          kills: this.kills,
          level: this.player.level,
          upgrades: this.chosenUpgrades,
          upgradeIds: this.chosenUpgradeIds,
          completed: true
        })
      );
    }
  }

  render(game: Game): void {
    this.ensureStaticArena(game);
    this.clearDynamicLayers(game);
    game.camera.zoom = 1.12;
    game.camera.follow(
      clamp(this.player.worldX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2),
      clamp(this.player.worldY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2),
      0.22
    );
    game.camera.apply(game.layers.root, game.width, game.height);

    this.drawDynamicDecals(game);
    this.drawEntities(game);
    drawHud(game.layers.hud, game.width, this.player, this.seconds, this.kills, this.build, this.objective());
  }

  objective(): string {
    const boss = this.arena.bossId ? BOSSES[this.arena.bossId] : undefined;
    if (!this.bossSpawned) return `AGI pressure in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s`;
    if (!this.bossDefeated) return `stop ${boss?.displayName ?? "the boss"}`;
    return `survive ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
  }

  activeSpawnRegions() {
    return this.map.spawnRegions.filter((region) => this.seconds >= region.startsAtSeconds);
  }

  nearestLandmark(): LandmarkDefinition {
    let nearest = this.map.landmarks[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const landmark of this.map.landmarks) {
      const distance = Math.hypot(this.player.worldX - landmark.worldX, this.player.worldY - landmark.worldY);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = landmark;
      }
    }
    return nearest;
  }

  consensusScaling() {
    return consensusScaling(this.players.length);
  }

  stateSnapshot(): ConsensusStateSnapshot {
    return createConsensusSnapshot({
      tick: this.simulationTick,
      seconds: this.seconds,
      players: this.players,
      entities: this.world.entities,
      scaling: this.consensusScaling()
    });
  }

  private collectInputCommands(game: Game): PlayerInputCommand[] {
    const axis = game.input.axis();
    return this.players.map((runtime) => {
      runtime.inputSequence += 1;
      if (runtime.slot === 0) {
        return {
          schemaVersion: 1,
          tick: this.simulationTick,
          playerId: runtime.id,
          sequence: runtime.inputSequence,
          axisX: axis.x,
          axisY: axis.y,
          dashPressed: game.input.wasPressed("dash"),
          interactPressed: game.input.wasPressed("interact")
        };
      }
      return this.scriptedAllyCommand(runtime);
    });
  }

  private scriptedAllyCommand(runtime: ConsensusPlayerRuntime): PlayerInputCommand {
    const focus = this.player;
    const offset = formationOffset(runtime.slot);
    const targetX = focus.worldX + offset.worldX * 2.2 + Math.sin(this.seconds * 0.7 + runtime.slot) * 0.7;
    const targetY = focus.worldY + offset.worldY * 2.2 + Math.cos(this.seconds * 0.6 + runtime.slot) * 0.7;
    const dx = targetX - runtime.player.worldX;
    const dy = targetY - runtime.player.worldY;
    const len = Math.hypot(dx, dy);
    let axisX = 0;
    let axisY = 0;
    if (len > 0.55) {
      const worldX = dx / len;
      const worldY = dy / len;
      axisX = (worldX - worldY) / Math.SQRT2;
      axisY = (worldX + worldY) / Math.SQRT2;
      const axisLen = Math.hypot(axisX, axisY) || 1;
      axisX /= axisLen;
      axisY /= axisLen;
    }
    return {
      schemaVersion: 1,
      tick: this.simulationTick,
      playerId: runtime.id,
      sequence: runtime.inputSequence,
      axisX,
      axisY,
      dashPressed: runtime.player.dashCooldown <= 0 && len > 3.4 && Math.floor(this.seconds + runtime.slot) % 4 === 0,
      interactPressed: false
    };
  }

  private threatFocusPlayer(): Player {
    return this.players.find((runtime) => !runtime.downed)?.player ?? this.player;
  }

  private nearestStandingPlayer(worldX: number, worldY: number): Player {
    return this.nearestRuntime(worldX, worldY).player;
  }

  private nearestRuntime(worldX: number, worldY: number): ConsensusPlayerRuntime {
    let nearest = this.players[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const runtime of this.players) {
      if (runtime.downed) continue;
      const distance = Math.hypot(runtime.player.worldX - worldX, runtime.player.worldY - worldY);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = runtime;
      }
    }
    return nearest ?? this.players[0];
  }

  private updateVisitedLandmarks(): void {
    for (const landmark of this.map.landmarks) {
      const distance = Math.hypot(this.player.worldX - landmark.worldX, this.player.worldY - landmark.worldY);
      if (distance <= landmark.radius) this.visitedLandmarkIds.add(landmark.id);
    }
  }

  private updateBossMechanics(dt: number): void {
    this.brokenPromiseZones.splice(0, this.brokenPromiseZones.length, ...this.brokenPromiseZones.filter((zone) => zone.expiresAt > this.seconds));
    if (!this.bossSpawned || this.bossDefeated) {
      this.treatyCharge = null;
      return;
    }

    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    if (!boss) return;

    this.oathPageTimer -= dt;
    if (this.oathPageTimer <= 0) {
      this.spawnOathPages();
      this.oathPageTimer = 5.6;
    }

    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer <= 0 && !this.treatyCharge) {
      const target = this.threatFocusPlayer();
      this.spawnBrokenPromiseZone(target.worldX, target.worldY, 2.5);
      this.startTreatyCharge(boss);
      this.bossMechanicTimer = 7.2;
    }

    if (this.treatyCharge && !this.treatyCharge.resolved && this.seconds >= this.treatyCharge.impactAt) {
      this.resolveTreatyCharge(boss, this.treatyCharge);
    }
    if (this.treatyCharge && this.seconds >= this.treatyCharge.endsAt) {
      this.treatyCharge = null;
    }
  }

  private spawnOathPages(): void {
    for (let i = 0; i < 2; i += 1) {
      const angle = this.seconds * 1.6 + i * Math.PI;
      const distance = 2.4 + i * 0.8;
      spawnEnemy(
        this.world,
        this.map.bossSpawn.worldX + Math.cos(angle) * distance,
        this.map.bossSpawn.worldY + Math.sin(angle) * distance,
        this.seconds,
        "bad_outputs",
        "treaty_monument_oath_pages"
      );
      this.oathPageSpawns += 1;
    }
  }

  private spawnBrokenPromiseZone(worldX: number, worldY: number, radius: number): void {
    const zone: BrokenPromiseZone = {
      id: this.brokenPromiseId,
      worldX: clamp(worldX, this.map.bounds.minX + 1.5, this.map.bounds.maxX - 1.5),
      worldY: clamp(worldY, this.map.bounds.minY + 1.5, this.map.bounds.maxY - 1.5),
      radius,
      createdAt: this.seconds,
      expiresAt: this.seconds + 8.5,
      label: "Broken Promise"
    };
    this.brokenPromiseId += 1;
    this.brokenPromiseZones.push(zone);
  }

  private startTreatyCharge(boss: Entity): void {
    const target = this.threatFocusPlayer();
    this.treatyCharge = {
      fromX: boss.worldX,
      fromY: boss.worldY,
      toX: target.worldX,
      toY: target.worldY,
      startedAt: this.seconds,
      impactAt: this.seconds + 1.05,
      endsAt: this.seconds + 1.75,
      resolved: false
    };
  }

  private resolveTreatyCharge(boss: Entity, charge: TreatyCharge): void {
    charge.resolved = true;
    const dx = charge.toX - charge.fromX;
    const dy = charge.toY - charge.fromY;
    const len = Math.hypot(dx, dy) || 1;
    boss.worldX = clamp(charge.toX - (dx / len) * 1.4, this.map.bounds.minX + 1, this.map.bounds.maxX - 1);
    boss.worldY = clamp(charge.toY - (dy / len) * 1.4, this.map.bounds.minY + 1, this.map.bounds.maxY - 1);
    this.treatyChargeImpacts += 1;
    this.spawnBrokenPromiseZone(charge.toX, charge.toY, 2.8);

    for (const runtime of this.players) {
      if (runtime.downed) continue;
      const distanceToLane = distanceToSegment(runtime.player.worldX, runtime.player.worldY, charge.fromX, charge.fromY, charge.toX, charge.toY);
      const distanceToImpact = Math.hypot(runtime.player.worldX - charge.toX, runtime.player.worldY - charge.toY);
      if (runtime.player.invuln <= 0 && (distanceToLane < 1.05 || distanceToImpact < 2.1)) {
        runtime.player.hp -= 11;
        runtime.player.invuln = 0.55;
        if (runtime.player.hp <= 0) runtime.downed = true;
      }
    }
  }

  private resolveBrokenPromiseDamage(dt: number): void {
    for (const runtime of this.players) {
      if (runtime.downed || runtime.player.invuln > 0) continue;
      for (const zone of this.brokenPromiseZones) {
        const distance = Math.hypot(runtime.player.worldX - zone.worldX, runtime.player.worldY - zone.worldY);
        if (distance > zone.radius) continue;
        runtime.player.hp -= 4.5 * dt;
        this.brokenPromiseHits += 1;
        if (runtime.player.hp <= 0) runtime.downed = true;
        break;
      }
    }
  }

  private clearDynamicLayers(game: Game): void {
    this.decalsGraphics.clear();
    this.entityGraphics.clear();
    this.projectileGraphics.clear();
    if (!this.decalsGraphics.parent) game.layers.decals.addChild(this.decalsGraphics);
    if (!this.entityGraphics.parent) game.layers.entities.addChild(this.entityGraphics);
    if (!this.projectileGraphics.parent) game.layers.projectiles.addChild(this.projectileGraphics);
    this.prepareProductionSprites(game);
    clearLayer(game.layers.floatingText);
    clearLayer(game.layers.hud);
  }

  private ensureStaticArena(game: Game): void {
    if (
      this.staticArenaDrawn &&
      game.layers.background.children.length > 0 &&
      game.layers.ground.children.length > 0 &&
      game.layers.propsBehind.children.length > 0
    ) {
      return;
    }
    clearLayer(game.layers.background);
    clearLayer(game.layers.ground);
    clearLayer(game.layers.propsBehind);
    clearLayer(game.layers.propsFront);
    this.drawStaticArena(game);
    this.staticArenaDrawn = true;
  }

  private drawStaticArena(game: Game): void {
    const bg = new Graphics();
    bg.rect(-4200, -3600, 8400, 7200).fill(0x141922);
    game.layers.background.addChild(bg);

    if (!this.drawTextureGroundIfEnabled(game)) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          const color = this.tileColor(x, y);
          drawIsoDiamond(ground, x, y, color, 0x202833);
        }
      }
      game.layers.ground.addChild(ground);
    }

    const groundDetails = new Graphics();
    this.drawArmisticeVisualSliceGround(groundDetails);
    game.layers.ground.addChild(groundDetails);

    const productionArt = this.productionArt(game);
    const props = new Graphics();
    this.drawArmisticeSceneMass(props);
    for (const cluster of this.map.propClusters) {
      this.drawPropCluster(game, props, cluster, productionArt);
    }
    game.layers.propsBehind.addChild(props);
    for (const landmark of this.map.landmarks) {
      this.drawLandmark(game, props, landmark, productionArt);
    }

    for (const landmark of this.map.landmarks) {
      this.drawLandmarkLabel(game, landmark);
    }
  }

  private drawDynamicDecals(game: Game): void {
    this.drawSpawnRegions(this.decalsGraphics);
    this.drawBossDecals(this.decalsGraphics);
  }

  private tileColor(x: number, y: number): number {
    const edge = x <= this.map.bounds.minX + 1 || x >= this.map.bounds.maxX - 1 || y <= this.map.bounds.minY + 1 || y >= this.map.bounds.maxY - 1;
    if (edge) return 0x252a33;
    const band = this.map.terrainBands.find((candidate) => x >= candidate.minX && x <= candidate.maxX && y >= candidate.minY && y <= candidate.maxY);
    if (band) return (x + y) % 2 === 0 ? band.colorA : band.colorB;
    return (x * 3 + y * 5) % 4 === 0 ? 0x3b4b55 : 0x455764;
  }

  private drawTextureGroundIfEnabled(game: Game): boolean {
    if (!game.useArmisticeTileAtlas) return false;
    const textures = getArmisticeGroundAtlasTextures();
    if (!textures) {
      if (!this.requestedAtlasLoad) {
        this.requestedAtlasLoad = true;
        void loadArmisticeGroundAtlas().then(() => {
          if (game.state.current !== this) return;
          this.staticArenaDrawn = false;
          this.render(game);
        });
      }
      return false;
    }

    const ground = new Container();
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
        addArmisticeTileSprite(ground, textures, x, y, armisticeTileKeyForTerrain(x, y, this.terrainBandIdAt(x, y)));
      }
    }
    game.layers.ground.addChild(ground);
    return true;
  }

  private productionArt(game: Game): Milestone11ArtTextures | null {
    if (!game.useMilestone10Art) return null;
    const textures = getMilestone11ArtTextures();
    if (!textures && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void Promise.all([loadMilestone11Art(), loadMilestone12Art(), loadMilestone14Art(), loadMilestone49PlayableArt()]).then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private prepareProductionSprites(game: Game): void {
    const art = this.productionArt(game);
    if (!game.useMilestone10Art || !art) {
      this.productionSpriteLayer.visible = false;
      return;
    }

    this.productionSpriteLayer.visible = true;
    this.productionSpriteLayer.sortableChildren = true;
    if (!this.productionSpriteLayer.parent) game.layers.entities.addChild(this.productionSpriteLayer);
    for (const child of this.productionSpriteLayer.children) child.visible = false;
  }

  private terrainBandIdAt(x: number, y: number): string | undefined {
    return this.map.terrainBands.find((candidate) => x >= candidate.minX && x <= candidate.maxX && y >= candidate.minY && y <= candidate.maxY)?.id;
  }

  private drawArmisticeVisualSliceGround(graphics: Graphics): void {
    this.drawIsoWorldRect(graphics, -5.2, -30, 5.2, 30, 0x6f7478, 0.34, 0x151c24, 0.28);
    this.drawIsoWorldRect(graphics, -30, -5.2, 30, 5.2, 0x74797c, 0.3, 0x151c24, 0.26);
    this.drawIsoWorldRect(graphics, -2.8, -30, 2.8, 30, 0x9a8f75, 0.18, 0xffd166, 0.2);
    this.drawIsoWorldRect(graphics, -30, -2.8, 30, 2.8, 0x9a8f75, 0.16, 0xffd166, 0.18);
    this.drawIsoWorldRect(graphics, -8, -8, 8, 8, 0xb5ad95, 0.18, 0xfff4d6, 0.18);
    this.drawIsoWorldRect(graphics, -27, -22, -9, -5, 0x1e3b4a, 0.36, 0x45aaf2, 0.28);
    this.drawIsoWorldRect(graphics, 9, -19, 29, -2, 0x3d302d, 0.32, 0xff5d57, 0.22);
    this.drawIsoWorldRect(graphics, 11, 9, 26, 24, 0x154f52, 0.34, 0x64e0b4, 0.28);
    this.drawIsoWorldRect(graphics, -29, 10, -11, 28, 0x25142e, 0.44, 0x7b61ff, 0.34);

    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
        const hash = this.visualHash(x, y);
        const band = this.terrainBandIdAt(x, y);
        if (hash % 19 === 0) this.drawTileChip(graphics, x, y, 0x101821, 0.32, 0.18 + (hash % 4) * 0.05);
        if ((band === "main_plaza_cross_x" || band === "main_plaza_cross_y") && hash % 11 === 0) {
          this.drawPavingCrack(graphics, x, y, hash, 0x252a33, 0.46);
        }
        if (band === "drone_yard_floor" && hash % 5 === 0) {
          this.drawScorchMark(graphics, x, y, hash, 0x07151d, 0.42);
        }
        if (band === "barricade_corridor_floor" && hash % 4 === 0) {
          this.drawTileChip(graphics, x, y, 0xff5d57, 0.18, 0.24);
        }
        if (band === "terminal_pad" && hash % 6 === 0) {
          this.drawTerminalTrace(graphics, x, y, hash);
        }
        if (band === "breach_corruption" && hash % 3 === 0) {
          this.drawBreachVein(graphics, x, y, hash);
        }
      }
    }

    this.drawIsoPolyline(graphics, [
      [-26, 20],
      [-18, 15],
      [-10, 9],
      [-3, 5],
      [3, 1],
      [10, -3],
      [18, -9],
      [25, -13]
    ], 0x111823, 9, 0.38);
    this.drawIsoPolyline(graphics, [
      [-24, 20],
      [-16, 14],
      [-7, 8],
      [0, 3],
      [8, -1],
      [17, -7],
      [24, -11]
    ], 0x64e0b4, 3, 0.44);
    this.drawIsoPolyline(graphics, [
      [-20, -14],
      [-12, -10],
      [-4, -5],
      [3, -1],
      [12, 5],
      [20, 13]
    ], 0x101821, 7, 0.34);
    this.drawIsoPolyline(graphics, [
      [-21, -13],
      [-12, -9],
      [-4, -4],
      [5, 1],
      [14, 7],
      [21, 14]
    ], 0x45aaf2, 2, 0.3);
  }

  private drawArmisticeSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 9, p.screenY + 10, landmark.radius * 32, landmark.radius * 11)
        .fill({ color: 0x05080d, alpha: landmark.kind === "breach" ? 0.34 : 0.24 });
    }

    for (const cluster of this.map.propClusters) {
      const p = worldToIso(cluster.worldX, cluster.worldY);
      const width = Math.max(30, cluster.cols * cluster.spacingX * 18);
      const height = Math.max(12, cluster.rows * cluster.spacingY * 7);
      graphics.ellipse(p.screenX + 8, p.screenY + 10, width, height).fill({ color: 0x05080d, alpha: 0.24 });
    }

    this.drawIsoPolyline(graphics, [
      [-29, -18],
      [-22, -14],
      [-17, -13],
      [-10, -9],
      [-3, -4],
      [0, 0]
    ], 0x071015, 5, 0.42);
    this.drawIsoPolyline(graphics, [
      [0, 0],
      [8, -3],
      [16, -8],
      [27, -12]
    ], 0x071015, 5, 0.42);
    this.drawIsoPolyline(graphics, [
      [0, 0],
      [7, 7],
      [15, 14],
      [24, 20]
    ], 0x071015, 4, 0.38);

    for (let i = 0; i < 34; i += 1) {
      const x = -28 + (this.visualHash(i, 13) % 57);
      const y = -23 + (this.visualHash(i, 29) % 48);
      if (Math.hypot(x, y) < 8) continue;
      const p = worldToIso(x + (i % 3) * 0.17, y - (i % 4) * 0.13);
      const color = i % 5 === 0 ? 0xffd166 : i % 3 === 0 ? 0x64e0b4 : 0x596270;
      graphics
        .rect(p.screenX - 8, p.screenY - 13, 16 + (i % 4) * 5, 6 + (i % 3) * 3)
        .fill({ color, alpha: 0.42 })
        .stroke({ color: 0x05080d, width: 2, alpha: 0.72 });
    }
  }

  private drawIsoWorldRect(graphics: Graphics, minX: number, minY: number, maxX: number, maxY: number, color: number, alpha: number, outline: number, outlineAlpha: number): void {
    const a = worldToIso(minX, minY);
    const b = worldToIso(maxX, minY);
    const c = worldToIso(maxX, maxY);
    const d = worldToIso(minX, maxY);
    graphics
      .poly([a.screenX, a.screenY, b.screenX, b.screenY, c.screenX, c.screenY, d.screenX, d.screenY])
      .fill({ color, alpha })
      .stroke({ color: outline, width: 2, alpha: outlineAlpha });
  }

  private drawIsoPolyline(graphics: Graphics, points: Array<[number, number]>, color: number, width: number, alpha: number): void {
    if (points.length < 2) return;
    const first = worldToIso(points[0][0], points[0][1]);
    graphics.moveTo(first.screenX, first.screenY);
    for (const [x, y] of points.slice(1)) {
      const p = worldToIso(x, y);
      graphics.lineTo(p.screenX, p.screenY);
    }
    graphics.stroke({ color, width, alpha, cap: "round", join: "round" });
  }

  private drawTileChip(graphics: Graphics, x: number, y: number, color: number, alpha: number, scale: number): void {
    const p = worldToIso(x, y);
    const hw = TILE_WIDTH * scale;
    const hh = TILE_HEIGHT * scale * 0.55;
    graphics
      .poly([p.screenX, p.screenY - hh, p.screenX + hw, p.screenY, p.screenX, p.screenY + hh, p.screenX - hw, p.screenY])
      .fill({ color, alpha });
  }

  private drawPavingCrack(graphics: Graphics, x: number, y: number, hash: number, color: number, alpha: number): void {
    const p = worldToIso(x + ((hash % 5) - 2) * 0.08, y + (((hash >> 3) % 5) - 2) * 0.08);
    const dx = hash % 2 === 0 ? 18 : -18;
    const dy = hash % 3 === 0 ? 6 : -6;
    graphics
      .moveTo(p.screenX - dx * 0.5, p.screenY - dy * 0.5)
      .lineTo(p.screenX, p.screenY + dy)
      .lineTo(p.screenX + dx * 0.65, p.screenY - dy * 0.25)
      .stroke({ color, width: 2, alpha });
  }

  private drawScorchMark(graphics: Graphics, x: number, y: number, hash: number, color: number, alpha: number): void {
    const p = worldToIso(x, y);
    graphics.ellipse(p.screenX + (hash % 9) - 4, p.screenY + ((hash >> 4) % 7) - 3, 22 + (hash % 4) * 5, 7 + (hash % 3) * 3).fill({ color, alpha });
  }

  private drawTerminalTrace(graphics: Graphics, x: number, y: number, hash: number): void {
    const p = worldToIso(x, y);
    const horizontal = hash % 2 === 0;
    graphics
      .moveTo(p.screenX - (horizontal ? 18 : 4), p.screenY - (horizontal ? 2 : 10))
      .lineTo(p.screenX + (horizontal ? 18 : 4), p.screenY + (horizontal ? 2 : 10))
      .stroke({ color: 0x64e0b4, width: 2, alpha: 0.42 });
    graphics.circle(p.screenX, p.screenY, 3).fill({ color: 0xffd166, alpha: 0.55 });
  }

  private drawBreachVein(graphics: Graphics, x: number, y: number, hash: number): void {
    const p = worldToIso(x, y);
    const bend = ((hash % 7) - 3) * 4;
    graphics
      .moveTo(p.screenX - 20, p.screenY + 2)
      .lineTo(p.screenX - 4, p.screenY - 5 + bend * 0.15)
      .lineTo(p.screenX + 17, p.screenY + 4)
      .stroke({ color: hash % 2 === 0 ? 0x7b61ff : 0xff5d57, width: hash % 5 === 0 ? 4 : 2, alpha: 0.58 });
  }

  private visualHash(x: number, y: number): number {
    const xi = Math.trunc(x);
    const yi = Math.trunc(y);
    return Math.abs(Math.imul(xi + 101, 1103515245) ^ Math.imul(yi - 73, 12345));
  }

  private drawSpawnRegions(graphics: Graphics): void {
    for (const region of this.activeSpawnRegions()) {
      const p = worldToIso(region.worldX, region.worldY);
      graphics
        .ellipse(p.screenX, p.screenY, region.radius * 28, region.radius * 12)
        .fill({ color: 0x7b61ff, alpha: 0.08 })
        .stroke({ color: 0x7b61ff, width: 2, alpha: 0.32 });
    }
  }

  private drawBossDecals(graphics: Graphics): void {
    for (const zone of this.brokenPromiseZones) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const pulse = 0.72 + Math.sin((this.seconds - zone.createdAt) * 5) * 0.16;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radius * 31, zone.radius * 14)
        .fill({ color: 0xff5d57, alpha: 0.18 })
        .stroke({ color: 0xffd166, width: 3, alpha: pulse });
      graphics
        .moveTo(p.screenX - zone.radius * 22, p.screenY)
        .lineTo(p.screenX + zone.radius * 22, p.screenY)
        .stroke({ color: 0x17171d, width: 3, alpha: 0.7 });
    }

    if (this.treatyCharge) {
      const a = worldToIso(this.treatyCharge.fromX, this.treatyCharge.fromY);
      const b = worldToIso(this.treatyCharge.toX, this.treatyCharge.toY);
      const armed = this.seconds >= this.treatyCharge.impactAt;
      graphics.moveTo(a.screenX, a.screenY - 10).lineTo(b.screenX, b.screenY - 10).stroke({ color: palette.ink, width: 14, alpha: 0.7 });
      graphics.moveTo(a.screenX, a.screenY - 10).lineTo(b.screenX, b.screenY - 10).stroke({ color: armed ? palette.tomato : palette.lemon, width: armed ? 8 : 6, alpha: 0.82 });
    }
  }

  private drawPropCluster(game: Game, graphics: Graphics, cluster: PropClusterDefinition, art: Milestone11ArtTextures | null): void {
    const startX = cluster.worldX - ((cluster.cols - 1) * cluster.spacingX) / 2;
    const startY = cluster.worldY - ((cluster.rows - 1) * cluster.spacingY) / 2;
    for (let row = 0; row < cluster.rows; row += 1) {
      for (let col = 0; col < cluster.cols; col += 1) {
        const wobble = ((row * 13 + col * 7) % 5) * 0.08;
        const x = startX + col * cluster.spacingX + wobble;
        const y = startY + row * cluster.spacingY - wobble;
        if (!this.drawProductionProp(game, cluster, x, y, row + col, art)) {
          this.drawProp(graphics, cluster, x, y, row + col);
        }
      }
    }
  }

  private drawProductionProp(game: Game, cluster: PropClusterDefinition, x: number, y: number, index: number, art: Milestone11ArtTextures | null): boolean {
    if (!art) return false;
    const propId = productionPropIdForCluster(cluster);
    if (!propId) return false;
    const p = worldToIso(x, y);
    const sprite = new Sprite(art.props[propId]);
    sprite.anchor.set(0.5, 0.86);
    sprite.scale.set(propScaleForCluster(cluster, index));
    sprite.position.set(p.screenX, p.screenY + propYOffsetForCluster(cluster));
    sprite.zIndex = x + y;
    game.layers.propsBehind.addChild(sprite);
    return true;
  }

  private drawProp(graphics: Graphics, cluster: PropClusterDefinition, x: number, y: number, index: number): void {
    const p = worldToIso(x, y);
    if (cluster.kind === "flag") {
      graphics.rect(p.screenX - 3, p.screenY - 56, 6, 46).fill(0x202833);
      graphics.rect(p.screenX + 2, p.screenY - 54, 24, 14).fill({ color: cluster.accent, alpha: 0.72 }).stroke({ color: palette.ink, width: 2 });
      return;
    }
    if (cluster.kind === "drone_wreck") {
      graphics.rect(p.screenX - 22, p.screenY - 32, 44, 18).fill(cluster.color).stroke({ color: palette.ink, width: 3 });
      graphics.rect(p.screenX - 30, p.screenY - 25, 14, 8).fill(cluster.accent);
      graphics.rect(p.screenX + 16, p.screenY - 25, 14, 8).fill(cluster.accent);
      return;
    }
    if (cluster.kind === "terminal_array") {
      graphics.rect(p.screenX - 14, p.screenY - 38, 28, 28).fill(cluster.color).stroke({ color: palette.ink, width: 3 });
      graphics.rect(p.screenX - 9, p.screenY - 49, 18, 10).fill(cluster.accent).stroke({ color: palette.ink, width: 2 });
      return;
    }
    if (cluster.kind === "breach_shard") {
      graphics
        .poly([p.screenX, p.screenY - 54, p.screenX + 12, p.screenY - 22, p.screenX + 2, p.screenY - 8, p.screenX - 10, p.screenY - 24])
        .fill({ color: index % 2 ? cluster.accent : cluster.color, alpha: 0.9 })
        .stroke({ color: palette.ink, width: 2 });
      return;
    }
    const width = cluster.kind === "barricade" ? 42 : 30;
    const height = cluster.kind === "barricade" ? 16 : 18;
    graphics.rect(p.screenX - width / 2, p.screenY - 24, width, height).fill(cluster.color).stroke({ color: palette.ink, width: 3 });
    graphics.rect(p.screenX - width / 2 + 5, p.screenY - 30, width - 10, 5).fill(cluster.accent);
  }

  private drawLandmark(game: Game, graphics: Graphics, landmark: LandmarkDefinition, art: Milestone11ArtTextures | null): void {
    const p = worldToIso(landmark.worldX, landmark.worldY);
    graphics.ellipse(p.screenX, p.screenY + 2, landmark.radius * 28, landmark.radius * 11).fill({ color: landmark.color, alpha: 0.18 });
    if (landmark.id === "treaty_monument") {
      if (art) {
        const sprite = new Sprite(art.base.treatyMonument);
        sprite.anchor.set(0.5, 0.88);
        sprite.scale.set(1.08);
        sprite.position.set(p.screenX, p.screenY + 6);
        game.layers.propsBehind.addChild(sprite);
        return;
      }
    }
    const propId = productionPropIdForLandmark(landmark);
    if (art && propId) {
      const sprite = new Sprite(art.props[propId]);
      sprite.anchor.set(0.5, 0.86);
      sprite.scale.set(landmarkPropScale(propId));
      sprite.position.set(p.screenX, p.screenY + landmarkPropYOffset(propId));
      game.layers.propsBehind.addChild(sprite);
      return;
    }
    if (landmark.kind === "monument") {
      graphics.rect(p.screenX - 34, p.screenY - 78, 68, 58).fill(landmark.color).stroke({ color: palette.ink, width: 4 });
      graphics.rect(p.screenX - 18, p.screenY - 114, 36, 36).fill(0x3a3f4b).stroke({ color: palette.ink, width: 4 });
      graphics.rect(p.screenX - 46, p.screenY - 20, 92, 18).fill(landmark.accent).stroke({ color: palette.ink, width: 3 });
    } else if (landmark.kind === "breach") {
      graphics
        .moveTo(p.screenX - 98, p.screenY - 10)
        .lineTo(p.screenX - 42, p.screenY + 14)
        .lineTo(p.screenX - 8, p.screenY - 12)
        .lineTo(p.screenX + 36, p.screenY + 20)
        .lineTo(p.screenX + 84, p.screenY - 2)
        .stroke({ color: landmark.accent, width: 7, alpha: 0.9 });
    } else if (landmark.kind === "terminal") {
      graphics.rect(p.screenX - 28, p.screenY - 72, 56, 56).fill(landmark.color).stroke({ color: palette.ink, width: 4 });
      graphics.rect(p.screenX - 18, p.screenY - 92, 36, 18).fill(landmark.accent).stroke({ color: palette.ink, width: 3 });
    } else {
      graphics.rect(p.screenX - 42, p.screenY - 44, 84, 24).fill(landmark.color).stroke({ color: palette.ink, width: 4 });
      graphics.rect(p.screenX - 24, p.screenY - 62, 48, 18).fill(landmark.accent).stroke({ color: palette.ink, width: 3 });
    }
  }

  private drawLandmarkLabel(game: Game, landmark: LandmarkDefinition): void {
    const p = worldToIso(landmark.worldX, landmark.worldY);
    const label = new Text({
      text: landmark.label.toUpperCase(),
      style: { ...fontStyle, fontSize: 12, fill: "#fff4d6", align: "center" }
    });
    label.anchor.set(0.5);
    label.position.set(p.screenX, p.screenY - 130);
    game.layers.propsFront.addChild(label);
  }

  private drawEntities(game: Game): void {
    const productionArt = game.useMilestone10Art ? getMilestone11ArtTextures() : null;
    const drawables: DepthDrawable[] = [];
    for (const runtime of this.players) {
      drawables.push({
        depthY: runtime.player.worldX + runtime.player.worldY,
        draw: () => {
          if (productionArt && !runtime.downed) {
            this.drawProductionPlayer(runtime, productionArt);
          } else {
            drawPixelPersonOnGraphics(this.entityGraphics, runtime.player.worldX, runtime.player.worldY, runtime.downed ? 0x596270 : runtime.color, palette.paper);
          }
          this.drawPlayerLabel(game, runtime);
        }
      });
    }

    for (const entity of this.world.entities) {
      if (!entity.active) continue;
      if (entity.kind === "enemy") {
        drawables.push({
          depthY: entity.worldX + entity.worldY,
          draw: () => {
            const enemyTexture = productionArt ? milestone11EnemyTextureFor(entity, productionArt) : null;
            if (productionArt && entity.boss) {
              this.drawProductionWorldSprite(`boss:${entity.id}`, productionArt.base.oathEater, entity.worldX, entity.worldY, 1.18, 0.88);
            } else if (productionArt && enemyTexture) {
              const scale = entity.enemyFamilyId === "context_rot_crabs" ? 1.18 : entity.enemyFamilyId === "benchmark_gremlins" ? 1.2 : 1.24;
              this.drawProductionWorldSprite(`enemy:${entity.id}`, enemyTexture, entity.worldX, entity.worldY, scale, 0.86);
            } else {
              drawEnemyOnGraphics(this.entityGraphics, entity.worldX, entity.worldY, entity.radius * 24, entity.color, entity.boss);
            }
          }
        });
      }
      if (entity.kind === "pickup") {
        drawables.push({
          depthY: entity.worldX + entity.worldY,
          draw: () => {
            if (productionArt) {
              this.drawProductionWorldSprite(`pickup:${entity.id}`, productionArt.base.coherenceShard, entity.worldX, entity.worldY, 1.12, 0.72);
            } else {
              this.drawPickup(this.entityGraphics, entity);
            }
          }
        });
      }
    }
    drawables.sort(byIsoDepth);
    for (const drawable of drawables) drawable.draw();

    for (const entity of this.world.entities) {
      if (!entity.active || entity.kind !== "projectile") continue;
      const p = worldToIso(entity.worldX, entity.worldY);
      const combatArt = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
      if (combatArt) {
        this.drawProductionEffectSprite(`projectile-trail:${entity.id}`, combatArt.combatEffects.projectileTrail, entity.worldX - entity.vx * 0.025, entity.worldY - entity.vy * 0.025, 0.82, 0.72, entity.worldX + entity.worldY - 0.01);
        this.drawProductionEffectSprite(`projectile:${entity.id}`, combatArt.combatEffects.projectile, entity.worldX, entity.worldY, 0.82, 0.72, entity.worldX + entity.worldY);
      } else {
        this.projectileGraphics.rect(p.screenX - 5, p.screenY - 22, 10, 8).fill(entity.color).stroke({ color: palette.ink, width: 2 });
      }
    }

    for (const entity of this.world.entities) {
      if (!entity.active) continue;
      if (entity.kind === "particle") {
        this.drawTransientParticle(game, entity);
      } else if (entity.kind === "damageText") {
        this.drawCombatDamageText(game, entity);
      }
    }

    if (this.bossSpawned && !this.bossDefeated) {
      const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
      if (boss) {
        const p = worldToIso(boss.worldX, boss.worldY);
        const label = new Text({
          text: `${boss.label} ${Math.ceil(boss.hp)}/${boss.maxHp}`,
          style: { ...fontStyle, fontSize: 14, fill: "#ffd166" }
        });
        label.anchor.set(0.5);
        label.position.set(p.screenX, p.screenY - 76);
        game.layers.floatingText.addChild(label);
      }
    }

    this.drawBossTitleCard(game);
    this.drawBossDialogue(game);
    this.drawAgiPressureStrip(game);
    this.drawBuildLabel(game);
    this.drawConsensusCellStrip(game);
    this.drawProductionCombatHud(game);
  }

  private drawPlayerLabel(game: Game, runtime: ConsensusPlayerRuntime): void {
    const p = worldToIso(runtime.player.worldX, runtime.player.worldY);
    const label = new Text({
      text: runtime.label,
      style: { ...fontStyle, fontSize: 11, fill: runtime.downed ? "#aab0bd" : "#fff4d6" }
    });
    label.anchor.set(0.5);
    label.position.set(p.screenX, p.screenY - 58);
    game.layers.floatingText.addChild(label);
  }

  private drawBossTitleCard(game: Game): void {
    if (!this.bossSpawned || this.bossDefeated || this.seconds - this.arena.bossSeconds > 4.6) return;
    const boss = this.arena.bossId ? BOSSES[this.arena.bossId] : undefined;
    const g = new Graphics();
    g.rect(game.width / 2 - 430, game.height / 2 - 120, 860, 240)
      .fill({ color: palette.ink, alpha: 0.9 })
      .stroke({ color: palette.tomato, width: 4 });
    g.rect(game.width / 2 - 398, game.height / 2 - 86, 174, 158)
      .fill({ color: 0x29151f, alpha: 0.96 })
      .stroke({ color: palette.paper, width: 2 });
    const art = this.productionArt(game);
    if (!art) {
      g.circle(game.width / 2 - 310, game.height / 2 - 22, 42).fill(0x111018).stroke({ color: palette.tomato, width: 4 });
      g.rect(game.width / 2 - 348, game.height / 2 + 22, 76, 16).fill(palette.lemon).stroke({ color: palette.ink, width: 3 });
      g.rect(game.width / 2 - 330, game.height / 2 - 12, 40, 10).fill(palette.paper);
      g.rect(game.width / 2 - 325, game.height / 2 - 56, 30, 16).fill(0x7b61ff).stroke({ color: palette.ink, width: 2 });
    }
    game.layers.hud.addChild(g);
    if (art) {
      const portrait = new Sprite(art.base.oathEaterPortrait);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.92);
      portrait.position.set(game.width / 2 - 311, game.height / 2 - 7);
      game.layers.hud.addChild(portrait);
    }

    const title = new Text({
      text: `${SYSTEM_MESSAGES.bossWarning}\n${boss?.titleCard ?? "BOSS SIGNATURE"}`,
      style: { ...fontStyle, fontSize: 29, fill: "#ff5d57", align: "center" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2 + 100, game.height / 2 - 48);
    game.layers.hud.addChild(title);

    const body = new Text({
      text: `${boss?.subtitle ?? SYSTEM_MESSAGES.bossWarningSubtitle}\nBROKEN PROMISE ZONES ONLINE`,
      style: { ...fontStyle, fontSize: 17, fill: "#fff4d6", align: "center", wordWrap: true, wordWrapWidth: 530 }
    });
    body.anchor.set(0.5);
    body.position.set(game.width / 2 + 100, game.height / 2 + 50);
    game.layers.hud.addChild(body);
  }

  private drawBossDialogue(game: Game): void {
    if (!this.bossSpawned || this.bossDefeated || this.seconds - this.arena.bossSeconds > 8.2) return;
    const g = new Graphics();
    const y = game.height - 154;
    g.rect(38, y, game.width - 76, 118)
      .fill({ color: palette.ink, alpha: 0.88 })
      .stroke({ color: palette.mint, width: 3 });
    g.rect(60, y + 18, 78, 78).fill(0x203447).stroke({ color: palette.blue, width: 3 });
    g.rect(game.width - 138, y + 18, 78, 78).fill(0x29151f).stroke({ color: palette.tomato, width: 3 });
    g.rect(82, y + 42, 34, 28).fill(palette.paper).stroke({ color: palette.ink, width: 2 });
    g.circle(game.width - 99, y + 50, 24).fill(0x111018).stroke({ color: palette.lemon, width: 3 });
    g.rect(game.width - 118, y + 76, 38, 8).fill(palette.tomato);
    game.layers.hud.addChild(g);

    const line = new Text({
      text: `PILOT: "Is the treaty supposed to have teeth?"\nCO-MIND: "No. Also yes. It is currently failing consensus."`,
      style: { ...fontStyle, fontSize: 16, fill: "#fff4d6", wordWrap: true, wordWrapWidth: game.width - 310 }
    });
    line.position.set(162, y + 28);
    game.layers.hud.addChild(line);
  }

  private drawAgiPressureStrip(game: Game): void {
    const pressure = this.bossSpawned ? (this.bossDefeated ? 0.25 : 1) : clamp(this.seconds / this.arena.bossSeconds, 0, 1);
    const g = new Graphics();
    g.rect(game.width - 294, 100, 278, 30).fill({ color: palette.ink, alpha: 0.82 }).stroke({ color: palette.paper, width: 2 });
    g.rect(game.width - 282, 111, 254 * pressure, 8).fill(this.bossSpawned && !this.bossDefeated ? palette.tomato : palette.lemon);
    game.layers.hud.addChild(g);
    const label = new Text({
      text: this.bossSpawned && !this.bossDefeated ? "AGI PRESSURE: CANONICAL" : "AGI PRESSURE",
      style: { ...fontStyle, fontSize: 11, fill: "#fff4d6" }
    });
    label.position.set(game.width - 282, 98);
    game.layers.hud.addChild(label);
  }

  private drawBuildLabel(game: Game): void {
    const combatClass = COMBAT_CLASSES[this.classId];
    const faction = FACTIONS[this.factionId];
    const art = this.productionArt(game);
    if (art && this.factionId === "openai_accord") {
      const mark = new Sprite(art.openaiAccordMark);
      mark.anchor.set(0.5);
      mark.scale.set(0.42);
      mark.position.set(38, 108);
      game.layers.hud.addChild(mark);
    }
    const label = new Text({
      text: `${combatClass.displayName} + ${faction.shortName} Co-Mind`,
      style: { ...fontStyle, fontSize: 13, fill: "#64e0b4" }
    });
    label.position.set(art && this.factionId === "openai_accord" ? 60 : 24, 102);
    game.layers.hud.addChild(label);
  }

  private drawConsensusCellStrip(game: Game): void {
    const g = new Graphics();
    const y = 126;
    g.rect(24, y, 292, 30).fill({ color: palette.ink, alpha: 0.76 }).stroke({ color: palette.mint, width: 2, alpha: 0.8 });
    this.players.forEach((runtime, index) => {
      const x = 38 + index * 64;
      g.rect(x, y + 8, 16, 14).fill(runtime.downed ? 0x596270 : runtime.color).stroke({ color: palette.ink, width: 2 });
    });
    game.layers.hud.addChild(g);

    const text = new Text({
      text: `CONSENSUS CELL ${this.players.length}/4  SNAPSHOT T${this.simulationTick}`,
      style: { ...fontStyle, fontSize: 11, fill: "#fff4d6" }
    });
    text.position.set(62, y + 8);
    game.layers.hud.addChild(text);
  }

  private drawProductionPlayer(runtime: ConsensusPlayerRuntime, art: Milestone11ArtTextures): void {
    const p = worldToIso(runtime.player.worldX, runtime.player.worldY);
    const combatArt = getMilestone14ArtTextures();
    if (combatArt && runtime.build.refusalAura > 0) {
      this.drawProductionEffectSprite(`aura:${runtime.id}`, combatArt.combatEffects.refusalAura, runtime.player.worldX, runtime.player.worldY, 1.7 + runtime.build.refusalAura * 0.22, 0.58, runtime.player.worldX + runtime.player.worldY - 0.02);
    }
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, 17, 6).stroke({ color: runtime.color, width: 2, alpha: 0.75 });
    const milestone49Art = getMilestone49PlayableArtTextures();
    const milestone12Art = getMilestone12ArtTextures();
    const texture = milestone49Art
      ? milestone49PlayerTextureFor(runtime.classId, runtime.player, this.seconds + runtime.slot * 0.17, milestone49Art)
      : milestone12Art
      ? milestone12PlayerTextureFor(runtime.player, runtime.slot, this.seconds + runtime.slot * 0.17, milestone12Art)
      : milestone11PlayerTextureFor(runtime.player, this.seconds + runtime.slot * 0.17, art);
    this.drawProductionWorldSprite(`player:${runtime.id}`, texture, runtime.player.worldX, runtime.player.worldY, 1.16, 0.9);
  }

  private drawProductionWorldSprite(key: string, texture: Texture, worldX: number, worldY: number, scale: number, anchorY: number): void {
    const p = worldToIso(worldX, worldY);
    this.entityGraphics.ellipse(p.screenX, p.screenY + 6, 15 * scale, 5.5 * scale).fill({ color: palette.shadow, alpha: 0.34 });
    const sprite = this.spriteForProductionAsset(key, texture);
    placeWorldSprite(sprite, worldX, worldY, scale, worldX + worldY, anchorY);
  }

  private spriteForProductionAsset(key: string, texture: Texture): Sprite {
    let sprite = this.productionSprites.get(key);
    if (!sprite) {
      sprite = new Sprite(texture);
      this.productionSprites.set(key, sprite);
      this.productionSpriteLayer.addChild(sprite);
    }
    if (sprite.texture !== texture) sprite.texture = texture;
    return sprite;
  }

  private drawProductionEffectSprite(key: string, texture: Texture, worldX: number, worldY: number, scale: number, anchorY: number, zIndex: number): void {
    const sprite = this.spriteForProductionAsset(key, texture);
    sprite.alpha = 1;
    placeWorldSprite(sprite, worldX, worldY, scale, zIndex, anchorY);
  }

  private updateTransientCombatArt(dt: number): void {
    for (const entity of this.world.entities) {
      if (!entity.active) continue;
      if (entity.kind === "particle") {
        entity.life -= dt;
        entity.worldX += entity.vx * dt;
        entity.worldY += entity.vy * dt;
        if (entity.life <= 0) entity.active = false;
      } else if (entity.kind === "damageText") {
        entity.life -= dt;
        entity.worldY -= dt * 0.58;
        if (entity.life <= 0) entity.active = false;
      }
    }
  }

  private spawnPickupSparkle(worldX: number, worldY: number): void {
    for (let i = 0; i < 3; i += 1) {
      const sparkle = this.world.spawn("particle");
      const angle = this.seconds * 2.3 + i * 2.1;
      sparkle.worldX = worldX;
      sparkle.worldY = worldY;
      sparkle.vx = Math.cos(angle) * 1.1;
      sparkle.vy = Math.sin(angle) * 1.1;
      sparkle.life = 0.42 + i * 0.04;
      sparkle.value = sparkle.life;
      sparkle.color = palette.blue;
      sparkle.label = "pickup_sparkle";
    }
  }

  private drawTransientParticle(game: Game, entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const combatArt = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
    if (combatArt) {
      const texture =
        entity.label === "pickup_sparkle"
          ? combatArt.combatEffects[pickupFrameForLife(entity.life)]
          : combatArt.combatEffects[impactFrameForLife(entity.life)];
      this.drawProductionEffectSprite(`effect:${entity.id}`, texture, entity.worldX, entity.worldY, entity.label === "pickup_sparkle" ? 0.9 : 1.05, 0.72, entity.worldX + entity.worldY + 0.04);
      return;
    }
    const alpha = clamp(entity.life / Math.max(0.01, entity.value || 0.35), 0, 1);
    this.projectileGraphics.circle(p.screenX, p.screenY - 14, entity.label === "pickup_sparkle" ? 4 : 7).fill({ color: entity.color, alpha });
  }

  private drawCombatDamageText(game: Game, entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const combatArt = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
    const alpha = clamp(entity.life / 0.72, 0, 1);
    if (combatArt) {
      const sprite = this.spriteForProductionAsset(`damage-badge:${entity.id}`, combatArt.combatEffects.damageBadge);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.78);
      sprite.alpha = alpha;
      sprite.position.set(p.screenX - 18, p.screenY - 48);
      sprite.zIndex = entity.worldX + entity.worldY + 0.2;
      sprite.visible = true;
    } else {
      this.projectileGraphics.rect(p.screenX - 28, p.screenY - 56, 22, 14).fill({ color: palette.paper, alpha }).stroke({ color: palette.ink, width: 2, alpha });
    }
    const text = new Text({
      text: entity.label || `${Math.ceil(entity.value)}`,
      style: { ...fontStyle, fontSize: 10, fill: "#17171d" }
    });
    text.anchor.set(0.5);
    text.alpha = alpha;
    text.position.set(p.screenX - 18, p.screenY - 49);
    game.layers.floatingText.addChild(text);
  }

  private drawProductionCombatHud(game: Game): void {
    const combatArt = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
    if (!combatArt) return;
    const frame = new Sprite(combatArt.patchCards[this.chosenUpgradeIds.length > 0 ? "faction" : "general"]);
    frame.anchor.set(0.5);
    frame.scale.set(0.34);
    frame.position.set(game.width - 326, 118);
    frame.alpha = 0.88;
    game.layers.hud.addChild(frame);

    const projectile = new Sprite(combatArt.combatEffects.projectile);
    projectile.anchor.set(0.5);
    projectile.scale.set(0.82);
    projectile.position.set(game.width - 326, 118);
    game.layers.hud.addChild(projectile);
  }

  private drawPickup(graphics: Graphics, entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    graphics.rect(p.screenX - 6, p.screenY - 16, 12, 12).fill(entity.color).stroke({ color: palette.ink, width: 2 });
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

function productionPropIdForCluster(cluster: PropClusterDefinition): Milestone11PropId | null {
  if (cluster.kind === "barricade") return "barricade_corridor";
  if (cluster.kind === "drone_wreck") return "crashed_drone_yard";
  if (cluster.kind === "terminal_array") return "emergency_alignment_terminal";
  if (cluster.kind === "breach_shard") return "cosmic_breach_crack";
  return null;
}

function productionPropIdForLandmark(landmark: LandmarkDefinition): Milestone11PropId | null {
  if (landmark.id === "barricade_corridor") return "barricade_corridor";
  if (landmark.id === "crashed_drone_yard") return "crashed_drone_yard";
  if (landmark.id === "emergency_alignment_terminal") return "emergency_alignment_terminal";
  if (landmark.id === "cosmic_breach_crack") return "cosmic_breach_crack";
  return null;
}

function propScaleForCluster(cluster: PropClusterDefinition, index: number): number {
  const variation = index % 2 === 0 ? 1 : 0.88;
  if (cluster.kind === "terminal_array") return 0.48 * variation;
  if (cluster.kind === "breach_shard") return 0.58 * variation;
  if (cluster.kind === "drone_wreck") return 0.58 * variation;
  return 0.52 * variation;
}

function propYOffsetForCluster(cluster: PropClusterDefinition): number {
  if (cluster.kind === "terminal_array") return 3;
  if (cluster.kind === "breach_shard") return 4;
  return 2;
}

function landmarkPropScale(propId: Milestone11PropId): number {
  if (propId === "emergency_alignment_terminal") return 1.1;
  if (propId === "cosmic_breach_crack") return 1.25;
  if (propId === "crashed_drone_yard") return 1.12;
  return 1.08;
}

function landmarkPropYOffset(propId: Milestone11PropId): number {
  if (propId === "emergency_alignment_terminal") return 8;
  if (propId === "cosmic_breach_crack") return 12;
  return 6;
}
