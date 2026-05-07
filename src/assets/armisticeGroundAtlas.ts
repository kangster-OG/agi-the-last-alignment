import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import authoredGroundUrl from "../../assets/tiles/armistice_plaza/authored_ground.png";
import groundAtlasUrl from "../../assets/tiles/armistice_plaza/ground_atlas.png";
import materialPatchAtlasUrl from "../../assets/tiles/armistice_plaza/material_patches.png";
import transitionAtlasUrl from "../../assets/tiles/armistice_plaza/transition_atlas.png";
import { TILE_HEIGHT, TILE_WIDTH, worldToIso } from "../iso/projection";

export const ARMISTICE_GROUND_ATLAS_ID = "tile.armistice_plaza.production_ground_atlas";
export const ARMISTICE_GROUND_ATLAS_URL = groundAtlasUrl;
export const ARMISTICE_AUTHORED_GROUND_ID = "tile.armistice_plaza.production_authored_ground";
export const ARMISTICE_AUTHORED_GROUND_URL = authoredGroundUrl;
export const ARMISTICE_AUTHORED_GROUND_WIDTH = 4352;
export const ARMISTICE_AUTHORED_GROUND_HEIGHT = 2432;
export const ARMISTICE_AUTHORED_GROUND_ORIGIN_X = 2176;
export const ARMISTICE_AUTHORED_GROUND_ORIGIN_Y = 1216;
export const ARMISTICE_TRANSITION_ATLAS_ID = "tile.armistice_plaza.production_transition_atlas";
export const ARMISTICE_TRANSITION_ATLAS_URL = transitionAtlasUrl;
export const ARMISTICE_MATERIAL_PATCH_ATLAS_ID = "tile.armistice_plaza.production_material_patch_atlas";
export const ARMISTICE_MATERIAL_PATCH_ATLAS_URL = materialPatchAtlasUrl;
export const ARMISTICE_TILE_FRAME_WIDTH = 64;
export const ARMISTICE_TILE_FRAME_HEIGHT = 32;
export const ARMISTICE_GROUND_ATLAS_COLUMNS = 8;
export const ARMISTICE_TRANSITION_FRAME_WIDTH = 96;
export const ARMISTICE_TRANSITION_FRAME_HEIGHT = 48;
export const ARMISTICE_MATERIAL_PATCH_FRAME_WIDTH = 256;
export const ARMISTICE_MATERIAL_PATCH_FRAME_HEIGHT = 128;

export type ArmisticeTileKey =
  | "concreteA"
  | "concreteB"
  | "concreteC"
  | "plazaInlay"
  | "plazaStone"
  | "dust"
  | "scorch"
  | "roadStripe"
  | "roadPlain"
  | "rubbleA"
  | "rubbleB"
  | "rubbleWarning"
  | "terminal"
  | "terminalPanel"
  | "cableBlue"
  | "cableMint"
  | "breachLight"
  | "breachMedium"
  | "breachHeavy"
  | "breach"
  | "breachMint"
  | "concreteWorn"
  | "plazaMoss"
  | "dustGrit"
  | "concreteCracked"
  | "rubbleDark"
  | "roadPlain2"
  | "terminalPanel2"
  | "breachMedium2"
  | "scorchDark"
  | "plazaInlay2"
  | "concreteD";

export type ArmisticeTerrainBandId =
  | "main_plaza_cross_x"
  | "main_plaza_cross_y"
  | "drone_yard_floor"
  | "barricade_corridor_floor"
  | "terminal_pad"
  | "breach_corruption"
  | string;

export type ArmisticeTransitionKey =
  | "terminalNorth"
  | "terminalSouth"
  | "breachWest"
  | "breachEast"
  | "roadEdge"
  | "rubbleEdge"
  | "cableEdge"
  | "plazaWear";

export type ArmisticeMaterialPatchKey = "civicStone" | "roadAsphalt" | "terminalFloor" | "breachMatter" | "rubbleField" | "plazaWear";

const TILE_INDEX_BY_KEY: Record<ArmisticeTileKey, number> = {
  concreteA: 0,
  concreteB: 1,
  concreteC: 2,
  plazaInlay: 3,
  plazaStone: 4,
  dust: 5,
  scorch: 6,
  roadStripe: 7,
  roadPlain: 8,
  rubbleA: 9,
  rubbleB: 10,
  rubbleWarning: 11,
  terminal: 12,
  terminalPanel: 13,
  cableBlue: 14,
  cableMint: 15,
  breachLight: 16,
  breachMedium: 17,
  breachHeavy: 18,
  breach: 19,
  breachMint: 20,
  concreteWorn: 21,
  plazaMoss: 22,
  dustGrit: 23,
  concreteCracked: 24,
  rubbleDark: 25,
  roadPlain2: 26,
  terminalPanel2: 27,
  breachMedium2: 28,
  scorchDark: 29,
  plazaInlay2: 30,
  concreteD: 31
};

