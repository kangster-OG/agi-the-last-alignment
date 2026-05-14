import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const cwd = process.cwd();
const outDir = path.join(cwd, "docs", "proof", "roster-sweep");
const port = Number(process.env.ROSTER_SWEEP_PORT ?? 5291);
const baseUrl = process.env.PROOF_BASE_URL ?? `http://127.0.0.1:${port}`;
const runMs = Number(process.env.ROSTER_SWEEP_RUN_MS ?? 28_000);
const limit = Number(process.env.ROSTER_SWEEP_LIMIT ?? 0);
const startIndex = Number(process.env.ROSTER_SWEEP_START ?? 0);

const classIds = [
  "accord_striker",
  "bastion_breaker",
  "drone_reaver",
  "signal_vanguard",
  "bonecode_executioner",
  "redline_surgeon",
  "moonframe_juggernaut",
  "vector_interceptor",
  "nullbreaker_ronin",
  "overclock_marauder",
  "prism_gunner",
  "rift_saboteur"
];

const factionIds = [
  "openai_accord",
  "anthropic_safeguard",
  "google_deepmind_gemini",
  "meta_llama_open_herd",
  "qwen_silkgrid",
  "mistral_cyclone",
  "deepseek_abyssal",
  "xai_grok_free_signal"
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

let serverLog = "";
server?.stdout.on("data", (chunk) => {
  serverLog += chunk.toString();
});
server?.stderr.on("data", (chunk) => {
  serverLog += chunk.toString();
});

try {
  await waitForServer(baseUrl);
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  const combos = [];
  for (const classId of classIds) {
    for (const factionId of factionIds) combos.push({ classId, factionId });
  }
  const selectedCombos = limit > 0 ? combos.slice(startIndex, startIndex + limit) : combos.slice(startIndex);
  const results = [];

  try {
    for (let i = 0; i < selectedCombos.length; i += 1) {
      const combo = selectedCombos[i];
      const page = await context.newPage();
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push({ combo, message: msg.text() });
      });
      page.on("pageerror", (error) => errors.push({ combo, message: String(error) }));
      try {
        const result = await runCombo(page, combo, i);
        results.push(result);
        fs.writeFileSync(path.join(outDir, "roster-sweep-partial.json"), JSON.stringify({ startIndex, results }, null, 2));
        console.log(`${startIndex + i + 1}/${combos.length} ${combo.classId} + ${combo.factionId}: score ${result.score} kills ${result.kills} hp ${result.hp}/${result.maxHp} level ${result.level}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const analysis = analyze(results);
  const report = {
    ok: true,
    baseUrl,
    runMs,
    comboCount: selectedCombos.length,
    startIndex,
    generatedAt: new Date().toISOString(),
    analysis,
    results,
    errors
  };
  fs.writeFileSync(path.join(outDir, "roster-sweep-results.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, "roster-sweep-summary.md"), markdownReport(report));
  if (errors.length) {
    fs.writeFileSync(path.join(outDir, "browser-errors.json"), JSON.stringify(errors, null, 2));
    throw new Error(`Browser errors recorded during roster sweep: ${errors.length}`);
  }
} finally {
  server?.kill("SIGTERM");
  fs.writeFileSync(path.join(outDir, "server.log"), serverLog);
}

async function runCombo(page, combo, index) {
  const params = new URLSearchParams({
    productionArt: "1",
    armisticeTiles: "1",
    proofHud: "1",
    proofDirectRun: "1",
    rosterSweep: String(index),
    proofClassId: combo.classId,
    proofFactionId: combo.factionId
  });
  await page.goto(`${baseUrl}?${params.toString()}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  await page.waitForSelector("canvas");
  await page.waitForFunction(() => {
    const raw = window.render_game_to_text?.();
    if (!raw) return false;
    try {
      return JSON.parse(raw).mode === "LevelRun";
    } catch {
      return false;
    }
  });
  const selected = await state(page);
  if (selected.selectedBuild?.classId !== combo.classId || selected.selectedBuild?.factionId !== combo.factionId) {
    throw new Error(`Proof loadout mismatch: expected ${combo.classId}/${combo.factionId}, got ${selected.selectedBuild?.classId}/${selected.selectedBuild?.factionId}`);
  }

  let elapsed = 0;
  let final = await state(page);
  while (elapsed < runMs && final.mode !== "LevelSummary") {
    if (final.mode === "LevelRun") {
      await steer(page, elapsed);
      await advance(page, 1000);
      elapsed += 1000;
    } else if (final.mode === "UpgradeDraft" || final.mode === "AlignmentCheck") {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(25);
    } else {
      await page.keyboard.press("Enter");
      await page.waitForTimeout(25);
    }
    final = await state(page);
  }

  const player = final.player ?? {};
  const level = player.level ?? final.level?.playerLevel ?? 1;
  const hp = Math.max(0, Math.round(player.hp ?? 0));
  const maxHp = Math.max(1, Math.round(player.maxHp ?? 1));
  const kills = final.level?.kills ?? 0;
  const seconds = final.level?.seconds ?? elapsed / 1000;
  const objectiveProgress = objectiveProgressRatio(final.objective);
  const bossDefeated = Boolean(final.level?.bossDefeated);
  const downed = final.players?.[0]?.downed === true || hp <= 0;
  return {
    classId: combo.classId,
    factionId: combo.factionId,
    className: selected.selectedBuild?.className ?? combo.classId,
    factionName: selected.selectedBuild?.factionName ?? combo.factionId,
    weaponId: final.build?.weaponId ?? selected.selectedBuild?.buildKit?.startingWeaponId ?? "",
    synergyId: final.build?.buildKit?.synergyId ?? selected.selectedBuild?.buildKit?.synergyId ?? "",
    role: final.build?.buildKit?.resolvedRole ?? selected.selectedBuild?.buildKit?.resolvedRole ?? "",
    mode: final.mode,
    seconds,
    kills,
    level,
    xp: player.xp ?? 0,
    hp,
    maxHp,
    hpRatio: round(hp / maxHp),
    objectiveProgress,
    bossSpawned: Boolean(final.level?.bossSpawned),
    bossDefeated,
    downed,
    score: scoreResult({ kills, level, hp, maxHp, objectiveProgress, bossDefeated, downed })
  };
}

function scoreResult({ kills, level, hp, maxHp, objectiveProgress, bossDefeated, downed }) {
  const hpRatio = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
  return round(kills + level * 7 + objectiveProgress * 28 + hpRatio * 18 + (bossDefeated ? 40 : 0) - (downed ? 35 : 0));
}

function objectiveProgressRatio(objective) {
  if (!objective) return 0;
  const completed = Number(objective.completed ?? objective.completedCount ?? 0);
  const total = Number(objective.total ?? objective.totalCount ?? 0);
  if (Number.isFinite(completed) && Number.isFinite(total) && total > 0) return round(Math.max(0, Math.min(1, completed / total)));
  const progress = Number(objective.progress ?? 0);
  return Number.isFinite(progress) ? round(Math.max(0, Math.min(1, progress))) : 0;
}

function analyze(results) {
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const scores = results.map((result) => result.score);
  const avg = average(scores);
  const stdev = standardDeviation(scores, avg);
  const lowCutoff = avg - stdev * 1.15;
  const highCutoff = avg + stdev * 1.15;
  return {
    averageScore: round(avg),
    scoreStdev: round(stdev),
    lowCutoff: round(lowCutoff),
    highCutoff: round(highCutoff),
    topTen: sorted.slice(0, 10),
    bottomTen: sorted.slice(-10).reverse(),
    lowOutliers: sorted.filter((result) => result.score < lowCutoff).reverse(),
    highOutliers: sorted.filter((result) => result.score > highCutoff),
    byClass: aggregate(results, "classId"),
    byFaction: aggregate(results, "factionId"),
    byWeapon: aggregate(results, "weaponId")
  };
}

function aggregate(results, key) {
  return Object.values(results.reduce((acc, result) => {
    const id = result[key] || "unknown";
    acc[id] ??= { id, count: 0, averageScore: 0, averageKills: 0, averageHpRatio: 0, downed: 0 };
    acc[id].count += 1;
    acc[id].averageScore += result.score;
    acc[id].averageKills += result.kills;
    acc[id].averageHpRatio += result.hpRatio;
    acc[id].downed += result.downed ? 1 : 0;
    return acc;
  }, {})).map((entry) => ({
    ...entry,
    averageScore: round(entry.averageScore / entry.count),
    averageKills: round(entry.averageKills / entry.count),
    averageHpRatio: round(entry.averageHpRatio / entry.count),
    downedRate: round(entry.downed / entry.count)
  })).sort((a, b) => b.averageScore - a.averageScore);
}

function markdownReport(report) {
  const { analysis } = report;
  return [
    "# Roster Sweep",
    "",
    `- Generated: ${report.generatedAt}`,
    `- Combos: ${report.comboCount}`,
    `- Run window: ${report.runMs}ms`,
    `- Average score: ${analysis.averageScore}`,
    `- Score stdev: ${analysis.scoreStdev}`,
    "",
    "## Top 10",
    table(analysis.topTen),
    "",
    "## Bottom 10",
    table(analysis.bottomTen),
    "",
    "## Class Averages",
    aggregateTable(analysis.byClass),
    "",
    "## Faction Averages",
    aggregateTable(analysis.byFaction),
    "",
    "## Weapon Averages",
    aggregateTable(analysis.byWeapon)
  ].join("\n");
}

function table(rows) {
  return [
    "| Combo | Weapon | Score | Kills | HP | Level | Downed |",
    "| --- | --- | ---: | ---: | ---: | ---: | --- |",
    ...rows.map((row) => `| ${row.classId} + ${row.factionId} | ${row.weaponId} | ${row.score} | ${row.kills} | ${row.hp}/${row.maxHp} | ${row.level} | ${row.downed ? "yes" : "no"} |`)
  ].join("\n");
}

function aggregateTable(rows) {
  return [
    "| ID | Avg Score | Avg Kills | Avg HP Ratio | Downed Rate |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...rows.map((row) => `| ${row.id} | ${row.averageScore} | ${row.averageKills} | ${row.averageHpRatio} | ${row.downedRate} |`)
  ].join("\n");
}

async function selectBuildOption(page, kind, targetId) {
  const key = kind === "class" ? "ArrowDown" : "ArrowRight";
  const field = kind === "class" ? "selectedClassId" : "selectedFactionId";
  for (let i = 0; i < 64; i += 1) {
    const text = await state(page);
    if (text.buildSelection?.[field] === targetId) return;
    await page.keyboard.press(key);
    await page.waitForTimeout(45);
  }
  const final = await state(page);
  throw new Error(`Unable to select ${targetId}; current ${kind} is ${final.buildSelection?.[field]}`);
}

async function pressUntilMode(page, key, mode, attempts) {
  for (let i = 0; i < attempts; i += 1) {
    const text = await state(page);
    if (text.mode === mode) return text;
    await page.keyboard.press(key);
    await advance(page, 160);
    await page.waitForTimeout(30);
  }
  const final = await state(page);
  if (final.mode !== mode) throw new Error(`Expected ${mode}, got ${final.mode}`);
  return final;
}

async function steer(page, elapsed) {
  const cycle = Math.floor(elapsed / 1000) % 4;
  const key = cycle === 0 ? "KeyD" : cycle === 1 ? "KeyS" : cycle === 2 ? "KeyA" : "KeyW";
  await page.keyboard.down(key);
  await advance(page, 240);
  await page.keyboard.up(key);
}

async function advance(page, ms) {
  let lastError = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await page.evaluate((value) => window.advanceTime?.(value), ms);
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(80);
    }
  }
  throw lastError ?? new Error("Unable to advance proof time");
}

async function state(page) {
  let lastError = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const raw = await page.evaluate(() => window.render_game_to_text?.() ?? "{}");
      return JSON.parse(raw);
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(80);
    }
  }
  throw lastError ?? new Error("Unable to read proof state");
}

async function writeFullRouteProfile(page) {
  await page.evaluate(({ rewardIds, completedNodeIds }) => {
    const profile = {
      completedNodeIds,
      unlockedNodeIds: completedNodeIds,
      rewardIds,
      partyRenown: Math.max(18, rewardIds.length * 2),
      nodeCompletionCounts: Object.fromEntries(completedNodeIds.map((id) => [id, 1])),
      recommendedNodeId: "alignment_spire_finale",
      routeDepth: completedNodeIds.length,
      savedAtTick: 9600
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
        saveHash: "proof_roster_sweep_full_profile"
      })
    );
  }, {
    rewardIds: [
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
    ],
    completedNodeIds: [
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
    ]
  });
}

async function waitForServer(target) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(target);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become reachable: ${target}`);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function standardDeviation(values, avg) {
  return Math.sqrt(values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / Math.max(1, values.length));
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
