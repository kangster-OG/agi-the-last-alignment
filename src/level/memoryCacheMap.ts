import type { LevelMapDefinition } from "./armisticePlazaMap";

export type MemoryCacheZoneKind = "safe_recall_pocket" | "corrupted_archive_lane" | "risky_shortcut" | "redaction_field" | "extraction_index";

export interface MemoryCacheZone {
  id: string;
  label: string;
  kind: MemoryCacheZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const MEMORY_CACHE_MAP: LevelMapDefinition = {
  id: "memory_cache_recovery_v1",
  label: "Memory Cache Recovery",
  bounds: { minX: -50, maxX: 52, minY: -42, maxY: 44 },
  playerStart: { worldX: -32, worldY: 3 },
  bossSpawn: { worldX: 29, worldY: -12, landmarkId: "curator_vault" },
  landmarks: [
    { id: "intake_record_room", label: "Intake Record Room", worldX: -30, worldY: 4, radius: 6.1, color: 0x263142, accent: 0x99f6ff, kind: "terminal" },
    { id: "civic_memory_stack", label: "Civic Memory Stack", worldX: -13, worldY: -15, radius: 6.4, color: 0x2d3140, accent: 0xffd166, kind: "terminal" },
    { id: "witness_shard_chapel", label: "Witness Shard Chapel", worldX: 6, worldY: 12, radius: 6.5, color: 0x1f3b42, accent: 0x64e0b4, kind: "monument" },
    { id: "redacted_shortcut_sluice", label: "Redacted Shortcut Sluice", worldX: 10, worldY: -5, radius: 8.2, color: 0x201820, accent: 0xff5d57, kind: "corridor" },
    { id: "curator_vault", label: "Curator Vault", worldX: 29, worldY: -12, radius: 7.6, color: 0x111820, accent: 0x7b61ff, kind: "breach" },
    { id: "extraction_index", label: "Extraction Index", worldX: 36, worldY: 20, radius: 7.2, color: 0x152b32, accent: 0xffd166, kind: "yard" }
  ],
  spawnRegions: [
    { id: "west_context_rot", label: "West Context Rot", worldX: -41, worldY: 14, radius: 8.2, enemyFamilyIds: ["context_rot_crabs", "memory_anchors"], startsAtSeconds: 2, weight: 3 },
    { id: "archive_lane_scrapers", label: "Archive Lane Scrapers", worldX: -18, worldY: -25, radius: 8.0, enemyFamilyIds: ["context_rot_crabs", "redaction_angels"], startsAtSeconds: 8, weight: 2 },
    { id: "redacted_shortcut_rot", label: "Redacted Shortcut Rot", worldX: 10, worldY: -5, radius: 8.8, enemyFamilyIds: ["context_rot_crabs", "memory_anchors"], startsAtSeconds: 14, weight: 3 },
    { id: "witness_stack_overflow", label: "Witness Stack Overflow", worldX: 5, worldY: 14, radius: 8.4, enemyFamilyIds: ["memory_anchors", "eval_wraiths"], startsAtSeconds: 24, weight: 2 },
    { id: "curator_vault_redaction", label: "Curator Vault Redaction", worldX: 29, worldY: -12, radius: 9.2, enemyFamilyIds: ["context_rot_crabs", "redaction_angels", "memory_anchors"], startsAtSeconds: 34, weight: 3 },
    { id: "extraction_index_rot", label: "Extraction Index Rot", worldX: 39, worldY: 24, radius: 9.8, enemyFamilyIds: ["context_rot_crabs", "memory_anchors", "eval_wraiths"], startsAtSeconds: 68, weight: 3 }
  ],
  propClusters: [
    { id: "intake_record_terminals", label: "Intake Record Terminals", worldX: -30, worldY: 4, rows: 3, cols: 4, spacingX: 1.5, spacingY: 1.2, color: 0x263142, accent: 0x99f6ff, kind: "terminal_array" },
    { id: "civic_ledger_stacks", label: "Civic Ledger Stacks", worldX: -13, worldY: -15, rows: 4, cols: 5, spacingX: 1.45, spacingY: 1.18, color: 0x2d3140, accent: 0xffd166, kind: "terminal_array" },
    { id: "witness_shard_rows", label: "Witness Shard Rows", worldX: 6, worldY: 12, rows: 3, cols: 5, spacingX: 1.45, spacingY: 1.24, color: 0x1f3b42, accent: 0x64e0b4, kind: "breach_shard" },
    { id: "redaction_barriers", label: "Redaction Barriers", worldX: 10, worldY: -5, rows: 2, cols: 8, spacingX: 1.42, spacingY: 1.16, color: 0x201820, accent: 0xff5d57, kind: "barricade" },
    { id: "curator_file_teeth", label: "Curator File Teeth", worldX: 29, worldY: -12, rows: 3, cols: 5, spacingX: 1.45, spacingY: 1.2, color: 0x111820, accent: 0x7b61ff, kind: "breach_shard" },
    { id: "extraction_index_shelves", label: "Extraction Index Shelves", worldX: 36, worldY: 20, rows: 3, cols: 6, spacingX: 1.55, spacingY: 1.2, color: 0x152b32, accent: 0xffd166, kind: "terminal_array" },
    { id: "archive_wrecks", label: "Archive Wrecks", worldX: -4, worldY: 2, rows: 4, cols: 7, spacingX: 1.65, spacingY: 1.28, color: 0x263142, accent: 0x45aaf2, kind: "drone_wreck" }
  ],
  terrainBands: [
    { id: "intake_archive_floor", minX: -38, maxX: -23, minY: -2, maxY: 10, colorA: 0x222e3c, colorB: 0x2c3a4b },
    { id: "civic_stack_floor", minX: -21, maxX: -5, minY: -23, maxY: -9, colorA: 0x2a2d3a, colorB: 0x373847 },
    { id: "central_archive_causeway", minX: -17, maxX: 16, minY: -4, maxY: 8, colorA: 0x1d2b34, colorB: 0x263844 },
    { id: "witness_chapel_floor", minX: -1, maxX: 14, minY: 6, maxY: 19, colorA: 0x1c3940, colorB: 0x254d54 },
    { id: "redacted_shortcut_floor", minX: 1, maxX: 20, minY: -14, maxY: 1, colorA: 0x201820, colorB: 0x2b1e28 },
    { id: "curator_vault_floor", minX: 22, maxX: 38, minY: -20, maxY: -6, colorA: 0x121721, colorB: 0x1b2130 },
    { id: "extraction_index_floor", minX: 28, maxX: 45, minY: 14, maxY: 28, colorA: 0x142b32, colorB: 0x1c3a42 },
    { id: "south_corrupted_archive_lane", minX: -29, maxX: 23, minY: -33, maxY: -20, colorA: 0x151520, colorB: 0x221722 },
    { id: "north_corrupted_archive_lane", minX: -19, maxX: 36, minY: 22, maxY: 36, colorA: 0x111c22, colorB: 0x1c2730 }
  ]
};

export const MEMORY_CACHE_STATIC_OBSTACLES = [
  { id: "intake_record_collision", worldX: -30, worldY: 4, radiusX: 3.7, radiusY: 1.45, softness: 0.56 },
  { id: "civic_ledger_collision", worldX: -13, worldY: -15, radiusX: 4.2, radiusY: 1.55, softness: 0.54 },
  { id: "witness_shard_collision", worldX: 6, worldY: 12, radiusX: 3.9, radiusY: 1.5, softness: 0.58 },
  { id: "central_archive_wall", worldX: -4, worldY: 2, radiusX: 6.8, radiusY: 1.85, softness: 0.5 },
  { id: "redaction_barrier_line", worldX: 10, worldY: -5, radiusX: 6.5, radiusY: 1.25, softness: 0.45 },
  { id: "curator_vault_collision", worldX: 29, worldY: -12, radiusX: 5.2, radiusY: 2.0, softness: 0.6 },
  { id: "extraction_index_collision", worldX: 36, worldY: 20, radiusX: 5.6, radiusY: 2.05, softness: 0.62 }
];

export const MEMORY_CACHE_ZONES: MemoryCacheZone[] = [
  { id: "intake_recall_pocket", label: "Intake Recall Pocket", kind: "safe_recall_pocket", worldX: -30, worldY: 4, radiusX: 6.8, radiusY: 3.5, pulseOffset: 0, damagePerPulse: 0 },
  { id: "witness_recall_pocket", label: "Witness Recall Pocket", kind: "safe_recall_pocket", worldX: 6, worldY: 12, radiusX: 6.6, radiusY: 3.4, pulseOffset: 0.45, damagePerPulse: 0 },
  { id: "extraction_recall_pocket", label: "Extraction Recall Pocket", kind: "safe_recall_pocket", worldX: 36, worldY: 20, radiusX: 6.9, radiusY: 3.6, pulseOffset: 0.9, damagePerPulse: 0 },
  { id: "south_corrupted_archive_lane", label: "South Corrupted Archive Lane", kind: "corrupted_archive_lane", worldX: -4, worldY: -26, radiusX: 23.0, radiusY: 4.8, pulseOffset: 0.2, damagePerPulse: 1.45 },
  { id: "north_corrupted_archive_lane", label: "North Corrupted Archive Lane", kind: "corrupted_archive_lane", worldX: 12, worldY: 28, radiusX: 24.0, radiusY: 5.0, pulseOffset: 1.1, damagePerPulse: 1.25 },
  { id: "redacted_shortcut_a", label: "Redacted Shortcut A", kind: "risky_shortcut", worldX: 8, worldY: -7, radiusX: 10.8, radiusY: 3.4, pulseOffset: 0.75, damagePerPulse: 0.7 },
  { id: "redacted_shortcut_b", label: "Redacted Shortcut B", kind: "risky_shortcut", worldX: 21, worldY: 2, radiusX: 10.4, radiusY: 3.6, pulseOffset: 1.55, damagePerPulse: 0.85 },
  { id: "curator_redaction_field", label: "Curator Redaction Field", kind: "redaction_field", worldX: 29, worldY: -12, radiusX: 9.4, radiusY: 4.2, pulseOffset: 0.6, damagePerPulse: 0 },
  { id: "civic_redaction_field", label: "Civic Redaction Field", kind: "redaction_field", worldX: -13, worldY: -15, radiusX: 8.8, radiusY: 3.8, pulseOffset: 1.8, damagePerPulse: 0 },
  { id: "extraction_index_pressure", label: "Extraction Index Pressure", kind: "extraction_index", worldX: 36, worldY: 20, radiusX: 8.0, radiusY: 3.8, pulseOffset: 2.2, damagePerPulse: 0 }
];
