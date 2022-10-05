import { OASResult } from '../../../src/validation';
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
} from './operation-results';
import { StructuredOutput } from '../../../src/utilities/structured-output';
import {
  OASSecurityScheme,
  OASSecurityType,
} from '../../../src/oas-parsing/security';

export const oasResultSuccess = new OASResult(
  'oas-ruleset',
  'winterfell',
  undefined,
  undefined,
  [],
  [operationExampleResultNoFailuresWarnings],
  undefined,
);

export const oasResultSuccessString = `oas-ruleset winterfell: Succeeded
${operationExampleResultNoFailuresWarningsString}`;

export const oasResultSuccessStructure: StructuredOutput = {
  suiteId: oasResultSuccess.suiteId,
  id: oasResultSuccess.testName,
  config: {
    oasPath: oasResultSuccess.oasPath,
    server: oasResultSuccess.server,
    authenticationType: [],
  },
  error: undefined,
  results: operationExampleResultNoFailuresWarningsStructure,
};

export const oasResultFailure = new OASResult(
  'oas-ruleset',
  'riverrun',
  undefined,
  undefined,
  [],
  [operationExampleResultFailuresWarnings],
  undefined,
);

export const oasResultFailureString = `oas-ruleset riverrun: 1/1 operation failed
${operationExampleResultFailuresWarningsString}`;

export const oasResultFailureStructure: StructuredOutput = {
  suiteId: oasResultSuccess.suiteId,
  id: oasResultFailure.testName,
  config: {
    oasPath: oasResultFailure.oasPath,
    server: oasResultFailure.server,
    authenticationType: [],
  },
  error: undefined,
  results: operationExampleResultFailuresWarningsStructure,
};

export const oasResultMixedResults = new OASResult(
  'oas-ruleset',
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

export const oasResultMixedResultsString = `oas-ruleset dragonstone: 2/3 operations failed
${operationExampleResultFailuresWarningsString}${operationExampleResultFailuresNoWarningsString}${operationExampleResultNoFailuresWarningsString}`;

export const oasResultMixedResultsStructure: StructuredOutput = {
  suiteId: oasResultSuccess.suiteId,
  id: oasResultMixedResults.testName,
  config: {
    oasPath: oasResultMixedResults.oasPath,
    server: oasResultMixedResults.server,
    authenticationType: [],
  },
  error: undefined,
  results: operationExampleResultMixedStructure,
};

export const oasResultError = new OASResult(
  'oas-ruleset',
  'stormsend',
  'https://westeros.stormsend/underground/scrolls/catacombs/v0/openapi.json',
  'https://sandbox-westeros.stormsend/duties/castles/{version}',
  [],
  undefined,
  'Server value must be specified if OAS contains more than one server',
);

export const oasResultErrorString =
  'oas-ruleset stormsend: Skipped - Server value must be specified if OAS contains more than one server\n';

export const oasResultErrorStructure: StructuredOutput = {
  suiteId: oasResultSuccess.suiteId,
  id: oasResultError.testName,
  config: {
    oasPath: oasResultError.oasPath,
    server: oasResultError.server,
    authenticationType: [],
  },
  error: oasResultError.error,
  results: undefined,
};

export const oasResultErrorJson =
  `{"suiteId":"oas-ruleset","id":"${oasResultError.testName}",` +
  `"config":{"oasPath":"${oasResultError.oasPath}","server":"${oasResultError.server}","authenticationType":[]},` +
  `"error":"${oasResultError.error}"}`;

export const oasResultMissingPath = new OASResult(
  'oas-ruleset',
  'kinglanding',
  undefined,
  'https://sandbox-westeros.kingslanding/duties/castles/{version}',
  [],
  undefined,
  'Config kinglanding missing path',
);

export const oasResultMissingPathString =
  'oas-ruleset kinglanding: Skipped - Config kinglanding missing path\n';

export const oasResultSingleSecurity = new OASResult(
  'oas-ruleset',
  'oldanchor',
  undefined,
  undefined,
  [new OASSecurityScheme('canGetIt', { type: 'apiKey' })],
  undefined,
  undefined,
);

export const oasResultSingleSecurityStructure: StructuredOutput = {
  suiteId: oasResultSuccess.suiteId,
  id: oasResultSingleSecurity.testName,
  config: {
    oasPath: oasResultSingleSecurity.oasPath,
    server: oasResultSingleSecurity.server,
    authenticationType: [OASSecurityType.APIKEY],
  },
  results: undefined,
  error: undefined,
};

export const oasResultMultipleSecurity = new OASResult(
  'oas-ruleset',
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
  suiteId: oasResultSuccess.suiteId,
  id: oasResultMultipleSecurity.testName,
  config: {
    oasPath: oasResultMultipleSecurity.oasPath,
    server: oasResultMultipleSecurity.server,
    authenticationType: [OASSecurityType.APIKEY, OASSecurityType.OAUTH2],
  },
  results: undefined,
  error: undefined,
};
