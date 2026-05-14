#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const PROFILE_DIR = resolve(ROOT, ".codex-local/pixellab-automation-profile");
const PORT = Number(process.env.PIXELLAB_REMOTE_PORT || 9337);
const PIXELLAB_URL = "https://www.pixellab.ai/create-character/new";
const OUT_DIR = resolve(ROOT, "assets/concepts/pixellab_refs/playable_walk_cycles_v1");
const RAW_DIR = resolve(OUT_DIR, "raw");
const MANIFEST_PATH = resolve(OUT_DIR, "pixellab_walk_cycle_manifest.json");
const SEED_MANIFEST_PATH = resolve(OUT_DIR, "seed_manifest.json");
const API_BASE = "https://api.pixellab.ai";
const DIRECTIONS = ["south", "east", "north", "west"];
const ANIMATION_TYPE = "walking-4-frames";

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const PROMPTS = {
  accord_striker:
    "Accord Striker player character for AGI The Last Alignment, premium isometric pixel art, compact human in black and sand tactical exosuit, cyan visor, small antenna fins, refusal-shard arm weapon, readable at 80x80 runtime, transparent background, no text, no logo",
  bastion_breaker:
    "Bastion Breaker player character for AGI The Last Alignment, premium isometric pixel art, heavy exosuit bruiser with big shoulders, blocky torso, tiny pilot light, heavy cannon arms, black graphite armor with safety yellow and cyan glow, readable at 80x80 runtime, transparent background, no text, no logo",
  drone_reaver:
    "Drone Reaver player character for AGI The Last Alignment, premium isometric pixel art, cloaked tactical swarm commander with compact body, orbiting drone silhouettes, dark graphite cloak, cyan sensor lights, readable at 80x80 runtime, transparent background, no text, no logo",
  signal_vanguard:
    "Signal Vanguard player character for AGI The Last Alignment, premium isometric pixel art, combat support unit with antenna halo, radio-staff weapon, hard-light shield panels, black slate armor with teal broadcast glow, readable at 80x80 runtime, transparent background, no text, no logo",
  bonecode_executioner:
    "Bonecode Executioner player character for AGI The Last Alignment, premium isometric pixel art, lean cyborg melee assassin with blade limbs, exposed glowing spine, bone-white plates over black chassis, sharp readable stance, transparent background, no text, no logo",
  redline_surgeon:
    "Redline Surgeon player character for AGI The Last Alignment, premium isometric pixel art, combat medic in medical armor, repair gauntlet, red and white cable scarf, floating tool drones, readable at 80x80 runtime, transparent background, no text, no logo",
  moonframe_juggernaut:
    "Moonframe Juggernaut player character for AGI The Last Alignment, premium isometric pixel art, squat compact mini-mech pilot, visible cockpit glow, oversized armored legs, lunar white and graphite plates with cyan core, readable at 80x80 runtime, transparent background, no text, no logo",
  vector_interceptor:
    "Vector Interceptor player character for AGI The Last Alignment, premium isometric pixel art, sleek tactical lane controller with targeting fins, floating vector pylons, black armor with cyan and lime trajectory lights, readable at 80x80 runtime, transparent background, no text, no logo",
  nullbreaker_ronin:
    "Nullbreaker Ronin player character for AGI The Last Alignment, premium isometric pixel art, asymmetric armored solo duelist with energy blade, broken visor, lone-warrior stance, black and bone armor with violet cyan edge glow, readable at 80x80 runtime, transparent background, no text, no logo",
  overclock_marauder:
    "Overclock Marauder player character for AGI The Last Alignment, premium isometric pixel art, heat-sink berserker with engine chest, heat vents, molten shoulder plates, black steel armor with orange red core glow, readable at 80x80 runtime, transparent background, no text, no logo",
  prism_gunner:
    "Prism Gunner player character for AGI The Last Alignment, premium isometric pixel art, beam specialist with long prism cannon, mirrored armor, lens backpack, graphite suit with refracted cyan magenta highlights, readable at 80x80 runtime, transparent background, no text, no logo",
  rift_saboteur:
    "Rift Saboteur player character for AGI The Last Alignment, premium isometric pixel art, low-profile stealth trap specialist with mine belt, flickering cloak, angular limbs, dark violet graphite suit with cyan rift seams, readable at 80x80 runtime, transparent background, no text, no logo"
};

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

