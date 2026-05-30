# Workflows

Das Repository haelt Workflow-Artefakte in kanonischen Unterordnern unter
`workflows/`.

## Kanonische Orte

- `workflows/n8n/`
- `workflows/openclaw/`
- `workflows/ollama/`

Aktuelle Beispiele decken Content-Multiplication- und Social-Publishing-Blueprints ab.

## Kompatibilitaetshinweis

Bestehende Top-Level-Ordner bleiben erhalten:

- `n8n/`
- `openclaw/`
- `nextcloud/`
- `home-assistant/`

Sie bleiben bewusst bestehen, damit vorhandene Ultimate-KI-Setup-Integrationen
nicht brechen, waehrend die neue Tool-Sammlung eingefuehrt wird.

## Typischer Ablauf

```text
Quelle
  -> analysieren
  -> anreichern
  -> Entwuerfe erzeugen
  -> menschliche Pruefung
  -> exportieren
  -> an Automation uebergeben
```

## Social-Publishing-Ablauf

```text
Input-Idee
  -> Content Multiplier
  -> Prompt Generator
  -> Medien vorbereiten
  -> Richtlinien pruefen
  -> Posting-Entwurf
  -> menschliche Freigabe
  -> offizielles API-Publishing
  -> Logging und Auswertung
```

## Queue-Manager-Ablauf

```text
Auftrag annehmen
  -> persistieren
  -> Prioritaet auswerten
  -> CPU/RAM/GPU/Speicher pruefen
  -> Job starten oder warten lassen
  -> Logs schreiben
  -> Status aktualisieren
```
