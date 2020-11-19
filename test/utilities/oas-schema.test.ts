import loadJsonFile from 'load-json-file';
import { Swagger, Response, SchemaObject } from 'swagger-client';
import OasSchema from '../../src/utilities/oas-schema';
import OASSchema from '../../src/utilities/oas-schema';

describe('OASSchema', () => {
  const generateSchema = async (filePath: string): Promise<OASSchema> => {
    const json = await loadJsonFile(filePath);
    return new OASSchema({
      spec: json,
    });
  };
  describe('getParameters', () => {
    const callGetParameters = async (
      filePath: string,
    ): Promise<{
      [operationId: string]: { [name: string]: string };
    }> => {
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
      const executeMock = jest.fn(() => new Promise((resolve) => resolve()));
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

  describe('validateResponse', () => {
    describe('response status code not in OAS', () => {
      it('throws an error', async () => {
        const filePath = 'test/fixtures/forms_oas.json';
        const schema = await generateSchema(filePath);

        const response: Response = {
          ok: false,
          status: 500,
          url: 'http://anything.com',
          headers: {},
          body: {},
        };

        await expect(async () => {
          await schema.validateResponse('findForms', response);
        }).rejects.toThrow('Response status code not present in schema');
      });
    });

    describe('response status code is in the OAS', () => {
      describe('Response content type does is not in the OAS', () => {
        it('throws an error', async () => {
          const filePath = 'test/fixtures/forms_oas.json';
          const schema = await generateSchema(filePath);

          const response: Response = {
            ok: true,
            status: 200,
            url: 'http://anything.com',
            headers: {
              'content-type': 'text/csv',
            },
            body: {},
          };

          await expect(async () => {
            await schema.validateResponse('findForms', response);
          }).rejects.toThrow('Response content type not present in schema');
        });
      });

      describe('Response content type is in the OAS', () => {
        it('calls validateObjectAgainstSchema with the response body', async () => {
          const filePath = 'test/fixtures/simple_forms_oas.json';
          const schema = await generateSchema(filePath);
          const originalValidateObjectAgainstSchema =
            OasSchema.validateObjectAgainstSchema;
          OasSchema.validateObjectAgainstSchema = jest.fn();

          const response: Response = {
            ok: false,
            status: 200,
            url: 'http://anything.com',
            headers: {
              'content-type': 'application/json',
            },
            body: {
              data: 'test',
            },
          };

          await schema.validateResponse('findForms', response);
          expect(OasSchema.validateObjectAgainstSchema).toHaveBeenCalledWith(
            response.body,
            {
              type: 'object',
              required: ['data'],
              properties: {
                data: {
                  type: 'string',
                },
              },
            },
          );
          OasSchema.validateObjectAgainstSchema = originalValidateObjectAgainstSchema;
        });
      });
    });
  });

  describe('validateObjectAgainstSchema', () => {
    const validateSpy = jest.spyOn(OasSchema, 'validateObjectAgainstSchema');
    beforeEach(() => {
      validateSpy.mockClear();
    });
    describe('schema expects a string', () => {
      const schema: SchemaObject = {
        type: 'string',
        description: 'a string',
      };

      describe('object is a string', () => {
        it('does nothing', () => {
          expect(
            OasSchema.validateObjectAgainstSchema('This is a string', schema),
          ).toBeFalsy();
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = ['test', 'anything'];
          });

          describe('enum contains duplicate values', () => {
            let originalEnum;
            beforeAll(() => {
              originalEnum = schema.enum;
              schema.enum = ['test', 'test', 'anything'];
            });

            it('throws an error', () => {
              expect(() =>
                OasSchema.validateObjectAgainstSchema('does not match', schema),
              ).toThrow('Schema enum contains duplicate values');
            });

            afterAll(() => {
              schema.enum = originalEnum;
            });
          });

          describe('object matches enum', () => {
            it('does nothing', () => {
              expect(
                OasSchema.validateObjectAgainstSchema('test', schema),
              ).toBeFalsy();
            });
          });

          describe('object does not match enum', () => {
            it('throws an error', () => {
              expect(() =>
                OasSchema.validateObjectAgainstSchema('does not match', schema),
              ).toThrow('Object does not match enum');
            });
          });

          afterAll(() => {
            schema.enum = undefined;
          });
        });
      });

      describe('object is not a string', () => {
        it('throws an error', () => {
          expect(() =>
            OasSchema.validateObjectAgainstSchema(42, schema),
          ).toThrow('Object type did not match schema');
        });
      });
    });

    describe('schema expects a number', () => {
      const schema: SchemaObject = {
        type: 'number',
        description: 'a number',
      };

      describe('object is a number', () => {
        it('does nothing', () => {
          expect(OasSchema.validateObjectAgainstSchema(42, schema)).toBeFalsy();
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [42, 56];
          });

          describe('object matches enum', () => {
            it('does nothing', () => {
              expect(
                OasSchema.validateObjectAgainstSchema(42, schema),
              ).toBeFalsy();
            });
          });

          describe('object does not match enum', () => {
            it('throws an error', () => {
              expect(() =>
                OasSchema.validateObjectAgainstSchema(100, schema),
              ).toThrow('Object does not match enum');
            });
          });

          describe('enum contains duplicate values', () => {
            let originalEnum;
            beforeAll(() => {
              originalEnum = schema.enum;
              schema.enum = [42, 42, 56];
            });

            it('throws an error', () => {
              expect(() =>
                OasSchema.validateObjectAgainstSchema(100, schema),
              ).toThrow('Schema enum contains duplicate values');
            });

            afterAll(() => {
              schema.enum = originalEnum;
            });
          });

          afterAll(() => {
            schema.enum = undefined;
          });
        });
      });

      describe('object is not a number', () => {
        it('throws an error', () => {
          expect(() =>
            OasSchema.validateObjectAgainstSchema('this is a string', schema),
          ).toThrow('Object type did not match schema');
        });
      });
    });

    describe('schema expects an array', () => {
      const schema: SchemaObject = {
        type: 'array',
        items: {
          type: 'number',
          description: 'a number',
        },
        description: 'an array of number',
      };

      describe('object is not an array', () => {
        it('throws an error', () => {
          expect(() =>
            OasSchema.validateObjectAgainstSchema('this is a string', schema),
          ).toThrow('Object type did not match schema');
        });
      });

      describe('object is an array', () => {
        describe('items property is not defined in schema', () => {
          let originalItems;
          beforeEach(() => {
            originalItems = schema.items;
            schema.items = undefined;
          });
          it('throws an error', () => {
            expect(() =>
              OasSchema.validateObjectAgainstSchema([42], schema),
            ).toThrow('Array schema missing items property');
          });

          afterEach(() => {
            schema.items = originalItems;
          });
        });
        it('calls validateObjectAgainstSchema once for each child', () => {
          OasSchema.validateObjectAgainstSchema([42, 56], schema);

          // Once for the call in the test, and once for each member in the array
          expect(validateSpy).toHaveBeenCalledTimes(3);
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [
              [42, 56],
              [100, 200],
            ];
          });

          describe('object matches enum', () => {
            it('does nothing', () => {
              expect(
                OasSchema.validateObjectAgainstSchema([42, 56], schema),
              ).toBeFalsy();
            });
          });

          describe('object does not match enum', () => {
            it('throws an error', () => {
              expect(() =>
                OasSchema.validateObjectAgainstSchema([42, 100], schema),
              ).toThrow('Object does not match enum');
            });
          });

          describe('enum contains duplicate values', () => {
            let originalEnum;
            beforeAll(() => {
              originalEnum = schema.enum;
              schema.enum = [
                [42, 56],
                [100, 200],
                [42, 56],
              ];
            });

            it('throws an error', () => {
              expect(() =>
                OasSchema.validateObjectAgainstSchema([100, 200], schema),
              ).toThrow('Schema enum contains duplicate values');
            });

            afterAll(() => {
              schema.enum = originalEnum;
            });
          });

          afterAll(() => {
            schema.enum = undefined;
          });
        });
      });
    });

    describe('schema expects an object', () => {
      const schema: SchemaObject = {
        type: 'object',
        required: [],
        properties: {
          value: {
            type: 'string',
            description: 'a string',
          },
        },
        description: 'schema for an object',
      };

      describe('object is not an object', () => {
        it('throws an error', () => {
          expect(() =>
            OasSchema.validateObjectAgainstSchema('this is a string', schema),
          ).toThrow('Object type did not match schema');
        });
      });

      describe('object is an object', () => {
        describe('object has a property not listed in schema', () => {
          it('throws an error', () => {
            expect(() => {
              OasSchema.validateObjectAgainstSchema(
                { fake: 'property' },
                schema,
              );
            }).toThrow('Object contains a property not present in schema');
          });
        });

        describe('object is missing a required value', () => {
          beforeEach(() => {
            schema.required = ['value'];
          });

          it('throws an error', () => {
            expect(() => {
              OasSchema.validateObjectAgainstSchema({}, schema);
            }).toThrow('Object missing required property: value');
          });

          afterEach(() => {
            schema.required = [];
          });
        });

        describe('object has properties', () => {
          it('calls validateObjectAgainstSchema with the properties', () => {
            OasSchema.validateObjectAgainstSchema(
              {
                value: 'string',
              },
              schema,
            );

            // Once for the call in the test, and once for it's property
            expect(validateSpy).toHaveBeenCalledTimes(2);
          });
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [{ value: 'test' }, { value: 'anything' }];
          });

          describe('object matches enum', () => {
            it('does nothing', () => {
              expect(
                OasSchema.validateObjectAgainstSchema(
                  { value: 'test' },
                  schema,
                ),
              ).toBeFalsy();
            });
          });

          describe('object does not match enum', () => {
            it('throws an error', () => {
              expect(() =>
                OasSchema.validateObjectAgainstSchema(
                  { value: 'does not match' },
                  schema,
                ),
              ).toThrow('Object does not match enum');
            });
          });

          describe('enum contains duplicate values', () => {
            let originalEnum;
            beforeAll(() => {
              originalEnum = schema.enum;
              schema.enum = [
                { value: 'test' },
                { value: 'anything' },
                { value: 'test' },
              ];
            });

            it('throws an error', () => {
              expect(() =>
                OasSchema.validateObjectAgainstSchema(
                  { value: 'does not match' },
                  schema,
                ),
              ).toThrow('Schema enum contains duplicate values');
            });

            afterAll(() => {
              schema.enum = originalEnum;
            });
          });

          afterAll(() => {
            schema.enum = undefined;
          });
        });
      });
    });
  });
});
