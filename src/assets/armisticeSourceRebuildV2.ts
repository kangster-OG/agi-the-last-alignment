import { Assets, Rectangle, Texture } from "pixi.js";

import propGroundingDecalsUrl from "../../assets/tiles/armistice_plaza/prop_grounding_decals_v2.png";
import oathEaterEventDecalsUrl from "../../assets/sprites/effects/oath_eater_event_decals_v2.png";

export const ARMISTICE_SOURCE_REBUILD_V2_ASSET_IDS = {
  propGroundingDecals: "tile.armistice_plaza.prop_grounding_decals_v2",
  oathEaterEventDecals: "effect.oath_eater.event_decals_v2"
} as const;

export const ARMISTICE_SOURCE_REBUILD_V2_ASSET_URLS = {
  propGroundingDecals: propGroundingDecalsUrl,
  oathEaterEventDecals: oathEaterEventDecalsUrl
} as const;

export type ArmisticePropGroundingKey = "droneWreck" | "barricade" | "treatyMonument" | "terminal" | "breach" | "smallHalo";

export type OathEaterEventDecalKey =
  | "corruptionPool"
  | "brokenPromiseRing"
  | "treatyChargeLane"
  | "oathParticles"
  | "moodWash"
  | "breachTendril"
  | "impactBurst"
  | "warningPulse";

export interface ArmisticeSourceRebuildV2Textures {
  propGrounding: Record<ArmisticePropGroundingKey, Texture>;
  oathEvent: Record<OathEaterEventDecalKey, Texture>;
}

const PROP_GROUNDING_FRAME_WIDTH = 256;
const PROP_GROUNDING_FRAME_HEIGHT = 160;
const PROP_GROUNDING_KEYS: ArmisticePropGroundingKey[] = ["droneWreck", "barricade", "treatyMonument", "terminal", "breach", "smallHalo"];

const OATH_EVENT_FRAME_WIDTH = 256;
const OATH_EVENT_FRAME_HEIGHT = 160;
const OATH_EVENT_KEYS: OathEaterEventDecalKey[] = [
  "corruptionPool",
  "brokenPromiseRing",
  "treatyChargeLane",
  "oathParticles",
  "moodWash",
  "breachTendril",
  "impactBurst",
  "warningPulse"
];

let sourceRebuildPromise: Promise<ArmisticeSourceRebuildV2Textures> | null = null;
let sourceRebuildTextures: ArmisticeSourceRebuildV2Textures | null = null;

export function getArmisticeSourceRebuildV2Textures(): ArmisticeSourceRebuildV2Textures | null {
  return sourceRebuildTextures;
}

export function loadArmisticeSourceRebuildV2(): Promise<ArmisticeSourceRebuildV2Textures> {
  sourceRebuildPromise ??= Promise.all([
    Assets.load<Texture>(ARMISTICE_SOURCE_REBUILD_V2_ASSET_URLS.propGroundingDecals),
    Assets.load<Texture>(ARMISTICE_SOURCE_REBUILD_V2_ASSET_URLS.oathEaterEventDecals)
  ]).then(([propGroundingAtlas, oathEventAtlas]) => {
    sourceRebuildTextures = {
      propGrounding: sliceAtlas(propGroundingAtlas, PROP_GROUNDING_KEYS, PROP_GROUNDING_FRAME_WIDTH, PROP_GROUNDING_FRAME_HEIGHT, 3),
      oathEvent: sliceAtlas(oathEventAtlas, OATH_EVENT_KEYS, OATH_EVENT_FRAME_WIDTH, OATH_EVENT_FRAME_HEIGHT, 4)
    };
    return sourceRebuildTextures;
  });
  return sourceRebuildPromise;
}

function sliceAtlas<Key extends string>(atlas: Texture, keys: readonly Key[], frameWidth: number, frameHeight: number, columns: number): Record<Key, Texture> {
  return Object.fromEntries(
    keys.map((key, index) => [
      key,
      new Texture({
        source: atlas.source,
        frame: new Rectangle((index % columns) * frameWidth, Math.floor(index / columns) * frameHeight, frameWidth, frameHeight)
      })
    ])
  ) as Record<Key, Texture>;
}
