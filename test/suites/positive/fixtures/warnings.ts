import Message from '../../../../src/validation/message';
import {
  PositiveMessage,
  Type,
} from '../../../../src/suites/positive/validation';

const missingPropertyMiddleName = new PositiveMessage(
  Type.ResponseMissingProperties,
  ['body'],
  [['middleName'].join(', ')],
);
missingPropertyMiddleName.incrementCount();

const missingPropertyAddress2 = new PositiveMessage(
  Type.ResponseMissingProperties,
  ['body', 'horcruxes', 'location'],
  [['address2'].join(', ')],
);

const requestBodyMissingProperties = new PositiveMessage(
  Type.RequestBodyMissingProperties,
  ['requestBody', 'example', 'horcruxes', 'location'],
  [['address2', 'name'].join(', ')],
);

export const responseWarningsMap = new Map<string, Message>([
  [missingPropertyMiddleName.hash, missingPropertyMiddleName],
  [missingPropertyAddress2.hash, missingPropertyAddress2],
]);

export const responseOneWarningMap = new Map<string, Message>([
  [missingPropertyMiddleName.hash, missingPropertyMiddleName],
]);

export const emptyWarningMap = new Map<string, Message>();

export const requestBodyWarningMap = new Map<string, Message>([
  [requestBodyMissingProperties.hash, requestBodyMissingProperties],
]);

export const requestResponseWarningMap = new Map<string, Message>([
  ...requestBodyWarningMap,
  ...responseWarningsMap,
]);
