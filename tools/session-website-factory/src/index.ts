import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

import { buildWebsitePlan } from "./planner.js";
import { generateWebsiteProject } from "./generator.js";
import { startPreviewServer } from "./preview.js";
import { acquireLock, canStartHeavyWork, createJob, ensureQueueStorage, getJob, listJobs, loadQueue, pickNextPendingJob, releaseLock, updateJob } from "./queue.js";
import { runAutoFix } from "./fixer.js";
import type { GeneratedProject, LanguageMode, LlmProvider, RuntimeConfig, SessionWebsiteJob, TemplateId } from "./types.js";

function parseArgs(argv: string[]): { positional: string[]; flags: Record<string, string | boolean> } {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token.startsWith("--")) {
      const name = token.slice(2);
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        flags[name] = true;
        continue;
      }

      flags[name] = next;
      index += 1;
      continue;
    }

    positional.push(token);
  }

  return { positional, flags };
}

function getFlagString(flags: Record<string, string | boolean>, name: string, fallback = ""): string {
  const value = flags[name];
  return typeof value === "string" ? value : fallback;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

function safeNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function loadEnvFile(rootDir: string): Promise<Record<string, string>> {
  const envPath = path.join(rootDir, ".env");
  if (!(await fileExists(envPath))) {
    return {};
  }

  const raw = await readFile(envPath, "utf8");
  const pairs = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim().replace(/^['"]|['"]$/g, "")] as const;
    });

  return Object.fromEntries(pairs);
}

async function loadConfig(rootDir: string): Promise<RuntimeConfig> {
  const envFile = await loadEnvFile(rootDir);
  const merged = {
    ...envFile,
    ...process.env,
  };

  const providerCandidate = (merged.LLM_PROVIDER ?? "ollama").toLowerCase();
  const provider: LlmProvider =
    providerCandidate === "openai" || providerCandidate === "gemini" || providerCandidate === "openclaw"
      ? providerCandidate
      : "ollama";
  const templateCandidate = merged.DEFAULT_TEMPLATE === "nextjs-landingpage" ? "nextjs-landingpage" : "astro-landingpage";
  const languageCandidate = merged.DEFAULT_LANGUAGE === "de" || merged.DEFAULT_LANGUAGE === "en" ? merged.DEFAULT_LANGUAGE : "bilingual";

  return {
    rootDir,
    templatesDir: path.join(rootDir, "templates"),
    jobsDir: path.join(rootDir, "jobs"),
    resultsDir: path.join(rootDir, "jobs", "results"),
    queuePath: path.join(rootDir, "jobs", "queue.json"),
    lockPath: path.join(rootDir, "jobs", ".worker.lock"),
    provider,
    ollamaBaseUrl: merged.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
    ollamaModel: merged.OLLAMA_MODEL ?? "qwen2.5-coder:latest",
    openAiApiKey: merged.OPENAI_API_KEY ?? "",
    openAiModel: merged.OPENAI_MODEL ?? "gpt-4.1-mini",
    geminiApiKey: merged.GEMINI_API_KEY ?? "",
    geminiModel: merged.GEMINI_MODEL ?? "gemini-2.5-flash",
    openClawAgentName: merged.OPENCLAW_AGENT_NAME ?? "SessionWebsiteFactory",
    maxParallelJobs: safeNumber(merged.MAX_PARALLEL_JOBS, 1),
    maxCpuPercent: safeNumber(merged.MAX_CPU_PERCENT, 80),
    maxRamPercent: safeNumber(merged.MAX_RAM_PERCENT, 85),
    jobTimeoutSeconds: safeNumber(merged.JOB_TIMEOUT_SECONDS, 900),
    fixTimeoutSeconds: safeNumber(merged.FIX_TIMEOUT_SECONDS, 1200),
    maxFixRounds: Math.min(3, safeNumber(merged.MAX_FIX_ROUNDS, 3)),
    defaultTemplate: templateCandidate as TemplateId,
    defaultLanguage: languageCandidate as LanguageMode,
    previewPort: safeNumber(merged.PREVIEW_PORT, 4173),
  };
}

function inferProjectName(idea: string): string {
  const cleaned = normalizeWhitespace(idea);
  return cleaned.split(/[:.!?]/)[0]?.slice(0, 60) || "Session Website Factory";
}

function renderUsage(): string {
  return [
    "# SessionWebsiteFactory CLI",
    "",
    "- swf new \"Idee\" [--template astro-landingpage|nextjs-landingpage] [--language de|en|bilingual]",
    "- swf build [--job <job-id>]",
    "- swf preview --job <job-id> [--port 4173] [--screenshot preview.png]",
    "- swf fix --job <job-id>",
    "- swf export --job <job-id>",
    "",
    "Anthropic und Claude werden nicht verwendet.",
  ].join("\n");
}

function renderJobTable(jobs: SessionWebsiteJob[]): string {
  if (jobs.length === 0) {
    return "Keine Jobs in der Queue.";
  }

  return [
    "| Job-ID | Status | Template | Sprache | Idee |",
    "| --- | --- | --- | --- | --- |",
    ...jobs.map((job) => `| ${job.id} | ${job.status} | ${job.template} | ${job.language} | ${job.idea.slice(0, 48)} |`),
  ].join("\n");
}

async function loadGeneratedProject(job: SessionWebsiteJob): Promise<GeneratedProject> {
  return {
    projectRoot: path.join(job.outputDir, "project"),
    previewRoot: path.join(job.outputDir, "preview"),
    exportRoot: path.join(job.outputDir, "export"),
    readmePath: path.join(job.outputDir, "README.generated.md"),
    planPath: path.join(job.outputDir, "plan.json"),
    previewIndexPath: path.join(job.outputDir, "preview", "index.html"),
  };
}

async function runBuildForJob(config: RuntimeConfig, job: SessionWebsiteJob): Promise<{ job: SessionWebsiteJob; reportPath: string }> {
  const plan = await buildWebsitePlan(job, config);
  const project = await generateWebsiteProject(job, plan, config);
  const fixReport = await runAutoFix(config, job, project);

  const finalJob = await updateJob(config, job.id, (currentJob) => ({
    ...currentJob,
    attempts: currentJob.attempts + 1,
    status: fixReport.ok ? "done" : "failed",
    error: fixReport.ok ? undefined : `Build oder Reparatur fehlgeschlagen. Siehe ${fixReport.buildReportPath}`,
  }));

  return { job: finalJob, reportPath: fixReport.buildReportPath };
}

async function commandNew(config: RuntimeConfig, flags: Record<string, string | boolean>, positional: string[]): Promise<string> {
  const idea = normalizeWhitespace(positional.join(" ") || getFlagString(flags, "idea"));
  if (!idea) {
    throw new Error("Idee fehlt. Beispiel: swf new \"Landingpage fuer lokalen KI-Scout\"");
  }

  const template = getFlagString(flags, "template", config.defaultTemplate) === "nextjs-landingpage"
    ? "nextjs-landingpage"
    : "astro-landingpage";
  const languageFlag = getFlagString(flags, "language", config.defaultLanguage);
  const language: LanguageMode = languageFlag === "de" || languageFlag === "en" ? languageFlag : "bilingual";
  const projectName = getFlagString(flags, "name", inferProjectName(idea));
  const providerFlag = getFlagString(flags, "provider", config.provider);
  const provider: LlmProvider =
    providerFlag === "openai" || providerFlag === "gemini" || providerFlag === "openclaw" ? providerFlag : "ollama";

  const job = await createJob(config, {
    idea,
    projectName,
    template,
    language,
    provider,
  });

  return [
    "# Neuer SessionWebsiteFactory-Job",
    "",
    `- Job-ID: ${job.id}`,
    `- Projektname: ${job.projectName}`,
    `- Template: ${job.template}`,
    `- Sprache: ${job.language}`,
    `- Provider: ${job.llmProvider}`,
    `- Status: ${job.status}`,
    "",
    "Naechster Schritt:",
    `swf build --job ${job.id}`,
  ].join("\n");
}

async function commandBuild(config: RuntimeConfig, flags: Record<string, string | boolean>): Promise<string> {
  const lockAcquired = await acquireLock(config);
  if (!lockAcquired) {
    throw new Error("Es laeuft bereits ein Worker oder ein anderer Build-Vorgang.");
  }

  let activeJobId = "";

  try {
    const resourceCheck = canStartHeavyWork(config);
    if (!resourceCheck.ok) {
      throw new Error(resourceCheck.reason ?? "Systemlast zu hoch.");
    }

    const jobId = getFlagString(flags, "job");
    const queue = await loadQueue(config);
    const runningJobs = queue.jobs.filter((job) => job.status === "running");
    if (runningJobs.length >= config.maxParallelJobs) {
      throw new Error("Maximale Parallelitaet erreicht.");
    }

    const job = jobId ? await getJob(config, jobId) : await pickNextPendingJob(config);
    if (!job) {
      throw new Error(jobId ? `Job nicht gefunden: ${jobId}` : "Kein wartender Job vorhanden.");
    }

    if (job.status !== "pending" && job.status !== "failed") {
      throw new Error(`Job ${job.id} ist nicht startbar, aktueller Status: ${job.status}`);
    }

    activeJobId = job.id;
    await updateJob(config, job.id, (currentJob) => ({
      ...currentJob,
      status: "running",
      error: undefined,
    }));

    const result = await runBuildForJob(config, job);
    return [
      "# SessionWebsiteFactory Build",
      "",
      `- Job-ID: ${result.job.id}`,
      `- Status: ${result.job.status}`,
      `- Ausgabe: ${result.job.outputDir}`,
      `- Build-Report: ${result.reportPath}`,
      "",
      "Naechste Schritte:",
      `swf preview --job ${result.job.id}`,
      `swf export --job ${result.job.id}`,
    ].join("\n");
  } catch (error) {
    if (activeJobId) {
      await updateJob(config, activeJobId, (job) => ({
        ...job,
        status: "failed",
        attempts: job.attempts + 1,
        error: error instanceof Error ? error.message : String(error),
      })).catch(() => undefined);
    }

    throw error;
  } finally {
    await releaseLock(config);
  }
}

async function commandPreview(config: RuntimeConfig, flags: Record<string, string | boolean>): Promise<string> {
  const jobId = getFlagString(flags, "job");
  if (!jobId) {
    throw new Error("preview benoetigt --job <job-id>.");
  }

  const job = await getJob(config, jobId);
  if (!job) {
    throw new Error(`Job nicht gefunden: ${jobId}`);
  }

  const project = await loadGeneratedProject(job);
  const port = safeNumber(getFlagString(flags, "port"), config.previewPort);
  const screenshotPath = getFlagString(flags, "screenshot");
  const server = await startPreviewServer(project, port, screenshotPath || undefined);
  await updateJob(config, job.id, (currentJob) => ({
    ...currentJob,
    previewUrl: server.url,
  }));

  setTimeout(() => {
    server.close().catch(() => undefined);
  }, 30_000).unref();

  return [
    "# SessionWebsiteFactory Preview",
    "",
    `- Job-ID: ${job.id}`,
    `- URL: ${server.url}`,
    "- Der Vorschau-Server bleibt fuer bis zu 30 Sekunden aktiv.",
    ...(server.screenshotMessage ? [`- ${server.screenshotMessage}`] : []),
  ].join("\n");
}

async function commandFix(config: RuntimeConfig, flags: Record<string, string | boolean>): Promise<string> {
  const jobId = getFlagString(flags, "job");
  if (!jobId) {
    throw new Error("fix benoetigt --job <job-id>.");
  }

  const job = await getJob(config, jobId);
  if (!job) {
    throw new Error(`Job nicht gefunden: ${jobId}`);
  }

  const project = await loadGeneratedProject(job);
  const report = await runAutoFix(config, job, project);
  await updateJob(config, job.id, (currentJob) => ({
    ...currentJob,
    status: report.ok ? "done" : "failed",
    error: report.ok ? undefined : `Fix fehlgeschlagen. Siehe ${report.buildReportPath}`,
  }));

  return [
    "# SessionWebsiteFactory Fix",
    "",
    `- Job-ID: ${job.id}`,
    `- Status: ${report.ok ? "done" : "failed"}`,
    `- Build-Report: ${report.buildReportPath}`,
    `- Runden: ${report.rounds.length}`,
  ].join("\n");
}

async function zipDirectory(sourceDir: string, zipPath: string): Promise<string> {
  const platform = os.platform();
  const command = platform === "win32"
    ? `powershell -NoProfile -Command "Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${zipPath}' -Force"`
    : `zip -r "${zipPath}" "${sourceDir}"`;

  return new Promise((resolve, reject) => {
    const child = spawn(command, {
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
        resolve(zipPath);
        return;
      }

      reject(new Error(stderr.trim() || "ZIP-Erstellung fehlgeschlagen."));
    });
  });
}

