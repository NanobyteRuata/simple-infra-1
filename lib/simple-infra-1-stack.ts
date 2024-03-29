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

interface SimpleInfra1StackProps extends cdk.StackProps {
  instanceId: string;
  instancePublicIp: string;
}

export class SimpleInfra1Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: SimpleInfra1StackProps) {
    super(scope, id, { ...props, env: config.env });

    const infra1EndpointHandler = new lambda.NodejsFunction(
      this,
      "SimpleInfra1EndPointHandler",
      {
        runtime: Runtime.NODEJS_12_X,
        entry: path.join(
          __dirname,
          "..",
          "api",
          "infra-1-endpoint",
          "index.ts"
        ),
        handler: "infra1Endpoint",
        environment: {
          SIMPLE_INFRA_1_INSTANCE_ID: props.instanceId,
          SIMPLE_INFRA_1_INSTANCE_PUBLIC_IP: props.instancePublicIp,
        },
      }
    );

    const httpApi = new HttpApi(this, "SimpleInfra1HttpApi", {
      apiName: "simple-infra-1-api",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.GET],
      },
      createDefaultStage: true,
    });

    const infra1EndpointHandlerIntegration = new LambdaProxyIntegration({
      handler: infra1EndpointHandler,
    });

    httpApi.addRoutes({
      path: "/",
      methods: [HttpMethod.GET],
      integration: infra1EndpointHandlerIntegration,
    });

    // Outputs

    new cdk.CfnOutput(this, "SimpleInfra1HttpApiExport", {
      value: httpApi.url!,
      exportName: "SimpleInfra1HttpApiEndpoint",
    });
  }
}
