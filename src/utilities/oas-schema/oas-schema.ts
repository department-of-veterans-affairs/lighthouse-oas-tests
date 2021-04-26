import swaggerClient, { Request, Response, Swagger } from 'swagger-client';
import OASOperation, { OASOperationFactory } from '../oas-operation';
import ExampleGroup from '../example-group';
import {
  OASSecurityScheme,
  OASSecurityFactory,
  OASSecurity,
  OASSecurityType,
  OASIn,
} from '../oas-security';

class OASSchema {
  private _client: Promise<Swagger>;

  private _swaggerOptions: Parameters<typeof swaggerClient>[0];

  private operations: OASOperation[];

  private topSecurities: OASSecurity[];

  private securitySchemes: OASSecurityScheme[];

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this._client = swaggerClient(options);
    this._swaggerOptions = options;
    this.operations = [];
    this.topSecurities = [];
    this.securitySchemes = [];
  }

  public set client(client: Promise<Swagger>) {
    this._client = client;
  }

  public get client(): Promise<Swagger> {
    return this._client;
  }

  execute = async (
    operation: OASOperation,
    exampleGroup: ExampleGroup,
    flags?: { apiKey: string | undefined },
  ): Promise<Response> => {
    const requestInterceptor = await this.getOperationRequestInterceptor(
      operation,
      flags,
    );
    const schema = await this._client;
    const response = schema
      .execute({
        operationId: operation.operationId,
        parameters: exampleGroup.examples,
        requestInterceptor,
      })
      .catch((error) => {
        return error.response;
      });
    return response;
  };

  resetClient = (): void => {
    this._client = swaggerClient(this._swaggerOptions);
  };

  setAPISecurity = (apikey: string): void => {
    this._swaggerOptions = {
      authorizations: { apikey: { value: apikey } },
      ...this._swaggerOptions,
    };
    this._client = swaggerClient(this._swaggerOptions);
  };

  getOperationRequestInterceptor = async (
    operation: OASOperation,
    flags?: { apiKey: string | undefined },
  ): Promise<((request: Request) => Request) | undefined> => {
    if (!operation.security || operation.security.length === 0) {
      return;
    }

    const securitySchemes = await this.getSecuritySchemes();
    const securityScheme = securitySchemes.find(
      (securityScheme) => securityScheme.key === operation.security[0].key,
    );
    if (
      securityScheme &&
      securityScheme.securityType === OASSecurityType.APIKEY
    ) {
      return this.getAPIKeyRequestInterceptor(securityScheme, flags);
    }
  };

  getAPIKeyRequestInterceptor = (
    securityScheme: OASSecurityScheme,
    flags?: { apiKey: string | undefined },
  ): ((request: Request) => Request) | undefined => {
    if (!securityScheme.name || !flags || !flags.apiKey) {
      return;
    }

    const name: string = securityScheme.name;
    const apiKey: string = flags.apiKey;
    if (securityScheme.in === OASIn.HEADER) {
      return (req: Request): Request => {
        req.headers[name] = apiKey;
        return req;
      };
    }
    if (securityScheme.in === OASIn.COOKIE) {
      return (req: Request): Request => {
        req.headers.COOKIE += `${name}=${apiKey}`;
        return req;
      };
    }
    if (securityScheme.in === OASIn.QUERY) {
      return (req: Request): Request => {
        req.url += `?${name}=${apiKey}`;
        return req;
      };
    }
  };

  getOperations = async (): Promise<OASOperation[]> => {
    const schema = await this._client;
    if (this.operations.length === 0) {
      this.operations = OASOperationFactory.buildFromPaths(schema.spec.paths);
    }
    return this.operations;
  };

  getTopSecurities = async (): Promise<OASSecurity[]> => {
    const schema = await this._client;
    if (this.topSecurities.length === 0 && schema.spec.security) {
      this.topSecurities = OASSecurityFactory.getSecurities(
        schema.spec.security,
      );
    }
    return this.topSecurities;
  };

  getSecuritySchemes = async (): Promise<OASSecurityScheme[]> => {
    const schema = await this._client;
    if (this.securitySchemes.length === 0 && schema.spec.components) {
      this.securitySchemes = OASSecurityFactory.getSecuritySchemes(
        schema.spec.components.securitySchemes,
      );
    }
    return this.securitySchemes;
  };
}

export default OASSchema;
