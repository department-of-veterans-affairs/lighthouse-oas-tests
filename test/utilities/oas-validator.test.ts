import loadJsonFile from 'load-json-file';
import { Response, SchemaObject } from 'swagger-client';
import OasSchema from '../../src/utilities/oas-schema';
import OasValidator from '../../src/utilities/oas-validator';

describe('OasValidator', () => {
  const generateSchema = async (filePath: string): Promise<OasSchema> => {
    const json = await loadJsonFile(filePath);
    return new OasSchema({
      spec: json,
    });
  };
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
        it('calls validateObjectAgainstSchema with the response body', async () => {
          const filePath = 'test/fixtures/simple_forms_oas.json';
          const schema = await generateSchema(filePath);
          const validator = new OasValidator(schema);
          const originalValidateObjectAgainstSchema =
            OasValidator.validateObjectAgainstSchema;
          OasValidator.validateObjectAgainstSchema = jest.fn();

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
          OasValidator.validateObjectAgainstSchema = originalValidateObjectAgainstSchema;
        });
      });
    });
  });

  describe('validateObjectAgainstSchema', () => {
    const validateSpy = jest.spyOn(OasValidator, 'validateObjectAgainstSchema');
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

      describe('actual object is null', () => {
        describe('schema object nullable field is not set', () => {
          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'facility',
                'id',
              ]),
            ).toThrow(
              'Actual value was null. Schema should have nullable field set to true if null is allowed. Path: body -> facility -> id',
            );
          });
        });

        describe('schema object nullable field is set to false', () => {
          beforeAll(() => {
            schema.nullable = false;
          });

          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'facility',
                'id',
              ]),
            ).toThrow(
              'Actual value was null. Schema should have nullable field set to true if null is allowed. Path: body -> facility -> id',
            );
          });

          afterAll(() => {
            schema.nullable = undefined;
          });
        });

        describe('schema object nullable field is set to true', () => {
          beforeAll(() => {
            schema.nullable = true;
          });

          it('does nothing', () => {
            expect(
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'facility',
                'id',
              ]),
            ).toBeFalsy();
          });

          afterAll(() => {
            schema.nullable = undefined;
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

      describe('actual object is null', () => {
        describe('schema object nullable field is not set', () => {
          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'facility',
                'lat',
              ]),
            ).toThrow(
              'Actual value was null. Schema should have nullable field set to true if null is allowed. Path: body -> facility -> lat',
            );
          });
        });

        describe('schema object nullable field is set to false', () => {
          beforeAll(() => {
            schema.nullable = false;
          });

          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'facility',
                'lat',
              ]),
            ).toThrow(
              'Actual value was null. Schema should have nullable field set to true if null is allowed. Path: body -> facility -> lat',
            );
          });

          afterAll(() => {
            schema.nullable = undefined;
          });
        });

        describe('schema object nullable field is set to true', () => {
          beforeAll(() => {
            schema.nullable = true;
          });

          it('does nothing', () => {
            expect(
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'facility',
                'lat',
              ]),
            ).toBeFalsy();
          });

          afterAll(() => {
            schema.nullable = undefined;
          });
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

      describe('actual object is null', () => {
        describe('schema object nullable field is not set', () => {
          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'numbers',
              ]),
            ).toThrow(
              'Actual value was null. Schema should have nullable field set to true if null is allowed. Path: body -> numbers',
            );
          });
        });

        describe('schema object nullable field is set to false', () => {
          beforeAll(() => {
            schema.nullable = false;
          });

          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'numbers',
              ]),
            ).toThrow(
              'Actual value was null. Schema should have nullable field set to true if null is allowed. Path: body -> numbers',
            );
          });

          afterAll(() => {
            schema.nullable = undefined;
          });
        });

        describe('schema object nullable field is set to true', () => {
          beforeAll(() => {
            schema.nullable = true;
          });

          it('does nothing', () => {
            expect(
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'numbers',
              ]),
            ).toBeFalsy();
          });

          afterAll(() => {
            schema.nullable = undefined;
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

      describe('actual object is null', () => {
        describe('schema object nullable field is not set', () => {
          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'data',
              ]),
            ).toThrow(
              'Actual value was null. Schema should have nullable field set to true if null is allowed. Path: body -> data',
            );
          });
        });

        describe('schema object nullable field is set to false', () => {
          beforeAll(() => {
            schema.nullable = false;
          });

          it('throws an error', () => {
            expect(() =>
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'data',
              ]),
            ).toThrow(
              'Actual value was null. Schema should have nullable field set to true if null is allowed. Path: body -> data',
            );
          });

          afterAll(() => {
            schema.nullable = undefined;
          });
        });

        describe('schema object nullable field is set to true', () => {
          beforeAll(() => {
            schema.nullable = true;
          });

          it('does nothing', () => {
            expect(
              OasValidator.validateObjectAgainstSchema(null, schema, [
                'body',
                'data',
              ]),
            ).toBeFalsy();
          });

          afterAll(() => {
            schema.nullable = undefined;
          });
        });
      });
    });
  });
});
