import { Howl, Howler } from "howler";
import type { FeedbackAudioRuntimeSnapshot, FeedbackCue, FeedbackSystem } from "../core/feedback";
import { AUDIO_ASSETS_BY_ID, AUDIO_MANIFEST, audioManifestCoverage, musicStateForRun, type AudioAssetEntry, type AudioCueRoute } from "./audioManifest";

export type AudioMusicMode = "silent" | "menu" | "grid" | "briefing" | "draft" | "summary" | "run" | "threat" | "boss" | "extraction";

export interface AudioMusicStateOptions {
  arenaId?: string;
  fadeMs?: number;
}

export interface AudioEngineSnapshot extends FeedbackAudioRuntimeSnapshot {
  policy: "premium_audio_v1_runtime_optional";
  assetSet: string;
  sourceRule: string;
  controls: string;
}

export class AudioEngine {
  private readonly howls = new Map<string, Howl>();
  private readonly activeMusic = new Set<string>();
  private readonly activeCounts = new Map<string, number>();
  private readonly cooldowns = new Map<string, number>();
  private readonly recentPlayed: string[] = [];
  private readonly suppressedByReason: Record<string, number> = {
    disabled: 0,
    missing_asset: 0,
    locked: 0,
    cooldown: 0,
    concurrency: 0
  };
  private readonly missingAssets = new Set<string>();
  private unlocked = false;
  private userGestureSeen = false;
  private currentMusicState = "silent";
  private currentArenaId = "armistice_plaza";
  private disposed = false;
  private readonly disabledByQuery: boolean;

  constructor(private readonly feedback: FeedbackSystem, params: URLSearchParams) {
    this.disabledByQuery = isDisabledQueryFlag(params, "audio");
    Howler.autoUnlock = true;
    this.feedback.onCue((cue) => this.onCue(cue));
    window.addEventListener("pointerdown", this.unlockFromUserGesture, { passive: true });
    window.addEventListener("touchend", this.unlockFromUserGesture, { passive: true });
    window.addEventListener("keydown", this.unlockFromUserGesture);
    this.publishSnapshot();
  }

  setMusicState(mode: AudioMusicMode, options: AudioMusicStateOptions = {}): void {
    if (options.arenaId) this.currentArenaId = options.arenaId;
    const stateId = this.resolveMusicStateId(mode);
    this.currentMusicState = stateId;
    if (!this.audioEnabled()) {
      this.publishSnapshot();
      return;
    }
    const targetLayers = new Set(AUDIO_MANIFEST.musicStates[stateId] ?? []);
    for (const assetId of targetLayers) this.startMusicLayer(assetId, options.fadeMs ?? 700);
    for (const assetId of [...this.activeMusic]) {
      if (!targetLayers.has(assetId)) this.stopMusicLayer(assetId, options.fadeMs ?? 700);
    }
    this.publishSnapshot();
  }

  snapshot(): AudioEngineSnapshot {
    const coverage = audioManifestCoverage();
    return {
      policy: "premium_audio_v1_runtime_optional",
      assetSet: AUDIO_MANIFEST.assetSet,
      sourceRule: AUDIO_MANIFEST.sourceRule,
      outputMode: this.outputMode(),
      unlocked: this.unlocked,
      userGestureSeen: this.userGestureSeen,
      usingWebAudio: Howler.usingWebAudio === true,
      currentMusicState: this.currentMusicState,
      activeLayers: [...this.activeMusic].sort(),
      recentPlayed: [...this.recentPlayed],
      suppressedCueCount: Object.values(this.suppressedByReason).reduce((sum, count) => sum + count, 0),
      missingAssets: [...this.missingAssets].sort(),
      manifestCoverage: {
        assetCount: coverage.assetCount,
        cueRouteCount: coverage.cueRouteCount,
        musicStateCount: coverage.musicStateCount,
        missingAssetUrlCount: coverage.missingAssetUrlCount
      },
      controls: "Audio unlocks on first key/click/touch; query audio=0 keeps dry hooks only; 1/2/3 adjust master/SFX/music volumes."
    };
  }

