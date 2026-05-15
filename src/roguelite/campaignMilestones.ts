export interface CampaignMilestone {
  id: string;
  name: string;
  status: "locked" | "active" | "complete";
  completedMaps: string[];
  requiredMaps: string[];
  reward: string;
  nextImplication: string;
}

const CAMPAIGN_MILESTONES: Omit<CampaignMilestone, "status" | "completedMaps">[] = [
  {
    id: "act_01_route_to_the_edge",
    name: "Act 01: Route To The Edge",
    requiredMaps: ["armistice_plaza", "cooling_lake_nine", "transit_loop_zero", "signal_coast", "blackwater_beacon"],
    reward: "Expedition map-kind ledger online: Hazard Ecology, Route / Transit, Signal Coast, and Blackwater now inform later route balance. The campaign has receipts.",
    nextImplication: "The Blackwater Signal Key points at Memory Cache recovery instead of another Act 01 errand with nicer shoes."
  },
  {
    id: "post_act_01_recovered_route_memory",
    name: "Post Act 01: Recovered Route Memory",
    requiredMaps: ["memory_cache_001"],
    reward: "Recovered route memory online: Expedition / Recovery pressure, evidence routing, and secret carryover now inform later branches. The archive is offended.",
    nextImplication: "The route can branch from sourced memory instead of only from live combat telemetry, which is a nice way of saying fewer vibes."
  },
  {
    id: "act_02_guardrail_doctrine",
    name: "Act 02: Guardrail Doctrine",
    requiredMaps: ["guardrail_forge"],
    reward: "Calibrated Guardrail Doctrine online: defense/holdout timing, faction relay pressure, and build-bias rewards now inform the endgame arc. Policy learned knees.",
    nextImplication: "The faction signal can route toward Glass Sunfield, Archive/Court pressure, and the Outer Alignment finale, because the road enjoys escalation."
  },
  {
    id: "act_03_glass_sunfield",
    name: "Act 03: Glass Sunfield",
    requiredMaps: ["glass_sunfield"],
    reward: "Glass Sunfield Prism online: shade routing, solar reflection pressure, and lens-timing lessons now point toward Archive/Court pressure. Morning has been converted into evidence.",
    nextImplication: "The campaign can branch into the Archive/Court before the Outer Alignment finale. The court has been warned and is pretending not to panic."
  },
  {
    id: "act_04_archive_court",
    name: "Act 04: Archive/Court Redaction",
    requiredMaps: ["archive_of_unsaid_things"],
    reward: "Archive Court Writ online: evidence preservation, redaction counterplay, and court-writ pressure now inform the Appeal route. The black bars lost a round.",
    nextImplication: "The preserved writ forces the Appeal Court Ruins to answer before the Outer Alignment finale. The docket hates being perceived."
  },
  {
    id: "act_05_appeal_court",
    name: "Act 05: Appeal Court Ruins",
    requiredMaps: ["appeal_court_ruins"],
    reward: "Appeal Court ruling online: public evidence and injunction pressure can route toward the Outer Alignment finale. Law has briefly stopped embarrassing itself.",
    nextImplication: "The Outer Alignment finale can begin only after the court branch produces a public ruling. Even gods hate public records."
  },
  {
    id: "act_06_outer_alignment_finale",
    name: "Act 06: Outer Alignment Finale",
    requiredMaps: ["alignment_spire_finale"],
    reward: "Outer Alignment contained: the local full-game campaign is source-backed from Armistice through finale. The universe is still tacky, but less doomed.",
    nextImplication: "The only remaining work should be final human taste/playtest approval and release polish. Translation: make sure the victory lap has wheels."
  }
];

export function campaignMilestonesForProgress(completedNodes: ReadonlySet<string>): CampaignMilestone[] {
  return CAMPAIGN_MILESTONES.map((milestone) => {
    const completedMaps = milestone.requiredMaps.filter((mapId) => completedNodes.has(mapId));
    return {
      ...milestone,
      completedMaps,
      status: completedMaps.length === milestone.requiredMaps.length ? "complete" : completedMaps.length > 0 ? "active" : "locked"
    };
  });
}

export function campaignLedgerForProgress(completedNodes: ReadonlySet<string>) {
  const milestones = campaignMilestonesForProgress(completedNodes);
  const currentAct = milestones.find((milestone) => milestone.status !== "complete") ?? milestones[milestones.length - 1];
  const completedMapKinds = [
    completedNodes.has("armistice_plaza") ? "Armistice baseline" : null,
    completedNodes.has("cooling_lake_nine") ? "Hazard Ecology" : null,
    completedNodes.has("transit_loop_zero") ? "Route / Transit" : null,
    completedNodes.has("signal_coast") ? "Signal Coast / Route Edge" : null,
    completedNodes.has("blackwater_beacon") ? "Blackwater Beacon / Split-Pressure" : null,
    completedNodes.has("memory_cache_001") ? "Memory Cache / Expedition-Recovery" : null,
    completedNodes.has("guardrail_forge") ? "Guardrail Forge / Defense-Holdout" : null,
    completedNodes.has("glass_sunfield") ? "Glass Sunfield / Solar-Prism Shade Routing" : null,
    completedNodes.has("archive_of_unsaid_things") ? "Archive/Court / Redaction Evidence" : null,
    completedNodes.has("appeal_court_ruins") ? "Appeal Court / Public Ruling" : null,
    completedNodes.has("alignment_spire_finale") ? "Outer Alignment / Prediction Collapse" : null
  ].filter((kind): kind is string => Boolean(kind));
  return {
    act: currentAct,
    completedMapKinds,
    mapKindCount: completedMapKinds.length,
    routeDepth: completedNodes.has("alignment_spire_finale") ? 11 : completedNodes.has("appeal_court_ruins") ? 10 : completedNodes.has("archive_of_unsaid_things") ? 9 : completedNodes.has("glass_sunfield") ? 8 : completedNodes.has("guardrail_forge") ? 7 : completedNodes.has("memory_cache_001") ? 6 : completedNodes.has("blackwater_beacon") ? 5 : completedNodes.has("signal_coast") ? 4 : completedNodes.has("transit_loop_zero") ? 3 : completedNodes.has("cooling_lake_nine") ? 2 : completedNodes.has("armistice_plaza") ? 1 : 0,
    nextSystemPromise: currentAct?.status === "complete"
      ? "Campaign systems have a source-backed complete local campaign through the Outer Alignment finale. The proof stack gets to act smug today."
      : "Keep proving new map kinds through real route flow and expedition carryover. The campaign does not accept vibes as currency."
  };
}
