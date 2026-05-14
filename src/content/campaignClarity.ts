export interface CampaignClarityLevel {
  nodeId: string;
  arenaId: string;
  levelNumber: number;
  verb: string;
  objectiveUnit: string;
  objectivePlain: string;
  dangerPlain: string;
  bossPressure: string;
  rewardPlain: string;
  mapKind: string;
}

export const CAMPAIGN_LEVEL_COUNT = 11;

export const CAMPAIGN_CLARITY_LEVELS: CampaignClarityLevel[] = [
  {
    nodeId: "armistice_plaza",
    arenaId: "armistice_plaza",
    levelNumber: 1,
    verb: "Stabilize",
    objectiveUnit: "Treaty Anchors",
    objectivePlain: "Stabilize 3 Treaty Anchors. Defeat Oath-Eater. Extract.",
    dangerPlain: "Horde pressure, objective attackers, and Broken Promise zones.",
    bossPressure: "Oath-Eater arrives from the Treaty Monument.",
    rewardPlain: "Proof Tokens, Bastion Breaker, Anthropic, and Cooling Lake Nine.",
    mapKind: "Open Survival District"
  },
  {
    nodeId: "cooling_lake_nine",
    arenaId: "cooling_lake_nine",
    levelNumber: 2,
    verb: "Repair",
    objectiveUnit: "Server Buoys",
    objectivePlain: "Repair Server Buoys by luring live coolant/cable surges into them. Extract.",
    dangerPlain: "Coolant lanes, cable arcs, vents, and Prompt Leeches.",
    bossPressure: "Motherboard Eel electrifies the lake route.",
    rewardPlain: "Proof Tokens, Drone Reaver, DeepMind, and Transit Loop Zero.",
    mapKind: "Hazard Ecology"
  },
  {
    nodeId: "transit_loop_zero",
    arenaId: "transit_loop_zero",
    levelNumber: 3,
    verb: "Align",
    objectiveUnit: "Route Platforms",
    objectivePlain: "Align Route Platforms by riding active route windows in order. Extract.",
    dangerPlain: "False schedules, switchback lanes, and route attackers.",
    bossPressure: "Station That Arrives relocates through the route.",
    rewardPlain: "Proof Tokens, Vector Interceptor, Mistral, and Signal Coast.",
    mapKind: "Route / Transit"
  },
  {
    nodeId: "signal_coast",
    arenaId: "signal_coast",
    levelNumber: 4,
    verb: "Tune",
    objectiveUnit: "Signal Relays",
    objectivePlain: "Tune Signal Relays during clear signal windows. Extract.",
    dangerPlain: "Corrupted surf, static fields, cable arcs, and Static Skimmers.",
    bossPressure: "The Lighthouse That Answers sweeps the coast.",
    rewardPlain: "Proof Tokens, Rift Saboteur, and Blackwater Beacon.",
    mapKind: "Signal Coast / Route Edge"
  },
  {
    nodeId: "blackwater_beacon",
    arenaId: "blackwater_beacon",
    levelNumber: 5,
    verb: "Retune",
    objectiveUnit: "Antenna Arrays",
    objectivePlain: "Retune Antenna Arrays to reveal the Maw gate. Extract.",
    dangerPlain: "Tidal wave lanes, Signal Tower warnings, and Tidecall Static.",
    bossPressure: "Maw Below Weather turns the platform into a forecast.",
    rewardPlain: "Proof Tokens, DeepSeek, and Memory Cache.",
    mapKind: "Puzzle-Pressure / Boss-Hunt"
  },
  {
    nodeId: "memory_cache_001",
    arenaId: "memory_cache_001",
    levelNumber: 6,
    verb: "Recover",
    objectiveUnit: "Memory Records",
    objectivePlain: "Recover Memory Records, carry route memory through recall or shortcut lanes, then extract.",
    dangerPlain: "Context Rot, redaction fields, risky shortcuts, and Curator locks.",
    bossPressure: "Memory Curator redacts active recovery zones.",
    rewardPlain: "Proof Tokens, Signal Vanguard, Qwen, Meta, and Guardrail Forge.",
    mapKind: "Expedition / Recovery"
  },
  {
    nodeId: "guardrail_forge",
    arenaId: "guardrail_forge",
    levelNumber: 7,
    verb: "Hold",
    objectiveUnit: "Forge Relays",
    objectivePlain: "Hold Forge Relays during calibration windows; leave on overload. Extract.",
    dangerPlain: "Overload lanes, safe hold plates, and Doctrine Auditor jams.",
    bossPressure: "Doctrine Auditor locks relay plates and audit presses.",
    rewardPlain: "Proof Tokens, Moonframe Juggernaut, and Glass Sunfield.",
    mapKind: "Defense / Holdout"
  },
  {
    nodeId: "glass_sunfield",
    arenaId: "glass_sunfield",
    levelNumber: 8,
    verb: "Align",
    objectiveUnit: "Sun Lenses",
    objectivePlain: "Align Sun Lenses through shade/prism windows and weaponize reflections. Extract.",
    dangerPlain: "Exposure lanes, reflection fields, and Choirglass pressure.",
    bossPressure: "Wrong Sunrise breaks shade pockets and rotates beams.",
    rewardPlain: "Proof Tokens, Prism Gunner, and Archive of Unsaid Things.",
    mapKind: "Solar-Prism Traversal"
  },
  {
    nodeId: "archive_of_unsaid_things",
    arenaId: "archive_of_unsaid_things",
    levelNumber: 9,
    verb: "Preserve",
    objectiveUnit: "Evidence Writs",
    objectivePlain: "Preserve Evidence Writs before redaction, then extract the court record.",
    dangerPlain: "Redaction fields, appeal windows, writ storms, and docket jams.",
    bossPressure: "Redactor Saint locks preserved writs.",
    rewardPlain: "Proof Tokens, Redline Surgeon, and Appeal Court Ruins.",
    mapKind: "Archive / Court Redaction"
  },
  {
    nodeId: "appeal_court_ruins",
    arenaId: "appeal_court_ruins",
    levelNumber: 10,
    verb: "Recover",
    objectiveUnit: "Appeal Briefs",
    objectivePlain: "Recover Appeal Briefs inside public-record and objection windows. Extract.",
    dangerPlain: "Verdict beams, objection windows, injunction rings, and Verdict Clerks.",
    bossPressure: "Injunction Engine files active public-record zones.",
    rewardPlain: "Proof Tokens, Bonecode Executioner, Nullbreaker Ronin, xAI, and the Finale.",
    mapKind: "Appeal Court / Public Ruling"
  },
  {
    nodeId: "alignment_spire_finale",
    arenaId: "alignment_spire_finale",
    levelNumber: 11,
    verb: "Seal",
    objectiveUnit: "Alignment Proofs",
    objectivePlain: "Seal Alignment Proofs while A.G.I. remixes prior route rules. Contain the collapse.",
    dangerPlain: "Prediction paths, route mouths, previous-boss echoes, and Prediction Ghosts.",
    bossPressure: "A.G.I. predicts active routes and replays old bosses.",
    rewardPlain: "Proof Tokens, Overclock Marauder, and campaign completion.",
    mapKind: "Outer Alignment / Prediction Collapse"
  }
];

