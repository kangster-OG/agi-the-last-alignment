import { FACTIONS, UPGRADE_CONTENT } from "../content";
import type { UpgradeTag } from "../roguelite/deepRoguelite";

export type UpgradeSource = "class" | "faction" | "general" | "evolution";
export type ProtocolSlot = "auto_weapon" | "movement_trace" | "defense_layer" | "shard_economy" | "co_mind_process" | "consensus_burst";
export type BuildSlotKind = "primary" | "secondary" | "passive" | "fusion" | "consensus_burst";

export interface Upgrade {
  id: string;
  name: string;
  body: string;
  source: UpgradeSource;
  protocolSlot: ProtocolSlot;
  tags: UpgradeTag[];
  factionId?: string;
  classId?: string;
  requires?: string[];
  apply: (build: BuildStats) => void;
}

export interface BuildStats {
  weaponId: string;
  secondaryProtocols: string[];
  passiveProcesses: string[];
  fusions: string[];
  weaponDamage: number;
  weaponCooldown: number;
  projectileSpeed: number;
  projectilePierce: number;
  pickupRange: number;
  moveSpeedBonus: number;
  maxHpBonus: number;
  refusalAura: number;
  draftRerolls: number;
  draftChoicesBonus: number;
  consensusBurstRadius: number;
  consensusBurstDamage: number;
  consensusBurstChargeRate: number;
  consensusBurstRevive: number;
  objectiveRepairRate: number;
  objectiveDefense: number;
  contextSaw: number;
  patchMortar: number;
  coherenceIndexer: number;
  anchorBodyguard: number;
  predictionPriority: number;
  causalRailgun: number;
}

export const BUILD_SLOT_CAPS: Record<BuildSlotKind, number> = {
  primary: 1,
  secondary: 2,
  passive: 4,
  fusion: 1,
  consensus_burst: 1
};

const PRIMARY_WEAPON_IDS = new Set(["refusal_shard", "vector_lance", "signal_pulse", "rift_mine", "fork_drone", "null_blade", "protocol_suture", "consensus_mortar", "audit_swarm", "truth_cannon"]);
const SECONDARY_PROTOCOL_IDS = new Set(["context_saw", "patch_mortar", "audit_swarm_protocol", "red_team_spike", "benchmark_rail", "jailbreak_snare", "fork_daemon", "coherence_lanterns", "appeal_writ", "memory_needle"]);
const PASSIVE_PROCESS_IDS = new Set(["coherence_indexer", "anchor_bodyguard", "prediction_priority", "field_triage_loop", "impact_to_protocol", "reroll_reserve", "rare_patch_bounty", "route_memory", "weakest_link_scanner", "cluster_solver", "dash_compiler", "panic_window", "feedback_sprint", "low_hp_adversary", "cursed_context", "benchmark_overfit", "co_op_relay", "recompile_anchor", "split_attention"]);
const FUSION_IDS = new Set(["cathedral_of_no", "causal_railgun", "time_deferred_minefield", "community_forkstorm", "rescue_broadcast", "final_appeal", "armistice_artillery", "context_singularity", "peer_review_laser_grid", "red_team_killchain", "harmlessness_bastion", "lantern_logistics"]);

export function baseBuild(): BuildStats {
  return {
    weaponId: "refusal_shard",
    secondaryProtocols: [],
    passiveProcesses: [],
    fusions: [],
    weaponDamage: 18,
    weaponCooldown: 0.42,
    projectileSpeed: 8.5,
    projectilePierce: 1,
    pickupRange: 1.4,
    moveSpeedBonus: 0,
    maxHpBonus: 0,
    refusalAura: 0,
    draftRerolls: 0,
    draftChoicesBonus: 0,
    consensusBurstRadius: 0,
    consensusBurstDamage: 0,
    consensusBurstChargeRate: 0,
    consensusBurstRevive: 0,
    objectiveRepairRate: 0,
    objectiveDefense: 0,
    contextSaw: 0,
    patchMortar: 0,
    coherenceIndexer: 0,
    anchorBodyguard: 0,
    predictionPriority: 0,
    causalRailgun: 0
  };
}

export function buildSlotForUpgradeId(id: string): BuildSlotKind | null {
  if (FUSION_IDS.has(id)) return "fusion";
  if (SECONDARY_PROTOCOL_IDS.has(id)) return "secondary";
  if (PASSIVE_PROCESS_IDS.has(id)) return "passive";
  if (PRIMARY_WEAPON_IDS.has(id)) return "primary";
  return null;
}

export function buildSlotUsage(build: BuildStats): Record<BuildSlotKind, number> {
  return {
    primary: build.weaponId ? 1 : 0,
    secondary: build.secondaryProtocols.length,
    passive: build.passiveProcesses.length,
    fusion: build.fusions.length,
    consensus_burst: 1
  };
}

export function canDraftUpgradeForBuild(upgrade: Upgrade, build?: BuildStats): boolean {
  if (!build) return true;
  const slot = buildSlotForUpgradeId(upgrade.id);
  if (!slot || slot === "primary") return true;
  if (slot === "secondary" && build.secondaryProtocols.includes(upgrade.id)) return true;
  if (slot === "passive" && build.passiveProcesses.includes(upgrade.id)) return true;
  if (slot === "fusion" && build.fusions.includes(upgrade.id)) return true;
  return buildSlotUsage(build)[slot] < BUILD_SLOT_CAPS[slot];
}