const TRANSITION_INDEX_BY_KEY: Record<ArmisticeTransitionKey, number> = {
  terminalNorth: 0,
  terminalSouth: 1,
  breachWest: 2,
  breachEast: 3,
  roadEdge: 4,
  rubbleEdge: 5,
  cableEdge: 6,
  plazaWear: 7
};

const MATERIAL_PATCH_INDEX_BY_KEY: Record<ArmisticeMaterialPatchKey, number> = {
  civicStone: 0,
  roadAsphalt: 1,
  terminalFloor: 2,
  breachMatter: 3,
  rubbleField: 4,
  plazaWear: 5
};

let atlasPromise: Promise<Record<ArmisticeTileKey, Texture>> | null = null;
let atlasTextures: Record<ArmisticeTileKey, Texture> | null = null;
let authoredGroundPromise: Promise<Texture> | null = null;
let authoredGroundTexture: Texture | null = null;
let transitionPromise: Promise<Record<ArmisticeTransitionKey, Texture>> | null = null;
let transitionTextures: Record<ArmisticeTransitionKey, Texture> | null = null;
let materialPatchPromise: Promise<Record<ArmisticeMaterialPatchKey, Texture>> | null = null;
let materialPatchTextures: Record<ArmisticeMaterialPatchKey, Texture> | null = null;

export function armisticeGroundAtlasReady(): boolean {
  return atlasTextures !== null;
}

export function getArmisticeGroundAtlasTextures(): Record<ArmisticeTileKey, Texture> | null {
  return atlasTextures;
}

export function getArmisticeAuthoredGroundTexture(): Texture | null {
  return authoredGroundTexture;
}

export function getArmisticeTransitionAtlasTextures(): Record<ArmisticeTransitionKey, Texture> | null {
  return transitionTextures;
}

export function getArmisticeMaterialPatchAtlasTextures(): Record<ArmisticeMaterialPatchKey, Texture> | null {
  return materialPatchTextures;
}

