class SecurityFailure {
  private message: string;

  private type: string;

  constructor(message, type) {
    this.type = type;
    this.message = `${type} security failure: ${message}`;
  }

  toString = (): string => {
    return this.message;
  };
}

export default SecurityFailure;
