import {
  oasResultFailure,
  oasResultFailureString,
  oasResultSuccess,
  oasResultSuccessString,
  oasResultWithError,
  oasResultWithErrorString,
  oasResultMixedResults,
  oasResultMixedResultsString,
} from '../fixtures/results/oas-results';

describe('OASResult', () => {
  describe('toString', () => {
    it('returns the expected string when the result is an error', () => {
      expect(oasResultWithError.toString()).toEqual(oasResultWithErrorString);
    });

    it('returns the expected string for a successful result', () => {
      expect(oasResultSuccess.toString()).toEqual(oasResultSuccessString);
    });

    it('returns the expected string for a failed result', () => {
      expect(oasResultFailure.toString()).toEqual(oasResultFailureString);
    });

    it('returns the expected string when there are multiple OperationExampleResults', () => {
      expect(oasResultMixedResults.toString()).toEqual(
        oasResultMixedResultsString,
      );
    });
  });
});