  dispose(): void {
    this.disposed = true;
    window.removeEventListener("pointerdown", this.unlockFromUserGesture);
    window.removeEventListener("touchend", this.unlockFromUserGesture);
    window.removeEventListener("keydown", this.unlockFromUserGesture);
    for (const howl of this.howls.values()) howl.unload();
    this.howls.clear();
    this.activeMusic.clear();
    this.publishSnapshot();
  }

  private onCue(cue: FeedbackCue): void {
    this.updateVolumes();
    const route = this.resolveCueRoute(cue);
    if (cue.musicState) this.setMusicState(cue.musicState as AudioMusicMode);
    if (route?.musicState) this.setMusicState(route.musicState as AudioMusicMode, { arenaId: arenaIdFromCue(cue.id) ?? this.currentArenaId });
    if (!route || cue.kind === "music") {
      this.publishSnapshot();
      return;
    }
    this.playAsset(route.assetId, route, cue);
  }

  private resolveCueRoute(cue: FeedbackCue): AudioCueRoute | undefined {
    const exact = AUDIO_MANIFEST.cueRoutes.find((route) => route.cueIds?.includes(cue.id));
    if (exact) return exact;
    const prefix = AUDIO_MANIFEST.cueRoutes.find((route) => route.cuePrefix && cue.id.startsWith(route.cuePrefix));
    if (prefix) return prefix;
    return AUDIO_MANIFEST.cueRoutes.find((route) => route.cueKind === cue.kind);
  }

  private playAsset(assetId: string, route: AudioCueRoute, cue: FeedbackCue): void {
    if (!this.audioEnabled()) {
      this.suppress("disabled");
      return;
    }
    if (!this.unlocked) {
      this.suppress("locked");
      return;
    }
    const asset = AUDIO_ASSETS_BY_ID.get(assetId);
    if (!asset?.src) {
      this.missingAssets.add(assetId);
      this.suppress("missing_asset");
      return;
    }
    const now = performance.now();
    const cooldownKey = cue.cooldownKey ?? route.id;
    const cooldownUntil = this.cooldowns.get(cooldownKey) ?? 0;
    const cooldownMs = asset.cooldownMs ?? 0;
    if (now < cooldownUntil) {
      this.suppress("cooldown");
      return;
    }
    const activeCount = this.activeCounts.get(assetId) ?? 0;
    if (activeCount >= (asset.maxConcurrent ?? 4)) {
      this.suppress("concurrency");
      return;
    }
    const howl = this.ensureHowl(asset);
    if (!howl) return;
    howl.volume(this.volumeFor(asset));
    const playbackId = howl.play();
    this.cooldowns.set(cooldownKey, now + cooldownMs);
    this.activeCounts.set(assetId, activeCount + 1);
    howl.once("end", () => {
      this.activeCounts.set(assetId, Math.max(0, (this.activeCounts.get(assetId) ?? 1) - 1));
      this.publishSnapshot();
    }, playbackId);
    this.recordPlayed(`${cue.id}->${assetId}`);
    this.publishSnapshot();
  }

  private startMusicLayer(assetId: string, fadeMs: number): void {
    if (this.activeMusic.has(assetId)) return;
    const asset = AUDIO_ASSETS_BY_ID.get(assetId);
    if (!asset?.src) {
      this.missingAssets.add(assetId);
      this.suppress("missing_asset");
      return;
    }
    if (!this.unlocked) {
      this.suppress("locked");
      return;
    }
    const howl = this.ensureHowl(asset);
    if (!howl) return;
    howl.loop(true);
    howl.volume(0);
    howl.play();
    howl.fade(0, this.volumeFor(asset), fadeMs);
    this.activeMusic.add(assetId);
    this.recordPlayed(`music:${assetId}`);
  }

