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
} from '../../fixtures/results/oas-results';
import { mockedSystemTime } from '../../fixtures/system-time';
import StructuredOutputFactory from '../../../src/utilities/structured-output';

describe('StructuredOutputFactory', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern').setSystemTime(mockedSystemTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('buildFromOASResult', () => {
    it('returns the expected structure when the result is an error', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultError),
      ).toEqual(oasResultErrorStructure);
    });

    it('returns the expected structure for a successful result', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultSuccess),
      ).toEqual(oasResultSuccessStructure);
    });

    it('returns the expected structure for a failed result', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultFailure),
      ).toEqual(oasResultFailureStructure);
    });

    it('returns the expected structure when there are multiple OperationExampleResults', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultMixedResults),
      ).toEqual(oasResultMixedResultsStructure);
    });
    it('returns the expected structure when there is one security scheme', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultSingleSecurity),
      ).toEqual(oasResultSingleSecurityStructure);
    });
    it('returns the expected structure when there are multiple security schemes', () => {
      expect(
        StructuredOutputFactory.buildFromOASResult(oasResultSingleSecurity),
      ).toEqual(oasResultSingleSecurityStructure);
    });
  });
});