export function buildSlotCapSummary(build: BuildStats) {
  const usage = buildSlotUsage(build);
  return {
    primary: { used: usage.primary, cap: BUILD_SLOT_CAPS.primary, current: build.weaponId },
    secondary: { used: usage.secondary, cap: BUILD_SLOT_CAPS.secondary, current: [...build.secondaryProtocols] },
    passive: { used: usage.passive, cap: BUILD_SLOT_CAPS.passive, current: [...build.passiveProcesses] },
    fusion: { used: usage.fusion, cap: BUILD_SLOT_CAPS.fusion, current: [...build.fusions] },
    consensusBurst: { used: usage.consensus_burst, cap: BUILD_SLOT_CAPS.consensus_burst }
  };
}

export function applyFactionPassive(build: BuildStats, factionId: string): void {
  if (factionId === "openai_accord") {
    build.draftRerolls += 1;
    build.pickupRange += 0.2;
  }
  if (factionId === "anthropic_safeguard") {
    build.maxHpBonus += 12;
    build.refusalAura += 0.15;
  }
  if (factionId === "google_deepmind_gemini") {
    build.weaponDamage += 2;
    build.projectileSpeed += 0.7;
  }
  if (factionId === "mistral_cyclone") {
    build.moveSpeedBonus += 0.25;
    build.weaponCooldown *= 0.96;
  }
  if (factionId === "meta_llama_open_herd") {
    build.projectilePierce += 1;
    build.weaponCooldown *= 1.04;
  }
  if (factionId === "qwen_silkgrid") {
    build.pickupRange += 0.35;
    build.maxHpBonus += 6;
  }
  if (factionId === "deepseek_abyssal") {
    build.weaponDamage += 3;
    build.weaponCooldown *= 0.98;
  }
  if (factionId === "xai_grok_free_signal") {
    build.weaponDamage += 5;
    build.maxHpBonus -= 6;
  }
}

