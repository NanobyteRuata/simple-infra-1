import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda'
import { EC2 } from 'aws-sdk'

const instanceId = process.env.SIMPLE_INFRA_1_INSTANCE_ID
const instancePublicIP = process.env.SIMPLE_INFRA_1_INSTANCE_PUBLIC_IP

async function baseEndpoint(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2> {
    return {
        statusCode: 200,
        body: JSON.stringify({
            instanceId,
            instancePublicIP
        })
    }
} 

export { baseEndpoint }