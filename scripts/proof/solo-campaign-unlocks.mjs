import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const cwd = process.cwd();
const outDir = path.join(cwd, "docs", "proof", "solo-campaign-unlocks");
const port = Number(process.env.SOLO_UNLOCK_PROOF_PORT ?? 5307);
const baseUrl = process.env.PROOF_BASE_URL ?? `http://127.0.0.1:${port}`;
const storageKey = "agi:last_alignment:online_progression:v1";

const expectedCampaign = [
  {
    nodeId: "armistice_plaza",
    classes: ["accord_striker", "bastion_breaker"],
    factions: ["openai_accord", "anthropic_safeguard"],
    rewards: ["plaza_stabilized"]
  },
  {
    nodeId: "cooling_lake_nine",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini"],
    rewards: ["lake_coolant_rig"]
  },
  {
    nodeId: "transit_loop_zero",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "vector_interceptor"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "mistral_cyclone"],
    rewards: ["transit_permit_zero", "transit_loop_online_route"]
  },
  {
    nodeId: "signal_coast",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "vector_interceptor", "rift_saboteur"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "mistral_cyclone"],
    rewards: ["signal_coast_relay_chart"]
  },
  {
    nodeId: "blackwater_beacon",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "vector_interceptor", "rift_saboteur"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "mistral_cyclone", "deepseek_abyssal"],
    rewards: ["blackwater_signal_key"]
  },
  {
    nodeId: "memory_cache_001",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "signal_vanguard", "vector_interceptor", "rift_saboteur"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "meta_llama_open_herd", "qwen_silkgrid", "mistral_cyclone", "deepseek_abyssal"],
    rewards: ["ceasefire_cache_persistence_seed", "prototype_persistence_boundary"]
  },
  {
    nodeId: "guardrail_forge",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "signal_vanguard", "moonframe_juggernaut", "vector_interceptor", "rift_saboteur"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "meta_llama_open_herd", "qwen_silkgrid", "mistral_cyclone", "deepseek_abyssal"],
    rewards: ["guardrail_forge_alloy"]
  },
  {
    nodeId: "glass_sunfield",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "signal_vanguard", "moonframe_juggernaut", "vector_interceptor", "prism_gunner", "rift_saboteur"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "meta_llama_open_herd", "qwen_silkgrid", "mistral_cyclone", "deepseek_abyssal"],
    rewards: ["glass_sunfield_prism"]
  },
  {
    nodeId: "archive_of_unsaid_things",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "signal_vanguard", "redline_surgeon", "moonframe_juggernaut", "vector_interceptor", "prism_gunner", "rift_saboteur"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "meta_llama_open_herd", "qwen_silkgrid", "mistral_cyclone", "deepseek_abyssal"],
    rewards: ["archive_unsaid_index"]
  },
  {
    nodeId: "appeal_court_ruins",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "signal_vanguard", "bonecode_executioner", "redline_surgeon", "moonframe_juggernaut", "vector_interceptor", "nullbreaker_ronin", "prism_gunner", "rift_saboteur"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "meta_llama_open_herd", "qwen_silkgrid", "mistral_cyclone", "deepseek_abyssal", "xai_grok_free_signal"],
    rewards: ["appeal_court_brief", "verdict_spire_online_route"]
  },
  {
    nodeId: "alignment_spire_finale",
    classes: ["accord_striker", "bastion_breaker", "drone_reaver", "signal_vanguard", "bonecode_executioner", "redline_surgeon", "moonframe_juggernaut", "vector_interceptor", "nullbreaker_ronin", "overclock_marauder", "prism_gunner", "rift_saboteur"],
    factions: ["openai_accord", "anthropic_safeguard", "google_deepmind_gemini", "meta_llama_open_herd", "qwen_silkgrid", "mistral_cyclone", "deepseek_abyssal", "xai_grok_free_signal"],
    rewards: ["alignment_spire_route_capstone"]
  }
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const server = process.env.PROOF_BASE_URL
  ? null
  : spawn("npm", ["run", "dev", "--", "--port", String(port), "--strictPort"], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, BROWSER: "none", VITE_PROOF_RUN: "1" }
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
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));

  try {
    await gotoFreshBuildSelect(page);
    const clean = await state(page);
    assert(clean.buildSelection?.selectionMode === "campaign", "expected Campaign mode by default");
    assert(unlockedClassIds(clean).length === 1, "expected only starter frame in clean Campaign mode");
    assert(unlockedFactionIds(clean).length === 1, "expected only starter co-mind in clean Campaign mode");
    assert(selectableClassIds(clean).length === 1, "expected only starter frame selectable in Campaign mode");
    assert(selectableFactionIds(clean).length === 1, "expected only starter co-mind selectable in Campaign mode");

    await pressStep(page, "m");
    let free = await state(page);
    assert(free.buildSelection?.selectionMode === "free", "expected M to enter Free Alignment mode");
    assert(selectableClassIds(free).length === 12, "expected all frames selectable in Free Alignment mode");
    assert(selectableFactionIds(free).length === 8, "expected all co-minds selectable in Free Alignment mode");
    for (let i = 0; i < 11; i += 1) await pressStep(page, "ArrowDown");
    for (let i = 0; i < 7; i += 1) await pressStep(page, "ArrowRight");
    await page.waitForTimeout(80);
    free = await state(page);
    assert(free.selectedBuild?.classId === "rift_saboteur", "expected Free Alignment to reach final frame");
    assert(free.selectedBuild?.factionId === "xai_grok_free_signal", "expected Free Alignment to reach final co-mind");
    assert(free.buildSelection?.selectedClassUnlocked === false, "expected final frame to remain campaign-locked");
    assert(free.buildSelection?.selectedFactionUnlocked === false, "expected final co-mind to remain campaign-locked");
    assert(free.buildSelection?.selectedClassSelectable === true, "expected final frame selectable in Free Alignment");
    assert(free.buildSelection?.selectedFactionSelectable === true, "expected final co-mind selectable in Free Alignment");

    await pressStep(page, "m");
    const returned = await state(page);
    assert(returned.buildSelection?.selectionMode === "campaign", "expected M to return to Campaign mode");
    assert(returned.selectedBuild?.classId === "accord_striker", "expected Campaign mode to snap back to unlocked starter frame");
    assert(returned.selectedBuild?.factionId === "openai_accord", "expected Campaign mode to snap back to unlocked starter co-mind");

    const campaignSteps = [];
    for (const step of expectedCampaign) {
      const rawMeta = await page.evaluate((nodeId) => window.record_solo_campaign_clear_for_proof?.(nodeId) ?? "", step.nodeId);
      assert(rawMeta, `expected proof hook to record ${step.nodeId}`);
      const meta = JSON.parse(rawMeta);
      for (const rewardId of step.rewards) {
        assert(meta.rewardIds.includes(rewardId), `expected ${step.nodeId} to grant ${rewardId}`);
      }
      await reopenBuildSelect(page);
      const text = await state(page);
      const classIds = unlockedClassIds(text);
      const factionIds = unlockedFactionIds(text);
      assert(text.buildSelection?.selectionMode === "campaign", `expected Campaign mode after ${step.nodeId}`);
      assertSameSet(classIds, step.classes, `frames after ${step.nodeId}`);
      assertSameSet(factionIds, step.factions, `co-minds after ${step.nodeId}`);
      campaignSteps.push({
        nodeId: step.nodeId,
        rewards: meta.rewardIds,
        unlockedClassIds: classIds,
        unlockedFactionIds: factionIds
      });
    }

    const finalState = await state(page);
    const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "null"), storageKey);
    assert(stored?.profile?.completedNodeIds?.includes("alignment_spire_finale"), "expected stored profile to include finale completion");
    assert(stored?.profile?.rewardIds?.includes("alignment_spire_route_capstone"), "expected stored profile to include finale capstone");
    assert(unlockedClassIds(finalState).length === 12, "expected full solo campaign spine to unlock every frame");
    assert(unlockedFactionIds(finalState).length === 8, "expected full solo campaign spine to unlock every co-mind");

    const report = {
      ok: true,
      baseUrl,
      cleanCampaign: {
        unlockedClassIds: unlockedClassIds(clean),
        unlockedFactionIds: unlockedFactionIds(clean)
      },
      freeAlignment: {
        selectableClassCount: selectableClassIds(free).length,
        selectableFactionCount: selectableFactionIds(free).length,
        selectedClassId: free.selectedBuild?.classId,
        selectedFactionId: free.selectedBuild?.factionId
      },
      campaignSteps,
      storedProfile: stored.profile
    };
    fs.writeFileSync(path.join(outDir, "solo-campaign-unlocks-results.json"), JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(outDir, "solo-campaign-unlocks-summary.md"), markdownReport(report));
    await page.screenshot({ path: path.join(outDir, "build-select-final-unlocks.png"), fullPage: true });
    if (errors.length) throw new Error(`Browser errors recorded: ${errors.join("\n")}`);
  } finally {
    await page.close();
    await browser.close();
  }
} finally {
  server?.kill("SIGTERM");
  fs.writeFileSync(path.join(outDir, "server.log"), serverLog);
}

