import { SecuritySchemeItemObject } from 'swagger-client/schema';

export enum OASSecurityType {
  APIKEY = 'apiKey',
  HTTP = 'http',
  MUTUAL_TLS = 'mutualTLS',
  OAUTH2 = 'oauth2',
  OPEN_ID_CONNECT = 'openIdConnect',
}

export enum OASIn {
  QUERY = 'query',
  HEADER = 'header',
  COOKIE = 'cookie',
}

export class OASSecurityScheme {
  private _key: string;

  private _type: OASSecurityType;

  private _description: string | undefined;

  private _name: string | undefined;

  private _in: OASIn | undefined;

  constructor(key: string, securityScheme: SecuritySchemeItemObject) {
    this._key = key;
    this._type = securityScheme.type as OASSecurityType;
    this._description = securityScheme.description;
    this._name = securityScheme.name;
    this._in = securityScheme?.in as OASIn;
  }

  get key(): string {
    return this._key;
  }

  get securityType(): OASSecurityType {
    return this._type;
  }

  get description(): string | undefined {
    return this._description;
  }

  get name(): string | undefined {
    return this._name;
  }

  get in(): OASIn | undefined {
    return this._in;
  }
}

export default OASSecurityScheme;
