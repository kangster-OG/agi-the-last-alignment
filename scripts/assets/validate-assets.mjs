import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const manifestPath = path.join(cwd, "assets", "asset_manifest.json");
const provenancePath = path.join(cwd, "ART_PROVENANCE.md");

const allowedStatuses = new Set(["planned", "concept", "raw", "cleaned", "production", "code_placeholder"]);
const allowedCategories = new Set([
  "concept_art",
  "player_sprite",
  "enemy_sprite",
  "boss_sprite",
  "pickup_sprite",
  "map_tile",
  "landmark_prop",
  "overworld_landmark",
  "ui",
  "portrait",
  "faction_logo_placeholder",
  "third_party_logo"
]);

const requiredFolders = [
  "assets/concepts",
  "assets/sprites/players",
  "assets/sprites/enemies",
  "assets/sprites/bosses",
  "assets/sprites/pickups",
  "assets/tiles/armistice_plaza",
  "assets/props/armistice_plaza",
  "assets/props/alignment_grid",
  "assets/ui",
  "assets/portraits",
  "assets/third_party/logos"
];

const requiredIds = [
  "concept.accord_striker.art_direction_brief",
  "concept.armistice_plaza.ground_atlas_brief",
  "player.accord_striker.placeholder_frame",
  "player.accord_striker.production_walk_sheet",
  "boss.oath_eater.placeholder_sprite",
  "portrait.oath_eater.placeholder_title_card",
  "enemy.bad_outputs.placeholder_family",
  "enemy.benchmark_gremlin.placeholder_family",
  "enemy.context_rot_crab.placeholder_family",
  "pickup.coherence_shard.placeholder",
  "tile.armistice_plaza.ground_placeholder_set",
  "tile.armistice_plaza.production_ground_atlas",
  "prop.armistice_plaza.treaty_monument_placeholder",
  "prop.armistice_plaza.barricade_corridor_placeholder",
  "prop.armistice_plaza.crashed_drone_yard_placeholder",
  "prop.armistice_plaza.emergency_alignment_terminal_placeholder",
  "prop.armistice_plaza.cosmic_breach_crack_placeholder",
  "prop.alignment_grid.node_landmarks_placeholder_set",
  "ui.portrait_slot.placeholder",
  "ui.emergency_patch.card_placeholder",
  "faction_logo.placeholder.openai_accord",
  "third_party.logo.openai.official",
  "third_party.logo.anthropic.official",
  "third_party.logo.google_deepmind.official",
  "third_party.logo.meta.official",
  "third_party.logo.xai.official",
  "third_party.logo.deepseek.official",
  "third_party.logo.mistral.official",
  "third_party.logo.alibaba_qwen.official"
];

const errors = [];
const warnings = [];

const runtimeAssetFolders = [
  "assets/tiles",
  "assets/props",
  "assets/sprites",
  "assets/ui",
  "assets/portraits"
];

for (const folder of runtimeAssetFolders) {
  const absolute = path.join(cwd, folder);
  if (!fs.existsSync(absolute)) continue;
  for (const file of walkFiles(absolute)) {
    if (path.extname(file).toLowerCase() !== ".png") continue;
    const stat = fs.statSync(file);
    if (stat.size === 0) {
      errors.push(`Runtime PNG is zero bytes and will break production-art loading: ${path.relative(cwd, file)}`);
    }
  }
}

for (const folder of requiredFolders) {
  const absolute = path.join(cwd, folder);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) {
    errors.push(`Missing required asset folder: ${folder}`);
  }
}

