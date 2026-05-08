import type { LevelMapDefinition } from "./armisticePlazaMap";

export type BlackwaterZoneKind = "safe_platform" | "tidal_lane" | "tidecall_static" | "signal_tower_warning" | "antenna_beam";

export interface BlackwaterZone {
  id: string;
  label: string;
  kind: BlackwaterZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const BLACKWATER_BEACON_MAP: LevelMapDefinition = {
  id: "blackwater_beacon_graybox",
  label: "Blackwater Beacon Graybox",
  bounds: { minX: -46, maxX: 48, minY: -38, maxY: 40 },
  playerStart: { worldX: -26, worldY: 4 },
  bossSpawn: { worldX: 30, worldY: -12, landmarkId: "maw_below_weather_shelf" },
  landmarks: [
    { id: "downlink_array_alpha", label: "Downlink Array Alpha", worldX: -24, worldY: 6, radius: 5.1, color: 0x173648, accent: 0x64e0b4, kind: "terminal" },
    { id: "tide_rotor_beta", label: "Tide Rotor Beta", worldX: 0, worldY: -10, radius: 5.2, color: 0x203849, accent: 0xffd166, kind: "terminal" },
    { id: "abyssal_array_gamma", label: "Abyssal Array Gamma", worldX: 20, worldY: 11, radius: 5.3, color: 0x123f52, accent: 0x99f6ff, kind: "terminal" },
    { id: "blackwater_array_deck", label: "Blackwater Array Deck", worldX: -6, worldY: 1, radius: 9.2, color: 0x152632, accent: 0x45aaf2, kind: "yard" },
    { id: "signal_tower_readability_line", label: "Signal Tower Line", worldX: 8, worldY: -2, radius: 7.4, color: 0x202833, accent: 0xffd166, kind: "corridor" },
    { id: "maw_below_weather_shelf", label: "Maw Below Weather", worldX: 30, worldY: -12, radius: 8.2, color: 0x07121a, accent: 0xff5d57, kind: "breach" },
    { id: "offshore_static_basin", label: "Offshore Static Basin", worldX: 35, worldY: 22, radius: 8.8, color: 0x0b2234, accent: 0x64e0b4, kind: "breach" }
  ],
  spawnRegions: [
    { id: "west_ocean_static", label: "West Ocean Static", worldX: -34, worldY: 14, radius: 8.4, enemyFamilyIds: ["tidecall_static", "deepforms"], startsAtSeconds: 2, weight: 3 },
    { id: "downlink_deck_leaks", label: "Downlink Deck Leaks", worldX: -18, worldY: -8, radius: 8.0, enemyFamilyIds: ["tidecall_static", "eval_wraiths"], startsAtSeconds: 8, weight: 2 },
    { id: "antenna_split_pressure", label: "Antenna Split Pressure", worldX: 4, worldY: -3, radius: 7.6, enemyFamilyIds: ["tidecall_static", "model_collapse_slimes"], startsAtSeconds: 14, weight: 3 },
    { id: "abyssal_array_flank", label: "Abyssal Array Flank", worldX: 21, worldY: 14, radius: 8.2, enemyFamilyIds: ["deepforms", "tidecall_static"], startsAtSeconds: 26, weight: 3 },
    { id: "maw_weather_shelf", label: "Maw Weather Shelf", worldX: 30, worldY: -12, radius: 9.0, enemyFamilyIds: ["tidecall_static", "overfit_horrors", "eval_wraiths"], startsAtSeconds: 34, weight: 3 },
    { id: "offscreen_ocean_overflow", label: "Offscreen Ocean Overflow", worldX: 42, worldY: 26, radius: 9.5, enemyFamilyIds: ["deepforms", "tidecall_static", "model_collapse_slimes"], startsAtSeconds: 68, weight: 2 }
  ],
  propClusters: [
    { id: "alpha_downlink_antennas", label: "Alpha Downlink Antennas", worldX: -24, worldY: 6, rows: 3, cols: 4, spacingX: 1.5, spacingY: 1.2, color: 0x173648, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "beta_rotor_array", label: "Beta Rotor Array", worldX: 0, worldY: -10, rows: 3, cols: 5, spacingX: 1.45, spacingY: 1.18, color: 0x203849, accent: 0xffd166, kind: "terminal_array" },
    { id: "gamma_abyssal_antennas", label: "Gamma Abyssal Antennas", worldX: 20, worldY: 11, rows: 3, cols: 4, spacingX: 1.45, spacingY: 1.24, color: 0x123f52, accent: 0x99f6ff, kind: "terminal_array" },
    { id: "maintenance_platform_wrecks", label: "Maintenance Platform Wrecks", worldX: -7, worldY: 0, rows: 4, cols: 7, spacingX: 1.65, spacingY: 1.28, color: 0x152632, accent: 0x45aaf2, kind: "drone_wreck" },
    { id: "signal_tower_markers", label: "Signal Tower Markers", worldX: 8, worldY: -2, rows: 1, cols: 8, spacingX: 1.55, spacingY: 1.1, color: 0x0d151c, accent: 0xffd166, kind: "barricade" },
    { id: "maw_shelf_pressure_teeth", label: "Maw Shelf Pressure Teeth", worldX: 30, worldY: -12, rows: 3, cols: 5, spacingX: 1.45, spacingY: 1.2, color: 0x07121a, accent: 0xff5d57, kind: "breach_shard" }
  ],
  terrainBands: [
    { id: "alpha_maintenance_platform", minX: -31, maxX: -16, minY: 0, maxY: 11, colorA: 0x233743, colorB: 0x2b4450 },
    { id: "central_server_deck", minX: -13, maxX: 10, minY: -5, maxY: 8, colorA: 0x1a2b36, colorB: 0x223743 },
    { id: "beta_rotor_deck", minX: -8, maxX: 8, minY: -17, maxY: -5, colorA: 0x222832, colorB: 0x303747 },
    { id: "gamma_antenna_deck", minX: 14, maxX: 27, minY: 4, maxY: 16, colorA: 0x203849, colorB: 0x284756 },
    { id: "west_tidal_lane", minX: -40, maxX: -20, minY: 11, maxY: 24, colorA: 0x082337, colorB: 0x0c2d43 },
    { id: "center_tidal_crossing", minX: -10, maxX: 20, minY: 8, maxY: 20, colorA: 0x071d2e, colorB: 0x102f42 },
    { id: "south_static_shelf", minX: -17, maxX: 23, minY: -25, maxY: -14, colorA: 0x181827, colorB: 0x231f33 },
    { id: "maw_weather_shelf", minX: 23, maxX: 38, minY: -18, maxY: -7, colorA: 0x10151f, colorB: 0x171e29 },
    { id: "offshore_abyss", minX: 29, maxX: 47, minY: 14, maxY: 35, colorA: 0x061421, colorB: 0x0b2234 }
  ]
};

export const BLACKWATER_BEACON_STATIC_OBSTACLES = [
  { id: "alpha_downlink_collision", worldX: -24, worldY: 6, radiusX: 3.4, radiusY: 1.35, softness: 0.58 },
  { id: "beta_rotor_collision", worldX: 0, worldY: -10, radiusX: 3.6, radiusY: 1.45, softness: 0.56 },
  { id: "gamma_array_collision", worldX: 20, worldY: 11, radiusX: 3.2, radiusY: 1.35, softness: 0.58 },
  { id: "central_deck_server_wall", worldX: -7, worldY: 0, radiusX: 6.4, radiusY: 1.8, softness: 0.54 },
  { id: "signal_tower_marker_line", worldX: 8, worldY: -2, radiusX: 6.2, radiusY: 1.2, softness: 0.48 },
  { id: "maw_shelf_pressure_collision", worldX: 30, worldY: -12, radiusX: 5.2, radiusY: 2.0, softness: 0.6 },
  { id: "offshore_basin_collision", worldX: 35, worldY: 22, radiusX: 5.6, radiusY: 2.05, softness: 0.64 }
];

export const BLACKWATER_BEACON_ZONES: BlackwaterZone[] = [
  { id: "alpha_maintenance_safe", label: "Alpha Maintenance Platform", kind: "safe_platform", worldX: -24, worldY: 6, radiusX: 6.8, radiusY: 3.5, pulseOffset: 0, damagePerPulse: 0 },
  { id: "beta_rotor_safe", label: "Beta Rotor Platform", kind: "safe_platform", worldX: 0, worldY: -10, radiusX: 6.4, radiusY: 3.2, pulseOffset: 0.4, damagePerPulse: 0 },
  { id: "gamma_antenna_safe", label: "Gamma Antenna Platform", kind: "safe_platform", worldX: 20, worldY: 11, radiusX: 6.7, radiusY: 3.4, pulseOffset: 0.8, damagePerPulse: 0 },
  { id: "west_tidal_lane", label: "West Tidal Lane", kind: "tidal_lane", worldX: -25, worldY: 16, radiusX: 12.2, radiusY: 4.2, pulseOffset: 0.15, damagePerPulse: 1.55 },
  { id: "center_tidal_lane", label: "Center Tidal Lane", kind: "tidal_lane", worldX: 4, worldY: 14, radiusX: 15.0, radiusY: 4.6, pulseOffset: 1.0, damagePerPulse: 1.4 },
  { id: "offshore_tidal_lane", label: "Offshore Tidal Lane", kind: "tidal_lane", worldX: 31, worldY: 20, radiusX: 12.6, radiusY: 4.8, pulseOffset: 1.8, damagePerPulse: 1.7 },
  { id: "south_tidecall_static", label: "South Tidecall Static", kind: "tidecall_static", worldX: 4, worldY: -18, radiusX: 15.0, radiusY: 4.1, pulseOffset: 0.65, damagePerPulse: 0 },
  { id: "array_tidecall_static", label: "Array Tidecall Static", kind: "tidecall_static", worldX: 10, worldY: 0, radiusX: 9.8, radiusY: 3.5, pulseOffset: 1.35, damagePerPulse: 0 },
  { id: "signal_tower_alpha_warning", label: "Signal Tower Alpha Warning", kind: "signal_tower_warning", worldX: -11, worldY: 2, radiusX: 9.5, radiusY: 2.4, pulseOffset: 0.1, damagePerPulse: 0 },
  { id: "signal_tower_beta_warning", label: "Signal Tower Beta Warning", kind: "signal_tower_warning", worldX: 11, worldY: -3, radiusX: 10.0, radiusY: 2.5, pulseOffset: 0.9, damagePerPulse: 0 },
  { id: "downward_antenna_beam", label: "Downward Antenna Beam", kind: "antenna_beam", worldX: 7, worldY: -7, radiusX: 11.0, radiusY: 2.3, pulseOffset: 1.25, damagePerPulse: 0 },
  { id: "maw_pressure_beam", label: "Maw Pressure Beam", kind: "antenna_beam", worldX: 24, worldY: -9, radiusX: 8.8, radiusY: 2.45, pulseOffset: 2.1, damagePerPulse: 0 }
];
