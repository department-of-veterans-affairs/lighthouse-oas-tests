import OASOperation from '../../../src/oas-parsing/operation';
import { ResponseValidator } from '../../../src/validation/validators';

describe('ResponseValidator', () => {
  const operation = new OASOperation({
    operationId: 'getHobbits',
    parameters: [
      {
        name: 'family',
        in: 'query',
        description: '',
        schema: {
          description: '',
          type: 'string',
        },
        required: true,
        examples: {
          baggins: {
            value: 'baggins',
          },
        },
      },
      {
        name: 'age',
        in: 'query',
        description: '',
        schema: {
          description: '',
          type: 'integer',
        },
        examples: {
          baggins: {
            value: 111,
          },
        },
      },
    ],
    responses: {
      '200': {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              description: '',
              type: 'object',
              properties: {
                data: {
                  type: 'string',
                  description: '',
                },
              },
            },
          },
          'text/csv': {
            schema: {
              type: 'string',
              example: 'there,are,spiders,',
            },
          },
        },
      },
    },
  });

  describe('validate', () => {
    it('adds a validation failure when response status code not in OAS', () => {
      const validator = new ResponseValidator(operation, {
        ok: false,
        status: 500,
        url: 'http://anything.com',
        headers: {
          'content-type': 'application/json',
        },
        body: {},
      });

      validator.validate();
      const failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Response status code not present in schema. Actual status code: 500',
      );
    });

    it('adds a validation failure Response content type does is not in the OAS', () => {
      const validator = new ResponseValidator(operation, {
        ok: true,
        status: 200,
        url: 'http://anything.com',
        headers: {
          'content-type': 'image/bmp',
        },
        body: {},
      });

      validator.validate();
      const failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Response content type not present in schema. Actual content type: image/bmp',
      );
    });

    it('adds a validation warning when response body is not parsed', () => {
      const validator = new ResponseValidator(operation, {
        ok: false,
        status: 200,
        url: 'http://anything.com',
        headers: {
          'content-type': 'text/csv',
        },
        body: undefined,
      });

      validator.validate();
      const warnings = validator.warnings;

      expect(warnings.size).toEqual(1);
      expect(warnings).toContainValidationFailure(
        'Unable to auto-parse response body, skipping schema validation. Only JSON and YAML are supported. Body content type: text/csv',
      );
    });

    it('returns no validation failures when response is valid', () => {
      const validator = new ResponseValidator(operation, {
        ok: false,
        status: 200,
        url: 'http://anything.com',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          data: 'test',
        },
      });

      validator.validate();
      const failures = validator.failures;

      expect(failures.size).toEqual(0);
    });

    it('is idempotent', () => {
      const validator = new ResponseValidator(operation, {
        ok: false,
        status: 500,
        url: 'http://anything.com',
        headers: {
          'content-type': 'application/json',
        },
        body: {},
      });

      validator.validate();
      let failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Response status code not present in schema. Actual status code: 500',
      );

      // call valdiate again to check for idempotency
      validator.validate();
      failures = validator.failures;

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Response status code not present in schema. Actual status code: 500',
      );
    });
  });
});
