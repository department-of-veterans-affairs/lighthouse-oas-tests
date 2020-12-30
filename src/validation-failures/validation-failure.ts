class ValidationFailure {
  private message: string;

  constructor(message) {
    this.message = message;
  }

  toString = (): string => {
    return this.message;
  };
}

export default ValidationFailure;
