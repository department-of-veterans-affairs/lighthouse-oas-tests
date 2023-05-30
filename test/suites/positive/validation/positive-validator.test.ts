import { SchemaObject } from 'swagger-client';
import OASOperation from '../../../../src/oas-parsing/operation';
import { ParameterSchemaValidator } from '../../../../src/suites/positive/validation';

describe('BaseValidator', () => {
  const operation = new OASOperation({
    operationId: 'nothing really',
    parameters: [],
    responses: {},
  });

  // here we are only testing the methods implemented on BaseValidator
  // using ParameterSchemaValidator instead of BaseValidator because BaseValidator is abstract
  let validator: ParameterSchemaValidator;
  beforeEach(() => {
    validator = new ParameterSchemaValidator(operation);
  });
  describe('validateObjectAgainstSchema', () => {
    describe('actual object is null', () => {
      describe('schema object nullable field is not set', () => {
        const schema: SchemaObject = {
          type: 'string',
          description: 'a string',
        };

        it('adds a validation failure', () => {
          validator.validateObjectAgainstSchema(null, schema, [
            'body',
            'facility',
            'id',
          ]);

          const failures = validator.failures;
          expect(failures.size).toEqual(1);
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

        it('adds a validation failure', () => {
          validator.validateObjectAgainstSchema(null, schema, [
            'body',
            'facility',
            'id',
          ]);

          const failures = validator.failures;
          expect(failures.size).toEqual(1);
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

        it('does not add a validation failure', () => {
          validator.validateObjectAgainstSchema(null, schema, [
            'body',
            'facility',
            'id',
          ]);

          const failures = validator.failures;
          expect(failures.size).toEqual(0);
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
        it('does not add a validation failure', () => {
          validator.validateObjectAgainstSchema('This is a string', schema, [
            'test',
          ]);
          expect(validator.failures.size).toEqual(0);
        });
      });

      describe('actual object is an array', () => {
        it('does not add a validation failure', () => {
          validator.validateObjectAgainstSchema([42, 58], schema, ['test']);
          expect(validator.failures.size).toEqual(0);
        });
      });

      describe('actual object is an object', () => {
        it('does not add a validation failure', () => {
          validator.validateObjectAgainstSchema(
            { value: 'this is a string' },
            schema,
            ['test'],
          );
          expect(validator.failures.size).toEqual(0);
        });
      });
    });

    describe('schema expects a string', () => {
      const schema: SchemaObject = {
        type: 'string',
        description: 'a string',
      };

      describe('object is a string', () => {
        it('does not add a validation failure', () => {
          validator.validateObjectAgainstSchema('This is a string', schema, [
            'test',
          ]);
          expect(validator.failures.size).toEqual(0);
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

            it('adds a validation failure', () => {
              validator.validateObjectAgainstSchema('does not match', schema, [
                'body',
                'facility',
                'id',
              ]);

              expect(validator.failures).toContainValidationFailure(
                'Schema enum contains duplicate values. Enum values: ["test","test","anything"]. Path: body -> facility -> id',
              );
            });

            afterAll(() => {
              schema.enum = originalEnum;
            });
          });

          describe('object matches enum', () => {
            it('does not add a validation failure', () => {
              validator.validateObjectAgainstSchema('test', schema, [
                'body',
                'facility',
                'id',
              ]);
              expect(validator.failures.size).toEqual(0);
            });
          });

          describe('object does not match enum', () => {
            it('adds a validation failure', () => {
              const object = 'does not match';
              validator.validateObjectAgainstSchema(object, schema, [
                'body',
                'facility',
                'id',
              ]);
              expect(validator.failures).toContainValidationFailure(
                'Actual value does not match schema enum. Enum values: ["test","anything"]. Actual value: "does not match". Path: body -> facility -> id',
              );
            });
          });

          afterAll(() => {
            schema.enum = undefined;
          });
        });
      });

      describe('object is not a string', () => {
        it('adds a validation failure', () => {
          const object = 42;
          validator.validateObjectAgainstSchema(object, schema, [
            'body',
            'facility',
            'id',
          ]);
          expect(validator.failures).toContainValidationFailure(
            'Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> facility -> id',
          );
        });

        describe('object is an object', () => {
          it('returns only the type mismatch failure and does not attempt to validate the actual object', () => {
            const object = {
              key: 'value',
            };

            validator.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'id',
            ]);

            const failures = validator.failures;
            expect(failures.size).toEqual(1);
            expect(failures).toContainValidationFailure(
              'Actual type did not match schema. Schema type: string. Actual type: object. Path: body -> facility -> id',
            );
          });
        });

        describe('object is an array', () => {
          it('returns only the type mismatch failure and does not attempt to validate the actual object', () => {
            const object = [2];

            validator.validateObjectAgainstSchema(object, schema, [
              'body',
              'facility',
              'id',
            ]);

            const failures = validator.failures;
            expect(failures.size).toEqual(1);
            expect(failures).toContainValidationFailure(
              'Actual type did not match schema. Schema type: string. Actual type: object. Path: body -> facility -> id',
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
        it('does not add a validation failure', () => {
          validator.validateObjectAgainstSchema(42, schema, [
            'body',
            'facility',
            'lat',
          ]);
          expect(validator.failures.size).toEqual(0);
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [42, 56];
          });

          describe('object matches enum', () => {
            it('does not add a validation failure', () => {
              validator.validateObjectAgainstSchema(42, schema, [
                'body',
                'facility',
                'lat',
              ]);
              expect(validator.failures.size).toEqual(0);
            });
          });

          describe('object does not match enum', () => {
            it('adds a validation failure', () => {
              const object = 100;
              validator.validateObjectAgainstSchema(object, schema, [
                'body',
                'facility',
                'lat',
              ]);
              expect(validator.failures).toContainValidationFailure(
                'Actual value does not match schema enum. Enum values: [42,56]. Actual value: 100. Path: body -> facility -> lat',
              );
            });
          });

          describe('enum contains duplicate values', () => {
            let originalEnum;
            beforeAll(() => {
              originalEnum = schema.enum;
              schema.enum = [42, 42, 56];
            });

            it('adds a validation failure', () => {
              validator.validateObjectAgainstSchema(100, schema, [
                'body',
                'facility',
                'lat',
              ]);
              expect(validator.failures).toContainValidationFailure(
                `Schema enum contains duplicate values. Enum values: [42,42,56]. Path: body -> facility -> lat`,
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
        it('adds a validation failure', () => {
          const object = 'this is a string';
          validator.validateObjectAgainstSchema(object, schema, [
            'body',
            'facility',
            'lat',
          ]);
          expect(validator.failures).toContainValidationFailure(
            'Actual type did not match schema. Schema type: number. Actual type: string. Path: body -> facility -> lat',
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
        it('does not add a validation failure', () => {
          validator.validateObjectAgainstSchema(42, schema, [
            'body',
            'facility',
            'lat',
          ]);
          expect(validator.failures.size).toEqual(0);
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [42, 56];
          });

          describe('object matches enum', () => {
            it('does not add a validation failure', () => {
              validator.validateObjectAgainstSchema(42, schema, [
                'body',
                'facility',
                'lat',
              ]);
              expect(validator.failures.size).toEqual(0);
            });
          });

          describe('object does not match enum', () => {
            it('adds a validation failure', () => {
              const object = 100;
              validator.validateObjectAgainstSchema(object, schema, [
                'body',
                'facility',
                'lat',
              ]);
              expect(validator.failures).toContainValidationFailure(
                'Actual value does not match schema enum. Enum values: [42,56]. Actual value: 100. Path: body -> facility -> lat',
              );
            });
          });

          describe('enum contains duplicate values', () => {
            let originalEnum;
            beforeAll(() => {
              originalEnum = schema.enum;
              schema.enum = [42, 42, 56];
            });

            it('adds a validation failure', () => {
              validator.validateObjectAgainstSchema(100, schema, [
                'body',
                'facility',
                'lat',
              ]);
              expect(validator.failures).toContainValidationFailure(
                'Schema enum contains duplicate values. Enum values: [42,42,56]. Path: body -> facility -> lat',
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
        it('adds a validation failure', () => {
          const object = 'this is a string';
          validator.validateObjectAgainstSchema(object, schema, [
            'body',
            'facility',
            'lat',
          ]);
          expect(validator.failures).toContainValidationFailure(
            'Actual type did not match schema. Schema type: integer. Actual type: string. Path: body -> facility -> lat',
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
        it('adds a validation failure', () => {
          const object = 'this is a string';
          validator.validateObjectAgainstSchema(object, schema, [
            'body',
            'numbers',
          ]);
          expect(validator.failures).toContainValidationFailure(
            'Actual type did not match schema. Schema type: array. Actual type: string. Path: body -> numbers',
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

          it('adds a validation failure', () => {
            validator.validateObjectAgainstSchema([42], schema, [
              'body',
              'numbers',
            ]);
            expect(validator.failures).toContainValidationFailure(
              'The items property is required for array schemas. Path: body -> numbers',
            );
          });

          afterEach(() => {
            schema.items = originalItems;
          });
        });

        describe('object has no errors', () => {
          let tempSchema;
          beforeAll(() => {
            tempSchema = { ...schema };
            tempSchema.items = { ...schema.items };
          });
          it('adds a validation failure', () => {
            tempSchema.items = {
              type: 'object',
              required: ['value'],
              properties: {
                value: {
                  type: 'string',
                  description: 'a string',
                },
              },
              description: 'schema for an object',
            };
            validator.validateObjectAgainstSchema([{}], tempSchema, [
              'body',
              'numbers',
            ]);
            expect(validator.failures).toContainValidationFailure(
              'Actual object missing required property. Required property: value. Path: body -> numbers',
            );
          });
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
              validator.validateObjectAgainstSchema([42, 56], schema, [
                'body',
                'numbers',
              ]);
              expect(validator.failures.size).toEqual(0);
            });
          });

          describe('object does not match enum', () => {
            it('adds a validation failure', () => {
              const object = [42, 100];
              validator.validateObjectAgainstSchema(object, schema, [
                'body',
                'numbers',
              ]);
              expect(validator.failures).toContainValidationFailure(
                'Actual value does not match schema enum. Enum values: [[42,56],[100,200]]. Actual value: [42,100]. Path: body -> numbers',
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

            it('adds a validation failure', () => {
              validator.validateObjectAgainstSchema([100, 200], schema, [
                'body',
                'numbers',
              ]);
              expect(validator.failures).toContainValidationFailure(
                'Schema enum contains duplicate values. Enum values: [[42,56],[100,200],[42,56]]. Path: body -> numbers',
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

        it('adds a validation warning when the array is empty', () => {
          validator.validateObjectAgainstSchema([], schema, [
            'body',
            'numbers',
          ]);
          expect(validator.warnings).toContainValidationWarning(
            'Warning: This array was found to be empty and therefore could not be validated. Path: body -> numbers',
          );
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
        it('adds a validation failure', () => {
          const object = 'this is a string';
          validator.validateObjectAgainstSchema(object, schema, [
            'body',
            'form',
          ]);
          expect(validator.failures).toContainValidationFailure(
            'Actual type did not match schema. Schema type: object. Actual type: string. Path: body -> form',
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

          it('adds a validation failure', () => {
            validator.validateObjectAgainstSchema({ value: 'any' }, schema, [
              'body',
              'form',
            ]);
            expect(validator.failures).toContainValidationFailure(
              'The properties property is required for object schemas. Path: body -> form',
            );
          });

          afterAll(() => {
            schema.properties = originalProperties;
          });
        });

        describe('object has a property not listed in schema', () => {
          let tempSchema;
          beforeAll(() => {
            tempSchema = { ...schema };
            tempSchema.properties = {
              ...schema.properties,
              house: {
                type: 'string',
                description: 'gryffindor, hufflepuff, slytherin, ravenclaw',
              },
            };
            tempSchema.required = ['value'];
          });

          describe('all schema properties are present', () => {
            it('failure message contains only actual properties that were not expected', () => {
              validator.validateObjectAgainstSchema(
                { fake: 'property', value: 'potato', house: 'slytherin' },
                tempSchema,
                ['body', 'form'],
              );
              expect(validator.failures).toContainValidationFailure(
                'Actual object contains a property not present in schema. Actual properties not expected: fake. Path: body -> form',
              );
            });
          });

          describe('not all schema properties are present', () => {
            it('failure message contains all properties that did not match', () => {
              validator.validateObjectAgainstSchema(
                { fake: 'property', value: 'potato' },
                tempSchema,
                ['body', 'form'],
              );
              expect(validator.failures).toContainValidationFailure(
                'Actual object contains a property not present in schema. Actual properties not expected: fake. Schema properties not found: house. Path: body -> form',
              );
            });
          });
        });

        describe('object is missing a required value', () => {
          beforeEach(() => {
            schema.required = ['value'];
          });

          it('adds a validation failure', () => {
            const object = {};
            validator.validateObjectAgainstSchema(object, schema, [
              'body',
              'form',
            ]);
            expect(validator.failures).toContainValidationFailure(
              'Actual object missing required property. Required property: value. Path: body -> form',
            );
          });

          afterEach(() => {
            schema.required = [];
          });
        });

        it('validates the properties when object has properties', () => {
          validator.validateObjectAgainstSchema(
            {
              value: 42,
            },
            schema,
            ['body', 'form'],
          );

          const failures = validator.failures;
          expect(failures.size).toEqual(1);
          expect(failures).toContainValidationFailure(
            'Actual type did not match schema. Schema type: string. Actual type: number. Path: body -> form -> value',
          );
        });

        it('adds a warning when an optional property cannot be validated', () => {
          validator.validateObjectAgainstSchema({}, schema, ['body', 'form']);

          const warnings = validator.warnings;
          expect(warnings.size).toEqual(1);
          expect(warnings).toContainValidationWarning(
            'Warning: Response object is missing non-required properties that were unable to be validated, including value. Path: body -> form',
          );
        });

        it('does not print out the missing property warning when only required properties are missing', () => {
          validator.validateObjectAgainstSchema(
            {},
            { ...schema, required: ['value'] },
            ['body', 'form'],
          );

          const warnings = validator.warnings;
          expect(warnings.size).toEqual(0);
          expect(warnings).not.toContainValidationWarning(
            'Warning: Response object is missing non-required properties that were unable to be validated, including value. Path: body -> form',
          );
        });

        describe('schema expects an enum', () => {
          beforeAll(() => {
            schema.enum = [{ value: 'test' }, { value: 'anything' }];
          });

          describe('object matches enum', () => {
            it('does not add a validation failure', () => {
              validator.validateObjectAgainstSchema({ value: 'test' }, schema, [
                'body',
                'form',
              ]);
              expect(validator.failures.size).toEqual(0);
            });
          });

          describe('object does not match enum', () => {
            it('adds a validation failure', () => {
              const object = { value: 'does not match' };
              validator.validateObjectAgainstSchema(object, schema, [
                'body',
                'form',
              ]);
              expect(validator.failures).toContainValidationFailure(
                'Actual value does not match schema enum. Enum values: [{"value":"test"},{"value":"anything"}]. Actual value: {"value":"does not match"}. Path: body -> form',
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

            it('adds a validation failure', () => {
              validator.validateObjectAgainstSchema(
                { value: 'does not match' },
                schema,
                ['body', 'form'],
              );
              expect(validator.failures).toContainValidationFailure(
                'Schema enum contains duplicate values. Enum values: [{"value":"test"},{"value":"anything"},{"value":"test"}]. Path: body -> form',
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