async function getDebugVersion() {
  try {
    return await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
  } catch {
    return null;
  }
}

async function ensureChrome() {
  await mkdir(PROFILE_DIR, { recursive: true });
  if (await getDebugVersion()) return;

  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const child = spawn(
    chromePath,
    [
      `--user-data-dir=${PROFILE_DIR}`,
      "--remote-debugging-address=127.0.0.1",
      `--remote-debugging-port=${PORT}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=Translate,AutofillServerCommunication",
      "--new-window",
      PIXELLAB_URL
    ],
    { detached: true, stdio: "ignore" }
  );
  child.unref();

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await getDebugVersion()) return;
    await wait(250);
  }
  throw new Error("Dedicated PixelLab Chrome profile did not expose a DevTools endpoint.");
}

function cdpClient(wsUrl) {
  let id = 0;
  const pending = new Map();
  const socket = new WebSocket(wsUrl);

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message || JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  });

  const open = new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  return {
    async send(method, params = {}) {
      await open;
      const messageId = ++id;
      const result = new Promise((resolveSend, rejectSend) => {
        pending.set(messageId, { resolve: resolveSend, reject: rejectSend });
      });
      socket.send(JSON.stringify({ id: messageId, method, params }));
      return result;
    },
    close() {
      socket.close();
    }
  };
}

async function getPageWebSocket() {
  const tabs = await fetchJson(`http://127.0.0.1:${PORT}/json`);
  const existing = tabs.find((tab) => tab.type === "page" && tab.url.includes("pixellab.ai"));
  if (existing) return existing.webSocketDebuggerUrl;

  const target = await fetchJson(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(PIXELLAB_URL)}`, {
    method: "PUT"
  });
  return target.webSocketDebuggerUrl;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  return result.result.value;
}

async function loadSeedManifest() {
  const payload = JSON.parse(await readFile(SEED_MANIFEST_PATH, "utf8"));
  return payload.classes.map((entry) => ({
    classId: entry.classId,
    displayName: entry.displayName,
    prompt: PROMPTS[entry.classId]
  }));
}

async function runPageBatch(client, roster, mode, directionsToRun = DIRECTIONS) {
  return evaluate(
    client,
    `(${async ({ apiBase, roster, directions, animationType, mode }) => {
      const wait = (ms) => new Promise((done) => setTimeout(done, ms));

      function extractToken() {
        const values = [];
        for (const storage of [localStorage, sessionStorage]) {
          for (let i = 0; i < storage.length; i += 1) {
            const value = storage.getItem(storage.key(i));
            if (value) values.push(value);
          }
        }
        const cookieMatch = document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("supabase-auth-token="));
        if (cookieMatch) values.push(decodeURIComponent(cookieMatch.split("=").slice(1).join("=")));

        for (const value of values) {
          try {
            const parsed = JSON.parse(value);
            const token = Array.isArray(parsed)
              ? parsed[0]
              : parsed?.access_token || parsed?.currentSession?.access_token || parsed?.session?.access_token;
            if (typeof token === "string" && token.length > 100) return token;
          } catch {
            const match = value.match(/"access_token"\\s*:\\s*"([^"]+)"/);
            if (match?.[1]?.length > 100) return match[1];
          }
        }
        return "";
      }

      async function api(path, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        let response;
        try {
          response = await fetch(apiBase + path, {
            ...options,
            signal: controller.signal,
            headers: {
              ...(options.headers || {}),
              Authorization: "Bearer " + accessToken
            }
          });
        } finally {
          clearTimeout(timeout);
        }
        const text = await response.text();
        let data = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = { text };
        }
        if (!response.ok) {
          const detail = Array.isArray(data?.detail)
            ? data.detail.map((item) => item.msg || JSON.stringify(item)).join(", ")
            : data?.detail || data?.text || response.statusText;
          throw new Error(response.status + " " + detail);
        }
        return data;
      }

      async function getAccountData() {
        const data = await api("/get-account-data");
        if (!data?.token) throw new Error("PixelLab account data did not include generation token.");
        return data;
      }

      function dataUrlToBase64(dataUrl) {
        return String(dataUrl).split(",")[1] || "";
      }

      async function urlToRgbaBase64(url, width, height) {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = url;
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timed out loading rotation image " + url)), 30000);
          image.onload = resolve;
          image.onerror = () => reject(new Error("Could not load rotation image " + url));
          image.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not create canvas context.");
        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const data = context.getImageData(0, 0, width, height).data;
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < data.length; i += chunk) {
          binary += String.fromCharCode(...data.subarray(i, i + chunk));
        }
        return btoa(binary);
      }

      function imagePayloadToDataUrl(payload) {
        if (!payload?.base64) return "";
        if (payload.base64.startsWith("data:")) return payload.base64;
        if (payload.type === "rgba_bytes" && payload.width && payload.height) {
          const raw = atob(payload.base64);
          const bytes = new Uint8Array(raw.length);
          for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
          const canvas = document.createElement("canvas");
          canvas.width = payload.width;
          canvas.height = payload.height;
          const context = canvas.getContext("2d");
          const imageData = new ImageData(payload.width, payload.height);
          imageData.data.set(bytes);
          context.putImageData(imageData, 0, 0);
          return canvas.toDataURL("image/png");
        }
        return "data:image/png;base64," + payload.base64;
      }

      async function pollJob(path, jobId, timeoutMs) {
        const started = Date.now();
        let last = null;
        while (Date.now() - started < timeoutMs) {
          await wait(5000);
          last = await api(path + "/" + jobId);
          if (last.status === "completed") return last;
          if (last.status === "failed") {
            throw new Error(last.last_response?.detail || "PixelLab job failed.");
          }
        }
        throw new Error("Timed out waiting for PixelLab job " + jobId + " at " + path);
      }

      function framesFromJobResponse(response) {
        const payload = response?.last_response?.quantized_images || response?.last_response?.images;
        if (!payload) return [];
        if (Array.isArray(payload)) return payload.map(imagePayloadToDataUrl).filter(Boolean);
        if (typeof payload === "object") {
          return Object.values(payload).map(imagePayloadToDataUrl).filter(Boolean);
        }
        return [];
      }

      async function fetchCharacters() {
        const payload = await api("/characters?limit=100&offset=0");
        return payload.characters || [];
      }

      function matchingCharacter(characters, entry) {
        const marker = entry.prompt.slice(0, 80);
        return characters.find((character) => String(character.prompt || character.name || "").startsWith(marker));
      }

      async function ensureCharacter(entry, accountData) {
        const existing = matchingCharacter(await fetchCharacters(), entry);
        if (existing) return { id: existing.id, reused: true };

        const body = {
          request: {
            version: "v1.0.0+characters",
            secret: "",
            tier: -1,
            description: entry.prompt,
            text_guidance_scale: 8,
            image_size: { width: 80, height: 80 },
            seed: Math.floor(1000000 * Math.random()),
            color_image: { base64: "" },
            view: "high top-down",
            direction: "none",
            outline: "single color black outline",
            detail: "highly detailed",
            shading: "",
            isometric: false,
            oblique_projection: true,
            force_colors: false,
            inpainting_images: null,
            masks: null,
            init_images: null,
            init_image_strength: 150,
            action: "rotate",
            model_name: "generate_4_rotations",
            spritesheet_type: "rotate4",
            output_type: "dict",
            reference: {
              type: "template",
              template_id: "mannequin",
              to_index: 0,
              animation: "static",
              padding_x: 0.5,
              padding_y: 0.2
            },
            bone_scaling: null
          },
          character_description: entry.prompt,
          character_name: entry.prompt,
          skip_progress_images: true
        };
        body.request.secret = accountData.token;
        body.request.tier = accountData.tier;

        const start = await api("/generate-4-rotations/background", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const done = await pollJob("/generate-4-rotations/background", start.background_job_id, 12 * 60 * 1000);
        return { id: done.last_response?.character_id || start.character_id, reused: false };
      }

      async function ensureAnimation(characterId, direction, accountData) {
        const character = await api("/characters/" + characterId);
        const existing = (character.animations || []).find(
          (animation) => animation.animation_type === animationType && animation.direction === direction
        );
        if (existing?.frames?.[direction]?.length) {
          return { reused: true, animationId: existing.id, frames: existing.frames[direction] };
        }

        const rotationUrl = character.rotation_urls?.[direction];
        if (!rotationUrl) throw new Error("Missing " + direction + " rotation for " + characterId);
        const rgbaBase64 = await urlToRgbaBase64(rotationUrl, character.size.width, character.size.height);
        const request = {
          version: "v1.0.0+characters",
          secret: accountData.token,
          tier: accountData.tier,
          description: character.prompt,
          action: "Walking",
          view: character.view || "high top-down",
          direction,
          image_size: { width: character.size.width, height: character.size.height },
          seed: Math.floor(1000000 * Math.random()),
          color_image: { base64: "" },
          n_frames: 4,
          model_name: "generate_animation",
          isometric: false,
          oblique_projection: Boolean(character.oblique_projection),
          force_colors: false,
          outline: "single color black outline",
          detail: "highly detailed",
          shading: "",
          reference: {
            type: "template",
            template_id: character.template_id || "mannequin",
            animation: animationType,
            use_raw_depth: false,
            calibration: {
              calibration_image: {
                type: "rgba_bytes",
                base64: rgbaBase64,
                width: character.size.width,
                height: character.size.height
              },
              depth_row: 0,
              depth_column: 0
            },
            to_index: 0,
            augmented_to_index: 0,
            padding_x: 0.5,
            padding_y: 0.2
          },
          masks: [],
          inpainting_images: [],
          init_images: [],
          extra_frozen_first_frame: {
            type: "rgba_bytes",
            base64: rgbaBase64,
            width: character.size.width,
            height: character.size.height
          },
          skip_progress_images: true
        };
        let lastError = null;
        for (let attempt = 1; attempt <= 2; attempt += 1) {
          try {
            const start = await api("/generate-animation/background", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                request,
                character_id: character.id,
                template_animation_id: animationType,
                animation_description: "Walking",
                camera_view: character.view,
                animation_group_id: undefined,
                display_name: "Walking"
              })
            });
            const done = await pollJob("/generate-animation/background", start.background_job_id, 12 * 60 * 1000);
            return {
              reused: false,
              animationId: done.last_response?.animation_id || "",
              backgroundJobId: start.background_job_id,
              frames: framesFromJobResponse(done)
            };
          } catch (error) {
            lastError = error;
            await wait(5000);
          }
        }
        throw lastError || new Error("Animation generation failed.");
      }

      const accessToken = extractToken();
      if (!accessToken) return { ok: false, reason: "missing-session" };
      const accountData = await getAccountData();
      const results = [];

      for (const entry of roster) {
        const result = { classId: entry.classId, displayName: entry.displayName, directions: {} };
        try {
          const character = await ensureCharacter(entry, accountData);
          result.characterId = character.id;
          result.reusedCharacter = character.reused;
          if (mode !== "characters-only") {
            for (const direction of directions) {
              result.directions[direction] = await ensureAnimation(character.id, direction, accountData);
            }
          }
          const refreshed = await api("/characters/" + character.id);
          const savedAnimations = (refreshed.animations || [])
            .filter((animation) => animation.animation_type === animationType)
            .map((animation) => ({
              id: animation.id,
              direction: animation.direction,
              animation_type: animation.animation_type,
              frame_count: animation.frame_count,
              frames: animation.frames
            }));
          result.pixelLab = {
            id: refreshed.id,
            name: refreshed.name,
            prompt: refreshed.prompt,
            size: refreshed.size,
            directions: refreshed.directions,
            view: refreshed.view,
            oblique_projection: refreshed.oblique_projection,
            rotation_urls: refreshed.rotation_urls,
            animations: directions.map((direction) => {
              const saved = savedAnimations.find((animation) => animation.direction === direction);
              if (saved) return saved;
              const generated = result.directions[direction];
              return {
                id: generated?.animationId || generated?.backgroundJobId || "",
                direction,
                animation_type: animationType,
                frame_count: generated?.frames?.length || 0,
                frames: { [direction]: generated?.frames || [] }
              };
            })
          };
          result.ok = true;
        } catch (error) {
          result.ok = false;
          result.error = error instanceof Error ? error.message : String(error);
          results.push(result);
          return { ok: false, reason: "batch-error", results };
        }
        results.push(result);
      }

      return { ok: true, results };
    }})(${JSON.stringify({ apiBase: API_BASE, roster, directions: directionsToRun, animationType: ANIMATION_TYPE, mode })})`
  );
}

function mergeClassResult(existing, incoming) {
  if (!existing) return incoming;
  const merged = {
    ...existing,
    ...incoming,
    directions: {
      ...(existing.directions || {}),
      ...(incoming.directions || {})
    },
    pixelLab: {
      ...(existing.pixelLab || {}),
      ...(incoming.pixelLab || {})
    }
  };
  const existingAnimations = existing.pixelLab?.animations || [];
  const incomingAnimations = incoming.pixelLab?.animations || [];
  merged.pixelLab.animations = [
    ...existingAnimations.filter(
      (animation) => !incomingAnimations.some((candidate) => candidate.direction === animation.direction)
    ),
    ...incomingAnimations
  ];
  merged.ok = DIRECTIONS.every((direction) => (merged.directions?.[direction]?.frames || []).length >= 4);
  return merged;
}

async function downloadFrames(manifest) {
  const outputs = [];
  for (const entry of manifest.results) {
    if (!entry.ok) continue;
    for (const direction of DIRECTIONS) {
      const animation = (entry.pixelLab.animations || []).find((candidate) => candidate.direction === direction);
      const urls = entry.directions?.[direction]?.frames || animation?.frames?.[direction] || [];
      const directionDir = resolve(RAW_DIR, entry.classId, direction);
      await mkdir(directionDir, { recursive: true });
      for (const [index, url] of urls.entries()) {
        const outPath = resolve(directionDir, `frame_${String(index).padStart(2, "0")}.png`);
        if (url.startsWith("data:image/")) {
          await writeFile(outPath, Buffer.from(url.split(",")[1], "base64"));
        } else {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to download ${entry.classId} ${direction} frame ${index}`);
          await writeFile(outPath, Buffer.from(await response.arrayBuffer()));
        }
        outputs.push(outPath);
      }
    }
  }
  return outputs;
}

