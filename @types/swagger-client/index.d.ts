/// <reference path="./schema.d.ts" />

declare module 'swagger-client' {
  import * as schema from 'swagger-client/schema';
  export * from 'swagger-client/schema';

  export type Json = ReturnType<JSON['parse']>;

  export interface Swagger {
    spec: schema.OpenAPIObject;
    apis: { [name: string]: Api };
    execute: (options: ExecuteOptions) => Promise<Response>;
  }

  export interface ExecuteOptions {
    parameters: { [name: string]: Json };
    operationId: string;
    securities?: Securities;
    requestBody?: RequestBody;
    server?: string;
    requestInterceptor?: (request: Request) => Request;
  }

  export interface Request {
    url: string;
    headers: { [header: string]: string };
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
  }

  export interface Response {
    ok: boolean;
    status: number;
    url: string;
    headers: { [header: string]: string };
    body: Json;
  }

  export type RequestBody = { [name: string]: Json };

  type Api = {
    [operationId: string]: (options: {
      parameters: { [name: string]: Json };
    }) => Promise<Response>;
  };

  interface ValueObject {
    value: string;
  }

  interface ApiKey extends ValueObject {}
  interface BearerToken extends ValueObject {}
  interface OauthToken {
    token: { access_token: string };
  }

  export interface Securities {
    authorized: Security;
  }

  export interface Security {
    [securityKey: string]: ApiKey | BearerToken | OauthToken;
  }

  interface Opts {
    authorizations?: Security;
    spec?: Json;
    url?: string;
  }

  export default function swaggerClient(opts: Opts): Promise<Swagger>;
}
