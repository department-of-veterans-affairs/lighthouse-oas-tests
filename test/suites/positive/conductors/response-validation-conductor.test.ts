import { ResponseValidationConductor } from '../../../../src/suites/positive/conductors';
import OASSchema from '../../../../src/oas-parsing/schema';
import { responseFailuresMap } from '../fixtures/failures';
import { responseOneWarningMap } from '../fixtures/warnings';
import { operationSimpleGet } from '../../../fixtures/utilities/oas-operations';

const mockValidate = jest.fn();

jest.mock(
  '../../../../src/suites/positive/validation/response-validator',
  () => {
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
  },
);

let oasSchema: OASSchema;

describe('ResponseValidationConductor', () => {
  beforeEach(() => {
    const json = {};
    oasSchema = new OASSchema({
      spec: json,
    });
  });

  describe('validate', () => {
    it('returns an InvalidResponse failure if the response is not ok', async () => {
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
        oasSchema,
        response,
        operationSimpleGet,
      );
      const [failures, warnings] = await responseValidationConductor.validate();

      expect(failures.size).toEqual(1);
      expect(failures).toContainValidationFailure(
        'Response status code was a non 2XX value: 500',
      );

      expect(warnings.size).toEqual(0);
    });

    it('returns the failures and warnings from the ResponseValidator', async () => {
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
        oasSchema,
        response,
        operationSimpleGet,
      );
      const [failures, warnings] = await responseValidationConductor.validate();

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