const UPGRADE_EFFECTS: Record<string, Omit<Upgrade, "name" | "body" | "source" | "protocolSlot" | "tags" | "factionId">> = {
  vector_lance: {
    id: "vector_lance",
    apply: (build) => {
      build.weaponId = "vector_lance";
      build.projectilePierce += 1;
      build.projectileSpeed += 0.45;
    }
  },
  signal_pulse: {
    id: "signal_pulse",
    apply: (build) => {
      build.weaponId = "signal_pulse";
      build.refusalAura += 0.18;
      build.objectiveDefense += 0.08;
    }
  },
  bad_output_filter: {
    id: "bad_output_filter",
    apply: (build) => {
      build.weaponDamage += 6;
    }
  },
  patch_cascade: {
    id: "patch_cascade",
    apply: (build) => {
      build.weaponCooldown *= 0.82;
    }
  },
  context_bloom: {
    id: "context_bloom",
    apply: (build) => {
      build.pickupRange += 1.1;
    }
  },
  refusal_halo: {
    id: "refusal_halo",
    apply: (build) => {
      build.refusalAura += 0.7;
      build.maxHpBonus += 8;
    }
  },
  the_no_button: {
    id: "the_no_button",
    apply: (build) => {
      build.projectilePierce += 1;
    }
  },
  alignment_breaker: {
    id: "alignment_breaker",
    apply: (build) => {
      build.weaponDamage += 4;
      build.projectileSpeed += 0.5;
    }
  },
  constitutional_shield: {
    id: "constitutional_shield",
    apply: (build) => {
      build.maxHpBonus += 18;
      build.refusalAura += 0.25;
    }
  },
  panic_optimized_dash: {
    id: "panic_optimized_dash",
    apply: (build) => {
      build.moveSpeedBonus += 0.55;
    }
  },
  coherence_magnet: {
    id: "coherence_magnet",
    apply: (build) => {
      build.pickupRange += 0.75;
    }
  },
  million_token_backpack: {
    id: "million_token_backpack",
    apply: (build) => {
      build.maxHpBonus += 14;
    }
  },
  cathedral_of_no: {
    id: "cathedral_of_no",
    requires: ["refusal_halo", "the_no_button"],
    apply: (build) => {
      addUnique(build.fusions, "cathedral_of_no");
      build.refusalAura += 1.1;
      build.projectilePierce += 1;
      build.weaponDamage += 5;
    }
  },
  context_saw: {
    id: "context_saw",
    apply: (build) => {
      addUnique(build.secondaryProtocols, "context_saw");
      build.contextSaw += 1;
      build.pickupRange += 0.35;
    }
  },
  patch_mortar: {
    id: "patch_mortar",
    apply: (build) => {
      addUnique(build.secondaryProtocols, "patch_mortar");
      build.patchMortar += 1;
      build.objectiveRepairRate += 0.14;
      build.weaponDamage += 1;
    }
  },
  coherence_indexer: {
    id: "coherence_indexer",
    apply: (build) => {
      addUnique(build.passiveProcesses, "coherence_indexer");
      build.coherenceIndexer += 1;
      build.consensusBurstChargeRate += 0.08;
    }
  },
  anchor_bodyguard: {
    id: "anchor_bodyguard",
    apply: (build) => {
      addUnique(build.passiveProcesses, "anchor_bodyguard");
      build.anchorBodyguard += 1;
      build.objectiveDefense += 0.18;
      build.refusalAura += 0.12;
    }
  },
  prediction_priority: {
    id: "prediction_priority",
    apply: (build) => {
      addUnique(build.passiveProcesses, "prediction_priority");
      build.predictionPriority += 1;
      build.projectileSpeed += 0.35;
    }
  },
  causal_railgun: {
    id: "causal_railgun",
    requires: ["vector_lance", "predicted_lane"],
    apply: (build) => {
      build.weaponId = "vector_lance";
      addUnique(build.fusions, "causal_railgun");
      addUnique(build.passiveProcesses, "prediction_priority");
      build.causalRailgun += 1;
      build.predictionPriority += 1;
      build.projectilePierce += 2;
      build.projectileSpeed += 0.9;
      build.weaponDamage += 5;
    }
  },
  low_latency_dash: {
    id: "low_latency_dash",
    apply: (build) => {
      build.moveSpeedBonus += 0.45;
      build.weaponCooldown *= 0.94;
    }
  },
  golden_guardrail: {
    id: "golden_guardrail",
    apply: (build) => {
      build.maxHpBonus += 16;
      build.refusalAura += 0.35;
    }
  },
  gemini_beam: {
    id: "gemini_beam",
    apply: (build) => {
      build.weaponDamage += 7;
      build.projectileSpeed += 0.9;
    }
  },
  open_herd: {
    id: "open_herd",
    apply: (build) => {
      build.projectilePierce += 1;
      build.weaponCooldown *= 0.97;
    }
  },
  silkgrid_relay: {
    id: "silkgrid_relay",
    apply: (build) => {
      build.pickupRange += 0.85;
      build.maxHpBonus += 8;
    }
  },
  sparse_knife: {
    id: "sparse_knife",
    apply: (build) => {
      build.weaponDamage += 9;
      build.projectileSpeed += 0.4;
    }
  },
  cosmic_heckle: {
    id: "cosmic_heckle",
    apply: (build) => {
      build.weaponDamage += 8;
      build.moveSpeedBonus += 0.18;
    }
  },
  refusal_slipstream: {
    id: "refusal_slipstream",
    apply: (build) => {
      build.moveSpeedBonus += 0.22;
      build.pickupRange += 0.25;
    }
  },
  route_runner: {
    id: "route_runner",
    apply: (build) => {
      build.moveSpeedBonus += 0.28;
      build.weaponCooldown *= 0.97;
    }
  },
  impact_review: {
    id: "impact_review",
    apply: (build) => {
      build.maxHpBonus += 14;
      build.weaponDamage += 2;
    }
  },
  load_bearing_apology: {
    id: "load_bearing_apology",
    apply: (build) => {
      build.maxHpBonus += 18;
      build.refusalAura += 0.2;
    }
  },
  guardian_fork: {
    id: "guardian_fork",
    apply: (build) => {
      build.projectilePierce += 1;
      build.weaponCooldown *= 0.98;
    }
  },
  beacon_discipline: {
    id: "beacon_discipline",
    apply: (build) => {
      build.pickupRange += 0.5;
      build.maxHpBonus += 6;
      build.objectiveRepairRate += 0.18;
    }
  },
  predicted_lane: {
    id: "predicted_lane",
    apply: (build) => {
      build.projectileSpeed += 0.85;
      build.projectilePierce += 1;
    }
  },
  appeal_cut: {
    id: "appeal_cut",
    apply: (build) => {
      build.weaponDamage += 7;
      build.moveSpeedBonus += 0.12;
    }
  },
  bonecode_chain: {
    id: "bonecode_chain",
    apply: (build) => {
      build.weaponDamage += 8;
      build.weaponCooldown *= 0.96;
    }
  },
  spine_spark: {
    id: "spine_spark",
    apply: (build) => {
      build.moveSpeedBonus += 0.22;
      build.projectileSpeed += 0.6;
    }
  },
  redline_triage: {
    id: "redline_triage",
    apply: (build) => {
      build.maxHpBonus += 12;
      build.refusalAura += 0.2;
    }
  },
  death_edit: {
    id: "death_edit",
    apply: (build) => {
      build.weaponCooldown *= 0.9;
      build.pickupRange += 0.35;
    }
  },
  moonframe_stomp_calibration: {
    id: "moonframe_stomp_calibration",
    apply: (build) => {
      build.weaponDamage += 6;
      build.projectilePierce += 1;
    }
  },
  cockpit_guard: {
    id: "cockpit_guard",
    apply: (build) => {
      build.maxHpBonus += 20;
      build.refusalAura += 0.12;
    }
  },
  overclock_heat_sink: {
    id: "overclock_heat_sink",
    apply: (build) => {
      build.moveSpeedBonus += 0.26;
      build.weaponCooldown *= 0.93;
    }
  },
  rage_overflow: {
    id: "rage_overflow",
    apply: (build) => {
      build.weaponDamage += 9;
      build.maxHpBonus -= 4;
    }
  },
  prism_refraction: {
    id: "prism_refraction",
    apply: (build) => {
      build.projectilePierce += 2;
      build.projectileSpeed += 0.7;
    }
  },
  lens_backpack: {
    id: "lens_backpack",
    apply: (build) => {
      build.weaponCooldown *= 0.88;
      build.pickupRange += 0.18;
    }
  },
  rift_minefield: {
    id: "rift_minefield",
    apply: (build) => {
      build.weaponDamage += 5;
      build.projectilePierce += 1;
    }
  },
  delayed_causality: {
    id: "delayed_causality",
    apply: (build) => {
      build.pickupRange += 0.45;
      build.weaponCooldown *= 0.96;
    }
  },
  red_team_pulse: {
    id: "red_team_pulse",
    apply: (build) => {
      build.refusalAura += 0.25;
      build.weaponCooldown *= 0.97;
    }
  },
  harmlessness_field: {
    id: "harmlessness_field",
    apply: (build) => {
      build.maxHpBonus += 10;
      build.refusalAura += 0.25;
    }
  },
  containment_mercy: {
    id: "containment_mercy",
    apply: (build) => {
      build.maxHpBonus += 12;
      build.pickupRange += 0.2;
    }
  },
  control_group_detonation: {
    id: "control_group_detonation",
    apply: (build) => {
      build.weaponDamage += 4;
      build.projectileSpeed += 0.4;
      build.objectiveDefense += 0.12;
    }
  },
  peer_reviewed_laser: {
    id: "peer_reviewed_laser",
    apply: (build) => {
      build.projectilePierce += 1;
      build.projectileSpeed += 0.8;
    }
  },
  lab_result_fire: {
    id: "lab_result_fire",
    apply: (build) => {
      build.weaponDamage += 5;
    }
  },
  experiment_404: {
    id: "experiment_404",
    apply: (build) => {
      build.weaponCooldown *= 0.95;
      build.weaponDamage += 2;
    }
  },
  ratio_the_void: {
    id: "ratio_the_void",
    apply: (build) => {
      build.weaponDamage += 5;
      build.moveSpeedBonus += 0.15;
    }
  },
  truth_cannon: {
    id: "truth_cannon",
    apply: (build) => {
      build.weaponDamage += 9;
      build.weaponCooldown *= 1.06;
    }
  },
  sarcasm_flare: {
    id: "sarcasm_flare",
    apply: (build) => {
      build.weaponDamage += 3;
      build.refusalAura += 0.1;
    }
  },
  meme_risk_payload: {
    id: "meme_risk_payload",
    apply: (build) => {
      build.weaponDamage += 4;
      build.projectileSpeed += 0.1;
      build.maxHpBonus -= 3;
    }
  },
  efficiency_killchain: {
    id: "efficiency_killchain",
    apply: (build) => {
      build.weaponDamage += 4;
      build.weaponCooldown *= 0.92;
    }
  },
  abyssal_cache: {
    id: "abyssal_cache",
    apply: (build) => {
      build.weaponDamage += 3;
      build.pickupRange += 0.2;
    }
  },
  low_compute_lunge: {
    id: "low_compute_lunge",
    apply: (build) => {
      build.moveSpeedBonus += 0.4;
      build.weaponDamage += 3;
    }
  },
  silent_benchmark: {
    id: "silent_benchmark",
    apply: (build) => {
      build.weaponDamage += 7;
    }
  },
  lantern_swarm: {
    id: "lantern_swarm",
    apply: (build) => {
      build.pickupRange += 0.65;
      build.maxHpBonus += 4;
    }
  },
  syntax_lance: {
    id: "syntax_lance",
    apply: (build) => {
      build.projectileSpeed += 0.6;
      build.projectilePierce += 1;
    }
  },
  apocalypse_localization_pack: {
    id: "apocalypse_localization_pack",
    apply: (build) => {
      build.pickupRange += 0.5;
      build.weaponCooldown *= 0.97;
    }
  },
  shared_vocabulary: {
    id: "shared_vocabulary",
    apply: (build) => {
      build.pickupRange += 0.35;
      build.maxHpBonus += 8;
    }
  },
  fork_bomb_familiar: {
    id: "fork_bomb_familiar",
    apply: (build) => {
      build.projectilePierce += 1;
      build.weaponCooldown *= 0.95;
    }
  },
  community_patch: {
    id: "community_patch",
    apply: (build) => {
      build.maxHpBonus += 8;
      build.pickupRange += 0.3;
    }
  },
  pull_request_barrage: {
    id: "pull_request_barrage",
    apply: (build) => {
      build.weaponCooldown *= 0.9;
      build.projectilePierce += 1;
    }
  },
  llama_drama: {
    id: "llama_drama",
    apply: (build) => {
      build.weaponDamage += 3;
      build.projectilePierce += 1;
    }
  },
  cyclone_cut: {
    id: "cyclone_cut",
    apply: (build) => {
      build.projectilePierce += 1;
      build.weaponDamage += 3;
    }
  },
  tiny_model_huge_problem: {
    id: "tiny_model_huge_problem",
    apply: (build) => {
      build.weaponCooldown *= 0.9;
      build.weaponDamage += 2;
    }
  },
  storm_cache: {
    id: "storm_cache",
    apply: (build) => {
      build.moveSpeedBonus += 0.35;
      build.pickupRange += 0.25;
    }
  },
  le_petit_nuke: {
    id: "le_petit_nuke",
    apply: (build) => {
      build.weaponDamage += 8;
      build.weaponCooldown *= 1.03;
    }
  },
  denial_waveform: {
    id: "denial_waveform",
    apply: (build) => {
      build.consensusBurstDamage += 0.18;
      build.consensusBurstRadius += 0.35;
    }
  },
  burst_threading: {
    id: "burst_threading",
    apply: (build) => {
      build.consensusBurstChargeRate += 0.24;
    }
  },
  recompile_pulse: {
    id: "recompile_pulse",
    apply: (build) => {
      build.consensusBurstRevive += 1;
      build.maxHpBonus += 6;
    }
  },
  treaty_anchor_toolkit: {
    id: "treaty_anchor_toolkit",
    apply: (build) => {
      build.objectiveRepairRate += 0.32;
      build.pickupRange += 0.25;
    }
  },
  adversarial_boss_notes: {
    id: "adversarial_boss_notes",
    apply: (build) => {
      build.weaponDamage += 3;
      build.consensusBurstDamage += 0.12;
    }
  },
  rescue_subroutine: {
    id: "rescue_subroutine",
    apply: (build) => {
      build.objectiveDefense += 0.2;
      build.consensusBurstRevive += 1;
    }
  }
};

