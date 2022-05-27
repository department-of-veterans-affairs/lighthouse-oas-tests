import OASOperation from '../../../src/utilities/oas-operation';
import {
  requestBodyMissingSchema,
  requestBodyWithFailures,
  requestBodyValid,
} from './request-bodies';

export const operationSimpleGet = new OASOperation({
  operationId: 'GET:/harryPotter',
  responses: {},
});

export const operationGetWithExampleGroups = new OASOperation({
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

export const operationPutStudentValidRequestBody = new OASOperation({
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
  requestBody: requestBodyValid,
});

export const operationPutStudentRequestBodyMissingSchema = new OASOperation({
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

export const operationPutStudentRequestBodyFailures = new OASOperation({
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
  requestBody: requestBodyWithFailures,
});
