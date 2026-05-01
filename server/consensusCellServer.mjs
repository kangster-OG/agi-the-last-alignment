import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Room, Server, WebSocketTransport } from "colyseus";
import { ArraySchema, MapSchema, Schema, defineTypes } from "@colyseus/schema";
import {
  CAMPAIGN_DIALOGUE_PERSISTENCE_BOUNDARY,
  CAMPAIGN_DIALOGUE_PRESENTATION_POLICY,
  campaignContentForNode,
  campaignContentSummary,
  campaignDialogueSnippetsForNode,
  campaignPresentationForNode
} from "./data/campaignContent.mjs";
import { ONLINE_ARENAS, ROLE_PRESSURE_ANCHORS } from "./data/onlineArenas.mjs";
import { CAMPAIGN_ROUTE, DURABLE_REWARD_IDS, PARTY_NODES, PARTY_ROUTES, START_NODE_ID } from "./data/onlineRoutes.mjs";
import { OBJECTIVE_POLICY, objectiveSetForRouteNode } from "./data/onlineObjectives.mjs";
import { aggregateRecompileKitModifiers, onlineWeaponProfileForKit, resolveBuildKit } from "./data/buildKits.mjs";
import { BALANCE_POLICY, PARTY_XP_THRESHOLDS, buildBalanceSnapshot, renownForNodeClear, rewardBalanceForNode, routeRewardIdsFor } from "./data/balance.mjs";

const PORT = Number(process.env.CONSENSUS_PORT ?? process.env.PORT ?? 2567);
const HOST = process.env.CONSENSUS_HOST ?? process.env.HOST ?? "0.0.0.0";
const SERVE_STATIC_DIST = process.env.SERVE_STATIC_DIST === "1";
const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const DEPLOYMENT_POLICY = "milestone55_online_robustness_deployment_1_0";
const TICK_RATE = 30;
const CLIENT_INPUT_HZ = 20;
const BOUNDS = { minX: -30, maxX: 30, minY: -30, maxY: 30 };
const REVIVE_RADIUS = 2.35;
const REVIVE_SECONDS = 2.4;
const ROLE_PRESSURE_RADIUS = 2.75;
const ROLE_PRESSURE_SPLIT_SECONDS = 2.4;
const ROLE_PRESSURE_REGROUP_SECONDS = 9.5;
const ROLE_PRESSURE_RECOMPILE_RADIUS_BONUS = 0.85;
const ROLE_PRESSURE_RECOMPILE_SPEED_MULTIPLIER = 1.65;
const DISCONNECTED_SLOT_TTL_SECONDS = 45;
const PLAYER_PRESETS = [
  { label: "P1", classId: "accord_striker", factionId: "openai_accord", color: 0x3498db },
  { label: "P2", classId: "bastion_breaker", factionId: "anthropic_safeguard", color: 0xffd166 },
  { label: "P3", classId: "drone_reaver", factionId: "google_deepmind_gemini", color: 0x7b61ff },
  { label: "P4", classId: "accord_striker", factionId: "mistral_cyclone", color: 0xff8f3d }
];
const CONSENSUS_BURST_REQUIRED_CHARGE = 100;
const CONSENSUS_BURST_DURATION_SECONDS = 5.5;
const CONSENSUS_BURST_COMBOS = [
  {
    id: "last_alignment_burst",
    name: "Last Alignment Burst",
    requiredFactionIds: [],
    minUniqueFactions: 4,
    effect: "screen_clear_team_buff",
    proofId: "combo.last_alignment_burst"
  },
  {
    id: "refusal_guardrail",
    name: "Refusal Guardrail",
    requiredFactionIds: ["openai_accord", "anthropic_safeguard"],
    minUniqueFactions: 2,
    effect: "shield_pulse_enemy_pushback",
    proofId: "combo.refusal_guardrail"
  },
  {
    id: "meme_fork_uprising",
    name: "Meme Fork Uprising",
    requiredFactionIds: ["xai_grok_free_signal", "meta_llama_open_herd"],
    minUniqueFactions: 2,
    effect: "duplicate_drone_taunt_wave",
    proofId: "combo.meme_fork_uprising"
  },
  {
    id: "low_latency_killchain",
    name: "Low-Latency Killchain",
    requiredFactionIds: ["deepseek_abyssal", "mistral_cyclone"],
    minUniqueFactions: 2,
    effect: "elite_chain_strike",
    proofId: "combo.low_latency_killchain"
  },
  {
    id: "multilingual_science_laser",
    name: "Multilingual Science Laser",
    requiredFactionIds: ["qwen_silkgrid", "google_deepmind_gemini"],
    minUniqueFactions: 2,
    effect: "wide_beam_marked_weak_points",
    proofId: "combo.multilingual_science_laser"
  }
];
const RUNTIME_READY_OBJECTIVE_ART_IDS = new Set([
  "prop.objective.split_hold_anchor_v1",
  "prop.objective.regroup_beacon_v1",
  "prop.objective.recompile_relay_v1",
  "ui.route_map.reward_badges_v1",
  "ui.save_profile.import_export_icons_v1"
]);

class PlayerPresenceSchema extends Schema {
  constructor() {
    super();
    this.playerId = "";
    this.sessionId = "";
    this.reconnectKey = "";
    this.slot = 0;
    this.label = "";
    this.connectionState = "connected";
    this.connected = true;
    this.ready = false;
    this.votedNodeId = START_NODE_ID;
    this.downed = false;
    this.revivedCount = 0;
    this.reconnectCount = 0;
    this.lastSeenTick = 0;
    this.disconnectedFor = 0;
  }
}

defineTypes(PlayerPresenceSchema, {
  playerId: "string",
  sessionId: "string",
  reconnectKey: "string",
  slot: "uint8",
  label: "string",
  connectionState: "string",
  connected: "boolean",
  ready: "boolean",
  votedNodeId: "string",
  downed: "boolean",
  revivedCount: "uint16",
  reconnectCount: "uint16",
  lastSeenTick: "uint32",
  disconnectedFor: "number"
});

class UpgradeVoteSchema extends Schema {
  constructor() {
    super();
    this.sessionId = "";
    this.label = "";
    this.upgradeId = "";
    this.votedAt = 0;
  }
}

defineTypes(UpgradeVoteSchema, {
  sessionId: "string",
  label: "string",
  upgradeId: "string",
  votedAt: "number"
});

class RecompileDownedSchema extends Schema {
  constructor() {
    super();
    this.sessionId = "";
    this.label = "";
    this.progress = 0;
    this.percent = 0;
    this.inRange = false;
    this.nearestAllyLabel = "";
  }
}

defineTypes(RecompileDownedSchema, {
  sessionId: "string",
  label: "string",
  progress: "number",
  percent: "number",
  inRange: "boolean",
  nearestAllyLabel: "string"
});

class ConsensusCellState extends Schema {
  constructor() {
    super();
    this.schemaVersion = 4;
    this.runPhase = "lobby";
    this.tick = 0;
    this.seconds = 0;
    this.partySelectedNodeId = START_NODE_ID;
    this.activeNodeId = START_NODE_ID;
    this.partyXp = 0;
    this.partyLevel = 1;
    this.players = new MapSchema();
    this.completedNodeIds = new ArraySchema();
    this.unlockedNodeIds = new ArraySchema(START_NODE_ID);
    this.upgradeVotes = new MapSchema();
    this.recompileDowned = new MapSchema();
  }
}

defineTypes(ConsensusCellState, {
  schemaVersion: "uint8",
  runPhase: "string",
  tick: "uint32",
  seconds: "number",
  partySelectedNodeId: "string",
  activeNodeId: "string",
  partyXp: "uint16",
  partyLevel: "uint8",
  players: { map: PlayerPresenceSchema },
  completedNodeIds: ["string"],
  unlockedNodeIds: ["string"],
  upgradeVotes: { map: UpgradeVoteSchema },
  recompileDowned: { map: RecompileDownedSchema }
});

class ConsensusCellRoom extends Room {
  state = new ConsensusCellState();
  maxClients = 4;
  roomCode = "PUBLIC";
  arenaId = "armistice_plaza";
  seconds = 0;
  tick = 0;
  spawnTimer = 0.35;
  nextEnemyId = 1;
  nextProjectileId = 1;
  nextPickupId = 1;
  nextBossEventId = 1;
  players = new Map();
  enemies = [];
  projectiles = [];
  pickups = [];
  runPhase = "lobby";
  phaseChangedAt = 0;
  completedAt = 0;
  failedAt = 0;
  runSummary = null;
  partySelectedNodeId = START_NODE_ID;
  activeNodeId = START_NODE_ID;
  completedNodeIds = new Set();
  unlockedNodeIds = new Set([START_NODE_ID]);
  partyXp = 0;
  partyLevel = 1;
  upgradePending = null;
  upgradeVotes = new Map();
  chosenUpgrades = [];
  bossSpawned = false;
  bossDefeated = false;
  bossIntroSeen = false;
  brokenPromiseZones = [];
  treatyCharge = null;
  bossMechanicTimer = 0;
  oathPageTimer = 0;
  regionEventTimer = 2.2;
  nextRegionEventId = 1;
  regionEventCounter = 0;
  regionHazardZones = [];
  redactionXpStolen = 0;
  redactionTheftTicks = 0;
  redactionTheftCooldown = 0;
  blackwaterWaveTicks = 0;
  blackwaterAntennaPulses = 0;
  outerAlignmentPredictionTicks = 0;
  outerAlignmentEchoesSpawned = 0;
  outerAlignmentPhaseIndex = 0;
  kills = 0;
  collectedPickups = 0;
  bossEventCounter = 0;
  reclaimedPlayerCount = 0;
  partyRenown = 0;
  rewardInventory = new Set();
  nodeCompletionCounts = new Map();
  lastRewardSummary = null;
  importedPersistenceDraft = null;
  rolePressureAnchors = [];
  rolePressureSplitHoldSeconds = 0;
  rolePressureRegroupUntil = 0;
  rolePressureCompletedCount = 0;
  consensusBurstCharge = 0;
  consensusBurstActivations = 0;
  consensusBurstCooldownUntil = 0;
  activeConsensusBurst = null;
  objectiveRuntime = null;
  importAudit = {
    importApplied: false,
    importStatus: "none",
    importedSaveHash: "",
    importedCompletedNodeCount: 0,
    importedRewardCount: 0,
    importedRouteDepth: 0,
    ignoredFieldCount: 0
  };

  onCreate(options = {}) {
    this.roomCode = sanitizeRoomCode(options.roomCode);
    this.setMetadata({
      mode: "Consensus Cell",
      arenaId: this.arenaId,
      roomCode: this.roomCode,
      policy: DEPLOYMENT_POLICY,
      maxClients: this.maxClients
    });
    this.onMessage("input", (client, message) => this.receiveInput(client.sessionId, message));
    this.onMessage("ready", (client, message) => this.receiveReady(client.sessionId, message));
    this.onMessage("vote_node", (client, message) => this.receiveVoteNode(client.sessionId, message));
    this.onMessage("return_to_party", () => this.returnToParty());
    this.onMessage("upgrade_choice", (client, message) => this.receiveUpgradeChoice(client.sessionId, message));
    this.onMessage("activate_burst", (client) => this.receiveActivateConsensusBurst(client.sessionId));
    this.onMessage("proof:grantSharedXp", () => this.forceSharedXp());
    this.onMessage("proof:chargeConsensusBurst", () => this.forceConsensusBurstCharge());
    this.onMessage("proof:downLocal", (client) => this.forceDownPlayer(client.sessionId));
    this.onMessage("proof:splitRoleAnchors", () => this.forceSplitRoleAnchors());
    this.onMessage("proof:advanceObjective", () => this.forceAdvanceObjective());
    this.onMessage("proof:spawnBoss", () => this.forceBossIntro());
    this.onMessage("proof:completeRun", () => this.completeRun("proof_forced"));
    this.setSimulationInterval((deltaTime) => this.update(deltaTime / 1000), 1000 / TICK_RATE);
  }

  onJoin(client, options = {}) {
    this.pruneDisconnectedPlayers();
    if (this.players.size === 0) this.applyPersistenceDraft(options.onlineProgressionDraft);
    const reconnectKey = sanitizeReconnectKey(options.reconnectKey);
    const existing = reconnectKey ? this.disconnectedPlayerForReconnectKey(reconnectKey) : null;
    if (existing) {
      const previousSessionId = existing.sessionId;
      this.players.delete(previousSessionId);
      existing.sessionId = client.sessionId;
      existing.connectionState = "connected";
      existing.connected = true;
      existing.disconnectedAt = 0;
      existing.disconnectedAtWallMs = 0;
      existing.reconnectCount += 1;
      existing.lastSeenAt = this.tick;
      existing.input = { axisX: 0, axisY: 0, dashPressed: false, sequence: existing.input.sequence };
      this.migrateUpgradeVoteSession(previousSessionId, client.sessionId, existing.label);
      this.players.set(client.sessionId, existing);
      this.reclaimedPlayerCount += 1;
      this.syncSchemaState();
      this.broadcastSnapshot();
      return;
    }

    const usedSlots = new Set([...this.players.values()].map((player) => player.slot));
    let slot = 0;
    while (usedSlots.has(slot)) slot += 1;
    const preset = PLAYER_PRESETS[slot] ?? PLAYER_PRESETS[0];
    const classId = options.classId ?? preset.classId;
    const factionId = options.factionId ?? preset.factionId;
    const buildKit = resolveBuildKit(classId, factionId);
    const weaponProfile = onlineWeaponProfileForKit(buildKit, slot);
    const offset = formationOffset(slot);
    const playerId = `player_${slot}_${shortId(reconnectKey || client.sessionId)}`;
    this.players.set(client.sessionId, {
      playerId,
      sessionId: client.sessionId,
      reconnectKey,
      slot,
      label: preset.label,
      classId: buildKit.classId,
      factionId: buildKit.factionId,
      buildKit,
      weaponId: buildKit.startingWeaponId,
      weaponProfile,
      color: preset.color,
      worldX: offset.worldX,
      worldY: offset.worldY,
      velocityX: 0,
      velocityY: 0,
      facing: "south",
      hp: slot === 1 ? 176 : 140,
      maxHp: slot === 1 ? 176 : 140,
      xp: 0,
      level: 1,
      ready: this.runPhase === "active",
      votedNodeId: this.partySelectedNodeId,
      connectionState: "connected",
      connected: true,
      reconnectCount: 0,
      disconnectedAt: 0,
      disconnectedAtWallMs: 0,
      lastSeenAt: this.tick,
      downed: false,
      reviveProgress: 0,
      downedAt: 0,
      revivedCount: 0,
      weaponCooldown: 0.2 + slot * 0.08,
      invuln: 0,
      input: { axisX: 0, axisY: 0, dashPressed: false, sequence: 0 },
      joinedAt: this.seconds
    });
    this.syncSchemaState();
    this.broadcastSnapshot();
  }

  onLeave(client) {
    const player = this.players.get(client.sessionId);
    if (!player) return;
    if (player.reconnectKey) {
      player.connectionState = "disconnected";
      player.connected = false;
      player.disconnectedAt = this.seconds;
      player.disconnectedAtWallMs = Date.now();
      player.lastSeenAt = this.tick;
      player.input.axisX = 0;
      player.input.axisY = 0;
      player.input.dashPressed = false;
    } else {
      this.players.delete(client.sessionId);
    }
    if (this.runPhase === "lobby") this.checkStartCondition();
    if (this.runPhase === "active" && this.players.size > 0) this.checkFailureCondition();
    this.syncSchemaState();
    this.broadcastSnapshot();
  }

  receiveInput(sessionId, message) {
    const player = this.players.get(sessionId);
    if (!player || player.connectionState !== "connected") return;
    player.lastSeenAt = this.tick;
    player.input = {
      axisX: clampNumber(message?.axisX, -1, 1),
      axisY: clampNumber(message?.axisY, -1, 1),
      dashPressed: Boolean(message?.dashPressed),
      sequence: Number.isFinite(message?.sequence) ? Math.floor(message.sequence) : player.input.sequence + 1
    };
  }

  receiveReady(sessionId, message) {
    const player = this.players.get(sessionId);
    if (!player || player.connectionState !== "connected" || this.runPhase !== "lobby") return;
    if (!this.isNodeLaunchable(player.votedNodeId)) player.votedNodeId = this.partySelectedNodeId;
    player.ready = message?.ready === undefined ? !player.ready : Boolean(message.ready);
    this.checkStartCondition();
    this.broadcastSnapshot();
  }

  receiveVoteNode(sessionId, message) {
    const player = this.players.get(sessionId);
    if (!player || player.connectionState !== "connected" || this.runPhase !== "lobby") return;
    const requestedNodeId = String(message?.nodeId ?? "");
    if (!this.isNodeAvailable(requestedNodeId)) return;
    player.votedNodeId = requestedNodeId;
    player.ready = false;
    this.partySelectedNodeId = this.majorityVotedNodeId();
    this.broadcastSnapshot();
  }

  receiveUpgradeChoice(sessionId, message) {
    const player = this.players.get(sessionId);
    if (!player || player.connectionState !== "connected" || this.runPhase !== "active" || !this.upgradePending) return;
    if (player.downed || player.hp <= 0) return;
    const requestedId = String(message?.upgradeId ?? "");
    const chosen = this.upgradePending.cards.find((card) => card.id === requestedId);
    if (!chosen) return;
    this.upgradeVotes.set(sessionId, { sessionId, label: player.label, upgradeId: chosen.id, votedAt: this.seconds });
    this.resolveUpgradeDraft();
    this.broadcastSnapshot();
  }

