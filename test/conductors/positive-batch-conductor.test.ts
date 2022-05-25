import { PositiveBatchConductor } from '../../src/conductors';
import FileIn from '../../src/utilities/file-in';
import { configWithOneMissingPath } from '../fixtures/configs/configs';
import {
  missingPathOASResult,
  oasResultWithError,
  oasResultMixedResults,
} from '../fixtures/results/oas-results';

const mockConduct = jest.fn();
const mockLoadConfigFromFile = jest.fn();

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

describe('PositiveBatchConductor', () => {
  beforeEach(() => {
    mockConduct.mockReset();
    mockLoadConfigFromFile.mockReset();

    FileIn.loadConfigFromFile = mockLoadConfigFromFile;
  });

  describe('constructor', () => {
    it('loads the config from a file', () => {
      // eslint-disable-next-line no-new
      new PositiveBatchConductor('config.json');
      expect(mockLoadConfigFromFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('conduct', () => {
    it('returns an OAS result for each configuration', async () => {
      mockLoadConfigFromFile.mockReturnValue(configWithOneMissingPath);
      mockConduct.mockResolvedValueOnce(oasResultMixedResults);
      mockConduct.mockRejectedValueOnce(
        new Error(
          'Server value must be specified if OAS contains more than one server',
        ),
      );

      const positiveBatchConductor = new PositiveBatchConductor('config.json');
      const results = await positiveBatchConductor.conduct();

      expect(results.length).toBe(3);
      expect(results).toContainEqual(missingPathOASResult);
      expect(results).toContainEqual(oasResultMixedResults);
      expect(results).toContainEqual(oasResultWithError);
    });
  });
});
