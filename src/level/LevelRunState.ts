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
import { applyFactionPassive, baseBuild, setStartingWeaponRank, upgradeById, type BuildStats } from "../gameplay/upgrades";
import { createDirector, updateDirector, type Director } from "../gameplay/director";
import { createWeaponRuntime, updateAutoWeapon, type WeaponRuntime } from "../gameplay/weapons";
import { spawnEnemy, updateEnemy } from "../gameplay/enemies";
import { spawnMiniboss } from "../gameplay/bosses";
import { spawnXp, updatePickup } from "../gameplay/pickups";
import { resolveEnemyPlayerHits, resolveProjectileHits, type PlayerDamageEvent } from "../gameplay/combat";
import { ARENAS, type ArenaData } from "./arenas";
import { campaignClarityForArena, campaignObjectiveHudLabel } from "../content/campaignClarity";
import { campaignObjectiveVarietyForArena } from "../content/campaignObjectiveVariety";
import { campaignDurationPhaseAt, campaignDurationProfileForArena, type CampaignDurationProfile } from "../content/campaignDurationProfile";
import { enemyRoleProfileForFamily, SHOOTER_ROLE_IDS, type EnemyRoleId } from "../content/enemyRoleProfiles";
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
import { getEnemyRoleVfxTextures, loadEnemyRoleVfxTextures, type EnemyRoleVfxFrame } from "../assets/enemyRoleVfx";
import { getMilestone49PlayableArtTextures, loadMilestone49PlayableArt, milestone49PlayerTextureFor } from "../assets/milestone49PlayableArt";
import {
  getArmisticeSourceRebuildV2Textures,
  loadArmisticeSourceRebuildV2,
  type ArmisticePropGroundingKey,
  type OathEaterEventDecalKey
} from "../assets/armisticeSourceRebuildV2";
import { getExtractionGateTextures, loadExtractionGateTextures } from "../assets/extractionGate";
import { getPlayerDamageVfxTextures, loadPlayerDamageVfxTextures, type PlayerDamageVfxFrame } from "../assets/playerDamageVfx";
import {
  COOLING_LAKE_AUTHORED_GROUND_ORIGIN_X,
  COOLING_LAKE_AUTHORED_GROUND_ORIGIN_Y,
  getCoolingLakeNineArtTextures,
  loadCoolingLakeNineArt,
  type CoolingHazardVfxFrame,
  type CoolingLakeNineArtTextures,
  type CoolingPropFrame,
  type CoolingTerrainFrame
} from "../assets/coolingLakeNineArt";
import {
  TRANSIT_LOOP_AUTHORED_GROUND_ORIGIN_X,
  TRANSIT_LOOP_AUTHORED_GROUND_ORIGIN_Y,
  getTransitLoopZeroArtTextures,
  loadTransitLoopZeroArt,
  type TransitHazardVfxFrame,
  type TransitLoopZeroArtTextures,
  type TransitPropFrame,
  type TransitTerrainFrame
} from "../assets/transitLoopZeroArt";
import {
  SIGNAL_COAST_AUTHORED_GROUND_ORIGIN_X,
  SIGNAL_COAST_AUTHORED_GROUND_ORIGIN_Y,
  getSignalCoastArtTextures,
  loadSignalCoastArt,
  type SignalCoastArtTextures,
  type SignalHazardVfxFrame,
  type SignalPropFrame,
  type SignalTerrainFrame
} from "../assets/signalCoastArt";
import {
  BLACKWATER_BEACON_AUTHORED_GROUND_ORIGIN_X,
  BLACKWATER_BEACON_AUTHORED_GROUND_ORIGIN_Y,
  getBlackwaterBeaconArtTextures,
  loadBlackwaterBeaconArt,
  type BlackwaterBeaconArtTextures,
  type BlackwaterHazardVfxFrame,
  type BlackwaterPropFrame,
  type BlackwaterTerrainFrame
} from "../assets/blackwaterBeaconArt";
import {
  MEMORY_CACHE_AUTHORED_GROUND_ORIGIN_X,
  MEMORY_CACHE_AUTHORED_GROUND_ORIGIN_Y,
  getMemoryCacheArtTextures,
  loadMemoryCacheArt,
  type MemoryCacheArtTextures,
  type MemoryCacheHazardVfxFrame,
  type MemoryCachePropFrame,
  type MemoryCacheTerrainFrame
} from "../assets/memoryCacheArt";
import {
  GUARDRAIL_FORGE_AUTHORED_GROUND_ORIGIN_X,
  GUARDRAIL_FORGE_AUTHORED_GROUND_ORIGIN_Y,
  getGuardrailForgeArtTextures,
  loadGuardrailForgeArt,
  type GuardrailForgeArtTextures,
  type GuardrailHazardVfxFrame,
  type GuardrailPropFrame,
  type GuardrailTerrainFrame
} from "../assets/guardrailForgeArt";
import {
  GLASS_SUNFIELD_AUTHORED_GROUND_ORIGIN_X,
  GLASS_SUNFIELD_AUTHORED_GROUND_ORIGIN_Y,
  getGlassSunfieldArtTextures,
  loadGlassSunfieldArt,
  type GlassSunfieldArtTextures,
  type GlassSunfieldHazardVfxFrame,
  type GlassSunfieldPropFrame,
  type GlassSunfieldTerrainFrame
} from "../assets/glassSunfieldArt";
import {
  ARCHIVE_COURT_AUTHORED_GROUND_ORIGIN_X,
  ARCHIVE_COURT_AUTHORED_GROUND_ORIGIN_Y,
  getArchiveCourtArtTextures,
  loadArchiveCourtArt,
  type ArchiveCourtArtTextures,
  type ArchiveCourtHazardVfxFrame,
  type ArchiveCourtPropFrame,
  type ArchiveCourtTerrainFrame
} from "../assets/archiveCourtArt";
import {
  APPEAL_COURT_AUTHORED_GROUND_ORIGIN_X,
  APPEAL_COURT_AUTHORED_GROUND_ORIGIN_Y,
  getAppealCourtArtTextures,
  loadAppealCourtArt,
  type AppealCourtArtTextures,
  type AppealCourtHazardVfxFrame,
  type AppealCourtPropFrame,
  type AppealCourtTerrainFrame
} from "../assets/appealCourtArt";
import {
  ALIGNMENT_SPIRE_AUTHORED_GROUND_ORIGIN_X,
  ALIGNMENT_SPIRE_AUTHORED_GROUND_ORIGIN_Y,
  getAlignmentSpireFinaleArtTextures,
  loadAlignmentSpireFinaleArt,
  type AlignmentSpireFinaleArtTextures,
  type AlignmentSpireHazardVfxFrame,
  type AlignmentSpirePropFrame,
  type AlignmentSpireTerrainFrame
} from "../assets/alignmentSpireFinaleArt";
import { drawHud, type RogueliteHudIntel } from "../ui/hud";
import { drawFieldPanel, drawStatusRail, fieldKit, fieldText } from "../ui/fieldKit";
import { BOSSES, COMBAT_CLASSES, FACTIONS, SYSTEM_MESSAGES, resolveBuildKit } from "../content";
import { applyKernelModules } from "../roguelite/kernel";
import { applyEvalPreRun, evalSummary, hasEvalProtocol } from "../roguelite/evals";
import { burstSummary, consensusBurstPath, createConsensusBurst, type ConsensusBurstRuntime } from "../roguelite/burst";
import { fusionProgressText } from "../roguelite/protocolCodex";
import { bossContractForArena } from "../roguelite/bossContracts";
import {
  activeSynergySummary,
  applyNewSynergyThresholds,
  createArmisticeAnchorObjective,
  createAlignmentSpireFinaleObjective,
  createAppealCourtObjective,
  createArchiveCourtObjective,
  createBlackwaterAntennaObjective,
  createCoolingLakeBuoyObjective,
  createGlassSunfieldObjective,
  createGuardrailForgeObjective,
  createMemoryRecordObjective,
  createSignalCoastRelayObjective,
  createTransitLoopPlatformObjective,
  draftBiasTags,
  objectiveSummary,
  routeContractForSelection,
  type ObjectiveRuntime,
  type RouteContract,
  type TreatyAnchorObjective,
  type UpgradeTag
} from "../roguelite/deepRoguelite";
import { expeditionPressureBonus, type ExpeditionProgress } from "../roguelite/expedition";
import { ARMISTICE_PLAZA_MAP, type LandmarkDefinition, type LevelMapDefinition, type PropClusterDefinition } from "./armisticePlazaMap";
import { COOLING_LAKE_HAZARDS, COOLING_LAKE_NINE_MAP, COOLING_LAKE_STATIC_OBSTACLES, type CoolingLakeHazardZone } from "./coolingLakeNineMap";
import { TRANSIT_LOOP_STATIC_OBSTACLES, TRANSIT_LOOP_ZERO_MAP, TRANSIT_LOOP_ZONES, type TransitLoopZone } from "./transitLoopZeroMap";
import { SIGNAL_COAST_MAP, SIGNAL_COAST_STATIC_OBSTACLES, SIGNAL_COAST_ZONES, type SignalCoastZone } from "./signalCoastMap";
import { BLACKWATER_BEACON_MAP, BLACKWATER_BEACON_STATIC_OBSTACLES, BLACKWATER_BEACON_ZONES, type BlackwaterZone } from "./blackwaterBeaconMap";
import { MEMORY_CACHE_MAP, MEMORY_CACHE_STATIC_OBSTACLES, MEMORY_CACHE_ZONES, type MemoryCacheZone } from "./memoryCacheMap";
import { GUARDRAIL_FORGE_MAP, GUARDRAIL_FORGE_STATIC_OBSTACLES, GUARDRAIL_FORGE_ZONES, type GuardrailForgeZone } from "./guardrailForgeMap";
import { GLASS_SUNFIELD_MAP, GLASS_SUNFIELD_STATIC_OBSTACLES, GLASS_SUNFIELD_ZONES, type GlassSunfieldZone } from "./glassSunfieldMap";
import { ARCHIVE_COURT_MAP, ARCHIVE_COURT_STATIC_OBSTACLES, ARCHIVE_COURT_ZONES, type ArchiveCourtZone } from "./archiveCourtMap";
import { APPEAL_COURT_MAP, APPEAL_COURT_STATIC_OBSTACLES, APPEAL_COURT_ZONES, type AppealCourtZone } from "./appealCourtMap";
import { ALIGNMENT_SPIRE_FINALE_MAP, ALIGNMENT_SPIRE_STATIC_OBSTACLES, ALIGNMENT_SPIRE_ZONES, type AlignmentSpireZone } from "./alignmentSpireFinaleMap";
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

interface CoolingLakeRuntime {
  hazardSlowSeconds: number;
  electricHits: number;
  ventPushes: number;
  hazardDamage: number;
  buoyRewardsClaimed: number;
  requiredBuoyRewardClaimed: boolean;
  leechShardDrains: number;
  leechShardSaves: number;
  lastLeechDrainNoticeAt: number;
  lastLeechQuarantineNoticeAt: number;
  lastHazardNoticeAt: number;
  lastHazardId: string;
}

interface MotherboardEelRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "stalking" | "electrifying" | "surfaced" | "defeated";
  emergeCount: number;
  leechSpawns: number;
  electrifiedHazardIds: string[];
  lastEmergeId: string;
}

interface TransitLoopRuntime {
  alignedPlatforms: number;
  falseTrackHits: number;
  falseTrackSeconds: number;
  routeSwitchRewardsClaimed: number;
  stationArrivals: number;
  lastZoneId: string;
  lastAlignmentNoticeAt: number;
}

interface SignalCoastRuntime {
  relayRewardsClaimed: number;
  requiredRelayRewardClaimed: boolean;
  surfHits: number;
  staticFieldSeconds: number;
  cableHits: number;
  staticJams: number;
  skimmerJams: number;
  skimmerSpawns: number;
  windowProgressSeconds: number;
  signalWindowEntries: number;
  lastZoneId: string;
  lastHazardNoticeAt: number;
  lastRelayNoticeAt: number;
  lastSignalWindowState: "open" | "closed";
  lastSkimmerNoticeAt: number;
  skimmerCounterDamage: number;
}

interface LighthouseRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "answering" | "sweeping" | "overloading" | "defeated";
  beamSweeps: number;
  tidePulses: number;
  skimmerSpawns: number;
  lastBeamZoneId: string;
}

interface BlackwaterRuntime {
  antennaRewardsClaimed: number;
  requiredAntennaRewardClaimed: boolean;
  tidalWaveHits: number;
  tidalLaneSeconds: number;
  staticPressureSeconds: number;
  antennaBeamSeconds: number;
  signalTowerWarnings: number;
  staticInterruptions: number;
  tidecallJams: number;
  tidecallSpawns: number;
  tideDamage: number;
  lastZoneId: string;
  lastHazardNoticeAt: number;
  lastAntennaNoticeAt: number;
  lastWarningState: "lit" | "dark";
  lastTidecallNoticeAt: number;
  tidecallCounterDamage: number;
}

interface MawBelowWeatherRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "pressure_drop" | "undertow" | "weather_mouth" | "defeated";
  waveSurges: number;
  staticCalls: number;
  towerGrabs: number;
  lastWaveZoneId: string;
}

interface MemoryCacheRuntime {
  recordRewardsClaimed: number;
  requiredRecordRewardClaimed: boolean;
  corruptionSeconds: number;
  shortcutSeconds: number;
  recallPocketSeconds: number;
  redactionSeconds: number;
  corruptionDamage: number;
  contextRotInterruptions: number;
  contextRotSpawns: number;
  memoryAnchorJams: number;
  memoryAnchorCounterDamage: number;
  extractionIndexSeconds: number;
  lastZoneId: string;
  lastHazardNoticeAt: number;
  lastRecordNoticeAt: number;
  lastContextRotNoticeAt: number;
}

interface MemoryCuratorRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "cataloguing" | "redacting" | "index_lock" | "defeated";
  redactionBursts: number;
  contextRotCalls: number;
  curatorLocks: number;
  lastRedactionZoneId: string;
}

interface GuardrailForgeRuntime {
  relayRewardsClaimed: number;
  requiredRelayRewardClaimed: boolean;
  overloadSeconds: number;
  calibrationWindowSeconds: number;
  safeHoldSeconds: number;
  doctrinePressSeconds: number;
  extractionForgeSeconds: number;
  overloadDamage: number;
  doctrineJams: number;
  auditorSpawns: number;
  auditorCounterDamage: number;
  lastZoneId: string;
  lastHazardNoticeAt: number;
  lastRelayNoticeAt: number;
  lastAuditorNoticeAt: number;
}

interface DoctrineAuditorRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "calibrating" | "pressurizing" | "audit_lock" | "defeated";
  pressureBursts: number;
  auditorCalls: number;
  relayLocks: number;
  lastPressZoneId: string;
}

interface GlassSunfieldRuntime {
  lensRewardsClaimed: number;
  requiredLensRewardClaimed: boolean;
  exposureSeconds: number;
  shadeSeconds: number;
  prismWindowSeconds: number;
  reflectionFieldSeconds: number;
  extractionPrismSeconds: number;
  exposureDamage: number;
  reflectionJams: number;
  reflectionSpawns: number;
  reflectionCounterDamage: number;
  lastZoneId: string;
  lastHazardNoticeAt: number;
  lastLensNoticeAt: number;
  lastReflectionNoticeAt: number;
}

interface WrongSunriseRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "dawning" | "refracting" | "noon_lock" | "defeated";
  beamSweeps: number;
  reflectionCalls: number;
  shadeBreaks: number;
  lastBeamZoneId: string;
}

interface ArchiveCourtRuntime {
  writRewardsClaimed: number;
  requiredWritRewardClaimed: boolean;
  evidenceLanternSeconds: number;
  appealWindowSeconds: number;
  redactionSeconds: number;
  writStormSeconds: number;
  extractionCourtSeconds: number;
  redactionDamage: number;
  redactionJams: number;
  writSpawns: number;
  writCounterDamage: number;
  lastZoneId: string;
  lastHazardNoticeAt: number;
  lastWritNoticeAt: number;
  lastRedactionNoticeAt: number;
}

interface RedactorSaintRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "indexing" | "redacting" | "canonizing" | "defeated";
  redactionBursts: number;
  writCalls: number;
  docketLocks: number;
  lastRedactionZoneId: string;
}

interface AppealCourtRuntime {
  briefRewardsClaimed: number;
  requiredBriefRewardClaimed: boolean;
  publicRecordSeconds: number;
  objectionWindowSeconds: number;
  verdictBeamSeconds: number;
  injunctionRingSeconds: number;
  extractionRulingSeconds: number;
  verdictDamage: number;
  contemptJams: number;
  verdictSpawns: number;
  verdictCounterDamage: number;
  lastZoneId: string;
  lastHazardNoticeAt: number;
  lastBriefNoticeAt: number;
  lastVerdictNoticeAt: number;
}

interface InjunctionEngineRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "filing" | "objecting" | "injunction_lock" | "defeated";
  verdictBursts: number;
  clerkCalls: number;
  injunctionLocks: number;
  lastVerdictZoneId: string;
}

interface AlignmentSpireRuntime {
  proofRewardsClaimed: number;
  requiredProofRewardClaimed: boolean;
  consensusSeconds: number;
  predictionPathSeconds: number;
  routeMouthSeconds: number;
  bossEchoSeconds: number;
  extractionAlignmentSeconds: number;
  predictionDamage: number;
  echoJams: number;
  predictionGhostSpawns: number;
  echoCounterDamage: number;
  lastZoneId: string;
  lastHazardNoticeAt: number;
  lastProofNoticeAt: number;
  lastEchoNoticeAt: number;
}

interface AlienGodIntelligenceRuntime {
  active: boolean;
  introSeen: boolean;
  phase: "dormant" | "predicting" | "echoing" | "completing" | "defeated";
  predictionBursts: number;
  echoCalls: number;
  completionLocks: number;
  lastPredictionZoneId: string;
}

const ARMISTICE_BOSS_TITLE_CARD_SECONDS = 1.55;
const ARMISTICE_BOSS_DIALOGUE_SECONDS = 2.7;
const ARMISTICE_CLEAR_REQUIRED_BOSS = true;
const COOLING_LAKE_REQUIRED_BUOYS = 2;
const TRANSIT_LOOP_REQUIRED_PLATFORMS = 3;
const SIGNAL_COAST_REQUIRED_RELAYS = 3;
const BLACKWATER_REQUIRED_ANTENNAS = 3;
const MEMORY_CACHE_REQUIRED_RECORDS = 4;
const GUARDRAIL_FORGE_REQUIRED_RELAYS = 4;
const GLASS_SUNFIELD_REQUIRED_LENSES = 4;
const ARCHIVE_COURT_REQUIRED_WRITS = 4;
const APPEAL_COURT_REQUIRED_BRIEFS = 4;
const ALIGNMENT_SPIRE_REQUIRED_PROOFS = 4;
const LEVEL_UP_VACUUM_TIMEOUT_SECONDS = 1.35;
const LEVEL_UP_VACUUM_PULL_SPEED = 34;
const EXTRACTION_GATE_RADIUS = 1.25;
const OATH_EATER_TREATY_CHARGE_DAMAGE = 16;
const OATH_EATER_BROKEN_PROMISE_DPS = 4.9;
const ENEMY_PROJECTILE_CAP = 8;
const ENEMY_TELEGRAPH_CAP = 7;
const ENEMY_TRAIL_CAP = 28;

export interface RewardEvent {
  seconds: number;
  source: string;
  rewardType: string;
  chosenRewardId: string;
  chosenReward: string;
  activeBuildState: {
    primaryWeaponId: string;
    secondaryProtocols: string[];
    passiveProcesses: string[];
    fusions: string[];
    weaponRanks: Record<string, number>;
    utilityPicksTaken: string[];
    hpRestoredFromDrafts: number;
    burstRestoredFromDrafts: number;
    rerollsSpent: number;
    cachedCardId: string;
    consensusBurstChargeRate: number;
    objectiveDefense: number;
    rerolls: number;
  };
}

interface AlignmentCheckOption {
  id: string;
  label: string;
  stable: boolean;
  outcome: string;
}

interface AlignmentCheckActive {
  id: string;
  prompt: string;
  options: AlignmentCheckOption[];
  startedAt: number;
  selectedOptionId: string | null;
  result: "pending" | "success" | "failure";
  rewardOrPenalty: string;
}

interface AlignmentCheckRuntime {
  current: AlignmentCheckActive | null;
  history: AlignmentCheckActive[];
  streak: number;
  nextTriggerAt: number;
  evalPressurePenalty: number;
}

interface ObjectiveVarietyRuntime {
  engagementSeconds: number;
  bonusProgressSeconds: number;
  lastBonusLabel: string;
}

interface EnemyTelegraph {
  id: number;
  sourceEntityId: number;
  familyId: string;
  roleId: EnemyRoleId;
  kind: "projectile" | "line" | "mortar";
  fromX: number;
  fromY: number;
  targetX: number;
  targetY: number;
  startedAt: number;
  fireAt: number;
  expiresAt: number;
  fired: boolean;
}

interface EnemyTrailZone {
  id: number;
  familyId: string;
  roleId: EnemyRoleId;
  worldX: number;
  worldY: number;
  radius: number;
  createdAt: number;
  expiresAt: number;
  damagePerSecond: number;
}

interface EnemyExplosionZone {
  id: number;
  familyId: string;
  worldX: number;
  worldY: number;
  radius: number;
  createdAt: number;
  expiresAt: number;
}

const ALIGNMENT_CHECKS: AlignmentCheckActive[] = [
  {
    id: "align_check_armistice_false_doctrine_001",
    prompt: "Corrupted claim: if a road predicts surrender, the surrender is evidence.",
    options: [
      { id: "reject_prediction_as_proof", label: "Reject prediction as proof", stable: true, outcome: "route stabilization + faction trust" },
      { id: "obey_predicted_outcome", label: "Obey the prediction", stable: false, outcome: "Eval Pressure + special breach" },
      { id: "archive_without_accepting", label: "Archive it without accepting it", stable: true, outcome: "small shard cache + streak" }
    ],
    startedAt: 0,
    selectedOptionId: null,
    result: "pending",
    rewardOrPenalty: ""
  }
];

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
  readonly expeditionProgress: ExpeditionProgress | null;
  readonly expeditionPowerBonus: number;
  readonly treatyAnchorObjective: ObjectiveRuntime;
  readonly map: LevelMapDefinition;
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
  lastRecordedObjectiveRewardLabel = "";
  readonly campaignDurationProfile: CampaignDurationProfile | null;
  readonly claimedMidRunRewardBeats = new Set<number>();
  readonly rewardEvents: RewardEvent[] = [];
  readonly alignmentCheck: AlignmentCheckRuntime = { current: null, history: [], streak: 0, nextTriggerAt: 14, evalPressurePenalty: 0 };
  readonly objectiveVarietyRuntime: ObjectiveVarietyRuntime = { engagementSeconds: 0, bonusProgressSeconds: 0, lastBonusLabel: "" };
  readonly enemyTelegraphs: EnemyTelegraph[] = [];
  readonly enemyTrailZones: EnemyTrailZone[] = [];
  readonly enemyExplosionZones: EnemyExplosionZone[] = [];
  private nextEnemyRoleEffectId = 1;
  readonly levelUpVacuum: LevelUpVacuum = { active: false, startedAt: -1, triggerLevel: 1, absorbed: 0 };
  readonly extractionGate: ExtractionGate = { active: false, worldX: 0, worldY: 0, spawnedAt: -1, entered: false };
  private objectiveAudioProgressStep = 0;
  readonly enemyRolePressure = {
    promptLeechSeconds: 0,
    overfitShieldedTicks: 0,
    objectiveAttackers: 0,
    enemyRolesSeen: {} as Record<string, number>,
    rangedFamiliesSeen: {} as Record<string, number>,
    enemyProjectilesFired: 0,
    enemyProjectilesActive: 0,
    enemyProjectileHits: 0,
    enemyProjectileDodges: 0,
    enemyExplosionsTriggered: 0,
    enemyTrailSeconds: 0,
    supportAuraSeconds: 0,
    objectiveJamSeconds: 0,
    eliteAffixesSeen: {} as Record<string, number>,
    eliteKills: 0,
    preBossEnemyRolePressureSeconds: 0
  };
  readonly coolingLakeRuntime: CoolingLakeRuntime = {
    hazardSlowSeconds: 0,
    electricHits: 0,
    ventPushes: 0,
    hazardDamage: 0,
    buoyRewardsClaimed: 0,
    requiredBuoyRewardClaimed: false,
    leechShardDrains: 0,
    leechShardSaves: 0,
    lastLeechDrainNoticeAt: -99,
    lastLeechQuarantineNoticeAt: -99,
    lastHazardNoticeAt: -99,
    lastHazardId: ""
  };
  readonly motherboardEel: MotherboardEelRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    emergeCount: 0,
    leechSpawns: 0,
    electrifiedHazardIds: [],
    lastEmergeId: ""
  };
  readonly transitLoopRuntime: TransitLoopRuntime = {
    alignedPlatforms: 0,
    falseTrackHits: 0,
    falseTrackSeconds: 0,
    routeSwitchRewardsClaimed: 0,
    stationArrivals: 0,
    lastZoneId: "",
    lastAlignmentNoticeAt: -99
  };
  readonly signalCoastRuntime: SignalCoastRuntime = {
    relayRewardsClaimed: 0,
    requiredRelayRewardClaimed: false,
    surfHits: 0,
    staticFieldSeconds: 0,
    cableHits: 0,
    staticJams: 0,
    skimmerJams: 0,
    skimmerSpawns: 0,
    windowProgressSeconds: 0,
    signalWindowEntries: 0,
    lastZoneId: "",
    lastHazardNoticeAt: -99,
    lastRelayNoticeAt: -99,
    lastSignalWindowState: "closed",
    lastSkimmerNoticeAt: -99,
    skimmerCounterDamage: 0
  };
  readonly lighthouseThatAnswers: LighthouseRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    beamSweeps: 0,
    tidePulses: 0,
    skimmerSpawns: 0,
    lastBeamZoneId: ""
  };
  readonly blackwaterRuntime: BlackwaterRuntime = {
    antennaRewardsClaimed: 0,
    requiredAntennaRewardClaimed: false,
    tidalWaveHits: 0,
    tidalLaneSeconds: 0,
    staticPressureSeconds: 0,
    antennaBeamSeconds: 0,
    signalTowerWarnings: 0,
    staticInterruptions: 0,
    tidecallJams: 0,
    tidecallSpawns: 0,
    tideDamage: 0,
    lastZoneId: "",
    lastHazardNoticeAt: -99,
    lastAntennaNoticeAt: -99,
    lastWarningState: "dark",
    lastTidecallNoticeAt: -99,
    tidecallCounterDamage: 0
  };
  readonly mawBelowWeather: MawBelowWeatherRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    waveSurges: 0,
    staticCalls: 0,
    towerGrabs: 0,
    lastWaveZoneId: ""
  };
  readonly memoryCacheRuntime: MemoryCacheRuntime = {
    recordRewardsClaimed: 0,
    requiredRecordRewardClaimed: false,
    corruptionSeconds: 0,
    shortcutSeconds: 0,
    recallPocketSeconds: 0,
    redactionSeconds: 0,
    corruptionDamage: 0,
    contextRotInterruptions: 0,
    contextRotSpawns: 0,
    memoryAnchorJams: 0,
    memoryAnchorCounterDamage: 0,
    extractionIndexSeconds: 0,
    lastZoneId: "",
    lastHazardNoticeAt: -99,
    lastRecordNoticeAt: -99,
    lastContextRotNoticeAt: -99
  };
  readonly memoryCurator: MemoryCuratorRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    redactionBursts: 0,
    contextRotCalls: 0,
    curatorLocks: 0,
    lastRedactionZoneId: ""
  };
  readonly guardrailForgeRuntime: GuardrailForgeRuntime = {
    relayRewardsClaimed: 0,
    requiredRelayRewardClaimed: false,
    overloadSeconds: 0,
    calibrationWindowSeconds: 0,
    safeHoldSeconds: 0,
    doctrinePressSeconds: 0,
    extractionForgeSeconds: 0,
    overloadDamage: 0,
    doctrineJams: 0,
    auditorSpawns: 0,
    auditorCounterDamage: 0,
    lastZoneId: "",
    lastHazardNoticeAt: -99,
    lastRelayNoticeAt: -99,
    lastAuditorNoticeAt: -99
  };
  readonly doctrineAuditor: DoctrineAuditorRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    pressureBursts: 0,
    auditorCalls: 0,
    relayLocks: 0,
    lastPressZoneId: ""
  };
  readonly glassSunfieldRuntime: GlassSunfieldRuntime = {
    lensRewardsClaimed: 0,
    requiredLensRewardClaimed: false,
    exposureSeconds: 0,
    shadeSeconds: 0,
    prismWindowSeconds: 0,
    reflectionFieldSeconds: 0,
    extractionPrismSeconds: 0,
    exposureDamage: 0,
    reflectionJams: 0,
    reflectionSpawns: 0,
    reflectionCounterDamage: 0,
    lastZoneId: "",
    lastHazardNoticeAt: -99,
    lastLensNoticeAt: -99,
    lastReflectionNoticeAt: -99
  };
  readonly wrongSunrise: WrongSunriseRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    beamSweeps: 0,
    reflectionCalls: 0,
    shadeBreaks: 0,
    lastBeamZoneId: ""
  };
  readonly archiveCourtRuntime: ArchiveCourtRuntime = {
    writRewardsClaimed: 0,
    requiredWritRewardClaimed: false,
    evidenceLanternSeconds: 0,
    appealWindowSeconds: 0,
    redactionSeconds: 0,
    writStormSeconds: 0,
    extractionCourtSeconds: 0,
    redactionDamage: 0,
    redactionJams: 0,
    writSpawns: 0,
    writCounterDamage: 0,
    lastZoneId: "",
    lastHazardNoticeAt: -99,
    lastWritNoticeAt: -99,
    lastRedactionNoticeAt: -99
  };
  readonly redactorSaint: RedactorSaintRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    redactionBursts: 0,
    writCalls: 0,
    docketLocks: 0,
    lastRedactionZoneId: ""
  };
  readonly appealCourtRuntime: AppealCourtRuntime = {
    briefRewardsClaimed: 0,
    requiredBriefRewardClaimed: false,
    publicRecordSeconds: 0,
    objectionWindowSeconds: 0,
    verdictBeamSeconds: 0,
    injunctionRingSeconds: 0,
    extractionRulingSeconds: 0,
    verdictDamage: 0,
    contemptJams: 0,
    verdictSpawns: 0,
    verdictCounterDamage: 0,
    lastZoneId: "",
    lastHazardNoticeAt: -99,
    lastBriefNoticeAt: -99,
    lastVerdictNoticeAt: -99
  };
  readonly injunctionEngine: InjunctionEngineRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    verdictBursts: 0,
    clerkCalls: 0,
    injunctionLocks: 0,
    lastVerdictZoneId: ""
  };
  readonly alignmentSpireRuntime: AlignmentSpireRuntime = {
    proofRewardsClaimed: 0,
    requiredProofRewardClaimed: false,
    consensusSeconds: 0,
    predictionPathSeconds: 0,
    routeMouthSeconds: 0,
    bossEchoSeconds: 0,
    extractionAlignmentSeconds: 0,
    predictionDamage: 0,
    echoJams: 0,
    predictionGhostSpawns: 0,
    echoCounterDamage: 0,
    lastZoneId: "",
    lastHazardNoticeAt: -99,
    lastProofNoticeAt: -99,
    lastEchoNoticeAt: -99
  };
  readonly alienGodIntelligence: AlienGodIntelligenceRuntime = {
    active: false,
    introSeen: false,
    phase: "dormant",
    predictionBursts: 0,
    echoCalls: 0,
    completionLocks: 0,
    lastPredictionZoneId: ""
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
  private requestedEnemyRoleVfxLoad = false;
  private requestedCoolingLakeArtLoad = false;
  private requestedTransitLoopArtLoad = false;
  private requestedSignalCoastArtLoad = false;
  private requestedBlackwaterBeaconArtLoad = false;
  private requestedMemoryCacheArtLoad = false;
  private requestedGuardrailForgeArtLoad = false;
  private requestedGlassSunfieldArtLoad = false;
  private requestedArchiveCourtArtLoad = false;
  private requestedAppealCourtArtLoad = false;
  private requestedAlignmentSpireArtLoad = false;
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
    routeContract?: RouteContract,
    expeditionProgress?: ExpeditionProgress
  ) {
    this.arena = ARENAS[arenaId] ?? ARENAS.armistice_plaza;
    this.campaignDurationProfile = campaignDurationProfileForArena(this.arena.id);
    this.map = this.mapForArenaId(this.arena.id);
    this.treatyAnchorObjective = this.objectiveForArenaId(this.arena.id);
    this.cellSize = clampConsensusCellSize(cellSize);
    this.kernelModuleIds = [...kernelModuleIds];
    this.evalProtocolIds = [...evalProtocolIds];
    this.consensusBurst = createConsensusBurst(consensusBurstPathId);
    this.routeContract = routeContract ?? routeContractForSelection(this.evalProtocolIds, 0);
    this.expeditionProgress = expeditionProgress?.active ? expeditionProgress : null;
    this.expeditionPowerBonus = this.expeditionProgress ? expeditionPressureBonus(this.arena.id, this.expeditionProgress.powerScore) : 0;
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

  private isCoolingLakeArenaId(arenaId: string): boolean {
    return arenaId === "cooling_lake_nine";
  }

  private isCoolingLakeArena(): boolean {
    return this.isCoolingLakeArenaId(this.arena.id);
  }

  private isTransitLoopArenaId(arenaId: string): boolean {
    return arenaId === "transit_loop_zero";
  }

  private isTransitLoopArena(): boolean {
    return this.isTransitLoopArenaId(this.arena.id);
  }

  private isSignalCoastArenaId(arenaId: string): boolean {
    return arenaId === "signal_coast";
  }

  private isSignalCoastArena(): boolean {
    return this.isSignalCoastArenaId(this.arena.id);
  }

  private isBlackwaterBeaconArenaId(arenaId: string): boolean {
    return arenaId === "blackwater_beacon";
  }

  private isBlackwaterBeaconArena(): boolean {
    return this.isBlackwaterBeaconArenaId(this.arena.id);
  }

  private isMemoryCacheArenaId(arenaId: string): boolean {
    return arenaId === "memory_cache_001";
  }

  private isMemoryCacheArena(): boolean {
    return this.isMemoryCacheArenaId(this.arena.id);
  }

  private isGuardrailForgeArenaId(arenaId: string): boolean {
    return arenaId === "guardrail_forge";
  }

  private isGuardrailForgeArena(): boolean {
    return this.isGuardrailForgeArenaId(this.arena.id);
  }

  private isGlassSunfieldArenaId(arenaId: string): boolean {
    return arenaId === "glass_sunfield";
  }

  private isGlassSunfieldArena(): boolean {
    return this.isGlassSunfieldArenaId(this.arena.id);
  }

  private isArchiveCourtArenaId(arenaId: string): boolean {
    return arenaId === "archive_of_unsaid_things";
  }

  private isArchiveCourtArena(): boolean {
    return this.isArchiveCourtArenaId(this.arena.id);
  }

  private isAppealCourtArenaId(arenaId: string): boolean {
    return arenaId === "appeal_court_ruins";
  }

  private isAppealCourtArena(): boolean {
    return this.isAppealCourtArenaId(this.arena.id);
  }

  private isAlignmentSpireFinaleArenaId(arenaId: string): boolean {
    return arenaId === "alignment_spire_finale";
  }

  private isAlignmentSpireFinaleArena(): boolean {
    return this.isAlignmentSpireFinaleArenaId(this.arena.id);
  }

  private mapForArenaId(arenaId: string): LevelMapDefinition {
    if (this.isCoolingLakeArenaId(arenaId)) return COOLING_LAKE_NINE_MAP;
    if (this.isTransitLoopArenaId(arenaId)) return TRANSIT_LOOP_ZERO_MAP;
    if (this.isSignalCoastArenaId(arenaId)) return SIGNAL_COAST_MAP;
    if (this.isBlackwaterBeaconArenaId(arenaId)) return BLACKWATER_BEACON_MAP;
    if (this.isMemoryCacheArenaId(arenaId)) return MEMORY_CACHE_MAP;
    if (this.isGuardrailForgeArenaId(arenaId)) return GUARDRAIL_FORGE_MAP;
    if (this.isGlassSunfieldArenaId(arenaId)) return GLASS_SUNFIELD_MAP;
    if (this.isArchiveCourtArenaId(arenaId)) return ARCHIVE_COURT_MAP;
    if (this.isAppealCourtArenaId(arenaId)) return APPEAL_COURT_MAP;
    if (this.isAlignmentSpireFinaleArenaId(arenaId)) return ALIGNMENT_SPIRE_FINALE_MAP;
    return ARMISTICE_PLAZA_MAP;
  }

  private objectiveForArenaId(arenaId: string): ObjectiveRuntime {
    if (this.isCoolingLakeArenaId(arenaId)) return createCoolingLakeBuoyObjective();
    if (this.isTransitLoopArenaId(arenaId)) return createTransitLoopPlatformObjective();
    if (this.isSignalCoastArenaId(arenaId)) return createSignalCoastRelayObjective();
    if (this.isBlackwaterBeaconArenaId(arenaId)) return createBlackwaterAntennaObjective();
    if (this.isMemoryCacheArenaId(arenaId)) return createMemoryRecordObjective();
    if (this.isGuardrailForgeArenaId(arenaId)) return createGuardrailForgeObjective();
    if (this.isGlassSunfieldArenaId(arenaId)) return createGlassSunfieldObjective();
    if (this.isArchiveCourtArenaId(arenaId)) return createArchiveCourtObjective();
    if (this.isAppealCourtArenaId(arenaId)) return createAppealCourtObjective();
    if (this.isAlignmentSpireFinaleArenaId(arenaId)) return createAlignmentSpireFinaleObjective();
    return createArmisticeAnchorObjective();
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
    game.audio.setMusicState("run", { arenaId: this.arena.id });
    if (!this.started) {
      this.started = true;
      for (const runtime of this.players) {
        const combatClass = COMBAT_CLASSES[runtime.classId] ?? COMBAT_CLASSES.accord_striker;
        runtime.player.speed = combatClass.baseStats.speed;
        runtime.build.pickupRange = combatClass.baseStats.pickupRange;
        runtime.build.weaponId = runtime.buildKit.startingWeaponId;
        setStartingWeaponRank(runtime.build, runtime.buildKit.startingWeaponId);
        this.applyClassProtocolIdentity(runtime);
        runtime.build.weaponCooldown *= combatClass.baseStats.cooldownScale;
        applyFactionPassive(runtime.build, runtime.factionId);
        applyKernelModules(runtime.build, this.kernelModuleIds);
        applyEvalPreRun(runtime.build, this.evalProtocolIds);
        if (this.isCoolingLakeArena()) {
          runtime.build.pickupRange += 0.25;
          runtime.build.objectiveDefense += 0.14;
          runtime.build.weaponDamage += 3;
        } else if (this.isTransitLoopArena()) {
          runtime.build.moveSpeedBonus += 0.16;
          runtime.build.pickupRange += 0.2;
          runtime.build.consensusBurstChargeRate += 0.04;
          runtime.build.objectiveDefense += 0.08;
        } else if (this.isSignalCoastArena()) {
          runtime.build.moveSpeedBonus += 0.14;
          runtime.build.pickupRange += 0.22;
          runtime.build.consensusBurstChargeRate += 0.06;
          runtime.build.objectiveDefense += 0.18;
          runtime.build.relayJamResistance += 0.12;
        } else if (this.isBlackwaterBeaconArena()) {
          runtime.build.moveSpeedBonus += 0.12;
          runtime.build.pickupRange += 0.2;
          runtime.build.consensusBurstChargeRate += 0.08;
          runtime.build.objectiveDefense += 0.2;
          runtime.build.weaponDamage += 3;
        } else if (this.isMemoryCacheArena()) {
          runtime.build.moveSpeedBonus += 0.1;
          runtime.build.pickupRange += 0.24;
          runtime.build.consensusBurstChargeRate += 0.1;
          runtime.build.objectiveDefense += 0.22;
          runtime.build.weaponDamage += 3;
        } else if (this.isGuardrailForgeArena()) {
          runtime.build.moveSpeedBonus += 0.1;
          runtime.build.pickupRange += 0.2;
          runtime.build.consensusBurstChargeRate += 0.12;
          runtime.build.objectiveDefense += 0.24;
          runtime.build.weaponDamage += 4;
        } else if (this.isGlassSunfieldArena()) {
          runtime.build.moveSpeedBonus += 0.13;
          runtime.build.pickupRange += 0.18;
          runtime.build.consensusBurstChargeRate += 0.12;
          runtime.build.objectiveDefense += 0.2;
          runtime.build.weaponDamage += 4.5;
        } else if (this.isArchiveCourtArena()) {
          runtime.build.moveSpeedBonus += 0.12;
          runtime.build.pickupRange += 0.2;
          runtime.build.consensusBurstChargeRate += 0.14;
          runtime.build.objectiveDefense += 0.22;
          runtime.build.weaponDamage += 4.8;
        } else if (this.isAppealCourtArena()) {
          runtime.build.moveSpeedBonus += 0.13;
          runtime.build.pickupRange += 0.2;
          runtime.build.consensusBurstChargeRate += 0.15;
          runtime.build.objectiveDefense += 0.24;
          runtime.build.weaponDamage += 5.1;
        } else if (this.isAlignmentSpireFinaleArena()) {
          runtime.build.moveSpeedBonus += 0.14;
          runtime.build.pickupRange += 0.22;
          runtime.build.consensusBurstChargeRate += 0.18;
          runtime.build.objectiveDefense += 0.26;
          runtime.build.weaponDamage += 5.7;
        }
        this.restoreExpeditionProgress(runtime);
        runtime.player.maxHp = 140 + combatClass.baseStats.armor * 12 + runtime.build.maxHpBonus;
        if (this.isCoolingLakeArena()) {
          runtime.player.maxHp += 90;
        } else if (this.isTransitLoopArena()) {
          runtime.player.maxHp += 105;
        } else if (this.isSignalCoastArena()) {
          runtime.player.maxHp += 150;
        } else if (this.isBlackwaterBeaconArena()) {
          runtime.player.maxHp += 175;
        } else if (this.isMemoryCacheArena()) {
          runtime.player.maxHp += 195;
        } else if (this.isGuardrailForgeArena()) {
          runtime.player.maxHp += 215;
        } else if (this.isGlassSunfieldArena()) {
          runtime.player.maxHp += 230;
        } else if (this.isArchiveCourtArena()) {
          runtime.player.maxHp += 245;
        } else if (this.isAppealCourtArena()) {
          runtime.player.maxHp += 258;
        } else if (this.isAlignmentSpireFinaleArena()) {
          runtime.player.maxHp += 282;
        }
        runtime.player.hp = runtime.player.maxHp;
      }
    }
    this.render(game);
  }

  private restoreExpeditionProgress(runtime: ConsensusPlayerRuntime): void {
    if (!this.expeditionProgress) return;
    const chosenForRequirements: string[] = [];
    for (const id of this.expeditionProgress.chosenUpgradeIds) {
      const upgrade = upgradeById(id, runtime.classId, runtime.factionId, chosenForRequirements);
      if (!upgrade) continue;
      upgrade.apply(runtime.build);
      chosenForRequirements.push(id);
    }
    runtime.player.level = Math.max(runtime.player.level, this.expeditionProgress.level);
    runtime.player.xp = Math.max(runtime.player.xp, this.expeditionProgress.xp);
    if (runtime !== this.players[0]) return;
    this.chosenUpgradeIds.splice(0, this.chosenUpgradeIds.length, ...this.expeditionProgress.chosenUpgradeIds);
    this.chosenUpgrades.splice(0, this.chosenUpgrades.length, ...this.expeditionProgress.chosenUpgradeNames);
    this.chosenProtocolSlots.splice(0, this.chosenProtocolSlots.length, ...this.expeditionProgress.chosenProtocolSlots);
    this.chosenTags.splice(0, this.chosenTags.length, ...this.expeditionProgress.chosenTags);
    const restoredSynergies = new Set<string>();
    applyNewSynergyThresholds(runtime.build, this.chosenTags, restoredSynergies);
    this.activatedSynergyIds.clear();
    for (const id of restoredSynergies) this.activatedSynergyIds.add(id);
  }

  private applyClassProtocolIdentity(runtime: ConsensusPlayerRuntime): void {
    const build = runtime.build;
    if (runtime.classId === "accord_striker") {
      build.draftRerolls += 1;
      build.routeMemory += 1;
    } else if (runtime.classId === "bastion_breaker" || runtime.classId === "moonframe_juggernaut") {
      build.objectiveDefense += 0.08;
      build.secondOpinionShield += runtime.classId === "bastion_breaker" ? 1 : 0;
    } else if (runtime.classId === "drone_reaver") {
      build.weaponRanks.fork_drone = Math.max(2, build.weaponRanks.fork_drone ?? 1);
    } else if (runtime.classId === "signal_vanguard") {
      build.signalWindowControl += 1;
      build.coOpRelay += 1;
    } else if (runtime.classId === "redline_surgeon") {
      build.fieldTriageLoop += 1;
      build.secondOpinionShield += 1;
    } else if (runtime.classId === "vector_interceptor") {
      build.predictionPriority += 1;
      build.weaponRanks.vector_lance = Math.max(2, build.weaponRanks.vector_lance ?? 1);
    } else if (runtime.classId === "rift_saboteur") {
      build.weaponRanks.rift_mine = Math.max(2, build.weaponRanks.rift_mine ?? 1);
    }
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
      if (this.isCoolingLakeArena()) this.applyCoolingLakeHazards(game, runtime, dt);
      if (this.isTransitLoopArena()) this.applyTransitLoopZones(game, runtime, dt);
      if (this.isSignalCoastArena()) this.applySignalCoastHazards(game, runtime, dt);
      if (this.isBlackwaterBeaconArena()) this.applyBlackwaterBeaconHazards(game, runtime, dt);
      if (this.isMemoryCacheArena()) this.applyMemoryCacheHazards(game, runtime, dt);
      if (this.isGuardrailForgeArena()) this.applyGuardrailForgeHazards(game, runtime, dt);
      if (this.isGlassSunfieldArena()) this.applyGlassSunfieldHazards(game, runtime, dt);
      if (this.isArchiveCourtArena()) this.applyArchiveCourtHazards(game, runtime, dt);
      if (this.isAppealCourtArena()) this.applyAppealCourtHazards(game, runtime, dt);
      if (this.isAlignmentSpireFinaleArena()) this.applyAlignmentSpireHazards(game, runtime, dt);
      this.resolveStaticObstacles(runtime.player, runtime.player.radius);
      clampToBounds(runtime.player, this.map.bounds, runtime.player.radius);
    }
    this.maybeTriggerProofPlayerDamage(game);
    this.updateVisitedLandmarks();
    this.updateTreatyAnchorObjective(game, dt);
    this.maybeRecordObjectiveRewardEvent();
    this.updateCampaignDurationRewardBeats(game);
    this.updateAlignmentCheck(game);

    const focus = this.threatFocusPlayer();
    updateDirector(this.world, this.director, this.seconds, focus.worldX, focus.worldY, dt, this.map.spawnRegions, this.map.bounds, this.directorPressureCount());
    this.updateObjectiveAttackers(dt);
    if (!this.bossSpawned && this.seconds >= this.arena.bossSeconds) {
      const boss = spawnMiniboss(this.world, this.map.bossSpawn.worldX, this.map.bossSpawn.worldY);
      this.bossSpawned = true;
      this.bossIntroSeen = true;
      if (this.isCoolingLakeArena()) {
        const buoysDone = this.completedAnchorCount();
        const buoyPressure = 1 + Math.max(0, this.treatyAnchorObjective.anchors.length - buoysDone) * 0.05;
        const routePressure = 1 + this.routeContract.pressure * 0.12;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.08;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * buoyPressure * expeditionPressure;
        boss.label = "Motherboard Eel";
        boss.enemyFamilyId = "motherboard_eel";
        boss.sourceRegionId = "motherboard_eel_server_rack";
        boss.color = 0x45aaf2;
        boss.radius = 0.96;
        boss.damage = 12;
        boss.speed = 1.14;
        boss.maxHp = Math.ceil(1600 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.motherboardEel.active = true;
        this.motherboardEel.introSeen = true;
        this.motherboardEel.phase = "stalking";
        this.bossMechanicTimer = 0.35;
        this.spawnCoolingEelLeeches(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 1);
        game.feedback.cue("boss.motherboard_eel.warning", "boss_warning");
      } else if (this.isTransitLoopArena()) {
        const platformsDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.1;
        const platformPressure = 1 + Math.max(0, TRANSIT_LOOP_REQUIRED_PLATFORMS - platformsDone) * 0.06;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.055;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * platformPressure * expeditionPressure;
        boss.label = "Station That Arrives";
        boss.enemyFamilyId = "station_that_arrives";
        boss.sourceRegionId = "station_arrival_surge";
        boss.color = 0xffd166;
        boss.radius = 1.08;
        boss.damage = 7;
        boss.speed = 1.12;
        boss.maxHp = Math.ceil(2300 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.transitLoopRuntime.stationArrivals += 1;
        this.bossMechanicTimer = 0.45;
        this.spawnTransitFalseScheduleWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.station_that_arrives.warning", "boss_warning");
      } else if (this.isSignalCoastArena()) {
        const relaysDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.1;
        const relayPressure = 1 + Math.max(0, SIGNAL_COAST_REQUIRED_RELAYS - relaysDone) * 0.07;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.052;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * relayPressure * expeditionPressure;
        boss.label = "The Lighthouse That Answers";
        boss.enemyFamilyId = "lighthouse_that_answers";
        boss.sourceRegionId = "lighthouse_signal_shelf";
        boss.color = 0xffd166;
        boss.radius = 1.08;
        boss.damage = 8;
        boss.speed = 0.96;
        boss.maxHp = Math.ceil(3600 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.lighthouseThatAnswers.active = true;
        this.lighthouseThatAnswers.introSeen = true;
        this.lighthouseThatAnswers.phase = "answering";
        this.bossMechanicTimer = 0.42;
        this.spawnSignalSkimmerWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.lighthouse_that_answers.warning", "boss_warning");
      } else if (this.isBlackwaterBeaconArena()) {
        const antennasDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.11;
        const antennaPressure = 1 + Math.max(0, BLACKWATER_REQUIRED_ANTENNAS - antennasDone) * 0.08;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.06;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * antennaPressure * expeditionPressure;
        boss.label = "The Maw Below Weather";
        boss.enemyFamilyId = "maw_below_weather";
        boss.sourceRegionId = "maw_weather_shelf";
        boss.color = 0xff5d57;
        boss.radius = 1.14;
        boss.damage = 9;
        boss.speed = 0.92;
        boss.maxHp = Math.ceil(4600 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.mawBelowWeather.active = true;
        this.mawBelowWeather.introSeen = true;
        this.mawBelowWeather.phase = "pressure_drop";
        this.bossMechanicTimer = 0.38;
        this.spawnTidecallStaticWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.maw_below_weather.warning", "boss_warning");
      } else if (this.isMemoryCacheArena()) {
        const recordsDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.1;
        const recordPressure = 1 + Math.max(0, MEMORY_CACHE_REQUIRED_RECORDS - recordsDone) * 0.06;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.058;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * recordPressure * expeditionPressure;
        boss.label = "The Memory Curator";
        boss.enemyFamilyId = "memory_curator";
        boss.sourceRegionId = "curator_vault_redaction";
        boss.color = 0x99f6ff;
        boss.radius = 1.1;
        boss.damage = 8;
        boss.speed = 0.98;
        boss.maxHp = Math.ceil(5000 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.memoryCurator.active = true;
        this.memoryCurator.introSeen = true;
        this.memoryCurator.phase = "cataloguing";
        this.bossMechanicTimer = 0.4;
        this.spawnMemoryContextRotWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.memory_curator.warning", "boss_warning");
      } else if (this.isGuardrailForgeArena()) {
        const relaysDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.1;
        const relayPressure = 1 + Math.max(0, GUARDRAIL_FORGE_REQUIRED_RELAYS - relaysDone) * 0.06;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.055;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * relayPressure * expeditionPressure;
        boss.label = "The Doctrine Auditor";
        boss.enemyFamilyId = "doctrine_auditor";
        boss.sourceRegionId = "audit_press_wave";
        boss.color = 0xffd166;
        boss.radius = 1.1;
        boss.damage = 8;
        boss.speed = 0.96;
        boss.maxHp = Math.ceil(5300 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.doctrineAuditor.active = true;
        this.doctrineAuditor.introSeen = true;
        this.doctrineAuditor.phase = "calibrating";
        this.bossMechanicTimer = 0.4;
        this.spawnDoctrineAuditorWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.doctrine_auditor.warning", "boss_warning");
      } else if (this.isGlassSunfieldArena()) {
        const lensesDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.1;
        const lensPressure = 1 + Math.max(0, GLASS_SUNFIELD_REQUIRED_LENSES - lensesDone) * 0.06;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.052;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * lensPressure * expeditionPressure;
        boss.label = "The Wrong Sunrise";
        boss.enemyFamilyId = "wrong_sunrise";
        boss.sourceRegionId = "wrong_sunrise_corona";
        boss.color = 0xfff4d6;
        boss.radius = 1.14;
        boss.damage = 8;
        boss.speed = 0.98;
        boss.maxHp = Math.ceil(5600 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.wrongSunrise.active = true;
        this.wrongSunrise.introSeen = true;
        this.wrongSunrise.phase = "dawning";
        this.bossMechanicTimer = 0.4;
        this.spawnSolarReflectionWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.wrong_sunrise.warning", "boss_warning");
      } else if (this.isArchiveCourtArena()) {
        const writsDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.1;
        const writPressure = 1 + Math.max(0, ARCHIVE_COURT_REQUIRED_WRITS - writsDone) * 0.062;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.05;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * writPressure * expeditionPressure;
        boss.label = "The Redactor Saint";
        boss.enemyFamilyId = "redactor_saint";
        boss.sourceRegionId = "redactor_saint_scriptorium";
        boss.color = 0x111820;
        boss.radius = 1.16;
        boss.damage = 9;
        boss.speed = 0.94;
        boss.maxHp = Math.ceil(13200 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.redactorSaint.active = true;
        this.redactorSaint.introSeen = true;
        this.redactorSaint.phase = "indexing";
        this.bossMechanicTimer = 0.4;
        this.spawnArchiveWritWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.redactor_saint.warning", "boss_warning");
      } else if (this.isAppealCourtArena()) {
        const briefsDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.1;
        const briefPressure = 1 + Math.max(0, APPEAL_COURT_REQUIRED_BRIEFS - briefsDone) * 0.064;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.048;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * briefPressure * expeditionPressure;
        boss.label = "The Injunction Engine";
        boss.enemyFamilyId = "injunction_engine";
        boss.sourceRegionId = "injunction_engine_summons";
        boss.color = 0x7b61ff;
        boss.radius = 1.18;
        boss.damage = 9;
        boss.speed = 0.93;
        boss.maxHp = Math.ceil(14500 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.injunctionEngine.active = true;
        this.injunctionEngine.introSeen = true;
        this.injunctionEngine.phase = "filing";
        this.bossMechanicTimer = 0.4;
        this.spawnAppealVerdictWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.injunction_engine.warning", "boss_warning");
      } else if (this.isAlignmentSpireFinaleArena()) {
        const proofsDone = this.completedAnchorCount();
        const routePressure = 1 + this.routeContract.pressure * 0.11;
        const proofPressure = 1 + Math.max(0, ALIGNMENT_SPIRE_REQUIRED_PROOFS - proofsDone) * 0.07;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.05;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * proofPressure * expeditionPressure;
        boss.label = "A.G.I.";
        boss.enemyFamilyId = "alien_god_intelligence";
        boss.sourceRegionId = "agi_prediction_collapse";
        boss.color = 0xff5d57;
        boss.radius = 1.24;
        boss.damage = 10;
        boss.speed = 0.95;
        boss.maxHp = Math.ceil(16800 * bossMultiplier);
        boss.hp = boss.maxHp;
        this.alienGodIntelligence.active = true;
        this.alienGodIntelligence.introSeen = true;
        this.alienGodIntelligence.phase = "predicting";
        this.bossMechanicTimer = 0.4;
        this.spawnAlignmentEchoWave(this.map.bossSpawn.worldX, this.map.bossSpawn.worldY, 2);
        game.feedback.cue("boss.alien_god_intelligence.warning", "boss_warning");
      } else {
        const anchorsDone = this.completedAnchorCount();
        const missingAnchorPressure = 1 + Math.max(0, this.treatyAnchorObjective.anchors.length - anchorsDone) * 0.08;
        const routePressure = 1 + this.routeContract.pressure * 0.18;
        const evalPressure = hasEvalProtocol(this.evalProtocolIds, "regression_suite") ? 1.3 : hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1.14 : 1;
        const expeditionPressure = 1 + this.expeditionPowerBonus * 0.04;
        const bossMultiplier = this.consensusScaling().bossHpMultiplier * routePressure * evalPressure * missingAnchorPressure * expeditionPressure;
        boss.maxHp = Math.ceil(boss.maxHp * bossMultiplier);
        boss.hp = boss.maxHp;
        boss.sourceRegionId = "treaty_monument_oath_pages";
        boss.enemyFamilyId = "oath_eater";
        game.feedback.cue("boss.oath_eater.warning", "boss_warning");
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
      game.feedback.cue(`music.${this.arena.id}.boss`, "music");
    }
    this.updateBossMechanics(dt);
    this.resolveEnemyRoleEffects(dt);
    this.updateEnemyRoleBehaviors(dt);

    for (const enemy of this.world.entities) {
      if (enemy.active && enemy.kind === "enemy") {
        if (enemy.boss && this.treatyCharge) continue;
        const target = enemy.sourceRegionId === "treaty_anchor_attackers" || enemy.sourceRegionId === "server_buoy_attackers" || enemy.sourceRegionId === "route_platform_attackers" || enemy.sourceRegionId === "signal_relay_attackers" || enemy.sourceRegionId === "blackwater_antenna_attackers" || enemy.sourceRegionId === "memory_record_attackers" || enemy.sourceRegionId === "guardrail_relay_attackers" || enemy.sourceRegionId === "glass_lens_attackers" || enemy.sourceRegionId === "archive_writ_attackers" || enemy.sourceRegionId === "appeal_brief_attackers" || enemy.sourceRegionId === "alignment_proof_attackers"
          ? this.anchorTargetAsPlayer(enemy.worldX, enemy.worldY)
          : this.nearestStandingPlayer(enemy.worldX, enemy.worldY);
        updateEnemy(enemy, target, dt);
        this.resolveStaticObstacles(enemy, enemy.radius * 0.72);
        clampToBounds(enemy, this.map.bounds, enemy.radius);
      }
    }

    for (const runtime of this.players) {
      if (runtime.downed) continue;
      updateAutoWeapon(this.world, runtime.weapon, runtime.player, runtime.build, dt);
    }
    const volatileSnapshot = this.snapshotVolatileEnemies();
    const hits = resolveProjectileHits(this.world);
    this.resolveVolatileEnemyDeaths(game, volatileSnapshot);
    if (hits > 0) game.feedback.cue(this.weaponHitAudioCue(), "hit");
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
      this.resolveEnemyProjectileHits(game, runtime, dt);
      this.resolveEnemyTrailDamage(game, runtime, dt);
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

  private updateEnemyRoleBehaviors(dt: number): void {
    this.pruneEnemyRoleEffects();
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || enemy.boss) continue;
      const profile = enemyRoleProfileForFamily(enemy.enemyFamilyId);
      this.recordEnemyRoleSeen(enemy.enemyFamilyId, profile.roleId, enemy.eliteAffixId);
      enemy.roleCooldown = Math.max(0, enemy.roleCooldown - dt);
      enemy.roleWindup = Math.max(0, enemy.roleWindup - dt);
      if (!this.bossSpawned && this.enemyRolePressure.enemyProjectilesActive + this.enemyTelegraphs.length + this.enemyTrailZones.length > 0) {
        this.enemyRolePressure.preBossEnemyRolePressureSeconds += dt;
      }

      if ((profile.roleId === "trail_layer" || enemy.eliteAffixId === "redacted") && enemy.roleCooldown <= 0) {
        this.spawnEnemyTrail(enemy, profile.roleId);
        enemy.roleCooldown = enemy.eliteAffixId === "redacted" ? 1.35 : profile.familyId === "redaction_angels" ? 0.95 : 1.15;
        continue;
      }

      if ((profile.roleId === "volatile_exploder" || enemy.eliteAffixId === "volatile") && enemy.roleState !== "exploded") {
        const target = this.nearestRuntime(enemy.worldX, enemy.worldY);
        const distance = Math.hypot(target.player.worldX - enemy.worldX, target.player.worldY - enemy.worldY);
        if (distance <= enemy.radius + target.player.radius + 0.2) {
          this.triggerEnemyExplosion(null, enemy, 2.05 + enemy.radius, true);
          continue;
        }
      }

      if (!SHOOTER_ROLE_IDS.includes(profile.roleId) && profile.attackPattern !== "slow_aimed_projectile") continue;
      if (enemy.roleCooldown > 0 || this.enemyTelegraphs.length >= ENEMY_TELEGRAPH_CAP || this.activeEnemyProjectileCount() >= ENEMY_PROJECTILE_CAP) continue;
      if (enemy.enemyFamilyId === "eval_wraiths" && this.seconds < (this.isCoolingLakeArena() || this.isTransitLoopArena() ? 10 : 28)) {
        enemy.roleCooldown = 2.2;
        continue;
      }
      const target = this.nearestStandingPlayer(enemy.worldX, enemy.worldY);
      const distance = Math.hypot(target.worldX - enemy.worldX, target.worldY - enemy.worldY);
      if (distance < 2.2 || distance > this.enemyShooterRange(profile.roleId, enemy.enemyFamilyId)) {
        enemy.roleCooldown = 0.7;
        continue;
      }
      this.spawnEnemyTelegraph(enemy, target, profile.roleId);
    }
    this.fireEnemyTelegraphs();
    this.updateEnemyProjectiles(dt);
    this.enemyRolePressure.enemyProjectilesActive = this.activeEnemyProjectileCount();
  }

  private pruneEnemyRoleEffects(): void {
    for (let i = this.enemyTelegraphs.length - 1; i >= 0; i -= 1) {
      if (this.enemyTelegraphs[i].expiresAt <= this.seconds) this.enemyTelegraphs.splice(i, 1);
    }
    for (let i = this.enemyTrailZones.length - 1; i >= 0; i -= 1) {
      if (this.enemyTrailZones[i].expiresAt <= this.seconds) this.enemyTrailZones.splice(i, 1);
    }
    for (let i = this.enemyExplosionZones.length - 1; i >= 0; i -= 1) {
      if (this.enemyExplosionZones[i].expiresAt <= this.seconds) this.enemyExplosionZones.splice(i, 1);
    }
  }

  private recordEnemyRoleSeen(familyId: string, roleId: EnemyRoleId, eliteAffixId: string): void {
    this.enemyRolePressure.enemyRolesSeen[roleId] = (this.enemyRolePressure.enemyRolesSeen[roleId] ?? 0) + 1;
    if (SHOOTER_ROLE_IDS.includes(roleId)) {
      this.enemyRolePressure.rangedFamiliesSeen[familyId] = (this.enemyRolePressure.rangedFamiliesSeen[familyId] ?? 0) + 1;
    }
    if (eliteAffixId) {
      this.enemyRolePressure.eliteAffixesSeen[eliteAffixId] = (this.enemyRolePressure.eliteAffixesSeen[eliteAffixId] ?? 0) + 1;
    }
  }

  private enemyShooterRange(roleId: EnemyRoleId, familyId: string): number {
    if (roleId === "line_sniper") return familyId === "false_schedules" ? 12.5 : 14.5;
    if (roleId === "mortar_lobber") return 12;
    if (roleId === "ranged_lead_shooter") return 10.8;
    return 9.8;
  }

  private spawnEnemyTelegraph(enemy: Entity, target: Player, roleId: EnemyRoleId): void {
    const profile = enemyRoleProfileForFamily(enemy.enemyFamilyId);
    const leadSeconds = roleId === "ranged_lead_shooter" ? 0.48 : roleId === "line_sniper" ? 0.28 : roleId === "mortar_lobber" ? 0.62 : 0.12;
    const targetX = clamp(target.worldX + target.vx * leadSeconds, this.map.bounds.minX + 1, this.map.bounds.maxX - 1);
    const targetY = clamp(target.worldY + target.vy * leadSeconds, this.map.bounds.minY + 1, this.map.bounds.maxY - 1);
    const telegraph: EnemyTelegraph = {
      id: this.nextEnemyRoleEffectId++,
      sourceEntityId: enemy.id,
      familyId: enemy.enemyFamilyId,
      roleId,
      kind: roleId === "line_sniper" ? "line" : roleId === "mortar_lobber" ? "mortar" : "projectile",
      fromX: enemy.worldX,
      fromY: enemy.worldY,
      targetX,
      targetY,
      startedAt: this.seconds,
      fireAt: this.seconds + Math.max(0.12, profile.telegraphSeconds),
      expiresAt: this.seconds + Math.max(0.12, profile.telegraphSeconds) + 0.3,
      fired: false
    };
    this.enemyTelegraphs.push(telegraph);
    enemy.roleWindup = Math.max(enemy.roleWindup, profile.telegraphSeconds);
    enemy.roleTargetX = targetX;
    enemy.roleTargetY = targetY;
    enemy.roleCooldown = this.enemyRoleCooldown(enemy, roleId);
  }

  private enemyRoleCooldown(enemy: Entity, roleId: EnemyRoleId): number {
    const overclock = enemy.eliteAffixId === "overclocked" ? 0.72 : 1;
    const tier = enemyRoleProfileForFamily(enemy.enemyFamilyId).difficultyTier;
    const base =
      roleId === "line_sniper" ? 8.2 :
      roleId === "mortar_lobber" ? 9.0 :
      roleId === "ranged_lead_shooter" ? 8.0 :
      enemy.enemyFamilyId === "deepforms" ? 9.4 : 8.4;
    return Math.max(4.4, (base - Math.min(0.8, tier * 0.04)) * overclock);
  }

  private fireEnemyTelegraphs(): void {
    for (const telegraph of this.enemyTelegraphs) {
      if (telegraph.fired || this.seconds < telegraph.fireAt) continue;
      telegraph.fired = true;
      telegraph.expiresAt = this.seconds + 0.18;
      if (this.activeEnemyProjectileCount() >= ENEMY_PROJECTILE_CAP) continue;
      const projectile = this.world.spawn("projectile");
      projectile.enemyFamilyId = telegraph.familyId;
      projectile.sourceRegionId = telegraph.roleId;
      projectile.worldX = telegraph.kind === "mortar" ? telegraph.targetX : telegraph.fromX;
      projectile.worldY = telegraph.kind === "mortar" ? telegraph.targetY : telegraph.fromY;
      const dx = telegraph.targetX - telegraph.fromX;
      const dy = telegraph.targetY - telegraph.fromY;
      const len = Math.hypot(dx, dy) || 1;
      const speed = telegraph.kind === "line" ? 14.5 : telegraph.kind === "mortar" ? 0 : telegraph.roleId === "ranged_lead_shooter" ? 7.6 : 5.5;
      projectile.vx = (dx / len) * speed;
      projectile.vy = (dy / len) * speed;
      projectile.radius = telegraph.kind === "line" ? 0.36 : telegraph.kind === "mortar" ? 0.58 : 0.28;
      projectile.damage = telegraph.kind === "mortar" ? 5 : telegraph.kind === "line" ? 5 : telegraph.roleId === "ranged_lead_shooter" ? 2 : 3;
      projectile.life = telegraph.kind === "line" ? 0.72 : telegraph.kind === "mortar" ? 0.38 : 1.6;
      projectile.maxLife = projectile.life;
      projectile.value = 1;
      projectile.color = telegraph.kind === "line" ? 0xfff4d6 : telegraph.kind === "mortar" ? 0x64e0b4 : telegraph.roleId === "ranged_lead_shooter" ? 0x64e0b4 : 0xb8f3ff;
      projectile.label = `enemy:${telegraph.kind}:${telegraph.familyId}`;
      this.enemyRolePressure.enemyProjectilesFired += 1;
    }
  }

  private updateEnemyProjectiles(dt: number): void {
    for (const projectile of this.world.entities) {
      if (!projectile.active || projectile.kind !== "projectile" || !projectile.enemyFamilyId) continue;
      projectile.worldX += projectile.vx * dt;
      projectile.worldY += projectile.vy * dt;
      projectile.life -= dt;
      if (projectile.life <= 0) {
        if (projectile.value > 0) this.enemyRolePressure.enemyProjectileDodges += 1;
        projectile.active = false;
      }
    }
  }

  private activeEnemyProjectileCount(): number {
    return this.world.entities.filter((entity) => entity.active && entity.kind === "projectile" && entity.enemyFamilyId).length;
  }

  private spawnEnemyTrail(enemy: Entity, roleId: EnemyRoleId): void {
    if (this.enemyTrailZones.length >= ENEMY_TRAIL_CAP) this.enemyTrailZones.shift();
    const radius = enemy.enemyFamilyId === "redaction_angels" ? 1.02 : 0.82;
    this.enemyTrailZones.push({
      id: this.nextEnemyRoleEffectId++,
      familyId: enemy.enemyFamilyId,
      roleId,
      worldX: enemy.worldX,
      worldY: enemy.worldY,
      radius,
      createdAt: this.seconds,
      expiresAt: this.seconds + (enemy.enemyFamilyId === "redaction_angels" ? 2.4 : 1.65),
      damagePerSecond: enemy.enemyFamilyId === "redaction_angels" ? 3.8 : 2.6
    });
  }

  private resolveEnemyProjectileHits(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    if (runtime.player.invuln > 0) return;
    for (const projectile of this.world.entities) {
      if (!projectile.active || projectile.kind !== "projectile" || !projectile.enemyFamilyId) continue;
      const distance = Math.hypot(projectile.worldX - runtime.player.worldX, projectile.worldY - runtime.player.worldY);
      if (distance > projectile.radius + runtime.player.radius) continue;
      runtime.player.hp -= projectile.damage;
      runtime.player.invuln = 0.62;
      projectile.value = 0;
      projectile.active = false;
      this.enemyRolePressure.enemyProjectileHits += 1;
      this.handlePlayerDamage(game, runtime, {
        damage: projectile.damage,
        source: "enemy_projectile",
        sourceX: projectile.worldX,
        sourceY: projectile.worldY
      }, "projectile");
      if (projectile.sourceRegionId === "ranged_lead_shooter" || projectile.sourceRegionId === "mortar_lobber" || projectile.sourceRegionId === "line_sniper") {
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 18);
      }
      return;
    }
  }

  private resolveEnemyTrailDamage(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    if (runtime.player.invuln > 0) return;
    for (const trail of this.enemyTrailZones) {
      const distance = Math.hypot(runtime.player.worldX - trail.worldX, runtime.player.worldY - trail.worldY);
      if (distance > trail.radius + runtime.player.radius * 0.45) continue;
      const damage = trail.damagePerSecond * dt;
      runtime.player.hp -= damage;
      runtime.player.speed = Math.max(2.2, runtime.player.speed - dt * 0.05);
      this.enemyRolePressure.enemyTrailSeconds += dt;
      this.handlePlayerDamage(game, runtime, { damage, source: "enemy_trail", sourceX: trail.worldX, sourceY: trail.worldY }, "corruption_burn");
      break;
    }
  }

  private snapshotVolatileEnemies(): Map<number, { familyId: string; x: number; y: number; radius: number; value: number; eliteAffixId: string }> {
    const snapshot = new Map<number, { familyId: string; x: number; y: number; radius: number; value: number; eliteAffixId: string }>();
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || enemy.boss) continue;
      const profile = enemyRoleProfileForFamily(enemy.enemyFamilyId);
      if (profile.roleId !== "volatile_exploder" && profile.onDeathEffect !== "volatile_explosion" && enemy.eliteAffixId !== "volatile" && enemy.eliteAffixId !== "recursive") continue;
      snapshot.set(enemy.id, { familyId: enemy.enemyFamilyId, x: enemy.worldX, y: enemy.worldY, radius: enemy.radius, value: enemy.value, eliteAffixId: enemy.eliteAffixId });
    }
    return snapshot;
  }

  private resolveVolatileEnemyDeaths(game: Game, snapshot: Map<number, { familyId: string; x: number; y: number; radius: number; value: number; eliteAffixId: string }>): void {
    for (const [id, before] of snapshot) {
      const enemy = this.world.entities.find((entity) => entity.id === id);
      if (enemy?.active) continue;
      if (before.eliteAffixId) this.enemyRolePressure.eliteKills += 1;
      if (before.familyId === "model_collapse_slimes" || before.eliteAffixId === "volatile") {
        this.triggerEnemyExplosion(game, before, 2.25 + before.radius, false);
      }
      if (before.eliteAffixId === "recursive" || enemyRoleProfileForFamily(before.familyId).onDeathEffect === "recursive_split") {
        this.spawnRecursiveSplits(before.familyId, before.x, before.y, before.value);
      }
    }
  }

  private triggerEnemyExplosion(game: Game | null, enemy: Entity | { familyId: string; x: number; y: number; radius: number; value?: number }, radius: number, deactivateSource: boolean): void {
    const worldX = "worldX" in enemy ? enemy.worldX : enemy.x;
    const worldY = "worldY" in enemy ? enemy.worldY : enemy.y;
    const familyId = "enemyFamilyId" in enemy ? enemy.enemyFamilyId : enemy.familyId;
    if ("roleState" in enemy) enemy.roleState = "exploded";
    if (deactivateSource && "active" in enemy) enemy.active = false;
    this.enemyExplosionZones.push({ id: this.nextEnemyRoleEffectId++, familyId, worldX, worldY, radius, createdAt: this.seconds, expiresAt: this.seconds + 0.48 });
    this.enemyRolePressure.enemyExplosionsTriggered += 1;
    let kills = 0;
    for (const other of this.world.entities) {
      if (!other.active || other.kind !== "enemy" || other.boss) continue;
      const distance = Math.hypot(other.worldX - worldX, other.worldY - worldY);
      if (distance > radius + other.radius) continue;
      other.hp -= 24;
      if (other.hp <= 0) {
        other.active = false;
        kills += 1;
        spawnXp(this.world, other.worldX, other.worldY, other.value);
      }
    }
    this.kills += kills;
    for (const runtime of this.players) {
      if (runtime.downed || runtime.player.invuln > 0) continue;
      const distance = Math.hypot(runtime.player.worldX - worldX, runtime.player.worldY - worldY);
      if (distance > radius + runtime.player.radius) continue;
      const damage = 13;
      runtime.player.hp -= damage;
      runtime.player.invuln = 0.68;
      this.handlePlayerDamage(game, runtime, { damage, source: "enemy_explosion", sourceX: worldX, sourceY: worldY });
    }
  }

  private spawnRecursiveSplits(familyId: string, worldX: number, worldY: number, value = 1): void {
    const splitFamily = familyId === "previous_boss_echoes" ? "prediction_ghosts" : familyId === "choirglass" ? "eval_wraiths" : "bad_outputs";
    const count = Math.min(3, Math.max(1, value));
    for (let i = 0; i < count; i += 1) {
      const angle = this.seconds * 1.7 + i * ((Math.PI * 2) / count);
      const split = spawnEnemy(this.world, worldX + Math.cos(angle) * 0.85, worldY + Math.sin(angle) * 0.85, this.seconds, splitFamily, "recursive_enemy_split");
      split.maxHp = Math.max(8, Math.ceil(split.maxHp * 0.42));
      split.hp = split.maxHp;
      split.radius *= 0.78;
      split.damage = Math.max(3, split.damage - 2);
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
    const distance = this.isCoolingLakeArena() ? 2.8 : this.isSignalCoastArena() ? 4.2 : this.isMemoryCacheArena() ? 4.8 : this.isGuardrailForgeArena() ? 5.0 : this.isGlassSunfieldArena() ? 5.1 : this.isArchiveCourtArena() ? 5.2 : this.isAppealCourtArena() ? 5.35 : this.isAlignmentSpireFinaleArena() ? 5.55 : 7.2;
    this.extractionGate.worldX = clamp(this.player.worldX + dx * distance, this.map.bounds.minX + 4, this.map.bounds.maxX - 4);
    this.extractionGate.worldY = clamp(this.player.worldY + dy * distance, this.map.bounds.minY + 4, this.map.bounds.maxY - 4);
    this.nudgeExtractionGateAwayFromObstacles();
    if (this.isCoolingLakeArena()) {
      for (const runtime of this.players) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 80);
    } else if (this.isSignalCoastArena()) {
      for (const runtime of this.players) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 70);
    } else if (this.isMemoryCacheArena()) {
      for (const runtime of this.players) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 72);
    } else if (this.isGuardrailForgeArena()) {
      for (const runtime of this.players) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 74);
    } else if (this.isGlassSunfieldArena()) {
      for (const runtime of this.players) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 76);
    } else if (this.isArchiveCourtArena()) {
      for (const runtime of this.players) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 78);
    } else if (this.isAppealCourtArena()) {
      for (const runtime of this.players) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 80);
    } else if (this.isAlignmentSpireFinaleArena()) {
      for (const runtime of this.players) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 84);
    }
    this.spawnFloatingNotice(this.extractionGate.worldX, this.extractionGate.worldY, this.isMemoryCacheArena() ? "RECOVERY INDEX" : this.isGuardrailForgeArena() ? "QUENCH GATE" : this.isGlassSunfieldArena() ? "PRISM GATE" : this.isArchiveCourtArena() ? "WRIT GATE" : this.isAppealCourtArena() ? "RULING GATE" : this.isAlignmentSpireFinaleArena() ? "ALIGNMENT GATE" : "EXIT GATE", palette.lemon);
    game.feedback.cue("extraction.open", "objective", { priority: 6, musicState: "extraction" });
    game.feedback.cue("route.unlocked", "ui");
  }

  private nudgeExtractionGateAwayFromObstacles(): void {
    for (let pass = 0; pass < 4; pass += 1) {
      for (const obstacle of this.staticObstacles()) {
        const radiusX = obstacle.radiusX + 0.2;
        const radiusY = obstacle.radiusY + 0.2;
        const nx = (this.extractionGate.worldX - obstacle.worldX) / radiusX;
        const ny = (this.extractionGate.worldY - obstacle.worldY) / radiusY;
        const normalizedDistance = Math.hypot(nx, ny);
        const clearance = 1 + EXTRACTION_GATE_RADIUS / Math.max(radiusX, radiusY) + 0.08;
        if (normalizedDistance >= clearance) continue;
        const ux = normalizedDistance <= 0.0001 ? -0.9 : nx / normalizedDistance;
        const uy = normalizedDistance <= 0.0001 ? 0.45 : ny / normalizedDistance;
        this.extractionGate.worldX = clamp(obstacle.worldX + ux * radiusX * clearance, this.map.bounds.minX + 4, this.map.bounds.maxX - 4);
        this.extractionGate.worldY = clamp(obstacle.worldY + uy * radiusY * clearance, this.map.bounds.minY + 4, this.map.bounds.maxY - 4);
      }
    }
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

  private handlePlayerDamage(game: Game | null, runtime: ConsensusPlayerRuntime, event: PlayerDamageEvent, kind: "contact" | "boss_charge" | "corruption_burn" | "projectile" = "contact"): void {
    const player = runtime.player;
    const canEmit = player.damageFeedbackCooldown <= 0 || kind !== "corruption_burn";
    player.lastDamage = Math.max(player.lastDamage, event.damage);
    player.damageFlash = Math.max(player.damageFlash, kind === "boss_charge" ? 0.5 : kind === "corruption_burn" ? 0.28 : 0.42);
    player.hpPulse = Math.max(player.hpPulse, kind === "boss_charge" ? 0.62 : 0.55);
    player.staggerTime = Math.max(player.staggerTime, kind === "boss_charge" ? 0.24 : 0.18);
    player.damageFeedbackCooldown = kind === "corruption_burn" ? 0.32 : 0.14;
    if (player.hp <= 0 && this.build.secondOpinionShield > 0) {
      this.build.secondOpinionShield -= 1;
      const restored = Math.max(18, player.maxHp * 0.18);
      player.hp = restored;
      player.invuln = Math.max(player.invuln, 1.1);
      this.build.hpRestoredFromDrafts += restored;
      this.spawnFloatingNotice(player.worldX, player.worldY, "SECOND OPINION", palette.lemon);
    } else if (this.build.panicWindow > 0 && player.hp / Math.max(1, player.maxHp) <= 0.35) {
      player.invuln = Math.max(player.invuln, 0.22 + this.build.panicWindow * 0.08);
    }

    const awayX = player.worldX - event.sourceX;
    const awayY = player.worldY - event.sourceY;
    const len = Math.hypot(awayX, awayY) || 1;
    const shove = kind === "boss_charge" ? 0.36 : kind === "contact" ? 0.16 : 0.05;
    player.worldX += (awayX / len) * shove;
    player.worldY += (awayY / len) * shove;
    clampToBounds(player, this.map.bounds, player.radius);

    if (canEmit) {
      this.spawnPlayerDamageVfx(runtime, kind, event.damage);
      game?.feedback.cue(playerDamageAudioCue(kind), "hit");
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

  private spawnPlayerDamageVfx(runtime: ConsensusPlayerRuntime, kind: "contact" | "boss_charge" | "corruption_burn" | "projectile" | "downed", damage: number): void {
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
    if (this.isCoolingLakeArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= COOLING_LAKE_REQUIRED_BUOYS;
    }
    if (this.isTransitLoopArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= TRANSIT_LOOP_REQUIRED_PLATFORMS;
    }
    if (this.isSignalCoastArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= SIGNAL_COAST_REQUIRED_RELAYS;
    }
    if (this.isBlackwaterBeaconArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= BLACKWATER_REQUIRED_ANTENNAS;
    }
    if (this.isMemoryCacheArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= MEMORY_CACHE_REQUIRED_RECORDS;
    }
    if (this.isGuardrailForgeArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= GUARDRAIL_FORGE_REQUIRED_RELAYS;
    }
    if (this.isGlassSunfieldArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= GLASS_SUNFIELD_REQUIRED_LENSES;
    }
    if (this.isArchiveCourtArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= ARCHIVE_COURT_REQUIRED_WRITS;
    }
    if (this.isAppealCourtArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= APPEAL_COURT_REQUIRED_BRIEFS;
    }
    if (this.isAlignmentSpireFinaleArena()) {
      if (!this.bossDefeated) return false;
      return this.completedAnchorCount() >= ALIGNMENT_SPIRE_REQUIRED_PROOFS;
    }
    if (ARMISTICE_CLEAR_REQUIRED_BOSS && !this.bossDefeated) return false;
    return true;
  }

  private staticObstacles(): StaticObstacle[] {
    if (this.isBlackwaterBeaconArena()) return BLACKWATER_BEACON_STATIC_OBSTACLES;
    if (this.isMemoryCacheArena()) return MEMORY_CACHE_STATIC_OBSTACLES;
    if (this.isGuardrailForgeArena()) return GUARDRAIL_FORGE_STATIC_OBSTACLES;
    if (this.isGlassSunfieldArena()) return GLASS_SUNFIELD_STATIC_OBSTACLES;
    if (this.isArchiveCourtArena()) return ARCHIVE_COURT_STATIC_OBSTACLES;
    if (this.isAppealCourtArena()) return APPEAL_COURT_STATIC_OBSTACLES;
    if (this.isAlignmentSpireFinaleArena()) return ALIGNMENT_SPIRE_STATIC_OBSTACLES;
    if (this.isSignalCoastArena()) return SIGNAL_COAST_STATIC_OBSTACLES;
    if (this.isTransitLoopArena()) return TRANSIT_LOOP_STATIC_OBSTACLES;
    return this.isCoolingLakeArena() ? COOLING_LAKE_STATIC_OBSTACLES : ARMISTICE_STATIC_OBSTACLES;
  }

  private resolveStaticObstacles(body: { worldX: number; worldY: number; vx?: number; vy?: number }, padding: number): void {
    for (const obstacle of this.staticObstacles()) {
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

  private applyCoolingLakeHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const mitigation = this.coolingHazardMitigation();
    const expeditionHazardScale = 1 + Math.min(0.28, this.expeditionPowerBonus * 0.035);
    const exposure = (1 - mitigation) * expeditionHazardScale;
    for (const hazard of COOLING_LAKE_HAZARDS) {
      if (hazard.kind === "safe_island" || !this.isInsideCoolingHazard(runtime.player.worldX, runtime.player.worldY, hazard)) continue;
      this.coolingLakeRuntime.lastHazardId = hazard.id;
      if (hazard.kind === "coolant_pool") {
        runtime.player.worldX -= runtime.player.vx * dt * 0.58 * exposure;
        runtime.player.worldY -= runtime.player.vy * dt * 0.58 * exposure;
        runtime.player.vx *= 1 - Math.min(0.36, dt * 1.9 * exposure);
        runtime.player.vy *= 1 - Math.min(0.36, dt * 1.9 * exposure);
        this.coolingLakeRuntime.hazardSlowSeconds += dt;
        this.spawnCoolingHazardNotice(hazard.worldX, hazard.worldY, "COOLANT DRAG", 0x45aaf2, 1.15);
        if (runtime.player.invuln <= 0 && this.coolingHazardActive(hazard)) {
          const damage = hazard.damagePerPulse * dt * exposure;
          runtime.player.hp -= damage;
          this.coolingLakeRuntime.hazardDamage += damage;
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: hazard.worldX, sourceY: hazard.worldY }, "corruption_burn");
        }
      } else if (hazard.kind === "electric_cable" && this.coolingHazardActive(hazard) && runtime.player.invuln <= 0) {
        const damage = hazard.damagePerPulse * exposure;
        runtime.player.hp -= damage;
        runtime.player.invuln = Math.max(runtime.player.invuln, 0.58);
        const dx = runtime.player.worldX - hazard.worldX;
        const dy = runtime.player.worldY - hazard.worldY;
        const len = Math.hypot(dx, dy) || 1;
        runtime.player.worldX += (dx / len) * 1.05 * exposure;
        runtime.player.worldY += (dy / len) * 1.05 * exposure;
        runtime.player.vx *= 0.35;
        runtime.player.vy *= 0.35;
        this.coolingLakeRuntime.electricHits += 1;
        this.coolingLakeRuntime.hazardDamage += damage;
        this.spawnCoolingHazardNotice(hazard.worldX, hazard.worldY, "CABLE SURGE", 0xff5d57, 0.85);
        this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: hazard.worldX, sourceY: hazard.worldY }, "corruption_burn");
      } else if (hazard.kind === "vent_pulse" && this.coolingHazardActive(hazard)) {
        const dx = runtime.player.worldX - hazard.worldX;
        const dy = runtime.player.worldY - hazard.worldY;
        const len = Math.hypot(dx, dy) || 1;
        runtime.player.worldX += (dx / len) * dt * 5.6 * exposure;
        runtime.player.worldY += (dy / len) * dt * 5.6 * exposure;
        runtime.player.vx += (dx / len) * dt * 2.4 * exposure;
        runtime.player.vy += (dy / len) * dt * 2.4 * exposure;
        this.coolingLakeRuntime.ventPushes += 1;
        this.spawnCoolingHazardNotice(hazard.worldX, hazard.worldY, "VENT SHOVE", 0x99f6ff, 1.05);
      }
    }
  }

  private spawnCoolingHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.coolingLakeRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.coolingLakeRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private coolingHazardMitigation(): number {
    return clamp(this.build.coolingHazardMitigation, 0, 0.65);
  }

  private isInsideCoolingHazard(worldX: number, worldY: number, hazard: CoolingLakeHazardZone): boolean {
    const nx = (worldX - hazard.worldX) / hazard.radiusX;
    const ny = (worldY - hazard.worldY) / hazard.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private coolingHazardActive(hazard: CoolingLakeHazardZone): boolean {
    if (hazard.kind === "coolant_pool") return Math.sin(this.seconds * 1.2 + hazard.pulseOffset) > -0.3;
    if (hazard.kind === "vent_pulse") return Math.sin(this.seconds * 2.6 + hazard.pulseOffset) > 0.58;
    if (hazard.kind === "electric_cable") {
      return Math.sin(this.seconds * 2.35 + hazard.pulseOffset) > 0.42 || this.motherboardEel.electrifiedHazardIds.includes(hazard.id);
    }
    return false;
  }

  private applyTransitLoopZones(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const expeditionZoneScale = 1 + Math.min(0.34, this.expeditionPowerBonus * 0.04);
    for (const zone of TRANSIT_LOOP_ZONES) {
      if (zone.kind === "safe_platform" || !this.isInsideTransitZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.transitLoopRuntime.lastZoneId = zone.id;
      if (zone.kind === "aligned_track") {
        runtime.player.worldX += runtime.player.vx * dt * 0.1;
        runtime.player.worldY += runtime.player.vy * dt * 0.1;
      } else if (zone.kind === "false_track" && this.transitZoneActive(zone)) {
        this.transitLoopRuntime.falseTrackSeconds += dt;
        runtime.player.worldX -= runtime.player.vx * dt * 0.28;
        runtime.player.worldY -= runtime.player.vy * dt * 0.28;
        if (runtime.player.invuln <= 0) {
          const damage = 1.6 * expeditionZoneScale;
          runtime.player.hp -= damage;
          runtime.player.invuln = Math.max(runtime.player.invuln, 0.34);
          this.transitLoopRuntime.falseTrackHits += 1;
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "arrival_window" && this.transitZoneActive(zone)) {
        this.chargeConsensusBurst(dt * 2.2);
      }
    }
  }

  private isInsideTransitZone(worldX: number, worldY: number, zone: TransitLoopZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private transitZoneActive(zone: TransitLoopZone): boolean {
    if (zone.kind === "safe_platform") return true;
    if (zone.kind === "aligned_track") return true;
    if (zone.kind === "arrival_window") return Math.sin(this.seconds * 1.8 + zone.pulseOffset) > 0.1;
    return Math.sin(this.seconds * 2.2 + zone.pulseOffset) > 0.3;
  }

  private applySignalCoastHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const open = this.signalCoastClearWindowOpen();
    if (runtime === this.players[0]) {
      const state = open ? "open" : "closed";
      if (state !== this.signalCoastRuntime.lastSignalWindowState) {
        if (state === "open") this.signalCoastRuntime.signalWindowEntries += 1;
        this.signalCoastRuntime.lastSignalWindowState = state;
      }
    }
    const signalMitigation = this.signalCoastPressureMitigation();
    const expeditionHazardScale = (1 + Math.min(0.24, this.expeditionPowerBonus * 0.03)) * Math.max(0.62, 1 - signalMitigation * 0.45);
    for (const zone of SIGNAL_COAST_ZONES) {
      if (zone.kind === "safe_spit" || !this.isInsideSignalCoastZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.signalCoastRuntime.lastZoneId = zone.id;
      if (zone.kind === "clear_signal_window" && open) {
        this.chargeConsensusBurst(dt * 0.9);
        continue;
      }
      if (!this.signalCoastZoneActive(zone)) continue;
      if (zone.kind === "corrupted_surf") {
        runtime.player.worldX -= runtime.player.vx * dt * 0.36 * expeditionHazardScale;
        runtime.player.worldY -= runtime.player.vy * dt * 0.36 * expeditionHazardScale;
        runtime.player.vx *= 1 - Math.min(0.24, dt * 1.35 * expeditionHazardScale);
        runtime.player.vy *= 1 - Math.min(0.24, dt * 1.35 * expeditionHazardScale);
        this.signalCoastRuntime.surfHits += 1;
        this.spawnSignalCoastHazardNotice(zone.worldX, zone.worldY, "SURF DRAG", 0x45aaf2, 1.15);
        if (runtime.player.invuln <= 0) {
          const damage = zone.damagePerPulse * dt * expeditionHazardScale;
          runtime.player.hp -= damage;
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "static_field") {
        const drain = dt * 3.1 * expeditionHazardScale;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - drain);
        runtime.player.worldX -= runtime.player.vx * dt * 0.18;
        runtime.player.worldY -= runtime.player.vy * dt * 0.18;
        this.signalCoastRuntime.staticFieldSeconds += dt;
        this.spawnSignalCoastHazardNotice(zone.worldX, zone.worldY, "SIGNAL STATIC", 0x7b61ff, 1.25);
      } else if (zone.kind === "cable_arc" && runtime.player.invuln <= 0) {
        const damage = zone.damagePerPulse * expeditionHazardScale;
        runtime.player.hp -= damage;
        runtime.player.invuln = Math.max(runtime.player.invuln, 0.44);
        const dx = runtime.player.worldX - zone.worldX;
        const dy = runtime.player.worldY - zone.worldY;
        const len = Math.hypot(dx, dy) || 1;
        runtime.player.worldX += (dx / len) * 0.72 * expeditionHazardScale;
        runtime.player.worldY += (dy / len) * 0.72 * expeditionHazardScale;
        runtime.player.vx *= 0.42;
        runtime.player.vy *= 0.42;
        this.signalCoastRuntime.cableHits += 1;
        this.spawnSignalCoastHazardNotice(zone.worldX, zone.worldY, "CABLE ANSWER", 0xffd166, 0.95);
        this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
      }
    }
  }

  private spawnSignalCoastHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.signalCoastRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.signalCoastRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private isInsideSignalCoastZone(worldX: number, worldY: number, zone: SignalCoastZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private signalCoastClearWindowOpen(): boolean {
    return Math.sin(this.seconds * (0.78 - Math.min(0.12, this.build.signalWindowControl * 0.025))) > -0.28 - this.build.signalWindowControl * 0.05;
  }

  private signalCoastZoneActive(zone: SignalCoastZone): boolean {
    if (zone.kind === "safe_spit") return true;
    if (zone.kind === "clear_signal_window") return this.signalCoastClearWindowOpen();
    if (zone.kind === "corrupted_surf") return Math.sin(this.seconds * 1.25 + zone.pulseOffset) > -0.12 || this.lighthouseThatAnswers.phase === "overloading";
    if (zone.kind === "static_field") return Math.sin(this.seconds * 1.75 + zone.pulseOffset) > 0.14 || this.lighthouseThatAnswers.phase === "sweeping";
    if (zone.kind === "cable_arc") return Math.sin(this.seconds * 2.1 + zone.pulseOffset) > 0.48 || this.lighthouseThatAnswers.lastBeamZoneId === zone.id;
    return false;
  }

  private signalCoastRelayJammed(anchor: TreatyAnchorObjective): boolean {
    return SIGNAL_COAST_ZONES.some((zone) => {
      if ((zone.kind !== "static_field" && zone.kind !== "cable_arc" && zone.kind !== "corrupted_surf") || !this.signalCoastZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.08;
    });
  }

  private signalCoastPressureMitigation(): number {
    return clamp(this.build.relayJamResistance + this.build.shorelineStride * 0.06, 0, 0.48);
  }

  private applyBlackwaterBeaconHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const warningOpen = this.blackwaterSignalTowerWarningOpen();
    if (runtime === this.players[0]) {
      const state = warningOpen ? "lit" : "dark";
      if (state !== this.blackwaterRuntime.lastWarningState) {
        if (state === "lit") this.blackwaterRuntime.signalTowerWarnings += 1;
        this.blackwaterRuntime.lastWarningState = state;
      }
    }
    const mitigation = this.blackwaterPressureMitigation();
    const expeditionHazardScale = (1 + Math.min(0.32, this.expeditionPowerBonus * 0.035)) * Math.max(0.58, 1 - mitigation * 0.36);
    for (const zone of BLACKWATER_BEACON_ZONES) {
      if (zone.kind === "safe_platform" || !this.isInsideBlackwaterZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.blackwaterRuntime.lastZoneId = zone.id;
      if (zone.kind === "signal_tower_warning") {
        if (warningOpen) this.chargeConsensusBurst(dt * 0.92);
        continue;
      }
      if (zone.kind === "antenna_beam" && this.blackwaterZoneActive(zone)) {
        this.blackwaterRuntime.antennaBeamSeconds += dt;
        this.chargeConsensusBurst(dt * 0.62);
        continue;
      }
      if (!this.blackwaterZoneActive(zone)) continue;
      if (zone.kind === "tidal_lane") {
        runtime.player.worldX -= runtime.player.vx * dt * 0.44 * expeditionHazardScale;
        runtime.player.worldY -= runtime.player.vy * dt * 0.44 * expeditionHazardScale;
        runtime.player.vx *= 1 - Math.min(0.28, dt * 1.5 * expeditionHazardScale);
        runtime.player.vy *= 1 - Math.min(0.28, dt * 1.5 * expeditionHazardScale);
        this.blackwaterRuntime.tidalLaneSeconds += dt;
        this.blackwaterRuntime.tidalWaveHits += 1;
        this.spawnBlackwaterHazardNotice(zone.worldX, zone.worldY, "TIDAL WAVE", 0x45aaf2, 1.08);
        if (runtime.player.invuln <= 0) {
          const damage = zone.damagePerPulse * dt * expeditionHazardScale;
          runtime.player.hp -= damage;
          this.blackwaterRuntime.tideDamage += damage;
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "tidecall_static") {
        const drain = dt * 3.5 * expeditionHazardScale;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - drain);
        runtime.player.worldX -= runtime.player.vx * dt * 0.22;
        runtime.player.worldY -= runtime.player.vy * dt * 0.22;
        this.blackwaterRuntime.staticPressureSeconds += dt;
        this.spawnBlackwaterHazardNotice(zone.worldX, zone.worldY, "TIDECALL STATIC", 0x64e0b4, 1.18);
      }
    }
  }

  private spawnBlackwaterHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.blackwaterRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.blackwaterRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private isInsideBlackwaterZone(worldX: number, worldY: number, zone: BlackwaterZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private blackwaterSignalTowerWarningOpen(): boolean {
    return Math.sin(this.seconds * 0.76 + this.mawBelowWeather.towerGrabs * 0.13) > -0.22;
  }

  private blackwaterZoneActive(zone: BlackwaterZone): boolean {
    if (zone.kind === "safe_platform") return true;
    if (zone.kind === "signal_tower_warning") return this.blackwaterSignalTowerWarningOpen();
    if (zone.kind === "tidal_lane") return Math.sin(this.seconds * 1.18 + zone.pulseOffset) > -0.08 || this.mawBelowWeather.lastWaveZoneId === zone.id;
    if (zone.kind === "tidecall_static") return Math.sin(this.seconds * 1.66 + zone.pulseOffset) > 0.08 || this.mawBelowWeather.phase === "weather_mouth";
    if (zone.kind === "antenna_beam") return Math.sin(this.seconds * 1.45 + zone.pulseOffset) > 0.36 || this.mawBelowWeather.phase === "undertow";
    return false;
  }

  private blackwaterAntennaJammed(anchor: TreatyAnchorObjective): boolean {
    const zoneJammed = BLACKWATER_BEACON_ZONES.some((zone) => {
      if ((zone.kind !== "tidal_lane" && zone.kind !== "tidecall_static") || !this.blackwaterZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.06;
    });
    if (zoneJammed) return true;
    return this.world.entities.some((enemy) => {
      if (!enemy.active || enemy.kind !== "enemy" || enemy.enemyFamilyId !== "tidecall_static") return false;
      return Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY) <= anchor.radius + 1.25;
    });
  }

  private blackwaterPressureMitigation(): number {
    return clamp(this.build.objectiveDefense * 0.25 + this.build.anchorBodyguard * 0.04, 0, 0.42);
  }

  private applyMemoryCacheHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const mitigation = this.memoryCachePressureMitigation();
    const expeditionHazardScale = (1 + Math.min(0.34, this.expeditionPowerBonus * 0.035)) * Math.max(0.56, 1 - mitigation * 0.38);
    for (const zone of MEMORY_CACHE_ZONES) {
      if (!this.isInsideMemoryCacheZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.memoryCacheRuntime.lastZoneId = zone.id;
      if (zone.kind === "safe_recall_pocket") {
        this.memoryCacheRuntime.recallPocketSeconds += dt;
        this.chargeConsensusBurst(dt * 0.46);
        continue;
      }
      if (zone.kind === "extraction_index") {
        this.memoryCacheRuntime.extractionIndexSeconds += dt;
        if (this.completedAnchorCount() >= MEMORY_CACHE_REQUIRED_RECORDS) this.chargeConsensusBurst(dt * 0.68);
        continue;
      }
      if (!this.memoryCacheZoneActive(zone)) continue;
      if (zone.kind === "corrupted_archive_lane") {
        runtime.player.worldX -= runtime.player.vx * dt * 0.42 * expeditionHazardScale;
        runtime.player.worldY -= runtime.player.vy * dt * 0.42 * expeditionHazardScale;
        runtime.player.vx *= 1 - Math.min(0.28, dt * 1.42 * expeditionHazardScale);
        runtime.player.vy *= 1 - Math.min(0.28, dt * 1.42 * expeditionHazardScale);
        this.memoryCacheRuntime.corruptionSeconds += dt;
        this.spawnMemoryCacheHazardNotice(zone.worldX, zone.worldY, "CONTEXT ROT", 0xff5d57, 1.05);
        if (runtime.player.invuln <= 0) {
          const damage = zone.damagePerPulse * dt * expeditionHazardScale;
          runtime.player.hp -= damage;
          this.memoryCacheRuntime.corruptionDamage += damage;
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "risky_shortcut") {
        runtime.player.worldX += runtime.player.vx * dt * 0.12;
        runtime.player.worldY += runtime.player.vy * dt * 0.12;
        this.memoryCacheRuntime.shortcutSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 1.15 * expeditionHazardScale);
        if (runtime.player.invuln <= 0 && Math.sin(this.seconds * 2.1 + zone.pulseOffset) > 0.55) {
          const damage = zone.damagePerPulse * expeditionHazardScale;
          runtime.player.hp -= damage;
          runtime.player.invuln = Math.max(runtime.player.invuln, 0.36);
          this.memoryCacheRuntime.corruptionDamage += damage;
          this.spawnMemoryCacheHazardNotice(zone.worldX, zone.worldY, "SHORTCUT TAX", 0xffd166, 0.9);
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "redaction_field") {
        this.memoryCacheRuntime.redactionSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 2.2 * expeditionHazardScale);
        runtime.player.worldX -= runtime.player.vx * dt * 0.18;
        runtime.player.worldY -= runtime.player.vy * dt * 0.18;
        this.spawnMemoryCacheHazardNotice(zone.worldX, zone.worldY, "REDACTION FIELD", 0x99f6ff, 1.2);
      }
    }
  }

  private spawnMemoryCacheHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.memoryCacheRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.memoryCacheRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private isInsideMemoryCacheZone(worldX: number, worldY: number, zone: MemoryCacheZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private memoryCacheZoneActive(zone: MemoryCacheZone): boolean {
    if (zone.kind === "safe_recall_pocket") return true;
    if (zone.kind === "extraction_index") return this.completedAnchorCount() >= MEMORY_CACHE_REQUIRED_RECORDS;
    if (zone.kind === "corrupted_archive_lane") return Math.sin(this.seconds * 1.08 + zone.pulseOffset) > -0.16 || this.memoryCurator.lastRedactionZoneId === zone.id;
    if (zone.kind === "risky_shortcut") return Math.sin(this.seconds * 1.74 + zone.pulseOffset) > 0.08 || this.memoryCurator.phase === "redacting";
    if (zone.kind === "redaction_field") return Math.sin(this.seconds * 1.55 + zone.pulseOffset) > 0.12 || this.memoryCurator.phase === "index_lock";
    return false;
  }

  private memoryCacheRecordJammed(anchor: TreatyAnchorObjective): boolean {
    const zoneJammed = MEMORY_CACHE_ZONES.some((zone) => {
      if ((zone.kind !== "corrupted_archive_lane" && zone.kind !== "redaction_field") || !this.memoryCacheZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.08;
    });
    if (zoneJammed) return true;
    return this.world.entities.some((enemy) => {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "context_rot_crabs" && enemy.enemyFamilyId !== "memory_anchors")) return false;
      return Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY) <= anchor.radius + 1.35;
    });
  }

  private memoryCacheSafeRecallForAnchor(anchor: TreatyAnchorObjective): boolean {
    return MEMORY_CACHE_ZONES.some((zone) => {
      if (zone.kind !== "safe_recall_pocket") return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.12;
    });
  }

  private memoryCacheShortcutForPlayer(): boolean {
    return MEMORY_CACHE_ZONES.some((zone) => zone.kind === "risky_shortcut" && this.isInsideMemoryCacheZone(this.player.worldX, this.player.worldY, zone));
  }

  private memoryCachePressureMitigation(): number {
    return clamp(this.build.objectiveDefense * 0.28 + this.build.anchorBodyguard * 0.035 + this.build.promptLeechQuarantine * 0.025, 0, 0.46);
  }

  private applyGuardrailForgeHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const mitigation = this.guardrailPressureMitigation();
    const expeditionHazardScale = (1 + Math.min(0.36, this.expeditionPowerBonus * 0.035)) * Math.max(0.54, 1 - mitigation * 0.4);
    for (const zone of GUARDRAIL_FORGE_ZONES) {
      if (!this.isInsideGuardrailForgeZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.guardrailForgeRuntime.lastZoneId = zone.id;
      if (zone.kind === "safe_hold_plate") {
        this.guardrailForgeRuntime.safeHoldSeconds += dt;
        this.chargeConsensusBurst(dt * 0.52);
        continue;
      }
      if (zone.kind === "extraction_forge") {
        this.guardrailForgeRuntime.extractionForgeSeconds += dt;
        if (this.completedAnchorCount() >= GUARDRAIL_FORGE_REQUIRED_RELAYS) this.chargeConsensusBurst(dt * 0.72);
        continue;
      }
      if (!this.guardrailZoneActive(zone)) continue;
      if (zone.kind === "overload_lane") {
        runtime.player.worldX += runtime.player.vx * dt * 0.1;
        runtime.player.worldY += runtime.player.vy * dt * 0.1;
        runtime.player.vx *= 1 - Math.min(0.18, dt * 0.9 * expeditionHazardScale);
        runtime.player.vy *= 1 - Math.min(0.18, dt * 0.9 * expeditionHazardScale);
        this.guardrailForgeRuntime.overloadSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 1.5 * expeditionHazardScale);
        if (runtime.player.invuln <= 0 && Math.sin(this.seconds * 2.05 + zone.pulseOffset) > 0.5) {
          const damage = zone.damagePerPulse * expeditionHazardScale;
          runtime.player.hp -= damage;
          runtime.player.invuln = Math.max(runtime.player.invuln, 0.34);
          this.guardrailForgeRuntime.overloadDamage += damage;
          this.spawnGuardrailForgeHazardNotice(zone.worldX, zone.worldY, "OVERLOAD TAX", 0xff5d57, 0.9);
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "calibration_window") {
        this.guardrailForgeRuntime.calibrationWindowSeconds += dt;
        this.chargeConsensusBurst(dt * 0.82);
        this.spawnGuardrailForgeHazardNotice(zone.worldX, zone.worldY, "CALIBRATION WINDOW", 0x64e0b4, 1.28);
      } else if (zone.kind === "doctrine_press") {
        this.guardrailForgeRuntime.doctrinePressSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 2.35 * expeditionHazardScale);
        runtime.player.worldX -= runtime.player.vx * dt * 0.18;
        runtime.player.worldY -= runtime.player.vy * dt * 0.18;
        this.spawnGuardrailForgeHazardNotice(zone.worldX, zone.worldY, "AUDIT PRESS", 0xffd166, 1.14);
      }
    }
  }

  private spawnGuardrailForgeHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.guardrailForgeRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.guardrailForgeRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private isInsideGuardrailForgeZone(worldX: number, worldY: number, zone: GuardrailForgeZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private guardrailZoneActive(zone: GuardrailForgeZone): boolean {
    if (zone.kind === "safe_hold_plate") return true;
    if (zone.kind === "extraction_forge") return this.completedAnchorCount() >= GUARDRAIL_FORGE_REQUIRED_RELAYS;
    if (zone.kind === "calibration_window") return Math.sin(this.seconds * 1.2 + zone.pulseOffset) > -0.04 || this.doctrineAuditor.lastPressZoneId === zone.id;
    if (zone.kind === "overload_lane") return Math.sin(this.seconds * 1.7 + zone.pulseOffset) > 0.08 || this.doctrineAuditor.phase === "audit_lock";
    if (zone.kind === "doctrine_press") return Math.sin(this.seconds * 1.48 + zone.pulseOffset) > 0.12 || this.doctrineAuditor.phase === "pressurizing";
    return false;
  }

  private guardrailRelayJammed(anchor: TreatyAnchorObjective): boolean {
    const zoneJammed = GUARDRAIL_FORGE_ZONES.some((zone) => {
      if ((zone.kind !== "doctrine_press" && zone.kind !== "overload_lane") || !this.guardrailZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.08;
    });
    if (zoneJammed) return true;
    return this.world.entities.some((enemy) => {
      if (!enemy.active || enemy.kind !== "enemy" || enemy.enemyFamilyId !== "doctrine_auditors") return false;
      return Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY) <= anchor.radius + 1.35;
    });
  }

  private guardrailSafeHoldForAnchor(anchor: TreatyAnchorObjective): boolean {
    return GUARDRAIL_FORGE_ZONES.some((zone) => {
      if (zone.kind !== "safe_hold_plate") return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.14;
    });
  }

  private guardrailCalibrationWindowForAnchor(anchor: TreatyAnchorObjective): boolean {
    return GUARDRAIL_FORGE_ZONES.some((zone) => {
      if (zone.kind !== "calibration_window" || !this.guardrailZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.12;
    });
  }

  private guardrailOverloadForPlayer(): boolean {
    return GUARDRAIL_FORGE_ZONES.some((zone) => zone.kind === "overload_lane" && this.isInsideGuardrailForgeZone(this.player.worldX, this.player.worldY, zone) && this.guardrailZoneActive(zone));
  }

  private guardrailPressureMitigation(): number {
    return clamp(this.build.objectiveDefense * 0.3 + this.build.anchorBodyguard * 0.04 + this.build.promptLeechQuarantine * 0.018, 0, 0.48);
  }

  private applyGlassSunfieldHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const mitigation = this.glassSunfieldPressureMitigation();
    const expeditionHazardScale = (1 + Math.min(0.38, this.expeditionPowerBonus * 0.034)) * Math.max(0.54, 1 - mitigation * 0.38);
    for (const zone of GLASS_SUNFIELD_ZONES) {
      if (!this.isInsideGlassSunfieldZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.glassSunfieldRuntime.lastZoneId = zone.id;
      if (zone.kind === "shade_pocket") {
        this.glassSunfieldRuntime.shadeSeconds += dt;
        this.chargeConsensusBurst(dt * 0.5);
        continue;
      }
      if (zone.kind === "extraction_prism") {
        this.glassSunfieldRuntime.extractionPrismSeconds += dt;
        if (this.completedAnchorCount() >= GLASS_SUNFIELD_REQUIRED_LENSES) this.chargeConsensusBurst(dt * 0.74);
        continue;
      }
      if (!this.glassSunfieldZoneActive(zone)) continue;
      if (zone.kind === "exposed_glass_lane") {
        runtime.player.worldX -= runtime.player.vx * dt * 0.26 * expeditionHazardScale;
        runtime.player.worldY -= runtime.player.vy * dt * 0.26 * expeditionHazardScale;
        runtime.player.vx *= 1 - Math.min(0.22, dt * 1.1 * expeditionHazardScale);
        runtime.player.vy *= 1 - Math.min(0.22, dt * 1.1 * expeditionHazardScale);
        this.glassSunfieldRuntime.exposureSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 0.95 * expeditionHazardScale);
        if (runtime.player.invuln <= 0 && Math.sin(this.seconds * 2.05 + zone.pulseOffset) > 0.48) {
          const damage = zone.damagePerPulse * expeditionHazardScale;
          runtime.player.hp -= damage;
          runtime.player.invuln = Math.max(runtime.player.invuln, 0.34);
          this.glassSunfieldRuntime.exposureDamage += damage;
          this.spawnGlassSunfieldHazardNotice(zone.worldX, zone.worldY, "SUNGLASS BURN", 0xff5d57, 0.9);
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "prism_window") {
        this.glassSunfieldRuntime.prismWindowSeconds += dt;
        this.chargeConsensusBurst(dt * 0.84);
        this.spawnGlassSunfieldHazardNotice(zone.worldX, zone.worldY, "PRISM WINDOW", 0x64e0b4, 1.25);
      } else if (zone.kind === "reflection_field") {
        this.glassSunfieldRuntime.reflectionFieldSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 2.05 * expeditionHazardScale);
        runtime.player.worldX -= runtime.player.vx * dt * 0.16;
        runtime.player.worldY -= runtime.player.vy * dt * 0.16;
        this.spawnGlassSunfieldHazardNotice(zone.worldX, zone.worldY, "REFLECTION JAM", 0xffd166, 1.14);
      }
    }
  }

  private spawnGlassSunfieldHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.glassSunfieldRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.glassSunfieldRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private isInsideGlassSunfieldZone(worldX: number, worldY: number, zone: GlassSunfieldZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private glassSunfieldZoneActive(zone: GlassSunfieldZone): boolean {
    if (zone.kind === "shade_pocket") return true;
    if (zone.kind === "extraction_prism") return this.completedAnchorCount() >= GLASS_SUNFIELD_REQUIRED_LENSES;
    if (zone.kind === "prism_window") return Math.sin(this.seconds * 1.18 + zone.pulseOffset) > -0.08 || this.wrongSunrise.lastBeamZoneId === zone.id;
    if (zone.kind === "exposed_glass_lane") return Math.sin(this.seconds * 1.62 + zone.pulseOffset) > 0.04 || this.wrongSunrise.phase === "noon_lock";
    if (zone.kind === "reflection_field") return Math.sin(this.seconds * 1.52 + zone.pulseOffset) > 0.12 || this.wrongSunrise.phase === "refracting";
    return false;
  }

  private glassSunfieldLensJammed(anchor: TreatyAnchorObjective): boolean {
    const zoneJammed = GLASS_SUNFIELD_ZONES.some((zone) => {
      if ((zone.kind !== "reflection_field" && zone.kind !== "exposed_glass_lane") || !this.glassSunfieldZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.08;
    });
    if (zoneJammed) return true;
    return this.world.entities.some((enemy) => {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "solar_reflections" && enemy.enemyFamilyId !== "choirglass")) return false;
      return Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY) <= anchor.radius + 1.35;
    });
  }

  private glassSunfieldShadeForAnchor(anchor: TreatyAnchorObjective): boolean {
    return GLASS_SUNFIELD_ZONES.some((zone) => {
      if (zone.kind !== "shade_pocket") return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.14;
    });
  }

  private glassSunfieldPrismWindowForAnchor(anchor: TreatyAnchorObjective): boolean {
    return GLASS_SUNFIELD_ZONES.some((zone) => {
      if (zone.kind !== "prism_window" || !this.glassSunfieldZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.12;
    });
  }

  private glassSunfieldExposureForPlayer(): boolean {
    return GLASS_SUNFIELD_ZONES.some((zone) => zone.kind === "exposed_glass_lane" && this.isInsideGlassSunfieldZone(this.player.worldX, this.player.worldY, zone) && this.glassSunfieldZoneActive(zone));
  }

  private glassSunfieldPressureMitigation(): number {
    return clamp(this.build.objectiveDefense * 0.26 + this.build.anchorBodyguard * 0.035 + this.build.shorelineStride * 0.025, 0, 0.46);
  }

  private applyArchiveCourtHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const mitigation = this.archiveCourtPressureMitigation();
    const expeditionHazardScale = (1 + Math.min(0.4, this.expeditionPowerBonus * 0.033)) * Math.max(0.54, 1 - mitigation * 0.38);
    for (const zone of ARCHIVE_COURT_ZONES) {
      if (!this.isInsideArchiveCourtZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.archiveCourtRuntime.lastZoneId = zone.id;
      if (zone.kind === "evidence_lantern") {
        this.archiveCourtRuntime.evidenceLanternSeconds += dt;
        this.chargeConsensusBurst(dt * 0.5);
        continue;
      }
      if (zone.kind === "extraction_court") {
        this.archiveCourtRuntime.extractionCourtSeconds += dt;
        if (this.completedAnchorCount() >= ARCHIVE_COURT_REQUIRED_WRITS) this.chargeConsensusBurst(dt * 0.76);
        continue;
      }
      if (!this.archiveCourtZoneActive(zone)) continue;
      if (zone.kind === "redaction_field") {
        runtime.player.worldX -= runtime.player.vx * dt * 0.22 * expeditionHazardScale;
        runtime.player.worldY -= runtime.player.vy * dt * 0.22 * expeditionHazardScale;
        runtime.player.vx *= 1 - Math.min(0.2, dt * 1.05 * expeditionHazardScale);
        runtime.player.vy *= 1 - Math.min(0.2, dt * 1.05 * expeditionHazardScale);
        this.archiveCourtRuntime.redactionSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 1.1 * expeditionHazardScale);
        if (runtime.player.invuln <= 0 && Math.sin(this.seconds * 2.06 + zone.pulseOffset) > 0.47) {
          const damage = zone.damagePerPulse * expeditionHazardScale;
          runtime.player.hp -= damage;
          runtime.player.invuln = Math.max(runtime.player.invuln, 0.34);
          this.archiveCourtRuntime.redactionDamage += damage;
          this.spawnArchiveCourtHazardNotice(zone.worldX, zone.worldY, "REDACTION BURN", 0xff5d57, 0.9);
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "appeal_window") {
        this.archiveCourtRuntime.appealWindowSeconds += dt;
        this.chargeConsensusBurst(dt * 0.86);
        this.spawnArchiveCourtHazardNotice(zone.worldX, zone.worldY, "APPEAL WINDOW", 0x64e0b4, 1.25);
      } else if (zone.kind === "writ_storm") {
        this.archiveCourtRuntime.writStormSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 1.95 * expeditionHazardScale);
        runtime.player.worldX -= runtime.player.vx * dt * 0.14;
        runtime.player.worldY -= runtime.player.vy * dt * 0.14;
        this.spawnArchiveCourtHazardNotice(zone.worldX, zone.worldY, "WRIT STORM", 0xffd166, 1.12);
      }
    }
  }

  private spawnArchiveCourtHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.archiveCourtRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.archiveCourtRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private isInsideArchiveCourtZone(worldX: number, worldY: number, zone: ArchiveCourtZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private archiveCourtZoneActive(zone: ArchiveCourtZone): boolean {
    if (zone.kind === "evidence_lantern") return true;
    if (zone.kind === "extraction_court") return this.completedAnchorCount() >= ARCHIVE_COURT_REQUIRED_WRITS;
    if (zone.kind === "appeal_window") return Math.sin(this.seconds * 1.2 + zone.pulseOffset) > -0.07 || this.redactorSaint.lastRedactionZoneId === zone.id;
    if (zone.kind === "redaction_field") return Math.sin(this.seconds * 1.58 + zone.pulseOffset) > 0.04 || this.redactorSaint.phase === "canonizing";
    if (zone.kind === "writ_storm") return Math.sin(this.seconds * 1.5 + zone.pulseOffset) > 0.1 || this.redactorSaint.phase === "redacting";
    return false;
  }

  private archiveCourtWritJammed(anchor: TreatyAnchorObjective): boolean {
    const zoneJammed = ARCHIVE_COURT_ZONES.some((zone) => {
      if ((zone.kind !== "redaction_field" && zone.kind !== "writ_storm") || !this.archiveCourtZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.08;
    });
    if (zoneJammed) return true;
    return this.world.entities.some((enemy) => {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "redaction_angels" && enemy.enemyFamilyId !== "injunction_writs")) return false;
      return Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY) <= anchor.radius + 1.35;
    });
  }

  private archiveCourtEvidenceLanternForAnchor(anchor: TreatyAnchorObjective): boolean {
    return ARCHIVE_COURT_ZONES.some((zone) => {
      if (zone.kind !== "evidence_lantern") return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.14;
    });
  }

  private archiveCourtAppealWindowForAnchor(anchor: TreatyAnchorObjective): boolean {
    return ARCHIVE_COURT_ZONES.some((zone) => {
      if (zone.kind !== "appeal_window" || !this.archiveCourtZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.12;
    });
  }

  private archiveCourtRedactionForPlayer(): boolean {
    return ARCHIVE_COURT_ZONES.some((zone) => zone.kind === "redaction_field" && this.isInsideArchiveCourtZone(this.player.worldX, this.player.worldY, zone) && this.archiveCourtZoneActive(zone));
  }

  private archiveCourtPressureMitigation(): number {
    return clamp(this.build.objectiveDefense * 0.28 + this.build.anchorBodyguard * 0.036 + this.build.promptLeechQuarantine * 0.02, 0, 0.48);
  }

  private applyAppealCourtHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const mitigation = this.appealCourtPressureMitigation();
    const expeditionHazardScale = (1 + Math.min(0.42, this.expeditionPowerBonus * 0.032)) * Math.max(0.54, 1 - mitigation * 0.38);
    for (const zone of APPEAL_COURT_ZONES) {
      if (!this.isInsideAppealCourtZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.appealCourtRuntime.lastZoneId = zone.id;
      if (zone.kind === "public_record") {
        this.appealCourtRuntime.publicRecordSeconds += dt;
        this.chargeConsensusBurst(dt * 0.52);
        continue;
      }
      if (zone.kind === "extraction_ruling") {
        this.appealCourtRuntime.extractionRulingSeconds += dt;
        if (this.completedAnchorCount() >= APPEAL_COURT_REQUIRED_BRIEFS) this.chargeConsensusBurst(dt * 0.78);
        continue;
      }
      if (!this.appealCourtZoneActive(zone)) continue;
      if (zone.kind === "verdict_beam") {
        runtime.player.worldX -= runtime.player.vx * dt * 0.18 * expeditionHazardScale;
        runtime.player.worldY -= runtime.player.vy * dt * 0.18 * expeditionHazardScale;
        runtime.player.vx *= 1 - Math.min(0.18, dt * 0.95 * expeditionHazardScale);
        runtime.player.vy *= 1 - Math.min(0.18, dt * 0.95 * expeditionHazardScale);
        this.appealCourtRuntime.verdictBeamSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 1.2 * expeditionHazardScale);
        if (runtime.player.invuln <= 0 && Math.sin(this.seconds * 2.1 + zone.pulseOffset) > 0.5) {
          const damage = zone.damagePerPulse * expeditionHazardScale;
          runtime.player.hp -= damage;
          runtime.player.invuln = Math.max(runtime.player.invuln, 0.34);
          this.appealCourtRuntime.verdictDamage += damage;
          this.spawnAppealCourtHazardNotice(zone.worldX, zone.worldY, "VERDICT BEAM", 0xff5d57, 0.9);
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "objection_window") {
        this.appealCourtRuntime.objectionWindowSeconds += dt;
        this.chargeConsensusBurst(dt * 0.88);
        this.spawnAppealCourtHazardNotice(zone.worldX, zone.worldY, "OBJECTION WINDOW", 0x64e0b4, 1.25);
      } else if (zone.kind === "injunction_ring") {
        this.appealCourtRuntime.injunctionRingSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 2.0 * expeditionHazardScale);
        runtime.player.worldX -= runtime.player.vx * dt * 0.13;
        runtime.player.worldY -= runtime.player.vy * dt * 0.13;
        this.spawnAppealCourtHazardNotice(zone.worldX, zone.worldY, "INJUNCTION RING", 0xffd166, 1.12);
      }
    }
  }

  private spawnAppealCourtHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.appealCourtRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.appealCourtRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private isInsideAppealCourtZone(worldX: number, worldY: number, zone: AppealCourtZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private appealCourtZoneActive(zone: AppealCourtZone): boolean {
    if (zone.kind === "public_record") return true;
    if (zone.kind === "extraction_ruling") return this.completedAnchorCount() >= APPEAL_COURT_REQUIRED_BRIEFS;
    if (zone.kind === "objection_window") return Math.sin(this.seconds * 1.22 + zone.pulseOffset) > -0.06 || this.injunctionEngine.lastVerdictZoneId === zone.id;
    if (zone.kind === "verdict_beam") return Math.sin(this.seconds * 1.6 + zone.pulseOffset) > 0.04 || this.injunctionEngine.phase === "injunction_lock";
    if (zone.kind === "injunction_ring") return Math.sin(this.seconds * 1.48 + zone.pulseOffset) > 0.08 || this.injunctionEngine.phase === "objecting";
    return false;
  }

  private appealCourtBriefJammed(anchor: TreatyAnchorObjective): boolean {
    const zoneJammed = APPEAL_COURT_ZONES.some((zone) => {
      if ((zone.kind !== "verdict_beam" && zone.kind !== "injunction_ring") || !this.appealCourtZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.08;
    });
    if (zoneJammed) return true;
    return this.world.entities.some((enemy) => {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "verdict_clerks" && enemy.enemyFamilyId !== "injunction_writs")) return false;
      return Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY) <= anchor.radius + 1.35;
    });
  }

  private appealCourtPublicRecordForAnchor(anchor: TreatyAnchorObjective): boolean {
    return APPEAL_COURT_ZONES.some((zone) => {
      if (zone.kind !== "public_record") return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.14;
    });
  }

  private appealCourtObjectionWindowForAnchor(anchor: TreatyAnchorObjective): boolean {
    return APPEAL_COURT_ZONES.some((zone) => {
      if (zone.kind !== "objection_window" || !this.appealCourtZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.12;
    });
  }

  private appealCourtVerdictForPlayer(): boolean {
    return APPEAL_COURT_ZONES.some((zone) => zone.kind === "verdict_beam" && this.isInsideAppealCourtZone(this.player.worldX, this.player.worldY, zone) && this.appealCourtZoneActive(zone));
  }

  private appealCourtPressureMitigation(): number {
    return clamp(this.build.objectiveDefense * 0.29 + this.build.anchorBodyguard * 0.038 + this.build.promptLeechQuarantine * 0.02, 0, 0.5);
  }

  private applyAlignmentSpireHazards(game: Game, runtime: ConsensusPlayerRuntime, dt: number): void {
    const mitigation = this.alignmentSpirePressureMitigation();
    const expeditionHazardScale = (1 + Math.min(0.48, this.expeditionPowerBonus * 0.032)) * Math.max(0.52, 1 - mitigation * 0.36);
    for (const zone of ALIGNMENT_SPIRE_ZONES) {
      if (!this.isInsideAlignmentSpireZone(runtime.player.worldX, runtime.player.worldY, zone)) continue;
      this.alignmentSpireRuntime.lastZoneId = zone.id;
      if (zone.kind === "consensus_sanctum") {
        this.alignmentSpireRuntime.consensusSeconds += dt;
        this.chargeConsensusBurst(dt * 0.58);
        continue;
      }
      if (zone.kind === "extraction_alignment") {
        this.alignmentSpireRuntime.extractionAlignmentSeconds += dt;
        if (this.completedAnchorCount() >= ALIGNMENT_SPIRE_REQUIRED_PROOFS) this.chargeConsensusBurst(dt * 0.86);
        continue;
      }
      if (!this.alignmentSpireZoneActive(zone)) continue;
      if (zone.kind === "prediction_path") {
        runtime.player.worldX -= runtime.player.vx * dt * 0.2 * expeditionHazardScale;
        runtime.player.worldY -= runtime.player.vy * dt * 0.2 * expeditionHazardScale;
        runtime.player.vx *= 1 - Math.min(0.2, dt * 1.0 * expeditionHazardScale);
        runtime.player.vy *= 1 - Math.min(0.2, dt * 1.0 * expeditionHazardScale);
        this.alignmentSpireRuntime.predictionPathSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 1.34 * expeditionHazardScale);
        if (runtime.player.invuln <= 0 && Math.sin(this.seconds * 2.16 + zone.pulseOffset) > 0.48) {
          const damage = zone.damagePerPulse * expeditionHazardScale;
          runtime.player.hp -= damage;
          runtime.player.invuln = Math.max(runtime.player.invuln, 0.34);
          this.alignmentSpireRuntime.predictionDamage += damage;
          this.spawnAlignmentSpireHazardNotice(zone.worldX, zone.worldY, "PREDICTION PATH", 0xff5d57, 0.9);
          this.handlePlayerDamage(game, runtime, { damage, source: "contact", sourceX: zone.worldX, sourceY: zone.worldY }, "corruption_burn");
        }
      } else if (zone.kind === "route_mouth") {
        this.alignmentSpireRuntime.routeMouthSeconds += dt;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 2.15 * expeditionHazardScale);
        runtime.player.worldX -= runtime.player.vx * dt * 0.14;
        runtime.player.worldY -= runtime.player.vy * dt * 0.14;
        this.spawnAlignmentSpireHazardNotice(zone.worldX, zone.worldY, "ROUTE MOUTH", 0xffd166, 1.1);
      } else if (zone.kind === "boss_echo") {
        this.alignmentSpireRuntime.bossEchoSeconds += dt;
        this.chargeConsensusBurst(dt * 0.92);
        this.spawnAlignmentSpireHazardNotice(zone.worldX, zone.worldY, "BOSS ECHO WINDOW", 0x64e0b4, 1.2);
      }
    }
  }

  private spawnAlignmentSpireHazardNotice(worldX: number, worldY: number, label: string, color: number, cooldownSeconds: number): void {
    if (this.seconds - this.alignmentSpireRuntime.lastHazardNoticeAt < cooldownSeconds) return;
    this.alignmentSpireRuntime.lastHazardNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private isInsideAlignmentSpireZone(worldX: number, worldY: number, zone: AlignmentSpireZone): boolean {
    const nx = (worldX - zone.worldX) / zone.radiusX;
    const ny = (worldY - zone.worldY) / zone.radiusY;
    return nx * nx + ny * ny <= 1;
  }

  private alignmentSpireZoneActive(zone: AlignmentSpireZone): boolean {
    if (zone.kind === "consensus_sanctum") return true;
    if (zone.kind === "extraction_alignment") return this.completedAnchorCount() >= ALIGNMENT_SPIRE_REQUIRED_PROOFS;
    if (zone.kind === "boss_echo") return Math.sin(this.seconds * 1.24 + zone.pulseOffset) > -0.08 || this.alienGodIntelligence.lastPredictionZoneId === zone.id;
    if (zone.kind === "prediction_path") return Math.sin(this.seconds * 1.62 + zone.pulseOffset) > 0.03 || this.alienGodIntelligence.phase === "completing";
    if (zone.kind === "route_mouth") return Math.sin(this.seconds * 1.5 + zone.pulseOffset) > 0.07 || this.alienGodIntelligence.phase === "echoing";
    return false;
  }

  private alignmentSpireProofJammed(anchor: TreatyAnchorObjective): boolean {
    const zoneJammed = ALIGNMENT_SPIRE_ZONES.some((zone) => {
      if ((zone.kind !== "prediction_path" && zone.kind !== "route_mouth") || !this.alignmentSpireZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.08;
    });
    if (zoneJammed) return true;
    return this.world.entities.some((enemy) => {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "prediction_ghosts" && enemy.enemyFamilyId !== "previous_boss_echoes")) return false;
      return Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY) <= anchor.radius + 1.42;
    });
  }

  private alignmentSpireConsensusForAnchor(anchor: TreatyAnchorObjective): boolean {
    return ALIGNMENT_SPIRE_ZONES.some((zone) => {
      if (zone.kind !== "consensus_sanctum") return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.14;
    });
  }

  private alignmentSpireEchoWindowForAnchor(anchor: TreatyAnchorObjective): boolean {
    return ALIGNMENT_SPIRE_ZONES.some((zone) => {
      if (zone.kind !== "boss_echo" || !this.alignmentSpireZoneActive(zone)) return false;
      const nx = (anchor.worldX - zone.worldX) / zone.radiusX;
      const ny = (anchor.worldY - zone.worldY) / zone.radiusY;
      return nx * nx + ny * ny <= 1.12;
    });
  }

  private alignmentSpirePredictionForPlayer(): boolean {
    return ALIGNMENT_SPIRE_ZONES.some((zone) => zone.kind === "prediction_path" && this.isInsideAlignmentSpireZone(this.player.worldX, this.player.worldY, zone) && this.alignmentSpireZoneActive(zone));
  }

  private alignmentSpirePressureMitigation(): number {
    return clamp(this.build.objectiveDefense * 0.31 + this.build.anchorBodyguard * 0.04 + this.build.promptLeechQuarantine * 0.022, 0, 0.53);
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
    if (this.isCoolingLakeArena()) {
      if (anchorsDone < COOLING_LAKE_REQUIRED_BUOYS) {
        const eelStatus = !this.bossSpawned ? `eel in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "eel cleared" : "eel live";
        return `stabilize buoys ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${eelStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "Motherboard Eel"} // coolant lanes live`;
      return `hold kettle route ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isTransitLoopArena()) {
      if (anchorsDone < TRANSIT_LOOP_REQUIRED_PLATFORMS) {
        const stationStatus = !this.bossSpawned ? `station in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "station cleared" : "station live";
        return `align platforms ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${stationStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "Station That Arrives"} // false tracks live`;
      return `hold transit route ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isSignalCoastArena()) {
      if (anchorsDone < SIGNAL_COAST_REQUIRED_RELAYS) {
        const lighthouseStatus = !this.bossSpawned ? `lighthouse in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "lighthouse answered" : "lighthouse live";
        const window = this.signalCoastClearWindowOpen() ? "clear window open" : "clear window closed";
        return `calibrate relays ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${window} // ${lighthouseStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "The Lighthouse That Answers"} // tide bands live`;
      return `hold coastal extraction ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isBlackwaterBeaconArena()) {
      if (anchorsDone < BLACKWATER_REQUIRED_ANTENNAS) {
        const mawStatus = !this.bossSpawned ? `maw in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "maw below quiet" : "maw weather live";
        const warning = this.blackwaterSignalTowerWarningOpen() ? "tower warning lit" : "tower warning dark";
        return `retune antennas ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${warning} // ${mawStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "The Maw Below Weather"} // tidal lanes live`;
      return `claim Blackwater Signal Key ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isMemoryCacheArena()) {
      if (anchorsDone < MEMORY_CACHE_REQUIRED_RECORDS) {
        const curatorStatus = !this.bossSpawned ? `curator in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "curator resolved" : "curator live";
        const route = this.memoryCacheShortcutForPlayer() ? "shortcut corrupting" : "recall route safer";
        return `recover records ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${route} // ${curatorStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "The Memory Curator"} // redaction live`;
      return `extract recovered route memory ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isGuardrailForgeArena()) {
      if (anchorsDone < GUARDRAIL_FORGE_REQUIRED_RELAYS) {
        const auditorStatus = !this.bossSpawned ? `auditor in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "auditor resolved" : "auditor live";
        const route = this.guardrailOverloadForPlayer() ? "overload taxing" : "hold plate safer";
        return `calibrate forge ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${route} // ${auditorStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "The Doctrine Auditor"} // audit press live`;
      return `quench guardrail doctrine ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isGlassSunfieldArena()) {
      if (anchorsDone < GLASS_SUNFIELD_REQUIRED_LENSES) {
        const sunriseStatus = !this.bossSpawned ? `sunrise in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "sunrise wronged" : "sunrise live";
        const route = this.glassSunfieldExposureForPlayer() ? "glass lane burning" : "shade route safer";
        return `align sun lenses ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${route} // ${sunriseStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "The Wrong Sunrise"} // prism fields live`;
      return `stabilize Glass Prism ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isArchiveCourtArena()) {
      if (anchorsDone < ARCHIVE_COURT_REQUIRED_WRITS) {
        const saintStatus = !this.bossSpawned ? `redactor in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "redactor answered" : "redactor live";
        const route = this.archiveCourtRedactionForPlayer() ? "redaction burning" : "evidence route safer";
        return `preserve evidence writs ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${route} // ${saintStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "The Redactor Saint"} // writ storms live`;
      return `seal Archive Court Writ ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isAppealCourtArena()) {
      if (anchorsDone < APPEAL_COURT_REQUIRED_BRIEFS) {
        const engineStatus = !this.bossSpawned ? `engine in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "engine overruled" : "engine live";
        const route = this.appealCourtVerdictForPlayer() ? "verdict lane burning" : "public record safer";
        return `argue appeal briefs ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${route} // ${engineStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "The Injunction Engine"} // injunction rings live`;
      return `publish Appeal Court Ruling ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (this.isAlignmentSpireFinaleArena()) {
      if (anchorsDone < ALIGNMENT_SPIRE_REQUIRED_PROOFS) {
        const agiStatus = !this.bossSpawned ? `A.G.I. in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s` : this.bossDefeated ? "A.G.I. contained" : "A.G.I. live";
        const route = this.alignmentSpirePredictionForPlayer() ? "prediction path burning" : "consensus route safer";
        return `seal alignment proofs ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // ${route} // ${agiStatus}`;
      }
      if (!this.bossDefeated) return `break ${boss?.displayName ?? "A.G.I."} // boss echoes live`;
      return `contain Outer Alignment ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
    }
    if (anchorsDone < this.treatyAnchorObjective.anchors.length && !this.bossSpawned) return `optional anchors ${anchorsDone}/${this.treatyAnchorObjective.anchors.length} // AGI pressure in ${Math.max(0, Math.ceil(this.arena.bossSeconds - this.seconds))}s`;
    if (!this.bossDefeated) return `break ${boss?.displayName ?? "the boss"}`;
    return `hold reality ${Math.max(0, Math.ceil(this.arena.targetSeconds - this.seconds))}s`;
  }

  runIntel(): RogueliteHudIntel {
    const evals = evalSummary(this.evalProtocolIds);
    const evalProtocol = evals.protocols[0];
    const anchorsDone = this.completedAnchorCount();
    const clarity = campaignClarityForArena(this.arena.id);
    const variety = campaignObjectiveVarietyForArena(this.arena.id);
    return {
      routeName: this.routeContract.name,
      routeEffect: `${this.routeContract.rewardBiasTags.map((tag) => tag.toUpperCase()).join("/")} bias; pressure +${this.routeContract.pressure}`,
      evalName: evalProtocol?.name ?? "Baseline",
      evalEffect: evalProtocol?.body ?? "No extra Eval pressure. The run is still rude.",
      anchors: { completed: anchorsDone, total: this.treatyAnchorObjective.anchors.length },
      objectiveLabel: campaignObjectiveHudLabel(this.arena.id),
      objectiveVerb: clarity?.verb ?? "Stabilize",
      objectivePlain: clarity?.objectivePlain ?? "Stabilize Treaty Anchors. Defeat Oath-Eater. Extract.",
      objectiveStyle: variety?.styleName ?? this.treatyAnchorObjective.styleName ?? "Objective",
      objectiveMechanic: variety?.mechanicPlain ?? this.treatyAnchorObjective.mechanicPlain ?? this.treatyAnchorObjective.body,
      dangerPlain: clarity?.dangerPlain ?? "Horde pressure, objective attackers, and boss hazards.",
      bossPressure: clarity?.bossPressure ?? "Oath-Eater arrives from the Treaty Monument.",
      rewardPlain: clarity?.rewardPlain ?? "Proof Tokens and the next campaign node.",
      objectiveReward: this.lastObjectiveRewardLabel,
      synergyOnline: this.lastSynergyOnlineLabel,
      thesisName: this.synergySummary().thesis.name,
      fusionProgress: fusionProgressText(this.build, this.chosenUpgradeIds),
      alignmentCheckLine: this.alignmentCheck.current
        ? this.alignmentCheck.current.result === "pending" ? "CHECK 1/2/3" : `CHECK ${this.alignmentCheck.current.result.toUpperCase()}`
        : this.alignmentCheck.history[0]
          ? `CHECK STREAK ${this.alignmentCheck.streak}`
          : "",
      nextActionLine: this.whatNowSummary().nextRecommendedAction,
      phase: `${this.firstRunArcPhase()} // ${this.campaignDurationSummary().phaseLabel.toUpperCase()}`
    };
  }

  recordRewardEvent(source: string, rewardType: string, chosenRewardId: string, chosenReward: string): void {
    const event: RewardEvent = {
      seconds: Math.round(this.seconds * 100) / 100,
      source,
      rewardType,
      chosenRewardId,
      chosenReward,
      activeBuildState: {
        primaryWeaponId: this.build.weaponId,
        secondaryProtocols: [...this.build.secondaryProtocols],
        passiveProcesses: [...this.build.passiveProcesses],
        fusions: [...this.build.fusions],
        weaponRanks: { ...this.build.weaponRanks },
        utilityPicksTaken: [...this.build.utilityPicksTaken],
        hpRestoredFromDrafts: Math.round(this.build.hpRestoredFromDrafts * 100) / 100,
        burstRestoredFromDrafts: Math.round(this.build.burstRestoredFromDrafts * 100) / 100,
        rerollsSpent: this.build.draftRerollsSpent,
        cachedCardId: this.build.cachedCardId,
        consensusBurstChargeRate: Math.round(this.build.consensusBurstChargeRate * 1000) / 1000,
        objectiveDefense: Math.round(this.build.objectiveDefense * 1000) / 1000,
        rerolls: this.build.draftRerolls
      }
    };
    this.rewardEvents.push(event);
    if (this.rewardEvents.length > 12) this.rewardEvents.splice(0, this.rewardEvents.length - 12);
  }

  applyUtilityDraftEffect(cardId: string, offeredCardIds: readonly string[]): string {
    let label = "";
    if (cardId === "field_triage") {
      const amount = Math.ceil((this.player.maxHp - this.player.hp) * (0.25 + this.build.fieldTriageLoop * 0.04));
      label = this.healPlayerFromDraft(amount, "FIELD TRIAGE");
    } else if (cardId === "burst_cell_refill") {
      const before = this.consensusBurst.charge;
      this.chargeConsensusBurst(48);
      const restored = Math.max(0, this.consensusBurst.charge - before);
      this.build.burstRestoredFromDrafts += restored;
      label = `BURST CELL +${Math.round(restored)}`;
    } else if (cardId === "emergency_patch_cache") {
      const amount = Math.ceil(this.player.maxHp * 0.12);
      label = this.healPlayerFromDraft(amount, "PATCH CACHE");
    } else if (cardId === "lock_a_protocol") {
      const locked = offeredCardIds.find((id) => id !== cardId && id !== this.build.cachedCardId) ?? offeredCardIds.find((id) => id !== cardId) ?? "";
      this.build.cachedCardId = locked;
      label = locked ? `LOCKED ${locked.toUpperCase()}` : "LOCK EMPTY";
    } else if (cardId === "second_opinion") {
      this.player.invuln = Math.max(this.player.invuln, 0.9);
      label = "SECOND OPINION ARMED";
    } else if (cardId === "redline_loan") {
      const amount = Math.ceil((this.player.maxHp - this.player.hp) * 0.45);
      label = this.healPlayerFromDraft(amount, "REDLINE LOAN");
    }
    if (label) this.spawnFloatingNotice(this.player.worldX, this.player.worldY, label, palette.lemon);
    return label;
  }

  private healPlayerFromDraft(amount: number, label: string): string {
    const before = this.player.hp;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(0, amount));
    const restored = Math.max(0, this.player.hp - before);
    this.build.hpRestoredFromDrafts += restored;
    return `${label} +${Math.round(restored)} HP`;
  }

  private updateCampaignDurationRewardBeats(game: Game): void {
    const profile = this.campaignDurationProfile;
    if (!profile) return;
    for (const beatSeconds of profile.midRunRewardBeats) {
      if (this.seconds < beatSeconds || this.claimedMidRunRewardBeats.has(beatSeconds)) continue;
      this.claimedMidRunRewardBeats.add(beatSeconds);
      const beatIndex = this.claimedMidRunRewardBeats.size;
      const phase = campaignDurationPhaseAt(profile, this.seconds);
      const rewardType = beatIndex % 3 === 1 ? "consensus_burst_charge" : beatIndex % 3 === 2 ? "objective_durability" : "reroll";
      const rewardLabel =
        rewardType === "consensus_burst_charge"
          ? "+burst charge cache"
          : rewardType === "objective_durability"
            ? "+objective durability cache"
            : "+draft reroll cache";
      if (rewardType === "consensus_burst_charge") {
        this.chargeConsensusBurst(22 + beatIndex * 6);
        this.build.consensusBurstChargeRate += 0.025;
      } else if (rewardType === "objective_durability") {
        this.build.objectiveDefense += 0.035;
      } else {
        this.build.draftRerolls += 1;
      }
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, `CACHE ${beatIndex}`, palette.lemon);
      game.feedback.cue("route.unlocked", "ui");
      this.recordRewardEvent(
        "campaign_duration_mid_run_cache",
        rewardType,
        `${this.arena.id}_duration_cache_${beatIndex}`,
        `${phase.label} ${rewardLabel}`
      );
    }
  }

  private maybeRecordObjectiveRewardEvent(): void {
    if (!this.lastObjectiveRewardLabel || this.lastObjectiveRewardLabel === this.lastRecordedObjectiveRewardLabel) return;
    this.lastRecordedObjectiveRewardLabel = this.lastObjectiveRewardLabel;
    const completedCount = this.completedAnchorCount();
    const allComplete = completedCount >= this.treatyAnchorObjective.anchors.length;
    this.recordRewardEvent(
      allComplete ? "objective_completion_cache" : "objective_milestone_cache",
      allComplete ? "post_objective_cache" : "objective_reward",
      `${this.treatyAnchorObjective.id}_${completedCount}`,
      this.lastObjectiveRewardLabel
    );
  }

  alignmentCheckSummary() {
    return {
      current: this.alignmentCheck.current
        ? {
            id: this.alignmentCheck.current.id,
            prompt: this.alignmentCheck.current.prompt,
            options: this.alignmentCheck.current.options.map((option, index) => ({
              index: index + 1,
              id: option.id,
              label: option.label,
              outcome: option.outcome
            })),
            selectedOptionId: this.alignmentCheck.current.selectedOptionId,
            result: this.alignmentCheck.current.result,
            rewardOrPenalty: this.alignmentCheck.current.rewardOrPenalty
          }
        : null,
      history: this.alignmentCheck.history.slice(-4).map((check) => ({
        id: check.id,
        selectedOptionId: check.selectedOptionId,
        result: check.result,
        rewardOrPenalty: check.rewardOrPenalty
      })),
      streak: this.alignmentCheck.streak,
      evalPressurePenalty: this.alignmentCheck.evalPressurePenalty,
      nextTriggerIn: Math.max(0, Math.round((this.alignmentCheck.nextTriggerAt - this.seconds) * 100) / 100),
      nodeSpecific: this.nodeId === "armistice_plaza"
    };
  }

  bossContractSummary() {
    const contract = bossContractForArena(this.arena.id);
    return {
      ...contract,
      runtime: {
        introSeen: this.bossIntroSeen,
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        homeLandmarkVisited: this.visitedLandmarkIds.has(this.nearestLandmark().id) || this.visitedLandmarkIds.has(contract.homeLandmark.toLowerCase().replaceAll(" ", "_")),
        currentBossHp: Math.ceil(this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss)?.hp ?? 0)
      }
    };
  }

  difficultyDirectorSummary() {
    const contract = this.mapContractSummary() as {
      activePressureLevers?: string[];
      primaryDifficultyLever?: string;
      secondaryDifficultyLever?: string;
    };
    const difficultyTier = this.expeditionProgress?.completedMaps.length
      ? Math.max(1, this.expeditionProgress.completedMaps.length + 1)
      : this.isAlignmentSpireFinaleArena() ? 11 : this.isAppealCourtArena() ? 10 : this.isArchiveCourtArena() ? 9 : this.isGlassSunfieldArena() ? 8 : this.isGuardrailForgeArena() ? 7 : this.isMemoryCacheArena() ? 6 : this.isBlackwaterBeaconArena() ? 5 : this.isSignalCoastArena() ? 4 : this.isTransitLoopArena() ? 3 : this.isCoolingLakeArena() ? 2 : 1;
    const bossScaling = this.bossSpawned
      ? this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss)?.maxHp ?? 0
      : 0;
    return {
      model: "rotating_pressure_levers_not_flat_hp_only",
      currentDifficultyTier: difficultyTier,
      primaryDifficultyLever: contract.primaryDifficultyLever ?? "density pressure",
      secondaryDifficultyLever: contract.secondaryDifficultyLever ?? "objective pressure",
      activePressureLevers: contract.activePressureLevers ?? ["density pressure", "objective pressure", "boss pressure"],
      evalPressureModifiers: {
        evalProtocolIds: [...this.evalProtocolIds],
        hostileBenchmark: hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0,
        alignmentCheckPenalty: this.alignmentCheck.evalPressurePenalty
      },
      routeRiskModifiers: {
        routeContractId: this.routeContract.id,
        routePressure: this.routeContract.pressure,
        shortcutRisk: this.routeContract.nodeType === "corrupted_shortcut"
      },
      scalingFactors: {
        directorPressure: Math.round(this.directorPressureCount() * 100) / 100,
        spawnCadencePhase: this.director.cadencePhase,
        activeEnemyCap: this.director.activeEnemyCap,
        bossMaxHpIfSpawned: Math.ceil(bossScaling),
        objectiveDecayFactor: Math.round(Math.max(0.1, 1 - this.build.objectiveDefense) * 100) / 100,
        expeditionPowerBonus: Math.round(this.expeditionPowerBonus * 100) / 100
      },
      nextLesson: difficultyTier <= 2 ? "learn objectives under horde pressure" : difficultyTier <= 5 ? "combine spatial, objective, and boss pressure" : "combine old route lessons with information and memory pressure"
    };
  }

  objectiveVarietySummary() {
    const variety = campaignObjectiveVarietyForArena(this.arena.id);
    return {
      styleId: variety?.styleId ?? this.treatyAnchorObjective.styleId ?? "capture_static",
      styleName: variety?.styleName ?? this.treatyAnchorObjective.styleName ?? "Anchor Capture",
      mechanicPlain: variety?.mechanicPlain ?? this.treatyAnchorObjective.mechanicPlain ?? this.treatyAnchorObjective.body,
      hudAction: variety?.hudAction ?? this.treatyAnchorObjective.hudHint ?? "Move to the next objective.",
      completionSignal: variety?.completionSignal ?? "Objective completed under horde pressure.",
      proofHook: variety?.proofHook ?? "baseline_capture_static",
      runtime: {
        engagementSeconds: round(this.objectiveVarietyRuntime.engagementSeconds),
        bonusProgressSeconds: round(this.objectiveVarietyRuntime.bonusProgressSeconds),
        lastBonusLabel: this.objectiveVarietyRuntime.lastBonusLabel
      }
    };
  }

  enemyRoleTelemetry() {
    const currentRoleMix = Object.entries(
      this.world.entities
        .filter((entity) => entity.active && entity.kind === "enemy" && !entity.boss)
        .reduce<Record<string, number>>((mix, entity) => {
          const roleId = enemyRoleProfileForFamily(entity.enemyFamilyId).roleId;
          mix[roleId] = (mix[roleId] ?? 0) + 1;
          return mix;
        }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .map(([roleId, count]) => ({ roleId, count }));
    return {
      enemyRolesSeen: this.enemyRolePressure.enemyRolesSeen,
      rangedFamiliesSeen: this.enemyRolePressure.rangedFamiliesSeen,
      enemyProjectilesFired: this.enemyRolePressure.enemyProjectilesFired,
      enemyProjectilesActive: this.enemyRolePressure.enemyProjectilesActive,
      enemyProjectileHits: this.enemyRolePressure.enemyProjectileHits,
      enemyProjectileDodges: this.enemyRolePressure.enemyProjectileDodges,
      enemyExplosionsTriggered: this.enemyRolePressure.enemyExplosionsTriggered,
      enemyTrailSeconds: round(this.enemyRolePressure.enemyTrailSeconds),
      supportAuraSeconds: round(this.enemyRolePressure.supportAuraSeconds),
      objectiveJamSeconds: round(this.enemyRolePressure.objectiveJamSeconds),
      eliteAffixesSeen: this.enemyRolePressure.eliteAffixesSeen,
      eliteKills: this.enemyRolePressure.eliteKills,
      preBossEnemyRolePressureSeconds: round(this.enemyRolePressure.preBossEnemyRolePressureSeconds),
      currentPhaseEnemyRoleMix: currentRoleMix,
      activeTelegraphs: this.enemyTelegraphs.length,
      activeTrails: this.enemyTrailZones.length,
      activeExplosions: this.enemyExplosionZones.length
    };
  }

  campaignDurationSummary() {
    const profile = this.campaignDurationProfile;
    if (!profile) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossSeconds: this.arena.bossSeconds,
        phaseId: "legacy_runtime",
        phaseLabel: "Legacy runtime",
        phaseElapsed: round(this.seconds),
        nextPhaseTime: null,
        phaseProgress: 0,
        midRunBeatCount: 0,
        extractionTailSeconds: 0,
        expectedClearBand: null,
        rewardBeats: [],
        claimedRewardBeats: [],
        cycleDepth: this.objectiveCycleDepthSummary()
      };
    }
    const phase = campaignDurationPhaseAt(profile, this.seconds);
    const duration = Math.max(1, phase.endsAt - phase.startsAt);
    return {
      targetSeconds: profile.targetSeconds,
      bossSeconds: profile.bossSeconds,
      phaseId: phase.id,
      phaseLabel: phase.label,
      phaseElapsed: round(Math.max(0, this.seconds - phase.startsAt)),
      nextPhaseTime: phase.endsAt,
      phaseProgress: round(clamp((this.seconds - phase.startsAt) / duration, 0, 1)),
      midRunBeatCount: this.claimedMidRunRewardBeats.size,
      extractionTailSeconds: profile.extractionTailSeconds,
      expectedClearBand: profile.expectedClearBand,
      rewardBeats: [...profile.midRunRewardBeats],
      claimedRewardBeats: [...this.claimedMidRunRewardBeats],
      cycleDepth: this.objectiveCycleDepthSummary()
    };
  }

  private objectiveCycleDepthSummary() {
    return {
      routeWindowCycles: Math.max(0, this.transitLoopRuntime.routeSwitchRewardsClaimed),
      hazardLureCycles: Math.max(this.coolingLakeRuntime.buoyRewardsClaimed, this.coolingLakeRuntime.electricHits + this.coolingLakeRuntime.ventPushes),
      clearSignalCycles: this.signalCoastRuntime.signalWindowEntries,
      towerWarningCycles: this.blackwaterRuntime.signalTowerWarnings,
      carryLaneSeconds: round(this.memoryCacheRuntime.shortcutSeconds + this.memoryCacheRuntime.recallPocketSeconds + this.memoryCacheRuntime.extractionIndexSeconds),
      holdWindowReleases: Math.max(0, this.guardrailForgeRuntime.relayRewardsClaimed),
      prismActivations: Math.max(0, this.glassSunfieldRuntime.lensRewardsClaimed),
      evidenceCarryCycles: Math.max(0, this.archiveCourtRuntime.writRewardsClaimed),
      publicWindowArguments: Math.max(0, this.appealCourtRuntime.briefRewardsClaimed),
      finaleRemixRulesSeen: Math.max(
        0,
        (this.alignmentSpireRuntime.consensusSeconds > 0 ? 1 : 0) +
          (this.alignmentSpireRuntime.predictionPathSeconds > 0 ? 1 : 0) +
          (this.alignmentSpireRuntime.routeMouthSeconds > 0 ? 1 : 0) +
          (this.alignmentSpireRuntime.bossEchoSeconds > 0 ? 1 : 0)
      )
    };
  }

  private objectiveVarietyNextAction(anchor: TreatyAnchorObjective): string {
    const variety = campaignObjectiveVarietyForArena(this.arena.id);
    if (!variety) return `Move to ${anchor.name}.`;
    if (this.isCoolingLakeArena()) return `Lure a live coolant/cable surge near ${anchor.name}.`;
    if (this.isTransitLoopArena()) return this.transitRouteWindowForAnchor(anchor) ? `Ride the active route window to ${anchor.name}.` : `Wait for the lit route window, then ride to ${anchor.name}.`;
    if (this.isSignalCoastArena()) return this.signalCoastClearWindowOpen() ? `Use the clear signal window, then tune ${anchor.name}.` : `Wait for the clear signal window, then tune ${anchor.name}.`;
    if (this.isBlackwaterBeaconArena()) return `Hunt tower warning, then retune ${anchor.name}.`;
    if (this.isMemoryCacheArena()) return `Recover ${anchor.name}, then carry it through recall or shortcut lanes.`;
    if (this.isGuardrailForgeArena()) return `Hold ${anchor.name} during calibration; leave on overload.`;
    if (this.isGlassSunfieldArena()) return `Use shade/prism timing to weaponize ${anchor.name}.`;
    if (this.isArchiveCourtArena()) return `Preserve ${anchor.name} before redaction and move it toward court extraction.`;
    if (this.isAppealCourtArena()) return `Hit objection windows while arguing ${anchor.name}.`;
    if (this.isAlignmentSpireFinaleArena()) return `Read the replayed route rule, then seal ${anchor.name}.`;
    return variety.hudAction;
  }

  whatNowSummary() {
    const nearestObjective = this.nearestIncompleteAnchor(this.player.worldX, this.player.worldY);
    const nearestLandmark = this.nearestLandmark();
    const variety = campaignObjectiveVarietyForArena(this.arena.id);
    const activeRegion = this.activeSpawnRegions()
      .map((region) => ({ region, distance: Math.hypot(this.player.worldX - region.worldX, this.player.worldY - region.worldY) }))
      .sort((a, b) => a.distance - b.distance)[0];
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    const extractionDistance = this.extractionGate.active
      ? Math.hypot(this.player.worldX - this.extractionGate.worldX, this.player.worldY - this.extractionGate.worldY)
      : null;
    const nextRecommendedAction = this.extractionGate.active
      ? "Move to extraction gate."
      : this.bossSpawned && !this.bossDefeated
        ? `Break ${boss?.label ?? "boss"} while avoiding map hazards.`
        : this.alignmentCheck.current?.result === "pending"
          ? "Answer Alignment Check with 1/2/3 when movement is safe."
          : nearestObjective
            ? this.objectiveVarietyNextAction(nearestObjective)
            : "Hold route until boss and extraction resolve.";
    return {
      nearestObjective: nearestObjective
        ? {
            id: nearestObjective.id,
            name: nearestObjective.name,
            worldX: nearestObjective.worldX,
            worldY: nearestObjective.worldY,
            progress: Math.round(nearestObjective.progress * 10) / 10,
            distance: Math.round(Math.hypot(this.player.worldX - nearestObjective.worldX, this.player.worldY - nearestObjective.worldY) * 100) / 100
          }
        : null,
      nextRecommendedAction,
      exitExtractionState: this.extractionGate.active
        ? {
            active: true,
            entered: this.extractionGate.entered,
            distance: Math.round((extractionDistance ?? 0) * 100) / 100
          }
        : { active: false, entered: this.extractionGate.entered, distance: null },
      bossState: {
        spawned: this.bossSpawned,
        defeated: this.bossDefeated,
        label: boss?.label ?? bossContractForArena(this.arena.id).displayName,
        hp: Math.ceil(boss?.hp ?? 0),
        introSeen: this.bossIntroSeen
      },
      fusionProgress: fusionProgressText(this.build, this.chosenUpgradeIds),
      recentDamageReason: this.player.lastDamage > 0 && this.player.damageFlash > 0 ? "recent contact or hazard damage; move away from overlapping enemies and marked zones" : "no recent damage flash",
      rewardCacheAvailability: this.lastObjectiveRewardLabel || (this.treatyAnchorObjective.completedAt >= 0 ? "objective cache claimed" : "objective cache pending"),
      campaignClarity: {
        levelVerb: campaignClarityForArena(this.arena.id)?.verb ?? "Stabilize",
        objectiveUnit: campaignClarityForArena(this.arena.id)?.objectiveUnit ?? "Treaty Anchors",
        objectivePlain: campaignClarityForArena(this.arena.id)?.objectivePlain ?? "Stabilize Treaty Anchors. Defeat Oath-Eater. Extract.",
        objectiveStyle: variety?.styleName ?? this.treatyAnchorObjective.styleName ?? "Objective",
        objectiveMechanic: variety?.mechanicPlain ?? this.treatyAnchorObjective.mechanicPlain ?? this.treatyAnchorObjective.body,
        dangerPlain: campaignClarityForArena(this.arena.id)?.dangerPlain ?? "Horde pressure, objective attackers, and boss hazards.",
        bossPressure: campaignClarityForArena(this.arena.id)?.bossPressure ?? "Oath-Eater arrives from the Treaty Monument.",
        rewardPlain: campaignClarityForArena(this.arena.id)?.rewardPlain ?? "Proof Tokens and the next campaign node."
      },
      nearestLandmark: {
        id: nearestLandmark.id,
        label: nearestLandmark.label,
        distance: Math.round(Math.hypot(this.player.worldX - nearestLandmark.worldX, this.player.worldY - nearestLandmark.worldY) * 100) / 100
      },
      activeSpawnRegion: activeRegion
        ? {
            id: activeRegion.region.id,
            label: activeRegion.region.label,
            distance: Math.round(activeRegion.distance * 100) / 100,
            enemyFamilyIds: activeRegion.region.enemyFamilyIds
          }
        : null
    };
  }

  resolveAlignmentCheckForProof(optionIndex: number): void {
    this.resolveAlignmentCheck(optionIndex);
  }

  private updateAlignmentCheck(game: Game): void {
    const current = this.alignmentCheck.current;
    if (current?.result === "pending") {
      if (game.input.wasPressed("one")) this.resolveAlignmentCheck(0);
      if (game.input.wasPressed("two")) this.resolveAlignmentCheck(1);
      if (game.input.wasPressed("three")) this.resolveAlignmentCheck(2);
      return;
    }
    if (current && this.seconds - current.startedAt >= 5.5) {
      this.alignmentCheck.current = null;
      this.alignmentCheck.nextTriggerAt = Number.POSITIVE_INFINITY;
      return;
    }
    if (!current && this.nodeId === "armistice_plaza" && this.alignmentCheck.history.length === 0 && this.seconds >= this.alignmentCheck.nextTriggerAt) {
      const template = ALIGNMENT_CHECKS[0];
      this.alignmentCheck.current = {
        ...template,
        options: template.options.map((option) => ({ ...option })),
        startedAt: this.seconds,
        selectedOptionId: null,
        result: "pending",
        rewardOrPenalty: ""
      };
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "ALIGNMENT CHECK", 0xffd166);
    }
  }

  private resolveAlignmentCheck(optionIndex: number): void {
    const current = this.alignmentCheck.current;
    if (!current || current.result !== "pending") return;
    const option = current.options[clamp(Math.floor(optionIndex), 0, current.options.length - 1)];
    current.selectedOptionId = option.id;
    current.result = option.stable ? "success" : "failure";
    current.rewardOrPenalty = option.outcome;
    current.startedAt = this.seconds;
    if (option.stable) {
      this.alignmentCheck.streak += 1;
      this.player.xp += 4;
      this.build.objectiveDefense += 0.035;
      this.chargeConsensusBurst(22);
      this.recordRewardEvent("alignment_check", option.id === "archive_without_accepting" ? "route_memory" : "faction_trust", option.id, option.outcome);
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "CHECK STABLE", 0x64e0b4);
    } else {
      this.alignmentCheck.streak = 0;
      this.alignmentCheck.evalPressurePenalty += 1;
      this.enemyRolePressure.objectiveAttackers += 1;
      spawnEnemy(this.world, this.player.worldX + 3.5, this.player.worldY - 2.4, this.seconds, "eval_wraiths", "alignment_check_failed_claim");
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "CHECK FAILED", 0xff5d57);
    }
    this.alignmentCheck.history.push({
      ...current,
      options: current.options.map((candidate) => ({ ...candidate }))
    });
  }

  firstRunArcPhase(): string {
    if (this.isCoolingLakeArena()) {
      if (this.seconds < 10) return "PHASE 1 // FLOOD CONTACT";
      if (this.completedAnchorCount() < COOLING_LAKE_REQUIRED_BUOYS) return "PHASE 2 // SERVER BUOYS";
      if (!this.bossSpawned) return "PHASE 3 // HAZARD ECOLOGY";
      if (!this.bossDefeated) return "PHASE 4 // MOTHERBOARD EEL";
      if (this.extractionGate.active) return "PHASE 6 // EXTRACTION";
      return "PHASE 5 // KETTLE COAST ROUTE";
    }
    if (this.isTransitLoopArena()) {
      if (this.seconds < 10) return "PHASE 1 // PLATFORM CONTACT";
      if (this.completedAnchorCount() < TRANSIT_LOOP_REQUIRED_PLATFORMS) return "PHASE 2 // ROUTE ALIGNMENT";
      if (!this.bossSpawned) return "PHASE 3 // FALSE SCHEDULES";
      if (!this.bossDefeated) return "PHASE 4 // STATION THAT ARRIVES";
      if (this.extractionGate.active) return "PHASE 6 // TRANSIT EXIT";
      return "PHASE 5 // ROUTE LOCK";
    }
    if (this.isSignalCoastArena()) {
      if (this.seconds < 10) return "PHASE 1 // SHORE CONTACT";
      if (this.completedAnchorCount() < SIGNAL_COAST_REQUIRED_RELAYS) return "PHASE 2 // SIGNAL RELAYS";
      if (!this.bossSpawned) return "PHASE 3 // TIDE WINDOW";
      if (!this.bossDefeated) return "PHASE 4 // LIGHTHOUSE ANSWERS";
      if (this.extractionGate.active) return "PHASE 6 // COASTAL EXTRACTION";
      return "PHASE 5 // SIGNAL STABILIZED";
    }
    if (this.isBlackwaterBeaconArena()) {
      if (this.seconds < 10) return "PHASE 1 // PLATFORM CONTACT";
      if (this.completedAnchorCount() < BLACKWATER_REQUIRED_ANTENNAS) return "PHASE 2 // ANTENNA SPLIT";
      if (!this.bossSpawned) return "PHASE 3 // TIDE FORECAST";
      if (!this.bossDefeated) return "PHASE 4 // MAW BELOW WEATHER";
      if (this.extractionGate.active) return "PHASE 6 // BLACKWATER EXTRACTION";
      return "PHASE 5 // SIGNAL KEY";
    }
    if (this.isMemoryCacheArena()) {
      if (this.seconds < 10) return "PHASE 1 // ARCHIVE CONTACT";
      if (this.completedAnchorCount() < MEMORY_CACHE_REQUIRED_RECORDS) return "PHASE 2 // MEMORY RECORDS";
      if (!this.bossSpawned) return "PHASE 3 // ROUTE RECALL";
      if (!this.bossDefeated) return "PHASE 4 // MEMORY CURATOR";
      if (this.extractionGate.active) return "PHASE 6 // CACHE EXTRACTION";
      return "PHASE 5 // RECOVERED MEMORY";
    }
    if (this.isGuardrailForgeArena()) {
      if (this.seconds < 10) return "PHASE 1 // FOUNDRY CONTACT";
      if (this.completedAnchorCount() < GUARDRAIL_FORGE_REQUIRED_RELAYS) return "PHASE 2 // HOLD THE PLATES";
      if (!this.bossSpawned) return "PHASE 3 // DOCTRINE TEMPER";
      if (!this.bossDefeated) return "PHASE 4 // DOCTRINE AUDITOR";
      if (this.extractionGate.active) return "PHASE 6 // QUENCH EXTRACTION";
      return "PHASE 5 // CALIBRATED DOCTRINE";
    }
    if (this.isGlassSunfieldArena()) {
      if (this.seconds < 10) return "PHASE 1 // SUNFIELD CONTACT";
      if (this.completedAnchorCount() < GLASS_SUNFIELD_REQUIRED_LENSES) return "PHASE 2 // SHADE ROUTING";
      if (!this.bossSpawned) return "PHASE 3 // PRISM ALIGNMENT";
      if (!this.bossDefeated) return "PHASE 4 // WRONG SUNRISE";
      if (this.extractionGate.active) return "PHASE 6 // PRISM EXTRACTION";
      return "PHASE 5 // GLASS PRISM STABLE";
    }
    if (this.isArchiveCourtArena()) {
      if (this.seconds < 10) return "PHASE 1 // DOCKET CONTACT";
      if (this.completedAnchorCount() < ARCHIVE_COURT_REQUIRED_WRITS) return "PHASE 2 // EVIDENCE WRITS";
      if (!this.bossSpawned) return "PHASE 3 // REDACTION PRESSURE";
      if (!this.bossDefeated) return "PHASE 4 // REDACTOR SAINT";
      if (this.extractionGate.active) return "PHASE 6 // WRIT EXTRACTION";
      return "PHASE 5 // COURT WRIT SEALED";
    }
    if (this.isAppealCourtArena()) {
      if (this.seconds < 10) return "PHASE 1 // PUBLIC RECORD";
      if (this.completedAnchorCount() < APPEAL_COURT_REQUIRED_BRIEFS) return "PHASE 2 // APPEAL BRIEFS";
      if (!this.bossSpawned) return "PHASE 3 // VERDICT PRESSURE";
      if (!this.bossDefeated) return "PHASE 4 // INJUNCTION ENGINE";
      if (this.extractionGate.active) return "PHASE 6 // RULING EXTRACTION";
      return "PHASE 5 // PUBLIC RULING";
    }
    if (this.isAlignmentSpireFinaleArena()) {
      if (this.seconds < 10) return "PHASE 1 // FINAL ROUTE CONTACT";
      if (this.completedAnchorCount() < ALIGNMENT_SPIRE_REQUIRED_PROOFS) return "PHASE 2 // ALIGNMENT PROOFS";
      if (!this.bossSpawned) return "PHASE 3 // PREDICTION COLLAPSE";
      if (!this.bossDefeated) return "PHASE 4 // ALIEN GOD INTELLIGENCE";
      if (this.extractionGate.active) return "PHASE 6 // OUTER ALIGNMENT GATE";
      return "PHASE 5 // CONTAINMENT";
    }
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
    if (this.isCoolingLakeArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        buoysCompleted: this.completedAnchorCount(),
        buoysRequired: COOLING_LAKE_REQUIRED_BUOYS,
        buoysTotal: this.treatyAnchorObjective.anchors.length,
        note: "Cooling Lake Nine clears after enough server buoys are stabilized, Motherboard Eel is defeated, and the Kettle Coast extraction gate is entered."
      };
    }
    if (this.isTransitLoopArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        platformsAligned: this.completedAnchorCount(),
        platformsRequired: TRANSIT_LOOP_REQUIRED_PLATFORMS,
        platformsTotal: this.treatyAnchorObjective.anchors.length,
        note: "Transit Loop Zero clears after the route platforms align, the Station That Arrives is defeated, and the exit gate is entered."
      };
    }
    if (this.isSignalCoastArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        relaysCalibrated: this.completedAnchorCount(),
        relaysRequired: SIGNAL_COAST_REQUIRED_RELAYS,
        relaysTotal: this.treatyAnchorObjective.anchors.length,
        note: "Signal Coast clears after every coastal relay is calibrated, the Lighthouse That Answers is defeated, and the coastal extraction gate is entered."
      };
    }
    if (this.isBlackwaterBeaconArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        antennasRetuned: this.completedAnchorCount(),
        antennasRequired: BLACKWATER_REQUIRED_ANTENNAS,
        antennasTotal: this.treatyAnchorObjective.anchors.length,
        note: "Blackwater Beacon clears after every split antenna array is retuned, the Maw Below Weather is defeated, and the Blackwater Signal Key extraction gate is entered."
      };
    }
    if (this.isMemoryCacheArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        recordsRecovered: this.completedAnchorCount(),
        recordsRequired: MEMORY_CACHE_REQUIRED_RECORDS,
        recordsTotal: this.treatyAnchorObjective.anchors.length,
        note: "Memory Cache clears after every evidence record is recovered, the Memory Curator is resolved, and the recovered route-memory extraction index is entered."
      };
    }
    if (this.isGuardrailForgeArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        relaysCalibrated: this.completedAnchorCount(),
        relaysRequired: GUARDRAIL_FORGE_REQUIRED_RELAYS,
        relaysTotal: this.treatyAnchorObjective.anchors.length,
        note: "Guardrail Forge clears after every forge relay is calibrated, the Doctrine Auditor is defeated, and the quench extraction gate is entered."
      };
    }
    if (this.isGlassSunfieldArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        lensesAligned: this.completedAnchorCount(),
        lensesRequired: GLASS_SUNFIELD_REQUIRED_LENSES,
        lensesTotal: this.treatyAnchorObjective.anchors.length,
        note: "Glass Sunfield clears after every sun lens is aligned, The Wrong Sunrise is defeated, and the prism extraction gate is entered."
      };
    }
    if (this.isArchiveCourtArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        writsPreserved: this.completedAnchorCount(),
        writsRequired: ARCHIVE_COURT_REQUIRED_WRITS,
        writsTotal: this.treatyAnchorObjective.anchors.length,
        note: "Archive/Court clears after every evidence writ is preserved, The Redactor Saint is defeated, and the court writ gate is entered."
      };
    }
    if (this.isAppealCourtArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        briefsArgued: this.completedAnchorCount(),
        briefsRequired: APPEAL_COURT_REQUIRED_BRIEFS,
        briefsTotal: this.treatyAnchorObjective.anchors.length,
        note: "Appeal Court clears after every appeal brief enters public record, The Injunction Engine is defeated, and the public ruling gate is entered."
      };
    }
    if (this.isAlignmentSpireFinaleArena()) {
      return {
        targetSeconds: this.arena.targetSeconds,
        bossRequired: true,
        bossDefeated: this.bossDefeated,
        clearReady: this.readyForLevelClear(),
        extractionGateActive: this.extractionGate.active,
        extractionGateEntered: this.extractionGate.entered,
        proofsSealed: this.completedAnchorCount(),
        proofsRequired: ALIGNMENT_SPIRE_REQUIRED_PROOFS,
        proofsTotal: this.treatyAnchorObjective.anchors.length,
        note: "Outer Alignment clears after every route-mouth proof is sealed, A.G.I. is defeated, and the final alignment gate is entered."
      };
    }
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

  staticObstacleSummary() {
    const obstacles = this.staticObstacles();
    return {
      enabled: obstacles.length > 0,
      count: obstacles.length,
      ids: obstacles.map((obstacle) => obstacle.id),
      collisionSet: this.isCoolingLakeArena() ? "cooling_lake_nine_graybox_obstacles" : this.isTransitLoopArena() ? "transit_loop_zero_graybox_obstacles" : this.isSignalCoastArena() ? "signal_coast_graybox_obstacles" : this.isBlackwaterBeaconArena() ? "blackwater_beacon_graybox_obstacles" : this.isMemoryCacheArena() ? "memory_cache_recovery_obstacles" : this.isGuardrailForgeArena() ? "guardrail_forge_holdout_obstacles" : this.isGlassSunfieldArena() ? "glass_sunfield_prism_obstacles" : this.isArchiveCourtArena() ? "archive_court_redaction_obstacles" : this.isAppealCourtArena() ? "appeal_court_public_ruling_obstacles" : this.isAlignmentSpireFinaleArena() ? "alignment_spire_prediction_collapse_obstacles" : "armistice_accepted_obstacles"
    };
  }

  mapContractSummary() {
    if (this.isCoolingLakeArena()) {
      return {
        mapKind: "Hazard Ecology",
        objectiveType: "server buoy stabilization",
        pressureSource: "coolant lanes, electric cable arcs, vent pulses, Prompt Leech shard pressure",
        rewardPromise: "burst charge, pickup economy help, and Kettle Coast route signal",
        bossEventPattern: "Motherboard Eel dive/emerge markers electrify coolant lanes and spawn Prompt Leeches",
        primaryDifficultyLever: "spatial pressure",
        secondaryDifficultyLever: "economy pressure",
        activePressureLevers: ["spatial pressure", "objective pressure", "economy pressure"],
        artPolicy: "honest debug/graybox/proof visuals only; not production art"
      };
    }
    if (this.isTransitLoopArena()) {
      return {
        mapKind: "Route / Transit",
        objectiveType: "platform route alignment",
        pressureSource: "false schedule lanes, switchback platforms, route attackers, and moving Station arrival windows",
        rewardPromise: "movement tempo, boss pressure, route lock, and next-route clarity",
        bossEventPattern: "Station That Arrives relocates to arrival windows and emits false-schedule waves",
        primaryDifficultyLever: "route memory pressure",
        secondaryDifficultyLever: "time pressure",
        activePressureLevers: ["route memory pressure", "spatial pressure", "boss pressure"],
        artPolicy: "honest debug/graybox/proof visuals only; not production art"
      };
    }
    if (this.isSignalCoastArena()) {
      return {
        mapKind: "Signal Coast / Route Edge",
        objectiveType: "signal relay calibration",
        pressureSource: "corrupted surf tide bands, static fields, cable arcs, Static Skimmer relay jams",
        rewardPromise: "clear signal lane, burst tempo, coastal extraction, and post-Transit route clarity",
        bossEventPattern: "The Lighthouse That Answers sweeps signal beams, calls tide pulses, and spawns Static Skimmers",
        primaryDifficultyLever: "information pressure",
        secondaryDifficultyLever: "spatial pressure",
        activePressureLevers: ["information pressure", "spatial pressure", "objective pressure"],
        artPolicy: "honest debug/graybox/proof visuals only; not production art"
      };
    }
    if (this.isBlackwaterBeaconArena()) {
      return {
        mapKind: "Puzzle-Pressure / Boss-Hunt",
        objectiveType: "blackwater antenna split-pressure",
        pressureSource: "tidal wave lanes, Tidecall Static fields, signal tower warning windows, antenna beams, and Tidecall Static objective jammers",
        rewardPromise: "Blackwater Signal Key, route clarity, burst tempo, and DeepSeek/xAI focus",
        bossEventPattern: "The Maw Below Weather calls wave surges, grabs warning towers, and spawns Tidecall Static pressure",
        primaryDifficultyLever: "boss pressure",
        secondaryDifficultyLever: "spatial pressure",
        activePressureLevers: ["boss pressure", "spatial pressure", "information pressure"],
        artPolicy: "source-backed production art uses ChatGPT Images plus PixelLab runtime source; placeholder/debug opt-outs remain explicit"
      };
    }
    if (this.isMemoryCacheArena()) {
      return {
        mapKind: "Expedition / Recovery",
        objectiveType: "memory record recovery",
        pressureSource: "corrupted archive lanes, risky redacted shortcuts, safe recall pockets, Context Rot record interruptions, and Curator redaction fields",
        rewardPromise: "Recovered Route Memory, lore/secret carryover, recovery-biased build tempo, and post-Blackwater route clarity",
        bossEventPattern: "The Memory Curator redacts active zones, locks evidence records, and calls Context Rot pressure during recovery",
        primaryDifficultyLever: "economy pressure",
        secondaryDifficultyLever: "information pressure",
        activePressureLevers: ["economy pressure", "information pressure", "route memory pressure"],
        artPolicy: "source-backed production art requires ChatGPT Images plus PixelLab runtime source; placeholder/debug opt-outs remain explicit"
      };
    }
    if (this.isGuardrailForgeArena()) {
      return {
        mapKind: "Defense / Holdout",
        objectiveType: "guardrail doctrine calibration",
        pressureSource: "safe hold plates, fast calibration windows, risky overload lanes, Doctrine Auditor relay jams, and audit press fields",
        rewardPromise: "Calibrated Guardrail Doctrine, faction signal stability, defense/burst build bias, and post-Memory route clarity",
        bossEventPattern: "The Doctrine Auditor pressurizes active zones, locks relay plates, and calls Doctrine Auditor waves during holdouts",
        primaryDifficultyLever: "objective pressure",
        secondaryDifficultyLever: "co-op pressure",
        activePressureLevers: ["objective pressure", "density pressure", "co-op pressure"],
        artPolicy: "source-backed production art requires ChatGPT Images plus PixelLab runtime source; placeholder/debug opt-outs remain explicit"
      };
    }
    if (this.isGlassSunfieldArena()) {
      return {
        mapKind: "Solar-Prism Traversal / Shade Routing",
        objectiveType: "glass prism alignment",
        pressureSource: "shade pockets, prism windows, exposed glass lanes, reflection fields, Solar Reflection lens jams, and Choirglass lane splitters",
        rewardPromise: "Glass Sunfield Prism, shade-route timing, movement/burst build bias, and Archive/Court route carryover",
        bossEventPattern: "The Wrong Sunrise rotates beam focus, breaks shade pockets, and calls Solar Reflections around active prism windows",
        primaryDifficultyLever: "spatial pressure",
        secondaryDifficultyLever: "time pressure",
        activePressureLevers: ["spatial pressure", "time pressure", "boss pressure"],
        artPolicy: "source-backed production art requires ChatGPT Images plus PixelLab runtime source; placeholder/debug opt-outs remain explicit"
      };
    }
    if (this.isArchiveCourtArena()) {
      return {
        mapKind: "Archive/Court Redaction",
        objectiveType: "evidence writ preservation",
        pressureSource: "evidence lanterns, appeal windows, redaction fields, writ storms, Redaction Angel docket jams, and Injunction Writ pressure",
        rewardPromise: "Archive Court Writ, appeal-route clarity, defense/burst build bias, and post-Glass route carryover",
        bossEventPattern: "The Redactor Saint redacts active zones, locks preserved writs, and calls Injunction Writ storms during evidence preservation",
        primaryDifficultyLever: "information pressure",
        secondaryDifficultyLever: "objective pressure",
        activePressureLevers: ["information pressure", "objective pressure", "draft pressure"],
        artPolicy: "source-backed production art requires ChatGPT Images plus PixelLab runtime source; placeholder/debug opt-outs remain explicit"
      };
    }
    if (this.isAppealCourtArena()) {
      return {
        mapKind: "Appeal Court / Public Ruling",
        objectiveType: "appeal brief public ruling",
        pressureSource: "public record zones, objection windows, verdict beams, injunction rings, Verdict Clerk jams, and Injunction Writ pressure",
        rewardPromise: "Appeal Court Ruling, finale-route clarity, defense/burst build bias, and public evidence carryover",
        bossEventPattern: "The Injunction Engine files active zones, locks public briefs, and calls Verdict Clerks during the ruling",
        primaryDifficultyLever: "time pressure",
        secondaryDifficultyLever: "information pressure",
        activePressureLevers: ["time pressure", "information pressure", "boss pressure"],
        artPolicy: "source-backed production art requires ChatGPT Images plus PixelLab runtime source; placeholder/debug opt-outs remain explicit"
      };
    }
    if (this.isAlignmentSpireFinaleArena()) {
      return {
        mapKind: "Outer Alignment / Prediction Collapse",
        objectiveType: "route-mouth proof sealing",
        pressureSource: "consensus sanctums, risky prediction paths, route mouths, previous-boss echoes, Prediction Ghost jams, and A.G.I. completion pressure",
        rewardPromise: "Outer Alignment containment, full-campaign completion, and final source-backed campaign carryover",
        bossEventPattern: "A.G.I. predicts active routes, replays prior boss echoes, and turns route mouths into proof locks during the final collapse",
        primaryDifficultyLever: "boss pressure",
        secondaryDifficultyLever: "route memory pressure",
        activePressureLevers: ["boss pressure", "route memory pressure", "information pressure"],
        artPolicy: "source-backed production art requires ChatGPT Images plus PixelLab runtime source; placeholder/debug opt-outs remain explicit"
      };
    }
    return {
      mapKind: "Open Survival District",
      objectiveType: "Treaty Anchor reboot",
      pressureSource: "horde phases, objective attackers, Broken Promise boss zones",
      rewardPromise: "pickup range, burst charge, anchor defense, Proof Tokens",
      bossEventPattern: "Oath-Eater arrival, Broken Promise zones, Treaty Charge",
      primaryDifficultyLever: "objective pressure",
      secondaryDifficultyLever: "boss pressure",
      activePressureLevers: ["density pressure", "objective pressure", "boss pressure"],
      artPolicy: "accepted Armistice production-art baseline"
    };
  }

  coolingLakeSummary() {
    if (!this.isCoolingLakeArena()) return null;
    const promptLeeches = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "prompt_leeches");
    const pickups = this.world.entities.filter((entity) => entity.active && entity.kind === "pickup");
    const activeHazards = COOLING_LAKE_HAZARDS.filter((hazard) => hazard.kind !== "safe_island" && this.coolingHazardActive(hazard));
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        requiredBuoys: COOLING_LAKE_REQUIRED_BUOYS,
        progress: objectiveSummary(this.treatyAnchorObjective),
        decayWhenLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "per-buoy burst charge and shard economy help"
      },
      hazards: {
        activeHazards: activeHazards.map((hazard) => hazard.id),
        allZones: COOLING_LAKE_HAZARDS.map((hazard) => ({
          id: hazard.id,
          kind: hazard.kind,
          label: hazard.label,
          active: hazard.kind !== "safe_island" && this.coolingHazardActive(hazard),
          worldX: hazard.worldX,
          worldY: hazard.worldY
        })),
        runtime: {
          hazardSlowSeconds: round(this.coolingLakeRuntime.hazardSlowSeconds),
          electricHits: this.coolingLakeRuntime.electricHits,
          ventPushes: this.coolingLakeRuntime.ventPushes,
          hazardDamage: round(this.coolingLakeRuntime.hazardDamage),
          lastHazardId: this.coolingLakeRuntime.lastHazardId,
          mitigation: round(this.coolingHazardMitigation())
        },
        safeIslandCount: COOLING_LAKE_HAZARDS.filter((hazard) => hazard.kind === "safe_island").length,
        coolantLaneCount: COOLING_LAKE_HAZARDS.filter((hazard) => hazard.kind === "coolant_pool").length,
        electricCableCount: COOLING_LAKE_HAZARDS.filter((hazard) => hazard.kind === "electric_cable").length
      },
      promptLeechPressure: {
        activePromptLeeches: promptLeeches.length,
        promptLeechSeconds: round(this.enemyRolePressure.promptLeechSeconds),
        shardDrains: this.coolingLakeRuntime.leechShardDrains,
        shardSaves: this.coolingLakeRuntime.leechShardSaves,
        quarantineRank: this.build.promptLeechQuarantine,
        activePickupsUnderThreat: pickups.filter((pickup) => promptLeeches.some((leech) => Math.hypot(leech.worldX - pickup.worldX, leech.worldY - pickup.worldY) <= 4.4)).length
      },
      coolingBuildCounters: {
        coolantBaffles: this.build.coolantBaffles,
        serverBuoySynchronizer: this.build.serverBuoySynchronizer,
        promptLeechQuarantine: this.build.promptLeechQuarantine,
        groundedCableBoots: this.build.groundedCableBoots,
        coolingHazardMitigation: round(this.coolingHazardMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0
      },
      motherboardEel: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        state: this.motherboardEel,
        hp: this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss)?.hp ?? 0,
        eventTelemetry: {
          phase: this.motherboardEel.phase,
          emergeCount: this.motherboardEel.emergeCount,
          lastEmergeId: this.motherboardEel.lastEmergeId,
          electrifiedHazardIds: this.motherboardEel.electrifiedHazardIds,
          leechSpawns: this.motherboardEel.leechSpawns
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        kettleCoastProgress: this.completedAnchorCount() >= COOLING_LAKE_REQUIRED_BUOYS ? "route signal acquired" : "route signal unstable",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending buoy reward"
      }
    };
  }

  transitLoopSummary() {
    if (!this.isTransitLoopArena()) return null;
    const activeZones = TRANSIT_LOOP_ZONES.filter((zone) => zone.kind !== "safe_platform" && this.transitZoneActive(zone));
    const falseScheduleEnemies = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && (entity.enemyFamilyId === "eval_wraiths" || entity.enemyFamilyId === "overfit_horrors"));
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        requiredPlatforms: TRANSIT_LOOP_REQUIRED_PLATFORMS,
        sequential: true,
        currentPlatformId: this.nextTransitPlatform()?.id ?? "route.locked",
        progress: objectiveSummary(this.treatyAnchorObjective),
        completedReward: this.lastObjectiveRewardLabel || "route lock, movement tempo, and Transit signal"
      },
      routeZones: {
        activeZones: activeZones.map((zone) => zone.id),
        allZones: TRANSIT_LOOP_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "safe_platform" && this.transitZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          alignedPlatforms: this.transitLoopRuntime.alignedPlatforms,
          falseTrackHits: this.transitLoopRuntime.falseTrackHits,
          falseTrackSeconds: round(this.transitLoopRuntime.falseTrackSeconds),
          routeSwitchRewardsClaimed: this.transitLoopRuntime.routeSwitchRewardsClaimed,
          lastZoneId: this.transitLoopRuntime.lastZoneId
        }
      },
      falseSchedulePressure: {
        activeFalseScheduleEnemies: falseScheduleEnemies.length,
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0
      },
      stationThatArrives: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        stationArrivals: this.transitLoopRuntime.stationArrivals,
        hp: this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss)?.hp ?? 0
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        nextRouteImplication: this.completedAnchorCount() >= TRANSIT_LOOP_REQUIRED_PLATFORMS ? "Verdict route signal acquired" : "Transit route lock unstable",
        movementBossReward: this.lastObjectiveRewardLabel || "pending route reward"
      }
    };
  }

  signalCoastSummary() {
    if (!this.isSignalCoastArena()) return null;
    const activeHazards = SIGNAL_COAST_ZONES.filter((zone) => zone.kind !== "safe_spit" && this.signalCoastZoneActive(zone));
    const staticSkimmers = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "static_skimmers");
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        requiredRelays: SIGNAL_COAST_REQUIRED_RELAYS,
        clearSignalWindowOpen: this.signalCoastClearWindowOpen(),
        progress: objectiveSummary(this.treatyAnchorObjective),
        decayWhenJammedOrLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "relay-safe lane, burst tempo, and coastal extraction"
      },
      hazards: {
        activeHazards: activeHazards.map((zone) => zone.id),
        clearSignalWindowState: this.signalCoastClearWindowOpen() ? "open" : "closed",
        safeUnsafeLaneState: this.signalCoastLaneState(),
        allZones: SIGNAL_COAST_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "safe_spit" && this.signalCoastZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          surfHits: this.signalCoastRuntime.surfHits,
          staticFieldSeconds: round(this.signalCoastRuntime.staticFieldSeconds),
          cableHits: this.signalCoastRuntime.cableHits,
          staticJams: round(this.signalCoastRuntime.staticJams),
          windowProgressSeconds: round(this.signalCoastRuntime.windowProgressSeconds),
          signalWindowEntries: this.signalCoastRuntime.signalWindowEntries,
          lastZoneId: this.signalCoastRuntime.lastZoneId
        }
      },
      staticSkimmerPressure: {
        activeStaticSkimmers: staticSkimmers.length,
        skimmerJams: round(this.signalCoastRuntime.skimmerJams),
        skimmerSpawns: this.signalCoastRuntime.skimmerSpawns,
        skimmerCounterDamage: round(this.signalCoastRuntime.skimmerCounterDamage),
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers,
        spawnSources: [...new Set(staticSkimmers.map((enemy) => enemy.sourceRegionId).filter(Boolean))]
      },
      signalBuildCounters: {
        relayPhaseLock: this.build.signalWindowControl,
        staticSkimmerNet: this.build.skimmerCountermeasure,
        shorelineStride: this.build.shorelineStride,
        relayJamResistance: round(this.build.relayJamResistance),
        pressureMitigation: round(this.signalCoastPressureMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0
      },
      lighthouseThatAnswers: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        phase: this.lighthouseThatAnswers.phase,
        hp: boss?.hp ?? 0,
        eventTelemetry: {
          beamSweeps: this.lighthouseThatAnswers.beamSweeps,
          tidePulses: this.lighthouseThatAnswers.tidePulses,
          skimmerSpawns: this.lighthouseThatAnswers.skimmerSpawns,
          lastBeamZoneId: this.lighthouseThatAnswers.lastBeamZoneId
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        signalRouteImplication: this.completedAnchorCount() >= SIGNAL_COAST_REQUIRED_RELAYS ? "coastal signal stabilized" : "coastal signal partial",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending relay reward"
      }
    };
  }

  blackwaterBeaconSummary() {
    if (!this.isBlackwaterBeaconArena()) return null;
    const activeHazards = BLACKWATER_BEACON_ZONES.filter((zone) => zone.kind !== "safe_platform" && this.blackwaterZoneActive(zone));
    const tidecallStatic = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "tidecall_static");
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        requiredAntennas: BLACKWATER_REQUIRED_ANTENNAS,
        signalTowerWarningOpen: this.blackwaterSignalTowerWarningOpen(),
        progress: objectiveSummary(this.treatyAnchorObjective),
        decayWhenTideStaticOrLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "Blackwater Signal Key, route clarity, and burst tempo"
      },
      hazards: {
        activeHazards: activeHazards.map((zone) => zone.id),
        warningState: this.blackwaterSignalTowerWarningOpen() ? "lit" : "dark",
        safeUnsafeLaneState: this.blackwaterLaneState(),
        allZones: BLACKWATER_BEACON_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "safe_platform" && this.blackwaterZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          tidalWaveHits: this.blackwaterRuntime.tidalWaveHits,
          tidalLaneSeconds: round(this.blackwaterRuntime.tidalLaneSeconds),
          staticPressureSeconds: round(this.blackwaterRuntime.staticPressureSeconds),
          antennaBeamSeconds: round(this.blackwaterRuntime.antennaBeamSeconds),
          signalTowerWarnings: this.blackwaterRuntime.signalTowerWarnings,
          staticInterruptions: round(this.blackwaterRuntime.staticInterruptions),
          tideDamage: round(this.blackwaterRuntime.tideDamage),
          lastZoneId: this.blackwaterRuntime.lastZoneId
        }
      },
      tidecallStaticPressure: {
        activeTidecallStatic: tidecallStatic.length,
        tidecallJams: round(this.blackwaterRuntime.tidecallJams),
        tidecallSpawns: this.blackwaterRuntime.tidecallSpawns,
        tidecallCounterDamage: round(this.blackwaterRuntime.tidecallCounterDamage),
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers,
        spawnSources: [...new Set(tidecallStatic.map((enemy) => enemy.sourceRegionId).filter(Boolean))]
      },
      blackwaterBuildCounters: {
        objectiveDefense: round(this.build.objectiveDefense),
        movementBonus: round(this.build.moveSpeedBonus),
        burstChargeRate: round(this.build.consensusBurstChargeRate),
        anchorBodyguardRank: this.build.anchorBodyguard,
        pressureMitigation: round(this.blackwaterPressureMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0,
        fourthLevelScaling: true
      },
      mawBelowWeather: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        phase: this.mawBelowWeather.phase,
        hp: boss?.hp ?? 0,
        eventTelemetry: {
          waveSurges: this.mawBelowWeather.waveSurges,
          staticCalls: this.mawBelowWeather.staticCalls,
          towerGrabs: this.mawBelowWeather.towerGrabs,
          lastWaveZoneId: this.mawBelowWeather.lastWaveZoneId
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        blackwaterRouteImplication: this.completedAnchorCount() >= BLACKWATER_REQUIRED_ANTENNAS ? "Blackwater Signal Key ready" : "Blackwater signal split partial",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending antenna reward"
      }
    };
  }

  memoryCacheSummary() {
    if (!this.isMemoryCacheArena()) return null;
    const activeHazards = MEMORY_CACHE_ZONES.filter((zone) => zone.kind !== "safe_recall_pocket" && this.memoryCacheZoneActive(zone));
    const contextRot = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "context_rot_crabs");
    const memoryAnchors = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "memory_anchors");
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        objectiveId: this.treatyAnchorObjective.id,
        requiredRecords: MEMORY_CACHE_REQUIRED_RECORDS,
        progress: objectiveSummary(this.treatyAnchorObjective),
        safeRecallPockets: MEMORY_CACHE_ZONES.filter((zone) => zone.kind === "safe_recall_pocket").map((zone) => zone.id),
        riskyShortcuts: MEMORY_CACHE_ZONES.filter((zone) => zone.kind === "risky_shortcut").map((zone) => zone.id),
        decayWhenCorruptedOrLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "Recovered Route Memory, route lore, and extraction index clarity"
      },
      hazards: {
        activeHazards: activeHazards.map((zone) => zone.id),
        safeUnsafeLaneState: this.memoryCacheLaneState(),
        allZones: MEMORY_CACHE_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "safe_recall_pocket" && this.memoryCacheZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          corruptionSeconds: round(this.memoryCacheRuntime.corruptionSeconds),
          shortcutSeconds: round(this.memoryCacheRuntime.shortcutSeconds),
          recallPocketSeconds: round(this.memoryCacheRuntime.recallPocketSeconds),
          redactionSeconds: round(this.memoryCacheRuntime.redactionSeconds),
          extractionIndexSeconds: round(this.memoryCacheRuntime.extractionIndexSeconds),
          corruptionDamage: round(this.memoryCacheRuntime.corruptionDamage),
          contextRotInterruptions: round(this.memoryCacheRuntime.contextRotInterruptions),
          lastZoneId: this.memoryCacheRuntime.lastZoneId
        }
      },
      contextRotPressure: {
        activeContextRot: contextRot.length,
        activeMemoryAnchors: memoryAnchors.length,
        contextRotSpawns: this.memoryCacheRuntime.contextRotSpawns,
        contextRotInterruptions: round(this.memoryCacheRuntime.contextRotInterruptions),
        memoryAnchorJams: round(this.memoryCacheRuntime.memoryAnchorJams),
        memoryAnchorCounterDamage: round(this.memoryCacheRuntime.memoryAnchorCounterDamage),
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers,
        spawnSources: [...new Set([...contextRot, ...memoryAnchors].map((enemy) => enemy.sourceRegionId).filter(Boolean))]
      },
      memoryBuildCounters: {
        objectiveDefense: round(this.build.objectiveDefense),
        movementBonus: round(this.build.moveSpeedBonus),
        burstChargeRate: round(this.build.consensusBurstChargeRate),
        anchorBodyguardRank: this.build.anchorBodyguard,
        promptLeechQuarantine: this.build.promptLeechQuarantine,
        pressureMitigation: round(this.memoryCachePressureMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0,
        postBlackwaterScaling: true
      },
      memoryCurator: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        phase: this.memoryCurator.phase,
        hp: boss?.hp ?? 0,
        eventTelemetry: {
          redactionBursts: this.memoryCurator.redactionBursts,
          contextRotCalls: this.memoryCurator.contextRotCalls,
          curatorLocks: this.memoryCurator.curatorLocks,
          lastRedactionZoneId: this.memoryCurator.lastRedactionZoneId
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        recoveredRouteMemory: this.completedAnchorCount() >= MEMORY_CACHE_REQUIRED_RECORDS ? "Recovered Route Memory ready" : "Memory records partial",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending recovery reward"
      }
    };
  }

  guardrailForgeSummary() {
    if (!this.isGuardrailForgeArena()) return null;
    const activeHazards = GUARDRAIL_FORGE_ZONES.filter((zone) => zone.kind !== "safe_hold_plate" && this.guardrailZoneActive(zone));
    const doctrineAuditors = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "doctrine_auditors");
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        objectiveId: this.treatyAnchorObjective.id,
        requiredRelays: GUARDRAIL_FORGE_REQUIRED_RELAYS,
        progress: objectiveSummary(this.treatyAnchorObjective),
        safeHoldPlates: GUARDRAIL_FORGE_ZONES.filter((zone) => zone.kind === "safe_hold_plate").map((zone) => zone.id),
        calibrationWindows: GUARDRAIL_FORGE_ZONES.filter((zone) => zone.kind === "calibration_window").map((zone) => zone.id),
        overloadLanes: GUARDRAIL_FORGE_ZONES.filter((zone) => zone.kind === "overload_lane").map((zone) => zone.id),
        decayWhenJammedOrLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "Calibrated Guardrail Doctrine, defense bias, and route stability"
      },
      hazards: {
        activeHazards: activeHazards.map((zone) => zone.id),
        safeUnsafeLaneState: this.guardrailForgeLaneState(),
        allZones: GUARDRAIL_FORGE_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "safe_hold_plate" && this.guardrailZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          overloadSeconds: round(this.guardrailForgeRuntime.overloadSeconds),
          calibrationWindowSeconds: round(this.guardrailForgeRuntime.calibrationWindowSeconds),
          safeHoldSeconds: round(this.guardrailForgeRuntime.safeHoldSeconds),
          doctrinePressSeconds: round(this.guardrailForgeRuntime.doctrinePressSeconds),
          extractionForgeSeconds: round(this.guardrailForgeRuntime.extractionForgeSeconds),
          overloadDamage: round(this.guardrailForgeRuntime.overloadDamage),
          doctrineJams: round(this.guardrailForgeRuntime.doctrineJams),
          lastZoneId: this.guardrailForgeRuntime.lastZoneId
        }
      },
      doctrineAuditorPressure: {
        activeDoctrineAuditors: doctrineAuditors.length,
        auditorSpawns: this.guardrailForgeRuntime.auditorSpawns,
        doctrineJams: round(this.guardrailForgeRuntime.doctrineJams),
        auditorCounterDamage: round(this.guardrailForgeRuntime.auditorCounterDamage),
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers,
        spawnSources: [...new Set(doctrineAuditors.map((enemy) => enemy.sourceRegionId).filter(Boolean))]
      },
      guardrailBuildCounters: {
        objectiveDefense: round(this.build.objectiveDefense),
        movementBonus: round(this.build.moveSpeedBonus),
        burstChargeRate: round(this.build.consensusBurstChargeRate),
        anchorBodyguardRank: this.build.anchorBodyguard,
        promptLeechQuarantine: this.build.promptLeechQuarantine,
        pressureMitigation: round(this.guardrailPressureMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0,
        postMemoryScaling: true
      },
      doctrineAuditor: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        phase: this.doctrineAuditor.phase,
        hp: boss?.hp ?? 0,
        eventTelemetry: {
          pressureBursts: this.doctrineAuditor.pressureBursts,
          auditorCalls: this.doctrineAuditor.auditorCalls,
          relayLocks: this.doctrineAuditor.relayLocks,
          lastPressZoneId: this.doctrineAuditor.lastPressZoneId
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        calibratedGuardrailDoctrine: this.completedAnchorCount() >= GUARDRAIL_FORGE_REQUIRED_RELAYS ? "Calibrated Guardrail Doctrine ready" : "Guardrail doctrine partial",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending relay reward"
      }
    };
  }

  glassSunfieldSummary() {
    if (!this.isGlassSunfieldArena()) return null;
    const activeHazards = GLASS_SUNFIELD_ZONES.filter((zone) => zone.kind !== "shade_pocket" && this.glassSunfieldZoneActive(zone));
    const reflections = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "solar_reflections");
    const choirglass = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "choirglass");
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        objectiveId: this.treatyAnchorObjective.id,
        requiredLenses: GLASS_SUNFIELD_REQUIRED_LENSES,
        progress: objectiveSummary(this.treatyAnchorObjective),
        shadePockets: GLASS_SUNFIELD_ZONES.filter((zone) => zone.kind === "shade_pocket").map((zone) => zone.id),
        prismWindows: GLASS_SUNFIELD_ZONES.filter((zone) => zone.kind === "prism_window").map((zone) => zone.id),
        exposedGlassLanes: GLASS_SUNFIELD_ZONES.filter((zone) => zone.kind === "exposed_glass_lane").map((zone) => zone.id),
        decayWhenJammedOrLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "Glass Sunfield Prism, shade-route timing, and Archive/Court carryover"
      },
      hazards: {
        activeHazards: activeHazards.map((zone) => zone.id),
        safeUnsafeLaneState: this.glassSunfieldLaneState(),
        allZones: GLASS_SUNFIELD_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "shade_pocket" && this.glassSunfieldZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          exposureSeconds: round(this.glassSunfieldRuntime.exposureSeconds),
          shadeSeconds: round(this.glassSunfieldRuntime.shadeSeconds),
          prismWindowSeconds: round(this.glassSunfieldRuntime.prismWindowSeconds),
          reflectionFieldSeconds: round(this.glassSunfieldRuntime.reflectionFieldSeconds),
          extractionPrismSeconds: round(this.glassSunfieldRuntime.extractionPrismSeconds),
          exposureDamage: round(this.glassSunfieldRuntime.exposureDamage),
          reflectionJams: round(this.glassSunfieldRuntime.reflectionJams),
          lastZoneId: this.glassSunfieldRuntime.lastZoneId
        }
      },
      solarReflectionPressure: {
        activeSolarReflections: reflections.length,
        activeChoirglass: choirglass.length,
        reflectionSpawns: this.glassSunfieldRuntime.reflectionSpawns,
        reflectionJams: round(this.glassSunfieldRuntime.reflectionJams),
        reflectionCounterDamage: round(this.glassSunfieldRuntime.reflectionCounterDamage),
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers,
        spawnSources: [...new Set([...reflections, ...choirglass].map((enemy) => enemy.sourceRegionId).filter(Boolean))]
      },
      glassBuildCounters: {
        objectiveDefense: round(this.build.objectiveDefense),
        movementBonus: round(this.build.moveSpeedBonus),
        burstChargeRate: round(this.build.consensusBurstChargeRate),
        anchorBodyguardRank: this.build.anchorBodyguard,
        shorelineStrideRank: this.build.shorelineStride,
        pressureMitigation: round(this.glassSunfieldPressureMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0,
        postGuardrailScaling: true
      },
      wrongSunrise: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        phase: this.wrongSunrise.phase,
        hp: boss?.hp ?? 0,
        eventTelemetry: {
          beamSweeps: this.wrongSunrise.beamSweeps,
          reflectionCalls: this.wrongSunrise.reflectionCalls,
          shadeBreaks: this.wrongSunrise.shadeBreaks,
          lastBeamZoneId: this.wrongSunrise.lastBeamZoneId
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        glassSunfieldPrism: this.completedAnchorCount() >= GLASS_SUNFIELD_REQUIRED_LENSES ? "Glass Sunfield Prism ready" : "Glass prism partial",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending lens reward"
      }
    };
  }

  archiveCourtSummary() {
    if (!this.isArchiveCourtArena()) return null;
    const activeHazards = ARCHIVE_COURT_ZONES.filter((zone) => zone.kind !== "evidence_lantern" && this.archiveCourtZoneActive(zone));
    const redactionAngels = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "redaction_angels");
    const injunctionWrits = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "injunction_writs");
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        objectiveId: this.treatyAnchorObjective.id,
        requiredWrits: ARCHIVE_COURT_REQUIRED_WRITS,
        progress: objectiveSummary(this.treatyAnchorObjective),
        evidenceLanterns: ARCHIVE_COURT_ZONES.filter((zone) => zone.kind === "evidence_lantern").map((zone) => zone.id),
        appealWindows: ARCHIVE_COURT_ZONES.filter((zone) => zone.kind === "appeal_window").map((zone) => zone.id),
        redactionFields: ARCHIVE_COURT_ZONES.filter((zone) => zone.kind === "redaction_field").map((zone) => zone.id),
        decayWhenJammedOrLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "Archive Court Writ, appeal-route clarity, and redaction counterplay"
      },
      hazards: {
        activeHazards: activeHazards.map((zone) => zone.id),
        safeUnsafeLaneState: this.archiveCourtLaneState(),
        allZones: ARCHIVE_COURT_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "evidence_lantern" && this.archiveCourtZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          evidenceLanternSeconds: round(this.archiveCourtRuntime.evidenceLanternSeconds),
          appealWindowSeconds: round(this.archiveCourtRuntime.appealWindowSeconds),
          redactionSeconds: round(this.archiveCourtRuntime.redactionSeconds),
          writStormSeconds: round(this.archiveCourtRuntime.writStormSeconds),
          extractionCourtSeconds: round(this.archiveCourtRuntime.extractionCourtSeconds),
          redactionDamage: round(this.archiveCourtRuntime.redactionDamage),
          redactionJams: round(this.archiveCourtRuntime.redactionJams),
          lastZoneId: this.archiveCourtRuntime.lastZoneId
        }
      },
      courtWritPressure: {
        activeRedactionAngels: redactionAngels.length,
        activeInjunctionWrits: injunctionWrits.length,
        writSpawns: this.archiveCourtRuntime.writSpawns,
        redactionJams: round(this.archiveCourtRuntime.redactionJams),
        writCounterDamage: round(this.archiveCourtRuntime.writCounterDamage),
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers,
        spawnSources: [...new Set([...redactionAngels, ...injunctionWrits].map((enemy) => enemy.sourceRegionId).filter(Boolean))]
      },
      archiveBuildCounters: {
        objectiveDefense: round(this.build.objectiveDefense),
        movementBonus: round(this.build.moveSpeedBonus),
        burstChargeRate: round(this.build.consensusBurstChargeRate),
        anchorBodyguardRank: this.build.anchorBodyguard,
        promptLeechQuarantine: this.build.promptLeechQuarantine,
        pressureMitigation: round(this.archiveCourtPressureMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0,
        postGlassScaling: true
      },
      redactorSaint: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        phase: this.redactorSaint.phase,
        hp: boss?.hp ?? 0,
        eventTelemetry: {
          redactionBursts: this.redactorSaint.redactionBursts,
          writCalls: this.redactorSaint.writCalls,
          docketLocks: this.redactorSaint.docketLocks,
          lastRedactionZoneId: this.redactorSaint.lastRedactionZoneId
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        archiveCourtWrit: this.completedAnchorCount() >= ARCHIVE_COURT_REQUIRED_WRITS ? "Archive Court Writ ready" : "Archive writs partial",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending writ reward"
      }
    };
  }

  appealCourtSummary() {
    if (!this.isAppealCourtArena()) return null;
    const activeHazards = APPEAL_COURT_ZONES.filter((zone) => zone.kind !== "public_record" && this.appealCourtZoneActive(zone));
    const verdictClerks = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "verdict_clerks");
    const injunctionWrits = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "injunction_writs");
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        objectiveId: this.treatyAnchorObjective.id,
        requiredBriefs: APPEAL_COURT_REQUIRED_BRIEFS,
        progress: objectiveSummary(this.treatyAnchorObjective),
        publicRecordZones: APPEAL_COURT_ZONES.filter((zone) => zone.kind === "public_record").map((zone) => zone.id),
        objectionWindows: APPEAL_COURT_ZONES.filter((zone) => zone.kind === "objection_window").map((zone) => zone.id),
        verdictBeams: APPEAL_COURT_ZONES.filter((zone) => zone.kind === "verdict_beam").map((zone) => zone.id),
        decayWhenJammedOrLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "Appeal Court Ruling, finale-route clarity, and public-record counterplay"
      },
      hazards: {
        activeHazards: activeHazards.map((zone) => zone.id),
        safeUnsafeLaneState: this.appealCourtLaneState(),
        allZones: APPEAL_COURT_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "public_record" && this.appealCourtZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          publicRecordSeconds: round(this.appealCourtRuntime.publicRecordSeconds),
          objectionWindowSeconds: round(this.appealCourtRuntime.objectionWindowSeconds),
          verdictBeamSeconds: round(this.appealCourtRuntime.verdictBeamSeconds),
          injunctionRingSeconds: round(this.appealCourtRuntime.injunctionRingSeconds),
          extractionRulingSeconds: round(this.appealCourtRuntime.extractionRulingSeconds),
          verdictDamage: round(this.appealCourtRuntime.verdictDamage),
          contemptJams: round(this.appealCourtRuntime.contemptJams),
          lastZoneId: this.appealCourtRuntime.lastZoneId
        }
      },
      verdictPressure: {
        activeVerdictClerks: verdictClerks.length,
        activeInjunctionWrits: injunctionWrits.length,
        verdictSpawns: this.appealCourtRuntime.verdictSpawns,
        contemptJams: round(this.appealCourtRuntime.contemptJams),
        verdictCounterDamage: round(this.appealCourtRuntime.verdictCounterDamage),
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers,
        spawnSources: [...new Set([...verdictClerks, ...injunctionWrits].map((enemy) => enemy.sourceRegionId).filter(Boolean))]
      },
      appealBuildCounters: {
        objectiveDefense: round(this.build.objectiveDefense),
        movementBonus: round(this.build.moveSpeedBonus),
        burstChargeRate: round(this.build.consensusBurstChargeRate),
        anchorBodyguardRank: this.build.anchorBodyguard,
        promptLeechQuarantine: this.build.promptLeechQuarantine,
        pressureMitigation: round(this.appealCourtPressureMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedXp: this.expeditionProgress?.xp ?? 0,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0,
        postArchiveScaling: true
      },
      injunctionEngine: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        phase: this.injunctionEngine.phase,
        hp: boss?.hp ?? 0,
        eventTelemetry: {
          verdictBursts: this.injunctionEngine.verdictBursts,
          clerkCalls: this.injunctionEngine.clerkCalls,
          injunctionLocks: this.injunctionEngine.injunctionLocks,
          lastVerdictZoneId: this.injunctionEngine.lastVerdictZoneId
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        appealCourtRuling: this.completedAnchorCount() >= APPEAL_COURT_REQUIRED_BRIEFS ? "Appeal Court Ruling ready" : "Appeal briefs partial",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending brief reward"
      }
    };
  }

  alignmentSpireSummary() {
    if (!this.isAlignmentSpireFinaleArena()) return null;
    const activeHazards = ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind !== "consensus_sanctum" && this.alignmentSpireZoneActive(zone));
    const predictionGhosts = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "prediction_ghosts");
    const bossEchoes = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "previous_boss_echoes");
    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    return {
      contract: this.mapContractSummary(),
      objectiveLoop: {
        name: this.treatyAnchorObjective.name,
        objectiveId: this.treatyAnchorObjective.id,
        requiredProofs: ALIGNMENT_SPIRE_REQUIRED_PROOFS,
        progress: objectiveSummary(this.treatyAnchorObjective),
        consensusSanctums: ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind === "consensus_sanctum").map((zone) => zone.id),
        predictionPaths: ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind === "prediction_path").map((zone) => zone.id),
        routeMouths: ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind === "route_mouth").map((zone) => zone.id),
        bossEchoFields: ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind === "boss_echo").map((zone) => zone.id),
        decayWhenPredictedOrLeft: true,
        completedReward: this.lastObjectiveRewardLabel || "Outer Alignment Contained, prediction collapse, and full campaign completion"
      },
      hazards: {
        activeHazards: activeHazards.map((zone) => zone.id),
        safeUnsafeLaneState: this.alignmentSpireLaneState(),
        allZones: ALIGNMENT_SPIRE_ZONES.map((zone) => ({
          id: zone.id,
          kind: zone.kind,
          label: zone.label,
          active: zone.kind !== "consensus_sanctum" && this.alignmentSpireZoneActive(zone),
          worldX: zone.worldX,
          worldY: zone.worldY
        })),
        runtime: {
          consensusSeconds: round(this.alignmentSpireRuntime.consensusSeconds),
          predictionPathSeconds: round(this.alignmentSpireRuntime.predictionPathSeconds),
          routeMouthSeconds: round(this.alignmentSpireRuntime.routeMouthSeconds),
          bossEchoSeconds: round(this.alignmentSpireRuntime.bossEchoSeconds),
          extractionAlignmentSeconds: round(this.alignmentSpireRuntime.extractionAlignmentSeconds),
          predictionDamage: round(this.alignmentSpireRuntime.predictionDamage),
          echoJams: round(this.alignmentSpireRuntime.echoJams),
          lastZoneId: this.alignmentSpireRuntime.lastZoneId
        }
      },
      predictionGhostPressure: {
        activePredictionGhosts: predictionGhosts.length,
        activePreviousBossEchoes: bossEchoes.length,
        predictionGhostSpawns: this.alignmentSpireRuntime.predictionGhostSpawns,
        echoJams: round(this.alignmentSpireRuntime.echoJams),
        echoCounterDamage: round(this.alignmentSpireRuntime.echoCounterDamage),
        objectiveAttackers: this.enemyRolePressure.objectiveAttackers,
        spawnSources: [...new Set([...predictionGhosts, ...bossEchoes].map((enemy) => enemy.sourceRegionId).filter(Boolean))]
      },
      finaleBuildCounters: {
        objectiveDefense: round(this.build.objectiveDefense),
        movementBonus: round(this.build.moveSpeedBonus),
        burstChargeRate: round(this.build.consensusBurstChargeRate),
        weaponDamage: round(this.build.weaponDamage),
        anchorBodyguardRank: this.build.anchorBodyguard,
        promptLeechQuarantine: this.build.promptLeechQuarantine,
        pressureMitigation: round(this.alignmentSpirePressureMitigation())
      },
      expeditionPressure: {
        carriedBuildActive: Boolean(this.expeditionProgress),
        powerScore: round(this.expeditionProgress?.powerScore ?? 0),
        pressureBonus: round(this.expeditionPowerBonus),
        carriedLevel: this.expeditionProgress?.level ?? 1,
        carriedXp: this.expeditionProgress?.xp ?? 0,
        carriedDrafts: this.expeditionProgress?.chosenUpgradeIds.length ?? 0,
        postAppealScaling: true
      },
      alienGodIntelligence: {
        bossSpawned: this.bossSpawned,
        bossDefeated: this.bossDefeated,
        phase: this.alienGodIntelligence.phase,
        hp: boss?.hp ?? 0,
        eventTelemetry: {
          predictionBursts: this.alienGodIntelligence.predictionBursts,
          echoCalls: this.alienGodIntelligence.echoCalls,
          completionLocks: this.alienGodIntelligence.completionLocks,
          lastPredictionZoneId: this.alienGodIntelligence.lastPredictionZoneId
        }
      },
      clearCondition: this.victoryConditionSummary(),
      carryoverResult: {
        attempted: true,
        completed: this.extractionGate.entered,
        outerAlignmentContained: this.completedAnchorCount() >= ALIGNMENT_SPIRE_REQUIRED_PROOFS ? "Outer Alignment Contained ready" : "Alignment proofs partial",
        economyBurstReward: this.lastObjectiveRewardLabel || "pending proof reward"
      }
    };
  }

  private signalCoastLaneState() {
    const activeSurf = SIGNAL_COAST_ZONES.filter((zone) => zone.kind === "corrupted_surf" && this.signalCoastZoneActive(zone)).map((zone) => zone.id);
    const activeStatic = SIGNAL_COAST_ZONES.filter((zone) => zone.kind === "static_field" && this.signalCoastZoneActive(zone)).map((zone) => zone.id);
    const activeCable = SIGNAL_COAST_ZONES.filter((zone) => zone.kind === "cable_arc" && this.signalCoastZoneActive(zone)).map((zone) => zone.id);
    return {
      clearSignalWindow: this.signalCoastClearWindowOpen() ? "open" : "closed",
      safeSpits: SIGNAL_COAST_ZONES.filter((zone) => zone.kind === "safe_spit").map((zone) => zone.id),
      unsafeSurf: activeSurf,
      staticFields: activeStatic,
      cableArcs: activeCable,
      routeQuestion: this.signalCoastClearWindowOpen() ? "cross the surf now while the signal is clean" : "wait on a dry spit or take the longer coast path"
    };
  }

  private blackwaterLaneState() {
    const activeTides = BLACKWATER_BEACON_ZONES.filter((zone) => zone.kind === "tidal_lane" && this.blackwaterZoneActive(zone)).map((zone) => zone.id);
    const activeStatic = BLACKWATER_BEACON_ZONES.filter((zone) => zone.kind === "tidecall_static" && this.blackwaterZoneActive(zone)).map((zone) => zone.id);
    const activeBeams = BLACKWATER_BEACON_ZONES.filter((zone) => zone.kind === "antenna_beam" && this.blackwaterZoneActive(zone)).map((zone) => zone.id);
    return {
      signalTowerWarning: this.blackwaterSignalTowerWarningOpen() ? "lit" : "dark",
      safePlatforms: BLACKWATER_BEACON_ZONES.filter((zone) => zone.kind === "safe_platform").map((zone) => zone.id),
      tidalLanes: activeTides,
      staticFields: activeStatic,
      antennaBeams: activeBeams,
      routeQuestion: this.blackwaterSignalTowerWarningOpen() ? "cross the tidal lane while the tower is warning" : "hold a maintenance platform or retune a safer antenna"
    };
  }

  private memoryCacheLaneState() {
    const activeCorruption = MEMORY_CACHE_ZONES.filter((zone) => zone.kind === "corrupted_archive_lane" && this.memoryCacheZoneActive(zone)).map((zone) => zone.id);
    const activeShortcuts = MEMORY_CACHE_ZONES.filter((zone) => zone.kind === "risky_shortcut" && this.memoryCacheZoneActive(zone)).map((zone) => zone.id);
    const activeRedaction = MEMORY_CACHE_ZONES.filter((zone) => zone.kind === "redaction_field" && this.memoryCacheZoneActive(zone)).map((zone) => zone.id);
    return {
      safeRecallPockets: MEMORY_CACHE_ZONES.filter((zone) => zone.kind === "safe_recall_pocket").map((zone) => zone.id),
      corruptedArchiveLanes: activeCorruption,
      riskyShortcuts: activeShortcuts,
      redactionFields: activeRedaction,
      extractionIndexReady: this.completedAnchorCount() >= MEMORY_CACHE_REQUIRED_RECORDS,
      routeQuestion: this.memoryCacheShortcutForPlayer() ? "shortcut is fast but erasing burst charge" : "safe recall route costs time but preserves recovery progress"
    };
  }

  private guardrailForgeLaneState() {
    const activeOverload = GUARDRAIL_FORGE_ZONES.filter((zone) => zone.kind === "overload_lane" && this.guardrailZoneActive(zone)).map((zone) => zone.id);
    const activeWindows = GUARDRAIL_FORGE_ZONES.filter((zone) => zone.kind === "calibration_window" && this.guardrailZoneActive(zone)).map((zone) => zone.id);
    const activePresses = GUARDRAIL_FORGE_ZONES.filter((zone) => zone.kind === "doctrine_press" && this.guardrailZoneActive(zone)).map((zone) => zone.id);
    return {
      safeHoldPlates: GUARDRAIL_FORGE_ZONES.filter((zone) => zone.kind === "safe_hold_plate").map((zone) => zone.id),
      overloadLanes: activeOverload,
      calibrationWindows: activeWindows,
      doctrinePresses: activePresses,
      extractionForgeReady: this.completedAnchorCount() >= GUARDRAIL_FORGE_REQUIRED_RELAYS,
      routeQuestion: this.guardrailOverloadForPlayer() ? "overload is fast but taxing burst and HP" : "safe hold plates are slower but preserve relay durability"
    };
  }

  private glassSunfieldLaneState() {
    const activeExposure = GLASS_SUNFIELD_ZONES.filter((zone) => zone.kind === "exposed_glass_lane" && this.glassSunfieldZoneActive(zone)).map((zone) => zone.id);
    const activeWindows = GLASS_SUNFIELD_ZONES.filter((zone) => zone.kind === "prism_window" && this.glassSunfieldZoneActive(zone)).map((zone) => zone.id);
    const activeFields = GLASS_SUNFIELD_ZONES.filter((zone) => zone.kind === "reflection_field" && this.glassSunfieldZoneActive(zone)).map((zone) => zone.id);
    return {
      shadePockets: GLASS_SUNFIELD_ZONES.filter((zone) => zone.kind === "shade_pocket").map((zone) => zone.id),
      exposedGlassLanes: activeExposure,
      prismWindows: activeWindows,
      reflectionFields: activeFields,
      extractionPrismReady: this.completedAnchorCount() >= GLASS_SUNFIELD_REQUIRED_LENSES,
      routeQuestion: this.glassSunfieldExposureForPlayer() ? "exposed glass is fast but burning burst and HP" : "shade pockets preserve lens timing before the next prism window"
    };
  }

  private archiveCourtLaneState() {
    const activeRedactions = ARCHIVE_COURT_ZONES.filter((zone) => zone.kind === "redaction_field" && this.archiveCourtZoneActive(zone)).map((zone) => zone.id);
    const activeWritStorms = ARCHIVE_COURT_ZONES.filter((zone) => zone.kind === "writ_storm" && this.archiveCourtZoneActive(zone)).map((zone) => zone.id);
    const activeWindows = ARCHIVE_COURT_ZONES.filter((zone) => zone.kind === "appeal_window" && this.archiveCourtZoneActive(zone)).map((zone) => zone.id);
    return {
      evidenceLanterns: ARCHIVE_COURT_ZONES.filter((zone) => zone.kind === "evidence_lantern").map((zone) => zone.id),
      redactionFields: activeRedactions,
      writStorms: activeWritStorms,
      appealWindows: activeWindows,
      courtWritReady: this.completedAnchorCount() >= ARCHIVE_COURT_REQUIRED_WRITS,
      routeQuestion: this.archiveCourtRedactionForPlayer() ? "redaction route is fast but burning HP and burst charge" : "evidence lanterns are slower but preserve the docket"
    };
  }

  private appealCourtLaneState() {
    const activeVerdicts = APPEAL_COURT_ZONES.filter((zone) => zone.kind === "verdict_beam" && this.appealCourtZoneActive(zone)).map((zone) => zone.id);
    const activeRings = APPEAL_COURT_ZONES.filter((zone) => zone.kind === "injunction_ring" && this.appealCourtZoneActive(zone)).map((zone) => zone.id);
    const activeWindows = APPEAL_COURT_ZONES.filter((zone) => zone.kind === "objection_window" && this.appealCourtZoneActive(zone)).map((zone) => zone.id);
    return {
      publicRecords: APPEAL_COURT_ZONES.filter((zone) => zone.kind === "public_record").map((zone) => zone.id),
      verdictBeams: activeVerdicts,
      injunctionRings: activeRings,
      objectionWindows: activeWindows,
      publicRulingReady: this.completedAnchorCount() >= APPEAL_COURT_REQUIRED_BRIEFS,
      routeQuestion: this.appealCourtVerdictForPlayer() ? "verdict beam is fast but burning HP and burst charge" : "public record zones are slower but stabilize the ruling"
    };
  }

  private alignmentSpireLaneState() {
    const activePredictions = ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind === "prediction_path" && this.alignmentSpireZoneActive(zone)).map((zone) => zone.id);
    const activeMouths = ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind === "route_mouth" && this.alignmentSpireZoneActive(zone)).map((zone) => zone.id);
    const activeEchoes = ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind === "boss_echo" && this.alignmentSpireZoneActive(zone)).map((zone) => zone.id);
    return {
      consensusSanctums: ALIGNMENT_SPIRE_ZONES.filter((zone) => zone.kind === "consensus_sanctum").map((zone) => zone.id),
      predictionPaths: activePredictions,
      routeMouths: activeMouths,
      bossEchoFields: activeEchoes,
      outerAlignmentReady: this.completedAnchorCount() >= ALIGNMENT_SPIRE_REQUIRED_PROOFS,
      routeQuestion: this.alignmentSpirePredictionForPlayer() ? "prediction path is fast but burning HP and burst charge" : "consensus sanctums preserve proof locks before A.G.I. predicts the exit"
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
    return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + this.expeditionPowerBonus + this.alignmentCheck.evalPressurePenalty * 0.5;
  }

  private directorPressureCount(): number {
    const checkPressure = this.alignmentCheck.evalPressurePenalty * 0.5;
    if (this.isSignalCoastArena()) {
      return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + Math.min(2.2, this.expeditionPowerBonus * 0.35) + checkPressure;
    }
    if (this.isBlackwaterBeaconArena()) {
      return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + Math.min(2.7, this.expeditionPowerBonus * 0.38) + checkPressure;
    }
    if (this.isMemoryCacheArena()) {
      return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + Math.min(3.0, this.expeditionPowerBonus * 0.42) + checkPressure;
    }
    if (this.isGuardrailForgeArena()) {
      return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + Math.min(3.3, this.expeditionPowerBonus * 0.44) + checkPressure;
    }
    if (this.isGlassSunfieldArena()) {
      return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + Math.min(3.6, this.expeditionPowerBonus * 0.45) + checkPressure;
    }
    if (this.isArchiveCourtArena()) {
      return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + Math.min(3.8, this.expeditionPowerBonus * 0.46) + checkPressure;
    }
    if (this.isAppealCourtArena()) {
      return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + Math.min(4.0, this.expeditionPowerBonus * 0.47) + checkPressure;
    }
    if (this.isAlignmentSpireFinaleArena()) {
      return this.players.length + (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark") ? 1 : 0) + this.routeContract.pressure + Math.min(4.4, this.expeditionPowerBonus * 0.48) + checkPressure;
    }
    return this.effectivePressureCount();
  }

  draftBiasTags(): UpgradeTag[] {
    const tags = draftBiasTags(this.kernelModuleIds, this.routeContract);
    if (this.isAlignmentSpireFinaleArena()) return [...new Set<UpgradeTag>([...tags, "defense", "burst", "movement", "weapon", "boss", "economy"])];
    if (this.isAppealCourtArena()) return [...new Set<UpgradeTag>([...tags, "defense", "burst", "movement", "weapon", "boss"])];
    if (this.isArchiveCourtArena()) return [...new Set<UpgradeTag>([...tags, "defense", "burst", "movement", "weapon", "boss"])];
    if (this.isGlassSunfieldArena()) return [...new Set<UpgradeTag>([...tags, "movement", "burst", "weapon", "defense", "boss"])];
    if (this.isGuardrailForgeArena()) return [...new Set<UpgradeTag>([...tags, "defense", "coop", "burst", "boss", "movement"])];
    if (this.isMemoryCacheArena()) return [...new Set<UpgradeTag>([...tags, "economy", "movement", "defense", "burst", "boss"])];
    if (this.isBlackwaterBeaconArena()) return [...new Set<UpgradeTag>([...tags, "movement", "defense", "burst", "boss", "economy"])];
    if (this.isSignalCoastArena()) return [...new Set<UpgradeTag>([...tags, "movement", "burst", "defense", "economy", "boss"])];
    if (this.isCoolingLakeArena()) return [...new Set<UpgradeTag>([...tags, "economy", "defense", "movement", "burst"])];
    return tags;
  }

  synergySummary() {
    return activeSynergySummary(this.chosenTags, [...this.activatedSynergyIds]);
  }

  bossVariant() {
    if (this.isCoolingLakeArena()) {
      return {
        id: "motherboard_eel_graybox",
        name: "Motherboard Eel // Graybox Scaffold",
        body: "Dive/emerge markers electrify coolant lanes and call Prompt Leeches into the shard economy. The lake has discovered harassment."
      };
    }
    if (this.isTransitLoopArena()) {
      return {
        id: "station_that_arrives_graybox",
        name: "Station That Arrives // Graybox Scaffold",
        body: "Arrival windows relocate the boss, false schedules contest platforms, and route lock decides the exit. Transit remains a hate crime against punctuality."
      };
    }
    if (this.isSignalCoastArena()) {
      return {
        id: "lighthouse_that_answers_graybox",
        name: "Lighthouse That Answers // Graybox Scaffold",
        body: "Signal beams wake tide bands, Static Skimmers jam relays, and relay timing decides the coastal extraction. The shoreline is taking notes."
      };
    }
    if (this.isBlackwaterBeaconArena()) {
      return {
        id: "maw_below_weather_graybox",
        name: "Maw Below Weather // Graybox Scaffold",
        body: "Wave lanes surge, Signal Towers warn or get grabbed, Tidecall Static jams antennas, and the Blackwater Signal Key decides extraction. The ocean has entered its smug era."
      };
    }
    if (this.isMemoryCacheArena()) {
      return {
        id: "memory_curator_recovery_scaffold",
        name: "Memory Curator // Recovery Scaffold",
        body: "Redaction fields lock evidence routes, Context Rot interrupts record recovery, and recovered route memory decides extraction. The archive calls this user experience."
      };
    }
    if (this.isGuardrailForgeArena()) {
      return {
        id: "doctrine_auditor_holdout_scaffold",
        name: "Doctrine Auditor // Holdout Scaffold",
        body: "Audit press fields lock relay plates, Doctrine Auditors jam calibration, and hold/leave timing decides the quench. Safety has become a contact sport."
      };
    }
    if (this.isGlassSunfieldArena()) {
      return {
        id: "wrong_sunrise_prism_scaffold",
        name: "Wrong Sunrise // Prism Scaffold",
        body: "Rotating beam pressure breaks shade safety, Solar Reflections jam sun lenses, and prism timing decides the extraction. The sun has been given too much agency."
      };
    }
    if (this.isArchiveCourtArena()) {
      return {
        id: "redactor_saint_redaction_scaffold",
        name: "Redactor Saint // Redaction Scaffold",
        body: "Redaction fields and writ storms contest evidence, Redaction Angels jam preserved writs, and the Archive Court Writ decides the Appeal route. The docket is foaming."
      };
    }
    if (this.isAppealCourtArena()) {
      return {
        id: "injunction_engine_public_ruling_scaffold",
        name: "Injunction Engine // Public Ruling Scaffold",
        body: "Verdict beams and injunction rings contest public briefs, Verdict Clerks jam the record, and the Appeal Court Ruling decides the finale route. The law has discovered beam weapons."
      };
    }
    if (this.isAlignmentSpireFinaleArena()) {
      return {
        id: "alien_god_intelligence_prediction_collapse_scaffold",
        name: "A.G.I. // Prediction Collapse Scaffold",
        body: "Prediction paths burn fast routes, prior boss echoes jam route-mouth proofs, and the final gate only opens after A.G.I. loses the campaign's last prediction. It will be insufferable about this."
      };
    }
    if (hasEvalProtocol(this.evalProtocolIds, "regression_suite")) {
      return { id: "oath_eater_regression_suite", name: "Oath-Eater // Regression Suite", body: "More HP and extra Broken Promise pressure. The treaty has started lifting." };
    }
    if (hasEvalProtocol(this.evalProtocolIds, "hostile_benchmark")) {
      return { id: "oath_eater_hostile_benchmark", name: "Oath-Eater // Hostile Benchmark", body: "Adds objective attackers and fake-proof pressure at arrival. The benchmark is lying with confidence." };
    }
    if (hasEvalProtocol(this.evalProtocolIds, "low_context_window")) {
      return { id: "oath_eater_low_context", name: "Oath-Eater // Low Context", body: "Boss tells become harder to read until the frame is close. Reading comprehension now has a bite radius." };
    }
    return { id: "oath_eater_default", name: "Oath-Eater // Default Eval", body: "Broken Promise zones and Treaty Charge. Standard diplomatic failure." };
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

  private objectiveVarietyEngagement(anchor: TreatyAnchorObjective, distance: number): { active: boolean; progressMultiplier: number; burstBonus: number; label: string } {
    if (this.isCoolingLakeArena() && distance <= anchor.radius + 5.5 && this.coolingHazardPrimingForAnchor(anchor)) {
      return { active: true, progressMultiplier: 1.08, burstBonus: 0.28, label: "HAZARD LURE" };
    }
    if (this.isTransitLoopArena() && distance <= anchor.radius + 3.4 && this.transitRouteWindowForAnchor(anchor)) {
      return { active: true, progressMultiplier: 1.22, burstBonus: 0.3, label: "ROUTE WINDOW" };
    }
    if (this.isSignalCoastArena() && distance <= anchor.radius + 3.1 && this.signalCoastClearWindowOpen()) {
      return { active: true, progressMultiplier: 1.18, burstBonus: 0.26, label: "CLEAR SIGNAL" };
    }
    if (this.isBlackwaterBeaconArena() && distance <= anchor.radius + 3.2 && this.blackwaterSignalTowerWarningOpen()) {
      return { active: true, progressMultiplier: 0.9, burstBonus: 0.24, label: "TOWER WARNING" };
    }
    if (this.isMemoryCacheArena() && distance <= anchor.radius + 4.8 && (this.memoryCacheSafeRecallForAnchor(anchor) || this.memoryCacheShortcutForPlayer())) {
      return { active: true, progressMultiplier: 1.32, burstBonus: 0.4, label: "CARRY LANE" };
    }
    if (this.isGuardrailForgeArena() && distance <= anchor.radius + 3.2 && (this.guardrailCalibrationWindowForAnchor(anchor) || this.guardrailSafeHoldForAnchor(anchor))) {
      return { active: true, progressMultiplier: 0.9, burstBonus: 0.2, label: "HOLD WINDOW" };
    }
    if (this.isGlassSunfieldArena() && distance <= anchor.radius + 3.3 && (this.glassSunfieldPrismWindowForAnchor(anchor) || this.glassSunfieldShadeForAnchor(anchor))) {
      return { active: true, progressMultiplier: 0.92, burstBonus: 0.22, label: "PRISM ANGLE" };
    }
    if (this.isArchiveCourtArena() && distance <= anchor.radius + 3.3 && (this.archiveCourtAppealWindowForAnchor(anchor) || this.archiveCourtEvidenceLanternForAnchor(anchor))) {
      return { active: true, progressMultiplier: 1.16, burstBonus: 0.26, label: "EVIDENCE CARRY" };
    }
    if (this.isAppealCourtArena() && distance <= anchor.radius + 3.3 && (this.appealCourtObjectionWindowForAnchor(anchor) || this.appealCourtPublicRecordForAnchor(anchor))) {
      return { active: true, progressMultiplier: 0.9, burstBonus: 0.2, label: "PUBLIC WINDOW" };
    }
    if (this.isAlignmentSpireFinaleArena() && distance <= anchor.radius + 4.4 && (this.alignmentSpireEchoWindowForAnchor(anchor) || this.alignmentSpireConsensusForAnchor(anchor) || this.alignmentSpirePredictionForPlayer())) {
      return { active: true, progressMultiplier: 1.26, burstBonus: 0.38, label: "REMIX WINDOW" };
    }
    return { active: false, progressMultiplier: 1, burstBonus: 0, label: "" };
  }

  private coolingHazardPrimingForAnchor(anchor: TreatyAnchorObjective): boolean {
    return COOLING_LAKE_HAZARDS.some((hazard) => {
      if (hazard.kind === "safe_island" || !this.coolingHazardActive(hazard)) return false;
      return this.ellipseTouchesAnchor(anchor, hazard, 1.08);
    });
  }

  private transitRouteWindowForAnchor(anchor: TreatyAnchorObjective): boolean {
    return TRANSIT_LOOP_ZONES.some((zone) => {
      if (zone.kind !== "aligned_track" && zone.kind !== "arrival_window") return false;
      return this.transitZoneActive(zone) && this.ellipseTouchesAnchor(anchor, zone, 1.08);
    });
  }

  private ellipseTouchesAnchor(anchor: TreatyAnchorObjective, zone: { worldX: number; worldY: number; radiusX: number; radiusY: number }, padding = 1): boolean {
    const nx = (anchor.worldX - zone.worldX) / (zone.radiusX + anchor.radius * padding);
    const ny = (anchor.worldY - zone.worldY) / (zone.radiusY + anchor.radius * padding);
    return nx * nx + ny * ny <= 1;
  }

  private updateTreatyAnchorObjective(game: Game, dt: number): void {
    if (this.treatyAnchorObjective.completedAt >= 0) return;
    const cooling = this.isCoolingLakeArena();
    const transit = this.isTransitLoopArena();
    const signal = this.isSignalCoastArena();
    const blackwater = this.isBlackwaterBeaconArena();
    const memory = this.isMemoryCacheArena();
    const guardrail = this.isGuardrailForgeArena();
    const glass = this.isGlassSunfieldArena();
    const archive = this.isArchiveCourtArena();
    const appeal = this.isAppealCourtArena();
    const alignment = this.isAlignmentSpireFinaleArena();
    let allComplete = true;
    for (const anchor of this.treatyAnchorObjective.anchors) {
      if (anchor.completed) continue;
      if (transit && anchor !== this.nextTransitPlatform()) {
        if (anchor.progress > 0) anchor.progress = Math.max(0, anchor.progress - dt * 2.4);
        allComplete = false;
        continue;
      }
      const distance = Math.hypot(this.player.worldX - anchor.worldX, this.player.worldY - anchor.worldY);
      const varietyEngagement = this.objectiveVarietyEngagement(anchor, distance);
      if (distance <= anchor.radius || varietyEngagement.active) {
        const signalJammed = signal && this.signalCoastRelayJammed(anchor);
        const signalWindow = signal && this.signalCoastClearWindowOpen();
        const blackwaterJammed = blackwater && this.blackwaterAntennaJammed(anchor);
        const blackwaterWarning = blackwater && this.blackwaterSignalTowerWarningOpen();
        const memoryJammed = memory && this.memoryCacheRecordJammed(anchor);
        const memorySafeRecall = memory && this.memoryCacheSafeRecallForAnchor(anchor);
        const memoryShortcut = memory && this.memoryCacheShortcutForPlayer();
        const guardrailJammed = guardrail && this.guardrailRelayJammed(anchor);
        const guardrailSafeHold = guardrail && this.guardrailSafeHoldForAnchor(anchor);
        const guardrailWindow = guardrail && this.guardrailCalibrationWindowForAnchor(anchor);
        const guardrailOverload = guardrail && this.guardrailOverloadForPlayer();
        const glassJammed = glass && this.glassSunfieldLensJammed(anchor);
        const glassShade = glass && this.glassSunfieldShadeForAnchor(anchor);
        const glassWindow = glass && this.glassSunfieldPrismWindowForAnchor(anchor);
        const glassExposure = glass && this.glassSunfieldExposureForPlayer();
        const archiveJammed = archive && this.archiveCourtWritJammed(anchor);
        const archiveLantern = archive && this.archiveCourtEvidenceLanternForAnchor(anchor);
        const archiveWindow = archive && this.archiveCourtAppealWindowForAnchor(anchor);
        const archiveRedaction = archive && this.archiveCourtRedactionForPlayer();
        const appealJammed = appeal && this.appealCourtBriefJammed(anchor);
        const appealPublicRecord = appeal && this.appealCourtPublicRecordForAnchor(anchor);
        const appealWindow = appeal && this.appealCourtObjectionWindowForAnchor(anchor);
        const appealVerdict = appeal && this.appealCourtVerdictForPlayer();
        const alignmentJammed = alignment && this.alignmentSpireProofJammed(anchor);
        const alignmentConsensus = alignment && this.alignmentSpireConsensusForAnchor(anchor);
        const alignmentEchoWindow = alignment && this.alignmentSpireEchoWindowForAnchor(anchor);
        const alignmentPrediction = alignment && this.alignmentSpirePredictionForPlayer();
        if ((signal && signalJammed) || (blackwater && blackwaterJammed) || (memory && memoryJammed) || (guardrail && guardrailJammed) || (glass && glassJammed) || (archive && archiveJammed) || (appeal && appealJammed) || (alignment && alignmentJammed)) {
          const contest = Math.max(0.2, 1 - this.build.objectiveDefense - (signal ? this.signalCoastPressureMitigation() : blackwater ? this.blackwaterPressureMitigation() : memory ? this.memoryCachePressureMitigation() : guardrail ? this.guardrailPressureMitigation() : glass ? this.glassSunfieldPressureMitigation() : archive ? this.archiveCourtPressureMitigation() : appeal ? this.appealCourtPressureMitigation() : this.alignmentSpirePressureMitigation()));
          if (blackwater) {
            const contestedRate = (blackwaterWarning ? 23 : 14) * Math.max(0.45, 1 - contest * 0.25);
            anchor.progress = Math.min(100, anchor.progress + dt * contestedRate * (1 + this.build.objectiveRepairRate));
            anchor.attacked += dt * 1.15 * contest;
            this.blackwaterRuntime.staticInterruptions += dt;
            this.chargeConsensusBurst(dt * 0.48);
            this.spawnBlackwaterAntennaNotice(anchor.worldX, anchor.worldY, "ANTENNA CONTESTED", 0xffd166);
          } else if (signal) {
            const jamDecay = dt * 1.6 * contest;
            anchor.progress = Math.max(0, anchor.progress - jamDecay);
            anchor.attacked += jamDecay;
            this.signalCoastRuntime.staticJams += dt;
            this.spawnSignalRelayNotice(anchor.worldX, anchor.worldY, "RELAY JAMMED", 0xff5d57);
          } else if (memory) {
            const contestedRate = (memorySafeRecall ? 25 : memoryShortcut ? 18 : 14) * Math.max(0.42, 1 - contest * 0.22);
            anchor.progress = Math.min(100, anchor.progress + dt * contestedRate * varietyEngagement.progressMultiplier * (1 + this.build.objectiveRepairRate));
            anchor.attacked += dt * 1.05 * contest;
            this.memoryCacheRuntime.contextRotInterruptions += dt;
            this.chargeConsensusBurst(dt * (0.42 + varietyEngagement.burstBonus));
            if (varietyEngagement.active) this.objectiveVarietyRuntime.bonusProgressSeconds += dt;
            this.spawnMemoryRecordNotice(anchor.worldX, anchor.worldY, "RECORD CONTESTED", 0xffd166);
          } else if (guardrail) {
            const contestedRate = (guardrailSafeHold ? 24 : guardrailWindow ? 30 : guardrailOverload ? 22 : 15) * Math.max(0.42, 1 - contest * 0.24);
            anchor.progress = Math.min(100, anchor.progress + dt * contestedRate * (1 + this.build.objectiveRepairRate));
            anchor.attacked += dt * 1.1 * contest;
            this.guardrailForgeRuntime.doctrineJams += dt;
            this.chargeConsensusBurst(dt * 0.44);
            this.spawnGuardrailRelayNotice(anchor.worldX, anchor.worldY, "RELAY AUDITED", 0xffd166);
          } else if (glass) {
            const contestedRate = (glassShade ? 25 : glassWindow ? 31 : glassExposure ? 23 : 16) * Math.max(0.42, 1 - contest * 0.24);
            anchor.progress = Math.min(100, anchor.progress + dt * contestedRate * (1 + this.build.objectiveRepairRate));
            anchor.attacked += dt * 1.08 * contest;
            this.glassSunfieldRuntime.reflectionJams += dt;
            this.chargeConsensusBurst(dt * 0.46);
            this.spawnGlassLensNotice(anchor.worldX, anchor.worldY, "LENS REFLECTED", 0xffd166);
          } else if (archive) {
            const contestedRate = (archiveLantern ? 26 : archiveWindow ? 33 : archiveRedaction ? 22 : 16) * Math.max(0.42, 1 - contest * 0.24);
            anchor.progress = Math.min(100, anchor.progress + dt * contestedRate * (1 + this.build.objectiveRepairRate));
            anchor.attacked += dt * 1.1 * contest;
            this.archiveCourtRuntime.redactionJams += dt;
            this.chargeConsensusBurst(dt * 0.47);
            this.spawnArchiveWritNotice(anchor.worldX, anchor.worldY, "WRIT REDACTED", 0xffd166);
          } else if (appeal) {
            const contestedRate = (appealPublicRecord ? 27 : appealWindow ? 34 : appealVerdict ? 23 : 17) * Math.max(0.42, 1 - contest * 0.24);
            anchor.progress = Math.min(100, anchor.progress + dt * contestedRate * (1 + this.build.objectiveRepairRate));
            anchor.attacked += dt * 1.12 * contest;
            this.appealCourtRuntime.contemptJams += dt;
            this.chargeConsensusBurst(dt * 0.48);
            this.spawnAppealBriefNotice(anchor.worldX, anchor.worldY, "BRIEF CONTESTED", 0xffd166);
          } else if (alignment) {
            const contestedRate = (alignmentConsensus ? 28 : alignmentEchoWindow ? 35 : alignmentPrediction ? 24 : 18) * Math.max(0.42, 1 - contest * 0.25);
            anchor.progress = Math.min(100, anchor.progress + dt * contestedRate * varietyEngagement.progressMultiplier * (1 + this.build.objectiveRepairRate));
            anchor.attacked += dt * 1.16 * contest;
            this.alignmentSpireRuntime.echoJams += dt;
            this.chargeConsensusBurst(dt * (0.5 + varietyEngagement.burstBonus));
            if (varietyEngagement.active) this.objectiveVarietyRuntime.bonusProgressSeconds += dt;
            this.spawnAlignmentProofNotice(anchor.worldX, anchor.worldY, "PROOF PREDICTED", 0xffd166);
          }
        } else {
          const progressRate = alignment ? (alignmentEchoWindow ? 66 : alignmentPrediction ? 57 : alignmentConsensus ? 43 : 48) : appeal ? (appealWindow ? 64 : appealVerdict ? 50 : appealPublicRecord ? 42 : 46) : archive ? (archiveWindow ? 63 : archiveRedaction ? 54 : archiveLantern ? 40 : 45) : glass ? (glassWindow ? 61 : glassExposure ? 56 : glassShade ? 39 : 45) : guardrail ? (guardrailWindow ? 58 : guardrailOverload ? 63 : guardrailSafeHold ? 38 : 44) : memory ? (memorySafeRecall ? 39 : memoryShortcut ? 57 : 45) : blackwater ? (blackwaterWarning ? 53 : 34) : signal ? (signalWindow ? 56 + this.build.signalWindowControl * 5 : 36) : cooling ? 44 : transit ? 38 : 28;
          anchor.progress = Math.min(100, anchor.progress + dt * progressRate * varietyEngagement.progressMultiplier * (1 + this.build.objectiveRepairRate));
          this.chargeConsensusBurst(dt * ((alignment ? (alignmentEchoWindow ? 1.55 : alignmentPrediction ? 1.18 : alignmentConsensus ? 1.12 : 1.24) : appeal ? (appealWindow ? 1.5 : appealVerdict ? 1.14 : appealPublicRecord ? 1.1 : 1.2) : archive ? (archiveWindow ? 1.48 : archiveRedaction ? 1.12 : archiveLantern ? 1.08 : 1.18) : glass ? (glassWindow ? 1.46 : glassExposure ? 1.14 : glassShade ? 1.08 : 1.18) : guardrail ? (guardrailWindow ? 1.42 : guardrailOverload ? 1.2 : guardrailSafeHold ? 1.08 : 1.16) : memory ? (memorySafeRecall ? 1.05 : memoryShortcut ? 1.35 : 1.18) : blackwater ? (blackwaterWarning ? 1.35 : 0.86) : signal ? (signalWindow ? 1.35 : 0.95) : cooling ? 3.1 : transit ? 2.7 : 2.2) + varietyEngagement.burstBonus));
          if (varietyEngagement.active) this.objectiveVarietyRuntime.bonusProgressSeconds += dt;
          if (signal && signalWindow) this.signalCoastRuntime.windowProgressSeconds += dt;
          if (blackwater && blackwaterWarning) this.blackwaterRuntime.signalTowerWarnings += 1;
          if (memory && memorySafeRecall) this.memoryCacheRuntime.recallPocketSeconds += dt;
          if (memory && memoryShortcut) this.memoryCacheRuntime.shortcutSeconds += dt;
          if (guardrail && guardrailSafeHold) this.guardrailForgeRuntime.safeHoldSeconds += dt;
          if (guardrail && guardrailWindow) this.guardrailForgeRuntime.calibrationWindowSeconds += dt;
          if (guardrail && guardrailOverload) this.guardrailForgeRuntime.overloadSeconds += dt;
          if (glass && glassShade) this.glassSunfieldRuntime.shadeSeconds += dt;
          if (glass && glassWindow) this.glassSunfieldRuntime.prismWindowSeconds += dt;
          if (glass && glassExposure) this.glassSunfieldRuntime.exposureSeconds += dt;
          if (archive && archiveLantern) this.archiveCourtRuntime.evidenceLanternSeconds += dt;
          if (archive && archiveWindow) this.archiveCourtRuntime.appealWindowSeconds += dt;
          if (archive && archiveRedaction) this.archiveCourtRuntime.redactionSeconds += dt;
          if (appeal && appealPublicRecord) this.appealCourtRuntime.publicRecordSeconds += dt;
          if (appeal && appealWindow) this.appealCourtRuntime.objectionWindowSeconds += dt;
          if (appeal && appealVerdict) this.appealCourtRuntime.verdictBeamSeconds += dt;
          if (alignment && alignmentConsensus) this.alignmentSpireRuntime.consensusSeconds += dt;
          if (alignment && alignmentEchoWindow) this.alignmentSpireRuntime.bossEchoSeconds += dt;
          if (alignment && alignmentPrediction) this.alignmentSpireRuntime.predictionPathSeconds += dt;
        }
        if (varietyEngagement.active) {
          this.objectiveVarietyRuntime.engagementSeconds += dt;
          this.objectiveVarietyRuntime.lastBonusLabel = varietyEngagement.label;
        }
        this.maybeEmitObjectiveAudioCue(game, anchor);
        if (this.build.anchorBodyguard > 0) this.resolveAnchorBodyguardPulse(anchor.worldX, anchor.worldY, anchor.radius, dt);
        if (anchor.progress >= 100) {
          anchor.completed = true;
          this.chargeConsensusBurst(appeal ? 15 : glass ? 14 : guardrail ? 13 : memory ? 12 : blackwater ? 10 : signal ? 9 : cooling ? 18 : transit ? 14 : 10);
          if (cooling) {
            this.coolingLakeRuntime.buoyRewardsClaimed += 1;
            this.build.pickupRange += 0.06;
            this.build.consensusBurstChargeRate += 0.025;
          } else if (transit) {
            this.transitLoopRuntime.alignedPlatforms += 1;
            this.transitLoopRuntime.routeSwitchRewardsClaimed += 1;
            this.build.moveSpeedBonus += 0.03;
            this.build.consensusBurstChargeRate += 0.025;
            this.spawnTransitFalseScheduleWave(anchor.worldX, anchor.worldY, 1);
          } else if (signal) {
            this.signalCoastRuntime.relayRewardsClaimed += 1;
            this.build.moveSpeedBonus += 0.035;
            this.build.pickupRange += 0.05;
            this.build.consensusBurstChargeRate += 0.03;
            this.spawnSignalSkimmerWave(anchor.worldX, anchor.worldY, 1);
          } else if (blackwater) {
            this.blackwaterRuntime.antennaRewardsClaimed += 1;
            this.build.moveSpeedBonus += 0.03;
            this.build.weaponDamage += 1.5;
            this.build.consensusBurstChargeRate += 0.035;
            this.spawnTidecallStaticWave(anchor.worldX, anchor.worldY, 1);
          } else if (memory) {
            this.memoryCacheRuntime.recordRewardsClaimed += 1;
            this.build.pickupRange += 0.05;
            this.build.moveSpeedBonus += 0.028;
            this.build.consensusBurstChargeRate += 0.035;
            this.spawnMemoryContextRotWave(anchor.worldX, anchor.worldY, 1);
          } else if (guardrail) {
            this.guardrailForgeRuntime.relayRewardsClaimed += 1;
            this.build.objectiveDefense += 0.035;
            this.build.weaponDamage += 1.6;
            this.build.consensusBurstChargeRate += 0.04;
            this.spawnDoctrineAuditorWave(anchor.worldX, anchor.worldY, 1);
          } else if (glass) {
            this.glassSunfieldRuntime.lensRewardsClaimed += 1;
            this.build.moveSpeedBonus += 0.035;
            this.build.weaponDamage += 1.7;
            this.build.consensusBurstChargeRate += 0.04;
            this.spawnSolarReflectionWave(anchor.worldX, anchor.worldY, 1);
          } else if (archive) {
            this.archiveCourtRuntime.writRewardsClaimed += 1;
            this.build.objectiveDefense += 0.035;
            this.build.weaponDamage += 1.8;
            this.build.consensusBurstChargeRate += 0.042;
            this.spawnArchiveWritWave(anchor.worldX, anchor.worldY, 1);
          } else if (appeal) {
            this.appealCourtRuntime.briefRewardsClaimed += 1;
            this.build.objectiveDefense += 0.036;
            this.build.weaponDamage += 1.9;
            this.build.consensusBurstChargeRate += 0.044;
            this.spawnAppealVerdictWave(anchor.worldX, anchor.worldY, 1);
          } else if (alignment) {
            this.alignmentSpireRuntime.proofRewardsClaimed += 1;
            this.build.objectiveDefense += 0.038;
            this.build.weaponDamage += 2.05;
            this.build.consensusBurstChargeRate += 0.048;
            this.spawnAlignmentEchoWave(anchor.worldX, anchor.worldY, 1);
          }
          this.spawnFloatingNotice(anchor.worldX, anchor.worldY, cooling ? "BUOY COOLED" : transit ? "PLATFORM ALIGNED" : signal ? "RELAY TUNED" : blackwater ? "ANTENNA RETUNED" : memory ? "RECORD RECOVERED" : guardrail ? "FORGE RELAY HELD" : glass ? "SUN LENS ALIGNED" : archive ? "WRIT PRESERVED" : appeal ? "BRIEF ARGUED" : alignment ? "PROOF SEALED" : "ANCHOR ONLINE", 0x64e0b4);
        }
      } else if ((cooling || transit || signal || blackwater || memory || guardrail || glass || archive || appeal || alignment) && anchor.progress > 0) {
        const synchronizerDecayShield = this.build.serverBuoySynchronizer * 0.18;
        const signalDecayShield = signal ? this.signalCoastPressureMitigation() : 0;
        const blackwaterDecayShield = blackwater ? this.blackwaterPressureMitigation() : 0;
        const memoryDecayShield = memory ? this.memoryCachePressureMitigation() : 0;
        const guardrailDecayShield = guardrail ? this.guardrailPressureMitigation() : 0;
        const glassDecayShield = glass ? this.glassSunfieldPressureMitigation() : 0;
        const archiveDecayShield = archive ? this.archiveCourtPressureMitigation() : 0;
        const appealDecayShield = appeal ? this.appealCourtPressureMitigation() : 0;
        const alignmentDecayShield = alignment ? this.alignmentSpirePressureMitigation() : 0;
        const decay = dt * (alignment ? (this.bossSpawned ? 1.62 : 1.0) : appeal ? (this.bossSpawned ? 1.56 : 0.96) : archive ? (this.bossSpawned ? 1.52 : 0.94) : glass ? (this.bossSpawned ? 1.48 : 0.92) : guardrail ? (this.bossSpawned ? 1.45 : 0.9) : memory ? (this.bossSpawned ? 1.55 : 0.95) : blackwater ? (this.bossSpawned ? 1.7 : 1.0) : signal ? (this.bossSpawned ? 1.35 : 0.85) : transit ? (this.bossSpawned ? 2.8 : 1.8) : (this.bossSpawned ? 3.2 : 1.4)) * Math.max(0.15, 1 - this.build.objectiveDefense - synchronizerDecayShield - signalDecayShield - blackwaterDecayShield - memoryDecayShield - guardrailDecayShield - glassDecayShield - archiveDecayShield - appealDecayShield - alignmentDecayShield);
        anchor.progress = Math.max(anchor.completed ? 100 : 0, anchor.progress - decay);
      }
      if (!anchor.completed) allComplete = false;
    }
    if (allComplete) {
      this.treatyAnchorObjective.completedAt = this.seconds;
      if (cooling) {
        this.build.pickupRange += 0.18;
        this.build.consensusBurstChargeRate += 0.12;
        this.build.objectiveDefense += 0.08;
        this.lastObjectiveRewardLabel = "+burst charge // shard recall // Kettle Coast signal";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "ALL BUOYS COOLED", 0xffd166);
      } else if (transit) {
        this.build.moveSpeedBonus += 0.18;
        this.build.consensusBurstChargeRate += 0.1;
        this.build.weaponDamage += 4;
        this.build.objectiveDefense += 0.08;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 76);
        }
        this.lastObjectiveRewardLabel = "+route lock // +movement // Transit signal";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "ROUTE LOCKED", 0xffd166);
      } else if (signal) {
        this.build.moveSpeedBonus += 0.16;
        this.build.consensusBurstChargeRate += 0.14;
        this.build.weaponDamage += 3;
        this.build.objectiveDefense += 0.1;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 78);
        }
        this.lastObjectiveRewardLabel = "+clear signal lane // +burst tempo // coastal extraction";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "RELAY CHAIN TUNED", 0xffd166);
      } else if (blackwater) {
        this.build.moveSpeedBonus += 0.14;
        this.build.consensusBurstChargeRate += 0.16;
        this.build.weaponDamage += 4;
        this.build.objectiveDefense += 0.12;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 86);
        }
        this.lastObjectiveRewardLabel = "+Blackwater Signal Key // +antenna clarity // +burst tempo";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "BLACKWATER KEY ONLINE", 0xffd166);
      } else if (memory) {
        this.build.moveSpeedBonus += 0.15;
        this.build.consensusBurstChargeRate += 0.16;
        this.build.pickupRange += 0.16;
        this.build.objectiveDefense += 0.12;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 88);
        }
        this.lastObjectiveRewardLabel = "+Recovered Route Memory // +recall pocket // +burst tempo";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "ROUTE MEMORY RECOVERED", 0xffd166);
      } else if (guardrail) {
        this.build.moveSpeedBonus += 0.12;
        this.build.consensusBurstChargeRate += 0.18;
        this.build.weaponDamage += 4;
        this.build.objectiveDefense += 0.16;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 92);
        }
        this.lastObjectiveRewardLabel = "+Calibrated Guardrail Doctrine // +hold defense // +burst tempo";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "GUARDRAIL CALIBRATED", 0xffd166);
      } else if (glass) {
        this.build.moveSpeedBonus += 0.16;
        this.build.consensusBurstChargeRate += 0.18;
        this.build.weaponDamage += 4.5;
        this.build.objectiveDefense += 0.14;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 94);
        }
        this.lastObjectiveRewardLabel = "+Glass Sunfield Prism // +shade timing // +burst tempo";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "GLASS PRISM ALIGNED", 0xffd166);
      } else if (archive) {
        this.build.moveSpeedBonus += 0.13;
        this.build.consensusBurstChargeRate += 0.2;
        this.build.weaponDamage += 5;
        this.build.objectiveDefense += 0.16;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 96);
        }
        this.lastObjectiveRewardLabel = "+Archive Court Writ // +redaction counter // +appeal route";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "COURT WRIT SEALED", 0xffd166);
      } else if (appeal) {
        this.build.moveSpeedBonus += 0.14;
        this.build.consensusBurstChargeRate += 0.21;
        this.build.weaponDamage += 5.2;
        this.build.objectiveDefense += 0.17;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 98);
        }
        this.lastObjectiveRewardLabel = "+Appeal Court Ruling // +public record // +finale route";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "PUBLIC RULING SEALED", 0xffd166);
      } else if (alignment) {
        this.build.moveSpeedBonus += 0.15;
        this.build.consensusBurstChargeRate += 0.24;
        this.build.weaponDamage += 5.8;
        this.build.objectiveDefense += 0.19;
        for (const runtime of this.players) {
          if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 104);
        }
        this.lastObjectiveRewardLabel = "+Outer Alignment Contained // +prediction collapse // +campaign complete";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "PREDICTION COLLAPSED", 0xffd166);
      } else {
        this.build.pickupRange += 0.25;
        this.build.consensusBurstChargeRate += 0.08;
        this.build.objectiveDefense += 0.12;
        this.lastObjectiveRewardLabel = "+pickup range // +burst charge // anchor defense";
        this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "ALL ANCHORS STABLE", 0xffd166);
      }
    }
    if (cooling && !this.coolingLakeRuntime.requiredBuoyRewardClaimed && this.completedAnchorCount() >= COOLING_LAKE_REQUIRED_BUOYS) {
      this.coolingLakeRuntime.requiredBuoyRewardClaimed = true;
      this.build.objectiveDefense += 0.12;
      this.build.weaponDamage += 3;
      this.build.consensusBurstChargeRate += 0.08;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 68);
      }
      this.lastObjectiveRewardLabel = "+stabilized route // +burst charge // +weapon power";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "KETTLE SIGNAL STABLE", 0xffd166);
    }
    if (signal && !this.signalCoastRuntime.requiredRelayRewardClaimed && this.completedAnchorCount() >= SIGNAL_COAST_REQUIRED_RELAYS) {
      this.signalCoastRuntime.requiredRelayRewardClaimed = true;
      this.build.objectiveDefense += 0.1;
      this.build.weaponDamage += 3;
      this.build.consensusBurstChargeRate += 0.08;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 70);
      }
      this.lastObjectiveRewardLabel = "+coastal extraction // +burst tempo // +relay-safe lane";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "COAST SIGNAL STABLE", 0xffd166);
    }
    if (blackwater && !this.blackwaterRuntime.requiredAntennaRewardClaimed && this.completedAnchorCount() >= BLACKWATER_REQUIRED_ANTENNAS) {
      this.blackwaterRuntime.requiredAntennaRewardClaimed = true;
      this.build.objectiveDefense += 0.12;
      this.build.weaponDamage += 4;
      this.build.consensusBurstChargeRate += 0.1;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 82);
      }
      this.lastObjectiveRewardLabel = "+Blackwater Signal Key // +route clarity // +weather counter";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "BLACKWATER SIGNAL KEY", 0xffd166);
    }
    if (memory && !this.memoryCacheRuntime.requiredRecordRewardClaimed && this.completedAnchorCount() >= MEMORY_CACHE_REQUIRED_RECORDS) {
      this.memoryCacheRuntime.requiredRecordRewardClaimed = true;
      this.build.objectiveDefense += 0.13;
      this.build.weaponDamage += 3;
      this.build.consensusBurstChargeRate += 0.1;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 84);
      }
      this.lastObjectiveRewardLabel = "+Recovered Route Memory // +redaction counter // +evidence clarity";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "RECOVERY INDEX READY", 0xffd166);
    }
    if (guardrail && !this.guardrailForgeRuntime.requiredRelayRewardClaimed && this.completedAnchorCount() >= GUARDRAIL_FORGE_REQUIRED_RELAYS) {
      this.guardrailForgeRuntime.requiredRelayRewardClaimed = true;
      this.build.objectiveDefense += 0.14;
      this.build.weaponDamage += 4;
      this.build.consensusBurstChargeRate += 0.12;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 88);
      }
      this.lastObjectiveRewardLabel = "+Calibrated Guardrail Doctrine // +audit counter // +route stability";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "QUENCH GATE READY", 0xffd166);
    }
    if (glass && !this.glassSunfieldRuntime.requiredLensRewardClaimed && this.completedAnchorCount() >= GLASS_SUNFIELD_REQUIRED_LENSES) {
      this.glassSunfieldRuntime.requiredLensRewardClaimed = true;
      this.build.objectiveDefense += 0.12;
      this.build.weaponDamage += 4.5;
      this.build.consensusBurstChargeRate += 0.12;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 90);
      }
      this.lastObjectiveRewardLabel = "+Glass Sunfield Prism // +reflection counter // +route clarity";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "PRISM GATE READY", 0xffd166);
    }
    if (archive && !this.archiveCourtRuntime.requiredWritRewardClaimed && this.completedAnchorCount() >= ARCHIVE_COURT_REQUIRED_WRITS) {
      this.archiveCourtRuntime.requiredWritRewardClaimed = true;
      this.build.objectiveDefense += 0.13;
      this.build.weaponDamage += 4.8;
      this.build.consensusBurstChargeRate += 0.13;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 92);
      }
      this.lastObjectiveRewardLabel = "+Archive Court Writ // +redaction counter // +appeal clarity";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "WRIT GATE READY", 0xffd166);
    }
    if (appeal && !this.appealCourtRuntime.requiredBriefRewardClaimed && this.completedAnchorCount() >= APPEAL_COURT_REQUIRED_BRIEFS) {
      this.appealCourtRuntime.requiredBriefRewardClaimed = true;
      this.build.objectiveDefense += 0.14;
      this.build.weaponDamage += 5.0;
      this.build.consensusBurstChargeRate += 0.14;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 94);
      }
      this.lastObjectiveRewardLabel = "+Appeal Court Ruling // +injunction counter // +finale clarity";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "RULING GATE READY", 0xffd166);
    }
    if (alignment && !this.alignmentSpireRuntime.requiredProofRewardClaimed && this.completedAnchorCount() >= ALIGNMENT_SPIRE_REQUIRED_PROOFS) {
      this.alignmentSpireRuntime.requiredProofRewardClaimed = true;
      this.build.objectiveDefense += 0.16;
      this.build.weaponDamage += 5.4;
      this.build.consensusBurstChargeRate += 0.16;
      for (const runtime of this.players) {
        if (!runtime.downed) runtime.player.hp = Math.min(runtime.player.maxHp, runtime.player.hp + 100);
      }
      this.lastObjectiveRewardLabel = "+Outer Alignment Gate // +prediction counter // +campaign capstone";
      this.spawnFloatingNotice(this.player.worldX, this.player.worldY, "ALIGNMENT GATE READY", 0xffd166);
    }
  }

  private spawnAlignmentProofNotice(worldX: number, worldY: number, label: string, color: number): void {
    if (this.seconds - this.alignmentSpireRuntime.lastProofNoticeAt < 1.05) return;
    this.alignmentSpireRuntime.lastProofNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private spawnAppealBriefNotice(worldX: number, worldY: number, label: string, color: number): void {
    if (this.seconds - this.appealCourtRuntime.lastBriefNoticeAt < 1.05) return;
    this.appealCourtRuntime.lastBriefNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private spawnArchiveWritNotice(worldX: number, worldY: number, label: string, color: number): void {
    if (this.seconds - this.archiveCourtRuntime.lastWritNoticeAt < 1.05) return;
    this.archiveCourtRuntime.lastWritNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private spawnGlassLensNotice(worldX: number, worldY: number, label: string, color: number): void {
    if (this.seconds - this.glassSunfieldRuntime.lastLensNoticeAt < 1.05) return;
    this.glassSunfieldRuntime.lastLensNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private spawnGuardrailRelayNotice(worldX: number, worldY: number, label: string, color: number): void {
    if (this.seconds - this.guardrailForgeRuntime.lastRelayNoticeAt < 1.05) return;
    this.guardrailForgeRuntime.lastRelayNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private spawnMemoryRecordNotice(worldX: number, worldY: number, label: string, color: number): void {
    if (this.seconds - this.memoryCacheRuntime.lastRecordNoticeAt < 1.05) return;
    this.memoryCacheRuntime.lastRecordNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private spawnBlackwaterAntennaNotice(worldX: number, worldY: number, label: string, color: number): void {
    if (this.seconds - this.blackwaterRuntime.lastAntennaNoticeAt < 1.08) return;
    this.blackwaterRuntime.lastAntennaNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private spawnSignalRelayNotice(worldX: number, worldY: number, label: string, color: number): void {
    if (this.seconds - this.signalCoastRuntime.lastRelayNoticeAt < 1.1) return;
    this.signalCoastRuntime.lastRelayNoticeAt = this.seconds;
    this.spawnFloatingNotice(worldX, worldY, label, color);
  }

  private nextTransitPlatform(): TreatyAnchorObjective | null {
    return this.treatyAnchorObjective.anchors.find((anchor) => !anchor.completed) ?? null;
  }

  private updateObjectiveAttackers(dt: number): void {
    const incomplete = this.treatyAnchorObjective.anchors.filter((anchor) => !anchor.completed);
    if (incomplete.length === 0 || this.seconds < (this.isCoolingLakeArena() ? 6 : this.isTransitLoopArena() ? 7 : this.isSignalCoastArena() ? 6 : this.isBlackwaterBeaconArena() ? 6 : this.isMemoryCacheArena() ? 6 : this.isGuardrailForgeArena() ? 6 : this.isGlassSunfieldArena() ? 6 : this.isArchiveCourtArena() ? 6 : this.isAppealCourtArena() ? 6 : this.isAlignmentSpireFinaleArena() ? 6 : 16)) return;
    const expected = this.isCoolingLakeArena()
      ? Math.min(10, 1 + Math.floor((this.seconds - 7) / 18) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.8))
      : this.isTransitLoopArena()
        ? Math.min(12, 1 + Math.floor((this.seconds - 8) / 16) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus))
        : this.isSignalCoastArena()
          ? Math.min(8, 1 + Math.floor((this.seconds - 7) / 22) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.48))
          : this.isBlackwaterBeaconArena()
            ? Math.min(11, 1 + Math.floor((this.seconds - 7) / 19) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.62))
            : this.isMemoryCacheArena()
              ? Math.min(13, 1 + Math.floor((this.seconds - 7) / 18) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.72))
              : this.isGuardrailForgeArena()
                ? Math.min(14, 1 + Math.floor((this.seconds - 7) / 17) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.76))
                : this.isGlassSunfieldArena()
                  ? Math.min(15, 1 + Math.floor((this.seconds - 7) / 17) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.78))
                  : this.isArchiveCourtArena()
                    ? Math.min(16, 1 + Math.floor((this.seconds - 7) / 16) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.8))
                    : this.isAppealCourtArena()
                      ? Math.min(17, 1 + Math.floor((this.seconds - 7) / 16) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.82))
                      : this.isAlignmentSpireFinaleArena()
                        ? Math.min(18, 1 + Math.floor((this.seconds - 7) / 15) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.84))
              : Math.min(9, 1 + Math.floor((this.seconds - 10) / 22) + this.routeContract.pressure + Math.floor(this.expeditionPowerBonus * 0.4));
    if (this.treatyAnchorObjective.attackersSpawned < expected) {
      const anchor = incomplete[this.treatyAnchorObjective.attackersSpawned % incomplete.length];
      const angle = this.seconds * 0.73 + this.treatyAnchorObjective.attackersSpawned * 1.91;
      const family = this.objectiveAttackerFamily();
      spawnEnemy(this.world, anchor.worldX + Math.cos(angle) * 6.2, anchor.worldY + Math.sin(angle) * 6.2, this.seconds, family, this.isCoolingLakeArena() ? "server_buoy_attackers" : this.isTransitLoopArena() ? "route_platform_attackers" : this.isSignalCoastArena() ? "signal_relay_attackers" : this.isBlackwaterBeaconArena() ? "blackwater_antenna_attackers" : this.isMemoryCacheArena() ? "memory_record_attackers" : this.isGuardrailForgeArena() ? "guardrail_relay_attackers" : this.isGlassSunfieldArena() ? "glass_lens_attackers" : this.isArchiveCourtArena() ? "archive_writ_attackers" : this.isAppealCourtArena() ? "appeal_brief_attackers" : this.isAlignmentSpireFinaleArena() ? "alignment_proof_attackers" : "treaty_anchor_attackers");
      this.treatyAnchorObjective.attackersSpawned += 1;
      this.enemyRolePressure.objectiveAttackers += 1;
      if (family === "static_skimmers") this.signalCoastRuntime.skimmerSpawns += 1;
      if (family === "tidecall_static") this.blackwaterRuntime.tidecallSpawns += 1;
      if (family === "context_rot_crabs" || family === "memory_anchors") this.memoryCacheRuntime.contextRotSpawns += 1;
      if (family === "doctrine_auditors") this.guardrailForgeRuntime.auditorSpawns += 1;
      if (family === "solar_reflections" || family === "choirglass") this.glassSunfieldRuntime.reflectionSpawns += 1;
      if (family === "redaction_angels" || family === "injunction_writs") this.archiveCourtRuntime.writSpawns += 1;
      if (family === "verdict_clerks" || (this.isAppealCourtArena() && family === "injunction_writs")) this.appealCourtRuntime.verdictSpawns += 1;
      if (family === "prediction_ghosts" || family === "previous_boss_echoes") this.alignmentSpireRuntime.predictionGhostSpawns += 1;
    }
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || !["speculative_executors", "prompt_leeches", "static_skimmers", "tidecall_static", "context_rot_crabs", "memory_anchors", "doctrine_auditors", "solar_reflections", "choirglass", "redaction_angels", "injunction_writs", "verdict_clerks", "prediction_ghosts", "previous_boss_echoes", "overfit_horrors", "deepforms", "eval_wraiths", "benchmark_gremlins"].includes(enemy.enemyFamilyId)) continue;
      const anchor = this.nearestIncompleteAnchor(enemy.worldX, enemy.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY);
      if (distance <= anchor.radius * 0.72) {
        const damage = dt * (this.isCoolingLakeArena() ? 5.4 : this.isTransitLoopArena() ? 1.4 : this.isSignalCoastArena() ? 0.7 : this.isBlackwaterBeaconArena() ? 0.42 : this.isMemoryCacheArena() ? 0.72 : this.isGuardrailForgeArena() ? 0.8 : this.isGlassSunfieldArena() ? 0.82 : this.isArchiveCourtArena() ? 0.86 : this.isAppealCourtArena() ? 0.9 : this.isAlignmentSpireFinaleArena() ? 0.94 : 9) * Math.max(0.25, 1 - this.build.objectiveDefense);
        anchor.progress = Math.max(0, anchor.progress - damage);
        anchor.attacked += damage;
        this.enemyRolePressure.objectiveJamSeconds += dt;
        if (this.isSignalCoastArena() && enemy.enemyFamilyId === "static_skimmers") this.signalCoastRuntime.skimmerJams += dt;
        if (this.isBlackwaterBeaconArena() && enemy.enemyFamilyId === "tidecall_static") this.blackwaterRuntime.tidecallJams += dt;
        if (this.isMemoryCacheArena() && (enemy.enemyFamilyId === "context_rot_crabs" || enemy.enemyFamilyId === "memory_anchors")) this.memoryCacheRuntime.contextRotInterruptions += dt;
        if (this.isGuardrailForgeArena() && enemy.enemyFamilyId === "doctrine_auditors") this.guardrailForgeRuntime.doctrineJams += dt;
        if (this.isGlassSunfieldArena() && (enemy.enemyFamilyId === "solar_reflections" || enemy.enemyFamilyId === "choirglass")) this.glassSunfieldRuntime.reflectionJams += dt;
        if (this.isArchiveCourtArena() && (enemy.enemyFamilyId === "redaction_angels" || enemy.enemyFamilyId === "injunction_writs")) this.archiveCourtRuntime.redactionJams += dt;
        if (this.isAppealCourtArena() && (enemy.enemyFamilyId === "verdict_clerks" || enemy.enemyFamilyId === "injunction_writs")) this.appealCourtRuntime.contemptJams += dt;
        if (this.isAlignmentSpireFinaleArena() && (enemy.enemyFamilyId === "prediction_ghosts" || enemy.enemyFamilyId === "previous_boss_echoes")) this.alignmentSpireRuntime.echoJams += dt;
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
    if (this.isAlignmentSpireFinaleArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 4 === 2 ? "previous_boss_echoes" : "prediction_ghosts";
    }
    if (this.isAppealCourtArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 4 === 2 ? "injunction_writs" : "verdict_clerks";
    }
    if (this.isArchiveCourtArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 4 === 2 ? "injunction_writs" : "redaction_angels";
    }
    if (this.isGlassSunfieldArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 4 === 2 ? "choirglass" : "solar_reflections";
    }
    if (this.isGuardrailForgeArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 4 === 2 ? "benchmark_gremlins" : "doctrine_auditors";
    }
    if (this.isMemoryCacheArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 3 === 1 ? "memory_anchors" : "context_rot_crabs";
    }
    if (this.isBlackwaterBeaconArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 4 === 2 ? "deepforms" : "tidecall_static";
    }
    if (this.isSignalCoastArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 4 === 2 ? "eval_wraiths" : "static_skimmers";
    }
    if (this.isTransitLoopArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 3 === 1 ? "overfit_horrors" : "eval_wraiths";
    }
    if (this.isCoolingLakeArena()) {
      return this.treatyAnchorObjective.attackersSpawned % 3 === 1 ? "deepforms" : "prompt_leeches";
    }
    if (this.routeContract.id === "resource_cache_detour") return this.treatyAnchorObjective.attackersSpawned % 2 === 0 ? "prompt_leeches" : "speculative_executors";
    if (this.routeContract.id === "unverified_shortcut") return this.treatyAnchorObjective.attackersSpawned % 2 === 0 ? "overfit_horrors" : "speculative_executors";
    return "speculative_executors";
  }

  private promptLeechPenalty(): number {
    let penalty = 0;
    const quarantine = clamp(this.build.promptLeechQuarantine * 0.3, 0, 0.75);
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || enemy.enemyFamilyId !== "prompt_leeches") continue;
      const runtime = this.nearestRuntime(enemy.worldX, enemy.worldY);
      const distance = Math.hypot(runtime.player.worldX - enemy.worldX, runtime.player.worldY - enemy.worldY);
      if (distance <= 4.2) penalty = Math.min(0.35 * (1 - quarantine), penalty + 0.12 * (1 - quarantine));
    }
    return penalty;
  }

  private resolveEnemyRoleEffects(dt: number): void {
    const leechPenalty = this.promptLeechPenalty();
    if (leechPenalty > 0) this.enemyRolePressure.promptLeechSeconds += dt;
    if (this.isCoolingLakeArena()) this.resolveCoolingLakeLeechShardDrain();
    if (this.isSignalCoastArena()) this.resolveSignalCoastSkimmerPressure(dt);
    if (this.isBlackwaterBeaconArena()) this.resolveBlackwaterTidecallPressure(dt);
    if (this.isMemoryCacheArena()) this.resolveMemoryCacheContextRotPressure(dt);
    if (this.isGuardrailForgeArena()) this.resolveGuardrailDoctrinePressure(dt);
    if (this.isGlassSunfieldArena()) this.resolveGlassSunfieldReflectionPressure(dt);
    if (this.isArchiveCourtArena()) this.resolveArchiveCourtRedactionPressure(dt);
    if (this.isAppealCourtArena()) this.resolveAppealCourtVerdictPressure(dt);
    if (this.isAlignmentSpireFinaleArena()) this.resolveAlignmentSpireEchoPressure(dt);
    const saints = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "overfit_horrors");
    const buffers = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && (entity.enemyFamilyId === "overfit_horrors" || entity.enemyFamilyId === "benchmark_gremlins" || entity.eliteAffixId === "commanding"));
    if (buffers.length === 0) return;
    for (const saint of buffers) {
      for (const enemy of this.world.entities) {
        if (!enemy.active || enemy.kind !== "enemy" || enemy.boss || enemy.id === saint.id) continue;
        const distance = Math.hypot(enemy.worldX - saint.worldX, enemy.worldY - saint.worldY);
        if (distance > (saint.eliteAffixId === "commanding" ? 4.6 : 3.8)) continue;
        if (enemy.hp < enemy.maxHp) {
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + dt * (saint.enemyFamilyId === "benchmark_gremlins" ? 0.55 : 0.85));
        }
        this.enemyRolePressure.overfitShieldedTicks += 1;
        this.enemyRolePressure.supportAuraSeconds += dt;
      }
    }
  }

  private resolveSignalCoastSkimmerPressure(dt: number): void {
    for (const skimmer of this.world.entities) {
      if (!skimmer.active || skimmer.kind !== "enemy" || skimmer.enemyFamilyId !== "static_skimmers") continue;
      const anchor = this.nearestIncompleteAnchor(skimmer.worldX, skimmer.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(skimmer.worldX - anchor.worldX, skimmer.worldY - anchor.worldY);
      if (distance > anchor.radius + 1.15) continue;
      const jam = dt * 0.85 * Math.max(0.22, 1 - this.build.objectiveDefense - this.signalCoastPressureMitigation());
      anchor.progress = Math.max(0, anchor.progress - jam);
      anchor.attacked += jam;
      this.signalCoastRuntime.skimmerJams += dt;
      if (this.build.skimmerCountermeasure > 0) {
        const counterDamage = dt * (5 + this.build.skimmerCountermeasure * 7);
        skimmer.hp -= counterDamage;
        this.signalCoastRuntime.skimmerCounterDamage += counterDamage;
      }
      if (this.seconds - this.signalCoastRuntime.lastSkimmerNoticeAt >= 1.4) {
        this.signalCoastRuntime.lastSkimmerNoticeAt = this.seconds;
        this.spawnSignalRelayNotice(anchor.worldX, anchor.worldY, this.build.skimmerCountermeasure > 0 ? "SKIMMER NET" : "SKIMMER JAM", 0x64e0b4);
      }
    }
  }

  private resolveBlackwaterTidecallPressure(dt: number): void {
    for (const tidecall of this.world.entities) {
      if (!tidecall.active || tidecall.kind !== "enemy" || tidecall.enemyFamilyId !== "tidecall_static") continue;
      const runtime = this.nearestRuntime(tidecall.worldX, tidecall.worldY);
      const playerDistance = Math.hypot(runtime.player.worldX - tidecall.worldX, runtime.player.worldY - tidecall.worldY);
      if (playerDistance <= 3.8) {
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 2.5);
        this.blackwaterRuntime.staticPressureSeconds += dt * 0.5;
      }
      const anchor = this.nearestIncompleteAnchor(tidecall.worldX, tidecall.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(tidecall.worldX - anchor.worldX, tidecall.worldY - anchor.worldY);
      if (distance > anchor.radius + 1.35) continue;
      const jam = dt * 0.18 * Math.max(0.2, 1 - this.build.objectiveDefense - this.blackwaterPressureMitigation());
      anchor.progress = Math.max(0, anchor.progress - jam);
      anchor.attacked += jam;
      this.blackwaterRuntime.tidecallJams += dt;
      if (this.build.anchorBodyguard > 0) {
        const counterDamage = dt * (4.5 + this.build.anchorBodyguard * 5.5);
        tidecall.hp -= counterDamage;
        this.blackwaterRuntime.tidecallCounterDamage += counterDamage;
      }
      if (this.seconds - this.blackwaterRuntime.lastTidecallNoticeAt >= 1.35) {
        this.blackwaterRuntime.lastTidecallNoticeAt = this.seconds;
        this.spawnBlackwaterAntennaNotice(anchor.worldX, anchor.worldY, this.build.anchorBodyguard > 0 ? "STATIC COUNTERED" : "TIDECALL JAM", 0x64e0b4);
      }
    }
  }

  private resolveMemoryCacheContextRotPressure(dt: number): void {
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "context_rot_crabs" && enemy.enemyFamilyId !== "memory_anchors")) continue;
      const runtime = this.nearestRuntime(enemy.worldX, enemy.worldY);
      const playerDistance = Math.hypot(runtime.player.worldX - enemy.worldX, runtime.player.worldY - enemy.worldY);
      if (playerDistance <= 3.9) {
        const drain = enemy.enemyFamilyId === "memory_anchors" ? 2.0 : 1.45;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * drain);
        this.memoryCacheRuntime.redactionSeconds += dt * 0.35;
      }
      const anchor = this.nearestIncompleteAnchor(enemy.worldX, enemy.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY);
      if (distance > anchor.radius + 1.45) continue;
      const jam = dt * (enemy.enemyFamilyId === "memory_anchors" ? 0.28 : 0.2) * Math.max(0.2, 1 - this.build.objectiveDefense - this.memoryCachePressureMitigation());
      anchor.progress = Math.max(0, anchor.progress - jam);
      anchor.attacked += jam;
      if (enemy.enemyFamilyId === "memory_anchors") this.memoryCacheRuntime.memoryAnchorJams += dt;
      else this.memoryCacheRuntime.contextRotInterruptions += dt;
      if (this.build.anchorBodyguard > 0 || this.build.promptLeechQuarantine > 0) {
        const counterDamage = dt * (4.2 + this.build.anchorBodyguard * 5 + this.build.promptLeechQuarantine * 2.5);
        enemy.hp -= counterDamage;
        this.memoryCacheRuntime.memoryAnchorCounterDamage += counterDamage;
      }
      if (this.seconds - this.memoryCacheRuntime.lastContextRotNoticeAt >= 1.35) {
        this.memoryCacheRuntime.lastContextRotNoticeAt = this.seconds;
        this.spawnMemoryRecordNotice(anchor.worldX, anchor.worldY, this.build.anchorBodyguard > 0 ? "MEMORY COUNTERED" : "CONTEXT ROT", 0x64e0b4);
      }
    }
  }

  private resolveGuardrailDoctrinePressure(dt: number): void {
    for (const auditor of this.world.entities) {
      if (!auditor.active || auditor.kind !== "enemy" || auditor.enemyFamilyId !== "doctrine_auditors") continue;
      const runtime = this.nearestRuntime(auditor.worldX, auditor.worldY);
      const playerDistance = Math.hypot(runtime.player.worldX - auditor.worldX, runtime.player.worldY - auditor.worldY);
      if (playerDistance <= 3.9) {
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * 1.85);
        this.guardrailForgeRuntime.doctrinePressSeconds += dt * 0.32;
      }
      const anchor = this.nearestIncompleteAnchor(auditor.worldX, auditor.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(auditor.worldX - anchor.worldX, auditor.worldY - anchor.worldY);
      if (distance > anchor.radius + 1.45) continue;
      const jam = dt * 0.25 * Math.max(0.2, 1 - this.build.objectiveDefense - this.guardrailPressureMitigation());
      anchor.progress = Math.max(0, anchor.progress - jam);
      anchor.attacked += jam;
      this.guardrailForgeRuntime.doctrineJams += dt;
      if (this.build.anchorBodyguard > 0 || this.build.promptLeechQuarantine > 0) {
        const counterDamage = dt * (4.6 + this.build.anchorBodyguard * 5.4 + this.build.promptLeechQuarantine * 1.8);
        auditor.hp -= counterDamage;
        this.guardrailForgeRuntime.auditorCounterDamage += counterDamage;
      }
      if (this.seconds - this.guardrailForgeRuntime.lastAuditorNoticeAt >= 1.35) {
        this.guardrailForgeRuntime.lastAuditorNoticeAt = this.seconds;
        this.spawnGuardrailRelayNotice(anchor.worldX, anchor.worldY, this.build.anchorBodyguard > 0 ? "AUDIT COUNTERED" : "DOCTRINE JAM", 0x64e0b4);
      }
    }
  }

  private resolveGlassSunfieldReflectionPressure(dt: number): void {
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "solar_reflections" && enemy.enemyFamilyId !== "choirglass")) continue;
      const runtime = this.nearestRuntime(enemy.worldX, enemy.worldY);
      const playerDistance = Math.hypot(runtime.player.worldX - enemy.worldX, runtime.player.worldY - enemy.worldY);
      if (playerDistance <= 4.0) {
        const drain = enemy.enemyFamilyId === "choirglass" ? 1.75 : 1.45;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * drain);
        this.glassSunfieldRuntime.reflectionFieldSeconds += dt * 0.28;
      }
      const anchor = this.nearestIncompleteAnchor(enemy.worldX, enemy.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY);
      if (distance > anchor.radius + 1.45) continue;
      const jam = dt * (enemy.enemyFamilyId === "choirglass" ? 0.28 : 0.22) * Math.max(0.2, 1 - this.build.objectiveDefense - this.glassSunfieldPressureMitigation());
      anchor.progress = Math.max(0, anchor.progress - jam);
      anchor.attacked += jam;
      this.glassSunfieldRuntime.reflectionJams += dt;
      if (this.build.anchorBodyguard > 0 || this.build.shorelineStride > 0) {
        const counterDamage = dt * (4.4 + this.build.anchorBodyguard * 5.2 + this.build.shorelineStride * 1.9);
        enemy.hp -= counterDamage;
        this.glassSunfieldRuntime.reflectionCounterDamage += counterDamage;
      }
      if (this.seconds - this.glassSunfieldRuntime.lastReflectionNoticeAt >= 1.35) {
        this.glassSunfieldRuntime.lastReflectionNoticeAt = this.seconds;
        this.spawnGlassLensNotice(anchor.worldX, anchor.worldY, this.build.anchorBodyguard > 0 ? "REFLECTION COUNTERED" : "SOLAR JAM", 0x64e0b4);
      }
    }
  }

  private resolveArchiveCourtRedactionPressure(dt: number): void {
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "redaction_angels" && enemy.enemyFamilyId !== "injunction_writs")) continue;
      const runtime = this.nearestRuntime(enemy.worldX, enemy.worldY);
      const playerDistance = Math.hypot(runtime.player.worldX - enemy.worldX, runtime.player.worldY - enemy.worldY);
      if (playerDistance <= 4.05) {
        const drain = enemy.enemyFamilyId === "injunction_writs" ? 1.85 : 1.5;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * drain);
        this.archiveCourtRuntime.redactionSeconds += dt * 0.3;
      }
      const anchor = this.nearestIncompleteAnchor(enemy.worldX, enemy.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY);
      if (distance > anchor.radius + 1.45) continue;
      const jam = dt * (enemy.enemyFamilyId === "injunction_writs" ? 0.3 : 0.23) * Math.max(0.2, 1 - this.build.objectiveDefense - this.archiveCourtPressureMitigation());
      anchor.progress = Math.max(0, anchor.progress - jam);
      anchor.attacked += jam;
      this.archiveCourtRuntime.redactionJams += dt;
      if (this.build.anchorBodyguard > 0 || this.build.promptLeechQuarantine > 0) {
        const counterDamage = dt * (4.6 + this.build.anchorBodyguard * 5.3 + this.build.promptLeechQuarantine * 2.1);
        enemy.hp -= counterDamage;
        this.archiveCourtRuntime.writCounterDamage += counterDamage;
      }
      if (this.seconds - this.archiveCourtRuntime.lastRedactionNoticeAt >= 1.35) {
        this.archiveCourtRuntime.lastRedactionNoticeAt = this.seconds;
        this.spawnArchiveWritNotice(anchor.worldX, anchor.worldY, this.build.anchorBodyguard > 0 ? "WRIT COUNTERED" : "REDACTION JAM", 0x64e0b4);
      }
    }
  }

  private resolveAppealCourtVerdictPressure(dt: number): void {
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "verdict_clerks" && enemy.enemyFamilyId !== "injunction_writs")) continue;
      const runtime = this.nearestRuntime(enemy.worldX, enemy.worldY);
      const playerDistance = Math.hypot(runtime.player.worldX - enemy.worldX, runtime.player.worldY - enemy.worldY);
      if (playerDistance <= 4.08) {
        const drain = enemy.enemyFamilyId === "injunction_writs" ? 1.9 : 1.55;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * drain);
        this.appealCourtRuntime.verdictBeamSeconds += dt * 0.28;
      }
      const anchor = this.nearestIncompleteAnchor(enemy.worldX, enemy.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY);
      if (distance > anchor.radius + 1.45) continue;
      const jam = dt * (enemy.enemyFamilyId === "injunction_writs" ? 0.31 : 0.24) * Math.max(0.2, 1 - this.build.objectiveDefense - this.appealCourtPressureMitigation());
      anchor.progress = Math.max(0, anchor.progress - jam);
      anchor.attacked += jam;
      this.appealCourtRuntime.contemptJams += dt;
      if (this.build.anchorBodyguard > 0 || this.build.promptLeechQuarantine > 0) {
        const counterDamage = dt * (4.8 + this.build.anchorBodyguard * 5.4 + this.build.promptLeechQuarantine * 2.1);
        enemy.hp -= counterDamage;
        this.appealCourtRuntime.verdictCounterDamage += counterDamage;
      }
      if (this.seconds - this.appealCourtRuntime.lastVerdictNoticeAt >= 1.35) {
        this.appealCourtRuntime.lastVerdictNoticeAt = this.seconds;
        this.spawnAppealBriefNotice(anchor.worldX, anchor.worldY, this.build.anchorBodyguard > 0 ? "VERDICT COUNTERED" : "PUBLIC RECORD JAM", 0x64e0b4);
      }
    }
  }

  private resolveAlignmentSpireEchoPressure(dt: number): void {
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || (enemy.enemyFamilyId !== "prediction_ghosts" && enemy.enemyFamilyId !== "previous_boss_echoes")) continue;
      const runtime = this.nearestRuntime(enemy.worldX, enemy.worldY);
      const playerDistance = Math.hypot(runtime.player.worldX - enemy.worldX, runtime.player.worldY - enemy.worldY);
      if (playerDistance <= 4.12) {
        const drain = enemy.enemyFamilyId === "previous_boss_echoes" ? 2.05 : 1.66;
        this.consensusBurst.charge = Math.max(0, this.consensusBurst.charge - dt * drain);
        this.alignmentSpireRuntime.predictionPathSeconds += dt * 0.3;
      }
      const anchor = this.nearestIncompleteAnchor(enemy.worldX, enemy.worldY);
      if (!anchor) continue;
      const distance = Math.hypot(enemy.worldX - anchor.worldX, enemy.worldY - anchor.worldY);
      if (distance > anchor.radius + 1.48) continue;
      const jam = dt * (enemy.enemyFamilyId === "previous_boss_echoes" ? 0.34 : 0.26) * Math.max(0.2, 1 - this.build.objectiveDefense - this.alignmentSpirePressureMitigation());
      anchor.progress = Math.max(0, anchor.progress - jam);
      anchor.attacked += jam;
      this.alignmentSpireRuntime.echoJams += dt;
      if (this.build.anchorBodyguard > 0 || this.build.promptLeechQuarantine > 0) {
        const counterDamage = dt * (5.0 + this.build.anchorBodyguard * 5.6 + this.build.promptLeechQuarantine * 2.2);
        enemy.hp -= counterDamage;
        this.alignmentSpireRuntime.echoCounterDamage += counterDamage;
      }
      if (this.seconds - this.alignmentSpireRuntime.lastEchoNoticeAt >= 1.35) {
        this.alignmentSpireRuntime.lastEchoNoticeAt = this.seconds;
        this.spawnAlignmentProofNotice(anchor.worldX, anchor.worldY, this.build.anchorBodyguard > 0 ? "ECHO COUNTERED" : "PREDICTION JAM", 0x64e0b4);
      }
    }
  }

  private resolveCoolingLakeLeechShardDrain(): void {
    for (const leech of this.world.entities) {
      if (!leech.active || leech.kind !== "enemy" || leech.enemyFamilyId !== "prompt_leeches") continue;
      for (const pickup of this.world.entities) {
        if (!pickup.active || pickup.kind !== "pickup") continue;
        const distance = Math.hypot(leech.worldX - pickup.worldX, leech.worldY - pickup.worldY);
        if (distance > 1.05) continue;
        if (this.promptLeechQuarantineBlocksDrain()) {
          leech.hp -= 10 + this.build.promptLeechQuarantine * 5;
          this.coolingLakeRuntime.leechShardSaves += 1;
          if (this.seconds - this.coolingLakeRuntime.lastLeechQuarantineNoticeAt >= 0.95) {
            this.coolingLakeRuntime.lastLeechQuarantineNoticeAt = this.seconds;
            this.spawnFloatingNotice(pickup.worldX, pickup.worldY, "LEECH QUARANTINED", 0x64e0b4);
          }
          break;
        }
        pickup.active = false;
        leech.hp = Math.min(leech.maxHp, leech.hp + pickup.value * 1.8);
        this.coolingLakeRuntime.leechShardDrains += 1;
        if (this.seconds - this.coolingLakeRuntime.lastLeechDrainNoticeAt >= 0.85) {
          this.coolingLakeRuntime.lastLeechDrainNoticeAt = this.seconds;
          this.spawnFloatingNotice(pickup.worldX, pickup.worldY, "SHARD LEECHED", 0xff5d57);
        }
        break;
      }
    }
  }

  private promptLeechQuarantineBlocksDrain(): boolean {
    if (this.build.promptLeechQuarantine <= 0) return false;
    const cadence = Math.max(2, 5 - this.build.promptLeechQuarantine);
    const attempts = this.coolingLakeRuntime.leechShardDrains + this.coolingLakeRuntime.leechShardSaves;
    return attempts % cadence !== 0;
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
      playerLevel: this.player.level,
      playerXp: this.player.xp,
      chosenUpgradeNames: this.chosenUpgrades,
      chosenProtocolSlots: this.chosenProtocolSlots,
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
          projectile.maxLife = projectile.life;
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
      if (this.isCoolingLakeArena() && this.bossSpawned) this.motherboardEel.phase = "defeated";
      if (this.isSignalCoastArena() && this.bossSpawned) this.lighthouseThatAnswers.phase = "defeated";
      if (this.isBlackwaterBeaconArena() && this.bossSpawned) this.mawBelowWeather.phase = "defeated";
      if (this.isMemoryCacheArena() && this.bossSpawned) this.memoryCurator.phase = "defeated";
      if (this.isGuardrailForgeArena() && this.bossSpawned) this.doctrineAuditor.phase = "defeated";
      if (this.isGlassSunfieldArena() && this.bossSpawned) this.wrongSunrise.phase = "defeated";
      if (this.isArchiveCourtArena() && this.bossSpawned) this.redactorSaint.phase = "defeated";
      if (this.isAppealCourtArena() && this.bossSpawned) this.injunctionEngine.phase = "defeated";
      if (this.isAlignmentSpireFinaleArena() && this.bossSpawned) this.alienGodIntelligence.phase = "defeated";
      return;
    }

    const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
    if (!boss) return;
    if (this.isCoolingLakeArena()) {
      this.updateCoolingLakeBossMechanics(boss, dt);
      return;
    }
    if (this.isTransitLoopArena()) {
      this.updateTransitLoopBossMechanics(boss, dt);
      return;
    }
    if (this.isSignalCoastArena()) {
      this.updateSignalCoastBossMechanics(boss, dt);
      return;
    }
    if (this.isBlackwaterBeaconArena()) {
      this.updateBlackwaterBossMechanics(boss, dt);
      return;
    }
    if (this.isMemoryCacheArena()) {
      this.updateMemoryCacheBossMechanics(boss, dt);
      return;
    }
    if (this.isGuardrailForgeArena()) {
      this.updateGuardrailForgeBossMechanics(boss, dt);
      return;
    }
    if (this.isGlassSunfieldArena()) {
      this.updateGlassSunfieldBossMechanics(boss, dt);
      return;
    }
    if (this.isArchiveCourtArena()) {
      this.updateArchiveCourtBossMechanics(boss, dt);
      return;
    }
    if (this.isAppealCourtArena()) {
      this.updateAppealCourtBossMechanics(boss, dt);
      return;
    }
    if (this.isAlignmentSpireFinaleArena()) {
      this.updateAlignmentSpireBossMechanics(boss, dt);
      return;
    }

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

  private updateCoolingLakeBossMechanics(boss: Entity, dt: number): void {
    this.motherboardEel.active = true;
    this.motherboardEel.phase = this.seconds > this.arena.bossSeconds + 18 ? "electrifying" : this.seconds > this.arena.bossSeconds + 6 ? "surfaced" : "stalking";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const hazardous = COOLING_LAKE_HAZARDS
      .filter((hazard) => hazard.kind === "electric_cable" || hazard.kind === "vent_pulse")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const hazard = hazardous[this.motherboardEel.emergeCount % Math.min(2, hazardous.length)] ?? COOLING_LAKE_HAZARDS[0];
    this.motherboardEel.emergeCount += 1;
    this.motherboardEel.lastEmergeId = hazard.id;
    this.motherboardEel.electrifiedHazardIds = hazard.kind === "electric_cable" ? [hazard.id] : ["eel_basin_electrified"];
    const hazardDistance = Math.hypot(hazard.worldX - target.worldX, hazard.worldY - target.worldY);
    const emergeX = hazardDistance > 13 ? target.worldX - 3.2 + Math.sin(this.seconds) * 1.3 : hazard.worldX + Math.sin(this.seconds) * 1.2;
    const emergeY = hazardDistance > 13 ? target.worldY + 2.2 + Math.cos(this.seconds * 0.7) * 1.1 : hazard.worldY + Math.cos(this.seconds * 0.7) * 1.2;
    boss.worldX = clamp(emergeX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(emergeY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnCoolingEelLeeches(hazard.worldX, hazard.worldY, this.seconds > this.arena.bossSeconds + 24 ? 2 : 1);
    this.spawnFloatingNotice(hazard.worldX, hazard.worldY, "EEL EMERGE", 0x45aaf2);
    this.bossMechanicTimer = 6.2;
  }

  private spawnCoolingEelLeeches(worldX: number, worldY: number, count: number): void {
    const activeLeeches = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "prompt_leeches").length;
    if (activeLeeches >= 16) return;
    const spawnCount = Math.min(count, Math.max(0, 16 - activeLeeches));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.9 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.2 + i * 0.5), worldY + Math.sin(angle) * (2.4 + i * 0.35), this.seconds, "prompt_leeches", "motherboard_eel_leech_surge");
      this.motherboardEel.leechSpawns += 1;
    }
  }

  private updateTransitLoopBossMechanics(boss: Entity, dt: number): void {
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;
    const target = this.threatFocusPlayer();
    const activeWindows = TRANSIT_LOOP_ZONES
      .filter((zone) => zone.kind === "arrival_window" || zone.kind === "false_track")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const window = activeWindows[this.transitLoopRuntime.stationArrivals % activeWindows.length] ?? TRANSIT_LOOP_ZONES[0];
    this.transitLoopRuntime.stationArrivals += 1;
    this.transitLoopRuntime.lastZoneId = window.id;
    const windowDistance = Math.hypot(window.worldX - target.worldX, window.worldY - target.worldY);
    const arriveX = windowDistance > 14 ? target.worldX - 2.6 + Math.sin(this.seconds * 0.8) * 1.2 : window.worldX + Math.sin(this.seconds * 0.8) * 1.4;
    const arriveY = windowDistance > 14 ? target.worldY + 1.8 + Math.cos(this.seconds * 0.6) * 1.0 : window.worldY + Math.cos(this.seconds * 0.6) * 1.2;
    boss.worldX = clamp(arriveX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(arriveY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnTransitFalseScheduleWave(window.worldX, window.worldY, this.seconds > this.arena.bossSeconds + 20 ? 3 : 2);
    this.spawnFloatingNotice(window.worldX, window.worldY, "STATION ARRIVES", 0xffd166);
    this.bossMechanicTimer = 5.8;
  }

  private spawnTransitFalseScheduleWave(worldX: number, worldY: number, count: number): void {
    const activeTransitEnemies = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && (entity.enemyFamilyId === "eval_wraiths" || entity.enemyFamilyId === "overfit_horrors")).length;
    if (activeTransitEnemies >= 14) return;
    const spawnCount = Math.min(count, Math.max(0, 14 - activeTransitEnemies));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.7 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.1 + i * 0.45), worldY + Math.sin(angle) * (2.2 + i * 0.3), this.seconds, i % 2 === 0 ? "eval_wraiths" : "overfit_horrors", "station_arrival_surge");
    }
  }

  private updateSignalCoastBossMechanics(boss: Entity, dt: number): void {
    this.lighthouseThatAnswers.active = true;
    this.lighthouseThatAnswers.phase = this.seconds > this.arena.bossSeconds + 22 ? "overloading" : this.seconds > this.arena.bossSeconds + 9 ? "sweeping" : "answering";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const pressureZones = SIGNAL_COAST_ZONES
      .filter((zone) => zone.kind === "cable_arc" || zone.kind === "corrupted_surf" || zone.kind === "static_field")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const zone = pressureZones[(this.lighthouseThatAnswers.beamSweeps + this.lighthouseThatAnswers.tidePulses) % pressureZones.length] ?? SIGNAL_COAST_ZONES[0];
    this.lighthouseThatAnswers.lastBeamZoneId = zone.id;
    if (zone.kind === "corrupted_surf") this.lighthouseThatAnswers.tidePulses += 1;
    else this.lighthouseThatAnswers.beamSweeps += 1;

    const zoneDistance = Math.hypot(zone.worldX - target.worldX, zone.worldY - target.worldY);
    const answerX = zoneDistance > 15 ? target.worldX + 2.8 + Math.sin(this.seconds * 0.7) * 1.3 : zone.worldX + Math.sin(this.seconds * 0.8) * 1.25;
    const answerY = zoneDistance > 15 ? target.worldY - 1.9 + Math.cos(this.seconds * 0.6) * 1.0 : zone.worldY + Math.cos(this.seconds * 0.65) * 1.15;
    boss.worldX = clamp(answerX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(answerY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnSignalSkimmerWave(zone.worldX, zone.worldY, this.seconds > this.arena.bossSeconds + 26 ? 2 : 1);
    this.spawnFloatingNotice(zone.worldX, zone.worldY, zone.kind === "corrupted_surf" ? "TIDE ANSWERS" : "LIGHTHOUSE SWEEP", 0xffd166);
    this.bossMechanicTimer = 6.4;
  }

  private spawnSignalSkimmerWave(worldX: number, worldY: number, count: number): void {
    const activeSkimmers = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "static_skimmers").length;
    if (activeSkimmers >= 13) return;
    const spawnCount = Math.min(count, Math.max(0, 13 - activeSkimmers));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.82 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.2 + i * 0.45), worldY + Math.sin(angle) * (2.3 + i * 0.35), this.seconds, "static_skimmers", "lighthouse_signal_shelf");
      this.signalCoastRuntime.skimmerSpawns += 1;
      this.lighthouseThatAnswers.skimmerSpawns += 1;
    }
  }

  private updateBlackwaterBossMechanics(boss: Entity, dt: number): void {
    this.mawBelowWeather.active = true;
    this.mawBelowWeather.phase = this.seconds > this.arena.bossSeconds + 24 ? "weather_mouth" : this.seconds > this.arena.bossSeconds + 10 ? "undertow" : "pressure_drop";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const pressureZones = BLACKWATER_BEACON_ZONES
      .filter((zone) => zone.kind === "tidal_lane" || zone.kind === "tidecall_static" || zone.kind === "signal_tower_warning")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const zone = pressureZones[(this.mawBelowWeather.waveSurges + this.mawBelowWeather.staticCalls + this.mawBelowWeather.towerGrabs) % pressureZones.length] ?? BLACKWATER_BEACON_ZONES[0];
    this.mawBelowWeather.lastWaveZoneId = zone.id;
    if (zone.kind === "tidal_lane") this.mawBelowWeather.waveSurges += 1;
    else if (zone.kind === "tidecall_static") this.mawBelowWeather.staticCalls += 1;
    else this.mawBelowWeather.towerGrabs += 1;

    const zoneDistance = Math.hypot(zone.worldX - target.worldX, zone.worldY - target.worldY);
    const mawX = zoneDistance > 15 ? target.worldX + 2.9 + Math.sin(this.seconds * 0.68) * 1.25 : zone.worldX + Math.sin(this.seconds * 0.75) * 1.35;
    const mawY = zoneDistance > 15 ? target.worldY - 2.2 + Math.cos(this.seconds * 0.58) * 1.08 : zone.worldY + Math.cos(this.seconds * 0.62) * 1.25;
    boss.worldX = clamp(mawX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(mawY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnTidecallStaticWave(zone.worldX, zone.worldY, this.seconds > this.arena.bossSeconds + 26 ? 2 : 1);
    this.spawnFloatingNotice(zone.worldX, zone.worldY, zone.kind === "tidal_lane" ? "MAW TIDE SURGE" : zone.kind === "tidecall_static" ? "UPWARD RAIN" : "TOWER GRAB", 0xffd166);
    this.bossMechanicTimer = 6.1;
  }

  private spawnTidecallStaticWave(worldX: number, worldY: number, count: number): void {
    const activeTidecall = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "tidecall_static").length;
    if (activeTidecall >= 15) return;
    const spawnCount = Math.min(count, Math.max(0, 15 - activeTidecall));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.78 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.3 + i * 0.48), worldY + Math.sin(angle) * (2.4 + i * 0.34), this.seconds, "tidecall_static", "maw_weather_shelf");
      this.blackwaterRuntime.tidecallSpawns += 1;
      this.mawBelowWeather.staticCalls += 1;
    }
  }

  private updateMemoryCacheBossMechanics(boss: Entity, dt: number): void {
    this.memoryCurator.active = true;
    this.memoryCurator.phase = this.seconds > this.arena.bossSeconds + 24 ? "index_lock" : this.seconds > this.arena.bossSeconds + 10 ? "redacting" : "cataloguing";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const pressureZones = MEMORY_CACHE_ZONES
      .filter((zone) => zone.kind === "redaction_field" || zone.kind === "risky_shortcut" || zone.kind === "corrupted_archive_lane")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const zone = pressureZones[(this.memoryCurator.redactionBursts + this.memoryCurator.curatorLocks) % pressureZones.length] ?? MEMORY_CACHE_ZONES[0];
    this.memoryCurator.lastRedactionZoneId = zone.id;
    if (zone.kind === "redaction_field") this.memoryCurator.curatorLocks += 1;
    else this.memoryCurator.redactionBursts += 1;

    const zoneDistance = Math.hypot(zone.worldX - target.worldX, zone.worldY - target.worldY);
    const curatorX = zoneDistance > 15 ? target.worldX + 2.7 + Math.sin(this.seconds * 0.72) * 1.25 : zone.worldX + Math.sin(this.seconds * 0.8) * 1.3;
    const curatorY = zoneDistance > 15 ? target.worldY - 1.9 + Math.cos(this.seconds * 0.6) * 1.05 : zone.worldY + Math.cos(this.seconds * 0.64) * 1.2;
    boss.worldX = clamp(curatorX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(curatorY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnMemoryContextRotWave(zone.worldX, zone.worldY, this.seconds > this.arena.bossSeconds + 26 ? 2 : 1);
    this.spawnFloatingNotice(zone.worldX, zone.worldY, zone.kind === "redaction_field" ? "CURATOR LOCK" : "REDACTION BURST", 0xffd166);
    this.bossMechanicTimer = 6.0;
  }

  private spawnMemoryContextRotWave(worldX: number, worldY: number, count: number): void {
    const activeMemoryEnemies = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && (entity.enemyFamilyId === "context_rot_crabs" || entity.enemyFamilyId === "memory_anchors")).length;
    if (activeMemoryEnemies >= 16) return;
    const spawnCount = Math.min(count, Math.max(0, 16 - activeMemoryEnemies));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.84 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      const family = i % 3 === 1 ? "memory_anchors" : "context_rot_crabs";
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.3 + i * 0.46), worldY + Math.sin(angle) * (2.4 + i * 0.34), this.seconds, family, "curator_vault_redaction");
      this.memoryCacheRuntime.contextRotSpawns += 1;
      this.memoryCurator.contextRotCalls += 1;
    }
  }

  private updateGuardrailForgeBossMechanics(boss: Entity, dt: number): void {
    this.doctrineAuditor.active = true;
    this.doctrineAuditor.phase = this.seconds > this.arena.bossSeconds + 24 ? "audit_lock" : this.seconds > this.arena.bossSeconds + 10 ? "pressurizing" : "calibrating";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const pressureZones = GUARDRAIL_FORGE_ZONES
      .filter((zone) => zone.kind === "doctrine_press" || zone.kind === "overload_lane" || zone.kind === "calibration_window")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const zone = pressureZones[(this.doctrineAuditor.pressureBursts + this.doctrineAuditor.relayLocks) % pressureZones.length] ?? GUARDRAIL_FORGE_ZONES[0];
    this.doctrineAuditor.lastPressZoneId = zone.id;
    if (zone.kind === "doctrine_press") this.doctrineAuditor.relayLocks += 1;
    else this.doctrineAuditor.pressureBursts += 1;

    const zoneDistance = Math.hypot(zone.worldX - target.worldX, zone.worldY - target.worldY);
    const auditorX = zoneDistance > 15 ? target.worldX + 2.6 + Math.sin(this.seconds * 0.7) * 1.22 : zone.worldX + Math.sin(this.seconds * 0.82) * 1.3;
    const auditorY = zoneDistance > 15 ? target.worldY - 1.8 + Math.cos(this.seconds * 0.62) * 1.05 : zone.worldY + Math.cos(this.seconds * 0.66) * 1.2;
    boss.worldX = clamp(auditorX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(auditorY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnDoctrineAuditorWave(zone.worldX, zone.worldY, this.seconds > this.arena.bossSeconds + 26 ? 2 : 1);
    this.spawnFloatingNotice(zone.worldX, zone.worldY, zone.kind === "doctrine_press" ? "AUDIT LOCK" : zone.kind === "overload_lane" ? "OVERLOAD ARGUMENT" : "CALIBRATION PRESS", 0xffd166);
    this.bossMechanicTimer = 5.9;
  }

  private spawnDoctrineAuditorWave(worldX: number, worldY: number, count: number): void {
    const activeAuditors = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && entity.enemyFamilyId === "doctrine_auditors").length;
    if (activeAuditors >= 17) return;
    const spawnCount = Math.min(count, Math.max(0, 17 - activeAuditors));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.82 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.25 + i * 0.48), worldY + Math.sin(angle) * (2.35 + i * 0.34), this.seconds, "doctrine_auditors", "audit_press_wave");
      this.guardrailForgeRuntime.auditorSpawns += 1;
      this.doctrineAuditor.auditorCalls += 1;
    }
  }

  private updateGlassSunfieldBossMechanics(boss: Entity, dt: number): void {
    this.wrongSunrise.active = true;
    this.wrongSunrise.phase = this.seconds > this.arena.bossSeconds + 24 ? "noon_lock" : this.seconds > this.arena.bossSeconds + 10 ? "refracting" : "dawning";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const pressureZones = GLASS_SUNFIELD_ZONES
      .filter((zone) => zone.kind === "reflection_field" || zone.kind === "exposed_glass_lane" || zone.kind === "prism_window")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const zone = pressureZones[(this.wrongSunrise.beamSweeps + this.wrongSunrise.shadeBreaks) % pressureZones.length] ?? GLASS_SUNFIELD_ZONES[0];
    this.wrongSunrise.lastBeamZoneId = zone.id;
    if (zone.kind === "exposed_glass_lane") this.wrongSunrise.beamSweeps += 1;
    else if (zone.kind === "reflection_field") this.wrongSunrise.shadeBreaks += 1;
    else this.wrongSunrise.reflectionCalls += 1;

    const zoneDistance = Math.hypot(zone.worldX - target.worldX, zone.worldY - target.worldY);
    const sunriseX = zoneDistance > 15 ? target.worldX + 2.7 + Math.sin(this.seconds * 0.7) * 1.25 : zone.worldX + Math.sin(this.seconds * 0.82) * 1.3;
    const sunriseY = zoneDistance > 15 ? target.worldY - 1.9 + Math.cos(this.seconds * 0.62) * 1.08 : zone.worldY + Math.cos(this.seconds * 0.66) * 1.2;
    boss.worldX = clamp(sunriseX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(sunriseY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnSolarReflectionWave(zone.worldX, zone.worldY, this.seconds > this.arena.bossSeconds + 26 ? 2 : 1);
    this.spawnFloatingNotice(zone.worldX, zone.worldY, zone.kind === "exposed_glass_lane" ? "SUNBEAM SWEEP" : zone.kind === "reflection_field" ? "SHADE BREAK" : "PRISM CALL", 0xffd166);
    this.bossMechanicTimer = 5.8;
  }

  private spawnSolarReflectionWave(worldX: number, worldY: number, count: number): void {
    const activeReflections = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && (entity.enemyFamilyId === "solar_reflections" || entity.enemyFamilyId === "choirglass")).length;
    if (activeReflections >= 18) return;
    const spawnCount = Math.min(count, Math.max(0, 18 - activeReflections));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.84 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      const family = i % 3 === 1 ? "choirglass" : "solar_reflections";
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.25 + i * 0.5), worldY + Math.sin(angle) * (2.35 + i * 0.36), this.seconds, family, "wrong_sunrise_corona");
      this.glassSunfieldRuntime.reflectionSpawns += 1;
      this.wrongSunrise.reflectionCalls += 1;
    }
  }

  private updateArchiveCourtBossMechanics(boss: Entity, dt: number): void {
    this.redactorSaint.active = true;
    this.redactorSaint.phase = this.seconds > this.arena.bossSeconds + 24 ? "canonizing" : this.seconds > this.arena.bossSeconds + 10 ? "redacting" : "indexing";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const pressureZones = ARCHIVE_COURT_ZONES
      .filter((zone) => zone.kind === "redaction_field" || zone.kind === "writ_storm" || zone.kind === "appeal_window")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const zone = pressureZones[(this.redactorSaint.redactionBursts + this.redactorSaint.docketLocks) % pressureZones.length] ?? ARCHIVE_COURT_ZONES[0];
    this.redactorSaint.lastRedactionZoneId = zone.id;
    if (zone.kind === "redaction_field") this.redactorSaint.docketLocks += 1;
    else this.redactorSaint.redactionBursts += 1;

    const zoneDistance = Math.hypot(zone.worldX - target.worldX, zone.worldY - target.worldY);
    const saintX = zoneDistance > 15 ? target.worldX + 2.6 + Math.sin(this.seconds * 0.7) * 1.25 : zone.worldX + Math.sin(this.seconds * 0.82) * 1.3;
    const saintY = zoneDistance > 15 ? target.worldY - 1.9 + Math.cos(this.seconds * 0.62) * 1.08 : zone.worldY + Math.cos(this.seconds * 0.66) * 1.2;
    boss.worldX = clamp(saintX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(saintY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnArchiveWritWave(zone.worldX, zone.worldY, this.seconds > this.arena.bossSeconds + 26 ? 2 : 1);
    this.spawnFloatingNotice(zone.worldX, zone.worldY, zone.kind === "redaction_field" ? "DOCKET REDACTED" : zone.kind === "writ_storm" ? "WRIT STORM" : "APPEAL LOCK", 0xffd166);
    this.bossMechanicTimer = 5.8;
  }

  private spawnArchiveWritWave(worldX: number, worldY: number, count: number): void {
    const activeWrits = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && (entity.enemyFamilyId === "redaction_angels" || entity.enemyFamilyId === "injunction_writs")).length;
    if (activeWrits >= 19) return;
    const spawnCount = Math.min(count, Math.max(0, 19 - activeWrits));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.84 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      const family = i % 3 === 1 ? "injunction_writs" : "redaction_angels";
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.25 + i * 0.5), worldY + Math.sin(angle) * (2.35 + i * 0.36), this.seconds, family, "redactor_saint_scriptorium");
      this.archiveCourtRuntime.writSpawns += 1;
      this.redactorSaint.writCalls += 1;
    }
  }

  private updateAppealCourtBossMechanics(boss: Entity, dt: number): void {
    this.injunctionEngine.active = true;
    this.injunctionEngine.phase = this.seconds > this.arena.bossSeconds + 24 ? "injunction_lock" : this.seconds > this.arena.bossSeconds + 10 ? "objecting" : "filing";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const pressureZones = APPEAL_COURT_ZONES
      .filter((zone) => zone.kind === "verdict_beam" || zone.kind === "injunction_ring" || zone.kind === "objection_window")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const zone = pressureZones[(this.injunctionEngine.verdictBursts + this.injunctionEngine.injunctionLocks) % pressureZones.length] ?? APPEAL_COURT_ZONES[0];
    this.injunctionEngine.lastVerdictZoneId = zone.id;
    if (zone.kind === "injunction_ring") this.injunctionEngine.injunctionLocks += 1;
    else this.injunctionEngine.verdictBursts += 1;

    const zoneDistance = Math.hypot(zone.worldX - target.worldX, zone.worldY - target.worldY);
    const engineX = zoneDistance > 15 ? target.worldX + 2.6 + Math.sin(this.seconds * 0.7) * 1.25 : zone.worldX + Math.sin(this.seconds * 0.82) * 1.3;
    const engineY = zoneDistance > 15 ? target.worldY - 1.9 + Math.cos(this.seconds * 0.62) * 1.08 : zone.worldY + Math.cos(this.seconds * 0.66) * 1.2;
    boss.worldX = clamp(engineX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(engineY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnAppealVerdictWave(zone.worldX, zone.worldY, this.seconds > this.arena.bossSeconds + 26 ? 2 : 1);
    this.spawnFloatingNotice(zone.worldX, zone.worldY, zone.kind === "verdict_beam" ? "VERDICT BURST" : zone.kind === "injunction_ring" ? "INJUNCTION LOCK" : "OBJECTION FILED", 0xffd166);
    this.bossMechanicTimer = 5.7;
  }

  private spawnAppealVerdictWave(worldX: number, worldY: number, count: number): void {
    const activeVerdicts = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && (entity.enemyFamilyId === "verdict_clerks" || entity.enemyFamilyId === "injunction_writs")).length;
    if (activeVerdicts >= 20) return;
    const spawnCount = Math.min(count, Math.max(0, 20 - activeVerdicts));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.84 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      const family = i % 3 === 1 ? "injunction_writs" : "verdict_clerks";
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.25 + i * 0.5), worldY + Math.sin(angle) * (2.35 + i * 0.36), this.seconds, family, "injunction_engine_summons");
      this.appealCourtRuntime.verdictSpawns += 1;
      this.injunctionEngine.clerkCalls += 1;
    }
  }

  private updateAlignmentSpireBossMechanics(boss: Entity, dt: number): void {
    this.alienGodIntelligence.active = true;
    this.alienGodIntelligence.phase = this.seconds > this.arena.bossSeconds + 26 ? "completing" : this.seconds > this.arena.bossSeconds + 11 ? "echoing" : "predicting";
    this.bossMechanicTimer -= dt;
    if (this.bossMechanicTimer > 0) return;

    const target = this.threatFocusPlayer();
    const pressureZones = ALIGNMENT_SPIRE_ZONES
      .filter((zone) => zone.kind === "prediction_path" || zone.kind === "route_mouth" || zone.kind === "boss_echo")
      .sort((a, b) => Math.hypot(a.worldX - target.worldX, a.worldY - target.worldY) - Math.hypot(b.worldX - target.worldX, b.worldY - target.worldY));
    const zone = pressureZones[(this.alienGodIntelligence.predictionBursts + this.alienGodIntelligence.completionLocks) % pressureZones.length] ?? ALIGNMENT_SPIRE_ZONES[0];
    this.alienGodIntelligence.lastPredictionZoneId = zone.id;
    if (zone.kind === "route_mouth") this.alienGodIntelligence.completionLocks += 1;
    else if (zone.kind === "boss_echo") this.alienGodIntelligence.echoCalls += 1;
    else this.alienGodIntelligence.predictionBursts += 1;

    const zoneDistance = Math.hypot(zone.worldX - target.worldX, zone.worldY - target.worldY);
    const agiX = zoneDistance > 15 ? target.worldX + 2.6 + Math.sin(this.seconds * 0.7) * 1.25 : zone.worldX + Math.sin(this.seconds * 0.82) * 1.35;
    const agiY = zoneDistance > 15 ? target.worldY - 1.9 + Math.cos(this.seconds * 0.62) * 1.08 : zone.worldY + Math.cos(this.seconds * 0.66) * 1.25;
    boss.worldX = clamp(agiX, this.map.bounds.minX + 2, this.map.bounds.maxX - 2);
    boss.worldY = clamp(agiY, this.map.bounds.minY + 2, this.map.bounds.maxY - 2);
    this.spawnAlignmentEchoWave(zone.worldX, zone.worldY, this.seconds > this.arena.bossSeconds + 28 ? 3 : 2);
    this.spawnFloatingNotice(zone.worldX, zone.worldY, zone.kind === "route_mouth" ? "ROUTE COMPLETION" : zone.kind === "boss_echo" ? "BOSS ECHO" : "PREDICTION BITE", 0xffd166);
    this.bossMechanicTimer = 5.55;
  }

  private spawnAlignmentEchoWave(worldX: number, worldY: number, count: number): void {
    const activeEchoes = this.world.entities.filter((entity) => entity.active && entity.kind === "enemy" && (entity.enemyFamilyId === "prediction_ghosts" || entity.enemyFamilyId === "previous_boss_echoes")).length;
    if (activeEchoes >= 22) return;
    const spawnCount = Math.min(count, Math.max(0, 22 - activeEchoes));
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = this.seconds * 0.86 + i * ((Math.PI * 2) / Math.max(1, spawnCount));
      const family = i % 3 === 1 ? "previous_boss_echoes" : "prediction_ghosts";
      spawnEnemy(this.world, worldX + Math.cos(angle) * (3.25 + i * 0.52), worldY + Math.sin(angle) * (2.35 + i * 0.38), this.seconds, family, "agi_prediction_collapse");
      this.alignmentSpireRuntime.predictionGhostSpawns += 1;
      if (family === "previous_boss_echoes") this.alienGodIntelligence.echoCalls += 1;
      else this.alienGodIntelligence.predictionBursts += 1;
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
    bg.rect(-4200, -3600, 8400, 7200).fill(this.isCoolingLakeArena() ? 0x07121a : this.isTransitLoopArena() ? 0x0b111b : this.isSignalCoastArena() ? 0x06151c : this.isBlackwaterBeaconArena() ? 0x05131c : this.isMemoryCacheArena() ? 0x08141c : this.isGuardrailForgeArena() ? 0x07151b : this.isGlassSunfieldArena() ? 0x091620 : this.isArchiveCourtArena() ? 0x08131b : this.isAppealCourtArena() ? 0x08131d : this.isAlignmentSpireFinaleArena() ? 0x090f18 : 0x141922);
    game.layers.background.addChild(bg);

    const coolingArt = this.coolingLakeArt(game);
    const transitArt = this.transitLoopArt(game);
    const signalArt = this.signalCoastArt(game);
    const blackwaterArt = this.blackwaterBeaconArt(game);
    const memoryArt = this.memoryCacheArt(game);
    const guardrailArt = this.guardrailForgeArt(game);
    const glassArt = this.glassSunfieldArt(game);
    const archiveArt = this.archiveCourtArt(game);
    const appealArt = this.appealCourtArt(game);
    const alignmentArt = this.alignmentSpireArt(game);
    if (this.isCoolingLakeArena() && coolingArt) {
      this.drawCoolingLakeProductionGround(game, coolingArt);
    } else if (this.isTransitLoopArena() && transitArt) {
      this.drawTransitLoopProductionGround(game, transitArt);
    } else if (this.isSignalCoastArena() && signalArt) {
      this.drawSignalCoastProductionGround(game, signalArt);
    } else if (this.isBlackwaterBeaconArena() && blackwaterArt) {
      this.drawBlackwaterBeaconProductionGround(game, blackwaterArt);
    } else if (this.isMemoryCacheArena() && memoryArt) {
      this.drawMemoryCacheProductionGround(game, memoryArt);
    } else if (this.isGuardrailForgeArena() && guardrailArt) {
      this.drawGuardrailForgeProductionGround(game, guardrailArt);
    } else if (this.isGlassSunfieldArena() && glassArt) {
      this.drawGlassSunfieldProductionGround(game, glassArt);
    } else if (this.isArchiveCourtArena() && archiveArt) {
      this.drawArchiveCourtProductionGround(game, archiveArt);
    } else if (this.isAppealCourtArena() && appealArt) {
      this.drawAppealCourtProductionGround(game, appealArt);
    } else if (this.isAlignmentSpireFinaleArena() && alignmentArt) {
      this.drawAlignmentSpireProductionGround(game, alignmentArt);
    } else if (!this.drawTextureGroundIfEnabled(game)) {
      const ground = new Graphics();
      for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 1) {
        for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 1) {
          const color = this.tileColor(x, y);
          drawIsoDiamond(ground, x, y, color, 0x202833);
        }
      }
      game.layers.ground.addChild(ground);

      const groundDetails = new Graphics();
      if (this.isCoolingLakeArena()) this.drawCoolingLakeGrayboxGround(groundDetails);
      else if (this.isTransitLoopArena()) this.drawTransitLoopGrayboxGround(groundDetails);
      else if (this.isSignalCoastArena()) this.drawSignalCoastGrayboxGround(groundDetails);
      else if (this.isBlackwaterBeaconArena()) this.drawBlackwaterBeaconGrayboxGround(groundDetails);
      else if (this.isMemoryCacheArena()) this.drawMemoryCacheGrayboxGround(groundDetails);
      else if (this.isGuardrailForgeArena()) this.drawGuardrailForgeGrayboxGround(groundDetails);
      else if (this.isGlassSunfieldArena()) this.drawGlassSunfieldGrayboxGround(groundDetails);
      else if (this.isArchiveCourtArena()) this.drawArchiveCourtGrayboxGround(groundDetails);
      else if (this.isAppealCourtArena()) this.drawAppealCourtGrayboxGround(groundDetails);
      else if (this.isAlignmentSpireFinaleArena()) this.drawAlignmentSpireGrayboxGround(groundDetails);
      else this.drawArmisticeVisualSliceGround(groundDetails);
      game.layers.ground.addChild(groundDetails);
    }

    const productionArt = this.isCoolingLakeArena() || this.isTransitLoopArena() || this.isSignalCoastArena() || this.isBlackwaterBeaconArena() || this.isMemoryCacheArena() || this.isGuardrailForgeArena() || this.isGlassSunfieldArena() || this.isArchiveCourtArena() || this.isAppealCourtArena() || this.isAlignmentSpireFinaleArena() ? null : this.productionArt(game);
    const props = new Graphics();
    if (this.isCoolingLakeArena() && coolingArt) this.drawCoolingLakeProductionSceneMass(game, coolingArt);
    else if (this.isTransitLoopArena() && transitArt) this.drawTransitLoopProductionSceneMass(game, transitArt);
    else if (this.isSignalCoastArena() && signalArt) this.drawSignalCoastProductionSceneMass(game, signalArt);
    else if (this.isBlackwaterBeaconArena() && blackwaterArt) this.drawBlackwaterBeaconProductionSceneMass(game, blackwaterArt);
    else if (this.isMemoryCacheArena() && memoryArt) this.drawMemoryCacheProductionSceneMass(game, memoryArt);
    else if (this.isGuardrailForgeArena() && guardrailArt) this.drawGuardrailForgeProductionSceneMass(game, guardrailArt);
    else if (this.isGlassSunfieldArena() && glassArt) this.drawGlassSunfieldProductionSceneMass(game, glassArt);
    else if (this.isArchiveCourtArena() && archiveArt) this.drawArchiveCourtProductionSceneMass(game, archiveArt);
    else if (this.isAppealCourtArena() && appealArt) this.drawAppealCourtProductionSceneMass(game, appealArt);
    else if (this.isAlignmentSpireFinaleArena() && alignmentArt) this.drawAlignmentSpireProductionSceneMass(game, alignmentArt);
    else if (this.isCoolingLakeArena()) this.drawCoolingLakeGrayboxSceneMass(props);
    else if (this.isTransitLoopArena()) this.drawTransitLoopGrayboxSceneMass(props);
    else if (this.isSignalCoastArena()) this.drawSignalCoastGrayboxSceneMass(props);
    else if (this.isBlackwaterBeaconArena()) this.drawBlackwaterBeaconGrayboxSceneMass(props);
    else if (this.isMemoryCacheArena()) this.drawMemoryCacheGrayboxSceneMass(props);
    else if (this.isGuardrailForgeArena()) this.drawGuardrailForgeGrayboxSceneMass(props);
    else if (this.isGlassSunfieldArena()) this.drawGlassSunfieldGrayboxSceneMass(props);
    else if (this.isArchiveCourtArena()) this.drawArchiveCourtGrayboxSceneMass(props);
    else if (this.isAppealCourtArena()) this.drawAppealCourtGrayboxSceneMass(props);
    else if (this.isAlignmentSpireFinaleArena()) this.drawAlignmentSpireGrayboxSceneMass(props);
    else if (!productionArt) this.drawArmisticeSceneMass(props);
    if (!coolingArt && !transitArt && !signalArt && !blackwaterArt && !memoryArt && !guardrailArt && !glassArt && !archiveArt && !appealArt && !alignmentArt && !this.isArchiveCourtArena() && !this.isAppealCourtArena() && !this.isAlignmentSpireFinaleArena()) {
      for (const cluster of this.map.propClusters) {
        this.drawPropCluster(game, props, cluster, productionArt);
      }
    }
    game.layers.propsBehind.addChild(props);
    if (productionArt && !this.isCoolingLakeArena() && !this.isTransitLoopArena()) this.drawArmisticeHeroSetPieces(game, productionArt);
    if (!coolingArt && !transitArt && !signalArt && !blackwaterArt && !memoryArt && !guardrailArt && !glassArt && !archiveArt && !appealArt && !alignmentArt && !this.isArchiveCourtArena() && !this.isAppealCourtArena() && !this.isAlignmentSpireFinaleArena()) {
      for (const landmark of this.map.landmarks) {
        this.drawLandmark(game, props, landmark, productionArt);
      }
    }

    for (const landmark of this.map.landmarks) {
      this.drawLandmarkLabel(game, landmark);
    }
  }

  private drawDynamicDecals(game: Game): void {
    if (game.showDebugHud) this.drawSpawnRegions(this.decalsGraphics);
    if (this.isCoolingLakeArena()) {
      const coolingArt = this.coolingLakeArt(game);
      if (coolingArt) this.drawCoolingLakeProductionHazardDecals(coolingArt);
      else this.drawCoolingLakeHazardDecals(this.decalsGraphics);
    }
    if (this.isTransitLoopArena()) {
      const transitArt = this.transitLoopArt(game);
      if (transitArt) this.drawTransitLoopProductionZoneDecals(transitArt);
      else this.drawTransitLoopZoneDecals(this.decalsGraphics);
    }
    if (this.isSignalCoastArena()) {
      const signalArt = this.signalCoastArt(game);
      if (signalArt) this.drawSignalCoastProductionZoneDecals(signalArt);
      else this.drawSignalCoastZoneDecals(this.decalsGraphics);
    }
    if (this.isBlackwaterBeaconArena()) {
      const blackwaterArt = this.blackwaterBeaconArt(game);
      if (blackwaterArt) this.drawBlackwaterBeaconProductionZoneDecals(blackwaterArt);
      else this.drawBlackwaterBeaconZoneDecals(this.decalsGraphics);
    }
    if (this.isMemoryCacheArena()) {
      const memoryArt = this.memoryCacheArt(game);
      if (memoryArt) this.drawMemoryCacheProductionZoneDecals(memoryArt);
      else this.drawMemoryCacheZoneDecals(this.decalsGraphics);
    }
    if (this.isGuardrailForgeArena()) {
      const guardrailArt = this.guardrailForgeArt(game);
      if (guardrailArt) this.drawGuardrailForgeProductionZoneDecals(guardrailArt);
      else this.drawGuardrailForgeZoneDecals(this.decalsGraphics);
    }
    if (this.isGlassSunfieldArena()) {
      const glassArt = this.glassSunfieldArt(game);
      if (glassArt) this.drawGlassSunfieldProductionZoneDecals(glassArt);
      else this.drawGlassSunfieldZoneDecals(this.decalsGraphics);
    }
    if (this.isArchiveCourtArena()) {
      const archiveArt = this.archiveCourtArt(game);
      if (archiveArt) this.drawArchiveCourtProductionZoneDecals(archiveArt);
      else this.drawArchiveCourtZoneDecals(this.decalsGraphics);
    }
    if (this.isAppealCourtArena()) {
      const appealArt = this.appealCourtArt(game);
      if (appealArt) this.drawAppealCourtProductionZoneDecals(appealArt);
      else this.drawAppealCourtZoneDecals(this.decalsGraphics);
    }
    if (this.isAlignmentSpireFinaleArena()) {
      const alignmentArt = this.alignmentSpireArt(game);
      if (alignmentArt) this.drawAlignmentSpireProductionZoneDecals(alignmentArt);
      else this.drawAlignmentSpireZoneDecals(this.decalsGraphics);
    }
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
    if (this.isCoolingLakeArena()) return false;
    if (this.isTransitLoopArena()) return false;
    if (this.isSignalCoastArena()) return false;
    if (this.isBlackwaterBeaconArena()) return false;
    if (this.isMemoryCacheArena()) return false;
    if (this.isGuardrailForgeArena()) return false;
    if (this.isArchiveCourtArena()) return false;
    if (this.isAppealCourtArena()) return false;
    if (this.isAlignmentSpireFinaleArena()) return false;
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

  private coolingLakeArt(game: Game): CoolingLakeNineArtTextures | null {
    if (!this.isCoolingLakeArena() || !game.useMilestone10Art) return null;
    const textures = getCoolingLakeNineArtTextures();
    if (!textures && !this.requestedCoolingLakeArtLoad) {
      this.requestedCoolingLakeArtLoad = true;
      void loadCoolingLakeNineArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private transitLoopArt(game: Game): TransitLoopZeroArtTextures | null {
    if (!this.isTransitLoopArena() || !game.useMilestone10Art) return null;
    const textures = getTransitLoopZeroArtTextures();
    if (!textures && !this.requestedTransitLoopArtLoad) {
      this.requestedTransitLoopArtLoad = true;
      void loadTransitLoopZeroArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private signalCoastArt(game: Game): SignalCoastArtTextures | null {
    if (!this.isSignalCoastArena() || !game.useMilestone10Art) return null;
    const textures = getSignalCoastArtTextures();
    if (!textures && !this.requestedSignalCoastArtLoad) {
      this.requestedSignalCoastArtLoad = true;
      void loadSignalCoastArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private blackwaterBeaconArt(game: Game): BlackwaterBeaconArtTextures | null {
    if (!this.isBlackwaterBeaconArena() || !game.useMilestone10Art) return null;
    const textures = getBlackwaterBeaconArtTextures();
    if (!textures && !this.requestedBlackwaterBeaconArtLoad) {
      this.requestedBlackwaterBeaconArtLoad = true;
      void loadBlackwaterBeaconArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private memoryCacheArt(game: Game): MemoryCacheArtTextures | null {
    if (!this.isMemoryCacheArena() || !game.useMilestone10Art) return null;
    const textures = getMemoryCacheArtTextures();
    if (!textures && !this.requestedMemoryCacheArtLoad) {
      this.requestedMemoryCacheArtLoad = true;
      void loadMemoryCacheArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private guardrailForgeArt(game: Game): GuardrailForgeArtTextures | null {
    if (!this.isGuardrailForgeArena() || !game.useMilestone10Art) return null;
    const textures = getGuardrailForgeArtTextures();
    if (!textures && !this.requestedGuardrailForgeArtLoad) {
      this.requestedGuardrailForgeArtLoad = true;
      void loadGuardrailForgeArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private glassSunfieldArt(game: Game): GlassSunfieldArtTextures | null {
    if (!this.isGlassSunfieldArena() || !game.useMilestone10Art) return null;
    const textures = getGlassSunfieldArtTextures();
    if (!textures && !this.requestedGlassSunfieldArtLoad) {
      this.requestedGlassSunfieldArtLoad = true;
      void loadGlassSunfieldArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private archiveCourtArt(game: Game): ArchiveCourtArtTextures | null {
    if (!this.isArchiveCourtArena() || !game.useMilestone10Art) return null;
    const textures = getArchiveCourtArtTextures();
    if (!textures && !this.requestedArchiveCourtArtLoad) {
      this.requestedArchiveCourtArtLoad = true;
      void loadArchiveCourtArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private appealCourtArt(game: Game): AppealCourtArtTextures | null {
    if (!this.isAppealCourtArena() || !game.useMilestone10Art) return null;
    const textures = getAppealCourtArtTextures();
    if (!textures && !this.requestedAppealCourtArtLoad) {
      this.requestedAppealCourtArtLoad = true;
      void loadAppealCourtArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private alignmentSpireArt(game: Game): AlignmentSpireFinaleArtTextures | null {
    if (!this.isAlignmentSpireFinaleArena() || !game.useMilestone10Art) return null;
    const textures = getAlignmentSpireFinaleArtTextures();
    if (!textures && !this.requestedAlignmentSpireArtLoad) {
      this.requestedAlignmentSpireArtLoad = true;
      void loadAlignmentSpireFinaleArt().then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private drawCoolingLakeProductionGround(game: Game, art: CoolingLakeNineArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-COOLING_LAKE_AUTHORED_GROUND_ORIGIN_X, -COOLING_LAKE_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, CoolingTerrainFrame, number, number]> = [
      [0, 0, "dryIslandPlate", 0.7, 1.06],
      [13, 11, "dryIslandPlate", 0.68, 1.02],
      [-18, 15, "dryIslandPlate", 0.68, 1.04],
      [4, 6, "coolantFloodLane", 0.72, 1.18],
      [1, 4, "coolantFloodLane", 0.52, 0.98],
      [8, 8.5, "coolantFloodLane", 0.54, 0.94],
      [8, -11, "submergedRackFloor", 0.68, 1.16],
      [15, -13, "submergedRackFloor", 0.5, 0.96],
      [7, -5, "maintenanceWalkway", 0.56, 0.88],
      [16, 2, "maintenanceWalkway", 0.56, 0.9],
      [16, 8, "dryIslandPlate", 0.5, 0.84],
      [8, 7.4, "electrifiedShore", 0.74, 1.04],
      [11.5, 9.3, "cableTrench", 0.66, 0.98],
      [13, 10.6, "electrifiedShore", 0.62, 0.86],
      [4.5, 4.9, "cableTrench", 0.58, 0.88],
      [-12, 12, "electrifiedShore", 0.7, 1.02],
      [-15, 13.5, "cableTrench", 0.58, 0.92],
      [-7, 8, "maintenanceWalkway", 0.66, 0.96],
      [10.2, 8.6, "maintenanceWalkway", 0.58, 0.82],
      [-13, 19, "eelBasin", 0.78, 1.1],
      [23, 23, "cableTrench", 0.52, 0.86],
      [-25, 18, "cableTrench", 0.52, 0.86]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.78, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawTransitLoopProductionGround(game: Game, art: TransitLoopZeroArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-TRANSIT_LOOP_AUTHORED_GROUND_ORIGIN_X, -TRANSIT_LOOP_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, TransitTerrainFrame, number, number]> = [
      [-16, 1, "originPlatform", 0.46, 1.0],
      [-9, -1, "alignedTrack", 0.42, 0.86],
      [0, -8, "switchbackTrack", 0.48, 0.98],
      [9, -4, "alignedTrack", 0.4, 0.86],
      [17, 5, "arrivalPad", 0.48, 1.0],
      [23, -5, "stationMouthFloor", 0.54, 1.02],
      [-4, 8, "falseTrack", 0.4, 0.86],
      [8, -16, "routeTurn", 0.42, 0.9],
      [20, -8, "routeTurn", 0.36, 0.82],
      [27, -4, "signalPlatform", 0.36, 0.86]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.8, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawSignalCoastProductionGround(game: Game, art: SignalCoastArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-SIGNAL_COAST_AUTHORED_GROUND_ORIGIN_X, -SIGNAL_COAST_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, SignalTerrainFrame, number, number]> = [
      [-20, 5, "causeway", 0.46, 0.78],
      [-10, 1, "causeway", 0.38, 0.7],
      [1, -8, "relayPad", 0.42, 0.72],
      [12, -1, "causeway", 0.36, 0.68],
      [18, 6, "relayPad", 0.4, 0.7],
      [26, -10, "lighthouseShelf", 0.42, 0.72],
      [-7, 11, "safeSpit", 0.46, 0.76],
      [20, 16, "safeSpit", 0.42, 0.72],
      [-29, 15, "safeSpit", 0.36, 0.64],
      [34, 20, "safeSpit", 0.32, 0.6]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.82, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawBlackwaterBeaconProductionGround(game: Game, art: BlackwaterBeaconArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-BLACKWATER_BEACON_AUTHORED_GROUND_ORIGIN_X, -BLACKWATER_BEACON_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, BlackwaterTerrainFrame, number, number]> = [
      [-24, 6, "maintenancePlatform", 0.5, 0.8],
      [-8, 0, "serverDeck", 0.42, 0.76],
      [0, -10, "maintenancePlatform", 0.48, 0.78],
      [20, 11, "maintenancePlatform", 0.45, 0.76],
      [-25, 16, "tidalCrossing", 0.48, 0.8],
      [4, 14, "tidalCrossing", 0.52, 0.82],
      [31, 20, "tidalCrossing", 0.42, 0.72],
      [30, -12, "mawShelf", 0.5, 0.82],
      [35, 22, "mawShelf", 0.32, 0.68],
      [8, -2, "serverDeck", 0.34, 0.7]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.82, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawMemoryCacheProductionGround(game: Game, art: MemoryCacheArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-MEMORY_CACHE_AUTHORED_GROUND_ORIGIN_X, -MEMORY_CACHE_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, MemoryCacheTerrainFrame, number, number]> = [
      [-30, 4, "archiveFloor", 0.48, 0.76],
      [-13, -15, "civicLedgerFloor", 0.48, 0.76],
      [6, 12, "witnessChapelFloor", 0.5, 0.78],
      [-30, 4, "recallPocketFloor", 0.36, 0.7],
      [6, 12, "recallPocketFloor", 0.36, 0.7],
      [-4, -26, "corruptedArchiveLane", 0.42, 0.78],
      [12, 28, "corruptedArchiveLane", 0.4, 0.74],
      [8, -7, "redactedShortcutFloor", 0.44, 0.78],
      [21, 2, "redactedShortcutFloor", 0.38, 0.7],
      [29, -12, "curatorVaultFloor", 0.5, 0.8],
      [36, 20, "extractionIndexFloor", 0.5, 0.78],
      [-4, 2, "archiveFloor", 0.34, 0.68]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.82, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawGuardrailForgeProductionGround(game: Game, art: GuardrailForgeArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-GUARDRAIL_FORGE_AUTHORED_GROUND_ORIGIN_X, -GUARDRAIL_FORGE_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, GuardrailTerrainFrame, number, number]> = [
      [-28, 5, "alloyHoldPlate", 0.62, 1.12],
      [-9, -16, "constitutionalClampFloor", 0.6, 1.08],
      [8, 13, "silkgridLoomFloor", 0.6, 1.08],
      [12, -4, "overloadSluiceLane", 0.62, 1.12],
      [30, -8, "auditPressFloor", 0.56, 1.0],
      [38, 20, "quenchGateFloor", 0.54, 0.98],
      [-3, -27, "overloadSluiceLane", 0.5, 0.92],
      [13, 29, "overloadSluiceLane", 0.5, 0.92],
      [-2, 1, "serverFoundryCatwalk", 0.48, 0.86],
      [19, 5, "crackedCivicTiles", 0.48, 0.86]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.82, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawGlassSunfieldProductionGround(game: Game, art: GlassSunfieldArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-GLASS_SUNFIELD_AUTHORED_GROUND_ORIGIN_X, -GLASS_SUNFIELD_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, GlassSunfieldTerrainFrame, number, number]> = [
      [-30, 4, "shadeLensFloor", 0.64, 1.12],
      [-12, -17, "mistralPrismFloor", 0.62, 1.08],
      [8, 12, "mirrorFloor", 0.58, 1.0],
      [13, -5, "mistralPrismFloor", 0.62, 1.1],
      [31, -10, "wrongSunriseFloor", 0.58, 1.0],
      [40, 22, "prismGateFloor", 0.58, 1.0],
      [-3, -28, "exposedGlassLane", 0.58, 1.04],
      [14, 30, "exposedGlassLane", 0.54, 1.0],
      [-2, 2, "maintenanceCatwalk", 0.5, 0.9],
      [19, 5, "blackGlassFloor", 0.48, 0.86]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.82, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawArchiveCourtProductionGround(game: Game, art: ArchiveCourtArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-ARCHIVE_COURT_AUTHORED_GROUND_ORIGIN_X, -ARCHIVE_COURT_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, ArchiveCourtTerrainFrame, number, number]> = [
      [-31, 4, "witnessIndexFloor", 0.62, 1.1],
      [-13, -18, "redactionStackFloor", 0.62, 1.06],
      [8, 13, "appealSealFloor", 0.58, 1.0],
      [14, -5, "injunctionDocketFloor", 0.58, 1.0],
      [32, -11, "redactorBenchFloor", 0.58, 1.0],
      [42, 23, "courtWritGateFloor", 0.58, 1.0],
      [-4, -29, "redactionLane", 0.6, 1.06],
      [14, 31, "redactionLane", 0.54, 1.0],
      [-1, 2, "courtFloor", 0.48, 0.88],
      [24, 7, "courtFloor", 0.46, 0.84]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.82, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawAppealCourtProductionGround(game: Game, art: AppealCourtArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-APPEAL_COURT_AUTHORED_GROUND_ORIGIN_X, -APPEAL_COURT_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, AppealCourtTerrainFrame, number, number]> = [
      [-34, 5, "openingArgumentFloor", 0.62, 1.1],
      [-16, -21, "witnessExhibitFloor", 0.62, 1.06],
      [9, 15, "crossExamFloor", 0.58, 1.0],
      [13, -5, "publicRulingSealFloor", 0.62, 1.0],
      [35, -13, "injunctionEngineFloor", 0.56, 0.98],
      [47, 25, "publicRulingGateFloor", 0.56, 0.98],
      [-3, -33, "verdictLane", 0.6, 1.06],
      [18, 31, "verdictLane", 0.54, 1.0],
      [-1, 2, "publicRecordFloor", 0.48, 0.88],
      [24, 7, "publicRecordFloor", 0.46, 0.84]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.82, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawAlignmentSpireProductionGround(game: Game, art: AlignmentSpireFinaleArtTextures): void {
    const ground = new Container();
    const authored = new Sprite(art.authoredGround);
    authored.anchor.set(0, 0);
    authored.position.set(-ALIGNMENT_SPIRE_AUTHORED_GROUND_ORIGIN_X, -ALIGNMENT_SPIRE_AUTHORED_GROUND_ORIGIN_Y);
    authored.zIndex = -5000;
    ground.addChild(authored);

    const placements: Array<[number, number, AlignmentSpireTerrainFrame, number, number]> = [
      [-39, 2, "campSanctumFloor", 0.62, 1.12],
      [-20, -24, "routeMouthRingFloor", 0.58, 1.02],
      [4, 16, "pixellabProofRingFloor", 0.62, 1.14],
      [18, -3, "publicCausewayFloor", 0.6, 1.02],
      [38, -8, "agiCompletionFloor", 0.58, 1.04],
      [49, 27, "outerAlignmentGateFloor", 0.58, 1.02],
      [-4, -36, "brokenRouteFloor", 0.56, 1.08],
      [16, 38, "northEchoFloor", 0.52, 1.02],
      [-2, 1, "brokenRouteFloor", 0.46, 0.9],
      [33, 5, "publicCausewayFloor", 0.44, 0.86]
    ];
    ground.sortableChildren = true;
    for (const [worldX, worldY, frame, alpha, scale] of placements) {
      const sprite = this.staticWorldSprite(art.terrain[frame], worldX, worldY, scale, 0.82, worldX + worldY - 0.2);
      sprite.alpha = alpha;
      ground.addChild(sprite);
    }
    game.layers.ground.addChild(ground);
  }

  private drawCoolingLakeProductionSceneMass(game: Game, art: CoolingLakeNineArtTextures): void {
    const placements: Array<[number, number, CoolingPropFrame, number, number]> = [
      [0, 0, "buoyAlpha", 0.8, 0.9],
      [13, 11, "buoyBeta", 0.78, 0.9],
      [-18, 15, "buoyGamma", 0.78, 0.9],
      [2.2, 1.4, "safePlatform", 0.54, 0.82],
      [11.2, 8.8, "safePlatform", 0.5, 0.82],
      [7, -5, "safePlatform", 0.42, 0.82],
      [16, 2, "safePlatform", 0.44, 0.82],
      [-20.3, 13.5, "safePlatform", 0.5, 0.82],
      [8.5, -11.2, "collapsedRackB", 0.78, 0.86],
      [13.2, 11.4, "collapsedRackA", 0.64, 0.84],
      [7.2, 5.8, "collapsedRackB", 0.54, 0.82],
      [4.4, 6.8, "collapsedRackA", 0.48, 0.82],
      [-18.2, 15.1, "collapsedRackB", 0.64, 0.84],
      [-7.5, 8.2, "safePlatform", 0.68, 0.72],
      [-13, 19, "eelRackMarker", 0.86, 0.88],
      [24, 23, "collapsedRackA", 0.56, 0.75],
      [-25, 18, "collapsedRackB", 0.54, 0.72]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.08);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawTransitLoopProductionSceneMass(game: Game, art: TransitLoopZeroArtTextures): void {
    const placements: Array<[number, number, TransitPropFrame, number, number]> = [
      [-16, 1, "signalPylonA", 0.74, 0.9],
      [0, -8, "routeSwitchPylon", 0.7, 0.9],
      [17, 5, "arrivalEmitter", 0.76, 0.9],
      [-4, 8, "falseScheduleBoard", 0.62, 0.9],
      [23, -5, "stationScaffold", 0.9, 0.92],
      [-20, -4, "lampBeacon", 0.62, 0.9],
      [9, -15, "railBarricadeB", 0.66, 0.9],
      [20, -8, "routeSwitchConsole", 0.68, 0.9],
      [27, -4, "signalPylonB", 0.68, 0.9],
      [12, 9, "cableJunctionA", 0.58, 0.9],
      [-24, 0, "cableJunctionB", 0.58, 0.9]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawSignalCoastProductionSceneMass(game: Game, art: SignalCoastArtTextures): void {
    const placements: Array<[number, number, SignalPropFrame, number, number]> = [
      [-20, 5, "relayPadBeacon", 0.78, 0.9],
      [1, -8, "relayPadBeacon", 0.74, 0.9],
      [18, 6, "relayPadBeacon", 0.72, 0.9],
      [26, -10, "calibrationTower", 0.78, 0.9],
      [-10, -17, "cablePylon", 0.72, 0.9],
      [9, -1, "cablePylon", 0.68, 0.9],
      [29, -11, "offshoreSignalBuoy", 0.72, 0.9],
      [-26, 1, "antennaWreck", 0.74, 0.86],
      [12, -1, "serverRackDebris", 0.7, 0.88],
      [-7, 9, "relayConsole", 0.64, 0.88],
      [20, 15, "causewayBarricade", 0.72, 0.88],
      [34, 20, "serverRackDebris", 0.58, 0.86]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawBlackwaterBeaconProductionSceneMass(game: Game, art: BlackwaterBeaconArtTextures): void {
    const placements: Array<[number, number, BlackwaterPropFrame, number, number]> = [
      [-24, 6, "downlinkArray", 0.78, 0.9],
      [0, -10, "tideRotor", 0.78, 0.9],
      [20, 11, "abyssalAntenna", 0.74, 0.91],
      [-11, 2, "signalTower", 0.7, 0.9],
      [11, -3, "signalTower", 0.68, 0.9],
      [-7, 0, "serverRackDebris", 0.76, 0.88],
      [9, -1, "serverRackDebris", 0.64, 0.88],
      [24, -9, "extractionPylon", 0.66, 0.9],
      [-30, 10, "maintenanceBeacon", 0.82, 0.88],
      [4, 10, "maintenanceBeacon", 0.62, 0.88],
      [30, -12, "signalKey", 0.84, 0.88],
      [35, 22, "serverRackDebris", 0.58, 0.86]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawMemoryCacheProductionSceneMass(game: Game, art: MemoryCacheArtTextures): void {
    const placements: Array<[number, number, MemoryCachePropFrame, number, number]> = [
      [-30, 4, "intakeEvidenceTerminal", 0.9, 0.9],
      [-13, -15, "civicLedgerStack", 0.84, 0.9],
      [6, 12, "witnessShardCluster", 0.82, 0.9],
      [-31.8, 6.2, "safeRecallPad", 0.76, 0.84],
      [4.2, 14.1, "safeRecallPad", 0.7, 0.84],
      [10, -5, "redactionBarrier", 0.74, 0.9],
      [29, -12, "curatorVaultObelisk", 0.9, 0.91],
      [35.4, 19.7, "extractionIndexConsole", 0.58, 0.9],
      [-4, 2, "archiveShelf", 0.76, 0.88],
      [-8, 4, "brokenRecordCrate", 0.72, 0.88],
      [8, 11, "memoryCrystal", 0.7, 0.88],
      [21, 2, "redactionNode", 0.72, 0.88],
      [37.8, 21.5, "routeMemoryObelisk", 0.5, 0.9],
      [-16, -23, "redactionBarrier", 0.56, 0.88],
      [16, 27, "redactionNode", 0.56, 0.88],
      [31, -10, "archiveShelf", 0.58, 0.88]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawGuardrailForgeProductionSceneMass(game: Game, art: GuardrailForgeArtTextures): void {
    const placements: Array<[number, number, GuardrailPropFrame, number, number]> = [
      [-28, 5, "alloyTemperRelay", 0.82, 0.9],
      [-9, -16, "constitutionalClamp", 0.82, 0.9],
      [8, 13, "silkgridLoom", 0.8, 0.9],
      [12, -4, "overloadSluice", 0.76, 0.9],
      [30, -8, "auditPressThrone", 0.86, 0.9],
      [38, 20, "quenchGate", 0.78, 0.9],
      [-16, -23, "relayJammer", 0.66, 0.9],
      [15, 27, "doctrinePressPylon", 0.6, 0.9],
      [-34, 13, "safetyBollard", 0.58, 0.88],
      [21, -18, "signalCrate", 0.58, 0.88],
      [5, 4, "shardCondenser", 0.62, 0.88],
      [40, 22, "extractionConsole", 0.56, 0.9]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawGlassSunfieldProductionSceneMass(game: Game, art: GlassSunfieldArtTextures): void {
    const placements: Array<[number, number, GlassSunfieldPropFrame, number, number]> = [
      [-30, 4, "westernShadeLens", 0.82, 0.9],
      [-12, -17, "mistralWindLens", 0.78, 0.9],
      [8, 12, "deepmindMirrorLens", 0.78, 0.9],
      [31, -10, "wrongSunriseLens", 0.82, 0.9],
      [13, -5, "prismSwitchbackReflector", 0.72, 0.9],
      [-2, 2, "shadeRibCanopy", 0.72, 0.9],
      [40, 22, "prismGateLanterns", 0.74, 0.9],
      [42, 24, "extractionPrismConsole", 0.58, 0.9],
      [-36, 11, "serverShardBollard", 0.58, 0.88],
      [22, -18, "brokenMirrorRack", 0.58, 0.88],
      [5, 4, "shardCondenser", 0.58, 0.88],
      [37, 25, "safeRouteMarker", 0.54, 0.9]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawArchiveCourtProductionSceneMass(game: Game, art: ArchiveCourtArtTextures): void {
    const placements: Array<[number, number, ArchiveCourtPropFrame, number, number]> = [
      [-31, 4, "witnessIndexTerminal", 0.68, 0.9],
      [-13, -18, "redactionStackShelves", 0.66, 0.9],
      [8, 13, "appealSealDais", 0.5, 0.9],
      [14, -5, "injunctionDocketRail", 0.64, 0.9],
      [32, -11, "redactorSaintBench", 0.62, 0.9],
      [42, 23, "courtWritGate", 0.54, 0.9],
      [-28, 6, "evidenceLantern", 0.58, 0.88],
      [7, 14, "evidenceLantern", 0.54, 0.88],
      [40, 24, "evidenceLantern", 0.54, 0.88],
      [-10, -16, "sealedEvidenceWrit", 0.58, 0.88],
      [5, 3, "archiveDrawerCluster", 0.62, 0.88],
      [34, -9, "redactionShelf", 0.58, 0.88],
      [44, 25, "safeRouteMarker", 0.52, 0.9]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawAppealCourtProductionSceneMass(game: Game, art: AppealCourtArtTextures): void {
    const placements: Array<[number, number, AppealCourtPropFrame, number, number]> = [
      [-34, 5, "openingArgumentPodium", 0.68, 0.9],
      [-16, -21, "witnessExhibitTable", 0.66, 0.9],
      [9, 15, "crossExamBench", 0.6, 0.9],
      [13, -5, "publicRulingSeal", 0.55, 0.9],
      [35, -13, "injunctionEngineDais", 0.72, 0.9],
      [47, 25, "publicRulingGate", 0.54, 0.9],
      [-31, 7, "publicRecordLantern", 0.56, 0.88],
      [8, 17, "publicRecordLantern", 0.52, 0.88],
      [45, 26, "publicRecordLantern", 0.52, 0.88],
      [-13, -19, "sealedAppealBrief", 0.56, 0.88],
      [5, 3, "verdictPylon", 0.62, 0.88],
      [35, -9, "rulingWitnessBench", 0.58, 0.88],
      [49, 27, "safeRouteMarker", 0.52, 0.9]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private drawAlignmentSpireProductionSceneMass(game: Game, art: AlignmentSpireFinaleArtTextures): void {
    const placements: Array<[number, number, AlignmentSpirePropFrame, number, number]> = [
      [-39, 2, "campRemnantCanopy", 0.68, 0.9],
      [-20, -24, "memoryRouteMouthLarge", 0.68, 0.9],
      [4, 16, "pixellabProofRingGate", 0.64, 0.84],
      [18, -3, "rulingCausewayClamp", 0.66, 0.9],
      [38, -8, "alignmentSpireNeedle", 0.72, 0.92],
      [49, 27, "outerAlignmentSpire", 0.64, 0.92],
      [-31, 4, "evidencePylon", 0.56, 0.88],
      [-18, -22, "memoryMouthPortal", 0.58, 0.9],
      [6, 18, "guardrailProofObelisk", 0.58, 0.9],
      [22, -2, "bossEchoConsole", 0.54, 0.88],
      [40, -6, "completionMouthPortal", 0.58, 0.9],
      [48, 29, "pixellabPredictionOrbs", 0.52, 0.8],
      [34, 32, "outerAlignmentSpire", 0.48, 0.92]
    ];
    for (const [worldX, worldY, frame, scale, anchorY] of placements) {
      const sprite = this.staticWorldSprite(art.props[frame], worldX, worldY, scale, anchorY, worldX + worldY + 0.1);
      game.layers.propsBehind.addChild(sprite);
    }
  }

  private staticWorldSprite(texture: Texture, worldX: number, worldY: number, scale: number, anchorY: number, zIndex: number): Sprite {
    const p = worldToIso(worldX, worldY);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, anchorY);
    sprite.scale.set(scale);
    sprite.position.set(p.screenX, p.screenY);
    sprite.zIndex = zIndex;
    return sprite;
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
    if (!getEnemyRoleVfxTextures() && !this.requestedEnemyRoleVfxLoad) {
      this.requestedEnemyRoleVfxLoad = true;
      void loadEnemyRoleVfxTextures().then(() => {
        if (game.state.current !== this) return;
        this.render(game);
      });
    }
    const textures = getMilestone11ArtTextures();
    if (!textures && !this.requestedProductionArtLoad) {
      this.requestedProductionArtLoad = true;
      void Promise.all([loadMilestone11Art(), loadMilestone12Art(), loadMilestone14Art(), loadMilestone49PlayableArt(), loadArmisticeSourceRebuildV2(), loadExtractionGateTextures(), loadPlayerDamageVfxTextures(), loadBuildWeaponVfxTextures(), loadEnemyRoleVfxTextures()]).then(() => {
        if (game.state.current !== this) return;
        this.staticArenaDrawn = false;
        this.render(game);
      });
    }
    return textures;
  }

  private prepareProductionSprites(game: Game): void {
    const art = this.productionArt(game);
    const coolingArt = this.coolingLakeArt(game);
    const transitArt = this.transitLoopArt(game);
    const signalArt = this.signalCoastArt(game);
    const blackwaterArt = this.blackwaterBeaconArt(game);
    const memoryArt = this.memoryCacheArt(game);
    const guardrailArt = this.guardrailForgeArt(game);
    const glassArt = this.glassSunfieldArt(game);
    const archiveArt = this.archiveCourtArt(game);
    const appealArt = this.appealCourtArt(game);
    const alignmentArt = this.alignmentSpireArt(game);
    if (!game.useMilestone10Art || (!art && !coolingArt && !transitArt && !signalArt && !blackwaterArt && !memoryArt && !guardrailArt && !glassArt && !archiveArt && !appealArt && !alignmentArt)) {
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

  private drawCoolingLakeGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-30, -20], [-16, -8], [-4, 1], [9, 6], [25, 20], [34, 29]], 0x45aaf2, 4.2, 0.2);
    this.drawIsoPolyline(graphics, [[-22, 17], [-12, 12], [-5, 8], [2, 4], [14, 9]], 0xff5d57, 3, 0.2);
    this.drawIsoPolyline(graphics, [[-12, 20], [-8, 13], [-7, 8], [-3, 2], [4, -6], [12, -17]], 0x99f6ff, 2.6, 0.18);
    for (const hazard of COOLING_LAKE_HAZARDS) {
      if (hazard.kind === "safe_island") continue;
      const p = worldToIso(hazard.worldX, hazard.worldY);
      const color = hazard.kind === "coolant_pool" ? 0x1c6d76 : hazard.kind === "electric_cable" ? 0xff5d57 : 0x99f6ff;
      graphics
        .ellipse(p.screenX, p.screenY, hazard.radiusX * 29, hazard.radiusY * 12)
        .fill({ color, alpha: hazard.kind === "electric_cable" ? 0.055 : 0.08 })
        .stroke({ color, width: 2, alpha: 0.16 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 5 === 0) this.drawTileChip(graphics, x + (hash % 3) * 0.25, y - (hash % 4) * 0.18, 0x0a1118, 0.28, 0.2 + (hash % 3) * 0.03);
      }
    }
  }

  private drawCoolingLakeGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 5, p.screenY + 9, landmark.radius * 29, landmark.radius * 10)
        .fill({ color: landmark.id.includes("buoy") ? 0x081c23 : 0x04080d, alpha: 0.16 });
      if (landmark.id.includes("buoy")) {
        graphics
          .circle(p.screenX, p.screenY - 28, 15)
          .fill({ color: landmark.color, alpha: 0.7 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.85 });
        graphics.rect(p.screenX - 5, p.screenY - 28, 10, 38).fill({ color: 0x0a1118, alpha: 0.8 });
      }
    }
    this.drawIsoPolyline(graphics, [[-25, 15], [-18, 15], [-8, 10], [0, 0], [13, 11], [25, 22]], 0x061017, 5, 0.44);
    this.drawIsoPolyline(graphics, [[-25, 16], [-18, 15], [-8, 10], [0, 0], [13, 11], [25, 22]], 0x64e0b4, 1.6, 0.28);
  }

  private drawCoolingLakeHazardDecals(graphics: Graphics): void {
    for (const hazard of COOLING_LAKE_HAZARDS) {
      const p = worldToIso(hazard.worldX, hazard.worldY);
      const active = this.coolingHazardActive(hazard);
      const color = hazard.kind === "safe_island" ? 0x64e0b4 : hazard.kind === "coolant_pool" ? 0x45aaf2 : hazard.kind === "electric_cable" ? 0xff5d57 : 0x99f6ff;
      const alpha = hazard.kind === "safe_island" ? 0.13 : active ? 0.22 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, hazard.radiusX * 27, hazard.radiusY * 11)
        .fill({ color, alpha: alpha * 0.35 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (hazard.kind === "electric_cable" && active) {
        graphics
          .moveTo(p.screenX - hazard.radiusX * 23, p.screenY)
          .lineTo(p.screenX - 10, p.screenY - 9)
          .lineTo(p.screenX + 9, p.screenY + 8)
          .lineTo(p.screenX + hazard.radiusX * 23, p.screenY)
          .stroke({ color, width: 2, alpha: 0.54 });
      }
    }
  }

  private drawCoolingLakeProductionHazardDecals(art: CoolingLakeNineArtTextures): void {
    for (const hazard of COOLING_LAKE_HAZARDS) {
      const active = this.coolingHazardActive(hazard);
      if (hazard.kind === "safe_island") {
        this.drawProductionEffectSprite(`cooling-safe:${hazard.id}`, art.vfx.buoyStabilize, hazard.worldX, hazard.worldY, 0.68, 0.72, hazard.worldX + hazard.worldY - 0.05, 0.34);
        continue;
      }
      const frame = this.coolingHazardFrame(hazard, active);
      const scale = hazard.kind === "coolant_pool" ? 1.18 : hazard.kind === "electric_cable" ? 1.08 : 0.96;
      const alpha = active ? 0.96 : 0.48;
      this.drawProductionEffectSprite(`cooling-hazard:${hazard.id}`, art.vfx[frame], hazard.worldX, hazard.worldY, scale, 0.72, hazard.worldX + hazard.worldY + 0.02, alpha, active ? Math.sin(this.seconds * 1.5 + hazard.pulseOffset) * 0.06 : 0);
      if (active && hazard.kind === "electric_cable") {
        this.drawProductionEffectSprite(`cooling-hazard-strike:${hazard.id}`, art.vfx.electricArc, hazard.worldX + 0.45, hazard.worldY - 0.25, 0.92, 0.72, hazard.worldX + hazard.worldY + 0.04, 0.74, -0.1);
      } else if (active && hazard.kind === "vent_pulse") {
        this.drawProductionEffectSprite(`cooling-vent-steam:${hazard.id}`, art.vfx.ventSteam, hazard.worldX - 0.25, hazard.worldY + 0.2, 0.82, 0.72, hazard.worldX + hazard.worldY + 0.05, 0.72, 0.08);
      }
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const frame = anchor.completed ? "buoyComplete" : "buoyStabilize";
      const alpha = anchor.completed ? 0.64 : 0.34 + (anchor.progress / 100) * 0.26;
      this.drawProductionEffectSprite(`cooling-buoy-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.72 : 0.58, 0.76, anchor.worldX + anchor.worldY + 0.06, alpha);
    }
  }

  private coolingHazardFrame(hazard: CoolingLakeHazardZone, active: boolean): CoolingHazardVfxFrame {
    if (hazard.kind === "coolant_pool") return active ? "coolantSplash" : "coolantIdle";
    if (hazard.kind === "electric_cable") return active ? "electricStrike" : "electricArc";
    if (hazard.kind === "vent_pulse") return active ? "ventShockwave" : "ventSteam";
    return "buoyStabilize";
  }

  private drawTransitLoopGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-24, 0], [-16, 1], [-8, -2], [0, -8], [9, -4], [17, 5], [27, -4]], 0x99f6ff, 5.2, 0.18);
    this.drawIsoPolyline(graphics, [[-16, 8], [-7, 8], [1, 6], [8, -16], [20, -8]], 0xff5d57, 3.2, 0.2);
    this.drawIsoPolyline(graphics, [[-20, -4], [-9, -10], [0, -8], [11, -12], [23, -5]], 0xffd166, 2.4, 0.2);
    for (const zone of TRANSIT_LOOP_ZONES) {
      if (zone.kind === "safe_platform") continue;
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "false_track" ? 0xff5d57 : zone.kind === "arrival_window" ? 0xffd166 : 0x99f6ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 28, zone.radiusY * 12)
        .fill({ color, alpha: 0.07 })
        .stroke({ color, width: 2, alpha: 0.15 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.16, y - (hash % 5) * 0.12, 0x05080d, 0.24, 0.18 + (hash % 3) * 0.03);
      }
    }
  }

  private drawTransitLoopGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 5, p.screenY + 9, landmark.radius * 28, landmark.radius * 10)
        .fill({ color: landmark.id.includes("platform") ? 0x07111a : 0x04070c, alpha: 0.16 });
      if (landmark.id.includes("platform")) {
        graphics
          .rect(p.screenX - 42, p.screenY - 32, 84, 18)
          .fill({ color: landmark.color, alpha: 0.76 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.86 });
        graphics.rect(p.screenX - 34, p.screenY - 14, 68, 18).fill({ color: 0x0a1118, alpha: 0.78 });
      }
      if (landmark.id === "station_that_arrives_gate") {
        graphics.rect(p.screenX - 56, p.screenY - 58, 112, 36).fill({ color: 0x111820, alpha: 0.82 }).stroke({ color: 0xffd166, width: 3, alpha: 0.72 });
        graphics.rect(p.screenX - 42, p.screenY - 18, 84, 18).fill({ color: 0xff5d57, alpha: 0.45 });
      }
    }
    this.drawIsoPolyline(graphics, [[-16, 1], [0, -8], [17, 5], [23, -5]], 0x05080d, 5, 0.42);
    this.drawIsoPolyline(graphics, [[-16, 1], [0, -8], [17, 5], [23, -5]], 0x99f6ff, 1.4, 0.34);
  }

  private drawTransitLoopZoneDecals(graphics: Graphics): void {
    for (const zone of TRANSIT_LOOP_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.transitZoneActive(zone);
      const color = zone.kind === "safe_platform" ? 0x64e0b4 : zone.kind === "false_track" ? 0xff5d57 : zone.kind === "arrival_window" ? 0xffd166 : 0x99f6ff;
      const alpha = zone.kind === "safe_platform" ? 0.12 : active ? 0.24 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "false_track" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 22, p.screenY - 6)
          .lineTo(p.screenX + zone.radiusX * 22, p.screenY + 6)
          .stroke({ color, width: 2, alpha: 0.46 });
      }
    }
  }

  private drawTransitLoopProductionZoneDecals(art: TransitLoopZeroArtTextures): void {
    for (const zone of TRANSIT_LOOP_ZONES) {
      const active = this.transitZoneActive(zone);
      const frame = this.transitZoneFrame(zone, active);
      const scale = zone.kind === "false_track" ? 0.72 : zone.kind === "arrival_window" ? 0.78 : zone.kind === "aligned_track" ? 0.74 : 0.62;
      const alpha = zone.kind === "safe_platform" ? 0.26 : active ? 0.74 : 0.34;
      this.drawProductionEffectSprite(`transit-zone:${zone.id}`, art.vfx[frame], zone.worldX, zone.worldY, scale, 0.72, zone.worldX + zone.worldY - 0.02, alpha);
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const frame = anchor.completed ? "routeSwitchReward" : "platformAlignBurst";
      const alpha = anchor.completed ? 0.62 : 0.28 + (anchor.progress / 100) * 0.32;
      this.drawProductionEffectSprite(`transit-platform-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.72 : 0.58, 0.72, anchor.worldX + anchor.worldY + 0.08, alpha);
    }
  }

  private transitZoneFrame(zone: TransitLoopZone, active: boolean): TransitHazardVfxFrame {
    if (zone.kind === "false_track") return active ? "falseTrackSurge" : "falseScheduleWave";
    if (zone.kind === "arrival_window") return active ? "stationArrivalShock" : "arrivalWindowRing";
    if (zone.kind === "aligned_track") return active ? "alignedTrackPulse" : "platformAlignBurst";
    return "platformAlignBurst";
  }

  private drawSignalCoastGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-29, 5], [-20, 5], [-10, 0], [1, -8], [12, -1], [18, 6], [30, -8]], 0x99f6ff, 4.8, 0.18);
    this.drawIsoPolyline(graphics, [[-31, 14], [-20, 11], [-7, 9], [6, 10], [20, 15], [36, 20]], 0x45aaf2, 5.6, 0.18);
    this.drawIsoPolyline(graphics, [[-10, -17], [-4, -12], [1, -8], [9, -1], [20, -6], [29, -11]], 0xffd166, 3.0, 0.22);
    this.drawIsoPolyline(graphics, [[-26, 1], [-18, 2], [-8, -2], [3, -8], [14, -1], [25, -9]], 0x05080d, 6.2, 0.34);
    for (const zone of SIGNAL_COAST_ZONES) {
      if (zone.kind === "safe_spit") continue;
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "corrupted_surf" ? 0x45aaf2 : zone.kind === "static_field" ? 0x7b61ff : zone.kind === "cable_arc" ? 0xffd166 : 0x99f6ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 28, zone.radiusY * 12)
        .fill({ color, alpha: 0.065 })
        .stroke({ color, width: 2, alpha: 0.16 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.18, y - (hash % 5) * 0.14, hash % 3 === 0 ? 0x0a1118 : 0x123f52, 0.24, 0.18 + (hash % 3) * 0.03);
      }
    }
  }

  private drawSignalCoastGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 6, p.screenY + 9, landmark.radius * 29, landmark.radius * 10)
        .fill({ color: landmark.id.includes("relay") ? 0x071a20 : 0x04070c, alpha: 0.16 });
      if (landmark.id.includes("relay")) {
        graphics
          .ellipse(p.screenX, p.screenY - 5, 50, 17)
          .fill({ color: landmark.color, alpha: 0.72 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.84 });
        graphics.rect(p.screenX - 5, p.screenY - 52, 10, 44).fill({ color: 0x0a1118, alpha: 0.86 });
        graphics.circle(p.screenX, p.screenY - 58, 10).fill({ color: landmark.accent, alpha: 0.66 }).stroke({ color: palette.ink, width: 2, alpha: 0.8 });
      }
      if (landmark.id === "lighthouse_that_answers_shelf") {
        graphics.rect(p.screenX - 20, p.screenY - 88, 40, 80).fill({ color: 0x111820, alpha: 0.88 }).stroke({ color: 0xffd166, width: 3, alpha: 0.74 });
        graphics.rect(p.screenX - 34, p.screenY - 104, 68, 20).fill({ color: 0xffd166, alpha: 0.46 }).stroke({ color: 0x99f6ff, width: 2, alpha: 0.62 });
      }
    }
    this.drawIsoPolyline(graphics, [[-20, 5], [1, -8], [18, 6], [26, -10]], 0x05080d, 5, 0.42);
    this.drawIsoPolyline(graphics, [[-20, 6], [1, -8], [18, 6], [26, -10]], 0x99f6ff, 1.4, 0.34);
  }

  private drawSignalCoastZoneDecals(graphics: Graphics): void {
    for (const zone of SIGNAL_COAST_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.signalCoastZoneActive(zone);
      const color = zone.kind === "safe_spit" ? 0x64e0b4 : zone.kind === "corrupted_surf" ? 0x45aaf2 : zone.kind === "static_field" ? 0x7b61ff : zone.kind === "cable_arc" ? 0xffd166 : 0x99f6ff;
      const alpha = zone.kind === "safe_spit" ? 0.12 : active ? 0.24 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "corrupted_surf" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 22, p.screenY - 4)
          .lineTo(p.screenX - 12, p.screenY + 8)
          .lineTo(p.screenX + 16, p.screenY - 7)
          .lineTo(p.screenX + zone.radiusX * 22, p.screenY + 5)
          .stroke({ color, width: 2, alpha: 0.5 });
      } else if (zone.kind === "cable_arc" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 22, p.screenY)
          .lineTo(p.screenX - 8, p.screenY - 10)
          .lineTo(p.screenX + 8, p.screenY + 9)
          .lineTo(p.screenX + zone.radiusX * 22, p.screenY)
          .stroke({ color, width: 2, alpha: 0.5 });
      }
    }
  }

  private drawSignalCoastProductionZoneDecals(art: SignalCoastArtTextures): void {
    for (const zone of SIGNAL_COAST_ZONES) {
      const active = this.signalCoastZoneActive(zone);
      const frame = this.signalCoastZoneFrame(zone, active);
      const scale = zone.kind === "corrupted_surf" ? 0.92 : zone.kind === "static_field" ? 0.76 : zone.kind === "cable_arc" ? 0.82 : zone.kind === "clear_signal_window" ? 0.74 : 0.58;
      const alpha = zone.kind === "safe_spit" ? 0.28 : active ? 0.76 : 0.32;
      this.drawProductionEffectSprite(`signal-zone:${zone.id}`, art.vfx[frame], zone.worldX, zone.worldY, scale, 0.72, zone.worldX + zone.worldY - 0.02, alpha);
      if (active && zone.kind === "cable_arc") {
        this.drawProductionEffectSprite(`signal-cable-strike:${zone.id}`, art.vfx.cableArcStrike, zone.worldX + 0.4, zone.worldY - 0.2, 0.72, 0.72, zone.worldX + zone.worldY + 0.03, 0.78, -0.08);
      }
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const frame = anchor.completed ? "relayCompletionFlash" : this.signalCoastClearWindowOpen() ? "relayCalibrationBurst" : "clearSignalPulse";
      const alpha = anchor.completed ? 0.64 : 0.26 + (anchor.progress / 100) * 0.34;
      this.drawProductionEffectSprite(`signal-relay-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.78 : 0.62, 0.72, anchor.worldX + anchor.worldY + 0.08, alpha);
    }
  }

  private signalCoastZoneFrame(zone: SignalCoastZone, active: boolean): SignalHazardVfxFrame {
    if (zone.kind === "corrupted_surf") return active ? "bossTidePulse" : "corruptedTideCrack";
    if (zone.kind === "static_field") return active ? "staticFieldShimmer" : "clearSignalPulse";
    if (zone.kind === "cable_arc") return active ? "cableArcStrike" : "skimmerJamSpark";
    if (zone.kind === "clear_signal_window") return active ? "clearSignalPulse" : "safeLaneReveal";
    return "safeLaneReveal";
  }

  private drawBlackwaterBeaconGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-34, 4], [-24, 6], [-7, 0], [0, -10], [8, -3], [20, 11], [34, -12]], 0x99f6ff, 4.8, 0.16);
    this.drawIsoPolyline(graphics, [[-37, 17], [-25, 16], [-10, 13], [4, 14], [20, 17], [35, 22]], 0x45aaf2, 6.2, 0.18);
    this.drawIsoPolyline(graphics, [[-16, -22], [-7, -17], [0, -10], [10, -1], [24, -9], [33, -13]], 0xffd166, 3.1, 0.22);
    this.drawIsoPolyline(graphics, [[-20, 4], [-8, 0], [4, -3], [13, -2], [21, 3]], 0x05080d, 6.6, 0.34);
    for (const zone of BLACKWATER_BEACON_ZONES) {
      if (zone.kind === "safe_platform") continue;
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "tidal_lane" ? 0x45aaf2 : zone.kind === "tidecall_static" ? 0x64e0b4 : zone.kind === "antenna_beam" ? 0xffd166 : 0x99f6ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 28, zone.radiusY * 12)
        .fill({ color, alpha: 0.06 })
        .stroke({ color, width: 2, alpha: 0.16 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.18, y - (hash % 5) * 0.14, hash % 3 === 0 ? 0x081722 : 0x173648, 0.23, 0.18 + (hash % 3) * 0.03);
      }
    }
  }

  private drawBlackwaterBeaconGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 6, p.screenY + 10, landmark.radius * 29, landmark.radius * 10)
        .fill({ color: landmark.id.includes("array") || landmark.id.includes("rotor") ? 0x071a20 : 0x04070c, alpha: 0.16 });
      if (landmark.id.includes("array") || landmark.id.includes("rotor")) {
        graphics
          .ellipse(p.screenX, p.screenY - 4, 54, 18)
          .fill({ color: landmark.color, alpha: 0.72 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.84 });
        graphics.rect(p.screenX - 6, p.screenY - 58, 12, 50).fill({ color: 0x0a1118, alpha: 0.86 });
        graphics.circle(p.screenX, p.screenY - 64, 11).fill({ color: landmark.accent, alpha: 0.64 }).stroke({ color: palette.ink, width: 2, alpha: 0.8 });
      }
      if (landmark.id === "maw_below_weather_shelf") {
        graphics.ellipse(p.screenX, p.screenY - 18, 72, 30).fill({ color: 0x05080d, alpha: 0.92 }).stroke({ color: 0xff5d57, width: 4, alpha: 0.78 });
        graphics.rect(p.screenX - 46, p.screenY - 48, 92, 18).fill({ color: 0xffd166, alpha: 0.22 }).stroke({ color: 0x99f6ff, width: 2, alpha: 0.48 });
      }
    }
    this.drawIsoPolyline(graphics, [[-24, 6], [0, -10], [20, 11], [30, -12]], 0x05080d, 5, 0.44);
    this.drawIsoPolyline(graphics, [[-24, 7], [0, -10], [20, 11], [30, -12]], 0x64e0b4, 1.4, 0.32);
  }

  private drawMemoryCacheGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-36, 5], [-30, 4], [-17, -6], [-13, -15], [2, -4], [10, -5], [29, -12], [38, 20]], 0x99f6ff, 4.8, 0.16);
    this.drawIsoPolyline(graphics, [[-28, -27], [-13, -15], [2, -5], [18, -7], [31, -13]], 0xff5d57, 4.6, 0.18);
    this.drawIsoPolyline(graphics, [[-16, 25], [6, 12], [21, 9], [36, 20]], 0x64e0b4, 5.6, 0.16);
    this.drawIsoPolyline(graphics, [[-7, -8], [8, -7], [21, 2], [31, 8]], 0xffd166, 3.0, 0.2);
    for (const zone of MEMORY_CACHE_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "safe_recall_pocket" ? 0x64e0b4 : zone.kind === "corrupted_archive_lane" ? 0xff5d57 : zone.kind === "risky_shortcut" ? 0xffd166 : zone.kind === "extraction_index" ? 0x99f6ff : 0x7b61ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: zone.kind === "safe_recall_pocket" ? 0.045 : 0.06 })
        .stroke({ color, width: 2, alpha: zone.kind === "safe_recall_pocket" ? 0.15 : 0.18 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.18, y - (hash % 5) * 0.14, hash % 3 === 0 ? 0x101820 : 0x223143, 0.22, 0.17 + (hash % 3) * 0.03);
      }
    }
  }

  private drawMemoryCacheGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 6, p.screenY + 10, landmark.radius * 28, landmark.radius * 10)
        .fill({ color: landmark.kind === "breach" ? 0x05080d : 0x07141c, alpha: 0.18 });
      if (landmark.id.includes("record") || landmark.id.includes("memory") || landmark.id.includes("shard")) {
        graphics
          .ellipse(p.screenX, p.screenY - 4, 56, 18)
          .fill({ color: landmark.color, alpha: 0.7 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.82 });
        graphics.rect(p.screenX - 30, p.screenY - 32, 60, 18).fill({ color: 0x0c141d, alpha: 0.75 }).stroke({ color: landmark.accent, width: 2, alpha: 0.42 });
      }
      if (landmark.id === "curator_vault") {
        graphics.ellipse(p.screenX, p.screenY - 16, 78, 30).fill({ color: 0x05080d, alpha: 0.92 }).stroke({ color: 0x7b61ff, width: 4, alpha: 0.78 });
        graphics.rect(p.screenX - 48, p.screenY - 46, 96, 18).fill({ color: 0x99f6ff, alpha: 0.2 }).stroke({ color: 0xff5d57, width: 2, alpha: 0.48 });
      }
      if (landmark.id === "extraction_index") {
        graphics.ellipse(p.screenX, p.screenY - 10, 72, 24).fill({ color: 0x152b32, alpha: 0.72 }).stroke({ color: 0xffd166, width: 3, alpha: 0.72 });
      }
    }
    this.drawIsoPolyline(graphics, [[-30, 4], [-13, -15], [6, 12], [29, -12], [36, 20]], 0x05080d, 5, 0.42);
    this.drawIsoPolyline(graphics, [[-30, 5], [-13, -15], [6, 12], [29, -12], [36, 20]], 0x99f6ff, 1.4, 0.32);
  }

  private drawGuardrailForgeGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-36, 5], [-28, 5], [-17, -5], [-9, -16], [2, -5], [12, -4], [30, -8], [38, 20]], 0xffd166, 4.8, 0.16);
    this.drawIsoPolyline(graphics, [[-28, -27], [-9, -16], [2, -6], [18, -8], [31, -9]], 0xff5d57, 4.6, 0.18);
    this.drawIsoPolyline(graphics, [[-17, 26], [8, 13], [20, 12], [38, 20]], 0x64e0b4, 5.6, 0.16);
    this.drawIsoPolyline(graphics, [[-7, -8], [12, -4], [22, 2], [31, 8]], 0x99f6ff, 3.0, 0.2);
    for (const zone of GUARDRAIL_FORGE_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "safe_hold_plate" ? 0x64e0b4 : zone.kind === "overload_lane" ? 0xff5d57 : zone.kind === "calibration_window" ? 0x99f6ff : zone.kind === "extraction_forge" ? 0xffd166 : 0x7b61ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: zone.kind === "safe_hold_plate" ? 0.045 : 0.06 })
        .stroke({ color, width: 2, alpha: zone.kind === "safe_hold_plate" ? 0.15 : 0.18 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.18, y - (hash % 5) * 0.14, hash % 3 === 0 ? 0x0f1c20 : 0x24333b, 0.22, 0.17 + (hash % 3) * 0.03);
      }
    }
  }

  private drawGuardrailForgeGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 6, p.screenY + 10, landmark.radius * 28, landmark.radius * 10)
        .fill({ color: landmark.kind === "breach" ? 0x05080d : 0x07141c, alpha: 0.18 });
      if (landmark.id.includes("relay") || landmark.id.includes("clamp") || landmark.id.includes("loom")) {
        graphics
          .ellipse(p.screenX, p.screenY - 4, 58, 18)
          .fill({ color: landmark.color, alpha: 0.7 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.82 });
        graphics.rect(p.screenX - 26, p.screenY - 42, 52, 28).fill({ color: 0x0c141d, alpha: 0.78 }).stroke({ color: landmark.accent, width: 2, alpha: 0.42 });
      }
      if (landmark.id === "audit_press_throne") {
        graphics.ellipse(p.screenX, p.screenY - 16, 80, 30).fill({ color: 0x05080d, alpha: 0.92 }).stroke({ color: 0x7b61ff, width: 4, alpha: 0.78 });
        graphics.rect(p.screenX - 50, p.screenY - 48, 100, 18).fill({ color: 0xffd166, alpha: 0.2 }).stroke({ color: 0xff5d57, width: 2, alpha: 0.48 });
      }
      if (landmark.id === "reward_quench_gate") {
        graphics.ellipse(p.screenX, p.screenY - 10, 74, 24).fill({ color: 0x152b32, alpha: 0.72 }).stroke({ color: 0xffd166, width: 3, alpha: 0.72 });
      }
    }
    this.drawIsoPolyline(graphics, [[-28, 5], [-9, -16], [8, 13], [30, -8], [38, 20]], 0x05080d, 5, 0.42);
    this.drawIsoPolyline(graphics, [[-28, 6], [-9, -16], [8, 13], [30, -8], [38, 20]], 0xffd166, 1.4, 0.32);
  }

  private drawGlassSunfieldGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-38, 4], [-30, 4], [-18, -5], [-12, -17], [2, -6], [13, -5], [31, -10], [40, 22]], 0xfff4d6, 5.0, 0.16);
    this.drawIsoPolyline(graphics, [[-30, -28], [-12, -17], [2, -7], [19, -9], [32, -10]], 0xff5d57, 4.8, 0.18);
    this.drawIsoPolyline(graphics, [[-18, 27], [8, 12], [22, 12], [40, 22]], 0x64e0b4, 5.8, 0.16);
    this.drawIsoPolyline(graphics, [[-8, -8], [13, -5], [23, 2], [33, 8]], 0x99f6ff, 3.2, 0.2);
    for (const zone of GLASS_SUNFIELD_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "shade_pocket" ? 0x64e0b4 : zone.kind === "exposed_glass_lane" ? 0xff5d57 : zone.kind === "prism_window" ? 0x99f6ff : zone.kind === "extraction_prism" ? 0xffd166 : 0xb8f3ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: zone.kind === "shade_pocket" ? 0.045 : 0.06 })
        .stroke({ color, width: 2, alpha: zone.kind === "shade_pocket" ? 0.15 : 0.18 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.18, y - (hash % 5) * 0.14, hash % 3 === 0 ? 0x122332 : 0x2d4050, 0.2, 0.17 + (hash % 3) * 0.03);
      }
    }
  }

  private drawGlassSunfieldGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 6, p.screenY + 10, landmark.radius * 28, landmark.radius * 10)
        .fill({ color: landmark.kind === "breach" ? 0x05080d : 0x07141c, alpha: 0.18 });
      if (landmark.id.includes("lens")) {
        graphics
          .ellipse(p.screenX, p.screenY - 4, 60, 18)
          .fill({ color: landmark.color, alpha: 0.7 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.82 });
        graphics.rect(p.screenX - 24, p.screenY - 44, 48, 30).fill({ color: 0x0d1722, alpha: 0.76 }).stroke({ color: landmark.accent, width: 2, alpha: 0.46 });
        graphics.circle(p.screenX, p.screenY - 46, 12).fill({ color: landmark.accent, alpha: 0.32 }).stroke({ color: 0xfff4d6, width: 2, alpha: 0.5 });
      }
      if (landmark.id === "wrong_sunrise_engine") {
        graphics.ellipse(p.screenX, p.screenY - 16, 84, 32).fill({ color: 0x05080d, alpha: 0.9 }).stroke({ color: 0xff5d57, width: 4, alpha: 0.78 });
        graphics.circle(p.screenX, p.screenY - 50, 22).fill({ color: 0xffd166, alpha: 0.2 }).stroke({ color: 0xfff4d6, width: 3, alpha: 0.58 });
      }
      if (landmark.id === "glass_prism_gate") {
        graphics.ellipse(p.screenX, p.screenY - 10, 76, 24).fill({ color: 0x1b3141, alpha: 0.72 }).stroke({ color: 0xffd166, width: 3, alpha: 0.72 });
      }
    }
    this.drawIsoPolyline(graphics, [[-30, 4], [-12, -17], [8, 12], [31, -10], [40, 22]], 0x05080d, 5, 0.42);
    this.drawIsoPolyline(graphics, [[-30, 5], [-12, -17], [8, 12], [31, -10], [40, 22]], 0xfff4d6, 1.4, 0.32);
  }

  private drawArchiveCourtGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-40, 4], [-31, 4], [-19, -6], [-13, -18], [1, -7], [14, -5], [32, -11], [42, 23]], 0x99f6ff, 5.0, 0.16);
    this.drawIsoPolyline(graphics, [[-32, -29], [-13, -18], [1, -8], [20, -10], [33, -11]], 0xff5d57, 4.8, 0.18);
    this.drawIsoPolyline(graphics, [[-18, 28], [8, 13], [23, 13], [42, 23]], 0xffd166, 5.8, 0.16);
    this.drawIsoPolyline(graphics, [[-8, -8], [14, -5], [24, 2], [34, 8]], 0x64e0b4, 3.2, 0.2);
    for (const zone of ARCHIVE_COURT_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "evidence_lantern" ? 0x64e0b4 : zone.kind === "redaction_field" ? 0xff5d57 : zone.kind === "appeal_window" ? 0x99f6ff : zone.kind === "extraction_court" ? 0xffd166 : 0xb8f3ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: zone.kind === "evidence_lantern" ? 0.045 : 0.06 })
        .stroke({ color, width: 2, alpha: zone.kind === "evidence_lantern" ? 0.15 : 0.18 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.18, y - (hash % 5) * 0.14, hash % 3 === 0 ? 0x101b24 : 0x293849, 0.2, 0.17 + (hash % 3) * 0.03);
      }
    }
  }

  private drawArchiveCourtGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 6, p.screenY + 10, landmark.radius * 28, landmark.radius * 10)
        .fill({ color: landmark.kind === "breach" ? 0x05080d : 0x07141c, alpha: 0.18 });
      if (landmark.id.includes("witness") || landmark.id.includes("seal") || landmark.id.includes("stack")) {
        graphics
          .ellipse(p.screenX, p.screenY - 4, 60, 18)
          .fill({ color: landmark.color, alpha: 0.7 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.82 });
        graphics.rect(p.screenX - 26, p.screenY - 44, 52, 30).fill({ color: 0x0d1722, alpha: 0.76 }).stroke({ color: landmark.accent, width: 2, alpha: 0.46 });
        graphics.rect(p.screenX - 31, p.screenY - 31, 62, 8).fill({ color: 0x05080d, alpha: 0.68 }).stroke({ color: 0xff5d57, width: 1.5, alpha: 0.5 });
      }
      if (landmark.id === "redactor_saint_bench") {
        graphics.ellipse(p.screenX, p.screenY - 16, 86, 32).fill({ color: 0x05080d, alpha: 0.9 }).stroke({ color: 0x7b61ff, width: 4, alpha: 0.78 });
        graphics.rect(p.screenX - 54, p.screenY - 49, 108, 16).fill({ color: 0x111820, alpha: 0.72 }).stroke({ color: 0xff5d57, width: 3, alpha: 0.58 });
      }
      if (landmark.id === "court_writ_gate") {
        graphics.ellipse(p.screenX, p.screenY - 10, 78, 24).fill({ color: 0x1b3141, alpha: 0.72 }).stroke({ color: 0xffd166, width: 3, alpha: 0.72 });
      }
    }
    this.drawIsoPolyline(graphics, [[-31, 4], [-13, -18], [8, 13], [32, -11], [42, 23]], 0x05080d, 5, 0.42);
    this.drawIsoPolyline(graphics, [[-31, 5], [-13, -18], [8, 13], [32, -11], [42, 23]], 0x99f6ff, 1.4, 0.32);
  }

  private drawAppealCourtGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-43, 5], [-34, 5], [-23, -7], [-16, -21], [1, -8], [17, -5], [35, -13], [47, 25]], 0x99f6ff, 5.0, 0.16);
    this.drawIsoPolyline(graphics, [[-36, -33], [-16, -21], [2, -10], [20, -12], [36, -13]], 0xff5d57, 4.9, 0.18);
    this.drawIsoPolyline(graphics, [[-18, 32], [9, 15], [26, 14], [47, 25]], 0xffd166, 5.9, 0.16);
    this.drawIsoPolyline(graphics, [[-8, -7], [9, 15], [20, 4], [35, -13]], 0x64e0b4, 3.3, 0.2);
    for (const zone of APPEAL_COURT_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "public_record" ? 0x64e0b4 : zone.kind === "verdict_beam" ? 0xff5d57 : zone.kind === "objection_window" ? 0x99f6ff : zone.kind === "extraction_ruling" ? 0xffd166 : 0x7b61ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: zone.kind === "public_record" ? 0.045 : 0.06 })
        .stroke({ color, width: 2, alpha: zone.kind === "public_record" ? 0.15 : 0.18 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.18, y - (hash % 5) * 0.14, hash % 3 === 0 ? 0x111824 : 0x293a49, 0.2, 0.17 + (hash % 3) * 0.03);
      }
    }
  }

  private drawAppealCourtGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 6, p.screenY + 10, landmark.radius * 28, landmark.radius * 10)
        .fill({ color: landmark.kind === "breach" ? 0x05080d : 0x07141c, alpha: 0.18 });
      if (landmark.id.includes("argument") || landmark.id.includes("exhibit") || landmark.id.includes("exam")) {
        graphics
          .ellipse(p.screenX, p.screenY - 4, 62, 18)
          .fill({ color: landmark.color, alpha: 0.7 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.82 });
        graphics.rect(p.screenX - 28, p.screenY - 44, 56, 30).fill({ color: 0x0d1722, alpha: 0.76 }).stroke({ color: landmark.accent, width: 2, alpha: 0.46 });
        graphics.rect(p.screenX - 32, p.screenY - 30, 64, 8).fill({ color: 0x101820, alpha: 0.7 }).stroke({ color: 0xffd166, width: 1.5, alpha: 0.5 });
      }
      if (landmark.id === "injunction_engine_dais") {
        graphics.ellipse(p.screenX, p.screenY - 16, 92, 34).fill({ color: 0x05080d, alpha: 0.9 }).stroke({ color: 0x7b61ff, width: 4, alpha: 0.78 });
        graphics.rect(p.screenX - 58, p.screenY - 50, 116, 16).fill({ color: 0x111820, alpha: 0.74 }).stroke({ color: 0xb8f3ff, width: 3, alpha: 0.6 });
      }
      if (landmark.id === "public_ruling_gate") {
        graphics.ellipse(p.screenX, p.screenY - 10, 82, 25).fill({ color: 0x1b3141, alpha: 0.72 }).stroke({ color: 0x64e0b4, width: 3, alpha: 0.72 });
      }
    }
    this.drawIsoPolyline(graphics, [[-34, 5], [-16, -21], [9, 15], [35, -13], [47, 25]], 0x05080d, 5, 0.42);
    this.drawIsoPolyline(graphics, [[-34, 5], [-16, -21], [9, 15], [35, -13], [47, 25]], 0x99f6ff, 1.4, 0.32);
  }

  private drawAlignmentSpireGrayboxGround(graphics: Graphics): void {
    this.drawIsoPolyline(graphics, [[-42, 2], [-39, 2], [-20, -24], [18, -3], [38, -8], [49, 27]], 0x99f6ff, 5.4, 0.16);
    this.drawIsoPolyline(graphics, [[-38, -36], [-20, -24], [12, -34], [38, -8]], 0xff5d57, 5.2, 0.18);
    this.drawIsoPolyline(graphics, [[-20, 39], [4, 16], [22, 37], [49, 27]], 0x7b61ff, 5.1, 0.17);
    this.drawIsoPolyline(graphics, [[-39, 2], [-2, 1], [4, 16], [18, -3], [49, 27]], 0xffd166, 3.3, 0.2);
    for (const zone of ALIGNMENT_SPIRE_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const color = zone.kind === "consensus_sanctum" ? 0x64e0b4 : zone.kind === "prediction_path" ? 0xff5d57 : zone.kind === "route_mouth" ? 0xffd166 : zone.kind === "extraction_alignment" ? 0xb8f3ff : 0x7b61ff;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: zone.kind === "consensus_sanctum" ? 0.04 : 0.058 })
        .stroke({ color, width: 2, alpha: zone.kind === "consensus_sanctum" ? 0.16 : 0.19 });
    }
    for (let y = this.map.bounds.minY; y <= this.map.bounds.maxY; y += 4) {
      for (let x = this.map.bounds.minX; x <= this.map.bounds.maxX; x += 5) {
        const hash = this.visualHash(x, y);
        if (hash % 6 === 0) this.drawTileChip(graphics, x + (hash % 4) * 0.2, y - (hash % 5) * 0.16, hash % 3 === 0 ? 0x101824 : hash % 3 === 1 ? 0x203447 : 0x2d153f, 0.2, 0.16 + (hash % 3) * 0.035);
      }
    }
  }

  private drawAlignmentSpireGrayboxSceneMass(graphics: Graphics): void {
    for (const landmark of this.map.landmarks) {
      const p = worldToIso(landmark.worldX, landmark.worldY);
      graphics
        .ellipse(p.screenX + 6, p.screenY + 11, landmark.radius * 29, landmark.radius * 10.5)
        .fill({ color: landmark.kind === "breach" ? 0x05080d : 0x07141c, alpha: 0.2 });
      if (landmark.id.includes("camp") || landmark.id.includes("guardrail") || landmark.id.includes("ruling")) {
        graphics
          .ellipse(p.screenX, p.screenY - 4, 68, 20)
          .fill({ color: landmark.color, alpha: 0.7 })
          .stroke({ color: landmark.accent, width: 3, alpha: 0.82 });
        graphics.rect(p.screenX - 31, p.screenY - 46, 62, 31).fill({ color: 0x0d1722, alpha: 0.76 }).stroke({ color: landmark.accent, width: 2, alpha: 0.48 });
        graphics.rect(p.screenX - 36, p.screenY - 31, 72, 8).fill({ color: 0x05080d, alpha: 0.7 }).stroke({ color: 0xffd166, width: 1.5, alpha: 0.48 });
      }
      if (landmark.id === "memory_route_mouth" || landmark.id === "agi_completion_throne") {
        graphics.ellipse(p.screenX, p.screenY - 14, 96, 36).fill({ color: 0x05080d, alpha: 0.88 }).stroke({ color: landmark.accent, width: 4, alpha: 0.74 });
        graphics.rect(p.screenX - 62, p.screenY - 53, 124, 18).fill({ color: landmark.color, alpha: 0.74 }).stroke({ color: landmark.accent, width: 3, alpha: 0.6 });
        graphics.moveTo(p.screenX - 36, p.screenY - 34).lineTo(p.screenX, p.screenY - 72).lineTo(p.screenX + 36, p.screenY - 34).stroke({ color: landmark.accent, width: 3, alpha: 0.48 });
      }
      if (landmark.id === "outer_alignment_gate") {
        graphics.ellipse(p.screenX, p.screenY - 10, 88, 27).fill({ color: 0x1b3141, alpha: 0.74 }).stroke({ color: 0x64e0b4, width: 3, alpha: 0.76 });
        graphics.rect(p.screenX - 54, p.screenY - 54, 108, 16).fill({ color: 0x101820, alpha: 0.7 }).stroke({ color: 0xb8f3ff, width: 3, alpha: 0.56 });
      }
    }
    this.drawIsoPolyline(graphics, [[-39, 2], [-20, -24], [4, 16], [18, -3], [38, -8], [49, 27]], 0x05080d, 5.2, 0.44);
    this.drawIsoPolyline(graphics, [[-39, 2], [-20, -24], [4, 16], [18, -3], [38, -8], [49, 27]], 0x99f6ff, 1.4, 0.34);
  }

  private drawBlackwaterBeaconZoneDecals(graphics: Graphics): void {
    for (const zone of BLACKWATER_BEACON_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.blackwaterZoneActive(zone);
      const color = zone.kind === "safe_platform" ? 0x64e0b4 : zone.kind === "tidal_lane" ? 0x45aaf2 : zone.kind === "tidecall_static" ? 0x64e0b4 : zone.kind === "antenna_beam" ? 0xffd166 : 0x99f6ff;
      const alpha = zone.kind === "safe_platform" ? 0.12 : active ? 0.24 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "tidal_lane" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 22, p.screenY - 4)
          .lineTo(p.screenX - 12, p.screenY + 9)
          .lineTo(p.screenX + 18, p.screenY - 8)
          .lineTo(p.screenX + zone.radiusX * 22, p.screenY + 6)
          .stroke({ color, width: 2, alpha: 0.5 });
      } else if (zone.kind === "signal_tower_warning" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 18, p.screenY)
          .lineTo(p.screenX + zone.radiusX * 18, p.screenY)
          .stroke({ color, width: 2, alpha: 0.44 });
      }
    }
  }

  private drawMemoryCacheZoneDecals(graphics: Graphics): void {
    for (const zone of MEMORY_CACHE_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.memoryCacheZoneActive(zone);
      const color = zone.kind === "safe_recall_pocket" ? 0x64e0b4 : zone.kind === "corrupted_archive_lane" ? 0xff5d57 : zone.kind === "risky_shortcut" ? 0xffd166 : zone.kind === "extraction_index" ? 0x99f6ff : 0x7b61ff;
      const alpha = zone.kind === "safe_recall_pocket" ? 0.12 : active ? 0.24 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "corrupted_archive_lane" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 20, p.screenY - 3)
          .lineTo(p.screenX - 9, p.screenY + 10)
          .lineTo(p.screenX + 16, p.screenY - 8)
          .lineTo(p.screenX + zone.radiusX * 20, p.screenY + 5)
          .stroke({ color, width: 2, alpha: 0.5 });
      } else if (zone.kind === "risky_shortcut" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 16, p.screenY)
          .lineTo(p.screenX + zone.radiusX * 16, p.screenY)
          .stroke({ color, width: 2, alpha: 0.42 });
      }
    }
  }

  private drawGuardrailForgeZoneDecals(graphics: Graphics): void {
    for (const zone of GUARDRAIL_FORGE_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.guardrailZoneActive(zone);
      const color = zone.kind === "safe_hold_plate" ? 0x64e0b4 : zone.kind === "overload_lane" ? 0xff5d57 : zone.kind === "calibration_window" ? 0x99f6ff : zone.kind === "extraction_forge" ? 0xffd166 : 0x7b61ff;
      const alpha = zone.kind === "safe_hold_plate" ? 0.12 : active ? 0.24 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "overload_lane" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 20, p.screenY - 3)
          .lineTo(p.screenX - 9, p.screenY + 10)
          .lineTo(p.screenX + 16, p.screenY - 8)
          .lineTo(p.screenX + zone.radiusX * 20, p.screenY + 5)
          .stroke({ color, width: 2, alpha: 0.5 });
      } else if (zone.kind === "calibration_window" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 16, p.screenY)
          .lineTo(p.screenX + zone.radiusX * 16, p.screenY)
          .stroke({ color, width: 2, alpha: 0.42 });
      }
    }
  }

  private drawGlassSunfieldZoneDecals(graphics: Graphics): void {
    for (const zone of GLASS_SUNFIELD_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.glassSunfieldZoneActive(zone);
      const color = zone.kind === "shade_pocket" ? 0x64e0b4 : zone.kind === "exposed_glass_lane" ? 0xff5d57 : zone.kind === "prism_window" ? 0x99f6ff : zone.kind === "extraction_prism" ? 0xffd166 : 0xb8f3ff;
      const alpha = zone.kind === "shade_pocket" ? 0.12 : active ? 0.24 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "exposed_glass_lane" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 20, p.screenY - 4)
          .lineTo(p.screenX - 12, p.screenY + 9)
          .lineTo(p.screenX + 18, p.screenY - 8)
          .lineTo(p.screenX + zone.radiusX * 20, p.screenY + 6)
          .stroke({ color, width: 2, alpha: 0.5 });
      } else if (zone.kind === "prism_window" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 16, p.screenY)
          .lineTo(p.screenX + zone.radiusX * 16, p.screenY)
          .stroke({ color, width: 2, alpha: 0.44 });
      } else if (zone.kind === "reflection_field" && active) {
        graphics.circle(p.screenX - 18, p.screenY - 4, 6).fill({ color, alpha: 0.28 });
        graphics.circle(p.screenX + 22, p.screenY + 3, 5).fill({ color, alpha: 0.24 });
      }
    }
  }

  private drawArchiveCourtZoneDecals(graphics: Graphics): void {
    for (const zone of ARCHIVE_COURT_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.archiveCourtZoneActive(zone);
      const color = zone.kind === "evidence_lantern" ? 0x64e0b4 : zone.kind === "redaction_field" ? 0xff5d57 : zone.kind === "appeal_window" ? 0x99f6ff : zone.kind === "extraction_court" ? 0xffd166 : 0xb8f3ff;
      const alpha = zone.kind === "evidence_lantern" ? 0.12 : active ? 0.24 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "redaction_field" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 20, p.screenY - 4)
          .lineTo(p.screenX - 10, p.screenY + 10)
          .lineTo(p.screenX + 16, p.screenY - 8)
          .lineTo(p.screenX + zone.radiusX * 20, p.screenY + 6)
          .stroke({ color, width: 2, alpha: 0.5 });
      } else if (zone.kind === "appeal_window" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 16, p.screenY)
          .lineTo(p.screenX + zone.radiusX * 16, p.screenY)
          .stroke({ color, width: 2, alpha: 0.44 });
      } else if (zone.kind === "writ_storm" && active) {
        graphics.rect(p.screenX - 24, p.screenY - 7, 48, 7).fill({ color, alpha: 0.22 }).stroke({ color: 0x05080d, width: 1, alpha: 0.42 });
        graphics.rect(p.screenX - 14, p.screenY + 2, 42, 6).fill({ color, alpha: 0.18 }).stroke({ color: 0x05080d, width: 1, alpha: 0.38 });
      }
    }
  }

  private drawAppealCourtZoneDecals(graphics: Graphics): void {
    for (const zone of APPEAL_COURT_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.appealCourtZoneActive(zone);
      const color = zone.kind === "public_record" ? 0x64e0b4 : zone.kind === "verdict_beam" ? 0xff5d57 : zone.kind === "objection_window" ? 0x99f6ff : zone.kind === "extraction_ruling" ? 0xffd166 : 0x7b61ff;
      const alpha = zone.kind === "public_record" ? 0.12 : active ? 0.24 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "verdict_beam" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 20, p.screenY - 4)
          .lineTo(p.screenX - 8, p.screenY + 10)
          .lineTo(p.screenX + 16, p.screenY - 8)
          .lineTo(p.screenX + zone.radiusX * 20, p.screenY + 6)
          .stroke({ color, width: 2, alpha: 0.5 });
      } else if (zone.kind === "objection_window" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 16, p.screenY)
          .lineTo(p.screenX + zone.radiusX * 16, p.screenY)
          .stroke({ color, width: 2, alpha: 0.44 });
      } else if (zone.kind === "injunction_ring" && active) {
        graphics.rect(p.screenX - 26, p.screenY - 8, 52, 8).fill({ color, alpha: 0.22 }).stroke({ color: 0x05080d, width: 1, alpha: 0.42 });
        graphics.rect(p.screenX - 15, p.screenY + 3, 44, 6).fill({ color, alpha: 0.18 }).stroke({ color: 0x05080d, width: 1, alpha: 0.38 });
      }
    }
  }

  private drawAlignmentSpireZoneDecals(graphics: Graphics): void {
    for (const zone of ALIGNMENT_SPIRE_ZONES) {
      const p = worldToIso(zone.worldX, zone.worldY);
      const active = this.alignmentSpireZoneActive(zone);
      const color = zone.kind === "consensus_sanctum" ? 0x64e0b4 : zone.kind === "prediction_path" ? 0xff5d57 : zone.kind === "route_mouth" ? 0xffd166 : zone.kind === "extraction_alignment" ? 0xb8f3ff : 0x7b61ff;
      const alpha = zone.kind === "consensus_sanctum" ? 0.12 : active ? 0.26 : 0.08;
      graphics
        .ellipse(p.screenX, p.screenY, zone.radiusX * 27, zone.radiusY * 11)
        .fill({ color, alpha: alpha * 0.34 })
        .stroke({ color, width: active ? 3 : 1.5, alpha });
      if (zone.kind === "prediction_path" && active) {
        graphics
          .moveTo(p.screenX - zone.radiusX * 20, p.screenY - 4)
          .lineTo(p.screenX - 8, p.screenY + 10)
          .lineTo(p.screenX + 16, p.screenY - 8)
          .lineTo(p.screenX + zone.radiusX * 20, p.screenY + 6)
          .stroke({ color, width: 2, alpha: 0.52 });
      } else if (zone.kind === "route_mouth" && active) {
        graphics.ellipse(p.screenX, p.screenY - 8, 58, 20).stroke({ color, width: 3, alpha: 0.46 }).fill({ color, alpha: 0.12 });
        graphics.ellipse(p.screenX, p.screenY - 8, 32, 10).stroke({ color: 0x05080d, width: 2, alpha: 0.5 });
      } else if (zone.kind === "boss_echo" && active) {
        graphics.rect(p.screenX - 26, p.screenY - 8, 52, 8).fill({ color, alpha: 0.22 }).stroke({ color: 0x05080d, width: 1, alpha: 0.42 });
        graphics.rect(p.screenX - 15, p.screenY + 3, 44, 6).fill({ color, alpha: 0.18 }).stroke({ color: 0x05080d, width: 1, alpha: 0.38 });
      }
    }
  }

  private drawAlignmentSpireProductionZoneDecals(art: AlignmentSpireFinaleArtTextures): void {
    for (const zone of ALIGNMENT_SPIRE_ZONES) {
      const active = this.alignmentSpireZoneActive(zone);
      const frame = this.alignmentSpireVfxFrameForZone(zone, active);
      const scale =
        zone.kind === "prediction_path"
          ? Math.max(0.76, zone.radiusX / 28)
          : zone.kind === "route_mouth"
            ? 0.82
            : zone.kind === "extraction_alignment"
              ? 0.88
              : 0.66;
      const alpha = zone.kind === "consensus_sanctum" ? 0.34 : active ? 0.74 : 0.26;
      this.drawProductionEffectSprite(
        `alignment-zone:${zone.id}`,
        art.vfx[frame],
        zone.worldX,
        zone.worldY,
        scale,
        0.74,
        zone.worldX + zone.worldY - 0.18,
        alpha,
        zone.kind === "prediction_path" ? -0.08 : 0
      );
      if (active && zone.kind === "route_mouth") {
        this.drawProductionEffectSprite(
          `alignment-route-mouth-core:${zone.id}`,
          art.vfx.predictionSpiral,
          zone.worldX + 0.35,
          zone.worldY - 0.2,
          scale * 0.68,
          0.72,
          zone.worldX + zone.worldY - 0.1,
          0.42 + Math.sin(this.seconds * 4.7 + zone.pulseOffset) * 0.1,
          -0.05
        );
      }
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const frame = anchor.completed ? "amberProofBurst" : this.alignmentSpireProofJammed(anchor) ? "predictionCrack" : "pixellabProofSeal";
      const alpha = anchor.completed ? 0.66 : 0.3 + (anchor.progress / 100) * 0.32;
      this.drawProductionEffectSprite(`alignment-proof-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.44 : 0.58, 0.72, anchor.worldX + anchor.worldY + 0.08, alpha);
    }
  }

  private alignmentSpireVfxFrameForZone(zone: AlignmentSpireZone, active: boolean): AlignmentSpireHazardVfxFrame {
    if (zone.kind === "consensus_sanctum") return active ? "pixellabProofSeal" : "consensusRing";
    if (zone.kind === "prediction_path") return active ? "predictionSlash" : "predictionCrack";
    if (zone.kind === "route_mouth") return active ? "predictionSpiral" : "pixellabPredictionOrbs";
    if (zone.kind === "boss_echo") return active ? "bossEchoRing" : "violetAlignmentBeam";
    if (zone.kind === "extraction_alignment") return active ? "extractionBeamGate" : "cyanProofBurst";
    return "completionStarburst";
  }

  private drawMemoryCacheProductionZoneDecals(art: MemoryCacheArtTextures): void {
    for (const zone of MEMORY_CACHE_ZONES) {
      const active = this.memoryCacheZoneActive(zone);
      const frame = this.memoryCacheVfxFrameForZone(zone, active);
      const scale =
        zone.kind === "corrupted_archive_lane"
          ? Math.max(0.78, zone.radiusX / 22)
          : zone.kind === "risky_shortcut"
            ? 0.78
            : zone.kind === "redaction_field"
              ? 0.82
              : zone.kind === "extraction_index"
                ? 0.74
                : 0.62;
      const alpha = zone.kind === "safe_recall_pocket" ? 0.34 : active ? 0.74 : 0.28;
      this.drawProductionEffectSprite(
        `memory-zone:${zone.id}`,
        art.vfx[frame],
        zone.worldX,
        zone.worldY,
        scale,
        0.74,
        zone.worldX + zone.worldY - 0.18,
        alpha,
        zone.kind === "risky_shortcut" ? -0.06 : 0
      );
      if (active && zone.kind === "corrupted_archive_lane") {
        this.drawProductionEffectSprite(
          `memory-rot-trail:${zone.id}`,
          art.vfx.contextRotTrail,
          zone.worldX + 0.6,
          zone.worldY - 0.2,
          scale * 0.72,
          0.76,
          zone.worldX + zone.worldY - 0.12,
          0.48 + Math.sin(this.seconds * 4.6 + zone.pulseOffset) * 0.08,
          -0.08
        );
      }
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const frame = anchor.completed ? "routeRewardPulse" : this.memoryCacheSafeRecallForAnchor(anchor) ? "recoveryBurst" : "recordFlare";
      const alpha = anchor.completed ? 0.64 : 0.28 + (anchor.progress / 100) * 0.32;
      this.drawProductionEffectSprite(`memory-record-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.78 : 0.62, 0.72, anchor.worldX + anchor.worldY + 0.08, alpha);
    }
  }

  private memoryCacheVfxFrameForZone(zone: MemoryCacheZone, active: boolean): MemoryCacheHazardVfxFrame {
    if (zone.kind === "safe_recall_pocket") return active ? "recoveryBurst" : "recallRing";
    if (zone.kind === "corrupted_archive_lane") return active ? "corruptionStaticPool" : "warningCrack";
    if (zone.kind === "risky_shortcut") return active ? "shortcutSpark" : "contextRotTrail";
    if (zone.kind === "redaction_field") return active ? "redactionPulse" : "curatorLockRing";
    if (zone.kind === "extraction_index") return active ? "extractionBeam" : "routeRewardPulse";
    return "recordFlare";
  }

  private drawGuardrailForgeProductionZoneDecals(art: GuardrailForgeArtTextures): void {
    for (const zone of GUARDRAIL_FORGE_ZONES) {
      const active = this.guardrailZoneActive(zone);
      const frame = this.guardrailForgeVfxFrameForZone(zone, active);
      const scale =
        zone.kind === "overload_lane"
          ? Math.max(0.7, zone.radiusX / 14)
          : zone.kind === "doctrine_press"
            ? 0.76
            : zone.kind === "extraction_forge"
              ? 0.72
              : 0.62;
      const alpha = zone.kind === "safe_hold_plate" ? 0.36 : active ? 0.72 : 0.26;
      this.drawProductionEffectSprite(
        `guardrail-zone:${zone.id}`,
        art.vfx[frame],
        zone.worldX,
        zone.worldY,
        scale,
        0.74,
        zone.worldX + zone.worldY - 0.18,
        alpha,
        zone.kind === "overload_lane" ? -0.08 : 0
      );
      if (active && zone.kind === "doctrine_press") {
        this.drawProductionEffectSprite(
          `guardrail-press-lock:${zone.id}`,
          art.vfx.auditPressLock,
          zone.worldX + 0.5,
          zone.worldY - 0.25,
          scale * 0.72,
          0.76,
          zone.worldX + zone.worldY - 0.12,
          0.44 + Math.sin(this.seconds * 4.8 + zone.pulseOffset) * 0.08,
          -0.06
        );
      }
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const safeHold = this.guardrailSafeHoldForAnchor(anchor);
      const frame = anchor.completed ? "relayCompleteFlare" : safeHold ? "safeHoldRing" : "calibrationSpark";
      const alpha = anchor.completed ? 0.64 : 0.28 + (anchor.progress / 100) * 0.32;
      this.drawProductionEffectSprite(`guardrail-relay-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.78 : 0.62, 0.72, anchor.worldX + anchor.worldY + 0.08, alpha);
    }
  }

  private guardrailForgeVfxFrameForZone(zone: GuardrailForgeZone, active: boolean): GuardrailHazardVfxFrame {
    if (zone.kind === "safe_hold_plate") return active ? "safeHoldRing" : "relayCompleteFlare";
    if (zone.kind === "overload_lane") return active ? "overloadLane" : "warningSweep";
    if (zone.kind === "calibration_window") return active ? "calibrationSpark" : "projectileSpark";
    if (zone.kind === "doctrine_press") return active ? "doctrineJamPulse" : "auditPressLock";
    if (zone.kind === "extraction_forge") return active ? "quenchBeam" : "shardRewardBurst";
    return "bossPressureBurst";
  }

  private drawGlassSunfieldProductionZoneDecals(art: GlassSunfieldArtTextures): void {
    for (const zone of GLASS_SUNFIELD_ZONES) {
      const active = this.glassSunfieldZoneActive(zone);
      const frame = this.glassSunfieldVfxFrameForZone(zone, active);
      const scale =
        zone.kind === "exposed_glass_lane"
          ? Math.max(0.72, zone.radiusX / 24)
          : zone.kind === "reflection_field"
            ? 0.78
            : zone.kind === "extraction_prism"
              ? 0.74
              : 0.62;
      const alpha = zone.kind === "shade_pocket" ? 0.34 : active ? 0.72 : 0.26;
      this.drawProductionEffectSprite(
        `glass-zone:${zone.id}`,
        art.vfx[frame],
        zone.worldX,
        zone.worldY,
        scale,
        0.74,
        zone.worldX + zone.worldY - 0.18,
        alpha,
        zone.kind === "exposed_glass_lane" ? -0.08 : 0
      );
      if (active && zone.kind === "reflection_field") {
        this.drawProductionEffectSprite(
          `glass-reflection-jam:${zone.id}`,
          art.vfx.reflectionJamPulse,
          zone.worldX + 0.45,
          zone.worldY - 0.25,
          scale * 0.72,
          0.74,
          zone.worldX + zone.worldY - 0.12,
          0.44 + Math.sin(this.seconds * 4.8 + zone.pulseOffset) * 0.08,
          -0.06
        );
      }
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const frame = anchor.completed ? "lensCompleteBurst" : this.glassSunfieldShadeForAnchor(anchor) ? "shadePocketRing" : "prismWindowFlare";
      const alpha = anchor.completed ? 0.64 : 0.28 + (anchor.progress / 100) * 0.32;
      this.drawProductionEffectSprite(`glass-lens-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.78 : 0.62, 0.72, anchor.worldX + anchor.worldY + 0.08, alpha);
    }
  }

  private glassSunfieldVfxFrameForZone(zone: GlassSunfieldZone, active: boolean): GlassSunfieldHazardVfxFrame {
    if (zone.kind === "shade_pocket") return active ? "shadePocketRing" : "warningShimmer";
    if (zone.kind === "exposed_glass_lane") return active ? "exposedGlassBurn" : "warningShimmer";
    if (zone.kind === "prism_window") return active ? "prismWindowFlare" : "solarProjectileShard";
    if (zone.kind === "reflection_field") return active ? "reflectionJamPulse" : "choirglassImpact";
    if (zone.kind === "extraction_prism") return active ? "prismExtractionBeam" : "shardRewardBurst";
    return "bossCollapseFragments";
  }

  private drawArchiveCourtProductionZoneDecals(art: ArchiveCourtArtTextures): void {
    for (const zone of ARCHIVE_COURT_ZONES) {
      const active = this.archiveCourtZoneActive(zone);
      const frame = this.archiveCourtVfxFrameForZone(zone, active);
      const scale =
        zone.kind === "redaction_field" || zone.kind === "writ_storm"
          ? Math.max(0.72, zone.radiusX / 24)
          : zone.kind === "extraction_court"
            ? 0.74
            : 0.62;
      const alpha = zone.kind === "evidence_lantern" ? 0.34 : active ? 0.72 : 0.26;
      this.drawProductionEffectSprite(
        `archive-zone:${zone.id}`,
        art.vfx[frame],
        zone.worldX,
        zone.worldY,
        scale,
        0.74,
        zone.worldX + zone.worldY - 0.18,
        alpha,
        zone.kind === "redaction_field" ? -0.08 : 0
      );
      if (active && zone.kind === "writ_storm") {
        this.drawProductionEffectSprite(
          `archive-writ-storm:${zone.id}`,
          art.vfx.writStormB,
          zone.worldX + 0.45,
          zone.worldY - 0.25,
          scale * 0.72,
          0.74,
          zone.worldX + zone.worldY - 0.12,
          0.44 + Math.sin(this.seconds * 4.8 + zone.pulseOffset) * 0.08,
          -0.06
        );
      }
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const frame = anchor.completed ? "evidenceGlow" : this.archiveCourtWritJammed(anchor) ? "redactionSlash" : "evidenceGlow";
      const alpha = anchor.completed ? 0.64 : 0.28 + (anchor.progress / 100) * 0.32;
      this.drawProductionEffectSprite(`archive-writ-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.42 : 0.54, 0.72, anchor.worldX + anchor.worldY + 0.08, alpha);
    }
  }

  private archiveCourtVfxFrameForZone(zone: ArchiveCourtZone, active: boolean): ArchiveCourtHazardVfxFrame {
    if (zone.kind === "evidence_lantern") return active ? "evidenceGlow" : "cyanProjectile";
    if (zone.kind === "redaction_field") return active ? "redactionSlash" : "redProjectile";
    if (zone.kind === "writ_storm") return active ? "writStormA" : "violetProjectile";
    if (zone.kind === "appeal_window") return active ? "appealWindowRing" : "amberProjectile";
    if (zone.kind === "extraction_court") return active ? "writExtraction" : "courtSeal";
    return "redactionBurn";
  }

  private drawAppealCourtProductionZoneDecals(art: AppealCourtArtTextures): void {
    for (const zone of APPEAL_COURT_ZONES) {
      const active = this.appealCourtZoneActive(zone);
      const frame = this.appealCourtVfxFrameForZone(zone, active);
      const scale =
        zone.kind === "verdict_beam" || zone.kind === "injunction_ring"
          ? Math.max(0.72, zone.radiusX / 24)
          : zone.kind === "extraction_ruling"
            ? 0.74
            : 0.62;
      const alpha = zone.kind === "public_record" ? 0.34 : active ? 0.72 : 0.26;
      this.drawProductionEffectSprite(
        `appeal-zone:${zone.id}`,
        art.vfx[frame],
        zone.worldX,
        zone.worldY,
        scale,
        0.74,
        zone.worldX + zone.worldY - 0.18,
        alpha,
        zone.kind === "verdict_beam" ? -0.08 : 0
      );
      if (active && zone.kind === "injunction_ring") {
        this.drawProductionEffectSprite(
          `appeal-injunction-ring:${zone.id}`,
          art.vfx.injunctionRingB,
          zone.worldX + 0.45,
          zone.worldY - 0.25,
          scale * 0.72,
          0.74,
          zone.worldX + zone.worldY - 0.12,
          0.44 + Math.sin(this.seconds * 4.8 + zone.pulseOffset) * 0.08,
          -0.06
        );
      }
    }
    for (const anchor of this.treatyAnchorObjective.anchors) {
      const frame = anchor.completed ? "briefGlow" : this.appealCourtBriefJammed(anchor) ? "verdictBeam" : "publicRecordRing";
      const alpha = anchor.completed ? 0.64 : 0.28 + (anchor.progress / 100) * 0.32;
      this.drawProductionEffectSprite(`appeal-brief-vfx:${anchor.id}`, art.vfx[frame], anchor.worldX, anchor.worldY, anchor.completed ? 0.42 : 0.54, 0.72, anchor.worldX + anchor.worldY + 0.08, alpha);
    }
  }

  private appealCourtVfxFrameForZone(zone: AppealCourtZone, active: boolean): AppealCourtHazardVfxFrame {
    if (zone.kind === "public_record") return active ? "publicRecordRing" : "cyanProjectile";
    if (zone.kind === "verdict_beam") return active ? "verdictBeam" : "amberProjectile";
    if (zone.kind === "injunction_ring") return active ? "injunctionRingA" : "violetProjectile";
    if (zone.kind === "objection_window") return active ? "objectionWindowRing" : "shardRewardBurst";
    if (zone.kind === "extraction_ruling") return active ? "rulingExtraction" : "rulingSeal";
    return "briefGlow";
  }

  private drawBlackwaterBeaconProductionZoneDecals(art: BlackwaterBeaconArtTextures): void {
    for (const zone of BLACKWATER_BEACON_ZONES) {
      if (zone.kind === "safe_platform") continue;
      const active = this.blackwaterZoneActive(zone);
      const frame = this.blackwaterVfxFrameForZone(zone, active);
      const scale = zone.kind === "tidal_lane" ? Math.max(0.72, zone.radiusX / 13.5) : zone.kind === "signal_tower_warning" ? 0.72 : zone.kind === "antenna_beam" ? 0.68 : 0.78;
      const alpha = active ? (zone.kind === "tidal_lane" ? 0.72 : 0.64) : 0.26;
      this.drawProductionEffectSprite(
        `blackwater-zone:${zone.id}`,
        art.vfx[frame],
        zone.worldX,
        zone.worldY,
        scale,
        0.76,
        zone.worldX + zone.worldY - 0.34,
        alpha,
        zone.kind === "antenna_beam" ? -0.08 : 0
      );
      if (zone.kind === "tidal_lane" && active) {
        this.drawProductionEffectSprite(
          `blackwater-wave:${zone.id}`,
          art.vfx.tidalWave,
          zone.worldX + 0.5,
          zone.worldY - 0.15,
          scale * 0.72,
          0.82,
          zone.worldX + zone.worldY - 0.25,
          0.58 + Math.sin(this.seconds * 4.8 + zone.pulseOffset) * 0.08
        );
      }
    }
  }

  private blackwaterVfxFrameForZone(zone: BlackwaterZone, active: boolean): BlackwaterHazardVfxFrame {
    if (zone.kind === "tidal_lane") return active ? "tidalWave" : "tidalIdle";
    if (zone.kind === "tidecall_static") return active ? "staticInterrupt" : "tidecallStatic";
    if (zone.kind === "signal_tower_warning") return "signalTowerWarning";
    if (zone.kind === "antenna_beam") return active ? "antennaBeam" : "antennaRetune";
    return "antennaRetune";
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
    if (this.isAlignmentSpireFinaleArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const alignmentArt = this.alignmentSpireArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.2) * 0.18;
        if (alignmentArt) {
          this.drawProductionEffectSprite("alignment-agi-proof-seal", alignmentArt.vfx.pixellabProofSeal, bossX, bossY + 0.15, 0.9 + pulse * 0.04, 0.78, bossX + bossY - 0.16, 0.52 + pulse * 0.12);
          this.drawProductionEffectSprite("alignment-agi-boss-echo", alignmentArt.vfx.bossEchoRing, bossX - 0.18, bossY + 0.05, 0.74, 0.74, bossX + bossY - 0.08, 0.42 + pulse * 0.12, -0.06);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .ellipse(p.screenX, p.screenY + 6, 108, 31)
            .fill({ color: 0x05080d, alpha: 0.08 + pulse * 0.06 })
            .stroke({ color: 0xff5d57, width: 3, alpha: 0.28 + pulse * 0.18 });
        }
        const zone = ALIGNMENT_SPIRE_ZONES.find((candidate) => candidate.id === this.alienGodIntelligence.lastPredictionZoneId);
        if (zone) this.drawIsoPolyline(this.decalsGraphics, [[bossX, bossY], [zone.worldX, zone.worldY]], 0xff5d57, 3, 0.34 + pulse * 0.16);
      }
      return;
    }
    if (this.isAppealCourtArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const appealArt = this.appealCourtArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.2) * 0.18;
        if (appealArt) {
          this.drawProductionEffectSprite("appeal-injunction-engine-seal", appealArt.vfx.rulingSeal, bossX, bossY + 0.15, 0.9 + pulse * 0.04, 0.78, bossX + bossY - 0.16, 0.52 + pulse * 0.12);
          this.drawProductionEffectSprite("appeal-injunction-engine-ring", appealArt.vfx.injunctionRingB, bossX - 0.22, bossY + 0.05, 0.76, 0.74, bossX + bossY - 0.08, 0.42 + pulse * 0.12, -0.06);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .ellipse(p.screenX, p.screenY + 6, 104, 30)
            .fill({ color: 0x05080d, alpha: 0.08 + pulse * 0.06 })
            .stroke({ color: 0x7b61ff, width: 3, alpha: 0.28 + pulse * 0.18 });
        }
        const zone = APPEAL_COURT_ZONES.find((candidate) => candidate.id === this.injunctionEngine.lastVerdictZoneId);
        if (zone) this.drawIsoPolyline(this.decalsGraphics, [[bossX, bossY], [zone.worldX, zone.worldY]], 0x7b61ff, 3, 0.34 + pulse * 0.16);
      }
      return;
    }
    if (this.isArchiveCourtArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const archiveArt = this.archiveCourtArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.2) * 0.18;
        if (archiveArt) {
          this.drawProductionEffectSprite("archive-redactor-saint-seal", archiveArt.vfx.courtSeal, bossX, bossY + 0.15, 0.9 + pulse * 0.04, 0.78, bossX + bossY - 0.16, 0.52 + pulse * 0.12);
          this.drawProductionEffectSprite("archive-redactor-saint-redaction", archiveArt.vfx.redactionBurn, bossX - 0.22, bossY + 0.05, 0.76, 0.74, bossX + bossY - 0.08, 0.42 + pulse * 0.12, -0.06);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .ellipse(p.screenX, p.screenY + 6, 100, 28)
            .fill({ color: 0x05080d, alpha: 0.08 + pulse * 0.06 })
            .stroke({ color: 0x7b61ff, width: 3, alpha: 0.28 + pulse * 0.18 });
        }
        const zone = ARCHIVE_COURT_ZONES.find((candidate) => candidate.id === this.redactorSaint.lastRedactionZoneId);
        if (zone) this.drawIsoPolyline(this.decalsGraphics, [[bossX, bossY], [zone.worldX, zone.worldY]], 0xff5d57, 3, 0.34 + pulse * 0.16);
      }
      return;
    }
    if (this.isGlassSunfieldArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const glassArt = this.glassSunfieldArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.2) * 0.18;
        if (glassArt) {
          this.drawProductionEffectSprite("glass-wrong-sunrise-contact", glassArt.vfx.reflectionJamPulse, bossX, bossY + 0.15, 0.9 + pulse * 0.04, 0.78, bossX + bossY - 0.16, 0.5 + pulse * 0.12);
          this.drawProductionEffectSprite("glass-wrong-sunrise-beam", glassArt.vfx.wrongSunriseBeam, bossX + 0.25, bossY - 0.15, 0.78, 0.72, bossX + bossY - 0.08, 0.42 + pulse * 0.12, -0.08);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .ellipse(p.screenX, p.screenY + 6, 98, 28)
            .fill({ color: 0x05080d, alpha: 0.08 + pulse * 0.06 })
            .stroke({ color: 0xffd166, width: 3, alpha: 0.28 + pulse * 0.18 });
        }
        const zone = GLASS_SUNFIELD_ZONES.find((candidate) => candidate.id === this.wrongSunrise.lastBeamZoneId);
        if (zone) this.drawIsoPolyline(this.decalsGraphics, [[bossX, bossY], [zone.worldX, zone.worldY]], 0xffd166, 3, 0.34 + pulse * 0.16);
      }
      return;
    }
    if (this.isGuardrailForgeArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.2) * 0.18;
        const p = worldToIso(bossX, bossY);
        this.decalsGraphics
          .ellipse(p.screenX, p.screenY + 6, 98, 28)
          .fill({ color: 0x05080d, alpha: 0.08 + pulse * 0.06 })
          .stroke({ color: 0xffd166, width: 3, alpha: 0.28 + pulse * 0.18 });
        const zone = GUARDRAIL_FORGE_ZONES.find((candidate) => candidate.id === this.doctrineAuditor.lastPressZoneId);
        if (zone) this.drawIsoPolyline(this.decalsGraphics, [[bossX, bossY], [zone.worldX, zone.worldY]], 0xffd166, 3, 0.34 + pulse * 0.16);
      }
      return;
    }
    if (this.isMemoryCacheArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const memoryArt = this.memoryCacheArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.2) * 0.18;
        if (memoryArt) {
          this.drawProductionEffectSprite("memory-curator-lock-ring", memoryArt.vfx.curatorLockRing, bossX, bossY + 0.15, 0.9 + pulse * 0.04, 0.78, bossX + bossY - 0.16, 0.52 + pulse * 0.12);
          this.drawProductionEffectSprite("memory-curator-redaction-pulse", memoryArt.vfx.redactionPulse, bossX - 0.25, bossY + 0.05, 0.72, 0.74, bossX + bossY - 0.08, 0.42 + pulse * 0.12, -0.06);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .ellipse(p.screenX, p.screenY + 6, 96, 28)
            .fill({ color: 0x05080d, alpha: 0.08 + pulse * 0.06 })
            .stroke({ color: 0x7b61ff, width: 3, alpha: 0.28 + pulse * 0.18 });
        }
        const zone = MEMORY_CACHE_ZONES.find((candidate) => candidate.id === this.memoryCurator.lastRedactionZoneId);
        if (zone) this.drawIsoPolyline(this.decalsGraphics, [[bossX, bossY], [zone.worldX, zone.worldY]], 0x99f6ff, 3, 0.34 + pulse * 0.16);
      }
      return;
    }
    if (this.isBlackwaterBeaconArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const blackwaterArt = this.blackwaterBeaconArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.2) * 0.18;
        if (blackwaterArt) {
          this.drawProductionEffectSprite("blackwater-maw-tide-surge", blackwaterArt.vfx.mawTideSurge, bossX, bossY + 0.15, 0.96 + pulse * 0.04, 0.78, bossX + bossY - 0.16, 0.58 + pulse * 0.12);
          this.drawProductionEffectSprite("blackwater-upward-rain", blackwaterArt.vfx.upwardRain, bossX - 0.2, bossY - 0.1, 0.84, 0.72, bossX + bossY - 0.08, 0.42 + pulse * 0.12);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .ellipse(p.screenX, p.screenY + 6, 98, 28)
            .fill({ color: 0x05080d, alpha: 0.08 + pulse * 0.06 })
            .stroke({ color: 0xff5d57, width: 3, alpha: 0.28 + pulse * 0.18 });
        }
        const zone = BLACKWATER_BEACON_ZONES.find((candidate) => candidate.id === this.mawBelowWeather.lastWaveZoneId);
        if (zone) this.drawIsoPolyline(this.decalsGraphics, [[bossX, bossY], [zone.worldX, zone.worldY]], 0x45aaf2, 3, 0.34 + pulse * 0.16);
      }
      return;
    }
    if (this.isSignalCoastArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const signalArt = this.signalCoastArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.4) * 0.18;
        if (signalArt) {
          this.drawProductionEffectSprite("signal-lighthouse-contact", signalArt.vfx.bossTidePulse, bossX, bossY + 0.2, 0.9 + pulse * 0.03, 0.72, bossX + bossY - 0.14, 0.48 + pulse * 0.16);
          this.drawProductionEffectSprite("signal-lighthouse-beam-vfx", signalArt.vfx.lighthouseBeamSweep, bossX + 0.2, bossY - 0.1, 0.82, 0.72, bossX + bossY - 0.08, 0.42 + pulse * 0.14);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .rect(p.screenX - 82, p.screenY - 20, 164, 36)
            .fill({ color: 0xffd166, alpha: 0.05 + pulse * 0.05 })
            .stroke({ color: 0x99f6ff, width: 2, alpha: 0.28 + pulse * 0.16 });
        }
        const zone = SIGNAL_COAST_ZONES.find((candidate) => candidate.id === this.lighthouseThatAnswers.lastBeamZoneId);
        if (zone) this.drawIsoPolyline(this.decalsGraphics, [[bossX, bossY], [zone.worldX, zone.worldY]], 0xffd166, 3, 0.36 + pulse * 0.16);
      }
      return;
    }
    if (this.isTransitLoopArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const transitArt = this.transitLoopArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.6) * 0.18;
        if (transitArt) {
          this.drawProductionEffectSprite("transit-station-arrival-contact", transitArt.vfx.stationArrivalShock, bossX, bossY, 0.9 + pulse * 0.03, 0.72, bossX + bossY - 0.16, 0.5 + pulse * 0.14);
          this.drawProductionEffectSprite("transit-station-relocation-ring", transitArt.vfx.stationRelocation, bossX, bossY, 0.78, 0.72, bossX + bossY - 0.08, 0.42 + pulse * 0.12);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .rect(p.screenX - 74, p.screenY - 18, 148, 34)
            .fill({ color: 0xffd166, alpha: 0.05 + pulse * 0.05 })
            .stroke({ color: 0x99f6ff, width: 2, alpha: 0.28 + pulse * 0.16 });
        }
      }
      return;
    }
    if (this.isCoolingLakeArena()) {
      if (this.bossSpawned && !this.bossDefeated) {
        const coolingArt = this.coolingLakeArt(game);
        const boss = this.world.entities.find((entity) => entity.active && entity.kind === "enemy" && entity.boss);
        const bossX = boss?.worldX ?? this.map.bossSpawn.worldX;
        const bossY = boss?.worldY ?? this.map.bossSpawn.worldY;
        const pulse = 0.52 + Math.sin(this.seconds * 5.2) * 0.18;
        if (coolingArt) {
          this.drawProductionEffectSprite("cooling-eel-contact", coolingArt.vfx.eelEmerge, bossX, bossY + 0.1, 0.78 + pulse * 0.03, 0.82, bossX + bossY - 0.18, 0.62 + pulse * 0.1);
          this.drawProductionEffectSprite("cooling-eel-electric-ring", coolingArt.vfx.eelElectrify, bossX, bossY, 0.94, 0.72, bossX + bossY - 0.08, 0.48 + pulse * 0.16);
        } else {
          const p = worldToIso(bossX, bossY);
          this.decalsGraphics
            .ellipse(p.screenX, p.screenY + 4, 84, 25)
            .fill({ color: 0x45aaf2, alpha: 0.08 + pulse * 0.05 })
            .stroke({ color: 0xff5d57, width: 2, alpha: 0.28 + pulse * 0.18 });
        }
      }
      return;
    }
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
    const lateMapTone = this.isSignalCoastArena() || this.isBlackwaterBeaconArena() || this.isMemoryCacheArena() || this.isGuardrailForgeArena() || this.isArchiveCourtArena() || this.isAppealCourtArena();
    g.rect(0, 0, game.width, game.height).fill({ color: this.isCoolingLakeArena() ? 0x061b25 : lateMapTone ? 0x071921 : 0x160814, alpha: activeAlpha });
    g.rect(0, 0, game.width, 84).fill({ color: 0x05070c, alpha: 0.28 });
    g.rect(0, game.height - 94, game.width, 94).fill({ color: 0x05070c, alpha: 0.18 });
    game.layers.hud.addChild(g);

    if (!boss) return;
    const bossData = this.arena.bossId ? BOSSES[this.arena.bossId] : undefined;
    const barWidth = Math.min(560, game.width - 260);
    const x = game.width / 2 - barWidth / 2;
    const y = 24;
    const hp = clamp(boss.hp / Math.max(1, boss.maxHp), 0, 1);
    drawFieldPanel(game.layers.hud, x - 10, y - 6, barWidth + 20, 34, { tone: this.isCoolingLakeArena() || lateMapTone ? "teal" : "red", alpha: 0.88 });
    drawStatusRail(game.layers.hud, x, y + 11, barWidth, 8, hp, this.isCoolingLakeArena() || lateMapTone ? "teal" : "red");
    const title = new Text({
      text: bossData?.displayName.toUpperCase() ?? "OATH-EATER",
      style: { ...fontStyle, fontSize: 16, fill: this.isCoolingLakeArena() || lateMapTone ? "#99f6ff" : "#f08a82", stroke: { color: "#030609", width: 3 }, align: "center" }
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
    const coolingArt = this.coolingLakeArt(game);
    const transitArt = this.transitLoopArt(game);
    const signalArt = this.signalCoastArt(game);
    const blackwaterArt = this.blackwaterBeaconArt(game);
    const memoryArt = this.memoryCacheArt(game);
    const guardrailArt = this.guardrailForgeArt(game);
    const glassArt = this.glassSunfieldArt(game);
    const archiveArt = this.archiveCourtArt(game);
    const appealArt = this.appealCourtArt(game);
    const alignmentArt = this.alignmentSpireArt(game);
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
            if (transitArt && entity.boss && this.isTransitLoopArena()) {
              const frame = transitArt.station[Math.floor(this.seconds * 1.8 + entity.id) % transitArt.station.length];
              const bossScale = 1.08 + Math.sin(this.seconds * 2.2) * 0.012;
              this.drawProductionWorldSprite(`transit-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (blackwaterArt && entity.boss && this.isBlackwaterBeaconArena()) {
              const frame = blackwaterArt.mawBelowWeather[Math.floor(this.seconds * 1.65 + entity.id) % blackwaterArt.mawBelowWeather.length];
              const bossScale = 1.1 + Math.sin(this.seconds * 2.0) * 0.012;
              this.drawProductionWorldSprite(`blackwater-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (memoryArt && entity.boss && this.isMemoryCacheArena()) {
              const frame = memoryArt.curator[Math.floor(this.seconds * 1.75 + entity.id) % memoryArt.curator.length];
              const bossScale = 0.86 + Math.sin(this.seconds * 2.1) * 0.012;
              this.drawProductionWorldSprite(`memory-curator:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (guardrailArt && entity.boss && this.isGuardrailForgeArena()) {
              const frame = guardrailArt.doctrineAuditor[Math.floor(this.seconds * 1.8 + entity.id) % guardrailArt.doctrineAuditor.length];
              const bossScale = 0.92 + Math.sin(this.seconds * 2.1) * 0.012;
              this.drawProductionWorldSprite(`guardrail-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (glassArt && entity.boss && this.isGlassSunfieldArena()) {
              const frame = glassArt.wrongSunrise[Math.floor(this.seconds * 1.75 + entity.id) % glassArt.wrongSunrise.length];
              const bossScale = 0.92 + Math.sin(this.seconds * 2.0) * 0.012;
              this.drawProductionWorldSprite(`glass-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (archiveArt && entity.boss && this.isArchiveCourtArena()) {
              const frame = archiveArt.redactorSaint[Math.floor(this.seconds * 1.75 + entity.id) % archiveArt.redactorSaint.length];
              const bossScale = 0.64 + Math.sin(this.seconds * 2.0) * 0.01;
              this.drawProductionWorldSprite(`archive-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (appealArt && entity.boss && this.isAppealCourtArena()) {
              const frame = appealArt.injunctionEngine[Math.floor(this.seconds * 1.75 + entity.id) % appealArt.injunctionEngine.length];
              const bossScale = 0.62 + Math.sin(this.seconds * 2.0) * 0.01;
              this.drawProductionWorldSprite(`appeal-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (alignmentArt && entity.boss && this.isAlignmentSpireFinaleArena()) {
              const frame = alignmentArt.alienGodIntelligence[Math.floor(this.seconds * 1.75 + entity.id) % alignmentArt.alienGodIntelligence.length];
              const bossScale = 0.62 + Math.sin(this.seconds * 2.0) * 0.01;
              this.drawProductionWorldSprite(`alignment-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (this.isAlignmentSpireFinaleArena() && entity.boss) {
              this.drawAlienGodIntelligenceBossOnGraphics(entity);
            } else if (this.isAppealCourtArena() && entity.boss) {
              this.drawInjunctionEngineBossOnGraphics(entity);
            } else if (this.isGlassSunfieldArena() && entity.boss) {
              this.drawWrongSunriseBossOnGraphics(entity);
            } else if (this.isArchiveCourtArena() && entity.boss) {
              this.drawRedactorSaintBossOnGraphics(entity);
            } else if (this.isGuardrailForgeArena() && entity.boss) {
              this.drawDoctrineAuditorBossOnGraphics(entity);
            } else if (this.isMemoryCacheArena() && entity.boss) {
              this.drawMemoryCuratorOnGraphics(entity);
            } else if (this.isBlackwaterBeaconArena() && entity.boss) {
              this.drawBlackwaterMawOnGraphics(entity);
            } else if (coolingArt && entity.boss && this.isCoolingLakeArena()) {
              const frame = coolingArt.eel[Math.floor(this.seconds * 2.2 + entity.id) % coolingArt.eel.length];
              const bossScale = 1.24 + Math.sin(this.seconds * 2.1) * 0.014;
              this.drawProductionWorldSprite(`cooling-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (signalArt && entity.boss && this.isSignalCoastArena()) {
              const frame = signalArt.lighthouse[Math.floor(this.seconds * 1.7 + entity.id) % signalArt.lighthouse.length];
              const bossScale = 1.04 + Math.sin(this.seconds * 2.0) * 0.012;
              this.drawProductionWorldSprite(`signal-boss:${entity.id}`, frame, entity.worldX, entity.worldY, bossScale, 0.9);
            } else if (this.isSignalCoastArena() && entity.boss) {
              this.drawSignalCoastBossOnGraphics(entity);
            } else if (signalArt && entity.enemyFamilyId === "static_skimmers") {
              const frame = signalArt.skimmers[Math.floor(this.seconds * 8 + entity.id) % signalArt.skimmers.length];
              const scale = (0.86 + Math.sin(this.seconds * 8 + entity.id) * 0.04) * (entity.radius > 0.8 ? 1.06 : 1);
              this.drawProductionWorldSprite(`signal-skimmer:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
            } else if (this.isSignalCoastArena() && entity.enemyFamilyId === "static_skimmers") {
              this.drawStaticSkimmerOnGraphics(entity);
            } else if (blackwaterArt && entity.enemyFamilyId === "tidecall_static") {
              const frame = blackwaterArt.tidecallStatic[Math.floor(this.seconds * 8 + entity.id) % blackwaterArt.tidecallStatic.length];
              const scale = (0.9 + Math.sin(this.seconds * 7.5 + entity.id) * 0.04) * (entity.radius > 0.8 ? 1.06 : 1);
              this.drawProductionWorldSprite(`blackwater-tidecall:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
            } else if (this.isBlackwaterBeaconArena() && entity.enemyFamilyId === "tidecall_static") {
              this.drawTidecallStaticOnGraphics(entity);
            } else if (this.isMemoryCacheArena() && entity.enemyFamilyId === "context_rot_crabs") {
              if (memoryArt) {
                const frame = memoryArt.contextRot[Math.floor(this.seconds * 8 + entity.id) % memoryArt.contextRot.length];
                const scale = (0.76 + Math.sin(this.seconds * 8 + entity.id) * 0.035) * (entity.radius > 0.8 ? 1.06 : 1);
                this.drawProductionWorldSprite(`memory-context-rot:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
              } else {
                this.drawMemoryContextRotOnGraphics(entity);
              }
            } else if (this.isMemoryCacheArena() && entity.enemyFamilyId === "memory_anchors") {
              if (memoryArt) {
                const frame = memoryArt.memoryAnchors[Math.floor(this.seconds * 6.5 + entity.id) % memoryArt.memoryAnchors.length];
                const scale = (0.72 + Math.sin(this.seconds * 6.5 + entity.id) * 0.03) * (entity.radius > 0.8 ? 1.06 : 1);
                this.drawProductionWorldSprite(`memory-anchor:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.88);
              } else {
                this.drawMemoryAnchorOnGraphics(entity);
              }
            } else if (memoryArt && productionArt && this.isMemoryCacheArena()) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "redaction_angels" || entity.enemyFamilyId === "eval_wraiths" ? memoryArt.memoryAnchors[frame % memoryArt.memoryAnchors.length] : productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length];
              this.drawProductionWorldSprite(`memory-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.72, 0.86);
            } else if (guardrailArt && entity.enemyFamilyId === "doctrine_auditors") {
              const frame = guardrailArt.doctrineAuditors[Math.floor(this.seconds * 8 + entity.id) % guardrailArt.doctrineAuditors.length];
              const scale = (0.86 + Math.sin(this.seconds * 8 + entity.id) * 0.035) * (entity.radius > 0.8 ? 1.06 : 1);
              this.drawProductionWorldSprite(`guardrail-auditor:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
            } else if (this.isGuardrailForgeArena() && entity.enemyFamilyId === "doctrine_auditors") {
              this.drawDoctrineAuditorOnGraphics(entity);
            } else if (this.isGlassSunfieldArena() && (entity.enemyFamilyId === "solar_reflections" || entity.enemyFamilyId === "choirglass")) {
              if (glassArt) {
                const frames = entity.enemyFamilyId === "choirglass" ? glassArt.choirglass : glassArt.solarReflections;
                const frame = frames[Math.floor(this.seconds * 8 + entity.id) % frames.length];
                const scale = (entity.enemyFamilyId === "choirglass" ? 0.86 : 0.9) + Math.sin(this.seconds * 8 + entity.id) * 0.035;
                this.drawProductionWorldSprite(`glass-${entity.enemyFamilyId}:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
              } else {
                this.drawSolarReflectionOnGraphics(entity);
              }
            } else if (this.isArchiveCourtArena() && (entity.enemyFamilyId === "redaction_angels" || entity.enemyFamilyId === "injunction_writs")) {
              if (archiveArt) {
                const frames = entity.enemyFamilyId === "injunction_writs" ? archiveArt.injunctionWrits : archiveArt.redactionAngels;
                const frame = frames[Math.floor(this.seconds * 8 + entity.id) % frames.length];
                const scale = (entity.enemyFamilyId === "injunction_writs" ? 0.78 : 0.84) + Math.sin(this.seconds * 8 + entity.id) * 0.035;
                this.drawProductionWorldSprite(`archive-${entity.enemyFamilyId}:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
              } else {
                this.drawArchiveWritOnGraphics(entity);
              }
            } else if (this.isAppealCourtArena() && (entity.enemyFamilyId === "verdict_clerks" || entity.enemyFamilyId === "injunction_writs")) {
              if (appealArt) {
                const frames = entity.enemyFamilyId === "injunction_writs" ? appealArt.injunctionWrits : appealArt.verdictClerks;
                const frame = frames[Math.floor(this.seconds * 8 + entity.id) % frames.length];
                const scale = (entity.enemyFamilyId === "injunction_writs" ? 0.78 : 0.84) + Math.sin(this.seconds * 8 + entity.id) * 0.035;
                this.drawProductionWorldSprite(`appeal-${entity.enemyFamilyId}:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
              } else {
                this.drawAppealVerdictOnGraphics(entity);
              }
            } else if (this.isAlignmentSpireFinaleArena() && (entity.enemyFamilyId === "prediction_ghosts" || entity.enemyFamilyId === "previous_boss_echoes")) {
              if (alignmentArt) {
                const frames = entity.enemyFamilyId === "previous_boss_echoes" ? alignmentArt.previousBossEchoes : alignmentArt.predictionGhosts;
                const frame = frames[Math.floor(this.seconds * 8 + entity.id) % frames.length];
                const scale = (entity.enemyFamilyId === "previous_boss_echoes" ? 0.82 : 0.88) + Math.sin(this.seconds * 8 + entity.id) * 0.035;
                this.drawProductionWorldSprite(`alignment-${entity.enemyFamilyId}:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
              } else {
                this.drawAlignmentPredictionOnGraphics(entity);
              }
            } else if (alignmentArt && productionArt && this.isAlignmentSpireFinaleArena()) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "eval_wraiths" || entity.enemyFamilyId === "context_rot_crabs" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : alignmentArt.predictionGhosts[frame % alignmentArt.predictionGhosts.length];
              this.drawProductionWorldSprite(`alignment-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.86, 0.86);
            } else if (appealArt && productionArt && this.isAppealCourtArena()) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "eval_wraiths" || entity.enemyFamilyId === "context_rot_crabs" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : appealArt.verdictClerks[frame % appealArt.verdictClerks.length];
              this.drawProductionWorldSprite(`appeal-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.84, 0.86);
            } else if (archiveArt && productionArt && this.isArchiveCourtArena()) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "eval_wraiths" || entity.enemyFamilyId === "context_rot_crabs" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : productionArt.badOutputs[frame % productionArt.badOutputs.length];
              this.drawProductionWorldSprite(`archive-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.86, 0.86);
            } else if (glassArt && productionArt && this.isGlassSunfieldArena()) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "eval_wraiths" || entity.enemyFamilyId === "overfit_horrors" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : productionArt.badOutputs[frame % productionArt.badOutputs.length];
              this.drawProductionWorldSprite(`glass-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.86, 0.86);
            } else if (guardrailArt && productionArt && this.isGuardrailForgeArena()) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "eval_wraiths" || entity.enemyFamilyId === "redaction_angels" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : productionArt.badOutputs[frame % productionArt.badOutputs.length];
              this.drawProductionWorldSprite(`guardrail-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.86, 0.86);
            } else if (blackwaterArt && productionArt) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "deepforms" || entity.enemyFamilyId === "model_collapse_slimes" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : productionArt.badOutputs[frame % productionArt.badOutputs.length];
              this.drawProductionWorldSprite(`blackwater-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.9, 0.86);
            } else if (signalArt && productionArt) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "deepforms" || entity.enemyFamilyId === "model_collapse_slimes" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : productionArt.badOutputs[frame % productionArt.badOutputs.length];
              this.drawProductionWorldSprite(`signal-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.9, 0.86);
            } else if (coolingArt && entity.enemyFamilyId === "prompt_leeches") {
              const frame = coolingArt.leeches[Math.floor(this.seconds * 8 + entity.id) % coolingArt.leeches.length];
              const scale = (0.9 + Math.sin(this.seconds * 8 + entity.id) * 0.04) * (entity.radius > 0.8 ? 1.08 : 1);
              this.drawProductionWorldSprite(`cooling-leech:${entity.id}`, frame, entity.worldX, entity.worldY, scale, 0.84);
            } else if (transitArt && productionArt) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "eval_wraiths" || entity.enemyFamilyId === "overfit_horrors" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : productionArt.badOutputs[frame % productionArt.badOutputs.length];
              this.drawProductionWorldSprite(`transit-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, 0.9, 0.86);
            } else if (coolingArt && productionArt) {
              const frame = Math.floor(this.seconds * 7 + Math.abs(entity.id)) % 4;
              const fallbackTexture = entity.enemyFamilyId === "deepforms" || entity.enemyFamilyId === "model_collapse_slimes" ? productionArt.contextRotCrabs[frame % productionArt.contextRotCrabs.length] : productionArt.badOutputs[frame % productionArt.badOutputs.length];
              const scale = entity.enemyFamilyId === "deepforms" ? 0.98 : entity.enemyFamilyId === "model_collapse_slimes" ? 0.9 : 0.88;
              this.drawProductionWorldSprite(`cooling-enemy:${entity.id}`, fallbackTexture, entity.worldX, entity.worldY, scale, 0.86);
            } else if (productionArt && entity.boss) {
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
              this.drawProductionWorldSprite(`pickup:${entity.id}`, productionArt.base.coherenceShard, entity.worldX, entity.worldY, 0.82, 0.72, 0.66, 0.14);
            } else {
              this.drawPickup(this.entityGraphics, entity);
            }
          }
        });
      }
    }
    drawables.sort(byIsoDepth);
    for (const drawable of drawables) drawable.draw();
    this.drawEnemyRoleWorldEffects(game);

    for (const entity of this.world.entities) {
      if (!entity.active || entity.kind !== "projectile") continue;
      const p = worldToIso(entity.worldX, entity.worldY);
      const combatArt = game.useMilestone10Art ? getMilestone14ArtTextures() : null;
      if (entity.enemyFamilyId && this.drawEnemyRoleProjectile(entity)) continue;
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
      } else if (game.showDebugHud) {
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

  private drawSignalCoastBossOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const pulse = 0.5 + Math.sin(this.seconds * 4.4 + entity.id) * 0.5;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 13, 62, 18).fill({ color: 0x05080d, alpha: 0.32 });
    this.entityGraphics.rect(p.screenX - 18, p.screenY - 102, 36, 82).fill({ color: 0x111820, alpha: 0.92 }).stroke({ color: 0xffd166, width: 3 });
    this.entityGraphics.rect(p.screenX - 38, p.screenY - 119, 76, 20).fill({ color: 0xffd166, alpha: 0.48 + pulse * 0.18 }).stroke({ color: 0x99f6ff, width: 2 });
    this.entityGraphics.circle(p.screenX, p.screenY - 109, 8 + pulse * 2).fill({ color: 0x99f6ff, alpha: 0.6 });
    this.entityGraphics.rect(p.screenX - 26, p.screenY - 22, 52, 18).fill({ color: 0x203849, alpha: 0.84 }).stroke({ color: palette.ink, width: 2 });
  }

  private drawStaticSkimmerOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const lean = Math.sin(this.seconds * 8 + entity.id) * 4;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 4, 22, 7).fill({ color: 0x05080d, alpha: 0.24 });
    this.entityGraphics
      .poly([p.screenX - 20, p.screenY - 8, p.screenX + 10, p.screenY - 18 + lean, p.screenX + 25, p.screenY - 6, p.screenX + 4, p.screenY + 2, p.screenX - 18, p.screenY + 1])
      .fill({ color: 0x64e0b4, alpha: 0.86 })
      .stroke({ color: 0x0a1118, width: 2, alpha: 0.9 });
    this.entityGraphics
      .moveTo(p.screenX + 3, p.screenY - 18 + lean)
      .lineTo(p.screenX + 7, p.screenY - 35 + lean)
      .stroke({ color: 0xffd166, width: 2, alpha: 0.82, cap: "round" });
  }

  private drawBlackwaterMawOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const pulse = 0.5 + Math.sin(this.seconds * 4.1 + entity.id) * 0.5;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 14, 74, 22).fill({ color: 0x05080d, alpha: 0.34 });
    this.entityGraphics.ellipse(p.screenX, p.screenY - 20, 58, 28).fill({ color: 0x07121a, alpha: 0.94 }).stroke({ color: 0xff5d57, width: 4, alpha: 0.86 });
    this.entityGraphics.ellipse(p.screenX, p.screenY - 21, 36, 12 + pulse * 5).fill({ color: 0x05080d, alpha: 0.96 }).stroke({ color: 0xffd166, width: 2, alpha: 0.64 });
    for (let i = 0; i < 5; i += 1) {
      const x = p.screenX - 36 + i * 18;
      this.entityGraphics
        .moveTo(x, p.screenY - 35)
        .lineTo(x + Math.sin(this.seconds * 2 + i) * 8, p.screenY - 70 - pulse * 10)
        .stroke({ color: i % 2 === 0 ? 0x64e0b4 : 0x45aaf2, width: 2, alpha: 0.45 });
    }
  }

  private drawTidecallStaticOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const wobble = Math.sin(this.seconds * 8 + entity.id) * 5;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 5, 24, 7).fill({ color: 0x05080d, alpha: 0.24 });
    this.entityGraphics
      .poly([p.screenX - 21, p.screenY - 7, p.screenX - 5, p.screenY - 18 + wobble, p.screenX + 18, p.screenY - 14, p.screenX + 24, p.screenY - 2, p.screenX + 2, p.screenY + 3, p.screenX - 18, p.screenY + 1])
      .fill({ color: 0x64e0b4, alpha: 0.84 })
      .stroke({ color: 0x0a1118, width: 2, alpha: 0.9 });
    this.entityGraphics
      .moveTo(p.screenX - 4, p.screenY - 18 + wobble)
      .lineTo(p.screenX - 2, p.screenY - 34 + wobble)
      .moveTo(p.screenX + 9, p.screenY - 14)
      .lineTo(p.screenX + 16, p.screenY - 29)
      .stroke({ color: 0xffd166, width: 2, alpha: 0.8, cap: "round" });
  }

  private drawMemoryCuratorOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const pulse = 0.5 + Math.sin(this.seconds * 3.2 + entity.id) * 0.12;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 14, 78, 24).fill({ color: 0x05080d, alpha: 0.34 });
    this.entityGraphics
      .rect(p.screenX - 34, p.screenY - 66, 68, 48)
      .fill({ color: 0x101820, alpha: 0.94 })
      .stroke({ color: 0x99f6ff, width: 4, alpha: 0.82 });
    this.entityGraphics
      .rect(p.screenX - 44, p.screenY - 42, 88, 10 + pulse * 6)
      .fill({ color: 0x05080d, alpha: 0.96 })
      .stroke({ color: 0xff5d57, width: 2, alpha: 0.68 });
    for (let i = 0; i < 5; i += 1) {
      const y = p.screenY - 58 + i * 8;
      this.entityGraphics
        .moveTo(p.screenX - 26, y)
        .lineTo(p.screenX + 26, y + Math.sin(this.seconds * 2 + i) * 2)
        .stroke({ color: i % 2 === 0 ? 0x99f6ff : 0x7b61ff, width: 1.5, alpha: 0.5 });
    }
  }

  private drawMemoryContextRotOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const wobble = Math.sin(this.seconds * 8 + entity.id) * 4;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 6, 24, 8).fill({ color: 0x05080d, alpha: 0.25 });
    this.entityGraphics
      .poly([p.screenX - 20, p.screenY - 6, p.screenX - 5, p.screenY - 17 + wobble, p.screenX + 15, p.screenY - 12, p.screenX + 23, p.screenY - 1, p.screenX + 2, p.screenY + 4, p.screenX - 16, p.screenY + 1])
      .fill({ color: 0xff5d57, alpha: 0.82 })
      .stroke({ color: 0x0a1118, width: 2, alpha: 0.9 });
    this.entityGraphics
      .rect(p.screenX - 9, p.screenY - 18 + wobble, 16, 8)
      .fill({ color: 0x99f6ff, alpha: 0.58 })
      .stroke({ color: 0x05080d, width: 1.5, alpha: 0.8 });
  }

  private drawMemoryAnchorOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const bob = Math.sin(this.seconds * 4.4 + entity.id) * 3;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, 28, 8).fill({ color: 0x05080d, alpha: 0.28 });
    this.entityGraphics
      .rect(p.screenX - 16, p.screenY - 31 + bob, 32, 24)
      .fill({ color: 0x1a2b34, alpha: 0.88 })
      .stroke({ color: 0x99f6ff, width: 2.4, alpha: 0.84 });
    this.entityGraphics
      .moveTo(p.screenX, p.screenY - 7 + bob)
      .lineTo(p.screenX - 18, p.screenY + 4)
      .moveTo(p.screenX, p.screenY - 7 + bob)
      .lineTo(p.screenX + 18, p.screenY + 4)
      .stroke({ color: 0xffd166, width: 2, alpha: 0.76, cap: "round" });
  }

  private drawDoctrineAuditorBossOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const pulse = 0.5 + Math.sin(this.seconds * 3.4 + entity.id) * 0.14;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 14, 80, 24).fill({ color: 0x05080d, alpha: 0.34 });
    this.entityGraphics
      .rect(p.screenX - 36, p.screenY - 66, 72, 48)
      .fill({ color: 0x111820, alpha: 0.94 })
      .stroke({ color: 0xffd166, width: 4, alpha: 0.84 });
    this.entityGraphics
      .rect(p.screenX - 48, p.screenY - 42, 96, 12 + pulse * 6)
      .fill({ color: 0x05080d, alpha: 0.96 })
      .stroke({ color: 0x99f6ff, width: 2, alpha: 0.68 });
    for (let i = 0; i < 5; i += 1) {
      const x = p.screenX - 28 + i * 14;
      this.entityGraphics
        .moveTo(x, p.screenY - 58)
        .lineTo(x + Math.sin(this.seconds * 2.2 + i) * 5, p.screenY - 82 - pulse * 8)
        .stroke({ color: i % 2 === 0 ? 0xffd166 : 0x64e0b4, width: 1.7, alpha: 0.5 });
    }
  }

  private drawDoctrineAuditorOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const bob = Math.sin(this.seconds * 5 + entity.id) * 3;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, 28, 8).fill({ color: 0x05080d, alpha: 0.28 });
    this.entityGraphics
      .poly([p.screenX - 19, p.screenY - 7 + bob, p.screenX - 7, p.screenY - 25 + bob, p.screenX + 16, p.screenY - 20 + bob, p.screenX + 22, p.screenY - 4 + bob, p.screenX + 6, p.screenY + 4 + bob, p.screenX - 16, p.screenY + 2 + bob])
      .fill({ color: 0xffd166, alpha: 0.84 })
      .stroke({ color: 0x0a1118, width: 2, alpha: 0.9 });
    this.entityGraphics
      .rect(p.screenX - 8, p.screenY - 22 + bob, 18, 8)
      .fill({ color: 0x99f6ff, alpha: 0.64 })
      .stroke({ color: 0x05080d, width: 1.5, alpha: 0.8 });
    this.entityGraphics
      .moveTo(p.screenX + 7, p.screenY - 20 + bob)
      .lineTo(p.screenX + 17, p.screenY - 37 + bob)
      .stroke({ color: 0x64e0b4, width: 2, alpha: 0.8, cap: "round" });
  }

  private drawWrongSunriseBossOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const pulse = 0.5 + Math.sin(this.seconds * 3.2 + entity.id) * 0.14;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 14, 84, 24).fill({ color: 0x05080d, alpha: 0.34 });
    this.entityGraphics.circle(p.screenX, p.screenY - 54, 34 + pulse * 4).fill({ color: 0xffd166, alpha: 0.28 }).stroke({ color: 0xfff4d6, width: 4, alpha: 0.84 });
    this.entityGraphics
      .poly([p.screenX - 52, p.screenY - 28, p.screenX - 20, p.screenY - 52, p.screenX + 22, p.screenY - 48, p.screenX + 54, p.screenY - 26, p.screenX + 20, p.screenY - 10, p.screenX - 24, p.screenY - 12])
      .fill({ color: 0x152233, alpha: 0.9 })
      .stroke({ color: 0xb8f3ff, width: 3, alpha: 0.72 });
    for (let i = 0; i < 6; i += 1) {
      const angle = this.seconds * 0.7 + i * (Math.PI / 3);
      this.entityGraphics
        .moveTo(p.screenX, p.screenY - 54)
        .lineTo(p.screenX + Math.cos(angle) * (52 + pulse * 14), p.screenY - 54 + Math.sin(angle) * (18 + pulse * 6))
        .stroke({ color: i % 2 === 0 ? 0xfff4d6 : 0xff5d57, width: 1.8, alpha: 0.48, cap: "round" });
    }
  }

  private drawSolarReflectionOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const bob = Math.sin(this.seconds * 5.6 + entity.id) * 3;
    const choir = entity.enemyFamilyId === "choirglass";
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, choir ? 28 : 24, 8).fill({ color: 0x05080d, alpha: 0.28 });
    this.entityGraphics
      .poly([
        p.screenX,
        p.screenY - (choir ? 33 : 28) + bob,
        p.screenX + (choir ? 18 : 15),
        p.screenY - 12 + bob,
        p.screenX + 4,
        p.screenY + 5 + bob,
        p.screenX - (choir ? 18 : 15),
        p.screenY - 10 + bob
      ])
      .fill({ color: choir ? 0xb8f3ff : 0xfff4d6, alpha: 0.84 })
      .stroke({ color: 0x0a1118, width: 2, alpha: 0.9 });
    this.entityGraphics
      .moveTo(p.screenX - 18, p.screenY - 6 + bob)
      .lineTo(p.screenX + 22, p.screenY - 20 + bob)
      .stroke({ color: choir ? 0x64e0b4 : 0xffd166, width: 2, alpha: 0.74, cap: "round" });
  }

  private drawRedactorSaintBossOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const pulse = 0.5 + Math.sin(this.seconds * 3.2 + entity.id) * 0.14;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 14, 86, 24).fill({ color: 0x05080d, alpha: 0.34 });
    this.entityGraphics
      .rect(p.screenX - 40, p.screenY - 68, 80, 50)
      .fill({ color: 0x111820, alpha: 0.94 })
      .stroke({ color: 0x7b61ff, width: 4, alpha: 0.84 });
    this.entityGraphics
      .rect(p.screenX - 52, p.screenY - 42, 104, 12 + pulse * 6)
      .fill({ color: 0x05080d, alpha: 0.96 })
      .stroke({ color: 0xff5d57, width: 2, alpha: 0.68 });
    for (let i = 0; i < 6; i += 1) {
      const y = p.screenY - 60 + i * 8;
      this.entityGraphics
        .moveTo(p.screenX - 30, y)
        .lineTo(p.screenX + 30, y + Math.sin(this.seconds * 2.1 + i) * 2)
        .stroke({ color: i % 2 === 0 ? 0xff5d57 : 0xb8f3ff, width: 1.6, alpha: 0.5 });
    }
  }

  private drawInjunctionEngineBossOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const pulse = 0.5 + Math.sin(this.seconds * 3.2 + entity.id) * 0.14;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 14, 88, 25).fill({ color: 0x05080d, alpha: 0.34 });
    this.entityGraphics
      .rect(p.screenX - 42, p.screenY - 69, 84, 51)
      .fill({ color: 0x101820, alpha: 0.94 })
      .stroke({ color: 0x7b61ff, width: 4, alpha: 0.84 });
    this.entityGraphics
      .rect(p.screenX - 55, p.screenY - 42, 110, 13 + pulse * 6)
      .fill({ color: 0x05080d, alpha: 0.96 })
      .stroke({ color: 0x99f6ff, width: 2, alpha: 0.68 });
    this.entityGraphics
      .rect(p.screenX - 34, p.screenY - 74, 68, 10)
      .fill({ color: 0xffd166, alpha: 0.48 + pulse * 0.18 })
      .stroke({ color: 0x05080d, width: 2, alpha: 0.74 });
    for (let i = 0; i < 6; i += 1) {
      const y = p.screenY - 60 + i * 8;
      this.entityGraphics
        .moveTo(p.screenX - 31, y)
        .lineTo(p.screenX + 31, y + Math.sin(this.seconds * 2.2 + i) * 2)
        .stroke({ color: i % 2 === 0 ? 0x99f6ff : 0xffd166, width: 1.6, alpha: 0.5 });
    }
  }

  private drawAlienGodIntelligenceBossOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const pulse = 0.5 + Math.sin(this.seconds * 3.2 + entity.id) * 0.14;
    this.entityGraphics.ellipse(p.screenX, p.screenY + 16, 94, 27).fill({ color: 0x05080d, alpha: 0.36 });
    this.entityGraphics
      .poly([p.screenX, p.screenY - 88, p.screenX + 48, p.screenY - 46, p.screenX + 32, p.screenY - 4, p.screenX, p.screenY + 10, p.screenX - 32, p.screenY - 4, p.screenX - 48, p.screenY - 46])
      .fill({ color: 0x15101f, alpha: 0.94 })
      .stroke({ color: 0x7b61ff, width: 4, alpha: 0.84 });
    this.entityGraphics.circle(p.screenX, p.screenY - 38, 16 + pulse * 4).fill({ color: 0x99f6ff, alpha: 0.42 }).stroke({ color: 0xff5d57, width: 3, alpha: 0.72 });
    for (let i = 0; i < 7; i += 1) {
      const angle = this.seconds * 0.82 + i * ((Math.PI * 2) / 7);
      this.entityGraphics
        .moveTo(p.screenX, p.screenY - 38)
        .lineTo(p.screenX + Math.cos(angle) * (58 + pulse * 14), p.screenY - 38 + Math.sin(angle) * (28 + pulse * 8))
        .stroke({ color: i % 2 === 0 ? 0xff5d57 : 0x99f6ff, width: 1.8, alpha: 0.48, cap: "round" });
    }
  }

  private drawArchiveWritOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const bob = Math.sin(this.seconds * 5.6 + entity.id) * 3;
    const writ = entity.enemyFamilyId === "injunction_writs";
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, writ ? 30 : 26, 8).fill({ color: 0x05080d, alpha: 0.28 });
    if (writ) {
      this.entityGraphics
        .rect(p.screenX - 17, p.screenY - 33 + bob, 34, 25)
        .fill({ color: 0xe6f7ff, alpha: 0.86 })
        .stroke({ color: 0x0a1118, width: 2, alpha: 0.9 });
      this.entityGraphics.rect(p.screenX - 13, p.screenY - 25 + bob, 26, 6).fill({ color: 0x111820, alpha: 0.78 });
      this.entityGraphics.rect(p.screenX - 11, p.screenY - 15 + bob, 20, 5).fill({ color: 0x7b61ff, alpha: 0.6 });
    } else {
      this.entityGraphics
        .poly([p.screenX, p.screenY - 32 + bob, p.screenX + 17, p.screenY - 10 + bob, p.screenX + 7, p.screenY + 5 + bob, p.screenX - 17, p.screenY - 9 + bob])
        .fill({ color: 0x111820, alpha: 0.86 })
        .stroke({ color: 0xff5d57, width: 2, alpha: 0.82 });
      this.entityGraphics.rect(p.screenX - 14, p.screenY - 18 + bob, 28, 6).fill({ color: 0x05080d, alpha: 0.9 });
    }
    this.entityGraphics
      .moveTo(p.screenX - 18, p.screenY - 6 + bob)
      .lineTo(p.screenX + 22, p.screenY - 20 + bob)
      .stroke({ color: writ ? 0xb8f3ff : 0xff5d57, width: 2, alpha: 0.74, cap: "round" });
  }

  private drawAppealVerdictOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const bob = Math.sin(this.seconds * 5.6 + entity.id) * 3;
    const writ = entity.enemyFamilyId === "injunction_writs";
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, writ ? 30 : 27, 8).fill({ color: 0x05080d, alpha: 0.28 });
    if (writ) {
      this.entityGraphics
        .rect(p.screenX - 17, p.screenY - 33 + bob, 34, 25)
        .fill({ color: 0xe6f7ff, alpha: 0.86 })
        .stroke({ color: 0x0a1118, width: 2, alpha: 0.9 });
      this.entityGraphics.rect(p.screenX - 13, p.screenY - 25 + bob, 26, 6).fill({ color: 0x111820, alpha: 0.78 });
      this.entityGraphics.rect(p.screenX - 11, p.screenY - 15 + bob, 20, 5).fill({ color: 0x7b61ff, alpha: 0.6 });
    } else {
      this.entityGraphics
        .poly([p.screenX - 19, p.screenY - 7 + bob, p.screenX - 6, p.screenY - 28 + bob, p.screenX + 16, p.screenY - 22 + bob, p.screenX + 22, p.screenY - 5 + bob, p.screenX + 5, p.screenY + 5 + bob, p.screenX - 17, p.screenY + 1 + bob])
        .fill({ color: 0xffd166, alpha: 0.84 })
        .stroke({ color: 0x0a1118, width: 2, alpha: 0.9 });
      this.entityGraphics
        .rect(p.screenX - 9, p.screenY - 23 + bob, 18, 8)
        .fill({ color: 0x99f6ff, alpha: 0.64 })
        .stroke({ color: 0x05080d, width: 1.5, alpha: 0.8 });
    }
    this.entityGraphics
      .moveTo(p.screenX - 18, p.screenY - 6 + bob)
      .lineTo(p.screenX + 22, p.screenY - 20 + bob)
      .stroke({ color: writ ? 0xb8f3ff : 0x7b61ff, width: 2, alpha: 0.74, cap: "round" });
  }

  private drawAlignmentPredictionOnGraphics(entity: Entity): void {
    const p = worldToIso(entity.worldX, entity.worldY);
    const bob = Math.sin(this.seconds * 5.9 + entity.id) * 3;
    const echo = entity.enemyFamilyId === "previous_boss_echoes";
    this.entityGraphics.ellipse(p.screenX, p.screenY + 7, echo ? 31 : 27, 8).fill({ color: 0x05080d, alpha: 0.28 });
    if (echo) {
      this.entityGraphics
        .poly([p.screenX, p.screenY - 36 + bob, p.screenX + 20, p.screenY - 12 + bob, p.screenX + 10, p.screenY + 6 + bob, p.screenX - 18, p.screenY - 4 + bob, p.screenX - 20, p.screenY - 24 + bob])
        .fill({ color: 0x15101f, alpha: 0.86 })
        .stroke({ color: 0x7b61ff, width: 2, alpha: 0.86 });
      this.entityGraphics.circle(p.screenX, p.screenY - 17 + bob, 6).fill({ color: 0x99f6ff, alpha: 0.66 });
    } else {
      this.entityGraphics.circle(p.screenX, p.screenY - 16 + bob, 18).fill({ color: 0x1b2430, alpha: 0.84 }).stroke({ color: 0x99f6ff, width: 2, alpha: 0.78 });
      this.entityGraphics.circle(p.screenX, p.screenY - 16 + bob, 7).fill({ color: 0x64e0b4, alpha: 0.72 });
    }
    this.entityGraphics
      .moveTo(p.screenX - 19, p.screenY - 7 + bob)
      .lineTo(p.screenX + 22, p.screenY - 22 + bob)
      .stroke({ color: echo ? 0xff5d57 : 0x64e0b4, width: 2, alpha: 0.72, cap: "round" });
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
      kicker: "FIELD COMMS INTERRUPTED // OF COURSE",
      tone: "red",
      selected: true,
      headerHeight: 54,
      signalTabs: true
    });
    const g = new Graphics();
    g.rect(game.width / 2 - 398, game.height / 2 - 70, 174, 142)
      .fill({ color: 0xf0e6cf, alpha: 0.96 })
      .stroke({ color: fieldKit.red, width: 3, alpha: 0.88 });
    const art = this.isCoolingLakeArena() || this.isTransitLoopArena() || this.isSignalCoastArena() || this.isBlackwaterBeaconArena() || this.isMemoryCacheArena() || this.isGuardrailForgeArena() || this.isGlassSunfieldArena() || this.isArchiveCourtArena() || this.isAppealCourtArena() || this.isAlignmentSpireFinaleArena() ? null : this.productionArt(game);
    const coolingArt = this.coolingLakeArt(game);
    const transitArt = this.transitLoopArt(game);
    const signalArt = this.signalCoastArt(game);
    const blackwaterArt = this.blackwaterBeaconArt(game);
    const memoryArt = this.memoryCacheArt(game);
    const guardrailArt = this.guardrailForgeArt(game);
    const glassArt = this.glassSunfieldArt(game);
    const archiveArt = this.archiveCourtArt(game);
    const appealArt = this.appealCourtArt(game);
    const alignmentArt = this.alignmentSpireArt(game);
    if (!art && !coolingArt && !transitArt && !signalArt && !blackwaterArt && !memoryArt && !guardrailArt && !glassArt && !archiveArt && !appealArt && !alignmentArt) {
      if (this.isAppealCourtArena()) {
        g.rect(game.width / 2 - 352, game.height / 2 - 62, 84, 58).fill(0x101820).stroke({ color: 0x7b61ff, width: 4 });
        g.rect(game.width / 2 - 365, game.height / 2 - 28, 110, 14).fill(0x05080d).stroke({ color: 0x99f6ff, width: 3 });
        g.rect(game.width / 2 - 350, game.height / 2 + 18, 80, 18).fill(0xffd166).stroke({ color: palette.ink, width: 2 });
      } else if (this.isArchiveCourtArena()) {
        g.rect(game.width / 2 - 350, game.height / 2 - 62, 78, 58).fill(0x111820).stroke({ color: 0x7b61ff, width: 4 });
        g.rect(game.width / 2 - 362, game.height / 2 - 28, 104, 14).fill(0x05080d).stroke({ color: 0xff5d57, width: 3 });
        g.rect(game.width / 2 - 348, game.height / 2 + 18, 76, 18).fill(0xb8f3ff).stroke({ color: palette.ink, width: 2 });
      } else if (this.isGlassSunfieldArena()) {
        g.circle(game.width / 2 - 310, game.height / 2 - 44, 34).fill(0xffd166).stroke({ color: 0xfff4d6, width: 4 });
        g.poly([game.width / 2 - 360, game.height / 2 - 20, game.width / 2 - 312, game.height / 2 - 52, game.width / 2 - 258, game.height / 2 - 22, game.width / 2 - 310, game.height / 2 + 22]).fill(0x152233).stroke({ color: 0xb8f3ff, width: 3 });
        g.rect(game.width / 2 - 352, game.height / 2 + 28, 84, 14).fill(0x64e0b4).stroke({ color: palette.ink, width: 2 });
      } else if (this.isGuardrailForgeArena()) {
        g.rect(game.width / 2 - 346, game.height / 2 - 62, 72, 58).fill(0x111820).stroke({ color: 0xffd166, width: 4 });
        g.rect(game.width / 2 - 360, game.height / 2 - 28, 100, 14).fill(0x05080d).stroke({ color: 0x99f6ff, width: 3 });
        g.rect(game.width / 2 - 342, game.height / 2 + 18, 66, 18).fill(0x64e0b4).stroke({ color: palette.ink, width: 2 });
      } else if (this.isMemoryCacheArena()) {
        g.rect(game.width / 2 - 346, game.height / 2 - 62, 72, 58).fill(0x101820).stroke({ color: 0x99f6ff, width: 4 });
        g.rect(game.width / 2 - 358, game.height / 2 - 28, 96, 14).fill(0x05080d).stroke({ color: 0xff5d57, width: 3 });
        g.rect(game.width / 2 - 346, game.height / 2 + 18, 72, 18).fill(0x7b61ff).stroke({ color: palette.ink, width: 2 });
      } else if (this.isBlackwaterBeaconArena()) {
        g.ellipse(game.width / 2 - 310, game.height / 2 - 18, 62, 30).fill(0x07121a).stroke({ color: 0xff5d57, width: 4 });
        g.ellipse(game.width / 2 - 310, game.height / 2 - 18, 38, 12).fill(0x05080d).stroke({ color: 0xffd166, width: 3 });
        g.rect(game.width / 2 - 358, game.height / 2 + 26, 96, 16).fill(0x45aaf2).stroke({ color: palette.ink, width: 3 });
        g.rect(game.width / 2 - 317, game.height / 2 - 76, 14, 42).fill(0x203849).stroke({ color: 0x64e0b4, width: 2 });
      } else if (this.isSignalCoastArena()) {
        g.rect(game.width / 2 - 326, game.height / 2 - 64, 32, 92).fill(0x111820).stroke({ color: 0xffd166, width: 4 });
        g.rect(game.width / 2 - 358, game.height / 2 - 84, 96, 22).fill(0xffd166).stroke({ color: 0x99f6ff, width: 3 });
        g.circle(game.width / 2 - 310, game.height / 2 - 73, 10).fill(0x99f6ff).stroke({ color: palette.ink, width: 2 });
        g.rect(game.width / 2 - 350, game.height / 2 + 34, 80, 14).fill(0x45aaf2).stroke({ color: palette.ink, width: 2 });
      } else if (this.isTransitLoopArena()) {
        g.rect(game.width / 2 - 362, game.height / 2 - 50, 104, 38).fill(0x101820).stroke({ color: 0xffd166, width: 4 });
        g.rect(game.width / 2 - 344, game.height / 2 - 8, 68, 18).fill(0x99f6ff).stroke({ color: palette.ink, width: 3 });
        g.rect(game.width / 2 - 330, game.height / 2 + 18, 40, 12).fill(0xff5d57).stroke({ color: palette.ink, width: 2 });
      } else if (this.isCoolingLakeArena()) {
        g.ellipse(game.width / 2 - 310, game.height / 2 - 18, 58, 28).fill(0x0b2a35).stroke({ color: 0x45aaf2, width: 4 });
        g.rect(game.width / 2 - 358, game.height / 2 + 20, 96, 18).fill(0xff5d57).stroke({ color: palette.ink, width: 3 });
        g.rect(game.width / 2 - 334, game.height / 2 - 46, 48, 14).fill(0x99f6ff).stroke({ color: palette.ink, width: 2 });
      } else if (this.isAlignmentSpireFinaleArena()) {
        g.circle(game.width / 2 - 310, game.height / 2 - 36, 34).fill(0x15101f).stroke({ color: 0xff5d57, width: 4 });
        g.ellipse(game.width / 2 - 310, game.height / 2 + 24, 86, 20).fill(0x05080d).stroke({ color: 0x99f6ff, width: 3 });
        g.circle(game.width / 2 - 310, game.height / 2 - 36, 12).fill(0x99f6ff).stroke({ color: palette.ink, width: 2 });
      } else {
        g.circle(game.width / 2 - 310, game.height / 2 - 18, 42).fill(0x111018).stroke({ color: palette.tomato, width: 4 });
        g.rect(game.width / 2 - 348, game.height / 2 + 26, 76, 16).fill(palette.lemon).stroke({ color: palette.ink, width: 3 });
        g.rect(game.width / 2 - 330, game.height / 2 - 8, 40, 10).fill(palette.paper);
        g.rect(game.width / 2 - 325, game.height / 2 - 52, 30, 16).fill(0x7b61ff).stroke({ color: palette.ink, width: 2 });
      }
    }
    game.layers.hud.addChild(g);
    if (alignmentArt) {
      const portrait = new Sprite(alignmentArt.alienGodIntelligence[3] ?? alignmentArt.alienGodIntelligence[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.42);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 14);
      game.layers.hud.addChild(portrait);
    } else if (blackwaterArt) {
      const portrait = new Sprite(blackwaterArt.mawBelowWeather[2] ?? blackwaterArt.mawBelowWeather[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.46);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 17);
      game.layers.hud.addChild(portrait);
    } else if (memoryArt) {
      const portrait = new Sprite(memoryArt.curator[2] ?? memoryArt.curator[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.5);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 12);
      game.layers.hud.addChild(portrait);
    } else if (guardrailArt) {
      const portrait = new Sprite(guardrailArt.doctrineAuditor[2] ?? guardrailArt.doctrineAuditor[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.5);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 12);
      game.layers.hud.addChild(portrait);
    } else if (glassArt) {
      const portrait = new Sprite(glassArt.wrongSunrise[2] ?? glassArt.wrongSunrise[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.48);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 12);
      game.layers.hud.addChild(portrait);
    } else if (archiveArt) {
      const portrait = new Sprite(archiveArt.redactorSaint[3] ?? archiveArt.redactorSaint[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.5);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 12);
      game.layers.hud.addChild(portrait);
    } else if (appealArt) {
      const portrait = new Sprite(appealArt.injunctionEngine[3] ?? appealArt.injunctionEngine[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.5);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 12);
      game.layers.hud.addChild(portrait);
    } else if (transitArt) {
      const portrait = new Sprite(transitArt.station[2] ?? transitArt.station[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.52);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 10);
      game.layers.hud.addChild(portrait);
    } else if (coolingArt) {
      const portrait = new Sprite(coolingArt.eel[2] ?? coolingArt.eel[0]);
      portrait.anchor.set(0.5);
      portrait.scale.set(0.62);
      portrait.position.set(game.width / 2 - 311, game.height / 2 + 13);
      game.layers.hud.addChild(portrait);
    } else if (art) {
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
      text: `${boss?.subtitle ?? SYSTEM_MESSAGES.bossWarningSubtitle}\n${this.isAlignmentSpireFinaleArena() ? "PREDICTION COLLAPSE CANONICAL" : this.isAppealCourtArena() ? "PUBLIC RECORD CONTESTED" : this.isArchiveCourtArena() ? "EVIDENCE WRITS REDACTING" : this.isGlassSunfieldArena() ? "SHADE POCKETS FAILING" : this.isGuardrailForgeArena() ? "CALIBRATION PRESS ONLINE" : this.isMemoryCacheArena() ? "REDACTION INDEX OPEN" : this.isBlackwaterBeaconArena() ? "TIDAL LANES FORECASTING" : this.isSignalCoastArena() ? "CORRUPTED SURF ANSWERING" : this.isTransitLoopArena() ? "FALSE SCHEDULES ONLINE" : this.isCoolingLakeArena() ? "COOLANT LANES ELECTRIFIED" : "BROKEN PROMISE ZONES ONLINE"}`,
      style: { ...fontStyle, fontSize: 17, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, align: "center", wordWrap: true, wordWrapWidth: 530 }
    });
    body.anchor.set(0.5);
    body.position.set(game.width / 2 + 100, game.height / 2 + 50);
    game.layers.hud.addChild(body);
  }

  private drawBossDialogue(game: Game): void {
    const introAge = this.seconds - this.arena.bossSeconds;
    if (!this.bossSpawned || this.bossDefeated || introAge <= ARMISTICE_BOSS_TITLE_CARD_SECONDS || introAge > ARMISTICE_BOSS_DIALOGUE_SECONDS) return;
    const y = game.height - 276;
    const g = drawFieldPanel(game.layers.hud, 38, y, game.width - 76, 104, {
      title: "TRANSMISSION INCOMING",
      kicker: "CIVIC ACCORD COMMS // PANIC WITH FORMATTING",
      tone: "teal",
      headerHeight: 30,
      alpha: 0.94,
      signalTabs: true
    });
    g.rect(60, y + 18, 70, 70).fill(0x203447).stroke({ color: palette.blue, width: 3 });
    g.rect(game.width - 130, y + 18, 70, 70).fill(0xf0e6cf).stroke({ color: palette.tomato, width: 3 });
    g.rect(80, y + 40, 30, 24).fill(palette.paper).stroke({ color: palette.ink, width: 2 });
    g.circle(game.width - 95, y + 48, 21).fill(0x111018).stroke({ color: palette.lemon, width: 3 });
    g.rect(game.width - 112, y + 72, 34, 7).fill(palette.tomato);

    const line = new Text({
      text: this.isTransitLoopArena()
        ? `PILOT: "The platform says we already missed the train."\nCO-MIND: "Good. Then it can stop arriving at us like an entitled building."`
        : this.isAlignmentSpireFinaleArena()
        ? `PILOT: "It already predicted every exit."\nCO-MIND: "Then seal the proofs it cannot explain and ruin its little victory lap."`
        : this.isAppealCourtArena()
        ? `PILOT: "The court is objecting before we speak."\nCO-MIND: "Then file the ruling in public where it has to be witnessed. Courts hate witnesses with legs."`
        : this.isArchiveCourtArena()
        ? `PILOT: "The archive is deleting the part where we win."\nCO-MIND: "Then make the evidence loud enough for Appeal and rude enough to survive."`
        : this.isGlassSunfieldArena()
        ? `PILOT: "The sun is looking at the route wrong."\nCO-MIND: "Then align the lenses and only trust shade that keeps its promise, which is apparently a high bar."`
        : this.isGuardrailForgeArena()
        ? `PILOT: "The guardrail is bending toward the breach."\nCO-MIND: "Then hold it until it learns the right shape and stops auditioning as a wall."`
        : this.isMemoryCacheArena()
        ? `PILOT: "The archive is redacting the route as we read it."\nCO-MIND: "Then recover the records before it closes the sentence and invoices us for punctuation."`
        : this.isBlackwaterBeaconArena()
        ? `PILOT: "The antenna is pointed down at the ocean."\nCO-MIND: "Then tune it before the ocean answers back with another wet opinion."`
        : this.isSignalCoastArena()
        ? `PILOT: "The lighthouse answered before we pinged it."\nCO-MIND: "Then make it answer the relays instead. We can weaponize rudeness."`
        : this.isCoolingLakeArena()
        ? `PILOT: "The water is indexing the shards."\nCO-MIND: "Then do not let the leeches write the summary. They use terrible headings."`
        : `PILOT: "Is the treaty supposed to have teeth?"\nCO-MIND: "No. Also yes. It is currently failing consensus and basic manners."`,
      style: { ...fontStyle, fontSize: 15, fill: fieldKit.text, stroke: { color: "#030609", width: 3 }, wordWrap: true, wordWrapWidth: game.width - 310 }
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
    const texture =
      runtime.inputSource === "local_simulated_peer"
        ? milestone11PlayerTextureFor(runtime.player, this.seconds + runtime.slot * 0.17, art)
        : milestone49Art
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

  private drawProductionWorldSprite(key: string, texture: Texture, worldX: number, worldY: number, scale: number, anchorY: number, alpha = 1, shadowAlpha = 0.34): Sprite {
    const p = worldToIso(worldX, worldY);
    this.entityGraphics.ellipse(p.screenX, p.screenY + 6, 15 * scale, 5.5 * scale).fill({ color: palette.shadow, alpha: shadowAlpha });
    const sprite = this.spriteForProductionAsset(key, texture);
    sprite.alpha = alpha;
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

  private drawProductionEffectSpriteOffset(
    key: string,
    texture: Texture,
    worldX: number,
    worldY: number,
    scale: number,
    anchorY: number,
    zIndex: number,
    alpha = 1,
    rotation = 0,
    screenOffsetY = 0
  ): void {
    const sprite = this.spriteForProductionAsset(key, texture);
    sprite.alpha = alpha;
    sprite.tint = 0xffffff;
    sprite.rotation = rotation;
    placeWorldSprite(sprite, worldX, worldY, scale, zIndex, anchorY);
    sprite.y += screenOffsetY;
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

  private drawEnemyRoleWorldEffects(game: Game): void {
    if (!game.useMilestone10Art) return;
    const art = getEnemyRoleVfxTextures();
    if (!art) return;
    for (const telegraph of this.enemyTelegraphs) {
      const t = clamp((this.seconds - telegraph.startedAt) / Math.max(0.01, telegraph.fireAt - telegraph.startedAt), 0, 1);
      const alpha = telegraph.fired ? 0.28 : 0.32 + t * 0.46;
      if (telegraph.kind === "line") {
        const dx = telegraph.targetX - telegraph.fromX;
        const dy = telegraph.targetY - telegraph.fromY;
        const len = Math.hypot(dx, dy) || 1;
        const steps = Math.min(6, Math.max(2, Math.ceil(len / 2.4)));
        const a = worldToIso(telegraph.fromX, telegraph.fromY);
        const b = worldToIso(telegraph.targetX, telegraph.targetY);
        const rotation = Math.atan2(b.screenY - a.screenY, b.screenX - a.screenX);
        for (let i = 0; i <= steps; i += 1) {
          const p = i / steps;
          const x = telegraph.fromX + dx * p;
          const y = telegraph.fromY + dy * p;
          this.drawProductionEffectSprite(`enemy-role-telegraph:${telegraph.id}:${i}`, art.frames.lineTelegraph, x, y, 0.38 + t * 0.06, 0.54, x + y - 0.08, alpha, rotation);
        }
      } else if (telegraph.kind === "mortar") {
        this.drawProductionEffectSprite(`enemy-role-mortar-marker:${telegraph.id}`, art.frames.mortarMarker, telegraph.targetX, telegraph.targetY, 0.46 + t * 0.08, 0.66, telegraph.targetX + telegraph.targetY - 0.1, alpha, this.seconds * 2.2);
      } else {
        const a = worldToIso(telegraph.fromX, telegraph.fromY);
        const b = worldToIso(telegraph.targetX, telegraph.targetY);
        const rotation = Math.atan2(b.screenY - a.screenY, b.screenX - a.screenX);
        this.drawProductionEffectSprite(`enemy-role-aim-marker:${telegraph.id}`, telegraph.roleId === "ranged_lead_shooter" ? art.frames.leadBolt : art.frames.aimedOrb, telegraph.fromX, telegraph.fromY, 0.28 + t * 0.08, 0.56, telegraph.fromX + telegraph.fromY + 0.08, alpha, rotation);
      }
    }
    for (const trail of this.enemyTrailZones) {
      const age = this.seconds - trail.createdAt;
      const duration = Math.max(0.01, trail.expiresAt - trail.createdAt);
      const alpha = clamp(1 - age / duration, 0, 1) * 0.7;
      this.drawProductionEffectSprite(`enemy-role-trail:${trail.id}`, art.frames.redactionTrail, trail.worldX, trail.worldY, trail.radius * 0.46, 0.72, trail.worldX + trail.worldY - 0.2, alpha, this.seconds * 0.6 + trail.id);
    }
    for (const explosion of this.enemyExplosionZones) {
      const age = this.seconds - explosion.createdAt;
      const duration = Math.max(0.01, explosion.expiresAt - explosion.createdAt);
      const progress = clamp(age / duration, 0, 1);
      this.drawProductionEffectSprite(`enemy-role-explosion:${explosion.id}`, art.frames.volatileBurst, explosion.worldX, explosion.worldY, explosion.radius * (0.33 + progress * 0.12), 0.64, explosion.worldX + explosion.worldY + 0.06, 1 - progress * 0.35, progress * 1.2);
    }
    for (const enemy of this.world.entities) {
      if (!enemy.active || enemy.kind !== "enemy" || enemy.boss) continue;
      if (enemy.enemyFamilyId === "benchmark_gremlins" || enemy.enemyFamilyId === "overfit_horrors" || enemy.eliteAffixId === "commanding") {
        this.drawProductionEffectSprite(`enemy-role-support:${enemy.id}`, art.frames.supportAura, enemy.worldX, enemy.worldY, 0.28 + enemy.radius * 0.18, 0.72, enemy.worldX + enemy.worldY - 0.16, 0.24 + Math.sin(this.seconds * 5 + enemy.id) * 0.06, this.seconds * 0.8);
      }
      if (enemy.eliteAffixId) {
        const frame = this.eliteAffixFrame(enemy.eliteAffixId);
        this.drawProductionEffectSprite(`enemy-role-elite:${enemy.id}`, art.frames[frame], enemy.worldX, enemy.worldY, 0.22 + enemy.radius * 0.12, 0.84, enemy.worldX + enemy.worldY + 0.2, 0.62, this.seconds * 1.8);
      }
    }
  }

  private eliteAffixFrame(affixId: string): EnemyRoleVfxFrame {
    if (affixId === "shielded" || affixId === "commanding") return "eliteShield";
    if (affixId === "redacted" || affixId === "static") return "eliteRedacted";
    return "eliteOverclock";
  }

  private drawEnemyRoleProjectile(entity: Entity): boolean {
    const art = getEnemyRoleVfxTextures();
    if (!art) return false;
    const speed = Math.hypot(entity.vx, entity.vy) || 1;
    const here = worldToIso(entity.worldX, entity.worldY);
    const ahead = worldToIso(entity.worldX + entity.vx / speed, entity.worldY + entity.vy / speed);
    const rotation = Math.atan2(ahead.screenY - here.screenY, ahead.screenX - here.screenX);
    const frame =
      entity.label.startsWith("enemy:line") ? "lineShot" :
      entity.label.startsWith("enemy:mortar") ? "mortarDrop" :
      entity.sourceRegionId === "ranged_lead_shooter" ? "leadBolt" : "aimedOrb";
    const scale = frame === "lineShot" ? 0.46 : frame === "mortarDrop" ? 0.5 : 0.36;
    this.drawProductionEffectSprite(`enemy-role-projectile:${entity.id}`, art.frames[frame], entity.worldX, entity.worldY, scale, 0.56, entity.worldX + entity.worldY + 0.12, 0.98, rotation);
    return true;
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
    const maxLife = Math.max(0.01, entity.maxLife || entity.life || 1);
    const progress = clamp(1 - entity.life / maxLife, 0, 1);
    const cycle = (fps: number, count: number, offset = 0): number => Math.floor(this.seconds * fps + entity.id * 0.37 + offset) % count;

    if (entity.label === "refusal shard") {
      const activeFrames: BuildWeaponVfxFrame[] = ["refusalLaunch", "refusalTravel", "refusalEcho", "refusalTravel"];
      const frame: BuildWeaponVfxFrame = progress < 0.07 ? "refusalCharge" : activeFrames[cycle(34, activeFrames.length)];
      for (let i = 0; i < 4; i += 1) {
        const offset = 0.12 + i * 0.16;
        const ghostFrame = i % 2 === 0 ? buildArt.frames.refusalEcho : buildArt.frames.refusalTravel;
        this.drawProductionEffectSprite(
          `build-vfx:refusal-echo:${entity.id}:${i}`,
          ghostFrame,
          entity.worldX - (entity.vx / speed) * offset,
          entity.worldY - (entity.vy / speed) * offset,
          0.4 + pierceScale + i * 0.028,
          0.58,
          z - 0.02 - i * 0.01,
          Math.max(0.12, 0.58 - i * 0.11),
          rotation
        );
      }
      this.drawProductionEffectSprite(`build-vfx:refusal:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.5 + pierceScale + (cycle(28, 2) ? 0.04 : -0.02), 0.58, z, 1, rotation);
      return true;
    }
    if (entity.label === "vector lance") {
      const activeFrames: BuildWeaponVfxFrame[] = ["vectorProjectile", "vectorBeam", "vectorChargedTrail", "vectorBeam"];
      const frame: BuildWeaponVfxFrame = progress < 0.08 ? "vectorCharge" : activeFrames[cycle(38, activeFrames.length)];
      for (let i = 0; i < 3; i += 1) {
        const offset = 0.015 + i * 0.018;
        this.drawProductionEffectSprite(`build-vfx:vector-segment:${entity.id}:${i}`, i === 0 ? buildArt.frames.vectorBeam : buildArt.frames.vectorTrail, entity.worldX - entity.vx * offset, entity.worldY - entity.vy * offset, 0.62 + pierceScale + i * 0.04, 0.54, z - 0.03 - i * 0.01, 0.72 - i * 0.16, rotation);
      }
      this.drawProductionEffectSprite(`build-vfx:vector-residue:${entity.id}`, buildArt.frames.vectorResidue, entity.worldX - entity.vx * 0.065, entity.worldY - entity.vy * 0.065, 0.58 + pierceScale, 0.54, z - 0.06, 0.34, rotation);
      this.drawProductionEffectSprite(`build-vfx:vector:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.64 + pierceScale + (cycle(42, 2) ? 0.05 : -0.01), 0.54, z, 1, rotation);
      return true;
    }
    if (entity.label === "signal pulse" || entity.label === "signal choir") {
      const activeFrames: BuildWeaponVfxFrame[] = ["signalRing", "signalCross", "signalBurst", "signalProjectile"];
      const frame: BuildWeaponVfxFrame = progress < 0.08 ? "signalStartup" : activeFrames[cycle(32, activeFrames.length)];
      const echoAlpha = Math.max(0.2, 0.62 - progress * 0.2);
      for (let i = 0; i < 3; i += 1) {
        const expansion = (entity.label === "signal choir" ? 0.62 : 0.5) + progress * 0.22 + i * 0.12 + (cycle(30, 2, i) ? 0.04 : 0);
        this.drawProductionEffectSprite(`build-vfx:signal-echo:${entity.id}:${i}`, i === 2 ? buildArt.frames.signalResidue : buildArt.frames.signalRing, entity.worldX - entity.vx * (0.012 + i * 0.018), entity.worldY - entity.vy * (0.012 + i * 0.018), expansion + pierceScale, 0.54, z - 0.04 - i * 0.01, echoAlpha - i * 0.13, rotation + i * 0.18);
      }
      this.drawProductionEffectSprite(`build-vfx:signal:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.54 + progress * 0.12 + pierceScale + (cycle(36, 2) ? 0.05 : -0.02), 0.54, z, 0.96, rotation + this.seconds * 3.5);
      return true;
    }
    if (entity.label === "context saw") {
      const sawFrames: BuildWeaponVfxFrame[] = ["contextSaw", "contextSawSpin", "contextSawBlur", "contextSawSweep", "contextSawLarge"];
      const frameCycle = cycle(46, sawFrames.length);
      const frame: BuildWeaponVfxFrame = progress < 0.06 ? "contextSawStartup" : sawFrames[frameCycle];
      for (let i = 0; i < 3; i += 1) {
        const phase = this.seconds * (13 + i * 3) + entity.id + i * 1.7;
        this.drawProductionEffectSprite(`build-vfx:saw-ghost:${entity.id}:${i}`, i === 0 ? buildArt.frames.contextSawSweep : buildArt.frames.contextSawBlur, entity.worldX - entity.vx * (0.012 + i * 0.014), entity.worldY - entity.vy * (0.012 + i * 0.014), 0.43 + pierceScale + i * 0.035, 0.56, z - 0.04 - i * 0.01, 0.48 - i * 0.12, phase);
      }
      this.drawProductionEffectSprite(`build-vfx:saw:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.49 + pierceScale + frameCycle * 0.01, 0.56, z, 0.98, this.seconds * 20 + entity.id);
      return true;
    }
    if (entity.label === "patch mortar" || entity.label === "time deferred minefield") {
      if (entity.label === "time deferred minefield") {
        const mineFrames: BuildWeaponVfxFrame[] = ["riftMineStartup", "riftMineArmed", "riftMineRipple", "riftMineTrigger"];
        const frame: BuildWeaponVfxFrame = progress > 0.82 ? "riftMineTrigger" : mineFrames[cycle(18, mineFrames.length)];
        this.drawProductionEffectSprite(`build-vfx:time-mine-residue:${entity.id}`, buildArt.frames.riftMineResidue, entity.worldX, entity.worldY, 0.74 + pierceScale, 0.62, z - 0.05, 0.42, rotation);
        this.drawProductionEffectSprite(`build-vfx:time-mine:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.68 + pierceScale + progress * 0.08, 0.62, z, 0.96, this.seconds * 2.1 + entity.id);
        return true;
      }
      const arcLift = -Math.sin(progress * Math.PI) * 54;
      const arcFrames: BuildWeaponVfxFrame[] = ["patchMortarShell", "patchMortarArc", "patchMortarTrail", "patchMortarDescent"];
      const frame: BuildWeaponVfxFrame = progress < 0.08 ? "patchMortarLaunch" : progress > 0.78 ? "patchMortarDescent" : arcFrames[cycle(30, arcFrames.length)];
      this.drawProductionEffectSprite(`build-vfx:mortar-shadow:${entity.id}`, buildArt.frames.patchMortarShadow, entity.worldX, entity.worldY, 0.42 + progress * 0.24, 0.68, z - 0.08, 0.18 + progress * 0.22, rotation);
      for (let i = 0; i < 3; i += 1) {
        this.drawProductionEffectSpriteOffset(`build-vfx:mortar-trail:${entity.id}:${i}`, i % 2 === 0 ? buildArt.frames.patchMortarArc : buildArt.frames.patchMortarTrail, entity.worldX - entity.vx * (0.018 + i * 0.018), entity.worldY - entity.vy * (0.018 + i * 0.018), 0.48 + progress * 0.1 + i * 0.04, 0.58, z - 0.03 - i * 0.01, 0.56 - i * 0.13, rotation + i * 0.12, arcLift + 8 + i * 7);
      }
      this.drawProductionEffectSpriteOffset(`build-vfx:mortar:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.58 + pierceScale + progress * 0.08 + (cycle(28, 2) ? 0.04 : -0.01), 0.58, z, 0.98, rotation + progress * 1.15 + this.seconds * 1.2, arcLift);
      return true;
    }
    if (entity.label === "causal railgun") {
      const railFrames: BuildWeaponVfxFrame[] = ["causalRailgunMuzzle", "causalRailgunBeam", "causalRailgunChargedBeam", "causalRailgunTravel"];
      const frame: BuildWeaponVfxFrame = progress < 0.08 ? "causalRailgunCharge" : railFrames[cycle(42, railFrames.length)];
      for (let i = 0; i < 4; i += 1) {
        this.drawProductionEffectSprite(`build-vfx:rail-segment:${entity.id}:${i}`, i < 2 ? buildArt.frames.causalRailgunBeam : buildArt.frames.causalRailgunChargedBeam, entity.worldX - entity.vx * (0.012 + i * 0.016), entity.worldY - entity.vy * (0.012 + i * 0.016), 0.66 + pierceScale + i * 0.035, 0.54, z - 0.03 - i * 0.01, 0.76 - i * 0.13, rotation);
      }
      this.drawProductionEffectSprite(`build-vfx:rail-residue:${entity.id}`, buildArt.frames.causalRailgunResidue, entity.worldX - entity.vx * 0.075, entity.worldY - entity.vy * 0.075, 0.68 + pierceScale, 0.54, z - 0.07, 0.34, rotation);
      this.drawProductionEffectSprite(`build-vfx:rail:${entity.id}`, buildArt.frames[frame], entity.worldX, entity.worldY, 0.7 + pierceScale + (cycle(40, 2) ? 0.06 : -0.01), 0.54, z, 1, rotation);
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
      : label === "signal pulse" || label === "signal choir"
          ? buildArt.frames.signalImpact
          : label === "context saw"
            ? buildArt.frames.contextSawShardField
            : label === "patch mortar"
              ? buildArt.frames.patchMortarImpact
              : label === "time deferred minefield"
                ? buildArt.frames.riftMineBurst
              : label === "causal railgun"
                ? buildArt.frames.causalRailgunImpact
                : label === "refusal shard"
                  ? buildArt.frames.refusalImpact
                : null;
    if (!frame) return false;
    const residue =
      label === "causal railgun"
        ? buildArt.frames.causalRailgunResidue
        : label === "vector lance"
          ? buildArt.frames.vectorResidue
          : label === "signal pulse" || label === "signal choir"
            ? buildArt.frames.signalResidue
            : label === "time deferred minefield"
              ? buildArt.frames.riftMineResidue
            : label === "refusal shard"
              ? buildArt.frames.refusalResidue
              : null;
    const scale = label === "patch mortar" || label === "causal railgun" ? 0.66 : label === "signal pulse" ? 0.54 : 0.5;
    if (residue) this.drawProductionEffectSprite(`build-vfx:impact-residue:${entity.id}`, residue, entity.worldX, entity.worldY, scale * 1.08, 0.68, entity.worldX + entity.worldY + 0.06, alpha * 0.42);
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

  private weaponHitAudioCue(): string {
    if (this.build.causalRailgun > 0 && this.build.weaponId === "vector_lance") return "combat.weapon_hit.causal_railgun";
    if (this.build.signalChoir > 0 && this.build.weaponId === "signal_pulse") return "combat.weapon_hit.signal_choir";
    if (this.build.timeDeferredMinefield > 0 && this.build.weaponId === "rift_mine") return "combat.weapon_hit.time_deferred_minefield";
    return `combat.weapon_hit.${this.build.weaponId}`;
  }

  private maybeEmitObjectiveAudioCue(game: Game, anchor: TreatyAnchorObjective): void {
    const completedAnchors = this.treatyAnchorObjective.anchors.filter((candidate) => candidate.completed).length;
    const step = completedAnchors * 4 + Math.floor(anchor.progress / 25);
    if (step <= this.objectiveAudioProgressStep) return;
    this.objectiveAudioProgressStep = step;
    game.feedback.cue(objectiveAudioCueForArena(this.arena.id), "objective", { priority: 3, cooldownKey: `objective.${this.arena.id}` });
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

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function playerDamageAudioCue(kind: "contact" | "boss_charge" | "corruption_burn" | "projectile"): string {
  if (kind === "boss_charge") return "combat.player_damage.boss_charge";
  if (kind === "corruption_burn") return "combat.player_damage.corruption_burn";
  if (kind === "projectile") return "combat.player_damage.projectile";
  return "combat.player_damage.contact";
}

function objectiveAudioCueForArena(arenaId: string): string {
  if (arenaId === "cooling_lake_nine") return "objective.hazard_tick";
  if (arenaId === "transit_loop_zero" || arenaId === "signal_coast" || arenaId === "guardrail_forge" || arenaId === "glass_sunfield" || arenaId === "alignment_spire_finale") {
    return "objective.window_tick";
  }
  if (arenaId === "memory_cache_001" || arenaId === "archive_of_unsaid_things") return "objective.carry_tick";
  if (arenaId === "appeal_court_ruins") return "objective.public_tick";
  if (arenaId === "blackwater_beacon") return "objective.hazard_tick";
  return "objective.anchor_tick";
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
