provider "aws" {
  region = "us-west-2"                                                 # Set the AWS region for all resources
}

# DynamoDB Table for Storing User Accounts
resource "aws_dynamodb_table" "user_auth_table" {
  name         = "UsersAuthTable"                                               # Table name
  billing_mode = "PAY_PER_REQUEST"                                     # Use on-demand pricing (no provisioning)
  hash_key     = "email"                                               # Partition key is the user's email

  attribute {
    name = "email"                                                     # Define the email attribute
    type = "S"                                                         # 'S' = String type
  }
}

# IAM Role for Lambda Execution
resource "aws_iam_role" "user_lambda_role" {
  name = "user-auth-lambda-role"                                            # Name of the IAM role

  assume_role_policy = jsonencode({                                    # Trust policy: allow Lambda to assume this role
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"                               # Grant permission to Lambda service
      }
      Action = "sts:AssumeRole"
    }]
  })
}

# Attach DynamoDB Full Access to Lambda Role
resource "aws_iam_role_policy_attachment" "dynamodb_policy" {
  role       = aws_iam_role.lambda_exec_role.name                      # Attach policy to the Lambda exec role
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"      # AWS managed policy for full DynamoDB access
}

# Lambda Function Definition
resource "aws_lambda_function" "user_signup_lambda" {
  function_name = "user_signup_func"                                             # Logical name of the Lambda function
  role          = aws_iam_role.lambda_exec_role.arn                    # IAM role to assume for execution
  handler       = "signup.handler"                                     # Entry point: file (signup.js) and exported handler
  runtime       = "nodejs20.x"                                         # Runtime environment

  filename         = "${path.module}/lambda/signup.zip"                # Path to zipped Lambda package
  source_code_hash = filebase64sha256("${path.module}/lambda/signup.zip")  # Hash for tracking code changes
}

# Create an API Gateway HTTP API
resource "aws_apigatewayv2_api" "http_api" {
  name          = "user-api"                                           # Name of the API Gateway
  protocol_type = "HTTP"                                               # Use modern HTTP API instead of REST
}

# Link Lambda Function to API Gateway via Integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id            # API Gateway ID
  integration_type       = "AWS_PROXY"                                 # Use Lambda proxy integration
  integration_uri        = aws_lambda_function.signup.invoke_arn       # URI to call the Lambda function
  integration_method     = "POST"                                      # HTTP method
  payload_format_version = "2.0"                                       # Payload format for HTTP APIs
}

# Route /signup to the Lambda Integration
resource "aws_apigatewayv2_route" "signup_route" {
  api_id    = aws_apigatewayv2_api.http_api.id                         # Link to API Gateway
  route_key = "POST /signup"                                           # Match incoming requests to POST /signup
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}" # Integration target
}

# Auto-deploy API to the $default stage
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id                       # API ID
  name        = "$default"                                             # Stage name (auto-deployed)
  auto_deploy = true                                                   # Automatically deploy updates
}

# Allow API Gateway to Invoke Lambda
resource "aws_lambda_permission" "api_invoke" {
  statement_id  = "AllowExecutionFromAPIGateway"                       # Unique identifier for this permission
  action        = "lambda:InvokeFunction"                              # Permission to invoke Lambda
  function_name = aws_lambda_function.signup.function_name             # Lambda function to invoke
  principal     = "apigateway.amazonaws.com"                           # API Gateway service principal
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*" # Restrict to this API Gateway only
}