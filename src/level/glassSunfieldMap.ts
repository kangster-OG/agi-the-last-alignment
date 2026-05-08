import type { LevelMapDefinition } from "./armisticePlazaMap";

export type GlassSunfieldZoneKind = "shade_pocket" | "exposed_glass_lane" | "prism_window" | "reflection_field" | "extraction_prism";

export interface GlassSunfieldZone {
  id: string;
  label: string;
  kind: GlassSunfieldZoneKind;
  worldX: number;
  worldY: number;
  radiusX: number;
  radiusY: number;
  pulseOffset: number;
  damagePerPulse: number;
}

export const GLASS_SUNFIELD_MAP: LevelMapDefinition = {
  id: "glass_sunfield_prism_v1",
  label: "Glass Sunfield Prism Route",
  bounds: { minX: -50, maxX: 56, minY: -44, maxY: 46 },
  playerStart: { worldX: -34, worldY: 2 },
  bossSpawn: { worldX: 31, worldY: -10, landmarkId: "wrong_sunrise_engine" },
  landmarks: [
    { id: "western_shade_lens", label: "Western Shade Lens", worldX: -30, worldY: 4, radius: 6.5, color: 0x263645, accent: 0x99f6ff, kind: "terminal" },
    { id: "mistral_wind_lens", label: "Mistral Wind Lens", worldX: -12, worldY: -17, radius: 6.2, color: 0x2d3443, accent: 0x64e0b4, kind: "terminal" },
    { id: "deepmind_mirror_lens", label: "DeepMind Mirror Lens", worldX: 8, worldY: 12, radius: 6.4, color: 0x25384a, accent: 0xffd166, kind: "monument" },
    { id: "prism_switchback", label: "Prism Switchback", worldX: 13, worldY: -5, radius: 8.4, color: 0x302738, accent: 0xb8f3ff, kind: "corridor" },
    { id: "wrong_sunrise_engine", label: "Wrong Sunrise Engine", worldX: 31, worldY: -10, radius: 7.8, color: 0x171b28, accent: 0xff5d57, kind: "breach" },
    { id: "glass_prism_gate", label: "Glass Prism Gate", worldX: 40, worldY: 22, radius: 7.4, color: 0x1b3141, accent: 0xffd166, kind: "yard" }
  ],
  spawnRegions: [
    { id: "west_solar_reflections", label: "West Solar Reflections", worldX: -43, worldY: 14, radius: 8.5, enemyFamilyIds: ["solar_reflections", "choirglass"], startsAtSeconds: 2, weight: 3 },
    { id: "wind_lens_choir", label: "Wind Lens Choir", worldX: -12, worldY: -27, radius: 8.0, enemyFamilyIds: ["solar_reflections", "eval_wraiths"], startsAtSeconds: 8, weight: 2 },
    { id: "prism_switch_refraction", label: "Prism Switch Refraction", worldX: 13, worldY: -5, radius: 9.0, enemyFamilyIds: ["solar_reflections", "choirglass"], startsAtSeconds: 14, weight: 3 },
    { id: "mirror_lens_splitters", label: "Mirror Lens Splitters", worldX: 8, worldY: 15, radius: 8.6, enemyFamilyIds: ["choirglass", "solar_reflections"], startsAtSeconds: 24, weight: 2 },
    { id: "wrong_sunrise_corona", label: "Wrong Sunrise Corona", worldX: 31, worldY: -10, radius: 9.6, enemyFamilyIds: ["solar_reflections", "choirglass", "overfit_horrors"], startsAtSeconds: 34, weight: 3 },
    { id: "glass_prism_extraction", label: "Glass Prism Extraction", worldX: 43, worldY: 26, radius: 10.0, enemyFamilyIds: ["solar_reflections", "choirglass", "eval_wraiths"], startsAtSeconds: 72, weight: 3 }
  ],
  propClusters: [
    { id: "western_lens_ribs", label: "Western Lens Ribs", worldX: -30, worldY: 4, rows: 3, cols: 5, spacingX: 1.5, spacingY: 1.18, color: 0x263645, accent: 0x99f6ff, kind: "terminal_array" },
    { id: "mistral_mirror_vanes", label: "Mistral Mirror Vanes", worldX: -12, worldY: -17, rows: 4, cols: 4, spacingX: 1.46, spacingY: 1.18, color: 0x2d3443, accent: 0x64e0b4, kind: "terminal_array" },
    { id: "deepmind_prism_rows", label: "DeepMind Prism Rows", worldX: 8, worldY: 12, rows: 3, cols: 5, spacingX: 1.42, spacingY: 1.22, color: 0x25384a, accent: 0xffd166, kind: "breach_shard" },
    { id: "switchback_reflectors", label: "Switchback Reflectors", worldX: 13, worldY: -5, rows: 2, cols: 8, spacingX: 1.42, spacingY: 1.12, color: 0x302738, accent: 0xb8f3ff, kind: "barricade" },
    { id: "wrong_sunrise_facets", label: "Wrong Sunrise Facets", worldX: 31, worldY: -10, rows: 3, cols: 5, spacingX: 1.44, spacingY: 1.18, color: 0x171b28, accent: 0xff5d57, kind: "breach_shard" },
    { id: "glass_prism_gate_lanterns", label: "Glass Prism Gate Lanterns", worldX: 40, worldY: 22, rows: 3, cols: 6, spacingX: 1.52, spacingY: 1.2, color: 0x1b3141, accent: 0xffd166, kind: "terminal_array" },
    { id: "central_sunfield_shade_ribs", label: "Central Sunfield Shade Ribs", worldX: -2, worldY: 2, rows: 4, cols: 8, spacingX: 1.62, spacingY: 1.22, color: 0x22313f, accent: 0x45aaf2, kind: "drone_wreck" }
  ],
  terrainBands: [
    { id: "western_shade_glass_floor", minX: -39, maxX: -22, minY: -3, maxY: 11, colorA: 0x253443, colorB: 0x314657 },
    { id: "mistral_lens_floor", minX: -21, maxX: -4, minY: -25, maxY: -10, colorA: 0x2a3140, colorB: 0x394251 },
    { id: "central_sunfield_causeway", minX: -18, maxX: 18, minY: -4, maxY: 9, colorA: 0x1f2f3c, colorB: 0x2b4250 },
    { id: "deepmind_mirror_floor", minX: 0, maxX: 16, minY: 6, maxY: 20, colorA: 0x243749, colorB: 0x31536a },
    { id: "prism_switchback_floor", minX: 3, maxX: 23, minY: -15, maxY: 2, colorA: 0x2c2538, colorB: 0x3b2f4d },
    { id: "wrong_sunrise_floor", minX: 24, maxX: 40, minY: -19, maxY: -4, colorA: 0x171b28, colorB: 0x272d3c },
    { id: "glass_prism_gate_floor", minX: 31, maxX: 49, minY: 15, maxY: 30, colorA: 0x1b3141, colorB: 0x29495c },
    { id: "south_exposed_glass_lane", minX: -31, maxX: 27, minY: -35, maxY: -21, colorA: 0x241f2c, colorB: 0x362840 },
    { id: "north_exposed_glass_lane", minX: -20, maxX: 39, minY: 23, maxY: 38, colorA: 0x162737, colorB: 0x273e50 }
  ]
};

