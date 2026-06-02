import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

import type { GeneratedProject } from "./types.js";

async function tryScreenshot(url: string, screenshotPath: string): Promise<string> {
  return new Promise((resolve) => {
    const child = spawn(`npx playwright screenshot ${url} "${screenshotPath}"`, {
      shell: true,
      windowsHide: true,
      env: process.env,
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(`Screenshot gespeichert: ${screenshotPath}`);
        return;
      }

      resolve(`Screenshot uebersprungen: ${stderr.trim() || "Kein lokales Screenshot-Werkzeug verfuegbar."}`);
    });
  });
}

export async function startPreviewServer(
  project: GeneratedProject,
  port: number,
  screenshotPath?: string,
): Promise<{ url: string; close: () => Promise<void>; screenshotMessage?: string }> {
  const server = createServer(async (request, response) => {
    const rawPath = request.url && request.url !== "/" ? request.url : "/index.html";
    const safePath = rawPath === "/" ? "index.html" : rawPath.replace(/^\/+/, "");
    const absolutePath = path.join(project.previewRoot, safePath);

    try {
      const body = await readFile(absolutePath);
      const contentType = safePath.endsWith(".css") ? "text/css; charset=utf-8" : "text/html; charset=utf-8";
      response.writeHead(200, { "content-type": contentType });
      response.end(body);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Nicht gefunden");
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve());
  });

  const url = `http://127.0.0.1:${port}`;
  const screenshotMessage = screenshotPath ? await tryScreenshot(url, screenshotPath) : undefined;

  return {
    url,
    screenshotMessage,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}
