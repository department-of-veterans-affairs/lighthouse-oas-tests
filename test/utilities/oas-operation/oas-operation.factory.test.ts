import { OASOperationFactory } from '../../../src/utilities/oas-operation';

describe('OASOperationFactory', () => {
  describe('buildFromPaths', () => {
    it('returns all operations', () => {
      const result = OASOperationFactory.buildFromPaths({
        '/hobbits/all': {
          get: {
            operationId: 'getAllHobbits',
            parameters: [],
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
            parameters: [],
            responses: {},
          },
          post: {
            operationId: 'postAHobbit',
            parameters: [],
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
            parameters: [],
            responses: {},
          },
          post: {
            operationId: 'postAHobbit',
            parameters: [],
            responses: {},
          },
        },
        '/hobbits/all': {
          get: {
            operationId: 'getAllHobbits',
            parameters: [],
            responses: {},
          },
        },
      });

      expect(result).toHaveLength(3);
      expect(result[0].operationId).toEqual('getAHobbit');
      expect(result[1].operationId).toEqual('postAHobbit');
      expect(result[2].operationId).toEqual('getAllHobbits');
    });
  });
});
