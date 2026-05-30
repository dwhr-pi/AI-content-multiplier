import { readFile } from "node:fs/promises";

import { readConfig } from "./config.js";
import { countJobsByStatus, loadQueueState } from "./queue.js";
import { inspectSystem, type SystemSnapshot } from "./systemMonitor.js";
import type { QueueConfig, QueueJob, QueueState } from "./jobTypes.js";

export interface DashboardOverview {
  generatedAt: string;
  queuePaused: boolean;
  config: Pick<
    QueueConfig,
    | "max_parallel_jobs"
    | "max_cpu_percent"
    | "max_ram_percent"
    | "max_gpu_percent"
    | "min_free_disk_gb"
    | "poll_interval_ms"
    | "dashboard_refresh_ms"
  >;
  counts: ReturnType<typeof countJobsByStatus>;
  system: SystemSnapshot;
  runningJobs: QueueJob[];
  blockedJobs: QueueJob[];
  queuedJobs: QueueJob[];
  pausedJobs: QueueJob[];
  finishedJobs: QueueJob[];
}

function sortNewestFirst(jobs: QueueJob[]): QueueJob[] {
  return [...jobs].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function sortByCreatedOldestFirst(jobs: QueueJob[]): QueueJob[] {
  return [...jobs].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function buildDashboardOverview(): Promise<DashboardOverview> {
  const [state, config] = await Promise.all([loadQueueState(), readConfig()]);
  const system = await inspectSystem(config);
  const counts = countJobsByStatus(state.jobs);

  return {
    generatedAt: new Date().toISOString(),
    queuePaused: state.paused,
    config: {
      max_parallel_jobs: config.max_parallel_jobs,
      max_cpu_percent: config.max_cpu_percent,
      max_ram_percent: config.max_ram_percent,
      max_gpu_percent: config.max_gpu_percent,
      min_free_disk_gb: config.min_free_disk_gb,
      poll_interval_ms: config.poll_interval_ms,
      dashboard_refresh_ms: config.dashboard_refresh_ms,
    },
    counts,
    system,
    runningJobs: sortNewestFirst(state.jobs.filter((job) => job.status === "running")),
    blockedJobs: sortByCreatedOldestFirst(state.jobs.filter((job) => job.status === "waiting_resources")),
    queuedJobs: sortByCreatedOldestFirst(state.jobs.filter((job) => job.status === "queued")),
    pausedJobs: sortByCreatedOldestFirst(state.jobs.filter((job) => job.status === "paused")),
    finishedJobs: sortNewestFirst(
      state.jobs.filter((job) => ["success", "failed", "cancelled"].includes(job.status)),
    ).slice(0, 12),
  };
}

export async function getDashboardJob(jobId: string): Promise<QueueJob | undefined> {
  const state: QueueState = await loadQueueState();
  return state.jobs.find((job) => job.id === jobId);
}

export async function readJobLogs(job: QueueJob): Promise<{ stdout: string; stderr: string }> {
  const [stdout, stderr] = await Promise.all([
    readFile(job.logFile, "utf8").catch(() => ""),
    readFile(job.errorFile, "utf8").catch(() => ""),
  ]);

  return {
    stdout: stdout.slice(-50_000),
    stderr: stderr.slice(-50_000),
  };
}
