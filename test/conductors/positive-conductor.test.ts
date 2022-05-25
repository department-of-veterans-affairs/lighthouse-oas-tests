import { PositiveConductor } from '../../src/conductors';
import FileIn from '../../src/utilities/file-in';
import { OperationExampleFactory } from '../../src/utilities/operation-example';
import {
  harryPotterDefaultOperationExampleResult,
  heWhoMustNotBeNamedTomRiddleOperationExampleResult,
  heWhoMustNotBeNamedVoldermortOperationExampleResult,
} from '../fixtures/results/operation-example-results';
import { apiKeyScheme } from '../fixtures/utilities/oas-security-schemes';
import {
  chamberOfSecretsServer,
  prisonerOfAzkabanServer,
} from '../fixtures/utilities/oas-servers';
import {
  harryPotterDefaultOperationExample,
  heWhoMustNotBeNamedTomRiddleOperationExample,
  heWhoMustNotBeNamedDefaultOperationExample,
} from '../fixtures/utilities/operation-examples';

const mockGetServers = jest.fn();
const mockGetRelevantSecuritySchemes = jest.fn();
const mockGetOperations = jest.fn();

const mockBuildFromOperations = jest.fn();

const mockValidate = jest.fn();

jest.mock('../../src/utilities/oas-schema', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getServers: mockGetServers,
      getRelevantSecuritySchemes: mockGetRelevantSecuritySchemes,
      getOperations: mockGetOperations,
    };
  };
});

jest.mock('../../src/validation-conductors/validation-conductor', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        validate: mockValidate,
      };
    }),
  };
});

describe('PositiveConductor', () => {
  beforeEach(() => {
    mockGetServers.mockReset();
    mockGetRelevantSecuritySchemes.mockReset();
    mockGetOperations.mockReset();

    mockBuildFromOperations.mockReset();
    OperationExampleFactory.buildFromOperations = mockBuildFromOperations;

    mockValidate.mockReset();
  });

  describe('constructor', () => {
    it('loads the spec from a file', () => {
      FileIn.loadSpecFromFile = jest.fn();
      const testOptions = { path: 'filePath.json' };
      // eslint-disable-next-line no-new
      new PositiveConductor('test', testOptions);
      expect(FileIn.loadSpecFromFile).toHaveBeenCalledTimes(1);
    });

    it('does not load spec from file when a URL is specified', () => {
      FileIn.loadSpecFromFile = jest.fn();
      const testOptions = { path: 'https://the-sorcerers-stone.com/docs' };
      // eslint-disable-next-line no-new
      new PositiveConductor('test', testOptions);
      expect(FileIn.loadSpecFromFile).not.toHaveBeenCalled();
    });
  });

  describe('conduct', () => {
    describe('validateServerOption', () => {
      beforeEach(() => {
        mockGetServers.mockResolvedValue([
          chamberOfSecretsServer,
          prisonerOfAzkabanServer,
        ]);
      });

      it('throws an error if there is more than one server and the server option is missing', async () => {
        const testOptions = { path: 'https://the-sorcerers-stone.com/docs' };
        const positiveConductor = new PositiveConductor('test', testOptions);
        await expect(async () => positiveConductor.conduct()).rejects.toThrow(
          new Error(
            'Server value must be specified if OAS contains more than one server',
          ),
        );
      });

      it('throws an error if the server option is not valid', async () => {
        const testOptions = {
          path: 'https://the-sorcerers-stone.com/docs',
          server: 'https://the-goblet-of-fire.com',
        };
        const positiveConductor = new PositiveConductor('test', testOptions);
        await expect(async () => positiveConductor.conduct()).rejects.toThrow(
          new Error(
            'Server value must match one of the server URLs in the OAS',
          ),
        );
      });

      it('does not throw an error if the server option is valid', () => {
        mockGetRelevantSecuritySchemes.mockResolvedValue([]);
        mockBuildFromOperations.mockReturnValue([]);

        const testOptions = {
          path: 'https://the-sorcerers-stone.com/docs',
          server: 'https://the-prisoner-of-azkaban.com',
        };
        const positiveConductor = new PositiveConductor('test', testOptions);
        expect(async () => positiveConductor.conduct()).not.toThrow();
      });
    });

    it('returns an OASResult', async () => {
      mockGetServers.mockResolvedValue([chamberOfSecretsServer]);
      mockGetRelevantSecuritySchemes.mockResolvedValue([apiKeyScheme]);

      mockBuildFromOperations.mockReturnValue([
        harryPotterDefaultOperationExample,
        heWhoMustNotBeNamedTomRiddleOperationExample,
        heWhoMustNotBeNamedDefaultOperationExample,
      ]);

      mockValidate.mockResolvedValueOnce(
        harryPotterDefaultOperationExampleResult,
      );
      mockValidate.mockResolvedValueOnce(
        heWhoMustNotBeNamedTomRiddleOperationExampleResult,
      );
      mockValidate.mockResolvedValueOnce(
        heWhoMustNotBeNamedVoldermortOperationExampleResult,
      );

      const testOptions = {
        path: 'https://the-sorcerers-stone.com/docs',
        apiKey: 'key',
      };
      const positiveConductor = new PositiveConductor('test', testOptions);

      const oasResult = await positiveConductor.conduct();

      expect(oasResult.testName).toEqual('test');
      expect(oasResult.results?.length).toBe(3);
      expect(oasResult.results).toContainEqual(
        harryPotterDefaultOperationExampleResult,
      );
      expect(oasResult.results).toContainEqual(
        heWhoMustNotBeNamedTomRiddleOperationExampleResult,
      );
      expect(oasResult.results).toContainEqual(
        heWhoMustNotBeNamedVoldermortOperationExampleResult,
      );
      expect(oasResult.error).toBeUndefined();
    });
  });
});
