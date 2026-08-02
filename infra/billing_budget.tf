# Alert-only billing budget for the portfolio project.
#
# google_billing_budget fails under ADC without a quota project in some setups.
# Budget + email channel are created via scripts/setup-billing-budget.sh instead.
# For a hard cap on traffic-driven Cloud Run costs, see scripts/setup-spend-cap.sh.

resource "google_project_service" "billing_budget_apis" {
  for_each = toset([
    "billingbudgets.googleapis.com",
    "monitoring.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

resource "google_monitoring_notification_channel" "billing_alerts" {
  display_name = "Portfolio billing alerts"
  type         = "email"
  labels = {
    email_address = var.budget_alert_email
  }

  depends_on = [google_project_service.billing_budget_apis]
}
