# Shell-Hinweise fuer OpenClaw

Diese Aliase sind bewusst als Beispiel formuliert, weil OpenClaw lokal je nach
Installation unterschiedlich eingebunden sein kann.

## Beispiel

Trag sie bei Bedarf in deine `~/.zshrc` oder `~/.bashrc` ein und passe den
eigentlichen OpenClaw-Befehl an deine lokale Installation an.

```bash
alias oc-prime='openclaw --profile docs/profile/Niki_Your_Assistent.md --prompt-file prompts/prime.md'
alias oc-assistant='openclaw --agent workflows/openclaw/niki-your-assistant.agent.json'
```

## Zweck

- `oc-prime`: startet eine Sitzung mit dem Profil und dem Prime-Prompt
- `oc-assistant`: startet den vorkonfigurierten Assistenten-Agenten

## Hinweis

Wenn deine lokale OpenClaw-CLI andere Parameter erwartet, passe nur den
Befehlskopf an. Die Dateien und Rollen in diesem Ordner bleiben dabei gleich.
