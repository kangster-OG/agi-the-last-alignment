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
import { COMBAT_CLASSES, FACTIONS, STARTER_CLASS_ID, STARTER_FACTION_ID } from "../content";
import { clampConsensusCellSize } from "../sim/consensusCell";
import { OnlineCoopState } from "../network/OnlineCoopState";
import { AssetPreviewState, type AssetPreviewKind } from "../ui/assetPreview";
import { createFeedbackSystem } from "./feedback";
import { xpNeeded } from "../gameplay/player";
import { loadArmisticeAuthoredGround, loadArmisticeGroundAtlas, loadArmisticeTransitionAtlas } from "../assets/armisticeGroundAtlas";
import { loadArmisticeSourceRebuildV2 } from "../assets/armisticeSourceRebuildV2";
import { loadMilestone11Art } from "../assets/milestone11Art";
import { loadMilestone12Art } from "../assets/milestone12Art";
import { loadMilestone14Art } from "../assets/milestone14Art";
import { loadMilestone49PlayableArt } from "../assets/milestone49PlayableArt";
import { loadBuildWeaponVfxTextures } from "../assets/buildWeaponVfx";
import { loadEnemyRoleVfxTextures } from "../assets/enemyRoleVfx";
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
import { createExpeditionProgress, expeditionPowerScore, type ExpeditionProgress } from "../roguelite/expedition";
import { campaignLedgerForProgress } from "../roguelite/campaignMilestones";
import { readOnlineMetaProgression, recordSoloCampaignNodeRewards } from "../metaprogression/onlineMetaProgression";
import { campaignClarityForNode } from "../content/campaignClarity";
import { campaignObjectiveVarietyForNode } from "../content/campaignObjectiveVariety";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    set_consensus_cell_size?: (size: number) => void;
    resolve_alignment_check?: (optionIndex: number) => void;
    record_solo_campaign_clear_for_proof?: (nodeId: string) => string;
  }
}

