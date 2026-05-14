import { palette } from "../core/Assets";
import type { Entity, Player } from "../ecs/components";
import type { World } from "../ecs/World";
import { enemyRoleProfileForFamily } from "../content/enemyRoleProfiles";

export function spawnEnemy(world: World, worldX: number, worldY: number, seconds: number, familyId = "bad_outputs", sourceRegionId = ""): Entity {
  const enemy = world.spawn("enemy");
  const stats = enemyStatsForFamily(familyId, seconds);
  enemy.worldX = worldX;
  enemy.worldY = worldY;
  enemy.radius = stats.radius;
  enemy.maxHp = stats.hp;
  enemy.hp = enemy.maxHp;
  enemy.damage = stats.damage;
  enemy.speed = stats.speed;
  enemy.color = stats.color;
  enemy.value = stats.value;
  enemy.label = enemyLabel(familyId, sourceRegionId);
  enemy.enemyFamilyId = familyId;
  enemy.sourceRegionId = sourceRegionId;
  enemy.roleCooldown = initialRoleCooldown(familyId, seconds, enemy.id);
  enemy.roleState = "";
  enemy.eliteAffixId = chooseEliteAffix(familyId, seconds, enemy.id);
  if (enemy.eliteAffixId) applyEliteStats(enemy);
  return enemy;
}

function enemyStatsForFamily(familyId: string, seconds: number): { hp: number; speed: number; damage: number; radius: number; color: number; value: number } {
  if (familyId === "benchmark_gremlins") return { hp: 34, speed: 1.85, damage: 8, radius: 0.42, color: palette.plum, value: 2 };
  if (familyId === "context_rot_crabs") return { hp: 27, speed: 1.7, damage: 7, radius: 0.38, color: 0x7a4c5a, value: 1 };
  if (familyId === "prompt_leeches") return { hp: 18, speed: 2.12, damage: 5, radius: 0.31, color: 0x45aaf2, value: 1 };
  if (familyId === "static_skimmers") return { hp: 24, speed: 1.72, damage: 3, radius: 0.34, color: 0x64e0b4, value: 1 };
  if (familyId === "tidecall_static") return { hp: 31, speed: 2.06, damage: 7, radius: 0.36, color: 0x64e0b4, value: 1 };
  if (familyId === "solar_reflections") return { hp: 33, speed: 2.04, damage: 7, radius: 0.36, color: 0xfff4d6, value: 1 };
  if (familyId === "memory_anchors") return { hp: 39, speed: 1.28, damage: 8, radius: 0.46, color: 0x99f6ff, value: 2 };
  if (familyId === "doctrine_auditors") return { hp: 43, speed: 1.48, damage: 8, radius: 0.44, color: 0xffd166, value: 2 };
  if (familyId === "jailbreak_wraiths") return { hp: 24, speed: 2.0, damage: 7, radius: 0.33, color: 0xff5d57, value: 1 };
  if (familyId === "overfit_horrors") return { hp: 42, speed: 1.26, damage: 10, radius: 0.48, color: 0xffd166, value: 2 };
  if (familyId === "token_gobblers") return { hp: 26, speed: 1.92, damage: 6, radius: 0.36, color: 0x64e0b4, value: 1 };
  if (familyId === "model_collapse_slimes") return { hp: 38, speed: 1.18, damage: 8, radius: 0.5, color: 0x7b61ff, value: 2 };
  if (familyId === "eval_wraiths") return { hp: 28, speed: 1.74, damage: 7, radius: 0.36, color: 0xfff4d6, value: 1 };
  if (familyId === "redaction_angels") return { hp: 34, speed: 1.72, damage: 8, radius: 0.4, color: 0x111820, value: 2 };
  if (familyId === "injunction_writs") return { hp: 36, speed: 1.58, damage: 8, radius: 0.42, color: 0xb8f3ff, value: 2 };
  if (familyId === "verdict_clerks") return { hp: 38, speed: 1.66, damage: 8, radius: 0.41, color: 0xffd166, value: 2 };
  if (familyId === "prediction_ghosts") return { hp: 42, speed: 2.12, damage: 9, radius: 0.39, color: 0xff5d57, value: 2 };
  if (familyId === "previous_boss_echoes") return { hp: 56, speed: 1.36, damage: 10, radius: 0.5, color: 0x7b61ff, value: 3 };
  if (familyId === "deepforms") return { hp: 44, speed: 1.34, damage: 9, radius: 0.52, color: 0x2a5c71, value: 2 };
  if (familyId === "choirglass") return { hp: 30, speed: 1.82, damage: 7, radius: 0.37, color: 0xb8f3ff, value: 1 };
  if (familyId === "speculative_executors") return { hp: 30, speed: 1.95, damage: 8, radius: 0.39, color: 0xff8a3d, value: 2 };
  const tougher = seconds > 34;
  return { hp: tougher ? 34 : 22, speed: tougher ? 1.85 : 1.5, damage: tougher ? 8 : 5, radius: tougher ? 0.42 : 0.34, color: tougher ? palette.plum : 0x1a101f, value: tougher ? 2 : 1 };
}

