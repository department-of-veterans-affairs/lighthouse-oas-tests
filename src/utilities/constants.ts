export const errorMessages = {
  DUPLICATE_ENUMS: 'Schema enum contains duplicate values',
  ENUM_MISMATCH: 'Actual value does not match schema enum',
  TYPE_MISMATCH: 'Actual type did not match schema',
  ITEMS_MISSING: 'The items property is required for array schemas',
  PROPERTIES_MISSING: 'The properties property is required for object schemas',
  PROPERTIES_MISMATCH:
    'Actual object contains a property not present in schema',
  MISSING_REQUIRED_PROPERTY: 'Actual object missing required property',
};
