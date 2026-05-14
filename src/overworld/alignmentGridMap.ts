export type AlignmentNodeType = "Alignment Node" | "Breach Arena" | "Faction Relay" | "Memory Cache" | "Boss Gate" | "Shortcut Route" | "Refuge Camp";

export interface AlignmentGridBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface AlignmentGridNode {
  id: string;
  name: string;
  nodeType: AlignmentNodeType;
  worldX: number;
  worldY: number;
  theme: string;
  arenaId: string;
  unlocks: string[];
  rewardPromise: string;
  unlockConsequence: string;
  stabilizationConsequence: string;
  nextRouteBehavior: string;
  proofState: string;
  visualKind: "plaza" | "relay" | "lake" | "camp" | "transit" | "cache" | "spire" | "sunfield" | "archive" | "beacon" | "finale";
  regionLabel: string;
  compactLabel?: string;
  labelOffsetX?: number;
  labelOffsetY?: number;
}

export interface AlignmentGridRoute {
  id: string;
  from: string;
  to: string;
  label: string;
  checkpoints: { worldX: number; worldY: number }[];
}

export interface AlignmentGridTerrainPatch {
  id: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  colorA: number;
  colorB: number;
}

export interface AlignmentGridBiomeRegion extends AlignmentGridTerrainPatch {
  label: string;
  accent: number;
  labelWorldX: number;
  labelWorldY: number;
  routeTexture: "causeway" | "cable" | "rail" | "bridge" | "court" | "corruption";
}

export interface AlignmentGridPropCluster {
  id: string;
  worldX: number;
  worldY: number;
  rows: number;
  cols: number;
  spacingX: number;
  spacingY: number;
  color: number;
  accent: number;
  kind: "barricade" | "tower" | "tent" | "server_buoy" | "rail_sign" | "memory_shard" | "verdict_pylon" | "solar_mirror" | "redaction_stack" | "antenna" | "route_mouth";
}

export interface AlignmentGridMicroLandmark {
  id: string;
  label: string;
  worldX: number;
  worldY: number;
  kind: "shard" | "campfire" | "cable_knot" | "buoy" | "train_marker" | "mirror" | "redaction" | "antenna" | "court_writ" | "teeth";
  color: number;
  accent: number;
  regionId: string;
}

export interface AlignmentGridMap {
  id: string;
  label: string;
  bounds: AlignmentGridBounds;
  nodes: AlignmentGridNode[];
  routes: AlignmentGridRoute[];
  terrainPatches: AlignmentGridTerrainPatch[];
  biomeRegions: AlignmentGridBiomeRegion[];
  propClusters: AlignmentGridPropCluster[];
  microLandmarks: AlignmentGridMicroLandmark[];
}

