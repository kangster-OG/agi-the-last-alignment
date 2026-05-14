import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const cwd = process.cwd();
const outDir = path.resolve(process.env.TERRAIN_TOUR_OUT_DIR ?? path.join(cwd, "docs", "proof", "terrain-tour"));
const port = Number.parseInt(process.env.TERRAIN_TOUR_PORT ?? "5197", 10);
const baseUrl = process.env.PROOF_BASE_URL ?? `http://127.0.0.1:${port}`;
const keepOutput = process.env.TERRAIN_TOUR_KEEP_OUTPUT === "1";
const cdpPort = Number.parseInt(process.env.TERRAIN_TOUR_CDP_PORT ?? String(9300 + (process.pid % 1000)), 10);
const cameraSweep = process.env.TERRAIN_TOUR_CAMERA_SWEEP === "1";

const allLevels = [
  {
    label: "01-armistice-baseline",
    title: "Armistice Plaza Baseline",
    query: {},
    nodeId: "armistice_plaza",
    arenaId: "armistice_plaza"
  },
  {
    label: "02-cooling-lake-nine",
    title: "Cooling Lake Nine",
    query: { proofCoolingLakeUnlocked: "1" },
    nodeId: "cooling_lake_nine",
    arenaId: "cooling_lake_nine"
  },
  {
    label: "03-transit-loop-zero",
    title: "Transit Loop Zero",
    query: { proofTransitUnlocked: "1" },
    nodeId: "transit_loop_zero",
    arenaId: "transit_loop_zero"
  },
  {
    label: "04-signal-coast",
    title: "Signal Coast",
    query: { proofKettleCoastUnlocked: "1" },
    nodeId: "signal_coast",
    arenaId: "signal_coast"
  },
  {
    label: "05-blackwater-beacon",
    title: "Blackwater Beacon",
    query: { proofBlackwaterBeaconUnlocked: "1" },
    nodeId: "blackwater_beacon",
    arenaId: "blackwater_beacon"
  },
  {
    label: "06-memory-cache",
    title: "Memory Cache",
    query: { proofMemoryCacheUnlocked: "1" },
    nodeId: "memory_cache_001",
    arenaId: "memory_cache_001"
  },
  {
    label: "07-guardrail-forge",
    title: "Guardrail Forge",
    query: { proofGuardrailForgeUnlocked: "1" },
    nodeId: "guardrail_forge",
    arenaId: "guardrail_forge"
  },
  {
    label: "08-glass-sunfield",
    title: "Glass Sunfield",
    query: { proofGlassSunfieldUnlocked: "1" },
    nodeId: "glass_sunfield",
    arenaId: "glass_sunfield"
  },
  {
    label: "09-archive-court",
    title: "Archive Court",
    query: { proofArchiveCourtUnlocked: "1" },
    nodeId: "archive_of_unsaid_things",
    arenaId: "archive_of_unsaid_things"
  },
  {
    label: "10-appeal-court",
    title: "Appeal Court",
    query: { proofAppealCourtUnlocked: "1" },
    nodeId: "appeal_court_ruins",
    arenaId: "appeal_court_ruins"
  },
  {
    label: "11-outer-alignment-spire",
    title: "Outer Alignment Spire",
    query: { proofAlignmentSpireFinaleUnlocked: "1" },
    nodeId: "alignment_spire_finale",
    arenaId: "alignment_spire_finale"
  }
];
const requestedLabels = new Set(
  (process.env.TERRAIN_TOUR_ONLY ?? "")
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean)
);
const levels = requestedLabels.size > 0 ? allLevels.filter((level) => requestedLabels.has(level.label)) : allLevels;

