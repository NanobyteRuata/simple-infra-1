import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from "aws-lambda";

const instanceId = process.env.SIMPLE_INFRA_1_INSTANCE_ID;
const instancePublicIP = process.env.SIMPLE_INFRA_1_INSTANCE_PUBLIC_IP;

async function infra1Endpoint(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyStructuredResultV2> {
  return {
    statusCode: 200,
    body:
      "instance information: " +
      JSON.stringify({
        instanceId,
        instancePublicIP,
      }),
  };
}

export { infra1Endpoint };
