# --- apigw/data.tf ---
data "aws_api_gateway_rest_api" "rest_api" {
  name = "${var.prefix}-${var.env}"
}

data "aws_ssm_parameter" "root_path" {
  for_each = var.ssm_root_paths

  name            = "/${var.prefix}/${var.env}/${each.value}"
  with_decryption = true
}

locals {
  api_resources = length(var.ssm_root_paths) > 0 ? { for k, v in data.aws_ssm_parameter.root_path : k => v.value } : { "/" = data.aws_api_gateway_rest_api.rest_api.root_resource_id }
}