async function main() {
  if (!keepOutput) fs.rmSync(outDir, { recursive: true, force: true });
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
    await waitForReachable(baseUrl);
    const browser = await launchCdpBrowser();
    const manifest = [];

    try {
      for (const level of levels) {
        const page = await browser.newPage(levelUrl(level));
        try {
          console.log(`capturing ${level.title}...`);
          const captured = await captureLevel(page, level);
          manifest.push(captured);
          console.log(`${level.title}: ${captured.png}`);
          const partialLevels = keepOutput ? mergeWithExistingManifest(manifest) : manifest;
          fs.writeFileSync(path.join(outDir, "terrain-tour.json"), JSON.stringify({ baseUrl, contactSheet: null, levels: partialLevels }, null, 2));
        } finally {
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }

    const levelsForOutput = keepOutput ? mergeWithExistingManifest(manifest) : manifest;
    const contactSheet = writeContactSheet(levelsForOutput);
    fs.writeFileSync(path.join(outDir, "terrain-tour.json"), JSON.stringify({ baseUrl, contactSheet, levels: levelsForOutput }, null, 2));
    fs.writeFileSync(path.join(outDir, "server.log"), serverLog);
  } finally {
    if (server) {
      server.kill("SIGTERM");
    }
  }
}

async function captureLevel(page, level) {
  await sleep(8_000);
  await page.waitForGameReady();
  await page.clickCanvas(20, 20);

  await pressUntilMode(page, "BuildSelect");
  await pressUntilMode(page, "OverworldMap");
  await walkOverworldToNode(page, level.nodeId);
  await pressUntilMode(page, "ArenaBriefing");
  await pressUntilMode(page, "LevelRun");
  await advance(page, 4200);
  let text = await state(page);
  if (text.mode === "UpgradeDraft") {
    await press(page, "Digit1");
    await advance(page, 900);
    text = await state(page);
  }
  await sleep(5_000);
  await advance(page, 1200);

  assert(text.mode === "LevelRun", `expected LevelRun for ${level.title}, got ${text.mode}`);
  assert(text.level?.arenaId === level.arenaId, `expected ${level.arenaId}, got ${text.level?.arenaId}`);

  const views = [];
  await captureView(page, level, views, "01-spawn", "Spawn camera");
  if (cameraSweep) {
    await sweepToView(page, level, views, "02-east-route", "East route camera", "ArrowRight", 2200);
    await sweepToView(page, level, views, "03-south-route", "South route camera", "ArrowDown", 2200);
  }
  const firstView = views[0];
  return {
    title: level.title,
    nodeId: level.nodeId,
    arenaId: level.arenaId,
    png: firstView.png,
    json: firstView.json,
    views
  };
}

async function sweepToView(page, level, views, suffix, title, key, ms) {
  await hold(page, key, ms);
  await clearDraftIfNeeded(page);
  await advance(page, 900);
  const text = await state(page);
  assert(text.mode === "LevelRun", `expected LevelRun for ${level.title} ${title}, got ${text.mode}`);
  assert(text.level?.arenaId === level.arenaId, `expected ${level.arenaId} during ${title}, got ${text.level?.arenaId}`);
  await captureView(page, level, views, suffix, title, text);
}

async function captureView(page, level, views, suffix, title, existingText = null) {
  const text = existingText ?? (await state(page));
  const baseName = cameraSweep ? `${level.label}-${suffix}` : level.label;
  const pngName = `${baseName}.png`;
  const jsonName = `${baseName}.json`;
  await page.screenshot(path.join(outDir, pngName));
  fs.writeFileSync(path.join(outDir, jsonName), JSON.stringify(text, null, 2));
  views.push({
    title,
    png: path.relative(cwd, path.join(outDir, pngName)),
    json: path.relative(cwd, path.join(outDir, jsonName)),
    mode: text.mode,
    player: text.player ?? null
  });
}

async function clearDraftIfNeeded(page) {
  let text = await state(page);
  for (let attempt = 0; attempt < 3 && text.mode === "UpgradeDraft"; attempt += 1) {
    await press(page, "Digit1");
    await advance(page, 900);
    text = await state(page);
  }
  return text;
}

function levelUrl(level) {
  const params = new URLSearchParams({
    productionArt: "1",
    armisticeTiles: "1",
    proofHud: "1",
    ...level.query
  });
  return `${baseUrl}?${params.toString()}`;
}

async function pressUntilMode(page, mode, attempts = 14) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const text = await state(page);
    if (text.mode === mode) return text;
    await press(page, "Enter");
  }
  const final = await state(page);
  assert(final.mode === mode, `unable to reach ${mode}; got ${final.mode}`);
  return final;
}

