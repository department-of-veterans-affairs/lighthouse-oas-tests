import {
  oasResultFailure,
  oasResultFailureStructure,
  oasResultSuccess,
  oasResultSuccessStructure,
  oasResultError,
  oasResultErrorStructure,
  oasResultMixedResults,
  oasResultMixedResultsStructure,
} from '../../fixtures/results/oas-results';
import StructuredOutputFactory from '../../../src/utilities/structured-output';
import { MOCKED_SYSTEM_TIME } from '../constants';

describe('StructuredOutputFactory', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern').setSystemTime(MOCKED_SYSTEM_TIME);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('buildFromOASResult', () => {
    xit('returns the expected structure when the result is an error', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultError),
      ).toEqual(oasResultErrorStructure);
    });

    it('returns the expected structure for a successful result', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultSuccess),
      ).toEqual(oasResultSuccessStructure);
    });

    xit('returns the expected structure for a failed result', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultFailure),
      ).toEqual(oasResultFailureStructure);
    });

    xit('returns the expected structure when there are multiple OperationExampleResults', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultMixedResults),
      ).toEqual(oasResultMixedResultsStructure);
    });
  });
});
