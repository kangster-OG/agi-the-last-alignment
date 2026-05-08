import { Assets, Rectangle, Texture } from "pixi.js";

import coolingAuthoredGroundUrl from "../../assets/tiles/cooling_lake_nine/authored_ground.png";
import coolingTerrainUrl from "../../assets/tiles/cooling_lake_nine/cooling_terrain_chunks_v1.png";
import coolingPropsUrl from "../../assets/props/cooling_lake_nine/cooling_props_objectives_v1.png";
import promptLeechesUrl from "../../assets/sprites/enemies/prompt_leeches_sheet.png";
import motherboardEelUrl from "../../assets/sprites/bosses/motherboard_eel.png";
import coolingHazardVfxUrl from "../../assets/sprites/effects/cooling_hazard_vfx_v1.png";

export const COOLING_LAKE_ART_ASSET_ID = "cooling_lake_nine.production_source_v1";
export const COOLING_LAKE_AUTHORED_GROUND_ORIGIN_X = 2560;
export const COOLING_LAKE_AUTHORED_GROUND_ORIGIN_Y = 1536;

export type CoolingTerrainFrame =
  | "dryServerPlate"
  | "coolantFloodLane"
  | "submergedRackFloor"
  | "cableTrench"
  | "dryIslandPlate"
  | "maintenanceWalkway"
  | "electrifiedShore"
  | "eelBasin";

export type CoolingPropFrame =
  | "buoyAlpha"
  | "buoyBeta"
  | "buoyGamma"
  | "buoyPadCompact"
  | "collapsedRackA"
  | "collapsedRackB"
  | "safePlatform"
  | "eelRackMarker";

export type CoolingHazardVfxFrame =
  | "coolantIdle"
  | "coolantSplash"
  | "electricArc"
  | "electricStrike"
  | "ventSteam"
  | "ventShockwave"
  | "buoyStabilize"
  | "buoyComplete"
  | "leechDrain"
  | "leechQuarantine"
  | "eelEmerge"
  | "eelElectrify";

export interface CoolingLakeNineArtTextures {
  authoredGround: Texture;
  terrain: Record<CoolingTerrainFrame, Texture>;
  props: Record<CoolingPropFrame, Texture>;
  leeches: Texture[];
  eel: Texture[];
  vfx: Record<CoolingHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 384;
const TERRAIN_FRAME_H = 256;
const PROP_FRAME_W = 256;
const PROP_FRAME_H = 224;
const LEECH_FRAME_W = 96;
const LEECH_FRAME_H = 96;
const EEL_FRAME_W = 256;
const EEL_FRAME_H = 256;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: CoolingTerrainFrame[] = [
  "dryServerPlate",
  "coolantFloodLane",
  "submergedRackFloor",
  "cableTrench",
  "dryIslandPlate",
  "maintenanceWalkway",
  "electrifiedShore",
  "eelBasin"
];

const PROP_FRAMES: CoolingPropFrame[] = [
  "buoyAlpha",
  "buoyBeta",
  "buoyGamma",
  "buoyPadCompact",
  "collapsedRackA",
  "collapsedRackB",
  "safePlatform",
  "eelRackMarker"
];

const VFX_FRAMES: CoolingHazardVfxFrame[] = [
  "coolantIdle",
  "coolantSplash",
  "electricArc",
  "electricStrike",
  "ventSteam",
  "ventShockwave",
  "buoyStabilize",
  "buoyComplete",
  "leechDrain",
  "leechQuarantine",
  "eelEmerge",
  "eelElectrify"
];

let coolingLakeArtPromise: Promise<CoolingLakeNineArtTextures> | null = null;
let coolingLakeArtTextures: CoolingLakeNineArtTextures | null = null;

export function getCoolingLakeNineArtTextures(): CoolingLakeNineArtTextures | null {
  return coolingLakeArtTextures;
}

export function loadCoolingLakeNineArt(): Promise<CoolingLakeNineArtTextures> {
  coolingLakeArtPromise ??= Promise.all([
    Assets.load<Texture>(coolingAuthoredGroundUrl),
    Assets.load<Texture>(coolingTerrainUrl),
    Assets.load<Texture>(coolingPropsUrl),
    Assets.load<Texture>(promptLeechesUrl),
    Assets.load<Texture>(motherboardEelUrl),
    Assets.load<Texture>(coolingHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, leechAtlas, eelAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 4) * TERRAIN_FRAME_W, Math.floor(index / 4) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<CoolingTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<CoolingPropFrame, Texture>;
    const leeches = Array.from(
      { length: 6 },
      (_, index) =>
        new Texture({
          source: leechAtlas.source,
          frame: new Rectangle(index * LEECH_FRAME_W, 0, LEECH_FRAME_W, LEECH_FRAME_H)
        })
    );
    const eel = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: eelAtlas.source,
          frame: new Rectangle(index * EEL_FRAME_W, 0, EEL_FRAME_W, EEL_FRAME_H)
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
    ) as Record<CoolingHazardVfxFrame, Texture>;
    coolingLakeArtTextures = { authoredGround, terrain, props, leeches, eel, vfx };
    return coolingLakeArtTextures;
  });
  return coolingLakeArtPromise;
}
