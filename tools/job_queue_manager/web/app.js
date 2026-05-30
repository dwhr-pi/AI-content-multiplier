const state = {
  refreshTimer: null,
  selectedJobId: null,
  busyAction: false,
};

const elements = {
  lastUpdated: document.getElementById("lastUpdated"),
  queueBadge: document.getElementById("queueBadge"),
  systemMetrics: document.getElementById("systemMetrics"),
  systemReasons: document.getElementById("systemReasons"),
  statusCounters: document.getElementById("statusCounters"),
  configFacts: document.getElementById("configFacts"),
  runningJobs: document.getElementById("runningJobs"),
  blockedJobs: document.getElementById("blockedJobs"),
  queuedJobs: document.getElementById("queuedJobs"),
  pausedJobs: document.getElementById("pausedJobs"),
  finishedJobs: document.getElementById("finishedJobs"),
  runningCount: document.getElementById("runningCount"),
  blockedCount: document.getElementById("blockedCount"),
  queuedCount: document.getElementById("queuedCount"),
  pausedCount: document.getElementById("pausedCount"),
  finishedCount: document.getElementById("finishedCount"),
  logTitle: document.getElementById("logTitle"),
  logMeta: document.getElementById("logMeta"),
  stdoutLog: document.getElementById("stdoutLog"),
  stderrLog: document.getElementById("stderrLog"),
  dispatchButton: document.getElementById("dispatchButton"),
  pauseButton: document.getElementById("pauseButton"),
  resumeButton: document.getElementById("resumeButton"),
};

function fmtDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("de-DE");
}

function fmtDuration(ms) {
  if (ms == null) {
    return "-";
  }

  const seconds = Math.round(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes}m ${restSeconds}s`;
}

function createMetricCard(label, value, threshold, suffix = "%") {
  const percentage = Math.max(0, Math.min(100, Number(value)));
  const stateClass = percentage >= threshold ? "danger" : percentage >= threshold * 0.85 ? "warn" : "";
  return `
    <div class="metric-card">
      <div class="metric-head">
        <span>${label}</span>
        <strong>${value.toFixed(1)}${suffix}</strong>
      </div>
      <div class="meter"><span class="${stateClass}" style="width:${percentage}%"></span></div>
    </div>
  `;
}

function createDiskCard(label, value, threshold) {
  const safe = value >= threshold;
  const relative = Math.max(0, Math.min(100, (value / Math.max(threshold * 2, 1)) * 100));
  return `
    <div class="metric-card">
      <div class="metric-head">
        <span>${label}</span>
        <strong>${value.toFixed(2)} GB</strong>
      </div>
      <div class="meter"><span class="${safe ? "" : "danger"}" style="width:${relative}%"></span></div>
    </div>
  `;
}

function jobCard(job, options = {}) {
  const note = job.resourceNote ? `<div class="job-note">${job.resourceNote}</div>` : "";
  const cancelButton = options.allowCancel
    ? `<button class="button danger" data-action="cancel" data-job-id="${job.id}">Abbrechen</button>`
    : "";

  return `
    <article class="job-card">
      <div class="job-top">
        <div>
          <p class="job-id">${job.id}</p>
          <h3 class="job-title">${job.description}</h3>
        </div>
        <span class="badge neutral">${job.type}</span>
      </div>
      <div class="job-meta">
        <span>Status: ${job.status}</span>
        <span>Prioritaet: ${job.priority}</span>
        <span>Erstellt: ${fmtDate(job.createdAt)}</span>
        <span>Dauer: ${fmtDuration(job.durationMs)}</span>
      </div>
      ${note}
      <div class="job-actions">
        <button class="button muted" data-action="logs" data-job-id="${job.id}">Logs ansehen</button>
        ${cancelButton}
      </div>
    </article>
  `;
}

function renderJobColumn(target, jobs, options = {}) {
  if (!jobs.length) {
    target.className = "job-list empty-state";
    target.innerHTML = options.emptyText;
    return;
  }

  target.className = "job-list";
  target.innerHTML = jobs.map((job) => jobCard(job, options)).join("");
}

function renderOverview(data) {
  elements.lastUpdated.textContent = `Aktualisiert: ${fmtDate(data.generatedAt)}`;
  elements.queueBadge.textContent = data.queuePaused ? "Queue pausiert" : "Queue aktiv";
  elements.queueBadge.className = `badge ${data.queuePaused ? "warning" : "success"}`;

  const system = data.system;
  elements.systemMetrics.innerHTML = [
    createMetricCard("CPU", system.cpuPercent, data.config.max_cpu_percent),
    createMetricCard("RAM", system.ramPercent, data.config.max_ram_percent),
    system.gpuPercent == null
      ? `<div class="metric-card"><div class="metric-head"><span>GPU</span><strong>nicht verfuegbar</strong></div><div class="meter"><span style="width:0%"></span></div></div>`
      : createMetricCard("GPU", system.gpuPercent, data.config.max_gpu_percent),
    createDiskCard("Freier Speicher", system.freeDiskGb, data.config.min_free_disk_gb),
  ].join("");

  elements.systemReasons.innerHTML = system.allowed
    ? `<div class="reason-chip">Ressourcenlage ist innerhalb der Grenzwerte.</div>`
    : system.reasons.map((reason) => `<div class="reason-chip">${reason}</div>`).join("");

  elements.statusCounters.innerHTML = [
    ["Queued", data.counts.queued],
    ["Ressourcenblockiert", data.counts.waiting_resources],
    ["Laufend", data.counts.running],
    ["Abgeschlossen", data.counts.success],
    ["Fehlgeschlagen", data.counts.failed],
    ["Pausiert", data.counts.paused],
  ].map(([label, value]) => `
    <div class="counter-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  elements.configFacts.innerHTML = [
    `Maximale Parallelitaet: ${data.config.max_parallel_jobs}`,
    `CPU-Grenzwert: ${data.config.max_cpu_percent}%`,
    `RAM-Grenzwert: ${data.config.max_ram_percent}%`,
    `GPU-Grenzwert: ${data.config.max_gpu_percent}%`,
    `Minimal freier Speicher: ${data.config.min_free_disk_gb} GB`,
    `Auto-Refresh: ${Math.round(data.config.dashboard_refresh_ms / 1000)}s`,
  ].map((item) => `<div>${item}</div>`).join("");

  elements.runningCount.textContent = String(data.runningJobs.length);
  elements.blockedCount.textContent = String(data.blockedJobs.length);
  elements.queuedCount.textContent = String(data.queuedJobs.length);
  elements.pausedCount.textContent = String(data.pausedJobs.length);
  elements.finishedCount.textContent = String(data.finishedJobs.length);

  renderJobColumn(elements.runningJobs, data.runningJobs, {
    emptyText: "Keine laufenden Jobs.",
    allowCancel: true,
  });
  renderJobColumn(elements.blockedJobs, data.blockedJobs, {
    emptyText: "Keine blockierten Jobs.",
    allowCancel: true,
  });
  renderJobColumn(elements.queuedJobs, data.queuedJobs, {
    emptyText: "Keine wartenden Jobs.",
    allowCancel: true,
  });
  renderJobColumn(elements.pausedJobs, data.pausedJobs, {
    emptyText: "Keine pausierten Jobs.",
    allowCancel: true,
  });
  renderJobColumn(elements.finishedJobs, data.finishedJobs, {
    emptyText: "Noch keine abgeschlossenen Jobs.",
    allowCancel: false,
  });

  scheduleRefresh(data.config.dashboard_refresh_ms || 5000);
}

