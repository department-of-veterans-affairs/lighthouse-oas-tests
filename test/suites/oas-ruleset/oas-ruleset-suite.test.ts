const operationResults = new Map();

import OASSchema from '../../../src/oas-parsing/schema/oas-schema';
import { SuiteConfig } from '../../../src/suites';
import OasRulesetSuite from '../../../src/suites/oas-ruleset/oas-ruleset-suite';

// ruleset-wrapper needs be mocked to avoid Jest conflict with
//  3rd party packages when they use package.json 'export'
jest.mock('../../../src/suites/oas-ruleset/validation/ruleset-wrapper', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getRuleset: jest.fn(),
    };
  };
});

const oasResults = [
  {
    operationId: '/findTheRing:GET',
    originalOperationId: '/findTheRing:GET',
    testGroupName: 'no-rings-found',
    failures: { test: 'mockError' },
    warnings: {},
  },
];

jest.mock(
  '../../../src/suites/oas-ruleset/validation/oas-ruleset-validator',
  () => {
    return {
      __esModule: true,
      default: jest.fn().mockImplementation(() => {
        return {
          SpectralValidator: jest.fn(),
          validate: jest.fn(),
          operationMap: operationResults,
        };
      }),
    };
  },
);

let suiteConfig: SuiteConfig;
let oasSchema: OASSchema;
operationResults.set(
  '/findTheRing:GET',
  new Map().set('no-rings-found', {
    failures: { test: 'mockError' },
    warnings: {},
  }),
);

describe('OasRulesetSuite', () => {
  beforeEach(() => {
    oasSchema = new OASSchema({ spec: {} });
    suiteConfig = {
      options: { path: 'pathToTheRing' },
      schema: oasSchema,
      securityValues: {},
    };
  });

  describe('conduct', () => {
    it('calls oas-ruleset validator and returns results', async () => {
      const suite = new OasRulesetSuite(suiteConfig);

      expect(await suite.conduct()).toEqual(oasResults);
    });
  });

  describe('getLabel', () => {
    it('returns label', () => {
      const suite = new OasRulesetSuite(suiteConfig);

      expect(suite.getLabel()).toEqual('(oas-ruleset)');
    });
  });
});