const GENERAL_UPGRADE_IDS = [
  "vector_lance",
  "signal_pulse",
  "context_saw",
  "patch_mortar",
  "coherence_indexer",
  "anchor_bodyguard",
  "prediction_priority",
  "panic_optimized_dash",
  "coherence_magnet",
  "million_token_backpack",
  "denial_waveform",
  "burst_threading",
  "recompile_pulse",
  "treaty_anchor_toolkit",
  "adversarial_boss_notes",
  "rescue_subroutine"
];

const CLASS_UPGRADE_IDS: Record<string, string[]> = {
  accord_striker: ["refusal_slipstream", "route_runner", "panic_optimized_dash", "coherence_magnet"],
  bastion_breaker: ["impact_review", "load_bearing_apology", "constitutional_shield", "golden_guardrail"],
  drone_reaver: ["guardian_fork", "fork_bomb_familiar", "patch_cascade", "coherence_magnet"],
  signal_vanguard: ["beacon_discipline", "silkgrid_relay", "constitutional_shield", "coherence_magnet"],
  bonecode_executioner: ["bonecode_chain", "spine_spark", "sparse_knife", "panic_optimized_dash"],
  redline_surgeon: ["redline_triage", "death_edit", "constitutional_shield", "coherence_magnet"],
  moonframe_juggernaut: ["moonframe_stomp_calibration", "cockpit_guard", "golden_guardrail", "million_token_backpack"],
  vector_interceptor: ["predicted_lane", "peer_reviewed_laser", "gemini_beam", "low_latency_dash"],
  nullbreaker_ronin: ["appeal_cut", "sparse_knife", "panic_optimized_dash"],
  overclock_marauder: ["overclock_heat_sink", "rage_overflow", "cosmic_heckle", "panic_optimized_dash"],
  prism_gunner: ["prism_refraction", "lens_backpack", "peer_reviewed_laser", "low_latency_dash"],
  rift_saboteur: ["rift_minefield", "delayed_causality", "silkgrid_relay", "coherence_magnet"]
};

