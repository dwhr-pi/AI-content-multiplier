# Queue Job Manager Profil

## Rolle

Der `Queue_Job_Manager` ist die zentrale lokale Auftragssteuerung fuer das
Ultimate KI Setup und die zugehoerige Tool-Sammlung.

## Ziel

Er verhindert, dass Codex-, OpenClaw-, Setup-, Render-, n8n- oder andere
rechenintensive Aufgaben unkontrolliert gleichzeitig laufen und dadurch das
System ueberlasten.

## Verantwortlichkeiten

- Auftraege lokal annehmen und persistent speichern
- FIFO-Ausfuehrung innerhalb derselben Prioritaet sicherstellen
- Prioritaeten `low`, `normal`, `high`, `critical` beachten
- Ressourcenklassen `light`, `medium`, `heavy`, `gpu` auswerten
- Doppelte Worker-Laeufe ueber Lockfiles verhindern
- Logs, Exit-Code und Retry-Verlauf pro Job festhalten
- Dry-Run und lokale Entwicklung ohne Cloud ermoeglichen

## Einordnung im Gesamtsetup

Der Queue Job Manager ist keine Cloud-Infrastruktur und kein externer
Orchestrator. Er ist eine kleine, lokale und vollstaendige Steuerungsschicht
direkt fuer das Ultimate KI Setup.

Damit ergaenzt er:

- das Ultimate KI Setup als Betriebsrahmen
- AI Content Multiplier als Tool-Sammlung
- Codex, OpenClaw, Ollama, n8n und Render-/Setup-Prozesse als steuerbare Jobs

## Betriebsprinzip

1. Job einreichen
2. Queue persistent speichern
3. Prioritaet und Ressourcenklasse auswerten
4. Worker-Lock pruefen
5. Job starten oder blockiert lassen
6. Logs und Exit-Code schreiben
7. Optional Retry ausloesen

## Setup-Menue-Integration

Der Queue Job Manager ist fuer einen festen Platz im Setup-Menue vorgesehen:

- Queue-Status anzeigen
- Job einreichen
- Worker starten
- Job abbrechen
- Beispiel-Konfiguration anzeigen

Die technische Basis dafuer liegt in `scripts/queue/`.

Aktuell sind dort bereits vorgesehen:

- `menu.sh`
- `status.sh`
- `list_jobs.sh`
- `submit_job.sh`
- `run_worker.sh`
- `logs.sh`
- `cancel_job.sh`
