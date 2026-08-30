resource "google_cloud_run_v2_service" "portfolio" {
  name                = "portfolio"
  location            = var.region
  deletion_protection = false

  # Service-level scaling — a different block from the template.scaling below,
  # despite the name. Cloud Run reports it populated whether or not it is
  # declared, and the provider treats its fields as optional-not-computed, so
  # omitting it leaves a phantom removal pending on every plan.
  scaling {
    min_instance_count    = 0
    manual_instance_count = 0
  }

  template {
    service_account = google_service_account.cloud_run.email

    containers {
      # Placeholder for initial creation — CI/CD will deploy the real image
      image = "us-docker.pkg.dev/cloudrun/container/hello:latest"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
        # Request-based billing. The v2 API defaults this to false (protobuf),
        # which is instance-based: keepalive then bills 2 vCPU 24/7.
        cpu_idle          = true
        startup_cpu_boost = true
      }

      startup_probe {
        http_get {
          path = "/"
        }
        initial_delay_seconds = 0
        period_seconds        = 10
        failure_threshold     = 30
        timeout_seconds       = 5
      }

      env {
        name  = "DJANGO_DEBUG"
        value = "False"
      }

      env {
        name  = "ALLOWED_HOSTS"
        value = "${var.domain},www.${var.domain},127.0.0.1,localhost"
      }

      env {
        name  = "CSRF_TRUSTED_ORIGINS"
        value = "https://${var.domain},https://www.${var.domain}"
      }

      env {
        name  = "AWS_DEFAULT_REGION"
        value = "us-east-1"
      }

      env {
        name  = "WORKER_SERVICE_URL"
        value = google_cloud_run_v2_service.portfolio_workers.uri
      }

      env {
        name = "DJANGO_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.django_secret_key.secret_id
            version = "latest"
          }
        }
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

      env {
        name = "AWS_ACCESS_KEY_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.aws_access_key_id.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "AWS_SECRET_ACCESS_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.aws_secret_access_key.secret_id
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
    # CI owns these. The deploy action stamps the image, a commit-sha label and
    # its own client metadata on every deploy, so Terraform cannot win: reverting
    # them just leaves a phantom diff on every plan until the next deploy puts
    # them back. commit-sha is unfixable by definition — it changes per commit.
    ignore_changes = [
      template[0].containers[0].image,
      template[0].labels,
      client,
      client_version,
    ]
  }

  depends_on = [google_project_service.apis, google_cloud_run_v2_service.portfolio_workers]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.portfolio.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_domain_mapping" "portfolio" {
  name     = var.domain
  location = var.region

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.portfolio.name
  }

  depends_on = [google_cloud_run_v2_service.portfolio]
}

resource "google_cloud_run_domain_mapping" "www" {
  name     = "www.${var.domain}"
  location = var.region

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.portfolio.name
  }

  depends_on = [google_cloud_run_v2_service.portfolio]
}
