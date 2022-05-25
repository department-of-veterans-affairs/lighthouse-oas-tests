import {
  MissingProperties,
  ValidationWarning,
} from '../../../src/validation-messages/warnings';

const missingPropertyMiddleName = new MissingProperties(
  ['middleName'],
  ['body'],
);
missingPropertyMiddleName.incrementCount();

const missingPropertyAddress2 = new MissingProperties(
  ['address2'],
  ['body', 'horcruxes', 'location'],
);

const requestBodyMissingProperties = new MissingProperties(
  ['address2', 'name'],
  ['requestBody', 'example', 'horcruxes', 'location'],
);

export const twoWarningMap = new Map<string, ValidationWarning>([
  [missingPropertyMiddleName.hash, missingPropertyMiddleName],
  [missingPropertyAddress2.hash, missingPropertyAddress2],
]);

export const oneWarningMap = new Map<string, ValidationWarning>([
  [missingPropertyMiddleName.hash, missingPropertyMiddleName],
]);

export const emptyWarningMap = new Map<string, ValidationWarning>();

export const requestBodyWarningMap = new Map<string, ValidationWarning>([
  [requestBodyMissingProperties.hash, requestBodyMissingProperties],
]);

export const requestResponseWarningMap = new Map<string, ValidationWarning>([
  ...requestBodyWarningMap,
  ...twoWarningMap,
]);
