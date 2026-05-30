# Integration mit OpenClaw

Der Queue Manager ist als kontrollierter Starter fuer OpenClaw-Agenten gedacht.

## Ziel

- Nicht mehrere schwere Agenten gleichzeitig starten
- CPU-, RAM- und GPU-Last vor jedem Start pruefen
- Agentenaufrufe sauber protokollieren

## Beispiel

```bash
kiq add --type openclaw --priority high --command "openclaw run --agent repo-analyse"
```

## Empfehlung

- Pro Agentenlauf einen expliziten `--command` hinterlegen
- OpenClaw-Ausgaben in die Job-Logs schreiben lassen
- Fuer besonders schwere Agenten `max_parallel_jobs` auf `1` belassen
