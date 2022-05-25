import { RequestValidationConductor } from '../../src/validation-conductors';
import { ValidationFailure } from '../../src/validation-messages/failures';
import {
  exampleGroupFailureMap,
  parameterSchemaFailureMap,
  requestBodyFailureMap,
} from '../fixtures/results/failures';
import {
  emptyWarningMap,
  requestBodyWarningMap,
} from '../fixtures/results/warnings';
import { emptyDefaultExampleGroup } from '../fixtures/utilities/example-groups';
import { harryPotterOperation } from '../fixtures/utilities/oas-operations';

const mockParameterValidate = jest.fn();
const mockRequestBodyValidate = jest.fn();
const mockExampleGroupValidate = jest.fn();

jest.mock('../../src/utilities/validators/parameter-schema-validator', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        validate: mockParameterValidate,
        failures: parameterSchemaFailureMap,
        warnings: emptyWarningMap,
      };
    }),
  };
});

jest.mock('../../src/utilities/validators/request-body-validator', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        validate: mockRequestBodyValidate,
        failures: requestBodyFailureMap,
        warnings: requestBodyWarningMap,
      };
    }),
  };
});

jest.mock('../../src/utilities/validators/example-group-validator', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        validate: mockExampleGroupValidate,
        failures: exampleGroupFailureMap,
        warnings: emptyWarningMap,
      };
    }),
  };
});

describe('RequestValidationConductor', () => {
  beforeEach(() => {
    mockParameterValidate.mockReset();
    mockRequestBodyValidate.mockReset();
    mockExampleGroupValidate.mockReset();
  });

  describe('validate', () => {
    it('returns the expected failures and warnings', () => {
      const expectedFailures = new Map<string, ValidationFailure>([
        ...parameterSchemaFailureMap,
        ...requestBodyFailureMap,
        ...exampleGroupFailureMap,
      ]);

      const requestValidationConductor = new RequestValidationConductor(
        harryPotterOperation,
        emptyDefaultExampleGroup,
      );
      const [failures, warnings] = requestValidationConductor.validate();

      expect(failures).toEqual(expectedFailures);
      expect(warnings).toEqual(requestBodyWarningMap);
    });
  });
});
