import { Duration } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { IFunction, ILayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import * as logs from "aws-cdk-lib/aws-logs";

interface DDBStreamsLambdaProps {
  functionName: string;
  path: string;
  layers?: ILayerVersion[];
  environment?: {
    [key: string]: any;
  };
  bundling?: {
    [key: string]: any;
  };
}

export class DDBStreamsLambda extends Construct {
  public readonly lambda: IFunction;

  constructor(scope: Construct, id: string, props: DDBStreamsLambdaProps) {
    super(scope, id);
    this.lambda = this.createLambda(id, props);
  }

  private createLambda(id: string, props: DDBStreamsLambdaProps): IFunction {
    const lambda = new NodejsFunction(this, id, {
      functionName: props.functionName,
      entry: join(__dirname, props.path),
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      environment: props.environment,
      layers: props.layers ? props.layers : [],
      timeout: Duration.minutes(15),
      logGroup: new logs.LogGroup(this, "LogGroup", {
        logGroupName: props.functionName,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      bundling: {
        ...props.bundling,
        externalModules: [
          "cache-manager",
          "class-validator",
          "class-transformer",
        ],
      },
    });
    return lambda as IFunction;
  }
}
