import { RequestBody } from 'swagger-client';
import ExampleGroup from '../example-group/example-group';
import OASOperation from '../oas-operation/oas-operation';

export default class OperationExample {
  readonly operation: OASOperation;

  readonly exampleGroup: ExampleGroup;

  readonly requestBody: RequestBody;

  constructor(
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    requestBody: RequestBody,
  ) {
    this.operation = operation;
    this.exampleGroup = exampleGroup;
    this.requestBody = requestBody;
  }
}
