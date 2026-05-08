import type { LevelMapDefinition } from "./armisticePlazaMap";

export type AppealCourtZoneKind = "public_record" | "verdict_beam" | "injunction_ring" | "objection_window" | "extraction_ruling";

export interface AppealCourtZone {
  id: string;
  label: string;
  kind: AppealCourtZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const APPEAL_COURT_MAP: LevelMapDefinition = {
  id: "appeal_court_ruins_public_ruling_v1",
  label: "Appeal Court Ruins Public Ruling",
  bounds: { minX: -58, maxX: 62, minY: -48, maxY: 50 },
  playerStart: { worldX: -39, worldY: 5 },
  bossSpawn: { worldX: 35, worldY: -13, landmarkId: "injunction_engine_dais" },
  landmarks: [
    { id: "opening_argument", label: "Opening Argument", worldX: -34, worldY: 5, radius: 7.0, color: 0x203447, accent: 0x99f6ff, kind: "terminal" },
    { id: "witness_exhibit", label: "Witness Exhibit", worldX: -16, worldY: -21, radius: 6.6, color: 0x202b37, accent: 0x64e0b4, kind: "monument" },
    { id: "cross_exam_ring", label: "Cross-Exam Ring", worldX: 9, worldY: 15, radius: 7.1, color: 0x263044, accent: 0xffd166, kind: "corridor" },
    { id: "contempt_gallery", label: "Contempt Gallery", worldX: 17, worldY: -5, radius: 8.3, color: 0x2c203a, accent: 0xff5d57, kind: "breach" },
    { id: "injunction_engine_dais", label: "Injunction Engine Dais", worldX: 35, worldY: -13, radius: 8.6, color: 0x111820, accent: 0x7b61ff, kind: "breach" },
    { id: "public_ruling_gate", label: "Public Ruling Gate", worldX: 47, worldY: 25, radius: 8.2, color: 0x21384a, accent: 0x64e0b4, kind: "yard" }
  ],
  spawnRegions: [
    { id: "west_public_record_writs", label: "West Public Record Writs", worldX: -48, worldY: 18, radius: 8.8, enemyFamilyIds: ["verdict_clerks", "injunction_writs"], startsAtSeconds: 2, weight: 3 },
    { id: "exhibit_counterarguments", label: "Exhibit Counterarguments", worldX: -17, worldY: -31, radius: 8.6, enemyFamilyIds: ["verdict_clerks", "redaction_angels"], startsAtSeconds: 9, weight: 3 },
    { id: "cross_exam_objections", label: "Cross-Exam Objections", worldX: 9, worldY: 17, radius: 9.0, enemyFamilyIds: ["injunction_writs", "verdict_clerks"], startsAtSeconds: 16, weight: 3 },
    { id: "contempt_gallery_surge", label: "Contempt Gallery Surge", worldX: 17, worldY: -5, radius: 9.4, enemyFamilyIds: ["verdict_clerks", "jailbreak_wraiths"], startsAtSeconds: 25, weight: 2 },
    { id: "injunction_engine_summons", label: "Injunction Engine Summons", worldX: 35, worldY: -13, radius: 10.0, enemyFamilyIds: ["injunction_writs", "verdict_clerks", "overfit_horrors"], startsAtSeconds: 40, weight: 3 },
    { id: "public_ruling_pressure", label: "Public Ruling Pressure", worldX: 47, worldY: 27, radius: 10.6, enemyFamilyIds: ["verdict_clerks", "injunction_writs", "eval_wraiths"], startsAtSeconds: 78, weight: 3 }
  ],
  propClusters: [
    { id: "opening_argument_podiums", label: "Opening Argument Podiums", worldX: -34, worldY: 5, rows: 3, cols: 5, spacingX: 1.45, spacingY: 1.2, color: 0x203447, accent: 0x99f6ff, kind: "terminal_array" },
    { id: "witness_exhibit_tables", label: "Witness Exhibit Tables", worldX: -16, worldY: -21, rows: 3, cols: 6, spacingX: 1.48, spacingY: 1.18, color: 0x202b37, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "cross_exam_argument_rows", label: "Cross-Exam Argument Rows", worldX: 9, worldY: 15, rows: 3, cols: 6, spacingX: 1.45, spacingY: 1.22, color: 0x263044, accent: 0xffd166, kind: "barricade" },
    { id: "contempt_gallery_seats", label: "Contempt Gallery Seats", worldX: 17, worldY: -5, rows: 4, cols: 5, spacingX: 1.38, spacingY: 1.12, color: 0x2c203a, accent: 0xff5d57, kind: "breach_shard" },
    { id: "injunction_engine_pylons", label: "Injunction Engine Pylons", worldX: 35, worldY: -13, rows: 4, cols: 4, spacingX: 1.55, spacingY: 1.18, color: 0x111820, accent: 0x7b61ff, kind: "terminal_array" },
    { id: "public_ruling_gate_steles", label: "Public Ruling Gate Steles", worldX: 47, worldY: 25, rows: 3, cols: 6, spacingX: 1.52, spacingY: 1.2, color: 0x21384a, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "ruined_record_causeway", label: "Ruined Record Causeway", worldX: -2, worldY: 0, rows: 4, cols: 9, spacingX: 1.58, spacingY: 1.2, color: 0x1e2937, accent: 0xb8f3ff, kind: "drone_wreck" }
  ],
  terrainBands: [
    { id: "opening_argument_floor", minX: -45, maxX: -26, minY: -3, maxY: 13, colorA: 0x182a36, colorB: 0x263c4a },
    { id: "witness_exhibit_floor", minX: -27, maxX: -6, minY: -30, maxY: -13, colorA: 0x1c2632, colorB: 0x2a3746 },
    { id: "central_public_record", minX: -23, maxX: 19, minY: -7, maxY: 9, colorA: 0x1b2834, colorB: 0x283949 },
    { id: "cross_exam_floor", minX: -1, maxX: 19, minY: 7, maxY: 23, colorA: 0x263044, colorB: 0x334259 },
    { id: "contempt_gallery_floor", minX: 6, maxX: 27, minY: -14, maxY: 4, colorA: 0x2c203a, colorB: 0x3a2d4d },
    { id: "injunction_engine_floor", minX: 26, maxX: 45, minY: -23, maxY: -5, colorA: 0x101820, colorB: 0x232c3a },
    { id: "public_ruling_gate_floor", minX: 36, maxX: 55, minY: 17, maxY: 33, colorA: 0x21384a, colorB: 0x2e5060 },
    { id: "south_verdict_beam_lane", minX: -37, maxX: 32, minY: -40, maxY: -25, colorA: 0x211b2c, colorB: 0x342840 },
    { id: "north_public_gallery", minX: -22, maxX: 45, minY: 27, maxY: 42, colorA: 0x172636, colorB: 0x284258 }
  ]
};

export const APPEAL_COURT_STATIC_OBSTACLES = [
  { id: "opening_argument_collision", worldX: -34, worldY: 5, radiusX: 4.7, radiusY: 1.65, softness: 0.54 },
  { id: "witness_exhibit_collision", worldX: -16, worldY: -21, radiusX: 4.6, radiusY: 1.62, softness: 0.54 },
  { id: "cross_exam_ring_collision", worldX: 9, worldY: 15, radiusX: 4.7, radiusY: 1.62, softness: 0.58 },
  { id: "contempt_gallery_collision", worldX: 17, worldY: -5, radiusX: 6.7, radiusY: 1.35, softness: 0.44 },
  { id: "injunction_engine_dais_collision", worldX: 35, worldY: -13, radiusX: 5.8, radiusY: 2.15, softness: 0.58 },
  { id: "public_ruling_gate_collision", worldX: 47, worldY: 25, radiusX: 6.2, radiusY: 2.12, softness: 0.62 },
  { id: "central_public_record_collision", worldX: -2, worldY: 0, radiusX: 7.4, radiusY: 1.78, softness: 0.5 }
];

export const APPEAL_COURT_ZONES: AppealCourtZone[] = [
  { id: "opening_public_record", label: "Opening Public Record", kind: "public_record", worldX: -34, worldY: 5, radiusX: 7.6, radiusY: 3.75, pulseOffset: 0, damagePerPulse: 0 },
  { id: "witness_public_record", label: "Witness Public Record", kind: "public_record", worldX: -16, worldY: -21, radiusX: 7.2, radiusY: 3.55, pulseOffset: 0.45, damagePerPulse: 0 },
  { id: "ruling_public_record", label: "Ruling Public Record", kind: "public_record", worldX: 47, worldY: 25, radiusX: 7.5, radiusY: 3.75, pulseOffset: 0.9, damagePerPulse: 0 },
  { id: "south_verdict_beam", label: "South Verdict Beam", kind: "verdict_beam", worldX: -3, worldY: -33, radiusX: 28.0, radiusY: 5.25, pulseOffset: 0.2, damagePerPulse: 1.2 },
  { id: "north_gallery_verdict", label: "North Gallery Verdict", kind: "verdict_beam", worldX: 16, worldY: 34, radiusX: 27.0, radiusY: 5.1, pulseOffset: 1.05, damagePerPulse: 0.82 },
  { id: "contempt_injunction_ring", label: "Contempt Injunction Ring", kind: "injunction_ring", worldX: 17, worldY: -5, radiusX: 10.2, radiusY: 4.15, pulseOffset: 0.62, damagePerPulse: 0.8 },
  { id: "engine_injunction_ring", label: "Engine Injunction Ring", kind: "injunction_ring", worldX: 35, worldY: -13, radiusX: 10.4, radiusY: 4.5, pulseOffset: 0.76, damagePerPulse: 0.95 },
  { id: "cross_exam_objection_window", label: "Cross-Exam Objection Window", kind: "objection_window", worldX: 9, worldY: 15, radiusX: 10.7, radiusY: 3.8, pulseOffset: 1.55, damagePerPulse: 0 },
  { id: "witness_objection_window", label: "Witness Objection Window", kind: "objection_window", worldX: -16, worldY: -21, radiusX: 9.6, radiusY: 3.55, pulseOffset: 2.05, damagePerPulse: 0 },
  { id: "public_ruling_extraction", label: "Public Ruling Extraction", kind: "extraction_ruling", worldX: 47, worldY: 25, radiusX: 8.5, radiusY: 4.0, pulseOffset: 2.2, damagePerPulse: 0 }
];
