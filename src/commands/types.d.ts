import { Response } from 'swagger-client';
import SecurityFailure from '../security-failures/security-failure';
import ExampleGroup from '../utilities/example-group';
import OASOperation from '../utilities/oas-operation';
import { ValidationFailure } from '../validation-messages/failures';
import { ValidationWarning } from '../validation-messages/warnings';

export interface OperationResponse {
  [operationExampleId: string]: Response;
}

export interface OperationFailures {
  [operationExampleId: string]: ValidationFailure[];
}

export interface SecurityFailures {
  [securityFailureId: string]: SecurityFailure[];
}

export interface OperationWarnings {
  [operationExampleId: string]: ValidationWarning[];
}

export interface OperationExample {
  id: string;
  operation: OASOperation;
  exampleGroup: ExampleGroup;
}
