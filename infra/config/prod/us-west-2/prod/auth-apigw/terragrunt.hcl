locals {
  # Automatically load environment-level variables
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))

  # Extract out common variables for reuse
  env = local.environment_vars.locals.env
}

# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the
# working directory, into a temporary folder, and execute your Terraform commands in that folder.
terraform {
  source = "../../../../../modules/apigw//."
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

dependency "talent-lambda" {
  config_path = "../talent-lambda"

  # Configure mock outputs for the `validate` command that are returned when there are no outputs available (e.g the
  # module hasn't been applied yet.
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    invoke_arn = "arn:aws:apigateway:us-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:us-west-2:xxxxxxxxxx:function:test/invocations"
  }
}

# These are the variables we have to pass in to use the module specified in the terragrunt configuration above
inputs = {
  ssm_root_paths   = []
  path_part        = "auth"
  http_method      = "ANY"
  integration_type = "AWS_PROXY"
  uri              = dependency.auth-lambda.outputs.invoke_arn
}
