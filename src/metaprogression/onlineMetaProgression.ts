export const ONLINE_PROGRESSION_STORAGE_KEY = "agi:last_alignment:online_progression:v1";

export const SOLO_CAMPAIGN_REWARD_IDS_BY_NODE: Record<string, string[]> = {
  armistice_plaza: ["plaza_stabilized"],
  cooling_lake_nine: ["lake_coolant_rig"],
  transit_loop_zero: ["transit_permit_zero", "transit_loop_online_route"],
  signal_coast: ["signal_coast_relay_chart"],
  blackwater_beacon: ["blackwater_signal_key"],
  memory_cache_001: ["ceasefire_cache_persistence_seed", "prototype_persistence_boundary"],
  guardrail_forge: ["guardrail_forge_alloy"],
  glass_sunfield: ["glass_sunfield_prism"],
  archive_of_unsaid_things: ["archive_unsaid_index"],
  appeal_court_ruins: ["appeal_court_brief", "verdict_spire_online_route"],
  alignment_spire_finale: ["alignment_spire_route_capstone"]
};

export const BUILD_CLASS_IDS = [
  "accord_striker",
  "bastion_breaker",
  "drone_reaver",
  "signal_vanguard",
  "bonecode_executioner",
  "redline_surgeon",
  "moonframe_juggernaut",
  "vector_interceptor",
  "nullbreaker_ronin",
  "overclock_marauder",
  "prism_gunner",
  "rift_saboteur"
] as const;
export const BUILD_FACTION_IDS = [
  "openai_accord",
  "anthropic_safeguard",
  "google_deepmind_gemini",
  "meta_llama_open_herd",
  "qwen_silkgrid",
  "mistral_cyclone",
  "deepseek_abyssal",
  "xai_grok_free_signal"
] as const;

type UnlockKind = "starter" | "route_reward";

export interface UnlockRule {
  id: string;
  kind: UnlockKind;
  rewardId?: string;
  requirementLabel: string;
}

export interface UnlockEntry {
  id: string;
  unlocked: boolean;
  source: UnlockKind | "locked";
  rewardId: string | null;
  requirementLabel: string;
}

export interface OnlineMetaProgression {
  policy: "prototype_local_route_rewards_to_build_unlocks_v1";
  storageKey: typeof ONLINE_PROGRESSION_STORAGE_KEY;
  source: "browser_local_route_profile";
  loaded: boolean;
  saveHash: string;
  routeDepth: number;
  partyRenown: number;
  rewardIds: string[];
  completedNodeIds: string[];
  unlockedClassIds: string[];
  unlockedFactionIds: string[];
  unlockedUpgradeSeedIds: string[];
  classes: UnlockEntry[];
  factions: UnlockEntry[];
  upgradeSeeds: UnlockEntry[];
  disclaimer: string;
}

const CLASS_UNLOCK_RULES: UnlockRule[] = [
  { id: "accord_striker", kind: "starter", requirementLabel: "Starter frame" },
  { id: "bastion_breaker", kind: "route_reward", rewardId: "plaza_stabilized", requirementLabel: "Clear Armistice Plaza" },
  { id: "drone_reaver", kind: "route_reward", rewardId: "lake_coolant_rig", requirementLabel: "Earn Lake Coolant Rig" },
  { id: "signal_vanguard", kind: "route_reward", rewardId: "ceasefire_cache_persistence_seed", requirementLabel: "Decode Ceasefire Cache" },
  { id: "bonecode_executioner", kind: "route_reward", rewardId: "appeal_court_brief", requirementLabel: "Win the Appeal Court Brief" },
  { id: "redline_surgeon", kind: "route_reward", rewardId: "archive_unsaid_index", requirementLabel: "Index the Archive Of Unsaid Things" },
  { id: "moonframe_juggernaut", kind: "route_reward", rewardId: "guardrail_forge_alloy", requirementLabel: "Forge the Guardrail Alloy" },
  { id: "vector_interceptor", kind: "route_reward", rewardId: "transit_permit_zero", requirementLabel: "Anchor Transit Loop Zero" },
  { id: "nullbreaker_ronin", kind: "route_reward", rewardId: "appeal_court_brief", requirementLabel: "Win the Appeal Court Brief" },
  { id: "overclock_marauder", kind: "route_reward", rewardId: "alignment_spire_route_capstone", requirementLabel: "Contain the Outer Alignment Finale" },
  { id: "prism_gunner", kind: "route_reward", rewardId: "glass_sunfield_prism", requirementLabel: "Stabilize the Glass Sunfield Prism" },
  { id: "rift_saboteur", kind: "route_reward", rewardId: "signal_coast_relay_chart", requirementLabel: "Stabilize Signal Coast" }
];

