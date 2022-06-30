import crypto from 'crypto';

abstract class ValidationMessage {
  message: string;

  private _path: string[];

  private _hash: string;

  private _count: number;

  constructor(message, path) {
    this._path = path;
    this.message = `${message}${this.generatePath(this._path)}`;
    this._hash = this.generateHash();
    this._count = 1;
  }

  public get hash(): string {
    return this._hash;
  }

  public get count(): number {
    return this._count;
  }

  public incrementCount(): void {
    this._count++;
  }

  private generatePath(path: string[]): string {
    if (path.length > 0) {
      return ` Path: ${path.join(' -> ')}`;
    }

    return '';
  }

  private generateHash(): string {
    const hash = crypto.createHash('sha1');

    hash.update(this.message);
    return hash.digest('hex');
  }

  toString = (): string => {
    return this.message;
  };
}

export default ValidationMessage;
