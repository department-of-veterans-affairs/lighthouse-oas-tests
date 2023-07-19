import OASOperation from '../operation/oas-operation';
import OperationExample from './operation-example';

export default class OperationExampleFactory {
  public static buildFromOperations(
    operations: OASOperation[],
  ): OperationExample[] {
    const operationExamples: OperationExample[] = [];

    for (const operation of operations) {
      const exampleGroups = operation.exampleGroups;
      const exampleRequestBodies = operation.exampleRequestBodies;

      for (const exampleGroup of exampleGroups) {
        for (const exampleRequestBody of exampleRequestBodies) {
          operationExamples.push(
            new OperationExample(operation, exampleGroup, exampleRequestBody),
          );
        }
      }
    }

    return operationExamples;
  }
}
