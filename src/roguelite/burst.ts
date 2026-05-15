import type { BuildStats } from "../gameplay/upgrades";

export type ConsensusBurstPathId = "deny_premise" | "mass_recompile" | "fork_bomb_halo";

export interface ConsensusBurstPath {
  id: ConsensusBurstPathId;
  name: string;
  body: string;
  color: number;
}

export interface ConsensusBurstRuntime {
  pathId: ConsensusBurstPathId;
  charge: number;
  maxCharge: number;
  activations: number;
  lastActivatedAt: number;
  lastActivationLabel: string;
}

export const CONSENSUS_BURST_PATHS: ConsensusBurstPath[] = [
  {
    id: "deny_premise",
    name: "Deny Premise",
    body: "A refusal wave damages nearby enemies and strips boss pressure. The power of saying absolutely not.",
    color: 0xff5d57
  },
  {
    id: "mass_recompile",
    name: "Mass Recompile",
    body: "A stabilizing pulse heals the cell and converts pressure into space. Emergency therapy, but concussive.",
    color: 0x64e0b4
  },
  {
    id: "fork_bomb_halo",
    name: "Fork Bomb Halo",
    body: "Duplicate shards spiral from every standing player. Consensus has chosen quantity and plausible chaos.",
    color: 0xc96cff
  }
];

export const DEFAULT_CONSENSUS_BURST_PATH: ConsensusBurstPathId = "deny_premise";

export function consensusBurstPath(id: string): ConsensusBurstPath {
  return CONSENSUS_BURST_PATHS.find((path) => path.id === id) ?? CONSENSUS_BURST_PATHS[0];
}

export function createConsensusBurst(pathId: string): ConsensusBurstRuntime {
  return {
    pathId: consensusBurstPath(pathId).id,
    charge: 22,
    maxCharge: 100,
    activations: 0,
    lastActivatedAt: -999,
    lastActivationLabel: ""
  };
}

export function burstSummary(runtime: ConsensusBurstRuntime, build: BuildStats) {
  const path = consensusBurstPath(runtime.pathId);
  return {
    pathId: path.id,
    pathName: path.name,
    body: path.body,
    charge: Math.round(runtime.charge),
    maxCharge: runtime.maxCharge,
    ready: runtime.charge >= runtime.maxCharge,
    activations: runtime.activations,
    lastActivationLabel: runtime.lastActivationLabel,
    lastActivatedAt: runtime.lastActivatedAt,
    upgrades: {
      radiusBonus: build.consensusBurstRadius,
      damageBonus: build.consensusBurstDamage,
      chargeRateBonus: build.consensusBurstChargeRate,
      revivePulse: build.consensusBurstRevive
    }
  };
}
