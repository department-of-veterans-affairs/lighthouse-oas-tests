import loadJsonFile from 'load-json-file';
import { Response, SchemaObject, Parameter } from 'swagger-client';
import OasSchema from '../../src/utilities/oas-schema';
import OasValidator from '../../src/utilities/oas-validator';

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
      OasValidator.validateObjectAgainstSchema = jest.fn();
    });

    describe('operation does not exist', () => {
      it('throws an error', () => {
        const schema = generateMockSchema();
        const validator = new OasValidator((schema as unknown) as OasSchema);
        expect(async () => {
          await validator.validateParameters('fakeOperationId', {});
        }).rejects.toThrow('Invalid operationId: fakeOperationId');
      });
    });

    describe('input parameters is missing a required parameter', () => {
      it('throws an error', () => {
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
        const validator = new OasValidator((schema as unknown) as OasSchema);

        expect(async () => {
          await validator.validateParameters('operation1', {
            name: 'jack',
          });
        }).rejects.toThrow('Missing required parameters: [fit]');
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
      it('throws an error', async () => {
        const filePath = 'test/fixtures/forms_oas.json';
        const schema = await generateSchema(filePath);
        const validator = new OasValidator(schema);

        const response: Response = {
          ok: false,
          status: 500,
          url: 'http://anything.com',
          headers: {},
          body: {},
        };

        await expect(async () => {
          await validator.validateResponse('findForms', response);
        }).rejects.toThrow(
          'Response status code not present in schema. Actual status code: 500',
        );
      });
    });

    describe('response status code is in the OAS', () => {
      describe('Response content type does is not in the OAS', () => {
        it('throws an error', async () => {
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

          await expect(async () => {
            await validator.validateResponse('findForms', response);
          }).rejects.toThrow(
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

        it('throws an error', () => {
          expect(() =>
            OasValidator.validateObjectAgainstSchema(null, schema, [
              'body',
              'facility',
              'id',
            ]),
          ).toThrow(
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

        it('throws an error', () => {
          expect(() =>
            OasValidator.validateObjectAgainstSchema(null, schema, [
              'body',
              'facility',
              'id',
            ]),
          ).toThrow(
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

        it('does nothing', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(null, schema, [
              'body',
              'facility',
              'id',
            ]),
          ).toBeFalsy();
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
        it('does nothing', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(
              'This is a string',
              schema,
              ['test'],
            ),
          ).toBeFalsy();
        });
      });

      describe('actual object is an array', () => {
        it('does nothing', () => {
          expect(
            OasValidator.validateObjectAgainstSchema([42, 58], schema, [
              'test',
            ]),
          ).toBeFalsy();
        });
      });

      describe('actual object is an object', () => {
        it('does nothing', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(
              { value: 'this is a string' },
              schema,
              ['test'],
            ),
          ).toBeFalsy();
        });
      });
    });

    describe('schema expects a string', () => {
      const schema: SchemaObject = {
        type: 'string',
        description: 'a string',
      };

      describe('object is a string', () => {
        it('does nothing', () => {
          expect(
            OasValidator.validateObjectAgainstSchema(
              'This is a string',
              schema,
              ['test'],
            ),
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
                OasValidator.validateObjectAgainstSchema(
                  'does not match',
                  schema,
                  ['body', 'facility', 'id'],
                ),
              ).toThrow(
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
            it('does nothing', () => {
              expect(
                OasValidator.validateObjectAgainstSchema('test', schema, [
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
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'facility',
                  'id',
                ]),
              ).toThrow(
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
        it('throws an error', () => {
          const object = 42;
          expect(() =>
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'id',
            ]),
          ).toThrow(
            'Actual type did not match schema. Path: body -> facility -> id. Schema type: string. Actual type: number',
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
            OasValidator.validateObjectAgainstSchema(42, schema, [
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
                OasValidator.validateObjectAgainstSchema(42, schema, [
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
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toThrow(
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

            it('throws an error', () => {
              expect(() =>
                OasValidator.validateObjectAgainstSchema(100, schema, [
                  'body',
                  'facility',
                  'lat',
                ]),
              ).toThrow(
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
        it('throws an error', () => {
          const object = 'this is a string';
          expect(() =>
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'lat',
            ]),
          ).toThrow(
            'Actual type did not match schema. Path: body -> facility -> lat. Schema type: number. Actual type: string',
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
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'numbers',
            ]),
          ).toThrow(
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

          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema([42], schema, [
                'body',
                'numbers',
              ]),
            ).toThrow(
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
            it('does nothing', () => {
              expect(
                OasValidator.validateObjectAgainstSchema([42, 56], schema, [
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
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'numbers',
                ]),
              ).toThrow(
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

            it('throws an error', () => {
              expect(() =>
                OasValidator.validateObjectAgainstSchema([100, 200], schema, [
                  'body',
                  'numbers',
                ]),
              ).toThrow(
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
        it('throws an error', () => {
          const object = 'this is a string';
          expect(() =>
            OasValidator.validateObjectAgainstSchema(object, schema, [
              'body',
              'form',
            ]),
          ).toThrow(
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

          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(
                { value: 'any' },
                schema,
                ['body', 'form'],
              ),
            ).toThrow(
              'The properties property is required for object schemas. Path: body -> form',
            );
          });

          afterAll(() => {
            schema.properties = originalProperties;
          });
        });

        describe('object has a property not listed in schema', () => {
          it('throws an error', () => {
            expect(() => {
              OasValidator.validateObjectAgainstSchema(
                { fake: 'property' },
                schema,
                ['body', 'form'],
              );
            }).toThrow(
              'Actual object contains a property not present in schema. Path: body -> form. Schema properties: value. Actual properties: fake',
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
              OasValidator.validateObjectAgainstSchema(object, schema, [
                'body',
                'form',
              ]);
            }).toThrow(
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
            it('does nothing', () => {
              expect(
                OasValidator.validateObjectAgainstSchema(
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
                OasValidator.validateObjectAgainstSchema(object, schema, [
                  'body',
                  'form',
                ]),
              ).toThrow(
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

            it('throws an error', () => {
              expect(() =>
                OasValidator.validateObjectAgainstSchema(
                  { value: 'does not match' },
                  schema,
                  ['body', 'form'],
                ),
              ).toThrow(
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
