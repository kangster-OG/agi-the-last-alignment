export type CampaignDurationPhaseId =
  | "opening"
  | "build_online"
  | "objective_cycle_1"
  | "elite_cache"
  | "objective_cycle_2"
  | "boss_pressure"
  | "extraction_panic";

export interface CampaignDurationPhase {
  id: CampaignDurationPhaseId;
  label: string;
  startsAt: number;
  endsAt: number;
}

export interface CampaignDurationProfileRow {
  targetSeconds: number;
  bossSeconds: number;
  extractionTailSeconds: number;
  midRunRewardBeats: number[];
}

export interface CampaignDurationProfile extends CampaignDurationProfileRow {
  arenaId: keyof typeof CAMPAIGN_DURATION_PROFILES;
  expectedClearBand: string;
  phases: CampaignDurationPhase[];
}

export const CAMPAIGN_DURATION_TOTAL_TARGET_SECONDS = 6300;

export const CAMPAIGN_DURATION_PROFILES = {
  armistice_plaza: { targetSeconds: 300, bossSeconds: 190, extractionTailSeconds: 35, midRunRewardBeats: [120, 245] },
  cooling_lake_nine: { targetSeconds: 420, bossSeconds: 255, extractionTailSeconds: 45, midRunRewardBeats: [135, 255, 335] },
  transit_loop_zero: { targetSeconds: 420, bossSeconds: 250, extractionTailSeconds: 45, midRunRewardBeats: [130, 250, 335] },
  signal_coast: { targetSeconds: 480, bossSeconds: 290, extractionTailSeconds: 55, midRunRewardBeats: [150, 290, 385] },
  blackwater_beacon: { targetSeconds: 540, bossSeconds: 325, extractionTailSeconds: 65, midRunRewardBeats: [165, 325, 440] },
  memory_cache_001: { targetSeconds: 600, bossSeconds: 360, extractionTailSeconds: 70, midRunRewardBeats: [180, 360, 500] },
  guardrail_forge: { targetSeconds: 600, bossSeconds: 360, extractionTailSeconds: 70, midRunRewardBeats: [180, 360, 500] },
  glass_sunfield: { targetSeconds: 660, bossSeconds: 400, extractionTailSeconds: 85, midRunRewardBeats: [200, 400, 535] },
  archive_of_unsaid_things: { targetSeconds: 660, bossSeconds: 400, extractionTailSeconds: 85, midRunRewardBeats: [200, 400, 535] },
  appeal_court_ruins: { targetSeconds: 720, bossSeconds: 435, extractionTailSeconds: 100, midRunRewardBeats: [220, 435, 590] },
  alignment_spire_finale: { targetSeconds: 900, bossSeconds: 585, extractionTailSeconds: 135, midRunRewardBeats: [210, 405, 585, 765] }
} as const satisfies Record<string, CampaignDurationProfileRow>;

export type CampaignDurationArenaId = keyof typeof CAMPAIGN_DURATION_PROFILES;

const PHASE_LABELS: Record<CampaignDurationPhaseId, string> = {
  opening: "Opening route read",
  build_online: "Build online",
  objective_cycle_1: "Objective cycle I",
  elite_cache: "Elite cache pressure",
  objective_cycle_2: "Objective cycle II",
  boss_pressure: "Boss pressure",
  extraction_panic: "Extraction panic"
};

function clampPhaseTime(value: number, previous: number, targetSeconds: number): number {
  return Math.max(previous + 1, Math.min(targetSeconds, Math.round(value)));
}

function buildPhases(row: CampaignDurationProfileRow): CampaignDurationPhase[] {
  const beats = row.midRunRewardBeats;
  const extractionStart = Math.max(row.bossSeconds + 1, row.targetSeconds - row.extractionTailSeconds);
  const boundaries = [
    0,
    clampPhaseTime(row.targetSeconds * 0.16, 0, row.targetSeconds),
    clampPhaseTime(beats[0] ?? row.targetSeconds * 0.32, 1, row.targetSeconds),
    clampPhaseTime(beats[1] ?? row.targetSeconds * 0.5, 2, row.targetSeconds),
    clampPhaseTime(beats[2] ?? (row.bossSeconds + extractionStart) * 0.5, 3, row.targetSeconds),
    clampPhaseTime(row.bossSeconds, 4, row.targetSeconds),
    clampPhaseTime(extractionStart, 5, row.targetSeconds),
    row.targetSeconds
  ];
  const ids: CampaignDurationPhaseId[] = ["opening", "build_online", "objective_cycle_1", "elite_cache", "objective_cycle_2", "boss_pressure", "extraction_panic"];
  return ids.map((id, index) => ({
    id,
    label: PHASE_LABELS[id],
    startsAt: Math.min(boundaries[index], row.targetSeconds - 1),
    endsAt: Math.max(boundaries[index + 1], Math.min(boundaries[index] + 1, row.targetSeconds))
  }));
}

export function campaignDurationProfileForArena(arenaId: string): CampaignDurationProfile | null {
  if (!(arenaId in CAMPAIGN_DURATION_PROFILES)) return null;
  const id = arenaId as CampaignDurationArenaId;
  const row = CAMPAIGN_DURATION_PROFILES[id];
  return {
    arenaId: id,
    ...row,
    expectedClearBand: `${Math.round(row.targetSeconds * 0.92)}-${Math.round(row.targetSeconds * 1.08)}s`,
    phases: buildPhases(row)
  };
}

export function campaignDurationPhaseAt(profile: CampaignDurationProfile, seconds: number): CampaignDurationPhase {
  return profile.phases.find((phase) => seconds >= phase.startsAt && seconds < phase.endsAt) ?? profile.phases[profile.phases.length - 1];
}
