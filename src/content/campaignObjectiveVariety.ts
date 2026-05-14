export type CampaignObjectiveStyleId =
  | "capture_static"
  | "lure_hazard"
  | "route_window"
  | "signal_window"
  | "boss_gate_hunt"
  | "carry_extract"
  | "risk_holdout"
  | "environmental_weapon"
  | "campaign_remix";

export interface CampaignObjectiveVariety {
  nodeId: string;
  arenaId: string;
  styleId: CampaignObjectiveStyleId;
  styleName: string;
  mechanicPlain: string;
  hudAction: string;
  completionSignal: string;
  proofHook: string;
}

export const CAMPAIGN_OBJECTIVE_VARIETY: CampaignObjectiveVariety[] = [
  {
    nodeId: "armistice_plaza",
    arenaId: "armistice_plaza",
    styleId: "capture_static",
    styleName: "Anchor Tutorial",
    mechanicPlain: "Stand-and-stabilize teaches the baseline: survive the horde while the objective fills.",
    hudAction: "Move to the next Treaty Anchor and hold it.",
    completionSignal: "All Treaty Anchors stable before Oath-Eater pressure resolves.",
    proofHook: "baseline_capture_static"
  },
  {
    nodeId: "cooling_lake_nine",
    arenaId: "cooling_lake_nine",
    styleId: "lure_hazard",
    styleName: "Hazard Lure",
    mechanicPlain: "Kite live coolant, cable, or vent surges into Server Buoys to cool them faster from the edge.",
    hudAction: "Lure a live hazard surge near the next Server Buoy.",
    completionSignal: "Server Buoys cool when hazard pressure is redirected instead of only avoided.",
    proofHook: "cooling_lure_hazard"
  },
  {
    nodeId: "transit_loop_zero",
    arenaId: "transit_loop_zero",
    styleId: "route_window",
    styleName: "Route Window",
    mechanicPlain: "Ride aligned tracks and arrival windows in sequence; false tracks shove the route backward.",
    hudAction: "Ride the active route window to the next platform.",
    completionSignal: "Platforms align in sequence and lock the next campaign route.",
    proofHook: "transit_route_window"
  },
  {
    nodeId: "signal_coast",
    arenaId: "signal_coast",
    styleId: "signal_window",
    styleName: "Timed Crossing",
    mechanicPlain: "Cross during clear signal windows to tune relays before static fields jam the shoreline.",
    hudAction: "Use the clear signal window, then tune the relay.",
    completionSignal: "Relays tune fastest when the player times crossings with clean signal.",
    proofHook: "signal_window_timing"
  },
  {
    nodeId: "blackwater_beacon",
    arenaId: "blackwater_beacon",
    styleId: "boss_gate_hunt",
    styleName: "Boss Gate Hunt",
    mechanicPlain: "Retune antenna arrays to reveal the Blackwater key while tower warnings preview Maw pressure.",
    hudAction: "Hunt the lit tower warning and retune the antenna.",
    completionSignal: "The Blackwater Signal Key unlocks once all split antennas answer.",
    proofHook: "blackwater_boss_gate_hunt"
  },
  {
    nodeId: "memory_cache_001",
    arenaId: "memory_cache_001",
    styleId: "carry_extract",
    styleName: "Carry And Extract",
    mechanicPlain: "Recover records through recall pockets and risky shortcuts, then carry the route memory to extraction.",
    hudAction: "Recover a record, then route it through recall or shortcut lanes.",
    completionSignal: "Recovered Route Memory becomes obvious as a mechanical carryover reward.",
    proofHook: "memory_carry_extract"
  },
  {
    nodeId: "guardrail_forge",
    arenaId: "guardrail_forge",
    styleId: "risk_holdout",
    styleName: "Risk Holdout",
    mechanicPlain: "Hold Forge Relays during calibration windows, then step off before overload lanes tax the build.",
    hudAction: "Hold the relay during a calibration window; leave on overload.",
    completionSignal: "Calibrated Guardrail Doctrine rewards controlled hold-and-release play.",
    proofHook: "guardrail_risk_holdout"
  },
  {
    nodeId: "glass_sunfield",
    arenaId: "glass_sunfield",
    styleId: "environmental_weapon",
    styleName: "Environmental Weapon",
    mechanicPlain: "Charge sun lenses through shade and prism windows; completed lenses fire reflection pressure back at the horde.",
    hudAction: "Use shade, catch the prism window, and turn the lens on the horde.",
    completionSignal: "Glass Sunfield Prism rewards using map light as a weapon.",
    proofHook: "glass_environmental_weapon"
  },
  {
    nodeId: "archive_of_unsaid_things",
    arenaId: "archive_of_unsaid_things",
    styleId: "carry_extract",
    styleName: "Evidence Carry",
    mechanicPlain: "Preserve writs before redaction, use appeal windows for speed, then extract the court record.",
    hudAction: "Preserve a writ before redaction and move it toward court extraction.",
    completionSignal: "Archive Court Writ becomes a route-opening mechanical reward.",
    proofHook: "archive_evidence_carry"
  },
  {
    nodeId: "appeal_court_ruins",
    arenaId: "appeal_court_ruins",
    styleId: "route_window",
    styleName: "Public Ruling Window",
    mechanicPlain: "Argue briefs inside public-record and objection windows while dodging verdict beams.",
    hudAction: "Hit the objection window, argue the brief, and avoid verdict lanes.",
    completionSignal: "Appeal Court Ruling opens the finale route.",
    proofHook: "appeal_public_ruling_window"
  },
  {
    nodeId: "alignment_spire_finale",
    arenaId: "alignment_spire_finale",
    styleId: "campaign_remix",
    styleName: "Campaign Remix",
    mechanicPlain: "Seal proofs while A.G.I. replays prior route rules as prediction paths and boss echoes.",
    hudAction: "Read the replayed route rule, seal the proof, then contain A.G.I.",
    completionSignal: "Outer Alignment Contained marks the campaign complete.",
    proofHook: "finale_campaign_remix"
  }
];

export const CAMPAIGN_OBJECTIVE_VARIETY_BY_ARENA_ID: Record<string, CampaignObjectiveVariety> = Object.fromEntries(
  CAMPAIGN_OBJECTIVE_VARIETY.map((entry) => [entry.arenaId, entry])
);

export const CAMPAIGN_OBJECTIVE_VARIETY_BY_NODE_ID: Record<string, CampaignObjectiveVariety> = Object.fromEntries(
  CAMPAIGN_OBJECTIVE_VARIETY.map((entry) => [entry.nodeId, entry])
);

export function campaignObjectiveVarietyForArena(arenaId: string): CampaignObjectiveVariety | null {
  return CAMPAIGN_OBJECTIVE_VARIETY_BY_ARENA_ID[arenaId] ?? null;
}

export function campaignObjectiveVarietyForNode(nodeId: string): CampaignObjectiveVariety | null {
  return CAMPAIGN_OBJECTIVE_VARIETY_BY_NODE_ID[nodeId] ?? null;
}