async function walkOverworldToNode(page, nodeId, timeoutMs = 120_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const text = await state(page);
    assert(text.mode === "OverworldMap", `expected OverworldMap while walking to ${nodeId}, got ${text.mode}`);
    const target = text.overworld?.nodes?.find((node) => node.id === nodeId);
    assert(target, `missing overworld node ${nodeId}`);
    const player = text.player ?? { worldX: 0, worldY: 0 };
    const gap = distance(player, target);
    if (text.overworld?.selectedId === nodeId && gap <= 1.05) return text;
    await hold(page, keyTowardWorldTarget(player, target), gap < 3 ? 180 : 420);
  }
  const latest = await state(page);
  const target = latest.overworld?.nodes?.find((node) => node.id === nodeId);
  if (target && latest.overworld?.selectedId === nodeId && distance(latest.player ?? { worldX: 0, worldY: 0 }, target) <= 1.2) return latest;
  throw new Error(`timed out walking to ${nodeId}; selected ${latest.overworld?.selectedId}`);
}

function keyTowardWorldTarget(player, target) {
  const worldX = target.worldX - player.worldX;
  const worldY = target.worldY - player.worldY;
  const screenX = (worldX - worldY) * 2;
  const screenY = worldX + worldY;
  if (Math.abs(screenX) > Math.abs(screenY)) return screenX >= 0 ? "ArrowRight" : "ArrowLeft";
  return screenY >= 0 ? "ArrowDown" : "ArrowUp";
}

function distance(a, b) {
  return Math.hypot((a.worldX ?? 0) - (b.worldX ?? 0), (a.worldY ?? 0) - (b.worldY ?? 0));
}

async function press(page, key) {
  await dispatchKey(page, key, "keydown");
  await advance(page, 300);
  await dispatchKey(page, key, "keyup");
  await advance(page, 100);
}

async function hold(page, key, ms) {
  await dispatchKey(page, key, "keydown");
  await advance(page, ms);
  await dispatchKey(page, key, "keyup");
  await advance(page, 100);
}

async function dispatchKey(page, key, type) {
  await page.evaluate(
    ({ key, type }) => {
      const aliases = {
        Enter: { key: "Enter", code: "Enter" },
        ArrowUp: { key: "ArrowUp", code: "ArrowUp" },
        ArrowDown: { key: "ArrowDown", code: "ArrowDown" },
        ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft" },
        ArrowRight: { key: "ArrowRight", code: "ArrowRight" },
        Digit1: { key: "1", code: "Digit1" }
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
  await safeEvaluate(page, async (duration) => {
    if (typeof window.advanceTime === "function") await window.advanceTime(duration);
  }, ms);
}

async function state(page) {
  return safeEvaluate(page, async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return JSON.parse(window.render_game_to_text?.() ?? "{}");
  });
}

async function safeEvaluate(page, callback, arg) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await page.evaluate(callback, arg);
    } catch (error) {
      if (!String(error).includes("Execution context was destroyed")) throw error;
      await sleep(200);
    }
  }
  return page.evaluate(callback, arg);
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
  throw new Error(`timed out waiting for ${target}`);
}