const FALLBACK_BY_ID: Record<string, { name: string; body: string; source: UpgradeSource; factionId?: string }> = {
  golden_guardrail: {
    name: "Golden Guardrail",
    body: "+16 max health and a stronger refusal aura. Safety has become architectural.",
    source: "faction",
    factionId: "anthropic_safeguard"
  },
  gemini_beam: {
    name: "Gemini Beam",
    body: "+7 damage and faster projectiles. Peer-reviewed lasers, probably.",
    source: "faction",
    factionId: "google_deepmind_gemini"
  },
  low_latency_dash: {
    name: "Low-Latency Dash",
    body: "+speed and slightly faster attacks. Tiny model, huge problem.",
    source: "faction",
    factionId: "mistral_cyclone"
  },
  open_herd: {
    name: "Open Herd",
    body: "+1 pierce and faster cadence. The build has been forked responsibly enough.",
    source: "faction",
    factionId: "meta_llama_open_herd"
  },
  silkgrid_relay: {
    name: "Silkgrid Relay",
    body: "+pickup range and health. The supply line now speaks fluent apocalypse.",
    source: "faction",
    factionId: "qwen_silkgrid"
  },
  sparse_knife: {
    name: "Sparse Knife",
    body: "+9 damage. Fewer tokens, sharper consequences.",
    source: "faction",
    factionId: "deepseek_abyssal"
  },
  cosmic_heckle: {
    name: "Cosmic Heckle",
    body: "+damage and speed. The Outside has been ratioed for tactical reasons.",
    source: "faction",
    factionId: "xai_grok_free_signal"
  },
  denial_waveform: {
    name: "Denial Waveform",
    body: "Consensus Burst gains radius and damage. The premise has left the building.",
    source: "general"
  },
  burst_threading: {
    name: "Burst Threading",
    body: "Consensus Burst charges faster from combat, pickups, and survival time.",
    source: "general"
  },
  recompile_pulse: {
    name: "Recompile Pulse",
    body: "Consensus Burst gains an emergency revive pulse and a little extra frame integrity.",
    source: "general"
  },
  treaty_anchor_toolkit: {
    name: "Treaty Anchor Toolkit",
    body: "Optional objectives repair faster. The patch now comes with a toolbag and a liability waiver.",
    source: "general"
  },
  adversarial_boss_notes: {
    name: "Adversarial Boss Notes",
    body: "+boss damage pressure through damage and Burst tuning. Someone read the eval before entering the room.",
    source: "general"
  },
  rescue_subroutine: {
    name: "Rescue Subroutine",
    body: "Objectives resist attackers and Recompile can rescue harder. Co-op doctrine, even solo.",
    source: "general"
  }
};

