# Set account-wide variables. These are automatically pulled in to configure the remote state bucket in the root
# terragrunt.hcl configuration.
locals {
  account_name = "dev"
  account_id   = "685333503694"
  profile      = "tlynt-dev"
}
