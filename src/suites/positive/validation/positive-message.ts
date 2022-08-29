import { Severity, MessageTemplate, Message } from '../../../validation';

export enum Type {
  EmptyArray,
  MissingProperties,
  ContentTypeMismatch,
  DuplicateEnum,
  EnumMismatch,
  InvalidParameterContent,
  InvalidParameterExample,
  InvalidParameterObject,
  InvalidResponse,
  ItemSchemaMissing,
  MissingContentSchemaObject,
  MissingRequiredParameters,
  NullValueNotAllowed,
  PropertiesMismatch,
  PropertySchemaMissing,
  RequiredProperty,
  StatusCodeMismatch,
  TypeMismatch,
  UnableToParseResponseBody,
}

const messageTemplates: Record<Type, MessageTemplate> = {
  [Type.EmptyArray]: {
    severity: Severity.WARNING,
    details:
      'Warning: This array was found to be empty and therefore could not be validated.',
  },
  [Type.MissingProperties]: {
    severity: Severity.WARNING,
    details:
      'Warning: This object is missing non-required properties that were unable to be validated, including {0}.',
  },
  [Type.ContentTypeMismatch]: {
    severity: Severity.ERROR,
    details:
      'Response content type not present in schema. Actual content type: {0}',
  },
  [Type.DuplicateEnum]: {
    severity: Severity.ERROR,
    details: 'Schema enum contains duplicate values. Enum values: {0}.',
  },
  [Type.EnumMismatch]: {
    severity: Severity.ERROR,
    details:
      'Actual value does not match schema enum. Enum values: {0}. Actual value: {1}.',
  },
  [Type.InvalidParameterContent]: {
    severity: Severity.ERROR,
    details: 'Parameter content object should only have one key.',
  },
  [Type.InvalidParameterExample]: {
    severity: Severity.ERROR,
    details: `The 'example' field is mutually exclusive of the 'examples' field, provide one or the other or neither, but not both.`,
  },
  [Type.InvalidParameterObject]: {
    severity: Severity.ERROR,
    details:
      'Parameter object must have either schema or content set, but not both.',
  },
  [Type.InvalidResponse]: {
    severity: Severity.ERROR,
    details: 'Response status code was a non 2XX value: {0}',
  },
  [Type.ItemSchemaMissing]: {
    severity: Severity.ERROR,
    details: 'The items property is required for array schemas.',
  },
  [Type.MissingContentSchemaObject]: {
    severity: Severity.ERROR,
    details:
      'The media type obejct in the content field is missing a schema object.',
  },
  [Type.MissingRequiredParameters]: {
    severity: Severity.ERROR,
    details: 'Missing required parameters: [{0}]',
  },
  [Type.NullValueNotAllowed]: {
    severity: Severity.ERROR,
    details: 'Actual value is null but schema does not allow null values.',
  },
  [Type.PropertiesMismatch]: {
    severity: Severity.ERROR,
    details:
      'Actual object contains a property not present in schema. Actual properties not expected: {0}.{1}',
  },
  [Type.PropertySchemaMissing]: {
    severity: Severity.ERROR,
    details: 'The properties property is required for object schemas.',
  },
  [Type.RequiredProperty]: {
    severity: Severity.ERROR,
    details: 'Actual object missing required property. Required property: {0}.',
  },
  [Type.StatusCodeMismatch]: {
    severity: Severity.ERROR,
    details:
      'Response status code not present in schema. Actual status code: {0}',
  },
  [Type.TypeMismatch]: {
    severity: Severity.ERROR,
    details:
      'Actual type did not match schema. Schema type: {0}. Actual type: {1}.',
  },
  [Type.UnableToParseResponseBody]: {
    severity: Severity.WARNING,
    details:
      'Unable to auto-parse response body, skipping schema validation. Only JSON and YAML are supported. Body content type: {0}',
  },
};

class PositiveMessage extends Message {
  constructor(type: unknown, path: string[], _properties?: string[]) {
    super(type, path, _properties);

    this.template = messageTemplates[type as Type];

    this.message = this.resolveMessage(_properties);
    this._hash = this.generateHash();
  }
}

export default PositiveMessage;
