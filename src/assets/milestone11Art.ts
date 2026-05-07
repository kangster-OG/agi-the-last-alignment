import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import type { Entity, Player } from "../ecs/components";
import { addPreviewSprite, loadMilestone10Art, type Milestone10ArtTextures, type PlayerFacing } from "./milestone10Art";

import accordStrikerWalkV2Url from "../../assets/sprites/players/accord_striker_walk_v2.png";
import badOutputsSheetUrl from "../../assets/sprites/enemies/bad_outputs_sheet.png";
import benchmarkGremlinsSheetUrl from "../../assets/sprites/enemies/benchmark_gremlins_sheet.png";
import contextRotCrabsSheetUrl from "../../assets/sprites/enemies/context_rot_crabs_sheet.png";
import barricadeCorridorUrl from "../../assets/props/armistice_plaza/barricade_corridor_set.png";
import crashedDroneYardUrl from "../../assets/props/armistice_plaza/crashed_drone_yard_wreck.png";
import emergencyAlignmentTerminalUrl from "../../assets/props/armistice_plaza/emergency_alignment_terminal.png";
import cosmicBreachCrackUrl from "../../assets/props/armistice_plaza/cosmic_breach_crack.png";
import openaiAccordMarkUrl from "../../assets/ui/openai_accord_mark.png";

export const MILESTONE11_ASSET_IDS = {
  playerV2: "player.accord_striker.production_walk_sheet_v2",
  badOutputs: "enemy.bad_outputs.production_sheet_v1",
  benchmarkGremlins: "enemy.benchmark_gremlin.production_sheet_v1",
  contextRotCrabs: "enemy.context_rot_crab.production_sheet_v1",
  barricadeCorridor: "prop.armistice_plaza.barricade_corridor_v1",
  crashedDroneYard: "prop.armistice_plaza.crashed_drone_yard_v1",
  emergencyAlignmentTerminal: "prop.armistice_plaza.emergency_alignment_terminal_v1",
  cosmicBreachCrack: "prop.armistice_plaza.cosmic_breach_crack_v1",
  openaiAccordMark: "ui.faction.openai_accord_mark_v1"
} as const;

export const MILESTONE11_ASSET_URLS = {
  playerV2: accordStrikerWalkV2Url,
  badOutputs: badOutputsSheetUrl,
  benchmarkGremlins: benchmarkGremlinsSheetUrl,
  contextRotCrabs: contextRotCrabsSheetUrl,
  barricadeCorridor: barricadeCorridorUrl,
  crashedDroneYard: crashedDroneYardUrl,
  emergencyAlignmentTerminal: emergencyAlignmentTerminalUrl,
  cosmicBreachCrack: cosmicBreachCrackUrl,
  openaiAccordMark: openaiAccordMarkUrl
} as const;

export type Milestone11PropId = "barricade_corridor" | "crashed_drone_yard" | "emergency_alignment_terminal" | "cosmic_breach_crack";

export interface Milestone11ArtTextures {
  base: Milestone10ArtTextures;
  playerV2: Record<PlayerFacing, Texture[]>;
  badOutputs: Texture[];
  benchmarkGremlins: Texture[];
  contextRotCrabs: Texture[];
  props: Record<Milestone11PropId, Texture>;
  openaiAccordMark: Texture;
}

const PLAYER_DIRECTIONS: PlayerFacing[] = ["south", "east", "north", "west"];
const PLAYER_FRAME_WIDTH = 80;
const PLAYER_FRAME_HEIGHT = 80;
const PLAYER_FRAMES_PER_DIRECTION = 3;
const ENEMY_FRAME_WIDTH = 64;
const ENEMY_FRAME_HEIGHT = 64;
const ENEMY_FRAME_COUNT = 4;

let milestone11Promise: Promise<Milestone11ArtTextures> | null = null;
let milestone11Textures: Milestone11ArtTextures | null = null;

export function milestone11ArtReady(): boolean {
  return milestone11Textures !== null;
}

export function getMilestone11ArtTextures(): Milestone11ArtTextures | null {
  return milestone11Textures;
}

