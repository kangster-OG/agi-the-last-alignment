import type { LevelMapDefinition } from "./armisticePlazaMap";

export type GuardrailForgeZoneKind = "safe_hold_plate" | "overload_lane" | "calibration_window" | "doctrine_press" | "extraction_forge";

export interface GuardrailForgeZone {
  id: string;
  label: string;
  kind: GuardrailForgeZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const GUARDRAIL_FORGE_MAP: LevelMapDefinition = {
  id: "guardrail_forge_holdout_v1",
  label: "Guardrail Forge Holdout",
  bounds: { minX: -48, maxX: 54, minY: -42, maxY: 44 },
  playerStart: { worldX: -32, worldY: 4 },
  bossSpawn: { worldX: 30, worldY: -8, landmarkId: "audit_press_throne" },
  landmarks: [
    { id: "alloy_temper_relay", label: "Alloy Temper Relay", worldX: -28, worldY: 5, radius: 6.8, color: 0x27333d, accent: 0xffd166, kind: "terminal" },
    { id: "constitutional_clamp", label: "Constitutional Clamp", worldX: -9, worldY: -16, radius: 6.6, color: 0x29313a, accent: 0x99f6ff, kind: "terminal" },
    { id: "silkgrid_loom", label: "Silkgrid Loom", worldX: 8, worldY: 13, radius: 6.7, color: 0x1f3d3b, accent: 0x64e0b4, kind: "monument" },
    { id: "overload_sluice", label: "Overload Sluice", worldX: 12, worldY: -4, radius: 8.4, color: 0x241820, accent: 0xff5d57, kind: "corridor" },
    { id: "audit_press_throne", label: "Audit Press Throne", worldX: 30, worldY: -8, radius: 7.8, color: 0x121820, accent: 0x7b61ff, kind: "breach" },
    { id: "reward_quench_gate", label: "Reward Quench Gate", worldX: 38, worldY: 20, radius: 7.1, color: 0x172d31, accent: 0xffd166, kind: "yard" }
  ],
  spawnRegions: [
    { id: "west_doctrine_audit", label: "West Doctrine Audit", worldX: -42, worldY: 13, radius: 8.2, enemyFamilyIds: ["doctrine_auditors", "benchmark_gremlins"], startsAtSeconds: 2, weight: 3 },
    { id: "clamp_eval_writs", label: "Clamp Eval Writs", worldX: -10, worldY: -26, radius: 8.4, enemyFamilyIds: ["doctrine_auditors", "eval_wraiths"], startsAtSeconds: 8, weight: 2 },
    { id: "overload_lane_argument", label: "Overload Lane Argument", worldX: 12, worldY: -4, radius: 9.2, enemyFamilyIds: ["doctrine_auditors", "overfit_horrors"], startsAtSeconds: 14, weight: 3 },
    { id: "silkgrid_counterproofs", label: "Silkgrid Counterproofs", worldX: 8, worldY: 16, radius: 8.6, enemyFamilyIds: ["benchmark_gremlins", "doctrine_auditors"], startsAtSeconds: 24, weight: 2 },
    { id: "audit_press_wave", label: "Audit Press Wave", worldX: 30, worldY: -8, radius: 9.4, enemyFamilyIds: ["doctrine_auditors", "redaction_angels", "eval_wraiths"], startsAtSeconds: 34, weight: 3 },
    { id: "quench_gate_appeal", label: "Quench Gate Appeal", worldX: 41, worldY: 24, radius: 9.8, enemyFamilyIds: ["doctrine_auditors", "benchmark_gremlins", "overfit_horrors"], startsAtSeconds: 70, weight: 3 }
  ],
  propClusters: [
    { id: "alloy_temper_clamps", label: "Alloy Temper Clamps", worldX: -28, worldY: 5, rows: 3, cols: 5, spacingX: 1.5, spacingY: 1.16, color: 0x27333d, accent: 0xffd166, kind: "terminal_array" },
    { id: "constitutional_clamp_rows", label: "Constitutional Clamp Rows", worldX: -9, worldY: -16, rows: 4, cols: 4, spacingX: 1.46, spacingY: 1.2, color: 0x29313a, accent: 0x99f6ff, kind: "barricade" },
    { id: "silkgrid_loom_frames", label: "Silkgrid Loom Frames", worldX: 8, worldY: 13, rows: 3, cols: 5, spacingX: 1.42, spacingY: 1.22, color: 0x1f3d3b, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "overload_gate_fins", label: "Overload Gate Fins", worldX: 12, worldY: -4, rows: 2, cols: 8, spacingX: 1.4, spacingY: 1.14, color: 0x241820, accent: 0xff5d57, kind: "barricade" },
    { id: "audit_press_teeth", label: "Audit Press Teeth", worldX: 30, worldY: -8, rows: 3, cols: 5, spacingX: 1.44, spacingY: 1.18, color: 0x121820, accent: 0x7b61ff, kind: "breach_shard" },
    { id: "reward_quench_core", label: "Reward Quench Core", worldX: 38, worldY: 20, rows: 3, cols: 5, spacingX: 1.52, spacingY: 1.2, color: 0x172d31, accent: 0xffd166, kind: "terminal_array" },
    { id: "forge_barricade_spine", label: "Forge Barricade Spine", worldX: -2, worldY: 2, rows: 3, cols: 8, spacingX: 1.58, spacingY: 1.22, color: 0x1b2630, accent: 0x45aaf2, kind: "drone_wreck" }
  ],
  terrainBands: [
    { id: "alloy_temper_floor", minX: -37, maxX: -20, minY: -2, maxY: 12, colorA: 0x202e36, colorB: 0x2d3c45 },
    { id: "constitutional_clamp_floor", minX: -18, maxX: -1, minY: -24, maxY: -9, colorA: 0x272f38, colorB: 0x35404b },
    { id: "central_guardrail_causeway", minX: -17, maxX: 18, minY: -3, maxY: 9, colorA: 0x1d2b33, colorB: 0x273945 },
    { id: "silkgrid_loom_floor", minX: 0, maxX: 16, minY: 7, maxY: 20, colorA: 0x1d3b39, colorB: 0x2a514d },
    { id: "overload_sluice_floor", minX: 2, maxX: 22, minY: -14, maxY: 2, colorA: 0x241820, colorB: 0x321f2a },
    { id: "audit_press_floor", minX: 23, maxX: 39, minY: -17, maxY: -2, colorA: 0x121820, colorB: 0x202637 },
    { id: "reward_quench_floor", minX: 30, maxX: 47, minY: 14, maxY: 29, colorA: 0x172d31, colorB: 0x224247 },
    { id: "south_argument_overflow", minX: -30, maxX: 26, minY: -34, maxY: -21, colorA: 0x151720, colorB: 0x251a23 },
    { id: "north_hold_plate_lane", minX: -20, maxX: 38, minY: 23, maxY: 37, colorA: 0x112026, colorB: 0x1e2f35 }
  ]
};

export const GUARDRAIL_FORGE_STATIC_OBSTACLES = [
  { id: "alloy_temper_collision", worldX: -28, worldY: 5, radiusX: 4.5, radiusY: 1.65, softness: 0.54 },
  { id: "constitutional_clamp_collision", worldX: -9, worldY: -16, radiusX: 4.6, radiusY: 1.7, softness: 0.5 },
  { id: "silkgrid_loom_collision", worldX: 8, worldY: 13, radiusX: 4.3, radiusY: 1.6, softness: 0.56 },
  { id: "central_forge_barricade", worldX: -2, worldY: 2, radiusX: 6.9, radiusY: 1.8, softness: 0.48 },
  { id: "overload_sluice_collision", worldX: 12, worldY: -4, radiusX: 6.6, radiusY: 1.24, softness: 0.44 },
  { id: "audit_press_collision", worldX: 30, worldY: -8, radiusX: 5.4, radiusY: 2.0, softness: 0.58 },
  { id: "reward_quench_collision", worldX: 38, worldY: 20, radiusX: 5.7, radiusY: 2.05, softness: 0.6 }
];

export const GUARDRAIL_FORGE_ZONES: GuardrailForgeZone[] = [
  { id: "alloy_hold_plate", label: "Alloy Hold Plate", kind: "safe_hold_plate", worldX: -28, worldY: 5, radiusX: 7.1, radiusY: 3.6, pulseOffset: 0, damagePerPulse: 0 },
  { id: "silkgrid_hold_plate", label: "Silkgrid Hold Plate", kind: "safe_hold_plate", worldX: 8, worldY: 13, radiusX: 6.8, radiusY: 3.4, pulseOffset: 0.45, damagePerPulse: 0 },
  { id: "quench_hold_plate", label: "Quench Hold Plate", kind: "safe_hold_plate", worldX: 38, worldY: 20, radiusX: 7.2, radiusY: 3.7, pulseOffset: 0.9, damagePerPulse: 0 },
  { id: "south_overload_lane", label: "South Overload Lane", kind: "overload_lane", worldX: -3, worldY: -27, radiusX: 24.0, radiusY: 4.8, pulseOffset: 0.2, damagePerPulse: 1.2 },
  { id: "north_overload_lane", label: "North Overload Lane", kind: "overload_lane", worldX: 13, worldY: 29, radiusX: 24.5, radiusY: 5.0, pulseOffset: 1.1, damagePerPulse: 1.0 },
  { id: "constitutional_window", label: "Constitutional Window", kind: "calibration_window", worldX: -9, worldY: -16, radiusX: 8.8, radiusY: 3.8, pulseOffset: 0.6, damagePerPulse: 0 },
  { id: "overload_fast_sluice", label: "Overload Fast Sluice", kind: "calibration_window", worldX: 12, worldY: -4, radiusX: 10.4, radiusY: 3.5, pulseOffset: 1.55, damagePerPulse: 0 },
  { id: "audit_doctrine_press", label: "Audit Doctrine Press", kind: "doctrine_press", worldX: 30, worldY: -8, radiusX: 9.3, radiusY: 4.2, pulseOffset: 0.75, damagePerPulse: 0 },
  { id: "clamp_doctrine_press", label: "Clamp Doctrine Press", kind: "doctrine_press", worldX: -9, worldY: -16, radiusX: 8.6, radiusY: 3.8, pulseOffset: 1.8, damagePerPulse: 0 },
  { id: "reward_quench_extraction", label: "Reward Quench Extraction", kind: "extraction_forge", worldX: 38, worldY: 20, radiusX: 8.0, radiusY: 3.8, pulseOffset: 2.2, damagePerPulse: 0 }
];
