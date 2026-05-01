import { ARENA_CONTENT } from "../content/arenas";

export interface ArenaData {
  id: string;
  name: string;
  regionId: string;
  factionFocusIds: string[];
  bossId?: string;
  enemyFamilyIds: string[];
  briefingLines: string[];
  visualHook: string;
  gameplayHook: string;
  halfSize: number;
  targetSeconds: number;
  bossSeconds: number;
}

export const ARENAS: Record<string, ArenaData> = Object.fromEntries(
  Object.values(ARENA_CONTENT).map((arena) => [
    arena.id,
    {
      id: arena.id,
      name: arena.displayName,
      regionId: arena.regionId,
      factionFocusIds: arena.factionFocusIds,
      bossId: arena.bossId,
      enemyFamilyIds: arena.enemyFamilyIds,
      briefingLines: arena.briefingLines,
      visualHook: arena.visualHook,
      gameplayHook: arena.gameplayHook,
      halfSize: arena.halfSize,
      targetSeconds: arena.targetSeconds,
      bossSeconds: arena.bossSeconds
    }
  ])
);
