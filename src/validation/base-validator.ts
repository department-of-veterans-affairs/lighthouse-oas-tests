import Message from './message';

abstract class BaseValidator {
  protected _failures: Map<string, Message>;
  protected _warnings: Map<string, Message>;
  protected validated: boolean;

  constructor() {
    this.validated = false;
    this._failures = new Map();
    this._warnings = new Map();
  }

  public get failures(): Map<string, Message> {
    return this._failures;
  }

  public get warnings(): Map<string, Message> {
    return this._warnings;
  }

  abstract performValidation(): void;

  public validate = (): void => {
    if (this.validated) {
      return;
    }

    this.performValidation();
    this.validated = true;
  };
}

export default BaseValidator;
