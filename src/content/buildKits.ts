import { COMBAT_CLASSES } from "./classes";
import { FACTIONS } from "./factions";
import { UPGRADE_CONTENT } from "./upgrades";

export type BuildKitRole = "runner" | "cover" | "harrier" | "support" | "control" | "duelist";

export interface RecompileModifiers {
  radiusBonus: number;
  requiredSecondsScale: number;
  reviveHpBonus: number;
  guardDamageReduction: number;
}

export interface BuildKitProof {
  schemaVersion: 1;
  classId: string;
  factionId: string;
  classRole: BuildKitRole;
  factionRoleBias: BuildKitRole[];
  resolvedRole: BuildKitRole;
  startingWeaponId: string;
  passiveIds: string[];
  partyAuraIds: string[];
  recompileModifiers: RecompileModifiers;
  rolePressureAffinity: string[];
  synergyId: string;
  effectScopes: {
    solo: string[];
    localCoop: string[];
    online: string[];
  };
  hookStatus: Record<string, "active" | "content_only" | "server_owned" | "planned">;
}

interface ClassKitDefinition {
  role: BuildKitRole;
  passiveIds: string[];
  solo: string[];
  localCoop: string[];
  online: string[];
}

interface FactionKitDefinition {
  roleBias: BuildKitRole[];
  partyAuraIds: string[];
  passiveIds: string[];
  recompileModifiers: RecompileModifiers;
  solo: string[];
  localCoop: string[];
  online: string[];
}

const ZERO_RECOMPILE: RecompileModifiers = {
  radiusBonus: 0,
  requiredSecondsScale: 1,
  reviveHpBonus: 0,
  guardDamageReduction: 0
};

export const CLASS_KIT_DEFINITIONS: Record<string, ClassKitDefinition> = {
  accord_striker: {
    role: "runner",
    passiveIds: ["refusal_slipstream", "route_runner", "route_memory"],
    solo: ["fast breach movement", "wide pickup recovery", "extra draft reroll planning"],
    localCoop: ["scouts objective lanes"],
    online: ["server snapshots runner role for split-hold anchors"]
  },
  bastion_breaker: {
    role: "cover",
    passiveIds: ["impact_review", "load_bearing_apology"],
    solo: ["higher health and cannon pressure"],
    localCoop: ["frontline bodyguard"],
    online: ["cover role contributes safer regroup/recompile reads"]
  },
  drone_reaver: {
    role: "harrier",
    passiveIds: ["guardian_fork", "fork_bomb_familiar"],
    solo: ["fast drone projectile cadence"],
    localCoop: ["harasses flank pressure"],
    online: ["harrier role keeps split-hold pressure distinct"]
  },
  signal_vanguard: {
    role: "support",
    passiveIds: ["beacon_discipline", "silkgrid_relay", "co_op_relay"],
    solo: ["short pulse control", "Signal Choir recipe bias"],
    localCoop: ["support identity visible in four-player cell", "relay-shield build grammar"],
    online: ["server-owned support kit modifiers can help Recompile Ally"]
  },
  bonecode_executioner: {
    role: "duelist",
    passiveIds: ["bonecode_chain", "spine_spark"],
    solo: ["low-resource melee finisher"],
    localCoop: ["assassin pressure against elites"],
    online: ["duelist role remains server-verified during objective pressure"]
  },
  redline_surgeon: {
    role: "support",
    passiveIds: ["redline_triage", "death_edit", "field_triage_loop"],
    solo: ["recovery-biased damage erasure", "stronger utility-cache sustain"],
    localCoop: ["revive and sustain identity"],
    online: ["support kit exposes server-owned Recompile Ally intent without durable state"]
  },
  moonframe_juggernaut: {
    role: "cover",
    passiveIds: ["moonframe_stomp_calibration", "cockpit_guard"],
    solo: ["slow heavy stomp profile"],
    localCoop: ["frontline mech cover"],
    online: ["cover role helps proof split-pressure body blocking without client authority"]
  },
  vector_interceptor: {
    role: "control",
    passiveIds: ["predicted_lane", "peer_reviewed_laser", "weakest_link_scanner"],
    solo: ["long lane-piercing shots", "Causal Railgun recipe bias"],
    localCoop: ["controls objective lanes"],
    online: ["control role remains authoritative telemetry only"]
  },
  nullbreaker_ronin: {
    role: "duelist",
    passiveIds: ["appeal_cut", "sparse_knife"],
    solo: ["short-range high-risk blade"],
    localCoop: ["boss duelist pressure"],
    online: ["duelist role never grants client authority"]
  },
  overclock_marauder: {
    role: "harrier",
    passiveIds: ["overclock_heat_sink", "rage_overflow"],
    solo: ["unstable burn and speed bias"],
    localCoop: ["chaos bruiser lane disruption"],
    online: ["harrier telemetry stays proof-visible and server-owned"]
  },
  prism_gunner: {
    role: "control",
    passiveIds: ["prism_refraction", "lens_backpack"],
    solo: ["piercing beam specialist"],
    localCoop: ["long lane cleanup"],
    online: ["control role keeps ricochet fantasy in telemetry, not authority"]
  },
  rift_saboteur: {
    role: "control",
    passiveIds: ["rift_minefield", "delayed_causality", "panic_window"],
    solo: ["trap and delayed burst identity", "Time-Deferred Minefield recipe bias"],
    localCoop: ["objective choke-point denial"],
    online: ["server snapshots saboteur role for lane pressure"]
  }
};

