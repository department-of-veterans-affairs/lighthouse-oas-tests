/// <reference path="./schema.d.ts" />

declare module 'swagger-client' {
  import * as schema from 'swagger-client/schema';
  export * from 'swagger-client/schema';

  export type Json = ReturnType<JSON['parse']>;

  export interface ExecuteOptions {
    parameters: { [name: string]: Json };
    operationId: string;
    securities?: Securities;
    requestBody?: RequestBody;
    server?: string;
    requestInterceptor?: (request: Request) => Request;
    responseContentType?: string;
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

  interface ValueObject {
    value: string;
  }

  interface ApiKey extends ValueObject {}
  interface BearerToken extends ValueObject {}
  interface OauthToken {
    token: { access_token: string };
  }

  interface Securities {
    authorized: SecurityValues;
  }

  export interface SecurityValues {
    [securityKey: string]: ApiKey | BearerToken | OauthToken;
  }

  export interface Opts {
    authorizations?: SecurityValues;
    spec?: Json;
    url?: string;
  }

  class SwaggerClient {
    constructor(opts: Opts);
    spec: schema.OpenAPIObject;
    execute: (options: ExecuteOptions) => Promise<Response>;
    static resolveSubtree(obj, path, options?): Promise<any>;
  }

  export default SwaggerClient;
}
