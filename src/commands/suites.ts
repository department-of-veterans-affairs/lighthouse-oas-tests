import { Command, Flags, Args } from '@oclif/core';
import { OASResult } from '../validation';
import { DEFAULT_TEST_NAME, DEFAULT_SUITE_ID } from '../utilities/constants';
import Loast from '../loast';
import JSONStructuredOutputFactory from '../utilities/structured-output';

export default class Suites extends Command {
  static description =
    'Runs a set of test suites for an API based on the OpenAPI spec';

  static flags = {
    help: Flags.help({ char: 'h' }),
    apiKey: Flags.string({
      char: 'a',
      description: 'API key to use',
    }),
    bearerToken: Flags.string({
      char: 'b',
      description: 'Bearer token to use',
      env: 'LOAST_BEARER_TOKEN',
    }),
    server: Flags.string({
      char: 's',
      description: 'Server URL to use',
    }),
    id: Flags.string({
      char: 'i',
      multiple: true,
      description: 'Suite Ids to use',
    }),
    jsonOutput: Flags.boolean({
      char: 'j',
      description: 'Format output as JSON',
    }),
    warning: Flags.boolean({
      char: 'w',
      description: 'remove warnings',
    }),
  };

  static args = {
    path: Args.string({
      required: true,
      description: 'Url or local file path containing the OpenAPI spec',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Suites);

    const loast = new Loast(DEFAULT_TEST_NAME, {
      path: args.path,
      server: flags.server,
      apiKey: flags.apiKey,
      token: flags.bearerToken,
      suiteIds: flags.id,
    });

    let results: OASResult[];
    try {
      results = await loast.getResults();
    } catch (error) {
      if (flags.jsonOutput) {
        // return the error message as part of the json output
        results = [
          new OASResult(
            DEFAULT_SUITE_ID,
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

    this.logTestResults(results, flags.jsonOutput, flags.warning);
  }

  private logTestResults(
    results: OASResult[],
    isJsonOutput: boolean,
    hasWarningFlag: boolean,
  ): void {
    results.forEach((result) => {
      if (hasWarningFlag) this.noWarningsIncluded(result);
      if (isJsonOutput) {
        const output = JSONStructuredOutputFactory.buildFromOASResult(result);
        this.log(JSON.stringify(output));
      } else {
        this.log(result.toString());
      }

      this.determineFailure(result);
    });
  }

  determineFailure(result: OASResult): void {
    const failedOperationCount = result.results
      ? result.results.filter((result) => result.failures.size > 0).length
      : 0;

    const totalOperationCount = result.results ? result.results.length : 0;

    const passedOperationCount = totalOperationCount - failedOperationCount;

    if (failedOperationCount > 0) {
      this.log(
        `${failedOperationCount}/${totalOperationCount} operation${
          totalOperationCount > 1 ? 's' : ''
        } failed; ${passedOperationCount}/${totalOperationCount} operation${
          totalOperationCount > 1 ? 's' : ''
        } passed`,
      );
    }
  }

  noWarningsIncluded(result: OASResult): OASResult {
    result.results?.map((item) => {
      delete item.warnings;
    });
    return result;
  }
}
