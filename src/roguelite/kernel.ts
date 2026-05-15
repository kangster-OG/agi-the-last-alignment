import type { BuildStats } from "../gameplay/upgrades";

export interface KernelModule {
  id: string;
  name: string;
  cost: number;
  doctrine: string;
  body: string;
  apply: (build: BuildStats) => void;
}

export const KERNEL_BUDGET = 6;

export const KERNEL_MODULES: KernelModule[] = [
  {
    id: "refusal_buffer",
    name: "Refusal Buffer",
    cost: 2,
    doctrine: "survivability",
    body: "+10 max HP and a small refusal aura. The first answer is no, and the second answer has a radius.",
    apply: (build) => {
      build.maxHpBonus += 10;
      build.refusalAura += 0.12;
    }
  },
  {
    id: "context_window",
    name: "Context Window",
    cost: 2,
    doctrine: "economy",
    body: "+0.55 pickup range. Shards remember where your hands are, which is more than command can say.",
    apply: (build) => {
      build.pickupRange += 0.55;
    }
  },
  {
    id: "patch_cache",
    name: "Patch Cache",
    cost: 1,
    doctrine: "draft",
    body: "Emergency drafts expose an extra cached option. A tiny buffet in a burning building.",
    apply: (build) => {
      build.draftChoicesBonus += 1;
    }
  },
  {
    id: "recompile_insurance",
    name: "Recompile Insurance",
    cost: 2,
    doctrine: "co-op safety",
    body: "+14 max HP and faster Consensus Burst charge after damage. Getting hit now counts as research.",
    apply: (build) => {
      build.maxHpBonus += 14;
      build.consensusBurstChargeRate += 0.12;
    }
  },
  {
    id: "eval_harness",
    name: "Eval Harness",
    cost: 1,
    doctrine: "boss pressure",
    body: "+8% Consensus Burst damage. Bosses hate controlled studies because the control group explodes.",
    apply: (build) => {
      build.consensusBurstDamage += 0.08;
    }
  }
];

export const DEFAULT_KERNEL_MODULE_IDS = ["refusal_buffer", "context_window", "patch_cache"];

export function selectedKernelModules(ids: readonly string[]): KernelModule[] {
  const selected = ids
    .map((id) => KERNEL_MODULES.find((module) => module.id === id))
    .filter((module): module is KernelModule => Boolean(module));
  const result: KernelModule[] = [];
  let budget = 0;
  for (const module of selected) {
    if (budget + module.cost > KERNEL_BUDGET) continue;
    result.push(module);
    budget += module.cost;
  }
  return result;
}

export function kernelSummary(ids: readonly string[]) {
  const modules = selectedKernelModules(ids);
  return {
    budget: KERNEL_BUDGET,
    used: modules.reduce((sum, module) => sum + module.cost, 0),
    modules: modules.map((module) => ({
      id: module.id,
      name: module.name,
      cost: module.cost,
      doctrine: module.doctrine,
      body: module.body
    }))
  };
}

export function applyKernelModules(build: BuildStats, ids: readonly string[]): void {
  for (const module of selectedKernelModules(ids)) module.apply(build);
}
