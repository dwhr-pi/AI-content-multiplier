import { statfs } from "node:fs/promises";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { QueueConfig } from "./jobTypes.js";

const execFileAsync = promisify(execFile);

export interface SystemSnapshot {
  cpuPercent: number;
  ramPercent: number;
  gpuPercent: number | null;
  freeDiskGb: number;
  allowed: boolean;
  reasons: string[];
}

interface CpuSample {
  idle: number;
  total: number;
}

function readCpuSample(): CpuSample {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;

  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
  }

  return { idle, total };
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCpuPercent(): Promise<number> {
  const first = readCpuSample();
  await sleep(250);
  const second = readCpuSample();

  const idleDiff = second.idle - first.idle;
  const totalDiff = second.total - first.total;

  if (totalDiff <= 0) {
    return 0;
  }

  const usage = 100 - (idleDiff / totalDiff) * 100;
  return Math.max(0, Math.min(100, usage));
}

function getRamPercent(): number {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return (used / total) * 100;
}

async function getGpuPercent(): Promise<number | null> {
  try {
    const result = await execFileAsync(
      "nvidia-smi",
      ["--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"],
      { windowsHide: true, timeout: 3000 },
    );

    const values = result.stdout
      .split(/\r?\n/)
      .map((line) => Number.parseFloat(line.trim()))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  } catch {
    return null;
  }
}

async function getFreeDiskGb(targetPath: string): Promise<number> {
  const info = await statfs(targetPath);
  const freeBytes = Number(info.bavail) * Number(info.bsize);
  return freeBytes / 1024 / 1024 / 1024;
}

export async function inspectSystem(config: QueueConfig): Promise<SystemSnapshot> {
  const [cpuPercent, gpuPercent] = await Promise.all([
    getCpuPercent(),
    getGpuPercent(),
  ]);
  const ramPercent = getRamPercent();
  const freeDiskGb = await getFreeDiskGb(config.queue_base_dir);

  const reasons: string[] = [];

  if (cpuPercent >= config.max_cpu_percent) {
    reasons.push(`CPU ueber Grenzwert (${cpuPercent.toFixed(1)}% >= ${config.max_cpu_percent}%)`);
  }

  if (ramPercent >= config.max_ram_percent) {
    reasons.push(`RAM ueber Grenzwert (${ramPercent.toFixed(1)}% >= ${config.max_ram_percent}%)`);
  }

  if (gpuPercent !== null && gpuPercent >= config.max_gpu_percent) {
    reasons.push(`GPU ueber Grenzwert (${gpuPercent.toFixed(1)}% >= ${config.max_gpu_percent}%)`);
  }

  if (freeDiskGb < config.min_free_disk_gb) {
    reasons.push(`Freier Speicher zu niedrig (${freeDiskGb.toFixed(2)} GB < ${config.min_free_disk_gb} GB)`);
  }

  return {
    cpuPercent,
    ramPercent,
    gpuPercent,
    freeDiskGb,
    allowed: reasons.length === 0,
    reasons,
  };
}
