import { Graphics } from "pixi.js";
import { TILE_HEIGHT, TILE_WIDTH, worldToIso } from "./projection";

export function drawIsoDiamond(
  graphics: Graphics,
  worldX: number,
  worldY: number,
  color: number,
  outline = 0x263238
): void {
  const p = worldToIso(worldX, worldY);
  const hw = TILE_WIDTH * 0.5;
  const hh = TILE_HEIGHT * 0.5;
  graphics
    .poly([p.screenX, p.screenY - hh, p.screenX + hw, p.screenY, p.screenX, p.screenY + hh, p.screenX - hw, p.screenY])
    .fill(color)
    .stroke({ color: outline, width: 1, alpha: 0.5 });
}
