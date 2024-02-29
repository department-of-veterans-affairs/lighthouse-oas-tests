import Suites from '../../../src/commands/suites';
import SwaggerClient from 'swagger-client';
import PositiveSuite from '../../../src/suites/positive/positive-suite';
import ExampleGroupValidator from '../../../src/suites/positive/validation/example-group-validator';

let logSpy;
let mockExecuteResponse;

beforeEach(() => {
  SwaggerClient.prototype.execute = jest.fn((options) =>
    Promise.resolve({
      url: options.server,
      ...mockExecuteResponse,
    }),
  );

  // Suppress console output from Suites.run() to avoid cluttering test output
  logSpy = jest.spyOn(Suites.prototype, 'log').mockImplementation(() => {
    return;
  });
});

afterEach(() => {
  jest.clearAllMocks();
  logSpy.mockRestore();
});

describe('PositiveSuite', () => {
  it('passes with a valid oas', async () => {
    const conduct = jest.spyOn(PositiveSuite.prototype, 'conduct');
    await Suites.run([
      'test/fixtures/oas/community_care_oas.json',
      '-s',
      'https://sandbox-api.va.gov/services/community-care/{version}',
      '-b',
      'test_token',
      '-i',
      'positive',
    ]);

    expect(conduct).toHaveBeenCalledTimes(1);

    const results = await conduct.mock.results[0].value;
    const failedOperations = results.filter(
      (result) => result.failures.size > 0,
    );
    expect(failedOperations.length).toEqual(0);
  });
});

describe('ExampleGroupValidator', () => {
  mockExecuteResponse = {
    ok: true,
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };

  it('fails with invalid parameters', async () => {
    const conduct = jest.spyOn(PositiveSuite.prototype, 'conduct');
    await Suites.run([
      'test/fixtures/oas/e2e/example_group_validator.json',
      '-s',
      'https://example.com/services/example_group_validator/{version}',
      '-b',
      'test_token',
      '-i',
      'positive',
    ]);

    expect(conduct).toHaveBeenCalledTimes(1);

    const expectedFailures = ['missing_parameter', 'mismatched_parameter'];
    const results = await conduct.mock.results[0].value;
    const failedOperations = results.filter(
      (result) => result.failures.size > 0,
    );
    const failedTestGroups = failedOperations.map(
      (failure) => failure.testGroupName,
    );

    expect(failedTestGroups).toEqual(expectedFailures);
  });
});

describe('ResponseValidator', () => {
  it('fails when the response code is incorrect', async () => {
    mockExecuteResponse = {
      ok: false,
      status: 500,
      headers: {
        'content-type': 'application/json',
      },
    };

    const conduct = jest.spyOn(PositiveSuite.prototype, 'conduct');
    await Suites.run([
      'test/fixtures/oas/e2e/response_validator.json',
      '-s',
      'https://example.com/services/response_validator/{version}',
      '-b',
      'test_token',
      '-i',
      'positive',
    ]);

    expect(conduct).toHaveBeenCalledTimes(1);

    const results = await conduct.mock.results[0].value;
    const failedOperations = results.filter(
      (result) => result.failures.size > 0,
    );
    const failures = failedOperations[0].failures;

    expect(failedOperations.length).toEqual(1);
    expect(failures).toContainValidationFailure(
      'Response status code was a non 2XX value: 500',
    );
  });

  it('fails when the response type is incorrect', async () => {
    mockExecuteResponse = {
      ok: true,
      status: 200,
      headers: {
        'content-type': 'text/html',
      },
    };

    const conduct = jest.spyOn(PositiveSuite.prototype, 'conduct');
    await Suites.run([
      'test/fixtures/oas/e2e/response_validator.json',
      '-s',
      'https://example.com/services/response_validator/{version}',
      '-b',
      'test_token',
      '-i',
      'positive',
    ]);

    expect(conduct).toHaveBeenCalledTimes(1);

    const results = await conduct.mock.results[0].value;
    const failedOperations = results.filter(
      (result) => result.failures.size > 0,
    );
    const failures = failedOperations[0].failures;

    expect(failures).toContainValidationFailure(
      'Response content type not present in schema. Actual content type: text/html',
    );
  });
});

describe('RequestBodyValidator', () => {
  it('contains expected failures', async () => {
    mockExecuteResponse = {
      ok: true,
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    };

    const conduct = jest.spyOn(PositiveSuite.prototype, 'conduct');
    await Suites.run([
      'test/fixtures/oas/e2e/request_body_validator.json',
      '-s',
      'https://example.com/services/request_body_validator/{version}',
      '-b',
      'test_token',
      '-i',
      'positive',
    ]);

    expect(conduct).toHaveBeenCalledTimes(1);

    const results = await conduct.mock.results[0].value;
    const failedOperations = results.filter(
      (result) => result.failures.size > 0,
    );
    const failures = failedOperations[0].failures;

    expect(failures.size).toEqual(4);
    expect(failures).toContainValidationFailure(
      'Actual type did not match schema. Schema type: integer. Actual type: string. Path: requestBody -> example -> age',
    );
    expect(failures).toContainValidationFailure(
      'Actual type did not match schema. Schema type: string. Actual type: number. Path: requestBody -> example -> name',
    );
    expect(failures).toContainValidationFailure(
      'Schema enum contains duplicate values. Enum values: ["a","b","c","c"]. Path: requestBody -> example -> enum',
    );
    expect(failures).toContainValidationFailure(
      'Actual value does not match schema enum. Enum values: ["a","b","c","c"]. Actual value: "d". Path: requestBody -> example -> enum',
    );
  });
});

describe('ParameterSchemaValidator', () => {
  beforeEach(() => {
    ExampleGroupValidator.prototype.performValidation = jest.fn(() =>
      Promise.resolve(),
    );
    // jest.spyOn(ExampleGroupValidator.prototype, 'validate').mockResolvedValue();
  });

  it('fails when schema and content are set', async () => {
    ExampleGroupValidator.prototype.validate = jest.fn(() => Promise.resolve());
    jest.spyOn(ExampleGroupValidator.prototype, 'validate').mockResolvedValue();
    mockExecuteResponse = {
      ok: true,
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    };

    const conduct = jest.spyOn(PositiveSuite.prototype, 'conduct');
    await Suites.run([
      'test/fixtures/oas/e2e/parameter_schema_validator.json',
      '-s',
      'https://example.com/services/parameter_schema_validator/{version}',
      '-b',
      'test_token',
      '-i',
      'positive',
    ]);

    expect(conduct).toHaveBeenCalledTimes(1);

    const results = await conduct.mock.results[0].value;
    const failedOperations = results.filter(
      (result) => result.failures.size > 0,
    );

    expect(failedOperations.length).toEqual(4);
    expect(failedOperations[0].failures).toContainValidationFailure(
      'Parameter object must have either schema or content set, but not both. Path: parameters -> query param',
    );
    expect(failedOperations[1].failures).toContainValidationFailure(
      'Parameter content object should only have one key. Path: parameters -> extra content -> content',
    );
    expect(failedOperations[2].failures).toContainValidationFailure(
      'The media type obejct in the content field is missing a schema object. Path: parameters -> query param -> content -> application/json',
    );
    expect(failedOperations[3].failures).toContainValidationFailure(
      'Parameter object must have either schema or content set, but found neither. Path: parameters -> query param',
    );
  });
});
