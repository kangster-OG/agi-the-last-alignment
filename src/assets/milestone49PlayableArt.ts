import { Assets, Rectangle, Texture } from "pixi.js";
import type { Player } from "../ecs/components";
import type { PlayerFacing } from "./milestone10Art";

import classRosterUrl from "../../assets/sprites/players/class_roster_m49.png";
import comindModulesUrl from "../../assets/ui/comind_modules_m49.png";
import factionSigilsUrl from "../../assets/ui/faction_sigils_pixellab_m59.png";
import roleChipsUrl from "../../assets/ui/role_chips_m49.png";
import comindPortraitsUrl from "../../assets/portraits/comind_portraits_m49.png";
import openAiOfficialLogoUrl from "../../assets/third_party/logos/openai_official.svg";
import anthropicOfficialLogoUrl from "../../assets/third_party/logos/anthropic_official.svg";
import googleDeepMindOfficialLogoUrl from "../../assets/third_party/logos/google_deepmind_official.svg";
import metaOfficialLogoUrl from "../../assets/third_party/logos/meta_official.svg";
import xaiOfficialLogoUrl from "../../assets/third_party/logos/xai_official.svg";
import deepseekOfficialLogoUrl from "../../assets/third_party/logos/deepseek_official.svg";
import mistralOfficialLogoUrl from "../../assets/third_party/logos/mistral_official.svg";
import alibabaQwenOfficialLogoUrl from "../../assets/third_party/logos/alibaba_qwen_official.svg";

export const MILESTONE49_ASSET_IDS = {
  classRoster: "player.class_roster.production_m49_sheet_v1",
  comindModules: "ui.comind_modules.production_m49_v1",
  factionSigils: "ui.faction_sigils.pixellab_m59_v1",
  roleChips: "ui.role_chips.production_m49_v1",
  comindPortraits: "portrait.comind_modules.production_m49_v1",
  officialLogos: {
    openai: "third_party.logo.openai.official",
    anthropic: "third_party.logo.anthropic.official",
    googleDeepMind: "third_party.logo.google_deepmind.official",
    meta: "third_party.logo.meta.official",
    xai: "third_party.logo.xai.official",
    deepseek: "third_party.logo.deepseek.official",
    mistral: "third_party.logo.mistral.official",
    alibabaQwen: "third_party.logo.alibaba_qwen.official"
  }
} as const;

export const MILESTONE49_ASSET_URLS = {
  classRoster: classRosterUrl,
  comindModules: comindModulesUrl,
  factionSigils: factionSigilsUrl,
  roleChips: roleChipsUrl,
  comindPortraits: comindPortraitsUrl
} as const;

export const MILESTONE49_CLASS_IDS = [
  "accord_striker",
  "bastion_breaker",
  "drone_reaver",
  "signal_vanguard",
  "bonecode_executioner",
  "redline_surgeon",
  "moonframe_juggernaut",
  "vector_interceptor",
  "nullbreaker_ronin",
  "overclock_marauder",
  "prism_gunner",
  "rift_saboteur"
] as const;

export const MILESTONE49_FACTION_IDS = [
  "openai_accord",
  "anthropic_safeguard",
  "google_deepmind_gemini",
  "xai_grok_free_signal",
  "deepseek_abyssal",
  "qwen_silkgrid",
  "meta_llama_open_herd",
  "mistral_cyclone"
] as const;

export const MILESTONE49_ORIGINAL_FACTION_MARK_IDS = [
  "faction_logo.placeholder.openai_accord",
  "faction_logo.placeholder.anthropic_safeguard",
  "faction_logo.placeholder.google_deepmind",
  "faction_logo.placeholder.xai_grok",
  "faction_logo.placeholder.deepseek_abyssal",
  "faction_logo.placeholder.alibaba_qwen",
  "faction_logo.placeholder.meta_llama",
  "faction_logo.placeholder.mistral_cyclone"
] as const;

export const MILESTONE49_THIRD_PARTY_LOGO_IDS = [
  "third_party.logo.openai.official",
  "third_party.logo.anthropic.official",
  "third_party.logo.google_deepmind.official",
  "third_party.logo.xai.official",
  "third_party.logo.deepseek.official",
  "third_party.logo.alibaba_qwen.official",
  "third_party.logo.meta.official",
  "third_party.logo.mistral.official"
] as const;

