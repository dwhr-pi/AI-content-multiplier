# Codex-Prompt: Boardroom-Skill in Ultimate KI Setup integrieren

Du arbeitest im Repository:

```text
https://github.com/dwhr-pi/VPS-_Kubernate-_Ollama_OpenClaw_installation
```

Ziel: Integriere eine OpenClaw-/Ollama-kompatible Boardroom-Skill für strategische Entscheidungen. Die ursprüngliche Idee stammt aus einer Claude-Skill, muss aber vollständig für unser Setup umgebaut werden.

## Aufgaben

1. Suche im Repo nach vorhandenen Profilen unter:

```text
docs/profile/
docs/profil/
Ultimate_KI_Setup/
```

2. Erstelle oder aktualisiere ein Profil:

```text
docs/profile/Boardroom.md
```

Falls die vorhandene Struktur deutsch `profil` statt `profile` nutzt, passe dich an die bestehende Struktur an und dokumentiere die Entscheidung.

3. Erstelle zusätzlich eine Skill-Datei:

```text
skills/boardroom/SKILL.md
```

Falls es noch keinen `skills/`-Ordner gibt, lege ihn an.

4. Entferne alle Claude-spezifischen Annahmen:

- keine Pflicht auf `CLAUDE.md`
- keine Claude-Code-Installation
- keine Claude-Cowork-Hinweise
- keine Claude-Toolnamen wie `Glob`/`Read` als zwingende Voraussetzung

5. Ersetze sie durch OpenClaw-/Ollama-kompatiblen Kontext:

- `README.md`
- `docs/profile/*.md` oder `docs/profil/*.md`
- `memory/*.md`
- `.env.example`
- `install*.sh`
- `setup*.sh`
- frühere Boardroom-Protokolle

6. Implementiere die Boardroom-Logik als Dokumentation und nutzbaren Prompt:

- Frage framen
- CFO analysiert
- Operator analysiert
- Vertriebler analysiert
- Mentor analysiert
- Skeptiker analysiert
- Antworten anonymisieren
- Peer-Review durchführen
- Chairman-Verdict erzeugen

7. Füge Trigger hinzu:

```text
Boardroom rufen
Boardroom fragen
Lass das Boardroom entscheiden
Stress-test das
Pressure-test das
Lohnt sich das für unser Setup?
Welche Option ist besser?
```

8. Ergänze Setup-spezifische Gewichtung:

- Datenschutz und lokale Kontrolle hoch gewichten
- Cloud-Lock-in vermeiden
- Docker nur optional, weil dieses Projekt Git-/Shell-Installationen bevorzugt
- WSL2/Ubuntu/Ollama/OpenClaw/n8n/Cloudflare Tunnel/Tailscale/Home Assistant/Kubernetes berücksichtigen
- bei Security-Fragen Skeptiker und Operator stärker gewichten
- bei VPS-/GPU-/Kubernetes-Fragen CFO, Operator und Skeptiker stärker gewichten

9. Ergänze im Haupt-README einen kurzen Abschnitt:

```markdown
## Boardroom-Profil

Das Boardroom-Profil hilft bei strategischen Entscheidungen im Setup. Es simuliert CFO, Operator, Vertriebler, Mentor und Skeptiker und erzeugt danach ein Chairman-Verdict. Aktivierung z.B. mit: `Boardroom rufen: Soll ich X oder Y für unser Setup nutzen?`
```

10. Prüfe abschließend:

- keine kaputten Links
- Markdown sauber formatiert
- deutsche Sprache konsistent
- bestehende Profilstruktur nicht zerstören
- keine Secrets oder API-Keys committen

## Erwartetes Ergebnis

Am Ende soll das Repo mindestens enthalten:

```text
docs/profile/Boardroom.md
skills/boardroom/SKILL.md
```

oder die äquivalenten Pfade passend zur bestehenden Struktur.

Erstelle danach eine kurze Zusammenfassung der Änderungen und liste alle geänderten Dateien auf.
