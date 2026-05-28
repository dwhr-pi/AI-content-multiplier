# Nextcloud und myNextCloud Integration

Nextcloud/myNextCloud kann als Eingabe- und Ausgabeablage dienen.

## Ordnerstruktur

```text
ContentMultiplier/
  Inbox/
  Processing/
  Output/
  Archive/
```

## Ablauf

1. Nutzer legt PDF, URL-Liste oder Text in `Inbox/` ab.
2. n8n oder OpenClaw erkennt die neue Datei.
3. AI-ContentMultiplier erzeugt Analyse und Content-Entwuerfe.
4. Ergebnisse werden in `Output/<datum>-<slug>/` gespeichert.
5. Optional wird eine Zusammenfassung als `.summary.md` neben die Quelle gelegt.

## Sicherheit

- App-Passwoerter statt Hauptpasswort verwenden.
- Keine oeffentlichen Schreibfreigaben fuer `Inbox/`.
- Ergebnisse als Entwuerfe kennzeichnen.
- Urheberrechte und Plattformregeln vor Veroeffentlichung pruefen.
