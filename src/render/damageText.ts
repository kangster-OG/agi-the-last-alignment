import type { Graphics } from "pixi.js";
import { worldToIso } from "../iso/projection";

export interface DamageText {
  active: boolean;
  worldX: number;
  worldY: number;
  text: string;
  life: number;
}

export function updateDamageText(text: DamageText, dt: number): void {
  text.life -= dt;
  text.worldY -= dt * 0.5;
  if (text.life <= 0) text.active = false;
}

export function drawDamagePip(graphics: Graphics, text: DamageText): void {
  const p = worldToIso(text.worldX, text.worldY);
  const alpha = Math.max(0, Math.min(1, text.life));
  graphics.rect(p.screenX - 6, p.screenY - 42, 12, 8).fill({ color: 0xfff4d6, alpha });
}
