# Migration von Claude zu OpenClaw

## Ausgangslage

Die Ursprungsdateien in `Niki-Your_assistent` waren stark auf Claude Code
zugeschnitten:

- `CLAUDE.md` als zentrales Sitzungsdokument
- `.claude/commands/` fuer Slash-Befehle
- `.claude/skills/` fuer Claude-nahe Skill-Strukturen
- Formulierungen wie "oeffne den Ordner in Claude Code"

## Was ich angepasst habe

- Ein neues zentrales Sitzungsdokument: `OPENCLAW.md`
- Eine OpenClaw-Rollenbeschreibung unter `docs/profile/`
- Eine Prompt-Sammlung unter `prompts/`, die die wichtigsten
  Claude-Befehlsrollen in offene Arbeitsanweisungen uebersetzt
- Ein OpenClaw-Agent-JSON unter `workflows/openclaw/`
- Die Modul-ZIPs direkt entpackt und in `module-installs/` eingebunden

## Was bewusst erhalten blieb

- `CLAUDE.md`
- der komplette `.claude/`-Ordner
- Kopien der Ursprungsdateien in `backups/`
- zusaetzliche Backup-Kopien der Original-ZIPs in `../backup-originale/`

## Wie du damit arbeiten solltest

- Fuer OpenClaw nutze `OPENCLAW.md`
- Fuer die Rolle nutze `docs/profile/Niki_Your_Assistent.md`
- Fuer wiederkehrende Arbeitsmodi nutze `prompts/`
- Fuer inhaltliche Modulfuehrung nutze `module-installs/*/INSTALL.md`

## Wichtige Annahme

OpenClaw-Installationen unterscheiden sich je nach lokaler Einbindung. Darum
ist diese Migration bewusst datei- und profilorientiert gebaut, nicht auf eine
einzige starre CLI-Syntax festgenagelt.