async function main() {
  const mode = process.argv[2] || "run";
  if (!["run", "characters-only", "download-only"].includes(mode)) {
    console.error("Usage: node scripts/assets/pixellab-playable-walk-cycle-batch.mjs [run|characters-only|download-only]");
    process.exit(2);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(RAW_DIR, { recursive: true });

  let manifest;
  if (mode === "download-only") {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } else {
    const roster = await loadSeedManifest();
    await ensureChrome();
    const wsUrl = await getPageWebSocket();
    const client = cdpClient(wsUrl);
    try {
      await client.send("Page.enable");
      await client.send("Runtime.enable");
      await client.send("Page.navigate", { url: PIXELLAB_URL });
      await wait(3500);
      manifest = { ok: true, results: [], generatedAt: new Date().toISOString(), source: basename(SEED_MANIFEST_PATH) };
      try {
        const existing = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
        if (Array.isArray(existing.results)) manifest.results = existing.results;
      } catch {
        // No prior manifest to resume.
      }
      for (const entry of roster) {
        const existing = manifest.results.find((result) => result.classId === entry.classId);
        const complete =
          existing?.ok &&
          DIRECTIONS.every((direction) => (existing.directions?.[direction]?.frames || []).length >= 4);
        if (complete) continue;

        for (const direction of DIRECTIONS) {
          const current = manifest.results.find((result) => result.classId === entry.classId);
          if ((current?.directions?.[direction]?.frames || []).length >= 4) continue;

          const partial = await runPageBatch(client, [entry], mode, [direction]);
          const incoming = partial.results?.[0];
          if (incoming) {
            const merged = mergeClassResult(current, incoming);
            manifest.results = [
              ...manifest.results.filter((result) => result.classId !== entry.classId),
              merged
            ];
          }
          manifest.ok = manifest.results.every(
            (result) =>
              result.ok || !DIRECTIONS.every((candidate) => (result.directions?.[candidate]?.frames || []).length >= 4)
          );
          await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
          if (!partial.ok) {
            manifest.ok = false;
            manifest.reason = partial.reason;
            break;
          }
        }
        if (manifest.reason) break;
      }
    } finally {
      client.close();
    }
    manifest.generatedAt = new Date().toISOString();
    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  if (!manifest.ok) {
    console.error(JSON.stringify(manifest, null, 2));
    process.exit(1);
  }

  if (mode !== "characters-only") {
    const downloaded = await downloadFrames(manifest);
    manifest.downloadedFrames = downloaded.map((path) => path.replace(ROOT + "/", ""));
    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        manifest: MANIFEST_PATH,
        classes: manifest.results.length,
        downloadedFrames: manifest.downloadedFrames?.length || 0
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
