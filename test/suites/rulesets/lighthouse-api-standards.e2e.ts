import Suites from '../../../src/commands/suites';
import SwaggerClient from 'swagger-client';
import RulesetSuite from '../../../src/suites/rulesets/ruleset-suite';

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

describe('Lighthouse API Standards Suite', () => {
  it('does not timeout with a previously slow and problematic oas', async () => {
    const conduct = jest.spyOn(RulesetSuite.prototype, 'conduct');
    await Suites.run([
      'test/fixtures/oas/provider_directory_oas.json',
      '-s',
      'https://dev-api.va.gov/services/provider-directory/{version}',
      '-i',
      'lighthouse-api-standards',
    ]);

    expect(conduct).toHaveBeenCalledTimes(1);
  }, 10000); // Adding a 10 second timeout to catch any potential slowdowns in the future
});
