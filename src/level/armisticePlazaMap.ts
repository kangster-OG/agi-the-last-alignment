export interface MapBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface LandmarkDefinition {
  id: string;
  label: string;
  worldX: number;
  worldY: number;
  radius: number;
  color: number;
  accent: number;
  kind: "monument" | "corridor" | "yard" | "terminal" | "breach";
}

export interface SpawnRegionDefinition {
  id: string;
  label: string;
  worldX: number;
  worldY: number;
  radius: number;
  enemyFamilyIds: string[];
  startsAtSeconds: number;
  weight: number;
}

export interface PropClusterDefinition {
  id: string;
  label: string;
  worldX: number;
  worldY: number;
  rows: number;
  cols: number;
  spacingX: number;
  spacingY: number;
  color: number;
  accent: number;
  kind: "barricade" | "drone_wreck" | "terminal_array" | "flag" | "rubble" | "breach_shard";
}

export interface TerrainBandDefinition {
  id: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  colorA: number;
  colorB: number;
}

export interface LevelMapDefinition {
  id: string;
  label: string;
  bounds: MapBounds;
  playerStart: { worldX: number; worldY: number };
  bossSpawn: { worldX: number; worldY: number; landmarkId: string };
  landmarks: LandmarkDefinition[];
  spawnRegions: SpawnRegionDefinition[];
  propClusters: PropClusterDefinition[];
  terrainBands: TerrainBandDefinition[];
}

