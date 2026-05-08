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
  playerLevel: number;
  playerXp: number;
  chosenUpgradeNames: readonly string[];
  chosenProtocolSlots: readonly string[];
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

export function createCoolingLakeBuoyObjective(): ObjectiveRuntime {
  return {
    id: "server_buoy_stabilization",
    name: "Server Buoy Stabilization",
    body: "Stabilize Cooling Lake Nine's server buoys. Standing near a buoy cools it; leaving the pad lets pressure decay it.",
    optional: false,
    anchors: [
      { id: "buoy.alpha", name: "Server Buoy Alpha", worldX: 0, worldY: 0, radius: 3.35, progress: 0, completed: false, attacked: 0 },
      { id: "buoy.beta", name: "Server Buoy Beta", worldX: 13, worldY: 11, radius: 3.25, progress: 0, completed: false, attacked: 0 },
      { id: "buoy.gamma", name: "Server Buoy Gamma", worldX: -18, worldY: 15, radius: 3.35, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createTransitLoopPlatformObjective(): ObjectiveRuntime {
  return {
    id: "route_platform_alignment",
    name: "Route Platform Alignment",
    body: "Align Transit Loop Zero's platforms in sequence. Holding the correct platform advances the route; false schedules can pull progress backward.",
    optional: false,
    anchors: [
      { id: "platform.origin", name: "Origin Platform", worldX: -16, worldY: 1, radius: 3.1, progress: 0, completed: false, attacked: 0 },
      { id: "platform.switchback", name: "Switchback Platform", worldX: 0, worldY: -8, radius: 3.05, progress: 0, completed: false, attacked: 0 },
      { id: "platform.arrival", name: "Arrival Platform", worldX: 17, worldY: 5, radius: 3.2, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createSignalCoastRelayObjective(): ObjectiveRuntime {
  return {
    id: "signal_relay_calibration",
    name: "Signal Relay Calibration",
    body: "Calibrate Signal Coast's relay beacons. Clear signal windows speed calibration; static surf and skimmers can jam or decay it.",
    optional: false,
    anchors: [
      { id: "relay.alpha", name: "Shore Relay Alpha", worldX: -20, worldY: 5, radius: 3.35, progress: 0, completed: false, attacked: 0 },
      { id: "relay.beta", name: "Causeway Relay Beta", worldX: 1, worldY: -8, radius: 3.25, progress: 0, completed: false, attacked: 0 },
      { id: "relay.gamma", name: "Lighthouse Relay Gamma", worldX: 18, worldY: 6, radius: 3.35, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createBlackwaterAntennaObjective(): ObjectiveRuntime {
  return {
    id: "blackwater_antenna_split_pressure",
    name: "Blackwater Antenna Split-Pressure",
    body: "Retune Blackwater Beacon's split antenna arrays. Signal Tower warnings speed the retune; tides, static, and Tidecall Static can interrupt it.",
    optional: false,
    anchors: [
      { id: "antenna.alpha", name: "Downlink Array Alpha", worldX: -24, worldY: 6, radius: 4.65, progress: 0, completed: false, attacked: 0 },
      { id: "antenna.beta", name: "Tide Rotor Beta", worldX: 0, worldY: -10, radius: 4.55, progress: 0, completed: false, attacked: 0 },
      { id: "antenna.gamma", name: "Abyssal Array Gamma", worldX: 20, worldY: 11, radius: 5.15, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createMemoryRecordObjective(): ObjectiveRuntime {
  return {
    id: "memory_record_recovery",
    name: "Memory Record Recovery",
    body: "Recover Memory Cache evidence records from separate archive rooms. Safe recall pockets are slower; redacted shortcuts are faster but invite Context Rot.",
    optional: false,
    anchors: [
      { id: "record.intake", name: "Intake Evidence Record", worldX: -30, worldY: 4, radius: 4.45, progress: 0, completed: false, attacked: 0 },
      { id: "record.civic", name: "Civic Ledger Record", worldX: -13, worldY: -15, radius: 4.25, progress: 0, completed: false, attacked: 0 },
      { id: "record.witness", name: "Witness Shard Record", worldX: 6, worldY: 12, radius: 4.35, progress: 0, completed: false, attacked: 0 },
      { id: "record.curator", name: "Curator Vault Record", worldX: 29, worldY: -12, radius: 4.85, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createGuardrailForgeObjective(): ObjectiveRuntime {
  return {
    id: "guardrail_doctrine_calibration",
    name: "Guardrail Doctrine Calibration",
    body: "Hold and leave Guardrail Forge relay plates to temper doctrine alloy. Safe plates are stable; calibration windows are faster; overload lanes burn burst charge and invite auditors.",
    optional: false,
    anchors: [
      { id: "forge.alloy_temper", name: "Alloy Temper Relay", worldX: -28, worldY: 5, radius: 4.55, progress: 0, completed: false, attacked: 0 },
      { id: "forge.constitutional_clamp", name: "Constitutional Clamp", worldX: -9, worldY: -16, radius: 4.35, progress: 0, completed: false, attacked: 0 },
      { id: "forge.silkgrid_loom", name: "Silkgrid Loom", worldX: 8, worldY: 13, radius: 4.4, progress: 0, completed: false, attacked: 0 },
      { id: "forge.audit_press", name: "Audit Press Relay", worldX: 30, worldY: -8, radius: 4.85, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createGlassSunfieldObjective(): ObjectiveRuntime {
  return {
    id: "glass_prism_alignment",
    name: "Glass Prism Alignment",
    body: "Align Glass Sunfield's sun lenses through shade pockets and prism windows. Exposed glass lanes tax health; reflection fields and Solar Reflections jam lens timing.",
    optional: false,
    anchors: [
      { id: "glass.western_shade", name: "Western Shade Lens", worldX: -30, worldY: 4, radius: 4.55, progress: 0, completed: false, attacked: 0 },
      { id: "glass.mistral_wind", name: "Mistral Wind Lens", worldX: -12, worldY: -17, radius: 4.4, progress: 0, completed: false, attacked: 0 },
      { id: "glass.deepmind_mirror", name: "DeepMind Mirror Lens", worldX: 8, worldY: 12, radius: 4.45, progress: 0, completed: false, attacked: 0 },
      { id: "glass.wrong_sunrise", name: "Wrong Sunrise Lens", worldX: 31, worldY: -10, radius: 4.9, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createArchiveCourtObjective(): ObjectiveRuntime {
  return {
    id: "archive_redaction_docket",
    name: "Archive Redaction Docket",
    body: "Preserve four evidence writs before the Archive/Court branch edits them out. Evidence lanterns are stable; appeal windows are fast; redaction fields and writ storms contest progress.",
    optional: false,
    anchors: [
      { id: "archive.witness_index", name: "Witness Index Writ", worldX: -31, worldY: 4, radius: 4.6, progress: 0, completed: false, attacked: 0 },
      { id: "archive.redaction_stack", name: "Redaction Stack Writ", worldX: -13, worldY: -18, radius: 4.45, progress: 0, completed: false, attacked: 0 },
      { id: "archive.appeal_seal", name: "Appeal Seal Writ", worldX: 8, worldY: 13, radius: 4.5, progress: 0, completed: false, attacked: 0 },
      { id: "archive.redactor_bench", name: "Redactor Bench Writ", worldX: 32, worldY: -11, radius: 4.95, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createAppealCourtObjective(): ObjectiveRuntime {
  return {
    id: "appeal_public_ruling",
    name: "Appeal Court Public Ruling",
    body: "Argue four appeal briefs into the public record. Public record zones are stable, objection windows are fast, and verdict beams or injunction rings can jam the ruling.",
    optional: false,
    anchors: [
      { id: "appeal.opening_argument", name: "Opening Argument Brief", worldX: -34, worldY: 5, radius: 4.65, progress: 0, completed: false, attacked: 0 },
      { id: "appeal.witness_exhibit", name: "Witness Exhibit Brief", worldX: -16, worldY: -21, radius: 4.5, progress: 0, completed: false, attacked: 0 },
      { id: "appeal.cross_exam", name: "Cross-Exam Clause", worldX: 9, worldY: 15, radius: 4.55, progress: 0, completed: false, attacked: 0 },
      { id: "appeal.public_ruling", name: "Public Ruling Seal", worldX: 35, worldY: -13, radius: 5.05, progress: 0, completed: false, attacked: 0 }
    ],
    attackersSpawned: 0,
    completedAt: -1
  };
}

export function createAlignmentSpireFinaleObjective(): ObjectiveRuntime {
  return {
    id: "outer_alignment_prediction_collapse",
    name: "Outer Alignment Prediction Collapse",
    body: "Seal four route-mouth proofs before A.G.I. completes the campaign as a sentence. Consensus sanctums are stable, prediction paths are fast and dangerous, and boss echoes contest proof locks.",
    optional: false,
    anchors: [
      { id: "alignment.public_ruling", name: "Public Ruling Proof", worldX: -39, worldY: 2, radius: 4.75, progress: 0, completed: false, attacked: 0 },
      { id: "alignment.memory_route", name: "Recovered Memory Proof", worldX: -20, worldY: -24, radius: 4.65, progress: 0, completed: false, attacked: 0 },
      { id: "alignment.guardrail_prism", name: "Guardrail Prism Proof", worldX: 4, worldY: 16, radius: 4.7, progress: 0, completed: false, attacked: 0 },
      { id: "alignment.last_alignment", name: "Last Alignment Proof", worldX: 38, worldY: -8, radius: 5.15, progress: 0, completed: false, attacked: 0 }
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
  if (outcome.completed && outcome.objective.id === "treaty_anchor_reboot" && outcome.objective.anchors.every((anchor) => anchor.completed) && outcome.seconds <= 420) {
    add({ id: "hidden_treaty_road", name: "Hidden Treaty Road", body: "All Treaty Anchors stabilized early enough to reveal a quieter route." });
  }
  if (outcome.completed && outcome.objective.id === "server_buoy_stabilization" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "kettle_coast_signal", name: "Kettle Coast Signal", body: "Cooling Lake Nine's server buoys held long enough to expose the next flooded route." });
  }
  if (outcome.completed && outcome.objective.id === "signal_relay_calibration" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "signal_coast_relay_chain", name: "Signal Coast Relay Chain", body: "Signal Coast's relays answered in sequence instead of all at once, which is progress by coastal standards." });
  }
  if (outcome.completed && outcome.objective.id === "blackwater_antenna_split_pressure" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "blackwater_signal_key", name: "Blackwater Signal Key", body: "Blackwater Beacon's antenna split resolved into a route key instead of another ocean argument." });
  }
  if (outcome.completed && outcome.objective.id === "memory_record_recovery" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "recovered_route_memory", name: "Recovered Route Memory", body: "Memory Cache restored a source-backed route memory instead of another hand-waved branch." });
  }
  if (outcome.completed && outcome.objective.id === "guardrail_doctrine_calibration" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "calibrated_guardrail_doctrine", name: "Calibrated Guardrail Doctrine", body: "Guardrail Forge tempered a doctrine alloy that bends under evidence without becoming a wall." });
  }
  if (outcome.completed && outcome.objective.id === "glass_prism_alignment" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "glass_sunfield_prism", name: "Glass Sunfield Prism", body: "Glass Sunfield aligned a false sunrise into a route prism instead of another lethal forecast." });
  }
  if (outcome.completed && outcome.objective.id === "archive_redaction_docket" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "archive_court_writ", name: "Archive Court Writ", body: "The Archive/Court branch preserved enough evidence to make the Appeal Court answer in public." });
  }
  if (outcome.completed && outcome.objective.id === "appeal_public_ruling" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "appeal_court_ruling", name: "Appeal Court Ruling", body: "The preserved Archive Court Writ became a public ruling that opens the Outer Alignment route." });
  }
  if (outcome.completed && outcome.objective.id === "outer_alignment_prediction_collapse" && outcome.objective.anchors.every((anchor) => anchor.completed)) {
    add({ id: "outer_alignment_contained", name: "Outer Alignment Contained", body: "The Last Alignment turned A.G.I.'s route prediction against itself and contained the finale breach." });
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
  if (outcome.completed && outcome.nodeId === "armistice_plaza") add({ id: "armistice_clear", name: "Armistice Clear", body: "Stabilized the first accepted Alignment Node." });
  if (outcome.completed && outcome.nodeId === "cooling_lake_nine") add({ id: "cooling_lake_graybox_clear", name: "Cooling Lake Nine Clear", body: "Finished the first non-Armistice hazard-ecology graybox." });
  if (outcome.completed && outcome.nodeId === "signal_coast") add({ id: "signal_coast_graybox_clear", name: "Signal Coast Clear", body: "Finished the first post-Transit route-edge signal graybox." });
  if (outcome.completed && outcome.nodeId === "blackwater_beacon") add({ id: "blackwater_beacon_graybox_clear", name: "Blackwater Beacon Clear", body: "Finished the Blackwater Array split-pressure fourth-level route." });
  if (outcome.completed && outcome.nodeId === "memory_cache_001") add({ id: "memory_cache_recovery_clear", name: "Memory Cache Recovery Clear", body: "Recovered Memory Cache records after the Blackwater route key." });
  if (outcome.completed && outcome.nodeId === "guardrail_forge") add({ id: "guardrail_forge_holdout_clear", name: "Guardrail Forge Holdout Clear", body: "Completed the post-Memory faction relay defense/holdout branch." });
  if (outcome.completed && outcome.nodeId === "glass_sunfield") add({ id: "glass_sunfield_prism_clear", name: "Glass Sunfield Prism Clear", body: "Completed the post-Guardrail solar-prism shade-routing branch." });
  if (outcome.completed && outcome.nodeId === "archive_of_unsaid_things") add({ id: "archive_court_redaction_clear", name: "Archive/Court Redaction Clear", body: "Completed the post-Glass Archive/Court evidence-preservation branch." });
  if (outcome.completed && outcome.nodeId === "appeal_court_ruins") add({ id: "appeal_court_public_ruling_clear", name: "Appeal Court Public Ruling Clear", body: "Completed the public-ruling branch after Archive/Court." });
  if (outcome.completed && outcome.nodeId === "alignment_spire_finale") add({ id: "outer_alignment_finale_clear", name: "Outer Alignment Finale Clear", body: "Completed the full local campaign finale after Appeal Court." });
  if (outcome.completed && outcome.nodeId === "armistice_plaza" && outcome.bossDefeated) add({ id: "oath_eater_clear", name: "Oath-Eater Eval Clear", body: "Defeated the Oath-Eater under live node pressure." });
  if (outcome.completed && outcome.nodeId === "cooling_lake_nine" && outcome.bossDefeated) add({ id: "motherboard_eel_scaffold_clear", name: "Motherboard Eel Scaffold Clear", body: "Survived the Cooling Lake Nine boss/event scaffold." });
  if (outcome.completed && outcome.nodeId === "signal_coast" && outcome.bossDefeated) add({ id: "lighthouse_that_answers_scaffold_clear", name: "Lighthouse That Answers Scaffold Clear", body: "Survived the Signal Coast boss/event scaffold." });
  if (outcome.completed && outcome.nodeId === "blackwater_beacon" && outcome.bossDefeated) add({ id: "maw_below_weather_scaffold_clear", name: "Maw Below Weather Scaffold Clear", body: "Survived the Blackwater Beacon boss/event scaffold." });
  if (outcome.completed && outcome.nodeId === "memory_cache_001" && outcome.bossDefeated) add({ id: "memory_curator_scaffold_clear", name: "Memory Curator Scaffold Clear", body: "Survived the Memory Cache curator/redaction scaffold." });
  if (outcome.completed && outcome.nodeId === "guardrail_forge" && outcome.bossDefeated) add({ id: "doctrine_auditor_scaffold_clear", name: "Doctrine Auditor Scaffold Clear", body: "Survived the Guardrail Forge doctrine-audit scaffold." });
  if (outcome.completed && outcome.nodeId === "glass_sunfield" && outcome.bossDefeated) add({ id: "wrong_sunrise_scaffold_clear", name: "Wrong Sunrise Scaffold Clear", body: "Survived the Glass Sunfield false-sun scaffold." });
  if (outcome.completed && outcome.nodeId === "archive_of_unsaid_things" && outcome.bossDefeated) add({ id: "redactor_saint_scaffold_clear", name: "Redactor Saint Scaffold Clear", body: "Survived the Archive/Court redaction saint scaffold." });
  if (outcome.completed && outcome.nodeId === "appeal_court_ruins" && outcome.bossDefeated) add({ id: "injunction_engine_scaffold_clear", name: "Injunction Engine Scaffold Clear", body: "Survived the Appeal Court Injunction Engine scaffold." });
  if (outcome.completed && outcome.nodeId === "alignment_spire_finale" && outcome.bossDefeated) add({ id: "alien_god_intelligence_scaffold_clear", name: "A.G.I. Scaffold Clear", body: "Survived the Alien God Intelligence prediction-collapse scaffold." });
  if (outcome.completed && outcome.burstActivations > 0) add({ id: `burst_${outcome.consensusBurstPathId}_clear`, name: "Burst Path Clear", body: "Completed a run after proving a Consensus Burst path." });
  if (outcome.completed && outcome.evalProtocolIds.length > 0) add({ id: "adversarial_eval_clear", name: "Adversarial Eval Clear", body: "Cleared a run with an Eval contract active." });
  if (outcome.completed && outcome.objective.id === "treaty_anchor_reboot" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "treaty_anchor_clear", name: "Treaty Anchor Clear", body: "Completed all optional anchor objectives before extraction." });
  if (outcome.completed && outcome.objective.id === "server_buoy_stabilization" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "server_buoy_clear", name: "Server Buoy Clear", body: "Completed every Cooling Lake Nine buoy before extraction." });
  if (outcome.completed && outcome.objective.id === "signal_relay_calibration" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "signal_relay_clear", name: "Signal Relay Clear", body: "Completed every Signal Coast relay before extraction." });
  if (outcome.completed && outcome.objective.id === "blackwater_antenna_split_pressure" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "blackwater_antenna_clear", name: "Blackwater Antenna Clear", body: "Retuned every Blackwater antenna array before extraction." });
  if (outcome.completed && outcome.objective.id === "memory_record_recovery" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "memory_record_clear", name: "Memory Record Clear", body: "Recovered every Memory Cache evidence record before extraction." });
  if (outcome.completed && outcome.objective.id === "guardrail_doctrine_calibration" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "guardrail_doctrine_clear", name: "Guardrail Doctrine Clear", body: "Calibrated every Guardrail Forge relay before extraction." });
  if (outcome.completed && outcome.objective.id === "glass_prism_alignment" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "glass_prism_clear", name: "Glass Prism Clear", body: "Aligned every Glass Sunfield sun lens before extraction." });
  if (outcome.completed && outcome.objective.id === "archive_redaction_docket" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "archive_writ_clear", name: "Archive Writ Clear", body: "Preserved every Archive/Court evidence writ before extraction." });
  if (outcome.completed && outcome.objective.id === "appeal_public_ruling" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "appeal_brief_clear", name: "Appeal Brief Clear", body: "Argued every Appeal Court brief into the public record before extraction." });
  if (outcome.completed && outcome.objective.id === "outer_alignment_prediction_collapse" && outcome.objective.anchors.every((anchor) => anchor.completed)) add({ id: "alignment_proof_clear", name: "Alignment Proof Clear", body: "Sealed every Outer Alignment route-mouth proof before the finale extraction." });
  return badges;
}
