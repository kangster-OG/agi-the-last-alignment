import { palette } from "../core/Assets";
import type { Entity, Player } from "../ecs/components";
import type { World } from "../ecs/World";

export function spawnEnemy(world: World, worldX: number, worldY: number, seconds: number, familyId = "bad_outputs", sourceRegionId = ""): Entity {
  const enemy = world.spawn("enemy");
  const tougher = familyId === "benchmark_gremlins" || seconds > 34;
  const crab = familyId === "context_rot_crabs";
  enemy.worldX = worldX;
  enemy.worldY = worldY;
  enemy.radius = tougher ? 0.42 : crab ? 0.38 : 0.34;
  enemy.maxHp = tougher ? 34 : crab ? 27 : 22;
  enemy.hp = enemy.maxHp;
  enemy.damage = tougher ? 8 : crab ? 7 : 5;
  enemy.speed = tougher ? 1.85 : crab ? 1.7 : 1.5;
  enemy.color = tougher ? palette.plum : crab ? 0x7a4c5a : 0x1a101f;
  enemy.value = tougher ? 2 : 1;
  enemy.label = enemyLabel(familyId, sourceRegionId);
  enemy.enemyFamilyId = familyId;
  enemy.sourceRegionId = sourceRegionId;
  return enemy;
}

function enemyLabel(familyId: string, sourceRegionId: string): string {
  if (sourceRegionId === "treaty_monument_oath_pages") return "Torn Oath Page";
  if (familyId === "benchmark_gremlins") return "Benchmark Gremlin";
  if (familyId === "context_rot_crabs") return "Context Crab";
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
