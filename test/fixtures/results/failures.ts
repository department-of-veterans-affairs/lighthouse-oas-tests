import {
  DuplicateEnum,
  InvalidParameterExample,
  MissingContentSchemaObject,
  MissingRequiredParameters,
  RequiredProperty,
  TypeMismatch,
  ValidationFailure,
} from '../../../src/validation-messages/failures';

const responseTypeMisMatch = new TypeMismatch(
  ['body', 'age'],
  'number',
  'string',
);
responseTypeMisMatch.incrementCount();

const requiredGlassesProperty = new RequiredProperty(['body'], 'glasses');

const requiredHouseProperty = new RequiredProperty(['body'], 'house');

const invalidParameterExample = new InvalidParameterExample([
  'parameters',
  'name',
]);

const parameterMissingContentSchemaObject = new MissingContentSchemaObject([
  'parameters',
  'howler',
  'content',
  'application/json',
]);

const requestBodyMissingContentSchemaObject = new MissingContentSchemaObject([
  'requestBody',
  'content',
  'application/json',
]);

const requestBodyTypeMismatch = new TypeMismatch(
  ['requestBody', 'example', 'colors'],
  'array',
  'string',
);

const duplicateEnum = new DuplicateEnum(
  ['requestBody', 'example', 'house'],
  ['Gryffindor', 'Hufflepuff', 'Slytherin', 'Hufflepuff'],
);

const missingRequiredParameters = new MissingRequiredParameters([
  'name',
  'age',
]);

export const twoFailureMap = new Map<string, ValidationFailure>([
  [responseTypeMisMatch.hash, responseTypeMisMatch],
  [requiredGlassesProperty.hash, requiredGlassesProperty],
]);

export const oneFailureMap = new Map<string, ValidationFailure>([
  [requiredHouseProperty.hash, requiredHouseProperty],
]);

export const emptyFailureMap = new Map<string, ValidationFailure>();

export const parameterSchemaFailureMap = new Map<string, ValidationFailure>([
  [invalidParameterExample.hash, invalidParameterExample],
  [
    parameterMissingContentSchemaObject.hash,
    parameterMissingContentSchemaObject,
  ],
]);

export const requestBodyFailureMap = new Map<string, ValidationFailure>([
  [
    requestBodyMissingContentSchemaObject.hash,
    requestBodyMissingContentSchemaObject,
  ],
  [requestBodyTypeMismatch.hash, requestBodyTypeMismatch],
  [duplicateEnum.hash, duplicateEnum],
]);

export const exampleGroupFailureMap = new Map<string, ValidationFailure>([
  [missingRequiredParameters.hash, missingRequiredParameters],
]);
