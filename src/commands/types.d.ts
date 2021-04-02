import { Response } from 'swagger-client';
import ExampleGroup from '../utilities/example-group';
import OASOperation from '../utilities/oas-operation';
import { ValidationFailure } from '../validation-failures';

export interface OperationResponse {
  [operationExampleId: string]: Response;
}

export interface OperationFailures {
  [operationExampleId: string]: ValidationFailure[];
}

export interface OperationExample {
  id: string;
  operation: OASOperation;
  exampleGroup: ExampleGroup;
}
