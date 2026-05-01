import type { MapGraph, MapNode } from "./mapGraph";
import { START_NODE_ID } from "./mapGraph";

export function isNodeUnlocked(node: MapNode, graph: MapGraph, completed: Set<string>): boolean {
  if (node.id === START_NODE_ID) return true;
  return graph.edges.some((edge) => edge.to === node.id && completed.has(edge.from));
}

export function isNodeAvailable(node: MapNode, graph: MapGraph, completed: Set<string>, unlocked: Set<string>): boolean {
  return unlocked.has(node.id) || isNodeUnlocked(node, graph, completed);
}

export function nearestNode(nodes: MapNode[], worldX: number, worldY: number): { node: MapNode; distance: number } {
  let best = nodes[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const node of nodes) {
    const distance = Math.hypot(node.worldX - worldX, node.worldY - worldY);
    if (distance < bestDistance) {
      best = node;
      bestDistance = distance;
    }
  }
  return { node: best, distance: bestDistance };
}
