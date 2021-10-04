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
  ValidationFailure,
} from '../../validation-messages/failures';
import {
  EmptyArray,
  MissingProperties,
  ValidationWarning,
} from '../../validation-messages/warnings';

abstract class BaseValidator {
  protected _failures: ValidationFailure[];

  protected _warnings: ValidationWarning[];

  protected validated: boolean;

  constructor() {
    this.validated = false;
    this._failures = [];
    this._warnings = [];
  }

  public get failures(): ValidationFailure[] {
    return this._failures;
  }

  public get warnings(): ValidationWarning[] {
    return this._warnings;
  }

  abstract performValidation(): void;

  public validate = (): void => {
    if (this.validated) {
      return;
    }

    this.performValidation();

    this.validated = true;
  };

  public validateObjectAgainstSchema(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): void {
    const actualType = typeof actual;
    let returnEarly = false;

    returnEarly = this.checkInvalidSchema(actual, expected, [...path]);

    if (returnEarly || actual === null) {
      return;
    }

    returnEarly = this.checkExpectedType(actual, expected, [...path]);

    if (returnEarly) {
      return;
    }

    this.checkEnumValue(actual, expected, [...path]);

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
  ): boolean {
    // if the actual object is null check that null values are allowed
    if (actual === null) {
      if (!expected.nullable) {
        this._failures = [
          ...this._failures,
          new NullValueNotAllowed([...path]),
        ];
        return true;
      }
    }
    return false;
  }

  private checkExpectedType(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): boolean {
    const actualType = typeof actual;
    let isUnexpectedType = false;

    if (!expected.type) {
      return isUnexpectedType;
    }
    if (expected.type === 'array') {
      // check that the actual object is an array
      isUnexpectedType = !Array.isArray(actual);
    } else if (expected.type === 'integer') {
      // check that the actual value is an integer
      isUnexpectedType = !Number.isInteger(actual);
    } else if (actualType !== expected.type) {
      // check that type matches for other types
      isUnexpectedType = true;
    }

    if (isUnexpectedType) {
      this._failures = [
        ...this._failures,
        new TypeMismatch([...path], expected.type, actualType),
      ];
    }

    return isUnexpectedType;
  }

  private checkEnumValue(
    actual: Json,
    expected: SchemaObject,
    path: string[],
  ): void {
    const enumValues = expected.enum;
    if (enumValues) {
      // check that expected enum does not contain duplicate values
      const uniqueEnumValues = uniqWith(enumValues, isEqual);
      if (uniqueEnumValues.length !== enumValues.length) {
        this._failures = [
          ...this._failures,
          new DuplicateEnum([...path], enumValues),
        ];
      }

      // check that the actual object matches an element in the expected enum
      const filteredEnum = enumValues.filter((value) => isEqual(value, actual));
      if (filteredEnum.length === 0) {
        this._failures = [
          ...this._failures,
          new EnumMismatch([...path], enumValues, actual),
        ];
      }
    }
  }

  private checkArrayItemSchema(
    actual: Json[],
    expected: SchemaObject,
    path: string[],
  ): void {
    // check that the expected object's items property is set
    const itemSchema = expected.items;
    if (itemSchema) {
      if (actual.length === 0) {
        this._warnings = [...this._warnings, new EmptyArray(path)];
      } else {
        // re-run for each item
        actual.forEach((item) => {
          this.validateObjectAgainstSchema(item, itemSchema, [...path]);
        });
      }
    } else {
      this._failures = [...this._failures, new ItemSchemaMissing([...path])];
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
      this._failures = [
        ...this._failures,
        new PropertySchemaMissing([...path]),
      ];
      return;
    }

    const actualProperties = Object.keys(actual);
    const expectedProperties = Object.keys(properties);
    const unexpectedActualProperties = actualProperties.filter(
      (property) => !expectedProperties.includes(property),
    );

    // check that the actual object only contains properties present in expected object
    if (unexpectedActualProperties.length > 0) {
      const expectedPropertiesNotFound = expectedProperties.filter(
        (property) => !actualProperties.includes(property),
      );

      this._failures = [
        ...this._failures,
        new PropertiesMismatch(
          [...path],
          expectedPropertiesNotFound,
          unexpectedActualProperties,
        ),
      ];
    }

    // check required values are present
    expected.required?.forEach((requiredProperty) => {
      if (!actualProperties.includes(requiredProperty)) {
        this._failures = [
          ...this._failures,
          new RequiredProperty([...path], requiredProperty),
        ];
      }
    });

    const optionalProperties = expectedProperties.filter(
      (property) => !expected.required?.includes(property),
    );

    const missingOptionalProperties = optionalProperties.filter(
      (property) => !actualProperties.includes(property),
    );

    if (missingOptionalProperties.length > 0) {
      this._warnings = [
        ...this._warnings,
        new MissingProperties(missingOptionalProperties, path),
      ];
    }

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
