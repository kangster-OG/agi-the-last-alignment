import type { World } from "../ecs/World";
import type { MapBounds, SpawnRegionDefinition } from "../level/armisticePlazaMap";
import { spawnEnemy } from "./enemies";

export interface Director {
  spawnTimer: number;
  totalSpawned: number;
  lastSpawnRegionId: string;
  spawnedByRegion: Record<string, number>;
}

export function createDirector(): Director {
  return { spawnTimer: 0.3, totalSpawned: 0, lastSpawnRegionId: "", spawnedByRegion: {} };
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
  const cap = Math.min(48 + extraPlayers * 8, 12 + extraPlayers * 8 + Math.floor(seconds * 0.6));
  if (director.spawnTimer > 0 || activeEnemies >= cap) return;

  const burst = (seconds > 45 ? 3 : seconds > 20 ? 2 : 2) + Math.min(2, extraPlayers);
  for (let i = 0; i < burst; i += 1) {
    const region = chooseSpawnRegion(spawnRegions, seconds, director.totalSpawned);
    const angle = seconds * 1.91 + i * 2.4 + director.totalSpawned * 0.17;
    if (region) {
      const distance = region.radius * (0.35 + ((director.totalSpawned + i) % 7) / 9);
      const familyId = region.enemyFamilyIds[(director.totalSpawned + i) % region.enemyFamilyIds.length] ?? "bad_outputs";
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
  director.spawnTimer = Math.max(0.32, 1.0 - seconds * 0.007 - extraPlayers * 0.04);
}

function chooseSpawnRegion(spawnRegions: SpawnRegionDefinition[], seconds: number, seed: number): SpawnRegionDefinition | null {
  const active = spawnRegions.filter((region) => seconds >= region.startsAtSeconds);
  if (active.length === 0) return null;
  const totalWeight = active.reduce((sum, region) => sum + region.weight, 0);
  let cursor = (seed * 7 + Math.floor(seconds * 2)) % totalWeight;
  for (const region of active) {
    cursor -= region.weight;
    if (cursor < 0) return region;
  }
  return active[active.length - 1] ?? null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