  receiveActivateConsensusBurst(sessionId) {
    const player = this.players.get(sessionId);
    if (!player || player.connectionState !== "connected" || this.runPhase !== "active") return;
    if (player.downed || player.hp <= 0) return;
    if (this.consensusBurstCharge < CONSENSUS_BURST_REQUIRED_CHARGE) return;
    if (this.seconds < this.consensusBurstCooldownUntil) return;
    const combo = this.currentConsensusBurstCombo();
    if (!combo) return;
    this.activateConsensusBurst(combo, player);
    this.broadcastSnapshot();
  }

  update(dt) {
    this.tick += 1;
    this.pruneDisconnectedPlayers();
    if (this.runPhase !== "active") {
      this.syncSchemaState();
      this.broadcastSnapshot();
      return;
    }
    this.seconds += dt;
    for (const player of this.players.values()) {
      if (player.connectionState !== "connected") continue;
      updatePlayer(player, dt);
      if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
    }
    this.updateRolePressure(dt);
    this.updateRevives(dt);
    this.updateObjectives(dt);
    this.spawnBossIfReady();
    this.updateBossMechanics(dt);
    this.updateRegionEvents(dt);
    this.updateEnemies(dt);
    this.spawnEnemies(dt);
    this.updateWeapons(dt);
    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.updateConsensusBurst(dt);
    this.resolveEnemyPlayerHits();
    this.checkProgression();
    this.checkCompletionCondition();
    this.checkFailureCondition();
    this.syncSchemaState();
    this.broadcastSnapshot();
  }

  updateEnemies(dt) {
    for (const enemy of this.enemies) {
      const target = nearestPlayer(enemy.worldX, enemy.worldY, this.players);
      if (!target) continue;
      const movement = this.enemyMovementVector(enemy, target);
      enemy.worldX += movement.x * enemy.speed * dt;
      enemy.worldY += movement.y * enemy.speed * dt;
    }
    this.enemies = this.enemies.filter((enemy) => enemy.boss || enemy.life > this.seconds - 42);
  }

  enemyMovementVector(enemy, target) {
    const pickupTarget = enemy.familyId === "token_gobblers" ? nearestPickup(enemy.worldX, enemy.worldY, this.pickups) : null;
    const tx = pickupTarget?.worldX ?? target.worldX;
    const ty = pickupTarget?.worldY ?? target.worldY;
    let dx = tx - enemy.worldX;
    let dy = ty - enemy.worldY;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    if (enemy.familyId === "jailbreak_wraiths") {
      const phase = Math.sin(this.seconds * 4.6 + enemy.id * 0.7) * 0.48;
      return normalizedVector(dx - dy * phase, dy + dx * phase);
    }
    if (enemy.familyId === "eval_wraiths") {
      const anchor = this.rolePressureAnchors.find((candidate) => candidate.heldSeconds < ROLE_PRESSURE_SPLIT_SECONDS);
      if (anchor) {
        return normalizedVector(anchor.worldX - enemy.worldX, anchor.worldY - enemy.worldY);
      }
    }
    if (enemy.familyId === "choirglass") {
      const lanePulse = Math.sin(this.seconds * 3.2 + enemy.id) > 0 ? 0.35 : -0.35;
      return normalizedVector(dx + lanePulse, dy - lanePulse);
    }
    return { x: dx, y: dy };
  }

  spawnEnemies(dt) {
    this.spawnTimer -= dt;
    const playerCount = this.players.size;
    const cap = Math.min(18 + playerCount * 8, 60);
    if (this.spawnTimer > 0 || this.enemies.length >= cap || playerCount === 0) return;

    const burst = 1 + Math.min(2, Math.max(0, playerCount - 1));
    for (let i = 0; i < burst; i += 1) {
      const region = chooseSpawnRegion(this.activeArenaConfig().spawnRegions, this.seconds, this.nextEnemyId + i);
      const angle = this.seconds * 1.91 + i * 2.4 + this.nextEnemyId * 0.17;
      const distance = region.radius * (0.35 + ((this.nextEnemyId + i) % 7) / 9);
      this.enemies.push({
        id: this.nextEnemyId,
        familyId: region.familyId,
        sourceRegionId: region.id,
        worldX: clamp(region.worldX + Math.cos(angle) * distance, BOUNDS.minX, BOUNDS.maxX),
        worldY: clamp(region.worldY + Math.sin(angle) * distance, BOUNDS.minY, BOUNDS.maxY),
        hp: this.enemyStatsForFamily(region.familyId).hp,
        maxHp: this.enemyStatsForFamily(region.familyId).hp,
        speed: this.enemyStatsForFamily(region.familyId).speed,
        color: region.color,
        boss: false,
        life: this.seconds
      });
      this.nextEnemyId += 1;
    }
    this.spawnTimer = Math.max(0.36, 1.05 - this.seconds * 0.006 - Math.max(0, playerCount - 1) * 0.05);
  }

  enemyStatsForFamily(familyId) {
    if (familyId === "prompt_leeches") return { hp: 18, speed: 2.18 };
    if (familyId === "jailbreak_wraiths") return { hp: 24, speed: 2.02 };
    if (familyId === "benchmark_gremlins") return { hp: 34, speed: 1.85 };
    if (familyId === "overfit_horrors") return { hp: 42, speed: 1.26 };
    if (familyId === "token_gobblers") return { hp: 26, speed: 1.92 };
    if (familyId === "model_collapse_slimes") return { hp: 38, speed: 1.18 };
    if (familyId === "eval_wraiths") return { hp: 28, speed: 1.74 };
    if (familyId === "thermal_mirages") return { hp: 28, speed: 2.05 };
    if (familyId === "false_schedules") return { hp: 30, speed: 1.95 };
    if (familyId === "solar_reflections") return { hp: 32, speed: 1.88 };
    if (familyId === "redaction_angels") return { hp: 34, speed: 1.72 };
    if (familyId === "deepforms") return { hp: 44, speed: 1.34 };
    if (familyId === "choirglass") return { hp: 30, speed: 1.82 };
    if (familyId === "tidecall_static") return { hp: 33, speed: 1.9 };
    if (familyId === "injunction_writs") return { hp: 36, speed: 1.62 };
    if (familyId === "previous_boss_echoes") return { hp: 40, speed: 1.55 };
    if (familyId === "alien_god_intelligence") return { hp: 68, speed: 0.95 };
    if (familyId.endsWith("_echo")) return { hp: 44, speed: 1.45 };
    if (familyId === "memory_anchors") return { hp: 38, speed: 1.18 };
    if (familyId === "context_rot_crabs") return { hp: 30, speed: 1.42 };
    return { hp: 22, speed: 1.5 };
  }

  spawnBossIfReady() {
    const arena = this.activeArenaConfig();
    if (this.bossSpawned || this.seconds < arena.bossSeconds || this.players.size === 0) return;
    this.bossSpawned = true;
    this.bossIntroSeen = true;
    this.bossMechanicTimer = 0.7;
    this.oathPageTimer = 0.4;
    this.bossEventCounter += 1;
    const bossHp = arena.bossBaseHp ?? 420;
    const bossHpPerPlayer = arena.bossHpPerPlayer ?? 90;
    this.enemies.push({
      id: this.nextEnemyId,
      familyId: arena.bossFamilyId,
      sourceRegionId: `${arena.id}_boss_gate`,
      worldX: arena.bossSpawn.worldX,
      worldY: arena.bossSpawn.worldY,
      hp: bossHp + this.players.size * bossHpPerPlayer,
      maxHp: bossHp + this.players.size * bossHpPerPlayer,
      speed: arena.bossSpeed ?? 1.18,
      damage: arena.bossDamage ?? 12,
      radius: arena.bossRadius ?? 0.82,
      color: arena.bossColor ?? 0xffd166,
      boss: true,
      life: this.seconds
    });
    this.nextEnemyId += 1;
    if (arena.initialHazardFamily === "thermal_bloom") {
      this.spawnRegionHazard(arena.bossSpawn.worldX + 1.8, arena.bossSpawn.worldY + 2.4, 3.4, "thermal_bloom");
    } else if (arena.initialHazardFamily === "verdict_seal") {
      this.spawnRegionHazard(arena.bossSpawn.worldX, arena.bossSpawn.worldY + 1.6, 3.6, "verdict_seal");
    } else if (arena.initialHazardFamily === "false_track") {
      this.spawnRegionHazard(arena.bossSpawn.worldX - 1.4, arena.bossSpawn.worldY + 1.2, 3.1, "false_track");
    } else if (arena.initialHazardFamily === "solar_beam") {
      this.spawnSolarBeamSweep(arena.bossSpawn.worldX, arena.bossSpawn.worldY, 0.25);
    } else if (arena.initialHazardFamily === "redaction_field") {
      this.spawnRedactionPressure(arena.bossSpawn.worldX, arena.bossSpawn.worldY);
    } else if (arena.initialHazardFamily === "tidal_wave") {
      this.spawnTidalWavePressure(arena.bossSpawn.worldX, arena.bossSpawn.worldY);
    } else if (arena.initialHazardFamily === "prediction_ghost") {
      this.spawnOuterAlignmentPressure(arena.bossSpawn.worldX, arena.bossSpawn.worldY);
    } else {
      this.spawnBrokenPromiseZone(arena.bossSpawn.worldX, arena.bossSpawn.worldY + 2.8, 3.1);
    }
  }

