import { OperationExampleResult } from '../../../src/results';
import {
  emptyFailureMap,
  responseOneFailureMap,
  requestBodyFailureMap,
  responseFailuresMap,
} from './failures';
import {
  emptyWarningMap,
  responseOneWarningMap,
  requestBodyWarningMap,
  requestResponseWarningMap,
  responseWarningsMap,
} from './warnings';
import { mockedSystemTime } from '../system-time';
import { ApiResults } from '../../../src/utilities/structured-output';

export const operationExampleResultFailuresWarnings =
  new OperationExampleResult(
    'GET:/harryPotter',
    undefined,
    'default',
    responseFailuresMap,
    responseOneWarningMap,
  );

export const operationExampleResultFailuresWarningsString = `  GET:/harryPotter - default: Failed
    - Actual type did not match schema. Schema type: number. Actual type: string. Path: body -> age. Found 2 times
    - Actual object missing required property. Required property: glasses. Path: body. Found 1 time
    - Warning: This object is missing non-required properties that were unable to be validated, including middleName. Path: body. Found 2 times
`;

export const operationExampleResultFailuresNoWarnings =
  new OperationExampleResult(
    'GET:/he-who-must-not-be-named',
    undefined,
    'tomRiddle',
    responseOneFailureMap,
    emptyWarningMap,
  );

export const operationExampleResultFailuresNoWarningsString = `  GET:/he-who-must-not-be-named - tomRiddle: Failed
    - Actual object missing required property. Required property: house. Path: body. Found 1 time
`;

export const operationExampleResultNoFailuresWarnings =
  new OperationExampleResult(
    'GET:/he-who-must-not-be-named',
    undefined,
    'voldermort',
    emptyFailureMap,
    responseWarningsMap,
  );

export const operationExampleResultNoFailuresWarningsString = `  GET:/he-who-must-not-be-named - voldermort: Succeeded
    - Warning: This object is missing non-required properties that were unable to be validated, including middleName. Path: body. Found 2 times
    - Warning: This object is missing non-required properties that were unable to be validated, including address2. Path: body -> horcruxes -> location. Found 1 time
`;

export const operationExampleResultNoFailuresWarningsStructure = (function(){
  const result: ApiResults = {
    apiSummary: {
      totalPass: 1,
      totalWarn: 2,
      totalFail: 0,
      totalRun: 1,
      runDateTime: mockedSystemTime,
    },
  };
  result[
    operationExampleResultNoFailuresWarnings.operationId
    ] = {
    endpointSummary: {
      totalPass: 1,
      totalWarn: 2,
      totalFail: 0,
      totalRun: 1,
    },
  };
  result[
    operationExampleResultNoFailuresWarnings.operationId
    ][operationExampleResultNoFailuresWarnings.exampleGroupName] = {
    errors: [],
    warnings: [...responseWarningsMap].map(([, value]) => ({
      message: value.message,
      count: value.count,
    })),
  };
  return result;
}());

export const operationExampleResultRequestValidationFailures =
  new OperationExampleResult(
    'GET:/harryPotter',
    undefined,
    'default',
    requestBodyFailureMap,
    requestBodyWarningMap,
  );

export const operationExampleResultNoRequestValidationFailures =
  new OperationExampleResult(
    'GET:/harryPotter',
    undefined,
    'default',
    responseFailuresMap,
    requestResponseWarningMap,
  );
