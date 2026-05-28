# Architektur

AI-ContentMultiplier ist als Workflow-Schicht zwischen Quellen, Modellen und
Ausgabezielen gedacht.

```text
Input Adapter
  URL / PDF / YouTube Transcript / LinkedIn / Text
      |
      v
Extractor
  Firecrawl / PDF Parser / Transcript Import / Manual Text
      |
      v
Analysis Layer
  Summary / Claims / Audience / Tone / SEO / Risk Notes
      |
      v
Model Router
  Ollama local-first / Gemini / Claude / OpenAI optional
      |
      v
Content Generator
  LinkedIn / Blog / Newsletter / X Thread / Facebook / FAQ / Keywords
      |
      v
Exporter
  Markdown / HTML / DOCX / PDF
      |
      v
Integrations
  OpenClaw / n8n / Nextcloud / Home Assistant
```

## Komponenten

| Komponente | Aufgabe |
|---|---|
| Input Adapter | Nimmt URLs, Dateien oder Rohtexte entgegen. |
| Extractor | Wandelt Quellen in sauberen Text oder Markdown um. |
| Analysis Layer | Erkennt Kernaussagen, Zielgruppe, Risiken und Content-Chancen. |
| Model Router | Waehlt Ollama oder bewusst aktivierte Cloud-Modelle. |
| Content Generator | Erzeugt die gewuenschten Formate. |
| Exporter | Speichert Markdown, HTML, DOCX und PDF. |
| Integration Layer | Uebergibt Ergebnisse an OpenClaw, n8n, Nextcloud oder Home Assistant. |

## Local-first Standard

Ollama ist der Standardpfad. Cloud-Anbieter werden nur aktiviert, wenn
`ALLOW_CLOUD_MODE=true` gesetzt ist und der passende API-Key lokal vorhanden ist.

## Kein Auto-Publish

Der Workflow erzeugt Entwuerfe. Automatisches Veröffentlichen in sozialen
Netzwerken ist standardmaessig deaktiviert und muss bewusst separat umgesetzt
werden.
