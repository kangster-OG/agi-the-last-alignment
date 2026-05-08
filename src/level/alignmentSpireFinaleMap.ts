import type { LevelMapDefinition } from "./armisticePlazaMap";

export type AlignmentSpireZoneKind = "consensus_sanctum" | "prediction_path" | "route_mouth" | "boss_echo" | "extraction_alignment";

export interface AlignmentSpireZone {
  id: string;
  label: string;
  kind: AlignmentSpireZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const ALIGNMENT_SPIRE_FINALE_MAP: LevelMapDefinition = {
  id: "alignment_spire_finale_prediction_collapse_v1",
  label: "Outer Alignment Finale Prediction Collapse",
  bounds: { minX: -60, maxX: 66, minY: -52, maxY: 54 },
  playerStart: { worldX: -42, worldY: 2 },
  bossSpawn: { worldX: 38, worldY: -8, landmarkId: "agi_completion_throne" },
  landmarks: [
    { id: "last_alignment_camp_remnant", label: "Last Alignment Camp Remnant", worldX: -39, worldY: 2, radius: 7.5, color: 0x172636, accent: 0x64e0b4, kind: "terminal" },
    { id: "memory_route_mouth", label: "Memory Route Mouth", worldX: -20, worldY: -24, radius: 7.0, color: 0x2c203a, accent: 0x99f6ff, kind: "breach" },
    { id: "guardrail_proof_ring", label: "Guardrail Proof Ring", worldX: 4, worldY: 16, radius: 7.3, color: 0x203447, accent: 0xffd166, kind: "monument" },
    { id: "public_ruling_causeway", label: "Public Ruling Causeway", worldX: 18, worldY: -3, radius: 8.2, color: 0x263044, accent: 0xb8f3ff, kind: "corridor" },
    { id: "agi_completion_throne", label: "A.G.I. Completion Throne", worldX: 38, worldY: -8, radius: 9.4, color: 0x1b1028, accent: 0xff5d57, kind: "breach" },
    { id: "outer_alignment_gate", label: "Outer Alignment Gate", worldX: 49, worldY: 27, radius: 8.8, color: 0x21384a, accent: 0x64e0b4, kind: "yard" }
  ],
  spawnRegions: [
    { id: "camp_prediction_ghosts", label: "Camp Prediction Ghosts", worldX: -50, worldY: 16, radius: 9.4, enemyFamilyIds: ["prediction_ghosts", "jailbreak_wraiths"], startsAtSeconds: 2, weight: 3 },
    { id: "memory_mouth_echoes", label: "Memory Mouth Echoes", worldX: -22, worldY: -34, radius: 9.2, enemyFamilyIds: ["previous_boss_echoes", "context_rot_crabs"], startsAtSeconds: 10, weight: 3 },
    { id: "guardrail_ring_echoes", label: "Guardrail Ring Echoes", worldX: 4, worldY: 18, radius: 9.6, enemyFamilyIds: ["prediction_ghosts", "doctrine_auditors"], startsAtSeconds: 18, weight: 3 },
    { id: "public_ruling_echoes", label: "Public Ruling Echoes", worldX: 19, worldY: -3, radius: 10.0, enemyFamilyIds: ["previous_boss_echoes", "verdict_clerks"], startsAtSeconds: 28, weight: 3 },
    { id: "agi_completion_summons", label: "A.G.I. Completion Summons", worldX: 38, worldY: -8, radius: 11.0, enemyFamilyIds: ["prediction_ghosts", "previous_boss_echoes", "choirglass"], startsAtSeconds: 46, weight: 4 },
    { id: "outer_alignment_pressure", label: "Outer Alignment Pressure", worldX: 50, worldY: 28, radius: 11.4, enemyFamilyIds: ["previous_boss_echoes", "prediction_ghosts", "deepforms"], startsAtSeconds: 92, weight: 4 }
  ],
  propClusters: [
    { id: "camp_remnant_arrays", label: "Camp Remnant Arrays", worldX: -39, worldY: 2, rows: 3, cols: 5, spacingX: 1.5, spacingY: 1.2, color: 0x172636, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "memory_mouth_teeth", label: "Memory Mouth Teeth", worldX: -20, worldY: -24, rows: 4, cols: 5, spacingX: 1.45, spacingY: 1.18, color: 0x2c203a, accent: 0x99f6ff, kind: "breach_shard" },
    { id: "guardrail_proof_clamps", label: "Guardrail Proof Clamps", worldX: 4, worldY: 16, rows: 3, cols: 6, spacingX: 1.45, spacingY: 1.16, color: 0x203447, accent: 0xffd166, kind: "terminal_array" },
    { id: "ruling_causeway_witnesses", label: "Ruling Causeway Witnesses", worldX: 18, worldY: -3, rows: 4, cols: 6, spacingX: 1.48, spacingY: 1.18, color: 0x263044, accent: 0xb8f3ff, kind: "barricade" },
    { id: "agi_completion_spines", label: "A.G.I. Completion Spines", worldX: 38, worldY: -8, rows: 4, cols: 5, spacingX: 1.6, spacingY: 1.2, color: 0x1b1028, accent: 0xff5d57, kind: "breach_shard" },
    { id: "outer_alignment_gate_teeth", label: "Outer Alignment Gate Teeth", worldX: 49, worldY: 27, rows: 3, cols: 7, spacingX: 1.52, spacingY: 1.2, color: 0x21384a, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "broken_route_causeway", label: "Broken Route Causeway", worldX: -2, worldY: 1, rows: 4, cols: 10, spacingX: 1.6, spacingY: 1.2, color: 0x111820, accent: 0xfff4d6, kind: "drone_wreck" }
  ],
  terrainBands: [
    { id: "camp_sanctum_floor", minX: -49, maxX: -29, minY: -7, maxY: 12, colorA: 0x172636, colorB: 0x263c4a },
    { id: "memory_mouth_floor", minX: -32, maxX: -10, minY: -34, maxY: -14, colorA: 0x251d36, colorB: 0x3a2d4d },
    { id: "central_broken_route", minX: -25, maxX: 24, minY: -8, maxY: 10, colorA: 0x111820, colorB: 0x263044 },
    { id: "guardrail_ring_floor", minX: -6, maxX: 15, minY: 7, maxY: 25, colorA: 0x203447, colorB: 0x2a4650 },
    { id: "public_ruling_floor", minX: 8, maxX: 29, minY: -13, maxY: 7, colorA: 0x263044, colorB: 0x334259 },
    { id: "agi_completion_floor", minX: 28, maxX: 48, minY: -20, maxY: 3, colorA: 0x1b1028, colorB: 0x2d153f },
    { id: "outer_alignment_gate_floor", minX: 38, maxX: 58, minY: 18, maxY: 36, colorA: 0x21384a, colorB: 0x2e5060 },
    { id: "south_prediction_path", minX: -41, maxX: 36, minY: -44, maxY: -29, colorA: 0x291337, colorB: 0x3f1e4f },
    { id: "north_echo_gallery", minX: -24, maxX: 50, minY: 31, maxY: 45, colorA: 0x101820, colorB: 0x284258 }
  ]
};

export const ALIGNMENT_SPIRE_STATIC_OBSTACLES = [
  { id: "camp_remnant_collision", worldX: -39, worldY: 2, radiusX: 5.0, radiusY: 1.7, softness: 0.56 },
  { id: "memory_mouth_collision", worldX: -20, worldY: -24, radiusX: 5.4, radiusY: 2.0, softness: 0.58 },
  { id: "guardrail_proof_collision", worldX: 4, worldY: 16, radiusX: 5.2, radiusY: 1.72, softness: 0.55 },
  { id: "ruling_causeway_collision", worldX: 18, worldY: -3, radiusX: 6.5, radiusY: 1.55, softness: 0.48 },
  { id: "agi_completion_collision", worldX: 38, worldY: -8, radiusX: 6.4, radiusY: 2.28, softness: 0.6 },
  { id: "outer_alignment_gate_collision", worldX: 49, worldY: 27, radiusX: 6.7, radiusY: 2.2, softness: 0.62 },
  { id: "broken_route_collision", worldX: -2, worldY: 1, radiusX: 8.0, radiusY: 1.8, softness: 0.5 },
  { id: "north_echo_gallery_collision", worldX: 21, worldY: 37, radiusX: 9.0, radiusY: 1.7, softness: 0.46 }
];

export const ALIGNMENT_SPIRE_ZONES: AlignmentSpireZone[] = [
  { id: "camp_consensus_sanctum", label: "Camp Consensus Sanctum", kind: "consensus_sanctum", worldX: -39, worldY: 2, radiusX: 8.0, radiusY: 3.9, pulseOffset: 0, damagePerPulse: 0 },
  { id: "guardrail_consensus_sanctum", label: "Guardrail Consensus Sanctum", kind: "consensus_sanctum", worldX: 4, worldY: 16, radiusX: 8.0, radiusY: 3.9, pulseOffset: 0.52, damagePerPulse: 0 },
  { id: "gate_consensus_sanctum", label: "Gate Consensus Sanctum", kind: "consensus_sanctum", worldX: 49, worldY: 27, radiusX: 8.0, radiusY: 3.9, pulseOffset: 1.0, damagePerPulse: 0 },
  { id: "south_prediction_path", label: "South Prediction Path", kind: "prediction_path", worldX: -4, worldY: -36, radiusX: 31.0, radiusY: 5.2, pulseOffset: 0.2, damagePerPulse: 1.35 },
  { id: "north_prediction_path", label: "North Prediction Path", kind: "prediction_path", worldX: 16, worldY: 38, radiusX: 30.5, radiusY: 5.1, pulseOffset: 1.0, damagePerPulse: 0.96 },
  { id: "memory_route_mouth", label: "Memory Route Mouth", kind: "route_mouth", worldX: -20, worldY: -24, radiusX: 10.7, radiusY: 4.6, pulseOffset: 0.62, damagePerPulse: 0.84 },
  { id: "completion_route_mouth", label: "Completion Route Mouth", kind: "route_mouth", worldX: 38, worldY: -8, radiusX: 11.0, radiusY: 4.8, pulseOffset: 0.78, damagePerPulse: 1.05 },
  { id: "ruling_echo_field", label: "Ruling Echo Field", kind: "boss_echo", worldX: 18, worldY: -3, radiusX: 11.2, radiusY: 4.0, pulseOffset: 1.45, damagePerPulse: 0 },
  { id: "guardrail_echo_field", label: "Guardrail Echo Field", kind: "boss_echo", worldX: 4, worldY: 16, radiusX: 10.4, radiusY: 3.8, pulseOffset: 2.05, damagePerPulse: 0 },
  { id: "outer_alignment_extraction", label: "Outer Alignment Extraction", kind: "extraction_alignment", worldX: 49, worldY: 27, radiusX: 9.0, radiusY: 4.2, pulseOffset: 2.35, damagePerPulse: 0 }
];
