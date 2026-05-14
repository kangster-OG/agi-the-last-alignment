import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "docs", "proof", "enemy-roles");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const enemiesSource = fs.readFileSync(path.join(root, "src", "content", "enemies.ts"), "utf8");
const arenasSource = fs.readFileSync(path.join(root, "src", "content", "arenas.ts"), "utf8");
const rolesSource = fs.readFileSync(path.join(root, "src", "content", "enemyRoleProfiles.ts"), "utf8");
const levelSource = fs.readFileSync(path.join(root, "src", "level", "LevelRunState.ts"), "utf8");
const renderSource = fs.readFileSync(path.join(root, "src", "proof", "renderGameToText.ts"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const expectedFamilies = [
  "bad_outputs",
  "prompt_leeches",
  "benchmark_gremlins",
  "eval_wraiths",
  "context_rot_crabs",
  "memory_anchors",
  "overfit_horrors",
  "token_gobblers",
  "model_collapse_slimes",
  "static_skimmers",
  "tidecall_static",
  "solar_reflections",
  "choirglass",
  "redaction_angels",
  "injunction_writs",
  "verdict_clerks",
  "doctrine_auditors",
  "prediction_ghosts",
  "previous_boss_echoes",
  "deepforms",
  "jailbreak_wraiths",
  "false_schedules",
  "thermal_mirages",
  "speculative_executors"
];

const expectedArenas = {
  armistice_plaza: ["bad_outputs", "benchmark_gremlins", "eval_wraiths", "context_rot_crabs"],
  cooling_lake_nine: ["prompt_leeches", "deepforms", "model_collapse_slimes", "thermal_mirages"],
  transit_loop_zero: ["false_schedules", "token_gobblers", "jailbreak_wraiths", "eval_wraiths"],
  signal_coast: ["static_skimmers", "deepforms", "eval_wraiths", "model_collapse_slimes"],
  blackwater_beacon: ["tidecall_static", "deepforms", "eval_wraiths", "model_collapse_slimes"],
  memory_cache_001: ["context_rot_crabs", "memory_anchors", "redaction_angels", "eval_wraiths"],
  guardrail_forge: ["doctrine_auditors", "benchmark_gremlins", "eval_wraiths", "overfit_horrors"],
  glass_sunfield: ["solar_reflections", "choirglass", "eval_wraiths", "overfit_horrors"],
  archive_of_unsaid_things: ["redaction_angels", "injunction_writs", "context_rot_crabs", "eval_wraiths"],
  appeal_court_ruins: ["verdict_clerks", "injunction_writs", "redaction_angels", "jailbreak_wraiths"],
  alignment_spire_finale: ["prediction_ghosts", "previous_boss_echoes", "choirglass", "deepforms", "jailbreak_wraiths"]
};

const roleByFamily = {
  bad_outputs: "swarm_fodder",
  prompt_leeches: "rusher",
  benchmark_gremlins: "support_buffer",
  eval_wraiths: "ranged_spitter",
  context_rot_crabs: "trail_layer",
  memory_anchors: "summoner_splitter",
  overfit_horrors: "bruiser_blocker",
  token_gobblers: "rusher",
  model_collapse_slimes: "volatile_exploder",
  static_skimmers: "ranged_lead_shooter",
  tidecall_static: "mortar_lobber",
  solar_reflections: "line_sniper",
  choirglass: "ranged_lead_shooter",
  redaction_angels: "trail_layer",
  injunction_writs: "line_sniper",
  verdict_clerks: "line_sniper",
  doctrine_auditors: "objective_jammer",
  prediction_ghosts: "ranged_lead_shooter",
  previous_boss_echoes: "summoner_splitter",
  deepforms: "bruiser_blocker",
  jailbreak_wraiths: "rusher",
  false_schedules: "line_sniper",
  thermal_mirages: "status_caster",
  speculative_executors: "volatile_exploder"
};

const shooterRoles = new Set(["ranged_spitter", "ranged_lead_shooter", "line_sniper", "mortar_lobber"]);
const checks = [];
function check(id, pass, detail) {
  checks.push({ id, pass, detail });
}

for (const family of expectedFamilies) {
  check(`family_declared_${family}`, enemiesSource.includes(`${family}: {`) || enemiesSource.includes(`"${family}"`), "family exists in ENEMY_FAMILIES or runtime family slate");
  check(`role_profile_${family}`, rolesSource.includes(`${family}: {`) && rolesSource.includes(`familyId: "${family}"`), "role profile row exists");
  check(`role_id_${family}`, rolesSource.includes(`${family}: {`) && rolesSource.includes(`roleId: "${roleByFamily[family]}"`), `expected ${roleByFamily[family]}`);
}

for (const field of [
  "familyId",
  "roleId",
  "roleLabel",
  "combatVerb",
  "movementPattern",
  "attackPattern",
  "telegraphSeconds",
  "counterplayHint",
  "introArenaId",
  "difficultyTier",
  "objectiveEffect",
  "onHitEffect",
  "onDeathEffect",
  "eliteAffixesAllowed",
  "proofCounters"
]) {
  check(`profile_field_${field}`, rolesSource.includes(`${field}:`), `${field} present`);
}

for (const [arenaId, families] of Object.entries(expectedArenas)) {
  check(`${arenaId}_arena_declared`, arenasSource.includes(`${arenaId}: {`), "campaign arena declared");
  for (const family of families) {
    check(`${arenaId}_has_${family}`, arenasSource.includes(`"${family}"`), `${family} in arena source`);
  }
  const roles = new Set(families.map((family) => roleByFamily[family]));
  check(`${arenaId}_two_distinct_roles`, roles.size >= 2, `${roles.size} roles`);
}

for (const arenaId of ["signal_coast", "blackwater_beacon", "memory_cache_001", "guardrail_forge", "glass_sunfield", "archive_of_unsaid_things", "appeal_court_ruins", "alignment_spire_finale"]) {
  const roles = expectedArenas[arenaId].map((family) => roleByFamily[family]);
  check(`${arenaId}_has_ranged_role`, roles.some((role) => shooterRoles.has(role)), roles.join(","));
}

check("shooter_by_signal", expectedArenas.signal_coast.some((family) => shooterRoles.has(roleByFamily[family])), "Signal Coast introduces Static Skimmer ranged pressure");
check("mid_volatile", expectedArenas.cooling_lake_nine.some((family) => roleByFamily[family] === "volatile_exploder"), "Cooling includes volatile slime");
check("mid_trail", expectedArenas.memory_cache_001.some((family) => roleByFamily[family] === "trail_layer"), "Memory includes Context Rot trail");
check("mid_support", expectedArenas.guardrail_forge.some((family) => roleByFamily[family] === "support_buffer" || family === "overfit_horrors"), "Guardrail includes support/buffer pressure");
check("mid_objective_jammer", expectedArenas.guardrail_forge.some((family) => roleByFamily[family] === "objective_jammer"), "Guardrail includes Doctrine Auditor objective jammer");

const lateFamilies = [...expectedArenas.archive_of_unsaid_things, ...expectedArenas.appeal_court_ruins, ...expectedArenas.alignment_spire_finale];
const lateRoles = new Set(lateFamilies.map((family) => roleByFamily[family]));
check("late_has_ranged", [...lateRoles].some((role) => shooterRoles.has(role)), [...lateRoles].join(","));
check("late_has_objective_pressure", lateFamilies.some((family) => ["doctrine_auditors", "verdict_clerks", "injunction_writs", "prediction_ghosts", "previous_boss_echoes"].includes(family)), lateFamilies.join(","));
check("late_has_elite_capable", rolesSource.includes("eliteAffixesAllowed") && rolesSource.includes('"commanding"') && rolesSource.includes('"recursive"'), "late profiles allow readable affixes");

for (const telemetryField of [
  "enemyRolesSeen",
  "rangedFamiliesSeen",
  "enemyProjectilesFired",
  "enemyProjectilesActive",
  "enemyProjectileHits",
  "enemyProjectileDodges",
  "enemyExplosionsTriggered",
  "enemyTrailSeconds",
  "supportAuraSeconds",
  "objectiveJamSeconds",
  "eliteAffixesSeen",
  "eliteKills",
  "preBossEnemyRolePressureSeconds",
  "currentPhaseEnemyRoleMix"
]) {
  check(`telemetry_${telemetryField}`, levelSource.includes(telemetryField) && renderSource.includes(telemetryField), `${telemetryField} exposed`);
}

check("enemy_projectile_runtime", levelSource.includes("spawnEnemyTelegraph") && levelSource.includes("resolveEnemyProjectileHits") && levelSource.includes("ENEMY_PROJECTILE_CAP"), "shared hostile projectile runtime exists");
check("enemy_projectile_art_loader", renderSource.includes("enemyRoleVfxReady") && levelSource.includes("getEnemyRoleVfxTextures"), "source-backed enemy role VFX loader is wired");
check("proof_script_registered", packageJson.scripts?.["proof:enemy-roles"] === "node scripts/proof/enemy-role-static.mjs", "package script registered");
check("asset_pack_script_registered", packageJson.scripts?.["assets:enemy-role-vfx-v1"] === "python3 scripts/assets/pack-enemy-role-vfx-v1.py", "asset packer registered");

const failed = checks.filter((entry) => !entry.pass);
const report = {
  generatedAt: new Date().toISOString(),
  familyCount: expectedFamilies.length,
  campaignArenaCount: Object.keys(expectedArenas).length,
  distinctRoles: new Set(Object.values(roleByFamily)).size,
  checks
};

fs.writeFileSync(path.join(outDir, "enemy-role-static.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(outDir, "enemy-role-static.md"),
  [
    "# Enemy Role Static Proof",
    "",
    `- families: ${expectedFamilies.length}`,
    `- campaign arenas: ${Object.keys(expectedArenas).length}`,
    `- distinct roles: ${report.distinctRoles}`,
    `- failed checks: ${failed.length}`,
    "",
    ...checks.map((entry) => `- ${entry.pass ? "PASS" : "FAIL"} ${entry.id}: ${entry.detail}`)
  ].join("\n")
);

if (failed.length > 0) {
  console.error(`Enemy role static proof failed: ${failed.map((entry) => entry.id).join(", ")}`);
  process.exit(1);
}

console.log(`Enemy role static proof passed (${checks.length} checks).`);
