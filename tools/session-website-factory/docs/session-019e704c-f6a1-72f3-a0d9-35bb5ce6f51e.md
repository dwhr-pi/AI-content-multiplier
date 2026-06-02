# Session 019e704c-f6a1-72f3-a0d9-35bb5ce6f51e

## Ziel

Ein lokales Tool fuer das Ultimate KI Setup bauen, das aus einer Idee eine
Website, Landingpage oder einen kleinen Web-App-Prototyp erzeugt, aber ohne
Claude- oder Anthropic-Abhaengigkeit.

## Umgesetzter Minimal-Prototyp

- lokale CLI `swf`
- Queue mit genau einem aktiven Job
- Statuswerte `pending`, `running`, `failed`, `done`
- CPU- und RAM-Schutz vor Build/Fix-Schritten
- Ollama als Standard-Provider
- optionale Platzhalter fuer OpenClaw, OpenAI und Gemini
- Generator fuer Astro- und Next.js-Landingpages
- statische Vorschau unter `jobs/results/<job-id>/preview/`
- Auto-Fix mit `pnpm install`, `pnpm build` und maximal drei Runden
- Export mit ZIP, README und Git-Commit-Vorlage

## Bewusste Grenzen

- keine Anthropic- oder Claude-Unterstuetzung
- OpenClaw ist als lokaler Integrationspfad vorgesehen, aber nicht als harter
  API-Zwang eingebaut
- Screenshot ist best effort und nur aktiv, wenn lokal ein passendes Werkzeug
  verfuegbar ist

## Naechste sinnvolle Ausbaustufen

1. echte OpenClaw-Agentenaufrufe fuer Planer- und Fixer-Schritte
2. stabilere semantische Reparaturen bei Build-Fehlern
3. direkter Start von `pnpm dev` fuer echte Framework-Vorschau
4. zentrales Einhaengen in den bestehenden KI-Queue-Manager
