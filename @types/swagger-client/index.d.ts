declare module 'swagger-client' {
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

  export type Parameter = ParameterWithSchema | ParameterWithContent;

  interface ParameterBase {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    example: Json;
    required?: boolean;
  }

  interface ParameterWithSchema extends ParameterBase {
    schema: SchemaObject;
  }

  interface ParameterWithContent extends ParameterBase {
    content: {
      [name: string]: {
        schema: SchemaObject;
      };
    };
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
    type?: 'number' | 'string' | 'object' | 'array' | 'integer';
    required?: string[];
    items?: SchemaObject;
    properties?: { [property: string]: SchemaObject };
    description: string;
    enum?: Json[];
    nullable?: boolean;
  }

  export default function swaggerClient(opts: Opts): Promise<Swagger>;
}
