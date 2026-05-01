import { ONLINE_ARENAS } from "./onlineArenas.mjs";
import { CAMPAIGN_ROUTE, DURABLE_REWARD_IDS, PARTY_NODES } from "./onlineRoutes.mjs";
import { objectiveSetForRouteNode } from "./onlineObjectives.mjs";

export const BALANCE_POLICY = "progression_rewards_balance_1_0_route_profile_only_v1";
export const BALANCE_PERSISTENCE_BOUNDARY =
  "route_profile_only_no_live_objectives_combat_selected_build_kits_cooldowns_pets_role_pressure_recompile_dialogue_route_ui_or_authority_state";
export const PARTY_XP_THRESHOLDS = [5, 12, 22, 35];

const CLASS_UNLOCK_RULES = [
  { id: "accord_striker", kind: "starter", rewardId: null, tier: 0 },
  { id: "bastion_breaker", kind: "route_reward", rewardId: "plaza_stabilized", tier: 0 },
  { id: "drone_reaver", kind: "route_reward", rewardId: "lake_coolant_rig", tier: 1 },
  { id: "signal_vanguard", kind: "route_reward", rewardId: "ceasefire_cache_persistence_seed", tier: 2 },
  { id: "redline_surgeon", kind: "route_reward", rewardId: "archive_unsaid_index", tier: 3 },
  { id: "moonframe_juggernaut", kind: "route_reward", rewardId: "guardrail_forge_alloy", tier: 3 },
  { id: "vector_interceptor", kind: "route_reward", rewardId: "transit_permit_zero", tier: 4 },
  { id: "overclock_marauder", kind: "route_reward", rewardId: "thermal_archive_schematic", tier: 2 },
  { id: "rift_saboteur", kind: "route_reward", rewardId: "false_schedule_lane_chart", tier: 5 },
  { id: "prism_gunner", kind: "route_reward", rewardId: "glass_sunfield_prism", tier: 5 },
  { id: "nullbreaker_ronin", kind: "route_reward", rewardId: "verdict_key_zero", tier: 6 },
  { id: "bonecode_executioner", kind: "route_reward", rewardId: "appeal_court_brief", tier: 6 }
];

const FACTION_UNLOCK_RULES = [
  { id: "openai_accord", kind: "starter", rewardId: null, tier: 0 },
  { id: "anthropic_safeguard", kind: "route_reward", rewardId: "plaza_stabilized", tier: 0 },
  { id: "google_deepmind_gemini", kind: "route_reward", rewardId: "lake_coolant_rig", tier: 1 },
  { id: "qwen_silkgrid", kind: "route_reward", rewardId: "ceasefire_cache_persistence_seed", tier: 2 },
  { id: "meta_llama_open_herd", kind: "route_reward", rewardId: "prototype_persistence_boundary", tier: 2 },
  { id: "mistral_cyclone", kind: "route_reward", rewardId: "transit_permit_zero", tier: 4 },
  { id: "deepseek_abyssal", kind: "route_reward", rewardId: "verdict_key_zero", tier: 6 },
  { id: "xai_grok_free_signal", kind: "route_reward", rewardId: "verdict_spire_online_route", tier: 6 }
];

const UPGRADE_SEED_RULES = [
  { id: "golden_guardrail", rewardId: "plaza_stabilized", tier: 0 },
  { id: "gemini_beam", rewardId: "lake_coolant_rig", tier: 1 },
  { id: "silkgrid_relay", rewardId: "ceasefire_cache_persistence_seed", tier: 2 },
  { id: "open_herd", rewardId: "prototype_persistence_boundary", tier: 2 },
  { id: "low_latency_dash", rewardId: "transit_permit_zero", tier: 4 },
  { id: "sparse_knife", rewardId: "verdict_key_zero", tier: 6 },
  { id: "cosmic_heckle", rewardId: "verdict_spire_online_route", tier: 6 }
];

const ROLE_PRESSURE_TARGETS = [
  { role: "runner", duties: ["survey", "collect"], expectedClassIds: ["accord_striker", "vector_interceptor"] },
  { role: "cover", duties: ["holdout", "seal"], expectedClassIds: ["bastion_breaker", "moonframe_juggernaut"] },
  { role: "harrier", duties: ["collect", "boss_pressure"], expectedClassIds: ["drone_reaver", "overclock_marauder"] },
  { role: "support", duties: ["survey", "recompile", "seal"], expectedClassIds: ["signal_vanguard", "redline_surgeon"] },
  { role: "control", duties: ["sync", "hazard_read"], expectedClassIds: ["prism_gunner", "rift_saboteur"] },
  { role: "duelist", duties: ["boss_gate", "elite_clear"], expectedClassIds: ["nullbreaker_ronin", "bonecode_executioner"] }
];

export function renownForNodeClear({ baseRenown, previousCompletions }) {
  const safeRenown = Math.max(1, Math.floor(Number(baseRenown) || 1));
  if (previousCompletions <= 0) return safeRenown;
  return Math.max(1, Math.min(3, Math.floor(safeRenown * 0.45)));
}

export function routeRewardIdsFor(nodeId) {
  const node = PARTY_NODES.find((candidate) => candidate.id === nodeId);
  const arena = ONLINE_ARENAS[node?.arenaId ?? nodeId] ?? ONLINE_ARENAS.armistice_plaza;
  const rewardIds = [node?.rewardId ?? arena.rewardId].filter(Boolean);
  if (arena.id === "cooling_lake_nine") rewardIds.push("cooling_lake_online_route");
  if (arena.id === "memory_cache_001") rewardIds.push("prototype_persistence_boundary");
  if (arena.id === "transit_loop_zero") rewardIds.push("transit_loop_online_route");
  if (arena.id === "verdict_spire") rewardIds.push("verdict_spire_online_route");
  return [...new Set(rewardIds)];
}

