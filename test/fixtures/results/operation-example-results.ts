import { OperationExampleResult } from '../../../src/validation/results';
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

const operationExampleResultFailuresWarningsStructure: ApiResults = {
  apiSummary: {
    totalPass: 0,
    totalWarn: 1,
    totalFail: 1,
    totalRun: 1,
    runDateTime: mockedSystemTime,
  },
};
operationExampleResultFailuresWarningsStructure[
  operationExampleResultFailuresWarnings.operationId
] = {
  endpointSummary: {
    totalPass: 0,
    totalWarn: 1,
    totalFail: 1,
    totalRun: 1,
  },
};
operationExampleResultFailuresWarningsStructure[
  operationExampleResultFailuresWarnings.operationId
][operationExampleResultFailuresWarnings.exampleGroupName] = {
  errors: [...responseFailuresMap].map(([, value]) => ({
    message: value.message,
    count: value.count,
  })),
  warnings: [...responseOneWarningMap].map(([, value]) => ({
    message: value.message,
    count: value.count,
  })),
};
export { operationExampleResultFailuresWarningsStructure };

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

const operationExampleResultFailuresNoWarningsStructure: ApiResults = {
  apiSummary: {
    totalPass: 0,
    totalWarn: 0,
    totalFail: 1,
    totalRun: 1,
    runDateTime: mockedSystemTime,
  },
};
operationExampleResultFailuresNoWarningsStructure[
  operationExampleResultFailuresNoWarnings.operationId
] = {
  endpointSummary: {
    totalPass: 0,
    totalWarn: 0,
    totalFail: 1,
    totalRun: 1,
  },
};
operationExampleResultFailuresNoWarningsStructure[
  operationExampleResultFailuresNoWarnings.operationId
][operationExampleResultFailuresNoWarnings.exampleGroupName] = {
  errors: [...responseOneFailureMap].map(([, value]) => ({
    message: value.message,
    count: value.count,
  })),
  warnings: [],
};
export { operationExampleResultFailuresNoWarningsStructure };

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

const operationExampleResultNoFailuresWarningsStructure: ApiResults = {
  apiSummary: {
    totalPass: 1,
    totalWarn: 1,
    totalFail: 0,
    totalRun: 1,
    runDateTime: mockedSystemTime,
  },
};
operationExampleResultNoFailuresWarningsStructure[
  operationExampleResultNoFailuresWarnings.operationId
] = {
  endpointSummary: {
    totalPass: 1,
    totalWarn: 1,
    totalFail: 0,
    totalRun: 1,
  },
};
operationExampleResultNoFailuresWarningsStructure[
  operationExampleResultNoFailuresWarnings.operationId
][operationExampleResultNoFailuresWarnings.exampleGroupName] = {
  errors: [],
  warnings: [...responseWarningsMap].map(([, value]) => ({
    message: value.message,
    count: value.count,
  })),
};
export { operationExampleResultNoFailuresWarningsStructure };

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

const operationExampleResultMixedStructure: ApiResults = {
  apiSummary: {
    totalPass: 1,
    totalWarn: 2,
    totalFail: 2,
    totalRun: 3,
    runDateTime: mockedSystemTime,
  },
};

// FailuresWarnings - Operation ID GET:/harryPotter
operationExampleResultMixedStructure[
  operationExampleResultFailuresWarnings.operationId
] =
  operationExampleResultFailuresWarningsStructure[
    operationExampleResultFailuresWarnings.operationId
  ];
operationExampleResultMixedStructure[
  operationExampleResultFailuresWarnings.operationId
][operationExampleResultFailuresWarnings.exampleGroupName] =
  operationExampleResultFailuresWarningsStructure[
    operationExampleResultFailuresWarnings.operationId
  ][operationExampleResultFailuresWarnings.exampleGroupName];

// FailuresNoWarnings & NoFailuresWarnings share the same Operation ID - GET:/he-who-must-not-be-named
operationExampleResultMixedStructure[
  operationExampleResultFailuresNoWarnings.operationId
] = {
  endpointSummary: {
    totalPass: 1,
    totalWarn: 1,
    totalFail: 1,
    totalRun: 2,
  },
};

// FailuresNoWarnings
operationExampleResultMixedStructure[
  operationExampleResultFailuresNoWarnings.operationId
][operationExampleResultFailuresNoWarnings.exampleGroupName] =
  operationExampleResultFailuresNoWarningsStructure[
    operationExampleResultFailuresNoWarnings.operationId
  ][operationExampleResultFailuresNoWarnings.exampleGroupName];

// NoFailuresWarnings
operationExampleResultMixedStructure[
  operationExampleResultNoFailuresWarnings.operationId
][operationExampleResultNoFailuresWarnings.exampleGroupName] =
  operationExampleResultNoFailuresWarningsStructure[
    operationExampleResultNoFailuresWarnings.operationId
  ][operationExampleResultNoFailuresWarnings.exampleGroupName];

export { operationExampleResultMixedStructure };
