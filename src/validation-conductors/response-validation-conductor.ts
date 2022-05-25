import { Response } from 'swagger-client';
import OASOperation from '../utilities/oas-operation';
import { ResponseValidator } from '../utilities/validators';
import {
  InvalidResponse,
  ValidationFailure,
} from '../validation-messages/failures';
import { ValidationWarning } from '../validation-messages/warnings';

export default class ResponseValidationConductor {
  readonly response: Response;

  readonly operation: OASOperation;

  constructor(response: Response, operation: OASOperation) {
    this.response = response;
    this.operation = operation;
  }

  validate(): [Map<string, ValidationFailure>, Map<string, ValidationWarning>] {
    let failures: Map<string, ValidationFailure> = new Map();
    let warnings: Map<string, ValidationWarning> = new Map();

    if (this.response.ok) {
      const responseValidator = new ResponseValidator(
        this.operation,
        this.response,
      );

      responseValidator.validate();
      failures = responseValidator.failures;
      warnings = responseValidator.warnings;
    } else {
      const failure = new InvalidResponse(this.response.status);
      failures.set(failure.hash, failure);
    }

    return [failures, warnings];
  }
}
