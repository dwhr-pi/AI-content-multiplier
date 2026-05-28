# OpenClaw Integration

AI-ContentMultiplier ist als OpenClaw-Workflow-Agent gedacht. OpenClaw soll den
Arbeitsablauf koordinieren, aber keine Inhalte ohne Review veroeffentlichen.

## Agentenaufgabe

Der Agent nimmt eine Quelle entgegen, extrahiert Text, analysiert Inhalt und
erstellt mehrere Content-Entwuerfe.

## Empfohlener Ablauf

```text
User Prompt
  -> Quelle pruefen
  -> Extraktion anfordern
  -> Analyse erstellen
  -> Content-Varianten erzeugen
  -> Review-Checkliste anhaengen
  -> Ergebnisse speichern
  -> optional n8n/Nextcloud/Home Assistant informieren
```

## Beispiel-Prompt

```text
Analysiere diese URL fuer eine Content-Kampagne:
<URL>

Erzeuge:
- 2 LinkedIn Posts
- einen Blogartikel
- einen Newsletter
- einen X Thread
- eine FAQ
- SEO Keywords

Nutze lokal Ollama, sofern moeglich. Verwende Cloud-Modelle nur, wenn diese in
der lokalen Konfiguration ausdruecklich erlaubt sind. Speichere alle Ergebnisse
als Markdown und fuege eine Review-Checkliste hinzu.
```

## Sicherheitsregeln fuer den Agenten

- Keine API-Keys anzeigen.
- Keine Inhalte automatisch veroeffentlichen.
- Keine Login-geschuetzten oder fremden Inhalte scrapen, wenn keine Erlaubnis vorliegt.
- Quellen, Annahmen und offene Fragen transparent notieren.
- Bei medizinischen, rechtlichen, finanziellen oder sicherheitskritischen
  Themen nur Entwuerfe und Hinweise erzeugen, keine Fachberatung ersetzen.

## Agentenprofil

Siehe `openclaw/ai-content-multiplier.agent.json`.
