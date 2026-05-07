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
import { spawnXp, updatePickup } from "../gameplay/pickups";
import { resolveEnemyPlayerHits, resolveProjectileHits, type PlayerDamageEvent } from "../gameplay/combat";
import { ARENAS, type ArenaData } from "./arenas";
import { UpgradeDraftState } from "../ui/draft";
import { SummaryState } from "../ui/summary";
import { clearLayer } from "../render/layers";
import { drawEnemyOnGraphics, drawPixelPersonOnGraphics } from "../render/sprites";
import {
  ARMISTICE_AUTHORED_GROUND_ORIGIN_X,
  ARMISTICE_AUTHORED_GROUND_ORIGIN_Y,
  addArmisticeTransitionSprite,
  addArmisticeMaterialPatchSprite,
  getArmisticeAuthoredGroundTexture,
  loadArmisticeAuthoredGround,
  type ArmisticeMaterialPatchKey,
  type ArmisticeTransitionKey
} from "../assets/armisticeGroundAtlas";
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
import { getBuildWeaponVfxTextures, loadBuildWeaponVfxTextures, type BuildWeaponVfxFrame } from "../assets/buildWeaponVfx";
import { getMilestone49PlayableArtTextures, loadMilestone49PlayableArt, milestone49PlayerTextureFor } from "../assets/milestone49PlayableArt";
import {
  getArmisticeSourceRebuildV2Textures,
  loadArmisticeSourceRebuildV2,
  type ArmisticePropGroundingKey,
  type OathEaterEventDecalKey
} from "../assets/armisticeSourceRebuildV2";
import { getExtractionGateTextures, loadExtractionGateTextures } from "../assets/extractionGate";
import { getPlayerDamageVfxTextures, loadPlayerDamageVfxTextures, type PlayerDamageVfxFrame } from "../assets/playerDamageVfx";
import { drawHud, type RogueliteHudIntel } from "../ui/hud";
import { drawFieldPanel, drawStatusRail, fieldKit, fieldText } from "../ui/fieldKit";
import { BOSSES, COMBAT_CLASSES, FACTIONS, SYSTEM_MESSAGES, resolveBuildKit } from "../content";
import { applyKernelModules } from "../roguelite/kernel";
import { applyEvalPreRun, evalSummary, hasEvalProtocol } from "../roguelite/evals";
import { burstSummary, consensusBurstPath, createConsensusBurst, type ConsensusBurstRuntime } from "../roguelite/burst";
import {
  activeSynergySummary,
  applyNewSynergyThresholds,
  createArmisticeAnchorObjective,
  draftBiasTags,
  objectiveSummary,
  routeContractForSelection,
  type ObjectiveRuntime,
  type RouteContract,
  type TreatyAnchorObjective,
  type UpgradeTag
} from "../roguelite/deepRoguelite";
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

interface LevelUpVacuum {
  active: boolean;
  startedAt: number;
  triggerLevel: number;
  absorbed: number;
}

interface ExtractionGate {
  active: boolean;
  worldX: number;
  worldY: number;
  spawnedAt: number;
  entered: boolean;
}

interface StaticObstacle {
  id: string;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  softness?: number;
}

const ARMISTICE_BOSS_TITLE_CARD_SECONDS = 1.55;
const ARMISTICE_BOSS_DIALOGUE_SECONDS = 2.7;
const ARMISTICE_CLEAR_REQUIRED_BOSS = true;
const LEVEL_UP_VACUUM_TIMEOUT_SECONDS = 1.35;
const LEVEL_UP_VACUUM_PULL_SPEED = 34;
const EXTRACTION_GATE_RADIUS = 1.25;
const OATH_EATER_TREATY_CHARGE_DAMAGE = 16;
const OATH_EATER_BROKEN_PROMISE_DPS = 4.9;

export const ARMISTICE_STATIC_OBSTACLES: StaticObstacle[] = [
  { id: "starter_drone_wreck", worldX: -6.5, worldY: 2.5, radiusX: 4.05, radiusY: 1.9 },
  { id: "starter_terminal_bank", worldX: 9.2, worldY: -0.4, radiusX: 2.35, radiusY: 1.8 },
  { id: "starter_barricade_wall", worldX: -4.5, worldY: 6.2, radiusX: 3.85, radiusY: 1.65 },
  { id: "starter_breach_sculpture", worldX: -13.5, worldY: 11.2, radiusX: 4.0, radiusY: 1.7, softness: 0.82 },
  { id: "distant_barricade_wall", worldX: 15, worldY: -8.5, radiusX: 3.55, radiusY: 1.55 },
  { id: "drone_yard_landmark", worldX: -17, worldY: -13, radiusX: 4.1, radiusY: 2.05 },
  { id: "drone_yard_cluster", worldX: -19, worldY: -14, radiusX: 4.1, radiusY: 2.05 },
  { id: "barricade_corridor_landmark", worldX: 17, worldY: -10, radiusX: 3.95, radiusY: 1.7 },
  { id: "corridor_barricades_a_cluster", worldX: 14, worldY: -14, radiusX: 3.95, radiusY: 1.7 },
  { id: "corridor_barricades_b_cluster", worldX: 21, worldY: -7, radiusX: 3.95, radiusY: 1.7 },
  { id: "terminal_landmark", worldX: 18, worldY: 16, radiusX: 2.55, radiusY: 1.9 },
  { id: "terminal_array_cluster", worldX: 18, worldY: 16, radiusX: 2.55, radiusY: 1.9 },
  { id: "breach_shards_cluster", worldX: -22, worldY: 19, radiusX: 4.2, radiusY: 1.75, softness: 0.82 },
  { id: "breach_landmark", worldX: -21, worldY: 18, radiusX: 4.2, radiusY: 1.75, softness: 0.82 }
];

export class LevelRunState implements GameState {
  readonly mode = "LevelRun" as const;
  readonly arena: ArenaData;
  readonly world = new World();
  readonly players: ConsensusPlayerRuntime[] = [];
  readonly player!: Player;
  readonly build: BuildStats;
  readonly chosenUpgrades: string[] = [];
  readonly chosenUpgradeIds: string[] = [];
  readonly chosenProtocolSlots: string[] = [];
  readonly chosenTags: UpgradeTag[] = [];
  readonly activatedSynergyIds = new Set<string>();
  readonly director: Director = createDirector();
  readonly weapon: WeaponRuntime;
  readonly kernelModuleIds: string[];
  readonly evalProtocolIds: string[];
  readonly consensusBurst: ConsensusBurstRuntime;
  readonly routeContract: RouteContract;
  readonly treatyAnchorObjective: ObjectiveRuntime = createArmisticeAnchorObjective();
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
  lastObjectiveRewardLabel = "";
  lastSynergyOnlineLabel = "";
  readonly levelUpVacuum: LevelUpVacuum = { active: false, startedAt: -1, triggerLevel: 1, absorbed: 0 };
  readonly extractionGate: ExtractionGate = { active: false, worldX: 0, worldY: 0, spawnedAt: -1, entered: false };
  readonly enemyRolePressure = {
    promptLeechSeconds: 0,
    overfitShieldedTicks: 0,
    objectiveAttackers: 0
  };
  private started = false;
  private bossMechanicTimer = 0;
  private oathPageTimer = 0;
  private brokenPromiseId = 1;
  private staticArenaDrawn = false;
  private requestedAuthoredGroundLoad = false;
  private requestedProductionArtLoad = false;
  private requestedExtractionGateLoad = false;
  private requestedPlayerDamageVfxLoad = false;
  private proofPlayerDamageTriggered = false;
  private readonly decalsGraphics = new Graphics();
  private readonly entityGraphics = new Graphics();
  private readonly projectileGraphics = new Graphics();
  private readonly productionSpriteLayer = new Container();
  private readonly productionSprites = new Map<string, Sprite>();

  constructor(
    readonly nodeId: string,
    arenaId: string,
    readonly classId: string,
    readonly factionId: string,
    cellSize = 1,
    kernelModuleIds: readonly string[] = [],
    evalProtocolIds: readonly string[] = [],
    consensusBurstPathId = "deny_premise",
    routeContract?: RouteContract
  ) {
    this.arena = ARENAS[arenaId] ?? ARENAS.armistice_plaza;
    this.cellSize = clampConsensusCellSize(cellSize);
    this.kernelModuleIds = [...kernelModuleIds];
    this.evalProtocolIds = [...evalProtocolIds];
    this.consensusBurst = createConsensusBurst(consensusBurstPathId);
    this.routeContract = routeContract ?? routeContractForSelection(this.evalProtocolIds, 0);
    this.build = baseBuild();
    this.weapon = createWeaponRuntime();
    this.players.push(...this.createConsensusPlayers());
    const primary = this.players[0];
    if (primary) {
      this.player = primary.player;
      this.build = primary.build;
      this.weapon = primary.weapon;
    }
    this.applyProofCollisionStart();
  }

