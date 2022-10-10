import { OASResult, OperationResult } from '../../validation';
import { StructuredOutput } from './structured-output.interface';

class JSONStructuredOutputFactory {
  static buildFromOASResult(input: OASResult): StructuredOutput {
    const testResults = input.results;

    // assemble authenticationType array
    const authenticationType = input.securitySchemes.map((x) => x.type);

    // assemble top-level output
    const output: StructuredOutput = {
      suiteId: input.suiteId,
      id: input.testName,
      config: {
        oasPath: input.oasPath,
        server: input.server,
        authenticationType: authenticationType,
      },
      error: input.error,
      results: undefined,
    };

    if (!input.error && testResults) {
      // assemble api-level output
      this.assembleApiLevel(testResults, output);
    }

    return output;
  }

  private static assembleApiLevel(
    testResults: OperationResult[],
    output: StructuredOutput,
  ): void {
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
        totalPass: passCount,
        totalWarn: warnCount,
        totalFail: failCount,
        totalRun: totalCount,
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

      // assemble output for this endpoint
      this.assembleEndpointLevel(operationResults, output);
    });
  }

  private static assembleEndpointLevel(
    operationResults: OperationResult[],
    output: StructuredOutput,
  ): void {
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

    const endpointId =
      operationResults[0].originalOperationId ??
      operationResults[0].operationId;

    // assemble endpoint summary
    if (output.results) {
      output.results[endpointId] = {
        endpointSummary: {
          totalPass: passCount,
          totalWarn: warnCount,
          totalFail: failCount,
          totalRun: totalCount,
        },
      };
    }

    const exampleGroupNames = [
      ...new Set(operationResults.map((result) => result.testGroupName)),
    ];
    exampleGroupNames.forEach((exampleGroupName) => {
      // iterate through all distinct example group names for this operation ID

      // get just the results that apply to the current operation ID (endpoint) and example group name
      const exampleGroupResults = operationResults.filter(
        (result) => result.testGroupName === exampleGroupName,
      );

      // at this point we should always be down to a single result
      // let's make sure of that, even though it should be impossible
      if (exampleGroupResults.length === 0) {
        throw new Error(
          `Unable to assemble StructuredOutput, no result found for operationID: ${endpointId}, exampleGroup: ${exampleGroupName}`,
        );
      } else if (exampleGroupResults.length > 1) {
        throw new Error(
          `Unable to assemble StructuredOutput, multiple results found for operationID: ${endpointId}, exampleGroup: ${exampleGroupName}`,
        );
      }

      // assemble output for this example group
      this.assembleExampleGroupLevel(
        endpointId,
        exampleGroupName,
        exampleGroupResults[0],
        output,
      );
    });
  }

  private static assembleExampleGroupLevel(
    endpointId: string,
    exampleGroupName: string,
    exampleGroupResult: OperationResult,
    output: StructuredOutput,
  ): void {
    // assemble errors
    const errors = [...exampleGroupResult.failures].map(([, value]) => ({
      message: value.message,
      count: value.count,
    }));

    // assemble warnings
    const warnings = [...exampleGroupResult.warnings].map(([, value]) => ({
      message: value.message,
      count: value.count,
    }));

    // assemble example group
    if (output.results) {
      output.results[endpointId][exampleGroupName] = {
        errors: errors,
        warnings: warnings,
      };
    }
  }
}

export default JSONStructuredOutputFactory;
