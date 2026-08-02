# BigQuery prerequisites for Cloud Billing export.
#
# Enabling the export itself is still Console-only — Google adds
# billing-export-bigquery@system.gserviceaccount.com to the dataset when you
# click Save on the Billing export page. See scripts/enable-billing-export.sh.

locals {
  billing_export_dataset_id = "billing_export"
  # US multi-region backfills the current and previous month on first enable.
  billing_export_location = "US"
}

resource "google_project_service" "billing_export_apis" {
  for_each = toset([
    "bigquery.googleapis.com",
    "bigquerydatatransfer.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

resource "google_bigquery_dataset" "billing_export" {
  dataset_id                 = local.billing_export_dataset_id
  project                    = var.project_id
  location                   = local.billing_export_location
  delete_contents_on_destroy = false

  labels = {
    purpose = "cloud-billing-export"
  }

  depends_on = [google_project_service.billing_export_apis]
}
