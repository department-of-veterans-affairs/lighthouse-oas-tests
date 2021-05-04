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
          [parameter.name]:
            parameter.example ??
            parameter.examples?.[DEFAULT_PARAMETER_GROUP]?.value,
        };
      }, {});

    const nonRequiredExamplesWithExampleField = parameters
      .filter((parameter) => !parameter.required && parameter.example)
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
          if (groupName === DEFAULT_PARAMETER_GROUP) {
            return [
              ...exampleGroups,
              this.findExamplesForGroup(operation, groupName, parameters, {
                ...requiredExamples,
                ...nonRequiredExamplesWithExampleField,
              }),
            ];
          }

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
    }

    if (!groupNames.includes(DEFAULT_PARAMETER_GROUP)) {
      const defaultGroup = new ExampleGroup(
        operation,
        DEFAULT_PARAMETER_GROUP,
        { ...requiredExamples, ...nonRequiredExamplesWithExampleField },
      );
      exampleGroups.push(defaultGroup);
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
    otherExamples: ExampleObject,
  ): ExampleGroup {
    const examples = {};
    for (const parameter of parameters) {
      if (parameter.examples?.[groupName]) {
        examples[parameter.name] = parameter.examples[groupName].value;
      }
    }
    return new ExampleGroup(operation, groupName, {
      ...otherExamples,
      ...examples,
    });
  }
}

export default ExampleGroupFactory;
