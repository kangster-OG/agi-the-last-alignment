import { Assets, Rectangle, Texture } from "pixi.js";

import verdictSpireLandmarksUrl from "../../assets/props/online_route/verdict_spire_landmarks_v1.png";

export const MILESTONE26_ASSET_IDS = {
  verdictSpireLandmarks: "prop.online_route.verdict_spire_landmarks_v1"
} as const;

export const MILESTONE26_ASSET_URLS = {
  verdictSpireLandmarks: verdictSpireLandmarksUrl
} as const;

export type Milestone26VerdictLandmarkId = "verdict_spire" | "verdict_seal" | "appeal_gate" | "injunction_engine";

export interface Milestone26VerdictArtTextures {
  verdictLandmarks: Record<Milestone26VerdictLandmarkId, Texture>;
}

const FRAME_WIDTH = 96;
const FRAME_HEIGHT = 96;
const FRAME_IDS: Milestone26VerdictLandmarkId[] = ["verdict_spire", "verdict_seal", "appeal_gate", "injunction_engine"];

let milestone26Promise: Promise<Milestone26VerdictArtTextures> | null = null;
let milestone26Textures: Milestone26VerdictArtTextures | null = null;

export function getMilestone26VerdictArtTextures(): Milestone26VerdictArtTextures | null {
  return milestone26Textures;
}

export function loadMilestone26VerdictArt(): Promise<Milestone26VerdictArtTextures> {
  milestone26Promise ??= Assets.load<Texture>(MILESTONE26_ASSET_URLS.verdictSpireLandmarks).then((atlas) => {
    milestone26Textures = {
      verdictLandmarks: Object.fromEntries(
        FRAME_IDS.map((id, index) => [
          id,
          new Texture({
            source: atlas.source,
            frame: new Rectangle(index * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT)
          })
        ])
      ) as Record<Milestone26VerdictLandmarkId, Texture>
    };
    return milestone26Textures;
  });
  return milestone26Promise;
}
