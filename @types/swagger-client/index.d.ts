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

  interface ParameterBase {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    description?: string;
    required?: boolean;
    example: Json;
  }

  export interface Parameter extends ParameterBase {
    schema: SchemaObject;
  }

  export interface Parameter extends ParameterBase {
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

  export interface ContentObject {
    [name: string]: MediaTypeObject;
  }

  export interface MediaTypeObject {
    schema: SchemaObject;
    example?: any;
    examples?: { [name: string]: ExampleObject };
    encoding?: { [name: string]: EncodingObject };
  }

  export interface EncodingObject {
    contentType?: string;
    headers?: { [name: string]: HeaderObject };
    style?: string;
    explode?: boolean;
    allowReserved: boolean;
  }

  export interface ExampleObject {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
  }

  export interface HeaderObject {
    description?: string;
    required?: boolean;
    example?: Json;
    schema?: SchemaObject;
    content?: {
      [name: string]: {
        schema: SchemaObject;
      };
    };
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
