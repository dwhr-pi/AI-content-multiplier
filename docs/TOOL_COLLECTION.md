# Toolsammlung fuer AI-ContentMultiplier

AI-ContentMultiplier ist als Workflow mit mehreren austauschbaren Bausteinen
gedacht. Nicht jeder Baustein muss installiert sein. Das Setup soll zuerst
lokal und klein starten und weitere Tools nur bewusst aktivieren.

## Quellen und Extraktion

| Baustein | Zweck | Status |
|---|---|---|
| Firecrawl | Webseiten crawlen und als Markdown extrahieren | optional |
| Lokaler HTTP-/HTML-Extractor | einfache Webseiten ohne externen Dienst lesen | planned |
| PDF Parser | PDFs in Text/Markdown umwandeln | planned |
| OCR | gescannte PDFs auslesen | optional |
| YouTube Transcript Import | vorhandene Transkripte analysieren | planned |
| LinkedIn Text Import | eigene oder freigegebene LinkedIn-Texte analysieren | planned |

## Modell-Routing

| Baustein | Zweck | Status |
|---|---|---|
| Ollama | lokaler Standard fuer private Verarbeitung | empfohlen |
| Gemini | optionales Cloud-Modell | optional |
| Claude | optionales Cloud-Modell | optional |
| OpenAI | optionales Cloud-Modell | optional |

## Ausgabe und Export

| Baustein | Zweck | Status |
|---|---|---|
| Markdown Export | Standardformat fuer Entwuerfe | empfohlen |
| HTML Export | Web-/Newsletter-Vorschau | planned |
| DOCX Export | Office-Weitergabe | optional |
| PDF Export | finale Lesefassung | optional |
| Pandoc | Konvertierung Markdown zu HTML/DOCX/PDF | optional |
| LibreOffice headless | DOCX/PDF-Konvertierung | optional |

## Integrationen

| Baustein | Zweck | Status |
|---|---|---|
| OpenClaw | Agentische Orchestrierung und Review-Regeln | empfohlen |
| n8n | Webhooks, Trigger, Dateiablage, Benachrichtigungen | optional |
| Home Assistant | Benachrichtigung und einfache Trigger | optional |
| Nextcloud/myNextCloud | Inbox, Output, Archiv | optional |

## Sicherheitsgrundsatz

- Kein Baustein darf automatisch Inhalte veroeffentlichen.
- Cloud-Bausteine bleiben deaktiviert, bis `ALLOW_CLOUD_MODE=true` gesetzt ist.
- Zugangsdaten liegen nur lokal im User-Workspace.
- LinkedIn, YouTube und Webseiten werden nur im erlaubten Rahmen verarbeitet.
