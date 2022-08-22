import SuitesBatch from '../../src/commands/suites-batch';
import {
  oasResultMissingPath,
  oasResultMissingPathString,
  oasResultFailure,
  oasResultFailureString,
  oasResultMixedResults,
  oasResultMixedResultsString,
  oasResultSuccess,
  oasResultSuccessString,
  oasResultError,
  oasResultErrorString,
} from '../fixtures/validation/oas-results';
import { FileIn } from '../../src/utilities/file-in';
jest.mock('../../src/utilities/file-in/file-in');

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

describe('SuitesBatch', () => {
  let result;

  beforeEach(() => {
    result = [];
    jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((val) => result.push(val));

    FileIn.loadConfigFromFile = jest.fn().mockReturnValue({
      api_one: { path: 'path', apiKey: 'fakeKey' },
    });

    mockGetResults.mockReset();
  });

  describe('all tests pass', () => {
    describe('one test', () => {
      beforeEach(() => {
        mockGetResults.mockResolvedValue([oasResultSuccess]);
      });

      it('outputs test results as expected', async () => {
        await SuitesBatch.run(['pathDoesNotMatter.json']);

        expect(result).toEqual([
          `${oasResultSuccessString}\n`,
          '1/1 test passed\n',
        ]);
      });
    });

    describe('multiple tests', () => {
      beforeEach(() => {
        mockGetResults.mockResolvedValue([oasResultSuccess]);
        FileIn.loadConfigFromFile = jest.fn().mockReturnValue({
          api_one: { path: 'path', apiKey: 'fakeKey' },
          api_two: { path: 'path', apiKey: 'fakeKey' },
        });
      });

      it('outputs test results as expected', async () => {
        await SuitesBatch.run(['pathDoesNotMatter.json']);

        expect(result).toEqual([
          `${oasResultSuccessString}\n`,
          '1/1 test passed\n',
          `${oasResultSuccessString}\n`,
          '1/1 test passed\n',
        ]);
      });
    });
  });

  describe('all tests are skipped', () => {
    describe('one test', () => {
      beforeEach(() => {
        mockGetResults.mockResolvedValue([oasResultError]);
      });

      it('outputs test results as expected', async () => {
        await SuitesBatch.run(['pathDoesNotMatter.json']);

        expect(result).toEqual([
          `${oasResultErrorString}\n`,
          `0/1 test failed; 1/1 test skipped; 0/1 test passed\n`,
        ]);
      });
    });
  });

  describe('all tests fail', () => {
    describe('one test', () => {
      beforeEach(() => {
        mockGetResults.mockResolvedValue([oasResultFailure]);
      });

      it('outputs test results as expected', async () => {
        await SuitesBatch.run(['pathDoesNotMatter.json']);

        expect(result).toEqual([
          `${oasResultFailureString}\n`,
          `1/1 test failed; 0/1 test skipped; 0/1 test passed\n`,
        ]);
      });
    });
  });

  describe('mixed results', () => {
    beforeEach(() => {
      mockGetResults
        .mockResolvedValueOnce([oasResultSuccess])
        .mockResolvedValueOnce([oasResultFailure])
        .mockResolvedValueOnce([oasResultMixedResults])
        .mockResolvedValueOnce([oasResultMissingPath]);

      FileIn.loadConfigFromFile = jest.fn().mockReturnValue({
        api_one: { path: 'path', apiKey: 'fakeKey' },
        api_two: { path: 'path', apiKey: 'fakeKey' },
        api_three: { path: 'path', apiKey: 'fakeKey' },
        api_four: { path: 'path', apiKey: 'fakeKey' },
      });
    });

    it('outputs test results as expected', async () => {
      await SuitesBatch.run(['pathDoesNotMatter.json']);

      expect(result).toEqual([
        `${oasResultSuccessString}\n`,
        '1/1 test passed\n',
        `${oasResultFailureString}\n`,
        '1/1 test failed; 0/1 test skipped; 0/1 test passed\n',
        `${oasResultMixedResultsString}\n`,
        '1/1 test failed; 0/1 test skipped; 0/1 test passed\n',
        `${oasResultMissingPathString}\n`,
        '0/1 test failed; 1/1 test skipped; 0/1 test passed\n',
      ]);
    });
  });
});
