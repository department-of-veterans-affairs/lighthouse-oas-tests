import Suites from '../../../src/commands/suites';
import SwaggerClient from 'swagger-client';
import PositiveSuite from '../../../src/suites/positive/positive-suite';

describe('ExampleGroupValidator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  SwaggerClient.prototype.execute = jest.fn((options) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      url: options.server,
      headers: {
        'content-type': 'application/json',
      },
    });
  });

  it('passes with valid parameters', async () => {
    const conduct = jest.spyOn(PositiveSuite.prototype, 'conduct');
    await Suites.run([
      'test/fixtures/oas/example_groups_oas.json',
      '-s',
      'https://sandbox-api.va.gov/services/va_facilities/{version}',
      '-b',
      'test_token',
      '-i',
      'positive',
    ]);

    expect(conduct).toHaveBeenCalledTimes(1);

    const results = await conduct.mock.results[0].value;
    const failures = results.filter((result) => result.failures.size > 0);
    expect(failures.length).toEqual(0);
  });

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
    const failures = results.filter((result) => result.failures.size > 0);
    const failedTestGroups = failures.map((failure) => failure.testGroupName);
    expect(failedTestGroups).toEqual(expectedFailures);
  });
});
