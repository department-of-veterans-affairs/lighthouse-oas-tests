import { ParameterObject, RequestBodyObject } from 'swagger-client/schema';
import {
  parameterHasContent,
  parameterHasSchema,
} from '../../types/typeguards';
import {
  InvalidParameterContent,
  InvalidParameterExample,
  InvalidParameterObject,
  MissingContentSchemaObject,
  InvalidRequestBodyContent,
} from '../../validation-messages/failures';
import OASOperation from '../oas-operation';
import BaseValidator from './base-validator';

class ParameterSchemaValidator extends BaseValidator {
  private operation: OASOperation;

  constructor(operation: OASOperation) {
    super();
    this.operation = operation;
  }

  performValidation = (): void => {
    if (this.operation.parameters !== undefined) {
      this.operation.parameters.forEach((parameter) => {
        this.checkParameterObject(parameter, ['parameters', parameter.name]);
      });
    }
    if (this.operation.requestBody !== undefined) {
      this.checkRequestBody(this.operation.requestBody);
    }
  };

  private checkParameterObject(
    parameter: ParameterObject,
    path: string[],
  ): void {
    if (parameter.example && parameter.examples) {
      this.addFailure(new InvalidParameterExample(path));
    } else if (parameterHasContent(parameter)) {
      // Parameter Object contains field: content
      if (parameterHasSchema(parameter)) {
        // ERROR: Parameter Object also contains field: schema.
        this.addFailure(new InvalidParameterObject(path));
      }

      const [contentObjectKey, ...invalidKeys] = Object.keys(parameter.content);
      if (invalidKeys.length > 0) {
        // ERROR: Content Object contains more than one entry.
        this.addFailure(new InvalidParameterContent([...path, 'content']));
      }

      if (!parameter.content[contentObjectKey].schema) {
        // ERROR: Content Object does not contain a Schema Object.
        this.addFailure(
          new MissingContentSchemaObject([
            ...path,
            'content',
            contentObjectKey,
          ]),
        );
      }
    } else if (!parameterHasSchema(parameter)) {
      // ERROR: Parameter Object must contain one of the following: schema, or content.
      this.addFailure(new InvalidParameterObject(path));
    }
  }

  private checkRequestBody(requestBody: RequestBodyObject): void {
    const path: string[] = ['requestBody'];

    // unlike a parameter, the request body only has content, not schema

    // check for invalid content
    const [contentObjectKey, ...invalidKeys] = Object.keys(requestBody.content);
    if (invalidKeys.length > 0) {
      // ERROR: Content Object contains more than one entry.
      this.addFailure(new InvalidRequestBodyContent([...path, 'content']));
    }

    // check for content schema presence
    if (!requestBody.content[contentObjectKey].schema) {
      // ERROR: Content Object does not contain a Schema Object.
      this.addFailure(
        new MissingContentSchemaObject([...path, 'content', contentObjectKey]),
      );
    }
  }
}

export default ParameterSchemaValidator;
