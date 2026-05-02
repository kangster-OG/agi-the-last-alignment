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
  objective: string,
  debugHud = false
): void {
  const chrome = new Graphics();
  const leftWidth = debugHud ? 300 : 204;
  const rightWidth = debugHud ? 278 : 196;
  chrome.rect(16, 16, leftWidth, debugHud ? 78 : 48).fill({ color: palette.ink, alpha: debugHud ? 0.84 : 0.58 }).stroke({ color: palette.paper, width: 2, alpha: debugHud ? 1 : 0.42 });
  chrome.rect(28, 30, debugHud ? 190 : 150, 10).fill(0x33191c);
  chrome.rect(28, 30, (debugHud ? 190 : 150) * Math.max(0, player.hp / player.maxHp), 10).fill(palette.tomato);
  chrome.rect(28, 48, debugHud ? 190 : 150, 8).fill(0x192833);
  chrome.rect(28, 48, (debugHud ? 190 : 150) * Math.min(1, player.xp / xpNeeded(player.level)), 8).fill(palette.blue);
  chrome.rect(width - rightWidth - 16, 16, rightWidth, debugHud ? 78 : 48).fill({ color: palette.ink, alpha: debugHud ? 0.84 : 0.58 }).stroke({ color: palette.paper, width: 2, alpha: debugHud ? 1 : 0.42 });
  layer.addChild(chrome);

  const left = new Text({
    text: debugHud ? `HP ${Math.ceil(player.hp)}/${player.maxHp}  LV ${player.level}\nSHARDS ${player.xp}/${xpNeeded(player.level)}  KOs ${kills}` : `LV ${player.level}  KO ${kills}`,
    style: { ...fontStyle, fontSize: debugHud ? 14 : 11, fill: "#fff4d6" }
  });
  left.position.set(debugHud ? 230 : 30, debugHud ? 28 : 61);
  layer.addChild(left);

  const right = new Text({
    text: debugHud ? `${Math.floor(seconds)}s  ${objective}\nDMG ${build.weaponDamage}  CD ${build.weaponCooldown.toFixed(2)}  PIERCE ${build.projectilePierce}` : `${Math.floor(seconds)}s  ${objective}`,
    style: { ...fontStyle, fontSize: debugHud ? 14 : 11, align: "right", fill: "#fff4d6" }
  });
  right.anchor.set(1, 0);
  right.position.set(width - 28, debugHud ? 29 : 31);
  layer.addChild(right);
}
