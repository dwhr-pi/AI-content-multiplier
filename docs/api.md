# API

Die aktuelle oeffentliche Schnittstelle des Projekts ist die CLI.

## Befehle

### `ai-content list`

Listet alle registrierten Tools und ihre Befehle auf.

### `ai-content doctor`

Druckt einen kompakten Bericht zu Umgebung und Tool-Status.

### `ai-content analyze-url <url>`

Erstellt eine kompakte Analyse aus einem geladenen URL-Snapshot.

### `ai-content multiply <input>`

Liest eine Datei oder einen Text ein und erzeugt einen strukturierten Content-Bericht.

### `ai-content prompt "<brief>"`

Erzeugt ein Prompt-Paket inklusive Modell-Empfehlungen.

### `ai-content github <owner/repo|url>`

Fragt die GitHub-API nach Repository-Metadaten ab und fasst sie zusammen.

### `ai-content social`

Zeigt die geplante Roadmap fuer die kuenftige Social-Publishing-Befehlsfamilie.

### `ai-content queue-manager`

Zeigt die geplante Roadmap fuer den lokalen KI Job Queue Manager.

## Ausgabeformate

- `--output markdown`
- `--output json`

## Zukuenftige Richtung

Der Workflow-Exporter soll spaeter stabile JSON-Payloads fuer n8n, OpenClaw,
Ollama, Home Assistant, Social Publishing, HTML, PDF, DOCX und den
KI-Job-Queue-Manager liefern.
