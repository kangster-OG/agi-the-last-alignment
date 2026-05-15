import audioManifestJson from "./audio_manifest.json";

export type AudioBus = "music" | "sfx" | "ui" | "stinger";

export interface AudioAssetEntry {
  id: string;
  path: string;
  src: string;
  bus: AudioBus;
  role: string;
  loop: boolean;
  volume: number;
  preload: boolean;
  cooldownMs?: number;
  maxConcurrent?: number;
  provenanceKey: string;
}

export interface AudioCueRoute {
  id: string;
  assetId: string;
  cueIds?: string[];
  cueKind?: string;
  cuePrefix?: string;
  musicState?: string;
  priority: number;
}

export interface AudioManifest {
  assetSet: string;
  policy: string;
  sourceRule: string;
  assets: AudioAssetEntry[];
  cueRoutes: AudioCueRoute[];
  musicStates: Record<string, string[]>;
}

const rawManifest = audioManifestJson as Omit<AudioManifest, "assets"> & {
  assets: Array<Omit<AudioAssetEntry, "src">>;
};

export const AUDIO_MANIFEST: AudioManifest = {
  ...rawManifest,
  assets: rawManifest.assets.map((asset) => ({
    ...asset,
    src: publicAudioUrl(asset.path)
  }))
};

export const AUDIO_ASSETS_BY_ID = new Map(AUDIO_MANIFEST.assets.map((asset) => [asset.id, asset]));

export function audioManifestCoverage() {
  const missingAssets = AUDIO_MANIFEST.assets.filter((asset) => !asset.src).map((asset) => asset.id);
  const routedAssetIds = new Set(AUDIO_MANIFEST.cueRoutes.map((route) => route.assetId));
  const musicAssetIds = new Set(Object.values(AUDIO_MANIFEST.musicStates).flat());
  const unroutedAssets = AUDIO_MANIFEST.assets
    .filter((asset) => asset.bus !== "music" && !routedAssetIds.has(asset.id))
    .map((asset) => asset.id);
  const unusedMusicAssets = AUDIO_MANIFEST.assets
    .filter((asset) => asset.bus === "music" && !musicAssetIds.has(asset.id))
    .map((asset) => asset.id);
  return {
    assetSet: AUDIO_MANIFEST.assetSet,
    policy: AUDIO_MANIFEST.policy,
    assetCount: AUDIO_MANIFEST.assets.length,
    cueRouteCount: AUDIO_MANIFEST.cueRoutes.length,
    musicStateCount: Object.keys(AUDIO_MANIFEST.musicStates).length,
    missingAssetUrlCount: missingAssets.length,
    missingAssets,
    unroutedAssets,
    unusedMusicAssets
  };
}

export function musicStateForRun(arenaId: string, phase: "run" | "threat" | "boss" = "run"): string {
  const family = musicFamilyForArena(arenaId);
  return `${phase}_${family}`;
}

export function musicFamilyForArena(arenaId: string): "armistice" | "kettle" | "transit" | "archive" {
  if (arenaId === "transit_loop_zero" || arenaId === "false_schedule_yard") return "transit";
  if (arenaId === "signal_coast" || arenaId === "blackwater_beacon" || arenaId === "cooling_lake_nine") return "kettle";
  if (
    arenaId === "memory_cache_001" ||
    arenaId === "guardrail_forge" ||
    arenaId === "glass_sunfield" ||
    arenaId === "archive_of_unsaid_things" ||
    arenaId === "appeal_court_ruins" ||
    arenaId === "alignment_spire_finale"
  ) {
    return "archive";
  }
  return "armistice";
}

function publicAudioUrl(assetPath: string): string {
  return assetPath.replace(/^public\//, "/");
}
