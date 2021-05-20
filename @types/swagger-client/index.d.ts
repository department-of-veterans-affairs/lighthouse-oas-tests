/// <reference path="./schema.d.ts" />

declare module 'swagger-client' {
  import * as schema from 'swagger-client/schema';
  export * from 'swagger-client/schema';

  export type Json = ReturnType<JSON['parse']>;

  export interface Swagger {
    spec: schema.OpenAPIObject;
    apis: { [name: string]: Api };
    execute: (options: {
      parameters: { [name: string]: Json };
      operationId: string;
      securities?: Securities;
      requestInterceptor?: (request: Request) => Request;
    }) => Promise<Response>;
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

  export interface Securities {
    authorized: Security;
  }

  export interface Security {
    [securityKey: string]: ApiKey | BearerToken;
  }

  interface Opts {
    authorizations?: Security;
    spec?: Json;
    url?: string;
  }

  export default function swaggerClient(opts: Opts): Promise<Swagger>;
}
