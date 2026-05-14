#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const DEFAULT_PROFILE_DIR = resolve(ROOT, ".codex-local/pixellab-automation-profile");
const PROFILE_DIR = resolve(process.env.PIXELLAB_PROFILE_DIR || DEFAULT_PROFILE_DIR);
const PORT = Number(process.env.PIXELLAB_REMOTE_PORT || 9337);
const DEFAULT_URL = "https://www.pixellab.ai/create-character/new";
const PROOF_DIR = resolve(ROOT, "docs/proof/pixellab-session");

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

function usage() {
  console.log(`Usage:
  node scripts/assets/pixellab-session.mjs open [url]
  node scripts/assets/pixellab-session.mjs check [url]
  node scripts/assets/pixellab-session.mjs restart [url]

Environment:
  PIXELLAB_PROFILE_DIR   Chrome user-data-dir to use. Default: .codex-local/pixellab-automation-profile
  PIXELLAB_REMOTE_PORT   DevTools port. Default: 9337
`);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

function closeDedicatedChromeProfile() {
  const escaped = PROFILE_DIR.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  spawnSync("pkill", ["-f", `user-data-dir=${escaped}`], { stdio: "ignore" });
  spawnSync("pkill", ["-f", `user-data-dir=${PROFILE_DIR}`], { stdio: "ignore" });
}

async function getDebugVersion() {
  try {
    return await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
  } catch {
    return null;
  }
}

async function ensureChrome(url) {
  await mkdir(PROFILE_DIR, { recursive: true });
  if (await getDebugVersion()) return { launched: false };

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
      url
    ],
    { detached: true, stdio: "ignore" }
  );
  child.unref();

  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await getDebugVersion()) return { launched: true };
    await wait(250);
  }

  throw new Error("PixelLab Chrome profile did not expose a DevTools endpoint.");
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

async function getPageWebSocket(url) {
  const tabs = await fetchJson(`http://127.0.0.1:${PORT}/json`);
  const existing = tabs.find((tab) => tab.type === "page" && tab.url.includes("pixellab.ai"));
  if (existing) return existing.webSocketDebuggerUrl;
  const target = await fetchJson(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, {
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

async function checkSession(url) {
  await mkdir(PROOF_DIR, { recursive: true });
  const launch = await ensureChrome(url);
  const wsUrl = await getPageWebSocket(url);
  const client = cdpClient(wsUrl);
  const screenshotPath = resolve(PROOF_DIR, "pixellab-session-check.png");

  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Page.navigate", { url });
    await wait(6500);

    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true
    });
    await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));

    const state = await evaluate(
      client,
      `(${async () => {
        const text = document.body?.innerText?.slice(0, 2500) || "";

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

        const accessToken = extractToken();
        if (!accessToken) {
          return {
            signedIn: false,
            reason: "missing-session",
            title: document.title,
            url: location.href,
            visibleTextHint: text.includes("Sign in") ? "signin" : text.slice(0, 160)
          };
        }

        const response = await fetch("https://api.pixellab.ai/objects?limit=5&offset=0", {
          headers: { Authorization: "Bearer " + accessToken }
        });
        return {
          signedIn: response.ok,
          reason: response.ok ? "ok" : "objects-api",
          status: response.status,
          title: document.title,
          url: location.href,
          visibleTextHint: text.includes("Sign out") || text.includes("Account") ? "account-visible" : text.slice(0, 160)
        };
      }})()`
    );

    return {
      ok: Boolean(state.signedIn),
      profileDir: PROFILE_DIR,
      port: PORT,
      launchedChrome: launch.launched,
      screenshot: screenshotPath,
      ...state
    };
  } finally {
    client.close();
  }
}

async function main() {
  const command = process.argv[2];
  const url = process.argv[3] || DEFAULT_URL;

  if (!command || command === "--help" || command === "-h") {
    usage();
    return;
  }

  if (command === "open") {
    const launch = await ensureChrome(url);
    console.log(
      JSON.stringify(
        {
          ok: true,
          profileDir: PROFILE_DIR,
          port: PORT,
          url,
          launchedChrome: launch.launched
        },
        null,
        2
      )
    );
    return;
  }

  if (command === "restart") {
    closeDedicatedChromeProfile();
    await wait(1000);
    const launch = await ensureChrome(url);
    console.log(
      JSON.stringify(
        {
          ok: true,
          profileDir: PROFILE_DIR,
          port: PORT,
          url,
          launchedChrome: launch.launched,
          restartedDedicatedProfile: true
        },
        null,
        2
      )
    );
    return;
  }

  if (command === "check") {
    const result = await checkSession(url);
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  usage();
  process.exit(2);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
