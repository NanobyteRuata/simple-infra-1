import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from "aws-lambda";
import { EC2 } from "aws-sdk";

const ec2 = new EC2();

async function infra2Endpoint(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyStructuredResultV2> {
  const describeInstanceResult = await ec2.describeInstances().promise();
  return {
    statusCode: 200,
    body:
      "all EC2 instances information: " +
      JSON.stringify(describeInstanceResult),
  };
}

export { infra2Endpoint };
