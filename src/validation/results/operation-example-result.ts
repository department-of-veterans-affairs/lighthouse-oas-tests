import ValidationMessage from '../validation-message';

export default class OperationExampleResult {
  readonly operationId: string;
  readonly originalOperationId: string | undefined;
  readonly exampleGroupName: string;
  readonly failures: Map<string, ValidationMessage>;
  readonly warnings: Map<string, ValidationMessage>;

  constructor(
    operationId: string,
    originalOperationId: string | undefined,
    exampleGroupName: string,
    failures: Map<string, ValidationMessage>,
    warnings: Map<string, ValidationMessage>,
  ) {
    this.operationId = operationId;
    this.originalOperationId = originalOperationId;
    this.exampleGroupName = exampleGroupName;
    this.failures = failures;
    this.warnings = warnings;
  }

  public toString(): string {
    let result = '';

    if (this.failures.size > 0) {
      result += `  ${this.operationId} - ${this.exampleGroupName}: Failed\n`;

      this.failures.forEach((failure, _) => {
        const count = failure.count;
        result += `    - ${failure.toString()}. Found ${count} time${
          count > 1 ? 's' : ''
        }\n`;
      });
    } else {
      result += `  ${this.operationId} - ${this.exampleGroupName}: Succeeded\n`;
    }

    this.warnings.forEach((warning, _) => {
      const count = warning.count;
      result += `    - ${warning.toString()}. Found ${count} time${
        count > 1 ? 's' : ''
      }\n`;
    });

    return result;
  }
}
