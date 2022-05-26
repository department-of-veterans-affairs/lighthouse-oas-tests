import OASOperation from '../../../src/utilities/oas-operation';
import {
  requestBodyMissingSchema,
  requestBodyWithBadExamples,
  validRequestBody,
} from './request-bodies';

export const harryPotterOperation = new OASOperation({
  operationId: 'GET:/harryPotter',
  responses: {},
});

export const heWhoMustNotBeNamedOperation = new OASOperation({
  operationId: 'GET:/he-who-must-not-be-named',
  responses: {},
  parameters: [
    {
      name: 'name',
      in: 'query',
      schema: { type: 'string' },
      examples: {
        default: { value: 'voldermort' },
        tomRiddle: { value: 'tomRiddle' },
      },
    },
  ],
});

export const updateStudentValidRequestBodyOperation = new OASOperation({
  operationId: 'PUT:/student/{id}',
  responses: {},
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: { type: 'string' },
      example: '123456',
      required: true,
    },
  ],
  requestBody: validRequestBody,
});

export const updateStudentRequestBodyMissingSchemaOperation = new OASOperation({
  operationId: 'PUT:/student/{id}',
  responses: {},
  parameters: [
    {
      name: 'id',
      in: 'path',
      schema: { type: 'string' },
      example: '123456',
      required: true,
    },
  ],
  requestBody: requestBodyMissingSchema,
});

export const updateStudentRequestBodyWithBadExamplesOperation =
  new OASOperation({
    operationId: 'PUT:/student/{id}',
    responses: {},
    parameters: [
      {
        name: 'id',
        in: 'path',
        schema: { type: 'string' },
        example: '123456',
        required: true,
      },
    ],
    requestBody: requestBodyWithBadExamples,
  });
