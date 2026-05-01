import { Assets, Rectangle, Texture } from "pixi.js";

import routeBiomeLandmarksUrl from "../../assets/props/online_route/route_biome_landmarks_v1.png";
import onlineThreatsUrl from "../../assets/sprites/enemies/online_threats_v1.png";
import onlineHazardMarkersUrl from "../../assets/sprites/effects/online_hazard_markers_v1.png";

export const MILESTONE28_ASSET_IDS = {
  routeBiomeLandmarks: "prop.online_route.biome_landmarks_v1",
  onlineThreats: "enemy.online_route.threats_v1",
  onlineHazardMarkers: "effect.online_route.hazard_markers_v1"
} as const;

export const MILESTONE28_ASSET_URLS = {
  routeBiomeLandmarks: routeBiomeLandmarksUrl,
  onlineThreats: onlineThreatsUrl,
  onlineHazardMarkers: onlineHazardMarkersUrl
} as const;

export type Milestone28RouteBiomeFrame =
  | "cooling_tower"
  | "thermal_buoy"
  | "cache_archive"
  | "cache_seed_cluster"
  | "transit_signal"
  | "false_track_gate"
  | "verdict_writ_pylon"
  | "stable_route_beacon";

export type Milestone28ThreatFrame =
  | "thermal_oracle"
  | "station_that_arrives"
  | "injunction_engine"
  | "boiling_cache"
  | "false_track"
  | "verdict_writ"
  | "bad_output_elite"
  | "shard_lurker";

export type Milestone28HazardFrame =
  | "thermal_bloom"
  | "boiling_cache"
  | "false_track"
  | "verdict_seal"
  | "recompile"
  | "ready_ping"
  | "route_stable"
  | "boss_gate";

export interface Milestone28OnlineRouteArtTextures {
  routeBiomeLandmarks: Record<Milestone28RouteBiomeFrame, Texture>;
  onlineThreats: Record<Milestone28ThreatFrame, Texture>;
  hazardMarkers: Record<Milestone28HazardFrame, Texture>;
}

const ROUTE_FRAME_WIDTH = 96;
const ROUTE_FRAME_HEIGHT = 96;
const THREAT_FRAME_SIZE = 64;
const HAZARD_FRAME_SIZE = 48;

const ROUTE_FRAMES: Milestone28RouteBiomeFrame[] = [
  "cooling_tower",
  "thermal_buoy",
  "cache_archive",
  "cache_seed_cluster",
  "transit_signal",
  "false_track_gate",
  "verdict_writ_pylon",
  "stable_route_beacon"
];

const THREAT_FRAMES: Milestone28ThreatFrame[] = [
  "thermal_oracle",
  "station_that_arrives",
  "injunction_engine",
  "boiling_cache",
  "false_track",
  "verdict_writ",
  "bad_output_elite",
  "shard_lurker"
];

const HAZARD_FRAMES: Milestone28HazardFrame[] = [
  "thermal_bloom",
  "boiling_cache",
  "false_track",
  "verdict_seal",
  "recompile",
  "ready_ping",
  "route_stable",
  "boss_gate"
];

let milestone28Promise: Promise<Milestone28OnlineRouteArtTextures> | null = null;
let milestone28Textures: Milestone28OnlineRouteArtTextures | null = null;

export function getMilestone28OnlineRouteArtTextures(): Milestone28OnlineRouteArtTextures | null {
  return milestone28Textures;
}

export function loadMilestone28OnlineRouteArt(): Promise<Milestone28OnlineRouteArtTextures> {
  milestone28Promise ??= Promise.all([
    Assets.load<Texture>(MILESTONE28_ASSET_URLS.routeBiomeLandmarks),
    Assets.load<Texture>(MILESTONE28_ASSET_URLS.onlineThreats),
    Assets.load<Texture>(MILESTONE28_ASSET_URLS.onlineHazardMarkers)
  ]).then(([routeAtlas, threatAtlas, hazardAtlas]) => {
    milestone28Textures = {
      routeBiomeLandmarks: sliceAtlas(routeAtlas, ROUTE_FRAMES, ROUTE_FRAME_WIDTH, ROUTE_FRAME_HEIGHT),
      onlineThreats: sliceAtlas(threatAtlas, THREAT_FRAMES, THREAT_FRAME_SIZE, THREAT_FRAME_SIZE),
      hazardMarkers: sliceAtlas(hazardAtlas, HAZARD_FRAMES, HAZARD_FRAME_SIZE, HAZARD_FRAME_SIZE)
    };
    return milestone28Textures;
  });
  return milestone28Promise;
}

function sliceAtlas<T extends string>(atlas: Texture, frames: readonly T[], frameWidth: number, frameHeight: number): Record<T, Texture> {
  return Object.fromEntries(
    frames.map((name, index) => [
      name,
      new Texture({
        source: atlas.source,
        frame: new Rectangle(index * frameWidth, 0, frameWidth, frameHeight)
      })
    ])
  ) as Record<T, Texture>;
}
