# n8n Integration

n8n eignet sich fuer Trigger, Webhooks, Dateiablage und Benachrichtigungen.

## Empfohlener Workflow

1. Webhook empfaengt Quelle und Ausgabearten.
2. Firecrawl oder lokaler Extractor erzeugt Markdown.
3. OpenClaw oder Ollama erzeugt Analyse und Content-Entwuerfe.
4. Ergebnisse werden als Markdown-Dateien gespeichert.
5. Optional werden HTML/DOCX/PDF-Exports erzeugt.
6. Nextcloud/myNextCloud wird aktualisiert.
7. Home Assistant sendet eine Benachrichtigung.

## Keine Secrets im Workflow

API-Keys sollen in n8n Credentials oder in lokalen `.env`-Dateien liegen, nicht
im JSON-Workflow.

## Blueprint

Siehe `n8n/ai-content-multiplier.workflow.json`.