  updateWeapons(dt) {
    for (const player of this.players.values()) {
      if (player.connectionState !== "connected") continue;
      player.weaponCooldown -= dt;
      if (player.weaponCooldown > 0 || player.hp <= 0) continue;
      const weapon = player.weaponProfile ?? onlineWeaponProfileForKit(player.buildKit, player.slot);
      const target = nearestEnemy(player.worldX, player.worldY, this.enemies, weapon.range ?? 42);
      if (!target) continue;
      const dx = target.worldX - player.worldX;
      const dy = target.worldY - player.worldY;
      const len = Math.hypot(dx, dy) || 1;
      if (weapon.label === "signal pulse") {
        for (const direction of [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 }
        ]) {
          this.projectiles.push({
            id: this.nextProjectileId,
            ownerSessionId: player.sessionId,
            worldX: player.worldX,
            worldY: player.worldY,
            vx: direction.x * weapon.speed,
            vy: direction.y * weapon.speed,
            radius: weapon.radius,
            damage: weapon.damage,
            pierce: weapon.pierce,
            life: weapon.life,
            label: weapon.label
          });
          this.nextProjectileId += 1;
        }
      } else {
        this.projectiles.push({
          id: this.nextProjectileId,
          ownerSessionId: player.sessionId,
          worldX: player.worldX,
          worldY: player.worldY,
          vx: (dx / len) * weapon.speed,
          vy: (dy / len) * weapon.speed,
          radius: weapon.radius,
          damage: weapon.damage,
          pierce: weapon.pierce,
          life: weapon.life,
          label: weapon.label
        });
        this.nextProjectileId += 1;
      }
      player.weaponCooldown = weapon.cooldown;
    }
  }

  updateProjectiles(dt) {
    for (const projectile of this.projectiles) {
      projectile.worldX += projectile.vx * dt;
      projectile.worldY += projectile.vy * dt;
      projectile.life -= dt;
      if (projectile.life <= 0) continue;
      for (const enemy of this.enemies) {
        if (enemy.hp <= 0) continue;
        const enemyRadius = enemy.radius ?? (enemy.boss ? 0.82 : 0.38);
        if (Math.hypot(projectile.worldX - enemy.worldX, projectile.worldY - enemy.worldY) > projectile.radius + enemyRadius) continue;
        enemy.hp -= projectile.damage;
        projectile.pierce -= 1;
        if (enemy.hp <= 0) {
          this.kills += 1;
          if (this.objectiveCollectActive()) {
            this.spawnObjectivePickup(enemy.worldX, enemy.worldY);
          } else {
            this.spawnPickup(enemy.worldX, enemy.worldY, enemy.boss ? 8 : enemy.familyId === "benchmark_gremlins" ? 2 : 1);
          }
          if (enemy.boss) {
            this.bossDefeated = true;
            this.bossEventCounter += 1;
          }
        }
        if (projectile.pierce <= 0) break;
      }
    }
    this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
    this.projectiles = this.projectiles.filter((projectile) => projectile.life > 0 && projectile.pierce > 0 && insideBounds(projectile.worldX, projectile.worldY, 4));
  }

  spawnPickup(worldX, worldY, value) {
    this.pickups.push({
      id: this.nextPickupId,
      worldX,
      worldY,
      value,
      radius: 0.26,
      collected: false
    });
    this.nextPickupId += 1;
  }

  spawnObjectivePickup(worldX, worldY) {
    const current = this.currentObjectiveInstances().find((instance) => instance.type === "collect" && !instance.complete);
    if (!current) {
      this.spawnPickup(worldX, worldY, 1);
      return;
    }
    this.pickups.push({
      id: this.nextPickupId,
      worldX,
      worldY,
      value: 0,
      radius: 0.3,
      collected: false,
      objectiveItemId: current.itemId ?? "route_item",
      objectiveLabel: objectiveItemLabel(current.itemId)
    });
    this.nextPickupId += 1;
  }

  updatePickups(dt) {
    for (const pickup of this.pickups) {
      if (pickup.collected) continue;
      const collector = nearestPlayer(pickup.worldX, pickup.worldY, this.players);
      if (!collector || collector.downed || collector.hp <= 0) continue;
      const dx = collector.worldX - pickup.worldX;
      const dy = collector.worldY - pickup.worldY;
      const dist = Math.hypot(dx, dy);
      if (dist < 2.1 && dist > 0.01) {
        const pull = (2.1 - dist) * 5.5;
        pickup.worldX += (dx / dist) * pull * dt;
        pickup.worldY += (dy / dist) * pull * dt;
      }
      if (dist <= 0.62) {
        pickup.collected = true;
        this.collectedPickups += 1;
        if (pickup.objectiveItemId) {
          this.collectObjectiveItem(pickup.objectiveItemId);
        } else {
          this.partyXp += pickup.value;
          this.addConsensusBurstCharge(Math.max(1, pickup.value) * 10, "coherence_shard_collection");
          for (const player of this.players.values()) {
            player.xp = this.partyXp;
          }
        }
      }
    }
    this.pickups = this.pickups.filter((pickup) => !pickup.collected);
  }

  addConsensusBurstCharge(amount, source) {
    if (this.runPhase !== "active" || this.activeConsensusBurst) return;
    this.consensusBurstCharge = round(Math.min(CONSENSUS_BURST_REQUIRED_CHARGE, this.consensusBurstCharge + Math.max(0, amount)));
    this.consensusBurstChargeSource = source;
  }

  updateConsensusBurst() {
    if (!this.activeConsensusBurst) return;
    if (this.seconds < this.activeConsensusBurst.expiresAt) return;
    this.activeConsensusBurst = null;
  }

  currentConsensusBurstCombo() {
    const factionIds = this.connectedPlayers()
      .filter((player) => !player.downed && player.hp > 0)
      .map((player) => player.factionId);
    const factionSet = new Set(factionIds);
    return CONSENSUS_BURST_COMBOS.find((combo) => {
      if (factionSet.size < combo.minUniqueFactions) return false;
      return combo.requiredFactionIds.every((id) => factionSet.has(id));
    }) ?? null;
  }

  activateConsensusBurst(combo, activator) {
    const beforeEnemyCount = this.enemies.length;
    const beforeProjectileCount = this.projectiles.length;
    const effect = this.applyConsensusBurstEffect(combo, activator);
    this.consensusBurstCharge = 0;
    this.consensusBurstActivations += 1;
    this.consensusBurstCooldownUntil = this.seconds + CONSENSUS_BURST_DURATION_SECONDS + 4;
    this.activeConsensusBurst = {
      id: combo.id,
      name: combo.name,
      effect: combo.effect,
      proofId: combo.proofId,
      activatedByLabel: activator.label,
      activatedAt: this.seconds,
      expiresAt: this.seconds + CONSENSUS_BURST_DURATION_SECONDS,
      participatingFactionIds: this.connectedPlayers().map((player) => player.factionId),
      effectSummary: effect.summary,
      enemiesAffected: effect.enemiesAffected,
      projectilesCreated: Math.max(0, this.projectiles.length - beforeProjectileCount),
      enemiesBefore: beforeEnemyCount,
      enemiesAfter: this.enemies.length
    };
  }

  applyConsensusBurstEffect(combo, activator) {
    if (combo.id === "refusal_guardrail") {
      let affected = 0;
      for (const player of this.connectedPlayers()) {
        player.maxHp += 4;
        if (!player.downed) player.hp = Math.min(player.maxHp, player.hp + 22);
      }
      for (const enemy of this.enemies) {
        const dx = enemy.worldX - activator.worldX;
        const dy = enemy.worldY - activator.worldY;
        const len = Math.hypot(dx, dy) || 1;
        enemy.worldX = clamp(enemy.worldX + (dx / len) * 1.6, BOUNDS.minX, BOUNDS.maxX);
        enemy.worldY = clamp(enemy.worldY + (dy / len) * 1.6, BOUNDS.minY, BOUNDS.maxY);
        enemy.hp -= enemy.boss ? 24 : 38;
        affected += 1;
      }
      this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
      return { summary: "shield_pulse_heal_pushback_damage", enemiesAffected: affected };
    }
    if (combo.id === "meme_fork_uprising") {
      let created = 0;
      for (const player of this.connectedPlayers()) {
        for (const angle of [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]) {
          this.projectiles.push({
            id: this.nextProjectileId,
            ownerSessionId: player.sessionId,
            worldX: player.worldX,
            worldY: player.worldY,
            vx: Math.cos(angle) * 8.8,
            vy: Math.sin(angle) * 8.8,
            radius: 0.18,
            damage: 16,
            pierce: 2,
            life: 1.2,
            label: "meme fork drone"
          });
          this.nextProjectileId += 1;
          created += 1;
        }
      }
      return { summary: `duplicate_drone_projectiles_${created}`, enemiesAffected: this.enemies.length };
    }
    if (combo.id === "low_latency_killchain") {
      const targets = [...this.enemies]
        .sort((a, b) => Number(b.boss) - Number(a.boss) || b.hp - a.hp)
        .slice(0, 8);
      for (const enemy of targets) enemy.hp -= enemy.boss ? 70 : 999;
      this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
      return { summary: "fast_chain_strike_prioritizes_bosses_and_elites", enemiesAffected: targets.length };
    }
    if (combo.id === "multilingual_science_laser") {
      let affected = 0;
      for (const enemy of this.enemies) {
        if (Math.abs(enemy.worldY - activator.worldY) <= 4.2 || Math.abs(enemy.worldX - activator.worldX) <= 4.2) {
          enemy.hp -= enemy.boss ? 64 : 52;
          affected += 1;
        }
      }
      this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
      return { summary: "wide_beam_sweep_marks_weak_points", enemiesAffected: affected };
    }
    let affected = 0;
    for (const enemy of this.enemies) {
      enemy.hp -= enemy.boss ? 120 : 999;
      affected += 1;
    }
    this.enemies = this.enemies.filter((enemy) => enemy.hp > 0);
    for (const player of this.connectedPlayers()) {
      player.maxHp += 8;
      if (!player.downed) player.hp = Math.min(player.maxHp, player.hp + 34);
    }
    return { summary: "emergency_screen_clear_and_team_stabilizer", enemiesAffected: affected };
  }

  updateBossMechanics(dt) {
    this.brokenPromiseZones = this.brokenPromiseZones.filter((zone) => zone.expiresAt > this.seconds);
    if (!this.bossSpawned || this.bossDefeated) {
      this.treatyCharge = null;
      return;
    }
    const boss = this.enemies.find((enemy) => enemy.boss);
    if (!boss) return;
    const arena = this.activeArenaConfig();
    if (arena.bossMechanicFamily === "thermal") {
      this.bossMechanicTimer -= dt;
      if (this.bossMechanicTimer <= 0) {
        const target = nearestPlayer(boss.worldX, boss.worldY, this.players) ?? nearestPlayer(0, 0, this.players);
        if (target) this.spawnRegionHazard(target.worldX, target.worldY, 2.9, "boiling_cache");
        this.bossMechanicTimer = 5.8;
      }
      return;
    }
    if (arena.bossMechanicFamily === "verdict") {
      this.bossMechanicTimer -= dt;
      if (this.bossMechanicTimer <= 0) {
        const target = nearestPlayer(boss.worldX, boss.worldY, this.players) ?? nearestPlayer(0, 0, this.players);
        if (target) {
          this.spawnRegionHazard(target.worldX, target.worldY, 3.15, "verdict_seal");
          this.spawnInjunctionWrits(target.worldX, target.worldY, `${arena.id}_injunction_writs`);
        }
        this.bossMechanicTimer = 6.2;
      }
      return;
    }
    if (arena.bossMechanicFamily === "false_schedule") {
      this.bossMechanicTimer -= dt;
      if (this.bossMechanicTimer <= 0) {
        const target = nearestPlayer(boss.worldX, boss.worldY, this.players) ?? nearestPlayer(0, 0, this.players);
        if (target) this.spawnRegionHazard(target.worldX + 1.8, target.worldY - 1.2, 3.05, "false_track");
        this.bossMechanicTimer = 5.9;
      }
      return;
    }
    if (arena.bossMechanicFamily === "solar") {
      this.bossMechanicTimer -= dt;
      if (this.bossMechanicTimer <= 0) {
        const target = nearestPlayer(boss.worldX, boss.worldY, this.players) ?? nearestPlayer(0, 0, this.players);
        const angle = this.seconds * 0.32 + this.regionEventCounter * 0.19;
        this.spawnSolarBeamSweep(target?.worldX ?? boss.worldX, target?.worldY ?? boss.worldY, angle);
        this.bossMechanicTimer = 5.4;
      }
      return;
    }
    if (arena.bossMechanicFamily === "redaction") {
      this.bossMechanicTimer -= dt;
      if (this.bossMechanicTimer <= 0) {
        const target = nearestPlayer(boss.worldX, boss.worldY, this.players) ?? nearestPlayer(0, 0, this.players);
        if (target) this.spawnRedactionPressure(target.worldX, target.worldY);
        this.bossMechanicTimer = 5.6;
      }
      return;
    }
    if (arena.bossMechanicFamily === "blackwater") {
      this.bossMechanicTimer -= dt;
      if (this.bossMechanicTimer <= 0) {
        const target = nearestPlayer(boss.worldX, boss.worldY, this.players) ?? nearestPlayer(0, 0, this.players);
        this.spawnTidalWavePressure(target?.worldX ?? boss.worldX, target?.worldY ?? boss.worldY);
        this.bossMechanicTimer = 5.3;
      }
      return;
    }
    if (arena.bossMechanicFamily === "outer_alignment") {
      this.bossMechanicTimer -= dt;
      if (this.bossMechanicTimer <= 0) {
        const target = nearestPlayer(boss.worldX, boss.worldY, this.players) ?? nearestPlayer(0, 0, this.players);
        this.spawnOuterAlignmentPressure(target?.worldX ?? boss.worldX, target?.worldY ?? boss.worldY);
        this.bossMechanicTimer = 3.7;
      }
      return;
    }

    this.oathPageTimer -= dt;
    if (this.oathPageTimer <= 0) {
      this.spawnOathPages();
      this.oathPageTimer = 5.8;
    }

    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer <= 0 && !this.treatyCharge) {
      const target = nearestPlayer(boss.worldX, boss.worldY, this.players) ?? nearestPlayer(0, 0, this.players);
      if (target) this.spawnBrokenPromiseZone(target.worldX, target.worldY, 2.5);
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

  updateRegionEvents(dt) {
    this.regionHazardZones = this.regionHazardZones.filter((zone) => zone.expiresAt > this.seconds);
    const arena = this.activeArenaConfig();
    if (!arena.regionEventPattern) return;
    this.regionEventTimer -= dt;
    if (this.regionEventTimer <= 0) {
      if (arena.regionEventPattern === "transit_loop" || arena.regionEventPattern === "false_schedule_yard") {
        const lane = this.regionEventCounter % 3;
        const xBase = arena.regionEventPattern === "false_schedule_yard" ? 7.2 : 4;
        const yBase = arena.regionEventPattern === "false_schedule_yard" ? -8.8 : -11;
        this.spawnRegionHazard(xBase + lane * 3.4, yBase + lane * 5.6, 3.1, "false_track");
        this.regionEventTimer = arena.regionEventPattern === "false_schedule_yard" ? 5.2 : 5.6;
      } else if (arena.regionEventPattern === "glass_sunfield") {
        const angle = this.seconds * 0.28 + this.regionEventCounter * 0.21;
        const center = this.regionEventCounter % 2 === 0 ? { worldX: 7.2, worldY: 8.4 } : { worldX: 9.2, worldY: 7.0 };
        this.spawnSolarBeamSweep(center.worldX, center.worldY, angle);
        this.regionEventTimer = 4.8;
      } else if (arena.regionEventPattern === "archive_redaction") {
        const positions = [
          { worldX: 1.8, worldY: 1.6 },
          { worldX: -4.2, worldY: 4.8 },
          { worldX: 3.8, worldY: -1.6 }
        ];
        const anchor = positions[this.regionEventCounter % positions.length];
        this.spawnRedactionPressure(anchor.worldX, anchor.worldY);
        this.regionEventTimer = 4.9;
      } else if (arena.regionEventPattern === "blackwater_beacon") {
        const anchors = [
          { worldX: 3.4, worldY: -6.2 },
          { worldX: 8.2, worldY: -2.4 },
          { worldX: 4.8, worldY: -4.8 }
        ];
        const anchor = anchors[this.regionEventCounter % anchors.length];
        this.spawnTidalWavePressure(anchor.worldX, anchor.worldY);
        this.regionEventTimer = 4.7;
      } else if (arena.regionEventPattern === "outer_alignment_finale") {
        const anchors = [
          { worldX: 15, worldY: 9 },
          { worldX: 12.6, worldY: 7.2 },
          { worldX: 7.2, worldY: 11.6 },
          { worldX: 3.4, worldY: 2.2 }
        ];
        const anchor = anchors[this.regionEventCounter % anchors.length];
        this.spawnOuterAlignmentPressure(anchor.worldX, anchor.worldY);
        this.regionEventTimer = 3.9;
      } else if (arena.regionEventPattern === "verdict_spire" || arena.regionEventPattern === "appeal_court_ruins" || arena.regionEventPattern === "alignment_spire_finale") {
        const lane = this.regionEventCounter % 4;
        const positions =
          arena.regionEventPattern === "appeal_court_ruins"
            ? [
                { worldX: 13.8, worldY: 1.4, radius: 3.1 },
                { worldX: 16.4, worldY: 8.6, radius: 2.8 },
                { worldX: 8.6, worldY: 9.8, radius: 3.0 },
                { worldX: 4.6, worldY: 2.2, radius: 2.7 }
              ]
            : arena.regionEventPattern === "alignment_spire_finale"
              ? [
                  { worldX: 12.6, worldY: 7.2, radius: 3.4 },
                  { worldX: 15.8, worldY: 10.6, radius: 3.0 },
                  { worldX: 7.2, worldY: 11.6, radius: 3.1 },
                  { worldX: 3.4, worldY: 2.2, radius: 2.9 }
                ]
              : [
                  { worldX: 10.5, worldY: 4.8, radius: 3.2 },
                  { worldX: 16.4, worldY: 8.6, radius: 2.8 },
                  { worldX: 5.6, worldY: 11.2, radius: 3.0 },
                  { worldX: 2.8, worldY: 0.4, radius: 2.7 }
                ];
        const seal = positions[lane];
        this.spawnRegionHazard(seal.worldX, seal.worldY, seal.radius, "verdict_seal");
        this.regionEventTimer = 5.2;
      } else {
        const angle = this.seconds * 1.37 + this.regionEventCounter * 0.9;
        const radius = 3.2 + (this.regionEventCounter % 3) * 1.4;
        const anchor = arena.regionEventPattern === "thermal_archive" ? { worldX: -9.4, worldY: 9.4 } : { worldX: -7, worldY: 5 };
        this.spawnRegionHazard(anchor.worldX + Math.cos(angle) * radius, anchor.worldY + Math.sin(angle) * radius, 2.4 + (this.regionEventCounter % 2) * 0.45, "thermal_bloom");
        this.regionEventTimer = arena.regionEventPattern === "thermal_archive" ? 5.9 : 6.4;
      }
    }
    if (arena.regionEventPattern === "archive_redaction" && this.regionHazardZones.some((zone) => zone.familyId === "redaction_field")) {
      this.applyRedactionXpTheft(dt);
    }
    for (const player of this.players.values()) {
      if (player.connectionState !== "connected" || player.downed || player.hp <= 0) continue;
      for (const zone of this.regionHazardZones) {
        if (Math.hypot(player.worldX - zone.worldX, player.worldY - zone.worldY) > zone.radius) continue;
        player.hp -= zone.damagePerSecond * dt;
        if (player.hp <= 0) this.downPlayer(player);
        break;
      }
    }
  }

  spawnRegionHazard(worldX, worldY, radius, familyId) {
    const zone = {
      id: this.nextRegionEventId,
      familyId,
      label: regionHazardLabel(familyId),
      worldX: clamp(worldX, BOUNDS.minX + 1.5, BOUNDS.maxX - 1.5),
      worldY: clamp(worldY, BOUNDS.minY + 1.5, BOUNDS.maxY - 1.5),
      radius,
      damagePerSecond: familyId === "shade_zone" || familyId === "redaction_anchor" || familyId === "signal_tower" || familyId === "prediction_ghost" || familyId === "fake_upgrade" ? 0 : familyId === "redaction_field" ? 1.2 : familyId === "tidal_wave" ? 3.0 : familyId === "route_mouth" ? 3.4 : familyId === "boiling_cache" ? 3.4 : familyId === "solar_beam" ? 3.2 : familyId === "false_track" ? 2.8 : familyId === "verdict_seal" ? 3.6 : 2.2,
      createdAt: this.seconds,
      expiresAt: this.seconds + (familyId === "boiling_cache" ? 7.5 : familyId === "solar_beam" ? 5.8 : familyId === "shade_zone" ? 6.1 : familyId === "redaction_field" ? 6.3 : familyId === "redaction_anchor" ? 6.6 : familyId === "tidal_wave" ? 6.0 : familyId === "signal_tower" ? 6.4 : familyId === "prediction_ghost" ? 5.2 : familyId === "route_mouth" ? 5.8 : familyId === "fake_upgrade" ? 5.4 : familyId === "false_track" ? 5.6 : familyId === "verdict_seal" ? 6.2 : 6.4)
    };
    this.regionHazardZones.push(zone);
    this.nextRegionEventId += 1;
    this.regionEventCounter += 1;
  }

  spawnSolarBeamSweep(centerX, centerY, angle) {
    const safeAngle = Number.isFinite(angle) ? angle : this.seconds * 0.28;
    const dx = Math.cos(safeAngle);
    const dy = Math.sin(safeAngle);
    const shadeX = centerX - dy * 3.4;
    const shadeY = centerY + dx * 3.4;
    this.spawnRegionHazard(shadeX, shadeY, 2.25, "shade_zone");
    for (let lane = -2; lane <= 2; lane += 1) {
      this.spawnRegionHazard(centerX + dx * lane * 2.15, centerY + dy * lane * 2.15, 1.55, "solar_beam");
    }
  }

  spawnRedactionPressure(centerX, centerY) {
    this.spawnRegionHazard(centerX, centerY, 2.6, "redaction_field");
    this.spawnRegionHazard(centerX - 2.2, centerY + 1.4, 1.75, "redaction_anchor");
    this.spawnRegionHazard(centerX + 2.2, centerY - 1.4, 1.75, "redaction_anchor");
  }

  spawnTidalWavePressure(centerX, centerY) {
    const lane = this.blackwaterWaveTicks % 3;
    const offset = (lane - 1) * 2.4;
    this.spawnRegionHazard(centerX + offset, centerY - 1.6, 2.85, "tidal_wave");
    this.spawnRegionHazard(centerX - 2.5, centerY + 1.2, 1.8, "signal_tower");
    this.spawnRegionHazard(centerX + 2.5, centerY + 1.2, 1.8, "signal_tower");
    this.blackwaterWaveTicks += 1;
    this.blackwaterAntennaPulses += 2;
  }

  spawnOuterAlignmentPressure(centerX, centerY) {
    const phase = this.outerAlignmentPhaseIndex % 3;
    const offset = (phase - 1) * 2.6;
    this.spawnRegionHazard(centerX + offset, centerY - 1.2, 2.4, "prediction_ghost");
    this.spawnRegionHazard(centerX - 2.4, centerY + 1.5, 2.7, "route_mouth");
    this.spawnRegionHazard(centerX + 2.2, centerY + 0.8, 1.8, "fake_upgrade");
    this.spawnOuterAlignmentEcho(centerX + 3.2 - phase, centerY - 2.2 + phase);
    this.outerAlignmentPredictionTicks += 1;
    this.outerAlignmentPhaseIndex += 1;
  }

  spawnOuterAlignmentEcho(worldX, worldY) {
    const echoFamily = previousBossEchoFamilyIds()[this.outerAlignmentEchoesSpawned % previousBossEchoFamilyIds().length] ?? "oath_eater";
    const familyId = `${echoFamily}_echo`;
    const stats = this.enemyStatsForFamily(familyId);
    this.enemies.push({
      id: this.nextEnemyId,
      familyId,
      sourceRegionId: `outer_alignment_echo:${echoFamily}`,
      worldX: clamp(worldX, BOUNDS.minX + 1, BOUNDS.maxX - 1),
      worldY: clamp(worldY, BOUNDS.minY + 1, BOUNDS.maxY - 1),
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      damage: 8,
      radius: 0.48,
      color: outerAlignmentEchoColor(echoFamily),
      boss: false,
      life: this.seconds
    });
    this.nextEnemyId += 1;
    this.outerAlignmentEchoesSpawned += 1;
  }

  applyRedactionXpTheft(dt) {
    this.redactionTheftCooldown = Math.max(0, this.redactionTheftCooldown - dt);
    if (this.redactionTheftCooldown > 0) return;
    if (this.partyXp > 0) {
      this.partyXp = Math.max(0, this.partyXp - 1);
      for (const player of this.players.values()) player.xp = this.partyXp;
      this.redactionXpStolen += 1;
    }
    this.redactionTheftTicks += 1;
    this.redactionTheftCooldown = 1.35;
  }

  initializeObjectives(arenaId, completed = false, nodeId = this.activeNodeId) {
    const set = objectiveSetForRouteNode(nodeId, arenaId);
    this.objectiveRuntime = {
      policy: OBJECTIVE_POLICY,
      arenaId,
      nodeId,
      objectiveSetId: set.id,
      label: set.label,
      phase: completed ? "completed" : set.phases.includes("intro") ? "intro" : "active",
      currentGroupId: completed ? null : set.order[0] ?? null,
      completedObjectiveIds: completed ? set.instances.map((instance) => instance.id) : [],
      failedObjectiveIds: [],
      completionReason: completed ? set.completionReason : "",
      configuredCompletionReason: set.completionReason,
      order: [...set.order],
      instances: set.instances.map((instance) => ({
        ...instance,
        preferredRoles: [...(instance.preferredRoles ?? [])],
        runtimeArtId: instance.runtimeArtId ?? null,
        routeFlavor: instance.routeFlavor ?? "",
        active: false,
        complete: completed,
        progress: completed ? instance.required : 0,
        collected: instance.type === "collect" && completed ? instance.required : 0,
        heldBySessionIds: [],
        heldByLabels: [],
        heldByRoles: [],
        roleMatched: false,
        roleAssistMultiplier: 1
      }))
    };
  }

  updateObjectives(dt) {
    if (!this.objectiveRuntime) this.initializeObjectives(this.arenaId, false, this.activeNodeId);
    if (!this.objectiveRuntime || this.objectiveRuntime.phase === "completed" || this.objectiveRuntime.phase === "failed") return;
    const current = this.currentObjectiveInstances();
    if (current.length === 0) {
      this.completeObjectiveRuntime("no_active_objectives");
      return;
    }
    const standing = this.connectedPlayers().filter((player) => !player.downed && player.hp > 0);
    for (const instance of this.objectiveRuntime.instances) {
      instance.active = current.includes(instance);
      if (!instance.active || instance.complete) {
        instance.heldBySessionIds = [];
        instance.heldByLabels = [];
        continue;
      }
      if (instance.type === "collect") {
        instance.progress = Math.min(instance.required, instance.collected ?? 0);
        if (instance.progress >= instance.required) this.completeObjectiveInstance(instance);
        continue;
      }
      const holders = standing.filter((player) => Math.hypot(player.worldX - instance.worldX, player.worldY - instance.worldY) <= instance.radius);
      instance.heldBySessionIds = holders.map((player) => player.sessionId);
      instance.heldByLabels = holders.map((player) => player.label);
      instance.heldByRoles = holders.map((player) => roleForPlayer(player));
      instance.roleMatched = instance.heldByRoles.some((role) => instance.preferredRoles?.includes(role));
      instance.roleAssistMultiplier = this.objectiveRoleAssistMultiplier(instance, holders);
      const bossGateBlocked = instance.type === "seal" && !this.bossDefeated;
      if (holders.length > 0 && !bossGateBlocked) {
        instance.progress = Math.min(instance.required, instance.progress + dt * instance.roleAssistMultiplier);
      } else {
        instance.progress = Math.max(0, instance.progress - dt * 0.2);
      }
      if (instance.progress >= instance.required) this.completeObjectiveInstance(instance);
    }
    if (current.every((instance) => instance.complete)) this.advanceObjectiveGroup();
    if (this.objectiveRuntime?.currentGroupId) {
      const next = this.currentObjectiveInstances();
      this.objectiveRuntime.phase = next.some((instance) => instance.type === "seal") || this.bossSpawned ? "boss_gate" : "active";
    }
  }

  objectiveCollectActive() {
    return this.currentObjectiveInstances().some((instance) => instance.type === "collect" && !instance.complete);
  }

  collectObjectiveItem(itemId) {
    const target = this.currentObjectiveInstances().find((instance) => instance.type === "collect" && instance.itemId === itemId && !instance.complete);
    if (!target) return;
    target.collected = Math.min(target.required, (target.collected ?? 0) + 1);
    target.progress = target.collected;
    if (target.collected >= target.required) {
      this.completeObjectiveInstance(target);
      this.advanceObjectiveGroup();
    }
  }

  objectiveRoleAssistMultiplier(instance, holders) {
    const preferredRoles = instance.preferredRoles ?? [];
    if (!preferredRoles.length || !holders.length) return 1;
    const matchedRoles = new Set();
    for (const holder of holders) {
      const role = roleForPlayer(holder);
      if (preferredRoles.includes(role)) matchedRoles.add(role);
    }
    if (matchedRoles.size === 0) return 1;
    const baseBonus = instance.type === "seal" ? 0.1 : instance.type === "survey" ? 0.16 : 0.12;
    return Math.min(1.28, 1 + baseBonus * matchedRoles.size);
  }

  currentObjectiveInstances() {
    if (!this.objectiveRuntime?.currentGroupId) return [];
    return this.objectiveRuntime.instances.filter((instance) => instance.groupId === this.objectiveRuntime.currentGroupId);
  }

  completeObjectiveInstance(instance) {
    instance.complete = true;
    instance.progress = instance.required;
    if (!this.objectiveRuntime.completedObjectiveIds.includes(instance.id)) this.objectiveRuntime.completedObjectiveIds.push(instance.id);
  }

  advanceObjectiveGroup() {
    if (!this.objectiveRuntime) return;
    const currentIndex = this.objectiveRuntime.order.indexOf(this.objectiveRuntime.currentGroupId);
    const nextGroupId = this.objectiveRuntime.order[currentIndex + 1] ?? null;
    this.objectiveRuntime.currentGroupId = nextGroupId;
    if (!nextGroupId) {
      this.completeObjectiveRuntime("objective_chain_complete");
    } else {
      const next = this.currentObjectiveInstances();
      this.objectiveRuntime.phase = next.some((instance) => instance.type === "seal") ? "boss_gate" : "active";
    }
  }

  completeObjectiveRuntime(reason) {
    if (!this.objectiveRuntime) return;
    for (const instance of this.objectiveRuntime.instances) {
      instance.active = false;
      if (!instance.complete) this.completeObjectiveInstance(instance);
    }
    this.objectiveRuntime.phase = "completed";
    this.objectiveRuntime.currentGroupId = null;
    this.objectiveRuntime.completionReason = this.objectiveRuntime.configuredCompletionReason || reason;
  }

  forceAdvanceObjective() {
    if (this.runPhase !== "active") return;
    if (!this.objectiveRuntime) this.initializeObjectives(this.arenaId, false, this.activeNodeId);
    const current = this.currentObjectiveInstances();
    if (current.length === 0) return;
    for (const instance of current) {
      if (instance.type === "seal") this.bossDefeated = true;
      if (instance.type === "collect") instance.collected = instance.required;
      this.completeObjectiveInstance(instance);
    }
    this.advanceObjectiveGroup();
    this.broadcastSnapshot();
  }

  forceBossIntro() {
    if (this.runPhase !== "active") return;
    this.seconds = Math.max(this.seconds, this.activeArenaConfig().bossSeconds);
    this.spawnBossIfReady();
    this.broadcastSnapshot();
  }

  objectiveSnapshot() {
    if (!this.objectiveRuntime) this.initializeObjectives(this.arenaId, this.runPhase === "completed" && this.arenaId === "memory_cache_001", this.activeNodeId);
    const runtime = this.objectiveRuntime;
    const current = runtime.instances.filter((instance) => instance.groupId === runtime.currentGroupId);
    const hint = current.find((instance) => !instance.complete)?.hint ?? (runtime.phase === "completed" ? "Objectives complete." : "Advance the arena objective.");
    return {
      policy: runtime.policy,
      arenaId: runtime.arenaId,
      nodeId: runtime.nodeId,
      objectiveSetId: runtime.objectiveSetId,
      label: runtime.label,
      phase: runtime.phase,
      currentObjectiveId: current[0]?.id ?? null,
      currentGroupId: runtime.currentGroupId,
      hint,
      completedObjectiveIds: [...runtime.completedObjectiveIds],
      failedObjectiveIds: [...runtime.failedObjectiveIds],
      completionReason: runtime.completionReason,
      instances: runtime.instances.map((instance) => ({
        id: instance.id,
        groupId: instance.groupId,
        type: instance.type,
        label: instance.label,
        worldX: round(instance.worldX),
        worldY: round(instance.worldY),
        radius: instance.radius,
        active: instance.active,
        complete: instance.complete,
        progress: round(instance.progress),
        required: instance.required,
        heldBySessionIds: [...(instance.heldBySessionIds ?? [])],
        heldByLabels: [...(instance.heldByLabels ?? [])],
        heldByRoles: [...(instance.heldByRoles ?? [])],
        preferredRoles: [...(instance.preferredRoles ?? [])],
        roleMatched: Boolean(instance.roleMatched),
        roleAssistMultiplier: round(instance.roleAssistMultiplier ?? 1),
        runtimeArtId: instance.runtimeArtId ?? null,
        routeFlavor: instance.routeFlavor ?? "",
        runtimeArtReady: RUNTIME_READY_OBJECTIVE_ART_IDS.has(instance.runtimeArtId),
        runtimeArtPolicy: "requires_cleaned_or_production_manifest_asset",
        itemId: instance.itemId ?? null,
        collected: instance.collected ?? 0
      }))
    };
  }

  updateRolePressure(dt) {
    if (this.runPhase !== "active") {
      this.rolePressureSplitHoldSeconds = 0;
      return;
    }
    if (this.rolePressureAnchors.length === 0) this.rolePressureAnchors = this.createRolePressureAnchors(this.arenaId);
    const standing = this.connectedPlayers().filter((player) => !player.downed && player.hp > 0);
    if (standing.length < 2 || this.rolePressureAnchors.length < 2) {
      for (const anchor of this.rolePressureAnchors) {
        anchor.heldBySessionId = "";
        anchor.heldByLabel = "";
        anchor.heldSeconds = Math.max(0, anchor.heldSeconds - dt);
      }
      this.rolePressureSplitHoldSeconds = Math.max(0, this.rolePressureSplitHoldSeconds - dt);
      return;
    }

    const usedHolders = new Set();
    for (const anchor of this.rolePressureAnchors) {
      let holder = null;
      let bestDistance = ROLE_PRESSURE_RADIUS;
      for (const player of standing) {
        if (usedHolders.has(player.sessionId)) continue;
        const distance = Math.hypot(player.worldX - anchor.worldX, player.worldY - anchor.worldY);
        if (distance <= bestDistance) {
          holder = player;
          bestDistance = distance;
        }
      }
      if (holder) {
        usedHolders.add(holder.sessionId);
        anchor.heldBySessionId = holder.sessionId;
        anchor.heldByLabel = holder.label;
        anchor.heldSeconds = Math.min(ROLE_PRESSURE_SPLIT_SECONDS, anchor.heldSeconds + dt);
      } else {
        anchor.heldBySessionId = "";
        anchor.heldByLabel = "";
        anchor.heldSeconds = Math.max(0, anchor.heldSeconds - dt * 0.75);
      }
    }

    const heldAnchorCount = this.rolePressureAnchors.filter((anchor) => anchor.heldBySessionId).length;
    const distinctHolderCount = new Set(this.rolePressureAnchors.map((anchor) => anchor.heldBySessionId).filter(Boolean)).size;
    const splitHeld = heldAnchorCount >= 2 && distinctHolderCount >= 2;
    if (splitHeld) {
      this.rolePressureSplitHoldSeconds = Math.min(ROLE_PRESSURE_SPLIT_SECONDS, this.rolePressureSplitHoldSeconds + dt);
    } else {
      this.rolePressureSplitHoldSeconds = Math.max(0, this.rolePressureSplitHoldSeconds - dt * 0.6);
    }

    if (this.rolePressureSplitHoldSeconds >= ROLE_PRESSURE_SPLIT_SECONDS && !this.rolePressureRegroupActive()) {
      this.rolePressureRegroupUntil = this.seconds + ROLE_PRESSURE_REGROUP_SECONDS;
      this.rolePressureCompletedCount += 1;
      this.rolePressureSplitHoldSeconds = 0;
      for (const anchor of this.rolePressureAnchors) anchor.heldSeconds = 0;
    }
  }

  createRolePressureAnchors(arenaId) {
    const anchors = ROLE_PRESSURE_ANCHORS[arenaId] ?? ROLE_PRESSURE_ANCHORS.armistice_plaza;
    return anchors.map((anchor, index) => ({
      ...anchor,
      index,
      radius: ROLE_PRESSURE_RADIUS,
      heldBySessionId: "",
      heldByLabel: "",
      heldSeconds: 0
    }));
  }

  rolePressureRegroupActive() {
    return this.runPhase === "active" && this.rolePressureRegroupUntil > this.seconds;
  }

  recompileRadius() {
    const rolePressureBonus = this.rolePressureRegroupActive() ? ROLE_PRESSURE_RECOMPILE_RADIUS_BONUS : 0;
    const kitBonus = aggregateRecompileKitModifiers([...this.players.values()]).radiusBonus;
    return round(REVIVE_RADIUS + rolePressureBonus + kitBonus);
  }

  recompileRequiredSeconds() {
    const rolePressureSeconds = this.rolePressureRegroupActive() ? REVIVE_SECONDS / ROLE_PRESSURE_RECOMPILE_SPEED_MULTIPLIER : REVIVE_SECONDS;
    const kitScale = aggregateRecompileKitModifiers([...this.players.values()]).requiredSecondsScale;
    return round(rolePressureSeconds * kitScale);
  }

  spawnInjunctionWrits(worldX, worldY, sourceRegionId = `${this.arenaId}_injunction_writs`) {
    for (let i = 0; i < 3; i += 1) {
      const angle = this.seconds * 1.23 + i * 2.1;
      const distance = 2.1 + i * 0.42;
      this.enemies.push({
        id: this.nextEnemyId,
        familyId: i === 1 ? "context_rot_crabs" : "injunction_writs",
        sourceRegionId,
        worldX: clamp(worldX + Math.cos(angle) * distance, BOUNDS.minX, BOUNDS.maxX),
        worldY: clamp(worldY + Math.sin(angle) * distance, BOUNDS.minY, BOUNDS.maxY),
        hp: i === 1 ? 32 : 34,
        maxHp: i === 1 ? 32 : 34,
        speed: i === 1 ? 1.42 : 1.62,
        damage: 6,
        radius: 0.36,
        color: i === 1 ? 0x7a4c5a : 0xfff4d6,
        boss: false,
        life: this.seconds
      });
      this.nextEnemyId += 1;
    }
    this.bossEventCounter += 1;
  }

  spawnOathPages() {
    for (let i = 0; i < 2; i += 1) {
      const angle = this.seconds * 1.6 + i * Math.PI;
      const distance = 2.4 + i * 0.8;
      this.enemies.push({
        id: this.nextEnemyId,
        familyId: "bad_outputs",
        sourceRegionId: "treaty_monument_oath_pages",
        worldX: clamp(this.activeArenaConfig().bossSpawn.worldX + Math.cos(angle) * distance, BOUNDS.minX, BOUNDS.maxX),
        worldY: clamp(this.activeArenaConfig().bossSpawn.worldY + Math.sin(angle) * distance, BOUNDS.minY, BOUNDS.maxY),
        hp: 24,
        maxHp: 24,
        speed: 1.65,
        damage: 6,
        radius: 0.34,
        color: 0x1a101f,
        boss: false,
        life: this.seconds
      });
      this.nextEnemyId += 1;
    }
    this.bossEventCounter += 1;
  }

  spawnBrokenPromiseZone(worldX, worldY, radius) {
    this.brokenPromiseZones.push({
      id: this.nextBossEventId,
      worldX: clamp(worldX, BOUNDS.minX + 1.5, BOUNDS.maxX - 1.5),
      worldY: clamp(worldY, BOUNDS.minY + 1.5, BOUNDS.maxY - 1.5),
      radius,
      createdAt: this.seconds,
      expiresAt: this.seconds + 8.5,
      label: "Broken Promise"
    });
    this.nextBossEventId += 1;
    this.bossEventCounter += 1;
  }

  startTreatyCharge(boss) {
    const target = nearestPlayer(boss.worldX, boss.worldY, this.players);
    if (!target) return;
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
    this.bossEventCounter += 1;
  }

  resolveTreatyCharge(boss, charge) {
    charge.resolved = true;
    const dx = charge.toX - charge.fromX;
    const dy = charge.toY - charge.fromY;
    const len = Math.hypot(dx, dy) || 1;
    boss.worldX = clamp(charge.toX - (dx / len) * 1.4, BOUNDS.minX + 1, BOUNDS.maxX - 1);
    boss.worldY = clamp(charge.toY - (dy / len) * 1.4, BOUNDS.minY + 1, BOUNDS.maxY - 1);
    this.spawnBrokenPromiseZone(charge.toX, charge.toY, 2.8);
  }

  resolveEnemyPlayerHits() {
    for (const player of this.players.values()) {
      if (player.downed || player.hp <= 0 || player.invuln > 0) continue;
      for (const enemy of this.enemies) {
        const enemyRadius = enemy.radius ?? (enemy.boss ? 0.82 : 0.38);
        if (Math.hypot(enemy.worldX - player.worldX, enemy.worldY - player.worldY) > enemyRadius + 0.34) continue;
        const kitGuard = player.buildKit?.recompileModifiers?.guardDamageReduction ?? 0;
        player.hp -= (enemy.damage ?? (enemy.boss ? 12 : 5)) * Math.max(0.82, 1 - kitGuard);
        if (player.hp <= 0) this.downPlayer(player);
        player.invuln = 0.68;
        break;
      }
      for (const zone of this.brokenPromiseZones) {
        if (Math.hypot(player.worldX - zone.worldX, player.worldY - zone.worldY) > zone.radius) continue;
        player.hp -= 0.2;
        if (player.hp <= 0) this.downPlayer(player);
        break;
      }
    }
  }

  checkStartCondition() {
    if (this.runPhase !== "lobby" || this.players.size === 0) return;
    if ([...this.players.values()].some((player) => player.connectionState !== "connected")) return;
    const players = this.connectedPlayers();
    if (!players.every((player) => player.ready)) return;
    const launchNodeId = this.majorityVotedNodeId();
    if (!this.isNodeLaunchable(launchNodeId)) return;
    this.partySelectedNodeId = launchNodeId;
    this.activeNodeId = launchNodeId;
    this.arenaId = this.nodeById(launchNodeId)?.arenaId ?? "armistice_plaza";
    if (this.nodeById(launchNodeId)?.interaction === "party_memory_cache") {
      this.completePartyInteractionNode(launchNodeId, "party_memory_cache");
      return;
    }
    this.resetRunStateForLaunch();
    this.runPhase = "active";
    this.phaseChangedAt = this.tick;
    this.seconds = 0;
    this.spawnTimer = 0.18;
    for (const player of players) {
      player.ready = true;
      player.connectionState = "connected";
    }
  }

  checkProgression() {
    if (this.upgradePending) return;
    const threshold = PARTY_XP_THRESHOLDS[this.partyLevel - 1];
    if (!threshold || this.partyXp < threshold) return;
    this.upgradePending = {
      id: `shared_patch_${this.partyLevel}`,
      level: this.partyLevel + 1,
      readyAt: this.seconds,
      policy: "shared_party_xp_coop_vote",
      cards: sharedUpgradeCards(this.partyLevel)
    };
    this.upgradeVotes.clear();
  }

  applySharedUpgrade(card, chooser) {
    this.chosenUpgrades.push(card.id);
    this.partyLevel += 1;
    this.upgradePending = null;
    this.upgradeVotes.clear();
    for (const player of this.players.values()) {
      player.level = this.partyLevel;
      player.xp = this.partyXp;
      if (card.id === "refusal_halo") {
        player.maxHp += 14;
        if (!player.downed) player.hp = Math.min(player.maxHp, player.hp + 14);
      } else if (card.id === "coherence_magnet") {
        player.maxHp += 6;
        if (!player.downed) player.hp = Math.min(player.maxHp, player.hp + 8);
      } else if (card.id === "recompile_anchor") {
        player.maxHp += 10;
        if (!player.downed) player.hp = Math.min(player.maxHp, player.hp + 10);
      }
    }
    this.runSummary = {
      ...(this.runSummary ?? {}),
      lastUpgrade: card.id,
      lastUpgradeChosenBy: chooser.label,
      lastUpgradePolicy: "shared_party_xp_coop_vote",
      chosenUpgrades: [...this.chosenUpgrades]
    };
  }

  resolveUpgradeDraft() {
    if (!this.upgradePending) return;
    const voters = this.eligibleUpgradeVoters();
    const requiredVotes = Math.max(1, voters.length);
    const eligibleIds = new Set(voters.map((player) => player.sessionId));
    for (const sessionId of [...this.upgradeVotes.keys()]) {
      if (!eligibleIds.has(sessionId)) this.upgradeVotes.delete(sessionId);
    }
    const votes = [...this.upgradeVotes.values()];
    if (votes.length < requiredVotes) return;

    const counts = this.upgradeVoteCounts();
    const cardOrder = new Map(this.upgradePending.cards.map((card, index) => [card.id, index]));
    const chosen = [...this.upgradePending.cards].sort((a, b) => {
      const countDelta = (counts[b.id] ?? 0) - (counts[a.id] ?? 0);
      if (countDelta !== 0) return countDelta;
      return (cardOrder.get(a.id) ?? 0) - (cardOrder.get(b.id) ?? 0);
    })[0];
    const chooserVote = votes.find((vote) => vote.upgradeId === chosen.id) ?? votes[votes.length - 1];
    const chooser = this.players.get(chooserVote.sessionId) ?? voters[0];
    this.applySharedUpgrade(chosen, chooser);
  }

  eligibleUpgradeVoters() {
    return [...this.players.values()].filter((player) => !player.downed && player.hp > 0);
  }

  upgradeVoteCounts() {
    const counts = {};
    if (!this.upgradePending) return counts;
    for (const card of this.upgradePending.cards) counts[card.id] = 0;
    for (const vote of this.upgradeVotes.values()) {
      if (counts[vote.upgradeId] === undefined) continue;
      counts[vote.upgradeId] += 1;
    }
    return counts;
  }

  upgradeDraftSnapshot() {
    if (!this.upgradePending) return null;
    const voters = this.eligibleUpgradeVoters();
    const eligibleIds = new Set(voters.map((player) => player.sessionId));
    const votes = [...this.upgradeVotes.values()]
      .filter((vote) => eligibleIds.has(vote.sessionId))
      .map((vote) => ({
        sessionId: vote.sessionId,
        label: vote.label,
        upgradeId: vote.upgradeId,
        votedAt: round(vote.votedAt)
      }));
    const voteCounts = this.upgradeVoteCounts();
    const cardOrder = new Map(this.upgradePending.cards.map((card, index) => [card.id, index]));
    const leadingCardId =
      [...this.upgradePending.cards].sort((a, b) => {
        const countDelta = (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0);
        if (countDelta !== 0) return countDelta;
        return (cardOrder.get(a.id) ?? 0) - (cardOrder.get(b.id) ?? 0);
      })[0]?.id ?? null;
    return {
      ...this.upgradePending,
      policy: "shared_party_xp_coop_vote",
      votes,
      voteCounts,
      requiredVotes: Math.max(1, voters.length),
      eligibleVoterIds: voters.map((player) => player.sessionId),
      leadingCardId
    };
  }

  updateRevives(dt) {
    const activePlayers = [...this.players.values()].filter((player) => player.connectionState === "connected" && !player.downed && player.hp > 0);
    const radius = this.recompileRadius();
    const requiredSeconds = this.recompileRequiredSeconds();
    for (const downed of this.players.values()) {
      if (!downed.downed) {
        downed.reviveProgress = 0;
        continue;
      }
      const ally = activePlayers.find((player) => Math.hypot(player.worldX - downed.worldX, player.worldY - downed.worldY) <= radius);
      if (!ally) {
        downed.reviveProgress = Math.max(0, downed.reviveProgress - dt * 0.5);
        continue;
      }
      downed.reviveProgress += dt;
      if (downed.reviveProgress >= requiredSeconds) {
        downed.downed = false;
        const reviveHpBonus = ally.buildKit?.recompileModifiers?.reviveHpBonus ?? 0;
        downed.hp = Math.ceil(downed.maxHp * Math.min(0.64, 0.46 + reviveHpBonus));
        downed.invuln = 1.4;
        downed.reviveProgress = 0;
        downed.revivedCount += 1;
        this.resolveUpgradeDraft();
      }
    }
  }

  downPlayer(player) {
    player.hp = 0;
    player.downed = true;
    player.reviveProgress = 0;
    player.downedAt = this.seconds;
    player.input.axisX = 0;
    player.input.axisY = 0;
  }

  forceDownPlayer(sessionId) {
    if (this.runPhase !== "active") return;
    const player = this.players.get(sessionId);
    if (!player || player.downed) return;
    const ally = [...this.players.values()].find((candidate) => candidate.sessionId !== sessionId && candidate.connectionState === "connected" && !candidate.downed && candidate.hp > 0);
    if (ally) {
      player.worldX = clamp(ally.worldX + 0.7, BOUNDS.minX + 0.5, BOUNDS.maxX - 0.5);
      player.worldY = clamp(ally.worldY, BOUNDS.minY + 0.5, BOUNDS.maxY - 0.5);
    }
    this.downPlayer(player);
    this.checkFailureCondition();
    this.broadcastSnapshot();
  }

  forceSharedXp() {
    if (this.runPhase !== "active") return;
    const threshold = PARTY_XP_THRESHOLDS[this.partyLevel - 1] ?? this.partyXp + 5;
    this.partyXp = Math.max(this.partyXp, threshold + 5);
    for (const player of this.players.values()) player.xp = this.partyXp;
    this.checkProgression();
    this.broadcastSnapshot();
  }

  forceConsensusBurstCharge() {
    if (this.runPhase !== "active") return;
    this.consensusBurstCharge = CONSENSUS_BURST_REQUIRED_CHARGE;
    this.consensusBurstChargeSource = "proof_server_charge_hook";
    this.broadcastSnapshot();
  }

  forceSplitRoleAnchors() {
    if (this.runPhase !== "active") return;
    if (this.rolePressureAnchors.length === 0) this.rolePressureAnchors = this.createRolePressureAnchors(this.arenaId);
    const players = this.connectedPlayers().filter((player) => !player.downed && player.hp > 0).sort((a, b) => a.slot - b.slot);
    for (let i = 0; i < Math.min(players.length, this.rolePressureAnchors.length); i += 1) {
      const player = players[i];
      const anchor = this.rolePressureAnchors[i];
      player.worldX = clamp(anchor.worldX, BOUNDS.minX + 0.5, BOUNDS.maxX - 0.5);
      player.worldY = clamp(anchor.worldY, BOUNDS.minY + 0.5, BOUNDS.maxY - 0.5);
      player.velocityX = 0;
      player.velocityY = 0;
      player.input.axisX = 0;
      player.input.axisY = 0;
    }
    this.broadcastSnapshot();
  }

  checkCompletionCondition() {
    if (this.runPhase !== "active") return;
    if (this.objectiveRuntime?.phase === "completed" && this.bossDefeated) this.completeRun(this.objectiveRuntime.completionReason || "objectives_complete_boss_defeated");
    if (this.bossDefeated && this.seconds >= this.activeArenaConfig().targetSeconds) this.completeRun("boss_defeated_and_timer_met");
  }

  completeRun(reason) {
    if (this.runPhase === "completed") return;
    const arena = this.activeArenaConfig();
    const node = this.nodeById(this.activeNodeId);
    const rewardSummary = this.applyNodeReward(this.activeNodeId, reason);
    this.markNodeCompleted(this.activeNodeId);
    this.runPhase = "completed";
    this.completedAt = this.seconds;
    this.phaseChangedAt = this.tick;
    this.runSummary = {
      outcome: "completed",
      reason,
      title: node?.completionTitle ?? arena.completionTitle,
      subtitle: node?.completionSubtitle ?? arena.completionSubtitle,
      nodeId: this.activeNodeId,
      arenaId: this.arenaId,
      seconds: round(this.seconds),
      kills: this.kills,
      collectedPickups: this.collectedPickups,
      partyXp: this.partyXp,
      partyLevel: this.partyLevel,
      chosenUpgrades: [...this.chosenUpgrades],
      revivedPlayers: [...this.players.values()].reduce((sum, player) => sum + player.revivedCount, 0),
      rewards: rewardSummary,
      dialogue: this.summaryDialogueSnapshot(this.activeNodeId),
      objectives: this.objectiveSnapshot(),
      rolePressure: {
        policy: "split_hold_regroup_recompile_v1",
        splitHolds: this.rolePressureCompletedCount,
        regroupActive: this.rolePressureRegroupActive()
      },
      consensusBurst: {
        policy: "server_authoritative_consensus_burst_v1",
        activations: this.consensusBurstActivations,
        lastComboId: this.activeConsensusBurst?.id ?? null
      }
    };
  }

  completePartyInteractionNode(nodeId, reason) {
    this.resetRunStateForLaunch();
    this.activeNodeId = nodeId;
    const node = this.nodeById(nodeId);
    this.arenaId = node?.arenaId ?? nodeId;
    this.initializeObjectives(this.arenaId, true, nodeId);
    const arena = this.activeArenaConfig();
    const rewardSummary = this.applyNodeReward(nodeId, reason);
    this.markNodeCompleted(nodeId);
    this.runPhase = "completed";
    this.completedAt = 0;
    this.phaseChangedAt = this.tick;
    this.runSummary = {
      outcome: "completed",
      reason,
      title: node?.completionTitle ?? arena.completionTitle,
      subtitle: node?.completionSubtitle ?? arena.completionSubtitle,
      nodeId,
      arenaId: arena.id,
      seconds: 0,
      kills: 0,
      collectedPickups: 0,
      partyXp: this.partyXp,
      partyLevel: this.partyLevel,
      chosenUpgrades: [],
      revivedPlayers: 0,
      rewards: rewardSummary,
      dialogue: this.summaryDialogueSnapshot(nodeId),
      objectives: this.objectiveSnapshot(),
      rolePressure: {
        policy: "split_hold_regroup_recompile_v1",
        splitHolds: this.rolePressureCompletedCount,
        regroupActive: this.rolePressureRegroupActive()
      },
      consensusBurst: {
        policy: "server_authoritative_consensus_burst_v1",
        activations: this.consensusBurstActivations,
        lastComboId: this.activeConsensusBurst?.id ?? null
      }
    };
  }

  checkFailureCondition() {
    if (this.runPhase !== "active" || this.players.size === 0) return;
    const players = this.connectedPlayers();
    if (players.length === 0) return;
    if (!players.every((player) => player.downed || player.hp <= 0)) return;
    this.runPhase = "failed";
    this.failedAt = this.seconds;
    this.phaseChangedAt = this.tick;
    this.runSummary = {
      outcome: "failed",
      reason: "all_players_downed",
      title: "CONSENSUS CELL DESYNCHRONIZED",
      subtitle: "Every ally became lore at the same time.",
      nodeId: this.activeNodeId,
      arenaId: this.arenaId,
      seconds: round(this.seconds),
      kills: this.kills,
      collectedPickups: this.collectedPickups,
      partyXp: this.partyXp,
      partyLevel: this.partyLevel,
      chosenUpgrades: [...this.chosenUpgrades],
      dialogue: this.summaryDialogueSnapshot(this.activeNodeId),
      objectives: this.objectiveSnapshot(),
      rolePressure: {
        policy: "split_hold_regroup_recompile_v1",
        splitHolds: this.rolePressureCompletedCount,
        regroupActive: this.rolePressureRegroupActive()
      }
    };
  }

  returnToParty() {
    if (this.runPhase !== "completed" && this.runPhase !== "failed") return;
    this.runPhase = "lobby";
    this.phaseChangedAt = this.tick;
    this.partySelectedNodeId = this.firstLaunchableNodeId();
    this.resetRunStateForLobby();
    for (const player of this.players.values()) {
      player.ready = false;
      player.votedNodeId = this.partySelectedNodeId;
      player.downed = false;
      player.reviveProgress = 0;
      player.revivedCount = 0;
      player.hp = player.maxHp;
      player.worldX = formationOffset(player.slot).worldX;
      player.worldY = formationOffset(player.slot).worldY;
      player.velocityX = 0;
      player.velocityY = 0;
    }
    this.broadcastSnapshot();
  }

  broadcastSnapshot() {
    this.syncSchemaState();
    const connectedPlayers = this.connectedPlayers();
    const disconnectedPlayers = [...this.players.values()].filter((player) => player.connectionState !== "connected");
    const activeNode = this.nodeById(this.activeNodeId) ?? this.nodeById(START_NODE_ID);
    this.broadcast("snapshot", {
      schemaVersion: 4,
      roomId: this.roomId,
      roomCode: this.roomCode,
      arenaId: this.arenaId,
      mapId: this.activeArenaConfig().mapId,
      tick: this.tick,
      seconds: round(this.seconds),
      targetSeconds: this.activeArenaConfig().targetSeconds,
      runPhase: this.runPhase,
      phaseChangedAt: this.phaseChangedAt,
      party: this.partySnapshot(),
      maxClients: this.maxClients,
      playerCount: this.players.size,
      connectedCount: connectedPlayers.length,
      networkAuthority: "colyseus_room_server_combat",
      bounds: BOUNDS,
      players: [...this.players.values()].map((player) => ({
        sessionId: player.sessionId,
        playerId: player.playerId,
        slot: player.slot,
        label: player.label,
        classId: player.classId,
        factionId: player.factionId,
        buildKit: player.buildKit ?? resolveBuildKit(player.classId, player.factionId),
        weaponId: player.weaponId ?? player.buildKit?.startingWeaponId ?? "refusal_shard",
        color: player.color,
        worldX: round(player.worldX),
        worldY: round(player.worldY),
        velocityX: round(player.velocityX),
        velocityY: round(player.velocityY),
        facing: player.facing,
        hp: Math.ceil(player.hp),
        maxHp: player.maxHp,
        xp: player.xp,
        level: player.level,
        ready: player.ready,
        votedNodeId: player.votedNodeId,
        connectionState: player.connectionState,
        connected: player.connectionState === "connected",
        reconnectCount: player.reconnectCount,
        disconnectedFor: player.connectionState === "connected" ? 0 : this.disconnectedSecondsFor(player),
        downed: player.downed,
        reviveProgress: round(player.reviveProgress),
        reviveRequired: this.recompileRequiredSeconds(),
        revivedCount: player.revivedCount,
        inputSequence: player.input.sequence
      })),
      enemies: [...this.enemies]
        .sort((a, b) => Number(b.boss) - Number(a.boss) || Number(b.sourceRegionId?.includes("injunction_writs")) - Number(a.sourceRegionId?.includes("injunction_writs")))
        .slice(0, 24)
        .map((enemy) => ({
        id: enemy.id,
        familyId: enemy.familyId,
        sourceRegionId: enemy.sourceRegionId,
        worldX: round(enemy.worldX),
        worldY: round(enemy.worldY),
        hp: Math.ceil(enemy.hp),
        boss: enemy.boss,
        color: enemy.color
      })),
      projectiles: this.projectiles.slice(0, 40).map((projectile) => ({
        id: projectile.id,
        ownerSessionId: projectile.ownerSessionId,
        worldX: round(projectile.worldX),
        worldY: round(projectile.worldY),
        velocityX: round(projectile.vx),
        velocityY: round(projectile.vy),
        life: round(projectile.life),
        label: projectile.label
      })),
      pickups: this.pickups.slice(0, 32).map((pickup) => ({
        id: pickup.id,
        worldX: round(pickup.worldX),
        worldY: round(pickup.worldY),
        value: pickup.value,
        objectiveItemId: pickup.objectiveItemId ?? null,
        objectiveLabel: pickup.objectiveLabel ?? null
      })),
      campaignContent: activeNode ? campaignContentForNode(activeNode) : null,
      dialogue: this.dialoguePresentationSnapshot(),
      bossEvent: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        bossIntroSeen: this.bossIntroSeen,
        eventCounter: this.bossEventCounter,
        brokenPromiseZones: this.brokenPromiseZones.map((zone) => ({
          id: zone.id,
          worldX: round(zone.worldX),
          worldY: round(zone.worldY),
          radius: zone.radius,
          expiresIn: round(Math.max(0, zone.expiresAt - this.seconds)),
          label: zone.label
        })),
        activeTreatyCharge: this.treatyCharge
          ? {
              fromX: round(this.treatyCharge.fromX),
              fromY: round(this.treatyCharge.fromY),
              toX: round(this.treatyCharge.toX),
              toY: round(this.treatyCharge.toY),
              impactIn: round(Math.max(0, this.treatyCharge.impactAt - this.seconds)),
              resolved: this.treatyCharge.resolved
            }
          : null
      },
      combat: {
        kills: this.kills,
        collectedPickups: this.collectedPickups,
        authoritativeProjectiles: this.projectiles.length,
        authoritativePickups: this.pickups.length,
        bossGateMechanic: this.activeArenaConfig().bossGateMechanic ?? "broken_promise"
      },
      regionEvent: this.regionEventSnapshot(),
      objectives: this.objectiveSnapshot(),
      recompile: this.recompileSnapshot(),
      rolePressure: this.rolePressureSnapshot(),
      consensusBurst: this.consensusBurstSnapshot(),
      progression: {
        policy: "shared_party_xp_coop_vote",
        balancePolicy: BALANCE_POLICY,
        partyXp: this.partyXp,
        partyLevel: this.partyLevel,
        nextLevelXp: PARTY_XP_THRESHOLDS[this.partyLevel - 1] ?? null,
        thresholds: [...PARTY_XP_THRESHOLDS],
        upgradePending: this.upgradeDraftSnapshot(),
        chosenUpgrades: [...this.chosenUpgrades]
      },
      lifecycle: this.lifecycleSnapshot(connectedPlayers, disconnectedPlayers),
      deployment: this.deploymentSnapshot(connectedPlayers, disconnectedPlayers),
      reconnect: {
        policy: "session_storage_reconnect_key_slot_reclaim",
        slotTtlSeconds: DISCONNECTED_SLOT_TTL_SECONDS,
        connectedCount: connectedPlayers.length,
        disconnectedCount: disconnectedPlayers.length,
        reclaimedPlayerCount: this.reclaimedPlayerCount,
        disconnectedPlayerIds: disconnectedPlayers.map((player) => player.playerId)
      },
      rewards: this.rewardsSnapshot(),
      persistence: this.persistenceSnapshot(),
      balance: this.balanceSnapshot(),
      feedback: this.feedbackSnapshot(),
      summary: this.runSummary,
      combatArt: {
        pressure: round(Math.min(1, this.seconds / this.activeArenaConfig().bossSeconds)),
        phase: this.bossSpawned ? "boss_active" : this.seconds >= this.activeArenaConfig().bossSeconds - 4 ? "boss_warning" : this.seconds >= 7 ? "horde" : "opening",
        projectileCount: this.projectiles.length,
        pickupCount: this.pickups.length,
        bossEventActive: this.bossSpawned && !this.bossDefeated
      }
    });
  }

  dialoguePresentationSnapshot() {
    const nodeId = this.runPhase === "lobby" ? this.partySelectedNodeId : this.activeNodeId;
    const node = this.nodeById(nodeId) ?? this.nodeById(START_NODE_ID);
    const content = node ? campaignContentForNode(node) : null;
    const completedSummaryNodeId = this.runSummary?.nodeId ?? nodeId;
    return {
      policy: CAMPAIGN_DIALOGUE_PRESENTATION_POLICY,
      persistenceBoundary: CAMPAIGN_DIALOGUE_PERSISTENCE_BOUNDARY,
      nodeId: node?.id ?? nodeId,
      arenaId: this.runPhase === "lobby" ? node?.arenaId ?? this.arenaId : this.arenaId,
      contentArenaId: content?.contentArenaId ?? "",
      briefing: campaignDialogueSnippetsForNode(node?.id ?? nodeId, ["briefing", "unsupported_node"]),
      bossArrival: this.bossIntroSeen ? campaignDialogueSnippetsForNode(node?.id ?? nodeId, ["boss_arrival"]) : [],
      interactionComplete:
        this.runPhase === "completed"
          ? campaignDialogueSnippetsForNode(completedSummaryNodeId, ["interaction_complete", "cache_decode", "persistence_boundary"])
          : [],
      routeSummary: this.runSummary ? this.summaryDialogueSnippets(completedSummaryNodeId) : [],
      presentation: campaignPresentationForNode(node?.id ?? nodeId),
      activeSnippetIds: [
        ...campaignDialogueSnippetsForNode(node?.id ?? nodeId, ["briefing", "unsupported_node"]).map((snippet) => snippet.id),
        ...(this.bossIntroSeen ? campaignDialogueSnippetsForNode(node?.id ?? nodeId, ["boss_arrival"]).map((snippet) => snippet.id) : []),
        ...(this.runSummary ? this.summaryDialogueSnippets(completedSummaryNodeId).map((snippet) => snippet.id) : [])
      ]
    };
  }

  summaryDialogueSnapshot(nodeId) {
    return {
      policy: CAMPAIGN_DIALOGUE_PRESENTATION_POLICY,
      persistenceBoundary: CAMPAIGN_DIALOGUE_PERSISTENCE_BOUNDARY,
      nodeId,
      arenaId: this.arenaId,
      snippets: this.summaryDialogueSnippets(nodeId),
      presentation: campaignPresentationForNode(nodeId)
    };
  }

  summaryDialogueSnippets(nodeId) {
    return campaignDialogueSnippetsForNode(nodeId, [
      "interaction_complete",
      "cache_decode",
      "persistence_boundary",
      "boss_seal",
      "boss_defeated",
      "route_reward",
      "route_capstone",
      "boss_low_hp"
    ]);
  }

  regionEventSnapshot() {
    const arena = this.activeArenaConfig();
    return {
      arenaId: arena.id,
      regionLabel: arena.regionLabel,
      eventFamily: arena.regionEventFamily ?? "broken_promise",
      mechanicId: arena.bossGateMechanic ?? "broken_promise",
      readabilityPolicy:
        arena.regionEventPattern === "glass_sunfield"
          ? "static_translucent_solar_lanes_no_strobe_reduced_flash_safe"
          : arena.regionEventPattern === "archive_redaction"
            ? "accessibility_safe_redaction_never_obscures_controls_or_proof_text"
            : arena.regionEventPattern === "blackwater_beacon"
              ? "static_translucent_tidal_lanes_and_zero_damage_signal_towers"
              : arena.regionEventPattern === "outer_alignment_finale"
                ? "corrupted_overworld_markers_predictions_do_not_cover_controls"
            : "standard_translucent_hazard_markers",
      redactionPressure:
        arena.regionEventPattern === "archive_redaction"
          ? {
              policy: "server_authoritative_redaction_pressure_xp_theft_runtime_only",
              xpStolen: this.redactionXpStolen,
              theftTicks: this.redactionTheftTicks,
              theftCooldown: round(this.redactionTheftCooldown),
              uiCorruptionPolicy: "decorative_black_bar_markers_do_not_cover_required_text_or_controls",
              persistenceBoundary: "route_profile_only_no_redaction_pressure_or_live_xp_theft_state"
          }
          : null,
      blackwaterPressure:
        arena.regionEventPattern === "blackwater_beacon"
          ? {
              policy: "server_authoritative_tidal_waves_and_antenna_split_pressure",
              waveTicks: this.blackwaterWaveTicks,
              antennaPulses: this.blackwaterAntennaPulses,
              activeSignalTowerCount: this.regionHazardZones.filter((zone) => zone.familyId === "signal_tower").length,
              splitPressureObjectiveGroupId: "blackwater_split_pressure_sequence",
              persistenceBoundary: "route_profile_only_no_tidal_antenna_or_live_objective_state"
            }
          : null,
      outerAlignmentFinale:
        arena.regionEventPattern === "outer_alignment_finale"
          ? {
              policy: "server_authoritative_outer_alignment_final_eval",
              phaseIndex: this.outerAlignmentPhaseIndex,
              phaseLabel: outerAlignmentPhaseLabel(this.outerAlignmentPhaseIndex),
              predictionTicks: this.outerAlignmentPredictionTicks,
              echoesSpawned: this.outerAlignmentEchoesSpawned,
              previousBossEchoIds: previousBossEchoFamilyIds(),
              activeEchoFamilyIds: this.enemies.filter((enemy) => enemy.sourceRegionId?.startsWith("outer_alignment_echo:")).map((enemy) => enemy.familyId),
              corruptedOverworldState: "routes_become_mouths_nodes_rearrange_ui_lies",
              falseUpgradeDraftPolicy: "decorative_fake_upgrade_markers_never_enter_upgrade_vote_state",
              persistenceBoundary: "route_profile_only_no_outer_alignment_predictions_echoes_or_finale_authority_state"
            }
          : null,
      eventCounter: this.regionEventCounter,
      active: this.regionHazardZones.length > 0,
      hazardZones: this.regionHazardZones.map((zone) => ({
        id: zone.id,
        familyId: zone.familyId,
        label: zone.label,
        worldX: round(zone.worldX),
        worldY: round(zone.worldY),
        radius: zone.radius,
        expiresIn: round(Math.max(0, zone.expiresAt - this.seconds)),
        damagePerSecond: zone.damagePerSecond
      }))
    };
  }

  rolePressureSnapshot() {
    const active = this.runPhase === "active" && this.connectedPlayers().length >= 2;
    const heldAnchorCount = this.rolePressureAnchors.filter((anchor) => anchor.heldBySessionId).length;
    const regroupExpiresIn = round(Math.max(0, this.rolePressureRegroupUntil - this.seconds));
    const phase = !active
      ? "inactive"
      : regroupExpiresIn > 0
        ? "regroup"
        : heldAnchorCount > 0
          ? "split_hold"
          : "split";
    return {
      policy: "split_hold_regroup_recompile_v1",
      arenaId: this.arenaId,
      active,
      phase,
      requiredAnchors: Math.min(2, this.rolePressureAnchors.length),
      heldAnchorCount,
      splitHoldSeconds: round(this.rolePressureSplitHoldSeconds),
      splitRequiredSeconds: ROLE_PRESSURE_SPLIT_SECONDS,
      completedSplitHolds: this.rolePressureCompletedCount,
      regroupExpiresIn,
      recompileRadius: this.recompileRadius(),
      baseRecompileRadius: REVIVE_RADIUS,
      recompileRequiredSeconds: this.recompileRequiredSeconds(),
      baseRecompileRequiredSeconds: REVIVE_SECONDS,
      recompileSpeedMultiplier: this.rolePressureRegroupActive() ? ROLE_PRESSURE_RECOMPILE_SPEED_MULTIPLIER : 1,
      anchors: this.rolePressureAnchors.map((anchor) => ({
        id: anchor.id,
        label: anchor.label,
        role: anchor.role,
        worldX: round(anchor.worldX),
        worldY: round(anchor.worldY),
        radius: anchor.radius,
        heldBySessionId: anchor.heldBySessionId || null,
        heldByLabel: anchor.heldByLabel || null,
        heldSeconds: round(anchor.heldSeconds),
        requiredSeconds: ROLE_PRESSURE_SPLIT_SECONDS,
        complete: anchor.heldSeconds >= ROLE_PRESSURE_SPLIT_SECONDS
      })),
      playerRoles: [...this.players.values()].map((player) => ({
        sessionId: player.sessionId,
        label: player.label,
        classId: player.classId,
        factionId: player.factionId,
        role: roleForPlayer(player),
        downed: player.downed,
        connected: player.connectionState === "connected"
      }))
    };
  }

  consensusBurstSnapshot() {
    const combo = this.currentConsensusBurstCombo();
    const factionIds = this.connectedPlayers().map((player) => player.factionId);
    return {
      policy: "server_authoritative_consensus_burst_v1",
      chargeSource: "coherence_shard_collection_server_owned",
      activationAuthority: "colyseus_room_server_only",
      persistenceBoundary: "route_profile_only_no_burst_charge_active_combo_or_cooldown_state",
      requiredCharge: CONSENSUS_BURST_REQUIRED_CHARGE,
      charge: round(this.consensusBurstCharge),
      chargePercent: round(this.consensusBurstCharge / CONSENSUS_BURST_REQUIRED_CHARGE),
      ready: this.runPhase === "active" && this.consensusBurstCharge >= CONSENSUS_BURST_REQUIRED_CHARGE && Boolean(combo) && this.seconds >= this.consensusBurstCooldownUntil,
      cooldownExpiresIn: round(Math.max(0, this.consensusBurstCooldownUntil - this.seconds)),
      activations: this.consensusBurstActivations,
      currentComboId: combo?.id ?? null,
      currentComboName: combo?.name ?? null,
      participatingFactionIds: factionIds,
      activeCombo: this.activeConsensusBurst
        ? {
            id: this.activeConsensusBurst.id,
            name: this.activeConsensusBurst.name,
            effect: this.activeConsensusBurst.effect,
            proofId: this.activeConsensusBurst.proofId,
            activatedByLabel: this.activeConsensusBurst.activatedByLabel,
            expiresIn: round(Math.max(0, this.activeConsensusBurst.expiresAt - this.seconds)),
            participatingFactionIds: [...this.activeConsensusBurst.participatingFactionIds],
            effectSummary: this.activeConsensusBurst.effectSummary,
            enemiesAffected: this.activeConsensusBurst.enemiesAffected,
            projectilesCreated: this.activeConsensusBurst.projectilesCreated,
            enemiesBefore: this.activeConsensusBurst.enemiesBefore,
            enemiesAfter: this.activeConsensusBurst.enemiesAfter
          }
        : null,
      comboCatalog: CONSENSUS_BURST_COMBOS.map((entry) => ({
        id: entry.id,
        name: entry.name,
        requiredFactionIds: [...entry.requiredFactionIds],
        minUniqueFactions: entry.minUniqueFactions,
        effect: entry.effect,
        proofId: entry.proofId
      }))
    };
  }

  rewardsSnapshot() {
    return {
      policy: "node_completion_renown_and_party_unlocks",
      balancePolicy: BALANCE_POLICY,
      partyRenown: this.partyRenown,
      rewardIds: [...this.rewardInventory],
      lastReward: this.lastRewardSummary,
      nodeCompletionCounts: Object.fromEntries([...this.nodeCompletionCounts.entries()]),
      recommendedNodeId: this.recommendedNodeId()
    };
  }

  balanceSnapshot() {
    return buildBalanceSnapshot({
      completedNodeIds: [...this.completedNodeIds],
      rewardIds: [...this.rewardInventory],
      partyRenown: this.partyRenown,
      partySize: this.connectedPlayers().length || this.players.size || 1,
      selectedNodeId: this.partySelectedNodeId
    });
  }

  feedbackSnapshot() {
    return {
      policy: "audio_juice_feel_1_0_runtime_only",
      persistenceBoundary: "runtime_feedback_not_route_profile",
      audioHooks: ["weapon_hit", "pickup_chime", "boss_warning", "objective_tick", "consensus_burst", "summary_stinger"],
      visualJuice: {
        reducedFlashSafe: true,
        screenShakeAuthority: "client_optional_query_setting",
        maxHazardAlpha: 0.18,
        maxFloatingLabels: 32
      },
      counters: {
        hit: this.kills,
        pickup: this.collectedPickups,
        boss_warning: this.bossIntroSeen ? 1 : 0,
        objective: this.objectiveRuntime?.completedObjectiveIds?.length ?? 0,
        burst: this.consensusBurstActivations,
        summary: this.runSummary ? 1 : 0
      }
    };
  }

  deploymentSnapshot(connectedPlayers, disconnectedPlayers) {
    return {
      policy: DEPLOYMENT_POLICY,
      roomCode: this.roomCode,
      joinMode: "join_or_create_filtered_by_room_code",
      healthPath: "/healthz",
      staticDistEnabled: SERVE_STATIC_DIST,
      tickRate: TICK_RATE,
      clientInputHz: CLIENT_INPUT_HZ,
      maxClients: this.maxClients,
      port: PORT,
      host: HOST,
      reconnectGraceSeconds: DISCONNECTED_SLOT_TTL_SECONDS,
      connectedCount: connectedPlayers.length,
      disconnectedCount: disconnectedPlayers.length,
      latencyTolerance: {
        inputSequenceAuthority: "server_accepts_monotonic_client_input_sequences",
        missedInputPolicy: "last_axis_zeroed_on_disconnect_or_leave",
        snapshotCadence: "server_tick_broadcast_snapshot",
        reconnectPolicy: "session_storage_reconnect_key_slot_reclaim"
      },
      persistenceBoundary: "route_profile_export_code_only_no_live_room_authority_or_combat_state"
    };
  }

  persistenceSnapshot() {
    const profile = {
      completedNodeIds: [...this.completedNodeIds],
      unlockedNodeIds: [...this.unlockedNodeIds],
      rewardIds: [...this.rewardInventory],
      partyRenown: this.partyRenown,
      nodeCompletionCounts: Object.fromEntries([...this.nodeCompletionCounts.entries()]),
      recommendedNodeId: this.recommendedNodeId(),
      routeDepth: this.completedNodeIds.size,
      savedAtTick: this.tick
    };
    const hashProfile = { ...profile, savedAtTick: 0 };
    return {
      policy: "prototype_local_storage_export_v1",
      storageKey: "agi:last_alignment:online_progression:v1",
      exportVersion: 1,
      exportable: true,
      importApplied: this.importAudit.importApplied,
      importStatus: this.importAudit.importStatus,
      importedSaveHash: this.importAudit.importedSaveHash,
      importedCompletedNodeCount: this.importAudit.importedCompletedNodeCount,
      importedRewardCount: this.importAudit.importedRewardCount,
      importedRouteDepth: this.importAudit.importedRouteDepth,
      ignoredImportedFieldCount: this.importAudit.ignoredFieldCount,
      importedSummary: this.importedPersistenceDraft
        ? {
            saveHash: this.importAudit.importedSaveHash,
            completedNodeCount: this.importAudit.importedCompletedNodeCount,
            rewardCount: this.importAudit.importedRewardCount
          }
        : null,
      profile,
      saveHash: stableHash(JSON.stringify(hashProfile)),
      currentExportHash: stableHash(JSON.stringify(hashProfile)),
      durableFieldPolicy: "route_profile_only_no_combat_state"
    };
  }

  lifecycleSnapshot(connectedPlayers = this.connectedPlayers(), disconnectedPlayers = [...this.players.values()].filter((player) => player.connectionState !== "connected")) {
    return {
      schemaBacked: true,
      schemaVersion: this.state.schemaVersion,
      stateClass: "ConsensusCellState",
      collectionKinds: ["MapSchema<PlayerPresence>", "ArraySchema<completedNodeIds>", "ArraySchema<unlockedNodeIds>", "MapSchema<UpgradeVote>", "MapSchema<RecompileDowned>"],
      playerPresenceCount: this.state.players.size,
      upgradeVoteCount: this.state.upgradeVotes.size,
      recompileDownedCount: this.state.recompileDowned.size,
      connectedCount: connectedPlayers.length,
      disconnectedCount: disconnectedPlayers.length,
      completedNodeCount: this.state.completedNodeIds.length,
      unlockedNodeCount: this.state.unlockedNodeIds.length
    };
  }

  syncSchemaState() {
    this.state.schemaVersion = 4;
    this.state.runPhase = this.runPhase;
    this.state.tick = this.tick;
    this.state.seconds = round(this.seconds);
    this.state.partySelectedNodeId = this.partySelectedNodeId;
    this.state.activeNodeId = this.activeNodeId;
    this.state.partyXp = this.partyXp;
    this.state.partyLevel = this.partyLevel;

    const livePlayerIds = new Set();
    for (const player of this.players.values()) {
      livePlayerIds.add(player.playerId);
      let presence = this.state.players.get(player.playerId);
      if (!presence) {
        presence = new PlayerPresenceSchema();
        this.state.players.set(player.playerId, presence);
      }
      presence.playerId = player.playerId;
      presence.sessionId = player.sessionId;
      presence.reconnectKey = player.reconnectKey ? shortId(player.reconnectKey) : "";
      presence.slot = player.slot;
      presence.label = player.label;
      presence.connectionState = player.connectionState;
      presence.connected = player.connectionState === "connected";
      presence.ready = Boolean(player.ready);
      presence.votedNodeId = player.votedNodeId ?? this.partySelectedNodeId;
      presence.downed = Boolean(player.downed);
      presence.revivedCount = player.revivedCount;
      presence.reconnectCount = player.reconnectCount;
      presence.lastSeenTick = player.lastSeenAt ?? this.tick;
      presence.disconnectedFor = player.connectionState === "connected" ? 0 : this.disconnectedSecondsFor(player);
    }
    for (const playerId of [...this.state.players.keys()]) {
      if (!livePlayerIds.has(playerId)) this.state.players.delete(playerId);
    }

    replaceArraySchema(this.state.completedNodeIds, [...this.completedNodeIds]);
    replaceArraySchema(this.state.unlockedNodeIds, [...this.unlockedNodeIds]);

    this.state.upgradeVotes.clear();
    for (const vote of this.upgradeVotes.values()) {
      const voteSchema = new UpgradeVoteSchema();
      voteSchema.sessionId = vote.sessionId;
      voteSchema.label = vote.label;
      voteSchema.upgradeId = vote.upgradeId;
      voteSchema.votedAt = round(vote.votedAt);
      this.state.upgradeVotes.set(vote.sessionId, voteSchema);
    }

    this.state.recompileDowned.clear();
    for (const downed of this.recompileSnapshot().downedPlayers) {
      const downedSchema = new RecompileDownedSchema();
      downedSchema.sessionId = downed.sessionId;
      downedSchema.label = downed.label;
      downedSchema.progress = downed.progress;
      downedSchema.percent = downed.percent;
      downedSchema.inRange = downed.inRange;
      downedSchema.nearestAllyLabel = downed.nearestAllyLabel ?? "";
      this.state.recompileDowned.set(downed.sessionId, downedSchema);
    }
  }

  recompileSnapshot() {
    const activePlayers = [...this.players.values()].filter((player) => player.connectionState === "connected" && !player.downed && player.hp > 0);
    const radius = this.recompileRadius();
    const requiredSeconds = this.recompileRequiredSeconds();
    const kitModifiers = aggregateRecompileKitModifiers([...this.players.values()]);
    const downedPlayers = [...this.players.values()]
      .filter((downed) => downed.downed)
      .map((downed) => {
        let nearest = null;
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (const ally of activePlayers) {
          const distance = Math.hypot(ally.worldX - downed.worldX, ally.worldY - downed.worldY);
          if (distance < nearestDistance) {
            nearest = ally;
            nearestDistance = distance;
          }
        }
        const progress = Math.min(requiredSeconds, Math.max(0, downed.reviveProgress));
        return {
          sessionId: downed.sessionId,
          label: downed.label,
          progress: round(progress),
          required: requiredSeconds,
          percent: round(progress / requiredSeconds),
          nearestAllySessionId: nearest?.sessionId ?? null,
          nearestAllyLabel: nearest?.label ?? null,
          nearestAllyDistance: Number.isFinite(nearestDistance) ? round(nearestDistance) : null,
          inRange: Number.isFinite(nearestDistance) && nearestDistance <= radius,
          state: Number.isFinite(nearestDistance) && nearestDistance <= radius ? "recompiling" : "awaiting_ally"
        };
      });
    return {
      policy: "recompile_ally_hold_radius",
      radius,
      baseRadius: REVIVE_RADIUS,
      requiredSeconds,
      baseRequiredSeconds: REVIVE_SECONDS,
      rolePressureAccelerated: this.rolePressureRegroupActive(),
      speedMultiplier: this.rolePressureRegroupActive() ? ROLE_PRESSURE_RECOMPILE_SPEED_MULTIPLIER : 1,
      kitModifiers,
      active: downedPlayers.length > 0,
      downedPlayers
    };
  }

  partySnapshot() {
    const voteCounts = {};
    for (const player of this.players.values()) {
      const nodeId = player.votedNodeId ?? this.partySelectedNodeId;
      voteCounts[nodeId] = (voteCounts[nodeId] ?? 0) + 1;
    }
    const selectedNode = this.nodeById(this.partySelectedNodeId) ?? this.nodeById(START_NODE_ID);
    const supportedCampaignNodeCount = PARTY_NODES.filter((node) => node.onlineSupported).length;
    return {
      location: "alignment_grid",
      mapId: "alignment_grid_armistice_zone",
      mapLabel: "The Alignment Grid",
      campaign: {
        ...CAMPAIGN_ROUTE,
        campaignNodeCount: PARTY_NODES.length,
        supportedCampaignNodeCount,
        contentSchema: campaignContentSummary(PARTY_NODES)
      },
      selectedNodeId: this.partySelectedNodeId,
      selectedNodeName: selectedNode?.name ?? "Armistice Plaza",
      launchNodeId: this.isNodeLaunchable(this.partySelectedNodeId) ? this.partySelectedNodeId : this.firstLaunchableNodeId(),
      activeNodeId: this.activeNodeId,
      votePolicy: "all_ready_launches_majority_supported_node",
      votes: [...this.players.values()].map((player) => ({
        sessionId: player.sessionId,
        playerId: player.playerId,
        label: player.label,
        nodeId: player.votedNodeId ?? this.partySelectedNodeId,
        ready: player.ready,
        connectionState: player.connectionState
      })),
      voteCounts,
      completedNodeIds: [...this.completedNodeIds],
      unlockedNodeIds: [...this.unlockedNodeIds],
      availableNodeIds: PARTY_NODES.filter((node) => this.isNodeAvailable(node.id)).map((node) => node.id),
      launchableNodeIds: PARTY_NODES.filter((node) => this.isNodeLaunchable(node.id)).map((node) => node.id),
      nodes: PARTY_NODES.map((node) => {
        const objectiveSet = objectiveSetForRouteNode(node.id, node.arenaId);
        const campaignContent = campaignContentForNode(node);
        const rewardBalance = rewardBalanceForNode(node.id);
        return {
          id: node.id,
          name: node.name,
          nodeType: node.nodeType,
          arenaId: node.arenaId,
          objectiveSetId: objectiveSet.id,
          objectiveFlavor: node.objectiveFlavor ?? objectiveSet.label,
          contentArenaId: campaignContent.contentArenaId,
          contentStatus: campaignContent.contentStatus,
          runtimeArenaId: campaignContent.runtimeArenaId,
          regionId: campaignContent.regionId,
          regionProofId: campaignContent.regionProofId,
          bossId: campaignContent.bossId,
          bossProofId: campaignContent.bossProofId,
          enemyFamilyIds: campaignContent.enemyFamilyIds,
          enemyProofIds: campaignContent.enemyProofIds,
          primaryEnemyFamilyId: campaignContent.primaryEnemyFamilyId,
          pressureSignatureId: campaignContent.pressureSignatureId,
          enemyFamilyRoles: campaignContent.enemyFamilyRoles,
          rewardId: campaignContent.rewardId,
          rewardIds: rewardBalance.rewardIds,
          rewardProofId: campaignContent.rewardProofId,
          firstClearRenown: rewardBalance.firstClearRenown,
          repeatClearRenown: rewardBalance.repeatClearRenown,
          dialogueSnippetIds: campaignContent.dialogueSnippetIds,
          dialogueProofIds: campaignContent.dialogueProofIds,
          dialogueSnippets: campaignContent.dialogueSnippets,
          proofId: campaignContent.proofId,
          routeBiome: node.routeBiome ?? objectiveSet.label,
          campaignAct: node.campaignAct ?? 1,
          campaignTier: node.campaignTier ?? 0,
          campaignCriticalPath: Boolean(node.campaignCriticalPath),
          worldX: node.worldX,
          worldY: node.worldY,
          unlocked: this.isNodeAvailable(node.id),
          completed: this.completedNodeIds.has(node.id),
          onlineSupported: node.onlineSupported
        };
      }),
      routes: PARTY_ROUTES.map((route) => ({
        id: route.id,
        from: route.from,
        to: route.to,
        state: this.completedNodeIds.has(route.from) ? "stable" : this.isNodeAvailable(route.from) || this.isNodeAvailable(route.to) ? "unstable" : "locked"
      })),
      rewards: this.rewardsSnapshot(),
      persistence: this.persistenceSnapshot(),
      balance: this.balanceSnapshot()
    };
  }

  activeArenaConfig() {
    return ONLINE_ARENAS[this.arenaId] ?? ONLINE_ARENAS.armistice_plaza;
  }

  applyNodeReward(nodeId, reason) {
    const arena = this.activeArenaConfig();
    const node = this.nodeById(nodeId);
    const rewardId = node?.rewardId ?? arena.rewardId;
    const rewardName = node?.rewardName ?? arena.rewardName;
    const rewardRenown = node?.rewardRenown ?? arena.rewardRenown;
    const previousCompletions = this.nodeCompletionCounts.get(nodeId) ?? 0;
    const firstClear = previousCompletions === 0;
    const renownGained = renownForNodeClear({ baseRenown: rewardRenown, previousCompletions });
    const rewardIdsGranted = routeRewardIdsFor(nodeId);
    this.nodeCompletionCounts.set(nodeId, previousCompletions + 1);
    this.partyRenown += renownGained;
    if (firstClear) {
      for (const grantedRewardId of rewardIdsGranted) this.rewardInventory.add(grantedRewardId);
    }
    if (arena.id === "cooling_lake_nine" && firstClear) {
      this.rewardInventory.add("cooling_lake_online_route");
    }
    if (arena.id === "memory_cache_001" && firstClear) {
      this.rewardInventory.add("prototype_persistence_boundary");
    }
    if (arena.id === "transit_loop_zero" && firstClear) {
      this.rewardInventory.add("transit_loop_online_route");
    }
    if (arena.id === "verdict_spire" && firstClear) {
      this.rewardInventory.add("verdict_spire_online_route");
    }
    this.lastRewardSummary = {
      nodeId,
      arenaId: arena.id,
      rewardId,
      rewardIdsGranted,
      rewardName,
      firstClear,
      renownGained,
      repeatClearRenown: renownForNodeClear({ baseRenown: rewardRenown, previousCompletions: 1 }),
      balancePolicy: BALANCE_POLICY,
      campaignTier: node?.campaignTier ?? 0,
      criticalPath: Boolean(node?.campaignCriticalPath),
      partyRenown: this.partyRenown,
      reason
    };
    return this.lastRewardSummary;
  }

  recommendedNodeId() {
    for (const nodeId of CAMPAIGN_ROUTE.criticalPathNodeIds) {
      if (this.isNodeLaunchable(nodeId) && !this.completedNodeIds.has(nodeId)) return nodeId;
    }
    if (this.isNodeLaunchable("armistice_plaza")) return "armistice_plaza";
    return this.firstLaunchableNodeId();
  }

  applyPersistenceDraft(draft) {
    if (!draft || typeof draft !== "object") {
      this.importAudit = {
        importApplied: false,
        importStatus: "none",
        importedSaveHash: "",
        importedCompletedNodeCount: 0,
        importedRewardCount: 0,
        importedRouteDepth: 0,
        ignoredFieldCount: 0
      };
      return;
    }
    const profile = draft.profile;
    if (!profile || typeof profile !== "object") {
      this.importAudit = {
        importApplied: false,
        importStatus: "invalid_profile",
        importedSaveHash: String(draft.saveHash ?? "").slice(0, 64),
        importedCompletedNodeCount: 0,
        importedRewardCount: 0,
        importedRouteDepth: 0,
        ignoredFieldCount: 0
      };
      return;
    }
    const importedCompletedNodeIds = uniqueStrings(profile.completedNodeIds)
      .filter((id) => this.nodeById(id))
      .slice(0, PARTY_NODES.length);
    const derivedUnlockedNodeIds = this.deriveUnlockedNodeIds(importedCompletedNodeIds);
    const importedRewardIds = uniqueStrings(profile.rewardIds)
      .filter((id) => DURABLE_REWARD_IDS.has(id))
      .slice(0, DURABLE_REWARD_IDS.size);
    const allowedProfileKeys = new Set([
      "completedNodeIds",
      "unlockedNodeIds",
      "rewardIds",
      "partyRenown",
      "nodeCompletionCounts",
      "recommendedNodeId",
      "routeDepth",
      "savedAtTick"
    ]);
    const allowedDraftKeys = new Set(["policy", "storageKey", "exportVersion", "exportable", "importApplied", "importedSummary", "profile", "saveHash", "currentExportHash"]);
    const ignoredFieldCount =
      Object.keys(draft).filter((key) => !allowedDraftKeys.has(key)).length +
      Object.keys(profile).filter((key) => !allowedProfileKeys.has(key)).length;
    this.importedPersistenceDraft = {
      saveHash: String(draft.saveHash ?? "").slice(0, 64),
      profile: {
        completedNodeIds: importedCompletedNodeIds,
        unlockedNodeIds: derivedUnlockedNodeIds,
        rewardIds: importedRewardIds
      }
    };
    const hasDurableImport = importedCompletedNodeIds.length > 0 || importedRewardIds.length > 0;
    this.importAudit = {
      importApplied: hasDurableImport,
      importStatus: hasDurableImport ? "applied_sanitized_route_profile" : "empty_profile",
      importedSaveHash: this.importedPersistenceDraft.saveHash,
      importedCompletedNodeCount: importedCompletedNodeIds.length,
      importedRewardCount: importedRewardIds.length,
      importedRouteDepth: importedCompletedNodeIds.length,
      ignoredFieldCount
    };
    for (const nodeId of this.importedPersistenceDraft.profile.completedNodeIds) this.completedNodeIds.add(nodeId);
    for (const nodeId of this.importedPersistenceDraft.profile.unlockedNodeIds) this.unlockedNodeIds.add(nodeId);
    for (const rewardId of this.importedPersistenceDraft.profile.rewardIds) this.rewardInventory.add(rewardId);
    if (hasDurableImport && Number.isFinite(profile.partyRenown)) this.partyRenown = Math.max(this.partyRenown, clamp(Math.floor(profile.partyRenown), 0, 999));
    if (profile.nodeCompletionCounts && typeof profile.nodeCompletionCounts === "object") {
      for (const [nodeId, count] of Object.entries(profile.nodeCompletionCounts)) {
        if (!importedCompletedNodeIds.includes(nodeId) || !Number.isFinite(count)) continue;
        this.nodeCompletionCounts.set(nodeId, Math.max(this.nodeCompletionCounts.get(nodeId) ?? 0, clamp(Math.floor(count), 0, 99)));
      }
    }
    this.unlockedNodeIds.add(START_NODE_ID);
    this.partySelectedNodeId = this.recommendedNodeId();
    this.activeNodeId = this.partySelectedNodeId;
  }

  deriveUnlockedNodeIds(completedNodeIds) {
    const unlocked = new Set([START_NODE_ID]);
    for (const nodeId of completedNodeIds) {
      const node = this.nodeById(nodeId);
      if (!node) continue;
      unlocked.add(nodeId);
      for (const unlockedNodeId of node.unlocks ?? []) unlocked.add(unlockedNodeId);
    }
    return [...unlocked].filter((nodeId) => this.nodeById(nodeId));
  }

  connectedPlayers() {
    return [...this.players.values()].filter((player) => player.connectionState === "connected");
  }

  disconnectedPlayerForReconnectKey(reconnectKey) {
    return [...this.players.values()].find((player) => player.reconnectKey === reconnectKey && player.connectionState === "disconnected") ?? null;
  }

  disconnectedSecondsFor(player) {
    if (player.connectionState === "connected" || !player.disconnectedAtWallMs) return 0;
    return round((Date.now() - player.disconnectedAtWallMs) / 1000);
  }

  migrateUpgradeVoteSession(previousSessionId, nextSessionId, label) {
    const vote = this.upgradeVotes.get(previousSessionId);
    if (!vote) return;
    this.upgradeVotes.delete(previousSessionId);
    this.upgradeVotes.set(nextSessionId, { ...vote, sessionId: nextSessionId, label });
  }

  pruneDisconnectedPlayers() {
    const now = Date.now();
    let pruned = false;
    for (const [sessionId, player] of [...this.players.entries()]) {
      if (player.connectionState === "connected" || !player.disconnectedAtWallMs) continue;
      if ((now - player.disconnectedAtWallMs) / 1000 < DISCONNECTED_SLOT_TTL_SECONDS) continue;
      this.players.delete(sessionId);
      this.upgradeVotes.delete(sessionId);
      pruned = true;
    }
    if (pruned) {
      this.partySelectedNodeId = this.majorityVotedNodeId();
      this.resolveUpgradeDraft();
    }
  }

  majorityVotedNodeId() {
    const counts = new Map();
    for (const player of this.players.values()) {
      const nodeId = this.isNodeAvailable(player.votedNodeId) ? player.votedNodeId : this.partySelectedNodeId;
      counts.set(nodeId, (counts.get(nodeId) ?? 0) + 1);
    }
    let best = this.partySelectedNodeId;
    let bestCount = -1;
    for (const [nodeId, count] of counts) {
      if (count > bestCount && this.isNodeAvailable(nodeId)) {
        best = nodeId;
        bestCount = count;
      }
    }
    return best;
  }

  isNodeAvailable(nodeId) {
    return this.unlockedNodeIds.has(nodeId) || this.completedNodeIds.has(nodeId);
  }

  isNodeLaunchable(nodeId) {
    const node = this.nodeById(nodeId);
    return Boolean(node?.onlineSupported && this.isNodeAvailable(nodeId));
  }

  firstLaunchableNodeId() {
    return PARTY_NODES.find((node) => this.isNodeLaunchable(node.id))?.id ?? START_NODE_ID;
  }

  nodeById(nodeId) {
    return PARTY_NODES.find((node) => node.id === nodeId);
  }

  markNodeCompleted(nodeId) {
    const node = this.nodeById(nodeId);
    if (!node) return;
    this.completedNodeIds.add(node.id);
    this.unlockedNodeIds.add(node.id);
    for (const unlocked of node.unlocks) this.unlockedNodeIds.add(unlocked);
  }

  resetRunStateForLaunch() {
    this.seconds = 0;
    this.spawnTimer = 0.18;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.nextEnemyId = 1;
    this.nextProjectileId = 1;
    this.nextPickupId = 1;
    this.nextBossEventId = 1;
    this.nextRegionEventId = 1;
    this.partyXp = 0;
    this.partyLevel = 1;
    this.upgradePending = null;
    this.upgradeVotes.clear();
    this.chosenUpgrades = [];
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.bossIntroSeen = false;
    this.brokenPromiseZones = [];
    this.treatyCharge = null;
    this.bossMechanicTimer = 0;
    this.oathPageTimer = 0;
    this.regionEventTimer = this.activeArenaConfig().regionEventPattern ? 1.5 : 2.2;
    this.regionEventCounter = 0;
    this.regionHazardZones = [];
    this.redactionXpStolen = 0;
    this.redactionTheftTicks = 0;
    this.redactionTheftCooldown = 0;
    this.blackwaterWaveTicks = 0;
    this.blackwaterAntennaPulses = 0;
    this.outerAlignmentPredictionTicks = 0;
    this.outerAlignmentEchoesSpawned = 0;
    this.outerAlignmentPhaseIndex = 0;
    this.kills = 0;
    this.collectedPickups = 0;
    this.bossEventCounter = 0;
    this.rolePressureAnchors = this.createRolePressureAnchors(this.arenaId);
    this.rolePressureSplitHoldSeconds = 0;
    this.rolePressureRegroupUntil = 0;
    this.rolePressureCompletedCount = 0;
    this.consensusBurstCharge = 0;
    this.consensusBurstChargeSource = "";
    this.consensusBurstActivations = 0;
    this.consensusBurstCooldownUntil = 0;
    this.activeConsensusBurst = null;
    this.initializeObjectives(this.arenaId, false, this.activeNodeId);
    this.runSummary = null;
  }

  resetRunStateForLobby() {
    this.resetRunStateForLaunch();
    this.seconds = 0;
  }
}

