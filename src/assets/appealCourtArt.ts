import { Assets, Rectangle, Texture } from "pixi.js";

import appealCourtAuthoredGroundUrl from "../../assets/tiles/appeal_court/authored_ground.png";
import appealCourtTerrainUrl from "../../assets/tiles/appeal_court/appeal_court_terrain_chunks_v1.png";
import appealCourtPropsUrl from "../../assets/props/appeal_court/appeal_court_props_objectives_v1.png";
import verdictClerksUrl from "../../assets/sprites/enemies/verdict_clerks_sheet.png";
import appealInjunctionWritsUrl from "../../assets/sprites/enemies/appeal_injunction_writs_sheet.png";
import injunctionEngineUrl from "../../assets/sprites/bosses/injunction_engine.png";
import appealCourtHazardVfxUrl from "../../assets/sprites/effects/appeal_court_hazard_vfx_v1.png";

export const APPEAL_COURT_ART_ASSET_ID = "appeal_court.production_source_v1";
export const APPEAL_COURT_AUTHORED_GROUND_ORIGIN_X = 3584;
export const APPEAL_COURT_AUTHORED_GROUND_ORIGIN_Y = 2048;

export type AppealCourtTerrainFrame =
  | "publicRecordFloor"
  | "openingArgumentFloor"
  | "witnessExhibitFloor"
  | "crossExamFloor"
  | "publicRulingSealFloor"
  | "injunctionEngineFloor"
  | "publicRulingGateFloor"
  | "verdictLane";

export type AppealCourtPropFrame =
  | "openingArgumentPodium"
  | "witnessExhibitTable"
  | "crossExamBench"
  | "publicRulingSeal"
  | "injunctionEngineDais"
  | "publicRulingGate"
  | "publicRecordLantern"
  | "sealedAppealBrief"
  | "verdictPylon"
  | "writTabletViolet"
  | "rulingWitnessBench"
  | "safeRouteMarker";

export type AppealCourtHazardVfxFrame =
  | "publicRecordRing"
  | "verdictBeam"
  | "objectionWindowRing"
  | "briefGlow"
  | "rulingSeal"
  | "rulingExtraction"
  | "injunctionRingA"
  | "injunctionRingB"
  | "amberProjectile"
  | "cyanProjectile"
  | "violetProjectile"
  | "shardRewardBurst";

export interface AppealCourtArtTextures {
  authoredGround: Texture;
  terrain: Record<AppealCourtTerrainFrame, Texture>;
  props: Record<AppealCourtPropFrame, Texture>;
  verdictClerks: Texture[];
  injunctionWrits: Texture[];
  injunctionEngine: Texture[];
  vfx: Record<AppealCourtHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 512;
const TERRAIN_FRAME_H = 320;
const PROP_FRAME_W = 256;
const PROP_FRAME_H = 240;
const ENEMY_FRAME_W = 128;
const ENEMY_FRAME_H = 112;
const BOSS_FRAME_W = 320;
const BOSS_FRAME_H = 320;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: AppealCourtTerrainFrame[] = [
  "publicRecordFloor",
  "openingArgumentFloor",
  "witnessExhibitFloor",
  "crossExamFloor",
  "publicRulingSealFloor",
  "injunctionEngineFloor",
  "publicRulingGateFloor",
  "verdictLane"
];

const PROP_FRAMES: AppealCourtPropFrame[] = [
  "openingArgumentPodium",
  "witnessExhibitTable",
  "crossExamBench",
  "publicRulingSeal",
  "injunctionEngineDais",
  "publicRulingGate",
  "publicRecordLantern",
  "sealedAppealBrief",
  "verdictPylon",
  "writTabletViolet",
  "rulingWitnessBench",
  "safeRouteMarker"
];

const VFX_FRAMES: AppealCourtHazardVfxFrame[] = [
  "publicRecordRing",
  "verdictBeam",
  "objectionWindowRing",
  "briefGlow",
  "rulingSeal",
  "rulingExtraction",
  "injunctionRingA",
  "injunctionRingB",
  "amberProjectile",
  "cyanProjectile",
  "violetProjectile",
  "shardRewardBurst"
];

let appealCourtArtPromise: Promise<AppealCourtArtTextures> | null = null;
let appealCourtArtTextures: AppealCourtArtTextures | null = null;

export function getAppealCourtArtTextures(): AppealCourtArtTextures | null {
  return appealCourtArtTextures;
}

export function loadAppealCourtArt(): Promise<AppealCourtArtTextures> {
  appealCourtArtPromise ??= Promise.all([
    Assets.load<Texture>(appealCourtAuthoredGroundUrl),
    Assets.load<Texture>(appealCourtTerrainUrl),
    Assets.load<Texture>(appealCourtPropsUrl),
    Assets.load<Texture>(verdictClerksUrl),
    Assets.load<Texture>(appealInjunctionWritsUrl),
    Assets.load<Texture>(injunctionEngineUrl),
    Assets.load<Texture>(appealCourtHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, clerksAtlas, writsAtlas, engineAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 4) * TERRAIN_FRAME_W, Math.floor(index / 4) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<AppealCourtTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<AppealCourtPropFrame, Texture>;
    const verdictClerks = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: clerksAtlas.source,
          frame: new Rectangle(index * ENEMY_FRAME_W, 0, ENEMY_FRAME_W, ENEMY_FRAME_H)
        })
    );
    const injunctionWrits = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: writsAtlas.source,
          frame: new Rectangle(index * ENEMY_FRAME_W, 0, ENEMY_FRAME_W, ENEMY_FRAME_H)
        })
    );
    const injunctionEngine = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: engineAtlas.source,
          frame: new Rectangle(index * BOSS_FRAME_W, 0, BOSS_FRAME_W, BOSS_FRAME_H)
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
    ) as Record<AppealCourtHazardVfxFrame, Texture>;
    appealCourtArtTextures = { authoredGround, terrain, props, verdictClerks, injunctionWrits, injunctionEngine, vfx };
    return appealCourtArtTextures;
  });
  return appealCourtArtPromise;
}
