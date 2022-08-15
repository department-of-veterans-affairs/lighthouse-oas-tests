import ValidationMessage, {
  Type,
} from '../../../src/validation/validation-message';

const responseTypeMisMatch = new ValidationMessage(
  Type.TypeMismatch,
  ['body', 'age'],
  ['number', 'string'],
);
responseTypeMisMatch.incrementCount();

const requiredGlassesProperty = new ValidationMessage(
  Type.RequiredProperty,
  ['body'],
  ['glasses'],
);

const requiredHouseProperty = new ValidationMessage(
  Type.RequiredProperty,
  ['body'],
  ['house'],
);

const invalidParameterExample = new ValidationMessage(
  Type.InvalidParameterExample,
  ['parameters', 'name'],
);

const parameterMissingContentSchemaObject = new ValidationMessage(
  Type.MissingContentSchemaObject,
  ['parameters', 'howler', 'content', 'application/json'],
);

const requestBodyMissingContentSchemaObject = new ValidationMessage(
  Type.MissingContentSchemaObject,
  ['requestBody', 'content', 'application/json'],
);

const requestBodyTypeMismatch = new ValidationMessage(
  Type.TypeMismatch,
  ['requestBody', 'example', 'colors'],
  ['array', 'string'],
);

const duplicateEnum = new ValidationMessage(
  Type.DuplicateEnum,
  ['requestBody', 'example', 'house'],
  [JSON.stringify(['Gryffindor', 'Hufflepuff', 'Slytherin', 'Hufflepuff'])],
);

const missingRequiredParameters = new ValidationMessage(
  Type.MissingRequiredParameters,
  [],
  ['name', 'age'],
);

export const responseFailuresMap = new Map<string, ValidationMessage>([
  [responseTypeMisMatch.hash, responseTypeMisMatch],
  [requiredGlassesProperty.hash, requiredGlassesProperty],
]);

export const responseOneFailureMap = new Map<string, ValidationMessage>([
  [requiredHouseProperty.hash, requiredHouseProperty],
]);

export const emptyFailureMap = new Map<string, ValidationMessage>();

export const parameterSchemaFailureMap = new Map<string, ValidationMessage>([
  [invalidParameterExample.hash, invalidParameterExample],
  [
    parameterMissingContentSchemaObject.hash,
    parameterMissingContentSchemaObject,
  ],
]);

export const requestBodyFailureMap = new Map<string, ValidationMessage>([
  [
    requestBodyMissingContentSchemaObject.hash,
    requestBodyMissingContentSchemaObject,
  ],
  [requestBodyTypeMismatch.hash, requestBodyTypeMismatch],
  [duplicateEnum.hash, duplicateEnum],
]);

export const exampleGroupFailureMap = new Map<string, ValidationMessage>([
  [missingRequiredParameters.hash, missingRequiredParameters],
]);
