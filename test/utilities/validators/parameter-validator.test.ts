import { ParameterObject } from 'swagger-client';
import ExampleGroup from '../../../src/utilities/example-group';
import OASOperation from '../../../src/utilities/oas-operation';
import { ParameterValidator } from '../../../src/utilities/validators';

describe('ParameterValidator', () => {
  describe('validate', () => {
    describe('input parameters is missing a required parameter', () => {
      it('adds a validation failure', () => {
        const operation = new OASOperation({
          operationId: 'hobbits or something',
          parameters: [
            {
              name: 'fit',
              in: 'query',
              required: true,
              example: 'tight',
              schema: {
                type: 'string',
                description: 'blah blah blah',
              },
            },
          ],
          responses: {},
        });
        const exampleGroup = new ExampleGroup(operation, 'default', {});
        const validator = new ParameterValidator(exampleGroup);

        validator.validate();

        const failures = validator.failures;
        expect(failures).toHaveLength(1);
        expect(failures).toContainValidationFailure(
          'Missing required parameters: [fit]',
        );
      });

      describe('other parameter validation failures are present', () => {
        it('validates all parameters', () => {
          const operation = new OASOperation({
            operationId: 'hobbits or something',
            parameters: [
              {
                name: 'fit',
                in: 'query',
                required: true,
                example: 'tight',
                schema: {
                  type: 'string',
                  description: 'blah blah blah',
                },
              },
              {
                name: 'family',
                in: 'query',
                required: true,
                example: 'tight',
                schema: {
                  type: 'string',
                  description: 'blah blah blah',
                },
              },
            ],
            responses: {},
          });
          const exampleGroup = new ExampleGroup(operation, 'default', {
            family: 1,
          });
          const validator = new ParameterValidator(exampleGroup);
          validator.validate();

          const failures = validator.failures;
          expect(failures).toHaveLength(2);
          expect(failures).toContainValidationFailure(
            'Missing required parameters: [fit]',
          );
          expect(failures).toContainValidationFailure(
            'Actual type did not match schema. Schema type: string. Actual type: number. Path: parameters -> family -> example',
          );
        });
      });
    });

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
      const exampleGroup = new ExampleGroup(operation, 'default', {
        gryffindor: 'luna lovegood',
      });
      const validator = new ParameterValidator(exampleGroup);
      validator.validate();

      const failures = validator.failures;

      expect(failures).toHaveLength(1);
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
      const exampleGroup = new ExampleGroup(operation, 'default', {
        'magical deliveries': 'firebolt',
      });
      const validator = new ParameterValidator(exampleGroup);
      validator.validate();

      const failures = validator.failures;

      expect(failures).toHaveLength(1);
      expect(failures).toContainValidationFailure(
        'Parameter content object should only have one key. Path: parameters -> magical deliveries -> content',
      );
    });

    it('adds a validation failure if content does not contain a schema object', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          ({
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
          } as unknown) as ParameterObject,
        ],
        responses: {},
      });
      const exampleGroup = new ExampleGroup(operation, 'default', {
        'magical deliveries': "weasley's wizard wheezes",
      });
      const validator = new ParameterValidator(exampleGroup);
      validator.validate();

      const failures = validator.failures;

      expect(failures).toHaveLength(1);
      expect(failures).toContainValidationFailure(
        'The media type obejct in the content field is missing a schema object. Path: parameters -> magical deliveries -> content -> document/howler',
      );
    });

    it('adds a validation failure if neither content nor schema exist on parameter', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          ({
            name: 'horcrux',
            in: 'query',
            example: "tom riddle's diary",
          } as unknown) as ParameterObject,
        ],
        responses: {},
      });
      const exampleGroup = new ExampleGroup(operation, 'default', {
        horcrux: 'nagini',
      });
      const validator = new ParameterValidator(exampleGroup);
      validator.validate();

      const failures = validator.failures;

      expect(failures).toHaveLength(1);
      expect(failures).toContainValidationFailure(
        'Parameter object must have either schema or content set, but not both. Path: parameters -> horcrux',
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
      const exampleGroup = new ExampleGroup(operation, 'default', {
        'diagon alley shops': 'ollivanders',
      });
      const validator = new ParameterValidator(exampleGroup);
      validator.validate();

      const failures = validator.failures;

      expect(failures).toHaveLength(0);
    });

    it('is idempotent', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'fit',
            in: 'query',
            required: true,
            example: 'tight',
            schema: {
              type: 'string',
              description: 'blah blah blah',
            },
          },
        ],
        responses: {},
      });
      const exampleGroup = new ExampleGroup(operation, 'default', {});
      const validator = new ParameterValidator(exampleGroup);

      validator.validate();

      let failures = validator.failures;
      expect(failures).toHaveLength(1);
      expect(failures).toContainValidationFailure(
        'Missing required parameters: [fit]',
      );

      // call valdiate again to check for idempotency
      validator.validate();

      failures = validator.failures;
      expect(failures).toHaveLength(1);
      expect(failures).toContainValidationFailure(
        'Missing required parameters: [fit]',
      );
    });
  });
});
