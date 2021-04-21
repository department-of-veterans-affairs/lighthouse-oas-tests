import { ValidationFailure } from '../src/validation-messages/failures';
import { ValidationWarning } from '../src/validation-messages/warnings';

expect.extend({
  toContainValidationFailure(received: ValidationFailure[], argument: string) {
    let pass = false;
    received
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
            received.map((failure) => failure.toString()),
          )} not to contain failure ${this.utils.printExpected(argument)}`,
        pass: true,
      };
    }
    return {
      message: (): string =>
        `expected ${this.utils.printReceived(
          received.map((failure) => failure.toString()),
        )} to contain failure ${this.utils.printExpected(argument)}`,
      pass: false,
    };
  },
  toContainValidationWarning(received: ValidationWarning[], argument: string) {
    let pass = false;
    received
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
            received.map((warning) => warning.toString()),
          )} not to contain warning ${this.utils.printExpected(argument)}`,
        pass: true,
      };
    }
    return {
      message: (): string =>
        `expected ${this.utils.printReceived(
          received.map((warning) => warning.toString()),
        )} to contain warning ${this.utils.printExpected(argument)}`,
      pass: false,
    };
  },
});
