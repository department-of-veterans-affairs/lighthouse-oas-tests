import { RequestBodyObject } from 'swagger-client/schema';
import { MissingContentSchemaObject } from '../../validation-messages/failures';
import OASOperation from '../oas-operation';
import BaseValidator from './base-validator';

class RequestBodyValidator extends BaseValidator {
  private operation: OASOperation;

  constructor(operation: OASOperation) {
    super();
    this.operation = operation;
  }

  performValidation = (): void => {
    if (this.operation.requestBody !== undefined) {
      this.checkRequestBody(this.operation.requestBody);
    }
  };

  private checkRequestBody(requestBody: RequestBodyObject): void {
    const path: string[] = ['requestBody'];

    // check for content schema presence
    const contentObjectKeys = Object.keys(requestBody.content);
    for (const contentObjectKey of contentObjectKeys) {
      if (!requestBody.content[contentObjectKey].schema) {
        // ERROR: Content Object does not contain a Schema Object.
        this.addFailure(
          new MissingContentSchemaObject([
            ...path,
            'content',
            contentObjectKey,
          ]),
        );
      }
    }

    // validate example content against the schema
    const example = this.operation.exampleRequestBody;
    const content = requestBody.content;
    const [key] = Object.keys(content);
    const schema = content[key].schema;
    this.validateObjectAgainstSchema(example, schema, [...path, 'example']);
  }
}

export default RequestBodyValidator;
