import { OperationExampleResult } from '../results';

export default class OASResult {
  readonly testName: string;

  readonly results: OperationExampleResult[] | undefined;

  readonly error: string | undefined;

  constructor(
    testName: string,
    results: OperationExampleResult[] | undefined,
    error: string | undefined,
  ) {
    this.testName = testName;
    this.results = results;
    this.error = error;
  }

  public toString(): string {
    let resultString = '';

    if (this.error) {
      resultString += `${this.testName}: Skipped - ${this.error}\n`;
    }
    if (this.results) {
      const failingOperationCount = this.results.filter(
        (result) => result.failures.size > 0,
      ).length;

      const totalOperationCount = this.results.length;

      if (failingOperationCount === 0) {
        resultString += `${this.testName}: Succeeded\n`;
      } else {
        resultString += `${
          this.testName
        }: ${failingOperationCount}/${totalOperationCount} operation${
          totalOperationCount > 1 ? 's' : ''
        } failed\n`;
      }

      resultString += this.results.map((result) => result.toString()).join('');
    }

    return resultString;
  }
}
