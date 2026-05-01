import { Assets, Rectangle, Texture } from "pixi.js";

import routeLandmarksUrl from "../../assets/props/online_route/route_landmarks_v1.png";

export const MILESTONE25_ASSET_IDS = {
  routeLandmarks: "prop.online_route.cache_transit_landmarks_v1"
} as const;

export const MILESTONE25_ASSET_URLS = {
  routeLandmarks: routeLandmarksUrl
} as const;

export type Milestone25RouteLandmarkId = "cache_core" | "persistence_seed" | "archive_switchback" | "transit_platform" | "route_pylon";

export interface Milestone25RouteArtTextures {
  routeLandmarks: Record<Milestone25RouteLandmarkId, Texture>;
}

const FRAME_WIDTH = 96;
const FRAME_HEIGHT = 96;
const FRAME_IDS: Milestone25RouteLandmarkId[] = ["cache_core", "persistence_seed", "archive_switchback", "transit_platform", "route_pylon"];

let milestone25Promise: Promise<Milestone25RouteArtTextures> | null = null;
let milestone25Textures: Milestone25RouteArtTextures | null = null;

export function getMilestone25RouteArtTextures(): Milestone25RouteArtTextures | null {
  return milestone25Textures;
}

export function loadMilestone25RouteArt(): Promise<Milestone25RouteArtTextures> {
  milestone25Promise ??= Assets.load<Texture>(MILESTONE25_ASSET_URLS.routeLandmarks).then((atlas) => {
    milestone25Textures = {
      routeLandmarks: Object.fromEntries(
        FRAME_IDS.map((id, index) => [
          id,
          new Texture({
            source: atlas.source,
            frame: new Rectangle(index * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT)
          })
        ])
      ) as Record<Milestone25RouteLandmarkId, Texture>
    };
    return milestone25Textures;
  });
  return milestone25Promise;
}
