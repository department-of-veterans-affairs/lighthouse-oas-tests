import { TestOptions } from '../src/config';
import { OASResult } from '../src/validation';
import SuiteFactory from '../src/suites/suite-factory';
import PositiveSuite from '../src/suites/positive/positive-suite';
import OasRulesetSuite from '../src/suites/rulesets/ruleset-suite';
import { securitySchemeAPIKey } from './fixtures/utilities/oas-security-schemes';
import { operationExampleResultFailuresWarnings } from './fixtures/validation/operation-results';
import { FileIn } from '../src/utilities/file-in';
import { Loast } from '../src';
import { MissingSecuritySchemeError } from '../src/Errors/MissingSecuritySchemeError';

const mockGetServers = jest.fn();
const mockGetRelevantSecuritySchemes = jest.fn();
const mockGetOperations = jest.fn();

jest.mock('../src/utilities/file-in/file-in');

jest.mock('../src/oas-parsing/schema', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getServers: mockGetServers,
      getRelevantSecuritySchemes: mockGetRelevantSecuritySchemes,
      getOperations: mockGetOperations,
    };
  };
});

let options: TestOptions;
let expectedOASResult: OASResult;

describe('Loast', () => {
  beforeEach(() => {
    options = {
      path: 'https://westeros.dragonstone/underground/scrolls/catacombs/v0/openapi.json',
      server: 'https://westeros.dragonstone/v1/{version}',
      apiKey: 'fake-key',
      suiteIds: [PositiveSuite.suiteId],
    };

    expectedOASResult = new OASResult(
      PositiveSuite.suiteId,
      'winterfell stronghold',
      options.path,
      options.server,
      [securitySchemeAPIKey],
      [operationExampleResultFailuresWarnings],
      undefined,
    );

    mockGetServers.mockReset();
    mockGetRelevantSecuritySchemes.mockReset();
    mockGetOperations.mockReset();

    FileIn.loadConfigFromFile = jest.fn().mockReturnValue({
      api_one: {
        path: 'https://westeros.dragonstone/underground/scrolls/catacombs/v0/openapi.json',
        server: 'https://westeros.dragonstone/v1/{version}',
        apiKey: 'fakeKey',
        suiteIds: [PositiveSuite.suiteId],
      },
    });

    SuiteFactory.build = jest.fn().mockReturnValue({
      getLabel: jest.fn().mockReturnValue('stronghold'),
      conduct: jest
        .fn()
        .mockResolvedValue([operationExampleResultFailuresWarnings]),
    });
    SuiteFactory.availableSuiteIds = jest
      .fn()
      .mockReturnValue([PositiveSuite.suiteId, 'validation', 'lint']);

    mockGetRelevantSecuritySchemes.mockResolvedValue({
      relevantSecuritySchemes: [securitySchemeAPIKey],
      missingSecuritySchemes: [],
    });
  });

  describe('getResults', () => {
    it('test api with a single suite', async () => {
      const results = await new Loast('winterfell', options).getResults();

      expect(results.length).toEqual(1);
      expect(results[0]).toEqual(expectedOASResult);
    });

    it('test api with multiple suites', async () => {
      options.suiteIds = [PositiveSuite.suiteId, OasRulesetSuite.suiteId];
      const results = await new Loast('winterfell', options).getResults();

      expect(results.length).toEqual(2);
      expect(results[0]).toEqual({
        ...expectedOASResult,
        suiteId: PositiveSuite.suiteId,
      });
      expect(results[1]).toEqual({
        ...expectedOASResult,
        suiteId: OasRulesetSuite.suiteId,
      });
    });

    it('test api with invalid positive suite config and valid oas suite', async () => {
      const optionsWithoutServer = {
        path: 'https://westeros.dragonstone/underground/scrolls/catacombs/v0/openapi.json',
        apiKey: 'fake-key',
        suiteIds: [PositiveSuite.suiteId, OasRulesetSuite.suiteId],
      };

      const erroredOASResult = new OASResult(
        PositiveSuite.suiteId,
        'winterfell stronghold',
        options.path,
        undefined,
        [securitySchemeAPIKey],
        undefined,
        'Server value must be specified if OAS contains more than one server',
      );

      SuiteFactory.build = jest.fn().mockReturnValue({
        getLabel: jest.fn().mockReturnValue('stronghold'),
        conduct: jest
          .fn()
          .mockRejectedValueOnce(
            new Error(
              'Server value must be specified if OAS contains more than one server',
            ),
          )
          .mockResolvedValue([operationExampleResultFailuresWarnings]),
      });

      const results = await new Loast(
        'winterfell',
        optionsWithoutServer,
      ).getResults();

      expect(results.length).toEqual(2);
      expect(results[0]).toEqual(erroredOASResult);
      expect(results[1]).toEqual({
        ...expectedOASResult,
        suiteId: OasRulesetSuite.suiteId,
        server: undefined,
      });
    });

    it('test api with all test suites', async () => {
      options.suiteIds = undefined;
      const totalSuites = SuiteFactory.availableSuiteIds();
      const results = await new Loast('test', options).getResults();

      expect(results.length).toEqual(totalSuites.length);
    });

    it('throws an error when there is a missing security scheme', async () => {
      mockGetRelevantSecuritySchemes.mockResolvedValue({
        relevantSecuritySchemes: [],
        missingSecuritySchemes: ['fakeKey'],
      });

      await expect(
        new Loast('winterfell', options).getResults(),
      ).rejects.toThrow(MissingSecuritySchemeError);
    });
  });
});
