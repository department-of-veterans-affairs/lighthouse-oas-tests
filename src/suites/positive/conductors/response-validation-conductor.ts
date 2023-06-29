import { Response } from 'swagger-client';
import OASOperation from '../../../oas-parsing/operation';
import OASSchema from '../../../oas-parsing/schema';
import Message from '../../../validation/message';
import { ResponseValidator } from '../validation';
import PositiveMessage, { Type } from '../validation/positive-message';

export default class ResponseValidationConductor {
  private schema: OASSchema;
  private response: Response;
  private operation: OASOperation;

  constructor(schema: OASSchema, response: Response, operation: OASOperation) {
    this.schema = schema;
    this.response = response;
    this.operation = operation;
  }

  async validate(): Promise<Map<string, Message>[]> {
    let failures: Map<string, Message> = new Map();
    let warnings: Map<string, Message> = new Map();

    if (this.response.ok) {
      const responseValidator = new ResponseValidator(
        this.schema,
        this.operation,
        this.response,
      );

      await responseValidator.validate();
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
