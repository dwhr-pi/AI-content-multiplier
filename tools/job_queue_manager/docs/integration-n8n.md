# Integration mit n8n

Auch n8n-Workflows koennen ueber den Queue Manager kontrolliert gestartet
werden.

## Beispiel

```bash
kiq add --type n8n --command "n8n execute --id workflow-export"
```

## Einsatzfaelle

- aufwendige Export-Workflows
- Medienverarbeitung
- nachgelagerte Reporting-Jobs

## Empfehlung

- n8n nur ueber klar benannte Befehle starten
- schwere Workflow-Typen mit niedriger Parallelitaet ausfuehren
- Queue-Logs spaeter in Monitoring oder Reporting uebernehmen
