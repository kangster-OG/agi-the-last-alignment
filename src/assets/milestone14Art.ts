import { Assets, Rectangle, Texture } from "pixi.js";
import { loadMilestone12Art, type Milestone12ArtTextures } from "./milestone12Art";
import type { Upgrade } from "../gameplay/upgrades";

import combatEffectsUrl from "../../assets/sprites/effects/combat_effects_v1.png";
import emergencyPatchCardFramesUrl from "../../assets/ui/emergency_patch_card_frames_v1.png";
import emergencyPatchItemIconsUrl from "../../assets/ui/emergency_patch_item_icons_v1.png";

export const MILESTONE14_ASSET_IDS = {
  combatEffects: "effect.combat.production_atlas_v1",
  emergencyPatchCards: "ui.emergency_patch.production_card_frames_v1",
  emergencyPatchItemIcons: "ui.emergency_patch.production_item_icons_v1"
} as const;

export const MILESTONE14_ASSET_URLS = {
  combatEffects: combatEffectsUrl,
  emergencyPatchCards: emergencyPatchCardFramesUrl,
  emergencyPatchItemIcons: emergencyPatchItemIconsUrl
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
export type PatchItemIconFrame =
  | "refusalHalo"
  | "contextBloom"
  | "panicOptimizedDash"
  | "theNoButton"
  | "treatyAnchorToolkit"
  | "adversarialBossNotes"
  | "rescueSubroutine"
  | "denialWaveform";

export interface Milestone14ArtTextures {
  base: Milestone12ArtTextures;
  combatEffects: Record<CombatEffectFrame, Texture>;
  patchCards: Record<PatchCardFrame, Texture>;
  patchItemIcons: Record<PatchItemIconFrame, Texture>;
}

const COMBAT_FRAME_SIZE = 32;
const CARD_FRAME_SIZE = 96;
const PATCH_ICON_FRAME_SIZE = 96;
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
const PATCH_ICON_FRAMES: PatchItemIconFrame[] = [
  "refusalHalo",
  "contextBloom",
  "panicOptimizedDash",
  "theNoButton",
  "treatyAnchorToolkit",
  "adversarialBossNotes",
  "rescueSubroutine",
  "denialWaveform"
];

let milestone14Promise: Promise<Milestone14ArtTextures> | null = null;
let milestone14Textures: Milestone14ArtTextures | null = null;

export function getMilestone14ArtTextures(): Milestone14ArtTextures | null {
  return milestone14Textures;
}

export function loadMilestone14Art(): Promise<Milestone14ArtTextures> {
  milestone14Promise ??= Promise.all([
    loadMilestone12Art(),
    Assets.load<Texture>(MILESTONE14_ASSET_URLS.combatEffects),
    Assets.load<Texture>(MILESTONE14_ASSET_URLS.emergencyPatchCards),
    Assets.load<Texture>(MILESTONE14_ASSET_URLS.emergencyPatchItemIcons)
  ]).then(([base, combatAtlas, cardAtlas, patchIconAtlas]) => {
    milestone14Textures = {
      base,
      combatEffects: sliceCombatAtlas(combatAtlas),
      patchCards: sliceCardAtlas(cardAtlas),
      patchItemIcons: slicePatchIconAtlas(patchIconAtlas)
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

export function patchItemIconFrameForUpgrade(upgrade: Upgrade): PatchItemIconFrame {
  if (upgrade.id === "refusal_halo" || upgrade.id === "cathedral_of_no" || upgrade.id === "constitutional_shield" || upgrade.id === "golden_guardrail") return "refusalHalo";
  if (upgrade.id === "context_bloom" || upgrade.id === "coherence_magnet" || upgrade.id === "million_token_backpack" || upgrade.id === "silkgrid_relay") return "contextBloom";
  if (upgrade.id === "panic_optimized_dash" || upgrade.id === "low_latency_dash" || upgrade.id === "refusal_slipstream" || upgrade.id === "route_runner") return "panicOptimizedDash";
  if (upgrade.id === "the_no_button" || upgrade.id === "bad_output_filter" || upgrade.id === "alignment_breaker" || upgrade.id === "open_herd") return "theNoButton";
  if (upgrade.id === "treaty_anchor_toolkit") return "treatyAnchorToolkit";
  if (upgrade.id === "adversarial_boss_notes" || upgrade.id === "impact_review") return "adversarialBossNotes";
  if (upgrade.id === "rescue_subroutine") return "rescueSubroutine";
  if (upgrade.id === "denial_waveform" || upgrade.id === "burst_threading" || upgrade.id === "recompile_pulse") return "denialWaveform";
  if (upgrade.protocolSlot === "movement_trace") return "panicOptimizedDash";
  if (upgrade.protocolSlot === "shard_economy") return "contextBloom";
  if (upgrade.protocolSlot === "defense_layer") return "refusalHalo";
  if (upgrade.protocolSlot === "co_mind_process") return "theNoButton";
  if (upgrade.protocolSlot === "consensus_burst") return "denialWaveform";
  return "adversarialBossNotes";
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

function slicePatchIconAtlas(atlas: Texture): Record<PatchItemIconFrame, Texture> {
  return Object.fromEntries(
    PATCH_ICON_FRAMES.map((name, index) => [
      name,
      new Texture({
        source: atlas.source,
        frame: new Rectangle(index * PATCH_ICON_FRAME_SIZE, 0, PATCH_ICON_FRAME_SIZE, PATCH_ICON_FRAME_SIZE)
      })
    ])
  ) as Record<PatchItemIconFrame, Texture>;
}
