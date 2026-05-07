import type { World } from "../ecs/World";
import type { MapBounds, SpawnRegionDefinition } from "../level/armisticePlazaMap";
import { spawnEnemy } from "./enemies";

export interface Director {
  spawnTimer: number;
  totalSpawned: number;
  lastSpawnRegionId: string;
  spawnedByRegion: Record<string, number>;
  lastBurstSize: number;
  activeEnemyCap: number;
  cadencePhase: "opening" | "anchor_pressure" | "boss_arrival" | "late_extraction";
}

export function createDirector(): Director {
  return {
    spawnTimer: 0.3,
    totalSpawned: 0,
    lastSpawnRegionId: "",
    spawnedByRegion: {},
    lastBurstSize: 0,
    activeEnemyCap: 0,
    cadencePhase: "opening"
  };
}

export function updateDirector(
  world: World,
  director: Director,
  seconds: number,
  playerX: number,
  playerY: number,
  dt: number,
  spawnRegions: SpawnRegionDefinition[] = [],
  bounds?: MapBounds,
  playerCount = 1
): void {
  director.spawnTimer -= dt;
  const activeEnemies = world.active("enemy").length;
  const extraPlayers = Math.max(0, playerCount - 1);
  const phase = directorPhase(seconds);
  director.cadencePhase = phase.id;
  const cap = Math.min(phase.maxCap + extraPlayers * 12, phase.baseCap + extraPlayers * 8 + Math.floor(seconds * phase.capRamp));
  director.activeEnemyCap = cap;
  if (director.spawnTimer > 0 || activeEnemies >= cap) return;

  const nearbyEnemies = world.entities.filter((entity) => entity.active && entity.kind === "enemy" && !entity.boss && Math.hypot(entity.worldX - playerX, entity.worldY - playerY) <= 11.5).length;
  const burstVariance = seededUnit(director.totalSpawned * 31 + Math.floor(seconds * 4)) > 0.64 ? 1 : 0;
  const burst = phase.burst + burstVariance + Math.min(2, extraPlayers);
  director.lastBurstSize = burst;
  for (let i = 0; i < burst; i += 1) {
    const region = chooseSpawnRegion(spawnRegions, seconds, director.totalSpawned);
    const angle = seconds * 1.91 + i * 2.4 + director.totalSpawned * 0.17 + seededUnit(director.totalSpawned + i * 101) * 0.9;
    const shouldFlank = seconds >= phase.flankStarts && nearbyEnemies + i < phase.nearbyTarget && seededUnit(director.totalSpawned * 41 + i * 13 + Math.floor(seconds * 7)) > 0.24;
    if (shouldFlank) {
      const distance = 8.8 + seededUnit(director.totalSpawned * 29 + i * 5) * 4.4;
      const familyId = chooseEnemyFamily(region?.enemyFamilyIds ?? ["bad_outputs", "benchmark_gremlins", "context_rot_crabs", "eval_wraiths"], seconds, director.totalSpawned + i);
      const x = clamp(playerX + Math.cos(angle) * distance, bounds?.minX ?? -999, bounds?.maxX ?? 999);
      const y = clamp(playerY + Math.sin(angle) * distance, bounds?.minY ?? -999, bounds?.maxY ?? 999);
      spawnEnemy(world, x, y, seconds, familyId, "adaptive_pressure_flank");
      director.lastSpawnRegionId = "adaptive_pressure_flank";
      director.spawnedByRegion.adaptive_pressure_flank = (director.spawnedByRegion.adaptive_pressure_flank ?? 0) + 1;
    } else if (region) {
      const distanceRoll = seededUnit(director.totalSpawned * 17 + i * 53 + Math.floor(seconds * 3));
      const distance = region.radius * (0.32 + distanceRoll * 0.78);
      const familyId = chooseEnemyFamily(region.enemyFamilyIds, seconds, director.totalSpawned + i);
      const x = clamp(region.worldX + Math.cos(angle) * distance, bounds?.minX ?? -999, bounds?.maxX ?? 999);
      const y = clamp(region.worldY + Math.sin(angle) * distance, bounds?.minY ?? -999, bounds?.maxY ?? 999);
      spawnEnemy(world, x, y, seconds, familyId, region.id);
      director.lastSpawnRegionId = region.id;
      director.spawnedByRegion[region.id] = (director.spawnedByRegion[region.id] ?? 0) + 1;
    } else {
      const distance = 9 + (director.totalSpawned % 5);
      spawnEnemy(world, playerX + Math.cos(angle) * distance, playerY + Math.sin(angle) * distance, seconds);
    }
    director.totalSpawned += 1;
  }
  const timerJitter = seededUnit(director.totalSpawned * 19 + Math.floor(seconds * 5)) * 0.08;
  director.spawnTimer = Math.max(phase.minTimer, phase.baseTimer - seconds * phase.timerRamp - extraPlayers * 0.04 + timerJitter);
}

function directorPhase(seconds: number): {
  id: Director["cadencePhase"];
  baseCap: number;
  maxCap: number;
  capRamp: number;
  burst: number;
  baseTimer: number;
  timerRamp: number;
  minTimer: number;
  flankStarts: number;
  nearbyTarget: number;
} {
  if (seconds >= 78) {
    return { id: "late_extraction", baseCap: 34, maxCap: 92, capRamp: 0.78, burst: seconds >= 104 ? 6 : 5, baseTimer: 0.68, timerRamp: 0.0044, minTimer: 0.18, flankStarts: 78, nearbyTarget: 12 };
  }
  if (seconds >= 42) {
    return { id: "boss_arrival", baseCap: 28, maxCap: 76, capRamp: 0.72, burst: 4, baseTimer: 0.78, timerRamp: 0.0048, minTimer: 0.2, flankStarts: 42, nearbyTarget: 9 };
  }
  if (seconds >= 18) {
    return { id: "anchor_pressure", baseCap: 20, maxCap: 54, capRamp: 0.66, burst: 3, baseTimer: 0.9, timerRamp: 0.0052, minTimer: 0.24, flankStarts: 18, nearbyTarget: 6 };
  }
  return { id: "opening", baseCap: 14, maxCap: 34, capRamp: 0.55, burst: 2, baseTimer: 0.98, timerRamp: 0.0058, minTimer: 0.28, flankStarts: 8, nearbyTarget: 3 };
}

function chooseEnemyFamily(familyIds: string[], seconds: number, seed: number): string {
  if (familyIds.length === 0) return "bad_outputs";
  const lateBias = seconds >= 78 ? 2 : seconds >= 42 ? 1 : 0;
  const cursor = Math.floor(seededUnit(seed * 23 + Math.floor(seconds * 11)) * (familyIds.length + lateBias));
  return familyIds[Math.min(familyIds.length - 1, cursor)] ?? "bad_outputs";
}

function chooseSpawnRegion(spawnRegions: SpawnRegionDefinition[], seconds: number, seed: number): SpawnRegionDefinition | null {
  const active = spawnRegions.filter((region) => seconds >= region.startsAtSeconds);
  if (active.length === 0) return null;
  const totalWeight = active.reduce((sum, region) => sum + region.weight, 0);
  let cursor = seededUnit(seed * 7 + Math.floor(seconds * 2)) * totalWeight;
  for (const region of active) {
    cursor -= region.weight;
    if (cursor < 0) return region;
  }
  return active[active.length - 1] ?? null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}