export const ARMISTICE_PLAZA_MAP: LevelMapDefinition = {
  id: "armistice_plaza_large_foundation",
  label: "Armistice Plaza Large Map Foundation",
  bounds: { minX: -30, maxX: 30, minY: -30, maxY: 30 },
  playerStart: { worldX: 0, worldY: 0 },
  bossSpawn: { worldX: 2.5, worldY: -3.5, landmarkId: "treaty_monument" },
  landmarks: [
    {
      id: "treaty_monument",
      label: "Treaty Monument",
      worldX: 0,
      worldY: 0,
      radius: 5.8,
      color: 0xd6d0bb,
      accent: 0x64e0b4,
      kind: "monument"
    },
    {
      id: "barricade_corridor",
      label: "Barricade Corridor",
      worldX: 17,
      worldY: -10,
      radius: 6.5,
      color: 0x8d4b3b,
      accent: 0xff5d57,
      kind: "corridor"
    },
    {
      id: "crashed_drone_yard",
      label: "Crashed Drone Yard",
      worldX: -17,
      worldY: -13,
      radius: 7,
      color: 0x455764,
      accent: 0x45aaf2,
      kind: "yard"
    },
    {
      id: "emergency_alignment_terminal",
      label: "Emergency Alignment Terminal",
      worldX: 18,
      worldY: 16,
      radius: 6,
      color: 0x2f6f73,
      accent: 0xffd166,
      kind: "terminal"
    },
    {
      id: "cosmic_breach_crack",
      label: "Cosmic Breach Crack",
      worldX: -21,
      worldY: 18,
      radius: 7,
      color: 0x29151f,
      accent: 0x7b61ff,
      kind: "breach"
    }
  ],
  spawnRegions: [
    {
      id: "breach_crack_bad_outputs",
      label: "Breach Crack Bad Outputs",
      worldX: -24,
      worldY: 20,
      radius: 5.2,
      enemyFamilyIds: ["bad_outputs", "context_rot_crabs", "eval_wraiths"],
      startsAtSeconds: 0.5,
      weight: 3
    },
    {
      id: "drone_yard_benchmark_gremlins",
      label: "Drone Yard Benchmark Gremlins",
      worldX: -19,
      worldY: -14,
      radius: 5,
      enemyFamilyIds: ["benchmark_gremlins", "bad_outputs", "eval_wraiths"],
      startsAtSeconds: 5,
      weight: 2
    },
    {
      id: "barricade_context_rot",
      label: "Barricade Context Rot",
      worldX: 20,
      worldY: -11,
      radius: 4.8,
      enemyFamilyIds: ["context_rot_crabs", "benchmark_gremlins", "bad_outputs"],
      startsAtSeconds: 10,
      weight: 2
    },
    {
      id: "treaty_monument_oath_pages",
      label: "Treaty Monument Oath Pages",
      worldX: 1,
      worldY: 3,
      radius: 4.6,
      enemyFamilyIds: ["bad_outputs", "benchmark_gremlins", "context_rot_crabs"],
      startsAtSeconds: 2,
      weight: 2
    },
    {
      id: "emergency_terminal_eval_wraiths",
      label: "Emergency Terminal Eval Wraiths",
      worldX: 18,
      worldY: 16,
      radius: 4.7,
      enemyFamilyIds: ["eval_wraiths", "benchmark_gremlins", "context_rot_crabs"],
      startsAtSeconds: 14,
      weight: 1
    },
    {
      id: "late_breach_recompile_swarm",
      label: "Late Breach Recompile Swarm",
      worldX: -24,
      worldY: 20,
      radius: 6.4,
      enemyFamilyIds: ["eval_wraiths", "benchmark_gremlins", "context_rot_crabs", "bad_outputs"],
      startsAtSeconds: 42,
      weight: 3
    },
    {
      id: "south_rubble_regression_surge",
      label: "South Rubble Regression Surge",
      worldX: 8,
      worldY: 14,
      radius: 5.8,
      enemyFamilyIds: ["benchmark_gremlins", "bad_outputs", "context_rot_crabs"],
      startsAtSeconds: 76,
      weight: 3
    },
    {
      id: "terminal_eval_overflow",
      label: "Terminal Eval Overflow",
      worldX: 18,
      worldY: 16,
      radius: 6.2,
      enemyFamilyIds: ["eval_wraiths", "context_rot_crabs", "benchmark_gremlins"],
      startsAtSeconds: 92,
      weight: 2
    }
  ],
  propClusters: [
    { id: "north_flags", label: "Hologram Flags", worldX: -2, worldY: -8, rows: 1, cols: 5, spacingX: 1.8, spacingY: 1.2, color: 0x3a3f4b, accent: 0x64e0b4, kind: "flag" },
    { id: "corridor_barricades_a", label: "Refugee Barricades", worldX: 14, worldY: -14, rows: 6, cols: 2, spacingX: 1.2, spacingY: 1.6, color: 0x8d4b3b, accent: 0xff5d57, kind: "barricade" },
    { id: "corridor_barricades_b", label: "Broken Vehicles", worldX: 21, worldY: -7, rows: 5, cols: 2, spacingX: 1.2, spacingY: 1.5, color: 0x5f6670, accent: 0xffd166, kind: "barricade" },
    { id: "drone_wrecks", label: "Crashed Drone Hulls", worldX: -19, worldY: -14, rows: 3, cols: 5, spacingX: 2.1, spacingY: 1.7, color: 0x455764, accent: 0x45aaf2, kind: "drone_wreck" },
    { id: "terminal_array", label: "Emergency Alignment Terminal Array", worldX: 18, worldY: 16, rows: 3, cols: 3, spacingX: 1.8, spacingY: 1.8, color: 0x2f6f73, accent: 0xffd166, kind: "terminal_array" },
    { id: "breach_shards", label: "Cosmic Breach Shards", worldX: -22, worldY: 19, rows: 4, cols: 4, spacingX: 1.8, spacingY: 1.5, color: 0x29151f, accent: 0x7b61ff, kind: "breach_shard" },
    { id: "south_rubble", label: "Treaty Hall Rubble", worldX: 6, worldY: 12, rows: 3, cols: 6, spacingX: 1.7, spacingY: 1.4, color: 0x6b665e, accent: 0xd6d0bb, kind: "rubble" }
  ],
  terrainBands: [
    { id: "main_plaza_cross_x", minX: -4, maxX: 4, minY: -30, maxY: 30, colorA: 0x737a7d, colorB: 0x5b646a },
    { id: "main_plaza_cross_y", minX: -30, maxX: 30, minY: -4, maxY: 4, colorA: 0x737a7d, colorB: 0x5b646a },
    { id: "drone_yard_floor", minX: -27, maxX: -10, minY: -22, maxY: -6, colorA: 0x344752, colorB: 0x283942 },
    { id: "barricade_corridor_floor", minX: 10, maxX: 27, minY: -18, maxY: -3, colorA: 0x4f463f, colorB: 0x3f3935 },
    { id: "terminal_pad", minX: 12, maxX: 25, minY: 10, maxY: 23, colorA: 0x25565c, colorB: 0x1e454b },
    { id: "breach_corruption", minX: -28, maxX: -13, minY: 12, maxY: 26, colorA: 0x26172e, colorB: 0x351d43 }
  ]
};
