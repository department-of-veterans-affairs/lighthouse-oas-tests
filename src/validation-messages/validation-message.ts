abstract class ValidationMessage {
  protected message: string;

  private path: string[];

  constructor(message, path) {
    this.path = path;
    this.message = `${message}${this.generatePath(this.path)}`;
  }

  private generatePath(path: string[]): string {
    if (path.length > 0) {
      return ` Path: ${path.join(' -> ')}`;
    }

    return '';
  }

  toString = (): string => {
    return this.message;
  };
}

export default ValidationMessage;
