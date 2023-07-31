import ExampleGroup from '../example-group/example-group';
import OASOperation from '../operation/oas-operation';
import OperationExample from './operation-example';

export default class OperationExampleFactory {
  public static buildFromOperations(
    operations: OASOperation[],
  ): OperationExample[] {
    let operationExamples: OperationExample[] = [];

    operations.forEach((operation) => {
      operationExamples = [
        ...operationExamples,
        ...this.buildFromOperation(operation),
      ];
    });

    return operationExamples;
  }

  private static buildFromOperation(
    operation: OASOperation,
  ): OperationExample[] {
    let operationExamples: OperationExample[] = [];

    operation.exampleGroups.forEach((exampleGroup) => {
      operationExamples = [
        ...operationExamples,
        ...this.buildFromOperationAndExampleGroup(operation, exampleGroup),
      ];
    });

    return operationExamples;
  }

  private static buildFromOperationAndExampleGroup(
    operation: OASOperation,
    exampleGroup: ExampleGroup,
  ): OperationExample[] {
    const operationExamples: OperationExample[] = [];

    operation.exampleRequestBodies.forEach((exampleRequestBody) => {
      operationExamples.push(
        new OperationExample(operation, exampleGroup, exampleRequestBody),
      );
    });

    return operationExamples;
  }
}