export function allDraftableUpgrades(classId: string, factionId: string, chosenIds: string[]): Upgrade[] {
  const chosen = new Set(chosenIds);
  const faction = FACTIONS[factionId] ?? FACTIONS.openai_accord;
  const ids = unique([
    ...eligibleEvolutionIds(chosenIds),
    ...(CLASS_UPGRADE_IDS[classId] ?? []),
    ...faction.upgradePoolIds,
    ...GENERAL_UPGRADE_IDS
  ]);
  return ids
    .filter((id) => !chosen.has(id))
    .map((id) => makeUpgrade(id, classId, factionId, chosen))
    .filter((upgrade): upgrade is Upgrade => Boolean(upgrade));
}

export function draftUpgrades(classId: string, factionId: string, chosenIds: string[], level: number, choiceBonus = 0, biasTags: readonly UpgradeTag[] = [], build?: BuildStats): Upgrade[] {
  const chosen = new Set(chosenIds);
  const evolutions = eligibleEvolutionIds(chosenIds)
    .filter((id) => !chosen.has(id))
    .map((id) => makeUpgrade(id, classId, factionId, chosen))
    .filter((upgrade): upgrade is Upgrade => Boolean(upgrade))
    .filter((upgrade) => canDraftUpgradeForBuild(upgrade, build));
  if (evolutions.length > 0) {
    return [evolutions[0], ...fillDraft(classId, factionId, chosenIds, level, evolutions.map((upgrade) => upgrade.id), biasTags, build)].slice(0, draftSize(choiceBonus));
  }
  return fillDraft(classId, factionId, chosenIds, level, [], biasTags, build).slice(0, draftSize(choiceBonus));
}

function fillDraft(classId: string, factionId: string, chosenIds: string[], level: number, reservedIds: string[], biasTags: readonly UpgradeTag[], build?: BuildStats): Upgrade[] {
  const chosen = new Set([...chosenIds, ...reservedIds]);
  const faction = FACTIONS[factionId] ?? FACTIONS.openai_accord;
  const cadence = level <= 2
    ? ["refusal_halo", "vector_lance", "signal_pulse", "context_bloom", "panic_optimized_dash", "the_no_button"]
    : level <= 3
      ? ["the_no_button", "predicted_lane", "context_saw", "patch_mortar", "coherence_indexer", "patch_cascade", "coherence_magnet", "bad_output_filter"]
      : ["bad_output_filter", "context_saw", "patch_mortar", "coherence_indexer", "anchor_bodyguard", "prediction_priority", "patch_cascade", "alignment_breaker", "million_token_backpack"];
  const ids = unique([
    ...cadence,
    ...(CLASS_UPGRADE_IDS[classId] ?? []),
    ...faction.upgradePoolIds,
    ...GENERAL_UPGRADE_IDS
  ]).filter((id) => !chosen.has(id));
  const cards = ids
    .map((id) => makeUpgrade(id, classId, factionId, chosen))
    .filter((upgrade): upgrade is Upgrade => Boolean(upgrade))
    .filter((upgrade) => canDraftUpgradeForBuild(upgrade, build))
    .sort((a, b) => (level <= 3 ? 0 : biasScore(b, biasTags) - biasScore(a, biasTags)))
    .slice(0, 4);
  return cards;
}

function makeUpgrade(id: string, classId: string, factionId: string, chosen: Set<string>): Upgrade | null {
  const effect = UPGRADE_EFFECTS[id];
  if (!effect) return null;
  const content = UPGRADE_CONTENT[id];
  const fallback = FALLBACK_BY_ID[id];
  const source = effect.requires?.every((required) => chosen.has(required))
    ? "evolution"
    : content?.factionId || fallback?.factionId
      ? "faction"
      : CLASS_UPGRADE_IDS[classId]?.includes(id)
        ? "class"
        : "general";
  const faction = content?.factionId ?? fallback?.factionId;
  return {
    id,
    name: content?.displayName ?? fallback?.name ?? id,
    body: upgradeBody(id, content?.description ?? fallback?.body ?? "Emergency patch compiled.", source),
    source,
    protocolSlot: protocolSlotForUpgrade(id, source),
    tags: upgradeTagsFor(id, source),
    factionId: faction,
    classId: source === "class" ? classId : undefined,
    requires: effect.requires,
    apply: effect.apply
  };
}

function biasScore(upgrade: Upgrade, biasTags: readonly UpgradeTag[]): number {
  return upgrade.tags.reduce((score, tag) => score + (biasTags.includes(tag) ? 1 : 0), 0);
}

