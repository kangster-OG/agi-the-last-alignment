export type OnlineBuildKitRole = "runner" | "cover" | "harrier" | "support" | "control" | "duelist";

export interface OnlineBuildKitSnapshot {
  schemaVersion: 1;
  classId: string;
  factionId: string;
  classRole: OnlineBuildKitRole;
  factionRoleBias: OnlineBuildKitRole[];
  resolvedRole: OnlineBuildKitRole;
  startingWeaponId: string;
  passiveIds: string[];
  partyAuraIds: string[];
  recompileModifiers: {
    radiusBonus: number;
    requiredSecondsScale: number;
    reviveHpBonus: number;
    guardDamageReduction: number;
  };
  rolePressureAffinity: string[];
  synergyId: string;
  effectScopes?: {
    solo: string[];
    localCoop: string[];
    online: string[];
  };
  hookStatus?: Record<string, string>;
}

export interface OnlinePlayerSnapshot {
  sessionId: string;
  playerId?: string;
  slot: number;
  label: string;
  classId: string;
  factionId: string;
  buildKit?: OnlineBuildKitSnapshot;
  weaponId?: string;
  color: number;
  worldX: number;
  worldY: number;
  velocityX: number;
  velocityY: number;
  facing: "south" | "east" | "north" | "west";
  hp: number;
  maxHp: number;
  xp?: number;
  level?: number;
  ready?: boolean;
  votedNodeId?: string;
  connectionState?: "connected" | "disconnected";
  connected?: boolean;
  reconnectCount?: number;
  disconnectedFor?: number;
  downed?: boolean;
  reviveProgress?: number;
  reviveRequired?: number;
  revivedCount?: number;
  inputSequence: number;
}

export interface OnlineEnemySnapshot {
  id: number;
  familyId: string;
  sourceRegionId: string;
  worldX: number;
  worldY: number;
  hp: number;
  boss: boolean;
  color: number;
}

export interface OnlineDialogueSnippetSnapshot {
  id: string;
  proofId: string;
  speaker: string;
  line: string;
  trigger:
    | "briefing"
    | "unsupported_node"
    | "interaction_complete"
    | "boss_arrival"
    | "boss_low_hp"
    | "boss_seal"
    | "cache_decode"
    | "persistence_boundary"
    | "route_reward"
    | "boss_defeated"
    | "route_capstone";
}

export interface OnlineDialoguePresentationSnapshot {
  policy: "campaign_dialogue_runtime_snapshot_only_v1";
  persistenceBoundary: "route_profile_only_no_dialogue_or_live_state";
  nodeId: string;
  arenaId: string;
  contentArenaId: string;
  briefing: OnlineDialogueSnippetSnapshot[];
  bossArrival: OnlineDialogueSnippetSnapshot[];
  interactionComplete: OnlineDialogueSnippetSnapshot[];
  routeSummary: OnlineDialogueSnippetSnapshot[];
  activeSnippetIds: string[];
}

export interface OnlineRunDialogueSummary {
  policy: "campaign_dialogue_runtime_snapshot_only_v1";
  persistenceBoundary: "route_profile_only_no_dialogue_or_live_state";
  nodeId: string;
  arenaId: string;
  snippets: OnlineDialogueSnippetSnapshot[];
}

export interface OnlineConsensusSnapshot {
  schemaVersion: 1 | 2 | 3 | 4;
  roomId: string;
  arenaId: string;
  mapId: string;
  tick: number;
  seconds: number;
  targetSeconds?: number;
  runPhase?: OnlineRunPhase;
  phaseChangedAt?: number;
  maxClients: number;
  playerCount: number;
  connectedCount?: number;
  networkAuthority?: "colyseus_room" | "colyseus_room_server_combat";
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  players: OnlinePlayerSnapshot[];
  enemies: OnlineEnemySnapshot[];
  projectiles?: OnlineProjectileSnapshot[];
  pickups?: OnlinePickupSnapshot[];
  campaignContent?: OnlineCampaignContentNodeSnapshot | null;
  dialogue?: OnlineDialoguePresentationSnapshot | null;
  bossEvent?: OnlineBossEventSnapshot;
  combat?: {
    kills: number;
    collectedPickups: number;
    authoritativeProjectiles: number;
    authoritativePickups: number;
    bossGateMechanic?: string;
  };
  regionEvent?: OnlineRegionEventSnapshot;
  objectives?: OnlineObjectivesSnapshot;
  rolePressure?: OnlineRolePressureSnapshot;
  recompile?: OnlineRecompileSnapshot;
  progression?: OnlineProgressionSnapshot;
  lifecycle?: OnlineLifecycleSnapshot;
  reconnect?: OnlineReconnectSnapshot;
  rewards?: OnlineRewardsSnapshot;
  persistence?: OnlinePersistenceSnapshot;
  summary?: OnlineRunSummary | null;
  party?: OnlinePartySnapshot;
  combatArt: {
    pressure: number;
    phase: "opening" | "horde" | "boss_warning" | "boss_active";
    projectileCount: number;
    pickupCount: number;
    bossEventActive: boolean;
  };
}