export function rewardBalanceForNode(nodeId) {
  const node = PARTY_NODES.find((candidate) => candidate.id === nodeId);
  const arena = ONLINE_ARENAS[node?.arenaId ?? nodeId] ?? ONLINE_ARENAS.armistice_plaza;
  const baseRenown = node?.rewardRenown ?? arena.rewardRenown ?? 1;
  return {
    nodeId,
    arenaId: arena.id,
    rewardId: node?.rewardId ?? arena.rewardId,
    rewardName: node?.rewardName ?? arena.rewardName,
    rewardIds: routeRewardIdsFor(nodeId),
    firstClearRenown: renownForNodeClear({ baseRenown, previousCompletions: 0 }),
    repeatClearRenown: renownForNodeClear({ baseRenown, previousCompletions: 1 }),
    campaignTier: node?.campaignTier ?? 0,
    criticalPath: Boolean(node?.campaignCriticalPath),
    onlineSupported: Boolean(node?.onlineSupported),
    unlocks: [...(node?.unlocks ?? [])]
  };
}

export function buildBalanceSnapshot({ completedNodeIds = [], rewardIds = [], partyRenown = 0, partySize = 1, selectedNodeId = "armistice_plaza" } = {}) {
  const rewardSet = new Set(rewardIds);
  const completedSet = new Set(completedNodeIds);
  const rewardMatrix = PARTY_NODES.filter((node) => node.onlineSupported).map((node) => rewardBalanceForNode(node.id));
  const allRewardIds = [...DURABLE_REWARD_IDS];
  const missingDurableRewardIds = allRewardIds.filter((rewardId) => !rewardMatrix.some((entry) => entry.rewardIds.includes(rewardId)));
  return {
    policy: BALANCE_POLICY,
    persistenceBoundary: BALANCE_PERSISTENCE_BOUNDARY,
    xp: {
      policy: "shared_party_xp_coop_vote_balance_1_0",
      thresholds: [...PARTY_XP_THRESHOLDS],
      draftCardCount: 3,
      voteAuthority: "colyseus_room_server_only"
    },
    rewards: {
      policy: "first_clear_full_renown_repeat_clear_capped_catchup",
      partyRenown,
      rewardMatrix,
      durableRewardIds: allRewardIds,
      missingDurableRewardIds,
      expectedCriticalPathRenown: rewardMatrix.filter((entry) => CAMPAIGN_ROUTE.criticalPathNodeIds.includes(entry.nodeId)).reduce((sum, entry) => sum + entry.firstClearRenown, 0),
      completedCriticalPathCount: CAMPAIGN_ROUTE.criticalPathNodeIds.filter((nodeId) => completedSet.has(nodeId)).length
    },
    unlocks: {
      policy: "route_rewards_unlock_classes_factions_and_upgrade_seeds",
      starterClassIds: CLASS_UNLOCK_RULES.filter((rule) => rule.kind === "starter").map((rule) => rule.id),
      starterFactionIds: FACTION_UNLOCK_RULES.filter((rule) => rule.kind === "starter").map((rule) => rule.id),
      classRules: CLASS_UNLOCK_RULES.map((rule) => ({ ...rule, unlocked: rule.kind === "starter" || Boolean(rule.rewardId && rewardSet.has(rule.rewardId)) })),
      factionRules: FACTION_UNLOCK_RULES.map((rule) => ({ ...rule, unlocked: rule.kind === "starter" || Boolean(rule.rewardId && rewardSet.has(rule.rewardId)) })),
      upgradeSeedRules: UPGRADE_SEED_RULES.map((rule) => ({ ...rule, unlocked: Boolean(rule.rewardId && rewardSet.has(rule.rewardId)) }))
    },
    objectives: {
      policy: "objective_required_values_scale_by_route_tier_not_imported_state",
      matrix: PARTY_NODES.filter((node) => node.onlineSupported).map((node) => {
        const set = objectiveSetForRouteNode(node.id, node.arenaId);
        return {
          nodeId: node.id,
          objectiveSetId: set.id,
          campaignTier: node.campaignTier ?? 0,
          instanceCount: set.instances.length,
          requiredTotal: round(set.instances.reduce((sum, instance) => sum + (Number(instance.required) || 0), 0)),
          preferredRoles: [...new Set(set.instances.flatMap((instance) => instance.preferredRoles ?? []))]
        };
      })
    },
    scaling: {
      policy: "solo_local_online_scaling_1_0",
      activePartySize: Math.max(1, Math.min(4, partySize)),
      solo: { enemyBudgetScale: 0.82, revivePressure: "disabled_until_ally_present", rewardScale: 1 },
      localCoop: { enemyBudgetScalePerExtraPlayer: 0.22, objectiveHoldGraceSeconds: 0.6, rewardScale: 1 },
      online: { enemyBudgetScalePerExtraPlayer: 0.26, reconnectGraceSeconds: 45, serverAuthority: true, rewardScale: 1 }
    },
    roles: {
      policy: "role_pressure_and_comind_synergy_targets_1_0",
      targets: ROLE_PRESSURE_TARGETS
    },
    retry: {
      policy: "failure_preserves_route_profile_rewards_only",
      repeatClearRenownCap: 3,
      selectedNodeId,
      completedNodeCount: completedNodeIds.length
    }
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}
