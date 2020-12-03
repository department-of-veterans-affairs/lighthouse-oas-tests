import loadJsonFile from 'load-json-file';
import { Swagger, Response, SchemaObject } from 'swagger-client';
import OasSchema from '../../src/utilities/oas-schema';
import {
  errorMessages,
  errorContextPrefixes,
} from '../../src/utilities/constants';

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
        }).rejects.toThrow(
          `${errorMessages.STATUS_CODE_MISMATCH}. ${errorContextPrefixes.STATUS_CODE} 500`,
        );
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
          }).rejects.toThrow(
            `${errorMessages.CONTENT_TYPE_MISMATCH}. ${errorContextPrefixes.CONTENT_TYPE} text/csv`,
          );
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
            ['body'],
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
            OasSchema.validateObjectAgainstSchema('This is a string', schema, [
              'test',
            ]),
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
                OasSchema.validateObjectAgainstSchema(
                  'does not match',
                  schema,
                  ['body', 'facility', 'id'],
                ),
              ).toThrow(
                `${errorMessages.DUPLICATE_ENUMS}. ${
                  errorContextPrefixes.PATH
                } body -> facility -> id. ${
                  errorContextPrefixes.ENUM
                } ${JSON.stringify(schema.enum)}`,
              );
            });

            afterAll(() => {
              schema.enum = originalEnum;
            });
          });

          describe('object matches enum', () => {
            it('does nothing', () => {
              expect(
                OasSchema.validateObjectAgainstSchema('test', schema, [
                  'body',
                  'facility',
                  'id',
                ]),
              ).toBeFalsy();
            });
          });

          describe('object does not match enum', () => {
            it('throws an error', () => {
              const object = 'does not match';
              expect(() =>
                OasSchema.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'facility',
                  'id',
                ]),
              ).toThrow(
                `${errorMessages.ENUM_MISMATCH}. ${
                  errorContextPrefixes.PATH
                } body -> facility -> id. ${
                  errorContextPrefixes.ENUM
                } ${JSON.stringify(
                  schema.enum,
                )}. Actual value: ${JSON.stringify(object)}`,
              );
            });
          });

          afterAll(() => {
            schema.enum = undefined;
          });
        });
      });

      describe('object is not a string', () => {
        it('throws an error', () => {
          const object = 42;
          expect(() =>
            OasSchema.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'id',
            ]),
          ).toThrow(
            `${errorMessages.TYPE_MISMATCH}. ${errorContextPrefixes.PATH} body -> facility -> id. ${errorContextPrefixes.SCHEMA_TYPE} string. Actual type: number`,
          );
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
          expect(
            OasSchema.validateObjectAgainstSchema(42, schema, [
              'body',
              'facility',
              'lat',
            ]),
          ).toBeFalsy();
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [42, 56];
          });

          describe('object matches enum', () => {
            it('does nothing', () => {
              expect(
                OasSchema.validateObjectAgainstSchema(42, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toBeFalsy();
            });
          });

          describe('object does not match enum', () => {
            it('throws an error', () => {
              const object = 100;
              expect(() =>
                OasSchema.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toThrow(
                `${errorMessages.ENUM_MISMATCH}. ${
                  errorContextPrefixes.PATH
                } body -> facility -> lat. ${
                  errorContextPrefixes.ENUM
                } ${JSON.stringify(
                  schema.enum,
                )}. Actual value: ${JSON.stringify(object)}`,
              );
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
                OasSchema.validateObjectAgainstSchema(100, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toThrow(
                `${errorMessages.DUPLICATE_ENUMS}. ${
                  errorContextPrefixes.PATH
                } body -> facility -> lat. ${
                  errorContextPrefixes.ENUM
                } ${JSON.stringify(schema.enum)}`,
              );
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
          const object = 'this is a string';
          expect(() =>
            OasSchema.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'lat',
            ]),
          ).toThrow(
            `${errorMessages.TYPE_MISMATCH}. ${errorContextPrefixes.PATH} body -> facility -> lat. ${errorContextPrefixes.SCHEMA_TYPE} number. Actual type: string`,
          );
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
          const object = 'this is a string';
          expect(() =>
            OasSchema.validateObjectAgainstSchema(object, schema, [
              'body',
              'numbers',
            ]),
          ).toThrow(
            `${errorMessages.TYPE_MISMATCH}. ${errorContextPrefixes.PATH} body -> numbers. ${errorContextPrefixes.SCHEMA_TYPE} array. ${errorContextPrefixes.ACTUAL_TYPE} string`,
          );
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
              OasSchema.validateObjectAgainstSchema([42], schema, [
                'body',
                'numbers',
              ]),
            ).toThrow(
              `${errorMessages.ITEMS_MISSING}. ${errorContextPrefixes.PATH} body -> numbers`,
            );
          });

          afterEach(() => {
            schema.items = originalItems;
          });
        });

        it('calls validateObjectAgainstSchema once for each child', () => {
          OasSchema.validateObjectAgainstSchema([42, 56], schema, [
            'body',
            'numbers',
          ]);

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
                OasSchema.validateObjectAgainstSchema([42, 56], schema, [
                  'body',
                  'numbers',
                ]),
              ).toBeFalsy();
            });
          });

          describe('object does not match enum', () => {
            it('throws an error', () => {
              const object = [42, 100];
              expect(() =>
                OasSchema.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'numbers',
                ]),
              ).toThrow(
                `${errorMessages.ENUM_MISMATCH}. ${
                  errorContextPrefixes.PATH
                } body -> numbers. ${
                  errorContextPrefixes.ENUM
                } ${JSON.stringify(schema.enum)}. ${
                  errorContextPrefixes.ACTUAL_VALUE
                } ${JSON.stringify(object)}`,
              );
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
                OasSchema.validateObjectAgainstSchema([100, 200], schema, [
                  'body',
                  'numbers',
                ]),
              ).toThrow(
                `${errorMessages.DUPLICATE_ENUMS}. ${
                  errorContextPrefixes.PATH
                } body -> numbers. ${
                  errorContextPrefixes.ENUM
                } ${JSON.stringify(schema.enum)}`,
              );
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
          const object = 'this is a string';
          expect(() =>
            OasSchema.validateObjectAgainstSchema(object, schema, [
              'body',
              'form',
            ]),
          ).toThrow(
            `${errorMessages.TYPE_MISMATCH}. ${errorContextPrefixes.PATH} body -> form. ${errorContextPrefixes.SCHEMA_TYPE} object. ${errorContextPrefixes.ACTUAL_TYPE} string`,
          );
        });
      });

      describe('object is an object', () => {
        describe('schema does not have properties', () => {
          let originalProperties;
          beforeAll(() => {
            originalProperties = schema.properties;
            schema.properties = undefined;
          });

          it('throws an error', () => {
            expect(() =>
              OasSchema.validateObjectAgainstSchema({ value: 'any' }, schema, [
                'body',
                'form',
              ]),
            ).toThrow(
              `${errorMessages.PROPERTIES_MISSING}. ${errorContextPrefixes.PATH} body -> form`,
            );
          });

          afterAll(() => {
            schema.properties = originalProperties;
          });
        });

        describe('object has a property not listed in schema', () => {
          it('throws an error', () => {
            expect(() => {
              OasSchema.validateObjectAgainstSchema(
                { fake: 'property' },
                schema,
                ['body', 'form'],
              );
            }).toThrow(
              `${errorMessages.PROPERTIES_MISMATCH}. ${
                errorContextPrefixes.PATH
              } body -> form. ${
                errorContextPrefixes.SCHEMA_PROPERTIES
              } ${JSON.stringify(['value'])}. ${
                errorContextPrefixes.ACTUAL_PROPERTIES
              } ${JSON.stringify(['fake'])}`,
            );
          });
        });

        describe('object is missing a required value', () => {
          beforeEach(() => {
            schema.required = ['value'];
          });

          it('throws an error', () => {
            const object = {};
            expect(() => {
              OasSchema.validateObjectAgainstSchema(object, schema, [
                'body',
                'form',
              ]);
            }).toThrow(
              `${errorMessages.MISSING_REQUIRED_PROPERTY}. ${errorContextPrefixes.PATH} body -> form. ${errorContextPrefixes.REQUIRED_PROPERTY} value`,
            );
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
              ['body', 'form'],
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
                  ['body', 'form'],
                ),
              ).toBeFalsy();
            });
          });

          describe('object does not match enum', () => {
            it('throws an error', () => {
              const object = { value: 'does not match' };
              expect(() =>
                OasSchema.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'form',
                ]),
              ).toThrow(
                `${errorMessages.ENUM_MISMATCH}. ${
                  errorContextPrefixes.PATH
                } body -> form. ${errorContextPrefixes.ENUM} ${JSON.stringify(
                  schema.enum,
                )}. ${errorContextPrefixes.ACTUAL_VALUE} ${JSON.stringify(
                  object,
                )}`,
              );
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
                  ['body', 'form'],
                ),
              ).toThrow(
                `${errorMessages.DUPLICATE_ENUMS}. ${
                  errorContextPrefixes.PATH
                } body -> form. ${errorContextPrefixes.ENUM} ${JSON.stringify(
                  schema.enum,
                )}`,
              );
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
