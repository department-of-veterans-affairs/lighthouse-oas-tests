import { OperationResult } from '.';
import { OASSecurityScheme } from '../oas-parsing/security';

export default class OASResult {
  readonly suiteId: string;
  readonly testName: string;
  readonly oasPath: string | undefined;
  readonly server: string | undefined;
  readonly securitySchemes: OASSecurityScheme[];
  readonly results: OperationResult[] | undefined;
  readonly error: string | undefined;

  constructor(
    suiteId: string,
    testName: string,
    oasPath: string | undefined,
    server: string | undefined,
    securitySchemes: OASSecurityScheme[],
    results: OperationResult[] | undefined,
    error: string | undefined,
  ) {
    this.suiteId = suiteId;
    this.testName = testName;
    this.oasPath = oasPath;
    this.server = server;
    this.securitySchemes = securitySchemes;
    this.results = results;
    this.error = error;
  }

  public toString(): string {
    let resultString = '';

    if (this.error) {
      resultString += `${this.testName} ${this.suiteId}: Skipped - ${this.error}\n`;
    }
    if (this.results) {
      const failingOperationCount = this.results.filter(
        (result) => result.failures.size > 0,
      ).length;

      const totalOperationCount = this.results.length;

      if (failingOperationCount === 0) {
        resultString += `${this.testName} ${this.suiteId}: Succeeded\n`;
      } else {
        resultString += `${this.testName} ${
          this.suiteId
        }: ${failingOperationCount}/${totalOperationCount} operation${
          totalOperationCount > 1 ? 's' : ''
        } failed\n`;
      }

      resultString += this.results.map((result) => result.toString()).join('');

      resultString += '\n';
      const passedOperationCount = totalOperationCount - failingOperationCount;
      if (failingOperationCount > 0) {
        resultString += `${failingOperationCount}/${totalOperationCount} operation${
          totalOperationCount > 1 ? 's' : ''
        } failed; ${passedOperationCount}/${totalOperationCount} operation${
          totalOperationCount > 1 ? 's' : ''
        } passed`;
      }
    }
    return resultString;
  }
}
