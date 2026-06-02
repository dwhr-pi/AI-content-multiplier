# AI Content Multiplier

AI Content Multiplier ist eine lokale, modulare Open-Source-Tool-Sammlung fuer
das Ultimate KI Setup. Das Projekt soll Inhalte analysieren, vervielfaeltigen,
rekonstruieren, umwandeln und fuer verschiedene Plattformen ausgeben.

Der Schwerpunkt liegt auf einem stabilen, erweiterbaren und integrationsfaehigen
Werkzeugkasten mit starker Anbindung an Ollama, OpenClaw, n8n, Firecrawl,
GitHub, Nextcloud und Home Assistant.

## Warum dieses Repository eigenstaendig existiert

Diese Tool-Sammlung existiert bewusst eigenstaendig neben dem Ultimate KI
Setup. Sie ist keine Konkurrenz dazu, sondern sinnvolles Zubehoer und eine
aktive Erweiterung fuer das gesamte Setup.

Der Unterschied ist wichtig:

- Das Ultimate KI Setup bildet den grossen Rahmen mit seinen Kern-Tools,
  Integrationen und uebergreifenden Workflows.
- Dieses Repository sammelt dagegen bewusst kleine, komplette und klar
  abgegrenzte Werkzeuge, die das Gesamtsetup praktisch erweitern.
- Hier liegen keine ausgelagerten Fremd-Repositories oder blossen GitHub-Links,
  sondern eigene, direkt gepflegte Tools innerhalb einer gemeinsamen Sammlung.
- Die Sammlung wird aktiv weiterentwickelt, damit neue Bausteine schnell,
  modular und ohne unnoetige Repo-Zersplitterung ergaenzt werden koennen.

Kurz gesagt: Das Ultimate KI Setup ist die uebergeordnete Plattform. Dieses
Projekt ist das passende Werkzeugregal daneben.

## Was bereits enthalten ist

- Eine TypeScript-CLI fuer lokale Workflows
- Eine modulare Tool-Registry mit aktiven und geplanten Modulen
- MVPs fuer `content-multiplier`, `prompt-generator` und `github-scout`
- Workflow-Artefakte fuer OpenClaw, n8n und Ollama
- Wiederverwendbare Profile fuer Content, Recherche, Reverse Engineering und Planung
- Beispiel-Eingaben, Ausgaben, Reports und Konfigurationsvorlagen

## Aktueller Tool-Status

| Tool | Status | Zweck |
|---|---|---|
| Content Multiplier | MVP | Wandelt Quellen in mehrere Content-Entwuerfe fuer verschiedene Plattformen um |
| Prompt Generator Pro | MVP | Erzeugt Prompt-Pakete mit Modell-Empfehlungen |
| GitHub Scout | MVP | Analysiert GitHub-Repositories und bewertet Integrationspotenzial |
| Content Reverse Engineer | Geplant | Zerlegt erfolgreiche Inhalte in Hooks, Storytelling- und CTA-Muster |
| AI Research Agent | Geplant | Erstellt Zusammenfassungen, Vergleiche und quellenbasierte Berichte |
| Open Source Clone Finder | Geplant | Findet Alternativen, Forks und Open-Source-Nachbarschaften |
| Project Architect | Geplant | Uebersetzt Ideen in Architektur, Roadmap und MVP-Plan |
| Video Factory | Geplant | Erzeugt Storyboards, Prompt-Ketten und Produktionsplaene |
| Social Publisher | Geplant | Bereitet human-approved Posting-Entwuerfe fuer offizielle Social-APIs vor |
| KI Job Queue Manager | Geplant | Kontrolliert lokale KI-Auftraege und schuetzt vor CPU-, RAM- und GPU-Ueberlastung |
| SessionWebsiteFactory | MVP | Erzeugt lokale Website- und Landingpage-Prototypen aus Ideen ohne Claude-Abhaengigkeit |
| Self Learning Knowledge Base | Geplant | Speichert Wissen fuer spaetere RAG-Workflows |
| Workflow Exporter | Geplant | Exportiert Ergebnisse in Automationen und Dokumentformate |
| Ultimate Ubuntu Hybrid | Neu | Automatisiert ein Ubuntu-24.04-Hybrid-Setup fuer Windows, Android, Gaming, Remote-Zugriff und lokale AI-Workloads |

