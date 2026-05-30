# Setup

## Voraussetzungen

- Node.js 22+
- pnpm
- Optional: Ollama
- Optional: GitHub-Token fuer hoehere API-Limits
- Optional: Firecrawl-API-Key

## Installation

```bash
pnpm install
pnpm build
```

## Lokale Umgebung

Die Beispielkonfiguration kopieren:

```bash
cp config/env.example .env
```

Nur die Anbieter eintragen, die wirklich genutzt werden sollen. Die CLI ist so
angelegt, dass sie auch ohne Cloud-Credentials sinnvoll nutzbar bleibt.

## Nuetzliche Befehle

```bash
pnpm ai-content list
pnpm ai-content doctor
pnpm ai-content analyze-url "https://example.com"
pnpm ai-content multiply examples/input/sample-source.md
pnpm ai-content prompt "Erstelle ein cineastisches Celtic-Trance-Musikvideo"
pnpm ai-content github https://github.com/openai/openai-cookbook
```

## Workflow-Artefakte

- n8n-Blueprint: `workflows/n8n/ai-content-multiplier.workflow.json`
- Social-Publishing-Blueprint: `workflows/n8n/social-publisher.workflow.json`
- OpenClaw-Agent: `workflows/openclaw/ai-content-multiplier.agent.json`
- Social-Publishing-Agent: `workflows/openclaw/social-publisher.agent.json`
- Ollama-Prompt-Starter: `workflows/ollama/content-multiplier.prompt.md`
- KI-Queue-Tool: `tools/job_queue_manager/`
- KI-Leitstand-Frontend: `tools/job_queue_manager/web/`

## Hinweise

- Generierte Ergebnisse sind Entwuerfe und sollten von Menschen geprueft werden
- `.env` bleibt lokal und gehoert nicht in die Versionsverwaltung
- Bestehende Legacy-Integrationsordner bleiben aus Kompatibilitaetsgruenden erhalten
- Social Publishing bleibt bewusst auf offizielle APIs und menschliche Freigabe beschraenkt
- Der KI Job Queue Manager ist fuer stabilen lokalen Betrieb und Ressourcenschutz gedacht

## Einordnung im Gesamtsetup

Dieses Repository ist eine eigenstaendige Tool-Sammlung neben dem Ultimate KI
Setup. Es erweitert das Gesamtsetup mit kleinen, vollstaendigen und direkt
pflegbaren Werkzeugen.

Wichtig dabei:

- Es ist keine lose Liste externer Repositories.
- Es ist kein Ersatz fuer das Ultimate KI Setup.
- Es ist sinnvolles Zubehoer und eine aktive Erweiterung dafuer.
- Die hier enthaltenen Tools werden als eigene Sammlung weiter gepflegt und
  modular ausgebaut.
