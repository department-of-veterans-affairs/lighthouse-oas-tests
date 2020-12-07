import loadJsonFile from 'load-json-file';
import { Swagger } from 'swagger-client';
import OasSchema from '../../src/utilities/oas-schema';

describe('OASSchema', () => {
  const generateSchema = async (filePath: string): Promise<OasSchema> => {
    const json = await loadJsonFile(filePath);
    return new OasSchema({
      spec: json,
    });
  };

  describe('getParameters', () => {
    const callGetParameters = async (
      filePath: string,
    ): Promise<ReturnType<OasSchema['getParameters']>> => {
      const schema = await generateSchema(filePath);
      return schema.getParameters();
    };

    it('gets parameters from forms_oas.json', async () => {
      const filePath = 'test/fixtures/forms_oas.json';

      const expectedParameters = {
        findForms: {},
        findFormByFormName: { form_name: 'VA10192' },
      };

      const parameters = await callGetParameters(filePath);

      expect(parameters).toEqual(expectedParameters);
    });

    it('gets parameters from facitilities_oas.json', async () => {
      const filePath = 'test/fixtures/facilities_oas.json';

      const expectedParameters = {
        getAllFacilities: { Accept: 'application/geo+json' },
        getFacilityById: { id: 'vha_688' },
        getFacilitiesByLocation: { zip: '20005' },
        getFacilityIds: {},
        getNearbyFacilities: [
          {
            street_address: '1350 I St. NW',
            city: 'Washington',
            state: 'DC',
            zip: '20005',
          },
          {
            lat: 123.4,
            lng: 456.7,
          },
        ],
      };

      const parameters = await callGetParameters(filePath);

      expect(parameters).toEqual(expectedParameters);
    });

    describe('examples grouping is present', () => {
      it('gets parameters from exmple_groups_oas.json', async () => {
        const filePath = 'test/fixtures/example_groups_oas.json';

        const expectedParameters = {
          getNearbyFacilities: [
            {
              street_address: '1350 I St. NW',
              city: 'Washington',
              state: 'DC',
              zip: '20005',
              page: 1,
              per_page: 20,
            },
            {
              lat: 123.4,
              lng: 456.7,
              page: 1,
              per_page: 20,
            },
          ],
        };

        const parameters = await callGetParameters(filePath);

        expect(parameters).toEqual(expectedParameters);
      });
    });
  });

  describe('getOperationIds', () => {
    const callGetOperationIds = async (filePath: string): Promise<string[]> => {
      const schema = await generateSchema(filePath);
      return schema.getOperationIds();
    };

    it('gets parameters from forms_oas.json', async () => {
      const filePath = 'test/fixtures/forms_oas.json';

      const expectedOperationIds = ['findForms', 'findFormByFormName'];

      const operationIds = await callGetOperationIds(filePath);

      expect(operationIds).toEqual(expectedOperationIds);
    });

    it('gets parameters from facitilities_oas.json', async () => {
      const filePath = 'test/fixtures/facilities_oas.json';

      const expectedOperationIds = [
        'getAllFacilities',
        'getFacilityById',
        'getFacilitiesByLocation',
        'getFacilityIds',
        'getNearbyFacilities',
      ];

      const operationIds = await callGetOperationIds(filePath);

      expect(operationIds).toEqual(expectedOperationIds);
    });
  });

  describe('execute', () => {
    it('calls the provided operation with the provided parameters', async () => {
      const executeMock = jest.fn(
        (_arg) => new Promise((resolve) => resolve()),
      );
      const filePath = 'test/fixtures/facilities_oas.json';
      const schema = await generateSchema(filePath);

      schema.client = new Promise((resolve) => {
        resolve(({
          execute: executeMock,
        } as unknown) as Swagger);
      });

      await schema.execute('getFacilityById', {
        id: 'testId',
      });

      expect(executeMock).toHaveBeenCalledWith({
        operationId: 'getFacilityById',
        parameters: {
          id: 'testId',
        },
      });
    });
  });
});
