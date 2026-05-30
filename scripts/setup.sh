#!/usr/bin/env bash
set -euo pipefail

pnpm install
pnpm build

QUEUE_BASE_DIR="${HOME}/.ultimate-ki/queue-job-manager"
QUEUE_CONFIG_FILE="${QUEUE_BASE_DIR}/queue.env"
QUEUE_EXAMPLE_FILE="scripts/queue/queue_config.example.env"

mkdir -p "${QUEUE_BASE_DIR}"

if [[ -f "${QUEUE_EXAMPLE_FILE}" && ! -f "${QUEUE_CONFIG_FILE}" ]]; then
  cp "${QUEUE_EXAMPLE_FILE}" "${QUEUE_CONFIG_FILE}"
fi

cat <<'EOF'

[ Queue Job Manager ]
- Queue-Status: scripts/queue/status.sh
- Job einreichen: scripts/queue/submit_job.sh
- Worker starten: scripts/queue/run_worker.sh
- Job abbrechen: scripts/queue/cancel_job.sh <job-id>
- Queue-Konfiguration: ~/.ultimate-ki/queue-job-manager/queue.env

EOF
