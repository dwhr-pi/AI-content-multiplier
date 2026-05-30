# Integration mit Codex

Der Queue Manager steuert Codex nicht intern, sondern als Wrapper.

## Idee

Codex wird nur dann gestartet, wenn:

- freie Slots vorhanden sind
- CPU, RAM und optional GPU unter Grenzwert liegen
- genug freier Speicherplatz verfuegbar ist

## Beispiel

```bash
kiq add --type codex --priority high --command "codex run --repo ./myProject --task 'Fix build errors'"
```

## Vorteil

- Keine unkontrollierten Mehrfachstarts
- Saubere Protokollierung pro Job
- Bessere Einbettung in ein lokales Ultimate KI Setup
