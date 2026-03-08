import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Environment, StackProps } from "aws-cdk-lib";
import { DDBStreamsLambda } from "./lambda";
import { DynamoDBTable } from "./dynamoDB";
import { ApiGateway } from "./apiGateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

interface DDBStreamsStackProps extends StackProps {
  envName: string;
  namespace: string;
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
}

export class DDBStreams extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DDBStreamsStackProps) {
    super(scope, id, props);
    const environment = `${props.envName}${props.namespace}`;
    const env: Environment = props.env as Environment;

    // DynamoDB table
    const coursesTable = new DynamoDBTable(this, "CoursesTable", {
      tableName: "Courses",
      partitionKey: {
        name: "courseId",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "date", type: cdk.aws_dynamodb.AttributeType.STRING },
      stream: cdk.aws_dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // Stream Lambda
    const streamsLambda = new DDBStreamsLambda(this, "ddbstreams-lambda", {
      functionName: `ddbstreams-lambda-${environment}`,
      path: `../src/functions/Stream/handler.ts`,
    });

    // Grant stream read access
    coursesTable.table.grantStreamRead(streamsLambda.lambda);

    // Wire stream to lambda
    new lambda.EventSourceMapping(this, "CoursesStreamMapping", {
      target: streamsLambda.lambda,
      eventSourceArn: coursesTable.table.tableStreamArn!,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 5,
    });

    // Courses Lambda
    const coursesLambda = new DDBStreamsLambda(this, "courses-lambda", {
      functionName: `courses-lambda-${environment}`,
      path: `../src/functions/courses/handler.ts`,
      environment: {
        LOG_LEVEL: props.logLevel,
      },
    });

    // Grant Lambda read/write access to the table
    coursesTable.table.grantReadWriteData(coursesLambda.lambda);

    // API Gateway
    const api = new ApiGateway(this, "DDBStreamsApi", {
      apiName: `ddbstreams-api-${environment}`,
    });

    api.addRoute("/courses/add", "POST", coursesLambda.lambda);
    api.addRoute("/courses/edit", "PUT", coursesLambda.lambda);
    api.addRoute("/courses/delete", "DELETE", coursesLambda.lambda);

    //outputs
    new cdk.CfnOutput(this, "ApiKeyId", {
      value: api.apiKey.keyId,
      description: "API Key",
    });
  }
}
