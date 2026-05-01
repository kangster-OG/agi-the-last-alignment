import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const outDir = path.join(cwd, "docs", "proof", "release-checklist");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const checks = [];

function check(id, ok, detail) {
  checks.push({ id, ok: Boolean(ok), detail });
}

function read(file) {
  return fs.readFileSync(path.join(cwd, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(cwd, file));
}

const packageJson = JSON.parse(read("package.json"));
const indexHtml = read("index.html");
const gitignore = read(".gitignore");

check("vibejam_widget", indexHtml.includes('<script async src="https://vibej.am/2026/widget.js"></script>'), "index.html includes required Vibe Jam widget script");
check("readme_release_candidate", read("README.md").includes("Release Candidate") && read("README.md").includes("No login or signup"), "README describes RC play/deploy/no-login requirements");
check("license_present", exists("LICENSE"), "LICENSE exists");
check("provenance_present", exists("ART_PROVENANCE.md") && read("ART_PROVENANCE.md").includes("third-party"), "ART_PROVENANCE.md exists and mentions third-party provenance");
check("brand_policy_present", exists("docs/BRAND_ASSET_POLICY.md"), "brand asset policy exists");
check("deployment_docs_present", exists("docs/DEPLOYMENT.md") && exists("render.yaml"), "deployment doc and Render blueprint exist");
check("quality_lock_present", exists("docs/QUALITY_LOCK.md") && exists("docs/RELEASE_CANDIDATE.md"), "quality lock and release candidate docs exist");
check("codex_local_ignored", gitignore.includes(".codex-local/"), ".codex-local is ignored");
check("dist_ignored", gitignore.includes("dist/"), "dist build output is ignored");

const requiredScripts = [
  "build",
  "start",
  "proof:assets",
  "proof:release-checklist",
  "proof:campaign-full",
  "proof:milestone56-quality-lock",
  "proof:milestone55-online-robustness",
  "proof:smoke"
];
for (const script of requiredScripts) {
  check(`script_${script}`, Boolean(packageJson.scripts?.[script]), `package script ${script} exists`);
}

const requiredProofArtifacts = [
  "docs/proof/campaign-full/campaign-full-finale-complete.json",
  "docs/proof/campaign-full/campaign-full-finale-complete.png",
  "docs/proof/milestone56-quality-lock/milestone56-small-viewport-menu.png",
  "docs/proof/milestone56-quality-lock/milestone56-long-session-budget.json",
  "docs/proof/milestone55-online-robustness/milestone55-rejoined-slot.json",
  "docs/proof/smoke/arena.json"
];
for (const artifact of requiredProofArtifacts) {
  check(`artifact_${artifact}`, exists(artifact), `${artifact} exists`);
}

const finale = JSON.parse(read("docs/proof/campaign-full/campaign-full-finale-complete.json"));
check("campaign_finale_complete", finale.online?.summary?.nodeId === "alignment_spire_finale", "campaign-full proof reaches finale completion");
check("campaign_finale_reward", finale.online?.summary?.rewards?.rewardId === "alignment_spire_route_capstone", "campaign-full proof grants finale capstone");
check("quality_gate_policy", finale.qualityGate?.policy === "milestone56_proof_performance_compatibility_accessibility_lock", "M56 quality gate is proof-visible");
check("route_profile_boundary", !("objectives" in (finale.online?.persistence?.profile ?? {})) && !("combat" in (finale.online?.persistence?.profile ?? {})), "final route profile omits live state");

const ok = checks.every((entry) => entry.ok);
const result = {
  ok,
  policy: "milestone57_release_candidate_packaging_checklist",
  checkedAt: new Date().toISOString(),
  checks
};

fs.writeFileSync(path.join(outDir, "release-checklist.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

if (!ok) {
  process.exitCode = 1;
}

