import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "src/audio/audio_manifest.json");
const provenancePath = path.join(root, "AUDIO_PROVENANCE.md");
const packagePath = path.join(root, "package.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const provenance = fs.readFileSync(provenancePath, "utf8");
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

assert(pkg.dependencies?.howler, "expected howler runtime dependency");
assert(manifest.assetSet === "agi_audio_v1_original_synthesis", "expected AGI audio V1 asset set");
assert(manifest.assets.length >= 42, "expected V1.1 music/SFX/stinger coverage");
assert(Object.keys(manifest.musicStates).includes("boss_armistice"), "expected boss music state coverage");
assert(Object.keys(manifest.musicStates).includes("extraction"), "expected extraction music state coverage");

const assetIds = new Set();
let totalBytes = 0;
for (const asset of manifest.assets) {
  assert(asset.id && !assetIds.has(asset.id), `duplicate or missing asset id: ${asset.id}`);
  assetIds.add(asset.id);
  assert(asset.path?.startsWith("public/audio/"), `audio asset path must stay under public/audio: ${asset.id}`);
  assert(asset.path.endsWith(".wav"), `audio asset should be a generated WAV in V1: ${asset.path}`);
  assert(asset.provenanceKey, `missing provenance key for ${asset.id}`);
  assert(provenance.includes(asset.provenanceKey), `provenance key not documented: ${asset.provenanceKey}`);
  const absolute = path.join(root, asset.path);
  assert(fs.existsSync(absolute), `missing audio file: ${asset.path}`);
  const stat = fs.statSync(absolute);
  assert(stat.size > 8_000, `audio file too small to be a valid production cue: ${asset.path}`);
  totalBytes += stat.size;
}

assert(totalBytes < 25 * 1024 * 1024, `V1 audio payload too large for browser-first pass: ${totalBytes} bytes`);

for (const route of manifest.cueRoutes) {
  assert(assetIds.has(route.assetId), `cue route points to missing asset: ${route.id} -> ${route.assetId}`);
  assert(route.cueIds || route.cueKind || route.cuePrefix, `cue route has no matcher: ${route.id}`);
}

for (const [stateId, layerIds] of Object.entries(manifest.musicStates)) {
  assert(Array.isArray(layerIds), `music state must be an array: ${stateId}`);
  for (const assetId of layerIds) {
    assert(assetIds.has(assetId), `music state points to missing asset: ${stateId} -> ${assetId}`);
  }
}

assert(
  manifest.cueRoutes.some((route) => route.cueIds?.includes("extraction.open") && route.musicState === "extraction"),
  "expected extraction cue to switch music state"
);
assert(
  manifest.cueRoutes.some((route) => route.cueKind === "boss_warning" && route.musicState === "boss"),
  "expected boss warning cue to switch boss music"
);
assert(
  manifest.cueRoutes.some((route) => route.cueIds?.includes("combat.weapon_hit.signal_choir") && route.assetId === "sfx.weapon.signal_choir"),
  "expected evolution-specific Signal Choir weapon audio route"
);
assert(
  manifest.cueRoutes.some((route) => route.cueIds?.includes("combat.weapon_hit.time_deferred_minefield") && route.assetId === "sfx.weapon.time_minefield"),
  "expected evolution-specific Time-Deferred Minefield audio route"
);
assert(
  manifest.cueRoutes.some((route) => route.cueIds?.includes("combat.player_damage.projectile") && route.assetId === "sfx.player.projectile_damage"),
  "expected player projectile damage audio route"
);
assert(
  manifest.cueRoutes.some((route) => route.cueIds?.includes("objective.window_tick") && route.assetId === "sfx.objective.window"),
  "expected objective window audio route"
);

console.log(JSON.stringify({
  proof: "audio-runtime-static",
  assetSet: manifest.assetSet,
  assets: manifest.assets.length,
  cueRoutes: manifest.cueRoutes.length,
  musicStates: Object.keys(manifest.musicStates).length,
  totalBytes
}, null, 2));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
