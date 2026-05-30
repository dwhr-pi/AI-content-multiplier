import { randomUUID } from "node:crypto";
import path from "node:path";

export const JOB_TYPES = [
  "codex",
  "openclaw",
  "ollama",
  "n8n",
  "whisper",
  "video",
  "image",
  "shell",
  "custom",
] as const;

export const JOB_PRIORITIES = ["high", "normal", "low"] as const;

export const JOB_STATUSES = [
  "queued",
  "waiting_resources",
  "running",
  "success",
  "failed",
  "cancelled",
  "paused",
] as const;

export type JobType = (typeof JOB_TYPES)[number];
export type JobPriority = (typeof JOB_PRIORITIES)[number];
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface QueueJob {
  id: string;
  description: string;
  type: JobType;
  priority: JobPriority;
  command: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  endedAt: string | null;
  durationMs: number | null;
  exitCode: number | null;
  logFile: string;
  errorFile: string;
  attempts: number;
  resourceNote: string | null;
}

export interface QueueState {
  jobs: QueueJob[];
  paused: boolean;
}

export interface AddJobInput {
  description: string;
  type: JobType;
  priority: JobPriority;
  command: string | null;
  logsDir: string;
}

export interface QueueConfig {
  max_parallel_jobs: number;
  max_cpu_percent: number;
  max_ram_percent: number;
  max_gpu_percent: number;
  min_free_disk_gb: number;
  poll_interval_ms: number;
  queue_base_dir: string;
  dashboard_host: string;
  dashboard_port: number;
  dashboard_refresh_ms: number;
}

export function isJobType(value: string): value is JobType {
  return JOB_TYPES.includes(value as JobType);
}

export function isJobPriority(value: string): value is JobPriority {
  return JOB_PRIORITIES.includes(value as JobPriority);
}

export function createJob(input: AddJobInput): QueueJob {
  const id = randomUUID();
  const timestamp = new Date().toISOString();

  return {
    id,
    description: input.description,
    type: input.type,
    priority: input.priority,
    command: input.command,
    status: "queued",
    createdAt: timestamp,
    updatedAt: timestamp,
    startedAt: null,
    endedAt: null,
    durationMs: null,
    exitCode: null,
    logFile: path.join(input.logsDir, `${id}.log`),
    errorFile: path.join(input.logsDir, `${id}.err.log`),
    attempts: 0,
    resourceNote: null,
  };
}

export function priorityWeight(priority: JobPriority): number {
  switch (priority) {
    case "high":
      return 0;
    case "normal":
      return 1;
    case "low":
      return 2;
  }
}
