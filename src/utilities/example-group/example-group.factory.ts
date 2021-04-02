import { ExampleObject, ParameterObject } from 'swagger-client';
import { DEFAULT_PARAMETER_GROUP } from '../constants';
import OASOperation from '../oas-operation';
import ExampleGroup from './example-group';

class ExampleGroupFactory {
  static buildFromOperation(operation: OASOperation): ExampleGroup[] {
    const parameters = operation.parameters;
    const groupNames = this.getGroupNames(parameters);

    const requiredExamples = parameters
      .filter((parameter) => parameter.required)
      .reduce((examples, parameter) => {
        return {
          ...examples,
          [parameter.name]: parameter.example,
        };
      }, {});

    let exampleGroups: ExampleGroup[] = [];

    if (groupNames.length > 0) {
      exampleGroups = groupNames.reduce<ExampleGroup[]>(
        (exampleGroups, groupName) => {
          return [
            ...exampleGroups,
            this.findExamplesForGroup(
              operation,
              groupName,
              parameters,
              requiredExamples,
            ),
          ];
        },
        [],
      );
    } else {
      exampleGroups = [
        new ExampleGroup(operation, DEFAULT_PARAMETER_GROUP, requiredExamples),
      ];
    }

    return exampleGroups;
  }

  private static getGroupNames(parameters: ParameterObject[]): string[] {
    const groupNames = parameters
      .filter((parameter) => parameter.examples)
      .flatMap((parameter) => Object.keys(parameter.examples ?? {}));

    return [...new Set(groupNames)];
  }

  private static findExamplesForGroup(
    operation: OASOperation,
    groupName: string,
    parameters: ParameterObject[],
    requiredExamples: ExampleObject,
  ): ExampleGroup {
    const examples = {};
    for (const parameter of parameters) {
      if (parameter.examples?.[groupName]) {
        examples[parameter.name] = parameter.examples[groupName].value;
      }
    }

    return new ExampleGroup(operation, groupName, {
      ...requiredExamples,
      ...examples,
    });
  }
}

export default ExampleGroupFactory;
