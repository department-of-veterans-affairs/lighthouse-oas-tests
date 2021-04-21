import { Json, ParameterObject } from 'swagger-client/schema';
import {
  parameterHasContent,
  parameterHasSchema,
} from '../../types/typeguards';
import {
  InvalidParameterContent,
  InvalidParameterObject,
  MissingContentSchemaObject,
  MissingRequiredParameters,
} from '../../validation-messages/failures';
import ExampleGroup from '../example-group';
import OASOperation from '../oas-operation';
import BaseValidator from './base-validator';

class ParameterValidator extends BaseValidator {
  private exampleGroup: ExampleGroup;

  private operation: OASOperation;

  constructor(exampleGroup: ExampleGroup) {
    super();
    this.exampleGroup = exampleGroup;
    this.operation = exampleGroup.operation;
  }

  performValidation = (): void => {
    this.checkMissingRequiredParameters();
    const examples = this.exampleGroup.examples;

    Object.entries(examples).forEach(([name, example]) => {
      this.checkExample(name, example);
    });
  };

  private checkMissingRequiredParameters(): void {
    const requiredParameters = this.operation.requiredParameterNames;

    const presentParameterNames = Object.keys(this.exampleGroup.examples);
    const missingRequiredParameters = requiredParameters.filter(
      (parameterName) => !presentParameterNames.includes(parameterName),
    );

    if (missingRequiredParameters.length > 0) {
      this._failures = [
        ...this._failures,
        new MissingRequiredParameters(missingRequiredParameters),
      ];
    }
  }

  private checkExample(name: string, example: Json): void {
    const path = ['parameters', name];

    const parameter = this.operation.getParameter(name);

    if (parameter) {
      this.checkParameterObject(parameter, example, path);
    }
  }

  private checkParameterObject(
    parameter: ParameterObject,
    example: Json,
    path: string[],
  ): void {
    if (parameterHasSchema(parameter) && !parameterHasContent(parameter)) {
      // Parameter Object conatains field: schema; does not contain field: content
      this.validateObjectAgainstSchema(example, parameter.schema, [
        ...path,
        'example',
      ]);
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

      if (parameter.content[contentObjectKey].schema) {
        // Content Object contains one entry and a Schema Object.
        this.validateObjectAgainstSchema(
          example,
          parameter.content[contentObjectKey].schema,
          [...path, 'example'],
        );
      } else {
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
    } else {
      // ERROR: Parameter Object must contain one of the following: schema, or content.
      this._failures = [...this._failures, new InvalidParameterObject(path)];
    }
  }
}

export default ParameterValidator;
