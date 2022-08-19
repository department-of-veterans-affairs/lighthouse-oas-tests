import { OperationResult } from '.';
import { OASSecurityScheme } from '../oas-parsing/security';

export default class OASResult {
  readonly testName: string;
  readonly oasPath: string | undefined;
  readonly server: string | undefined;
  readonly securitySchemes: OASSecurityScheme[];
  readonly results: OperationResult[] | undefined;
  readonly error: string | undefined;

  constructor(
    testName: string,
    oasPath: string | undefined,
    server: string | undefined,
    securitySchemes: OASSecurityScheme[],
    results: OperationResult[] | undefined,
    error: string | undefined,
  ) {
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
