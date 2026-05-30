#!/usr/bin/env python3
from __future__ import annotations

import argparse
import ctypes
import json
import os
import shlex
import shutil
import signal
import subprocess
import sys
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple


PRIORITY_ORDER = {
    "critical": 0,
    "high": 1,
    "normal": 2,
    "low": 3,
}
RESOURCE_CLASSES = {"light", "medium", "heavy", "gpu"}
FINAL_STATUSES = {"success", "failed", "cancelled"}
PENDING_STATUSES = {"queued", "waiting_resources"}
VISIBLE_STATUSES = [
    "queued",
    "waiting_resources",
    "running",
    "success",
    "failed",
    "cancelled",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_env_file(path: Path) -> Dict[str, str]:
    data: Dict[str, str] = {}
    if not path.exists():
        return data

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data


def is_pid_alive(pid: Optional[int]) -> bool:
    if not pid or pid <= 0:
        return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def tail_text(path: Path, max_lines: int) -> str:
    if not path.exists():
        return "(leer)"
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    if not lines:
        return "(leer)"
    return "\n".join(lines[-max_lines:])


@dataclass
class QueuePaths:
    base_dir: Path
    config_file: Path
    jobs_dir: Path
    logs_dir: Path
    run_dir: Path
    lock_file: Path


@dataclass
class ResourceSnapshot:
    cpu_percent: Optional[float]
    ram_percent: Optional[float]
    gpu_percent: Optional[float]
    free_disk_gb: float
    allowed: bool
    reasons: List[str]


class QueueRuntime:
    def __init__(self) -> None:
        home = Path.home()
        self.defaults = {
            "QUEUE_BASE_DIR": str(home / ".ultimate-ki" / "queue-job-manager"),
            "QUEUE_MAX_PARALLEL_JOBS": "2",
            "QUEUE_MAX_LIGHT_JOBS": "4",
            "QUEUE_MAX_MEDIUM_JOBS": "2",
            "QUEUE_MAX_HEAVY_JOBS": "1",
            "QUEUE_MAX_GPU_JOBS": "1",
            "QUEUE_DEFAULT_RETRY_LIMIT": "1",
            "QUEUE_POLL_INTERVAL_SECONDS": "5",
            "QUEUE_LOG_TAIL_LINES": "80",
            "QUEUE_MAX_CPU_PERCENT": "85",
            "QUEUE_MAX_RAM_PERCENT": "85",
            "QUEUE_MAX_GPU_PERCENT": "90",
            "QUEUE_MIN_FREE_DISK_GB": "5",
        }

        env_config = dict(self.defaults)
        env_config.update({key: value for key, value in os.environ.items() if key.startswith("QUEUE_")})

        provisional_base = Path(env_config["QUEUE_BASE_DIR"]).expanduser()
        provisional_config = provisional_base / "queue.env"
        file_config = parse_env_file(provisional_config)
        env_config.update(file_config)
        env_config.update({key: value for key, value in os.environ.items() if key.startswith("QUEUE_")})
        self.config = env_config

        base_dir = Path(self.config["QUEUE_BASE_DIR"]).expanduser()
        self.paths = QueuePaths(
            base_dir=base_dir,
            config_file=base_dir / "queue.env",
            jobs_dir=base_dir / "jobs",
            logs_dir=base_dir / "logs",
            run_dir=base_dir / "run",
            lock_file=base_dir / "run" / "worker.lock",
        )

    def ensure(self) -> None:
        self.paths.base_dir.mkdir(parents=True, exist_ok=True)
        self.paths.jobs_dir.mkdir(parents=True, exist_ok=True)
        self.paths.logs_dir.mkdir(parents=True, exist_ok=True)
        self.paths.run_dir.mkdir(parents=True, exist_ok=True)

    def get_int(self, key: str) -> int:
        return int(self.config[key])

    def get_float(self, key: str) -> float:
        return float(self.config[key])

    def class_limit(self, resource_class: str) -> int:
        mapping = {
            "light": self.get_int("QUEUE_MAX_LIGHT_JOBS"),
            "medium": self.get_int("QUEUE_MAX_MEDIUM_JOBS"),
            "heavy": self.get_int("QUEUE_MAX_HEAVY_JOBS"),
            "gpu": self.get_int("QUEUE_MAX_GPU_JOBS"),
        }
        return mapping[resource_class]


def load_jobs(runtime: QueueRuntime) -> List[Dict[str, object]]:
    runtime.ensure()
    jobs: List[Dict[str, object]] = []
    for path in sorted(runtime.paths.jobs_dir.glob("*.json")):
        try:
            jobs.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            continue
    return jobs


def save_job(runtime: QueueRuntime, job: Dict[str, object]) -> None:
    runtime.ensure()
    job["updated_at"] = utc_now()
    path = runtime.paths.jobs_dir / f"{job['id']}.json"
    path.write_text(json.dumps(job, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def get_job(runtime: QueueRuntime, job_id: str) -> Dict[str, object]:
    path = runtime.paths.jobs_dir / f"{job_id}.json"
    if not path.exists():
        raise SystemExit(f"Job nicht gefunden: {job_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def build_job_id() -> str:
    prefix = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def build_job_command(description: str, command: Optional[str], dry_run: bool) -> str:
    if dry_run:
        payload = command or description
        return f"printf '%s\\n' {shlex.quote(f'DRY RUN: {payload}')}"
    if command:
        return command
    return f"printf '%s\\n' {shlex.quote(description)}"


def sort_candidate_jobs(jobs: Iterable[Dict[str, object]]) -> List[Dict[str, object]]:
    return sorted(
        jobs,
        key=lambda job: (
            PRIORITY_ORDER.get(str(job["priority"]), PRIORITY_ORDER["normal"]),
            str(job["created_at"]),
        ),
    )


def running_jobs(jobs: Iterable[Dict[str, object]]) -> List[Dict[str, object]]:
    return [job for job in jobs if job.get("status") == "running"]


def pending_jobs(jobs: Iterable[Dict[str, object]]) -> List[Dict[str, object]]:
    return [job for job in jobs if str(job.get("status")) in PENDING_STATUSES]


def kill_process_tree(pid: int) -> None:
    try:
        os.kill(pid, signal.SIGTERM)
    except OSError:
        return

    for _ in range(20):
        if not is_pid_alive(pid):
            return
        time.sleep(0.25)

    try:
        os.kill(pid, signal.SIGKILL)
    except OSError:
        return


class WorkerLock:
    def __init__(self, runtime: QueueRuntime) -> None:
        self.runtime = runtime
        self.acquired = False

    def __enter__(self) -> "WorkerLock":
        self.runtime.ensure()
        while True:
            try:
                fd = os.open(self.runtime.paths.lock_file, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                with os.fdopen(fd, "w", encoding="utf-8") as handle:
                    handle.write(f"{os.getpid()}\n")
                self.acquired = True
                return self
            except FileExistsError:
                try:
                    pid = int(self.runtime.paths.lock_file.read_text(encoding="utf-8").strip() or "0")
                except Exception:
                    pid = 0
                if not is_pid_alive(pid):
                    try:
                        self.runtime.paths.lock_file.unlink()
                    except FileNotFoundError:
                        pass
                    continue
                raise SystemExit(f"Worker laeuft bereits mit PID {pid}.")

    def __exit__(self, exc_type, exc, tb) -> None:
        if self.acquired:
            try:
                self.runtime.paths.lock_file.unlink()
            except FileNotFoundError:
                pass


def _cpu_percent_posix() -> Optional[float]:
    if not hasattr(os, "getloadavg"):
        return None
    try:
        load1, _, _ = os.getloadavg()
    except OSError:
        return None
    cpu_count = os.cpu_count() or 1
    return max(0.0, min(100.0, (load1 / cpu_count) * 100.0))


def _ram_percent_linux() -> Optional[float]:
    meminfo = Path("/proc/meminfo")
    if not meminfo.exists():
        return None
    values: Dict[str, int] = {}
    for line in meminfo.read_text(encoding="utf-8").splitlines():
        if ":" not in line:
            continue
        key, rest = line.split(":", 1)
        parts = rest.strip().split()
        if not parts:
            continue
        try:
            values[key] = int(parts[0])
        except ValueError:
            continue
    total = values.get("MemTotal")
    available = values.get("MemAvailable")
    if not total or not available:
        return None
    used = total - available
    return max(0.0, min(100.0, (used / total) * 100.0))


def _ram_percent_windows() -> Optional[float]:
    if os.name != "nt":
        return None

    class MemoryStatus(ctypes.Structure):
        _fields_ = [
            ("dwLength", ctypes.c_ulong),
            ("dwMemoryLoad", ctypes.c_ulong),
            ("ullTotalPhys", ctypes.c_ulonglong),
            ("ullAvailPhys", ctypes.c_ulonglong),
            ("ullTotalPageFile", ctypes.c_ulonglong),
            ("ullAvailPageFile", ctypes.c_ulonglong),
            ("ullTotalVirtual", ctypes.c_ulonglong),
            ("ullAvailVirtual", ctypes.c_ulonglong),
            ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
        ]

    status = MemoryStatus()
    status.dwLength = ctypes.sizeof(MemoryStatus)
    if not ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status)):  # type: ignore[attr-defined]
        return None
    return float(status.dwMemoryLoad)


def _gpu_percent() -> Optional[float]:
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"],
            check=False,
            capture_output=True,
            text=True,
            timeout=3,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None

    if result.returncode != 0:
        return None
    values = []
    for raw_line in result.stdout.splitlines():
        raw_line = raw_line.strip()
        if not raw_line:
            continue
        try:
            values.append(float(raw_line))
        except ValueError:
            continue
    if not values:
        return None
    return sum(values) / len(values)


def inspect_resources(runtime: QueueRuntime, resource_class: Optional[str] = None) -> ResourceSnapshot:
    cpu_percent = _cpu_percent_posix()
    ram_percent = _ram_percent_linux()
    if ram_percent is None:
        ram_percent = _ram_percent_windows()
    gpu_percent = _gpu_percent()
    free_disk = shutil.disk_usage(runtime.paths.base_dir).free / (1024 ** 3)

    reasons: List[str] = []
    max_cpu = runtime.get_float("QUEUE_MAX_CPU_PERCENT")
    max_ram = runtime.get_float("QUEUE_MAX_RAM_PERCENT")
    max_gpu = runtime.get_float("QUEUE_MAX_GPU_PERCENT")
    min_disk = runtime.get_float("QUEUE_MIN_FREE_DISK_GB")

    if cpu_percent is not None and cpu_percent >= max_cpu:
        reasons.append(f"CPU ueber Grenzwert ({cpu_percent:.1f}% >= {max_cpu:.1f}%)")
    if ram_percent is not None and ram_percent >= max_ram:
        reasons.append(f"RAM ueber Grenzwert ({ram_percent:.1f}% >= {max_ram:.1f}%)")
    if gpu_percent is not None and gpu_percent >= max_gpu:
        reasons.append(f"GPU ueber Grenzwert ({gpu_percent:.1f}% >= {max_gpu:.1f}%)")
    if free_disk < min_disk:
        reasons.append(f"Freier Speicher zu niedrig ({free_disk:.2f} GB < {min_disk:.2f} GB)")
    if resource_class == "gpu" and gpu_percent is None:
        reasons.append("GPU-Status nicht verfuegbar, aber GPU-Job angefragt.")

    return ResourceSnapshot(
        cpu_percent=cpu_percent,
        ram_percent=ram_percent,
        gpu_percent=gpu_percent,
        free_disk_gb=free_disk,
        allowed=len(reasons) == 0,
        reasons=reasons,
    )


def submit_job(args: argparse.Namespace) -> int:
    runtime = QueueRuntime()
    runtime.ensure()

    job_type = args.type
    if args.resource_class not in RESOURCE_CLASSES:
        raise SystemExit(f"Unbekannte Ressourcenklasse: {args.resource_class}")

    job_id = build_job_id()
    log_file = runtime.paths.logs_dir / f"{job_id}.log"
    err_file = runtime.paths.logs_dir / f"{job_id}.err.log"
    retry_limit = args.retry_limit if args.retry_limit is not None else runtime.get_int("QUEUE_DEFAULT_RETRY_LIMIT")
    command = build_job_command(args.description, args.command, args.dry_run)

    job = {
        "id": job_id,
        "type": job_type,
        "priority": args.priority,
        "resource_class": args.resource_class,
        "description": args.description,
        "command": command,
        "status": "queued",
        "created_at": utc_now(),
        "updated_at": utc_now(),
        "started_at": None,
        "ended_at": None,
        "attempts": 0,
        "retry_limit": retry_limit,
        "exit_code": None,
        "dry_run": args.dry_run,
        "log_file": str(log_file),
        "error_file": str(err_file),
        "pid": None,
        "worker_pid": None,
        "resource_note": None,
    }
    save_job(runtime, job)

    print(f"Job angelegt: {job_id}")
    print(f"- Typ: {job_type}")
    print(f"- Prioritaet: {args.priority}")
    print(f"- Ressourcenklasse: {args.resource_class}")
    print(f"- Dry-run: {'ja' if args.dry_run else 'nein'}")
    print(f"- Retry-Limit: {retry_limit}")
    print(f"- Logdatei: {log_file}")
    print(f"- Fehlerdatei: {err_file}")
    return 0


def list_jobs(args: argparse.Namespace) -> int:
    runtime = QueueRuntime()
    jobs = sort_candidate_jobs(load_jobs(runtime))
    if args.status:
        jobs = [job for job in jobs if str(job.get("status")) == args.status]
    if args.limit is not None:
        jobs = jobs[: args.limit]

    if not jobs:
        print("Keine passenden Jobs gefunden.")
        return 0

    for job in jobs:
        print(
            f"{job['id']} | {job['status']} | {job['priority']} | "
            f"{job['resource_class']} | {job['type']} | {job['description']}"
        )
    return 0


def status_report(_: argparse.Namespace) -> int:
    runtime = QueueRuntime()
    jobs = load_jobs(runtime)
    counts = {key: 0 for key in VISIBLE_STATUSES}
    for job in jobs:
        status = str(job.get("status"))
        counts[status] = counts.get(status, 0) + 1

    snapshot = inspect_resources(runtime)

    print("# Queue Job Manager Status")
    print(f"- Basisverzeichnis: {runtime.paths.base_dir}")
    print(f"- Jobs gesamt: {len(jobs)}")
    print(f"- queued: {counts.get('queued', 0)}")
    print(f"- waiting_resources: {counts.get('waiting_resources', 0)}")
    print(f"- running: {counts.get('running', 0)}")
    print(f"- success: {counts.get('success', 0)}")
    print(f"- failed: {counts.get('failed', 0)}")
    print(f"- cancelled: {counts.get('cancelled', 0)}")
    print("")
    print("# Ressourcen")
    print(f"- CPU: {'n/v' if snapshot.cpu_percent is None else f'{snapshot.cpu_percent:.1f}%'}")
    print(f"- RAM: {'n/v' if snapshot.ram_percent is None else f'{snapshot.ram_percent:.1f}%'}")
    print(f"- GPU: {'n/v' if snapshot.gpu_percent is None else f'{snapshot.gpu_percent:.1f}%'}")
    print(f"- Freier Speicher: {snapshot.free_disk_gb:.2f} GB")
    print(f"- Start erlaubt: {'ja' if snapshot.allowed else 'nein'}")
    if snapshot.reasons:
        print("- Gruende:")
        for reason in snapshot.reasons:
            print(f"  - {reason}")
    print("")
    print("# Jobliste")
    for job in sort_candidate_jobs(jobs):
        print(
            f"{job['id']} | {job['status']} | {job['priority']} | "
            f"{job['resource_class']} | {job['type']} | {job['description']}"
        )
    return 0


def show_logs(args: argparse.Namespace) -> int:
    runtime = QueueRuntime()
    job = get_job(runtime, args.job_id)
    tail_lines = args.tail if args.tail is not None else runtime.get_int("QUEUE_LOG_TAIL_LINES")

    print(f"# Logs fuer {job['id']}")
    print(f"- Status: {job['status']}")
    print(f"- Logdatei: {job['log_file']}")
    print(f"- Fehlerdatei: {job['error_file']}")
    print("")
    print("## Standard-Log")
    print(tail_text(Path(str(job["log_file"])), tail_lines))
    print("")
    print("## Fehler-Log")
    print(tail_text(Path(str(job["error_file"])), tail_lines))
    return 0


def cancel_job(args: argparse.Namespace) -> int:
    runtime = QueueRuntime()
    job = get_job(runtime, args.job_id)
    if str(job.get("status")) in FINAL_STATUSES:
        print(f"Job {args.job_id} ist bereits abgeschlossen.")
        return 0

    pid = int(job.get("pid") or 0)
    if str(job.get("status")) == "running" and is_pid_alive(pid):
        kill_process_tree(pid)

    job["status"] = "cancelled"
    job["ended_at"] = utc_now()
    job["exit_code"] = int(job.get("exit_code") or 130)
    job["pid"] = None
    job["worker_pid"] = None
    job["resource_note"] = "Vom Benutzer abgebrochen."
    save_job(runtime, job)
    print(f"Job abgebrochen: {args.job_id}")
    return 0


def recover_jobs(runtime: QueueRuntime) -> None:
    for job in load_jobs(runtime):
        if str(job.get("status")) != "running":
            continue
        pid = int(job.get("pid") or 0)
        if is_pid_alive(pid):
            continue
        job["status"] = "queued"
        job["pid"] = None
        job["worker_pid"] = None
        job["resource_note"] = "Vorheriger Worker wurde unterbrochen. Job erneut eingereiht."
        save_job(runtime, job)


def class_usage(jobs: Iterable[Dict[str, object]]) -> Dict[str, int]:
    usage = {key: 0 for key in RESOURCE_CLASSES}
    for job in jobs:
        if str(job.get("status")) != "running":
            continue
        resource_class = str(job.get("resource_class"))
        if resource_class in usage:
            usage[resource_class] += 1
    return usage


def start_job(runtime: QueueRuntime, job: Dict[str, object]) -> subprocess.Popen[str]:
    log_handle = open(str(job["log_file"]), "a", encoding="utf-8")
    err_handle = open(str(job["error_file"]), "a", encoding="utf-8")
    log_handle.write(f"{utc_now()} START {job['id']} {job['command']}\n")
    log_handle.flush()

    process = subprocess.Popen(
        str(job["command"]),
        shell=True,
        stdout=log_handle,
        stderr=err_handle,
        text=True,
    )

    job["status"] = "running"
    job["started_at"] = utc_now()
    job["attempts"] = int(job.get("attempts") or 0) + 1
    job["pid"] = process.pid
    job["worker_pid"] = os.getpid()
    job["resource_note"] = None
    save_job(runtime, job)
    process._queue_log_handle = log_handle  # type: ignore[attr-defined]
    process._queue_err_handle = err_handle  # type: ignore[attr-defined]
    return process


def finalize_job(runtime: QueueRuntime, job: Dict[str, object], process: subprocess.Popen[str]) -> None:
    exit_code = process.returncode if process.returncode is not None else 1
    ended_at = utc_now()

    log_handle = getattr(process, "_queue_log_handle", None)
    err_handle = getattr(process, "_queue_err_handle", None)
    if log_handle:
        log_handle.write(f"{ended_at} END {job['id']} exit={exit_code}\n")
        log_handle.close()
    if err_handle:
        err_handle.close()

    job["ended_at"] = ended_at
    job["exit_code"] = exit_code
    job["pid"] = None
    job["worker_pid"] = None

    if exit_code == 0:
        job["status"] = "success"
        job["resource_note"] = None
    else:
        attempts = int(job.get("attempts") or 0)
        retry_limit = int(job.get("retry_limit") or 0)
        if attempts <= retry_limit:
            job["status"] = "queued"
            job["resource_note"] = f"Retry {attempts}/{retry_limit} wird erneut eingereiht."
        else:
            job["status"] = "failed"
            job["resource_note"] = f"Maximales Retry-Limit erreicht ({retry_limit})."

    save_job(runtime, job)


def dispatch_cycle(runtime: QueueRuntime, active: Dict[str, subprocess.Popen[str]]) -> None:
    jobs = load_jobs(runtime)
    running = running_jobs(jobs)
    usage = class_usage(jobs)
    max_parallel = runtime.get_int("QUEUE_MAX_PARALLEL_JOBS")
    available_slots = max(0, max_parallel - len(running))
    if available_slots <= 0:
        for job in pending_jobs(jobs):
            if job["status"] == "queued":
                job["status"] = "waiting_resources"
                job["resource_note"] = "Maximale Parallelitaet erreicht."
                save_job(runtime, job)
        return

    for job in sort_candidate_jobs(pending_jobs(jobs)):
        if available_slots <= 0:
            break

        resource_class = str(job["resource_class"])
        limit = runtime.class_limit(resource_class)
        if usage[resource_class] >= limit:
            if job["status"] == "queued":
                job["status"] = "waiting_resources"
                job["resource_note"] = f"Ressourcenklasse {resource_class} hat ihr Parallel-Limit erreicht."
                save_job(runtime, job)
            continue

        snapshot = inspect_resources(runtime, resource_class)
        if not snapshot.allowed:
            job["status"] = "waiting_resources"
            job["resource_note"] = "; ".join(snapshot.reasons)
            save_job(runtime, job)
            continue

        if job["status"] == "waiting_resources":
            job["status"] = "queued"
            job["resource_note"] = None
            save_job(runtime, job)
            job = get_job(runtime, str(job["id"]))

        process = start_job(runtime, job)
        active[str(job["id"])] = process
        usage[resource_class] += 1
        available_slots -= 1


def worker_main(args: argparse.Namespace) -> int:
    runtime = QueueRuntime()
    runtime.ensure()

    with WorkerLock(runtime):
        recover_jobs(runtime)
        active: Dict[str, subprocess.Popen[str]] = {}
        daemon_mode = args.daemon

        while True:
            finished_ids: List[str] = []
            for job_id, process in active.items():
                if process.poll() is None:
                    continue
                job = get_job(runtime, job_id)
                finalize_job(runtime, job, process)
                finished_ids.append(job_id)
            for job_id in finished_ids:
                active.pop(job_id, None)

            dispatch_cycle(runtime, active)

            jobs = load_jobs(runtime)
            has_pending = any(str(job.get("status")) in PENDING_STATUSES for job in jobs)
            has_running = bool(active) or any(str(job.get("status")) == "running" for job in jobs)

            if args.once:
                if not active and not has_pending:
                    return 0
            elif not daemon_mode:
                if not has_pending and not has_running:
                    return 0

            time.sleep(runtime.get_int("QUEUE_POLL_INTERVAL_SECONDS"))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="queue")
    sub = parser.add_subparsers(dest="command", required=True)

    submit = sub.add_parser("submit")
    submit.add_argument("description")
    submit.add_argument("--type", default="custom")
    submit.add_argument("--priority", choices=list(PRIORITY_ORDER.keys()), default="normal")
    submit.add_argument("--resource-class", choices=sorted(RESOURCE_CLASSES), default="medium")
    submit.add_argument("--command")
    submit.add_argument("--retry-limit", type=int)
    submit.add_argument("--dry-run", action="store_true")

    list_parser = sub.add_parser("list")
    list_parser.add_argument("--status", choices=VISIBLE_STATUSES)
    list_parser.add_argument("--limit", type=int)

    sub.add_parser("status")

    logs = sub.add_parser("logs")
    logs.add_argument("job_id")
    logs.add_argument("--tail", type=int)

    cancel = sub.add_parser("cancel")
    cancel.add_argument("job_id")

    worker = sub.add_parser("worker")
    worker.add_argument("--daemon", action="store_true")
    worker.add_argument("--once", action="store_true")

    return parser


def main(argv: List[str]) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "submit":
        return submit_job(args)
    if args.command == "list":
        return list_jobs(args)
    if args.command == "status":
        return status_report(args)
    if args.command == "logs":
        return show_logs(args)
    if args.command == "cancel":
        return cancel_job(args)
    if args.command == "worker":
        return worker_main(args)

    parser.error("Unbekannter Befehl.")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
