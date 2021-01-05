import { Json, Response, SchemaObject, Parameter } from 'swagger-client';
import { parse } from 'content-type';
import isEqual from 'lodash.isequal';
import uniqWith from 'lodash.uniqwith';
import {
  Schema,
  DuplicateEnum,
  EnumMismatch,
  TypeMismatch,
  PropertiesMismatch,
  RequiredProperty,
  StatusCodeMismatch,
  ContentTypeMismatch,
  MissingRequiredParameters,
  InvalidOperationId,
} from '../validation-failures';
import OasSchema from './oas-schema';
import {
  NULL_VALUE_ERROR,
  ITEMS_MISSING_ERROR,
  PROPERTIES_MISSING_ERROR,
} from './constants';
import { ParameterExamples } from '../types/parameter-examples';
import ValidationFailure from '../validation-failures/validation-failure';

class OasValidator {
  private schema: OasSchema;

  constructor(schema: OasSchema) {
    this.schema = schema;
  }

  validateParameters = async (
    operationId: string,
    parameters: ParameterExamples,
  ): Promise<ValidationFailure[]> => {
    const parameterSchema: {
      [parameterName: string]: Parameter;
    } = {};
    let failures: ValidationFailure[] = [];

    const operation = await this.schema.getOperation(operationId);
    if (!operation) {
      return [new InvalidOperationId(operationId)];
    }
    const requiredParameters = operation.parameters
      .filter((parameter) => parameter.required)
      .map((parameter) => parameter.name);

    const presentParameterNames = Object.keys(parameters);
    const missingRequiredParameters = requiredParameters?.filter(
      (parameterName) => !presentParameterNames.includes(parameterName),
    );

    if (missingRequiredParameters.length > 0) {
      failures = [
        ...failures,
        new MissingRequiredParameters(missingRequiredParameters),
      ];
    }

    operation.parameters.forEach((parameter) => {
      parameterSchema[parameter.name] = parameter;
    });

    Object.entries(parameters).forEach(([key, value]) => {
      if (Object.keys(parameterSchema).includes(key)) {
        failures = [
          ...failures,
          ...OasValidator.validateObjectAgainstSchema(
            value,
            parameterSchema[key].schema,
            ['parameters', key, 'example'],
          ),
        ];
      }
    });
    return failures;
  };

  validateResponse = async (
    operationId: string,
    response: Response,
  ): Promise<ValidationFailure[]> => {
    const operations = await this.schema.getOperations();
    const operation = operations[operationId];

    if (
      !Object.keys(operation.responses)
        .map((statusCode) => parseInt(statusCode, 10))
        .includes(response.status)
    ) {
      return [new StatusCodeMismatch(response.status)];
    }

    const contentType = parse(response.headers['content-type']).type;
    const contentTypeSchema =
      operation.responses[response.status].content[contentType];

    if (!contentTypeSchema) {
      return [new ContentTypeMismatch(contentType)];
    }

    return OasValidator.validateObjectAgainstSchema(
      response.body,
      contentTypeSchema.schema,
      ['body'],
    );
  };

  public static validateObjectAgainstSchema(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): ValidationFailure[] {
    let failures: ValidationFailure[] = [];
    // if the actual object is null check that null values are allowed
    if (actual === null) {
      if (expected.nullable) {
        return [];
      }

      return [new Schema(NULL_VALUE_ERROR, path)];
    }

    const enumValues = expected.enum;
    const expectedType = expected.type;
    const actualType = typeof actual;

    if (expectedType) {
      if (expectedType === 'array') {
        // check that the actual object is an array
        if (!Array.isArray(actual)) {
          return [new TypeMismatch(path, expectedType, actualType)];
        }
      } else if (actualType !== expectedType) {
        // check that type matches for other types
        return [new TypeMismatch(path, expectedType, actualType)];
      }
    }

    if (enumValues) {
      // check that expected enum does not contain duplicate values
      const uniqueEnumValues = uniqWith(enumValues, isEqual);
      if (uniqueEnumValues.length !== enumValues.length) {
        failures.push(new DuplicateEnum(path, enumValues));
      }

      // check that the actual object matches an element in the expected enum
      const filteredEnum = enumValues.filter((value) => isEqual(value, actual));
      if (filteredEnum.length === 0) {
        failures.push(new EnumMismatch(path, enumValues, actual));
      }
    }

    if (Array.isArray(actual)) {
      // check that the expected object's items property is set
      const itemSchema = expected.items;
      if (itemSchema) {
        // re-run for each item
        actual.forEach((item) => {
          failures = [
            ...failures,
            ...this.validateObjectAgainstSchema(item, itemSchema, path),
          ];
        });
      } else {
        failures.push(new Schema(ITEMS_MISSING_ERROR, path));
      }
    } else if (actualType === 'object') {
      // check that the expected object's properties field is set
      const properties = expected.properties;
      if (properties) {
        const actualProperties = Object.keys(actual);
        const expectedProperties = Object.keys(properties);

        // check that the actual object only contains properties present in expected object
        if (
          actualProperties.filter(
            (property) => !expectedProperties.includes(property),
          ).length > 0
        ) {
          failures.push(
            new PropertiesMismatch(path, expectedProperties, actualProperties),
          );
        }

        // check required values are present
        expected.required?.forEach((requiredProperty) => {
          if (!actualProperties.includes(requiredProperty)) {
            failures.push(new RequiredProperty(path, requiredProperty));
          }
        });

        // re-un for each property that has a schema present
        Object.entries(actual)
          .filter(([propertyName]) => properties[propertyName])
          .forEach(([propertyName, propertyObject]) => {
            path.push(propertyName);
            failures = [
              ...failures,
              ...this.validateObjectAgainstSchema(
                propertyObject,
                properties[propertyName],
                path,
              ),
            ];
          });
      } else {
        failures.push(new Schema(PROPERTIES_MISSING_ERROR, path));
      }
    }

    path.pop();
    return failures;
  }
}

export default OasValidator;
