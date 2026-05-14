import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const proofRoot = path.join(root, "docs", "proof");
const outDir = path.join(proofRoot, "campaign-duration");
fs.mkdirSync(outDir, { recursive: true });

const routes = [
  ["armistice_plaza", "reference-run"],
  ["cooling_lake_nine", "cooling-lake-graybox"],
  ["transit_loop_zero", "transit-route-graybox"],
  ["signal_coast", "kettle-coast-graybox"],
  ["blackwater_beacon", "blackwater-beacon-graybox"],
  ["memory_cache_001", "memory-cache-recovery"],
  ["guardrail_forge", "faction-relay-holdout"],
  ["glass_sunfield", "glass-sunfield-prism"],
  ["archive_of_unsaid_things", "archive-court-redaction"],
  ["appeal_court_ruins", "appeal-court-ruins"],
  ["alignment_spire_finale", "alignment-spire-finale"]
];

const configured = {
  armistice_plaza: { targetSeconds: 300, bossSeconds: 190, extractionTailSeconds: 35 },
  cooling_lake_nine: { targetSeconds: 420, bossSeconds: 255, extractionTailSeconds: 45 },
  transit_loop_zero: { targetSeconds: 420, bossSeconds: 250, extractionTailSeconds: 45 },
  signal_coast: { targetSeconds: 480, bossSeconds: 290, extractionTailSeconds: 55 },
  blackwater_beacon: { targetSeconds: 540, bossSeconds: 325, extractionTailSeconds: 65 },
  memory_cache_001: { targetSeconds: 600, bossSeconds: 360, extractionTailSeconds: 70 },
  guardrail_forge: { targetSeconds: 600, bossSeconds: 360, extractionTailSeconds: 70 },
  glass_sunfield: { targetSeconds: 660, bossSeconds: 400, extractionTailSeconds: 85 },
  archive_of_unsaid_things: { targetSeconds: 660, bossSeconds: 400, extractionTailSeconds: 85 },
  appeal_court_ruins: { targetSeconds: 720, bossSeconds: 435, extractionTailSeconds: 100 },
  alignment_spire_finale: { targetSeconds: 900, bossSeconds: 585, extractionTailSeconds: 135 }
};

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function latestJsonForScenario(scenario) {
  const dir = path.join(proofRoot, scenario);
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(dir, file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const file of files) {
    const json = readJson(file);
    if (json?.mode === "LevelComplete" || json?.mode === "LevelRun") return { file, json };
  }
  return null;
}

function latestLevelRunForScenario(scenario) {
  const dir = path.join(proofRoot, scenario);
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(dir, file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const file of files) {
    const json = readJson(file);
    if (json?.mode === "LevelRun") return { file, json };
  }
  return null;
}

function routeCounters(run) {
  return run?.level?.rogueliteRun?.campaignDuration?.cycleDepth ?? run?.rogueliteRun?.campaignDuration?.cycleDepth ?? null;
}

function duration(run) {
  return run?.level?.rogueliteRun?.campaignDuration ?? run?.rogueliteRun?.campaignDuration ?? null;
}

const rows = routes.map(([arenaId, scenario]) => {
  const latest = latestJsonForScenario(scenario);
  const latestLevelRun = latestLevelRunForScenario(scenario);
  const json = latest?.json ?? null;
  const runJson = latestLevelRun?.json ?? json;
  const level = json?.level ?? {};
  const durationTelemetry = duration(runJson);
  const rowConfig = configured[arenaId];
  return {
    arenaId,
    scenario,
    artifact: latest ? path.relative(root, latest.file) : null,
    mode: json?.mode ?? "missing",
    configuredTargetSeconds: durationTelemetry?.targetSeconds ?? rowConfig?.targetSeconds ?? level.targetSeconds ?? null,
    configuredBossSeconds: durationTelemetry?.bossSeconds ?? rowConfig?.bossSeconds ?? null,
    actualSeconds: json?.level?.seconds ?? json?.level?.summary?.seconds ?? json?.seconds ?? null,
    phaseId: durationTelemetry?.phaseId ?? null,
    phaseLabel: durationTelemetry?.phaseLabel ?? null,
    midRunBeatCount: durationTelemetry?.midRunBeatCount ?? 0,
    extractionTailSeconds: durationTelemetry?.extractionTailSeconds ?? rowConfig?.extractionTailSeconds ?? null,
    expectedClearBand: durationTelemetry?.expectedClearBand ?? null,
    playerHp: json?.player?.hp ?? null,
    playerMaxHp: json?.player?.maxHp ?? null,
    kills: level?.kills ?? json?.level?.summary?.kills ?? null,
    playerLevel: json?.player?.level ?? json?.level?.summary?.level ?? null,
    bossSpawned: level?.bossSpawned ?? null,
    bossDefeated: level?.bossDefeated ?? null,
    objectiveCycles: routeCounters(json),
    objectiveVariety: json?.level?.rogueliteRun?.objectiveVariety?.runtime ?? null,
    extractionGate: json?.level?.rogueliteRun?.extractionGate ?? null
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  rows
};

fs.writeFileSync(path.join(outDir, "campaign-duration-audit.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(outDir, "campaign-duration-audit.md"),
  [
    "# Campaign Duration Audit",
    "",
    "| Arena | Scenario | Mode | Target | Actual | Boss | Phase | Beats | HP | KOs | Cycles |",
    "|---|---|---:|---:|---:|---:|---|---:|---:|---:|---|",
    ...rows.map((row) => {
      const hp = row.playerHp == null ? "" : `${Math.round(row.playerHp)}/${Math.round(row.playerMaxHp ?? 0)}`;
      const cycles = row.objectiveCycles ? JSON.stringify(row.objectiveCycles) : "";
      return `| ${row.arenaId} | ${row.scenario} | ${row.mode} | ${row.configuredTargetSeconds ?? ""} | ${row.actualSeconds ?? ""} | ${row.configuredBossSeconds ?? ""} | ${row.phaseId ?? ""} | ${row.midRunBeatCount} | ${hp} | ${row.kills ?? ""} | ${cycles.replaceAll("|", "/")} |`;
    })
  ].join("\n")
);

console.log(`Campaign duration audit wrote ${rows.length} rows to docs/proof/campaign-duration/.`);
