import { SecuritySchemeObject } from 'swagger-client/schema';

export enum OASSecurityType {
  APIKEY = 'apiKey',
  HTTP = 'http',
  OAUTH2 = 'oauth2',
  OPEN_ID_CONNECT = 'openIdConnect',
}

enum OASIn {
  QUERY = 'query',
  HEADER = 'header',
  COOKIE = 'cookie',
}

export class OASSecurityScheme implements SecuritySchemeObject {
  readonly key: string;

  readonly type: OASSecurityType;

  readonly description: string | undefined;

  readonly name: string | undefined;

  readonly in: OASIn | undefined;

  readonly scheme: string | undefined;

  readonly bearerFormat: string | undefined;

  constructor(key: string, securityScheme: SecuritySchemeObject) {
    this.key = key;
    this.type = securityScheme.type as OASSecurityType;
    this.description = securityScheme.description;
    this.name = securityScheme.name;
    this.in = securityScheme.in as OASIn;
    this.scheme = securityScheme.scheme;
    this.bearerFormat = securityScheme.bearerFormat;
  }
}

export default OASSecurityScheme;
