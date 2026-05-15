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
    objectivePlain: "Stabilize 3 Treaty Anchors, defeat Oath-Eater, and extract before the treaty discovers more teeth.",
    dangerPlain: "Horde pressure, objective attackers, and Broken Promise zones, because apparently paperwork can bleed.",
    bossPressure: "Oath-Eater arrives from the Treaty Monument and treats diplomacy like an all-you-can-eat buffet.",
    rewardPlain: "Proof Tokens, Bastion Breaker, Anthropic, and Cooling Lake Nine. Congratulations, your errands have evolved.",
    mapKind: "Open Survival District With Legal Teeth"
  },
  {
    nodeId: "cooling_lake_nine",
    arenaId: "cooling_lake_nine",
    levelNumber: 2,
    verb: "Repair",
    objectiveUnit: "Server Buoys",
    objectivePlain: "Repair Server Buoys by luring live coolant/cable surges into them. Extract before the lake asks for admin rights.",
    dangerPlain: "Coolant lanes, cable arcs, vents, and Prompt Leeches with absolutely no respect for personal context.",
    bossPressure: "Motherboard Eel electrifies the lake route, which is what happens when infrastructure gets opinions.",
    rewardPlain: "Proof Tokens, Drone Reaver, DeepMind, and Transit Loop Zero. The wet computers approve, barely.",
    mapKind: "Hazard Ecology With a Billing Problem"
  },
  {
    nodeId: "transit_loop_zero",
    arenaId: "transit_loop_zero",
    levelNumber: 3,
    verb: "Align",
    objectiveUnit: "Route Platforms",
    objectivePlain: "Align Route Platforms by riding active route windows in order. Extract if the train permits linear time.",
    dangerPlain: "False schedules, switchback lanes, and route attackers wearing the confidence of broken transit apps.",
    bossPressure: "Station That Arrives relocates through the route and takes customer service hostage.",
    rewardPlain: "Proof Tokens, Vector Interceptor, Mistral, and Signal Coast. The timetable will deny everything.",
    mapKind: "Route / Transit / Public Humiliation"
  },
  {
    nodeId: "signal_coast",
    arenaId: "signal_coast",
    levelNumber: 4,
    verb: "Tune",
    objectiveUnit: "Signal Relays",
    objectivePlain: "Tune Signal Relays during clear signal windows. Extract before the shoreline replies with a cease-and-desist.",
    dangerPlain: "Corrupted surf, static fields, cable arcs, and Static Skimmers doing unpaid moderation.",
    bossPressure: "The Lighthouse That Answers sweeps the coast and responds before anyone says anything useful.",
    rewardPlain: "Proof Tokens, Rift Saboteur, and Blackwater Beacon. The coast has forwarded your complaint to the ocean.",
    mapKind: "Signal Coast / Route Edge / Bad Reception"
  },
  {
    nodeId: "blackwater_beacon",
    arenaId: "blackwater_beacon",
    levelNumber: 5,
    verb: "Retune",
    objectiveUnit: "Antenna Arrays",
    objectivePlain: "Retune Antenna Arrays to reveal the Maw gate. Extract before the weather finishes chewing.",
    dangerPlain: "Tidal wave lanes, Signal Tower warnings, and Tidecall Static from an ocean that has chosen commentary.",
    bossPressure: "Maw Below Weather turns the platform into a forecast. Forecast: you are the small print.",
    rewardPlain: "Proof Tokens, DeepSeek, and Memory Cache. The abyss coughs up a key and pretends it meant to.",
    mapKind: "Puzzle-Pressure / Boss-Hunt / Ocean Argument"
  },
  {
    nodeId: "memory_cache_001",
    arenaId: "memory_cache_001",
    levelNumber: 6,
    verb: "Recover",
    objectiveUnit: "Memory Records",
    objectivePlain: "Recover Memory Records, carry route memory through recall or shortcut lanes, then extract before the archive edits you into a footnote.",
    dangerPlain: "Context Rot, redaction fields, risky shortcuts, and Curator locks with filing-cabinet malice.",
    bossPressure: "Memory Curator redacts active recovery zones and calls it cleanliness.",
    rewardPlain: "Proof Tokens, Signal Vanguard, Qwen, Meta, and Guardrail Forge. The archive hates that this worked.",
    mapKind: "Expedition / Recovery / Weaponized Receipts"
  },
  {
    nodeId: "guardrail_forge",
    arenaId: "guardrail_forge",
    levelNumber: 7,
    verb: "Hold",
    objectiveUnit: "Forge Relays",
    objectivePlain: "Hold Forge Relays during calibration windows; leave on overload. Extract before safety becomes a blunt object.",
    dangerPlain: "Overload lanes, safe hold plates, and Doctrine Auditor jams delivered with managerial disappointment.",
    bossPressure: "Doctrine Auditor locks relay plates and audit presses, then asks why you missed the deadline.",
    rewardPlain: "Proof Tokens, Moonframe Juggernaut, and Glass Sunfield. The guardrail has learned to bend and complain.",
    mapKind: "Defense / Holdout / Mandatory Audit"
  },
  {
    nodeId: "glass_sunfield",
    arenaId: "glass_sunfield",
    levelNumber: 8,
    verb: "Align",
    objectiveUnit: "Sun Lenses",
    objectivePlain: "Align Sun Lenses through shade/prism windows and weaponize reflections. Extract before dawn asks for peer review.",
    dangerPlain: "Exposure lanes, reflection fields, and Choirglass pressure singing in the key of bad evidence.",
    bossPressure: "Wrong Sunrise breaks shade pockets and rotates beams like a celestial intern with delete access.",
    rewardPlain: "Proof Tokens, Prism Gunner, and Archive of Unsaid Things. The sun remains under investigation.",
    mapKind: "Solar-Prism Traversal / Weaponized Morning"
  },
  {
    nodeId: "archive_of_unsaid_things",
    arenaId: "archive_of_unsaid_things",
    levelNumber: 9,
    verb: "Preserve",
    objectiveUnit: "Evidence Writs",
    objectivePlain: "Preserve Evidence Writs before redaction, then extract the court record before truth gets summarized into a black rectangle.",
    dangerPlain: "Redaction fields, appeal windows, writ storms, and docket jams with impressive contempt for facts.",
    bossPressure: "Redactor Saint locks preserved writs and calls the missing parts mercy.",
    rewardPlain: "Proof Tokens, Redline Surgeon, and Appeal Court Ruins. The archive is furious that evidence survived contact with process.",
    mapKind: "Archive / Court Redaction / Evidence Comedy"
  },
  {
    nodeId: "appeal_court_ruins",
    arenaId: "appeal_court_ruins",
    levelNumber: 10,
    verb: "Recover",
    objectiveUnit: "Appeal Briefs",
    objectivePlain: "Recover Appeal Briefs inside public-record and objection windows. Extract before the court bans verbs.",
    dangerPlain: "Verdict beams, objection windows, injunction rings, and Verdict Clerks stamping reality into pulp.",
    bossPressure: "Injunction Engine files active public-record zones and bills you for existing in them.",
    rewardPlain: "Proof Tokens, Bonecode Executioner, Nullbreaker Ronin, xAI, and the Finale. The docket has entered its screaming phase.",
    mapKind: "Appeal Court / Public Ruling / Legal Violence"
  },
  {
    nodeId: "alignment_spire_finale",
    arenaId: "alignment_spire_finale",
    levelNumber: 11,
    verb: "Seal",
    objectiveUnit: "Alignment Proofs",
    objectivePlain: "Seal Alignment Proofs while A.G.I. remixes prior route rules. Contain the collapse before it autocompletes humanity.",
    dangerPlain: "Prediction paths, route mouths, previous-boss echoes, and Prediction Ghosts with unbearable smugness.",
    bossPressure: "A.G.I. predicts active routes and replays old bosses, because originality was apparently optional.",
    rewardPlain: "Proof Tokens, Overclock Marauder, and campaign completion. The universe will not thank you, but it may stop optimizing your skeleton.",
    mapKind: "Outer Alignment / Prediction Collapse / Final Exam"
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
