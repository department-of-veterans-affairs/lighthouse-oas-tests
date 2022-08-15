import Command, { flags } from '@oclif/command';
import { PositiveConductor } from '../conductors';
import { OASResult } from '../validation/results';
import { DEFAULT_TEST_NAME } from '../utilities/constants';
import JSONStructuredOutputFactory from '../utilities/structured-output';

export default class Positive extends Command {
  static description =
    'Runs happy-path tests for an API based on the OpenAPI spec';

  static flags = {
    help: flags.help({ char: 'h' }),
    apiKey: flags.string({
      char: 'a',
      description: 'API key to use',
    }),
    bearerToken: flags.string({
      char: 'b',
      description: 'Bearer token to use',
      env: 'LOAST_BEARER_TOKEN',
    }),
    server: flags.string({
      char: 's',
      description: 'Server URL to use',
    }),
    jsonOutput: flags.boolean({
      char: 'j',
      description: 'Format output as JSON',
    }),
  };

  static args = [
    {
      name: 'path',
      required: true,
      description: 'Url or local file path containing the OpenAPI spec',
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = this.parse(Positive);

    const positiveConductor = new PositiveConductor(DEFAULT_TEST_NAME, {
      path: args.path,
      server: flags.server,
      apiKey: flags.apiKey,
      token: flags.bearerToken,
    });

    let result: OASResult;
    try {
      result = await positiveConductor.conduct();
    } catch (error) {
      if (flags.jsonOutput) {
        // return the error message as part of the json output
        result = new OASResult(
          DEFAULT_TEST_NAME,
          args.path,
          flags.server,
          [],
          undefined,
          (error as Error).message,
        );
      } else {
        // otherwise, let the error propagate up
        throw error;
      }
    }

    if (flags.jsonOutput) {
      const output = JSONStructuredOutputFactory.buildFromOASResult(result);
      this.log(JSON.stringify(output));
    } else {
      this.log(result.toString());
    }

    this.determineFailure(result);
  }

  determineFailure(result: OASResult): void {
    const failedOperationCount = result.results
      ? result.results.filter((result) => result.failures.size > 0).length
      : 0;

    const totalOperationCount = result.results ? result.results.length : 0;

    const passedOperationCount = totalOperationCount - failedOperationCount;

    if (failedOperationCount > 0) {
      this.error(
        `${failedOperationCount}/${totalOperationCount} operation${
          totalOperationCount > 1 ? 's' : ''
        } failed; ${passedOperationCount}/${totalOperationCount} operation${
          totalOperationCount > 1 ? 's' : ''
        } passed`,
      );
    }
  }
}
