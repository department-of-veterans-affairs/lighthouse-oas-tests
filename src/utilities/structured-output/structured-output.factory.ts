import { OASResult } from '../../results';
import {
  ExampleGroupError,
  ExampleGroupWarning,
  StructuredOutput,
} from './structured-output.interface';

class StructuredOutputFactory {
  static buildFromOASResult(input: OASResult): StructuredOutput {
    const testResults = input.results;

    // assemble authenticationType string
    const authenticationType = input.securitySchemes
      .map((x) => x.name)
      .join('/');

    // assemble top-level output
    const output: StructuredOutput = {
      id: input.testName,
      config: {
        oasPath: String(input.oasPath),
        server: String(input.server),
        authenticationType: String(authenticationType),
      },
      error: input.error,
      results: undefined,
    };

    if (!input.error && testResults) {
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

export default StructuredOutputFactory;
