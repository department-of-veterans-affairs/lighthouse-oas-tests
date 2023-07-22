import { RequestValidationConductor } from '../../../../src/suites/positive/conductors';
import Message from '../../../../src/validation/message';
import {
  exampleGroupFailureMap,
  parameterSchemaFailureMap,
  requestBodyFailureMap,
} from '../fixtures/failures';
import { emptyWarningMap, requestBodyWarningMap } from '../fixtures/warnings';
import { exampleGroupEmptyDefault } from '../../../fixtures/utilities/example-groups';
import { operationSimpleGet } from '../../../fixtures/utilities/oas-operations';
import { emptyExampleRequestBody } from '../../../fixtures/utilities/example-request-bodies';

const mockParameterValidate = jest.fn();
const mockRequestBodyValidate = jest.fn();
const mockExampleGroupValidate = jest.fn();

jest.mock(
  '../../../../src/suites/positive/validation/parameter-schema-validator',
  () => {
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
  },
);

jest.mock(
  '../../../../src/suites/positive/validation/request-body-validator',
  () => {
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
  },
);

jest.mock(
  '../../../../src/suites/positive/validation/example-group-validator',
  () => {
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
  },
);

describe('RequestValidationConductor', () => {
  beforeEach(() => {
    mockParameterValidate.mockReset();
    mockRequestBodyValidate.mockReset();
    mockExampleGroupValidate.mockReset();
  });

  describe('validate', () => {
    it('returns the expected failures and warnings', async () => {
      const expectedFailures = new Map<string, Message>([
        ...parameterSchemaFailureMap,
        ...requestBodyFailureMap,
        ...exampleGroupFailureMap,
      ]);

      const requestValidationConductor = new RequestValidationConductor(
        operationSimpleGet,
        exampleGroupEmptyDefault,
        emptyExampleRequestBody,
      );
      const [failures, warnings] = await requestValidationConductor.validate();

      expect(failures).toEqual(expectedFailures);
      expect(warnings).toEqual(requestBodyWarningMap);
    });
  });
});
