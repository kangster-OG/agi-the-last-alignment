import type { Entity, Player } from "../ecs/components";
import type { WeaponRuntime } from "../gameplay/weapons";
import type { BuildStats } from "../gameplay/upgrades";
import type { BuildKitProof } from "../content";

export const CONSENSUS_CELL_MAX_PLAYERS = 4;

export type PlayerInputSource = "local_keyboard" | "local_simulated_peer";

export interface PlayerInputCommand {
  schemaVersion: 1;
  tick: number;
  playerId: string;
  sequence: number;
  axisX: number;
  axisY: number;
  dashPressed: boolean;
  interactPressed: boolean;
}

export interface ConsensusPlayerRuntime {
  id: string;
  slot: number;
  label: string;
  inputSource: PlayerInputSource;
  classId: string;
  factionId: string;
  buildKit: BuildKitProof;
  color: number;
  player: Player;
  build: BuildStats;
  weapon: WeaponRuntime;
  inputSequence: number;
  downed: boolean;
}

export interface ConsensusScaling {
  playerCount: number;
  enemyCapBonus: number;
  spawnBurstBonus: number;
  bossHpMultiplier: number;
  xpPolicy: "shared_cell";
}

export interface ConsensusStateSnapshot {
  schemaVersion: 1;
  tick: number;
  seconds: number;
  playerCount: number;
  scaling: ConsensusScaling;
  players: Array<{
    id: string;
    slot: number;
    label: string;
    classId: string;
    factionId: string;
    buildKit: BuildKitProof;
    inputSource: PlayerInputSource;
    worldX: number;
    worldY: number;
    hp: number;
    maxHp: number;
    xp: number;
    level: number;
    downed: boolean;
  }>;
  enemies: Array<{
    id: number;
    familyId: string;
    sourceRegionId: string;
    worldX: number;
    worldY: number;
    hp: number;
    boss: boolean;
  }>;
  pickups: Array<{ id: number; worldX: number; worldY: number; value: number }>;
  projectiles: Array<{ id: number; worldX: number; worldY: number; pierce: number }>;
}

export const CONSENSUS_SLOT_LOADOUTS = [
  { classId: "accord_striker", factionId: "openai_accord", color: 0x3498db, label: "P1" },
  { classId: "bastion_breaker", factionId: "anthropic_safeguard", color: 0xffd166, label: "P2" },
  { classId: "drone_reaver", factionId: "google_deepmind_gemini", color: 0x7b61ff, label: "P3" },
  { classId: "accord_striker", factionId: "mistral_cyclone", color: 0xff8f3d, label: "P4" }
] as const;

export function clampConsensusCellSize(size: number): number {
  return Math.max(1, Math.min(CONSENSUS_CELL_MAX_PLAYERS, Math.round(size)));
}

export function consensusScaling(playerCount: number): ConsensusScaling {
  const count = clampConsensusCellSize(playerCount);
  return {
    playerCount: count,
    enemyCapBonus: (count - 1) * 8,
    spawnBurstBonus: Math.max(0, count - 1),
    bossHpMultiplier: 1 + (count - 1) * 0.32,
    xpPolicy: "shared_cell"
  };
}

export function formationOffset(slot: number): { worldX: number; worldY: number } {
  const offsets = [
    { worldX: 0, worldY: 0 },
    { worldX: -1.1, worldY: 0.8 },
    { worldX: 1.1, worldY: 0.8 },
    { worldX: 0, worldY: -1.25 }
  ];
  return offsets[slot] ?? offsets[0];
}

export function roundForSnapshot(value: number): number {
  return Math.round(value * 100) / 100;
}

export function createConsensusSnapshot(args: {
  tick: number;
  seconds: number;
  players: ConsensusPlayerRuntime[];
  entities: Entity[];
  scaling: ConsensusScaling;
}): ConsensusStateSnapshot {
  return {
    schemaVersion: 1,
    tick: args.tick,
    seconds: roundForSnapshot(args.seconds),
    playerCount: args.players.length,
    scaling: args.scaling,
    players: args.players.map((runtime) => ({
      id: runtime.id,
      slot: runtime.slot,
      label: runtime.label,
      classId: runtime.classId,
      factionId: runtime.factionId,
      buildKit: runtime.buildKit,
      inputSource: runtime.inputSource,
      worldX: roundForSnapshot(runtime.player.worldX),
      worldY: roundForSnapshot(runtime.player.worldY),
      hp: Math.ceil(runtime.player.hp),
      maxHp: runtime.player.maxHp,
      xp: runtime.player.xp,
      level: runtime.player.level,
      downed: runtime.downed
    })),
    enemies: args.entities
      .filter((entity) => entity.active && entity.kind === "enemy")
      .slice(0, 18)
      .map((entity) => ({
        id: entity.id,
        familyId: entity.enemyFamilyId,
        sourceRegionId: entity.sourceRegionId,
        worldX: roundForSnapshot(entity.worldX),
        worldY: roundForSnapshot(entity.worldY),
        hp: Math.ceil(entity.hp),
        boss: entity.boss
      })),
    pickups: args.entities
      .filter((entity) => entity.active && entity.kind === "pickup")
      .slice(0, 12)
      .map((entity) => ({ id: entity.id, worldX: roundForSnapshot(entity.worldX), worldY: roundForSnapshot(entity.worldY), value: entity.value })),
    projectiles: args.entities
      .filter((entity) => entity.active && entity.kind === "projectile")
      .slice(0, 12)
      .map((entity) => ({ id: entity.id, worldX: roundForSnapshot(entity.worldX), worldY: roundForSnapshot(entity.worldY), pierce: entity.value }))
  };
}
