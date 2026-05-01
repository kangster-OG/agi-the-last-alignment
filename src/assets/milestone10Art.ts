import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import type { Entity, Player } from "../ecs/components";
import { worldToIso } from "../iso/projection";

import accordStrikerWalkUrl from "../../assets/sprites/players/accord_striker_walk.png";
import badOutputsSheetUrl from "../../assets/sprites/enemies/bad_outputs_sheet.png";
import coherenceShardUrl from "../../assets/sprites/pickups/coherence_shard.png";
import treatyMonumentUrl from "../../assets/props/armistice_plaza/treaty_monument.png";
import oathEaterUrl from "../../assets/sprites/bosses/oath_eater.png";
import oathEaterPortraitUrl from "../../assets/portraits/oath_eater_title_card.png";

export const MILESTONE10_ASSET_IDS = {
  player: "player.accord_striker.production_walk_sheet",
  badOutputs: "enemy.bad_outputs.production_sheet_v1",
  coherenceShard: "pickup.coherence_shard.production_v1",
  treatyMonument: "prop.armistice_plaza.treaty_monument_v1",
  oathEater: "boss.oath_eater.production_sprite_v1",
  oathEaterPortrait: "portrait.oath_eater.production_title_card_v1"
} as const;

export const MILESTONE10_ASSET_URLS = {
  player: accordStrikerWalkUrl,
  badOutputs: badOutputsSheetUrl,
  coherenceShard: coherenceShardUrl,
  treatyMonument: treatyMonumentUrl,
  oathEater: oathEaterUrl,
  oathEaterPortrait: oathEaterPortraitUrl
} as const;

export type PlayerFacing = "south" | "east" | "north" | "west";

export interface Milestone10ArtTextures {
  player: Record<PlayerFacing, Texture[]>;
  badOutputs: Texture[];
  coherenceShard: Texture;
  treatyMonument: Texture;
  oathEater: Texture;
  oathEaterPortrait: Texture;
}

const PLAYER_DIRECTIONS: PlayerFacing[] = ["south", "east", "north", "west"];
const PLAYER_FRAME_WIDTH = 48;
const PLAYER_FRAME_HEIGHT = 48;
const BAD_OUTPUT_FRAME_WIDTH = 32;
const BAD_OUTPUT_FRAME_HEIGHT = 32;

let milestone10Promise: Promise<Milestone10ArtTextures> | null = null;
let milestone10Textures: Milestone10ArtTextures | null = null;

export function milestone10ArtReady(): boolean {
  return milestone10Textures !== null;
}

export function getMilestone10ArtTextures(): Milestone10ArtTextures | null {
  return milestone10Textures;
}

export function loadMilestone10Art(): Promise<Milestone10ArtTextures> {
  milestone10Promise ??= Promise.all([
    Assets.load<Texture>(MILESTONE10_ASSET_URLS.player),
    Assets.load<Texture>(MILESTONE10_ASSET_URLS.badOutputs),
    Assets.load<Texture>(MILESTONE10_ASSET_URLS.coherenceShard),
    Assets.load<Texture>(MILESTONE10_ASSET_URLS.treatyMonument),
    Assets.load<Texture>(MILESTONE10_ASSET_URLS.oathEater),
    Assets.load<Texture>(MILESTONE10_ASSET_URLS.oathEaterPortrait)
  ]).then(([playerSheet, badOutputsSheet, coherenceShard, treatyMonument, oathEater, oathEaterPortrait]) => {
    const player = {} as Record<PlayerFacing, Texture[]>;
    for (const [row, direction] of PLAYER_DIRECTIONS.entries()) {
      player[direction] = [0, 1].map(
        (col) =>
          new Texture({
            source: playerSheet.source,
            frame: new Rectangle(col * PLAYER_FRAME_WIDTH, row * PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT)
          })
      );
    }

    const badOutputs = [0, 1, 2].map(
      (col) =>
        new Texture({
          source: badOutputsSheet.source,
          frame: new Rectangle(col * BAD_OUTPUT_FRAME_WIDTH, 0, BAD_OUTPUT_FRAME_WIDTH, BAD_OUTPUT_FRAME_HEIGHT)
        })
    );

    milestone10Textures = {
      player,
      badOutputs,
      coherenceShard,
      treatyMonument,
      oathEater,
      oathEaterPortrait
    };
    return milestone10Textures;
  });
  return milestone10Promise;
}

export function playerTextureFor(player: Player, seconds: number, textures: Milestone10ArtTextures): Texture {
  const facing = playerFacing(player);
  const moving = Math.hypot(player.vx, player.vy) > 0.05;
  const frame = moving ? Math.floor(seconds * 8) % textures.player[facing].length : 0;
  return textures.player[facing][frame];
}

export function badOutputTextureFor(entity: Entity, textures: Milestone10ArtTextures): Texture {
  return textures.badOutputs[Math.abs(entity.id) % textures.badOutputs.length];
}

export function addPreviewSprite(container: Container, texture: Texture, x: number, y: number, scale: number, anchorY = 1): Sprite {
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5, anchorY);
  sprite.scale.set(scale);
  sprite.position.set(x, y);
  container.addChild(sprite);
  return sprite;
}

export function placeWorldSprite(sprite: Sprite, worldX: number, worldY: number, scale: number, zIndex: number, anchorY = 0.9): void {
  const p = worldToIso(worldX, worldY);
  sprite.anchor.set(0.5, anchorY);
  sprite.position.set(p.screenX, p.screenY);
  sprite.scale.set(scale);
  sprite.zIndex = zIndex;
  sprite.visible = true;
}

function playerFacing(player: Player): PlayerFacing {
  if (Math.hypot(player.vx, player.vy) <= 0.05) return "south";
  const screenX = player.vx - player.vy;
  const screenY = player.vx + player.vy;
  if (Math.abs(screenY) >= Math.abs(screenX)) return screenY >= 0 ? "south" : "north";
  return screenX >= 0 ? "east" : "west";
}
