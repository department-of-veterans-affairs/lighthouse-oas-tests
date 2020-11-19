declare module 'swagger-client' {
  type Json = ReturnType<JSON['parse']>;
  export interface Swagger {
    spec: Spec;
    apis: { [name: string]: Api };
    execute: (options: {
      parameters: { [name: string]: Json };
      operationId: string;
      requestInterceptor?: (request: string) => string;
    }) => Promise<Response>;
  }

  interface Spec {
    paths: { [path: string]: Path };
  }

  interface Response {
    ok: boolean;
    status: number;
    url: string;
    headers: { [header: string]: string };
    body: Json;
  }

  interface Path {
    get?: Method;
    post?: Method;
    put?: Method;
    delete?: Method;
    patch?: Method;
  }

  export interface Method {
    operationId: string;
    parameters: Parameter[];
    responses: { [responseStatus: string]: Json };
  }

  interface Parameter {
    name: string;
    example: Json;
    required: boolean;
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

  export interface SchemaObject {
    type: 'number' | 'string' | 'object' | 'array';
    required?: string[];
    items?: SchemaObject;
    properties?: { [property: string]: SchemaObject };
    description: string;
    enum?: Json[];
  }

  export default function swaggerClient(opts: Opts): Promise<Swagger>;
}
