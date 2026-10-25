import { watch, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { createHash, randomBytes } from "crypto";
import { getCurrentSystemFromJournal, getCommanderFromJournal } from "./colonize/journal";
import { runColonizePipeline, resolveSystemCoordinates } from "./colonize/pipeline";

const PORT = 3000;
const BINDS_DIR = "C:\\Users\\fary2\\AppData\\Local\\Frontier Developments\\Elite Dangerous\\Options\\Bindings";
const TARGET_BINDS_FILE = join(BINDS_DIR, "Custom.4.2.binds");

function getActiveBindsPath(): string {
  if (existsSync(TARGET_BINDS_FILE)) return TARGET_BINDS_FILE;
  const fallbacks = ["Custom.4.1.binds", "Custom.4.0.binds", "Custom.binds"];
  for (const f of fallbacks) {
    const p = join(BINDS_DIR, f);
    if (existsSync(p)) return p;
  }
  return "";
}

let currentBindsPath = getActiveBindsPath();
let currentBindsXml = currentBindsPath ? readFileSync(currentBindsPath, "utf-8") : "";

// Track connected WebSocket clients
const clients = new Set<any>();

function broadcast(data: object) {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    try {
      ws.send(msg);
    } catch {
      clients.delete(ws);
    }
  }
}

// Watch binds file for live updates from game
if (currentBindsPath) {
  console.log(`[EDTools] Watching binds file: ${currentBindsPath}`);
  watch(currentBindsPath, (eventType) => {
    if (eventType === "change") {
      setTimeout(() => {
        try {
          currentBindsXml = readFileSync(currentBindsPath, "utf-8");
          console.log(`[EDTools] Detected update in ${currentBindsPath}`);
          broadcast({
            type: "bindsUpdated",
            filename: currentBindsPath.split("\\").pop(),
            xml: currentBindsXml,
          });
        } catch (err) {
          console.error(`[EDTools] Error reading binds file:`, err);
        }
      }, 150);
    }
  });
} else {
  console.warn(`[EDTools] Warning: No binds file found in ${BINDS_DIR}`);
}

// Settings Persistence
const SETTINGS_FILE = join(import.meta.dir, "settings.json");

function loadSettings(): Record<string, any> {
  try {
    if (existsSync(SETTINGS_FILE)) {
      return JSON.parse(readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("[EDTools] Failed to load settings.json:", err);
  }
  return {
    commanderName: "",
    fid: "",
    journalDir: "",
    frontier: {
      authMode: "capi", // 'journal' | 'capi'
      clientId: "",
      accessToken: "",
      refreshToken: "",
      tokenExpiry: 0,
      status: "unconfigured",
      profile: null,
      lastAuthenticated: "",
    },
    inara: {
      enabled: false,
      commanderName: "",
      apiKey: "",
      appName: "EDTools",
      appVersion: "4.2",
      isDev: false
    },
    edsm: {
      enabled: false,
      commanderName: "",
      apiKey: ""
    },
    spansh: {
      enabled: false,
      apiKey: ""
    },
    eddn: {
      enabled: true,
      uploaderId: "EDTools_Odyssey"
    }
  };
}

function saveSettings(settings: Record<string, any>): boolean {
  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[EDTools] Failed to save settings.json:", err);
    return false;
  }
}

// Frontier OAuth PKCE Utilities
function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32));
}

function generateCodeChallenge(verifier: string): string {
  const hash = createHash("sha256").update(verifier).digest();
  return base64UrlEncode(hash);
}

interface PendingOAuthSession {
  state: string;
  codeVerifier: string;
  clientId: string;
  createdAt: number;
}
let pendingOAuthSession: PendingOAuthSession | null = null;

