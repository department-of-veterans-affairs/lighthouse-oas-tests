import { isEqual, uniqWith } from 'lodash';
import { Json, SchemaObject } from 'swagger-client/schema';
import { BaseValidator } from '../../../validation';
import { Message } from '../../../validation';
import PositiveMessage, { Type } from './positive-message';

abstract class PositiveValidator extends BaseValidator {
  protected _failures: Map<string, Message>;
  protected _warnings: Map<string, Message>;

  constructor() {
    super();
    this._failures = new Map();
    this._warnings = new Map();
  }

  public get failures(): Map<string, Message> {
    return this._failures;
  }

  public get warnings(): Map<string, Message> {
    return this._warnings;
  }

  public addMessage(type: Type, path: string[], props?: string[]): void {
    const message = new PositiveMessage(type, path, props);
    const map = message.isError() ? this._failures : this._warnings;
    const existingMessage = map.get(message.hash);

    if (existingMessage) {
      existingMessage.incrementCount();
    } else {
      map.set(message.hash, message);
    }
  }

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
        this.addMessage(Type.NullValueNotAllowed, path);
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
      this.addMessage(Type.TypeMismatch, path, [expected.type, actualType]);
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
        this.addMessage(Type.DuplicateEnum, path, [JSON.stringify(enumValues)]);
      }

      // check that the actual object matches an element in the expected enum
      const filteredEnum = enumValues.filter((value) => isEqual(value, actual));
      if (filteredEnum.length === 0) {
        this.addMessage(Type.EnumMismatch, path, [
          JSON.stringify(enumValues),
          JSON.stringify(actual),
        ]);
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
        this.addMessage(Type.EmptyArray, path);
      } else {
        // re-run for each item
        actual.forEach((item) => {
          this.validateObjectAgainstSchema(item, itemSchema, [...path]);
        });
      }
    } else {
      this.addMessage(Type.ItemSchemaMissing, path);
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
      this.addMessage(Type.PropertySchemaMissing, path);
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

      let expectPropStr = ''; // No other messages get this kind of conditional treatment. Should be rewritten
      if (expectedPropertiesNotFound.length > 0) {
        expectPropStr = ` Schema properties not found: ${expectedPropertiesNotFound.join(
          ', ',
        )}.`;
      }

      this.addMessage(Type.PropertiesMismatch, path, [
        unexpectedActualProperties.join(', '),
        expectPropStr,
      ]);
    }

    // check required values are present
    expected.required?.forEach((requiredProperty) => {
      if (!actualProperties.includes(requiredProperty)) {
        this.addMessage(Type.RequiredProperty, path, [requiredProperty]);
      }
    });

    const optionalProperties = expectedProperties.filter(
      (property) => !expected.required?.includes(property),
    );

    const missingOptionalProperties = optionalProperties.filter(
      (property) => !actualProperties.includes(property),
    );

    if (missingOptionalProperties.length > 0) {
      this.addMessage(Type.MissingProperties, path, [
        missingOptionalProperties.join(', '),
      ]);
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

export default PositiveValidator;
