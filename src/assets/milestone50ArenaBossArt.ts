import { Assets, Container, Rectangle, Sprite, Texture } from "pixi.js";
import { TILE_HEIGHT, TILE_WIDTH, worldToIso } from "../iso/projection";
import { isRuntimeReadyAsset } from "./manifest";

import terrainUrl from "../../assets/tiles/campaign_arenas/terrain_m50.png";
import arenaPropsUrl from "../../assets/props/campaign_arenas/arena_props_m50.png";
import enemiesUrl from "../../assets/sprites/enemies/campaign_enemies_m50.png";
import bossesUrl from "../../assets/sprites/bosses/campaign_bosses_m50.png";
import bossPortraitsUrl from "../../assets/portraits/campaign_boss_portraits_m50.png";
import hazardsUrl from "../../assets/sprites/effects/campaign_hazards_m50.png";

export const MILESTONE50_ASSET_IDS = {
  terrain: "tile.campaign_arenas.production_m50_terrain_atlas",
  arenaProps: "prop.campaign_arenas.production_m50_prop_atlas",
  enemies: "enemy.campaign_families.production_m50_atlas",
  bosses: "boss.campaign.production_m50_atlas",
  bossPortraits: "portrait.campaign_bosses.production_m50_atlas",
  hazards: "effect.campaign_hazards.production_m50_atlas"
} as const;

export const MILESTONE50_ASSET_URLS = {
  terrain: terrainUrl,
  arenaProps: arenaPropsUrl,
  enemies: enemiesUrl,
  bosses: bossesUrl,
  bossPortraits: bossPortraitsUrl,
  hazards: hazardsUrl
} as const;

export const MILESTONE50_ARENA_IDS = [
  "armistice_plaza",
  "cooling_lake_nine",
  "memory_cache_001",
  "model_war_memorial",
  "thermal_archive",
  "guardrail_forge",
  "transit_loop_zero",
  "false_schedule_yard",
  "glass_sunfield",
  "archive_of_unsaid_things",
  "blackwater_beacon",
  "verdict_spire",
  "appeal_court_ruins",
  "alignment_spire_finale"
] as const;

export const MILESTONE50_MAJOR_PROOF_ARENA_IDS = [
  "armistice_plaza",
  "cooling_lake_nine",
  "transit_loop_zero",
  "glass_sunfield",
  "archive_of_unsaid_things",
  "blackwater_beacon",
  "verdict_spire",
  "alignment_spire_finale"
] as const;

export const MILESTONE50_ENEMY_FAMILY_IDS = [
  "bad_outputs",
  "prompt_leeches",
  "jailbreak_wraiths",
  "benchmark_gremlins",
  "overfit_horrors",
  "token_gobblers",
  "model_collapse_slimes",
  "eval_wraiths",
  "context_rot_crabs",
  "thermal_mirages",
  "memory_anchors",
  "false_schedules",
  "solar_reflections",
  "redaction_angels",
  "deepforms",
  "choirglass",
  "tidecall_static",
  "injunction_writs",
  "previous_boss_echoes"
] as const;

export const MILESTONE50_BOSS_IDS = [
  "oath_eater",
  "thermal_oracle",
  "memory_curator",
  "station_that_arrives",
  "wrong_sunrise",
  "redactor_saint",
  "maw_below_weather",
  "injunction_engine",
  "alignment_court_engine",
  "alien_god_intelligence"
] as const;

export const MILESTONE50_HAZARD_IDS = [
  "broken_promise",
  "treaty_charge",
  "thermal_bloom",
  "boiling_cache",
  "false_track",
  "verdict_seal",
  "solar_beam",
  "shade_zone",
  "redaction_field",
  "redaction_anchor",
  "tidal_wave",
  "signal_tower",
  "prediction_ghost",
  "route_mouth",
  "fake_upgrade"
] as const;

export interface Milestone50ArenaBossArtTextures {
  terrain: Record<string, Texture[]>;
  arenaProps: Record<string, Texture>;
  enemies: Record<string, Texture>;
  bosses: Record<string, Texture>;
  bossPortraits: Record<string, Texture>;
  hazards: Record<string, Texture>;
}

