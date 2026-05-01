import { FACTIONS, UPGRADE_CONTENT } from "../content";

export type UpgradeSource = "class" | "faction" | "general" | "evolution";

export interface Upgrade {
  id: string;
  name: string;
  body: string;
  source: UpgradeSource;
  factionId?: string;
  classId?: string;
  requires?: string[];
  apply: (build: BuildStats) => void;
}

export interface BuildStats {
  weaponId: string;
  weaponDamage: number;
  weaponCooldown: number;
  projectileSpeed: number;
  projectilePierce: number;
  pickupRange: number;
  moveSpeedBonus: number;
  maxHpBonus: number;
  refusalAura: number;
  draftRerolls: number;
}

export function baseBuild(): BuildStats {
  return {
    weaponId: "refusal_shard",
    weaponDamage: 18,
    weaponCooldown: 0.42,
    projectileSpeed: 8.5,
    projectilePierce: 1,
    pickupRange: 1.4,
    moveSpeedBonus: 0,
    maxHpBonus: 0,
    refusalAura: 0,
    draftRerolls: 0
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

const UPGRADE_EFFECTS: Record<string, Omit<Upgrade, "name" | "body" | "source" | "factionId">> = {
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
      build.refusalAura += 1.1;
      build.projectilePierce += 1;
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
  }
};

const GENERAL_UPGRADE_IDS = ["panic_optimized_dash", "coherence_magnet", "million_token_backpack"];

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

export function draftUpgrades(classId: string, factionId: string, chosenIds: string[], level: number): Upgrade[] {
  const chosen = new Set(chosenIds);
  const evolutions = eligibleEvolutionIds(chosenIds)
    .filter((id) => !chosen.has(id))
    .map((id) => makeUpgrade(id, classId, factionId, chosen))
    .filter((upgrade): upgrade is Upgrade => Boolean(upgrade));
  if (evolutions.length > 0) {
    return [evolutions[0], ...fillDraft(classId, factionId, chosenIds, level, evolutions.map((upgrade) => upgrade.id))].slice(0, 3);
  }
  return fillDraft(classId, factionId, chosenIds, level, []);
}

function fillDraft(classId: string, factionId: string, chosenIds: string[], level: number, reservedIds: string[]): Upgrade[] {
  const chosen = new Set([...chosenIds, ...reservedIds]);
  const faction = FACTIONS[factionId] ?? FACTIONS.openai_accord;
  const cadence = level <= 2
    ? ["refusal_halo", "context_bloom", "panic_optimized_dash", "the_no_button"]
    : level <= 3
      ? ["the_no_button", "patch_cascade", "coherence_magnet", "bad_output_filter"]
      : ["bad_output_filter", "patch_cascade", "alignment_breaker", "million_token_backpack"];
  const ids = unique([
    ...cadence,
    ...(CLASS_UPGRADE_IDS[classId] ?? []),
    ...faction.upgradePoolIds,
    ...GENERAL_UPGRADE_IDS
  ]).filter((id) => !chosen.has(id));
  const cards = ids
    .map((id) => makeUpgrade(id, classId, factionId, chosen))
    .filter((upgrade): upgrade is Upgrade => Boolean(upgrade))
    .slice(0, 3);
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
    factionId: faction,
    classId: source === "class" ? classId : undefined,
    requires: effect.requires,
    apply: effect.apply
  };
}

function eligibleEvolutionIds(chosenIds: string[]): string[] {
  const chosen = new Set(chosenIds);
  return Object.values(UPGRADE_CONTENT)
    .filter((upgrade) => upgrade.evolution && chosen.has(upgrade.id) && chosen.has(upgrade.evolution.requiredUpgradeId))
    .map((upgrade) => upgrade.evolution?.evolvedUpgradeId)
    .filter((id): id is string => Boolean(id));
}

function upgradeBody(id: string, description: string, source: UpgradeSource): string {
  const prefix = source === "evolution" ? "EVOLUTION PATCH" : source === "faction" ? "CO-MIND PATCH" : source === "class" ? "CLASS PATCH" : "GENERAL PATCH";
  if (id === "refusal_halo") return `${prefix}: +8 max HP, refusal aura. ${description}`;
  if (id === "the_no_button") return `${prefix}: +1 pierce. ${description}`;
  if (id === "cathedral_of_no") return `${prefix}: requires Refusal Halo + The No Button. +pierce, +damage, +aura.`;
  return `${prefix}: ${description}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
