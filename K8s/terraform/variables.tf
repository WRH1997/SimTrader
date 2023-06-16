variable "credentials" {
  type = string
  description = "Cred for terraform SA"
}

variable "project_id" {
  type = string
  description = "GCP Project"
}

variable "region" {
  type = string
  description = "GCP Region"
}

variable "service_account" {
  type = string
  description = "GKE SA"
}