export const MILESTONE49_ROLE_IDS = ["runner", "support", "cover", "harrier", "control", "duelist"] as const;

export type Milestone49ClassId = (typeof MILESTONE49_CLASS_IDS)[number];
export type Milestone49FactionId = (typeof MILESTONE49_FACTION_IDS)[number];
export type Milestone49RoleId = (typeof MILESTONE49_ROLE_IDS)[number];

export interface Milestone49PlayableArtTextures {
  classSprites: Record<string, Record<PlayerFacing, Texture[]>>;
  comindModules: Record<string, Texture>;
  factionSigils: Record<string, Texture>;
  roleChips: Record<string, Texture>;
  comindPortraits: Record<string, Texture>;
  officialLogos: Record<string, Texture>;
}

const PLAYER_DIRECTIONS: PlayerFacing[] = ["south", "east", "north", "west"];
const PLAYER_FRAME_WIDTH = 80;
const PLAYER_FRAME_HEIGHT = 80;
const PLAYER_FRAMES_PER_DIRECTION = 3;
const PLAYER_ROWS_PER_CLASS = 4;
const MODULE_FRAME_SIZE = 64;
const ROLE_FRAME_WIDTH = 48;
const ROLE_FRAME_HEIGHT = 32;
const PORTRAIT_FRAME_SIZE = 96;
const OFFICIAL_LOGO_URLS: Record<Milestone49FactionId, string> = {
  openai_accord: openAiOfficialLogoUrl,
  anthropic_safeguard: anthropicOfficialLogoUrl,
  google_deepmind_gemini: googleDeepMindOfficialLogoUrl,
  xai_grok_free_signal: xaiOfficialLogoUrl,
  deepseek_abyssal: deepseekOfficialLogoUrl,
  qwen_silkgrid: alibabaQwenOfficialLogoUrl,
  meta_llama_open_herd: metaOfficialLogoUrl,
  mistral_cyclone: mistralOfficialLogoUrl
};

let milestone49Promise: Promise<Milestone49PlayableArtTextures> | null = null;
let milestone49Textures: Milestone49PlayableArtTextures | null = null;

export function getMilestone49PlayableArtTextures(): Milestone49PlayableArtTextures | null {
  return milestone49Textures;
}

export function loadMilestone49PlayableArt(): Promise<Milestone49PlayableArtTextures> {
  milestone49Promise ??= Promise.all([
    Assets.load<Texture>(MILESTONE49_ASSET_URLS.classRoster),
    Assets.load<Texture>(MILESTONE49_ASSET_URLS.comindModules),
    Assets.load<Texture>(MILESTONE49_ASSET_URLS.factionSigils),
    Assets.load<Texture>(MILESTONE49_ASSET_URLS.roleChips),
    Assets.load<Texture>(MILESTONE49_ASSET_URLS.comindPortraits),
    loadOfficialLogoTextures()
  ]).then(([classSheet, modulesSheet, sigilsSheet, roleSheet, portraitSheet, officialLogos]) => {
    milestone49Textures = {
      classSprites: sliceClassRoster(classSheet),
      comindModules: sliceAtlasByIds(modulesSheet, MILESTONE49_FACTION_IDS, MODULE_FRAME_SIZE, MODULE_FRAME_SIZE),
      factionSigils: sliceAtlasByIds(sigilsSheet, MILESTONE49_FACTION_IDS, MODULE_FRAME_SIZE, MODULE_FRAME_SIZE),
      roleChips: sliceAtlasByIds(roleSheet, MILESTONE49_ROLE_IDS, ROLE_FRAME_WIDTH, ROLE_FRAME_HEIGHT),
      comindPortraits: sliceAtlasByIds(portraitSheet, MILESTONE49_FACTION_IDS, PORTRAIT_FRAME_SIZE, PORTRAIT_FRAME_SIZE),
      officialLogos
    };
    return milestone49Textures;
  });
  return milestone49Promise;
}

