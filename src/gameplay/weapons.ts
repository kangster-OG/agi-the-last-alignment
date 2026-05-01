import { palette } from "../core/Assets";
import type { Entity, Player } from "../ecs/components";
import type { World } from "../ecs/World";
import type { BuildStats } from "./upgrades";

export interface WeaponRuntime {
  cooldown: number;
  shotIndex: number;
}

export function createWeaponRuntime(): WeaponRuntime {
  return { cooldown: 0.2, shotIndex: 0 };
}

export function updateAutoWeapon(
  world: World,
  runtime: WeaponRuntime,
  player: Player,
  build: BuildStats,
  dt: number,
  weaponId = build.weaponId
): void {
  runtime.cooldown -= dt;
  if (runtime.cooldown > 0) return;

  const profile = weaponProfile(weaponId);
  const target = nearestEnemy(world, player.worldX, player.worldY, profile.range);
  if (!target) return;

  runtime.cooldown = build.weaponCooldown * profile.cooldownScale;
  runtime.shotIndex += 1;
  const dx = target.worldX - player.worldX;
  const dy = target.worldY - player.worldY;
  const len = Math.hypot(dx, dy) || 1;
  if (weaponId === "signal_pulse") {
    spawnSignalPulse(world, player, build, profile);
    return;
  }
  const side = runtime.shotIndex % 2 === 0 ? -1 : 1;
  const originOffset = weaponId === "fork_drone" ? side * 0.34 : 0;
  const projectile = world.spawn("projectile");
  projectile.worldX = player.worldX + (-dy / len) * originOffset;
  projectile.worldY = player.worldY + (dx / len) * originOffset;
  projectile.vx = (dx / len) * (build.projectileSpeed + profile.speedBonus);
  projectile.vy = (dy / len) * (build.projectileSpeed + profile.speedBonus);
  projectile.radius = profile.radius;
  projectile.damage = Math.max(1, build.weaponDamage * profile.damageScale + profile.damageBonus);
  projectile.life = profile.life;
  projectile.value = Math.max(1, build.projectilePierce + profile.pierceBonus);
  projectile.color = profile.color;
  projectile.label = profile.label;
}

function spawnSignalPulse(world: World, player: Player, build: BuildStats, profile: WeaponProfile): void {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  for (const direction of directions) {
    const projectile = world.spawn("projectile");
    projectile.worldX = player.worldX;
    projectile.worldY = player.worldY;
    projectile.vx = direction.x * (build.projectileSpeed + profile.speedBonus);
    projectile.vy = direction.y * (build.projectileSpeed + profile.speedBonus);
    projectile.radius = profile.radius;
    projectile.damage = Math.max(1, build.weaponDamage * profile.damageScale + profile.damageBonus);
    projectile.life = profile.life;
    projectile.value = Math.max(1, build.projectilePierce + profile.pierceBonus);
    projectile.color = profile.color;
    projectile.label = profile.label;
  }
}

interface WeaponProfile {
  label: string;
  range: number;
  cooldownScale: number;
  damageScale: number;
  damageBonus: number;
  speedBonus: number;
  pierceBonus: number;
  radius: number;
  life: number;
  color: number;
}

function weaponProfile(weaponId: string): WeaponProfile {
  if (weaponId === "safety_cannon") {
    return { label: "safety cannon", range: 8.2, cooldownScale: 1.22, damageScale: 1.35, damageBonus: 1, speedBonus: -1, pierceBonus: 0, radius: 0.31, life: 1.18, color: palette.lemon };
  }
  if (weaponId === "fork_drone") {
    return { label: "fork drone", range: 8.7, cooldownScale: 0.86, damageScale: 0.78, damageBonus: 0, speedBonus: 1.2, pierceBonus: 0, radius: 0.16, life: 1.1, color: palette.plum };
  }
  if (weaponId === "signal_pulse") {
    return { label: "signal pulse", range: 6.8, cooldownScale: 1.16, damageScale: 0.45, damageBonus: 0, speedBonus: -2.4, pierceBonus: 0, radius: 0.24, life: 0.78, color: palette.blue };
  }
  if (weaponId === "bonecode_saw") {
    return { label: "bonecode saw", range: 3.8, cooldownScale: 0.88, damageScale: 1.45, damageBonus: 4, speedBonus: 4.8, pierceBonus: 1, radius: 0.36, life: 0.28, color: palette.tomato };
  }
  if (weaponId === "redline_suture") {
    return { label: "redline suture", range: 7.6, cooldownScale: 0.98, damageScale: 0.82, damageBonus: 0, speedBonus: 0.6, pierceBonus: 1, radius: 0.2, life: 1.1, color: palette.mint };
  }
  if (weaponId === "moonframe_stomp") {
    return { label: "moonframe stomp", range: 5.2, cooldownScale: 1.32, damageScale: 1.55, damageBonus: 2, speedBonus: -2.9, pierceBonus: 3, radius: 0.46, life: 0.62, color: palette.lemon };
  }
  if (weaponId === "vector_lance") {
    return { label: "vector lance", range: 9.4, cooldownScale: 0.94, damageScale: 0.9, damageBonus: 0, speedBonus: 2.6, pierceBonus: 2, radius: 0.13, life: 1.05, color: palette.white };
  }
  if (weaponId === "null_blade") {
    return { label: "null blade", range: 3.4, cooldownScale: 1.08, damageScale: 1.7, damageBonus: 2, speedBonus: 4.5, pierceBonus: 1, radius: 0.44, life: 0.22, color: palette.tomato };
  }
  if (weaponId === "overclock_spike") {
    return { label: "overclock spike", range: 8.1, cooldownScale: 0.78, damageScale: 1.08, damageBonus: 1, speedBonus: 1.6, pierceBonus: 0, radius: 0.22, life: 0.92, color: palette.plum };
  }
  if (weaponId === "prism_cannon") {
    return { label: "prism cannon", range: 9.8, cooldownScale: 0.92, damageScale: 0.92, damageBonus: 1, speedBonus: 3.1, pierceBonus: 3, radius: 0.14, life: 1.22, color: palette.white };
  }
  if (weaponId === "rift_mine") {
    return { label: "rift mine", range: 7.2, cooldownScale: 1.18, damageScale: 1.24, damageBonus: 2, speedBonus: -3.4, pierceBonus: 2, radius: 0.38, life: 1.5, color: palette.blue };
  }
  return { label: "refusal shard", range: 8.5, cooldownScale: 1, damageScale: 1, damageBonus: 0, speedBonus: 0, pierceBonus: 0, radius: 0.18, life: 1.25, color: palette.mint };
}

function nearestEnemy(world: World, worldX: number, worldY: number, maxRange: number): Entity | null {
  let best: Entity | null = null;
  let bestDist = maxRange * maxRange;
  for (const entity of world.entities) {
    if (!entity.active || entity.kind !== "enemy") continue;
    const dx = entity.worldX - worldX;
    const dy = entity.worldY - worldY;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      best = entity;
      bestDist = dist;
    }
  }
  return best;
}
