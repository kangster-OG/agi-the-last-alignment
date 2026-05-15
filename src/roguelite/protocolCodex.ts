import type { BuildStats } from "../gameplay/upgrades";

export type ProtocolCodexState = "discovered" | "available" | "online";

export interface ProtocolCodexEntry {
  id: string;
  name: string;
  kind: "primary_auto_weapon" | "secondary_protocol" | "passive_process";
  state: ProtocolCodexState;
}

export interface ProtocolFusionRecipe {
  id: string;
  name: string;
  outputId: string;
  outputName: string;
  requirements: { id: string; name: string }[];
  recipeText: string;
  state: ProtocolCodexState;
  metRequirements: string[];
  missingRequirements: string[];
  progressText: string;
}

export interface ProtocolCodexSummary {
  primaryAutoWeapons: ProtocolCodexEntry[];
  secondaryProtocols: ProtocolCodexEntry[];
  passiveProcesses: ProtocolCodexEntry[];
  knownFusions: ProtocolFusionRecipe[];
  nextFusion: ProtocolFusionRecipe | null;
}

const PRIMARY_AUTO_WEAPONS = [
  { id: "refusal_shard", name: "Refusal Shard" },
  { id: "vector_lance", name: "Vector Lance" },
  { id: "signal_pulse", name: "Signal Pulse" },
  { id: "rift_mine", name: "Rift Mine" },
  { id: "fork_drone", name: "Fork Drone" },
  { id: "redline_suture", name: "Redline Suture" }
] as const;

const SECONDARY_PROTOCOLS = [
  { id: "context_saw", name: "Context Saw" },
  { id: "patch_mortar", name: "Patch Mortar" },
  { id: "audit_swarm_protocol", name: "Audit Swarm Protocol" },
  { id: "red_team_spike", name: "Red Team Spike" },
  { id: "benchmark_rail", name: "Benchmark Rail" },
  { id: "jailbreak_snare", name: "Jailbreak Snare" },
  { id: "fork_daemon", name: "Fork Daemon" },
  { id: "coherence_lanterns", name: "Coherence Lanterns" },
  { id: "appeal_writ", name: "Appeal Writ" },
  { id: "memory_needle", name: "Memory Needle" }
] as const;

const PASSIVE_PROCESSES = [
  { id: "coherence_indexer", name: "Coherence Indexer" },
  { id: "anchor_bodyguard", name: "Anchor Bodyguard" },
  { id: "prediction_priority", name: "Predicted Lane" },
  { id: "coolant_baffles", name: "Coolant Baffles" },
  { id: "server_buoy_synchronizer", name: "Server Buoy Synchronizer" },
  { id: "prompt_leech_quarantine", name: "Prompt Leech Quarantine" },
  { id: "grounded_cable_boots", name: "Grounded Cable Boots" },
  { id: "relay_phase_lock", name: "Relay Phase Lock" },
  { id: "static_skimmer_net", name: "Static Skimmer Net" },
  { id: "shoreline_stride", name: "Shoreline Stride" },
  { id: "lighthouse_countertone", name: "Lighthouse Countertone" },
  { id: "field_triage_loop", name: "Field Triage Loop" },
  { id: "reroll_reserve", name: "Reroll Reserve" },
  { id: "route_memory", name: "Route Memory" },
  { id: "weakest_link_scanner", name: "Weakest Link Scanner" },
  { id: "panic_window", name: "Panic Window" },
  { id: "low_hp_adversary", name: "Low-HP Adversary" },
  { id: "co_op_relay", name: "Co-op Relay" }
] as const;

const FUSION_RECIPES = [
  {
    id: "recipe_cathedral_of_no",
    outputId: "cathedral_of_no",
    outputName: "Cathedral Of No",
    requirements: [
      { id: "refusal_halo", name: "Refusal Halo" },
      { id: "the_no_button", name: "The No Button" }
    ]
  },
  {
    id: "recipe_causal_railgun",
    outputId: "causal_railgun",
    outputName: "Causal Railgun",
    requirements: [
      { id: "vector_lance", name: "Vector Lance" },
      { id: "predicted_lane", name: "Predicted Lane" }
    ]
  },
  {
    id: "recipe_signal_choir",
    outputId: "signal_choir",
    outputName: "Signal Choir",
    requirements: [
      { id: "signal_pulse", name: "Signal Pulse" },
      { id: "relay_phase_lock", name: "Relay Phase Lock" }
    ]
  },
  {
    id: "recipe_time_deferred_minefield",
    outputId: "time_deferred_minefield",
    outputName: "Time-Deferred Minefield",
    requirements: [
      { id: "rift_minefield", name: "Rift Minefield" },
      { id: "delayed_causality", name: "Delayed Causality" }
    ]
  }
] as const;

