# AI-ContentMultiplier Workflow-Spezifikation

## Input

```json
{
  "source": "URL, Datei oder Rohtext",
  "source_type": "url|pdf|youtube_transcript|linkedin|text",
  "outputs": ["linkedin_posts", "blog_article", "newsletter"],
  "model_provider": "ollama",
  "review_required": true
}
```

## Schritte

1. Quelle validieren.
2. Nutzungs-/Sicherheitsnotiz erzeugen.
3. Text extrahieren.
4. Analyse erstellen.
5. Content-Plan erstellen.
6. Gewuenschte Ausgabeformate erzeugen.
7. Review-Checkliste anhaengen.
8. Ergebnisse speichern.
9. Optional Benachrichtigung ausloesen.

## Fehlerfaelle

| Fehler | Reaktion |
|---|---|
| Quelle nicht erreichbar | Diagnose speichern, keine Cloud-Fallbacks ohne Freigabe. |
| PDF nicht lesbar | OCR optional vorschlagen. |
| Kein API-Key fuer Firecrawl | Lokalen Fallback oder manuellen Text anbieten. |
| Cloud deaktiviert | Ollama verwenden oder Nutzer um Freigabe bitten. |
| Auto-Publish angefordert | Ablehnen und Entwurf speichern. |
