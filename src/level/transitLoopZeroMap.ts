import type { LevelMapDefinition } from "./armisticePlazaMap";

export type TransitLoopZoneKind = "aligned_track" | "false_track" | "arrival_window" | "safe_platform";

export interface TransitLoopZone {
  id: string;
  label: string;
  kind: TransitLoopZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
}

export const TRANSIT_LOOP_ZERO_MAP: LevelMapDefinition = {
  id: "transit_loop_zero_graybox",
  label: "Transit Loop Zero Graybox",
  bounds: { minX: -34, maxX: 36, minY: -30, maxY: 32 },
  playerStart: { worldX: -16, worldY: 1 },
  bossSpawn: { worldX: 23, worldY: -5, landmarkId: "station_that_arrives_gate" },
  landmarks: [
    { id: "origin_platform", label: "Origin Platform", worldX: -16, worldY: 1, radius: 4.5, color: 0x22384a, accent: 0x99f6ff, kind: "terminal" },
    { id: "switchback_platform", label: "Switchback Platform", worldX: 0, worldY: -8, radius: 4.2, color: 0x2b3354, accent: 0xffd166, kind: "terminal" },
    { id: "arrival_platform", label: "Arrival Platform", worldX: 17, worldY: 5, radius: 4.8, color: 0x283d44, accent: 0x64e0b4, kind: "terminal" },
    { id: "false_schedule_board", label: "False Schedule Board", worldX: -2, worldY: 8, radius: 6.1, color: 0x231a35, accent: 0xff5d57, kind: "breach" },
    { id: "route_switch_yard", label: "Route Switch Yard", worldX: 8, worldY: -16, radius: 6.6, color: 0x182332, accent: 0x45aaf2, kind: "yard" },
    { id: "station_that_arrives_gate", label: "Station That Arrives Gate", worldX: 23, worldY: -5, radius: 6.8, color: 0x121820, accent: 0xffd166, kind: "breach" }
  ],
  spawnRegions: [
    { id: "origin_false_schedule_spill", label: "Origin False Schedules", worldX: -18, worldY: 5, radius: 6.4, enemyFamilyIds: ["eval_wraiths", "benchmark_gremlins", "bad_outputs"], startsAtSeconds: 2, weight: 2 },
    { id: "switchback_token_gobblers", label: "Switchback Token Gobblers", worldX: 1, worldY: -9, radius: 6.8, enemyFamilyIds: ["speculative_executors", "eval_wraiths", "bad_outputs"], startsAtSeconds: 10, weight: 3 },
    { id: "false_track_wraiths", label: "False Track Wraiths", worldX: -2, worldY: 8, radius: 7.2, enemyFamilyIds: ["eval_wraiths", "overfit_horrors", "benchmark_gremlins"], startsAtSeconds: 18, weight: 3 },
    { id: "arrival_gate_pressure", label: "Arrival Gate Pressure", worldX: 19, worldY: 4, radius: 7.4, enemyFamilyIds: ["speculative_executors", "eval_wraiths", "bad_outputs"], startsAtSeconds: 28, weight: 3 },
    { id: "station_arrival_surge", label: "Station Arrival Surge", worldX: 23, worldY: -5, radius: 7.6, enemyFamilyIds: ["overfit_horrors", "eval_wraiths", "speculative_executors"], startsAtSeconds: 42, weight: 3 }
  ],
  propClusters: [
    { id: "origin_platform_edges", label: "Origin Platform Edges", worldX: -16, worldY: 1, rows: 2, cols: 6, spacingX: 1.4, spacingY: 1.1, color: 0x26384a, accent: 0x99f6ff, kind: "terminal_array" },
    { id: "switchback_rail_signs", label: "Switchback Rail Signs", worldX: 0, worldY: -8, rows: 2, cols: 5, spacingX: 1.6, spacingY: 1.2, color: 0x2f365a, accent: 0xffd166, kind: "barricade" },
    { id: "arrival_platform_turnstiles", label: "Arrival Turnstiles", worldX: 17, worldY: 5, rows: 3, cols: 4, spacingX: 1.4, spacingY: 1.2, color: 0x243f42, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "false_schedule_boards", label: "False Schedule Boards", worldX: -2, worldY: 8, rows: 2, cols: 5, spacingX: 1.7, spacingY: 1.3, color: 0x191020, accent: 0xff5d57, kind: "breach_shard" },
    { id: "route_switch_sleepers", label: "Route Switch Sleepers", worldX: 8, worldY: -16, rows: 1, cols: 9, spacingX: 1.65, spacingY: 1.1, color: 0x111821, accent: 0x45aaf2, kind: "barricade" },
    { id: "station_gate_markers", label: "Station Gate Markers", worldX: 23, worldY: -5, rows: 2, cols: 5, spacingX: 1.7, spacingY: 1.4, color: 0x15151b, accent: 0xffd166, kind: "breach_shard" }
  ],
  terrainBands: [
    { id: "origin_platform_slab", minX: -22, maxX: -10, minY: -4, maxY: 6, colorA: 0x293947, colorB: 0x334654 },
    { id: "switchback_platform_slab", minX: -6, maxX: 6, minY: -13, maxY: -4, colorA: 0x2e344c, colorB: 0x3a415b },
    { id: "arrival_platform_slab", minX: 11, maxX: 23, minY: 0, maxY: 10, colorA: 0x2e4646, colorB: 0x385253 },
    { id: "false_track_yard", minX: -9, maxX: 7, minY: 5, maxY: 14, colorA: 0x20162e, colorB: 0x2b1f3b },
    { id: "route_switch_yard", minX: 3, maxX: 17, minY: -22, maxY: -12, colorA: 0x172230, colorB: 0x1e2b3a },
    { id: "arrival_gate_zone", minX: 18, maxX: 31, minY: -10, maxY: 1, colorA: 0x181a22, colorB: 0x23252e }
  ]
};

