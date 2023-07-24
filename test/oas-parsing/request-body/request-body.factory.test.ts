import { OperationObject } from 'swagger-client';
import OASOperation from '../../../src/oas-parsing/operation/oas-operation';
import RequestBodyFactory from '../../../src/oas-parsing/request-body/request-body.factory';
import ExampleRequestBody from '../../../src/oas-parsing/request-body/example-request-body';
import {
  DEFAULT_REQUEST_BODY,
  REQUIRED_FIELDS_REQUEST_BODY,
} from '../../../src/utilities/constants';
import { emptyExampleRequestBody } from '../../fixtures/utilities/example-request-bodies';

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

const requestBody = {
  age: 'eleventy one',
  home: 'The Shire',
  hobby: 'eating',
};

const requiredFieldsRequestBody = {
  age: 'eleventy one',
  home: 'The Shire',
};

const expectedDefaultExampleRequestBody = new ExampleRequestBody(
  DEFAULT_REQUEST_BODY,
  requestBody,
);

const expectedRequiredFieldsExampleRequestBody = new ExampleRequestBody(
  REQUIRED_FIELDS_REQUEST_BODY,
  requiredFieldsRequestBody,
);

it('RequestBodyFactory.buildFromOperation() returns ExampleRequestBodies from MediaTypeObject example', () => {
  oasOperationObject.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          required: ['age', 'home'],
        },
        example: requestBody,
      },
    },
  };

  const oasOperation = new OASOperation(oasOperationObject);
  const exampleRequestBodies =
    RequestBodyFactory.buildFromOperation(oasOperation);

  expect(exampleRequestBodies).toHaveLength(2);
  expect(exampleRequestBodies).toContainEqual(
    expectedDefaultExampleRequestBody,
  );
  expect(exampleRequestBodies).toContainEqual(
    expectedRequiredFieldsExampleRequestBody,
  );
});

it('RequestBodyFactory.buildFromOperation() returns one ExampleRequestBody when default and required fields request bodies are the same', () => {
  oasOperationObject.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          required: ['age', 'home', 'hobby'],
        },
        example: requestBody,
      },
    },
  };

  const oasOperation = new OASOperation(oasOperationObject);
  const exampleRequestBodies =
    RequestBodyFactory.buildFromOperation(oasOperation);

  expect(exampleRequestBodies).toHaveLength(1);
  expect(exampleRequestBodies).toContainEqual(
    expectedDefaultExampleRequestBody,
  );
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
  expect(exampleRequestBodies).toContainEqual(
    expectedDefaultExampleRequestBody,
  );
  expect(exampleRequestBodies).toContainEqual(
    expectedRequiredFieldsExampleRequestBody,
  );
});

it('RequestBodyFactory.buildFromOperation() returns empty ExampleRequestBody when operation does not require a request body', () => {
  oasOperationObject.requestBody = undefined;
  const oasOperation = new OASOperation(oasOperationObject);
  const exampleRequestBodies =
    RequestBodyFactory.buildFromOperation(oasOperation);

  expect(exampleRequestBodies).toHaveLength(1);
  expect(exampleRequestBodies).toContainEqual(emptyExampleRequestBody);
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
  expect(exampleRequestBodies).toContainEqual(emptyExampleRequestBody);
});
