import type { LevelMapDefinition } from "./armisticePlazaMap";

export type CoolingLakeHazardKind = "coolant_pool" | "electric_cable" | "vent_pulse" | "safe_island";

export interface CoolingLakeHazardZone {
  id: string;
  label: string;
  kind: CoolingLakeHazardKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const COOLING_LAKE_NINE_MAP: LevelMapDefinition = {
  id: "cooling_lake_nine_graybox",
  label: "Cooling Lake Nine Graybox",
  bounds: { minX: -36, maxX: 36, minY: -34, maxY: 38 },
  playerStart: { worldX: 0, worldY: 0 },
  bossSpawn: { worldX: -13, worldY: 19, landmarkId: "motherboard_eel_rack" },
  landmarks: [
    { id: "server_buoy_alpha", label: "Server Buoy Alpha", worldX: 0, worldY: 0, radius: 4.4, color: 0x1c6d76, accent: 0x7fffd4, kind: "terminal" },
    { id: "server_buoy_beta", label: "Server Buoy Beta", worldX: 13, worldY: 11, radius: 4.1, color: 0x27506d, accent: 0xffd166, kind: "terminal" },
    { id: "server_buoy_gamma", label: "Server Buoy Gamma", worldX: -18, worldY: 15, radius: 4.3, color: 0x234b58, accent: 0x64e0b4, kind: "terminal" },
    { id: "flooded_server_lanes", label: "Flooded Server Lanes", worldX: 8, worldY: -11, radius: 7.6, color: 0x172a3a, accent: 0x45aaf2, kind: "yard" },
    { id: "coolant_vent_stack", label: "Coolant Vent Stack", worldX: -7, worldY: 8, radius: 5.8, color: 0x0f3141, accent: 0x99f6ff, kind: "breach" },
    { id: "motherboard_eel_rack", label: "Motherboard Eel Rack", worldX: -13, worldY: 19, radius: 6.5, color: 0x102333, accent: 0xff5d57, kind: "breach" }
  ],
  spawnRegions: [
    { id: "coolant_cable_prompt_leeches", label: "Cable Prompt Leeches", worldX: -6, worldY: 8, radius: 6.6, enemyFamilyIds: ["prompt_leeches", "model_collapse_slimes", "bad_outputs"], startsAtSeconds: 2.5, weight: 2 },
    { id: "submerged_rack_deepforms", label: "Submerged Rack Deepforms", worldX: -21, worldY: 17, radius: 6.2, enemyFamilyIds: ["prompt_leeches", "deepforms", "model_collapse_slimes"], startsAtSeconds: 9, weight: 3 },
    { id: "server_buoy_slime_overflow", label: "Server Buoy Overflow", worldX: 15, worldY: 11, radius: 5.8, enemyFamilyIds: ["prompt_leeches", "model_collapse_slimes", "deepforms"], startsAtSeconds: 15, weight: 3 },
    { id: "north_flood_lane_deepforms", label: "North Flood Lane", worldX: 19, worldY: -18, radius: 6.4, enemyFamilyIds: ["deepforms", "model_collapse_slimes"], startsAtSeconds: 24, weight: 2 },
    { id: "motherboard_eel_leech_surge", label: "Motherboard Eel Surge", worldX: -13, worldY: 19, radius: 7.2, enemyFamilyIds: ["prompt_leeches", "deepforms", "model_collapse_slimes"], startsAtSeconds: 36, weight: 3 },
    { id: "late_cooling_lake_overflow", label: "Late Lake Overflow", worldX: 25, worldY: 22, radius: 7.4, enemyFamilyIds: ["prompt_leeches", "model_collapse_slimes", "deepforms"], startsAtSeconds: 70, weight: 3 }
  ],
  propClusters: [
    { id: "alpha_buoy_pad", label: "Alpha Buoy Pad", worldX: 0, worldY: 0, rows: 2, cols: 3, spacingX: 1.7, spacingY: 1.2, color: 0x1c6d76, accent: 0x7fffd4, kind: "terminal_array" },
    { id: "beta_dry_island_racks", label: "Beta Dry Rack Island", worldX: 13, worldY: 11, rows: 3, cols: 4, spacingX: 1.5, spacingY: 1.4, color: 0x384b55, accent: 0xffd166, kind: "terminal_array" },
    { id: "gamma_server_wrecks", label: "Gamma Server Wrecks", worldX: -18, worldY: 15, rows: 4, cols: 4, spacingX: 1.7, spacingY: 1.45, color: 0x263a47, accent: 0x64e0b4, kind: "rubble" },
    { id: "cable_route_a", label: "Cable Route A", worldX: -7, worldY: 8, rows: 1, cols: 8, spacingX: 1.6, spacingY: 1.1, color: 0x0c161f, accent: 0xff5d57, kind: "barricade" },
    { id: "submerged_server_wrecks", label: "Submerged Wreck Cluster", worldX: 8, worldY: -11, rows: 4, cols: 6, spacingX: 1.8, spacingY: 1.4, color: 0x1e3140, accent: 0x45aaf2, kind: "drone_wreck" },
    { id: "eel_rack_markers", label: "Eel Rack Markers", worldX: -13, worldY: 19, rows: 2, cols: 5, spacingX: 1.8, spacingY: 1.6, color: 0x0f1b2c, accent: 0xff5d57, kind: "breach_shard" }
  ],
  terrainBands: [
    { id: "alpha_dry_island", minX: -6, maxX: 6, minY: -5, maxY: 5, colorA: 0x2f4b53, colorB: 0x365a60 },
    { id: "beta_dry_island", minX: 8, maxX: 19, minY: 7, maxY: 16, colorA: 0x364f57, colorB: 0x435e63 },
    { id: "gamma_dry_island", minX: -24, maxX: -13, minY: 10, maxY: 20, colorA: 0x2c464c, colorB: 0x36575d },
    { id: "flooded_server_lane_east", minX: 4, maxX: 25, minY: -19, maxY: -7, colorA: 0x142c3d, colorB: 0x18384a },
    { id: "flooded_server_lane_center", minX: -10, maxX: 8, minY: 4, maxY: 13, colorA: 0x123443, colorB: 0x173d4b },
    { id: "coolant_cable_trench", minX: -17, maxX: -3, minY: 5, maxY: 12, colorA: 0x0d2330, colorB: 0x112d39 },
    { id: "motherboard_eel_basin", minX: -21, maxX: -5, minY: 16, maxY: 27, colorA: 0x11192a, colorB: 0x162336 },
    { id: "kettle_coast_carryover_route", minX: 20, maxX: 34, minY: 18, maxY: 32, colorA: 0x253342, colorB: 0x2f4050 }
  ]
};

export const COOLING_LAKE_STATIC_OBSTACLES = [
  { id: "alpha_buoy_terminal_bank", worldX: 0.8, worldY: -0.5, radiusX: 2.5, radiusY: 1.35, softness: 0.72 },
  { id: "beta_server_wreck_wall", worldX: 13.2, worldY: 11.4, radiusX: 3.5, radiusY: 1.75, softness: 0.78 },
  { id: "gamma_sunken_racks", worldX: -18.2, worldY: 15.1, radiusX: 4.1, radiusY: 1.85, softness: 0.74 },
  { id: "center_cable_pressure_route", worldX: -7.5, worldY: 8.2, radiusX: 4.5, radiusY: 1.2, softness: 0.52 },
  { id: "east_submerged_rack_cluster", worldX: 8.5, worldY: -11.2, radiusX: 5.2, radiusY: 2.15, softness: 0.62 },
  { id: "eel_rack_emergence_collision", worldX: -13, worldY: 19, radiusX: 4.4, radiusY: 1.85, softness: 0.64 }
];

export const COOLING_LAKE_HAZARDS: CoolingLakeHazardZone[] = [
  { id: "alpha_safe_island", label: "Alpha Dry Island", kind: "safe_island", worldX: 0, worldY: 0, radiusX: 5.4, radiusY: 3.5, pulseOffset: 0, damagePerPulse: 0 },
  { id: "beta_safe_island", label: "Beta Dry Island", kind: "safe_island", worldX: 13, worldY: 11, radiusX: 5.2, radiusY: 3.1, pulseOffset: 0.2, damagePerPulse: 0 },
  { id: "gamma_safe_island", label: "Gamma Dry Island", kind: "safe_island", worldX: -18, worldY: 15, radiusX: 5.4, radiusY: 3.4, pulseOffset: 0.4, damagePerPulse: 0 },
    { id: "coolant_lane_center", label: "Center Coolant Lane", kind: "coolant_pool", worldX: 4, worldY: 6, radiusX: 10.4, radiusY: 4.15, pulseOffset: 0.5, damagePerPulse: 0.95 },
    { id: "east_flooded_server_lane", label: "East Flooded Lane", kind: "coolant_pool", worldX: 10, worldY: -12, radiusX: 11.4, radiusY: 5.15, pulseOffset: 1.1, damagePerPulse: 0.7 },
    { id: "beta_cable_arc", label: "Beta Cable Arc", kind: "electric_cable", worldX: 8, worldY: 7.4, radiusX: 10.2, radiusY: 2.25, pulseOffset: 0.2, damagePerPulse: 4.2 },
    { id: "beta_pad_cable_ring", label: "Beta Pad Cable Ring", kind: "electric_cable", worldX: 13, worldY: 10.6, radiusX: 5.6, radiusY: 2.35, pulseOffset: 2.8, damagePerPulse: 2.6 },
    { id: "gamma_cable_arc", label: "Gamma Cable Arc", kind: "electric_cable", worldX: -12, worldY: 12, radiusX: 9.8, radiusY: 2.15, pulseOffset: 1.6, damagePerPulse: 5.4 },
    { id: "vent_stack_pulse", label: "Vent Stack Pulse", kind: "vent_pulse", worldX: -7, worldY: 8, radiusX: 6.2, radiusY: 3.55, pulseOffset: 0.9, damagePerPulse: 0 },
    { id: "beta_vent_pulse", label: "Beta Intake Vent", kind: "vent_pulse", worldX: 10.2, worldY: 8.6, radiusX: 3.55, radiusY: 1.95, pulseOffset: 1.35, damagePerPulse: 0 },
    { id: "eel_basin_electrified", label: "Eel Basin Electrification", kind: "electric_cable", worldX: -13, worldY: 19, radiusX: 8.4, radiusY: 4.25, pulseOffset: 2.2, damagePerPulse: 6.2 }
  ];
