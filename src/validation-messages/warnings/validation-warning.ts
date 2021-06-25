import ValidationMessage from '../validation-message';

abstract class ValidationWarning extends ValidationMessage {
  toString = (): string => {
    return `${this.message}`;
  };
}

export default ValidationWarning;
