# Keepalive ping so the main site rarely serves a cold start. With Cloud Run's
# default request-based billing, a warm-but-idle instance costs nothing; this
# only pays for ~1s of request time per ping.
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
