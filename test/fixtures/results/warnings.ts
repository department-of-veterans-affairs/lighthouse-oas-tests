import ValidationMessage, {
  Type,
} from '../../../src/utilities/validators/validation-message';

const missingPropertyMiddleName = new ValidationMessage(
  Type.MissingProperties,
  ['body'],
  [['middleName'].join(', ')],
);
missingPropertyMiddleName.incrementCount();

const missingPropertyAddress2 = new ValidationMessage(
  Type.MissingProperties,
  ['body', 'horcruxes', 'location'],
  [['address2'].join(', ')],
);

const requestBodyMissingProperties = new ValidationMessage(
  Type.MissingProperties,
  ['requestBody', 'example', 'horcruxes', 'location'],
  [['address2', 'name'].join(', ')],
);

export const responseWarningsMap = new Map<string, ValidationMessage>([
  [missingPropertyMiddleName.hash, missingPropertyMiddleName],
  [missingPropertyAddress2.hash, missingPropertyAddress2],
]);

export const responseOneWarningMap = new Map<string, ValidationMessage>([
  [missingPropertyMiddleName.hash, missingPropertyMiddleName],
]);

export const emptyWarningMap = new Map<string, ValidationMessage>();

export const requestBodyWarningMap = new Map<string, ValidationMessage>([
  [requestBodyMissingProperties.hash, requestBodyMissingProperties],
]);

export const requestResponseWarningMap = new Map<string, ValidationMessage>([
  ...requestBodyWarningMap,
  ...responseWarningsMap,
]);
