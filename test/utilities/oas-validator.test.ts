import loadJsonFile from 'load-json-file';
import { Response, SchemaObject, Parameter } from 'swagger-client';
import OasSchema from '../../src/utilities/oas-schema';
import OasValidator from '../../src/utilities/oas-validator';
import ValidationFailure from '../../src/validation-failures/validation-failure';

describe('OasValidator', () => {
  const generateSchema = async (filePath: string): Promise<OasSchema> => {
    const json = await loadJsonFile(filePath);
    return new OasSchema({
      spec: json,
    });
  };

  describe('validateParameters', () => {
    const originalValidateObjectAgainstSchema =
      OasValidator.validateObjectAgainstSchema;

    const generateMockSchema = (
      additionalParameters: Parameter[] = [],
    ): OasSchema => {
      return ({
        getOperation: jest.fn((operationId) => {
          if (operationId === 'operation1') {
            return new Promise((resolve) =>
              resolve({
                parameters: [
                  {
                    name: 'name',
                    schema: {
                      type: 'string',
                      description: 'blah blah blah',
                    },
                  },
                  {
                    name: 'id',
                    schema: {
                      type: 'number',
                      description: 'blah blah blah',
                    },
                  },
                  ...additionalParameters,
                ],
              }),
            );
          }
        }),
      } as unknown) as OasSchema;
    };

    beforeEach(() => {
      OasValidator.validateObjectAgainstSchema = jest.fn(() => []);
    });

    describe('operation does not exist', () => {
      it('returns a validation failure', async () => {
        const schema = generateMockSchema();
        const validator = new OasValidator((schema as unknown) as OasSchema);
        const failures = await validator.validateParameters(
          'fakeOperationId',
          {},
        );

        expect(failures).toHaveLength(1);
        expect(failures).toContainValidationFailure(
          'Invalid operationId: fakeOperationId',
        );
      });
    });

    describe('input parameters is missing a required parameter', () => {
      const schema = generateMockSchema([
        {
          name: 'fit',
          required: true,
          example: 'tight',
          schema: {
            type: 'string',
            description: 'blah blah blah',
          },
        },
      ]);
      it('returns a validation failure', async () => {
        const validator = new OasValidator((schema as unknown) as OasSchema);

        const failures = await validator.validateParameters('operation1', {
          name: 'jack',
        });
        expect(failures).toHaveLength(1);
        expect(failures).toContainValidationFailure(
          'Missing required parameters: [fit]',
        );
      });

      describe('other parameter validation failures are present', () => {
        it('validates all parameters', async () => {
          (OasValidator.validateObjectAgainstSchema as jest.Mock).mockImplementationOnce(
            () => [new ValidationFailure('There was a failure')],
          );
          const validator = new OasValidator((schema as unknown) as OasSchema);

          const failures = await validator.validateParameters('operation1', {
            name: 'jack',
            id: 'yes',
          });
          expect(failures).toHaveLength(2);
          expect(failures).toContainValidationFailure(
            'Missing required parameters: [fit]',
          );
          expect(failures).toContainValidationFailure('There was a failure');
        });
      });
    });

    it('calls validateObjectAgainstSchema for each valid parameter', async () => {
      const schema = generateMockSchema();
      const validator = new OasValidator((schema as unknown) as OasSchema);

      await validator.validateParameters('operation1', {
        name: 'james',
        id: 2,
        not: 'real',
      });

      expect(OasValidator.validateObjectAgainstSchema).toHaveBeenCalledTimes(2);
      expect(OasValidator.validateObjectAgainstSchema).toHaveBeenCalledWith(
        'james',
        {
          type: 'string',
          description: 'blah blah blah',
        },
        ['parameters', 'name', 'example'],
      );
      expect(OasValidator.validateObjectAgainstSchema).toHaveBeenCalledWith(
        2,
        {
          type: 'number',
          description: 'blah blah blah',
        },
        ['parameters', 'id', 'example'],
      );
    });

    afterEach(() => {
      OasValidator.validateObjectAgainstSchema = originalValidateObjectAgainstSchema;
    });
  });

  describe('validateResponse', () => {
    describe('response status code not in OAS', () => {
      it('returns a validation failure', async () => {
        const filePath = 'test/fixtures/forms_oas.json';
        const schema = await generateSchema(filePath);
        const validator = new OasValidator(schema);

        const response: Response = {
          ok: false,
          status: 500,
          url: 'http://anything.com',
          headers: {
            'content-type': 'application/json',
          },
          body: {},
        };

        const failures = await validator.validateResponse(
          'findForms',
          response,
        );

        expect(failures).toHaveLength(1);
        expect(failures).toContainValidationFailure(
          'Response status code not present in schema. Actual status code: 500',
        );
      });
    });

    describe('response status code is in the OAS', () => {
      describe('Response content type does is not in the OAS', () => {
        it('returns a validation failure', async () => {
          const filePath = 'test/fixtures/forms_oas.json';
          const schema = await generateSchema(filePath);
          const validator = new OasValidator(schema);

          const response: Response = {
            ok: true,
            status: 200,
            url: 'http://anything.com',
            headers: {
              'content-type': 'text/csv',
            },
            body: {},
          };

          const failures = await validator.validateResponse(
            'findForms',
            response,
          );

          expect(failures).toHaveLength(1);
          expect(failures).toContainValidationFailure(
            'Response content type not present in schema. Actual content type: text/csv',
          );
        });
      });

      describe('Response content type is in the OAS', () => {
        const originalValidateObjectAgainstSchema =
          OasValidator.validateObjectAgainstSchema;
        beforeEach(() => {
          OasValidator.validateObjectAgainstSchema = jest.fn();
        });
        it('calls validateObjectAgainstSchema with the response body', async () => {
          const filePath = 'test/fixtures/simple_forms_oas.json';
          const schema = await generateSchema(filePath);
          const validator = new OasValidator(schema);

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

          await validator.validateResponse('findForms', response);
          expect(OasValidator.validateObjectAgainstSchema).toHaveBeenCalledWith(
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
        });
        afterEach(() => {
          OasValidator.validateObjectAgainstSchema = originalValidateObjectAgainstSchema;
        });
      });
    });
  });

  describe('validateObjectAgainstSchema', () => {
    let validateSpy;
    beforeEach(() => {
      validateSpy = jest.spyOn(OasValidator, 'validateObjectAgainstSchema');
      validateSpy.mockClear();
    });

    describe('actual object is null', () => {
      describe('schema object nullable field is not set', () => {
        const schema: SchemaObject = {
          type: 'string',
          description: 'a string',
        };

        it('returns a validation failure', () => {
          const failures = OasValidator.validateObjectAgainstSchema(
            null,
            schema,
            ['body', 'facility', 'id'],
          );
          expect(failures).toHaveLength(1);
          expect(failures).toContainValidationFailure(
            'Actual value is null but schema does not allow null values. Path: body -> facility -> id',
          );
        });
      });

      describe('schema object nullable field is set to false', () => {
        const schema: SchemaObject = {
          type: 'string',
          description: 'a string',
          nullable: false,
        };

        it('returns a validation failure', () => {
          const failures = OasValidator.validateObjectAgainstSchema(
            null,
            schema,
            ['body', 'facility', 'id'],
          );
          expect(failures).toHaveLength(1);
          expect(failures).toContainValidationFailure(
            'Actual value is null but schema does not allow null values. Path: body -> facility -> id',
          );
        });
      });

      describe('schema object nullable field is set to true', () => {
        const schema: SchemaObject = {
          type: 'string',
          description: 'a string',
          nullable: true,
        };

        it('does not return a validation failure', () => {
          const failures = OasValidator.validateObjectAgainstSchema(
            null,
            schema,
            ['body', 'facility', 'id'],
          );
          expect(failures).toHaveLength(0);
        });
      });
    });

    describe('schema type is not set', () => {
      const schema: SchemaObject = {
        description: 'unknown',
        items: {
          type: 'number',
          description: 'a number',
        },
        properties: {
          value: {
            type: 'string',
            description: 'a string',
          },
        },
      };

      describe('actual object is a string', () => {
        it('does not return a validation failure', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(
              'This is a string',
              schema,
              ['test'],
            ),
          ).toHaveLength(0);
        });
      });

      describe('actual object is an array', () => {
        it('does not return a validation failure', () => {
          expect(
            OasValidator.validateObjectAgainstSchema([42, 58], schema, [
              'test',
            ]),
          ).toHaveLength(0);
        });
      });

      describe('actual object is an object', () => {
        it('does not return a validation failure', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(
              { value: 'this is a string' },
              schema,
              ['test'],
            ),
          ).toHaveLength(0);
        });
      });
    });

    describe('schema expects a string', () => {
      const schema: SchemaObject = {
        type: 'string',
        description: 'a string',
      };

      describe('object is a string', () => {
        it('does not return a validation failure', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(
              'This is a string',
              schema,
              ['test'],
            ),
          ).toHaveLength(0);
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

            it('returns a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema(
                  'does not match',
                  schema,
                  ['body', 'facility', 'id'],
                ),
              ).toContainValidationFailure(
                `Schema enum contains duplicate values. Path: body -> facility -> id. Enum values: ${JSON.stringify(
                  schema.enum,
                )}`,
              );
            });

            afterAll(() => {
              schema.enum = originalEnum;
            });
          });

          describe('object matches enum', () => {
            it('does not return a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema('test', schema, [
                  'body',
                  'facility',
                  'id',
                ]),
              ).toHaveLength(0);
            });
          });

          describe('object does not match enum', () => {
            it('returns a validation failure', () => {
              const object = 'does not match';
              expect(
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'facility',
                  'id',
                ]),
              ).toContainValidationFailure(
                `Actual value does not match schema enum. Path: body -> facility -> id. Enum values: ${JSON.stringify(
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
        it('returns a validation failure', () => {
          const object = 42;
          expect(
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'id',
            ]),
          ).toContainValidationFailure(
            'Actual type did not match schema. Path: body -> facility -> id. Schema type: string. Actual type: number',
          );
        });

        describe('object is an object', () => {
          it('returns only the type mismatch failure and does not attempt to validate the actual object', () => {
            const object = {
              key: 'value',
            };

            const failures = OasValidator.validateObjectAgainstSchema(
              object,
              schema,
              ['body', 'facility', 'id'],
            );

            // only called 1 time for the initial call
            expect(
              OasValidator.validateObjectAgainstSchema,
            ).toHaveBeenCalledTimes(1);

            expect(failures).toHaveLength(1);
            expect(failures).toContainValidationFailure(
              'Actual type did not match schema. Path: body -> facility -> id. Schema type: string. Actual type: object',
            );
          });
        });

        describe('object is an array', () => {
          it('returns only the type mismatch failure and does not attempt to validate the actual object', () => {
            const object = [2];

            const failures = OasValidator.validateObjectAgainstSchema(
              object,
              schema,
              ['body', 'facility', 'id'],
            );

            // only called 1 time for the initial call
            expect(
              OasValidator.validateObjectAgainstSchema,
            ).toHaveBeenCalledTimes(1);

            expect(failures).toHaveLength(1);
            expect(failures).toContainValidationFailure(
              'Actual type did not match schema. Path: body -> facility -> id. Schema type: string. Actual type: object',
            );
          });
        });
      });
    });

    describe('schema expects a number', () => {
      const schema: SchemaObject = {
        type: 'number',
        description: 'a number',
      };

      describe('object is a number', () => {
        it('does not return a validation failure', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(42, schema, [
              'body',
              'facility',
              'lat',
            ]),
          ).toHaveLength(0);
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [42, 56];
          });

          describe('object matches enum', () => {
            it('does not return a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema(42, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toHaveLength(0);
            });
          });

          describe('object does not match enum', () => {
            it('returns a validation failure', () => {
              const object = 100;
              expect(
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toContainValidationFailure(
                `Actual value does not match schema enum. Path: body -> facility -> lat. Enum values: ${JSON.stringify(
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

            it('returns a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema(100, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toContainValidationFailure(
                `Schema enum contains duplicate values. Path: body -> facility -> lat. Enum values: ${JSON.stringify(
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

      describe('object is not a number', () => {
        it('returns a validation failure', () => {
          const object = 'this is a string';
          expect(
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'lat',
            ]),
          ).toContainValidationFailure(
            'Actual type did not match schema. Path: body -> facility -> lat. Schema type: number. Actual type: string',
          );
        });
      });
    });

    describe('schema expects an integer', () => {
      const schema: SchemaObject = {
        type: 'integer',
        description: 'an integer',
      };
      describe('object is an integer', () => {
        it('does not return a validation failure', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(42, schema, [
              'body',
              'facility',
              'lat',
            ]),
          ).toHaveLength(0);
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [42, 56];
          });

          describe('object matches enum', () => {
            it('does not return a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema(42, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toHaveLength(0);
            });
          });

          describe('object does not match enum', () => {
            it('returns a validation failure', () => {
              const object = 100;
              expect(
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toContainValidationFailure(
                `Actual value does not match schema enum. Path: body -> facility -> lat. Enum values: ${JSON.stringify(
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

            it('returns a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema(100, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toContainValidationFailure(
                `Schema enum contains duplicate values. Path: body -> facility -> lat. Enum values: ${JSON.stringify(
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

      describe('object is not an integer', () => {
        it('returns a validation failure', () => {
          const object = 'this is a string';
          expect(
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'lat',
            ]),
          ).toContainValidationFailure(
            'Actual type did not match schema. Path: body -> facility -> lat. Schema type: integer. Actual type: string',
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
        it('returns a validation failure', () => {
          const object = 'this is a string';
          expect(
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'numbers',
            ]),
          ).toContainValidationFailure(
            'Actual type did not match schema. Path: body -> numbers. Schema type: array. Actual type: string',
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

          it('returns a validation failure', () => {
            expect(
              OasValidator.validateObjectAgainstSchema([42], schema, [
                'body',
                'numbers',
              ]),
            ).toContainValidationFailure(
              'The items property is required for array schemas. Path: body -> numbers',
            );
          });

          afterEach(() => {
            schema.items = originalItems;
          });
        });

        it('calls validateObjectAgainstSchema once for each child', () => {
          OasValidator.validateObjectAgainstSchema([42, 56], schema, [
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
            it('does not return a valdiation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema([42, 56], schema, [
                  'body',
                  'numbers',
                ]),
              ).toHaveLength(0);
            });
          });

          describe('object does not match enum', () => {
            it('returns a validation failure', () => {
              const object = [42, 100];
              expect(
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'numbers',
                ]),
              ).toContainValidationFailure(
                `Actual value does not match schema enum. Path: body -> numbers. Enum values: ${JSON.stringify(
                  schema.enum,
                )}. Actual value: ${JSON.stringify(object)}`,
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

            it('returns a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema([100, 200], schema, [
                  'body',
                  'numbers',
                ]),
              ).toContainValidationFailure(
                `Schema enum contains duplicate values. Path: body -> numbers. Enum values: ${JSON.stringify(
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
        it('returns a validation failure', () => {
          const object = 'this is a string';
          expect(
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'form',
            ]),
          ).toContainValidationFailure(
            'Actual type did not match schema. Path: body -> form. Schema type: object. Actual type: string',
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

          it('returns a validation failure', () => {
            expect(
              OasValidator.validateObjectAgainstSchema(
                { value: 'any' },
                schema,
                ['body', 'form'],
              ),
            ).toContainValidationFailure(
              'The properties property is required for object schemas. Path: body -> form',
            );
          });

          afterAll(() => {
            schema.properties = originalProperties;
          });
        });

        describe('object has a property not listed in schema', () => {
          it('returns a validation failure', () => {
            expect(
              OasValidator.validateObjectAgainstSchema(
                { fake: 'property' },
                schema,
                ['body', 'form'],
              ),
            ).toContainValidationFailure(
              'Actual object contains a property not present in schema. Path: body -> form. Schema properties: value. Actual properties: fake',
            );
          });
        });

        describe('object is missing a required value', () => {
          beforeEach(() => {
            schema.required = ['value'];
          });

          it('returns a validation failure', () => {
            const object = {};
            expect(
              OasValidator.validateObjectAgainstSchema(object, schema, [
                'body',
                'form',
              ]),
            ).toContainValidationFailure(
              'Actual object missing required property. Path: body -> form. Required property: value',
            );
          });

          afterEach(() => {
            schema.required = [];
          });
        });

        describe('object has properties', () => {
          it('calls validateObjectAgainstSchema with the properties', () => {
            OasValidator.validateObjectAgainstSchema(
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
            it('does not return a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema(
                  { value: 'test' },
                  schema,
                  ['body', 'form'],
                ),
              ).toHaveLength(0);
            });
          });

          describe('object does not match enum', () => {
            it('returns a validation failure', () => {
              const object = { value: 'does not match' };
              expect(
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'form',
                ]),
              ).toContainValidationFailure(
                `Actual value does not match schema enum. Path: body -> form. Enum values: ${JSON.stringify(
                  schema.enum,
                )}. Actual value: ${JSON.stringify(object)}`,
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

            it('returns a validation failure', () => {
              expect(
                OasValidator.validateObjectAgainstSchema(
                  { value: 'does not match' },
                  schema,
                  ['body', 'form'],
                ),
              ).toContainValidationFailure(
                `Schema enum contains duplicate values. Path: body -> form. Enum values: ${JSON.stringify(
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
