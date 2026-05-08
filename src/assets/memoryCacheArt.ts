import { Assets, Rectangle, Texture } from "pixi.js";

import memoryCacheAuthoredGroundUrl from "../../assets/tiles/memory_cache/authored_ground.png";
import memoryCacheTerrainUrl from "../../assets/tiles/memory_cache/memory_cache_terrain_chunks_v1.png";
import memoryCachePropsUrl from "../../assets/props/memory_cache/memory_cache_props_objectives_v1.png";
import memoryCacheContextRotUrl from "../../assets/sprites/enemies/memory_cache_context_rot_sheet.png";
import memoryAnchorsUrl from "../../assets/sprites/enemies/memory_anchors_sheet.png";
import memoryCuratorUrl from "../../assets/sprites/bosses/memory_curator.png";
import memoryCacheHazardVfxUrl from "../../assets/sprites/effects/memory_cache_hazard_vfx_v1.png";

export const MEMORY_CACHE_ART_ASSET_ID = "memory_cache.production_source_v1";
export const MEMORY_CACHE_AUTHORED_GROUND_ORIGIN_X = 3584;
export const MEMORY_CACHE_AUTHORED_GROUND_ORIGIN_Y = 2048;

export type MemoryCacheTerrainFrame =
  | "archiveFloor"
  | "civicLedgerFloor"
  | "witnessChapelFloor"
  | "recallPocketFloor"
  | "corruptedArchiveLane"
  | "redactedShortcutFloor"
  | "curatorVaultFloor"
  | "extractionIndexFloor";

export type MemoryCachePropFrame =
  | "intakeEvidenceTerminal"
  | "civicLedgerStack"
  | "witnessShardCluster"
  | "safeRecallPad"
  | "redactionBarrier"
  | "curatorVaultObelisk"
  | "extractionIndexConsole"
  | "archiveShelf"
  | "brokenRecordCrate"
  | "memoryCrystal"
  | "redactionNode"
  | "routeMemoryObelisk";

export type MemoryCacheHazardVfxFrame =
  | "shardGlint"
  | "recoveryBurst"
  | "recallRing"
  | "corruptionStaticPool"
  | "redactionPulse"
  | "shortcutSpark"
  | "contextRotTrail"
  | "curatorLockRing"
  | "recordFlare"
  | "extractionBeam"
  | "warningCrack"
  | "routeRewardPulse";

export interface MemoryCacheArtTextures {
  authoredGround: Texture;
  terrain: Record<MemoryCacheTerrainFrame, Texture>;
  props: Record<MemoryCachePropFrame, Texture>;
  contextRot: Texture[];
  memoryAnchors: Texture[];
  curator: Texture[];
  vfx: Record<MemoryCacheHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 512;
const TERRAIN_FRAME_H = 320;
const PROP_FRAME_W = 256;
const PROP_FRAME_H = 240;
const CONTEXT_ROT_FRAME_W = 128;
const CONTEXT_ROT_FRAME_H = 112;
const MEMORY_ANCHOR_FRAME_W = 128;
const MEMORY_ANCHOR_FRAME_H = 128;
const CURATOR_FRAME_W = 320;
const CURATOR_FRAME_H = 288;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: MemoryCacheTerrainFrame[] = [
  "archiveFloor",
  "civicLedgerFloor",
  "witnessChapelFloor",
  "recallPocketFloor",
  "corruptedArchiveLane",
  "redactedShortcutFloor",
  "curatorVaultFloor",
  "extractionIndexFloor"
];

const PROP_FRAMES: MemoryCachePropFrame[] = [
  "intakeEvidenceTerminal",
  "civicLedgerStack",
  "witnessShardCluster",
  "safeRecallPad",
  "redactionBarrier",
  "curatorVaultObelisk",
  "extractionIndexConsole",
  "archiveShelf",
  "brokenRecordCrate",
  "memoryCrystal",
  "redactionNode",
  "routeMemoryObelisk"
];

const VFX_FRAMES: MemoryCacheHazardVfxFrame[] = [
  "shardGlint",
  "recoveryBurst",
  "recallRing",
  "corruptionStaticPool",
  "redactionPulse",
  "shortcutSpark",
  "contextRotTrail",
  "curatorLockRing",
  "recordFlare",
  "extractionBeam",
  "warningCrack",
  "routeRewardPulse"
];

let memoryCacheArtPromise: Promise<MemoryCacheArtTextures> | null = null;
let memoryCacheArtTextures: MemoryCacheArtTextures | null = null;

export function getMemoryCacheArtTextures(): MemoryCacheArtTextures | null {
  return memoryCacheArtTextures;
}

export function loadMemoryCacheArt(): Promise<MemoryCacheArtTextures> {
  memoryCacheArtPromise ??= Promise.all([
    Assets.load<Texture>(memoryCacheAuthoredGroundUrl),
    Assets.load<Texture>(memoryCacheTerrainUrl),
    Assets.load<Texture>(memoryCachePropsUrl),
    Assets.load<Texture>(memoryCacheContextRotUrl),
    Assets.load<Texture>(memoryAnchorsUrl),
    Assets.load<Texture>(memoryCuratorUrl),
    Assets.load<Texture>(memoryCacheHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, contextRotAtlas, memoryAnchorAtlas, curatorAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 4) * TERRAIN_FRAME_W, Math.floor(index / 4) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<MemoryCacheTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<MemoryCachePropFrame, Texture>;
    const contextRot = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: contextRotAtlas.source,
          frame: new Rectangle(index * CONTEXT_ROT_FRAME_W, 0, CONTEXT_ROT_FRAME_W, CONTEXT_ROT_FRAME_H)
        })
    );
    const memoryAnchors = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: memoryAnchorAtlas.source,
          frame: new Rectangle(index * MEMORY_ANCHOR_FRAME_W, 0, MEMORY_ANCHOR_FRAME_W, MEMORY_ANCHOR_FRAME_H)
        })
    );
    const curator = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: curatorAtlas.source,
          frame: new Rectangle(index * CURATOR_FRAME_W, 0, CURATOR_FRAME_W, CURATOR_FRAME_H)
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
    ) as Record<MemoryCacheHazardVfxFrame, Texture>;
    memoryCacheArtTextures = { authoredGround, terrain, props, contextRot, memoryAnchors, curator, vfx };
    return memoryCacheArtTextures;
  });
  return memoryCacheArtPromise;
}
