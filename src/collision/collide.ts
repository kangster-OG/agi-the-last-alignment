export function circlesOverlap(ax: number, ay: number, ar: number, bx: number, by: number, br: number): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const radius = ar + br;
  return dx * dx + dy * dy <= radius * radius;
}

export function clampToArena(point: { worldX: number; worldY: number }, halfSize: number): void {
  point.worldX = Math.max(-halfSize, Math.min(halfSize, point.worldX));
  point.worldY = Math.max(-halfSize, Math.min(halfSize, point.worldY));
}

export function clampToBounds(
  point: { worldX: number; worldY: number },
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  padding = 0
): void {
  point.worldX = Math.max(bounds.minX + padding, Math.min(bounds.maxX - padding, point.worldX));
  point.worldY = Math.max(bounds.minY + padding, Math.min(bounds.maxY - padding, point.worldY));
}