async function commandExport(config: RuntimeConfig, flags: Record<string, string | boolean>): Promise<string> {
  const jobId = getFlagString(flags, "job");
  if (!jobId) {
    throw new Error("export benoetigt --job <job-id>.");
  }

  const job = await getJob(config, jobId);
  if (!job) {
    throw new Error(`Job nicht gefunden: ${jobId}`);
  }

  const project = await loadGeneratedProject(job);
  await mkdir(project.exportRoot, { recursive: true });

  const generatedReadme = await readFile(project.readmePath, "utf8");
  await writeFile(path.join(project.projectRoot, "README.md"), generatedReadme);

  const commitMessage = `feat(session-website-factory): export ${job.slug}\n`;
  const commitPath = path.join(project.exportRoot, "git-commit.txt");
  await writeFile(
    commitPath,
    [
      `git add ${project.projectRoot}`,
      `git commit -m "${commitMessage.trim()}"`,
    ].join("\n"),
  );

  const zipPath = path.join(project.exportRoot, `${job.slug}.zip`);
  await zipDirectory(project.projectRoot, zipPath);

  return [
    "# SessionWebsiteFactory Export",
    "",
    `- Job-ID: ${job.id}`,
    `- ZIP: ${zipPath}`,
    `- Projekt-README: ${path.join(project.projectRoot, "README.md")}`,
    `- Build-Report: ${job.reportPath}`,
    `- Git-Vorlage: ${commitPath}`,
  ].join("\n");
}

async function commandStatus(config: RuntimeConfig): Promise<string> {
  const jobs = await listJobs(config);
  return [
    "# SessionWebsiteFactory Queue",
    "",
    renderJobTable(jobs),
  ].join("\n");
}

async function main(): Promise<void> {
  const rootDir = path.resolve(process.cwd());
  const config = await loadConfig(rootDir);
  await ensureQueueStorage(config);

  const [command = "help", ...rest] = process.argv.slice(2);
  const parsed = parseArgs(rest);

  let output = "";
  if (command === "help" || command === "--help" || command === "-h") {
    output = renderUsage();
  } else if (command === "new") {
    output = await commandNew(config, parsed.flags, parsed.positional);
  } else if (command === "build") {
    output = await commandBuild(config, parsed.flags);
  } else if (command === "preview") {
    output = await commandPreview(config, parsed.flags);
  } else if (command === "fix") {
    output = await commandFix(config, parsed.flags);
  } else if (command === "export") {
    output = await commandExport(config, parsed.flags);
  } else if (command === "status") {
    output = await commandStatus(config);
  } else {
    throw new Error(`Unbekannter Befehl: ${command}`);
  }

  process.stdout.write(`${output}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Fehler: ${message}\n`);
  process.exitCode = 1;
});
