terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  # State holds live infrastructure and secret versions, so it does not belong on
  # a single laptop disk. The bucket is versioned and shared with gamework/infra
  # under a separate prefix; it is bootstrap infrastructure, created out of band
  # rather than managed by the state it stores (see gamework/CONTEXT.md).
  backend "gcs" {
    bucket = "kan-kawabata-2026-tfstate"
    prefix = "portfolio"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "google_project" "project" {}

locals {
  project_number = data.google_project.project.number
}

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudscheduler.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}