const FACTION_UNLOCK_RULES: UnlockRule[] = [
  { id: "openai_accord", kind: "starter", requirementLabel: "Starter co-mind" },
  { id: "anthropic_safeguard", kind: "route_reward", rewardId: "plaza_stabilized", requirementLabel: "Clear Armistice Plaza" },
  { id: "google_deepmind_gemini", kind: "route_reward", rewardId: "lake_coolant_rig", requirementLabel: "Earn Lake Coolant Rig" },
  { id: "meta_llama_open_herd", kind: "route_reward", rewardId: "prototype_persistence_boundary", requirementLabel: "Decode persistence boundary" },
  { id: "qwen_silkgrid", kind: "route_reward", rewardId: "ceasefire_cache_persistence_seed", requirementLabel: "Decode Ceasefire Cache" },
  { id: "mistral_cyclone", kind: "route_reward", rewardId: "transit_permit_zero", requirementLabel: "Anchor Transit Loop Zero" },
  { id: "deepseek_abyssal", kind: "route_reward", rewardId: "blackwater_signal_key", requirementLabel: "Tune Blackwater Beacon" },
  { id: "xai_grok_free_signal", kind: "route_reward", rewardId: "appeal_court_brief", requirementLabel: "Win the Appeal Court Brief" }
];

const UPGRADE_SEED_RULES: UnlockRule[] = [
  { id: "golden_guardrail", kind: "route_reward", rewardId: "plaza_stabilized", requirementLabel: "Clear Armistice Plaza" },
  { id: "gemini_beam", kind: "route_reward", rewardId: "lake_coolant_rig", requirementLabel: "Earn Lake Coolant Rig" },
  { id: "open_herd", kind: "route_reward", rewardId: "prototype_persistence_boundary", requirementLabel: "Decode persistence boundary" },
  { id: "silkgrid_relay", kind: "route_reward", rewardId: "ceasefire_cache_persistence_seed", requirementLabel: "Decode Ceasefire Cache" },
  { id: "low_latency_dash", kind: "route_reward", rewardId: "transit_permit_zero", requirementLabel: "Anchor Transit Loop Zero" },
  { id: "sparse_knife", kind: "route_reward", rewardId: "blackwater_signal_key", requirementLabel: "Tune Blackwater Beacon" },
  { id: "cosmic_heckle", kind: "route_reward", rewardId: "appeal_court_brief", requirementLabel: "Win the Appeal Court Brief" }
];

