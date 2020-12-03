export const errorMessages = {
  STATUS_CODE_MISMATCH: 'Response status code not present in schema',
  CONTENT_TYPE_MISMATCH: 'Response content type not present in schema',
  DUPLICATE_ENUMS: 'Schema enum contains duplicate values',
  ENUM_MISMATCH: 'Actual value does not match schema enum',
  TYPE_MISMATCH: 'Actual type did not match schema',
  ITEMS_MISSING: 'The items property is required for array schemas',
  PROPERTIES_MISSING: 'The properties property is required for object schemas',
  PROPERTIES_MISMATCH:
    'Actual object contains a property not present in schema',
  MISSING_REQUIRED_PROPERTY: 'Actual object missing required property',
};

export const errorContextPrefixes = {
  STATUS_CODE: 'Actual status code:',
  CONTENT_TYPE: 'Actual content type:',
  PATH: 'Path:',
  ENUM: 'Enum values:',
  SCHEMA_TYPE: 'Schema type:',
  ACTUAL_TYPE: 'Actual type:',
  SCHEMA_PROPERTIES: 'Schema properties:',
  ACTUAL_PROPERTIES: 'Actual properties:',
  REQUIRED_PROPERTY: 'Required property:',
  ACTUAL_VALUE: 'Actual value:',
};
