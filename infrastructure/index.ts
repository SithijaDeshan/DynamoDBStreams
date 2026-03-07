import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DDBStreams } from "./stack";

const app = new cdk.App();
const envName: string = app.node.tryGetContext("env");
const namespace: string = app.node.tryGetContext("namespace")
  ? `-${app.node.tryGetContext("namespace")}`
  : "";
const envConfigs: any = app.node.tryGetContext(envName);
const stackName = `DDBStreams-${envName}${namespace}`;
const stack = new DDBStreams(app, stackName, {
  env: { account: envConfigs.CDK_ACCOUNT, region: envConfigs.CDK_REGION },
  envName,
  namespace,
  logLevel: envConfigs.LOG_LEVEL,
});
cdk.Tags.of(stack).add("Environment", envName);
cdk.Tags.of(stack).add("Name", stackName);
