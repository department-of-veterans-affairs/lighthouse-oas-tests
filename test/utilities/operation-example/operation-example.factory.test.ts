import { OperationExampleFactory } from '../../../src/utilities/operation-example';
import {
  operationSimpleGet,
  operationGetWithExampleGroups,
} from '../../fixtures/utilities/oas-operations';
import {
  operationExampleSimpleGetDefault,
  operationExampleDefaultExGroup,
  operationExampleTomRiddleExGroup,
} from '../../fixtures/utilities/operation-examples';

describe('OperationExampleFactory', () => {
  describe('buildFromOperations', () => {
    it('returns the expected OperationExamples', () => {
      const operationExamples = OperationExampleFactory.buildFromOperations([
        operationSimpleGet,
        operationGetWithExampleGroups,
      ]);
      expect(operationExamples).toHaveLength(3);
      expect(operationExamples).toContainEqual(
        operationExampleSimpleGetDefault,
      );
      expect(operationExamples).toContainEqual(operationExampleDefaultExGroup);
      expect(operationExamples).toContainEqual(
        operationExampleTomRiddleExGroup,
      );
    });
  });
});
