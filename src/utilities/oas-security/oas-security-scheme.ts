import { SecuritySchemeItemObject } from 'swagger-client/schema';

export enum OASSecurityType {
  APIKEY = 'apiKey',
  HTTP = 'http',
  MUTUAL_TLS = 'mutualTLS',
  OAUTH2 = 'oauth2',
  OPEN_ID_CONNECT = 'openIdConnect',
}

enum In {
  QUERY = 'query',
  HEADER = 'header',
  COOKIE = 'cookie',
}

class OASSecurityScheme {
  private _type: OASSecurityType;

  private _description: string | undefined;

  private _name: string | undefined;

  private _in: In | undefined;

  // eslint-disable-next-line no, @typescript-eslint/no-explicit-any
  constructor(securityScheme: SecuritySchemeItemObject) {
    this._type = securityScheme.type as OASSecurityType;
    this._description = securityScheme.description;
    this._name = securityScheme.name;
    this._in = securityScheme?.in as In;
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

  get in(): In | undefined {
    return this._in;
  }
}

export default OASSecurityScheme;
