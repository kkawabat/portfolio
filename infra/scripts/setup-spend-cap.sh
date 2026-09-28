#!/usr/bin/env bash
# Enable a Cloud Run spend cap — Console only (no gcloud/API yet).
#
# Spend caps pause *new* Cloud Run usage when gross estimated spend for the
# month exceeds the target (minutes, not hours). They do not delete resources.
# Lift the cap in Console after investigating.
#
# Do not create a $25 cap before 2026-09-01: August Cloud Run spend is already
# well above that, so the site would pause immediately. Override with FORCE=1.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-kan-kawabata-2026}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-01AE74-051CAD-9AE9F1}"
MONTHLY_CAP_USD="${MONTHLY_CAP_USD:-25}"
EARLIEST_DATE="${EARLIEST_DATE:-20260901}"
FORCE="${FORCE:-0}"

CONSOLE_URL="https://console.cloud.google.com/billing/${BILLING_ACCOUNT_ID}/budgets/create?project=${PROJECT_ID}"
TODAY="$(date -u +%Y%m%d)"

if [[ "${FORCE}" != "1" && "${MONTHLY_CAP_USD}" == "25" && "${TODAY}" < "${EARLIEST_DATE}" ]]; then
  cat <<EOF >&2
Refusing to open the Console.

A \$${MONTHLY_CAP_USD} Cloud Run spend cap created before 2026-09-01 would pause
kankawabata.com for the rest of August (this month's Cloud Run spend is already
above \$25). Create it on or after September 1, when the monthly counter resets.

  ./infra/scripts/setup-spend-cap.sh

To bypass (you will take the site down until you lift the cap):

  FORCE=1 ./infra/scripts/setup-spend-cap.sh
EOF
  exit 1
fi

cat <<EOF
Cloud Run spend cap — manual Console step
=========================================

This is the kill switch. Email alerts already fire at 50/90/100% of \$25; they
do not stop spend. A spend cap does: new Cloud Run requests are blocked until
you lift it. TURN (the e2-micro VM), Artifact Registry, and logging keep running.

  ${CONSOLE_URL}

Steps:
  1. Choose "Spend cap enforcement" (not "Alerts only")
  2. Name: Cloud Run spend cap (${PROJECT_ID})
  3. Scope: Project ${PROJECT_ID}, Service "Cloud Run" (one service only)
  4. Amount: \$${MONTHLY_CAP_USD}/month
  5. Finish — alerts go to billing admins / project owners at 50/80/100%

When it trips: site returns errors until you Billing → Budgets → edit this
budget → Lift spend cap. Allow up to an hour for traffic to resume.

What it does not stop:
  - Compute Engine (TURN VM is Always Free; egress would still bill)
  - Artifact Registry storage
  - In-flight Cloud Run requests (they finish)
EOF

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${CONSOLE_URL}" >/dev/null 2>&1 || true
elif command -v wslview >/dev/null 2>&1; then
  wslview "${CONSOLE_URL}" >/dev/null 2>&1 || true
fi