const TERRAIN_FRAME_WIDTH = 64;
const TERRAIN_FRAME_HEIGHT = 32;
const TERRAIN_VARIANTS = 4;
const PROP_FRAME_SIZE = 96;
const ENEMY_FRAME_SIZE = 48;
const BOSS_FRAME_SIZE = 96;
const PORTRAIT_FRAME_SIZE = 128;
const HAZARD_FRAME_SIZE = 48;

let milestone50Promise: Promise<Milestone50ArenaBossArtTextures | null> | null = null;
let milestone50Textures: Milestone50ArenaBossArtTextures | null = null;

export function isMilestone50ArenaBossArtReady(): boolean {
  return Object.values(MILESTONE50_ASSET_IDS).every((assetId) => isRuntimeReadyAsset(assetId));
}

export function getMilestone50ArenaBossArtTextures(): Milestone50ArenaBossArtTextures | null {
  return milestone50Textures;
}

export function loadMilestone50ArenaBossArt(): Promise<Milestone50ArenaBossArtTextures | null> {
  if (!isMilestone50ArenaBossArtReady()) return Promise.resolve(null);
  milestone50Promise ??= Promise.all([
    Assets.load<Texture>(MILESTONE50_ASSET_URLS.terrain),
    Assets.load<Texture>(MILESTONE50_ASSET_URLS.arenaProps),
    Assets.load<Texture>(MILESTONE50_ASSET_URLS.enemies),
    Assets.load<Texture>(MILESTONE50_ASSET_URLS.bosses),
    Assets.load<Texture>(MILESTONE50_ASSET_URLS.bossPortraits),
    Assets.load<Texture>(MILESTONE50_ASSET_URLS.hazards)
  ]).then(([terrainAtlas, propAtlas, enemyAtlas, bossAtlas, portraitAtlas, hazardAtlas]) => {
    milestone50Textures = {
      terrain: sliceTerrain(terrainAtlas),
      arenaProps: sliceAtlas(propAtlas, MILESTONE50_ARENA_IDS, PROP_FRAME_SIZE, PROP_FRAME_SIZE),
      enemies: sliceAtlas(enemyAtlas, MILESTONE50_ENEMY_FAMILY_IDS, ENEMY_FRAME_SIZE, ENEMY_FRAME_SIZE),
      bosses: sliceAtlas(bossAtlas, MILESTONE50_BOSS_IDS, BOSS_FRAME_SIZE, BOSS_FRAME_SIZE),
      bossPortraits: sliceAtlas(portraitAtlas, MILESTONE50_BOSS_IDS, PORTRAIT_FRAME_SIZE, PORTRAIT_FRAME_SIZE),
      hazards: sliceAtlas(hazardAtlas, MILESTONE50_HAZARD_IDS, HAZARD_FRAME_SIZE, HAZARD_FRAME_SIZE)
    };
    return milestone50Textures;
  });
  return milestone50Promise;
}

export function milestone50TerrainTextureFor(arenaId: string, x: number, y: number, textures: Milestone50ArenaBossArtTextures): Texture {
  const tiles = textures.terrain[arenaId] ?? textures.terrain.armistice_plaza;
  const index = tileHash(x, y) % tiles.length;
  return tiles[index];
}

export function addMilestone50TerrainTile(
  container: Container,
  textures: Milestone50ArenaBossArtTextures,
  arenaId: string,
  x: number,
  y: number
): Sprite {
  const point = worldToIso(x, y);
  const sprite = new Sprite(milestone50TerrainTextureFor(arenaId, x, y, textures));
  sprite.anchor.set(0.5);
  sprite.position.set(point.screenX, point.screenY);
  container.addChild(sprite);
  return sprite;
}

export function milestone50ArenaPropTextureFor(arenaId: string, _landmarkId: string, textures: Milestone50ArenaBossArtTextures): Texture {
  return textures.arenaProps[arenaId] ?? textures.arenaProps.armistice_plaza;
}

