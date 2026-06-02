# SessionWebsiteFactory

`SessionWebsiteFactory` ist ein lokales Tool fuer das Ultimate KI Setup. Es
erstellt aus einer Projekt-, Produkt- oder Marketing-Idee einen ersten
Website-, Landingpage- oder Web-App-Prototypen ohne Claude- oder
Anthropic-Abhaengigkeit.

## Ziel

- lokale Website-Erzeugung mit Queue-Schutz
- Ollama als Standard-LLM
- OpenClaw als optionaler Agentenpfad
- optional OpenAI oder Gemini
- deutsche, englische oder zweisprachige Inhalte
- Export inklusive ZIP, README und Build-Report

## Nicht erlaubt

- keine Claude-API
- keine Anthropic-Pakete
- keine harte Abhaengigkeit von fremden Cloud-Providern

## Ordnerstruktur

```text
tools/session-website-factory/
|- docs/
|- jobs/
|- src/
|- templates/
|- .env.example
|- package.json
|- README.md
`- tsconfig.json
```

## Installation

```bash
cd tools/session-website-factory
pnpm install
pnpm build
```

Windows 11 mit PowerShell:

```powershell
Set-Location .\tools\session-website-factory
pnpm install
pnpm build
```

WSL2 Ubuntu:

```bash
cd tools/session-website-factory
pnpm install
pnpm build
```

## CLI

```bash
pnpm swf new "Landingpage fuer lokalen KI-Leitstand"
pnpm swf build
pnpm swf preview --job <job-id>
pnpm swf fix --job <job-id>
pnpm swf export --job <job-id>
```

Direkt ueber das Binary:

```bash
swf new "Website fuer ein Creator-Automationsprodukt"
swf build
```

## Befehle

### `swf new`

Legt einen neuen Job in `jobs/queue.json` an.

Beispiel:

```bash
swf new "Deutsche Landingpage fuer ein lokales Ollama-Dashboard" --template astro-landingpage --language bilingual
```

### `swf build`

Zieht genau einen wartenden Job aus der Queue, erstellt den Plan, generiert den
Projektordner, legt eine statische Vorschau an und startet den Auto-Fix-Lauf.

### `swf preview`

Startet einen kleinen lokalen HTTP-Server fuer die generierte Vorschau und gibt
die URL aus. Optional kann ein Screenshot-Pfad uebergeben werden. Wenn lokal
kein Screenshot-Werkzeug verfuegbar ist, wird das im Ergebnis vermerkt.

### `swf fix`

Fuehrt `pnpm install` und `pnpm build` kontrolliert aus und versucht bis zu
drei Reparaturrunden. Das Ergebnis landet in `build-report.md`.

### `swf export`

Erzeugt:

- `README.md` fuer das generierte Projekt
- `build-report.md`
- eine ZIP-Datei
- eine Commit-Vorlage fuer Git

## Queue-Regeln

- maximal ein laufender Job
- Statuswerte: `pending`, `running`, `failed`, `done`
- CPU- und RAM-Pruefung vor schwereren Schritten
- Timeouts gegen haengende Prozesse
- Lockfile gegen parallele Worker-Laeufe

## Templates

- `astro-landingpage`
- `nextjs-landingpage`

Beide Templates enthalten:

- Tailwind-Struktur
- responsive Landingpage
- CTA-Bloecke
- Kontaktbereich
- Impressum- und Datenschutz-Platzhalter

## LLM-Backends

### Standard: Ollama

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5-coder:latest
```

### Optional

- `openclaw`
- `openai`
- `gemini`

Wenn ein Provider nicht korrekt konfiguriert ist, faellt das Tool auf einen
deterministischen lokalen Planer zurueck.

## Ergebnisse

Generierte Projekte landen unter:

```text
jobs/results/<job-id>/
|- build-report.md
|- export/
|- plan.json
|- preview/
`- project/
```

## Hinweise

- Dieses Tool ignoriert Anthropic-Konfigurationen bewusst.
- `ANTHROPIC_API_KEY` wird nicht verwendet.
- Der Minimal-Prototyp ist lauffaehig, aber absichtlich konservativ gebaut:
  zuerst stabiler lokaler Ablauf, dann spaeter tiefere Framework-Automation.
