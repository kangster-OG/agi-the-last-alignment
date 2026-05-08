import { Assets, Rectangle, Texture } from "pixi.js";

import glassSunfieldAuthoredGroundUrl from "../../assets/tiles/glass_sunfield/authored_ground.png";
import glassSunfieldTerrainUrl from "../../assets/tiles/glass_sunfield/glass_sunfield_terrain_chunks_v1.png";
import glassSunfieldPropsUrl from "../../assets/props/glass_sunfield/glass_sunfield_props_objectives_v1.png";
import solarReflectionsUrl from "../../assets/sprites/enemies/solar_reflections_sheet.png";
import choirglassUrl from "../../assets/sprites/enemies/choirglass_sheet.png";
import wrongSunriseUrl from "../../assets/sprites/bosses/wrong_sunrise.png";
import glassSunfieldHazardVfxUrl from "../../assets/sprites/effects/glass_sunfield_hazard_vfx_v1.png";

export const GLASS_SUNFIELD_ART_ASSET_ID = "glass_sunfield.production_source_v1";
export const GLASS_SUNFIELD_AUTHORED_GROUND_ORIGIN_X = 3584;
export const GLASS_SUNFIELD_AUTHORED_GROUND_ORIGIN_Y = 2048;

export type GlassSunfieldTerrainFrame =
  | "blackGlassFloor"
  | "shadeLensFloor"
  | "exposedGlassLane"
  | "mistralPrismFloor"
  | "mirrorFloor"
  | "wrongSunriseFloor"
  | "prismGateFloor"
  | "maintenanceCatwalk";

export type GlassSunfieldPropFrame =
  | "westernShadeLens"
  | "mistralWindLens"
  | "deepmindMirrorLens"
  | "wrongSunriseLens"
  | "prismSwitchbackReflector"
  | "shadeRibCanopy"
  | "prismGateLanterns"
  | "extractionPrismConsole"
  | "serverShardBollard"
  | "brokenMirrorRack"
  | "shardCondenser"
  | "safeRouteMarker";

export type GlassSunfieldHazardVfxFrame =
  | "shadePocketRing"
  | "prismWindowFlare"
  | "exposedGlassBurn"
  | "reflectionJamPulse"
  | "lensCompleteBurst"
  | "prismExtractionBeam"
  | "shardRewardBurst"
  | "wrongSunriseBeam"
  | "solarProjectileShard"
  | "choirglassImpact"
  | "warningShimmer"
  | "bossCollapseFragments";

export interface GlassSunfieldArtTextures {
  authoredGround: Texture;
  terrain: Record<GlassSunfieldTerrainFrame, Texture>;
  props: Record<GlassSunfieldPropFrame, Texture>;
  solarReflections: Texture[];
  choirglass: Texture[];
  wrongSunrise: Texture[];
  vfx: Record<GlassSunfieldHazardVfxFrame, Texture>;
}

const TERRAIN_FRAME_W = 512;
const TERRAIN_FRAME_H = 320;
const PROP_FRAME_W = 256;
const PROP_FRAME_H = 240;
const SOLAR_FRAME_W = 128;
const SOLAR_FRAME_H = 112;
const CHOIR_FRAME_W = 128;
const CHOIR_FRAME_H = 112;
const BOSS_FRAME_W = 320;
const BOSS_FRAME_H = 320;
const VFX_FRAME_W = 192;
const VFX_FRAME_H = 160;

const TERRAIN_FRAMES: GlassSunfieldTerrainFrame[] = [
  "blackGlassFloor",
  "shadeLensFloor",
  "exposedGlassLane",
  "mistralPrismFloor",
  "mirrorFloor",
  "wrongSunriseFloor",
  "prismGateFloor",
  "maintenanceCatwalk"
];

const PROP_FRAMES: GlassSunfieldPropFrame[] = [
  "westernShadeLens",
  "mistralWindLens",
  "deepmindMirrorLens",
  "wrongSunriseLens",
  "prismSwitchbackReflector",
  "shadeRibCanopy",
  "prismGateLanterns",
  "extractionPrismConsole",
  "serverShardBollard",
  "brokenMirrorRack",
  "shardCondenser",
  "safeRouteMarker"
];

const VFX_FRAMES: GlassSunfieldHazardVfxFrame[] = [
  "shadePocketRing",
  "prismWindowFlare",
  "exposedGlassBurn",
  "reflectionJamPulse",
  "lensCompleteBurst",
  "prismExtractionBeam",
  "shardRewardBurst",
  "wrongSunriseBeam",
  "solarProjectileShard",
  "choirglassImpact",
  "warningShimmer",
  "bossCollapseFragments"
];

let glassSunfieldArtPromise: Promise<GlassSunfieldArtTextures> | null = null;
let glassSunfieldArtTextures: GlassSunfieldArtTextures | null = null;

export function getGlassSunfieldArtTextures(): GlassSunfieldArtTextures | null {
  return glassSunfieldArtTextures;
}

export function loadGlassSunfieldArt(): Promise<GlassSunfieldArtTextures> {
  glassSunfieldArtPromise ??= Promise.all([
    Assets.load<Texture>(glassSunfieldAuthoredGroundUrl),
    Assets.load<Texture>(glassSunfieldTerrainUrl),
    Assets.load<Texture>(glassSunfieldPropsUrl),
    Assets.load<Texture>(solarReflectionsUrl),
    Assets.load<Texture>(choirglassUrl),
    Assets.load<Texture>(wrongSunriseUrl),
    Assets.load<Texture>(glassSunfieldHazardVfxUrl)
  ]).then(([authoredGround, terrainAtlas, propAtlas, solarAtlas, choirAtlas, wrongSunriseAtlas, vfxAtlas]) => {
    const terrain = Object.fromEntries(
      TERRAIN_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: terrainAtlas.source,
          frame: new Rectangle((index % 4) * TERRAIN_FRAME_W, Math.floor(index / 4) * TERRAIN_FRAME_H, TERRAIN_FRAME_W, TERRAIN_FRAME_H)
        })
      ])
    ) as Record<GlassSunfieldTerrainFrame, Texture>;
    const props = Object.fromEntries(
      PROP_FRAMES.map((name, index) => [
        name,
        new Texture({
          source: propAtlas.source,
          frame: new Rectangle((index % 4) * PROP_FRAME_W, Math.floor(index / 4) * PROP_FRAME_H, PROP_FRAME_W, PROP_FRAME_H)
        })
      ])
    ) as Record<GlassSunfieldPropFrame, Texture>;
    const solarReflections = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: solarAtlas.source,
          frame: new Rectangle(index * SOLAR_FRAME_W, 0, SOLAR_FRAME_W, SOLAR_FRAME_H)
        })
    );
    const choirglass = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: choirAtlas.source,
          frame: new Rectangle(index * CHOIR_FRAME_W, 0, CHOIR_FRAME_W, CHOIR_FRAME_H)
        })
    );
    const wrongSunrise = Array.from(
      { length: 4 },
      (_, index) =>
        new Texture({
          source: wrongSunriseAtlas.source,
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
    ) as Record<GlassSunfieldHazardVfxFrame, Texture>;
    glassSunfieldArtTextures = { authoredGround, terrain, props, solarReflections, choirglass, wrongSunrise, vfx };
    return glassSunfieldArtTextures;
  });
  return glassSunfieldArtPromise;
}
