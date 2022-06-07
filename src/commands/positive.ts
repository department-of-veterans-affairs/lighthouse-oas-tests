import Command, { flags } from '@oclif/command';
import { PositiveConductor } from '../conductors';
import { OASResult } from '../results';
import { DEFAULT_TEST_NAME } from '../utilities/constants';

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

    const result = await positiveConductor.conduct();
    this.log(result.toString());
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
