# Integration in das Ultimate KI Setup

AI-ContentMultiplier wird als Workflow-Tool behandelt. Es soll nicht ungefragt
schwere Abhaengigkeiten installieren und keine Cloud-APIs automatisch aktivieren.

## Empfohlene Einordnung

| Feld | Wert |
|---|---|
| Kategorie | Automation / Content / OpenClaw Workflow |
| Status | planned / optional |
| Installationsart | documentation-first, spaeter Python/Node optional |
| Standardmodell | Ollama |
| Cloud | optional, nur mit expliziter Freigabe |
| Auto-Publishing | nein |
| Speicherort | `~/.openclaw_ultimate_user_data/content-multiplier` |

## Setup-Pfad

1. Ultimate KI Setup starten.
2. OpenClaw und Ollama installieren oder pruefen.
3. Optional n8n installieren.
4. AI-ContentMultiplier als Workflow registrieren.
5. `.env.example` nach `~/.openclaw_ultimate_user_data/content-multiplier/.env`
   kopieren.
6. OpenClaw-Agentprofil importieren.
7. n8n-Workflow-Blueprint importieren.

## Empfohlene Tools im Ultimate Setup

- Ollama
- OpenClaw
- n8n optional
- Firecrawl optional
- Apache Tika oder Docling optional fuer Dokumente
- Pandoc oder LibreOffice headless optional fuer DOCX/PDF
- Nextcloud/myNextCloud optional fuer Dateiablage

## Doctor-Checks

Ein spaeterer Setup-Check sollte pruefen:

- Ist Ollama unter `127.0.0.1:11434` erreichbar?
- Existiert die lokale `.env` ausserhalb des Repositories?
- Ist `ALLOW_CLOUD_MODE=false`, wenn keine Cloud bewusst aktiviert wurde?
- Ist OpenClaw Gateway erreichbar?
- Ist n8n Webhook gesetzt, falls n8n genutzt wird?
- Ist der Ausgabeordner beschreibbar?
