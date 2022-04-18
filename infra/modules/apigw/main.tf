# --- apigw/main.tf ---
terraform {
  required_version = "~> 1"

  required_providers {
    aws = "~> 4"
  }
}

# ------------------------------------------------------------------------------
# CREATE RESOURCE
# ------------------------------------------------------------------------------

resource "aws_api_gateway_resource" "resource" {
  for_each = local.api_resources

  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id
  parent_id   = each.value
  path_part   = var.path_part
}

# ------------------------------------------------------------------------------
# CREATE DEPLOYMENT
# ------------------------------------------------------------------------------

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id
  description = "Deployed at ${timestamp()} via talent"
  stage_name  = "live"

  #This will trigger API deployment each time GH workflow run(otherwise each tfstate of different
  #api gateway resources would reset the deployment when their GH workflow run)
  variables = {
    deployed_at = "${timestamp()} via talent"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ------------------------------------------------------------------------------
# CREATE METHOD
# ------------------------------------------------------------------------------

resource "aws_api_gateway_method" "api_method" {
  for_each = local.api_resources

  rest_api_id   = data.aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.resource[each.key].id
  http_method   = var.http_method
  authorization = var.authorization
}

# ------------------------------------------------------------------------------
# CREATE INTEGRATION
# ------------------------------------------------------------------------------

resource "aws_api_gateway_integration" "api_integration" {
  for_each = local.api_resources

  rest_api_id             = data.aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_resource.resource[each.key].id
  http_method             = aws_api_gateway_method.api_method[each.key].http_method
  integration_http_method = var.integration_http_method
  type                    = var.integration_type
  uri                     = var.uri
}


# ------------------------------------------------------------------------------
# CREATE PROXY RESOURCE
# ------------------------------------------------------------------------------

resource "aws_api_gateway_resource" "proxy_resource" {
  for_each = local.api_resources

  rest_api_id = data.aws_api_gateway_rest_api.rest_api.id
  parent_id   = aws_api_gateway_resource.resource[each.key].id
  path_part   = "{proxy+}"
}

# ------------------------------------------------------------------------------
# CREATE PROXY METHOD
# ------------------------------------------------------------------------------

resource "aws_api_gateway_method" "proxy_api_method" {
  for_each = local.api_resources

  rest_api_id   = data.aws_api_gateway_rest_api.rest_api.id
  resource_id   = aws_api_gateway_resource.proxy_resource[each.key].id
  http_method   = "ANY"
  authorization = var.authorization
}

# ------------------------------------------------------------------------------
# CREATE PROXY INTEGRATION
# ------------------------------------------------------------------------------

resource "aws_api_gateway_integration" "proxy_api_integration" {
  for_each = local.api_resources

  rest_api_id             = data.aws_api_gateway_rest_api.rest_api.id
  resource_id             = aws_api_gateway_resource.proxy_resource[each.key].id
  http_method             = aws_api_gateway_method.proxy_api_method[each.key].http_method
  integration_http_method = var.integration_http_method
  type                    = var.integration_type
  uri                     = var.uri
}
