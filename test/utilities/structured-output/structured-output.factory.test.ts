import {
  oasResultFailure,
  oasResultFailureStructure,
  oasResultSuccess,
  oasResultSuccessStructure,
  oasResultError,
  oasResultErrorStructure,
  oasResultMixedResults,
  oasResultMixedResultsStructure,
  oasResultSingleSecurity,
  oasResultSingleSecurityStructure,
} from '../../fixtures/validation/oas-results';
import { mockedSystemTime } from '../../fixtures/system-time';
import JSONStructuredOutputFactory from '../../../src/utilities/structured-output';

describe('JSONStructuredOutputFactory', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern').setSystemTime(mockedSystemTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('buildFromOASResult', () => {
    it('returns the expected structure when the result is an error', () => {
      expect(
        JSONStructuredOutputFactory.buildFromOASResult(oasResultError),
      ).toEqual(oasResultErrorStructure);
    });

    it('returns the expected structure for a successful result', () => {
      expect(
        JSONStructuredOutputFactory.buildFromOASResult(oasResultSuccess),
      ).toEqual(oasResultSuccessStructure);
    });

    it('returns the expected structure for a failed result', () => {
      expect(
        JSONStructuredOutputFactory.buildFromOASResult(oasResultFailure),
      ).toEqual(oasResultFailureStructure);
    });

    it('returns the expected structure when there are multiple OperationExampleResults', () => {
      expect(
        JSONStructuredOutputFactory.buildFromOASResult(oasResultMixedResults),
      ).toEqual(oasResultMixedResultsStructure);
    });
    it('returns the expected structure when there is one security scheme', () => {
      expect(
        JSONStructuredOutputFactory.buildFromOASResult(oasResultSingleSecurity),
      ).toEqual(oasResultSingleSecurityStructure);
    });
    it('returns the expected structure when there are multiple security schemes', () => {
      expect(
        JSONStructuredOutputFactory.buildFromOASResult(oasResultSingleSecurity),
      ).toEqual(oasResultSingleSecurityStructure);
    });
  });
});
