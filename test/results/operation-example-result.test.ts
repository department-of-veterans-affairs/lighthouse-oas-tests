import {
  operationExampleResultFailuresWarnings,
  operationExampleResultFailuresWarningsString,
  operationExampleResultNoFailuresWarnings,
  operationExampleResultNoFailuresWarningsString,
} from '../fixtures/results/operation-example-results';

describe('OperationExampleResult', () => {
  describe('toString', () => {
    it('returns the expected string when the operation fails', () => {
      expect(operationExampleResultFailuresWarnings.toString()).toEqual(
        operationExampleResultFailuresWarningsString,
      );
    });

    it('returns the expected string when the operation succeeds', () => {
      expect(operationExampleResultNoFailuresWarnings.toString()).toEqual(
        operationExampleResultNoFailuresWarningsString,
      );
    });
  });
});
