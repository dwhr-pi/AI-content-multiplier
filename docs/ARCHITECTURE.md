# Architektur

AI Content Multiplier folgt einer CLI-first- und local-first-Architektur mit
einer modularen Registry. Aus einfachen MVPs koennen so spaeter umfassendere
Adapter, Automationen und Systemdienste entstehen.

## Rolle neben dem Ultimate KI Setup

Diese Sammlung ist als eigenstaendige Erweiterung neben dem Ultimate KI Setup
gedacht. Sie uebernimmt nicht die Rolle des grossen Basis-Setups, sondern
liefert zusaetzliche, in sich geschlossene Werkzeuge fuer konkrete Aufgaben.

Das bedeutet:

- Das Ultimate KI Setup bleibt der uebergeordnete Rahmen fuer Integrationen,
  Betriebslogik und grosse Orchestrierung.
- AI Content Multiplier dient als modulare Werkzeug-Sammlung mit kleineren,
  kompletten Helfern, die genau dafuer entwickelt werden, das Gesamtsetup
  sinnvoll zu ergaenzen.
- Die Tools in diesem Repository sind bewusst Teil derselben Sammlung und nicht
  nur Verweise auf andere fremde oder ausgelagerte GitHub-Repositories.
- Die Sammlung wird aktiv gepflegt, damit sie sich parallel zum Ultimate KI
  Setup weiterentwickeln kann.

## Kernschichten

```text
Eingaenge
  URL / Text / Markdown / PDF / Transkript / Repo-URL
      |
      v
CLI-Router
  src/cli.ts
      |
      v
Tool-Registry
  src/registry/tool-registry.ts
      |
      v
Tool-Module
  content-multiplier / prompt-generator / github-scout / job-queue / weitere Module
      |
      v
Ausgaben
  Markdown / JSON / Workflow-Artefakte / lokale Reports
```

## Gestaltungsprinzipien

- Local-first als Standard, mit Ollama als primaerem Modellziel
- Einfache, nachvollziehbare CLI-Workflows vor komplexer Hintergrundautomatisierung
- Klare Modulgrenzen, damit Tools unabhaengig voneinander wachsen koennen
- Markdown und JSON als portable Standardausgaben
- Optionale Integrationen ueber Konfiguration und ENV-Dateien
- Ressourcenschutz als zentrales Prinzip fuer lokale KI-Prozesse

## Geplante Weiterentwicklung

1. Heuristische Platzhalter durch echte Modelladapter ersetzen
2. Workflow-Exporter und persistente Wissensbasis erweitern
3. Firecrawl-, PDF- und Transkript-Adapter ausbauen
4. RAG-taugliche Speicher- und Abrufpfade ergaenzen
5. Einen lokalen KI-Job-Queue-Manager fuer kontrollierte Abarbeitung integrieren
