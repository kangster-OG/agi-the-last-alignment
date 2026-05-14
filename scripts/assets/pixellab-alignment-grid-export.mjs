#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const PROFILE_DIR = resolve(ROOT, ".codex-local/pixellab-automation-profile");
const REMOTE_DEBUGGING_PORT = Number(process.env.PIXELLAB_REMOTE_PORT || 9337);
const PIXELLAB_URL = "https://www.pixellab.ai/create-object";
const API_BASE = "https://api.pixellab.ai";
const PROMPT_NEEDLE =
  "Transparent 128x128 isometric pixel-art object batch for AGI The Last Alignment Alignment Grid overworld";
const OUT_ZIP = resolve(
  ROOT,
  "assets/concepts/pixellab_refs/alignment_grid_rebuild_v1/alignment_grid_pixellab_fresh_export_20260511.zip",
);

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function getDebugVersion() {
  try {
    return await fetchJson(`http://127.0.0.1:${REMOTE_DEBUGGING_PORT}/json/version`);
  } catch {
    return null;
  }
}

async function ensureChrome() {
  await mkdir(PROFILE_DIR, { recursive: true });

  if (await getDebugVersion()) {
    return;
  }

  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const child = spawn(
    chromePath,
    [
      `--user-data-dir=${PROFILE_DIR}`,
      `--remote-debugging-port=${REMOTE_DEBUGGING_PORT}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=Translate,AutofillServerCommunication",
      "--new-window",
      PIXELLAB_URL,
    ],
    {
      detached: true,
      stdio: "ignore",
    },
  );
  child.unref();

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await getDebugVersion()) return;
    await wait(250);
  }

  throw new Error("Dedicated Chrome profile did not expose a DevTools endpoint.");
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
    if (message.error) {
      waiter.reject(new Error(message.error.message || JSON.stringify(message.error)));
    } else {
      waiter.resolve(message.result);
    }
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
    },
  };
}

async function getPageWebSocket() {
  const tabs = await fetchJson(`http://127.0.0.1:${REMOTE_DEBUGGING_PORT}/json`);
  const existing = tabs.find((tab) => tab.type === "page" && tab.url.includes("pixellab.ai"));
  if (existing) return existing.webSocketDebuggerUrl;

  const target = await fetchJson(
    `http://127.0.0.1:${REMOTE_DEBUGGING_PORT}/json/new?${encodeURIComponent(PIXELLAB_URL)}`,
    { method: "PUT" },
  );
  return target.webSocketDebuggerUrl;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return result.result.value;
}

function normalizeObjects(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["objects", "data", "items", "results"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

async function exportZipFromPage(client) {
  return evaluate(
    client,
    `(${async ({ apiBase, promptNeedle }) => {
      const storageValues = [];
      for (const storage of [localStorage, sessionStorage]) {
        for (let i = 0; i < storage.length; i += 1) {
          const key = storage.key(i);
          const value = storage.getItem(key);
          if (value) storageValues.push(value);
        }
      }

      let accessToken = "";
      const cookieMatch = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("supabase-auth-token="));
      if (cookieMatch) {
        const rawCookie = cookieMatch.split("=").slice(1).join("=");
        try {
          const parsedCookie = JSON.parse(decodeURIComponent(rawCookie));
          if (Array.isArray(parsedCookie) && typeof parsedCookie[0] === "string") {
            accessToken = parsedCookie[0];
          } else if (typeof parsedCookie?.access_token === "string") {
            accessToken = parsedCookie.access_token;
          }
        } catch {
          const match = decodeURIComponent(rawCookie).match(/"access_token"\\s*:\\s*"([^"]+)"/);
          if (match?.[1]) accessToken = match[1];
        }
      }

      for (const value of storageValues) {
        if (accessToken) break;
        try {
          const parsed = JSON.parse(value);
          const token =
            parsed?.access_token ||
            parsed?.currentSession?.access_token ||
            parsed?.session?.access_token;
          if (typeof token === "string" && token.length > 100) {
            accessToken = token;
            break;
          }
        } catch {
          const match = value.match(/"access_token"\\s*:\\s*"([^"]+)"/);
          if (match?.[1]?.length > 100) {
            accessToken = match[1];
            break;
          }
        }
      }

      if (!accessToken) {
        return { ok: false, reason: "missing-session" };
      }

      const headers = { Authorization: "Bearer " + accessToken };
      const objectsResponse = await fetch(apiBase + "/objects?limit=100&offset=0", { headers });
      if (!objectsResponse.ok) {
        return { ok: false, reason: "objects-api", status: objectsResponse.status };
      }
      const payload = await objectsResponse.json();
      const objects = Array.isArray(payload)
        ? payload
        : payload.objects || payload.data || payload.items || payload.results || [];
      const matching = objects.filter((object) => {
        const prompt = object.prompt || object.description || object.name || "";
        return String(prompt).startsWith(promptNeedle);
      });

      const ids = matching
        .map((object) => object.id || object.object_id || object.uuid)
        .filter(Boolean)
        .slice(0, 16);

      if (ids.length < 16) {
        return { ok: false, reason: "not-enough-matches", count: ids.length };
      }

      const zipResponse = await fetch(apiBase + "/objects/zip", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ object_ids: ids }),
      });
      if (!zipResponse.ok) {
        return { ok: false, reason: "zip-api", status: zipResponse.status };
      }

      const buffer = await zipResponse.arrayBuffer();
      const bytes = Array.from(new Uint8Array(buffer));
      let binary = "";
      const chunkSize = 8192;
      for (let index = 0; index < bytes.length; index += chunkSize) {
        binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
      }
      return {
        ok: true,
        count: ids.length,
        bytes: bytes.length,
        base64: btoa(binary),
      };
    }})(${JSON.stringify({ apiBase: API_BASE, promptNeedle: PROMPT_NEEDLE })})`,
  );
}

async function main() {
  await ensureChrome();
  const wsUrl = await getPageWebSocket();
  const client = cdpClient(wsUrl);

  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Page.navigate", { url: PIXELLAB_URL });
    await wait(3000);

    const result = await exportZipFromPage(client);
    if (!result?.ok) {
      console.log(JSON.stringify(result, null, 2));
      if (result?.reason === "missing-session") {
        console.log(
          `Sign in once in the dedicated PixelLab browser profile, then rerun this script. Profile: ${PROFILE_DIR}`,
        );
      }
      process.exitCode = 2;
      return;
    }

    await mkdir(dirname(OUT_ZIP), { recursive: true });
    await writeFile(OUT_ZIP, Buffer.from(result.base64, "base64"));
    console.log(JSON.stringify({ exported: OUT_ZIP, count: result.count, bytes: result.bytes }, null, 2));
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
