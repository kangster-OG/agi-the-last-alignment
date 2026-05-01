import { Assets, Rectangle, Texture } from "pixi.js";

import splitHoldAnchorUrl from "../../assets/props/objectives/split_hold_anchor_v1.png";
import regroupBeaconUrl from "../../assets/props/objectives/regroup_beacon_v1.png";
import recompileRelayUrl from "../../assets/props/objectives/recompile_relay_v1.png";
import routeStateMarkersUrl from "../../assets/props/alignment_grid/route_state_markers_v2.png";
import partyVotePipsUrl from "../../assets/ui/route_map_party_vote_pips_v1.png";
import saveProfileIconsUrl from "../../assets/ui/save_profile_import_export_icons_v1.png";
import routeRewardBadgesUrl from "../../assets/ui/route_reward_badges_v1.png";

export const MILESTONE34_ASSET_IDS = {
  splitHoldAnchor: "prop.objective.split_hold_anchor_v1",
  regroupBeacon: "prop.objective.regroup_beacon_v1",
  recompileRelay: "prop.objective.recompile_relay_v1",
  routeStateMarkers: "prop.alignment_grid.route_state_markers_v2",
  partyVotePips: "ui.route_map.party_vote_pips_v1",
  saveProfileIcons: "ui.save_profile.import_export_icons_v1",
  routeRewardBadges: "ui.route_map.reward_badges_v1"
} as const;

export type ObjectivePropFrame = "inactive" | "active" | "pressured" | "completed";
export type RegroupBeaconFrame = "inactive" | "pulse" | "ready" | "completed";
export type RecompileRelayFrame = "offline" | "compiling" | "ready" | "corrupted";
export type RouteStateMarkerFrame = "stable" | "unstable" | "locked" | "event" | "boss";
export type PartyVotePipFrame =
  | "p1_unready"
  | "p1_ready"
  | "p2_unready"
  | "p2_ready"
  | "p3_unready"
  | "p3_ready"
  | "p4_unready"
  | "p4_ready";
export type SaveProfileIconFrame = "local_save" | "export" | "import" | "copy" | "reset" | "success";
export type RouteRewardBadgeFrame = "data_fragment" | "memory_cache" | "clearance_pass" | "core_upgrade" | "glitch_key" | "locked_reward";

export interface Milestone34ObjectiveArtTextures {
  splitHoldAnchor: Record<ObjectivePropFrame, Texture>;
  regroupBeacon: Record<RegroupBeaconFrame, Texture>;
  recompileRelay: Record<RecompileRelayFrame, Texture>;
  routeStateMarkers: Record<RouteStateMarkerFrame, Texture>;
  partyVotePips: Record<PartyVotePipFrame, Texture>;
  saveProfileIcons: Record<SaveProfileIconFrame, Texture>;
  routeRewardBadges: Record<RouteRewardBadgeFrame, Texture>;
}

const OBJECTIVE_PROP_FRAMES: ObjectivePropFrame[] = ["inactive", "active", "pressured", "completed"];
const REGROUP_BEACON_FRAMES: RegroupBeaconFrame[] = ["inactive", "pulse", "ready", "completed"];
const RECOMPILE_RELAY_FRAMES: RecompileRelayFrame[] = ["offline", "compiling", "ready", "corrupted"];
const ROUTE_STATE_FRAMES: RouteStateMarkerFrame[] = ["stable", "unstable", "locked", "event", "boss"];
const PARTY_VOTE_FRAMES: PartyVotePipFrame[] = ["p1_unready", "p1_ready", "p2_unready", "p2_ready", "p3_unready", "p3_ready", "p4_unready", "p4_ready"];
const SAVE_PROFILE_ICON_FRAMES: SaveProfileIconFrame[] = ["local_save", "export", "import", "copy", "reset", "success"];
const ROUTE_REWARD_BADGE_FRAMES: RouteRewardBadgeFrame[] = ["data_fragment", "memory_cache", "clearance_pass", "core_upgrade", "glitch_key", "locked_reward"];

let milestone34Promise: Promise<Milestone34ObjectiveArtTextures> | null = null;
let milestone34Textures: Milestone34ObjectiveArtTextures | null = null;

export function getMilestone34ObjectiveArtTextures(): Milestone34ObjectiveArtTextures | null {
  return milestone34Textures;
}

export function loadMilestone34ObjectiveArt(): Promise<Milestone34ObjectiveArtTextures> {
  milestone34Promise ??= Promise.all([
    Assets.load<Texture>(splitHoldAnchorUrl),
    Assets.load<Texture>(regroupBeaconUrl),
    Assets.load<Texture>(recompileRelayUrl),
    Assets.load<Texture>(routeStateMarkersUrl),
    Assets.load<Texture>(partyVotePipsUrl),
    Assets.load<Texture>(saveProfileIconsUrl),
    Assets.load<Texture>(routeRewardBadgesUrl)
  ]).then(([splitHoldAnchor, regroupBeacon, recompileRelay, routeStateMarkers, partyVotePips, saveProfileIcons, routeRewardBadges]) => {
    milestone34Textures = {
      splitHoldAnchor: sliceAtlas(splitHoldAnchor, OBJECTIVE_PROP_FRAMES, 96, 96),
      regroupBeacon: sliceAtlas(regroupBeacon, REGROUP_BEACON_FRAMES, 96, 96),
      recompileRelay: sliceAtlas(recompileRelay, RECOMPILE_RELAY_FRAMES, 96, 96),
      routeStateMarkers: sliceAtlas(routeStateMarkers, ROUTE_STATE_FRAMES, 48, 48),
      partyVotePips: sliceAtlas(partyVotePips, PARTY_VOTE_FRAMES, 32, 32),
      saveProfileIcons: sliceAtlas(saveProfileIcons, SAVE_PROFILE_ICON_FRAMES, 32, 32),
      routeRewardBadges: sliceAtlas(routeRewardBadges, ROUTE_REWARD_BADGE_FRAMES, 32, 32)
    };
    return milestone34Textures;
  });
  return milestone34Promise;
}

function sliceAtlas<T extends string>(atlas: Texture, frames: readonly T[], frameWidth: number, frameHeight: number): Record<T, Texture> {
  return Object.fromEntries(
    frames.map((name, index) => [
      name,
      new Texture({
        source: atlas.source,
        frame: new Rectangle(index * frameWidth, 0, frameWidth, frameHeight)
      })
    ])
  ) as Record<T, Texture>;
}
