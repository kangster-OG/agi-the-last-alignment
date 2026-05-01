import { Assets, Rectangle, Texture } from "pixi.js";
import { loadMilestone12Art, type Milestone12ArtTextures } from "./milestone12Art";
import type { Upgrade } from "../gameplay/upgrades";

import combatEffectsUrl from "../../assets/sprites/effects/combat_effects_v1.png";
import emergencyPatchCardFramesUrl from "../../assets/ui/emergency_patch_card_frames_v1.png";

export const MILESTONE14_ASSET_IDS = {
  combatEffects: "effect.combat.production_atlas_v1",
  emergencyPatchCards: "ui.emergency_patch.production_card_frames_v1"
} as const;

export const MILESTONE14_ASSET_URLS = {
  combatEffects: combatEffectsUrl,
  emergencyPatchCards: emergencyPatchCardFramesUrl
} as const;

export type CombatEffectFrame =
  | "projectile"
  | "impactSmall"
  | "impactMedium"
  | "impactLarge"
  | "pickupSmall"
  | "pickupMedium"
  | "pickupLarge"
  | "refusalAura"
  | "damageBadge"
  | "projectileTrail";

export type PatchCardFrame = "general" | "faction" | "class" | "evolution";

export interface Milestone14ArtTextures {
  base: Milestone12ArtTextures;
  combatEffects: Record<CombatEffectFrame, Texture>;
  patchCards: Record<PatchCardFrame, Texture>;
}

const COMBAT_FRAME_SIZE = 32;
const CARD_FRAME_SIZE = 96;
const COMBAT_FRAMES: CombatEffectFrame[] = [
  "projectile",
  "impactSmall",
  "impactMedium",
  "impactLarge",
  "pickupSmall",
  "pickupMedium",
  "pickupLarge",
  "refusalAura",
  "damageBadge",
  "projectileTrail"
];
const CARD_FRAMES: PatchCardFrame[] = ["general", "faction", "class", "evolution"];

let milestone14Promise: Promise<Milestone14ArtTextures> | null = null;
let milestone14Textures: Milestone14ArtTextures | null = null;

export function getMilestone14ArtTextures(): Milestone14ArtTextures | null {
  return milestone14Textures;
}

export function loadMilestone14Art(): Promise<Milestone14ArtTextures> {
  milestone14Promise ??= Promise.all([
    loadMilestone12Art(),
    Assets.load<Texture>(MILESTONE14_ASSET_URLS.combatEffects),
    Assets.load<Texture>(MILESTONE14_ASSET_URLS.emergencyPatchCards)
  ]).then(([base, combatAtlas, cardAtlas]) => {
    milestone14Textures = {
      base,
      combatEffects: sliceCombatAtlas(combatAtlas),
      patchCards: sliceCardAtlas(cardAtlas)
    };
    return milestone14Textures;
  });
  return milestone14Promise;
}

export function impactFrameForLife(life: number): CombatEffectFrame {
  if (life > 0.22) return "impactSmall";
  if (life > 0.11) return "impactMedium";
  return "impactLarge";
}

export function pickupFrameForLife(life: number): CombatEffectFrame {
  if (life > 0.28) return "pickupSmall";
  if (life > 0.14) return "pickupMedium";
  return "pickupLarge";
}

export function patchCardFrameForSource(source: Upgrade["source"]): PatchCardFrame {
  if (source === "evolution") return "evolution";
  if (source === "faction") return "faction";
  if (source === "class") return "class";
  return "general";
}

function sliceCombatAtlas(atlas: Texture): Record<CombatEffectFrame, Texture> {
  return Object.fromEntries(
    COMBAT_FRAMES.map((name, index) => [
      name,
      new Texture({
        source: atlas.source,
        frame: new Rectangle(index * COMBAT_FRAME_SIZE, 0, COMBAT_FRAME_SIZE, COMBAT_FRAME_SIZE)
      })
    ])
  ) as Record<CombatEffectFrame, Texture>;
}

function sliceCardAtlas(atlas: Texture): Record<PatchCardFrame, Texture> {
  return Object.fromEntries(
    CARD_FRAMES.map((name, index) => [
      name,
      new Texture({
        source: atlas.source,
        frame: new Rectangle(index * CARD_FRAME_SIZE, 0, CARD_FRAME_SIZE, CARD_FRAME_SIZE)
      })
    ])
  ) as Record<PatchCardFrame, Texture>;
}
