import { Container, Graphics, Text } from "pixi.js";
import { fontStyle, palette } from "../core/Assets";
import { worldToIso } from "../iso/projection";

export function chunkyLabel(text: string, size = 18, color = "#fff4d6"): Text {
  return new Text({
    text,
    style: {
      ...fontStyle,
      fill: color,
      fontSize: size
    }
  });
}

export function addShadow(container: Container, x: number, y: number, radius: number, alpha = 0.35): void {
  const shadow = new Graphics();
  shadow.ellipse(x, y + radius * 0.45, radius * 1.25, radius * 0.45).fill({ color: palette.shadow, alpha });
  container.addChild(shadow);
}

export function drawPixelPerson(container: Container, worldX: number, worldY: number, color: number, accent: number): void {
  const g = new Graphics();
  drawPixelPersonOnGraphics(g, worldX, worldY, color, accent);
  container.addChild(g);
}

export function drawPixelPersonOnGraphics(g: Graphics, worldX: number, worldY: number, color: number, accent: number): void {
  const p = worldToIso(worldX, worldY);
  drawShadowOnGraphics(g, p.screenX, p.screenY, 15);
  g.rect(p.screenX - 9, p.screenY - 30, 18, 22).fill(color).stroke({ color: palette.ink, width: 3 });
  g.rect(p.screenX - 7, p.screenY - 42, 14, 13).fill(accent).stroke({ color: palette.ink, width: 3 });
  g.rect(p.screenX - 14, p.screenY - 21, 6, 14).fill(accent);
  g.rect(p.screenX + 8, p.screenY - 21, 6, 14).fill(accent);
}

export function drawEnemy(container: Container, worldX: number, worldY: number, radius: number, color: number, boss = false): void {
  const g = new Graphics();
  drawEnemyOnGraphics(g, worldX, worldY, radius, color, boss);
  container.addChild(g);
}

export function drawEnemyOnGraphics(g: Graphics, worldX: number, worldY: number, radius: number, color: number, boss = false): void {
  const p = worldToIso(worldX, worldY);
  drawShadowOnGraphics(g, p.screenX, p.screenY, radius);
  if (boss) {
    g.rect(p.screenX - radius, p.screenY - radius * 1.8, radius * 2, radius * 1.5).fill(color).stroke({ color: palette.ink, width: 4 });
    g.rect(p.screenX - radius * 0.7, p.screenY - radius * 2.25, radius * 1.4, radius * 0.5).fill(palette.lemon).stroke({ color: palette.ink, width: 3 });
  } else {
    g.rect(p.screenX - radius, p.screenY - radius * 1.4, radius * 2, radius * 1.5).fill(color).stroke({ color: palette.ink, width: 3 });
    g.rect(p.screenX - radius * 0.5, p.screenY - radius * 1.7, radius, radius * 0.4).fill(palette.paper);
  }
}

function drawShadowOnGraphics(graphics: Graphics, x: number, y: number, radius: number, alpha = 0.35): void {
  graphics.ellipse(x, y + radius * 0.45, radius * 1.25, radius * 0.45).fill({ color: palette.shadow, alpha });
}