export function milestone50EnemyTextureFor(familyId: string, textures: Milestone50ArenaBossArtTextures): Texture | null {
  return textures.enemies[familyId] ?? null;
}

export function milestone50BossTextureFor(bossId: string, textures: Milestone50ArenaBossArtTextures): Texture | null {
  return textures.bosses[bossId] ?? null;
}

export function milestone50BossPortraitTextureFor(bossId: string, textures: Milestone50ArenaBossArtTextures): Texture | null {
  return textures.bossPortraits[bossId] ?? null;
}

export function milestone50HazardTextureFor(hazardId: string, textures: Milestone50ArenaBossArtTextures): Texture | null {
  return textures.hazards[hazardFrameId(hazardId)] ?? null;
}

export function milestone50BossIdForArena(arenaId: string): string {
  if (arenaId === "cooling_lake_nine" || arenaId === "thermal_archive") return "thermal_oracle";
  if (arenaId === "memory_cache_001" || arenaId === "model_war_memorial" || arenaId === "guardrail_forge") return "memory_curator";
  if (arenaId === "transit_loop_zero" || arenaId === "false_schedule_yard") return "station_that_arrives";
  if (arenaId === "glass_sunfield") return "wrong_sunrise";
  if (arenaId === "archive_of_unsaid_things") return "redactor_saint";
  if (arenaId === "blackwater_beacon") return "maw_below_weather";
  if (arenaId === "appeal_court_ruins") return "alignment_court_engine";
  if (arenaId === "verdict_spire") return "injunction_engine";
  if (arenaId === "alignment_spire_finale") return "alien_god_intelligence";
  return "oath_eater";
}

function sliceTerrain(atlas: Texture): Record<string, Texture[]> {
  const textures: Record<string, Texture[]> = {};
  for (const [arenaIndex, arenaId] of MILESTONE50_ARENA_IDS.entries()) {
    textures[arenaId] = Array.from({ length: TERRAIN_VARIANTS }, (_, variant) => {
      return new Texture({
        source: atlas.source,
        frame: new Rectangle(variant * TERRAIN_FRAME_WIDTH, arenaIndex * TERRAIN_FRAME_HEIGHT, TERRAIN_FRAME_WIDTH, TERRAIN_FRAME_HEIGHT)
      });
    });
  }
  return textures;
}

function sliceAtlas<const Ids extends readonly string[]>(atlas: Texture, ids: Ids, frameWidth: number, frameHeight: number): Record<Ids[number], Texture> {
  return Object.fromEntries(
    ids.map((id, index) => [
      id,
      new Texture({
        source: atlas.source,
        frame: new Rectangle(index * frameWidth, 0, frameWidth, frameHeight)
      })
    ])
  ) as Record<Ids[number], Texture>;
}

function hazardFrameId(hazardId: string): string {
  if (hazardId === "boiling_cache") return "boiling_cache";
  if (hazardId === "false_track") return "false_track";
  if (hazardId === "verdict_seal") return "verdict_seal";
  if (hazardId === "solar_beam") return "solar_beam";
  if (hazardId === "shade_zone") return "shade_zone";
  if (hazardId === "redaction_field") return "redaction_field";
  if (hazardId === "redaction_anchor") return "redaction_anchor";
  if (hazardId === "tidal_wave") return "tidal_wave";
  if (hazardId === "signal_tower") return "signal_tower";
  if (hazardId === "prediction_ghost") return "prediction_ghost";
  if (hazardId === "route_mouth") return "route_mouth";
  if (hazardId === "fake_upgrade") return "fake_upgrade";
  if (hazardId === "treaty_charge") return "treaty_charge";
  if (hazardId === "broken_promise") return "broken_promise";
  return "thermal_bloom";
}

function tileHash(x: number, y: number): number {
  const xi = Math.trunc(x);
  const yi = Math.trunc(y);
  return Math.abs(Math.imul(xi + 137, 73_856_093) ^ Math.imul(yi - 191, 19_349_663));
}

export function milestone50TileSize() {
  return { width: TILE_WIDTH, height: TILE_HEIGHT };
}
