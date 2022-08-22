import { TestOptions } from '../src/config';
import { OASResult } from '../src/validation';
import SuiteFactory from '../src/suites/suite-factory';
import PositiveSuite from '../src/suites/positive/positive-suite';
import { securitySchemeAPIKey } from './fixtures/utilities/oas-security-schemes';
import { operationExampleResultFailuresWarnings } from './fixtures/validation/operation-results';
import { FileIn } from '../src/utilities/file-in';
import { Loast } from '../src';

const mockGetServers = jest.fn();
const mockGetRelevantSecuritySchemes = jest.fn();
const mockGetOperations = jest.fn();

jest.mock('../src/utilities/file-in/file-in');
jest.mock('../src/suites/suite-factory');

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
      apiKey: 'fake-key',
      loastType: [PositiveSuite.suiteId],
    };

    expectedOASResult = new OASResult(
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
        path: 'path',
        apiKey: 'fakeKey',
        loastType: [PositiveSuite.suiteId],
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

    mockGetRelevantSecuritySchemes.mockResolvedValue([securitySchemeAPIKey]);
  });

  describe('getResults', () => {
    it('test api with a single suite', async () => {
      const results = await new Loast('winterfell', options).getResults();

      expect(results.length).toEqual(1);
      expect(results[0]).toEqual(expectedOASResult);
    });

    it('test api with multiple suites', async () => {
      options.loastType = [PositiveSuite.suiteId, PositiveSuite.suiteId];
      const results = await new Loast('winterfell', options).getResults();

      expect(results.length).toEqual(2);
      expect(results[0]).toEqual(expectedOASResult);
      expect(results[1]).toEqual(expectedOASResult);
    });

    it('test api with all test suites', async () => {
      options.loastType = undefined;
      const totalSuites = SuiteFactory.availableSuiteIds();
      const results = await new Loast('test', options).getResults();

      expect(results.length).toEqual(totalSuites.length);
    });
  });
});
