import { circlesOverlap } from "../collision/collide";
import type { Entity, Player } from "../ecs/components";
import type { World } from "../ecs/World";
import { spawnXp } from "./pickups";

export function resolveProjectileHits(world: World): number {
  let kills = 0;
  for (const projectile of world.entities) {
    if (!projectile.active || projectile.kind !== "projectile") continue;
    projectile.worldX += projectile.vx * (1 / 60);
    projectile.worldY += projectile.vy * (1 / 60);
    projectile.life -= 1 / 60;
    if (projectile.life <= 0) {
      projectile.active = false;
      continue;
    }
    for (const enemy of world.entities) {
      if (!enemy.active || enemy.kind !== "enemy") continue;
      if (!circlesOverlap(projectile.worldX, projectile.worldY, projectile.radius, enemy.worldX, enemy.worldY, enemy.radius)) continue;
      enemy.hp -= projectile.damage;
      projectile.value -= 1;
      spawnCombatHitEffect(world, enemy.worldX, enemy.worldY, projectile.damage);
      if (enemy.hp <= 0) {
        enemy.active = false;
        kills += 1;
        spawnXp(world, enemy.worldX, enemy.worldY, enemy.value);
      }
      if (projectile.value <= 0) {
        projectile.active = false;
        break;
      }
    }
  }
  return kills;
}

function spawnCombatHitEffect(world: World, worldX: number, worldY: number, damage: number): void {
  const text = world.spawn("damageText");
  text.worldX = worldX;
  text.worldY = worldY;
  text.life = 0.72;
  text.value = damage;
  text.color = 0xfff4d6;
  text.label = `${Math.ceil(damage)}`;

  const burst = world.spawn("particle");
  burst.worldX = worldX;
  burst.worldY = worldY;
  burst.vx = 0;
  burst.vy = 0;
  burst.life = 0.34;
  burst.value = 0.34;
  burst.color = 0xffd166;
  burst.label = "impact";
}

export function resolveEnemyPlayerHits(world: World, player: Player): void {
  if (player.invuln > 0) return;
  for (const enemy of world.entities) {
    if (!enemy.active || enemy.kind !== "enemy") continue;
    if (!circlesOverlap(enemy.worldX, enemy.worldY, enemy.radius, player.worldX, player.worldY, player.radius)) continue;
    player.hp -= enemy.damage;
    player.invuln = 0.68;
    const dx = enemy.worldX - player.worldX;
    const dy = enemy.worldY - player.worldY;
    const len = Math.hypot(dx, dy) || 1;
    enemy.worldX += (dx / len) * 0.75;
    enemy.worldY += (dy / len) * 0.75;
    break;
  }
}