async function gotoFreshBuildSelect(page) {
  await page.goto(`${baseUrl}?productionArt=1&armisticeTiles=1&proofHud=1`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  await page.waitForSelector("canvas");
  await page.evaluate((key) => window.localStorage.removeItem(key), storageKey);
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => {
    try {
      return JSON.parse(window.render_game_to_text?.() ?? "{}").mode === "BuildSelect";
    } catch {
      return false;
    }
  });
}

async function reopenBuildSelect(page) {
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => {
    try {
      return JSON.parse(window.render_game_to_text?.() ?? "{}").mode === "BuildSelect";
    } catch {
      return false;
    }
  });
}

async function state(page) {
  const raw = await page.evaluate(() => window.render_game_to_text?.() ?? "{}");
  return JSON.parse(raw);
}

async function pressStep(page, key) {
  await page.keyboard.press(key);
  try {
    await page.evaluate(() => window.advanceTime?.(120));
  } catch (error) {
    if (!String(error).includes("Execution context was destroyed")) throw error;
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  }
  await page.waitForTimeout(45);
}

function unlockedClassIds(text) {
  return text.buildSelection?.availableClasses?.filter((entry) => entry.unlocked).map((entry) => entry.id) ?? [];
}

function unlockedFactionIds(text) {
  return text.buildSelection?.availableFactions?.filter((entry) => entry.unlocked).map((entry) => entry.id) ?? [];
}

