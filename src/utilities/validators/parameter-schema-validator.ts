import { ParameterObject } from 'swagger-client/schema';
import {
  parameterHasContent,
  parameterHasSchema,
} from '../../types/typeguards';
import {
  InvalidParameterContent,
  InvalidParameterExample,
  InvalidParameterObject,
  MissingContentSchemaObject,
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
    this.operation.parameters.forEach((parameter) => {
      this.checkParameterObject(parameter, ['parameters', parameter.name]);
    });
  };

  private checkParameterObject(
    parameter: ParameterObject,
    path: string[],
  ): void {
    if (parameter.example && parameter.examples) {
      this._failures = [...this._failures, new InvalidParameterExample(path)];
    } else if (parameterHasContent(parameter)) {
      // Parameter Object contains field: content
      if (parameterHasSchema(parameter)) {
        // ERROR: Parameter Object also contains field: schema.
        this._failures = [...this._failures, new InvalidParameterObject(path)];
      }

      const [contentObjectKey, ...invalidKeys] = Object.keys(parameter.content);
      if (invalidKeys.length > 0) {
        // ERROR: Content Object contains more than one entry.
        this._failures = [
          ...this._failures,
          new InvalidParameterContent([...path, 'content']),
        ];
      }

      if (!parameter.content[contentObjectKey].schema) {
        // ERROR: Content Object does not contain a Schema Object.
        this._failures = [
          ...this._failures,
          new MissingContentSchemaObject([
            ...path,
            'content',
            contentObjectKey,
          ]),
        ];
      }
    } else if (!parameterHasSchema(parameter)) {
      // ERROR: Parameter Object must contain one of the following: schema, or content.
      this._failures = [...this._failures, new InvalidParameterObject(path)];
    }
  }
}

export default ParameterSchemaValidator;
