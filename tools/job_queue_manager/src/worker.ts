import { createWriteStream } from "node:fs";
import { appendFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import process from "node:process";

import { ensureQueueEnvironment, readConfig } from "./config.js";
import {
  cancelJob,
  filterPendingJobs,
  findJob,
  loadQueueState,
  sortJobsForExecution,
  updateJob,
} from "./queue.js";
import { inspectSystem } from "./systemMonitor.js";
import type { QueueJob } from "./jobTypes.js";

export interface WorkerOptions {
  once?: boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPlaceholderArgs(job: QueueJob): string[] {
  const message = `[${job.type}] ${job.description}`;
  return ["-e", `console.log(${JSON.stringify(message)});`];
}

async function executeJob(jobId: string): Promise<void> {
  const job = await findJob(jobId);
  if (!job) {
    throw new Error(`Job nicht gefunden: ${jobId}`);
  }

  await updateJob(job.id, {
    status: "running",
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationMs: null,
    exitCode: null,
    attempts: job.attempts + 1,
    resourceNote: null,
  });

  const started = Date.now();
  const current = (await findJob(job.id)) as QueueJob;
  await ensureQueueEnvironment();

  const stdoutStream = createWriteStream(current.logFile, { flags: "a" });
  const stderrStream = createWriteStream(current.errorFile, { flags: "a" });

  const child = current.command
    ? spawn(current.command, {
        shell: true,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      })
    : spawn(process.execPath, buildPlaceholderArgs(current), {
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });

  child.stdout?.pipe(stdoutStream);
  child.stderr?.pipe(stderrStream);

  const result = await new Promise<{ exitCode: number | null; signal: NodeJS.Signals | null }>((resolve) => {
    child.on("close", (exitCode, signal) => resolve({ exitCode, signal }));
    child.on("error", async (error) => {
      await appendFile(current.errorFile, `${new Date().toISOString()} ${error.message}\n`, "utf8");
      resolve({ exitCode: 1, signal: null });
    });
  });

  stdoutStream.end();
  stderrStream.end();

  const durationMs = Date.now() - started;
  const success = result.exitCode === 0;

  await updateJob(job.id, {
    status: success ? "success" : "failed",
    endedAt: new Date().toISOString(),
    durationMs,
    exitCode: result.exitCode ?? (result.signal ? 1 : 0),
    resourceNote: result.signal ? `Prozess beendet durch Signal ${result.signal}` : null,
  });
}

async function recoverInterruptedJobs(): Promise<void> {
  const state = await loadQueueState();
  const interrupted = state.jobs.filter((job) => job.status === "running");

  for (const job of interrupted) {
    await updateJob(job.id, {
      status: "queued",
      startedAt: null,
      endedAt: null,
      durationMs: null,
      exitCode: null,
      resourceNote: "Vorheriger Worker wurde unterbrochen. Job erneut eingereiht.",
    });
  }
}

export async function runWorkerLoop(options: WorkerOptions = {}): Promise<void> {
  await recoverInterruptedJobs();
  const active = new Map<string, Promise<void>>();

  while (true) {
    const config = await readConfig();
    const state = await loadQueueState();

    if (state.paused) {
      if (options.once && active.size === 0) {
        return;
      }

      await sleep(config.poll_interval_ms);
      continue;
    }

    const pendingJobs = sortJobsForExecution(filterPendingJobs(state.jobs));
    const availableSlots = Math.max(0, config.max_parallel_jobs - active.size);

    if (availableSlots > 0 && pendingJobs.length > 0) {
      const snapshot = await inspectSystem(config);

      if (!snapshot.allowed) {
        for (const job of pendingJobs.slice(0, availableSlots)) {
          await updateJob(job.id, {
            status: "waiting_resources",
            resourceNote: snapshot.reasons.join("; "),
          });
        }

        if (options.once && active.size === 0) {
          return;
        }

        await sleep(config.poll_interval_ms);
        continue;
      }

      for (const job of pendingJobs.slice(0, availableSlots)) {
        const promise = executeJob(job.id).finally(() => {
          active.delete(job.id);
        });
        active.set(job.id, promise);
      }
    }

    if (active.size === 0) {
      if (options.once) {
        return;
      }

      const freshState = await loadQueueState();
      const hasPending = filterPendingJobs(freshState.jobs).length > 0;
      if (!hasPending) {
        await sleep(config.poll_interval_ms);
        continue;
      }
    }

    if (active.size > 0) {
      await Promise.race(active.values());
      continue;
    }

    await sleep(config.poll_interval_ms);
  }
}

export async function pauseWorkerQueue(): Promise<void> {
  const state = await loadQueueState();
  for (const job of state.jobs.filter((entry) => entry.status === "running")) {
    await cancelJob(job.id).catch(() => undefined);
  }
}
