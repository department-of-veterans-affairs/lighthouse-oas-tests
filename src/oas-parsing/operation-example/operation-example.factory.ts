/**
 * The OperationExampleFactory class is responsible for building OperationExamples for all Operations that are part of the OAS under test.
 * An Operation could potentially have both multiple ExampleGroups (query, path, or header parameters)
 * and multiple ExampleRequestBodies (a request body with only required fields and a request body with required and optional fields).
 * OperationExamples will be created for each permutation of ExampleGroups and ExampleRequestBodies
 * (if an Operation has 2 ExampleGroups and 2 ExampleRequestBodies, then 4 OperationExamples will be created for that Operation).
 */

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
