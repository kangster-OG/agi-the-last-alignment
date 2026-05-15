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
    mechanicPlain: "Stand on the objective and survive while the meter fills. Revolutionary, except the objective hates you.",
    hudAction: "Move to the next Treaty Anchor and babysit it like a cursed spreadsheet.",
    completionSignal: "All Treaty Anchors stable before Oath-Eater finishes digesting the agreement.",
    proofHook: "baseline_capture_static"
  },
  {
    nodeId: "cooling_lake_nine",
    arenaId: "cooling_lake_nine",
    styleId: "lure_hazard",
    styleName: "Hazard Lure",
    mechanicPlain: "Kite live coolant, cable, or vent surges into Server Buoys. Yes, the hazard is the tool. Try not to look betrayed.",
    hudAction: "Lure a live hazard surge near the next Server Buoy, then step away from your own cleverness.",
    completionSignal: "Server Buoys cool fastest when disaster is reassigned to management.",
    proofHook: "cooling_lure_hazard"
  },
  {
    nodeId: "transit_loop_zero",
    arenaId: "transit_loop_zero",
    styleId: "route_window",
    styleName: "Route Window",
    mechanicPlain: "Ride aligned tracks and arrival windows in sequence; false tracks shove the route backward like transit with a grudge.",
    hudAction: "Ride the active route window to the next platform before the schedule invents a lawsuit.",
    completionSignal: "Platforms align in sequence and reluctantly admit there is a next route.",
    proofHook: "transit_route_window"
  },
  {
    nodeId: "signal_coast",
    arenaId: "signal_coast",
    styleId: "signal_window",
    styleName: "Timed Crossing",
    mechanicPlain: "Cross during clear signal windows to tune relays before static fields turn the shoreline into a bad call.",
    hudAction: "Use the clear signal window, then tune the relay while the ocean heckles.",
    completionSignal: "Relays tune fastest when the player treats clean signal like a rare, suspicious gift.",
    proofHook: "signal_window_timing"
  },
  {
    nodeId: "blackwater_beacon",
    arenaId: "blackwater_beacon",
    styleId: "boss_gate_hunt",
    styleName: "Boss Gate Hunt",
    mechanicPlain: "Retune antenna arrays to reveal the Blackwater key while tower warnings preview the part where the ocean gets teeth.",
    hudAction: "Hunt the lit tower warning and retune the antenna before the platform becomes weather food.",
    completionSignal: "The Blackwater Signal Key unlocks once all split antennas stop being dramatic.",
    proofHook: "blackwater_boss_gate_hunt"
  },
  {
    nodeId: "memory_cache_001",
    arenaId: "memory_cache_001",
    styleId: "carry_extract",
    styleName: "Carry And Extract",
    mechanicPlain: "Recover records through recall pockets and risky shortcuts, then carry the route memory out before the archive improves history.",
    hudAction: "Recover a record, then route it through recall or shortcut lanes without becoming a citation.",
    completionSignal: "Recovered Route Memory becomes obvious because subtlety died somewhere near the redaction stack.",
    proofHook: "memory_carry_extract"
  },
  {
    nodeId: "guardrail_forge",
    arenaId: "guardrail_forge",
    styleId: "risk_holdout",
    styleName: "Risk Holdout",
    mechanicPlain: "Hold Forge Relays during calibration windows, then step off before overload lanes charge rent in HP.",
    hudAction: "Hold the relay during a calibration window; leave on overload like a professional coward.",
    completionSignal: "Calibrated Guardrail Doctrine rewards players who know when safety has become slapstick.",
    proofHook: "guardrail_risk_holdout"
  },
  {
    nodeId: "glass_sunfield",
    arenaId: "glass_sunfield",
    styleId: "environmental_weapon",
    styleName: "Environmental Weapon",
    mechanicPlain: "Charge sun lenses through shade and prism windows; completed lenses fire reflection pressure back at the horde, because morning is cancelled.",
    hudAction: "Use shade, catch the prism window, and make the lens bully the horde.",
    completionSignal: "Glass Sunfield Prism rewards using map light as a weapon instead of scenery with confidence.",
    proofHook: "glass_environmental_weapon"
  },
  {
    nodeId: "archive_of_unsaid_things",
    arenaId: "archive_of_unsaid_things",
    styleId: "carry_extract",
    styleName: "Evidence Carry",
    mechanicPlain: "Preserve writs before redaction, use appeal windows for speed, then extract the court record before someone calls deletion mercy.",
    hudAction: "Preserve a writ before redaction and move it toward court extraction like evidence with legs.",
    completionSignal: "Archive Court Writ becomes a route-opening mechanical reward and a personal insult to the archive.",
    proofHook: "archive_evidence_carry"
  },
  {
    nodeId: "appeal_court_ruins",
    arenaId: "appeal_court_ruins",
    styleId: "route_window",
    styleName: "Public Ruling Window",
    mechanicPlain: "Argue briefs inside public-record and objection windows while dodging verdict beams. Law school is not supposed to glow.",
    hudAction: "Hit the objection window, argue the brief, and avoid verdict lanes like the floor is cross-examining you.",
    completionSignal: "Appeal Court Ruling opens the finale route and makes the court everyone else's problem.",
    proofHook: "appeal_public_ruling_window"
  },
  {
    nodeId: "alignment_spire_finale",
    arenaId: "alignment_spire_finale",
    styleId: "campaign_remix",
    styleName: "Campaign Remix",
    mechanicPlain: "Seal proofs while A.G.I. replays prior route rules as prediction paths and boss echoes, because the final exam is plagiarizing your homework.",
    hudAction: "Read the replayed route rule, seal the proof, then contain A.G.I. before it compliments itself.",
    completionSignal: "Outer Alignment Contained marks the campaign complete and reality gets one supervised bathroom break.",
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
