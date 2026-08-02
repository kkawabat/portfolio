#!/usr/bin/env bash
# Enable a Cloud Run spend cap — Console only (no gcloud/API yet).
#
# Spend caps pause new Cloud Run usage when gross estimated spend for the month
# exceeds your target. Near real-time for Cloud Run (minutes, not hours).
# Lift the cap manually in Console after investigating.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-kan-kawabata-2026}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-01AE74-051CAD-9AE9F1}"
MONTHLY_CAP_USD="${MONTHLY_CAP_USD:-25}"

CONSOLE_URL="https://console.cloud.google.com/billing/${BILLING_ACCOUNT_ID}/budgets/create?project=${PROJECT_ID}"

cat <<EOF
Cloud Run spend cap — manual Console step
=========================================

Terraform budget alerts email you at 50/90/100% of \$${MONTHLY_CAP_USD}/mo but do
NOT stop traffic. For a hard stop, create a spend cap budget:

  ${CONSOLE_URL}

Steps:
  1. Choose "Spend cap enforcement" (not "Alerts only")
  2. Name: e.g. "Cloud Run spend cap (${PROJECT_ID})"
  3. Scope: Project ${PROJECT_ID}, Service "Cloud Run"
  4. Amount: \$${MONTHLY_CAP_USD}/month (set slightly below your real limit)
  5. Finish

When the cap triggers, new Cloud Run requests are blocked until you lift the cap
in Console. Existing instances and storage keep running (fixed costs still accrue).

Also already in place:
  - portfolio + portfolio-workers: max 2 instances each (cloud_run.tf)
  - min instances: 0 (no idle cost)
EOF

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${CONSOLE_URL}" >/dev/null 2>&1 || true
elif command -v wslview >/dev/null 2>&1; then
  wslview "${CONSOLE_URL}" >/dev/null 2>&1 || true
fi