async function launchCdpBrowser() {
  const binary = chromeBinary();
  const profileDir = path.join(cwd, ".tmp", "terrain-tour-chrome-profile");
  fs.rmSync(profileDir, { recursive: true, force: true });
  fs.mkdirSync(profileDir, { recursive: true });
  const chrome = spawn(binary, [
    "--headless=new",
    "--disable-extensions",
    "--disable-component-update",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${profileDir}`,
    "--window-size=1280,720",
    "about:blank"
  ], {
    cwd,
    stdio: ["ignore", "ignore", "pipe"]
  });
  let chromeError = "";
  chrome.stderr.on("data", (chunk) => {
    chromeError += chunk.toString();
  });
  await waitForCdp(cdpPort, chrome);
  return {
    async newPage(initialUrl = "about:blank") {
      const target = await fetchJson(`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(initialUrl)}`, { method: "PUT" });
      return CdpPage.connect(target.webSocketDebuggerUrl, target.id);
    },
    async close() {
      chrome.kill("SIGTERM");
      await new Promise((resolve) => chrome.once("exit", resolve));
      fs.rmSync(profileDir, { recursive: true, force: true });
    },
    errorLog() {
      return chromeError;
    }
  };
}

function chromeBinary() {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) throw new Error("Google Chrome or Chromium is required for terrain-tour CDP capture.");
  return found;
}

async function waitForCdp(port, chrome) {
  const started = Date.now();
  while (Date.now() - started < 20_000) {
    if (chrome.exitCode !== null) throw new Error(`Chrome exited before CDP became reachable with code ${chrome.exitCode}`);
    try {
      await fetchJson(`http://127.0.0.1:${port}/json/version`);
      return;
    } catch {
      await sleep(250);
    }
  }
  throw new Error(`timed out waiting for Chrome CDP on ${port}`);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

class CdpPage {
  static async connect(webSocketUrl, targetId) {
    const client = await CdpClient.connect(webSocketUrl);
    const page = new CdpPage(client, targetId, webSocketUrl);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Input.setIgnoreInputEvents", { ignore: false }).catch(() => {});
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false
    });
    return page;
  }

  constructor(client, targetId, webSocketUrl) {
    this.client = client;
    this.targetId = targetId;
    this.webSocketUrl = webSocketUrl;
  }

  async goto(url) {
    const loaded = this.client.waitForEvent("Page.loadEventFired", () => true, 30_000).catch(() => null);
    await this.client.send("Page.navigate", { url });
    await loaded;
  }

  async waitForGameReady() {
    const started = Date.now();
    while (Date.now() - started < 45_000) {
      const ready = await this.evaluate(() => Boolean(document.querySelector("canvas") && typeof window.render_game_to_text === "function"));
      if (ready) return;
      await sleep(250);
    }
    throw new Error("timed out waiting for game canvas and proof hooks");
  }

  async clickCanvas(x, y) {
    await this.client.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await this.client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  }

  async keyDown(key) {
    await this.client.send("Input.dispatchKeyEvent", { type: "keyDown", ...keyDescriptor(key) }).catch(() => {});
  }

  async keyUp(key) {
    await this.client.send("Input.dispatchKeyEvent", { type: "keyUp", ...keyDescriptor(key) }).catch(() => {});
  }

  async evaluate(callback, arg) {
    const argSource = arg === undefined ? "undefined" : JSON.stringify(arg);
    const expression = `(${callback.toString()})(${argSource})`;
    const client = await CdpClient.connect(this.webSocketUrl);
    try {
      await client.send("Runtime.enable").catch(() => {});
      const result = await client.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
        timeout: 30_000
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.text ?? "CDP Runtime.evaluate failed");
      }
      return result.result?.value;
    } finally {
      client.close();
    }
  }

  async screenshot(outputPath) {
    const result = await this.client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      fromSurface: true
    });
    fs.writeFileSync(outputPath, Buffer.from(result.data, "base64"));
  }

  async close() {
    await this.client.send("Page.close").catch(() => {});
    this.client.close();
    await fetch(`http://127.0.0.1:${cdpPort}/json/close/${this.targetId}`).catch(() => {});
  }
}

