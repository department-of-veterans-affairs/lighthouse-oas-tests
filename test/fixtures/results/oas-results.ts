import { OASResult } from '../../../src/results';
import {
  operationExampleResultFailuresWarnings,
  operationExampleResultFailuresWarningsString,
  operationExampleResultFailuresNoWarnings,
  operationExampleResultFailuresNoWarningsString,
  operationExampleResultNoFailuresWarnings,
  operationExampleResultNoFailuresWarningsString,
} from './operation-example-results';

export const oasResultSuccess = new OASResult(
  'winterfell',
  [operationExampleResultNoFailuresWarnings],
  undefined,
);

export const oasResultSuccessString =
  'winterfell: Succeeded\n' + operationExampleResultNoFailuresWarningsString;

export const oasResultFailure = new OASResult(
  'riverrun',
  [operationExampleResultFailuresWarnings],
  undefined,
);

export const oasResultFailureString =
  'riverrun: 1/1 operation failed\n' +
  operationExampleResultFailuresWarningsString;

export const oasResultMixedResults = new OASResult(
  'dragonstone',
  [
    operationExampleResultFailuresWarnings,
    operationExampleResultFailuresNoWarnings,
    operationExampleResultNoFailuresWarnings,
  ],
  undefined,
);

export const oasResultMixedResultsString =
  'dragonstone: 2/3 operations failed\n' +
  operationExampleResultFailuresWarningsString +
  operationExampleResultFailuresNoWarningsString +
  operationExampleResultNoFailuresWarningsString;

export const oasResultError = new OASResult(
  'stormsend',
  undefined,
  'Server value must be specified if OAS contains more than one server',
);

export const oasResultErrorString =
  'stormsend: Skipped - Server value must be specified if OAS contains more than one server\n';

export const oasResultMissingPath = new OASResult(
  'kinglanding',
  undefined,
  'Config kinglanding missing path',
);

export const oasResultMissingPathString =
  'kinglanding: Skipped - Config kinglanding missing path\n';
