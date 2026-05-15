export type FeedbackCueKind = "ui" | "hit" | "pickup" | "boss_warning" | "music" | "objective" | "summary";

export interface FeedbackCueOptions {
  intensity?: number;
  priority?: number;
  worldX?: number;
  worldY?: number;
  cooldownKey?: string;
  musicState?: string;
}

export interface FeedbackCue {
  id: string;
  kind: FeedbackCueKind;
  atMs: number;
  intensity?: number;
  priority?: number;
  worldX?: number;
  worldY?: number;
  cooldownKey?: string;
  musicState?: string;
}

export type FeedbackCueListener = (cue: FeedbackCue) => void;

export type FeedbackAudioOutputMode =
  | "dry_hooks_until_user_audio_unlock"
  | "howler_waiting_for_user_unlock"
  | "howler_runtime_unlocked"
  | "audio_disabled_by_query"
  | "muted_by_volume";

export interface FeedbackAudioRuntimeSnapshot {
  outputMode: FeedbackAudioOutputMode;
  unlocked: boolean;
  userGestureSeen: boolean;
  usingWebAudio: boolean;
  currentMusicState: string;
  activeLayers: string[];
  recentPlayed: string[];
  suppressedCueCount: number;
  missingAssets: string[];
  manifestCoverage: {
    assetCount: number;
    cueRouteCount: number;
    musicStateCount: number;
    missingAssetUrlCount: number;
  };
}

export interface FeedbackSnapshot {
  policy: "audio_juice_feel_1_0_runtime_only";
  persistenceBoundary: "settings_query_or_runtime_only_not_route_profile";
  audio: {
    enabled: boolean;
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    outputMode: FeedbackAudioOutputMode;
    hooks: string[];
    runtime: FeedbackAudioRuntimeSnapshot | null;
  };
  accessibility: {
    reducedFlash: boolean;
    screenShake: boolean;
    maxFlashAlpha: number;
    hitPauseMs: number;
    maxTransientParticlesPerFrame: number;
  };
  counters: Record<FeedbackCueKind, number>;
  recentCues: FeedbackCue[];
  controls: string;
}

const FEEDBACK_KINDS: FeedbackCueKind[] = ["ui", "hit", "pickup", "boss_warning", "music", "objective", "summary"];

export class FeedbackSystem {
  private audioEnabled: boolean;
  private masterVolume: number;
  private sfxVolume: number;
  private musicVolume: number;
  private reducedFlash: boolean;
  private screenShake: boolean;
  private readonly counters: Record<FeedbackCueKind, number> = {
    ui: 0,
    hit: 0,
    pickup: 0,
    boss_warning: 0,
    music: 0,
    objective: 0,
    summary: 0
  };
  private readonly recentCues: FeedbackCue[] = [];
  private readonly listeners = new Set<FeedbackCueListener>();
  private audioRuntime: FeedbackAudioRuntimeSnapshot | null = null;

  constructor(params: URLSearchParams) {
    this.audioEnabled = !isDisabledQueryFlag(params, "audio");
    this.masterVolume = volumeParam(params, "masterVolume", 0.72);
    this.sfxVolume = volumeParam(params, "sfxVolume", 0.82);
    this.musicVolume = volumeParam(params, "musicVolume", 0.55);
    this.reducedFlash = isEnabledQueryFlag(params, "reducedFlash") || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
    this.screenShake = !isDisabledQueryFlag(params, "screenShake") && !this.reducedFlash;
  }

  cue(id: string, kind: FeedbackCueKind, options: FeedbackCueOptions = {}): void {
    this.counters[kind] += 1;
    const cue = {
      id,
      kind,
      atMs: Math.floor(performance.now()),
      intensity: options.intensity,
      priority: options.priority,
      worldX: options.worldX,
      worldY: options.worldY,
      cooldownKey: options.cooldownKey,
      musicState: options.musicState
    };
    this.recentCues.unshift(cue);
    this.recentCues.splice(8);
    for (const listener of this.listeners) listener(cue);
  }

  onCue(listener: FeedbackCueListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setAudioRuntimeSnapshot(snapshot: FeedbackAudioRuntimeSnapshot): void {
    this.audioRuntime = snapshot;
  }

  audioSettings(): { enabled: boolean; masterVolume: number; sfxVolume: number; musicVolume: number } {
    return {
      enabled: this.audioEnabled && this.masterVolume > 0,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume
    };
  }

  cycleMasterVolume(): void {
    this.masterVolume = nextVolume(this.masterVolume, [0, 0.35, 0.72, 1]);
    this.audioEnabled = this.masterVolume > 0;
    this.cue("settings.master_volume", "ui");
  }

  cycleSfxVolume(): void {
    this.sfxVolume = nextVolume(this.sfxVolume, [0, 0.4, 0.82, 1]);
    this.cue("settings.sfx_volume", "ui");
  }

  cycleMusicVolume(): void {
    this.musicVolume = nextVolume(this.musicVolume, [0, 0.3, 0.55, 0.85]);
    this.cue("settings.music_volume", "ui");
  }

  toggleReducedFlash(): void {
    this.reducedFlash = !this.reducedFlash;
    if (this.reducedFlash) this.screenShake = false;
    this.cue("settings.reduced_flash", "ui");
  }

  snapshot(): FeedbackSnapshot {
    return {
      policy: "audio_juice_feel_1_0_runtime_only",
      persistenceBoundary: "settings_query_or_runtime_only_not_route_profile",
      audio: {
        enabled: this.audioEnabled && this.masterVolume > 0,
        masterVolume: round(this.masterVolume),
        sfxVolume: round(this.sfxVolume),
        musicVolume: round(this.musicVolume),
        outputMode: this.audioRuntime?.outputMode ?? "dry_hooks_until_user_audio_unlock",
        hooks: ["ui_click", "weapon_hit", "pickup_chime", "boss_warning", "route_music", "objective_tick", "summary_stinger"],
        runtime: this.audioRuntime
      },
      accessibility: {
        reducedFlash: this.reducedFlash,
        screenShake: this.screenShake,
        maxFlashAlpha: this.reducedFlash ? 0.08 : 0.18,
        hitPauseMs: this.reducedFlash ? 0 : 18,
        maxTransientParticlesPerFrame: this.reducedFlash ? 36 : 72
      },
      counters: { ...this.counters },
      recentCues: [...this.recentCues],
      controls: "Main menu: 1 master volume, 2 SFX volume, 3 music volume, 4 reduced flash."
    };
  }
}

export function createFeedbackSystem(params: URLSearchParams): FeedbackSystem {
  return new FeedbackSystem(params);
}

function volumeParam(params: URLSearchParams, key: string, fallback: number): number {
  const value = Number(params.get(key));
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

function nextVolume(current: number, values: number[]): number {
  const index = values.findIndex((value) => current <= value + 0.01);
  return values[(index + 1) % values.length] ?? values[0] ?? 0;
}

function isEnabledQueryFlag(params: URLSearchParams, key: string): boolean {
  const value = params.get(key)?.toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function isDisabledQueryFlag(params: URLSearchParams, key: string): boolean {
  const value = params.get(key)?.toLowerCase();
  return value === "0" || value === "false" || value === "no" || value === "off";
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
