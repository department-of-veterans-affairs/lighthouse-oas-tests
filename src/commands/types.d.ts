import { Response } from 'swagger-client';
import SecurityFailure from '../security-failures/security-failure';
import ExampleGroup from '../utilities/example-group';
import OASOperation from '../utilities/oas-operation';
import { ValidationFailure } from '../validation-failures';

export interface OperationResponse {
  [operationExampleId: string]: Response;
}

export interface OperationFailures {
  [operationExampleId: string]: ValidationFailure[];
}

export interface SecurityFailures {
  [securityFailureId: string]: SecurityFailure[];
}

export interface OperationExample {
  id: string;
  operation: OASOperation;
  exampleGroup: ExampleGroup;
}
