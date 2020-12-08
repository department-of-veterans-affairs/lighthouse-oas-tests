export const SEPERATOR = '#';

// error messages
export const STATUS_CODE_MISMATCH_ERROR =
  'Response status code not present in schema';
export const CONTENT_TYPE_MISMATCH_ERROR =
  'Response content type not present in schema';
export const DUPLICATE_ENUMS_ERROR = 'Schema enum contains duplicate values';
export const ENUM_MISMATCH_ERROR = 'Actual value does not match schema enum';
export const TYPE_MISMATCH_ERROR = 'Actual type did not match schema';
export const ITEMS_MISSING_ERROR =
  'The items property is required for array schemas';
export const PROPERTIES_MISSING_ERROR =
  'The properties property is required for object schemas';
export const PROPERTIES_MISMATCH_ERROR =
  'Actual object contains a property not present in schema';
export const MISSING_REQUIRED_PROPERTY_ERROR =
  'Actual object missing required property';

// error message context prefixes
export const STATUS_CODE_PREFIX = 'Actual status code:';
export const CONTENT_TYPE_PREFIX = 'Actual content type:';
export const PATH_PREFIX = 'Path:';
export const ENUM_PREFIX = 'Enum values:';
export const SCHEMA_TYPE_PREFIX = 'Schema type:';
export const ACTUAL_TYPE_PREFIX = 'Actual type:';
export const SCHEMA_PROPERTIES_PREFIX = 'Schema properties:';
export const ACTUAL_PROPERTIES_PREFIX = 'Actual properties:';
export const REQUIRED_PROPERTY_PREFIX = 'Required property:';
export const ACTUAL_VALUE_PREFIX = 'Actual value:';
