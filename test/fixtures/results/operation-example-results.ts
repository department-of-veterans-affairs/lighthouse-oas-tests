import { OperationExampleResult } from '../../../src/results';
import { ValidationWarning } from '../../../src/validation-messages/warnings';
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

export const operationExampleResultFailuresWarnings =
  new OperationExampleResult(
    'GET:/harryPotter',
    'default',
    responseFailuresMap,
    responseOneWarningMap,
  );

export const operationExampleResultFailuresWarningsString =
  '  GET:/harryPotter - default: Failed\n' +
  '    - Actual type did not match schema. Schema type: number. Actual type: string. Path: body -> age. Found 2 times\n' +
  '    - Actual object missing required property. Required property: glasses. Path: body. Found 1 time\n' +
  '    - Warning: This object is missing non-required properties that were unable to be validated, including middleName. Path: body. Found 2 times\n';

export const operationExampleResultFailuresNoWarnings =
  new OperationExampleResult(
    'GET:/he-who-must-not-be-named',
    'tomRiddle',
    responseOneFailureMap,
    emptyWarningMap,
  );

export const operationExampleResultFailuresNoWarningsString =
  '  GET:/he-who-must-not-be-named - tomRiddle: Failed\n' +
  '    - Actual object missing required property. Required property: house. Path: body. Found 1 time\n';

export const operationExampleResultNoFailuresWarnings =
  new OperationExampleResult(
    'GET:/he-who-must-not-be-named',
    'voldermort',
    emptyFailureMap,
    responseWarningsMap,
  );

export const operationExampleResultNoFailuresWarningsString =
  '  GET:/he-who-must-not-be-named - voldermort: Succeeded\n' +
  '    - Warning: This object is missing non-required properties that were unable to be validated, including middleName. Path: body. Found 2 times\n' +
  '    - Warning: This object is missing non-required properties that were unable to be validated, including address2. Path: body -> horcruxes -> location. Found 1 time\n';

export const operationExampleResultRequestValidationFailures =
  new OperationExampleResult(
    'GET:/harryPotter',
    'default',
    requestBodyFailureMap,
    requestBodyWarningMap,
  );

export const operationExampleResultNoRequestValidationFailures =
  new OperationExampleResult(
    'GET:/harryPotter',
    'default',
    responseFailuresMap,
    requestResponseWarningMap,
  );
