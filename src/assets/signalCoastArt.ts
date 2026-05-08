import { Assets, Rectangle, Texture } from "pixi.js";

import signalAuthoredGroundUrl from "../../assets/tiles/signal_coast/authored_ground.png";
import signalTerrainUrl from "../../assets/tiles/signal_coast/signal_terrain_chunks_v1.png";
import signalPropsUrl from "../../assets/props/signal_coast/signal_props_objectives_v1.png";
import staticSkimmersUrl from "../../assets/sprites/enemies/static_skimmers_sheet.png";
import lighthouseThatAnswersUrl from "../../assets/sprites/bosses/lighthouse_that_answers.png";
import signalHazardVfxUrl from "../../assets/sprites/effects/signal_hazard_vfx_v1.png";

export const SIGNAL_COAST_ART_ASSET_ID = "signal_coast.production_source_v1";
export const SIGNAL_COAST_AUTHORED_GROUND_ORIGIN_X = 2560;
export const SIGNAL_COAST_AUTHORED_GROUND_ORIGIN_Y = 1536;

export type SignalTerrainFrame = "causeway" | "relayPad" | "safeSpit" | "lighthouseShelf";

export type SignalPropFrame =
  | "relayPadBeacon"
  | "cablePylon"
  | "antennaWreck"
  | "serverRackDebris"
  | "offshoreSignalBuoy"
  | "relayConsole"
  | "calibrationTower"
  | "causewayBarricade";

export type SignalHazardVfxFrame =
  | "clearSignalPulse"
  | "relayCalibrationBurst"
  | "corruptedTideCrack"
  | "staticFieldShimmer"
  | "cableArcStrike"
  | "lighthouseBeamSweep"
  | "skimmerJamSpark"
  | "relayCompletionFlash"
  | "safeLaneReveal"
  | "extractionBeaconFlare"
  | "signalShard"
  | "bossTidePulse";

export interface SignalCoastArtTextures {
  authoredGround: Texture;
  terrain: Record<SignalTerrainFrame, Texture>;
  props: Record<SignalPropFrame, Texture>;
  skimmers: Texture[];
  lighthouse: Texture[];
  vfx: Record<SignalHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 512;
const TERRAIN_FRAME_H = 320;
const PROP_FRAME_W = 256;
const PROP_FRAME_H = 240;
const SKIMMER_FRAME_W = 128;
const SKIMMER_FRAME_H = 112;
const LIGHTHOUSE_FRAME_W = 320;
const LIGHTHOUSE_FRAME_H = 288;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: SignalTerrainFrame[] = ["causeway", "relayPad", "safeSpit", "lighthouseShelf"];

const PROP_FRAMES: SignalPropFrame[] = [
  "relayPadBeacon",
  "cablePylon",
  "antennaWreck",
  "serverRackDebris",
  "offshoreSignalBuoy",
  "relayConsole",
  "calibrationTower",
  "causewayBarricade"
];

const VFX_FRAMES: SignalHazardVfxFrame[] = [
  "clearSignalPulse",
  "relayCalibrationBurst",
  "corruptedTideCrack",
  "staticFieldShimmer",
  "cableArcStrike",
  "lighthouseBeamSweep",
  "skimmerJamSpark",
  "relayCompletionFlash",
  "safeLaneReveal",
  "extractionBeaconFlare",
  "signalShard",
  "bossTidePulse"
];

let signalCoastArtPromise: Promise<SignalCoastArtTextures> | null = null;
let signalCoastArtTextures: SignalCoastArtTextures | null = null;

export function getSignalCoastArtTextures(): SignalCoastArtTextures | null {
  return signalCoastArtTextures;
}

export function loadSignalCoastArt(): Promise<SignalCoastArtTextures> {
  signalCoastArtPromise ??= Promise.all([
    Assets.load<Texture>(signalAuthoredGroundUrl),
    Assets.load<Texture>(signalTerrainUrl),
    Assets.load<Texture>(signalPropsUrl),
    Assets.load<Texture>(staticSkimmersUrl),
    Assets.load<Texture>(lighthouseThatAnswersUrl),
    Assets.load<Texture>(signalHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, skimmerAtlas, lighthouseAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 2) * TERRAIN_FRAME_W, Math.floor(index / 2) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<SignalTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<SignalPropFrame, Texture>;
    const skimmers = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: skimmerAtlas.source,
          frame: new Rectangle(index * SKIMMER_FRAME_W, 0, SKIMMER_FRAME_W, SKIMMER_FRAME_H)
        })
    );
    const lighthouse = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: lighthouseAtlas.source,
          frame: new Rectangle(index * LIGHTHOUSE_FRAME_W, 0, LIGHTHOUSE_FRAME_W, LIGHTHOUSE_FRAME_H)
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
    ) as Record<SignalHazardVfxFrame, Texture>;
    signalCoastArtTextures = { authoredGround, terrain, props, skimmers, lighthouse, vfx };
    return signalCoastArtTextures;
  });
  return signalCoastArtPromise;
}
