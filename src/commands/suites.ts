import Command, { flags } from '@oclif/command';
import { OASResult } from '../validation';
import { DEFAULT_TEST_NAME } from '../utilities/constants';
import Loast from '../loast';
import JSONStructuredOutputFactory from '../utilities/structured-output';

export default class Suites extends Command {
  static description =
    'Runs happy-path tests for an API based on the OpenAPI spec';

  // TODO Add support for command to cherry pick suites
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
    const { args, flags } = this.parse(Suites);

    const loast = new Loast(DEFAULT_TEST_NAME, {
      path: args.path,
      server: flags.server,
      apiKey: flags.apiKey,
      token: flags.bearerToken,
    });

    let results: OASResult[];
    try {
      results = await loast.getResults();
    } catch (error) {
      if (flags.jsonOutput) {
        // return the error message as part of the json output
        results = [
          new OASResult(
            DEFAULT_TEST_NAME,
            args.path,
            flags.server,
            [],
            undefined,
            (error as Error).message,
          ),
        ];
      } else {
        // otherwise, let the error propagate up
        throw error;
      }
    }

    this.logTestResults(results, flags.jsonOutput);
  }

  private logTestResults(results: OASResult[], isJsonOutput: boolean): void {
    for (let x = 0; x < results.length; x++) {
      if (isJsonOutput) {
        const output = JSONStructuredOutputFactory.buildFromOASResult(
          results[x],
        );
        this.log('----------- Suite Results -----------');
        this.log(JSON.stringify(output));
      } else {
        this.log('----------- Suite Results -----------');
        this.log(results[x].toString());
      }

      this.determineFailure(results[x]);
    }
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
