import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const publicUrl = process.env.PUBLIC_GAME_URL;
const cwd = process.cwd();
const outDir = path.join(cwd, "docs", "proof", "milestone58-launch");

if (!publicUrl) {
  throw new Error("PUBLIC_GAME_URL is required, for example PUBLIC_GAME_URL=https://example.com npm run proof:milestone58-launch");
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const normalizedUrl = publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;
const fetchedHtml = await fetchText(normalizedUrl);
assert(fetchedHtml.includes("https://vibej.am/2026/widget.js"), "deployed HTML must include Vibe Jam widget script");

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

await page.goto(`${normalizedUrl}?audio=0&reducedFlash=1&screenShake=0`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => typeof window.render_game_to_text === "function", null, { timeout: 30000 });
await page.waitForFunction(() => typeof window.advanceTime === "function", null, { timeout: 30000 });
await page.waitForSelector("canvas", { timeout: 30000 });
await page.waitForTimeout(1200);

await page.screenshot({ path: path.join(outDir, "milestone58-deployed-menu.png") });
let state = await readState(page);
assert(state.title === "AGI: The Last Alignment", "expected deployed title");
assert(state.mode === "MainMenu", `expected MainMenu on first load, got ${state.mode}`);
assert(await page.locator('script[src="https://vibej.am/2026/widget.js"]').count() === 1, "expected deployed widget script tag");

await press(page, "Enter", 4);
state = await readState(page);
assert(state.mode === "BuildSelect", `expected BuildSelect after start, got ${state.mode}`);
assert(state.selectedBuild?.classId === "accord_striker", "expected default Accord Striker build");
assert(state.selectedBuild?.factionId === "openai_accord", "expected default OpenAI Accord co-mind");
await page.screenshot({ path: path.join(outDir, "milestone58-deployed-build-select.png") });

await press(page, "Enter", 4);
state = await readState(page);
assert(state.mode === "OverworldMap", `expected OverworldMap after build select, got ${state.mode}`);
assert(state.overworld?.mapLabel === "The Alignment Grid", "expected Alignment Grid");
await page.screenshot({ path: path.join(outDir, "milestone58-deployed-overworld.png") });

await press(page, "Enter", 4);
await press(page, "Enter", 4);
await page.evaluate(() => window.advanceTime(1400));
state = await readState(page);
assert(state.mode === "LevelRun", `expected LevelRun after solo launch, got ${state.mode}`);
assert(state.level?.arenaId === "armistice_plaza", "expected Armistice Plaza solo launch");
await page.screenshot({ path: path.join(outDir, "milestone58-deployed-solo-run.png") });

const canvasVisiblePixels = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  if (!canvas) return 0;
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) return -1;
  const width = Math.max(1, Math.min(gl.drawingBufferWidth, 320));
  const height = Math.max(1, Math.min(gl.drawingBufferHeight, 180));
  const sample = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, sample);
  let visible = 0;
  for (let i = 0; i < sample.length; i += 16) {
    if (sample[i] || sample[i + 1] || sample[i + 2] || sample[i + 3]) visible += 1;
  }
  return visible;
});
assert(canvasVisiblePixels > 0, "expected deployed canvas to contain visible pixels");

const supportsHostedServer = await hasHostedServer(normalizedUrl);
const report = {
  ok: true,
  url: normalizedUrl,
  timestamp: new Date().toISOString(),
  checks: {
    htmlStatusOk: true,
    vibeJamWidgetPresent: true,
    noLoginObserved: true,
    renderGameToTextPresent: true,
    advanceTimePresent: true,
    soloFlowReachedArena: true,
    canvasVisiblePixels,
    supportsHostedServer,
    onlineDeployedSmoke: supportsHostedServer ? "supported-by-origin" : "not-supported-by-static-host"
  },
  consoleErrors: errors
};

fs.writeFileSync(path.join(outDir, "deployed-launch-check.json"), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();

if (errors.length) {
  throw new Error(`deployed page emitted console errors: ${errors.join(" | ")}`);
}

console.log(JSON.stringify(report, null, 2));

async function fetchText(url) {
  const response = await fetch(url);
  assert(response.ok, `expected ${url} to return 2xx, got ${response.status}`);
  return response.text();
}

async function hasHostedServer(url) {
  try {
    const health = new URL("healthz", url);
    const response = await fetch(health, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return false;
    const json = await response.json().catch(() => null);
    return json?.ok === true || json?.status === "ok";
  } catch {
    return false;
  }
}

async function readState(page) {
  const raw = await page.evaluate(() => window.render_game_to_text());
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

async function press(page, key, frames = 1) {
  await page.keyboard.press(key);
  await page.evaluate((ms) => window.advanceTime(ms), frames * 80);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
