resource "google_artifact_registry_repository" "portfolio" {
  location      = var.region
  repository_id = "portfolio"
  format        = "DOCKER"
  description   = "Docker images for the portfolio app"

  # DELETE selects candidates for cleanup; KEEP exempts versions from it.
  # Without a DELETE policy nothing is ever removed.
  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"
    condition {
      older_than = "2592000s" # 30 days
    }
  }

  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"
    most_recent_versions {
      keep_count = 5
    }
  }

  depends_on = [google_project_service.apis]
}
