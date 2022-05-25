import {
  harryPotterDefaultOperationExampleResult,
  harryPotterDefaultResultString,
  heWhoMustNotBeNamedVoldermortOperationExampleResult,
  heWhoMustNotBeNamedVoldermortResultString,
} from '../fixtures/results/operation-example-results';

describe('OperationExampleResult', () => {
  describe('toString', () => {
    it('returns the expected string when the operation fails', () => {
      expect(harryPotterDefaultOperationExampleResult.toString()).toEqual(
        harryPotterDefaultResultString,
      );
    });

    it('returns the expected string when the operation succeeds', () => {
      expect(
        heWhoMustNotBeNamedVoldermortOperationExampleResult.toString(),
      ).toEqual(heWhoMustNotBeNamedVoldermortResultString);
    });
  });
});
