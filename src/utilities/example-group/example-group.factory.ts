import { ExampleObject, ParameterObject } from 'swagger-client';
import { Json } from 'swagger-client/schema';
import {
  parameterHasContent,
  parameterHasSchema,
} from '../../types/typeguards';
import { DEFAULT_PARAMETER_GROUP } from '../constants';
import OASOperation from '../oas-operation';
import ExampleGroup from './example-group';

class ExampleGroupFactory {
  static buildFromOperation(operation: OASOperation): ExampleGroup[] | [] {
    const parameters = operation.parameters;

    if (!parameters) return [];

    const groupNames = this.getGroupNames(parameters);

    const requiredExamples = this.getRequiredExamples(parameters);
    const nonRequiredExamplesWithExampleField = this.nonRequiredExamplesWithExampleField(
      parameters,
    );

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

  private static nonRequiredExamplesWithExampleField(
    parameters,
  ): {
    [name: string]: Json;
  } {
    return parameters.reduce((examples, parameter) => {
      if (parameter.required) return examples;

      // Examples on parameters should always override examples found elsewhere
      if (parameter.example) {
        return {
          ...examples,
          [parameter.name]: parameter.example,
        };
      }

      if (parameterHasSchema(parameter) && parameter.schema.example) {
        return {
          ...examples,
          [parameter.name]: parameter.schema.example,
        };
      }

      if (parameterHasContent(parameter)) {
        const [key] = Object.keys(parameter.content);

        if (parameter.content[key].example) {
          return {
            ...examples,
            [parameter.name]: parameter.content[key].example,
          };
        }
      }

      return examples;
    }, {});
  }

  private static getRequiredExamples(parameters): { [name: string]: Json } {
    return parameters
      .filter((parameter) => parameter.required)
      .reduce((examples, parameter) => {
        // If an example/examples exist on the Parameter Object they should override other potential sources.
        if (parameter.example || parameter.examples) {
          return {
            ...examples,
            [parameter.name]:
              parameter.example ??
              parameter.examples?.[DEFAULT_PARAMETER_GROUP]?.value,
          };
        }

        // Since a parameter MUST contain either a schema or content propery but not both,
        // the order of these two `if` blocks does not matter.
        if (parameter.content) {
          const [key] = Object.keys(parameter.content);
          return {
            ...examples,
            [parameter.name]:
              parameter.content[key].example ??
              parameter.content[key].examples?.[DEFAULT_PARAMETER_GROUP]?.value,
          };
        }

        if (parameter.schema?.example) {
          return {
            ...examples,
            [parameter.name]: parameter.schema.example,
          };
        }

        // catch-all in case there are no examples.
        return examples;
      }, {});
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
      } else if (parameterHasContent(parameter)) {
        const [key] = Object.keys(parameter.content);

        if (parameter.content[key].examples?.[groupName]) {
          examples[parameter.name] =
            parameter.content[key].examples?.[groupName].value;
        }
      }
    }
    return new ExampleGroup(operation, groupName, {
      ...otherExamples,
      ...examples,
    });
  }
}

export default ExampleGroupFactory;