export function loadMilestone11Art(): Promise<Milestone11ArtTextures> {
  milestone11Promise ??= Promise.all([
    loadMilestone10Art(),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.playerV2),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.badOutputs),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.benchmarkGremlins),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.contextRotCrabs),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.barricadeCorridor),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.crashedDroneYard),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.emergencyAlignmentTerminal),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.cosmicBreachCrack),
    Assets.load<Texture>(MILESTONE11_ASSET_URLS.openaiAccordMark)
  ]).then(([base, playerSheet, badOutputsSheet, benchmarkSheet, crabSheet, barricadeCorridor, crashedDroneYard, emergencyAlignmentTerminal, cosmicBreachCrack, openaiAccordMark]) => {
    milestone11Textures = {
      base,
      playerV2: slicePlayerSheet(playerSheet),
      badOutputs: sliceEnemySheet(badOutputsSheet),
      benchmarkGremlins: sliceEnemySheet(benchmarkSheet),
      contextRotCrabs: sliceEnemySheet(crabSheet),
      props: {
        barricade_corridor: barricadeCorridor,
        crashed_drone_yard: crashedDroneYard,
        emergency_alignment_terminal: emergencyAlignmentTerminal,
        cosmic_breach_crack: cosmicBreachCrack
      },
      openaiAccordMark
    };
    return milestone11Textures;
  });
  return milestone11Promise;
}

export function milestone11PlayerTextureFor(player: Player, seconds: number, textures: Milestone11ArtTextures): Texture {
  const facing = playerFacing(player);
  const moving = Math.hypot(player.vx, player.vy) > 0.05;
  const frame = moving ? Math.floor(seconds * 9) % textures.playerV2[facing].length : 1;
  return textures.playerV2[facing][frame];
}

export function milestone11EnemyTextureFor(entity: Entity, textures: Milestone11ArtTextures, seconds = 0): Texture | null {
  const frame = Math.floor(seconds * 7 + Math.abs(entity.id)) % ENEMY_FRAME_COUNT;
  if (entity.enemyFamilyId === "bad_outputs") return textures.badOutputs[frame % textures.badOutputs.length];
  if (entity.enemyFamilyId === "benchmark_gremlins") return textures.benchmarkGremlins[frame % textures.benchmarkGremlins.length];
  if (entity.enemyFamilyId === "context_rot_crabs") return textures.contextRotCrabs[frame % textures.contextRotCrabs.length];
  if (entity.enemyFamilyId === "eval_wraiths") return textures.contextRotCrabs[frame % textures.contextRotCrabs.length];
  return null;
}

export function addMilestone11PreviewSprite(container: Container, texture: Texture, x: number, y: number, scale: number, anchorY = 1): Sprite {
  return addPreviewSprite(container, texture, x, y, scale, anchorY);
}

function slicePlayerSheet(sheet: Texture): Record<PlayerFacing, Texture[]> {
  const player = {} as Record<PlayerFacing, Texture[]>;
  for (const [row, direction] of PLAYER_DIRECTIONS.entries()) {
    player[direction] = Array.from({ length: PLAYER_FRAMES_PER_DIRECTION }, (_, col) => {
      return new Texture({
        source: sheet.source,
        frame: new Rectangle(col * PLAYER_FRAME_WIDTH, row * PLAYER_FRAME_HEIGHT, PLAYER_FRAME_WIDTH, PLAYER_FRAME_HEIGHT)
      });
    });
  }
  return player;
}

function sliceEnemySheet(sheet: Texture): Texture[] {
  return Array.from({ length: ENEMY_FRAME_COUNT }, (_, col) => {
    return new Texture({
      source: sheet.source,
      frame: new Rectangle(col * ENEMY_FRAME_WIDTH, 0, ENEMY_FRAME_WIDTH, ENEMY_FRAME_HEIGHT)
    });
  });
}

function playerFacing(player: Player): PlayerFacing {
  if (Math.hypot(player.vx, player.vy) <= 0.05) return "south";
  const screenX = player.vx - player.vy;
  const screenY = player.vx + player.vy;
  if (Math.abs(screenY) >= Math.abs(screenX)) return screenY >= 0 ? "south" : "north";
  return screenX >= 0 ? "east" : "west";
}
