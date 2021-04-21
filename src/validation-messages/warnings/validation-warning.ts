import ValidationMessage from '../validation-message';

abstract class ValidationWarning extends ValidationMessage {
  toString = (): string => {
    return `Warning: ${this.message}`;
  };
}

export default ValidationWarning;
