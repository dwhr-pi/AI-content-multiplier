# Niki Your Assistent: OpenClaw Starter

Dieses Paket ist die OpenClaw-taugliche Ableitung der vorhandenen
Claude-orientierten Dateien aus `Niki-Your_assistent`.

## Was enthalten ist

- `openclaw-starter/`: der angepasste Starter fuer OpenClaw im Ultimate-KI-Setup
- `openclaw-starter/backups/`: Sicherungen der originalen Claude-Dateien
- `openclaw-starter/module-installs/`: entpackte Module fuer Absicherung,
  Kontext, Daten, Intelligenz und Boardroom
- `backup-originale/`: unveraenderte Kopien der urspruenglichen ZIP-Dateien
  und der originalen `readme.md`

## Wichtiger Punkt

Die Originale bleiben erhalten. Ich habe sie nicht ueberschrieben, sondern als
Backup im Paket mit abgelegt und darauf aufbauend eine OpenClaw-kompatible
Arbeitskopie erzeugt.

## Einstieg

1. Oeffne `openclaw-starter/`
2. Lies `openclaw-starter/README.md`
3. Nutze fuer OpenClaw die Datei `openclaw-starter/OPENCLAW.md`
4. Nutze fuer die Agent-Rolle
   `openclaw-starter/docs/profile/Niki_Your_Assistent.md`
5. Binde bei Bedarf
   `openclaw-starter/workflows/openclaw/niki-your-assistant.agent.json` ein

## Hinweise

- Die urspruenglichen Claude-Befehle bleiben als Referenz in
  `openclaw-starter/backups/.claude.original/` erhalten.
- Fuer OpenClaw liegen uebertragene Arbeitsanweisungen unter
  `openclaw-starter/prompts/`.
- Die Modulpakete wurden nicht inhaltlich zerstoert. Stattdessen gibt es eine
  OpenClaw-Schicht drumherum, damit dein Ultimate-KI-Setup damit arbeiten kann.
