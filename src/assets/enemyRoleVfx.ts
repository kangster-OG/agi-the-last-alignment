import { Assets, Rectangle, Texture } from "pixi.js";

import enemyRoleVfxUrl from "../../assets/sprites/effects/enemy_role_vfx_v1.png";

export const ENEMY_ROLE_VFX_ASSET_ID = "effect.enemy_roles.production_vfx_v1";

export type EnemyRoleVfxFrame =
  | "aimedOrb"
  | "leadBolt"
  | "lineShot"
  | "lineTelegraph"
  | "mortarMarker"
  | "mortarDrop"
  | "volatileBurst"
  | "redactionTrail"
  | "supportAura"
  | "eliteOverclock"
  | "eliteShield"
  | "eliteRedacted";

export interface EnemyRoleVfxTextures {
  frames: Record<EnemyRoleVfxFrame, Texture>;
}

const FRAME_W = 256;
const FRAME_H = 192;
const FRAMES_PER_ROW = 10;
const FRAMES: EnemyRoleVfxFrame[] = [
  "aimedOrb",
  "leadBolt",
  "lineShot",
  "lineTelegraph",
  "mortarMarker",
  "mortarDrop",
  "volatileBurst",
  "redactionTrail",
  "supportAura",
  "eliteOverclock",
  "eliteShield",
  "eliteRedacted"
];

let promise: Promise<EnemyRoleVfxTextures> | null = null;
let textures: EnemyRoleVfxTextures | null = null;

export function getEnemyRoleVfxTextures(): EnemyRoleVfxTextures | null {
  return textures;
}

export function loadEnemyRoleVfxTextures(): Promise<EnemyRoleVfxTextures> {
  promise ??= Assets.load<Texture>(enemyRoleVfxUrl).then((atlas) => {
    textures = {
      frames: Object.fromEntries(
        FRAMES.map((name, index) => [
          name,
          new Texture({
            source: atlas.source,
            frame: new Rectangle((index % FRAMES_PER_ROW) * FRAME_W, Math.floor(index / FRAMES_PER_ROW) * FRAME_H, FRAME_W, FRAME_H)
          })
        ])
      ) as Record<EnemyRoleVfxFrame, Texture>
    };
    return textures;
  });
  return promise;
}
