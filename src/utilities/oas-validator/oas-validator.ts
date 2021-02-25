import {
  Json,
  Response,
  SchemaObject,
  Method,
  ParameterObject,
  ParameterWithContent,
  ParameterWithSchema,
} from 'swagger-client';
import { parse } from 'content-type';
import isEqual from 'lodash.isequal';
import uniqWith from 'lodash.uniqwith';
import {
  DuplicateEnum,
  EnumMismatch,
  TypeMismatch,
  PropertiesMismatch,
  RequiredProperty,
  StatusCodeMismatch,
  ContentTypeMismatch,
  MissingRequiredParameters,
  InvalidOperationId,
  NullValueNotAllowed,
  ItemSchemaMissing,
  PropertySchemaMissing,
  InvalidParameterObject,
  InvalidParameterContent,
  MissingSchemaObject,
} from '../../validation-failures';
import OasSchema from '../oas-schema';
import { ParameterExamples } from '../parameter-wrapper/types';
import ValidationFailure from '../../validation-failures/validation-failure';
import { CheckParameterObject, OperationParameters } from './types';

class OASValidator {
  private schema: OasSchema;

  constructor(schema: OasSchema) {
    this.schema = schema;
  }

  validateParameters = async (
    operationId: string,
    parameterExamples: ParameterExamples,
  ): Promise<ValidationFailure[]> => {
    let failures: ValidationFailure[] = [];

    const operation = await this.schema.getOperation(operationId);
    if (!operation) {
      return [new InvalidOperationId(operationId)];
    }
    const missingRequiredParametersError = this.checkMissingRequiredParameters(
      operation,
      parameterExamples,
    );
    if (missingRequiredParametersError) {
      failures = [...failures, missingRequiredParametersError];
    }

    const operationParameters: OperationParameters = {};
    operation.parameters.forEach((parameter) => {
      operationParameters[parameter.name] = parameter;
    });

    Object.entries(parameterExamples).forEach(([name, example]) => {
      if (Object.keys(operationParameters).includes(name)) {
        failures = [
          ...failures,
          ...this.checkParameterExample(
            name,
            example,
            operationParameters[name],
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

    return OASValidator.validateObjectAgainstSchema(
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
    const actualType = typeof actual;

    const invalidSchemaErrors = this.checkInvalidSchema(actual, expected, [
      ...path,
    ]);
    if (invalidSchemaErrors) {
      failures = [...failures, ...invalidSchemaErrors];
      return failures;
    }

    const expectedTypeError = this.checkExpectedType(actual, expected, [
      ...path,
    ]);

    if (expectedTypeError) {
      failures = [...failures, expectedTypeError];
      return failures;
    }

    const enumValueErrors = this.checkEnumValue(actual, expected, [...path]);
    if (enumValueErrors.length > 0) {
      failures = [...failures, ...enumValueErrors];
    }

    if (Array.isArray(actual)) {
      const itemSchemaErrors = this.checkArrayItemSchema(actual, expected, [
        ...path,
      ]);
      if (itemSchemaErrors.length > 0) {
        failures = [...failures, ...itemSchemaErrors];
      }
    } else if (actualType === 'object') {
      const propertiesErrors = this.checkObjectProperties(actual, expected, [
        ...path,
      ]);
      if (propertiesErrors.length > 0) {
        failures = [...failures, ...propertiesErrors];
      }
    }
    return failures;
  }

  private static checkInvalidSchema(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): Array<ValidationFailure> | undefined {
    // if the actual object is null check that null values are allowed
    if (actual === null) {
      if (expected.nullable) {
        return [];
      }
      return [new NullValueNotAllowed([...path])];
    }
  }

  private static checkExpectedType(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): TypeMismatch | undefined {
    const actualType = typeof actual;
    if (!expected.type) {
      return;
    }
    if (expected.type === 'array') {
      // check that the actual object is an array
      if (!Array.isArray(actual)) {
        return new TypeMismatch([...path], expected.type, actualType);
      }
    } else if (expected.type === 'integer') {
      // check that the actual value is an integer
      if (!Number.isInteger(actual)) {
        return new TypeMismatch([...path], expected.type, actualType);
      }
    } else if (actualType !== expected.type) {
      // check that type matches for other types
      return new TypeMismatch([...path], expected.type, actualType);
    }
  }

  private static checkEnumValue(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): ValidationFailure[] {
    let failures: ValidationFailure[] = [];
    const enumValues = expected.enum;
    if (enumValues) {
      // check that expected enum does not contain duplicate values
      const uniqueEnumValues = uniqWith(enumValues, isEqual);
      if (uniqueEnumValues.length !== enumValues.length) {
        failures = [new DuplicateEnum([...path], enumValues)];
      }

      // check that the actual object matches an element in the expected enum
      const filteredEnum = enumValues.filter((value) => isEqual(value, actual));
      if (filteredEnum.length === 0) {
        failures = [
          ...failures,
          new EnumMismatch([...path], enumValues, actual),
        ];
      }
    }
    return failures;
  }

  private static checkArrayItemSchema(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): ValidationFailure[] {
    let failures: ValidationFailure[] = [];
    // check that the expected object's items property is set
    const itemSchema = expected.items;
    if (itemSchema) {
      // re-run for each item
      actual.forEach((item) => {
        failures = [
          ...failures,
          ...this.validateObjectAgainstSchema(item, itemSchema, [...path]),
        ];
      });
    } else {
      failures = [new ItemSchemaMissing([...path])];
    }
    return failures;
  }

  private checkParameterExample(
    name: string,
    example: string | number,
    parameter: ParameterObject,
  ): ValidationFailure[] {
    let failures: ValidationFailure[] = [];
    const path = ['parameters', name];

    const { schema, parameterObjectFailure } = this.checkParameterObject(
      parameter,
      path,
    );

    if (parameterObjectFailure) {
      failures = [...failures, parameterObjectFailure];
    } else if (schema) {
      failures = [
        ...failures,
        ...OASValidator.validateObjectAgainstSchema(example, schema, [
          ...path,
          'example',
        ]),
      ];
    }

    return failures;
  }

  private checkMissingRequiredParameters(
    operation: Method | null,
    parameters: ParameterExamples,
  ): ValidationFailure | undefined {
    const requiredParameters = operation?.parameters
      .filter((parameter) => parameter.required)
      .map((parameter) => parameter.name);

    const presentParameterNames = Object.keys(parameters);
    const missingRequiredParameters = requiredParameters?.filter(
      (parameterName) => !presentParameterNames.includes(parameterName),
    );

    if (missingRequiredParameters && missingRequiredParameters.length > 0) {
      return new MissingRequiredParameters(missingRequiredParameters);
    }
  }

  private isParameterWithContent(parameter): parameter is ParameterWithContent {
    if (parameter.content) {
      return true;
    }
    return false;
  }

  private isParameterWithSchema(parameter): parameter is ParameterWithSchema {
    if (parameter.schema) {
      return true;
    }
    return false;
  }

  private checkParameterObject(
    parameter: ParameterObject,
    path: string[],
  ): CheckParameterObject {
    if (
      this.isParameterWithSchema(parameter) &&
      !this.isParameterWithContent(parameter)
    ) {
      // Parameter Object conatains field: schema; does not contain field: content
      return {
        schema: parameter.schema,
        parameterObjectFailure: null,
      };
    }

    if (this.isParameterWithContent(parameter)) {
      // Parameter Object contains field: content
      if (this.isParameterWithSchema(parameter)) {
        // ERROR: Parameter Object also contains field: schema.
        return {
          schema: null,
          parameterObjectFailure: new InvalidParameterObject(path),
        };
      }

      const [contentObjectKey, ...invalidKeys] = Object.keys(parameter.content);
      if (invalidKeys.length > 0) {
        // ERROR: Content Object contains more than one entry.
        return {
          schema: null,
          parameterObjectFailure: new InvalidParameterContent([
            ...path,
            'content',
          ]),
        };
      }

      if (parameter.content[contentObjectKey].schema) {
        // Content Object contains one entry and a Schema Object.
        return {
          schema: parameter.content[contentObjectKey].schema,
          parameterObjectFailure: null,
        };
      }

      // ERROR: Content Object does not contain a Schema Object.
      return {
        schema: null,
        parameterObjectFailure: new MissingSchemaObject([
          ...path,
          'content',
          contentObjectKey,
        ]),
      };
    }

    // ERROR: Parameter Object must contain one of the following: schema, or content.
    return {
      schema: null,
      parameterObjectFailure: new InvalidParameterObject(path),
    };
  }

  private static checkObjectProperties(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): ValidationFailure[] {
    let failures: ValidationFailure[] = [];
    const properties = expected.properties;

    // check that the expected object's properties field is set
    if (!properties) {
      failures = [new PropertySchemaMissing([...path])];
      return failures;
    }

    const actualProperties = Object.keys(actual);
    const expectedProperties = Object.keys(properties);

    // check that the actual object only contains properties present in expected object
    if (
      actualProperties.filter(
        (property) => !expectedProperties.includes(property),
      ).length > 0
    ) {
      failures = [
        new PropertiesMismatch([...path], expectedProperties, actualProperties),
      ];
    }

    // check required values are present
    expected.required?.forEach((requiredProperty) => {
      if (!actualProperties.includes(requiredProperty)) {
        failures = [
          ...failures,
          new RequiredProperty([...path], requiredProperty),
        ];
      }
    });

    // re-un for each property that has a schema present
    Object.entries(actual)
      .filter(([propertyName]) => properties[propertyName])
      .forEach(([propertyName, propertyObject]) => {
        failures = [
          ...failures,
          ...this.validateObjectAgainstSchema(
            propertyObject,
            properties[propertyName],
            [...path, propertyName],
          ),
        ];
      });
    return failures;
  }
}

export default OASValidator;
