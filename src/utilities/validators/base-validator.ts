import { isEqual, uniqWith } from 'lodash';
import { Json, SchemaObject } from 'swagger-client/schema';
import {
  DuplicateEnum,
  EnumMismatch,
  ItemSchemaMissing,
  NullValueNotAllowed,
  PropertiesMismatch,
  PropertySchemaMissing,
  RequiredProperty,
  TypeMismatch,
} from '../../validation-failures';
import ValidationFailure from '../../validation-failures/validation-failure';

class BaseValidator {
  protected failures: ValidationFailure[];

  protected validated: boolean;

  constructor() {
    this.validated = false;
    this.failures = [];
  }

  public getFailures(): ValidationFailure[] {
    return this.failures;
  }

  public validateObjectAgainstSchema(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): void {
    const actualType = typeof actual;

    const invalidSchemaErrors = this.checkInvalidSchema(actual, expected, [
      ...path,
    ]);
    if (invalidSchemaErrors) {
      this.failures = [...this.failures, ...invalidSchemaErrors];
      return;
    }

    const expectedTypeError = this.checkExpectedType(actual, expected, [
      ...path,
    ]);

    if (expectedTypeError) {
      this.failures = [...this.failures, expectedTypeError];
      return;
    }

    const enumValueErrors = this.checkEnumValue(actual, expected, [...path]);
    if (enumValueErrors.length > 0) {
      this.failures = [...this.failures, ...enumValueErrors];
    }

    if (Array.isArray(actual)) {
      this.checkArrayItemSchema(actual, expected, [...path]);
    } else if (actualType === 'object') {
      this.checkObjectProperties(actual, expected, [...path]);
    }
  }

  private checkInvalidSchema(
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

  private checkExpectedType(
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

  private checkEnumValue(
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

  private checkArrayItemSchema(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): void {
    // check that the expected object's items property is set
    const itemSchema = expected.items;
    if (itemSchema) {
      // re-run for each item
      actual.forEach((item) => {
        this.validateObjectAgainstSchema(item, itemSchema, [...path]);
      });
    } else {
      this.failures = [...this.failures, new ItemSchemaMissing([...path])];
    }
  }

  private checkObjectProperties(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): void {
    const properties = expected.properties;

    // check that the expected object's properties field is set
    if (!properties) {
      this.failures = [...this.failures, new PropertySchemaMissing([...path])];
      return;
    }

    const actualProperties = Object.keys(actual);
    const expectedProperties = Object.keys(properties);

    // check that the actual object only contains properties present in expected object
    if (
      actualProperties.filter(
        (property) => !expectedProperties.includes(property),
      ).length > 0
    ) {
      this.failures = [
        ...this.failures,
        new PropertiesMismatch([...path], expectedProperties, actualProperties),
      ];
    }

    // check required values are present
    expected.required?.forEach((requiredProperty) => {
      if (!actualProperties.includes(requiredProperty)) {
        this.failures = [
          ...this.failures,
          new RequiredProperty([...path], requiredProperty),
        ];
      }
    });

    // re-un for each property that has a schema present
    Object.entries(actual)
      .filter(([propertyName]) => properties[propertyName])
      .forEach(([propertyName, propertyObject]) => {
        this.validateObjectAgainstSchema(
          propertyObject,
          properties[propertyName],
          [...path, propertyName],
        );
      });
  }
}

export default BaseValidator;