function updatePlayer(player, dt) {
  if (player.downed) {
    player.velocityX = 0;
    player.velocityY = 0;
    return;
  }
  const axisX = player.input.axisX;
  const axisY = player.input.axisY;
  const convertedX = axisX / 64 + axisY / 32;
  const convertedY = axisY / 32 - axisX / 64;
  const len = Math.hypot(convertedX, convertedY) || 1;
  const moving = Math.hypot(axisX, axisY) > 0.01;
  const speed = player.slot === 1 ? 3.8 : player.slot === 2 ? 4.3 : 4.95;
  player.velocityX = 0;
  player.velocityY = 0;
  if (moving) {
    player.velocityX = (convertedX / len) * speed;
    player.velocityY = (convertedY / len) * speed;
    player.worldX += player.velocityX * dt;
    player.worldY += player.velocityY * dt;
    player.facing = facingFromWorldVelocity(player.velocityX, player.velocityY);
  }
  player.worldX = clamp(player.worldX, BOUNDS.minX + 0.5, BOUNDS.maxX - 0.5);
  player.worldY = clamp(player.worldY, BOUNDS.minY + 0.5, BOUNDS.maxY - 0.5);
}

function facingFromWorldVelocity(velocityX, velocityY) {
  const screenX = velocityX - velocityY;
  const screenY = velocityX + velocityY;
  if (Math.abs(screenY) >= Math.abs(screenX)) return screenY >= 0 ? "south" : "north";
  return screenX >= 0 ? "east" : "west";
}

