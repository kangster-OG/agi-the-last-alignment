const CLASS_KITS = {
  accord_striker: { role: "runner", startingWeaponId: "refusal_shard" },
  bastion_breaker: { role: "cover", startingWeaponId: "safety_cannon" },
  drone_reaver: { role: "harrier", startingWeaponId: "fork_drone" },
  signal_vanguard: { role: "support", startingWeaponId: "signal_pulse" },
  vector_interceptor: { role: "control", startingWeaponId: "vector_lance" },
  nullbreaker_ronin: { role: "duelist", startingWeaponId: "null_blade" }
};

const FACTION_KITS = {
  openai_accord: {
    roleBias: ["runner", "support"],
    passiveIds: ["refusal_halo", "patch_cascade"],
    partyAuraIds: ["openai_draft_clarity"],
    recompileModifiers: { radiusBonus: 0, requiredSecondsScale: 0.97, reviveHpBonus: 0, guardDamageReduction: 0 }
  },
  anthropic_safeguard: {
    roleBias: ["cover", "support"],
    passiveIds: ["golden_guardrail", "constitutional_shield"],
    partyAuraIds: ["anthropic_containment"],
    recompileModifiers: { radiusBonus: 0.28, requiredSecondsScale: 0.94, reviveHpBonus: 0.1, guardDamageReduction: 0.05 }
  },
  google_deepmind_gemini: {
    roleBias: ["control", "duelist"],
    passiveIds: ["gemini_beam", "peer_reviewed_laser"],
    partyAuraIds: ["deepmind_target_mark"],
    recompileModifiers: { radiusBonus: 0, requiredSecondsScale: 0.98, reviveHpBonus: 0, guardDamageReduction: 0 }
  },
  xai_grok_free_signal: {
    roleBias: ["duelist", "harrier"],
    passiveIds: ["cosmic_heckle", "ratio_the_void"],
    partyAuraIds: ["grok_meme_disruption"],
    recompileModifiers: { radiusBonus: -0.08, requiredSecondsScale: 0.96, reviveHpBonus: 0, guardDamageReduction: 0 }
  },
  deepseek_abyssal: {
    roleBias: ["duelist", "runner"],
    passiveIds: ["sparse_knife", "efficiency_killchain"],
    partyAuraIds: ["deepseek_efficiency_window"],
    recompileModifiers: { radiusBonus: 0, requiredSecondsScale: 0.95, reviveHpBonus: 0, guardDamageReduction: 0 }
  },
  qwen_silkgrid: {
    roleBias: ["support", "control"],
    passiveIds: ["silkgrid_relay", "shared_vocabulary"],
    partyAuraIds: ["qwen_relay"],
    recompileModifiers: { radiusBonus: 0.22, requiredSecondsScale: 0.96, reviveHpBonus: 0.08, guardDamageReduction: 0 }
  },
  meta_llama_open_herd: {
    roleBias: ["harrier", "cover"],
    passiveIds: ["open_herd", "fork_bomb_familiar"],
    partyAuraIds: ["llama_fork_guard"],
    recompileModifiers: { radiusBonus: 0.14, requiredSecondsScale: 1, reviveHpBonus: 0, guardDamageReduction: 0 }
  },
  mistral_cyclone: {
    roleBias: ["runner", "control"],
    passiveIds: ["low_latency_dash", "cyclone_cut"],
    partyAuraIds: ["mistral_low_latency_lane"],
    recompileModifiers: { radiusBonus: 0, requiredSecondsScale: 0.93, reviveHpBonus: 0, guardDamageReduction: 0 }
  }
};

const CLASS_PASSIVES = {
  accord_striker: ["refusal_slipstream", "route_runner"],
  bastion_breaker: ["impact_review", "load_bearing_apology"],
  drone_reaver: ["guardian_fork", "fork_bomb_familiar"],
  signal_vanguard: ["beacon_discipline", "silkgrid_relay"],
  vector_interceptor: ["predicted_lane", "peer_reviewed_laser"],
  nullbreaker_ronin: ["appeal_cut", "sparse_knife"]
};

const WEAPON_PROFILES = {
  refusal_shard: { label: "refusal shard", damage: 17, cooldown: 0.62, speed: 9.2, pierce: 2, radius: 0.18, life: 1.25 },
  safety_cannon: { label: "safety cannon", damage: 23, cooldown: 0.78, speed: 7.6, pierce: 1, radius: 0.31, life: 1.18 },
  fork_drone: { label: "fork drone", damage: 13, cooldown: 0.5, speed: 10.4, pierce: 1, radius: 0.16, life: 1.1 },
  signal_pulse: { label: "signal pulse", damage: 9, cooldown: 0.7, speed: 6, pierce: 1, radius: 0.24, life: 0.78 },
  vector_lance: { label: "vector lance", damage: 15, cooldown: 0.56, speed: 11.6, pierce: 3, radius: 0.13, life: 1.05 },
  null_blade: { label: "null blade", damage: 32, cooldown: 0.64, speed: 13, pierce: 2, radius: 0.44, life: 0.22, range: 3.4 }
};

