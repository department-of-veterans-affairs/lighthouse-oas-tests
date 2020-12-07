import { Json, Response, SchemaObject } from 'swagger-client';
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
} from '../errors';
import OasSchema from './oas-schema';
import { ITEMS_MISSING_ERROR, PROPERTIES_MISSING_ERROR } from './constants';

class OasValidator {
  private schema: OasSchema;

  constructor(schema: OasSchema) {
    this.schema = schema;
  }

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

    if (expectedType === 'array') {
      // check that the actual object is an array
      if (!Array.isArray(actual)) {
        throw new TypeMismatchError(path, expectedType, actualType);
      }

      // check that the expected object's items property is set
      const itemSchema = expected.items;
      if (!itemSchema) {
        throw new SchemaError(ITEMS_MISSING_ERROR, path);
      }

      // re-run for each item
      actual.forEach((item) => {
        this.validateObjectAgainstSchema(item, itemSchema, path);
      });
    } else {
      // check that type matches
      if (actualType !== expectedType) {
        throw new TypeMismatchError(path, expectedType, actualType);
      }

      // if type is object
      if (actualType === 'object') {
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
    }

    path.pop();
  }
}

export default OasValidator;
