import { appendFile, readFile } from "node:fs/promises";

import { ensureQueueEnvironment, type QueuePaths } from "./config.js";
import {
  createJob,
  priorityWeight,
  type AddJobInput,
  type JobStatus,
  type QueueJob,
  type QueueState,
} from "./jobTypes.js";

type QueueEvent =
  | {
      kind: "job_added";
      timestamp: string;
      job: QueueJob;
    }
  | {
      kind: "job_updated";
      timestamp: string;
      jobId: string;
      patch: Partial<QueueJob>;
    }
  | {
      kind: "queue_paused";
      timestamp: string;
    }
  | {
      kind: "queue_resumed";
      timestamp: string;
    };

async function appendEvent(event: QueueEvent, paths?: QueuePaths): Promise<void> {
  const resolvedPaths = paths ?? (await ensureQueueEnvironment());
  await appendFile(resolvedPaths.queueFile, `${JSON.stringify(event)}\n`, "utf8");
}

function applyEvents(events: QueueEvent[]): QueueState {
  const jobs = new Map<string, QueueJob>();
  let paused = false;

  for (const event of events) {
    if (event.kind === "job_added") {
      jobs.set(event.job.id, event.job);
      continue;
    }

    if (event.kind === "job_updated") {
      const current = jobs.get(event.jobId);
      if (!current) {
        continue;
      }

      jobs.set(event.jobId, {
        ...current,
        ...event.patch,
        updatedAt: event.timestamp,
      });
      continue;
    }

    if (event.kind === "queue_paused") {
      paused = true;
      continue;
    }

    paused = false;
  }

  return {
    jobs: [...jobs.values()],
    paused,
  };
}

export async function loadQueueState(): Promise<QueueState> {
  const paths = await ensureQueueEnvironment();
  const raw = await readFile(paths.queueFile, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const events = lines.map((line) => JSON.parse(line) as QueueEvent);
  return applyEvents(events);
}

export async function addJob(input: Omit<AddJobInput, "logsDir">): Promise<QueueJob> {
  const paths = await ensureQueueEnvironment();
  const job = createJob({
    ...input,
    logsDir: paths.logsDir,
  });

  await appendEvent(
    {
      kind: "job_added",
      timestamp: new Date().toISOString(),
      job,
    },
    paths,
  );

  return job;
}

export async function updateJob(jobId: string, patch: Partial<QueueJob>): Promise<void> {
  const paths = await ensureQueueEnvironment();
  await appendEvent(
    {
      kind: "job_updated",
      timestamp: new Date().toISOString(),
      jobId,
      patch,
    },
    paths,
  );
}

export async function setQueuePaused(paused: boolean): Promise<void> {
  const paths = await ensureQueueEnvironment();
  await appendEvent(
    {
      kind: paused ? "queue_paused" : "queue_resumed",
      timestamp: new Date().toISOString(),
    },
    paths,
  );
}

export async function moveJobsToStatus(
  fromStatuses: JobStatus[],
  nextStatus: JobStatus,
  resourceNote: string | null = null,
): Promise<void> {
  const state = await loadQueueState();
  const candidates = state.jobs.filter((job) => fromStatuses.includes(job.status));

  for (const job of candidates) {
    await updateJob(job.id, {
      status: nextStatus,
      resourceNote,
    });
  }
}

export async function findJob(jobId: string): Promise<QueueJob | undefined> {
  const state = await loadQueueState();
  return state.jobs.find((job) => job.id === jobId);
}

export async function cancelJob(jobId: string): Promise<QueueJob> {
  const job = await findJob(jobId);
  if (!job) {
    throw new Error(`Job nicht gefunden: ${jobId}`);
  }

  if (job.status === "success" || job.status === "failed") {
    throw new Error(`Job ${jobId} ist bereits abgeschlossen und kann nicht mehr abgebrochen werden.`);
  }

  await updateJob(jobId, {
    status: "cancelled",
    endedAt: new Date().toISOString(),
    resourceNote: "Vom Benutzer abgebrochen.",
  });

  return (await findJob(jobId)) as QueueJob;
}

export function sortJobsForExecution(jobs: QueueJob[]): QueueJob[] {
  return [...jobs].sort((left, right) => {
    const priorityOrder = priorityWeight(left.priority) - priorityWeight(right.priority);
    if (priorityOrder !== 0) {
      return priorityOrder;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

export function filterPendingJobs(jobs: QueueJob[]): QueueJob[] {
  return jobs.filter((job) => job.status === "queued" || job.status === "waiting_resources");
}

export function countJobsByStatus(jobs: QueueJob[]): Record<JobStatus, number> {
  return {
    queued: jobs.filter((job) => job.status === "queued").length,
    waiting_resources: jobs.filter((job) => job.status === "waiting_resources").length,
    running: jobs.filter((job) => job.status === "running").length,
    success: jobs.filter((job) => job.status === "success").length,
    failed: jobs.filter((job) => job.status === "failed").length,
    cancelled: jobs.filter((job) => job.status === "cancelled").length,
    paused: jobs.filter((job) => job.status === "paused").length,
  };
}
