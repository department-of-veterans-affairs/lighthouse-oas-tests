import loadJsonFile from 'load-json-file';
import { SwaggerClient, SecurityValues } from 'swagger-client';
import OASOperation from '../../../src/oas-parsing/operation';
import OASSchema from '../../../src/oas-parsing/schema';
import OASServer from '../../../src/oas-parsing/server/oas-server';
import {
  securitySchemeAPIKey,
  securitySchemeTeacherAPIKey,
} from '../../fixtures/utilities/oas-security-schemes';
import { DEFAULT_REQUEST_BODY } from '../../../src/utilities/constants';

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
      const filePath = 'test/fixtures/oas/forms_oas.json';

      const operations = await callGetOperations(filePath);

      expect(operations).toHaveLength(2);
      expect(operations[0].operationId).toEqual('findForms');
      expect(operations[1].operationId).toEqual('findFormByFormName');
    });

    it('gets parameters from facitilities_oas.json', async () => {
      const filePath = 'test/fixtures/oas/facilities_oas.json';

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
          {
            name: 'Accept',
            in: 'header',
            required: true,
            example: 'application/geo+json',
            schema: {
              type: 'string',
              enum: [
                'application/geo+json',
                'application/vnd.geo+json',
                'text/csv',
              ],
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id'],
                properties: {
                  id: {
                    type: 'string',
                    example: 'secondTestId',
                  },
                  zip: {
                    type: 'string',
                    example: '00000',
                  },
                },
              },
            },
          },
        },
      };
    });

    it('calls the provided operation with the provided parameters and request bodies without apiKey', async () => {
      const operation = new OASOperation(operationObject);
      const executeMock = jest.fn(
        (_arg) => new Promise((resolve) => resolve(_arg)),
      );
      const filePath = 'test/fixtures/oas/facilities_oas.json';
      const schema = await generateSchema(filePath);

      schema.client = {
        execute: executeMock,
      } as unknown as SwaggerClient;

      const [exampleGroup] = operation.exampleGroups;
      const securities: SecurityValues = {};
      const server =
        'https://sandbox-api.va.gov/services/va_facilities/{version}';

      const requiredFieldsRequestBody = operation.exampleRequestBodies.find(
        (exampleRequestBody) =>
          exampleRequestBody.name === DEFAULT_REQUEST_BODY,
      )?.requestBody;
      expect(requiredFieldsRequestBody).toBeDefined;

      if (requiredFieldsRequestBody !== undefined) {
        await schema.execute(
          operation,
          exampleGroup,
          securities,
          requiredFieldsRequestBody,
          server,
        );
      }

      expect(executeMock).toHaveBeenCalledWith({
        operationId: 'getFacilityById',
        parameters: {
          id: 'testId',
          Accept: 'application/geo+json',
        },
        requestBody: {
          id: 'secondTestId',
          zip: '00000',
        },
        securities: {
          authorized: {},
        },
        server,
        responseContentType: 'application/geo+json',
      });
    });
  });

  describe('getRelevantSecuritySchemes', () => {
    it('returns an empty string when no operations use security', async () => {
      const filePath = 'test/fixtures/oas/security/no_security_oas.json';
      const schema = await generateSchema(filePath);
      const { relevantSecuritySchemes } =
        await schema.getRelevantSecuritySchemes();
      expect(relevantSecuritySchemes).toEqual([]);
    });

    it('returns securitySchemes are missing in missingSecuritySchemes', async () => {
      const filePath =
        'test/fixtures/oas/security/missing_security_scheme_oas.json';
      const schema = await generateSchema(filePath);
      const { missingSecuritySchemes } =
        await schema.getRelevantSecuritySchemes();
      expect(missingSecuritySchemes).toEqual(['teacher']);
    });

    it('returns relevant securitySchemes', async () => {
      const filePath = 'test/fixtures/oas/security/valid_securities_oas.json';
      const schema = await generateSchema(filePath);
      const { relevantSecuritySchemes } =
        await schema.getRelevantSecuritySchemes();
      expect(relevantSecuritySchemes).toHaveLength(2);
      expect(relevantSecuritySchemes).toContainEqual(securitySchemeAPIKey);
      expect(relevantSecuritySchemes).toContainEqual(
        securitySchemeTeacherAPIKey,
      );
    });
  });

  describe('getServers', () => {
    describe('servers is set in the OAS', () => {
      it('returns OASServers', async () => {
        const filePath = 'test/fixtures/oas/facilities_oas.json';
        const schema = await generateSchema(filePath);
        const oasServers = await schema.getServers();

        expect(oasServers).toEqual([
          new OASServer(
            'https://sandbox-api.va.gov/services/va_facilities/{version}',
          ),
          new OASServer('https://api.va.gov/services/va_facilities/{version}'),
        ]);
      });
    });
    describe('servers is not set in the OAS', () => {
      it('returns an empty array', async () => {
        const filePath = 'test/fixtures/oas/simple_forms_oas.json';
        const schema = await generateSchema(filePath);
        const oasServers = await schema.getServers();

        expect(oasServers).toEqual([]);
      });
    });
  });
});
