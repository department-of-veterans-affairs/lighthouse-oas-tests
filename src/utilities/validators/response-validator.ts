import { parse } from 'content-type';
import { Response } from 'swagger-client';
import {
  ContentTypeMismatch,
  StatusCodeMismatch,
} from '../../validation-messages/failures';
import OASOperation from '../oas-operation';
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
        this.addFailure(new ContentTypeMismatch(contentType));
        return;
      }

      this.validateObjectAgainstSchema(
        this.response.body,
        contentTypeSchema.schema,
        ['body'],
      );
    } else {
      this.addFailure(new StatusCodeMismatch(this.response.status));
    }
  };
}

export default ResponseValidator;
