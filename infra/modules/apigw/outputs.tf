# --- apigw/outputs.tf ---
output "ids" {
  description = "The resource's identifier"
  value       = [for k, v in aws_api_gateway_resource.resource : v.id]
}

output "paths" {
  description = "The complete path for this API resource, including all parent paths"
  value       = [for k, v in aws_api_gateway_resource.resource : v.path]
}
