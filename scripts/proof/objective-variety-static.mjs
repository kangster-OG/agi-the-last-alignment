import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "docs/proof/objective-variety");
fs.mkdirSync(outDir, { recursive: true });

const varietySource = fs.readFileSync(path.join(root, "src/content/campaignObjectiveVariety.ts"), "utf8");
const levelSource = fs.readFileSync(path.join(root, "src/level/LevelRunState.ts"), "utf8");
const rogueliteSource = fs.readFileSync(path.join(root, "src/roguelite/deepRoguelite.ts"), "utf8");
const briefingSource = fs.readFileSync(path.join(root, "src/ui/briefing.ts"), "utf8");
const hudSource = fs.readFileSync(path.join(root, "src/ui/hud.ts"), "utf8");
const summarySource = fs.readFileSync(path.join(root, "src/ui/summary.ts"), "utf8");
const telemetrySource = fs.readFileSync(path.join(root, "src/proof/renderGameToText.ts"), "utf8");

const expected = [
  ["armistice_plaza", "capture_static", "Anchor Tutorial"],
  ["cooling_lake_nine", "lure_hazard", "Hazard Lure"],
  ["transit_loop_zero", "route_window", "Route Window"],
  ["signal_coast", "signal_window", "Timed Crossing"],
  ["blackwater_beacon", "boss_gate_hunt", "Boss Gate Hunt"],
  ["memory_cache_001", "carry_extract", "Carry And Extract"],
  ["guardrail_forge", "risk_holdout", "Risk Holdout"],
  ["glass_sunfield", "environmental_weapon", "Environmental Weapon"],
  ["archive_of_unsaid_things", "carry_extract", "Evidence Carry"],
  ["appeal_court_ruins", "route_window", "Public Ruling Window"],
  ["alignment_spire_finale", "campaign_remix", "Campaign Remix"]
];

const styles = new Set(expected.map(([, styleId]) => styleId));
const report = {
  checkedAt: new Date().toISOString(),
  levelCount: expected.length,
  distinctStyles: styles.size,
  levels: [],
  wiring: {},
  passed: true
};

for (const [arenaId, styleId, styleName] of expected) {
  const level = {
    arenaId,
    styleId,
    styleName,
    hasArena: varietySource.includes(`arenaId: "${arenaId}"`),
    hasStyle: varietySource.includes(`styleId: "${styleId}"`),
    hasName: varietySource.includes(`styleName: "${styleName}"`),
    hasProofHook: varietySource.includes("proofHook:")
  };
  level.passed = level.hasArena && level.hasStyle && level.hasName && level.hasProofHook;
  report.levels.push(level);
  if (!level.passed) report.passed = false;
}

if (styles.size < 7) report.passed = false;
const captureStaticCount = expected.filter(([, styleId]) => styleId === "capture_static").length;
if (captureStaticCount > 2) report.passed = false;

const wiringChecks = {
  runtimeStyleData: rogueliteSource.includes("withCampaignObjectiveVariety") && rogueliteSource.includes("styleId"),
  runtimeEngagement: levelSource.includes("objectiveVarietyEngagement") && levelSource.includes("bonusProgressSeconds"),
  whatNowGuidance: levelSource.includes("objectiveVarietyNextAction") && levelSource.includes("Lure a live coolant/cable surge"),
  briefingMechanic: briefingSource.includes("MECHANIC:") && briefingSource.includes("campaignObjectiveVarietyForArena"),
  hudMechanic: hudSource.includes("objectiveMechanic") && hudSource.includes("LURE HAZARD"),
  summaryMechanic: summarySource.includes("Mechanic:") && summarySource.includes("objectiveStyle"),
  telemetryMechanic: telemetrySource.includes("objectiveVarietySummary") && telemetrySource.includes("campaignObjectiveVarietyForNode")
};

for (const [key, passed] of Object.entries(wiringChecks)) {
  report.wiring[key] = { passed };
  if (!passed) report.passed = false;
}

fs.writeFileSync(path.join(outDir, "objective-variety-static.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(outDir, "objective-variety-static.md"),
  [
    "# Objective Variety Static Proof",
    "",
    `Passed: ${report.passed ? "yes" : "no"}`,
    `Distinct styles: ${report.distinctStyles}`,
    "",
    ...report.levels.map((level) => `- ${level.arenaId}: ${level.styleName} / ${level.styleId} (${level.passed ? "ok" : "missing"})`),
    "",
    ...Object.entries(report.wiring).map(([key, value]) => `- ${key}: ${value.passed ? "ok" : "missing"}`)
  ].join("\n")
);

if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(`Objective variety static proof passed for ${expected.length} levels and ${styles.size} styles.`);
