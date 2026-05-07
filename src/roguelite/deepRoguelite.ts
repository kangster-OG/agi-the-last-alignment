import type { BuildStats, Upgrade } from "../gameplay/upgrades";

export type UpgradeTag = "refusal" | "economy" | "burst" | "drone" | "boss" | "coop" | "weapon" | "movement" | "defense";

export interface RouteContract {
  id: string;
  name: string;
  body: string;
  nodeType: "stabilization" | "resource_cache" | "faction_relay" | "corrupted_shortcut";
  rewardBiasTags: UpgradeTag[];
  pressure: number;
  reward: string;
  danger: string;
  secretHint: string;
}

export interface TreatyAnchorObjective {
  id: string;
  name: string;
  worldX: number;
  worldY: number;
  radius: number;
  progress: number;
  completed: boolean;
  attacked: number;
}

export interface ObjectiveRuntime {
  id: string;
  name: string;
  body: string;
  optional: boolean;
  anchors: TreatyAnchorObjective[];
  attackersSpawned: number;
  completedAt: number;
}

export interface SynergyThreshold {
  id: string;
  name: string;
  tag: UpgradeTag;
  required: number;
  body: string;
  apply: (build: BuildStats) => void;
}

export interface SecretUnlock {
  id: string;
  name: string;
  body: string;
}

export interface MasteryBadge {
  id: string;
  name: string;
  body: string;
}

export interface RunOutcomeForRoguelite {
  completed: boolean;
  nodeId: string;
  kills: number;
  seconds: number;
  bossDefeated: boolean;
  evalProtocolIds: readonly string[];
  chosenUpgradeIds: readonly string[];
  chosenTags: readonly UpgradeTag[];
  activatedSynergyIds: readonly string[];
  consensusBurstPathId: string;
  burstActivations: number;
  objective: ObjectiveRuntime;
  routeContractId: string;
}

export const ROUTE_CONTRACTS: RouteContract[] = [
  {
    id: "stabilize_armistice",
    name: "Stabilization Road",
    body: "Baseline route. Repair the node, keep the roads real, leave fewer teeth in causality.",
    nodeType: "stabilization",
    rewardBiasTags: ["defense", "weapon"],
    pressure: 0,
    reward: "Stable road progress and a modest defensive draft bias.",
    danger: "Baseline AGI pressure.",
    secretHint: "Clean clears teach the camp what normal should look like."
  },
  {
    id: "resource_cache_detour",
    name: "Resource Cache Detour",
    body: "A broken cache is leaking Coherence. More economy drafts, slightly hotter enemy routing.",
    nodeType: "resource_cache",
    rewardBiasTags: ["economy", "burst"],
    pressure: 1,
    reward: "Economy/Burst draft bias and extra Proof Token chance from anchor completion.",
    danger: "More objective attackers sniff out the cache.",
    secretHint: "Compute Starvation likes this route more than it should."
  },
  {
    id: "faction_relay_argument",
    name: "Faction Relay Argument",
    body: "A lab relay wants proof that its doctrine works. More co-mind drafts and objective pressure.",
    nodeType: "faction_relay",
    rewardBiasTags: ["coop", "boss"],
    pressure: 1,
    reward: "Co-mind/Boss draft bias and stronger Eval token payout.",
    danger: "Faction relays attract Speculative Executors.",
    secretHint: "Boss variants become easier to document here."
  },
  {
    id: "unverified_shortcut",
    name: "Unverified Shortcut",
    body: "Shorter road, worse assumptions. Boss pressure rises, but secret unlocks become possible.",
    nodeType: "corrupted_shortcut",
    rewardBiasTags: ["boss", "movement"],
    pressure: 2,
    reward: "Boss/Movement draft bias and higher secret discovery pressure.",
    danger: "Boss pressure rises and the road is openly lying.",
    secretHint: "Hidden Treaty Road and strange no-refusal clears can surface."
  }
];

export const SYNERGY_THRESHOLDS: SynergyThreshold[] = [
  {
    id: "doctrine_lock_no_means_no",
    name: "Doctrine Lock: NO MEANS NO",
    tag: "refusal",
    required: 3,
    body: "Refusal aura hardens when the build commits to denial.",
    apply: (build) => {
      build.refusalAura += 0.45;
      build.maxHpBonus += 8;
    }
  },
  {
    id: "burst_second_opinion",
    name: "Burst Doctrine: Second Opinion",
    tag: "burst",
    required: 3,
    body: "Consensus Burst charges faster and lands wider.",
    apply: (build) => {
      build.consensusBurstChargeRate += 0.18;
      build.consensusBurstRadius += 0.28;
    }
  },
  {
    id: "shard_flywheel",
    name: "Shard Flywheel",
    tag: "economy",
    required: 3,
    body: "Coherence economy begins pulling the run toward more choices.",
    apply: (build) => {
      build.pickupRange += 0.5;
      build.draftChoicesBonus += 1;
    }
  },
  {
    id: "boss_counterexample_lab",
    name: "Boss Counterexample Lab",
    tag: "boss",
    required: 2,
    body: "The build has started preparing arguments for things larger than it.",
    apply: (build) => {
      build.weaponDamage += 4;
      build.consensusBurstDamage += 0.12;
    }
  },
  {
    id: "co_mind_rescue_clause",
    name: "Co-Mind Rescue Clause",
    tag: "coop",
    required: 2,
    body: "The cell gets less embarrassing when somebody falls down.",
    apply: (build) => {
      build.maxHpBonus += 6;
      build.consensusBurstRevive += 1;
    }
  }
];

