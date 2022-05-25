import { OASResult } from '../../../src/results';
import {
  harryPotterDefaultOperationExampleResult,
  harryPotterDefaultResultString,
  heWhoMustNotBeNamedTomRiddleOperationExampleResult,
  heWhoMustNotBeNamedTomRiddleResultString,
  heWhoMustNotBeNamedVoldermortOperationExampleResult,
  heWhoMustNotBeNamedVoldermortResultString,
  ronWeasleyDefaultOperationExampleResult,
  ronWeasleyDefaultResultString,
} from './operation-example-results';

export const oasResultSuccess = new OASResult(
  'winterfell',
  [heWhoMustNotBeNamedVoldermortOperationExampleResult],
  undefined,
);

export const oasResultSuccessString =
  'winterfell: Succeeded\n' + heWhoMustNotBeNamedVoldermortResultString;

export const oasResultFailure = new OASResult(
  'riverrun',
  [harryPotterDefaultOperationExampleResult],
  undefined,
);

export const oasResultFailureString =
  'riverrun: 1/1 operation failed\n' + harryPotterDefaultResultString;

export const oasResultMixedResults = new OASResult(
  'dragonstone',
  [
    harryPotterDefaultOperationExampleResult,
    heWhoMustNotBeNamedTomRiddleOperationExampleResult,
    heWhoMustNotBeNamedVoldermortOperationExampleResult,
  ],
  undefined,
);

export const oasResultMixedResultsString =
  'dragonstone: 2/3 operations failed\n' +
  harryPotterDefaultResultString +
  heWhoMustNotBeNamedTomRiddleResultString +
  heWhoMustNotBeNamedVoldermortResultString;

export const oasResultWithError = new OASResult(
  'stormsend',
  undefined,
  'Server value must be specified if OAS contains more than one server',
);

export const oasResultWithErrorString =
  'stormsend: Skipped - Server value must be specified if OAS contains more than one server\n';

export const missingPathOASResult = new OASResult(
  'kinglanding',
  undefined,
  'Config kinglanding missing path',
);

export const missingPathOASResultString =
  'kinglanding: Skipped - Config kinglanding missing path\n';
