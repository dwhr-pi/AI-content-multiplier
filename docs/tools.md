# Tools

Dieses Repository dokumentiert sowohl bereits umgesetzte MVPs als auch
geplante Module fuer das Ultimate KI Setup.

## Umgesetzte MVPs

### Content Multiplier

- Befehle: `analyze-url`, `multiply`
- Eingaben: URL, Text, Markdown, Transkript, einfache lokale Dateien
- Ausgaben: Markdown- oder JSON-Berichte mit Content-Entwuerfen fuer mehrere Plattformen

### Prompt Generator Pro

- Befehl: `prompt`
- Eingaben: Kurze kreative oder technische Aufgabenbeschreibung
- Ausgaben: Modell-Empfehlungen und wiederverwendbare Prompt-Bundles

### GitHub Scout

- Befehl: `github`
- Eingaben: GitHub-URL oder `owner/repo`
- Ausgaben: Repo-Zusammenfassung, Release-Snapshot, Issue-Stichprobe, Integrationsnotizen

## Geplante Tools

- Content Reverse Engineer
- AI Research Agent
- Open Source Clone Finder
- Project Architect
- Video Factory
- Social Publisher
- KI Job Queue Manager
- Self Learning Knowledge Base
- Workflow Exporter

### Social Publisher

- Geplante Befehlsfamilie: `social`
- Erste Ziele: Instagram Business / Creator, Facebook Page, LinkedIn, YouTube, X
- Workflow: Entwurf -> Richtlinienpruefung -> menschliche Freigabe -> offizielles API-Publishing oder Scheduling
- Harte Regeln: keine Fake-Accounts, keine Passwortspeicherung, keine Cookie-Automation

### KI Job Queue Manager

- Geplanter Fokus: `kiq` als eigenstaendige lokale CLI
- Zweck: Lokale KI-Jobs seriell oder mit Limit ausfuehren und Systemueberlastung verhindern
- Zielsysteme: Codex, OpenClaw, Ollama, n8n, Whisper, Video-, Bild- und Shell-Workflows
- Harte Regeln: Ressourcen vor jedem Start pruefen, Queue persistent halten, Logs pro Job schreiben
- Leitstand: kleines lokales Webinterface fuer laufende, wartende und blockierte Auftraege
