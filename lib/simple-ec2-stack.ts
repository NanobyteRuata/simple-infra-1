import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2'
import * as iam from '@aws-cdk/aws-iam'

require('dotenv').config()

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_ACCOUNT_REGION
  }
}

export class SimpleEC2Stack extends cdk.Stack {
    public readonly instance: ec2.Instance;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {...props, env: config.env});

    const vpc = ec2.Vpc.fromLookup(this, 'SimpleEC2VPC', {
      isDefault: true
    });

    const role = new iam.Role(this, 'SimpleEC2Instance1Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    });

    const securityGroup = new ec2.SecurityGroup(this, 'SimpleEC2Instance1SG', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'SimpleEC2Instance1SG',
    })

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allows SSH access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allows HTTP access from Internet'
    )

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allows HTTPS access from Internet'
    )

    this.instance = new ec2.Instance(this, 'SimpleEC2Instance1', {
      vpc,
      role,
      securityGroup,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      keyName: 'SimpleInfra1Instance1Key'
    });
  }
}