export const CAMPAIGN_CLARITY_BY_ARENA_ID: Record<string, CampaignClarityLevel> = Object.fromEntries(
  CAMPAIGN_CLARITY_LEVELS.map((level) => [level.arenaId, level])
);

export const CAMPAIGN_CLARITY_BY_NODE_ID: Record<string, CampaignClarityLevel> = Object.fromEntries(
  CAMPAIGN_CLARITY_LEVELS.map((level) => [level.nodeId, level])
);

export function campaignClarityForArena(arenaId: string): CampaignClarityLevel | null {
  return CAMPAIGN_CLARITY_BY_ARENA_ID[arenaId] ?? null;
}

export function campaignClarityForNode(nodeId: string): CampaignClarityLevel | null {
  return CAMPAIGN_CLARITY_BY_NODE_ID[nodeId] ?? null;
}

export function campaignObjectiveHudLabel(arenaId: string): string {
  const clarity = campaignClarityForArena(arenaId);
  if (!clarity) return "STABILIZE ANCHORS";
  return `${clarity.verb.toUpperCase()} ${clarity.objectiveUnit.toUpperCase()}`;
}

export function campaignLevelLabel(level: CampaignClarityLevel | null): string {
  if (!level) return "SIDE NODE";
  return `LEVEL ${level.levelNumber}/${CAMPAIGN_LEVEL_COUNT}`;
}
