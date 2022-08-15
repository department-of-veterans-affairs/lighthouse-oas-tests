import { OASOperationFactory } from '../../../src/oas-parsing/operation';

describe('OASOperationFactory', () => {
  describe('buildFromPaths', () => {
    it('returns all operations', () => {
      const result = OASOperationFactory.buildFromPaths({
        '/hobbits/all': {
          get: {
            operationId: 'getAllHobbits',
            responses: {},
          },
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].operationId).toEqual('getAllHobbits');
    });

    it('returns all operations when a path contains multiple operations', () => {
      const result = OASOperationFactory.buildFromPaths({
        '/hobbits': {
          get: {
            operationId: 'getAHobbit',
            responses: {},
          },
          post: {
            operationId: 'postAHobbit',
            responses: {},
          },
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0].operationId).toEqual('getAHobbit');
      expect(result[1].operationId).toEqual('postAHobbit');
    });

    it('returns all operations when there are multiple paths', () => {
      const result = OASOperationFactory.buildFromPaths({
        '/hobbits': {
          get: {
            operationId: 'getAHobbit',
            responses: {},
          },
          post: {
            operationId: 'postAHobbit',
            responses: {},
          },
        },
        '/hobbits/all': {
          get: {
            operationId: 'getAllHobbits',
            responses: {},
          },
        },
      });

      expect(result).toHaveLength(3);
      expect(result[0].operationId).toEqual('getAHobbit');
      expect(result[1].operationId).toEqual('postAHobbit');
      expect(result[2].operationId).toEqual('getAllHobbits');
    });

    it('returns one example when parameters have the same name and in values', () => {
      const result = OASOperationFactory.buildFromPaths({
        '/nearby-avenger': {
          get: {
            operationId: 'getAHobbit',
            parameters: [
              {
                name: 'frodo',
                in: 'query',
                schema: {},
                example: 1,
                required: true,
              },
            ],
            responses: {},
          },
          parameters: [
            {
              name: 'frodo',
              in: 'query',
              schema: {},
              example: 20,
              required: true,
            },
          ],
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].operationId).toEqual('getAHobbit');
      expect(result[0].exampleGroups[0].examples).toEqual({ frodo: 1 });
    });

    it('returns one example object with both examples', () => {
      const result = OASOperationFactory.buildFromPaths({
        '/nearby-avenger': {
          get: {
            operationId: 'getAHobbit',
            parameters: [
              {
                name: 'frodo',
                in: 'query',
                schema: {},
                example: 1,
              },
            ],
            responses: {},
          },
          parameters: [
            {
              name: 'gollum',
              in: 'header',
              schema: {},
              example: 20,
              required: true,
            },
          ],
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].exampleGroups).toHaveLength(1);
    });
  });
});
