import {
  oasResultFailure,
  oasResultFailureString,
  oasResultSuccess,
  oasResultSuccessString,
  oasResultError,
  oasResultErrorString,
  oasResultMixedResults,
  oasResultMixedResultsString,
} from '../fixtures/validation/oas-results';

describe('OASResult', () => {
  describe('toString', () => {
    it('returns the expected string when the result is an error', () => {
      expect(oasResultError.toString()).toEqual(oasResultErrorString);
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
