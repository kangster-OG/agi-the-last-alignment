import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import groundAtlasUrl from "../../assets/tiles/armistice_plaza/ground_atlas.png";
import { TILE_HEIGHT, TILE_WIDTH, worldToIso } from "../iso/projection";

export const ARMISTICE_GROUND_ATLAS_ID = "tile.armistice_plaza.production_ground_atlas";
export const ARMISTICE_GROUND_ATLAS_URL = groundAtlasUrl;
export const ARMISTICE_TILE_FRAME_WIDTH = 64;
export const ARMISTICE_TILE_FRAME_HEIGHT = 32;

export type ArmisticeTileKey =
  | "stone"
  | "stoneCracked"
  | "stoneRoad"
  | "breachLight"
  | "breachMedium"
  | "breachHeavy"
  | "breach"
  | "terminal";

export type ArmisticeTerrainBandId =
  | "main_plaza_cross_x"
  | "main_plaza_cross_y"
  | "drone_yard_floor"
  | "barricade_corridor_floor"
  | "terminal_pad"
  | "breach_corruption"
  | string;

const TILE_INDEX_BY_KEY: Record<ArmisticeTileKey, number> = {
  stone: 0,
  stoneCracked: 1,
  stoneRoad: 2,
  breachLight: 3,
  breachMedium: 4,
  breachHeavy: 5,
  breach: 6,
  terminal: 7
};

let atlasPromise: Promise<Record<ArmisticeTileKey, Texture>> | null = null;
let atlasTextures: Record<ArmisticeTileKey, Texture> | null = null;

export function armisticeGroundAtlasReady(): boolean {
  return atlasTextures !== null;
}

export function getArmisticeGroundAtlasTextures(): Record<ArmisticeTileKey, Texture> | null {
  return atlasTextures;
}

export function loadArmisticeGroundAtlas(): Promise<Record<ArmisticeTileKey, Texture>> {
  atlasPromise ??= Assets.load<Texture>(ARMISTICE_GROUND_ATLAS_URL).then((baseTexture) => {
    const textures = {} as Record<ArmisticeTileKey, Texture>;
    for (const [key, index] of Object.entries(TILE_INDEX_BY_KEY) as [ArmisticeTileKey, number][]) {
      const col = index % 4;
      const row = Math.floor(index / 4);
      textures[key] = new Texture({
        source: baseTexture.source,
        frame: new Rectangle(col * ARMISTICE_TILE_FRAME_WIDTH, row * ARMISTICE_TILE_FRAME_HEIGHT, ARMISTICE_TILE_FRAME_WIDTH, ARMISTICE_TILE_FRAME_HEIGHT)
      });
    }
    atlasTextures = textures;
    return textures;
  });
  return atlasPromise;
}

export function armisticeTileKeyForWorld(x: number, y: number): ArmisticeTileKey {
  return armisticeTileKeyForTerrain(x, y, undefined);
}

export function armisticeTileKeyForTerrain(x: number, y: number, terrainBandId?: ArmisticeTerrainBandId): ArmisticeTileKey {
  const hash = tileHash(x, y);
  if (terrainBandId === "breach_corruption") {
    if (hash % 7 === 0) return "breach";
    if (hash % 3 === 0) return "breachHeavy";
    return hash % 2 === 0 ? "breachMedium" : "breachLight";
  }
  if (terrainBandId === "terminal_pad") {
    if (hash % 5 === 0) return "terminal";
    return hash % 3 === 0 ? "stoneCracked" : "stone";
  }
  if (terrainBandId === "barricade_corridor_floor") {
    return hash % 3 === 0 ? "stoneRoad" : hash % 5 === 0 ? "stoneCracked" : "stone";
  }
  if (terrainBandId === "drone_yard_floor") {
    return hash % 4 === 0 ? "stoneCracked" : "stone";
  }
  if (terrainBandId === "main_plaza_cross_x" || terrainBandId === "main_plaza_cross_y") {
    return hash % 7 === 0 ? "stoneCracked" : "stone";
  }
  if (x >= 6 && y >= 5) return hash % 4 === 0 ? "terminal" : "stone";
  if (x <= -22 && y >= 12) return hash % 3 === 0 ? "breachHeavy" : "breachMedium";
  if (x >= 10 && y <= -3) return hash % 2 === 0 ? "stoneRoad" : "stoneCracked";
  if (hash % 13 === 0) return "stoneCracked";
  if (hash % 29 === 0) return "breachLight";
  return "stone";
}

function tileHash(x: number, y: number): number {
  const xi = Math.trunc(x);
  const yi = Math.trunc(y);
  return Math.abs(Math.imul(xi + 37, 73_856_093) ^ Math.imul(yi - 91, 19_349_663));
}

export function addArmisticeTileSprite(container: Container, textures: Record<ArmisticeTileKey, Texture>, x: number, y: number, key: ArmisticeTileKey): Sprite {
  const point = worldToIso(x, y);
  const sprite = new Sprite(textures[key]);
  sprite.anchor.set(0.5);
  sprite.position.set(point.screenX, point.screenY);
  container.addChild(sprite);
  return sprite;
}

export function addArmisticeAtlasPreview(container: Container, textures: Record<ArmisticeTileKey, Texture>, originX: number, originY: number, scale = 2): void {
  for (const [key, index] of Object.entries(TILE_INDEX_BY_KEY) as [ArmisticeTileKey, number][]) {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const sprite = new Sprite(textures[key]);
    sprite.anchor.set(0.5);
    sprite.scale.set(scale);
    sprite.position.set(originX + col * TILE_WIDTH * scale * 1.1, originY + row * TILE_HEIGHT * scale * 1.6);
    container.addChild(sprite);
  }
}