async function fetchOverview() {
  const response = await fetch("/api/overview");
  if (!response.ok) {
    throw new Error(`Uebersicht konnte nicht geladen werden (${response.status})`);
  }
  return response.json();
}

async function loadOverview() {
  try {
    const data = await fetchOverview();
    renderOverview(data);

    if (state.selectedJobId) {
      await loadLogs(state.selectedJobId, false);
    }
  } catch (error) {
    elements.lastUpdated.textContent = error instanceof Error ? error.message : String(error);
  }
}

function scheduleRefresh(ms) {
  clearTimeout(state.refreshTimer);
  state.refreshTimer = window.setTimeout(() => {
    loadOverview();
  }, ms);
}

async function loadLogs(jobId, focus = true) {
  try {
    state.selectedJobId = jobId;
    const response = await fetch(`/api/jobs/${jobId}/logs`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Logs konnten nicht geladen werden.");
    }

    const { job, logs } = payload;
    elements.logTitle.textContent = job.description;
    elements.logMeta.innerHTML = [
      `Job-ID: ${job.id}`,
      `Status: ${job.status}`,
      `Typ: ${job.type}`,
      `Prioritaet: ${job.priority}`,
      `Start: ${fmtDate(job.startedAt)}`,
      `Ende: ${fmtDate(job.endedAt)}`,
      `Dauer: ${fmtDuration(job.durationMs)}`,
      `Exit-Code: ${job.exitCode ?? "-"}`,
    ].map((item) => `<div>${item}</div>`).join("");
    elements.stdoutLog.textContent = logs.stdout || "(leer)";
    elements.stderrLog.textContent = logs.stderr || "(leer)";

    if (focus) {
      elements.stdoutLog.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    elements.logTitle.textContent = "Fehler";
    elements.logMeta.innerHTML = "";
    elements.stdoutLog.textContent = error instanceof Error ? error.message : String(error);
    elements.stderrLog.textContent = "";
  }
}

async function postAction(action) {
  if (state.busyAction) {
    return;
  }

  state.busyAction = true;
  setButtonsDisabled(true);
  try {
    const response = await fetch("/api/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Aktion fehlgeschlagen.");
    }
    renderOverview(payload.overview);
  } catch (error) {
    window.alert(error instanceof Error ? error.message : String(error));
  } finally {
    state.busyAction = false;
    setButtonsDisabled(false);
  }
}

async function cancelJob(jobId) {
  if (!window.confirm(`Job ${jobId} wirklich abbrechen?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/jobs/${jobId}/cancel`, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Abbruch fehlgeschlagen.");
    }
    renderOverview(payload.overview);
    if (state.selectedJobId === jobId) {
      await loadLogs(jobId, false);
    }
  } catch (error) {
    window.alert(error instanceof Error ? error.message : String(error));
  }
}

function setButtonsDisabled(disabled) {
  elements.dispatchButton.disabled = disabled;
  elements.pauseButton.disabled = disabled;
  elements.resumeButton.disabled = disabled;
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  const jobId = target.dataset.jobId;

  if (action === "logs" && jobId) {
    loadLogs(jobId);
  }

  if (action === "cancel" && jobId) {
    cancelJob(jobId);
  }
});

elements.dispatchButton.addEventListener("click", () => postAction("dispatch"));
elements.pauseButton.addEventListener("click", () => postAction("pause"));
elements.resumeButton.addEventListener("click", () => postAction("resume"));

loadOverview();