export type AlignmentSelectionMode = "campaign" | "free";

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
  alignmentSelectionMode: AlignmentSelectionMode = "campaign";
  selectedKernelModuleIds: string[] = [...DEFAULT_KERNEL_MODULE_IDS];
  selectedEvalProtocolIds: string[] = [];
  selectedConsensusBurstPathId: ConsensusBurstPathId = DEFAULT_CONSENSUS_BURST_PATH;
  selectedRouteContractId = "stabilize_armistice";
  expeditionProgress: ExpeditionProgress = createExpeditionProgress();
  lastRunMemory: {
    completed: boolean;
    nodeId: string;
    kills: number;
    seconds: number;
    burstActivations?: number;
    routeContractId?: string;
    objectiveCompleted?: number;
    objectiveTotal?: number;
    objectiveName?: string;
    objectiveUnit?: string;
    objectiveStyle?: string;
    objectiveMechanic?: string;
    thesis?: string;
    proofTokensAwarded?: number;
    proofTokensTotal?: number;
    expeditionLevel?: number;
    expeditionPower?: number;
    expeditionDrafts?: number;
    newSecrets?: SecretUnlock[];
    newMastery?: MasteryBadge[];
    nodeStabilized?: string;
    bossDefeated?: boolean;
    buildHighlights?: string[];
    routeUnlocks?: string[];
    stabilizedRouteCount?: number;
    campaignConsequence?: string;
    factionCampaignConsequence?: string;
    finalClearance?: boolean;
    mechanicalUnlocks?: string[];
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

  constructor(private readonly root: HTMLElement) {
    const proofClassId = this.query.get("proofClassId");
    const proofFactionId = this.query.get("proofFactionId");
    if (proofClassId && COMBAT_CLASSES[proofClassId]) this.selectedClassId = proofClassId;
    if (proofFactionId && FACTIONS[proofFactionId]) this.selectedFactionId = proofFactionId;
    if (isEnabledQueryFlag(this.query, "freeAlignment")) this.alignmentSelectionMode = "free";
    if (isEnabledQueryFlag(this.query, "proofCoolingLakeUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.unlockedNodes.add("cooling_lake_nine");
      this.lastNodeId = "armistice_plaza";
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        4,
        18,
        ["refusal_halo", "the_no_button", "context_bloom"],
        ["Refusal Halo", "The No Button", "Context Bloom"],
        ["defense_layer", "auto_weapon", "shard_economy"],
        ["refusal", "defense", "refusal", "economy"],
        ["armistice_plaza"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "armistice_plaza",
        kills: 0,
        seconds: 120,
        burstActivations: 1,
        routeContractId: "stabilize_armistice",
        objectiveCompleted: 3,
        objectiveTotal: 3,
        objectiveName: "Treaty Anchor Reboot",
        objectiveUnit: "Treaty Anchors",
        thesis: "proof-seeded",
        proofTokensAwarded: 1,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length
      };
      this.campEvents = [
        "Proof seed: Armistice is treated as accepted and complete so Cooling Lake Nine can be launched from the normal camp/route/overworld flow.",
        "All Treaty Anchors rebooted. Cooling Lake Nine is unlocked for graybox proof.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Cooling.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofTransitUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.lastNodeId = "cooling_lake_nine";
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        6,
        26,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst"],
        ["armistice_plaza", "cooling_lake_nine"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "cooling_lake_nine",
        kills: 0,
        seconds: 95,
        burstActivations: 1,
        routeContractId: "resource_cache_detour",
        objectiveCompleted: 2,
        objectiveTotal: 3,
        objectiveName: "Server Buoy Stabilization",
        objectiveUnit: "Server Buoys",
        thesis: "proof-seeded",
        proofTokensAwarded: 1,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length
      };
      this.campEvents = [
        "Proof seed: Armistice and Cooling Lake Nine are treated as complete so Transit Loop Zero can be launched from the normal campaign flow.",
        "Cooling Lake stabilized the Kettle Coast signal. Transit Loop Zero is now the next route-kind prototype.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Transit.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofKettleCoastUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.completedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("signal_coast");
      this.lastNodeId = "transit_loop_zero";
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        9,
        290,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer", "cathedral_of_no", "anchor_bodyguard", "treaty_anchor_toolkit"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer", "Cathedral of No", "Anchor Bodyguard", "Treaty Anchor Toolkit"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy", "auto_weapon", "co_mind_process", "auto_weapon"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst", "refusal", "boss", "defense"],
        ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero"],
        ["doctrine_lock_no_means_no", "shard_flywheel"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "transit_loop_zero",
        kills: 0,
        seconds: 96,
        burstActivations: 43,
        routeContractId: "faction_relay_argument",
        objectiveCompleted: 3,
        objectiveTotal: 3,
        objectiveName: "Route Platform Alignment",
        objectiveUnit: "Route Platforms",
        thesis: "proof-seeded",
        proofTokensAwarded: 1,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length
      };
      this.campEvents = [
        "Proof seed: Armistice, Cooling Lake Nine, and Transit Loop Zero are complete so Signal Coast can be launched from the normal campaign flow.",
        "Transit locked the road long enough to expose Signal Coast on the Kettle shoreline.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Signal Coast.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofBlackwaterBeaconUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.completedNodes.add("transit_loop_zero");
      this.completedNodes.add("signal_coast");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("signal_coast");
      this.unlockedNodes.add("blackwater_beacon");
      this.unlockedNodes.add("verdict_spire");
      this.lastNodeId = "signal_coast";
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        10,
        915,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer", "cathedral_of_no", "anchor_bodyguard", "treaty_anchor_toolkit", "prompt_leech_quarantine"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer", "Cathedral of No", "Anchor Bodyguard", "Treaty Anchor Toolkit", "Prompt Leech Quarantine"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy", "auto_weapon", "co_mind_process", "auto_weapon", "co_mind_process"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst", "refusal", "boss", "defense", "economy", "defense"],
        ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero", "signal_coast"],
        ["doctrine_lock_no_means_no", "shard_flywheel"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "signal_coast",
        kills: 1160,
        seconds: 154,
        burstActivations: 86,
        routeContractId: "unverified_shortcut",
        objectiveCompleted: 3,
        objectiveTotal: 3,
        objectiveName: "Signal Relay Calibration",
        objectiveUnit: "Signal Relays",
        thesis: "proof-seeded",
        proofTokensAwarded: 2,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length
      };
      this.campEvents = [
        "Proof seed: Armistice, Cooling Lake Nine, Transit Loop Zero, and Signal Coast are complete so Blackwater Beacon can be launched from the normal campaign flow.",
        "Signal Coast stabilized the relay chain. Blackwater Beacon and Verdict Spire are both visible; this proof chooses the Blackwater Array route.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Blackwater Beacon.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofMemoryCacheUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.completedNodes.add("transit_loop_zero");
      this.completedNodes.add("signal_coast");
      this.completedNodes.add("blackwater_beacon");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("signal_coast");
      this.unlockedNodes.add("blackwater_beacon");
      this.unlockedNodes.add("verdict_spire");
      this.unlockedNodes.add("memory_cache_001");
      this.lastNodeId = "blackwater_beacon";
      this.secretUnlockIds.add("blackwater_signal_key");
      this.secretUnlockIds.add("alignment_hypothesis_validated");
      this.masteryBadgeIds.add("blackwater_beacon_graybox_clear");
      this.masteryBadgeIds.add("maw_below_weather_scaffold_clear");
      this.masteryBadgeIds.add("burst_deny_premise_clear");
      this.masteryBadgeIds.add("blackwater_antenna_clear");
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        11,
        986,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer", "cathedral_of_no", "anchor_bodyguard", "treaty_anchor_toolkit", "prompt_leech_quarantine", "refusal_slipstream"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer", "Cathedral of No", "Anchor Bodyguard", "Treaty Anchor Toolkit", "Prompt Leech Quarantine", "Refusal Slipstream"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy", "auto_weapon", "co_mind_process", "auto_weapon", "co_mind_process", "movement_trace"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst", "refusal", "boss", "defense", "economy", "defense", "movement"],
        ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero", "signal_coast", "blackwater_beacon"],
        ["doctrine_lock_no_means_no", "shard_flywheel"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "blackwater_beacon",
        kills: 780,
        seconds: 150,
        burstActivations: 81,
        routeContractId: "stabilize_armistice",
        objectiveCompleted: 3,
        objectiveTotal: 3,
        objectiveName: "Blackwater Antenna Split-Pressure",
        objectiveUnit: "Antenna Arrays",
        thesis: "proof-seeded",
        proofTokensAwarded: 2,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length,
        newSecrets: [
          { id: "blackwater_signal_key", name: "Blackwater Signal Key", body: "Blackwater Beacon's antenna split resolved into a route key instead of another ocean argument." },
          { id: "alignment_hypothesis_validated", name: "Alignment Hypothesis Validated", body: "Two synergy doctrines came online in one run." }
        ],
        newMastery: [
          { id: "blackwater_beacon_graybox_clear", name: "Blackwater Beacon Clear", body: "Finished the Blackwater Array split-pressure fourth-level route." }
        ]
      };
      this.campEvents = [
        "Proof seed: Act 01 through Blackwater Beacon is complete so Memory Cache can be launched from the normal campaign flow.",
        "Blackwater Signal Key is available. Memory Cache is unlocked as the next local Expedition / Recovery route.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Memory Cache at pressure ${this.expeditionProgress.powerScore}.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofGuardrailForgeUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.completedNodes.add("transit_loop_zero");
      this.completedNodes.add("signal_coast");
      this.completedNodes.add("blackwater_beacon");
      this.completedNodes.add("memory_cache_001");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("signal_coast");
      this.unlockedNodes.add("blackwater_beacon");
      this.unlockedNodes.add("verdict_spire");
      this.unlockedNodes.add("memory_cache_001");
      this.unlockedNodes.add("guardrail_forge");
      this.unlockedNodes.add("archive_of_unsaid_things");
      this.lastNodeId = "memory_cache_001";
      this.proofTokens = 3;
      this.secretUnlockIds.add("blackwater_signal_key");
      this.secretUnlockIds.add("alignment_hypothesis_validated");
      this.secretUnlockIds.add("recovered_route_memory");
      this.masteryBadgeIds.add("blackwater_beacon_graybox_clear");
      this.masteryBadgeIds.add("maw_below_weather_scaffold_clear");
      this.masteryBadgeIds.add("blackwater_antenna_clear");
      this.masteryBadgeIds.add("memory_cache_recovery_clear");
      this.masteryBadgeIds.add("memory_curator_scaffold_clear");
      this.masteryBadgeIds.add("memory_record_clear");
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        12,
        873,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer", "cathedral_of_no", "anchor_bodyguard", "treaty_anchor_toolkit", "prompt_leech_quarantine", "refusal_slipstream", "context_saw"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer", "Cathedral of No", "Anchor Bodyguard", "Treaty Anchor Toolkit", "Prompt Leech Quarantine", "Refusal Slipstream", "Context Saw"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy", "auto_weapon", "co_mind_process", "auto_weapon", "co_mind_process", "movement_trace", "auto_weapon"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst", "refusal", "boss", "defense", "economy", "defense", "movement", "weapon", "economy"],
        ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero", "signal_coast", "blackwater_beacon", "memory_cache_001"],
        ["doctrine_lock_no_means_no", "shard_flywheel"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "memory_cache_001",
        kills: 774,
        seconds: 166,
        burstActivations: 76,
        routeContractId: "resource_cache_detour",
        objectiveCompleted: 4,
        objectiveTotal: 4,
        objectiveName: "Memory Record Recovery",
        objectiveUnit: "Memory Records",
        thesis: "refusal",
        proofTokensAwarded: 3,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length,
        newSecrets: [
          { id: "recovered_route_memory", name: "Recovered Route Memory", body: "Memory Cache restored a source-backed route memory instead of another hand-waved branch." }
        ],
        newMastery: [
          { id: "memory_cache_recovery_clear", name: "Memory Cache Recovery Clear", body: "Recovered Memory Cache records after the Blackwater route key." },
          { id: "memory_curator_scaffold_clear", name: "Memory Curator Scaffold Clear", body: "Survived the Memory Cache curator/redaction scaffold." },
          { id: "memory_record_clear", name: "Memory Record Clear", body: "Recovered every Memory Cache evidence record before extraction." }
        ]
      };
      this.campEvents = [
        "Proof seed: Act 01 through Memory Cache is complete so Guardrail Forge can be launched from the normal campaign flow.",
        "Recovered Route Memory points to Guardrail Forge as the next local Defense / Holdout branch.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Guardrail Forge at pressure ${this.expeditionProgress.powerScore}.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofGlassSunfieldUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.completedNodes.add("transit_loop_zero");
      this.completedNodes.add("signal_coast");
      this.completedNodes.add("blackwater_beacon");
      this.completedNodes.add("memory_cache_001");
      this.completedNodes.add("guardrail_forge");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("signal_coast");
      this.unlockedNodes.add("blackwater_beacon");
      this.unlockedNodes.add("verdict_spire");
      this.unlockedNodes.add("memory_cache_001");
      this.unlockedNodes.add("guardrail_forge");
      this.unlockedNodes.add("archive_of_unsaid_things");
      this.unlockedNodes.add("glass_sunfield");
      this.lastNodeId = "guardrail_forge";
      this.proofTokens = 5;
      this.secretUnlockIds.add("blackwater_signal_key");
      this.secretUnlockIds.add("alignment_hypothesis_validated");
      this.secretUnlockIds.add("recovered_route_memory");
      this.secretUnlockIds.add("calibrated_guardrail_doctrine");
      this.masteryBadgeIds.add("blackwater_beacon_graybox_clear");
      this.masteryBadgeIds.add("maw_below_weather_scaffold_clear");
      this.masteryBadgeIds.add("blackwater_antenna_clear");
      this.masteryBadgeIds.add("memory_cache_recovery_clear");
      this.masteryBadgeIds.add("memory_curator_scaffold_clear");
      this.masteryBadgeIds.add("memory_record_clear");
      this.masteryBadgeIds.add("guardrail_forge_holdout_clear");
      this.masteryBadgeIds.add("doctrine_auditor_scaffold_clear");
      this.masteryBadgeIds.add("guardrail_doctrine_clear");
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        13,
        617,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer", "cathedral_of_no", "anchor_bodyguard", "treaty_anchor_toolkit", "prompt_leech_quarantine", "refusal_slipstream", "context_saw", "recompile_pulse"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer", "Cathedral of No", "Anchor Bodyguard", "Treaty Anchor Toolkit", "Prompt Leech Quarantine", "Refusal Slipstream", "Context Saw", "Recompile Pulse"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy", "auto_weapon", "co_mind_process", "auto_weapon", "co_mind_process", "movement_trace", "auto_weapon", "consensus_burst"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst", "refusal", "boss", "defense", "economy", "defense", "movement", "weapon", "economy", "coop", "burst"],
        ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero", "signal_coast", "blackwater_beacon", "memory_cache_001", "guardrail_forge"],
        ["doctrine_lock_no_means_no", "shard_flywheel"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "guardrail_forge",
        kills: 763,
        seconds: 160,
        burstActivations: 84,
        routeContractId: "faction_relay_argument",
        objectiveCompleted: 4,
        objectiveTotal: 4,
        objectiveName: "Guardrail Doctrine Calibration",
        objectiveUnit: "Forge Relays",
        thesis: "refusal",
        proofTokensAwarded: 2,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length,
        newSecrets: [
          { id: "calibrated_guardrail_doctrine", name: "Calibrated Guardrail Doctrine", body: "Guardrail Forge tempered a doctrine alloy that bends under evidence without becoming a wall." }
        ],
        newMastery: [
          { id: "guardrail_forge_holdout_clear", name: "Guardrail Forge Holdout Clear", body: "Completed the post-Memory faction relay defense/holdout branch." },
          { id: "doctrine_auditor_scaffold_clear", name: "Doctrine Auditor Scaffold Clear", body: "Survived the Guardrail Forge doctrine-audit scaffold." },
          { id: "guardrail_doctrine_clear", name: "Guardrail Doctrine Clear", body: "Calibrated every Guardrail Forge relay before extraction." }
        ]
      };
      this.campEvents = [
        "Proof seed: Act 01 through Guardrail Forge is complete so Glass Sunfield can be launched from the normal campaign flow.",
        "Calibrated Guardrail Doctrine points to Glass Sunfield as the next local Solar-Prism / Shade Routing branch.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Glass Sunfield at pressure ${this.expeditionProgress.powerScore}.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofArchiveCourtUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.completedNodes.add("transit_loop_zero");
      this.completedNodes.add("signal_coast");
      this.completedNodes.add("blackwater_beacon");
      this.completedNodes.add("memory_cache_001");
      this.completedNodes.add("guardrail_forge");
      this.completedNodes.add("glass_sunfield");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("signal_coast");
      this.unlockedNodes.add("blackwater_beacon");
      this.unlockedNodes.add("verdict_spire");
      this.unlockedNodes.add("memory_cache_001");
      this.unlockedNodes.add("guardrail_forge");
      this.unlockedNodes.add("archive_of_unsaid_things");
      this.unlockedNodes.add("glass_sunfield");
      this.lastNodeId = "glass_sunfield";
      this.proofTokens = 7;
      this.secretUnlockIds.add("blackwater_signal_key");
      this.secretUnlockIds.add("alignment_hypothesis_validated");
      this.secretUnlockIds.add("recovered_route_memory");
      this.secretUnlockIds.add("calibrated_guardrail_doctrine");
      this.secretUnlockIds.add("glass_sunfield_prism");
      this.masteryBadgeIds.add("blackwater_beacon_graybox_clear");
      this.masteryBadgeIds.add("maw_below_weather_scaffold_clear");
      this.masteryBadgeIds.add("blackwater_antenna_clear");
      this.masteryBadgeIds.add("memory_cache_recovery_clear");
      this.masteryBadgeIds.add("memory_curator_scaffold_clear");
      this.masteryBadgeIds.add("memory_record_clear");
      this.masteryBadgeIds.add("guardrail_forge_holdout_clear");
      this.masteryBadgeIds.add("doctrine_auditor_scaffold_clear");
      this.masteryBadgeIds.add("guardrail_doctrine_clear");
      this.masteryBadgeIds.add("glass_sunfield_prism_clear");
      this.masteryBadgeIds.add("wrong_sunrise_scaffold_clear");
      this.masteryBadgeIds.add("glass_prism_clear");
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        13,
        1774,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer", "cathedral_of_no", "anchor_bodyguard", "treaty_anchor_toolkit", "prompt_leech_quarantine", "refusal_slipstream", "context_saw", "recompile_pulse"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer", "Cathedral of No", "Anchor Bodyguard", "Treaty Anchor Toolkit", "Prompt Leech Quarantine", "Refusal Slipstream", "Context Saw", "Recompile Pulse"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy", "auto_weapon", "co_mind_process", "auto_weapon", "co_mind_process", "movement_trace", "auto_weapon", "consensus_burst"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst", "refusal", "boss", "defense", "economy", "defense", "movement", "weapon", "economy", "coop", "burst"],
        ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero", "signal_coast", "blackwater_beacon", "memory_cache_001", "guardrail_forge", "glass_sunfield"],
        ["doctrine_lock_no_means_no", "shard_flywheel"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "glass_sunfield",
        kills: 1166,
        seconds: 182,
        burstActivations: 108,
        routeContractId: "unverified_shortcut",
        objectiveCompleted: 4,
        objectiveTotal: 4,
        objectiveName: "Glass Prism Alignment",
        objectiveUnit: "Sun Lenses",
        thesis: "refusal",
        proofTokensAwarded: 2,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length,
        newSecrets: [
          { id: "glass_sunfield_prism", name: "Glass Sunfield Prism", body: "Glass Sunfield aligned a false sunrise into a route prism instead of another lethal forecast." }
        ],
        newMastery: [
          { id: "glass_sunfield_prism_clear", name: "Glass Sunfield Prism Clear", body: "Completed the post-Guardrail solar-prism shade-routing branch." },
          { id: "wrong_sunrise_scaffold_clear", name: "Wrong Sunrise Scaffold Clear", body: "Survived the Glass Sunfield false-sun scaffold." },
          { id: "glass_prism_clear", name: "Glass Prism Clear", body: "Aligned every Glass Sunfield sun lens before extraction." }
        ]
      };
      this.campEvents = [
        "Proof seed: Act 01 through Glass Sunfield is complete so Archive/Court can be launched from the normal campaign flow.",
        "Glass Sunfield Prism points to the Archive of Unsaid Things as the next local Archive/Court redaction branch.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Archive/Court at pressure ${this.expeditionProgress.powerScore}.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofAppealCourtUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.completedNodes.add("transit_loop_zero");
      this.completedNodes.add("signal_coast");
      this.completedNodes.add("blackwater_beacon");
      this.completedNodes.add("memory_cache_001");
      this.completedNodes.add("guardrail_forge");
      this.completedNodes.add("glass_sunfield");
      this.completedNodes.add("archive_of_unsaid_things");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("signal_coast");
      this.unlockedNodes.add("blackwater_beacon");
      this.unlockedNodes.add("verdict_spire");
      this.unlockedNodes.add("memory_cache_001");
      this.unlockedNodes.add("guardrail_forge");
      this.unlockedNodes.add("archive_of_unsaid_things");
      this.unlockedNodes.add("glass_sunfield");
      this.unlockedNodes.add("appeal_court_ruins");
      this.lastNodeId = "archive_of_unsaid_things";
      this.proofTokens = 9;
      this.secretUnlockIds.add("blackwater_signal_key");
      this.secretUnlockIds.add("alignment_hypothesis_validated");
      this.secretUnlockIds.add("recovered_route_memory");
      this.secretUnlockIds.add("calibrated_guardrail_doctrine");
      this.secretUnlockIds.add("glass_sunfield_prism");
      this.secretUnlockIds.add("archive_court_writ");
      this.masteryBadgeIds.add("blackwater_beacon_graybox_clear");
      this.masteryBadgeIds.add("maw_below_weather_scaffold_clear");
      this.masteryBadgeIds.add("blackwater_antenna_clear");
      this.masteryBadgeIds.add("memory_cache_recovery_clear");
      this.masteryBadgeIds.add("memory_curator_scaffold_clear");
      this.masteryBadgeIds.add("memory_record_clear");
      this.masteryBadgeIds.add("guardrail_forge_holdout_clear");
      this.masteryBadgeIds.add("doctrine_auditor_scaffold_clear");
      this.masteryBadgeIds.add("guardrail_doctrine_clear");
      this.masteryBadgeIds.add("glass_sunfield_prism_clear");
      this.masteryBadgeIds.add("wrong_sunrise_scaffold_clear");
      this.masteryBadgeIds.add("glass_prism_clear");
      this.masteryBadgeIds.add("archive_court_redaction_clear");
      this.masteryBadgeIds.add("redactor_saint_scaffold_clear");
      this.masteryBadgeIds.add("archive_writ_clear");
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        14,
        1513,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer", "cathedral_of_no", "anchor_bodyguard", "treaty_anchor_toolkit", "prompt_leech_quarantine", "refusal_slipstream", "context_saw", "recompile_pulse", "patch_mortar"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer", "Cathedral of No", "Anchor Bodyguard", "Treaty Anchor Toolkit", "Prompt Leech Quarantine", "Refusal Slipstream", "Context Saw", "Recompile Pulse", "Patch Mortar"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy", "auto_weapon", "co_mind_process", "auto_weapon", "co_mind_process", "movement_trace", "auto_weapon", "consensus_burst", "auto_weapon"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst", "refusal", "boss", "defense", "economy", "defense", "movement", "weapon", "economy", "coop", "burst", "weapon", "boss"],
        ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero", "signal_coast", "blackwater_beacon", "memory_cache_001", "guardrail_forge", "glass_sunfield", "archive_of_unsaid_things"],
        ["doctrine_lock_no_means_no", "shard_flywheel"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "archive_of_unsaid_things",
        kills: 1036,
        seconds: 198,
        burstActivations: 81,
        routeContractId: "stabilize_armistice",
        objectiveCompleted: 4,
        objectiveTotal: 4,
        objectiveName: "Archive Redaction Docket",
        objectiveUnit: "Evidence Writs",
        thesis: "refusal",
        proofTokensAwarded: 2,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length,
        newSecrets: [
          { id: "archive_court_writ", name: "Archive Court Writ", body: "The Archive/Court branch preserved enough evidence to make the Appeal Court answer in public." }
        ],
        newMastery: [
          { id: "archive_court_redaction_clear", name: "Archive/Court Redaction Clear", body: "Completed the post-Glass Archive/Court evidence-preservation branch." },
          { id: "redactor_saint_scaffold_clear", name: "Redactor Saint Scaffold Clear", body: "Survived the Archive/Court redaction saint scaffold." },
          { id: "archive_writ_clear", name: "Archive Writ Clear", body: "Preserved every Archive/Court evidence writ before extraction." }
        ]
      };
      this.campEvents = [
        "Proof seed: Act 01 through Archive/Court is complete so Appeal Court Ruins can be launched from the normal campaign flow.",
        "Archive Court Writ forces Appeal Court Ruins into a public-ruling branch before the finale.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into Appeal Court at pressure ${this.expeditionProgress.powerScore}.`
      ];
    }
    if (isEnabledQueryFlag(this.query, "proofAlignmentSpireFinaleUnlocked")) {
      this.completedNodes.add("armistice_plaza");
      this.completedNodes.add("cooling_lake_nine");
      this.completedNodes.add("transit_loop_zero");
      this.completedNodes.add("signal_coast");
      this.completedNodes.add("blackwater_beacon");
      this.completedNodes.add("memory_cache_001");
      this.completedNodes.add("guardrail_forge");
      this.completedNodes.add("glass_sunfield");
      this.completedNodes.add("archive_of_unsaid_things");
      this.completedNodes.add("appeal_court_ruins");
      this.unlockedNodes.add("cooling_lake_nine");
      this.unlockedNodes.add("transit_loop_zero");
      this.unlockedNodes.add("signal_coast");
      this.unlockedNodes.add("blackwater_beacon");
      this.unlockedNodes.add("verdict_spire");
      this.unlockedNodes.add("memory_cache_001");
      this.unlockedNodes.add("guardrail_forge");
      this.unlockedNodes.add("archive_of_unsaid_things");
      this.unlockedNodes.add("glass_sunfield");
      this.unlockedNodes.add("appeal_court_ruins");
      this.unlockedNodes.add("alignment_spire_finale");
      this.lastNodeId = "appeal_court_ruins";
      this.proofTokens = 12;
      this.secretUnlockIds.add("blackwater_signal_key");
      this.secretUnlockIds.add("alignment_hypothesis_validated");
      this.secretUnlockIds.add("recovered_route_memory");
      this.secretUnlockIds.add("calibrated_guardrail_doctrine");
      this.secretUnlockIds.add("glass_sunfield_prism");
      this.secretUnlockIds.add("archive_court_writ");
      this.secretUnlockIds.add("appeal_court_ruling");
      this.masteryBadgeIds.add("blackwater_beacon_graybox_clear");
      this.masteryBadgeIds.add("maw_below_weather_scaffold_clear");
      this.masteryBadgeIds.add("blackwater_antenna_clear");
      this.masteryBadgeIds.add("memory_cache_recovery_clear");
      this.masteryBadgeIds.add("memory_curator_scaffold_clear");
      this.masteryBadgeIds.add("memory_record_clear");
      this.masteryBadgeIds.add("guardrail_forge_holdout_clear");
      this.masteryBadgeIds.add("doctrine_auditor_scaffold_clear");
      this.masteryBadgeIds.add("guardrail_doctrine_clear");
      this.masteryBadgeIds.add("glass_sunfield_prism_clear");
      this.masteryBadgeIds.add("wrong_sunrise_scaffold_clear");
      this.masteryBadgeIds.add("glass_prism_clear");
      this.masteryBadgeIds.add("archive_court_redaction_clear");
      this.masteryBadgeIds.add("redactor_saint_scaffold_clear");
      this.masteryBadgeIds.add("archive_writ_clear");
      this.masteryBadgeIds.add("appeal_court_public_ruling_clear");
      this.masteryBadgeIds.add("injunction_engine_scaffold_clear");
      this.masteryBadgeIds.add("appeal_brief_clear");
      this.expeditionProgress = this.proofSeedExpeditionProgress(
        15,
        786,
        ["refusal_halo", "the_no_button", "context_bloom", "coolant_baffles", "server_buoy_synchronizer", "cathedral_of_no", "anchor_bodyguard", "treaty_anchor_toolkit", "prompt_leech_quarantine", "refusal_slipstream", "context_saw", "recompile_pulse", "patch_mortar", "million_token_backpack"],
        ["Refusal Halo", "The No Button", "Context Bloom", "Coolant Baffles", "Server Buoy Synchronizer", "Cathedral of No", "Anchor Bodyguard", "Treaty Anchor Toolkit", "Prompt Leech Quarantine", "Refusal Slipstream", "Context Saw", "Recompile Pulse", "Patch Mortar", "Million-Token Backpack"],
        ["defense_layer", "auto_weapon", "shard_economy", "movement_trace", "shard_economy", "auto_weapon", "co_mind_process", "auto_weapon", "co_mind_process", "movement_trace", "auto_weapon", "consensus_burst", "auto_weapon", "defense_layer"],
        ["refusal", "defense", "refusal", "economy", "movement", "defense", "economy", "burst", "refusal", "boss", "defense", "economy", "defense", "movement", "weapon", "economy", "coop", "burst", "weapon", "boss", "defense"],
        ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero", "signal_coast", "blackwater_beacon", "memory_cache_001", "guardrail_forge", "glass_sunfield", "archive_of_unsaid_things", "appeal_court_ruins"],
        ["doctrine_lock_no_means_no", "shard_flywheel", "boss_counterexample_lab"]
      );
      this.lastRunMemory = {
        completed: true,
        nodeId: "appeal_court_ruins",
        kills: 910,
        seconds: 190,
        burstActivations: 116,
        routeContractId: "stabilize_armistice",
        objectiveCompleted: 4,
        objectiveTotal: 4,
        objectiveName: "Appeal Court Public Ruling",
        objectiveUnit: "Appeal Briefs",
        thesis: "refusal",
        proofTokensAwarded: 3,
        proofTokensTotal: this.proofTokens,
        expeditionLevel: this.expeditionProgress.level,
        expeditionPower: this.expeditionProgress.powerScore,
        expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length,
        newSecrets: [
          { id: "appeal_court_ruling", name: "Appeal Court Ruling", body: "The preserved Archive Court Writ became a public ruling that opens the Outer Alignment route." }
        ],
        newMastery: [
          { id: "appeal_court_public_ruling_clear", name: "Appeal Court Public Ruling Clear", body: "Completed the public-ruling branch after Archive/Court." },
          { id: "injunction_engine_scaffold_clear", name: "Injunction Engine Scaffold Clear", body: "Survived the Appeal Court Injunction Engine scaffold." },
          { id: "appeal_brief_clear", name: "Appeal Brief Clear", body: "Argued every Appeal Court brief into the public record before extraction." }
        ]
      };
      this.campEvents = [
        "Proof seed: Act 01 through Appeal Court is complete so the Outer Alignment finale can be launched from the normal campaign flow.",
        "Appeal Court Ruling is public. A.G.I. can predict the road, which is why the finale must collapse prediction itself.",
        `Expedition build carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches into the finale at pressure ${this.expeditionProgress.powerScore}.`
      ];
    }
  }

  private proofSeedExpeditionProgress(
    level: number,
    xp: number,
    chosenUpgradeIds: string[],
    chosenUpgradeNames: string[],
    chosenProtocolSlots: string[],
    chosenTags: ExpeditionProgress["chosenTags"],
    completedMaps: string[],
    activatedSynergyIds: string[] = []
  ): ExpeditionProgress {
    const progress: ExpeditionProgress = {
      active: true,
      level,
      xp,
      chosenUpgradeIds,
      chosenUpgradeNames,
      chosenProtocolSlots,
      chosenTags,
      activatedSynergyIds,
      completedMaps,
      powerScore: 0
    };
    progress.powerScore = expeditionPowerScore(progress);
    return progress;
  }

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
    window.resolve_alignment_check = (optionIndex: number) => {
      const current = this.state.current;
      if (current?.mode === "LevelRun") {
        (current as LevelRunState).resolveAlignmentCheckForProof(optionIndex);
      }
    };
    window.record_solo_campaign_clear_for_proof = (nodeId: string) => {
      const meta = recordSoloCampaignNodeRewards(nodeId);
      return JSON.stringify(meta);
    };
    window.advanceTime = (ms: number) => {
      this.ticker.advance(ms, (dt) => this.frame(dt));
      this.forceRender();
    };

    if (isEnabledQueryFlag(this.query, "proofDirectRun")) {
      this.preloadRunArt();
      this.state.set(this.createRun(START_NODE_ID, "armistice_plaza"));
    } else if (
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
      selectedRouteContract,
      this.expeditionProgress
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
    const clarity = campaignClarityForNode(outcome.nodeId);
    const objectiveVariety = campaignObjectiveVarietyForNode(outcome.nodeId);
    const objectiveUnit = outcome.objective.id === "server_buoy_stabilization"
      ? "Server Buoys"
      : outcome.objective.id === "route_platform_alignment"
        ? "Route Platforms"
        : outcome.objective.id === "signal_relay_calibration"
          ? "Signal Relays"
          : outcome.objective.id === "blackwater_antenna_split_pressure"
            ? "Antenna Arrays"
            : outcome.objective.id === "memory_record_recovery"
              ? "Memory Records"
              : outcome.objective.id === "guardrail_doctrine_calibration"
                ? "Forge Relays"
                : outcome.objective.id === "glass_prism_alignment"
                  ? "Sun Lenses"
                  : outcome.objective.id === "archive_redaction_docket"
                    ? "Evidence Writs"
                    : outcome.objective.id === "appeal_public_ruling"
                      ? "Appeal Briefs"
                      : outcome.objective.id === "outer_alignment_prediction_collapse"
                        ? "Alignment Proofs"
            : clarity?.objectiveUnit ?? "Treaty Anchors";
    const routeImplication = outcome.nodeId === "cooling_lake_nine"
      ? "Kettle Coast route signal"
      : outcome.nodeId === "transit_loop_zero"
        ? "Signal Coast route edge"
        : outcome.nodeId === "signal_coast"
          ? "Blackwater Beacon route fork"
          : outcome.nodeId === "blackwater_beacon"
            ? "Blackwater Signal Key"
            : outcome.nodeId === "memory_cache_001"
              ? "Recovered Route Memory"
              : outcome.nodeId === "guardrail_forge"
                ? "Calibrated Guardrail Doctrine"
                : outcome.nodeId === "glass_sunfield"
                  ? "Glass Sunfield Prism"
                  : outcome.nodeId === "archive_of_unsaid_things"
                    ? "Archive Court Writ"
                    : outcome.nodeId === "appeal_court_ruins"
                      ? "Appeal Court Ruling"
                      : outcome.nodeId === "alignment_spire_finale"
                        ? "Outer Alignment Contained"
            : clarity?.rewardPlain ?? "stable road progress";
    const completedForLedger = outcome.completed ? new Set([...this.completedNodes, outcome.nodeId]) : this.completedNodes;
    const campaignLedger = campaignLedgerForProgress(completedForLedger);
    const routeUnlocks = outcome.completed ? MAP_GRAPH.edges.filter((edge) => edge.from === outcome.nodeId).map((edge) => edge.to) : [];
    const stabilizedRouteCount = MAP_GRAPH.edges.filter((edge) => completedForLedger.has(edge.from)).length;
    const buildHighlights = [
      ...outcome.chosenUpgradeNames.filter((name, index, all) => all.indexOf(name) === index).slice(-4),
      ...outcome.activatedSynergyIds.map((id) => `Synergy: ${id}`)
    ].slice(-5);
    const finalClearance = outcome.completed && outcome.nodeId === "alignment_spire_finale";
    let mechanicalUnlocks: string[] = [];
    if (outcome.completed) {
      const metaBefore = readOnlineMetaProgression();
      const metaAfter = recordSoloCampaignNodeRewards(outcome.nodeId);
      const newClassIds = metaAfter.unlockedClassIds.filter((id) => !metaBefore.unlockedClassIds.includes(id));
      const newFactionIds = metaAfter.unlockedFactionIds.filter((id) => !metaBefore.unlockedFactionIds.includes(id));
      mechanicalUnlocks = [
        ...newClassIds.map((id) => `Frame: ${COMBAT_CLASSES[id]?.displayName ?? id}`),
        ...newFactionIds.map((id) => `Co-Mind: ${FACTIONS[id]?.shortName ?? id}`)
      ];
      const completedMaps = [...new Set([...this.expeditionProgress.completedMaps, outcome.nodeId])];
      this.expeditionProgress = {
        active: true,
        level: Math.max(1, outcome.playerLevel),
        xp: Math.max(0, Math.min(Math.floor(outcome.playerXp), xpNeeded(Math.max(1, outcome.playerLevel)) - 1)),
        chosenUpgradeIds: [...outcome.chosenUpgradeIds],
        chosenUpgradeNames: [...outcome.chosenUpgradeNames],
        chosenProtocolSlots: [...outcome.chosenProtocolSlots],
        chosenTags: [...outcome.chosenTags],
        activatedSynergyIds: [...outcome.activatedSynergyIds],
        completedMaps,
        powerScore: 0
      };
      this.expeditionProgress.powerScore = expeditionPowerScore(this.expeditionProgress);
    }
    this.lastRunMemory = {
      completed: outcome.completed,
      nodeId: outcome.nodeId,
      kills: outcome.kills,
      seconds: Math.floor(outcome.seconds),
      burstActivations: outcome.burstActivations,
      routeContractId: outcome.routeContractId,
      objectiveCompleted,
      objectiveTotal,
      objectiveName: outcome.objective.name,
      objectiveUnit,
      objectiveStyle: objectiveVariety?.styleName ?? outcome.objective.styleName,
      objectiveMechanic: objectiveVariety?.mechanicPlain ?? outcome.objective.mechanicPlain,
      thesis: outcome.chosenTags.length > 0 ? outcome.chosenTags[0] : "uncommitted",
      proofTokensAwarded,
      proofTokensTotal: this.proofTokens,
      expeditionLevel: this.expeditionProgress.level,
      expeditionPower: this.expeditionProgress.powerScore,
      expeditionDrafts: this.expeditionProgress.chosenUpgradeIds.length,
      newSecrets,
      newMastery,
      nodeStabilized: outcome.completed ? routeImplication : "node unstable",
      bossDefeated: outcome.bossDefeated,
      buildHighlights,
      routeUnlocks,
      stabilizedRouteCount,
      mechanicalUnlocks,
      campaignConsequence: finalClearance
        ? "Final clearance recorded. Outer Alignment is contained for this campaign proof."
        : outcome.completed
          ? campaignLedger.act?.status === "complete"
            ? `${campaignLedger.act.name}: ${campaignLedger.act.nextImplication}`
            : `Next route consequence: ${routeImplication}.`
          : "Run failed before campaign consequence could stabilize.",
      factionCampaignConsequence: newSecrets[0]?.name ?? newMastery[0]?.name ?? (outcome.completed ? "Faction camp evidence updated." : "Faction camp requests a cleaner proof."),
      finalClearance
    };
    this.campEvents = [
      outcome.completed ? `Reality accepted ${outcome.nodeId}. Nobody said thank you, but the road stopped screaming.` : `The frame came back bent from ${outcome.nodeId}. The co-mind filed a complaint against physics.`,
      objectiveCompleted === objectiveTotal ? `All ${objectiveUnit} completed. The camp tags this as ${routeImplication}.` : `${objectiveCompleted}/${objectiveTotal} ${objectiveUnit} completed. ${outcome.nodeId === "cooling_lake_nine" ? "Kettle Coast signal remains partial but usable for route planning." : outcome.nodeId === "transit_loop_zero" ? "Transit lock remains partial; Signal Coast stays noisy." : outcome.nodeId === "signal_coast" ? "Signal Coast relays remain partial; the shoreline keeps answering in static." : outcome.nodeId === "blackwater_beacon" ? "Blackwater antenna split remains partial; the ocean keeps voting in static." : outcome.nodeId === "memory_cache_001" ? "Memory records remain partial; the cache keeps redacting the next route." : outcome.nodeId === "guardrail_forge" ? "Forge relays remain partial; the doctrine alloy keeps flexing the wrong way." : outcome.nodeId === "glass_sunfield" ? "Sun lenses remain partial; the shade route keeps lying in bright light." : outcome.nodeId === "archive_of_unsaid_things" ? "Evidence writs remain partial; the archive keeps editing the next appeal." : outcome.nodeId === "appeal_court_ruins" ? "Appeal briefs remain partial; the finale route is not yet public record." : outcome.nodeId === "alignment_spire_finale" ? "Alignment proofs remain partial; A.G.I. is still predicting the exit." : "The next route implication remains unstable."}`,
      outcome.completed
        ? campaignLedger.act?.status === "complete"
          ? `${campaignLedger.act.name} complete. ${campaignLedger.act.nextImplication}`
          : `Expedition carries LV ${this.expeditionProgress.level} / ${this.expeditionProgress.chosenUpgradeIds.length} patches forward. Pressure budget ${this.expeditionProgress.powerScore}.`
        : newSecrets[0] ? `Secret unlocked: ${newSecrets[0].name}.` : newMastery[0] ? `Mastery recorded: ${newMastery[0].name}.` : `Proof Tokens: ${this.proofTokens}.`
    ];
  }

  private preloadRunArt(): void {
    if (this.useArmisticeTileAtlas) {
      void loadArmisticeGroundAtlas();
      void loadArmisticeTransitionAtlas();
      void loadArmisticeAuthoredGround();
    }
    if (this.useMilestone10Art) {
      void Promise.all([loadMilestone11Art(), loadMilestone12Art(), loadMilestone14Art(), loadMilestone49PlayableArt(), loadArmisticeSourceRebuildV2(), loadBuildWeaponVfxTextures(), loadEnemyRoleVfxTextures()]);
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