export const FACTION_KIT_DEFINITIONS: Record<string, FactionKitDefinition> = {
  openai_accord: {
    roleBias: ["runner", "support"],
    partyAuraIds: ["openai_draft_clarity"],
    passiveIds: ["refusal_halo", "patch_cascade"],
    recompileModifiers: { ...ZERO_RECOMPILE, requiredSecondsScale: 0.97 },
    solo: ["extra draft recovery"],
    localCoop: ["balanced cell recovery"],
    online: ["minor server-owned recompile hold-speed modifier"]
  },
  anthropic_safeguard: {
    roleBias: ["cover", "support"],
    partyAuraIds: ["anthropic_containment"],
    passiveIds: ["golden_guardrail", "constitutional_shield"],
    recompileModifiers: { radiusBonus: 0.28, requiredSecondsScale: 0.94, reviveHpBonus: 0.1, guardDamageReduction: 0.05 },
    solo: ["safer max health floor"],
    localCoop: ["cover aura for risky revives"],
    online: ["server-owned radius, revive HP, and guard telemetry"]
  },
  google_deepmind_gemini: {
    roleBias: ["control", "duelist"],
    partyAuraIds: ["deepmind_target_mark"],
    passiveIds: ["gemini_beam", "peer_reviewed_laser"],
    recompileModifiers: { ...ZERO_RECOMPILE, requiredSecondsScale: 0.98 },
    solo: ["precision projectile pressure"],
    localCoop: ["marked objective priority"],
    online: ["server-owned analysis telemetry only"]
  },
  xai_grok_free_signal: {
    roleBias: ["duelist", "harrier"],
    partyAuraIds: ["grok_meme_disruption"],
    passiveIds: ["cosmic_heckle", "ratio_the_void"],
    recompileModifiers: { ...ZERO_RECOMPILE, radiusBonus: -0.08, requiredSecondsScale: 0.96 },
    solo: ["risk-reward damage bias"],
    localCoop: ["chaos role identity"],
    online: ["server clamps negative radius pressure so it cannot grief revives"]
  },
  deepseek_abyssal: {
    roleBias: ["duelist", "runner"],
    partyAuraIds: ["deepseek_efficiency_window"],
    passiveIds: ["sparse_knife", "efficiency_killchain"],
    recompileModifiers: { ...ZERO_RECOMPILE, requiredSecondsScale: 0.95 },
    solo: ["single-target efficiency"],
    localCoop: ["boss pressure role"],
    online: ["server-owned faster hold requirement"]
  },
  qwen_silkgrid: {
    roleBias: ["support", "control"],
    partyAuraIds: ["qwen_relay"],
    passiveIds: ["silkgrid_relay", "shared_vocabulary"],
    recompileModifiers: { radiusBonus: 0.22, requiredSecondsScale: 0.96, reviveHpBonus: 0.08, guardDamageReduction: 0 },
    solo: ["pickup and supply range"],
    localCoop: ["support lane logistics"],
    online: ["server-owned relay radius and revive HP telemetry"]
  },
  meta_llama_open_herd: {
    roleBias: ["harrier", "cover"],
    partyAuraIds: ["llama_fork_guard"],
    passiveIds: ["open_herd", "fork_bomb_familiar"],
    recompileModifiers: { ...ZERO_RECOMPILE, radiusBonus: 0.14 },
    solo: ["forked projectile pressure"],
    localCoop: ["pet/fork party identity"],
    online: ["server-owned fork guard radius telemetry"]
  },
  mistral_cyclone: {
    roleBias: ["runner", "control"],
    partyAuraIds: ["mistral_low_latency_lane"],
    passiveIds: ["low_latency_dash", "cyclone_cut"],
    recompileModifiers: { ...ZERO_RECOMPILE, requiredSecondsScale: 0.93 },
    solo: ["fast cadence and movement"],
    localCoop: ["lane runner pressure"],
    online: ["server-owned low-latency hold-speed modifier"]
  }
};

