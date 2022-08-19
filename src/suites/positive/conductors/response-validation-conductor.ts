import { Response } from 'swagger-client';
import OASOperation from '../../../oas-parsing/operation';
import Message from '../../../validation/message';
import { ResponseValidator } from '../validation';
import PositiveMessage, { Type } from '../validation/positive-message';

export default class ResponseValidationConductor {
  private response: Response;

  private operation: OASOperation;

  constructor(response: Response, operation: OASOperation) {
    this.response = response;
    this.operation = operation;
  }

  validate(): [Map<string, Message>, Map<string, Message>] {
    let failures: Map<string, Message> = new Map();
    let warnings: Map<string, Message> = new Map();

    if (this.response.ok) {
      const responseValidator = new ResponseValidator(
        this.operation,
        this.response,
      );

      responseValidator.validate();
      failures = responseValidator.failures;
      warnings = responseValidator.warnings;
    } else {
      const message = new PositiveMessage(
        Type.InvalidResponse,
        [],
        [this.response.status?.toString()],
      );

      failures.set(message.hash, message);
    }

    return [failures, warnings];
  }
}
