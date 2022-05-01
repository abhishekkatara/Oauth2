# --- lambda/variables.tf ---
variable "prefix" {
  description = "A prefix used for all resources"
  type        = string
}

variable "env" {
  description = "The environment to deploy to"
  type        = string
}

variable "region" {
  description = "The region to deploy to"
  type        = string
}

variable "lambda_name" {
  description = "Lambda function name"
  type        = string
}

variable "source_path" {
  description = "Lambda function source path"
  type        = string
}

variable "lambda_bucket" {
  description = "S3 bucket on which lambda code reside"
  type        = string
}

variable "runtime" {
  description = "Lambda function runtime environment"
  type        = string
}

variable "handler_name" {
  description = "Lambda function handler name"
  type        = string
}

variable "apigw_execution_arn" {
  description = "API Gateway execution arn"
  type        = string
  default     = "apigw/GW_EXEC_ARN"
}

variable "lambda_memory" {
  description = "Required Memory for Lambda function"
  default     = 128
}

variable "security_group_ids" {
  description = "List of VPC Security Group ids"
  type        = list(string)
  default     = []
}

variable "default_security_group_id" {
  description = "The ID of the security group created by default on VPC creation"
  type        = string
  default     = "vpc/DEFAULT_NSG_ID"
}

variable "subnets" {
  description = "List of VPC subnets"
  type        = string
  default     = "vpc/LAMBDA_SUBNETS_IDS"
}

variable "environment_variables" {
  description = "A map that defines environment variables for the Lambda Function."
  type        = map(string)
  default     = {}
}

variable "ssm_environment_variables" {
  description = "map of strings containing sensitive SSM parameters; to be passed in as lambda environment variables"
  type        = map(string)
}

variable "logs_retention" {
  description = "Specifies the number of days you want to retain log events in the specified log group"
  type        = number
  default     = null
}

variable "iam_s3_bucket" {
  description = "The bucket the lambda needs to read from and write to"
  type        = string
}