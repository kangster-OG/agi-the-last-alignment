import { Graphics, Text } from "pixi.js";
import { fontStyle, palette } from "../core/Assets";
import type { Player } from "../ecs/components";
import { xpNeeded } from "../gameplay/player";
import type { BuildStats } from "../gameplay/upgrades";

export function drawHud(
  layer: import("pixi.js").Container,
  width: number,
  player: Player,
  seconds: number,
  kills: number,
  build: BuildStats,
  objective: string
): void {
  const chrome = new Graphics();
  chrome.rect(16, 16, 300, 78).fill({ color: palette.ink, alpha: 0.84 }).stroke({ color: palette.paper, width: 2 });
  chrome.rect(28, 32, 190, 13).fill(0x33191c);
  chrome.rect(28, 32, 190 * Math.max(0, player.hp / player.maxHp), 13).fill(palette.tomato);
  chrome.rect(28, 56, 190, 11).fill(0x192833);
  chrome.rect(28, 56, 190 * Math.min(1, player.xp / xpNeeded(player.level)), 11).fill(palette.blue);
  chrome.rect(width - 294, 16, 278, 78).fill({ color: palette.ink, alpha: 0.84 }).stroke({ color: palette.paper, width: 2 });
  layer.addChild(chrome);

  const left = new Text({
    text: `HP ${Math.ceil(player.hp)}/${player.maxHp}  LV ${player.level}\nSHARDS ${player.xp}/${xpNeeded(player.level)}  KOs ${kills}`,
    style: { ...fontStyle, fontSize: 14 }
  });
  left.position.set(230, 28);
  layer.addChild(left);

  const right = new Text({
    text: `${Math.floor(seconds)}s  ${objective}\nDMG ${build.weaponDamage}  CD ${build.weaponCooldown.toFixed(2)}  PIERCE ${build.projectilePierce}`,
    style: { ...fontStyle, fontSize: 14, align: "right" }
  });
  right.position.set(width - 282, 29);
  layer.addChild(right);
}