## Projektstruktur

```text
AI-content-multiplier/
|- config/
|- docs/
|- examples/
|- profiles/
|- scripts/
|- src/
|- tools/
|- workflows/
|- .env.example
|- package.json
|- README.md
`- tsconfig.json
```

Das Repository behaelt ausserdem die bestehenden Top-Level-Ordner wie
`openclaw/`, `n8n/`, `nextcloud/` und `home-assistant/`, damit vorhandene
Integrationen nicht brechen. Die neue kanonische Struktur lebt zusaetzlich in
`workflows/` und `tools/`.

## Schnellstart

```bash
pnpm install
pnpm build

pnpm ai-content list
pnpm ai-content analyze-url "https://example.com"
pnpm ai-content multiply examples/input/sample-source.md
pnpm ai-content github https://github.com/openai/openai-cookbook
pnpm ai-content prompt "Erstelle ein Celtic-Trance-Musikvideo"
pnpm ai-content social
```

## CLI-Befehle

```bash
pnpm ai-content list
pnpm ai-content doctor
pnpm ai-content analyze-url "https://example.com" --output markdown
pnpm ai-content multiply input.md --output json
pnpm ai-content reverse transcript.md
pnpm ai-content github https://github.com/example/repo
pnpm ai-content prompt "Erstelle ein Musikvideo im Celtic Trance Stil"
pnpm ai-content social
```

## Local-first-Standards

- Ollama ist der Standardpfad fuer lokale Modellaufrufe
- Cloud-APIs bleiben optional und werden nur ueber ENV aktiviert
- Generierte Inhalte gelten immer zuerst als Entwurf
- Automatisches Veroeffentlichen ist standardmaessig deaktiviert
- Secrets duerfen niemals committed werden

## Integrationen

- Ollama fuer lokale Text- und Prompt-Verarbeitung
- OpenClaw fuer Agenten-Orchestrierung
- n8n fuer Workflow-Automatisierung
- Firecrawl fuer URL-Extraktion
- GitHub fuer Repository-Analysen
- Offizielle Social-APIs fuer human-approved Publishing
- KI-Leitstand fuer lokale Queue-, Status- und Ressourcen-Uebersicht
- SessionWebsiteFactory fuer lokale Landingpage- und Website-Prototypen
- Nextcloud/myNextcloud fuer Dateiablage
- Home Assistant fuer lokale Trigger und Benachrichtigungen

## Dokumentation

- [Architektur](docs/architecture.md)
- [Tools](docs/tools.md)
- [Workflows](docs/workflows.md)
- [Prompts](docs/prompts.md)
- [API](docs/api.md)
- [Setup](docs/setup.md)
- [Ultimate Ubuntu Hybrid](tools/ultimate-ubuntu-hybrid/README.md)

Bestehende Integrationsnotizen bleiben weiterhin verfuegbar:

- [Legacy-Architektur](docs/ARCHITECTURE.md)
- [Legacy-Workflow](docs/WORKFLOW.md)
- [Ultimate-KI-Setup-Integration](docs/ULTIMATE_KI_SETUP_INTEGRATION.md)

## Sicherheit

- Keine API-Keys, Tokens oder personenbezogenen Daten committen
- Generierte Inhalte vor jeder Nutzung oder Veroeffentlichung pruefen
- Urheberrecht, Lizenzen und Plattformregeln einhalten
- Cloud-Modelle nur nach bewusster lokaler Konfiguration verwenden
- Keine Fake-Account-Automation, Passwort-Logins oder Cookie-basiertes Posting

## Roadmap

1. Die bestehenden CLI-MVPs weiter stabilisieren
2. Echte Adapter fuer Ollama, Firecrawl und Exporte ergaenzen
3. Wissensbasis, Recherche und Social Publishing ausbauen
4. Den KI Job Queue Manager fuer kontrollierte Auftragssteuerung integrieren
5. Weitere Automationsvorlagen fuer n8n und OpenClaw liefern
