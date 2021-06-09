import OASOperation from '../../../src/utilities/oas-operation';
import { OperationObject } from 'swagger-client';

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

  describe('getRequiredParameters', () => {
    it('returns the names of all required parameters', () => {
      expect(operation.requiredParameterNames).toEqual(['family']);
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