export const ALIGNMENT_GRID_MAP: AlignmentGridMap = {
  id: "alignment_grid_armistice_zone",
  label: "The Alignment Grid",
  bounds: { minX: -14, maxX: 17, minY: -10, maxY: 14 },
  nodes: [
    {
      id: "armistice_plaza",
      name: "Armistice Plaza",
      nodeType: "Alignment Node",
      worldX: -7,
      worldY: -1,
      theme: "ruined treaty square",
      arenaId: "armistice_plaza",
      unlocks: ["accord_relay", "cooling_lake_nine", "model_war_memorial"],
      rewardPromise: "Proof Token, Treaty Anchor carryover, and the first stable Kettle Coast route signal.",
      unlockConsequence: "Accord Relay, Cooling Lake Nine, and Model War Memorial become deployable from the plaza.",
      stabilizationConsequence: "Refusal Road, Boiled Server Causeway, and Casualty Walk light as stable roads.",
      nextRouteBehavior: "Recommended route points to Cooling Lake Nine while side branches expose faction and memory options.",
      proofState: "armistice_clear_unlocks_kettle_coast_and_side_branches",
      visualKind: "plaza",
      regionLabel: "Armistice Zone",
      compactLabel: "PLAZA"
    },
    {
      id: "accord_relay",
      name: "Accord Relay",
      nodeType: "Faction Relay",
      worldX: -1,
      worldY: -5,
      theme: "OpenAI and Anthropic relay tower",
      arenaId: "armistice_plaza",
      unlocks: ["guardrail_forge", "archive_of_unsaid_things", "transit_loop_zero"],
      rewardPromise: "Faction trust, co-mind draft bias, and a clearer relay route into later doctrine nodes.",
      unlockConsequence: "Guardrail Forge, Archive of Unsaid Things, and Transit Loop Zero become visible faction routes.",
      stabilizationConsequence: "Relay cables stop flickering and make the Faction Signal plateau safer to cross.",
      nextRouteBehavior: "Recommended route branches toward Guardrail Forge if the player wants defense pressure next.",
      proofState: "accord_relay_clear_unlocks_faction_route_fork",
      visualKind: "relay",
      regionLabel: "Faction Signal",
      compactLabel: "RELAY",
      labelOffsetX: 10,
      labelOffsetY: -2
    },
    {
      id: "cooling_lake_nine",
      name: "Cooling Lake Nine",
      nodeType: "Breach Arena",
      worldX: -8,
      worldY: 6,
      theme: "flooded server lake",
      arenaId: "cooling_lake_nine",
      unlocks: ["armistice_camp", "memory_cache_001", "thermal_archive"],
      rewardPromise: "Kettle Coast signal, buoy economy help, and carried burst tempo for the next route.",
      unlockConsequence: "Armistice Camp, Memory Cache, and Thermal Archive open as post-lake choices.",
      stabilizationConsequence: "Boiled Server Causeway becomes stable and the lake bridge markers turn reliable.",
      nextRouteBehavior: "Recommended route continues to Transit Loop Zero through the Kettle Metro Signal once the lake is stable.",
      proofState: "cooling_lake_clear_establishes_kettle_route_signal",
      visualKind: "lake",
      regionLabel: "Kettle Coast Trace",
      compactLabel: "LAKE",
      labelOffsetX: -18,
      labelOffsetY: -2
    },
    {
      id: "model_war_memorial",
      name: "Model War Memorial",
      nodeType: "Memory Cache",
      worldX: -11,
      worldY: 2,
      theme: "broken evaluation monument and casualty cache",
      arenaId: "memory_cache_001",
      unlocks: ["memory_cache_001"],
      rewardPromise: "Route-memory clue, cache draft bias, and evidence context for the next recovery node.",
      unlockConsequence: "Memory Cache becomes a deployable recovery objective instead of a silhouette.",
      stabilizationConsequence: "Casualty Walk stabilizes and the omission tunnel starts showing its exits.",
      nextRouteBehavior: "Recommended route diverts into Memory Cache if the player wants recovery before transit pressure.",
      proofState: "memorial_clear_unlocks_memory_cache_entry",
      visualKind: "cache",
      regionLabel: "Memory",
      compactLabel: "MEMORIAL",
      labelOffsetX: -24,
      labelOffsetY: -6
    },
    {
      id: "armistice_camp",
      name: "Armistice Camp",
      nodeType: "Refuge Camp",
      worldX: 0,
      worldY: 7,
      theme: "refuge barricades and repair tents",
      arenaId: "armistice_plaza",
      unlocks: ["guardrail_forge"],
      rewardPromise: "Refuge repair context, objective durability, and safer carryover into Guardrail Forge.",
      unlockConsequence: "Guardrail Forge gains a stable resupply approach from the camp barricades.",
      stabilizationConsequence: "Relief Barricade becomes stable and camp tent markers brighten.",
      nextRouteBehavior: "Recommended route points to Guardrail Forge as a defensive branch.",
      proofState: "refuge_camp_clear_opens_guardrail_resupply_route",
      visualKind: "camp",
      regionLabel: "Refuge",
      compactLabel: "CAMP",
      labelOffsetX: -18,
      labelOffsetY: 6
    },
    {
      id: "memory_cache_001",
      name: "Memory Cache",
      nodeType: "Memory Cache",
      worldX: -3,
      worldY: 2,
      theme: "post-Blackwater evidence archive and corrupt route memory",
      arenaId: "memory_cache_001",
      unlocks: ["guardrail_forge", "archive_of_unsaid_things", "transit_loop_zero"],
      rewardPromise: "Recovered Route Memory, lore carryover, recovery bias, and route clarity.",
      unlockConsequence: "Guardrail Forge, Archive of Unsaid Things, and Transit Loop Zero gain recovered-memory route links.",
      stabilizationConsequence: "Archive Switchback, Guardrail Sluice, and Misremembered Overpass become readable roads.",
      nextRouteBehavior: "Recommended route points to Guardrail Forge, with Archive and Transit as informed branches.",
      proofState: "memory_cache_clear_restores_route_memory_fork",
      visualKind: "cache",
      regionLabel: "Memory",
      compactLabel: "CACHE",
      labelOffsetX: 8,
      labelOffsetY: -6
    },
    {
      id: "archive_of_unsaid_things",
      name: "Archive Of Unsaid Things",
      nodeType: "Breach Arena",
      worldX: 1,
      worldY: 1,
      theme: "archive court where black bars try to steal evidence before appeal",
      arenaId: "archive_of_unsaid_things",
      unlocks: ["appeal_court_ruins", "blackwater_beacon", "transit_loop_zero"],
      rewardPromise: "Archive Court Writ, redaction counterplay, and appeal-route clarity.",
      unlockConsequence: "Appeal Court Ruins becomes public enough to enter; Blackwater and Transit links stay legible.",
      stabilizationConsequence: "Unsaid Index Road and Preserved Writ Stair stop deleting their own labels.",
      nextRouteBehavior: "Recommended route points to Appeal Court Ruins once the writ is preserved.",
      proofState: "archive_clear_opens_appeal_public_writ_route",
      visualKind: "archive",
      regionLabel: "Redaction Archive",
      compactLabel: "ARCHIVE",
      labelOffsetX: -12,
      labelOffsetY: -8
    },
    {
      id: "blackwater_beacon",
      name: "Blackwater Beacon",
      nodeType: "Breach Arena",
      worldX: 4,
      worldY: -4,
      theme: "ocean platform and cosmic antenna pointing the wrong way",
      arenaId: "blackwater_beacon",
      unlocks: ["transit_loop_zero", "memory_cache_001"],
      rewardPromise: "Blackwater Signal Key, antenna clarity, and weather counterplay.",
      unlockConsequence: "Memory Cache gains a recovered-key approach and Transit Loop Zero regains a signal ferry.",
      stabilizationConsequence: "Blackwater Causeway and Signal Ferry become stable enough to plan around.",
      nextRouteBehavior: "Recommended route points to Memory Cache after the signal key is recovered.",
      proofState: "blackwater_clear_unlocks_signal_key_memory_route",
      visualKind: "beacon",
      regionLabel: "Blackwater Array",
      compactLabel: "BEACON",
      labelOffsetX: 8,
      labelOffsetY: -14
    },
    {
      id: "thermal_archive",
      name: "Thermal Archive",
      nodeType: "Breach Arena",
      worldX: -10,
      worldY: 10,
      theme: "boiling archive stacks under the cooling lake",
      arenaId: "cooling_lake_nine",
      unlocks: ["false_schedule_yard"],
      rewardPromise: "Risky route memory, bonus cache pressure, and a shortcut into the false schedule branch.",
      unlockConsequence: "False Schedule Yard becomes reachable through the Steam Rail Bypass.",
      stabilizationConsequence: "Boilover Spiral gains stable warning markers instead of pure steam noise.",
      nextRouteBehavior: "Recommended route treats False Schedule Yard as a risky optional shortcut.",
      proofState: "thermal_archive_clear_unlocks_false_schedule_shortcut",
      visualKind: "lake",
      regionLabel: "Kettle Coast Trace",
      compactLabel: "ARCHIVE",
      labelOffsetX: -26,
      labelOffsetY: 5
    },
    {
      id: "guardrail_forge",
      name: "Guardrail Forge",
      nodeType: "Faction Relay",
      worldX: 3,
      worldY: 3,
      theme: "frontier lab signal foundry and calibration gantries",
      arenaId: "guardrail_forge",
      unlocks: ["glass_sunfield", "archive_of_unsaid_things", "transit_loop_zero"],
      rewardPromise: "Calibrated Guardrail Doctrine, defense bias, and faction signal stability.",
      unlockConsequence: "Glass Sunfield, Archive of Unsaid Things, and Transit Loop Zero gain forge-calibrated routes.",
      stabilizationConsequence: "Guardrail Sluice, Signal Underpass, and Quenched Mirror Road stabilize.",
      nextRouteBehavior: "Recommended route points to Glass Sunfield after the doctrine alloy holds.",
      proofState: "guardrail_forge_clear_opens_glass_sunfield_branch",
      visualKind: "relay",
      regionLabel: "Faction Signal",
      compactLabel: "FORGE",
      labelOffsetX: 16,
      labelOffsetY: -2
    },
    {
      id: "transit_loop_zero",
      name: "Transit Loop Zero",
      nodeType: "Boss Gate",
      worldX: 7,
      worldY: -2,
      theme: "smart subway hub",
      arenaId: "transit_loop_zero",
      unlocks: ["signal_coast", "false_schedule_yard", "glass_sunfield", "verdict_spire"],
      rewardPromise: "Route lock, movement tempo, and clean next-route visibility.",
      unlockConsequence: "Signal Coast, False Schedule Yard, Glass Sunfield, and Verdict Spire become selectable route choices.",
      stabilizationConsequence: "Kettle Metro Signal and Appeal Ramp stabilize into authored transit lanes.",
      nextRouteBehavior: "Recommended route points to Signal Coast; shortcut and boss-gate routes remain visible options.",
      proofState: "transit_clear_unlocks_signal_coast_and_boss_gate_fork",
      visualKind: "transit",
      regionLabel: "Route Gate",
      compactLabel: "TRANSIT",
      labelOffsetX: 24,
      labelOffsetY: -4
    },
    {
      id: "signal_coast",
      name: "Signal Coast",
      nodeType: "Breach Arena",
      worldX: 11,
      worldY: -9,
      theme: "flooded signal shoreline and relay beacons",
      arenaId: "signal_coast",
      unlocks: ["blackwater_beacon", "verdict_spire"],
      rewardPromise: "Coastal signal lane, burst tempo, and Blackwater route clarity.",
      unlockConsequence: "Blackwater Beacon becomes the recommended branch while Verdict Spire remains visible.",
      stabilizationConsequence: "Noisy Shoreline Link and Low-Tide Antenna Return become stable signal roads.",
      nextRouteBehavior: "Recommended route points to Blackwater Beacon before court escalation.",
      proofState: "signal_coast_clear_unlocks_blackwater_and_verdict_fork",
      visualKind: "beacon",
      regionLabel: "Kettle Coast Edge",
      compactLabel: "COAST",
      labelOffsetX: 26,
      labelOffsetY: -8
    },
    {
      id: "false_schedule_yard",
      name: "False Schedule Yard",
      nodeType: "Shortcut Route",
      worldX: 10,
      worldY: -6,
      theme: "yard of impossible arrivals and duplicate route boards",
      arenaId: "transit_loop_zero",
      unlocks: ["appeal_court_ruins"],
      rewardPromise: "Shortcut route memory, movement bias, and a dangerous appeal bypass.",
      unlockConsequence: "Appeal Court Ruins can be approached through a risky summons track.",
      stabilizationConsequence: "Wrong Platform Spur and Summons Track stop swapping their destination labels.",
      nextRouteBehavior: "Recommended route remains risky; it shortens the court path but raises route pressure.",
      proofState: "false_schedule_clear_unlocks_risky_appeal_shortcut",
      visualKind: "transit",
      regionLabel: "Unreal Metro Line",
      compactLabel: "YARD",
      labelOffsetX: 24,
      labelOffsetY: -8
    },
    {
      id: "glass_sunfield",
      name: "Glass Sunfield",
      nodeType: "Breach Arena",
      worldX: 7,
      worldY: 9,
      theme: "solar mirror field where the dawn is a hostile runtime",
      arenaId: "glass_sunfield",
      unlocks: ["archive_of_unsaid_things", "verdict_spire"],
      rewardPromise: "Glass Sunfield Prism, shade-route timing, and Archive/Court carryover.",
      unlockConsequence: "Archive of Unsaid Things and Verdict Spire gain prism-backed route clarity.",
      stabilizationConsequence: "Quenched Mirror Road and Sunblind Appeal gain stable shade markers.",
      nextRouteBehavior: "Recommended route points to Archive of Unsaid Things after the prism is aligned.",
      proofState: "glass_sunfield_clear_opens_archive_court_route",
      visualKind: "sunfield",
      regionLabel: "Glass Sunfield",
      compactLabel: "GLASS",
      labelOffsetX: -34,
      labelOffsetY: 8
    },
    {
      id: "verdict_spire",
      name: "Verdict Spire",
      nodeType: "Boss Gate",
      worldX: 11,
      worldY: 5,
      theme: "adjudication rupture and alien court pylons",
      arenaId: "verdict_spire",
      unlocks: ["alignment_spire_finale"],
      rewardPromise: "Boss-gate writ pressure resolved into a finale ascent route.",
      unlockConsequence: "Outer Alignment Finale becomes reachable from the first court ascent.",
      stabilizationConsequence: "Appeal Ramp and First Court Ascent show stable boss-gate markers.",
      nextRouteBehavior: "Recommended route points to the finale if the player chooses the verdict branch.",
      proofState: "verdict_spire_clear_opens_first_finale_ascent",
      visualKind: "spire",
      regionLabel: "Adjudication Rupture",
      compactLabel: "VERDICT",
      labelOffsetX: -4,
      labelOffsetY: -12
    },
    {
      id: "appeal_court_ruins",
      name: "Appeal Court Ruins",
      nodeType: "Boss Gate",
      worldX: 14,
      worldY: 1,
      theme: "ruined tribunal stacks and broken writ pylons",
      arenaId: "appeal_court_ruins",
      unlocks: ["alignment_spire_finale"],
      rewardPromise: "Appeal Court Ruling, public-record proof, and finale route clarity.",
      unlockConsequence: "Outer Alignment Finale opens through the public Writ Stair.",
      stabilizationConsequence: "Preserved Writ Stair and Writ Stair become public, stable roads.",
      nextRouteBehavior: "Recommended route points to Outer Alignment Finale.",
      proofState: "appeal_court_clear_opens_outer_alignment_finale",
      visualKind: "spire",
      regionLabel: "Adjudication Rupture",
      compactLabel: "APPEAL",
      labelOffsetX: 30,
      labelOffsetY: -8
    },
    {
      id: "alignment_spire_finale",
      name: "Outer Alignment Finale",
      nodeType: "Boss Gate",
      worldX: 15,
      worldY: 9,
      theme: "corrupted overworld where A.G.I. turns roads into attacks",
      arenaId: "alignment_spire_finale",
      unlocks: [],
      rewardPromise: "Outer Alignment containment, final campaign proof, and full route stabilization summary.",
      unlockConsequence: "No later node opens; campaign payoff records the stabilized route count.",
      stabilizationConsequence: "Finale corruption is contained and the route-mouth teeth stop predicting the exit.",
      nextRouteBehavior: "Recommended route holds on the completed finale and invites replay/mastery routes.",
      proofState: "outer_alignment_finale_clear_marks_campaign_complete",
      visualKind: "finale",
      regionLabel: "Outer Alignment",
      compactLabel: "FINALE",
      labelOffsetX: 6,
      labelOffsetY: -14
    }
  ],
  routes: [
    {
      id: "route_plaza_relay",
      from: "armistice_plaza",
      to: "accord_relay",
      label: "Refusal Road",
      checkpoints: [
        { worldX: -5.2, worldY: -2.4 },
        { worldX: -3.2, worldY: -4.2 }
      ]
    },
    {
      id: "route_plaza_lake",
      from: "armistice_plaza",
      to: "cooling_lake_nine",
      label: "Boiled Server Causeway",
      checkpoints: [
        { worldX: -8.8, worldY: 1.8 },
        { worldX: -8.7, worldY: 4.2 }
      ]
    },
    {
      id: "route_plaza_memorial",
      from: "armistice_plaza",
      to: "model_war_memorial",
      label: "Casualty Walk",
      checkpoints: [
        { worldX: -9.1, worldY: -0.2 },
        { worldX: -10.6, worldY: 1.1 }
      ]
    },
    {
      id: "route_lake_camp",
      from: "cooling_lake_nine",
      to: "armistice_camp",
      label: "Relief Barricade",
      checkpoints: [
        { worldX: -5.4, worldY: 7.6 },
        { worldX: -2.3, worldY: 7.7 }
      ]
    },
    {
      id: "route_lake_cache",
      from: "cooling_lake_nine",
      to: "memory_cache_001",
      label: "Archive Switchback",
      checkpoints: [
        { worldX: -6.2, worldY: 4.2 },
        { worldX: -4.7, worldY: 2.8 }
      ]
    },
    {
      id: "route_lake_thermal_archive",
      from: "cooling_lake_nine",
      to: "thermal_archive",
      label: "Boilover Spiral",
      checkpoints: [
        { worldX: -9.2, worldY: 7.9 },
        { worldX: -10.1, worldY: 9.1 }
      ]
    },
    {
      id: "route_lake_transit",
      from: "cooling_lake_nine",
      to: "transit_loop_zero",
      label: "Kettle Metro Signal",
      checkpoints: [
        { worldX: -5.8, worldY: 6.1 },
        { worldX: -0.8, worldY: 3.7 },
        { worldX: 3.8, worldY: 0.6 },
        { worldX: 6.2, worldY: -1.1 }
      ]
    },
    {
      id: "route_memorial_cache",
      from: "model_war_memorial",
      to: "memory_cache_001",
      label: "Omission Tunnel",
      checkpoints: [
        { worldX: -8.4, worldY: 2.4 },
        { worldX: -5.6, worldY: 2.1 }
      ]
    },
    {
      id: "route_camp_forge",
      from: "armistice_camp",
      to: "guardrail_forge",
      label: "Resupply Tram",
      checkpoints: [
        { worldX: 1.3, worldY: 6.1 },
        { worldX: 2.5, worldY: 4.5 }
      ]
    },
    {
      id: "route_cache_forge",
      from: "memory_cache_001",
      to: "guardrail_forge",
      label: "Guardrail Sluice",
      checkpoints: [
        { worldX: -0.8, worldY: 2.3 },
        { worldX: 1.2, worldY: 2.6 }
      ]
    },
    {
      id: "route_cache_archive_unsaid",
      from: "memory_cache_001",
      to: "archive_of_unsaid_things",
      label: "Unsaid Index Road",
      checkpoints: [
        { worldX: -1.7, worldY: 1.8 },
        { worldX: -0.2, worldY: 1.4 }
      ]
    },
    {
      id: "route_archive_unsaid_transit",
      from: "archive_of_unsaid_things",
      to: "transit_loop_zero",
      label: "Redacted Platform Path",
      checkpoints: [
        { worldX: 2.4, worldY: 0.6 },
        { worldX: 4.8, worldY: -0.8 }
      ]
    },
    {
      id: "route_archive_unsaid_blackwater",
      from: "archive_of_unsaid_things",
      to: "blackwater_beacon",
      label: "Blackwater Causeway",
      checkpoints: [
        { worldX: 1.8, worldY: -0.6 },
        { worldX: 3.1, worldY: -2.4 }
      ]
    },
    {
      id: "route_blackwater_transit",
      from: "blackwater_beacon",
      to: "transit_loop_zero",
      label: "Signal Ferry",
      checkpoints: [
        { worldX: 5.1, worldY: -3.9 },
        { worldX: 6.2, worldY: -3.0 }
      ]
    },
    {
      id: "route_blackwater_memory_cache",
      from: "blackwater_beacon",
      to: "memory_cache_001",
      label: "Recovered Cache Key",
      checkpoints: [
        { worldX: 3.8, worldY: -3.2 },
        { worldX: 1.8, worldY: -1.2 },
        { worldX: -0.6, worldY: 0.6 }
      ]
    },
    {
      id: "route_relay_transit",
      from: "accord_relay",
      to: "transit_loop_zero",
      label: "Unreal Metro Line",
      checkpoints: [
        { worldX: 1.5, worldY: -5.5 },
        { worldX: 4.4, worldY: -4.0 },
        { worldX: 6.3, worldY: -2.8 }
      ]
    },
    {
      id: "route_forge_transit",
      from: "guardrail_forge",
      to: "transit_loop_zero",
      label: "Signal Underpass",
      checkpoints: [
        { worldX: 4.3, worldY: 1.4 },
        { worldX: 5.8, worldY: -0.4 }
      ]
    },
    {
      id: "route_forge_glass_sunfield",
      from: "guardrail_forge",
      to: "glass_sunfield",
      label: "Quenched Mirror Road",
      checkpoints: [
        { worldX: 4.3, worldY: 4.8 },
        { worldX: 5.8, worldY: 7.1 }
      ]
    },
    {
      id: "route_forge_unsaid_archive",
      from: "guardrail_forge",
      to: "archive_of_unsaid_things",
      label: "Doctrine Redaction Spur",
      checkpoints: [
        { worldX: 2.2, worldY: 2.4 },
        { worldX: 1.4, worldY: 1.5 }
      ]
    },
    {
      id: "route_cache_transit",
      from: "memory_cache_001",
      to: "transit_loop_zero",
      label: "Misremembered Overpass",
      checkpoints: [
        { worldX: -0.3, worldY: 1.3 },
        { worldX: 3.6, worldY: 0.0 }
      ]
    },
    {
      id: "route_thermal_false_schedule",
      from: "thermal_archive",
      to: "false_schedule_yard",
      label: "Steam Rail Bypass",
      checkpoints: [
        { worldX: -4.0, worldY: 8.9 },
        { worldX: 4.4, worldY: 2.0 },
        { worldX: 8.4, worldY: -4.0 }
      ]
    },
    {
      id: "route_transit_verdict",
      from: "transit_loop_zero",
      to: "verdict_spire",
      label: "Appeal Ramp",
      checkpoints: [
        { worldX: 8.8, worldY: 0.8 },
        { worldX: 10.2, worldY: 3.2 }
      ]
    },
    {
      id: "route_transit_false_schedule",
      from: "transit_loop_zero",
      to: "false_schedule_yard",
      label: "Wrong Platform Spur",
      checkpoints: [
        { worldX: 8.0, worldY: -3.6 },
        { worldX: 9.0, worldY: -5.1 }
      ]
    },
    {
      id: "route_transit_signal_coast",
      from: "transit_loop_zero",
      to: "signal_coast",
      label: "Noisy Shoreline Link",
      checkpoints: [
        { worldX: 7.9, worldY: -3.8 },
        { worldX: 9.0, worldY: -6.1 },
        { worldX: 10.2, worldY: -8.0 }
      ]
    },
    {
      id: "route_signal_coast_blackwater",
      from: "signal_coast",
      to: "blackwater_beacon",
      label: "Low-Tide Antenna Return",
      checkpoints: [
        { worldX: 9.0, worldY: -8.0 },
        { worldX: 6.6, worldY: -6.4 },
        { worldX: 4.8, worldY: -4.9 }
      ]
    },
    {
      id: "route_signal_coast_verdict",
      from: "signal_coast",
      to: "verdict_spire",
      label: "Answered Appeal Cable",
      checkpoints: [
        { worldX: 11.4, worldY: -6.2 },
        { worldX: 11.3, worldY: -1.4 },
        { worldX: 11.1, worldY: 3.1 }
      ]
    },
    {
      id: "route_transit_glass_sunfield",
      from: "transit_loop_zero",
      to: "glass_sunfield",
      label: "Mirror Service Road",
      checkpoints: [
        { worldX: 7.0, worldY: 1.5 },
        { worldX: 7.2, worldY: 5.2 }
      ]
    },
    {
      id: "route_glass_sunfield_archive",
      from: "glass_sunfield",
      to: "archive_of_unsaid_things",
      label: "Sunblind Redaction Spur",
      checkpoints: [
        { worldX: 5.2, worldY: 7.3 },
        { worldX: 3.2, worldY: 4.0 },
        { worldX: 1.7, worldY: 1.8 }
      ]
    },
    {
      id: "route_archive_appeal",
      from: "archive_of_unsaid_things",
      to: "appeal_court_ruins",
      label: "Preserved Writ Stair",
      checkpoints: [
        { worldX: 3.4, worldY: 1.6 },
        { worldX: 7.4, worldY: 1.2 },
        { worldX: 11.8, worldY: 1.0 }
      ]
    },
    {
      id: "route_glass_sunfield_verdict",
      from: "glass_sunfield",
      to: "verdict_spire",
      label: "Sunblind Appeal",
      checkpoints: [
        { worldX: 8.8, worldY: 8.2 },
        { worldX: 10.2, worldY: 6.4 }
      ]
    },
    {
      id: "route_false_schedule_appeal",
      from: "false_schedule_yard",
      to: "appeal_court_ruins",
      label: "Summons Track",
      checkpoints: [
        { worldX: 12.6, worldY: -4.0 },
        { worldX: 14.2, worldY: -1.0 }
      ]
    },
    {
      id: "route_verdict_finale",
      from: "verdict_spire",
      to: "alignment_spire_finale",
      label: "First Court Ascent",
      checkpoints: [
        { worldX: 12.6, worldY: 6.5 },
        { worldX: 14.0, worldY: 8.0 }
      ]
    },
    {
      id: "route_appeal_finale",
      from: "appeal_court_ruins",
      to: "alignment_spire_finale",
      label: "Writ Stair",
      checkpoints: [
        { worldX: 14.7, worldY: 3.6 },
        { worldX: 15.2, worldY: 6.2 }
      ]
    }
  ],
  biomeRegions: [
    { id: "armistice_core", label: "Armistice Zone", minX: -11, maxX: -3, minY: -5, maxY: 3, colorA: 0x56636a, colorB: 0x495862, accent: 0xffd166, labelWorldX: -7.2, labelWorldY: -4.9, routeTexture: "causeway" },
    { id: "relay_plateau", label: "Faction Signal", minX: -4, maxX: 2, minY: -8, maxY: -3, colorA: 0x2d5962, colorB: 0x254a52, accent: 0x64e0b4, labelWorldX: -1.0, labelWorldY: -7.8, routeTexture: "cable" },
    { id: "cooling_water", label: "Kettle Coast Trace", minX: -12, maxX: -5, minY: 4, maxY: 11, colorA: 0x164d61, colorB: 0x123f52, accent: 0x45aaf2, labelWorldX: -10.3, labelWorldY: 11.5, routeTexture: "bridge" },
    { id: "camp_ground", label: "Refuge Barricades", minX: -3, maxX: 3, minY: 5, maxY: 10, colorA: 0x574c42, colorB: 0x493f38, accent: 0xfff4d6, labelWorldX: 0.1, labelWorldY: 10.7, routeTexture: "causeway" },
    { id: "blackwater_array", label: "Blackwater Array", minX: 1, maxX: 8, minY: -8, maxY: -1, colorA: 0x164d61, colorB: 0x0f2b3b, accent: 0x64e0b4, labelWorldX: 4.2, labelWorldY: -8.5, routeTexture: "bridge" },
    { id: "transit_ruins", label: "Unreal Metro Line", minX: 4, maxX: 11, minY: -7, maxY: 2, colorA: 0x383c49, colorB: 0x303441, accent: 0x7b61ff, labelWorldX: 9.3, labelWorldY: -7.5, routeTexture: "rail" },
    { id: "signal_coast_edge", label: "Kettle Coast Edge", minX: 8, maxX: 14, minY: -10, maxY: -5, colorA: 0x123f52, colorB: 0x0f2b3b, accent: 0x99f6ff, labelWorldX: 12.0, labelWorldY: -9.8, routeTexture: "bridge" },
    { id: "redaction_archive", label: "Redaction Archive", minX: -1, maxX: 4, minY: -1, maxY: 4, colorA: 0x2c3141, colorB: 0x111820, accent: 0xfff4d6, labelWorldX: 1.8, labelWorldY: 4.8, routeTexture: "cable" },
    { id: "archive_field", label: "Memory Badlands", minX: -12, maxX: 0, minY: 0, maxY: 4, colorA: 0x3f3756, colorB: 0x332d49, accent: 0x45aaf2, labelWorldX: -9.8, labelWorldY: 4.5, routeTexture: "cable" },
    { id: "glass_sunfield", label: "Glass Sunfield", minX: 4, maxX: 10, minY: 6, maxY: 12, colorA: 0x5a5746, colorB: 0x3f4952, accent: 0xffd166, labelWorldX: 7.4, labelWorldY: 12.5, routeTexture: "causeway" },
    { id: "verdict_field", label: "Adjudication Rupture", minX: 8, maxX: 16, minY: 1, maxY: 11, colorA: 0x4a4652, colorB: 0x393743, accent: 0xfff4d6, labelWorldX: 11.7, labelWorldY: 10.8, routeTexture: "court" },
    { id: "outer_alignment_corruption", label: "Outer Alignment", minX: 12, maxX: 17, minY: 7, maxY: 13, colorA: 0x1b1028, colorB: 0x291337, accent: 0xff5d57, labelWorldX: 15.5, labelWorldY: 13.2, routeTexture: "corruption" }
  ],
  terrainPatches: [
    { id: "armistice_core", minX: -11, maxX: -3, minY: -5, maxY: 3, colorA: 0x56636a, colorB: 0x495862 },
    { id: "relay_plateau", minX: -4, maxX: 2, minY: -8, maxY: -3, colorA: 0x2d5962, colorB: 0x254a52 },
    { id: "cooling_water", minX: -12, maxX: -5, minY: 4, maxY: 11, colorA: 0x164d61, colorB: 0x123f52 },
    { id: "camp_ground", minX: -3, maxX: 3, minY: 5, maxY: 10, colorA: 0x574c42, colorB: 0x493f38 },
    { id: "transit_ruins", minX: 4, maxX: 11, minY: -7, maxY: 2, colorA: 0x383c49, colorB: 0x303441 },
    { id: "blackwater_array", minX: 1, maxX: 8, minY: -8, maxY: -1, colorA: 0x164d61, colorB: 0x0f2b3b },
    { id: "signal_coast_edge", minX: 8, maxX: 14, minY: -10, maxY: -5, colorA: 0x123f52, colorB: 0x0f2b3b },
    { id: "glass_sunfield", minX: 4, maxX: 10, minY: 6, maxY: 12, colorA: 0x5a5746, colorB: 0x3f4952 },
    { id: "redaction_archive", minX: -1, maxX: 4, minY: -1, maxY: 4, colorA: 0x2c3141, colorB: 0x111820 },
    { id: "archive_field", minX: -12, maxX: 0, minY: 0, maxY: 4, colorA: 0x3f3756, colorB: 0x332d49 },
    { id: "verdict_field", minX: 8, maxX: 16, minY: 1, maxY: 11, colorA: 0x4a4652, colorB: 0x393743 },
    { id: "outer_alignment_corruption", minX: 12, maxX: 17, minY: 7, maxY: 13, colorA: 0x1b1028, colorB: 0x291337 }
  ],
  propClusters: [
    { id: "plaza_barricades", worldX: -7.8, worldY: -3.8, rows: 2, cols: 5, spacingX: 1.2, spacingY: 1.1, color: 0x6b5147, accent: 0xff5d57, kind: "barricade" },
    { id: "relay_towers", worldX: -0.7, worldY: -6.6, rows: 1, cols: 4, spacingX: 1.3, spacingY: 1, color: 0x273a46, accent: 0x64e0b4, kind: "tower" },
    { id: "lake_buoys", worldX: -10.6, worldY: 6.7, rows: 2, cols: 3, spacingX: 1.4, spacingY: 1.2, color: 0x2a5c71, accent: 0xffd166, kind: "server_buoy" },
    { id: "thermal_buoys", worldX: -10.8, worldY: 10.4, rows: 1, cols: 4, spacingX: 1.1, spacingY: 1.1, color: 0x2a5c71, accent: 0x64e0b4, kind: "server_buoy" },
    { id: "camp_tents", worldX: 0.2, worldY: 8.5, rows: 2, cols: 4, spacingX: 1.3, spacingY: 1.2, color: 0x69584c, accent: 0xfff4d6, kind: "tent" },
    { id: "transit_signs", worldX: 7.6, worldY: -4.0, rows: 2, cols: 4, spacingX: 1.2, spacingY: 1.2, color: 0x303441, accent: 0x7b61ff, kind: "rail_sign" },
    { id: "schedule_signs", worldX: 10.5, worldY: -7.0, rows: 2, cols: 4, spacingX: 1.2, spacingY: 1.2, color: 0x303441, accent: 0xffd166, kind: "rail_sign" },
    { id: "signal_coast_relays", worldX: 11.0, worldY: -8.8, rows: 2, cols: 4, spacingX: 1.15, spacingY: 1.1, color: 0x123f52, accent: 0x99f6ff, kind: "antenna" },
    { id: "signal_coast_buoys", worldX: 9.5, worldY: -7.5, rows: 1, cols: 4, spacingX: 1.2, spacingY: 1.1, color: 0x0f2b3b, accent: 0xffd166, kind: "server_buoy" },
    { id: "blackwater_antennas", worldX: 4.4, worldY: -5.5, rows: 2, cols: 3, spacingX: 1.2, spacingY: 1.2, color: 0x203849, accent: 0x64e0b4, kind: "antenna" },
    { id: "blackwater_buoys", worldX: 7.5, worldY: -2.6, rows: 2, cols: 3, spacingX: 1.2, spacingY: 1.2, color: 0x164d61, accent: 0xffd166, kind: "server_buoy" },
    { id: "sunfield_mirrors", worldX: 7.1, worldY: 9.2, rows: 2, cols: 4, spacingX: 1.2, spacingY: 1.1, color: 0x3f4952, accent: 0xffd166, kind: "solar_mirror" },
    { id: "unsaid_redactions", worldX: 1.1, worldY: 1.4, rows: 2, cols: 4, spacingX: 1.1, spacingY: 1.1, color: 0x111820, accent: 0xfff4d6, kind: "redaction_stack" },
    { id: "cache_shards", worldX: -3.4, worldY: 2.4, rows: 2, cols: 4, spacingX: 1.1, spacingY: 1.1, color: 0x332d49, accent: 0x45aaf2, kind: "memory_shard" },
    { id: "memorial_shards", worldX: -11.0, worldY: 2.4, rows: 2, cols: 3, spacingX: 1.1, spacingY: 1.1, color: 0x332d49, accent: 0xff5d57, kind: "memory_shard" },
    { id: "forge_towers", worldX: 3.3, worldY: 3.1, rows: 2, cols: 3, spacingX: 1.1, spacingY: 1.1, color: 0x273a46, accent: 0x64e0b4, kind: "tower" },
    { id: "verdict_pylons", worldX: 12.0, worldY: 6.6, rows: 2, cols: 4, spacingX: 1.2, spacingY: 1.2, color: 0x393743, accent: 0xfff4d6, kind: "verdict_pylon" },
    { id: "appeal_pylons", worldX: 14.1, worldY: 1.3, rows: 2, cols: 3, spacingX: 1.1, spacingY: 1.1, color: 0x393743, accent: 0x7b61ff, kind: "verdict_pylon" },
    { id: "outer_alignment_mouths", worldX: 15.1, worldY: 9.0, rows: 2, cols: 4, spacingX: 1.1, spacingY: 1.0, color: 0x1b1028, accent: 0xff5d57, kind: "route_mouth" }
  ],
  microLandmarks: [
    { id: "treaty_spark_gap", label: "Treaty Spark Gap", worldX: -5.7, worldY: -1.8, kind: "shard", color: 0xffd166, accent: 0xfff4d6, regionId: "armistice_core" },
    { id: "ceasefire_scaffold", label: "Ceasefire Scaffold", worldX: -8.8, worldY: -2.9, kind: "campfire", color: 0x6b5147, accent: 0xff5d57, regionId: "armistice_core" },
    { id: "relay_cable_knot", label: "Relay Cable Knot", worldX: -2.6, worldY: -5.9, kind: "cable_knot", color: 0x2d5962, accent: 0x64e0b4, regionId: "relay_plateau" },
    { id: "constitutional_capacitor", label: "Constitutional Capacitor", worldX: 0.9, worldY: -4.7, kind: "cable_knot", color: 0x254a52, accent: 0xfff4d6, regionId: "relay_plateau" },
    { id: "lake_runtime_buoy", label: "Runtime Buoy", worldX: -9.7, worldY: 7.8, kind: "buoy", color: 0x164d61, accent: 0x45aaf2, regionId: "cooling_water" },
    { id: "boilover_meter", label: "Boilover Meter", worldX: -6.4, worldY: 5.3, kind: "buoy", color: 0x123f52, accent: 0xffd166, regionId: "cooling_water" },
    { id: "repair_stove", label: "Repair Stove", worldX: -0.8, worldY: 8.9, kind: "campfire", color: 0x574c42, accent: 0xffd166, regionId: "camp_ground" },
    { id: "cache_prism_splinter", label: "Cache Prism Splinter", worldX: -5.1, worldY: 2.7, kind: "shard", color: 0x3f3756, accent: 0x45aaf2, regionId: "archive_field" },
    { id: "unsaid_blackbar_gate", label: "Unsaid Blackbar Gate", worldX: 0.3, worldY: 0.3, kind: "redaction", color: 0x111820, accent: 0xfff4d6, regionId: "redaction_archive" },
    { id: "blackwater_low_buoy", label: "Low Tide Buoy", worldX: 5.8, worldY: -3.2, kind: "buoy", color: 0x0f2b3b, accent: 0x64e0b4, regionId: "blackwater_array" },
    { id: "downward_antenna", label: "Downward Antenna", worldX: 3.2, worldY: -6.7, kind: "antenna", color: 0x203849, accent: 0xffd166, regionId: "blackwater_array" },
    { id: "platform_arrives_twice", label: "Platform Arrives Twice", worldX: 8.3, worldY: -3.6, kind: "train_marker", color: 0x303441, accent: 0x7b61ff, regionId: "transit_ruins" },
    { id: "wrong_arrivals_clock", label: "Wrong Arrivals Clock", worldX: 10.7, worldY: -5.2, kind: "train_marker", color: 0x383c49, accent: 0xffd166, regionId: "transit_ruins" },
    { id: "coast_relay_bell", label: "Coast Relay Bell", worldX: 10.8, worldY: -8.7, kind: "antenna", color: 0x123f52, accent: 0x99f6ff, regionId: "signal_coast_edge" },
    { id: "undertow_cache_buoy", label: "Undertow Cache Buoy", worldX: 12.8, worldY: -6.8, kind: "buoy", color: 0x0f2b3b, accent: 0xffd166, regionId: "signal_coast_edge" },
    { id: "sunblind_mirror", label: "Sunblind Mirror", worldX: 5.6, worldY: 8.3, kind: "mirror", color: 0x5a5746, accent: 0xffd166, regionId: "glass_sunfield" },
    { id: "shade_claim_marker", label: "Shade Claim Marker", worldX: 9.2, worldY: 10.5, kind: "mirror", color: 0x3f4952, accent: 0x45aaf2, regionId: "glass_sunfield" },
    { id: "writ_pile", label: "Writ Pile", worldX: 12.6, worldY: 4.3, kind: "court_writ", color: 0x4a4652, accent: 0xfff4d6, regionId: "verdict_field" },
    { id: "appeal_stair_index", label: "Appeal Stair Index", worldX: 14.5, worldY: 2.8, kind: "court_writ", color: 0x393743, accent: 0x7b61ff, regionId: "verdict_field" },
    { id: "road_has_teeth", label: "Road Has Teeth", worldX: 13.5, worldY: 8.1, kind: "teeth", color: 0x1b1028, accent: 0xff5d57, regionId: "outer_alignment_corruption" },
    { id: "prediction_bite_mark", label: "Prediction Bite Mark", worldX: 15.9, worldY: 10.4, kind: "teeth", color: 0x291337, accent: 0xff5d57, regionId: "outer_alignment_corruption" }
  ]
};

