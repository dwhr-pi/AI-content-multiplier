import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readConfig } from "./config.js";
import { buildDashboardOverview, getDashboardJob, readJobLogs } from "./dashboardState.js";
import { cancelJob, moveJobsToStatus, setQueuePaused } from "./queue.js";
import { runWorkerLoop } from "./worker.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const WEB_DIR = path.resolve(MODULE_DIR, "..", "web");

type ActionName = "pause" | "resume" | "dispatch";
let dispatchInProgress = false;

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendText(response: ServerResponse, statusCode: number, text: string, contentType = "text/plain; charset=utf-8"): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", contentType);
  response.end(text);
}

async function serveStatic(assetPath: string, response: ServerResponse): Promise<void> {
  const normalized = assetPath === "/" ? "/index.html" : assetPath;
  const target = path.resolve(WEB_DIR, `.${normalized}`);

  if (!target.startsWith(WEB_DIR)) {
    sendText(response, 403, "Zugriff verweigert.");
    return;
  }

  try {
    const content = await readFile(target);
    const extension = path.extname(target);
    const type =
      extension === ".html"
        ? "text/html; charset=utf-8"
        : extension === ".css"
          ? "text/css; charset=utf-8"
          : extension === ".js"
            ? "application/javascript; charset=utf-8"
            : "application/octet-stream";

    response.statusCode = 200;
    response.setHeader("content-type", type);
    response.end(content);
  } catch {
    sendText(response, 404, "Datei nicht gefunden.");
  }
}

async function readRequestBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function handleAction(action: ActionName): Promise<void> {
  if (action === "pause") {
    await setQueuePaused(true);
    await moveJobsToStatus(["queued", "waiting_resources"], "paused", "Queue wurde ueber den Leitstand pausiert.");
    return;
  }

  if (action === "resume") {
    await setQueuePaused(false);
    await moveJobsToStatus(["paused"], "queued", "Queue wurde ueber den Leitstand fortgesetzt.");
    return;
  }

  if (dispatchInProgress) {
    return;
  }

  dispatchInProgress = true;
  void runWorkerLoop({ once: true }).finally(() => {
    dispatchInProgress = false;
  });
}

export async function startDashboardServer(host?: string, port?: number): Promise<void> {
  const config = await readConfig();
  const resolvedHost = host ?? config.dashboard_host;
  const resolvedPort = port ?? config.dashboard_port;

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${resolvedHost}:${resolvedPort}`}`);

      if (request.method === "GET" && url.pathname === "/api/overview") {
        sendJson(response, 200, await buildDashboardOverview());
        return;
      }

      if (request.method === "GET" && url.pathname.startsWith("/api/jobs/") && url.pathname.endsWith("/logs")) {
        const jobId = url.pathname.split("/")[3];
        const job = await getDashboardJob(jobId);
        if (!job) {
          sendJson(response, 404, { error: "Job nicht gefunden." });
          return;
        }

        sendJson(response, 200, {
          job,
          logs: await readJobLogs(job),
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/actions") {
        const body = await readRequestBody(request);
        const parsed = body ? (JSON.parse(body) as { action?: ActionName }) : {};
        const action = parsed.action;

        if (!action || !["pause", "resume", "dispatch"].includes(action)) {
          sendJson(response, 400, { error: "Ungueltige Aktion." });
          return;
        }

        await handleAction(action);
        sendJson(response, 200, {
          ok: true,
          action,
          overview: await buildDashboardOverview(),
        });
        return;
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/jobs/") && url.pathname.endsWith("/cancel")) {
        const jobId = url.pathname.split("/")[3];
        const job = await cancelJob(jobId);
        sendJson(response, 200, {
          ok: true,
          job,
          overview: await buildDashboardOverview(),
        });
        return;
      }

      if (request.method === "GET") {
        await serveStatic(url.pathname, response);
        return;
      }

      sendJson(response, 405, { error: "Methode nicht erlaubt." });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendJson(response, 500, { error: message });
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(resolvedPort, resolvedHost, () => resolve());
  });

  process.stdout.write(
    [
      "# KI-Leitstand gestartet",
      `- Host: ${resolvedHost}`,
      `- Port: ${resolvedPort}`,
      `- URL: http://${resolvedHost}:${resolvedPort}`,
    ].join("\n") + "\n",
  );
}
