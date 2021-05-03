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

  private operations: OASOperation[];

  private topSecurities: OASSecurity[];

  private securitySchemes: OASSecurityScheme[];

  constructor(options: Parameters<typeof swaggerClient>[0]) {
    this._client = swaggerClient(options);
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
    let requestInterceptor = await this.getSecurityRequestInterceptor(
      operation.security,
      flags,
    );
    if (!requestInterceptor) {
      requestInterceptor = await this.getSecurityRequestInterceptor(
        await this.getTopSecurities(),
        flags,
      );
    }

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

  getSecurityRequestInterceptor = async (
    securities: OASSecurity[],
    flags?: { apiKey: string | undefined },
  ): Promise<((request: Request) => Request) | undefined> => {
    if (!securities || securities.length === 0) {
      return;
    }

    const securitySchemes = await this.getSecuritySchemes();
    const securityScheme = securitySchemes.find(
      (securityScheme) => securityScheme.key === securities[0].key,
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
