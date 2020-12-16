import { Json, Response, SchemaObject, Parameter } from 'swagger-client';
import { parse } from 'content-type';
import isEqual from 'lodash.isequal';
import uniqWith from 'lodash.uniqwith';
import {
  SchemaError,
  DuplicateEnumError,
  EnumMismatchError,
  TypeMismatchError,
  PropertiesMismatchError,
  RequiredPropertyError,
  StatusCodeMismatchError,
  ContentTypeMismatchError,
  MissingRequiredParametersError,
  InvalidOperationIdError,
} from '../errors';
import OasSchema from './oas-schema';
import {
  NULL_VALUE_ERROR,
  ITEMS_MISSING_ERROR,
  PROPERTIES_MISSING_ERROR,
} from './constants';

class OasValidator {
  private schema: OasSchema;

  constructor(schema: OasSchema) {
    this.schema = schema;
  }

  validateParameters = async (
    operationId: string,
    parameters: Json,
  ): Promise<void> => {
    const parameterSchema: {
      [parameterName: string]: Parameter;
    } = {};
    const operation = await this.schema.getOperation(operationId);
    if (!operation) {
      throw new InvalidOperationIdError(operationId);
    }
    const requiredParameters = operation.parameters
      .filter((parameter) => parameter.required)
      .map((parameter) => parameter.name);

    const presentParameterNames = Object.keys(parameters);
    const missingRequiredParameters = requiredParameters?.filter(
      (parameterName) => !presentParameterNames.includes(parameterName),
    );

    if (missingRequiredParameters.length > 0) {
      throw new MissingRequiredParametersError(missingRequiredParameters);
    }

    operation.parameters.forEach((parameter) => {
      parameterSchema[parameter.name] = parameter;
    });

    Object.entries(parameters).forEach(([key, value]) => {
      if (Object.keys(parameterSchema).includes(key)) {
        OasValidator.validateObjectAgainstSchema(
          value,
          parameterSchema[key].schema,
          ['parameters', key, 'example'],
        );
      }
    });
  };

  validateResponse = async (
    operationId: string,
    response: Response,
  ): Promise<void> => {
    const operations = await this.schema.getOperations();
    const operation = operations[operationId];

    if (
      !Object.keys(operation.responses)
        .map((statusCode) => parseInt(statusCode, 10))
        .includes(response.status)
    ) {
      throw new StatusCodeMismatchError(response.status);
    }

    const contentType = parse(response.headers['content-type']).type;
    const contentTypeSchema =
      operation.responses[response.status].content[contentType];

    if (!contentTypeSchema) {
      throw new ContentTypeMismatchError(contentType);
    }

    OasValidator.validateObjectAgainstSchema(
      response.body,
      contentTypeSchema.schema,
      ['body'],
    );
  };

  public static validateObjectAgainstSchema(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): void {
    // if the actual object is null check that null values are allowed
    if (actual === null) {
      if (expected.nullable) {
        return;
      }

      throw new SchemaError(NULL_VALUE_ERROR, path);
    }

    const enumValues = expected.enum;

    if (enumValues) {
      // check that expected enum does not contain duplicate values
      const uniqueEnumValues = uniqWith(enumValues, isEqual);
      if (uniqueEnumValues.length !== enumValues.length) {
        throw new DuplicateEnumError(path, enumValues);
      }

      // check that the actual object matches an element in the expected enum
      const filteredEnum = enumValues.filter((value) => isEqual(value, actual));
      if (filteredEnum.length === 0) {
        throw new EnumMismatchError(path, enumValues, actual);
      }
    }

    const expectedType = expected.type;
    const actualType = typeof actual;

    if (expectedType) {
      if (expectedType === 'array') {
        // check that the actual object is an array
        if (!Array.isArray(actual)) {
          throw new TypeMismatchError(path, expectedType, actualType);
        }
      } else if (actualType !== expectedType) {
        // check that type matches for other types
        throw new TypeMismatchError(path, expectedType, actualType);
      }
    }

    if (Array.isArray(actual)) {
      // check that the expected object's items property is set
      const itemSchema = expected.items;
      if (!itemSchema) {
        throw new SchemaError(ITEMS_MISSING_ERROR, path);
      }

      // re-run for each item
      actual.forEach((item) => {
        this.validateObjectAgainstSchema(item, itemSchema, path);
      });
    } else if (actualType === 'object') {
      // check that the expected object's properties field is set
      const properties = expected.properties;
      if (!properties) {
        throw new SchemaError(PROPERTIES_MISSING_ERROR, path);
      }

      const actualProperties = Object.keys(actual);
      const expectedProperties = Object.keys(properties);

      // check that the actual object only contains properties present in expected object
      if (
        actualProperties.filter(
          (property) => !expectedProperties.includes(property),
        ).length > 0
      ) {
        throw new PropertiesMismatchError(
          path,
          expectedProperties,
          actualProperties,
        );
      }

      // check required values are present
      expected.required?.forEach((requiredProperty) => {
        if (!actualProperties.includes(requiredProperty)) {
          throw new RequiredPropertyError(path, requiredProperty);
        }
      });

      // re-un for each property
      Object.entries(actual).forEach(([propertyName, propertyObject]) => {
        path.push(propertyName);
        this.validateObjectAgainstSchema(
          propertyObject,
          properties[propertyName],
          path,
        );
      });
    }

    path.pop();
  }
}

export default OasValidator;
