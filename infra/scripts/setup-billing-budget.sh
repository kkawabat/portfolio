#!/usr/bin/env bash
# Create or update the alert-only billing budget (gcloud — Terraform is flaky on ADC).
#
# Alerts at 50/90/100% of monthly_budget_usd for kan-kawabata-2026. Does NOT stop
# spend — use setup-spend-cap.sh for a Cloud Run hard cap.

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-kan-kawabata-2026}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-01AE74-051CAD-9AE9F1}"
MONTHLY_BUDGET_USD="${MONTHLY_BUDGET_USD:-25}"
BUDGET_ALERT_EMAIL="${BUDGET_ALERT_EMAIL:-kan.kawabata.personal@gmail.com}"
DISPLAY_NAME="Portfolio (${PROJECT_ID}) monthly alerts"

CHANNEL_ID="$(gcloud beta monitoring channels list \
  --project="${PROJECT_ID}" \
  --filter="displayName=\"Portfolio billing alerts\"" \
  --format='value(name)' \
  | head -1)"

if [[ -z "${CHANNEL_ID}" ]]; then
  echo "No notification channel found — run 'terraform apply' in infra/ first." >&2
  exit 1
fi

EXISTING="$(gcloud billing budgets list \
  --billing-account="${BILLING_ACCOUNT_ID}" \
  --filter="displayName=\"${DISPLAY_NAME}\"" \
  --format='value(name)' \
  | head -1)"

ARGS=(
  --billing-account="${BILLING_ACCOUNT_ID}"
  --display-name="${DISPLAY_NAME}"
  --budget-amount="${MONTHLY_BUDGET_USD}USD"
  --filter-projects="projects/${PROJECT_ID}"
  --threshold-rule=percent=0.5,basis=current-spend
  --threshold-rule=percent=0.9,basis=current-spend
  --threshold-rule=percent=1.0,basis=current-spend
  --notifications-rule-monitoring-notification-channels="${CHANNEL_ID}"
)

if [[ -n "${EXISTING}" ]]; then
  echo "Updating existing budget ${EXISTING}"
  gcloud billing budgets update "${EXISTING}" \
    --billing-account="${BILLING_ACCOUNT_ID}" \
    --display-name="${DISPLAY_NAME}" \
    --budget-amount="${MONTHLY_BUDGET_USD}USD" \
    --filter-projects="projects/${PROJECT_ID}" \
    --clear-threshold-rules \
    --add-threshold-rule=percent=0.5,basis=current-spend \
    --add-threshold-rule=percent=0.9,basis=current-spend \
    --add-threshold-rule=percent=1.0,basis=current-spend \
    --notifications-rule-monitoring-notification-channels="${CHANNEL_ID}"
else
  echo "Creating budget (${DISPLAY_NAME}) — alerts to ${BUDGET_ALERT_EMAIL}"
  gcloud billing budgets create "${ARGS[@]}"
fi

echo "Done. Hard stop for viral traffic: infra/scripts/setup-spend-cap.sh"
