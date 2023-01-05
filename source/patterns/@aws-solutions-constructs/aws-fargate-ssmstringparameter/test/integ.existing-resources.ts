/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

// Imports
import { Aws, App, Stack } from "aws-cdk-lib";
import { FargateToSsmstringparameter, FargateToSsmstringparameterProps } from "../lib";
import { generateIntegStackName, getTestVpc, CreateFargateService } from '@aws-solutions-constructs/core';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

// Setup
const app = new App();
const stack = new Stack(app, generateIntegStackName(__filename), {
  env: { account: Aws.ACCOUNT_ID, region: 'us-east-1' },
});
stack.templateOptions.description = 'Integration Test with existing VPC, Service and SSM String Parameter';

const existingVpc = getTestVpc(stack);
const existingStringParameterObj = new ssm.StringParameter(stack, 'Parameter', {
  allowedPattern: '.*',
  description: 'The value Foo',
  parameterName: 'FooParameter',
  stringValue: 'Foo',
});

const image = ecs.ContainerImage.fromRegistry('nginx');

const [testService, testContainer] = CreateFargateService(stack,
  'test',
  existingVpc,
  undefined,
  undefined,
  undefined,
  undefined,
  { image },
);

const constructProps: FargateToSsmstringparameterProps = {
  publicApi: true,
  existingVpc,
  existingStringParameterObj,
  existingContainerDefinitionObject: testContainer,
  existingFargateServiceObject: testService,
  stringParameterEnvironmentVariableName: 'CUSTOM_NAME',
  stringParameterPermissions: "readwrite"
};

new FargateToSsmstringparameter(stack, 'test-construct', constructProps);

// Synth
app.synth();