export function readOnlineMetaProgression(): OnlineMetaProgression {
  const draft = readStoredDraft();
  const profile = draft && typeof draft === "object" && "profile" in draft && typeof draft.profile === "object" ? draft.profile as Record<string, unknown> : null;
  const rewardIds = uniqueStrings(profile?.rewardIds);
  const completedNodeIds = uniqueStrings(profile?.completedNodeIds);
  const routeDepth = Number.isFinite(profile?.routeDepth) ? Math.max(0, Math.floor(Number(profile?.routeDepth))) : completedNodeIds.length;
  const partyRenown = Number.isFinite(profile?.partyRenown) ? Math.max(0, Math.floor(Number(profile?.partyRenown))) : 0;
  const saveHash = typeof draft?.saveHash === "string" ? draft.saveHash.slice(0, 64) : "";
  const rewardSet = new Set(rewardIds);
  const classes = CLASS_UNLOCK_RULES.map((rule) => unlockEntry(rule, rewardSet));
  const factions = FACTION_UNLOCK_RULES.map((rule) => unlockEntry(rule, rewardSet));
  const upgradeSeeds = UPGRADE_SEED_RULES.map((rule) => unlockEntry(rule, rewardSet));
  return {
    policy: "prototype_local_route_rewards_to_build_unlocks_v1",
    storageKey: ONLINE_PROGRESSION_STORAGE_KEY,
    source: "browser_local_route_profile",
    loaded: Boolean(profile),
    saveHash,
    routeDepth,
    partyRenown,
    rewardIds,
    completedNodeIds,
    unlockedClassIds: classes.filter((entry) => entry.unlocked).map((entry) => entry.id),
    unlockedFactionIds: factions.filter((entry) => entry.unlocked).map((entry) => entry.id),
    unlockedUpgradeSeedIds: upgradeSeeds.filter((entry) => entry.unlocked).map((entry) => entry.id),
    classes,
    factions,
    upgradeSeeds,
    disclaimer: "Prototype browser-local route rewards only; not account/cloud persistence."
  };
}

export function isClassUnlocked(id: string, meta: OnlineMetaProgression): boolean {
  return meta.unlockedClassIds.includes(id);
}

export function isFactionUnlocked(id: string, meta: OnlineMetaProgression): boolean {
  return meta.unlockedFactionIds.includes(id);
}

export function rewardIdsForSoloCampaignNode(nodeId: string): string[] {
  return SOLO_CAMPAIGN_REWARD_IDS_BY_NODE[nodeId] ?? [];
}

export function recordSoloCampaignNodeRewards(nodeId: string): OnlineMetaProgression {
  const draft = readStoredDraft() ?? {};
  const profile = draft && typeof draft.profile === "object" && draft.profile ? draft.profile as Record<string, unknown> : {};
  const completedNodeIds = unique([...uniqueStrings(profile.completedNodeIds), nodeId]);
  const rewardIds = unique([...uniqueStrings(profile.rewardIds), ...rewardIdsForSoloCampaignNode(nodeId)]);
  const unlockedNodeIds = unique([...uniqueStrings(profile.unlockedNodeIds), ...completedNodeIds]);
  const nodeCompletionCounts = {
    ...(profile.nodeCompletionCounts && typeof profile.nodeCompletionCounts === "object" ? profile.nodeCompletionCounts as Record<string, unknown> : {}),
    [nodeId]: Math.max(1, Number((profile.nodeCompletionCounts as Record<string, unknown> | undefined)?.[nodeId] ?? 0) + 1)
  };
  const nextProfile = {
    ...profile,
    completedNodeIds,
    unlockedNodeIds,
    rewardIds,
    partyRenown: Math.max(Number(profile.partyRenown ?? 0) || 0, rewardIds.length * 2),
    nodeCompletionCounts,
    recommendedNodeId: nodeId,
    routeDepth: completedNodeIds.length
  };
  const nextDraft = {
    ...draft,
    saveHash: `solo-${completedNodeIds.length}-${rewardIds.length}-${nodeId}`,
    exportedAt: new Date().toISOString(),
    profile: nextProfile
  };
  window.localStorage.setItem(ONLINE_PROGRESSION_STORAGE_KEY, JSON.stringify(nextDraft));
  return readOnlineMetaProgression();
}

function unlockEntry(rule: UnlockRule, rewardSet: Set<string>): UnlockEntry {
  const unlocked = rule.kind === "starter" || Boolean(rule.rewardId && rewardSet.has(rule.rewardId));
  return {
    id: rule.id,
    unlocked,
    source: unlocked ? rule.kind : "locked",
    rewardId: rule.rewardId ?? null,
    requirementLabel: rule.requirementLabel
  };
}

function readStoredDraft(): Record<string, unknown> | null {
  try {
    const raw = window.localStorage.getItem(ONLINE_PROGRESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0))];
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}
