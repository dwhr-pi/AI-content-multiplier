# Niki Your Assistent: OpenClaw Starter

Diese Arbeitskopie ueberfuehrt den vorhandenen Claude-Starter in ein Format,
das sich sauber in dein Ultimate-KI-Setup und in OpenClaw einhaengen laesst.

## Ziel

Du bekommst hier keinen zweiten externen Fremd-Repo-Ersatz, sondern einen
lokalen Starter fuer deinen persoenlichen Assistenten:

- mit Kontext-Dateien
- mit Modul-Installationen
- mit OpenClaw-Profil
- mit uebertragenen Prompt-Bausteinen
- mit Sicherungen der Claude-Originale

## Start in OpenClaw

1. Lies `OPENCLAW.md`
2. Oeffne bei Bedarf `docs/profile/Niki_Your_Assistent.md`
3. Nutze die Prompts unter `prompts/`
4. Arbeite die Module unter `module-installs/` nacheinander ab

Empfohlene Reihenfolge:

1. `module-installs/absicherung`
2. `module-installs/kontext`
3. `module-installs/daten`
4. `module-installs/intelligenz`
5. `module-installs/boardroom_openclaw`

## Ordnerueberblick

- `OPENCLAW.md`: zentrale Arbeitsanweisung fuer OpenClaw
- `docs/profile/`: Rollenbeschreibung fuer den Assistenten
- `prompts/`: uebertragene Arbeitsaufforderungen statt Claude-Slash-Commands
- `module-installs/`: entpackte Module aus den Original-ZIPs
- `context/`: dein wachsender Geschaefts- und Nutzerkontext
- `plans/`: Plan- und Umsetzungsdokumente
- `backups/`: Claude-Originale innerhalb des Starter-Ordners

## Was bewusst erhalten blieb

- `CLAUDE.md` bleibt als Originaldatei im Starter vorhanden
- `.claude/` bleibt als Referenz erhalten
- zusaetzlich liegen dieselben Ursprungsdateien in `backups/`

## Was angepasst wurde

- OpenClaw-Einstieg statt Claude-Code-Einstieg
- uebertragene Prompt-Dateien statt Slash-Command-Abhaengigkeit
- OpenClaw-Agent-Definition fuer das Ultimate-KI-Setup
- shell-nahe Hinweise fuer lokale Nutzung
- klare Trennung zwischen Original und angepasster Variante
