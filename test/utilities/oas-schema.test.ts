import loadJsonFile from 'load-json-file';
import { Swagger } from 'swagger-client';
import OASOperation from '../../src/utilities/oas-operation';
import OasSchema from '../../src/utilities/oas-schema';

describe('OASSchema', () => {
  const generateSchema = async (filePath: string): Promise<OasSchema> => {
    const json = await loadJsonFile(filePath);
    return new OasSchema({
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
      expect(operations[0].getOperationId()).toEqual('findForms');
      expect(operations[1].getOperationId()).toEqual('findFormByFormName');
    });

    it('gets parameters from facitilities_oas.json', async () => {
      const filePath = 'test/fixtures/facilities_oas.json';

      const operations = await callGetOperations(filePath);

      expect(operations).toHaveLength(5);
      expect(operations[0].getOperationId()).toEqual('getAllFacilities');
      expect(operations[1].getOperationId()).toEqual('getFacilityById');
      expect(operations[2].getOperationId()).toEqual('getFacilitiesByLocation');
      expect(operations[3].getOperationId()).toEqual('getFacilityIds');
      expect(operations[4].getOperationId()).toEqual('getNearbyFacilities');
    });
  });

  describe('execute', () => {
    it('calls the provided operation with the provided parameters', async () => {
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

      const operation = new OASOperation({
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
      });

      const exampleGroup = operation.getExampleGroups()[0];

      await schema.execute(operation, exampleGroup);

      expect(executeMock).toHaveBeenCalledWith({
        operationId: 'getFacilityById',
        parameters: {
          id: 'testId',
        },
      });
    });
  });
});