export interface OnlineLifecycleSnapshot {
  schemaBacked: boolean;
  schemaVersion: number;
  stateClass: "ConsensusCellState";
  collectionKinds: string[];
  playerPresenceCount: number;
  upgradeVoteCount: number;
  recompileDownedCount: number;
  connectedCount: number;
  disconnectedCount: number;
  completedNodeCount: number;
  unlockedNodeCount: number;
}

export interface OnlineReconnectSnapshot {
  policy: "session_storage_reconnect_key_slot_reclaim";
  slotTtlSeconds: number;
  connectedCount: number;
  disconnectedCount: number;
  reclaimedPlayerCount: number;
  disconnectedPlayerIds: string[];
}

export interface OnlineRegionEventSnapshot {
  arenaId: string;
  regionLabel: string;
  eventFamily: string;
  mechanicId?: string;
  readabilityPolicy?: string;
  redactionPressure?: {
    policy: string;
    xpStolen: number;
    theftTicks: number;
    theftCooldown: number;
    uiCorruptionPolicy: string;
    persistenceBoundary: string;
  } | null;
  eventCounter: number;
  active: boolean;
  hazardZones: Array<{
    id: number;
    familyId: string;
    label: string;
    worldX: number;
    worldY: number;
    radius: number;
    expiresIn: number;
    damagePerSecond: number;
  }>;
}

export interface OnlineObjectivesSnapshot {
  policy: "server_authoritative_arena_objectives_v1";
  arenaId: string;
  nodeId?: string;
  objectiveSetId: string;
  label: string;
  phase: "inactive" | "intro" | "active" | "boss_gate" | "completed" | "failed";
  currentObjectiveId: string | null;
  currentGroupId?: string | null;
  hint: string;
  completedObjectiveIds: string[];
  failedObjectiveIds: string[];
  completionReason?: string;
  instances: Array<{
    id: string;
    groupId?: string;
    type: "survey" | "holdout" | "collect" | "seal" | "sync";
    label: string;
    worldX: number;
    worldY: number;
    radius: number;
    active: boolean;
    complete: boolean;
    progress: number;
    required: number;
    heldBySessionIds?: string[];
    heldByLabels?: string[];
    heldByRoles?: OnlineBuildKitRole[];
    preferredRoles?: OnlineBuildKitRole[];
    roleMatched?: boolean;
    roleAssistMultiplier?: number;
    runtimeArtId?: string | null;
    routeFlavor?: string;
    runtimeArtReady?: boolean;
    runtimeArtPolicy?: "requires_cleaned_or_production_manifest_asset";
    itemId?: string | null;
    collected?: number;
  }>;
}

export interface OnlineRolePressureSnapshot {
  policy: "split_hold_regroup_recompile_v1";
  arenaId: string;
  active: boolean;
  phase: "inactive" | "split" | "split_hold" | "regroup";
  requiredAnchors: number;
  heldAnchorCount: number;
  splitHoldSeconds: number;
  splitRequiredSeconds: number;
  completedSplitHolds: number;
  regroupExpiresIn: number;
  recompileRadius: number;
  baseRecompileRadius: number;
  recompileRequiredSeconds: number;
  baseRecompileRequiredSeconds: number;
  recompileSpeedMultiplier: number;
  anchors: Array<{
    id: string;
    label: string;
    role: string;
    worldX: number;
    worldY: number;
    radius: number;
    heldBySessionId: string | null;
    heldByLabel: string | null;
    heldSeconds: number;
    requiredSeconds: number;
    complete: boolean;
  }>;
  playerRoles: Array<{
    sessionId: string;
    label: string;
    classId: string;
    factionId: string;
    role: string;
    downed: boolean;
    connected: boolean;
  }>;
}

