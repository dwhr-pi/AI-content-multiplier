import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { QueueConfig } from "./jobTypes.js";

export interface QueuePaths {
  baseDir: string;
  configFile: string;
  queueFile: string;
  logsDir: string;
}

const DEFAULT_BASE_DIR = path.join(os.homedir(), ".ultimate-ki", "job-queue");

const DEFAULT_CONFIG: QueueConfig = {
  max_parallel_jobs: 1,
  max_cpu_percent: 75,
  max_ram_percent: 80,
  max_gpu_percent: 85,
  min_free_disk_gb: 5,
  poll_interval_ms: 5000,
  queue_base_dir: DEFAULT_BASE_DIR,
  dashboard_host: "127.0.0.1",
  dashboard_port: 4310,
  dashboard_refresh_ms: 5000,
};

export function getQueuePaths(baseDir = DEFAULT_BASE_DIR): QueuePaths {
  return {
    baseDir,
    configFile: path.join(baseDir, "config.json"),
    queueFile: path.join(baseDir, "queue.jsonl"),
    logsDir: path.join(baseDir, "logs"),
  };
}

export async function ensureQueueEnvironment(): Promise<QueuePaths> {
  const paths = getQueuePaths();
  await mkdir(paths.baseDir, { recursive: true });
  await mkdir(paths.logsDir, { recursive: true });

  try {
    await readFile(paths.configFile, "utf8");
  } catch {
    await writeFile(paths.configFile, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`, "utf8");
  }

  try {
    await readFile(paths.queueFile, "utf8");
  } catch {
    await writeFile(paths.queueFile, "", "utf8");
  }

  return paths;
}

export async function readConfig(): Promise<QueueConfig> {
  const paths = await ensureQueueEnvironment();
  const raw = await readFile(paths.configFile, "utf8");
  const parsed = JSON.parse(raw) as Partial<QueueConfig>;

  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    queue_base_dir: parsed.queue_base_dir ?? DEFAULT_CONFIG.queue_base_dir,
  };
}

export async function writeConfig(config: QueueConfig): Promise<void> {
  const paths = await ensureQueueEnvironment();
  await writeFile(paths.configFile, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function getDefaultConfig(): QueueConfig {
  return { ...DEFAULT_CONFIG };
}
