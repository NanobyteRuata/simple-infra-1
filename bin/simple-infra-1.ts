#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimpleInfra1Stack } from '../lib/simple-infra-1-stack';
import { SimpleEC2Stack } from '../lib/simple-ec2-stack';
import { SimpleInfra2Stack } from '../lib/simple-infra-2-stack';

const app = new cdk.App();

// Retrieve EC2 information of 'cdk stack2' from different stack 'cdk stack1'
const { instance } = new SimpleEC2Stack(app, 'SimpleEC2Stack');
new SimpleInfra1Stack(app, 'SimpleInfra1Stack', { 
  instanceId: instance.instanceId, 
  instancePublicIp: instance.instancePublicIp
});

// Retrieve EC2 ( created with CF ) information from AWS CDK app
new SimpleInfra2Stack(app, 'SimpleInfra2Stack');