export const TRANSIT_LOOP_STATIC_OBSTACLES = [
  { id: "origin_platform_terminal", worldX: -16, worldY: 1, radiusX: 4.4, radiusY: 1.6, softness: 0.66 },
  { id: "switchback_sign_bank", worldX: 0, worldY: -8, radiusX: 4.2, radiusY: 1.5, softness: 0.62 },
  { id: "arrival_turnstile_bank", worldX: 17, worldY: 5, radiusX: 4.5, radiusY: 1.6, softness: 0.66 },
  { id: "false_schedule_board_collision", worldX: -2, worldY: 8, radiusX: 5.2, radiusY: 1.8, softness: 0.54 },
  { id: "station_arrival_gate_collision", worldX: 23, worldY: -5, radiusX: 4.7, radiusY: 1.8, softness: 0.58 }
];

export const TRANSIT_LOOP_ZONES: TransitLoopZone[] = [
  { id: "origin_safe_platform", label: "Origin Platform", kind: "safe_platform", worldX: -16, worldY: 1, radiusX: 5.8, radiusY: 3.4, pulseOffset: 0 },
  { id: "switchback_safe_platform", label: "Switchback Platform", kind: "safe_platform", worldX: 0, worldY: -8, radiusX: 5.5, radiusY: 3.2, pulseOffset: 0.4 },
  { id: "arrival_safe_platform", label: "Arrival Platform", kind: "safe_platform", worldX: 17, worldY: 5, radiusX: 5.9, radiusY: 3.5, pulseOffset: 0.8 },
  { id: "main_loop_track", label: "Main Loop Track", kind: "aligned_track", worldX: 1, worldY: -2, radiusX: 20, radiusY: 2.2, pulseOffset: 0.1 },
  { id: "false_schedule_lane", label: "False Schedule Lane", kind: "false_track", worldX: -2, worldY: 8, radiusX: 9.8, radiusY: 3.4, pulseOffset: 0.7 },
  { id: "switchyard_false_spur", label: "Switchyard False Spur", kind: "false_track", worldX: 8, worldY: -16, radiusX: 8.2, radiusY: 3.1, pulseOffset: 1.5 },
  { id: "arrival_window_gate", label: "Arrival Window Gate", kind: "arrival_window", worldX: 22, worldY: -4, radiusX: 7.2, radiusY: 3.2, pulseOffset: 2.1 }
];
