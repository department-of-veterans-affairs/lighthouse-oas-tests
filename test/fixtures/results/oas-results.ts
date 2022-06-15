import { OASResult } from '../../../src/results';
import {
  operationExampleResultFailuresWarnings,
  operationExampleResultFailuresWarningsString,
  operationExampleResultFailuresWarningsStructure,
  operationExampleResultFailuresNoWarnings,
  operationExampleResultFailuresNoWarningsString,
  operationExampleResultNoFailuresWarnings,
  operationExampleResultNoFailuresWarningsString,
  operationExampleResultNoFailuresWarningsStructure,
  operationExampleResultMixedStructure,
} from './operation-example-results';
import { StructuredOutput } from '../../../src/utilities/structured-output';
import { OASSecurityScheme } from '../../../src/utilities/oas-security';

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

export const oasResultFailureStructure: StructuredOutput = {
  id: oasResultFailure.testName,
  config: {
    oasPath: String(oasResultFailure.oasPath),
    server: String(oasResultFailure.server),
    authenticationType: '',
  },
  error: undefined,
  results: operationExampleResultFailuresWarningsStructure,
};

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

export const oasResultMixedResultsStructure: StructuredOutput = {
  id: oasResultMixedResults.testName,
  config: {
    oasPath: String(oasResultMixedResults.oasPath),
    server: String(oasResultMixedResults.server),
    authenticationType: '',
  },
  error: undefined,
  results: operationExampleResultMixedStructure,
};

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

export const oasResultErrorStructure: StructuredOutput = {
  id: oasResultError.testName,
  config: {
    oasPath: String(oasResultError.oasPath),
    server: String(oasResultError.server),
    authenticationType: '',
  },
  error: oasResultError.error,
  results: undefined,
};

export const oasResultErrorJson =
  `{"id":"${oasResultError.testName}",` +
  `"config":{"oasPath":"${oasResultError.oasPath}","server":"${oasResultError.server}","authenticationType":""},` +
  `"error":"${oasResultError.error}"}`;

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

export const oasResultSingleSecurity = new OASResult(
  'oldanchor',
  undefined,
  undefined,
  [new OASSecurityScheme('canGetIt', { type: 'apiKey' })],
  undefined,
  undefined,
);

export const oasResultSingleSecurityStructure: StructuredOutput = {
  id: oasResultSingleSecurity.testName,
  config: {
    oasPath: String(oasResultSingleSecurity.oasPath),
    server: String(oasResultSingleSecurity.server),
    authenticationType: 'apiKey',
  },
  results: undefined,
  error: undefined,
};

export const oasResultMultipleSecurity = new OASResult(
  'oldoak',
  undefined,
  undefined,
  [
    new OASSecurityScheme('canGetIt', { type: 'apiKey' }),
    new OASSecurityScheme('canAlsoGetIt', { type: 'oauth2' }),
  ],
  undefined,
  undefined,
);

export const oasResultMultipleSecurityStructure: StructuredOutput = {
  id: oasResultMultipleSecurity.testName,
  config: {
    oasPath: String(oasResultMultipleSecurity.oasPath),
    server: String(oasResultMultipleSecurity.server),
    authenticationType: 'apiKey/oauth2',
  },
  results: undefined,
  error: undefined,
};
