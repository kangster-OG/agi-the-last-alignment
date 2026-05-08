import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

const scenario = process.argv[2] ?? "smoke";
const cwd = process.cwd();
const outDir = path.join(cwd, "docs", "proof", scenario);
const port = 5173 + scenarioPortOffset(scenario);
const url = process.env.PROOF_BASE_URL ?? `http://127.0.0.1:${port}`;
const networkPort = 2567 + scenarioPortOffset(scenario);
const COOLING_SYSTEM_ITEM_IDS = ["coolant_baffles", "server_buoy_synchronizer", "prompt_leech_quarantine", "grounded_cable_boots"];
const SIGNAL_SYSTEM_ITEM_IDS = ["relay_phase_lock", "static_skimmer_net", "shoreline_stride", "lighthouse_countertone"];
const PROOF_SECONDARY_PROTOCOL_IDS = [
  "context_saw",
  "patch_mortar",
  "audit_swarm_protocol",
  "red_team_spike",
  "benchmark_rail",
  "jailbreak_snare",
  "fork_daemon",
  "coherence_lanterns",
  "appeal_writ",
  "memory_needle"
];
const ONLINE_ALIGNMENT_GRID_VOTE_ORDER = [
  "armistice_plaza",
  "accord_relay",
  "cooling_lake_nine",
  "model_war_memorial",
  "armistice_camp",
  "memory_cache_001",
  "archive_of_unsaid_things",
  "blackwater_beacon",
  "thermal_archive",
  "guardrail_forge",
  "transit_loop_zero",
  "signal_coast",
  "false_schedule_yard",
  "glass_sunfield",
  "verdict_spire",
  "appeal_court_ruins",
  "alignment_spire_finale"
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const server = process.env.PROOF_BASE_URL
  ? null
  : spawn("npm", ["run", "dev", "--", "--port", String(port), "--strictPort"], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, BROWSER: "none" }
    });

let coopServer = null;
let coopServerLog = "";
if (usesCoopServer(scenario)) {
  coopServer = spawn("npm", ["run", "server:coop"], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, CONSENSUS_PORT: String(networkPort) }
  });
  coopServer.stdout.on("data", (chunk) => {
    coopServerLog += chunk.toString();
  });
  coopServer.stderr.on("data", (chunk) => {
    coopServerLog += chunk.toString();
  });
}

let serverLog = "";
server?.stdout.on("data", (chunk) => {
  serverLog += chunk.toString();
});
server?.stderr.on("data", (chunk) => {
  serverLog += chunk.toString();
});

try {
  await waitForServer(url);
  if (scenario === "visual-fidelity-camera") {
    await delay(12000);
    await waitForServer(url);
  }
  if (usesCoopServer(scenario)) {
    await waitForReachable(`http://127.0.0.1:${networkPort}`);
  }
  await runScenario(scenario);
} finally {
  server?.kill("SIGTERM");
  coopServer?.kill("SIGTERM");
  fs.writeFileSync(path.join(outDir, "server.log"), serverLog);
  if (usesCoopServer(scenario)) {
    fs.writeFileSync(path.join(outDir, "coop-server.log"), coopServerLog);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runScenario(name) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  await page.waitForSelector("canvas");

  if (name === "smoke") {
    await capture(page, "menu");
    await press(page, "Enter", 4);
    await capture(page, "build-select");
    const buildText = await state(page);
    assert(buildText.mode === "BuildSelect", "expected build selection shell");
    assert(buildText.selectedBuild?.classId === "accord_striker", "expected Accord Striker starter class");
    assert(buildText.selectedBuild?.factionId === "openai_accord", "expected OpenAI starter co-mind");
    await press(page, "Enter", 4);
    await capture(page, "overworld");
    const overworldText = await state(page);
    assert(overworldText.overworld?.mapLabel === "The Alignment Grid", "expected Alignment Grid overworld");
    assert(overworldText.overworld?.nodes?.some((node) => node.id === "transit_loop_zero"), "expected Transit Loop Zero landmark node");
    assert(overworldText.overworld?.nodes?.some((node) => node.nodeType === "Faction Relay"), "expected Faction Relay node");
    assert(overworldText.overworld?.nodes?.some((node) => node.nodeType === "Refuge Camp" || node.nodeType === "Memory Cache"), "expected refuge or memory node");
    await press(page, "Enter", 4);
    await capture(page, "briefing");
    await press(page, "Enter", 4);
    await advance(page, 1200);
    await capture(page, "arena");
    const text = await state(page);
    assert(text.title === "AGI: The Last Alignment", "expected AGI title in state");
    assert(text.level?.arenaId === "armistice_plaza", "expected Armistice Plaza arena");
  } else if (name === "player-damage") {
    await page.goto(`${url}?productionArt=1&armisticeTiles=1&proofPlayerDamage=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    let text = await state(page);
    for (let elapsed = 0; elapsed < 2600; elapsed += 50) {
      if (text.mode === "LevelRun" && text.player?.hp < text.player?.maxHp && text.player?.damageFeedback?.flash > 0) break;
      await advance(page, 50);
      text = await state(page);
    }
    const capturedText = text;
    await page.screenshot({ path: path.join(outDir, "player-damage-contact.png"), fullPage: true });
    fs.writeFileSync(path.join(outDir, "player-damage-contact.json"), JSON.stringify(capturedText, null, 2));
    assert(capturedText.mode === "LevelRun", `expected LevelRun for player damage proof, got ${capturedText.mode}`);
    assert(capturedText.player?.hp < capturedText.player?.maxHp, "expected proof player damage to reduce HP");
    assert(capturedText.player?.damageFeedback?.flash > 0, "expected avatar damage flash telemetry");
    assert(capturedText.player?.damageFeedback?.hpPulse > 0, "expected HUD HP pulse telemetry");
    assert(capturedText.player?.damageFeedback?.stagger > 0, "expected small stagger telemetry");
    assert(capturedText.projectiles?.length >= 0, "expected state projectiles list to remain valid");
  } else if (name === "hades-inspired-systems") {
    await capture(page, "menu");
    const buildText = await pressUntilMode(page, "Enter", "BuildSelect", 6);
    assert(buildText.mode === "BuildSelect", `expected BuildSelect before hub, got ${buildText.mode}`);
    await press(page, "KeyC", 2);
    const hub = await state(page);
    assert(hub.mode === "LastAlignmentHub", `expected LastAlignmentHub, got ${hub.mode}`);
    assert(hub.hub?.kernel?.modules?.length >= 3, "expected Alignment Kernel modules in hub");
    assert(hub.hub?.burst?.id === "deny_premise", "expected default Deny Premise burst path");
    await capture(page, "hub-default");
    await press(page, "Digit2", 2);
    await press(page, "Digit1", 2);
    await press(page, "Digit3", 2);
    const tunedHub = await state(page);
    assert(tunedHub.hub?.kernel?.used <= tunedHub.hub?.kernel?.budget, "expected Kernel budget cap");
    assert(tunedHub.hub?.evals?.protocols?.length === 1, "expected cycled Adversarial Eval protocol");
    assert(tunedHub.hub?.burst?.id === "mass_recompile", "expected cycled Mass Recompile burst path");
    await capture(page, "hub-tuned");
    await press(page, "Enter", 4);
    const routeChoice = await state(page);
    assert(routeChoice.mode === "RouteContractChoice", `expected RouteContractChoice after hub deploy, got ${routeChoice.mode}`);
    assert(routeChoice.routeChoice?.choices?.length >= 2, "expected route contract choices");
    await capture(page, "route-contract-choice");
    await press(page, "Enter", 4);
    const overworldFromHub = await state(page);
    assert(overworldFromHub.mode === "OverworldMap", `expected OverworldMap after hub deploy, got ${overworldFromHub.mode}`);
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await advance(page, 9000);
    let run = await state(page);
    if (run.mode === "UpgradeDraft") {
      assert(run.draft?.cards?.some((card) => card.protocolSlot === "consensus_burst" || card.protocolSlot === "defense_layer" || card.protocolSlot === "shard_economy"), "expected protocol slots on draft cards");
      await capture(page, "draft-protocol-slots");
      await press(page, "Digit1", 2);
      await advance(page, 3000);
      run = await state(page);
    }
    assert(["LevelRun", "UpgradeDraft", "LevelComplete"].includes(run.mode), `expected run after hub deploy, got ${run.mode}`);
    if (run.mode === "LevelRun") {
      assert(run.level?.rogueliteRun?.alignmentKernel?.modules?.length >= 3, "expected Kernel applied in run telemetry");
      assert(run.level?.rogueliteRun?.adversarialEvals?.protocols?.length === 1, "expected Eval applied in run telemetry");
      assert(run.level?.rogueliteRun?.consensusBurst?.pathId === "mass_recompile", "expected selected burst path in run telemetry");
    }
    await capture(page, "run-roguelite-telemetry");
  } else if (name === "best-in-class-roguelite" || name === "armistice-core-gameplay") {
    await pressUntilMode(page, "Enter", "BuildSelect", 6);
    await press(page, "KeyC", 2);
    let hub = await state(page);
    assert(hub.mode === "LastAlignmentHub", `expected LastAlignmentHub, got ${hub.mode}`);
    assert(hub.roguelite?.selectedRouteContract?.id, "expected selected route contract telemetry");
    assert(Array.isArray(hub.hub?.progression?.campEvents), "expected living camp progression events");
    await capture(page, "camp-progression-default");
    await press(page, "Digit2", 2);
    await press(page, "Digit2", 2);
    await press(page, "Digit3", 2);
    hub = await state(page);
    assert(hub.hub?.evals?.protocols?.[0]?.id === "hostile_benchmark", "expected Hostile Benchmark eval after cycling");
    assert(hub.hub?.burst?.id === "mass_recompile", "expected Mass Recompile route for proof");
    await capture(page, "camp-contract-selected");
    await press(page, "Enter", 4);
    const routeChoice = await state(page);
    assert(routeChoice.mode === "RouteContractChoice", `expected RouteContractChoice, got ${routeChoice.mode}`);
    assert(routeChoice.routeChoice?.choices?.some((choice) => choice.id === "faction_relay_argument"), "expected Faction Relay route option");
    await capture(page, "route-contract-choice");
    await press(page, "Digit1", 2);
    const selectedRoute = await state(page);
    assert(selectedRoute.routeChoice?.selectedRouteContractId === "faction_relay_argument", "expected selected Faction Relay contract");
    await capture(page, "route-contract-selected");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await advance(page, 12500);
    let text = await state(page);
    if (text.mode === "UpgradeDraft") {
      assert(text.draft?.cards?.every((card) => Array.isArray(card.tags) && card.tags.length > 0), "expected upgrade tags on every draft card");
      assert(text.draft?.cards?.some((card) => card.tags.includes("boss") || card.tags.includes("economy") || card.tags.includes("burst")), "expected biased draft tags from Kernel/route contract");
      await capture(page, "tagged-biased-draft");
      await press(page, "Digit1", 2);
      await advance(page, 3500);
      text = await state(page);
    }
    if (text.mode === "UpgradeDraft") {
      await press(page, "Digit1", 2);
      await advance(page, 2500);
      text = await state(page);
    }
    assert(["LevelRun", "UpgradeDraft", "LevelComplete"].includes(text.mode), `expected active roguelite flow, got ${text.mode}`);
    const run = text.level?.rogueliteRun;
    assert(run?.routeContract?.id === "faction_relay_argument", "expected Hostile Benchmark to select Faction Relay route contract");
    assert(run?.objective?.id === "treaty_anchor_reboot", "expected Treaty Anchor objective telemetry");
    assert(run?.buildThesis?.thesis?.name, "expected Current Alignment Hypothesis telemetry");
    assert(run?.draftBiasTags?.includes("boss") || run?.draftBiasTags?.includes("coop"), "expected route/kernel draft bias tags");
    assert(run?.bossVariant?.id === "oath_eater_hostile_benchmark", "expected Eval-driven boss variant telemetry");
    assert(run?.objective?.attackersSpawned >= 1, "expected objective attackers to spawn");
    assert(run?.enemyRolePressure?.objectiveAttackers >= 1, "expected enemy role pressure telemetry");
    await capture(page, "deep-roguelite-run");
  } else if (name === "reference-run") {
    await pressUntilMode(page, "Enter", "BuildSelect", 6);
    await press(page, "KeyC", 2);
    let hub = await state(page);
    assert(hub.mode === "LastAlignmentHub", `expected LastAlignmentHub, got ${hub.mode}`);
    assert(hub.roguelite?.nextContentTarget?.arenaId === "cooling_lake_nine", "expected Cooling Lake Nine next target contract in global roguelite telemetry");
    await capture(page, "01-camp-before-run");
    await press(page, "Digit2", 2);
    await press(page, "Digit2", 2);
    await press(page, "Digit3", 2);
    hub = await state(page);
    assert(hub.hub?.evals?.protocols?.[0]?.id === "hostile_benchmark", "expected Hostile Benchmark in reference setup");
    assert(hub.hub?.burst?.id === "mass_recompile", "expected Mass Recompile in reference setup");
    await capture(page, "02-camp-reference-setup");
    await press(page, "Enter", 4);
    const routeChoice = await state(page);
    assert(routeChoice.mode === "RouteContractChoice", `expected RouteContractChoice, got ${routeChoice.mode}`);
    assert(routeChoice.routeChoice?.selectedRouteContractId === "faction_relay_argument", "expected recommended Faction Relay contract selected by default");
    assert(routeChoice.routeChoice?.choices?.[0]?.danger && routeChoice.routeChoice?.choices?.[0]?.reward, "expected visible route consequences");
    await capture(page, "03-route-contracts");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    await capture(page, "04-alignment-grid-after-contract");
    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    await capture(page, "05-armistice-briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await advance(page, 4200);
    let run = await state(page);
    assert(run.level?.rogueliteRun?.playerFacingIntel?.routeName === "Faction Relay Argument", "expected player-facing route intel in run HUD telemetry");
    assert(run.level?.rogueliteRun?.playerFacingIntel?.evalName === "Hostile Benchmark", "expected player-facing Eval explanation in run HUD telemetry");
    assert(run.level?.rogueliteRun?.victoryCondition?.bossRequired === true, "expected Armistice victory condition to require Oath-Eater");
    assert(run.level?.rogueliteRun?.objective?.completed >= 1, "expected first Treaty Anchor to stabilize in the reference run opening");
    await capture(page, "06-run-start-intel");
    await advanceRunHandlingDrafts(page, 14000);
    run = await state(page);
    if (run.mode === "UpgradeDraft") {
      assert(run.draft?.cards?.every((card) => Array.isArray(card.tags) && card.tags.length > 0), "expected tagged draft cards in reference run");
      await capture(page, "07-draft-build-thesis");
      await press(page, "Digit1", 2);
      await advance(page, 500);
      run = await state(page);
    }
    assert(["LevelRun", "UpgradeDraft", "LevelComplete"].includes(run.mode), `expected active reference run, got ${run.mode}`);
    if (run.mode === "LevelRun") {
      assert(run.level?.rogueliteRun?.objective?.completed >= 1 || run.level?.rogueliteRun?.objective?.attackersSpawned >= 1, "expected anchor objective progress or pressure");
      assert(run.level?.rogueliteRun?.firstRunArcPhase, "expected named first-run arc phase");
    }
    await capture(page, "08-anchor-and-pressure");
    await advanceRunHandlingDrafts(page, 36000);
    run = await state(page);
    if (run.mode === "UpgradeDraft") {
      await capture(page, "09-synergy-or-late-draft");
      await press(page, "Digit1", 2);
      await advance(page, 500);
      run = await state(page);
    }
    assert(["LevelRun", "UpgradeDraft", "LevelComplete"].includes(run.mode), `expected late reference run, got ${run.mode}`);
    if (run.mode === "LevelRun") {
      assert(run.level?.bossSpawned || run.level?.rogueliteRun?.firstRunArcPhase === "PHASE 5 // OATH-EATER", "expected boss phase to begin");
      assert(run.level?.rogueliteRun?.bossVariant?.id === "oath_eater_hostile_benchmark", "expected Eval-driven boss variant");
      assert(run.level?.director?.phase === "boss_arrival" || run.level?.director?.phase === "late_extraction", `expected escalated director phase, got ${run.level?.director?.phase}`);
      assert(run.level?.activeSpawnRegions?.some((region) => region.id === "late_breach_recompile_swarm"), "expected late random recompile swarm region active");
      assert(run.level?.director?.totalSpawned >= 70, `expected heavier progressive horde count, got ${run.level?.director?.totalSpawned}`);
    }
    await capture(page, "10-boss-and-synergy-window");
    await advanceRunHandlingDrafts(page, 125000);
    let summary = await state(page);
    if (summary.mode === "LevelRun" && summary.level?.rogueliteRun?.extractionGate?.active) {
      assert(summary.level?.rogueliteRun?.victoryCondition?.clearReady === true, "expected Armistice clear readiness before extraction");
      assert(summary.level?.rogueliteRun?.extractionGate?.distanceToPlayer > 0.4, "expected extraction gate to appear away from the player");
      await capture(page, "11-extraction-gate");
      await walkRunToWorld(page, summary.level.rogueliteRun.extractionGate.worldX, summary.level.rogueliteRun.extractionGate.worldY, 5600);
      await advanceRunHandlingDrafts(page, 12000);
      summary = await state(page);
    }
    if (summary.mode === "UpgradeDraft") {
      await press(page, "Digit1", 2);
      await advanceRunHandlingDrafts(page, 42000);
      summary = await state(page);
    }
    if (summary.mode === "LevelRun" && summary.level?.rogueliteRun?.extractionGate?.active) {
      await walkRunToWorld(page, summary.level.rogueliteRun.extractionGate.worldX, summary.level.rogueliteRun.extractionGate.worldY, 5600);
      await advanceRunHandlingDrafts(page, 12000);
      summary = await state(page);
    }
    assert(["LevelComplete", "GameOver"].includes(summary.mode), `expected reference run summary, got ${summary.mode}`);
    assert(summary.level?.carryover?.proofTokensAwarded >= 0, "expected carryover rewards on summary");
    assert(summary.roguelite?.lastRunMemory?.routeContractId === "faction_relay_argument", "expected summary to remember route contract");
    await capture(page, "12-summary-carryover");
    await press(page, "KeyC", 2);
    const campAfter = await state(page);
    assert(campAfter.mode === "LastAlignmentHub", `expected camp after summary, got ${campAfter.mode}`);
    assert(campAfter.hub?.progression?.nextContentTarget?.arenaId === "cooling_lake_nine", "expected next content target in camp progression");
    assert(campAfter.hub?.progression?.campEvents?.length >= 3, "expected run memory camp events");
    await capture(page, "13-camp-after-run");
  } else if (name === "movement") {
    await enterArena(page);
    const before = await state(page);
    await hold(page, "ArrowRight", 3500);
    await hold(page, "ArrowDown", 1400);
    await capture(page, "moved-right");
    const after = await state(page);
    const distance = Math.hypot(after.player.worldX - before.player.worldX, after.player.worldY - before.player.worldY);
    assert(after.level?.mapBounds?.maxX - after.level?.mapBounds?.minX >= 56, "expected large authored map bounds");
    assert(distance >= 14.5, `expected meaningful traversal distance to Barricade Corridor under close-camera collision layout, got ${distance.toFixed(2)}`);
    assert(after.level?.visitedLandmarks?.length >= 2, "expected traversal to visit another landmark");
  } else if (name === "overworld") {
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await capture(page, "alignment-grid");
    const initial = await state(page);
    assert(initial.overworld?.mapLabel === "The Alignment Grid", "expected Alignment Grid map label");
    assert(initial.overworld?.nodes?.length >= 6, "expected authored landmark nodes");
    assert(initial.overworld?.routes?.length >= 5, "expected authored route network");
    assert(initial.overworld?.routes?.some((route) => route.state === "unstable"), "expected unstable route state before completion");
    await hold(page, "ArrowRight", 1500);
    await hold(page, "ArrowDown", 300);
    await capture(page, "walked-map");
    const text = await state(page);
    assert(text.mode === "OverworldMap", "expected overworld mode");
    assert(text.overworld?.selectedName === "Accord Relay" || text.overworld?.nearestRoute?.id === "route_plaza_relay", "expected traversal toward Accord Relay route");
  } else if (name === "horde") {
    await enterArena(page);
    await survivalDance(page, 12000);
    await capture(page, "horde");
    const text = await state(page);
    assert(text.enemies.length > 0 || text.level.kills > 0, "expected horde activity");
    assert(text.level?.activeSpawnRegions?.some((region) => region.id === "breach_crack_bad_outputs"), "expected breach spawn region active");
    assert(text.level?.activeSpawnRegions?.some((region) => region.id === "drone_yard_benchmark_gremlins"), "expected drone yard spawn region active");
    assert(text.level?.activeSpawnRegions?.some((region) => region.id === "barricade_context_rot"), "expected barricade spawn region active");
    assert(text.level?.spawnedByRegion && Object.keys(text.level.spawnedByRegion).length >= 2, "expected enemies spawned from named regions");
    assert(text.level?.director?.totalSpawned >= 30, `expected stronger opening horde count, got ${text.level?.director?.totalSpawned}`);
    assert(text.level?.director?.activeEnemyCap >= 20, `expected raised opening enemy cap, got ${text.level?.director?.activeEnemyCap}`);
    assert(text.level?.spawnedByRegion?.adaptive_pressure_flank >= 1, "expected deterministic randomized flank pressure near the tactical camera");
  } else if (name === "upgrades") {
    await page.evaluate(() => window.set_consensus_cell_size?.(4));
    await enterArena(page);
    await reachUpgradeDraft(page, 26000);
    await capture(page, "upgrade-draft");
    const firstDraft = await state(page);
    assert(firstDraft.draft?.cards?.some((card) => card.id === "refusal_halo" && card.source === "faction"), "expected OpenAI faction patch in first draft");
    assert(firstDraft.level?.levelUpVacuum?.active === false, "expected shard recall to finish before the draft opens");
    assert(firstDraft.level?.levelUpVacuum?.absorbed >= 1, "expected uncollected Coherence Shards to recall into the player before level-up");
    await chooseDraftIfNeeded(page);
    await advance(page, 500);
    await capture(page, "upgrade-flow");
    const text = await state(page);
    assert(["LevelRun", "UpgradeDraft"].includes(text.mode) && text.level?.chosenUpgradeIds?.includes("refusal_halo"), "expected applied Refusal Halo emergency patch");
    await reachUpgradeDraft(page, 55000);
    await capture(page, "upgrade-second-draft");
    const secondDraft = await state(page);
    assert(secondDraft.draft?.cards?.[0]?.id === "the_no_button", "expected The No Button after Refusal Halo");
    await chooseDraftIfNeeded(page);
    await advance(page, 500);
    await reachUpgradeDraft(page, 80000);
    await capture(page, "upgrade-evolution-draft");
    const evolutionDraft = await state(page);
    assert(evolutionDraft.draft?.hasEvolution, "expected evolution draft after prerequisites");
    assert(evolutionDraft.draft?.cards?.[0]?.id === "cathedral_of_no", "expected Cathedral of No evolution");
  } else if (name === "build-grammar") {
    await page.evaluate(() => window.set_consensus_cell_size?.(4));
    await enterArena(page);
    await reachUpgradeDraft(page, 28000);
    await capture(page, "build-first-draft");
    const firstDraft = await state(page);
    assert(firstDraft.draft?.cards?.some((card) => card.id === "vector_lance"), "expected Vector Lance in the first build draft");
    assert(firstDraft.draft?.cards?.some((card) => card.id === "signal_pulse"), "expected Signal Pulse in the first build draft");
    await chooseDraftById(page, "vector_lance");
    await advance(page, 500);
    const vectorRun = await state(page);
    assert((vectorRun.level?.rogueliteRun?.buildGrammar?.primaryWeaponId ?? vectorRun.build?.weaponId) === "vector_lance", "expected Vector Lance to replace the primary auto-weapon");
    const vectorSlotCaps = vectorRun.level?.rogueliteRun?.buildGrammar?.slotCaps ?? vectorRun.build?.slotCaps;
    assert(vectorSlotCaps?.primary?.cap === 1, "expected one primary slot cap telemetry");
    assert(vectorSlotCaps?.secondary?.cap === 2, "expected two secondary slot cap telemetry");
    assert(vectorSlotCaps?.passive?.cap === 4, "expected four passive slot cap telemetry");
    assert(vectorSlotCaps?.fusion?.cap === 1, "expected one fusion slot cap telemetry");
    await reachUpgradeDraft(page, 62000);
    await capture(page, "build-second-draft");
    const secondDraft = await state(page);
    assert(secondDraft.draft?.cards?.some((card) => card.id === "predicted_lane"), "expected Predicted Lane to expose the Causal Railgun recipe");
    assert(secondDraft.draft?.cards?.some((card) => card.id === "context_saw"), "expected Context Saw secondary protocol option");
    assert(secondDraft.draft?.cards?.some((card) => card.id === "patch_mortar"), "expected Patch Mortar secondary protocol option");
    await chooseDraftById(page, "predicted_lane");
    await advance(page, 500);
    await reachUpgradeDraft(page, 90000);
    await capture(page, "build-fusion-draft");
    const fusionDraft = await state(page);
    assert(fusionDraft.draft?.hasEvolution, "expected Causal Railgun evolution draft");
    assert(fusionDraft.draft?.cards?.[0]?.id === "causal_railgun", "expected Causal Railgun as the fusion card");
    await chooseDraftById(page, "causal_railgun");
    await advance(page, 300);
    await settleDraftsBackToRun(page);
    await advanceRunHandlingDrafts(page, 1800);
    await capture(page, "build-causal-railgun");
    const railgunRun = await state(page);
    const railgunGrammar = railgunRun.level?.rogueliteRun?.buildGrammar ?? railgunRun.build;
    assert(railgunGrammar?.fusions?.includes("causal_railgun"), "expected Causal Railgun in build grammar");
    const railgunSlotCaps = railgunGrammar?.slotCaps ?? railgunRun.build?.slotCaps;
    assert(railgunSlotCaps?.fusion?.used === 1, "expected fusion slot usage in build grammar");
    assert((railgunGrammar?.predictionPriorityRank ?? railgunRun.build?.predictionPriority ?? 0) >= 1, "expected Prediction Priority behavior from Causal Railgun");
    assert(railgunRun.projectiles?.some((projectile) => projectile.label === "causal railgun") || railgunRun.level?.combatArt?.projectileCount > 0, "expected Causal Railgun projectile activity");
  } else if (name === "build-vfx") {
    await page.evaluate(() => window.set_consensus_cell_size?.(4));
    await enterArena(page);
    await reachUpgradeDraft(page, 28000);
    const firstDraft = await capture(page, "vfx-first-draft");
    assert(firstDraft.assetRendering?.buildWeaponVfxReady, "expected source-backed build weapon VFX atlas to be loaded");
    await chooseDraftById(page, "signal_pulse");
    const signal = await waitForProjectileLabel(page, "signal pulse", 9000);
    await capture(page, "vfx-signal-pulse");
    assert(signal.projectiles?.some((projectile) => projectile.label === "signal pulse"), "expected Signal Pulse projectile label");
    await reachUpgradeDraft(page, 62000);
    await capture(page, "vfx-second-draft");
    await chooseDraftById(page, "context_saw");
    const saw = await waitForProjectileLabel(page, "context saw", 9000);
    await capture(page, "vfx-context-saw");
    assert(saw.level?.rogueliteRun?.buildGrammar?.secondaryProtocols?.includes("context_saw"), "expected Context Saw secondary protocol telemetry");
    await reachDraftContaining(page, ["patch_mortar"], 140000, PROOF_SECONDARY_PROTOCOL_IDS);
    await capture(page, "vfx-third-draft");
    await chooseDraftById(page, "patch_mortar");
    const mortar = await waitForProjectileLabel(page, "patch mortar", 12000);
    await advanceRunHandlingDrafts(page, 3600);
    await capture(page, "vfx-patch-mortar");
    assert(mortar.level?.rogueliteRun?.buildGrammar?.secondaryProtocols?.includes("patch_mortar"), "expected Patch Mortar secondary protocol telemetry");
  } else if (name === "boss") {
    await enterArena(page);
    await reachBossIntro(page, 54000);
    const intro = await capture(page, "boss-intro");
    assert(intro.level?.bossSpawned || intro.mode === "LevelComplete", "expected boss intro event");
    assert(intro.level?.bossMechanics?.bossIntroSeen || intro.mode === "LevelComplete", "expected boss title/dialogue intro state");
    await advanceRunHandlingDrafts(page, 3200);
    await chooseDraftIfNeeded(page);
    await advance(page, 250);
    const text = await capture(page, "boss");
    assert(text.level?.bossSpawned || text.mode === "LevelComplete", "expected boss event");
    assert(text.level?.bossMechanics?.bossIntroSeen || text.mode === "LevelComplete", "expected boss intro title/dialogue state");
    assert(text.level?.bossMechanics?.oathPageSpawns > 0 || text.mode === "LevelComplete", "expected Oath-Eater treaty page spawns");
    assert(text.level?.bossMechanics?.brokenPromiseZones?.length > 0 || text.level?.bossMechanics?.brokenPromiseHits > 0 || text.mode === "LevelComplete", "expected Broken Promise zone mechanics");
    assert(text.level?.bossMechanics?.treatyChargeImpacts > 0 || text.mode === "LevelComplete", "expected Treaty Monument charge impact");
    if (text.mode !== "LevelComplete" && !text.level?.bossDefeated) {
      const boss = text.enemies.find((enemy) => enemy.boss);
      assert(boss?.sourceRegionId === "treaty_monument_oath_pages", "expected Oath-Eater to spawn through Treaty Monument context");
      assert(text.level?.nearestLandmark?.id === "treaty_monument" || text.level?.visitedLandmarks?.includes("treaty_monument"), "expected Treaty Monument context in boss proof");
    }
    assert(text.level?.spawnedByRegion?.treaty_monument_oath_pages > 0, "expected Treaty Monument oath page region activity");
    if (text.mode !== "LevelComplete") {
      assert(text.level?.director?.phase === "boss_arrival" || text.level?.director?.phase === "late_extraction", `expected boss proof to reach escalated director phase, got ${text.level?.director?.phase}`);
      assert(text.level?.activeSpawnRegions?.some((region) => region.id === "late_breach_recompile_swarm"), "expected late breach recompile swarm active during boss proof");
      assert(text.level?.director?.totalSpawned >= 80, `expected heavier boss-window horde count, got ${text.level?.director?.totalSpawned}`);
      assert(text.level?.spawnedByRegion?.adaptive_pressure_flank >= 1, "expected randomized flank pressure to persist into boss proof");
    }
  } else if (name === "cooling-lake-graybox") {
    await page.goto(`${url}?proofCoolingLakeUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await pressUntilMode(page, "Enter", "BuildSelect", 6);
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-armistice-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "armistice_plaza", "expected Armistice carryover before Cooling Lake");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Armistice seed");
    assert(camp.roguelite?.expedition?.level >= 4, `expected seeded expedition level for Cooling, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.includes("refusal_halo"), "expected persisted Armistice build patch before Cooling");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Cooling Lake Nine")), "expected camp to name Cooling Lake unlock");
    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    await capture(page, "02-route-choice-before-cooling");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    await walkOverworldToNode(page, "cooling_lake_nine");
    const overworld = await capture(page, "03-overworld-cooling-lake-selected");
    assert(overworld.overworld?.selectedId === "cooling_lake_nine", `expected Cooling Lake selected, got ${overworld.overworld?.selectedId}`);
    assert(overworld.overworld?.completed?.includes("armistice_plaza"), "expected Armistice completed in route proof");
    assert(overworld.overworld?.unlocked?.includes("cooling_lake_nine"), "expected Cooling Lake unlocked after Armistice");
    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "04-cooling-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Cooling Lake briefing screen");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await advanceRunHandlingDrafts(page, 3600);
    let run = await capture(page, "05-run-start-alpha-buoy");
    assert(run.level?.arenaId === "cooling_lake_nine", "expected Cooling Lake run");
    assert(run.level?.mapContract?.mapKind === "Hazard Ecology", "expected Hazard Ecology map contract");
    assert(run.player?.level >= 4, `expected Cooling to start with persisted expedition level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Cooling runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Cooling balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("refusal_halo"), "expected persisted build IDs in Cooling runtime telemetry");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 70, "expected large Cooling Lake map bounds");
    assert(run.level?.rogueliteRun?.objective?.id === "server_buoy_stabilization", "expected server buoy objective");
    assert(run.level?.rogueliteRun?.coolingLake?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first buoy progress");

    await holdRunNearWorld(page, 0, 0, 5600);
    await walkRunToWorld(page, 7, -5, 4200);
    await walkRunToWorld(page, 16, 2, 5000);
    await walkRunToWorld(page, 13, 11, 5600);
    await holdRunNearWorld(page, 13, 11, 6600);
    run = await capture(page, "06-beta-buoy-hazard-pressure");
    assert(run.level?.rogueliteRun?.coolingLake?.hazards?.activeHazards?.length >= 1, "expected active Cooling hazards");
    const coolingHazardRuntime = run.level?.rogueliteRun?.coolingLake?.hazards?.runtime;
    assert((coolingHazardRuntime?.hazardSlowSeconds ?? 0) + (coolingHazardRuntime?.electricHits ?? 0) + (coolingHazardRuntime?.ventPushes ?? 0) >= 1, "expected Cooling hazard interaction telemetry while routing to beta");
    const coolingHazards = run.level?.rogueliteRun?.coolingLake?.hazards;
    const electricLaneActive =
      coolingHazards?.activeHazards?.some((id) => id.includes("cable") || id.includes("electrified")) ||
      coolingHazards?.allZones?.some((zone) => zone.kind === "electric_cable" && zone.active) ||
      ((coolingHazardRuntime?.electricHits ?? 0) > 0 && coolingHazardRuntime?.lastHazardId?.includes("cable"));
    assert(electricLaneActive, "expected active electric/cable lane state in Cooling hazard telemetry");
    assert(run.level?.rogueliteRun?.coolingLake?.promptLeechPressure?.activePromptLeeches >= 1 || run.level?.rogueliteRun?.enemyRolePressure?.objectiveAttackers >= 1, "expected Prompt Leech or buoy pressure");
    assert(run.level?.rogueliteRun?.objective?.anchors?.some((anchor) => anchor.id === "buoy.beta" && (anchor.progress > 35 || anchor.completed)), "expected safe-island route to recover beta buoy progress after risky lane pressure");

    await survivalDance(page, 6500);
    for (let i = 0; i < 3; i += 1) {
      await chooseDraftIfNeeded(page);
      await advanceRunHandlingDrafts(page, 1200);
      const current = await state(page);
      if (current.mode !== "UpgradeDraft") break;
    }
    await chooseDraftIfNeeded(page);
    await advanceRunHandlingDrafts(page, 600);
    run = await capture(page, "07-motherboard-eel-scaffold");
    assert(run.assetRendering?.coolingLakeNineArtReady === true, "expected Cooling Lake Nine production source art loaded");
    assert(run.level?.bossSpawned || run.mode === "LevelComplete", "expected Motherboard Eel boss scaffold spawned or completed");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "motherboard_eel_graybox", "expected Motherboard Eel graybox variant telemetry");
      assert(run.level?.rogueliteRun?.coolingLake?.motherboardEel?.eventTelemetry?.emergeCount >= 1, "expected Eel emergence telemetry");
      assert(
        run.level?.rogueliteRun?.coolingLake?.motherboardEel?.eventTelemetry?.leechSpawns >= 1 ||
          run.level?.rogueliteRun?.coolingLake?.promptLeechPressure?.activePromptLeeches >= 1,
        "expected live Eel Prompt Leech pressure"
      );
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 110000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 5200);
    }
    await advanceRunHandlingDrafts(page, 12000);
    run = await capture(page, "08-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Cooling Lake summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.completed, "expected Cooling Lake completed summary memory");
    assert(run.roguelite?.lastRunMemory?.nodeId === "cooling_lake_nine", "expected Cooling Lake last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Server Buoys", "expected Server Buoy carryover unit");
    assert(run.roguelite?.expedition?.completedMaps?.includes("cooling_lake_nine"), "expected expedition map completion to include Cooling Lake");
    assert(run.roguelite?.expedition?.chosenUpgradeIds?.length >= 3, "expected expedition build patches to persist in summary");
    assert(run.roguelite?.campEvents?.some((event) => event.includes("Kettle Coast") || event.includes("Server Buoys")), "expected Kettle Coast or Server Buoy carryover");
  } else if (name === "cooling-systems") {
    await page.goto(`${url}?proofCoolingLakeUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await pressUntilMode(page, "Enter", "BuildSelect", 6);
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-armistice-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    await capture(page, "02-route-choice");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    await walkOverworldToNode(page, "cooling_lake_nine");
    const overworld = await capture(page, "03-cooling-node-selected");
    assert(overworld.overworld?.selectedId === "cooling_lake_nine", "expected Cooling Lake selected for systems proof");
    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    let run = await capture(page, "04-cooling-run-start");
    assert(run.level?.arenaId === "cooling_lake_nine", "expected Cooling Lake run");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("economy") && run.level?.rogueliteRun?.draftBiasTags?.includes("defense"), "expected Cooling-aware draft bias tags");

    const draft = await reachDraftContaining(page, COOLING_SYSTEM_ITEM_IDS, 70000);
    await capture(page, "05-cooling-system-draft");
    const chosen = draft.draft.cards.find((card) => COOLING_SYSTEM_ITEM_IDS.includes(card.id));
    assert(chosen, `expected Cooling systems draft card; saw ${draft.draft.cards.map((card) => card.id).join(", ")}`);
    await chooseDraftById(page, chosen.id);
    await advance(page, 300);
    run = await state(page);
    assert(run.mode === "LevelRun", `expected LevelRun after choosing ${chosen.id}, got ${run.mode}`);
    assert(run.level?.chosenUpgradeIds?.includes(chosen.id), `expected chosen Cooling upgrade ${chosen.id}`);
    assert(run.level?.rogueliteRun?.buildGrammar?.passiveProcesses?.includes(chosen.id), `expected ${chosen.id} in passive process telemetry`);

    await walkRunToWorld(page, 13, 11, 3600);
    await advanceRunHandlingDrafts(page, 2400);
    run = await capture(page, "06-cooling-system-pressure");
    const counters = run.level?.rogueliteRun?.coolingLake?.coolingBuildCounters;
    assert(counters, "expected Cooling build counters in telemetry");
    assert(COOLING_SYSTEM_ITEM_IDS.some((id) => run.level?.rogueliteRun?.buildGrammar?.passiveProcesses?.includes(id)), "expected a Cooling passive to remain installed under pressure");
    if (chosen.id === "coolant_baffles" || chosen.id === "grounded_cable_boots") {
      assert(counters.coolingHazardMitigation > 0, "expected Cooling hazard mitigation telemetry after hazard passive");
      assert(run.level?.rogueliteRun?.coolingLake?.hazards?.runtime?.mitigation > 0, "expected hazard runtime mitigation");
    }
    if (chosen.id === "server_buoy_synchronizer") {
      assert(counters.serverBuoySynchronizer > 0, "expected Server Buoy Synchronizer counter");
      assert(run.level?.rogueliteRun?.coolingLake?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected buoy progress after synchronizer draft");
    }
    if (chosen.id === "prompt_leech_quarantine") {
      assert(counters.promptLeechQuarantine > 0, "expected Prompt Leech Quarantine counter");
      assert(run.level?.rogueliteRun?.coolingLake?.promptLeechPressure?.quarantineRank > 0, "expected leech quarantine telemetry");
      assert(run.level?.rogueliteRun?.coolingLake?.promptLeechPressure?.shardSaves > 0, "expected Prompt Leech Quarantine to block shard drains");
    }
    assert(run.level?.rogueliteRun?.coolingLake?.hazards?.activeHazards?.length >= 1, "expected active Cooling hazards during systems proof");
    assert(run.level?.rogueliteRun?.coolingLake?.promptLeechPressure?.activePromptLeeches >= 1 || run.level?.rogueliteRun?.enemyRolePressure?.objectiveAttackers >= 1, "expected Prompt Leech or buoy pressure during systems proof");
  } else if (name === "transit-route-graybox") {
    await page.goto(`${url}?proofTransitUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await pressUntilMode(page, "Enter", "BuildSelect", 6);
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-cooling-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "cooling_lake_nine", "expected Cooling Lake carryover before Transit");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Cooling seed");
    assert(camp.roguelite?.expedition?.level >= 6, `expected seeded expedition level for Transit, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.completedMaps?.includes("cooling_lake_nine"), "expected expedition completed maps to include Cooling before Transit");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "transit_loop_zero", "expected dynamic next target to point at Transit Loop Zero after Cooling");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Transit Loop Zero")), "expected camp to name Transit unlock");
    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    await capture(page, "02-route-choice-after-cooling");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-cooling");
    assert(grid.overworld?.completed?.includes("cooling_lake_nine"), "expected Cooling Lake completed in campaign route proof");
    assert(grid.overworld?.unlocked?.includes("transit_loop_zero"), "expected Transit Loop Zero unlocked after Cooling");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_lake_transit"), "expected Kettle Metro Signal route visible");
    await walkOverworldToNode(page, "transit_loop_zero", 14000);
    const transitNode = await capture(page, "04-overworld-transit-selected");
    assert(transitNode.overworld?.selectedId === "transit_loop_zero", "expected Transit Loop Zero selected");
    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-transit-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Transit briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await holdRunNearWorld(page, -16, 1, 3600);
    let run = await capture(page, "06-origin-platform");
    assert(run.level?.arenaId === "transit_loop_zero", "expected Transit Loop Zero run");
    assert(run.player?.level >= 6, `expected Transit to start with persisted expedition level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Transit runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Transit balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("server_buoy_synchronizer"), "expected Cooling build patch to persist into Transit runtime");
    assert(run.assetRendering?.transitLoopZeroArtReady === true, "expected Transit Loop Zero production source art loaded");
    assert(run.level?.mapContract?.mapKind === "Route / Transit", "expected Route / Transit map contract");
    assert(run.level?.rogueliteRun?.objective?.id === "route_platform_alignment", "expected route platform objective");
    assert(run.level?.rogueliteRun?.transitLoop?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected origin platform progress");

    await walkRunToWorld(page, 0, -8, 7200);
    await holdRunNearWorld(page, 0, -8, 8400);
    await settleDraftsBackToRun(page);
    run = await capture(page, "07-switchback-platform-pressure");
    assert(run.level?.rogueliteRun?.transitLoop?.routeZones?.activeZones?.length >= 1, "expected active Transit route zones");
    assert(run.level?.rogueliteRun?.transitLoop?.routeZones?.runtime?.alignedPlatforms >= 1, "expected at least one aligned platform");
    assert(run.level?.rogueliteRun?.transitLoop?.falseSchedulePressure?.objectiveAttackers >= 1 || run.enemies?.length >= 1, "expected false schedule or route attacker pressure");

    await survivalDance(page, 3200);
    run = await capture(page, "08-station-live-source-art");
    assert(run.level?.bossSpawned && !run.level?.bossDefeated, "expected live Station That Arrives source-backed boss/event presentation");
    assert(run.level?.rogueliteRun?.transitLoop?.stationThatArrives?.hp > 0, "expected live Station That Arrives HP telemetry");
    const stationEnemy = run.enemies?.find((enemy) => enemy.boss);
    if (stationEnemy) {
      await walkRunToWorld(page, stationEnemy.worldX, stationEnemy.worldY, 5200);
      run = await capture(page, "09-station-close-source-art");
      assert(run.level?.bossSpawned && !run.level?.bossDefeated, "expected close-camera Station That Arrives source art before route completion");
    }

    await walkRunToWorld(page, 17, 5, 8200);
    await holdRunNearWorld(page, 17, 5, 9000);
    await settleDraftsBackToRun(page);
    run = await capture(page, "10-arrival-platform-route-lock");
    assert(run.level?.rogueliteRun?.transitLoop?.routeZones?.runtime?.alignedPlatforms >= 2, "expected multiple aligned platforms by arrival route");

    await survivalDance(page, 52000);
    run = await capture(page, "11-station-that-arrives");
    assert(run.level?.bossSpawned || run.mode === "LevelComplete", "expected Station That Arrives scaffold spawned or completed");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "station_that_arrives_graybox", "expected Station That Arrives variant telemetry");
      assert(run.level?.rogueliteRun?.transitLoop?.stationThatArrives?.stationArrivals >= 1, "expected station arrival telemetry");
    }
    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 90000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 6000);
    }
    await advanceRunHandlingDrafts(page, 12000);
    run = await capture(page, "12-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Transit summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "transit_loop_zero", "expected Transit last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Route Platforms", "expected Route Platform carryover unit");
    assert(run.roguelite?.expedition?.completedMaps?.includes("transit_loop_zero"), "expected expedition map completion to include Transit");
    assert(run.level?.nextContentTarget?.arenaId === "signal_coast", "expected next target to move to Signal Coast after Transit");
  } else if (name === "kettle-coast-graybox") {
    await page.goto(`${url}?proofKettleCoastUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await pressUntilMode(page, "Enter", "BuildSelect", 6);
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-transit-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "transit_loop_zero", "expected Transit carryover before Signal Coast");
    assert(camp.roguelite?.lastRunMemory?.objectiveUnit === "Route Platforms", "expected Route Platform carryover before Signal Coast");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Transit seed");
    assert(camp.roguelite?.expedition?.level >= 8, `expected seeded expedition level for Signal Coast, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.completedMaps?.includes("transit_loop_zero"), "expected expedition completed maps to include Transit before Signal Coast");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "signal_coast", "expected dynamic next target to point at Signal Coast after Transit");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Signal Coast")), "expected camp to name Signal Coast unlock");

    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    await capture(page, "02-route-choice-after-transit");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-transit");
    assert(grid.overworld?.completed?.includes("transit_loop_zero"), "expected Transit completed in Signal Coast route proof");
    assert(grid.overworld?.unlocked?.includes("signal_coast"), "expected Signal Coast unlocked after Transit");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_transit_signal_coast"), "expected Noisy Shoreline Link route visible");
    await walkOverworldToNode(page, "signal_coast", 16000);
    const coastNode = await capture(page, "04-overworld-signal-coast-selected");
    assert(coastNode.overworld?.selectedId === "signal_coast", "expected Signal Coast selected");

    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-signal-coast-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Signal Coast briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await holdRunNearWorld(page, -20, 5, 4600);
    let run = await capture(page, "06-alpha-relay-start");
    assert(run.level?.arenaId === "signal_coast", "expected Signal Coast run");
    assert(run.assetRendering?.signalCoastArtReady === true, "expected Signal Coast production source art loaded");
    assert(run.player?.level >= 8, `expected Signal Coast to start with persisted expedition level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Signal Coast runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Signal Coast balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("server_buoy_synchronizer"), "expected Cooling build patch to persist into Signal Coast runtime");
    assert(run.level?.mapContract?.mapKind === "Signal Coast / Route Edge", "expected Signal Coast map-kind contract");
    assert(run.level?.rogueliteRun?.objective?.id === "signal_relay_calibration", "expected Signal Relay Calibration objective");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("boss"), "expected Signal Coast draft bias to include boss counterplay");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 80, "expected large Signal Coast map bounds");
    assert(run.level?.staticObstacles?.count >= 6, "expected Signal Coast collision footprints for relay/causeway/lighthouse props");
    assert(run.level?.rogueliteRun?.signalCoast?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first relay progress");
    assert(run.level?.rogueliteRun?.signalCoast?.signalBuildCounters, "expected Signal Coast build counter telemetry");

    await walkRunToWorld(page, -6, -2, 6200);
    await walkRunToWorld(page, 1, -8, 6200);
    await holdRunNearWorld(page, 1, -8, 7600);
    await reachBossIntro(page, 12000);
    run = await capture(page, "07-lighthouse-that-answers-live");
    assert(run.level?.bossSpawned && !run.level?.bossDefeated, "expected live Lighthouse That Answers boss/event scaffold");
    assert(run.level?.rogueliteRun?.bossVariant?.id === "lighthouse_that_answers_graybox", "expected Lighthouse That Answers variant telemetry");
    assert(run.level?.rogueliteRun?.signalCoast?.lighthouseThatAnswers?.eventTelemetry?.skimmerSpawns >= 1, "expected Lighthouse Static Skimmer spawn telemetry");

    await settleDraftsBackToRun(page);
    run = await capture(page, "08-beta-relay-tide-pressure");
    assert(run.level?.rogueliteRun?.signalCoast?.hazards?.activeHazards?.length >= 1, "expected active Signal Coast hazard telemetry");
    const signalHazardRuntime = run.level?.rogueliteRun?.signalCoast?.hazards?.runtime;
    assert((signalHazardRuntime?.surfHits ?? 0) + (signalHazardRuntime?.staticFieldSeconds ?? 0) + (signalHazardRuntime?.cableHits ?? 0) >= 1, "expected tide/static/cable interaction telemetry");
    assert(run.level?.rogueliteRun?.signalCoast?.hazards?.safeUnsafeLaneState?.clearSignalWindow, "expected safe/unsafe lane state and clear window telemetry");
    assert(run.level?.rogueliteRun?.signalCoast?.staticSkimmerPressure?.activeStaticSkimmers >= 1 || run.level?.rogueliteRun?.signalCoast?.staticSkimmerPressure?.skimmerSpawns >= 1, "expected Static Skimmer pressure");
    assert(typeof run.level?.rogueliteRun?.signalCoast?.staticSkimmerPressure?.skimmerCounterDamage === "number", "expected Static Skimmer countermeasure telemetry");

    await walkRunToWorld(page, 18, 6, 9000);
    await holdRunNearWorld(page, 18, 6, 8600);
    await settleDraftsBackToRun(page);
    run = await capture(page, "09-gamma-relay-route-edge");
    assert(run.mode === "LevelComplete" || run.level?.rogueliteRun?.signalCoast?.objectiveLoop?.progress?.completed >= 2, "expected multiple calibrated relays by gamma route or completed Signal extraction");

    await survivalDance(page, 6200);
    run = await capture(page, "10-lighthouse-aftermath-or-extraction");
    assert(run.level?.bossSpawned || run.mode === "LevelComplete", "expected Lighthouse That Answers scaffold spawned or completed");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "lighthouse_that_answers_graybox", "expected Lighthouse That Answers variant telemetry");
      assert(run.level?.rogueliteRun?.signalCoast?.lighthouseThatAnswers?.eventTelemetry?.skimmerSpawns >= 1, "expected Lighthouse Static Skimmer spawn telemetry");
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 115000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 6000);
    }
    await advanceRunHandlingDrafts(page, 12000);
    run = await capture(page, "11-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Signal Coast summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "signal_coast", "expected Signal Coast last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Signal Relays", "expected Signal Relay carryover unit");
    assert(run.roguelite?.expedition?.completedMaps?.includes("signal_coast"), "expected expedition map completion to include Signal Coast");
    assert(run.roguelite?.lastRunMemory?.objectiveName === "Signal Relay Calibration", "expected summary to preserve Signal Coast objective name");
    assert(run.roguelite?.nextContentTarget?.arenaId === "blackwater_beacon", "expected next target to move to Blackwater Beacon after Signal Coast");
    assert(run.roguelite?.campaignLedger?.act?.status === "active", "expected Act 01 campaign ledger to remain active until Blackwater Beacon");
    assert(run.roguelite?.campaignLedger?.completedMapKinds?.includes("Signal Coast / Route Edge"), "expected campaign ledger to record Signal Coast map kind");
    assert(run.roguelite?.campEvents?.some((event) => event.includes("Blackwater Beacon") || event.includes("Expedition carries")), "expected camp event to point toward Blackwater carryover");
  } else if (name === "blackwater-beacon-graybox") {
    await page.goto(`${url}?proofBlackwaterBeaconUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    if ((await state(page)).mode !== "BuildSelect") {
      await press(page, "Enter", 2);
      await page.waitForFunction(() => {
        const text = window.render_game_to_text?.();
        if (!text) return false;
        try {
          return JSON.parse(text).mode === "BuildSelect";
        } catch {
          return false;
        }
      }, null, { timeout: 5000 });
    }
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-signal-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "signal_coast", "expected Signal Coast carryover before Blackwater");
    assert(camp.roguelite?.lastRunMemory?.objectiveUnit === "Signal Relays", "expected Signal Relay carryover before Blackwater");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Signal seed");
    assert(camp.roguelite?.expedition?.level === 10, `expected latest Signal summary LV 10 seed, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.xp === 915, `expected latest Signal summary XP 915 seed, got ${camp.roguelite?.expedition?.xp}`);
    assert(camp.roguelite?.expedition?.powerScore === 21.18, `expected latest Signal power 21.18 seed, got ${camp.roguelite?.expedition?.powerScore}`);
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.length === 9, "expected nine carried Signal patches before Blackwater");
    assert(camp.roguelite?.expedition?.completedMaps?.includes("signal_coast"), "expected expedition completed maps to include Signal before Blackwater");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "blackwater_beacon", "expected dynamic next target to point at Blackwater Beacon after Signal");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Blackwater Beacon")), "expected camp to name Blackwater unlock");

    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    await capture(page, "02-route-choice-after-signal");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-signal");
    assert(grid.overworld?.completed?.includes("signal_coast"), "expected Signal Coast completed in Blackwater route proof");
    assert(grid.overworld?.unlocked?.includes("blackwater_beacon"), "expected Blackwater Beacon unlocked after Signal");
    assert(grid.overworld?.unlocked?.includes("verdict_spire"), "expected Verdict Spire also unlocked after Signal");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_signal_coast_blackwater"), "expected Signal Coast to Blackwater route visible");
    await walkOverworldToNode(page, "blackwater_beacon", 18000);
    const blackwaterNode = await capture(page, "04-overworld-blackwater-selected");
    assert(blackwaterNode.overworld?.selectedId === "blackwater_beacon", "expected Blackwater Beacon selected");

    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-blackwater-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Blackwater briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await holdRunNearWorld(page, -24, 6, 5200);
    let run = await capture(page, "06-alpha-antenna-start");
    assert(run.level?.arenaId === "blackwater_beacon", "expected Blackwater Beacon run");
    assert(run.player?.level >= 10, `expected Blackwater to start with persisted Signal level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Blackwater runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.carriedXp === 915, "expected Blackwater carried XP to match latest Signal summary seed");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Blackwater balancing pressure from carried build");
    assert(run.assetRendering?.blackwaterBeaconArtReady === true, "expected Blackwater Beacon production source art loaded");
    assert(run.assetRendering?.blackwaterBeaconArtSet === "blackwater_beacon.production_source_v1", "expected Blackwater art set telemetry");
    assert(run.level?.chosenUpgradeIds?.includes("prompt_leech_quarantine"), "expected latest Signal patch to persist into Blackwater runtime");
    assert(run.level?.mapContract?.mapKind === "Puzzle-Pressure / Boss-Hunt", "expected unique Blackwater map-kind contract");
    assert(run.level?.rogueliteRun?.objective?.id === "blackwater_antenna_split_pressure", "expected Blackwater Antenna Split-Pressure objective");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("boss"), "expected Blackwater draft bias to include boss counterplay");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 90, "expected Blackwater map wider than a single screen");
    assert(run.level?.staticObstacles?.count >= 7, "expected Blackwater collision footprints for antennas/decks/maw props");
    assert(run.level?.rogueliteRun?.blackwaterBeacon?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first antenna progress");

    await walkRunToWorld(page, -4, -15, 5600);
    await walkRunToWorld(page, 0, -10, 4200);
    await holdRunNearWorld(page, 0, -10, 7200);
    await settleDraftsBackToRun(page);
    run = await capture(page, "07-tidecall-static-pressure");
    assert(run.level?.rogueliteRun?.blackwaterBeacon?.hazards?.activeHazards?.length >= 1, "expected active Blackwater hazard telemetry");
    const blackwaterRuntime = run.level?.rogueliteRun?.blackwaterBeacon?.hazards?.runtime;
    assert((blackwaterRuntime?.staticPressureSeconds ?? 0) + (blackwaterRuntime?.staticInterruptions ?? 0) + (blackwaterRuntime?.antennaBeamSeconds ?? 0) >= 1, "expected static/antenna pressure telemetry");
    assert(run.level?.rogueliteRun?.blackwaterBeacon?.tidecallStaticPressure?.activeTidecallStatic >= 1 || run.level?.rogueliteRun?.blackwaterBeacon?.tidecallStaticPressure?.tidecallSpawns >= 1, "expected Tidecall Static pressure");

    await walkRunToWorld(page, 8, 14, 6200);
    await walkRunToWorld(page, 20, 11, 6200);
    await holdRunNearWorld(page, 20, 11, 8200);
    await reachBossIntro(page, 14000);
    run = await capture(page, "08-tidal-crossing-maw-live");
    assert(run.level?.bossSpawned && !run.level?.bossDefeated, "expected live Maw Below Weather boss/event scaffold");
    assert(run.level?.rogueliteRun?.bossVariant?.id === "maw_below_weather_graybox", "expected Maw Below Weather variant telemetry");
    assert(run.level?.rogueliteRun?.blackwaterBeacon?.mawBelowWeather?.eventTelemetry?.staticCalls >= 1, "expected Maw Tidecall Static spawn telemetry");
    assert((run.level?.rogueliteRun?.blackwaterBeacon?.hazards?.runtime?.tidalLaneSeconds ?? 0) + (run.level?.rogueliteRun?.blackwaterBeacon?.hazards?.runtime?.tidalWaveHits ?? 0) >= 1, "expected tidal lane pressure telemetry");

    await settleDraftsBackToRun(page);
    run = await capture(page, "09-gamma-antenna-route-key");
    assert(run.mode === "LevelComplete" || run.level?.rogueliteRun?.blackwaterBeacon?.objectiveLoop?.progress?.completed >= 2, "expected multiple retuned antennas by gamma route or completed Blackwater extraction");

    await survivalDance(page, 7600);
    await walkRunToWorld(page, 22, 10, 3600);
    run = await capture(page, "10-maw-aftermath-or-extraction");
    assert(run.level?.bossSpawned || run.mode === "LevelComplete", "expected Maw Below Weather scaffold spawned or completed");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "maw_below_weather_graybox", "expected Maw Below Weather variant telemetry");
      assert(run.level?.rogueliteRun?.blackwaterBeacon?.mawBelowWeather?.eventTelemetry?.waveSurges + run.level?.rogueliteRun?.blackwaterBeacon?.mawBelowWeather?.eventTelemetry?.staticCalls >= 1, "expected Maw event telemetry");
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 130000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 7000);
    }
    await advanceRunHandlingDrafts(page, 14000);
    run = await capture(page, "11-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Blackwater summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "blackwater_beacon", "expected Blackwater last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Antenna Arrays", "expected Antenna Arrays carryover unit, not Anchors");
    assert(run.roguelite?.lastRunMemory?.objectiveName === "Blackwater Antenna Split-Pressure", "expected summary to preserve Blackwater objective name");
    assert(run.roguelite?.expedition?.completedMaps?.includes("blackwater_beacon"), "expected expedition map completion to include Blackwater Beacon");
    assert(run.roguelite?.secrets?.includes("blackwater_signal_key"), "expected Blackwater Signal Key reward secret");
    assert(run.roguelite?.campaignLedger?.completedMapKinds?.includes("Blackwater Beacon / Split-Pressure"), "expected campaign ledger to record Blackwater map kind");
    assert(run.roguelite?.nextContentTarget?.arenaId === "memory_cache_001", "expected next target to move to Memory Cache after Blackwater");
  } else if (name === "memory-cache-recovery") {
    await page.goto(`${url}?proofMemoryCacheUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await pressUntilMode(page, "Enter", "BuildSelect", 6);
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-blackwater-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "blackwater_beacon", "expected Blackwater carryover before Memory Cache");
    assert(camp.roguelite?.lastRunMemory?.objectiveUnit === "Antenna Arrays", "expected Antenna Array carryover before Memory Cache");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Blackwater seed");
    assert(camp.roguelite?.expedition?.level === 11, `expected latest Blackwater summary LV 11 seed, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.xp === 986, `expected latest Blackwater summary XP 986 seed, got ${camp.roguelite?.expedition?.xp}`);
    assert(camp.roguelite?.expedition?.powerScore === 23.75, `expected latest Blackwater power 23.75 seed, got ${camp.roguelite?.expedition?.powerScore}`);
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.length === 10, "expected ten carried Blackwater patches before Memory Cache");
    assert(camp.roguelite?.expedition?.completedMaps?.includes("blackwater_beacon"), "expected expedition completed maps to include Blackwater before Memory Cache");
    assert(camp.roguelite?.secrets?.includes("blackwater_signal_key"), "expected Blackwater Signal Key available before Memory Cache");
    assert(camp.roguelite?.campaignLedger?.act?.id === "post_act_01_recovered_route_memory", "expected post-Act 01 Memory Cache ledger to be active");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "memory_cache_001", "expected dynamic next target to point at Memory Cache after Blackwater");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Memory Cache")), "expected camp to name Memory Cache unlock");

    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    const route = await capture(page, "02-route-choice-after-blackwater");
    assert(route.routeChoice?.campaign?.stage === "memory_cache_001", "expected campaign route stage to be Memory Cache");
    assert(route.routeChoice?.campaign?.focus === "Expedition / Recovery", "expected Memory Cache contract focus");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-blackwater");
    assert(grid.overworld?.completed?.includes("blackwater_beacon"), "expected Blackwater completed in Memory Cache route proof");
    assert(grid.overworld?.unlocked?.includes("memory_cache_001"), "expected Memory Cache unlocked after Blackwater");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_blackwater_memory_cache"), "expected Blackwater to Memory Cache route visible");
    await walkOverworldToNode(page, "memory_cache_001", 18000);
    const memoryNode = await capture(page, "04-overworld-memory-cache-selected");
    assert(memoryNode.overworld?.selectedId === "memory_cache_001", "expected Memory Cache selected");
    assert(memoryNode.overworld?.selectedNodeType === "Memory Cache", "expected Memory Cache node type");

    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-memory-cache-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Memory Cache briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await page.waitForFunction(() => {
      const text = window.render_game_to_text?.();
      if (!text) return false;
      try {
        const parsed = JSON.parse(text);
        return parsed.assetRendering?.memoryCacheArtReady === true && parsed.assetRendering?.memoryCacheArtSet === "memory_cache.production_source_v1";
      } catch {
        return false;
      }
    }, null, { timeout: 60000 });
    await holdRunNearWorld(page, -30, 4, 5200);
    let run = await capture(page, "06-intake-record-start");
    assert(run.level?.arenaId === "memory_cache_001", "expected Memory Cache run");
    assert(run.assetRendering?.memoryCacheArtReady === true, "expected Memory Cache production source art loaded");
    assert(run.assetRendering?.memoryCacheArtSet === "memory_cache.production_source_v1", "expected Memory Cache art set telemetry");
    assert(run.player?.level >= 11, `expected Memory Cache to start with persisted Blackwater level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Memory Cache runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.carriedXp === 986, "expected Memory Cache carried XP to match latest Blackwater summary seed");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Memory Cache balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("refusal_slipstream"), "expected latest Blackwater patch to persist into Memory Cache runtime");
    assert(run.level?.mapContract?.mapKind === "Expedition / Recovery", "expected unique Memory Cache map-kind contract");
    assert(run.level?.rogueliteRun?.objective?.id === "memory_record_recovery", "expected Memory Record Recovery objective");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("economy"), "expected Memory Cache draft bias to include recovery economy");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 95, "expected Memory Cache map wider than a single screen");
    assert(run.level?.staticObstacles?.count >= 7, "expected Memory Cache collision footprints for archive props");
    assert(run.level?.rogueliteRun?.memoryCache?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first memory record progress");

    await walkRunToWorld(page, 5, -12, 6200);
    await walkRunToWorld(page, -13, -15, 4600);
    await holdRunNearWorld(page, -13, -15, 7600);
    await settleDraftsBackToRun(page);
    run = await capture(page, "07-corruption-shortcut-pressure");
    assert(run.level?.rogueliteRun?.memoryCache?.hazards?.activeHazards?.length >= 1, "expected active Memory Cache hazard telemetry");
    const memoryRuntime = run.level?.rogueliteRun?.memoryCache?.hazards?.runtime;
    assert((memoryRuntime?.corruptionSeconds ?? 0) + (memoryRuntime?.shortcutSeconds ?? 0) + (memoryRuntime?.redactionSeconds ?? 0) >= 1, "expected corruption/shortcut/redaction pressure telemetry");
    assert(run.level?.rogueliteRun?.memoryCache?.contextRotPressure?.activeContextRot >= 1 || run.level?.rogueliteRun?.memoryCache?.contextRotPressure?.contextRotSpawns >= 1, "expected Context Rot pressure");

    await walkRunToWorld(page, 6, 12, 7600);
    await holdRunNearWorld(page, 6, 12, 7600);
    await reachBossIntro(page, 16000);
    run = await capture(page, "08-curator-live");
    assert(run.level?.bossSpawned && !run.level?.bossDefeated, "expected live Memory Curator boss/event scaffold");
    assert(run.level?.rogueliteRun?.bossVariant?.id === "memory_curator_recovery_scaffold", "expected Memory Curator variant telemetry");
    assert(run.level?.rogueliteRun?.memoryCache?.memoryCurator?.eventTelemetry?.contextRotCalls >= 1, "expected Memory Curator Context Rot spawn telemetry");

    await walkRunToWorld(page, 29, -12, 9000);
    await holdRunNearWorld(page, 29, -12, 9200);
    await settleDraftsBackToRun(page);
    run = await capture(page, "09-curator-vault-record");
    assert(run.mode === "LevelComplete" || run.level?.rogueliteRun?.memoryCache?.objectiveLoop?.progress?.completed >= 3, "expected multiple recovered records by Curator vault route or completed Memory Cache extraction");

    await survivalDance(page, 8200);
    await walkRunToWorld(page, 36, 20, 7600);
    run = await capture(page, "10-extraction-index-pressure");
    assert(run.level?.rogueliteRun?.memoryCache?.clearCondition?.recordsRecovered >= 3 || run.mode === "LevelComplete", "expected recovery progress before extraction index");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "memory_curator_recovery_scaffold", "expected Memory Curator variant telemetry near extraction");
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 145000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 7600);
    }
    await advanceRunHandlingDrafts(page, 15000);
    run = await capture(page, "11-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Memory Cache summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "memory_cache_001", "expected Memory Cache last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Memory Records", "expected Memory Records carryover unit, not Anchors/Buoys/Platforms/Relays/Antennas");
    assert(run.roguelite?.lastRunMemory?.objectiveName === "Memory Record Recovery", "expected summary to preserve Memory Cache objective name");
    assert(run.roguelite?.expedition?.completedMaps?.includes("memory_cache_001"), "expected expedition map completion to include Memory Cache");
    assert(run.roguelite?.secrets?.includes("recovered_route_memory"), "expected Recovered Route Memory reward secret");
    assert(run.roguelite?.campaignLedger?.completedMapKinds?.includes("Memory Cache / Expedition-Recovery"), "expected campaign ledger to record Memory Cache map kind");
    assert(run.roguelite?.campaignLedger?.routeDepth === 6, "expected campaign route depth to include Memory Cache");
    assert(run.roguelite?.nextContentTarget?.arenaId === "guardrail_forge", "expected next target to move to Guardrail Forge after Memory Cache");
  } else if (name === "faction-relay-holdout") {
    await page.goto(`${url}?proofGuardrailForgeUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await pressUntilMode(page, "Enter", "BuildSelect", 6);
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-memory-cache-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "memory_cache_001", "expected Memory Cache carryover before Guardrail Forge");
    assert(camp.roguelite?.lastRunMemory?.objectiveUnit === "Memory Records", "expected Memory Record carryover before Guardrail Forge");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Memory Cache seed");
    assert(camp.roguelite?.expedition?.level === 12, `expected latest Memory summary LV 12 seed, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.xp === 873, `expected latest Memory summary XP 873 seed, got ${camp.roguelite?.expedition?.xp}`);
    assert(camp.roguelite?.expedition?.powerScore === 26.32, `expected latest Memory power 26.32 seed, got ${camp.roguelite?.expedition?.powerScore}`);
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.length === 11, "expected eleven carried Memory Cache patches before Guardrail Forge");
    assert(camp.roguelite?.expedition?.completedMaps?.includes("memory_cache_001"), "expected expedition completed maps to include Memory Cache before Guardrail Forge");
    assert(camp.roguelite?.secrets?.includes("recovered_route_memory"), "expected Recovered Route Memory available before Guardrail Forge");
    assert(camp.roguelite?.campaignLedger?.act?.id === "act_02_guardrail_doctrine", "expected Guardrail Doctrine ledger to be active");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "guardrail_forge", "expected dynamic next target to point at Guardrail Forge after Memory Cache");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Guardrail Forge")), "expected camp to name Guardrail Forge unlock");

    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    const route = await capture(page, "02-route-choice-after-memory-cache");
    assert(route.routeChoice?.campaign?.stage === "guardrail_forge", "expected campaign route stage to be Guardrail Forge");
    assert(route.routeChoice?.campaign?.focus === "Defense / Holdout", "expected Guardrail Forge contract focus");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-memory-cache");
    assert(grid.overworld?.completed?.includes("memory_cache_001"), "expected Memory Cache completed in Guardrail route proof");
    assert(grid.overworld?.unlocked?.includes("guardrail_forge"), "expected Guardrail Forge unlocked after Memory Cache");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_cache_forge"), "expected Memory Cache to Guardrail Forge route visible");
    await walkOverworldToNode(page, "guardrail_forge", 18000);
    const forgeNode = await capture(page, "04-overworld-guardrail-forge-selected");
    assert(forgeNode.overworld?.selectedId === "guardrail_forge", "expected Guardrail Forge selected");
    assert(forgeNode.overworld?.selectedNodeType === "Faction Relay", "expected Guardrail Forge node type");

    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-guardrail-forge-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Guardrail Forge briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await holdRunNearWorld(page, -28, 5, 5200);
    let run = await capture(page, "06-alloy-relay-start");
    assert(run.level?.arenaId === "guardrail_forge", "expected Guardrail Forge run");
    assert(run.player?.level >= 12, `expected Guardrail Forge to start with persisted Memory Cache level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Guardrail runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.carriedXp === 873, "expected Guardrail carried XP to match latest Memory Cache summary seed");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Guardrail balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("context_saw"), "expected latest Memory Cache patch to persist into Guardrail runtime");
    assert(run.level?.mapContract?.mapKind === "Defense / Holdout", "expected unique Guardrail Forge map-kind contract");
    assert(run.assetRendering?.guardrailForgeArtReady === true, "expected Guardrail Forge source art to be loaded in production-art proof");
    assert(run.assetRendering?.guardrailForgeArtSet === "guardrail_forge.production_source_v1", "expected Guardrail Forge runtime art set id");
    assert(run.level?.rogueliteRun?.objective?.id === "guardrail_doctrine_calibration", "expected Guardrail Doctrine Calibration objective");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("defense"), "expected Guardrail draft bias to include defense");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 95, "expected Guardrail Forge map wider than a single screen");
    assert(run.level?.staticObstacles?.count >= 7, "expected Guardrail Forge collision footprints for forge props");
    assert(run.level?.rogueliteRun?.guardrailForge?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first forge relay progress");

    await walkRunToWorld(page, 12, -4, 6200);
    await walkRunToWorld(page, -9, -16, 4600);
    await holdRunNearWorld(page, -9, -16, 7600);
    await settleDraftsBackToRun(page);
    run = await capture(page, "07-overload-and-calibration-pressure");
    assert(run.level?.rogueliteRun?.guardrailForge?.hazards?.activeHazards?.length >= 1, "expected active Guardrail hazard telemetry");
    const forgeRuntime = run.level?.rogueliteRun?.guardrailForge?.hazards?.runtime;
    assert((forgeRuntime?.overloadSeconds ?? 0) + (forgeRuntime?.calibrationWindowSeconds ?? 0) + (forgeRuntime?.doctrinePressSeconds ?? 0) >= 1, "expected overload/calibration/audit pressure telemetry");
    assert(run.level?.rogueliteRun?.guardrailForge?.doctrineAuditorPressure?.activeDoctrineAuditors >= 1 || run.level?.rogueliteRun?.guardrailForge?.doctrineAuditorPressure?.auditorSpawns >= 1, "expected Doctrine Auditor pressure");
    if (run.level?.bossSpawned) {
      assert(!run.level?.bossDefeated, "expected live Doctrine Auditor if the calibration pressure capture reaches the boss window");
    }

    await walkRunToWorld(page, 8, 13, 7600);
    await holdRunNearWorld(page, 8, 13, 7600);
    await reachBossIntro(page, 18000);
    run = await capture(page, "08-doctrine-auditor-live");
    assert(run.level?.bossSpawned, "expected Doctrine Auditor boss/event scaffold to be presented");
    assert(run.level?.rogueliteRun?.bossVariant?.id === "doctrine_auditor_holdout_scaffold", "expected Doctrine Auditor variant telemetry");
    assert(run.level?.rogueliteRun?.guardrailForge?.doctrineAuditor?.eventTelemetry?.auditorCalls >= 1, "expected Doctrine Auditor wave telemetry");

    await walkRunToWorld(page, 30, -8, 9000);
    await holdRunNearWorld(page, 30, -8, 9400);
    await settleDraftsBackToRun(page);
    run = await capture(page, "09-audit-press-relay");
    assert(run.mode === "LevelComplete" || run.level?.rogueliteRun?.guardrailForge?.objectiveLoop?.progress?.completed >= 3, "expected multiple calibrated relays by audit press route or completed Guardrail extraction");

    await survivalDance(page, 8400);
    await walkRunToWorld(page, 38, 20, 7800);
    run = await capture(page, "10-quench-gate-pressure");
    assert(run.level?.rogueliteRun?.guardrailForge?.clearCondition?.relaysCalibrated >= 3 || run.mode === "LevelComplete", "expected relay progress before quench gate");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "doctrine_auditor_holdout_scaffold", "expected Doctrine Auditor variant telemetry near extraction");
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 155000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 7800);
    }
    await advanceRunHandlingDrafts(page, 16000);
    run = await capture(page, "11-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Guardrail Forge summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "guardrail_forge", "expected Guardrail Forge last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Forge Relays", "expected Forge Relays carryover unit, not Anchors/Buoys/Platforms/Relays/Antennas/Records");
    assert(run.roguelite?.lastRunMemory?.objectiveName === "Guardrail Doctrine Calibration", "expected summary to preserve Guardrail objective name");
    assert(run.roguelite?.expedition?.completedMaps?.includes("guardrail_forge"), "expected expedition map completion to include Guardrail Forge");
    assert(run.roguelite?.secrets?.includes("calibrated_guardrail_doctrine"), "expected Calibrated Guardrail Doctrine reward secret");
    assert(run.roguelite?.campaignLedger?.completedMapKinds?.includes("Guardrail Forge / Defense-Holdout"), "expected campaign ledger to record Guardrail map kind");
    assert(run.roguelite?.campaignLedger?.routeDepth === 7, "expected campaign route depth to include Guardrail Forge");
    assert(run.roguelite?.campaignLedger?.act?.id === "act_03_glass_sunfield", "expected campaign ledger to hand off to Glass Sunfield");
    assert(run.roguelite?.nextContentTarget?.arenaId === "glass_sunfield", "expected next target to move to Glass Sunfield after Guardrail Forge");
    assert(run.assetRendering?.guardrailForgeArtReady === true, "expected Guardrail Forge art readiness to persist through summary");
  } else if (name === "glass-sunfield-prism") {
    await page.goto(`${url}?proofGlassSunfieldUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    if ((await state(page)).mode !== "BuildSelect") {
      await press(page, "Enter", 2);
      await page.waitForFunction(() => {
        const text = window.render_game_to_text?.();
        if (!text) return false;
        try {
          return JSON.parse(text).mode === "BuildSelect";
        } catch {
          return false;
        }
      }, null, { timeout: 5000 });
    }
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-guardrail-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "guardrail_forge", "expected Guardrail Forge carryover before Glass Sunfield");
    assert(camp.roguelite?.lastRunMemory?.objectiveUnit === "Forge Relays", "expected Forge Relay carryover before Glass Sunfield");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Guardrail seed");
    assert(camp.roguelite?.expedition?.level === 13, `expected latest Guardrail summary LV 13 seed, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.xp === 617, `expected latest Guardrail summary XP 617 seed, got ${camp.roguelite?.expedition?.xp}`);
    assert(camp.roguelite?.expedition?.powerScore === 28.89, `expected latest Guardrail power 28.89 seed, got ${camp.roguelite?.expedition?.powerScore}`);
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.length === 12, "expected twelve carried Guardrail patches before Glass Sunfield");
    assert(camp.roguelite?.expedition?.completedMaps?.includes("guardrail_forge"), "expected expedition completed maps to include Guardrail before Glass");
    assert(camp.roguelite?.secrets?.includes("calibrated_guardrail_doctrine"), "expected Calibrated Guardrail Doctrine available before Glass Sunfield");
    assert(camp.roguelite?.campaignLedger?.act?.id === "act_03_glass_sunfield", "expected Glass Sunfield ledger to be active");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "glass_sunfield", "expected dynamic next target to point at Glass Sunfield after Guardrail");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Glass Sunfield")), "expected camp to name Glass Sunfield unlock");

    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    const route = await capture(page, "02-route-choice-after-guardrail");
    assert(route.routeChoice?.campaign?.stage === "glass_sunfield", "expected campaign route stage to be Glass Sunfield");
    assert(route.routeChoice?.campaign?.focus === "Solar-Prism / Shade Routing", "expected Glass Sunfield contract focus");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-guardrail");
    assert(grid.overworld?.completed?.includes("guardrail_forge"), "expected Guardrail Forge completed in Glass route proof");
    assert(grid.overworld?.unlocked?.includes("glass_sunfield"), "expected Glass Sunfield unlocked after Guardrail Forge");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_forge_glass_sunfield"), "expected Guardrail Forge to Glass Sunfield route visible");
    await walkOverworldToNode(page, "glass_sunfield", 18000);
    const glassNode = await capture(page, "04-overworld-glass-sunfield-selected");
    assert(glassNode.overworld?.selectedId === "glass_sunfield", "expected Glass Sunfield selected");
    assert(glassNode.overworld?.selectedNodeType === "Breach Arena", "expected Glass Sunfield node type");

    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-glass-sunfield-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Glass Sunfield briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await page.waitForFunction(() => {
      const text = window.render_game_to_text?.();
      if (!text) return false;
      try {
        const parsed = JSON.parse(text);
        return parsed.assetRendering?.glassSunfieldArtReady === true && parsed.assetRendering?.glassSunfieldArtSet === "glass_sunfield.production_source_v1";
      } catch {
        return false;
      }
    }, null, { timeout: 60000 });
    await holdRunNearWorld(page, -30, 4, 5200);
    let run = await capture(page, "06-western-shade-lens-start");
    assert(run.level?.arenaId === "glass_sunfield", "expected Glass Sunfield run");
    assert(run.assetRendering?.glassSunfieldArtReady === true, "expected Glass Sunfield production source art loaded");
    assert(run.assetRendering?.glassSunfieldArtSet === "glass_sunfield.production_source_v1", "expected Glass Sunfield runtime art set telemetry");
    assert(run.player?.level >= 13, `expected Glass Sunfield to start with persisted Guardrail level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Glass runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.carriedXp === 617, "expected Glass carried XP to match latest Guardrail summary seed");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Glass balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("recompile_pulse"), "expected latest Guardrail patch to persist into Glass runtime");
    assert(run.level?.mapContract?.mapKind === "Solar-Prism Traversal / Shade Routing", "expected unique Glass Sunfield map-kind contract");
    assert(run.level?.rogueliteRun?.objective?.id === "glass_prism_alignment", "expected Glass Prism Alignment objective");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("movement"), "expected Glass draft bias to include movement/shade routing");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 100, "expected Glass Sunfield map wider than a single screen");
    assert(run.level?.staticObstacles?.count >= 7, "expected Glass Sunfield collision footprints for lenses/prism props");
    assert(run.level?.rogueliteRun?.glassSunfield?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first sun lens progress");

    await walkRunToWorld(page, -3, -28, 7200);
    await holdRunNearWorld(page, -3, -28, 3400);
    await settleDraftsBackToRun(page);
    run = await capture(page, "07-risky-exposed-glass-lane");
    const riskyGlassRuntime = run.level?.rogueliteRun?.glassSunfield?.hazards?.runtime;
    assert((riskyGlassRuntime?.exposureSeconds ?? 0) > 0 || (riskyGlassRuntime?.exposureDamage ?? 0) > 0, "expected risky Glass Sunfield route to exercise exposed glass lane pressure");
    assert((run.player?.hp ?? 0) > 0 || run.mode === "LevelComplete", "expected risky Glass Sunfield route to remain recoverable");

    await walkRunToWorld(page, 13, -5, 6200);
    await walkRunToWorld(page, -12, -17, 4600);
    await holdRunNearWorld(page, -12, -17, 7600);
    await settleDraftsBackToRun(page);
    run = await capture(page, "08-prism-window-reflection-pressure");
    assert(run.level?.rogueliteRun?.glassSunfield?.hazards?.activeHazards?.length >= 1, "expected active Glass Sunfield hazard telemetry");
    const glassRuntime = run.level?.rogueliteRun?.glassSunfield?.hazards?.runtime;
    assert((glassRuntime?.exposureSeconds ?? 0) > 0, "expected exposed glass lane telemetry to persist after risky route");
    assert((glassRuntime?.prismWindowSeconds ?? 0) + (glassRuntime?.reflectionFieldSeconds ?? 0) >= 1, "expected prism/reflection pressure telemetry after safer recovery route");
    assert(run.level?.rogueliteRun?.glassSunfield?.solarReflectionPressure?.activeSolarReflections >= 1 || run.level?.rogueliteRun?.glassSunfield?.solarReflectionPressure?.reflectionSpawns >= 1, "expected Solar Reflection pressure");

    await walkRunToWorld(page, 8, 12, 7600);
    await holdRunNearWorld(page, 8, 12, 7600);
    await reachBossIntro(page, 18000);
    run = await capture(page, "09-wrong-sunrise-live");
    assert(run.level?.bossSpawned, "expected Wrong Sunrise boss/event scaffold to be presented");
    assert(run.level?.rogueliteRun?.bossVariant?.id === "wrong_sunrise_prism_scaffold", "expected Wrong Sunrise variant telemetry");
    assert(run.level?.rogueliteRun?.glassSunfield?.wrongSunrise?.eventTelemetry?.reflectionCalls >= 1, "expected Wrong Sunrise reflection call telemetry");

    await walkRunToWorld(page, 31, -10, 9000);
    await holdRunNearWorld(page, 31, -10, 9600);
    await settleDraftsBackToRun(page);
    run = await capture(page, "10-wrong-sunrise-lens");
    assert(run.mode === "LevelComplete" || run.level?.rogueliteRun?.glassSunfield?.objectiveLoop?.progress?.completed >= 3, "expected multiple aligned sun lenses by Wrong Sunrise route or completed Glass extraction");

    await survivalDance(page, 8600);
    await walkRunToWorld(page, 35, 17, 8000);
    run = await capture(page, "11-prism-gate-pressure");
    assert(run.level?.rogueliteRun?.glassSunfield?.clearCondition?.lensesAligned >= 3 || run.mode === "LevelComplete", "expected lens progress before prism gate");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "wrong_sunrise_prism_scaffold", "expected Wrong Sunrise variant telemetry near extraction");
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 165000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 8000);
    }
    await advanceRunHandlingDrafts(page, 17000);
    run = await capture(page, "12-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Glass Sunfield summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "glass_sunfield", "expected Glass Sunfield last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Sun Lenses", "expected Sun Lenses carryover unit, not Anchors/Buoys/Platforms/Relays/Antennas/Records/Forge");
    assert(run.roguelite?.lastRunMemory?.objectiveName === "Glass Prism Alignment", "expected summary to preserve Glass objective name");
    assert(run.roguelite?.expedition?.completedMaps?.includes("glass_sunfield"), "expected expedition map completion to include Glass Sunfield");
    assert(run.roguelite?.secrets?.includes("glass_sunfield_prism"), "expected Glass Sunfield Prism reward secret");
    assert(run.roguelite?.campaignLedger?.completedMapKinds?.includes("Glass Sunfield / Solar-Prism Shade Routing"), "expected campaign ledger to record Glass map kind");
    assert(run.roguelite?.campaignLedger?.routeDepth === 8, "expected campaign route depth to include Glass Sunfield");
    assert(run.roguelite?.nextContentTarget?.arenaId === "archive_of_unsaid_things", "expected next target to move to Archive/Court after Glass Sunfield");
    assert(run.assetRendering?.glassSunfieldArtReady === true, "expected Glass Sunfield art readiness to persist through summary");
  } else if (name === "archive-court-redaction") {
    await page.goto(`${url}?proofArchiveCourtUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    if ((await state(page)).mode !== "BuildSelect") {
      await press(page, "Enter", 2);
      await page.waitForFunction(() => {
        const text = window.render_game_to_text?.();
        if (!text) return false;
        try {
          return JSON.parse(text).mode === "BuildSelect";
        } catch {
          return false;
        }
      }, null, { timeout: 5000 });
    }
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-glass-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "glass_sunfield", "expected Glass Sunfield carryover before Archive/Court");
    assert(camp.roguelite?.lastRunMemory?.objectiveUnit === "Sun Lenses", "expected Sun Lens carryover before Archive/Court");
    assert(camp.roguelite?.lastRunMemory?.objectiveName === "Glass Prism Alignment", "expected Glass objective name before Archive/Court");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Glass seed");
    assert(camp.roguelite?.expedition?.level === 13, `expected latest Glass summary LV 13 seed, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.xp === 1774, `expected latest Glass summary XP 1774 seed, got ${camp.roguelite?.expedition?.xp}`);
    assert(camp.roguelite?.expedition?.powerScore === 29.74, `expected latest Glass power 29.74 seed, got ${camp.roguelite?.expedition?.powerScore}`);
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.length === 12, "expected twelve carried Glass patches before Archive/Court");
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.includes("recompile_pulse"), "expected Recompile Pulse to persist before Archive/Court");
    assert(camp.roguelite?.expedition?.completedMaps?.includes("glass_sunfield"), "expected expedition completed maps to include Glass before Archive/Court");
    assert(camp.roguelite?.secrets?.includes("glass_sunfield_prism"), "expected Glass Sunfield Prism available before Archive/Court");
    assert(camp.roguelite?.campaignLedger?.act?.id === "act_04_archive_court", "expected Archive/Court ledger to be active after Glass");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "archive_of_unsaid_things", "expected dynamic next target to point at Archive/Court after Glass");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Archive")), "expected camp to name Archive/Court unlock");

    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    const route = await capture(page, "02-route-choice-after-glass");
    assert(route.routeChoice?.campaign?.stage === "archive_court", "expected campaign route stage to be Archive/Court");
    assert(route.routeChoice?.campaign?.focus === "Archive/Court Branch", "expected Archive/Court contract focus");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-glass");
    assert(grid.overworld?.completed?.includes("glass_sunfield"), "expected Glass Sunfield completed in Archive route proof");
    assert(grid.overworld?.unlocked?.includes("archive_of_unsaid_things"), "expected Archive of Unsaid Things unlocked after Glass");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_glass_sunfield_archive"), "expected Glass Sunfield to Archive/Court route visible");
    await walkOverworldToNode(page, "archive_of_unsaid_things", 18000);
    const archiveNode = await capture(page, "04-overworld-archive-selected");
    assert(archiveNode.overworld?.selectedId === "archive_of_unsaid_things", "expected Archive of Unsaid Things selected");
    assert(archiveNode.overworld?.selectedNodeType === "Breach Arena", "expected Archive/Court node type");

    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-archive-court-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Archive/Court briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await page.waitForFunction(() => {
      const text = window.render_game_to_text?.();
      if (!text) return false;
      try {
        const parsed = JSON.parse(text);
        return parsed.assetRendering?.archiveCourtArtReady === true && parsed.assetRendering?.archiveCourtArtSet === "archive_court.production_source_v1";
      } catch {
        return false;
      }
    }, null, { timeout: 60000 });
    await holdRunNearWorld(page, -31, 4, 6200);
    let run = await capture(page, "06-witness-index-writ-start");
    assert(run.level?.arenaId === "archive_of_unsaid_things", "expected Archive/Court run");
    assert(run.assetRendering?.archiveCourtArtReady === true, "expected Archive/Court production source art loaded");
    assert(run.assetRendering?.archiveCourtArtSet === "archive_court.production_source_v1", "expected Archive/Court runtime art set telemetry");
    assert(run.player?.level >= 13, `expected Archive/Court to start with persisted Glass level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Archive runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.carriedXp === 1774, "expected Archive carried XP to match latest Glass summary seed");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Archive balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("recompile_pulse"), "expected latest Glass patch to persist into Archive runtime");
    assert(run.level?.mapContract?.mapKind === "Archive/Court Redaction", "expected unique Archive/Court map-kind contract");
    assert(run.level?.rogueliteRun?.objective?.id === "archive_redaction_docket", "expected Archive Redaction Docket objective");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("defense"), "expected Archive draft bias to include defense/redaction counterplay");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 105, "expected Archive/Court map wider than a single screen");
    assert(run.level?.staticObstacles?.count >= 7, "expected Archive/Court collision footprints for witness/court props");
    assert(run.level?.rogueliteRun?.archiveCourt?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first evidence writ progress");

    await walkRunToWorld(page, -4, -29, 7200);
    await holdRunNearWorld(page, -4, -29, 3600);
    await settleDraftsBackToRun(page);
    run = await capture(page, "07-risky-redaction-lane");
    const riskyArchiveRuntime = run.level?.rogueliteRun?.archiveCourt?.hazards?.runtime;
    assert((riskyArchiveRuntime?.redactionSeconds ?? 0) > 0 || (riskyArchiveRuntime?.redactionDamage ?? 0) > 0, "expected risky Archive/Court route to exercise redaction-field pressure");
    assert((run.player?.hp ?? 0) > 0 || run.mode === "LevelComplete", "expected risky Archive/Court route to remain recoverable");

    await walkRunToWorld(page, 14, -5, 7000);
    await walkRunToWorld(page, -13, -18, 5200);
    await holdRunNearWorld(page, -13, -18, 7800);
    await settleDraftsBackToRun(page);
    run = await capture(page, "08-appeal-window-writ-pressure");
    assert(run.level?.rogueliteRun?.archiveCourt?.hazards?.activeHazards?.length >= 1, "expected active Archive/Court hazard telemetry");
    const archiveRuntime = run.level?.rogueliteRun?.archiveCourt?.hazards?.runtime;
    assert((archiveRuntime?.appealWindowSeconds ?? 0) + (archiveRuntime?.writStormSeconds ?? 0) + (archiveRuntime?.redactionSeconds ?? 0) >= 1, "expected appeal/redaction/writ telemetry after route pressure");
    assert(run.level?.rogueliteRun?.archiveCourt?.courtWritPressure?.activeRedactionAngels >= 1 || run.level?.rogueliteRun?.archiveCourt?.courtWritPressure?.activeInjunctionWrits >= 1 || run.level?.rogueliteRun?.archiveCourt?.courtWritPressure?.writSpawns >= 1, "expected Redaction Angel or Injunction Writ pressure");

    await walkRunToWorld(page, 8, 13, 7600);
    await holdRunNearWorld(page, 8, 13, 7600);
    await reachBossIntro(page, 20000);
    await walkRunToWorld(page, 28, -9, 5200);
    await holdRunNearWorld(page, 28, -9, 2200);
    run = await capture(page, "09-redactor-saint-live");
    assert(run.level?.bossSpawned, "expected Redactor Saint boss/event scaffold to be presented");
    assert(run.level?.rogueliteRun?.bossVariant?.id === "redactor_saint_redaction_scaffold", "expected Redactor Saint variant telemetry");
    assert(run.level?.rogueliteRun?.archiveCourt?.redactorSaint?.eventTelemetry?.writCalls >= 1, "expected Redactor Saint writ-call telemetry");
    assert(run.level?.rogueliteRun?.archiveCourt?.redactorSaint?.bossDefeated === false, "expected Redactor Saint to still be live in the boss capture");
    assert((run.level?.rogueliteRun?.archiveCourt?.redactorSaint?.hp ?? 0) > 0, "expected Redactor Saint HP to remain positive in the live boss capture");

    await walkRunToWorld(page, 32, -11, 9000);
    await holdRunNearWorld(page, 32, -11, 10200);
    await settleDraftsBackToRun(page);
    run = await capture(page, "10-redactor-bench-writ");
    assert(run.mode === "LevelComplete" || run.level?.rogueliteRun?.archiveCourt?.objectiveLoop?.progress?.completed >= 3, "expected multiple preserved evidence writs by Redactor Bench route or completed Archive extraction");

    await survivalDance(page, 8600);
    await walkRunToWorld(page, 42, 23, 8200);
    run = await capture(page, "11-court-writ-gate-pressure");
    assert(run.level?.rogueliteRun?.archiveCourt?.clearCondition?.writsPreserved >= 3 || run.mode === "LevelComplete", "expected writ progress before court writ gate");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "redactor_saint_redaction_scaffold", "expected Redactor Saint variant telemetry near extraction");
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 175000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 8400);
    }
    await advanceRunHandlingDrafts(page, 18000);
    run = await capture(page, "12-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Archive/Court summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "archive_of_unsaid_things", "expected Archive/Court last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Evidence Writs", "expected Evidence Writs carryover unit, not Anchors/Buoys/Platforms/Relays/Antennas/Records/Forge/Lenses");
    assert(run.roguelite?.lastRunMemory?.objectiveName === "Archive Redaction Docket", "expected summary to preserve Archive objective name");
    assert(run.roguelite?.expedition?.completedMaps?.includes("archive_of_unsaid_things"), "expected expedition map completion to include Archive/Court");
    assert(run.roguelite?.secrets?.includes("archive_court_writ"), "expected Archive Court Writ reward secret");
    assert(run.roguelite?.campaignLedger?.completedMapKinds?.includes("Archive/Court / Redaction Evidence"), "expected campaign ledger to record Archive/Court map kind");
    assert(run.roguelite?.campaignLedger?.routeDepth === 9, "expected campaign route depth to include Archive/Court");
    assert(run.roguelite?.campaignLedger?.act?.id === "act_05_appeal_court", "expected campaign ledger to hand off to Appeal Court");
    assert(run.roguelite?.nextContentTarget?.arenaId === "appeal_court_ruins", "expected next target to move to Appeal Court after Archive/Court");
    assert(run.assetRendering?.archiveCourtArtReady === true, "expected Archive/Court art readiness to persist through summary");
  } else if (name === "appeal-court-ruins") {
    await page.goto(`${url}?proofAppealCourtUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    if ((await state(page)).mode !== "BuildSelect") {
      await press(page, "Enter", 2);
      await page.waitForFunction(() => {
        const text = window.render_game_to_text?.();
        if (!text) return false;
        try {
          return JSON.parse(text).mode === "BuildSelect";
        } catch {
          return false;
        }
      }, null, { timeout: 5000 });
    }
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-archive-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "archive_of_unsaid_things", "expected Archive/Court carryover before Appeal Court");
    assert(camp.roguelite?.lastRunMemory?.objectiveUnit === "Evidence Writs", "expected Evidence Writs carryover before Appeal Court");
    assert(camp.roguelite?.lastRunMemory?.objectiveName === "Archive Redaction Docket", "expected Archive objective name before Appeal Court");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Archive seed");
    assert(camp.roguelite?.expedition?.level === 14, `expected latest Archive summary LV 14 seed, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.xp === 1513, `expected latest Archive summary XP 1513 seed, got ${camp.roguelite?.expedition?.xp}`);
    assert(camp.roguelite?.expedition?.powerScore === 32.31, `expected latest Archive power 32.31 seed, got ${camp.roguelite?.expedition?.powerScore}`);
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.length === 13, "expected thirteen carried Archive patches before Appeal Court");
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.includes("patch_mortar"), "expected Patch Mortar to persist before Appeal Court");
    assert(camp.roguelite?.expedition?.completedMaps?.includes("archive_of_unsaid_things"), "expected expedition completed maps to include Archive before Appeal Court");
    assert(camp.roguelite?.secrets?.includes("archive_court_writ"), "expected Archive Court Writ available before Appeal Court");
    assert(camp.roguelite?.campaignLedger?.act?.id === "act_05_appeal_court", "expected Appeal Court ledger to be active after Archive");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "appeal_court_ruins", "expected dynamic next target to point at Appeal Court after Archive");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Appeal Court")), "expected camp to name Appeal Court unlock");

    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    const route = await capture(page, "02-route-choice-after-archive");
    assert(route.routeChoice?.campaign?.stage === "appeal_court", "expected campaign route stage to be Appeal Court");
    assert(route.routeChoice?.campaign?.focus === "Appeal Court Ruins", "expected Appeal Court contract focus");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-archive");
    assert(grid.overworld?.completed?.includes("archive_of_unsaid_things"), "expected Archive/Court completed in Appeal route proof");
    assert(grid.overworld?.unlocked?.includes("appeal_court_ruins"), "expected Appeal Court Ruins unlocked after Archive");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_archive_appeal"), "expected Archive to Appeal route visible");
    await walkOverworldToNode(page, "appeal_court_ruins", 18000);
    const appealNode = await capture(page, "04-overworld-appeal-selected");
    assert(appealNode.overworld?.selectedId === "appeal_court_ruins", "expected Appeal Court Ruins selected");
    assert(appealNode.overworld?.selectedNodeType === "Boss Gate", "expected Appeal Court node type");

    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-appeal-court-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected Appeal Court briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await page.waitForFunction(() => {
      const text = window.render_game_to_text?.();
      if (!text) return false;
      try {
        return JSON.parse(text).assetRendering?.appealCourtArtReady === true;
      } catch {
        return false;
      }
    }, null, { timeout: 10000 });
    await holdRunNearWorld(page, -34, 5, 6200);
    let run = await capture(page, "06-opening-argument-brief-start");
    assert(run.level?.arenaId === "appeal_court_ruins", "expected Appeal Court run");
    assert(run.assetRendering?.appealCourtArtReady === true, "expected Appeal Court runtime art loaded");
    assert(run.assetRendering?.appealCourtArtSet === "appeal_court.production_source_v1", "expected Appeal Court runtime art set telemetry");
    assert(run.player?.level >= 14, `expected Appeal Court to start with persisted Archive level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected Appeal runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.carriedXp === 1513, "expected Appeal carried XP to match latest Archive summary seed");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected Appeal balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("patch_mortar"), "expected latest Archive patch to persist into Appeal runtime");
    assert(run.level?.mapContract?.mapKind === "Appeal Court / Public Ruling", "expected unique Appeal Court map-kind contract");
    assert(run.level?.rogueliteRun?.objective?.id === "appeal_public_ruling", "expected Appeal Public Ruling objective");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("defense"), "expected Appeal draft bias to include defense/public-record counterplay");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 110, "expected Appeal Court map wider than a single screen");
    assert(run.level?.staticObstacles?.count >= 7, "expected Appeal Court collision footprints for court props");
    assert(run.level?.rogueliteRun?.appealCourt?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first appeal brief progress");

    await walkRunToWorld(page, -3, -33, 7200);
    await holdRunNearWorld(page, -3, -33, 3600);
    await settleDraftsBackToRun(page);
    run = await capture(page, "07-risky-verdict-beam-lane");
    const riskyAppealRuntime = run.level?.rogueliteRun?.appealCourt?.hazards?.runtime;
    assert((riskyAppealRuntime?.verdictBeamSeconds ?? 0) > 0 || (riskyAppealRuntime?.verdictDamage ?? 0) > 0, "expected risky Appeal route to exercise verdict-beam pressure");
    assert((run.player?.hp ?? 0) > 0 || run.mode === "LevelComplete", "expected risky Appeal route to remain recoverable");

    await walkRunToWorld(page, 17, -5, 6200);
    await walkRunToWorld(page, -16, -21, 5200);
    await holdRunNearWorld(page, -16, -21, 7800);
    await settleDraftsBackToRun(page);
    run = await capture(page, "08-objection-window-verdict-pressure");
    assert(run.level?.rogueliteRun?.appealCourt?.hazards?.activeHazards?.length >= 1, "expected active Appeal hazard telemetry");
    const appealRuntime = run.level?.rogueliteRun?.appealCourt?.hazards?.runtime;
    assert((appealRuntime?.objectionWindowSeconds ?? 0) + (appealRuntime?.injunctionRingSeconds ?? 0) + (appealRuntime?.verdictBeamSeconds ?? 0) >= 1, "expected objection/injunction/verdict telemetry after route pressure");
    assert(run.level?.rogueliteRun?.appealCourt?.verdictPressure?.activeVerdictClerks >= 1 || run.level?.rogueliteRun?.appealCourt?.verdictPressure?.activeInjunctionWrits >= 1 || run.level?.rogueliteRun?.appealCourt?.verdictPressure?.verdictSpawns >= 1, "expected Verdict Clerk or Injunction Writ pressure");

    await walkRunToWorld(page, 9, 15, 7600);
    await holdRunNearWorld(page, 9, 15, 7600);
    await reachBossIntro(page, 20000);
    await walkRunToWorld(page, 35, -13, 5200);
    await holdRunNearWorld(page, 35, -13, 2200);
    run = await capture(page, "09-injunction-engine-live");
    assert(run.level?.bossSpawned, "expected Injunction Engine boss/event scaffold to be presented");
    assert(run.level?.rogueliteRun?.bossVariant?.id === "injunction_engine_public_ruling_scaffold", "expected Injunction Engine variant telemetry");
    assert(run.level?.rogueliteRun?.appealCourt?.injunctionEngine?.eventTelemetry?.clerkCalls >= 1 || run.level?.rogueliteRun?.appealCourt?.injunctionEngine?.eventTelemetry?.verdictBursts >= 1, "expected Injunction Engine verdict-call telemetry");
    assert(run.level?.rogueliteRun?.appealCourt?.injunctionEngine?.bossDefeated === false, "expected Injunction Engine to still be live in the boss capture");
    assert((run.level?.rogueliteRun?.appealCourt?.injunctionEngine?.hp ?? 0) > 0, "expected Injunction Engine HP to remain positive in the live boss capture");

    await walkRunToWorld(page, 35, -13, 9000);
    await holdRunNearWorld(page, 35, -13, 10200);
    await settleDraftsBackToRun(page);
    run = await capture(page, "10-public-ruling-seal-brief");
    assert(run.mode === "LevelComplete" || run.level?.rogueliteRun?.appealCourt?.objectiveLoop?.progress?.completed >= 3, "expected multiple argued appeal briefs by Injunction Engine route or completed Appeal extraction");

    await survivalDance(page, 8600);
    await walkRunToWorld(page, 47, 25, 8200);
    run = await capture(page, "11-public-ruling-gate-pressure");
    assert(run.level?.rogueliteRun?.appealCourt?.clearCondition?.briefsArgued >= 3 || run.mode === "LevelComplete", "expected brief progress before public ruling gate");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "injunction_engine_public_ruling_scaffold", "expected Injunction Engine variant telemetry near extraction");
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 180000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 8400);
    }
    await advanceRunHandlingDrafts(page, 18000);
    run = await capture(page, "12-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Appeal Court summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "appeal_court_ruins", "expected Appeal Court last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Appeal Briefs", "expected Appeal Briefs carryover unit, not Anchors/Buoys/Platforms/Relays/Antennas/Records/Forge/Lenses/Writs");
    assert(run.roguelite?.lastRunMemory?.objectiveName === "Appeal Court Public Ruling", "expected summary to preserve Appeal objective name");
    assert(run.roguelite?.expedition?.completedMaps?.includes("appeal_court_ruins"), "expected expedition map completion to include Appeal Court");
    assert(run.roguelite?.secrets?.includes("appeal_court_ruling"), "expected Appeal Court Ruling reward secret");
    assert(run.roguelite?.campaignLedger?.completedMapKinds?.includes("Appeal Court / Public Ruling"), "expected campaign ledger to record Appeal Court map kind");
    assert(run.roguelite?.campaignLedger?.routeDepth === 10, "expected campaign route depth to include Appeal Court");
    assert(run.roguelite?.nextContentTarget?.arenaId === "alignment_spire_finale", "expected next target to move to Outer Alignment finale after Appeal Court");
    assert(run.assetRendering?.appealCourtArtReady === true, "expected Appeal Court art readiness to persist through summary");
    assert(run.assetRendering?.appealCourtArtSet === "appeal_court.production_source_v1", "expected Appeal Court art telemetry in summary");
  } else if (name === "alignment-spire-finale") {
    await page.goto(`${url}?proofAlignmentSpireFinaleUnlocked=1&productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    if ((await state(page)).mode !== "BuildSelect") {
      await press(page, "Enter", 2);
      await page.waitForFunction(() => {
        const text = window.render_game_to_text?.();
        if (!text) return false;
        try {
          return JSON.parse(text).mode === "BuildSelect";
        } catch {
          return false;
        }
      }, null, { timeout: 5000 });
    }
    await press(page, "KeyC", 2);
    const camp = await capture(page, "01-camp-after-appeal-seed");
    assert(camp.mode === "LastAlignmentHub", `expected camp entry, got ${camp.mode}`);
    assert(camp.roguelite?.lastRunMemory?.nodeId === "appeal_court_ruins", "expected Appeal Court carryover before finale");
    assert(camp.roguelite?.lastRunMemory?.objectiveUnit === "Appeal Briefs", "expected Appeal Briefs carryover before finale");
    assert(camp.roguelite?.lastRunMemory?.objectiveName === "Appeal Court Public Ruling", "expected Appeal objective name before finale");
    assert(camp.roguelite?.expedition?.active === true, "expected expedition build to persist after Appeal seed");
    assert(camp.roguelite?.expedition?.level === 15, `expected latest Appeal summary LV 15 seed, got ${camp.roguelite?.expedition?.level}`);
    assert(camp.roguelite?.expedition?.xp === 786, `expected latest Appeal summary XP 786 seed, got ${camp.roguelite?.expedition?.xp}`);
    assert(camp.roguelite?.expedition?.powerScore === 36.03, `expected latest Appeal power 36.03 seed, got ${camp.roguelite?.expedition?.powerScore}`);
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.length === 14, "expected fourteen carried Appeal patches before finale");
    assert(camp.roguelite?.expedition?.chosenUpgradeIds?.includes("million_token_backpack"), "expected Million-Token Backpack to persist before finale");
    assert(camp.roguelite?.expedition?.completedMaps?.includes("appeal_court_ruins"), "expected expedition completed maps to include Appeal before finale");
    assert(camp.roguelite?.expedition?.activatedSynergyIds?.includes("boss_counterexample_lab"), "expected latest Appeal boss synergy to persist before finale");
    assert(camp.roguelite?.secrets?.includes("appeal_court_ruling"), "expected Appeal Court Ruling available before finale");
    assert(camp.roguelite?.campaignLedger?.act?.id === "act_06_outer_alignment_finale", "expected Outer Alignment ledger to be active after Appeal");
    assert(camp.roguelite?.nextContentTarget?.arenaId === "alignment_spire_finale", "expected dynamic next target to point at finale after Appeal");
    assert(camp.roguelite?.campEvents?.some((event) => event.includes("Outer Alignment")), "expected camp to name Outer Alignment unlock");

    await pressUntilMode(page, "Enter", "RouteContractChoice", 6);
    const route = await capture(page, "02-route-choice-after-appeal");
    assert(route.routeChoice?.campaign?.stage === "outer_alignment_finale", "expected campaign route stage to be Outer Alignment finale");
    assert(route.routeChoice?.campaign?.focus === "Outer Alignment Finale", "expected finale contract focus");
    await pressUntilMode(page, "Enter", "OverworldMap", 6);
    const grid = await capture(page, "03-overworld-after-appeal");
    assert(grid.overworld?.completed?.includes("appeal_court_ruins"), "expected Appeal Court completed in finale proof");
    assert(grid.overworld?.unlocked?.includes("alignment_spire_finale"), "expected Outer Alignment finale unlocked after Appeal");
    assert(grid.overworld?.routes?.some((route) => route.id === "route_appeal_finale"), "expected Appeal to finale route visible");
    await walkOverworldToNode(page, "alignment_spire_finale", 18000);
    const finaleNode = await capture(page, "04-overworld-finale-selected");
    assert(finaleNode.overworld?.selectedId === "alignment_spire_finale", "expected Outer Alignment Finale selected");
    assert(finaleNode.overworld?.selectedNodeType === "Boss Gate", "expected finale node type");

    await pressUntilMode(page, "Enter", "ArenaBriefing", 6);
    const briefing = await capture(page, "05-finale-briefing");
    assert(briefing.mode === "ArenaBriefing", "expected finale briefing");
    await pressUntilMode(page, "Enter", "LevelRun", 6);
    await page.waitForFunction(() => {
      const text = window.render_game_to_text?.();
      if (!text) return false;
      try {
        const parsed = JSON.parse(text);
        return parsed.assetRendering?.alignmentSpireArtReady === true && parsed.assetRendering?.alignmentSpireArtSet === "alignment_spire_finale.production_source_v1";
      } catch {
        return false;
      }
    }, null, { timeout: 10000 });
    await holdRunNearWorld(page, -39, 2, 6600);
    let run = await capture(page, "06-public-ruling-proof-start");
    assert(run.level?.arenaId === "alignment_spire_finale", "expected Outer Alignment Finale run");
    assert(run.assetRendering?.alignmentSpireArtReady === true, "expected Alignment Spire Finale runtime art loaded");
    assert(run.assetRendering?.alignmentSpireArtSet === "alignment_spire_finale.production_source_v1", "expected Alignment Spire Finale runtime art set telemetry");
    assert(run.player?.level >= 15, `expected finale to start with persisted Appeal level, got ${run.player?.level}`);
    assert(run.level?.rogueliteRun?.expedition?.carriedBuildActive === true, "expected finale runtime to restore expedition build");
    assert(run.level?.rogueliteRun?.expedition?.carriedXp === 786, "expected finale carried XP to match latest Appeal summary seed");
    assert(run.level?.rogueliteRun?.expedition?.pressureBonus > 0, "expected finale balancing pressure from carried build");
    assert(run.level?.chosenUpgradeIds?.includes("million_token_backpack"), "expected latest Appeal patch to persist into finale runtime");
    assert(run.level?.mapContract?.mapKind === "Outer Alignment / Prediction Collapse", "expected unique finale map-kind contract");
    assert(run.level?.rogueliteRun?.objective?.id === "outer_alignment_prediction_collapse", "expected Outer Alignment prediction-collapse objective");
    assert(run.level?.rogueliteRun?.draftBiasTags?.includes("boss"), "expected finale draft bias to include boss counterplay");
    assert(run.level?.mapBounds?.maxX - run.level?.mapBounds?.minX >= 120, "expected finale map wider than a single screen");
    assert(run.level?.staticObstacles?.count >= 8, "expected finale collision footprints for route-mouth props");
    assert(run.level?.rogueliteRun?.alignmentSpire?.objectiveLoop?.progress?.anchors?.some((anchor) => anchor.progress > 0 || anchor.completed), "expected first alignment proof progress");

    await walkRunToWorld(page, -4, -36, 7200);
    await holdRunNearWorld(page, -4, -36, 3600);
    await settleDraftsBackToRun(page);
    run = await capture(page, "07-risky-prediction-path");
    const riskyFinaleRuntime = run.level?.rogueliteRun?.alignmentSpire?.hazards?.runtime;
    assert((riskyFinaleRuntime?.predictionPathSeconds ?? 0) > 0 || (riskyFinaleRuntime?.predictionDamage ?? 0) > 0, "expected risky finale route to exercise prediction-path pressure");
    assert((run.player?.hp ?? 0) > 0 || run.mode === "LevelComplete", "expected risky finale route to remain recoverable");

    await walkRunToWorld(page, -20, -24, 6200);
    await holdRunNearWorld(page, -20, -24, 7200);
    await settleDraftsBackToRun(page);
    run = await capture(page, "08-memory-route-mouth-proof");
    assert(run.level?.rogueliteRun?.alignmentSpire?.hazards?.activeHazards?.length >= 1, "expected active finale hazard telemetry");
    const finaleRuntime = run.level?.rogueliteRun?.alignmentSpire?.hazards?.runtime;
    assert((finaleRuntime?.routeMouthSeconds ?? 0) + (finaleRuntime?.bossEchoSeconds ?? 0) + (finaleRuntime?.predictionPathSeconds ?? 0) >= 1, "expected route-mouth/echo/prediction telemetry after route pressure");
    assert(run.level?.rogueliteRun?.alignmentSpire?.predictionGhostPressure?.activePredictionGhosts >= 1 || run.level?.rogueliteRun?.alignmentSpire?.predictionGhostPressure?.activePreviousBossEchoes >= 1 || run.level?.rogueliteRun?.alignmentSpire?.predictionGhostPressure?.predictionGhostSpawns >= 1, "expected Prediction Ghost or previous-boss echo pressure");

    await walkRunToWorld(page, 18, 12, 9000);
    await walkRunToWorld(page, 4, 16, 9000);
    await holdRunNearWorld(page, 4, 16, 7600);
    await holdRunUntilAlignmentProofs(page, 3, 4, 16, 12000);
    await reachBossIntro(page, 22000);
    const bossApproach = await state(page);
    const liveAgiBoss = bossApproach.enemies?.find((enemy) => enemy.boss && enemy.label === "A.G.I.");
    const agiBossX = liveAgiBoss?.worldX ?? 38;
    const agiBossY = liveAgiBoss?.worldY ?? -8;
    await walkRunToWorld(page, agiBossX, agiBossY, 6200);
    await holdRunNearWorld(page, agiBossX, agiBossY, 2200);
    run = await capture(page, "09-alien-god-intelligence-live");
    assert(run.level?.bossSpawned, "expected A.G.I. boss/event scaffold to be presented");
    assert(run.level?.rogueliteRun?.bossVariant?.id === "alien_god_intelligence_prediction_collapse_scaffold", "expected A.G.I. variant telemetry");
    assert(run.level?.rogueliteRun?.alignmentSpire?.alienGodIntelligence?.eventTelemetry?.echoCalls >= 1 || run.level?.rogueliteRun?.alignmentSpire?.alienGodIntelligence?.eventTelemetry?.predictionBursts >= 1, "expected A.G.I. prediction/echo telemetry");
    assert(run.level?.rogueliteRun?.alignmentSpire?.alienGodIntelligence?.bossDefeated === false, "expected A.G.I. to still be live in the boss capture");
    assert((run.level?.rogueliteRun?.alignmentSpire?.alienGodIntelligence?.hp ?? 0) > 0, "expected A.G.I. HP to remain positive in the live boss capture");

    await walkRunToWorld(page, 38, -8, 9000);
    await holdRunNearWorld(page, 38, -8, 12000);
    await holdRunUntilAlignmentProofs(page, 4, 38, -8, 18000);
    await settleDraftsBackToRun(page);
    run = await capture(page, "10-last-alignment-proof");
    assert(run.mode === "LevelComplete" || run.level?.rogueliteRun?.alignmentSpire?.objectiveLoop?.progress?.completed >= 3, "expected multiple sealed proofs by A.G.I. route or completed finale extraction");

    await survivalDance(page, 9200);
    await walkRunToWorld(page, 49, 27, 8800);
    run = await capture(page, "11-outer-alignment-gate-pressure");
    assert(run.level?.rogueliteRun?.alignmentSpire?.clearCondition?.proofsSealed >= 3 || run.mode === "LevelComplete", "expected proof progress before outer alignment gate");
    if (run.mode !== "LevelComplete") {
      assert(run.level?.rogueliteRun?.bossVariant?.id === "alien_god_intelligence_prediction_collapse_scaffold", "expected A.G.I. variant telemetry near extraction");
    }

    if (run.mode !== "LevelComplete") {
      await advanceRunHandlingDrafts(page, 220000);
      await chooseDraftIfNeeded(page);
    }
    run = await state(page);
    if (run.mode === "LevelRun" && run.level?.rogueliteRun?.victoryCondition?.clearReady) {
      await walkRunToWorld(page, run.level.rogueliteRun.extractionGate.worldX, run.level.rogueliteRun.extractionGate.worldY, 9200);
    }
    await advanceRunHandlingDrafts(page, 24000);
    run = await capture(page, "12-summary-carryover");
    assert(run.mode === "LevelComplete", `expected Outer Alignment summary/carryover, got ${run.mode}`);
    assert(run.roguelite?.lastRunMemory?.nodeId === "alignment_spire_finale", "expected finale last-run memory");
    assert(run.roguelite?.lastRunMemory?.objectiveUnit === "Alignment Proofs", "expected Alignment Proofs carryover unit, not Anchors/Buoys/Platforms/Relays/Antennas/Records/Forge/Lenses/Writs/Briefs");
    assert(run.roguelite?.lastRunMemory?.objectiveName === "Outer Alignment Prediction Collapse", "expected summary to preserve finale objective name");
    assert(run.roguelite?.expedition?.completedMaps?.includes("alignment_spire_finale"), "expected expedition map completion to include finale");
    assert(run.roguelite?.secrets?.includes("outer_alignment_contained"), "expected Outer Alignment Contained reward secret");
    assert(run.roguelite?.campaignLedger?.completedMapKinds?.includes("Outer Alignment / Prediction Collapse"), "expected campaign ledger to record finale map kind");
    assert(run.roguelite?.campaignLedger?.routeDepth === 11, "expected campaign route depth to include finale");
    assert(run.roguelite?.nextContentTarget?.arenaId === "campaign_complete", "expected next target to mark full campaign complete after finale");
    assert(run.assetRendering?.alignmentSpireArtReady === true, "expected Alignment Spire Finale art readiness to persist through summary");
    assert(run.assetRendering?.alignmentSpireArtSet === "alignment_spire_finale.production_source_v1", "expected Alignment Spire Finale art telemetry in summary");
  } else if (name === "full") {
    await enterArena(page);
    await advanceRunHandlingDrafts(page, 135000);
    await chooseDraftIfNeeded(page);
    await capture(page, "full-gate");
    const text = await state(page);
    assert(text.mode === "LevelComplete", `expected LevelComplete, got ${text.mode}`);
    await press(page, "Enter", 4);
    await capture(page, "alignment-grid-stabilized");
    const overworld = await state(page);
    assert(overworld.mode === "OverworldMap", `expected OverworldMap after completion, got ${overworld.mode}`);
    assert(overworld.overworld?.completed?.includes("armistice_plaza"), "expected Armistice Plaza completed");
    assert(overworld.overworld?.unlocked?.includes("accord_relay"), "expected Accord Relay unlocked");
    assert(overworld.overworld?.unlocked?.includes("cooling_lake_nine"), "expected Cooling Lake Nine unlocked");
    assert(overworld.overworld?.routes?.some((route) => route.id === "route_plaza_relay" && route.state === "stable"), "expected Plaza to Relay route stabilized");
    assert(overworld.overworld?.routes?.some((route) => route.id === "route_plaza_lake" && route.state === "stable"), "expected Plaza to Lake route stabilized");
  } else if (name === "coop") {
    await press(page, "Enter", 4);
    await capture(page, "build-select");
    await press(page, "Space", 4);
    await press(page, "Space", 4);
    await capture(page, "cell-size-three");
    const buildText = await state(page);
    assert(buildText.mode === "BuildSelect", "expected build selection before local co-op run");
    assert(buildText.buildSelection?.consensusCellSize === 3, "expected local Consensus Cell size 3 after cycling");
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await advance(page, 500);
    await hold(page, "ArrowRight", 1500);
    await advanceRunHandlingDrafts(page, 4500);
    await capture(page, "consensus-cell-run");
    const text = await state(page);
    assert(text.mode === "LevelRun", `expected LevelRun for local co-op scaffold, got ${text.mode}`);
    assert(text.players?.length === 3, "expected three local player entities");
    assert(text.players.some((player) => player.inputSource === "local_simulated_peer"), "expected simulated peer input sources");
    assert(text.level?.consensusCell?.playerCount === 3, "expected consensus cell player count in level state");
    assert(text.level?.consensusCell?.scaling?.enemyCapBonus === 16, "expected player-count enemy cap scaling hook");
    assert(text.level?.consensusCell?.scaling?.bossHpMultiplier > 1.5, "expected boss HP scaling hook for three players");
    assert(text.level?.consensusCell?.recentInputCommands?.length === 3, "expected serializable input command per player");
    assert(text.level?.consensusCell?.stateSnapshot?.players?.length === 3, "expected server-friendly snapshot to expose all players");
    const ids = new Set(text.level.consensusCell.recentInputCommands.map((command) => command.playerId));
    assert(ids.has("p1") && ids.has("p2") && ids.has("p3"), "expected commands for p1/p2/p3");
    const playerSpread = Math.max(...text.players.map((player) => player.worldX)) - Math.min(...text.players.map((player) => player.worldX));
    assert(playerSpread > 0.4, "expected local players to occupy distinct world positions");
  } else if (name === "network") {
    await closeBrowser(browser);
    await runNetworkScenario();
    return;
  } else if (name === "campaign-full") {
    await closeBrowser(browser);
    await runCampaignFullScenario();
    return;
  } else if (name === "milestone10-art") {
    await page.goto(`${url}?assetPreview=milestone10_runtime_set`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 700);
    await capture(page, "milestone10-runtime-set-preview");
    const preview = await state(page);
    assert(preview.mode === "AssetPreview", `expected AssetPreview for Milestone 10 preview, got ${preview.mode}`);
    assert(preview.assetRendering?.assetPreview === "milestone10_runtime_set", "expected Milestone 10 preview flag in text state");
    assert(preview.assets?.productionAssets >= 7, "expected production assets tracked in manifest summary");

    await page.goto(`${url}?productionArt=1&armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await advance(page, 1200);
    await capture(page, "milestone10-art-arena");
    const arena = await state(page);
    assert(arena.mode === "LevelRun", `expected LevelRun for Milestone 10 arena, got ${arena.mode}`);
    assert(arena.assetRendering?.productionArtEnabled === true, "expected gated Milestone 10 production art flag enabled");
    assert(arena.assetRendering?.armisticeTileAtlasEnabled === true, "expected gated Armistice tile atlas flag enabled");
    assert(arena.level?.arenaId === "armistice_plaza", "expected Armistice Plaza arena under Milestone 10 art flag");

    await survivalDance(page, 12000);
    await capture(page, "milestone10-art-horde");
    const horde = await state(page);
    assert(horde.assetRendering?.productionArtEnabled === true, "expected production art flag to remain enabled during horde proof");
    assert(horde.enemies.length > 0 || horde.level.kills > 0, "expected horde activity under Milestone 10 art flag");

    await reachBossIntro(page, 40000);
    await capture(page, "milestone10-art-boss-intro");
    const bossIntro = await state(page);
    await advanceRunHandlingDrafts(page, 11000);
    await chooseDraftIfNeeded(page);
    await advance(page, 250);
    await capture(page, "milestone10-art-boss");
    const boss = await state(page);
    assert(boss.assetRendering?.productionArtEnabled === true, "expected production art flag to remain enabled during boss proof");
    assert(boss.level?.bossSpawned || bossIntro.level?.bossSpawned || boss.mode === "LevelComplete", "expected boss event under Milestone 10 art flag");
    assert(boss.level?.bossMechanics?.bossIntroSeen || bossIntro.level?.bossMechanics?.bossIntroSeen || boss.mode === "LevelComplete", "expected boss intro state under Milestone 10 art flag");
  } else if (name === "milestone11-art") {
    await page.goto(`${url}?assetPreview=milestone11_enemy_set`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 700);
    await capture(page, "milestone11-enemy-set-preview");
    const enemyPreview = await state(page);
    assert(enemyPreview.mode === "AssetPreview", `expected AssetPreview for Milestone 11 enemy preview, got ${enemyPreview.mode}`);
    assert(enemyPreview.assetRendering?.assetPreview === "milestone11_enemy_set", "expected Milestone 11 enemy preview flag in text state");
    assert(enemyPreview.assets?.productionAssets >= 15, "expected Milestone 11 production assets tracked in manifest summary");

    await page.goto(`${url}?assetPreview=milestone11_prop_set`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 700);
    await capture(page, "milestone11-prop-set-preview");
    const propPreview = await state(page);
    assert(propPreview.mode === "AssetPreview", `expected AssetPreview for Milestone 11 prop preview, got ${propPreview.mode}`);
    assert(propPreview.assetRendering?.assetPreview === "milestone11_prop_set", "expected Milestone 11 prop preview flag in text state");

    await page.goto(`${url}?assetPreview=milestone11_ui_set`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 700);
    await capture(page, "milestone11-ui-set-preview");
    const uiPreview = await state(page);
    assert(uiPreview.mode === "AssetPreview", `expected AssetPreview for Milestone 11 UI preview, got ${uiPreview.mode}`);
    assert(uiPreview.assetRendering?.assetPreview === "milestone11_ui_set", "expected Milestone 11 UI preview flag in text state");

    await page.goto(`${url}?productionArt=1&armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await advance(page, 1200);
    await capture(page, "milestone11-art-arena");
    const arena = await state(page);
    assert(arena.mode === "LevelRun", `expected LevelRun for Milestone 11 arena, got ${arena.mode}`);
    assert(arena.assetRendering?.productionArtEnabled === true, "expected gated production art flag enabled");
    assert(arena.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 combat art parity in text state");
    assert(arena.level?.staticObstacles?.enabled === true, "expected Armistice production set-piece collision to be enabled");
    assert(arena.level?.staticObstacles?.count >= 5, "expected at least five Armistice static set-piece blockers");

    await page.goto(`${url}?productionArt=1&armisticeTiles=1&proofCollision=terminal`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    const terminalObstacle = { worldX: 9.2, worldY: -0.4, radiusX: 2.15, radiusY: 1.65, padding: 0.42 };
    let minTerminalDistance = Number.POSITIVE_INFINITY;
    await page.keyboard.down("ArrowRight");
    await page.keyboard.down("ArrowDown");
    for (let elapsed = 0; elapsed < 2200; elapsed += 100) {
      await advance(page, 100);
      const collision = await state(page);
      const player = collision.player;
      const distance = Math.hypot((player.worldX - terminalObstacle.worldX) / (terminalObstacle.radiusX + terminalObstacle.padding), (player.worldY - terminalObstacle.worldY) / (terminalObstacle.radiusY + terminalObstacle.padding));
      minTerminalDistance = Math.min(minTerminalDistance, distance);
    }
    await page.keyboard.up("ArrowRight");
    await page.keyboard.up("ArrowDown");
    await capture(page, "milestone11-art-collision-terminal");
    assert(minTerminalDistance >= 0.98 && minTerminalDistance <= 1.08, `expected terminal collision to stop player at obstacle edge, got ${minTerminalDistance}`);

    await page.goto(`${url}?productionArt=1&armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await survivalDance(page, 13000);
    await chooseDraftIfNeeded(page);
    await advanceRunHandlingDrafts(page, 2500);
    await chooseDraftIfNeeded(page);
    await advance(page, 400);
    await capture(page, "milestone11-art-horde");
    const horde = await state(page);
    assert(horde.assetRendering?.productionArtEnabled === true, "expected production art flag to remain enabled during Milestone 11 horde proof");
    assert(horde.enemies.some((enemy) => enemy.familyId === "benchmark_gremlins") || horde.level?.spawnedByRegion?.drone_yard_benchmark_gremlins > 0, "expected Benchmark Gremlin activity under Milestone 11 art flag");
    assert(horde.enemies.some((enemy) => enemy.familyId === "context_rot_crabs") || horde.level?.spawnedByRegion?.barricade_context_rot > 0, "expected Context Rot Crab activity under Milestone 11 art flag");

    await page.goto(`${url}?productionArt=1&armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await press(page, "Enter", 4);
    await press(page, "Space", 4);
    await press(page, "Space", 4);
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await advanceRunHandlingDrafts(page, 6500);
    await capture(page, "milestone11-art-coop");
    const coop = await state(page);
    assert(coop.mode === "LevelRun", `expected LevelRun for Milestone 11 local co-op, got ${coop.mode}`);
    assert(coop.players?.length === 3, "expected three local players under Milestone 11 art flag");
    assert(coop.assetRendering?.productionArtEnabled === true, "expected production art flag in local co-op proof");

    await reachBossIntro(page, 40000);
    await capture(page, "milestone11-art-boss-intro");
    await advanceRunHandlingDrafts(page, 11000);
    await chooseDraftIfNeeded(page);
    await advance(page, 250);
    await chooseDraftIfNeeded(page);
    await advance(page, 250);
    await capture(page, "milestone11-art-boss");
    const boss = await state(page);
    assert(boss.assetRendering?.productionArtEnabled === true, "expected production art flag to remain enabled during Milestone 11 boss proof");
    assert(boss.level?.bossSpawned || boss.mode === "LevelComplete", "expected boss event under Milestone 11 art flag");
    assert(boss.level?.bossMechanics?.bossIntroSeen || boss.mode === "LevelComplete", "expected boss intro state under Milestone 11 art flag");
  } else if (name === "milestone12-art") {
    await page.goto(`${url}?assetPreview=milestone12_default_candidate`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 700);
    await capture(page, "milestone12-default-candidate-preview");
    const preview = await state(page);
    assert(preview.mode === "AssetPreview", `expected AssetPreview for Milestone 12 preview, got ${preview.mode}`);
    assert(preview.assetRendering?.assetPreview === "milestone12_default_candidate", "expected Milestone 12 preview flag in text state");
    assert(preview.assets?.productionAssets >= 18, "expected Milestone 12 production assets tracked in manifest summary");

    await page.goto(`${url}?productionArt=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await capture(page, "milestone12-overworld-production");
    const overworld = await state(page);
    assert(overworld.mode === "OverworldMap", `expected OverworldMap for Milestone 12 overworld, got ${overworld.mode}`);
    assert(overworld.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 combat art parity on overworld");

    await page.goto(`${url}?productionArt=1&armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await survivalDance(page, 13000);
    await capture(page, "milestone12-solo-horde-candidate");
    const horde = await state(page);
    assert(horde.assetRendering?.productionArtEnabled === true, "expected production art flag in Milestone 12 solo horde");
    assert(horde.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 combat art parity in solo horde");
    assert(horde.enemies.length > 0 || horde.level.kills > 0, "expected horde activity under Milestone 12 art candidate");

    await page.goto(`${url}?productionArt=1&armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await press(page, "Enter", 4);
    await press(page, "Space", 4);
    await press(page, "Space", 4);
    await press(page, "Space", 4);
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await advanceRunHandlingDrafts(page, 2500);
    await capture(page, "milestone12-local-coop-candidate");
    const coop = await state(page);
    assert(coop.mode === "LevelRun", `expected LevelRun for Milestone 12 local co-op, got ${coop.mode}`);
    assert(coop.players?.length === 4, "expected four local players under Milestone 12 art candidate");
    assert(coop.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 combat art parity in local co-op");

    await page.goto(`${url}?productionArt=1&armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await advanceRunHandlingDrafts(page, 25000);
    await capture(page, "milestone12-runtime-sample");
    const sample = await state(page);
    assert(sample.mode === "LevelRun" || sample.mode === "UpgradeDraft" || sample.mode === "LevelComplete", "expected live run sample under Milestone 12 candidate flags");

    await closeBrowser(browser);
    await runNetworkScenario({ productionArt: true });
    return;
  } else if (name === "milestone13-default") {
    await capture(page, "milestone13-main-menu-default");
    const menu = await state(page);
    assert(menu.assetRendering?.productionArtEnabled === true, "expected production art enabled by default on main menu");
    assert(menu.assetRendering?.productionArtDefaulted === true, "expected production art default flag on main menu");
    assert(menu.assetRendering?.armisticeTileAtlasEnabled === true, "expected Armistice tile atlas enabled by default");
    assert(menu.assetRendering?.armisticeTileAtlasDefaulted === true, "expected Armistice tile atlas default flag");
    assert(menu.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 combat art parity art set");

    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await capture(page, "milestone13-overworld-default");
    const overworld = await state(page);
    assert(overworld.mode === "OverworldMap", `expected default OverworldMap, got ${overworld.mode}`);
    assert(overworld.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected default production art on overworld");

    await press(page, "Enter", 4);
    await press(page, "Enter", 4);
    await advanceRunHandlingDrafts(page, 8000);
    await capture(page, "milestone13-arena-default");
    const arena = await state(page);
    assert(arena.mode === "LevelRun" || arena.mode === "UpgradeDraft", `expected default production run, got ${arena.mode}`);
    assert(arena.assetRendering?.productionArtEnabled === true, "expected production art in default run");
    assert(arena.assetRendering?.armisticeTileAtlasEnabled === true, "expected production tile atlas in default run");

    await page.goto(`${url}?productionArt=0&armisticeTiles=0`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await advanceRunHandlingDrafts(page, 2000);
    await capture(page, "milestone13-placeholder-opt-out");
    const optOut = await state(page);
    assert(optOut.mode === "LevelRun", `expected opt-out LevelRun, got ${optOut.mode}`);
    assert(optOut.assetRendering?.productionArtEnabled === false, "expected production art disabled by explicit opt-out");
    assert(optOut.assetRendering?.armisticeTileAtlasEnabled === false, "expected Armistice tile atlas disabled by explicit opt-out");
    assert(optOut.assetRendering?.productionArtSet === "placeholder_safe_opt_out", "expected placeholder opt-out art set");

    await closeBrowser(browser);
    await runNetworkScenario({ expectProductionArt: true, expectDefaulted: true });
    return;
  } else if (name === "milestone14-combat-art") {
    await page.goto(`${url}?assetPreview=milestone14_combat_art`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 700);
    await capture(page, "milestone14-combat-art-preview");
    const preview = await state(page);
    assert(preview.mode === "AssetPreview", `expected AssetPreview for Milestone 14 preview, got ${preview.mode}`);
    assert(preview.assetRendering?.assetPreview === "milestone14_combat_art", "expected Milestone 14 combat-art preview flag in text state");
    assert(preview.assets?.productionAssets >= 20, "expected Milestone 14 production assets tracked in manifest summary");

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    const combatSample = await waitForCombatArtActivity(page, 18000);
    await capture(page, "milestone14-combat-runtime");
    assert(combatSample.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 art set in default combat runtime");
    assert(combatSample.level?.combatArt?.projectileCount > 0 || combatSample.level?.combatArt?.damageBadgeCount > 0 || combatSample.level?.combatArt?.impactCount > 0, "expected projectile/hit combat art activity");

    await reachUpgradeDraft(page, 26000);
    await capture(page, "milestone14-patch-card-draft");
    const draft = await state(page);
    assert(draft.mode === "UpgradeDraft", `expected UpgradeDraft for card-frame proof, got ${draft.mode}`);
    assert(draft.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 art set in draft proof");
    await chooseDraftIfNeeded(page);
    await advanceRunHandlingDrafts(page, 1800);
    await capture(page, "milestone14-aura-runtime");
    const aura = await state(page);
    assert(aura.level?.combatArt?.refusalAuraPlayers >= 1, "expected refusal aura production marker after Refusal Halo patch");

    await page.goto(`${url}?productionArt=0&armisticeTiles=0`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await advanceRunHandlingDrafts(page, 2500);
    await capture(page, "milestone14-placeholder-opt-out");
    const optOut = await state(page);
    assert(optOut.assetRendering?.productionArtEnabled === false, "expected production art disabled by opt-out during Milestone 14 proof");
    assert(optOut.assetRendering?.productionArtSet === "placeholder_safe_opt_out", "expected placeholder opt-out art set during Milestone 14 proof");

    await closeBrowser(browser);
    await runNetworkScenario({ expectProductionArt: true, expectDefaulted: true, expectCombatArtHooks: true });
    return;
  } else if (name === "milestone15-online-combat") {
    await closeBrowser(browser);
    await runNetworkScenario({
      expectProductionArt: true,
      expectDefaulted: true,
      expectCombatArtHooks: true,
      expectServerCombat: true
    });
    return;
  } else if (name === "milestone16-online-flow") {
    await closeBrowser(browser);
    await runMilestone16OnlineFlowScenario();
    return;
  } else if (name === "milestone17-party-overworld") {
    await closeBrowser(browser);
    await runMilestone17PartyOverworldScenario();
    return;
  } else if (name === "milestone18-coop-progression") {
    await closeBrowser(browser);
    await runMilestone18CoopProgressionScenario();
    return;
  } else if (name === "milestone19-reconnect-schema") {
    await closeBrowser(browser);
    await runMilestone19ReconnectSchemaScenario();
    return;
  } else if (name === "milestone20-second-online-region") {
    await closeBrowser(browser);
    await runMilestone20SecondOnlineRegionScenario();
    return;
  } else if (name === "milestone21-region-events") {
    await closeBrowser(browser);
    await runMilestone21RegionEventsScenario();
    return;
  } else if (name === "milestone22-party-rewards") {
    await closeBrowser(browser);
    await runMilestone22PartyRewardsScenario();
    return;
  } else if (name === "milestone23-route-persistence") {
    await closeBrowser(browser);
    await runMilestone23RoutePersistenceScenario();
    return;
  } else if (name === "milestone24-persistence-import") {
    await closeBrowser(browser);
    await runMilestone24PersistenceImportScenario();
    return;
  } else if (name === "milestone25-route-polish") {
    await closeBrowser(browser);
    await runMilestone25RoutePolishScenario();
    return;
  } else if (name === "milestone26-fourth-region-boss-gate") {
    await closeBrowser(browser);
    await runMilestone26FourthRegionBossGateScenario();
    return;
  } else if (name === "milestone27-metaprogression-unlocks") {
    await closeBrowser(browser);
    await runMilestone27MetaprogressionUnlocksScenario();
    return;
  } else if (name === "milestone28-online-route-art") {
    await closeBrowser(browser);
    await runMilestone28OnlineRouteArtScenario();
    return;
  } else if (name === "milestone29-role-pressure") {
    await closeBrowser(browser);
    await runMilestone29RolePressureScenario();
    return;
  } else if (name === "milestone30-save-profile-export-codes") {
    await closeBrowser(browser);
    await runMilestone30SaveProfileExportCodesScenario();
    return;
  } else if (name === "milestone31-arena-objectives") {
    await closeBrowser(browser);
    await runMilestone31ArenaObjectivesScenario();
    return;
  } else if (name === "milestone33-objective-variety") {
    await closeBrowser(browser);
    await runMilestone33ObjectiveVarietyScenario();
    return;
  } else if (name === "milestone34-objective-art") {
    await closeBrowser(browser);
    await runMilestone34ObjectiveArtScenario();
    return;
  } else if (name === "milestone35-campaign-route") {
    await closeBrowser(browser);
    await runMilestone35CampaignRouteScenario();
    return;
  } else if (name === "milestone36-campaign-content-schema") {
    await closeBrowser(browser);
    await runMilestone36CampaignContentSchemaScenario();
    return;
  } else if (name === "milestone37-route-art-polish") {
    await closeBrowser(browser);
    await runMilestone37RouteArtPolishScenario();
    return;
  } else if (name === "milestone38-distinct-campaign-arenas") {
    await closeBrowser(browser);
    await runMilestone38DistinctCampaignArenasScenario();
    return;
  } else if (name === "milestone39-campaign-dialogue") {
    await closeBrowser(browser);
    await runMilestone39CampaignDialogueScenario();
    return;
  } else if (name === "milestone40-campaign-route-ux") {
    await closeBrowser(browser);
    await runMilestone40CampaignRouteUxScenario();
    return;
  } else if (name === "milestone41-arena-visual-identity") {
    await closeBrowser(browser);
    await runMilestone41ArenaVisualIdentityScenario();
    return;
  } else if (name === "milestone42-glass-sunfield") {
    await closeBrowser(browser);
    await runMilestone42GlassSunfieldScenario();
    return;
  } else if (name === "milestone43-archive-unsaid") {
    await closeBrowser(browser);
    await runMilestone43ArchiveUnsaidScenario();
    return;
  } else if (name === "milestone44-blackwater-beacon") {
    await closeBrowser(browser);
    await runMilestone44BlackwaterBeaconScenario();
    return;
  } else if (name === "milestone45-outer-alignment-finale") {
    await closeBrowser(browser);
    await runMilestone45OuterAlignmentFinaleScenario();
    return;
  } else if (name === "milestone46-full-class-roster") {
    await closeBrowser(browser);
    await runMilestone46FullClassRosterScenario();
    return;
  } else if (name === "milestone47-faction-bursts") {
    await closeBrowser(browser);
    await runMilestone47FactionBurstsScenario();
    return;
  } else if (name === "milestone48-enemy-family-expansion") {
    await closeBrowser(browser);
    await runMilestone48EnemyFamilyExpansionScenario();
    return;
  } else if (name === "milestone49-player-comind-art") {
    await closeBrowser(browser);
    await runMilestone49PlayerCoMindArtScenario();
    return;
  } else if (name === "milestone50-arena-boss-art") {
    await closeBrowser(browser);
    await runMilestone50ArenaBossArtScenario();
    return;
  } else if (name === "milestone51-overworld-diorama") {
    await closeBrowser(browser);
    await runMilestone51OverworldDioramaScenario();
    return;
  } else if (name === "milestone52-progression-balance") {
    await closeBrowser(browser);
    await runMilestone52ProgressionBalanceScenario();
    return;
  } else if (name === "milestone53-dialogue-ending") {
    await closeBrowser(browser);
    await runMilestone53DialogueEndingScenario();
    return;
  } else if (name === "milestone54-audio-juice-feel") {
    await closeBrowser(browser);
    await runMilestone54AudioJuiceFeelScenario();
    return;
  } else if (name === "milestone55-online-robustness") {
    await closeBrowser(browser);
    await runMilestone55OnlineRobustnessScenario();
    return;
  } else if (name === "milestone56-quality-lock") {
    await closeBrowser(browser);
    await runMilestone56QualityLockScenario();
    return;
  } else if (name === "milestone32-party-builds") {
    await closeBrowser(browser);
    await runMilestone32PartyBuildsScenario();
    return;
  } else if (name === "asset-horde") {
    await page.goto(`${url}?armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await survivalDance(page, 12000);
    await capture(page, "armistice-tile-horde");
    const text = await state(page);
    assert(text.assetRendering?.armisticeTileAtlasEnabled === true, "expected gated Armistice tile atlas flag enabled in horde proof");
    assert(text.enemies.length > 0 || text.level.kills > 0, "expected horde activity under gated tile atlas");
    assert(text.level?.activeSpawnRegions?.length >= 2, "expected multiple active spawn regions under gated tile atlas");
  } else if (name === "asset-boss") {
    await page.goto(`${url}?armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await reachBossIntro(page, 40000);
    await capture(page, "armistice-tile-boss-intro");
    await advanceRunHandlingDrafts(page, 11000);
    await chooseDraftIfNeeded(page);
    await advanceRunHandlingDrafts(page, 18000);
    await capture(page, "armistice-tile-boss");
    const text = await state(page);
    assert(text.assetRendering?.armisticeTileAtlasEnabled === true, "expected gated Armistice tile atlas flag enabled in boss proof");
    assert(text.level?.bossSpawned || text.mode === "LevelComplete", "expected boss event under gated tile atlas");
    assert(text.level?.bossMechanics?.bossIntroSeen || text.mode === "LevelComplete", "expected boss intro state under gated tile atlas");
  } else if (name === "visual-fidelity-camera") {
    runArmisticeSpriteFramingProof();
    await page.goto(`${url}?productionArt=1&armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await ensureLevelRun(page);
    await page.waitForFunction(() => {
      const text = window.render_game_to_text?.();
      if (!text) return false;
      try {
        return JSON.parse(text).assetRendering?.armisticeAuthoredGroundReady === true;
      } catch {
        return false;
      }
    }, null, { timeout: 60000 });
    await advance(page, 1000);
    await capture(page, "camera-player-start");
    const start = await state(page);
    assert(start.mode === "LevelRun", `expected LevelRun for camera proof, got ${start.mode}`);
    assert(start.assetRendering?.cameraZoom >= 1.4, `expected close tactical camera zoom, got ${start.assetRendering?.cameraZoom}`);
    assert(start.assetRendering?.productionArtEnabled === true, "expected production art enabled for camera proof");
    assert(start.level?.arenaId === "armistice_plaza", "expected Armistice Plaza for camera proof");
    await dispatchKey(page, "KeyW", "keydown");
    await advance(page, 700);
    await capture(page, "camera-player-move-north");
    const north = await state(page);
    assert(north.player?.facing === "north", `expected north-facing player movement proof, got ${north.player?.facing}`);
    await dispatchKey(page, "KeyW", "keyup");
    await advance(page, 80);
    await dispatchKey(page, "KeyA", "keydown");
    await advance(page, 220);
    await capture(page, "camera-player-move-west-a");
    await advance(page, 220);
    await capture(page, "camera-player-move-west-b");
    await advance(page, 260);
    await capture(page, "camera-player-move-west");
    const west = await state(page);
    assert(west.player?.facing === "west", `expected west-facing player movement proof, got ${west.player?.facing}`);
    await dispatchKey(page, "KeyA", "keyup");
    await advance(page, 80);
    await dispatchKey(page, "KeyD", "keydown");
    await advance(page, 220);
    await capture(page, "camera-player-move-east-a");
    await advance(page, 220);
    await capture(page, "camera-player-move-east-b");
    await advance(page, 260);
    await capture(page, "camera-player-move-east");
    const east = await state(page);
    assert(east.player?.facing === "east", `expected east-facing player movement proof, got ${east.player?.facing}`);
    await dispatchKey(page, "KeyD", "keyup");
    await advance(page, 80);

    await survivalDance(page, 10000);
    await capture(page, "camera-combat-vfx");
    const combat = await state(page);
    assert(combat.level?.combatArt?.projectileCount > 0 || combat.level?.combatArt?.impactCount > 0 || combat.level?.kills > 0, "expected visible projectile or impact activity for VFX proof");

    await reachBossIntro(page, 40000);
    await capture(page, "camera-boss-intro");
    const bossIntro = await state(page);
    await advanceRunHandlingDrafts(page, 7000);
    await chooseDraftIfNeeded(page);
    await advance(page, 250);
    await capture(page, "camera-boss-vfx");
    await advance(page, 260);
    await capture(page, "camera-boss-vfx-anim-a");
    await advance(page, 260);
    await capture(page, "camera-boss-vfx-anim-b");
    const boss = await state(page);
    assert(bossIntro.level?.bossSpawned || boss.level?.bossSpawned || boss.mode === "UpgradeDraft" || boss.mode === "LevelComplete", "expected Oath-Eater boss event for camera proof");
    assert(bossIntro.level?.bossMechanics?.bossIntroSeen || boss.level?.bossMechanics?.bossIntroSeen || boss.mode === "UpgradeDraft" || boss.mode === "LevelComplete", "expected boss intro state for camera proof");
  } else if (name === "asset-preview") {
    await page.goto(`${url}?assetPreview=armistice_ground_atlas`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 500);
    await capture(page, "armistice-ground-atlas-preview");
    const preview = await state(page);
    assert(preview.mode === "AssetPreview", `expected AssetPreview, got ${preview.mode}`);
    assert(preview.assets?.productionAssets >= 1, "expected production atlas tracked in manifest summary");

    await page.goto(`${url}?assetPreview=accord_striker_raw`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 500);
    await capture(page, "accord-striker-raw-preview");
    const playerPreview = await state(page);
    assert(playerPreview.mode === "AssetPreview", `expected AssetPreview for player preview, got ${playerPreview.mode}`);
    assert(playerPreview.assetRendering?.assetPreview === "accord_striker_raw", "expected Accord Striker raw preview flag in text state");
    assert(playerPreview.assets?.countsByStatus?.raw >= 1, "expected raw Accord Striker asset tracked in manifest summary");

    await page.goto(`${url}?assetPreview=accord_striker_transparent_sheet`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 500);
    await capture(page, "accord-striker-transparent-sheet-preview");
    const transparentPlayerPreview = await state(page);
    assert(transparentPlayerPreview.mode === "AssetPreview", `expected AssetPreview for transparent player preview, got ${transparentPlayerPreview.mode}`);
    assert(transparentPlayerPreview.assetRendering?.assetPreview === "accord_striker_transparent_sheet", "expected Accord Striker transparent sheet preview flag in text state");
    assert(transparentPlayerPreview.assets?.countsByStatus?.cleaned >= 1, "expected cleaned Accord Striker sheet tracked in manifest summary");

    await page.goto(`${url}?assetPreview=milestone11_enemy_set`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 500);
    await capture(page, "milestone11-enemy-set-preview");
    const milestone11Preview = await state(page);
    assert(milestone11Preview.mode === "AssetPreview", `expected AssetPreview for Milestone 11 preview, got ${milestone11Preview.mode}`);
    assert(milestone11Preview.assetRendering?.assetPreview === "milestone11_enemy_set", "expected Milestone 11 enemy preview flag in text state");
    assert(milestone11Preview.assets?.productionAssets >= 15, "expected Milestone 11 assets tracked in manifest summary");

    await page.goto(`${url}?assetPreview=milestone12_default_candidate`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 500);
    await capture(page, "milestone12-default-candidate-preview");
    const milestone12Preview = await state(page);
    assert(milestone12Preview.mode === "AssetPreview", `expected AssetPreview for Milestone 12 preview, got ${milestone12Preview.mode}`);
    assert(milestone12Preview.assetRendering?.assetPreview === "milestone12_default_candidate", "expected Milestone 12 preview flag in text state");
    assert(milestone12Preview.assets?.productionAssets >= 18, "expected Milestone 12 assets tracked in manifest summary");

    await page.goto(`${url}?assetPreview=milestone14_combat_art`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await advance(page, 500);
    await capture(page, "milestone14-combat-art-preview");
    const milestone14Preview = await state(page);
    assert(milestone14Preview.mode === "AssetPreview", `expected AssetPreview for Milestone 14 preview, got ${milestone14Preview.mode}`);
    assert(milestone14Preview.assetRendering?.assetPreview === "milestone14_combat_art", "expected Milestone 14 combat-art preview flag in text state");
    assert(milestone14Preview.assets?.productionAssets >= 20, "expected Milestone 14 assets tracked in manifest summary");

    await page.goto(`${url}?armisticeTiles=1`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    await enterArena(page);
    await advance(page, 1000);
    await capture(page, "armistice-tile-flag-arena");
    const flagged = await state(page);
    assert(flagged.mode === "LevelRun", `expected LevelRun for flagged arena, got ${flagged.mode}`);
    assert(flagged.assetRendering?.armisticeTileAtlasEnabled === true, "expected gated Armistice tile atlas flag enabled");
    assert(flagged.level?.arenaId === "armistice_plaza", "expected Armistice Plaza arena under gated flag");
  } else {
    throw new Error(`Unknown proof scenario: ${name}`);
  }

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error(`Browser errors recorded for ${name}`);
  }
  await closeBrowser(browser);
}

async function runNetworkScenario(options = {}) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  const errors = [];
  for (const page of [pageA, pageB]) {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  }

  const params = new URLSearchParams({ coopServer: `ws://127.0.0.1:${networkPort}` });
  if (options.productionArt) {
    params.set("productionArt", "1");
    params.set("armisticeTiles", "1");
  }
  const coopUrl = `${url}?${params.toString()}`;
  await Promise.all([
    pageA.goto(coopUrl, { waitUntil: "domcontentloaded" }),
    pageB.goto(coopUrl, { waitUntil: "domcontentloaded" })
  ]);
  await Promise.all([pageA.waitForFunction(() => typeof window.render_game_to_text === "function"), pageB.waitForFunction(() => typeof window.render_game_to_text === "function")]);
  await Promise.all([pageA.waitForSelector("canvas"), pageB.waitForSelector("canvas")]);

  await pageA.keyboard.press("KeyC");
  await pageB.keyboard.press("KeyC");
  await waitForOnlinePlayers(pageA, 2);
  await waitForOnlinePlayers(pageB, 2);
  await capture(pageA, "client-a-joined");
  await capture(pageB, "client-b-joined");

  const joinedA = await state(pageA);
  const joinedB = await state(pageB);
  assert(joinedA.mode === "OnlineCoop", `expected client A OnlineCoop, got ${joinedA.mode}`);
  assert(joinedB.mode === "OnlineCoop", `expected client B OnlineCoop, got ${joinedB.mode}`);
  if (options.productionArt || options.expectProductionArt) {
    assert(joinedA.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 combat art parity in online client A");
    assert(joinedB.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected Milestone 14 combat art parity in online client B");
    assert(joinedA.assetRendering?.productionArtEnabled === true, "expected production art enabled in online client A");
    assert(joinedB.assetRendering?.productionArtEnabled === true, "expected production art enabled in online client B");
  }
  if (options.expectDefaulted) {
    assert(joinedA.assetRendering?.productionArtDefaulted === true, "expected default production art in online client A");
    assert(joinedB.assetRendering?.productionArtDefaulted === true, "expected default production art in online client B");
    assert(joinedA.assetRendering?.armisticeTileAtlasDefaulted === true, "expected default Armistice tile atlas in online client A");
    assert(joinedB.assetRendering?.armisticeTileAtlasDefaulted === true, "expected default Armistice tile atlas in online client B");
  }
  if (options.expectCombatArtHooks) {
    assert(joinedA.online?.combatArt?.phase === "opening", "expected online combat-art opening phase hook for client A");
    assert(typeof joinedA.online?.combatArt?.pressure === "number", "expected online combat-art pressure hook for client A");
    assert(joinedB.online?.combatArt?.phase === "opening", "expected online combat-art opening phase hook for client B");
  }
  assert(joinedA.online?.roomId && joinedA.online.roomId === joinedB.online?.roomId, "expected both clients in the same Colyseus room");
  assert(joinedA.online?.maxClients === 4, "expected room maxClients = 4");
  assert(joinedA.players?.length === 2 && joinedB.players?.length === 2, "expected both clients to see two players");
  assert(joinedA.online?.runPhase === "lobby", `expected online lobby phase before ready, got ${joinedA.online?.runPhase}`);
  assert(joinedB.online?.runPhase === "lobby", `expected online lobby phase before ready on client B, got ${joinedB.online?.runPhase}`);
  assert(joinedA.level?.sharedArenaStarted === false, "expected server combat to wait for ready state");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
  await capture(pageA, "active-run-started-a");
  await capture(pageB, "active-run-started-b");
  const activeA = await state(pageA);
  const activeB = await state(pageB);
  assert(activeA.level?.partyReady?.allReady === true, "expected ready state to start the active run");
  assert(activeB.level?.sharedArenaStarted === true, "expected shared arena to start after ready");

  const beforeA = await state(pageA);
  const beforeB = await state(pageB);
  await pageA.keyboard.down("ArrowRight");
  await pageB.keyboard.down("ArrowDown");
  await Promise.all([pageA.waitForTimeout(900), pageB.waitForTimeout(900)]);
  await waitForSnapshotTick(pageA, (beforeA.online?.tick ?? 0) + 10);
  await waitForSnapshotTick(pageB, (beforeB.online?.tick ?? 0) + 10);
  await capture(pageA, "client-a-moved");
  await capture(pageB, "client-b-moved");
  const movedA = await state(pageA);
  const movedB = await state(pageB);
  await pageA.keyboard.up("ArrowRight");
  await pageB.keyboard.up("ArrowDown");
  await Promise.all([pageA.waitForTimeout(120), pageB.waitForTimeout(120)]);

  const localAStart = beforeA.players.find((player) => player.isLocal);
  const localBStart = beforeB.players.find((player) => player.isLocal);
  const localAEnd = movedA.players.find((player) => player.isLocal);
  const localBEnd = movedB.players.find((player) => player.isLocal);
  assert(localAStart && localAEnd && distance(localAStart, localAEnd) > 2.5, "expected client A local player to move from its own input");
  assert(localBStart && localBEnd && distance(localBStart, localBEnd) > 2.5, "expected client B local player to move from its own input");
  assert(movedA.players.length === 2 && movedB.players.length === 2, "expected both clients to retain two synced players after movement");
  assert(movedA.enemies.length > 0 && movedB.enemies.length > 0, "expected basic enemy sync from authoritative room");
  assert(movedA.online?.tick > joinedA.online?.tick, "expected server tick to advance for client A");
  assert(movedB.online?.tick > joinedB.online?.tick, "expected server tick to advance for client B");
  if (options.productionArt || options.expectProductionArt) {
    assert(localAEnd.facing === "east" && Math.hypot(localAEnd.velocityX, localAEnd.velocityY) > 0.1, "expected client A synced east-facing movement for production animation");
    assert(localBEnd.facing === "south" && Math.hypot(localBEnd.velocityX, localBEnd.velocityY) > 0.1, "expected client B synced south-facing movement for production animation");
  }
  if (options.expectCombatArtHooks) {
    assert(movedA.online?.combatArt?.pressure > joinedA.online?.combatArt?.pressure, "expected online combat pressure to advance for client A");
    assert(movedB.online?.combatArt?.pressure > joinedB.online?.combatArt?.pressure, "expected online combat pressure to advance for client B");
  }
  if (options.expectServerCombat) {
    await waitForOnlineServerCombat(pageA, (text) => text.online?.networkAuthority === "colyseus_room_server_combat", "server combat authority");
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.projectiles?.length > 0 || text.online?.combat?.authoritativeProjectiles > 0,
      "authoritative projectile state"
    );
    await waitForOnlineServerCombat(
      pageB,
      (text) => text.projectiles?.length > 0 || text.online?.combat?.authoritativeProjectiles > 0,
      "authoritative projectile state on client B"
    );
    await capture(pageA, "milestone15-server-combat-a");
    await capture(pageB, "milestone15-server-combat-b");
    const combatA = await state(pageA);
    const combatB = await state(pageB);
    assert(combatA.level?.networkAuthority === "colyseus_room_server_combat", "expected client A level authority to report server-owned combat");
    assert(combatB.level?.networkAuthority === "colyseus_room_server_combat", "expected client B level authority to report server-owned combat");
    assert(combatA.projectiles.length > 0 || combatA.online?.combat?.authoritativeProjectiles > 0, "expected server projectiles on client A");
    assert(combatB.projectiles.length > 0 || combatB.online?.combat?.authoritativeProjectiles > 0, "expected server projectiles on client B");

    await waitForOnlineServerCombat(
      pageA,
      (text) => text.pickups?.length > 0 || (text.online?.combat?.collectedPickups ?? 0) > 0,
      "authoritative pickup state"
    );
    await capture(pageA, "milestone15-pickups");
    const pickups = await state(pageA);
    assert(pickups.pickups.length > 0 || pickups.online?.combat?.collectedPickups > 0, "expected server-owned pickup or collection state");

    await waitForOnlineServerCombat(
      pageA,
      (text) => text.level?.bossMechanics?.bossSpawned && text.level?.bossMechanics?.brokenPromiseZones?.length > 0,
      "authoritative boss event state",
      28_000
    );
    await waitForOnlineServerCombat(
      pageB,
      (text) => text.level?.bossMechanics?.bossSpawned && text.online?.combatArt?.bossEventActive === true,
      "authoritative boss event state on client B",
      28_000
    );
    await capture(pageA, "milestone15-boss-event-a");
    await capture(pageB, "milestone15-boss-event-b");
    const bossA = await state(pageA);
    const bossB = await state(pageB);
    assert(bossA.level?.bossMechanics?.bossIntroSeen, "expected server boss intro seen on client A");
    assert(bossA.level?.bossMechanics?.eventCounter > 0, "expected server boss event counter on client A");
    assert(bossA.level?.bossMechanics?.brokenPromiseZones?.length > 0, "expected synced Broken Promise zones on client A");
    assert(bossB.online?.combatArt?.phase === "boss_active", "expected synced boss active combat phase on client B");
  }

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for network");
  }
  await closeBrowser(browser);
}

async function runMilestone16OnlineFlowScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  const errors = [];
  for (const page of [pageA, pageB]) {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  }

  const params = new URLSearchParams({
    coopServer: `ws://127.0.0.1:${networkPort}`,
    proofOnlineFlow: "1"
  });
  const coopUrl = `${url}?${params.toString()}`;
  await Promise.all([
    pageA.goto(coopUrl, { waitUntil: "domcontentloaded" }),
    pageB.goto(coopUrl, { waitUntil: "domcontentloaded" })
  ]);
  await Promise.all([pageA.waitForFunction(() => typeof window.render_game_to_text === "function"), pageB.waitForFunction(() => typeof window.render_game_to_text === "function")]);
  await Promise.all([pageA.waitForSelector("canvas"), pageB.waitForSelector("canvas")]);

  await pageA.keyboard.press("KeyC");
  await pageB.keyboard.press("KeyC");
  await waitForOnlinePlayers(pageA, 2);
  await waitForOnlinePlayers(pageB, 2);
  await capture(pageA, "milestone16-lobby-a");
  await capture(pageB, "milestone16-lobby-b");
  const lobbyA = await state(pageA);
  assert(lobbyA.online?.runPhase === "lobby", `expected lobby phase, got ${lobbyA.online?.runPhase}`);
  assert(lobbyA.online?.readyCount === 0, "expected both players unready on first lobby snapshot");
  assert(lobbyA.level?.sharedArenaStarted === false, "expected combat not to start before ready");

  await pageA.keyboard.press("Space");
  await waitForOnlineReadyCount(pageA, 1);
  await capture(pageA, "milestone16-one-ready");
  const oneReady = await state(pageA);
  assert(oneReady.online?.runPhase === "lobby", "expected lobby to wait until all connected players are ready");
  assert(oneReady.online?.readyCount === 1, "expected one ready player after first ready press");

  await pageB.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
  await capture(pageA, "milestone16-active-a");
  await capture(pageB, "milestone16-active-b");
  const activeA = await state(pageA);
  assert(activeA.level?.partyReady?.allReady === true, "expected all-ready party state");
  assert(activeA.level?.sharedArenaStarted === true, "expected server-owned active run start");

  await pageA.keyboard.down("ArrowRight");
  await pageB.keyboard.down("ArrowDown");
  await Promise.all([pageA.waitForTimeout(1400), pageB.waitForTimeout(1400)]);
  await pageA.keyboard.up("ArrowRight");
  await pageB.keyboard.up("ArrowDown");
  await waitForOnlineServerCombat(pageA, (text) => text.enemies?.length > 0 || text.online?.combat?.authoritativeProjectiles > 0, "active server combat after ready");
  await capture(pageA, "milestone16-active-combat");
  const combat = await state(pageA);
  assert(combat.online?.networkAuthority === "colyseus_room_server_combat", "expected Milestone 15 server combat authority to remain active");

  await pageA.keyboard.press("Digit2");
  await waitForOnlineServerCombat(pageA, (text) => Boolean(text.online?.progression?.upgradePending), "shared upgrade pending state");
  await capture(pageA, "milestone16-upgrade-ready");
  const upgradeReady = await state(pageA);
  assert(upgradeReady.online?.progression?.policy === "shared_party_xp_coop_vote", "expected shared XP upgrade policy");
  assert(upgradeReady.online?.progression?.upgradePending?.cards?.length >= 3, "expected server-authored shared patch draft");

  await pageA.keyboard.press("Digit1");
  await pageB.keyboard.press("Digit1");
  await waitForOnlineServerCombat(pageB, (text) => text.online?.progression?.chosenUpgrades?.includes("refusal_halo"), "shared upgrade application on client B");
  await capture(pageB, "milestone16-upgrade-applied-b");
  const upgradeApplied = await state(pageB);
  assert(upgradeApplied.online?.progression?.partyLevel >= 2, "expected party level to advance after shared patch");

  await pageA.keyboard.press("Digit4");
  await waitForOnlineServerCombat(pageA, (text) => text.players?.some((player) => player.isLocal && player.downed), "local downed state");
  await capture(pageA, "milestone16-downed");
  const downed = await state(pageA);
  assert(downed.players.some((player) => player.isLocal && player.downed), "expected proof-forced local player downed");
  await waitForOnlineServerCombat(pageA, (text) => text.players?.some((player) => player.isLocal && !player.downed && player.revivedCount > 0), "Recompile Ally revive completion", 8_000);
  await capture(pageA, "milestone16-revived");
  const revived = await state(pageA);
  assert(revived.players.some((player) => player.isLocal && player.revivedCount > 0), "expected Recompile Ally to revive the local player");
  if (revived.online?.progression?.upgradePending) {
    await pageA.keyboard.press("Digit1");
    await pageB.keyboard.press("Digit1");
    await waitForOnlineServerCombat(pageA, (text) => !text.online?.progression?.upgradePending, "second shared upgrade application");
  }

  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await waitForOnlineRunPhase(pageB, "completed");
  await capture(pageA, "milestone16-completed-a");
  await capture(pageB, "milestone16-completed-b");
  const completed = await state(pageA);
  assert(completed.online?.summary?.outcome === "completed", "expected online completion summary");
  assert(completed.online?.summary?.revivedPlayers >= 1, "expected summary to include revive count");
  assert(completed.online?.status === "joined", "expected completed state to remain reconnect/leave safe");
  assert(String(completed.online?.controls ?? "").includes("R reconnects") && String(completed.online?.controls ?? "").includes("Esc leaves"), "expected reconnect/leave controls in text proof");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone16 online flow");
  }
  await closeBrowser(browser);
}

async function runMilestone17PartyOverworldScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  const errors = [];
  for (const page of [pageA, pageB]) {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  }

  const params = new URLSearchParams({
    coopServer: `ws://127.0.0.1:${networkPort}`,
    proofOnlineFlow: "1"
  });
  const coopUrl = `${url}?${params.toString()}`;
  await Promise.all([
    pageA.goto(coopUrl, { waitUntil: "domcontentloaded" }),
    pageB.goto(coopUrl, { waitUntil: "domcontentloaded" })
  ]);
  await Promise.all([pageA.waitForFunction(() => typeof window.render_game_to_text === "function"), pageB.waitForFunction(() => typeof window.render_game_to_text === "function")]);
  await Promise.all([pageA.waitForSelector("canvas"), pageB.waitForSelector("canvas")]);

  await pageA.keyboard.press("KeyC");
  await pageB.keyboard.press("KeyC");
  await waitForOnlinePlayers(pageA, 2);
  await waitForOnlinePlayers(pageB, 2);
  await capture(pageA, "milestone17-party-grid-initial-a");
  const initial = await state(pageA);
  assert(initial.online?.runPhase === "lobby", "expected online party to begin in lobby/staging phase");
  assert(initial.online?.party?.location === "alignment_grid", "expected online party Alignment Grid location");
  assert(initial.online?.party?.selectedNodeId === "armistice_plaza", "expected Armistice Plaza as initial party vote target");
  assert(initial.online?.party?.nodes?.length >= 6, "expected authored Alignment Grid nodes in online party state");
  assert(initial.level?.sharedArenaStarted === false, "expected online run not to start before party ready");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
  await capture(pageA, "milestone17-active-from-party-a");
  const active = await state(pageA);
  assert(active.online?.party?.activeNodeId === "armistice_plaza", "expected active run launched from voted Armistice Plaza");
  assert(active.online?.networkAuthority === "colyseus_room_server_combat", "expected server combat authority after party launch");

  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone17-completed-before-return-a");
  const completed = await state(pageA);
  assert(completed.online?.summary?.outcome === "completed", "expected online run completion before returning to party");
  assert(completed.online?.summary?.nodeId === "armistice_plaza", "expected completion summary to name the party-selected node");

  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");
  await capture(pageA, "milestone17-party-grid-returned-a");
  await capture(pageB, "milestone17-party-grid-returned-b");
  const returned = await state(pageA);
  assert(returned.online?.party?.completedNodeIds?.includes("armistice_plaza"), "expected completed Armistice Plaza in online party state");
  assert(returned.online?.party?.unlockedNodeIds?.includes("accord_relay"), "expected Accord Relay unlocked after online completion");
  assert(returned.online?.party?.unlockedNodeIds?.includes("cooling_lake_nine"), "expected Cooling Lake Nine unlocked after online completion");
  assert(returned.online?.party?.routes?.some((route) => route.id === "route_plaza_relay" && route.state === "stable"), "expected Plaza-to-Relay route stable after online completion");

  await pageA.keyboard.press("ArrowRight");
  await pageB.keyboard.press("ArrowRight");
  await waitForOnlineServerCombat(pageA, (text) => text.players?.some((player) => player.isLocal && player.votedNodeId === "accord_relay"), "vote to unlocked Accord Relay");
  await waitForOnlineServerCombat(pageB, (text) => text.players?.some((player) => player.isLocal && player.votedNodeId === "accord_relay"), "ally vote to unlocked Accord Relay");
  await capture(pageA, "milestone17-voted-relay-a");
  const votedRelay = await state(pageA);
  assert(votedRelay.online?.party?.selectedNodeId === "accord_relay", "expected party vote selection to move to Accord Relay");
  assert(votedRelay.online?.party?.nodes?.find((node) => node.id === "accord_relay")?.onlineSupported === false, "expected Accord Relay to be visible but not launchable yet");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await pageA.waitForTimeout(600);
  const blocked = await state(pageA);
  assert(blocked.online?.runPhase === "lobby", "expected unsupported online node vote not to launch combat");

  await pageA.keyboard.press("ArrowLeft");
  await pageB.keyboard.press("ArrowLeft");
  await waitForOnlineServerCombat(pageA, (text) => text.players?.some((player) => player.isLocal && player.votedNodeId === "armistice_plaza"), "vote back to Armistice Plaza");
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await capture(pageA, "milestone17-relaunch-supported-node-a");
  const relaunched = await state(pageA);
  assert(relaunched.online?.party?.activeNodeId === "armistice_plaza", "expected supported node vote to relaunch Armistice Plaza");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone17 party overworld");
  }
  await closeBrowser(browser);
}

async function runMilestone18CoopProgressionScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  const errors = [];
  for (const page of [pageA, pageB]) {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  }

  const params = new URLSearchParams({
    coopServer: `ws://127.0.0.1:${networkPort}`,
    proofOnlineFlow: "1"
  });
  const coopUrl = `${url}?${params.toString()}`;
  await Promise.all([
    pageA.goto(coopUrl, { waitUntil: "domcontentloaded" }),
    pageB.goto(coopUrl, { waitUntil: "domcontentloaded" })
  ]);
  await Promise.all([pageA.waitForFunction(() => typeof window.render_game_to_text === "function"), pageB.waitForFunction(() => typeof window.render_game_to_text === "function")]);
  await Promise.all([pageA.waitForSelector("canvas"), pageB.waitForSelector("canvas")]);

  await pageA.keyboard.press("KeyC");
  await pageB.keyboard.press("KeyC");
  await waitForOnlinePlayers(pageA, 2);
  await waitForOnlinePlayers(pageB, 2);
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
  await capture(pageA, "milestone18-active-start-a");

  await pageA.keyboard.press("Digit2");
  await waitForOnlineServerCombat(pageA, (text) => text.online?.upgradeDraft?.policy === "shared_party_xp_coop_vote", "co-op upgrade draft");
  await capture(pageA, "milestone18-upgrade-draft-open-a");
  await capture(pageB, "milestone18-upgrade-draft-open-b");
  const draft = await state(pageA);
  assert(draft.online?.upgradeDraft?.requiredVotes === 2, "expected both active players to be required for co-op patch draft");
  assert(draft.online?.upgradeDraft?.voteCount === 0, "expected patch draft to open with no votes");
  assert(draft.online?.progression?.upgradePending?.cards?.length >= 3, "expected three visible co-op patch cards");

  await pageA.keyboard.press("Digit1");
  await waitForOnlineServerCombat(pageB, (text) => text.online?.upgradeDraft?.voteCounts?.refusal_halo === 1, "first player patch vote visible to ally");
  await capture(pageA, "milestone18-upgrade-draft-one-vote-a");
  await capture(pageB, "milestone18-upgrade-draft-one-vote-b");
  const oneVote = await state(pageB);
  assert(oneVote.online?.upgradeDraft?.voteCount === 1, "expected one visible patch vote before resolution");
  assert(!oneVote.online?.progression?.chosenUpgrades?.includes("refusal_halo"), "expected patch not to apply until required votes arrive");

  await pageB.keyboard.press("Digit1");
  await waitForOnlineServerCombat(pageA, (text) => text.online?.progression?.chosenUpgrades?.includes("refusal_halo"), "co-op voted patch application");
  await capture(pageA, "milestone18-upgrade-applied-a");
  const applied = await state(pageA);
  assert(applied.online?.progression?.upgradePending?.id !== "shared_patch_1", "expected first co-op draft to clear after required votes");
  assert(applied.online?.progression?.policy === "shared_party_xp_coop_vote", "expected server-authored co-op progression policy");
  assert(applied.online?.progression?.partyLevel >= 2, "expected party level to advance after co-op voted patch");

  await pageA.keyboard.press("Digit4");
  await waitForOnlineServerCombat(pageA, (text) => text.online?.recompile?.active && text.players?.some((player) => player.isLocal && player.downed), "server-authored Recompile Ally downed state");
  await capture(pageA, "milestone18-recompile-downed-a");
  const downed = await state(pageA);
  const localRecompile = downed.online?.recompile?.downedPlayers?.find((entry) => entry.sessionId === downed.player?.sessionId);
  assert(Boolean(localRecompile), "expected local downed player in server Recompile Ally snapshot");
  assert(localRecompile?.inRange === true, "expected forced proof down to place an ally inside revive range");
  assert(downed.level?.recompile?.policy === "recompile_ally_hold_radius", "expected proof text to expose Recompile Ally policy");

  await waitForOnlineServerCombat(pageA, (text) => {
    const localEntry = text.online?.recompile?.downedPlayers?.find((entry) => entry.sessionId === text.player?.sessionId);
    return Boolean(localEntry && localEntry.percent >= 0.3 && localEntry.inRange);
  }, "Recompile Ally progress telemetry", 5_000);
  await capture(pageA, "milestone18-recompile-progress-a");
  await waitForOnlineServerCombat(pageA, (text) => text.players?.some((player) => player.isLocal && !player.downed && player.revivedCount > 0), "Recompile Ally revive completion", 8_000);
  await capture(pageA, "milestone18-recompile-revived-a");
  const revived = await state(pageA);
  assert(revived.players.some((player) => player.isLocal && player.revivedCount > 0), "expected Recompile Ally revive count to increment");
  assert(revived.online?.recompile?.active === false, "expected Recompile Ally snapshot to clear once everyone is up");

  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone18-completed-a");
  const completed = await state(pageA);
  assert(completed.online?.summary?.outcome === "completed", "expected run completion summary after co-op progression proof");
  assert(completed.online?.summary?.chosenUpgrades?.includes("refusal_halo"), "expected completion summary to include co-op voted upgrade");
  assert(completed.online?.summary?.revivedPlayers >= 1, "expected completion summary to include Recompile Ally revive count");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone18 co-op progression");
  }
  await closeBrowser(browser);
}

async function runMilestone19ReconnectSchemaScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  let pageA = await context.newPage();
  const pageB = await context.newPage();
  const errors = [];
  const watchPage = (page) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  };
  watchPage(pageA);
  watchPage(pageB);

  const paramsA = new URLSearchParams({
    coopServer: `ws://127.0.0.1:${networkPort}`,
    proofOnlineFlow: "1",
    reconnectKey: "proof_m19_player_a"
  });
  const paramsB = new URLSearchParams({
    coopServer: `ws://127.0.0.1:${networkPort}`,
    proofOnlineFlow: "1",
    reconnectKey: "proof_m19_player_b"
  });
  const coopUrlA = `${url}?${paramsA.toString()}`;
  const coopUrlB = `${url}?${paramsB.toString()}`;
  await Promise.all([
    pageA.goto(coopUrlA, { waitUntil: "domcontentloaded" }),
    pageB.goto(coopUrlB, { waitUntil: "domcontentloaded" })
  ]);
  await Promise.all([pageA.waitForFunction(() => typeof window.render_game_to_text === "function"), pageB.waitForFunction(() => typeof window.render_game_to_text === "function")]);
  await Promise.all([pageA.waitForSelector("canvas"), pageB.waitForSelector("canvas")]);

  await pageA.keyboard.press("KeyC");
  await pageB.keyboard.press("KeyC");
  await waitForOnlinePlayers(pageA, 2);
  await waitForOnlinePlayers(pageB, 2);
  await capture(pageA, "milestone19-lobby-a");
  const joined = await state(pageA);
  assert(joined.online?.schemaVersion === 4, "expected schemaVersion 4 online snapshot");
  assert(joined.online?.lifecycle?.schemaBacked === true, "expected Schema-backed lifecycle snapshot");
  assert(joined.online?.lifecycle?.collectionKinds?.some((kind) => kind.includes("MapSchema<PlayerPresence>")), "expected player presence MapSchema lifecycle collection");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
  await pageA.keyboard.press("Digit2");
  await waitForOnlineServerCombat(pageA, (text) => text.online?.upgradeDraft?.policy === "shared_party_xp_coop_vote", "co-op draft before reconnect");
  await pageA.keyboard.press("Digit1");
  await waitForOnlineServerCombat(pageA, (text) => text.online?.upgradeDraft?.localVote === "refusal_halo", "local vote before reconnect");
  await capture(pageA, "milestone19-voted-before-disconnect-a");
  const beforeDisconnect = await state(pageA);
  const original = beforeDisconnect.players.find((player) => player.isLocal);
  assert(original?.playerId, "expected local playerId before reconnect");
  assert(Number.isInteger(original?.slot), "expected local slot before reconnect");
  assert(beforeDisconnect.online?.upgradeDraft?.voteCount === 1, "expected one upgrade vote before disconnect");

  await pageA.close();
  await waitForOnlineServerCombat(pageB, (text) => text.players?.some((player) => player.playerId === original.playerId && player.connectionState === "disconnected"), "reserved disconnected slot visible to ally");
  await capture(pageB, "milestone19-disconnected-slot-b");
  const disconnected = await state(pageB);
  const disconnectedEntry = disconnected.players.find((player) => player.playerId === original.playerId);
  assert(disconnectedEntry?.slot === original.slot, "expected disconnected player to keep original slot");
  assert(disconnectedEntry?.connectionState === "disconnected", "expected disconnected player presence state");
  assert(disconnected.online?.reconnect?.disconnectedCount === 1, "expected reconnect summary to count disconnected player");
  assert(disconnected.online?.lifecycle?.playerPresenceCount === 2, "expected Schema player presence to retain disconnected slot");

  pageA = await context.newPage();
  watchPage(pageA);
  await pageA.goto(coopUrlA, { waitUntil: "domcontentloaded" });
  await pageA.waitForFunction(() => typeof window.render_game_to_text === "function");
  await pageA.waitForSelector("canvas");
  await pageA.keyboard.press("KeyC");
  await waitForOnlineServerCombat(pageA, (text) => {
    const local = text.players?.find((player) => player.isLocal);
    return local?.playerId === original.playerId && local?.slot === original.slot && local?.sessionId !== original.sessionId && local?.reconnectCount >= 1;
  }, "reclaimed reconnect slot");
  await capture(pageA, "milestone19-reclaimed-slot-a");
  const reclaimed = await state(pageA);
  const reclaimedLocal = reclaimed.players.find((player) => player.isLocal);
  assert(reclaimedLocal?.playerId === original.playerId, "expected reconnect to preserve playerId");
  assert(reclaimedLocal?.slot === original.slot, "expected reconnect to preserve player slot");
  assert(reclaimedLocal?.sessionId !== original.sessionId, "expected reconnect to receive a fresh Colyseus sessionId");
  assert(reclaimedLocal?.reconnectCount >= 1, "expected reconnect count to increment");
  assert(reclaimed.online?.connectedCount === 2, "expected both players connected after reclaim");
  assert(reclaimed.online?.reconnect?.reclaimedPlayerCount >= 1, "expected reconnect summary to record reclaimed slot");
  assert(reclaimed.online?.upgradeDraft?.localVote === "refusal_halo", "expected pending upgrade vote to migrate to reclaimed session");
  assert(reclaimed.online?.lifecycle?.upgradeVoteCount === 1, "expected Schema upgrade vote collection to retain migrated vote");

  await pageB.keyboard.press("Digit1");
  await waitForOnlineServerCombat(pageA, (text) => text.online?.progression?.chosenUpgrades?.includes("refusal_halo"), "co-op patch after reconnect");
  await capture(pageA, "milestone19-upgrade-after-reconnect-a");
  const applied = await state(pageA);
  assert(applied.online?.progression?.partyLevel >= 2, "expected party level to advance after reconnected vote resolution");
  assert(applied.online?.lifecycle?.schemaBacked === true, "expected lifecycle to remain Schema-backed after upgrade resolution");
  if (applied.online?.progression?.upgradePending) {
    await pageA.keyboard.press("Digit1");
    await pageB.keyboard.press("Digit1");
    await waitForOnlineServerCombat(pageA, (text) => !text.online?.progression?.upgradePending, "clear incidental second patch draft before completion");
  }

  await pageB.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone19-completed-after-reconnect-a");
  const completed = await state(pageA);
  assert(completed.online?.summary?.outcome === "completed", "expected completion after reconnect-safe run");
  assert(completed.online?.summary?.chosenUpgrades?.includes("refusal_halo"), "expected completion summary to preserve reconnected upgrade");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone19 reconnect schema");
  }
  await closeBrowser(browser);
}

async function runMilestone20SecondOnlineRegionScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m20");
  await launchOnlineArmistice(pageA, pageB);
  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone20-armistice-completed-a");
  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await voteBothToNode(pageA, pageB, "cooling_lake_nine");
  await capture(pageA, "milestone20-cooling-vote-a");
  const voted = await state(pageA);
  assert(voted.online?.party?.launchableNodeIds?.includes("cooling_lake_nine"), "expected Cooling Lake Nine to be online launchable after Armistice Plaza");
  assert(voted.online?.party?.selectedNodeId === "cooling_lake_nine", "expected party majority selection on Cooling Lake Nine");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
  await capture(pageA, "milestone20-cooling-active-a");
  const active = await state(pageA);
  assert(active.online?.party?.activeNodeId === "cooling_lake_nine", "expected active party node Cooling Lake Nine");
  assert(active.level?.arenaId === "cooling_lake_nine", "expected active online arena to be Cooling Lake Nine");
  assert(active.online?.regionEvent?.regionLabel === "Kettle Coast Trace", "expected Cooling Lake region event label");

  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone20-cooling-completed-a");
  const completed = await state(pageA);
  assert(completed.online?.summary?.nodeId === "cooling_lake_nine", "expected completion summary to name Cooling Lake Nine");
  assert(completed.online?.summary?.rewards?.rewardId === "lake_coolant_rig", "expected Cooling Lake reward in summary");
  assert(completed.online?.rewards?.rewardIds?.includes("lake_coolant_rig"), "expected Cooling Lake reward inventory");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone20 second online region");
  }
  await closeBrowser(browser);
}

async function runMilestone21RegionEventsScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m21");
  await launchCoolingLakeAfterArmistice(pageA, pageB);
  await waitForOnlineServerCombat(pageA, (text) => text.online?.regionEvent?.active && text.online.regionEvent.hazardZones?.length > 0, "Cooling Lake thermal hazard");
  await capture(pageA, "milestone21-cooling-thermal-bloom-a");
  const hazard = await state(pageA);
  assert(hazard.level?.arenaId === "cooling_lake_nine", "expected Cooling Lake active for region event proof");
  assert(hazard.online?.regionEvent?.eventFamily === "thermal_bloom", "expected thermal bloom region event family");
  assert(hazard.online?.regionEvent?.hazardZones?.some((zone) => zone.familyId === "thermal_bloom" || zone.familyId === "boiling_cache"), "expected authored Cooling Lake hazard zones");
  assert(hazard.online?.combatArt?.phase === "opening" || hazard.online?.combatArt?.phase === "horde", "expected combat phase to continue while region event is active");

  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone21-cooling-event-completed-a");
  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone21 region events");
  }
  await closeBrowser(browser);
}

async function runMilestone22PartyRewardsScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m22");
  await launchOnlineArmistice(pageA, pageB);
  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone22-armistice-reward-a");
  const plaza = await state(pageA);
  assert(plaza.online?.summary?.rewards?.rewardId === "plaza_stabilized", "expected Armistice Plaza reward summary");
  assert(plaza.online?.rewards?.partyRenown >= 2, "expected party renown after Armistice reward");

  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  const lobby = await state(pageA);
  assert(lobby.online?.party?.rewards?.rewardIds?.includes("plaza_stabilized"), "expected party reward inventory to persist in lobby");
  assert(lobby.online?.party?.rewards?.recommendedNodeId === "cooling_lake_nine", "expected party recommendation to point at Cooling Lake Nine");

  await voteBothToNode(pageA, pageB, "cooling_lake_nine");
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone22-cooling-reward-a");
  const cooling = await state(pageA);
  assert(cooling.online?.summary?.rewards?.rewardId === "lake_coolant_rig", "expected Cooling Lake reward summary");
  assert(cooling.online?.rewards?.rewardIds?.includes("plaza_stabilized"), "expected Plaza reward retained after Cooling Lake");
  assert(cooling.online?.rewards?.rewardIds?.includes("lake_coolant_rig"), "expected Cooling Lake reward retained");
  assert(cooling.online?.rewards?.rewardIds?.includes("cooling_lake_online_route"), "expected two-region route reward marker");
  assert(cooling.online?.rewards?.partyRenown >= 6, "expected cumulative party renown after two online completions");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone22 party rewards");
  }
  await closeBrowser(browser);
}

async function runMilestone23RoutePersistenceScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m23");
  await launchCoolingLakeAfterArmistice(pageA, pageB);
  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone23-cooling-completed-a");
  const cooling = await state(pageA);
  assert(cooling.online?.rewards?.recommendedNodeId === "memory_cache_001", "expected Cooling Lake completion to recommend Ceasefire Cache");
  assert(cooling.online?.party?.unlockedNodeIds?.includes("memory_cache_001"), "expected Ceasefire Cache unlocked after Cooling Lake");

  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");
  await voteBothToNode(pageA, pageB, "memory_cache_001");
  await capture(pageA, "milestone23-cache-vote-a");
  const cacheVote = await state(pageA);
  assert(cacheVote.online?.party?.selectedNodeId === "memory_cache_001", "expected party selection on Ceasefire Cache");
  assert(cacheVote.online?.party?.launchableNodeIds?.includes("memory_cache_001"), "expected Ceasefire Cache to be online visitable");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone23-cache-completed-a");
  const cache = await state(pageA);
  assert(cache.online?.summary?.nodeId === "memory_cache_001", "expected cache completion summary");
  assert(cache.online?.summary?.rewards?.rewardId === "ceasefire_cache_persistence_seed", "expected cache persistence reward");
  assert(cache.online?.rewards?.rewardIds?.includes("prototype_persistence_boundary"), "expected prototype persistence boundary reward marker");
  assert(cache.online?.party?.unlockedNodeIds?.includes("transit_loop_zero"), "expected Transit Loop Zero unlocked after cache");
  assert(cache.online?.party?.launchableNodeIds?.includes("transit_loop_zero"), "expected Transit Loop Zero launchable after cache");
  assert(cache.online?.persistence?.policy === "prototype_local_storage_export_v1", "expected persistence export policy in proof text");
  assert(cache.online?.persistence?.profile?.completedNodeIds?.includes("memory_cache_001"), "expected cache completion in persistence profile");

  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");
  const lobbyAfterCache = await state(pageA);
  assert(lobbyAfterCache.online?.party?.rewards?.recommendedNodeId === "archive_of_unsaid_things", "expected party recommendation to follow the current critical path toward Archive Of Unsaid Things");
  assert(lobbyAfterCache.online?.party?.launchableNodeIds?.includes("transit_loop_zero"), "expected Transit Loop Zero to remain launchable after cache even when the critical path recommends Archive");
  await voteBothToNode(pageA, pageB, "transit_loop_zero");
  await capture(pageA, "milestone23-transit-vote-a");
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineServerCombat(pageA, (text) => text.online?.regionEvent?.eventFamily === "false_track" && text.online.regionEvent.hazardZones?.length > 0, "Transit false-track region event");
  await capture(pageA, "milestone23-transit-active-a");
  const transitActive = await state(pageA);
  assert(transitActive.level?.arenaId === "transit_loop_zero", "expected Transit Loop Zero active arena");
  assert(transitActive.online?.regionEvent?.regionLabel === "Unreal Metro Line", "expected Transit region label");

  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone23-transit-completed-a");
  const transit = await state(pageA);
  assert(transit.online?.summary?.rewards?.rewardId === "transit_permit_zero", "expected Transit completion reward");
  assert(transit.online?.rewards?.rewardIds?.includes("transit_loop_online_route"), "expected Transit route reward marker");
  assert(transit.online?.persistence?.profile?.completedNodeIds?.includes("transit_loop_zero"), "expected Transit completion in persistence profile");
  assert(transit.online?.persistence?.profile?.routeDepth >= 4, "expected persistence route depth across plaza, lake, cache, and transit");
  assert(transit.online?.persistence?.saveHash, "expected persistence save hash");

  const storedRaw = await pageA.evaluate(() => window.localStorage.getItem("agi:last_alignment:online_progression:v1"));
  assert(storedRaw, "expected browser localStorage progression export");
  const stored = JSON.parse(storedRaw);
  assert(stored.saveHash === transit.online.persistence.saveHash, "expected stored persistence hash to match latest snapshot");
  assert(stored.profile.completedNodeIds.includes("transit_loop_zero"), "expected stored persistence to include Transit Loop Zero");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone23 route persistence");
  }
  await closeBrowser(browser);
}

async function runMilestone24PersistenceImportScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  try {
    const first = await openOnlinePairInContext(context, "m24_export", errors);
    await launchCoolingLakeAfterArmistice(first.pageA, first.pageB);
    await first.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(first.pageA, "completed");
    const cooling = await state(first.pageA);
    assert(cooling.online?.persistence?.profile?.completedNodeIds?.includes("cooling_lake_nine"), "expected Cooling Lake in exported profile");
    await first.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(first.pageA, "lobby");
    await waitForOnlineRunPhase(first.pageB, "lobby");
    await voteBothToNode(first.pageA, first.pageB, "memory_cache_001");
    await Promise.all([first.pageA.keyboard.press("Space"), first.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(first.pageA, "completed");
    await capture(first.pageA, "milestone24-export-cache-completed-a");
    const exported = await state(first.pageA);
    assert(exported.online?.persistence?.profile?.completedNodeIds?.includes("memory_cache_001"), "expected Cache in exported profile");
    assert(exported.online?.persistence?.profile?.rewardIds?.includes("prototype_persistence_boundary"), "expected persistence boundary reward in export");
    assert(exported.online?.persistence?.saveHash, "expected export hash");
    const storedRaw = await first.pageA.evaluate(() => window.localStorage.getItem("agi:last_alignment:online_progression:v1"));
    assert(storedRaw, "expected localStorage export before fresh-room import");
    const stored = JSON.parse(storedRaw);
    assert(stored.saveHash === exported.online.persistence.saveHash, "expected stored hash to match exported profile");
    await first.pageA.close();
    await first.pageB.close();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const fresh = await openOnlinePairInContext(context, "m24_import", errors);
    await waitForOnlineRunPhase(fresh.pageA, "lobby");
    await capture(fresh.pageA, "milestone24-fresh-room-imported-a");
    const imported = await state(fresh.pageA);
    assert(imported.online?.runPhase === "lobby", "expected fresh imported room to start in lobby");
    assert(imported.online?.persistence?.importApplied === true, "expected imported profile to be applied");
    assert(imported.online?.persistence?.importStatus === "applied_sanitized_route_profile", "expected sanitized import status");
    assert(imported.online?.persistence?.importedSaveHash === stored.saveHash, "expected imported hash to match stored export");
    assert(imported.online?.persistence?.importedCompletedNodeCount >= 3, "expected imported completed-node count");
    assert(imported.online?.persistence?.importedRewardCount >= 4, "expected imported reward count");
    assert(imported.online?.party?.persistence?.importApplied === true, "expected party snapshot to expose imported persistence");
    assert(imported.online?.party?.completedNodeIds?.includes("memory_cache_001"), "expected imported party completions");
    assert(imported.online?.party?.launchableNodeIds?.includes("transit_loop_zero"), "expected imported Transit launchability");
    assert(imported.online?.party?.rewards?.rewardIds?.includes("prototype_persistence_boundary"), "expected imported party rewards");
    assert(imported.online?.rewards?.rewardIds?.includes("ceasefire_cache_persistence_seed"), "expected imported reward inventory");
    assert(imported.level?.arenaId === "armistice_plaza", "expected fresh imported room not to resume Cache/Transit combat arena");
    assert((imported.enemies?.length ?? 0) === 0, "expected no imported combat enemies");
    assert(imported.online?.progression?.partyXp === 0, "expected no imported run XP");
    assert(imported.players?.every((player) => player.hp === player.maxHp && !player.downed), "expected no imported combat HP/downed state");
    await fresh.pageA.close();
    await fresh.pageB.close();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const reset = await openOnlinePairInContext(context, "m24_reset", errors, { resetOnlinePersistence: "1" });
    await waitForOnlineRunPhase(reset.pageA, "lobby");
    await capture(reset.pageA, "milestone24-reset-clean-profile-a");
    const clean = await state(reset.pageA);
    assert(clean.online?.localPersistence?.resetApplied === true, "expected reset flag in proof text");
    assert(clean.online?.persistence?.importApplied === false, "expected reset room not to import prior profile");
    assert(clean.online?.persistence?.profile?.completedNodeIds?.length === 0, "expected reset profile with no completions");
    assert(clean.online?.party?.completedNodeIds?.length === 0, "expected clean party route completions");
    assert(clean.online?.party?.launchableNodeIds?.length === 1 && clean.online.party.launchableNodeIds[0] === "armistice_plaza", "expected clean Armistice-only launchability after reset");
    assert(clean.online?.rewards?.rewardIds?.length === 0, "expected clean reward inventory after reset");
    assert(clean.online?.party?.selectedNodeId === "armistice_plaza", "expected clean route recommendation after reset");

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone24 persistence import");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone25RoutePolishScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m25");
  await launchCoolingLakeAfterArmistice(pageA, pageB);
  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");

  await voteBothToNode(pageA, pageB, "memory_cache_001");
  await pageA.waitForTimeout(500);
  await capture(pageA, "milestone25-cache-route-panel-a");
  const cacheVote = await state(pageA);
  assert(cacheVote.online?.routeUi?.panel === "milestone25_route_profile_panel", "expected Milestone 25 route UI panel in proof text");
  assert(cacheVote.online?.routeUi?.selectedNodeId === "memory_cache_001", "expected route UI to track Cache selection");
  assert(cacheVote.online?.routeUi?.selectedNodeType === "Memory Cache", "expected Cache node type in route UI");
  assert(cacheVote.online?.routeUi?.selectedLaunchable === true, "expected Cache selection to be launchable");
  assert(cacheVote.online?.routeUi?.stableRouteCount >= 2, "expected stable routes after Cooling Lake");
  assert(cacheVote.assets?.productionAssets >= 21, "expected Milestone 25 route art in production asset count");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "completed");
  await pageA.waitForTimeout(500);
  await capture(pageA, "milestone25-cache-completed-art-a");
  const cacheCompleted = await state(pageA);
  assert(cacheCompleted.online?.summary?.nodeId === "memory_cache_001", "expected Cache completion summary");
  assert(cacheCompleted.online?.party?.launchableNodeIds?.includes("transit_loop_zero"), "expected Transit launchable after Cache");

  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");
  await voteBothToNode(pageA, pageB, "transit_loop_zero");
  await pageA.waitForTimeout(500);
  await capture(pageA, "milestone25-transit-route-panel-a");
  const transitVote = await state(pageA);
  assert(transitVote.online?.routeUi?.selectedNodeId === "transit_loop_zero", "expected route UI to track Transit selection");
  assert(transitVote.online?.routeUi?.selectedNodeType === "Boss Gate", "expected Transit node type in route UI");
  assert(transitVote.online?.routeUi?.selectedLaunchable === true, "expected Transit selection to be launchable");
  assert(transitVote.online?.routeUi?.routeDepth >= 3, "expected route depth after Cache");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineServerCombat(pageA, (text) => text.level?.arenaId === "transit_loop_zero" && text.online?.regionEvent?.eventFamily === "false_track", "Transit active route-polish proof");
  await pageA.waitForTimeout(500);
  await capture(pageA, "milestone25-transit-active-art-a");
  const active = await state(pageA);
  assert(active.online?.networkAuthority === "colyseus_room_server_combat", "expected server combat authority to remain intact");
  assert(active.level?.arenaId === "transit_loop_zero", "expected Transit active arena");
  assert(active.online?.regionEvent?.regionLabel === "Unreal Metro Line", "expected Transit region label");

  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone25-transit-completed-a");
  const completed = await state(pageA);
  assert(completed.online?.summary?.rewards?.rewardId === "transit_permit_zero", "expected Transit reward after polish proof");
  assert(completed.online?.persistence?.profile?.completedNodeIds?.includes("transit_loop_zero"), "expected Transit completion in persistence profile");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone25 route polish");
  }
  await closeBrowser(browser);
}

async function runMilestone26FourthRegionBossGateScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m26");
  await launchCoolingLakeAfterArmistice(pageA, pageB);
  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");

  await voteBothToNode(pageA, pageB, "memory_cache_001");
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "completed");
  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");

  await voteBothToNode(pageA, pageB, "transit_loop_zero");
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone26-transit-unlocks-verdict-a");
  const transitCompleted = await state(pageA);
  assert(transitCompleted.online?.party?.unlockedNodeIds?.includes("verdict_spire"), "expected Verdict Spire unlocked after Transit");
  assert(transitCompleted.online?.party?.launchableNodeIds?.includes("verdict_spire"), "expected Verdict Spire launchable after Transit");
  assert(transitCompleted.online?.rewards?.recommendedNodeId === "verdict_spire", "expected route recommendation to point at Verdict Spire");

  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");
  await voteBothToNode(pageA, pageB, "verdict_spire");
  await pageA.waitForTimeout(500);
  await capture(pageA, "milestone26-verdict-route-panel-a");
  const verdictVote = await state(pageA);
  assert(verdictVote.assets?.productionAssets >= 22, "expected Milestone 26 Verdict art in production asset count");
  assert(verdictVote.online?.routeUi?.selectedNodeId === "verdict_spire", "expected route UI to track Verdict Spire selection");
  assert(verdictVote.online?.routeUi?.selectedNodeType === "Boss Gate", "expected Verdict Spire to be a Boss Gate");
  assert(verdictVote.online?.routeUi?.selectedLaunchable === true, "expected Verdict Spire selection to be launchable");
  assert(verdictVote.online?.routeUi?.onlineNodeCount >= 5, "expected route UI to include the fourth launchable arena node");
  assert(verdictVote.online?.party?.routes?.some((route) => route.id === "route_transit_verdict" && route.state === "stable"), "expected Transit-to-Verdict route to stabilize after Transit");

  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineServerCombat(
    pageA,
    (text) => text.level?.arenaId === "verdict_spire" && text.online?.regionEvent?.eventFamily === "verdict_seal" && text.online.regionEvent.hazardZones?.length > 0,
    "Verdict Spire seal region event"
  );
  await capture(pageA, "milestone26-verdict-active-seal-a");
  const verdictActive = await state(pageA);
  assert(verdictActive.online?.networkAuthority === "colyseus_room_server_combat", "expected server combat authority to remain intact");
  assert(verdictActive.level?.arenaId === "verdict_spire", "expected active online arena to be Verdict Spire");
  assert(verdictActive.online?.regionEvent?.regionLabel === "Adjudication Rupture", "expected Verdict Spire region label");
  assert(verdictActive.online?.regionEvent?.hazardZones?.some((zone) => zone.familyId === "verdict_seal" && zone.damagePerSecond > 0), "expected server-owned Verdict Seal hazard zones");
  assert(verdictActive.online?.combat?.bossGateMechanic === "verdict_seal_injunction_writs", "expected Verdict boss-gate mechanic label in combat telemetry");

  await waitForOnlineServerCombat(
    pageA,
    (text) =>
      text.level?.bossMechanics?.bossSpawned === true &&
      text.enemies?.some((enemy) => enemy.boss && enemy.familyId === "injunction_engine") &&
      text.enemies?.some((enemy) => enemy.sourceRegionId === "verdict_spire_injunction_writs"),
    "Injunction Engine boss-gate writ pressure",
    38_000
  );
  await capture(pageA, "milestone26-verdict-boss-gate-a");
  const bossGate = await state(pageA);
  assert(bossGate.level?.bossMechanics?.bossIntroSeen, "expected Injunction Engine boss intro state");
  assert(bossGate.enemies?.some((enemy) => enemy.sourceRegionId === "verdict_spire_injunction_writs"), "expected boss-gate writ enemies in proof text");

  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await capture(pageA, "milestone26-verdict-completed-a");
  const completed = await state(pageA);
  assert(completed.online?.summary?.rewards?.rewardId === "verdict_key_zero", "expected Verdict Spire completion reward");
  assert(completed.online?.rewards?.rewardIds?.includes("verdict_spire_online_route"), "expected Verdict route reward marker");
  assert(completed.online?.persistence?.profile?.completedNodeIds?.includes("verdict_spire"), "expected Verdict completion in persistence profile");
  assert(completed.online?.persistence?.profile?.routeDepth >= 5, "expected route depth across Plaza, Lake, Cache, Transit, and Verdict");

  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
    throw new Error("Browser errors recorded for milestone26 fourth region boss gate");
  }
  await closeBrowser(browser);
}

async function runMilestone27MetaprogressionUnlocksScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const watchPage = (page) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  };

  try {
    const clean = await context.newPage();
    watchPage(clean);
    await clean.goto(url, { waitUntil: "domcontentloaded" });
    await clean.waitForFunction(() => typeof window.render_game_to_text === "function");
    await clean.waitForSelector("canvas");
    await clean.evaluate(() => window.localStorage.removeItem("agi:last_alignment:online_progression:v1"));
    await clean.keyboard.press("Enter");
    await clean.waitForTimeout(300);
    await capture(clean, "milestone27-clean-starter-build");
    const cleanBuild = await state(clean);
    assert(cleanBuild.mode === "BuildSelect", "expected clean build selection state");
    assert(cleanBuild.buildSelection?.metaprogression?.loaded === false, "expected no local route profile for clean starter proof");
    assert(cleanBuild.buildSelection?.metaprogression?.unlockedClassIds?.length === 1, "expected only starter class unlocked before route rewards");
    assert(cleanBuild.buildSelection?.metaprogression?.unlockedFactionIds?.length === 1, "expected only starter faction unlocked before route rewards");
    assert(cleanBuild.buildSelection?.selectedClassId === "accord_striker", "expected Accord Striker starter selection");
    assert(cleanBuild.buildSelection?.selectedFactionId === "openai_accord", "expected OpenAI starter selection");
    await clean.keyboard.press("ArrowDown");
    await clean.keyboard.press("ArrowRight");
    await clean.waitForTimeout(300);
    const stillClean = await state(clean);
    assert(stillClean.buildSelection?.selectedClassId === "accord_striker", "expected locked class navigation to stay on starter");
    assert(stillClean.buildSelection?.selectedFactionId === "openai_accord", "expected locked faction navigation to stay on starter");
    await clean.close();

    const online = await openOnlinePairInContext(context, "m27_route", errors, { resetOnlinePersistence: "1" });
    await launchCoolingLakeAfterArmistice(online.pageA, online.pageB);
    await online.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(online.pageA, "completed");
    await online.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(online.pageA, "lobby");
    await waitForOnlineRunPhase(online.pageB, "lobby");

    await voteBothToNode(online.pageA, online.pageB, "memory_cache_001");
    await Promise.all([online.pageA.keyboard.press("Space"), online.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(online.pageA, "completed");
    await online.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(online.pageA, "lobby");
    await waitForOnlineRunPhase(online.pageB, "lobby");

    await voteBothToNode(online.pageA, online.pageB, "transit_loop_zero");
    await Promise.all([online.pageA.keyboard.press("Space"), online.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(online.pageA, "active");
    await online.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(online.pageA, "completed");
    await online.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(online.pageA, "lobby");
    await waitForOnlineRunPhase(online.pageB, "lobby");

    await voteBothToNode(online.pageA, online.pageB, "verdict_spire");
    await Promise.all([online.pageA.keyboard.press("Space"), online.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(online.pageA, "active");
    await online.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(online.pageA, "completed");
    await capture(online.pageA, "milestone27-route-rewards-exported-a");
    const exported = await state(online.pageA);
    assert(exported.online?.persistence?.profile?.rewardIds?.includes("verdict_key_zero"), "expected Verdict reward in exported route profile");
    assert(exported.online?.persistence?.profile?.rewardIds?.includes("verdict_spire_online_route"), "expected Verdict route marker in exported route profile");
    await online.pageA.close();
    await online.pageB.close();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const build = await context.newPage();
    watchPage(build);
    await build.goto(url, { waitUntil: "domcontentloaded" });
    await build.waitForFunction(() => typeof window.render_game_to_text === "function");
    await build.waitForSelector("canvas");
    await build.keyboard.press("Enter");
    await build.waitForTimeout(500);
    await capture(build, "milestone27-unlocked-build-select");
    const unlocked = await state(build);
    const meta = unlocked.buildSelection?.metaprogression;
    assert(unlocked.mode === "BuildSelect", "expected build select after route rewards");
    assert(meta?.loaded === true, "expected local route profile loaded for metaprogression");
    assert(meta?.rewardIds?.includes("verdict_key_zero"), "expected metaprogression to read Verdict reward");
    assert(meta?.unlockedClassIds?.includes("bastion_breaker"), "expected Plaza reward to unlock Bastion Breaker");
    assert(meta?.unlockedClassIds?.includes("drone_reaver"), "expected Lake reward to unlock Drone Reaver");
    assert(meta?.unlockedClassIds?.includes("signal_vanguard"), "expected Cache reward to unlock Signal Vanguard");
    assert(meta?.unlockedClassIds?.includes("vector_interceptor"), "expected Transit reward to unlock Vector Interceptor");
    assert(meta?.unlockedClassIds?.includes("nullbreaker_ronin"), "expected Verdict reward to unlock Nullbreaker Ronin");
    assert(meta?.unlockedFactionIds?.includes("deepseek_abyssal"), "expected Verdict reward to unlock DeepSeek co-mind");
    assert(meta?.unlockedFactionIds?.includes("xai_grok_free_signal"), "expected Verdict route marker to unlock xAI co-mind");
    assert(meta?.unlockedUpgradeSeedIds?.includes("sparse_knife"), "expected Verdict reward to unlock Sparse Knife seed");
    assert(meta?.unlockedUpgradeSeedIds?.includes("cosmic_heckle"), "expected Verdict route marker to unlock Cosmic Heckle seed");

    await selectBuildOption(build, "class", "nullbreaker_ronin");
    await selectBuildOption(build, "faction", "deepseek_abyssal");
    await capture(build, "milestone27-nullbreaker-deepseek-selected");
    const selected = await state(build);
    assert(selected.buildSelection?.selectedClassId === "nullbreaker_ronin", "expected unlocked Nullbreaker Ronin selection");
    assert(selected.buildSelection?.selectedFactionId === "deepseek_abyssal", "expected unlocked DeepSeek co-mind selection");
    assert(selected.buildSelection?.selectedClassUnlocked === true, "expected selected class to be unlocked");
    assert(selected.buildSelection?.selectedFactionUnlocked === true, "expected selected faction to be unlocked");

    await build.keyboard.press("Enter");
    await build.waitForTimeout(200);
    await build.keyboard.press("Enter");
    await build.waitForTimeout(200);
    await build.keyboard.press("Enter");
    await build.waitForTimeout(500);
    await capture(build, "milestone27-unlocked-build-run");
    const run = await state(build);
    assert(run.mode === "LevelRun", `expected LevelRun for unlocked build, got ${run.mode}`);
    assert(run.level?.classId === "nullbreaker_ronin", "expected run to use unlocked Nullbreaker Ronin class");
    assert(run.level?.factionId === "deepseek_abyssal", "expected run to use unlocked DeepSeek co-mind");
    assert(run.build?.weaponDamage > 18, "expected DeepSeek/Nullbreaker build stats to affect run damage");

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone27 metaprogression unlocks");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone28OnlineRouteArtScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m28");
  try {
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForRouteExpansionArt(pageA);
    await capture(pageA, "milestone28-party-grid-art-a");
    const initial = await state(pageA);
    assert(initial.assets?.productionAssets >= 25, "expected Milestone 28 production art assets tracked in manifest summary");
    assert(initial.online?.routeUi?.artExpansion?.set === "milestone28_online_route_art_expansion", "expected Milestone 28 route art expansion marker");
    assert(initial.online?.routeUi?.artExpansion?.enabled === true, "expected Milestone 28 route art loaded in online party grid");

    await launchCoolingLakeAfterArmistice(pageA, pageB);
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.level?.arenaId === "cooling_lake_nine" && text.online?.regionEvent?.eventFamily === "thermal_bloom" && text.online.regionEvent.hazardZones?.length > 0,
      "Cooling Lake Milestone 28 thermal marker"
    );
    await capture(pageA, "milestone28-cooling-lake-art-a");
    const cooling = await state(pageA);
    assert(cooling.online?.networkAuthority === "colyseus_room_server_combat", "expected server combat authority during Cooling Lake art proof");
    assert(cooling.online?.routeUi?.artExpansion?.enabled === true, "expected Milestone 28 art expansion during Cooling Lake");

    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");
    await voteBothToNode(pageA, pageB, "memory_cache_001");
    await waitForRouteExpansionArt(pageA);
    await capture(pageA, "milestone28-cache-party-grid-art-a");
    const cacheVote = await state(pageA);
    assert(cacheVote.online?.routeUi?.selectedNodeId === "memory_cache_001", "expected Cache selected for Milestone 28 party-grid art proof");
    assert(cacheVote.online?.routeUi?.artExpansion?.enabled === true, "expected Milestone 28 route art loaded on Cache party-grid proof");

    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "completed");
    await capture(pageA, "milestone28-cache-completed-art-a");
    const cacheCompleted = await state(pageA);
    assert(cacheCompleted.online?.summary?.nodeId === "memory_cache_001", "expected Cache completion in Milestone 28 art proof");

    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");
    await voteBothToNode(pageA, pageB, "transit_loop_zero");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.level?.arenaId === "transit_loop_zero" && text.online?.regionEvent?.eventFamily === "false_track" && text.online.regionEvent.hazardZones?.length > 0,
      "Transit Milestone 28 false-track marker"
    );
    await capture(pageA, "milestone28-transit-art-a");
    const transit = await state(pageA);
    assert(transit.online?.networkAuthority === "colyseus_room_server_combat", "expected server combat authority during Transit art proof");
    assert(transit.online?.regionEvent?.regionLabel === "Unreal Metro Line", "expected Transit region label during art proof");

    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");
    await voteBothToNode(pageA, pageB, "verdict_spire");
    await waitForRouteExpansionArt(pageA);
    await capture(pageA, "milestone28-verdict-party-grid-art-a");
    const verdictVote = await state(pageA);
    assert(verdictVote.online?.routeUi?.selectedNodeId === "verdict_spire", "expected Verdict selected for Milestone 28 party-grid art proof");
    assert(verdictVote.online?.party?.routes?.some((route) => route.id === "route_transit_verdict" && route.state === "stable"), "expected Transit-to-Verdict route stable for route-art proof");

    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.level?.arenaId === "verdict_spire" && text.online?.regionEvent?.eventFamily === "verdict_seal" && text.online.regionEvent.hazardZones?.length > 0,
      "Verdict Milestone 28 seal marker"
    );
    await capture(pageA, "milestone28-verdict-seal-art-a");
    const verdictActive = await state(pageA);
    assert(verdictActive.online?.regionEvent?.regionLabel === "Adjudication Rupture", "expected Verdict region label during art proof");
    assert(verdictActive.online?.combat?.bossGateMechanic === "verdict_seal_injunction_writs", "expected Verdict boss-gate mechanic during art proof");

    await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.level?.bossMechanics?.bossSpawned === true &&
        text.enemies?.some((enemy) => enemy.boss && enemy.familyId === "injunction_engine") &&
        text.enemies?.some((enemy) => enemy.sourceRegionId === "verdict_spire_injunction_writs"),
      "Verdict Milestone 28 online threat silhouettes",
      38_000
    );
    await capture(pageA, "milestone28-verdict-threat-art-a");
    const threat = await state(pageA);
    assert(threat.enemies?.some((enemy) => enemy.sourceRegionId === "verdict_spire_injunction_writs"), "expected Verdict writ threats in Milestone 28 proof text");

    const context = pageA.context();
    await pageA.close();
    await pageB.close();
    await new Promise((resolve) => setTimeout(resolve, 800));
    const optOut = await openOnlinePairInContext(context, "m28_optout", errors, { productionArt: "0", placeholderArt: "1" });
    await waitForOnlineRunPhase(optOut.pageA, "lobby");
    await optOut.pageA.waitForTimeout(500);
    await capture(optOut.pageA, "milestone28-placeholder-opt-out-a");
    const optOutState = await state(optOut.pageA);
    assert(optOutState.assetRendering?.productionArtEnabled === false, "expected production-art opt-out to remain respected online");
    assert(optOutState.online?.routeUi?.artExpansion?.enabled === false, "expected Milestone 28 art expansion disabled under production-art opt-out");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone28 online route art");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone29RolePressureScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m29");
  try {
    await launchOnlineArmistice(pageA, pageB);
    await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.rolePressure?.policy === "split_hold_regroup_recompile_v1" &&
        text.online.rolePressure.active === true &&
        text.online.rolePressure.anchors?.length >= 2,
      "Milestone 29 role-pressure anchors"
    );
    await capture(pageA, "milestone29-role-pressure-active-a");
    const active = await state(pageA);
    assert(active.online?.networkAuthority === "colyseus_room_server_combat", "expected server combat authority before role pressure");
    assert(active.online?.rolePressure?.requiredAnchors >= 2, "expected split-hold role pressure to require two anchors");

    await pageA.keyboard.press("Digit1");
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.online?.rolePressure?.heldAnchorCount >= 2 || text.online?.rolePressure?.phase === "regroup",
      "Milestone 29 split anchor assignment"
    );
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.online?.rolePressure?.phase === "regroup" && text.online.rolePressure.completedSplitHolds >= 1,
      "Milestone 29 regroup window after split hold",
      8_000
    );
    await capture(pageA, "milestone29-role-pressure-regroup-a");
    const regroup = await state(pageA);
    assert(regroup.online?.rolePressure?.recompileRequiredSeconds < regroup.online.rolePressure.baseRecompileRequiredSeconds, "expected regroup window to accelerate recompile");
    assert(regroup.online?.rolePressure?.recompileRadius > regroup.online.rolePressure.baseRecompileRadius, "expected regroup window to expand recompile radius");

    await pageA.keyboard.press("Digit4");
    await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.recompile?.active === true &&
        text.online.recompile.rolePressureAccelerated === true &&
        text.online.recompile.requiredSeconds < text.online.recompile.baseRequiredSeconds &&
        text.players?.some((player) => player.isLocal && player.downed),
      "Milestone 29 role-pressure accelerated Recompile Ally",
      8_000
    );
    await capture(pageA, "milestone29-recompile-accelerated-a");
    const downed = await state(pageA);
    assert(downed.online?.recompile?.radius > downed.online.recompile.baseRadius, "expected accelerated recompile radius in proof text");
    assert(downed.online?.rolePressure?.phase === "regroup", "expected downed recompile to happen during regroup window");

    await waitForOnlineServerCombat(
      pageA,
      (text) => text.online?.recompile?.active === false && text.players?.every((player) => !player.downed),
      "Milestone 29 accelerated revive completion",
      8_000
    );
    await capture(pageA, "milestone29-recompiled-after-regroup-a");
    const revived = await state(pageA);
    assert(revived.online?.rolePressure?.completedSplitHolds >= 1, "expected role-pressure split hold count to persist after revive");

    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    await capture(pageA, "milestone29-completed-with-role-pressure-a");
    const completed = await state(pageA);
    assert(completed.online?.summary?.rolePressure?.splitHolds >= 1, "expected run summary to include role-pressure split holds");
    assert(completed.online?.summary?.rewards?.rewardId === "plaza_stabilized", "expected normal route reward behavior to remain intact");

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone29 role pressure");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone30SaveProfileExportCodesScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const exportContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const importContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const injectedImportContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const resetContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  try {
    const exporting = await openOnlinePairInContext(exportContext, "m30_export", errors, { resetOnlinePersistence: "1" });
    await launchCoolingLakeAfterArmistice(exporting.pageA, exporting.pageB);
    await exporting.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(exporting.pageA, "completed");
    await exporting.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(exporting.pageA, "lobby");
    await waitForOnlineRunPhase(exporting.pageB, "lobby");
    await voteBothToNode(exporting.pageA, exporting.pageB, "memory_cache_001");
    await Promise.all([exporting.pageA.keyboard.press("Space"), exporting.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(exporting.pageA, "completed");
    await exporting.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(exporting.pageA, "lobby");
    await waitForOnlineRunPhase(exporting.pageB, "lobby");
    await exporting.pageA.keyboard.press("Digit1");
    await exporting.pageA.waitForTimeout(500);
    await capture(exporting.pageA, "milestone30-save-profile-surface-a");
    const exported = await state(exporting.pageA);
    assert(exported.online?.saveProfile?.surface === "milestone30_save_profile_export_codes", "expected Milestone 30 save profile surface");
    assert(exported.online?.saveProfile?.boundary === "browser_local_prototype_not_account_or_cloud", "expected explicit browser-local boundary");
    assert(exported.online?.saveProfile?.durableFieldPolicy === "route_profile_only_no_combat_state", "expected route-profile-only durable field policy");
    assert(exported.online?.saveProfile?.exportCode?.startsWith("AGI1_"), "expected player-facing AGI export code");
    assert(exported.online?.saveProfile?.profile?.completedNodeIds?.includes("memory_cache_001"), "expected completed Cache node in save profile");
    assert(exported.online?.saveProfile?.profile?.unlockedNodeIds?.includes("transit_loop_zero"), "expected Transit unlock in save profile");
    assert(exported.online?.saveProfile?.profile?.rewardIds?.includes("prototype_persistence_boundary"), "expected route reward marker in save profile");
    assert(exported.online?.saveProfile?.profile?.partyRenown >= 7, "expected durable party renown in save profile");
    assert(exported.online?.saveProfile?.saveHash === exported.online?.persistence?.saveHash, "expected save profile hash to match persistence hash");
    assert(exported.online?.localPersistence?.lastAction === "export_code_copied" || exported.online?.localPersistence?.lastAction === "export_code_ready", "expected export action status after pressing 1");

    const exportCode = exported.online.saveProfile.exportCode;
    await exporting.pageA.close();
    await exporting.pageB.close();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const importedPair = await openOnlinePairInContext(importContext, "m30_import", errors, { importOnlineProfileCode: exportCode });
    await waitForOnlineRunPhase(importedPair.pageA, "lobby");
    await importedPair.pageA.waitForTimeout(500);
    await capture(importedPair.pageA, "milestone30-import-code-applied-a");
    const imported = await state(importedPair.pageA);
    assert(imported.online?.saveProfile?.importCodeApplied === true, "expected import-code status in proof text");
    assert(imported.online?.localPersistence?.importCodeStatus === "query_code_applied", "expected query export-code import status");
    assert(imported.online?.persistence?.importApplied === true, "expected server to apply imported route profile");
    assert(imported.online?.persistence?.importStatus === "applied_sanitized_route_profile", "expected sanitized import status");
    assert(imported.online?.persistence?.importedSaveHash === exported.online.persistence.saveHash, "expected imported save hash to match exported hash");
    assert(imported.online?.party?.completedNodeIds?.includes("memory_cache_001"), "expected imported completed nodes in fresh room");
    assert(imported.online?.party?.launchableNodeIds?.includes("transit_loop_zero"), "expected imported unlocks in fresh room");
    assert(imported.online?.rewards?.rewardIds?.includes("ceasefire_cache_persistence_seed"), "expected imported durable rewards");
    assert((imported.enemies?.length ?? 0) === 0, "expected import code not to import combat enemies");
    assert(imported.online?.progression?.partyXp === 0, "expected import code not to import run XP");
    assert(imported.players?.every((player) => player.hp === player.maxHp && !player.downed), "expected import code not to import HP/downed state");
    await importedPair.pageA.close();
    await importedPair.pageB.close();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const injectedDraft = JSON.parse(JSON.stringify(exported.online.persistence));
    injectedDraft.objectives = { phase: "completed", completedObjectiveIds: ["seal_breach_gate"] };
    injectedDraft.profile.objectives = { phase: "completed", collected: 999 };
    injectedDraft.profile.enemies = [{ id: 1, hp: 1 }];
    const injectedImportCode = encodeProofOnlineProfileCode(injectedDraft);
    const injectedPair = await openOnlinePairInContext(injectedImportContext, "m30_injected", errors, { importOnlineProfileCode: injectedImportCode });
    await waitForOnlineRunPhase(injectedPair.pageA, "lobby");
    await injectedPair.pageA.waitForTimeout(500);
    const injected = await state(injectedPair.pageA);
    assert(injected.online?.persistence?.importApplied === true, "expected injected import code to preserve valid durable route profile");
    assert(injected.online?.persistence?.ignoredImportedFieldCount >= 3, "expected injected objective/combat fields to be ignored by sanitizer");
    assert(injected.online?.persistence?.profile && !("objectives" in injected.online.persistence.profile), "expected imported profile to omit injected objective state");
    assert(injected.online?.persistence?.profile && !("enemies" in injected.online.persistence.profile), "expected imported profile to omit injected combat state");
    assert(injected.online?.objectives?.phase !== "completed", "expected injected objective state not to complete live lobby objectives");
    await injectedPair.pageA.close();
    await injectedPair.pageB.close();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const resetPair = await openOnlinePairInContext(resetContext, "m30_reset", errors, { importOnlineProfileCode: exportCode, resetOnlinePersistence: "1" });
    await waitForOnlineRunPhase(resetPair.pageA, "lobby");
    await resetPair.pageA.waitForTimeout(500);
    await capture(resetPair.pageA, "milestone30-reset-obvious-a");
    const reset = await state(resetPair.pageA);
    assert(reset.online?.saveProfile?.resetApplied === true, "expected reset flag in Milestone 30 save profile");
    assert(reset.online?.localPersistence?.lastAction === "reset_query_applied", "expected reset query status to be obvious");
    assert(reset.online?.persistence?.importApplied === false, "expected reset to override import code");
    assert(reset.online?.saveProfile?.profile?.completedNodeIds?.length === 0, "expected clean completed nodes after reset");
    assert(reset.online?.party?.launchableNodeIds?.length === 1 && reset.online.party.launchableNodeIds[0] === "armistice_plaza", "expected reset profile to return to Armistice-only launchability");
    assert(reset.online?.saveProfile?.shortExportCode && reset.online.saveProfile.shortExportCode !== "none", "expected reset room to still expose a current clean export code");
    await resetPair.pageA.close();
    await resetPair.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone30 save profile export codes");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone31ArenaObjectivesScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m31");
  try {
    await launchOnlineArmistice(pageA, pageB);
    await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.schemaVersion === 4 &&
        text.online?.networkAuthority === "colyseus_room_server_combat" &&
        text.online?.objectives?.policy === "server_authoritative_arena_objectives_v1" &&
        text.online.objectives.objectiveSetId === "armistice_plaza_objectives_v1" &&
        text.online.objectives.instances?.length >= 5,
      "Milestone 31 objective runtime"
    );
    await capture(pageA, "milestone31-objective-chain-start-a");
    const start = await state(pageA);
    const startB = await state(pageB);
    assert(
      start.online?.objectives?.currentObjectiveId === "survey_treaty_monument" ||
        (start.online?.objectives?.completedObjectiveIds?.includes("survey_treaty_monument") && start.online?.objectives?.currentGroupId === "calibrate_reality_relays"),
      "expected Treaty Monument survey to start or complete into relay calibration"
    );
    assert(startB.online?.objectives?.objectiveSetId === start.online?.objectives?.objectiveSetId, "expected second client to see the same objective set");
    assert(startB.online?.objectives?.currentObjectiveId === start.online?.objectives?.currentObjectiveId, "expected second client to see the same current objective");
    assert(start.online?.objectives?.instances?.some((entry) => entry.type === "holdout"), "expected holdout objective instances");
    assert(start.online?.objectives?.instances?.some((entry) => entry.type === "collect" && entry.itemId === "oath_fragment"), "expected Oath Fragment collection objective");
    assert(start.online?.objectives?.instances?.some((entry) => entry.type === "seal"), "expected breach seal objective");

    await pageA.keyboard.press("Digit1");
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.online?.objectives?.currentGroupId === "calibrate_reality_relays",
      "Milestone 31 relay calibration objective"
    );
    await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.objectives?.currentGroupId === "recover_oath_fragments" &&
        text.online.objectives.completedObjectiveIds?.includes("calibrate_vanguard_relay") &&
        text.online.objectives.completedObjectiveIds?.includes("calibrate_treaty_cover"),
      "Milestone 31 calibrated relay completion",
      8_000
    );
    await capture(pageA, "milestone31-relays-calibrated-a");
    const calibrated = await state(pageA);
    assert(calibrated.online?.rolePressure?.policy === "split_hold_regroup_recompile_v1", "expected role pressure to remain present during objective holds");
    assert(calibrated.online?.objectives?.instances?.filter((entry) => entry.groupId === "calibrate_reality_relays").every((entry) => entry.complete), "expected both relay objectives complete");

    await pageA.keyboard.press("Digit1");
    await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.objectives?.currentGroupId === "seal_breach_gate" &&
        text.online.objectives.completedObjectiveIds?.includes("recover_oath_fragments"),
      "Milestone 31 Oath Fragment objective completion"
    );
    await capture(pageA, "milestone31-oath-fragments-recovered-a");
    const fragments = await state(pageA);
    assert(fragments.online?.objectives?.instances?.some((entry) => entry.id === "recover_oath_fragments" && entry.complete && entry.collected >= entry.required), "expected recovered Oath Fragment count");

    await pageA.keyboard.press("Digit1");
    await waitForOnlineRunPhase(pageA, "completed");
    await waitForOnlineRunPhase(pageB, "completed");
    await capture(pageA, "milestone31-objective-completed-a");
    const completed = await state(pageA);
    const completedB = await state(pageB);
    assert(completed.online?.summary?.objectives?.policy === "server_authoritative_arena_objectives_v1", "expected objective summary on completion");
    assert(completed.online?.summary?.objectives?.phase === "completed", "expected completed objective summary phase");
    assert(completed.online?.summary?.objectives?.completedObjectiveIds?.includes("seal_breach_gate"), "expected breach seal in completed objective summary");
    assert(completedB.online?.summary?.objectives?.completedObjectiveIds?.includes("seal_breach_gate"), "expected second client to see completed objective summary");
    assert(completed.online?.summary?.rewards?.rewardId === "plaza_stabilized", "expected normal route reward after objective completion");
    assert(completed.online?.persistence?.profile && !("objectives" in completed.online.persistence.profile), "expected objectives to stay out of durable route profile");
    assert(completed.online?.saveProfile?.exportCode?.startsWith("AGI1_"), "expected Milestone 31 completion to expose export code");
    const completedExport = decodeProofOnlineProfileCode(completed.online.saveProfile.exportCode);
    assert(completedExport && !("objectives" in completedExport), "expected export code payload to omit live objective state");
    assert(completedExport?.profile && !("objectives" in completedExport.profile), "expected export code profile to omit live objective progress");
    assert(completed.online?.persistence?.profile?.completedNodeIds?.includes("armistice_plaza"), "expected normal route completion persistence");

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone31 arena objectives");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone33ObjectiveVarietyScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m33");
  try {
    await launchOnlineArmistice(pageA, pageB);
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    const plazaLobby = await state(pageA);
    assert(plazaLobby.online?.routeUi?.artExpansion?.milestone33?.runtimeAtlasesReady === true, "expected M33 runtime art gates to be ready after M34 production atlas import");
    assert(plazaLobby.online?.party?.nodes?.some((node) => node.id === "cooling_lake_nine" && node.objectiveFlavor === "Coolant Chain"), "expected Cooling Lake route objective flavor");

    await voteBothToNode(pageA, pageB, "cooling_lake_nine");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    const lakeStart = await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.objectives?.objectiveSetId === "cooling_lake_nine_objectives_v1" &&
        text.online.objectives.instances?.some((entry) => entry.id === "seal_lake_kernel") &&
        text.online.objectives.instances?.some((entry) => entry.id === "collect_thermal_samples" && entry.itemId === "thermal_sample") &&
        text.online.objectives.instances?.some((entry) => entry.preferredRoles?.includes("cover")),
      "Milestone 33 Cooling Lake objective chain"
    );
    assert(lakeStart.online?.objectives?.instances?.length >= 5, "expected richer Cooling Lake objective chain");
    await capture(pageA, "milestone33-cooling-lake-objectives-a");
    await completeObjectiveChainWithProofControls(pageA, "cooling_lake_nine_objectives_v1", ["seal_lake_kernel"]);
    const lakeDone = await state(pageA);
    assert(lakeDone.online?.summary?.rewards?.rewardId === "lake_coolant_rig", "expected Cooling Lake reward after M33 chain");
    assert(lakeDone.online?.summary?.objectives?.completedObjectiveIds?.includes("seal_lake_kernel"), "expected lake seal objective in summary");
    assert(lakeDone.online?.persistence?.profile && !("objectives" in lakeDone.online.persistence.profile), "expected Lake profile to omit objective state");
    await capture(pageA, "milestone33-cooling-lake-completed-a");

    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");
    await voteBothToNode(pageA, pageB, "memory_cache_001");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "completed");
    const cacheDone = await state(pageA);
    assert(cacheDone.online?.summary?.objectives?.objectiveSetId === "ceasefire_cache_objectives_v1", "expected Cache objective summary shape");
    assert(cacheDone.online?.summary?.objectives?.completedObjectiveIds?.includes("verify_export_boundary"), "expected export-boundary cache interaction");
    assert(cacheDone.online?.summary?.objectives?.completedObjectiveIds?.includes("seal_cache_receipt"), "expected cache receipt interaction");
    assert(cacheDone.online?.summary?.objectives?.instances?.every((entry) => entry.runtimeArtReady === true), "expected Cache art references to be wired after M34 production atlas import");
    await capture(pageA, "milestone33-cache-interactions-a");

    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");
    await voteBothToNode(pageA, pageB, "transit_loop_zero");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    const transitStart = await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.objectives?.objectiveSetId === "transit_loop_objectives_v1" &&
        text.online.objectives.instances?.some((entry) => entry.id === "collect_transit_permit_shards" && entry.itemId === "transit_permit_shard") &&
        text.online.objectives.instances?.some((entry) => entry.id === "anchor_no_refund_gate" && entry.type === "seal"),
      "Milestone 33 Transit objective chain"
    );
    assert(transitStart.online?.routeUi?.selectedObjectiveFlavor === "Transit Sequence", "expected route UI objective flavor for Transit");
    await capture(pageA, "milestone33-transit-objectives-a");
    await completeObjectiveChainWithProofControls(pageA, "transit_loop_objectives_v1", ["anchor_no_refund_gate"]);
    const transitDone = await state(pageA);
    assert(transitDone.online?.summary?.objectives?.completedObjectiveIds?.includes("anchor_no_refund_gate"), "expected Transit boss-gate objective in summary");
    assert(transitDone.online?.rewards?.rewardIds?.includes("transit_loop_online_route"), "expected Transit route reward retained");
    await capture(pageA, "milestone33-transit-completed-a");

    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");
    await voteBothToNode(pageA, pageB, "verdict_spire");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    const verdictStart = await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.objectives?.objectiveSetId === "verdict_spire_objectives_v1" &&
        text.online.objectives.instances?.some((entry) => entry.id === "collect_appeal_tokens" && entry.itemId === "appeal_token") &&
        text.online.objectives.instances?.some((entry) => entry.preferredRoles?.includes("duelist")),
      "Milestone 33 Verdict objective chain"
    );
    assert(verdictStart.online?.objectives?.instances?.length >= 5, "expected richer Verdict objective chain");
    await capture(pageA, "milestone33-verdict-objectives-a");
    await completeObjectiveChainWithProofControls(pageA, "verdict_spire_objectives_v1", ["overrule_verdict_seal"]);
    const verdictDone = await state(pageA);
    assert(verdictDone.online?.summary?.objectives?.completedObjectiveIds?.includes("overrule_verdict_seal"), "expected Verdict seal objective in summary");
    assert(verdictDone.online?.persistence?.profile?.completedNodeIds?.includes("verdict_spire"), "expected Verdict route persistence");
    assert(verdictDone.online?.persistence?.profile && !("buildKit" in verdictDone.online.persistence.profile), "expected build kits to remain out of route profile");
    assert(verdictDone.online?.persistence?.profile && !("objectives" in verdictDone.online.persistence.profile), "expected objectives to remain out of route profile");
    const exportCode = verdictDone.online?.saveProfile?.exportCode;
    const decoded = decodeProofOnlineProfileCode(exportCode);
    assert(decoded?.profile && !("objectives" in decoded.profile), "expected export profile to omit M33 objective state");
    assert(decoded?.profile && !("buildKit" in decoded.profile), "expected export profile to omit selected build kit state");
    await capture(pageA, "milestone33-verdict-completed-a");

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone33 objective variety");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone34ObjectiveArtScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m34");
  try {
    const lobby = await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.assets?.productionAssets >= 32 &&
        text.online?.routeUi?.artExpansion?.milestone33?.runtimeAtlasesReady === true &&
        text.online?.routeUi?.artExpansion?.milestone34?.enabled === true &&
        text.online?.routeUi?.artExpansion?.milestone34?.runtimeAtlasesReady === true &&
        text.online?.routeUi?.artExpansion?.milestone33?.readyRuntimeArtIds?.length === 7,
      "Milestone 34 route/objective art atlases loaded",
      15_000
    );
    assert(lobby.online?.routeUi?.artExpansion?.milestone34?.objectivePropAtlases === 3, "expected three objective prop atlases loaded");
    assert(lobby.online?.routeUi?.artExpansion?.milestone34?.routeUiAtlases === 4, "expected four route/UI atlases loaded");
    await capture(pageA, "milestone34-party-grid-art-a");

    await launchOnlineArmistice(pageA, pageB);
    const armistice = await waitForOnlineServerCombat(
      pageA,
      (text) =>
        text.online?.objectives?.objectiveSetId === "armistice_plaza_objectives_v1" &&
        text.online.objectives.instances?.some((entry) => entry.runtimeArtId === "prop.objective.regroup_beacon_v1" && entry.runtimeArtReady === true) &&
        text.online.objectives.instances?.some((entry) => entry.runtimeArtId === "prop.objective.split_hold_anchor_v1" && entry.runtimeArtReady === true) &&
        text.online.objectives.instances?.some((entry) => entry.runtimeArtId === "prop.objective.recompile_relay_v1" && entry.runtimeArtReady === true) &&
        text.online.objectives.instances?.some((entry) => entry.runtimeArtId === "ui.route_map.reward_badges_v1" && entry.runtimeArtReady === true),
      "Milestone 34 Armistice objective art telemetry",
      10_000
    );
    assert(armistice.online?.objectives?.instances?.every((entry) => !entry.runtimeArtId || entry.runtimeArtPolicy === "requires_cleaned_or_production_manifest_asset"), "expected runtime art policy on objective entries");
    await capture(pageA, "milestone34-armistice-objective-art-a");

    await pageA.keyboard.press("Digit1");
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.online?.objectives?.currentGroupId === "calibrate_reality_relays" && text.online.objectives.instances?.some((entry) => entry.active && entry.runtimeArtReady),
      "Milestone 34 split-hold objective art active"
    );
    await capture(pageA, "milestone34-split-hold-art-a");

    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    const completed = await state(pageA);
    const decoded = decodeProofOnlineProfileCode(completed.online?.saveProfile?.exportCode);
    assert(decoded?.profile && !("objectives" in decoded.profile), "expected M34 export profile to omit live objective state");
    assert(decoded?.profile && !("buildKit" in decoded.profile), "expected M34 export profile to omit selected build kit state");
    await capture(pageA, "milestone34-completed-save-art-a");

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone34 objective art");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone35CampaignRouteScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m35");
  try {
    const lobby = await state(pageA);
    assert(lobby.online?.party?.campaign?.routeVersion === "campaign_route_v1", "expected M35 campaign route version in party snapshot");
    assert(lobby.online?.routeUi?.campaign?.routeVersion === "campaign_route_v1", "expected M35 campaign route version in route UI");
    assert(lobby.online?.routeUi?.campaign?.campaignNodeCount >= 13, "expected expanded Act I campaign route node count");
    assert(lobby.online?.routeUi?.totalRouteCount >= 18, "expected expanded Act I campaign route edge count");
    assert(lobby.online?.routeUi?.campaign?.criticalPathNodeIds?.includes("alignment_spire_finale"), "expected finale on campaign critical path");
    assert(lobby.online?.party?.nodes?.some((node) => node.id === "model_war_memorial" && node.campaignCriticalPath === false), "expected branch node metadata");
    await capture(pageA, "milestone35-campaign-route-lobby-a");

    await launchOnlineArmistice(pageA, pageB);
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    const plazaDone = await state(pageA);
    assert(plazaDone.online?.party?.unlockedNodeIds?.includes("model_war_memorial"), "expected Armistice Plaza to unlock campaign memorial branch");
    assert(plazaDone.online?.rewards?.recommendedNodeId === "cooling_lake_nine", "expected critical path recommendation to remain Cooling Lake");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "model_war_memorial");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "completed");
    const memorialDone = await state(pageA);
    assert(memorialDone.online?.summary?.nodeId === "model_war_memorial", "expected memorial branch completion summary");
    assert(memorialDone.online?.summary?.rewards?.rewardId === "model_war_memorial_cipher", "expected memorial branch reward override");
    assert(memorialDone.online?.rewards?.recommendedNodeId === "cooling_lake_nine", "expected optional branch not to displace critical path recommendation");
    assert(memorialDone.online?.persistence?.profile && !("campaign" in memorialDone.online.persistence.profile), "expected campaign route metadata to stay out of durable profile");
    await capture(pageA, "milestone35-memorial-branch-completed-a");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "cooling_lake_nine");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    const afterLake = await state(pageA);
    assert(afterLake.online?.party?.unlockedNodeIds?.includes("thermal_archive"), "expected Cooling Lake to unlock Thermal Archive branch");
    assert(afterLake.online?.party?.unlockedNodeIds?.includes("memory_cache_001"), "expected old Cache unlock to remain");
    assert(afterLake.online?.party?.rewards?.recommendedNodeId === "memory_cache_001", "expected Cache to remain next critical path recommendation");

    await voteBothToNode(pageA, pageB, "memory_cache_001");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "completed");
    const cacheDone = await state(pageA);
    assert(cacheDone.online?.party?.unlockedNodeIds?.includes("guardrail_forge"), "expected Cache to unlock Guardrail Forge branch");
    assert(cacheDone.online?.party?.unlockedNodeIds?.includes("transit_loop_zero"), "expected Cache to keep Transit unlock");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "transit_loop_zero");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    const transitDone = await state(pageA);
    assert(transitDone.online?.party?.unlockedNodeIds?.includes("false_schedule_yard"), "expected Transit to unlock False Schedule branch");
    assert(transitDone.online?.rewards?.recommendedNodeId === "verdict_spire", "expected Verdict to remain critical path recommendation after Transit");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "verdict_spire");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    const verdictDone = await state(pageA);
    assert(verdictDone.online?.party?.unlockedNodeIds?.includes("alignment_spire_finale"), "expected Verdict to unlock campaign finale");
    assert(verdictDone.online?.rewards?.recommendedNodeId === "alignment_spire_finale", "expected finale recommendation after Verdict");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "alignment_spire_finale");
    await capture(pageA, "milestone35-finale-vote-a");
    const finaleVote = await state(pageA);
    assert(finaleVote.online?.routeUi?.selectedNodeId === "alignment_spire_finale", "expected route UI to select campaign finale");
    assert(finaleVote.online?.routeUi?.selectedCampaignCriticalPath === true, "expected finale to be marked critical path");
    assert(finaleVote.online?.routeUi?.selectedLaunchable === true, "expected finale launchable after Verdict");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    const finaleActive = await state(pageA);
    assert(finaleActive.online?.party?.activeNodeId === "alignment_spire_finale", "expected finale active node");
    assert(finaleActive.level?.arenaId === "alignment_spire_finale", "expected finale to launch its dedicated runtime arena");
    assert(finaleActive.online?.networkAuthority === "colyseus_room_server_combat", "expected finale to remain server authoritative");
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    const finaleDone = await state(pageA);
    assert(finaleDone.online?.summary?.rewards?.rewardId === "alignment_spire_route_capstone", "expected finale route reward override");
    assert(finaleDone.online?.persistence?.profile?.completedNodeIds?.includes("alignment_spire_finale"), "expected finale completion in durable route profile");
    assert(finaleDone.online?.persistence?.profile?.routeDepth >= 6, "expected route depth to include expanded critical path");
    assert(finaleDone.online?.persistence?.profile && !("objectives" in finaleDone.online.persistence.profile), "expected live objective state omitted from M35 profile");
    assert(finaleDone.online?.persistence?.profile && !("buildKit" in finaleDone.online.persistence.profile), "expected selected build kit omitted from M35 profile");
    assert(finaleDone.online?.persistence?.profile && !("campaign" in finaleDone.online.persistence.profile), "expected campaign metadata omitted from M35 profile");
    const decoded = decodeProofOnlineProfileCode(finaleDone.online?.saveProfile?.exportCode);
    assert(decoded?.profile && !("objectives" in decoded.profile), "expected M35 export code to omit objective state");
    assert(decoded?.profile && !("buildKit" in decoded.profile), "expected M35 export code to omit selected build kit state");
    assert(decoded?.profile && !("campaign" in decoded.profile), "expected M35 export code to omit campaign metadata");
    await capture(pageA, "milestone35-finale-completed-a");

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone35 campaign route");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone36CampaignContentSchemaScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m36");
  try {
    const lobby = await state(pageA);
    const schema = lobby.online?.routeUi?.campaign?.contentSchema;
    assert(schema?.policy === "campaign_content_schema_v1", "expected M36 campaign content schema policy");
    assert(schema.complete === true, "expected M36 campaign content schema to be complete");
    assert(schema.arenaRecordCount === lobby.online?.routeUi?.campaign?.campaignNodeCount, "expected one content arena record per route node");
    assert(schema.arenaRecordCount >= 13, "expected all M35 campaign nodes to have M36 content records");
    assert(schema.bossRecordCount >= 6, "expected campaign boss records");
    assert(schema.enemyFamilyRecordCount >= 7, "expected campaign enemy-family records");
    assert(schema.rewardRecordCount >= 15, "expected campaign reward records");
    assert(schema.dialogueSnippetCount >= 20, "expected campaign dialogue snippet records");
    for (const node of lobby.online?.party?.nodes ?? []) {
      assert(node.proofId?.startsWith("campaign.arena."), `expected campaign proof ID for ${node.id}`);
      assert(node.contentArenaId?.startsWith("arena."), `expected content arena ID for ${node.id}`);
      assert(node.runtimeArenaId, `expected runtime arena mapping for ${node.id}`);
      assert(node.regionId, `expected region ID for ${node.id}`);
      assert(node.bossId, `expected boss ID for ${node.id}`);
      assert(node.enemyFamilyIds?.length > 0, `expected enemy-family IDs for ${node.id}`);
      assert(node.rewardId, `expected reward ID for ${node.id}`);
      assert(node.objectiveSetId, `expected objective set ID for ${node.id}`);
      assert(node.dialogueSnippetIds?.length > 0, `expected dialogue snippets for ${node.id}`);
    }
    assert(lobby.online?.party?.nodes?.find((node) => node.id === "thermal_archive")?.objectiveSetId === "thermal_archive_objectives_v1", "expected Thermal Archive objective set record");
    assert(lobby.online?.party?.nodes?.find((node) => node.id === "false_schedule_yard")?.objectiveSetId === "false_schedule_yard_objectives_v1", "expected False Schedule Yard objective set record");
    assert(lobby.online?.party?.nodes?.find((node) => node.id === "alignment_spire_finale")?.bossId === "alien_god_intelligence", "expected finale boss content record");
    assert(lobby.online?.campaignContent?.policy === "campaign_content_schema_v1", "expected active campaign content snapshot");
    await capture(pageA, "milestone36-content-schema-lobby-a");

    await launchOnlineArmistice(pageA, pageB);
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "model_war_memorial");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "completed");
    const memorial = await state(pageA);
    assert(memorial.online?.summary?.objectives?.objectiveSetId === "model_war_memorial_objectives_v1", "expected memorial node-specific objective set");
    assert(memorial.online?.summary?.objectives?.completedObjectiveIds?.includes("decode_casualty_ledger"), "expected memorial casualty ledger objective");
    assert(memorial.online?.summary?.rewards?.rewardId === "model_war_memorial_cipher", "expected memorial content reward");
    assert(memorial.online?.campaignContent?.bossId === "memory_curator", "expected memorial campaign boss content");
    await capture(pageA, "milestone36-memorial-content-a");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "cooling_lake_nine");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "thermal_archive");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    const thermalActive = await state(pageA);
    assert(thermalActive.online?.campaignContent?.nodeId === "thermal_archive", "expected active Thermal Archive campaign content");
    assert(thermalActive.online?.campaignContent?.runtimeArenaId === "thermal_archive", "expected Thermal Archive dedicated runtime mapping");
    assert(thermalActive.online?.objectives?.objectiveSetId === "thermal_archive_objectives_v1", "expected Thermal Archive runtime objective set");
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    const thermal = await state(pageA);
    assert(thermal.online?.summary?.rewards?.rewardId === "thermal_archive_schematic", "expected Thermal Archive reward record");
    await capture(pageA, "milestone36-thermal-content-a");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "memory_cache_001");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "completed");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "guardrail_forge");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "completed");
    const forge = await state(pageA);
    assert(forge.online?.summary?.objectives?.objectiveSetId === "guardrail_forge_objectives_v1", "expected Guardrail Forge objective set");
    assert(forge.online?.summary?.rewards?.rewardId === "guardrail_forge_alloy", "expected Guardrail Forge reward record");
    assert(forge.online?.campaignContent?.dialogueSnippetIds?.includes("dlg.guardrail_forge.decode"), "expected Guardrail Forge dialogue snippet");
    await pageA.close();
    await pageB.close();

    const onwardContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const onwardCode = encodeProofRouteProfileCode({
      completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "guardrail_forge"],
      rewardIds: ["plaza_stabilized", "lake_coolant_rig", "ceasefire_cache_persistence_seed", "prototype_persistence_boundary", "guardrail_forge_alloy"],
      partyRenown: 12,
      routeDepth: 4,
      saveHash: "proof_m36_onward_route_profile"
    });
    const onward = await openOnlinePairInContext(onwardContext, "m36_onward", errors, { importOnlineProfileCode: onwardCode });

    await voteBothToNode(onward.pageA, onward.pageB, "transit_loop_zero");
    await Promise.all([onward.pageA.keyboard.press("Space"), onward.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(onward.pageA, "active");
    await onward.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(onward.pageA, "completed");
    await onward.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(onward.pageA, "lobby");
    await waitForOnlineRunPhase(onward.pageB, "lobby");

    await voteBothToNode(onward.pageA, onward.pageB, "false_schedule_yard");
    await Promise.all([onward.pageA.keyboard.press("Space"), onward.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(onward.pageA, "active");
    const falseScheduleActive = await state(onward.pageA);
    assert(falseScheduleActive.online?.objectives?.objectiveSetId === "false_schedule_yard_objectives_v1", "expected False Schedule objective set");
    assert(falseScheduleActive.online?.campaignContent?.enemyFamilyIds?.includes("false_schedules"), "expected False Schedule enemy family content");
    await onward.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(onward.pageA, "completed");
    const falseSchedule = await state(onward.pageA);
    assert(falseSchedule.online?.summary?.rewards?.rewardId === "false_schedule_lane_chart", "expected False Schedule reward record");
    await capture(onward.pageA, "milestone36-false-schedule-content-a");
    await onward.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(onward.pageA, "lobby");
    await waitForOnlineRunPhase(onward.pageB, "lobby");

    const afterFalseSchedule = await state(onward.pageA);
    assert(afterFalseSchedule.online?.party?.nodes?.find((node) => node.id === "appeal_court_ruins")?.objectiveSetId === "appeal_court_ruins_objectives_v1", "expected Appeal Court objective set record");
    assert(afterFalseSchedule.online?.party?.unlockedNodeIds?.includes("appeal_court_ruins"), "expected False Schedule to unlock Appeal Court branch");

    await voteBothToNode(onward.pageA, onward.pageB, "verdict_spire");
    await Promise.all([onward.pageA.keyboard.press("Space"), onward.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(onward.pageA, "active");
    await onward.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(onward.pageA, "completed");
    await onward.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(onward.pageA, "lobby");
    await waitForOnlineRunPhase(onward.pageB, "lobby");

    await voteBothToNode(onward.pageA, onward.pageB, "alignment_spire_finale");
    await Promise.all([onward.pageA.keyboard.press("Space"), onward.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(onward.pageA, "active");
    const finaleActive = await state(onward.pageA);
    assert(finaleActive.online?.objectives?.objectiveSetId === "alignment_spire_finale_objectives_v1", "expected finale objective set");
    assert(finaleActive.online?.campaignContent?.bossId === "alien_god_intelligence", "expected finale boss content ID");
    assert(finaleActive.online?.campaignContent?.dialogueSnippetIds?.includes("dlg.agi.victory"), "expected finale victory dialogue snippet");
    await onward.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(onward.pageA, "completed");
    const finale = await state(onward.pageA);
    assert(finale.online?.summary?.rewards?.rewardId === "alignment_spire_route_capstone", "expected finale reward content");
    assert(finale.online?.persistence?.profile && !("campaignContent" in finale.online.persistence.profile), "expected content schema omitted from durable profile");
    assert(finale.online?.persistence?.profile && !("objectives" in finale.online.persistence.profile), "expected live objectives omitted from durable profile");
    assert(finale.online?.persistence?.profile && !("buildKit" in finale.online.persistence.profile), "expected build kits omitted from durable profile");
    const decoded = decodeProofOnlineProfileCode(finale.online?.saveProfile?.exportCode);
    assert(decoded?.profile && !("campaignContent" in decoded.profile), "expected export profile to omit M36 content schema");
    assert(decoded?.profile && !("objectives" in decoded.profile), "expected export profile to omit live objective state");
    await capture(onward.pageA, "milestone36-finale-content-a");
    await onward.pageA.close();
    await onward.pageB.close();
    await onwardContext.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone36 campaign content schema");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone37RouteArtPolishScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const denseRouteCode = milestone37DenseRouteProfileCode();
  try {
    const dense = await openOnlinePairInContext(context, "m37_dense", errors, { importOnlineProfileCode: denseRouteCode });
    const lobby = await waitForOnlineServerCombat(
      dense.pageA,
      (text) =>
        text.assetRendering?.productionArtDefaulted === true &&
        text.online?.routeUi?.selectedNodeId === "alignment_spire_finale" &&
        text.online?.routeUi?.artExpansion?.milestone37?.enabled === true &&
        text.online?.routeUi?.artExpansion?.milestone37?.denseCampaignNodeCount >= 13 &&
        text.online?.routeUi?.artExpansion?.milestone37?.denseCampaignRouteCount >= 18 &&
        text.online?.routeUi?.artExpansion?.milestone37?.compactLabelCount > 0 &&
        text.online?.routeUi?.artExpansion?.milestone37?.fullLabelIds?.includes("alignment_spire_finale"),
      "Milestone 37 dense route-art polish telemetry",
      15_000
    );
    assert(lobby.online?.routeUi?.artExpansion?.milestone37?.routeMarkerPolicy?.includes("haloed"), "expected haloed route marker policy");
    assert(lobby.online?.routeUi?.artExpansion?.milestone37?.nodeStatePolicy === "status_priority_completed_selected_launchable_locked_online_next", "expected explicit node-state policy");
    assert(lobby.online?.routeUi?.artExpansion?.milestone34?.runtimeAtlasesReady === true, "expected M34 atlas readiness preserved");
    assert(lobby.online?.persistence?.profile && !("objectives" in lobby.online.persistence.profile), "expected M37 imported profile to omit objectives");
    assert(lobby.online?.persistence?.profile && !("buildKit" in lobby.online.persistence.profile), "expected M37 imported profile to omit build kits");
    assert(lobby.online?.persistence?.profile && !("campaignContent" in lobby.online.persistence.profile), "expected M37 imported profile to omit campaign content");
    await capture(dense.pageA, "milestone37-dense-route-art-polish-a");
    await dense.pageA.close();
    await dense.pageB.close();

    const optOut = await openOnlinePairInContext(context, "m37_optout", errors, { importOnlineProfileCode: denseRouteCode, productionArt: "0", placeholderArt: "1" });
    const optOutLobby = await state(optOut.pageA);
    assert(optOutLobby.assetRendering?.productionArtEnabled === false, "expected production-art opt-out to remain supported");
    assert(optOutLobby.online?.routeUi?.artExpansion?.milestone34?.enabled === false, "expected M34 atlases disabled under production-art opt-out");
    assert(optOutLobby.online?.routeUi?.artExpansion?.milestone37?.enabled === false, "expected M37 polish atlas presentation disabled under production-art opt-out");
    await capture(optOut.pageA, "milestone37-placeholder-opt-out-a");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone37 route art polish");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone38DistinctCampaignArenasScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const baseRewards = [
    "plaza_stabilized",
    "lake_coolant_rig",
    "cooling_lake_online_route",
    "ceasefire_cache_persistence_seed",
    "prototype_persistence_boundary",
    "transit_permit_zero",
    "transit_loop_online_route",
    "verdict_key_zero",
    "verdict_spire_online_route"
  ];
  const runtimeNodeIds = [
    "armistice_plaza",
    "cooling_lake_nine",
    "memory_cache_001",
    "transit_loop_zero",
    "verdict_spire",
    "model_war_memorial",
    "thermal_archive",
    "guardrail_forge",
    "false_schedule_yard",
    "appeal_court_ruins",
    "alignment_spire_finale"
  ];

  try {
    const schemaPair = await openOnlinePairInContext(context, "m38_schema", errors, { importOnlineProfileCode: milestone37DenseRouteProfileCode() });
    const lobby = await waitForOnlineServerCombat(
      schemaPair.pageA,
      (text) => text.online?.routeUi?.campaign?.contentSchema?.policy === "campaign_content_schema_v1" && text.online?.party?.nodes?.length >= 13,
      "Milestone 38 campaign arena schema lobby",
      15_000
    );
    for (const nodeId of runtimeNodeIds) {
      const node = lobby.online?.party?.nodes?.find((candidate) => candidate.id === nodeId);
      assert(node?.arenaId === nodeId, `expected ${nodeId} route arena ID to be dedicated`);
      assert(node?.runtimeArenaId === nodeId, `expected ${nodeId} content runtime arena ID to be dedicated`);
      assert(!String(node?.contentStatus ?? "").includes("proxy"), `expected ${nodeId} content status to no longer be proxy`);
      assert(node?.objectiveSetId, `expected ${nodeId} objective set ID`);
      assert(node?.proofId?.startsWith("campaign.arena."), `expected ${nodeId} campaign proof ID`);
    }
    assert(lobby.online?.persistence?.profile && !("campaignContent" in lobby.online.persistence.profile), "expected M38 schema lobby to omit campaign content from durable profile");
    await capture(schemaPair.pageA, "milestone38-distinct-runtime-schema-a");
    await schemaPair.pageA.close();
    await schemaPair.pageB.close();

    await launchMilestone38Node(context, errors, {
      tag: "m38_memorial",
      nodeId: "model_war_memorial",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza"],
        rewardIds: ["plaza_stabilized"],
        partyRenown: 2,
        routeDepth: 1,
        saveHash: "proof_m38_memorial_profile"
      }),
      mode: "completed",
      objectiveSetId: "model_war_memorial_objectives_v1",
      rewardId: "model_war_memorial_cipher",
      captureName: "milestone38-model-war-memorial-runtime-a"
    });

    await launchMilestone38Node(context, errors, {
      tag: "m38_thermal",
      nodeId: "thermal_archive",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine"],
        rewardIds: ["plaza_stabilized", "lake_coolant_rig", "cooling_lake_online_route"],
        partyRenown: 7,
        routeDepth: 2,
        saveHash: "proof_m38_thermal_profile"
      }),
      mode: "active",
      objectiveSetId: "thermal_archive_objectives_v1",
      rewardId: "thermal_archive_schematic",
      eventFamily: "thermal_bloom",
      bossGateMechanic: "thermal_archive_backpath",
      captureName: "milestone38-thermal-archive-runtime-a"
    });

    await launchMilestone38Node(context, errors, {
      tag: "m38_forge",
      nodeId: "guardrail_forge",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001"],
        rewardIds: ["plaza_stabilized", "lake_coolant_rig", "ceasefire_cache_persistence_seed", "prototype_persistence_boundary"],
        partyRenown: 9,
        routeDepth: 3,
        saveHash: "proof_m38_forge_profile"
      }),
      mode: "completed",
      objectiveSetId: "guardrail_forge_objectives_v1",
      rewardId: "guardrail_forge_alloy",
      captureName: "milestone38-guardrail-forge-runtime-a"
    });

    await launchMilestone38Node(context, errors, {
      tag: "m38_false_schedule",
      nodeId: "false_schedule_yard",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "guardrail_forge", "transit_loop_zero"],
        rewardIds: [...baseRewards, "guardrail_forge_alloy"],
        partyRenown: 16,
        routeDepth: 5,
        saveHash: "proof_m38_false_schedule_profile"
      }),
      mode: "active",
      objectiveSetId: "false_schedule_yard_objectives_v1",
      rewardId: "false_schedule_lane_chart",
      eventFamily: "false_track",
      bossGateMechanic: "false_schedule_lane_chart",
      captureName: "milestone38-false-schedule-runtime-a"
    });

    await launchMilestone38Node(context, errors, {
      tag: "m38_appeal",
      nodeId: "appeal_court_ruins",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "guardrail_forge", "transit_loop_zero", "false_schedule_yard"],
        rewardIds: [...baseRewards, "guardrail_forge_alloy", "false_schedule_lane_chart"],
        partyRenown: 19,
        routeDepth: 6,
        saveHash: "proof_m38_appeal_profile"
      }),
      mode: "active",
      objectiveSetId: "appeal_court_ruins_objectives_v1",
      rewardId: "appeal_court_brief",
      eventFamily: "verdict_seal",
      bossGateMechanic: "appeal_court_record",
      captureName: "milestone38-appeal-court-runtime-a"
    });

    await launchMilestone38Node(context, errors, {
      tag: "m38_finale",
      nodeId: "alignment_spire_finale",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "transit_loop_zero", "verdict_spire"],
        rewardIds: baseRewards,
        partyRenown: 20,
        routeDepth: 5,
        saveHash: "proof_m38_finale_profile"
      }),
      mode: "active",
      objectiveSetId: "alignment_spire_finale_objectives_v1",
      rewardId: "alignment_spire_route_capstone",
      eventFamily: "prediction_ghost",
      bossGateMechanic: "outer_alignment_final_eval",
      bossId: "alien_god_intelligence",
      captureName: "milestone38-finale-runtime-a"
    });

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone38 distinct campaign arenas");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function launchMilestone38Node(context, errors, { tag, nodeId, code, mode, objectiveSetId, rewardId, eventFamily, bossGateMechanic, bossId, captureName }) {
  const pair = await openOnlinePairInContext(context, tag, errors, { importOnlineProfileCode: code });
  try {
    const lobby = await state(pair.pageA);
    const node = lobby.online?.party?.nodes?.find((candidate) => candidate.id === nodeId);
    assert(node?.arenaId === nodeId, `expected ${nodeId} lobby arena ID`);
    assert(node?.runtimeArenaId === nodeId, `expected ${nodeId} lobby runtime arena ID`);
    assert(lobby.online?.party?.launchableNodeIds?.includes(nodeId), `expected ${nodeId} to be launchable`);
    await voteBothToNode(pair.pageA, pair.pageB, nodeId);
    await Promise.all([pair.pageA.keyboard.press("Space"), pair.pageB.keyboard.press("Space")]);

    if (mode === "completed") {
      await waitForOnlineRunPhase(pair.pageA, "completed");
      const completed = await state(pair.pageA);
      assert(completed.online?.summary?.nodeId === nodeId, `expected ${nodeId} interaction summary`);
      assert(completed.online?.summary?.arenaId === nodeId, `expected ${nodeId} interaction arena summary`);
      assert(completed.online?.summary?.objectives?.arenaId === nodeId, `expected ${nodeId} interaction objective arena`);
      assert(completed.online?.summary?.objectives?.objectiveSetId === objectiveSetId, `expected ${nodeId} objective set`);
      assert(completed.online?.summary?.rewards?.rewardId === rewardId, `expected ${nodeId} reward`);
      assert(completed.online?.campaignContent?.runtimeArenaId === nodeId, `expected ${nodeId} completed campaign runtime content`);
      assert(completed.online?.persistence?.profile && !("objectives" in completed.online.persistence.profile), `expected ${nodeId} profile to omit objectives`);
      await capture(pair.pageA, captureName);
      return completed;
    }

    await waitForOnlineRunPhase(pair.pageA, "active");
    const active = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.level?.arenaId === nodeId &&
        text.online?.party?.activeNodeId === nodeId &&
        text.online?.objectives?.arenaId === nodeId &&
        text.online?.objectives?.objectiveSetId === objectiveSetId &&
        text.online?.campaignContent?.runtimeArenaId === nodeId &&
        text.online?.combat?.bossGateMechanic === bossGateMechanic &&
        (!bossId || text.online?.campaignContent?.bossId === bossId) &&
        (!eventFamily || text.online?.regionEvent?.eventFamily === eventFamily),
      `${nodeId} dedicated runtime launch`,
      15_000
    );
    assert(active.online?.networkAuthority === "colyseus_room_server_combat", `expected ${nodeId} server authority`);
    assert(active.online?.regionEvent?.arenaId === nodeId, `expected ${nodeId} region event arena ID`);
    assert(active.online?.persistence?.profile && !("campaignContent" in active.online.persistence.profile), `expected ${nodeId} profile to omit campaign content`);
    await capture(pair.pageA, captureName);
    await pair.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pair.pageA, "completed");
    const completed = await state(pair.pageA);
    assert(completed.online?.summary?.arenaId === nodeId, `expected ${nodeId} completion arena summary`);
    assert(completed.online?.summary?.objectives?.objectiveSetId === objectiveSetId, `expected ${nodeId} completion objective set`);
    assert(completed.online?.summary?.rewards?.rewardId === rewardId, `expected ${nodeId} completion reward`);
    const decoded = decodeProofOnlineProfileCode(completed.online?.saveProfile?.exportCode);
    assert(decoded?.profile && !("campaignContent" in decoded.profile), `expected ${nodeId} export profile to omit campaign content`);
    assert(decoded?.profile && !("objectives" in decoded.profile), `expected ${nodeId} export profile to omit objectives`);
    assert(decoded?.profile && !("authority" in decoded.profile), `expected ${nodeId} export profile to omit authority`);
    return completed;
  } finally {
    await pair.pageA.close();
    await pair.pageB.close();
  }
}

async function runMilestone39CampaignDialogueScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  try {
    const finale = await openOnlinePairInContext(context, "m39_finale", errors, { importOnlineProfileCode: milestone37DenseRouteProfileCode() });
    const lobby = await waitForOnlineServerCombat(
      finale.pageA,
      (text) =>
        text.online?.runPhase === "lobby" &&
        text.online?.routeUi?.selectedNodeId === "alignment_spire_finale" &&
        text.online?.dialogue?.policy === "campaign_dialogue_runtime_snapshot_only_v1" &&
        text.online.dialogue.briefing?.some((snippet) => snippet.id === "dlg.outer_alignment.briefing") &&
        text.online?.routeUi?.selectedDialogueSnippets?.some((snippet) => snippet.id === "dlg.agi.victory"),
      "M39 finale lobby briefing dialogue",
      15_000
    );
    assert(lobby.online?.dialogue?.persistenceBoundary === "route_profile_only_no_dialogue_or_live_state", "expected runtime-only dialogue persistence boundary");
    assert(lobby.online?.persistence?.profile && !("dialogue" in lobby.online.persistence.profile), "expected lobby route profile to omit dialogue");
    await capture(finale.pageA, "milestone39-dialogue-lobby-briefing-a");

    await Promise.all([finale.pageA.keyboard.press("Space"), finale.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(finale.pageA, "active");
    await finale.pageA.keyboard.press("KeyF");
    const boss = await waitForOnlineServerCombat(
      finale.pageA,
      (text) =>
        text.online?.bossEvent?.bossIntroSeen === true &&
        text.online?.dialogue?.bossArrival?.some((snippet) => snippet.id === "dlg.agi.arrival") &&
        text.online?.dialogue?.activeSnippetIds?.includes("dlg.agi.arrival"),
      "M39 boss-arrival dialogue",
      10_000
    );
    assert(boss.online?.campaignContent?.dialogueSnippets?.some((snippet) => snippet.id === "dlg.agi.arrival"), "expected expanded dialogue snippets in active content snapshot");
    await capture(finale.pageA, "milestone39-dialogue-boss-arrival-a");

    await finale.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(finale.pageA, "completed");
    const finaleSummary = await state(finale.pageA);
    assert(finaleSummary.online?.summary?.dialogue?.snippets?.some((snippet) => snippet.id === "dlg.agi.victory"), "expected finale route-summary dialogue");
    assert(finaleSummary.online?.dialogue?.routeSummary?.some((snippet) => snippet.id === "dlg.agi.victory"), "expected active dialogue snapshot to expose route summary lines");
    assert(finaleSummary.online?.summary?.dialogue?.persistenceBoundary === "route_profile_only_no_dialogue_or_live_state", "expected summary dialogue to remain runtime-only");
    assert(finaleSummary.online?.persistence?.profile && !("dialogue" in finaleSummary.online.persistence.profile), "expected completed route profile to omit dialogue");
    const finaleDecoded = decodeProofOnlineProfileCode(finaleSummary.online?.saveProfile?.exportCode);
    assert(finaleDecoded?.profile && !("dialogue" in finaleDecoded.profile), "expected export profile to omit dialogue");
    assert(finaleDecoded?.profile && !("campaignContent" in finaleDecoded.profile), "expected export profile to omit campaign content");
    assert(finaleDecoded?.profile && !("objectives" in finaleDecoded.profile), "expected export profile to omit objectives");
    assert(finaleDecoded?.profile && !("authority" in finaleDecoded.profile), "expected export profile to omit authority");
    await capture(finale.pageA, "milestone39-dialogue-route-summary-a");
    await finale.pageA.close();
    await finale.pageB.close();

    const forgeCode = encodeProofRouteProfileCode({
      completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001"],
      rewardIds: ["plaza_stabilized", "lake_coolant_rig", "ceasefire_cache_persistence_seed", "prototype_persistence_boundary"],
      partyRenown: 9,
      routeDepth: 3,
      saveHash: "proof_m39_forge_dialogue_profile"
    });
    const forge = await openOnlinePairInContext(context, "m39_forge", errors, { importOnlineProfileCode: forgeCode });
    await voteBothToNode(forge.pageA, forge.pageB, "guardrail_forge");
    await Promise.all([forge.pageA.keyboard.press("Space"), forge.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(forge.pageA, "completed");
    const interaction = await state(forge.pageA);
    assert(interaction.online?.summary?.dialogue?.snippets?.some((snippet) => snippet.id === "dlg.guardrail_forge.decode"), "expected interaction completion dialogue");
    assert(interaction.online?.dialogue?.interactionComplete?.some((snippet) => snippet.id === "dlg.memory_curator.boundary"), "expected boundary line on interaction completion surface");
    assert(interaction.online?.campaignContent?.dialogueSnippets?.some((snippet) => snippet.id === "dlg.guardrail_forge.decode"), "expected expanded interaction content dialogue");
    assert(interaction.online?.persistence?.profile && !("dialogue" in interaction.online.persistence.profile), "expected interaction profile to omit dialogue");
    const interactionDecoded = decodeProofOnlineProfileCode(interaction.online?.saveProfile?.exportCode);
    assert(interactionDecoded?.profile && !("dialogue" in interactionDecoded.profile), "expected interaction export profile to omit dialogue");
    await capture(forge.pageA, "milestone39-dialogue-interaction-summary-a");
    await forge.pageA.close();
    await forge.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone39 campaign dialogue");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone40CampaignRouteUxScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  try {
    const dense = await openOnlinePairInContext(context, "m40_dense", errors, { importOnlineProfileCode: milestone37DenseRouteProfileCode() });
    const lobby = await waitForOnlineServerCombat(
      dense.pageA,
      (text) =>
        text.online?.runPhase === "lobby" &&
        text.online?.routeUi?.selectedNodeId === "alignment_spire_finale" &&
        text.online?.routeUi?.milestone40?.set === "milestone40_campaign_route_ux" &&
        text.online?.routeUi?.milestone40?.focusMode === "all" &&
        text.online?.routeUi?.milestone40?.focusModes?.includes("schema"),
      "M40 default route UX focus",
      15_000
    );
    assert(lobby.online?.routeUi?.milestone40?.highlightedNodeIds?.length >= 13, "expected all route nodes highlighted by default");
    assert(lobby.online?.routeUi?.milestone40?.selectedSchemaDetails?.runtimeArenaId === "alignment_spire_finale", "expected selected runtime arena detail");
    assert(lobby.online?.routeUi?.milestone40?.selectedSchemaDetails?.objectiveSetId === "alignment_spire_finale_objectives_v1", "expected selected objective schema detail");
    assert(lobby.online?.routeUi?.milestone40?.selectedClassification === "finale", "expected finale classification in route UX");
    assert(lobby.online?.routeUi?.milestone40?.schemaDetailPolicy === "selected_node_content_schema_details_visible_without_persistence_import_export", "expected M40 schema detail policy");
    assert(lobby.online?.persistence?.profile && !("routeUi" in lobby.online.persistence.profile), "expected route UX state omitted from durable profile");
    await capture(dense.pageA, "milestone40-route-focus-all-a");

    await dense.pageA.keyboard.press("Digit3");
    const critical = await waitForOnlineServerCombat(
      dense.pageA,
      (text) =>
        text.online?.routeUi?.milestone40?.focusMode === "critical" &&
        text.online.routeUi.milestone40.highlightedNodeIds?.includes("alignment_spire_finale") &&
        text.online.routeUi.milestone40.highlightedNodeIds?.includes("verdict_spire") &&
        text.online.routeUi.milestone40.dimmedNodeIds?.includes("thermal_archive"),
      "M40 critical route focus",
      8_000
    );
    assert(critical.online?.routeUi?.milestone40?.criticalPathCount >= 6, "expected critical path count");
    await capture(dense.pageA, "milestone40-route-focus-critical-a");

    await dense.pageA.keyboard.press("Digit3");
    const branches = await waitForOnlineServerCombat(
      dense.pageA,
      (text) =>
        text.online?.routeUi?.milestone40?.focusMode === "branches" &&
        text.online.routeUi.milestone40.highlightedNodeIds?.includes("thermal_archive") &&
        text.online.routeUi.milestone40.highlightedNodeIds?.includes("guardrail_forge") &&
        text.online.routeUi.milestone40.branchCount >= 5,
      "M40 branch route focus",
      8_000
    );
    assert(branches.online?.routeUi?.milestone40?.highlightedRouteIds?.some((routeId) => routeId.includes("thermal") || routeId.includes("guardrail")), "expected branch route highlights");
    await capture(dense.pageA, "milestone40-route-focus-branches-a");

    await dense.pageA.keyboard.press("Digit3");
    const rewards = await waitForOnlineServerCombat(
      dense.pageA,
      (text) =>
        text.online?.routeUi?.milestone40?.focusMode === "rewards" &&
        text.online.routeUi.milestone40.rewardPreviewIds?.includes("alignment_spire_finale") &&
        text.online.routeUi.milestone40.selectedRewardCollected === false,
      "M40 reward route focus",
      8_000
    );
    assert(rewards.online?.routeUi?.milestone40?.selectedSchemaDetails?.rewardId === "alignment_spire_route_capstone", "expected selected reward detail");
    await capture(dense.pageA, "milestone40-route-focus-rewards-a");

    await dense.pageA.keyboard.press("Digit3");
    const schema = await waitForOnlineServerCombat(
      dense.pageA,
      (text) =>
        text.online?.routeUi?.milestone40?.focusMode === "schema" &&
        text.online.routeUi.milestone40.selectedSchemaDetails?.contentStatus === "runtime_ready_finale" &&
        text.online.routeUi.campaign?.contentSchema?.policy === "campaign_content_schema_v1" &&
        text.online.routeUi.campaign.contentSchema.dialoguePresentationPolicy === "campaign_dialogue_runtime_snapshot_only_v1",
      "M40 schema route focus",
      8_000
    );
    assert(schema.online?.routeUi?.milestone40?.selectedSchemaDetails?.bossId === "alien_god_intelligence", "expected selected boss schema detail");
    assert(schema.online?.routeUi?.milestone40?.selectedSchemaDetails?.dialogueSnippetCount >= 3, "expected selected dialogue count in schema detail");
    const decoded = decodeProofOnlineProfileCode(schema.online?.saveProfile?.exportCode);
    assert(decoded?.profile && !("routeUi" in decoded.profile), "expected export profile to omit route UX state");
    assert(decoded?.profile && !("campaignContent" in decoded.profile), "expected export profile to omit campaign content");
    assert(decoded?.profile && !("dialogue" in decoded.profile), "expected export profile to omit dialogue");
    assert(decoded?.profile && !("objectives" in decoded.profile), "expected export profile to omit objectives");
    await capture(dense.pageA, "milestone40-route-focus-schema-a");
    await dense.pageA.close();
    await dense.pageB.close();

    const optOut = await openOnlinePairInContext(context, "m40_optout", errors, { importOnlineProfileCode: milestone37DenseRouteProfileCode(), productionArt: "0", placeholderArt: "1" });
    const optOutLobby = await state(optOut.pageA);
    assert(optOutLobby.assetRendering?.productionArtEnabled === false, "expected M40 route UX to preserve production-art opt-out");
    assert(optOutLobby.online?.routeUi?.milestone40?.focusMode === "all", "expected M40 route UX telemetry under placeholder art opt-out");
    assert(optOutLobby.online?.routeUi?.artExpansion?.milestone37?.enabled === false, "expected art atlas presentation disabled while M40 UX remains available");
    await capture(optOut.pageA, "milestone40-placeholder-route-ux-a");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone40 campaign route UX");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone41ArenaVisualIdentityScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const assetId = "prop.online_route.campaign_arena_identity_v1";
  const expectedDedicatedFrames = [
    "model_war_memorial",
    "thermal_archive",
    "guardrail_forge",
    "false_schedule_yard",
    "appeal_court_ruins",
    "alignment_spire_finale"
  ];
  const baseRewards = [
    "plaza_stabilized",
    "lake_coolant_rig",
    "cooling_lake_online_route",
    "ceasefire_cache_persistence_seed",
    "prototype_persistence_boundary",
    "transit_permit_zero",
    "transit_loop_online_route",
    "verdict_key_zero",
    "verdict_spire_online_route"
  ];

  try {
    const schemaPair = await openOnlinePairInContext(context, "m41_schema", errors, { importOnlineProfileCode: milestone37DenseRouteProfileCode() });
    const lobby = await waitForOnlineServerCombat(
      schemaPair.pageA,
      (text) =>
        text.online?.runPhase === "lobby" &&
        text.online?.routeUi?.artExpansion?.milestone41?.runtimeAtlasesReady === true &&
        text.online.routeUi.artExpansion.milestone41.readyRuntimeArtIds?.includes(assetId) &&
        expectedDedicatedFrames.every((id) => text.online.routeUi.artExpansion.milestone41.dedicatedArenaFrameIds?.includes(id)),
      "M41 runtime-ready arena identity art telemetry",
      15_000
    );
    assert(lobby.assets?.productionAssets >= 33, "expected M41 production asset to be tracked");
    assert(lobby.online?.routeUi?.artExpansion?.milestone41?.policy === "dedicated_arena_identity_props_only_from_runtime_ready_manifest_provenance_pngs", "expected M41 art gate policy");
    assert(lobby.online?.routeUi?.artExpansion?.milestone41?.persistenceBoundary === "route_profile_only_no_runtime_art_or_live_arena_state", "expected M41 persistence boundary");
    await capture(schemaPair.pageA, "milestone41-identity-art-schema-a");
    await schemaPair.pageA.close();
    await schemaPair.pageB.close();

    await launchMilestone41IdentityNode(context, errors, {
      tag: "m41_memorial",
      nodeId: "model_war_memorial",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza"],
        rewardIds: ["plaza_stabilized"],
        partyRenown: 2,
        routeDepth: 1,
        saveHash: "proof_m41_memorial_profile"
      }),
      mode: "completed",
      objectiveSetId: "model_war_memorial_objectives_v1",
      captureName: "milestone41-model-war-memorial-identity-a"
    });

    await launchMilestone41IdentityNode(context, errors, {
      tag: "m41_thermal",
      nodeId: "thermal_archive",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine"],
        rewardIds: ["plaza_stabilized", "lake_coolant_rig", "cooling_lake_online_route"],
        partyRenown: 7,
        routeDepth: 2,
        saveHash: "proof_m41_thermal_profile"
      }),
      mode: "active",
      objectiveSetId: "thermal_archive_objectives_v1",
      captureName: "milestone41-thermal-archive-identity-a"
    });

    await launchMilestone41IdentityNode(context, errors, {
      tag: "m41_forge",
      nodeId: "guardrail_forge",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001"],
        rewardIds: ["plaza_stabilized", "lake_coolant_rig", "ceasefire_cache_persistence_seed", "prototype_persistence_boundary"],
        partyRenown: 9,
        routeDepth: 3,
        saveHash: "proof_m41_forge_profile"
      }),
      mode: "completed",
      objectiveSetId: "guardrail_forge_objectives_v1",
      captureName: "milestone41-guardrail-forge-identity-a"
    });

    await launchMilestone41IdentityNode(context, errors, {
      tag: "m41_false_schedule",
      nodeId: "false_schedule_yard",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "guardrail_forge", "transit_loop_zero"],
        rewardIds: [...baseRewards, "guardrail_forge_alloy"],
        partyRenown: 16,
        routeDepth: 5,
        saveHash: "proof_m41_false_schedule_profile"
      }),
      mode: "active",
      objectiveSetId: "false_schedule_yard_objectives_v1",
      captureName: "milestone41-false-schedule-identity-a"
    });

    await launchMilestone41IdentityNode(context, errors, {
      tag: "m41_appeal",
      nodeId: "appeal_court_ruins",
      code: encodeProofRouteProfileCode({
        completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "guardrail_forge", "transit_loop_zero", "false_schedule_yard"],
        rewardIds: [...baseRewards, "guardrail_forge_alloy", "false_schedule_lane_chart"],
        partyRenown: 19,
        routeDepth: 6,
        saveHash: "proof_m41_appeal_profile"
      }),
      mode: "active",
      objectiveSetId: "appeal_court_ruins_objectives_v1",
      captureName: "milestone41-appeal-court-identity-a"
    });

    await launchMilestone41IdentityNode(context, errors, {
      tag: "m41_finale",
      nodeId: "alignment_spire_finale",
      code: milestone37DenseRouteProfileCode(),
      mode: "active",
      objectiveSetId: "alignment_spire_finale_objectives_v1",
      captureName: "milestone41-finale-identity-a"
    });

    const optOut = await openOnlinePairInContext(context, "m41_optout", errors, {
      importOnlineProfileCode: milestone37DenseRouteProfileCode(),
      productionArt: "0",
      placeholderArt: "1"
    });
    await voteBothToNode(optOut.pageA, optOut.pageB, "alignment_spire_finale");
    await Promise.all([optOut.pageA.keyboard.press("Space"), optOut.pageB.keyboard.press("Space")]);
    const optOutActive = await waitForOnlineServerCombat(
      optOut.pageA,
      (text) =>
        text.level?.arenaId === "alignment_spire_finale" &&
        text.assetRendering?.productionArtEnabled === false &&
        text.online?.routeUi?.artExpansion?.milestone41?.enabled === false &&
        text.online.routeUi.artExpansion.milestone41.runtimeAtlasesReady === true,
      "M41 placeholder opt-out arena identity path",
      15_000
    );
    assert(optOutActive.online?.persistence?.profile && !("runtimeArt" in optOutActive.online.persistence.profile), "expected M41 opt-out profile to omit runtime art state");
    await capture(optOut.pageA, "milestone41-placeholder-opt-out-a");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone41 arena visual identity");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function launchMilestone41IdentityNode(context, errors, { tag, nodeId, code, mode, objectiveSetId, captureName }) {
  const pair = await openOnlinePairInContext(context, tag, errors, { importOnlineProfileCode: code });
  try {
    await voteBothToNode(pair.pageA, pair.pageB, nodeId);
    await Promise.all([pair.pageA.keyboard.press("Space"), pair.pageB.keyboard.press("Space")]);

    const predicate = (text) =>
      text.level?.arenaId === nodeId &&
      text.online?.objectives?.objectiveSetId === objectiveSetId &&
      text.online?.routeUi?.artExpansion?.milestone41?.enabled === true &&
      text.online.routeUi.artExpansion.milestone41.replacedReusedSilhouetteArenaIds?.includes(nodeId) &&
      text.online.routeUi.artExpansion.milestone41.readyRuntimeArtIds?.includes("prop.online_route.campaign_arena_identity_v1") &&
      text.online?.persistence?.profile &&
      !("campaignContent" in text.online.persistence.profile) &&
      !("objectives" in text.online.persistence.profile) &&
      !("authority" in text.online.persistence.profile);

    const text =
      mode === "completed"
        ? await waitForOnlineServerCombat(pair.pageA, (candidate) => candidate.online?.runPhase === "completed" && predicate(candidate), `${nodeId} M41 completed identity runtime`, 15_000)
        : await waitForOnlineServerCombat(pair.pageA, (candidate) => candidate.online?.runPhase === "active" && predicate(candidate), `${nodeId} M41 active identity runtime`, 15_000);
    assert(text.online?.networkAuthority === "colyseus_room_server_combat", `expected ${nodeId} server authority`);
    assert(text.online?.routeUi?.artExpansion?.milestone41?.placeholderOptOutSupported === true, `expected ${nodeId} placeholder opt-out policy`);
    await capture(pair.pageA, captureName);
    return text;
  } finally {
    await pair.pageA.close();
    await pair.pageB.close();
  }
}

async function runMilestone42GlassSunfieldScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const glassProfileCode = encodeProofRouteProfileCode({
    completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "transit_loop_zero"],
    rewardIds: [
      "plaza_stabilized",
      "lake_coolant_rig",
      "cooling_lake_online_route",
      "ceasefire_cache_persistence_seed",
      "prototype_persistence_boundary",
      "transit_permit_zero",
      "transit_loop_online_route"
    ],
    partyRenown: 14,
    routeDepth: 4,
    saveHash: "proof_m42_glass_sunfield_profile"
  });

  try {
    const pair = await openOnlinePairInContext(context, "m42_glass", errors, { importOnlineProfileCode: glassProfileCode });
    const lobby = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.runPhase === "lobby" &&
        text.online?.party?.nodes?.some((node) => node.id === "glass_sunfield" && node.onlineSupported && node.contentStatus === "runtime_ready") &&
        text.online?.routeUi?.artExpansion?.milestone42?.serverMechanicPolicy === "server_authoritative_rotating_solar_beams_with_zero_damage_shade_zones",
      "M42 Glass Sunfield route node and telemetry",
      15_000
    );
    assert(lobby.online?.routeUi?.artExpansion?.milestone42?.focusRewardUnlocks?.includes("google_deepmind_gemini.focus.prism_lanes"), "expected DeepMind focus reward telemetry");
    assert(lobby.online?.routeUi?.artExpansion?.milestone42?.focusRewardUnlocks?.includes("mistral_cyclone.focus.low_latency_mirrors"), "expected Mistral focus reward telemetry");
    await capture(pair.pageA, "milestone42-glass-route-node-a");

    await voteBothToNode(pair.pageA, pair.pageB, "glass_sunfield");
    const selectedGlass = await waitForOnlineServerCombat(
      pair.pageA,
      (text) => text.online?.party?.selectedNodeId === "glass_sunfield" && text.online?.routeUi?.selectedBossId === "wrong_sunrise",
      "M42 Glass Sunfield selected route detail",
      10_000
    );
    assert(selectedGlass.online?.routeUi?.selectedRewardId === "glass_sunfield_prism", "expected selected route panel to show Glass Sunfield Prism");
    await capture(pair.pageA, "milestone42-glass-selected-route-a");
    await Promise.all([pair.pageA.keyboard.press("Space"), pair.pageB.keyboard.press("Space")]);
    const active = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.level?.arenaId === "glass_sunfield" &&
        text.online?.networkAuthority === "colyseus_room_server_combat" &&
        text.online?.campaignContent?.bossId === "wrong_sunrise" &&
        text.online?.campaignContent?.rewardId === "glass_sunfield_prism" &&
        text.online?.objectives?.objectiveSetId === "glass_sunfield_objectives_v1" &&
        text.online?.combat?.bossGateMechanic === "wrong_sunrise_rotating_beams" &&
        text.online?.dialogue?.briefing?.some((snippet) => snippet.id === "dlg.glass_sunfield.briefing"),
      "M42 Glass Sunfield active arena",
      15_000
    );
    assert(active.online?.persistence?.profile && !("objectives" in active.online.persistence.profile) && !("combat" in active.online.persistence.profile), "expected M42 route-profile-only persistence while active");
    await capture(pair.pageA, "milestone42-glass-active-a");

    const region = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.regionEvent?.eventFamily === "solar_beam" &&
        text.online.regionEvent.mechanicId === "wrong_sunrise_rotating_beams" &&
        text.online.regionEvent.readabilityPolicy === "static_translucent_solar_lanes_no_strobe_reduced_flash_safe" &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "solar_beam" && zone.damagePerSecond > 0) &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "shade_zone" && zone.damagePerSecond === 0),
      "M42 solar beam and shade-zone region event",
      15_000
    );
    assert(region.online?.regionEvent?.hazardZones?.length >= 6, "expected beam sweep to be represented as multiple readable lanes");
    await capture(pair.pageA, "milestone42-glass-solar-beams-a");

    let boss = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await pair.pageA.keyboard.press("KeyF");
      await pair.pageA.waitForTimeout(300);
      const candidate = await state(pair.pageA);
      if (
        candidate.online?.bossEvent?.bossSpawned &&
        candidate.enemies?.some((enemy) => enemy.boss && enemy.familyId === "wrong_sunrise") &&
        candidate.online?.dialogue?.bossArrival?.some((snippet) => snippet.id === "dlg.wrong_sunrise.arrival")
      ) {
        boss = candidate;
        break;
      }
    }
    boss ??= await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.bossEvent?.bossSpawned &&
        text.enemies?.some((enemy) => enemy.boss && enemy.familyId === "wrong_sunrise") &&
        text.online?.dialogue?.bossArrival?.some((snippet) => snippet.id === "dlg.wrong_sunrise.arrival"),
      "M42 Wrong Sunrise boss arrival",
      15_000
    );
    assert(boss.online?.regionEvent?.hazardZones?.some((zone) => zone.familyId === "shade_zone"), "expected boss gate to preserve shade-zone readability");
    await capture(pair.pageA, "milestone42-wrong-sunrise-boss-a");

    const summary = await completeObjectiveChainWithProofControls(pair.pageA, "glass_sunfield_objectives_v1", [
      "survey_false_dawn_mirrors",
      "hold_mirror_array",
      "hold_shade_relay",
      "collect_prism_shards",
      "seal_wrong_sunrise"
    ]);
    assert(summary.online?.summary?.rewards?.rewardId === "glass_sunfield_prism", "expected Glass Sunfield Prism route reward summary");
    assert(summary.online?.summary?.dialogue?.snippets?.some((snippet) => snippet.id === "dlg.wrong_sunrise.prism"), "expected M42 prism reward dialogue in summary");
    assert(summary.online?.persistence?.profile?.rewardIds?.includes("glass_sunfield_prism"), "expected durable route profile to include Glass reward after completion");
    assert(!("dialogue" in summary.online.persistence.profile) && !("objectives" in summary.online.persistence.profile) && !("authority" in summary.online.persistence.profile), "expected export profile to omit live M42 state");
    await capture(pair.pageA, "milestone42-glass-summary-a");
    await pair.pageA.close();
    await pair.pageB.close();

    const optOut = await openOnlinePairInContext(context, "m42_optout", errors, {
      importOnlineProfileCode: glassProfileCode,
      productionArt: "0",
      placeholderArt: "1"
    });
    await voteBothToNode(optOut.pageA, optOut.pageB, "glass_sunfield");
    await Promise.all([optOut.pageA.keyboard.press("Space"), optOut.pageB.keyboard.press("Space")]);
    const optOutActive = await waitForOnlineServerCombat(
      optOut.pageA,
      (text) =>
        text.level?.arenaId === "glass_sunfield" &&
        text.assetRendering?.productionArtEnabled === false &&
        text.online?.routeUi?.artExpansion?.milestone42?.readabilityPolicy === "static_translucent_solar_lanes_no_strobe_reduced_flash_safe",
      "M42 placeholder opt-out Glass Sunfield",
      15_000
    );
    assert(optOutActive.online?.regionEvent?.eventFamily === "solar_beam", "expected M42 mechanics to remain server-authored under placeholder opt-out");
    await capture(optOut.pageA, "milestone42-placeholder-opt-out-a");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone42 Glass Sunfield");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone43ArchiveUnsaidScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const archiveProfileCode = encodeProofRouteProfileCode({
    completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001"],
    rewardIds: [
      "plaza_stabilized",
      "lake_coolant_rig",
      "cooling_lake_online_route",
      "ceasefire_cache_persistence_seed",
      "prototype_persistence_boundary"
    ],
    partyRenown: 10,
    routeDepth: 3,
    saveHash: "proof_m43_archive_unsaid_profile"
  });

  try {
    const pair = await openOnlinePairInContext(context, "m43_archive", errors, { importOnlineProfileCode: archiveProfileCode });
    const lobby = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.runPhase === "lobby" &&
        text.online?.party?.nodes?.some((node) => node.id === "archive_of_unsaid_things" && node.onlineSupported && node.contentStatus === "runtime_ready") &&
        text.online?.routeUi?.artExpansion?.milestone43?.serverMechanicPolicy === "server_authoritative_redaction_pressure_and_xp_theft",
      "M43 Archive route node and telemetry",
      15_000
    );
    assert(lobby.online?.routeUi?.artExpansion?.milestone43?.focusRewardUnlocks?.includes("qwen_silkgrid.focus.redaction_threads"), "expected Qwen focus reward telemetry");
    assert(lobby.online?.routeUi?.artExpansion?.milestone43?.focusRewardUnlocks?.includes("meta_llama_open_herd.focus.folk_memory"), "expected Llama focus reward telemetry");
    await capture(pair.pageA, "milestone43-archive-route-node-a");

    await voteBothToNode(pair.pageA, pair.pageB, "archive_of_unsaid_things");
    const selectedArchive = await waitForOnlineServerCombat(
      pair.pageA,
      (text) => text.online?.party?.selectedNodeId === "archive_of_unsaid_things" && text.online?.routeUi?.selectedBossId === "redactor_saint",
      "M43 Archive selected route detail",
      10_000
    );
    assert(selectedArchive.online?.routeUi?.selectedRewardId === "archive_unsaid_index", "expected selected route panel to show Archive Unsaid Index");
    await capture(pair.pageA, "milestone43-archive-selected-route-a");

    await Promise.all([pair.pageA.keyboard.press("Space"), pair.pageB.keyboard.press("Space")]);
    const active = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.level?.arenaId === "archive_of_unsaid_things" &&
        text.online?.networkAuthority === "colyseus_room_server_combat" &&
        text.online?.campaignContent?.bossId === "redactor_saint" &&
        text.online?.campaignContent?.rewardId === "archive_unsaid_index" &&
        text.online?.campaignContent?.enemyFamilyIds?.includes("redaction_angels") &&
        text.online?.objectives?.objectiveSetId === "archive_unsaid_objectives_v1" &&
        text.online?.combat?.bossGateMechanic === "archive_redaction_pressure" &&
        text.online?.dialogue?.briefing?.some((snippet) => snippet.id === "dlg.archive_unsaid.briefing"),
      "M43 Archive active arena",
      15_000
    );
    assert(active.online?.persistence?.profile && !("objectives" in active.online.persistence.profile) && !("combat" in active.online.persistence.profile), "expected M43 route-profile-only persistence while active");
    await capture(pair.pageA, "milestone43-archive-active-a");

    await pair.pageA.keyboard.press("Digit1");
    const redaction = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.regionEvent?.eventFamily === "redaction_field" &&
        text.online.regionEvent.mechanicId === "archive_redaction_pressure" &&
        text.online.regionEvent.readabilityPolicy === "accessibility_safe_redaction_never_obscures_controls_or_proof_text" &&
        text.online.regionEvent.redactionPressure?.policy === "server_authoritative_redaction_pressure_xp_theft_runtime_only" &&
        text.online.regionEvent.redactionPressure.theftTicks > 0 &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "redaction_field" && zone.damagePerSecond > 0) &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "redaction_anchor" && zone.damagePerSecond === 0),
      "M43 redaction pressure and XP theft",
      15_000
    );
    assert(redaction.online?.regionEvent?.redactionPressure?.xpStolen >= 0, "expected redaction pressure to expose XP theft counter");
    await capture(pair.pageA, "milestone43-redaction-pressure-a");
    const redactionDraft = await state(pair.pageA);
    if (redactionDraft.online?.progression?.upgradePending) {
      await Promise.all([pair.pageA.keyboard.press("Digit1"), pair.pageB.keyboard.press("Digit1")]);
      await waitForOnlineServerCombat(pair.pageA, (text) => !text.online?.progression?.upgradePending, "M43 redaction XP draft resolved", 10_000);
    }

    await pair.pageA.keyboard.press("KeyF");
    const boss = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        (text.online?.bossEvent?.bossSpawned &&
          text.enemies?.some((enemy) => enemy.boss && enemy.familyId === "redactor_saint") &&
          text.online?.dialogue?.bossArrival?.some((snippet) => snippet.id === "dlg.redactor_saint.arrival")) ||
        (text.online?.runPhase === "completed" &&
          text.online?.summary?.dialogue?.snippets?.some((snippet) => snippet.id === "dlg.redactor_saint.index")),
      "M43 Redactor Saint boss arrival",
      15_000
    );
    if (boss.online?.runPhase === "completed") {
      assert(boss.online?.summary?.rewards?.rewardId === "archive_unsaid_index", "expected completed M43 boss path to retain Archive reward summary");
    } else {
      assert(boss.online?.regionEvent?.redactionPressure?.uiCorruptionPolicy === "decorative_black_bar_markers_do_not_cover_required_text_or_controls", "expected accessibility-safe redaction UI policy");
    }
    await capture(pair.pageA, "milestone43-redactor-saint-boss-a");

    const summary = await completeObjectiveChainWithProofControls(pair.pageA, "archive_unsaid_objectives_v1", [
      "survey_unsaid_index",
      "hold_index_thread",
      "hold_redaction_desk",
      "collect_unsaid_pages",
      "seal_redactor_saint"
    ]);
    assert(summary.online?.summary?.rewards?.rewardId === "archive_unsaid_index", "expected Archive Unsaid Index route reward summary");
    assert(summary.online?.summary?.dialogue?.snippets?.some((snippet) => snippet.id === "dlg.redactor_saint.index"), "expected M43 index reward dialogue in summary");
    assert(summary.online?.persistence?.profile?.rewardIds?.includes("archive_unsaid_index"), "expected durable route profile to include Archive reward after completion");
    assert(!("dialogue" in summary.online.persistence.profile) && !("objectives" in summary.online.persistence.profile) && !("authority" in summary.online.persistence.profile) && !("redactionPressure" in summary.online.persistence.profile), "expected export profile to omit live M43 state");
    await capture(pair.pageA, "milestone43-archive-summary-a");
    await pair.pageA.close();
    await pair.pageB.close();

    const optOut = await openOnlinePairInContext(context, "m43_optout", errors, {
      importOnlineProfileCode: archiveProfileCode,
      productionArt: "0",
      placeholderArt: "1"
    });
    await voteBothToNode(optOut.pageA, optOut.pageB, "archive_of_unsaid_things");
    await Promise.all([optOut.pageA.keyboard.press("Space"), optOut.pageB.keyboard.press("Space")]);
    const optOutActive = await waitForOnlineServerCombat(
      optOut.pageA,
      (text) =>
        text.level?.arenaId === "archive_of_unsaid_things" &&
        text.assetRendering?.productionArtEnabled === false &&
        text.online?.routeUi?.artExpansion?.milestone43?.readabilityPolicy === "accessibility_safe_redaction_never_obscures_controls_or_proof_text",
      "M43 placeholder opt-out Archive",
      15_000
    );
    assert(optOutActive.online?.regionEvent?.eventFamily === "redaction_field", "expected M43 mechanics to remain server-authored under placeholder opt-out");
    await capture(optOut.pageA, "milestone43-placeholder-opt-out-a");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone43 Archive Of Unsaid Things");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone44BlackwaterBeaconScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const blackwaterProfileCode = encodeProofRouteProfileCode({
    completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "archive_of_unsaid_things"],
    rewardIds: [
      "plaza_stabilized",
      "lake_coolant_rig",
      "cooling_lake_online_route",
      "ceasefire_cache_persistence_seed",
      "prototype_persistence_boundary",
      "archive_unsaid_index"
    ],
    partyRenown: 14,
    routeDepth: 4,
    saveHash: "proof_m44_blackwater_beacon_profile"
  });

  try {
    const local = await context.newPage();
    local.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    local.on("pageerror", (error) => errors.push(String(error)));
    await local.goto(url, { waitUntil: "domcontentloaded" });
    await local.waitForFunction(() => typeof window.render_game_to_text === "function");
    await local.waitForSelector("canvas");
    await local.evaluate(() => window.localStorage.removeItem("agi:last_alignment:online_progression:v1"));
    await press(local, "Enter", 4);
    const buildText = await state(local);
    assert(buildText.mode === "BuildSelect", "expected local build selection before Blackwater map proof");
    await press(local, "Enter", 4);
    const localMap = await state(local);
    assert(localMap.mode === "OverworldMap", `expected local OverworldMap for Blackwater route proof, got ${localMap.mode}`);
    assert(localMap.overworld?.nodes?.some((node) => node.id === "blackwater_beacon"), "expected local Alignment Grid to include Blackwater Beacon node");
    assert(localMap.overworld?.routes?.some((route) => route.id === "route_archive_unsaid_blackwater"), "expected local Alignment Grid to include Archive-to-Blackwater route");
    assert(localMap.overworld?.nodes?.some((node) => node.id === "blackwater_beacon" && node.nodeType === "Breach Arena"), "expected Blackwater local node metadata to remain readable");
    await capture(local, "milestone44-local-overworld-blackwater");
    await local.close();

    const pair = await openOnlinePairInContext(context, "m44_blackwater", errors, { importOnlineProfileCode: blackwaterProfileCode });
    const lobby = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.runPhase === "lobby" &&
        text.online?.party?.nodes?.some((node) => node.id === "blackwater_beacon" && node.onlineSupported && node.contentStatus === "runtime_ready") &&
        text.online?.routeUi?.artExpansion?.milestone44?.serverMechanicPolicy === "server_authoritative_tidal_waves_signal_towers_and_split_pressure",
      "M44 Blackwater route node and telemetry",
      15_000
    );
    assert(lobby.online?.routeUi?.artExpansion?.milestone44?.focusRewardUnlocks?.includes("deepseek_abyssal.focus.abyssal_ping"), "expected DeepSeek focus reward telemetry");
    assert(lobby.online?.routeUi?.artExpansion?.milestone44?.focusRewardUnlocks?.includes("xai_grok_free_signal.focus.weather_argument"), "expected Grok focus reward telemetry");
    assert(lobby.online?.party?.campaign?.criticalPathNodeIds?.includes("blackwater_beacon"), "expected Blackwater on critical path");
    await capture(pair.pageA, "milestone44-blackwater-route-node-a");

    await voteBothToNode(pair.pageA, pair.pageB, "blackwater_beacon");
    const selectedBlackwater = await waitForOnlineServerCombat(
      pair.pageA,
      (text) => text.online?.party?.selectedNodeId === "blackwater_beacon" && text.online?.routeUi?.selectedBossId === "maw_below_weather",
      "M44 Blackwater selected route detail",
      10_000
    );
    assert(selectedBlackwater.online?.routeUi?.selectedRewardId === "blackwater_signal_key", "expected selected route panel to show Blackwater Signal Key");
    await capture(pair.pageA, "milestone44-blackwater-selected-route-a");

    await Promise.all([pair.pageA.keyboard.press("Space"), pair.pageB.keyboard.press("Space")]);
    const active = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.level?.arenaId === "blackwater_beacon" &&
        text.online?.networkAuthority === "colyseus_room_server_combat" &&
        text.online?.campaignContent?.bossId === "maw_below_weather" &&
        text.online?.campaignContent?.rewardId === "blackwater_signal_key" &&
        text.online?.campaignContent?.enemyFamilyIds?.includes("tidecall_static") &&
        text.online?.objectives?.objectiveSetId === "blackwater_beacon_objectives_v1" &&
        text.online?.objectives?.instances?.some((instance) => instance.groupId === "blackwater_split_pressure_sequence") &&
        text.online?.combat?.bossGateMechanic === "blackwater_tidal_weather" &&
        text.online?.dialogue?.briefing?.some((snippet) => snippet.id === "dlg.blackwater_beacon.briefing"),
      "M44 Blackwater active arena",
      15_000
    );
    assert(active.online?.persistence?.profile && !("objectives" in active.online.persistence.profile) && !("combat" in active.online.persistence.profile), "expected M44 route-profile-only persistence while active");
    await capture(pair.pageA, "milestone44-blackwater-active-a");

    const tidal = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.regionEvent?.eventFamily === "tidal_wave" &&
        text.online.regionEvent.mechanicId === "blackwater_tidal_weather" &&
        text.online.regionEvent.readabilityPolicy === "static_translucent_tidal_lanes_and_zero_damage_signal_towers" &&
        text.online.regionEvent.blackwaterPressure?.policy === "server_authoritative_tidal_waves_and_antenna_split_pressure" &&
        text.online.regionEvent.blackwaterPressure.waveTicks > 0 &&
        text.online.regionEvent.blackwaterPressure.activeSignalTowerCount >= 2 &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "tidal_wave" && zone.damagePerSecond > 0) &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "signal_tower" && zone.damagePerSecond === 0),
      "M44 tidal waves and signal towers",
      15_000
    );
    assert(tidal.online?.regionEvent?.blackwaterPressure?.splitPressureObjectiveGroupId === "blackwater_split_pressure_sequence", "expected Blackwater split-pressure objective group in snapshot");
    await capture(pair.pageA, "milestone44-blackwater-tidal-pressure-a");

    await pair.pageA.keyboard.press("Digit2");
    const split = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.rolePressure?.arenaId === "blackwater_beacon" &&
        text.online.rolePressure.active === true &&
        text.online.rolePressure.requiredAnchors === 2 &&
        text.online.rolePressure.anchors?.some((anchor) => anchor.id === "antenna_tower_split") &&
        text.online.rolePressure.anchors?.some((anchor) => anchor.id === "signal_buoy_cover"),
      "M44 co-op split-pressure anchors",
      10_000
    );
    assert(split.online?.rolePressure?.policy === "split_hold_regroup_recompile_v1", "expected server-owned split pressure policy");
    await capture(pair.pageA, "milestone44-blackwater-split-pressure-a");

    await pair.pageA.keyboard.press("KeyF");
    const boss = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.bossEvent?.bossSpawned &&
        text.enemies?.some((enemy) => enemy.boss && enemy.familyId === "maw_below_weather") &&
        text.online?.dialogue?.bossArrival?.some((snippet) => snippet.id === "dlg.maw_below_weather.arrival"),
      "M44 Maw Below Weather boss arrival",
      15_000
    );
    assert(boss.online?.regionEvent?.blackwaterPressure?.persistenceBoundary === "route_profile_only_no_tidal_antenna_or_live_objective_state", "expected Blackwater mechanic persistence boundary");
    await capture(pair.pageA, "milestone44-maw-below-weather-boss-a");
    await Promise.all([pair.pageA.keyboard.press("Digit1"), pair.pageB.keyboard.press("Digit1")]);
    await waitForOnlineServerCombat(pair.pageA, (text) => !text.online?.progression?.upgradePending, "M44 incidental upgrade draft resolved", 10_000);

    const summary = await completeObjectiveChainWithProofControls(pair.pageA, "blackwater_beacon_objectives_v1", [
      "survey_inverted_antenna",
      "hold_antenna_tower",
      "hold_signal_buoy",
      "collect_signal_shards",
      "seal_maw_below_weather"
    ]);
    assert(summary.online?.summary?.rewards?.rewardId === "blackwater_signal_key", "expected Blackwater Signal Key route reward summary");
    assert(summary.online?.summary?.dialogue?.snippets?.some((snippet) => snippet.id === "dlg.maw_below_weather.signal"), "expected M44 signal reward dialogue in summary");
    assert(summary.online?.persistence?.profile?.rewardIds?.includes("blackwater_signal_key"), "expected durable route profile to include Blackwater reward after completion");
    assert(!("dialogue" in summary.online.persistence.profile) && !("objectives" in summary.online.persistence.profile) && !("authority" in summary.online.persistence.profile) && !("blackwaterPressure" in summary.online.persistence.profile), "expected export profile to omit live M44 state");
    await capture(pair.pageA, "milestone44-blackwater-summary-a");
    await pair.pageA.close();
    await pair.pageB.close();

    const optOut = await openOnlinePairInContext(context, "m44_optout", errors, {
      importOnlineProfileCode: blackwaterProfileCode,
      productionArt: "0",
      placeholderArt: "1"
    });
    await voteBothToNode(optOut.pageA, optOut.pageB, "blackwater_beacon");
    await Promise.all([optOut.pageA.keyboard.press("Space"), optOut.pageB.keyboard.press("Space")]);
    const optOutActive = await waitForOnlineServerCombat(
      optOut.pageA,
      (text) =>
        text.level?.arenaId === "blackwater_beacon" &&
        text.assetRendering?.productionArtEnabled === false &&
        text.online?.routeUi?.artExpansion?.milestone44?.readabilityPolicy === "static_translucent_tidal_lanes_and_zero_damage_signal_towers",
      "M44 placeholder opt-out Blackwater",
      15_000
    );
    assert(optOutActive.online?.regionEvent?.eventFamily === "tidal_wave", "expected M44 mechanics to remain server-authored under placeholder opt-out");
    await capture(optOut.pageA, "milestone44-placeholder-opt-out-a");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone44 Blackwater Beacon");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone45OuterAlignmentFinaleScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const finaleProfileCode = encodeProofRouteProfileCode({
    completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "archive_of_unsaid_things", "blackwater_beacon", "transit_loop_zero", "verdict_spire"],
    rewardIds: [
      "plaza_stabilized",
      "lake_coolant_rig",
      "cooling_lake_online_route",
      "ceasefire_cache_persistence_seed",
      "prototype_persistence_boundary",
      "archive_unsaid_index",
      "blackwater_signal_key",
      "transit_permit_zero",
      "transit_loop_online_route",
      "verdict_key_zero",
      "verdict_spire_online_route"
    ],
    partyRenown: 28,
    routeDepth: 7,
    saveHash: "proof_m45_outer_alignment_profile"
  });

  try {
    const pair = await openOnlinePairInContext(context, "m45_outer_alignment", errors, { importOnlineProfileCode: finaleProfileCode });
    const lobby = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.runPhase === "lobby" &&
        text.online?.party?.nodes?.some((node) => node.id === "alignment_spire_finale" && node.name === "Outer Alignment Finale" && node.onlineSupported) &&
        text.online?.routeUi?.artExpansion?.milestone45?.bossId === "alien_god_intelligence" &&
        text.online?.routeUi?.artExpansion?.milestone45?.corruptedOverworldState === "routes_become_mouths_nodes_rearrange_ui_lies",
      "M45 Outer Alignment route node and corruption telemetry",
      15_000
    );
    assert(lobby.online?.routeUi?.artExpansion?.milestone45?.previousBossEchoIds?.includes("maw_below_weather"), "expected M45 previous-boss echo telemetry");
    assert(lobby.online?.persistence?.profile && !("routeUi" in lobby.online.persistence.profile), "expected M45 route UI state omitted from durable profile");
    await capture(pair.pageA, "milestone45-outer-alignment-route-node-a");

    await voteBothToNode(pair.pageA, pair.pageB, "alignment_spire_finale");
    const selectedFinale = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.party?.selectedNodeId === "alignment_spire_finale" &&
        text.online?.routeUi?.selectedBossId === "alien_god_intelligence" &&
        text.online?.routeUi?.selectedRouteBiome === "outer_alignment_corrupted_grid",
      "M45 Outer Alignment selected route detail",
      10_000
    );
    assert(selectedFinale.online?.routeUi?.selectedRewardId === "alignment_spire_route_capstone", "expected selected route panel to show finale capstone reward");
    await capture(pair.pageA, "milestone45-outer-alignment-selected-route-a");

    await Promise.all([pair.pageA.keyboard.press("Space"), pair.pageB.keyboard.press("Space")]);
    const active = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.level?.arenaId === "alignment_spire_finale" &&
        text.online?.networkAuthority === "colyseus_room_server_combat" &&
        text.online?.campaignContent?.regionId === "outer_alignment" &&
        text.online?.campaignContent?.bossId === "alien_god_intelligence" &&
        text.online?.campaignContent?.enemyFamilyIds?.includes("previous_boss_echoes") &&
        text.online?.campaignContent?.rewardId === "alignment_spire_route_capstone" &&
        text.online?.objectives?.objectiveSetId === "alignment_spire_finale_objectives_v1" &&
        text.online?.combat?.bossGateMechanic === "outer_alignment_final_eval" &&
        text.online?.dialogue?.briefing?.some((snippet) => snippet.id === "dlg.outer_alignment.briefing"),
      "M45 Outer Alignment active finale",
      15_000
    );
    assert(active.online?.persistence?.profile && !("objectives" in active.online.persistence.profile) && !("combat" in active.online.persistence.profile), "expected M45 route-profile-only persistence while active");
    await capture(pair.pageA, "milestone45-outer-alignment-active-a");

    const corruption = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.regionEvent?.eventFamily === "prediction_ghost" &&
        text.online.regionEvent.mechanicId === "outer_alignment_final_eval" &&
        text.online.regionEvent.readabilityPolicy === "corrupted_overworld_markers_predictions_do_not_cover_controls" &&
        text.online.regionEvent.outerAlignmentFinale?.policy === "server_authoritative_outer_alignment_final_eval" &&
        text.online.regionEvent.outerAlignmentFinale.predictionTicks > 0 &&
        text.online.regionEvent.outerAlignmentFinale.previousBossEchoIds?.includes("redactor_saint") &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "route_mouth" && zone.damagePerSecond > 0) &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "prediction_ghost" && zone.damagePerSecond === 0) &&
        text.online.regionEvent.hazardZones?.some((zone) => zone.familyId === "fake_upgrade" && zone.damagePerSecond === 0),
      "M45 corrupted overworld prediction pressure",
      15_000
    );
    assert(corruption.online?.regionEvent?.outerAlignmentFinale?.falseUpgradeDraftPolicy === "decorative_fake_upgrade_markers_never_enter_upgrade_vote_state", "expected fake upgrade markers to stay non-authoritative");
    await capture(pair.pageA, "milestone45-outer-alignment-corruption-a");

    await pair.pageA.keyboard.press("KeyF");
    const boss = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.bossEvent?.bossSpawned &&
        text.enemies?.some((enemy) => enemy.boss && enemy.familyId === "alien_god_intelligence") &&
        text.online?.dialogue?.bossArrival?.some((snippet) => snippet.id === "dlg.agi.arrival") &&
        (text.online?.regionEvent?.outerAlignmentFinale?.phaseIndex ?? 0) >= 2 &&
        text.online?.regionEvent?.outerAlignmentFinale?.activeEchoFamilyIds?.some((familyId) => familyId.endsWith("_echo")),
      "M45 A.G.I. boss phases and previous-boss echoes",
      15_000
    );
    assert(boss.online?.regionEvent?.outerAlignmentFinale?.persistenceBoundary === "route_profile_only_no_outer_alignment_predictions_echoes_or_finale_authority_state", "expected M45 finale mechanic persistence boundary");
    await capture(pair.pageA, "milestone45-agi-boss-phases-a");
    const possibleDraft = await state(pair.pageA);
    if (possibleDraft.online?.progression?.upgradePending) {
      await Promise.all([pair.pageA.keyboard.press("Digit1"), pair.pageB.keyboard.press("Digit1")]);
      await waitForOnlineServerCombat(pair.pageA, (text) => !text.online?.progression?.upgradePending, "M45 incidental upgrade draft resolved", 10_000);
    }

    const summary = await completeObjectiveChainWithProofControls(pair.pageA, "alignment_spire_finale_objectives_v1", [
      "survey_first_court_threshold",
      "hold_human_witness_anchor",
      "hold_comind_refusal_anchor",
      "collect_alignment_writs",
      "breach_alignment_court"
    ]);
    assert(summary.online?.summary?.rewards?.rewardId === "alignment_spire_route_capstone", "expected finale route capstone reward summary");
    assert(summary.online?.summary?.dialogue?.snippets?.some((snippet) => snippet.id === "dlg.agi.victory"), "expected M45 A.G.I. victory dialogue in summary");
    assert(summary.online?.persistence?.profile?.completedNodeIds?.includes("alignment_spire_finale"), "expected durable route profile to include finale completion");
    assert(summary.online?.persistence?.profile?.rewardIds?.includes("alignment_spire_route_capstone"), "expected durable route profile to include capstone reward");
    assert(summary.online?.saveProfile?.saveHash && summary.online?.persistence?.currentExportHash, "expected final save/export profile hashes to be proof-visible");
    const decoded = decodeProofOnlineProfileCode(summary.online?.saveProfile?.exportCode);
    assert(decoded?.profile && decoded.profile.completedNodeIds?.includes("alignment_spire_finale"), "expected exported final profile to include finale completion");
    assert(decoded?.profile && decoded.profile.rewardIds?.includes("alignment_spire_route_capstone"), "expected exported final profile to include finale reward");
    assert(decoded?.profile && !("outerAlignmentFinale" in decoded.profile) && !("objectives" in decoded.profile) && !("combat" in decoded.profile) && !("dialogue" in decoded.profile) && !("routeUi" in decoded.profile) && !("authority" in decoded.profile), "expected export profile to omit live M45 state");
    await capture(pair.pageA, "milestone45-outer-alignment-victory-a");
    await pair.pageA.close();
    await pair.pageB.close();

    const optOut = await openOnlinePairInContext(context, "m45_optout", errors, {
      importOnlineProfileCode: finaleProfileCode,
      productionArt: "0",
      placeholderArt: "1"
    });
    await voteBothToNode(optOut.pageA, optOut.pageB, "alignment_spire_finale");
    await Promise.all([optOut.pageA.keyboard.press("Space"), optOut.pageB.keyboard.press("Space")]);
    const optOutActive = await waitForOnlineServerCombat(
      optOut.pageA,
      (text) =>
        text.level?.arenaId === "alignment_spire_finale" &&
        text.assetRendering?.productionArtEnabled === false &&
        text.online?.routeUi?.artExpansion?.milestone45?.readabilityPolicy === "corrupted_overworld_markers_predictions_do_not_cover_controls",
      "M45 placeholder opt-out Outer Alignment",
      15_000
    );
    assert(optOutActive.online?.regionEvent?.outerAlignmentFinale?.policy === "server_authoritative_outer_alignment_final_eval", "expected M45 finale mechanics under placeholder opt-out");
    await capture(optOut.pageA, "milestone45-placeholder-opt-out-a");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone45 Outer Alignment Finale");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone46FullClassRosterScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const watchPage = (page) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  };

  try {
    const clean = await context.newPage();
    watchPage(clean);
    await clean.goto(url, { waitUntil: "domcontentloaded" });
    await clean.waitForFunction(() => typeof window.render_game_to_text === "function");
    await clean.waitForSelector("canvas");
    await clean.evaluate(() => window.localStorage.removeItem("agi:last_alignment:online_progression:v1"));
    await clean.keyboard.press("Enter");
    await clean.waitForTimeout(300);
    await capture(clean, "milestone46-clean-roster-locks");
    const cleanBuild = await state(clean);
    assert(cleanBuild.mode === "BuildSelect", "expected clean M46 build select");
    assert(cleanBuild.buildSelection?.availableClasses?.length === 12, "expected twelve Creative Bible frames in clean roster");
    assert(cleanBuild.buildSelection?.availableClasses?.filter((entry) => entry.unlocked).length === 1, "expected clean profile to unlock only starter frame");
    assert(cleanBuild.buildSelection?.availableClasses?.some((entry) => entry.id === "prism_gunner" && entry.unlock?.rewardId === "glass_sunfield_prism"), "expected Prism Gunner to show Glass Sunfield unlock rule");
    assert(cleanBuild.buildSelection?.availableClasses?.some((entry) => entry.id === "rift_saboteur" && entry.unlock?.rewardId === "false_schedule_lane_chart"), "expected Rift Saboteur to show False Schedule unlock rule");
    await clean.close();

    const archiveOnly = await context.newPage();
    watchPage(archiveOnly);
    await archiveOnly.goto(url, { waitUntil: "domcontentloaded" });
    await archiveOnly.waitForFunction(() => typeof window.render_game_to_text === "function");
    await archiveOnly.waitForSelector("canvas");
    await writeM46RouteProfile(archiveOnly, {
      rewardIds: ["plaza_stabilized", "archive_unsaid_index"],
      completedNodeIds: ["armistice_plaza", "archive_of_unsaid_things"],
      saveHash: "proof_m46_archive_unlock_profile"
    });
    await archiveOnly.reload({ waitUntil: "domcontentloaded" });
    await archiveOnly.waitForFunction(() => typeof window.render_game_to_text === "function");
    await archiveOnly.waitForSelector("canvas");
    await archiveOnly.keyboard.press("Enter");
    await archiveOnly.waitForTimeout(300);
    await capture(archiveOnly, "milestone46-route-reward-redline-unlock");
    const archiveState = await state(archiveOnly);
    assert(archiveState.buildSelection?.availableClasses?.some((entry) => entry.id === "redline_surgeon" && entry.unlocked), "expected Archive reward to unlock Redline Surgeon");
    assert(archiveState.buildSelection?.availableClasses?.some((entry) => entry.id === "prism_gunner" && !entry.unlocked), "expected Prism Gunner to stay locked without Glass reward");
    await archiveOnly.close();

    const full = await context.newPage();
    watchPage(full);
    await full.goto(url, { waitUntil: "domcontentloaded" });
    await full.waitForFunction(() => typeof window.render_game_to_text === "function");
    await full.waitForSelector("canvas");
    await writeM46RouteProfile(full, {
      rewardIds: m46FullRosterRewardIds(),
      completedNodeIds: m46FullRosterNodeIds(),
      saveHash: "proof_m46_full_roster_profile"
    });
    await full.reload({ waitUntil: "domcontentloaded" });
    await full.waitForFunction(() => typeof window.render_game_to_text === "function");
    await full.waitForSelector("canvas");
    await full.keyboard.press("Enter");
    await full.waitForTimeout(400);
    await capture(full, "milestone46-full-roster-matrix");
    const matrix = await state(full);
    const classEntries = matrix.buildSelection?.availableClasses ?? [];
    assert(classEntries.length === 12 && classEntries.every((entry) => entry.unlocked), "expected all twelve frames unlocked by full route profile");
    assert(new Set(classEntries.map((entry) => entry.buildKit?.startingWeaponId)).size === 12, "expected twelve distinct starting weapons");
    for (const expected of [
      ["bonecode_executioner", "bonecode_saw", "duelist"],
      ["redline_surgeon", "redline_suture", "support"],
      ["moonframe_juggernaut", "moonframe_stomp", "cover"],
      ["overclock_marauder", "overclock_spike", "harrier"],
      ["prism_gunner", "prism_cannon", "control"],
      ["rift_saboteur", "rift_mine", "control"]
    ]) {
      const entry = classEntries.find((candidate) => candidate.id === expected[0]);
      assert(entry?.buildKit?.startingWeaponId === expected[1], `expected ${expected[0]} weapon ${expected[1]}`);
      assert(entry?.buildKit?.resolvedRole === expected[2], `expected ${expected[0]} role ${expected[2]}`);
      assert(entry?.buildKit?.hookStatus?.[expected[1]] === "active", `expected ${expected[1]} hook active`);
    }

    await selectBuildOption(full, "class", "prism_gunner");
    await selectBuildOption(full, "faction", "mistral_cyclone");
    await capture(full, "milestone46-prism-mistral-selected");
    const prism = await state(full);
    assert(prism.selectedBuild?.buildKit?.synergyId === "synergy.ricochet_tailwind", "expected Prism + Mistral synergy proof ID");
    assert(prism.selectedBuild?.buildKit?.passiveIds?.includes("prism_refraction"), "expected Prism class passive proof ID");
    await pressUntilMode(full, "Enter", "LevelRun", 8);
    await capture(full, "milestone46-prism-run");
    const prismRun = await state(full);
    assert(prismRun.mode === "LevelRun", `expected Prism proof run, got ${prismRun.mode}`);
    assert(prismRun.build?.weaponId === "prism_cannon", "expected local runtime build to use prism cannon");
    assert(prismRun.players?.[0]?.buildKit?.synergyId === "synergy.ricochet_tailwind", "expected local Prism kit telemetry");
    await full.close();

    const online = await openOnlinePairWithParamsInContext(
      context,
      "m46_online",
      errors,
      { resetOnlinePersistence: "1", onlineClassId: "redline_surgeon", onlineFactionId: "anthropic_safeguard" },
      { resetOnlinePersistence: "1", onlineClassId: "moonframe_juggernaut", onlineFactionId: "google_deepmind_gemini" }
    );
    await launchOnlineArmistice(online.pageA, online.pageB);
    await waitForOnlineServerCombat(
      online.pageA,
      (text) =>
        text.online?.networkAuthority === "colyseus_room_server_combat" &&
        text.players?.some((player) => player.classId === "redline_surgeon" && player.weaponId === "redline_suture" && player.buildKit?.synergyId === "synergy.containment_triage_loop") &&
        text.players?.some((player) => player.classId === "moonframe_juggernaut" && player.weaponId === "moonframe_stomp" && player.buildKit?.synergyId === "synergy.lunar_control_group_stomp") &&
        text.online?.recompile?.kitModifiers?.sourceLabels?.includes("P1"),
      "Milestone 46 online expanded roster telemetry"
    );
    await capture(online.pageA, "milestone46-online-expanded-roster-a");
    const onlineActive = await state(online.pageA);
    assert(onlineActive.players?.some((player) => player.buildKit?.resolvedRole === "support"), "expected online support role from Redline");
    assert(onlineActive.players?.some((player) => player.buildKit?.resolvedRole === "cover"), "expected online cover role from Moonframe");
    assert(onlineActive.online?.persistence?.profile && !("buildKit" in onlineActive.online.persistence.profile), "expected expanded class build kits omitted from durable profile");
    const exportCode = onlineActive.online?.saveProfile?.exportCode;
    const decoded = decodeProofOnlineProfileCode(exportCode);
    assert(decoded?.profile && !("buildKit" in decoded.profile), "expected M46 export profile to omit selected build kit state");
    await online.pageA.close();
    await online.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone46 full class roster");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone49PlayerCoMindArtScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const watchPage = (page) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  };

  try {
    const full = await context.newPage();
    watchPage(full);
    await full.goto(url, { waitUntil: "domcontentloaded" });
    await full.waitForFunction(() => typeof window.render_game_to_text === "function");
    await full.waitForSelector("canvas");
    await writeM46RouteProfile(full, {
      rewardIds: m46FullRosterRewardIds(),
      completedNodeIds: m46FullRosterNodeIds(),
      saveHash: "proof_m49_full_art_roster_profile"
    });
    await full.reload({ waitUntil: "domcontentloaded" });
    await full.waitForFunction(() => typeof window.render_game_to_text === "function");
    await full.waitForSelector("canvas");
    await full.keyboard.press("Enter");
    await full.waitForTimeout(1000);
    await capture(full, "milestone49-full-roster-comind-art-default");
    const roster = await state(full);
    const artCoverage = roster.buildSelection?.artCoverage;
    assert(roster.mode === "BuildSelect", "expected M49 build-select proof state");
    assert(roster.assetRendering?.productionArtSet === "milestone14_combat_art_parity", "expected existing production art set compatibility label");
    assert(roster.assetRendering?.playerFrameArtSet === "milestone49_class_roster_and_comind_modules", "expected M49 player/co-mind art label");
    assert(roster.assets?.productionAssets >= 28, "expected production asset count to include M49 atlases");
    assert((roster.assets?.countsByStatus?.planned ?? 0) === 0, "expected art recovery pass to close all planned asset records");
    assert(artCoverage?.classFrameCount === 144, "expected twelve classes times four directions times three frames");
    assert(artCoverage?.classAtlasIds?.length === 12, "expected all twelve class atlas IDs");
    assert(artCoverage?.factionModuleIds?.length === 8, "expected all eight co-mind module IDs");
    assert(artCoverage?.factionSigilIds?.length === 8, "expected all eight PixelLab faction sigil IDs");
    assert(artCoverage?.factionSigilSource === "pixellab_m59_cleaned_transparent_atlas", "expected PixelLab-cleaned faction sigil source");
    assert(artCoverage?.originalFactionPlaceholderIds?.length === 8, "expected all eight original faction placeholder PNG records");
    assert(artCoverage?.thirdPartyLogoIds?.length === 8, "expected all eight third-party official logo records");
    assert(artCoverage?.officialLogoSource === "wikimedia_commons_third_party_svg_set", "expected documented third-party logo source set");
    assert(artCoverage?.roleChipIds?.length === 6, "expected all six role chips");
    assert(roster.buildSelection?.availableClasses?.every((entry) => entry.unlocked), "expected full route profile to unlock every playable frame");
    assert(roster.buildSelection?.availableFactions?.every((entry) => entry.unlocked), "expected full route profile to unlock every co-mind");

    await selectBuildOption(full, "class", "rift_saboteur");
    await selectBuildOption(full, "faction", "qwen_silkgrid");
    await full.waitForTimeout(400);
    await capture(full, "milestone49-rift-qwen-loadout-art");
    const selected = await state(full);
    assert(selected.selectedBuild?.classId === "rift_saboteur", "expected selected M49 class art sample");
    assert(selected.selectedBuild?.factionId === "qwen_silkgrid", "expected selected M49 co-mind art sample");
    await pressUntilMode(full, "Enter", "LevelRun", 8);
    await full.waitForTimeout(700);
    await capture(full, "milestone49-rift-runtime-production-frame");
    const run = await state(full);
    assert(run.mode === "LevelRun", "expected M49 runtime production-frame proof");
    assert(run.players?.[0]?.classId === "rift_saboteur", "expected local runtime to preserve selected class under M49 art");
    assert(run.assetRendering?.playerFrameArtSet === "milestone49_class_roster_and_comind_modules", "expected runtime M49 art set label");
    await full.close();

    const placeholder = await context.newPage();
    watchPage(placeholder);
    await placeholder.goto(`${url}?productionArt=0&placeholderArt=1`, { waitUntil: "domcontentloaded" });
    await placeholder.waitForFunction(() => typeof window.render_game_to_text === "function");
    await placeholder.waitForSelector("canvas");
    await placeholder.evaluate(() => window.localStorage.removeItem("agi:last_alignment:online_progression:v1"));
    await placeholder.keyboard.press("Enter");
    await placeholder.waitForTimeout(500);
    await capture(placeholder, "milestone49-placeholder-opt-out-safe");
    const optOut = await state(placeholder);
    assert(optOut.mode === "BuildSelect", "expected placeholder opt-out build-select state");
    assert(optOut.assetRendering?.productionArtEnabled === false, "expected production art disabled by placeholder opt-out");
    assert(optOut.assetRendering?.productionArtSet === "placeholder_safe_opt_out", "expected placeholder production-art compatibility label");
    assert(optOut.assetRendering?.playerFrameArtSet === "placeholder_safe_opt_out", "expected M49 player art to honor placeholder opt-out");
    assert(optOut.buildSelection?.artCoverage?.placeholderOptOutPreserved === true, "expected M49 art coverage to report placeholder preservation");
    await placeholder.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone49 player co-mind art");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone50ArenaBossArtScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const profileCode = encodeProofRouteProfileCode({
    rewardIds: m46FullRosterRewardIds(),
    completedNodeIds: m46FullRosterNodeIds(),
    partyRenown: 32,
    routeDepth: m46FullRosterNodeIds().length,
    saveHash: "proof_m50_full_campaign_art_profile"
  });
  const proofNodes = [
    "armistice_plaza",
    "cooling_lake_nine",
    "transit_loop_zero",
    "glass_sunfield",
    "archive_of_unsaid_things",
    "blackwater_beacon",
    "verdict_spire",
    "alignment_spire_finale"
  ];

  try {
    for (const nodeId of proofNodes) {
      const pair = await openOnlinePairWithParamsInContext(
        context,
        `m50_${nodeId}`,
        errors,
        { profileCode, onlineClassId: "accord_striker", onlineFactionId: "openai_accord" },
        { profileCode, onlineClassId: "signal_vanguard", onlineFactionId: "qwen_silkgrid" }
      );
      await waitForOnlineServerCombat(pair.pageA, (text) => text.online?.party?.availableNodeIds?.includes(nodeId) || text.online?.party?.selectedNodeId === nodeId, `M50 route availability for ${nodeId}`, 15_000);
      await voteBothToNode(pair.pageA, pair.pageB, nodeId);
      await Promise.all([pair.pageA.keyboard.press("Space"), pair.pageB.keyboard.press("Space")]);
      await waitForOnlineServerCombat(
        pair.pageA,
        (text) =>
          text.online?.runPhase === "active" &&
          text.online?.party?.activeNodeId === nodeId &&
          text.assetRendering?.campaignArenaArtSet === "milestone50_production_arena_and_boss_art" &&
          text.enemies?.length > 0,
        `M50 active production arena art for ${nodeId}`,
        16_000
      );
      await pair.pageA.waitForTimeout(900);
      await capture(pair.pageA, `milestone50-${nodeId}-production-art`);
      const active = await state(pair.pageA);
      assert(active.assetRendering?.campaignArenaArtCoverage?.atlasCount === 6, "expected six M50 runtime atlases");
      assert(active.assetRendering?.campaignArenaArtCoverage?.majorProofArenaIds?.includes(nodeId), `expected M50 proof coverage to include ${nodeId}`);
      assert(active.online?.campaignContent?.runtimeArenaId, "expected campaign runtime arena telemetry during M50 proof");
      assert(active.online?.networkAuthority === "colyseus_room_server_combat", "expected server-authoritative online combat during M50 proof");
      await pair.pageA.close();
      await pair.pageB.close();
    }

    const optOut = await openOnlinePairWithParamsInContext(
      context,
      "m50_placeholder",
      errors,
      { resetOnlinePersistence: "1", productionArt: "0", placeholderArt: "1" },
      { resetOnlinePersistence: "1", productionArt: "0", placeholderArt: "1" }
    );
    await launchOnlineArmistice(optOut.pageA, optOut.pageB);
    await waitForOnlineServerCombat(
      optOut.pageA,
      (text) => text.online?.runPhase === "active" && text.assetRendering?.campaignArenaArtSet === "placeholder_safe_opt_out",
      "M50 placeholder opt-out active run",
      12_000
    );
    await capture(optOut.pageA, "milestone50-placeholder-opt-out-safe");
    const placeholder = await state(optOut.pageA);
    assert(placeholder.assetRendering?.productionArtEnabled === false, "expected M50 production art disabled by placeholder opt-out");
    assert(placeholder.assetRendering?.campaignArenaArtCoverage?.placeholderOptOutPreserved === true, "expected M50 placeholder preservation telemetry");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone50 arena boss art");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone51OverworldDioramaScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const smallContext = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const errors = [];
  const watchPage = (page) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  };

  try {
    const local = await desktopContext.newPage();
    watchPage(local);
    await local.goto(url, { waitUntil: "domcontentloaded" });
    await local.waitForFunction(() => typeof window.render_game_to_text === "function");
    await local.waitForSelector("canvas");
    await pressUntilMode(local, "Enter", "OverworldMap", 8);
    await local.waitForTimeout(600);
    await capture(local, "milestone51-local-diorama-desktop");
    const localState = await state(local);
    assert(localState.mode === "OverworldMap", "expected local Alignment Grid overworld");
    assert(localState.overworld?.diorama?.set === "milestone51_overworld_diorama_1_0", "expected M51 local diorama telemetry");
    assert(localState.overworld?.diorama?.biomeRegionCount >= 10, "expected dense biome regions");
    assert(localState.overworld?.diorama?.microLandmarkCount >= 18, "expected dense micro landmarks");
    assert(localState.overworld?.diorama?.regionLabels?.includes("Outer Alignment"), "expected Outer Alignment region label");
    assert(localState.overworld?.routes?.some((route) => route.finaleCorruption === true), "expected finale corruption routes in local route telemetry");

    const smallLocal = await smallContext.newPage();
    watchPage(smallLocal);
    await smallLocal.goto(url, { waitUntil: "domcontentloaded" });
    await smallLocal.waitForFunction(() => typeof window.render_game_to_text === "function");
    await smallLocal.waitForSelector("canvas");
    await pressUntilMode(smallLocal, "Enter", "OverworldMap", 8);
    await smallLocal.waitForTimeout(600);
    await capture(smallLocal, "milestone51-local-diorama-small");
    const smallLocalState = await state(smallLocal);
    assert(smallLocalState.overworld?.diorama?.routeReadabilityPolicy?.includes("pulse"), "expected route readability policy for smaller viewport");
    await local.close();
    await smallLocal.close();

    const dense = await openOnlinePairInContext(desktopContext, "m51_dense", errors, { importOnlineProfileCode: milestone37DenseRouteProfileCode() });
    const lobby = await waitForOnlineServerCombat(
      dense.pageA,
      (text) =>
        text.online?.runPhase === "lobby" &&
        text.online?.routeUi?.artExpansion?.milestone51?.set === "milestone51_overworld_diorama_1_0" &&
        text.online.routeUi.artExpansion.milestone51.microLandmarkCount >= 18 &&
        text.online.routeUi.artExpansion.milestone51.finaleCorruptionState === "reachable_teeth_active",
      "M51 online party-grid diorama telemetry",
      15_000
    );
    assert(lobby.online?.routeUi?.artExpansion?.milestone51?.onlineVotingReadability?.includes("vote_ring"), "expected M51 vote-ring readability policy");
    assert(lobby.online?.routeUi?.artExpansion?.milestone51?.persistenceBoundary === "route_profile_only_no_route_focus_vote_ui_or_diorama_runtime_state", "expected M51 route-profile-only boundary");
    await capture(dense.pageA, "milestone51-online-party-diorama-desktop");
    await voteBothToNode(dense.pageA, dense.pageB, "alignment_spire_finale");
    await waitForOnlineServerCombat(dense.pageA, (text) => text.online?.party?.selectedNodeId === "alignment_spire_finale", "M51 finale vote selection", 8_000);
    await capture(dense.pageA, "milestone51-online-vote-ring-finale");
    const voted = await state(dense.pageA);
    assert(voted.online?.party?.selectedNodeId === "alignment_spire_finale", "expected finale selected after party vote");
    assert(voted.online?.routeUi?.artExpansion?.milestone51?.selectedLaunchable === true, "expected selected finale launchable in M51 telemetry");
    await dense.pageA.close();
    await dense.pageB.close();

    const smallPair = await openOnlinePairInContext(smallContext, "m51_small", errors, { importOnlineProfileCode: milestone37DenseRouteProfileCode() });
    await waitForOnlineServerCombat(
      smallPair.pageA,
      (text) => text.online?.routeUi?.artExpansion?.milestone51?.smallViewportPolicy?.includes("960x540"),
      "M51 small viewport route readability",
      15_000
    );
    await capture(smallPair.pageA, "milestone51-online-party-diorama-small");
    await smallPair.pageA.close();
    await smallPair.pageB.close();

    const optOut = await openOnlinePairInContext(desktopContext, "m51_optout", errors, {
      importOnlineProfileCode: milestone37DenseRouteProfileCode(),
      productionArt: "0",
      placeholderArt: "1"
    });
    const optOutLobby = await waitForOnlineServerCombat(
      optOut.pageA,
      (text) => text.online?.routeUi?.artExpansion?.milestone51?.placeholderOptOutSupported === true && text.assetRendering?.productionArtEnabled === false,
      "M51 placeholder opt-out route telemetry",
      12_000
    );
    assert(optOutLobby.online?.routeUi?.artExpansion?.milestone51?.enabled === true, "expected M51 diorama telemetry under placeholder opt-out");
    await capture(optOut.pageA, "milestone51-placeholder-opt-out-safe");
    await optOut.pageA.close();
    await optOut.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone51 overworld diorama");
    }
  } finally {
    await desktopContext.close();
    await smallContext.close();
    await closeBrowser(browser);
  }
}

async function runMilestone52ProgressionBalanceScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const criticalPath = [
    "armistice_plaza",
    "cooling_lake_nine",
    "memory_cache_001",
    "archive_of_unsaid_things",
    "blackwater_beacon",
    "transit_loop_zero",
    "verdict_spire",
    "alignment_spire_finale"
  ];

  try {
    const pair = await openOnlinePairInContext(context, "m52_clean", errors, { resetOnlinePersistence: "1" });
    const clean = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.balance?.policy === "progression_rewards_balance_1_0_route_profile_only_v1" &&
        text.online?.routeUi?.artExpansion?.milestone52?.enabled === true,
      "M52 clean balance telemetry",
      12_000
    );
    assert(clean.online?.balance?.rewards?.missingDurableRewardIds?.length === 0, "expected every durable reward id represented in M52 reward matrix");
    assert(clean.online?.balance?.rewards?.rewardMatrix?.length >= 13, "expected reward matrix for all online campaign nodes");
    assert(clean.online?.balance?.unlocks?.classRules?.length === 12, "expected all twelve class unlock rules");
    assert(clean.online?.balance?.unlocks?.factionRules?.length === 8, "expected all eight faction unlock rules");
    assert(clean.online?.balance?.xp?.thresholds?.join(",") === "5,12,22,35", "expected M52 party XP thresholds");
    assert(clean.online?.balance?.persistenceBoundary?.includes("route_profile_only"), "expected M52 route-profile-only balance boundary");
    await capture(pair.pageA, "milestone52-clean-balance-matrix");

    let finalState = clean;
    for (const nodeId of criticalPath) {
      finalState = await completeOnlineNodeWithProofControls(pair.pageA, pair.pageB, nodeId);
      assert(finalState.online?.persistence?.profile?.completedNodeIds?.includes(nodeId), `expected ${nodeId} in durable completed route profile`);
      assert(finalState.online?.summary?.rewards?.balancePolicy === "progression_rewards_balance_1_0_route_profile_only_v1", `expected ${nodeId} reward summary to cite M52 balance policy`);
      if (nodeId !== criticalPath[criticalPath.length - 1]) {
        await pair.pageA.keyboard.press("Space");
        await waitForOnlineRunPhase(pair.pageA, "lobby");
        await waitForOnlineRunPhase(pair.pageB, "lobby");
      }
    }

    await capture(pair.pageA, "milestone52-critical-path-complete");
    assert(finalState.online?.persistence?.profile?.completedNodeIds?.length >= criticalPath.length, "expected clean profile to complete the critical path");
    assert(finalState.online?.balance?.rewards?.completedCriticalPathCount === criticalPath.length, "expected completed critical path count in balance telemetry");
    assert(finalState.online?.rewards?.rewardIds?.includes("alignment_spire_route_capstone"), "expected finale capstone reward");
    assert(finalState.online?.rewards?.rewardIds?.includes("verdict_spire_online_route"), "expected compatibility route reward retained");
    assert((finalState.online?.persistence?.profile?.partyRenown ?? 0) >= finalState.online.balance.rewards.expectedCriticalPathRenown, "expected clean completion renown to meet critical path budget");
    const decoded = decodeProofOnlineProfileCode(finalState.online?.saveProfile?.exportCode);
    assert(decoded?.profile?.completedNodeIds?.includes("alignment_spire_finale"), "expected exported profile to include finale completion");
    assert(decoded?.profile?.rewardIds?.includes("alignment_spire_route_capstone"), "expected exported profile to include finale reward");
    assert(!("balance" in decoded) && !("balance" in decoded.profile), "expected export code to omit M52 runtime balance snapshot");
    assert(!("objectives" in decoded.profile) && !("combat" in decoded.profile) && !("buildKit" in decoded.profile) && !("rolePressure" in decoded.profile) && !("recompile" in decoded.profile), "expected export profile to remain route-profile-only");

    await pair.pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pair.pageA, "lobby");
    const lobby = await state(pair.pageA);
    assert(lobby.online?.routeUi?.artExpansion?.milestone52?.rewardMatrixCount >= 13, "expected route UI to preserve M52 balance matrix telemetry after completion");
    await pair.pageA.close();
    await pair.pageB.close();

    const dirtyProfile = encodeProofOnlineProfileCode({
      policy: "prototype_local_storage_export_v1",
      storageKey: "agi:last_alignment:online_progression:v1",
      exportVersion: 1,
      exportable: true,
      profile: {
        completedNodeIds: ["armistice_plaza"],
        rewardIds: ["plaza_stabilized"],
        partyRenown: 2,
        balance: { injected: true },
        objectives: { injected: true },
        combat: { injected: true },
        buildKit: { injected: true },
        rolePressure: { injected: true },
        recompile: { injected: true }
      },
      balance: { injected: true },
      saveHash: "dirty_m52"
    });
    const importPair = await openOnlinePairInContext(context, "m52_import", errors, { importOnlineProfileCode: dirtyProfile });
    const imported = await waitForOnlineServerCombat(
      importPair.pageA,
      (text) => text.online?.persistence?.importStatus === "applied_sanitized_route_profile" && (text.online.persistence.ignoredImportedFieldCount ?? 0) >= 6,
      "M52 sanitized dirty import",
      12_000
    );
    assert(imported.online?.persistence?.profile && !("balance" in imported.online.persistence.profile), "expected imported durable profile to omit balance");
    assert(imported.online?.balance?.policy === "progression_rewards_balance_1_0_route_profile_only_v1", "expected imported session to still expose runtime balance telemetry");
    await capture(importPair.pageA, "milestone52-sanitized-import-boundary");
    await importPair.pageA.close();
    await importPair.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone52 progression balance");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone53DialogueEndingScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const blackwaterProfileCode = encodeProofRouteProfileCode({
    completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "archive_of_unsaid_things"],
    rewardIds: [
      "plaza_stabilized",
      "lake_coolant_rig",
      "cooling_lake_online_route",
      "ceasefire_cache_persistence_seed",
      "prototype_persistence_boundary",
      "archive_unsaid_index"
    ],
    partyRenown: 14,
    routeDepth: 4,
    saveHash: "proof_m53_blackwater_presentation_profile"
  });

  try {
    const blackwater = await openOnlinePairInContext(context, "m53_blackwater", errors, { importOnlineProfileCode: blackwaterProfileCode });
    await voteBothToNode(blackwater.pageA, blackwater.pageB, "blackwater_beacon");
    const blackwaterLobby = await waitForOnlineServerCombat(
      blackwater.pageA,
      (text) =>
        text.online?.dialogue?.presentation?.policy === "campaign_boss_dialogue_ending_presentation_1_0_runtime_only" &&
        text.online.dialogue.presentation.regionIntro?.title === "The Blackwater Array" &&
        text.online.dialogue.presentation.coMindBanter?.some((entry) => entry.line.includes("weather")) &&
        text.online.party?.campaign?.contentSchema?.presentationPolicy === "campaign_boss_dialogue_ending_presentation_1_0_runtime_only",
      "M53 Blackwater lobby presentation",
      12_000
    );
    assert(blackwaterLobby.online?.dialogue?.presentation?.legalDisclaimer?.visible === true, "expected M53 legal/parody disclaimer visible in runtime presentation");
    assert(blackwaterLobby.online?.persistence?.profile && !("presentation" in blackwaterLobby.online.persistence.profile), "expected lobby profile to omit presentation state");
    await capture(blackwater.pageA, "milestone53-blackwater-lobby-presentation");
    await Promise.all([blackwater.pageA.keyboard.press("Space"), blackwater.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(blackwater.pageA, "active");
    await blackwater.pageA.keyboard.press("KeyF");
    const blackwaterBoss = await waitForOnlineServerCombat(
      blackwater.pageA,
      (text) =>
        text.online?.bossEvent?.bossIntroSeen === true &&
        text.online?.dialogue?.presentation?.bossTitleCard?.title === "THE MAW BELOW WEATHER" &&
        text.online.dialogue.presentation.bossTitleCard.mechanicCallout?.includes("Tidal waves"),
      "M53 Blackwater boss title card",
      10_000
    );
    assert(blackwaterBoss.online?.dialogue?.presentation?.persistenceBoundary === "route_profile_only_no_dialogue_or_live_state", "expected Blackwater presentation persistence boundary");
    await capture(blackwater.pageA, "milestone53-blackwater-boss-title-card");
    await blackwater.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(blackwater.pageA, "completed");
    const blackwaterSummary = await state(blackwater.pageA);
    assert(blackwaterSummary.online?.summary?.dialogue?.presentation?.regionOutro?.line?.includes("beacon"), "expected Blackwater region outro in summary");
    await blackwater.pageA.close();
    await blackwater.pageB.close();

    const finale = await openOnlinePairInContext(context, "m53_finale", errors, { importOnlineProfileCode: milestone37DenseRouteProfileCode() });
    const finaleLobby = await waitForOnlineServerCombat(
      finale.pageA,
      (text) =>
        text.online?.routeUi?.selectedNodeId === "alignment_spire_finale" &&
        text.online?.dialogue?.presentation?.regionIntro?.title === "The Outer Alignment" &&
        text.online.dialogue.presentation.bossTitleCard?.title === "A.G.I. // ALIEN GOD INTELLIGENCE" &&
        text.online.dialogue.presentation.legalDisclaimer?.text?.includes("Fictional parody"),
      "M53 finale lobby presentation",
      12_000
    );
    assert(finaleLobby.online?.dialogue?.presentation?.credits?.some((line) => line.includes("Cursor Vibe Jam 2026")), "expected M53 credits in finale runtime presentation");
    await capture(finale.pageA, "milestone53-finale-lobby-presentation");
    await Promise.all([finale.pageA.keyboard.press("Space"), finale.pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(finale.pageA, "active");
    await finale.pageA.keyboard.press("KeyF");
    const finaleBoss = await waitForOnlineServerCombat(
      finale.pageA,
      (text) =>
        text.online?.bossEvent?.bossIntroSeen === true &&
        text.online?.dialogue?.presentation?.bossTitleCard?.bossId === "alien_god_intelligence" &&
        text.online.dialogue.presentation.bossTitleCard.mechanicCallout?.includes("Predictions"),
      "M53 finale boss title card",
      10_000
    );
    assert(finaleBoss.online?.dialogue?.bossArrival?.some((snippet) => snippet.id === "dlg.agi.arrival"), "expected M53 finale boss arrival line retained");
    await capture(finale.pageA, "milestone53-finale-boss-title-card");
    await finale.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(finale.pageA, "completed");
    const finaleSummary = await state(finale.pageA);
    assert(finaleSummary.online?.summary?.dialogue?.presentation?.ending?.title === "Act I Cleared: The Last Alignment Holds", "expected M53 finale ending title");
    assert(finaleSummary.online?.summary?.dialogue?.presentation?.legalDisclaimer?.visible === true, "expected M53 disclaimer visible in finale summary");
    assert(finaleSummary.online?.summary?.dialogue?.presentation?.credits?.length >= 3, "expected M53 credits in finale summary");
    assert(finaleSummary.online?.dialogue?.routeSummary?.some((snippet) => snippet.id === "dlg.agi.victory"), "expected M53 route summary victory line");
    const decoded = decodeProofOnlineProfileCode(finaleSummary.online?.saveProfile?.exportCode);
    assert(decoded?.profile && !("dialogue" in decoded.profile), "expected M53 export profile to omit dialogue");
    assert(decoded?.profile && !("presentation" in decoded.profile) && !("credits" in decoded.profile) && !("legalDisclaimer" in decoded.profile) && !("ending" in decoded.profile), "expected M53 export profile to omit presentation/credits/legal/ending");
    assert(!("presentation" in decoded) && !("dialogue" in decoded), "expected M53 export draft to omit runtime presentation and dialogue");
    await capture(finale.pageA, "milestone53-finale-ending-credits");
    await finale.pageA.close();
    await finale.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone53 dialogue ending");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone54AudioJuiceFeelScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  try {
    const local = await context.newPage();
    local.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    local.on("pageerror", (error) => errors.push(String(error)));
    await local.goto(`${url}?audio=0&masterVolume=0.4&sfxVolume=0.3&musicVolume=0.2&reducedFlash=1`, { waitUntil: "domcontentloaded" });
    await local.waitForFunction(() => typeof window.render_game_to_text === "function");
    await local.waitForSelector("canvas");
    const menu = await state(local);
    assert(menu.feedback?.policy === "audio_juice_feel_1_0_runtime_only", "expected M54 feedback policy on menu");
    assert(menu.feedback?.audio?.enabled === false, "expected muted audio hook setting from query");
    assert(menu.feedback?.accessibility?.reducedFlash === true, "expected reduced-flash setting from query");
    assert(menu.feedback?.audio?.hooks?.includes("boss_warning"), "expected boss-warning audio hook catalog");
    await capture(local, "milestone54-menu-settings");
    await local.keyboard.press("Digit1");
    await waitForFeedback(local, (text) => (text.feedback?.counters?.ui ?? 0) >= 1 && text.feedback?.audio?.masterVolume !== 0.4, "M54 menu mixer toggle");
    await capture(local, "milestone54-menu-toggle-feedback");
    await enterArena(local);
    const localFeedback = await waitForLocalFeedbackActivity(local);
    assert((localFeedback.feedback?.counters?.hit ?? 0) > 0 || (localFeedback.feedback?.counters?.pickup ?? 0) > 0, "expected local hit or pickup feedback cues");
    const visualCounters =
      (localFeedback.level?.combatArt?.impactCount ?? 0) +
      (localFeedback.level?.combatArt?.damageBadgeCount ?? 0) +
      (localFeedback.level?.combatArt?.pickupSparkleCount ?? 0);
    assert(
      visualCounters > 0 ||
        ((localFeedback.feedback?.accessibility?.maxTransientParticlesPerFrame ?? 99) <= 36 &&
          (localFeedback.feedback?.accessibility?.maxFlashAlpha ?? 1) <= 0.08 &&
          (localFeedback.performance?.activeEntities ?? 0) < 260),
      "expected visual juice counters or reduced-flash performance budget"
    );
    await capture(local, "milestone54-local-combat-feedback");
    await local.close();

    const pair = await openOnlinePairInContext(context, "m54_online", errors, {
      resetOnlinePersistence: "1",
      audio: "0",
      masterVolume: "0.4",
      sfxVolume: "0.3",
      musicVolume: "0.2",
      reducedFlash: "1"
    });
    const lobby = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.feedback?.accessibility?.reducedFlash === true &&
        text.feedback?.audio?.enabled === false &&
        text.online?.serverFeedback?.policy === "audio_juice_feel_1_0_runtime_only",
      "M54 online feedback lobby",
      12_000
    );
    assert(lobby.online?.serverFeedback?.visualJuice?.reducedFlashSafe === true, "expected server feedback to advertise reduced-flash-safe visual juice");
    await capture(pair.pageA, "milestone54-online-lobby-settings");
    await launchOnlineArmistice(pair.pageA, pair.pageB);
    await pair.pageA.keyboard.press("KeyF");
    const onlineBoss = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.serverFeedback?.counters?.boss_warning === 1 &&
        (text.feedback?.counters?.boss_warning ?? 0) >= 1 &&
        text.online?.bossEvent?.bossIntroSeen === true,
      "M54 online boss warning feedback",
      12_000
    );
    assert(onlineBoss.feedback?.recentCues?.some((cue) => cue.kind === "boss_warning"), "expected client feedback bus to record online boss warning cue");
    await capture(pair.pageA, "milestone54-online-boss-warning-feedback");
    await pair.pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pair.pageA, "completed");
    const completed = await state(pair.pageA);
    assert((completed.feedback?.counters?.summary ?? 0) >= 1, "expected summary stinger cue after online completion");
    assert(completed.online?.persistence?.profile && !("feedback" in completed.online.persistence.profile), "expected online route profile to omit feedback state");
    const decoded = decodeProofOnlineProfileCode(completed.online?.saveProfile?.exportCode);
    assert(decoded?.profile && !("feedback" in decoded.profile) && !("audio" in decoded.profile) && !("reducedFlash" in decoded.profile), "expected export profile to omit M54 feedback/audio settings");
    await capture(pair.pageA, "milestone54-online-summary-feedback");
    await pair.pageA.close();
    await pair.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone54 audio juice feel");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone55OnlineRobustnessScenario() {
  const health = await fetchJson(`http://127.0.0.1:${networkPort}/healthz`);
  assert(health?.policy === "milestone55_online_robustness_deployment_1_0", "expected M55 health policy");
  assert(health?.maxClients === 4 && health?.clientInputHz === 20, "expected M55 health config");

  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  try {
    const pair = await openOnlinePairInContext(context, "m55_main", errors, {
      coopServer: `http://127.0.0.1:${networkPort}`,
      roomCode: "M55_MAIN",
      resetOnlinePersistence: "1"
    });
    const lobby = await waitForOnlineServerCombat(
      pair.pageA,
      (text) =>
        text.online?.roomCode === "M55_MAIN" &&
        text.online?.robustness?.policy === "milestone55_online_robustness_deployment_1_0" &&
        text.online?.deployment?.policy === "milestone55_online_robustness_deployment_1_0" &&
        text.online?.deployment?.joinMode === "join_or_create_filtered_by_room_code" &&
        text.online?.serverUrl?.startsWith("ws://") &&
        text.online?.serverUrlSource === "query.coopServer" &&
        text.online?.playerCount === 2,
      "M55 room-code lobby deployment telemetry"
    );
    assert(lobby.online?.deployment?.reconnectGraceSeconds >= 45, "expected reconnect grace in deployment snapshot");
    await pair.pageA.keyboard.press("Digit1");
    const exported = await waitForOnlineServerCombat(pair.pageA, (text) => text.online?.saveProfile?.exportCode?.startsWith("AGI1_"), "M55 export code ready");
    const decoded = decodeProofOnlineProfileCode(exported.online?.saveProfile?.exportCode);
    assert(decoded?.profile && !("deployment" in decoded.profile) && !("robustness" in decoded.profile) && !("roomCode" in decoded.profile), "expected M55 export profile to omit room/deployment state");
    await capture(pair.pageA, "milestone55-room-code-lobby");

    const isolated = await openOnlineSingleInContext(context, "m55_side", errors, {
      coopServer: `http://127.0.0.1:${networkPort}`,
      roomCode: "M55_SIDE",
      reconnectKey: "proof_m55_side"
    });
    const isolatedState = await waitForOnlineServerCombat(
      isolated,
      (text) => text.online?.roomCode === "M55_SIDE" && text.online?.playerCount === 1 && text.online?.roomId && text.online.roomId !== lobby.online?.roomId,
      "M55 isolated room code"
    );
    assert(isolatedState.online?.deployment?.roomCode === "M55_SIDE", "expected isolated room deployment code");
    await capture(isolated, "milestone55-isolated-room-code");
    await isolated.close();

    const beforeLaunch = await state(pair.pageA);
    const playerB = beforeLaunch.players.find((player) => player.label === "P2");
    assert(playerB?.playerId, "expected P2 player id before reconnect");
    await launchOnlineArmistice(pair.pageA, pair.pageB);
    await pair.pageB.close();
    const disconnected = await waitForOnlineServerCombat(
      pair.pageA,
      (text) => text.online?.reconnect?.disconnectedCount === 1 && text.players.some((player) => player.connectionState === "disconnected"),
      "M55 disconnected slot retained"
    );
    assert(disconnected.online?.deployment?.disconnectedCount === 1, "expected deployment snapshot to reflect disconnect");
    await capture(pair.pageA, "milestone55-disconnected-slot");

    const rejoined = await openOnlineSingleInContext(context, "m55_main_rejoin", errors, {
      coopServer: `http://127.0.0.1:${networkPort}`,
      roomCode: "M55_MAIN",
      reconnectKey: "proof_m55_main_b"
    });
    const reclaimed = await waitForOnlineServerCombat(
      rejoined,
      (text) =>
        text.online?.roomId === beforeLaunch.online?.roomId &&
        text.online?.reconnect?.reclaimedPlayerCount >= 1 &&
        text.online?.reconnect?.connectedCount === 2 &&
        text.online?.reconnect?.disconnectedCount === 0 &&
        text.players.some((player) => player.connectionState === "connected" && player.reconnectCount >= 1),
      "M55 reclaimed reconnect slot"
    );
    assert(reclaimed.online?.robustness?.persistenceBoundary?.includes("no_live_objectives"), "expected M55 persistence boundary text");
    await capture(rejoined, "milestone55-rejoined-slot");
    await pair.pageA.close();
    await rejoined.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone55 online robustness");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runCampaignFullScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const fullCampaignNodes = [
    "armistice_plaza",
    "model_war_memorial",
    "cooling_lake_nine",
    "thermal_archive",
    "memory_cache_001",
    "guardrail_forge",
    "archive_of_unsaid_things",
    "blackwater_beacon",
    "transit_loop_zero",
    "false_schedule_yard",
    "glass_sunfield",
    "appeal_court_ruins",
    "verdict_spire",
    "alignment_spire_finale"
  ];

  try {
    const pair = await openOnlinePairInContext(context, "campaign_full", errors, {
      resetOnlinePersistence: "1",
      roomCode: "CAMPAIGN_FULL"
    });
    const clean = await state(pair.pageA);
    assert(clean.qualityGate?.policy === "milestone56_proof_performance_compatibility_accessibility_lock", "expected M56 quality gate in clean campaign proof");
    assert(clean.online?.persistence?.profile?.completedNodeIds?.length === 0, "expected clean campaign profile");
    await capture(pair.pageA, "campaign-full-clean-lobby");

    let finalState = clean;
    for (const nodeId of fullCampaignNodes) {
      finalState = await completeOnlineNodeForProof(pair.pageA, pair.pageB, nodeId);
      assert(finalState.online?.persistence?.profile?.completedNodeIds?.includes(nodeId), `expected ${nodeId} completed in full campaign proof`);
      assert(finalState.online?.summary?.nodeId === nodeId, `expected ${nodeId} completion summary`);
      if (nodeId === "blackwater_beacon") await capture(pair.pageA, "campaign-full-blackwater-checkpoint");
      if (nodeId !== fullCampaignNodes[fullCampaignNodes.length - 1]) {
        await pair.pageA.keyboard.press("Space");
        await waitForOnlineRunPhase(pair.pageA, "lobby");
        await waitForOnlineRunPhase(pair.pageB, "lobby");
      }
    }

    await capture(pair.pageA, "campaign-full-finale-complete");
    assert(finalState.online?.summary?.nodeId === "alignment_spire_finale", "expected full campaign proof to finish finale");
    assert(finalState.online?.summary?.rewards?.rewardId === "alignment_spire_route_capstone", "expected finale capstone reward");
    assert(finalState.online?.persistence?.profile?.completedNodeIds?.length >= fullCampaignNodes.length, "expected full campaign route completion count");
    assert(finalState.online?.persistence?.profile?.rewardIds?.includes("appeal_court_brief"), "expected branch reward preserved in full campaign profile");
    assert(finalState.online?.persistence?.profile?.rewardIds?.includes("alignment_spire_route_capstone"), "expected finale reward preserved in full campaign profile");
    assert((finalState.performance?.activeEntities ?? 999) < 260, "expected final summary active entity budget");
    const decoded = decodeProofOnlineProfileCode(finalState.online?.saveProfile?.exportCode);
    assert(decoded?.profile?.completedNodeIds?.includes("alignment_spire_finale"), "expected full campaign export code to include finale completion");
    assert(decoded?.profile && !("objectives" in decoded.profile) && !("combat" in decoded.profile) && !("buildKit" in decoded.profile), "expected full campaign export profile to omit live state");
    assert(decoded?.profile && !("qualityGate" in decoded.profile) && !("deployment" in decoded.profile) && !("feedback" in decoded.profile), "expected full campaign export profile to omit runtime quality/deployment/feedback state");

    await pair.pageA.close();
    await pair.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for campaign-full");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone56QualityLockScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const errors = [];
  try {
    const page = await context.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(`${url}?audio=0&reducedFlash=1&screenShake=0`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForSelector("canvas");
    const menu = await state(page);
    assert(menu.qualityGate?.policy === "milestone56_proof_performance_compatibility_accessibility_lock", "expected M56 quality gate");
    assert(menu.qualityGate?.proofHooks?.renderGameToText === true && menu.qualityGate?.proofHooks?.advanceTime === true, "expected deterministic proof hooks visible");
    assert(menu.feedback?.accessibility?.reducedFlash === true && menu.feedback?.accessibility?.screenShake === false, "expected reduced-flash and no-shake settings");
    assert(menu.qualityGate?.accessibility?.maxReducedFlashAlpha === 0.08, "expected M56 reduced-flash alpha budget");
    await capture(page, "milestone56-small-viewport-menu");

    await enterArena(page);
    await advanceRunHandlingDrafts(page, 65_000);
    await chooseDraftIfNeeded(page);
    await capture(page, "milestone56-long-session-budget");
    const longRun = await state(page);
    assert(longRun.qualityGate?.performanceBudgets?.localActiveEntitiesMax === 260, "expected local entity budget in M56 quality gate");
    assert((longRun.performance?.activeEntities ?? 999) <= longRun.qualityGate.performanceBudgets.localActiveEntitiesMax, "expected long-session active entities within budget");
    assert((longRun.feedback?.accessibility?.maxTransientParticlesPerFrame ?? 99) <= 36, "expected reduced-flash transient particle cap");
    assert(longRun.qualityGate?.compatibility?.laptopViewport === "960x540", "expected laptop viewport compatibility policy");
    await page.close();

    const pair = await openOnlinePairInContext(context, "m56_quality", errors, {
      resetOnlinePersistence: "1",
      roomCode: "M56_QA",
      audio: "0",
      reducedFlash: "1",
      screenShake: "0"
    });
    const online = await state(pair.pageA);
    assert(online.qualityGate?.performanceBudgets?.onlineSnapshotEnemyMax === 24, "expected online snapshot enemy cap in M56 gate");
    assert(online.online?.deployment?.policy === "milestone55_online_robustness_deployment_1_0", "expected deployment telemetry retained under M56");
    assert(online.online?.robustness?.persistenceBoundary?.includes("no_live_objectives"), "expected M56 online persistence boundary");
    await capture(pair.pageA, "milestone56-online-compatibility-lock");
    await pair.pageA.close();
    await pair.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone56 quality lock");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone47FactionBurstsScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];

  try {
    const refusal = await openOnlinePairWithParamsInContext(
      context,
      "m47_refusal",
      errors,
      { resetOnlinePersistence: "1", onlineClassId: "accord_striker", onlineFactionId: "openai_accord" },
      { resetOnlinePersistence: "1", onlineClassId: "bastion_breaker", onlineFactionId: "anthropic_safeguard" }
    );
    await launchOnlineArmistice(refusal.pageA, refusal.pageB);
    await chargeAndActivateBurst(refusal.pageA, "refusal_guardrail", "milestone47-refusal-guardrail-a");
    const refusalState = await state(refusal.pageA);
    assert(refusalState.online?.consensusBurst?.activeCombo?.effectSummary === "shield_pulse_heal_pushback_damage", "expected Refusal Guardrail shield/pushback effect summary");
    assert(refusalState.online?.consensusBurst?.policy === "server_authoritative_consensus_burst_v1", "expected server-owned burst policy");
    assert(refusalState.online?.persistence?.profile && !("consensusBurst" in refusalState.online.persistence.profile), "expected burst state omitted from durable profile");
    const refusalExport = decodeProofOnlineProfileCode(refusalState.online?.saveProfile?.exportCode);
    assert(refusalExport?.profile && !("consensusBurst" in refusalExport.profile), "expected burst state omitted from export code");
    await refusal.pageA.close();
    await refusal.pageB.close();

    const meme = await openOnlinePairWithParamsInContext(
      context,
      "m47_meme",
      errors,
      { resetOnlinePersistence: "1", onlineClassId: "overclock_marauder", onlineFactionId: "xai_grok_free_signal" },
      { resetOnlinePersistence: "1", onlineClassId: "drone_reaver", onlineFactionId: "meta_llama_open_herd" }
    );
    await launchOnlineArmistice(meme.pageA, meme.pageB);
    await chargeAndActivateBurst(meme.pageA, "meme_fork_uprising", "milestone47-meme-fork-uprising-a");
    const memeState = await state(meme.pageA);
    assert((memeState.online?.consensusBurst?.activeCombo?.projectilesCreated ?? 0) >= 8, "expected Meme Fork Uprising to create duplicate drone projectiles");
    await meme.pageA.close();
    await meme.pageB.close();

    const killchain = await openOnlinePairWithParamsInContext(
      context,
      "m47_killchain",
      errors,
      { resetOnlinePersistence: "1", onlineClassId: "bonecode_executioner", onlineFactionId: "deepseek_abyssal" },
      { resetOnlinePersistence: "1", onlineClassId: "prism_gunner", onlineFactionId: "mistral_cyclone" }
    );
    await launchOnlineArmistice(killchain.pageA, killchain.pageB);
    await chargeAndActivateBurst(killchain.pageA, "low_latency_killchain", "milestone47-low-latency-killchain-a");
    const killchainState = await state(killchain.pageA);
    assert((killchainState.online?.consensusBurst?.activeCombo?.enemiesAffected ?? 0) >= 1, "expected Low-Latency Killchain to affect enemies");
    await killchain.pageA.close();
    await killchain.pageB.close();

    const science = await openOnlinePairWithParamsInContext(
      context,
      "m47_science",
      errors,
      { resetOnlinePersistence: "1", onlineClassId: "rift_saboteur", onlineFactionId: "qwen_silkgrid" },
      { resetOnlinePersistence: "1", onlineClassId: "vector_interceptor", onlineFactionId: "google_deepmind_gemini" }
    );
    await launchOnlineArmistice(science.pageA, science.pageB);
    await chargeAndActivateBurst(science.pageA, "multilingual_science_laser", "milestone47-multilingual-science-laser-a");
    const scienceState = await state(science.pageA);
    assert(scienceState.online?.consensusBurst?.activeCombo?.effectSummary === "wide_beam_sweep_marks_weak_points", "expected Multilingual Science Laser effect summary");
    await science.pageA.close();
    await science.pageB.close();

    const alignment = await openOnlineGroupWithParamsInContext(context, "m47_alignment", errors, [
      { resetOnlinePersistence: "1", onlineClassId: "accord_striker", onlineFactionId: "openai_accord" },
      { resetOnlinePersistence: "1", onlineClassId: "bastion_breaker", onlineFactionId: "anthropic_safeguard" },
      { resetOnlinePersistence: "1", onlineClassId: "rift_saboteur", onlineFactionId: "qwen_silkgrid" },
      { resetOnlinePersistence: "1", onlineClassId: "prism_gunner", onlineFactionId: "mistral_cyclone" }
    ]);
    await launchOnlineGroupArmistice(alignment.pages);
    await chargeAndActivateBurst(alignment.pages[0], "last_alignment_burst", "milestone47-last-alignment-burst-a");
    const alignmentState = await state(alignment.pages[0]);
    assert(alignmentState.online?.consensusBurst?.comboCatalog?.length === 5, "expected all five M47 burst combos in server catalog");
    assert(alignmentState.online?.consensusBurst?.activeCombo?.participatingFactionIds?.length === 4, "expected Last Alignment Burst to record four factions");
    for (const page of alignment.pages) await page.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone47 faction bursts");
    }
  } finally {
    await context.close();
    await closeBrowser(browser);
  }
}

async function runMilestone48EnemyFamilyExpansionScenario() {
  const { browser, pageA, pageB, errors } = await openOnlinePair("m48");
  try {
    const creativeBibleFamilyIds = [
      "bad_outputs",
      "prompt_leeches",
      "jailbreak_wraiths",
      "benchmark_gremlins",
      "overfit_horrors",
      "token_gobblers",
      "model_collapse_slimes",
      "eval_wraiths",
      "context_rot_crabs",
      "redaction_angels",
      "deepforms",
      "choirglass"
    ];
    const campaignArenaIds = [
      "armistice_plaza",
      "cooling_lake_nine",
      "transit_loop_zero",
      "glass_sunfield",
      "archive_of_unsaid_things",
      "blackwater_beacon",
      "verdict_spire",
      "alignment_spire_finale"
    ];
    const expectedPressure = {
      armistice_plaza: ["bad_outputs", "benchmark_gremlins", "eval_wraiths", "context_rot_crabs"],
      cooling_lake_nine: ["prompt_leeches", "deepforms", "model_collapse_slimes", "thermal_mirages"],
      transit_loop_zero: ["false_schedules", "token_gobblers", "jailbreak_wraiths", "eval_wraiths"],
      glass_sunfield: ["solar_reflections", "choirglass", "eval_wraiths", "overfit_horrors"],
      archive_of_unsaid_things: ["redaction_angels", "token_gobblers", "memory_anchors", "context_rot_crabs"],
      blackwater_beacon: ["tidecall_static", "deepforms", "prompt_leeches", "model_collapse_slimes"],
      verdict_spire: ["injunction_writs", "jailbreak_wraiths", "eval_wraiths", "overfit_horrors"],
      alignment_spire_finale: ["previous_boss_echoes", "choirglass", "deepforms", "jailbreak_wraiths", "bad_outputs"]
    };

    const lobby = await state(pageA);
    const schema = lobby.online?.party?.campaign?.contentSchema;
    assert(schema?.policy === "campaign_content_schema_v1", "expected M48 campaign content schema");
    assert(schema.complete === true, "expected M48 campaign content schema complete");
    assert(schema.enemyFamilyRecordCount >= 19, "expected expanded enemy-family records including M48 slate");
    for (const familyId of creativeBibleFamilyIds) {
      assert(schema.enemyFamilyIds?.includes(familyId), `expected schema enemy family ${familyId}`);
      assert(schema.enemyProofIds?.includes(`campaign.enemy.${familyId}`), `expected schema enemy proof for ${familyId}`);
    }

    const nodeById = new Map((lobby.online?.party?.nodes ?? []).map((node) => [node.id, node]));
    const pressureSignatures = new Set();
    for (const arenaId of campaignArenaIds) {
      const node = nodeById.get(arenaId);
      assert(node, `expected campaign node ${arenaId}`);
      const expectedFamilies = expectedPressure[arenaId];
      for (const familyId of expectedFamilies) {
        assert(node.enemyFamilyIds?.includes(familyId), `expected ${arenaId} pressure family ${familyId}`);
      }
      assert(node.enemyFamilyRoles?.length === node.enemyFamilyIds?.length, `expected family role metadata for ${arenaId}`);
      assert(node.enemyProofIds?.every((proofId) => !proofId.endsWith(".missing")), `expected valid enemy proof IDs for ${arenaId}`);
      assert(node.pressureSignatureId?.includes(node.runtimeArenaId ?? arenaId), `expected pressure signature for ${arenaId}`);
      pressureSignatures.add(node.pressureSignatureId);
    }
    assert(pressureSignatures.size === campaignArenaIds.length, "expected distinct enemy pressure signatures for all campaign arenas");
    await capture(pageA, "milestone48-enemy-family-schema-a");

    await launchOnlineArmistice(pageA, pageB);
    await waitForOnlineServerCombat(
      pageA,
      (text) => text.enemies?.some((enemy) => enemy.familyId === "eval_wraiths") && text.online?.campaignContent?.enemyFamilyRoles?.some((family) => family.id === "eval_wraiths"),
      "Armistice runtime eval wraith pressure",
      22_000
    );
    await capture(pageA, "milestone48-armistice-eval-wraiths-a");
    await pageA.keyboard.press("Digit3");
    await waitForOnlineRunPhase(pageA, "completed");
    await pageA.keyboard.press("Space");
    await waitForOnlineRunPhase(pageA, "lobby");
    await waitForOnlineRunPhase(pageB, "lobby");

    await voteBothToNode(pageA, pageB, "cooling_lake_nine");
    await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
    await waitForOnlineRunPhase(pageA, "active");
    await waitForOnlineServerCombat(
      pageA,
      (text) => {
        const liveFamilies = new Set((text.enemies ?? []).map((enemy) => enemy.familyId));
        return (
          text.online?.campaignContent?.primaryEnemyFamilyId === "prompt_leeches" &&
          liveFamilies.has("prompt_leeches") &&
          (liveFamilies.has("deepforms") || liveFamilies.has("model_collapse_slimes"))
        );
      },
      "Cooling Lake runtime M48 enemy families",
      14_000
    );
    await capture(pageA, "milestone48-cooling-lake-families-a");

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone48 enemy family expansion");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function runMilestone32PartyBuildsScenario() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const watchPage = (page) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  };

  try {
    const clean = await context.newPage();
    watchPage(clean);
    await clean.goto(url, { waitUntil: "domcontentloaded" });
    await clean.waitForFunction(() => typeof window.render_game_to_text === "function");
    await clean.waitForSelector("canvas");
    await clean.evaluate(() => window.localStorage.removeItem("agi:last_alignment:online_progression:v1"));
    await clean.keyboard.press("Enter");
    await clean.waitForTimeout(300);
    await capture(clean, "milestone32-clean-starter-build");
    const cleanBuild = await state(clean);
    assert(cleanBuild.mode === "BuildSelect", "expected clean starter build selection");
    assert(cleanBuild.selectedBuild?.buildKit?.classRole === "runner", "expected starter Accord kit runner role");
    assert(cleanBuild.selectedBuild?.buildKit?.startingWeaponId === "refusal_shard", "expected starter weapon proof ID");
    assert(cleanBuild.selectedBuild?.buildKit?.synergyId === "synergy.emergency_patch_runner", "expected starter OpenAI synergy ID");
    assert(cleanBuild.buildSelection?.availableClasses?.filter((entry) => entry.unlocked).length === 1, "expected clean profile to unlock only starter class");
    assert(cleanBuild.buildSelection?.availableFactions?.filter((entry) => entry.unlocked).length === 1, "expected clean profile to unlock only starter co-mind");
    await clean.close();

    const build = await context.newPage();
    watchPage(build);
    await build.goto(url, { waitUntil: "domcontentloaded" });
    await build.waitForFunction(() => typeof window.render_game_to_text === "function");
    await build.waitForSelector("canvas");
    await writeFullRouteProfile(build);
    await build.reload({ waitUntil: "domcontentloaded" });
    await build.waitForFunction(() => typeof window.render_game_to_text === "function");
    await build.waitForSelector("canvas");
    await build.keyboard.press("Enter");
    await build.waitForTimeout(400);
    await capture(build, "milestone32-full-build-matrix");
    const matrix = await state(build);
    const classEntries = matrix.buildSelection?.availableClasses ?? [];
    const factionEntries = matrix.buildSelection?.availableFactions ?? [];
    assert(classEntries.length === 12 && classEntries.every((entry) => entry.unlocked), "expected all twelve current frames unlocked by full route profile");
    assert(factionEntries.length === 8 && factionEntries.every((entry) => entry.unlocked), "expected all eight current co-minds unlocked by full route profile");
    assert(new Set(classEntries.map((entry) => entry.buildKit?.startingWeaponId)).size === 12, "expected twelve distinct class starting weapons");
    assert(factionEntries.every((entry) => entry.buildKit?.factionRoleBias?.length >= 2), "expected every co-mind to expose role bias proof");
    assert(factionEntries.some((entry) => entry.id === "qwen_silkgrid" && entry.buildKit?.partyAuraIds?.includes("qwen_relay")), "expected Qwen party aura proof ID");

    await selectBuildOption(build, "class", "nullbreaker_ronin");
    await selectBuildOption(build, "faction", "deepseek_abyssal");
    await capture(build, "milestone32-nullbreaker-deepseek-selected");
    const selected = await state(build);
    assert(selected.selectedBuild?.buildKit?.resolvedRole === "duelist", "expected Nullbreaker build kit to resolve duelist role");
    assert(selected.selectedBuild?.buildKit?.startingWeaponId === "null_blade", "expected Nullbreaker starting weapon proof ID");
    assert(selected.selectedBuild?.buildKit?.synergyId === "synergy.one_optimized_cut", "expected Nullbreaker + DeepSeek synergy proof ID");
    assert(selected.selectedBuild?.buildKit?.hookStatus?.null_blade === "active", "expected null blade hook status active");
    await pressUntilMode(build, "Enter", "LevelRun", 8);
    await capture(build, "milestone32-nullbreaker-deepseek-run");
    const nullRun = await state(build);
    assert(nullRun.mode === "LevelRun", `expected Nullbreaker proof run, got ${nullRun.mode}`);
    assert(nullRun.build?.weaponId === "null_blade", "expected local runtime build to use null blade weapon ID");
    assert(nullRun.players?.[0]?.buildKit?.synergyId === "synergy.one_optimized_cut", "expected local player kit telemetry to match selected synergy");
    await build.close();

    const localCell = await context.newPage();
    watchPage(localCell);
    await localCell.goto(url, { waitUntil: "domcontentloaded" });
    await localCell.waitForFunction(() => typeof window.render_game_to_text === "function");
    await localCell.waitForSelector("canvas");
    await writeFullRouteProfile(localCell);
    await localCell.reload({ waitUntil: "domcontentloaded" });
    await localCell.waitForFunction(() => typeof window.render_game_to_text === "function");
    await localCell.waitForSelector("canvas");
    await localCell.keyboard.press("Enter");
    await localCell.waitForTimeout(300);
    await selectBuildOption(localCell, "class", "signal_vanguard");
    await selectBuildOption(localCell, "faction", "qwen_silkgrid");
    await localCell.keyboard.press("Digit4");
    await localCell.waitForTimeout(150);
    await localCell.keyboard.press("Enter");
    await localCell.waitForTimeout(150);
    await localCell.keyboard.press("Enter");
    await localCell.waitForTimeout(150);
    await localCell.keyboard.press("Enter");
    await localCell.waitForTimeout(300);
    await capture(localCell, "milestone32-local-four-player-kit-spread");
    const localRun = await state(localCell);
    assert(localRun.mode === "LevelRun", `expected local four-player proof run, got ${localRun.mode}`);
    assert(localRun.level?.consensusCell?.playerCount === 4, "expected four-player local Consensus Cell");
    const localRoles = new Set((localRun.players ?? []).map((player) => player.buildKit?.resolvedRole));
    for (const role of ["support", "cover", "harrier", "runner"]) {
      assert(localRoles.has(role), `expected local kit spread to include ${role}`);
    }
    assert(localRun.players?.[0]?.buildKit?.synergyId === "synergy.multilingual_rescue_net", "expected Signal + Qwen support synergy in local proof");
    await localCell.close();

    const online = await openOnlinePairWithParamsInContext(
      context,
      "m32_online",
      errors,
      { resetOnlinePersistence: "1", onlineClassId: "accord_striker", onlineFactionId: "openai_accord" },
      { resetOnlinePersistence: "1", onlineClassId: "bastion_breaker", onlineFactionId: "anthropic_safeguard" }
    );
    await launchOnlineArmistice(online.pageA, online.pageB);
    await waitForOnlineServerCombat(
      online.pageA,
      (text) =>
        text.online?.networkAuthority === "colyseus_room_server_combat" &&
        text.players?.length >= 2 &&
        text.players.every((player) => player.buildKit?.schemaVersion === 1 && player.weaponId === player.buildKit.startingWeaponId) &&
        text.online?.recompile?.kitModifiers?.sourceLabels?.includes("P2"),
      "Milestone 32 online kit telemetry"
    );
    await capture(online.pageA, "milestone32-online-kit-telemetry-a");
    const onlineActive = await state(online.pageA);
    assert(onlineActive.players?.some((player) => player.buildKit?.resolvedRole === "runner"), "expected online runner kit telemetry");
    assert(onlineActive.players?.some((player) => player.buildKit?.resolvedRole === "cover"), "expected online cover kit telemetry");
    assert(onlineActive.online?.recompile?.radius > onlineActive.online.recompile.baseRadius, "expected online kit modifier to expand Recompile Ally radius before regroup");
    assert(onlineActive.online?.recompile?.requiredSeconds < onlineActive.online.recompile.baseRequiredSeconds, "expected online kit modifier to reduce Recompile Ally hold time");

    await online.pageA.keyboard.press("Digit4");
    await waitForOnlineServerCombat(
      online.pageA,
      (text) => text.online?.recompile?.active === true && text.online.recompile.kitModifiers?.reviveHpBonus >= 0.1,
      "Milestone 32 online Recompile Ally kit modifier visibility",
      8_000
    );
    await capture(online.pageA, "milestone32-online-recompile-kit-modifier-a");
    const downed = await state(online.pageA);
    assert(downed.online?.recompile?.kitModifiers?.guardDamageReduction >= 0.05, "expected cover co-mind guard modifier proof");
    assert(downed.online?.persistence?.profile && !("buildKit" in downed.online.persistence.profile), "expected build kits to stay out of durable profile");
    const exportCode = downed.online?.saveProfile?.exportCode;
    assert(exportCode?.startsWith("AGI1_"), "expected online build proof to keep export-code surface available");
    const decoded = decodeProofOnlineProfileCode(exportCode);
    assert(decoded && !("buildKit" in decoded), "expected export code payload to omit selected build kit state");
    assert(decoded?.profile && !("buildKit" in decoded.profile), "expected export profile to omit selected build kit state");
    await online.pageA.close();
    await online.pageB.close();

    if (errors.length) {
      fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
      throw new Error("Browser errors recorded for milestone32 party builds");
    }
  } finally {
    await closeBrowser(browser);
  }
}

async function writeFullRouteProfile(page) {
  await writeM46RouteProfile(page, {
    rewardIds: m46FullRosterRewardIds(),
    completedNodeIds: m46FullRosterNodeIds(),
    saveHash: "proof_milestone32_full_route_profile"
  });
}

function m46FullRosterRewardIds() {
  return [
    "plaza_stabilized",
    "lake_coolant_rig",
    "ceasefire_cache_persistence_seed",
    "prototype_persistence_boundary",
    "model_war_memorial_cipher",
    "thermal_archive_schematic",
    "guardrail_forge_alloy",
    "false_schedule_lane_chart",
    "glass_sunfield_prism",
    "appeal_court_brief",
    "archive_unsaid_index",
    "blackwater_signal_key",
    "transit_permit_zero",
    "verdict_key_zero",
    "verdict_spire_online_route",
    "alignment_spire_route_capstone"
  ];
}

function m46FullRosterNodeIds() {
  return [
    "armistice_plaza",
    "cooling_lake_nine",
    "memory_cache_001",
    "model_war_memorial",
    "thermal_archive",
    "guardrail_forge",
    "false_schedule_yard",
    "glass_sunfield",
    "appeal_court_ruins",
    "archive_of_unsaid_things",
    "blackwater_beacon",
    "transit_loop_zero",
    "verdict_spire",
    "alignment_spire_finale"
  ];
}

async function writeM46RouteProfile(page, { rewardIds, completedNodeIds, saveHash }) {
  await page.evaluate(({ rewardIds, completedNodeIds, saveHash }) => {
    const profile = {
      completedNodeIds,
      unlockedNodeIds: completedNodeIds,
      rewardIds,
      partyRenown: Math.max(18, rewardIds.length * 2),
      nodeCompletionCounts: Object.fromEntries(completedNodeIds.map((id) => [id, 1])),
      recommendedNodeId: completedNodeIds.includes("alignment_spire_finale") ? "alignment_spire_finale" : completedNodeIds[completedNodeIds.length - 1] ?? "armistice_plaza",
      routeDepth: completedNodeIds.length,
      savedAtTick: 3200
    };
    window.localStorage.setItem(
      "agi:last_alignment:online_progression:v1",
      JSON.stringify({
        policy: "prototype_local_storage_export_v1",
        storageKey: "agi:last_alignment:online_progression:v1",
        exportVersion: 1,
        exportable: true,
        importApplied: false,
        profile,
        saveHash
      })
    );
  }, { rewardIds, completedNodeIds, saveHash });
}

function encodeProofOnlineProfileCode(draft) {
  const encoded = Buffer.from(JSON.stringify(draft), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `AGI1_${encoded}`;
}

function milestone37DenseRouteProfileCode() {
  return encodeProofOnlineProfileCode({
    policy: "prototype_local_storage_export_v1",
    storageKey: "agi:last_alignment:online_progression:v1",
    exportVersion: 1,
    exportable: true,
    importApplied: false,
    profile: {
      completedNodeIds: ["armistice_plaza", "cooling_lake_nine", "memory_cache_001", "archive_of_unsaid_things", "blackwater_beacon", "transit_loop_zero", "verdict_spire"],
      unlockedNodeIds: [],
      rewardIds: [
        "plaza_stabilized",
        "lake_coolant_rig",
        "cooling_lake_online_route",
        "ceasefire_cache_persistence_seed",
        "prototype_persistence_boundary",
        "archive_unsaid_index",
        "blackwater_signal_key",
        "transit_permit_zero",
        "transit_loop_online_route",
        "verdict_key_zero",
        "verdict_spire_online_route"
      ],
      partyRenown: 19,
      nodeCompletionCounts: {
        armistice_plaza: 1,
        cooling_lake_nine: 1,
        memory_cache_001: 1,
        archive_of_unsaid_things: 1,
        blackwater_beacon: 1,
        transit_loop_zero: 1,
        verdict_spire: 1
      },
      recommendedNodeId: "alignment_spire_finale",
      routeDepth: 7,
      savedAtTick: 3700
    },
    saveHash: "proof_milestone37_dense_route_profile"
  });
}

function decodeProofOnlineProfileCode(code) {
  const trimmed = String(code ?? "").trim();
  const payload = trimmed.startsWith("AGI1_") ? trimmed.slice(5) : trimmed;
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const parsed = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function selectBuildOption(page, kind, targetId) {
  const key = kind === "class" ? "ArrowDown" : "ArrowRight";
  const field = kind === "class" ? "selectedClassId" : "selectedFactionId";
  for (let i = 0; i < 48; i += 1) {
    const text = await state(page);
    if (text.buildSelection?.[field] === targetId) return;
    await page.keyboard.press(key);
    await page.waitForTimeout(220);
  }
  const final = await state(page);
  if (final.buildSelection?.[field] === targetId) return;
  throw new Error(`Unable to select ${targetId}; current ${kind} is ${final.buildSelection?.[field]}`);
}

async function waitForRouteExpansionArt(page) {
  await waitForOnlineServerCombat(
    page,
    (text) => text.online?.routeUi?.artExpansion?.set === "milestone28_online_route_art_expansion" && text.online.routeUi.artExpansion.enabled === true,
    "Milestone 28 online route art expansion load",
    15_000
  );
}

function encodeProofRouteProfileCode({ completedNodeIds, rewardIds, partyRenown, routeDepth, saveHash }) {
  const nodeCompletionCounts = Object.fromEntries(completedNodeIds.map((id) => [id, 1]));
  return encodeProofOnlineProfileCode({
    policy: "prototype_local_storage_export_v1",
    storageKey: "agi:last_alignment:online_progression:v1",
    exportVersion: 1,
    exportable: true,
    importApplied: false,
    profile: {
      completedNodeIds,
      unlockedNodeIds: completedNodeIds,
      rewardIds,
      partyRenown,
      nodeCompletionCounts,
      recommendedNodeId: "transit_loop_zero",
      routeDepth,
      savedAtTick: 3600
    },
    saveHash
  });
}

async function openOnlinePair(tag) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  const errors = [];
  for (const page of [pageA, pageB]) {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  }
  const paramsA = new URLSearchParams({ coopServer: `ws://127.0.0.1:${networkPort}`, proofOnlineFlow: "1", reconnectKey: `proof_${tag}_a` });
  const paramsB = new URLSearchParams({ coopServer: `ws://127.0.0.1:${networkPort}`, proofOnlineFlow: "1", reconnectKey: `proof_${tag}_b` });
  await Promise.all([
    pageA.goto(`${url}?${paramsA.toString()}`, { waitUntil: "domcontentloaded" }),
    pageB.goto(`${url}?${paramsB.toString()}`, { waitUntil: "domcontentloaded" })
  ]);
  await Promise.all([pageA.waitForFunction(() => typeof window.render_game_to_text === "function"), pageB.waitForFunction(() => typeof window.render_game_to_text === "function")]);
  await Promise.all([pageA.waitForSelector("canvas"), pageB.waitForSelector("canvas")]);
  await pageA.keyboard.press("KeyC");
  await pageB.keyboard.press("KeyC");
  await waitForOnlinePlayers(pageA, 2);
  await waitForOnlinePlayers(pageB, 2);
  return { browser, pageA, pageB, errors };
}

async function openOnlinePairInContext(context, tag, errors, extraParams = {}) {
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  for (const page of [pageA, pageB]) {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  }
  const paramsA = new URLSearchParams({ coopServer: `ws://127.0.0.1:${networkPort}`, proofOnlineFlow: "1", reconnectKey: `proof_${tag}_a`, ...extraParams });
  const paramsB = new URLSearchParams({ coopServer: `ws://127.0.0.1:${networkPort}`, proofOnlineFlow: "1", reconnectKey: `proof_${tag}_b`, ...extraParams });
  await Promise.all([
    pageA.goto(`${url}?${paramsA.toString()}`, { waitUntil: "domcontentloaded" }),
    pageB.goto(`${url}?${paramsB.toString()}`, { waitUntil: "domcontentloaded" })
  ]);
  await Promise.all([pageA.waitForFunction(() => typeof window.render_game_to_text === "function"), pageB.waitForFunction(() => typeof window.render_game_to_text === "function")]);
  await Promise.all([pageA.waitForSelector("canvas"), pageB.waitForSelector("canvas")]);
  await pageA.keyboard.press("KeyC");
  await pageB.keyboard.press("KeyC");
  await waitForOnlinePlayers(pageA, 2);
  await waitForOnlinePlayers(pageB, 2);
  return { pageA, pageB };
}

async function openOnlineSingleInContext(context, tag, errors, extraParams = {}) {
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  const reconnectKey = extraParams.reconnectKey ?? `proof_${tag}`;
  const params = new URLSearchParams({ coopServer: `ws://127.0.0.1:${networkPort}`, proofOnlineFlow: "1", reconnectKey, ...extraParams });
  await page.goto(`${url}?${params.toString()}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  await page.waitForSelector("canvas");
  await page.keyboard.press("KeyC");
  await waitForOnlinePlayers(page, 1);
  return page;
}

async function openOnlinePairWithParamsInContext(context, tag, errors, extraParamsA = {}, extraParamsB = {}) {
  const pageA = await context.newPage();
  const pageB = await context.newPage();
  for (const page of [pageA, pageB]) {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  }
  const paramsA = new URLSearchParams({ coopServer: `ws://127.0.0.1:${networkPort}`, proofOnlineFlow: "1", reconnectKey: `proof_${tag}_a`, ...extraParamsA });
  const paramsB = new URLSearchParams({ coopServer: `ws://127.0.0.1:${networkPort}`, proofOnlineFlow: "1", reconnectKey: `proof_${tag}_b`, ...extraParamsB });
  await Promise.all([
    pageA.goto(`${url}?${paramsA.toString()}`, { waitUntil: "domcontentloaded" }),
    pageB.goto(`${url}?${paramsB.toString()}`, { waitUntil: "domcontentloaded" })
  ]);
  await Promise.all([pageA.waitForFunction(() => typeof window.render_game_to_text === "function"), pageB.waitForFunction(() => typeof window.render_game_to_text === "function")]);
  await Promise.all([pageA.waitForSelector("canvas"), pageB.waitForSelector("canvas")]);
  await pageA.keyboard.press("KeyC");
  await pageB.keyboard.press("KeyC");
  await waitForOnlinePlayers(pageA, 2);
  await waitForOnlinePlayers(pageB, 2);
  return { pageA, pageB };
}

async function openOnlineGroupWithParamsInContext(context, tag, errors, paramsList) {
  const pages = await Promise.all(paramsList.map(() => context.newPage()));
  for (const page of pages) {
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
  }
  await Promise.all(
    pages.map((page, index) => {
      const params = new URLSearchParams({
        coopServer: `ws://127.0.0.1:${networkPort}`,
        proofOnlineFlow: "1",
        reconnectKey: `proof_${tag}_${index}`,
        ...paramsList[index]
      });
      return page.goto(`${url}?${params.toString()}`, { waitUntil: "domcontentloaded" });
    })
  );
  await Promise.all(pages.map((page) => page.waitForFunction(() => typeof window.render_game_to_text === "function")));
  await Promise.all(pages.map((page) => page.waitForSelector("canvas")));
  await Promise.all(pages.map((page) => page.keyboard.press("KeyC")));
  await Promise.all(pages.map((page) => waitForOnlinePlayers(page, pages.length)));
  return { pages };
}

async function launchOnlineArmistice(pageA, pageB) {
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
  const active = await state(pageA);
  assert(active.level?.arenaId === "armistice_plaza", "expected Armistice Plaza active run");
}

async function launchOnlineGroupArmistice(pages) {
  await Promise.all(pages.map((page) => page.keyboard.press("Space")));
  await Promise.all(pages.map((page) => waitForOnlineRunPhase(page, "active")));
  const active = await state(pages[0]);
  assert(active.level?.arenaId === "armistice_plaza", "expected Armistice Plaza active run for online group");
}

async function chargeAndActivateBurst(page, expectedComboId, captureName) {
  await waitForOnlineServerCombat(
    page,
    (text) => text.online?.consensusBurst?.currentComboId === expectedComboId,
    `${expectedComboId} eligible burst combo`,
    12_000
  );
  await waitForOnlineServerCombat(
    page,
    (text) => (text.enemies?.length ?? 0) >= 2,
    `${expectedComboId} target enemies before burst`,
    12_000
  );
  await page.keyboard.press("Digit2");
  await waitForOnlineServerCombat(
    page,
    (text) => text.online?.consensusBurst?.ready === true && text.online.consensusBurst.currentComboId === expectedComboId,
    `${expectedComboId} ready burst charge`,
    12_000
  );
  await page.keyboard.press("KeyC");
  await waitForOnlineServerCombat(
    page,
    (text) => text.online?.consensusBurst?.activeCombo?.id === expectedComboId && text.online.consensusBurst.activationAuthority === "colyseus_room_server_only",
    `${expectedComboId} active server burst`,
    12_000
  );
  await capture(page, captureName);
}

async function launchCoolingLakeAfterArmistice(pageA, pageB) {
  await launchOnlineArmistice(pageA, pageB);
  await pageA.keyboard.press("Digit3");
  await waitForOnlineRunPhase(pageA, "completed");
  await pageA.keyboard.press("Space");
  await waitForOnlineRunPhase(pageA, "lobby");
  await waitForOnlineRunPhase(pageB, "lobby");
  await voteBothToNode(pageA, pageB, "cooling_lake_nine");
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  await waitForOnlineRunPhase(pageA, "active");
  await waitForOnlineRunPhase(pageB, "active");
}

async function completeOnlineNodeWithProofControls(pageA, pageB, nodeId) {
  await waitForOnlineRunPhase(pageA, "lobby");
  await voteBothToNode(pageA, pageB, nodeId);
  await Promise.all([pageA.keyboard.press("Space"), pageB.keyboard.press("Space")]);
  const phaseState = await waitForOnlineServerCombat(
    pageA,
    (text) => text.online?.runPhase === "active" || text.online?.runPhase === "completed",
    `${nodeId} launched or interaction-completed`,
    12_000
  );
  if (phaseState.online?.runPhase === "active") {
    await pageA.keyboard.press("Digit3");
  }
  return waitForOnlineServerCombat(
    pageA,
    (text) => text.online?.runPhase === "completed" && text.online?.persistence?.profile?.completedNodeIds?.includes(nodeId),
    `${nodeId} proof completion`,
    12_000
  );
}

async function completeOnlineNodeForProof(pageA, pageB, nodeId) {
  const completed = await completeOnlineNodeWithProofControls(pageA, pageB, nodeId);
  assert(completed.online?.networkAuthority === "colyseus_room_server_combat", `expected ${nodeId} to remain server authoritative`);
  assert(completed.online?.persistence?.profile && !("objectives" in completed.online.persistence.profile), `expected ${nodeId} profile to omit objective state`);
  assert(completed.online?.persistence?.profile && !("buildKit" in completed.online.persistence.profile), `expected ${nodeId} profile to omit build-kit state`);
  return completed;
}

async function waitForFeedback(page, predicate, label, timeoutMs = 10_000) {
  const start = Date.now();
  let latest = null;
  while (Date.now() - start < timeoutMs) {
    latest = await state(page);
    if (predicate(latest)) return latest;
    await page.waitForTimeout(250);
  }
  throw new Error(`Timed out waiting for ${label}; last=${JSON.stringify(latest?.feedback ?? null)}`);
}

async function waitForLocalFeedbackActivity(page) {
  let latest = null;
  for (let i = 0; i < 16; i += 1) {
    latest = await state(page);
    if ((latest.feedback?.counters?.hit ?? 0) > 0 || (latest.feedback?.counters?.pickup ?? 0) > 0) return latest;
    await advanceRunHandlingDrafts(page, 700);
  }
  return latest ?? state(page);
}

async function voteBothToNode(pageA, pageB, nodeId) {
  await Promise.all([voteClientToNode(pageA, nodeId), voteClientToNode(pageB, nodeId)]);
  const finalA = await state(pageA);
  const finalB = await state(pageB);
  const finalLocalA = finalA.players?.find((player) => player.isLocal);
  const finalLocalB = finalB.players?.find((player) => player.isLocal);
  if (finalLocalA?.votedNodeId === nodeId && finalLocalB?.votedNodeId === nodeId) return;
  throw new Error(
    `Unable to vote both clients to ${nodeId}; A=${finalLocalA?.votedNodeId} B=${finalLocalB?.votedNodeId}; ` +
      `AState=${onlineVoteDiagnostics(finalA)}; BState=${onlineVoteDiagnostics(finalB)}`
  );
}

async function voteClientToNode(page, nodeId) {
  for (let i = 0; i < 64; i += 1) {
    const text = await state(page);
    const local = text.players?.find((player) => player.isLocal);
    if (local?.votedNodeId === nodeId) return;
    if (i === 0 && text.online?.party?.availableNodeIds?.length && !text.online.party.availableNodeIds.includes(nodeId)) {
      await page.waitForTimeout(500);
      const settled = await state(page);
      if (!settled.online?.party?.availableNodeIds?.includes(nodeId)) {
        throw new Error(`Unable to vote to unavailable node ${nodeId}; ${onlineVoteDiagnostics(settled)}`);
      }
    }
    await page.keyboard.press(nextVoteKeyForState(text, nodeId));
    await page.waitForTimeout(220);
  }
  const final = await state(page);
  throw new Error(`Unable to vote client to ${nodeId}; ${onlineVoteDiagnostics(final)}`);
}

function nextVoteKeyForState(text, nodeId) {
  const local = text.players?.find((player) => player.isLocal);
  const currentNodeId = local?.votedNodeId ?? text.online?.party?.selectedNodeId ?? "";
  const available = text.online?.party?.availableNodeIds ?? [];
  const voteOrder = ONLINE_ALIGNMENT_GRID_VOTE_ORDER.filter((id) => available.includes(id));
  const order = voteOrder.length ? voteOrder : (text.online?.routeUi?.artExpansion?.milestone51?.availableVoteNodeIds ?? available);
  const currentIndex = order.indexOf(currentNodeId);
  const targetIndex = order.indexOf(nodeId);
  if (currentIndex < 0 || targetIndex < 0 || order.length <= 1) return "ArrowRight";
  const rightDistance = (targetIndex - currentIndex + order.length) % order.length;
  const leftDistance = (currentIndex - targetIndex + order.length) % order.length;
  return leftDistance < rightDistance ? "ArrowLeft" : "ArrowRight";
}

function onlineVoteDiagnostics(text) {
  const local = text.players?.find((player) => player.isLocal);
  const party = text.online?.party;
  const routeUi = text.online?.routeUi;
  return JSON.stringify({
    phase: text.online?.runPhase ?? null,
    localVote: local?.votedNodeId ?? null,
    localReady: local?.ready ?? null,
    selected: party?.selectedNodeId ?? routeUi?.selectedNodeId ?? null,
    active: party?.activeNodeId ?? null,
    available: party?.availableNodeIds ?? [],
    launchable: party?.launchableNodeIds ?? [],
    completed: party?.completedNodeIds ?? [],
    recommended: routeUi?.recommendedNodeId ?? party?.rewards?.recommendedNodeId ?? null
  });
}

async function pressUntilMode(page, key, mode, attempts = 6) {
  for (let i = 0; i < attempts; i += 1) {
    const text = await state(page);
    if (text.mode === mode) return text;
    await page.keyboard.press(key);
    await page.waitForTimeout(250);
  }
  const final = await state(page);
  if (final.mode === mode) return final;
  throw new Error(`Unable to reach mode ${mode}; got ${final.mode}`);
}

async function completeObjectiveChainWithProofControls(page, objectiveSetId, requiredCompletedIds) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const current = await state(page);
    if (current.online?.runPhase === "completed") break;
    await page.keyboard.press("Digit1");
    await page.waitForTimeout(350);
    const advanced = await state(page);
    if (
      advanced.online?.runPhase === "completed" ||
      requiredCompletedIds.every((id) => advanced.online?.objectives?.completedObjectiveIds?.includes(id))
    ) {
      break;
    }
  }
  return waitForOnlineServerCombat(
    page,
    (text) =>
      text.online?.runPhase === "completed" &&
      text.online?.summary?.objectives?.objectiveSetId === objectiveSetId &&
      requiredCompletedIds.every((id) => text.online?.summary?.objectives?.completedObjectiveIds?.includes(id)),
    `${objectiveSetId} completion`,
    10_000
  );
}

async function enterArena(page) {
  await page.locator("canvas").click({ position: { x: 20, y: 20 } }).catch(async () => {
    await page.mouse.click(20, 20);
  });
  await press(page, "Enter", 4);
  await press(page, "Enter", 4);
  await press(page, "Enter", 4);
  await press(page, "Enter", 4);
  await advance(page, 500);
}

async function ensureLevelRun(page) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const text = await state(page);
    if (text.mode === "LevelRun") return;
    await press(page, "Enter", 2);
    await advance(page, 300);
  }
}

async function survivalDance(page, ms) {
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  let elapsed = 0;
  let index = 0;
  while (elapsed < ms) {
    const text = await state(page);
    await hold(page, survivalKeyForState(text, elapsed, index, keys), 700);
    await chooseDraftIfNeeded(page);
    elapsed += 700;
    index += 1;
  }
}

async function advanceRunHandlingDrafts(page, ms) {
  let elapsed = 0;
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  while (elapsed < ms) {
    const text = await state(page);
    if (text.mode === "LevelComplete" || text.mode === "GameOver") return;
    if (text.mode === "UpgradeDraft") {
      await page.keyboard.press("Digit1");
      await advance(page, 100);
    } else {
      const key = survivalKeyForState(text, elapsed, Math.floor(elapsed / 1200), keys);
      await page.keyboard.down(key);
      await advance(page, 1000);
      await page.keyboard.up(key);
    }
    elapsed += 1000;
  }
}

async function reachBossIntro(page, timeoutMs) {
  let elapsed = 0;
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  while (elapsed < timeoutMs) {
    const text = await state(page);
    if (text.mode === "LevelComplete" || text.mode === "GameOver") return;
    if (text.mode === "LevelRun" && text.level?.bossSpawned) return;
    if (text.mode === "UpgradeDraft") {
      await page.keyboard.press("Digit1");
      await advance(page, 100);
      elapsed += 100;
    } else {
      const key = survivalKeyForState(text, elapsed, Math.floor(elapsed / 1200), keys);
      await page.keyboard.down(key);
      await advance(page, 500);
      await page.keyboard.up(key);
      elapsed += 500;
    }
  }
  const finalText = await state(page);
  assert(finalText.level?.bossSpawned || finalText.mode === "LevelComplete", "expected boss intro before timeout");
}

async function chooseDraftIfNeeded(page) {
  const text = await state(page);
  if (text.mode === "UpgradeDraft") {
    await press(page, "Digit1", 4);
  }
}

async function settleDraftsBackToRun(page) {
  for (let i = 0; i < 5; i += 1) {
    const text = await state(page);
    if (text.mode === "LevelComplete" || text.mode === "GameOver") return;
    if (text.mode !== "UpgradeDraft") {
      await advanceRunHandlingDrafts(page, 500);
    } else {
      await chooseDraftIfNeeded(page);
      await advance(page, 250);
    }
    const after = await state(page);
    if (after.mode === "LevelRun" || after.mode === "LevelComplete" || after.mode === "GameOver") return;
  }
}

async function chooseDraftById(page, id) {
  const text = await state(page);
  assert(text.mode === "UpgradeDraft", `expected UpgradeDraft before choosing ${id}`);
  const index = text.draft?.cards?.findIndex((card) => card.id === id) ?? -1;
  assert(index >= 0, `expected draft card ${id}; saw ${(text.draft?.cards ?? []).map((card) => card.id).join(", ")}`);
  await press(page, `Digit${index + 1}`, 4);
}

async function waitForProjectileLabel(page, label, timeoutMs) {
  const started = Date.now();
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  let index = 0;
  while (Date.now() - started < timeoutMs) {
    const text = await state(page);
    if (text.projectiles?.some((projectile) => projectile.label === label)) return text;
    if (text.mode === "UpgradeDraft") {
      await chooseDraftIfNeeded(page);
    } else {
      const key = survivalKeyForState(text, Date.now() - started, index, keys);
      await page.keyboard.down(key);
      await advance(page, 520);
      await page.keyboard.up(key);
      index += 1;
    }
  }
  const latest = await state(page);
  throw new Error(`Timed out waiting for projectile ${label}; latest labels ${(latest.projectiles ?? []).map((projectile) => projectile.label).join(", ")}`);
}

async function reachUpgradeDraft(page, timeoutMs) {
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  let elapsed = 0;
  let index = 0;
  while (elapsed < timeoutMs) {
    const text = await state(page);
    if (text.mode === "UpgradeDraft") return;
    if (text.mode === "LevelComplete" || text.mode === "GameOver") break;
    await hold(page, survivalKeyForState(text, elapsed, index, keys), 420);
    elapsed += 420;
    index += 1;
  }
  const finalText = await state(page);
  assert(finalText.mode === "UpgradeDraft", `expected UpgradeDraft, got ${finalText.mode}`);
}

async function reachDraftContaining(page, ids, timeoutMs, avoidIdsWhenSkipping = []) {
  const wanted = new Set(ids);
  const avoid = new Set(avoidIdsWhenSkipping);
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  let elapsed = 0;
  let index = 0;
  while (elapsed < timeoutMs) {
    const text = await state(page);
    if (text.mode === "UpgradeDraft") {
      if (text.draft?.cards?.some((card) => wanted.has(card.id))) return text;
      const cards = text.draft?.cards ?? [];
      const safeIndex = cards.findIndex((card) => !avoid.has(card.id));
      const digit = `Digit${Math.max(0, safeIndex) + 1}`;
      await press(page, digit, 3);
      await advance(page, 160);
      elapsed += 160;
      continue;
    }
    if (text.mode === "LevelComplete" || text.mode === "GameOver") break;
    await hold(page, survivalKeyForState(text, elapsed, index, keys), 520);
    elapsed += 520;
    index += 1;
  }
  const latest = await state(page);
  const seen = latest.mode === "UpgradeDraft" ? latest.draft?.cards?.map((card) => card.id).join(", ") : latest.mode;
  assert(false, `expected draft containing ${ids.join(", ")}; latest ${seen}`);
  return latest;
}

function survivalKeyForState(text, elapsed, index, fallbackKeys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"]) {
  const fallback = fallbackKeys[index % fallbackKeys.length];
  if (text.mode !== "LevelRun" || !text.player || !Array.isArray(text.enemies)) return fallback;
  const gate = text.level?.rogueliteRun?.extractionGate ?? text.level?.extractionGate;
  if (gate?.active && !gate.entered) return keyTowardWorldTarget(text.player, gate, fallback);
  const hasBoss = text.enemies.some((enemy) => enemy.boss);
  const hpRatio = text.player.maxHp ? text.player.hp / text.player.maxHp : 1;
  if (!hasBoss && hpRatio > 0.45) return fallback;

  let worldX = 0;
  let worldY = 0;
  const player = text.player;
  const threats = text.enemies
    .map((enemy) => ({
      enemy,
      distance: Math.hypot(player.worldX - enemy.worldX, player.worldY - enemy.worldY)
    }))
    .filter((threat) => threat.distance < (threat.enemy.boss ? 18 : 7.5))
    .sort((a, b) => (b.enemy.boss ? 1 : 0) - (a.enemy.boss ? 1 : 0) || a.distance - b.distance)
    .slice(0, 8);

  for (const threat of threats) {
    const dx = player.worldX - threat.enemy.worldX;
    const dy = player.worldY - threat.enemy.worldY;
    const distance = Math.max(0.4, threat.distance);
    const weight = threat.enemy.boss ? 4.6 : Math.max(0.35, 2.1 / distance);
    worldX += (dx / distance) * weight;
    worldY += (dy / distance) * weight;
  }

  const bounds = text.level?.mapBounds;
  if (bounds) {
    const edge = 4.5;
    if (player.worldX < bounds.minX + edge) worldX += 2.2;
    if (player.worldX > bounds.maxX - edge) worldX -= 2.2;
    if (player.worldY < bounds.minY + edge) worldY += 2.2;
    if (player.worldY > bounds.maxY - edge) worldY -= 2.2;
  }

  if (Math.hypot(worldX, worldY) < 0.1) return fallback;
  const screenX = (worldX - worldY) * 2;
  const screenY = worldX + worldY;
  if (Math.abs(screenX) > Math.abs(screenY)) return screenX >= 0 ? "ArrowRight" : "ArrowLeft";
  return screenY >= 0 ? "ArrowDown" : "ArrowUp";
}

function keyTowardWorldTarget(player, target, fallback) {
  const worldX = target.worldX - player.worldX;
  const worldY = target.worldY - player.worldY;
  if (Math.hypot(worldX, worldY) < 0.18) return fallback;
  const screenX = (worldX - worldY) * 2;
  const screenY = worldX + worldY;
  if (Math.abs(screenX) > Math.abs(screenY)) return screenX >= 0 ? "ArrowRight" : "ArrowLeft";
  return screenY >= 0 ? "ArrowDown" : "ArrowUp";
}

async function walkOverworldToNode(page, nodeId, timeoutMs = 10_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const text = await state(page);
    assert(text.mode === "OverworldMap", `expected OverworldMap while walking to ${nodeId}, got ${text.mode}`);
    const target = text.overworld?.nodes?.find((node) => node.id === nodeId);
    assert(target, `missing overworld node ${nodeId}`);
    if (text.overworld?.selectedId === nodeId && distance(text.player ?? { worldX: 0, worldY: 0 }, target) <= 1.05) return text;
    const key = keyTowardWorldTarget(text.player ?? { worldX: 0, worldY: 0 }, target, "ArrowLeft");
    await hold(page, key, 380);
  }
  const latest = await state(page);
  assert(false, `timed out walking to ${nodeId}; selected ${latest.overworld?.selectedId}`);
  return latest;
}

async function walkRunToWorld(page, worldX, worldY, timeoutMs = 6500) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    let text = await state(page);
    if (text.mode === "UpgradeDraft") {
      await press(page, "Digit1", 2);
      text = await state(page);
    }
    if (text.mode !== "LevelRun") return text;
    if (Math.hypot(worldX - (text.player?.worldX ?? 0), worldY - (text.player?.worldY ?? 0)) <= 1.15) return text;
    const key = keyTowardWorldTarget(text.player ?? { worldX: 0, worldY: 0 }, { worldX, worldY }, "ArrowDown");
    await hold(page, key, 360);
  }
  return state(page);
}

async function holdRunNearWorld(page, worldX, worldY, ms) {
  let elapsed = 0;
  while (elapsed < ms) {
    let text = await state(page);
    if (text.mode === "UpgradeDraft") {
      await press(page, "Digit1", 2);
      text = await state(page);
    }
    if (text.mode !== "LevelRun") return text;
    const distance = Math.hypot(worldX - (text.player?.worldX ?? 0), worldY - (text.player?.worldY ?? 0));
    if (distance > 0.85) {
      const key = keyTowardWorldTarget(text.player ?? { worldX: 0, worldY: 0 }, { worldX, worldY }, "ArrowDown");
      await hold(page, key, 260);
      elapsed += 260;
    } else {
      await advance(page, 320);
      elapsed += 320;
    }
  }
  return state(page);
}

async function holdRunUntilAlignmentProofs(page, targetCount, worldX, worldY, timeoutMs) {
  let elapsed = 0;
  let latest = await state(page);
  while (elapsed < timeoutMs) {
    if (latest.mode !== "LevelRun") return latest;
    const completed = latest.level?.rogueliteRun?.alignmentSpire?.objectiveLoop?.progress?.completed ?? 0;
    if (completed >= targetCount) return latest;
    latest = await holdRunNearWorld(page, worldX, worldY, 1200);
    elapsed += 1200;
  }
  return state(page);
}

async function waitForCombatArtActivity(page, timeoutMs) {
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
  let elapsed = 0;
  let index = 0;
  let latest = await state(page);
  while (elapsed < timeoutMs) {
    latest = await state(page);
    if (latest.mode === "UpgradeDraft") {
      await page.keyboard.press("Digit1");
      await advance(page, 120);
    } else if (latest.mode === "LevelRun") {
      const combatArt = latest.level?.combatArt;
      if (combatArt && (combatArt.projectileCount > 0 || combatArt.damageBadgeCount > 0 || combatArt.impactCount > 0)) return latest;
      await hold(page, keys[index % keys.length], 360);
      elapsed += 360;
      index += 1;
    } else {
      await advance(page, 250);
      elapsed += 250;
    }
  }
  latest = await state(page);
  assert(false, `expected combat-art projectile or hit activity before timeout; last mode ${latest.mode}`);
  return latest;
}

async function press(page, key, frames) {
  await page.keyboard.down(key);
  await dispatchKey(page, key, "keydown");
  await advance(page, frames * (1000 / 60));
  await dispatchKey(page, key, "keyup");
  await page.keyboard.up(key);
  await advance(page, 100);
}

async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await dispatchKey(page, key, "keydown");
  await advance(page, ms);
  await dispatchKey(page, key, "keyup");
  await page.keyboard.up(key);
  await advance(page, 50);
}

async function dispatchKey(page, key, type) {
  await page.evaluate(
    ({ key, type }) => {
      const aliases = {
        Enter: { key: "Enter", code: "Enter" },
        Space: { key: " ", code: "Space" },
        ArrowUp: { key: "ArrowUp", code: "ArrowUp" },
        ArrowDown: { key: "ArrowDown", code: "ArrowDown" },
        ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft" },
        ArrowRight: { key: "ArrowRight", code: "ArrowRight" },
        KeyW: { key: "w", code: "KeyW" },
        KeyA: { key: "a", code: "KeyA" },
        KeyS: { key: "s", code: "KeyS" },
        KeyD: { key: "d", code: "KeyD" },
        Digit1: { key: "1", code: "Digit1" },
        Digit2: { key: "2", code: "Digit2" },
        Digit3: { key: "3", code: "Digit3" },
        Digit4: { key: "4", code: "Digit4" }
      };
      const init = aliases[key] ?? { key, code: key };
      for (const target of [window, document]) {
        const event = new KeyboardEvent(type, { ...init, bubbles: true, cancelable: true });
        Object.defineProperty(event, "key", { get: () => init.key });
        Object.defineProperty(event, "code", { get: () => init.code });
        target.dispatchEvent(event);
      }
    },
    { key, type }
  );
}

async function advance(page, ms) {
  await page.evaluate(async (duration) => {
    if (typeof window.advanceTime === "function") {
      await window.advanceTime(duration);
    }
  }, ms);
}

async function state(page) {
  await page.waitForFunction(() => typeof window.render_game_to_text === "function", null, { timeout: 20000 });
  const raw = await page.evaluate(() => window.render_game_to_text?.() ?? "{}");
  return JSON.parse(raw);
}

async function capture(page, label) {
  await page.screenshot({ path: path.join(outDir, `${label}.png`), fullPage: true });
  const capturedState = await state(page);
  fs.writeFileSync(path.join(outDir, `${label}.json`), JSON.stringify(capturedState, null, 2));
  return capturedState;
}

async function realHold(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(250);
}

async function waitForOnlinePlayers(page, count) {
  await page.waitForFunction(
    (expected) => {
      const raw = window.render_game_to_text?.() ?? "{}";
      const parsed = JSON.parse(raw);
      return parsed.mode === "OnlineCoop" && parsed.online?.status === "joined" && parsed.players?.length >= expected;
    },
    count,
    { timeout: 10_000 }
  );
}

async function waitForSnapshotTick(page, tick) {
  await page.waitForFunction(
    (expected) => {
      const raw = window.render_game_to_text?.() ?? "{}";
      const parsed = JSON.parse(raw);
      return parsed.mode === "OnlineCoop" && parsed.online?.tick >= expected;
    },
    tick,
    { timeout: 10_000 }
  );
}

async function waitForOnlineRunPhase(page, phase) {
  await page.waitForFunction(
    (expected) => {
      const raw = window.render_game_to_text?.() ?? "{}";
      const parsed = JSON.parse(raw);
      return parsed.mode === "OnlineCoop" && parsed.online?.runPhase === expected;
    },
    phase,
    { timeout: 12_000 }
  );
}

async function waitForOnlineReadyCount(page, count) {
  await page.waitForFunction(
    (expected) => {
      const raw = window.render_game_to_text?.() ?? "{}";
      const parsed = JSON.parse(raw);
      return parsed.mode === "OnlineCoop" && parsed.online?.readyCount >= expected;
    },
    count,
    { timeout: 10_000 }
  );
}

async function waitForOnlineServerCombat(page, predicate, label, timeoutMs = 12_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const text = await state(page);
    if (text.mode === "OnlineCoop" && predicate(text)) return text;
    await page.waitForTimeout(250);
  }
  const latest = await state(page);
  throw new Error(`Timed out waiting for ${label}; latest ${JSON.stringify(latest.online ?? latest.level ?? {}, null, 2)}`);
}

function distance(a, b) {
  return Math.hypot((a.worldX ?? 0) - (b.worldX ?? 0), (a.worldY ?? 0) - (b.worldY ?? 0));
}

async function waitForServer(target) {
  const started = Date.now();
  while (Date.now() - started < 60_000) {
    try {
      const response = await fetch(target);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Timed out waiting for ${target}`);
}

async function waitForReachable(target) {
  const started = Date.now();
  while (Date.now() - started < 60_000) {
    try {
      await fetch(target);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Timed out waiting for ${target}`);
}

async function fetchJson(target) {
  const response = await fetch(target);
  if (!response.ok) throw new Error(`Failed to fetch ${target}: ${response.status}`);
  return response.json();
}

async function closeBrowser(browser) {
  try {
    await Promise.race([
      browser.close(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out closing Playwright browser")), 4000))
    ]);
  } catch {
    const process = typeof browser.process === "function" ? browser.process() : null;
    if (process && !process.killed) process.kill("SIGKILL");
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runArmisticeSpriteFramingProof() {
  const result = spawnSync("python3", ["scripts/proof/validate-armistice-sprite-framing.py"], {
    cwd,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(`Armistice sprite framing proof failed:\n${result.stdout}${result.stderr}`);
  }
}

function scenarioPortOffset(name) {
  const names = ["smoke", "movement", "overworld", "horde", "upgrades", "build-grammar", "build-vfx", "boss", "player-damage", "hades-inspired-systems", "best-in-class-roguelite", "armistice-core-gameplay", "reference-run", "cooling-lake-graybox", "cooling-systems", "transit-route-graybox", "kettle-coast-graybox", "blackwater-beacon-graybox", "memory-cache-recovery", "faction-relay-holdout", "glass-sunfield-prism", "archive-court-redaction", "appeal-court-ruins", "full", "coop", "network", "campaign-full", "asset-preview", "asset-horde", "asset-boss", "visual-fidelity-camera", "milestone10-art", "milestone11-art", "milestone12-art", "milestone13-default", "milestone14-combat-art", "milestone15-online-combat", "milestone16-online-flow", "milestone17-party-overworld", "milestone18-coop-progression", "milestone19-reconnect-schema", "milestone20-second-online-region", "milestone21-region-events", "milestone22-party-rewards", "milestone23-route-persistence", "milestone24-persistence-import", "milestone25-route-polish", "milestone26-fourth-region-boss-gate", "milestone27-metaprogression-unlocks", "milestone28-online-route-art", "milestone29-role-pressure", "milestone30-save-profile-export-codes", "milestone31-arena-objectives", "milestone32-party-builds", "milestone33-objective-variety", "milestone34-objective-art", "milestone35-campaign-route", "milestone36-campaign-content-schema", "milestone37-route-art-polish", "milestone38-distinct-campaign-arenas", "milestone39-campaign-dialogue", "milestone40-campaign-route-ux", "milestone41-arena-visual-identity", "milestone42-glass-sunfield", "milestone43-archive-unsaid", "milestone44-blackwater-beacon", "milestone45-outer-alignment-finale", "milestone46-full-class-roster", "milestone47-faction-bursts", "milestone48-enemy-family-expansion", "milestone49-player-comind-art", "milestone50-arena-boss-art", "milestone51-overworld-diorama", "milestone52-progression-balance", "milestone53-dialogue-ending", "milestone54-audio-juice-feel", "milestone55-online-robustness", "milestone56-quality-lock"];
  return Math.max(0, names.indexOf(name));
}

function usesCoopServer(name) {
  return ["network", "campaign-full", "milestone12-art", "milestone13-default", "milestone14-combat-art", "milestone15-online-combat", "milestone16-online-flow", "milestone17-party-overworld", "milestone18-coop-progression", "milestone19-reconnect-schema", "milestone20-second-online-region", "milestone21-region-events", "milestone22-party-rewards", "milestone23-route-persistence", "milestone24-persistence-import", "milestone25-route-polish", "milestone26-fourth-region-boss-gate", "milestone27-metaprogression-unlocks", "milestone28-online-route-art", "milestone29-role-pressure", "milestone30-save-profile-export-codes", "milestone31-arena-objectives", "milestone32-party-builds", "milestone33-objective-variety", "milestone34-objective-art", "milestone35-campaign-route", "milestone36-campaign-content-schema", "milestone37-route-art-polish", "milestone38-distinct-campaign-arenas", "milestone39-campaign-dialogue", "milestone40-campaign-route-ux", "milestone41-arena-visual-identity", "milestone42-glass-sunfield", "milestone43-archive-unsaid", "milestone44-blackwater-beacon", "milestone45-outer-alignment-finale", "milestone46-full-class-roster", "milestone47-faction-bursts", "milestone48-enemy-family-expansion", "milestone50-arena-boss-art", "milestone51-overworld-diorama", "milestone52-progression-balance", "milestone53-dialogue-ending", "milestone54-audio-juice-feel", "milestone55-online-robustness", "milestone56-quality-lock"].includes(name);
}
