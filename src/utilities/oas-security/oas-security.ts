export class OASSecurity {
  private _name: string;

  private _scopes: string[];

  constructor(name: string, scopes: string[]) {
    this._name = name;
    this._scopes = scopes;
  }

  get name(): string {
    return this._name;
  }

  get scopes(): string[] {
    return this._scopes;
  }
}

export default OASSecurity;
