import { OASResult } from '../../../src/results';
import {
  operationExampleResultFailuresWarnings,
  operationExampleResultFailuresWarningsString,
  operationExampleResultFailuresNoWarnings,
  operationExampleResultFailuresNoWarningsString,
  operationExampleResultNoFailuresWarnings,
  operationExampleResultNoFailuresWarningsString,
  operationExampleResultNoFailuresWarningsStructure,
} from './operation-example-results';
import { StructuredOutput } from '../../../src/utilities/structured-output';

export const oasResultSuccess = new OASResult(
  'winterfell',
  undefined,
  undefined,
  [],
  [operationExampleResultNoFailuresWarnings],
  undefined,
);

export const oasResultSuccessString = `winterfell: Succeeded
${operationExampleResultNoFailuresWarningsString}`;

export const oasResultSuccessStructure: StructuredOutput = {
  id: oasResultSuccess.testName,
  config: {
    oasPath: String(oasResultSuccess.oasPath),
    server: String(oasResultSuccess.server),
    authenticationType: '',
  },
  error: undefined,
  results: operationExampleResultNoFailuresWarningsStructure,
};

export const oasResultFailure = new OASResult(
  'riverrun',
  undefined,
  undefined,
  [],
  [operationExampleResultFailuresWarnings],
  undefined,
);

export const oasResultFailureString = `riverrun: 1/1 operation failed
${operationExampleResultFailuresWarningsString}`;

export const oasResultFailureStructure = undefined;

export const oasResultMixedResults = new OASResult(
  'dragonstone',
  undefined,
  undefined,
  [],
  [
    operationExampleResultFailuresWarnings,
    operationExampleResultFailuresNoWarnings,
    operationExampleResultNoFailuresWarnings,
  ],
  undefined,
);

export const oasResultMixedResultsString = `dragonstone: 2/3 operations failed
${operationExampleResultFailuresWarningsString}${operationExampleResultFailuresNoWarningsString}${operationExampleResultNoFailuresWarningsString}`;

export const oasResultMixedResultsStructure = undefined;

export const oasResultError = new OASResult(
  'stormsend',
  'https://westeros.stormsend/underground/scrolls/catacombs/v0/openapi.json',
  'https://sandbox-westeros.stormsend/duties/castles/{version}',
  [],
  undefined,
  'Server value must be specified if OAS contains more than one server',
);

export const oasResultErrorString =
  'stormsend: Skipped - Server value must be specified if OAS contains more than one server\n';

export const oasResultErrorJson =
  `{"id":"${oasResultError.testName}",` +
  `"config":{"oasPath":"${oasResultError.oasPath}","server":"${oasResultError.server}","authenticationType":""},` +
  `"error":"${oasResultError.error}"}`;

export const oasResultErrorStructure = undefined;

export const oasResultMissingPath = new OASResult(
  'kinglanding',
  undefined,
  'https://sandbox-westeros.kingslanding/duties/castles/{version}',
  [],
  undefined,
  'Config kinglanding missing path',
);

export const oasResultMissingPathString =
  'kinglanding: Skipped - Config kinglanding missing path\n';