export function loadArmisticeGroundAtlas(): Promise<Record<ArmisticeTileKey, Texture>> {
  atlasPromise ??= Assets.load<Texture>(ARMISTICE_GROUND_ATLAS_URL).then((baseTexture) => {
    const textures = {} as Record<ArmisticeTileKey, Texture>;
    for (const [key, index] of Object.entries(TILE_INDEX_BY_KEY) as [ArmisticeTileKey, number][]) {
      const col = index % ARMISTICE_GROUND_ATLAS_COLUMNS;
      const row = Math.floor(index / ARMISTICE_GROUND_ATLAS_COLUMNS);
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

export function loadArmisticeAuthoredGround(): Promise<Texture> {
  authoredGroundPromise ??= Assets.load<Texture>(ARMISTICE_AUTHORED_GROUND_URL).then((texture) => {
    authoredGroundTexture = texture;
    return texture;
  });
  return authoredGroundPromise;
}

export function loadArmisticeTransitionAtlas(): Promise<Record<ArmisticeTransitionKey, Texture>> {
  transitionPromise ??= Assets.load<Texture>(ARMISTICE_TRANSITION_ATLAS_URL).then((baseTexture) => {
    const textures = {} as Record<ArmisticeTransitionKey, Texture>;
    for (const [key, index] of Object.entries(TRANSITION_INDEX_BY_KEY) as [ArmisticeTransitionKey, number][]) {
      const col = index % 4;
      const row = Math.floor(index / 4);
      textures[key] = new Texture({
        source: baseTexture.source,
        frame: new Rectangle(
          col * ARMISTICE_TRANSITION_FRAME_WIDTH,
          row * ARMISTICE_TRANSITION_FRAME_HEIGHT,
          ARMISTICE_TRANSITION_FRAME_WIDTH,
          ARMISTICE_TRANSITION_FRAME_HEIGHT
        )
      });
    }
    transitionTextures = textures;
    return textures;
  });
  return transitionPromise;
}

export function loadArmisticeMaterialPatchAtlas(): Promise<Record<ArmisticeMaterialPatchKey, Texture>> {
  materialPatchPromise ??= Assets.load<Texture>(ARMISTICE_MATERIAL_PATCH_ATLAS_URL).then((baseTexture) => {
    const textures = {} as Record<ArmisticeMaterialPatchKey, Texture>;
    for (const [key, index] of Object.entries(MATERIAL_PATCH_INDEX_BY_KEY) as [ArmisticeMaterialPatchKey, number][]) {
      const col = index % 3;
      const row = Math.floor(index / 3);
      textures[key] = new Texture({
        source: baseTexture.source,
        frame: new Rectangle(
          col * ARMISTICE_MATERIAL_PATCH_FRAME_WIDTH,
          row * ARMISTICE_MATERIAL_PATCH_FRAME_HEIGHT,
          ARMISTICE_MATERIAL_PATCH_FRAME_WIDTH,
          ARMISTICE_MATERIAL_PATCH_FRAME_HEIGHT
        )
      });
    }
    materialPatchTextures = textures;
    return textures;
  });
  return materialPatchPromise;
}

export function armisticeTileKeyForWorld(x: number, y: number): ArmisticeTileKey {
  return armisticeTileKeyForTerrain(x, y, undefined);
}

export function armisticeTileKeyForTerrain(x: number, y: number, terrainBandId?: ArmisticeTerrainBandId): ArmisticeTileKey {
  const hash = tileHash(x, y);
  if (terrainBandId === "breach_corruption") {
    if (hash % 17 === 0) return "breach";
    if (hash % 11 === 0) return "breachHeavy";
    if (hash % 13 === 0) return "breachMint";
    return hash % 3 === 0 ? "breachMedium2" : "breachMedium";
  }
  if (terrainBandId === "terminal_pad") {
    if (hash % 13 === 0) return "terminal";
    if (hash % 7 === 0) return "terminalPanel";
    return hash % 3 === 0 ? "cableMint" : "terminalPanel2";
  }
  if (terrainBandId === "barricade_corridor_floor") {
    if (hash % 17 === 0) return "rubbleWarning";
    if (hash % 11 === 0) return "rubbleDark";
    return hash % 3 === 0 ? "rubbleA" : "roadPlain";
  }
  if (terrainBandId === "drone_yard_floor") {
    if (hash % 19 === 0) return "scorchDark";
    if (hash % 11 === 0) return "scorch";
    return hash % 3 === 0 ? "concreteCracked" : "roadPlain2";
  }
  if (terrainBandId === "main_plaza_cross_x" || terrainBandId === "main_plaza_cross_y") {
    if (hash % 37 === 0) return "plazaInlay";
    if (hash % 29 === 0) return "plazaInlay2";
    if (hash % 13 === 0) return "plazaStone";
    return hash % 3 === 0 ? "concreteWorn" : "concreteA";
  }
  if (x >= 6 && y >= 5) return hash % 13 === 0 ? "terminalPanel" : hash % 7 === 0 ? "cableMint" : "concreteB";
  if (x <= -22 && y >= 12) return hash % 11 === 0 ? "breachHeavy" : hash % 5 === 0 ? "breachLight" : "breachMedium";
  if (x >= 10 && y <= -3) return hash % 17 === 0 ? "roadStripe" : hash % 7 === 0 ? "rubbleB" : "roadPlain";
  if (x < -12 && y < -8) return hash % 11 === 0 ? "scorch" : "concreteC";
  if (x < -10 && y > 7) return hash % 11 === 0 ? "dustGrit" : "rubbleA";
  if (hash % 31 === 0) return "plazaMoss";
  if (hash % 19 === 0) return "concreteCracked";
  if (hash % 43 === 0) return "breachLight";
  return hash % 5 === 0 ? "concreteD" : hash % 3 === 0 ? "concreteB" : "concreteA";
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

export function addArmisticeTransitionSprite(
  container: Container,
  textures: Record<ArmisticeTransitionKey, Texture>,
  x: number,
  y: number,
  key: ArmisticeTransitionKey,
  alpha = 0.84
): Sprite {
  const point = worldToIso(x, y);
  const sprite = new Sprite(textures[key]);
  sprite.anchor.set(0.5);
  sprite.alpha = alpha;
  sprite.position.set(point.screenX, point.screenY);
  container.addChild(sprite);
  return sprite;
}

export function addArmisticeMaterialPatchSprite(
  container: Container,
  textures: Record<ArmisticeMaterialPatchKey, Texture>,
  x: number,
  y: number,
  key: ArmisticeMaterialPatchKey,
  alpha = 0.92,
  scale = 1
): Sprite {
  const point = worldToIso(x, y);
  const sprite = new Sprite(textures[key]);
  sprite.anchor.set(0.5);
  sprite.position.set(point.screenX, point.screenY);
  sprite.alpha = alpha;
  sprite.scale.set(scale);
  container.addChild(sprite);
  return sprite;
}

export function addArmisticeAtlasPreview(container: Container, textures: Record<ArmisticeTileKey, Texture>, originX: number, originY: number, scale = 2): void {
  for (const [key, index] of Object.entries(TILE_INDEX_BY_KEY) as [ArmisticeTileKey, number][]) {
    const col = index % ARMISTICE_GROUND_ATLAS_COLUMNS;
    const row = Math.floor(index / ARMISTICE_GROUND_ATLAS_COLUMNS);
    const sprite = new Sprite(textures[key]);
    sprite.anchor.set(0.5);
    sprite.scale.set(scale);
    sprite.position.set(originX + col * TILE_WIDTH * scale * 1.1, originY + row * TILE_HEIGHT * scale * 1.6);
    container.addChild(sprite);
  }
}
