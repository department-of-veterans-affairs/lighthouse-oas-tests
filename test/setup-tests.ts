import ValidationFailure from '../src/validation-failures/validation-failure';

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
            received,
          )} not to contain failure ${this.utils.printExpected(argument)}`,
        pass: true,
      };
    }
    return {
      message: (): string =>
        `expected ${this.utils.printReceived(
          received,
        )} to contain failure ${this.utils.printExpected(argument)}`,
      pass: false,
    };
  },
});
