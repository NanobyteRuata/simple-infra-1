import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SimpleInfra1 from '../lib/simple-infra-1-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SimpleInfra1.SimpleInfra1Stack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
