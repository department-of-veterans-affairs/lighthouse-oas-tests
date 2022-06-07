import OASOperation from '../oas-operation/oas-operation';
import OperationExample from './operation-example';

export default class OperationExampleFactory {
  public static buildFromOperations(
    operations: OASOperation[],
  ): OperationExample[] {
    const operationExamples: OperationExample[] = [];

    for (const operation of operations) {
      const exampleGroups = operation.exampleGroups;

      for (const exampleGroup of exampleGroups) {
        operationExamples.push({
          operation,
          exampleGroup,
          requestBody: operation.exampleRequestBody,
        });
      }
    }

    return operationExamples;
  }
}
