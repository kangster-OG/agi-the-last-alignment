import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "docs", "proof", "campaign-duration");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const profileSource = fs.readFileSync(path.join(root, "src", "content", "campaignDurationProfile.ts"), "utf8");
const arenasSource = fs.readFileSync(path.join(root, "src", "content", "arenas.ts"), "utf8");
const telemetrySource = fs.readFileSync(path.join(root, "src", "proof", "renderGameToText.ts"), "utf8");
const levelRunSource = fs.readFileSync(path.join(root, "src", "level", "LevelRunState.ts"), "utf8");

const expected = {
  armistice_plaza: { targetSeconds: 300, bossSeconds: 190, extractionTailSeconds: 35, midRunRewardBeats: [120, 245] },
  cooling_lake_nine: { targetSeconds: 420, bossSeconds: 255, extractionTailSeconds: 45, midRunRewardBeats: [135, 255, 335] },
  transit_loop_zero: { targetSeconds: 420, bossSeconds: 250, extractionTailSeconds: 45, midRunRewardBeats: [130, 250, 335] },
  signal_coast: { targetSeconds: 480, bossSeconds: 290, extractionTailSeconds: 55, midRunRewardBeats: [150, 290, 385] },
  blackwater_beacon: { targetSeconds: 540, bossSeconds: 325, extractionTailSeconds: 65, midRunRewardBeats: [165, 325, 440] },
  memory_cache_001: { targetSeconds: 600, bossSeconds: 360, extractionTailSeconds: 70, midRunRewardBeats: [180, 360, 500] },
  guardrail_forge: { targetSeconds: 600, bossSeconds: 360, extractionTailSeconds: 70, midRunRewardBeats: [180, 360, 500] },
  glass_sunfield: { targetSeconds: 660, bossSeconds: 400, extractionTailSeconds: 85, midRunRewardBeats: [200, 400, 535] },
  archive_of_unsaid_things: { targetSeconds: 660, bossSeconds: 400, extractionTailSeconds: 85, midRunRewardBeats: [200, 400, 535] },
  appeal_court_ruins: { targetSeconds: 720, bossSeconds: 435, extractionTailSeconds: 100, midRunRewardBeats: [220, 435, 590] },
  alignment_spire_finale: { targetSeconds: 900, bossSeconds: 585, extractionTailSeconds: 135, midRunRewardBeats: [210, 405, 585, 765] }
};

const phaseIds = ["opening", "build_online", "objective_cycle_1", "elite_cache", "objective_cycle_2", "boss_pressure", "extraction_panic"];
const checks = [];

function check(id, pass, detail) {
  checks.push({ id, pass, detail });
}

const totalTargetSeconds = Object.values(expected).reduce((sum, row) => sum + row.targetSeconds, 0);
check("total_combat_target_6300s", totalTargetSeconds === 6300, `total=${totalTargetSeconds}`);
check("profile_exports_total_constant", profileSource.includes("CAMPAIGN_DURATION_TOTAL_TARGET_SECONDS"), "profile exposes total target constant");
check("profile_exports_lookup", profileSource.includes("campaignDurationProfileForArena"), "profile exposes runtime lookup");

for (const [arenaId, row] of Object.entries(expected)) {
  const rowPattern = new RegExp(`${arenaId}: \\{ targetSeconds: ${row.targetSeconds}, bossSeconds: ${row.bossSeconds}, extractionTailSeconds: ${row.extractionTailSeconds}, midRunRewardBeats: \\[${row.midRunRewardBeats.join(", ")}\\] \\}`);
  const bossRatio = row.bossSeconds / row.targetSeconds;
  check(`${arenaId}_profile_row`, rowPattern.test(profileSource), `${row.targetSeconds}s / boss ${row.bossSeconds}s`);
  check(`${arenaId}_boss_ratio`, bossRatio >= 0.58 && bossRatio <= 0.66, `ratio=${bossRatio.toFixed(3)}`);
  check(`${arenaId}_arena_uses_profile`, arenasSource.includes(`CAMPAIGN_DURATION_PROFILES.${arenaId}.targetSeconds`) && arenasSource.includes(`CAMPAIGN_DURATION_PROFILES.${arenaId}.bossSeconds`), "arena timing comes from duration profile");
  check(`${arenaId}_reward_beats`, row.midRunRewardBeats.length >= 2 && row.midRunRewardBeats.every((beat) => beat > 0 && beat <= row.targetSeconds), row.midRunRewardBeats.join(","));
}

for (const phaseId of phaseIds) {
  check(`phase_${phaseId}_declared`, profileSource.includes(`"${phaseId}"`), "phase id declared in profile");
}

for (const field of ["targetSeconds", "bossSeconds", "phaseId", "phaseLabel", "phaseElapsed", "nextPhaseTime", "phaseProgress", "midRunBeatCount", "extractionTailSeconds", "expectedClearBand"]) {
  check(`telemetry_${field}`, levelRunSource.includes(field), `${field} present in LevelRunState campaignDurationSummary`);
}

check("render_game_to_text_duration_payload", telemetrySource.includes("campaignDuration: run.campaignDurationSummary()"), "render_game_to_text exposes campaign duration telemetry");
check("mid_run_cache_runtime", levelRunSource.includes("updateCampaignDurationRewardBeats") && levelRunSource.includes("campaign_duration_mid_run_cache"), "mid-run reward beats have runtime cache events");
check("cycle_depth_telemetry", levelRunSource.includes("objectiveCycleDepthSummary") && levelRunSource.includes("finaleRemixRulesSeen"), "cycle-depth counters exposed");

const failed = checks.filter((entry) => !entry.pass);
const report = {
  generatedAt: new Date().toISOString(),
  campaignCombatTargetSeconds: totalTargetSeconds,
  campaignCombatTargetMinutes: totalTargetSeconds / 60,
  fullCampaignExpectationMinutes: "115-125 including drafts, summaries, overworld movement, and reading",
  arenaCount: Object.keys(expected).length,
  checks
};

fs.writeFileSync(path.join(outDir, "campaign-duration-static.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(outDir, "campaign-duration-static.md"),
  [
    "# Campaign Duration Static Proof",
    "",
    `- combat target: ${totalTargetSeconds}s (${totalTargetSeconds / 60}m)`,
    `- arenas: ${Object.keys(expected).length}`,
    `- failed checks: ${failed.length}`,
    "",
    ...checks.map((entry) => `- ${entry.pass ? "PASS" : "FAIL"} ${entry.id}: ${entry.detail}`)
  ].join("\n")
);

if (failed.length > 0) {
  console.error(`Campaign duration static proof failed: ${failed.map((entry) => entry.id).join(", ")}`);
  process.exit(1);
}

console.log(`Campaign duration static proof passed (${checks.length} checks).`);
