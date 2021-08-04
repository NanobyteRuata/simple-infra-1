#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimpleInfra1Stack } from '../lib/simple-infra-1-stack';
import { SimpleEC2Stack } from '../lib/simple-ec2-stack';

const app = new cdk.App();
const { instance } = new SimpleEC2Stack(app, 'SimpleEC2Stack');
new SimpleInfra1Stack(app, 'SimpleInfra1Stack', { 
  instanceId: instance.instanceId, 
  instancePublicIp: instance.instancePublicIp
});
