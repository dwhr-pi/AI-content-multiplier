import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

import type { CommandExecutionResult, FixReport, FixRound, GeneratedProject, RuntimeConfig, SessionWebsiteJob } from "./types.js";

function trimTail(value: string, maxLength = 4000): string {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(-maxLength);
}

async function executeCommand(
  command: string,
  cwd: string,
  timeoutSeconds: number,
): Promise<CommandExecutionResult> {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd,
      shell: true,
      windowsHide: true,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutSeconds * 1000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      stderr += `\n${error.message}`;
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        command,
        exitCode: code ?? 1,
        durationMs: Date.now() - startedAt,
        stdout,
        stderr,
        timedOut,
      });
    });
  });
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function applyDeterministicFixes(project: GeneratedProject, job: SessionWebsiteJob, stderr: string): Promise<string[]> {
  const actions: string[] = [];

  if (job.template === "nextjs-landingpage") {
    const nextEnvPath = path.join(project.projectRoot, "next-env.d.ts");
    if (!(await fileExists(nextEnvPath))) {
      await writeFile(
        nextEnvPath,
        [
          "/// <reference types=\"next\" />",
          "/// <reference types=\"next/image-types/global\" />",
          "",
          "// Diese Datei wird von Next.js benoetigt.",
        ].join("\n"),
      );
      actions.push("next-env.d.ts erstellt.");
    }
  }

  if (job.template === "astro-landingpage") {
    const envPath = path.join(project.projectRoot, "src", "env.d.ts");
    if (!(await fileExists(envPath))) {
      await mkdir(path.dirname(envPath), { recursive: true });
      await writeFile(envPath, "/// <reference types=\"astro/client\" />\n");
      actions.push("src/env.d.ts fuer Astro erstellt.");
    }
  }

  const readmePath = path.join(project.projectRoot, "README.md");
  if (!(await fileExists(readmePath))) {
    const generatedReadme = await readFile(project.readmePath, "utf8").catch(() => "# Generated Project\n");
    await writeFile(readmePath, generatedReadme);
    actions.push("README.md in das generierte Projekt kopiert.");
  }

  if (/anthropic|claude/i.test(stderr)) {
    actions.push("Hinweis erkannt: Claude/Anthropic-Hinweise werden ignoriert.");
  }

  if (actions.length === 0) {
    actions.push("Keine deterministische Reparatur verfuegbar, Fehler nur dokumentiert.");
  }

  return actions;
}

function renderBuildReport(job: SessionWebsiteJob, rounds: FixRound[]): string {
  const ok = rounds.some((round) => round.succeeded);

  return [
    "# Build Report",
    "",
    `- Job-ID: ${job.id}`,
    `- Projekt: ${job.projectName}`,
    `- Template: ${job.template}`,
    `- Status: ${ok ? "erfolgreich" : "fehlgeschlagen"}`,
    `- Reparaturrunden: ${rounds.length}`,
    "",
    "## Runden",
    ...rounds.flatMap((round) => [
      `### Runde ${round.round}`,
      `- Install: Exit ${round.install.exitCode}${round.install.timedOut ? " (Timeout)" : ""}`,
      ...(round.build ? [`- Build: Exit ${round.build.exitCode}${round.build.timedOut ? " (Timeout)" : ""}`] : ["- Build: nicht gestartet"]),
      "- Aktionen:",
      ...round.actions.map((action) => `  - ${action}`),
      "",
      "```text",
      trimTail(round.build?.stderr || round.install.stderr || round.install.stdout || "Keine Ausgabe"),
      "```",
      "",
    ]),
  ].join("\n");
}

export async function runAutoFix(
  config: RuntimeConfig,
  job: SessionWebsiteJob,
  project: GeneratedProject,
): Promise<FixReport> {
  const rounds: FixRound[] = [];
  const maxRounds = Math.min(job.maxFixRounds, 3);

  for (let roundIndex = 0; roundIndex < maxRounds; roundIndex += 1) {
    const install = await executeCommand("pnpm install", project.projectRoot, config.fixTimeoutSeconds);
    const round: FixRound = {
      round: roundIndex + 1,
      install,
      actions: [],
      succeeded: false,
    };

    if (install.exitCode !== 0) {
      round.actions = await applyDeterministicFixes(project, job, `${install.stderr}\n${install.stdout}`);
      rounds.push(round);
      continue;
    }

    const build = await executeCommand("pnpm build", project.projectRoot, config.fixTimeoutSeconds);
    round.build = build;

    if (build.exitCode === 0) {
      round.actions.push("Install und Build erfolgreich.");
      round.succeeded = true;
      rounds.push(round);
      break;
    }

    round.actions = await applyDeterministicFixes(project, job, `${build.stderr}\n${build.stdout}`);
    rounds.push(round);
  }

  const buildReportPath = path.join(job.outputDir, "build-report.md");
  await writeFile(buildReportPath, `${renderBuildReport(job, rounds)}\n`);

  return {
    ok: rounds.some((round) => round.succeeded),
    rounds,
    buildReportPath,
  };
}
