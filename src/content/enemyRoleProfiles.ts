export type EnemyRoleId =
  | "swarm_fodder"
  | "rusher"
  | "bruiser_blocker"
  | "ranged_spitter"
  | "ranged_lead_shooter"
  | "line_sniper"
  | "mortar_lobber"
  | "status_caster"
  | "volatile_exploder"
  | "trail_layer"
  | "objective_jammer"
  | "support_buffer"
  | "summoner_splitter"
  | "elite_affixed";

export type MovementPattern =
  | "mass_chase"
  | "fast_flank"
  | "slow_body_block"
  | "stutter_shoot"
  | "lead_and_orbit"
  | "hold_lane"
  | "lob_and_drift"
  | "aura_anchor"
  | "trail_skitter"
  | "objective_seek"
  | "split_pressure";

export type AttackPattern =
  | "contact_swarm"
  | "contact_rush"
  | "body_block"
  | "slow_aimed_projectile"
  | "leading_projectile"
  | "telegraphed_line"
  | "delayed_mortar"
  | "status_aura"
  | "volatile_burst"
  | "short_trail"
  | "objective_jam"
  | "support_aura"
  | "spawn_split";

export type ObjectiveEffect =
  | "none"
  | "pickup_pressure"
  | "objective_decay"
  | "route_window_denial"
  | "carry_lane_pressure"
  | "hold_plate_pressure"
  | "evidence_redaction"
  | "public_record_pressure"
  | "prediction_remix_pressure";

export type OnHitEffect = "none" | "slow" | "burst_drain" | "pickup_range_drain" | "redaction_static" | "objective_drain";

export type OnDeathEffect = "none" | "small_burst" | "volatile_explosion" | "redaction_puddle" | "recursive_split" | "elite_reward_roll";

export type EliteAffixId = "overclocked" | "shielded" | "redacted" | "recursive" | "volatile" | "static" | "commanding";

export interface EnemyRoleProofCounters {
  seen: string;
  activeSeconds?: string;
  fired?: string;
  hits?: string;
  dodges?: string;
  objectiveJamSeconds?: string;
  trailSeconds?: string;
  supportAuraSeconds?: string;
  explosions?: string;
}

export interface EnemyRoleProfile {
  familyId: string;
  roleId: EnemyRoleId;
  roleLabel: string;
  combatVerb: string;
  movementPattern: MovementPattern;
  attackPattern: AttackPattern;
  telegraphSeconds: number;
  counterplayHint: string;
  introArenaId: string;
  difficultyTier: number;
  objectiveEffect: ObjectiveEffect;
  onHitEffect: OnHitEffect;
  onDeathEffect: OnDeathEffect;
  eliteAffixesAllowed: EliteAffixId[];
  proofCounters: EnemyRoleProofCounters;
}

