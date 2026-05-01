export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export interface WorldPoint {
  worldX: number;
  worldY: number;
}

export interface ScreenPoint {
  screenX: number;
  screenY: number;
}

export function worldToIso(
  worldX: number,
  worldY: number,
  tileWidth = TILE_WIDTH,
  tileHeight = TILE_HEIGHT
): ScreenPoint {
  return {
    screenX: (worldX - worldY) * tileWidth * 0.5,
    screenY: (worldX + worldY) * tileHeight * 0.5
  };
}

export function screenVectorToWorld(screenX: number, screenY: number): WorldPoint {
  return {
    worldX: screenX / TILE_WIDTH + screenY / TILE_HEIGHT,
    worldY: screenY / TILE_HEIGHT - screenX / TILE_WIDTH
  };
}
