import { ParameterObject, SchemaObject } from 'swagger-client';
import ValidationFailure from '../../validation-failures/validation-failure';

export type CheckParameterObject = {
  schema: SchemaObject | null;
  parameterObjectFailure: ValidationFailure | null;
};

export type OperationParameters = {
  [parameterName: string]: ParameterObject;
};
