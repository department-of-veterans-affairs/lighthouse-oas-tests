import { Json, ParameterObject } from 'swagger-client/schema';
import { parameterHasSchema } from '../../../types/typeguards';
import ExampleGroup from '../../../oas-parsing/example-group';
import OASOperation from '../../../oas-parsing/operation';
import PositiveValidator from './positive-validator';
import { Type } from './positive-message';

class ExampleGroupValidator extends PositiveValidator {
  private exampleGroup: ExampleGroup;

  private operation: OASOperation;

  constructor(exampleGroup: ExampleGroup, operation: OASOperation) {
    super();
    this.exampleGroup = exampleGroup;
    this.operation = operation;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  performValidation = async (): Promise<void> => {
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
      this.addMessage(
        Type.MissingRequiredParameters,
        [],
        [`${missingRequiredParameters}`],
      );
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

export default ExampleGroupValidator;
