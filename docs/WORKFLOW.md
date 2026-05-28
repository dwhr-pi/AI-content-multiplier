# Workflow

## 1. Quelle erfassen

Unterstuetzte Eingaben:

- URL
- PDF-Datei
- HTML-/Markdown-Datei
- YouTube-Transkript
- LinkedIn-Text oder Export
- freier Rohtext

## 2. Extraktion

Empfohlene Extraktion:

- Webseiten: Firecrawl oder Browser-/HTTP-Fallback
- PDF: lokaler PDF-Parser, OCR optional
- YouTube: vorhandenes Transkript oder manuell eingefuegter Transcript-Text
- LinkedIn: nur eigene oder rechtmaessig freigegebene Inhalte

## 3. Analyse

Der Analyse-Schritt erzeugt:

- Kurzfassung
- Zielgruppe
- Tonalitaet
- zentrale Aussagen
- Belege und offene Fragen
- moegliche Risiken
- Content-Winkel
- SEO-Themen

## 4. Content-Erzeugung

Ausgaben:

- LinkedIn Posts
- Blogartikel
- Newsletter
- X Threads
- Facebook Posts
- FAQ
- SEO Keywords

Jede Ausgabe soll als Entwurf markiert werden und eine Review-Checkliste
enthalten.

## 5. Export

Unterstuetzte Zielformate:

- Markdown
- HTML
- DOCX
- PDF

DOCX/PDF koennen ueber Pandoc, LibreOffice headless oder spaeter ueber ein
dediziertes Exportmodul erzeugt werden.

## 6. Ablage

Empfohlene Ablage:

```text
output/
  <datum>-<slug>/
    source.md
    analysis.md
    linkedin.md
    blog.md
    newsletter.md
    x-thread.md
    facebook.md
    faq.md
    seo-keywords.md
    export.html
    export.docx
    export.pdf
```

## 7. Review

Vor Nutzung oder Veroeffentlichung pruefen:

- Stimmen Fakten und Quellen?
- Wurden fremde Inhalte nur rechtmaessig genutzt?
- Sind Marken-, Urheber- und Plattformregeln eingehalten?
- Sind Cloud-Modelle bewusst genutzt worden?
- Sind personenbezogene Daten entfernt oder erlaubt?
