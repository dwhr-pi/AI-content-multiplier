# AI-ContentMultiplier

AI-ContentMultiplier ist ein Workflow-Tool fuer das Ultimate KI Setup. Es nimmt
Quellen wie URLs, PDFs, Webseiten, YouTube-Transkripte oder LinkedIn-Inhalte
entgegen und erzeugt daraus mehrere Content-Formate.

Der Schwerpunkt liegt nicht auf einer schweren Autoinstallation, sondern auf
einem sicheren, modularen Workflow fuer OpenClaw, n8n, Ollama und optionale
Cloud-Modelle.

## Funktionen

- URL-Eingabe und Webseitenanalyse
- Firecrawl-Integration fuer Crawling und Markdown-Extraktion
- PDF-Unterstuetzung
- YouTube-Transcript-Analyse
- LinkedIn-Analyse fuer eigene oder freigegebene Inhalte
- Ausgabe als Markdown, HTML, DOCX und PDF
- Erzeugung von LinkedIn Posts, Blogartikeln, Newslettern, X Threads,
  Facebook Posts, FAQ und SEO Keywords

## Modellanbieter

Standard ist lokal-first:

- Ollama fuer private, lokale Verarbeitung
- Gemini optional
- Claude optional
- OpenAI optional

Cloud-Modelle werden nur genutzt, wenn API-Keys bewusst in der lokalen
Benutzerkonfiguration gesetzt wurden. Es werden keine Secrets in dieses
Repository geschrieben.

## Integrationen

- OpenClaw: Agentenprofil und Workflow-Orchestrierung
- n8n: Automatisierung, Webhooks und Ablage
- Home Assistant: Benachrichtigungen und einfache Trigger
- Nextcloud/myNextCloud: Eingabe-/Ausgabeordner fuer Dokumente und Ergebnisse

## Schnellstart im Ultimate KI Setup

1. `.env.example` nach einem lokalen Speicherort kopieren, z. B.:

   ```bash
   mkdir -p ~/.openclaw_ultimate_user_data/content-multiplier
   cp .env.example ~/.openclaw_ultimate_user_data/content-multiplier/.env
   ```

2. Ollama lokal starten und ein Modell bereitstellen:

   ```bash
   ollama serve
   ollama pull llama3.2:1b
   ```

3. OpenClaw-Agentprofil aus `openclaw/ai-content-multiplier.agent.json`
   importieren oder als Vorlage verwenden.

4. n8n-Blueprint aus `n8n/ai-content-multiplier.workflow.json` importieren.

5. Ergebnisse in `output/` oder in Nextcloud/myNextCloud speichern lassen.

## Workflow

```text
Quelle
  -> Extraktion
  -> Analyse
  -> Content-Plan
  -> Format-Erzeugung
  -> Review
  -> Export
  -> Ablage/Benachrichtigung
```

Details stehen in [docs/WORKFLOW.md](docs/WORKFLOW.md).

## Sicherheit

- Keine fremden Inhalte ohne Nutzungsrecht automatisiert republizieren.
- LinkedIn- und YouTube-Inhalte nur analysieren, wenn Zugriff und Nutzung
  erlaubt sind.
- API-Keys nur lokal unter `~/.openclaw_ultimate_user_data` speichern.
- Cloud-Modelle nur nach bewusster Freigabe verwenden.
- Automatisches Posten ist standardmaessig deaktiviert; der Workflow erzeugt
  Entwuerfe.

## Dokumentation

- [Architektur](docs/ARCHITECTURE.md)
- [Workflow](docs/WORKFLOW.md)
- [Setup im Ultimate KI Setup](docs/ULTIMATE_KI_SETUP_INTEGRATION.md)
- [OpenClaw Integration](docs/OPENCLAW_INTEGRATION.md)
- [n8n Integration](docs/N8N_INTEGRATION.md)
- [Nextcloud/myNextCloud Integration](docs/NEXTCLOUD_INTEGRATION.md)
- [Home Assistant Integration](docs/HOME_ASSISTANT_INTEGRATION.md)
- [Sicherheits- und Rechtsnotizen](docs/SAFETY_AND_COMPLIANCE.md)
