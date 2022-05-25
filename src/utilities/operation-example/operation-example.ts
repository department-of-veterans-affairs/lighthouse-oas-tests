import { RequestBody } from 'swagger-client';
import ExampleGroup from '../example-group/example-group';
import OASOperation from '../oas-operation/oas-operation';

export default class OperationExample {
  readonly id: string;

  readonly operation: OASOperation;

  readonly exampleGroup: ExampleGroup;

  readonly requestBody: RequestBody;

  constructor(
    id: string,
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    requestBody: RequestBody,
  ) {
    this.id = id;
    this.operation = operation;
    this.exampleGroup = exampleGroup;
    this.requestBody = requestBody;
  }
}
