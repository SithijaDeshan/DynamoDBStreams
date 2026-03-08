import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";

interface ApiGatewayProps {
  apiName: string;
}

export class ApiGateway extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly apiKey: apigateway.ApiKey;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    this.api = new apigateway.RestApi(this, id, {
      restApiName: props.apiName,
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    this.apiKey = new apigateway.ApiKey(this, `${id}-ApiKey`, {
      apiKeyName: `${props.apiName}-key`,
    });

    const usagePlan = new apigateway.UsagePlan(this, `${id}-UsagePlan`, {
      name: `${props.apiName}-usage-plan`,
      apiStages: [{ api: this.api, stage: this.api.deploymentStage }],
    });

    usagePlan.addApiKey(this.apiKey);
  }

  /**
   * Registers a route on the API.
   * Automatically creates intermediate resources if they don't exist.
   * e.g. addRoute("/courses/add", "POST", myLambda)
   */
  public addRoute(path: string, method: string, lambda: IFunction): void {
    const segments = path.replace(/^\//, "").split("/");
    let resource: apigateway.IResource = this.api.root;

    for (const segment of segments) {
      resource = resource.getResource(segment) ?? resource.addResource(segment);
    }

    resource.addMethod(method, new apigateway.LambdaIntegration(lambda), {
      apiKeyRequired: true,
    });
  }
}
