import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "docs/proof/campaign-clarity");
fs.mkdirSync(outDir, { recursive: true });

const source = fs.readFileSync(path.join(root, "src/content/campaignClarity.ts"), "utf8");
const expected = [
  ["armistice_plaza", "Stabilize", "Treaty Anchors"],
  ["cooling_lake_nine", "Repair", "Server Buoys"],
  ["transit_loop_zero", "Align", "Route Platforms"],
  ["signal_coast", "Tune", "Signal Relays"],
  ["blackwater_beacon", "Retune", "Antenna Arrays"],
  ["memory_cache_001", "Recover", "Memory Records"],
  ["guardrail_forge", "Hold", "Forge Relays"],
  ["glass_sunfield", "Align", "Sun Lenses"],
  ["archive_of_unsaid_things", "Preserve", "Evidence Writs"],
  ["appeal_court_ruins", "Recover", "Appeal Briefs"],
  ["alignment_spire_finale", "Seal", "Alignment Proofs"]
];

const report = {
  checkedAt: new Date().toISOString(),
  levelCount: expected.length,
  levels: [],
  passed: true
};

for (const [nodeId, verb, unit] of expected) {
  const nodeOk = source.includes(`nodeId: "${nodeId}"`);
  const verbOk = source.includes(`verb: "${verb}"`);
  const unitOk = source.includes(`objectiveUnit: "${unit}"`);
  const objectiveOk = source.includes("objectivePlain:") && source.includes(verb) && source.includes(unit);
  const passed = nodeOk && verbOk && unitOk && objectiveOk;
  report.levels.push({ nodeId, verb, objectiveUnit: unit, passed });
  if (!passed) report.passed = false;
}

for (const file of [
  "src/ui/briefing.ts",
  "src/ui/hud.ts",
  "src/ui/summary.ts",
  "src/overworld/OverworldState.ts",
  "src/proof/renderGameToText.ts"
]) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const wired = text.includes("campaignClarity") || text.includes("campaignObjectiveHudLabel") || text.includes("objectiveVerb") || text.includes("objectivePlain");
  report[file] = { wired };
  if (!wired) report.passed = false;
}

const hudSource = fs.readFileSync(path.join(root, "src/ui/hud.ts"), "utf8");
report.hudRunClarityStrip = {
  danger: hudSource.includes("dangerPlain") && hudSource.includes("compactThreat"),
  reward: hudSource.includes("rewardPlain") && hudSource.includes("compactReward")
};
if (!report.hudRunClarityStrip.danger || !report.hudRunClarityStrip.reward) report.passed = false;

const summarySource = fs.readFileSync(path.join(root, "src/ui/summary.ts"), "utf8");
report.summaryObjectiveOutcome = {
  plainVerb: summarySource.includes("objectiveOutcomeLine") && summarySource.includes("clarity?.verb"),
  completionFirst: summarySource.includes("COMPLETE") && summarySource.includes("INCOMPLETE"),
  progressSecondary: summarySource.includes("memory.objectiveCompleted") && summarySource.includes("memory.objectiveTotal")
};
if (!report.summaryObjectiveOutcome.plainVerb || !report.summaryObjectiveOutcome.completionFirst || !report.summaryObjectiveOutcome.progressSecondary) report.passed = false;

fs.writeFileSync(path.join(outDir, "campaign-clarity-static.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(outDir, "campaign-clarity-static.md"),
  [
    "# Campaign Clarity Static Proof",
    "",
    `Passed: ${report.passed ? "yes" : "no"}`,
    "",
    ...report.levels.map((level) => `- ${level.nodeId}: ${level.verb} ${level.objectiveUnit} (${level.passed ? "ok" : "missing"})`)
  ].join("\n")
);

if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(`Campaign clarity static proof passed for ${expected.length} levels.`);
