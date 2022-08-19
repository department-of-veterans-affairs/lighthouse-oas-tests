import { ParameterObject } from 'swagger-client';
import OASOperation from '../../../../src/oas-parsing/operation';
import { ParameterSchemaValidator } from '../../../../src/suites/positive/validation';

describe('ParameterSchemaValidator', () => {
  describe('validate', () => {
    it('it adds a validation failure if both content and schema exist on parameter', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'gryffindor',
            in: 'query',
            example: 'ginny weasly',
            schema: {
              type: 'string',
              description: 'founded by Godric Gryffindor',
            },
            content: {
              'document/howler': {
                schema: {
                  type: 'string',
                },
                example: 'ron weasly',
              },
            },
          },
        ],
        responses: {},
      });

      const validator = new ParameterSchemaValidator(operation);
      validator.validate();

      const failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Parameter object must have either schema or content set, but not both. Path: parameters -> gryffindor',
      );
    });

    it('registers a validation failure if content contains more than one entry', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'magical deliveries',
            in: 'query',
            example: 'the daily prophet',
            content: {
              'document/howler': {
                schema: {
                  type: 'string',
                },
                example: 'petunia dursley',
              },
              'owl/package': {
                schema: {
                  type: 'string',
                },
                example: 'nimbus 2000',
              },
            },
          },
        ],
        responses: {},
      });

      const validator = new ParameterSchemaValidator(operation);
      validator.validate();

      const failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Parameter content object should only have one key. Path: parameters -> magical deliveries -> content',
      );
    });

    it('adds a validation failure if content does not contain a schema object', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'magical deliveries',
            in: 'query',
            example: 'the daily prophet',
            content: {
              'document/howler': {
                hogwarts: {
                  'magical deliveries': {
                    type: 'string',
                  },
                },
              },
            },
          } as unknown as ParameterObject,
        ],
        responses: {},
      });

      const validator = new ParameterSchemaValidator(operation);
      validator.validate();

      const failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'The media type obejct in the content field is missing a schema object. Path: parameters -> magical deliveries -> content -> document/howler',
      );
    });

    it('adds a validation failure if neither content nor schema exist on parameter', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'horcrux',
            in: 'query',
            example: "tom riddle's diary",
          } as unknown as ParameterObject,
        ],
        responses: {},
      });

      const validator = new ParameterSchemaValidator(operation);
      validator.validate();

      const failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Parameter object must have either schema or content set, but not both. Path: parameters -> horcrux',
      );
    });

    it('adds a validation failure if parameter has both example and examples', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'horcrux',
            in: 'query',
            example: "tom riddle's diary",
            examples: {
              doesnot: 'matter',
            },
            schema: {
              type: 'string',
              description: 'founded by Godric Gryffindor',
            },
          } as unknown as ParameterObject,
        ],
        responses: {},
      });

      const validator = new ParameterSchemaValidator(operation);
      validator.validate();

      const failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        "The 'example' field is mutually exclusive of the 'examples' field, provide one or the other or neither, but not both. Path: parameters -> horcrux",
      );
    });

    it('does not register a validation failure if content is shaped correctly', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'diagon alley shops',
            in: 'query',
            example: '2nd hand brooms',
            content: {
              'document/map': {
                schema: {
                  type: 'string',
                },
                example: 'flourish and blotts',
              },
            },
          },
        ],
        responses: {},
      });

      const validator = new ParameterSchemaValidator(operation);
      validator.validate();

      expect(validator.failures.size).toEqual(0);
    });

    it('does not register a validation failure if schema is shaped correctly', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'diagon alley shops',
            in: 'query',
            example: '2nd hand brooms',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {},
      });

      const validator = new ParameterSchemaValidator(operation);
      validator.validate();

      expect(validator.failures.size).toEqual(0);
    });

    it('is idempotent', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'magical deliveries',
            in: 'query',
            example: 'the daily prophet',
            content: {
              'document/howler': {
                hogwarts: {
                  'magical deliveries': {
                    type: 'string',
                  },
                },
              },
            },
          } as unknown as ParameterObject,
        ],
        responses: {},
      });

      const validator = new ParameterSchemaValidator(operation);
      validator.validate();

      let failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'The media type obejct in the content field is missing a schema object. Path: parameters -> magical deliveries -> content -> document/howler',
      );

      // call valdiate again to check for idempotency
      validator.validate();

      failures = validator.failures;
      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'The media type obejct in the content field is missing a schema object. Path: parameters -> magical deliveries -> content -> document/howler',
      );
    });
  });
});
