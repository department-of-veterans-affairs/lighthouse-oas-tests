import { ParameterObject } from 'swagger-client/schema';
import {
  parameterHasContent,
  parameterHasSchema,
} from '../../../types/typeguards';
import OASOperation from '../../../oas-parsing/operation';
import PositiveValidator from './positive-validator';
import { Type } from './positive-message';

class ParameterSchemaValidator extends PositiveValidator {
  private operation: OASOperation;

  constructor(operation: OASOperation) {
    super();
    this.operation = operation;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  performValidation = async (): Promise<void> => {
    if (this.operation.parameters === undefined) {
      return;
    }

    this.operation.parameters.forEach((parameter) => {
      this.checkParameterObject(parameter, ['parameters', parameter.name]);
    });
  };

  private checkParameterObject(
    parameter: ParameterObject,
    path: string[],
  ): void {
    if (parameter.example && parameter.examples) {
      this.addMessage(Type.InvalidParameterExample, path);
    } else if (parameterHasContent(parameter)) {
      // Parameter Object contains field: content
      if (parameterHasSchema(parameter)) {
        // ERROR: Parameter Object also contains field: schema.
        this.addMessage(Type.InvalidParameterObject, path);
      }

      const [contentObjectKey, ...invalidKeys] = Object.keys(parameter.content);
      if (invalidKeys.length > 0) {
        // ERROR: Content Object contains more than one entry.
        this.addMessage(Type.InvalidParameterContent, [...path, 'content']);
      }

      if (!parameter.content[contentObjectKey].schema) {
        // ERROR: Content Object does not contain a Schema Object.
        this.addMessage(Type.MissingContentSchemaObject, [
          ...path,
          'content',
          contentObjectKey,
        ]);
      }
    } else if (!parameterHasSchema(parameter)) {
      // ERROR: Parameter Object must contain one of the following: schema, or content.
      this.addMessage(Type.InvalidParameterObject, path);
    }
  }
}

export default ParameterSchemaValidator;
