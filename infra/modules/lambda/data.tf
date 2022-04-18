# --- lambda/data.tf ---
data "aws_ssm_parameter" "ssm_environment_variables" {
  for_each = { for k, v in var.ssm_environment_variables : k => v }
  name     = "/${var.prefix}/${var.env}/${each.value}"
}

locals {
  ssm_environment_variables = { for k, v in data.aws_ssm_parameter.ssm_environment_variables : k => v.value }
  environment_variables     = { for k, v in var.environment_variables : k => v }
  env_vars                  = merge(local.environment_variables, local.ssm_environment_variables)
}

data "aws_ssm_parameter" "apigw_exec_arn" {
  name = "/${var.prefix}/${var.env}/${var.apigw_execution_arn}"
}

data "aws_ssm_parameter" "default_sg_id" {
  name = "/${var.prefix}/${var.env}/${var.default_security_group_id}"
}

data "aws_ssm_parameter" "lambda_subnets" {
  name = "/${var.prefix}/${var.env}/${var.subnets}"
}

data "aws_ssm_parameter" "sg_id" {
  count           = length(var.security_group_ids)
  name            = "/${var.prefix}/${var.env}/${var.security_group_ids[count.index]}"
  with_decryption = true
}
