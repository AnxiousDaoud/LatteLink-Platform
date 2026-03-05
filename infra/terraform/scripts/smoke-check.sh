#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-dev}"
API_URL_VAR="API_BASE_URL_${ENVIRONMENT^^}"
API_URL="${!API_URL_VAR:-}"

if [[ -z "$API_URL" ]]; then
  echo "[smoke-check] missing $API_URL_VAR"
  exit 1
fi

echo "[smoke-check] checking ${API_URL%/}/health"
curl --fail --silent --show-error "${API_URL%/}/health" > /dev/null

echo "[smoke-check] ok"