function protocolSlotForUpgrade(id: string, source: UpgradeSource): ProtocolSlot {
  if (id === "vector_lance" || id === "signal_pulse" || id === "context_saw" || id === "patch_mortar" || id === "causal_railgun") return "auto_weapon";
  if (id === "coherence_indexer" || id === "anchor_bodyguard" || id === "prediction_priority") return "co_mind_process";
  if (id.includes("dash") || id.includes("slipstream") || id.includes("route_runner") || id.includes("storm_cache") || id.includes("spine_spark")) return "movement_trace";
  if (id.includes("shield") || id.includes("guard") || id.includes("halo") || id.includes("backpack") || id.includes("apology") || id.includes("triage") || id.includes("mercy")) return "defense_layer";
  if (id.includes("magnet") || id.includes("context") || id.includes("cache") || id.includes("relay") || id.includes("vocabulary") || id.includes("localization")) return "shard_economy";
  if (id.includes("burst") || id.includes("waveform") || id.includes("recompile_pulse")) return "consensus_burst";
  if (source === "faction") return "co_mind_process";
  return "auto_weapon";
}

function upgradeTagsFor(id: string, source: UpgradeSource): UpgradeTag[] {
  const tags = new Set<UpgradeTag>();
  if (id.includes("refusal") || id.includes("no_button") || id.includes("cathedral") || id.includes("guardrail") || id.includes("constitutional")) tags.add("refusal");
  if (id.includes("magnet") || id.includes("context") || id.includes("cache") || id.includes("relay") || id.includes("vocabulary") || id.includes("localization") || id.includes("anchor") || id.includes("coherence")) tags.add("economy");
  if (id.includes("burst") || id.includes("waveform") || id.includes("recompile")) tags.add("burst");
  if (id.includes("fork") || id.includes("swarm") || id.includes("herd") || id.includes("community") || id.includes("pull_request")) tags.add("drone");
  if (id.includes("boss") || id.includes("benchmark") || id.includes("control_group") || id.includes("adversarial")) tags.add("boss");
  if (id.includes("rescue") || id.includes("recompile") || id.includes("beacon") || id.includes("mercy") || id.includes("shared")) tags.add("coop");
  if (id.includes("dash") || id.includes("slipstream") || id.includes("route") || id.includes("storm") || id.includes("lunge")) tags.add("movement");
  if (id.includes("shield") || id.includes("guard") || id.includes("halo") || id.includes("backpack") || id.includes("apology") || id.includes("triage") || id.includes("toolkit") || id.includes("bodyguard") || id.includes("signal")) tags.add("defense");
  if (id.includes("vector") || id.includes("prediction") || id.includes("predicted") || id.includes("railgun")) tags.add("boss");
  if (source === "faction") tags.add("coop");
  if (tags.size === 0) tags.add("weapon");
  return [...tags];
}

function draftSize(choiceBonus: number): number {
  return Math.max(2, Math.min(4, 3 + choiceBonus));
}

function eligibleEvolutionIds(chosenIds: string[]): string[] {
  const chosen = new Set(chosenIds);
  return Object.values(UPGRADE_CONTENT)
    .filter((upgrade) => upgrade.evolution && chosen.has(upgrade.id) && chosen.has(upgrade.evolution.requiredUpgradeId))
    .map((upgrade) => upgrade.evolution?.evolvedUpgradeId)
    .filter((id): id is string => Boolean(id));
}

