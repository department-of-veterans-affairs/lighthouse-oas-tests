import {
  operationExampleResultFailuresWarnings,
  operationExampleResultFailuresWarningsString,
  operationExampleResultNoFailuresWarnings,
  operationExampleResultNoFailuresWarningsString,
} from '../fixtures/validation/operation-results';

describe('OperationResult', () => {
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
