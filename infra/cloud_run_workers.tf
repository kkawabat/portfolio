resource "google_cloud_run_v2_service" "portfolio_workers" {
  name                = "portfolio-workers"
  location            = var.region
  deletion_protection = false

  # See cloud_run.tf: service-level scaling, distinct from template.scaling.
  scaling {
    min_instance_count    = 0
    manual_instance_count = 0
  }

  template {
    service_account                  = google_service_account.cloud_run.email
    max_instance_request_concurrency = 1

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello:latest"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "4Gi"
        }
        # See cloud_run.tf: v2 API defaults this to instance-based billing.
        cpu_idle          = true
        startup_cpu_boost = true
      }

      startup_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 0
        period_seconds        = 10
        failure_threshold     = 30
        timeout_seconds       = 5
      }

      env {
        name = "YOUTUBE_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.youtube_api_key.secret_id
            version = "latest"
          }
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    timeout = "300s"
  }

  lifecycle {
    # See cloud_run.tf: CI stamps these on every deploy.
    ignore_changes = [
      template[0].containers[0].image,
      template[0].labels,
      client,
      client_version,
    ]
  }

  depends_on = [google_project_service.apis]
}

resource "google_cloud_run_v2_service_iam_member" "portfolio_invokes_workers" {
  name     = google_cloud_run_v2_service.portfolio_workers.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.cloud_run.email}"
}
