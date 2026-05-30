import { readFile } from "node:fs/promises";
import process from "node:process";

import { ensureQueueEnvironment, readConfig } from "./config.js";
import { JOB_PRIORITIES, JOB_TYPES, isJobPriority, isJobType, type JobPriority, type JobType } from "./jobTypes.js";
import {
  addJob,
  cancelJob,
  countJobsByStatus,
  findJob,
  loadQueueState,
  moveJobsToStatus,
  setQueuePaused,
} from "./queue.js";
import { inspectSystem } from "./systemMonitor.js";
import { runWorkerLoop } from "./worker.js";
import { startDashboardServer } from "./dashboardServer.js";

interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
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

function hasFlag(flags: Record<string, string | boolean>, name: string): boolean {
  return Boolean(flags[name]);
}

function renderHelp(): string {
  return [
    "# ki-job-queue-manager",
    "",
    "## Befehle",
    "- kiq add \"beschreibung des auftrags\"",
    "- kiq add --type codex --command \"codex run --repo ./meinProjekt --task 'Fix build errors'\"",
    "- kiq list",
    "- kiq status",
    "- kiq run",
    "- kiq pause",
    "- kiq resume",
    "- kiq cancel <job-id>",
    "- kiq logs <job-id>",
    "- kiq dashboard",
    "- kiq config",
    "",
    `Unterstuetzte Job-Typen: ${JOB_TYPES.join(", ")}`,
    `Unterstuetzte Prioritaeten: ${JOB_PRIORITIES.join(", ")}`,
  ].join("\n");
}

async function handleAdd(args: ParsedArgs): Promise<void> {
  const description = args.positional.join(" ").trim();
  if (!description) {
    throw new Error("Bitte eine Auftragsbeschreibung angeben.");
  }

  const typeRaw = getFlagString(args.flags, "type", "custom");
  const priorityRaw = getFlagString(args.flags, "priority", "normal");

  if (!isJobType(typeRaw)) {
    throw new Error(`Unbekannter Job-Typ: ${typeRaw}`);
  }

  if (!isJobPriority(priorityRaw)) {
    throw new Error(`Unbekannte Prioritaet: ${priorityRaw}`);
  }

  const job = await addJob({
    description,
    type: typeRaw as JobType,
    priority: priorityRaw as JobPriority,
    command: getFlagString(args.flags, "command") || null,
  });

  process.stdout.write(
    [
      `Job angelegt: ${job.id}`,
      `- Typ: ${job.type}`,
      `- Prioritaet: ${job.priority}`,
      `- Status: ${job.status}`,
      `- Logdatei: ${job.logFile}`,
      `- Fehlerdatei: ${job.errorFile}`,
    ].join("\n") + "\n",
  );
}

async function handleList(): Promise<void> {
  const state = await loadQueueState();
  const rows = state.jobs
    .slice()
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map((job) => `${job.id} | ${job.status} | ${job.priority} | ${job.type} | ${job.description}`);

  process.stdout.write(
    rows.length > 0
      ? `${rows.join("\n")}\n`
      : "Keine Jobs in der Warteschlange.\n",
  );
}

async function handleStatus(): Promise<void> {
  const [state, config] = await Promise.all([loadQueueState(), readConfig()]);
  const counts = countJobsByStatus(state.jobs);
  const snapshot = await inspectSystem(config);

  process.stdout.write(
    [
      "# Queue-Status",
      `- Queue pausiert: ${state.paused ? "ja" : "nein"}`,
      `- Jobs gesamt: ${state.jobs.length}`,
      `- queued: ${counts.queued}`,
      `- waiting_resources: ${counts.waiting_resources}`,
      `- running: ${counts.running}`,
      `- success: ${counts.success}`,
      `- failed: ${counts.failed}`,
      `- cancelled: ${counts.cancelled}`,
      `- paused: ${counts.paused}`,
      "",
      "# Systemlast",
      `- CPU: ${snapshot.cpuPercent.toFixed(1)}%`,
      `- RAM: ${snapshot.ramPercent.toFixed(1)}%`,
      `- GPU: ${snapshot.gpuPercent === null ? "nicht verfuegbar" : `${snapshot.gpuPercent.toFixed(1)}%`}`,
      `- Freier Speicher: ${snapshot.freeDiskGb.toFixed(2)} GB`,
      `- Start erlaubt: ${snapshot.allowed ? "ja" : "nein"}`,
      ...(snapshot.reasons.length > 0 ? ["- Gruende:", ...snapshot.reasons.map((reason) => `  - ${reason}`)] : []),
    ].join("\n") + "\n",
  );
}

