import { Assets, Rectangle, Texture } from "pixi.js";
import type { Upgrade } from "../gameplay/upgrades";

import buildWeaponVfxUrl from "../../assets/sprites/effects/build_weapon_vfx_v1.png";

export const BUILD_WEAPON_VFX_ASSET_ID = "effect.build_weapons.production_vfx_v1";

export type BuildWeaponVfxFrame =
  | "refusalCharge"
  | "refusalLaunch"
  | "refusalTravel"
  | "refusalEcho"
  | "refusalImpact"
  | "refusalResidue"
  | "vectorCharge"
  | "vectorProjectile"
  | "vectorBeam"
  | "vectorTrail"
  | "vectorChargedTrail"
  | "vectorImpact"
  | "vectorResidue"
  | "signalStartup"
  | "signalProjectile"
  | "signalCross"
  | "signalRing"
  | "signalBurst"
  | "signalImpact"
  | "signalResidue"
  | "causalRailgunCharge"
  | "causalRailgunMuzzle"
  | "causalRailgunTravel"
  | "contextSaw"
  | "contextSawStartup"
  | "contextSawSpin"
  | "contextSawLarge"
  | "contextSawBlur"
  | "contextSawSweep"
  | "contextSawShardField"
  | "patchMortarLaunch"
  | "patchMortarShell"
  | "patchMortarTrail"
  | "patchMortarArc"
  | "patchMortarDescent"
  | "patchMortarShadow"
  | "patchMortarImpact"
  | "causalRailgunProjectile"
  | "causalRailgunBeam"
  | "causalRailgunChargedBeam"
  | "causalRailgunImpact"
  | "causalRailgunResidue"
  | "refusalHaloStartup"
  | "refusalHaloRing"
  | "refusalHaloShield"
  | "refusalHaloFlare"
  | "riftMineStartup"
  | "riftMineArmed"
  | "riftMineRipple"
  | "riftMineTrigger"
  | "riftMineBurst"
  | "riftMineResidue"
  | "objectiveAnchorSpark"
  | "objectiveTurretShot"
  | "objectiveMortarMarker"
  | "objectiveRepairPulse"
  | "coherenceIndexerIcon"
  | "anchorBodyguardIcon"
  | "predictionPriorityIcon"
  | "causalRailgunIcon";

export interface BuildWeaponVfxTextures {
  frames: Record<BuildWeaponVfxFrame, Texture>;
}

const FRAME_W = 256;
const FRAME_H = 192;
const FRAMES_PER_ROW = 10;
const FRAMES: BuildWeaponVfxFrame[] = [
  "refusalCharge",
  "refusalLaunch",
  "refusalTravel",
  "refusalEcho",
  "refusalImpact",
  "refusalResidue",
  "vectorCharge",
  "vectorProjectile",
  "vectorBeam",
  "vectorTrail",
  "vectorImpact",
  "vectorResidue",
  "signalStartup",
  "signalRing",
  "signalCross",
  "signalBurst",
  "signalImpact",
  "signalResidue",
  "causalRailgunCharge",
  "causalRailgunMuzzle",
  "causalRailgunBeam",
  "causalRailgunTravel",
  "causalRailgunImpact",
  "causalRailgunResidue",
  "refusalHaloStartup",
  "refusalHaloRing",
  "refusalHaloShield",
  "refusalHaloFlare",
  "predictionPriorityIcon",
  "causalRailgunIcon",
  "contextSawStartup",
  "contextSaw",
  "contextSawSpin",
  "contextSawBlur",
  "contextSawSweep",
  "contextSawShardField",
  "patchMortarLaunch",
  "patchMortarShell",
  "patchMortarArc",
  "patchMortarDescent",
  "patchMortarShadow",
  "patchMortarImpact",
  "riftMineStartup",
  "riftMineArmed",
  "riftMineRipple",
  "riftMineTrigger",
  "riftMineBurst",
  "riftMineResidue",
  "objectiveAnchorSpark",
  "objectiveTurretShot",
  "objectiveMortarMarker",
  "objectiveRepairPulse",
  "coherenceIndexerIcon",
  "anchorBodyguardIcon",
  "vectorChargedTrail",
  "signalProjectile",
  "contextSawLarge",
  "patchMortarTrail",
  "causalRailgunProjectile",
  "causalRailgunChargedBeam",
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
            frame: new Rectangle((index % FRAMES_PER_ROW) * FRAME_W, Math.floor(index / FRAMES_PER_ROW) * FRAME_H, FRAME_W, FRAME_H)
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
  if (upgrade.id === "signal_choir") return "signalBurst";
  if (upgrade.id === "time_deferred_minefield") return "riftMineArmed";
  if (upgrade.id === "field_triage" || upgrade.id === "emergency_patch_cache" || upgrade.id === "second_opinion" || upgrade.id === "redline_loan") return "objectiveRepairPulse";
  if (upgrade.id === "burst_cell_refill" || upgrade.id === "lock_a_protocol") return "coherenceIndexerIcon";
  if (upgrade.id === "vector_lance") return "vectorBeam";
  if (upgrade.id === "signal_pulse") return "signalCross";
  if (upgrade.id === "context_saw") return "contextSawSweep";
  if (upgrade.id === "patch_mortar") return "patchMortarImpact";
  return null;
}
