import { Assets, Rectangle, Texture } from "pixi.js";

import guardrailAuthoredGroundUrl from "../../assets/tiles/guardrail_forge/authored_ground.png";
import guardrailTerrainUrl from "../../assets/tiles/guardrail_forge/guardrail_forge_terrain_chunks_v1.png";
import guardrailPropsUrl from "../../assets/props/guardrail_forge/guardrail_forge_props_objectives_v1.png";
import doctrineAuditorsUrl from "../../assets/sprites/enemies/doctrine_auditors_sheet.png";
import doctrineAuditorUrl from "../../assets/sprites/bosses/doctrine_auditor.png";
import guardrailHazardVfxUrl from "../../assets/sprites/effects/guardrail_forge_hazard_vfx_v1.png";

export const GUARDRAIL_FORGE_ART_ASSET_ID = "guardrail_forge.production_source_v1";
export const GUARDRAIL_FORGE_AUTHORED_GROUND_ORIGIN_X = 3584;
export const GUARDRAIL_FORGE_AUTHORED_GROUND_ORIGIN_Y = 2048;

export type GuardrailTerrainFrame =
  | "alloyHoldPlate"
  | "constitutionalClampFloor"
  | "silkgridLoomFloor"
  | "overloadSluiceLane"
  | "auditPressFloor"
  | "quenchGateFloor"
  | "serverFoundryCatwalk"
  | "crackedCivicTiles";

export type GuardrailPropFrame =
  | "alloyTemperRelay"
  | "constitutionalClamp"
  | "silkgridLoom"
  | "overloadSluice"
  | "auditPressThrone"
  | "relayJammer"
  | "doctrinePressPylon"
  | "quenchGate"
  | "safetyBollard"
  | "signalCrate"
  | "shardCondenser"
  | "extractionConsole";

export type GuardrailHazardVfxFrame =
  | "safeHoldRing"
  | "calibrationSpark"
  | "overloadLane"
  | "doctrineJamPulse"
  | "auditPressLock"
  | "relayCompleteFlare"
  | "quenchBeam"
  | "shardRewardBurst"
  | "counterproofCrackle"
  | "warningSweep"
  | "projectileSpark"
  | "bossPressureBurst";

export interface GuardrailForgeArtTextures {
  authoredGround: Texture;
  terrain: Record<GuardrailTerrainFrame, Texture>;
  props: Record<GuardrailPropFrame, Texture>;
  doctrineAuditors: Texture[];
  doctrineAuditor: Texture[];
  vfx: Record<GuardrailHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 512;
const TERRAIN_FRAME_H = 320;
const PROP_FRAME_W = 256;
const PROP_FRAME_H = 240;
const DOCTRINE_AUDITOR_FRAME_W = 128;
const DOCTRINE_AUDITOR_FRAME_H = 112;
const BOSS_FRAME_W = 320;
const BOSS_FRAME_H = 288;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: GuardrailTerrainFrame[] = [
  "alloyHoldPlate",
  "constitutionalClampFloor",
  "silkgridLoomFloor",
  "overloadSluiceLane",
  "auditPressFloor",
  "quenchGateFloor",
  "serverFoundryCatwalk",
  "crackedCivicTiles"
];

const PROP_FRAMES: GuardrailPropFrame[] = [
  "alloyTemperRelay",
  "constitutionalClamp",
  "silkgridLoom",
  "overloadSluice",
  "auditPressThrone",
  "relayJammer",
  "doctrinePressPylon",
  "quenchGate",
  "safetyBollard",
  "signalCrate",
  "shardCondenser",
  "extractionConsole"
];

const VFX_FRAMES: GuardrailHazardVfxFrame[] = [
  "safeHoldRing",
  "calibrationSpark",
  "overloadLane",
  "doctrineJamPulse",
  "auditPressLock",
  "relayCompleteFlare",
  "quenchBeam",
  "shardRewardBurst",
  "counterproofCrackle",
  "warningSweep",
  "projectileSpark",
  "bossPressureBurst"
];

let guardrailForgeArtPromise: Promise<GuardrailForgeArtTextures> | null = null;
let guardrailForgeArtTextures: GuardrailForgeArtTextures | null = null;

export function getGuardrailForgeArtTextures(): GuardrailForgeArtTextures | null {
  return guardrailForgeArtTextures;
}

export function loadGuardrailForgeArt(): Promise<GuardrailForgeArtTextures> {
  guardrailForgeArtPromise ??= Promise.all([
    Assets.load<Texture>(guardrailAuthoredGroundUrl),
    Assets.load<Texture>(guardrailTerrainUrl),
    Assets.load<Texture>(guardrailPropsUrl),
    Assets.load<Texture>(doctrineAuditorsUrl),
    Assets.load<Texture>(doctrineAuditorUrl),
    Assets.load<Texture>(guardrailHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, doctrineAuditorsAtlas, doctrineAuditorAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 4) * TERRAIN_FRAME_W, Math.floor(index / 4) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<GuardrailTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<GuardrailPropFrame, Texture>;
    const doctrineAuditors = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: doctrineAuditorsAtlas.source,
          frame: new Rectangle(index * DOCTRINE_AUDITOR_FRAME_W, 0, DOCTRINE_AUDITOR_FRAME_W, DOCTRINE_AUDITOR_FRAME_H)
        })
    );
    const doctrineAuditor = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: doctrineAuditorAtlas.source,
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
    ) as Record<GuardrailHazardVfxFrame, Texture>;
    guardrailForgeArtTextures = { authoredGround, terrain, props, doctrineAuditors, doctrineAuditor, vfx };
    return guardrailForgeArtTextures;
  });
  return guardrailForgeArtPromise;
}
