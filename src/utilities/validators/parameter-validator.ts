import { Json, ParameterObject } from 'swagger-client/schema';
import { parameterHasSchema } from '../../types/typeguards';
import { MissingRequiredParameters } from '../../validation-messages/failures';
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
    if (parameterHasSchema(parameter)) {
      // Parameter Object conatains field: schema; does not contain field: content
      this.validateObjectAgainstSchema(example, parameter.schema, [
        ...path,
        'example',
      ]);
    } else {
      const contentObjectKey = Object.keys(parameter.content)[0];
      this.validateObjectAgainstSchema(
        example,
        parameter.content[contentObjectKey].schema,
        [...path, 'example'],
      );
    }
  }
}

export default ParameterValidator;