export function milestone49PlayerTextureFor(classId: string, player: Player, seconds: number, textures: Milestone49PlayableArtTextures): Texture {
  const facing = playerFacing(player);
  const moving = Math.hypot(player.vx, player.vy) > 0.05;
  return milestone49NetworkPlayerTextureFor(classId, facing, moving, seconds, textures);
}

export function milestone49NetworkPlayerTextureFor(
  classId: string,
  facing: PlayerFacing,
  moving: boolean,
  seconds: number,
  textures: Milestone49PlayableArtTextures
): Texture {
  const classSprites = textures.classSprites[classId] ?? textures.classSprites.accord_striker;
  const direction = classSprites[facing] ? facing : "south";
  const frame = moving ? Math.floor(seconds * 9) % classSprites[direction].length : 1;
  return classSprites[direction][frame];
}

export function milestone49CoMindModuleTexture(factionId: string, textures: Milestone49PlayableArtTextures): Texture {
  return textures.comindModules[factionId] ?? textures.comindModules.openai_accord;
}

export function milestone49FactionSigilTexture(factionId: string, textures: Milestone49PlayableArtTextures): Texture {
  return textures.factionSigils[factionId] ?? textures.factionSigils.openai_accord;
}

export function milestone49CoMindPortraitTexture(factionId: string, textures: Milestone49PlayableArtTextures): Texture {
  return textures.comindPortraits[factionId] ?? textures.comindPortraits.openai_accord;
}

export function milestone49OfficialLogoTexture(factionId: string, textures: Milestone49PlayableArtTextures): Texture {
  return textures.officialLogos[factionId] ?? textures.officialLogos.openai_accord;
}

export function milestone49RoleChipTexture(roleId: string, textures: Milestone49PlayableArtTextures): Texture {
  return textures.roleChips[roleId] ?? textures.roleChips.runner;
}

function sliceClassRoster(sheet: Texture): Record<string, Record<PlayerFacing, Texture[]>> {
  const classSprites: Record<string, Record<PlayerFacing, Texture[]>> = {};
  for (const [classIndex, classId] of MILESTONE49_CLASS_IDS.entries()) {
    classSprites[classId] = {} as Record<PlayerFacing, Texture[]>;
    for (const [directionIndex, direction] of PLAYER_DIRECTIONS.entries()) {
      classSprites[classId][direction] = Array.from({ length: PLAYER_FRAMES_PER_DIRECTION }, (_, frameIndex) => {
        return new Texture({
          source: sheet.source,
          frame: new Rectangle(
            frameIndex * PLAYER_FRAME_WIDTH,
            (classIndex * PLAYER_ROWS_PER_CLASS + directionIndex) * PLAYER_FRAME_HEIGHT,
            PLAYER_FRAME_WIDTH,
            PLAYER_FRAME_HEIGHT
          )
        });
      });
    }
  }
  return classSprites;
}

function sliceAtlasByIds<const Ids extends readonly string[]>(sheet: Texture, ids: Ids, frameWidth: number, frameHeight: number): Record<Ids[number], Texture> {
  return Object.fromEntries(
    ids.map((id, index) => [
      id,
      new Texture({
        source: sheet.source,
        frame: new Rectangle(index * frameWidth, 0, frameWidth, frameHeight)
      })
    ])
  ) as Record<Ids[number], Texture>;
}

async function loadOfficialLogoTextures(): Promise<Record<Milestone49FactionId, Texture>> {
  const entries = await Promise.all(
    MILESTONE49_FACTION_IDS.map(async (id) => [id, await Assets.load<Texture>(OFFICIAL_LOGO_URLS[id])] as const)
  );
  return Object.fromEntries(entries) as Record<Milestone49FactionId, Texture>;
}

function playerFacing(player: Player): PlayerFacing {
  if (Math.hypot(player.vx, player.vy) <= 0.05) return "south";
  const screenX = player.vx - player.vy;
  const screenY = player.vx + player.vy;
  if (Math.abs(screenY) >= Math.abs(screenX)) return screenY >= 0 ? "south" : "north";
  return screenX >= 0 ? "east" : "west";
}
