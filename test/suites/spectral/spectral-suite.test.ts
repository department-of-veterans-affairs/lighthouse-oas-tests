const operationResults = new Map();

import OASSchema from '../../../src/oas-parsing/schema/oas-schema';
import { SuiteConfig } from '../../../src/suites';
import SpectralSuite from '../../../src/suites/spectral/spectral-suite';

// ruleset-wrapper needs be mocked to avoid Jest conflict with
//  3rd party packages when they use package.json 'export'
jest.mock('../../../src/suites/spectral/validation/ruleset-wrapper', () => {
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

jest.mock('../../../src/suites/spectral/validation/spectral-validator', () => {
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
operationResults.set(
  '/findTheRing:GET',
  new Map().set('no-rings-found', {
    failures: { test: 'mockError' },
    warnings: {},
  }),
);

describe('SpectralSuite', () => {
  beforeEach(() => {
    oasSchema = new OASSchema({ spec: {} });
    suiteConfig = { options: { path: 'pathToTheRing' }, schema: oasSchema };
  });

  describe('conduct', () => {
    it('calls spectral validator and returns results', async () => {
      const suite = new SpectralSuite(suiteConfig);

      expect(await suite.conduct()).toEqual(oasResults);
    });
  });

  describe('getLabel', () => {
    it('returns label', () => {
      const suite = new SpectralSuite(suiteConfig);

      expect(suite.getLabel()).toEqual('(Spectral)');
    });
  });
});
