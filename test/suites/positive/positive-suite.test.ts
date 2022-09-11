const operationResult = new Map();

import loadJsonFile from 'load-json-file';
import OASSchema from '../../../src/oas-parsing/schema/oas-schema';
import { SuiteConfig } from '../../../src/suites';
import PositiveSuite from '../../../src/suites/positive/positive-suite';

jest.mock('../../../src/suites/positive/conductors', () => {
  return {
    __esModule: true,
    ValidationConductor: jest.fn().mockImplementation(() => {
      return {
        ValidationConductor: jest.fn(),
        validate: jest.fn().mockResolvedValue(operationResult),
      };
    }),
  };
});

let suiteConfig: SuiteConfig;
let oasSchema: OASSchema;
operationResult.set(
  '/findTheRing:GET',
  new Map().set('no-rings-found', {
    failures: { test: 'mockError' },
    warnings: {},
  }),
);
const oasResults = [operationResult, operationResult];

describe('PositiveSuite', () => {
  beforeEach(async () => {
    const json = await loadJsonFile('test/fixtures/oas/forms_oas.json');
    oasSchema = new OASSchema({
      spec: json,
    });
    suiteConfig = {
      options: {
        path: 'https://westeros.stormsend/underground/scrolls/catacombs/v0/openapi.json',
        server: 'https://sandbox-api.va.gov/services/va_forms/{version}',
      },
      schema: oasSchema,
      securityValues: {},
    };
  });

  describe('conduct', () => {
    it('calls positive validation conductor and returns results', async () => {
      const suite = new PositiveSuite(suiteConfig);

      expect(await suite.conduct()).toEqual(oasResults);
    });
  });

  describe('getLabel', () => {
    it('returns label', () => {
      const suite = new PositiveSuite(suiteConfig);

      expect(suite.getLabel()).toEqual('(Example Group: 2xx Response)');
    });
  });
});
