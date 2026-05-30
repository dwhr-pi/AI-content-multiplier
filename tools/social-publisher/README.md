# Social Publisher

Status: Geplantes Grundgeruest

`social-publisher` ist ein Human-in-the-loop-Modul fuer Publishing ueber
offizielle Social-Platform-APIs.

## Leitplanken

- Keine Fake- oder Massenaccount-Erstellung
- Keine Passwortspeicherung
- Keine Cookie-Automation
- Kein Browser-Scraping zum Posten
- Kein Posting ohne explizite menschliche Freigabe
- Nur offiziell verbundene Accounts duerfen genutzt werden

## Erste Zielplattformen

- Instagram Business / Creator ueber offizielle Meta-APIs
- Facebook Pages
- LinkedIn
- YouTube
- X / Twitter
- TikTok spaeter

## Geplante CLI-Form

```bash
pnpm ai-content social connect instagram
pnpm ai-content social list-accounts
pnpm ai-content social draft instagram ./examples/output/post.md
pnpm ai-content social schedule instagram ./examples/output/post.md --time "2026-06-01T18:00:00+02:00"
pnpm ai-content social publish instagram ./examples/output/post.md --confirm
```

## Modulaufbau

- `src/providers/` fuer offizielle Plattform-Adapter
- `src/auth/` fuer OAuth und sichere Token-Behandlung
- `src/queue/` fuer Scheduling- und Publish-Jobs
- `src/moderation/` fuer Sicherheits-, Copyright- und Policy-Checks
- `prompts/` fuer Caption- und Freigabevorlagen
- `examples/` fuer sichere Beispiel-Payloads

## Sicherheitsmodell

Der Publishing-Workflow ist bewusst so aufgebaut:

```text
Mensch erstellt Account
  -> Mensch authorisiert OAuth
  -> KI bereitet Entwurf vor
  -> Sicherheitspruefungen laufen
  -> Mensch bestaetigt
  -> Offizielle API veroeffentlicht oder plant
  -> Ergebnis wird geloggt
```
