import { palette } from "../core/Assets";
import type { Entity, Player } from "../ecs/components";
import type { World } from "../ecs/World";

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
  return enemy;
}

function enemyStatsForFamily(familyId: string, seconds: number): { hp: number; speed: number; damage: number; radius: number; color: number; value: number } {
  if (familyId === "benchmark_gremlins") return { hp: 34, speed: 1.85, damage: 8, radius: 0.42, color: palette.plum, value: 2 };
  if (familyId === "context_rot_crabs") return { hp: 27, speed: 1.7, damage: 7, radius: 0.38, color: 0x7a4c5a, value: 1 };
  if (familyId === "prompt_leeches") return { hp: 18, speed: 2.12, damage: 5, radius: 0.31, color: 0x45aaf2, value: 1 };
  if (familyId === "jailbreak_wraiths") return { hp: 24, speed: 2.0, damage: 7, radius: 0.33, color: 0xff5d57, value: 1 };
  if (familyId === "overfit_horrors") return { hp: 42, speed: 1.26, damage: 10, radius: 0.48, color: 0xffd166, value: 2 };
  if (familyId === "token_gobblers") return { hp: 26, speed: 1.92, damage: 6, radius: 0.36, color: 0x64e0b4, value: 1 };
  if (familyId === "model_collapse_slimes") return { hp: 38, speed: 1.18, damage: 8, radius: 0.5, color: 0x7b61ff, value: 2 };
  if (familyId === "eval_wraiths") return { hp: 28, speed: 1.74, damage: 7, radius: 0.36, color: 0xfff4d6, value: 1 };
  if (familyId === "redaction_angels") return { hp: 34, speed: 1.72, damage: 8, radius: 0.4, color: 0x111820, value: 2 };
  if (familyId === "deepforms") return { hp: 44, speed: 1.34, damage: 9, radius: 0.52, color: 0x2a5c71, value: 2 };
  if (familyId === "choirglass") return { hp: 30, speed: 1.82, damage: 7, radius: 0.37, color: 0xb8f3ff, value: 1 };
  const tougher = seconds > 34;
  return { hp: tougher ? 34 : 22, speed: tougher ? 1.85 : 1.5, damage: tougher ? 8 : 5, radius: tougher ? 0.42 : 0.34, color: tougher ? palette.plum : 0x1a101f, value: tougher ? 2 : 1 };
}

function enemyLabel(familyId: string, sourceRegionId: string): string {
  if (sourceRegionId === "treaty_monument_oath_pages") return "Torn Oath Page";
  if (familyId === "prompt_leeches") return "Prompt Leech";
  if (familyId === "jailbreak_wraiths") return "Jailbreak Wraith";
  if (familyId === "benchmark_gremlins") return "Benchmark Gremlin";
  if (familyId === "overfit_horrors") return "Overfit Horror";
  if (familyId === "token_gobblers") return "Token Gobbler";
  if (familyId === "model_collapse_slimes") return "Model Collapse Slime";
  if (familyId === "eval_wraiths") return "Eval Wraith";
  if (familyId === "context_rot_crabs") return "Context Crab";
  if (familyId === "redaction_angels") return "Redaction Angel";
  if (familyId === "deepforms") return "Deepform";
  if (familyId === "choirglass") return "Choirglass";
  return "Little Bad Answer";
}

export function updateEnemy(enemy: Entity, player: Player, dt: number): void {
  const dx = player.worldX - enemy.worldX;
  const dy = player.worldY - enemy.worldY;
  const len = Math.hypot(dx, dy) || 1;
  enemy.vx = (dx / len) * enemy.speed;
  enemy.vy = (dy / len) * enemy.speed;
  enemy.worldX += enemy.vx * dt;
  enemy.worldY += enemy.vy * dt;
}