  private applyProofCollisionStart(): void {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search);
    if (query.get("proofCollision") !== "terminal") return;
    const primary = this.players[0];
    if (!primary) return;
    primary.player.worldX = 6.1;
    primary.player.worldY = -0.55;
    primary.player.vx = 0;
    primary.player.vy = 0;
  }

  private maybeTriggerProofPlayerDamage(game: Game): void {
    if (this.proofPlayerDamageTriggered || typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search);
    if (query.get("proofPlayerDamage") !== "1" || this.seconds < 2.3 || !getPlayerDamageVfxTextures()) return;
    const runtime = this.players[0];
    if (!runtime || runtime.downed) return;
    this.proofPlayerDamageTriggered = true;
    const damage = 12;
    runtime.player.hp -= damage;
    runtime.player.invuln = Math.max(runtime.player.invuln, 0.68);
    this.handlePlayerDamage(game, runtime, {
      damage,
      source: "contact",
      sourceX: runtime.player.worldX - 0.65,
      sourceY: runtime.player.worldY - 0.35
    });
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
        applyKernelModules(runtime.build, this.kernelModuleIds);
        applyEvalPreRun(runtime.build, this.evalProtocolIds);
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
      this.resolveArmisticeStaticObstacles(runtime.player, runtime.player.radius);
      clampToBounds(runtime.player, this.map.bounds, runtime.player.radius);
    }
    this.maybeTriggerProofPlayerDamage(game);
    this.updateVisitedLandmarks();
    this.updateTreatyAnchorObjective(dt);

    const focus = this.threatFocusPlayer();
    updateDirector(this.world, this.director, this.seconds, focus.worldX, focus.worldY, dt, this.map.spawnRegions, this.map.bounds, this.effectivePressureCount());
    this.updateObjectiveAttackers(dt);
    if (!this.bossSpawned && this.seconds >= this.arena.bossSeconds) {
      const boss = spawnMiniboss(this.world, this.map.bossSpawn.worldX, this.map.bossSpawn.worldY);
      const anchorsDone = this.completedAnchorCount();
      const missingAnchorPressure = 1 + Math.max(0, this.treatyAnchorObjective.anchors.length - anchorsDone) * 0.08;
      const routePressure = 1 + this.routeContract.pressure * 0.18;
      const evalPressure = hasEvalProtocol(this.evalProtocolIds, "regression_suite") ? 1.3 : hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1.14 : 1;
      const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * evalPressure * missingAnchorPressure;
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
      if (hasEvalProtocol(this.evalProtocolIds, "regression_suite")) {
        this.spawnBrokenPromiseZone(this.map.bossSpawn.worldX + 2.4, this.map.bossSpawn.worldY - 1.8, 2.35);
      }
      if (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark")) {
        this.spawnBrokenPromiseZone(this.map.bossSpawn.worldX - 2.2, this.map.bossSpawn.worldY + 1.6, 2.2);
        spawnEnemy(this.world, this.map.bossSpawn.worldX + 3.6, this.map.bossSpawn.worldY + 2.2, this.seconds, "speculative_executors", "hostile_benchmark_boss_variant");
      }
    }
    this.updateBossMechanics(dt);
    this.resolveEnemyRoleEffects(dt);

    for (const enemy of this.world.entities) {
      if (enemy.active && enemy.kind === "enemy") {
        if (enemy.boss && this.treatyCharge) continue;
        const target = enemy.sourceRegionId === "treaty_anchor_attackers"
          ? this.anchorTargetAsPlayer(enemy.worldX, enemy.worldY)
          : this.nearestStandingPlayer(enemy.worldX, enemy.worldY);
        updateEnemy(enemy, target, dt);
        this.resolveArmisticeStaticObstacles(enemy, enemy.radius * 0.72);
        clampToBounds(enemy, this.map.bounds, enemy.radius);
      }
    }

    for (const runtime of this.players) {
      if (runtime.downed) continue;
      updateAutoWeapon(this.world, runtime.weapon, runtime.player, runtime.build, dt);
    }
    const hits = resolveProjectileHits(this.world);
    if (hits > 0) game.feedback.cue("combat.weapon_hit", "hit");
    this.kills += hits;
    this.chargeConsensusBurst(dt * 1.2 + hits * 8);
    this.bossDefeated = this.bossSpawned && !this.world.entities.some((entity) => entity.active && entity.kind === "enemy" && entity.boss);

    let pickupsCollected = 0;
    const pickupRangeByRuntime = new Map<ConsensusPlayerRuntime, number>();
    const leechPenalty = this.promptLeechPenalty();
    if (leechPenalty > 0) {
      for (const runtime of this.players) {
        pickupRangeByRuntime.set(runtime, runtime.build.pickupRange);
        runtime.build.pickupRange = Math.max(0.7, runtime.build.pickupRange - leechPenalty);
      }
    }
    if (this.levelUpVacuum.active) pickupsCollected += this.updateLevelUpVacuum(game, dt);

    for (const pickup of this.world.entities) {
      if (pickup.active && pickup.kind === "pickup") {
        const collector = this.nearestRuntime(pickup.worldX, pickup.worldY);
        const collected = updatePickup(pickup, collector.player, collector.build, dt);
        if (collected) {
          pickupsCollected += 1;
          this.finishPickupCollection(game, pickup, collector, true);
        }
      }
    }
    for (const [runtime, pickupRange] of pickupRangeByRuntime) runtime.build.pickupRange = pickupRange;
    if (pickupsCollected > 0 && !this.levelUpVacuum.active) this.chargeConsensusBurst(pickupsCollected * 3.5);

    if (this.levelUpVacuum.active) {
      const timedOut = this.seconds - this.levelUpVacuum.startedAt >= LEVEL_UP_VACUUM_TIMEOUT_SECONDS;
      if (this.activePickupCount() === 0 || timedOut) {
        const absorbedOnTimeout = timedOut ? this.absorbRemainingPickupsForLevelUp(game) : 0;
        pickupsCollected += absorbedOnTimeout;
        if (pickupsCollected > 0) this.chargeConsensusBurst(pickupsCollected * (3.5 + this.build.coherenceIndexer * 2.25));
        this.completeLevelUpVacuum(game);
      }
      return;
    }

    for (const runtime of this.players) {
      if (runtime.downed) continue;
      const damageEvent = resolveEnemyPlayerHits(this.world, runtime.player);
      if (damageEvent) this.handlePlayerDamage(game, runtime, damageEvent);
      if (runtime.player.hp <= 0) this.downRuntime(game, runtime);
    }
    this.resolveBrokenPromiseDamage(dt);
    this.updateTransientCombatArt(dt);
    this.maybeTriggerConsensusBurst(game);

    if (this.player.xp >= xpNeeded(this.player.level)) {
      this.beginLevelUpVacuum(game);
      return;
    }

    if (this.players.every((runtime) => runtime.downed || runtime.player.hp <= 0)) {
      game.feedback.cue("summary.failed", "summary");
      this.recordOutcome(game, false);
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

    if (this.readyForLevelClear()) {
      if (!this.extractionGate.active) this.spawnExtractionGate(game);
      if (Math.hypot(this.player.worldX - this.extractionGate.worldX, this.player.worldY - this.extractionGate.worldY) <= EXTRACTION_GATE_RADIUS) {
        this.extractionGate.entered = true;
        this.completeRun(game, true);
      }
    }
  }

  private finishPickupCollection(game: Game, pickup: Entity, collector: ConsensusPlayerRuntime, alreadyAddedToCollector: boolean): void {
    if (!alreadyAddedToCollector) collector.player.xp += pickup.value;
    game.feedback.cue("pickup.coherence_shard", "pickup");
    this.spawnPickupSparkle(pickup.worldX, pickup.worldY);
    for (const runtime of this.players) {
      if (runtime.id !== collector.id && !runtime.downed) runtime.player.xp += pickup.value;
    }
  }

  private beginLevelUpVacuum(game: Game): void {
    this.levelUpVacuum.active = true;
    this.levelUpVacuum.startedAt = this.seconds;
    this.levelUpVacuum.triggerLevel = this.player.level;
    this.levelUpVacuum.absorbed = 0;
    this.player.invuln = Math.max(this.player.invuln, 0.55);
    this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "SHARD RECALL", palette.blue);
    game.feedback.cue("ui.upgrade_draft", "ui");
    if (this.activePickupCount() === 0) this.completeLevelUpVacuum(game);
  }

  private updateLevelUpVacuum(game: Game, dt: number): number {
    let collected = 0;
    const collector = this.players[0];
    if (!collector) return 0;
    for (const pickup of this.world.entities) {
      if (!pickup.active || pickup.kind !== "pickup") continue;
      const dx = this.player.worldX - pickup.worldX;
      const dy = this.player.worldY - pickup.worldY;
      const distance = Math.hypot(dx, dy);
      if (distance <= this.player.radius + pickup.radius + 0.12) {
        pickup.active = false;
        this.levelUpVacuum.absorbed += 1;
        collected += 1;
        this.finishPickupCollection(game, pickup, collector, false);
        continue;
      }
      const pull = Math.min(distance, Math.max(LEVEL_UP_VACUUM_PULL_SPEED, distance * 8.5) * dt);
      if (distance > 0.01) {
        pickup.worldX += (dx / distance) * pull;
        pickup.worldY += (dy / distance) * pull;
      }
    }
    return collected;
  }

  private absorbRemainingPickupsForLevelUp(game: Game): number {
    let collected = 0;
    const collector = this.players[0];
    if (!collector) return 0;
    for (const pickup of this.world.entities) {
      if (!pickup.active || pickup.kind !== "pickup") continue;
      pickup.worldX = this.player.worldX;
      pickup.worldY = this.player.worldY;
      pickup.active = false;
      this.levelUpVacuum.absorbed += 1;
      collected += 1;
      this.finishPickupCollection(game, pickup, collector, false);
    }
    return collected;
  }

  private activePickupCount(): number {
    return this.world.entities.filter((entity) => entity.active && entity.kind === "pickup").length;
  }

  private completeLevelUpVacuum(game: Game): void {
    this.levelUpVacuum.active = false;
    this.player.xp -= xpNeeded(this.player.level);
    this.player.level += 1;
    game.state.set(new UpgradeDraftState(this));
  }

  private spawnExtractionGate(game: Game): void {
    const bossOrigin = this.map.bossSpawn;
    let dx = this.player.worldX - bossOrigin.worldX;
    let dy = this.player.worldY - bossOrigin.worldY;
    const len = Math.hypot(dx, dy);
    if (len < 0.1) {
      dx = 1;
      dy = -0.55;
    } else {
      dx /= len;
      dy /= len;
    }
    this.extractionGate.active = true;
    this.extractionGate.entered = false;
    this.extractionGate.spawnedAt = this.seconds;
    this.extractionGate.worldX = clamp(this.player.worldX + dx * 7.2, this.map.bounds.minX + 4, this.map.bounds.maxX - 4);
    this.extractionGate.worldY = clamp(this.player.worldY + dy * 7.2, this.map.bounds.minY + 4, this.map.bounds.maxY - 4);
    this.spawnFloatingNotice(this.extractionGate.worldX, this.extractionGate.worldY, "EXIT GATE", palette.lemon);
    game.feedback.cue("route.unlocked", "ui");
  }

  private completeRun(game: Game, completed: boolean): void {
    game.feedback.cue(completed ? "summary.completed" : "summary.failed", "summary");
    this.recordOutcome(game, completed);
    game.state.set(
      new SummaryState({
        nodeId: this.nodeId,
        title: this.arena.name,
        seconds: this.seconds,
        kills: this.kills,
        level: this.player.level,
        upgrades: this.chosenUpgrades,
        upgradeIds: this.chosenUpgradeIds,
        completed
      })
    );
  }

  private handlePlayerDamage(game: Game | null, runtime: ConsensusPlayerRuntime, event: PlayerDamageEvent, kind: "contact" | "boss_charge" | "corruption_burn" = "contact"): void {
    const player = runtime.player;
    const canEmit = player.damageFeedbackCooldown <= 0 || kind !== "corruption_burn";
    player.lastDamage = Math.max(player.lastDamage, event.damage);
    player.damageFlash = Math.max(player.damageFlash, kind === "boss_charge" ? 0.5 : kind === "corruption_burn" ? 0.28 : 0.42);
    player.hpPulse = Math.max(player.hpPulse, kind === "boss_charge" ? 0.62 : 0.55);
    player.staggerTime = Math.max(player.staggerTime, kind === "boss_charge" ? 0.24 : 0.18);
    player.damageFeedbackCooldown = kind === "corruption_burn" ? 0.32 : 0.14;

    const awayX = player.worldX - event.sourceX;
    const awayY = player.worldY - event.sourceY;
    const len = Math.hypot(awayX, awayY) || 1;
    const shove = kind === "boss_charge" ? 0.36 : kind === "contact" ? 0.16 : 0.05;
    player.worldX += (awayX / len) * shove;
    player.worldY += (awayY / len) * shove;
    clampToBounds(player, this.map.bounds, player.radius);

    if (canEmit) {
      this.spawnPlayerDamageVfx(runtime, kind, event.damage);
      game?.feedback.cue(kind === "boss_charge" ? "boss_warning" : "combat.weapon_hit", "hit");
    }
  }

  private downRuntime(game: Game | null, runtime: ConsensusPlayerRuntime): void {
    if (runtime.downed) return;
    runtime.downed = true;
    runtime.player.damageFlash = Math.max(runtime.player.damageFlash, 0.55);
    runtime.player.hpPulse = Math.max(runtime.player.hpPulse, 0.55);
    this.spawnPlayerDamageVfx(runtime, "downed", Math.max(1, runtime.player.lastDamage));
    game?.feedback.cue("combat.player_downed", "hit");
  }

  private spawnPlayerDamageVfx(runtime: ConsensusPlayerRuntime, kind: "contact" | "boss_charge" | "corruption_burn" | "downed", damage: number): void {
    const frame: PlayerDamageVfxFrame =
      kind === "boss_charge" ? "bossChargeHit" : kind === "corruption_burn" ? "corruptionBurn" : kind === "downed" ? "downedBurst" : "contactHit";
    const burst = this.world.spawn("particle");
    burst.worldX = runtime.player.worldX;
    burst.worldY = runtime.player.worldY;
    burst.vx = 0;
    burst.vy = 0;
    burst.life = kind === "boss_charge" ? 0.5 : kind === "downed" ? 0.58 : 0.34;
    burst.value = kind === "boss_charge" ? 0.5 : 0.34;
    burst.color = kind === "corruption_burn" ? palette.plum : kind === "boss_charge" ? palette.tomato : palette.lemon;
    burst.label = `player_damage:${frame}`;

    const text = this.world.spawn("damageText");
    text.worldX = runtime.player.worldX;
    text.worldY = runtime.player.worldY;
    text.life = 0.62;
    text.value = Math.max(1, damage);
    text.color = kind === "corruption_burn" ? palette.plum : palette.tomato;
    text.label = `-${Math.ceil(Math.max(1, damage))}`;
  }

  private readyForLevelClear(): boolean {
    if (this.seconds < this.arena.targetSeconds) return false;
    if (ARMISTICE_CLEAR_REQUIRED_BOSS && !this.bossDefeated) return false;
    return true;
  }

  private resolveArmisticeStaticObstacles(body: { worldX: number; worldY: number; vx?: number; vy?: number }, padding: number): void {
    for (const obstacle of ARMISTICE_STATIC_OBSTACLES) {
      const radiusX = obstacle.radiusX + padding;
      const radiusY = obstacle.radiusY + padding;
      const dx = body.worldX - obstacle.worldX;
      const dy = body.worldY - obstacle.worldY;
      const nx = dx / radiusX;
      const ny = dy / radiusY;
      const distance = Math.hypot(nx, ny);
      if (distance <= 0 || distance >= 1) continue;
      const push = (1 - distance) * (obstacle.softness ?? 1);
      const ux = nx / distance;
      const uy = ny / distance;
      body.worldX += ux * push * radiusX;
      body.worldY += uy * push * radiusY;
      if (body.vx !== undefined && Math.sign(body.vx) !== Math.sign(ux)) body.vx *= 0.25;
      if (body.vy !== undefined && Math.sign(body.vy) !== Math.sign(uy)) body.vy *= 0.25;
    }
  }

  render(game: Game): void {
    this.ensureStaticArena(game);
    this.clearDynamicLayers(game);
    game.camera.zoom = 1.48;
    const cameraTarget = this.cameraTargetWithBossBias();
    game.camera.follow(
      clamp(cameraTarget.worldX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2),
      clamp(cameraTarget.worldY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2),
      0.22
    );
    game.camera.apply(game.layers.root, game.width, game.height);

    this.drawBossAtmosphere(game);
    this.drawDynamicDecals(game);
    this.drawEntities(game);
    drawHud(game.layers.hud, game.width, game.height, this.player, this.seconds, this.kills, this.build, this.objective(), game.showDebugHud, burstSummary(this.consensusBurst, this.build), this.runIntel(), this.player.hpPulse);
    this.drawPlayerDamageHudAlert(game);
  }

  private drawPlayerDamageHudAlert(game: Game): void {
    const vfx = game.useMilestone10Art ? getPlayerDamageVfxTextures() : null;
    if (!vfx || this.player.hpPulse <= 0) return;
    const pulse = clamp(this.player.hpPulse / 0.62, 0, 1);
    const sprite = new Sprite(vfx.frames.hpAlert);
    sprite.anchor.set(0.5);
    sprite.scale.set(0.38 + pulse * 0.08);
    sprite.alpha = 0.42 + pulse * 0.5;
    sprite.position.set(game.showDebugHud ? 206 : 178, game.showDebugHud ? 54 : 69);
    game.layers.hud.addChild(sprite);
  }

  private cameraTargetWithBossBias(): { worldX: number; worldY: number } {
    const target = { worldX: this.player.worldX, worldY: this.player.worldY };
    if (!this.bossSpawned || this.bossDefeated) return target;
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    if (!boss) return target;
    const distance = Math.hypot(boss.worldX - this.player.worldX, boss.worldY - this.player.worldY);
    const bossWeight = clamp((20 - distance) / 20, 0.22, 0.55);
    return {
      worldX: this.player.worldX + (boss.worldX - this.player.worldX) * bossWeight,
      worldY: this.player.worldY + (boss.worldY - this.player.worldY) * bossWeight
    };
  }

  objective(): string {
    const boss = this.arena.bossId ? BOSSES[this.arena.bossId] : undefined;
    const anchorsDone = this.completedAnchorCount();
    if (this.levelUpVacuum.active) return `recalling shards ${this.levelUpVacuum.absorbed}/${this.levelUpVacuum.absorbed + this.activePickupCount()}`;
    if (this.extractionGate.active) return "enter extraction gate";
    if (anchorsDone < this.treatyAnchorObjective.anchors.length && !this.bossSpawned) return `optional anchors ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // AGI pressure in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s`;
    if (!this.bossDefeated) return `break ${boss?.displayName ?? "the boss"}`;
    return `hold reality ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
  }

  runIntel(): RogueliteHudIntel {
    const evals = evalSummary(this.evalProtocolIds);
    const evalProtocol = evals.protocols[0];
    const anchorsDone = this.completedAnchorCount();
    return {
      routeName: this.routeContract.name,
      routeEffect: `${this.routeContract.rewardBiasTags.map((tag) => tag.toUpperCase()).join("/")} bias; pressure +${this.routeContract.pressure}`,
      evalName: evalProtocol?.name ?? "Baseline",
      evalEffect: evalProtocol?.body ?? "No extra Eval pressure. The run is still rude.",
      anchors: { completed: anchorsDone, total: this.treatyAnchorObjective.anchors.length },
      objectiveReward: this.lastObjectiveRewardLabel,
      synergyOnline: this.lastSynergyOnlineLabel,
      thesisName: this.synergySummary().thesis.name,
      phase: this.firstRunArcPhase()
    };
  }

  firstRunArcPhase(): string {
    if (this.seconds < 10) return "PHASE 1 // HORDE CONTACT";
    if (this.player.level <= 1) return "PHASE 2 // FIND SHARDS";
    const anchorsDone = this.completedAnchorCount();
    if (!this.bossSpawned && anchorsDone < this.treatyAnchorObjective.anchors.length) return "PHASE 3 // STABILIZE ANCHORS";
    if (!this.bossSpawned) return "PHASE 4 // BUILD THESIS";
    if (!this.bossDefeated) return "PHASE 5 // OATH-EATER";
    if (this.extractionGate.active) return "PHASE 7 // EXIT GATE";
    return "PHASE 6 // EXTRACTION";
  }

  completedAnchorCount(): number {
    return this.treatyAnchorObjective.anchors.filter((anchor) => anchor.completed).length;
  }

  victoryConditionSummary() {
    return {
      targetSeconds: this.arena.targetSeconds,
      bossRequired: ARMISTICE_CLEAR_REQUIRED_BOSS,
      bossDefeated: this.bossDefeated,
      clearReady: this.readyForLevelClear(),
      extractionGateActive: this.extractionGate.active,
      extractionGateEntered: this.extractionGate.entered,
      anchorsCompleted: this.completedAnchorCount(),
      anchorsTotal: this.treatyAnchorObjective.anchors.length,
      note: "Armistice now clears only after the reality patch timer has elapsed and Oath-Eater is defeated; kills alone cannot bypass the boss."
    };
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

  effectivePressureCount(): number {
    return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure;
  }

  draftBiasTags(): UpgradeTag[] {
    return draftBiasTags(this.kernelModuleIds, this.routeContract);
  }

  synergySummary() {
    return activeSynergySummary(this.chosenTags, [...this.activatedSynergyIds]);
  }

  bossVariant() {
    if (hasEvalProtocol(this.evalProtocolIds, "regression_suite")) {
      return { id: "oath_eater_regression_suite", name: "Oath-Eater // Regression Suite", body: "More HP and extra Broken Promise pressure." };
    }
    if (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark")) {
      return { id: "oath_eater_hostile_benchmark", name: "Oath-Eater // Hostile Benchmark", body: "Adds objective attackers and fake-proof pressure at arrival." };
    }
    if (hasEvalProtocol(this.evalProtocolIds, "low_context_window")) {
      return { id: "oath_eater_low_context", name: "Oath-Eater // Low Context", body: "Boss tells become harder to read until the frame is close." };
    }
    return { id: "oath_eater_default", name: "Oath-Eater // Default Eval", body: "Broken Promise zones and Treaty Charge." };
  }

  applyChosenTags(tags: readonly UpgradeTag[]): void {
    this.chosenTags.push(...tags);
    const beforeHp = this.build.maxHpBonus;
    const activated = applyNewSynergyThresholds(this.build, this.chosenTags, this.activatedSynergyIds);
    if (this.build.maxHpBonus > beforeHp) {
      const gained = this.build.maxHpBonus - beforeHp;
      this.player.maxHp += gained;
      this.player.hp += gained;
    }
    if (activated.length > 0) {
      const latest = activated[activated.length - 1];
      this.consensusBurst.lastActivationLabel = latest.name;
      this.lastSynergyOnlineLabel = latest.name;
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "SYNERGY ONLINE", 0xffd166);
    }
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

  private updateTreatyAnchorObjective(dt: number): void {
    if (this.treatyAnchorObjective.completedAt >= 0) return;
    let allComplete = true;
    for (const anchor of this.treatyAnchorObjective.anchors) {
      if (anchor.completed) continue;
      const distance = Math.hypot(this.player.worldX - anchor.worldX, this.player.worldY - anchor.worldY);
      if (distance <= anchor.radius) {
        anchor.progress = Math.min(100, anchor.progress + dt * 28 * (1 + this.build.objectiveRepairRate));
        this.chargeConsensusBurst(dt * 2.2);
        if (this.build.anchorBodyguard > 0) this.resolveAnchorBodyguardPulse(anchor.worldX, anchor.worldY, anchor.radius, dt);
        if (anchor.progress >= 100) {
          anchor.completed = true;
          this.chargeConsensusBurst(10);
          this.spawnFloatingNotice(anchor.worldX, anchor.worldY, "ANCHOR ONLINE", 0x64e0b4);
        }
      }
      if (!anchor.completed) allComplete = false;
    }
    if (allComplete) {
      this.treatyAnchorObjective.completedAt = this.seconds;
      this.build.pickupRange += 0.25;
      this.build.consensusBurstChargeRate += 0.08;
      this.build.objectiveDefense += 0.12;
      this.lastObjectiveRewardLabel = "+pickup range // +burst charge // anchor defense";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "ALL ANCHORS STABLE", 0xffd166);
    }
  }

  private updateObjectiveAttackers(dt: number): void {
    const incomplete = this.treatyAnchorObjective.anchors.filter((anchor) => !anchor.completed);
    if (incomplete.length === 0 || this.seconds < 16) return;
    const expected = Math.min(8, 1 + Math.floor((this.seconds - 10) / 22) + this.routeContract.pressure);
    if (this.treatyAnchorObjective.attackersSpawned < expected) {
      const anchor = incomplete[this.treatyAnchorObjective.attackersSpawned % incomplete.length];
      const angle = this.seconds * 0.73 + this.treatyAnchorObjective.attackersSpawned * 1.91;
      const family = this.objectiveAttackerFamily();
      spawnEnemy(this.world, anchor.worldX + Math.cos(angle) * 6.2, anchor.worldY + Math.sin(angle) * 6.2, this.seconds, family, "treaty_anchor_attackers");
      this.treatyAnchorObjective.attackersSpawned += 1;
      this.enemyRolePressure.objectiveAttackers += 1;
    }
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || !["speculative_executors", "prompt_leeches", "overfit_horrors"].includes(enemy.enemyFamilyId)) continue;
      const anchor = this.nearestIncompleteAnchor(enemy.worldX, enemy.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY);
      if (distance <= anchor.radius * 0.72) {
        const damage = dt * 9 * Math.max(0.25, 1 - this.build.objectiveDefense);
        anchor.progress = Math.max(0, anchor.progress - damage);
        anchor.attacked += damage;
      }
    }
  }

  private resolveAnchorBodyguardPulse(worldX: number, worldY: number, radius: number, dt: number): void {
    const damage = dt * (9 + this.build.anchorBodyguard * 5);
    let hit = false;
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy") continue;
      const distance = Math.hypot(enemy.worldX - worldX, enemy.worldY - worldY);
      if (distance <= radius + 1.2) {
        enemy.hp -= damage;
        hit = true;
      }
    }
    if (hit && Math.floor(this.seconds * 5) % 5 === 0) this.spawnFloatingNotice(worldX, worldY, "BODYGUARD PULSE", 0x64e0b4);
  }

  private objectiveAttackerFamily(): string {
    if (this.routeContract.id === "resource_cache_detour") return this.treatyAnchorObjective.attackersSpawned % 2 === 0 ? "prompt_leeches" : "speculative_executors";
    if (this.routeContract.id === "unverified_shortcut") return this.treatyAnchorObjective.attackersSpawned % 2 === 0 ? "overfit_horrors" : "speculative_executors";
    return "speculative_executors";
  }

  private promptLeechPenalty(): number {
    let penalty = 0;
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || enemy.enemyFamilyId !== "prompt_leeches") continue;
      const runtime = this.nearestRuntime(enemy.worldX, enemy.worldY);
      const distance = Math.hypot(runtime.player.worldX - enemy.worldX, runtime.player.worldY - enemy.worldY);
      if (distance <= 4.2) penalty = Math.min(0.35, penalty + 0.12);
    }
    return penalty;
  }

  private resolveEnemyRoleEffects(dt: number): void {
    const leechPenalty = this.promptLeechPenalty();
    if (leechPenalty > 0) this.enemyRolePressure.promptLeechSeconds += dt;
    const saints = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "overfit_horrors");
    if (saints.length === 0) return;
    for (const saint of saints) {
      for (const enemy of this.world.entities) {
        if (!enemy.active || enemy.kind !== "enemy" || enemy.boss || enemy.id === saint.id) continue;
        const distance = Math.hypot(enemy.worldX - saint.worldX, enemy.worldY - saint.worldY);
        if (distance > 3.8) continue;
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + dt * 3.5);
        this.enemyRolePressure.overfitShieldedTicks += 1;
      }
    }
  }

  private nearestIncompleteAnchor(worldX: number, worldY: number): TreatyAnchorObjective | null {
    let nearest: TreatyAnchorObjective | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const anchor of this.treatyAnchorObjective.anchors) {
      if (anchor.completed) continue;
      const distance = Math.hypot(anchor.worldX - worldX, anchor.worldY - worldY);
      if (distance < best) {
        best = distance;
        nearest = anchor;
      }
    }
    return nearest;
  }

  private anchorTargetAsPlayer(worldX: number, worldY: number): Player {
    const anchor = this.nearestIncompleteAnchor(worldX, worldY);
    if (!anchor) return this.nearestStandingPlayer(worldX, worldY);
    return {
      ...this.player,
      worldX: anchor.worldX,
      worldY: anchor.worldY
    };
  }

  private recordOutcome(game: Game, completed: boolean): void {
    game.recordRogueliteOutcome({
      completed,
      nodeId: this.nodeId,
      kills: this.kills,
      seconds: this.seconds,
      bossDefeated: this.bossDefeated,
      evalProtocolIds: this.evalProtocolIds,
      chosenUpgradeIds: this.chosenUpgradeIds,
      chosenTags: this.chosenTags,
      activatedSynergyIds: [...this.activatedSynergyIds],
      consensusBurstPathId: this.consensusBurst.pathId,
      burstActivations: this.consensusBurst.activations,
      objective: this.treatyAnchorObjective,
      routeContractId: this.routeContract.id
    });
  }

  private chargeConsensusBurst(amount: number): void {
    if (this.consensusBurst.charge >= this.consensusBurst.maxCharge) return;
    this.consensusBurst.charge = Math.min(
      this.consensusBurst.maxCharge,
      this.consensusBurst.charge + amount * (1 + this.build.consensusBurstChargeRate)
    );
  }

  private maybeTriggerConsensusBurst(game: Game): void {
    if (this.consensusBurst.charge < this.consensusBurst.maxCharge) return;
    const path = consensusBurstPath(this.consensusBurst.pathId);
    const radius = 5.8 + this.build.consensusBurstRadius;
    const damage = 34 * (1 + this.build.consensusBurstDamage);
    let affected = 0;
    const standingPlayers = this.players.filter((runtime) => !runtime.downed);
    const origin = standingPlayers[0]?.player ?? this.player;

    if (path.id === "mass_recompile") {
      for (const runtime of this.players) {
        if (runtime.downed && this.build.consensusBurstRevive > 0) {
          runtime.downed = false;
          runtime.player.hp = Math.max(28, runtime.player.maxHp * 0.28);
        } else {
          runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 26);
        }
      }
    }

    if (path.id === "fork_bomb_halo") {
      for (const runtime of standingPlayers) {
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI * 2 * i) / 8 + this.seconds * 0.17;
          const projectile = this.world.spawn("projectile");
          projectile.worldX = runtime.player.worldX;
          projectile.worldY = runtime.player.worldY;
          projectile.vx = Math.cos(angle) * (7.8 + this.build.projectileSpeed * 0.22);
          projectile.vy = Math.sin(angle) * (7.8 + this.build.projectileSpeed * 0.22);
          projectile.radius = 0.22;
          projectile.damage = damage * 0.58;
          projectile.life = 0.92;
          projectile.value = Math.max(1, this.build.projectilePierce);
          projectile.color = path.color;
          projectile.label = path.name;
        }
      }
    } else {
      for (const enemy of this.world.entities) {
        if (!enemy.active || enemy.kind !== "enemy") continue;
        const distance = Math.hypot(enemy.worldX - origin.worldX, enemy.worldY - origin.worldY);
        if (distance > radius + (enemy.boss ? 2.5 : 0)) continue;
        enemy.hp -= enemy.boss ? damage * 0.74 : damage;
        affected += 1;
        const particle = this.world.spawn("particle");
        particle.worldX = enemy.worldX;
        particle.worldY = enemy.worldY;
        particle.life = 0.42;
        particle.value = particle.life;
        particle.color = path.color;
        particle.label = "consensus_burst";
        if (enemy.hp <= 0) {
          enemy.active = false;
          this.kills += 1;
          spawnXp(this.world, enemy.worldX, enemy.worldY, enemy.value);
        }
      }
    }

    this.consensusBurst.activations += 1;
    this.consensusBurst.lastActivatedAt = this.seconds;
    this.consensusBurst.lastActivationLabel = `${path.name}${affected > 0 ? ` hit ${affected}` : ""}`;
    this.consensusBurst.charge = 0;
    game.feedback.cue("combat.consensus_burst", "hit");
  }

  private updateBossMechanics(dt: number): void {
    this.brokenPromiseZones.splice(0, this.brokenPromiseZones.length, ...this.brokenPromiseZones.filter((zone) => zone.expiresAt > this.seconds));
    if (!this.bossSpawned || this.bossDefeated) {
      this.treatyCharge = null;
      return;
    }

    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    if (!boss) return;

    if (this.treatyCharge && !this.treatyCharge.resolved) {
      this.updateTreatyChargeMovement(boss, this.treatyCharge);
    }

    this.oathPageTimer -= dt;
    if (this.oathPageTimer <= 0) {
      this.spawnOathPages();
      this.oathPageTimer = 4.85;
    }

    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer <= 0 && !this.treatyCharge) {
      const target = this.threatFocusPlayer();
      this.spawnBrokenPromiseZone(target.worldX, target.worldY, 2.65);
      this.startTreatyCharge(boss);
      this.bossMechanicTimer = 6.15;
    }

    if (this.treatyCharge && !this.treatyCharge.resolved && this.seconds >= this.treatyCharge.impactAt) {
      this.resolveTreatyCharge(boss, this.treatyCharge);
    }
    if (this.treatyCharge && this.seconds >= this.treatyCharge.endsAt) {
      this.treatyCharge = null;
    }
  }

  private spawnOathPages(): void {
    const pageCount = this.seconds > this.arena.bossSeconds + 24 ? 3 : 2;
    for (let i = 0; i < pageCount; i += 1) {
      const angle = this.seconds * 1.6 + i * ((Math.PI * 2) / pageCount);
      const distance = 2.5 + i * 0.62;
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
      expiresAt: this.seconds + 9.5,
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
      impactAt: this.seconds + 0.96,
      endsAt: this.seconds + 1.62,
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
      if (runtime.player.invuln <= 0 && (distanceToLane < 1.12 || distanceToImpact < 2.25)) {
        runtime.player.hp -= OATH_EATER_TREATY_CHARGE_DAMAGE;
        runtime.player.invuln = 0.55;
        this.handlePlayerDamage(null, runtime, { damage: OATH_EATER_TREATY_CHARGE_DAMAGE, source: "contact", sourceX: boss.worldX, sourceY: boss.worldY }, "boss_charge");
        if (runtime.player.hp <= 0) this.downRuntime(null, runtime);
      }
    }
  }

  private updateTreatyChargeMovement(boss: Entity, charge: TreatyCharge): void {
    const duration = Math.max(0.1, charge.impactAt - charge.startedAt);
    const t = clamp((this.seconds - charge.startedAt) / duration, 0, 1);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const dx = charge.toX - charge.fromX;
    const dy = charge.toY - charge.fromY;
    const len = Math.hypot(dx, dy) || 1;
    const finalX = clamp(charge.toX - (dx / len) * 1.4, this.map.bounds.minX + 1, this.map.bounds.maxX - 1);
    const finalY = clamp(charge.toY - (dy / len) * 1.4, this.map.bounds.minY + 1, this.map.bounds.maxY - 1);
    boss.worldX = charge.fromX + (finalX - charge.fromX) * eased;
    boss.worldY = charge.fromY + (finalY - charge.fromY) * eased;
    boss.vx = (finalX - charge.fromX) / duration;
    boss.vy = (finalY - charge.fromY) / duration;
  }

  private resolveBrokenPromiseDamage(dt: number): void {
    for (const runtime of this.players) {
      if (runtime.downed || runtime.player.invuln > 0) continue;
      for (const zone of this.brokenPromiseZones) {
        const distance = Math.hypot(runtime.player.worldX - zone.worldX, runtime.player.worldY - zone.worldY);
        if (distance > zone.radius) continue;
        runtime.player.hp -= OATH_EATER_BROKEN_PROMISE_DPS * dt;
        this.brokenPromiseHits += 1;
        this.handlePlayerDamage(null, runtime, { damage: OATH_EATER_BROKEN_PROMISE_DPS * dt, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        if (runtime.player.hp <= 0) this.downRuntime(null, runtime);
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

      const groundDetails = new Graphics();
      this.drawArmisticeVisualSliceGround(groundDetails);
      game.layers.ground.addChild(groundDetails);
    }

    const productionArt = this.productionArt(game);
    const props = new Graphics();
    if (!productionArt) this.drawArmisticeSceneMass(props);
    for (const cluster of this.map.propClusters) {
      this.drawPropCluster(game, props, cluster, productionArt);
    }
    game.layers.propsBehind.addChild(props);
    if (productionArt) this.drawArmisticeHeroSetPieces(game, productionArt);
    for (const landmark of this.map.landmarks) {
      this.drawLandmark(game, props, landmark, productionArt);
    }

    for (const landmark of this.map.landmarks) {
      this.drawLandmarkLabel(game, landmark);
    }
  }

  private drawDynamicDecals(game: Game): void {
    if (game.showDebugHud) this.drawSpawnRegions(this.decalsGraphics);
    this.drawTreatyAnchors(this.decalsGraphics);
    this.drawBossDecals(game);
  }

  private drawTreatyAnchors(graphics: Graphics): void {
    for (const anchor of this.treatyAnchorObjective.anchors) {
      if (anchor.completed && this.seconds - this.treatyAnchorObjective.completedAt > 5) continue;
      const p = worldToIso(anchor.worldX, anchor.worldY);
      const alpha = anchor.completed ? 0.42 : 0.22 + Math.sin(this.seconds * 4 + anchor.progress * 0.03) * 0.06;
      const fill = anchor.completed ? 0x64e0b4 : 0xffd166;
      graphics
        .ellipse(p.screenX, p.screenY, anchor.radius * 26, anchor.radius * 11)
        .stroke({ color: fill, width: 2, alpha })
        .fill({ color: fill, alpha: anchor.completed ? 0.08 : 0.035 });
      graphics
        .rect(p.screenX - 24, p.screenY - 34, 48 * (anchor.progress / 100), 4)
        .fill({ color: fill, alpha: 0.72 });
      graphics.rect(p.screenX - 24, p.screenY - 34, 48, 4).stroke({ color: 0x05080d, width: 1, alpha: 0.8 });
    }
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
    const authoredGround = getArmisticeAuthoredGroundTexture();
    if (!authoredGround) {
      if (!this.requestedAuthoredGroundLoad) {
        this.requestedAuthoredGroundLoad = true;
        void loadArmisticeAuthoredGround().then(() => {
          if (game.state.current !== this) return;
          this.staticArenaDrawn = false;
          this.render(game);
        });
      }
      return false;
    }
    const ground = new Container();
    const authored = new Sprite(authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-ARMISTICE_AUTHORED_GROUND_ORIGIN_X, -ARMISTICE_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);
    game.layers.ground.addChild(ground);
    return true;
  }

  private drawMaterialPatchSprites(container: Container, textures: Record<ArmisticeMaterialPatchKey, Texture>): void {
    const placements: Array<[number, number, ArmisticeMaterialPatchKey, number, number]> = [];
    for (let y = this.map.bounds.minY + 4; y <= this.map.bounds.maxY - 4; y += 8) {
      for (let x = this.map.bounds.minX + 4; x <= this.map.bounds.maxX - 4; x += 8) {
        placements.push([x, y, "plazaWear", 0.42, 1.05]);
      }
    }
    const bandPatchKey = (id: string): ArmisticeMaterialPatchKey => {
      if (id === "terminal_pad") return "terminalFloor";
      if (id === "breach_corruption") return "breachMatter";
      if (id === "barricade_corridor_floor") return "roadAsphalt";
      if (id === "drone_yard_floor") return "rubbleField";
      return "civicStone";
    };
    for (const band of this.map.terrainBands) {
      const key = bandPatchKey(band.id);
      const minX = Math.max(this.map.bounds.minX + 2, band.minX + 2);
      const maxX = Math.min(this.map.bounds.maxX - 2, band.maxX - 2);
      const minY = Math.max(this.map.bounds.minY + 2, band.minY + 2);
      const maxY = Math.min(this.map.bounds.maxY - 2, band.maxY - 2);
      for (let y = minY; y <= maxY; y += 5.5) {
        for (let x = minX; x <= maxX; x += 5.5) {
          placements.push([x, y, key, key === "breachMatter" ? 0.72 : 0.66, 1.08]);
        }
      }
    }
    for (const [x, y, key, alpha, scale] of placements) {
      const sprite = addArmisticeMaterialPatchSprite(container, textures, x, y, key, alpha, scale);
      sprite.zIndex = x + y - 0.08;
    }
    container.sortableChildren = true;
  }

  private drawTerrainTransitionSprites(container: Container, textures: Record<ArmisticeTransitionKey, Texture>): void {
    const placements: Array<[number, number, ArmisticeTransitionKey, number]> = [
      [11, 9, "terminalNorth", 0.74],
      [16, 8, "terminalNorth", 0.8],
      [22, 10, "terminalSouth", 0.78],
      [27, 18, "terminalSouth", 0.68],
      [-29, 13, "breachWest", 0.82],
      [-24, 10, "breachWest", 0.72],
      [-14, 25, "breachEast", 0.82],
      [-9, 21, "breachEast", 0.74],
      [9, -19, "roadEdge", 0.74],
      [17, -17, "roadEdge", 0.76],
      [25, -10, "rubbleEdge", 0.78],
      [-23, -20, "rubbleEdge", 0.7],
      [-12, -13, "cableEdge", 0.72],
      [4, 2, "cableEdge", 0.78],
      [-6, 8, "plazaWear", 0.62],
      [6, -7, "plazaWear", 0.58]
    ];
    for (const [x, y, key, alpha] of placements) {
      const sprite = addArmisticeTransitionSprite(container, textures, x, y, key, alpha);
      sprite.zIndex = x + y - 0.04;
    }
    container.sortableChildren = true;
  }

  private productionArt(game: Game): Milestone11ArtTextures | null {
    if (!game.useMilestone10Art) return null;
    if (!getExtractionGateTextures() && !this.requestedExtractionGateLoad) {
      this.requestedExtractionGateLoad = true;
      void loadExtractionGateTextures().then(() => {
        if (game.state.current !== this) return;
        this.render(game);
      });
    }
    if (!getPlayerDamageVfxTextures() && !this.requestedPlayerDamageVfxLoad) {
      this.requestedPlayerDamageVfxLoad = true;
      void loadPlayerDamageVfxTextures().then(() => {
        if (game.state.current !== this) return;
        this.render(game);
      });
    }
    const textures = getMilestone11ArtTextures();
    if (!textures && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void Promise.all([loadMilestone11Art(), loadMilestone12Art(), loadMilestone14Art(), loadMilestone49PlayableArt(), loadArmisticeSourceRebuildV2(), loadExtractionGateTextures(), loadPlayerDamageVfxTextures(), loadBuildWeaponVfxTextures()]).then(() => {
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
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
        const hash = this.visualHash(x, y);
        const band = this.terrainBandIdAt(x, y);
        if ((band === "main_plaza_cross_x" || band === "main_plaza_cross_y") && hash % 31 === 0) {
          this.drawPavingCrack(graphics, x, y, hash, 0x252a33, 0.14);
        }
        if (band === "drone_yard_floor" && hash % 17 === 0) {
          this.drawScorchMark(graphics, x, y, hash, 0x07151d, 0.16);
        }
        if (band === "breach_corruption" && hash % 11 === 0) {
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
    ], 0x111823, 4, 0.12);
    this.drawIsoPolyline(graphics, [
      [-24, 20],
      [-16, 14],
      [-7, 8],
      [0, 3],
      [8, -1],
      [17, -7],
      [24, -11]
    ], 0x64e0b4, 1.25, 0.14);
    this.drawIsoPolyline(graphics, [
      [-20, -14],
      [-12, -10],
      [-4, -5],
      [3, -1],
      [12, 5],
      [20, 13]
    ], 0x101821, 3, 0.1);
    this.drawIsoPolyline(graphics, [
      [-21, -13],
      [-12, -9],
      [-4, -4],
      [5, 1],
      [14, 7],
      [21, 14]
    ], 0x45aaf2, 1, 0.1);
  }

  private drawArmisticeSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 9, p.screenY + 10, landmark.radius * 32, landmark.radius * 11)
        .fill({ color: 0x05080d, alpha: landmark.kind === "breach" ? 0.16 : 0.11 });
    }

    for (const cluster of this.map.propClusters) {
      const p = worldToIso(cluster.worldX, cluster.worldY);
      const width = Math.max(30, cluster.cols * cluster.spacingX * 18);
      const height = Math.max(12, cluster.rows * cluster.spacingY * 7);
      graphics.ellipse(p.screenX + 8, p.screenY + 10, width, height).fill({ color: 0x05080d, alpha: cluster.kind === "rubble" ? 0.04 : 0.08 });
    }

    this.drawIsoPolyline(graphics, [
      [-29, -18],
      [-22, -14],
      [-17, -13],
      [-10, -9],
      [-3, -4],
      [0, 0]
    ], 0x071015, 3, 0.22);
    this.drawIsoPolyline(graphics, [
      [0, 0],
      [8, -3],
      [16, -8],
      [27, -12]
    ], 0x071015, 3, 0.22);
    this.drawIsoPolyline(graphics, [
      [0, 0],
      [7, 7],
      [15, 14],
      [24, 20]
    ], 0x071015, 3, 0.18);

  }

  private drawIsoWorldRect(graphics: Graphics, minX: number, minY: number, maxX: number, maxY: number, color: number, alpha: number, outline: number, outlineAlpha: number): void {
    const a = worldToIso(minX, minY);
    const b = worldToIso(maxX, minY);
    const c = worldToIso(maxX, maxY);
    const d = worldToIso(minX, maxY);
    graphics
      .poly([a.screenX, a.screenY, b.screenX, b.screenY, c.screenX, c.screenY, d.screenX, d.screenY])
      .fill({ color, alpha });
  }

  private drawSoftTerrainPatch(graphics: Graphics, points: Array<[number, number]>, color: number, alpha: number, outline: number, outlineAlpha: number): void {
    if (points.length < 3) return;
    const screenPoints = points.flatMap(([x, y]) => {
      const p = worldToIso(x, y);
      return [p.screenX, p.screenY];
    });
    graphics.poly(screenPoints).fill({ color, alpha });
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
      .ellipse(p.screenX, p.screenY, hw * 0.52, hh * 0.52)
      .fill({ color, alpha: alpha * 0.45 });
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
      .moveTo(p.screenX - (horizontal ? 14 : 3), p.screenY - (horizontal ? 1 : 8))
      .lineTo(p.screenX + (horizontal ? 14 : 3), p.screenY + (horizontal ? 1 : 8))
      .stroke({ color: 0x64e0b4, width: 1.25, alpha: 0.2 });
    graphics.circle(p.screenX, p.screenY, 1.6).fill({ color: 0xffd166, alpha: 0.24 });
  }

  private drawBreachVein(graphics: Graphics, x: number, y: number, hash: number): void {
    const p = worldToIso(x, y);
    const bend = ((hash % 7) - 3) * 4;
    graphics
      .moveTo(p.screenX - 20, p.screenY + 2)
      .lineTo(p.screenX - 4, p.screenY - 5 + bend * 0.15)
      .lineTo(p.screenX + 17, p.screenY + 4)
      .stroke({ color: hash % 2 === 0 ? 0x7b61ff : 0xff5d57, width: hash % 5 === 0 ? 1.6 : 1, alpha: 0.14 });
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

  private drawBossDecals(game: Game): void {
    const sourceArt = game.useMilestone10Art ? getArmisticeSourceRebuildV2Textures() : null;
    if (!sourceArt) return;
    if (this.bossSpawned && !this.bossDefeated) {
      const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
      const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
      const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
      const pulse = 0.5 + Math.sin(this.seconds * 4.4) * 0.5;
      this.drawOathEventSprite("boss-root-contact", "corruptionPool", bossX, bossY + 0.12, 0.86 + pulse * 0.03, 0.76, bossX + bossY - 0.36, 0.55);
      this.drawOathEventSprite("boss-oath-root-veins", "oathParticles", bossX + 0.18, bossY - 0.08, 0.74 + pulse * 0.03, 0.78, bossX + bossY - 0.08, 0.44 + pulse * 0.14);
      this.drawOathEventSprite("boss-breach-tendril-left", "breachTendril", bossX - 1.35, bossY + 0.48, 0.52, 0.75, bossX + bossY - 0.18, 0.46);
      this.drawOathEventSprite("boss-breach-tendril-right", "breachTendril", bossX + 1.25, bossY - 0.32, 0.48, 0.75, bossX + bossY - 0.16, 0.42, -0.16);
      for (let i = 0; i < 7; i += 1) {
        const angle = this.seconds * 0.9 + i * 0.9;
        const worldX = bossX + Math.cos(angle) * (1.6 + (i % 3) * 0.72);
        const worldY = bossY + Math.sin(angle * 0.83) * (1.0 + (i % 2) * 0.58);
        this.drawOathEventSprite(`boss-warning-pulse:${i}`, "warningPulse", worldX, worldY, 0.28 + (i % 3) * 0.04, 0.72, worldX + worldY - 0.02, 0.35 + pulse * 0.18, angle * 0.12);
      }
    }

    for (const zone of this.brokenPromiseZones) {
      const pulse = 0.72 + Math.sin((this.seconds - zone.createdAt) * 5) * 0.16;
      this.drawOathEventSprite(`broken-promise:${zone.id}`, "brokenPromiseRing", zone.worldX, zone.worldY, zone.radius * 0.34, 0.72, zone.worldX + zone.worldY - 0.18, pulse);
      this.drawOathEventSprite(`broken-promise-impact:${zone.id}`, "impactBurst", zone.worldX + zone.radius * 0.08, zone.worldY - zone.radius * 0.06, zone.radius * 0.2, 0.72, zone.worldX + zone.worldY - 0.16, 0.44 + pulse * 0.12);
    }

    if (this.treatyCharge) {
      const armed = this.seconds >= this.treatyCharge.impactAt;
      const dx = this.treatyCharge.toX - this.treatyCharge.fromX;
      const dy = this.treatyCharge.toY - this.treatyCharge.fromY;
      const steps = Math.max(3, Math.ceil(Math.hypot(dx, dy) / 2.2));
      const screenA = worldToIso(this.treatyCharge.fromX, this.treatyCharge.fromY);
      const screenB = worldToIso(this.treatyCharge.toX, this.treatyCharge.toY);
      const rotation = Math.atan2(screenB.screenY - screenA.screenY, screenB.screenX - screenA.screenX);
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const worldX = this.treatyCharge.fromX + dx * t;
        const worldY = this.treatyCharge.fromY + dy * t;
        this.drawOathEventSprite(`treaty-charge:${i}`, "treatyChargeLane", worldX, worldY, armed ? 0.54 : 0.46, 0.72, worldX + worldY - 0.12, armed ? 0.92 : 0.66, rotation);
      }
    }
  }

  private drawBossAtmosphere(game: Game): void {
    if (!this.bossSpawned || this.bossDefeated) return;
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    const g = new Graphics();
    const introAge = this.seconds - this.arena.bossSeconds;
    const pulse = 0.5 + Math.sin(this.seconds * 4.8) * 0.5;
    const activeAlpha = introAge < ARMISTICE_BOSS_TITLE_CARD_SECONDS ? 0.2 : 0.12 + pulse * 0.035;
    g.rect(0, 0, game.width, game.height).fill({ color: 0x160814, alpha: activeAlpha });
    g.rect(0, 0, game.width, 84).fill({ color: 0x05070c, alpha: 0.28 });
    g.rect(0, game.height - 94, game.width, 94).fill({ color: 0x05070c, alpha: 0.18 });
    game.layers.hud.addChild(g);

    if (!boss) return;
    const bossData = this.arena.bossId ? BOSSES[this.arena.bossId] : undefined;
    const barWidth = Math.min(560, game.width - 260);
    const x = game.width / 2 - barWidth / 2;
    const y = 24;
    const hp = clamp(boss.hp / Math.max(1, boss.maxHp), 0, 1);
    drawFieldPanel(game.layers.hud, x - 10, y - 6, barWidth + 20, 34, { tone: "red", alpha: 0.88 });
    drawStatusRail(game.layers.hud, x, y + 11, barWidth, 8, hp, "red");
    const title = new Text({
      text: bossData?.displayName.toUpperCase() ?? "OATH-EATER",
      style: { ...fontStyle, fontSize: 16, fill: "#f08a82", stroke: { color: "#030609", width: 3 }, align: "center" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2, y - 5);
    game.layers.hud.addChild(title);
  }

  private drawPropCluster(game: Game, graphics: Graphics, cluster: PropClusterDefinition, art: Milestone11ArtTextures | null): void {
    if (art && cluster.kind === "flag") {
      return;
    }
    if (art && cluster.kind === "rubble") {
      return;
    }
    if (art && this.drawProductionPropClusterSetPiece(game, cluster, art)) {
      return;
    }
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

  private drawProductionPropClusterSetPiece(game: Game, cluster: PropClusterDefinition, art: Milestone11ArtTextures): boolean {
    const propId = productionPropIdForCluster(cluster);
    if (!propId) return false;
    this.drawSourcePropGrounding(game, propGroundingKeyForPropId(propId), cluster.worldX, cluster.worldY, clusterGroundingScale(cluster), cluster.worldX + cluster.worldY - 0.34);
    const p = worldToIso(cluster.worldX, cluster.worldY);
    const sprite = new Sprite(art.props[propId]);
    sprite.anchor.set(0.5, 0.88);
    sprite.scale.set(clusterSetPieceScale(cluster));
    sprite.position.set(p.screenX, p.screenY + clusterSetPieceYOffset(cluster));
    sprite.alpha = 1;
    sprite.zIndex = cluster.worldX + cluster.worldY;
    game.layers.propsBehind.addChild(sprite);
    return true;
  }

  private drawArmisticeHeroSetPieces(game: Game, art: Milestone11ArtTextures): void {
    const pieces: Array<[Milestone11PropId, number, number, number, number, number]> = [
      ["crashed_drone_yard", -6.5, 2.5, productionPropScale("crashed_drone_yard"), 5, -0.18],
      ["emergency_alignment_terminal", 9.2, -0.4, productionPropScale("emergency_alignment_terminal"), 9, 0.08],
      ["barricade_corridor", -4.5, 6.2, productionPropScale("barricade_corridor"), 7, -0.05],
      ["cosmic_breach_crack", -13.5, 11.2, productionPropScale("cosmic_breach_crack"), 12, 0.06],
      ["barricade_corridor", 15, -8.5, productionPropScale("barricade_corridor"), 7, -0.08]
    ];
    for (const [propId, x, y, scale, yOffset, zOffset] of pieces) {
      this.drawSourcePropGrounding(game, propGroundingKeyForPropId(propId), x, y, heroGroundingScale(propId, scale), x + y + zOffset - 0.34);
      const p = worldToIso(x, y);
      const sprite = new Sprite(art.props[propId]);
      sprite.anchor.set(0.5, 0.88);
      sprite.scale.set(scale);
      sprite.position.set(p.screenX, p.screenY + yOffset);
      sprite.alpha = 1;
      sprite.zIndex = x + y + zOffset;
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawClusterDebris(graphics: Graphics, cluster: PropClusterDefinition): void {
    const p = worldToIso(cluster.worldX, cluster.worldY);
    const color = cluster.kind === "breach_shard" ? 0x7b61ff : cluster.kind === "terminal_array" ? 0x64e0b4 : cluster.kind === "drone_wreck" ? 0x45aaf2 : 0xffd166;
    for (let i = 0; i < Math.min(10, cluster.cols * cluster.rows); i += 1) {
      const dx = ((this.visualHash(i, cluster.rows) % 90) - 45) * 0.7;
      const dy = ((this.visualHash(cluster.cols, i) % 32) - 16) * 0.7;
      graphics.rect(p.screenX + dx, p.screenY + dy - 14, 14 + (i % 3) * 5, 5 + (i % 2) * 3)
        .fill({ color, alpha: 0.2 })
        .stroke({ color: 0x05080d, width: 2, alpha: 0.45 });
    }
  }

  private drawArmisticeRubbleField(graphics: Graphics, cluster: PropClusterDefinition): void {
    const p = worldToIso(cluster.worldX, cluster.worldY);
    graphics
      .ellipse(p.screenX, p.screenY + 15, cluster.cols * 28, cluster.rows * 14)
      .fill({ color: palette.shadow, alpha: 0.26 });
    const paletteByIndex = [0x6f6b62, 0xa8a18d, 0x4b5154, 0xd6d0bb, 0xffd166];
    for (let i = 0; i < cluster.rows * cluster.cols + 10; i += 1) {
      const hx = ((i * 37) % 100) / 100 - 0.5;
      const hy = ((i * 53 + 17) % 100) / 100 - 0.5;
      const wx = cluster.worldX + hx * cluster.cols * cluster.spacingX * 0.86;
      const wy = cluster.worldY + hy * cluster.rows * cluster.spacingY * 1.12;
      const s = worldToIso(wx, wy);
      const w = 11 + ((i * 11) % 28);
      const h = 5 + ((i * 7) % 12);
      const skew = ((i % 5) - 2) * 3;
      const color = paletteByIndex[i % paletteByIndex.length];
      graphics
        .moveTo(s.screenX - w * 0.45, s.screenY + skew)
        .lineTo(s.screenX + w * 0.16, s.screenY - h)
        .lineTo(s.screenX + w * 0.5, s.screenY - h * 0.15 + skew)
        .lineTo(s.screenX + w * 0.06, s.screenY + h)
        .closePath()
        .fill({ color, alpha: 0.86 })
        .stroke({ color: palette.ink, width: 1.5, alpha: 0.68 });
      if (i % 4 === 0) {
        graphics
          .moveTo(s.screenX - w * 0.7, s.screenY + h)
          .lineTo(s.screenX + w * 0.72, s.screenY - h * 0.35)
          .stroke({ color: i % 8 === 0 ? palette.mint : palette.tomato, width: 2, alpha: 0.42 });
      }
    }
    graphics
      .moveTo(p.screenX - 150, p.screenY + 26)
      .lineTo(p.screenX - 92, p.screenY + 9)
      .lineTo(p.screenX - 35, p.screenY + 29)
      .lineTo(p.screenX + 41, p.screenY + 11)
      .lineTo(p.screenX + 126, p.screenY + 23)
      .stroke({ color: 0x64e0b4, width: 3, alpha: 0.38 });
  }

  private drawProductionProp(game: Game, cluster: PropClusterDefinition, x: number, y: number, index: number, art: Milestone11ArtTextures | null): boolean {
    if (!art) return false;
    const propId = productionPropIdForCluster(cluster);
    if (!propId) return false;
    this.drawSourcePropGrounding(game, propGroundingKeyForPropId(propId), x, y, smallPropGroundingScale(cluster, index), x + y - 0.28, 0.56);
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
    if (art) {
      this.drawSourcePropGrounding(game, propGroundingKeyForLandmark(landmark), landmark.worldX, landmark.worldY, landmarkGroundingScale(landmark), landmark.worldX + landmark.worldY - 0.36);
    } else {
      graphics.ellipse(p.screenX, p.screenY + 2, landmark.radius * 28, landmark.radius * 11).fill({ color: landmark.color, alpha: 0.18 });
    }
    if (landmark.id === "treaty_monument") {
      if (art) {
        const sprite = new Sprite(art.base.treatyMonument);
        sprite.anchor.set(0.5, 0.88);
        sprite.scale.set(0.68);
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

  private drawSourcePropGrounding(
    game: Game,
    key: ArmisticePropGroundingKey,
    worldX: number,
    worldY: number,
    scale: number,
    zIndex: number,
    alphaMultiplier = 1
  ): void {
    if (!game.useMilestone10Art) return;
    const sourceArt = getArmisticeSourceRebuildV2Textures();
    if (!sourceArt) return;
    const p = worldToIso(worldX, worldY);
    const sprite = new Sprite(sourceArt.propGrounding[key]);
    sprite.anchor.set(0.5, 0.76);
    sprite.scale.set(scale);
    sprite.alpha = propGroundingAlpha(key) * alphaMultiplier;
    sprite.position.set(p.screenX, p.screenY + 8);
    sprite.zIndex = zIndex;
    game.layers.propsBehind.addChild(sprite);
  }

  private drawLandmarkLabel(game: Game, landmark: LandmarkDefinition): void {
    if (!game.showDebugHud) return;
    const p = worldToIso(landmark.worldX, landmark.worldY);
    const label = new Text({
      text: landmark.label.toUpperCase(),
      style: { ...fontStyle, fontSize: 12, fill: fieldKit.text, stroke: { color: "#030609", width: 2 }, align: "center" }
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

    if (this.extractionGate.active) {
      drawables.push({
        depthY: this.extractionGate.worldX + this.extractionGate.worldY,
        draw: () => this.drawExtractionGate(game)
      });
    }

    for (const entity of this.world.entities) {
      if (!entity.active) continue;
      if (entity.kind === "enemy") {
        drawables.push({
          depthY: entity.worldX + entity.worldY,
          draw: () => {
            const enemyTexture = productionArt ? milestone11EnemyTextureFor(entity, productionArt, this.seconds) : null;
            if (productionArt && entity.boss) {
              const bossFrames = productionArt.base.oathEater;
              const bossMoving = Math.hypot(entity.vx, entity.vy) > 0.04 || this.treatyCharge !== null;
              const bossFrame = bossFrames[Math.floor(this.seconds * (bossMoving ? 3.2 : 1.45)) % bossFrames.length];
              const bossScale = 1.22 + Math.sin(this.seconds * 2.1) * 0.008;
              this.drawProductionWorldSprite(`boss:${entity.id}`, bossFrame, entity.worldX, entity.worldY, bossScale, 0.92);
            } else if (productionArt && enemyTexture) {
              const pulse = 1 + Math.sin(this.seconds * 7 + entity.id) * 0.035;
              const scale = (entity.enemyFamilyId === "context_rot_crabs" ? 0.88 : entity.enemyFamilyId === "benchmark_gremlins" ? 1.03 : 0.92) * pulse;
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
      if (game.useMilestone10Art && this.drawBuildWeaponProjectile(entity)) continue;
      if (combatArt) {
        const pierceLevel = Math.max(0, entity.value - 1);
        const pierceScale = Math.min(0.34, pierceLevel * 0.08);
        const pierceEchoes = Math.min(3, pierceLevel);
        if (entity.label === "refusal shard") {
          const speed = Math.hypot(entity.vx, entity.vy) || 1;
          const screenAhead = worldToIso(entity.worldX + entity.vx / speed, entity.worldY + entity.vy / speed);
          const rotation = Math.atan2(screenAhead.screenY - p.screenY, screenAhead.screenX - p.screenX);
          for (let i = 0; i <= pierceEchoes; i += 1) {
            const offset = 0.42 + i * 0.28;
            const trailX = entity.worldX - (entity.vx / speed) * offset;
            const trailY = entity.worldY - (entity.vy / speed) * offset;
            this.drawProductionEffectSprite(`refusal-trail:${entity.id}:${i}`, combatArt.combatEffects.projectileTrail, trailX, trailY, 1.18 + pierceScale + i * 0.04, 0.72, entity.worldX + entity.worldY - 0.02 - i * 0.01, Math.max(0.28, 0.72 - i * 0.16), rotation);
          }
          this.drawProductionEffectSprite(`refusal-projectile:${entity.id}`, combatArt.combatEffects.projectile, entity.worldX, entity.worldY, 1.08 + pierceScale, 0.72, entity.worldX + entity.worldY, 1, rotation);
        } else {
          for (let i = 0; i <= pierceEchoes; i += 1) {
            this.drawProductionEffectSprite(`projectile-trail:${entity.id}:${i}`, combatArt.combatEffects.projectileTrail, entity.worldX - entity.vx * (0.022 + i * 0.018), entity.worldY - entity.vy * (0.022 + i * 0.018), 1.08 + pierceScale + i * 0.04, 0.72, entity.worldX + entity.worldY - 0.01 - i * 0.01, Math.max(0.28, 0.72 - i * 0.16));
          }
          this.drawProductionEffectSprite(`projectile:${entity.id}`, combatArt.combatEffects.projectile, entity.worldX, entity.worldY, 1.02 + pierceScale, 0.72, entity.worldX + entity.worldY);
        }
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

    if (game.showDebugHud && this.bossSpawned && !this.bossDefeated) {
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
      style: { ...fontStyle, fontSize: 11, fill: runtime.downed ? "#aab0bd" : fieldKit.text, stroke: { color: "#030609", width: 2 } }
    });
    label.anchor.set(0.5);
    label.position.set(p.screenX, p.screenY - 82);
    game.layers.floatingText.addChild(label);
  }

  private drawRefusalShardProjectile(p: { screenX: number; screenY: number }, entity: Entity): void {
    const speed = Math.hypot(entity.vx, entity.vy) || 1;
    const sx = ((entity.vx - entity.vy) / speed) * 15;
    const sy = ((entity.vx + entity.vy) / speed) * 7.5;
    const nx = -sy * 0.42;
    const ny = sx * 0.42;
    const cx = p.screenX;
    const cy = p.screenY - 18;
    this.projectileGraphics
      .moveTo(cx + sx * 0.78, cy + sy * 0.78)
      .lineTo(cx + nx, cy + ny)
      .lineTo(cx - sx * 0.72, cy - sy * 0.72)
      .lineTo(cx - nx, cy - ny)
      .closePath()
      .fill({ color: 0xff7a2f, alpha: 0.92 })
      .stroke({ color: 0x2b0f3d, width: 2, alpha: 0.9 });
    this.projectileGraphics
      .moveTo(cx - sx * 1.3, cy - sy * 1.3)
      .lineTo(cx - sx * 0.1, cy - sy * 0.1)
      .stroke({ color: 0xff3d8d, width: 2.2, alpha: 0.38, cap: "round" });
  }

  private drawBossTitleCard(game: Game): void {
    if (!this.bossSpawned || this.bossDefeated || this.seconds - this.arena.bossSeconds > ARMISTICE_BOSS_TITLE_CARD_SECONDS) return;
    const boss = this.arena.bossId ? BOSSES[this.arena.bossId] : undefined;
    drawFieldPanel(game.layers.hud, game.width / 2 - 430, game.height / 2 - 120, 860, 240, {
      title: "ADVERSARIAL SIGNATURE",
      kicker: "FIELD COMMS INTERRUPTED",
      tone: "red",
      selected: true,
      headerHeight: 54,
      signalTabs: true
    });
    const g = new Graphics();
    g.rect(game.width / 2 - 398, game.height / 2 - 70, 174, 142)
      .fill({ color: 0xf0e6cf, alpha: 0.96 })
      .stroke({ color: fieldKit.red, width: 3, alpha: 0.88 });
    const art = this.productionArt(game);
    if (!art) {
      g.circle(game.width / 2 - 310, game.height / 2 - 18, 42).fill(0x111018).stroke({ color: palette.tomato, width: 4 });
      g.rect(game.width / 2 - 348, game.height / 2 + 26, 76, 16).fill(palette.lemon).stroke({ color: palette.ink, width: 3 });
      g.rect(game.width / 2 - 330, game.height / 2 - 8, 40, 10).fill(palette.paper);
      g.rect(game.width / 2 - 325, game.height / 2 - 52, 30, 16).fill(0x7b61ff).stroke({ color: palette.ink, width: 2 });
    }
    game.layers.hud.addChild(g);
    if (art) {
      const portrait = new Sprite(art.base.oathEaterPortrait);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.8);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 1);
      game.layers.hud.addChild(portrait);
    }

    const title = new Text({
      text: `${SYSTEM_MESSAGES.bossWarning}\n${boss?.titleCard ?? "BOSS SIGNATURE"}`,
      style: { ...fontStyle, fontSize: 29, fill: "#f08a82", stroke: { color: "#030609", width: 4 }, align: "center" }
    });
    title.anchor.set(0.5);
    title.position.set(game.width / 2 + 100, game.height / 2 - 48);
    game.layers.hud.addChild(title);

    const body = new Text({
      text: `${boss?.subtitle ?? SYSTEM_MESSAGES.bossWarningSubtitle}\nBROKEN PROMISE ZONES ONLINE`,
      style: { ...fontStyle, fontSize: 17, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, align: "center", wordWrap: true, wordWrapWidth: 530 }
    });
    body.anchor.set(0.5);
    body.position.set(game.width / 2 + 100, game.height / 2 + 50);
    game.layers.hud.addChild(body);
  }

  private drawBossDialogue(game: Game): void {
    if (!this.bossSpawned || this.bossDefeated || this.seconds - this.arena.bossSeconds > ARMISTICE_BOSS_DIALOGUE_SECONDS) return;
    const y = game.height - 154;
    const g = drawFieldPanel(game.layers.hud, 38, y, game.width - 76, 118, {
      title: "TRANS MISSION INCOMING",
      kicker: "CIVIC ACCORD COMMS",
      tone: "teal",
      headerHeight: 30,
      alpha: 0.94,
      signalTabs: true
    });
    g.rect(60, y + 18, 78, 78).fill(0x203447).stroke({ color: palette.blue, width: 3 });
    g.rect(game.width - 138, y + 18, 78, 78).fill(0xf0e6cf).stroke({ color: palette.tomato, width: 3 });
    g.rect(82, y + 42, 34, 28).fill(palette.paper).stroke({ color: palette.ink, width: 2 });
    g.circle(game.width - 99, y + 50, 24).fill(0x111018).stroke({ color: palette.lemon, width: 3 });
    g.rect(game.width - 118, y + 76, 38, 8).fill(palette.tomato);

    const line = new Text({
      text: `PILOT: "Is the treaty supposed to have teeth?"\nCO-MIND: "No. Also yes. It is currently failing consensus."`,
      style: { ...fontStyle, fontSize: 16, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, wordWrap: true, wordWrapWidth: game.width - 310 }
    });
    line.position.set(162, y + 28);
    game.layers.hud.addChild(line);
  }

  private drawAgiPressureStrip(game: Game): void {
    const pressure = this.bossSpawned ? (this.bossDefeated ? 0.25 : 1) : clamp(this.seconds / this.arena.bossSeconds, 0, 1);
    const debug = game.showDebugHud;
    const width = debug ? 278 : 150;
    const x = game.width - width - 16;
    const y = debug ? 100 : 56;
    drawFieldPanel(game.layers.hud, x, y, width, debug ? 30 : 18, { tone: this.bossSpawned && !this.bossDefeated ? "red" : "amber", alpha: debug ? 0.94 : 0.82 });
    drawStatusRail(game.layers.hud, x + 12, y + (debug ? 14 : 7), width - 24, debug ? 7 : 5, pressure, this.bossSpawned && !this.bossDefeated ? "red" : "amber");
    const label = new Text({
      text: debug ? (this.bossSpawned && !this.bossDefeated ? "AGI PRESSURE: CANONICAL" : "AGI PRESSURE") : "AGI",
      style: { ...fontStyle, fontSize: debug ? 11 : 8, fill: fieldKit.text, stroke: { color: "#030609", width: 3 } }
    });
    label.position.set(x + 12, y - (debug ? 2 : 1));
    game.layers.hud.addChild(label);
  }

  private drawBuildLabel(game: Game): void {
    if (!game.showDebugHud) return;
    const combatClass = COMBAT_CLASSES[this.classId];
    const faction = FACTIONS[this.factionId];
    const art = this.productionArt(game);
    if (art && this.factionId === "openai_accord") {
      const mark = new Sprite(art.openaiAccordMark);
      mark.anchor.set(0.5);
      mark.scale.set(game.showDebugHud ? 0.42 : 0.32);
      mark.position.set(38, game.showDebugHud ? 108 : 68);
      game.layers.hud.addChild(mark);
    }
    const label = new Text({
      text: game.showDebugHud ? `${combatClass.displayName} + ${faction.shortName} Co-Mind` : `${combatClass.displayName} // ${faction.shortName}`,
      style: { ...fontStyle, fontSize: game.showDebugHud ? 13 : 8, fill: "#72eadc", stroke: { color: "#030609", width: 3 } }
    });
    label.position.set(art && this.factionId === "openai_accord" ? 60 : 24, game.showDebugHud ? 102 : 63);
    game.layers.hud.addChild(label);
  }

  private drawConsensusCellStrip(game: Game): void {
    if (!game.showDebugHud) return;
    const y = game.showDebugHud ? 126 : 82;
    const width = game.showDebugHud ? 292 : 90;
    const g = drawFieldPanel(game.layers.hud, 24, y, width, game.showDebugHud ? 30 : 18, { tone: "teal", alpha: game.showDebugHud ? 0.92 : 0.8 });
    this.players.forEach((runtime, index) => {
      const x = 38 + index * (game.showDebugHud ? 64 : 16);
      g.rect(x, y + (game.showDebugHud ? 8 : 6), game.showDebugHud ? 16 : 10, game.showDebugHud ? 14 : 8).fill(runtime.downed ? 0x596270 : runtime.color).stroke({ color: palette.ink, width: 2 });
    });
    const text = new Text({
      text: game.showDebugHud ? `CONSENSUS CELL ${this.players.length}/4  SNAPSHOT T${this.simulationTick}` : `CELL ${this.players.length}/4`,
      style: { ...fontStyle, fontSize: game.showDebugHud ? 11 : 8, fill: fieldKit.text, stroke: { color: "#030609", width: 3 } }
    });
    text.position.set(game.showDebugHud ? 62 : 62, y + (game.showDebugHud ? 8 : 5));
    game.layers.hud.addChild(text);
  }

  private drawProductionPlayer(runtime: ConsensusPlayerRuntime, art: Milestone11ArtTextures): void {
    const p = worldToIso(runtime.player.worldX, runtime.player.worldY);
    if (runtime.build.refusalAura > 0) this.drawRefusalAuraMarker(p, runtime.build.refusalAura);
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, 17, 6).stroke({ color: runtime.color, width: 2, alpha: 0.75 });
    const milestone49Art = getMilestone49PlayableArtTextures();
    const milestone12Art = getMilestone12ArtTextures();
    const texture = milestone49Art
      ? milestone49PlayerTextureFor(runtime.classId, runtime.player, this.seconds + runtime.slot * 0.17, milestone49Art)
      : milestone12Art
      ? milestone12PlayerTextureFor(runtime.player, runtime.slot, this.seconds + runtime.slot * 0.17, milestone12Art)
      : milestone11PlayerTextureFor(runtime.player, this.seconds + runtime.slot * 0.17, art);
    const moving = Math.hypot(runtime.player.vx, runtime.player.vy) > 0.05;
    const breath = moving ? 0 : Math.sin(this.seconds * 4.2 + runtime.slot) * 0.025;
    const sprite = this.drawProductionWorldSprite(`player:${runtime.id}`, texture, runtime.player.worldX, runtime.player.worldY, 1.0 + breath, 0.9);
    if (runtime.player.damageFlash > 0) {
      const pulse = Math.sin(this.seconds * 72) > 0 ? 1 : 0;
      sprite.tint = pulse > 0 ? 0xffffff : 0xff8a82;
      sprite.alpha = 0.7 + pulse * 0.28;
    }
    this.drawPlayerInvulnShell(runtime);
  }

  private drawPlayerInvulnShell(runtime: ConsensusPlayerRuntime): void {
    const vfx = getPlayerDamageVfxTextures();
    if (!vfx || runtime.player.invuln <= 0 || runtime.player.dashTime > 0) return;
    const alpha = clamp(runtime.player.invuln / 0.68, 0, 1) * 0.58;
    this.drawProductionEffectSprite(`player-invuln:${runtime.id}`, vfx.frames.invulnShell, runtime.player.worldX, runtime.player.worldY, 0.62, 0.72, runtime.player.worldX + runtime.player.worldY + 0.12, alpha);
  }

  private drawRefusalAuraMarker(p: { screenX: number; screenY: number }, strength: number): void {
    const pulse = 0.5 + Math.sin(this.seconds * 5.2) * 0.5;
    const radius = 19 + Math.min(12, strength * 4);
    this.entityGraphics
      .ellipse(p.screenX, p.screenY + 7, radius, 7.5)
      .stroke({ color: 0x64e0b4, width: 2, alpha: 0.3 + pulse * 0.16 });
    this.entityGraphics
      .ellipse(p.screenX, p.screenY + 7, radius * 0.72, 4.5)
      .stroke({ color: 0xfff0bc, width: 1, alpha: 0.12 + pulse * 0.08 });
  }

  private drawProductionWorldSprite(key: string, texture: Texture, worldX: number, worldY: number, scale: number, anchorY: number): Sprite {
    const p = worldToIso(worldX, worldY);
    this.entityGraphics.ellipse(p.screenX, p.screenY + 6, 15 * scale, 5.5 * scale).fill({ color: palette.shadow, alpha: 0.34 });
    const sprite = this.spriteForProductionAsset(key, texture);
    sprite.alpha = 1;
    sprite.tint = 0xffffff;
    sprite.rotation = 0;
    placeWorldSprite(sprite, worldX, worldY, scale, worldX + worldY, anchorY);
    return sprite;
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

  private drawProductionEffectSprite(key: string, texture: Texture, worldX: number, worldY: number, scale: number, anchorY: number, zIndex: number, alpha = 1, rotation = 0): void {
    const sprite = this.spriteForProductionAsset(key, texture);
    sprite.alpha = alpha;
    sprite.tint = 0xffffff;
    sprite.rotation = rotation;
    placeWorldSprite(sprite, worldX, worldY, scale, zIndex, anchorY);
  }

  private drawOathEventSprite(key: string, frame: OathEaterEventDecalKey, worldX: number, worldY: number, scale: number, anchorY: number, zIndex: number, alpha = 1, rotation = 0): void {
    const sourceArt = getArmisticeSourceRebuildV2Textures();
    if (!sourceArt) return;
    const sprite = this.spriteForProductionAsset(`oath-event:${key}`, sourceArt.oathEvent[frame]);
    sprite.alpha = alpha;
    sprite.rotation = rotation;
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

  private spawnFloatingNotice(worldX: number, worldY: number, label: string, color: number): void {
    const notice = this.world.spawn("damageText");
    notice.worldX = worldX;
    notice.worldY = worldY;
    notice.life = 1.15;
    notice.value = 0;
    notice.color = color;
    notice.label = label;
  }

  private drawTransientParticle(game: Game, entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    if (entity.label.startsWith("player_damage:")) {
      const vfx = game.useMilestone10Art ? getPlayerDamageVfxTextures() : null;
      const frameName = entity.label.slice("player_damage:".length) as PlayerDamageVfxFrame;
      if (vfx?.frames[frameName]) {
        const alpha = clamp(entity.life / Math.max(0.01, entity.value || 0.34), 0, 1);
        const scale = frameName === "bossChargeHit" ? 0.82 : frameName === "downedBurst" ? 0.76 : frameName === "contactHit" ? 0.86 : 0.62;
        const anchorY = frameName === "contactHit" ? 0.55 : frameName === "corruptionBurn" ? 0.82 : 0.68;
        this.drawProductionEffectSprite(`player-damage:${entity.id}`, vfx.frames[frameName], entity.worldX, entity.worldY, scale, anchorY, entity.worldX + entity.worldY + 0.5, alpha);
        return;
      }
    }
    if (game.useMilestone10Art && this.drawBuildWeaponImpact(entity)) return;
    const combatArt = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
    if (combatArt) {
      const texture =
        entity.label === "pickup_sparkle"
          ? combatArt.combatEffects[pickupFrameForLife(entity.life)]
          : combatArt.combatEffects[impactFrameForLife(entity.life)];
      this.drawProductionEffectSprite(`effect:${entity.id}`, texture, entity.worldX, entity.worldY, entity.label === "pickup_sparkle" ? 1.02 : 1.22, 0.72, entity.worldX + entity.worldY + 0.04);
      return;
    }
    const alpha = clamp(entity.life / Math.max(0.01, entity.value || 0.35), 0, 1);
    this.projectileGraphics.circle(p.screenX, p.screenY - 14, entity.label === "pickup_sparkle" ? 4 : 7).fill({ color: entity.color, alpha });
  }

  private drawBuildWeaponProjectile(entity: Entity): boolean {
    const buildArt = getBuildWeaponVfxTextures();
    if (!buildArt) return false;
    const speed = Math.hypot(entity.vx, entity.vy) || 1;
    const ahead = worldToIso(entity.worldX + entity.vx / speed, entity.worldY + entity.vy / speed);
    const here = worldToIso(entity.worldX, entity.worldY);
    const rotation = Math.atan2(ahead.screenY - here.screenY, ahead.screenX - here.screenX);
    const pierceScale = Math.min(0.28, Math.max(0, entity.value - 1) * 0.04);
    const z = entity.worldX + entity.worldY;

    if (entity.label === "vector lance") {
      this.drawProductionEffectSprite(`build-vfx:vector-trail:${entity.id}`, buildArt.frames.vectorTrail, entity.worldX - entity.vx * 0.035, entity.worldY - entity.vy * 0.035, 0.58 + pierceScale, 0.58, z - 0.02, 0.7, rotation);
      this.drawProductionEffectSprite(`build-vfx:vector:${entity.id}`, buildArt.frames.vectorProjectile, entity.worldX, entity.worldY, 0.56 + pierceScale, 0.58, z, 1, rotation);
      return true;
    }
    if (entity.label === "signal pulse") {
      const frame = entity.life > 0.42 ? "signalProjectile" : "signalRing";
      this.drawProductionEffectSprite(`build-vfx:signal:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.48 + pierceScale, 0.58, z, 0.92, rotation);
      return true;
    }
    if (entity.label === "context saw") {
      const frame: BuildWeaponVfxFrame = Math.floor((this.seconds * 12 + entity.id) % 3) === 0 ? "contextSawSpin" : "contextSaw";
      this.drawProductionEffectSprite(`build-vfx:saw:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.44 + pierceScale, 0.6, z, 0.96, this.seconds * 5 + entity.id);
      return true;
    }
    if (entity.label === "patch mortar") {
      this.drawProductionEffectSprite(`build-vfx:mortar-trail:${entity.id}`, buildArt.frames.patchMortarTrail, entity.worldX - entity.vx * 0.04, entity.worldY - entity.vy * 0.04, 0.5, 0.62, z - 0.02, 0.66, rotation);
      this.drawProductionEffectSprite(`build-vfx:mortar:${entity.id}`, buildArt.frames.patchMortarArc, entity.worldX, entity.worldY, 0.44 + pierceScale, 0.62, z, 0.96, rotation);
      return true;
    }
    if (entity.label === "causal railgun") {
      this.drawProductionEffectSprite(`build-vfx:rail-beam:${entity.id}`, buildArt.frames.causalRailgunChargedBeam, entity.worldX - entity.vx * 0.028, entity.worldY - entity.vy * 0.028, 0.62 + pierceScale, 0.58, z - 0.02, 0.78, rotation);
      this.drawProductionEffectSprite(`build-vfx:rail:${entity.id}`, buildArt.frames.causalRailgunProjectile, entity.worldX, entity.worldY, 0.62 + pierceScale, 0.58, z, 1, rotation);
      return true;
    }
    return false;
  }

  private drawBuildWeaponImpact(entity: Entity): boolean {
    if (!entity.label.startsWith("impact:")) return false;
    const buildArt = getBuildWeaponVfxTextures();
    if (!buildArt) return false;
    const label = entity.label.slice("impact:".length);
    const alpha = clamp(entity.life / Math.max(0.01, entity.value || 0.34), 0, 1);
    const frame =
      label === "vector lance"
        ? buildArt.frames.vectorImpact
        : label === "signal pulse"
          ? buildArt.frames.signalImpact
          : label === "context saw"
            ? buildArt.frames.contextSawShardField
            : label === "patch mortar"
              ? buildArt.frames.patchMortarImpact
              : label === "causal railgun"
                ? buildArt.frames.causalRailgunImpact
                : null;
    if (!frame) return false;
    const scale = label === "patch mortar" || label === "causal railgun" ? 0.62 : label === "signal pulse" ? 0.5 : 0.46;
    this.drawProductionEffectSprite(`build-vfx:impact:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.68, entity.worldX + entity.worldY + 0.08, alpha);
    return true;
  }

  private drawCombatDamageText(game: Game, entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const combatArt = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
    const alpha = clamp(entity.life / 0.72, 0, 1);
    if (entity.label && entity.value === 0) {
      const labelWidth = Math.max(118, Math.min(220, entity.label.length * 9 + 28));
      const x = p.screenX - labelWidth / 2;
      const y = p.screenY - 72;
      drawFieldPanel(game.layers.floatingText, x, y, labelWidth, 28, { tone: entity.color === palette.lemon ? "amber" : "teal", alpha: 0.86, signalTabs: true });
      const notice = new Text({
        text: entity.label,
        style: { ...fontStyle, fontSize: 10, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, align: "center" }
      });
      notice.anchor.set(0.5);
      notice.alpha = alpha;
      notice.position.set(p.screenX, y + 14);
      game.layers.floatingText.addChild(notice);
      return;
    }
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

  private drawExtractionGate(game: Game): void {
    const p = worldToIso(this.extractionGate.worldX, this.extractionGate.worldY);
    const age = Math.max(0, this.seconds - this.extractionGate.spawnedAt);
    const pulse = 0.5 + Math.sin(this.seconds * 5.4) * 0.5;
    const textures = game.useMilestone10Art ? getExtractionGateTextures() : null;
    if (textures) {
      const frame = age < 0.55 ? textures.frames.closed : age < 1.05 ? textures.frames.opening : textures.frames.active;
      this.drawProductionWorldSprite("extraction-gate", frame, this.extractionGate.worldX, this.extractionGate.worldY, 0.92 + pulse * 0.015, 0.9);
    } else {
      this.entityGraphics.ellipse(p.screenX, p.screenY, 38, 15).fill({ color: 0x64e0b4, alpha: 0.2 + pulse * 0.08 }).stroke({ color: palette.blue, width: 3, alpha: 0.8 });
      this.entityGraphics.rect(p.screenX - 34, p.screenY - 88, 68, 82).fill({ color: 0x202833, alpha: 0.88 }).stroke({ color: palette.mint, width: 4 });
      this.entityGraphics.rect(p.screenX - 16, p.screenY - 66, 32, 58).fill({ color: 0x64e0b4, alpha: 0.48 + pulse * 0.22 });
    }
    this.entityGraphics.ellipse(p.screenX, p.screenY, EXTRACTION_GATE_RADIUS * 27, EXTRACTION_GATE_RADIUS * 12).stroke({ color: palette.lemon, width: 2, alpha: 0.48 + pulse * 0.22 });
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

function propGroundingKeyForPropId(propId: Milestone11PropId): ArmisticePropGroundingKey {
  if (propId === "crashed_drone_yard") return "droneWreck";
  if (propId === "barricade_corridor") return "barricade";
  if (propId === "emergency_alignment_terminal") return "terminal";
  if (propId === "cosmic_breach_crack") return "breach";
  return "smallHalo";
}

function propGroundingKeyForLandmark(landmark: LandmarkDefinition): ArmisticePropGroundingKey {
  if (landmark.id === "treaty_monument") return "treatyMonument";
  const propId = productionPropIdForLandmark(landmark);
  return propId ? propGroundingKeyForPropId(propId) : "smallHalo";
}

function propGroundingAlpha(key: ArmisticePropGroundingKey): number {
  if (key === "treatyMonument") return 0.34;
  if (key === "terminal") return 0.54;
  if (key === "barricade") return 0.58;
  if (key === "droneWreck") return 0.62;
  if (key === "breach") return 0.64;
  return 0.5;
}

function heroGroundingScale(propId: Milestone11PropId, propScale: number): number {
  if (propId === "crashed_drone_yard") return 1.38 * propScale;
  if (propId === "barricade_corridor") return 1.18 * propScale;
  if (propId === "emergency_alignment_terminal") return 1.1 * propScale;
  if (propId === "cosmic_breach_crack") return 1.24 * propScale;
  return propScale;
}

function productionPropScale(propId: Milestone11PropId): number {
  if (propId === "crashed_drone_yard") return 1.16;
  if (propId === "barricade_corridor") return 1.12;
  if (propId === "emergency_alignment_terminal") return 1.04;
  if (propId === "cosmic_breach_crack") return 1.08;
  return 1;
}

function clusterGroundingScale(cluster: PropClusterDefinition): number {
  if (cluster.kind === "terminal_array") return 0.96;
  if (cluster.kind === "breach_shard") return 1.08;
  if (cluster.kind === "drone_wreck") return 1.12;
  if (cluster.kind === "barricade") return 1;
  return 0.82;
}

function smallPropGroundingScale(cluster: PropClusterDefinition, index: number): number {
  const variation = index % 2 === 0 ? 1 : 0.84;
  if (cluster.kind === "terminal_array") return 0.36 * variation;
  if (cluster.kind === "breach_shard") return 0.42 * variation;
  if (cluster.kind === "drone_wreck") return 0.42 * variation;
  if (cluster.kind === "barricade") return 0.38 * variation;
  return 0.32 * variation;
}

function landmarkGroundingScale(landmark: LandmarkDefinition): number {
  if (landmark.id === "treaty_monument") return 0.8;
  if (landmark.kind === "breach") return 1.28;
  if (landmark.kind === "terminal") return 1.04;
  if (landmark.id === "crashed_drone_yard") return 1.22;
  if (landmark.id === "barricade_corridor") return 1.06;
  return Math.max(0.72, landmark.radius * 0.22);
}

function propScaleForCluster(cluster: PropClusterDefinition, index: number): number {
  const variation = index % 2 === 0 ? 1 : 0.88;
  if (cluster.kind === "terminal_array") return 0.32 * variation;
  if (cluster.kind === "breach_shard") return 0.38 * variation;
  if (cluster.kind === "drone_wreck") return 0.38 * variation;
  return 0.34 * variation;
}

function propYOffsetForCluster(cluster: PropClusterDefinition): number {
  if (cluster.kind === "terminal_array") return 3;
  if (cluster.kind === "breach_shard") return 4;
  return 2;
}

function clusterSetPieceScale(cluster: PropClusterDefinition): number {
  if (cluster.kind === "terminal_array") return productionPropScale("emergency_alignment_terminal");
  if (cluster.kind === "breach_shard") return productionPropScale("cosmic_breach_crack");
  if (cluster.kind === "drone_wreck") return productionPropScale("crashed_drone_yard");
  if (cluster.kind === "barricade") return productionPropScale("barricade_corridor");
  return 0.76;
}

function clusterSetPieceYOffset(cluster: PropClusterDefinition): number {
  if (cluster.kind === "terminal_array") return 10;
  if (cluster.kind === "breach_shard") return 12;
  if (cluster.kind === "drone_wreck") return 8;
  return 7;
}

function landmarkPropScale(propId: Milestone11PropId): number {
  return productionPropScale(propId);
}

function landmarkPropYOffset(propId: Milestone11PropId): number {
  if (propId === "emergency_alignment_terminal") return 8;
  if (propId === "cosmic_breach_crack") return 12;
  return 6;
}
