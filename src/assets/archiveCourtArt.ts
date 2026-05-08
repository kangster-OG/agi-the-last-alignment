import { Assets, Rectangle, Texture } from "pixi.js";

import archiveCourtAuthoredGroundUrl from "../../assets/tiles/archive_court/authored_ground.png";
import archiveCourtTerrainUrl from "../../assets/tiles/archive_court/archive_court_terrain_chunks_v1.png";
import archiveCourtPropsUrl from "../../assets/props/archive_court/archive_court_props_objectives_v1.png";
import redactionAngelsUrl from "../../assets/sprites/enemies/redaction_angels_sheet.png";
import injunctionWritsUrl from "../../assets/sprites/enemies/injunction_writs_sheet.png";
import redactorSaintUrl from "../../assets/sprites/bosses/redactor_saint.png";
import archiveCourtHazardVfxUrl from "../../assets/sprites/effects/archive_court_hazard_vfx_v1.png";

export const ARCHIVE_COURT_ART_ASSET_ID = "archive_court.production_source_v1";
export const ARCHIVE_COURT_AUTHORED_GROUND_ORIGIN_X = 3584;
export const ARCHIVE_COURT_AUTHORED_GROUND_ORIGIN_Y = 2048;

export type ArchiveCourtTerrainFrame =
  | "courtFloor"
  | "witnessIndexFloor"
  | "redactionStackFloor"
  | "appealSealFloor"
  | "injunctionDocketFloor"
  | "redactorBenchFloor"
  | "courtWritGateFloor"
  | "redactionLane";

export type ArchiveCourtPropFrame =
  | "witnessIndexTerminal"
  | "redactionStackShelves"
  | "appealSealDais"
  | "injunctionDocketRail"
  | "redactorSaintBench"
  | "courtWritGate"
  | "evidenceLantern"
  | "sealedEvidenceWrit"
  | "archiveDrawerCluster"
  | "writTabletCyan"
  | "redactionShelf"
  | "safeRouteMarker";

export type ArchiveCourtHazardVfxFrame =
  | "redactionSlash"
  | "redactionBurn"
  | "appealWindowRing"
  | "evidenceGlow"
  | "courtSeal"
  | "writExtraction"
  | "writStormA"
  | "writStormB"
  | "redProjectile"
  | "cyanProjectile"
  | "violetProjectile"
  | "amberProjectile";

export interface ArchiveCourtArtTextures {
  authoredGround: Texture;
  terrain: Record<ArchiveCourtTerrainFrame, Texture>;
  props: Record<ArchiveCourtPropFrame, Texture>;
  redactionAngels: Texture[];
  injunctionWrits: Texture[];
  redactorSaint: Texture[];
  vfx: Record<ArchiveCourtHazardVfxFrame, Texture>;
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

const TERRAIN_FRAMES: ArchiveCourtTerrainFrame[] = [
  "courtFloor",
  "witnessIndexFloor",
  "redactionStackFloor",
  "appealSealFloor",
  "injunctionDocketFloor",
  "redactorBenchFloor",
  "courtWritGateFloor",
  "redactionLane"
];

const PROP_FRAMES: ArchiveCourtPropFrame[] = [
  "witnessIndexTerminal",
  "redactionStackShelves",
  "appealSealDais",
  "injunctionDocketRail",
  "redactorSaintBench",
  "courtWritGate",
  "evidenceLantern",
  "sealedEvidenceWrit",
  "archiveDrawerCluster",
  "writTabletCyan",
  "redactionShelf",
  "safeRouteMarker"
];

const VFX_FRAMES: ArchiveCourtHazardVfxFrame[] = [
  "redactionSlash",
  "redactionBurn",
  "appealWindowRing",
  "evidenceGlow",
  "courtSeal",
  "writExtraction",
  "writStormA",
  "writStormB",
  "redProjectile",
  "cyanProjectile",
  "violetProjectile",
  "amberProjectile"
];

let archiveCourtArtPromise: Promise<ArchiveCourtArtTextures> | null = null;
let archiveCourtArtTextures: ArchiveCourtArtTextures | null = null;

export function getArchiveCourtArtTextures(): ArchiveCourtArtTextures | null {
  return archiveCourtArtTextures;
}

export function loadArchiveCourtArt(): Promise<ArchiveCourtArtTextures> {
  archiveCourtArtPromise ??= Promise.all([
    Assets.load<Texture>(archiveCourtAuthoredGroundUrl),
    Assets.load<Texture>(archiveCourtTerrainUrl),
    Assets.load<Texture>(archiveCourtPropsUrl),
    Assets.load<Texture>(redactionAngelsUrl),
    Assets.load<Texture>(injunctionWritsUrl),
    Assets.load<Texture>(redactorSaintUrl),
    Assets.load<Texture>(archiveCourtHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, redactionAtlas, writAtlas, saintAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 4) * TERRAIN_FRAME_W, Math.floor(index / 4) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<ArchiveCourtTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<ArchiveCourtPropFrame, Texture>;
    const redactionAngels = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: redactionAtlas.source,
          frame: new Rectangle(index * ENEMY_FRAME_W, 0, ENEMY_FRAME_W, ENEMY_FRAME_H)
        })
    );
    const injunctionWrits = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: writAtlas.source,
          frame: new Rectangle(index * ENEMY_FRAME_W, 0, ENEMY_FRAME_W, ENEMY_FRAME_H)
        })
    );
    const redactorSaint = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: saintAtlas.source,
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
    ) as Record<ArchiveCourtHazardVfxFrame, Texture>;
    archiveCourtArtTextures = { authoredGround, terrain, props, redactionAngels, injunctionWrits, redactorSaint, vfx };
    return archiveCourtArtTextures;
  });
  return archiveCourtArtPromise;
}