export const GLASS_SUNFIELD_STATIC_OBSTACLES = [
  { id: "western_shade_lens_collision", worldX: -30, worldY: 4, radiusX: 4.3, radiusY: 1.6, softness: 0.54 },
  { id: "mistral_wind_lens_collision", worldX: -12, worldY: -17, radiusX: 4.4, radiusY: 1.62, softness: 0.52 },
  { id: "deepmind_mirror_lens_collision", worldX: 8, worldY: 12, radiusX: 4.2, radiusY: 1.58, softness: 0.56 },
  { id: "central_shade_rib_collision", worldX: -2, worldY: 2, radiusX: 6.8, radiusY: 1.78, softness: 0.5 },
  { id: "prism_switchback_collision", worldX: 13, worldY: -5, radiusX: 6.4, radiusY: 1.24, softness: 0.44 },
  { id: "wrong_sunrise_engine_collision", worldX: 31, worldY: -10, radiusX: 5.3, radiusY: 2.05, softness: 0.58 },
  { id: "glass_prism_gate_collision", worldX: 40, worldY: 22, radiusX: 5.8, radiusY: 2.08, softness: 0.6 }
];

export const GLASS_SUNFIELD_ZONES: GlassSunfieldZone[] = [
  { id: "western_shade_pocket", label: "Western Shade Pocket", kind: "shade_pocket", worldX: -30, worldY: 4, radiusX: 7.2, radiusY: 3.6, pulseOffset: 0, damagePerPulse: 0 },
  { id: "deepmind_shade_pocket", label: "DeepMind Shade Pocket", kind: "shade_pocket", worldX: 8, worldY: 12, radiusX: 6.9, radiusY: 3.45, pulseOffset: 0.45, damagePerPulse: 0 },
  { id: "prism_gate_shade_pocket", label: "Prism Gate Shade Pocket", kind: "shade_pocket", worldX: 40, worldY: 22, radiusX: 7.2, radiusY: 3.7, pulseOffset: 0.9, damagePerPulse: 0 },
  { id: "south_exposed_glass_lane", label: "South Exposed Glass Lane", kind: "exposed_glass_lane", worldX: -3, worldY: -28, radiusX: 25.5, radiusY: 5.1, pulseOffset: 0.2, damagePerPulse: 1.15 },
  { id: "north_exposed_glass_lane", label: "North Exposed Glass Lane", kind: "exposed_glass_lane", worldX: 14, worldY: 30, radiusX: 25.2, radiusY: 5.0, pulseOffset: 1.1, damagePerPulse: 1.0 },
  { id: "mistral_prism_window", label: "Mistral Prism Window", kind: "prism_window", worldX: -12, worldY: -17, radiusX: 9.0, radiusY: 3.8, pulseOffset: 0.6, damagePerPulse: 0 },
  { id: "switchback_prism_window", label: "Switchback Prism Window", kind: "prism_window", worldX: 13, worldY: -5, radiusX: 10.6, radiusY: 3.7, pulseOffset: 1.55, damagePerPulse: 0 },
  { id: "wrong_sunrise_reflection_field", label: "Wrong Sunrise Reflection Field", kind: "reflection_field", worldX: 31, worldY: -10, radiusX: 9.5, radiusY: 4.3, pulseOffset: 0.75, damagePerPulse: 0 },
  { id: "mirror_lens_reflection_field", label: "Mirror Lens Reflection Field", kind: "reflection_field", worldX: 8, worldY: 12, radiusX: 8.8, radiusY: 3.8, pulseOffset: 1.8, damagePerPulse: 0 },
  { id: "glass_prism_extraction", label: "Glass Prism Extraction", kind: "extraction_prism", worldX: 40, worldY: 22, radiusX: 8.1, radiusY: 3.85, pulseOffset: 2.2, damagePerPulse: 0 }
];
