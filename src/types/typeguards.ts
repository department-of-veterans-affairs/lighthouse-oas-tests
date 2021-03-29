import { ParameterWithSchema, ParameterWithContent } from 'swagger-client';

export const parameterHasSchema = (
  parameter,
): parameter is ParameterWithSchema => parameter.schema;

export const parameterHasContent = (
  parameter,
): parameter is ParameterWithContent => parameter.content;
