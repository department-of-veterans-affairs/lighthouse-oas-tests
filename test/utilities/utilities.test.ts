import getParameters from '../../src/utilities/utilities';
import loadJsonFile from 'load-json-file';
import swaggerClient from 'swagger-client';

async function callGetParameters(
  filePath: string,
): Promise<{
  [operationId: string]: { [name: string]: string };
}> {
  const json = await loadJsonFile(filePath);
  const swaggerClientOptions: Parameters<typeof swaggerClient>[0] = {
    spec: json,
  };
  const schema = await swaggerClient(swaggerClientOptions);

  return getParameters(schema);
}

describe('getParameters', () => {
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
      getNearbyFacilities: {
        street_address: '1350 I St. NW',
        city: 'Washington',
        state: 'DC',
        zip: '20005',
      },
    };

    const parameters = await callGetParameters(filePath);

    expect(parameters).toEqual(expectedParameters);
  });
});
