import Positive from '../../src/commands/positive';
import {
  oasResultSuccess,
  oasResultSuccessString,
  oasResultFailure,
  oasResultFailureString,
  oasResultMixedResults,
  oasResultMixedResultsString,
} from '../fixtures/results/oas-results';

const mockConduct = jest.fn();

jest.mock('../../src/conductors/positive-conductor', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        conduct: mockConduct,
      };
    }),
  };
});

describe('Positive', () => {
  let result;

  beforeEach(() => {
    result = [];
    jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((val) => result.push(val));

    mockConduct.mockReset();
  });

  it('throws an error when PositiveConductor encounters an error', async () => {
    const errorMessage =
      'Token is undefined or empty but required by the bearer_token security';
    mockConduct.mockRejectedValue(new Error(errorMessage));

    await expect(async () =>
      Positive.run(['pathDoesNotMatter.json']),
    ).rejects.toThrow(errorMessage);
  });

  describe('all OperationExamples pass', () => {
    it('outputs test results as expected', async () => {
      mockConduct.mockResolvedValue(oasResultSuccess);

      await Positive.run(['pathDoesNotMatter.json']);

      expect(result).toEqual([oasResultSuccessString + '\n']);
    });
  });

  describe('all OperationExamples fail', () => {
    it('outputs test results as expected', async () => {
      mockConduct.mockResolvedValue(oasResultFailure);

      await expect(async () =>
        Positive.run(['pathDoesNotMatter.json']),
      ).rejects.toThrow('1/1 operation failed; 0/1 operation passed');

      expect(result).toEqual([oasResultFailureString + '\n']);
    });
  });

  describe('mixed results', () => {
    it('outputs test results as expected', async () => {
      mockConduct.mockResolvedValue(oasResultMixedResults);

      await expect(async () =>
        Positive.run(['pathDoesNotMatter.json']),
      ).rejects.toThrow('2/3 operations failed; 1/3 operations passed');

      expect(result).toEqual([oasResultMixedResultsString + '\n']);
    });
  });
});