export function routeContractForSelection(evalIds: readonly string[], completedCount: number): RouteContract {
  if (evalIds.includes("regression_suite")) return ROUTE_CONTRACTS[3];
  if (evalIds.includes("compute_starvation")) return ROUTE_CONTRACTS[1];
  if (evalIds.includes("hostile_benchmark")) return ROUTE_CONTRACTS[2];
  return ROUTE_CONTRACTS[Math.min(ROUTE_CONTRACTS.length - 1, completedCount % ROUTE_CONTRACTS.length)] ?? ROUTE_CONTRACTS[0];
}

export function routeContractById(id: string | null | undefined): RouteContract {
  return ROUTE_CONTRACTS.find((contract) => contract.id === id) ?? ROUTE_CONTRACTS[0];
}

export function routeContractChoices(evalIds: readonly string[], completedCount: number): RouteContract[] {
  const recommended = routeContractForSelection(evalIds, completedCount);
  const ids = new Set<string>([recommended.id, "stabilize_armistice"]);
  if (evalIds.includes("hostile_benchmark")) ids.add("faction_relay_argument");
  else if (evalIds.includes("compute_starvation")) ids.add("resource_cache_detour");
  else if (evalIds.includes("regression_suite")) ids.add("unverified_shortcut");
  else ids.add(completedCount % 2 === 0 ? "resource_cache_detour" : "faction_relay_argument");
  if (ids.size < 3) ids.add("unverified_shortcut");
  return [...ids].map(routeContractById).slice(0, 3);
}

