# KI Job Queue Manager

Der `ki-job-queue-manager` ist ein lokaler Warteschlangen-Manager fuer das
Ultimate KI Setup. Er nimmt Auftraege an, speichert sie persistent und arbeitet
sie kontrolliert nacheinander oder mit konfigurierbarer Parallelitaet ab.

Ziel ist nicht maximale Gleichzeitigkeit, sondern stabiler lokaler Betrieb.
Das Tool soll verhindern, dass Codex, OpenClaw, Ollama, n8n, Whisper, Video-,
Bild- oder Shell-Prozesse gleichzeitig CPU, RAM, GPU oder den freien
Speicherplatz ueberlasten.

## Kernfunktionen

- Auftraege per CLI annehmen
- Persistente Queue auf JSONL-Basis
- Prioritaeten fuer Jobs
- Worker-Loop mit Ressourcenpruefung
- Pro Job eigene Log- und Fehlerdateien
- Pause, Resume, Cancel und Statusabfrage
- Kleiner KI-Leitstand mit Weboberflaeche
- Cross-platform gedacht fuer Windows 11 und WSL2/Ubuntu

## Installation

```bash
cd tools/job_queue_manager
pnpm install
pnpm build
```

Danach ist die CLI verfuegbar ueber:

```bash
pnpm kiq list
```

Oder direkt nach Build:

```bash
node dist/cli.js list
```

## Wichtige Speicherorte

Standard-Basisverzeichnis:

```text
~/.ultimate-ki/job-queue/
```

Dort werden angelegt:

- `config.json`
- `queue.jsonl`
- `logs/`

## Verfuegbare Befehle

```bash
kiq add "beschreibung des auftrags"
kiq add --type codex "Repo analysieren und Fehler beheben"
kiq add --type codex --command "codex run --repo ./myProject --task 'Fix build errors'"
kiq list
kiq status
kiq run
kiq pause
kiq resume
kiq cancel <job-id>
kiq logs <job-id>
kiq dashboard
kiq config
```

## Standardverhalten

- Standardmaessig wird nur ein Job gleichzeitig ausgefuehrt
- Vor jedem Start werden CPU, RAM, GPU und freier Speicherplatz geprueft
- Bei Ueberlastung bleibt der Job auf `waiting_resources`
- Ohne expliziten `--command` wird ein sicherer Platzhalterbefehl genutzt

## KI-Leitstand

Der Leitstand ist ein kleines lokales Webinterface fuer den Queue Manager.

Start:

```bash
kiq dashboard
```

Optional:

```bash
kiq dashboard --host 127.0.0.1 --port 4310
```

Anschliessend ist das Dashboard unter `http://127.0.0.1:4310` erreichbar.

Es zeigt:

- laufende Jobs
- wartende Jobs
- blockierte Jobs wegen CPU/RAM/GPU oder Speicher
- pausierte Jobs
- kuerzlich abgeschlossene Jobs
- aktuelle Systemlast
- Log-Ansicht pro Job

Direkte Aktionen im Leitstand:

- Queue pausieren
- Queue fortsetzen
- naechsten Slot pruefen
- Jobs abbrechen

## Job-Typen

- `codex`
- `openclaw`
- `ollama`
- `n8n`
- `whisper`
- `video`
- `image`
- `shell`
- `custom`

## Beispiel-Konfiguration

```json
{
  "max_parallel_jobs": 1,
  "max_cpu_percent": 75,
  "max_ram_percent": 80,
  "max_gpu_percent": 85,
  "min_free_disk_gb": 5,
  "poll_interval_ms": 5000,
  "dashboard_host": "127.0.0.1",
  "dashboard_port": 4310,
  "dashboard_refresh_ms": 5000
}
```

## Integrationsrichtung

Der Queue Manager ist als Wrapper gedacht. Er startet spaeter kontrolliert:

- Codex-Aufgaben
- OpenClaw-Agenten
- Ollama-Analysen
- n8n-Workflows
- Whisper-Transkriptionen
- Video-/Bild-Tools
- Shell-Skripte

## Zukunftsidee

Spaeter kann daraus ein kleiner KI-Leitstand mit Weboberflaeche werden, der
aktive Jobs, wartende Jobs und blockierte Ressourcen sichtbar macht.