async function handleRun(args: ParsedArgs): Promise<void> {
  const once = hasFlag(args.flags, "once");
  process.stdout.write(`Worker gestartet${once ? " (ein Durchlauf)" : ""}...\n`);
  await runWorkerLoop({ once });
}

async function handlePause(): Promise<void> {
  await setQueuePaused(true);
  await moveJobsToStatus(["queued", "waiting_resources"], "paused", "Queue wurde manuell pausiert.");
  process.stdout.write("Queue wurde pausiert.\n");
}

async function handleResume(): Promise<void> {
  await setQueuePaused(false);
  await moveJobsToStatus(["paused"], "queued", "Queue wurde fortgesetzt.");
  process.stdout.write("Queue wurde fortgesetzt.\n");
}

async function handleCancel(args: ParsedArgs): Promise<void> {
  const jobId = args.positional[0];
  if (!jobId) {
    throw new Error("Bitte eine Job-ID zum Abbrechen angeben.");
  }

  const job = await cancelJob(jobId);
  process.stdout.write(`Job ${job.id} wurde auf ${job.status} gesetzt.\n`);
}

async function handleLogs(args: ParsedArgs): Promise<void> {
  const jobId = args.positional[0];
  if (!jobId) {
    throw new Error("Bitte eine Job-ID angeben.");
  }

  const job = await findJob(jobId);
  if (!job) {
    throw new Error(`Job nicht gefunden: ${jobId}`);
  }

  const [logContent, errorContent] = await Promise.all([
    readFile(job.logFile, "utf8").catch(() => ""),
    readFile(job.errorFile, "utf8").catch(() => ""),
  ]);

  process.stdout.write(
    [
      `# Logs fuer ${job.id}`,
      `- Logdatei: ${job.logFile}`,
      `- Fehlerdatei: ${job.errorFile}`,
      "",
      "## Standard-Log",
      logContent || "(leer)",
      "",
      "## Fehler-Log",
      errorContent || "(leer)",
    ].join("\n") + "\n",
  );
}

async function handleConfig(): Promise<void> {
  const config = await readConfig();
  process.stdout.write(`${JSON.stringify(config, null, 2)}\n`);
}

async function handleDashboard(args: ParsedArgs): Promise<void> {
  const host = getFlagString(args.flags, "host") || undefined;
  const portRaw = getFlagString(args.flags, "port");
  const port = portRaw ? Number.parseInt(portRaw, 10) : undefined;

  if (portRaw && !Number.isFinite(port)) {
    throw new Error(`Ungueltiger Port: ${portRaw}`);
  }

  await startDashboardServer(host, port);
}

async function main(): Promise<void> {
  await ensureQueueEnvironment();

  const [command = "help", ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  switch (command) {
    case "help":
    case "--help":
    case "-h":
      process.stdout.write(`${renderHelp()}\n`);
      return;
    case "add":
      await handleAdd(args);
      return;
    case "list":
      await handleList();
      return;
    case "status":
      await handleStatus();
      return;
    case "run":
      await handleRun(args);
      return;
    case "pause":
      await handlePause();
      return;
    case "resume":
      await handleResume();
      return;
    case "cancel":
      await handleCancel(args);
      return;
    case "logs":
      await handleLogs(args);
      return;
    case "config":
      await handleConfig();
      return;
    case "dashboard":
      await handleDashboard(args);
      return;
    default:
      throw new Error(`Unbekannter Befehl: ${command}`);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Fehler: ${message}\n`);
  process.exitCode = 1;
});
