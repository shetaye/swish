resource "google_compute_network" "default" {
  name                    = var.vpc_name
  auto_create_subnetworks = true
}