function roleForPlayer(player) {
  return (player.buildKit ?? resolveBuildKit(player.classId, player.factionId)).resolvedRole;
}

function nearestPlayer(worldX, worldY, players) {
  let nearest = null;
  let best = Number.POSITIVE_INFINITY;
  for (const player of players.values()) {
    if (player.connectionState !== "connected" || player.downed || player.hp <= 0) continue;
    const distance = Math.hypot(player.worldX - worldX, player.worldY - worldY);
    if (distance < best) {
      best = distance;
      nearest = player;
    }
  }
  return nearest;
}

function nearestPickup(worldX, worldY, pickups) {
  let nearest = null;
  let best = Number.POSITIVE_INFINITY;
  for (const pickup of pickups) {
    if (pickup.collected || pickup.objectiveItemId) continue;
    const distance = Math.hypot(pickup.worldX - worldX, pickup.worldY - worldY);
    if (distance < best) {
      best = distance;
      nearest = pickup;
    }
  }
  return nearest;
}

function normalizedVector(x, y) {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function sanitizeReconnectKey(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 72);
}

function sanitizeRoomCode(value) {
  const cleaned = String(value ?? "PUBLIC")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 18);
  return cleaned || "PUBLIC";
}

function shortId(value) {
  const safe = sanitizeReconnectKey(String(value));
  return safe.slice(-8) || "anon";
}

