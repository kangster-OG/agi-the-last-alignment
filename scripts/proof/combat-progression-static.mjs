import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");

function read(path) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(text, needle, label) {
  assert(text.includes(needle), `${label} missing ${needle}`);
}

const gameplayUpgrades = read("src/gameplay/upgrades.ts");
const contentUpgrades = read("src/content/upgrades.ts");
const weapons = read("src/gameplay/weapons.ts");
const levelRun = read("src/level/LevelRunState.ts");
const draftUi = read("src/ui/draft.ts");
const codex = read("src/roguelite/protocolCodex.ts");
const proofText = read("src/proof/renderGameToText.ts");
const classes = read("src/content/classes.ts");
const buildKits = read("src/content/buildKits.ts");

[
  "weaponRanks",
  "utilityPicksTaken",
  "hpRestoredFromDrafts",
  "burstRestoredFromDrafts",
  "draftRerollsSpent",
  "cachedCardId",
  "overcapOffersBlocked",
  "rankUpOffersSeen",
  "coreReplacementsOffered"
].forEach((field) => assertIncludes(gameplayUpgrades, field, "BuildStats progression telemetry"));

[
  "field_triage",
  "burst_cell_refill",
  "emergency_patch_cache",
  "lock_a_protocol",
  "second_opinion"
].forEach((id) => assertIncludes(gameplayUpgrades, id, "utility cache id"));

[
  "signal_choir",
  "time_deferred_minefield",
  "field_triage_loop",
  "route_memory",
  "weakest_link_scanner",
  "panic_window",
  "low_hp_adversary",
  "co_op_relay"
].forEach((id) => {
  assertIncludes(gameplayUpgrades, id, "gameplay upgrade");
  assertIncludes(contentUpgrades, id, "content upgrade");
});

assertIncludes(gameplayUpgrades, 'return "RANK UP"', "rank-up draft action");
assertIncludes(gameplayUpgrades, '"REPLACE CORE"', "core replacement draft action");
assertIncludes(gameplayUpgrades, 'return "UTILITY CACHE"', "utility cache draft action");
assertIncludes(gameplayUpgrades, "WEAPON_RANK_CAP = 5", "weapon rank cap");
assertIncludes(gameplayUpgrades, "installPrimaryWeapon", "explicit core install/replace helper");
assertIncludes(gameplayUpgrades, "rankWeaponUp", "weapon rank-up helper");
assertIncludes(gameplayUpgrades, "canDraftUpgradeForBuild", "slot cap legality filter");

assertIncludes(draftUi, 'input.wasPressed("retry")', "reroll input");
assertIncludes(draftUi, "reroll(game)", "reroll handler");
assertIncludes(draftUi, "utility_cache_draft", "utility reward telemetry");
assertIncludes(draftUi, "applyUtilityDraftEffect", "utility runtime effects");
assertIncludes(draftUi, "draftActionForUpgradeId", "draft action label wiring");

assertIncludes(levelRun, "applyUtilityDraftEffect", "utility effects in run state");
assertIncludes(levelRun, "healPlayerFromDraft", "draft healing telemetry");
assertIncludes(levelRun, "secondOpinionShield", "second opinion survival rule");
assertIncludes(levelRun, "applyClassProtocolIdentity", "class structural identity hook");
assertIncludes(levelRun, "setStartingWeaponRank", "starting weapon rank telemetry");

assertIncludes(weapons, "weaponRank", "weapon rank combat hook");
assertIncludes(weapons, "signal choir", "Signal Choir combat label");
assertIncludes(weapons, "time deferred minefield", "Time-Deferred Minefield combat label");

assertIncludes(codex, "recipe_signal_choir", "Signal Choir codex recipe");
assertIncludes(codex, "recipe_time_deferred_minefield", "Time-Deferred Minefield codex recipe");
assertIncludes(codex, "causal_railgun", "Causal Railgun preserved recipe");
assertIncludes(codex, "cathedral_of_no", "Cathedral of No preserved recipe");

[
  "weaponRanks",
  "utilityPicksTaken",
  "hpRestoredFromDrafts",
  "burstRestoredFromDrafts",
  "rerollsSpent",
  "cachedCardId",
  "overcapOffersBlocked",
  "draftAction"
].forEach((field) => assertIncludes(proofText, field, "render_game_to_text progression field"));

assertIncludes(classes, "Signal Choir", "class identity evolution text");
assertIncludes(classes, "Time-Deferred Minefield", "class identity evolution text");
assertIncludes(buildKits, "route_memory", "build kit structural passive");
assertIncludes(buildKits, "field_triage_loop", "build kit sustain passive");

console.log("combat-progression-static proof passed");
