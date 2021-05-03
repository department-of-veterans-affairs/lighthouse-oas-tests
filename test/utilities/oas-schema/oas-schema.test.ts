import loadJsonFile from 'load-json-file';
import * as swagger from 'swagger-client';
import OASOperation from '../../../src/utilities/oas-operation';
import OasSchema from '../../../src/utilities/oas-schema';

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
      const filePath = 'test/fixtures/forms_oas_security_fix.json';
      const schema = await generateSchema(filePath);
      const [exampleGroup] = operation.exampleGroups;
      // eslint-disable-next-line no, @typescript-eslint/no-explicit-any
      (swagger.default as any).execute = executeMock;

      await schema.execute(operation, exampleGroup);

      expect(executeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          operationId: 'getFacilityById',
          parameters: {
            id: 'testId',
          },
        }),
      );
    });

    it('calls the provided operation with the provided parameters with apiKey', async () => {
      operationObject.security = {
        apikey: [],
      };
      const operation = new OASOperation(operationObject);
      const executeMock = jest.fn(
        (_arg) => new Promise((resolve) => resolve(_arg)),
      );
      const filePath = 'test/fixtures/forms_oas_security_fix.json';
      const schema = await generateSchema(filePath);
      const [exampleGroup] = operation.exampleGroups;
      // eslint-disable-next-line no, @typescript-eslint/no-explicit-any
      (swagger.default as any).execute = executeMock;

      await schema.execute(operation, exampleGroup, {
        apiKey: 'three-golden-hairs',
      });
      expect(executeMock).toHaveBeenCalledWith(
        expect.objectContaining({
          operationId: 'getFacilityById',
          parameters: {
            id: 'testId',
          },
        }),
      );
    });
  });

  describe('getTopSecurities', () => {
    it('gets the top securities on the spec', async () => {
      const filePath = 'test/fixtures/top_level_security.json';
      const schema = await generateSchema(filePath);
      const securities = await schema.getTopSecurities();
      expect(securities).toHaveLength(1);
      expect(securities[0].key).toBe('apikey');
    });
  });
});
