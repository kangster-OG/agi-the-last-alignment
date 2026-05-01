import type { Entity } from "../ecs/components";

export class SpatialGrid {
  private readonly buckets = new Map<string, Entity[]>();

  constructor(private readonly cellSize: number) {}

  clear(): void {
    this.buckets.clear();
  }

  insert(entity: Entity): void {
    const key = this.key(entity.worldX, entity.worldY);
    const bucket = this.buckets.get(key);
    if (bucket) {
      bucket.push(entity);
    } else {
      this.buckets.set(key, [entity]);
    }
  }

  nearby(worldX: number, worldY: number, radius: number): Entity[] {
    const minX = Math.floor((worldX - radius) / this.cellSize);
    const maxX = Math.floor((worldX + radius) / this.cellSize);
    const minY = Math.floor((worldY - radius) / this.cellSize);
    const maxY = Math.floor((worldY + radius) / this.cellSize);
    const out: Entity[] = [];
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const bucket = this.buckets.get(`${x},${y}`);
        if (bucket) out.push(...bucket);
      }
    }
    return out;
  }

  private key(worldX: number, worldY: number): string {
    return `${Math.floor(worldX / this.cellSize)},${Math.floor(worldY / this.cellSize)}`;
  }
}
