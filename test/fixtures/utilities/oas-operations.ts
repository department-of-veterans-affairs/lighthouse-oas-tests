import OASOperation from '../../../src/oas-parsing/operation';
import {
  requestBodyMissingSchema,
  requestBodyWithFailures,
  requestBodyOptionalPropertiesMediaTypeExample,
} from './oas-request-bodies';

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

export const operationWithExampleGroupsAndExampleRequestBodies =
  new OASOperation({
    operationId: 'POST:/hobbit',
    responses: {},
    parameters: [
      {
        name: 'name',
        in: 'query',
        schema: { type: 'string' },
        examples: {
          default: { value: 'bilbo' },
          frodo: { value: 'frodo' },
        },
      },
    ],
    requestBody: requestBodyOptionalPropertiesMediaTypeExample,
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
