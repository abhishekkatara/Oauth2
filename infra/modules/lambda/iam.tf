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

resource "aws_iam_role" "auth_lambda_exec" {
  name               = "auth-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_service_trust_policy.json
}