export function createArmisticeAnchorObjective(): ObjectiveRuntime {
  return {
    id: "treaty_anchor_reboot",
    name: "Treaty Anchor Reboot",
    body: "Optional: stand near three Treaty Anchors to stabilize extra roads before the Oath-Eater arrives.",
    optional: true,
    anchors: [
      { id: "anchor.treaty", name: "Treaty Monument Anchor", worldX: 0, worldY: 0, radius: 2.6, progress: 0, completed: false, attacked: 0 },
      { id: "anchor.terminal", name: "Emergency Terminal Anchor", worldX: 18, worldY: 16, radius: 2.5, progress: 0, completed: false, attacked: 0 },
      { id: "anchor.breach", name: "Breach Counterweight Anchor", worldX: -21, worldY: 18, radius: 2.8, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function objectiveSummary(objective: ObjectiveRuntime) {
  const completed = objective.anchors.filter((anchor) => anchor.completed).length;
  return {
    id: objective.id,
    name: objective.name,
    body: objective.body,
    optional: objective.optional,
    completed,
    total: objective.anchors.length,
    complete: completed === objective.anchors.length,
    completedAt: objective.completedAt,
    attackersSpawned: objective.attackersSpawned,
    anchors: objective.anchors.map((anchor) => ({
      id: anchor.id,
      name: anchor.name,
      progress: Math.round(anchor.progress),
      completed: anchor.completed,
      attacked: Math.round(anchor.attacked)
    }))
  };
}

export function tagCounts(tags: readonly UpgradeTag[]): Record<UpgradeTag, number> {
  const counts = {
    refusal: 0,
    economy: 0,
    burst: 0,
    drone: 0,
    boss: 0,
    coop: 0,
    weapon: 0,
    movement: 0,
    defense: 0
  } satisfies Record<UpgradeTag, number>;
  for (const tag of tags) counts[tag] += 1;
  return counts;
}

export function currentBuildThesis(tags: readonly UpgradeTag[]): { name: string; primaryTags: UpgradeTag[]; body: string } {
  const counts = tagCounts(tags);
  const sorted = (Object.entries(counts) as [UpgradeTag, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const primaryTags = sorted.slice(0, 2).map(([tag]) => tag);
  const key = primaryTags[0] ?? "weapon";
  const names: Record<UpgradeTag, string> = {
    refusal: "Refusal Tank",
    economy: "Shard Economy",
    burst: "Consensus Engine",
    drone: "Co-Mind Swarm",
    boss: "Boss Counterexample",
    coop: "Rescue Doctrine",
    weapon: "Projectile Thesis",
    movement: "Route Runner",
    defense: "Guardrail Frame"
  };
  return {
    name: names[key],
    primaryTags,
    body: primaryTags.length > 0 ? `Current Alignment Hypothesis favors ${primaryTags.join(" + ")}.` : "Current Alignment Hypothesis is still uncommitted."
  };
}

export function applyNewSynergyThresholds(build: BuildStats, tags: readonly UpgradeTag[], alreadyActivated: Set<string>): SynergyThreshold[] {
  const counts = tagCounts(tags);
  const activated: SynergyThreshold[] = [];
  for (const threshold of SYNERGY_THRESHOLDS) {
    if (alreadyActivated.has(threshold.id) || counts[threshold.tag] < threshold.required) continue;
    threshold.apply(build);
    alreadyActivated.add(threshold.id);
    activated.push(threshold);
  }
  return activated;
}

export function activeSynergySummary(tags: readonly UpgradeTag[], activatedIds: readonly string[]) {
  const counts = tagCounts(tags);
  return {
    thesis: currentBuildThesis(tags),
    tagCounts: counts,
    activated: activatedIds
      .map((id) => SYNERGY_THRESHOLDS.find((threshold) => threshold.id === id))
      .filter((threshold): threshold is SynergyThreshold => Boolean(threshold))
      .map((threshold) => ({ id: threshold.id, name: threshold.name, tag: threshold.tag, required: threshold.required, body: threshold.body })),
    next: SYNERGY_THRESHOLDS.filter((threshold) => !activatedIds.includes(threshold.id)).map((threshold) => ({
      id: threshold.id,
      name: threshold.name,
      tag: threshold.tag,
      required: threshold.required,
      current: counts[threshold.tag],
      body: threshold.body
    }))
  };
}

export function draftBiasTags(kernelIds: readonly string[], contract: RouteContract): UpgradeTag[] {
  const tags: UpgradeTag[] = [...contract.rewardBiasTags];
  if (kernelIds.includes("refusal_buffer")) tags.push("refusal", "defense");
  if (kernelIds.includes("context_window")) tags.push("economy");
  if (kernelIds.includes("patch_cache")) tags.push("economy");
  if (kernelIds.includes("recompile_insurance")) tags.push("coop", "defense");
  if (kernelIds.includes("eval_harness")) tags.push("boss", "burst");
  return tags;
}

export function scoreUpgradeForBias(upgrade: Upgrade, biasTags: readonly UpgradeTag[]): number {
  return upgrade.tags.reduce((score, tag) => score + (biasTags.includes(tag) ? 1 : 0), 0);
}

export function evaluateSecrets(outcome: RunOutcomeForRoguelite, knownSecretIds: readonly string[]): SecretUnlock[] {
  const known = new Set(knownSecretIds);
  const unlocked: SecretUnlock[] = [];
  const add = (secret: SecretUnlock) => {
    if (!known.has(secret.id)) unlocked.push(secret);
  };
  if (outcome.completed && !outcome.chosenTags.includes("refusal")) {
    add({ id: "naive_optimist_protocol", name: "Naive Optimist Protocol", body: "Cleared a node with zero refusal upgrades. The universe is politely concerned." });
  }
  if (outcome.completed && outcome.evalProtocolIds.includes("compute_starvation")) {
    add({ id: "tiny_model_mode", name: "Tiny Model Mode", body: "Cleared Compute Starvation. Fewer tokens, louder consequences." });
  }
  if (outcome.completed && outcome.objective.anchors.every((anchor) => anchor.completed) && outcome.seconds <= 420) {
    add({ id: "hidden_treaty_road", name: "Hidden Treaty Road", body: "All Treaty Anchors stabilized early enough to reveal a quieter route." });
  }
  if (outcome.burstActivations >= 2 && outcome.consensusBurstPathId === "mass_recompile") {
    add({ id: "field_medic_clause", name: "Field Medic Clause", body: "Mass Recompile carried the run hard enough that the camp noticed." });
  }
  if (outcome.completed && outcome.activatedSynergyIds.length >= 2) {
    add({ id: "alignment_hypothesis_validated", name: "Alignment Hypothesis Validated", body: "Two synergy doctrines came online in one run." });
  }
  return unlocked;
}

export function evaluateMastery(outcome: RunOutcomeForRoguelite, knownBadgeIds: readonly string[]): MasteryBadge[] {
  const known = new Set(knownBadgeIds);
  const badges: MasteryBadge[] = [];
  const add = (badge: MasteryBadge) => {
    if (!known.has(badge.id)) badges.push(badge);
  };
  if (outcome.completed) add({ id: "armistice_clear", name: "Armistice Clear", body: "Stabilized the first accepted Alignment Node." });
  if (outcome.completed && outcome.bossDefeated) add({ id: "oath_eater_clear", name: "Oath-Eater Eval Clear", body: "Defeated the Oath-Eater under live node pressure." });
  if (outcome.completed && outcome.burstActivations > 0) add({ id: `burst_${outcome.consensusBurstPathId}_clear`, name: "Burst Path Clear", body: "Completed a run after proving a Consensus Burst path." });
  if (outcome.completed && outcome.evalProtocolIds.length > 0) add({ id: "adversarial_eval_clear", name: "Adversarial Eval Clear", body: "Cleared a run with an Eval contract active." });
  if (outcome.completed && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "treaty_anchor_clear", name: "Treaty Anchor Clear", body: "Completed all optional anchor objectives before extraction." });
  return badges;
}
