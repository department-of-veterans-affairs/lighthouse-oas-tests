import { OperationObject } from 'swagger-client';
import OASOperation from '../../../src/oas-parsing/operation/oas-operation';
import RequestBodyFactory from '../../../src/oas-parsing/request-body/request-body.factory';
import {
  exampleRequestBodyEmpty,
  exampleRequestBodyDefault,
  exampleRequestBodyRequiredOnly,
} from '../../fixtures/utilities/example-request-bodies';
import { requestBodyOptionalPropertiesMediaTypeExample } from '../../fixtures/utilities/oas-request-bodies';

const oasOperationObject: OperationObject = {
  operationId: 'postHobbit',
  responses: {
    '200': {
      description: 'Success',
      content: {
        'application/json': {
          schema: {
            description: '',
            type: 'string',
          },
        },
      },
    },
  },
};

it('RequestBodyFactory.buildFromOperation() returns ExampleRequestBodies from MediaTypeObject example', () => {
  oasOperationObject.requestBody =
    requestBodyOptionalPropertiesMediaTypeExample;

  const oasOperation = new OASOperation(oasOperationObject);
  const exampleRequestBodies =
    RequestBodyFactory.buildFromOperation(oasOperation);

  expect(exampleRequestBodies).toHaveLength(2);
  expect(exampleRequestBodies).toContainEqual(exampleRequestBodyDefault);
  expect(exampleRequestBodies).toContainEqual(exampleRequestBodyRequiredOnly);
});

it('RequestBodyFactory.buildFromOperation() returns one ExampleRequestBody when default and required fields request bodies are the same', () => {
  oasOperationObject.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['age', 'home', 'hobby'],
          properties: {
            age: {
              type: 'string',
            },
            home: {
              type: 'string',
            },
            hobby: {
              type: 'string',
            },
          },
        },
        example: {
          age: 'eleventy one',
          home: 'The Shire',
          hobby: 'eating',
        },
      },
    },
  };

  const oasOperation = new OASOperation(oasOperationObject);
  const exampleRequestBodies =
    RequestBodyFactory.buildFromOperation(oasOperation);

  expect(exampleRequestBodies).toHaveLength(1);
  expect(exampleRequestBodies).toContainEqual(exampleRequestBodyDefault);
});

it('RequestBodyFactory.buildFromOperation() returns ExampleRequestBodies from MediaTypeObject schema examples', () => {
  oasOperationObject.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['age', 'home'],
          properties: {
            age: {
              type: 'string',
              example: 'eleventy one',
            },
            home: {
              type: 'string',
              example: 'The Shire',
            },
            hobby: {
              type: 'string',
              example: 'eating',
            },
          },
        },
      },
    },
  };

  const oasOperation = new OASOperation(oasOperationObject);
  const exampleRequestBodies =
    RequestBodyFactory.buildFromOperation(oasOperation);

  expect(exampleRequestBodies).toHaveLength(2);
  expect(exampleRequestBodies).toContainEqual(exampleRequestBodyDefault);
  expect(exampleRequestBodies).toContainEqual(exampleRequestBodyRequiredOnly);
});

it('RequestBodyFactory.buildFromOperation() returns empty ExampleRequestBody when operation does not require a request body', () => {
  oasOperationObject.requestBody = undefined;
  const oasOperation = new OASOperation(oasOperationObject);
  const exampleRequestBodies =
    RequestBodyFactory.buildFromOperation(oasOperation);

  expect(exampleRequestBodies).toHaveLength(1);
  expect(exampleRequestBodies).toContainEqual(exampleRequestBodyEmpty);
});

it('RequestBodyFactory.buildFromOperation() returns empty ExampleRequestBody when schema properties are not set', () => {
  oasOperationObject.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['age', 'home', 'hobby'],
        },
      },
    },
  };

  const oasOperation = new OASOperation(oasOperationObject);
  const exampleRequestBodies =
    RequestBodyFactory.buildFromOperation(oasOperation);

  expect(exampleRequestBodies).toHaveLength(1);
  expect(exampleRequestBodies).toContainEqual(exampleRequestBodyEmpty);
});
