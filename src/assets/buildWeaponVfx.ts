import { Assets, Rectangle, Texture } from "pixi.js";
import type { Upgrade } from "../gameplay/upgrades";

import buildWeaponVfxUrl from "../../assets/sprites/effects/build_weapon_vfx_v1.png";

export const BUILD_WEAPON_VFX_ASSET_ID = "effect.build_weapons.production_vfx_v1";

export type BuildWeaponVfxFrame =
  | "vectorProjectile"
  | "vectorTrail"
  | "vectorChargedTrail"
  | "vectorImpact"
  | "signalProjectile"
  | "signalRing"
  | "signalBurst"
  | "signalImpact"
  | "contextSaw"
  | "contextSawSpin"
  | "contextSawLarge"
  | "contextSawShardField"
  | "patchMortarShell"
  | "patchMortarTrail"
  | "patchMortarArc"
  | "patchMortarImpact"
  | "causalRailgunProjectile"
  | "causalRailgunBeam"
  | "causalRailgunChargedBeam"
  | "causalRailgunImpact"
  | "coherenceIndexerIcon"
  | "anchorBodyguardIcon"
  | "predictionPriorityIcon"
  | "causalRailgunIcon";

export interface BuildWeaponVfxTextures {
  frames: Record<BuildWeaponVfxFrame, Texture>;
}

const FRAME_W = 192;
const FRAME_H = 128;
const FRAMES: BuildWeaponVfxFrame[] = [
  "vectorProjectile",
  "vectorTrail",
  "vectorChargedTrail",
  "vectorImpact",
  "signalProjectile",
  "signalRing",
  "signalBurst",
  "signalImpact",
  "contextSaw",
  "contextSawSpin",
  "contextSawLarge",
  "contextSawShardField",
  "patchMortarShell",
  "patchMortarTrail",
  "patchMortarArc",
  "patchMortarImpact",
  "causalRailgunProjectile",
  "causalRailgunBeam",
  "causalRailgunChargedBeam",
  "causalRailgunImpact",
  "coherenceIndexerIcon",
  "anchorBodyguardIcon",
  "predictionPriorityIcon",
  "causalRailgunIcon"
];

let promise: Promise<BuildWeaponVfxTextures> | null = null;
let textures: BuildWeaponVfxTextures | null = null;

export function getBuildWeaponVfxTextures(): BuildWeaponVfxTextures | null {
  return textures;
}

export function loadBuildWeaponVfxTextures(): Promise<BuildWeaponVfxTextures> {
  promise ??= Assets.load<Texture>(buildWeaponVfxUrl).then((atlas) => {
    textures = {
      frames: Object.fromEntries(
        FRAMES.map((name, index) => [
          name,
          new Texture({
            source: atlas.source,
            frame: new Rectangle(index * FRAME_W, 0, FRAME_W, FRAME_H)
          })
        ])
      ) as Record<BuildWeaponVfxFrame, Texture>
    };
    return textures;
  });
  return promise;
}

export function buildWeaponIconFrameForUpgrade(upgrade: Upgrade): BuildWeaponVfxFrame | null {
  if (upgrade.id === "coherence_indexer") return "coherenceIndexerIcon";
  if (upgrade.id === "anchor_bodyguard") return "anchorBodyguardIcon";
  if (upgrade.id === "prediction_priority") return "predictionPriorityIcon";
  if (upgrade.id === "causal_railgun") return "causalRailgunIcon";
  if (upgrade.id === "vector_lance") return "vectorProjectile";
  if (upgrade.id === "signal_pulse") return "signalBurst";
  if (upgrade.id === "context_saw") return "contextSaw";
  if (upgrade.id === "patch_mortar") return "patchMortarImpact";
  return null;
}
