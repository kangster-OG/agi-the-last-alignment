import { Assets, Rectangle, Texture } from "pixi.js";

import alignmentSpireAuthoredGroundUrl from "../../assets/tiles/alignment_spire/authored_ground.png";
import alignmentSpireTerrainUrl from "../../assets/tiles/alignment_spire/alignment_spire_terrain_chunks_v1.png";
import alignmentSpirePropsUrl from "../../assets/props/alignment_spire/alignment_spire_props_objectives_v1.png";
import predictionGhostsUrl from "../../assets/sprites/enemies/prediction_ghosts_sheet.png";
import previousBossEchoesUrl from "../../assets/sprites/enemies/previous_boss_echoes_sheet.png";
import alienGodIntelligenceUrl from "../../assets/sprites/bosses/alien_god_intelligence.png";
import alignmentSpireHazardVfxUrl from "../../assets/sprites/effects/alignment_spire_hazard_vfx_v1.png";

export const ALIGNMENT_SPIRE_ART_ASSET_ID = "alignment_spire_finale.production_source_v1";
export const ALIGNMENT_SPIRE_AUTHORED_GROUND_ORIGIN_X = 3584;
export const ALIGNMENT_SPIRE_AUTHORED_GROUND_ORIGIN_Y = 2048;

export type AlignmentSpireTerrainFrame =
  | "campSanctumFloor"
  | "brokenRouteFloor"
  | "agiCompletionFloor"
  | "publicCausewayFloor"
  | "routeMouthRingFloor"
  | "outerAlignmentGateFloor"
  | "northEchoFloor"
  | "pixellabProofRingFloor";

export type AlignmentSpirePropFrame =
  | "campRemnantCanopy"
  | "memoryRouteMouthLarge"
  | "pixellabProofRingGate"
  | "rulingCausewayClamp"
  | "evidencePylon"
  | "guardrailProofObelisk"
  | "bossEchoConsole"
  | "alignmentSpireNeedle"
  | "memoryMouthPortal"
  | "completionMouthPortal"
  | "pixellabPredictionOrbs"
  | "outerAlignmentSpire";

export type AlignmentSpireHazardVfxFrame =
  | "pixellabProofSeal"
  | "consensusRing"
  | "predictionSlash"
  | "predictionCrack"
  | "pixellabPredictionOrbs"
  | "predictionSpiral"
  | "bossEchoRing"
  | "extractionBeamGate"
  | "cyanProofBurst"
  | "amberProofBurst"
  | "violetAlignmentBeam"
  | "completionStarburst";

export interface AlignmentSpireFinaleArtTextures {
  authoredGround: Texture;
  terrain: Record<AlignmentSpireTerrainFrame, Texture>;
  props: Record<AlignmentSpirePropFrame, Texture>;
  predictionGhosts: Texture[];
  previousBossEchoes: Texture[];
  alienGodIntelligence: Texture[];
  vfx: Record<AlignmentSpireHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 512;
const TERRAIN_FRAME_H = 320;
const PROP_FRAME_W = 256;
const PROP_FRAME_H = 240;
const ENEMY_FRAME_W = 128;
const ENEMY_FRAME_H = 112;
const BOSS_FRAME_W = 384;
const BOSS_FRAME_H = 384;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: AlignmentSpireTerrainFrame[] = [
  "campSanctumFloor",
  "brokenRouteFloor",
  "agiCompletionFloor",
  "publicCausewayFloor",
  "routeMouthRingFloor",
  "outerAlignmentGateFloor",
  "northEchoFloor",
  "pixellabProofRingFloor"
];

const PROP_FRAMES: AlignmentSpirePropFrame[] = [
  "campRemnantCanopy",
  "memoryRouteMouthLarge",
  "pixellabProofRingGate",
  "rulingCausewayClamp",
  "evidencePylon",
  "guardrailProofObelisk",
  "bossEchoConsole",
  "alignmentSpireNeedle",
  "memoryMouthPortal",
  "completionMouthPortal",
  "pixellabPredictionOrbs",
  "outerAlignmentSpire"
];

const VFX_FRAMES: AlignmentSpireHazardVfxFrame[] = [
  "pixellabProofSeal",
  "consensusRing",
  "predictionSlash",
  "predictionCrack",
  "pixellabPredictionOrbs",
  "predictionSpiral",
  "bossEchoRing",
  "extractionBeamGate",
  "cyanProofBurst",
  "amberProofBurst",
  "violetAlignmentBeam",
  "completionStarburst"
];

let alignmentSpireArtPromise: Promise<AlignmentSpireFinaleArtTextures> | null = null;
let alignmentSpireArtTextures: AlignmentSpireFinaleArtTextures | null = null;

export function getAlignmentSpireFinaleArtTextures(): AlignmentSpireFinaleArtTextures | null {
  return alignmentSpireArtTextures;
}

export function loadAlignmentSpireFinaleArt(): Promise<AlignmentSpireFinaleArtTextures> {
  alignmentSpireArtPromise ??= Promise.all([
    Assets.load<Texture>(alignmentSpireAuthoredGroundUrl),
    Assets.load<Texture>(alignmentSpireTerrainUrl),
    Assets.load<Texture>(alignmentSpirePropsUrl),
    Assets.load<Texture>(predictionGhostsUrl),
    Assets.load<Texture>(previousBossEchoesUrl),
    Assets.load<Texture>(alienGodIntelligenceUrl),
    Assets.load<Texture>(alignmentSpireHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, ghostsAtlas, echoesAtlas, bossAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 4) * TERRAIN_FRAME_W, Math.floor(index / 4) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<AlignmentSpireTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<AlignmentSpirePropFrame, Texture>;
    const predictionGhosts = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: ghostsAtlas.source,
          frame: new Rectangle(index * ENEMY_FRAME_W, 0, ENEMY_FRAME_W, ENEMY_FRAME_H)
        })
    );
    const previousBossEchoes = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: echoesAtlas.source,
          frame: new Rectangle(index * ENEMY_FRAME_W, 0, ENEMY_FRAME_W, ENEMY_FRAME_H)
        })
    );
    const alienGodIntelligence = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: bossAtlas.source,
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
    ) as Record<AlignmentSpireHazardVfxFrame, Texture>;
    alignmentSpireArtTextures = { authoredGround, terrain, props, predictionGhosts, previousBossEchoes, alienGodIntelligence, vfx };
    return alignmentSpireArtTextures;
  });
  return alignmentSpireArtPromise;
}
