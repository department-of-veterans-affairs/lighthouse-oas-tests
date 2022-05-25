import PositiveBatch from '../../src/commands/positive-batch';
import {
  missingPathOASResult,
  missingPathOASResultString,
  oasResultFailure,
  oasResultFailureString,
  oasResultMixedResults,
  oasResultMixedResultsString,
  oasResultSuccess,
  oasResultSuccessString,
  oasResultWithError,
  oasResultWithErrorString,
} from '../fixtures/results/oas-results';

const mockConduct = jest.fn();

jest.mock('../../src/conductors/positive-batch-conductor', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        conduct: mockConduct,
      };
    }),
  };
});

describe('PositiveBatch', () => {
  let result;

  beforeEach(() => {
    result = [];
    jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((val) => result.push(val));

    mockConduct.mockReset();
  });

  describe('all tests pass', () => {
    describe('one test', () => {
      beforeEach(() => {
        mockConduct.mockResolvedValue([oasResultSuccess]);
      });

      it('outputs test results as expected', async () => {
        await PositiveBatch.run(['pathDoesNotMatter.json']);

        expect(result).toEqual([
          oasResultSuccessString + '\n',
          '1/1 test passed\n',
        ]);
      });
    });

    describe('multiple tests', () => {
      beforeEach(() => {
        mockConduct.mockResolvedValue([oasResultSuccess, oasResultSuccess]);
      });

      it('outputs test results as expected', async () => {
        await PositiveBatch.run(['pathDoesNotMatter.json']);

        expect(result).toEqual([
          oasResultSuccessString + '\n',
          oasResultSuccessString + '\n',
          '2/2 tests passed\n',
        ]);
      });
    });
  });

  describe('all tests are skipped', () => {
    describe('one test', () => {
      beforeEach(() => {
        mockConduct.mockResolvedValue([oasResultWithError]);
      });

      it('outputs test results as expected', async () => {
        await expect(async () =>
          PositiveBatch.run(['pathDoesNotMatter.json']),
        ).rejects.toThrow('0/1 test failed; 1/1 test skipped; 0/1 test passed');

        expect(result).toEqual([oasResultWithErrorString + '\n']);
      });
    });
  });

  describe('all tests fail', () => {
    describe('one test', () => {
      beforeEach(() => {
        mockConduct.mockResolvedValue([oasResultFailure]);
      });

      it('outputs test results as expected', async () => {
        await expect(async () =>
          PositiveBatch.run(['pathDoesNotMatter.json']),
        ).rejects.toThrow('1/1 test failed; 0/1 test skipped; 0/1 test passed');

        expect(result).toEqual([oasResultFailureString + '\n']);
      });
    });
  });

  describe('mixed results', () => {
    beforeEach(() => {
      mockConduct.mockResolvedValue([
        oasResultSuccess,
        oasResultFailure,
        oasResultMixedResults,
        missingPathOASResult,
      ]);
    });

    it('outputs test results as expected', async () => {
      await expect(async () =>
        PositiveBatch.run(['pathDoesNotMatter.json']),
      ).rejects.toThrow(
        '2/4 tests failed; 1/4 tests skipped; 1/4 tests passed',
      );

      expect(result).toEqual([
        oasResultSuccessString + '\n',
        oasResultFailureString + '\n',
        oasResultMixedResultsString + '\n',
        missingPathOASResultString + '\n',
      ]);
    });
  });
});