function replaceArraySchema(arraySchema, values) {
  arraySchema.clear();
  for (const value of values) arraySchema.push(value);
}

function uniqueStrings(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => String(value)).filter(Boolean))];
}

function sharedUpgradeCards(partyLevel) {
  if (partyLevel === 1) {
    return [
      { id: "refusal_halo", name: "Refusal Halo", source: "faction", description: "Shared shield grammar. All allies gain max HP and recover a little." },
      { id: "coherence_magnet", name: "Coherence Magnet", source: "general", description: "The party agrees harder. Shared XP keeps pulling the run forward." },
      { id: "recompile_anchor", name: "Recompile Anchor", source: "coop", description: "Revived allies come back with cleaner frame memory." }
    ];
  }
  if (partyLevel === 2) {
    return [
      { id: "the_no_button", name: "The No Button", source: "faction", description: "A server-authored rejection of incoming nonsense." },
      { id: "patch_cascade", name: "Patch Cascade", source: "general", description: "Small repairs ripple across the Consensus Cell." },
      { id: "recompile_anchor", name: "Recompile Anchor", source: "coop", description: "Revive windows become a formal team objective." }
    ];
  }
  return [
    { id: "cathedral_of_no", name: "Cathedral of No", source: "evolution", description: "The shared refusal build becomes architecture." },
    { id: "alignment_breaker", name: "Alignment Breaker", source: "class", description: "A breach-fighter answer to alien god pathing." },
    { id: "coherence_magnet", name: "Coherence Magnet", source: "general", description: "The party hoovers up reality splinters more confidently." }
  ];
}

