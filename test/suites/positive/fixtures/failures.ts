import Message from '../../../../src/validation/message';
import {
  PositiveMessage,
  Type,
} from '../../../../src/suites/positive/validation';

const responseTypeMisMatch = new PositiveMessage(
  Type.TypeMismatch,
  ['body', 'age'],
  ['number', 'string'],
);
responseTypeMisMatch.incrementCount();

const requiredGlassesProperty = new PositiveMessage(
  Type.RequiredProperty,
  ['body'],
  ['glasses'],
);

const requiredHouseProperty = new PositiveMessage(
  Type.RequiredProperty,
  ['body'],
  ['house'],
);

const invalidParameterExample = new PositiveMessage(
  Type.InvalidParameterExample,
  ['parameters', 'name'],
);

const parameterMissingContentSchemaObject = new PositiveMessage(
  Type.MissingContentSchemaObject,
  ['parameters', 'howler', 'content', 'application/json'],
);

const requestBodyMissingContentSchemaObject = new PositiveMessage(
  Type.MissingContentSchemaObject,
  ['requestBody', 'content', 'application/json'],
);

const requestBodyTypeMismatch = new PositiveMessage(
  Type.TypeMismatch,
  ['requestBody', 'example', 'colors'],
  ['array', 'string'],
);

const duplicateEnum = new PositiveMessage(
  Type.DuplicateEnum,
  ['requestBody', 'example', 'house'],
  [JSON.stringify(['Gryffindor', 'Hufflepuff', 'Slytherin', 'Hufflepuff'])],
);

const missingRequiredParameters = new PositiveMessage(
  Type.MissingRequiredParameters,
  [],
  ['name', 'age'],
);

export const responseFailuresMap = new Map<string, Message>([
  [responseTypeMisMatch.hash, responseTypeMisMatch],
  [requiredGlassesProperty.hash, requiredGlassesProperty],
]);

export const responseOneFailureMap = new Map<string, Message>([
  [requiredHouseProperty.hash, requiredHouseProperty],
]);

export const emptyFailureMap = new Map<string, Message>();

export const parameterSchemaFailureMap = new Map<string, Message>([
  [invalidParameterExample.hash, invalidParameterExample],
  [
    parameterMissingContentSchemaObject.hash,
    parameterMissingContentSchemaObject,
  ],
]);

export const requestBodyFailureMap = new Map<string, Message>([
  [
    requestBodyMissingContentSchemaObject.hash,
    requestBodyMissingContentSchemaObject,
  ],
  [requestBodyTypeMismatch.hash, requestBodyTypeMismatch],
  [duplicateEnum.hash, duplicateEnum],
]);

export const exampleGroupFailureMap = new Map<string, Message>([
  [missingRequiredParameters.hash, missingRequiredParameters],
]);
