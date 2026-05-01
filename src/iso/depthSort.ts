export interface DepthItem {
  depthY: number;
  depthX?: number;
}

export function byIsoDepth(a: DepthItem, b: DepthItem): number {
  return a.depthY - b.depthY || (a.depthX ?? 0) - (b.depthX ?? 0);
}
