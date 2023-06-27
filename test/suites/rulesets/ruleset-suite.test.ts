const operationResults = new Map();

import OASSchema from '../../../src/oas-parsing/schema/oas-schema';
import { SuiteConfig } from '../../../src/suites';
import RulesetSuite from '../../../src/suites/rulesets/ruleset-suite';

// ruleset-wrapper needs be mocked to avoid Jest conflict with
//  3rd party packages when they use package.json 'export'
jest.mock('../../../src/suites/rulesets/validation/ruleset-wrapper', () => {
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

jest.mock('../../../src/suites/rulesets/validation/ruleset-validator', () => {
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
});

let suiteConfig: SuiteConfig;
let oasSchema: OASSchema;
let rulesetName: string;
operationResults.set(
  '/findTheRing:GET',
  new Map().set('no-rings-found', {
    failures: { test: 'mockError' },
    warnings: {},
  }),
);

describe('RulesetSuite', () => {
  beforeEach(() => {
    oasSchema = new OASSchema({ spec: {} });
    rulesetName = 'oas-ruleset';
    suiteConfig = {
      options: { path: 'pathToTheRing' },
      schema: oasSchema,
    };
  });

  describe('conduct', () => {
    it('calls oas-ruleset validator and returns results', async () => {
      const suite = new RulesetSuite(rulesetName);
      await suite.setup(suiteConfig);

      expect(await suite.conduct()).toEqual(oasResults);
    });
  });

  describe('getLabel', () => {
    it('returns label', async () => {
      const suite = new RulesetSuite(rulesetName);
      await suite.setup(suiteConfig);

      expect(suite.getLabel()).toEqual('(oas-ruleset)');
    });
  });
});
