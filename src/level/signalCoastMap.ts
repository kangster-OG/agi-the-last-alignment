import type { LevelMapDefinition } from "./armisticePlazaMap";

export type SignalCoastZoneKind = "safe_spit" | "corrupted_surf" | "clear_signal_window" | "static_field" | "cable_arc";

export interface SignalCoastZone {
  id: string;
  label: string;
  kind: SignalCoastZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const SIGNAL_COAST_MAP: LevelMapDefinition = {
  id: "signal_coast_graybox",
  label: "Signal Coast Graybox",
  bounds: { minX: -40, maxX: 42, minY: -34, maxY: 36 },
  playerStart: { worldX: -20, worldY: 5 },
  bossSpawn: { worldX: 26, worldY: -10, landmarkId: "lighthouse_that_answers_shelf" },
  landmarks: [
    { id: "shore_relay_alpha", label: "Shore Relay Alpha", worldX: -20, worldY: 5, radius: 4.6, color: 0x1a5361, accent: 0x99f6ff, kind: "terminal" },
    { id: "causeway_relay_beta", label: "Causeway Relay Beta", worldX: 1, worldY: -8, radius: 4.4, color: 0x273a46, accent: 0xffd166, kind: "terminal" },
    { id: "lighthouse_relay_gamma", label: "Lighthouse Relay Gamma", worldX: 18, worldY: 6, radius: 4.7, color: 0x203849, accent: 0x64e0b4, kind: "terminal" },
    { id: "broken_server_causeway", label: "Broken Server Causeway", worldX: -8, worldY: -2, radius: 7.4, color: 0x1a2c35, accent: 0x45aaf2, kind: "yard" },
    { id: "corrupted_surf_shelf", label: "Corrupted Surf Shelf", worldX: 8, worldY: 12, radius: 8.2, color: 0x102333, accent: 0xff5d57, kind: "breach" },
    { id: "lighthouse_that_answers_shelf", label: "Lighthouse That Answers", worldX: 26, worldY: -10, radius: 7.2, color: 0x101820, accent: 0xffd166, kind: "breach" }
  ],
  spawnRegions: [
    { id: "west_surf_static_skimmers", label: "West Surf Skimmers", worldX: -26, worldY: 12, radius: 7.2, enemyFamilyIds: ["static_skimmers", "bad_outputs"], startsAtSeconds: 2, weight: 3 },
    { id: "causeway_skim_lane", label: "Causeway Skim Lane", worldX: -5, worldY: -8, radius: 7.6, enemyFamilyIds: ["eval_wraiths", "static_skimmers"], startsAtSeconds: 8, weight: 2 },
    { id: "static_relay_jammers", label: "Relay Jammers", worldX: 4, worldY: 2, radius: 6.8, enemyFamilyIds: ["static_skimmers", "model_collapse_slimes"], startsAtSeconds: 16, weight: 3 },
    { id: "east_undertow_packets", label: "East Undertow Packets", worldX: 21, worldY: 10, radius: 8.0, enemyFamilyIds: ["deepforms", "static_skimmers"], startsAtSeconds: 26, weight: 2 },
    { id: "lighthouse_signal_shelf", label: "Lighthouse Signal Shelf", worldX: 26, worldY: -10, radius: 8.4, enemyFamilyIds: ["static_skimmers", "overfit_horrors", "eval_wraiths"], startsAtSeconds: 36, weight: 3 },
    { id: "offshore_surf_overflow", label: "Offshore Surf Overflow", worldX: 36, worldY: 18, radius: 8.8, enemyFamilyIds: ["deepforms", "model_collapse_slimes", "static_skimmers"], startsAtSeconds: 66, weight: 2 }
  ],
  propClusters: [
    { id: "alpha_relay_pad", label: "Alpha Relay Pad", worldX: -20, worldY: 5, rows: 2, cols: 4, spacingX: 1.6, spacingY: 1.2, color: 0x1a5361, accent: 0x99f6ff, kind: "terminal_array" },
    { id: "beta_relay_antennas", label: "Beta Relay Antennas", worldX: 1, worldY: -8, rows: 2, cols: 4, spacingX: 1.5, spacingY: 1.25, color: 0x273a46, accent: 0xffd166, kind: "terminal_array" },
    { id: "gamma_relay_pylons", label: "Gamma Relay Pylons", worldX: 18, worldY: 6, rows: 3, cols: 4, spacingX: 1.45, spacingY: 1.25, color: 0x203849, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "broken_server_causeway_wrecks", label: "Broken Causeway Wrecks", worldX: -8, worldY: -2, rows: 3, cols: 6, spacingX: 1.75, spacingY: 1.4, color: 0x1a2c35, accent: 0x45aaf2, kind: "drone_wreck" },
    { id: "coastal_cable_pylons", label: "Coastal Cable Pylons", worldX: 9, worldY: -1, rows: 1, cols: 9, spacingX: 1.65, spacingY: 1.1, color: 0x0d151c, accent: 0xffd166, kind: "barricade" },
    { id: "lighthouse_marker_wrecks", label: "Lighthouse Marker Wrecks", worldX: 26, worldY: -10, rows: 2, cols: 5, spacingX: 1.65, spacingY: 1.35, color: 0x15151b, accent: 0xff5d57, kind: "breach_shard" }
  ],
  terrainBands: [
    { id: "alpha_safe_spit", minX: -27, maxX: -13, minY: 0, maxY: 10, colorA: 0x2f4f55, colorB: 0x385d62 },
    { id: "beta_broken_causeway", minX: -6, maxX: 8, minY: -14, maxY: -4, colorA: 0x303b43, colorB: 0x3d4a52 },
    { id: "gamma_safe_spit", minX: 13, maxX: 25, minY: 1, maxY: 11, colorA: 0x294a4c, colorB: 0x365a58 },
    { id: "west_corrupted_surf", minX: -33, maxX: -14, minY: 9, maxY: 22, colorA: 0x0f2c3a, colorB: 0x123849 },
    { id: "center_corrupted_tide", minX: -6, maxX: 18, minY: 6, maxY: 17, colorA: 0x102333, colorB: 0x172b3a },
    { id: "south_static_shelf", minX: -9, maxX: 19, minY: -20, maxY: -10, colorA: 0x1a1727, colorB: 0x241c31 },
    { id: "lighthouse_shelf", minX: 20, maxX: 34, minY: -16, maxY: -5, colorA: 0x171b22, colorB: 0x222733 },
    { id: "offshore_surf_spawn", minX: 29, maxX: 41, minY: 8, maxY: 27, colorA: 0x0e2535, colorB: 0x113044 }
  ]
};

export const SIGNAL_COAST_STATIC_OBSTACLES = [
  { id: "alpha_relay_collision", worldX: -20, worldY: 5, radiusX: 3.6, radiusY: 1.55, softness: 0.66 },
  { id: "beta_antenna_collision", worldX: 1, worldY: -8, radiusX: 3.8, radiusY: 1.6, softness: 0.62 },
  { id: "gamma_pylon_collision", worldX: 18, worldY: 6, radiusX: 4.1, radiusY: 1.7, softness: 0.64 },
  { id: "broken_causeway_wreck_wall", worldX: -8, worldY: -2, radiusX: 5.4, radiusY: 1.95, softness: 0.58 },
  { id: "coastal_cable_pylon_line", worldX: 9, worldY: -1, radiusX: 6.2, radiusY: 1.25, softness: 0.5 },
  { id: "lighthouse_foot_collision", worldX: 26, worldY: -10, radiusX: 4.8, radiusY: 1.95, softness: 0.6 }
];

export const SIGNAL_COAST_ZONES: SignalCoastZone[] = [
  { id: "alpha_dry_spit", label: "Alpha Dry Spit", kind: "safe_spit", worldX: -20, worldY: 5, radiusX: 6.5, radiusY: 3.6, pulseOffset: 0, damagePerPulse: 0 },
  { id: "beta_dry_spit", label: "Beta Causeway Spit", kind: "safe_spit", worldX: 1, worldY: -8, radiusX: 6.1, radiusY: 3.35, pulseOffset: 0.3, damagePerPulse: 0 },
  { id: "gamma_dry_spit", label: "Gamma Dry Spit", kind: "safe_spit", worldX: 18, worldY: 6, radiusX: 6.3, radiusY: 3.55, pulseOffset: 0.6, damagePerPulse: 0 },
  { id: "west_corrupted_surf", label: "West Corrupted Surf", kind: "corrupted_surf", worldX: -23, worldY: 14, radiusX: 11.5, radiusY: 4.9, pulseOffset: 0.2, damagePerPulse: 1.15 },
  { id: "center_tide_band", label: "Center Tide Band", kind: "corrupted_surf", worldX: 5, worldY: 10, radiusX: 13.2, radiusY: 4.6, pulseOffset: 1.0, damagePerPulse: 1.05 },
  { id: "offshore_surf_band", label: "Offshore Surf Band", kind: "corrupted_surf", worldX: 29, worldY: 17, radiusX: 11.0, radiusY: 4.8, pulseOffset: 1.7, damagePerPulse: 1.25 },
  { id: "alpha_clear_signal_lane", label: "Alpha Clear Signal Lane", kind: "clear_signal_window", worldX: -12, worldY: 2, radiusX: 9.0, radiusY: 2.4, pulseOffset: 0.1, damagePerPulse: 0 },
  { id: "beta_clear_signal_lane", label: "Beta Clear Signal Lane", kind: "clear_signal_window", worldX: 8, worldY: -3, radiusX: 9.8, radiusY: 2.55, pulseOffset: 0.9, damagePerPulse: 0 },
  { id: "relay_static_field", label: "Relay Static Field", kind: "static_field", worldX: 5, worldY: 2, radiusX: 8.4, radiusY: 3.5, pulseOffset: 0.7, damagePerPulse: 0 },
  { id: "south_static_shelf", label: "South Static Shelf", kind: "static_field", worldX: 5, worldY: -14, radiusX: 13.5, radiusY: 4.1, pulseOffset: 1.4, damagePerPulse: 0 },
  { id: "coastal_cable_arc", label: "Coastal Cable Arc", kind: "cable_arc", worldX: 9, worldY: -1, radiusX: 13.2, radiusY: 2.15, pulseOffset: 0.5, damagePerPulse: 4.4 },
  { id: "lighthouse_return_arc", label: "Lighthouse Return Arc", kind: "cable_arc", worldX: 21, worldY: -6, radiusX: 8.8, radiusY: 2.45, pulseOffset: 2.2, damagePerPulse: 4.9 }
];
