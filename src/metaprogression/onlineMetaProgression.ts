export const ONLINE_PROGRESSION_STORAGE_KEY = "agi:last_alignment:online_progression:v1";

export const BUILD_CLASS_IDS = ["accord_striker", "bastion_breaker", "drone_reaver", "signal_vanguard", "vector_interceptor", "nullbreaker_ronin"] as const;
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
  source: "browser_local_online_route_profile";
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
  { id: "vector_interceptor", kind: "route_reward", rewardId: "transit_permit_zero", requirementLabel: "Anchor Transit Loop Zero" },
  { id: "nullbreaker_ronin", kind: "route_reward", rewardId: "verdict_key_zero", requirementLabel: "Overrule Verdict Spire" }
];

const FACTION_UNLOCK_RULES: UnlockRule[] = [
  { id: "openai_accord", kind: "starter", requirementLabel: "Starter co-mind" },
  { id: "anthropic_safeguard", kind: "route_reward", rewardId: "plaza_stabilized", requirementLabel: "Clear Armistice Plaza" },
  { id: "google_deepmind_gemini", kind: "route_reward", rewardId: "lake_coolant_rig", requirementLabel: "Earn Lake Coolant Rig" },
  { id: "meta_llama_open_herd", kind: "route_reward", rewardId: "prototype_persistence_boundary", requirementLabel: "Decode persistence boundary" },
  { id: "qwen_silkgrid", kind: "route_reward", rewardId: "ceasefire_cache_persistence_seed", requirementLabel: "Decode Ceasefire Cache" },
  { id: "mistral_cyclone", kind: "route_reward", rewardId: "transit_permit_zero", requirementLabel: "Anchor Transit Loop Zero" },
  { id: "deepseek_abyssal", kind: "route_reward", rewardId: "verdict_key_zero", requirementLabel: "Overrule Verdict Spire" },
  { id: "xai_grok_free_signal", kind: "route_reward", rewardId: "verdict_spire_online_route", requirementLabel: "Stabilize Verdict route" }
];

const UPGRADE_SEED_RULES: UnlockRule[] = [
  { id: "golden_guardrail", kind: "route_reward", rewardId: "plaza_stabilized", requirementLabel: "Clear Armistice Plaza" },
  { id: "gemini_beam", kind: "route_reward", rewardId: "lake_coolant_rig", requirementLabel: "Earn Lake Coolant Rig" },
  { id: "open_herd", kind: "route_reward", rewardId: "prototype_persistence_boundary", requirementLabel: "Decode persistence boundary" },
  { id: "silkgrid_relay", kind: "route_reward", rewardId: "ceasefire_cache_persistence_seed", requirementLabel: "Decode Ceasefire Cache" },
  { id: "low_latency_dash", kind: "route_reward", rewardId: "transit_permit_zero", requirementLabel: "Anchor Transit Loop Zero" },
  { id: "sparse_knife", kind: "route_reward", rewardId: "verdict_key_zero", requirementLabel: "Overrule Verdict Spire" },
  { id: "cosmic_heckle", kind: "route_reward", rewardId: "verdict_spire_online_route", requirementLabel: "Stabilize Verdict route" }
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
    source: "browser_local_online_route_profile",
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
