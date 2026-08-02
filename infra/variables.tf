variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run and Artifact Registry"
  type        = string
  default     = "us-west1"
}

variable "domain" {
  description = "Custom domain (e.g. kankawabata.com)"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository in owner/repo format"
  type        = string
}

variable "billing_account_id" {
  description = "Cloud Billing account ID (for budgets and export console links)"
  type        = string
  default     = "01AE74-051CAD-9AE9F1"
}

variable "monthly_budget_usd" {
  description = "Monthly project spend threshold for billing alert emails"
  type        = number
  default     = 25
}

variable "budget_alert_email" {
  description = "Email address for billing budget alert notifications"
  type        = string
  default     = "kan.kawabata.personal@gmail.com"
}
