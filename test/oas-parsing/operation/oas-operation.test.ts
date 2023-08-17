import OASOperation from '../../../src/oas-parsing/operation';
import { OperationObject } from 'swagger-client';
import { operationSimpleGet } from '../../fixtures/utilities/oas-operations';
import {
  DEFAULT_REQUEST_BODY,
  REQUIRED_FIELDS_REQUEST_BODY,
} from '../../../src/utilities/constants';

describe('OASOperation', () => {
  const baseOperation = {
    operationId: 'getHobbits',
    parameters: [
      {
        name: 'family',
        in: 'query',
        description: '',
        schema: {
          description: '',
          type: 'string',
        },
        required: true,
        examples: {
          baggins: {
            value: 'baggins',
          },
        },
      },
      {
        name: 'age',
        in: 'query',
        description: '',
        schema: {
          description: '',
          type: 'integer',
        },
        examples: {
          baggins: {
            value: 111,
          },
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            description: 'Request body to submit to get hobbits',
            type: 'object',
            required: ['age', 'home'],
            properties: {
              age: {
                type: 'string',
                description: 'Age as a string',
                example: 'eleventy one',
              },
              home: {
                type: 'string',
                example: 'The Shire',
              },
              hobby: {
                type: 'string',
                description: "Hobbit's favorite hobby",
                example: 'eating',
              },
            },
          },
        },
      },
    },
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
  } as OperationObject;

  const operation = new OASOperation({ ...baseOperation });

  describe('getOperationId', () => {
    it('returns the operation ID', () => {
      expect(operation.operationId).toEqual('getHobbits');
    });
  });

  describe('getExampleGroups', () => {
    it('returns the example groups', () => {
      const exampleGroups = operation.exampleGroups;
      expect(exampleGroups).toHaveLength(2);
      expect(exampleGroups[0].name).toEqual('baggins');
    });
  });

  describe('getExampleRequestBodies', () => {
    it('returns the example request bodies', () => {
      const exampleRequestBodies = operation.exampleRequestBodies;
      expect(exampleRequestBodies).toHaveLength(2);

      const defaultExampleRequestBody = exampleRequestBodies.find(
        (exampleRequestBody) =>
          exampleRequestBody.name === DEFAULT_REQUEST_BODY,
      );
      expect(defaultExampleRequestBody).toBeDefined();

      const defaultRequestBody = defaultExampleRequestBody?.requestBody;
      expect(defaultRequestBody).toBeDefined();
      if (defaultRequestBody !== undefined) {
        expect(Object.keys(defaultRequestBody)).toHaveLength(3);
        expect(defaultRequestBody.age).toEqual('eleventy one');
        expect(defaultRequestBody.home).toEqual('The Shire');
        expect(defaultRequestBody.hobby).toEqual('eating');
      }

      const requiredFieldsExampleRequestBody = exampleRequestBodies.find(
        (exampleRequestBody) =>
          exampleRequestBody.name === REQUIRED_FIELDS_REQUEST_BODY,
      );
      expect(requiredFieldsExampleRequestBody).toBeDefined();

      const requiredFieldsRequestBody =
        requiredFieldsExampleRequestBody?.requestBody;
      expect(requiredFieldsRequestBody).toBeDefined();
      if (requiredFieldsRequestBody !== undefined) {
        expect(Object.keys(requiredFieldsRequestBody)).toHaveLength(2);
        expect(requiredFieldsRequestBody.age).toEqual('eleventy one');
        expect(requiredFieldsRequestBody.home).toEqual('The Shire');
      }
    });
  });

  describe('getRequiredParameters', () => {
    it('returns the names of all required parameters', () => {
      expect(operation.requiredParameterNames).toEqual(['family']);
    });

    it('returns an empty array if there are no parameters', () => {
      expect(operationSimpleGet.requiredParameterNames).toEqual([]);
    });
  });

  describe('getParameters', () => {
    it('returns the underlying parameters schema', () => {
      expect(operation.parameters).toEqual(
        expect.arrayContaining([
          {
            name: 'family',
            in: 'query',
            description: '',
            schema: {
              description: '',
              type: 'string',
            },
            required: true,
            examples: {
              baggins: {
                value: 'baggins',
              },
            },
          },
          {
            name: 'age',
            in: 'query',
            description: '',
            schema: {
              description: '',
              type: 'integer',
            },
            examples: {
              baggins: {
                value: 111,
              },
            },
          },
        ]),
      );
    });
  });

  describe('getParameter', () => {
    it('returns the underlying parameter schema for a given parameter', () => {
      expect(operation.getParameter('family')).toEqual({
        name: 'family',
        in: 'query',
        description: '',
        schema: {
          description: '',
          type: 'string',
        },
        required: true,
        examples: {
          baggins: {
            value: 'baggins',
          },
        },
      });
    });

    it('returns null if parameter is not found', () => {
      expect(operation.getParameter('idk, elf or something')).toBeNull();
    });

    it('returns null if there are no parameters', () => {
      expect(operationSimpleGet.getParameter('middleName')).toBeNull();
    });
  });

  describe('getResponse', () => {
    it('returns the underlying schema for a given status code as a number', () => {
      expect(operation.getResponseSchema(200)).toEqual({
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              description: '',
              type: 'string',
            },
          },
        },
      });
    });

    it('returns the underlying schema for a given status code as a string', () => {
      expect(operation.getResponseSchema('200')).toEqual({
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              description: '',
              type: 'string',
            },
          },
        },
      });
    });

    it('returns null if the response is not found', () => {
      expect(operation.getResponseSchema(683)).toBeNull();
    });
  });

  describe('getSecurity', () => {
    describe('security exists on operation only', () => {
      it('returns operation level security if it exists', () => {
        const secureOperation = new OASOperation({
          ...baseOperation,
          security: [{ 'faramir-security': [] }],
        });

        expect(secureOperation.security).toEqual([{ key: 'faramir-security' }]);
      });
    });

    describe('security does not exists on operation or spec', () => {
      it('returns empty', () => {
        const unsecureOperation = new OASOperation({
          ...baseOperation,
        });

        expect(unsecureOperation.security).toEqual([]);
      });
    });

    describe('security exists on spec only', () => {
      it('returns spec level security', () => {
        const specLevelSecurityOperation = new OASOperation(
          { ...baseOperation },
          [{ 'boromir-security': [] }],
        );

        expect(specLevelSecurityOperation.security).toEqual([
          { key: 'boromir-security' },
        ]);
      });
    });

    describe('security exists on operation and spec', () => {
      it('returns the operation level security', () => {
        const mixedLevelSecurityOperation = new OASOperation(
          {
            ...baseOperation,
            security: [{ 'faramir-security': [] }],
          },
          [{ 'boromir-security': [] }],
        );

        expect(mixedLevelSecurityOperation.security).toEqual([
          { key: 'faramir-security' },
        ]);
      });
    });

    describe('security exists on spec but is set as optional on operation', () => {
      it('returns empty', () => {
        const mixedLevelSecurityOperation = new OASOperation(
          {
            ...baseOperation,
            security: [],
          },
          [{ 'boromir-security': [] }],
        );

        expect(mixedLevelSecurityOperation.security).toEqual([]);
      });
    });
  });
});
