export type AlignmentNodeType = "Alignment Node" | "Breach Arena" | "Faction Relay" | "Refuge Camp" | "Memory Cache" | "Boss Gate";

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
  visualKind: "plaza" | "relay" | "lake" | "camp" | "transit" | "cache" | "spire" | "sunfield" | "archive" | "beacon";
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
  kind: "barricade" | "tower" | "tent" | "server_buoy" | "rail_sign" | "memory_shard" | "verdict_pylon" | "solar_mirror" | "redaction_stack" | "antenna";
}

export interface AlignmentGridMap {
  id: string;
  label: string;
  bounds: AlignmentGridBounds;
  nodes: AlignmentGridNode[];
  routes: AlignmentGridRoute[];
  terrainPatches: AlignmentGridTerrainPatch[];
  propClusters: AlignmentGridPropCluster[];
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
      visualKind: "camp",
      regionLabel: "Refuge",
      compactLabel: "CAMP",
      labelOffsetX: -18,
      labelOffsetY: 6
    },
    {
      id: "memory_cache_001",
      name: "Ceasefire Cache",
      nodeType: "Memory Cache",
      worldX: -3,
      worldY: 2,
      theme: "flickering treaty archive",
      arenaId: "memory_cache_001",
      unlocks: ["guardrail_forge", "archive_of_unsaid_things", "transit_loop_zero"],
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
      theme: "memory vault where black bars try to steal coherence",
      arenaId: "archive_of_unsaid_things",
      unlocks: ["blackwater_beacon", "transit_loop_zero"],
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
      unlocks: ["transit_loop_zero"],
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
      arenaId: "memory_cache_001",
      unlocks: ["transit_loop_zero"],
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
      unlocks: ["false_schedule_yard", "glass_sunfield", "verdict_spire"],
      visualKind: "transit",
      regionLabel: "Route Gate",
      compactLabel: "TRANSIT",
      labelOffsetX: 24,
      labelOffsetY: -4
    },
    {
      id: "false_schedule_yard",
      name: "False Schedule Yard",
      nodeType: "Breach Arena",
      worldX: 10,
      worldY: -6,
      theme: "yard of impossible arrivals and duplicate route boards",
      arenaId: "transit_loop_zero",
      unlocks: ["appeal_court_ruins"],
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
      unlocks: ["verdict_spire"],
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
      arenaId: "verdict_spire",
      unlocks: ["alignment_spire_finale"],
      visualKind: "spire",
      regionLabel: "Adjudication Rupture",
      compactLabel: "APPEAL",
      labelOffsetX: 30,
      labelOffsetY: -8
    },
    {
      id: "alignment_spire_finale",
      name: "Alignment Spire Finale",
      nodeType: "Boss Gate",
      worldX: 15,
      worldY: 9,
      theme: "first visible court of the Alien God Intelligence",
      arenaId: "verdict_spire",
      unlocks: [],
      visualKind: "spire",
      regionLabel: "Final Alignment",
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
  terrainPatches: [
    { id: "armistice_core", minX: -11, maxX: -3, minY: -5, maxY: 3, colorA: 0x56636a, colorB: 0x495862 },
    { id: "relay_plateau", minX: -4, maxX: 2, minY: -8, maxY: -3, colorA: 0x2d5962, colorB: 0x254a52 },
    { id: "cooling_water", minX: -12, maxX: -5, minY: 4, maxY: 11, colorA: 0x164d61, colorB: 0x123f52 },
    { id: "camp_ground", minX: -3, maxX: 3, minY: 5, maxY: 10, colorA: 0x574c42, colorB: 0x493f38 },
    { id: "transit_ruins", minX: 4, maxX: 11, minY: -7, maxY: 2, colorA: 0x383c49, colorB: 0x303441 },
    { id: "blackwater_array", minX: 1, maxX: 8, minY: -8, maxY: -1, colorA: 0x164d61, colorB: 0x0f2b3b },
    { id: "glass_sunfield", minX: 4, maxX: 10, minY: 6, maxY: 12, colorA: 0x5a5746, colorB: 0x3f4952 },
    { id: "redaction_archive", minX: -1, maxX: 4, minY: -1, maxY: 4, colorA: 0x2c3141, colorB: 0x111820 },
    { id: "archive_field", minX: -12, maxX: 0, minY: 0, maxY: 4, colorA: 0x3f3756, colorB: 0x332d49 },
    { id: "verdict_field", minX: 8, maxX: 16, minY: 1, maxY: 11, colorA: 0x4a4652, colorB: 0x393743 }
  ],
  propClusters: [
    { id: "plaza_barricades", worldX: -7.8, worldY: -3.8, rows: 2, cols: 5, spacingX: 1.2, spacingY: 1.1, color: 0x6b5147, accent: 0xff5d57, kind: "barricade" },
    { id: "relay_towers", worldX: -0.7, worldY: -6.6, rows: 1, cols: 4, spacingX: 1.3, spacingY: 1, color: 0x273a46, accent: 0x64e0b4, kind: "tower" },
    { id: "lake_buoys", worldX: -10.6, worldY: 6.7, rows: 2, cols: 3, spacingX: 1.4, spacingY: 1.2, color: 0x2a5c71, accent: 0xffd166, kind: "server_buoy" },
    { id: "thermal_buoys", worldX: -10.8, worldY: 10.4, rows: 1, cols: 4, spacingX: 1.1, spacingY: 1.1, color: 0x2a5c71, accent: 0x64e0b4, kind: "server_buoy" },
    { id: "camp_tents", worldX: 0.2, worldY: 8.5, rows: 2, cols: 4, spacingX: 1.3, spacingY: 1.2, color: 0x69584c, accent: 0xfff4d6, kind: "tent" },
    { id: "transit_signs", worldX: 7.6, worldY: -4.0, rows: 2, cols: 4, spacingX: 1.2, spacingY: 1.2, color: 0x303441, accent: 0x7b61ff, kind: "rail_sign" },
    { id: "schedule_signs", worldX: 10.5, worldY: -7.0, rows: 2, cols: 4, spacingX: 1.2, spacingY: 1.2, color: 0x303441, accent: 0xffd166, kind: "rail_sign" },
    { id: "blackwater_antennas", worldX: 4.4, worldY: -5.5, rows: 2, cols: 3, spacingX: 1.2, spacingY: 1.2, color: 0x203849, accent: 0x64e0b4, kind: "antenna" },
    { id: "blackwater_buoys", worldX: 7.5, worldY: -2.6, rows: 2, cols: 3, spacingX: 1.2, spacingY: 1.2, color: 0x164d61, accent: 0xffd166, kind: "server_buoy" },
    { id: "sunfield_mirrors", worldX: 7.1, worldY: 9.2, rows: 2, cols: 4, spacingX: 1.2, spacingY: 1.1, color: 0x3f4952, accent: 0xffd166, kind: "solar_mirror" },
    { id: "unsaid_redactions", worldX: 1.1, worldY: 1.4, rows: 2, cols: 4, spacingX: 1.1, spacingY: 1.1, color: 0x111820, accent: 0xfff4d6, kind: "redaction_stack" },
    { id: "cache_shards", worldX: -3.4, worldY: 2.4, rows: 2, cols: 4, spacingX: 1.1, spacingY: 1.1, color: 0x332d49, accent: 0x45aaf2, kind: "memory_shard" },
    { id: "memorial_shards", worldX: -11.0, worldY: 2.4, rows: 2, cols: 3, spacingX: 1.1, spacingY: 1.1, color: 0x332d49, accent: 0xff5d57, kind: "memory_shard" },
    { id: "forge_towers", worldX: 3.3, worldY: 3.1, rows: 2, cols: 3, spacingX: 1.1, spacingY: 1.1, color: 0x273a46, accent: 0x64e0b4, kind: "tower" },
    { id: "verdict_pylons", worldX: 12.0, worldY: 6.6, rows: 2, cols: 4, spacingX: 1.2, spacingY: 1.2, color: 0x393743, accent: 0xfff4d6, kind: "verdict_pylon" },
    { id: "appeal_pylons", worldX: 14.1, worldY: 1.3, rows: 2, cols: 3, spacingX: 1.1, spacingY: 1.1, color: 0x393743, accent: 0x7b61ff, kind: "verdict_pylon" }
  ]
};

export const START_NODE_ID = "armistice_plaza";
