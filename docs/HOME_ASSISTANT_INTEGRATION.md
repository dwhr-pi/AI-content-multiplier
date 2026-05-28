# Home Assistant Integration

Home Assistant ist fuer Benachrichtigungen und einfache Trigger gedacht, nicht
fuer die eigentliche Content-Erzeugung.

## Beispiele

- Benachrichtigung, wenn ein Content-Paket fertig ist.
- Warnung, wenn ein Workflow wegen fehlendem API-Key oder Modellfehler stoppt.
- Dashboard-Kachel fuer die letzten Content-Jobs.
- Sprachbefehl: "Erstelle aus der letzten Notiz einen LinkedIn-Entwurf".

## Empfohlene Benachrichtigung

```yaml
service: notify.mobile_app_phone
data:
  title: "AI-ContentMultiplier"
  message: "Content-Paket wurde erstellt und wartet auf Review."
```

## Sicherheitsregel

Home Assistant soll keine externen Posts automatisch ausloesen. Jede
Veroeffentlichung bleibt reviewpflichtig.