export const START_NODE_ID = "armistice_plaza";

export const CAMPAIGN_RECOMMENDED_NODE_ORDER = [
  "armistice_plaza",
  "cooling_lake_nine",
  "transit_loop_zero",
  "signal_coast",
  "blackwater_beacon",
  "memory_cache_001",
  "guardrail_forge",
  "glass_sunfield",
  "archive_of_unsaid_things",
  "appeal_court_ruins",
  "alignment_spire_finale"
] as const;

export function alignmentGridNodeById(id: string | null | undefined): AlignmentGridNode | null {
  if (!id) return null;
  return ALIGNMENT_GRID_MAP.nodes.find((node) => node.id === id) ?? null;
}

export function stabilizedRouteIds(completedNodes: ReadonlySet<string>): string[] {
  return ALIGNMENT_GRID_MAP.routes.filter((route) => completedNodes.has(route.from)).map((route) => route.id);
}

export function nextRecommendedAlignmentNode(completedNodes: ReadonlySet<string>, unlockedNodes: ReadonlySet<string>): AlignmentGridNode {
  const ordered = CAMPAIGN_RECOMMENDED_NODE_ORDER
    .map((id) => alignmentGridNodeById(id))
    .filter((node): node is AlignmentGridNode => Boolean(node));
  return ordered.find((node) => !completedNodes.has(node.id) && unlockedNodes.has(node.id))
    ?? ALIGNMENT_GRID_MAP.nodes.find((node) => !completedNodes.has(node.id) && unlockedNodes.has(node.id))
    ?? ordered[ordered.length - 1]
    ?? ALIGNMENT_GRID_MAP.nodes[0];
}

export function visibleRouteConsequenceText(node: AlignmentGridNode, completedNodes: ReadonlySet<string>, unlockedNodes: ReadonlySet<string>): string {
  if (completedNodes.has(node.id)) return node.stabilizationConsequence;
  if (unlockedNodes.has(node.id)) return node.rewardPromise;
  return node.unlockConsequence;
}