// Bun HTTP + WebSocket server
const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req);
      if (upgraded) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // Static files
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const htmlPath = join(import.meta.dir, "index.html");
      return new Response(Bun.file(htmlPath), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (url.pathname === "/styles.css") {
      const cssPath = join(import.meta.dir, "styles.css");
      return new Response(Bun.file(cssPath), {
        headers: { "Content-Type": "text/css; charset=utf-8" },
      });
    }

    if (url.pathname === "/app.js") {
      const jsPath = join(import.meta.dir, "app.js");
      return new Response(Bun.file(jsPath), {
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    if (url.pathname === "/colonize.js") {
      const jsPath = join(import.meta.dir, "colonize.js");
      return new Response(Bun.file(jsPath), {
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    if (url.pathname === "/settings.js") {
      const jsPath = join(import.meta.dir, "settings.js");
      return new Response(Bun.file(jsPath), {
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    // API endpoint to get current loaded binds
    if (url.pathname === "/api/binds") {
      return new Response(
        JSON.stringify({
          filename: currentBindsPath.split("\\").pop() ?? "Custom.4.2.binds",
          path: currentBindsPath,
          xml: currentBindsXml,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // API endpoint: Get live player star system from Journal
    if (url.pathname === "/api/colonize/current-system") {
      const systemInfo = getCurrentSystemFromJournal();
      return new Response(
        JSON.stringify({
          detected: Boolean(systemInfo),
          system: systemInfo || null,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // API endpoint: Resolve coordinates for a system name
    if (url.pathname === "/api/colonize/resolve-system") {
      const name = url.searchParams.get("name")?.trim();
      if (!name) {
        return new Response(
          JSON.stringify({ success: false, error: "System name parameter required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      try {
        const coords = await resolveSystemCoordinates(name);
        if (coords) {
          return new Response(
            JSON.stringify({ success: true, name, coords }),
            { headers: { "Content-Type": "application/json" } }
          );
        } else {
          return new Response(
            JSON.stringify({ success: false, error: `Could not resolve coordinates for "${name}"` }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // API endpoint: Run colonisation search pipeline
    if (url.pathname === "/api/colonize/search" && req.method === "POST") {
      try {
        const criteria = await req.json();
        console.log(`[ColonizeScout] Starting scout search from "${criteria.referenceSystem}" (Coords:`, criteria.referenceCoords || "to be resolved", `)...`);

        // Run pipeline with real-time WebSocket broadcasting
        const matches = await runColonizePipeline(
          criteria,
          (progress) => broadcast(progress),
          (match) => broadcast(match)
        );

        return new Response(
          JSON.stringify({ success: true, totalMatches: matches.length, matches }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        console.error(`[ColonizeScout] Search failed:`, err);
        return new Response(
          JSON.stringify({ success: false, error: err.message || "Search failed" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // API endpoint: Get saved settings
    if (url.pathname === "/api/settings" && req.method === "GET") {
      return new Response(JSON.stringify(loadSettings()), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // API endpoint: Save settings
    if (url.pathname === "/api/settings" && req.method === "POST") {
      try {
        const body = await req.json();
        const success = saveSettings(body);
        return new Response(JSON.stringify({ success }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // API endpoint: Auto-detect Commander info from active Journal
    if (url.pathname === "/api/journal/commander") {
      const settings = loadSettings();
      const journalDir = settings.journalDir || undefined;
      const commander = getCommanderFromJournal(journalDir);
      return new Response(
        JSON.stringify({
          detected: Boolean(commander),
          commander: commander || null,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // API endpoint: Verify Inara API credentials
    if (url.pathname === "/api/auth/inara/verify" && req.method === "POST") {
      try {
        const { apiKey, commanderName, appName, appVersion, isDev } = await req.json();
        if (!apiKey || !commanderName) {
          return new Response(
            JSON.stringify({ success: false, error: "Commander Name and Inara API Key are required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const payload = {
          header: {
            appName: appName || "EDTools",
            appVersion: appVersion || "4.2",
            isBeingDeveloped: Boolean(isDev),
            APIkey: apiKey.trim(),
            commanderName: commanderName.trim(),
          },
          events: [
            {
              eventName: "getCommanderProfile",
              eventTimestamp: new Date().toISOString(),
              eventData: {
                searchName: commanderName.trim(),
              },
            },
          ],
        };

        const inaraRes = await fetch("https://inara.cz/inapi/v1/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!inaraRes.ok) {
          return new Response(
            JSON.stringify({ success: false, error: `Inara HTTP ${inaraRes.status}: ${inaraRes.statusText}` }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        const inaraData: any = await inaraRes.json();
        const headerStatus = inaraData?.header?.eventStatus;
        const eventData = inaraData?.events?.[0];

        if (headerStatus === 200 && eventData?.eventStatus === 200) {
          return new Response(
            JSON.stringify({
              success: true,
              profile: eventData.eventData,
              inaraURL: eventData.eventData?.inaraURL,
              commanderName: eventData.eventData?.userName || commanderName,
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } else {
          const errorMsg =
            eventData?.eventStatusText ||
            inaraData?.header?.eventStatusText ||
            "Inara rejected the API request. Verify your API key and Commander Name.";
          return new Response(
            JSON.stringify({ success: false, error: errorMsg, raw: inaraData }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message || "Failed to reach Inara API" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // API endpoint: Verify EDSM API credentials
    if (url.pathname === "/api/auth/edsm/verify" && req.method === "POST") {
      try {
        const { apiKey, commanderName } = await req.json();
        if (!apiKey || !commanderName) {
          return new Response(
            JSON.stringify({ success: false, error: "Commander Name and EDSM API Key are required" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const encodedCmdr = encodeURIComponent(commanderName.trim());
        const encodedKey = encodeURIComponent(apiKey.trim());

        const [ranksRes, posRes] = await Promise.all([
          fetch(`https://www.edsm.net/api-commander-v1/get-ranks?commanderName=${encodedCmdr}&apiKey=${encodedKey}`),
          fetch(`https://www.edsm.net/api-commander-v1/get-last-position?commanderName=${encodedCmdr}&apiKey=${encodedKey}`),
        ]);

        const ranksData: any = await ranksRes.json();
        const posData: any = await posRes.json();

        if (ranksData?.msgnum === 201 || posData?.msgnum === 201) {
          return new Response(
            JSON.stringify({ success: false, error: "Authentication failed. Invalid Commander Name or API Key for EDSM." }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        if (ranksData?.msgnum === 100 || ranksData?.ranks || posData?.system) {
          return new Response(
            JSON.stringify({
              success: true,
              ranks: ranksData?.ranks || null,
              progress: ranksData?.progress || null,
              lastPosition: {
                system: posData?.system || null,
                firstDiscover: posData?.firstDiscover || false,
                date: posData?.date || null,
                coordinates: posData?.coordinates || null,
              },
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: ranksData?.msg || "Unable to retrieve EDSM data" }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message || "Failed to reach EDSM API" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // API endpoint: Generate Frontier Browser OAuth Login URL
    if (url.pathname === "/api/auth/frontier/login-url" && req.method === "GET") {
      try {
        const settings = loadSettings();
        const queryClientId = url.searchParams.get("clientId")?.trim();
        const clientId = queryClientId || settings.frontier?.clientId;

        if (!clientId || clientId === "edtools-client") {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "Frontier requires an official registered OAuth Client ID (UUID). Please enter your Client ID in Settings or use Direct Local Journal mode.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const state = base64UrlEncode(randomBytes(16));
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);

        pendingOAuthSession = {
          state,
          codeVerifier,
          clientId,
          createdAt: Date.now(),
        };

        const redirectUri = `http://localhost:${PORT}/auth/frontier/callback`;
        const authUrl = `https://auth.frontierstore.net/auth?response_type=code&client_id=${encodeURIComponent(
          clientId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=auth%20capi&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;

        return new Response(
          JSON.stringify({
            success: true,
            authUrl,
            state,
            redirectUri,
            clientId,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Endpoint: Frontier OAuth Browser Callback
    if (url.pathname === "/auth/frontier/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");
      const errorDesc = url.searchParams.get("error_description");

      const renderCallbackHtml = (title: string, msg: string, isSuccess: boolean, extraData?: string) => {
        return new Response(
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { background: #070a0f; color: ${isSuccess ? "#00ff88" : "#ff2a4b"}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: rgba(14, 20, 29, 0.95); border: 1px solid ${isSuccess ? "#00ff88" : "#ff2a4b"}; padding: 36px; border-radius: 12px; box-shadow: 0 0 30px ${isSuccess ? "rgba(0, 255, 136, 0.25)" : "rgba(255, 42, 75, 0.25)"}; max-width: 480px; width: 90%; }
    h2 { margin: 0 0 12px; font-family: monospace; font-size: 18px; letter-spacing: 1px; color: ${isSuccess ? "#00ff88" : "#ff2a4b"}; }
    p { color: #8fa0b5; font-size: 14px; line-height: 1.5; margin: 0 0 16px; }
    .badge { font-family: monospace; font-size: 12px; background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 4px; display: inline-block; color: #fff; }
    .close-btn { background: #132235; border: 1px solid #00e5ff; color: #00e5ff; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; margin-top: 14px; }
    .close-btn:hover { background: #00e5ff; color: #070a0f; }
  </style>
</head>
<body>
  <div class="card">
    <h2>${title}</h2>
    <p>${msg}</p>
    ${extraData ? `<div class="badge">${extraData}</div><br>` : ''}
    <button class="close-btn" onclick="window.close()">CLOSE WINDOW</button>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({ type: 'frontier_auth_${isSuccess ? "success" : "failure"}', error: ${JSON.stringify(errorDesc || error || "")} }, '*');
      }
    } catch(e) {}
    ${isSuccess ? 'setTimeout(() => window.close(), 1800);' : ''}
  </script>
</body>
</html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      };

      if (error || !code) {
        return renderCallbackHtml(
          "🚨 FRONTIER AUTHENTICATION DENIED",
          errorDesc || error || "Frontier rejected or cancelled the authorization request.",
          false
        );
      }

      if (!pendingOAuthSession || pendingOAuthSession.state !== state) {
        return renderCallbackHtml(
          "🚨 SECURITY STATE MISMATCH",
          "OAuth state verification failed or session expired. Please restart the login process in EDTools.",
          false
        );
      }

      const session = pendingOAuthSession;
      pendingOAuthSession = null;

      try {
        const redirectUri = `http://localhost:${PORT}/auth/frontier/callback`;
        const tokenRes = await fetch("https://auth.frontierstore.net/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: session.clientId,
            code_verifier: session.codeVerifier,
            code: code,
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenRes.ok) {
          const errBody = await tokenRes.text();
          return renderCallbackHtml(
            "🚨 TOKEN EXCHANGE FAILED",
            `Frontier token endpoint returned status ${tokenRes.status}. Make sure your Client ID is registered with Frontier Auth.`,
            false,
            errBody
          );
        }

        const tokenData: any = await tokenRes.json();
        const currentSettings = loadSettings();
        currentSettings.frontier = {
          ...currentSettings.frontier,
          authMode: "capi",
          clientId: session.clientId,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || currentSettings.frontier?.refreshToken || "",
          tokenExpiry: Date.now() + ((tokenData.expires_in || 2592000) * 1000),
          status: "verified",
          lastAuthenticated: new Date().toISOString(),
        };

        // Fetch live profile from companion API
        let cmdrInfo = "";
        try {
          const profRes = await fetch("https://companion.orerve.net/profile", {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "User-Agent": "EDTools/4.2",
            },
          });
          if (profRes.ok) {
            const profData: any = await profRes.json();
            if (profData?.commander?.name) {
              currentSettings.commanderName = profData.commander.name;
              cmdrInfo = `CMDR: ${profData.commander.name}`;
            }
            if (profData?.commander?.id) {
              currentSettings.fid = `F${profData.commander.id}`;
            }
            currentSettings.frontier.profile = {
              name: profData.commander?.name,
              credits: profData.commander?.credits,
              currentShip: profData.ship?.name,
              currentShipName: profData.ship?.shipName,
              docked: profData.commander?.docked,
              starSystem: profData.lastSystem?.name,
            };
          }
        } catch (profErr) {
          console.warn("[FrontierCAPI] Could not fetch profile:", profErr);
        }

        saveSettings(currentSettings);

        // Broadcast update over WebSocket
        broadcast({
          type: "frontierAuthUpdated",
          status: "verified",
          settings: currentSettings,
        });

        return renderCallbackHtml(
          "🚀 FRONTIER AUTHORIZATION SUCCESSFUL",
          "Your Frontier Commander account has been linked to EDTools! This window will close automatically.",
          true,
          cmdrInfo || "Companion API Token Stored"
        );
      } catch (err: any) {
        return renderCallbackHtml(
          "🚨 UNEXPECTED ERROR",
          err.message || "An error occurred during Frontier token exchange.",
          false
        );
      }
    }

    // API endpoint: Disconnect Frontier account
    if (url.pathname === "/api/auth/frontier/disconnect" && req.method === "POST") {
      try {
        const settings = loadSettings();
        settings.frontier = {
          ...settings.frontier,
          accessToken: "",
          refreshToken: "",
          tokenExpiry: 0,
          status: "unconfigured",
          profile: null,
          lastAuthenticated: "",
        };
        saveSettings(settings);

        broadcast({
          type: "frontierAuthUpdated",
          status: "unconfigured",
          settings,
        });

        return new Response(JSON.stringify({ success: true, message: "Frontier account disconnected" }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // API endpoint: Verify Frontier connection
    if (url.pathname === "/api/auth/frontier/verify" && req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}));
        const settings = loadSettings();
        const authMode = body.authMode || settings.frontier?.authMode || "journal";
        const accessToken = body.accessToken || settings.frontier?.accessToken;

        if (authMode === "journal") {
          const commander = getCommanderFromJournal(settings.journalDir || undefined);
          return new Response(
            JSON.stringify({
              success: true,
              mode: "journal",
              detected: Boolean(commander),
              message: commander
                ? `Active Journal connection verified for CMDR ${commander.commanderName}`
                : "Local Journal directory detected. Launch Elite Dangerous to sync live data.",
              data: commander,
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } else if (authMode === "capi") {
          if (!accessToken) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Frontier CAPI access token is missing. Please click 'LOGIN VIA FRONTIER' to authorize in browser.",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }
          const fRes = await fetch("https://companion.orerve.net/profile", {
            headers: {
              Authorization: `Bearer ${accessToken.trim()}`,
              "User-Agent": "EDTools/4.2",
            },
          });
          if (fRes.ok) {
            const profile: any = await fRes.json();
            // Update profile cache
            settings.frontier.status = "verified";
            if (profile?.commander?.name) {
              settings.commanderName = profile.commander.name;
            }
            if (profile?.commander?.id) {
              settings.fid = `F${profile.commander.id}`;
            }
            settings.frontier.profile = {
              name: profile.commander?.name,
              credits: profile.commander?.credits,
              currentShip: profile.ship?.name,
              currentShipName: profile.ship?.shipName,
              docked: profile.commander?.docked,
              starSystem: profile.lastSystem?.name,
            };
            saveSettings(settings);

            return new Response(
              JSON.stringify({
                success: true,
                mode: "capi",
                profile: settings.frontier.profile,
                rawProfile: profile,
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          } else {
            return new Response(
              JSON.stringify({
                success: false,
                error: `Frontier CAPI returned HTTP ${fRes.status}: ${fRes.statusText}. Your session token may have expired. Try logging in again.`,
              }),
              { headers: { "Content-Type": "application/json" } }
            );
          }
        }
        return new Response(
          JSON.stringify({ success: false, error: "Invalid Frontier connection mode" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // API endpoint: Verify Spansh API access
    if (url.pathname === "/api/auth/spansh/verify" && req.method === "POST") {
      try {
        const { apiKey } = await req.json();
        const testRes = await fetch("https://spansh.co.uk/api/systems", {
          headers: apiKey ? { Authorization: `Bearer ${apiKey.trim()}` } : {},
        });
        if (testRes.ok) {
          return new Response(
            JSON.stringify({ success: true, message: "Spansh API endpoint reached successfully" }),
            { headers: { "Content-Type": "application/json" } }
          );
        } else {
          return new Response(
            JSON.stringify({ success: false, error: `Spansh responded with status ${testRes.status}` }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message || "Failed to reach Spansh API" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // HTTP endpoint for key events fallback
    if (url.pathname === "/api/key" && req.method === "POST") {
      req.json().then(data => {
        broadcast({ type: "keyEvent", ...data });
      }).catch(() => { });
      return new Response("OK");
    }

    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    open(ws) {
      clients.add(ws);
      console.log(`[EDTools] Client connected to live telemetry stream. Total clients: ${clients.size}`);
      // Send initial binds state
      ws.send(
        JSON.stringify({
          type: "connected",
          filename: currentBindsPath.split("\\").pop() ?? "Custom.4.2.binds",
          xml: currentBindsXml,
        })
      );
    },
    message(ws, msg) {
      // Forward incoming message (e.g. from key_listener client) to all other clients
      try {
        const text = typeof msg === "string" ? msg : new TextDecoder().decode(msg);
        for (const client of clients) {
          if (client !== ws) {
            client.send(text);
          }
        }
      } catch (err) {
        console.error("[EDTools] Error forwarding message:", err);
      }
    },
    close(ws) {
      clients.delete(ws);
      console.log(`[EDTools] Client disconnected. Remaining: ${clients.size}`);
    },
  },
});

console.log(`=======================================================`);
console.log(`  🚀 EDTools Companion Server is running!`);
console.log(`  🌐 Open in browser: http://localhost:${PORT}`);
console.log(`  🎮 Tracking binds & live input for Elite Dangerous 4.2`);
console.log(`=======================================================`);
