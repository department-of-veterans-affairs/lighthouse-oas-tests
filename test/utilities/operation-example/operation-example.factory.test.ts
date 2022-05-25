import { OperationExampleFactory } from '../../../src/utilities/operation-example';
import {
  harryPotterOperation,
  heWhoMustNotBeNamedOperation,
} from '../../fixtures/utilities/oas-operations';
import {
  harryPotterDefaultOperationExample,
  heWhoMustNotBeNamedDefaultOperationExample,
  heWhoMustNotBeNamedTomRiddleOperationExample,
} from '../../fixtures/utilities/operation-examples';

describe('OperationExampleFactory', () => {
  describe('buildFromOperations', () => {
    it('returns the expected OperationExamples', () => {
      const operationExamples = OperationExampleFactory.buildFromOperations([
        harryPotterOperation,
        heWhoMustNotBeNamedOperation,
      ]);
      expect(operationExamples).toHaveLength(3);
      expect(operationExamples).toContainEqual(
        harryPotterDefaultOperationExample,
      );
      expect(operationExamples).toContainEqual(
        heWhoMustNotBeNamedDefaultOperationExample,
      );
      expect(operationExamples).toContainEqual(
        heWhoMustNotBeNamedTomRiddleOperationExample,
      );
    });
  });
});