export interface OnlineRewardsSnapshot {
  policy: "node_completion_renown_and_party_unlocks";
  partyRenown: number;
  rewardIds: string[];
  lastReward: null | {
    nodeId: string;
    arenaId: string;
    rewardId: string;
    rewardName: string;
    firstClear: boolean;
    renownGained: number;
    partyRenown: number;
    reason: string;
  };
  nodeCompletionCounts: Record<string, number>;
  recommendedNodeId: string;
}

export interface OnlinePersistenceSnapshot {
  policy: "prototype_local_storage_export_v1";
  storageKey: "agi:last_alignment:online_progression:v1";
  exportVersion: 1;
  exportable: boolean;
  importApplied: boolean;
  importStatus?: "none" | "invalid_profile" | "empty_profile" | "applied_sanitized_route_profile";
  importedSaveHash?: string;
  importedCompletedNodeCount?: number;
  importedRewardCount?: number;
  importedRouteDepth?: number;
  ignoredImportedFieldCount?: number;
  importedSummary: null | {
    saveHash: string;
    completedNodeCount: number;
    rewardCount: number;
  };
  profile: {
    completedNodeIds: string[];
    unlockedNodeIds: string[];
    rewardIds: string[];
    partyRenown: number;
    nodeCompletionCounts: Record<string, number>;
    recommendedNodeId: string;
    routeDepth: number;
    savedAtTick: number;
  };
  saveHash: string;
  currentExportHash?: string;
  durableFieldPolicy?: "route_profile_only_no_combat_state";
}

export type OnlineRunPhase = "joining" | "lobby" | "active" | "completed" | "failed" | "returning" | "left";

export interface OnlineUpgradeCardSnapshot {
  id: string;
  name: string;
  source: "general" | "faction" | "class" | "coop" | "evolution";
  description: string;
}

export interface OnlineProgressionSnapshot {
  policy: "shared_party_xp_manual_choice" | "shared_party_xp_coop_vote";
  partyXp: number;
  partyLevel: number;
  nextLevelXp: number | null;
  upgradePending: {
    id: string;
    level: number;
    readyAt: number;
    policy: "shared_party_xp_manual_choice" | "shared_party_xp_coop_vote";
    cards: OnlineUpgradeCardSnapshot[];
    votes?: Array<{
      sessionId: string;
      label: string;
      upgradeId: string;
      votedAt: number;
    }>;
    voteCounts?: Record<string, number>;
    requiredVotes?: number;
    eligibleVoterIds?: string[];
    leadingCardId?: string | null;
  } | null;
  chosenUpgrades: string[];
}

export interface OnlineRecompileSnapshot {
  policy: "recompile_ally_hold_radius";
  radius: number;
  baseRadius?: number;
  requiredSeconds: number;
  baseRequiredSeconds?: number;
  rolePressureAccelerated?: boolean;
  speedMultiplier?: number;
  kitModifiers?: {
    radiusBonus: number;
    requiredSecondsScale: number;
    reviveHpBonus: number;
    guardDamageReduction: number;
    sourceLabels: string[];
  };
  active: boolean;
  downedPlayers: Array<{
    sessionId: string;
    label: string;
    progress: number;
    required: number;
    percent: number;
    nearestAllySessionId: string | null;
    nearestAllyLabel: string | null;
    nearestAllyDistance: number | null;
    inRange: boolean;
    state: "awaiting_ally" | "recompiling";
  }>;
}

export interface OnlineRunSummary {
  outcome?: "completed" | "failed";
  reason?: string;
  title?: string;
  subtitle?: string;
  nodeId?: string;
  arenaId?: string;
  seconds?: number;
  kills?: number;
  collectedPickups?: number;
  partyXp?: number;
  partyLevel?: number;
  chosenUpgrades?: string[];
  revivedPlayers?: number;
  lastUpgrade?: string;
  lastUpgradeChosenBy?: string;
  lastUpgradePolicy?: string;
  rewards?: OnlineRewardsSnapshot["lastReward"];
  dialogue?: OnlineRunDialogueSummary;
  objectives?: OnlineObjectivesSnapshot;
  rolePressure?: {
    policy: "split_hold_regroup_recompile_v1";
    splitHolds: number;
    regroupActive: boolean;
  };
}

