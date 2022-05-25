import Command, { flags } from '@oclif/command';
import { PositiveBatchConductor } from '../conductors';
import { OASResult } from '../results';

export default class PositiveBatch extends Command {
  static description =
    'Runs happy-path tests for all APIs in the config file based on their OpenAPI specs';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  static args = [
    {
      name: 'path',
      required: true,
      description: 'Local file path for the JSON config file',
    },
  ];

  async run(): Promise<void> {
    const { args } = this.parse(PositiveBatch);
    const positiveBatchConductor = new PositiveBatchConductor(args.path);
    const results = await positiveBatchConductor.conduct();
    results.map((result) => this.log(result.toString()));
    this.logTestResults(results);
  }

  logTestResults(results: OASResult[]): void {
    const totalTestCount = results.length;

    const failedTestCount = results.filter(
      (result) =>
        result.results &&
        result.results.filter((result) => result.failures.size > 0).length > 0,
    ).length;

    const skippedTestCount = results.filter((result) => result.error).length;

    const passedTestCount = totalTestCount - failedTestCount - skippedTestCount;

    if (failedTestCount > 0 || skippedTestCount > 0) {
      this.error(
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