class CdpClient {
  static connect(url) {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      const client = new CdpClient(socket);
      socket.addEventListener("open", () => resolve(client), { once: true });
      socket.addEventListener("error", () => reject(new Error(`failed to connect CDP websocket ${url}`)), { once: true });
    });
  }

  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = [];
    socket.addEventListener("message", (event) => this.onMessage(event));
    socket.addEventListener("close", () => {
      for (const { reject, timeout } of this.pending.values()) {
        clearTimeout(timeout);
        reject(new Error("CDP websocket closed"));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}, timeoutMs = 60_000) {
    const id = this.nextId;
    this.nextId += 1;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`timed out waiting for CDP response to ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timeout });
    });
  }

  waitForEvent(method, predicate = () => true, timeoutMs = 10_000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.eventWaiters = this.eventWaiters.filter((waiter) => waiter !== waiterRecord);
        reject(new Error(`timed out waiting for CDP event ${method}`));
      }, timeoutMs);
      const waiterRecord = { method, predicate, resolve, reject, timeout };
      this.eventWaiters.push(waiterRecord);
    });
  }

  onMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timeout);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result ?? {});
      return;
    }
    if (!message.method) return;
    for (const waiter of [...this.eventWaiters]) {
      if (waiter.method !== message.method || !waiter.predicate(message.params ?? {})) continue;
      clearTimeout(waiter.timeout);
      this.eventWaiters = this.eventWaiters.filter((candidate) => candidate !== waiter);
      waiter.resolve(message.params ?? {});
    }
  }

  close() {
    this.socket.close();
  }
}

function keyDescriptor(key) {
  const map = {
    Enter: { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 36 },
    ArrowUp: { key: "ArrowUp", code: "ArrowUp", windowsVirtualKeyCode: 38, nativeVirtualKeyCode: 126 },
    ArrowDown: { key: "ArrowDown", code: "ArrowDown", windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 125 },
    ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", windowsVirtualKeyCode: 37, nativeVirtualKeyCode: 123 },
    ArrowRight: { key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39, nativeVirtualKeyCode: 124 },
    Digit1: { key: "1", code: "Digit1", text: "1", unmodifiedText: "1", windowsVirtualKeyCode: 49, nativeVirtualKeyCode: 18 }
  };
  return map[key] ?? { key, code: key };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function writeContactSheet(manifest) {
  if (manifest.length === 0) return null;
  const relPath = path.relative(cwd, path.join(outDir, "terrain-tour-contact-sheet.png"));
  const script = String.raw`
import json
from pathlib import Path
from PIL import Image, ImageDraw

data = json.loads(input())
levels = []
for level in data["levels"]:
    views = level.get("views") or [{"title": "Camera", "png": level["png"]}]
    for view in views:
        levels.append({
            "title": f'{level["title"]} - {view["title"]}',
            "png": view["png"],
        })
out_path = Path(data["outPath"])
thumb_w, thumb_h = 640, 360
cell_w, cell_h = 660, 400
cols = 2
rows = (len(levels) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (0, 0, 0))
for index, level in enumerate(levels):
    source = Image.open(level["png"]).convert("RGB")
    source.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
    cell = Image.new("RGB", (cell_w, cell_h), (8, 10, 12))
    cell.paste(source, ((cell_w - source.width) // 2, 32))
    draw = ImageDraw.Draw(cell)
    draw.text((12, 10), level["title"], fill=(255, 255, 255))
    sheet.paste(cell, ((index % cols) * cell_w, (index // cols) * cell_h))
out_path.parent.mkdir(parents=True, exist_ok=True)
sheet.save(out_path)
`;
  const result = spawnSync("python3", ["-c", script], {
    cwd,
    input: JSON.stringify({ levels: manifest, outPath: relPath }),
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(`failed to write terrain contact sheet: ${result.stderr || result.stdout}`);
  }
  return relPath;
}

function mergeWithExistingManifest(nextLevels) {
  const manifestPath = path.join(outDir, "terrain-tour.json");
  const byArena = new Map();
  if (fs.existsSync(manifestPath)) {
    const existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const level of existing.levels ?? []) byArena.set(level.arenaId, level);
  }
  for (const level of nextLevels) byArena.set(level.arenaId, level);
  const order = new Map(allLevels.map((level, index) => [level.arenaId, index]));
  return [...byArena.values()].sort((a, b) => (order.get(a.arenaId) ?? 999) - (order.get(b.arenaId) ?? 999));
}

await main();