export interface OnlinePartySnapshot {
  location: "alignment_grid";
  mapId: string;
  mapLabel: string;
  campaign?: {
    routeVersion: "campaign_route_v1";
    actLabel: string;
    regionLabel: string;
    criticalPathNodeIds: string[];
    branchNodeIds: string[];
    finaleNodeId: string;
    campaignNodeCount: number;
    supportedCampaignNodeCount: number;
    contentSchema?: {
      policy: "campaign_content_schema_v1";
      arenaRecordCount: number;
      routeNodeCount: number;
      bossRecordCount: number;
      enemyFamilyRecordCount: number;
      rewardRecordCount: number;
      dialogueSnippetCount: number;
      missingNodeContentIds: string[];
      missingRewardIds: string[];
      missingBossIds: string[];
      missingEnemyFamilyIds: string[];
      missingDialogueSnippetIds: string[];
      dialoguePresentationPolicy?: "campaign_dialogue_runtime_snapshot_only_v1";
      dialoguePersistenceBoundary?: "route_profile_only_no_dialogue_or_live_state";
      complete: boolean;
    };
  };
  selectedNodeId: string;
  selectedNodeName: string;
  launchNodeId: string;
  activeNodeId: string;
  votePolicy: "all_ready_launches_majority_supported_node";
  votes: Array<{
    sessionId: string;
    playerId?: string;
    label: string;
    nodeId: string;
    ready: boolean;
    connectionState?: "connected" | "disconnected";
  }>;
  voteCounts: Record<string, number>;
  completedNodeIds: string[];
  unlockedNodeIds: string[];
  availableNodeIds: string[];
  launchableNodeIds: string[];
  nodes: Array<{
    id: string;
    name: string;
    nodeType: string;
    arenaId: string;
    objectiveSetId?: string;
    objectiveFlavor?: string;
    contentArenaId?: string;
    contentStatus?: string;
    runtimeArenaId?: string;
    regionId?: string;
    regionProofId?: string;
    bossId?: string;
    bossProofId?: string;
    enemyFamilyIds?: string[];
    enemyProofIds?: string[];
    rewardId?: string;
    rewardProofId?: string;
    dialogueSnippetIds?: string[];
    dialogueProofIds?: string[];
    dialogueSnippets?: OnlineDialogueSnippetSnapshot[];
    proofId?: string;
    routeBiome?: string;
    campaignAct?: number;
    campaignTier?: number;
    campaignCriticalPath?: boolean;
    worldX: number;
    worldY: number;
    unlocked: boolean;
    completed: boolean;
    onlineSupported: boolean;
  }>;
  routes: Array<{
    id: string;
    from: string;
    to: string;
    state: "stable" | "unstable" | "locked";
  }>;
  rewards?: OnlineRewardsSnapshot;
  persistence?: OnlinePersistenceSnapshot;
}

export interface OnlineCampaignContentNodeSnapshot {
  policy: "campaign_content_schema_v1";
  proofId: string;
  contentArenaId: string;
  nodeId: string;
  runtimeArenaId: string;
  contentStatus: string;
  regionId: string;
  regionProofId: string;
  bossId: string;
  bossProofId: string;
  enemyFamilyIds: string[];
  enemyProofIds: string[];
  rewardId: string;
  rewardProofId: string;
  objectiveSetId: string;
  dialogueSnippetIds: string[];
  dialogueProofIds: string[];
  dialogueSnippets: OnlineDialogueSnippetSnapshot[];
  unlockNodeIds: string[];
}

export interface OnlineProjectileSnapshot {
  id: number;
  ownerSessionId: string;
  worldX: number;
  worldY: number;
  velocityX: number;
  velocityY: number;
  life: number;
  label: string;
}

export interface OnlinePickupSnapshot {
  id: number;
  worldX: number;
  worldY: number;
  value: number;
  objectiveItemId?: string | null;
  objectiveLabel?: string | null;
}

export interface OnlineBossEventSnapshot {
  bossSpawned: boolean;
  bossDefeated: boolean;
  bossIntroSeen: boolean;
  eventCounter: number;
  brokenPromiseZones: Array<{
    id: number;
    worldX: number;
    worldY: number;
    radius: number;
    expiresIn: number;
    label: string;
  }>;
  activeTreatyCharge: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    impactIn: number;
    resolved: boolean;
  } | null;
}
