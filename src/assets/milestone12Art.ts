import { Assets, Rectangle, Texture } from "pixi.js";
import type { Player } from "../ecs/components";
import type { AlignmentGridNode } from "../overworld/alignmentGridMap";
import { loadMilestone11Art, type Milestone11ArtTextures } from "./milestone11Art";
import type { PlayerFacing } from "./milestone10Art";

import accordStrikerCoopVariantsUrl from "../../assets/sprites/players/accord_striker_walk_coop_variants.png";
import alignmentGridBackdropUrl from "../../assets/props/alignment_grid/alignment_grid_backdrop_v2.png";
import alignmentGridNodeLandmarksUrl from "../../assets/props/alignment_grid/node_landmarks_v1.png";
import alignmentGridRouteSigilsUrl from "../../assets/props/alignment_grid/route_sigils_v1.png";

export const MILESTONE12_ASSET_IDS = {
  coopVariants: "player.accord_striker.production_coop_variant_sheet_v1",
  alignmentGridBackdrop: "prop.alignment_grid.backdrop_v2",
  alignmentGridNodes: "prop.alignment_grid.node_landmarks_v1",
  alignmentGridRoutes: "prop.alignment_grid.route_sigils_v1"
} as const;

export const MILESTONE12_ASSET_URLS = {
  coopVariants: accordStrikerCoopVariantsUrl,
  alignmentGridBackdrop: alignmentGridBackdropUrl,
  alignmentGridNodes: alignmentGridNodeLandmarksUrl,
  alignmentGridRoutes: alignmentGridRouteSigilsUrl
} as const;

export type RouteSigilState = "stable" | "unstable" | "locked";

export interface Milestone12ArtTextures {
  base: Milestone11ArtTextures;
  playerVariants: Record<number, Record<PlayerFacing, Texture[]>>;
  alignmentGridBackdrop: Texture;
  alignmentGridNodes: Record<AlignmentGridNode["visualKind"], Texture>;
  routeSigils: Record<RouteSigilState, Texture>;
}

const PLAYER_DIRECTIONS: PlayerFacing[] = ["south", "east", "north", "west"];
const PLAYER_FRAME_WIDTH = 48;
const PLAYER_FRAME_HEIGHT = 48;
const PLAYER_FRAMES_PER_DIRECTION = 3;
const PLAYER_SLOT_BLOCK_HEIGHT = 192;
const NODE_FRAME_WIDTH = 96;
const NODE_FRAME_HEIGHT = 96;
const ROUTE_FRAME_WIDTH = 48;
const ROUTE_FRAME_HEIGHT = 48;

let milestone12Promise: Promise<Milestone12ArtTextures> | null = null;
let milestone12Textures: Milestone12ArtTextures | null = null;

export function getMilestone12ArtTextures(): Milestone12ArtTextures | null {
  return milestone12Textures;
}

export function loadMilestone12Art(): Promise<Milestone12ArtTextures> {
  milestone12Promise ??= Promise.all([
    loadMilestone11Art(),
    Assets.load<Texture>(MILESTONE12_ASSET_URLS.coopVariants),
    Assets.load<Texture>(MILESTONE12_ASSET_URLS.alignmentGridBackdrop),
    Assets.load<Texture>(MILESTONE12_ASSET_URLS.alignmentGridNodes),
    Assets.load<Texture>(MILESTONE12_ASSET_URLS.alignmentGridRoutes)
  ]).then(([base, coopSheet, alignmentGridBackdrop, nodeAtlas, routeAtlas]) => {
    milestone12Textures = {
      base,
      playerVariants: slicePlayerVariants(coopSheet),
      alignmentGridBackdrop,
      alignmentGridNodes: sliceNodeAtlas(nodeAtlas),
      routeSigils: sliceRouteAtlas(routeAtlas)
    };
    return milestone12Textures;
  });
  return milestone12Promise;
}

export function milestone12PlayerTextureFor(player: Player, slot: number, seconds: number, textures: Milestone12ArtTextures): Texture {
  const facing = playerFacing(player);
  const moving = Math.hypot(player.vx, player.vy) > 0.05;
  const variant = textures.playerVariants[slot % 4] ?? textures.playerVariants[0];
  const frame = moving ? Math.floor(seconds * 9) % variant[facing].length : 1;
  return variant[facing][frame];
}

export function milestone12NetworkPlayerTexture(slot: number, facing: PlayerFacing, moving: boolean, seconds: number, textures: Milestone12ArtTextures): Texture {
  const variant = textures.playerVariants[slot % 4] ?? textures.playerVariants[0];
  const direction = variant[facing] ? facing : "south";
  const frame = moving ? Math.floor(seconds * 9) % variant[direction].length : 1;
  return variant[direction][frame];
}

function slicePlayerVariants(sheet: Texture): Record<number, Record<PlayerFacing, Texture[]>> {
  const variants = {} as Record<number, Record<PlayerFacing, Texture[]>>;
  for (let slot = 0; slot < 4; slot += 1) {
    variants[slot] = {} as Record<PlayerFacing, Texture[]>;
    for (const [row, direction] of PLAYER_DIRECTIONS.entries()) {
      variants[slot][direction] = Array.from({ length: PLAYER_FRAMES_PER_DIRECTION }, (_, col) => {
        return new Texture({
          source: sheet.source,
          frame: new Rectangle(col * PLAYER_FRAME_WIDTH, slot * PLAYER_SLOT_BLOCK_HEIGHT + row * PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT)
        });
      });
    }
  }
  return variants;
}

function sliceNodeAtlas(atlas: Texture): Record<AlignmentGridNode["visualKind"], Texture> {
  const kinds: AlignmentGridNode["visualKind"][] = ["plaza", "relay", "lake", "camp", "cache", "transit"];
  const base = Object.fromEntries(
    kinds.map((kind, index) => [
      kind,
      new Texture({
        source: atlas.source,
        frame: new Rectangle(index * NODE_FRAME_WIDTH, 0, NODE_FRAME_WIDTH, NODE_FRAME_HEIGHT)
      })
    ])
  ) as Partial<Record<AlignmentGridNode["visualKind"], Texture>>;
  base.archive = base.cache;
  base.beacon = base.relay;
  base.sunfield = base.transit;
  base.spire = base.relay;
  base.finale = base.relay;
  return base as Record<AlignmentGridNode["visualKind"], Texture>;
}

function sliceRouteAtlas(atlas: Texture): Record<RouteSigilState, Texture> {
  const states: RouteSigilState[] = ["stable", "unstable", "locked"];
  return Object.fromEntries(
    states.map((state, index) => [
      state,
      new Texture({
        source: atlas.source,
        frame: new Rectangle(index * ROUTE_FRAME_WIDTH, 0, ROUTE_FRAME_WIDTH, ROUTE_FRAME_HEIGHT)
      })
    ])
  ) as Record<RouteSigilState, Texture>;
}

function playerFacing(player: Player): PlayerFacing {
  if (Math.hypot(player.vx, player.vy) <= 0.05) return "south";
  const screenX = player.vx - player.vy;
  const screenY = player.vx + player.vy;
  if (Math.abs(screenY) >= Math.abs(screenX)) return screenY >= 0 ? "south" : "north";
  return screenX >= 0 ? "east" : "west";
}
