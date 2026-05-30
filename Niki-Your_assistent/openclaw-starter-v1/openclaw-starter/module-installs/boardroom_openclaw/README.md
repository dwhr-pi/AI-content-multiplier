# Boardroom für Ultimate KI Setup

Umbau der ursprünglichen Claude-Boardroom-Skill für ein lokales Setup mit **Ollama + OpenClaw**.

Ziel: Eine strategische Entscheidungsrunde mit fünf unabhängigen Rollen:

1. **CFO** – Kosten, ROI, Cashflow, Risiko
2. **Operator** – Umsetzung, Prozesse, Skalierbarkeit
3. **Vertriebler** – Kundenreaktion, Markt, Pricing, Pitch
4. **Mentor** – Erfahrung, Langzeitfolgen, Mustererkennung
5. **Skeptiker** – versteckte Risiken, Worst Case, Annahmenprüfung

Danach erfolgt ein anonymisiertes Peer-Review und ein finales Chairman-Verdict.

## Anpassung gegenüber Claude-Version

Entfernt/ersetzt wurden:

- `CLAUDE.md` als Pflicht-Kontext
- Claude Code / Claude Cowork Installationslogik
- Claude-Skill-spezifische Triggerbeschreibung
- Toolnamen wie `Glob` und `Read` als Claude-spezifische Annahmen

Ersetzt durch:

- OpenClaw-/Ollama-kompatibles Rollenprofil
- optionaler Projektkontext aus `docs/profile/`, `memory/`, `README.md`, `.env.example`, Setup-Skripten und früheren Boardroom-Protokollen
- lokaler Betrieb mit einem oder mehreren Ollama-Modellen
- Codex-Prompt zur Integration ins bestehende GitHub-Projekt

## Empfohlener Speicherort im Repo

```text
Ultimate_KI_Setup/
├── docs/
│   └── profile/
│       └── Boardroom.md
├── skills/
│   └── boardroom/
│       └── SKILL.md
└── prompts/
    └── codex_integrate_boardroom.md
```

## Trigger

- `Boardroom rufen`
- `Boardroom fragen`
- `Lass das Boardroom entscheiden`
- `Stress-test das`
- `Pressure-test das`
- `Lass CFO, Operator, Vertrieb, Mentor und Skeptiker prüfen`

## Wann nutzen?

Gut geeignet für:

- Tool-Auswahl im KI-Setup
- VPS/Kubernetes/Ollama/OpenClaw-Architekturentscheidungen
- Kosten-/Nutzen-Abwägungen
- Automatisierung vs. manuelle Umsetzung
- Security-/Privacy-Entscheidungen
- Produkt-, Marketing-, Musik-, Video- oder App-Projektentscheidungen

Nicht ideal für:

- einfache Faktenfragen
- reine Zusammenfassungen
- reine Schreibaufträge ohne Entscheidung
- Aufgaben mit genau einer objektiv richtigen Antwort

## Lokale Modell-Empfehlung

Für schwächere Hardware:

```text
llama3.2:1b oder llama3.2:3b
```

Für bessere Qualität:

```text
llama3.1:8b, qwen2.5:7b, mistral:7b, gemma2:9b
```

Für Hybrid-Setup:

- Rollen lokal über Ollama ausführen
- Chairman optional über stärkeres Cloud-Modell laufen lassen
- sensible Projektdateien lokal halten

