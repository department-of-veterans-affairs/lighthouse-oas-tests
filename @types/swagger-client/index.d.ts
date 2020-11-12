declare module 'swagger-client' {
  interface Swagger {
    spec: Spec;
    apis: string;
  }

  interface Spec {
    paths: string;
  }

  interface ApiKey {
    value: string;
  }

  interface Authorized {
    apikey: ApiKey;
  }

  interface Securities {
    authorized: Authorized;
  }

  interface Opts {
    securities: Securities;
    spec?: ReturnType<JSON['parse']>;
    url?: string;
  }

  //  function SwaggerClient(opts: Opts): Promise<Swagger>;
  function resolve(opts: Opts): Promise<Swagger>;

  export = resolve;
}
