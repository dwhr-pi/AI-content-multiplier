import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { QueueState, RuntimeConfig, SessionWebsiteJob, TemplateId, LanguageMode, LlmProvider } from "./types.js";

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "session-website";
}

function nowIso(): string {
  return new Date().toISOString();
}

function createJobId(): string {
  return `swf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function ensureQueueStorage(config: RuntimeConfig): Promise<void> {
  await mkdir(config.jobsDir, { recursive: true });
  await mkdir(config.resultsDir, { recursive: true });

  try {
    await stat(config.queuePath);
  } catch {
    await writeFile(config.queuePath, JSON.stringify({ jobs: [] }, null, 2));
  }
}

export async function loadQueue(config: RuntimeConfig): Promise<QueueState> {
  await ensureQueueStorage(config);
  const raw = await readFile(config.queuePath, "utf8");
  return safeJsonParse<QueueState>(raw, { jobs: [] });
}

export async function saveQueue(config: RuntimeConfig, state: QueueState): Promise<void> {
  await writeFile(config.queuePath, `${JSON.stringify(state, null, 2)}\n`);
}

export async function createJob(
  config: RuntimeConfig,
  input: {
    idea: string;
    projectName: string;
    template: TemplateId;
    language: LanguageMode;
    provider: LlmProvider;
  },
): Promise<SessionWebsiteJob> {
  const state = await loadQueue(config);
  const id = createJobId();
  const slug = slugify(input.projectName);
  const outputDir = path.join(config.resultsDir, id);
  const job: SessionWebsiteJob = {
    id,
    idea: input.idea,
    projectName: input.projectName,
    slug,
    template: input.template,
    language: input.language,
    status: "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attempts: 0,
    maxFixRounds: config.maxFixRounds,
    outputDir,
    reportPath: path.join(outputDir, "build-report.md"),
    llmProvider: input.provider,
  };

  state.jobs.push(job);
  await saveQueue(config, state);
  return job;
}

export async function acquireLock(config: RuntimeConfig): Promise<boolean> {
  await ensureQueueStorage(config);
  try {
    await stat(config.lockPath);
    return false;
  } catch {
    await writeFile(config.lockPath, `${process.pid}\n`, { flag: "wx" });
    return true;
  }
}

export async function releaseLock(config: RuntimeConfig): Promise<void> {
  await rm(config.lockPath, { force: true });
}

export async function getJob(config: RuntimeConfig, jobId: string): Promise<SessionWebsiteJob | undefined> {
  const state = await loadQueue(config);
  return state.jobs.find((job) => job.id === jobId);
}

export async function updateJob(
  config: RuntimeConfig,
  jobId: string,
  mutate: (job: SessionWebsiteJob) => SessionWebsiteJob,
): Promise<SessionWebsiteJob> {
  const state = await loadQueue(config);
  const index = state.jobs.findIndex((job) => job.id === jobId);
  if (index === -1) {
    throw new Error(`Job nicht gefunden: ${jobId}`);
  }

  const nextJob = mutate(state.jobs[index]);
  nextJob.updatedAt = nowIso();
  state.jobs[index] = nextJob;
  await saveQueue(config, state);
  return nextJob;
}

export async function pickNextPendingJob(config: RuntimeConfig): Promise<SessionWebsiteJob | undefined> {
  const state = await loadQueue(config);
  return state.jobs.find((job) => job.status === "pending");
}

export async function listJobs(config: RuntimeConfig): Promise<SessionWebsiteJob[]> {
  const state = await loadQueue(config);
  return [...state.jobs].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export function currentResourceSnapshot(): { cpuPercent: number; ramPercent: number } {
  const cpuLoad = os.loadavg()[0];
  const cpuPercent = Math.min(100, Math.max(0, Math.round((cpuLoad / Math.max(os.cpus().length, 1)) * 100)));
  const ramPercent = Math.min(
    100,
    Math.max(0, Math.round(((os.totalmem() - os.freemem()) / Math.max(os.totalmem(), 1)) * 100)),
  );

  return { cpuPercent, ramPercent };
}

export function canStartHeavyWork(config: RuntimeConfig): { ok: boolean; reason?: string } {
  if (config.maxParallelJobs <= 0) {
    return { ok: false, reason: "MAX_PARALLEL_JOBS ist ungueltig konfiguriert." };
  }

  const snapshot = currentResourceSnapshot();
  if (snapshot.cpuPercent > config.maxCpuPercent) {
    return { ok: false, reason: `CPU-Auslastung zu hoch (${snapshot.cpuPercent}% > ${config.maxCpuPercent}%).` };
  }

  if (snapshot.ramPercent > config.maxRamPercent) {
    return { ok: false, reason: `RAM-Auslastung zu hoch (${snapshot.ramPercent}% > ${config.maxRamPercent}%).` };
  }

  return { ok: true };
}
