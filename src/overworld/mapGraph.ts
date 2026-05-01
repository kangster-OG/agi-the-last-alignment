import { ALIGNMENT_GRID_MAP, START_NODE_ID, type AlignmentGridNode } from "./alignmentGridMap";

export type MapNode = AlignmentGridNode;

export interface MapEdge {
  from: string;
  to: string;
}

export interface MapGraph {
  nodes: MapNode[];
  edges: MapEdge[];
}

export const MAP_GRAPH: MapGraph = {
  nodes: ALIGNMENT_GRID_MAP.nodes,
  edges: ALIGNMENT_GRID_MAP.routes.map((route) => ({ from: route.from, to: route.to }))
};

export { START_NODE_ID };
