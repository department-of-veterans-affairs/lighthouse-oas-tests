export class OASSecurity {
  private _key: string;

  private _scopes: string[];

  constructor(key: string, scopes: string[]) {
    this._key = key;
    this._scopes = scopes;
  }

  get key(): string {
    return this._key;
  }

  get scopes(): string[] {
    return this._scopes;
  }
}

export default OASSecurity;
