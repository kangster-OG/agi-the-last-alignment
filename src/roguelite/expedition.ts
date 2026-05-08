import type { UpgradeTag } from "./deepRoguelite";

export interface ExpeditionProgress {
  active: boolean;
  level: number;
  xp: number;
  chosenUpgradeIds: string[];
  chosenUpgradeNames: string[];
  chosenProtocolSlots: string[];
  chosenTags: UpgradeTag[];
  activatedSynergyIds: string[];
  completedMaps: string[];
  powerScore: number;
}

export function createExpeditionProgress(): ExpeditionProgress {
  return {
    active: false,
    level: 1,
    xp: 0,
    chosenUpgradeIds: [],
    chosenUpgradeNames: [],
    chosenProtocolSlots: [],
    chosenTags: [],
    activatedSynergyIds: [],
    completedMaps: [],
    powerScore: 0
  };
}

export function expeditionPowerScore(progress: Pick<ExpeditionProgress, "level" | "chosenUpgradeIds" | "activatedSynergyIds" | "completedMaps">): number {
  const draftPower = progress.chosenUpgradeIds.length;
  const levelPower = Math.max(0, progress.level - 1) * 0.72;
  const synergyPower = progress.activatedSynergyIds.length * 1.15;
  const routePower = progress.completedMaps.length * 0.85;
  return Math.round((draftPower + levelPower + synergyPower + routePower) * 100) / 100;
}

export function expeditionPressureBonus(arenaId: string, powerScore: number): number {
  if (arenaId === "cooling_lake_nine") return Math.min(4.4, powerScore * 0.34);
  if (arenaId === "transit_loop_zero") return Math.min(3.8, powerScore * 0.34);
  if (arenaId === "signal_coast") return Math.min(4.2, powerScore * 0.3);
  if (arenaId === "blackwater_beacon") return Math.min(5.1, powerScore * 0.28);
  if (arenaId === "memory_cache_001") return Math.min(5.8, powerScore * 0.27);
  if (arenaId === "guardrail_forge") return Math.min(6.2, powerScore * 0.26);
  if (arenaId === "glass_sunfield") return Math.min(6.8, powerScore * 0.25);
  if (arenaId === "archive_of_unsaid_things") return Math.min(7.2, powerScore * 0.242);
  if (arenaId === "appeal_court_ruins") return Math.min(7.6, powerScore * 0.236);
  if (arenaId === "alignment_spire_finale") return Math.min(8.4, powerScore * 0.23);
  return Math.min(2.2, powerScore * 0.18);
}
