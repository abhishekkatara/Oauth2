# --- lambda/main.tf ---
terraform {
  required_version = "~> 1"

  required_providers {
    aws = "~> 4"
  }
}

# ------------------------------------------------------------------------------
# CREATE S3 OBJECT
# ------------------------------------------------------------------------------

resource "aws_s3_object" "s3_talent_lambda" {
  bucket       = "${var.prefix}-${var.env}-${var.lambda_bucket}"
  key          = "lambda/${var.lambda_name}.zip"
  source       = "${var.source_path}/${var.lambda_name}.zip"
  content_type = "application/zip"

  etag = filesha1("${var.source_path}/${var.lambda_name}.zip")
}

# ------------------------------------------------------------------------------
# CREATE LAMBDA FUNCTION
# ------------------------------------------------------------------------------

resource "aws_lambda_function" "lambda" {
  function_name     = var.lambda_name
  memory_size       = var.lambda_memory
  s3_bucket         = aws_s3_object.s3_talent_lambda.bucket
  s3_key            = aws_s3_object.s3_talent_lambda.key
  s3_object_version = aws_s3_object.s3_talent_lambda.version_id
  runtime           = var.runtime
  handler           = var.handler_name
  role              = aws_iam_role.talent_lambda_exec.arn

  vpc_config {
    security_group_ids = length(var.security_group_ids) > 0 ? data.aws_ssm_parameter.sg_id[*].value : split(",", data.aws_ssm_parameter.default_sg_id.value)
    subnet_ids         = split(",", data.aws_ssm_parameter.lambda_subnets.value)
  }

  environment {
    variables = local.env_vars
  }

  tags = {
    Name        = "${var.prefix}-${var.env}-${var.lambda_name}"
    Project     = "${var.prefix}"
    Environment = "${var.env}"
    Region      = "${var.region}"
  }
}

# ------------------------------------------------------------------------------
# ASSIGN PERMISSION TO API GATEWAY 
# ------------------------------------------------------------------------------

resource "aws_lambda_permission" "api" {
  statement_id  = "AllowAPIGWLambdaInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_ssm_parameter.apigw_exec_arn.value}/*/*/*"
}

# ------------------------------------------------------------------------------
# LAMBDA LOG RETENTION
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.lambda_name}"
  retention_in_days = var.logs_retention

  tags = {
    Project     = "${var.prefix}"
    Environment = "${var.env}"
    Region      = "${var.region}"
  }
}
