# --- lambda/outputs.tf ---
output "function_name" {
  description = "Name of the Lambda function."
  value       = aws_lambda_function.lambda.function_name
}

output "invoke_arn" {
  description = "Lambda Invoke ARN"
  value       = aws_lambda_function.lambda.invoke_arn
}

output "arn" {
  description = "Lambda ARN"
  value       = aws_lambda_function.lambda.arn
}
