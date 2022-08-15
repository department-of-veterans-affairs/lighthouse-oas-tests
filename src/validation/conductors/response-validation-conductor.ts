import { Response } from 'swagger-client';
import OASOperation from '../../oas-parsing/operation';
import { ResponseValidator } from '../validators';
import ValidationMessage, { Type } from '../validation-message';

export default class ResponseValidationConductor {
  private response: Response;

  private operation: OASOperation;

  constructor(response: Response, operation: OASOperation) {
    this.response = response;
    this.operation = operation;
  }

  validate(): [Map<string, ValidationMessage>, Map<string, ValidationMessage>] {
    let failures: Map<string, ValidationMessage> = new Map();
    let warnings: Map<string, ValidationMessage> = new Map();

    if (this.response.ok) {
      const responseValidator = new ResponseValidator(
        this.operation,
        this.response,
      );

      responseValidator.validate();
      failures = responseValidator.failures;
      warnings = responseValidator.warnings;
    } else {
      const messageMessage = new ValidationMessage(
        Type.InvalidResponse,
        [],
        [this.response.status?.toString()],
      );

      failures.set(messageMessage.hash, messageMessage);
    }

    return [failures, warnings];
  }
}
