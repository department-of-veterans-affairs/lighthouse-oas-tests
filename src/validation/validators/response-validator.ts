import { parse } from 'content-type';
import { Response } from 'swagger-client';
import { Type } from '../validation-message';
import OASOperation from '../../oas-parsing/operation';
import BaseValidator from './base-validator';

class ResponseValidator extends BaseValidator {
  private operation: OASOperation;

  private response: Response;

  constructor(operation: OASOperation, response: Response) {
    super();
    this.operation = operation;
    this.response = response;
  }

  performValidation = (): void => {
    const responseSchema = this.operation.getResponseSchema(
      this.response.status,
    );

    if (responseSchema) {
      const contentType = parse(this.response.headers['content-type']).type;
      const contentTypeSchema = responseSchema.content[contentType];

      if (!contentTypeSchema) {
        this.addMessage(Type.ContentTypeMismatch, [], [contentType]);
        return;
      }

      this.validateObjectAgainstSchema(
        this.response.body,
        contentTypeSchema.schema,
        ['body'],
      );
    } else {
      this.addMessage(Type.StatusCodeMismatch, [], [`${this.response.status}`]);
    }
  };
}

export default ResponseValidator;
