import { parse } from 'content-type';
import { Response } from 'swagger-client';
import { Type } from '../validation-message';
import OASOperation from '../../oas-parsing/operation';
import BaseValidator from './base-validator';
import MediumType from 'medium-type';

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

      // if the Accept header is populated in the request
      const acceptHeader = this.operation.parameters?.filter(
        (parameter) => parameter.in === 'header' && parameter.name === 'Accept',
      );
      if (acceptHeader && acceptHeader.length > 0) {
        // then check that the media type of the response is compatible with what was specified
        const responseType = new MediumType(contentType);
        const acceptType = new MediumType(acceptHeader[0].example);
        if (!responseType.match(acceptType)) {
          this.addMessage(
            Type.MediaTypeMismatch,
            [],
            [acceptType, responseType],
          );
        }
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
