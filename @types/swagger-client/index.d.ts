/// <reference path="./schema.d.ts" />

declare module 'swagger-client' {
  import * as schema from 'swagger-client/schema';
  export * from 'swagger-client/schema';

  export type Json = ReturnType<JSON['parse']>;

  export interface Swagger {
    spec: Spec;
    apis: { [name: string]: Api };
    execute: (options: {
      parameters: { [name: string]: Json };
      operationId: string;
      requestInterceptor?: (request: string) => string;
    }) => Promise<Response>;
  }

  export interface PathObject { [path: string]: Path }

  interface Spec {
    paths: PathObject ;
  }

  export interface Response {
    ok: boolean;
    status: number;
    url: string;
    headers: { [header: string]: string };
    body: Json;
  }

  interface Path {
    get?: Operation;
    post?: Operation;
    put?: Operation;
    delete?: Operation;
    patch?: Operation;
  }

  export interface Operation {
    operationId: string;
    parameters: schema.ParameterObject[];
    responses: { [responseStatus: string]: schema.ResponseObject };
  }

  type Api = {
    [operationId: string]: (options: {
      parameters: { [name: string]: Json };
    }) => Promise<Response>;
  };

  interface ApiKey {
    value: string;
  }

  interface Authorized {
    apikey: ApiKey;
  }

  interface Opts {
    authorizations?: Authorized;
    spec?: Json;
    url?: string;
  }

  export default function swaggerClient(opts: Opts): Promise<Swagger>;
}
