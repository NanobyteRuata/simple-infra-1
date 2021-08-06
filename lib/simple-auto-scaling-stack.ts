import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elb from "@aws-cdk/aws-elasticloadbalancingv2";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import { readFileSync } from "fs";

require("dotenv").config();

const config = {
  env: {
    account: process.env.AWS_ACCOUNT_NUMBER,
    region: process.env.AWS_ACCOUNT_REGION,
  },
};

export class SimpleAutoScalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, { ...props, env: config.env });

    // Get the default VPC instead of creating new
    const defaultVPC = ec2.Vpc.fromLookup(this, "DefaultVPC", {
      isDefault: true,
    });

    // Create a new security group (Firewall)
    const defaultVPCSecurityGroup1 = new ec2.SecurityGroup(
      this,
      "DefaultVPCSecurityGroup1",
      {
        vpc: defaultVPC,
        allowAllOutbound: true,
        securityGroupName: "DefaultVPCSecurityGroup1",
      }
    );

    // Add security rules
    defaultVPCSecurityGroup1.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allows SSH access from Internet"
    );
    defaultVPCSecurityGroup1.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allows HTTP access from Internet"
    );
    defaultVPCSecurityGroup1.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allows HTTPS access from Internet"
    );

    // Create auto-scaling group with configuration
    const autoScalingGroup1 = new autoscaling.AutoScalingGroup(
      this,
      "AutoScalingGroup1",
      {
        vpc: defaultVPC,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        machineImage: ec2.MachineImage.latestAmazonLinux({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        securityGroup: defaultVPCSecurityGroup1,
        minCapacity: 2,
        maxCapacity: 10,
        keyName: "SimpleInfra1Instance1Key",
      }
    );

    // add initialization commands to show
    const userDataScript = readFileSync(
      "./lib/user-data/simple-auto-scaling-instance-user-data.sh",
      "utf8"
    );
    autoScalingGroup1.addUserData(userDataScript);

    // Create Scaling Policies
    //    Upscale when 30 min before working hour (8AM - 5PM) starts
    autoScalingGroup1.scaleOnSchedule(
      "AutoScalingGroup1_UpscaleScheduleScalingPolicy",
      {
        schedule: autoscaling.Schedule.cron({ hour: "1", minute: "0" }), // UTC 1:00AM = Myanmar 7:30AM
        minCapacity: 3,
      }
    );
    //    Downscale when 30 min after working hour (8AM - 5PM) ends
    autoScalingGroup1.scaleOnSchedule(
      "AutoScalingGroup1_DownscaleScheduleScalingPolicy",
      {
        schedule: autoscaling.Schedule.cron({ hour: "11", minute: "00" }), // UTC 11:00AM = Myanmar 5:00PM
        minCapacity: 2,
      }
    );

    // Create Load Balancer
    const loadBalancer = new elb.ApplicationLoadBalancer(
      this,
      "LoadBalancer1",
      {
        vpc: defaultVPC,
        internetFacing: true,
        securityGroup: defaultVPCSecurityGroup1,
      }
    );

    // Listener to allow Load Balancer's security group to be accessed from internet
    const listener = loadBalancer.addListener("LoadBalancer1Listener", {
      port: 80,
      open: true,
    });

    // Add Auto Scaling Group as Load Balancer Listener's target.
    // Now clients load through Listener is balanced
    // through all running instances in auto scaling group.
    listener.addTargets("LoadBalancer1Targets", {
      port: 80,
      targets: [autoScalingGroup1],
      healthCheck: {
        path: "/index.html",
        interval: cdk.Duration.minutes(1),
      },
    });

    new cdk.CfnOutput(this, "LoadBalancerDNSAddressExport", {
      exportName: "LoadBalancerDNSAddress",
      value: listener.loadBalancer.loadBalancerDnsName,
    });
  }
}