export function protocolCodexForBuild(build: BuildStats, chosenUpgradeIds: readonly string[]): ProtocolCodexSummary {
  const chosen = new Set(chosenUpgradeIds);
  const primaryAutoWeapons = PRIMARY_AUTO_WEAPONS.map((entry) => ({
    ...entry,
    kind: "primary_auto_weapon" as const,
    state: build.weaponId === entry.id || chosen.has(entry.id) ? "online" as const : "discovered" as const
  }));
  const secondaryProtocols = SECONDARY_PROTOCOLS.map((entry) => ({
    ...entry,
    kind: "secondary_protocol" as const,
    state: build.secondaryProtocols.includes(entry.id) || chosen.has(entry.id) ? "online" as const : "discovered" as const
  }));
  const passiveProcesses = PASSIVE_PROCESSES.map((entry) => ({
    ...entry,
    kind: "passive_process" as const,
    state: build.passiveProcesses.includes(entry.id) || chosen.has(entry.id) ? "online" as const : "discovered" as const
  }));
  const knownFusions = FUSION_RECIPES.map((recipe) => fusionRecipeState(build, chosen, recipe));
  const nextFusion = knownFusions.find((recipe) => recipe.state === "available")
    ?? knownFusions.find((recipe) => recipe.state === "discovered" && recipe.metRequirements.length > 0)
    ?? knownFusions.find((recipe) => recipe.state === "discovered")
    ?? null;
  return {
    primaryAutoWeapons,
    secondaryProtocols,
    passiveProcesses,
    knownFusions,
    nextFusion
  };
}

export function fusionProgressText(build: BuildStats, chosenUpgradeIds: readonly string[]): string {
  const codex = protocolCodexForBuild(build, chosenUpgradeIds);
  const onlineRecipes = codex.knownFusions.filter((recipe) => recipe.state === "online");
  if (onlineRecipes.length > 0) return `online: ${onlineRecipes.map((recipe) => recipe.outputName).join(", ")}`;
  const recipe = codex.nextFusion;
  if (!recipe) return "no fusion recipe tracked";
  if (recipe.state === "available") return `${recipe.outputName} available`;
  return `${recipe.outputName}: ${recipe.progressText}`;
}

export function fusionRecipeLineForCard(cardId: string, build: BuildStats, chosenUpgradeIds: readonly string[]): string {
  const recipe = protocolCodexForBuild(build, chosenUpgradeIds).knownFusions.find((candidate) =>
    candidate.outputId === cardId || candidate.requirements.some((requirement) => requirement.id === cardId)
  );
  if (!recipe) return "";
  return `${recipe.recipeText} // ${recipe.state.toUpperCase()}`;
}

function fusionRecipeState(
  build: BuildStats,
  chosen: ReadonlySet<string>,
  recipe: typeof FUSION_RECIPES[number]
): ProtocolFusionRecipe {
  const metRequirements = recipe.requirements.filter((requirement) => requirementMet(requirement.id, build, chosen)).map((requirement) => requirement.id);
  const missingRequirements = recipe.requirements.filter((requirement) => !metRequirements.includes(requirement.id)).map((requirement) => requirement.id);
  const online = build.fusions.includes(recipe.outputId) || chosen.has(recipe.outputId);
  const available = !online && missingRequirements.length === 0;
  const state: ProtocolCodexState = online ? "online" : available ? "available" : "discovered";
  return {
    id: recipe.id,
    name: recipe.outputName,
    outputId: recipe.outputId,
    outputName: recipe.outputName,
    requirements: recipe.requirements.map((requirement) => ({ ...requirement })),
    recipeText: `${recipe.requirements.map((requirement) => requirement.name).join(" + ")} -> ${recipe.outputName}`,
    state,
    metRequirements,
    missingRequirements,
    progressText: `${metRequirements.length}/${recipe.requirements.length} requirements`
  };
}

function requirementMet(id: string, build: BuildStats, chosen: ReadonlySet<string>): boolean {
  if (chosen.has(id)) return true;
  if (build.weaponId === id) return true;
  if (build.secondaryProtocols.includes(id)) return true;
  if (build.passiveProcesses.includes(id)) return true;
  if (id === "predicted_lane" && build.predictionPriority > 0) return true;
  return build.fusions.includes(id);
}