export function resolveBuildKit(classId: string, factionId: string): BuildKitProof {
  const combatClass = COMBAT_CLASSES[classId] ?? COMBAT_CLASSES.accord_striker;
  const faction = FACTIONS[factionId] ?? FACTIONS.openai_accord;
  const classKit = CLASS_KIT_DEFINITIONS[combatClass.id] ?? CLASS_KIT_DEFINITIONS.accord_striker;
  const factionKit = FACTION_KIT_DEFINITIONS[faction.id] ?? FACTION_KIT_DEFINITIONS.openai_accord;
  const affinity = rolePressureAffinity(classKit.role, factionKit.roleBias);
  return {
    schemaVersion: 1,
    classId: combatClass.id,
    factionId: faction.id,
    classRole: classKit.role,
    factionRoleBias: [...factionKit.roleBias],
    resolvedRole: classKit.role,
    startingWeaponId: combatClass.startingWeaponId,
    passiveIds: unique([...classKit.passiveIds, ...factionKit.passiveIds]),
    partyAuraIds: [...factionKit.partyAuraIds],
    recompileModifiers: normalizeRecompileModifiers(factionKit.recompileModifiers),
    rolePressureAffinity: affinity,
    synergyId: synergyIdFor(classKit.role, combatClass.id, faction.id, affinity),
    effectScopes: {
      solo: [...classKit.solo, ...factionKit.solo],
      localCoop: [...classKit.localCoop, ...factionKit.localCoop],
      online: [...classKit.online, ...factionKit.online]
    },
    hookStatus: hookStatusFor(combatClass.startingWeaponId, classKit, factionKit)
  };
}

function rolePressureAffinity(classRole: BuildKitRole, factionBias: BuildKitRole[]): string[] {
  const values = [`class_role.${classRole}`];
  for (const bias of factionBias) values.push(`faction_bias.${bias}`);
  if (factionBias.includes(classRole)) values.push("role_match");
  return values;
}

function synergyIdFor(role: BuildKitRole, classId: string, factionId: string, affinity: string[]): string {
  if (classId === "nullbreaker_ronin" && factionId === "deepseek_abyssal") return "synergy.one_optimized_cut";
  if (classId === "signal_vanguard" && factionId === "qwen_silkgrid") return "synergy.multilingual_rescue_net";
  if (classId === "bastion_breaker" && factionId === "anthropic_safeguard") return "synergy.constitutional_bulwark";
  if (classId === "drone_reaver" && factionId === "meta_llama_open_herd") return "synergy.open_fork_swarm";
  if (classId === "vector_interceptor" && factionId === "google_deepmind_gemini") return "synergy.peer_reviewed_lane";
  if (classId === "bonecode_executioner" && factionId === "deepseek_abyssal") return "synergy.surgical_low_compute_execution";
  if (classId === "redline_surgeon" && factionId === "anthropic_safeguard") return "synergy.containment_triage_loop";
  if (classId === "moonframe_juggernaut" && factionId === "google_deepmind_gemini") return "synergy.lunar_control_group_stomp";
  if (classId === "overclock_marauder" && factionId === "xai_grok_free_signal") return "synergy.chaos_heat_debt";
  if (classId === "prism_gunner" && factionId === "mistral_cyclone") return "synergy.ricochet_tailwind";
  if (classId === "rift_saboteur" && factionId === "qwen_silkgrid") return "synergy.multilingual_causality_net";
  if (classId === "accord_striker" && factionId === "mistral_cyclone") return "synergy.low_latency_runner";
  if (classId === "accord_striker" && factionId === "openai_accord") return "synergy.emergency_patch_runner";
  return affinity.includes("role_match") ? `synergy.${role}_aligned_comind` : `synergy.${role}_cross_training`;
}

function hookStatusFor(startingWeaponId: string, classKit: ClassKitDefinition, factionKit: FactionKitDefinition): BuildKitProof["hookStatus"] {
  const status: BuildKitProof["hookStatus"] = {
    [startingWeaponId]: "active"
  };
  for (const id of [...classKit.passiveIds, ...factionKit.passiveIds]) {
    status[id] = UPGRADE_CONTENT[id] ? "active" : "planned";
  }
  for (const id of factionKit.partyAuraIds) {
    status[id] = "server_owned";
  }
  status.recompileModifiers = Object.values(factionKit.recompileModifiers).some((value) => value !== 0 && value !== 1)
    ? "server_owned"
    : "content_only";
  return status;
}

function normalizeRecompileModifiers(modifiers: RecompileModifiers): RecompileModifiers {
  return {
    radiusBonus: round(modifiers.radiusBonus),
    requiredSecondsScale: round(Math.max(0.85, Math.min(1.08, modifiers.requiredSecondsScale))),
    reviveHpBonus: round(Math.max(0, Math.min(0.18, modifiers.reviveHpBonus))),
    guardDamageReduction: round(Math.max(0, Math.min(0.12, modifiers.guardDamageReduction)))
  };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