  private stopMusicLayer(assetId: string, fadeMs: number): void {
    const asset = AUDIO_ASSETS_BY_ID.get(assetId);
    const howl = this.howls.get(assetId);
    if (!asset || !howl) {
      this.activeMusic.delete(assetId);
      return;
    }
    const currentVolume = this.volumeFor(asset);
    howl.fade(currentVolume, 0, fadeMs);
    window.setTimeout(() => {
      howl.stop();
      this.activeMusic.delete(assetId);
      this.publishSnapshot();
    }, fadeMs + 40);
  }

  private ensureHowl(asset: AudioAssetEntry): Howl | null {
    const existing = this.howls.get(asset.id);
    if (existing) return existing;
    if (!asset.src) {
      this.missingAssets.add(asset.id);
      this.suppress("missing_asset");
      return null;
    }
    const howl = new Howl({
      src: [asset.src],
      loop: asset.loop,
      volume: this.volumeFor(asset),
      preload: asset.preload,
      html5: false
    });
    this.howls.set(asset.id, howl);
    return howl;
  }

  private preloadPromptAssets(): void {
    for (const asset of AUDIO_MANIFEST.assets) {
      if (asset.preload && asset.src) this.ensureHowl(asset);
    }
  }

  private updateVolumes(): void {
    const settings = this.feedback.audioSettings();
    Howler.volume(settings.masterVolume);
    for (const [assetId, howl] of this.howls) {
      const asset = AUDIO_ASSETS_BY_ID.get(assetId);
      if (asset) howl.volume(this.volumeFor(asset));
    }
    this.publishSnapshot();
  }

  private volumeFor(asset: AudioAssetEntry): number {
    const settings = this.feedback.audioSettings();
    const busVolume = asset.bus === "music" ? settings.musicVolume : settings.sfxVolume;
    return clamp(asset.volume * busVolume, 0, 1);
  }

  private resolveMusicStateId(mode: AudioMusicMode): string {
    if (mode === "run" || mode === "threat" || mode === "boss") return musicStateForRun(this.currentArenaId, mode);
    return mode;
  }

  private audioEnabled(): boolean {
    return !this.disabledByQuery && this.feedback.audioSettings().enabled;
  }

  private outputMode(): FeedbackAudioRuntimeSnapshot["outputMode"] {
    const settings = this.feedback.audioSettings();
    if (this.disabledByQuery) return "audio_disabled_by_query";
    if (!settings.enabled || settings.masterVolume <= 0) return "muted_by_volume";
    return this.unlocked ? "howler_runtime_unlocked" : "howler_waiting_for_user_unlock";
  }

  private suppress(reason: keyof AudioEngine["suppressedByReason"]): void {
    this.suppressedByReason[reason] += 1;
    this.publishSnapshot();
  }

  private recordPlayed(label: string): void {
    this.recentPlayed.unshift(label);
    this.recentPlayed.splice(12);
  }

  private publishSnapshot(): void {
    if (this.disposed) return;
    this.feedback.setAudioRuntimeSnapshot(this.snapshot());
  }

  private unlockFromUserGesture = (): void => {
    this.userGestureSeen = true;
    if (!this.audioEnabled()) {
      this.publishSnapshot();
      return;
    }
    this.unlocked = true;
    void Howler.ctx?.resume?.();
    this.preloadPromptAssets();
    this.updateVolumes();
    this.setMusicState(this.currentMusicState as AudioMusicMode, { arenaId: this.currentArenaId, fadeMs: 250 });
    this.publishSnapshot();
  };
}

export function createAudioEngine(feedback: FeedbackSystem, params: URLSearchParams): AudioEngine {
  return new AudioEngine(feedback, params);
}

function arenaIdFromCue(cueId: string): string | null {
  const match = /^music\.([^.]+)\./.exec(cueId) ?? /^online\.([^.]+)\./.exec(cueId);
  return match?.[1] ?? null;
}

function isDisabledQueryFlag(params: URLSearchParams, key: string): boolean {
  const value = params.get(key)?.toLowerCase();
  return value === "0" || value === "false" || value === "no" || value === "off";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
