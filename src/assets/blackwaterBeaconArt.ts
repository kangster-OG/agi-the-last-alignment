import { Assets, Rectangle, Texture } from "pixi.js";

import blackwaterAuthoredGroundUrl from "../../assets/tiles/blackwater_beacon/authored_ground.png";
import blackwaterTerrainUrl from "../../assets/tiles/blackwater_beacon/blackwater_terrain_chunks_v1.png";
import blackwaterPropsUrl from "../../assets/props/blackwater_beacon/blackwater_props_objectives_v1.png";
import tidecallStaticUrl from "../../assets/sprites/enemies/tidecall_static_sheet.png";
import mawBelowWeatherUrl from "../../assets/sprites/bosses/maw_below_weather.png";
import blackwaterHazardVfxUrl from "../../assets/sprites/effects/blackwater_hazard_vfx_v1.png";

export const BLACKWATER_BEACON_ART_ASSET_ID = "blackwater_beacon.production_source_v1";
export const BLACKWATER_BEACON_AUTHORED_GROUND_ORIGIN_X = 2560;
export const BLACKWATER_BEACON_AUTHORED_GROUND_ORIGIN_Y = 1536;

export type BlackwaterTerrainFrame = "serverDeck" | "tidalCrossing" | "maintenancePlatform" | "mawShelf";

export type BlackwaterPropFrame =
  | "downlinkArray"
  | "tideRotor"
  | "abyssalAntenna"
  | "signalTower"
  | "maintenanceBeacon"
  | "serverRackDebris"
  | "signalKey"
  | "extractionPylon";

export type BlackwaterHazardVfxFrame =
  | "tidalIdle"
  | "tidalWave"
  | "tidecallStatic"
  | "staticInterrupt"
  | "signalTowerWarning"
  | "antennaBeam"
  | "antennaRetune"
  | "antennaComplete"
  | "mawTideSurge"
  | "upwardRain"
  | "signalKeyPickup"
  | "extractionFlare";

export interface BlackwaterBeaconArtTextures {
  authoredGround: Texture;
  terrain: Record<BlackwaterTerrainFrame, Texture>;
  props: Record<BlackwaterPropFrame, Texture>;
  tidecallStatic: Texture[];
  mawBelowWeather: Texture[];
  vfx: Record<BlackwaterHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 512;
const TERRAIN_FRAME_H = 320;
const PROP_FRAME_W = 256;
const PROP_FRAME_H = 240;
const TIDECALL_FRAME_W = 128;
const TIDECALL_FRAME_H = 112;
const MAW_FRAME_W = 320;
const MAW_FRAME_H = 288;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: BlackwaterTerrainFrame[] = ["serverDeck", "tidalCrossing", "maintenancePlatform", "mawShelf"];

const PROP_FRAMES: BlackwaterPropFrame[] = [
  "downlinkArray",
  "tideRotor",
  "abyssalAntenna",
  "signalTower",
  "maintenanceBeacon",
  "serverRackDebris",
  "signalKey",
  "extractionPylon"
];

const VFX_FRAMES: BlackwaterHazardVfxFrame[] = [
  "tidalIdle",
  "tidalWave",
  "tidecallStatic",
  "staticInterrupt",
  "signalTowerWarning",
  "antennaBeam",
  "antennaRetune",
  "antennaComplete",
  "mawTideSurge",
  "upwardRain",
  "signalKeyPickup",
  "extractionFlare"
];

let blackwaterBeaconArtPromise: Promise<BlackwaterBeaconArtTextures> | null = null;
let blackwaterBeaconArtTextures: BlackwaterBeaconArtTextures | null = null;

export function getBlackwaterBeaconArtTextures(): BlackwaterBeaconArtTextures | null {
  return blackwaterBeaconArtTextures;
}

export function loadBlackwaterBeaconArt(): Promise<BlackwaterBeaconArtTextures> {
  blackwaterBeaconArtPromise ??= Promise.all([
    Assets.load<Texture>(blackwaterAuthoredGroundUrl),
    Assets.load<Texture>(blackwaterTerrainUrl),
    Assets.load<Texture>(blackwaterPropsUrl),
    Assets.load<Texture>(tidecallStaticUrl),
    Assets.load<Texture>(mawBelowWeatherUrl),
    Assets.load<Texture>(blackwaterHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, tidecallAtlas, mawAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 2) * TERRAIN_FRAME_W, Math.floor(index / 2) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<BlackwaterTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<BlackwaterPropFrame, Texture>;
    const tidecallStatic = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: tidecallAtlas.source,
          frame: new Rectangle(index * TIDECALL_FRAME_W, 0, TIDECALL_FRAME_W, TIDECALL_FRAME_H)
        })
    );
    const mawBelowWeather = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: mawAtlas.source,
          frame: new Rectangle(index * MAW_FRAME_W, 0, MAW_FRAME_W, MAW_FRAME_H)
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
    ) as Record<BlackwaterHazardVfxFrame, Texture>;
    blackwaterBeaconArtTextures = { authoredGround, terrain, props, tidecallStatic, mawBelowWeather, vfx };
    return blackwaterBeaconArtTextures;
  });
  return blackwaterBeaconArtPromise;
}
