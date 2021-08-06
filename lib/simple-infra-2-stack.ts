import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda-nodejs";

import * as path from "path";
import { Runtime } from "@aws-cdk/aws-lambda";
import { CorsHttpMethod, HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { PolicyStatement } from "@aws-cdk/aws-iam";

require("dotenv").config();

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_ACCOUNT_REGION,
  },
};

export class SimpleInfra2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { ...props, env: config.env });

    const infra2EndpointHandler = new lambda.NodejsFunction(
      this,
      "SimpleInfra2EndPointHandler",
      {
        runtime: Runtime.NODEJS_12_X,
        entry: path.join(
          __dirname,
          "..",
          "api",
          "infra-2-endpoint",
          "index.ts"
        ),
        handler: "infra2Endpoint",
      }
    );

    const ec2Permissions = new PolicyStatement();
    ec2Permissions.addAllResources();
    ec2Permissions.addActions("ec2:describeInstances");

    infra2EndpointHandler.addToRolePolicy(ec2Permissions);

    const httpApi = new HttpApi(this, "SimpleInfra2HttpApi", {
      apiName: "simple-infra-2-api",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.GET],
      },
      createDefaultStage: true,
    });

    const infra2EndpointHandlerIntegration = new LambdaProxyIntegration({
      handler: infra2EndpointHandler,
    });

    httpApi.addRoutes({
      path: "/",
      methods: [HttpMethod.GET],
      integration: infra2EndpointHandlerIntegration,
    });

    // Outputs

    new cdk.CfnOutput(this, "SimpleInfra2HttpApiExport", {
      value: httpApi.url!,
      exportName: "SimpleInfra2HttpApiEndpoint",
    });
  }
}
