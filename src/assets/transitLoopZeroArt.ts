import { Assets, Rectangle, Texture } from "pixi.js";

import transitAuthoredGroundUrl from "../../assets/tiles/transit_loop_zero/authored_ground.png";
import transitTerrainUrl from "../../assets/tiles/transit_loop_zero/transit_terrain_chunks_v1.png";
import transitPropsUrl from "../../assets/props/transit_loop_zero/transit_props_objectives_v1.png";
import stationThatArrivesUrl from "../../assets/sprites/bosses/station_that_arrives.png";
import transitHazardVfxUrl from "../../assets/sprites/effects/transit_hazard_vfx_v1.png";

export const TRANSIT_LOOP_ART_ASSET_ID = "transit_loop_zero.production_source_v1";
export const TRANSIT_LOOP_AUTHORED_GROUND_ORIGIN_X = 2560;
export const TRANSIT_LOOP_AUTHORED_GROUND_ORIGIN_Y = 1536;

export type TransitTerrainFrame =
  | "originPlatform"
  | "alignedTrack"
  | "falseTrack"
  | "switchbackTrack"
  | "arrivalPad"
  | "signalPlatform"
  | "routeTurn"
  | "stationMouthFloor";

export type TransitPropFrame =
  | "signalPylonA"
  | "signalPylonB"
  | "arrivalEmitter"
  | "falseScheduleBoard"
  | "lampBeacon"
  | "routeSwitchPylon"
  | "railBarricadeA"
  | "railBarricadeB"
  | "routeSwitchConsole"
  | "stationScaffold"
  | "cableJunctionA"
  | "cableJunctionB";

export type TransitHazardVfxFrame =
  | "alignedTrackPulse"
  | "falseTrackSurge"
  | "arrivalWindowRing"
  | "platformAlignBurst"
  | "routeSwitchReward"
  | "stationArrivalShock"
  | "stationRelocation"
  | "falseScheduleWave";

export interface TransitLoopZeroArtTextures {
  authoredGround: Texture;
  terrain: Record<TransitTerrainFrame, Texture>;
  props: Record<TransitPropFrame, Texture>;
  station: Texture[];
  vfx: Record<TransitHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 384;
const TERRAIN_FRAME_H = 256;
const PROP_FRAME_W = 224;
const PROP_FRAME_H = 224;
const STATION_FRAME_W = 288;
const STATION_FRAME_H = 256;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: TransitTerrainFrame[] = [
  "originPlatform",
  "alignedTrack",
  "falseTrack",
  "switchbackTrack",
  "arrivalPad",
  "signalPlatform",
  "routeTurn",
  "stationMouthFloor"
];

const PROP_FRAMES: TransitPropFrame[] = [
  "signalPylonA",
  "signalPylonB",
  "arrivalEmitter",
  "falseScheduleBoard",
  "lampBeacon",
  "routeSwitchPylon",
  "railBarricadeA",
  "railBarricadeB",
  "routeSwitchConsole",
  "stationScaffold",
  "cableJunctionA",
  "cableJunctionB"
];

const VFX_FRAMES: TransitHazardVfxFrame[] = [
  "alignedTrackPulse",
  "falseTrackSurge",
  "arrivalWindowRing",
  "platformAlignBurst",
  "routeSwitchReward",
  "stationArrivalShock",
  "stationRelocation",
  "falseScheduleWave"
];

let transitLoopArtPromise: Promise<TransitLoopZeroArtTextures> | null = null;
let transitLoopArtTextures: TransitLoopZeroArtTextures | null = null;

export function getTransitLoopZeroArtTextures(): TransitLoopZeroArtTextures | null {
  return transitLoopArtTextures;
}

export function loadTransitLoopZeroArt(): Promise<TransitLoopZeroArtTextures> {
  transitLoopArtPromise ??= Promise.all([
    Assets.load<Texture>(transitAuthoredGroundUrl),
    Assets.load<Texture>(transitTerrainUrl),
    Assets.load<Texture>(transitPropsUrl),
    Assets.load<Texture>(stationThatArrivesUrl),
    Assets.load<Texture>(transitHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, stationAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 4) * TERRAIN_FRAME_W, Math.floor(index / 4) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<TransitTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<TransitPropFrame, Texture>;
    const station = Array.from(
      { length: 6 },
      (_, index) =>
        new Texture({
          source: stationAtlas.source,
          frame: new Rectangle((index % 3) * STATION_FRAME_W, Math.floor(index / 3) * STATION_FRAME_H, STATION_FRAME_W, STATION_FRAME_H)
        })
    );
    const vfx = Object.fromEntries(
      VFX_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: vfxAtlas.source,
          frame: new Rectangle((index % 4) * VFX_FRAME_W, Math.floor(index / 4) * VFX_FRAME_H, VFX_FRAME_W, VFX_FRAME_H)
        })
      ])
    ) as Record<TransitHazardVfxFrame, Texture>;
    transitLoopArtTextures = { authoredGround, terrain, props, station, vfx };
    return transitLoopArtTextures;
  });
  return transitLoopArtPromise;
}
