import { OperationExampleResult } from '../../../src/results';
import { ValidationWarning } from '../../../src/validation-messages/warnings';
import {
  emptyFailureMap,
  oneFailureMap,
  requestBodyFailureMap,
  twoFailureMap,
} from './failures';
import {
  emptyWarningMap,
  oneWarningMap,
  requestBodyWarningMap,
  requestResponseWarningMap,
  twoWarningMap,
} from './warnings';

export const harryPotterDefaultOperationExampleResult =
  new OperationExampleResult(
    'GET:/harryPotter',
    'default',
    twoFailureMap,
    oneWarningMap,
  );

export const harryPotterDefaultResultString =
  '  GET:/harryPotter - default: Failed\n' +
  '    - Actual type did not match schema. Schema type: number. Actual type: string. Path: body -> age. Found 2 times\n' +
  '    - Actual object missing required property. Required property: glasses. Path: body. Found 1 time\n' +
  '    - Warning: This object is missing non-required properties that were unable to be validated, including middleName. Path: body. Found 2 times\n';

export const heWhoMustNotBeNamedTomRiddleOperationExampleResult =
  new OperationExampleResult(
    'GET:/he-who-must-not-be-named',
    'tomRiddle',
    oneFailureMap,
    emptyWarningMap,
  );

export const heWhoMustNotBeNamedTomRiddleResultString =
  '  GET:/he-who-must-not-be-named - tomRiddle: Failed\n' +
  '    - Actual object missing required property. Required property: house. Path: body. Found 1 time\n';

export const heWhoMustNotBeNamedVoldermortOperationExampleResult =
  new OperationExampleResult(
    'GET:/he-who-must-not-be-named',
    'voldermort',
    emptyFailureMap,
    twoWarningMap,
  );

export const heWhoMustNotBeNamedVoldermortResultString =
  '  GET:/he-who-must-not-be-named - voldermort: Succeeded\n' +
  '    - Warning: This object is missing non-required properties that were unable to be validated, including middleName. Path: body. Found 2 times\n' +
  '    - Warning: This object is missing non-required properties that were unable to be validated, including address2. Path: body -> horcruxes -> location. Found 1 time\n';

export const ronWeasleyDefaultOperationExampleResult =
  new OperationExampleResult(
    'GET:/ronWeasley',
    'default',
    emptyFailureMap,
    oneWarningMap,
  );

export const ronWeasleyDefaultResultString =
  '  GET:/ronWeasley - default: Succeeded\n' +
  '    - Warning: This object is missing non-required properties that were unable to be validated, including middleName. Path: body. Found 2 times\n';

export const requestValidationFailuresOperationExampleResult =
  new OperationExampleResult(
    'GET:/harryPotter',
    'default',
    requestBodyFailureMap,
    requestBodyWarningMap,
  );

export const noRequestValidationFailuresOperationExampleResult =
  new OperationExampleResult(
    'GET:/harryPotter',
    'default',
    twoFailureMap,
    requestResponseWarningMap,
  );
