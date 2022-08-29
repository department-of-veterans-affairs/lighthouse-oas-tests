import { parse } from 'content-type';
import { Response } from 'swagger-client';
import OASOperation from '../../../oas-parsing/operation';
import PositiveValidator from './positive-validator';
import { Type } from './positive-message';

class ResponseValidator extends PositiveValidator {
  private operation: OASOperation;

  private response: Response;

  constructor(operation: OASOperation, response: Response) {
    super();
    this.operation = operation;
    this.response = response;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  performValidation = async (): Promise<void> => {
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

      if (this.response.body === undefined) {
        this.addMessage(Type.UnableToParseResponseBody, [], [contentType]);
      } else {
        this.validateObjectAgainstSchema(
          this.response.body,
          contentTypeSchema.schema,
          ['body'],
        );
      }
    } else {
      this.addMessage(Type.StatusCodeMismatch, [], [`${this.response.status}`]);
    }
  };
}

export default ResponseValidator;
