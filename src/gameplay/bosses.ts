import { palette } from "../core/Assets";
import type { Entity } from "../ecs/components";
import type { World } from "../ecs/World";

export function spawnMiniboss(world: World, worldX: number, worldY: number): Entity {
  const boss = world.spawn("enemy");
  boss.worldX = worldX;
  boss.worldY = worldY;
  boss.radius = 0.82;
  boss.maxHp = 820;
  boss.hp = boss.maxHp;
  boss.damage = 15;
  boss.speed = 1.52;
  boss.color = palette.lemon;
  boss.value = 12;
  boss.boss = true;
  boss.label = "The Oath-Eater";
  return boss;
}
