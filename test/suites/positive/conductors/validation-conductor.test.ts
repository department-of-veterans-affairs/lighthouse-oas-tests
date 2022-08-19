import OASSchema from '../../../../src/oas-parsing/schema';
import { ValidationConductor } from '../../../../src/suites/positive/conductors';
import {
  emptyFailureMap,
  requestBodyFailureMap,
  responseFailuresMap,
} from '../fixtures/failures';
import {
  operationExampleResultNoRequestValidationFailures,
  operationExampleResultRequestValidationFailures,
} from '../../../fixtures/validation/operation-results';
import {
  requestBodyWarningMap,
  responseWarningsMap,
} from '../fixtures/warnings';
import { operationExampleSimpleGetDefault } from '../../../fixtures/utilities/operation-examples';
import { securityValuesAPIKeyBearerOauth } from '../../../fixtures/utilities/security-values';

const mockRequestValidate = jest.fn();

const mockExecute = jest.fn();

const mockResponseValidate = jest.fn();

jest.mock(
  '../../../../src/suites/positive/conductors/request-validation-conductor',
  () => {
    return {
      __esModule: true,
      default: jest.fn().mockImplementation(() => {
        return {
          validate: mockRequestValidate,
        };
      }),
    };
  },
);

jest.mock('../../../../src/oas-parsing/schema', () => {
  return function (): Record<string, jest.Mock> {
    return {
      execute: mockExecute,
    };
  };
});

jest.mock(
  '../../../../src/suites/positive/conductors/response-validation-conductor',
  () => {
    return {
      __esModule: true,
      default: jest.fn().mockImplementation(() => {
        return {
          validate: mockResponseValidate,
        };
      }),
    };
  },
);

describe('ValidationConductor', () => {
  beforeEach(() => {
    mockRequestValidate.mockReset();
    mockExecute.mockReset();
    mockResponseValidate.mockReset();
  });

  describe('validate', () => {
    const oasSchema = new OASSchema({ spec: {} });

    const validationConductor = new ValidationConductor(
      oasSchema,
      operationExampleSimpleGetDefault,
      securityValuesAPIKeyBearerOauth,
      undefined,
    );

    describe('Request validation returns failures', () => {
      beforeEach(() => {
        mockRequestValidate.mockReturnValue([
          requestBodyFailureMap,
          requestBodyWarningMap,
        ]);
      });

      it('does not execute an API call', async () => {
        await validationConductor.validate();
        expect(mockExecute).not.toHaveBeenCalled();
      });

      it('returns an OperationExampleResult', async () => {
        const operationExampleResult = await validationConductor.validate();

        expect(operationExampleResult).toEqual(
          operationExampleResultRequestValidationFailures,
        );
      });
    });

    describe('Request validation does not return failures', () => {
      beforeEach(() => {
        mockRequestValidate.mockReturnValue([
          emptyFailureMap,
          requestBodyWarningMap,
        ]);

        mockResponseValidate.mockReturnValue([
          responseFailuresMap,
          responseWarningsMap,
        ]);
      });

      it('executes an API call', async () => {
        await validationConductor.validate();
        expect(mockExecute).toHaveBeenCalledTimes(1);
      });

      it('returns an OperationExampleResult', async () => {
        const operationExampleResult = await validationConductor.validate();

        expect(operationExampleResult).toEqual(
          operationExampleResultNoRequestValidationFailures,
        );
      });
    });
  });
});
