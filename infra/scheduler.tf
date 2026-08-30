# Keepalive ping so the main site rarely serves a cold start. This only stays
# cheap if Cloud Run is request-based (`cpu_idle = true` on the service): a
# warm-but-idle instance then costs nothing, and we pay ~1s of request time
# per ping. Instance-based billing (the v2 API default) bills 2 vCPU 24/7.
resource "google_cloud_scheduler_job" "portfolio_keepalive" {
  name             = "portfolio-keepalive"
  description      = "Ping the portfolio site every 10 minutes to keep a Cloud Run instance warm"
  schedule         = "*/10 * * * *"
  time_zone        = "Etc/UTC"
  region           = var.region
  attempt_deadline = "60s"

  http_target {
    http_method = "GET"
    # Ping via the custom domain — the *.run.app host is not in ALLOWED_HOSTS.
    uri = "https://${var.domain}/"
  }

  depends_on = [google_project_service.apis, google_cloud_run_domain_mapping.portfolio]
}
