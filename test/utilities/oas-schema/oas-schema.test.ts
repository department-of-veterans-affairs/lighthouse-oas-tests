import loadJsonFile from 'load-json-file';
import { Swagger, Security } from 'swagger-client';
import OASOperation from '../../../src/utilities/oas-operation';
import OASSchema from '../../../src/utilities/oas-schema';

describe('OASSchema', () => {
  const generateSchema = async (filePath: string): Promise<OASSchema> => {
    const json = await loadJsonFile(filePath);
    return new OASSchema({
      spec: json,
    });
  };

  describe('getOperations', () => {
    const callGetOperations = async (
      filePath: string,
    ): Promise<OASOperation[]> => {
      const schema = await generateSchema(filePath);
      return schema.getOperations();
    };

    it('gets parameters from forms_oas.json', async () => {
      const filePath = 'test/fixtures/forms_oas.json';

      const operations = await callGetOperations(filePath);

      expect(operations).toHaveLength(2);
      expect(operations[0].operationId).toEqual('findForms');
      expect(operations[1].operationId).toEqual('findFormByFormName');
    });

    it('gets parameters from facitilities_oas.json', async () => {
      const filePath = 'test/fixtures/facilities_oas.json';

      const operations = await callGetOperations(filePath);

      expect(operations).toHaveLength(5);
      expect(operations[0].operationId).toEqual('getAllFacilities');
      expect(operations[1].operationId).toEqual('getFacilityById');
      expect(operations[2].operationId).toEqual('getFacilitiesByLocation');
      expect(operations[3].operationId).toEqual('getFacilityIds');
      expect(operations[4].operationId).toEqual('getNearbyFacilities');
    });
  });

  describe('execute', () => {
    let operationObject;

    beforeEach(() => {
      operationObject = {
        operationId: 'getFacilityById',
        responses: {},
        parameters: [
          {
            name: 'id',
            in: 'query',
            required: true,
            example: 'testId',
            schema: {
              type: 'string',
              description: 'a number',
            },
          },
        ],
      };
    });

    it('calls the provided operation with the provided parameters without apiKey', async () => {
      const operation = new OASOperation(operationObject);
      const executeMock = jest.fn(
        (_arg) => new Promise((resolve) => resolve(_arg)),
      );
      const filePath = 'test/fixtures/facilities_oas.json';
      const schema = await generateSchema(filePath);

      schema.client = new Promise((resolve) => {
        resolve(({
          execute: executeMock,
        } as unknown) as Swagger);
      });

      const [exampleGroup] = operation.exampleGroups;
      const securities: Security = {};

      await schema.execute(operation, exampleGroup, securities);

      expect(executeMock).toHaveBeenCalledWith({
        operationId: 'getFacilityById',
        parameters: {
          id: 'testId',
        },
        securities: {
          authorized: {},
        },
      });
    });
  });

  describe('getSecuritySchemes', () => {
    describe('with securitySchemes set in the components object', () => {
      it('returns all security schemes', async () => {
        const filePath = 'test/fixtures/facilities_oas.json';
        const schema = await generateSchema(filePath);
        const securitySchemes = await schema.getSecuritySchemes();

        expect(securitySchemes).toEqual([
          {
            description: undefined,
            key: 'apikey',
            type: 'apiKey',
            name: 'apikey',
            in: 'header',
          },
        ]);
      });
    });

    describe('with spec level securities', () => {
      describe('without any securitySchemes set in the components object', () => {
        it('returns an empty array', async () => {
          const filePath = 'test/fixtures/simple_forms_oas.json';
          const schema = await generateSchema(filePath);
          const securitySchemes = await schema.getSecuritySchemes();

          expect(securitySchemes).toEqual([]);
        });
      });
    });
  });
});