function enemyLabel(familyId: string, sourceRegionId: string): string {
  if (sourceRegionId === "treaty_monument_oath_pages") return "Torn Oath Page";
  if (familyId === "prompt_leeches") return "Prompt Leech";
  if (familyId === "static_skimmers") return "Static Skimmer";
  if (familyId === "tidecall_static") return "Tidecall Static";
  if (familyId === "solar_reflections") return "Solar Reflection";
  if (familyId === "memory_anchors") return "Memory Anchor";
  if (familyId === "doctrine_auditors") return "Doctrine Auditor";
  if (familyId === "jailbreak_wraiths") return "Jailbreak Wraith";
  if (familyId === "benchmark_gremlins") return "Benchmark Gremlin";
  if (familyId === "overfit_horrors") return "Overfit Horror";
  if (familyId === "token_gobblers") return "Token Gobbler";
  if (familyId === "model_collapse_slimes") return "Model Collapse Slime";
  if (familyId === "eval_wraiths") return "Eval Wraith";
  if (familyId === "context_rot_crabs") return "Context Crab";
  if (familyId === "redaction_angels") return "Redaction Angel";
  if (familyId === "injunction_writs") return "Injunction Writ";
  if (familyId === "verdict_clerks") return "Verdict Clerk";
  if (familyId === "prediction_ghosts") return "Prediction Ghost";
  if (familyId === "previous_boss_echoes") return "Boss Echo";
  if (familyId === "deepforms") return "Deepform";
  if (familyId === "choirglass") return "Choirglass";
  if (familyId === "speculative_executors") return "Speculative Executor";
  return "Little Bad Answer";
}

export function updateEnemy(enemy: Entity, player: Player, dt: number): void {
  const dx = player.worldX - enemy.worldX;
  const dy = player.worldY - enemy.worldY;
  const len = Math.hypot(dx, dy) || 1;
  const profile = enemyRoleProfileForFamily(enemy.enemyFamilyId);
  const windupSlow = enemy.roleWindup > 0 && ["ranged_spitter", "ranged_lead_shooter", "line_sniper", "mortar_lobber"].includes(profile.roleId) ? 0.28 : 1;
  let movementScale =
    profile.movementPattern === "lead_and_orbit"
      ? 0.72
      : profile.movementPattern === "hold_lane"
        ? 0.48
        : profile.movementPattern === "aura_anchor"
          ? 0.62
          : profile.movementPattern === "slow_body_block"
            ? 0.82
            : 1;
  if (profile.movementPattern === "lead_and_orbit") {
    if (len < 4.4) movementScale = -0.46;
    const strafe = ((enemy.id % 2) * 2 - 1) * 0.42;
    enemy.vx = (dx / len) * enemy.speed * movementScale * windupSlow + (-dy / len) * enemy.speed * strafe;
    enemy.vy = (dy / len) * enemy.speed * movementScale * windupSlow + (dx / len) * enemy.speed * strafe;
  } else {
    enemy.vx = (dx / len) * enemy.speed * movementScale * windupSlow;
    enemy.vy = (dy / len) * enemy.speed * movementScale * windupSlow;
  }
  enemy.worldX += enemy.vx * dt;
  enemy.worldY += enemy.vy * dt;
}

function initialRoleCooldown(familyId: string, seconds: number, seed: number): number {
  const profile = enemyRoleProfileForFamily(familyId);
  if (!["ranged_spitter", "ranged_lead_shooter", "line_sniper", "mortar_lobber"].includes(profile.roleId)) {
    return seededRange(seed, seconds, 0.45, 1.1);
  }
  const introDelay = profile.introArenaId === "armistice_plaza" ? 10 : familyId === "static_skimmers" ? 8 : 2;
  return introDelay + seededRange(seed, seconds, 0.4, 1.4);
}

function chooseEliteAffix(familyId: string, seconds: number, seed: number): string {
  const profile = enemyRoleProfileForFamily(familyId);
  if (profile.eliteAffixesAllowed.length === 0) return "";
  if (profile.difficultyTier <= 2 && seconds < 170) return "";
  if (profile.difficultyTier <= 4 && seconds < 80) return "";
  if (seconds < 28) return "";
  const chance = profile.difficultyTier >= 9 ? 0.075 : profile.difficultyTier >= 6 ? 0.045 : 0.025;
  const roll = seededUnit(seed * 97 + Math.floor(seconds * 3));
  if (roll > chance) return "";
  const index = Math.floor(seededUnit(seed * 131 + familyId.length * 17) * profile.eliteAffixesAllowed.length);
  return profile.eliteAffixesAllowed[index] ?? "";
}

function applyEliteStats(enemy: Entity): void {
  enemy.label = `${eliteLabel(enemy.eliteAffixId)} ${enemy.label}`;
  if (enemy.eliteAffixId === "shielded") {
    enemy.maxHp = Math.ceil(enemy.maxHp * 1.55);
    enemy.hp = enemy.maxHp;
  } else if (enemy.eliteAffixId === "overclocked") {
    enemy.speed *= 1.16;
    enemy.damage += 1;
  } else if (enemy.eliteAffixId === "commanding") {
    enemy.maxHp = Math.ceil(enemy.maxHp * 1.25);
    enemy.hp = enemy.maxHp;
  } else if (enemy.eliteAffixId === "volatile") {
    enemy.damage += 2;
  }
}

function eliteLabel(affixId: string): string {
  if (affixId === "overclocked") return "Overclocked";
  if (affixId === "shielded") return "Shielded";
  if (affixId === "redacted") return "Redacted";
  if (affixId === "recursive") return "Recursive";
  if (affixId === "volatile") return "Volatile";
  if (affixId === "static") return "Static";
  if (affixId === "commanding") return "Commanding";
  return "Elite";
}

function seededRange(seed: number, seconds: number, min: number, max: number): number {
  return min + seededUnit(seed * 17 + Math.floor(seconds * 5)) * (max - min);
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}
