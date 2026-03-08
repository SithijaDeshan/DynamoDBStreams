# DynamoDB Streams — Course Audit Logger

A serverless AWS CDK project that manages a Courses API and uses DynamoDB Streams to audit every create, update, and delete operation in real time.

---

## Architecture

```
API Gateway → courses-lambda → DynamoDB (Courses Table)
                                        │
                                  DynamoDB Stream
                                        ↓
                               ddbstreams-lambda
                               (logs audit trail to CloudWatch)
```

---

## Prerequisites

### 1. Node.js
Install Node.js **v20.x** or later.
- Download: https://nodejs.org
- Verify: `node -v`

### 2. AWS CLI
Install and configure the AWS CLI v2.
- Download: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
- Verify: `aws --version`

Configure a named profile:
```bash
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Output format: `json`

### 3. AWS CDK CLI
```bash
npm install -g aws-cdk
cdk --version
```

### 4. CDK Bootstrap (one-time per account/region)
Bootstrap your AWS account to allow CDK deployments:
```bash
cdk bootstrap aws://<your_account_id>/us-east-1 --profile <your_profile_name>
```

---

## Project Setup

### 1. Clone the repository

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment values

Open `cdk.json` and update the `DEV` block with your AWS account ID:
```json
"DEV": {
  "CDK_ACCOUNT": "<your_aws_account_id>",
  "CDK_REGION": "us-east-1",
  "LOG_LEVEL": "INFO"
}
```

---

## Deploy

```bash
cdk deploy -c env=DEV --profile <your_profile_name> -c namespace=<your_namespace>
```

Example:
```bash
cdk deploy -c env=DEV --profile myprofile -c namespace=testStack
```

This creates a stack named `DDBStreams-DEV-testStack`.

After deployment, copy the outputs from the terminal:
```
DDBStreams-DEV-testStack.DDBStreamsApiEndpoint = https://xxxx.execute-api.us-east-1.amazonaws.com/prod/
DDBStreams-DEV-testStack.ApiKeyId              = abc123def456
```

To retrieve the actual API key value:
```bash
aws apigateway get-api-key --api-key <ApiKeyId> --include-value --query "value" --output text --profile <your_profile_name>
```

---

## API Usage

All requests require the header:
```
x-api-key: <your_api_key_value>
```

### Create a Course — `POST /courses/add`
```bash
curl -X POST https://<api-url>/courses/add \
  -H "x-api-key: <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"courseId": "c001", "date": "2026-03-08", "title": "Intro to AWS", "description": "Learn AWS basics"}'
```

### Edit a Course — `PUT /courses/edit`
```bash
curl -X PUT https://<api-url>/courses/edit \
  -H "x-api-key: <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"courseId": "c001", "date": "2026-03-08", "title": "Advanced AWS", "description": "Deep dive into AWS"}'
```

### Delete a Course — `DELETE /courses/delete`
```bash
curl -X DELETE https://<api-url>/courses/delete \
  -H "x-api-key: <api-key>" \
  -H "Content-Type: application/json" \
  -d '{"courseId": "c001", "date": "2026-03-08"}'
```

---

## Viewing Stream Audit Logs

Every API call triggers the stream lambda. Logs appear in CloudWatch under:
```
/aws/lambda/ddbstreams-lambda-DEV-<namespace>
```

Each log entry looks like:
```json
{
  "timestamp": "2026-03-08T10:00:00.000Z",
  "level": "INFO",
  "service": "CourseAuditLogger",
  "message": "Course INSERT",
  "eventType": "INSERT",
  "oldImage": null,
  "newImage": {
    "courseId": "c001",
    "date": "2026-03-08",
    "title": "Intro to AWS"
  }
}
```

---

## Destroy

To tear down all AWS resources:
```bash
cdk destroy -c env=DEV --profile <your_profile_name> -c namespace=<your_namespace>
```

---

## Project Structure

```
├── infrastructure/
│   ├── index.ts          # CDK app entry point
│   ├── stack.ts          # Main stack definition
│   ├── dynamoDB.ts       # DynamoDB table construct
│   ├── lambda.ts         # Lambda construct
│   └── apiGateway.ts     # API Gateway construct
├── src/
│   ├── functions/
│   │   ├── Stream/
│   │   │   └── handler.ts          # DynamoDB stream audit logger
│   │   └── courses/
│   │       ├── handler.ts          # Courses API router
│   │       └── services/
│   │           ├── createCourseService.ts
│   │           ├── editCourseService.ts
│   │           └── deleteCourseService.ts
│   └── Logger/
│       └── logger.ts     # Structured JSON logger
├── cdk.json              # CDK config and environment values
└── package.json
```
