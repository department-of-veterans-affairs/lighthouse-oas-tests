import { ValidationFailure } from '../validation-messages/failures';
import { ValidationWarning } from '../validation-messages/warnings';

export default class OperationExampleResult {
  readonly operationId: string;

  readonly exampleGroupName: string;

  readonly failures: Map<string, ValidationFailure>;

  readonly warnings: Map<string, ValidationWarning>;

  constructor(
    operationId: string,
    exampleGroupName: string,
    failures: Map<string, ValidationFailure>,
    warnings: Map<string, ValidationWarning>,
  ) {
    this.operationId = operationId;
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
