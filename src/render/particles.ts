import type { Graphics } from "pixi.js";
import { worldToIso } from "../iso/projection";

export interface Particle {
  active: boolean;
  worldX: number;
  worldY: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: number;
}

export function updateParticle(p: Particle, dt: number): void {
  p.life -= dt;
  p.worldX += p.vx * dt;
  p.worldY += p.vy * dt;
  p.z += p.vz * dt;
  p.vz -= 28 * dt;
  if (p.life <= 0 || p.z < -12) p.active = false;
}

export function drawParticle(graphics: Graphics, p: Particle): void {
  const iso = worldToIso(p.worldX, p.worldY);
  const alpha = Math.max(0, p.life / p.maxLife);
  graphics.rect(iso.screenX - 2, iso.screenY - p.z - 2, 4, 4).fill({ color: p.color, alpha });
}