if (!fs.existsSync(manifestPath)) {
  fail([`Missing asset manifest: ${manifestPath}`]);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const provenance = fs.existsSync(provenancePath) ? fs.readFileSync(provenancePath, "utf8") : "";

if (!Number.isInteger(manifest.manifestVersion) || manifest.manifestVersion < 1) {
  errors.push("manifestVersion must be a positive integer.");
}
if (manifest.project !== "AGI: The Last Alignment") {
  errors.push("manifest project must be AGI: The Last Alignment.");
}
if (manifest.assetRoot !== "assets") {
  errors.push("manifest assetRoot must be assets.");
}
if (!manifest.idTaxonomy || typeof manifest.idTaxonomy !== "object") {
  errors.push("manifest idTaxonomy is required.");
}
if (!Array.isArray(manifest.assets)) {
  fail(["manifest assets must be an array."]);
}

const ids = new Set();
const entriesById = new Map();

for (const [index, asset] of manifest.assets.entries()) {
  const label = asset?.id ?? `assets[${index}]`;
  validateString(asset.id, `${label}.id`);
  validateString(asset.category, `${label}.category`);
  validateString(asset.intendedUse, `${label}.intendedUse`);
  validateString(asset.status, `${label}.status`);
  validateString(asset.sourcePath, `${label}.sourcePath`);
  validateString(asset.provenanceKey, `${label}.provenanceKey`);
  validateString(asset.licenseNote, `${label}.licenseNote`);
  validateString(asset.notes, `${label}.notes`);
  if (!Array.isArray(asset.tags) || asset.tags.some((tag) => typeof tag !== "string" || tag.length === 0)) {
    errors.push(`${label}.tags must be an array of non-empty strings.`);
  }
  if (typeof asset.mitIncluded !== "boolean") {
    errors.push(`${label}.mitIncluded must be boolean.`);
  }
  if (ids.has(asset.id)) {
    errors.push(`Duplicate asset id: ${asset.id}`);
  }
  ids.add(asset.id);
  entriesById.set(asset.id, asset);

  if (!allowedStatuses.has(asset.status)) {
    errors.push(`${label}.status is not an allowed status: ${asset.status}`);
  }
  if (!allowedCategories.has(asset.category)) {
    errors.push(`${label}.category is not an allowed category: ${asset.category}`);
  }

  if (asset.status !== "planned") {
    const sourceAbsolute = path.join(cwd, asset.sourcePath);
    if (!fs.existsSync(sourceAbsolute)) {
      errors.push(`${label} references missing sourcePath for non-planned asset: ${asset.sourcePath}`);
    }
  }

  if (["production", "cleaned", "raw", "concept", "code_placeholder"].includes(asset.status) && !provenance.includes(asset.provenanceKey)) {
    errors.push(`${label} provenanceKey is not documented in ART_PROVENANCE.md: ${asset.provenanceKey}`);
  }

  if (asset.category === "third_party_logo") {
    if (!asset.id.startsWith("third_party.logo.")) {
      errors.push(`${label} third-party logo ids must start with third_party.logo.`);
    }
    if (!asset.sourcePath.startsWith("assets/third_party/logos/")) {
      errors.push(`${label} third-party logos must live under assets/third_party/logos/.`);
    }
    if (asset.mitIncluded !== false) {
      errors.push(`${label} third-party logos must use mitIncluded: false unless a later policy explicitly changes validation.`);
    }
    const note = asset.licenseNote.toLowerCase();
    if (!note.includes("third-party") || !note.includes("not original") || !note.includes("not mit")) {
      errors.push(`${label} third-party logo licenseNote must state third-party, not original, and not MIT-included ownership.`);
    }
  }

  if (asset.status === "production") {
    if (asset.category !== "ui" && !asset.dimensions) {
      warnings.push(`${label} is production but dimensions are unknown.`);
    }
    if (!provenance.includes(asset.provenanceKey)) {
      errors.push(`${label} production asset must have a provenance record.`);
    }
  }
}

for (const requiredId of requiredIds) {
  if (!entriesById.has(requiredId)) {
    errors.push(`Missing required Milestone 9 asset id: ${requiredId}`);
  }
}

if (errors.length) {
  fail(errors);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      manifestVersion: manifest.manifestVersion,
      assetCount: manifest.assets.length,
      concepts: manifest.assets.filter((asset) => asset.status === "concept").length,
      raw: manifest.assets.filter((asset) => asset.status === "raw").length,
      cleaned: manifest.assets.filter((asset) => asset.status === "cleaned").length,
      production: manifest.assets.filter((asset) => asset.status === "production").length,
      planned: manifest.assets.filter((asset) => asset.status === "planned").length,
      codePlaceholders: manifest.assets.filter((asset) => asset.status === "code_placeholder").length,
      thirdPartyLogos: manifest.assets.filter((asset) => asset.category === "third_party_logo").length,
      warnings
    },
    null,
    2
  )
);

function validateString(value, pathLabel) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${pathLabel} must be a non-empty string.`);
  }
}

function* walkFiles(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const absolute = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(absolute);
    } else if (entry.isFile()) {
      yield absolute;
    }
  }
}

function fail(messages) {
  for (const message of messages) {
    console.error(`asset validation: ${message}`);
  }
  process.exit(1);
}
