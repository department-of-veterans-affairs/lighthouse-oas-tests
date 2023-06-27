import Suites from '../../src/commands/suites';
import {
  oasResultSuccess,
  oasResultSuccessString,
  oasResultFailure,
  oasResultFailureString,
  oasResultMixedResults,
  oasResultMixedResultsString,
  oasResultError,
  oasResultErrorJson,
} from '../fixtures/validation/oas-results';

const mockGetResults = jest.fn();

jest.mock('../../src/loast', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        getResults: mockGetResults,
      };
    }),
  };
});

// ruleset-wrapper needs be mocked to avoid Jest conflict with
//  3rd party packages when they use package.json 'export'
jest.mock('../../src/suites/rulesets/validation/ruleset-wrapper', () => {
  return function (): Record<string, jest.Mock> {
    return {
      getRuleset: jest.fn(),
    };
  };
});

describe('Suites', () => {
  let result;

  beforeEach(() => {
    result = [];
    jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((val) => result.push(val));

    mockGetResults.mockReset();
  });

  describe('when PositiveConductor encounters an error', () => {
    it('throws an error', async () => {
      const errorMessage =
        'Token is undefined or empty but required by the bearer_token security';
      mockGetResults.mockRejectedValue(new Error(errorMessage));

      await expect(async () =>
        Suites.run(['pathDoesNotMatter.json']),
      ).rejects.toThrow(errorMessage);
    });
    it('outputs json structure with empty results', async () => {
      mockGetResults.mockResolvedValue([oasResultError]);

      await Suites.run(['-j', 'pathDoesNotMatter.json']);

      expect(result).toEqual([`${oasResultErrorJson}\n`]);
    });
  });

  describe('all OperationExamples pass', () => {
    it('outputs test results as expected', async () => {
      mockGetResults.mockResolvedValue([oasResultSuccess]);

      await Suites.run(['pathDoesNotMatter.json']);

      expect(result).toEqual([`${oasResultSuccessString}\n`]);
    });
  });

  describe('all OperationExamples fail', () => {
    it('outputs test results as expected', async () => {
      mockGetResults.mockResolvedValue([oasResultFailure]);

      await Suites.run(['pathDoesNotMatter.json']);

      expect(result).toEqual([
        `${oasResultFailureString}\n`,
        `1/1 operation failed; 0/1 operation passed\n`,
      ]);
    });
  });

  describe('mixed results', () => {
    it('outputs test results as expected', async () => {
      mockGetResults.mockResolvedValue([oasResultMixedResults]);

      await Suites.run(['pathDoesNotMatter.json']);

      expect(result).toEqual([
        `${oasResultMixedResultsString}\n`,
        `2/3 operations failed; 1/3 operations passed\n`,
      ]);
    });
  });
});
