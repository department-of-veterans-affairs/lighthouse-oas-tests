import ExampleGroup from '../../../src/utilities/example-group';
import OASOperation from '../../../src/utilities/oas-operation';
import { ExampleGroupValidator } from '../../../src/utilities/validators';

describe('ExampleGroupValidator', () => {
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
        const validator = new ExampleGroupValidator(exampleGroup);

        validator.validate();

        const failures = validator.failures;
        expect(failures.size).toEqual(1);
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
          const validator = new ExampleGroupValidator(exampleGroup);
          validator.validate();

          const failures = validator.failures;
          expect(failures.size).toEqual(2);
          expect(failures).toContainValidationFailure(
            'Missing required parameters: [fit]',
          );
          expect(failures).toContainValidationFailure(
            'Actual type did not match schema. Schema type: string. Actual type: number. Path: parameters -> family -> example',
          );
        });
      });
    });

    it('adds a validation failures if example does not match schema', () => {
      const operation = new OASOperation({
        operationId: 'hobbits or something',
        parameters: [
          {
            name: 'fit',
            in: 'query',
            example: 'tight',
            schema: {
              type: 'string',
              description: 'blah blah blah',
            },
          },
        ],
        responses: {},
      });
      const exampleGroup = new ExampleGroup(operation, 'default', { fit: 123 });
      const validator = new ExampleGroupValidator(exampleGroup);

      validator.validate();

      const failures = validator.failures;
      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Actual type did not match schema. Schema type: string. Actual type: number. Path: parameters -> fit -> example',
      );
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
      const validator = new ExampleGroupValidator(exampleGroup);

      validator.validate();

      let failures = validator.failures;
      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Missing required parameters: [fit]',
      );

      // call valdiate again to check for idempotency
      validator.validate();

      failures = validator.failures;
      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Missing required parameters: [fit]',
      );
    });
  });
});
