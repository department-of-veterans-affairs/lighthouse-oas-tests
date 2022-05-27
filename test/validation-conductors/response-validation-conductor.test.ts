import { ResponseValidationConductor } from '../../src/validation-conductors';
import { responseFailuresMap } from '../fixtures/results/failures';
import { responseOneWarningMap } from '../fixtures/results/warnings';
import { operationSimpleGet } from '../fixtures/utilities/oas-operations';

const mockValidate = jest.fn();

jest.mock('../../src/utilities/validators/response-validator', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        validate: mockValidate,
        failures: responseFailuresMap,
        warnings: responseOneWarningMap,
      };
    }),
  };
});

describe('ResponseValidationConductor', () => {
  describe('validate', () => {
    it('returns an InvalidResponse failure if the response is not ok', () => {
      const response = {
        ok: false,
        status: 500,
        url: 'https://the-sorcerers-stone.com/services/characters/v0/harryPotter',
        headers: {},
        body: {
          message: 'There was an error',
        },
      };

      const responseValidationConductor = new ResponseValidationConductor(
        response,
        operationSimpleGet,
      );
      const [failures, warnings] = responseValidationConductor.validate();

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Response status code was a non 2XX value: 500',
      );

      expect(warnings.size).toEqual(0);
    });

    it('returns the failures and warnings from the ResponseValidator', () => {
      const response = {
        ok: true,
        status: 200,
        url: 'https://the-sorcerers-stone.com/services/characters/v0/harryPotter',
        headers: {},
        body: {
          firstName: 'Harry',
          lastName: 'Potter',
        },
      };

      const responseValidationConductor = new ResponseValidationConductor(
        response,
        operationSimpleGet,
      );
      const [failures, warnings] = responseValidationConductor.validate();

      expect(failures.size).toEqual(2);
      expect(failures).toContainValidationFailure(
        'Actual type did not match schema. Schema type: number. Actual type: string. Path: body -> age',
      );
      expect(failures).toContainValidationFailure(
        'Actual object missing required property. Required property: glasses. Path: body',
      );

      expect(warnings.size).toEqual(1);
      expect(warnings).toContainValidationWarning(
        'Warning: This object is missing non-required properties that were unable to be validated, including middleName. Path: body',
      );
    });
  });
});
