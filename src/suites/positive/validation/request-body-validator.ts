import { RequestBodyObject } from 'swagger-client/schema';
import OASOperation from '../../../oas-parsing/operation';
import PositiveValidator from './positive-validator';
import { Type } from './positive-message';
import { REQUEST_BODY_PATH } from '../utilities/constants';

class RequestBodyValidator extends PositiveValidator {
  private operation: OASOperation;

  constructor(operation: OASOperation) {
    super();
    this.operation = operation;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  performValidation = async (): Promise<void> => {
    if (this.operation.requestBody !== undefined) {
      this.checkRequestBody(this.operation.requestBody);
    }
  };

  private checkRequestBody(requestBody: RequestBodyObject): void {
    const path: string[] = [REQUEST_BODY_PATH];

    // check for content schema presence
    const contentObjectKeys = Object.keys(requestBody.content);
    for (const contentObjectKey of contentObjectKeys) {
      if (!requestBody.content[contentObjectKey].schema) {
        // ERROR: Content Object does not contain a Schema Object.
        this.addMessage(Type.MissingContentSchemaObject, [
          ...path,
          'content',
          contentObjectKey,
        ]);
      }
    }

    // validate example content against the schema
    const content = requestBody.content;
    const [key] = Object.keys(content);
    const schema = content[key].schema;
    if (schema) {
      const example = this.operation.exampleRequestBody;
      this.validateObjectAgainstSchema(example, schema, [...path, 'example']);
    }
  }
}

export default RequestBodyValidator;
