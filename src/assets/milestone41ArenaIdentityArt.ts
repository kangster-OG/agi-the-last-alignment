import { Assets, Rectangle, Texture } from "pixi.js";

import campaignArenaIdentityUrl from "../../assets/props/online_route/campaign_arena_identity_v1.png";
import { isRuntimeReadyAsset } from "./manifest";

export const MILESTONE41_ASSET_IDS = {
  campaignArenaIdentity: "prop.online_route.campaign_arena_identity_v1"
} as const;

export const MILESTONE41_ASSET_URLS = {
  campaignArenaIdentity: campaignArenaIdentityUrl
} as const;

export type Milestone41ArenaIdentityFrame =
  | "model_war_memorial"
  | "thermal_archive"
  | "guardrail_forge"
  | "false_schedule_yard"
  | "appeal_court_ruins"
  | "alignment_spire_finale";

export interface Milestone41ArenaIdentityArtTextures {
  campaignArenaIdentity: Record<Milestone41ArenaIdentityFrame, Texture>;
}

const FRAME_WIDTH = 96;
const FRAME_HEIGHT = 96;
const FRAME_IDS: Milestone41ArenaIdentityFrame[] = [
  "model_war_memorial",
  "thermal_archive",
  "guardrail_forge",
  "false_schedule_yard",
  "appeal_court_ruins",
  "alignment_spire_finale"
];

let milestone41Promise: Promise<Milestone41ArenaIdentityArtTextures | null> | null = null;
let milestone41Textures: Milestone41ArenaIdentityArtTextures | null = null;

export function getMilestone41ArenaIdentityArtTextures(): Milestone41ArenaIdentityArtTextures | null {
  return milestone41Textures;
}

export function isMilestone41ArenaIdentityArtReady(): boolean {
  return isRuntimeReadyAsset(MILESTONE41_ASSET_IDS.campaignArenaIdentity);
}

export function loadMilestone41ArenaIdentityArt(): Promise<Milestone41ArenaIdentityArtTextures | null> {
  if (!isMilestone41ArenaIdentityArtReady()) return Promise.resolve(null);
  milestone41Promise ??= Assets.load<Texture>(MILESTONE41_ASSET_URLS.campaignArenaIdentity).then((atlas) => {
    milestone41Textures = {
      campaignArenaIdentity: Object.fromEntries(
        FRAME_IDS.map((id, index) => [
          id,
          new Texture({
            source: atlas.source,
            frame: new Rectangle(index * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT)
          })
        ])
      ) as Record<Milestone41ArenaIdentityFrame, Texture>
    };
    return milestone41Textures;
  });
  return milestone41Promise;
}
