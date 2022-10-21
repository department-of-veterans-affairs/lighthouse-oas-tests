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
        apiKey: 'fake_api_key',
      },
      schema: oasSchema,
    };
  });

  describe('conduct', () => {
    it('calls positive validation conductor and returns results', async () => {
      const suite = new PositiveSuite();
      await suite.setup(suiteConfig);

      expect(await suite.conduct()).toEqual(oasResults);
    });

    it('throws an error when no server is provided', async () => {
      const suiteConfigWithoutServer = {
        options: {
          path: 'https://westeros.stormsend/underground/scrolls/catacombs/v0/openapi.json',
          apiKey: 'fake_api_key',
        },
        schema: oasSchema,
      };

      const suite = new PositiveSuite();
      await suite.setup(suiteConfigWithoutServer);

      await expect(suite.conduct()).rejects.toThrow(
        'Server value must be specified if OAS contains more than one server',
      );
    });
  });

  describe('getLabel', () => {
    it('returns label', async () => {
      const suite = new PositiveSuite();
      await suite.setup(suiteConfig);

      expect(suite.getLabel()).toEqual('(Example Group: 2xx Response)');
    });
  });
});
