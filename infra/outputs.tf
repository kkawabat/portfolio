output "workers_url" {
  description = "Portfolio workers Cloud Run service URL"
  value       = google_cloud_run_v2_service.portfolio_workers.uri
}

output "cloud_run_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.portfolio.uri
}

output "artifact_registry" {
  description = "Artifact Registry Docker repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/portfolio"
}

output "wif_provider" {
  description = "Workload Identity Provider — set as GitHub secret WIF_PROVIDER"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "wif_service_account" {
  description = "GitHub Actions service account email — set as GitHub secret WIF_SERVICE_ACCOUNT"
  value       = google_service_account.github_actions.email
}

output "domain_mapping_records" {
  description = "DNS records to add in Namecheap"
  value       = google_cloud_run_domain_mapping.portfolio.status
}

output "billing_export_dataset" {
  description = "BigQuery dataset for Cloud Billing export (enable export in Console)"
  value       = "${var.project_id}.${google_bigquery_dataset.billing_export.dataset_id}"
}

output "billing_export_console_url" {
  description = "One-time Console step to link billing account export to the dataset"
  value       = "https://console.cloud.google.com/billing/${var.billing_account_id}/export/bigquery?project=${var.project_id}"
}

output "spend_cap_console_url" {
  description = "Console step to create a Cloud Run spend cap (hard stop on runaway traffic)"
  value       = "https://console.cloud.google.com/billing/${var.billing_account_id}/budgets/create?project=${var.project_id}"
}