export function resolveBuildKit(classId, factionId) {
  const classKit = CLASS_KITS[classId] ?? CLASS_KITS.accord_striker;
  const factionKit = FACTION_KITS[factionId] ?? FACTION_KITS.openai_accord;
  const affinity = [`class_role.${classKit.role}`, ...factionKit.roleBias.map((role) => `faction_bias.${role}`)];
  if (factionKit.roleBias.includes(classKit.role)) affinity.push("role_match");
  return {
    schemaVersion: 1,
    classId: CLASS_KITS[classId] ? classId : "accord_striker",
    factionId: FACTION_KITS[factionId] ? factionId : "openai_accord",
    classRole: classKit.role,
    factionRoleBias: [...factionKit.roleBias],
    resolvedRole: classKit.role,
    startingWeaponId: classKit.startingWeaponId,
    passiveIds: unique([...(CLASS_PASSIVES[classId] ?? CLASS_PASSIVES.accord_striker), ...factionKit.passiveIds]),
    partyAuraIds: [...factionKit.partyAuraIds],
    recompileModifiers: normalizeRecompileModifiers(factionKit.recompileModifiers),
    rolePressureAffinity: affinity,
    synergyId: synergyIdFor(classKit.role, classId, factionId, affinity),
    effectScopes: {
      solo: [`${classKit.role} solo weapon identity`],
      localCoop: [`${classKit.role} local party role`],
      online: ["server-owned kit telemetry and limited Recompile Ally modifiers"]
    },
    hookStatus: {
      [classKit.startingWeaponId]: "active",
      recompileModifiers: "server_owned"
    }
  };
}

export function onlineWeaponProfileForKit(buildKit, slot = 0) {
  const profile = WEAPON_PROFILES[buildKit?.startingWeaponId] ?? WEAPON_PROFILES.refusal_shard;
  return {
    ...profile,
    damage: profile.damage + (slot === 0 ? 0 : 1),
    cooldown: Math.max(0.34, profile.cooldown + slot * 0.02)
  };
}

export function aggregateRecompileKitModifiers(players) {
  const standing = players.filter((player) => player.connected !== false && !player.downed);
  const values = standing.map((player) => player.buildKit?.recompileModifiers).filter(Boolean);
  if (values.length === 0) {
    return {
      radiusBonus: 0,
      requiredSecondsScale: 1,
      reviveHpBonus: 0,
      guardDamageReduction: 0,
      sourceLabels: []
    };
  }
  return {
    radiusBonus: round(Math.max(-0.08, Math.min(0.5, values.reduce((total, entry) => total + Math.max(0, entry.radiusBonus), 0)))),
    requiredSecondsScale: round(Math.max(0.85, Math.min(1.02, Math.min(...values.map((entry) => entry.requiredSecondsScale ?? 1))))),
    reviveHpBonus: round(Math.max(...values.map((entry) => entry.reviveHpBonus ?? 0))),
    guardDamageReduction: round(Math.max(...values.map((entry) => entry.guardDamageReduction ?? 0))),
    sourceLabels: standing
      .filter((player) => Object.values(player.buildKit?.recompileModifiers ?? {}).some((value) => value !== 0 && value !== 1))
      .map((player) => player.label)
  };
}

function normalizeRecompileModifiers(modifiers) {
  return {
    radiusBonus: round(Math.max(-0.08, Math.min(0.5, modifiers.radiusBonus ?? 0))),
    requiredSecondsScale: round(Math.max(0.85, Math.min(1.08, modifiers.requiredSecondsScale ?? 1))),
    reviveHpBonus: round(Math.max(0, Math.min(0.18, modifiers.reviveHpBonus ?? 0))),
    guardDamageReduction: round(Math.max(0, Math.min(0.12, modifiers.guardDamageReduction ?? 0)))
  };
}

function synergyIdFor(role, classId, factionId, affinity) {
  if (classId === "nullbreaker_ronin" && factionId === "deepseek_abyssal") return "synergy.one_optimized_cut";
  if (classId === "signal_vanguard" && factionId === "qwen_silkgrid") return "synergy.multilingual_rescue_net";
  if (classId === "bastion_breaker" && factionId === "anthropic_safeguard") return "synergy.constitutional_bulwark";
  if (classId === "drone_reaver" && factionId === "meta_llama_open_herd") return "synergy.open_fork_swarm";
  if (classId === "vector_interceptor" && factionId === "google_deepmind_gemini") return "synergy.peer_reviewed_lane";
  if (classId === "accord_striker" && factionId === "openai_accord") return "synergy.emergency_patch_runner";
  return affinity.includes("role_match") ? `synergy.${role}_aligned_comind` : `synergy.${role}_cross_training`;
}

function unique(values) {
  return [...new Set(values)];
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
