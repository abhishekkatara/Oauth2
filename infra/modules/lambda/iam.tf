# --- lambda/iam.tf ---
data "aws_iam_policy_document" "lambda_service_trust_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.auth_lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:GetObject"
    ]

    resources = [
      "arn:aws:s3:::${var.iam_s3_bucket}",
      "arn:aws:s3:::${var.iam_s3_bucket}/*",
    ]
  }

  statement {
    effect = "Allow"

    actions = [
      "ses:SendEmail"
    ]

    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "sns:Publish"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "lambda_permissions" {
  name   = "${var.prefix}-${var.env}-${var.lambda_name}"
  policy = data.aws_iam_policy_document.lambda_permissions.json
}

resource "aws_iam_role_policy_attachment" "lambda_permissions" {
  role       = aws_iam_role.auth_lambda_exec.name
  policy_arn = aws_iam_policy.lambda_permissions.arn
}

resource "aws_iam_role" "auth_lambda_exec" {
  name               = "auth-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_service_trust_policy.json
}
