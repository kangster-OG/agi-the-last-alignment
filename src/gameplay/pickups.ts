import { palette } from "../core/Assets";
import type { Entity, Player } from "../ecs/components";
import type { World } from "../ecs/World";
import type { BuildStats } from "./upgrades";

export function spawnXp(world: World, worldX: number, worldY: number, value: number): Entity {
  const pickup = world.spawn("pickup");
  pickup.worldX = worldX;
  pickup.worldY = worldY;
  pickup.radius = 0.24;
  pickup.value = value;
  pickup.color = value > 2 ? palette.lemon : palette.blue;
  pickup.label = value > 2 ? "large Coherence Shard" : "Coherence Shard";
  return pickup;
}

export function updatePickup(pickup: Entity, player: Player, build: BuildStats, dt: number): boolean {
  const dx = player.worldX - pickup.worldX;
  const dy = player.worldY - pickup.worldY;
  const dist = Math.hypot(dx, dy);
  if (dist < build.pickupRange && dist > 0.01) {
    const pull = (build.pickupRange - dist) * 7.5;
    pickup.worldX += (dx / dist) * pull * dt;
    pickup.worldY += (dy / dist) * pull * dt;
  }
  if (dist <= player.radius + pickup.radius) {
    player.xp += pickup.value;
    pickup.active = false;
    return true;
  }
  return false;
}
