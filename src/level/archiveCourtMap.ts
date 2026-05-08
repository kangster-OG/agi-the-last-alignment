import type { LevelMapDefinition } from "./armisticePlazaMap";

export type ArchiveCourtZoneKind = "evidence_lantern" | "redaction_field" | "writ_storm" | "appeal_window" | "extraction_court";

export interface ArchiveCourtZone {
  id: string;
  label: string;
  kind: ArchiveCourtZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const ARCHIVE_COURT_MAP: LevelMapDefinition = {
  id: "archive_of_unsaid_things_redaction_v1",
  label: "Archive of Unsaid Things Redaction Docket",
  bounds: { minX: -54, maxX: 58, minY: -46, maxY: 48 },
  playerStart: { worldX: -36, worldY: 3 },
  bossSpawn: { worldX: 32, worldY: -11, landmarkId: "redactor_saint_bench" },
  landmarks: [
    { id: "witness_index", label: "Witness Index", worldX: -31, worldY: 4, radius: 6.7, color: 0x1d3140, accent: 0x99f6ff, kind: "terminal" },
    { id: "redaction_stack", label: "Redaction Stack", worldX: -13, worldY: -18, radius: 6.3, color: 0x1a1e29, accent: 0xff5d57, kind: "breach" },
    { id: "appeal_seal", label: "Appeal Seal", worldX: 8, worldY: 13, radius: 6.4, color: 0x243449, accent: 0xffd166, kind: "monument" },
    { id: "injunction_docket", label: "Injunction Docket", worldX: 14, worldY: -5, radius: 8.3, color: 0x30223b, accent: 0xb8f3ff, kind: "corridor" },
    { id: "redactor_saint_bench", label: "Redactor Saint Bench", worldX: 32, worldY: -11, radius: 7.9, color: 0x101820, accent: 0x7b61ff, kind: "breach" },
    { id: "court_writ_gate", label: "Court Writ Gate", worldX: 42, worldY: 23, radius: 7.6, color: 0x213544, accent: 0x64e0b4, kind: "yard" }
  ],
  spawnRegions: [
    { id: "west_witness_redactions", label: "West Witness Redactions", worldX: -45, worldY: 15, radius: 8.6, enemyFamilyIds: ["redaction_angels", "injunction_writs"], startsAtSeconds: 2, weight: 3 },
    { id: "stack_redaction_choir", label: "Stack Redaction Choir", worldX: -13, worldY: -29, radius: 8.2, enemyFamilyIds: ["redaction_angels", "context_rot_crabs"], startsAtSeconds: 8, weight: 2 },
    { id: "docket_writ_surge", label: "Docket Writ Surge", worldX: 14, worldY: -5, radius: 9.0, enemyFamilyIds: ["injunction_writs", "redaction_angels"], startsAtSeconds: 14, weight: 3 },
    { id: "appeal_seal_arguments", label: "Appeal Seal Arguments", worldX: 8, worldY: 16, radius: 8.8, enemyFamilyIds: ["injunction_writs", "eval_wraiths"], startsAtSeconds: 24, weight: 2 },
    { id: "redactor_saint_scriptorium", label: "Redactor Saint Scriptorium", worldX: 32, worldY: -11, radius: 9.8, enemyFamilyIds: ["redaction_angels", "injunction_writs", "overfit_horrors"], startsAtSeconds: 35, weight: 3 },
    { id: "court_writ_extraction", label: "Court Writ Extraction", worldX: 44, worldY: 27, radius: 10.2, enemyFamilyIds: ["injunction_writs", "redaction_angels", "eval_wraiths"], startsAtSeconds: 74, weight: 3 }
  ],
  propClusters: [
    { id: "witness_index_drawers", label: "Witness Index Drawers", worldX: -31, worldY: 4, rows: 3, cols: 5, spacingX: 1.5, spacingY: 1.18, color: 0x1d3140, accent: 0x99f6ff, kind: "terminal_array" },
    { id: "redaction_stack_shelves", label: "Redaction Stack Shelves", worldX: -13, worldY: -18, rows: 4, cols: 4, spacingX: 1.46, spacingY: 1.18, color: 0x1a1e29, accent: 0xff5d57, kind: "terminal_array" },
    { id: "appeal_seal_witness_rows", label: "Appeal Seal Witness Rows", worldX: 8, worldY: 13, rows: 3, cols: 5, spacingX: 1.42, spacingY: 1.22, color: 0x243449, accent: 0xffd166, kind: "breach_shard" },
    { id: "injunction_docket_rails", label: "Injunction Docket Rails", worldX: 14, worldY: -5, rows: 2, cols: 8, spacingX: 1.42, spacingY: 1.12, color: 0x30223b, accent: 0xb8f3ff, kind: "barricade" },
    { id: "redactor_bench_pages", label: "Redactor Bench Pages", worldX: 32, worldY: -11, rows: 3, cols: 5, spacingX: 1.44, spacingY: 1.18, color: 0x101820, accent: 0x7b61ff, kind: "breach_shard" },
    { id: "court_writ_gate_lanterns", label: "Court Writ Gate Lanterns", worldX: 42, worldY: 23, rows: 3, cols: 6, spacingX: 1.52, spacingY: 1.2, color: 0x213544, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "central_docket_tables", label: "Central Docket Tables", worldX: -1, worldY: 2, rows: 4, cols: 8, spacingX: 1.62, spacingY: 1.22, color: 0x1d2732, accent: 0x45aaf2, kind: "drone_wreck" }
  ],
  terrainBands: [
    { id: "witness_index_floor", minX: -41, maxX: -23, minY: -3, maxY: 11, colorA: 0x1a2e3c, colorB: 0x263f50 },
    { id: "redaction_stack_floor", minX: -23, maxX: -4, minY: -27, maxY: -10, colorA: 0x181b27, colorB: 0x272c3a },
    { id: "central_docket_causeway", minX: -20, maxX: 19, minY: -5, maxY: 9, colorA: 0x1b2833, colorB: 0x263847 },
    { id: "appeal_seal_floor", minX: -1, maxX: 17, minY: 6, maxY: 21, colorA: 0x223449, colorB: 0x304b61 },
    { id: "injunction_docket_floor", minX: 3, maxX: 24, minY: -16, maxY: 2, colorA: 0x2b2338, colorB: 0x3a2f4d },
    { id: "redactor_bench_floor", minX: 24, maxX: 41, minY: -20, maxY: -4, colorA: 0x101820, colorB: 0x222a38 },
    { id: "court_writ_gate_floor", minX: 32, maxX: 51, minY: 16, maxY: 31, colorA: 0x213544, colorB: 0x2d4c5c },
    { id: "south_redacted_writ_lane", minX: -33, maxX: 29, minY: -37, maxY: -22, colorA: 0x211d2c, colorB: 0x322840 },
    { id: "north_writ_storm_lane", minX: -21, maxX: 41, minY: 24, maxY: 39, colorA: 0x172634, colorB: 0x273d4e }
  ]
};

export const ARCHIVE_COURT_STATIC_OBSTACLES = [
  { id: "witness_index_collision", worldX: -31, worldY: 4, radiusX: 4.4, radiusY: 1.62, softness: 0.54 },
  { id: "redaction_stack_collision", worldX: -13, worldY: -18, radiusX: 4.5, radiusY: 1.65, softness: 0.52 },
  { id: "appeal_seal_collision", worldX: 8, worldY: 13, radiusX: 4.2, radiusY: 1.58, softness: 0.56 },
  { id: "central_docket_collision", worldX: -1, worldY: 2, radiusX: 7.0, radiusY: 1.8, softness: 0.5 },
  { id: "injunction_docket_collision", worldX: 14, worldY: -5, radiusX: 6.5, radiusY: 1.26, softness: 0.44 },
  { id: "redactor_saint_bench_collision", worldX: 32, worldY: -11, radiusX: 5.4, radiusY: 2.08, softness: 0.58 },
  { id: "court_writ_gate_collision", worldX: 42, worldY: 23, radiusX: 5.9, radiusY: 2.1, softness: 0.6 }
];

export const ARCHIVE_COURT_ZONES: ArchiveCourtZone[] = [
  { id: "witness_evidence_lantern", label: "Witness Evidence Lantern", kind: "evidence_lantern", worldX: -31, worldY: 4, radiusX: 7.3, radiusY: 3.65, pulseOffset: 0, damagePerPulse: 0 },
  { id: "appeal_evidence_lantern", label: "Appeal Evidence Lantern", kind: "evidence_lantern", worldX: 8, worldY: 13, radiusX: 7.0, radiusY: 3.5, pulseOffset: 0.45, damagePerPulse: 0 },
  { id: "court_writ_lantern", label: "Court Writ Lantern", kind: "evidence_lantern", worldX: 42, worldY: 23, radiusX: 7.3, radiusY: 3.7, pulseOffset: 0.9, damagePerPulse: 0 },
  { id: "south_redaction_lane", label: "South Redaction Lane", kind: "redaction_field", worldX: -4, worldY: -29, radiusX: 26.0, radiusY: 5.15, pulseOffset: 0.2, damagePerPulse: 1.25 },
  { id: "north_writ_storm_lane", label: "North Writ Storm Lane", kind: "writ_storm", worldX: 14, worldY: 31, radiusX: 25.6, radiusY: 5.05, pulseOffset: 1.1, damagePerPulse: 0.85 },
  { id: "redaction_stack_field", label: "Redaction Stack Field", kind: "redaction_field", worldX: -13, worldY: -18, radiusX: 9.2, radiusY: 3.9, pulseOffset: 0.6, damagePerPulse: 0.75 },
  { id: "injunction_appeal_window", label: "Injunction Appeal Window", kind: "appeal_window", worldX: 14, worldY: -5, radiusX: 10.8, radiusY: 3.75, pulseOffset: 1.55, damagePerPulse: 0 },
  { id: "redactor_bench_field", label: "Redactor Bench Field", kind: "redaction_field", worldX: 32, worldY: -11, radiusX: 9.7, radiusY: 4.35, pulseOffset: 0.75, damagePerPulse: 0.9 },
  { id: "appeal_seal_writ_storm", label: "Appeal Seal Writ Storm", kind: "writ_storm", worldX: 8, worldY: 13, radiusX: 8.9, radiusY: 3.85, pulseOffset: 1.8, damagePerPulse: 0.7 },
  { id: "court_writ_extraction", label: "Court Writ Extraction", kind: "extraction_court", worldX: 42, worldY: 23, radiusX: 8.2, radiusY: 3.9, pulseOffset: 2.2, damagePerPulse: 0 }
];