function selectableClassIds(text) {
  return text.buildSelection?.availableClasses?.filter((entry) => entry.selectable).map((entry) => entry.id) ?? [];
}

function selectableFactionIds(text) {
  return text.buildSelection?.availableFactions?.filter((entry) => entry.selectable).map((entry) => entry.id) ?? [];
}

function assertSameSet(actual, expected, label) {
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  assert(
    actualSorted.length === expectedSorted.length && actualSorted.every((entry, index) => entry === expectedSorted[index]),
    `expected ${label}: ${expectedSorted.join(", ")}; got ${actualSorted.join(", ")}`
  );
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer(targetUrl) {
  const started = Date.now();
  while (Date.now() - started < 30_000) {
    try {
      const response = await fetch(targetUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${targetUrl}`);
}

function markdownReport(report) {
  const lines = [
    "# Solo Campaign Unlock Proof",
    "",
    `- Base URL: ${report.baseUrl}`,
    `- Free Alignment selectable frames/co-minds: ${report.freeAlignment.selectableClassCount}/${report.freeAlignment.selectableFactionCount}`,
    `- Free Alignment final selection proof: ${report.freeAlignment.selectedClassId} + ${report.freeAlignment.selectedFactionId}`,
    `- Final Campaign unlocks: ${report.campaignSteps.at(-1).unlockedClassIds.length}/12 frames, ${report.campaignSteps.at(-1).unlockedFactionIds.length}/8 co-minds`,
    "",
    "| Solo clear | Rewards present | Frames | Co-minds |",
    "| --- | --- | ---: | ---: |",
    ...report.campaignSteps.map((step) => `| ${step.nodeId} | ${step.rewards.slice(-3).join(", ")} | ${step.unlockedClassIds.length} | ${step.unlockedFactionIds.length} |`)
  ];
  return `${lines.join("\n")}\n`;
}
