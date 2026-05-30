#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

while true; do
  cat <<'EOF'

[ Queue Job Manager ]
1. Queue-Status anzeigen
2. Jobs auflisten
3. Job einreichen
4. Worker einmal starten
5. Worker als Daemon starten
6. Job-Logs anzeigen
7. Job abbrechen
8. Beispiel-Konfiguration anzeigen
9. Beenden

EOF

  read -r -p "Auswahl: " choice

  case "$choice" in
    1)
      "$SCRIPT_DIR/status.sh"
      ;;
    2)
      "$SCRIPT_DIR/list_jobs.sh"
      ;;
    3)
      read -r -p "Beschreibung: " description
      read -r -p "Typ [custom]: " job_type
      read -r -p "Prioritaet [normal]: " priority
      read -r -p "Ressourcenklasse [medium]: " resource_class
      read -r -p "Befehl (optional): " command
      cmd=("$SCRIPT_DIR/submit_job.sh")
      [[ -n "$job_type" ]] && cmd+=(--type "$job_type")
      [[ -n "$priority" ]] && cmd+=(--priority "$priority")
      [[ -n "$resource_class" ]] && cmd+=(--resource-class "$resource_class")
      [[ -n "$command" ]] && cmd+=(--command "$command")
      cmd+=("$description")
      "${cmd[@]}"
      ;;
    4)
      "$SCRIPT_DIR/run_worker.sh" --once
      ;;
    5)
      "$SCRIPT_DIR/run_worker.sh" --daemon
      ;;
    6)
      read -r -p "Job-ID: " job_id
      "$SCRIPT_DIR/logs.sh" "$job_id"
      ;;
    7)
      read -r -p "Job-ID: " job_id
      "$SCRIPT_DIR/cancel_job.sh" "$job_id"
      ;;
    8)
      cat "$SCRIPT_DIR/queue_config.example.env"
      ;;
    9)
      exit 0
      ;;
    *)
      echo "Ungueltige Auswahl."
      ;;
  esac
done