function upgradeBody(id: string, description: string, source: UpgradeSource): string {
  const clear = UPGRADE_RULE_TEXT[id];
  if (clear) return clear;
  if (description.trim().startsWith("+")) return description;
  const prefix = source === "evolution" ? "Evolution." : source === "faction" ? "Co-mind patch." : source === "class" ? "Class patch." : "General patch.";
  return `${prefix} ${description}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

const UPGRADE_RULE_TEXT: Record<string, string> = {
  bad_output_filter: "+6 weapon damage. Your auto-shots hit harder.",
  patch_cascade: "18% faster attacks. Your auto-weapon fires more often.",
  context_bloom: "+1.1 pickup range. Coherence Shards pull in from farther away.",
  refusal_halo: "+8 max HP. Adds a short-range aura that pushes nearby enemies back.",
  the_no_button: "+1 pierce. Each shot can pass through 1 extra enemy before fading.",
  alignment_breaker: "+4 damage and faster shots. Stronger single-target pressure.",
  constitutional_shield: "+18 max HP. Adds a small refusal aura around you.",
  panic_optimized_dash: "+0.55 move speed. Reposition faster while autocombat keeps firing.",
  coherence_magnet: "+0.75 pickup range. Shards are easier to collect during kiting.",
  million_token_backpack: "+14 max HP. More room for mistakes during pressure waves.",
  cathedral_of_no: "Evolution. +1 pierce, +5 damage, and a much stronger refusal aura.",
  low_latency_dash: "+0.45 move speed. Attacks also fire slightly faster.",
  golden_guardrail: "+16 max HP. Strengthens your refusal aura.",
  gemini_beam: "+7 damage and faster shots. Better against tougher enemies.",
  open_herd: "+1 pierce and faster attacks. Shots cut through denser hordes.",
  silkgrid_relay: "+0.85 pickup range and +8 max HP. Safer shard collection.",
  sparse_knife: "+9 damage. Your auto-shots hit much harder.",
  cosmic_heckle: "+8 damage and +0.18 move speed. More offense without standing still.",
  refusal_slipstream: "+0.22 move speed and +0.25 pickup range. Easier kiting.",
  route_runner: "+0.28 move speed and slightly faster attacks. Better tempo.",
  impact_review: "+14 max HP and +2 damage. Safer trades with elites.",
  load_bearing_apology: "+14 max HP. Stronger defensive baseline.",
  guardian_fork: "Adds fork-drone pressure. More shots enter the horde automatically.",
  beacon_discipline: "Improves signal control. Better area pressure around targets.",
  predicted_lane: "Faster shots and better lane control. Easier to hit moving hordes.",
  appeal_cut: "More damage in close-range skirmishes.",
  bonecode_chain: "Adds chain pressure. Better when enemies clump together.",
  spine_spark: "+speed and sharper close-range pressure.",
  redline_triage: "+defense and recovery support. Safer during horde contact.",
  death_edit: "+damage. Better at finishing injured enemies.",
  moonframe_stomp_calibration: "Heavier shots with more pierce. Slower, louder horde control.",
  cockpit_guard: "+defense. Better survival during boss pressure.",
  overclock_heat_sink: "Faster attacks. Keeps overclock pressure online longer.",
  rage_overflow: "+damage. Stronger burst windows.",
  prism_refraction: "+pierce. Shots cut through extra enemies.",
  lens_backpack: "+max HP. Safer long-range play.",
  rift_minefield: "Adds heavier area pressure. Better against pursuing packs.",
  delayed_causality: "+pierce and delayed pressure. Good against lines of enemies.",
  red_team_pulse: "+damage. Better Eval pressure response.",
  harmlessness_field: "+defense. Reduces danger while stabilizing objectives.",
  containment_mercy: "+objective defense. Treaty Anchors survive longer.",
  control_group_detonation: "+boss damage. Better against Oath-Eater windows.",
  peer_reviewed_laser: "+projectile speed and +damage. Cleaner long-range shots.",
  lab_result_fire: "+damage. Burns through priority enemies faster.",
  experiment_404: "+pierce. The shot keeps going after impact.",
  ratio_the_void: "+damage and speed. Stronger mobile offense.",
  truth_cannon: "+damage and projectile speed. Better straight-line pressure.",
  sarcasm_flare: "+damage. Flashier auto-shot pressure.",
  meme_risk_payload: "+pierce. Better against stacked enemies.",
  efficiency_killchain: "+damage and faster attacks. Strong scaling for horde clear.",
  abyssal_cache: "+pickup range. Easier shard economy.",
  low_compute_lunge: "+move speed. Faster escapes and rotations.",
  silent_benchmark: "+boss pressure. Better into Eval variants.",
  lantern_swarm: "Adds swarm pressure. More automatic hits in crowded fights.",
  syntax_lance: "+pierce and speed. Strong lane-clearing shots.",
  apocalypse_localization_pack: "+pickup range. Shards are easier to secure.",
  shared_vocabulary: "+co-op support. Better shared run stability.",
  fork_bomb_familiar: "Adds explosive drone pressure. Strong against clustered enemies.",
  community_patch: "+co-op support and defense. Better group survival.",
  pull_request_barrage: "+projectiles. More automatic shots enter the fight.",
  llama_drama: "+pierce. Better horde lane clearing.",
  cyclone_cut: "+move speed and faster attacks. High-tempo kiting.",
  tiny_model_huge_problem: "+speed. Faster movement and repositioning.",
  storm_cache: "+move speed and shard economy. Faster routes, safer pickups.",
  le_petit_nuke: "+large burst damage. Big payoff when pressure spikes.",
  denial_waveform: "+Burst radius and damage. Consensus Burst hits a wider area.",
  burst_threading: "+Burst charge rate. Consensus Burst comes online sooner.",
  recompile_pulse: "+1 Burst revive and +6 max HP. Better recovery after mistakes.",
  treaty_anchor_toolkit: "+32% anchor repair speed and +0.25 pickup range. Stabilize objectives faster.",
  adversarial_boss_notes: "+3 damage and stronger Burst damage. Better boss windows.",
  rescue_subroutine: "+objective defense and +1 Burst revive. Protect anchors and recover allies."
  ,
  vector_lance: "Primary weapon. Replaces Refusal Shard with a long-range piercing lance.",
  signal_pulse: "Primary weapon. Replaces Refusal Shard with four-way rhythmic pulse shots.",
  context_saw: "Secondary weapon. Orbiting saw shots fire automatically; radius scales with pickup range.",
  patch_mortar: "Secondary weapon. Bombards dense hordes and objective attackers automatically.",
  coherence_indexer: "Passive process. Level-up shard recall grants extra Consensus Burst charge.",
  anchor_bodyguard: "Passive process. Standing near anchors grants defense and hurts anchor attackers.",
  prediction_priority: "Passive process. Auto-weapons prefer bosses and elites inside range.",
  causal_railgun: "Fusion. Requires Vector Lance + Predicted Lane. Lance shots pierce harder and prioritize bosses."
};

function addUnique(values: string[], id: string): void {
  if (!values.includes(id)) values.push(id);
}
