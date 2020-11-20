declare module 'swagger-client' {
  export interface Swagger {
    spec: Spec;
    apis: { [name: string]: Api };
    execute: (options: {
      parameters: { [name: string]: ReturnType<JSON['parse']> };
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
  }

  interface Path {
    get?: Method;
    post?: Method;
    put?: Method;
    delete?: Method;
    patch?: Method;
  }

  interface Method {
    operationId: string;
    parameters: Parameter[];
  }

  interface Parameter {
    name: string;
    example: ReturnType<JSON['parse']>;
    required: boolean;
  }

  type Api = {
    [operationId: string]: (options: {
      parameters: { [name: string]: ReturnType<JSON['parse']> };
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
    spec?: ReturnType<JSON['parse']>;
    url?: string;
  }

  export default function swaggerClient(opts: Opts): Promise<Swagger>;
}
