import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Environment, StackProps } from "aws-cdk-lib";
import { DDBStreamsLambda } from "./lambda";

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
    new DDBStreamsLambda(this, "ddbstreams-lambda", {
      functionName: `ddbstreams-lambda-${environment}`,
      path: `../src/functions/handler.ts`,
    });
  }
}
