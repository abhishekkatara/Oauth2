# Set account-wide variables. These are automatically pulled in to configure the remote state bucket in the root
# terragrunt.hcl configuration.
locals {
  account_name = "prod"
  account_id   = "357402033491"
  profile      = "tlynt-prod"
}
