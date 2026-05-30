# Queue Job Manager Design

## Zweck

Der `Queue_Job_Manager` ist die zentrale lokale Warteschlange fuer das Ultimate
KI Setup. Er soll verhindern, dass mehrere schwere Prozesse unkontrolliert
parallel anlaufen.

Das betrifft insbesondere:

- Codex
- OpenClaw
- Setup-Skripte
- Render-Jobs
- n8n-Workflows
- Shell-Tasks

## Warum eine eigene einfache Queue

Die Queue wird bewusst zuerst als einfache Bash/Python-Loesung umgesetzt:

- kein Docker-Zwang
- keine Cloud-Pflicht
- keine Redis-/Celery-Abhaengigkeit
- leicht unter WSL2 und Linux nutzbar
- schnell in Setup-Menues und lokale Automationen einhaengbar

Spaeter kann diese Schicht optional mit groesseren Systemen wie Celery, RQ,
Redis oder Temporal erweitert oder ersetzt werden.

## Speicherlayout

```text
~/.ultimate-ki/queue-job-manager/
|- queue.env
|- jobs/
|  `- <job-id>.json
|- logs/
|  |- <job-id>.log
|  `- <job-id>.err.log
`- run/
   `- worker.lock
```

## Datenmodell pro Job

Jeder Job wird als einzelne JSON-Datei gespeichert und enthaelt mindestens:

- `id`
- `description`
- `type`
- `priority`
- `resource_class`
- `command`
- `status`
- `created_at`
- `started_at`
- `ended_at`
- `attempts`
- `retry_limit`
- `exit_code`
- `dry_run`
- `log_file`
- `error_file`
- `pid`
- `resource_note`

## Prioritaetsmodell

Sortierung:

1. `critical`
2. `high`
3. `normal`
4. `low`

Innerhalb derselben Prioritaet gilt FIFO ueber `created_at`.

## Ressourcenklassen

Die Ressourcenklasse beeinflusst, wie viele Jobs parallel laufen duerfen.

- `light`: leichte Aufgaben, z. B. kleine Shell- oder Analysejobs
- `medium`: normale lokale Aufgaben
- `heavy`: aufwendige Build-, Setup- oder Renderaufgaben
- `gpu`: GPU-nahe Workloads wie Video, Bild oder bestimmte Modelljobs

Empfohlene Standardlimits:

- `QUEUE_MAX_PARALLEL_JOBS=2`
- `QUEUE_MAX_LIGHT_JOBS=4`
- `QUEUE_MAX_MEDIUM_JOBS=2`
- `QUEUE_MAX_HEAVY_JOBS=1`
- `QUEUE_MAX_GPU_JOBS=1`

## Worker-Strategie

- genau ein aktiver Worker pro Queue-Basisverzeichnis
- Lockfile gegen doppelte Laeufe
- Jobs werden in Hintergrundprozessen gestartet
- Exit-Code und Ende werden rueckgeschrieben
- fehlgeschlagene Jobs koennen bis zum Retry-Limit erneut eingereiht werden

## Dry-Run

`dry_run` startet keinen echten Zielprozess. Stattdessen wird:

- der geplante Befehl protokolliert
- ein erfolgreicher Platzhalterlauf geschrieben
- die Queue-Logik realistisch getestet

## Setup-Menue-Integration

Die Queue ist fuer einen festen Menueblock im Ultimate KI Setup gedacht.

Beispiel:

```text
[ Queue Job Manager ]
1. Queue-Status anzeigen
2. Job einreichen
3. Worker starten
4. Job abbrechen
5. Beispiel-Konfiguration anzeigen
```

Empfohlene Verknuepfung:

- `scripts/queue/menu.sh`
- `scripts/queue/status.sh`
- `scripts/queue/list_jobs.sh`
- `scripts/queue/submit_job.sh`
- `scripts/queue/run_worker.sh`
- `scripts/queue/logs.sh`
- `scripts/queue/cancel_job.sh`

## Beziehung zum TypeScript-Queue-Manager

In diesem Repository existiert bereits ein groesserer Queue-Manager unter
`tools/job_queue_manager/`.

Der neue `Queue_Job_Manager` unter `scripts/queue/` ist bewusst:

- leichter
- direkter fuer Setup-Automation
- shell- und menuefreundlich
- ohne Node- oder Dashboard-Pflicht betreibbar

Beide koennen nebeneinander existieren:

- `scripts/queue/` als einfache zentrale Queue fuer das Setup
- `tools/job_queue_manager/` als ausbaubares Tool mit CLI und Leitstand

## Aktueller Stand

Der aktuelle einfache Stand enthaelt bereits:

- FIFO je Prioritaetsstufe
- Prioritaeten `low`, `normal`, `high`, `critical`
- Ressourcenklassen `light`, `medium`, `heavy`, `gpu`
- Lockfile gegen doppelte Worker
- Retry-Limit pro Job
- Dry-Run
- `list`- und `logs`-Ansicht
- ein kleines interaktives Menue
- lokale Ressourcenpruefung fuer CPU, RAM, GPU und freien Speicherplatz
