import { RequestBodyValidator } from '../../../../src/suites/positive/validation';
import { REQUIRED_FIELDS_REQUEST_BODY } from '../../../../src/utilities/constants';
import {
  operationSimpleGet,
  operationPutStudentRequestBodyMissingSchema,
  operationPutStudentRequestBodyFailures,
  operationPutStudentValidRequestBody,
} from '../../../fixtures/utilities/oas-operations';

describe('RequestBodyValidator', () => {
  it('contains no failures or warnings when the operation does not have a request body', async () => {
    const validator = new RequestBodyValidator(
      operationSimpleGet,
      operationSimpleGet.exampleRequestBodies[0].requestBody,
    );
    await validator.validate();

    expect(validator.failures.size).toEqual(0);
    expect(validator.warnings.size).toEqual(0);
  });

  it('contains no failures or warnings for a valid request body', async () => {
    const validator = new RequestBodyValidator(
      operationPutStudentValidRequestBody,
      operationPutStudentValidRequestBody.exampleRequestBodies[0].requestBody,
    );
    await validator.validate();

    expect(validator.failures.size).toEqual(0);
    expect(validator.warnings.size).toEqual(0);
  });

  it('adds a validation failure if content does not contain a schema object', async () => {
    const validator = new RequestBodyValidator(
      operationPutStudentRequestBodyMissingSchema,
      operationPutStudentRequestBodyMissingSchema.exampleRequestBodies[0].requestBody,
    );
    await validator.validate();

    const failures = validator.failures;

    expect(failures.size).toEqual(1);
    expect(failures).toContainValidationFailure(
      'The media type obejct in the content field is missing a schema object. Path: requestBody -> content -> application/json',
    );

    expect(validator.warnings.size).toEqual(0);
  });

  it('adds validation failures and warnings from validateObjectAgainstSchema', async () => {
    const requiredPropertiesRequestBody =
      operationPutStudentRequestBodyFailures.exampleRequestBodies.find(
        (exampleRequestBody) =>
          exampleRequestBody.name === REQUIRED_FIELDS_REQUEST_BODY,
      )?.requestBody;
    expect(requiredPropertiesRequestBody).toBeDefined();

    if (requiredPropertiesRequestBody !== undefined) {
      const validator = new RequestBodyValidator(
        operationPutStudentRequestBodyFailures,
        requiredPropertiesRequestBody,
      );
      await validator.validate();

      const failures = validator.failures;
      const warnings = validator.warnings;

      expect(failures.size).toEqual(3);
      expect(failures).toContainValidationFailure(
        'Actual type did not match schema. Schema type: integer. Actual type: string. Path: requestBody -> example -> year',
      );
      expect(failures).toContainValidationFailure(
        'Schema enum contains duplicate values. Enum values: ["Gryffindor","Hufflepuff","Hufflepuff","Slytherin","Ravenclaw"]. Path: requestBody -> example -> house',
      );
      expect(failures).toContainValidationFailure(
        'Actual value does not match schema enum. Enum values: ["Gryffindor","Hufflepuff","Hufflepuff","Slytherin","Ravenclaw"]. Actual value: "NotAHouse". Path: requestBody -> example -> house',
      );

      expect(warnings.size).toEqual(2);
      expect(warnings).toContainValidationWarning(
        'Warning: This array was found to be empty and therefore could not be validated. Path: requestBody -> example -> classes',
      );
      expect(warnings).toContainValidationWarning(
        'Warning: Request body is missing non-required properties that were unable to be validated, including hobby. Path: requestBody -> example',
      );
    }
  });
});
