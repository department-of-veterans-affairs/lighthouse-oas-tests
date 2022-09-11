import Message from '../src/validation/message';

expect.extend({
  toContainValidationFailure(received: Map<string, Message>, argument: string) {
    let pass = false;
    const failures = [...received.values()];
    failures
      .map((validationFailure) => validationFailure.toString())
      .forEach((failureMessage) => {
        if (failureMessage === argument) {
          pass = true;
        }
      });

    if (pass) {
      return {
        message: (): string =>
          `expected ${this.utils.printReceived(
            failures.map((failure) => failure.toString()),
          )} not to contain failure ${this.utils.printExpected(argument)}`,
        pass: true,
      };
    }
    return {
      message: (): string =>
        `expected ${this.utils.printReceived(
          failures.map((failure) => failure.toString()),
        )} to contain failure ${this.utils.printExpected(argument)}`,
      pass: false,
    };
  },
  toContainValidationWarning(received: Map<string, Message>, argument: string) {
    let pass = false;
    const warnings = [...received.values()];
    warnings
      .map((validationWarning) => validationWarning.toString())
      .forEach((warningMessage) => {
        if (warningMessage === argument) {
          pass = true;
        }
      });

    if (pass) {
      return {
        message: (): string =>
          `expected ${this.utils.printReceived(
            warnings.map((warning) => warning.toString()),
          )} not to contain warning ${this.utils.printExpected(argument)}`,
        pass: true,
      };
    }
    return {
      message: (): string =>
        `expected ${this.utils.printReceived(
          warnings.map((warning) => warning.toString()),
        )} to contain warning ${this.utils.printExpected(argument)}`,
      pass: false,
    };
  },
});
