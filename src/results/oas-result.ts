import { OperationExampleResult } from '../results';
import { OASSecurityScheme } from '../utilities/oas-security';
import {
  EndpointResult,
  ExampleGroupError,
  ExampleGroupWarning,
  StructuredOutput,
} from './results.interface';

export default class OASResult {
  readonly testName: string;

  readonly oasPath: string | undefined;

  readonly server: string | undefined;

  readonly securitySchemes: OASSecurityScheme[];

  readonly results: OperationExampleResult[] | undefined;

  readonly error: string | undefined;

  constructor(
    testName: string,
    oasPath: string | undefined,
    server: string | undefined,
    securitySchemes: OASSecurityScheme[],
    results: OperationExampleResult[] | undefined,
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

    // sl00 todo this is temporary
    resultString += JSON.stringify(this.getStructuredOutput());

    return resultString;
  }

  public getStructuredOutput(): StructuredOutput {
    const testResults = this.results;

    // assemble authenticationType string
    const authenticationType = this.securitySchemes
      .map((x) => x.name)
      .join('/');

    // assemble top-level output
    const output: StructuredOutput = {
      id: this.testName,
      config: {
        oasPath: String(this.oasPath),
        server: String(this.server),
        authenticationType: String(authenticationType),
      },
      error: this.error,
      results: undefined,
    };

    if (!this.error && testResults) {
      // assemble api-level results

      // calculate pass/warn/fail totals
      const passCount = testResults.filter(
        (result) => result.failures.size === 0,
      ).length;
      const warnCount = testResults.filter(
        (result) => result.warnings.size > 0,
      ).length;
      const failCount = testResults.filter(
        (result) => result.failures.size > 0,
      ).length;
      const totalCount = testResults.length;

      // assemble api summary
      output.results = {
        apiSummary: {
          totalPass: Number(passCount),
          totalWarn: Number(warnCount),
          totalFail: Number(failCount),
          totalRun: Number(totalCount),
          runDateTime: new Date(),
        },
      };

      const operationIds = [
        ...new Set(testResults.map((result) => result.operationId)),
      ];
      operationIds.forEach((operationId) => {
        // iterate through all distinct operation IDs in the results

        // get just the results that apply to the current operation ID (endpoint)
        const operationResults = testResults.filter(
          (result) => result.operationId === operationId,
        );

        // calculate pass/warn/fail totals for this endpoint
        const passCount = operationResults.filter(
          (result) => result.failures.size === 0,
        ).length;
        const warnCount = operationResults.filter(
          (result) => result.warnings.size > 0,
        ).length;
        const failCount = operationResults.filter(
          (result) => result.failures.size > 0,
        ).length;
        const totalCount = operationResults.length;

        // decide which format we are to use for the endpoint ID
        let endpointId;
        if (operationResults[0].originalOperationId) {
          endpointId = operationResults[0].originalOperationId;
        } else {
          endpointId = operationResults[0].operationId;
        }

        // assemble endpoint summary
        if (output.results) {
          output.results[endpointId] = {
            endpointSummary: {
              totalPass: Number(passCount),
              totalWarn: Number(warnCount),
              totalFail: Number(failCount),
              totalRun: Number(totalCount),
            },
          };
        }

        const exampleGroupNames = [
          ...new Set(operationResults.map((result) => result.exampleGroupName)),
        ];
        exampleGroupNames.forEach((exampleGroupName) => {
          // iterate through all distinct example group names for this operation ID

          // get just the results that apply to the current operation ID (endpoint) and example group name
          const exampleGroupResults = operationResults.filter(
            (result) => result.exampleGroupName === exampleGroupName,
          );

          // at this point we should be down to a single result
          // sl00 todo make this safer
          const theResult = exampleGroupResults[0];

          // assemble errors
          const errors: ExampleGroupError[] = [];
          theResult.failures.forEach((value) => {
            errors.push({
              message: value.message,
              count: value.count,
            });
          });

          // assemble warnings
          const warnings: ExampleGroupWarning[] = [];
          theResult.warnings.forEach((value) => {
            warnings.push({
              message: value.message,
              count: value.count,
            });
          });

          // assemble example group
          if (output.results) {
            output.results[endpointId][exampleGroupName] = {
              errors: errors,
              warnings: warnings,
            };
          }
        });
      });
    }

    return output;
  }
}
