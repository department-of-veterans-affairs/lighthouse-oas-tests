import crypto from 'crypto';

export enum Severity {
  WARNING,
  ERROR,
}

export interface MessageTemplate {
  severity: Severity;
  details: string;
}

const MESSAGE_PATTERN = '{DETAILS}{PATH}';
const PATH_LABEL = ' Path: ';
const PATH_SEPARATOR = ' -> ';

abstract class Message {
  public message!: string;
  protected template!: MessageTemplate;
  protected _path!: string[];
  protected _hash!: string;
  protected _count!: number;

  // Message should be extended by another class containing a constructor
  //  that resolves the test suite specific 'template' from the 'type' parameter.
  //  Should then call resolveMessage() & generateHash()
  constructor(type: unknown, path: string[], _properties?: string[]) {
    this._path = path;
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

  toString = (): string => {
    return this.message;
  };

  public isError(): boolean {
    return Severity.ERROR === this.template.severity;
  }

  public isWarning(): boolean {
    return Severity.WARNING === this.template.severity;
  }

  protected resolveMessage(properties: string[] | undefined): string {
    let details = this.template.details;

    if (properties) {
      for (let x = 0; x < properties.length; x++) {
        details = details.replace(`{${x}}`, properties[x]);
      }
    }

    let path = '';

    if (this._path.length > 0) {
      path = `${PATH_LABEL}${this._path.join(PATH_SEPARATOR)}`;
    }

    return MESSAGE_PATTERN.replace('{DETAILS}', details).replace(
      '{PATH}',
      path,
    );
  }

  protected generateHash(): string {
    const hash = crypto.createHash('sha1');

    hash.update(this.message);
    return hash.digest('hex');
  }
}

export default Message;
