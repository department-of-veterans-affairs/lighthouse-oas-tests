import ExampleGroup from '../example-group/example-group';
import OASOperation from '../operation/oas-operation';
import OperationExample from './operation-example';

export default class OperationExampleFactory {
  public static buildFromOperations(
    operations: OASOperation[],
  ): OperationExample[] {
    return operations.flatMap((operation) =>
      this.buildFromOperation(operation),
    );
  }

  private static buildFromOperation(
    operation: OASOperation,
  ): OperationExample[] {
    return operation.exampleGroups.flatMap((exampleGroup) =>
      this.buildFromOperationAndExampleGroup(operation, exampleGroup),
    );
  }

  private static buildFromOperationAndExampleGroup(
    operation: OASOperation,
    exampleGroup: ExampleGroup,
  ): OperationExample[] {
    return operation.exampleRequestBodies.map(
      (exampleRequestBody) =>
        new OperationExample(operation, exampleGroup, exampleRequestBody),
    );
  }
}
