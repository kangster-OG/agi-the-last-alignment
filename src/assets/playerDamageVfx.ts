import { Assets, Rectangle, Texture } from "pixi.js";

import playerDamageVfxUrl from "../../assets/sprites/effects/player_damage_vfx_v1.png";

export const PLAYER_DAMAGE_VFX_ASSET_ID = "effect.player_damage.production_sheet_v1";
export const PLAYER_DAMAGE_VFX_ASSET_URL = playerDamageVfxUrl;

export type PlayerDamageVfxFrame = "contactHit" | "bossChargeHit" | "corruptionBurn" | "hpAlert" | "invulnShell" | "downedBurst";

export interface PlayerDamageVfxTextures {
  frames: Record<PlayerDamageVfxFrame, Texture>;
}

const FRAME_SIZE = 128;
const FRAME_ORDER: PlayerDamageVfxFrame[] = ["contactHit", "bossChargeHit", "corruptionBurn", "hpAlert", "invulnShell", "downedBurst"];

let playerDamageVfxPromise: Promise<PlayerDamageVfxTextures> | null = null;
let playerDamageVfxTextures: PlayerDamageVfxTextures | null = null;

export function getPlayerDamageVfxTextures(): PlayerDamageVfxTextures | null {
  return playerDamageVfxTextures;
}

export function loadPlayerDamageVfxTextures(): Promise<PlayerDamageVfxTextures> {
  playerDamageVfxPromise ??= Assets.load<Texture>(PLAYER_DAMAGE_VFX_ASSET_URL).then((sheet) => {
    const frames = {} as Record<PlayerDamageVfxFrame, Texture>;
    FRAME_ORDER.forEach((key, index) => {
      frames[key] = new Texture({
        source: sheet.source,
        frame: new Rectangle(index * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE)
      });
    });
    playerDamageVfxTextures = { frames };
    return playerDamageVfxTextures;
  });
  return playerDamageVfxPromise;
}
