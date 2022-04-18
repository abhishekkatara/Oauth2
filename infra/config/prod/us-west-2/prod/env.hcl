# Set common variables for the environment. This is automatically pulled in in the root terragrunt.hcl configuration to
# feed forward to the child modules.
locals {
  env      = "prod"
  vpc_cidr = "10.0.0.0/16"
}
