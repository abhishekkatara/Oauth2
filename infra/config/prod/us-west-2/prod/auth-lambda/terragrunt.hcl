locals {
  # Automatically load environment-level variables
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))

  # Extract out common variables for reuse
  env = local.environment_vars.locals.env
}

# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the
# working directory, into a temporary folder, and execute your Terraform commands in that folder.
terraform {
  source = "../../../../../modules/lambda//."
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

# These are the variables we have to pass in to use the module specified in the terragrunt configuration above
inputs = {
  lambda_bucket             = "artifacts"
  lambda_name               = "auth"
  runtime                   = "nodejs14.x"
  handler_name              = "lambda.handler"
  apigw_execution_arn       = "apigw/GW_EXEC_ARN"
  default_security_group_id = "vpc/DEFAULT_NSG_ID"
  security_group_ids        = ["nsg/LAMBDA"]
  subnets                   = "vpc/LAMBDA_SUBNETS_IDS"
  source_path               = "${get_path_to_repo_root()}/../../.."
  ssm_environment_variables = {
    DB_HOST              = "db/DB_HOST"
    DB_NAME              = "db/DB_NAME"
    DB_PORT              = "db/DB_PORT"
    DB_USER              = "db/AUTH_DB_USER"
    DB_PASS              = "db/AUTH_DB_PASS"
    GOOGLE_CLIENT_ID     = "google/GOOGLE_CLIENT_ID"
    GOOGLE_CLIENT_SECRET = "google/GOOGLE_CLIENT_SECRET"
    JWT_SECRET           = "auth/JWT_SECRET"
    SESSION_SECRET       = "auth/SESSION_SECRET"
  }
  environment_variables = {
    LOG_LEVEL = "info"
    BASE_URL  = "https://api.tlynt.com/auth"
    ISSUER    = "https://tlynt.com"
    AUDIENCE  = "https://tlynt.com"
  }
  logs_retention = 14
}
