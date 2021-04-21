import { ExampleGroupFactory } from '../../src/utilities/example-group';
import OASOperation from '../../src/utilities/oas-operation';

describe('ExampleGroupFactory', () => {
  describe('getExampleGroups', () => {
    it('returns examples in the default group when no groups are present', () => {
      const operation = new OASOperation({
        operationId: '123',
        responses: {},
        parameters: [
          {
            name: 'age',
            in: 'query',
            required: true,
            example: 111,
            schema: {
              type: 'integer',
              description: 'a number',
            },
          },
          {
            name: 'family',
            in: 'query',
            required: true,
            example: 'baggins',
            schema: {
              type: 'string',
              description: 'a string',
            },
          },
        ],
      });
      const groups = ExampleGroupFactory.buildFromOperation(operation);

      expect(groups).toHaveLength(1);
      const defaultGroup = groups[0];
      expect(defaultGroup.name).toEqual('default');
      expect(defaultGroup.examples).toEqual({
        age: 111,
        family: 'baggins',
      });
    });

    it('does not return non-required values', () => {
      const operation = new OASOperation({
        operationId: '123',
        responses: {},
        parameters: [
          {
            name: 'age',
            in: 'query',
            required: true,
            example: 111,
            schema: {
              type: 'integer',
              description: 'a number',
            },
          },
          {
            name: 'family',
            in: 'query',
            required: false,
            example: 'baggins',
            schema: {
              type: 'string',
              description: 'a string',
            },
          },
        ],
      });
      const groups = ExampleGroupFactory.buildFromOperation(operation);

      expect(groups).toHaveLength(1);
      const defaultGroup = groups[0];
      expect(defaultGroup.examples).toEqual({
        age: 111,
      });
    });

    it('returns grouped parameters', () => {
      const operation = new OASOperation({
        operationId: '123',
        responses: {},
        parameters: [
          {
            name: 'age',
            in: 'query',
            examples: {
              personal: {
                value: 111,
              },
            },
            schema: {
              type: 'integer',
              description: 'a number',
            },
          },
          {
            name: 'family',
            in: 'query',
            examples: {
              personal: {
                value: 'baggins',
              },
            },
            schema: {
              type: 'string',
              description: 'a string',
            },
          },
        ],
      });
      const groups = ExampleGroupFactory.buildFromOperation(operation);

      expect(groups).toHaveLength(2);
      const group = groups[0];
      expect(group.name).toEqual('personal');
      expect(group.examples).toEqual({
        age: 111,
        family: 'baggins',
      });
    });

    it('includes all required examples in any groups', () => {
      const operation = new OASOperation({
        operationId: '123',
        responses: {},
        parameters: [
          {
            name: 'age',
            in: 'query',
            required: true,
            example: 111,
            schema: {
              type: 'integer',
              description: 'a number',
            },
          },
          {
            name: 'family',
            in: 'query',
            required: false,
            examples: {
              personal: {
                value: 'baggins',
              },
            },
            schema: {
              type: 'string',
              description: 'a string',
            },
          },
        ],
      });
      const groups = ExampleGroupFactory.buildFromOperation(operation);

      expect(groups).toHaveLength(2);
      const group = groups[0];
      expect(group.name).toEqual('personal');
      expect(group.examples).toEqual({
        age: 111,
        family: 'baggins',
      });
    });

    it('returns all groups present', () => {
      const operation = new OASOperation({
        operationId: '123',
        responses: {},
        parameters: [
          {
            name: 'age',
            in: 'query',
            required: true,
            example: 111,
            schema: {
              type: 'integer',
              description: 'a number',
            },
          },
          {
            name: 'family',
            in: 'query',
            required: false,
            examples: {
              personal: {
                value: 'baggins',
              },
              temporary: {
                value: 'underhill',
              },
            },
            schema: {
              type: 'string',
              description: 'a string',
            },
          },
        ],
      });
      const groups = ExampleGroupFactory.buildFromOperation(operation);

      expect(groups).toHaveLength(3);
      const firstGroup = groups[0];
      expect(firstGroup.name).toEqual('personal');
      expect(firstGroup.examples).toEqual({
        age: 111,
        family: 'baggins',
      });
      const secondGroup = groups[1];
      expect(secondGroup.name).toEqual('temporary');
      expect(secondGroup.examples).toEqual({
        age: 111,
        family: 'underhill',
      });
    });
  });
});
