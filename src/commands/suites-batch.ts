import Command, { flags } from '@oclif/command';
import { OASResult } from '../validation';
import { Config } from '../config';
import { FileIn } from '../utilities/file-in';
import Loast from '../loast';

export default class SuitesBatch extends Command {
  static description =
    'Runs happy-path tests for all APIs in the config file based on their OpenAPI specs';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [
    {
      name: 'path',
      required: true,
      description:
        'Local file path for the JSON config file. See example file at https://github.com/department-of-veterans-affairs/lighthouse-oas-tests/blob/master/batch-configs/example-batch-config.json',
    },
  ];

  async run(): Promise<void> {
    const { args } = this.parse(SuitesBatch);
    const config: Config = FileIn.loadConfigFromFile(args.path);
    const batchResults = await this.getBatchResults(config);

    for (let api = 0; api < batchResults.length; api++) {
      this.logTestResults(batchResults[api]);
    }
  }

  // returns an array of batch configs by array of suite results
  async getBatchResults(config: Config): Promise<OASResult[][]> {
    return Promise.all(
      Object.entries(config).map(async ([name, testInputs]) => {
        if (testInputs.path) {
          try {
            const loast = new Loast(name, testInputs);
            const results = await loast.getResults();

            return results;
          } catch (error) {
            return [
              new OASResult(
                name,
                testInputs.path,
                testInputs.server,
                [],
                undefined,
                (error as Error).message,
              ),
            ];
          }
        }

        return [
          new OASResult(
            name,
            testInputs.path,
            testInputs.server,
            [],
            undefined,
            `Config ${name} missing path`,
          ),
        ];
      }),
    );
  }

  logTestResults(results: OASResult[]): void {
    this.log(results.toString());

    const totalTestCount = results.length;

    const failedTestCount = results.filter(
      (result) =>
        result.results &&
        result.results.filter((result) => result.failures.size > 0).length > 0,
    ).length;

    const skippedTestCount = results.filter((result) => result.error).length;

    const passedTestCount = totalTestCount - failedTestCount - skippedTestCount;

    if (failedTestCount > 0 || skippedTestCount > 0) {
      this.log(
        `${failedTestCount}/${totalTestCount} test${
          totalTestCount > 1 ? 's' : ''
        } failed; ${skippedTestCount}/${totalTestCount} test${
          totalTestCount > 1 ? 's' : ''
        } skipped; ${passedTestCount}/${totalTestCount} test${
          totalTestCount > 1 ? 's' : ''
        } passed`,
      );
    } else {
      this.log(
        `${totalTestCount}/${totalTestCount} test${
          totalTestCount > 1 ? 's' : ''
        } passed`,
      );
    }
  }
}