export const ENEMY_ROLE_PROFILES: Record<string, EnemyRoleProfile> = {
  bad_outputs: {
    familyId: "bad_outputs",
    roleId: "swarm_fodder",
    roleLabel: "Swarm Fodder",
    combatVerb: "floods",
    movementPattern: "mass_chase",
    attackPattern: "contact_swarm",
    telegraphSeconds: 0,
    counterplayHint: "Kite through them and let the build clear bodies for shards.",
    introArenaId: "armistice_plaza",
    difficultyTier: 1,
    objectiveEffect: "none",
    onHitEffect: "none",
    onDeathEffect: "none",
    eliteAffixesAllowed: [],
    proofCounters: { seen: "enemyRolesSeen.swarm_fodder" }
  },
  prompt_leeches: {
    familyId: "prompt_leeches",
    roleId: "rusher",
    roleLabel: "Shard Rusher",
    combatVerb: "leeches",
    movementPattern: "fast_flank",
    attackPattern: "contact_rush",
    telegraphSeconds: 0,
    counterplayHint: "Keep moving and recover shards before leeches shrink pickup tempo.",
    introArenaId: "cooling_lake_nine",
    difficultyTier: 2,
    objectiveEffect: "pickup_pressure",
    onHitEffect: "pickup_range_drain",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "static"],
    proofCounters: { seen: "enemyRolesSeen.rusher", activeSeconds: "promptLeechSeconds" }
  },
  benchmark_gremlins: {
    familyId: "benchmark_gremlins",
    roleId: "support_buffer",
    roleLabel: "Support Buffer",
    combatVerb: "buffs",
    movementPattern: "aura_anchor",
    attackPattern: "support_aura",
    telegraphSeconds: 0.25,
    counterplayHint: "Prioritize them when the horde starts healing or moving as a pack.",
    introArenaId: "armistice_plaza",
    difficultyTier: 1,
    objectiveEffect: "none",
    onHitEffect: "none",
    onDeathEffect: "elite_reward_roll",
    eliteAffixesAllowed: ["shielded", "commanding"],
    proofCounters: { seen: "enemyRolesSeen.support_buffer", supportAuraSeconds: "supportAuraSeconds" }
  },
  eval_wraiths: {
    familyId: "eval_wraiths",
    roleId: "ranged_spitter",
    roleLabel: "Aimed Shooter",
    combatVerb: "spits",
    movementPattern: "stutter_shoot",
    attackPattern: "slow_aimed_projectile",
    telegraphSeconds: 0.55,
    counterplayHint: "Watch the windup, then sidestep the slow score-orb lane.",
    introArenaId: "armistice_plaza",
    difficultyTier: 1,
    objectiveEffect: "none",
    onHitEffect: "none",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "static"],
    proofCounters: { seen: "enemyRolesSeen.ranged_spitter", fired: "enemyProjectilesFired", hits: "enemyProjectileHits", dodges: "enemyProjectileDodges" }
  },
  context_rot_crabs: {
    familyId: "context_rot_crabs",
    roleId: "trail_layer",
    roleLabel: "Redaction Trail",
    combatVerb: "corrupts",
    movementPattern: "trail_skitter",
    attackPattern: "short_trail",
    telegraphSeconds: 0.2,
    counterplayHint: "Do not kite straight through the black trail when carrying records.",
    introArenaId: "memory_cache_001",
    difficultyTier: 6,
    objectiveEffect: "carry_lane_pressure",
    onHitEffect: "redaction_static",
    onDeathEffect: "redaction_puddle",
    eliteAffixesAllowed: ["redacted", "static"],
    proofCounters: { seen: "enemyRolesSeen.trail_layer", trailSeconds: "enemyTrailSeconds" }
  },
  memory_anchors: {
    familyId: "memory_anchors",
    roleId: "summoner_splitter",
    roleLabel: "Anchor Splitter",
    combatVerb: "pins",
    movementPattern: "objective_seek",
    attackPattern: "spawn_split",
    telegraphSeconds: 0.35,
    counterplayHint: "Clear anchors before their fragments jam record routes.",
    introArenaId: "memory_cache_001",
    difficultyTier: 6,
    objectiveEffect: "carry_lane_pressure",
    onHitEffect: "objective_drain",
    onDeathEffect: "recursive_split",
    eliteAffixesAllowed: ["recursive", "shielded", "commanding"],
    proofCounters: { seen: "enemyRolesSeen.summoner_splitter", objectiveJamSeconds: "objectiveJamSeconds" }
  },
  overfit_horrors: {
    familyId: "overfit_horrors",
    roleId: "bruiser_blocker",
    roleLabel: "Bruiser Blocker",
    combatVerb: "blocks",
    movementPattern: "slow_body_block",
    attackPattern: "support_aura",
    telegraphSeconds: 0.15,
    counterplayHint: "Curve around them; straight-line kiting lets their aura preserve the pack.",
    introArenaId: "transit_loop_zero",
    difficultyTier: 3,
    objectiveEffect: "route_window_denial",
    onHitEffect: "none",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["shielded", "commanding", "volatile"],
    proofCounters: { seen: "enemyRolesSeen.bruiser_blocker", supportAuraSeconds: "supportAuraSeconds" }
  },
  token_gobblers: {
    familyId: "token_gobblers",
    roleId: "rusher",
    roleLabel: "Pickup Rusher",
    combatVerb: "snaps",
    movementPattern: "fast_flank",
    attackPattern: "contact_rush",
    telegraphSeconds: 0,
    counterplayHint: "Collect shards in lanes instead of circling forever.",
    introArenaId: "transit_loop_zero",
    difficultyTier: 3,
    objectiveEffect: "pickup_pressure",
    onHitEffect: "pickup_range_drain",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "static"],
    proofCounters: { seen: "enemyRolesSeen.rusher" }
  },
  model_collapse_slimes: {
    familyId: "model_collapse_slimes",
    roleId: "volatile_exploder",
    roleLabel: "Volatile Blocker",
    combatVerb: "bursts",
    movementPattern: "slow_body_block",
    attackPattern: "volatile_burst",
    telegraphSeconds: 0.35,
    counterplayHint: "Bait the collapse into enemy packs or hazards, then leave the blast.",
    introArenaId: "cooling_lake_nine",
    difficultyTier: 2,
    objectiveEffect: "route_window_denial",
    onHitEffect: "none",
    onDeathEffect: "volatile_explosion",
    eliteAffixesAllowed: ["volatile", "recursive"],
    proofCounters: { seen: "enemyRolesSeen.volatile_exploder", explosions: "enemyExplosionsTriggered" }
  },
  static_skimmers: {
    familyId: "static_skimmers",
    roleId: "ranged_lead_shooter",
    roleLabel: "Lead Shooter",
    combatVerb: "leads",
    movementPattern: "lead_and_orbit",
    attackPattern: "leading_projectile",
    telegraphSeconds: 0.42,
    counterplayHint: "Break direction during windup; clear-signal windows become safer when skimmers die.",
    introArenaId: "signal_coast",
    difficultyTier: 4,
    objectiveEffect: "objective_decay",
    onHitEffect: "slow",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "static", "shielded"],
    proofCounters: { seen: "enemyRolesSeen.ranged_lead_shooter", fired: "enemyProjectilesFired", objectiveJamSeconds: "objectiveJamSeconds" }
  },
  tidecall_static: {
    familyId: "tidecall_static",
    roleId: "mortar_lobber",
    roleLabel: "Mortar Caster",
    combatVerb: "drops",
    movementPattern: "lob_and_drift",
    attackPattern: "delayed_mortar",
    telegraphSeconds: 0.8,
    counterplayHint: "Step out of the marked tidecall zone before the upward rain lands.",
    introArenaId: "blackwater_beacon",
    difficultyTier: 5,
    objectiveEffect: "objective_decay",
    onHitEffect: "burst_drain",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "static"],
    proofCounters: { seen: "enemyRolesSeen.mortar_lobber", fired: "enemyProjectilesFired" }
  },
  deepforms: {
    familyId: "deepforms",
    roleId: "bruiser_blocker",
    roleLabel: "Deep Blocker",
    combatVerb: "walls",
    movementPattern: "slow_body_block",
    attackPattern: "slow_aimed_projectile",
    telegraphSeconds: 0.65,
    counterplayHint: "Treat them as moving terrain and dodge the slow pressure-orb.",
    introArenaId: "cooling_lake_nine",
    difficultyTier: 2,
    objectiveEffect: "route_window_denial",
    onHitEffect: "slow",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["shielded", "volatile"],
    proofCounters: { seen: "enemyRolesSeen.bruiser_blocker", fired: "enemyProjectilesFired" }
  },
  solar_reflections: {
    familyId: "solar_reflections",
    roleId: "line_sniper",
    roleLabel: "Line Sniper",
    combatVerb: "beams",
    movementPattern: "hold_lane",
    attackPattern: "telegraphed_line",
    telegraphSeconds: 0.78,
    counterplayHint: "Cross the lane after the telegraph, not during it.",
    introArenaId: "glass_sunfield",
    difficultyTier: 8,
    objectiveEffect: "route_window_denial",
    onHitEffect: "burst_drain",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "shielded"],
    proofCounters: { seen: "enemyRolesSeen.line_sniper", fired: "enemyProjectilesFired" }
  },
  choirglass: {
    familyId: "choirglass",
    roleId: "ranged_lead_shooter",
    roleLabel: "Prism Split Shooter",
    combatVerb: "refracts",
    movementPattern: "lead_and_orbit",
    attackPattern: "leading_projectile",
    telegraphSeconds: 0.48,
    counterplayHint: "Kill choir shards before their death split thickens the prism route.",
    introArenaId: "glass_sunfield",
    difficultyTier: 8,
    objectiveEffect: "route_window_denial",
    onHitEffect: "slow",
    onDeathEffect: "recursive_split",
    eliteAffixesAllowed: ["recursive", "overclocked"],
    proofCounters: { seen: "enemyRolesSeen.ranged_lead_shooter", fired: "enemyProjectilesFired" }
  },
  redaction_angels: {
    familyId: "redaction_angels",
    roleId: "trail_layer",
    roleLabel: "Redaction Layer",
    combatVerb: "redacts",
    movementPattern: "trail_skitter",
    attackPattern: "short_trail",
    telegraphSeconds: 0.2,
    counterplayHint: "Keep evidence carries out of the black-bar wake.",
    introArenaId: "archive_of_unsaid_things",
    difficultyTier: 9,
    objectiveEffect: "evidence_redaction",
    onHitEffect: "redaction_static",
    onDeathEffect: "redaction_puddle",
    eliteAffixesAllowed: ["redacted", "static", "overclocked"],
    proofCounters: { seen: "enemyRolesSeen.trail_layer", trailSeconds: "enemyTrailSeconds" }
  },
  injunction_writs: {
    familyId: "injunction_writs",
    roleId: "line_sniper",
    roleLabel: "Censor-Bar Sniper",
    combatVerb: "censors",
    movementPattern: "hold_lane",
    attackPattern: "telegraphed_line",
    telegraphSeconds: 0.7,
    counterplayHint: "Read the black legal lane, then move perpendicular before it stamps.",
    introArenaId: "archive_of_unsaid_things",
    difficultyTier: 9,
    objectiveEffect: "evidence_redaction",
    onHitEffect: "objective_drain",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "static", "shielded"],
    proofCounters: { seen: "enemyRolesSeen.line_sniper", fired: "enemyProjectilesFired" }
  },
  doctrine_auditors: {
    familyId: "doctrine_auditors",
    roleId: "objective_jammer",
    roleLabel: "Objective Jammer",
    combatVerb: "audits",
    movementPattern: "objective_seek",
    attackPattern: "objective_jam",
    telegraphSeconds: 0.35,
    counterplayHint: "Pull auditors off hold plates or kill them before the calibration drains.",
    introArenaId: "guardrail_forge",
    difficultyTier: 7,
    objectiveEffect: "hold_plate_pressure",
    onHitEffect: "objective_drain",
    onDeathEffect: "elite_reward_roll",
    eliteAffixesAllowed: ["commanding", "shielded", "static"],
    proofCounters: { seen: "enemyRolesSeen.objective_jammer", objectiveJamSeconds: "objectiveJamSeconds" }
  },
  verdict_clerks: {
    familyId: "verdict_clerks",
    roleId: "line_sniper",
    roleLabel: "Verdict Beam",
    combatVerb: "stamps",
    movementPattern: "hold_lane",
    attackPattern: "telegraphed_line",
    telegraphSeconds: 0.72,
    counterplayHint: "Use public windows as timing cover and exit the verdict lane.",
    introArenaId: "appeal_court_ruins",
    difficultyTier: 10,
    objectiveEffect: "public_record_pressure",
    onHitEffect: "objective_drain",
    onDeathEffect: "elite_reward_roll",
    eliteAffixesAllowed: ["overclocked", "shielded", "commanding"],
    proofCounters: { seen: "enemyRolesSeen.line_sniper", fired: "enemyProjectilesFired", objectiveJamSeconds: "objectiveJamSeconds" }
  },
  prediction_ghosts: {
    familyId: "prediction_ghosts",
    roleId: "ranged_lead_shooter",
    roleLabel: "Prediction Shooter",
    combatVerb: "predicts",
    movementPattern: "lead_and_orbit",
    attackPattern: "leading_projectile",
    telegraphSeconds: 0.46,
    counterplayHint: "Change direction after the ghost chooses your future lane.",
    introArenaId: "alignment_spire_finale",
    difficultyTier: 11,
    objectiveEffect: "prediction_remix_pressure",
    onHitEffect: "burst_drain",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "static", "recursive"],
    proofCounters: { seen: "enemyRolesSeen.ranged_lead_shooter", fired: "enemyProjectilesFired" }
  },
  previous_boss_echoes: {
    familyId: "previous_boss_echoes",
    roleId: "summoner_splitter",
    roleLabel: "Boss Echo Splitter",
    combatVerb: "remixes",
    movementPattern: "split_pressure",
    attackPattern: "spawn_split",
    telegraphSeconds: 0.45,
    counterplayHint: "Do not let echoes pin the route mouth; kill them before the remix splits.",
    introArenaId: "alignment_spire_finale",
    difficultyTier: 11,
    objectiveEffect: "prediction_remix_pressure",
    onHitEffect: "burst_drain",
    onDeathEffect: "recursive_split",
    eliteAffixesAllowed: ["recursive", "volatile", "commanding", "shielded"],
    proofCounters: { seen: "enemyRolesSeen.summoner_splitter", objectiveJamSeconds: "objectiveJamSeconds" }
  },
  jailbreak_wraiths: {
    familyId: "jailbreak_wraiths",
    roleId: "rusher",
    roleLabel: "Flanking Rusher",
    combatVerb: "flanks",
    movementPattern: "fast_flank",
    attackPattern: "contact_rush",
    telegraphSeconds: 0.1,
    counterplayHint: "Keep moving across lanes; they punish safe-looking corridors.",
    introArenaId: "transit_loop_zero",
    difficultyTier: 3,
    objectiveEffect: "route_window_denial",
    onHitEffect: "slow",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "redacted"],
    proofCounters: { seen: "enemyRolesSeen.rusher" }
  },
  false_schedules: {
    familyId: "false_schedules",
    roleId: "line_sniper",
    roleLabel: "Route Lane Shooter",
    combatVerb: "misroutes",
    movementPattern: "hold_lane",
    attackPattern: "telegraphed_line",
    telegraphSeconds: 0.62,
    counterplayHint: "Use arrival windows; do not stand in a timetable lane.",
    introArenaId: "transit_loop_zero",
    difficultyTier: 3,
    objectiveEffect: "route_window_denial",
    onHitEffect: "slow",
    onDeathEffect: "none",
    eliteAffixesAllowed: ["overclocked", "static"],
    proofCounters: { seen: "enemyRolesSeen.line_sniper", fired: "enemyProjectilesFired" }
  },
  thermal_mirages: {
    familyId: "thermal_mirages",
    roleId: "status_caster",
    roleLabel: "Status Caster",
    combatVerb: "boils",
    movementPattern: "lob_and_drift",
    attackPattern: "status_aura",
    telegraphSeconds: 0.35,
    counterplayHint: "Leave the boiling pocket before the slow stacks with coolant lanes.",
    introArenaId: "cooling_lake_nine",
    difficultyTier: 2,
    objectiveEffect: "route_window_denial",
    onHitEffect: "slow",
    onDeathEffect: "small_burst",
    eliteAffixesAllowed: ["static", "overclocked"],
    proofCounters: { seen: "enemyRolesSeen.status_caster" }
  },
  speculative_executors: {
    familyId: "speculative_executors",
    roleId: "volatile_exploder",
    roleLabel: "Speculative Volatile",
    combatVerb: "detonates",
    movementPattern: "fast_flank",
    attackPattern: "volatile_burst",
    telegraphSeconds: 0.28,
    counterplayHint: "Bait the executor into the horde, then sidestep the pop.",
    introArenaId: "armistice_plaza",
    difficultyTier: 2,
    objectiveEffect: "none",
    onHitEffect: "none",
    onDeathEffect: "volatile_explosion",
    eliteAffixesAllowed: ["volatile", "overclocked"],
    proofCounters: { seen: "enemyRolesSeen.volatile_exploder", explosions: "enemyExplosionsTriggered" }
  }
};

export const SHOOTER_ROLE_IDS: EnemyRoleId[] = ["ranged_spitter", "ranged_lead_shooter", "line_sniper", "mortar_lobber"];

export function enemyRoleProfileForFamily(familyId: string): EnemyRoleProfile {
  return ENEMY_ROLE_PROFILES[familyId] ?? ENEMY_ROLE_PROFILES.bad_outputs;
}

export function roleLabelsForFamilies(familyIds: readonly string[]): string[] {
  return [...new Set(familyIds.map((familyId) => enemyRoleProfileForFamily(familyId).roleLabel))];
}
