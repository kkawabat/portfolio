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
