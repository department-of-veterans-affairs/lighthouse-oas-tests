import Message from './message';

export default class OperationResult {
  readonly operationId: string;
  readonly originalOperationId: string | undefined;
  readonly testGroupName: string;
  readonly failures: Map<string, Message>;
  warnings?: Map<string, Message>;

  constructor(
    operationId: string,
    originalOperationId: string | undefined,
    testGroupName: string,
    failures: Map<string, Message>,
    warnings: Map<string, Message>,
  ) {
    this.operationId = operationId;
    this.originalOperationId = originalOperationId;
    this.testGroupName = testGroupName;
    this.failures = failures;
    this.warnings = warnings;
  }

  public toString(): string {
    let result = '';

    if (this.failures.size > 0) {
      result += `  ${this.operationId} - ${this.testGroupName}: Failed\n`;

      this.failures.forEach((failure, _) => {
        const count = failure.count;
        result += `    - ${failure.toString()}. Found ${count} time${
          count > 1 ? 's' : ''
        }\n`;
      });
    } else {
      result += `  ${this.operationId} - ${this.testGroupName}: Succeeded\n`;
    }

    this.warnings?.forEach((warning, _) => {
      const count = warning.count;
      result += `    - ${warning.toString()}. Found ${count} time${
        count > 1 ? 's' : ''
      }\n`;
    });

    return result;
  }
}
