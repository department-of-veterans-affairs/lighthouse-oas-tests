class OASSecurity {
  readonly key: string;

  readonly scopes: string[];

  constructor(key: string, scopes: string[]) {
    this.key = key;
    this.scopes = scopes;
  }
}

export default OASSecurity;