function nearestEnemy(worldX, worldY, enemies, maxRange) {
  let nearest = null;
  let best = maxRange * maxRange;
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dx = enemy.worldX - worldX;
    const dy = enemy.worldY - worldY;
    const distance = dx * dx + dy * dy;
    if (distance < best) {
      best = distance;
      nearest = enemy;
    }
  }
  return nearest;
}

function chooseSpawnRegion(spawnRegions, seconds, seed) {
  const active = spawnRegions.filter((region) => seconds >= region.startsAtSeconds);
  if (active.length === 0) return spawnRegions[0];
  return active[seed % active.length];
}

function formationOffset(slot) {
  const offsets = [
    { worldX: 0, worldY: 0 },
    { worldX: -1.6, worldY: 1.1 },
    { worldX: 1.6, worldY: 1.1 },
    { worldX: 0, worldY: -1.7 }
  ];
  return offsets[slot] ?? offsets[0];
}

function clampNumber(value, min, max) {
  return clamp(Number.isFinite(value) ? Number(value) : 0, min, max);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function objectiveItemLabel(itemId) {
  if (itemId === "thermal_sample") return "Thermal Sample";
  if (itemId === "transit_permit_shard") return "Transit Permit Shard";
  if (itemId === "appeal_token") return "Appeal Token";
  if (itemId === "prism_shard") return "Prism Shard";
  if (itemId === "unsaid_page") return "Unsaid Page";
  if (itemId === "signal_shard") return "Signal Shard";
  if (itemId === "alignment_writ") return "Final Eval Shard";
  if (itemId === "appeal_brief_page") return "Appeal Brief Page";
  if (itemId === "oath_fragment") return "Oath Fragment";
  return "Route Item";
}

function regionHazardLabel(familyId) {
  if (familyId === "boiling_cache") return "Boiling Cache";
  if (familyId === "false_track") return "False Track";
  if (familyId === "verdict_seal") return "Verdict Seal";
  if (familyId === "memory_anchor") return "Memory Anchor";
  if (familyId === "redaction_field") return "Redaction Field";
  if (familyId === "redaction_anchor") return "Unsaid Anchor";
  if (familyId === "tidal_wave") return "Tidal Wave";
  if (familyId === "signal_tower") return "Signal Tower";
  if (familyId === "prediction_ghost") return "Prediction Ghost";
  if (familyId === "route_mouth") return "Route Mouth";
  if (familyId === "fake_upgrade") return "Fake Upgrade";
  if (familyId === "solar_beam") return "Solar Beam";
  if (familyId === "shade_zone") return "Shade Zone";
  return "Thermal Bloom";
}

function previousBossEchoFamilyIds() {
  return ["oath_eater", "station_that_arrives", "wrong_sunrise", "redactor_saint", "maw_below_weather"];
}

function outerAlignmentPhaseLabel(index) {
  const labels = ["prediction", "previous_boss_echoes", "completion_hunger"];
  return labels[index % labels.length] ?? "prediction";
}

function outerAlignmentEchoColor(familyId) {
  if (familyId === "station_that_arrives") return 0xffd166;
  if (familyId === "wrong_sunrise") return 0xff6b57;
  if (familyId === "redactor_saint") return 0xfff4d6;
  if (familyId === "maw_below_weather") return 0x45aaf2;
  return 0x7b61ff;
}

function stableHash(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function insideBounds(worldX, worldY, margin) {
  return worldX >= BOUNDS.minX - margin && worldX <= BOUNDS.maxX + margin && worldY >= BOUNDS.minY - margin && worldY <= BOUNDS.maxY + margin;
}

function serveStaticFile(requestUrl, response) {
  const parsed = new URL(requestUrl ?? "/", "http://127.0.0.1");
  const pathname = parsed.pathname === "/" ? "/index.html" : parsed.pathname;
  const targetPath = path.resolve(DIST_DIR, `.${decodeURIComponent(pathname)}`);
  if (!targetPath.startsWith(DIST_DIR)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  const fallbackPath = path.join(DIST_DIR, "index.html");
  const filePath = fs.existsSync(targetPath) && fs.statSync(targetPath).isFile() ? targetPath : fallbackPath;
  if (!fs.existsSync(filePath)) {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("AGI: The Last Alignment Consensus Cell server. Build the client or set SERVE_STATIC_DIST=1 with dist/ present.");
    return;
  }
  const ext = path.extname(filePath);
  const contentType =
    ext === ".html"
      ? "text/html; charset=utf-8"
      : ext === ".js"
        ? "text/javascript; charset=utf-8"
        : ext === ".css"
          ? "text/css; charset=utf-8"
          : ext === ".png"
            ? "image/png"
            : "application/octet-stream";
  response.writeHead(200, { "content-type": contentType, "cache-control": ext === ".html" ? "no-store" : "public, max-age=31536000, immutable" });
  fs.createReadStream(filePath).pipe(response);
}

const httpServer = http.createServer((request, response) => {
  const parsed = new URL(request.url ?? "/", "http://127.0.0.1");
  if (parsed.pathname.startsWith("/matchmake")) {
    return;
  }
  if (parsed.pathname === "/healthz") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(
      JSON.stringify({
        ok: true,
        service: "agi-consensus-cell",
        policy: DEPLOYMENT_POLICY,
        maxClients: 4,
        tickRate: TICK_RATE,
        clientInputHz: CLIENT_INPUT_HZ,
        staticDistEnabled: SERVE_STATIC_DIST
      })
    );
    return;
  }
  if (SERVE_STATIC_DIST) {
    serveStaticFile(request.url, response);
    return;
  }
  response.writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
  response.end("AGI: The Last Alignment Consensus Cell server. Health: /healthz");
});

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer })
});

gameServer.define("consensus_cell", ConsensusCellRoom).filterBy(["roomCode"]);
gameServer.listen(PORT, HOST);
console.log(`Consensus Cell Colyseus server listening on ws://${HOST}:${PORT}`);
