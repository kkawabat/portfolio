#!/usr/bin/env bash
# Finish Cloud Billing → BigQuery export after `terraform apply`.
#
# Google has no gcloud/API for this step (Console only). Feature request:
# https://issuetracker.google.com/issues/504194143

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-kan-kawabata-2026}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:-01AE74-051CAD-9AE9F1}"
DATASET_ID="${DATASET_ID:-billing_export}"
BILLING_TABLE_SUFFIX="${BILLING_ACCOUNT_ID//-/_}"

CONSOLE_URL="https://console.cloud.google.com/billing/${BILLING_ACCOUNT_ID}/export/bigquery?project=${PROJECT_ID}"

cat <<EOF
Cloud Billing export — manual Console step
==========================================

Setup created project ${PROJECT_ID}, dataset ${DATASET_ID} (US multi-region).

There is no gcloud command to enable billing export. Open:

  ${CONSOLE_URL}

For each export you want, click "Edit settings" (or "Enable … export") and choose:
  Project:  ${PROJECT_ID}
  Dataset:  ${DATASET_ID}

Recommended for a personal portfolio:
  [x] Standard usage cost   — daily SKU-level costs (enough for monthly totals)
  [ ] Detailed usage cost   — per-resource rows (heavier; skip unless you need it)
  [ ] Pricing export        — SKU price catalog (optional)

Click Save for each enabled export. Google will grant its service accounts on
the dataset automatically.

Data latency:
  - First rows: a few hours after enabling
  - Retroactive backfill (US dataset): current + previous month, up to ~5 days

After data appears, query August spend for this project:

  bq query --use_legacy_sql=false "
  SELECT
    ROUND(SUM(cost), 4) AS total_usd,
    currency
  FROM \`${PROJECT_ID}.${DATASET_ID}.gcp_billing_export_v1_${BILLING_TABLE_SUFFIX}\`
  WHERE project.id = '${PROJECT_ID}'
    AND usage_start_time >= '2026-08-01'
    AND usage_start_time < '2026-09-01'
  GROUP BY currency
  "

By service:

  bq query --use_legacy_sql=false "
  SELECT
    service.description AS service,
    ROUND(SUM(cost), 4) AS usd
  FROM \`${PROJECT_ID}.${DATASET_ID}.gcp_billing_export_v1_${BILLING_TABLE_SUFFIX}\`
  WHERE project.id = '${PROJECT_ID}'
    AND usage_start_time >= TIMESTAMP(DATE_TRUNC(CURRENT_DATE(), MONTH))
  GROUP BY 1
  ORDER BY 2 DESC
  "
EOF

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${CONSOLE_URL}" >/dev/null 2>&1 || true
elif command -v wslview >/dev/null 2>&1; then
  wslview "${CONSOLE_URL}" >/dev/null 2>&1 || true
fi
